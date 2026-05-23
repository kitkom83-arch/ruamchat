import type {
  AgentPerformanceMetric,
  AiPerformanceMetric,
  AnalyticsAgents,
  AnalyticsAi,
  AnalyticsAudit,
  AnalyticsChannels,
  AnalyticsDateRange,
  AnalyticsOverview,
  AnalyticsSla,
  AnalyticsTasks,
  ChannelMetric,
  ConversationFunnelMetric,
  DataMode,
  KnowledgeCategory,
  KnowledgeItem,
  KnowledgeMetric,
  MetricCard,
  Platform,
  SlaMetric
} from "@ai-omni/shared";
import { sampleKnowledgeItems } from "@ai-omni/shared";
import {
  getAnalyticsAgents,
  getAnalyticsAi,
  getAnalyticsAudit,
  getAnalyticsChannels,
  getAnalyticsConversations,
  getAnalyticsOverview,
  getAnalyticsSla,
  getAnalyticsTasks
} from "./api-client";
import {
  createDefaultAdminStore,
  evaluateSlaState,
  getActiveAssignment,
  getConversationStatus,
  getSlaState,
  type AdminStore
} from "./admin-data";
import { mockContacts } from "./crm-data";
import { createDefaultFlowStore, getAutomationMetrics, type FlowStore } from "./flow-data";
import { mockConversations, platformRooms, type AiStatus, type ConversationCard } from "./inbox-data";
import type { Contact } from "@ai-omni/shared";
import { createDefaultBroadcastStore, getBroadcastAnalytics, type BroadcastAnalytics, type BroadcastStore } from "./broadcast-data";

export type AnalyticsFilters = {
  dateRange: AnalyticsDateRange;
  platform: Platform | "all";
  agentId: string;
  roomId: string;
  aiMode: "all" | "auto" | "suggest" | "need_human" | "human_taken";
};

export type AiImprovementIssueType = "low_confidence" | "marked_wrong" | "no_knowledge_match" | "high_handoff";
export type AiImprovementStatus = "open" | "reviewed" | "fixed";

export type AiImprovementItem = {
  id: string;
  issueType: AiImprovementIssueType;
  relatedIntent: string;
  sampleCustomerQuestion: string;
  recommendedAction: string;
  linkedKnowledgeSource?: string;
  status: AiImprovementStatus;
};

export type AnalyticsDashboardData = {
  metricCards: MetricCard[];
  channelMetrics: ChannelMetric[];
  aiPerformance: AiPerformanceMetric;
  agentPerformance: AgentPerformanceMetric[];
  slaMetric: SlaMetric;
  knowledgeMetrics: KnowledgeMetric[];
  funnel: ConversationFunnelMetric;
  improvementQueue: AiImprovementItem[];
  executiveSummary: string;
  totalConversations: number;
  aiHandledRatePercent: number;
  handoffRatePercent: number;
  topChannel: string;
  topIssue: string;
  automationMetrics: ReturnType<typeof getAutomationMetrics>;
  broadcastAnalytics: BroadcastAnalytics;
};

export type AnalyticsApiQuery = {
  from: string;
  to: string;
  platform?: Platform | "all";
  roomId?: string;
  agentId?: string;
};

export type AnalyticsApiDashboardData = {
  overview: AnalyticsOverview;
  conversations: Awaited<ReturnType<typeof getAnalyticsConversations>>;
  channels: AnalyticsChannels;
  agents: AnalyticsAgents;
  sla: AnalyticsSla;
  ai: AnalyticsAi;
  tasks: AnalyticsTasks;
  audit: AnalyticsAudit;
};

export type LoadedAnalyticsData =
  | { mode: "mock"; data: AnalyticsDashboardData }
  | { mode: "api"; data: AnalyticsApiDashboardData; dashboard: AnalyticsDashboardData };

export const defaultAnalyticsFilters: AnalyticsFilters = {
  dateRange: "last_7_days",
  platform: "all",
  agentId: "all",
  roomId: "all",
  aiMode: "all"
};

