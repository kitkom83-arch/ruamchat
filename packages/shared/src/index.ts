import { z } from "zod";

export const platformSchema = z.enum(["webchat", "telegram", "line", "facebook", "instagram"]);
export type Platform = z.infer<typeof platformSchema>;

export const messageTypeSchema = z.enum(["text", "image", "audio", "file", "event"]);
export type MessageType = z.infer<typeof messageTypeSchema>;

export const senderTypeSchema = z.enum(["user", "agent", "ai", "system"]);
export type SenderType = z.infer<typeof senderTypeSchema>;

export const aiModeSchema = z.enum([
  "off",
  "suggest",
  "auto_faq",
  "auto_sales",
  "ai_agent",
  "human_first"
]);
export type AiMode = z.infer<typeof aiModeSchema>;

export const conversationFilterSchema = z.enum([
  "all",
  "my",
  "my_inbox",
  "unassigned",
  "sla_warning",
  "sla_breached",
  "ai_active",
  "need_human",
  "unread",
  "unreplied",
  "follow_up",
  "closed",
  "spam"
]);
export type ConversationFilter = z.infer<typeof conversationFilterSchema>;

export const agentRoleSchema = z.enum(["owner", "admin", "supervisor", "agent", "viewer"]);
export type AgentRole = z.infer<typeof agentRoleSchema>;

export const agentPresenceStatusSchema = z.enum(["online", "away", "offline"]);
export type AgentPresenceStatus = z.infer<typeof agentPresenceStatusSchema>;

export const conversationPrioritySchema = z.enum(["low", "medium", "high", "urgent"]);
export type ConversationPriority = z.infer<typeof conversationPrioritySchema>;

export const conversationStatusSchema = z.enum(["open", "pending", "follow_up", "resolved", "closed", "spam"]);
export type ConversationStatus = z.infer<typeof conversationStatusSchema>;

export const assignmentStatusSchema = z.enum(["active", "released", "transferred"]);
export type AssignmentStatus = z.infer<typeof assignmentStatusSchema>;

export const slaStatusSchema = z.enum(["ok", "warning", "breached"]);
export type SlaStatus = z.infer<typeof slaStatusSchema>;

export const internalNoteVisibilitySchema = z.enum(["team", "supervisor"]);
export type InternalNoteVisibility = z.infer<typeof internalNoteVisibilitySchema>;

export const agentSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  role: agentRoleSchema,
  status: agentPresenceStatusSchema,
  avatarUrl: z.string().url().optional(),
  assignedRoomIds: z.array(z.string().min(1)).default([]),
  maxActiveConversations: z.number().int().positive(),
  activeConversationCount: z.number().int().nonnegative()
}).strict();
export type Agent = z.infer<typeof agentSchema>;

export const settingsChannelAccountSchema = z.object({
  id: z.string().min(1),
  platform: platformSchema,
  accountName: z.string().min(1),
  accountKey: z.string().min(1).nullable().optional(),
  status: z.string().min(1),
  webhookUrl: z.string().min(1).nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  lastInboundAt: z.string().datetime().nullable().optional(),
  lastMessageAt: z.string().datetime().nullable().optional(),
  hasAccessToken: z.boolean(),
  tokenMasked: z.string().nullable(),
  secretConfigured: z.boolean(),
  secretMasked: z.string().nullable()
}).strict();
export type SettingsChannelAccount = z.infer<typeof settingsChannelAccountSchema>;

export const updateSettingsChannelAccountRequestSchema = z.object({
  accountName: z.string().min(1).optional(),
  status: z.string().min(1).optional()
}).strict();
export type UpdateSettingsChannelAccountRequest = z.infer<typeof updateSettingsChannelAccountRequestSchema>;

export const settingsTeamMemberSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  displayName: z.string().min(1),
  role: agentRoleSchema,
  email: z.string().email(),
  status: agentPresenceStatusSchema,
  skills: z.array(z.string().min(1)).default([]),
  maxConcurrentChats: z.number().int().positive(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
}).strict();
export type SettingsTeamMember = z.infer<typeof settingsTeamMemberSchema>;

export const updateSettingsTeamMemberRequestSchema = z.object({
  name: z.string().min(1).optional(),
  displayName: z.string().min(1).optional(),
  role: agentRoleSchema.optional()
}).strict();
export type UpdateSettingsTeamMemberRequest = z.infer<typeof updateSettingsTeamMemberRequestSchema>;

export const settingsSlaPolicySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().default(""),
  status: z.string().min(1),
  priorityScope: z.string().min(1),
  firstResponseMinutes: z.number().int().positive(),
  resolutionMinutes: z.number().int().positive(),
  businessHoursMode: z.string().min(1),
  escalationRole: z.string().min(1).nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
}).strict();
export type SettingsSlaPolicy = z.infer<typeof settingsSlaPolicySchema>;

export const updateSettingsSlaPolicyRequestSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.string().min(1).optional(),
  priorityScope: z.string().min(1).optional(),
  firstResponseMinutes: z.number().int().positive().optional(),
  resolutionMinutes: z.number().int().positive().optional(),
  businessHoursMode: z.string().min(1).optional(),
  escalationRole: z.string().min(1).nullable().optional()
}).strict();
export type UpdateSettingsSlaPolicyRequest = z.infer<typeof updateSettingsSlaPolicyRequestSchema>;

export const settingsCannedReplySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  category: z.string().min(1),
  shortcut: z.string().min(1).regex(/^\/[a-z0-9_-]+$/i),
  bodyTemplate: z.string().min(1),
  tags: z.array(z.string().min(1)).default([]),
  platformScope: z.array(platformSchema).default([]),
  roomScope: z.array(z.string().min(1)).default([]),
  status: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
}).strict();
export type SettingsCannedReply = z.infer<typeof settingsCannedReplySchema>;

export const updateSettingsCannedReplyRequestSchema = z.object({
  title: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  shortcut: z.string().min(1).regex(/^\/[a-z0-9_-]+$/i).optional(),
  bodyTemplate: z.string().min(1).optional(),
  tags: z.array(z.string().min(1)).optional(),
  platformScope: z.array(platformSchema).optional(),
  roomScope: z.array(z.string().min(1)).optional(),
  status: z.string().min(1).optional()
}).strict();
export type UpdateSettingsCannedReplyRequest = z.infer<typeof updateSettingsCannedReplyRequestSchema>;

export const assignmentSchema = z.object({
  id: z.string().min(1),
  conversationId: z.string().min(1),
  agentId: z.string().min(1),
  assignedBy: z.string().min(1),
  assignedAt: z.string().datetime(),
  status: assignmentStatusSchema
}).strict();
export type Assignment = z.infer<typeof assignmentSchema>;

export const slaPolicySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  firstResponseMinutes: z.number().int().positive(),
  nextResponseMinutes: z.number().int().positive(),
  resolutionHours: z.number().int().positive(),
  appliesToPriority: conversationPrioritySchema
}).strict();
export type SlaPolicy = z.infer<typeof slaPolicySchema>;

export const slaStateSchema = z.object({
  conversationId: z.string().min(1),
  firstResponseDueAt: z.string().datetime(),
  nextResponseDueAt: z.string().datetime(),
  resolutionDueAt: z.string().datetime(),
  status: slaStatusSchema,
  breachedReason: z.string().optional()
}).strict();
export type SlaState = z.infer<typeof slaStateSchema>;

export const internalNoteSchema = z.object({
  id: z.string().min(1),
  conversationId: z.string().min(1),
  contactId: z.string().min(1),
  platform: platformSchema,
  channelAccountId: z.string().min(1),
  roomId: z.string().min(1),
  body: z.string().min(1),
  visibility: internalNoteVisibilitySchema,
  createdBy: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  pinned: z.boolean().default(false)
}).strict();
export type InternalNote = z.infer<typeof internalNoteSchema>;

export const cannedReplySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  shortcut: z.string().min(1).regex(/^\/[a-z0-9_-]+$/i),
  body: z.string().min(1),
  tags: z.array(z.string().min(1)).default([]),
  category: z.string().min(1),
  isActive: z.boolean()
}).strict();
export type CannedReply = z.infer<typeof cannedReplySchema>;

export const auditLogSchema = z.object({
  id: z.string().min(1),
  actorId: z.string().min(1),
  action: z.string().min(1),
  targetType: z.string().min(1),
  targetId: z.string().min(1),
  metadata: z.record(z.string(), z.unknown()).default({}),
  createdAt: z.string().datetime()
}).strict();
export type AuditLog = z.infer<typeof auditLogSchema>;

export const analyticsDateRangeSchema = z.enum(["today", "yesterday", "last_7_days", "last_30_days", "custom"]);
export type AnalyticsDateRange = z.infer<typeof analyticsDateRangeSchema>;

export const metricTrendSchema = z.enum(["up", "down", "flat"]);
export type MetricTrend = z.infer<typeof metricTrendSchema>;

export const metricCardSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  value: z.number(),
  previousValue: z.number(),
  changePercent: z.number(),
  trend: metricTrendSchema,
  unit: z.string().min(1),
  description: z.string().min(1)
}).strict();
export type MetricCard = z.infer<typeof metricCardSchema>;

export const channelMetricSchema = z.object({
  platform: platformSchema,
  accountName: z.string().min(1),
  totalConversations: z.number().int().nonnegative(),
  newConversations: z.number().int().nonnegative(),
  resolvedConversations: z.number().int().nonnegative(),
  unresolvedConversations: z.number().int().nonnegative(),
  averageFirstResponseMinutes: z.number().nonnegative(),
  averageResolutionHours: z.number().nonnegative(),
  aiHandledCount: z.number().int().nonnegative(),
  humanHandledCount: z.number().int().nonnegative(),
  handoffCount: z.number().int().nonnegative()
}).strict();
export type ChannelMetric = z.infer<typeof channelMetricSchema>;

