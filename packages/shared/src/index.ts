import { z } from "zod";

export const platformSchema = z.enum(["webchat", "telegram", "line", "facebook", "instagram"]);
export type Platform = z.infer<typeof platformSchema>;

export const providerSandboxProviderSchema = z.enum(["line", "telegram", "facebook", "instagram"]);
export type ProviderSandboxProvider = z.infer<typeof providerSandboxProviderSchema>;

export type ProviderSandboxEnv = Record<string, string | undefined>;

export type ProviderSandboxAllowlistEntry = {
  provider: ProviderSandboxProvider | "all";
  recipientId: string;
};

export type ProviderSandboxValidationInput = {
  provider: ProviderSandboxProvider;
  recipientId: string;
  tenantId?: string | null;
  channelAccountTenantId?: string | null;
  env: ProviderSandboxEnv;
};

export type ProviderSandboxValidationResult = {
  allowed: boolean;
  reason:
    | "allowed"
    | "provider_outbound_disabled"
    | "provider_sandbox_disabled"
    | "provider_channel_mode_not_enabled"
    | "allowlist_required"
    | "recipient_not_allowlisted"
    | "tenant_ownership_required";
  gates: {
    outboundEnabled: boolean;
    sandboxEnabled: boolean;
    channelModeEnabled: boolean;
    allowlistConfigured: boolean;
    recipientAllowlisted: boolean;
    tenantScopedOwnership: boolean;
  };
};

export const providerSandboxProviders: ProviderSandboxProvider[] = ["line", "telegram", "facebook", "instagram"];

export const providerSandboxAllowlistEnvNames: Record<ProviderSandboxProvider, string> = {
  line: "LINE_SANDBOX_ALLOWLIST",
  telegram: "TELEGRAM_SANDBOX_ALLOWLIST",
  facebook: "FACEBOOK_SANDBOX_ALLOWLIST",
  instagram: "INSTAGRAM_SANDBOX_ALLOWLIST"
};

export function parseProviderSandboxAllowlist(env: ProviderSandboxEnv): ProviderSandboxAllowlistEntry[] {
  const entries: ProviderSandboxAllowlistEntry[] = [];

  for (const rawEntry of splitAllowlist(env.PROVIDER_SANDBOX_ALLOWLIST)) {
    const parsed = parseAllowlistEntry(rawEntry);
    if (parsed) entries.push(parsed);
  }

  for (const provider of providerSandboxProviders) {
    for (const recipientId of splitAllowlist(env[providerSandboxAllowlistEnvNames[provider]])) {
      entries.push({ provider, recipientId });
    }
  }

  return dedupeAllowlist(entries);
}

export function summarizeProviderSandboxAllowlist(env: ProviderSandboxEnv) {
  const entries = parseProviderSandboxAllowlist(env);
  const providerEntryCounts = Object.fromEntries(providerSandboxProviders.map((provider) => [
    provider,
    entries.filter((entry) => entry.provider === provider).length
  ])) as Record<ProviderSandboxProvider, number>;

  return {
    configured: entries.length > 0,
    entryCount: entries.length,
    globalEntryCount: entries.filter((entry) => entry.provider === "all").length,
    providers: providerSandboxProviders.map((provider) => ({
      name: provider,
      entryCount: providerEntryCounts[provider]
    }))
  };
}

export function isProviderSandboxRecipientAllowed(provider: ProviderSandboxProvider, recipientId: string, env: ProviderSandboxEnv) {
  const normalizedRecipient = recipientId.trim();
  if (!normalizedRecipient) return false;
  return parseProviderSandboxAllowlist(env).some((entry) =>
    (entry.provider === "all" || entry.provider === provider) && entry.recipientId === normalizedRecipient
  );
}

export function validateProviderSandboxOutbound(input: ProviderSandboxValidationInput): ProviderSandboxValidationResult {
  const outboundMode = normalizedEnv(input.env.PROVIDER_OUTBOUND_MODE, "disabled");
  const outboundEnabled = normalizedEnv(input.env.PROVIDER_OUTBOUND_ENABLED, "false") === "true" && (outboundMode === "real" || outboundMode === "sandbox");
  const sandboxEnabled = normalizedEnv(input.env.PROVIDER_SANDBOX_MODE, "disabled") === "enabled";
  const channelModeEnabled = providerChannelModeEnabled(input.provider, input.env);
  const allowlistConfigured = parseProviderSandboxAllowlist(input.env).length > 0;
  const recipientAllowlisted = isProviderSandboxRecipientAllowed(input.provider, input.recipientId, input.env);
  const tenantScopedOwnership = Boolean(
    input.tenantId?.trim() &&
    input.channelAccountTenantId?.trim() &&
    input.tenantId.trim() === input.channelAccountTenantId.trim()
  );
  const gates = {
    outboundEnabled,
    sandboxEnabled,
    channelModeEnabled,
    allowlistConfigured,
    recipientAllowlisted,
    tenantScopedOwnership
  };

  if (!outboundEnabled) return { allowed: false, reason: "provider_outbound_disabled", gates };
  if (!sandboxEnabled) return { allowed: false, reason: "provider_sandbox_disabled", gates };
  if (!channelModeEnabled) return { allowed: false, reason: "provider_channel_mode_not_enabled", gates };
  if (!allowlistConfigured) return { allowed: false, reason: "allowlist_required", gates };
  if (!recipientAllowlisted) return { allowed: false, reason: "recipient_not_allowlisted", gates };
  if (!tenantScopedOwnership) return { allowed: false, reason: "tenant_ownership_required", gates };
  return { allowed: true, reason: "allowed", gates };
}