export async function loadAnalyticsData(
  mode: DataMode,
  filters: AnalyticsFilters = defaultAnalyticsFilters,
  now = new Date()
): Promise<LoadedAnalyticsData> {
  if (mode === "mock") {
    return { mode, data: buildAnalyticsDashboardData(mockConversations, mockContacts, createDefaultAdminStore(), sampleKnowledgeItems, filters) };
  }

  const query = analyticsFiltersToApiQuery(filters, now);
  const [overview, conversations, channels, agents, sla, ai, tasks, audit] = await Promise.all([
    getAnalyticsOverview(query),
    getAnalyticsConversations(query),
    getAnalyticsChannels(query),
    getAnalyticsAgents(query),
    getAnalyticsSla(query),
    getAnalyticsAi(query),
    getAnalyticsTasks(query),
    getAnalyticsAudit(query)
  ]);
  const data = { overview, conversations, channels, agents, sla, ai, tasks, audit };
  return { mode, data, dashboard: buildAnalyticsDashboardDataFromApi(data) };
}

export function analyticsFiltersToApiQuery(filters: AnalyticsFilters, now = new Date()): AnalyticsApiQuery {
  const { from, to } = dateRangeToBounds(filters.dateRange, now);
  return {
    from: from.toISOString(),
    to: to.toISOString(),
    platform: filters.platform,
    roomId: filters.roomId,
    agentId: filters.agentId
  };
}

const metricSeed: Record<string, { firstResponseMinutes: number; resolutionHours: number; createdAt: string }> = {
  "conv-web-01": { firstResponseMinutes: 4, resolutionHours: 7, createdAt: "2026-05-20T02:42:00.000Z" },
  "conv-web-02": { firstResponseMinutes: 1, resolutionHours: 1.4, createdAt: "2026-05-20T02:10:00.000Z" },
  "conv-telegram-01": { firstResponseMinutes: 18, resolutionHours: 5, createdAt: "2026-05-19T01:58:00.000Z" },
  "conv-line-01": { firstResponseMinutes: 2, resolutionHours: 0.6, createdAt: "2026-05-21T01:20:00.000Z" },
  "conv-facebook-01": { firstResponseMinutes: 12, resolutionHours: 16, createdAt: "2026-05-18T08:00:00.000Z" },
  "conv-instagram-01": { firstResponseMinutes: 35, resolutionHours: 10, createdAt: "2026-04-28T00:44:00.000Z" }
};

export function buildAnalyticsDashboardData(
  conversations: ConversationCard[] = mockConversations,
  contacts: Contact[] = mockContacts,
  adminStore: AdminStore = createDefaultAdminStore(),
  knowledgeItems: KnowledgeItem[] = sampleKnowledgeItems,
  filters: AnalyticsFilters = defaultAnalyticsFilters,
  flowStore: FlowStore = createDefaultFlowStore(),
  broadcastStore: BroadcastStore = createDefaultBroadcastStore()
): AnalyticsDashboardData {
  const filtered = filterAnalyticsConversations(conversations, adminStore, filters);
  const channelMetrics = buildChannelMetrics(filtered, adminStore);
  const aiPerformance = buildAiPerformanceMetric(filtered, adminStore);
  const agentPerformance = buildAgentPerformanceMetrics(filtered, adminStore);
  const slaMetric = buildSlaMetric(filtered, adminStore);
  const knowledgeMetrics = buildKnowledgeMetrics(filtered, adminStore, knowledgeItems);
  const funnel = buildLeadFunnel(contacts);
  const improvementQueue = buildAiImprovementQueue(filtered, adminStore);
  const automationMetrics = getAutomationMetrics(flowStore);
  const broadcastAnalytics = getBroadcastAnalytics(broadcastStore);
  const total = filtered.length;
  const resolved = filtered.filter((conversation) => isResolved(conversation, adminStore)).length;
  const unreplied = filtered.filter((conversation) => conversation.unreplied).length;
  const aiHandledRatePercent = rate(aiPerformance.autoReplies + aiPerformance.suggestedReplies, aiPerformance.totalAiRuns);
  const handoffRatePercent = rate(aiPerformance.handoffs, aiPerformance.totalAiRuns);
  const wonCount = funnel.won;
  const topChannel = [...channelMetrics].sort((a, b) => b.totalConversations - a.totalConversations)[0];
  const topIntent = aiPerformance.topIntents[0];
  const topIssue = improvementQueue[0]?.issueType ?? "none";
  const averageFirstResponse = average(filtered.map((conversation) => metricSeed[conversation.id]?.firstResponseMinutes ?? 10));
  const averageResolution = average(filtered.map((conversation) => metricSeed[conversation.id]?.resolutionHours ?? 8));

  return {
    metricCards: [
      metricCard("total", "Total conversations", total, conversations.length, "conversations", "All conversations in the selected view"),
      metricCard("new", "New conversations", filtered.filter((conversation) => isNewConversation(conversation)).length, 2, "new", "New customer conversations"),
      metricCard("resolved", "Resolved conversations", resolved, 2, "resolved", "Resolved or closed conversations"),
      metricCard("unreplied", "Unreplied conversations", unreplied, 3, "unreplied", "Customer messages waiting for a reply"),
      metricCard("first-response", "Average first response", round(averageFirstResponse), 9, "min", "Average first response time"),
      metricCard("resolution", "Average resolution", round(averageResolution), 12, "hours", "Average resolution time"),
      metricCard("ai-rate", "AI handled rate", round(aiHandledRatePercent), 40, "%", "AI auto or suggested handling"),
      metricCard("handoff-rate", "Human handoff rate", round(handoffRatePercent), 20, "%", "AI handoff to admins"),
      metricCard("sla-breach", "SLA breach rate", round(slaMetric.breachRatePercent), 10, "%", "Breached SLA share"),
      metricCard("lead-won", "Lead won count", wonCount, 0, "won", "Won CRM leads"),
      metricCard("broadcast-sent", "Broadcast mock sent", broadcastAnalytics.sentMockCount, 0, "sent_mock", "Local-only broadcast deliveries")
    ],
    channelMetrics,
    aiPerformance,
    agentPerformance,
    slaMetric,
    knowledgeMetrics,
    funnel,
    improvementQueue,
    executiveSummary: `ช่วง ${filters.dateRange} มี ${total} conversations, AI handled ${round(aiHandledRatePercent)}%, handoff ${round(handoffRatePercent)}%, SLA breached ${round(slaMetric.breachRatePercent)}%. ห้องที่มี volume สูงสุดคือ ${topChannel?.accountName ?? "n/a"}. Intent ที่พบบ่อยคือ ${topIntent?.intent ?? "n/a"}.`,
    totalConversations: total,
    aiHandledRatePercent,
    handoffRatePercent,
    topChannel: topChannel ? `${topChannel.platform} / ${topChannel.accountName}` : "n/a",
    topIssue,
    automationMetrics,
    broadcastAnalytics
  };
}

