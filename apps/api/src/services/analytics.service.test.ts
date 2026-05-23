import "reflect-metadata";
import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { describe, expect, it, vi } from "vitest";
import { AnalyticsController } from "../controllers/analytics.controller.js";
import { AnalyticsService } from "./analytics.service.js";
import { PrismaService } from "./prisma.service.js";

const tenantId = "00000000-0000-4000-8000-000000000001";
const otherTenantId = "00000000-0000-4000-8000-000000009999";
const now = new Date("2026-05-21T04:30:00.000Z");
const range = { from: "2026-05-21T00:00:00.000Z", to: "2026-05-21T23:59:59.999Z", now };

describe("AnalyticsService real-data metrics", () => {
  it("calculates overview metrics from tenant-scoped persisted conversations and messages", async () => {
    await withAnalyticsRuntime(async ({ service }) => {
      const overview = await service.overview(tenantId, range);

      expect(overview).toMatchObject({
        totalConversations: 4,
        openConversations: 2,
        closedConversations: 1,
        pendingConversations: 1,
        followUpConversations: 1,
        unreadConversations: 2,
        unrepliedConversations: 2,
        messagesCount: 7,
        inboundMessagesCount: 4,
        outboundMessagesCount: 3
      });
    });
  });

  it("keeps platform, account, and room splits separate", async () => {
    await withAnalyticsRuntime(async ({ service }) => {
      const channels = await service.channels(tenantId, range);
      const webchat = channels.items.find((item) => item.platform === "webchat");
      const telegram = channels.items.find((item) => item.platform === "telegram");

      expect(channels.items.map((item) => `${item.platform}/${item.accountName}`)).toEqual([
        "facebook/Page หลัก",
        "instagram/IG ร้านค้า",
        "line/LINE OA Main",
        "telegram/Bot 007237",
        "webchat/Main Website"
      ]);
      expect(webchat).toMatchObject({ conversations: 2, messages: 4, inboundMessages: 2, outboundMessages: 2 });
      expect(telegram).toMatchObject({ conversations: 1, messages: 1, inboundMessages: 1, outboundMessages: 0 });
    });
  });

  it("filters by platform and roomId without merging conversations across rooms", async () => {
    await withAnalyticsRuntime(async ({ service }) => {
      const telegram = await service.overview(tenantId, { ...range, platform: "telegram" });
      const webRoom = await service.conversations(tenantId, { ...range, roomId: "room-webchat" });

      expect(telegram.totalConversations).toBe(1);
      expect(telegram.messagesCount).toBe(1);
      expect(webRoom.latest.map((item) => item.id).sort()).toEqual(["conv-web-closed", "conv-web-open"]);
      expect(webRoom.latest.every((item) => item.platform === "webchat")).toBe(true);
    });
  });

  it("respects tenant scope on every analytics surface", async () => {
    await withAnalyticsRuntime(async ({ service }) => {
      const defaultTenant = await service.overview(tenantId, range);
      const otherTenant = await service.overview(otherTenantId, range);

      expect(defaultTenant.totalConversations).toBe(4);
      expect(otherTenant.totalConversations).toBe(1);
      expect(otherTenant.messagesCount).toBe(1);
    });
  });

  it("calculates SLA, task, audit, agent, and AI metrics without external calls", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    try {
      await withAnalyticsRuntime(async ({ service }) => {
        const [sla, tasks, audit, agents, ai] = await Promise.all([
          service.sla(tenantId, range),
          service.tasks(tenantId, range),
          service.audit(tenantId, range),
          service.agents(tenantId, range),
          service.ai(tenantId, range)
        ]);

        expect(sla).toMatchObject({
          healthyCount: 2,
          warningCount: 1,
          breachedCount: 1,
          averageTimeToFirstResponseMinutes: 5.7
        });
        expect(tasks).toMatchObject({ openTasks: 2, doneTasks: 1, overdueTasks: 1 });
        expect(audit.actions).toEqual([
          { key: "conversation.sla_updated", count: 1 },
          { key: "conversation.status_updated", count: 1 },
          { key: "task.completed", count: 1 }
        ]);
        expect(agents.items.find((item) => item.agentName === "May")).toMatchObject({
          assignedConversations: 2,
          closedConversations: 1,
          openTasks: 2,
          doneTasks: 0,
          overdueTasks: 1
        });
        expect(ai).toMatchObject({
          knowledgeBaseCount: 1,
          documentCount: 2,
          chunkCount: 3,
          aiRunCount: 2
        });
        expect(ai.aiStateDistribution).toContainEqual({ key: "need_human", count: 1 });
        expect(ai.policyModeCounts).toContainEqual({ key: "human_first", count: 1 });
        expect(fetchSpy).not.toHaveBeenCalled();
      });
    } finally {
      fetchSpy.mockRestore();
    }
  });

  it("resolves analytics controller through Nest DI with a Prisma provider", async () => {
    await withAnalyticsRuntime(async ({ controller, prisma }) => {
      const [
        overview,
        conversations,
        channels,
        agents,
        sla,
        ai,
        tasks,
        audit
      ] = await Promise.all([
        controller.overview(tenantId, range),
        controller.conversations(tenantId, range),
        controller.channels(tenantId, range),
        controller.agents(tenantId, range),
        controller.sla(tenantId, range),
        controller.ai(tenantId, range),
        controller.tasks(tenantId, range),
        controller.audit(tenantId, range)
      ]);

      expect(overview).toMatchObject({ totalConversations: 4, messagesCount: 7 });
      expect(conversations).toMatchObject({ total: 4 });
      expect(channels.items.length).toBeGreaterThan(0);
      expect(agents.items.length).toBeGreaterThan(0);
      expect(sla).toHaveProperty("averageTimeToFirstResponseMinutes");
      expect(ai).toMatchObject({ knowledgeBaseCount: 1, aiRunCount: 2 });
      expect(tasks).toMatchObject({ openTasks: 2, doneTasks: 1 });
      expect(audit.latest.length).toBeGreaterThan(0);
      expect(prisma.conversation.findMany).toHaveBeenCalled();
      expect(prisma.room.findMany).toHaveBeenCalled();
      expect(prisma.task.findMany).toHaveBeenCalled();
      expect(prisma.auditLog.findMany).toHaveBeenCalled();
    });
  });
});

