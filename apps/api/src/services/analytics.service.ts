import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { platformSchema } from "@ai-omni/shared";
import { Platform, Prisma, SenderType } from "@prisma/client";
import { PrismaService } from "./prisma.service.js";

const defaultRangeMs = 7 * 24 * 60 * 60 * 1000;
const dueSoonMs = 24 * 60 * 60 * 1000;

export type AnalyticsQueryInput = {
  from?: string;
  to?: string;
  platform?: string;
  roomId?: string;
  agentId?: string;
  now?: Date;
};

type AnalyticsFilters = {
  from: Date;
  to: Date;
  platform: Platform | null;
  roomId: string | null;
  agentId: string | null;
  now: Date;
};

type AnalyticsConversation = {
  id: string;
  roomId: string;
  status: string;
  priority: string;
  assignedUserId: string | null;
  aiState: string;
  unread: boolean;
  unreplied: boolean;
  followUpAt: Date | null;
  slaDueAt: Date | null;
  slaBreachedAt: Date | null;
  slaStatus: string | null;
  firstResponseDueAt: Date | null;
  resolutionDueAt: Date | null;
  lastMessageAt: Date;
  createdAt: Date;
  room: {
    id: string;
    platform: Platform;
    name: string;
    channelAccountId: string;
    channelAccount: {
      id: string;
      displayName: string;
    };
  };
  assignedUser: {
    id: string;
    name: string;
    email: string;
  } | null;
};

type AnalyticsMessage = {
  id: string;
  conversationId: string;
  senderType: SenderType;
  createdAt: Date;
  conversation: AnalyticsConversation;
};

@Injectable()
export class AnalyticsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async overview(tenantId: string, query: AnalyticsQueryInput = {}) {
    const filters = normalizeFilters(query);
    const [conversations, messages] = await Promise.all([
      this.findConversations(tenantId, filters),
      this.findMessages(tenantId, filters)
    ]);