export function buildAnalyticsDashboardDataFromApi(api: AnalyticsApiDashboardData): AnalyticsDashboardData {
  const totalConversations = api.overview.totalConversations;
  const aiActive = countFor(api.ai.aiStateDistribution, "ai_active");
  const suggested = countFor(api.ai.aiStateDistribution, "idle") + countFor(api.ai.aiStateDistribution, "suggest");
  const handoffs = countFor(api.ai.aiStateDistribution, "need_human") + countFor(api.ai.aiStateDistribution, "human");
  const totalAiRuns = Math.max(api.ai.aiRunCount, aiActive + suggested + handoffs);
  const topChannel = [...api.channels.items].sort((a, b) => b.conversations - a.conversations || a.accountName.localeCompare(b.accountName))[0];
  const topAuditAction = api.audit.actions[0]?.key ?? "none";
  const breachRate = rate(api.sla.breachedCount, api.sla.healthyCount + api.sla.warningCount + api.sla.breachedCount);

  return {
    metricCards: [
      apiMetricCard("total", "Total conversations", totalConversations, "conversations", "Persisted conversations in the selected range"),
      apiMetricCard("open", "Open conversations", api.overview.openConversations, "open", "Currently open persisted conversations"),
      apiMetricCard("closed", "Closed conversations", api.overview.closedConversations, "closed", "Closed persisted conversations"),
      apiMetricCard("pending", "Pending / follow-up", api.overview.pendingConversations + api.overview.followUpConversations, "pending", "Pending or follow-up conversations"),
      apiMetricCard("unread", "Unread conversations", api.overview.unreadConversations, "unread", "Unread conversations from API data"),
      apiMetricCard("unreplied", "Unreplied conversations", api.overview.unrepliedConversations, "unreplied", "Customer messages waiting for reply"),
      apiMetricCard("messages", "Messages", api.overview.messagesCount, "messages", "Persisted messages in the selected range"),
      apiMetricCard("inbound", "Inbound messages", api.overview.inboundMessagesCount, "inbound", "Customer messages from persisted channels"),
      apiMetricCard("outbound", "Outbound messages", api.overview.outboundMessagesCount, "outbound", "Agent, AI, or system messages"),
      apiMetricCard("sla-breached", "SLA breached", api.sla.breachedCount, "breached", "Conversations with breached SLA"),
      apiMetricCard("tasks-open", "Open tasks", api.tasks.openTasks, "tasks", "Open persisted workflow tasks"),
      apiMetricCard("kb-count", "Knowledge bases", api.ai.knowledgeBaseCount, "KBs", "Active persisted knowledge bases")
    ],
    channelMetrics: api.channels.items.map((item) => ({
      platform: item.platform,
      accountName: item.accountName,
      totalConversations: item.conversations,
      newConversations: item.openConversations,
      resolvedConversations: item.closedConversations,
      unresolvedConversations: Math.max(0, item.conversations - item.closedConversations),
      averageFirstResponseMinutes: api.sla.averageTimeToFirstResponseMinutes,
      averageResolutionHours: 0,
      aiHandledCount: 0,
      humanHandledCount: item.conversations,
      handoffCount: 0
    })),
    aiPerformance: {
      totalAiRuns,
      autoReplies: aiActive,
      suggestedReplies: suggested,
      handoffs,
      averageConfidence: 0,
      lowConfidenceCount: 0,
      markedWrongCount: countFor(api.audit.actions, "ai.marked_wrong") + countFor(api.audit.actions, "mark_wrong"),
      knowledgeSourceUsedCount: 0,
      noKnowledgeMatchCount: 0,
      topIntents: [],
      topFailureReasons: api.audit.actions
        .filter((item) => item.key.includes("ai") || item.key.includes("handoff"))
        .map((item) => ({ reason: item.key, count: item.count }))
    },
    agentPerformance: api.agents.items.map((agent) => ({
      agentId: agent.agentId,
      agentName: agent.agentName,
      assignedCount: agent.assignedConversations,
      resolvedCount: agent.closedConversations,
      averageFirstResponseMinutes: api.sla.averageTimeToFirstResponseMinutes,
      averageHandleTimeMinutes: 0,
      slaBreachedCount: 0,
      notesCreated: 0,
      cannedRepliesUsed: 0,
      takeoverCount: 0
    })),
    slaMetric: {
      okCount: api.sla.healthyCount,
      warningCount: api.sla.warningCount,
      breachedCount: api.sla.breachedCount,
      breachRatePercent: round(breachRate),
      topBreachedRooms: api.channels.items
        .filter((item) => item.conversations > 0)
        .map((item) => ({ roomId: item.roomId, roomName: item.roomName, breachedCount: 0 }))
        .slice(0, 5)
    },
    knowledgeMetrics: [],
    funnel: emptyFunnel(),
    improvementQueue: [],
    executiveSummary: `API mode shows ${totalConversations} persisted conversations, ${api.overview.messagesCount} messages, ${api.sla.breachedCount} SLA breaches, ${api.tasks.openTasks} open tasks, and ${api.ai.knowledgeBaseCount} active knowledge bases.`,
    totalConversations,
    aiHandledRatePercent: rate(aiActive + suggested, totalAiRuns),
    handoffRatePercent: rate(handoffs, totalAiRuns),
    topChannel: topChannel ? `${topChannel.platform} / ${topChannel.accountName}` : "n/a",
    topIssue: topAuditAction,
    automationMetrics: emptyAutomationMetrics(),
    broadcastAnalytics: emptyBroadcastAnalytics()
  };
}