async function withAnalyticsRuntime<T>(
  run: (context: Awaited<ReturnType<typeof buildAnalyticsRuntime>>) => Promise<T>
) {
  const context = await buildAnalyticsRuntime();
  try {
    return await run(context);
  } finally {
    await context.close();
  }
}

async function buildAnalyticsRuntime() {
  const { prisma } = buildPrismaFake();

  @Module({
    controllers: [AnalyticsController],
    providers: [
      AnalyticsService,
      { provide: PrismaService, useValue: prisma }
    ]
  })
  class AnalyticsRuntimeTestModule {}

  const app = await NestFactory.createApplicationContext(AnalyticsRuntimeTestModule, { logger: false });

  return {
    service: app.get(AnalyticsService),
    controller: app.get(AnalyticsController),
    prisma,
    close: () => app.close()
  };
}

function buildPrismaFake() {
  const users = [
    { id: "agent-may", email: "may@example.local", name: "May" },
    { id: "agent-ton", email: "ton@example.local", name: "Ton" }
  ];
  const rooms = [
    room("room-facebook", "facebook", "Page หลัก", "account-facebook", "suggest"),
    room("room-instagram", "instagram", "IG ร้านค้า", "account-instagram", "off"),
    room("room-line", "line", "LINE OA Main", "account-line", "human_first"),
    room("room-telegram", "telegram", "Bot 007237", "account-telegram", "auto_faq"),
    room("room-webchat", "webchat", "Main Website", "account-webchat", "suggest")
  ];
  const conversations = [
    conversation("conv-web-open", tenantId, "room-webchat", "agent-may", "need_human", "open", true, true, null, "warning", null, "2026-05-21T04:40:00.000Z", "2026-05-21T08:00:00.000Z", "2026-05-21T04:00:00.000Z"),
    conversation("conv-web-closed", tenantId, "room-webchat", "agent-may", "idle", "closed", false, false, null, "ok", null, null, "2026-05-21T05:00:00.000Z", "2026-05-21T04:10:00.000Z"),
    conversation("conv-telegram-open", tenantId, "room-telegram", null, "human", "open", true, true, null, "breached", "2026-05-21T04:05:00.000Z", "2026-05-21T04:00:00.000Z", "2026-05-21T04:00:00.000Z", "2026-05-21T04:05:00.000Z"),
    conversation("conv-line-pending", tenantId, "room-line", "agent-ton", "ai_active", "pending", false, false, "2026-05-22T04:00:00.000Z", "ok", null, null, "2026-05-23T04:00:00.000Z", "2026-05-21T04:15:00.000Z"),
    conversation("conv-other-tenant", otherTenantId, "room-webchat", "agent-may", "need_human", "open", true, true, null, "ok", null, null, null, "2026-05-21T04:00:00.000Z")
  ];
  const messages = [
    message("msg-web-in", tenantId, "conv-web-open", "user", "2026-05-21T04:00:00.000Z"),
    message("msg-web-out", tenantId, "conv-web-open", "agent", "2026-05-21T04:05:00.000Z"),
    message("msg-web-closed-in", tenantId, "conv-web-closed", "user", "2026-05-21T04:10:00.000Z"),
    message("msg-web-closed-out", tenantId, "conv-web-closed", "agent", "2026-05-21T04:20:00.000Z"),
    message("msg-tg-in", tenantId, "conv-telegram-open", "user", "2026-05-21T04:05:00.000Z"),
    message("msg-line-in", tenantId, "conv-line-pending", "user", "2026-05-21T04:15:00.000Z"),
    message("msg-line-out", tenantId, "conv-line-pending", "ai", "2026-05-21T04:17:00.000Z"),
    message("msg-other", otherTenantId, "conv-other-tenant", "user", "2026-05-21T04:00:00.000Z")
  ];
  const tasks = [
    task("task-open", tenantId, "conv-web-open", "agent-may", "open", "2026-05-22T04:00:00.000Z", null),
    task("task-overdue", tenantId, "conv-telegram-open", "agent-may", "open", "2026-05-21T04:00:00.000Z", null),
    task("task-done", tenantId, "conv-web-closed", "agent-ton", "done", "2026-05-21T05:00:00.000Z", "2026-05-21T04:20:00.000Z")
  ];
  const auditLogs = [
    audit("audit-sla", tenantId, "conv-telegram-open", "agent-may", "conversation.sla_updated", "2026-05-21T04:20:00.000Z"),
    audit("audit-status", tenantId, "conv-web-closed", "agent-ton", "conversation.status_updated", "2026-05-21T04:19:00.000Z"),
    audit("audit-task", tenantId, "conv-web-closed", "agent-ton", "task.completed", "2026-05-21T04:18:00.000Z")
  ];
  const aiRuns = [
    { id: "ai-1", tenantId, conversationId: "conv-web-open", status: "completed", createdAt: new Date("2026-05-21T04:00:00.000Z") },
    { id: "ai-2", tenantId, conversationId: "conv-line-pending", status: "failed", createdAt: new Date("2026-05-21T04:01:00.000Z") }
  ];

  const prisma = {
    conversation: {
      findMany: vi.fn(async ({ where }: { where: Record<string, any> }) =>
        conversations.filter((item) => matchesConversation(item, where)).map((item) => enrichConversation(item, rooms, users))
      )
    },
    message: {
      findMany: vi.fn(async ({ where }: { where: Record<string, any> }) =>
        messages
          .filter((item) => matchesMessage(item, where, conversations))
          .map((item) => ({ ...item, conversation: enrichConversation(conversations.find((conversationItem) => conversationItem.id === item.conversationId)!, rooms, users) }))
      )
    },
    room: {
      findMany: vi.fn(async ({ where }: { where: Record<string, any> }) =>
        rooms.filter((item) =>
          item.tenantId === where.tenantId &&
          (!where.id || item.id === where.id) &&
          (!where.platform || item.platform === where.platform)
        )
      )
    },
    teamMembership: {
      findMany: vi.fn(async ({ where }: { where: Record<string, any> }) =>
        users
          .filter((user) => !where.userId || user.id === where.userId)
          .map((user, index) => ({ id: `membership-${user.id}`, tenantId: where.tenantId, userId: user.id, role: "agent", createdAt: new Date(2026, 4, 21, 4, index), user }))
      )
    },
    task: {
      findMany: vi.fn(async ({ where }: { where: Record<string, any> }) =>
        tasks.filter((item) => matchesTask(item, where, conversations))
      )
    },
    auditLog: {
      findMany: vi.fn(async ({ where }: { where: Record<string, any> }) =>
        auditLogs.filter((item) => matchesAudit(item, where, conversations)).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      )
    },
    knowledgeBase: {
      count: vi.fn(async ({ where }: { where: Record<string, any> }) => where.tenantId === tenantId ? 1 : 0)
    },
    knowledgeDocument: {
      count: vi.fn(async ({ where }: { where: Record<string, any> }) => where.tenantId === tenantId ? 2 : 0)
    },
    knowledgeChunk: {
      count: vi.fn(async ({ where }: { where: Record<string, any> }) => where.tenantId === tenantId ? 3 : 0)
    },
    aiRun: {
      findMany: vi.fn(async ({ where }: { where: Record<string, any> }) =>
        aiRuns.filter((item) =>
          item.tenantId === where.tenantId &&
          inRange(item.createdAt, where.createdAt) &&
          matchesConversation(conversations.find((conversationItem) => conversationItem.id === item.conversationId)!, where.conversation)
        )
      )
    }
  };

  return { prisma };
}

