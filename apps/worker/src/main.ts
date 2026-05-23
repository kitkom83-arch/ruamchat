import { Worker } from "bullmq";
import { Redis } from "ioredis";
import { Prisma, PrismaClient } from "@prisma/client";
import { shouldAutoSend } from "@ai-omni/shared";
import crypto from "node:crypto";
import { WorkerAiService } from "./ai.service.js";
import {
  sendFacebookTextMessage,
  sendInstagramTextMessage,
  sendLineTextMessage,
  sendMockOutboundText,
  sendTelegramTextMessage,
  shouldUseRealChannelSend
} from "./outbound-sender.js";

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  console.warn("REDIS_URL is not configured; worker is idle.");
  process.exit(0);
}

const connection = new Redis(redisUrl, { maxRetriesPerRequest: null });
const prisma = new PrismaClient();
const aiService = WorkerAiService.fromEnvironment();

async function sendOutboundMessage(messageId: string) {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: {
      conversation: { include: { room: { include: { channelAccount: true } }, contactIdentity: true } },
      channelAccount: true
    }
  });

  if (!message) {
    throw new Error(`Message ${messageId} not found`);
  }

  const platform = message.conversation.room.platform;
  const accessToken = resolveToken(message.channelAccount.accessTokenCiphertext);

  if (!shouldUseRealChannelSend()) {
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

  if (platform === "telegram") {
    await sendTelegramTextMessage({
      token: accessToken,
      chatId: message.conversation.externalConversationId ?? message.conversation.contactIdentity.externalUserId,
      text: message.text ?? ""
    });
  } else if (platform === "line") {
    await sendLineTextMessage({
      token: accessToken,
      to: message.conversation.contactIdentity.externalUserId,
      text: message.text ?? ""
    });
  } else if (platform === "facebook") {
    await sendFacebookTextMessage({
      token: accessToken,
      recipientId: message.conversation.contactIdentity.externalUserId,
      text: message.text ?? ""
    });
  } else if (platform === "instagram") {
    await sendInstagramTextMessage({
      token: accessToken,
      recipientId: message.conversation.contactIdentity.externalUserId,
      text: message.text ?? ""
    });
  }

  await prisma.auditLog.create({
    data: {
      tenantId: message.tenantId,
      action: platform === "webchat" ? "outbound.webchat_ready" : "outbound.sent",
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
  process.exit(0);
});

console.log("Worker listening for outbound and ai jobs.");
