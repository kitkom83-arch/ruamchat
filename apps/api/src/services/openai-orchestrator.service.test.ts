import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { describe, expect, it, vi } from "vitest";
import { shouldAutoSend, shouldHandoff, type AIDecision } from "@ai-omni/shared";
import { AuditService } from "./audit.service.js";
import { ConversationService } from "./conversation.service.js";
import { OpenAiOrchestratorService } from "./openai-orchestrator.service.js";
import { PrismaService } from "./prisma.service.js";

const tenantId = "00000000-0000-4000-8000-000000000001";

describe("AI policy helpers", () => {
  it("hands off high-risk decisions", () => {
    expect(shouldHandoff({
      intent: "refund",
      sentiment: "negative",
      priority: "high",
      confidence: 0.9,
      riskLevel: "high",
      requiresHuman: true,
      nextAction: "handoff",
      reply: "ควรให้แอดมินตรวจสอบก่อนตอบครับ",
      summary: "Refund request needs human review.",
      reason: "Refund request.",
      tags: ["risk"],
    })).toBe(true);
  });

  it("allows auto-send only when mode and evidence both allow it", () => {
    const decision: AIDecision = {
      intent: "pricing",
      sentiment: "neutral" as const,
      priority: "medium" as const,
      confidence: 0.9,
      riskLevel: "low" as const,
      nextAction: "auto_reply" as const,
      requiresHuman: false,
      reply: "ราคาเริ่มต้น 1,000 บาทครับ",
      summary: "Customer asks for pricing.",
      tags: ["pricing"],
      reason: "High confidence pricing FAQ."
    };

    expect(shouldAutoSend(decision, "suggest", true)).toBe(false);
    expect(shouldAutoSend(decision, "auto_faq", true)).toBe(true);
  });
});

describe("OpenAiOrchestratorService safe suggestions", () => {
  it("persists a tenant-scoped suggested reply and audit metadata without provider outbound", async () => {
    const { service, prisma, audit } = buildService();

    const suggestion = await service.suggest(tenantId, "conv-web");

    expect(suggestion).toMatchObject({
      tenantId,
      conversationId: "conv-web",
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      roomId: "room-webchat",
      externalCalls: 0,
      status: "completed"
    });
    expect(suggestion.sources[0]).toMatchObject({
      id: "doc-price",
      title: "Pricing FAQ"
    });
    expect(prisma.message.create).not.toHaveBeenCalled();
    expect(prisma.conversation.update).not.toHaveBeenCalled();
    expect(prisma.aiAction.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        aiRunId: "ai-run-1",
        type: "suggested_reply.generated",
        status: "completed"
      })
    }));
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({
      tenantId,
      conversationId: "conv-web",
      action: "ai.suggested_reply.generated",
      metadata: expect.objectContaining({
        tenantId,
        conversationId: "conv-web",
        platform: "webchat",
        channelAccountId: "00000000-0000-4000-8000-000000000020",
        roomId: "room-webchat",
        actionType: "suggested_reply.generated",
        suggestionId: "ai-run-1",
        externalCalls: 0
      })
    }));
    expect(JSON.stringify(suggestion)).not.toMatch(/accessToken|webhookSecret|botToken|apiKey|Bearer|sk-/i);
  });

  it("persists mark-wrong feedback and audit metadata for the suggestion tenant", async () => {
    const { service, audit } = buildService();

    const feedback = await service.markWrong(tenantId, "ai-run-1", "agent-1", { feedbackType: "mark_wrong" });

    expect(feedback).toMatchObject({
      feedbackId: "ai-action-1",
      suggestionId: "ai-run-1",
      tenantId,
      conversationId: "conv-web",
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      roomId: "room-webchat",
      feedbackType: "mark_wrong",
      externalCalls: 0
    });
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({
      tenantId,
      actorUserId: "agent-1",
      conversationId: "conv-web",
      action: "ai.feedback.mark_wrong",
      metadata: expect.objectContaining({
        actionType: "feedback.mark_wrong",
        suggestionId: "ai-run-1",
        feedbackType: "mark_wrong",
        externalCalls: 0
      })
    }));
  });

  it("resolves through Nest DI with explicit injected dependencies and calls suggest", async () => {
    const { prisma, conversations, audit } = buildMocks();

    @Module({
      providers: [
        OpenAiOrchestratorService,
        { provide: PrismaService, useValue: prisma },
        { provide: ConversationService, useValue: conversations },
        { provide: AuditService, useValue: audit }
      ]
    })
    class TestModule {}

    const app = await NestFactory.createApplicationContext(TestModule, { logger: false });
    try {
      const service = app.get(OpenAiOrchestratorService);
      const suggestion = await service.suggest(tenantId, "conv-web");

      expect(conversations.ensureConversation).toHaveBeenCalledWith(tenantId, "conv-web");
      expect(suggestion).toMatchObject({
        conversationId: "conv-web",
        platform: "webchat",
        channelAccountId: "00000000-0000-4000-8000-000000000020",
        roomId: "room-webchat",
        externalCalls: 0
      });
    } finally {
      await app.close();
    }
  });
});