export function filterAnalyticsConversations(conversations: ConversationCard[], adminStore: AdminStore, filters: AnalyticsFilters) {
  return conversations.filter((conversation) => {
    if (!matchesDateRange(conversation, filters.dateRange)) return false;
    const roomPlatform = platformRooms.find((room) => room.id === conversation.roomId)?.platform;
    if (filters.platform !== "all" && roomPlatform !== filters.platform) return false;
    if (filters.roomId !== "all" && conversation.roomId !== filters.roomId) return false;
    if (filters.agentId !== "all" && getActiveAssignment(adminStore, conversation.id)?.agentId !== filters.agentId) return false;
    if (!matchesAiMode(conversation.aiStatus, filters.aiMode)) return false;
    return true;
  });
}

export function buildChannelMetrics(conversations: ConversationCard[], adminStore: AdminStore): ChannelMetric[] {
  return platformRooms.map((room) => {
    const scoped = conversations.filter((conversation) => conversation.roomId === room.id);
    const resolved = scoped.filter((conversation) => isResolved(conversation, adminStore)).length;
    const aiHandled = scoped.filter((conversation) => conversation.aiStatus === "AI Active" || conversation.aiStatus === "Suggest").length;
    const handoffs = scoped.filter((conversation) => conversation.aiStatus === "Need Human" || conversation.aiStatus === "Human Taken" || conversation.aiAnalysis?.requiresHuman).length;
    return {
      platform: room.platform,
      accountName: room.accountName,
      totalConversations: scoped.length,
      newConversations: scoped.filter((conversation) => isNewConversation(conversation)).length,
      resolvedConversations: resolved,
      unresolvedConversations: scoped.length - resolved,
      averageFirstResponseMinutes: round(average(scoped.map((conversation) => metricSeed[conversation.id]?.firstResponseMinutes ?? 10))),
      averageResolutionHours: round(average(scoped.map((conversation) => metricSeed[conversation.id]?.resolutionHours ?? 8))),
      aiHandledCount: aiHandled,
      humanHandledCount: scoped.length - aiHandled,
      handoffCount: handoffs
    };
  });
}

