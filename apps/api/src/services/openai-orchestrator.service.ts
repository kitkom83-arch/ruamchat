import { Injectable } from "@nestjs/common";
import OpenAI from "openai";
import {
  AIDecision,
  aiDecisionJsonSchema,
  createFallbackAiDecision,
  createMockAiDecision,
  parseAiDecisionWithFallback,
  shouldAutoSend,
  shouldHandoff
} from "@ai-omni/shared";
import { Prisma } from "@prisma/client";
import { ConversationService } from "./conversation.service.js";
import { OutboundQueueService } from "./outbound-queue.service.js";
import { PrismaService } from "./prisma.service.js";

const promptVersion = "ai-router-v1";

@Injectable()
export class OpenAiOrchestratorService {
  private readonly client?: OpenAI;

  constructor(
    private readonly prisma: PrismaService,
    private readonly conversations: ConversationService,
    private readonly outboundQueue: OutboundQueueService
  ) {
    if (process.env.OPENAI_API_KEY) {
      this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
  }

  async suggest(tenantId: string, conversationId: string) {
    const conversation = await this.conversations.ensureConversation(tenantId, conversationId);
    const recentMessages = await this.prisma.message.findMany({
      where: { tenantId, conversationId },
      orderBy: { createdAt: "desc" },
      take: 12
    });
    const knowledge = await this.prisma.knowledgeDoc.findMany({
      where: { tenantId },
      orderBy: { updatedAt: "desc" },
      take: 8
    });

    const latestUserMessage = recentMessages.find((message) => message.senderType === "user");
    const model = process.env.OPENAI_MODEL ?? "gpt-5.4-mini";
    let decision: AIDecision;
    let status: "completed" | "failed" = "completed";
    let error: string | undefined;

    try {
      decision = this.client
        ? await this.callOpenAI(model, recentMessages.reverse(), knowledge)
        : this.fallbackDecision(latestUserMessage?.text ?? "", knowledge);
    } catch (err) {
      status = "failed";
      error = err instanceof Error ? err.message : "Unknown OpenAI error";
      decision = this.fallbackDecision(latestUserMessage?.text ?? "", knowledge, true);
    }

    const aiRun = await this.prisma.aiRun.create({
      data: {
        tenantId,
        conversationId,
        messageId: latestUserMessage?.id,
        status,
        model,
        promptVersion,
        confidence: decision.confidence,
        decision: decision as unknown as Prisma.InputJsonValue,
        error
      }
    });

    await this.applySafeAutomaticActions(tenantId, conversation.contact.id, aiRun.id, decision);

    const room = conversation.room;
    if (shouldAutoSend(decision, room.aiMode, room.requireCitationsForAutoReply)) {
      const message = await this.prisma.message.create({
        data: {
          tenantId,
          conversationId,
          channelAccountId: room.channelAccountId,
          platformMessageId: `ai-${aiRun.id}`,
          senderType: "ai",
          messageType: "text",
          text: decision.reply
        }
      });
      await this.outboundQueue.enqueueOutbound(message.id);
      await this.prisma.conversation.update({
        where: { id: conversationId },
        data: { unread: false, unreplied: false, aiState: "ai_active", lastMessageAt: new Date() }
      });
    } else if (shouldHandoff(decision)) {
      await this.prisma.conversation.update({
        where: { id: conversationId },
        data: { aiState: "need_human", priority: mapConversationPriority(decision.priority) }
      });
    }

    return { aiRunId: aiRun.id, decision, status, error };
  }

  private async callOpenAI(model: string, messages: Array<{ senderType: string; text: string | null }>, knowledge: Array<{ id: string; title: string; body: string }>) {
    const input = [
      {
        role: "system",
        content: [
          "You are an omnichannel Thai customer support and sales assistant.",
          "Return only JSON that matches the schema.",
          "Never auto-approve refunds, payment actions, personal-data changes, account deletion, or cancellation.",
          "If knowledge is insufficient, set requiresHuman true or ask a clarifying question."
        ].join("\n")
      },
      {
        role: "user",
        content: JSON.stringify({
          conversation: messages.map((message) => ({
            sender: message.senderType,
            text: message.text
          })),
          knowledge: knowledge.map((doc) => ({
            sourceId: doc.id,
            title: doc.title,
            body: doc.body
          }))
        })
      }
    ];

    const response = await this.client!.responses.create({
      model,
      input,
      text: {
        format: {
          type: "json_schema",
          name: "ai_decision",
          strict: true,
          schema: aiDecisionJsonSchema
        }
      }
    } as never);

    const text = (response as { output_text?: string }).output_text ?? "{}";
    return parseAiDecisionWithFallback(JSON.parse(text), "OpenAI output did not match AI schema");
  }

  private fallbackDecision(text: string, knowledge: Array<{ id: string; title: string }>, forced = false): AIDecision {
    if (forced || !text.trim()) {
      return createFallbackAiDecision(forced ? "OpenAI request failed" : "No latest user message");
    }

    const decision = createMockAiDecision(text);
    return knowledge.length === 0 && decision.confidence < 0.85
      ? { ...decision, requiresHuman: true, nextAction: "handoff", tags: [...decision.tags, "needs-human"] }
      : decision;
  }

  private async applySafeAutomaticActions(tenantId: string, contactId: string, aiRunId: string, decision: AIDecision) {
    for (const tagName of decision.tags.slice(0, 8)) {
      const tag = await this.prisma.tag.upsert({
        where: { tenantId_name: { tenantId, name: tagName } },
        update: {},
        create: { tenantId, name: tagName }
      });
      await this.prisma.contactTag.upsert({
        where: { contactId_tagId: { contactId, tagId: tag.id } },
        update: {},
        create: { contactId, tagId: tag.id }
      });
    }

    await this.prisma.aiAction.create({
      data: {
        aiRunId,
        type: "safe_actions_applied",
        status: "completed",
        payload: {
          tags: decision.tags,
          intent: decision.intent,
          nextAction: decision.nextAction
        }
      }
    });
  }
}

function mapConversationPriority(priority: "low" | "medium" | "high" | "urgent") {
  return priority === "medium" ? "normal" : priority;
}