function splitAllowlist(value: string | undefined) {
  return (value ?? "")
    .split(/[,\n]/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

function parseAllowlistEntry(value: string): ProviderSandboxAllowlistEntry | null {
  const separator = value.indexOf(":");
  if (separator === -1) {
    return { provider: "all", recipientId: value };
  }

  const provider = value.slice(0, separator).trim().toLowerCase();
  const recipientId = value.slice(separator + 1).trim();
  if (!providerSandboxProviderSchema.safeParse(provider).success || !recipientId) {
    return null;
  }

  return { provider: provider as ProviderSandboxProvider, recipientId };
}

function dedupeAllowlist(entries: ProviderSandboxAllowlistEntry[]) {
  const seen = new Set<string>();
  const deduped: ProviderSandboxAllowlistEntry[] = [];
  for (const entry of entries) {
    const key = `${entry.provider}:${entry.recipientId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(entry);
  }
  return deduped;
}

function providerChannelModeEnabled(provider: ProviderSandboxProvider, env: ProviderSandboxEnv) {
  const mode = provider === "facebook" || provider === "instagram"
    ? normalizedEnv(env.META_CHANNEL_MODE ?? env.CHANNEL_MODE, "mock")
    : normalizedEnv(env.CHANNEL_MODE, "mock");
  return mode === "real" || mode === "sandbox";
}

function normalizedEnv(value: string | undefined, fallback: string) {
  const trimmed = value?.trim().toLowerCase();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
}

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
  tenantId: z.string().min(1),
  conversationId: z.string().min(1),
  contactId: z.string().min(1),
  customerId: z.string().min(1),
  platform: platformSchema,
  channelAccountId: z.string().min(1),
  roomId: z.string().min(1),
  body: z.string().min(1),
  visibility: internalNoteVisibilitySchema,
  createdBy: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  pinned: z.boolean().default(false),
  externalCalls: z.literal(0).default(0)
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
  tenantId: z.string().min(1).optional(),
  conversationId: z.string().min(1).optional(),
  contactId: z.string().min(1),
  customerId: z.string().min(1).optional(),
  platform: platformSchema.optional(),
  channelAccountId: z.string().min(1).optional(),
  roomId: z.string().min(1).optional(),
  body: z.string().min(1),
  createdBy: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
  externalCalls: z.literal(0).default(0).optional()
}).strict();
export type ContactNote = z.infer<typeof contactNoteSchema>;

export const contactTaskSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1).optional(),
  conversationId: z.string().min(1).optional(),
  contactId: z.string().min(1),
  platform: platformSchema.optional(),
  channelAccountId: z.string().min(1).optional(),
  roomId: z.string().min(1).optional(),
  title: z.string().min(1),
  status: contactTaskStatusSchema,
  assigneeUserId: z.string().nullable().optional(),
  dueAt: z.string().datetime().nullable().optional(),
  completedAt: z.string().datetime().nullable().optional(),
  ownerAgent: z.string().min(1).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
  externalCalls: z.literal(0).default(0).optional()
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
  doNotContact: z.boolean().default(false),
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

export const updateCustomer360ProfileRequestSchema = updateContactRequestSchema.extend({
  contactId: z.string().min(1).optional(),
  customerId: z.string().min(1).optional()
}).strict();
export type UpdateCustomer360ProfileRequest = z.input<typeof updateCustomer360ProfileRequestSchema>;

export const updateCustomer360ConsentRequestSchema = z.object({
  contactId: z.string().min(1).optional(),
  customerId: z.string().min(1).optional(),
  optOut: z.boolean().optional(),
  doNotContact: z.boolean().optional()
}).strict().refine((value) => value.optOut !== undefined || value.doNotContact !== undefined, {
  message: "Provide optOut or doNotContact"
});
export type UpdateCustomer360ConsentRequest = z.input<typeof updateCustomer360ConsentRequestSchema>;

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

export const broadcastCampaignStatusSchema = z.enum([
  "draft",
  "pending_approval",
  "approved",
  "rejected",
  "scheduled",
  "sending",
  "sent",
  "paused",
  "archived",
  "cancelled",
  "failed"
]);
export type BroadcastCampaignStatus = z.infer<typeof broadcastCampaignStatusSchema>;

export const broadcastScheduleTypeSchema = z.enum(["now", "scheduled"]);
export type BroadcastScheduleType = z.infer<typeof broadcastScheduleTypeSchema>;

export const broadcastApprovalActionSchema = z.enum(["request_approval", "approve", "reject", "cancel_approval", "schedule"]);
export type BroadcastApprovalAction = z.infer<typeof broadcastApprovalActionSchema>;

export const broadcastApprovalStatusSchema = z.enum(["draft", "pending_approval", "approved", "rejected", "cancelled"]);
export type BroadcastApprovalStatus = z.infer<typeof broadcastApprovalStatusSchema>;

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
  approvalStatus: broadcastApprovalStatusSchema.optional(),
  approvalRequestedAt: z.string().datetime().nullable().optional(),
  approvalReviewedAt: z.string().datetime().nullable().optional(),
  approvalReviewedBy: z.string().min(1).nullable().optional(),
  approvalNote: z.string().nullable().optional(),
  lastWorkflowAction: broadcastApprovalActionSchema.optional(),
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

export const broadcastSafeDeliveryStatusValues = [
  "previewed",
  "dry_run",
  "suppressed",
  "blocked",
  "queued_mock",
  "mock_sent",
  "sent_mock",
  "skipped",
  "skipped_mock",
  "failed_mock",
  "failed_safe",
  "unknown_safe"
] as const;

export const broadcastRecipientStatusSchema = z.enum(["pending", ...broadcastSafeDeliveryStatusValues]);
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

export const broadcastDeliveryEventStatusSchema = z.enum(broadcastSafeDeliveryStatusValues);
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
  limit: z.coerce.number().int().positive().max(500).default(100)
}).strict();
export type BroadcastAudiencePreviewRequest = z.input<typeof broadcastAudiencePreviewRequestSchema>;

export const broadcastSuppressionReasonSchema = z.enum([
  "do_not_contact",
  "marketing_opt_out",
  "consent_missing",
  "consent_revoked",
  "unknown_unsafe"
]);
export type BroadcastSuppressionReason = z.infer<typeof broadcastSuppressionReasonSchema>;

export const broadcastAudiencePreviewRecipientSchema = z.object({
  tenantId: z.string().min(1).optional(),
  campaignId: z.string().min(1).optional(),
  customerId: z.string().min(1).optional(),
  contactId: z.string().min(1),
  contactIdentityId: z.string().min(1).nullable(),
  conversationId: z.string().min(1).nullable().optional(),
  displayName: z.string().min(1),
  platform: platformSchema,
  channelAccountId: z.string().min(1).nullable(),
  roomId: z.string().min(1).nullable().optional(),
  externalUserId: z.string().min(1).nullable(),
  tags: z.array(z.string().min(1)).default([]),
  leadStatus: z.string().min(1),
  reason: z.string().nullable().optional(),
  renderedMessage: z.string(),
  externalCalls: z.literal(0).default(0).optional()
}).strict();
export type BroadcastAudiencePreviewRecipient = z.infer<typeof broadcastAudiencePreviewRecipientSchema>;

export const broadcastSuppressedRecipientSchema = z.object({
  tenantId: z.string().min(1),
  campaignId: z.string().min(1).optional(),
  customerId: z.string().min(1).optional(),
  contactId: z.string().min(1).optional(),
  displayName: z.string().min(1).optional(),
  conversationId: z.string().min(1).nullable().optional(),
  platform: platformSchema,
  channelAccountId: z.string().min(1).nullable(),
  roomId: z.string().min(1).nullable().optional(),
  reason: broadcastSuppressionReasonSchema,
  externalCalls: z.literal(0).default(0)
}).strict();
export type BroadcastSuppressedRecipient = z.infer<typeof broadcastSuppressedRecipientSchema>;

export const broadcastComplianceLogSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  campaignId: z.string().min(1).nullable(),
  customerId: z.string().min(1).nullable(),
  contactId: z.string().min(1).nullable(),
  conversationId: z.string().min(1).nullable(),
  platform: platformSchema,
  channelAccountId: z.string().min(1).nullable(),
  roomId: z.string().min(1).nullable(),
  reason: broadcastSuppressionReasonSchema,
  action: z.string().min(1),
  createdAt: z.string().datetime(),
  externalCalls: z.literal(0)
}).strict();
export type BroadcastComplianceLog = z.infer<typeof broadcastComplianceLogSchema>;

export const broadcastComplianceFiltersSchema = z.object({
  campaignId: z.string().min(1).optional(),
  reason: broadcastSuppressionReasonSchema.optional(),
  platform: platformSchema.optional(),
  channelAccountId: z.string().min(1).optional(),
  roomId: z.string().min(1).optional(),
  conversationId: z.string().min(1).optional(),
  customerId: z.string().min(1).optional(),
  contactId: z.string().min(1).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  limit: z.coerce.number().int().positive().max(200).default(50),
  offset: z.coerce.number().int().nonnegative().default(0)
}).strict();
export type BroadcastComplianceFilters = z.input<typeof broadcastComplianceFiltersSchema>;

export const broadcastComplianceLogPageSchema = z.object({
  items: z.array(broadcastComplianceLogSchema).default([]),
  limit: z.number().int().positive(),
  offset: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
  nextOffset: z.number().int().nonnegative().nullable(),
  externalCalls: z.literal(0)
}).strict();
export type BroadcastComplianceLogPage = z.infer<typeof broadcastComplianceLogPageSchema>;

export const broadcastAudiencePreviewResultSchema = z.object({
  campaignId: z.string().min(1),
  total: z.number().int().nonnegative(),
  candidateCount: z.number().int().nonnegative().optional(),
  eligibleCount: z.number().int().nonnegative().optional(),
  suppressedCount: z.number().int().nonnegative().optional(),
  blockedCount: z.number().int().nonnegative().optional(),
  invalidCount: z.number().int().nonnegative().optional(),
  suppressedByReason: z.record(z.string(), z.number().int().nonnegative()).optional(),
  externalCalls: z.literal(0).default(0).optional(),
  recipients: z.array(broadcastAudiencePreviewRecipientSchema).default([]),
  suppressedRecipients: z.array(broadcastSuppressedRecipientSchema).default([]).optional(),
  invalidRecipients: z.array(broadcastAudiencePreviewRecipientSchema).default([]).optional()
}).strict();
export type BroadcastAudiencePreviewResult = z.infer<typeof broadcastAudiencePreviewResultSchema>;

export const scheduleBroadcastCampaignRequestSchema = z.object({
  scheduleAt: z.string().datetime()
}).strict();
export type ScheduleBroadcastCampaignRequest = z.input<typeof scheduleBroadcastCampaignRequestSchema>;

export const broadcastApprovalRequestSchema = z.object({
  note: z.string().max(500).optional()
}).strict().default({});
export type BroadcastApprovalRequest = z.input<typeof broadcastApprovalRequestSchema>;

export const broadcastSendTestRequestSchema = z.object({
  contactId: z.string().min(1).nullable().optional(),
  contactIdentityId: z.string().min(1).nullable().optional(),
  platform: platformSchema.optional(),
  payloadJson: z.unknown().optional()
}).strict().default({});
export type BroadcastSendTestRequest = z.input<typeof broadcastSendTestRequestSchema>;

export const broadcastSendLogStatusSchema = z.enum(broadcastSafeDeliveryStatusValues);
export type BroadcastSendLogStatus = z.infer<typeof broadcastSendLogStatusSchema>;

export const broadcastSendLogSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  campaignId: z.string().min(1),
  customerId: z.string().min(1).nullable().optional(),
  contactId: z.string().min(1).nullable(),
  contactIdentityId: z.string().min(1).nullable(),
  conversationId: z.string().min(1).nullable().optional(),
  platform: platformSchema,
  channelAccountId: z.string().min(1).nullable(),
  roomId: z.string().min(1).nullable().optional(),
  status: broadcastSendLogStatusSchema,
  reason: z.string().nullable(),
  externalCalls: z.literal(0).default(0),
  timestamp: z.string().datetime(),
  createdAt: z.string().datetime(),
  payloadJson: z.unknown().nullable().optional()
}).strict();
export type BroadcastSendLog = z.infer<typeof broadcastSendLogSchema>;

export const broadcastSendLogFiltersSchema = z.object({
  campaignId: z.string().min(1).optional(),
  status: broadcastSendLogStatusSchema.optional(),
  platform: platformSchema.optional(),
  channelAccountId: z.string().min(1).optional(),
  roomId: z.string().min(1).optional(),
  conversationId: z.string().min(1).optional(),
  customerId: z.string().min(1).optional(),
  contactId: z.string().min(1).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  limit: z.coerce.number().int().positive().max(200).default(50),
  offset: z.coerce.number().int().nonnegative().default(0)
}).strict();
export type BroadcastSendLogFilters = z.input<typeof broadcastSendLogFiltersSchema>;

export const broadcastSendLogPageSchema = z.object({
  items: z.array(broadcastSendLogSchema).default([]),
  limit: z.number().int().positive(),
  offset: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
  nextOffset: z.number().int().nonnegative().nullable(),
  externalCalls: z.literal(0)
}).strict();
export type BroadcastSendLogPage = z.infer<typeof broadcastSendLogPageSchema>;

export const broadcastDeliveryFilterSnapshotSchema = z.object({
  campaignId: z.string().min(1),
  status: broadcastSendLogStatusSchema.nullable().default(null),
  platform: platformSchema.nullable().default(null),
  channelAccountId: z.string().min(1).nullable().default(null),
  roomId: z.string().min(1).nullable().default(null),
  conversationId: z.string().min(1).nullable().default(null),
  customerId: z.string().min(1).nullable().default(null),
  contactId: z.string().min(1).nullable().default(null),
  from: z.string().datetime().nullable().default(null),
  to: z.string().datetime().nullable().default(null)
}).strict();
export type BroadcastDeliveryFilterSnapshot = z.infer<typeof broadcastDeliveryFilterSnapshotSchema>;

export const broadcastCampaignDeliverySummarySchema = z.object({
  total: z.number().int().nonnegative(),
  previewed: z.number().int().nonnegative().default(0),
  dryRun: z.number().int().nonnegative().default(0),
  suppressed: z.number().int().nonnegative().default(0),
  blocked: z.number().int().nonnegative().default(0),
  queuedMock: z.number().int().nonnegative().default(0),
  mockSent: z.number().int().nonnegative().default(0),
  sentMock: z.number().int().nonnegative().default(0),
  skippedMock: z.number().int().nonnegative().default(0),
  failedMock: z.number().int().nonnegative().default(0),
  failedSafe: z.number().int().nonnegative().default(0),
  unknownSafe: z.number().int().nonnegative().default(0),
  externalCalls: z.literal(0)
}).strict();
export type BroadcastCampaignDeliverySummary = z.infer<typeof broadcastCampaignDeliverySummarySchema>;

export const broadcastAnalyticsCountsSchema = z.object({
  total: z.number().int().nonnegative(),
  queued: z.number().int().nonnegative(),
  pending: z.number().int().nonnegative(),
  sent: z.number().int().nonnegative(),
  delivered: z.number().int().nonnegative(),
  providerSuccess: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
  suppressed: z.number().int().nonnegative(),
  skipped: z.number().int().nonnegative(),
  blocked: z.number().int().nonnegative(),
  unknownSafe: z.number().int().nonnegative(),
  externalCalls: z.literal(0)
}).strict();
export type BroadcastAnalyticsCounts = z.infer<typeof broadcastAnalyticsCountsSchema>;

export const broadcastAnalyticsContextSchema = z.object({
  platform: platformSchema,
  channelAccountId: z.string().min(1).nullable(),
  roomId: z.string().min(1).nullable(),
  total: z.number().int().nonnegative(),
  queued: z.number().int().nonnegative(),
  pending: z.number().int().nonnegative(),
  sent: z.number().int().nonnegative(),
  delivered: z.number().int().nonnegative(),
  providerSuccess: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
  suppressed: z.number().int().nonnegative(),
  skipped: z.number().int().nonnegative(),
  blocked: z.number().int().nonnegative(),
  unknownSafe: z.number().int().nonnegative()
}).strict();
export type BroadcastAnalyticsContext = z.infer<typeof broadcastAnalyticsContextSchema>;

export const broadcastCampaignAnalyticsSchema = z.object({
  tenantId: z.string().min(1),
  campaignId: z.string().min(1),
  campaignName: z.string().min(1),
  status: broadcastCampaignStatusSchema,
  generatedAt: z.string().datetime(),
  filters: broadcastDeliveryFilterSnapshotSchema,
  counts: broadcastAnalyticsCountsSchema,
  deliverySummary: broadcastCampaignDeliverySummarySchema,
  contexts: z.array(broadcastAnalyticsContextSchema).default([]),
  externalCalls: z.literal(0)
}).strict();
export type BroadcastCampaignAnalytics = z.infer<typeof broadcastCampaignAnalyticsSchema>;

export const broadcastDeliveryExportRowSchema = z.object({
  tenantId: z.string().min(1),
  campaignId: z.string().min(1),
  customerId: z.string().min(1).nullable(),
  contactId: z.string().min(1).nullable(),
  contactIdentityId: z.string().min(1).nullable(),
  conversationId: z.string().min(1).nullable(),
  platform: platformSchema,
  channelAccountId: z.string().min(1).nullable(),
  roomId: z.string().min(1).nullable(),
  status: broadcastSendLogStatusSchema,
  errorCategory: z.string().min(1).nullable(),
  errorMessage: z.string().min(1).nullable(),
  timestamp: z.string().datetime(),
  createdAt: z.string().datetime(),
  externalCalls: z.literal(0)
}).strict();
export type BroadcastDeliveryExportRow = z.infer<typeof broadcastDeliveryExportRowSchema>;

export const broadcastDeliveryExportSchema = z.object({
  tenantId: z.string().min(1),
  campaignId: z.string().min(1),
  generatedAt: z.string().datetime(),
  filters: broadcastDeliveryFilterSnapshotSchema,
  rowCount: z.number().int().nonnegative(),
  rows: z.array(broadcastDeliveryExportRowSchema).default([]),
  externalCalls: z.literal(0)
}).strict();
export type BroadcastDeliveryExport = z.infer<typeof broadcastDeliveryExportSchema>;

export const broadcastCampaignDetailSchema = z.object({
  campaignId: z.string().min(1),
  name: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  status: broadcastCampaignStatusSchema,
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  scheduledAt: z.string().datetime().nullable().optional(),
  scheduleAt: z.string().datetime().nullable().optional(),
  approvalStatus: broadcastApprovalStatusSchema.optional(),
  approvalRequestedAt: z.string().datetime().nullable().optional(),
  approvalReviewedAt: z.string().datetime().nullable().optional(),
  approvalReviewedBy: z.string().min(1).nullable().optional(),
  approvalNote: z.string().nullable().optional(),
  lastWorkflowAction: broadcastApprovalActionSchema.optional(),
  audienceCount: z.number().int().nonnegative().nullable().optional(),
  suppressionCount: z.number().int().nonnegative().optional(),
  deliverySummary: broadcastCampaignDeliverySummarySchema.optional(),
  externalCalls: z.literal(0)
}).strict();
export type BroadcastCampaignDetail = z.infer<typeof broadcastCampaignDetailSchema>;

export const broadcastSendResultSchema = z.object({
  campaignId: z.string().min(1),
  created: z.number().int().nonnegative(),
  sentMock: z.number().int().nonnegative(),
  queuedMock: z.number().int().nonnegative(),
  skippedMock: z.number().int().nonnegative(),
  failedMock: z.number().int().nonnegative(),
  candidateCount: z.number().int().nonnegative().optional(),
  eligibleCount: z.number().int().nonnegative().optional(),
  suppressedCount: z.number().int().nonnegative().optional(),
  suppressedByReason: z.record(z.string(), z.number().int().nonnegative()).optional(),
  suppressedRecipients: z.array(broadcastSuppressedRecipientSchema).default([]).optional(),
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

export const applyBroadcastSegmentRequestSchema = z.object({
  segmentId: z.string().min(1).nullable()
}).strict();
export type ApplyBroadcastSegmentRequest = z.input<typeof applyBroadcastSegmentRequestSchema>;

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

export const providerReadinessProviderStatusSchema = z.enum([
  "disabled_by_default",
  "blocked_sandbox_required",
  "blocked_channel_mode_required",
  "blocked_allowlist_required",
  "sandbox_ready_recipient_check_required"
]);
export type ProviderReadinessProviderStatus = z.infer<typeof providerReadinessProviderStatusSchema>;

export const providerConfigurationStatusSchema = z.enum(["configured", "not_configured"]);
export type ProviderConfigurationStatus = z.infer<typeof providerConfigurationStatusSchema>;

export const providerWebhookSignatureStatusSchema = z.enum(["verified", "failed", "missing", "skipped"]);
export type ProviderWebhookSignatureStatus = z.infer<typeof providerWebhookSignatureStatusSchema>;

export const providerWebhookReplayStatusSchema = z.enum(["fresh", "duplicate", "replay-blocked"]);
export type ProviderWebhookReplayStatus = z.infer<typeof providerWebhookReplayStatusSchema>;

export const providerWebhookNormalizationStatusSchema = z.enum([
  "normalized",
  "skipped",
  "failed",
  "blocked-signature",
  "blocked-replay",
  "unsupported"
]);
export type ProviderWebhookNormalizationStatus = z.infer<typeof providerWebhookNormalizationStatusSchema>;

export const providerWebhookNormalizedEventTypeSchema = z.enum(["message", "delivery", "follow", "postback", "unknown"]);
export type ProviderWebhookNormalizedEventType = z.infer<typeof providerWebhookNormalizedEventTypeSchema>;

export const providerWebhookMessageTypeSchema = z.enum(["text", "image", "file", "sticker", "unknown"]);
export type ProviderWebhookMessageType = z.infer<typeof providerWebhookMessageTypeSchema>;

export const providerWebhookRoutingStatusSchema = z.enum([
  "dry-run-only",
  "matched",
  "blocked-signature",
  "blocked-replay",
  "unsupported",
  "skipped"
]);
export type ProviderWebhookRoutingStatus = z.infer<typeof providerWebhookRoutingStatusSchema>;

export const providerWebhookConversationLookupStatusSchema = z.enum(["matched", "not-found", "skipped"]);
export type ProviderWebhookConversationLookupStatus = z.infer<typeof providerWebhookConversationLookupStatusSchema>;

export const providerWebhookInboundPersistenceModeSchema = z.enum(["dry-run", "sandbox-persist"]);
export type ProviderWebhookInboundPersistenceMode = z.infer<typeof providerWebhookInboundPersistenceModeSchema>;

export const providerWebhookInboundPersistenceStatusSchema = z.enum([
  "dry-run-only",
  "persisted",
  "skipped",
  "skipped-no-match",
  "blocked-signature",
  "blocked-replay",
  "unsupported",
  "failed"
]);
export type ProviderWebhookInboundPersistenceStatus = z.infer<typeof providerWebhookInboundPersistenceStatusSchema>;

export const providerWebhookInboundAuditStatusSchema = z.enum(["recorded", "skipped", "failed"]);
export type ProviderWebhookInboundAuditStatus = z.infer<typeof providerWebhookInboundAuditStatusSchema>;

export const providerWebhookUnmatchedInboundStatusSchema = z.enum([
  "open",
  "review-needed",
  "reviewed",
  "blocked",
  "skipped",
  "linked",
  "duplicate-skipped"
]);
export type ProviderWebhookUnmatchedInboundStatus = z.infer<typeof providerWebhookUnmatchedInboundStatusSchema>;

export const providerWebhookUnmatchedReviewStatusSchema = z.enum(["pending", "reviewed", "skipped", "linked"]);
export type ProviderWebhookUnmatchedReviewStatus = z.infer<typeof providerWebhookUnmatchedReviewStatusSchema>;

export const providerWebhookUnmatchedReviewActionStatusSchema = z.enum(["none", "reviewed", "skipped"]);
export type ProviderWebhookUnmatchedReviewActionStatus = z.infer<typeof providerWebhookUnmatchedReviewActionStatusSchema>;

export const providerWebhookUnmatchedLinkStatusSchema = z.enum(["none", "rejected", "linked", "linked-message-persisted", "duplicate-noop"]);
export type ProviderWebhookUnmatchedLinkStatus = z.infer<typeof providerWebhookUnmatchedLinkStatusSchema>;

export const providerWebhookReviewAssignmentOperationSchema = z.enum(["ASSIGN_TO_ME", "ASSIGN_TO_OPERATOR", "UNASSIGN"]);
export type ProviderWebhookReviewAssignmentOperation = z.infer<typeof providerWebhookReviewAssignmentOperationSchema>;

export const providerWebhookReviewAssignmentStatusSchema = z.enum(["unassigned", "assigned"]);
export type ProviderWebhookReviewAssignmentStatus = z.infer<typeof providerWebhookReviewAssignmentStatusSchema>;

export const providerWebhookReviewAssignmentStatusFilterSchema = z.enum(["unassigned", "assigned", "assigned_to_me", "assigned_to_others"]);
export type ProviderWebhookReviewAssignmentStatusFilter = z.infer<typeof providerWebhookReviewAssignmentStatusFilterSchema>;

export const providerWebhookReviewEscalationOperationSchema = z.enum(["ESCALATE", "CLEAR_ESCALATION"]);
export type ProviderWebhookReviewEscalationOperation = z.infer<typeof providerWebhookReviewEscalationOperationSchema>;

export const providerWebhookReviewEscalationStatusSchema = z.enum(["none", "escalated"]);
export type ProviderWebhookReviewEscalationStatus = z.infer<typeof providerWebhookReviewEscalationStatusSchema>;

export const providerWebhookReviewEscalationReasonSchema = z.enum([
  "SLA_RISK",
  "NO_SAFE_CANDIDATE",
  "ROUTING_FAILED",
  "HIGH_PRIORITY_CUSTOMER",
  "NEEDS_MANAGER_REVIEW",
  "MANUAL_REVIEW_BLOCKED"
]);
export type ProviderWebhookReviewEscalationReason = z.infer<typeof providerWebhookReviewEscalationReasonSchema>;

export const providerWebhookReviewResolutionOperationSchema = z.enum(["SET_RESOLUTION", "CLEAR_RESOLUTION"]);
export type ProviderWebhookReviewResolutionOperation = z.infer<typeof providerWebhookReviewResolutionOperationSchema>;

export const providerWebhookReviewResolutionStatusSchema = z.enum(["unresolved", "resolved"]);
export type ProviderWebhookReviewResolutionStatus = z.infer<typeof providerWebhookReviewResolutionStatusSchema>;

export const providerWebhookReviewResolutionOutcomeSchema = z.enum([
  "NEEDS_REVIEW",
  "REVIEWED_NO_MATCH",
  "REVIEWED_SAFE_MATCH",
  "LINKED_EXISTING_CONVERSATION",
  "LINKED_AND_PERSISTED_SAFE_MESSAGE",
  "SKIPPED_DUPLICATE",
  "SKIPPED_SPAM",
  "SKIPPED_UNSUPPORTED_EVENT",
  "ESCALATED_TO_MANAGER",
  "BLOCKED_UNSAFE",
  "ROUTING_FAILED",
  "MANUAL_REVIEW_REQUIRED"
]);
export type ProviderWebhookReviewResolutionOutcome = z.infer<typeof providerWebhookReviewResolutionOutcomeSchema>;

export const providerWebhookReviewClosureChecklistOperationSchema = z.enum(["COMPLETE_STEP", "UNCOMPLETE_STEP", "RESET_CHECKLIST"]);
export type ProviderWebhookReviewClosureChecklistOperation = z.infer<typeof providerWebhookReviewClosureChecklistOperationSchema>;

export const providerWebhookReviewClosureChecklistStepSchema = z.enum([
  "VIEWED_DIAGNOSTICS",
  "REVIEWED_HISTORY",
  "REVIEWED_TRIAGE_GUIDANCE",
  "REVIEWED_CANDIDATES",
  "CONFIRMED_NO_RAW_LEAKAGE",
  "CONFIRMED_NO_PROVIDER_OUTBOUND",
  "CONFIRMED_ASSIGNMENT_OR_ESCALATION",
  "CONFIRMED_SAFE_LINK_TARGET",
  "CONFIRMED_OPERATOR_NOTE"
]);
export type ProviderWebhookReviewClosureChecklistStep = z.infer<typeof providerWebhookReviewClosureChecklistStepSchema>;

export const providerWebhookReviewClosureReadinessSchema = z.enum([
  "NOT_READY",
  "READY_FOR_REVIEW",
  "READY_FOR_SKIP",
  "READY_FOR_LINK",
  "READY_FOR_LINK_AND_PERSIST",
  "ALREADY_REVIEWED",
  "BLOCKED"
]);
export type ProviderWebhookReviewClosureReadiness = z.infer<typeof providerWebhookReviewClosureReadinessSchema>;

export const providerWebhookReviewRecommendedNextActionSchema = z.enum([
  "OPEN_DIAGNOSTICS",
  "VIEW_HISTORY",
  "RUN_CANDIDATE_LOOKUP",
  "ADD_OPERATOR_NOTE",
  "ASSIGN_OWNER",
  "ESCALATE",
  "CLEAR_ESCALATION",
  "MARK_REVIEWED",
  "SKIP",
  "LINK_ONLY",
  "LINK_AND_PERSIST_SAFE_MESSAGE"
]);
export type ProviderWebhookReviewRecommendedNextAction = z.infer<typeof providerWebhookReviewRecommendedNextActionSchema>;

export const providerWebhookEventTypeSchema = z.enum(["message.created", "webhook.verified", "webhook.failed"]);
export type ProviderWebhookEventType = z.infer<typeof providerWebhookEventTypeSchema>;

export const providerWebhookReviewAlertSeveritySchema = z.enum(["info", "warning", "critical"]);
export type ProviderWebhookReviewAlertSeverity = z.infer<typeof providerWebhookReviewAlertSeveritySchema>;

export const providerWebhookReviewTriageLaneSchema = z.enum([
  "critical_stale_open",
  "warning_stale_open",
  "candidate_lookup_recommended",
  "safe_link_candidate_available",
  "needs_manual_review",
  "recently_reviewed",
  "skipped_ignored",
  "failed_routing_missing_match"
]);
export type ProviderWebhookReviewTriageLane = z.infer<typeof providerWebhookReviewTriageLaneSchema>;

export const providerWebhookUnmatchedInboundStatusFilterSchema = z.enum(["open", "reviewed", "blocked", "skipped", "linked"]).optional();
export type ProviderWebhookUnmatchedInboundStatusFilter = z.infer<typeof providerWebhookUnmatchedInboundStatusFilterSchema>;

const providerWebhookReceivedAtFilterSchema = z.string().trim().min(1).refine((value) => !Number.isNaN(new Date(value).getTime()), "Invalid date filter");
export const providerWebhookUnmatchedInboundSortBySchema = z.enum(["receivedAt"]);
export type ProviderWebhookUnmatchedInboundSortBy = z.infer<typeof providerWebhookUnmatchedInboundSortBySchema>;

export const providerWebhookUnmatchedInboundSortOrderSchema = z.enum(["asc", "desc"]);
export type ProviderWebhookUnmatchedInboundSortOrder = z.infer<typeof providerWebhookUnmatchedInboundSortOrderSchema>;

export const providerWebhookUnmatchedInboundFiltersSchema = z.object({
  provider: providerSandboxProviderSchema.optional(),
  reviewStatus: providerWebhookUnmatchedReviewStatusSchema.optional(),
  linkStatus: providerWebhookUnmatchedLinkStatusSchema.optional(),
  unmatchedStatus: providerWebhookUnmatchedInboundStatusSchema.optional(),
  status: providerWebhookUnmatchedInboundStatusFilterSchema,
  eventType: providerWebhookEventTypeSchema.optional(),
  assignedTo: z.string().trim().min(1).max(80).optional(),
  assignmentStatus: providerWebhookReviewAssignmentStatusFilterSchema.optional(),
  escalationStatus: providerWebhookReviewEscalationStatusSchema.optional(),
  escalationReason: providerWebhookReviewEscalationReasonSchema.optional(),
  severity: providerWebhookReviewAlertSeveritySchema.optional(),
  triageLane: providerWebhookReviewTriageLaneSchema.optional(),
  resolutionStatus: providerWebhookReviewResolutionStatusSchema.optional(),
  resolutionOutcome: providerWebhookReviewResolutionOutcomeSchema.optional(),
  closureReadiness: providerWebhookReviewClosureReadinessSchema.optional(),
  checklistIncomplete: z.union([z.boolean(), z.enum(["true", "false"])]).transform((value) => value === true || value === "true").optional(),
  receivedFrom: providerWebhookReceivedAtFilterSchema.optional(),
  receivedTo: providerWebhookReceivedAtFilterSchema.optional(),
  receivedAtFrom: providerWebhookReceivedAtFilterSchema.optional(),
  receivedAtTo: providerWebhookReceivedAtFilterSchema.optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
  offset: z.coerce.number().int().min(0).max(5000).optional(),
  sortBy: providerWebhookUnmatchedInboundSortBySchema.optional(),
  sortOrder: providerWebhookUnmatchedInboundSortOrderSchema.optional()
}).strict();
export type ProviderWebhookUnmatchedInboundFilters = z.infer<typeof providerWebhookUnmatchedInboundFiltersSchema>;

export const providerWebhookReviewMetricsFiltersSchema = providerWebhookUnmatchedInboundFiltersSchema
  .pick({
    provider: true,
    reviewStatus: true,
    linkStatus: true,
    unmatchedStatus: true,
    status: true,
    eventType: true,
    assignedTo: true,
    assignmentStatus: true,
    escalationStatus: true,
    escalationReason: true,
    resolutionStatus: true,
    resolutionOutcome: true,
    closureReadiness: true,
    checklistIncomplete: true,
    receivedFrom: true,
    receivedTo: true,
    receivedAtFrom: true,
    receivedAtTo: true
  })
  .strip();
export type ProviderWebhookReviewMetricsFilters = z.infer<typeof providerWebhookReviewMetricsFiltersSchema>;

export const providerWebhookReviewAlertsFiltersSchema = providerWebhookReviewMetricsFiltersSchema
  .extend({
    severity: providerWebhookReviewAlertSeveritySchema.optional()
  })
  .strip();
export type ProviderWebhookReviewAlertsFilters = z.infer<typeof providerWebhookReviewAlertsFiltersSchema>;

export const providerWebhookTriageRecommendedActionSchema = z.enum([
  "OPEN_DIAGNOSTICS",
  "VIEW_HISTORY",
  "RUN_CANDIDATE_LOOKUP",
  "APPLY_FILTER",
  "MARK_REVIEWED",
  "SKIP",
  "LINK_ONLY",
  "LINK_AND_PERSIST_SAFE_MESSAGE"
]);
export type ProviderWebhookTriageRecommendedAction = z.infer<typeof providerWebhookTriageRecommendedActionSchema>;

export const providerWebhookReviewTriageFiltersSchema = providerWebhookReviewAlertsFiltersSchema
  .extend({
    triageLane: providerWebhookReviewTriageLaneSchema.optional()
  })
  .strip();
export type ProviderWebhookReviewTriageFilters = z.infer<typeof providerWebhookReviewTriageFiltersSchema>;

export const providerWebhookReviewSavedViewFiltersSchema = z.object({
  provider: providerSandboxProviderSchema.optional(),
  reviewStatus: providerWebhookUnmatchedReviewStatusSchema.optional(),
  linkStatus: providerWebhookUnmatchedLinkStatusSchema.optional(),
  unmatchedStatus: providerWebhookUnmatchedInboundStatusSchema.optional(),
  eventType: providerWebhookEventTypeSchema.optional(),
  severity: providerWebhookReviewAlertSeveritySchema.optional(),
  triageLane: providerWebhookReviewTriageLaneSchema.optional(),
  assignedTo: z.string().trim().min(1).max(80).optional(),
  assignmentStatus: providerWebhookReviewAssignmentStatusFilterSchema.optional(),
  escalationStatus: providerWebhookReviewEscalationStatusSchema.optional(),
  escalationReason: providerWebhookReviewEscalationReasonSchema.optional(),
  resolutionStatus: providerWebhookReviewResolutionStatusSchema.optional(),
  resolutionOutcome: providerWebhookReviewResolutionOutcomeSchema.optional(),
  closureReadiness: providerWebhookReviewClosureReadinessSchema.optional(),
  checklistIncomplete: z.union([z.boolean(), z.enum(["true", "false"])]).transform((value) => value === true || value === "true").optional(),
  receivedAtFrom: providerWebhookReceivedAtFilterSchema.optional(),
  receivedAtTo: providerWebhookReceivedAtFilterSchema.optional(),
  pageSize: z.coerce.number().int().min(1).max(50).optional()
}).strict();
export type ProviderWebhookReviewSavedViewFilters = z.infer<typeof providerWebhookReviewSavedViewFiltersSchema>;

export const providerWebhookReviewSavedViewSortSchema = z.object({
  sortBy: providerWebhookUnmatchedInboundSortBySchema.default("receivedAt"),
  sortDirection: providerWebhookUnmatchedInboundSortOrderSchema.default("desc")
}).strict();
export type ProviderWebhookReviewSavedViewSort = z.infer<typeof providerWebhookReviewSavedViewSortSchema>;

export const createProviderWebhookReviewSavedViewRequestSchema = z.object({
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(240).optional(),
  filters: providerWebhookReviewSavedViewFiltersSchema.default({}),
  sort: providerWebhookReviewSavedViewSortSchema.default({ sortBy: "receivedAt", sortDirection: "desc" }),
  pinned: z.boolean().default(false),
  isDefault: z.boolean().default(false)
}).strict();
export type CreateProviderWebhookReviewSavedViewRequest = z.input<typeof createProviderWebhookReviewSavedViewRequestSchema>;

export const updateProviderWebhookReviewSavedViewRequestSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  description: z.string().trim().max(240).nullable().optional(),
  filters: providerWebhookReviewSavedViewFiltersSchema.optional(),
  sort: providerWebhookReviewSavedViewSortSchema.optional(),
  pinned: z.boolean().optional(),
  isDefault: z.boolean().optional()
}).strict();
export type UpdateProviderWebhookReviewSavedViewRequest = z.input<typeof updateProviderWebhookReviewSavedViewRequestSchema>;

export const providerWebhookReviewSavedViewSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1).nullable(),
  tenantId: z.string().min(1),
  ownerId: z.string().min(1).nullable(),
  createdBy: z.string().min(1).nullable(),
  filters: providerWebhookReviewSavedViewFiltersSchema,
  sort: providerWebhookReviewSavedViewSortSchema,
  pinned: z.boolean(),
  isDefault: z.boolean(),
  archived: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookReviewSavedView = z.infer<typeof providerWebhookReviewSavedViewSchema>;

export const createProviderWebhookOperatorNoteRequestSchema = z.object({
  note: z.string().trim().min(1).max(1000)
}).strict();
export type CreateProviderWebhookOperatorNoteRequest = z.input<typeof createProviderWebhookOperatorNoteRequestSchema>;

export const providerWebhookOperatorNoteContextSchema = z.object({
  provider: providerSandboxProviderSchema,
  platform: providerSandboxProviderSchema,
  channelAccountId: z.string().min(1).nullable(),
  safeRoomLabel: z.string().min(1),
  roomKeyDigest: z.string().min(1).nullable(),
  eventType: providerWebhookEventTypeSchema,
  reviewStatus: providerWebhookUnmatchedReviewStatusSchema,
  linkStatus: providerWebhookUnmatchedLinkStatusSchema,
  unmatchedStatus: providerWebhookUnmatchedInboundStatusSchema,
  assignmentStatus: providerWebhookReviewAssignmentStatusSchema.optional(),
  assignedToOperatorLabel: z.string().min(1).nullable().optional(),
  escalationStatus: providerWebhookReviewEscalationStatusSchema.optional(),
  escalationReason: providerWebhookReviewEscalationReasonSchema.nullable().optional(),
  resolutionStatus: providerWebhookReviewResolutionStatusSchema.optional(),
  resolutionOutcome: providerWebhookReviewResolutionOutcomeSchema.nullable().optional(),
  closureReadiness: providerWebhookReviewClosureReadinessSchema.optional(),
  checklistCompletedCount: z.number().int().nonnegative().optional(),
  checklistTotalCount: z.number().int().nonnegative().optional()
}).strict();
export type ProviderWebhookOperatorNoteContext = z.infer<typeof providerWebhookOperatorNoteContextSchema>;

export const providerWebhookOperatorNoteSchema = z.object({
  id: z.string().min(1),
  unmatchedId: z.string().min(1),
  tenantId: z.string().min(1),
  authorId: z.string().min(1).nullable(),
  authorLabel: z.string().min(1).nullable(),
  note: z.string().min(1).max(1000),
  context: providerWebhookOperatorNoteContextSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookOperatorNote = z.infer<typeof providerWebhookOperatorNoteSchema>;

export const providerAllowlistSummarySchema = z.object({
  configured: z.boolean(),
  entryCount: z.number().int().nonnegative()
}).strict();
export type ProviderAllowlistSummary = z.infer<typeof providerAllowlistSummarySchema>;

export const providerReadinessProviderSchema = z.object({
  name: providerSandboxProviderSchema,
  configured: z.boolean(),
  credentialStatus: providerConfigurationStatusSchema,
  webhookStatus: providerConfigurationStatusSchema,
  webhookVerificationReady: z.boolean(),
  webhookVerificationConfigured: z.boolean(),
  outboundEnabled: z.literal(false),
  status: providerReadinessProviderStatusSchema
}).strict();
export type ProviderReadinessProvider = z.infer<typeof providerReadinessProviderSchema>;

export const providerReadinessSchema = z.object({
  mode: z.string().min(1),
  outboundEnabledByEnv: z.boolean(),
  sandboxMode: z.string().min(1),
  sandboxEnabled: z.boolean(),
  channelMode: z.string().min(1),
  metaChannelMode: z.string().min(1),
  realOutboundEnabled: z.boolean(),
  allowlistCount: z.number().int().nonnegative(),
  allowlist: providerAllowlistSummarySchema,
  webhookSignatureVerificationConfigured: z.boolean(),
  webhookSignatureVerificationReady: z.boolean(),
  replayGuardrailsEnabled: z.boolean(),
  lastSandboxEventSignatureStatus: providerWebhookSignatureStatusSchema.nullable(),
  latestReplayStatus: providerWebhookReplayStatusSchema.nullable(),
  replayDetectedCount: z.number().int().nonnegative(),
  webhookNormalizationEnabled: z.boolean(),
  webhookDryRunRoutingEnabled: z.boolean(),
  lastSandboxEventNormalizationStatus: providerWebhookNormalizationStatusSchema.nullable(),
  latestRoutingStatus: providerWebhookRoutingStatusSchema.nullable(),
  normalizedEventCount: z.number().int().nonnegative(),
  routingBlockedCount: z.number().int().nonnegative(),
  webhookInboundPersistenceEnabled: z.boolean(),
  latestInboundPersistenceStatus: providerWebhookInboundPersistenceStatusSchema.nullable(),
  persistedInboundMessageCount: z.number().int().nonnegative(),
  inboundPersistenceBlockedCount: z.number().int().nonnegative(),
  inboundPersistenceReplayBlockedCount: z.number().int().nonnegative(),
  inboundPersistenceSkippedNoMatchCount: z.number().int().nonnegative(),
  webhookUnmatchedInboundReviewEnabled: z.boolean(),
  webhookUnmatchedReviewActionsEnabled: z.boolean(),
  webhookCandidateLookupEnabled: z.boolean(),
  webhookUnmatchedHistoryEnabled: z.boolean(),
  webhookUnmatchedQueueExportEnabled: z.boolean(),
  webhookUnmatchedQueueExportMaxLimit: z.number().int().positive(),
  webhookReviewMetricsEnabled: z.boolean(),
  webhookDiagnosticsEnabled: z.boolean(),
  webhookReviewAlertsEnabled: z.boolean(),
  webhookReviewQueueHealthEnabled: z.boolean(),
  reviewTriageEnabled: z.boolean(),
  triageGuidanceEnabled: z.boolean(),
  reviewSavedViewsEnabled: z.boolean(),
  operatorNotesEnabled: z.boolean(),
  reviewAssignmentEnabled: z.boolean(),
  reviewEscalationEnabled: z.boolean(),
  assignmentWorkloadEnabled: z.boolean(),
  reviewResolutionEnabled: z.boolean().default(false),
  reviewClosureChecklistEnabled: z.boolean().default(false),
  resolutionSummaryEnabled: z.boolean().default(false),
  reviewClosureEvidenceEnabled: z.boolean().default(false),
  reviewClosureReportEnabled: z.boolean().default(false),
  reviewClosureEvidenceExportEnabled: z.boolean().default(false),
  reviewClosureReportExportEnabled: z.boolean().default(false),
  reviewExportRedactionAuditEnabled: z.boolean().default(false),
  reviewExportIntegrityChecksEnabled: z.boolean().default(false),
  reviewExportManifestEnabled: z.boolean().default(false),
  reviewExportQaHandoffEnabled: z.boolean().default(false),
  exportRedactionPassedCount: z.number().int().nonnegative().default(0),
  exportRedactionWarningCount: z.number().int().nonnegative().default(0),
  exportRedactionBlockedCount: z.number().int().nonnegative().default(0),
  exportManifestReadyCount: z.number().int().nonnegative().default(0),
  exportManifestNeedsReviewCount: z.number().int().nonnegative().default(0),
  exportManifestBlockedCount: z.number().int().nonnegative().default(0),
  latestExportManifestStatus: z.enum(["ready", "needs_review", "blocked"]).nullable().default(null),
  savedViewCount: z.number().int().nonnegative(),
  operatorNoteCount: z.number().int().nonnegative(),
  unassignedOpenCount: z.number().int().nonnegative(),
  assignedOpenCount: z.number().int().nonnegative(),
  escalatedOpenCount: z.number().int().nonnegative(),
  unresolvedOpenCount: z.number().int().nonnegative().default(0),
  readyForClosureCount: z.number().int().nonnegative().default(0),
  blockedResolutionCount: z.number().int().nonnegative().default(0),
  checklistIncompleteOpenCount: z.number().int().nonnegative().default(0),
  closureEvidenceReadyCount: z.number().int().nonnegative().default(0),
  closureEvidenceBlockedCount: z.number().int().nonnegative().default(0),
  closureEvidenceIncompleteCount: z.number().int().nonnegative().default(0),
  closureEvidenceExportCount: z.number().int().nonnegative().default(0),
  closureReportExportCount: z.number().int().nonnegative().default(0),
  reviewAlertCriticalCount: z.number().int().nonnegative(),
  criticalTriageCount: z.number().int().nonnegative(),
  openTriageCount: z.number().int().nonnegative(),
  unmatchedInboundOpenCount: z.number().int().nonnegative(),
  unmatchedInboundStaleOpenCount: z.number().int().nonnegative(),
  unmatchedInboundQueuedCount: z.number().int().nonnegative(),
  unmatchedInboundReplayBlockedCount: z.number().int().nonnegative(),
  unmatchedInboundReviewedCount: z.number().int().nonnegative(),
  unmatchedInboundSkippedCount: z.number().int().nonnegative(),
  unmatchedInboundLinkedCount: z.number().int().nonnegative(),
  latestUnmatchedInboundStatus: providerWebhookUnmatchedInboundStatusSchema.nullable(),
  latestUnmatchedReviewActionStatus: providerWebhookUnmatchedReviewActionStatusSchema.nullable(),
  latestUnmatchedLinkStatus: providerWebhookUnmatchedLinkStatusSchema.nullable(),
  lastSandboxEventAt: z.string().datetime().nullable(),
  externalCalls: z.literal(0),
  providers: z.array(providerReadinessProviderSchema)
}).strict();
export type ProviderReadiness = z.infer<typeof providerReadinessSchema>;

export const providerWebhookEventModeSchema = z.enum(["sandbox", "dry_run"]);
export type ProviderWebhookEventMode = z.infer<typeof providerWebhookEventModeSchema>;

export const providerWebhookEventStatusSchema = z.enum(["received", "verified", "failed"]);
export type ProviderWebhookEventStatus = z.infer<typeof providerWebhookEventStatusSchema>;

export const providerWebhookSandboxEventRequestSchema = z.object({
  provider: providerSandboxProviderSchema,
  channel: providerSandboxProviderSchema.optional(),
  eventType: providerWebhookEventTypeSchema,
  mode: providerWebhookEventModeSchema.default("dry_run"),
  status: providerWebhookEventStatusSchema.default("received"),
  eventId: z.string().trim().min(1).optional(),
  deliveryId: z.string().trim().min(1).optional(),
  timestamp: z.string().trim().min(1).optional(),
  signature: z.string().trim().min(1).optional(),
  inboundPersistenceMode: providerWebhookInboundPersistenceModeSchema.default("dry-run"),
  payload: z.unknown().optional()
}).strict();
export type ProviderWebhookSandboxEventRequest = z.input<typeof providerWebhookSandboxEventRequestSchema>;

export const providerWebhookEventSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  provider: providerSandboxProviderSchema,
  channel: providerSandboxProviderSchema,
  eventType: providerWebhookEventTypeSchema,
  mode: providerWebhookEventModeSchema,
  status: providerWebhookEventStatusSchema,
  receivedAt: z.string().datetime(),
  payloadSummary: z.string().min(1),
  payloadFieldCount: z.number().int().nonnegative(),
  payloadDigest: z.string().min(1),
  signatureVerified: z.boolean(),
  signatureStatus: providerWebhookSignatureStatusSchema,
  signatureAlgorithm: z.literal("hmac-sha256"),
  signatureFingerprint: z.string().min(1).nullable(),
  signedAt: z.string().min(1).nullable(),
  replayDetected: z.boolean(),
  replayStatus: providerWebhookReplayStatusSchema,
  dedupKeyDigest: z.string().min(1).nullable(),
  previousEventSeenAt: z.string().datetime().nullable(),
  normalized: z.boolean(),
  normalizationStatus: providerWebhookNormalizationStatusSchema,
  normalizedEventType: providerWebhookNormalizedEventTypeSchema,
  direction: z.literal("inbound"),
  messageType: providerWebhookMessageTypeSchema,
  textPreview: z.string().min(1).nullable(),
  textLength: z.number().int().nonnegative().nullable(),
  mediaSummary: z.string().min(1).nullable(),
  senderKeyDigest: z.string().min(1).nullable(),
  roomKeyDigest: z.string().min(1).nullable(),
  dryRunRouting: z.boolean(),
  routingStatus: providerWebhookRoutingStatusSchema,
  conversationLookupStatus: providerWebhookConversationLookupStatusSchema,
  conversationKeyDigest: z.string().min(1).nullable(),
  channelAccountId: z.string().min(1).nullable(),
  roomIdDigest: z.string().min(1).nullable(),
  inboundPersistenceMode: providerWebhookInboundPersistenceModeSchema,
  inboundPersistenceStatus: providerWebhookInboundPersistenceStatusSchema,
  messagePersisted: z.boolean(),
  persistedMessageId: z.string().min(1).nullable(),
  conversationId: z.string().min(1).nullable(),
  unmatchedInboundQueued: z.boolean(),
  unmatchedInboundId: z.string().min(1).nullable(),
  unmatchedStatus: providerWebhookUnmatchedInboundStatusSchema.nullable(),
  unmatchedReason: z.string().min(1).nullable(),
  unmatchedReviewActionStatus: providerWebhookUnmatchedReviewActionStatusSchema,
  unmatchedLinkStatus: providerWebhookUnmatchedLinkStatusSchema,
  linkedConversationId: z.string().min(1).nullable(),
  linkedMessageId: z.string().min(1).nullable(),
  unmatchedResolvedAt: z.string().datetime().nullable(),
  inboundAuditStatus: providerWebhookInboundAuditStatusSchema,
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookEvent = z.infer<typeof providerWebhookEventSchema>;

export const providerWebhookUnmatchedInboundReviewRequestSchema = z.object({
  status: z.enum(["reviewed", "skipped"]),
  reason: z.string().trim().max(160).optional()
}).strict();
export type ProviderWebhookUnmatchedInboundReviewRequest = z.infer<typeof providerWebhookUnmatchedInboundReviewRequestSchema>;

export const providerWebhookUnmatchedInboundLinkRequestSchema = z.object({
  conversationId: z.string().trim().min(1),
  actionMode: z.enum(["link-only", "link-and-persist-safe-message"])
}).strict();
export type ProviderWebhookUnmatchedInboundLinkRequest = z.infer<typeof providerWebhookUnmatchedInboundLinkRequestSchema>;

export const providerWebhookUnmatchedInboundAssignmentRequestSchema = z.object({
  operation: providerWebhookReviewAssignmentOperationSchema,
  assignedToOperatorLabel: z.string().trim().min(1).max(80).optional(),
  note: z.string().trim().max(240).optional()
}).strict();
export type ProviderWebhookUnmatchedInboundAssignmentRequest = z.infer<typeof providerWebhookUnmatchedInboundAssignmentRequestSchema>;

export const providerWebhookUnmatchedInboundEscalationRequestSchema = z.object({
  operation: providerWebhookReviewEscalationOperationSchema,
  escalationReason: providerWebhookReviewEscalationReasonSchema.optional(),
  note: z.string().trim().max(240).optional()
}).strict();
export type ProviderWebhookUnmatchedInboundEscalationRequest = z.infer<typeof providerWebhookUnmatchedInboundEscalationRequestSchema>;

export const providerWebhookUnmatchedInboundResolutionRequestSchema = z.object({
  operation: providerWebhookReviewResolutionOperationSchema,
  resolutionOutcome: providerWebhookReviewResolutionOutcomeSchema.optional(),
  note: z.string().trim().max(240).optional()
}).strict();
export type ProviderWebhookUnmatchedInboundResolutionRequest = z.infer<typeof providerWebhookUnmatchedInboundResolutionRequestSchema>;

export const providerWebhookUnmatchedInboundResolutionChecklistRequestSchema = z.object({
  operation: providerWebhookReviewClosureChecklistOperationSchema,
  step: providerWebhookReviewClosureChecklistStepSchema.optional()
}).strict();
export type ProviderWebhookUnmatchedInboundResolutionChecklistRequest = z.infer<typeof providerWebhookUnmatchedInboundResolutionChecklistRequestSchema>;

export const providerWebhookCandidateConversationSchema = z.object({
  conversationId: z.string().min(1),
  platform: providerSandboxProviderSchema,
  channelAccountId: z.string().min(1),
  roomIdDigest: z.string().min(1),
  safeRoomLabel: z.string().min(1),
  latestMessagePreview: z.string().min(1).nullable(),
  latestMessageAt: z.string().datetime().nullable(),
  matchReason: z.string().min(1),
  matchConfidence: z.number().min(0).max(1),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookCandidateConversation = z.infer<typeof providerWebhookCandidateConversationSchema>;

export const providerWebhookReviewClosureChecklistItemSchema = z.object({
  step: providerWebhookReviewClosureChecklistStepSchema,
  completed: z.boolean(),
  completedAt: z.string().datetime().nullable(),
  completedByOperatorLabel: z.string().min(1).nullable()
}).strict();
export type ProviderWebhookReviewClosureChecklistItem = z.infer<typeof providerWebhookReviewClosureChecklistItemSchema>;

export const providerWebhookUnmatchedInboundItemSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  provider: providerSandboxProviderSchema,
  channelAccountId: z.string().min(1).nullable(),
  mode: z.literal("sandbox"),
  eventType: providerWebhookEventTypeSchema,
  normalizedEventType: providerWebhookNormalizedEventTypeSchema,
  messageType: providerWebhookMessageTypeSchema,
  normalizationStatus: providerWebhookNormalizationStatusSchema,
  routingStatus: providerWebhookRoutingStatusSchema,
  conversationLookupStatus: z.literal("not-found"),
  unmatchedStatus: providerWebhookUnmatchedInboundStatusSchema,
  unmatchedReason: z.string().min(1),
  reviewStatus: providerWebhookUnmatchedReviewStatusSchema,
  reviewedAt: z.string().datetime().nullable(),
  reviewedBy: z.string().min(1).nullable(),
  reviewReason: z.string().min(1).nullable(),
  linkStatus: providerWebhookUnmatchedLinkStatusSchema,
  linkedConversationId: z.string().min(1).nullable(),
  linkedMessageId: z.string().min(1).nullable(),
  unmatchedResolvedAt: z.string().datetime().nullable(),
  messagePersisted: z.boolean(),
  assignmentStatus: providerWebhookReviewAssignmentStatusSchema,
  assignedToOperatorLabel: z.string().min(1).nullable(),
  assignedAt: z.string().datetime().nullable(),
  assignedByOperatorLabel: z.string().min(1).nullable(),
  escalationStatus: providerWebhookReviewEscalationStatusSchema,
  escalationReason: providerWebhookReviewEscalationReasonSchema.nullable(),
  escalatedAt: z.string().datetime().nullable(),
  escalatedByOperatorLabel: z.string().min(1).nullable(),
  resolutionStatus: providerWebhookReviewResolutionStatusSchema.default("unresolved"),
  resolutionOutcome: providerWebhookReviewResolutionOutcomeSchema.nullable().default(null),
  resolvedAt: z.string().datetime().nullable().default(null),
  resolvedByOperatorLabel: z.string().min(1).nullable().default(null),
  closureReadiness: providerWebhookReviewClosureReadinessSchema.default("NOT_READY"),
  closureChecklist: z.array(providerWebhookReviewClosureChecklistItemSchema).default([]),
  checklistCompletedCount: z.number().int().nonnegative().default(0),
  checklistTotalCount: z.number().int().nonnegative().default(0),
  checklistIncompleteSteps: z.array(providerWebhookReviewClosureChecklistStepSchema).default([]),
  recommendedNextActions: z.array(providerWebhookReviewRecommendedNextActionSchema).default([]),
  lastOperatorNoteAt: z.string().datetime().nullable(),
  historyAvailable: z.boolean(),
  diagnosticsAvailable: z.boolean(),
  candidatesAvailable: z.boolean(),
  payloadDigest: z.string().min(1),
  providerEventDigest: z.string().min(1).nullable(),
  deliveryDigest: z.string().min(1).nullable(),
  senderKeyDigest: z.string().min(1).nullable(),
  roomKeyDigest: z.string().min(1).nullable(),
  textPreview: z.string().min(1).nullable(),
  textLength: z.number().int().nonnegative().nullable(),
  receivedAt: z.string().datetime(),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookUnmatchedInboundItem = z.infer<typeof providerWebhookUnmatchedInboundItemSchema>;

export const providerWebhookUnmatchedInboundPaginationSchema = z.object({
  totalCount: z.number().int().nonnegative(),
  limit: z.number().int().min(1).max(50),
  offset: z.number().int().nonnegative(),
  returnedCount: z.number().int().nonnegative(),
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean()
}).strict();
export type ProviderWebhookUnmatchedInboundPagination = z.infer<typeof providerWebhookUnmatchedInboundPaginationSchema>;

export const providerWebhookUnmatchedInboundSummarySchema = z.object({
  openCount: z.number().int().nonnegative(),
  reviewedCount: z.number().int().nonnegative(),
  skippedCount: z.number().int().nonnegative(),
  linkedCount: z.number().int().nonnegative()
}).strict();
export type ProviderWebhookUnmatchedInboundSummary = z.infer<typeof providerWebhookUnmatchedInboundSummarySchema>;

export const providerWebhookUnmatchedInboundAppliedSortSchema = z.object({
  sortBy: providerWebhookUnmatchedInboundSortBySchema,
  sortOrder: providerWebhookUnmatchedInboundSortOrderSchema
}).strict();
export type ProviderWebhookUnmatchedInboundAppliedSort = z.infer<typeof providerWebhookUnmatchedInboundAppliedSortSchema>;

export const providerWebhookUnmatchedInboundPageSchema = z.object({
  items: z.array(providerWebhookUnmatchedInboundItemSchema),
  pagination: providerWebhookUnmatchedInboundPaginationSchema,
  appliedFilters: providerWebhookUnmatchedInboundFiltersSchema,
  appliedSort: providerWebhookUnmatchedInboundAppliedSortSchema,
  summary: providerWebhookUnmatchedInboundSummarySchema,
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookUnmatchedInboundPage = z.infer<typeof providerWebhookUnmatchedInboundPageSchema>;

export const providerWebhookReviewMetricsCountSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  count: z.number().int().nonnegative()
}).strict();
export type ProviderWebhookReviewMetricsCount = z.infer<typeof providerWebhookReviewMetricsCountSchema>;

export const providerWebhookReviewMetricsAgeBucketsSchema = z.object({
  under1Hour: z.number().int().nonnegative(),
  oneTo24Hours: z.number().int().nonnegative(),
  oneTo3Days: z.number().int().nonnegative(),
  over3Days: z.number().int().nonnegative()
}).strict();
export type ProviderWebhookReviewMetricsAgeBuckets = z.infer<typeof providerWebhookReviewMetricsAgeBucketsSchema>;

export const providerWebhookReviewFunnelSchema = z.object({
  inboundReceived: z.number().int().nonnegative(),
  persisted: z.number().int().nonnegative(),
  unmatchedQueued: z.number().int().nonnegative(),
  reviewed: z.number().int().nonnegative(),
  skipped: z.number().int().nonnegative(),
  linked: z.number().int().nonnegative(),
  exportedHistoryAvailable: z.number().int().nonnegative()
}).strict();
export type ProviderWebhookReviewFunnel = z.infer<typeof providerWebhookReviewFunnelSchema>;

export const providerWebhookReviewAlertThresholdsSchema = z.object({
  staleWarningHours: z.number().int().positive(),
  staleCriticalHours: z.number().int().positive(),
  overSlaHours: z.number().int().positive()
}).strict();
export type ProviderWebhookReviewAlertThresholds = z.infer<typeof providerWebhookReviewAlertThresholdsSchema>;

export const providerWebhookReviewAlertAgeBucketSchema = z.enum(["under1Hour", "oneTo24Hours", "oneTo3Days", "over3Days"]);
export type ProviderWebhookReviewAlertAgeBucket = z.infer<typeof providerWebhookReviewAlertAgeBucketSchema>;

export const providerWebhookReviewAssignmentSummaryItemSchema = z.object({
  unmatchedId: z.string().min(1),
  provider: providerSandboxProviderSchema,
  platform: providerSandboxProviderSchema,
  channelAccountId: z.string().min(1).nullable(),
  safeRoomLabel: z.string().min(1),
  roomKeyDigest: z.string().min(1).nullable(),
  eventType: providerWebhookEventTypeSchema,
  receivedAt: z.string().datetime(),
  ageBucket: providerWebhookReviewAlertAgeBucketSchema,
  reviewStatus: providerWebhookUnmatchedReviewStatusSchema,
  linkStatus: providerWebhookUnmatchedLinkStatusSchema,
  unmatchedStatus: providerWebhookUnmatchedInboundStatusSchema,
  triageLane: providerWebhookReviewTriageLaneSchema,
  severity: providerWebhookReviewAlertSeveritySchema,
  assignmentStatus: providerWebhookReviewAssignmentStatusSchema,
  assignedToOperatorLabel: z.string().min(1).nullable(),
  assignedAt: z.string().datetime().nullable(),
  assignedByOperatorLabel: z.string().min(1).nullable(),
  escalationStatus: providerWebhookReviewEscalationStatusSchema,
  escalationReason: providerWebhookReviewEscalationReasonSchema.nullable(),
  escalatedAt: z.string().datetime().nullable(),
  escalatedByOperatorLabel: z.string().min(1).nullable(),
  resolutionStatus: providerWebhookReviewResolutionStatusSchema.default("unresolved"),
  resolutionOutcome: providerWebhookReviewResolutionOutcomeSchema.nullable().default(null),
  closureReadiness: providerWebhookReviewClosureReadinessSchema.default("NOT_READY"),
  checklistCompletedCount: z.number().int().nonnegative().default(0),
  checklistTotalCount: z.number().int().nonnegative().default(0),
  lastOperatorNoteAt: z.string().datetime().nullable(),
  historyAvailable: z.boolean(),
  diagnosticsAvailable: z.boolean(),
  candidatesAvailable: z.boolean(),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookReviewAssignmentSummaryItem = z.infer<typeof providerWebhookReviewAssignmentSummaryItemSchema>;

export const providerWebhookReviewAlertItemSchema = z.object({
  unmatchedId: z.string().min(1),
  provider: providerSandboxProviderSchema,
  platform: providerSandboxProviderSchema,
  channelAccountId: z.string().min(1).nullable(),
  safeRoomLabel: z.string().min(1),
  roomKeyDigest: z.string().min(1).nullable(),
  eventType: providerWebhookEventTypeSchema,
  receivedAt: z.string().datetime(),
  ageBucket: providerWebhookReviewAlertAgeBucketSchema,
  severity: providerWebhookReviewAlertSeveritySchema,
  reviewStatus: providerWebhookUnmatchedReviewStatusSchema,
  linkStatus: providerWebhookUnmatchedLinkStatusSchema,
  unmatchedStatus: providerWebhookUnmatchedInboundStatusSchema,
  assignmentStatus: providerWebhookReviewAssignmentStatusSchema,
  assignedToOperatorLabel: z.string().min(1).nullable(),
  escalationStatus: providerWebhookReviewEscalationStatusSchema,
  escalationReason: providerWebhookReviewEscalationReasonSchema.nullable(),
  routingOutcome: z.string().min(1),
  diagnosticsAvailable: z.boolean(),
  historyAvailable: z.boolean(),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookReviewAlertItem = z.infer<typeof providerWebhookReviewAlertItemSchema>;

export const providerWebhookReviewAlertsSchema = z.object({
  generatedAt: z.string().datetime(),
  appliedFilters: providerWebhookReviewAlertsFiltersSchema,
  totalAlerts: z.number().int().nonnegative(),
  infoCount: z.number().int().nonnegative(),
  warningCount: z.number().int().nonnegative(),
  criticalCount: z.number().int().nonnegative(),
  staleOpenCount: z.number().int().nonnegative(),
  overSlaCount: z.number().int().nonnegative(),
  oldestOpenReceivedAt: z.string().datetime().nullable(),
  latestAlertGeneratedAt: z.string().datetime().nullable(),
  thresholds: providerWebhookReviewAlertThresholdsSchema,
  byProvider: z.array(providerWebhookReviewMetricsCountSchema),
  byPlatform: z.array(providerWebhookReviewMetricsCountSchema),
  byEventType: z.array(providerWebhookReviewMetricsCountSchema),
  byReviewStatus: z.array(providerWebhookReviewMetricsCountSchema),
  byLinkStatus: z.array(providerWebhookReviewMetricsCountSchema),
  byUnmatchedStatus: z.array(providerWebhookReviewMetricsCountSchema),
  bySeverity: z.array(providerWebhookReviewMetricsCountSchema),
  alertItems: z.array(providerWebhookReviewAlertItemSchema),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookReviewAlerts = z.infer<typeof providerWebhookReviewAlertsSchema>;

export const providerWebhookReviewTriageLaneSummarySchema = z.object({
  laneKey: providerWebhookReviewTriageLaneSchema,
  label: z.string().min(1),
  severity: providerWebhookReviewAlertSeveritySchema,
  count: z.number().int().nonnegative(),
  description: z.string().min(1),
  recommendedNextActions: z.array(providerWebhookTriageRecommendedActionSchema),
  safeDrilldownFilters: providerWebhookReviewMetricsFiltersSchema
}).strict();
export type ProviderWebhookReviewTriageLaneSummary = z.infer<typeof providerWebhookReviewTriageLaneSummarySchema>;

export const providerWebhookReviewTriageItemSchema = z.object({
  unmatchedId: z.string().min(1),
  provider: providerSandboxProviderSchema,
  platform: providerSandboxProviderSchema,
  channelAccountId: z.string().min(1).nullable(),
  safeRoomLabel: z.string().min(1),
  roomKeyDigest: z.string().min(1).nullable(),
  eventType: providerWebhookEventTypeSchema,
  receivedAt: z.string().datetime(),
  ageBucket: providerWebhookReviewAlertAgeBucketSchema,
  triageLane: providerWebhookReviewTriageLaneSchema,
  severity: providerWebhookReviewAlertSeveritySchema,
  reviewStatus: providerWebhookUnmatchedReviewStatusSchema,
  linkStatus: providerWebhookUnmatchedLinkStatusSchema,
  unmatchedStatus: providerWebhookUnmatchedInboundStatusSchema,
  assignmentStatus: providerWebhookReviewAssignmentStatusSchema,
  assignedToOperatorLabel: z.string().min(1).nullable(),
  escalationStatus: providerWebhookReviewEscalationStatusSchema,
  escalationReason: providerWebhookReviewEscalationReasonSchema.nullable(),
  routingOutcome: z.string().min(1),
  recommendedNextActions: z.array(providerWebhookTriageRecommendedActionSchema),
  diagnosticsAvailable: z.boolean(),
  historyAvailable: z.boolean(),
  candidatesAvailable: z.boolean(),
  exportAvailable: z.boolean(),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookReviewTriageItem = z.infer<typeof providerWebhookReviewTriageItemSchema>;

export const providerWebhookReviewTriageSchema = z.object({
  generatedAt: z.string().datetime(),
  appliedFilters: providerWebhookReviewTriageFiltersSchema,
  totalItems: z.number().int().nonnegative(),
  totalOpenItems: z.number().int().nonnegative(),
  totalTriageLanes: z.number().int().nonnegative(),
  thresholds: providerWebhookReviewAlertThresholdsSchema,
  lanes: z.array(providerWebhookReviewTriageLaneSummarySchema),
  byProvider: z.array(providerWebhookReviewMetricsCountSchema),
  byPlatform: z.array(providerWebhookReviewMetricsCountSchema),
  byEventType: z.array(providerWebhookReviewMetricsCountSchema),
  byReviewStatus: z.array(providerWebhookReviewMetricsCountSchema),
  byLinkStatus: z.array(providerWebhookReviewMetricsCountSchema),
  byUnmatchedStatus: z.array(providerWebhookReviewMetricsCountSchema),
  byLane: z.array(providerWebhookReviewMetricsCountSchema),
  topItems: z.array(providerWebhookReviewTriageItemSchema),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookReviewTriage = z.infer<typeof providerWebhookReviewTriageSchema>;

export const providerWebhookReviewMetricsSchema = z.object({
  generatedAt: z.string().datetime(),
  appliedFilters: providerWebhookReviewMetricsFiltersSchema,
  totalEvents: z.number().int().nonnegative(),
  totalUnmatched: z.number().int().nonnegative(),
  openUnmatched: z.number().int().nonnegative(),
  reviewedCount: z.number().int().nonnegative(),
  skippedCount: z.number().int().nonnegative(),
  linkedCount: z.number().int().nonnegative(),
  persistedInboundCount: z.number().int().nonnegative(),
  signatureRejectedCount: z.number().int().nonnegative(),
  replayRejectedCount: z.number().int().nonnegative(),
  byProvider: z.array(providerWebhookReviewMetricsCountSchema),
  byEventType: z.array(providerWebhookReviewMetricsCountSchema),
  byReviewStatus: z.array(providerWebhookReviewMetricsCountSchema),
  byLinkStatus: z.array(providerWebhookReviewMetricsCountSchema),
  byUnmatchedStatus: z.array(providerWebhookReviewMetricsCountSchema),
  ageBuckets: providerWebhookReviewMetricsAgeBucketsSchema,
  funnel: providerWebhookReviewFunnelSchema,
  latestReceivedAt: z.string().datetime().nullable(),
  oldestOpenReceivedAt: z.string().datetime().nullable(),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookReviewMetrics = z.infer<typeof providerWebhookReviewMetricsSchema>;

export const providerWebhookReviewWorkloadFiltersSchema = providerWebhookReviewTriageFiltersSchema.strip();
export type ProviderWebhookReviewWorkloadFilters = z.infer<typeof providerWebhookReviewWorkloadFiltersSchema>;

export const providerWebhookReviewWorkloadSchema = z.object({
  generatedAt: z.string().datetime(),
  appliedFilters: providerWebhookReviewWorkloadFiltersSchema,
  totalItems: z.number().int().nonnegative(),
  totalOpenItems: z.number().int().nonnegative(),
  thresholds: providerWebhookReviewAlertThresholdsSchema,
  counts: z.object({
    unassignedOpen: z.number().int().nonnegative(),
    assignedToMeOpen: z.number().int().nonnegative(),
    assignedToOthersOpen: z.number().int().nonnegative(),
    assignedOpen: z.number().int().nonnegative(),
    escalatedOpen: z.number().int().nonnegative(),
    overdueAssignedOpen: z.number().int().nonnegative(),
    recentlyAssigned: z.number().int().nonnegative(),
    recentlyEscalated: z.number().int().nonnegative(),
    resolvedAssigned: z.number().int().nonnegative(),
    unresolvedOpen: z.number().int().nonnegative().default(0),
    readyForClosure: z.number().int().nonnegative().default(0),
    blockedResolution: z.number().int().nonnegative().default(0),
    checklistIncompleteOpen: z.number().int().nonnegative().default(0)
  }).strict(),
  byAssignee: z.array(providerWebhookReviewMetricsCountSchema),
  byAssignmentStatus: z.array(providerWebhookReviewMetricsCountSchema),
  byEscalationStatus: z.array(providerWebhookReviewMetricsCountSchema),
  byEscalationReason: z.array(providerWebhookReviewMetricsCountSchema),
  byProvider: z.array(providerWebhookReviewMetricsCountSchema),
  byPlatform: z.array(providerWebhookReviewMetricsCountSchema),
  byReviewStatus: z.array(providerWebhookReviewMetricsCountSchema),
  byLinkStatus: z.array(providerWebhookReviewMetricsCountSchema),
  byUnmatchedStatus: z.array(providerWebhookReviewMetricsCountSchema),
  topAssignedItems: z.array(providerWebhookReviewAssignmentSummaryItemSchema),
  topEscalatedItems: z.array(providerWebhookReviewAssignmentSummaryItemSchema),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookReviewWorkload = z.infer<typeof providerWebhookReviewWorkloadSchema>;

export const providerWebhookReviewResolutionSummaryFiltersSchema = providerWebhookReviewWorkloadFiltersSchema.strip();
export type ProviderWebhookReviewResolutionSummaryFilters = z.infer<typeof providerWebhookReviewResolutionSummaryFiltersSchema>;

export const providerWebhookReviewResolutionSummaryItemSchema = z.object({
  unmatchedId: z.string().min(1),
  provider: providerSandboxProviderSchema,
  platform: providerSandboxProviderSchema,
  channelAccountId: z.string().min(1).nullable(),
  safeRoomLabel: z.string().min(1),
  roomKeyDigest: z.string().min(1).nullable(),
  eventType: providerWebhookEventTypeSchema,
  receivedAt: z.string().datetime(),
  ageBucket: providerWebhookReviewAlertAgeBucketSchema,
  reviewStatus: providerWebhookUnmatchedReviewStatusSchema,
  linkStatus: providerWebhookUnmatchedLinkStatusSchema,
  unmatchedStatus: providerWebhookUnmatchedInboundStatusSchema,
  triageLane: providerWebhookReviewTriageLaneSchema,
  severity: providerWebhookReviewAlertSeveritySchema,
  assignmentStatus: providerWebhookReviewAssignmentStatusSchema,
  assignedToOperatorLabel: z.string().min(1).nullable(),
  escalationStatus: providerWebhookReviewEscalationStatusSchema,
  escalationReason: providerWebhookReviewEscalationReasonSchema.nullable(),
  resolutionStatus: providerWebhookReviewResolutionStatusSchema,
  resolutionOutcome: providerWebhookReviewResolutionOutcomeSchema.nullable(),
  resolvedAt: z.string().datetime().nullable(),
  resolvedByOperatorLabel: z.string().min(1).nullable(),
  closureReadiness: providerWebhookReviewClosureReadinessSchema,
  closureChecklist: z.array(providerWebhookReviewClosureChecklistItemSchema),
  checklistCompletedCount: z.number().int().nonnegative(),
  checklistTotalCount: z.number().int().nonnegative(),
  checklistIncompleteSteps: z.array(providerWebhookReviewClosureChecklistStepSchema),
  recommendedNextActions: z.array(providerWebhookReviewRecommendedNextActionSchema),
  lastOperatorNoteAt: z.string().datetime().nullable(),
  historyAvailable: z.boolean(),
  diagnosticsAvailable: z.boolean(),
  candidatesAvailable: z.boolean(),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookReviewResolutionSummaryItem = z.infer<typeof providerWebhookReviewResolutionSummaryItemSchema>;

export const providerWebhookReviewResolutionSummarySchema = z.object({
  generatedAt: z.string().datetime(),
  appliedFilters: providerWebhookReviewResolutionSummaryFiltersSchema,
  totalItems: z.number().int().nonnegative(),
  totalOpenItems: z.number().int().nonnegative(),
  thresholds: providerWebhookReviewAlertThresholdsSchema,
  counts: z.object({
    unresolvedOpen: z.number().int().nonnegative(),
    readyForReview: z.number().int().nonnegative(),
    readyForSkip: z.number().int().nonnegative(),
    readyForLink: z.number().int().nonnegative(),
    readyForLinkAndPersist: z.number().int().nonnegative(),
    blocked: z.number().int().nonnegative(),
    resolvedRecently: z.number().int().nonnegative(),
    checklistIncompleteOpen: z.number().int().nonnegative()
  }).strict(),
  byResolutionStatus: z.array(providerWebhookReviewMetricsCountSchema),
  byResolutionOutcome: z.array(providerWebhookReviewMetricsCountSchema),
  byClosureReadiness: z.array(providerWebhookReviewMetricsCountSchema),
  byChecklistStep: z.array(providerWebhookReviewMetricsCountSchema),
  byProvider: z.array(providerWebhookReviewMetricsCountSchema),
  byPlatform: z.array(providerWebhookReviewMetricsCountSchema),
  byReviewStatus: z.array(providerWebhookReviewMetricsCountSchema),
  byLinkStatus: z.array(providerWebhookReviewMetricsCountSchema),
  byUnmatchedStatus: z.array(providerWebhookReviewMetricsCountSchema),
  topReadyItems: z.array(providerWebhookReviewResolutionSummaryItemSchema),
  topBlockedItems: z.array(providerWebhookReviewResolutionSummaryItemSchema),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookReviewResolutionSummary = z.infer<typeof providerWebhookReviewResolutionSummarySchema>;

export const providerWebhookReviewClosureEvidenceStatusSchema = z.enum(["ready", "blocked", "incomplete"]);
export type ProviderWebhookReviewClosureEvidenceStatus = z.infer<typeof providerWebhookReviewClosureEvidenceStatusSchema>;

export const providerWebhookReviewClosureEvidenceFlagsSchema = z.object({
  diagnosticsViewedOrAvailable: z.boolean(),
  historyAvailable: z.boolean(),
  operatorNotesAvailable: z.boolean(),
  candidatesAvailable: z.boolean(),
  assignmentOrEscalationPresent: z.boolean(),
  noProviderOutboundConfirmed: z.boolean(),
  noRawLeakageConfirmed: z.boolean(),
  safeLinkTargetConfirmed: z.boolean()
}).strict();
export type ProviderWebhookReviewClosureEvidenceFlags = z.infer<typeof providerWebhookReviewClosureEvidenceFlagsSchema>;

export const providerWebhookReviewClosureEvidenceSummaryItemSchema = z.object({
  unmatchedId: z.string().min(1),
  provider: providerSandboxProviderSchema,
  platform: providerSandboxProviderSchema,
  channelAccountId: z.string().min(1).nullable(),
  safeRoomLabel: z.string().min(1),
  roomKeyDigest: z.string().min(1).nullable(),
  eventType: providerWebhookEventTypeSchema,
  receivedAt: z.string().datetime(),
  ageBucket: providerWebhookReviewAlertAgeBucketSchema,
  reviewStatus: providerWebhookUnmatchedReviewStatusSchema,
  linkStatus: providerWebhookUnmatchedLinkStatusSchema,
  unmatchedStatus: providerWebhookUnmatchedInboundStatusSchema,
  triageLane: providerWebhookReviewTriageLaneSchema,
  severity: providerWebhookReviewAlertSeveritySchema,
  assignmentStatus: providerWebhookReviewAssignmentStatusSchema,
  assignedToOperatorLabel: z.string().min(1).nullable(),
  escalationStatus: providerWebhookReviewEscalationStatusSchema,
  escalationReason: providerWebhookReviewEscalationReasonSchema.nullable(),
  resolutionStatus: providerWebhookReviewResolutionStatusSchema,
  resolutionOutcome: providerWebhookReviewResolutionOutcomeSchema.nullable(),
  closureReadiness: providerWebhookReviewClosureReadinessSchema,
  evidenceStatus: providerWebhookReviewClosureEvidenceStatusSchema,
  checklistCompletedCount: z.number().int().nonnegative(),
  checklistTotalCount: z.number().int().nonnegative(),
  checklistIncompleteSteps: z.array(providerWebhookReviewClosureChecklistStepSchema),
  recommendedNextActions: z.array(providerWebhookReviewRecommendedNextActionSchema),
  evidenceFlags: providerWebhookReviewClosureEvidenceFlagsSchema,
  historyEntryCount: z.number().int().nonnegative(),
  operatorNoteCount: z.number().int().nonnegative(),
  candidateSummaryCount: z.number().int().nonnegative(),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookReviewClosureEvidenceSummaryItem = z.infer<typeof providerWebhookReviewClosureEvidenceSummaryItemSchema>;

export const providerWebhookReviewClosureEvidenceSchema = providerWebhookReviewClosureEvidenceSummaryItemSchema.extend({
  generatedAt: z.string().datetime()
}).strict();
export type ProviderWebhookReviewClosureEvidence = z.infer<typeof providerWebhookReviewClosureEvidenceSchema>;

export const providerWebhookReviewClosureEvidenceExportSchema = providerWebhookReviewClosureEvidenceSchema.extend({
  exportKind: z.literal("closure-evidence"),
  format: z.literal("json"),
  contentType: z.literal("application/json"),
  safeFilename: z.string().min(1),
  exportedAt: z.string().datetime()
}).strict();
export type ProviderWebhookReviewClosureEvidenceExport = z.infer<typeof providerWebhookReviewClosureEvidenceExportSchema>;

export const providerWebhookReviewClosureReportFiltersSchema = providerWebhookReviewResolutionSummaryFiltersSchema.strip();
export type ProviderWebhookReviewClosureReportFilters = z.infer<typeof providerWebhookReviewClosureReportFiltersSchema>;

export const providerWebhookReviewClosureReportSchema = z.object({
  generatedAt: z.string().datetime(),
  appliedFilters: providerWebhookReviewClosureReportFiltersSchema,
  totalItems: z.number().int().nonnegative(),
  totalOpenItems: z.number().int().nonnegative(),
  evidenceReadyCount: z.number().int().nonnegative(),
  evidenceBlockedCount: z.number().int().nonnegative(),
  evidenceIncompleteCount: z.number().int().nonnegative(),
  byClosureReadiness: z.array(providerWebhookReviewMetricsCountSchema),
  byResolutionOutcome: z.array(providerWebhookReviewMetricsCountSchema),
  byChecklistStep: z.array(providerWebhookReviewMetricsCountSchema),
  byAssignmentStatus: z.array(providerWebhookReviewMetricsCountSchema),
  byEscalationStatus: z.array(providerWebhookReviewMetricsCountSchema),
  topEvidenceReadyItems: z.array(providerWebhookReviewClosureEvidenceSummaryItemSchema),
  topEvidenceBlockedItems: z.array(providerWebhookReviewClosureEvidenceSummaryItemSchema),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookReviewClosureReport = z.infer<typeof providerWebhookReviewClosureReportSchema>;

export const providerWebhookReviewClosureReportExportSchema = providerWebhookReviewClosureReportSchema.extend({
  exportKind: z.literal("closure-report"),
  format: z.literal("json"),
  contentType: z.literal("application/json"),
  safeFilename: z.string().min(1),
  exportedAt: z.string().datetime()
}).strict();
export type ProviderWebhookReviewClosureReportExport = z.infer<typeof providerWebhookReviewClosureReportExportSchema>;

export const providerWebhookReviewExportRedactionAuditStatusSchema = z.enum(["passed", "blocked", "warning"]);
export type ProviderWebhookReviewExportRedactionAuditStatus = z.infer<typeof providerWebhookReviewExportRedactionAuditStatusSchema>;

export const providerWebhookReviewExportRedactionAuditTargetSchema = z.enum(["closure-evidence-export", "closure-report-export"]);
export type ProviderWebhookReviewExportRedactionAuditTarget = z.infer<typeof providerWebhookReviewExportRedactionAuditTargetSchema>;

export const providerWebhookReviewExportRedactionIssueSeveritySchema = z.enum(["warning", "blocked"]);
export type ProviderWebhookReviewExportRedactionIssueSeverity = z.infer<typeof providerWebhookReviewExportRedactionIssueSeveritySchema>;

export const providerWebhookReviewExportRedactionChecksSchema = z.object({
  rawPayloadAbsent: z.boolean(),
  rawSignatureAbsent: z.boolean(),
  tokenAbsent: z.boolean(),
  authorizationAbsent: z.boolean(),
  cookieAbsent: z.boolean(),
  replyTokenAbsent: z.boolean(),
  rawSenderIdAbsent: z.boolean(),
  rawRoomIdAbsent: z.boolean(),
  providerSecretAbsent: z.boolean(),
  providerOutboundAbsent: z.boolean(),
  externalCallsZero: z.boolean(),
  safeRoomDigestPresent: z.boolean(),
  tenantScoped: z.boolean(),
  exportDeterministic: z.boolean()
}).strict();
export type ProviderWebhookReviewExportRedactionChecks = z.infer<typeof providerWebhookReviewExportRedactionChecksSchema>;

export const providerWebhookReviewExportRedactionIssueSchema = z.object({
  code: z.string().min(1),
  severity: providerWebhookReviewExportRedactionIssueSeveritySchema,
  safeLabel: z.string().min(1),
  recommendedAction: z.string().min(1)
}).strict();
export type ProviderWebhookReviewExportRedactionIssue = z.infer<typeof providerWebhookReviewExportRedactionIssueSchema>;

export const providerWebhookReviewExportRedactionAuditSchema = z.object({
  generatedAt: z.string().datetime(),
  auditTarget: providerWebhookReviewExportRedactionAuditTargetSchema,
  status: providerWebhookReviewExportRedactionAuditStatusSchema,
  checks: providerWebhookReviewExportRedactionChecksSchema,
  issues: z.array(providerWebhookReviewExportRedactionIssueSchema),
  unmatchedId: z.string().min(1).optional(),
  appliedFilters: providerWebhookReviewClosureReportFiltersSchema.optional(),
  exportShapeVersion: z.string().min(1),
  safeDigest: z.string().min(1),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookReviewExportRedactionAudit = z.infer<typeof providerWebhookReviewExportRedactionAuditSchema>;

export const providerWebhookReviewExportIntegritySchema = z.object({
  generatedAt: z.string().datetime(),
  appliedFilters: providerWebhookReviewClosureReportFiltersSchema,
  externalCalls: z.literal(0),
  totalCheckedItems: z.number().int().nonnegative(),
  redactionPassedCount: z.number().int().nonnegative(),
  redactionWarningCount: z.number().int().nonnegative(),
  redactionBlockedCount: z.number().int().nonnegative(),
  deterministicExportConfirmed: z.boolean(),
  exportShapeVersion: z.string().min(1),
  safeReportDigest: z.string().min(1)
}).strict();
export type ProviderWebhookReviewExportIntegrity = z.infer<typeof providerWebhookReviewExportIntegritySchema>;

export const providerWebhookReviewExportManifestTargetSchema = z.enum(["closure-evidence-export", "closure-report-export"]);
export type ProviderWebhookReviewExportManifestTarget = z.infer<typeof providerWebhookReviewExportManifestTargetSchema>;

export const providerWebhookReviewExportManifestIntegrityStatusSchema = z.enum(["confirmed", "warning", "blocked"]);
export type ProviderWebhookReviewExportManifestIntegrityStatus = z.infer<typeof providerWebhookReviewExportManifestIntegrityStatusSchema>;

export const providerWebhookReviewExportManifestQaReadinessSchema = z.enum(["ready", "needs_review", "blocked"]);
export type ProviderWebhookReviewExportManifestQaReadiness = z.infer<typeof providerWebhookReviewExportManifestQaReadinessSchema>;

export const providerWebhookReviewExportManifestChecksSchema = z.object({
  safeFilenamePresent: z.boolean(),
  safeDigestPresent: z.boolean(),
  redactionPassedOrWarned: z.boolean(),
  redactionBlockedAbsent: z.boolean(),
  deterministicExportConfirmed: z.boolean(),
  externalCallsZero: z.boolean(),
  manualQaReady: z.boolean()
}).strict();
export type ProviderWebhookReviewExportManifestChecks = z.infer<typeof providerWebhookReviewExportManifestChecksSchema>;

export const providerWebhookReviewExportManifestSchema = z.object({
  generatedAt: z.string().datetime(),
  manifestKind: z.literal("provider-webhook-review-export-manifest"),
  manifestTarget: providerWebhookReviewExportManifestTargetSchema,
  exportKind: z.enum(["closure-evidence", "closure-report"]),
  format: z.literal("json"),
  contentType: z.literal("application/json"),
  safeFilename: z.string().min(1),
  exportedAt: z.string().datetime(),
  exportShapeVersion: z.string().min(1),
  unmatchedId: z.string().min(1).optional(),
  appliedFilters: providerWebhookReviewClosureReportFiltersSchema.optional(),
  totalItems: z.number().int().nonnegative(),
  totalOpenItems: z.number().int().nonnegative(),
  evidenceReadyCount: z.number().int().nonnegative(),
  evidenceBlockedCount: z.number().int().nonnegative(),
  evidenceIncompleteCount: z.number().int().nonnegative(),
  redactionStatus: providerWebhookReviewExportRedactionAuditStatusSchema,
  redactionIssueCount: z.number().int().nonnegative(),
  redactionPassedCount: z.number().int().nonnegative(),
  redactionWarningCount: z.number().int().nonnegative(),
  redactionBlockedCount: z.number().int().nonnegative(),
  integrityStatus: providerWebhookReviewExportManifestIntegrityStatusSchema,
  deterministicExportConfirmed: z.boolean(),
  safeDigest: z.string().min(1),
  safeReportDigest: z.string().min(1).optional(),
  manualQaReadiness: providerWebhookReviewExportManifestQaReadinessSchema,
  manualQaChecks: providerWebhookReviewExportManifestChecksSchema,
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookReviewExportManifest = z.infer<typeof providerWebhookReviewExportManifestSchema>;

export const providerWebhookReviewQaHandoffBundleEvidenceItemSchema = z.object({
  unmatchedId: z.string().min(1),
  provider: providerSandboxProviderSchema,
  platform: providerSandboxProviderSchema,
  safeRoomLabel: z.string().min(1),
  roomKeyDigest: z.string().min(1).nullable(),
  eventType: providerWebhookEventTypeSchema,
  receivedAt: z.string().datetime(),
  reviewStatus: providerWebhookUnmatchedReviewStatusSchema,
  linkStatus: providerWebhookUnmatchedLinkStatusSchema,
  unmatchedStatus: providerWebhookUnmatchedInboundStatusSchema,
  closureReadiness: providerWebhookReviewClosureReadinessSchema,
  evidenceStatus: providerWebhookReviewClosureEvidenceStatusSchema,
  safeFilename: z.string().min(1),
  safeDigest: z.string().min(1),
  redactionStatus: providerWebhookReviewExportRedactionAuditStatusSchema,
  integrityStatus: providerWebhookReviewExportManifestIntegrityStatusSchema,
  deterministicExportConfirmed: z.boolean(),
  manualQaReadiness: providerWebhookReviewExportManifestQaReadinessSchema,
  manualQaChecks: providerWebhookReviewExportManifestChecksSchema,
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookReviewQaHandoffBundleEvidenceItem = z.infer<typeof providerWebhookReviewQaHandoffBundleEvidenceItemSchema>;

export const providerWebhookReviewQaHandoffBundleReadinessSchema = z.object({
  reviewClosureEvidenceEnabled: z.boolean(),
  reviewClosureReportEnabled: z.boolean(),
  reviewClosureEvidenceExportEnabled: z.boolean(),
  reviewClosureReportExportEnabled: z.boolean(),
  reviewExportRedactionAuditEnabled: z.boolean(),
  reviewExportIntegrityChecksEnabled: z.boolean(),
  reviewExportManifestEnabled: z.boolean(),
  reviewExportQaHandoffEnabled: z.boolean(),
  closureEvidenceReadyCount: z.number().int().nonnegative(),
  closureEvidenceBlockedCount: z.number().int().nonnegative(),
  closureEvidenceIncompleteCount: z.number().int().nonnegative(),
  closureEvidenceExportCount: z.number().int().nonnegative(),
  closureReportExportCount: z.number().int().nonnegative(),
  exportRedactionPassedCount: z.number().int().nonnegative(),
  exportRedactionWarningCount: z.number().int().nonnegative(),
  exportRedactionBlockedCount: z.number().int().nonnegative(),
  exportManifestReadyCount: z.number().int().nonnegative(),
  exportManifestNeedsReviewCount: z.number().int().nonnegative(),
  exportManifestBlockedCount: z.number().int().nonnegative(),
  latestExportManifestStatus: providerWebhookReviewExportManifestQaReadinessSchema.nullable(),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookReviewQaHandoffBundleReadiness = z.infer<typeof providerWebhookReviewQaHandoffBundleReadinessSchema>;

export const providerWebhookReviewQaHandoffBundleChecksSchema = z.object({
  reportManifestReady: z.boolean(),
  reportRedactionPassedOrWarned: z.boolean(),
  reportIntegrityConfirmed: z.boolean(),
  evidenceManifestsReadyOrNeedsReview: z.boolean(),
  safeFilenamePresent: z.boolean(),
  safeDigestPresent: z.boolean(),
  rawPayloadAbsent: z.boolean(),
  rawSignatureAbsent: z.boolean(),
  tokenAbsent: z.boolean(),
  replyTokenAbsent: z.boolean(),
  rawSenderIdAbsent: z.boolean(),
  rawRoomIdAbsent: z.boolean(),
  providerOutboundAbsent: z.boolean(),
  externalCallsZero: z.boolean(),
  readinessFlagsPresent: z.boolean()
}).strict();
export type ProviderWebhookReviewQaHandoffBundleChecks = z.infer<typeof providerWebhookReviewQaHandoffBundleChecksSchema>;

export const providerWebhookReviewQaHandoffBundleSchema = z.object({
  generatedAt: z.string().datetime(),
  bundleKind: z.literal("provider-webhook-review-qa-handoff-bundle"),
  appliedFilters: providerWebhookReviewClosureReportFiltersSchema,
  readiness: providerWebhookReviewQaHandoffBundleReadinessSchema,
  closureReportExport: providerWebhookReviewClosureReportExportSchema,
  closureReportManifest: providerWebhookReviewExportManifestSchema,
  closureReportRedactionAudit: providerWebhookReviewExportRedactionAuditSchema,
  closureExportIntegrity: providerWebhookReviewExportIntegritySchema,
  evidenceManifests: z.array(providerWebhookReviewQaHandoffBundleEvidenceItemSchema),
  manualQaReadiness: providerWebhookReviewExportManifestQaReadinessSchema,
  manualQaChecks: providerWebhookReviewQaHandoffBundleChecksSchema,
  safeFilename: z.string().min(1),
  safeDigest: z.string().min(1),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookReviewQaHandoffBundle = z.infer<typeof providerWebhookReviewQaHandoffBundleSchema>;

export const providerWebhookReviewQaHandoffBundleExportSchema = z.object({
  generatedAt: z.string().datetime(),
  exportedAt: z.string().datetime(),
  exportKind: z.literal("qa-handoff-bundle"),
  format: z.literal("json"),
  contentType: z.literal("application/json"),
  safeFilename: z.string().min(1),
  safeDigest: z.string().min(1),
  status: providerWebhookReviewExportManifestQaReadinessSchema,
  counts: z.object({
    totalItems: z.number().int().nonnegative(),
    totalOpenItems: z.number().int().nonnegative(),
    evidenceManifestCount: z.number().int().nonnegative(),
    closureEvidenceReadyCount: z.number().int().nonnegative(),
    closureEvidenceBlockedCount: z.number().int().nonnegative(),
    closureEvidenceIncompleteCount: z.number().int().nonnegative()
  }).strict(),
  readinessFlags: z.object({
    reviewClosureEvidenceEnabled: z.boolean(),
    reviewClosureReportEnabled: z.boolean(),
    reviewClosureEvidenceExportEnabled: z.boolean(),
    reviewClosureReportExportEnabled: z.boolean(),
    reviewExportRedactionAuditEnabled: z.boolean(),
    reviewExportIntegrityChecksEnabled: z.boolean(),
    reviewExportManifestEnabled: z.boolean(),
    reviewExportQaHandoffEnabled: z.boolean()
  }).strict(),
  closureEvidenceSummary: z.object({
    readyCount: z.number().int().nonnegative(),
    blockedCount: z.number().int().nonnegative(),
    incompleteCount: z.number().int().nonnegative(),
    exportCount: z.number().int().nonnegative(),
    externalCalls: z.literal(0)
  }).strict(),
  exportManifestSummary: z.object({
    readyCount: z.number().int().nonnegative(),
    needsReviewCount: z.number().int().nonnegative(),
    blockedCount: z.number().int().nonnegative(),
    latestStatus: providerWebhookReviewExportManifestQaReadinessSchema.nullable(),
    reportManifestReadiness: providerWebhookReviewExportManifestQaReadinessSchema,
    reportManifestIntegrityStatus: providerWebhookReviewExportManifestIntegrityStatusSchema,
    externalCalls: z.literal(0)
  }).strict(),
  redactionAuditSummary: z.object({
    status: providerWebhookReviewExportRedactionAuditStatusSchema,
    issueCount: z.number().int().nonnegative(),
    passedCount: z.number().int().nonnegative(),
    warningCount: z.number().int().nonnegative(),
    blockedCount: z.number().int().nonnegative(),
    rawPayloadAbsent: z.boolean(),
    rawSignatureAbsent: z.boolean(),
    tokenAbsent: z.boolean(),
    replyTokenAbsent: z.boolean(),
    rawSenderIdAbsent: z.boolean(),
    rawRoomIdAbsent: z.boolean(),
    providerOutboundAbsent: z.boolean(),
    externalCallsZero: z.boolean(),
    externalCalls: z.literal(0)
  }).strict(),
  integritySummary: z.object({
    status: providerWebhookReviewExportManifestIntegrityStatusSchema,
    totalCheckedItems: z.number().int().nonnegative(),
    deterministicExportConfirmed: z.boolean(),
    safeReportDigest: z.string().min(1),
    externalCalls: z.literal(0)
  }).strict(),
  manualQaChecks: providerWebhookReviewQaHandoffBundleChecksSchema,
  bundle: providerWebhookReviewQaHandoffBundleSchema,
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookReviewQaHandoffBundleExport = z.infer<typeof providerWebhookReviewQaHandoffBundleExportSchema>;

export const providerWebhookReviewQaHandoffAcknowledgementStatusSchema = z.enum(["not_acknowledged", "acknowledged", "signed_off"]);
export type ProviderWebhookReviewQaHandoffAcknowledgementStatus = z.infer<typeof providerWebhookReviewQaHandoffAcknowledgementStatusSchema>;

export const providerWebhookReviewQaHandoffReceiptSchema = z.object({
  generatedAt: z.string().datetime(),
  receiptStatus: providerWebhookReviewQaHandoffAcknowledgementStatusSchema,
  bundleStatus: providerWebhookReviewExportManifestQaReadinessSchema,
  exportStatus: providerWebhookReviewExportManifestQaReadinessSchema,
  safeFilename: z.string().min(1),
  safeDigest: z.string().min(1),
  bundleDigest: z.string().min(1),
  exportDigest: z.string().min(1),
  readinessFlags: providerWebhookReviewQaHandoffBundleExportSchema.shape.readinessFlags,
  counts: providerWebhookReviewQaHandoffBundleExportSchema.shape.counts,
  manualQaChecks: providerWebhookReviewQaHandoffBundleChecksSchema,
  reviewerRole: z.string().min(1).nullable(),
  reviewerLabel: z.string().min(1).nullable(),
  acknowledgedAt: z.string().datetime().nullable(),
  signedAt: z.string().datetime().nullable(),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookReviewQaHandoffReceipt = z.infer<typeof providerWebhookReviewQaHandoffReceiptSchema>;

export const providerWebhookReviewQaHandoffSignOffRequestSchema = z.object({
  acknowledgementType: z.enum(["acknowledge", "sign_off"]).default("sign_off"),
  reviewerRole: z.string().trim().min(1).max(80).optional(),
  reviewerLabel: z.string().trim().min(1).max(80).optional()
}).strict();
export type ProviderWebhookReviewQaHandoffSignOffRequest = z.infer<typeof providerWebhookReviewQaHandoffSignOffRequestSchema>;

export const providerWebhookReviewQaHandoffSignOffResponseSchema = providerWebhookReviewQaHandoffReceiptSchema.extend({
  signOffStatus: providerWebhookReviewQaHandoffAcknowledgementStatusSchema,
  signOffRecordId: z.string().min(1),
  action: z.enum(["acknowledge", "sign_off"])
}).strict();
export type ProviderWebhookReviewQaHandoffSignOffResponse = z.infer<typeof providerWebhookReviewQaHandoffSignOffResponseSchema>;

export const providerWebhookReviewQaHandoffAcceptanceLockRequestSchema = z.object({
  lockReason: z.string().trim().min(1).max(160).optional(),
  acceptedByRole: z.string().trim().min(1).max(80).optional(),
  acceptedByLabel: z.string().trim().min(1).max(80).optional()
}).strict();
export type ProviderWebhookReviewQaHandoffAcceptanceLockRequest = z.infer<typeof providerWebhookReviewQaHandoffAcceptanceLockRequestSchema>;

export const providerWebhookReviewQaHandoffAcceptanceLockSchema = z.object({
  generatedAt: z.string().datetime(),
  lockStatus: z.enum(["unlocked", "locked"]),
  lockRecordId: z.string().min(1).nullable(),
  lockAction: z.enum(["none", "locked", "already_locked"]),
  safeFilename: z.string().min(1),
  safeDigest: z.string().min(1),
  receiptDigest: z.string().min(1),
  bundleDigest: z.string().min(1),
  exportDigest: z.string().min(1),
  appliedFilters: providerWebhookReviewClosureReportFiltersSchema,
  lockedUnmatchedInboundIds: z.array(z.string().min(1)),
  lockedItemCount: z.number().int().nonnegative(),
  lockedOpenItemCount: z.number().int().nonnegative(),
  lockReason: z.string().min(1).nullable(),
  acceptedByRole: z.string().min(1).nullable(),
  acceptedByLabel: z.string().min(1).nullable(),
  lockedAt: z.string().datetime().nullable(),
  receiptStatus: providerWebhookReviewQaHandoffAcknowledgementStatusSchema,
  bundleStatus: providerWebhookReviewExportManifestQaReadinessSchema,
  exportStatus: providerWebhookReviewExportManifestQaReadinessSchema,
  acceptanceChecks: z.object({
    receiptSignedOff: z.boolean(),
    bundleDigestMatches: z.boolean(),
    exportDigestMatches: z.boolean(),
    lockedItemScopePresent: z.boolean(),
    safeDigestPresent: z.boolean(),
    providerOutboundAbsent: z.boolean(),
    externalCallsZero: z.boolean()
  }).strict(),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookReviewQaHandoffAcceptanceLock = z.infer<typeof providerWebhookReviewQaHandoffAcceptanceLockSchema>;

export const providerWebhookUnmatchedInboundBulkReviewRequestSchema = z.object({
  ids: z.array(z.string().trim().min(1)).min(1).max(50),
  reviewStatus: z.enum(["reviewed", "skipped"]),
  reason: z.string().trim().max(160).optional()
}).strict();
export type ProviderWebhookUnmatchedInboundBulkReviewRequest = z.infer<typeof providerWebhookUnmatchedInboundBulkReviewRequestSchema>;

export const providerWebhookUnmatchedInboundBulkReviewResultStatusSchema = z.enum([
  "updated",
  "already-applied",
  "not-found",
  "conflict"
]);
export type ProviderWebhookUnmatchedInboundBulkReviewResultStatus = z.infer<typeof providerWebhookUnmatchedInboundBulkReviewResultStatusSchema>;

export const providerWebhookUnmatchedInboundBulkReviewItemResultSchema = z.object({
  id: z.string().min(1),
  ok: z.boolean(),
  resultStatus: providerWebhookUnmatchedInboundBulkReviewResultStatusSchema,
  reviewStatus: z.enum(["reviewed", "skipped"]).nullable(),
  unmatchedStatus: providerWebhookUnmatchedInboundStatusSchema.nullable(),
  error: z.string().min(1).nullable(),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookUnmatchedInboundBulkReviewItemResult = z.infer<typeof providerWebhookUnmatchedInboundBulkReviewItemResultSchema>;

export const providerWebhookUnmatchedInboundBulkReviewResponseSchema = z.object({
  reviewStatus: z.enum(["reviewed", "skipped"]),
  results: z.array(providerWebhookUnmatchedInboundBulkReviewItemResultSchema),
  summary: z.object({
    requestedCount: z.number().int().nonnegative(),
    dedupedCount: z.number().int().nonnegative(),
    successCount: z.number().int().nonnegative(),
    errorCount: z.number().int().nonnegative(),
    updatedCount: z.number().int().nonnegative(),
    alreadyAppliedCount: z.number().int().nonnegative()
  }).strict(),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookUnmatchedInboundBulkReviewResponse = z.infer<typeof providerWebhookUnmatchedInboundBulkReviewResponseSchema>;

export const providerWebhookUnmatchedInboundBulkAssignmentRequestSchema = z.object({
  ids: z.array(z.string().trim().min(1)).min(1).max(50),
  operation: providerWebhookReviewAssignmentOperationSchema,
  assignedToOperatorLabel: z.string().trim().min(1).max(80).optional(),
  note: z.string().trim().max(240).optional()
}).strict();
export type ProviderWebhookUnmatchedInboundBulkAssignmentRequest = z.infer<typeof providerWebhookUnmatchedInboundBulkAssignmentRequestSchema>;

export const providerWebhookUnmatchedInboundBulkEscalationRequestSchema = z.object({
  ids: z.array(z.string().trim().min(1)).min(1).max(50),
  operation: providerWebhookReviewEscalationOperationSchema,
  escalationReason: providerWebhookReviewEscalationReasonSchema.optional(),
  note: z.string().trim().max(240).optional()
}).strict();
export type ProviderWebhookUnmatchedInboundBulkEscalationRequest = z.infer<typeof providerWebhookUnmatchedInboundBulkEscalationRequestSchema>;

export const providerWebhookUnmatchedInboundBulkMetadataResultStatusSchema = z.enum([
  "updated",
  "already-applied",
  "not-found",
  "conflict"
]);
export type ProviderWebhookUnmatchedInboundBulkMetadataResultStatus = z.infer<typeof providerWebhookUnmatchedInboundBulkMetadataResultStatusSchema>;

export const providerWebhookUnmatchedInboundBulkMetadataItemResultSchema = z.object({
  id: z.string().min(1),
  ok: z.boolean(),
  resultStatus: providerWebhookUnmatchedInboundBulkMetadataResultStatusSchema,
  assignmentStatus: providerWebhookReviewAssignmentStatusSchema.nullable(),
  escalationStatus: providerWebhookReviewEscalationStatusSchema.nullable(),
  escalationReason: providerWebhookReviewEscalationReasonSchema.nullable(),
  error: z.string().min(1).nullable(),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookUnmatchedInboundBulkMetadataItemResult = z.infer<typeof providerWebhookUnmatchedInboundBulkMetadataItemResultSchema>;

export const providerWebhookUnmatchedInboundBulkAssignmentResponseSchema = z.object({
  operation: providerWebhookReviewAssignmentOperationSchema,
  results: z.array(providerWebhookUnmatchedInboundBulkMetadataItemResultSchema),
  summary: z.object({
    requestedCount: z.number().int().nonnegative(),
    dedupedCount: z.number().int().nonnegative(),
    successCount: z.number().int().nonnegative(),
    errorCount: z.number().int().nonnegative(),
    updatedCount: z.number().int().nonnegative(),
    alreadyAppliedCount: z.number().int().nonnegative()
  }).strict(),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookUnmatchedInboundBulkAssignmentResponse = z.infer<typeof providerWebhookUnmatchedInboundBulkAssignmentResponseSchema>;

export const providerWebhookUnmatchedInboundBulkEscalationResponseSchema = z.object({
  operation: providerWebhookReviewEscalationOperationSchema,
  results: z.array(providerWebhookUnmatchedInboundBulkMetadataItemResultSchema),
  summary: z.object({
    requestedCount: z.number().int().nonnegative(),
    dedupedCount: z.number().int().nonnegative(),
    successCount: z.number().int().nonnegative(),
    errorCount: z.number().int().nonnegative(),
    updatedCount: z.number().int().nonnegative(),
    alreadyAppliedCount: z.number().int().nonnegative()
  }).strict(),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookUnmatchedInboundBulkEscalationResponse = z.infer<typeof providerWebhookUnmatchedInboundBulkEscalationResponseSchema>;

export const providerWebhookUnmatchedInboundBulkResolutionOperationSchema = z.enum([
  "SET_RESOLUTION",
  "CLEAR_RESOLUTION",
  "COMPLETE_STEP",
  "RESET_CHECKLIST"
]);
export type ProviderWebhookUnmatchedInboundBulkResolutionOperation = z.infer<typeof providerWebhookUnmatchedInboundBulkResolutionOperationSchema>;

export const providerWebhookUnmatchedInboundBulkResolutionRequestSchema = z.object({
  ids: z.array(z.string().trim().min(1)).min(1).max(50),
  operation: providerWebhookUnmatchedInboundBulkResolutionOperationSchema,
  resolutionOutcome: providerWebhookReviewResolutionOutcomeSchema.optional(),
  step: providerWebhookReviewClosureChecklistStepSchema.optional(),
  note: z.string().trim().max(240).optional()
}).strict();
export type ProviderWebhookUnmatchedInboundBulkResolutionRequest = z.infer<typeof providerWebhookUnmatchedInboundBulkResolutionRequestSchema>;

export const providerWebhookUnmatchedInboundBulkResolutionItemResultSchema = z.object({
  id: z.string().min(1),
  ok: z.boolean(),
  resultStatus: providerWebhookUnmatchedInboundBulkMetadataResultStatusSchema,
  resolutionStatus: providerWebhookReviewResolutionStatusSchema.nullable(),
  resolutionOutcome: providerWebhookReviewResolutionOutcomeSchema.nullable(),
  closureReadiness: providerWebhookReviewClosureReadinessSchema.nullable(),
  checklistCompletedCount: z.number().int().nonnegative().nullable(),
  checklistTotalCount: z.number().int().nonnegative().nullable(),
  error: z.string().min(1).nullable(),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookUnmatchedInboundBulkResolutionItemResult = z.infer<typeof providerWebhookUnmatchedInboundBulkResolutionItemResultSchema>;

export const providerWebhookUnmatchedInboundBulkResolutionResponseSchema = z.object({
  operation: providerWebhookUnmatchedInboundBulkResolutionOperationSchema,
  results: z.array(providerWebhookUnmatchedInboundBulkResolutionItemResultSchema),
  summary: z.object({
    requestedCount: z.number().int().nonnegative(),
    dedupedCount: z.number().int().nonnegative(),
    successCount: z.number().int().nonnegative(),
    errorCount: z.number().int().nonnegative(),
    updatedCount: z.number().int().nonnegative(),
    alreadyAppliedCount: z.number().int().nonnegative()
  }).strict(),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookUnmatchedInboundBulkResolutionResponse = z.infer<typeof providerWebhookUnmatchedInboundBulkResolutionResponseSchema>;

export const providerWebhookUnmatchedInboundHistoryActionSchema = z.enum([
  "inbound_received",
  "normalized_routed",
  "unmatched_queued",
  "reviewed",
  "skipped",
  "linked_to_conversation",
  "linked_message_persisted",
  "bulk_reviewed",
  "bulk_skipped",
  "link_rejected",
  "operator_note_created",
  "assigned",
  "unassigned",
  "bulk_assigned",
  "bulk_unassigned",
  "escalated",
  "escalation_cleared",
  "bulk_escalated",
  "bulk_escalation_cleared",
  "resolution_set",
  "resolution_cleared",
  "bulk_resolution_set",
  "bulk_resolution_cleared",
  "checklist_completed",
  "checklist_uncompleted",
  "checklist_reset",
  "bulk_checklist_completed",
  "bulk_checklist_reset"
]);
export type ProviderWebhookUnmatchedInboundHistoryAction = z.infer<typeof providerWebhookUnmatchedInboundHistoryActionSchema>;

export const providerWebhookUnmatchedInboundHistoryEntrySchema = z.object({
  id: z.string().min(1),
  unmatchedInboundId: z.string().min(1),
  provider: providerSandboxProviderSchema,
  channelAccountId: z.string().min(1).nullable(),
  safeRoomLabel: z.string().min(1),
  roomKeyDigest: z.string().min(1).nullable(),
  eventType: providerWebhookEventTypeSchema,
  action: providerWebhookUnmatchedInboundHistoryActionSchema,
  actionStatus: z.string().min(1),
  statusBefore: z.string().min(1).nullable(),
  statusAfter: z.string().min(1).nullable(),
  actor: z.string().min(1).nullable(),
  reason: z.string().min(1).nullable(),
  message: z.string().min(1).nullable(),
  linkedConversationId: z.string().min(1).nullable(),
  linkedMessageId: z.string().min(1).nullable(),
  receivedAt: z.string().datetime().nullable(),
  actionAt: z.string().datetime(),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookUnmatchedInboundHistoryEntry = z.infer<typeof providerWebhookUnmatchedInboundHistoryEntrySchema>;

export const providerWebhookUnmatchedInboundHistorySchema = z.object({
  unmatchedInboundId: z.string().min(1),
  provider: providerSandboxProviderSchema,
  channelAccountId: z.string().min(1).nullable(),
  safeRoomLabel: z.string().min(1),
  roomKeyDigest: z.string().min(1).nullable(),
  entries: z.array(providerWebhookUnmatchedInboundHistoryEntrySchema),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookUnmatchedInboundHistory = z.infer<typeof providerWebhookUnmatchedInboundHistorySchema>;

export const providerWebhookUnmatchedInboundDiagnosticsWarningsSchema = z.object({
  signatureRejected: z.boolean(),
  replayDuplicate: z.boolean(),
  missingConversationMatch: z.boolean(),
  staleOpenItem: z.boolean()
}).strict();
export type ProviderWebhookUnmatchedInboundDiagnosticsWarnings = z.infer<typeof providerWebhookUnmatchedInboundDiagnosticsWarningsSchema>;

export const providerWebhookUnmatchedInboundDiagnosticsSchema = z.object({
  unmatchedId: z.string().min(1),
  provider: providerSandboxProviderSchema,
  platform: providerSandboxProviderSchema,
  channelAccountId: z.string().min(1).nullable(),
  safeRoomLabel: z.string().min(1),
  roomKeyDigest: z.string().min(1).nullable(),
  eventType: providerWebhookEventTypeSchema,
  receivedAt: z.string().datetime(),
  reviewStatus: providerWebhookUnmatchedReviewStatusSchema,
  linkStatus: providerWebhookUnmatchedLinkStatusSchema,
  unmatchedStatus: providerWebhookUnmatchedInboundStatusSchema,
  assignmentStatus: providerWebhookReviewAssignmentStatusSchema,
  assignedToOperatorLabel: z.string().min(1).nullable(),
  assignedAt: z.string().datetime().nullable(),
  assignedByOperatorLabel: z.string().min(1).nullable(),
  escalationStatus: providerWebhookReviewEscalationStatusSchema,
  escalationReason: providerWebhookReviewEscalationReasonSchema.nullable(),
  escalatedAt: z.string().datetime().nullable(),
  escalatedByOperatorLabel: z.string().min(1).nullable(),
  resolutionStatus: providerWebhookReviewResolutionStatusSchema.default("unresolved"),
  resolutionOutcome: providerWebhookReviewResolutionOutcomeSchema.nullable().default(null),
  resolvedAt: z.string().datetime().nullable().default(null),
  resolvedByOperatorLabel: z.string().min(1).nullable().default(null),
  closureReadiness: providerWebhookReviewClosureReadinessSchema.default("NOT_READY"),
  closureChecklist: z.array(providerWebhookReviewClosureChecklistItemSchema).default([]),
  checklistCompletedCount: z.number().int().nonnegative().default(0),
  checklistTotalCount: z.number().int().nonnegative().default(0),
  checklistIncompleteSteps: z.array(providerWebhookReviewClosureChecklistStepSchema).default([]),
  recommendedNextActions: z.array(providerWebhookReviewRecommendedNextActionSchema).default([]),
  lastOperatorNoteAt: z.string().datetime().nullable(),
  routingOutcome: z.string().min(1),
  normalizedEventType: providerWebhookNormalizedEventTypeSchema,
  persistenceOutcome: z.string().min(1),
  candidateLookupAvailable: z.boolean(),
  historyAvailable: z.boolean(),
  exportAvailable: z.boolean(),
  lastActionAt: z.string().datetime().nullable(),
  safeWarnings: providerWebhookUnmatchedInboundDiagnosticsWarningsSchema,
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookUnmatchedInboundDiagnostics = z.infer<typeof providerWebhookUnmatchedInboundDiagnosticsSchema>;

export const providerWebhookUnmatchedInboundExportFormatSchema = z.enum(["json", "csv"]);
export type ProviderWebhookUnmatchedInboundExportFormat = z.infer<typeof providerWebhookUnmatchedInboundExportFormatSchema>;

export const providerWebhookUnmatchedInboundExportQuerySchema = providerWebhookUnmatchedInboundFiltersSchema
  .omit({ limit: true })
  .extend({
    format: providerWebhookUnmatchedInboundExportFormatSchema.optional(),
    limit: z.coerce.number().int().min(1).max(5000).optional()
  })
  .strict();
export type ProviderWebhookUnmatchedInboundExportQuery = z.infer<typeof providerWebhookUnmatchedInboundExportQuerySchema>;

export const providerWebhookUnmatchedInboundExportRowSchema = z.object({
  id: z.string().min(1),
  provider: providerSandboxProviderSchema,
  channelAccountId: z.string().min(1).nullable(),
  safeRoomLabel: z.string().min(1),
  roomKeyDigest: z.string().min(1).nullable(),
  eventType: providerWebhookEventTypeSchema,
  reviewStatus: providerWebhookUnmatchedReviewStatusSchema,
  linkStatus: providerWebhookUnmatchedLinkStatusSchema,
  unmatchedStatus: providerWebhookUnmatchedInboundStatusSchema,
  receivedAt: z.string().datetime(),
  reviewedAt: z.string().datetime().nullable(),
  linkedConversationId: z.string().min(1).nullable(),
  candidateCount: z.number().int().nonnegative().nullable(),
  safeMessagePreview: z.string().min(1).nullable(),
  safeReason: z.string().min(1).nullable(),
  safeResultSummary: z.string().min(1).nullable(),
  assignmentStatus: providerWebhookReviewAssignmentStatusSchema,
  assignedToOperatorLabel: z.string().min(1).nullable(),
  assignedAt: z.string().datetime().nullable(),
  escalationStatus: providerWebhookReviewEscalationStatusSchema,
  escalationReason: providerWebhookReviewEscalationReasonSchema.nullable(),
  escalatedAt: z.string().datetime().nullable(),
  resolutionStatus: providerWebhookReviewResolutionStatusSchema.default("unresolved"),
  resolutionOutcome: providerWebhookReviewResolutionOutcomeSchema.nullable().default(null),
  closureReadiness: providerWebhookReviewClosureReadinessSchema.default("NOT_READY"),
  checklistCompletedCount: z.number().int().nonnegative().default(0),
  checklistTotalCount: z.number().int().nonnegative().default(0),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookUnmatchedInboundExportRow = z.infer<typeof providerWebhookUnmatchedInboundExportRowSchema>;

export const providerWebhookUnmatchedInboundExportSchema = z.object({
  format: providerWebhookUnmatchedInboundExportFormatSchema,
  rows: z.array(providerWebhookUnmatchedInboundExportRowSchema),
  csv: z.string().min(1).nullable(),
  appliedFilters: providerWebhookUnmatchedInboundExportQuerySchema,
  appliedSort: providerWebhookUnmatchedInboundAppliedSortSchema,
  requestedLimit: z.number().int().positive(),
  exportMaxLimit: z.number().int().positive(),
  exportedCount: z.number().int().nonnegative(),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookUnmatchedInboundExport = z.infer<typeof providerWebhookUnmatchedInboundExportSchema>;

export const apiReadinessSchema = z.object({
  status: z.literal("ok"),
  service: z.literal("api"),
  time: z.string().datetime(),
  externalCalls: z.literal(0),
  allowlist: providerAllowlistSummarySchema,
  apiMode: z.object({
    apiMode: z.string().min(1),
    dataMode: z.string().min(1),
    publicDataMode: z.string().min(1),
    apiModeExplicit: z.boolean(),
    dataModeExplicit: z.boolean(),
    publicDataModeExplicit: z.boolean(),
    apiBaseConfigured: z.boolean()
  }).strict(),
  dependencies: z.object({
    databaseConfigured: z.boolean(),
    redisConfigured: z.boolean()
  }).strict(),
  providerReadiness: providerReadinessSchema,
  monitoring: z.object({
    auditSafetyBaseline: z.boolean(),
    providerPayloadsExposed: z.literal(false),
    externalCalls: z.literal(0)
  }).strict(),
  checks: z.array(z.object({
    name: z.string().min(1),
    ok: z.boolean()
  }).strict())
}).strict();
export type ApiReadiness = z.infer<typeof apiReadinessSchema>;

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
  tenantId: z.string().min(1).optional(),
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