export function buildAiPerformanceMetric(conversations: ConversationCard[], adminStore: AdminStore): AiPerformanceMetric {
  const aiRuns = conversations.filter((conversation) => conversation.aiStatus !== "AI Off");
  const markedWrongCount = adminStore.auditLogs.filter((log) => log.action === "mark_wrong" || log.action === "use_ai_draft").length + 1;
  const noKnowledgeMatchCount = aiRuns.filter((conversation) => (conversation.aiAnalysis?.matchedKnowledge ?? []).length === 0).length;
  return {
    totalAiRuns: aiRuns.length,
    autoReplies: aiRuns.filter((conversation) => conversation.aiStatus === "AI Active").length,
    suggestedReplies: aiRuns.filter((conversation) => conversation.aiStatus === "Suggest").length,
    handoffs: aiRuns.filter((conversation) => conversation.aiStatus === "Need Human" || conversation.aiStatus === "Human Taken" || conversation.aiAnalysis?.requiresHuman).length,
    averageConfidence: round(average(aiRuns.map((conversation) => conversation.confidence)), 2),
    lowConfidenceCount: aiRuns.filter((conversation) => conversation.confidence < 0.6).length,
    markedWrongCount,
    knowledgeSourceUsedCount: aiRuns.filter((conversation) => (conversation.aiAnalysis?.matchedKnowledge ?? []).length > 0).length,
    noKnowledgeMatchCount,
    topIntents: countBy(aiRuns.map((conversation) => normalizeIntent(conversation.aiAnalysis?.intent ?? conversation.intent))).map(([intent, count]) => ({ intent, count })),
    topFailureReasons: countBy(aiRuns
      .filter((conversation) => conversation.aiAnalysis?.requiresHuman || conversation.confidence < 0.6)
      .map((conversation) => conversation.aiAnalysis?.reason ?? conversation.aiDecision ?? "handoff required")
    ).map(([reason, count]) => ({ reason, count }))
  };
}

export function buildAgentPerformanceMetrics(conversations: ConversationCard[], adminStore: AdminStore): AgentPerformanceMetric[] {
  return adminStore.agents.map((agent) => {
    const assignedIds = adminStore.assignments.filter((assignment) => assignment.agentId === agent.id).map((assignment) => assignment.conversationId);
    const scoped = conversations.filter((conversation) => assignedIds.includes(conversation.id));
    return {
      agentId: agent.id,
      agentName: agent.name,
      assignedCount: scoped.length,
      resolvedCount: scoped.filter((conversation) => isResolved(conversation, adminStore)).length,
      averageFirstResponseMinutes: round(average(scoped.map((conversation) => metricSeed[conversation.id]?.firstResponseMinutes ?? 10))),
      averageHandleTimeMinutes: round(average(scoped.map((conversation) => (metricSeed[conversation.id]?.resolutionHours ?? 1) * 60))),
      slaBreachedCount: scoped.filter((conversation) => getEvaluatedSlaStatus(adminStore, conversation.id) === "breached").length,
      notesCreated: adminStore.internalNotes.filter((note) => note.createdBy === agent.id).length,
      cannedRepliesUsed: adminStore.auditLogs.filter((log) => log.actorId === agent.id && log.action === "canned_reply_used").length,
      takeoverCount: adminStore.auditLogs.filter((log) => log.actorId === agent.id && log.action === "take_over").length
    };
  });
}