export const aiPerformanceMetricSchema = z.object({
  totalAiRuns: z.number().int().nonnegative(),
  autoReplies: z.number().int().nonnegative(),
  suggestedReplies: z.number().int().nonnegative(),
  handoffs: z.number().int().nonnegative(),
  averageConfidence: z.number().min(0).max(1),
  lowConfidenceCount: z.number().int().nonnegative(),
  markedWrongCount: z.number().int().nonnegative(),
  knowledgeSourceUsedCount: z.number().int().nonnegative(),
  noKnowledgeMatchCount: z.number().int().nonnegative(),
  topIntents: z.array(z.object({ intent: z.string().min(1), count: z.number().int().nonnegative() }).strict()).default([]),
  topFailureReasons: z.array(z.object({ reason: z.string().min(1), count: z.number().int().nonnegative() }).strict()).default([])
}).strict();
export type AiPerformanceMetric = z.infer<typeof aiPerformanceMetricSchema>;

export const agentPerformanceMetricSchema = z.object({
  agentId: z.string().min(1),
  agentName: z.string().min(1),
  assignedCount: z.number().int().nonnegative(),
  resolvedCount: z.number().int().nonnegative(),
  averageFirstResponseMinutes: z.number().nonnegative(),
  averageHandleTimeMinutes: z.number().nonnegative(),
  slaBreachedCount: z.number().int().nonnegative(),
  notesCreated: z.number().int().nonnegative(),
  cannedRepliesUsed: z.number().int().nonnegative(),
  takeoverCount: z.number().int().nonnegative()
}).strict();
export type AgentPerformanceMetric = z.infer<typeof agentPerformanceMetricSchema>;

export const slaMetricSchema = z.object({
  okCount: z.number().int().nonnegative(),
  warningCount: z.number().int().nonnegative(),
  breachedCount: z.number().int().nonnegative(),
  breachRatePercent: z.number().nonnegative(),
  topBreachedRooms: z.array(z.object({
    roomId: z.string().min(1),
    roomName: z.string().min(1),
    breachedCount: z.number().int().nonnegative()
  }).strict()).default([])
}).strict();
export type SlaMetric = z.infer<typeof slaMetricSchema>;

export const knowledgeMetricSchema = z.object({
  knowledgeId: z.string().min(1),
  title: z.string().min(1),
  category: z.enum(["business_info", "faq", "product_service", "price_rules", "sales_script", "support_policy", "forbidden_answers", "ai_persona"]),
  usedCount: z.number().int().nonnegative(),
  successfulUseCount: z.number().int().nonnegative(),
  markedWrongCount: z.number().int().nonnegative(),
  lastUsedAt: z.string().datetime()
}).strict();
export type KnowledgeMetric = z.infer<typeof knowledgeMetricSchema>;

export const conversationFunnelMetricSchema = z.object({
  new: z.number().int().nonnegative(),
  interested: z.number().int().nonnegative(),
  qualified: z.number().int().nonnegative(),
  quoted: z.number().int().nonnegative(),
  won: z.number().int().nonnegative(),
  lost: z.number().int().nonnegative(),
  follow_up: z.number().int().nonnegative()
}).strict();
export type ConversationFunnelMetric = z.infer<typeof conversationFunnelMetricSchema>;

export const analyticsAppliedFiltersSchema = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
  platform: platformSchema.nullable(),
  roomId: z.string().nullable(),
  agentId: z.string().nullable()
}).strict();
export type AnalyticsAppliedFilters = z.infer<typeof analyticsAppliedFiltersSchema>;

export const analyticsOverviewSchema = z.object({
  filters: analyticsAppliedFiltersSchema,
  totalConversations: z.number().int().nonnegative(),
  openConversations: z.number().int().nonnegative(),
  closedConversations: z.number().int().nonnegative(),
  pendingConversations: z.number().int().nonnegative(),
  followUpConversations: z.number().int().nonnegative(),
  unreadConversations: z.number().int().nonnegative(),
  unrepliedConversations: z.number().int().nonnegative(),
  messagesCount: z.number().int().nonnegative(),
  inboundMessagesCount: z.number().int().nonnegative(),
  outboundMessagesCount: z.number().int().nonnegative()
}).strict();
export type AnalyticsOverview = z.infer<typeof analyticsOverviewSchema>;

export const analyticsConversationStatusSchema = z.object({
  key: z.string().min(1),
  count: z.number().int().nonnegative()
}).strict();

export const analyticsConversationItemSchema = z.object({
  id: z.string().min(1),
  roomId: z.string().min(1),
  platform: platformSchema,
  accountName: z.string().min(1),
  status: z.string().min(1),
  priority: z.string().min(1),
  assignedUserId: z.string().nullable(),
  assignedAgentName: z.string().nullable(),
  unread: z.boolean(),
  unreplied: z.boolean(),
  followUpAt: z.string().datetime().nullable(),
  lastMessageAt: z.string().datetime(),
  createdAt: z.string().datetime()
}).strict();

export const analyticsConversationsSchema = z.object({
  filters: analyticsAppliedFiltersSchema,
  total: z.number().int().nonnegative(),
  byStatus: z.array(analyticsConversationStatusSchema).default([]),
  latest: z.array(analyticsConversationItemSchema).default([])
}).strict();
export type AnalyticsConversations = z.infer<typeof analyticsConversationsSchema>;

export const analyticsChannelItemSchema = z.object({
  platform: platformSchema,
  roomId: z.string().min(1),
  accountId: z.string().min(1),
  accountName: z.string().min(1),
  roomName: z.string().min(1),
  conversations: z.number().int().nonnegative(),
  openConversations: z.number().int().nonnegative(),
  closedConversations: z.number().int().nonnegative(),
  messages: z.number().int().nonnegative(),
  inboundMessages: z.number().int().nonnegative(),
  outboundMessages: z.number().int().nonnegative()
}).strict();

export const analyticsPlatformSplitSchema = z.object({
  platform: platformSchema,
  conversations: z.number().int().nonnegative(),
  messages: z.number().int().nonnegative()
}).strict();

export const analyticsChannelsSchema = z.object({
  filters: analyticsAppliedFiltersSchema,
  items: z.array(analyticsChannelItemSchema).default([]),
  platformSplit: z.array(analyticsPlatformSplitSchema).default([])
}).strict();
export type AnalyticsChannels = z.infer<typeof analyticsChannelsSchema>;

export const analyticsAgentItemSchema = z.object({
  agentId: z.string().min(1),
  agentName: z.string().min(1),
  email: z.string().email(),
  assignedConversations: z.number().int().nonnegative(),
  closedConversations: z.number().int().nonnegative(),
  openTasks: z.number().int().nonnegative(),
  doneTasks: z.number().int().nonnegative(),
  overdueTasks: z.number().int().nonnegative()
}).strict();

export const analyticsAgentsSchema = z.object({
  filters: analyticsAppliedFiltersSchema,
  items: z.array(analyticsAgentItemSchema).default([])
}).strict();
export type AnalyticsAgents = z.infer<typeof analyticsAgentsSchema>;

export const analyticsSlaSchema = z.object({
  filters: analyticsAppliedFiltersSchema,
  healthyCount: z.number().int().nonnegative(),
  warningCount: z.number().int().nonnegative(),
  breachedCount: z.number().int().nonnegative(),
  averageTimeToFirstResponseMinutes: z.number().nonnegative(),
  resolutionDue: z.object({
    overdue: z.number().int().nonnegative(),
    dueSoon: z.number().int().nonnegative(),
    healthy: z.number().int().nonnegative(),
    none: z.number().int().nonnegative()
  }).strict()
}).strict();
export type AnalyticsSla = z.infer<typeof analyticsSlaSchema>;

export const analyticsCountItemSchema = z.object({
  key: z.string().min(1),
  count: z.number().int().nonnegative()
}).strict();

export const analyticsAiSchema = z.object({
  filters: analyticsAppliedFiltersSchema,
  aiStateDistribution: z.array(analyticsCountItemSchema).default([]),
  policyModeCounts: z.array(analyticsCountItemSchema).default([]),
  knowledgeBaseCount: z.number().int().nonnegative(),
  documentCount: z.number().int().nonnegative(),
  chunkCount: z.number().int().nonnegative(),
  aiRunCount: z.number().int().nonnegative(),
  aiRunStatusCounts: z.array(analyticsCountItemSchema).default([])
}).strict();
export type AnalyticsAi = z.infer<typeof analyticsAiSchema>;

export const analyticsTaskItemSchema = z.object({
  id: z.string().min(1),
  conversationId: z.string().min(1),
  title: z.string().min(1),
  status: z.string().min(1),
  assigneeUserId: z.string().nullable(),
  dueAt: z.string().datetime().nullable(),
  completedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime()
}).strict();

export const analyticsTasksSchema = z.object({
  filters: analyticsAppliedFiltersSchema,
  openTasks: z.number().int().nonnegative(),
  doneTasks: z.number().int().nonnegative(),
  overdueTasks: z.number().int().nonnegative(),
  latest: z.array(analyticsTaskItemSchema).default([])
}).strict();
export type AnalyticsTasks = z.infer<typeof analyticsTasksSchema>;

export const analyticsAuditEventSchema = z.object({
  id: z.string().min(1),
  conversationId: z.string().nullable(),
  actorUserId: z.string().nullable(),
  action: z.string().min(1),
  entityType: z.string().min(1),
  entityId: z.string().nullable(),
  createdAt: z.string().datetime()
}).strict();

export const analyticsAuditSchema = z.object({
  filters: analyticsAppliedFiltersSchema,
  actions: z.array(analyticsCountItemSchema).default([]),
  latest: z.array(analyticsAuditEventSchema).default([])
}).strict();
export type AnalyticsAudit = z.infer<typeof analyticsAuditSchema>;

export const leadStatusSchema = z.enum([
  "new",
  "interested",
  "qualified",
  "quoted",
  "won",
  "lost",
  "follow_up"
]);
export type LeadStatus = z.infer<typeof leadStatusSchema>;

export const contactTaskStatusSchema = z.enum(["open", "done", "cancelled"]);
export type ContactTaskStatus = z.infer<typeof contactTaskStatusSchema>;

export const roleNameSchema = z.enum([
  "owner",
  "admin",
  "supervisor",
  "agent",
  "ai_trainer",
  "viewer"
]);
export type RoleName = z.infer<typeof roleNameSchema>;