function room(id: string, platform: string, displayName: string, channelAccountId: string, aiMode: string) {
  return {
    id,
    tenantId,
    platform,
    channelAccountId,
    name: displayName,
    aiMode,
    channelAccount: { id: channelAccountId, displayName }
  };
}

function conversation(
  id: string,
  tenant: string,
  roomId: string,
  assignedUserId: string | null,
  aiState: string,
  status: string,
  unread: boolean,
  unreplied: boolean,
  followUpAt: string | null,
  slaStatus: string,
  slaBreachedAt: string | null,
  slaDueAt: string | null,
  resolutionDueAt: string | null,
  createdAt: string
) {
  const created = new Date(createdAt);
  return {
    id,
    tenantId: tenant,
    roomId,
    status,
    priority: "normal",
    assignedUserId,
    aiState,
    unread,
    unreplied,
    followUpAt: followUpAt ? new Date(followUpAt) : null,
    slaDueAt: slaDueAt ? new Date(slaDueAt) : null,
    slaBreachedAt: slaBreachedAt ? new Date(slaBreachedAt) : null,
    slaStatus,
    firstResponseDueAt: slaDueAt ? new Date(slaDueAt) : null,
    resolutionDueAt: resolutionDueAt ? new Date(resolutionDueAt) : null,
    lastMessageAt: created,
    createdAt: created
  };
}