export function buildSlaMetric(conversations: ConversationCard[], adminStore: AdminStore): SlaMetric {
  const states = conversations
    .map((conversation) => getSlaState(adminStore, conversation.id))
    .filter((state) => state !== null)
    .map((state) => evaluateSlaState(state, new Date("2026-05-20T03:42:00.000Z")));
  const breachedConversations = conversations.filter((conversation) => getEvaluatedSlaStatus(adminStore, conversation.id) === "breached");
  const byRoom = countBy(breachedConversations.map((conversation) => conversation.roomId));
  return {
    okCount: states.filter((state) => state.status === "ok").length,
    warningCount: states.filter((state) => state.status === "warning").length,
    breachedCount: states.filter((state) => state.status === "breached").length,
    breachRatePercent: round(rate(states.filter((state) => state.status === "breached").length, states.length)),
    topBreachedRooms: byRoom.map(([roomId, breachedCount]) => ({
      roomId,
      roomName: platformRooms.find((room) => room.id === roomId)?.roomName ?? roomId,
      breachedCount
    }))
  };
}

export function buildKnowledgeMetrics(conversations: ConversationCard[], adminStore: AdminStore, knowledgeItems: KnowledgeItem[]): KnowledgeMetric[] {
  const activeItems = knowledgeItems.filter((item) => item.status === "active");
  return activeItems.map((item) => {
    const usedConversations = conversations.filter((conversation) =>
      conversation.aiAnalysis?.matchedKnowledge?.some((source) => source.id === item.id)
    );
    const markedWrongCount = adminStore.auditLogs.filter((log) => log.action === "mark_wrong" && log.metadata.knowledgeId === item.id).length;
    return {
      knowledgeId: item.id,
      title: item.title,
      category: item.category,
      usedCount: usedConversations.length,
      successfulUseCount: usedConversations.filter((conversation) => !conversation.aiAnalysis?.requiresHuman).length,
      markedWrongCount,
      lastUsedAt: usedConversations.length > 0 ? "2026-05-21T09:00:00.000Z" : item.updatedAt
    };
  }).sort((a, b) => b.usedCount - a.usedCount || a.title.localeCompare(b.title));
}

export function buildLeadFunnel(contacts: Contact[]): ConversationFunnelMetric {
  return contacts.reduce<ConversationFunnelMetric>((acc, contact) => {
    acc[contact.leadStatus] += 1;
    return acc;
  }, { new: 0, interested: 0, qualified: 0, quoted: 0, won: 0, lost: 0, follow_up: 0 });
}

export function buildAiImprovementQueue(conversations: ConversationCard[], adminStore: AdminStore): AiImprovementItem[] {
  const items: AiImprovementItem[] = [];
  conversations.forEach((conversation) => {
    if (conversation.confidence < 0.6) {
      items.push(improvementItem(conversation, "low_confidence", "เพิ่ม knowledge หรือปรับ prompt สำหรับ intent นี้"));
    }
    if ((conversation.aiAnalysis?.matchedKnowledge ?? []).length === 0) {
      items.push(improvementItem(conversation, "no_knowledge_match", "Create Knowledge Draft สำหรับคำถามนี้"));
    }
    if (conversation.aiStatus === "Need Human" || conversation.aiStatus === "Human Taken" || conversation.aiAnalysis?.requiresHuman) {
      items.push(improvementItem(conversation, "high_handoff", "Review handoff policy และเติม FAQ ที่ขาด"));
    }
  });
  adminStore.auditLogs
    .filter((log) => log.action === "mark_wrong")
    .forEach((log) => {
      const conversation = conversations.find((item) => item.id === log.targetId) ?? conversations[0];
      if (conversation) items.push(improvementItem(conversation, "marked_wrong", "Review marked wrong replies"));
    });
  return items.slice(0, 8);
}

export function markImprovementReviewed(items: AiImprovementItem[], itemId: string) {
  return items.map((item) => item.id === itemId ? { ...item, status: "reviewed" as const } : item);
}