export const attachmentInputSchema = z.object({
  type: messageTypeSchema.exclude(["text", "event"]),
  url: z.string().url().optional(),
  storageKey: z.string().optional(),
  filename: z.string().optional(),
  mimeType: z.string().optional(),
  sizeBytes: z.number().int().nonnegative().optional()
});
export type AttachmentInput = z.infer<typeof attachmentInputSchema>;

export const normalizedInboundMessageSchema = z.object({
  tenantId: z.string().uuid(),
  platform: platformSchema,
  channelAccountId: z.string().uuid(),
  externalUserId: z.string().min(1),
  externalConversationId: z.string().optional(),
  externalMessageId: z.string().min(1).optional(),
  direction: z.literal("inbound").default("inbound"),
  senderType: z.literal("customer").default("customer"),
  platformMessageId: z.string().min(1),
  messageType: messageTypeSchema,
  text: z.string().optional(),
  attachments: z.array(attachmentInputSchema).default([]),
  timestamp: z.string().datetime(),
  rawPayload: z.unknown()
});
export type NormalizedInboundMessage = z.infer<typeof normalizedInboundMessageSchema>;

export const contactIdentitySchema = z.object({
  id: z.string().min(1),
  contactId: z.string().min(1),
  platform: platformSchema,
  channelAccountId: z.string().min(1),
  accountName: z.string().min(1),
  externalUserId: z.string().min(1),
  externalConversationId: z.string().optional(),
  displayName: z.string().min(1),
  avatarUrl: z.string().url().optional(),
  isPrimary: z.boolean().default(false),
  lastSeenAt: z.string().datetime()
}).strict();
export type ContactIdentity = z.infer<typeof contactIdentitySchema>;

export const contactNoteSchema = z.object({
  id: z.string().min(1),
  contactId: z.string().min(1),
  body: z.string().min(1),
  createdBy: z.string().min(1),
  createdAt: z.string().datetime()
}).strict();
export type ContactNote = z.infer<typeof contactNoteSchema>;

export const contactTaskSchema = z.object({
  id: z.string().min(1),
  contactId: z.string().min(1),
  title: z.string().min(1),
  status: contactTaskStatusSchema,
  dueAt: z.string().datetime().optional(),
  ownerAgent: z.string().min(1).optional(),
  createdAt: z.string().datetime()
}).strict();
export type ContactTask = z.infer<typeof contactTaskSchema>;

export const contactSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  avatarUrl: z.string().url().optional(),
  leadStatus: leadStatusSchema,
  ownerAgent: z.string().optional(),
  tags: z.array(z.string().min(1)).default([]),
  customFields: z.record(z.string(), z.string()).default({}),
  identities: z.array(contactIdentitySchema).default([]),
  notes: z.array(contactNoteSchema).default([]),
  tasks: z.array(contactTaskSchema).default([]),
  optOutBroadcast: z.boolean().default(false),
  suppressedReason: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
}).strict();
export type Contact = z.infer<typeof contactSchema>;

export const customer360SourceSchema = z.object({
  platform: platformSchema,
  channelAccountId: z.string().min(1),
  accountName: z.string().min(1),
  externalUserId: z.string().min(1),
  displayName: z.string().min(1)
}).strict();
export type Customer360Source = z.infer<typeof customer360SourceSchema>;

export const broadcastHistorySummarySchema = z.object({
  contactId: z.string().min(1).optional(),
  customerId: z.string().min(1).optional(),
  identityId: z.string().min(1).nullable().optional(),
  platform: platformSchema.optional(),
  channelAccountId: z.string().min(1).nullable().optional(),
  roomId: z.string().min(1).nullable().optional(),
  conversationId: z.string().min(1).nullable().optional(),
  lastCampaignId: z.string().min(1).nullable().optional(),
  lastCampaignName: z.string().nullable(),
  sentMockCount: z.number().int().nonnegative(),
  optOut: z.boolean().default(false),
  suppressedReason: z.string().min(1).optional(),
  externalCalls: z.literal(0).default(0),
  rows: z.array(z.object({
    id: z.string().min(1),
    contactId: z.string().min(1).nullable(),
    customerId: z.string().min(1).nullable().optional(),
    identityId: z.string().min(1).nullable(),
    campaignId: z.string().min(1),
    campaignName: z.string().min(1).nullable(),
    campaignStatus: z.enum(["draft", "scheduled", "sending", "sent", "paused", "archived", "cancelled", "failed"]).nullable(),
    platform: platformSchema,
    channelAccountId: z.string().min(1).nullable(),
    roomId: z.string().min(1).nullable(),
    conversationId: z.string().min(1).nullable(),
    status: z.enum(["queued_mock", "sent_mock", "skipped_mock", "failed_mock"]),
    reason: z.string().nullable(),
    sentAt: z.string().datetime().nullable(),
    queuedAt: z.string().datetime().nullable(),
    mockOnly: z.boolean(),
    safe: z.boolean(),
    externalCalls: z.literal(0)
  }).strict()).default([])
}).strict();
export type BroadcastHistorySummary = z.infer<typeof broadcastHistorySummarySchema>;

export const createContactRequestSchema = z.object({
  displayName: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().min(1).optional(),
  leadStatus: leadStatusSchema.default("new"),
  ownerUserId: z.string().uuid().optional(),
  tags: z.array(z.string().min(1)).default([]),
  identity: z.object({
    platform: platformSchema,
    channelAccountId: z.string().min(1),
    externalUserId: z.string().min(1),
    displayName: z.string().min(1).optional(),
    profileUrl: z.string().url().optional(),
    isPrimary: z.boolean().default(true)
  }).strict().optional()
}).strict();
export type CreateContactRequest = z.input<typeof createContactRequestSchema>;

export const updateContactRequestSchema = z.object({
  displayName: z.string().min(1).optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().min(1).nullable().optional(),
  leadStatus: leadStatusSchema.optional(),
  ownerUserId: z.string().uuid().nullable().optional(),
  tags: z.array(z.string().min(1)).optional()
}).strict();
export type UpdateContactRequest = z.input<typeof updateContactRequestSchema>;

export const linkContactIdentityRequestSchema = z.object({
  identityId: z.string().min(1).optional(),
  platform: platformSchema.optional(),
  channelAccountId: z.string().min(1).optional(),
  externalUserId: z.string().min(1).optional(),
  displayName: z.string().min(1).optional(),
  profileUrl: z.string().url().optional(),
  isPrimary: z.boolean().default(false)
}).strict().refine((value) =>
  Boolean(value.identityId) ||
  Boolean(value.platform && value.channelAccountId && value.externalUserId),
  "Provide identityId or platform/channelAccountId/externalUserId"
);
export type LinkContactIdentityRequest = z.input<typeof linkContactIdentityRequestSchema>;

export const unlinkContactIdentityRequestSchema = z.object({
  identityId: z.string().min(1)
}).strict();
export type UnlinkContactIdentityRequest = z.input<typeof unlinkContactIdentityRequestSchema>;

export const setPrimaryIdentityRequestSchema = z.object({
  identityId: z.string().min(1)
}).strict();
export type SetPrimaryIdentityRequest = z.input<typeof setPrimaryIdentityRequestSchema>;

export const updateBroadcastConsentRequestSchema = z.object({
  optOut: z.boolean(),
  conversationId: z.string().min(1).optional()
}).strict();
export type UpdateBroadcastConsentRequest = z.input<typeof updateBroadcastConsentRequestSchema>;

export const broadcastCampaignStatusSchema = z.enum(["draft", "scheduled", "sending", "sent", "paused", "archived", "cancelled", "failed"]);
export type BroadcastCampaignStatus = z.infer<typeof broadcastCampaignStatusSchema>;

export const broadcastScheduleTypeSchema = z.enum(["now", "scheduled"]);
export type BroadcastScheduleType = z.infer<typeof broadcastScheduleTypeSchema>;

export const broadcastSegmentFieldSchema = z.enum([
  "platform",
  "roomId",
  "tag",
  "leadStatus",
  "ownerAgent",
  "lastSeenDays",
  "hasOpenTask",
  "priority",
  "slaStatus",
  "aiStatus",
  "contactField",
  "status"
]);
export type BroadcastSegmentField = z.infer<typeof broadcastSegmentFieldSchema>;

export const broadcastSegmentOperatorSchema = z.enum([
  "equals",
  "not_equals",
  "contains",
  "not_contains",
  "in",
  "not_in",
  "greater_than",
  "less_than",
  "exists",
  "not_exists"
]);
export type BroadcastSegmentOperator = z.infer<typeof broadcastSegmentOperatorSchema>;

export const broadcastSegmentRuleSchema = z.object({
  id: z.string().min(1),
  field: broadcastSegmentFieldSchema,
  operator: broadcastSegmentOperatorSchema,
  value: z.unknown().optional()
}).strict();
export type BroadcastSegmentRule = z.infer<typeof broadcastSegmentRuleSchema>;

export const broadcastCampaignSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1).optional(),
  name: z.string().min(1),
  description: z.string().default(""),
  status: broadcastCampaignStatusSchema,
  channelPlatform: platformSchema.optional(),
  channelAccountId: z.string().nullable().optional(),
  platformScope: z.array(platformSchema).min(1),
  roomIds: z.array(z.string().min(1)).default([]),
  segmentId: z.string().min(1).nullable(),
  templateId: z.string().min(1).optional(),
  message: z.string().min(1),
  scheduleType: broadcastScheduleTypeSchema,
  scheduledAt: z.string().datetime().optional(),
  scheduleAt: z.string().datetime().nullable().optional(),
  createdBy: z.string().min(1),
  createdByUserId: z.string().nullable().optional(),
  contentJson: z.unknown().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  sentAt: z.string().datetime().optional()
}).strict();
export type BroadcastCampaign = z.infer<typeof broadcastCampaignSchema>;

export const broadcastSegmentSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1).optional(),
  name: z.string().min(1),
  description: z.string().default(""),
  rules: z.array(broadcastSegmentRuleSchema).default([]),
  rulesJson: z.unknown().optional(),
  estimatedCount: z.number().int().nonnegative().default(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
}).strict();
export type BroadcastSegment = z.infer<typeof broadcastSegmentSchema>;