function message(id: string, tenant: string, conversationId: string, senderType: string, createdAt: string) {
  return { id, tenantId: tenant, conversationId, senderType, createdAt: new Date(createdAt) };
}

function task(id: string, tenant: string, conversationId: string, assigneeUserId: string, status: string, dueAt: string | null, completedAt: string | null) {
  return {
    id,
    tenantId: tenant,
    conversationId,
    contactId: `${conversationId}-contact`,
    title: id,
    status,
    assigneeUserId,
    createdByUserId: "agent-ton",
    dueAt: dueAt ? new Date(dueAt) : null,
    completedAt: completedAt ? new Date(completedAt) : null,
    createdAt: new Date("2026-05-21T04:00:00.000Z"),
    updatedAt: new Date("2026-05-21T04:00:00.000Z")
  };
}

function audit(id: string, tenant: string, conversationId: string, actorUserId: string, action: string, createdAt: string) {
  return {
    id,
    tenantId: tenant,
    conversationId,
    actorUserId,
    action,
    entityType: "conversation",
    entityId: conversationId,
    createdAt: new Date(createdAt)
  };
}

function enrichConversation(source: Record<string, any>, rooms: Array<Record<string, any>>, users: Array<Record<string, any>>) {
  const roomItem = rooms.find((item) => item.id === source.roomId)!;
  const assignedUser = users.find((item) => item.id === source.assignedUserId) ?? null;
  return { ...source, room: roomItem, assignedUser };
}

function matchesConversation(item: Record<string, any>, where: Record<string, any> = {}) {
  return item &&
    (!where.tenantId || item.tenantId === where.tenantId) &&
    (!where.roomId || item.roomId === where.roomId) &&
    (!where.assignedUserId || item.assignedUserId === where.assignedUserId) &&
    (!where.createdAt || inRange(item.createdAt, where.createdAt)) &&
    (!where.room?.platform || roomPlatform(item.roomId) === where.room.platform);
}

function matchesMessage(item: Record<string, any>, where: Record<string, any>, conversations: Array<Record<string, any>>) {
  const conversationItem = conversations.find((conversationValue) => conversationValue.id === item.conversationId);
  return item.tenantId === where.tenantId &&
    (!where.conversationId?.in || where.conversationId.in.includes(item.conversationId)) &&
    (!where.createdAt || inRange(item.createdAt, where.createdAt)) &&
    (!where.conversation || matchesConversation(conversationItem!, where.conversation));
}

function matchesTask(item: Record<string, any>, where: Record<string, any>, conversations: Array<Record<string, any>>) {
  const conversationItem = conversations.find((conversationValue) => conversationValue.id === item.conversationId);
  return item.tenantId === where.tenantId &&
    (!where.assigneeUserId || item.assigneeUserId === where.assigneeUserId) &&
    inRange(item.createdAt, where.createdAt) &&
    matchesConversation(conversationItem!, where.conversation);
}

function matchesAudit(item: Record<string, any>, where: Record<string, any>, conversations: Array<Record<string, any>>) {
  const conversationItem = conversations.find((conversationValue) => conversationValue.id === item.conversationId);
  return item.tenantId === where.tenantId &&
    (!where.actorUserId || item.actorUserId === where.actorUserId) &&
    inRange(item.createdAt, where.createdAt) &&
    (!where.conversation || matchesConversation(conversationItem!, where.conversation));
}

function inRange(date: Date, rangeValue: { gte: Date; lte: Date }) {
  return date >= rangeValue.gte && date <= rangeValue.lte;
}

function roomPlatform(roomId: string) {
  if (roomId.includes("telegram")) return "telegram";
  if (roomId.includes("line")) return "line";
  if (roomId.includes("facebook")) return "facebook";
  if (roomId.includes("instagram")) return "instagram";
  return "webchat";
}
