import { Worker } from "bullmq";
import { Redis } from "ioredis";
import { Prisma, PrismaClient } from "@prisma/client";
import { shouldAutoSend, WEBCHAT_OUTBOUND_CHANNEL, type WebchatOutboundEvent } from "@ai-omni/shared";
import crypto from "node:crypto";
import { WorkerAiService } from "./ai.service.js";
import {
  sendFacebookTextMessage,
  sendInstagramTextMessage,
  sendLineMediaMessage,
  sendLineTextMessage,
  sendMetaMediaMessage,
  sendMockOutboundText,
  sendTelegramOutbound,
  shouldUseRealChannelSend,
  type OutboundMediaType,
  type OutboundPlatform
} from "./outbound-sender.js";
import { buildProviderGuardInput, recipientIdForPlatform } from "./outbound-guard.js";

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  console.warn("REDIS_URL is not configured; worker is idle.");
  process.exit(0);
}

const connection = new Redis(redisUrl, { maxRetriesPerRequest: null });
const publisher = new Redis(redisUrl, { maxRetriesPerRequest: null });
const prisma = new PrismaClient();
const aiService = WorkerAiService.fromEnvironment();

type WebchatOutboundMessage = {
  id: string;
  tenantId: string;
  text: string | null;
  senderType: string;
  conversationId: string;
  createdAt: Date;
};

async function publishWebchatOutbound(message: WebchatOutboundMessage) {
  const event: WebchatOutboundEvent = {
    tenantId: message.tenantId,
    conversationId: message.conversationId,
    messageId: message.id,
    senderType: message.senderType,
    text: message.text,
    createdAt: message.createdAt.toISOString()
  };
  try {
    await publisher.publish(WEBCHAT_OUTBOUND_CHANNEL, JSON.stringify(event));
  } catch (error) {
    console.error("Failed to publish webchat outbound event", error);
  }
}

async function sendOutboundMessage(messageId: string) {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: {
      conversation: { include: { room: { include: { channelAccount: true } }, contactIdentity: true } },
      channelAccount: true,
      attachments: true
    }
  });

  if (!message) {
    throw new Error(`Message ${messageId} not found`);
  }

  const platform = message.conversation.room.platform as OutboundPlatform;
  const context = {
    platform,
    tenantId: message.tenantId,
    channelAccountId: message.channelAccountId,
    channelAccountTenantId: message.channelAccount.tenantId,
    externalUserId: message.conversation.contactIdentity.externalUserId,
    externalConversationId: message.conversation.externalConversationId
  };

  // Webchat replies are delivered to the customer widget over realtime (Redis pub/sub -> SSE),
  // not through a provider push API.
  if (platform === "webchat") {
    await publishWebchatOutbound(message);
    await prisma.auditLog.create({
      data: {
        tenantId: message.tenantId,
        action: "outbound.webchat_ready",
        entityType: "message",
        entityId: message.id,
        metadata: {
          platform,
          channelAccountId: message.channelAccountId,
          externalUserId: message.conversation.contactIdentity.externalUserId
        }
      }
    });
    return;
  }

  const guardInput = buildProviderGuardInput(context);
  const accessToken = resolveToken(message.channelAccount.accessTokenCiphertext);

  if (!guardInput || !shouldUseRealChannelSend(guardInput)) {
    const mockResult = await sendMockOutboundText({
      platform,
      channelAccountId: message.channelAccountId,
      externalConversationId: message.conversation.externalConversationId,
      externalUserId: message.conversation.contactIdentity.externalUserId,
      text: message.text ?? ""
    });
    await prisma.auditLog.create({
      data: {
        tenantId: message.tenantId,
        action: `outbound.${mockResult.status}`,
        entityType: "message",
        entityId: message.id,
        metadata: mockResult as unknown as Prisma.InputJsonValue
      }
    });
    return;
  }

  if (!accessToken) {
    await prisma.auditLog.create({
      data: {
        tenantId: message.tenantId,
        action: "outbound.skipped_missing_token",
        entityType: "message",
        entityId: message.id,
        metadata: { platform }
      }
    });
    return;
  }

  const guardFields = {
    tenantId: message.tenantId,
    channelAccountId: message.channelAccountId,
    channelAccountTenantId: message.channelAccount.tenantId
  };
  const recipientId = recipientIdForPlatform(context);

  if (platform === "telegram") {
    // Telegram: send text + media together so image-only replies never call
    // sendMessage with empty text (the 400 "message text is empty" crash), and
    // text rides along as the caption on the first attachment.
    await sendTelegramOutbound({
      token: accessToken,
      chatId: recipientId,
      text: message.text,
      attachments: message.attachments ?? [],
      ...guardFields
    });
    await prisma.auditLog.create({
      data: {
        tenantId: message.tenantId,
        action: "outbound.sent",
        entityType: "message",
        entityId: message.id,
        metadata: {
          platform,
          channelAccountId: message.channelAccountId,
          externalUserId: message.conversation.contactIdentity.externalUserId
        }
      }
    });
    return;
  }

  if (platform === "line") {
    await sendLineTextMessage({
      token: accessToken,
      to: recipientId,
      text: message.text ?? "",
      ...guardFields
    });
  } else if (platform === "facebook") {
    await sendFacebookTextMessage({
      token: accessToken,
      recipientId,
      text: message.text ?? "",
      ...guardFields
    });
  } else if (platform === "instagram") {
    await sendInstagramTextMessage({
      token: accessToken,
      recipientId,
      text: message.text ?? "",
      ...guardFields
    });
  }

  // Outbound media (STEP 6): only sendable attachments with an absolute URL are pushed,
  // and each call is still gated by assertProviderOutboundAllowed inside the sender.
  const sendableAttachments = (message.attachments ?? []).filter(
    (attachment) => typeof attachment.url === "string" && /^https?:\/\//i.test(attachment.url)
  );
  for (const attachment of sendableAttachments) {
    const mediaType = (attachment.type === "image" || attachment.type === "audio" ? attachment.type : "file") as OutboundMediaType;
    const url = attachment.url as string;
    if (platform === "line") {
      await sendLineMediaMessage({ token: accessToken, to: recipientId, mediaType, url, filename: attachment.filename, ...guardFields });
    } else if (platform === "facebook" || platform === "instagram") {
      await sendMetaMediaMessage({ token: accessToken, provider: platform, recipientId, mediaType, url, ...guardFields });
    }
  }

  await prisma.auditLog.create({
    data: {
      tenantId: message.tenantId,
      action: "outbound.sent",
      entityType: "message",
      entityId: message.id,
      metadata: {
        platform,
        channelAccountId: message.channelAccountId,
        externalUserId: message.conversation.contactIdentity.externalUserId
      }
    }
  });
}