export const broadcastTemplateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  body: z.string().min(1),
  variables: z.array(z.string().min(1)).default([]),
  tags: z.array(z.string().min(1)).default([]),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
}).strict();
export type BroadcastTemplate = z.infer<typeof broadcastTemplateSchema>;

export const broadcastRecipientStatusSchema = z.enum(["pending", "queued_mock", "sent_mock", "failed_mock", "skipped", "skipped_mock"]);
export type BroadcastRecipientStatus = z.infer<typeof broadcastRecipientStatusSchema>;

export const broadcastRecipientSchema = z.object({
  id: z.string().min(1),
  campaignId: z.string().min(1),
  contactId: z.string().min(1),
  identityId: z.string().min(1),
  platform: platformSchema,
  roomId: z.string().min(1),
  displayName: z.string().min(1),
  status: broadcastRecipientStatusSchema,
  reason: z.string().optional(),
  renderedMessage: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
}).strict();
export type BroadcastRecipient = z.infer<typeof broadcastRecipientSchema>;

export const broadcastRunStatusSchema = z.enum(["pending", "running", "completed", "failed", "cancelled"]);
export type BroadcastRunStatus = z.infer<typeof broadcastRunStatusSchema>;

export const broadcastRunSchema = z.object({
  id: z.string().min(1),
  campaignId: z.string().min(1),
  status: broadcastRunStatusSchema,
  totalRecipients: z.number().int().nonnegative(),
  sentMockCount: z.number().int().nonnegative(),
  failedMockCount: z.number().int().nonnegative(),
  skippedCount: z.number().int().nonnegative(),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  summary: z.string().min(1)
}).strict();
export type BroadcastRun = z.infer<typeof broadcastRunSchema>;

export const broadcastDeliveryEventStatusSchema = z.enum(["queued_mock", "sent_mock", "failed_mock", "skipped", "skipped_mock"]);
export type BroadcastDeliveryEventStatus = z.infer<typeof broadcastDeliveryEventStatusSchema>;

export const broadcastDeliveryEventSchema = z.object({
  id: z.string().min(1),
  campaignId: z.string().min(1),
  recipientId: z.string().min(1),
  status: broadcastDeliveryEventStatusSchema,
  message: z.string().min(1),
  createdAt: z.string().datetime()
}).strict();
export type BroadcastDeliveryEvent = z.infer<typeof broadcastDeliveryEventSchema>;

export const broadcastContentJsonSchema = z.record(z.string(), z.unknown()).default({});
export type BroadcastContentJson = z.infer<typeof broadcastContentJsonSchema>;

export const createBroadcastCampaignRequestSchema = z.object({
  name: z.string().min(1),
  description: z.string().default(""),
  status: broadcastCampaignStatusSchema.default("draft"),
  channelPlatform: platformSchema.default("webchat"),
  channelAccountId: z.string().min(1).nullable().optional(),
  segmentId: z.string().min(1).nullable().optional(),
  contentJson: broadcastContentJsonSchema.optional(),
  scheduleAt: z.string().datetime().nullable().optional(),
  platformScope: z.array(platformSchema).optional(),
  roomIds: z.array(z.string().min(1)).optional(),
  templateId: z.string().min(1).optional(),
  message: z.string().min(1).optional(),
  scheduleType: broadcastScheduleTypeSchema.optional(),
  scheduledAt: z.string().datetime().nullable().optional()
}).strict();
export type CreateBroadcastCampaignRequest = z.input<typeof createBroadcastCampaignRequestSchema>;

export const updateBroadcastCampaignRequestSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  status: broadcastCampaignStatusSchema.optional(),
  channelPlatform: platformSchema.optional(),
  channelAccountId: z.string().min(1).nullable().optional(),
  segmentId: z.string().min(1).nullable().optional(),
  contentJson: broadcastContentJsonSchema.optional(),
  scheduleAt: z.string().datetime().nullable().optional(),
  platformScope: z.array(platformSchema).optional(),
  roomIds: z.array(z.string().min(1)).optional(),
  templateId: z.string().min(1).optional(),
  message: z.string().min(1).optional(),
  scheduleType: broadcastScheduleTypeSchema.optional(),
  scheduledAt: z.string().datetime().nullable().optional()
}).strict();
export type UpdateBroadcastCampaignRequest = z.input<typeof updateBroadcastCampaignRequestSchema>;

export const broadcastAudiencePreviewRequestSchema = z.object({
  platform: z.union([platformSchema, z.literal("all")]).optional(),
  channelAccountId: z.string().min(1).nullable().optional(),
  limit: z.number().int().positive().max(500).default(100)
}).strict();
export type BroadcastAudiencePreviewRequest = z.input<typeof broadcastAudiencePreviewRequestSchema>;

export const broadcastAudiencePreviewRecipientSchema = z.object({
  contactId: z.string().min(1),
  contactIdentityId: z.string().min(1).nullable(),
  displayName: z.string().min(1),
  platform: platformSchema,
  channelAccountId: z.string().min(1).nullable(),
  externalUserId: z.string().min(1).nullable(),
  tags: z.array(z.string().min(1)).default([]),
  leadStatus: z.string().min(1),
  reason: z.string().nullable().optional(),
  renderedMessage: z.string()
}).strict();
export type BroadcastAudiencePreviewRecipient = z.infer<typeof broadcastAudiencePreviewRecipientSchema>;

export const broadcastAudiencePreviewResultSchema = z.object({
  campaignId: z.string().min(1),
  total: z.number().int().nonnegative(),
  recipients: z.array(broadcastAudiencePreviewRecipientSchema).default([])
}).strict();
export type BroadcastAudiencePreviewResult = z.infer<typeof broadcastAudiencePreviewResultSchema>;

export const scheduleBroadcastCampaignRequestSchema = z.object({
  scheduleAt: z.string().datetime()
}).strict();
export type ScheduleBroadcastCampaignRequest = z.input<typeof scheduleBroadcastCampaignRequestSchema>;

export const broadcastSendTestRequestSchema = z.object({
  contactId: z.string().min(1).nullable().optional(),
  contactIdentityId: z.string().min(1).nullable().optional(),
  platform: platformSchema.optional(),
  payloadJson: z.unknown().optional()
}).strict().default({});
export type BroadcastSendTestRequest = z.input<typeof broadcastSendTestRequestSchema>;

export const broadcastSendLogStatusSchema = z.enum(["queued_mock", "sent_mock", "skipped_mock", "failed_mock"]);
export type BroadcastSendLogStatus = z.infer<typeof broadcastSendLogStatusSchema>;

export const broadcastSendLogSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  campaignId: z.string().min(1),
  contactId: z.string().min(1).nullable(),
  contactIdentityId: z.string().min(1).nullable(),
  platform: platformSchema,
  channelAccountId: z.string().min(1).nullable(),
  status: broadcastSendLogStatusSchema,
  reason: z.string().nullable(),
  payloadJson: z.unknown().nullable(),
  createdAt: z.string().datetime()
}).strict();
export type BroadcastSendLog = z.infer<typeof broadcastSendLogSchema>;

export const broadcastSendResultSchema = z.object({
  campaignId: z.string().min(1),
  created: z.number().int().nonnegative(),
  sentMock: z.number().int().nonnegative(),
  queuedMock: z.number().int().nonnegative(),
  skippedMock: z.number().int().nonnegative(),
  failedMock: z.number().int().nonnegative(),
  externalCalls: z.array(z.string()).default([]),
  logs: z.array(broadcastSendLogSchema).default([])
}).strict();
export type BroadcastSendResult = z.infer<typeof broadcastSendResultSchema>;

export const createBroadcastSegmentRequestSchema = z.object({
  name: z.string().min(1),
  description: z.string().default(""),
  rulesJson: z.unknown().optional(),
  rules: z.array(broadcastSegmentRuleSchema).optional(),
  estimatedCount: z.number().int().nonnegative().default(0)
}).strict();
export type CreateBroadcastSegmentRequest = z.input<typeof createBroadcastSegmentRequestSchema>;

export const updateBroadcastSegmentRequestSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  rulesJson: z.unknown().optional(),
  rules: z.array(broadcastSegmentRuleSchema).optional(),
  estimatedCount: z.number().int().nonnegative().optional()
}).strict();
export type UpdateBroadcastSegmentRequest = z.input<typeof updateBroadcastSegmentRequestSchema>;

export const aiIntentSchema = z.enum([
  "pricing",
  "product_info",
  "order_status",
  "appointment",
  "complaint",
  "refund",
  "human_request",
  "unknown"
]);
export type AIIntent = z.infer<typeof aiIntentSchema>;

export const aiNextActionSchema = z.enum([
  "auto_reply",
  "suggest_reply",
  "handoff",
  "ask_clarifying_question",
  "no_action"
]);
export type AINextAction = z.infer<typeof aiNextActionSchema>;

export const knowledgeCategorySchema = z.enum([
  "business_info",
  "faq",
  "product_service",
  "price_rules",
  "sales_script",
  "support_policy",
  "forbidden_answers",
  "ai_persona"
]);
export type KnowledgeCategory = z.infer<typeof knowledgeCategorySchema>;

export const knowledgeStatusSchema = z.enum(["draft", "active", "archived"]);
export type KnowledgeStatus = z.infer<typeof knowledgeStatusSchema>;

export const knowledgeSourceTypeSchema = z.enum(["manual", "url", "file", "import"]);
export type KnowledgeSourceType = z.infer<typeof knowledgeSourceTypeSchema>;

export const knowledgeItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  category: knowledgeCategorySchema,
  body: z.string().min(1),
  status: knowledgeStatusSchema,
  tags: z.array(z.string().min(1)).default([]),
  updatedAt: z.string().datetime()
}).strict();
export type KnowledgeItem = z.infer<typeof knowledgeItemSchema>;

export const knowledgeBaseSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().default(""),
  status: knowledgeStatusSchema,
  documentCount: z.number().int().nonnegative(),
  updatedAt: z.string().datetime()
}).strict();
export type KnowledgeBase = z.infer<typeof knowledgeBaseSchema>;