    return {
      filters: serializeFilters(filters),
      totalConversations: conversations.length,
      openConversations: conversations.filter((item) => item.status === "open").length,
      closedConversations: conversations.filter((item) => item.status === "closed").length,
      pendingConversations: conversations.filter((item) => item.status === "pending").length,
      followUpConversations: conversations.filter((item) => item.followUpAt !== null).length,
      unreadConversations: conversations.filter((item) => item.unread).length,
      unrepliedConversations: conversations.filter((item) => item.unreplied).length,
      messagesCount: messages.length,
      inboundMessagesCount: messages.filter((item) => isInbound(item.senderType)).length,
      outboundMessagesCount: messages.filter((item) => !isInbound(item.senderType)).length
    };
  }

  async conversations(tenantId: string, query: AnalyticsQueryInput = {}) {
    const filters = normalizeFilters(query);
    const conversations = await this.findConversations(tenantId, filters);

    return {
      filters: serializeFilters(filters),
      total: conversations.length,
      byStatus: countBy(conversations.map((item) => item.status)),
      latest: conversations
        .slice()
        .sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime())
        .slice(0, 20)
        .map((conversation) => ({
          id: conversation.id,
          roomId: conversation.roomId,
          platform: conversation.room.platform,
          accountName: conversation.room.channelAccount.displayName,
          status: conversation.status,
          priority: conversation.priority,
          assignedUserId: conversation.assignedUserId,
          assignedAgentName: conversation.assignedUser?.name ?? null,
          unread: conversation.unread,
          unreplied: conversation.unreplied,
          followUpAt: conversation.followUpAt?.toISOString() ?? null,
          lastMessageAt: conversation.lastMessageAt.toISOString(),
          createdAt: conversation.createdAt.toISOString()
        }))
    };
  }

  async channels(tenantId: string, query: AnalyticsQueryInput = {}) {
    const filters = normalizeFilters(query);
    const [rooms, conversations, messages] = await Promise.all([
      this.prisma.room.findMany({
        where: this.roomWhere(tenantId, filters),
        include: { channelAccount: true },
        orderBy: [{ platform: "asc" }, { name: "asc" }]
      }),
      this.findConversations(tenantId, filters),
      this.findMessages(tenantId, filters)
    ]);

    const conversationsByRoom = countMap(conversations.map((item) => item.roomId));
    const openByRoom = countMap(conversations.filter((item) => item.status === "open").map((item) => item.roomId));
    const closedByRoom = countMap(conversations.filter((item) => item.status === "closed").map((item) => item.roomId));
    const messagesByRoom = countMap(messages.map((item) => item.conversation.roomId));
    const inboundByRoom = countMap(messages.filter((item) => isInbound(item.senderType)).map((item) => item.conversation.roomId));
    const outboundByRoom = countMap(messages.filter((item) => !isInbound(item.senderType)).map((item) => item.conversation.roomId));

    const items = rooms.map((room) => ({
      platform: room.platform,
      roomId: room.id,
      accountId: room.channelAccountId,
      accountName: room.channelAccount.displayName,
      roomName: room.name,
      conversations: conversationsByRoom.get(room.id) ?? 0,
      openConversations: openByRoom.get(room.id) ?? 0,
      closedConversations: closedByRoom.get(room.id) ?? 0,
      messages: messagesByRoom.get(room.id) ?? 0,
      inboundMessages: inboundByRoom.get(room.id) ?? 0,
      outboundMessages: outboundByRoom.get(room.id) ?? 0
    }));

    return {
      filters: serializeFilters(filters),
      items,
      platformSplit: Array.from(new Set(rooms.map((room) => room.platform)))
        .sort()
        .map((platform) => ({
          platform,
          conversations: conversations.filter((item) => item.room.platform === platform).length,
          messages: messages.filter((item) => item.conversation.room.platform === platform).length
        }))
    };
  }

  async agents(tenantId: string, query: AnalyticsQueryInput = {}) {
    const filters = normalizeFilters(query);
    const [memberships, conversations, tasks] = await Promise.all([
      this.prisma.teamMembership.findMany({
        where: {
          tenantId,
          ...(filters.agentId ? { userId: filters.agentId } : {})
        },
        include: { user: true },
        orderBy: { createdAt: "asc" }
      }),
      this.findConversations(tenantId, filters),
      this.findTasks(tenantId, filters)
    ]);

    return {
      filters: serializeFilters(filters),
      items: memberships.map((membership) => {
        const assignedConversations = conversations.filter((item) => item.assignedUserId === membership.userId);
        const assignedTasks = tasks.filter((item) => item.assigneeUserId === membership.userId);
        return {
          agentId: membership.userId,
          agentName: membership.user.name,
          email: membership.user.email,
          assignedConversations: assignedConversations.length,
          closedConversations: assignedConversations.filter((item) => item.status === "closed").length,
          openTasks: assignedTasks.filter((item) => item.status !== "done" && item.status !== "cancelled").length,
          doneTasks: assignedTasks.filter((item) => item.status === "done").length,
          overdueTasks: assignedTasks.filter((item) => isOverdueTask(item, filters.now)).length
        };
      })
    };
  }

  async sla(tenantId: string, query: AnalyticsQueryInput = {}) {
    const filters = normalizeFilters(query);
    const conversations = await this.findConversations(tenantId, filters);
    const messages = conversations.length > 0
      ? await this.prisma.message.findMany({
        where: {
          tenantId,
          conversationId: { in: conversations.map((item) => item.id) }
        },
        orderBy: { createdAt: "asc" }
      })
      : [];
    const firstResponseDurations = firstResponseMinutes(conversations, messages);
    const statusCounts = countMap(conversations.map((item) => deriveSlaStatus(item, filters.now)));
    const resolutionDue = { overdue: 0, dueSoon: 0, healthy: 0, none: 0 };

    conversations.forEach((conversation) => {
      const state = resolutionState(conversation, filters.now);
      resolutionDue[state] += 1;
    });

    return {
      filters: serializeFilters(filters),
      healthyCount: statusCounts.get("ok") ?? 0,
      warningCount: statusCounts.get("warning") ?? 0,
      breachedCount: statusCounts.get("breached") ?? 0,
      averageTimeToFirstResponseMinutes: round(average(firstResponseDurations)),
      resolutionDue
    };
  }

  async ai(tenantId: string, query: AnalyticsQueryInput = {}) {
    const filters = normalizeFilters(query);
    const [conversations, rooms, knowledgeBaseCount, documentCount, chunkCount, aiRuns] = await Promise.all([
      this.findConversations(tenantId, filters),
      this.prisma.room.findMany({ where: this.roomWhere(tenantId, filters) }),
      this.prisma.knowledgeBase.count({ where: { tenantId, status: { not: "archived" } } }),
      this.prisma.knowledgeDocument.count({ where: { tenantId, status: { not: "archived" } } }),
      this.prisma.knowledgeChunk.count({ where: { tenantId } }),
      this.prisma.aiRun.findMany({
        where: {
          tenantId,
          createdAt: { gte: filters.from, lte: filters.to },
          conversation: this.conversationScopeWhere(tenantId, filters, { includeRange: false, includeAgent: true })
        }
      })
    ]);

    return {
      filters: serializeFilters(filters),
      aiStateDistribution: countBy(conversations.map((item) => item.aiState)),
      policyModeCounts: countBy(rooms.map((item) => item.aiMode)),
      knowledgeBaseCount,
      documentCount,
      chunkCount,
      aiRunCount: aiRuns.length,
      aiRunStatusCounts: countBy(aiRuns.map((item) => item.status))
    };
  }

  async tasks(tenantId: string, query: AnalyticsQueryInput = {}) {
    const filters = normalizeFilters(query);
    const tasks = await this.findTasks(tenantId, filters);

    return {
      filters: serializeFilters(filters),
      openTasks: tasks.filter((item) => item.status !== "done" && item.status !== "cancelled").length,
      doneTasks: tasks.filter((item) => item.status === "done").length,
      overdueTasks: tasks.filter((item) => isOverdueTask(item, filters.now)).length,
      latest: tasks
        .slice()
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 20)
        .map((task) => ({
          id: task.id,
          conversationId: task.conversationId,
          title: task.title,
          status: task.status,
          assigneeUserId: task.assigneeUserId,
          dueAt: task.dueAt?.toISOString() ?? null,
          completedAt: task.completedAt?.toISOString() ?? null,
          createdAt: task.createdAt.toISOString()
        }))
    };
  }

  async audit(tenantId: string, query: AnalyticsQueryInput = {}) {
    const filters = normalizeFilters(query);
    const auditLogs = await this.prisma.auditLog.findMany({
      where: this.auditWhere(tenantId, filters),
      orderBy: { createdAt: "desc" },
      take: 50
    });

    return {
      filters: serializeFilters(filters),
      actions: countBy(auditLogs.map((item) => item.action)),
      latest: auditLogs.slice(0, 20).map((item) => ({
        id: item.id,
        conversationId: item.conversationId,
        actorUserId: item.actorUserId,
        action: item.action,
        entityType: item.entityType,
        entityId: item.entityId,
        createdAt: item.createdAt.toISOString()
      }))
    };
  }

  private findConversations(tenantId: string, filters: AnalyticsFilters) {
    return this.prisma.conversation.findMany({
      where: this.conversationScopeWhere(tenantId, filters, { includeRange: true, includeAgent: true }),
      include: {
        room: { include: { channelAccount: true } },
        assignedUser: true
      },
      orderBy: { lastMessageAt: "desc" }
    }) as Promise<AnalyticsConversation[]>;
  }

  private findMessages(tenantId: string, filters: AnalyticsFilters) {
    return this.prisma.message.findMany({
      where: {
        tenantId,
        createdAt: { gte: filters.from, lte: filters.to },
        conversation: this.conversationScopeWhere(tenantId, filters, { includeRange: false, includeAgent: true })
      },
      include: {
        conversation: {
          include: {
            room: { include: { channelAccount: true } },
            assignedUser: true
          }
        }
      }
    }) as Promise<AnalyticsMessage[]>;
  }

  private findTasks(tenantId: string, filters: AnalyticsFilters) {
    return this.prisma.task.findMany({
      where: {
        tenantId,
        createdAt: { gte: filters.from, lte: filters.to },
        ...(filters.agentId ? { assigneeUserId: filters.agentId } : {}),
        conversation: this.conversationScopeWhere(tenantId, filters, { includeRange: false, includeAgent: false })
      },
      orderBy: { createdAt: "desc" }
    });
  }

  private roomWhere(tenantId: string, filters: AnalyticsFilters): Prisma.RoomWhereInput {
    return {
      tenantId,
      ...(filters.roomId ? { id: filters.roomId } : {}),
      ...(filters.platform ? { platform: filters.platform } : {})
    };
  }

  private auditWhere(tenantId: string, filters: AnalyticsFilters): Prisma.AuditLogWhereInput {
    return {
      tenantId,
      createdAt: { gte: filters.from, lte: filters.to },
      ...(filters.agentId ? { actorUserId: filters.agentId } : {}),
      ...(filters.roomId || filters.platform
        ? { conversation: this.conversationScopeWhere(tenantId, filters, { includeRange: false, includeAgent: false }) }
        : {})
    };
  }

  private conversationScopeWhere(
    tenantId: string,
    filters: AnalyticsFilters,
    options: { includeRange: boolean; includeAgent: boolean }
  ): Prisma.ConversationWhereInput {
    return {
      tenantId,
      ...(options.includeRange ? { createdAt: { gte: filters.from, lte: filters.to } } : {}),
      ...(filters.roomId ? { roomId: filters.roomId } : {}),
      ...(filters.platform ? { room: { platform: filters.platform } } : {}),
      ...(options.includeAgent && filters.agentId ? { assignedUserId: filters.agentId } : {})
    };
  }
}