export function createKnowledgeDraftFromImprovement(knowledgeItems: KnowledgeItem[], item: AiImprovementItem): KnowledgeItem[] {
  const draft: KnowledgeItem = {
    id: `kb-draft-${item.id}`,
    title: `Draft: ${item.relatedIntent}`,
    category: "faq",
    body: `Question: ${item.sampleCustomerQuestion}\nRecommended action: ${item.recommendedAction}`,
    status: "draft",
    tags: ["analytics", item.issueType, item.relatedIntent],
    updatedAt: new Date().toISOString()
  };
  return [draft, ...knowledgeItems];
}

export function exportChannelMetricsCsv(channelMetrics: ChannelMetric[]) {
  const header = [
    "platform",
    "accountName",
    "totalConversations",
    "resolvedConversations",
    "unresolvedConversations",
    "aiHandledCount",
    "humanHandledCount",
    "averageFirstResponseMinutes",
    "handoffCount"
  ];
  const rows = channelMetrics.map((metric) => [
    metric.platform,
    metric.accountName,
    metric.totalConversations,
    metric.resolvedConversations,
    metric.unresolvedConversations,
    metric.aiHandledCount,
    metric.humanHandledCount,
    metric.averageFirstResponseMinutes,
    metric.handoffCount
  ]);
  return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
}

export function buildExecutiveSummaryText(data: Pick<AnalyticsDashboardData, "totalConversations" | "aiHandledRatePercent" | "handoffRatePercent" | "slaMetric" | "topChannel" | "topIssue">) {
  return `Total conversations: ${data.totalConversations}. AI handled rate: ${round(data.aiHandledRatePercent)}%. Handoff rate: ${round(data.handoffRatePercent)}%. SLA breach rate: ${round(data.slaMetric.breachRatePercent)}%. Top channel: ${data.topChannel}. Top issue: ${data.topIssue}.`;
}

export function getContactAnalytics(conversation: ConversationCard | null, allConversations: ConversationCard[], adminStore: AdminStore) {
  if (!conversation) {
    return { conversationCount: 0, lastResponseTime: "n/a", currentSlaState: "n/a", latestAiConfidence: 0, handoffHistoryCount: 0 };
  }
  const related = allConversations.filter((item) =>
    item.customerEmail === conversation.customerEmail ||
    item.linkedIdentities.some((identity) =>
      conversation.linkedIdentities.some((current) => current.platform === identity.platform && current.externalUserId === identity.externalUserId)
    )
  );
  return {
    conversationCount: related.length,
    lastResponseTime: `${metricSeed[conversation.id]?.firstResponseMinutes ?? 0}m`,
    currentSlaState: getEvaluatedSlaStatus(adminStore, conversation.id) ?? "ok",
    latestAiConfidence: conversation.confidence,
    handoffHistoryCount: related.filter((item) => item.aiStatus === "Need Human" || item.aiStatus === "Human Taken" || item.aiAnalysis?.requiresHuman).length
  };
}

function improvementItem(conversation: ConversationCard, issueType: AiImprovementIssueType, recommendedAction: string): AiImprovementItem {
  const source = conversation.aiAnalysis?.matchedKnowledge?.[0];
  return {
    id: `${issueType}-${conversation.id}`,
    issueType,
    relatedIntent: conversation.aiAnalysis?.intent ?? conversation.intent,
    sampleCustomerQuestion: conversation.messages.find((message) => message.sender === "customer")?.body ?? conversation.lastMessage,
    recommendedAction,
    linkedKnowledgeSource: source?.title,
    status: "open"
  };
}

function dateRangeToBounds(range: AnalyticsDateRange, now: Date) {
  const to = new Date(now);
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  if (range === "today") return { from: startOfToday, to };
  if (range === "yesterday") {
    const from = new Date(startOfToday);
    from.setDate(from.getDate() - 1);
    const yesterdayEnd = new Date(startOfToday.getTime() - 1);
    return { from, to: yesterdayEnd };
  }
  if (range === "last_30_days") return { from: new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000), to };
  return { from: new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000), to };
}

function countFor(items: Array<{ key: string; count: number }>, key: string) {
  return items.find((item) => item.key === key)?.count ?? 0;
}

function apiMetricCard(id: string, title: string, value: number, unit: string, description: string): MetricCard {
  return {
    id,
    title,
    value,
    previousValue: value,
    changePercent: 0,
    trend: "flat",
    unit,
    description
  };
}