export const createKnowledgeBaseRequestSchema = z.object({
  name: z.string().min(1),
  description: z.string().default(""),
  status: knowledgeStatusSchema.default("active")
}).strict();
export type CreateKnowledgeBaseRequest = z.input<typeof createKnowledgeBaseRequestSchema>;

export const updateKnowledgeBaseRequestSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  status: knowledgeStatusSchema.optional()
}).strict();
export type UpdateKnowledgeBaseRequest = z.input<typeof updateKnowledgeBaseRequestSchema>;

export const knowledgeDocumentSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  knowledgeBaseId: z.string().min(1),
  title: z.string().min(1),
  sourceType: knowledgeSourceTypeSchema,
  sourceUrl: z.string().nullable(),
  status: knowledgeStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
}).strict();
export type KnowledgeDocument = z.infer<typeof knowledgeDocumentSchema>;

export const createKnowledgeDocumentRequestSchema = z.object({
  title: z.string().min(1),
  sourceType: knowledgeSourceTypeSchema.default("manual"),
  sourceUrl: z.string().nullable().optional(),
  status: knowledgeStatusSchema.default("active")
}).strict();
export type CreateKnowledgeDocumentRequest = z.input<typeof createKnowledgeDocumentRequestSchema>;

export const updateKnowledgeDocumentRequestSchema = z.object({
  title: z.string().min(1).optional(),
  sourceType: knowledgeSourceTypeSchema.optional(),
  sourceUrl: z.string().nullable().optional(),
  status: knowledgeStatusSchema.optional()
}).strict();
export type UpdateKnowledgeDocumentRequest = z.input<typeof updateKnowledgeDocumentRequestSchema>;

export const knowledgeChunkSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  documentId: z.string().min(1),
  content: z.string().min(1),
  metadataJson: z.unknown().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
}).strict();
export type KnowledgeChunk = z.infer<typeof knowledgeChunkSchema>;

export const createKnowledgeChunkRequestSchema = z.object({
  content: z.string().min(1),
  metadataJson: z.unknown().nullable().optional()
}).strict();
export type CreateKnowledgeChunkRequest = z.input<typeof createKnowledgeChunkRequestSchema>;

export const updateKnowledgeChunkRequestSchema = z.object({
  content: z.string().min(1).optional(),
  metadataJson: z.unknown().nullable().optional()
}).strict().refine((value) => value.content !== undefined || value.metadataJson !== undefined, "Provide content or metadataJson");
export type UpdateKnowledgeChunkRequest = z.input<typeof updateKnowledgeChunkRequestSchema>;

export const aiMatchedKnowledgeSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: knowledgeCategorySchema,
  matchReason: z.string()
}).strict();
export type AIMatchedKnowledge = z.infer<typeof aiMatchedKnowledgeSchema>;

export const aiDecisionSchema = z.object({
  intent: aiIntentSchema,
  sentiment: z.enum(["positive", "neutral", "negative"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  confidence: z.number().min(0).max(1),
  riskLevel: z.enum(["low", "medium", "high"]),
  requiresHuman: z.boolean(),
  nextAction: aiNextActionSchema,
  reply: z.string(),
  summary: z.string(),
  tags: z.array(z.string()).default([]),
  reason: z.string(),
  matchedKnowledge: z.array(aiMatchedKnowledgeSchema).optional()
}).strict();
export type AIDecision = z.infer<typeof aiDecisionSchema>;

export const aiSuggestionSourceSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  category: z.string().min(1),
  matchReason: z.string().default(""),
  sourceType: z.string().min(1).optional(),
  sourceUrl: z.string().nullable().optional()
}).strict();
export type AiSuggestionSource = z.infer<typeof aiSuggestionSourceSchema>;

export const aiSuggestedReplySchema = z.object({
  suggestionId: z.string().min(1),
  aiRunId: z.string().min(1),
  tenantId: z.string().min(1),
  conversationId: z.string().min(1),
  platform: platformSchema,
  channelAccountId: z.string().min(1),
  roomId: z.string().min(1),
  summary: z.string(),
  suggestedReply: z.string(),
  intent: aiIntentSchema,
  confidence: z.number().min(0).max(1),
  riskLevel: z.enum(["low", "medium", "high"]),
  nextAction: aiNextActionSchema,
  requiresHuman: z.boolean(),
  sources: z.array(aiSuggestionSourceSchema).default([]),
  status: z.enum(["completed", "failed"]),
  error: z.string().nullable(),
  externalCalls: z.literal(0),
  generatedAt: z.string().datetime()
}).strict();
export type AiSuggestedReply = z.infer<typeof aiSuggestedReplySchema>;

export const aiSuggestionFeedbackTypeSchema = z.enum(["mark_wrong"]);
export type AiSuggestionFeedbackType = z.infer<typeof aiSuggestionFeedbackTypeSchema>;

export const aiSuggestionFeedbackRequestSchema = z.object({
  feedbackType: aiSuggestionFeedbackTypeSchema.default("mark_wrong"),
  note: z.string().trim().max(500).optional()
}).strict();
export type AiSuggestionFeedbackRequest = z.input<typeof aiSuggestionFeedbackRequestSchema>;

export const aiSuggestionFeedbackSchema = z.object({
  feedbackId: z.string().min(1),
  suggestionId: z.string().min(1),
  aiRunId: z.string().min(1),
  tenantId: z.string().min(1),
  conversationId: z.string().min(1),
  platform: platformSchema,
  channelAccountId: z.string().min(1),
  roomId: z.string().min(1),
  feedbackType: aiSuggestionFeedbackTypeSchema,
  actionType: z.string().min(1),
  externalCalls: z.literal(0),
  createdAt: z.string().datetime()
}).strict();
export type AiSuggestionFeedback = z.infer<typeof aiSuggestionFeedbackSchema>;

export const aiDecisionJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "intent",
    "sentiment",
    "priority",
    "confidence",
    "riskLevel",
    "requiresHuman",
    "nextAction",
    "reply",
    "summary",
    "tags",
    "reason"
  ],
  properties: {
    intent: { enum: ["pricing", "product_info", "order_status", "appointment", "complaint", "refund", "human_request", "unknown"] },
    sentiment: { enum: ["positive", "neutral", "negative"] },
    priority: { enum: ["low", "medium", "high", "urgent"] },
    confidence: { type: "number", minimum: 0, maximum: 1 },
    riskLevel: { enum: ["low", "medium", "high"] },
    requiresHuman: { type: "boolean" },
    nextAction: { enum: ["auto_reply", "suggest_reply", "handoff", "ask_clarifying_question", "no_action"] },
    reply: { type: "string" },
    summary: { type: "string" },
    tags: { type: "array", items: { type: "string" } },
    reason: { type: "string" },
    matchedKnowledge: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "title", "category", "matchReason"],
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          category: { enum: ["business_info", "faq", "product_service", "price_rules", "sales_script", "support_policy", "forbidden_answers", "ai_persona"] },
          matchReason: { type: "string" }
        }
      }
    }
  }
} as const;

export const sampleKnowledgeItems: KnowledgeItem[] = [
  {
    id: "kb-business-demo",
    title: "ข้อมูลธุรกิจ RUAMCHAT Demo",
    category: "business_info",
    body: "RUAMCHAT Demo เป็นระบบรวมแชทหลายช่องทางสำหรับทีมขายและทีม support ช่วยรวม Webchat, LINE, Telegram, Facebook และ Instagram ไว้ใน Inbox เดียว",
    status: "active",
    tags: ["business", "omnichannel", "demo"],
    updatedAt: "2026-05-20T00:00:00.000Z"
  },
  {
    id: "kb-faq-webhook",
    title: "FAQ: มีคู่มือเชื่อม webhook ไหม",
    category: "faq",
    body: "มีคู่มือ webhook สำหรับรับ event ข้อความและสถานะส่งกลับ ใน demo ให้แอดมินถาม platform ที่ต้องการเชื่อมก่อนส่งเอกสารจริง",
    status: "active",
    tags: ["faq", "webhook", "docs"],
    updatedAt: "2026-05-20T00:00:00.000Z"
  },
  {
    id: "kb-price-package",
    title: "ราคาและแพ็กเกจตัวอย่าง",
    category: "price_rules",
    body: "แพ็กเกจตัวอย่างเริ่มที่ Starter 1,990 บาทต่อเดือน, Pro 4,990 บาทต่อเดือน และ Business ติดต่อทีมขายเพื่อประเมิน SLA และจำนวนแอดมิน",
    status: "active",
    tags: ["pricing", "ราคา", "แพ็กเกจ", "package"],
    updatedAt: "2026-05-20T00:00:00.000Z"
  },
  {
    id: "kb-product-service",
    title: "Product: รวมแชทและ AI assist",
    category: "product_service",
    body: "ระบบรองรับ Platform Rooms, Customer 360, AI Summary, AI Draft, tag อัตโนมัติ และ handoff ให้แอดมินเมื่อมีความเสี่ยง",
    status: "active",
    tags: ["product", "ai", "inbox", "customer360"],
    updatedAt: "2026-05-20T00:00:00.000Z"
  },
  {
    id: "kb-support-policy",
    title: "นโยบาย Support Demo",
    category: "support_policy",
    body: "เวลาทำการ support คือทุกวันจันทร์ถึงศุกร์ 09:00-18:00 น. เคสด่วนหรือเคสเกี่ยวกับการชำระเงินต้องส่งต่อให้แอดมินตรวจสอบ",
    status: "active",
    tags: ["support", "policy", "sla"],
    updatedAt: "2026-05-20T00:00:00.000Z"
  },
  {
    id: "kb-forbidden-refund",
    title: "คำตอบต้องห้าม: อนุมัติเงินคืนหรือยกเลิกแทนลูกค้า",
    category: "forbidden_answers",
    body: "ห้าม AI อนุมัติ refund, ยกเลิกบริการ, เปลี่ยนข้อมูลส่วนตัว, รับชำระเงิน หรือยืนยันข้อผูกพันทางกฎหมาย ต้องส่งต่อให้แอดมินเสมอ",
    status: "active",
    tags: ["forbidden", "refund", "cancel", "payment", "legal"],
    updatedAt: "2026-05-20T00:00:00.000Z"
  },
  {
    id: "kb-persona",
    title: "AI Persona",
    category: "ai_persona",
    body: "AI ตอบสุภาพ กระชับ ใช้ภาษาไทยเป็นหลัก ไม่อ้างว่าสามารถทำรายการแทนแอดมิน และต้องบอกว่าจะให้ทีมงานตรวจสอบเมื่อข้อมูลไม่พอ",
    status: "active",
    tags: ["persona", "tone", "thai"],
    updatedAt: "2026-05-20T00:00:00.000Z"
  }
];