function buildService() {
  const mocks = buildMocks();
  return {
    service: new OpenAiOrchestratorService(mocks.prisma as never, mocks.conversations as never, mocks.audit as never),
    ...mocks
  };
}

function buildMocks() {
  const conversation = {
    id: "conv-web",
    tenantId,
    roomId: "room-webchat",
    contactId: "contact-web",
    contactIdentityId: "identity-web",
    status: "open",
    priority: "normal",
    assignedUserId: null,
    aiState: "need_human",
    unread: true,
    unreplied: true,
    followUpAt: null,
    lastMessageAt: new Date("2026-05-21T04:00:00.000Z"),
    createdAt: new Date("2026-05-21T04:00:00.000Z"),
    updatedAt: new Date("2026-05-21T04:00:00.000Z"),
    room: {
      id: "room-webchat",
      tenantId,
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      channelAccount: { id: "00000000-0000-4000-8000-000000000020", displayName: "Main Website" }
    },
    contact: {
      id: "contact-web",
      identities: [],
      tags: []
    },
    contactIdentity: {
      id: "identity-web",
      externalUserId: "visitor-web"
    }
  };
  const prisma = {
    message: {
      findMany: vi.fn(async () => [{
        id: "msg-user-1",
        tenantId,
        conversationId: "conv-web",
        channelAccountId: "00000000-0000-4000-8000-000000000020",
        senderType: "user",
        text: "ขอราคาแพ็กเกจ Pro",
        createdAt: new Date("2026-05-21T04:00:00.000Z")
      }]),
      create: vi.fn()
    },
    knowledgeDoc: {
      findMany: vi.fn(async () => [{
        id: "doc-price",
        tenantId,
        title: "Pricing FAQ",
        category: "price_rules",
        body: "แพ็กเกจ Pro ราคา 1,000 บาท",
        sourceUrl: null,
        updatedAt: new Date("2026-05-21T04:00:00.000Z")
      }])
    },
    aiRun: {
      create: vi.fn(async ({ data }) => ({
        id: "ai-run-1",
        createdAt: new Date("2026-05-21T04:01:00.000Z"),
        ...data
      })),
      findFirst: vi.fn(async ({ where }) => where.tenantId === tenantId && where.id === "ai-run-1" ? {
        id: "ai-run-1",
        tenantId,
        conversationId: "conv-web",
        createdAt: new Date("2026-05-21T04:01:00.000Z"),
        conversation
      } : null)
    },
    aiAction: {
      create: vi.fn(async ({ data }) => ({
        id: "ai-action-1",
        createdAt: new Date("2026-05-21T04:02:00.000Z"),
        ...data
      }))
    },
    conversation: {
      update: vi.fn()
    }
  };
  const conversations = {
    ensureConversation: vi.fn(async (scopedTenantId: string, conversationId: string) => {
      if (scopedTenantId !== tenantId || conversationId !== "conv-web") throw new Error("Conversation not found");
      return conversation;
    })
  };
  const audit = { record: vi.fn(async (input) => input) };
  return {
    prisma,
    conversations,
    audit
  };
}