function emptyFunnel(): ConversationFunnelMetric {
  return { new: 0, interested: 0, qualified: 0, quoted: 0, won: 0, lost: 0, follow_up: 0 };
}

function emptyAutomationMetrics(): ReturnType<typeof getAutomationMetrics> {
  return {
    automationRuns: 0,
    automationSuccessRate: 0,
    failedAutomationCount: 0,
    topActiveFlows: []
  };
}

function emptyBroadcastAnalytics(): BroadcastAnalytics {
  return {
    totalCampaigns: 0,
    scheduled: 0,
    sentMock: 0,
    totalRecipients: 0,
    sentMockCount: 0,
    skippedCount: 0,
    failedMockCount: 0,
    optOutSkippedCount: 0,
    mockSentRate: 0,
    topCampaignByRecipients: null
  };
}

function matchesDateRange(conversation: ConversationCard, range: AnalyticsDateRange) {
  const createdAt = new Date(metricSeed[conversation.id]?.createdAt ?? "2026-05-20T00:00:00.000Z").getTime();
  const now = new Date("2026-05-21T00:00:00.000Z").getTime();
  if (range === "today") return createdAt >= new Date("2026-05-21T00:00:00.000Z").getTime();
  if (range === "yesterday") return createdAt >= new Date("2026-05-20T00:00:00.000Z").getTime() && createdAt < new Date("2026-05-21T00:00:00.000Z").getTime();
  if (range === "last_7_days") return now - createdAt <= 7 * 24 * 60 * 60 * 1000;
  if (range === "last_30_days") return now - createdAt <= 30 * 24 * 60 * 60 * 1000;
  return true;
}

function matchesAiMode(status: AiStatus, mode: AnalyticsFilters["aiMode"]) {
  if (mode === "all") return true;
  if (mode === "auto") return status === "AI Active";
  if (mode === "suggest") return status === "Suggest";
  if (mode === "need_human") return status === "Need Human";
  if (mode === "human_taken") return status === "Human Taken";
  return true;
}

function isResolved(conversation: ConversationCard, adminStore: AdminStore) {
  const status = getConversationStatus(adminStore, conversation.id);
  return status === "resolved" || status === "closed" || conversation.closed || conversation.aiStatus === "Closed";
}

function getEvaluatedSlaStatus(adminStore: AdminStore, conversationId: string) {
  const state = getSlaState(adminStore, conversationId);
  return state ? evaluateSlaState(state, new Date("2026-05-20T03:42:00.000Z")).status : null;
}

function isNewConversation(conversation: ConversationCard) {
  return ["conv-web-01", "conv-web-02", "conv-line-01"].includes(conversation.id);
}

function metricCard(id: string, title: string, value: number, previousValue: number, unit: string, description: string): MetricCard {
  const changePercent = previousValue === 0 ? (value > 0 ? 100 : 0) : round(((value - previousValue) / previousValue) * 100);
  return {
    id,
    title,
    value,
    previousValue,
    changePercent,
    trend: changePercent > 0 ? "up" : changePercent < 0 ? "down" : "flat",
    unit,
    description
  };
}

function countBy<T extends string>(values: T[]): Array<[T, number]> {
  const counts = new Map<T, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function normalizeIntent(value: string): "pricing" | "product_info" | "order_status" | "appointment" | "complaint" | "refund" | "human_request" | "unknown" {
  const normalized = value.toLowerCase();
  if (normalized.includes("price") || normalized.includes("pricing") || normalized.includes("plan")) return "pricing";
  if (normalized.includes("quote")) return "pricing";
  if (normalized.includes("refund")) return "refund";
  if (normalized.includes("complaint")) return "complaint";
  if (normalized.includes("human")) return "human_request";
  if (normalized.includes("appointment") || normalized.includes("hours")) return "appointment";
  if (normalized.includes("order")) return "order_status";
  if (normalized.includes("unknown")) return "unknown";
  return "product_info";
}

function average(values: number[]) {
  const usable = values.filter((value) => Number.isFinite(value));
  if (usable.length === 0) return 0;
  return usable.reduce((sum, value) => sum + value, 0) / usable.length;
}

function rate(value: number, total: number) {
  return total === 0 ? 0 : (value / total) * 100;
}

function round(value: number, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function csvCell(value: string | number) {
  const text = String(value);
  return text.includes(",") || text.includes("\"") || text.includes("\n") ? `"${text.replace(/"/g, "\"\"")}"` : text;
}