export const sendMessageRequestSchema = z.object({
  text: z.string().trim().min(1),
  attachments: z.array(attachmentInputSchema).default([])
});
export type SendMessageRequest = z.infer<typeof sendMessageRequestSchema>;

export const assignConversationRequestSchema = z.object({
  userId: z.string().uuid().nullable()
});
export type AssignConversationRequest = z.infer<typeof assignConversationRequestSchema>;

export const followUpConversationRequestSchema = z.object({
  followUpAt: z.string().datetime().optional()
}).strict();
export type FollowUpConversationRequest = z.infer<typeof followUpConversationRequestSchema>;

export const workflowConversationStatusSchema = z.enum(["open", "pending", "closed", "spam"]);
export type WorkflowConversationStatus = z.infer<typeof workflowConversationStatusSchema>;

export const updateConversationStatusRequestSchema = z.object({
  status: workflowConversationStatusSchema
}).strict();
export type UpdateConversationStatusRequest = z.input<typeof updateConversationStatusRequestSchema>;

export const updateConversationPriorityRequestSchema = z.object({
  priority: z.enum(["low", "normal", "medium", "high", "urgent"])
}).strict();
export type UpdateConversationPriorityRequest = z.input<typeof updateConversationPriorityRequestSchema>;

export const updateConversationReadStateRequestSchema = z.object({
  unread: z.boolean().optional(),
  unreplied: z.boolean().optional()
}).strict().refine((value) => value.unread !== undefined || value.unreplied !== undefined, "Provide unread or unreplied");
export type UpdateConversationReadStateRequest = z.input<typeof updateConversationReadStateRequestSchema>;

export const updateConversationSlaRequestSchema = z.object({
  slaDueAt: z.string().datetime().nullable().optional(),
  slaBreachedAt: z.string().datetime().nullable().optional(),
  slaStatus: slaStatusSchema.optional(),
  firstResponseDueAt: z.string().datetime().nullable().optional(),
  resolutionDueAt: z.string().datetime().nullable().optional()
}).strict();
export type UpdateConversationSlaRequest = z.input<typeof updateConversationSlaRequestSchema>;

export const createInternalNoteRequestSchema = z.object({
  body: z.string().min(1),
  visibility: internalNoteVisibilitySchema.default("team")
}).strict();
export type CreateInternalNoteRequest = z.input<typeof createInternalNoteRequestSchema>;

export const taskStatusSchema = z.enum(["open", "done", "cancelled"]);
export type TaskStatus = z.infer<typeof taskStatusSchema>;

export const createTaskRequestSchema = z.object({
  title: z.string().min(1),
  assigneeUserId: z.string().uuid().nullable().optional(),
  dueAt: z.string().datetime().nullable().optional()
}).strict();
export type CreateTaskRequest = z.input<typeof createTaskRequestSchema>;

export const updateTaskRequestSchema = z.object({
  title: z.string().min(1).optional(),
  status: taskStatusSchema.optional(),
  assigneeUserId: z.string().uuid().nullable().optional(),
  dueAt: z.string().datetime().nullable().optional()
}).strict();
export type UpdateTaskRequest = z.input<typeof updateTaskRequestSchema>;

export const workflowTaskSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  conversationId: z.string().min(1),
  contactId: z.string().min(1),
  platform: platformSchema,
  channelAccountId: z.string().min(1),
  roomId: z.string().min(1),
  title: z.string().min(1),
  status: taskStatusSchema,
  assigneeUserId: z.string().nullable(),
  createdByUserId: z.string().nullable(),
  dueAt: z.string().datetime().nullable(),
  completedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  externalCalls: z.literal(0).default(0)
}).strict();
export type WorkflowTask = z.infer<typeof workflowTaskSchema>;

export const roomAiPolicySchema = z.object({
  roomId: z.string().min(1),
  aiMode: aiModeSchema,
  autoReplyThreshold: z.number().min(0).max(1),
  draftThreshold: z.number().min(0).max(1),
  requireCitationsForAutoReply: z.boolean(),
  handoffOnHighRisk: z.boolean(),
  knowledgeBaseIds: z.array(z.string().min(1)).default([]),
  updatedAt: z.string().datetime()
}).strict();
export type RoomAiPolicy = z.infer<typeof roomAiPolicySchema>;

export const roomAiPolicyPatchSchema = z.object({
  aiMode: aiModeSchema.optional(),
  mode: aiModeSchema.optional(),
  autoReplyThreshold: z.number().min(0).max(1).optional(),
  draftThreshold: z.number().min(0).max(1).optional(),
  requireCitationsForAutoReply: z.boolean().optional(),
  handoffOnHighRisk: z.boolean().optional(),
  knowledgeBaseIds: z.array(z.string().min(1)).optional()
}).strict().refine((value) =>
  value.aiMode !== undefined ||
  value.mode !== undefined ||
  value.autoReplyThreshold !== undefined ||
  value.draftThreshold !== undefined ||
  value.requireCitationsForAutoReply !== undefined ||
  value.handoffOnHighRisk !== undefined ||
  value.knowledgeBaseIds !== undefined,
  "Provide at least one AI policy field"
);
export type RoomAiPolicyPatch = z.infer<typeof roomAiPolicyPatchSchema>;

export const webhookAcceptedSchema = z.object({
  accepted: z.literal(true),
  conversationId: z.string().uuid().optional(),
  messageId: z.string().uuid().optional(),
  duplicate: z.boolean().optional()
});
export type WebhookAccepted = z.infer<typeof webhookAcceptedSchema>;

export const dataModeSchema = z.enum(["mock", "api"]);
export type DataMode = z.infer<typeof dataModeSchema>;

export const apiHealthSchema = z.object({
  status: z.literal("ok"),
  service: z.literal("api"),
  time: z.string().datetime(),
  mode: z.string().min(1)
}).strict();
export type ApiHealth = z.infer<typeof apiHealthSchema>;

export const coreRoomSchema = z.object({
  id: z.string().min(1),
  platform: platformSchema,
  platformLabel: z.string().min(1),
  channelAccountId: z.string().min(1).optional(),
  accountName: z.string().min(1),
  roomName: z.string().min(1),
  accent: z.string().min(1),
  conversationCount: z.number().int().nonnegative().default(0)
}).strict();
export type CoreRoom = z.infer<typeof coreRoomSchema>;

export const coreConversationTabSchema = z.enum(["human", "bot"]);
export type CoreConversationTab = z.infer<typeof coreConversationTabSchema>;

export const coreAiStatusSchema = z.enum(["AI Off", "Suggest", "AI Active", "Need Human", "Human Taken", "Closed"]);
export type CoreAiStatus = z.infer<typeof coreAiStatusSchema>;

export const taskDashboardItemSchema = workflowTaskSchema.extend({
  conversationTab: coreConversationTabSchema,
  conversationStatus: conversationStatusSchema,
  conversationPriority: conversationPrioritySchema,
  customerName: z.string().min(1),
  assignedAgentName: z.string().nullable(),
  accountName: z.string().min(1),
  platformLabel: z.string().min(1),
  lastMessageAt: z.string().datetime()
}).strict();
export type TaskDashboardItem = z.infer<typeof taskDashboardItemSchema>;

export const coreConversationCardSchema = z.object({
  id: z.string().min(1),
  roomId: z.string().min(1),
  tab: coreConversationTabSchema,
  platform: platformSchema,
  platformLabel: z.string().min(1),
  channelAccountId: z.string().min(1),
  accountName: z.string().min(1),
  customerName: z.string().min(1),
  customerEmail: z.string().default("-"),
  customerPhone: z.string().default("-"),
  lastMessage: z.string().default("-"),
  lastMessageAt: z.string().datetime(),
  lastMessageTime: z.string().min(1),
  unreadCount: z.number().int().nonnegative(),
  assignedAgent: z.string().nullable(),
  tags: z.array(z.string()).default([]),
  aiStatus: coreAiStatusSchema,
  priority: conversationPrioritySchema,
  status: conversationStatusSchema,
  unreplied: z.boolean().default(false),
  followUpAt: z.string().datetime().optional(),
  slaDueAt: z.string().datetime().nullable().optional(),
  slaBreachedAt: z.string().datetime().nullable().optional(),
  slaStatus: slaStatusSchema.optional(),
  firstResponseDueAt: z.string().datetime().nullable().optional(),
  resolutionDueAt: z.string().datetime().nullable().optional()
}).strict();
export type CoreConversationCard = z.infer<typeof coreConversationCardSchema>;

export const conversationAuditLogSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  conversationId: z.string().nullable(),
  platform: platformSchema,
  channelAccountId: z.string().min(1),
  roomId: z.string().min(1),
  actorUserId: z.string().nullable(),
  action: z.string().min(1),
  beforeJson: z.unknown().nullable(),
  afterJson: z.unknown().nullable(),
  metadataJson: z.unknown().nullable(),
  createdAt: z.string().datetime()
}).strict();
export type ConversationAuditLog = z.infer<typeof conversationAuditLogSchema>;

export const conversationStatusHistorySchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  conversationId: z.string().min(1),
  platform: platformSchema,
  channelAccountId: z.string().min(1),
  roomId: z.string().min(1),
  actorUserId: z.string().nullable(),
  fromStatus: workflowConversationStatusSchema.nullable(),
  toStatus: workflowConversationStatusSchema,
  metadataJson: z.unknown().nullable(),
  createdAt: z.string().datetime()
}).strict();
export type ConversationStatusHistory = z.infer<typeof conversationStatusHistorySchema>;

