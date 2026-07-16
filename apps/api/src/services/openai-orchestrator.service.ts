import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import OpenAI from "openai";
import {
  AIDecision,
  aiDecisionJsonSchema,
  createFallbackAiDecision,
  createKnowledgeAwareMockAiDecision,
  createMockAiDecision,
  parseAiDecisionWithFallback,
  type KnowledgeCategory,
  type KnowledgeItem
} from "@ai-omni/shared";
import { Prisma } from "@prisma/client";
import { AuditService } from "./audit.service.js";
import { ConversationService } from "./conversation.service.js";
import { PrismaService } from "./prisma.service.js";

const promptVersion = "ai-router-v1";

// When OPENAI_BASE_URL is set (e.g. Azure AI Foundry v1 endpoint
// https://<resource>.services.ai.azure.com/openai/v1/) route through it with the
// standard OpenAI client; otherwise use the default api.openai.com behavior.
function createOpenAiClient(apiKey: string): OpenAI {
  const baseURL = process.env.OPENAI_BASE_URL?.trim();
  if (baseURL) {
    return new OpenAI({ apiKey, baseURL });
  }
  return new OpenAI({ apiKey });
}

@Injectable()
export class OpenAiOrchestratorService {
  private readonly client?: OpenAI;

  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
    @Inject(ConversationService)
    private readonly conversations: ConversationService,
    @Inject(AuditService)
    private readonly audit: AuditService
  ) {
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_ALLOW_REAL_CALLS === "true" && process.env.NODE_ENV !== "test") {
      this.client = createOpenAiClient(process.env.OPENAI_API_KEY);
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

    const orderedRecentMessages = recentMessages.reverse();
    const latestUserMessage = [...orderedRecentMessages].reverse().find((message) => message.senderType === "user");
    const model = process.env.OPENAI_MODEL ?? "gpt-5.4-mini";
    let decision: AIDecision;
    let status: "completed" | "failed" = "completed";
    let error: string | undefined;

    try {
      decision = this.client
        ? await this.callOpenAI(model, orderedRecentMessages, knowledge)
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

    const room = conversation.room;
    const sources = safeSuggestionSources(decision, knowledge);
    const payload = this.mapSuggestedReply(aiRun, conversation, sources, decision, status, error ?? null);

    await this.prisma.aiAction.create({
      data: {
        aiRunId: aiRun.id,
        type: "suggested_reply.generated",
        status: "completed",
        payload: payload as unknown as Prisma.InputJsonValue
      }
    });
    await this.audit.record({
      tenantId,
      conversationId,
      action: "ai.suggested_reply.generated",
      entityType: "ai_suggestion",
      entityId: aiRun.id,
      metadata: {
        tenantId,
        conversationId,
        platform: room.platform,
        channelAccountId: room.channelAccountId,
        roomId: conversation.roomId,
        actionType: "suggested_reply.generated",
        suggestionId: aiRun.id,
        intent: decision.intent,
        confidence: decision.confidence,
        riskLevel: decision.riskLevel,
        externalCalls: 0,
        timestamp: aiRun.createdAt.toISOString()
      }
    });

    return payload;
  }

  async markWrong(tenantId: string, suggestionId: string, actorUserId: string | undefined, request: { feedbackType?: "mark_wrong"; note?: string }) {
    const aiRun = await this.prisma.aiRun.findFirst({
      where: { id: suggestionId, tenantId },
      include: {
        conversation: {
          include: {
            room: { include: { channelAccount: true } },
            contact: { include: { identities: true, tags: { include: { tag: true } } } },
            contactIdentity: true
          }
        }
      }
    });
    if (!aiRun) {
      throw new NotFoundException("AI suggestion not found");
    }
    const foundRun = aiRun!;
    const conversation = foundRun.conversation;
    const feedbackType = request.feedbackType ?? "mark_wrong";
    const action = await this.prisma.aiAction.create({
      data: {
        aiRunId: foundRun.id,
        type: "feedback.mark_wrong",
        status: "completed",
        payload: {
          feedbackType,
          note: request.note ?? null,
          externalCalls: 0
        }
      }
    });
    await this.audit.record({
      tenantId,
      actorUserId,
      conversationId: conversation.id,
      action: "ai.feedback.mark_wrong",
      entityType: "ai_suggestion",
      entityId: foundRun.id,
      metadata: {
        tenantId,
        conversationId: conversation.id,
        platform: conversation.room.platform,
        channelAccountId: conversation.room.channelAccountId,
        roomId: conversation.roomId,
        actionType: "feedback.mark_wrong",
        suggestionId: foundRun.id,
        feedbackType,
        externalCalls: 0,
        timestamp: action.createdAt.toISOString()
      }
    });

    return {
      feedbackId: action.id,
      suggestionId: foundRun.id,
      aiRunId: foundRun.id,
      tenantId,
      conversationId: conversation.id,
      platform: conversation.room.platform,
      channelAccountId: conversation.room.channelAccountId,
      roomId: conversation.roomId,
      feedbackType,
      actionType: "feedback.mark_wrong",
      externalCalls: 0,
      createdAt: action.createdAt.toISOString()
    };
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

  private fallbackDecision(text: string, knowledge: Array<{ id: string; title: string; category: string; body: string; updatedAt: Date }>, forced = false): AIDecision {
    if (forced || !text.trim()) {
      return createFallbackAiDecision(forced ? "OpenAI request failed" : "No latest user message");
    }

    const knowledgeItems = knowledge.map(mapKnowledgeDocToItem);
    const decision = knowledgeItems.length > 0
      ? createKnowledgeAwareMockAiDecision(text, knowledgeItems)
      : createMockAiDecision(text);
    return knowledge.length === 0 && decision.confidence < 0.85
      ? { ...decision, requiresHuman: true, nextAction: "handoff", tags: [...decision.tags, "needs-human"] }
      : decision;
  }

  private mapSuggestedReply(
    aiRun: { id: string; tenantId: string; conversationId: string; createdAt: Date },
    conversation: { id: string; tenantId: string; roomId: string; room: { platform: string; channelAccountId: string } },
    sources: ReturnType<typeof safeSuggestionSources>,
    decision: AIDecision,
    status: "completed" | "failed",
    error: string | null
  ) {
    return {
      suggestionId: aiRun.id,
      aiRunId: aiRun.id,
      tenantId: aiRun.tenantId,
      conversationId: conversation.id,
      platform: conversation.room.platform,
      channelAccountId: conversation.room.channelAccountId,
      roomId: conversation.roomId,
      summary: decision.summary,
      suggestedReply: decision.reply,
      intent: decision.intent,
      confidence: decision.confidence,
      riskLevel: decision.riskLevel,
      nextAction: decision.nextAction,
      requiresHuman: decision.requiresHuman,
      sources,
      status,
      error,
      externalCalls: 0,
      generatedAt: aiRun.createdAt.toISOString()
    };
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

function safeSuggestionSources(decision: AIDecision, knowledge: Array<{ id: string; title: string; category: string; sourceUrl: string | null }>) {
  const knowledgeById = new Map(knowledge.map((item) => [item.id, item]));
  return (decision.matchedKnowledge ?? []).slice(0, 4).map((source) => {
    const doc = knowledgeById.get(source.id);
    return {
      id: source.id,
      title: source.title,
      category: source.category,
      matchReason: source.matchReason,
      sourceType: doc ? "knowledge_doc" : "knowledge",
      sourceUrl: doc?.sourceUrl ?? null
    };
  });
}

function mapKnowledgeDocToItem(doc: { id: string; title: string; category: string; body: string; updatedAt: Date }): KnowledgeItem {
  const category = normalizeKnowledgeCategory(doc.category);
  return {
    id: doc.id,
    title: doc.title,
    category,
    body: doc.body || doc.title,
    status: "active",
    tags: [category],
    updatedAt: doc.updatedAt.toISOString()
  };
}

function normalizeKnowledgeCategory(category: string): KnowledgeCategory {
  const allowed: KnowledgeCategory[] = [
    "business_info",
    "faq",
    "product_service",
    "price_rules",
    "sales_script",
    "support_policy",
    "forbidden_answers",
    "ai_persona"
  ];
  return allowed.includes(category as KnowledgeCategory) ? category as KnowledgeCategory : "faq";
}