function resolveToken(ciphertext: string | null) {
  if (!ciphertext) return null;
  try {
    const key = encryptionKey();
    const payload = Buffer.from(ciphertext, "base64");
    const iv = payload.subarray(0, 12);
    const tag = payload.subarray(12, 28);
    const encrypted = payload.subarray(28);
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
  } catch {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Unable to decrypt channel access token");
    }
    return ciphertext;
  }
}

function encryptionKey() {
  const configured = process.env.APP_ENCRYPTION_KEY;
  if (configured) {
    const decoded = Buffer.from(configured, "base64");
    if (decoded.length === 32) {
      return decoded;
    }
  }
  return crypto.createHash("sha256").update("dev-only-encryption-key").digest();
}

async function runAiSuggestion(conversationId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { room: true, messages: { orderBy: { createdAt: "asc" }, take: 12 } }
  });

  if (!conversation || conversation.room.aiMode === "off" || conversation.room.aiMode === "human_first") {
    return;
  }

  const latest = [...conversation.messages].reverse().find((message) => message.senderType === "user");
  if (!latest || latest.senderType !== "user") {
    return;
  }

  const analysis = await aiService.analyze({
    conversationId: conversation.id,
    roomName: conversation.room.name,
    messages: conversation.messages.map((message) => ({
      sender: message.senderType,
      text: message.text
    }))
  });
  const decision = analysis.decision;

  const aiRun = await prisma.aiRun.create({
    data: {
      tenantId: conversation.tenantId,
      conversationId: conversation.id,
      messageId: latest.id,
      status: analysis.error ? "failed" : "completed",
      model: analysis.model,
      promptVersion: "worker-responses-structured-v1",
      confidence: decision.confidence,
      decision: decision as unknown as Prisma.InputJsonValue,
      error: analysis.error
    }
  });

  if (decision.requiresHuman || decision.nextAction === "handoff") {
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { aiState: "need_human", priority: mapConversationPriority(decision.priority) }
    });
  } else {
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { aiState: decision.nextAction === "auto_reply" ? "ai_active" : "idle", priority: mapConversationPriority(decision.priority) }
    });
  }

  if (shouldAutoSend(decision, conversation.room.aiMode, conversation.room.requireCitationsForAutoReply)) {
    const message = await prisma.message.create({
      data: {
        tenantId: conversation.tenantId,
        conversationId: conversation.id,
        channelAccountId: conversation.room.channelAccountId,
        platformMessageId: `ai-${aiRun.id}`,
        senderType: "ai",
        messageType: "text",
        text: decision.reply
      }
    });
    await sendOutboundMessage(message.id);
  }
}

function mapConversationPriority(priority: "low" | "medium" | "high" | "urgent") {
  return priority === "medium" ? "normal" : priority;
}

const outboundWorker = new Worker("outbound", async (job) => {
  await sendOutboundMessage(String(job.data.messageId));
}, { connection });

const aiWorker = new Worker("ai", async (job) => {
  await runAiSuggestion(String(job.data.conversationId));
}, { connection });

for (const worker of [outboundWorker, aiWorker]) {
  worker.on("failed", (job, err) => {
    console.error(`Job ${job?.queueName}/${job?.id} failed`, err);
  });
}

process.on("SIGINT", async () => {
  await outboundWorker.close();
  await aiWorker.close();
  await prisma.$disconnect();
  await connection.quit();
  await publisher.quit();
  process.exit(0);
});

console.log("Worker listening for outbound and ai jobs.");