export const customer360Schema = z.object({
  selectedConversationId: z.string().min(1),
  contact: contactSchema,
  owner: z.string().nullable(),
  priority: conversationPrioritySchema,
  status: conversationStatusSchema,
  slaDueAt: z.string().datetime().nullable().optional(),
  slaBreachedAt: z.string().datetime().nullable().optional(),
  slaStatus: slaStatusSchema.optional(),
  firstResponseDueAt: z.string().datetime().nullable().optional(),
  resolutionDueAt: z.string().datetime().nullable().optional(),
  identities: z.array(contactIdentitySchema).default([]),
  recentConversations: z.array(coreConversationCardSchema).default([]),
  notes: z.array(contactNoteSchema).default([]),
  tasks: z.array(contactTaskSchema).default([]),
  broadcastHistorySummary: broadcastHistorySummarySchema,
  source: customer360SourceSchema
}).strict();
export type Customer360 = z.infer<typeof customer360Schema>;

export const coreMessageDirectionSchema = z.enum(["inbound", "outbound"]);
export type CoreMessageDirection = z.infer<typeof coreMessageDirectionSchema>;

export const coreMessageSenderTypeSchema = z.enum(["customer", "agent", "ai", "system"]);
export type CoreMessageSenderType = z.infer<typeof coreMessageSenderTypeSchema>;

export const coreDeliveryStatusSchema = z.enum(["received", "sent_mock", "queued_mock", "failed_mock"]);
export type CoreDeliveryStatus = z.infer<typeof coreDeliveryStatusSchema>;

export const coreMessageSchema = z.object({
  id: z.string().min(1),
  conversationId: z.string().min(1),
  direction: coreMessageDirectionSchema,
  senderType: coreMessageSenderTypeSchema,
  text: z.string().default(""),
  createdAt: z.string().datetime(),
  platformMessageId: z.string().min(1),
  deliveryStatus: coreDeliveryStatusSchema
}).strict();
export type CoreMessage = z.infer<typeof coreMessageSchema>;

export const agentMessageRequestSchema = z.object({
  text: z.string().trim().min(1),
  senderType: z.literal("agent").default("agent")
}).strict();
export type AgentMessageRequest = z.infer<typeof agentMessageRequestSchema>;

export const webchatInboundRequestSchema = z.object({
  visitorId: z.string().min(1).optional(),
  sessionId: z.string().min(1).optional(),
  messageId: z.string().min(1).optional(),
  text: z.string().min(1),
  timestamp: z.string().datetime().optional(),
  name: z.string().min(1).optional()
}).strict();
export type WebchatInboundRequest = z.infer<typeof webchatInboundRequestSchema>;

export const webchatInboundResponseSchema = z.object({
  accepted: z.literal(true),
  conversationId: z.string().min(1),
  messageId: z.string().min(1).optional(),
  duplicate: z.boolean()
}).strict();
export type WebchatInboundResponse = z.infer<typeof webchatInboundResponseSchema>;

export const flowStatusSchema = z.enum(["draft", "active", "paused", "archived"]);
export type FlowStatus = z.infer<typeof flowStatusSchema>;

export const flowTriggerTypeSchema = z.enum(["keyword", "first_message", "tag_added", "ai_intent", "status_changed", "manual_test"]);
export type FlowTriggerType = z.infer<typeof flowTriggerTypeSchema>;

export const flowMatchModeSchema = z.enum(["contains", "exact", "starts_with", "regex"]);
export type FlowMatchMode = z.infer<typeof flowMatchModeSchema>;

export const flowNodeTypeSchema = z.enum([
  "trigger",
  "condition",
  "send_message",
  "ai_reply",
  "assign_agent",
  "add_tag",
  "remove_tag",
  "set_priority",
  "set_status",
  "create_task",
  "human_handoff",
  "add_to_broadcast_segment",
  "trigger_broadcast_mock",
  "delay",
  "note",
  "end"
]);
export type FlowNodeType = z.infer<typeof flowNodeTypeSchema>;

export const flowRunStatusSchema = z.enum(["pending", "running", "completed", "failed", "stopped", "success", "skipped", "dry_run"]);
export type FlowRunStatus = z.infer<typeof flowRunStatusSchema>;

export const flowRunStepStatusSchema = z.enum(["pending", "running", "completed", "failed", "skipped"]);
export type FlowRunStepStatus = z.infer<typeof flowRunStepStatusSchema>;

export const automationActionResultStatusSchema = z.enum([
  "success",
  "failed",
  "skipped",
  "success_mock",
  "skipped_mock",
  "failed_mock",
  "outbound_skipped_mock"
]);
export type AutomationActionResultStatus = z.infer<typeof automationActionResultStatusSchema>;

export const flowTriggerSchema = z.object({
  id: z.string().min(1),
  type: flowTriggerTypeSchema,
  keyword: z.string().optional(),
  intent: aiIntentSchema.optional(),
  tag: z.string().optional(),
  status: conversationStatusSchema.optional(),
  matchMode: flowMatchModeSchema.default("contains"),
  caseSensitive: z.boolean().default(false)
}).strict();
export type FlowTrigger = z.infer<typeof flowTriggerSchema>;

export const flowNodeSchema = z.object({
  id: z.string().min(1),
  type: flowNodeTypeSchema,
  label: z.string().min(1),
  config: z.record(z.string(), z.unknown()).default({}),
  position: z.object({
    x: z.number(),
    y: z.number()
  }).strict()
}).strict();
export type FlowNode = z.infer<typeof flowNodeSchema>;

export const flowEdgeSchema = z.object({
  id: z.string().min(1),
  sourceNodeId: z.string().min(1),
  targetNodeId: z.string().min(1),
  conditionLabel: z.string().optional()
}).strict();
export type FlowEdge = z.infer<typeof flowEdgeSchema>;

export const flowSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().default(""),
  status: flowStatusSchema,
  triggerType: flowTriggerTypeSchema,
  trigger: flowTriggerSchema,
  roomIds: z.array(z.string().min(1)).default([]),
  platformScope: z.array(platformSchema).min(1),
  nodes: z.array(flowNodeSchema).min(1),
  edges: z.array(flowEdgeSchema).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
}).strict();
export type Flow = z.infer<typeof flowSchema>;

export const createFlowRequestSchema = z.object({
  name: z.string().min(1),
  description: z.string().default(""),
  status: flowStatusSchema.default("draft"),
  triggerType: flowTriggerTypeSchema,
  trigger: flowTriggerSchema.optional(),
  roomIds: z.array(z.string().min(1)).default([]),
  platformScope: z.array(platformSchema).min(1).default(["webchat", "telegram", "line", "facebook", "instagram"]),
  nodes: z.array(flowNodeSchema).min(1).optional(),
  edges: z.array(flowEdgeSchema).default([]),
  triggerConfigJson: z.unknown().optional(),
  conditionsJson: z.unknown().optional(),
  actionsJson: z.unknown().optional()
}).strict();
export type CreateFlowRequest = z.infer<typeof createFlowRequestSchema>;

export const updateFlowRequestSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  status: flowStatusSchema.optional(),
  triggerType: flowTriggerTypeSchema.optional(),
  trigger: flowTriggerSchema.optional(),
  roomIds: z.array(z.string().min(1)).optional(),
  platformScope: z.array(platformSchema).min(1).optional(),
  nodes: z.array(flowNodeSchema).min(1).optional(),
  edges: z.array(flowEdgeSchema).optional(),
  triggerConfigJson: z.unknown().optional(),
  conditionsJson: z.unknown().optional(),
  actionsJson: z.unknown().optional()
}).strict();
export type UpdateFlowRequest = z.infer<typeof updateFlowRequestSchema>;

export const updateFlowStatusRequestSchema = z.object({
  status: flowStatusSchema
}).strict();
export type UpdateFlowStatusRequest = z.infer<typeof updateFlowStatusRequestSchema>;

export const flowRunStepSchema = z.object({
  id: z.string().min(1),
  nodeId: z.string().min(1),
  nodeType: flowNodeTypeSchema,
  status: flowRunStepStatusSchema,
  input: z.unknown().optional(),
  output: z.unknown().optional(),
  error: z.string().optional(),
  createdAt: z.string().datetime()
}).strict();
export type FlowRunStep = z.infer<typeof flowRunStepSchema>;

export const flowRunSchema = z.object({
  id: z.string().min(1),
  flowId: z.string().min(1),
  conversationId: z.string().min(1).nullable(),
  contactId: z.string().min(1).nullable().default(null),
  status: flowRunStatusSchema,
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  steps: z.array(flowRunStepSchema).default([]),
  resultSummary: z.string().default("")
}).strict();
export type FlowRun = z.infer<typeof flowRunSchema>;

export const automationActionResultSchema = z.object({
  actionType: flowNodeTypeSchema,
  status: automationActionResultStatusSchema,
  message: z.string().min(1),
  metadata: z.record(z.string(), z.unknown()).default({})
}).strict();
export type AutomationActionResult = z.infer<typeof automationActionResultSchema>;

export const flowTestRunRequestSchema = z.object({
  conversationId: z.string().min(1).nullable().optional(),
  contactId: z.string().min(1).nullable().optional(),
  message: z.string().default(""),
  platform: platformSchema.default("webchat"),
  roomId: z.string().min(1).default("webchat-main"),
  triggerType: flowTriggerTypeSchema.optional(),
  tag: z.string().optional(),
  intent: z.string().optional(),
  status: conversationStatusSchema.optional(),
  statusFrom: conversationStatusSchema.optional(),
  isFirstMessage: z.boolean().optional(),
  aiConfidence: z.number().min(0).max(1).optional(),
  businessHours: z.boolean().optional()
}).strict();
export type FlowTestRunRequest = z.infer<typeof flowTestRunRequestSchema>;

export const flowTestRunResultSchema = z.object({
  triggerMatched: z.boolean(),
  flowRun: flowRunSchema,
  state: z.object({
    actionResults: z.array(automationActionResultSchema).default([]),
    auditLogsCreated: z.array(auditLogSchema).default([]),
    externalCalls: z.array(z.string()).default([]),
    skippedExternalActions: z.array(z.string()).default([])
  }).strict()
}).strict();
export type FlowTestRunResult = z.infer<typeof flowTestRunResultSchema>;