function normalizeFilters(query: AnalyticsQueryInput): AnalyticsFilters {
  const now = query.now ?? new Date();
  const to = query.to ? parseDateParam(query.to, "to") : now;
  const from = query.from ? parseDateParam(query.from, "from") : new Date(to.getTime() - defaultRangeMs);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to) {
    throw new BadRequestException("Invalid analytics date range");
  }

  const rawPlatform = normalizeOptional(query.platform);
  const parsedPlatform = rawPlatform ? platformSchema.safeParse(rawPlatform) : null;
  if (parsedPlatform && !parsedPlatform.success) throw new BadRequestException("Invalid analytics platform filter");
  const platform = parsedPlatform?.data as Platform | undefined;

  return {
    from,
    to,
    platform: platform ?? null,
    roomId: normalizeOptional(query.roomId),
    agentId: normalizeOptional(query.agentId),
    now
  };
}

function normalizeOptional(value: string | undefined) {
  if (!value || value === "all") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseDateParam(value: string, boundary: "from" | "to") {
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  if (dateOnly) {
    return boundary === "from"
      ? new Date(`${value}T00:00:00.000Z`)
      : new Date(`${value}T23:59:59.999Z`);
  }
  return new Date(value);
}

function serializeFilters(filters: AnalyticsFilters) {
  return {
    from: filters.from.toISOString(),
    to: filters.to.toISOString(),
    platform: filters.platform,
    roomId: filters.roomId,
    agentId: filters.agentId
  };
}

function isInbound(senderType: SenderType | string) {
  return senderType === "user";
}

function deriveSlaStatus(conversation: Pick<AnalyticsConversation, "slaDueAt" | "slaBreachedAt" | "slaStatus">, now: Date) {
  if (conversation.slaStatus === "breached" || conversation.slaBreachedAt || (conversation.slaDueAt && conversation.slaDueAt <= now)) {
    return "breached";
  }
  if (conversation.slaStatus === "warning" || (conversation.slaDueAt && conversation.slaDueAt.getTime() - now.getTime() <= 15 * 60 * 1000)) {
    return "warning";
  }
  return "ok";
}

function resolutionState(conversation: Pick<AnalyticsConversation, "status" | "resolutionDueAt">, now: Date): "overdue" | "dueSoon" | "healthy" | "none" {
  if (!conversation.resolutionDueAt) return "none";
  if (conversation.status === "closed" || conversation.status === "spam") return "healthy";
  const ms = conversation.resolutionDueAt.getTime() - now.getTime();
  if (ms < 0) return "overdue";
  if (ms <= dueSoonMs) return "dueSoon";
  return "healthy";
}

function isOverdueTask(task: { status: string; dueAt: Date | null }, now: Date) {
  return task.dueAt !== null && task.dueAt < now && task.status !== "done" && task.status !== "cancelled";
}

function firstResponseMinutes(
  conversations: Array<{ id: string }>,
  messages: Array<{ conversationId: string; senderType: SenderType | string; createdAt: Date }>
) {
  return conversations.flatMap((conversation) => {
    const scoped = messages
      .filter((message) => message.conversationId === conversation.id)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const firstInbound = scoped.find((message) => isInbound(message.senderType));
    if (!firstInbound) return [];
    const firstOutbound = scoped.find((message) => !isInbound(message.senderType) && message.createdAt >= firstInbound.createdAt);
    if (!firstOutbound) return [];
    return [(firstOutbound.createdAt.getTime() - firstInbound.createdAt.getTime()) / 60000];
  });
}

function countMap<T extends string>(values: T[]) {
  const counts = new Map<T, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  return counts;
}

function countBy<T extends string>(values: T[]) {
  return Array.from(countMap(values).entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([key, count]) => ({ key, count }));
}

function average(values: number[]) {
  const usable = values.filter((value) => Number.isFinite(value));
  if (usable.length === 0) return 0;
  return usable.reduce((sum, value) => sum + value, 0) / usable.length;
}

function round(value: number, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