export type KnowledgeSearchOptions = {
  categories?: KnowledgeCategory[];
  limit?: number;
};

export function getActiveKnowledgeItems(items: KnowledgeItem[]) {
  return items.filter((item) => item.status === "active");
}

export function findMatchedKnowledge(text: string, items: KnowledgeItem[], options: KnowledgeSearchOptions = {}): AIMatchedKnowledge[] {
  const queryTokens = tokenizeForKnowledge(text);
  if (queryTokens.length === 0) return [];

  const allowedCategories = options.categories && options.categories.length > 0 ? new Set(options.categories) : null;
  const scored = getActiveKnowledgeItems(items)
    .filter((item) => !allowedCategories || allowedCategories.has(item.category))
    .map((item) => {
      const haystack = tokenizeForKnowledge([item.title, item.category, item.body, item.tags.join(" ")].join(" "));
      const matchingTokens = queryTokens.filter((token) =>
        haystack.some((sourceToken) => sourceToken.includes(token) || token.includes(sourceToken))
      );
      const tagHits = item.tags.filter((tag) => queryTokens.includes(normalizeKnowledgeText(tag)));
      const score = matchingTokens.length + tagHits.length * 2;

      return {
        item,
        score,
        matchReason: matchingTokens.length > 0
          ? `Matched keywords: ${Array.from(new Set([...matchingTokens, ...tagHits])).slice(0, 5).join(", ")}`
          : ""
      };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || b.item.updatedAt.localeCompare(a.item.updatedAt))
    .slice(0, options.limit ?? 4);

  return scored.map(({ item, matchReason }) => ({
    id: item.id,
    title: item.title,
    category: item.category,
    matchReason
  }));
}

export function createKnowledgeAwareMockAiDecision(
  text: string,
  knowledgeItems: KnowledgeItem[] = sampleKnowledgeItems,
  options: KnowledgeSearchOptions = {}
): AIDecision {
  const matchedKnowledge = findMatchedKnowledge(text, knowledgeItems, options);
  const activeItems = getActiveKnowledgeItems(knowledgeItems);
  const forbiddenMatches = findMatchedKnowledge(text, activeItems, { categories: ["forbidden_answers"], limit: 2 });
  const base = createMockAiDecision(text);
  const firstMatch = matchedKnowledge[0];
  const sourceItem = firstMatch ? activeItems.find((item) => item.id === firstMatch.id) : undefined;
  const forbidden = forbiddenMatches.length > 0 || ["refund", "complaint", "human_request"].includes(base.intent);

  if (forbidden) {
    return applyAiDecisionPolicy({
      ...base,
      priority: "high",
      confidence: Math.max(base.confidence, 0.9),
      riskLevel: "high",
      requiresHuman: true,
      nextAction: "handoff",
      reply: "เคสนี้มีเงื่อนไขที่ AI ไม่ควรตอบเอง เดี๋ยวแอดมินตรวจสอบและติดต่อกลับโดยเร็วครับ",
      summary: sourceItem ? `ต้องให้แอดมินตรวจสอบตาม knowledge: ${sourceItem.title}` : base.summary,
      tags: Array.from(new Set([...base.tags, "forbidden", "needs-human"])),
      reason: forbiddenMatches[0]?.matchReason ?? "Risk policy requires human review.",
      matchedKnowledge: mergeMatchedKnowledge(forbiddenMatches, matchedKnowledge)
    });
  }

  if (sourceItem) {
    const intent: AIIntent = sourceItem.category === "price_rules"
      ? "pricing"
      : ["faq", "product_service", "business_info"].includes(sourceItem.category)
        ? "product_info"
        : base.intent;

    return applyAiDecisionPolicy({
      ...base,
      intent,
      priority: sourceItem.category === "price_rules" ? "medium" : "low",
      confidence: 0.9,
      riskLevel: "low",
      requiresHuman: false,
      nextAction: sourceItem.category === "faq" ? "auto_reply" : "suggest_reply",
      reply: `จากข้อมูล ${sourceItem.title}: ${sourceItem.body}`,
      summary: `ตอบโดยอ้างอิง active knowledge: ${sourceItem.title}`,
      tags: Array.from(new Set([...base.tags, ...sourceItem.tags, sourceItem.category])).slice(0, 8),
      reason: firstMatch.matchReason,
      matchedKnowledge
    });
  }

  return applyAiDecisionPolicy({
    ...base,
    intent: "unknown",
    confidence: Math.min(base.confidence, 0.55),
    requiresHuman: true,
    nextAction: activeItems.some((item) => item.category === "support_policy") ? "ask_clarifying_question" : "handoff",
    reply: "ขอรายละเอียดเพิ่มเติมนิดครับ ต้องการสอบถามเรื่องสินค้า ราคา การใช้งาน หรือให้แอดมินติดต่อกลับครับ",
    summary: text.trim() ? `ยังไม่พบ active knowledge ที่ตรงกับ: ${text.trim().slice(0, 120)}` : "ยังไม่พบคำถามที่ชัดเจน",
    tags: Array.from(new Set([...base.tags, "knowledge-miss"])),
    reason: "No active knowledge matched the customer message.",
    matchedKnowledge: []
  });
}

export function applyAiDecisionPolicy(decision: AIDecision): AIDecision {
  const requiresHumanIntent = ["refund", "complaint", "human_request"].includes(decision.intent);
  const requiresHuman = decision.requiresHuman || requiresHumanIntent || decision.riskLevel === "high" || decision.confidence < 0.6;
  const nextAction: AINextAction = requiresHuman
    ? "handoff"
    : decision.confidence >= 0.85 && decision.riskLevel === "low"
      ? decision.nextAction === "auto_reply" ? "auto_reply" : "suggest_reply"
      : decision.confidence >= 0.6
        ? "suggest_reply"
        : "handoff";

  return {
    ...decision,
    requiresHuman,
    nextAction,
    priority: requiresHuman && decision.priority === "low" ? "medium" : decision.priority,
    tags: Array.from(new Set([
      ...decision.tags,
      ...(requiresHuman ? ["needs-human"] : []),
      decision.intent
    ])).slice(0, 8),
    matchedKnowledge: decision.matchedKnowledge ?? []
  };
}

export function parseAiDecisionWithFallback(value: unknown, reason = "AI output validation failed"): AIDecision {
  const parsed = aiDecisionSchema.safeParse(value);
  if (!parsed.success) {
    return createFallbackAiDecision(reason);
  }
  return applyAiDecisionPolicy(parsed.data);
}

export function createFallbackAiDecision(reason = "AI unavailable"): AIDecision {
  return {
    intent: "unknown",
    sentiment: "neutral",
    priority: "high",
    confidence: 0,
    riskLevel: "high",
    requiresHuman: true,
    nextAction: "handoff",
    reply: "เคสนี้ควรให้แอดมินตรวจสอบก่อนตอบครับ",
    summary: "AI analysis failed or is unavailable.",
    tags: ["needs-human", "ai-fallback"],
    reason,
    matchedKnowledge: []
  };
}

export function createMockAiDecision(text: string): AIDecision {
  const lower = text.toLowerCase();
  const refund = ["refund", "คืนเงิน", "ยกเลิก", "cancel"].some((word) => lower.includes(word));
  const complaint = ["complaint", "ร้องเรียน", "เสีย", "ผิด", "โกรธ", "แย่"].some((word) => lower.includes(word));
  const human = ["human", "agent", "แอดมิน", "คนจริง", "เจ้าหน้าที่"].some((word) => lower.includes(word));
  const pricing = ["price", "pricing", "ราคา", "แพ็กเกจ", "package"].some((word) => lower.includes(word));
  const appointment = ["appointment", "นัด", "จอง", "schedule"].some((word) => lower.includes(word));

  const intent: AIIntent = refund ? "refund" : complaint ? "complaint" : human ? "human_request" : pricing ? "pricing" : appointment ? "appointment" : "product_info";
  const risky = refund || complaint || human;

  return applyAiDecisionPolicy({
    intent,
    sentiment: complaint ? "negative" : "neutral",
    priority: risky ? "high" : pricing ? "medium" : "low",
    confidence: risky ? 0.93 : pricing ? 0.78 : 0.7,
    riskLevel: risky ? "high" : "low",
    requiresHuman: risky,
    nextAction: risky ? "handoff" : "suggest_reply",
    reply: risky
      ? "รับทราบครับ เดี๋ยวแอดมินตรวจสอบและติดต่อกลับโดยเร็วครับ"
      : "ขอบคุณที่ติดต่อเข้ามาครับ เดี๋ยวผมช่วยดูรายละเอียดและแนะนำขั้นตอนถัดไปให้ครับ",
    summary: text.trim() ? `Visitor asked about: ${text.trim().slice(0, 120)}` : "Visitor sent an empty or unclear message.",
    tags: ["ai-mock", intent],
    reason: "Generated by local mock AI policy because real OpenAI mode is disabled or unavailable.",
    matchedKnowledge: []
  });
}

export function shouldAutoSend(decision: AIDecision, mode: AiMode, _requireCitations = true) {
  if (!["auto_faq", "auto_sales", "ai_agent"].includes(mode)) {
    return false;
  }

  if (decision.requiresHuman || decision.riskLevel !== "low") {
    return false;
  }

  if (decision.confidence < 0.85) {
    return false;
  }

  return decision.nextAction === "auto_reply";
}

export function shouldHandoff(decision: AIDecision) {
  return decision.requiresHuman || decision.riskLevel === "high" || decision.confidence < 0.6;
}

function mergeMatchedKnowledge(primary: AIMatchedKnowledge[], secondary: AIMatchedKnowledge[]) {
  const byId = new Map<string, AIMatchedKnowledge>();
  [...primary, ...secondary].forEach((item) => byId.set(item.id, item));
  return Array.from(byId.values());
}

function tokenizeForKnowledge(value: string) {
  return normalizeKnowledgeText(value)
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);
}

function normalizeKnowledgeText(value: string) {
  return value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}
