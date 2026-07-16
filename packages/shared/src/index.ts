import { z } from "zod";

export const platformSchema = z.enum(["webchat", "telegram", "line", "facebook", "instagram"]);
export type Platform = z.infer<typeof platformSchema>;

export const providerSandboxProviderSchema = z.enum(["line", "telegram", "facebook", "instagram"]);
export type ProviderSandboxProvider = z.infer<typeof providerSandboxProviderSchema>;

/**
 * Redis pub/sub channel used to bridge webchat outbound replies from the worker
 * process to the API process, which relays them to customer widgets over SSE.
 */
export const WEBCHAT_OUTBOUND_CHANNEL = "webchat:outbound";

export type WebchatOutboundEvent = {
  tenantId: string;
  conversationId: string;
  messageId: string;
  senderType: string;
  text: string | null;
  createdAt: string;
};

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
  sizeBytes: z.number().int().nonnegative().optional(),
  externalRef: z.string().optional()
});
export type AttachmentInput = z.infer<typeof attachmentInputSchema>;

// ---- Media upload (STEP 6) ----
export const MEDIA_IMAGE_MAX_BYTES = 10 * 1024 * 1024;
export const MEDIA_FILE_MAX_BYTES = 25 * 1024 * 1024;

export const allowedImageMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/heic",
  "image/heif"
] as const;

export const allowedAudioMimeTypes = [
  "audio/mpeg",
  "audio/mp4",
  "audio/ogg",
  "audio/wav",
  "audio/webm",
  "audio/aac"
] as const;

export type MediaAttachmentType = Exclude<MessageType, "text" | "event">;

export function classifyAttachmentType(mimeType: string | undefined | null): MediaAttachmentType {
  const value = (mimeType ?? "").toLowerCase();
  if ((allowedImageMimeTypes as readonly string[]).includes(value) || value.startsWith("image/")) {
    return "image";
  }
  if ((allowedAudioMimeTypes as readonly string[]).includes(value) || value.startsWith("audio/")) {
    return "audio";
  }
  return "file";
}

export function mediaSizeLimitFor(type: MediaAttachmentType): number {
  return type === "image" ? MEDIA_IMAGE_MAX_BYTES : MEDIA_FILE_MAX_BYTES;
}

export type MediaUploadValidation =
  | { ok: true; type: MediaAttachmentType; limitBytes: number }
  | { ok: false; reason: string };

export function validateMediaUpload(input: {
  mimeType?: string | null;
  sizeBytes: number;
  filename?: string | null;
}): MediaUploadValidation {
  if (!Number.isFinite(input.sizeBytes) || input.sizeBytes <= 0) {
    return { ok: false, reason: "File is empty" };
  }
  const type = classifyAttachmentType(input.mimeType);
  const limitBytes = mediaSizeLimitFor(type);
  if (input.sizeBytes > limitBytes) {
    const limitMb = Math.round(limitBytes / (1024 * 1024));
    return { ok: false, reason: `File exceeds the ${limitMb}MB limit for ${type}` };
  }
  return { ok: true, type, limitBytes };
}

export const mediaUploadRequestSchema = z.object({
  filename: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(255),
  dataBase64: z.string().min(1)
});
export type MediaUploadRequest = z.infer<typeof mediaUploadRequestSchema>;

export const mediaUploadResultSchema = z.object({
  type: messageTypeSchema.exclude(["text", "event"]),
  url: z.string().min(1),
  storageKey: z.string().min(1),
  filename: z.string(),
  mimeType: z.string(),
  sizeBytes: z.number().int().nonnegative()
});
export type MediaUploadResult = z.infer<typeof mediaUploadResultSchema>;

export const messageAttachmentSchema = z.object({
  id: z.string().min(1),
  type: messageTypeSchema.exclude(["text", "event"]),
  url: z.string().nullable().optional(),
  storageKey: z.string().nullable().optional(),
  filename: z.string().nullable().optional(),
  mimeType: z.string().nullable().optional(),
  sizeBytes: z.number().int().nonnegative().nullable().optional()
});
export type MessageAttachment = z.infer<typeof messageAttachmentSchema>;

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
  reviewQaHandoffLockedArchiveEnabled: z.boolean().default(false),
  reviewQaHandoffRetentionManifestEnabled: z.boolean().default(false),
  lockedArchiveReadyCount: z.number().int().nonnegative().default(0),
  lockedArchiveExportedCount: z.number().int().nonnegative().default(0),
  retentionManifestReadyCount: z.number().int().nonnegative().default(0),
  latestLockedArchiveStatus: z.enum(["ready", "exported"]).nullable().default(null),
  latestRetentionManifestStatus: z.enum(["ready"]).nullable().default(null),
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

export const providerWebhookReviewQaHandoffLockedArchiveAcknowledgementStatusSchema = z.enum(["not_exported", "exported"]);
export type ProviderWebhookReviewQaHandoffLockedArchiveAcknowledgementStatus = z.infer<typeof providerWebhookReviewQaHandoffLockedArchiveAcknowledgementStatusSchema>;

export const providerWebhookReviewQaHandoffLockedArchiveStatusSchema = z.object({
  generatedAt: z.string().datetime(),
  lockedArchiveStatus: z.enum(["ready", "exported"]),
  retentionManifestStatus: z.enum(["ready"]),
  archiveAcknowledgementStatus: providerWebhookReviewQaHandoffLockedArchiveAcknowledgementStatusSchema,
  acceptanceStatus: z.enum(["locked"]),
  lockStatus: z.literal("locked"),
  receiptStatus: providerWebhookReviewQaHandoffAcknowledgementStatusSchema,
  signOffStatus: providerWebhookReviewQaHandoffAcknowledgementStatusSchema,
  bundleStatus: providerWebhookReviewExportManifestQaReadinessSchema,
  exportStatus: providerWebhookReviewExportManifestQaReadinessSchema,
  safeFilename: z.string().min(1),
  safeDigest: z.string().min(1),
  bundleDigest: z.string().min(1),
  exportDigest: z.string().min(1),
  receiptDigest: z.string().min(1),
  acceptanceLockDigest: z.string().min(1),
  lockRecordId: z.string().min(1),
  readinessFlags: providerWebhookReviewQaHandoffBundleExportSchema.shape.readinessFlags,
  counts: providerWebhookReviewQaHandoffBundleExportSchema.shape.counts.extend({
    lockedItemCount: z.number().int().nonnegative(),
    lockedOpenItemCount: z.number().int().nonnegative()
  }).strict(),
  manualQaChecks: providerWebhookReviewQaHandoffBundleChecksSchema,
  retentionPolicyLabel: z.string().min(1),
  archivedAt: z.string().datetime().nullable(),
  exportedAt: z.string().datetime().nullable(),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookReviewQaHandoffLockedArchiveStatus = z.infer<typeof providerWebhookReviewQaHandoffLockedArchiveStatusSchema>;

export const providerWebhookReviewQaHandoffLockedArchiveExportSchema = providerWebhookReviewQaHandoffLockedArchiveStatusSchema.extend({
  exportedAt: z.string().datetime(),
  exportKind: z.literal("qa-handoff-locked-archive"),
  format: z.literal("json"),
  contentType: z.literal("application/json")
}).strict();
export type ProviderWebhookReviewQaHandoffLockedArchiveExport = z.infer<typeof providerWebhookReviewQaHandoffLockedArchiveExportSchema>;

export const providerWebhookReviewQaHandoffRetentionManifestSchema = z.object({
  generatedAt: z.string().datetime(),
  manifestKind: z.literal("qa-handoff-locked-archive-retention-manifest"),
  retentionManifestStatus: z.enum(["ready"]),
  lockedArchiveStatus: z.enum(["ready", "exported"]),
  archiveAcknowledgementStatus: providerWebhookReviewQaHandoffLockedArchiveAcknowledgementStatusSchema,
  acceptanceStatus: z.enum(["locked"]),
  lockStatus: z.literal("locked"),
  receiptStatus: providerWebhookReviewQaHandoffAcknowledgementStatusSchema,
  signOffStatus: providerWebhookReviewQaHandoffAcknowledgementStatusSchema,
  bundleStatus: providerWebhookReviewExportManifestQaReadinessSchema,
  exportStatus: providerWebhookReviewExportManifestQaReadinessSchema,
  safeFilename: z.string().min(1),
  safeDigest: z.string().min(1),
  archiveDigest: z.string().min(1),
  bundleDigest: z.string().min(1),
  exportDigest: z.string().min(1),
  receiptDigest: z.string().min(1),
  acceptanceLockDigest: z.string().min(1),
  retentionPolicyLabel: z.string().min(1),
  retentionReadiness: z.enum(["ready"]),
  readinessFlags: providerWebhookReviewQaHandoffBundleExportSchema.shape.readinessFlags,
  counts: providerWebhookReviewQaHandoffLockedArchiveStatusSchema.shape.counts,
  manualQaChecks: providerWebhookReviewQaHandoffBundleChecksSchema,
  archivedAt: z.string().datetime().nullable(),
  exportedAt: z.string().datetime().nullable(),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookReviewQaHandoffRetentionManifest = z.infer<typeof providerWebhookReviewQaHandoffRetentionManifestSchema>;

export const providerWebhookReviewQaHandoffArchiveIntegrityStatusSchema = z.enum(["confirmed", "needs_review", "blocked"]);
export type ProviderWebhookReviewQaHandoffArchiveIntegrityStatus = z.infer<typeof providerWebhookReviewQaHandoffArchiveIntegrityStatusSchema>;

export const providerWebhookReviewQaHandoffDigestChainStatusSchema = z.enum(["confirmed", "needs_review", "blocked"]);
export type ProviderWebhookReviewQaHandoffDigestChainStatus = z.infer<typeof providerWebhookReviewQaHandoffDigestChainStatusSchema>;

export const providerWebhookReviewQaHandoffArchiveAuditAcknowledgementStatusSchema = z.enum(["not_acknowledged", "acknowledged"]);
export type ProviderWebhookReviewQaHandoffArchiveAuditAcknowledgementStatus = z.infer<typeof providerWebhookReviewQaHandoffArchiveAuditAcknowledgementStatusSchema>;

export const providerWebhookReviewQaHandoffRetentionPolicyStatusSchema = z.enum(["active", "needs_review", "blocked"]);
export type ProviderWebhookReviewQaHandoffRetentionPolicyStatus = z.infer<typeof providerWebhookReviewQaHandoffRetentionPolicyStatusSchema>;

export const providerWebhookReviewQaHandoffArchiveIntegritySchema = z.object({
  generatedAt: z.string().datetime(),
  integrityStatus: providerWebhookReviewQaHandoffArchiveIntegrityStatusSchema,
  retentionAuditStatus: providerWebhookReviewQaHandoffArchiveIntegrityStatusSchema,
  lockedArchiveStatus: z.enum(["ready", "exported"]),
  retentionManifestStatus: z.enum(["ready"]),
  archiveAcknowledgementStatus: providerWebhookReviewQaHandoffLockedArchiveAcknowledgementStatusSchema,
  auditAcknowledgementStatus: providerWebhookReviewQaHandoffArchiveAuditAcknowledgementStatusSchema,
  acceptanceStatus: z.enum(["locked"]),
  lockStatus: z.literal("locked"),
  receiptStatus: providerWebhookReviewQaHandoffAcknowledgementStatusSchema,
  signOffStatus: providerWebhookReviewQaHandoffAcknowledgementStatusSchema,
  bundleStatus: providerWebhookReviewExportManifestQaReadinessSchema,
  exportStatus: providerWebhookReviewExportManifestQaReadinessSchema,
  safeFilename: z.string().min(1),
  safeDigest: z.string().min(1),
  bundleDigest: z.string().min(1),
  exportDigest: z.string().min(1),
  receiptDigest: z.string().min(1),
  acceptanceLockDigest: z.string().min(1),
  lockedArchiveDigest: z.string().min(1),
  retentionManifestDigest: z.string().min(1),
  digestChainStatus: providerWebhookReviewQaHandoffDigestChainStatusSchema,
  safeCheckLabels: z.array(z.string().min(1)).min(1),
  readinessFlags: providerWebhookReviewQaHandoffBundleExportSchema.shape.readinessFlags,
  counts: providerWebhookReviewQaHandoffLockedArchiveStatusSchema.shape.counts.extend({
    digestChainLinkCount: z.number().int().nonnegative(),
    integrityCheckedCount: z.number().int().nonnegative()
  }).strict(),
  manualQaChecks: providerWebhookReviewQaHandoffBundleChecksSchema,
  archivedAt: z.string().datetime().nullable(),
  exportedAt: z.string().datetime().nullable(),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookReviewQaHandoffArchiveIntegrity = z.infer<typeof providerWebhookReviewQaHandoffArchiveIntegritySchema>;

export const providerWebhookReviewQaHandoffRetentionAuditSchema = z.object({
  generatedAt: z.string().datetime(),
  retentionPolicyStatus: providerWebhookReviewQaHandoffRetentionPolicyStatusSchema,
  retentionAuditStatus: providerWebhookReviewQaHandoffArchiveIntegrityStatusSchema,
  retentionManifestStatus: z.enum(["ready"]),
  lockedArchiveStatus: z.enum(["ready", "exported"]),
  archiveAcknowledgementStatus: providerWebhookReviewQaHandoffLockedArchiveAcknowledgementStatusSchema,
  auditAcknowledgementStatus: providerWebhookReviewQaHandoffArchiveAuditAcknowledgementStatusSchema,
  acceptanceStatus: z.enum(["locked"]),
  lockStatus: z.literal("locked"),
  safePolicyLabel: z.string().min(1),
  safeRetentionWindowLabel: z.string().min(1),
  safeFilename: z.string().min(1),
  safeDigest: z.string().min(1),
  lockedArchiveDigest: z.string().min(1),
  retentionManifestDigest: z.string().min(1),
  digestChainStatus: providerWebhookReviewQaHandoffDigestChainStatusSchema,
  auditChecklistItems: z.array(z.object({
    key: z.string().min(1),
    label: z.string().min(1),
    status: providerWebhookReviewQaHandoffArchiveIntegrityStatusSchema
  }).strict()).min(1),
  counts: providerWebhookReviewQaHandoffLockedArchiveStatusSchema.shape.counts.extend({
    auditChecklistPassedCount: z.number().int().nonnegative(),
    auditChecklistNeedsReviewCount: z.number().int().nonnegative(),
    auditChecklistBlockedCount: z.number().int().nonnegative()
  }).strict(),
  archivedAt: z.string().datetime().nullable(),
  exportedAt: z.string().datetime().nullable(),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookReviewQaHandoffRetentionAudit = z.infer<typeof providerWebhookReviewQaHandoffRetentionAuditSchema>;

export const providerWebhookReviewQaHandoffArchiveFinalizationStatusSchema = z.enum(["ready", "finalized", "blocked"]);
export type ProviderWebhookReviewQaHandoffArchiveFinalizationStatus = z.infer<typeof providerWebhookReviewQaHandoffArchiveFinalizationStatusSchema>;

export const providerWebhookReviewQaHandoffRetentionSignOffStatusSchema = z.enum(["not_signed", "signed_off"]);
export type ProviderWebhookReviewQaHandoffRetentionSignOffStatus = z.infer<typeof providerWebhookReviewQaHandoffRetentionSignOffStatusSchema>;

export const providerWebhookReviewQaHandoffFinalizationReceiptStatusSchema = z.enum(["not_created", "ready"]);
export type ProviderWebhookReviewQaHandoffFinalizationReceiptStatus = z.infer<typeof providerWebhookReviewQaHandoffFinalizationReceiptStatusSchema>;

export const providerWebhookReviewQaHandoffFinalizationBaseSchema = z.object({
  generatedAt: z.string().datetime(),
  finalizationStatus: providerWebhookReviewQaHandoffArchiveFinalizationStatusSchema,
  retentionSignOffStatus: providerWebhookReviewQaHandoffRetentionSignOffStatusSchema,
  finalizationReceiptStatus: providerWebhookReviewQaHandoffFinalizationReceiptStatusSchema,
  integrityStatus: providerWebhookReviewQaHandoffArchiveIntegrityStatusSchema,
  retentionAuditStatus: providerWebhookReviewQaHandoffArchiveIntegrityStatusSchema,
  lockedArchiveStatus: z.enum(["ready", "exported"]),
  retentionManifestStatus: z.enum(["ready"]),
  archiveAcknowledgementStatus: providerWebhookReviewQaHandoffLockedArchiveAcknowledgementStatusSchema,
  auditAcknowledgementStatus: providerWebhookReviewQaHandoffArchiveAuditAcknowledgementStatusSchema,
  acceptanceStatus: z.enum(["locked"]),
  lockStatus: z.literal("locked"),
  receiptStatus: providerWebhookReviewQaHandoffAcknowledgementStatusSchema,
  signOffStatus: providerWebhookReviewQaHandoffAcknowledgementStatusSchema,
  digestChainStatus: providerWebhookReviewQaHandoffDigestChainStatusSchema,
  safeFilename: z.string().min(1),
  safeDigest: z.string().min(1),
  bundleDigest: z.string().min(1),
  exportDigest: z.string().min(1),
  receiptDigest: z.string().min(1),
  acceptanceLockDigest: z.string().min(1),
  lockedArchiveDigest: z.string().min(1),
  retentionManifestDigest: z.string().min(1),
  integrityDigest: z.string().min(1),
  finalizationReceiptDigest: z.string().min(1).nullable(),
  safeRetentionPolicyLabel: z.string().min(1),
  safeReviewerLabel: z.string().min(1).nullable(),
  safeCheckLabels: z.array(z.string().min(1)).min(1),
  readinessFlags: providerWebhookReviewQaHandoffBundleExportSchema.shape.readinessFlags,
  counts: providerWebhookReviewQaHandoffLockedArchiveStatusSchema.shape.counts.extend({
    digestChainLinkCount: z.number().int().nonnegative(),
    integrityCheckedCount: z.number().int().nonnegative().optional(),
    finalizationCheckedCount: z.number().int().nonnegative(),
    retentionSignOffCount: z.number().int().nonnegative()
  }).strict(),
  manualQaChecks: providerWebhookReviewQaHandoffBundleChecksSchema,
  archivedAt: z.string().datetime().nullable(),
  exportedAt: z.string().datetime().nullable(),
  signedAt: z.string().datetime().nullable(),
  finalizedAt: z.string().datetime().nullable(),
  externalCalls: z.literal(0)
}).strict();

export const providerWebhookReviewQaHandoffArchiveFinalizationSchema = providerWebhookReviewQaHandoffFinalizationBaseSchema;
export type ProviderWebhookReviewQaHandoffArchiveFinalization = z.infer<typeof providerWebhookReviewQaHandoffArchiveFinalizationSchema>;

export const providerWebhookReviewQaHandoffFinalizationSignOffRequestSchema = z.object({
  action: z.literal("sign_off").default("sign_off"),
  reviewerRole: z.string().trim().min(1).max(80).default("retention reviewer"),
  reviewerLabel: z.string().trim().min(1).max(120).optional()
}).strict();
export type ProviderWebhookReviewQaHandoffFinalizationSignOffRequest = z.input<typeof providerWebhookReviewQaHandoffFinalizationSignOffRequestSchema>;

export const providerWebhookReviewQaHandoffFinalizationSignOffResponseSchema = providerWebhookReviewQaHandoffFinalizationBaseSchema.extend({
  finalizationStatus: z.literal("finalized"),
  retentionSignOffStatus: z.literal("signed_off"),
  finalizationReceiptStatus: z.literal("ready"),
  action: z.literal("sign_off"),
  signOffRecordId: z.string().min(1)
}).strict();
export type ProviderWebhookReviewQaHandoffFinalizationSignOffResponse = z.infer<typeof providerWebhookReviewQaHandoffFinalizationSignOffResponseSchema>;

export const providerWebhookReviewQaHandoffFinalizationReceiptSchema = providerWebhookReviewQaHandoffFinalizationBaseSchema.extend({
  receiptKind: z.literal("qa-handoff-locked-archive-finalization-receipt"),
  finalizationStatus: z.literal("finalized"),
  retentionSignOffStatus: z.literal("signed_off"),
  finalizationReceiptStatus: z.literal("ready"),
  signOffRecordId: z.string().min(1)
}).strict();
export type ProviderWebhookReviewQaHandoffFinalizationReceipt = z.infer<typeof providerWebhookReviewQaHandoffFinalizationReceiptSchema>;

export const providerWebhookReviewQaHandoffReleaseReadinessStatusSchema = z.enum(["ready_for_release"]);
export type ProviderWebhookReviewQaHandoffReleaseReadinessStatus = z.infer<typeof providerWebhookReviewQaHandoffReleaseReadinessStatusSchema>;

export const providerWebhookReviewQaHandoffReleaseEvidenceSchema = providerWebhookReviewQaHandoffFinalizationBaseSchema.extend({
  evidenceKind: z.literal("qa-handoff-locked-archive-release-evidence-pack"),
  receiptKind: z.literal("qa-handoff-locked-archive-finalization-receipt"),
  releaseReadinessStatus: providerWebhookReviewQaHandoffReleaseReadinessStatusSchema,
  finalizationStatus: z.literal("finalized"),
  retentionSignOffStatus: z.literal("signed_off"),
  finalizationReceiptStatus: z.literal("ready"),
  retentionPolicyStatus: providerWebhookReviewQaHandoffRetentionPolicyStatusSchema,
  signOffRecordId: z.string().min(1),
  safeReleaseLabel: z.string().min(1),
  retentionAuditDigest: z.string().min(1),
  finalizationReceiptDigest: z.string().min(1),
  prerequisiteChecklist: z.object({
    qaHandoffBundleReady: z.boolean(),
    qaHandoffExportReady: z.boolean(),
    receiptSignedOff: z.boolean(),
    acceptanceLocked: z.boolean(),
    lockedArchiveReady: z.boolean(),
    lockedArchiveExported: z.boolean(),
    retentionManifestReady: z.boolean(),
    archiveIntegrityConfirmed: z.boolean(),
    retentionAuditConfirmed: z.boolean(),
    finalizationSignedOff: z.boolean(),
    finalizationReceiptReady: z.boolean(),
    digestChainConfirmed: z.boolean(),
    safeFilenamePresent: z.boolean(),
    safeDigestPresent: z.boolean(),
    providerOutboundAbsent: z.boolean(),
    externalCallsZero: z.boolean()
  }).strict(),
  counts: providerWebhookReviewQaHandoffFinalizationBaseSchema.shape.counts.extend({
    releaseEvidenceCheckedCount: z.number().int().nonnegative(),
    prerequisitePassedCount: z.number().int().nonnegative(),
    prerequisiteTotalCount: z.number().int().nonnegative()
  }).strict(),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookReviewQaHandoffReleaseEvidence = z.infer<typeof providerWebhookReviewQaHandoffReleaseEvidenceSchema>;

export const providerWebhookReviewQaHandoffReleaseVerificationStatusSchema = z.enum(["verified", "needs_review", "blocked"]);
export type ProviderWebhookReviewQaHandoffReleaseVerificationStatus = z.infer<typeof providerWebhookReviewQaHandoffReleaseVerificationStatusSchema>;

export const providerWebhookReviewQaHandoffReleaseVerificationMatrixKeySchema = z.enum([
  "qa_handoff_bundle",
  "qa_handoff_export",
  "receipt_sign_off",
  "acceptance_lock",
  "locked_archive_export",
  "retention_manifest",
  "archive_integrity",
  "retention_audit",
  "finalization_receipt",
  "release_evidence"
]);
export type ProviderWebhookReviewQaHandoffReleaseVerificationMatrixKey = z.infer<typeof providerWebhookReviewQaHandoffReleaseVerificationMatrixKeySchema>;

export const providerWebhookReviewQaHandoffReleaseVerificationDigestRowSchema = z.object({
  key: providerWebhookReviewQaHandoffReleaseVerificationMatrixKeySchema,
  label: z.string().min(1),
  safeDigest: z.string().min(1),
  expectedDigest: z.string().min(1),
  digestPresent: z.boolean(),
  digestMatchesExpected: z.boolean(),
  verificationStatus: providerWebhookReviewQaHandoffReleaseVerificationStatusSchema
}).strict();
export type ProviderWebhookReviewQaHandoffReleaseVerificationDigestRow = z.infer<typeof providerWebhookReviewQaHandoffReleaseVerificationDigestRowSchema>;

export const providerWebhookReviewQaHandoffReleaseVerificationSchema = providerWebhookReviewQaHandoffReleaseEvidenceSchema.extend({
  verificationKind: z.literal("qa-handoff-locked-archive-release-verification-matrix"),
  verificationStatus: providerWebhookReviewQaHandoffReleaseVerificationStatusSchema,
  safeVerificationLabel: z.string().min(1),
  releaseEvidenceDigest: z.string().min(1),
  digestMatrixRows: z.array(providerWebhookReviewQaHandoffReleaseVerificationDigestRowSchema).min(1),
  counts: providerWebhookReviewQaHandoffReleaseEvidenceSchema.shape.counts.extend({
    releaseVerificationCheckedCount: z.number().int().nonnegative(),
    digestMatrixRowCount: z.number().int().nonnegative(),
    digestMatrixVerifiedCount: z.number().int().nonnegative(),
    digestMatrixNeedsReviewCount: z.number().int().nonnegative(),
    digestMatrixBlockedCount: z.number().int().nonnegative()
  }).strict(),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookReviewQaHandoffReleaseVerification = z.infer<typeof providerWebhookReviewQaHandoffReleaseVerificationSchema>;

export const providerWebhookReviewQaHandoffReleaseCertificationSchema = z.object({
  certificationKind: z.literal("qa-handoff-locked-archive-release-certification-receipt"),
  certificationStatus: z.literal("certified"),
  releaseReadinessStatus: providerWebhookReviewQaHandoffReleaseReadinessStatusSchema,
  verificationStatus: z.literal("verified"),
  digestChainStatus: z.literal("confirmed"),
  safeFilename: z.string().min(1),
  safeDigest: z.string().min(1),
  releaseEvidenceDigest: z.string().min(1),
  releaseVerificationDigest: z.string().min(1),
  prerequisiteChecklist: providerWebhookReviewQaHandoffReleaseEvidenceSchema.shape.prerequisiteChecklist,
  certificationChecklist: z.object({
    releaseEvidenceReady: z.boolean(),
    releaseVerificationPresent: z.boolean(),
    releaseVerificationVerified: z.boolean(),
    releaseReadinessReady: z.boolean(),
    digestChainConfirmed: z.boolean(),
    prerequisitesComplete: z.boolean(),
    digestMatrixVerified: z.boolean(),
    safeFilenamePresent: z.boolean(),
    safeDigestPresent: z.boolean(),
    releaseEvidenceDigestPresent: z.boolean(),
    releaseVerificationDigestPresent: z.boolean(),
    providerOutboundAbsent: z.boolean(),
    externalCallsZero: z.boolean()
  }).strict(),
  digestMatrixSummary: z.object({
    totalRows: z.number().int().nonnegative(),
    verifiedRows: z.number().int().nonnegative(),
    needsReviewRows: z.number().int().nonnegative(),
    blockedRows: z.number().int().nonnegative(),
    allRowsVerified: z.boolean()
  }).strict(),
  counts: z.object({
    totalItems: z.number().int().nonnegative(),
    releaseEvidenceCheckedCount: z.number().int().nonnegative(),
    releaseVerificationCheckedCount: z.number().int().nonnegative(),
    releaseCertificationCheckedCount: z.number().int().nonnegative(),
    prerequisitePassedCount: z.number().int().nonnegative(),
    prerequisiteTotalCount: z.number().int().nonnegative(),
    certificationChecklistPassedCount: z.number().int().nonnegative(),
    certificationChecklistTotalCount: z.number().int().nonnegative(),
    digestMatrixRowCount: z.number().int().nonnegative(),
    digestMatrixVerifiedCount: z.number().int().nonnegative(),
    digestMatrixNeedsReviewCount: z.number().int().nonnegative(),
    digestMatrixBlockedCount: z.number().int().nonnegative()
  }).strict(),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookReviewQaHandoffReleaseCertification = z.infer<typeof providerWebhookReviewQaHandoffReleaseCertificationSchema>;

export const providerWebhookReviewQaHandoffReleaseClosureLedgerRowKeySchema = z.enum([
  "release_evidence",
  "release_verification",
  "release_certification",
  "prerequisite_checklist",
  "certification_checklist"
]);
export type ProviderWebhookReviewQaHandoffReleaseClosureLedgerRowKey = z.infer<typeof providerWebhookReviewQaHandoffReleaseClosureLedgerRowKeySchema>;

export const providerWebhookReviewQaHandoffReleaseClosureLedgerRowStatusSchema = z.enum([
  "verified",
  "certified",
  "complete",
  "closed"
]);
export type ProviderWebhookReviewQaHandoffReleaseClosureLedgerRowStatus = z.infer<typeof providerWebhookReviewQaHandoffReleaseClosureLedgerRowStatusSchema>;

export const providerWebhookReviewQaHandoffReleaseClosureLedgerRowSchema = z.object({
  key: providerWebhookReviewQaHandoffReleaseClosureLedgerRowKeySchema,
  label: z.string().min(1),
  ledgerStatus: providerWebhookReviewQaHandoffReleaseClosureLedgerRowStatusSchema,
  safeDigest: z.string().min(1),
  checkedCount: z.number().int().nonnegative(),
  complete: z.boolean()
}).strict();
export type ProviderWebhookReviewQaHandoffReleaseClosureLedgerRow = z.infer<typeof providerWebhookReviewQaHandoffReleaseClosureLedgerRowSchema>;

export const providerWebhookReviewQaHandoffReleaseClosureLedgerSchema = z.object({
  ledgerKind: z.literal("qa-handoff-locked-archive-release-closure-ledger"),
  ledgerStatus: z.literal("certified_release_closed"),
  certificationStatus: z.literal("certified"),
  releaseReadinessStatus: providerWebhookReviewQaHandoffReleaseReadinessStatusSchema,
  verificationStatus: z.literal("verified"),
  digestChainStatus: z.literal("confirmed"),
  safeFilename: z.string().min(1),
  safeDigest: z.string().min(1),
  releaseEvidenceDigest: z.string().min(1),
  releaseVerificationDigest: z.string().min(1),
  releaseCertificationDigest: z.string().min(1),
  ledgerRows: z.array(providerWebhookReviewQaHandoffReleaseClosureLedgerRowSchema).min(1),
  prerequisiteChecklist: providerWebhookReviewQaHandoffReleaseEvidenceSchema.shape.prerequisiteChecklist,
  certificationChecklist: providerWebhookReviewQaHandoffReleaseCertificationSchema.shape.certificationChecklist,
  ledgerSummary: z.object({
    ledgerRowCount: z.number().int().nonnegative(),
    closedRowCount: z.number().int().nonnegative(),
    prerequisiteChecklistComplete: z.boolean(),
    certificationChecklistComplete: z.boolean(),
    releaseCertificationDigestPresent: z.boolean(),
    externalCallsZero: z.boolean()
  }).strict(),
  counts: z.object({
    totalItems: z.number().int().nonnegative(),
    releaseEvidenceCheckedCount: z.number().int().nonnegative(),
    releaseVerificationCheckedCount: z.number().int().nonnegative(),
    releaseCertificationCheckedCount: z.number().int().nonnegative(),
    closureLedgerCheckedCount: z.number().int().nonnegative(),
    prerequisitePassedCount: z.number().int().nonnegative(),
    prerequisiteTotalCount: z.number().int().nonnegative(),
    certificationChecklistPassedCount: z.number().int().nonnegative(),
    certificationChecklistTotalCount: z.number().int().nonnegative(),
    ledgerRowCount: z.number().int().nonnegative(),
    ledgerClosedRowCount: z.number().int().nonnegative(),
    ledgerNeedsReviewRowCount: z.number().int().nonnegative()
  }).strict(),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookReviewQaHandoffReleaseClosureLedger = z.infer<typeof providerWebhookReviewQaHandoffReleaseClosureLedgerSchema>;

export const providerWebhookReviewQaHandoffReleaseAttestationAuditRowKeySchema = z.enum([
  "closure_ledger",
  "release_evidence_digest",
  "release_verification_digest",
  "release_certification_digest",
  "prerequisite_checklist",
  "certification_checklist",
  "external_calls"
]);
export type ProviderWebhookReviewQaHandoffReleaseAttestationAuditRowKey = z.infer<typeof providerWebhookReviewQaHandoffReleaseAttestationAuditRowKeySchema>;

export const providerWebhookReviewQaHandoffReleaseAttestationAuditRowStatusSchema = z.enum([
  "verified",
  "complete",
  "attested"
]);
export type ProviderWebhookReviewQaHandoffReleaseAttestationAuditRowStatus = z.infer<typeof providerWebhookReviewQaHandoffReleaseAttestationAuditRowStatusSchema>;

export const providerWebhookReviewQaHandoffReleaseAttestationAuditRowSchema = z.object({
  key: providerWebhookReviewQaHandoffReleaseAttestationAuditRowKeySchema,
  label: z.string().min(1),
  attestationStatus: providerWebhookReviewQaHandoffReleaseAttestationAuditRowStatusSchema,
  safeDigest: z.string().min(1),
  checkedCount: z.number().int().nonnegative(),
  complete: z.boolean()
}).strict();
export type ProviderWebhookReviewQaHandoffReleaseAttestationAuditRow = z.infer<typeof providerWebhookReviewQaHandoffReleaseAttestationAuditRowSchema>;

export const providerWebhookReviewQaHandoffReleaseAttestationAuditSchema = z.object({
  attestationKind: z.literal("qa-handoff-locked-archive-release-attestation-audit"),
  attestationStatus: z.literal("complete"),
  ledgerStatus: z.literal("certified_release_closed"),
  certificationStatus: z.literal("certified"),
  releaseReadinessStatus: providerWebhookReviewQaHandoffReleaseReadinessStatusSchema,
  verificationStatus: z.literal("verified"),
  digestChainStatus: z.literal("confirmed"),
  safeFilename: z.string().min(1),
  safeDigest: z.string().min(1),
  releaseEvidenceDigest: z.string().min(1),
  releaseVerificationDigest: z.string().min(1),
  releaseCertificationDigest: z.string().min(1),
  closureLedgerDigest: z.string().min(1),
  attestationRows: z.array(providerWebhookReviewQaHandoffReleaseAttestationAuditRowSchema).min(1),
  prerequisiteChecklist: providerWebhookReviewQaHandoffReleaseEvidenceSchema.shape.prerequisiteChecklist,
  certificationChecklist: providerWebhookReviewQaHandoffReleaseCertificationSchema.shape.certificationChecklist,
  attestationSummary: z.object({
    attestationRowCount: z.number().int().nonnegative(),
    attestedRowCount: z.number().int().nonnegative(),
    ledgerClosed: z.boolean(),
    prerequisiteChecklistComplete: z.boolean(),
    certificationChecklistComplete: z.boolean(),
    closureLedgerDigestPresent: z.boolean(),
    externalCallsZero: z.boolean()
  }).strict(),
  counts: z.object({
    totalItems: z.number().int().nonnegative(),
    releaseEvidenceCheckedCount: z.number().int().nonnegative(),
    releaseVerificationCheckedCount: z.number().int().nonnegative(),
    releaseCertificationCheckedCount: z.number().int().nonnegative(),
    closureLedgerCheckedCount: z.number().int().nonnegative(),
    attestationAuditCheckedCount: z.number().int().nonnegative(),
    prerequisitePassedCount: z.number().int().nonnegative(),
    prerequisiteTotalCount: z.number().int().nonnegative(),
    certificationChecklistPassedCount: z.number().int().nonnegative(),
    certificationChecklistTotalCount: z.number().int().nonnegative(),
    ledgerRowCount: z.number().int().nonnegative(),
    ledgerClosedRowCount: z.number().int().nonnegative(),
    attestationRowCount: z.number().int().nonnegative(),
    attestationAttestedRowCount: z.number().int().nonnegative(),
    attestationNeedsReviewRowCount: z.number().int().nonnegative()
  }).strict(),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookReviewQaHandoffReleaseAttestationAudit = z.infer<typeof providerWebhookReviewQaHandoffReleaseAttestationAuditSchema>;

export const providerWebhookReviewQaHandoffReleaseAttestationReconciliationRowKeySchema = z.enum([
  "release_evidence_digest",
  "release_verification_digest",
  "release_certification_digest",
  "closure_ledger_digest",
  "attestation_audit_digest",
  "prerequisite_checklist",
  "certification_checklist",
  "external_calls"
]);
export type ProviderWebhookReviewQaHandoffReleaseAttestationReconciliationRowKey = z.infer<typeof providerWebhookReviewQaHandoffReleaseAttestationReconciliationRowKeySchema>;

export const providerWebhookReviewQaHandoffReleaseAttestationReconciliationRowStatusSchema = z.enum([
  "aligned",
  "verified",
  "complete",
  "attested"
]);
export type ProviderWebhookReviewQaHandoffReleaseAttestationReconciliationRowStatus = z.infer<typeof providerWebhookReviewQaHandoffReleaseAttestationReconciliationRowStatusSchema>;

export const providerWebhookReviewQaHandoffReleaseAttestationReconciliationRowSchema = z.object({
  key: providerWebhookReviewQaHandoffReleaseAttestationReconciliationRowKeySchema,
  label: z.string().min(1),
  reconciliationStatus: providerWebhookReviewQaHandoffReleaseAttestationReconciliationRowStatusSchema,
  safeDigest: z.string().min(1),
  checkedCount: z.number().int().nonnegative(),
  aligned: z.boolean()
}).strict();
export type ProviderWebhookReviewQaHandoffReleaseAttestationReconciliationRow = z.infer<typeof providerWebhookReviewQaHandoffReleaseAttestationReconciliationRowSchema>;

export const providerWebhookReviewQaHandoffReleaseAttestationReconciliationExceptionCodeSchema = z.enum([
  "prerequisite_gap",
  "certification_gap",
  "attestation_gap",
  "digest_gap",
  "external_calls_gap"
]);
export type ProviderWebhookReviewQaHandoffReleaseAttestationReconciliationExceptionCode = z.infer<typeof providerWebhookReviewQaHandoffReleaseAttestationReconciliationExceptionCodeSchema>;

export const providerWebhookReviewQaHandoffReleaseAttestationReconciliationExceptionSchema = z.object({
  code: providerWebhookReviewQaHandoffReleaseAttestationReconciliationExceptionCodeSchema,
  label: z.string().min(1),
  status: z.literal("safe_exception"),
  safeDigest: z.string().min(1),
  checkedCount: z.number().int().nonnegative()
}).strict();
export type ProviderWebhookReviewQaHandoffReleaseAttestationReconciliationException = z.infer<typeof providerWebhookReviewQaHandoffReleaseAttestationReconciliationExceptionSchema>;

export const providerWebhookReviewQaHandoffReleaseAttestationReconciliationRegisterSchema = z.object({
  reconciliationKind: z.literal("qa-handoff-locked-archive-release-attestation-reconciliation-register"),
  reconciliationStatus: z.literal("aligned"),
  attestationStatus: z.literal("complete"),
  ledgerStatus: z.literal("certified_release_closed"),
  certificationStatus: z.literal("certified"),
  releaseReadinessStatus: providerWebhookReviewQaHandoffReleaseReadinessStatusSchema,
  verificationStatus: z.literal("verified"),
  digestChainStatus: z.literal("confirmed"),
  safeFilename: z.string().min(1),
  safeDigest: z.string().min(1),
  releaseEvidenceDigest: z.string().min(1),
  verificationDigest: z.string().min(1),
  certificationDigest: z.string().min(1),
  closureLedgerDigest: z.string().min(1),
  attestationAuditDigest: z.string().min(1),
  reconciliationDigest: z.string().min(1),
  reconciliationRows: z.array(providerWebhookReviewQaHandoffReleaseAttestationReconciliationRowSchema).min(1),
  exceptionRows: z.array(providerWebhookReviewQaHandoffReleaseAttestationReconciliationExceptionSchema),
  inheritedPrerequisiteChecklist: providerWebhookReviewQaHandoffReleaseEvidenceSchema.shape.prerequisiteChecklist,
  inheritedCertificationChecklist: providerWebhookReviewQaHandoffReleaseCertificationSchema.shape.certificationChecklist,
  reconciliationSummary: z.object({
    reconciliationRowCount: z.number().int().nonnegative(),
    alignedRowCount: z.number().int().nonnegative(),
    exceptionRowCount: z.number().int().nonnegative(),
    attestationAuditComplete: z.boolean(),
    closureLedgerClosed: z.boolean(),
    prerequisiteChecklistComplete: z.boolean(),
    certificationChecklistComplete: z.boolean(),
    allDigestsLinked: z.boolean(),
    externalCallsZero: z.boolean()
  }).strict(),
  counts: z.object({
    totalItems: z.number().int().nonnegative(),
    releaseEvidenceCheckedCount: z.number().int().nonnegative(),
    releaseVerificationCheckedCount: z.number().int().nonnegative(),
    releaseCertificationCheckedCount: z.number().int().nonnegative(),
    closureLedgerCheckedCount: z.number().int().nonnegative(),
    attestationAuditCheckedCount: z.number().int().nonnegative(),
    reconciliationCheckedCount: z.number().int().nonnegative(),
    prerequisitePassedCount: z.number().int().nonnegative(),
    prerequisiteTotalCount: z.number().int().nonnegative(),
    certificationChecklistPassedCount: z.number().int().nonnegative(),
    certificationChecklistTotalCount: z.number().int().nonnegative(),
    ledgerRowCount: z.number().int().nonnegative(),
    ledgerClosedRowCount: z.number().int().nonnegative(),
    attestationRowCount: z.number().int().nonnegative(),
    attestationAttestedRowCount: z.number().int().nonnegative(),
    reconciliationRowCount: z.number().int().nonnegative(),
    reconciliationAlignedRowCount: z.number().int().nonnegative(),
    reconciliationExceptionRowCount: z.number().int().nonnegative()
  }).strict(),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookReviewQaHandoffReleaseAttestationReconciliationRegister = z.infer<typeof providerWebhookReviewQaHandoffReleaseAttestationReconciliationRegisterSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseGateStatusSchema = z.enum([
  "ready",
  "blocked",
  "incomplete"
]);
export type ProviderWebhookReviewQaHandoffCertifiedReleaseGateStatus = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseGateStatusSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseGateDecisionSchema = z.enum([
  "go",
  "no_go"
]);
export type ProviderWebhookReviewQaHandoffCertifiedReleaseGateDecision = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseGateDecisionSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseGateBlockingReasonCodeSchema = z.enum([
  "prerequisite_chain_incomplete",
  "reconciliation_not_aligned",
  "attestation_incomplete",
  "closure_ledger_incomplete",
  "certification_incomplete",
  "release_not_ready",
  "verification_incomplete",
  "digest_chain_unconfirmed",
  "prerequisite_checklist_incomplete",
  "certification_checklist_incomplete",
  "reconciliation_exception",
  "external_calls_present"
]);
export type ProviderWebhookReviewQaHandoffCertifiedReleaseGateBlockingReasonCode = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseGateBlockingReasonCodeSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseGateBlockingReasonSchema = z.object({
  code: providerWebhookReviewQaHandoffCertifiedReleaseGateBlockingReasonCodeSchema,
  label: z.string().min(1),
  status: z.literal("blocking_reason"),
  safeDigest: z.string().min(1)
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseGateBlockingReason = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseGateBlockingReasonSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseGateSchema = z.object({
  gateKind: z.literal("qa-handoff-locked-archive-certified-release-gate"),
  gateStatus: providerWebhookReviewQaHandoffCertifiedReleaseGateStatusSchema,
  goNoGoDecision: providerWebhookReviewQaHandoffCertifiedReleaseGateDecisionSchema,
  releaseReadinessStatus: providerWebhookReviewQaHandoffReleaseReadinessStatusSchema,
  reconciliationStatus: z.enum(["complete", "aligned"]),
  attestationStatus: z.literal("complete"),
  ledgerStatus: z.literal("certified_release_closed"),
  certificationStatus: z.literal("certified"),
  verificationStatus: z.literal("verified"),
  digestChainStatus: z.literal("confirmed"),
  safeFilename: z.string().min(1),
  safeDigest: z.string().min(1),
  releaseGateDigest: z.string().min(1),
  reconciliationDigest: z.string().min(1),
  attestationAuditDigest: z.string().min(1),
  closureLedgerDigest: z.string().min(1),
  certificationDigest: z.string().min(1),
  verificationDigest: z.string().min(1),
  releaseEvidenceDigest: z.string().min(1),
  inheritedPrerequisiteChecklist: providerWebhookReviewQaHandoffReleaseEvidenceSchema.shape.prerequisiteChecklist,
  inheritedCertificationChecklist: providerWebhookReviewQaHandoffReleaseCertificationSchema.shape.certificationChecklist,
  inheritedReconciliationSummary: providerWebhookReviewQaHandoffReleaseAttestationReconciliationRegisterSchema.shape.reconciliationSummary,
  gateChecklist: z.object({
    prerequisiteChainComplete: z.boolean(),
    reconciliationComplete: z.boolean(),
    attestationComplete: z.boolean(),
    closureLedgerClosed: z.boolean(),
    certificationComplete: z.boolean(),
    releaseReady: z.boolean(),
    verificationComplete: z.boolean(),
    digestChainConfirmed: z.boolean(),
    prerequisiteChecklistComplete: z.boolean(),
    certificationChecklistComplete: z.boolean(),
    noBlockingExceptions: z.boolean(),
    externalCallsZero: z.boolean()
  }).strict(),
  blockingReasons: z.array(providerWebhookReviewQaHandoffCertifiedReleaseGateBlockingReasonSchema),
  exceptionRows: z.array(providerWebhookReviewQaHandoffReleaseAttestationReconciliationExceptionSchema),
  counts: z.object({
    totalItems: z.number().int().nonnegative(),
    releaseEvidenceCheckedCount: z.number().int().nonnegative(),
    releaseVerificationCheckedCount: z.number().int().nonnegative(),
    releaseCertificationCheckedCount: z.number().int().nonnegative(),
    closureLedgerCheckedCount: z.number().int().nonnegative(),
    attestationAuditCheckedCount: z.number().int().nonnegative(),
    reconciliationCheckedCount: z.number().int().nonnegative(),
    gateCheckedCount: z.number().int().nonnegative(),
    prerequisitePassedCount: z.number().int().nonnegative(),
    prerequisiteTotalCount: z.number().int().nonnegative(),
    certificationChecklistPassedCount: z.number().int().nonnegative(),
    certificationChecklistTotalCount: z.number().int().nonnegative(),
    reconciliationRowCount: z.number().int().nonnegative(),
    reconciliationAlignedRowCount: z.number().int().nonnegative(),
    reconciliationExceptionRowCount: z.number().int().nonnegative(),
    gateChecklistPassedCount: z.number().int().nonnegative(),
    gateChecklistTotalCount: z.number().int().nonnegative(),
    blockingReasonCount: z.number().int().nonnegative(),
    exceptionRowCount: z.number().int().nonnegative()
  }).strict(),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseGate = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseGateSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptStatusSchema = z.enum([
  "issued",
  "blocked",
  "incomplete"
]);
export type ProviderWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptStatus = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptStatusSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptDecisionSchema = z.enum([
  "go",
  "no_go"
]);
export type ProviderWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptDecision = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptDecisionSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptRowSchema = z.object({
  key: z.enum([
    "release_gate",
    "release_decision",
    "release_readiness",
    "reconciliation",
    "attestation",
    "closure_ledger",
    "certification",
    "verification",
    "digest_chain",
    "prerequisite_checklist",
    "certification_checklist",
    "gate_checklist",
    "external_calls"
  ]),
  label: z.string().min(1),
  receiptRowStatus: z.enum(["confirmed", "issued", "blocked"]),
  safeDigest: z.string().min(1),
  checkedCount: z.number().int().nonnegative(),
  complete: z.boolean()
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptRow = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptRowSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptSchema = z.object({
  receiptKind: z.literal("qa-handoff-locked-archive-certified-release-decision-receipt"),
  receiptStatus: providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptStatusSchema,
  releaseDecision: providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptDecisionSchema,
  gateStatus: providerWebhookReviewQaHandoffCertifiedReleaseGateStatusSchema,
  goNoGoDecision: providerWebhookReviewQaHandoffCertifiedReleaseGateDecisionSchema,
  releaseReadinessStatus: providerWebhookReviewQaHandoffReleaseReadinessStatusSchema,
  reconciliationStatus: z.enum(["complete", "aligned"]),
  attestationStatus: z.literal("complete"),
  ledgerStatus: z.literal("certified_release_closed"),
  certificationStatus: z.literal("certified"),
  verificationStatus: z.literal("verified"),
  digestChainStatus: z.literal("confirmed"),
  safeFilename: z.string().min(1),
  safeDigest: z.string().min(1),
  decisionReceiptDigest: z.string().min(1),
  releaseGateDigest: z.string().min(1),
  reconciliationDigest: z.string().min(1),
  attestationAuditDigest: z.string().min(1),
  closureLedgerDigest: z.string().min(1),
  certificationDigest: z.string().min(1),
  verificationDigest: z.string().min(1),
  releaseEvidenceDigest: z.string().min(1),
  inheritedPrerequisiteChecklist: providerWebhookReviewQaHandoffReleaseEvidenceSchema.shape.prerequisiteChecklist,
  inheritedCertificationChecklist: providerWebhookReviewQaHandoffReleaseCertificationSchema.shape.certificationChecklist,
  inheritedGateChecklist: providerWebhookReviewQaHandoffCertifiedReleaseGateSchema.shape.gateChecklist,
  inheritedReconciliationSummary: providerWebhookReviewQaHandoffCertifiedReleaseGateSchema.shape.inheritedReconciliationSummary,
  inheritedBlockingReasons: z.array(providerWebhookReviewQaHandoffCertifiedReleaseGateBlockingReasonSchema),
  inheritedExceptionRows: z.array(providerWebhookReviewQaHandoffReleaseAttestationReconciliationExceptionSchema),
  receiptRows: z.array(providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptRowSchema).min(1),
  receiptSummary: z.object({
    receiptRowCount: z.number().int().nonnegative(),
    completeReceiptRowCount: z.number().int().nonnegative(),
    releaseGateReady: z.boolean(),
    releaseDecisionGo: z.boolean(),
    prerequisiteChecklistComplete: z.boolean(),
    certificationChecklistComplete: z.boolean(),
    gateChecklistComplete: z.boolean(),
    noBlockingReasons: z.boolean(),
    noExceptionRows: z.boolean(),
    externalCallsZero: z.boolean()
  }).strict(),
  counts: z.object({
    totalItems: z.number().int().nonnegative(),
    releaseEvidenceCheckedCount: z.number().int().nonnegative(),
    releaseVerificationCheckedCount: z.number().int().nonnegative(),
    releaseCertificationCheckedCount: z.number().int().nonnegative(),
    closureLedgerCheckedCount: z.number().int().nonnegative(),
    attestationAuditCheckedCount: z.number().int().nonnegative(),
    reconciliationCheckedCount: z.number().int().nonnegative(),
    gateCheckedCount: z.number().int().nonnegative(),
    decisionReceiptCheckedCount: z.number().int().nonnegative(),
    prerequisitePassedCount: z.number().int().nonnegative(),
    prerequisiteTotalCount: z.number().int().nonnegative(),
    certificationChecklistPassedCount: z.number().int().nonnegative(),
    certificationChecklistTotalCount: z.number().int().nonnegative(),
    reconciliationRowCount: z.number().int().nonnegative(),
    reconciliationAlignedRowCount: z.number().int().nonnegative(),
    reconciliationExceptionRowCount: z.number().int().nonnegative(),
    gateChecklistPassedCount: z.number().int().nonnegative(),
    gateChecklistTotalCount: z.number().int().nonnegative(),
    blockingReasonCount: z.number().int().nonnegative(),
    exceptionRowCount: z.number().int().nonnegative(),
    receiptRowCount: z.number().int().nonnegative(),
    receiptRowCompleteCount: z.number().int().nonnegative()
  }).strict(),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseDecisionReceipt = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseHandoffPacketStatusSchema = z.enum([
  "issued",
  "blocked"
]);
export type ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacketStatus = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseHandoffPacketStatusSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseHandoffStatusSchema = z.enum([
  "ready",
  "blocked"
]);
export type ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffStatus = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseHandoffStatusSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseHandoffRowSchema = z.object({
  key: z.enum([
    "decision_receipt",
    "release_gate",
    "release_decision",
    "release_readiness",
    "reconciliation",
    "attestation",
    "closure_ledger",
    "certification",
    "verification",
    "digest_chain",
    "prerequisite_checklist",
    "certification_checklist",
    "gate_checklist",
    "blocking_reasons",
    "exceptions",
    "external_calls"
  ]),
  label: z.string().min(1),
  handoffRowStatus: z.enum(["ready", "confirmed", "blocked"]),
  safeDigest: z.string().min(1),
  checkedCount: z.number().int().nonnegative(),
  complete: z.boolean()
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffRow = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseHandoffRowSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseRunbookRowSchema = z.object({
  key: z.enum([
    "confirm_decision_receipt",
    "confirm_release_gate",
    "confirm_operator_checklist",
    "release_handoff",
    "monitor_release",
    "exception_hold"
  ]),
  label: z.string().min(1),
  runbookStatus: z.enum(["ready", "blocked"]),
  safeDigest: z.string().min(1),
  ownerRole: z.string().min(1),
  complete: z.boolean()
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseRunbookRow = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseRunbookRowSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseOperatorChecklistItemSchema = z.object({
  key: z.enum([
    "decision_receipt_issued",
    "release_gate_ready",
    "no_blocking_reasons",
    "no_exceptions",
    "external_calls_zero",
    "provider_outbound_absent",
    "source_material_absent"
  ]),
  label: z.string().min(1),
  checklistStatus: z.enum(["complete", "blocked"]),
  safeDigest: z.string().min(1),
  complete: z.boolean()
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseOperatorChecklistItem = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseOperatorChecklistItemSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseHandoffPacketSchema = z.object({
  packetKind: z.literal("qa-handoff-locked-archive-certified-release-handoff-packet"),
  packetStatus: providerWebhookReviewQaHandoffCertifiedReleaseHandoffPacketStatusSchema,
  handoffStatus: providerWebhookReviewQaHandoffCertifiedReleaseHandoffStatusSchema,
  releaseDecision: providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptDecisionSchema,
  receiptStatus: providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptStatusSchema,
  gateStatus: providerWebhookReviewQaHandoffCertifiedReleaseGateStatusSchema,
  goNoGoDecision: providerWebhookReviewQaHandoffCertifiedReleaseGateDecisionSchema,
  releaseReadinessStatus: providerWebhookReviewQaHandoffReleaseReadinessStatusSchema,
  reconciliationStatus: z.enum(["complete", "aligned"]),
  attestationStatus: z.literal("complete"),
  ledgerStatus: z.literal("certified_release_closed"),
  certificationStatus: z.literal("certified"),
  verificationStatus: z.literal("verified"),
  digestChainStatus: z.literal("confirmed"),
  safeFilename: z.string().min(1),
  safeDigest: z.string().min(1),
  handoffPacketDigest: z.string().min(1),
  decisionReceiptDigest: z.string().min(1),
  releaseGateDigest: z.string().min(1),
  reconciliationDigest: z.string().min(1),
  attestationAuditDigest: z.string().min(1),
  closureLedgerDigest: z.string().min(1),
  certificationDigest: z.string().min(1),
  verificationDigest: z.string().min(1),
  releaseEvidenceDigest: z.string().min(1),
  inheritedPrerequisiteChecklist: providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptSchema.shape.inheritedPrerequisiteChecklist,
  inheritedCertificationChecklist: providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptSchema.shape.inheritedCertificationChecklist,
  inheritedGateChecklist: providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptSchema.shape.inheritedGateChecklist,
  inheritedDecisionReceiptSummary: providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptSchema.shape.receiptSummary,
  inheritedReconciliationSummary: providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptSchema.shape.inheritedReconciliationSummary,
  inheritedBlockingReasons: providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptSchema.shape.inheritedBlockingReasons,
  inheritedExceptionRows: providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptSchema.shape.inheritedExceptionRows,
  handoffRows: z.array(providerWebhookReviewQaHandoffCertifiedReleaseHandoffRowSchema).min(1),
  runbookRows: z.array(providerWebhookReviewQaHandoffCertifiedReleaseRunbookRowSchema).min(1),
  operatorChecklist: z.array(providerWebhookReviewQaHandoffCertifiedReleaseOperatorChecklistItemSchema).min(1),
  releaseOwnerSummary: z.object({
    ownerRole: z.string().min(1),
    handoffReady: z.boolean(),
    releaseDecisionGo: z.boolean(),
    blockingReasonCount: z.number().int().nonnegative(),
    exceptionRowCount: z.number().int().nonnegative(),
    externalCallsZero: z.boolean(),
    safeDigest: z.string().min(1)
  }).strict(),
  counts: providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptSchema.shape.counts.extend({
    handoffPacketCheckedCount: z.number().int().nonnegative(),
    handoffRowCount: z.number().int().nonnegative(),
    handoffRowCompleteCount: z.number().int().nonnegative(),
    runbookRowCount: z.number().int().nonnegative(),
    runbookRowReadyCount: z.number().int().nonnegative(),
    operatorChecklistItemCount: z.number().int().nonnegative(),
    operatorChecklistCompleteCount: z.number().int().nonnegative()
  }).strict(),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseHandoffPacketSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceStatusSchema = z.enum([
  "not_started",
  "acknowledged",
  "blocked",
  "incomplete"
]);
export type ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceStatus = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceStatusSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRequestSchema = z.object({
  acknowledgementType: z.enum(["operator_checklist_acknowledgement"]).default("operator_checklist_acknowledgement"),
  acknowledgedByRole: z.string().trim().min(1).max(80).optional(),
  acknowledgedByLabel: z.string().trim().min(1).max(120).optional(),
  acknowledgedChecklistKeys: z.array(providerWebhookReviewQaHandoffCertifiedReleaseOperatorChecklistItemSchema.shape.key).min(1)
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRequest = z.input<typeof providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRequestSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcknowledgedChecklistItemSchema = z.object({
  key: providerWebhookReviewQaHandoffCertifiedReleaseOperatorChecklistItemSchema.shape.key,
  label: z.string().min(1),
  acknowledgementStatus: z.enum(["acknowledged", "pending", "blocked"]),
  safeDigest: z.string().min(1),
  acknowledged: z.boolean()
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcknowledgedChecklistItem = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcknowledgedChecklistItemSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcknowledgementRowSchema = z.object({
  key: z.enum([
    "handoff_packet",
    "operator_checklist",
    "release_owner",
    "external_calls",
    "safe_source_material",
    "blocking_reasons",
    "exceptions"
  ]),
  label: z.string().min(1),
  acknowledgementStatus: z.enum(["acknowledged", "pending", "blocked"]),
  safeDigest: z.string().min(1),
  checkedCount: z.number().int().nonnegative(),
  complete: z.boolean()
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcknowledgementRow = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcknowledgementRowSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordSchema = z.object({
  acceptanceKind: z.literal("qa-handoff-locked-archive-certified-release-handoff-acceptance-record"),
  acceptanceStatus: providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceStatusSchema,
  handoffStatus: providerWebhookReviewQaHandoffCertifiedReleaseHandoffStatusSchema,
  releaseDecision: providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptDecisionSchema,
  packetStatus: providerWebhookReviewQaHandoffCertifiedReleaseHandoffPacketStatusSchema,
  receiptStatus: providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptStatusSchema,
  gateStatus: providerWebhookReviewQaHandoffCertifiedReleaseGateStatusSchema,
  goNoGoDecision: providerWebhookReviewQaHandoffCertifiedReleaseGateDecisionSchema,
  releaseReadinessStatus: providerWebhookReviewQaHandoffReleaseReadinessStatusSchema,
  reconciliationStatus: z.enum(["complete", "aligned"]),
  attestationStatus: z.literal("complete"),
  ledgerStatus: z.literal("certified_release_closed"),
  certificationStatus: z.literal("certified"),
  verificationStatus: z.literal("verified"),
  digestChainStatus: z.literal("confirmed"),
  safeFilename: z.string().min(1),
  safeDigest: z.string().min(1),
  acceptanceRecordDigest: z.string().min(1),
  handoffPacketDigest: z.string().min(1),
  decisionReceiptDigest: z.string().min(1),
  releaseGateDigest: z.string().min(1),
  reconciliationDigest: z.string().min(1),
  attestationAuditDigest: z.string().min(1),
  closureLedgerDigest: z.string().min(1),
  certificationDigest: z.string().min(1),
  verificationDigest: z.string().min(1),
  releaseEvidenceDigest: z.string().min(1),
  operatorChecklist: z.array(providerWebhookReviewQaHandoffCertifiedReleaseOperatorChecklistItemSchema).min(1),
  acknowledgedChecklist: z.array(providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcknowledgedChecklistItemSchema).min(1),
  acknowledgementRows: z.array(providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcknowledgementRowSchema).min(1),
  releaseOwnerSummary: z.object({
    ownerRole: z.string().min(1),
    acknowledgedByRole: z.string().min(1).nullable(),
    acknowledgedByLabel: z.string().min(1).nullable(),
    handoffReady: z.boolean(),
    releaseDecisionGo: z.boolean(),
    operatorChecklistAcknowledged: z.boolean(),
    blockingReasonCount: z.number().int().nonnegative(),
    exceptionRowCount: z.number().int().nonnegative(),
    externalCallsZero: z.boolean(),
    safeDigest: z.string().min(1)
  }).strict(),
  inheritedPrerequisiteChecklist: providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptSchema.shape.inheritedPrerequisiteChecklist,
  inheritedCertificationChecklist: providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptSchema.shape.inheritedCertificationChecklist,
  inheritedGateChecklist: providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptSchema.shape.inheritedGateChecklist,
  inheritedDecisionReceiptSummary: providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptSchema.shape.receiptSummary,
  inheritedHandoffPacketSummary: z.object({
    packetStatus: providerWebhookReviewQaHandoffCertifiedReleaseHandoffPacketStatusSchema,
    handoffStatus: providerWebhookReviewQaHandoffCertifiedReleaseHandoffStatusSchema,
    releaseDecision: providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptDecisionSchema,
    handoffRowCount: z.number().int().nonnegative(),
    handoffRowCompleteCount: z.number().int().nonnegative(),
    runbookRowCount: z.number().int().nonnegative(),
    runbookRowReadyCount: z.number().int().nonnegative(),
    operatorChecklistItemCount: z.number().int().nonnegative(),
    operatorChecklistCompleteCount: z.number().int().nonnegative(),
    externalCallsZero: z.boolean()
  }).strict(),
  inheritedBlockingReasons: providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptSchema.shape.inheritedBlockingReasons,
  inheritedExceptionRows: providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptSchema.shape.inheritedExceptionRows,
  counts: providerWebhookReviewQaHandoffCertifiedReleaseHandoffPacketSchema.shape.counts.extend({
    acceptanceRecordCheckedCount: z.number().int().nonnegative(),
    acceptanceRecordMutationCount: z.number().int().nonnegative(),
    acknowledgedChecklistItemCount: z.number().int().nonnegative(),
    acknowledgedChecklistCompleteCount: z.number().int().nonnegative(),
    acknowledgementRowCount: z.number().int().nonnegative(),
    acknowledgementRowCompleteCount: z.number().int().nonnegative()
  }).strict(),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunStatusSchema = z.enum([
  "not_started",
  "passed",
  "blocked",
  "incomplete"
]);
export type ProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunStatus = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunStatusSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionModeSchema = z.literal("no_op");
export type ProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionMode = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionModeSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunRequestSchema = z.object({
  requestedBy: z.string().trim().min(1).max(120).optional(),
  checklistAcknowledged: z.boolean(),
  operatorNote: z.string().trim().max(240).optional(),
  dryRunReason: z.string().trim().max(160).optional(),
  executionMode: providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionModeSchema
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunRequest = z.input<typeof providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunRequestSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionChecklistItemSchema = z.object({
  key: z.enum([
    "acceptance_record_acknowledged",
    "handoff_ready",
    "release_decision_go",
    "execution_mode_no_op",
    "external_calls_zero",
    "provider_outbound_absent",
    "notification_send_absent",
    "source_material_absent"
  ]),
  label: z.string().min(1),
  checklistStatus: z.enum(["complete", "pending", "blocked"]),
  safeDigest: z.string().min(1),
  complete: z.boolean()
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionChecklistItem = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionChecklistItemSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunRowSchema = z.object({
  key: z.enum([
    "acceptance_record",
    "handoff_packet",
    "decision_receipt",
    "release_gate",
    "reconciliation",
    "attestation_audit",
    "closure_ledger",
    "certification",
    "verification",
    "release_evidence",
    "execution_mode",
    "external_calls"
  ]),
  label: z.string().min(1),
  dryRunRowStatus: z.enum(["passed", "pending", "blocked", "incomplete"]),
  safeDigest: z.string().min(1),
  checkedCount: z.number().int().nonnegative(),
  complete: z.boolean()
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunRow = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunRowSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionPlanRowSchema = z.object({
  key: z.enum([
    "plan_scope",
    "release_execution",
    "provider_outbound",
    "external_notifications",
    "automation_calls",
    "state_mutation",
    "readback"
  ]),
  label: z.string().min(1),
  planStatus: z.enum(["ready", "no_op", "blocked", "incomplete"]),
  safeDigest: z.string().min(1),
  checkedCount: z.number().int().nonnegative(),
  complete: z.boolean()
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionPlanRow = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionPlanRowSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunSchema = z.object({
  dryRunKind: z.literal("qa-handoff-locked-archive-certified-release-noop-execution-dryrun"),
  dryRunStatus: providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunStatusSchema,
  executionMode: providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionModeSchema,
  acceptanceStatus: providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceStatusSchema,
  handoffStatus: providerWebhookReviewQaHandoffCertifiedReleaseHandoffStatusSchema,
  releaseDecision: providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptDecisionSchema,
  packetStatus: providerWebhookReviewQaHandoffCertifiedReleaseHandoffPacketStatusSchema,
  receiptStatus: providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptStatusSchema,
  gateStatus: providerWebhookReviewQaHandoffCertifiedReleaseGateStatusSchema,
  goNoGoDecision: providerWebhookReviewQaHandoffCertifiedReleaseGateDecisionSchema,
  releaseReadinessStatus: providerWebhookReviewQaHandoffReleaseReadinessStatusSchema,
  reconciliationStatus: z.enum(["complete", "aligned"]),
  attestationStatus: z.literal("complete"),
  ledgerStatus: z.literal("certified_release_closed"),
  certificationStatus: z.literal("certified"),
  verificationStatus: z.literal("verified"),
  digestChainStatus: z.literal("confirmed"),
  safeFilename: z.string().min(1),
  safeDigest: z.string().min(1),
  noopExecutionDryRunDigest: z.string().min(1),
  acceptanceRecordDigest: z.string().min(1),
  handoffPacketDigest: z.string().min(1),
  decisionReceiptDigest: z.string().min(1),
  releaseGateDigest: z.string().min(1),
  reconciliationDigest: z.string().min(1),
  attestationAuditDigest: z.string().min(1),
  closureLedgerDigest: z.string().min(1),
  certificationDigest: z.string().min(1),
  verificationDigest: z.string().min(1),
  releaseEvidenceDigest: z.string().min(1),
  operatorChecklist: providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordSchema.shape.operatorChecklist,
  acknowledgedChecklist: providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordSchema.shape.acknowledgedChecklist,
  executionChecklist: z.array(providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionChecklistItemSchema).min(1),
  dryRunRows: z.array(providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunRowSchema).min(1),
  executionPlanRows: z.array(providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionPlanRowSchema).min(1),
  releaseOwnerSummary: providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordSchema.shape.releaseOwnerSummary.extend({
    requestedBy: z.string().min(1).nullable(),
    checklistAcknowledged: z.boolean(),
    dryRunReason: z.string().min(1).nullable(),
    executionModeNoOp: z.boolean()
  }).strict(),
  inheritedPrerequisiteChecklist: providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordSchema.shape.inheritedPrerequisiteChecklist,
  inheritedCertificationChecklist: providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordSchema.shape.inheritedCertificationChecklist,
  inheritedGateChecklist: providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordSchema.shape.inheritedGateChecklist,
  inheritedDecisionReceiptSummary: providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordSchema.shape.inheritedDecisionReceiptSummary,
  inheritedHandoffPacketSummary: providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordSchema.shape.inheritedHandoffPacketSummary,
  inheritedAcceptanceSummary: z.object({
    acceptanceStatus: providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceStatusSchema,
    handoffStatus: providerWebhookReviewQaHandoffCertifiedReleaseHandoffStatusSchema,
    releaseDecision: providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptDecisionSchema,
    operatorChecklistAcknowledged: z.boolean(),
    acknowledgedChecklistItemCount: z.number().int().nonnegative(),
    acknowledgedChecklistCompleteCount: z.number().int().nonnegative(),
    acknowledgementRowCount: z.number().int().nonnegative(),
    acknowledgementRowCompleteCount: z.number().int().nonnegative(),
    externalCallsZero: z.boolean()
  }).strict(),
  inheritedBlockingReasons: providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordSchema.shape.inheritedBlockingReasons,
  inheritedExceptionRows: providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordSchema.shape.inheritedExceptionRows,
  counts: providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordSchema.shape.counts.extend({
    noopExecutionDryRunCheckedCount: z.number().int().nonnegative(),
    noopExecutionDryRunMutationCount: z.number().int().nonnegative(),
    executionChecklistItemCount: z.number().int().nonnegative(),
    executionChecklistCompleteCount: z.number().int().nonnegative(),
    dryRunRowCount: z.number().int().nonnegative(),
    dryRunRowPassedCount: z.number().int().nonnegative(),
    executionPlanRowCount: z.number().int().nonnegative(),
    executionPlanReadyCount: z.number().int().nonnegative()
  }).strict(),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerStatusSchema = z.enum([
  "pending",
  "recorded",
  "blocked",
  "incomplete"
]);
export type ProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerStatus = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerStatusSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerRowSchema = z.object({
  key: z.enum([
    "noop_execution_dryrun",
    "acceptance_record",
    "handoff_packet",
    "decision_receipt",
    "release_gate",
    "reconciliation",
    "attestation_audit",
    "closure_ledger",
    "certification",
    "verification",
    "release_evidence",
    "external_calls"
  ]),
  label: z.string().min(1),
  rowStatus: providerWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerStatusSchema,
  safeDigest: z.string().min(1),
  checkedCount: z.number().int().nonnegative(),
  complete: z.boolean()
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerRow = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerRowSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseDryRunFinalReadinessRowSchema = z.object({
  key: z.enum([
    "dryrun_passed",
    "execution_mode_no_op",
    "acceptance_acknowledged",
    "handoff_ready",
    "release_decision_go",
    "gate_ready",
    "safe_digests",
    "no_state_mutation",
    "external_calls_zero"
  ]),
  label: z.string().min(1),
  readinessStatus: z.enum(["ready", "pending", "blocked", "incomplete"]),
  safeDigest: z.string().min(1),
  checkedCount: z.number().int().nonnegative(),
  complete: z.boolean()
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseDryRunFinalReadinessRow = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseDryRunFinalReadinessRowSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerSchema = z.object({
  ledgerKind: z.literal("qa-handoff-locked-archive-certified-release-dryrun-result-ledger"),
  ledgerStatus: providerWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerStatusSchema,
  dryRunStatus: providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunStatusSchema,
  executionMode: providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionModeSchema,
  acceptanceStatus: providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceStatusSchema,
  handoffStatus: providerWebhookReviewQaHandoffCertifiedReleaseHandoffStatusSchema,
  releaseDecision: providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptDecisionSchema,
  packetStatus: providerWebhookReviewQaHandoffCertifiedReleaseHandoffPacketStatusSchema,
  receiptStatus: providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptStatusSchema,
  gateStatus: providerWebhookReviewQaHandoffCertifiedReleaseGateStatusSchema,
  goNoGoDecision: providerWebhookReviewQaHandoffCertifiedReleaseGateDecisionSchema,
  releaseReadinessStatus: providerWebhookReviewQaHandoffReleaseReadinessStatusSchema,
  reconciliationStatus: z.enum(["complete", "aligned"]),
  attestationStatus: z.literal("complete"),
  ledgerStatusFromClosure: providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunSchema.shape.ledgerStatus,
  certificationStatus: z.literal("certified"),
  verificationStatus: z.literal("verified"),
  digestChainStatus: z.literal("confirmed"),
  safeFilename: z.string().min(1),
  safeDigest: z.string().min(1),
  dryRunResultLedgerDigest: z.string().min(1),
  noopExecutionDryRunDigest: z.string().min(1),
  acceptanceRecordDigest: z.string().min(1),
  handoffPacketDigest: z.string().min(1),
  decisionReceiptDigest: z.string().min(1),
  releaseGateDigest: z.string().min(1),
  reconciliationDigest: z.string().min(1),
  attestationAuditDigest: z.string().min(1),
  closureLedgerDigest: z.string().min(1),
  certificationDigest: z.string().min(1),
  verificationDigest: z.string().min(1),
  releaseEvidenceDigest: z.string().min(1),
  operatorChecklist: providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunSchema.shape.operatorChecklist,
  acknowledgedChecklist: providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunSchema.shape.acknowledgedChecklist,
  executionChecklist: providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunSchema.shape.executionChecklist,
  dryRunRows: providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunSchema.shape.dryRunRows,
  executionPlanRows: providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunSchema.shape.executionPlanRows,
  resultLedgerRows: z.array(providerWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerRowSchema).min(1),
  finalReadinessRows: z.array(providerWebhookReviewQaHandoffCertifiedReleaseDryRunFinalReadinessRowSchema).min(1),
  releaseOwnerSummary: providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunSchema.shape.releaseOwnerSummary,
  inheritedPrerequisiteChecklist: providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunSchema.shape.inheritedPrerequisiteChecklist,
  inheritedCertificationChecklist: providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunSchema.shape.inheritedCertificationChecklist,
  inheritedGateChecklist: providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunSchema.shape.inheritedGateChecklist,
  inheritedDecisionReceiptSummary: providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunSchema.shape.inheritedDecisionReceiptSummary,
  inheritedHandoffPacketSummary: providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunSchema.shape.inheritedHandoffPacketSummary,
  inheritedAcceptanceSummary: providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunSchema.shape.inheritedAcceptanceSummary,
  inheritedNoopDryRunSummary: z.object({
    dryRunStatus: providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunStatusSchema,
    executionMode: providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionModeSchema,
    acceptanceStatus: providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceStatusSchema,
    handoffStatus: providerWebhookReviewQaHandoffCertifiedReleaseHandoffStatusSchema,
    releaseDecision: providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptDecisionSchema,
    checklistAcknowledged: z.boolean(),
    dryRunRowCount: z.number().int().nonnegative(),
    dryRunRowPassedCount: z.number().int().nonnegative(),
    executionPlanRowCount: z.number().int().nonnegative(),
    executionPlanReadyCount: z.number().int().nonnegative(),
    externalCallsZero: z.boolean(),
    safeDigest: z.string().min(1)
  }).strict(),
  inheritedBlockingReasons: providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunSchema.shape.inheritedBlockingReasons,
  inheritedExceptionRows: providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunSchema.shape.inheritedExceptionRows,
  counts: providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunSchema.shape.counts.extend({
    dryRunResultLedgerCheckedCount: z.number().int().nonnegative(),
    dryRunResultLedgerMutationCount: z.number().int().nonnegative(),
    resultLedgerRowCount: z.number().int().nonnegative(),
    resultLedgerRowRecordedCount: z.number().int().nonnegative(),
    finalReadinessRowCount: z.number().int().nonnegative(),
    finalReadinessReadyCount: z.number().int().nonnegative()
  }).strict(),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedger = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificateStatusSchema = z.enum([
  "pending",
  "issued",
  "blocked",
  "incomplete"
]);
export type ProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificateStatus = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificateStatusSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseFinalReadinessStatusSchema = z.enum([
  "ready",
  "not_ready",
  "incomplete"
]);
export type ProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessStatus = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseFinalReadinessStatusSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificateRowSchema = z.object({
  key: z.enum([
    "dryrun_result_ledger",
    "dryrun_passed",
    "execution_mode_no_op",
    "acceptance_acknowledged",
    "handoff_ready",
    "release_decision_go",
    "gate_ready",
    "prerequisite_chain",
    "safe_digests",
    "no_state_mutation",
    "external_calls_zero"
  ]),
  label: z.string().min(1),
  certificateStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificateStatusSchema,
  finalReadinessStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalReadinessStatusSchema,
  safeDigest: z.string().min(1),
  checkedCount: z.number().int().nonnegative(),
  complete: z.boolean()
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificateRow = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificateRowSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificateSchema = z.object({
  certificateKind: z.literal("qa-handoff-locked-archive-certified-release-final-readiness-certificate"),
  certificateStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificateStatusSchema,
  finalReadinessStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalReadinessStatusSchema,
  ledgerStatus: providerWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerStatusSchema,
  dryRunStatus: providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunStatusSchema,
  executionMode: providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionModeSchema,
  acceptanceStatus: providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceStatusSchema,
  handoffStatus: providerWebhookReviewQaHandoffCertifiedReleaseHandoffStatusSchema,
  releaseDecision: providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptDecisionSchema,
  packetStatus: providerWebhookReviewQaHandoffCertifiedReleaseHandoffPacketStatusSchema,
  receiptStatus: providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptStatusSchema,
  gateStatus: providerWebhookReviewQaHandoffCertifiedReleaseGateStatusSchema,
  goNoGoDecision: providerWebhookReviewQaHandoffCertifiedReleaseGateDecisionSchema,
  releaseReadinessStatus: providerWebhookReviewQaHandoffReleaseReadinessStatusSchema,
  reconciliationStatus: z.enum(["complete", "aligned"]),
  attestationStatus: z.literal("complete"),
  ledgerStatusFromClosure: providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunSchema.shape.ledgerStatus,
  certificationStatus: z.literal("certified"),
  verificationStatus: z.literal("verified"),
  digestChainStatus: z.literal("confirmed"),
  safeFilename: z.string().min(1),
  safeDigest: z.string().min(1),
  finalReadinessCertificateDigest: z.string().min(1),
  dryRunResultLedgerDigest: z.string().min(1),
  noopExecutionDryRunDigest: z.string().min(1),
  acceptanceRecordDigest: z.string().min(1),
  handoffPacketDigest: z.string().min(1),
  decisionReceiptDigest: z.string().min(1),
  releaseGateDigest: z.string().min(1),
  reconciliationDigest: z.string().min(1),
  attestationAuditDigest: z.string().min(1),
  closureLedgerDigest: z.string().min(1),
  certificationDigest: z.string().min(1),
  verificationDigest: z.string().min(1),
  releaseEvidenceDigest: z.string().min(1),
  operatorChecklist: providerWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerSchema.shape.operatorChecklist,
  acknowledgedChecklist: providerWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerSchema.shape.acknowledgedChecklist,
  executionChecklist: providerWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerSchema.shape.executionChecklist,
  dryRunRows: providerWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerSchema.shape.dryRunRows,
  executionPlanRows: providerWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerSchema.shape.executionPlanRows,
  resultLedgerRows: providerWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerSchema.shape.resultLedgerRows,
  finalReadinessRows: providerWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerSchema.shape.finalReadinessRows,
  certificateRows: z.array(providerWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificateRowSchema).min(1),
  releaseOwnerSummary: providerWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerSchema.shape.releaseOwnerSummary,
  inheritedPrerequisiteChecklist: providerWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerSchema.shape.inheritedPrerequisiteChecklist,
  inheritedCertificationChecklist: providerWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerSchema.shape.inheritedCertificationChecklist,
  inheritedGateChecklist: providerWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerSchema.shape.inheritedGateChecklist,
  inheritedDecisionReceiptSummary: providerWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerSchema.shape.inheritedDecisionReceiptSummary,
  inheritedHandoffPacketSummary: providerWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerSchema.shape.inheritedHandoffPacketSummary,
  inheritedAcceptanceSummary: providerWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerSchema.shape.inheritedAcceptanceSummary,
  inheritedNoopDryRunSummary: providerWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerSchema.shape.inheritedNoopDryRunSummary,
  inheritedResultLedgerSummary: z.object({
    ledgerStatus: providerWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerStatusSchema,
    dryRunStatus: providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunStatusSchema,
    executionMode: providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionModeSchema,
    acceptanceStatus: providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceStatusSchema,
    handoffStatus: providerWebhookReviewQaHandoffCertifiedReleaseHandoffStatusSchema,
    releaseDecision: providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptDecisionSchema,
    resultLedgerRowCount: z.number().int().nonnegative(),
    resultLedgerRowRecordedCount: z.number().int().nonnegative(),
    finalReadinessRowCount: z.number().int().nonnegative(),
    finalReadinessReadyCount: z.number().int().nonnegative(),
    externalCallsZero: z.boolean(),
    safeDigest: z.string().min(1)
  }).strict(),
  inheritedBlockingReasons: providerWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerSchema.shape.inheritedBlockingReasons,
  inheritedExceptionRows: providerWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerSchema.shape.inheritedExceptionRows,
  counts: providerWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerSchema.shape.counts.extend({
    finalReadinessCertificateCheckedCount: z.number().int().nonnegative(),
    finalReadinessCertificateMutationCount: z.number().int().nonnegative(),
    certificateRowCount: z.number().int().nonnegative(),
    certificateRowIssuedCount: z.number().int().nonnegative()
  }).strict(),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificate = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificateSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegisterStatusSchema = z.enum([
  "pending",
  "recorded",
  "blocked",
  "incomplete"
]);
export type ProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegisterStatus = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegisterStatusSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseFreezeStatusSchema = z.literal("frozen");
export type ProviderWebhookReviewQaHandoffCertifiedReleaseFreezeStatus = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseFreezeStatusSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseRollbackReadinessStatusSchema = z.enum([
  "ready",
  "not_ready",
  "incomplete"
]);
export type ProviderWebhookReviewQaHandoffCertifiedReleaseRollbackReadinessStatus = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseRollbackReadinessStatusSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegisterRowSchema = z.object({
  key: z.enum([
    "final_readiness_certificate",
    "release_freeze_scope",
    "rollback_plan_ready",
    "rollback_owner_confirmed",
    "safe_digests",
    "no_state_mutation",
    "external_calls_zero"
  ]),
  label: z.string().min(1),
  freezeAuditStatus: providerWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegisterStatusSchema,
  rollbackReadinessStatus: providerWebhookReviewQaHandoffCertifiedReleaseRollbackReadinessStatusSchema,
  safeDigest: z.string().min(1),
  checkedCount: z.number().int().nonnegative(),
  complete: z.boolean()
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegisterRow = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegisterRowSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegisterSchema = z.object({
  registerKind: z.literal("qa-handoff-locked-archive-certified-release-freeze-audit-register"),
  freezeAuditStatus: providerWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegisterStatusSchema,
  freezeStatus: providerWebhookReviewQaHandoffCertifiedReleaseFreezeStatusSchema,
  rollbackReadinessStatus: providerWebhookReviewQaHandoffCertifiedReleaseRollbackReadinessStatusSchema,
  certificateStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificateStatusSchema,
  finalReadinessStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalReadinessStatusSchema,
  ledgerStatus: providerWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerStatusSchema,
  dryRunStatus: providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunStatusSchema,
  executionMode: providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionModeSchema,
  acceptanceStatus: providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceStatusSchema,
  handoffStatus: providerWebhookReviewQaHandoffCertifiedReleaseHandoffStatusSchema,
  releaseDecision: providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptDecisionSchema,
  packetStatus: providerWebhookReviewQaHandoffCertifiedReleaseHandoffPacketStatusSchema,
  receiptStatus: providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptStatusSchema,
  gateStatus: providerWebhookReviewQaHandoffCertifiedReleaseGateStatusSchema,
  goNoGoDecision: providerWebhookReviewQaHandoffCertifiedReleaseGateDecisionSchema,
  releaseReadinessStatus: providerWebhookReviewQaHandoffReleaseReadinessStatusSchema,
  reconciliationStatus: z.enum(["complete", "aligned"]),
  attestationStatus: z.literal("complete"),
  ledgerStatusFromClosure: providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunSchema.shape.ledgerStatus,
  certificationStatus: z.literal("certified"),
  verificationStatus: z.literal("verified"),
  digestChainStatus: z.literal("confirmed"),
  safeFilename: z.string().min(1),
  safeDigest: z.string().min(1),
  freezeAuditRegisterDigest: z.string().min(1),
  rollbackReadinessPlanDigest: z.string().min(1),
  finalReadinessCertificateDigest: z.string().min(1),
  dryRunResultLedgerDigest: z.string().min(1),
  noopExecutionDryRunDigest: z.string().min(1),
  acceptanceRecordDigest: z.string().min(1),
  handoffPacketDigest: z.string().min(1),
  decisionReceiptDigest: z.string().min(1),
  releaseGateDigest: z.string().min(1),
  reconciliationDigest: z.string().min(1),
  attestationAuditDigest: z.string().min(1),
  closureLedgerDigest: z.string().min(1),
  certificationDigest: z.string().min(1),
  verificationDigest: z.string().min(1),
  releaseEvidenceDigest: z.string().min(1),
  operatorChecklist: providerWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificateSchema.shape.operatorChecklist,
  acknowledgedChecklist: providerWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificateSchema.shape.acknowledgedChecklist,
  executionChecklist: providerWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificateSchema.shape.executionChecklist,
  dryRunRows: providerWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificateSchema.shape.dryRunRows,
  executionPlanRows: providerWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificateSchema.shape.executionPlanRows,
  resultLedgerRows: providerWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificateSchema.shape.resultLedgerRows,
  finalReadinessRows: providerWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificateSchema.shape.finalReadinessRows,
  certificateRows: providerWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificateSchema.shape.certificateRows,
  freezeAuditRows: z.array(providerWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegisterRowSchema).min(1),
  rollbackPlanRows: z.array(providerWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegisterRowSchema).min(1),
  releaseOwnerSummary: providerWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificateSchema.shape.releaseOwnerSummary,
  inheritedPrerequisiteChecklist: providerWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificateSchema.shape.inheritedPrerequisiteChecklist,
  inheritedCertificationChecklist: providerWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificateSchema.shape.inheritedCertificationChecklist,
  inheritedGateChecklist: providerWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificateSchema.shape.inheritedGateChecklist,
  inheritedDecisionReceiptSummary: providerWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificateSchema.shape.inheritedDecisionReceiptSummary,
  inheritedHandoffPacketSummary: providerWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificateSchema.shape.inheritedHandoffPacketSummary,
  inheritedAcceptanceSummary: providerWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificateSchema.shape.inheritedAcceptanceSummary,
  inheritedNoopDryRunSummary: providerWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificateSchema.shape.inheritedNoopDryRunSummary,
  inheritedResultLedgerSummary: providerWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificateSchema.shape.inheritedResultLedgerSummary,
  inheritedFinalReadinessCertificateSummary: z.object({
    certificateStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificateStatusSchema,
    finalReadinessStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalReadinessStatusSchema,
    certificateRowCount: z.number().int().nonnegative(),
    certificateRowIssuedCount: z.number().int().nonnegative(),
    finalReadinessCertificateMutationCount: z.number().int().nonnegative(),
    externalCallsZero: z.boolean(),
    safeDigest: z.string().min(1)
  }).strict(),
  inheritedBlockingReasons: providerWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificateSchema.shape.inheritedBlockingReasons,
  inheritedExceptionRows: providerWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificateSchema.shape.inheritedExceptionRows,
  counts: providerWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificateSchema.shape.counts.extend({
    freezeAuditRegisterCheckedCount: z.number().int().nonnegative(),
    freezeAuditRegisterMutationCount: z.number().int().nonnegative(),
    freezeAuditRowCount: z.number().int().nonnegative(),
    freezeAuditRegisteredCount: z.number().int().nonnegative(),
    rollbackPlanRowCount: z.number().int().nonnegative(),
    rollbackPlanReadyCount: z.number().int().nonnegative()
  }).strict(),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegisterSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptStatusSchema = z.enum([
  "pending",
  "verified",
  "blocked",
  "incomplete"
]);
export type ProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptStatus = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptStatusSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseRecoveryReadinessStatusSchema = z.enum([
  "ready",
  "not_ready",
  "incomplete"
]);
export type ProviderWebhookReviewQaHandoffCertifiedReleaseRecoveryReadinessStatus = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseRecoveryReadinessStatusSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptRowSchema = z.object({
  key: z.enum([
    "freeze_audit_recorded",
    "release_frozen",
    "rollback_readiness_ready",
    "certificate_issued",
    "final_readiness_ready",
    "dry_run_noop_passed",
    "safe_digest_chain",
    "rollback_rehearsal_noop",
    "recovery_owner_confirmed",
    "recovery_plan_ready",
    "no_state_mutation",
    "external_calls_zero"
  ]),
  label: z.string().min(1),
  rollbackRehearsalStatus: providerWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptStatusSchema,
  recoveryReadinessStatus: providerWebhookReviewQaHandoffCertifiedReleaseRecoveryReadinessStatusSchema,
  safeDigest: z.string().min(1),
  checkedCount: z.number().int().nonnegative(),
  complete: z.boolean()
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptRow = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptRowSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptSchema = z.object({
  receiptKind: z.literal("qa-handoff-locked-archive-certified-release-rollback-rehearsal-receipt"),
  rollbackRehearsalStatus: providerWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptStatusSchema,
  recoveryReadinessStatus: providerWebhookReviewQaHandoffCertifiedReleaseRecoveryReadinessStatusSchema,
  rollbackReadinessStatus: providerWebhookReviewQaHandoffCertifiedReleaseRollbackReadinessStatusSchema,
  freezeAuditStatus: providerWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegisterStatusSchema,
  freezeStatus: providerWebhookReviewQaHandoffCertifiedReleaseFreezeStatusSchema,
  certificateStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificateStatusSchema,
  finalReadinessStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalReadinessStatusSchema,
  ledgerStatus: providerWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerStatusSchema,
  dryRunStatus: providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunStatusSchema,
  executionMode: providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionModeSchema,
  acceptanceStatus: providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceStatusSchema,
  handoffStatus: providerWebhookReviewQaHandoffCertifiedReleaseHandoffStatusSchema,
  releaseDecision: providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptDecisionSchema,
  packetStatus: providerWebhookReviewQaHandoffCertifiedReleaseHandoffPacketStatusSchema,
  receiptStatus: providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptStatusSchema,
  gateStatus: providerWebhookReviewQaHandoffCertifiedReleaseGateStatusSchema,
  goNoGoDecision: providerWebhookReviewQaHandoffCertifiedReleaseGateDecisionSchema,
  releaseReadinessStatus: providerWebhookReviewQaHandoffReleaseReadinessStatusSchema,
  reconciliationStatus: z.enum(["complete", "aligned"]),
  attestationStatus: z.literal("complete"),
  ledgerStatusFromClosure: providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunSchema.shape.ledgerStatus,
  certificationStatus: z.literal("certified"),
  verificationStatus: z.literal("verified"),
  digestChainStatus: z.literal("confirmed"),
  safeFilename: z.string().min(1),
  safeDigest: z.string().min(1),
  rollbackRehearsalReceiptDigest: z.string().min(1),
  freezeAuditRegisterDigest: z.string().min(1),
  finalReadinessCertificateDigest: z.string().min(1),
  dryRunResultLedgerDigest: z.string().min(1),
  noopExecutionDryRunDigest: z.string().min(1),
  acceptanceRecordDigest: z.string().min(1),
  handoffPacketDigest: z.string().min(1),
  decisionReceiptDigest: z.string().min(1),
  releaseGateDigest: z.string().min(1),
  reconciliationDigest: z.string().min(1),
  attestationAuditDigest: z.string().min(1),
  closureLedgerDigest: z.string().min(1),
  certificationDigest: z.string().min(1),
  verificationDigest: z.string().min(1),
  releaseEvidenceDigest: z.string().min(1),
  operatorChecklist: providerWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegisterSchema.shape.operatorChecklist,
  acknowledgedChecklist: providerWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegisterSchema.shape.acknowledgedChecklist,
  executionChecklist: providerWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegisterSchema.shape.executionChecklist,
  dryRunRows: providerWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegisterSchema.shape.dryRunRows,
  executionPlanRows: providerWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegisterSchema.shape.executionPlanRows,
  resultLedgerRows: providerWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegisterSchema.shape.resultLedgerRows,
  finalReadinessRows: providerWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegisterSchema.shape.finalReadinessRows,
  certificateRows: providerWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegisterSchema.shape.certificateRows,
  freezeAuditRows: providerWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegisterSchema.shape.freezeAuditRows,
  freezeSnapshotRows: z.array(providerWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptRowSchema).min(1),
  rollbackReadinessRows: z.array(providerWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptRowSchema).min(1),
  rollbackRehearsalRows: z.array(providerWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptRowSchema).min(1),
  recoveryPlanRows: z.array(providerWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptRowSchema).min(1),
  recoveryReadinessRows: z.array(providerWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptRowSchema).min(1),
  releaseOwnerSummary: providerWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegisterSchema.shape.releaseOwnerSummary,
  inheritedPrerequisiteChecklist: providerWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegisterSchema.shape.inheritedPrerequisiteChecklist,
  inheritedCertificationChecklist: providerWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegisterSchema.shape.inheritedCertificationChecklist,
  inheritedGateChecklist: providerWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegisterSchema.shape.inheritedGateChecklist,
  inheritedDecisionReceiptSummary: providerWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegisterSchema.shape.inheritedDecisionReceiptSummary,
  inheritedHandoffPacketSummary: providerWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegisterSchema.shape.inheritedHandoffPacketSummary,
  inheritedAcceptanceSummary: providerWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegisterSchema.shape.inheritedAcceptanceSummary,
  inheritedNoopDryRunSummary: providerWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegisterSchema.shape.inheritedNoopDryRunSummary,
  inheritedResultLedgerSummary: providerWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegisterSchema.shape.inheritedResultLedgerSummary,
  inheritedFinalReadinessCertificateSummary: providerWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegisterSchema.shape.inheritedFinalReadinessCertificateSummary,
  inheritedFreezeAuditSummary: z.object({
    freezeAuditStatus: providerWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegisterStatusSchema,
    freezeStatus: providerWebhookReviewQaHandoffCertifiedReleaseFreezeStatusSchema,
    rollbackReadinessStatus: providerWebhookReviewQaHandoffCertifiedReleaseRollbackReadinessStatusSchema,
    freezeAuditRowCount: z.number().int().nonnegative(),
    freezeAuditRegisteredCount: z.number().int().nonnegative(),
    rollbackPlanRowCount: z.number().int().nonnegative(),
    rollbackPlanReadyCount: z.number().int().nonnegative(),
    freezeAuditRegisterMutationCount: z.number().int().nonnegative(),
    externalCallsZero: z.boolean(),
    safeDigest: z.string().min(1)
  }).strict(),
  inheritedBlockingReasons: providerWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegisterSchema.shape.inheritedBlockingReasons,
  inheritedExceptionRows: providerWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegisterSchema.shape.inheritedExceptionRows,
  counts: providerWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegisterSchema.shape.counts.extend({
    rollbackRehearsalReceiptCheckedCount: z.number().int().nonnegative(),
    rollbackRehearsalReceiptMutationCount: z.number().int().nonnegative(),
    freezeSnapshotRowCount: z.number().int().nonnegative(),
    freezeSnapshotVerifiedCount: z.number().int().nonnegative(),
    rollbackReadinessRowCount: z.number().int().nonnegative(),
    rollbackReadinessReadyCount: z.number().int().nonnegative(),
    rollbackRehearsalRowCount: z.number().int().nonnegative(),
    rollbackRehearsalVerifiedCount: z.number().int().nonnegative(),
    recoveryPlanRowCount: z.number().int().nonnegative(),
    recoveryPlanReadyCount: z.number().int().nonnegative(),
    recoveryReadinessRowCount: z.number().int().nonnegative(),
    recoveryReadinessReadyCount: z.number().int().nonnegative()
  }).strict(),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseControlRoomStatusSchema = z.enum([
  "pending",
  "ready",
  "blocked",
  "incomplete"
]);
export type ProviderWebhookReviewQaHandoffCertifiedReleaseControlRoomStatus = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseControlRoomStatusSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseCutoverReadinessStatusSchema = z.enum([
  "ready",
  "not_ready",
  "incomplete"
]);
export type ProviderWebhookReviewQaHandoffCertifiedReleaseCutoverReadinessStatus = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseCutoverReadinessStatusSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseControlRoomPacketRowSchema = z.object({
  key: z.enum([
    "rollback_rehearsal_verified",
    "recovery_readiness_ready",
    "rollback_readiness_ready",
    "freeze_audit_recorded",
    "release_frozen",
    "final_readiness_ready",
    "go_decision_confirmed",
    "operator_checklist_complete",
    "acknowledgement_complete",
    "execution_checklist_complete",
    "receipt_issued",
    "packet_issued",
    "safe_digest_chain",
    "no_state_mutation",
    "external_calls_zero"
  ]),
  label: z.string().min(1),
  controlRoomStatus: providerWebhookReviewQaHandoffCertifiedReleaseControlRoomStatusSchema,
  cutoverReadinessStatus: providerWebhookReviewQaHandoffCertifiedReleaseCutoverReadinessStatusSchema,
  safeDigest: z.string().min(1),
  checkedCount: z.number().int().nonnegative(),
  complete: z.boolean()
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseControlRoomPacketRow = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseControlRoomPacketRowSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseControlRoomPacketSchema = z.object({
  packetKind: z.literal("qa-handoff-locked-archive-certified-release-control-room-packet"),
  controlRoomStatus: providerWebhookReviewQaHandoffCertifiedReleaseControlRoomStatusSchema,
  cutoverReadinessStatus: providerWebhookReviewQaHandoffCertifiedReleaseCutoverReadinessStatusSchema,
  rollbackRehearsalStatus: providerWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptStatusSchema,
  recoveryReadinessStatus: providerWebhookReviewQaHandoffCertifiedReleaseRecoveryReadinessStatusSchema,
  rollbackReadinessStatus: providerWebhookReviewQaHandoffCertifiedReleaseRollbackReadinessStatusSchema,
  freezeAuditStatus: providerWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegisterStatusSchema,
  freezeStatus: providerWebhookReviewQaHandoffCertifiedReleaseFreezeStatusSchema,
  certificateStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificateStatusSchema,
  finalReadinessStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalReadinessStatusSchema,
  ledgerStatus: providerWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerStatusSchema,
  dryRunStatus: providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunStatusSchema,
  executionMode: providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionModeSchema,
  acceptanceStatus: providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceStatusSchema,
  handoffStatus: providerWebhookReviewQaHandoffCertifiedReleaseHandoffStatusSchema,
  releaseDecision: providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptDecisionSchema,
  packetStatus: providerWebhookReviewQaHandoffCertifiedReleaseHandoffPacketStatusSchema,
  receiptStatus: providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptStatusSchema,
  gateStatus: providerWebhookReviewQaHandoffCertifiedReleaseGateStatusSchema,
  goNoGoDecision: providerWebhookReviewQaHandoffCertifiedReleaseGateDecisionSchema,
  releaseReadinessStatus: providerWebhookReviewQaHandoffReleaseReadinessStatusSchema,
  reconciliationStatus: z.enum(["complete", "aligned"]),
  attestationStatus: z.literal("complete"),
  ledgerStatusFromClosure: providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunSchema.shape.ledgerStatus,
  certificationStatus: z.literal("certified"),
  verificationStatus: z.literal("verified"),
  digestChainStatus: z.literal("confirmed"),
  safeFilename: z.string().min(1),
  safeDigest: z.string().min(1),
  controlRoomPacketDigest: z.string().min(1),
  rollbackRehearsalReceiptDigest: z.string().min(1),
  freezeAuditRegisterDigest: z.string().min(1),
  finalReadinessCertificateDigest: z.string().min(1),
  dryRunResultLedgerDigest: z.string().min(1),
  noopExecutionDryRunDigest: z.string().min(1),
  acceptanceRecordDigest: z.string().min(1),
  handoffPacketDigest: z.string().min(1),
  decisionReceiptDigest: z.string().min(1),
  releaseGateDigest: z.string().min(1),
  reconciliationDigest: z.string().min(1),
  attestationAuditDigest: z.string().min(1),
  closureLedgerDigest: z.string().min(1),
  certificationDigest: z.string().min(1),
  verificationDigest: z.string().min(1),
  releaseEvidenceDigest: z.string().min(1),
  operatorChecklist: providerWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptSchema.shape.operatorChecklist,
  acknowledgedChecklist: providerWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptSchema.shape.acknowledgedChecklist,
  executionChecklist: providerWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptSchema.shape.executionChecklist,
  dryRunRows: providerWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptSchema.shape.dryRunRows,
  executionPlanRows: providerWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptSchema.shape.executionPlanRows,
  resultLedgerRows: providerWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptSchema.shape.resultLedgerRows,
  finalReadinessRows: providerWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptSchema.shape.finalReadinessRows,
  certificateRows: providerWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptSchema.shape.certificateRows,
  freezeAuditRows: providerWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptSchema.shape.freezeAuditRows,
  freezeSnapshotRows: providerWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptSchema.shape.freezeSnapshotRows,
  rollbackReadinessRows: providerWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptSchema.shape.rollbackReadinessRows,
  rollbackRehearsalRows: providerWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptSchema.shape.rollbackRehearsalRows,
  recoveryPlanRows: providerWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptSchema.shape.recoveryPlanRows,
  recoveryReadinessRows: providerWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptSchema.shape.recoveryReadinessRows,
  controlRoomRows: z.array(providerWebhookReviewQaHandoffCertifiedReleaseControlRoomPacketRowSchema).min(1),
  cutoverChecklistRows: z.array(providerWebhookReviewQaHandoffCertifiedReleaseControlRoomPacketRowSchema).min(1),
  operatorHandoffRows: z.array(providerWebhookReviewQaHandoffCertifiedReleaseControlRoomPacketRowSchema).min(1),
  releaseOwnerSummary: providerWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptSchema.shape.releaseOwnerSummary,
  inheritedPrerequisiteChecklist: providerWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptSchema.shape.inheritedPrerequisiteChecklist,
  inheritedCertificationChecklist: providerWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptSchema.shape.inheritedCertificationChecklist,
  inheritedGateChecklist: providerWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptSchema.shape.inheritedGateChecklist,
  inheritedDecisionReceiptSummary: providerWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptSchema.shape.inheritedDecisionReceiptSummary,
  inheritedHandoffPacketSummary: providerWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptSchema.shape.inheritedHandoffPacketSummary,
  inheritedAcceptanceSummary: providerWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptSchema.shape.inheritedAcceptanceSummary,
  inheritedNoopDryRunSummary: providerWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptSchema.shape.inheritedNoopDryRunSummary,
  inheritedResultLedgerSummary: providerWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptSchema.shape.inheritedResultLedgerSummary,
  inheritedFinalReadinessCertificateSummary: providerWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptSchema.shape.inheritedFinalReadinessCertificateSummary,
  inheritedFreezeAuditSummary: providerWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptSchema.shape.inheritedFreezeAuditSummary,
  inheritedRollbackRehearsalSummary: z.object({
    rollbackRehearsalStatus: providerWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptStatusSchema,
    recoveryReadinessStatus: providerWebhookReviewQaHandoffCertifiedReleaseRecoveryReadinessStatusSchema,
    rollbackRehearsalRowCount: z.number().int().nonnegative(),
    rollbackRehearsalVerifiedCount: z.number().int().nonnegative(),
    recoveryReadinessRowCount: z.number().int().nonnegative(),
    recoveryReadinessReadyCount: z.number().int().nonnegative(),
    rollbackRehearsalReceiptMutationCount: z.number().int().nonnegative(),
    externalCallsZero: z.boolean(),
    safeDigest: z.string().min(1)
  }).strict(),
  inheritedBlockingReasons: providerWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptSchema.shape.inheritedBlockingReasons,
  inheritedExceptionRows: providerWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptSchema.shape.inheritedExceptionRows,
  counts: providerWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptSchema.shape.counts.extend({
    controlRoomPacketCheckedCount: z.number().int().nonnegative(),
    controlRoomPacketMutationCount: z.number().int().nonnegative(),
    controlRoomRowCount: z.number().int().nonnegative(),
    controlRoomReadyCount: z.number().int().nonnegative(),
    cutoverChecklistRowCount: z.number().int().nonnegative(),
    cutoverChecklistReadyCount: z.number().int().nonnegative(),
    operatorHandoffRowCount: z.number().int().nonnegative(),
    operatorHandoffReadyCount: z.number().int().nonnegative()
  }).strict(),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseControlRoomPacket = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseControlRoomPacketSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistStatusSchema = z.enum([
  "pending",
  "verified",
  "blocked",
  "incomplete"
]);
export type ProviderWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistStatus = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistStatusSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseOperatorCommandStatusSchema = z.enum([
  "ready",
  "not_ready",
  "incomplete"
]);
export type ProviderWebhookReviewQaHandoffCertifiedReleaseOperatorCommandStatus = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseOperatorCommandStatusSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceiptStatusSchema = z.enum([
  "pending",
  "issued",
  "blocked",
  "incomplete"
]);
export type ProviderWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceiptStatus = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceiptStatusSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceiptStatusSchema = z.enum([
  "pending",
  "issued",
  "blocked",
  "incomplete"
]);
export type ProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceiptStatus = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceiptStatusSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationStatusSchema = z.enum([
  "ready",
  "not_ready",
  "incomplete"
]);
export type ProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationStatus = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationStatusSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseLaunchWindowStatusSchema = z.enum([
  "ready",
  "not_ready",
  "incomplete"
]);
export type ProviderWebhookReviewQaHandoffCertifiedReleaseLaunchWindowStatus = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseLaunchWindowStatusSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationStatusSchema = z.enum([
  "pending",
  "confirmed",
  "blocked",
  "incomplete"
]);
export type ProviderWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationStatus = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationStatusSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldStatusSchema = z.enum([
  "ready",
  "not_ready",
  "incomplete"
]);
export type ProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldStatus = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldStatusSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationStatusSchema = z.enum([
  "pending",
  "authorized",
  "blocked",
  "incomplete"
]);
export type ProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationStatus = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationStatusSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalStatusSchema = z.enum([
  "ready",
  "not_ready",
  "incomplete"
]);
export type ProviderWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalStatus = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalStatusSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceiptRowSchema = z.object({
  key: z.enum([
    "control_room_ready",
    "cutover_readiness_ready",
    "rollback_rehearsal_verified",
    "recovery_readiness_ready",
    "rollback_readiness_ready",
    "freeze_audit_recorded",
    "release_frozen",
    "final_readiness_ready",
    "ledger_recorded",
    "dry_run_passed",
    "no_op_execution",
    "operator_checklist_complete",
    "acknowledgement_complete",
    "execution_checklist_complete",
    "handoff_ready",
    "operator_command_ready",
    "release_decision_go",
    "safe_digest_chain",
    "no_state_mutation",
    "external_calls_zero"
  ]),
  label: z.string().min(1),
  cutoverChecklistStatus: providerWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistStatusSchema,
  operatorCommandStatus: providerWebhookReviewQaHandoffCertifiedReleaseOperatorCommandStatusSchema,
  safeDigest: z.string().min(1),
  checkedCount: z.number().int().nonnegative(),
  complete: z.boolean()
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceiptRow = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceiptRowSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceiptSchema = z.object({
  receiptKind: z.literal("qa-handoff-locked-archive-certified-release-cutover-checklist-receipt"),
  cutoverChecklistStatus: providerWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistStatusSchema,
  operatorCommandStatus: providerWebhookReviewQaHandoffCertifiedReleaseOperatorCommandStatusSchema,
  controlRoomStatus: providerWebhookReviewQaHandoffCertifiedReleaseControlRoomStatusSchema,
  cutoverReadinessStatus: providerWebhookReviewQaHandoffCertifiedReleaseCutoverReadinessStatusSchema,
  rollbackRehearsalStatus: providerWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptStatusSchema,
  recoveryReadinessStatus: providerWebhookReviewQaHandoffCertifiedReleaseRecoveryReadinessStatusSchema,
  rollbackReadinessStatus: providerWebhookReviewQaHandoffCertifiedReleaseRollbackReadinessStatusSchema,
  freezeAuditStatus: providerWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegisterStatusSchema,
  freezeStatus: providerWebhookReviewQaHandoffCertifiedReleaseFreezeStatusSchema,
  certificateStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificateStatusSchema,
  finalReadinessStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalReadinessStatusSchema,
  ledgerStatus: providerWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerStatusSchema,
  dryRunStatus: providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunStatusSchema,
  executionMode: providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionModeSchema,
  acceptanceStatus: providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceStatusSchema,
  handoffStatus: providerWebhookReviewQaHandoffCertifiedReleaseHandoffStatusSchema,
  releaseDecision: providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptDecisionSchema,
  packetStatus: providerWebhookReviewQaHandoffCertifiedReleaseHandoffPacketStatusSchema,
  receiptStatus: providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptStatusSchema,
  gateStatus: providerWebhookReviewQaHandoffCertifiedReleaseGateStatusSchema,
  goNoGoDecision: providerWebhookReviewQaHandoffCertifiedReleaseGateDecisionSchema,
  releaseReadinessStatus: providerWebhookReviewQaHandoffReleaseReadinessStatusSchema,
  reconciliationStatus: z.enum(["complete", "aligned"]),
  attestationStatus: z.literal("complete"),
  ledgerStatusFromClosure: providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunSchema.shape.ledgerStatus,
  certificationStatus: z.literal("certified"),
  verificationStatus: z.literal("verified"),
  digestChainStatus: z.literal("confirmed"),
  safeFilename: z.string().min(1),
  safeDigest: z.string().min(1),
  cutoverChecklistReceiptDigest: z.string().min(1),
  controlRoomPacketDigest: z.string().min(1),
  rollbackRehearsalReceiptDigest: z.string().min(1),
  freezeAuditRegisterDigest: z.string().min(1),
  finalReadinessCertificateDigest: z.string().min(1),
  dryRunResultLedgerDigest: z.string().min(1),
  noopExecutionDryRunDigest: z.string().min(1),
  acceptanceRecordDigest: z.string().min(1),
  handoffPacketDigest: z.string().min(1),
  decisionReceiptDigest: z.string().min(1),
  releaseGateDigest: z.string().min(1),
  reconciliationDigest: z.string().min(1),
  attestationAuditDigest: z.string().min(1),
  closureLedgerDigest: z.string().min(1),
  certificationDigest: z.string().min(1),
  verificationDigest: z.string().min(1),
  releaseEvidenceDigest: z.string().min(1),
  operatorChecklist: providerWebhookReviewQaHandoffCertifiedReleaseControlRoomPacketSchema.shape.operatorChecklist,
  acknowledgedChecklist: providerWebhookReviewQaHandoffCertifiedReleaseControlRoomPacketSchema.shape.acknowledgedChecklist,
  executionChecklist: providerWebhookReviewQaHandoffCertifiedReleaseControlRoomPacketSchema.shape.executionChecklist,
  dryRunRows: providerWebhookReviewQaHandoffCertifiedReleaseControlRoomPacketSchema.shape.dryRunRows,
  executionPlanRows: providerWebhookReviewQaHandoffCertifiedReleaseControlRoomPacketSchema.shape.executionPlanRows,
  resultLedgerRows: providerWebhookReviewQaHandoffCertifiedReleaseControlRoomPacketSchema.shape.resultLedgerRows,
  finalReadinessRows: providerWebhookReviewQaHandoffCertifiedReleaseControlRoomPacketSchema.shape.finalReadinessRows,
  certificateRows: providerWebhookReviewQaHandoffCertifiedReleaseControlRoomPacketSchema.shape.certificateRows,
  freezeAuditRows: providerWebhookReviewQaHandoffCertifiedReleaseControlRoomPacketSchema.shape.freezeAuditRows,
  freezeSnapshotRows: providerWebhookReviewQaHandoffCertifiedReleaseControlRoomPacketSchema.shape.freezeSnapshotRows,
  rollbackReadinessRows: providerWebhookReviewQaHandoffCertifiedReleaseControlRoomPacketSchema.shape.rollbackReadinessRows,
  rollbackRehearsalRows: providerWebhookReviewQaHandoffCertifiedReleaseControlRoomPacketSchema.shape.rollbackRehearsalRows,
  recoveryPlanRows: providerWebhookReviewQaHandoffCertifiedReleaseControlRoomPacketSchema.shape.recoveryPlanRows,
  recoveryReadinessRows: providerWebhookReviewQaHandoffCertifiedReleaseControlRoomPacketSchema.shape.recoveryReadinessRows,
  controlRoomRows: providerWebhookReviewQaHandoffCertifiedReleaseControlRoomPacketSchema.shape.controlRoomRows,
  cutoverChecklistRows: providerWebhookReviewQaHandoffCertifiedReleaseControlRoomPacketSchema.shape.cutoverChecklistRows,
  operatorHandoffRows: providerWebhookReviewQaHandoffCertifiedReleaseControlRoomPacketSchema.shape.operatorHandoffRows,
  operatorCommandRows: z.array(providerWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceiptRowSchema).min(1),
  safeCutoverChecklistRows: z.array(providerWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceiptRowSchema).min(1),
  releaseOwnerSummary: providerWebhookReviewQaHandoffCertifiedReleaseControlRoomPacketSchema.shape.releaseOwnerSummary,
  inheritedPrerequisiteChecklist: providerWebhookReviewQaHandoffCertifiedReleaseControlRoomPacketSchema.shape.inheritedPrerequisiteChecklist,
  inheritedCertificationChecklist: providerWebhookReviewQaHandoffCertifiedReleaseControlRoomPacketSchema.shape.inheritedCertificationChecklist,
  inheritedGateChecklist: providerWebhookReviewQaHandoffCertifiedReleaseControlRoomPacketSchema.shape.inheritedGateChecklist,
  inheritedDecisionReceiptSummary: providerWebhookReviewQaHandoffCertifiedReleaseControlRoomPacketSchema.shape.inheritedDecisionReceiptSummary,
  inheritedHandoffPacketSummary: providerWebhookReviewQaHandoffCertifiedReleaseControlRoomPacketSchema.shape.inheritedHandoffPacketSummary,
  inheritedAcceptanceSummary: providerWebhookReviewQaHandoffCertifiedReleaseControlRoomPacketSchema.shape.inheritedAcceptanceSummary,
  inheritedNoopDryRunSummary: providerWebhookReviewQaHandoffCertifiedReleaseControlRoomPacketSchema.shape.inheritedNoopDryRunSummary,
  inheritedResultLedgerSummary: providerWebhookReviewQaHandoffCertifiedReleaseControlRoomPacketSchema.shape.inheritedResultLedgerSummary,
  inheritedFinalReadinessCertificateSummary: providerWebhookReviewQaHandoffCertifiedReleaseControlRoomPacketSchema.shape.inheritedFinalReadinessCertificateSummary,
  inheritedFreezeAuditSummary: providerWebhookReviewQaHandoffCertifiedReleaseControlRoomPacketSchema.shape.inheritedFreezeAuditSummary,
  inheritedRollbackRehearsalSummary: providerWebhookReviewQaHandoffCertifiedReleaseControlRoomPacketSchema.shape.inheritedRollbackRehearsalSummary,
  inheritedControlRoomSummary: z.object({
    controlRoomStatus: providerWebhookReviewQaHandoffCertifiedReleaseControlRoomStatusSchema,
    cutoverReadinessStatus: providerWebhookReviewQaHandoffCertifiedReleaseCutoverReadinessStatusSchema,
    controlRoomRowCount: z.number().int().nonnegative(),
    controlRoomReadyCount: z.number().int().nonnegative(),
    cutoverChecklistRowCount: z.number().int().nonnegative(),
    cutoverChecklistReadyCount: z.number().int().nonnegative(),
    operatorHandoffRowCount: z.number().int().nonnegative(),
    operatorHandoffReadyCount: z.number().int().nonnegative(),
    controlRoomPacketMutationCount: z.number().int().nonnegative(),
    externalCallsZero: z.boolean(),
    safeDigest: z.string().min(1)
  }).strict(),
  inheritedBlockingReasons: providerWebhookReviewQaHandoffCertifiedReleaseControlRoomPacketSchema.shape.inheritedBlockingReasons,
  inheritedExceptionRows: providerWebhookReviewQaHandoffCertifiedReleaseControlRoomPacketSchema.shape.inheritedExceptionRows,
  counts: providerWebhookReviewQaHandoffCertifiedReleaseControlRoomPacketSchema.shape.counts.extend({
    cutoverChecklistReceiptCheckedCount: z.number().int().nonnegative(),
    cutoverChecklistReceiptMutationCount: z.number().int().nonnegative(),
    operatorCommandRowCount: z.number().int().nonnegative(),
    operatorCommandReadyCount: z.number().int().nonnegative(),
    safeCutoverChecklistRowCount: z.number().int().nonnegative(),
    safeCutoverChecklistReadyCount: z.number().int().nonnegative()
  }).strict(),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceipt = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceiptSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceiptRowSchema = z.object({
  key: z.enum([
    "cutover_checklist_verified",
    "operator_command_ready",
    "control_room_ready",
    "cutover_readiness_ready",
    "rollback_rehearsal_verified",
    "recovery_readiness_ready",
    "rollback_readiness_ready",
    "freeze_audit_recorded",
    "release_frozen",
    "certificate_issued",
    "final_readiness_ready",
    "ledger_recorded",
    "dry_run_passed",
    "no_op_execution",
    "acceptance_acknowledged",
    "handoff_ready",
    "release_decision_go",
    "packet_issued",
    "receipt_issued",
    "gate_ready",
    "go_no_go_go",
    "operator_checklist_complete",
    "acknowledgement_complete",
    "execution_checklist_complete",
    "go_live_authorization_ready",
    "operator_command_receipt_issued",
    "safe_digest_chain",
    "no_state_mutation",
    "external_calls_zero"
  ]),
  label: z.string().min(1),
  operatorCommandReceiptStatus: providerWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceiptStatusSchema,
  goLiveAuthorizationStatus: providerWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationStatusSchema,
  cutoverChecklistStatus: providerWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistStatusSchema,
  operatorCommandStatus: providerWebhookReviewQaHandoffCertifiedReleaseOperatorCommandStatusSchema,
  safeDigest: z.string().min(1),
  checkedCount: z.number().int().nonnegative(),
  complete: z.boolean()
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceiptRow = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceiptRowSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceiptSchema = providerWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceiptSchema.extend({
  receiptKind: z.literal("qa-handoff-locked-archive-certified-release-operator-command-receipt"),
  operatorCommandReceiptStatus: providerWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceiptStatusSchema,
  goLiveAuthorizationStatus: providerWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationStatusSchema,
  operatorCommandReceiptDigest: z.string().min(1),
  goLiveAuthorizationRows: z.array(providerWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceiptRowSchema).min(1),
  operatorCommandReceiptRows: z.array(providerWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceiptRowSchema).min(1),
  commandHandoffRows: z.array(providerWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceiptRowSchema).min(1),
  inheritedCutoverChecklistSummary: z.object({
    cutoverChecklistStatus: providerWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistStatusSchema,
    operatorCommandStatus: providerWebhookReviewQaHandoffCertifiedReleaseOperatorCommandStatusSchema,
    cutoverChecklistReceiptCheckedCount: z.number().int().nonnegative(),
    cutoverChecklistReceiptMutationCount: z.number().int().nonnegative(),
    operatorCommandReadyCount: z.number().int().nonnegative(),
    safeCutoverChecklistReadyCount: z.number().int().nonnegative(),
    externalCallsZero: z.boolean(),
    safeDigest: z.string().min(1)
  }).strict(),
  counts: providerWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceiptSchema.shape.counts.extend({
    operatorCommandReceiptCheckedCount: z.number().int().nonnegative(),
    operatorCommandReceiptMutationCount: z.number().int().nonnegative(),
    goLiveAuthorizationRowCount: z.number().int().nonnegative(),
    goLiveAuthorizationReadyCount: z.number().int().nonnegative(),
    operatorCommandReceiptRowCount: z.number().int().nonnegative(),
    operatorCommandReceiptIssuedCount: z.number().int().nonnegative(),
    commandHandoffRowCount: z.number().int().nonnegative(),
    commandHandoffReadyCount: z.number().int().nonnegative()
  }).strict()
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceipt = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceiptSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceiptRowSchema = z.object({
  key: z.enum([
    "operator_command_receipt_issued",
    "go_live_authorization_ready",
    "cutover_checklist_verified",
    "operator_command_ready",
    "control_room_ready",
    "cutover_readiness_ready",
    "rollback_rehearsal_verified",
    "recovery_readiness_ready",
    "rollback_readiness_ready",
    "freeze_audit_recorded",
    "release_frozen",
    "certificate_issued",
    "final_readiness_ready",
    "ledger_recorded",
    "dry_run_passed",
    "no_op_execution",
    "acceptance_acknowledged",
    "handoff_ready",
    "release_decision_go",
    "packet_issued",
    "receipt_issued",
    "gate_ready",
    "go_no_go_go",
    "operator_checklist_complete",
    "acknowledgement_complete",
    "execution_checklist_complete",
    "launch_window_ready",
    "safe_launch_window_ready",
    "safe_digest_chain",
    "no_state_mutation",
    "external_calls_zero"
  ]),
  label: z.string().min(1),
  goLiveAuthorizationReceiptStatus: providerWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceiptStatusSchema,
  goLiveAuthorizationStatus: providerWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationStatusSchema,
  launchWindowStatus: providerWebhookReviewQaHandoffCertifiedReleaseLaunchWindowStatusSchema,
  safeLaunchWindowStatus: providerWebhookReviewQaHandoffCertifiedReleaseLaunchWindowStatusSchema,
  operatorCommandReceiptStatus: providerWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceiptStatusSchema,
  operatorCommandStatus: providerWebhookReviewQaHandoffCertifiedReleaseOperatorCommandStatusSchema,
  safeDigest: z.string().min(1),
  checkedCount: z.number().int().nonnegative(),
  complete: z.boolean()
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceiptRow = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceiptRowSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceiptSchema = providerWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceiptSchema.extend({
  receiptKind: z.literal("qa-handoff-locked-archive-certified-release-go-live-authorization-receipt"),
  goLiveAuthorizationReceiptStatus: providerWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceiptStatusSchema,
  launchWindowStatus: providerWebhookReviewQaHandoffCertifiedReleaseLaunchWindowStatusSchema,
  safeLaunchWindowStatus: providerWebhookReviewQaHandoffCertifiedReleaseLaunchWindowStatusSchema,
  goLiveAuthorizationReceiptDigest: z.string().min(1),
  goLiveAuthorizationReceiptRows: z.array(providerWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceiptRowSchema).min(1),
  launchWindowRows: z.array(providerWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceiptRowSchema).min(1),
  safeLaunchWindowRows: z.array(providerWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceiptRowSchema).min(1),
  inheritedOperatorCommandSummary: z.object({
    operatorCommandReceiptStatus: providerWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceiptStatusSchema,
    goLiveAuthorizationStatus: providerWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationStatusSchema,
    operatorCommandReceiptCheckedCount: z.number().int().nonnegative(),
    operatorCommandReceiptMutationCount: z.number().int().nonnegative(),
    goLiveAuthorizationReadyCount: z.number().int().nonnegative(),
    operatorCommandReceiptIssuedCount: z.number().int().nonnegative(),
    commandHandoffReadyCount: z.number().int().nonnegative(),
    externalCallsZero: z.boolean(),
    safeDigest: z.string().min(1)
  }).strict(),
  counts: providerWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceiptSchema.shape.counts.extend({
    goLiveAuthorizationReceiptCheckedCount: z.number().int().nonnegative(),
    goLiveAuthorizationReceiptMutationCount: z.number().int().nonnegative(),
    goLiveAuthorizationReceiptRowCount: z.number().int().nonnegative(),
    goLiveAuthorizationReceiptIssuedCount: z.number().int().nonnegative(),
    launchWindowRowCount: z.number().int().nonnegative(),
    launchWindowReadyCount: z.number().int().nonnegative(),
    safeLaunchWindowRowCount: z.number().int().nonnegative(),
    safeLaunchWindowReadyCount: z.number().int().nonnegative()
  }).strict()
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceipt = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceiptSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceiptRowSchema = z.object({
  key: z.enum([
    "go_live_authorization_receipt_issued",
    "go_live_authorization_ready",
    "launch_window_ready",
    "safe_launch_window_ready",
    "operator_command_receipt_issued",
    "operator_command_ready",
    "cutover_checklist_verified",
    "control_room_ready",
    "cutover_readiness_ready",
    "rollback_rehearsal_verified",
    "recovery_readiness_ready",
    "rollback_readiness_ready",
    "freeze_audit_recorded",
    "release_frozen",
    "certificate_issued",
    "final_readiness_ready",
    "ledger_recorded",
    "dry_run_passed",
    "no_op_execution",
    "acceptance_acknowledged",
    "handoff_ready",
    "release_decision_go",
    "packet_issued",
    "receipt_issued",
    "gate_ready",
    "go_no_go_go",
    "operator_checklist_complete",
    "acknowledgement_complete",
    "execution_checklist_complete",
    "launch_window_confirmation_confirmed",
    "go_live_hold_ready",
    "safe_digest_chain",
    "no_state_mutation",
    "external_calls_zero"
  ]),
  label: z.string().min(1),
  launchWindowConfirmationStatus: providerWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationStatusSchema,
  goLiveHoldStatus: providerWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldStatusSchema,
  goLiveAuthorizationReceiptStatus: providerWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceiptStatusSchema,
  goLiveAuthorizationStatus: providerWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationStatusSchema,
  launchWindowStatus: providerWebhookReviewQaHandoffCertifiedReleaseLaunchWindowStatusSchema,
  safeLaunchWindowStatus: providerWebhookReviewQaHandoffCertifiedReleaseLaunchWindowStatusSchema,
  operatorCommandReceiptStatus: providerWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceiptStatusSchema,
  operatorCommandStatus: providerWebhookReviewQaHandoffCertifiedReleaseOperatorCommandStatusSchema,
  safeDigest: z.string().min(1),
  checkedCount: z.number().int().nonnegative(),
  complete: z.boolean()
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceiptRow = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceiptRowSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceiptSchema = providerWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceiptSchema.extend({
  receiptKind: z.literal("qa-handoff-locked-archive-certified-release-launch-window-confirmation-receipt"),
  launchWindowConfirmationStatus: providerWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationStatusSchema,
  goLiveHoldStatus: providerWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldStatusSchema,
  launchWindowConfirmationReceiptDigest: z.string().min(1),
  launchWindowConfirmationRows: z.array(providerWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceiptRowSchema).min(1),
  goLiveHoldRows: z.array(providerWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceiptRowSchema).min(1),
  inheritedGoLiveAuthorizationSummary: z.object({
    goLiveAuthorizationReceiptStatus: providerWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceiptStatusSchema,
    goLiveAuthorizationStatus: providerWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationStatusSchema,
    launchWindowStatus: providerWebhookReviewQaHandoffCertifiedReleaseLaunchWindowStatusSchema,
    safeLaunchWindowStatus: providerWebhookReviewQaHandoffCertifiedReleaseLaunchWindowStatusSchema,
    goLiveAuthorizationReceiptCheckedCount: z.number().int().nonnegative(),
    goLiveAuthorizationReceiptMutationCount: z.number().int().nonnegative(),
    goLiveAuthorizationReceiptIssuedCount: z.number().int().nonnegative(),
    launchWindowReadyCount: z.number().int().nonnegative(),
    safeLaunchWindowReadyCount: z.number().int().nonnegative(),
    externalCallsZero: z.boolean(),
    safeDigest: z.string().min(1)
  }).strict(),
  counts: providerWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceiptSchema.shape.counts.extend({
    launchWindowConfirmationReceiptCheckedCount: z.number().int().nonnegative(),
    launchWindowConfirmationReceiptMutationCount: z.number().int().nonnegative(),
    launchWindowConfirmationRowCount: z.number().int().nonnegative(),
    launchWindowConfirmationConfirmedCount: z.number().int().nonnegative(),
    goLiveHoldRowCount: z.number().int().nonnegative(),
    goLiveHoldReadyCount: z.number().int().nonnegative()
  }).strict()
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceipt = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceiptSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceiptRowSchema = z.object({
  key: z.enum([
    "launch_window_confirmation_confirmed",
    "go_live_hold_ready",
    "go_live_authorization_receipt_issued",
    "go_live_authorization_ready",
    "launch_window_ready",
    "safe_launch_window_ready",
    "operator_command_receipt_issued",
    "operator_command_ready",
    "cutover_checklist_verified",
    "control_room_ready",
    "cutover_readiness_ready",
    "rollback_rehearsal_verified",
    "recovery_readiness_ready",
    "rollback_readiness_ready",
    "freeze_audit_recorded",
    "release_frozen",
    "certificate_issued",
    "final_readiness_ready",
    "ledger_recorded",
    "dry_run_passed",
    "no_op_execution",
    "acceptance_acknowledged",
    "handoff_ready",
    "release_decision_go",
    "packet_issued",
    "receipt_issued",
    "gate_ready",
    "go_no_go_go",
    "operator_checklist_complete",
    "acknowledgement_complete",
    "execution_checklist_complete",
    "go_live_hold_release_authorized",
    "launch_approval_ready",
    "safe_digest_chain",
    "no_state_mutation",
    "external_calls_zero"
  ]),
  label: z.string().min(1),
  goLiveHoldReleaseAuthorizationStatus: providerWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationStatusSchema,
  launchApprovalStatus: providerWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalStatusSchema,
  launchWindowConfirmationStatus: providerWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationStatusSchema,
  goLiveHoldStatus: providerWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldStatusSchema,
  goLiveAuthorizationReceiptStatus: providerWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceiptStatusSchema,
  goLiveAuthorizationStatus: providerWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationStatusSchema,
  launchWindowStatus: providerWebhookReviewQaHandoffCertifiedReleaseLaunchWindowStatusSchema,
  safeLaunchWindowStatus: providerWebhookReviewQaHandoffCertifiedReleaseLaunchWindowStatusSchema,
  operatorCommandReceiptStatus: providerWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceiptStatusSchema,
  operatorCommandStatus: providerWebhookReviewQaHandoffCertifiedReleaseOperatorCommandStatusSchema,
  safeDigest: z.string().min(1),
  checkedCount: z.number().int().nonnegative(),
  complete: z.boolean()
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceiptRow = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceiptRowSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceiptSchema = providerWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceiptSchema.extend({
  receiptKind: z.literal("qa-handoff-locked-archive-certified-release-go-live-hold-release-authorization-receipt"),
  goLiveHoldReleaseAuthorizationStatus: providerWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationStatusSchema,
  launchApprovalStatus: providerWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalStatusSchema,
  goLiveHoldReleaseAuthorizationReceiptDigest: z.string().min(1),
  goLiveHoldReleaseAuthorizationRows: z.array(providerWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceiptRowSchema).min(1),
  launchApprovalRows: z.array(providerWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceiptRowSchema).min(1),
  inheritedLaunchWindowConfirmationSummary: z.object({
    launchWindowConfirmationStatus: providerWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationStatusSchema,
    goLiveHoldStatus: providerWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldStatusSchema,
    goLiveAuthorizationReceiptStatus: providerWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceiptStatusSchema,
    goLiveAuthorizationStatus: providerWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationStatusSchema,
    launchWindowStatus: providerWebhookReviewQaHandoffCertifiedReleaseLaunchWindowStatusSchema,
    safeLaunchWindowStatus: providerWebhookReviewQaHandoffCertifiedReleaseLaunchWindowStatusSchema,
    launchWindowConfirmationReceiptCheckedCount: z.number().int().nonnegative(),
    launchWindowConfirmationReceiptMutationCount: z.number().int().nonnegative(),
    launchWindowConfirmationConfirmedCount: z.number().int().nonnegative(),
    goLiveHoldReadyCount: z.number().int().nonnegative(),
    externalCallsZero: z.boolean(),
    safeDigest: z.string().min(1)
  }).strict(),
  counts: providerWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceiptSchema.shape.counts.extend({
    goLiveHoldReleaseAuthorizationReceiptCheckedCount: z.number().int().nonnegative(),
    goLiveHoldReleaseAuthorizationReceiptMutationCount: z.number().int().nonnegative(),
    goLiveHoldReleaseAuthorizationRowCount: z.number().int().nonnegative(),
    goLiveHoldReleaseAuthorizationAuthorizedCount: z.number().int().nonnegative(),
    launchApprovalRowCount: z.number().int().nonnegative(),
    launchApprovalReadyCount: z.number().int().nonnegative()
  }).strict()
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceipt = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceiptSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceiptStatusSchema = z.enum(["pending", "issued", "blocked", "incomplete"]);
export const providerWebhookReviewQaHandoffCertifiedReleaseNoExecutionGuardStatusSchema = z.enum(["retained", "violated", "incomplete"]);

export const providerWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceiptRowSchema = providerWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceiptRowSchema.extend({
  key: providerWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceiptRowSchema.shape.key.or(z.enum([
    "launch_approval_receipt_issued",
    "no_execution_guard_retained"
  ])),
  launchApprovalReceiptStatus: providerWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceiptStatusSchema,
  noExecutionGuardStatus: providerWebhookReviewQaHandoffCertifiedReleaseNoExecutionGuardStatusSchema
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceiptRow = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceiptRowSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceiptSchema = providerWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceiptSchema.extend({
  receiptKind: z.literal("qa-handoff-locked-archive-certified-release-launch-approval-receipt"),
  launchApprovalReceiptStatus: providerWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceiptStatusSchema,
  noExecutionGuardStatus: providerWebhookReviewQaHandoffCertifiedReleaseNoExecutionGuardStatusSchema,
  launchApprovalReceiptDigest: z.string().min(1),
  noExecutionGuardRows: z.array(providerWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceiptRowSchema).min(1),
  externalCalls: z.literal(0),
  inheritedGoLiveHoldReleaseAuthorizationSummary: z.object({
    goLiveHoldReleaseAuthorizationStatus: providerWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationStatusSchema,
    launchApprovalStatus: providerWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalStatusSchema,
    goLiveHoldReleaseAuthorizationReceiptCheckedCount: z.number().int().nonnegative(),
    goLiveHoldReleaseAuthorizationReceiptMutationCount: z.number().int().nonnegative(),
    goLiveHoldReleaseAuthorizationAuthorizedCount: z.number().int().nonnegative(),
    launchApprovalRowCount: z.number().int().nonnegative(),
    launchApprovalReadyCount: z.number().int().nonnegative(),
    externalCallsZero: z.boolean(),
    safeDigest: z.string().min(1)
  }).strict(),
  counts: providerWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceiptSchema.shape.counts.extend({
    launchApprovalReceiptCheckedCount: z.number().int().nonnegative(),
    launchApprovalReceiptMutationCount: z.number().int().nonnegative(),
    launchApprovalReceiptIssuedCount: z.number().int().nonnegative(),
    noExecutionGuardRowCount: z.number().int().nonnegative(),
    noExecutionGuardRetainedCount: z.number().int().nonnegative()
  }).strict()
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceipt = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceiptSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceiptStatusSchema = z.enum(["pending", "issued", "blocked", "incomplete"]);
export const providerWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockStatusSchema = z.enum(["locked", "violated", "incomplete"]);
export const providerWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalArchiveStatusSchema = z.enum(["retained", "missing", "incomplete"]);
export const providerWebhookReviewQaHandoffCertifiedReleaseTenantScopeStatusSchema = z.enum(["tenant_scoped", "missing", "incomplete"]);
export const providerWebhookReviewQaHandoffCertifiedReleaseProviderOutboundStatusSchema = z.enum(["absent", "detected", "incomplete"]);
export const providerWebhookReviewQaHandoffCertifiedReleaseExternalNotificationStatusSchema = z.enum(["absent", "detected", "incomplete"]);
export const providerWebhookReviewQaHandoffCertifiedReleaseAiCallStatusSchema = z.enum(["absent", "detected", "incomplete"]);

export const providerWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceiptRowSchema = providerWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceiptRowSchema.extend({
  key: providerWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceiptRowSchema.shape.key.or(z.enum([
    "launch_approval_receipt_archived",
    "no_execution_lock_retained",
    "no_mutation_lock_retained",
    "provider_outbound_absent",
    "external_notification_absent",
    "ai_call_absent",
    "tenant_scope_retained",
    "digest_continuity_confirmed"
  ])),
  noExecutionLockReceiptStatus: providerWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceiptStatusSchema,
  noExecutionLockStatus: providerWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockStatusSchema,
  launchApprovalArchiveStatus: providerWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalArchiveStatusSchema,
  tenantScopeStatus: providerWebhookReviewQaHandoffCertifiedReleaseTenantScopeStatusSchema,
  providerOutboundStatus: providerWebhookReviewQaHandoffCertifiedReleaseProviderOutboundStatusSchema,
  externalNotificationStatus: providerWebhookReviewQaHandoffCertifiedReleaseExternalNotificationStatusSchema,
  aiCallStatus: providerWebhookReviewQaHandoffCertifiedReleaseAiCallStatusSchema,
  digestChainStatus: providerWebhookReviewQaHandoffDigestChainStatusSchema
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceiptRow = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceiptRowSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceiptSchema = providerWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceiptSchema.extend({
  receiptKind: z.literal("qa-handoff-locked-archive-certified-release-launch-approval-no-execution-lock-receipt"),
  noExecutionLockReceiptStatus: providerWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceiptStatusSchema,
  noExecutionLockStatus: providerWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockStatusSchema,
  launchApprovalArchiveStatus: providerWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalArchiveStatusSchema,
  tenantScopeStatus: providerWebhookReviewQaHandoffCertifiedReleaseTenantScopeStatusSchema,
  providerOutboundStatus: providerWebhookReviewQaHandoffCertifiedReleaseProviderOutboundStatusSchema,
  externalNotificationStatus: providerWebhookReviewQaHandoffCertifiedReleaseExternalNotificationStatusSchema,
  aiCallStatus: providerWebhookReviewQaHandoffCertifiedReleaseAiCallStatusSchema,
  noExecutionLockReceiptDigest: z.string().min(1),
  noExecutionLockRows: z.array(providerWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceiptRowSchema).min(1),
  externalCalls: z.literal(0),
  inheritedLaunchApprovalReceiptSummary: z.object({
    launchApprovalReceiptStatus: providerWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceiptStatusSchema,
    noExecutionGuardStatus: providerWebhookReviewQaHandoffCertifiedReleaseNoExecutionGuardStatusSchema,
    launchApprovalStatus: providerWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalStatusSchema,
    launchApprovalReceiptCheckedCount: z.number().int().nonnegative(),
    launchApprovalReceiptMutationCount: z.number().int().nonnegative(),
    launchApprovalReceiptIssuedCount: z.number().int().nonnegative(),
    noExecutionGuardRetainedCount: z.number().int().nonnegative(),
    externalCallsZero: z.boolean(),
    safeDigest: z.string().min(1),
    launchApprovalReceiptDigest: z.string().min(1)
  }).strict(),
  counts: providerWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceiptSchema.shape.counts.extend({
    noExecutionLockReceiptCheckedCount: z.number().int().nonnegative(),
    noExecutionLockReceiptMutationCount: z.number().int().nonnegative(),
    noExecutionLockRowCount: z.number().int().nonnegative(),
    noExecutionLockPassedCount: z.number().int().nonnegative(),
    executionAttemptCount: z.number().int().nonnegative(),
    providerOutboundCallCount: z.number().int().nonnegative(),
    externalNotificationSendCount: z.number().int().nonnegative(),
    aiCallCount: z.number().int().nonnegative(),
    tenantScopeCheckedCount: z.number().int().nonnegative(),
    digestContinuityCheckedCount: z.number().int().nonnegative(),
    launchApprovalArchiveRetainedCount: z.number().int().nonnegative()
  }).strict()
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceipt = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceiptSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessStatusSchema = z.enum(["ready_for_handoff", "blocked", "incomplete"]);
export const providerWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffEvidencePacketStatusSchema = z.enum(["issued", "blocked", "incomplete"]);
export const providerWebhookReviewQaHandoffCertifiedReleaseNoExecutionEvidenceStatusSchema = z.enum(["confirmed", "violated", "incomplete"]);
export const providerWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalLockStatusSchema = z.enum(["locked", "missing", "incomplete"]);
export const providerWebhookReviewQaHandoffCertifiedReleaseDigestContinuityStatusSchema = z.enum(["confirmed", "broken", "incomplete"]);
export const providerWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffEvidenceRowStatusSchema = z.enum(["confirmed", "blocked", "incomplete"]);
export const providerWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceStatusSchema = z.enum(["accepted", "blocked", "incomplete"]);
export const providerWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyStatusSchema = z.enum(["accepted", "blocked", "incomplete"]);
export const providerWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringStatusSchema = z.enum(["ready", "blocked", "incomplete"]);
export const providerWebhookReviewQaHandoffCertifiedReleaseMonitoringReadinessStatusSchema = z.enum(["ready", "blocked", "incomplete"]);
export const providerWebhookReviewQaHandoffCertifiedReleaseNoExecutionMonitoringStatusSchema = z.enum(["active", "violated", "incomplete"]);
export const providerWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutStatusSchema = z.enum(["sealed", "blocked", "incomplete"]);
export const providerWebhookReviewQaHandoffCertifiedReleaseCloseoutSealStatusSchema = z.enum(["sealed", "blocked", "incomplete"]);
export const providerWebhookReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollupStatusSchema = z.enum(["issued", "blocked", "incomplete"]);
export const providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveCustodyStatusSchema = z.enum(["sealed", "blocked", "incomplete"]);
export const providerWebhookReviewQaHandoffCertifiedReleaseFinalEvidenceIndexStatusSchema = z.enum(["issued", "blocked", "incomplete"]);
export const providerWebhookReviewQaHandoffCertifiedReleaseRegressionGuardrailReceiptStatusSchema = z.enum(["issued", "blocked", "incomplete"]);
export const providerWebhookReviewQaHandoffCertifiedReleaseRegressionGuardrailStatusSchema = z.enum(["passed", "failed", "incomplete"]);
export const providerWebhookReviewQaHandoffCertifiedReleaseFinalOperationalClosureReceiptStatusSchema = z.enum(["issued", "blocked", "incomplete"]);
export const providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealStatusSchema = z.enum(["sealed", "blocked", "incomplete"]);
export const providerWebhookReviewQaHandoffCertifiedReleaseReleaseClosureStatusSchema = z.enum(["closed", "blocked", "incomplete"]);

export const providerWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffEvidenceRowSchema = z.object({
  key: z.enum([
    "no_execution_lock_receipt_issued",
    "launch_approval_lock_retained",
    "tenant_scope_confirmed",
    "digest_continuity_confirmed",
    "provider_outbound_absent",
    "external_notification_absent",
    "ai_call_absent",
    "execution_attempts_zero",
    "operations_handoff_packet_ready",
    "no_execution_evidence_confirmed",
    "safe_digest_filename_recorded",
    "human_operations_handoff_ready",
    "operations_handoff_packet_issued",
    "operations_handoff_readiness_confirmed",
    "operations_handoff_acceptance_receipt_issued",
    "operations_custody_accepted",
    "operations_handoff_acceptance_receipt_confirmed",
    "operations_custody_monitoring_ready",
    "operations_custody_monitoring_ledger_issued",
    "no_execution_monitoring_active",
    "monitoring_readiness_confirmed",
    "operations_custody_monitoring_ledger_reviewed",
    "operations_custody_monitoring_closeout_sealed",
    "closeout_seal_receipt_issued",
    "sprint_103_launch_approval_receipt_retained",
    "sprint_104_no_execution_lock_receipt_retained",
    "sprint_105_operations_handoff_packet_retained",
    "sprint_106_operations_handoff_acceptance_retained",
    "sprint_107_operations_custody_monitoring_retained",
    "sprint_108_closeout_seal_receipt_retained",
    "final_no_execution_evidence_rollup_issued",
    "final_archive_custody_sealed"
  ]),
  label: z.string().min(1),
  redactedLabel: z.string().min(1),
  status: providerWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffEvidenceRowStatusSchema,
  safeDigest: z.string().min(1),
  safeFilename: z.string().min(1).optional(),
  checkedCount: z.number().int().nonnegative(),
  complete: z.boolean()
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffEvidenceRow = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffEvidenceRowSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacketSchema = providerWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceiptSchema.extend({
  packetKind: z.literal("qa-handoff-locked-archive-certified-release-operations-handoff-readiness-no-execution-evidence-packet"),
  operationsHandoffReadinessStatus: providerWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessStatusSchema,
  operationsHandoffEvidencePacketStatus: providerWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffEvidencePacketStatusSchema,
  noExecutionEvidenceStatus: providerWebhookReviewQaHandoffCertifiedReleaseNoExecutionEvidenceStatusSchema,
  launchApprovalLockStatus: providerWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalLockStatusSchema,
  digestContinuityStatus: providerWebhookReviewQaHandoffCertifiedReleaseDigestContinuityStatusSchema,
  operationsHandoffEvidencePacketDigest: z.string().min(1),
  operationsHandoffGeneratedAt: z.string().min(1),
  operationsHandoffPrerequisiteRows: z.array(providerWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffEvidenceRowSchema).min(1),
  operationsHandoffBlockerRows: z.array(providerWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffEvidenceRowSchema),
  operationsHandoffEvidenceRows: z.array(providerWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffEvidenceRowSchema).min(1),
  inheritedNoExecutionLockReceiptSummary: z.object({
    noExecutionLockReceiptStatus: providerWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceiptStatusSchema,
    noExecutionLockStatus: providerWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockStatusSchema,
    launchApprovalArchiveStatus: providerWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalArchiveStatusSchema,
    tenantScopeStatus: providerWebhookReviewQaHandoffCertifiedReleaseTenantScopeStatusSchema,
    providerOutboundStatus: providerWebhookReviewQaHandoffCertifiedReleaseProviderOutboundStatusSchema,
    externalNotificationStatus: providerWebhookReviewQaHandoffCertifiedReleaseExternalNotificationStatusSchema,
    aiCallStatus: providerWebhookReviewQaHandoffCertifiedReleaseAiCallStatusSchema,
    noExecutionLockReceiptMutationCount: z.number().int().nonnegative(),
    executionAttemptCount: z.number().int().nonnegative(),
    providerOutboundCallCount: z.number().int().nonnegative(),
    externalNotificationSendCount: z.number().int().nonnegative(),
    aiCallCount: z.number().int().nonnegative(),
    externalCallsZero: z.boolean(),
    safeDigest: z.string().min(1),
    safeFilename: z.string().min(1),
    noExecutionLockReceiptDigest: z.string().min(1)
  }).strict(),
  counts: providerWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceiptSchema.shape.counts.extend({
    operationsHandoffReadinessCheckedCount: z.number().int().nonnegative(),
    operationsHandoffMutationCount: z.number().int().nonnegative(),
    operationsHandoffPrerequisiteCount: z.number().int().nonnegative(),
    operationsHandoffPrerequisitePassedCount: z.number().int().nonnegative(),
    operationsHandoffBlockerCount: z.number().int().nonnegative(),
    operationsHandoffBlockingCount: z.number().int().nonnegative(),
    operationsHandoffEvidenceRowCount: z.number().int().nonnegative(),
    operationsHandoffEvidenceReadyCount: z.number().int().nonnegative()
  }).strict(),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacket = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacketSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceReceiptSchema = providerWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacketSchema.extend({
  receiptKind: z.literal("qa-handoff-locked-archive-certified-release-operations-handoff-acceptance-receipt"),
  operationsHandoffAcceptanceStatus: providerWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceStatusSchema,
  operationsCustodyStatus: providerWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyStatusSchema,
  operationsHandoffAcceptanceReceiptDigest: z.string().min(1),
  operationsHandoffAcceptedAt: z.string().min(1),
  operationsHandoffAcceptanceRows: z.array(providerWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffEvidenceRowSchema).min(1),
  operationsCustodyRows: z.array(providerWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffEvidenceRowSchema).min(1),
  inheritedOperationsHandoffReadinessPacketSummary: z.object({
    operationsHandoffReadinessStatus: providerWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessStatusSchema,
    operationsHandoffEvidencePacketStatus: providerWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffEvidencePacketStatusSchema,
    noExecutionEvidenceStatus: providerWebhookReviewQaHandoffCertifiedReleaseNoExecutionEvidenceStatusSchema,
    launchApprovalLockStatus: providerWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalLockStatusSchema,
    tenantScopeStatus: providerWebhookReviewQaHandoffCertifiedReleaseTenantScopeStatusSchema,
    digestContinuityStatus: providerWebhookReviewQaHandoffCertifiedReleaseDigestContinuityStatusSchema,
    providerOutboundStatus: providerWebhookReviewQaHandoffCertifiedReleaseProviderOutboundStatusSchema,
    externalNotificationStatus: providerWebhookReviewQaHandoffCertifiedReleaseExternalNotificationStatusSchema,
    aiCallStatus: providerWebhookReviewQaHandoffCertifiedReleaseAiCallStatusSchema,
    operationsHandoffMutationCount: z.number().int().nonnegative(),
    executionAttemptCount: z.number().int().nonnegative(),
    providerOutboundCallCount: z.number().int().nonnegative(),
    externalNotificationSendCount: z.number().int().nonnegative(),
    aiCallCount: z.number().int().nonnegative(),
    externalCallsZero: z.boolean(),
    safeDigest: z.string().min(1),
    safeFilename: z.string().min(1),
    operationsHandoffEvidencePacketDigest: z.string().min(1)
  }).strict(),
  counts: providerWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacketSchema.shape.counts.extend({
    operationsHandoffAcceptanceCheckedCount: z.number().int().nonnegative(),
    operationsHandoffAcceptanceMutationCount: z.number().int().nonnegative(),
    operationsHandoffAcceptanceRowCount: z.number().int().nonnegative(),
    operationsHandoffAcceptanceAcceptedCount: z.number().int().nonnegative(),
    operationsCustodyRowCount: z.number().int().nonnegative(),
    operationsCustodyAcceptedCount: z.number().int().nonnegative()
  }).strict(),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceReceipt = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceReceiptSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedgerSchema = providerWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceReceiptSchema.extend({
  ledgerKind: z.literal("qa-handoff-locked-archive-certified-release-operations-custody-monitoring-readiness-ledger"),
  operationsCustodyMonitoringStatus: providerWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringStatusSchema,
  monitoringReadinessStatus: providerWebhookReviewQaHandoffCertifiedReleaseMonitoringReadinessStatusSchema,
  noExecutionMonitoringStatus: providerWebhookReviewQaHandoffCertifiedReleaseNoExecutionMonitoringStatusSchema,
  operationsCustodyMonitoringLedgerDigest: z.string().min(1),
  operationsCustodyMonitoringLedgerGeneratedAt: z.string().min(1),
  operationsCustodyMonitoringRows: z.array(providerWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffEvidenceRowSchema).min(1),
  noExecutionMonitoringRows: z.array(providerWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffEvidenceRowSchema).min(1),
  inheritedOperationsHandoffAcceptanceReceiptSummary: z.object({
    operationsHandoffAcceptanceStatus: providerWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceStatusSchema,
    operationsCustodyStatus: providerWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyStatusSchema,
    noExecutionEvidenceStatus: providerWebhookReviewQaHandoffCertifiedReleaseNoExecutionEvidenceStatusSchema,
    launchApprovalLockStatus: providerWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalLockStatusSchema,
    tenantScopeStatus: providerWebhookReviewQaHandoffCertifiedReleaseTenantScopeStatusSchema,
    digestContinuityStatus: providerWebhookReviewQaHandoffCertifiedReleaseDigestContinuityStatusSchema,
    providerOutboundStatus: providerWebhookReviewQaHandoffCertifiedReleaseProviderOutboundStatusSchema,
    externalNotificationStatus: providerWebhookReviewQaHandoffCertifiedReleaseExternalNotificationStatusSchema,
    aiCallStatus: providerWebhookReviewQaHandoffCertifiedReleaseAiCallStatusSchema,
    operationsHandoffMutationCount: z.number().int().nonnegative(),
    operationsHandoffAcceptanceMutationCount: z.number().int().nonnegative(),
    executionAttemptCount: z.number().int().nonnegative(),
    providerOutboundCallCount: z.number().int().nonnegative(),
    externalNotificationSendCount: z.number().int().nonnegative(),
    aiCallCount: z.number().int().nonnegative(),
    externalCallsZero: z.boolean(),
    safeDigest: z.string().min(1),
    safeFilename: z.string().min(1),
    operationsHandoffAcceptanceReceiptDigest: z.string().min(1),
    operationsHandoffEvidencePacketDigest: z.string().min(1)
  }).strict(),
  counts: providerWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceReceiptSchema.shape.counts.extend({
    operationsCustodyMonitoringCheckedCount: z.number().int().nonnegative(),
    operationsCustodyMonitoringMutationCount: z.number().int().nonnegative(),
    operationsCustodyMonitoringRowCount: z.number().int().nonnegative(),
    operationsCustodyMonitoringReadyCount: z.number().int().nonnegative(),
    noExecutionMonitoringRowCount: z.number().int().nonnegative(),
    noExecutionMonitoringActiveCount: z.number().int().nonnegative()
  }).strict(),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedger = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedgerSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceiptSchema = providerWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedgerSchema.extend({
  receiptKind: z.literal("qa-handoff-locked-archive-certified-release-operations-custody-monitoring-closeout-seal-receipt"),
  operationsCustodyMonitoringCloseoutStatus: providerWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutStatusSchema,
  closeoutSealStatus: providerWebhookReviewQaHandoffCertifiedReleaseCloseoutSealStatusSchema,
  operationsCustodyMonitoringCloseoutSealReceiptDigest: z.string().min(1),
  operationsCustodyMonitoringCloseoutSealedAt: z.string().min(1),
  operationsCustodyMonitoringCloseoutRows: z.array(providerWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffEvidenceRowSchema).min(1),
  inheritedOperationsCustodyMonitoringReadinessLedgerSummary: z.object({
    operationsCustodyMonitoringStatus: providerWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringStatusSchema,
    operationsHandoffAcceptanceStatus: providerWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceStatusSchema,
    operationsCustodyStatus: providerWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyStatusSchema,
    noExecutionEvidenceStatus: providerWebhookReviewQaHandoffCertifiedReleaseNoExecutionEvidenceStatusSchema,
    noExecutionMonitoringStatus: providerWebhookReviewQaHandoffCertifiedReleaseNoExecutionMonitoringStatusSchema,
    launchApprovalLockStatus: providerWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalLockStatusSchema,
    tenantScopeStatus: providerWebhookReviewQaHandoffCertifiedReleaseTenantScopeStatusSchema,
    digestContinuityStatus: providerWebhookReviewQaHandoffCertifiedReleaseDigestContinuityStatusSchema,
    monitoringReadinessStatus: providerWebhookReviewQaHandoffCertifiedReleaseMonitoringReadinessStatusSchema,
    providerOutboundStatus: providerWebhookReviewQaHandoffCertifiedReleaseProviderOutboundStatusSchema,
    externalNotificationStatus: providerWebhookReviewQaHandoffCertifiedReleaseExternalNotificationStatusSchema,
    aiCallStatus: providerWebhookReviewQaHandoffCertifiedReleaseAiCallStatusSchema,
    operationsHandoffMutationCount: z.number().int().nonnegative(),
    operationsHandoffAcceptanceMutationCount: z.number().int().nonnegative(),
    operationsCustodyMonitoringMutationCount: z.number().int().nonnegative(),
    executionAttemptCount: z.number().int().nonnegative(),
    providerOutboundCallCount: z.number().int().nonnegative(),
    externalNotificationSendCount: z.number().int().nonnegative(),
    aiCallCount: z.number().int().nonnegative(),
    externalCallsZero: z.boolean(),
    safeDigest: z.string().min(1),
    safeFilename: z.string().min(1),
    operationsCustodyMonitoringLedgerDigest: z.string().min(1),
    operationsHandoffAcceptanceReceiptDigest: z.string().min(1),
    operationsHandoffEvidencePacketDigest: z.string().min(1)
  }).strict(),
  counts: providerWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedgerSchema.shape.counts.extend({
    operationsCustodyMonitoringCloseoutCheckedCount: z.number().int().nonnegative(),
    operationsCustodyMonitoringCloseoutSealMutationCount: z.number().int().nonnegative(),
    operationsCustodyMonitoringCloseoutRowCount: z.number().int().nonnegative(),
    operationsCustodyMonitoringCloseoutSealedCount: z.number().int().nonnegative()
  }).strict(),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceiptSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollupSchema = providerWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceiptSchema.extend({
  rollupKind: z.literal("qa-handoff-locked-archive-certified-release-final-no-execution-evidence-rollup"),
  finalNoExecutionEvidenceRollupStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollupStatusSchema,
  finalArchiveCustodyStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveCustodyStatusSchema,
  finalNoExecutionEvidenceRollupDigest: z.string().min(1),
  finalNoExecutionEvidenceRollupIssuedAt: z.string().min(1),
  finalNoExecutionEvidenceRows: z.array(providerWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffEvidenceRowSchema).min(1),
  inheritedOperationsCustodyMonitoringCloseoutSealReceiptSummary: z.object({
    operationsCustodyMonitoringCloseoutStatus: providerWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutStatusSchema,
    closeoutSealStatus: providerWebhookReviewQaHandoffCertifiedReleaseCloseoutSealStatusSchema,
    operationsCustodyMonitoringStatus: providerWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringStatusSchema,
    operationsHandoffAcceptanceStatus: providerWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceStatusSchema,
    operationsCustodyStatus: providerWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyStatusSchema,
    noExecutionEvidenceStatus: providerWebhookReviewQaHandoffCertifiedReleaseNoExecutionEvidenceStatusSchema,
    noExecutionMonitoringStatus: providerWebhookReviewQaHandoffCertifiedReleaseNoExecutionMonitoringStatusSchema,
    launchApprovalLockStatus: providerWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalLockStatusSchema,
    tenantScopeStatus: providerWebhookReviewQaHandoffCertifiedReleaseTenantScopeStatusSchema,
    digestContinuityStatus: providerWebhookReviewQaHandoffCertifiedReleaseDigestContinuityStatusSchema,
    monitoringReadinessStatus: providerWebhookReviewQaHandoffCertifiedReleaseMonitoringReadinessStatusSchema,
    providerOutboundStatus: providerWebhookReviewQaHandoffCertifiedReleaseProviderOutboundStatusSchema,
    externalNotificationStatus: providerWebhookReviewQaHandoffCertifiedReleaseExternalNotificationStatusSchema,
    aiCallStatus: providerWebhookReviewQaHandoffCertifiedReleaseAiCallStatusSchema,
    operationsHandoffMutationCount: z.number().int().nonnegative(),
    operationsHandoffAcceptanceMutationCount: z.number().int().nonnegative(),
    operationsCustodyMonitoringMutationCount: z.number().int().nonnegative(),
    operationsCustodyMonitoringCloseoutSealMutationCount: z.number().int().nonnegative(),
    executionAttemptCount: z.number().int().nonnegative(),
    providerOutboundCallCount: z.number().int().nonnegative(),
    externalNotificationSendCount: z.number().int().nonnegative(),
    aiCallCount: z.number().int().nonnegative(),
    externalCallsZero: z.boolean(),
    safeDigest: z.string().min(1),
    safeFilename: z.string().min(1),
    launchApprovalReceiptDigest: z.string().min(1),
    noExecutionLockReceiptDigest: z.string().min(1),
    operationsHandoffEvidencePacketDigest: z.string().min(1),
    operationsHandoffAcceptanceReceiptDigest: z.string().min(1),
    operationsCustodyMonitoringLedgerDigest: z.string().min(1),
    operationsCustodyMonitoringCloseoutSealReceiptDigest: z.string().min(1)
  }).strict(),
  counts: providerWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceiptSchema.shape.counts.extend({
    finalNoExecutionEvidenceRollupCheckedCount: z.number().int().nonnegative(),
    finalNoExecutionEvidenceRollupMutationCount: z.number().int().nonnegative(),
    finalNoExecutionEvidenceRollupRowCount: z.number().int().nonnegative(),
    finalNoExecutionEvidenceRollupIssuedCount: z.number().int().nonnegative(),
    finalArchiveCustodySealedCount: z.number().int().nonnegative()
  }).strict(),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollup = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollupSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseFinalEvidenceIndexRowSchema = z.object({
  sprintNumber: z.number().int().min(103).max(110),
  artifactLabel: z.string().min(1),
  artifactStatus: z.enum(["issued", "sealed", "ready", "accepted", "confirmed", "active", "locked", "tenant_scoped", "passed", "blocked", "failed", "incomplete"]),
  safeDigest: z.string().min(1),
  safeFilename: z.string().min(1).optional(),
  checkedAt: z.string().min(1).optional(),
  generatedAt: z.string().min(1).optional(),
  externalCalls: z.literal(0),
  executionAttemptCount: z.literal(0),
  providerOutboundCallCount: z.literal(0),
  externalNotificationSendCount: z.literal(0),
  aiCallCount: z.literal(0),
  mutationCount: z.literal(0)
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseFinalEvidenceIndexRow = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseFinalEvidenceIndexRowSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceiptSchema = z.object({
  receiptKind: z.literal("qa-handoff-locked-archive-certified-release-final-evidence-index-regression-guardrail-receipt"),
  finalEvidenceIndexStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalEvidenceIndexStatusSchema,
  regressionGuardrailReceiptStatus: providerWebhookReviewQaHandoffCertifiedReleaseRegressionGuardrailReceiptStatusSchema,
  regressionGuardrailStatus: providerWebhookReviewQaHandoffCertifiedReleaseRegressionGuardrailStatusSchema,
  finalNoExecutionEvidenceRollupStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollupStatusSchema,
  finalArchiveCustodyStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveCustodyStatusSchema,
  operationsCustodyMonitoringCloseoutStatus: providerWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutStatusSchema,
  operationsCustodyMonitoringStatus: providerWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringStatusSchema,
  operationsHandoffAcceptanceStatus: providerWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceStatusSchema,
  operationsCustodyStatus: providerWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyStatusSchema,
  noExecutionEvidenceStatus: providerWebhookReviewQaHandoffCertifiedReleaseNoExecutionEvidenceStatusSchema,
  noExecutionMonitoringStatus: providerWebhookReviewQaHandoffCertifiedReleaseNoExecutionMonitoringStatusSchema,
  launchApprovalLockStatus: providerWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalLockStatusSchema,
  tenantScopeStatus: providerWebhookReviewQaHandoffCertifiedReleaseTenantScopeStatusSchema,
  digestContinuityStatus: providerWebhookReviewQaHandoffCertifiedReleaseDigestContinuityStatusSchema,
  closeoutSealStatus: providerWebhookReviewQaHandoffCertifiedReleaseCloseoutSealStatusSchema,
  providerOutboundStatus: providerWebhookReviewQaHandoffCertifiedReleaseProviderOutboundStatusSchema,
  externalNotificationStatus: providerWebhookReviewQaHandoffCertifiedReleaseExternalNotificationStatusSchema,
  aiCallStatus: providerWebhookReviewQaHandoffCertifiedReleaseAiCallStatusSchema,
  safeFilename: z.string().min(1),
  safeDigest: z.string().min(1),
  finalEvidenceIndexDigest: z.string().min(1),
  regressionGuardrailReceiptDigest: z.string().min(1),
  finalNoExecutionEvidenceRollupDigest: z.string().min(1),
  operationsCustodyMonitoringCloseoutSealReceiptDigest: z.string().min(1),
  operationsCustodyMonitoringLedgerDigest: z.string().min(1),
  operationsHandoffAcceptanceReceiptDigest: z.string().min(1),
  operationsHandoffEvidencePacketDigest: z.string().min(1),
  noExecutionLockReceiptDigest: z.string().min(1),
  launchApprovalReceiptDigest: z.string().min(1),
  generatedAt: z.string().min(1),
  checkedAt: z.string().min(1),
  finalEvidenceIndexRows: z.array(providerWebhookReviewQaHandoffCertifiedReleaseFinalEvidenceIndexRowSchema).min(1),
  inheritedFinalNoExecutionEvidenceRollupSummary: z.object({
    finalNoExecutionEvidenceRollupStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollupStatusSchema,
    finalArchiveCustodyStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveCustodyStatusSchema,
    finalNoExecutionEvidenceRollupDigest: z.string().min(1),
    safeDigest: z.string().min(1),
    safeFilename: z.string().min(1),
    finalNoExecutionEvidenceRollupMutationCount: z.number().int().nonnegative(),
    executionAttemptCount: z.number().int().nonnegative(),
    providerOutboundCallCount: z.number().int().nonnegative(),
    externalNotificationSendCount: z.number().int().nonnegative(),
    aiCallCount: z.number().int().nonnegative(),
    externalCallsZero: z.boolean()
  }).strict(),
  counts: z.object({
    finalEvidenceIndexCheckedCount: z.number().int().nonnegative(),
    finalEvidenceIndexMutationCount: z.number().int().nonnegative(),
    finalEvidenceIndexRowCount: z.number().int().nonnegative(),
    finalEvidenceIndexIssuedCount: z.number().int().nonnegative(),
    regressionGuardrailCheckedCount: z.number().int().nonnegative(),
    regressionGuardrailPassedCount: z.number().int().nonnegative(),
    regressionGuardrailMutationCount: z.number().int().nonnegative(),
    finalNoExecutionEvidenceRollupMutationCount: z.number().int().nonnegative(),
    executionAttemptCount: z.number().int().nonnegative(),
    providerOutboundCallCount: z.number().int().nonnegative(),
    externalNotificationSendCount: z.number().int().nonnegative(),
    aiCallCount: z.number().int().nonnegative()
  }).strict(),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceiptSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealOperationalClosureRowSchema = z.object({
  sprintNumber: z.number().int().min(103).max(111),
  artifactLabel: z.string().min(1),
  artifactStatus: z.enum(["issued", "sealed", "ready", "accepted", "confirmed", "active", "locked", "tenant_scoped", "passed", "closed", "blocked", "failed", "incomplete"]),
  safeDigest: z.string().min(1),
  safeFilename: z.string().min(1).optional(),
  checkedAt: z.string().min(1).optional(),
  generatedAt: z.string().min(1).optional(),
  externalCalls: z.literal(0),
  executionAttemptCount: z.literal(0),
  providerOutboundCallCount: z.literal(0),
  externalNotificationSendCount: z.literal(0),
  aiCallCount: z.literal(0),
  mutationCount: z.literal(0)
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealOperationalClosureRow = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealOperationalClosureRowSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealOperationalClosureReceiptSchema = z.object({
  receiptKind: z.literal("qa-handoff-locked-archive-certified-release-final-archive-seal-operational-closure-receipt"),
  finalOperationalClosureReceiptStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalOperationalClosureReceiptStatusSchema,
  finalArchiveSealStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealStatusSchema,
  releaseClosureStatus: providerWebhookReviewQaHandoffCertifiedReleaseReleaseClosureStatusSchema,
  finalEvidenceIndexStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalEvidenceIndexStatusSchema,
  regressionGuardrailReceiptStatus: providerWebhookReviewQaHandoffCertifiedReleaseRegressionGuardrailReceiptStatusSchema,
  regressionGuardrailStatus: providerWebhookReviewQaHandoffCertifiedReleaseRegressionGuardrailStatusSchema,
  finalNoExecutionEvidenceRollupStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollupStatusSchema,
  finalArchiveCustodyStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveCustodyStatusSchema,
  operationsCustodyMonitoringCloseoutStatus: providerWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutStatusSchema,
  closeoutSealStatus: providerWebhookReviewQaHandoffCertifiedReleaseCloseoutSealStatusSchema,
  noExecutionEvidenceStatus: providerWebhookReviewQaHandoffCertifiedReleaseNoExecutionEvidenceStatusSchema,
  noExecutionMonitoringStatus: providerWebhookReviewQaHandoffCertifiedReleaseNoExecutionMonitoringStatusSchema,
  tenantScopeStatus: providerWebhookReviewQaHandoffCertifiedReleaseTenantScopeStatusSchema,
  digestContinuityStatus: providerWebhookReviewQaHandoffCertifiedReleaseDigestContinuityStatusSchema,
  providerOutboundStatus: providerWebhookReviewQaHandoffCertifiedReleaseProviderOutboundStatusSchema,
  externalNotificationStatus: providerWebhookReviewQaHandoffCertifiedReleaseExternalNotificationStatusSchema,
  aiCallStatus: providerWebhookReviewQaHandoffCertifiedReleaseAiCallStatusSchema,
  safeFilename: z.string().min(1),
  safeDigest: z.string().min(1),
  finalOperationalClosureReceiptDigest: z.string().min(1),
  finalArchiveSealDigest: z.string().min(1),
  finalEvidenceIndexDigest: z.string().min(1),
  regressionGuardrailReceiptDigest: z.string().min(1),
  finalNoExecutionEvidenceRollupDigest: z.string().min(1),
  generatedAt: z.string().min(1),
  checkedAt: z.string().min(1),
  finalArchiveSealOperationalClosureRows: z.array(providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealOperationalClosureRowSchema).min(1),
  inheritedFinalEvidenceIndexRegressionGuardrailReceiptSummary: z.object({
    finalEvidenceIndexStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalEvidenceIndexStatusSchema,
    regressionGuardrailReceiptStatus: providerWebhookReviewQaHandoffCertifiedReleaseRegressionGuardrailReceiptStatusSchema,
    regressionGuardrailStatus: providerWebhookReviewQaHandoffCertifiedReleaseRegressionGuardrailStatusSchema,
    finalEvidenceIndexDigest: z.string().min(1),
    regressionGuardrailReceiptDigest: z.string().min(1),
    safeDigest: z.string().min(1),
    safeFilename: z.string().min(1),
    finalEvidenceIndexMutationCount: z.number().int().nonnegative(),
    regressionGuardrailMutationCount: z.number().int().nonnegative(),
    finalNoExecutionEvidenceRollupMutationCount: z.number().int().nonnegative(),
    executionAttemptCount: z.number().int().nonnegative(),
    providerOutboundCallCount: z.number().int().nonnegative(),
    externalNotificationSendCount: z.number().int().nonnegative(),
    aiCallCount: z.number().int().nonnegative(),
    externalCallsZero: z.boolean()
  }).strict(),
  counts: z.object({
    finalOperationalClosureReceiptCheckedCount: z.number().int().nonnegative(),
    finalOperationalClosureReceiptMutationCount: z.number().int().nonnegative(),
    finalArchiveSealCheckedCount: z.number().int().nonnegative(),
    finalArchiveSealMutationCount: z.number().int().nonnegative(),
    releaseClosureCheckedCount: z.number().int().nonnegative(),
    finalArchiveSealOperationalClosureRowCount: z.number().int().nonnegative(),
    finalArchiveSealOperationalClosureSealedCount: z.number().int().nonnegative(),
    finalEvidenceIndexMutationCount: z.number().int().nonnegative(),
    regressionGuardrailMutationCount: z.number().int().nonnegative(),
    finalNoExecutionEvidenceRollupMutationCount: z.number().int().nonnegative(),
    executionAttemptCount: z.number().int().nonnegative(),
    providerOutboundCallCount: z.number().int().nonnegative(),
    externalNotificationSendCount: z.number().int().nonnegative(),
    aiCallCount: z.number().int().nonnegative()
  }).strict(),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealOperationalClosureReceipt = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealOperationalClosureReceiptSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationStatusSchema = z.enum(["verified", "blocked", "incomplete"]);
export type ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationStatus = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationStatusSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationStatusSchema = z.enum(["preserved", "blocked", "incomplete"]);
export type ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationStatus = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationStatusSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationRowSchema = z.object({
  sprintNumber: z.number().int().min(103).max(112),
  artifactLabel: z.string().min(1),
  artifactStatus: z.enum(["issued", "sealed", "ready", "accepted", "confirmed", "active", "locked", "tenant_scoped", "passed", "closed", "verified", "blocked", "failed", "incomplete"]),
  safeDigest: z.string().min(1),
  safeFilename: z.string().min(1).optional(),
  checkedAt: z.string().min(1).optional(),
  generatedAt: z.string().min(1).optional(),
  externalCalls: z.literal(0),
  executionAttemptCount: z.literal(0),
  providerOutboundCallCount: z.literal(0),
  externalNotificationSendCount: z.literal(0),
  aiCallCount: z.literal(0),
  mutationCount: z.literal(0)
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationRow = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationRowSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceiptSchema = z.object({
  receiptKind: z.literal("qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-verification-receipt"),
  postClosurePreservationVerificationStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationStatusSchema,
  finalArchiveSealPostClosurePreservationStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationStatusSchema,
  finalOperationalClosureReceiptStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalOperationalClosureReceiptStatusSchema,
  finalArchiveSealStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealStatusSchema,
  releaseClosureStatus: providerWebhookReviewQaHandoffCertifiedReleaseReleaseClosureStatusSchema,
  finalEvidenceIndexStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalEvidenceIndexStatusSchema,
  regressionGuardrailReceiptStatus: providerWebhookReviewQaHandoffCertifiedReleaseRegressionGuardrailReceiptStatusSchema,
  regressionGuardrailStatus: providerWebhookReviewQaHandoffCertifiedReleaseRegressionGuardrailStatusSchema,
  finalNoExecutionEvidenceRollupStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollupStatusSchema,
  finalArchiveCustodyStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveCustodyStatusSchema,
  operationsCustodyMonitoringCloseoutStatus: providerWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutStatusSchema,
  closeoutSealStatus: providerWebhookReviewQaHandoffCertifiedReleaseCloseoutSealStatusSchema,
  noExecutionEvidenceStatus: providerWebhookReviewQaHandoffCertifiedReleaseNoExecutionEvidenceStatusSchema,
  noExecutionMonitoringStatus: providerWebhookReviewQaHandoffCertifiedReleaseNoExecutionMonitoringStatusSchema,
  tenantScopeStatus: providerWebhookReviewQaHandoffCertifiedReleaseTenantScopeStatusSchema,
  digestContinuityStatus: providerWebhookReviewQaHandoffCertifiedReleaseDigestContinuityStatusSchema,
  providerOutboundStatus: providerWebhookReviewQaHandoffCertifiedReleaseProviderOutboundStatusSchema,
  externalNotificationStatus: providerWebhookReviewQaHandoffCertifiedReleaseExternalNotificationStatusSchema,
  aiCallStatus: providerWebhookReviewQaHandoffCertifiedReleaseAiCallStatusSchema,
  safeFilename: z.string().min(1),
  safeDigest: z.string().min(1),
  postClosurePreservationVerificationDigest: z.string().min(1),
  finalArchiveSealOperationalClosureReceiptDigest: z.string().min(1),
  finalArchiveSealDigest: z.string().min(1),
  finalEvidenceIndexDigest: z.string().min(1),
  regressionGuardrailReceiptDigest: z.string().min(1),
  finalNoExecutionEvidenceRollupDigest: z.string().min(1),
  generatedAt: z.string().min(1),
  checkedAt: z.string().min(1),
  postClosurePreservationVerificationRows: z.array(providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationRowSchema).min(1),
  inheritedFinalArchiveSealOperationalClosureReceiptSummary: z.object({
    finalOperationalClosureReceiptStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalOperationalClosureReceiptStatusSchema,
    finalArchiveSealStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealStatusSchema,
    releaseClosureStatus: providerWebhookReviewQaHandoffCertifiedReleaseReleaseClosureStatusSchema,
    safeDigest: z.string().min(1),
    safeFilename: z.string().min(1),
    finalOperationalClosureReceiptDigest: z.string().min(1),
    finalArchiveSealDigest: z.string().min(1),
    finalArchiveSealOperationalClosureRowCount: z.number().int().nonnegative(),
    finalOperationalClosureReceiptMutationCount: z.literal(0),
    finalArchiveSealMutationCount: z.literal(0),
    finalEvidenceIndexMutationCount: z.literal(0),
    regressionGuardrailMutationCount: z.literal(0),
    finalNoExecutionEvidenceRollupMutationCount: z.literal(0),
    executionAttemptCount: z.literal(0),
    providerOutboundCallCount: z.literal(0),
    externalNotificationSendCount: z.literal(0),
    aiCallCount: z.literal(0),
    externalCallsZero: z.boolean()
  }).strict(),
  counts: z.object({
    postClosurePreservationVerificationCheckedCount: z.number().int().nonnegative(),
    postClosurePreservationVerificationMutationCount: z.literal(0),
    finalArchiveSealPostClosurePreservationCheckedCount: z.number().int().nonnegative(),
    finalArchiveSealPostClosurePreservationMutationCount: z.literal(0),
    finalOperationalClosureReceiptCheckedCount: z.number().int().nonnegative(),
    finalOperationalClosureReceiptMutationCount: z.literal(0),
    finalArchiveSealCheckedCount: z.number().int().nonnegative(),
    finalArchiveSealMutationCount: z.literal(0),
    releaseClosureCheckedCount: z.number().int().nonnegative(),
    postClosurePreservationVerificationRowCount: z.number().int().nonnegative(),
    postClosurePreservationVerificationVerifiedCount: z.number().int().nonnegative(),
    finalEvidenceIndexMutationCount: z.literal(0),
    regressionGuardrailMutationCount: z.literal(0),
    finalNoExecutionEvidenceRollupMutationCount: z.literal(0),
    executionAttemptCount: z.literal(0),
    providerOutboundCallCount: z.literal(0),
    externalNotificationSendCount: z.literal(0),
    aiCallCount: z.literal(0)
  }).strict(),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceipt = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceiptSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerStatusSchema = z.enum(["continuous", "blocked", "incomplete"]);
export type ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerStatus = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerStatusSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerRowSchema = z.object({
  sprintNumber: z.number().int().min(103).max(113),
  artifactLabel: z.string().min(1),
  artifactStatus: z.enum(["issued", "sealed", "ready", "accepted", "confirmed", "active", "locked", "tenant_scoped", "passed", "closed", "verified", "continuous", "blocked", "failed", "incomplete"]),
  safeDigest: z.string().min(1),
  safeFilename: z.string().min(1).optional(),
  checkedAt: z.string().min(1).optional(),
  generatedAt: z.string().min(1).optional(),
  externalCalls: z.literal(0),
  executionAttemptCount: z.literal(0),
  providerOutboundCallCount: z.literal(0),
  externalNotificationSendCount: z.literal(0),
  aiCallCount: z.literal(0),
  mutationCount: z.literal(0)
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerRow = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerRowSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceiptSchema = z.object({
  receiptKind: z.literal("qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-continuity-ledger-receipt"),
  postClosurePreservationContinuityLedgerStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerStatusSchema,
  postClosurePreservationVerificationStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationStatusSchema,
  finalArchiveSealPostClosurePreservationStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationStatusSchema,
  finalOperationalClosureReceiptStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalOperationalClosureReceiptStatusSchema,
  finalArchiveSealStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealStatusSchema,
  releaseClosureStatus: providerWebhookReviewQaHandoffCertifiedReleaseReleaseClosureStatusSchema,
  finalEvidenceIndexStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalEvidenceIndexStatusSchema,
  regressionGuardrailReceiptStatus: providerWebhookReviewQaHandoffCertifiedReleaseRegressionGuardrailReceiptStatusSchema,
  regressionGuardrailStatus: providerWebhookReviewQaHandoffCertifiedReleaseRegressionGuardrailStatusSchema,
  finalNoExecutionEvidenceRollupStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollupStatusSchema,
  finalArchiveCustodyStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveCustodyStatusSchema,
  operationsCustodyMonitoringCloseoutStatus: providerWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutStatusSchema,
  closeoutSealStatus: providerWebhookReviewQaHandoffCertifiedReleaseCloseoutSealStatusSchema,
  noExecutionEvidenceStatus: providerWebhookReviewQaHandoffCertifiedReleaseNoExecutionEvidenceStatusSchema,
  noExecutionMonitoringStatus: providerWebhookReviewQaHandoffCertifiedReleaseNoExecutionMonitoringStatusSchema,
  tenantScopeStatus: providerWebhookReviewQaHandoffCertifiedReleaseTenantScopeStatusSchema,
  digestContinuityStatus: providerWebhookReviewQaHandoffCertifiedReleaseDigestContinuityStatusSchema,
  providerOutboundStatus: providerWebhookReviewQaHandoffCertifiedReleaseProviderOutboundStatusSchema,
  externalNotificationStatus: providerWebhookReviewQaHandoffCertifiedReleaseExternalNotificationStatusSchema,
  aiCallStatus: providerWebhookReviewQaHandoffCertifiedReleaseAiCallStatusSchema,
  safeFilename: z.string().min(1),
  safeDigest: z.string().min(1),
  postClosurePreservationContinuityLedgerDigest: z.string().min(1),
  postClosurePreservationVerificationDigest: z.string().min(1),
  finalArchiveSealOperationalClosureReceiptDigest: z.string().min(1),
  finalArchiveSealDigest: z.string().min(1),
  finalEvidenceIndexDigest: z.string().min(1),
  regressionGuardrailReceiptDigest: z.string().min(1),
  finalNoExecutionEvidenceRollupDigest: z.string().min(1),
  generatedAt: z.string().min(1),
  checkedAt: z.string().min(1),
  preservationContinuityLedgerRows: z.array(providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerRowSchema).min(1),
  inheritedPostClosurePreservationVerificationReceiptSummary: z.object({
    postClosurePreservationVerificationStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationStatusSchema,
    finalArchiveSealPostClosurePreservationStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationStatusSchema,
    finalArchiveSealStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealStatusSchema,
    releaseClosureStatus: providerWebhookReviewQaHandoffCertifiedReleaseReleaseClosureStatusSchema,
    safeDigest: z.string().min(1),
    safeFilename: z.string().min(1),
    postClosurePreservationVerificationDigest: z.string().min(1),
    postClosurePreservationVerificationRowCount: z.number().int().nonnegative(),
    postClosurePreservationVerificationMutationCount: z.literal(0),
    finalArchiveSealPostClosurePreservationMutationCount: z.literal(0),
    finalOperationalClosureReceiptMutationCount: z.literal(0),
    finalArchiveSealMutationCount: z.literal(0),
    finalEvidenceIndexMutationCount: z.literal(0),
    regressionGuardrailMutationCount: z.literal(0),
    finalNoExecutionEvidenceRollupMutationCount: z.literal(0),
    executionAttemptCount: z.literal(0),
    providerOutboundCallCount: z.literal(0),
    externalNotificationSendCount: z.literal(0),
    aiCallCount: z.literal(0),
    externalCallsZero: z.boolean()
  }).strict(),
  counts: z.object({
    preservationContinuityLedgerCheckedCount: z.number().int().nonnegative(),
    preservationContinuityLedgerMutationCount: z.literal(0),
    postClosurePreservationVerificationCheckedCount: z.number().int().nonnegative(),
    postClosurePreservationVerificationMutationCount: z.literal(0),
    finalArchiveSealPostClosurePreservationCheckedCount: z.number().int().nonnegative(),
    finalArchiveSealPostClosurePreservationMutationCount: z.literal(0),
    finalOperationalClosureReceiptCheckedCount: z.number().int().nonnegative(),
    finalOperationalClosureReceiptMutationCount: z.literal(0),
    finalArchiveSealCheckedCount: z.number().int().nonnegative(),
    finalArchiveSealMutationCount: z.literal(0),
    releaseClosureCheckedCount: z.number().int().nonnegative(),
    preservationContinuityLedgerRowCount: z.number().int().nonnegative(),
    preservationContinuityLedgerContinuousCount: z.number().int().nonnegative(),
    finalEvidenceIndexMutationCount: z.literal(0),
    regressionGuardrailMutationCount: z.literal(0),
    finalNoExecutionEvidenceRollupMutationCount: z.literal(0),
    executionAttemptCount: z.literal(0),
    providerOutboundCallCount: z.literal(0),
    externalNotificationSendCount: z.literal(0),
    aiCallCount: z.literal(0)
  }).strict(),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceipt = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceiptSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditStatusSchema = z.enum(["audited", "blocked", "incomplete"]);
export type ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditStatus = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditStatusSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditRowSchema = z.object({
  sprintNumber: z.number().int().min(103).max(114),
  artifactLabel: z.string().min(1),
  artifactStatus: z.enum(["issued", "sealed", "ready", "accepted", "confirmed", "active", "locked", "tenant_scoped", "passed", "closed", "verified", "continuous", "audited", "blocked", "failed", "incomplete"]),
  custodyAuditStatus: z.enum(["under_safe_custody", "blocked", "incomplete"]),
  safeDigest: z.string().min(1),
  safeFilename: z.string().min(1).optional(),
  checkedAt: z.string().min(1).optional(),
  generatedAt: z.string().min(1).optional(),
  externalCalls: z.literal(0),
  executionAttemptCount: z.literal(0),
  providerOutboundCallCount: z.literal(0),
  externalNotificationSendCount: z.literal(0),
  aiCallCount: z.literal(0),
  mutationCount: z.literal(0)
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditRow = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditRowSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceiptSchema = z.object({
  receiptKind: z.literal("qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-audit-receipt"),
  postClosurePreservationCustodyAuditStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditStatusSchema,
  postClosurePreservationContinuityLedgerStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerStatusSchema,
  postClosurePreservationVerificationStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationStatusSchema,
  finalArchiveSealPostClosurePreservationStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationStatusSchema,
  finalOperationalClosureReceiptStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalOperationalClosureReceiptStatusSchema,
  finalArchiveSealStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealStatusSchema,
  releaseClosureStatus: providerWebhookReviewQaHandoffCertifiedReleaseReleaseClosureStatusSchema,
  tenantScopeStatus: providerWebhookReviewQaHandoffCertifiedReleaseTenantScopeStatusSchema,
  digestContinuityStatus: providerWebhookReviewQaHandoffCertifiedReleaseDigestContinuityStatusSchema,
  providerOutboundStatus: providerWebhookReviewQaHandoffCertifiedReleaseProviderOutboundStatusSchema,
  externalNotificationStatus: providerWebhookReviewQaHandoffCertifiedReleaseExternalNotificationStatusSchema,
  aiCallStatus: providerWebhookReviewQaHandoffCertifiedReleaseAiCallStatusSchema,
  safeFilename: z.string().min(1),
  safeDigest: z.string().min(1),
  postClosurePreservationCustodyAuditDigest: z.string().min(1),
  postClosurePreservationContinuityLedgerDigest: z.string().min(1),
  postClosurePreservationVerificationDigest: z.string().min(1),
  generatedAt: z.string().min(1),
  checkedAt: z.string().min(1),
  custodyAuditRows: z.array(providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditRowSchema).min(1),
  inheritedPostClosurePreservationContinuityLedgerReceiptSummary: z.object({
    postClosurePreservationContinuityLedgerStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerStatusSchema,
    postClosurePreservationVerificationStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationStatusSchema,
    safeDigest: z.string().min(1),
    safeFilename: z.string().min(1),
    postClosurePreservationContinuityLedgerDigest: z.string().min(1),
    postClosurePreservationVerificationDigest: z.string().min(1),
    preservationContinuityLedgerRowCount: z.number().int().nonnegative(),
    preservationContinuityLedgerMutationCount: z.literal(0),
    postClosurePreservationVerificationMutationCount: z.literal(0),
    executionAttemptCount: z.literal(0),
    providerOutboundCallCount: z.literal(0),
    externalNotificationSendCount: z.literal(0),
    aiCallCount: z.literal(0),
    externalCallsZero: z.boolean()
  }).strict(),
  counts: z.object({
    postClosurePreservationCustodyAuditCheckedCount: z.number().int().nonnegative(),
    postClosurePreservationCustodyAuditMutationCount: z.literal(0),
    preservationContinuityLedgerCheckedCount: z.number().int().nonnegative(),
    preservationContinuityLedgerMutationCount: z.literal(0),
    postClosurePreservationVerificationCheckedCount: z.number().int().nonnegative(),
    postClosurePreservationVerificationMutationCount: z.literal(0),
    finalArchiveSealPostClosurePreservationCheckedCount: z.number().int().nonnegative(),
    finalArchiveSealPostClosurePreservationMutationCount: z.literal(0),
    finalOperationalClosureReceiptCheckedCount: z.number().int().nonnegative(),
    finalOperationalClosureReceiptMutationCount: z.literal(0),
    finalArchiveSealCheckedCount: z.number().int().nonnegative(),
    finalArchiveSealMutationCount: z.literal(0),
    releaseClosureCheckedCount: z.number().int().nonnegative(),
    postClosurePreservationCustodyAuditRowCount: z.number().int().nonnegative(),
    postClosurePreservationCustodyAuditSafeCount: z.number().int().nonnegative(),
    finalEvidenceIndexMutationCount: z.literal(0),
    regressionGuardrailMutationCount: z.literal(0),
    finalNoExecutionEvidenceRollupMutationCount: z.literal(0),
    executionAttemptCount: z.literal(0),
    providerOutboundCallCount: z.literal(0),
    externalNotificationSendCount: z.literal(0),
    aiCallCount: z.literal(0)
  }).strict(),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceipt = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceiptSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealStatusSchema = z.enum(["sealed", "blocked", "incomplete"]);
export type ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealStatus = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealStatusSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealRowSchema = z.object({
  sprintNumber: z.number().int().min(103).max(115),
  artifactLabel: z.string().min(1),
  artifactStatus: z.enum(["issued", "sealed", "ready", "accepted", "confirmed", "active", "locked", "tenant_scoped", "passed", "closed", "verified", "continuous", "audited", "blocked", "failed", "incomplete"]),
  custodyAuditStatus: z.enum(["under_safe_custody", "blocked", "incomplete"]),
  custodyChainSealStatus: z.enum(["sealed_under_safe_custody", "blocked", "incomplete"]),
  safeDigest: z.string().min(1),
  safeFilename: z.string().min(1).optional(),
  checkedAt: z.string().min(1).optional(),
  generatedAt: z.string().min(1).optional(),
  externalCalls: z.literal(0),
  executionAttemptCount: z.literal(0),
  providerOutboundCallCount: z.literal(0),
  externalNotificationSendCount: z.literal(0),
  aiCallCount: z.literal(0),
  mutationCount: z.literal(0)
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealRow = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealRowSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealReceiptSchema = z.object({
  receiptKind: z.literal("qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-chain-seal-receipt"),
  postClosurePreservationCustodyChainSealStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealStatusSchema,
  postClosurePreservationCustodyAuditStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditStatusSchema,
  postClosurePreservationContinuityLedgerStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerStatusSchema,
  postClosurePreservationVerificationStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationStatusSchema,
  finalArchiveSealPostClosurePreservationStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationStatusSchema,
  finalOperationalClosureReceiptStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalOperationalClosureReceiptStatusSchema,
  finalArchiveSealStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealStatusSchema,
  releaseClosureStatus: providerWebhookReviewQaHandoffCertifiedReleaseReleaseClosureStatusSchema,
  tenantScopeStatus: providerWebhookReviewQaHandoffCertifiedReleaseTenantScopeStatusSchema,
  digestContinuityStatus: providerWebhookReviewQaHandoffCertifiedReleaseDigestContinuityStatusSchema,
  providerOutboundStatus: providerWebhookReviewQaHandoffCertifiedReleaseProviderOutboundStatusSchema,
  externalNotificationStatus: providerWebhookReviewQaHandoffCertifiedReleaseExternalNotificationStatusSchema,
  aiCallStatus: providerWebhookReviewQaHandoffCertifiedReleaseAiCallStatusSchema,
  safeFilename: z.string().min(1),
  safeDigest: z.string().min(1),
  postClosurePreservationCustodyChainSealDigest: z.string().min(1),
  postClosurePreservationCustodyAuditDigest: z.string().min(1),
  postClosurePreservationContinuityLedgerDigest: z.string().min(1),
  postClosurePreservationVerificationDigest: z.string().min(1),
  generatedAt: z.string().min(1),
  checkedAt: z.string().min(1),
  custodyChainSealRows: z.array(providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealRowSchema).min(1),
  inheritedPostClosurePreservationCustodyAuditReceiptSummary: z.object({
    postClosurePreservationCustodyAuditStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditStatusSchema,
    postClosurePreservationContinuityLedgerStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerStatusSchema,
    postClosurePreservationVerificationStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationStatusSchema,
    safeDigest: z.string().min(1),
    safeFilename: z.string().min(1),
    postClosurePreservationCustodyAuditDigest: z.string().min(1),
    postClosurePreservationContinuityLedgerDigest: z.string().min(1),
    custodyAuditRowCount: z.number().int().nonnegative(),
    postClosurePreservationCustodyAuditMutationCount: z.literal(0),
    preservationContinuityLedgerMutationCount: z.literal(0),
    postClosurePreservationVerificationMutationCount: z.literal(0),
    executionAttemptCount: z.literal(0),
    providerOutboundCallCount: z.literal(0),
    externalNotificationSendCount: z.literal(0),
    aiCallCount: z.literal(0),
    externalCallsZero: z.boolean()
  }).strict(),
  counts: z.object({
    postClosurePreservationCustodyChainSealCheckedCount: z.number().int().nonnegative(),
    postClosurePreservationCustodyChainSealMutationCount: z.literal(0),
    postClosurePreservationCustodyAuditCheckedCount: z.number().int().nonnegative(),
    postClosurePreservationCustodyAuditMutationCount: z.literal(0),
    preservationContinuityLedgerCheckedCount: z.number().int().nonnegative(),
    preservationContinuityLedgerMutationCount: z.literal(0),
    postClosurePreservationVerificationCheckedCount: z.number().int().nonnegative(),
    postClosurePreservationVerificationMutationCount: z.literal(0),
    finalArchiveSealPostClosurePreservationCheckedCount: z.number().int().nonnegative(),
    finalArchiveSealPostClosurePreservationMutationCount: z.literal(0),
    finalOperationalClosureReceiptCheckedCount: z.number().int().nonnegative(),
    finalOperationalClosureReceiptMutationCount: z.literal(0),
    finalArchiveSealCheckedCount: z.number().int().nonnegative(),
    finalArchiveSealMutationCount: z.literal(0),
    releaseClosureCheckedCount: z.number().int().nonnegative(),
    postClosurePreservationCustodyChainSealRowCount: z.number().int().nonnegative(),
    postClosurePreservationCustodyChainSealSafeCount: z.number().int().nonnegative(),
    finalEvidenceIndexMutationCount: z.literal(0),
    regressionGuardrailMutationCount: z.literal(0),
    finalNoExecutionEvidenceRollupMutationCount: z.literal(0),
    executionAttemptCount: z.literal(0),
    providerOutboundCallCount: z.literal(0),
    externalNotificationSendCount: z.literal(0),
    aiCallCount: z.literal(0)
  }).strict(),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealReceipt = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealReceiptSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerStatusSchema = z.enum(["integrity_confirmed", "blocked", "incomplete"]);
export type ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerStatus = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerStatusSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerRowSchema = z.object({
  sprintNumber: z.number().int().min(103).max(116),
  artifactLabel: z.string().min(1),
  artifactStatus: z.enum(["issued", "sealed", "ready", "accepted", "confirmed", "active", "locked", "tenant_scoped", "passed", "closed", "verified", "continuous", "audited", "integrity_confirmed", "blocked", "failed", "incomplete"]),
  custodyAuditStatus: z.enum(["under_safe_custody", "blocked", "incomplete"]),
  custodyChainSealStatus: z.enum(["sealed_under_safe_custody", "blocked", "incomplete"]),
  custodyChainIntegrityLedgerStatus: z.enum(["integrity_confirmed_under_safe_custody", "blocked", "incomplete"]),
  safeDigest: z.string().min(1),
  safeFilename: z.string().min(1).optional(),
  checkedAt: z.string().min(1).optional(),
  generatedAt: z.string().min(1).optional(),
  externalCalls: z.literal(0),
  executionAttemptCount: z.literal(0),
  providerOutboundCallCount: z.literal(0),
  externalNotificationSendCount: z.literal(0),
  aiCallCount: z.literal(0),
  mutationCount: z.literal(0)
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerRow = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerRowSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerReceiptSchema = z.object({
  receiptKind: z.literal("qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-chain-integrity-ledger-receipt"),
  postClosurePreservationCustodyChainIntegrityLedgerStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerStatusSchema,
  postClosurePreservationCustodyChainSealStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealStatusSchema,
  postClosurePreservationCustodyAuditStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditStatusSchema,
  postClosurePreservationContinuityLedgerStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerStatusSchema,
  postClosurePreservationVerificationStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationStatusSchema,
  finalArchiveSealPostClosurePreservationStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationStatusSchema,
  finalOperationalClosureReceiptStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalOperationalClosureReceiptStatusSchema,
  finalArchiveSealStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealStatusSchema,
  releaseClosureStatus: providerWebhookReviewQaHandoffCertifiedReleaseReleaseClosureStatusSchema,
  tenantScopeStatus: providerWebhookReviewQaHandoffCertifiedReleaseTenantScopeStatusSchema,
  digestContinuityStatus: providerWebhookReviewQaHandoffCertifiedReleaseDigestContinuityStatusSchema,
  providerOutboundStatus: providerWebhookReviewQaHandoffCertifiedReleaseProviderOutboundStatusSchema,
  externalNotificationStatus: providerWebhookReviewQaHandoffCertifiedReleaseExternalNotificationStatusSchema,
  aiCallStatus: providerWebhookReviewQaHandoffCertifiedReleaseAiCallStatusSchema,
  safeFilename: z.string().min(1),
  safeDigest: z.string().min(1),
  postClosurePreservationCustodyChainIntegrityLedgerDigest: z.string().min(1),
  postClosurePreservationCustodyChainSealDigest: z.string().min(1),
  postClosurePreservationCustodyAuditDigest: z.string().min(1),
  postClosurePreservationContinuityLedgerDigest: z.string().min(1),
  postClosurePreservationVerificationDigest: z.string().min(1),
  generatedAt: z.string().min(1),
  checkedAt: z.string().min(1),
  custodyChainIntegrityLedgerRows: z.array(providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerRowSchema).min(1),
  inheritedPostClosurePreservationCustodyChainSealReceiptSummary: z.object({
    postClosurePreservationCustodyChainSealStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealStatusSchema,
    postClosurePreservationCustodyAuditStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditStatusSchema,
    postClosurePreservationContinuityLedgerStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerStatusSchema,
    postClosurePreservationVerificationStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationStatusSchema,
    safeDigest: z.string().min(1),
    safeFilename: z.string().min(1),
    postClosurePreservationCustodyChainSealDigest: z.string().min(1),
    postClosurePreservationCustodyAuditDigest: z.string().min(1),
    custodyChainSealRowCount: z.number().int().nonnegative(),
    postClosurePreservationCustodyChainSealMutationCount: z.literal(0),
    postClosurePreservationCustodyAuditMutationCount: z.literal(0),
    preservationContinuityLedgerMutationCount: z.literal(0),
    postClosurePreservationVerificationMutationCount: z.literal(0),
    executionAttemptCount: z.literal(0),
    providerOutboundCallCount: z.literal(0),
    externalNotificationSendCount: z.literal(0),
    aiCallCount: z.literal(0),
    externalCallsZero: z.boolean()
  }).strict(),
  counts: z.object({
    postClosurePreservationCustodyChainIntegrityLedgerCheckedCount: z.number().int().nonnegative(),
    postClosurePreservationCustodyChainIntegrityLedgerMutationCount: z.literal(0),
    postClosurePreservationCustodyChainSealCheckedCount: z.number().int().nonnegative(),
    postClosurePreservationCustodyChainSealMutationCount: z.literal(0),
    postClosurePreservationCustodyAuditCheckedCount: z.number().int().nonnegative(),
    postClosurePreservationCustodyAuditMutationCount: z.literal(0),
    preservationContinuityLedgerCheckedCount: z.number().int().nonnegative(),
    preservationContinuityLedgerMutationCount: z.literal(0),
    postClosurePreservationVerificationCheckedCount: z.number().int().nonnegative(),
    postClosurePreservationVerificationMutationCount: z.literal(0),
    finalArchiveSealPostClosurePreservationCheckedCount: z.number().int().nonnegative(),
    finalArchiveSealPostClosurePreservationMutationCount: z.literal(0),
    finalOperationalClosureReceiptCheckedCount: z.number().int().nonnegative(),
    finalOperationalClosureReceiptMutationCount: z.literal(0),
    finalArchiveSealCheckedCount: z.number().int().nonnegative(),
    finalArchiveSealMutationCount: z.literal(0),
    releaseClosureCheckedCount: z.number().int().nonnegative(),
    postClosurePreservationCustodyChainIntegrityLedgerRowCount: z.number().int().nonnegative(),
    postClosurePreservationCustodyChainIntegrityLedgerSafeCount: z.number().int().nonnegative(),
    finalEvidenceIndexMutationCount: z.literal(0),
    regressionGuardrailMutationCount: z.literal(0),
    finalNoExecutionEvidenceRollupMutationCount: z.literal(0),
    executionAttemptCount: z.literal(0),
    providerOutboundCallCount: z.literal(0),
    externalNotificationSendCount: z.literal(0),
    aiCallCount: z.literal(0)
  }).strict(),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerReceipt = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerReceiptSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityStatusSchema = z.enum(["continuity_confirmed", "blocked", "incomplete"]);
export type ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityStatus = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityStatusSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityRowSchema = z.object({
  sprintNumber: z.number().int().min(103).max(117),
  artifactLabel: z.string().min(1),
  artifactStatus: z.enum(["issued", "sealed", "ready", "accepted", "confirmed", "active", "locked", "tenant_scoped", "passed", "closed", "verified", "continuous", "audited", "integrity_confirmed", "continuity_confirmed", "blocked", "failed", "incomplete"]),
  custodyAuditStatus: z.enum(["under_safe_custody", "blocked", "incomplete"]),
  custodyChainSealStatus: z.enum(["sealed_under_safe_custody", "blocked", "incomplete"]),
  custodyChainIntegrityLedgerStatus: z.enum(["integrity_confirmed_under_safe_custody", "blocked", "incomplete"]),
  custodyChainIntegrityLedgerContinuityStatus: z.enum(["continuity_confirmed_under_safe_custody", "blocked", "incomplete"]),
  safeDigest: z.string().min(1),
  safeFilename: z.string().min(1).optional(),
  checkedAt: z.string().min(1).optional(),
  generatedAt: z.string().min(1).optional(),
  externalCalls: z.literal(0),
  executionAttemptCount: z.literal(0),
  providerOutboundCallCount: z.literal(0),
  externalNotificationSendCount: z.literal(0),
  aiCallCount: z.literal(0),
  mutationCount: z.literal(0)
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityRow = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityRowSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityReceiptSchema = z.object({
  receiptKind: z.literal("qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-chain-integrity-ledger-continuity-receipt"),
  postClosurePreservationCustodyChainIntegrityLedgerContinuityStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityStatusSchema,
  postClosurePreservationCustodyChainIntegrityLedgerStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerStatusSchema,
  postClosurePreservationCustodyChainSealStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealStatusSchema,
  postClosurePreservationCustodyAuditStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditStatusSchema,
  postClosurePreservationContinuityLedgerStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerStatusSchema,
  postClosurePreservationVerificationStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationStatusSchema,
  finalArchiveSealPostClosurePreservationStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationStatusSchema,
  finalOperationalClosureReceiptStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalOperationalClosureReceiptStatusSchema,
  finalArchiveSealStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealStatusSchema,
  releaseClosureStatus: providerWebhookReviewQaHandoffCertifiedReleaseReleaseClosureStatusSchema,
  redactionStatus: providerWebhookReviewExportRedactionAuditStatusSchema,
  tenantScopeStatus: providerWebhookReviewQaHandoffCertifiedReleaseTenantScopeStatusSchema,
  digestContinuityStatus: providerWebhookReviewQaHandoffCertifiedReleaseDigestContinuityStatusSchema,
  providerOutboundStatus: providerWebhookReviewQaHandoffCertifiedReleaseProviderOutboundStatusSchema,
  externalNotificationStatus: providerWebhookReviewQaHandoffCertifiedReleaseExternalNotificationStatusSchema,
  aiCallStatus: providerWebhookReviewQaHandoffCertifiedReleaseAiCallStatusSchema,
  safeFilename: z.string().min(1),
  safeDigest: z.string().min(1),
  postClosurePreservationCustodyChainIntegrityLedgerContinuityDigest: z.string().min(1),
  postClosurePreservationCustodyChainIntegrityLedgerDigest: z.string().min(1),
  postClosurePreservationCustodyChainSealDigest: z.string().min(1),
  generatedAt: z.string().min(1),
  checkedAt: z.string().min(1),
  sprint116ReceiptReference: z.object({
    receiptKind: z.literal("qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-chain-integrity-ledger-receipt"),
    safeDigest: z.string().min(1),
    safeFilename: z.string().min(1),
    postClosurePreservationCustodyChainIntegrityLedgerDigest: z.string().min(1),
    rowRangeStart: z.literal(103),
    rowRangeEnd: z.literal(116),
    rowCount: z.number().int().nonnegative(),
    externalCallsZero: z.literal(true)
  }).strict(),
  sealedArchiveReference: z.object({
    postClosurePreservationCustodyChainSealStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealStatusSchema,
    safeDigest: z.string().min(1),
    safeFilename: z.string().min(1),
    postClosurePreservationCustodyChainSealDigest: z.string().min(1)
  }).strict(),
  noExecutionFlags: z.object({
    externalCallsZero: z.literal(true),
    executionAttemptCount: z.literal(0),
    providerOutboundCallCount: z.literal(0),
    externalNotificationSendCount: z.literal(0),
    aiCallCount: z.literal(0)
  }).strict(),
  safeRowSummaries: z.array(providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityRowSchema).min(1),
  inheritedPostClosurePreservationCustodyChainIntegrityLedgerReceiptSummary: z.object({
    postClosurePreservationCustodyChainIntegrityLedgerStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerStatusSchema,
    postClosurePreservationCustodyChainSealStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealStatusSchema,
    safeDigest: z.string().min(1),
    safeFilename: z.string().min(1),
    postClosurePreservationCustodyChainIntegrityLedgerDigest: z.string().min(1),
    postClosurePreservationCustodyChainSealDigest: z.string().min(1),
    custodyChainIntegrityLedgerRowCount: z.number().int().nonnegative(),
    postClosurePreservationCustodyChainIntegrityLedgerMutationCount: z.literal(0),
    executionAttemptCount: z.literal(0),
    providerOutboundCallCount: z.literal(0),
    externalNotificationSendCount: z.literal(0),
    aiCallCount: z.literal(0),
    externalCallsZero: z.literal(true)
  }).strict(),
  counts: z.object({
    postClosurePreservationCustodyChainIntegrityLedgerContinuityCheckedCount: z.number().int().nonnegative(),
    postClosurePreservationCustodyChainIntegrityLedgerContinuityMutationCount: z.literal(0),
    postClosurePreservationCustodyChainIntegrityLedgerCheckedCount: z.number().int().nonnegative(),
    postClosurePreservationCustodyChainIntegrityLedgerMutationCount: z.literal(0),
    postClosurePreservationCustodyChainSealCheckedCount: z.number().int().nonnegative(),
    postClosurePreservationCustodyChainSealMutationCount: z.literal(0),
    postClosurePreservationCustodyAuditCheckedCount: z.number().int().nonnegative(),
    postClosurePreservationCustodyAuditMutationCount: z.literal(0),
    preservationContinuityLedgerCheckedCount: z.number().int().nonnegative(),
    preservationContinuityLedgerMutationCount: z.literal(0),
    postClosurePreservationVerificationCheckedCount: z.number().int().nonnegative(),
    postClosurePreservationVerificationMutationCount: z.literal(0),
    finalArchiveSealPostClosurePreservationCheckedCount: z.number().int().nonnegative(),
    finalArchiveSealPostClosurePreservationMutationCount: z.literal(0),
    finalOperationalClosureReceiptCheckedCount: z.number().int().nonnegative(),
    finalOperationalClosureReceiptMutationCount: z.literal(0),
    finalArchiveSealCheckedCount: z.number().int().nonnegative(),
    finalArchiveSealMutationCount: z.literal(0),
    releaseClosureCheckedCount: z.number().int().nonnegative(),
    custodyChainIntegrityLedgerContinuityRowCount: z.number().int().nonnegative(),
    custodyChainIntegrityLedgerContinuitySafeCount: z.number().int().nonnegative(),
    finalEvidenceIndexMutationCount: z.literal(0),
    regressionGuardrailMutationCount: z.literal(0),
    finalNoExecutionEvidenceRollupMutationCount: z.literal(0),
    executionAttemptCount: z.literal(0),
    providerOutboundCallCount: z.literal(0),
    externalNotificationSendCount: z.literal(0),
    aiCallCount: z.literal(0)
  }).strict(),
  externalCalls: z.literal(0)
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityReceiptSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationStatusSchema = z.enum(["verified", "blocked", "incomplete"]);
export type ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationStatus = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationStatusSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationRowSchema = z.object({
  sprintNumber: z.number().int().min(103).max(118),
  artifactLabel: z.string().min(1),
  artifactStatus: z.enum(["issued", "sealed", "ready", "accepted", "confirmed", "active", "locked", "tenant_scoped", "passed", "closed", "verified", "continuous", "audited", "integrity_confirmed", "continuity_confirmed", "blocked", "failed", "incomplete"]),
  custodyChainStatus: z.enum(["sealed_under_safe_custody", "blocked", "incomplete"]),
  ledgerIntegrityStatus: z.enum(["integrity_confirmed_under_safe_custody", "blocked", "incomplete"]),
  continuityStatus: z.enum(["continuity_confirmed_under_safe_custody", "blocked", "incomplete"]),
  verificationStatus: z.enum(["verified_under_safe_custody", "blocked", "incomplete"]),
  safeDigest: z.string().min(1),
  safeFilename: z.string().min(1).optional(),
  generatedAt: z.string().min(1).optional(),
  verifiedAt: z.string().min(1).optional(),
  externalCalls: z.literal(0),
  executionAttemptCount: z.literal(0),
  providerOutboundCallCount: z.literal(0),
  externalNotificationSendCount: z.literal(0),
  aiCallCount: z.literal(0),
  mutationCount: z.literal(0)
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationRow = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationRowSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceiptSchema = z.object({
  receiptKind: z.literal("qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-chain-integrity-ledger-continuity-verification-receipt"),
  receiptStatus: z.enum(["issued", "blocked", "incomplete"]),
  verificationStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationStatusSchema,
  continuityStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityStatusSchema,
  custodyChainStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealStatusSchema,
  ledgerIntegrityStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerStatusSchema,
  noExecutionStatus: z.enum(["confirmed", "blocked", "incomplete"]),
  redactionStatus: providerWebhookReviewExportRedactionAuditStatusSchema,
  tenantScopeStatus: providerWebhookReviewQaHandoffCertifiedReleaseTenantScopeStatusSchema,
  digestContinuityStatus: providerWebhookReviewQaHandoffCertifiedReleaseDigestContinuityStatusSchema,
  providerOutboundStatus: providerWebhookReviewQaHandoffCertifiedReleaseProviderOutboundStatusSchema,
  externalNotificationStatus: providerWebhookReviewQaHandoffCertifiedReleaseExternalNotificationStatusSchema,
  aiCallStatus: providerWebhookReviewQaHandoffCertifiedReleaseAiCallStatusSchema,
  externalCalls: z.literal(0),
  sourceSprint: z.literal(117),
  derivedFrom: z.object({
    sourceSprint: z.literal(117),
    receiptKind: z.literal("qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-chain-integrity-ledger-continuity-receipt"),
    safeDigest: z.string().min(1),
    safeFilename: z.string().min(1),
    postClosurePreservationCustodyChainIntegrityLedgerContinuityDigest: z.string().min(1),
    rowRangeStart: z.literal(103),
    rowRangeEnd: z.literal(117),
    rowCount: z.number().int().nonnegative(),
    externalCallsZero: z.literal(true)
  }).strict(),
  safeFilename: z.string().min(1),
  safeDigest: z.string().min(1),
  continuityVerificationDigest: z.string().min(1),
  sprint117ReceiptDigest: z.string().min(1),
  generatedAt: z.string().min(1),
  verifiedAt: z.string().min(1),
  safeSummary: z.object({
    receiptStatus: z.enum(["issued", "blocked", "incomplete"]),
    verificationStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationStatusSchema,
    continuityStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityStatusSchema,
    custodyChainStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealStatusSchema,
    ledgerIntegrityStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerStatusSchema,
    noExecutionStatus: z.enum(["confirmed", "blocked", "incomplete"]),
    externalCallsZero: z.literal(true),
    rawProviderMaterialAbsent: z.literal(true)
  }).strict(),
  noExecutionFlags: z.object({
    externalCallsZero: z.literal(true),
    executionAttemptCount: z.literal(0),
    providerOutboundCallCount: z.literal(0),
    externalNotificationSendCount: z.literal(0),
    aiCallCount: z.literal(0)
  }).strict(),
  verificationRows: z.array(providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationRowSchema).min(1),
  inheritedSprint117ContinuityReceiptSummary: z.object({
    continuityStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityStatusSchema,
    custodyChainStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealStatusSchema,
    ledgerIntegrityStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerStatusSchema,
    safeDigest: z.string().min(1),
    safeFilename: z.string().min(1),
    continuityDigest: z.string().min(1),
    rowCount: z.number().int().nonnegative(),
    mutationCount: z.literal(0),
    executionAttemptCount: z.literal(0),
    providerOutboundCallCount: z.literal(0),
    externalNotificationSendCount: z.literal(0),
    aiCallCount: z.literal(0),
    externalCallsZero: z.literal(true)
  }).strict(),
  counts: z.object({
    continuityVerificationCheckedCount: z.number().int().nonnegative(),
    continuityVerificationMutationCount: z.literal(0),
    sprint117ContinuityReceiptCheckedCount: z.number().int().nonnegative(),
    sprint117ContinuityReceiptMutationCount: z.literal(0),
    custodyChainIntegrityLedgerContinuityRowCount: z.number().int().nonnegative(),
    custodyChainIntegrityLedgerContinuitySafeCount: z.number().int().nonnegative(),
    verificationRowCount: z.number().int().nonnegative(),
    verificationSafeCount: z.number().int().nonnegative(),
    executionAttemptCount: z.literal(0),
    providerOutboundCallCount: z.literal(0),
    externalNotificationSendCount: z.literal(0),
    aiCallCount: z.literal(0)
  }).strict()
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceiptSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditStatusSchema = z.enum(["audited", "blocked", "incomplete"]);
export type ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditStatus = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditStatusSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditRowSchema = z.object({
  sprintNumber: z.number().int().min(103).max(119),
  artifactLabel: z.string().min(1),
  artifactStatus: z.enum(["issued", "sealed", "ready", "accepted", "confirmed", "active", "locked", "tenant_scoped", "passed", "closed", "verified", "continuous", "audited", "integrity_confirmed", "continuity_confirmed", "blocked", "failed", "incomplete"]),
  custodyChainStatus: z.enum(["sealed_under_safe_custody", "blocked", "incomplete"]),
  ledgerIntegrityStatus: z.enum(["integrity_confirmed_under_safe_custody", "blocked", "incomplete"]),
  continuityStatus: z.enum(["continuity_confirmed_under_safe_custody", "blocked", "incomplete"]),
  verificationStatus: z.enum(["verified_under_safe_custody", "blocked", "incomplete"]),
  auditStatus: z.enum(["audited_under_safe_custody", "blocked", "incomplete"]),
  safeDigest: z.string().min(1),
  safeFilename: z.string().min(1).optional(),
  generatedAt: z.string().min(1).optional(),
  verifiedAt: z.string().min(1).optional(),
  auditedAt: z.string().min(1).optional(),
  externalCalls: z.literal(0),
  executionAttemptCount: z.literal(0),
  providerOutboundCallCount: z.literal(0),
  externalNotificationSendCount: z.literal(0),
  aiCallCount: z.literal(0),
  mutationCount: z.literal(0)
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditRow = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditRowSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceiptSchema = z.object({
  receiptKind: z.literal("qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-chain-integrity-ledger-continuity-verification-audit-receipt"),
  receiptStatus: z.enum(["issued", "blocked", "incomplete"]),
  auditStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditStatusSchema,
  verificationStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationStatusSchema,
  continuityStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityStatusSchema,
  custodyChainStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealStatusSchema,
  ledgerIntegrityStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerStatusSchema,
  noExecutionStatus: z.enum(["confirmed", "blocked", "incomplete"]),
  redactionStatus: providerWebhookReviewExportRedactionAuditStatusSchema,
  tenantScopeStatus: providerWebhookReviewQaHandoffCertifiedReleaseTenantScopeStatusSchema,
  digestContinuityStatus: providerWebhookReviewQaHandoffCertifiedReleaseDigestContinuityStatusSchema,
  providerOutboundStatus: providerWebhookReviewQaHandoffCertifiedReleaseProviderOutboundStatusSchema,
  externalNotificationStatus: providerWebhookReviewQaHandoffCertifiedReleaseExternalNotificationStatusSchema,
  aiCallStatus: providerWebhookReviewQaHandoffCertifiedReleaseAiCallStatusSchema,
  externalCalls: z.literal(0),
  sourceSprint: z.literal(118),
  derivedFrom: z.object({
    sourceSprint: z.literal(118),
    receiptKind: z.literal("qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-chain-integrity-ledger-continuity-verification-receipt"),
    safeDigest: z.string().min(1),
    safeFilename: z.string().min(1),
    continuityVerificationDigest: z.string().min(1),
    sprint117ReceiptDigest: z.string().min(1),
    rowRangeStart: z.literal(103),
    rowRangeEnd: z.literal(118),
    rowCount: z.number().int().nonnegative(),
    externalCallsZero: z.literal(true)
  }).strict(),
  safeFilename: z.string().min(1),
  safeDigest: z.string().min(1),
  continuityVerificationAuditDigest: z.string().min(1),
  sprint118ReceiptDigest: z.string().min(1),
  sprint117ReceiptDigest: z.string().min(1),
  generatedAt: z.string().min(1),
  auditedAt: z.string().min(1),
  safeSummary: z.object({
    receiptStatus: z.enum(["issued", "blocked", "incomplete"]),
    auditStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditStatusSchema,
    verificationStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationStatusSchema,
    continuityStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityStatusSchema,
    custodyChainStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealStatusSchema,
    ledgerIntegrityStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerStatusSchema,
    noExecutionStatus: z.enum(["confirmed", "blocked", "incomplete"]),
    externalCallsZero: z.literal(true),
    rawProviderMaterialAbsent: z.literal(true)
  }).strict(),
  noExecutionFlags: z.object({
    externalCallsZero: z.literal(true),
    executionAttemptCount: z.literal(0),
    providerOutboundCallCount: z.literal(0),
    externalNotificationSendCount: z.literal(0),
    aiCallCount: z.literal(0)
  }).strict(),
  auditRows: z.array(providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditRowSchema),
  inheritedSprint118ContinuityVerificationReceiptSummary: z.object({
    receiptStatus: z.enum(["issued", "blocked", "incomplete"]),
    verificationStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationStatusSchema,
    continuityStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityStatusSchema,
    custodyChainStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealStatusSchema,
    ledgerIntegrityStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerStatusSchema,
    safeDigest: z.string().min(1),
    safeFilename: z.string().min(1),
    continuityVerificationDigest: z.string().min(1),
    sprint117ReceiptDigest: z.string().min(1),
    verificationRowCount: z.number().int().nonnegative(),
    mutationCount: z.literal(0),
    executionAttemptCount: z.literal(0),
    providerOutboundCallCount: z.literal(0),
    externalNotificationSendCount: z.literal(0),
    aiCallCount: z.literal(0),
    externalCallsZero: z.literal(true)
  }).strict(),
  counts: z.object({
    continuityVerificationAuditCheckedCount: z.number().int().nonnegative(),
    continuityVerificationAuditMutationCount: z.literal(0),
    sprint118ContinuityVerificationReceiptCheckedCount: z.number().int().nonnegative(),
    sprint118ContinuityVerificationReceiptMutationCount: z.literal(0),
    sprint117ContinuityReceiptCheckedCount: z.number().int().nonnegative(),
    sprint117ContinuityReceiptMutationCount: z.literal(0),
    continuityVerificationRowCount: z.number().int().nonnegative(),
    continuityVerificationSafeCount: z.number().int().nonnegative(),
    auditRowCount: z.number().int().nonnegative(),
    auditSafeCount: z.number().int().nonnegative(),
    executionAttemptCount: z.literal(0),
    providerOutboundCallCount: z.literal(0),
    externalNotificationSendCount: z.literal(0),
    aiCallCount: z.literal(0)
  }).strict()
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceipt = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceiptSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationStatusSchema = z.enum(["reconciled", "blocked", "incomplete"]);
export type ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationStatus = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationStatusSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationRowSchema = z.object({
  sprintNumber: z.number().int().min(103).max(120),
  artifactLabel: z.string().min(1),
  artifactStatus: z.enum(["issued", "sealed", "ready", "accepted", "confirmed", "active", "locked", "tenant_scoped", "passed", "closed", "verified", "continuous", "audited", "reconciled", "integrity_confirmed", "continuity_confirmed", "blocked", "failed", "incomplete"]),
  custodyChainStatus: z.enum(["sealed_under_safe_custody", "blocked", "incomplete"]),
  ledgerIntegrityStatus: z.enum(["integrity_confirmed_under_safe_custody", "blocked", "incomplete"]),
  continuityStatus: z.enum(["continuity_confirmed_under_safe_custody", "blocked", "incomplete"]),
  verificationStatus: z.enum(["verified_under_safe_custody", "blocked", "incomplete"]),
  auditStatus: z.enum(["audited_under_safe_custody", "blocked", "incomplete"]),
  reconciliationStatus: z.enum(["reconciled_under_safe_custody", "blocked", "incomplete"]),
  safeDigest: z.string().min(1),
  safeFilename: z.string().min(1).optional(),
  generatedAt: z.string().min(1).optional(),
  verifiedAt: z.string().min(1).optional(),
  auditedAt: z.string().min(1).optional(),
  reconciledAt: z.string().min(1).optional(),
  externalCalls: z.literal(0),
  executionAttemptCount: z.literal(0),
  providerOutboundCallCount: z.literal(0),
  externalNotificationSendCount: z.literal(0),
  aiCallCount: z.literal(0),
  mutationCount: z.literal(0)
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationRow = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationRowSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationReceiptSchema = z.object({
  receiptKind: z.literal("qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-chain-integrity-ledger-continuity-verification-audit-reconciliation-receipt"),
  receiptStatus: z.enum(["issued", "blocked", "incomplete"]),
  reconciliationStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationStatusSchema,
  auditReconciliationStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationStatusSchema,
  verificationAuditStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditStatusSchema,
  continuityVerificationStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationStatusSchema,
  continuityStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityStatusSchema,
  custodyChainStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealStatusSchema,
  ledgerIntegrityStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerStatusSchema,
  noExecutionStatus: z.enum(["confirmed", "blocked", "incomplete"]),
  redactionStatus: providerWebhookReviewExportRedactionAuditStatusSchema,
  tenantScopeStatus: providerWebhookReviewQaHandoffCertifiedReleaseTenantScopeStatusSchema,
  digestContinuityStatus: providerWebhookReviewQaHandoffCertifiedReleaseDigestContinuityStatusSchema,
  providerOutboundStatus: providerWebhookReviewQaHandoffCertifiedReleaseProviderOutboundStatusSchema,
  externalNotificationStatus: providerWebhookReviewQaHandoffCertifiedReleaseExternalNotificationStatusSchema,
  aiCallStatus: providerWebhookReviewQaHandoffCertifiedReleaseAiCallStatusSchema,
  externalCalls: z.literal(0),
  sourceSprint: z.literal(119),
  derivedFrom: z.object({
    sourceSprint: z.literal(119),
    receiptKind: z.literal("qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-chain-integrity-ledger-continuity-verification-audit-receipt"),
    safeDigest: z.string().min(1),
    safeFilename: z.string().min(1),
    continuityVerificationAuditDigest: z.string().min(1),
    sprint118ReceiptDigest: z.string().min(1),
    sprint117ReceiptDigest: z.string().min(1),
    rowRangeStart: z.literal(103),
    rowRangeEnd: z.literal(119),
    rowCount: z.number().int().nonnegative(),
    externalCallsZero: z.literal(true)
  }).strict(),
  reconciledAgainst: z.object({
    sprint119ReceiptDigest: z.string().min(1),
    sprint118ReceiptDigest: z.string().min(1),
    sprint117ReceiptDigest: z.string().min(1),
    sprint119DerivedFromSprint118: z.literal(true),
    sprint118DerivedFromSprint117: z.literal(true),
    auditRowCount: z.number().int().nonnegative(),
    externalCallsZero: z.literal(true)
  }).strict(),
  safeFilename: z.string().min(1),
  safeDigest: z.string().min(1),
  auditReconciliationDigest: z.string().min(1),
  sprint119ReceiptDigest: z.string().min(1),
  sprint118ReceiptDigest: z.string().min(1),
  sprint117ReceiptDigest: z.string().min(1),
  generatedAt: z.string().min(1),
  reconciledAt: z.string().min(1),
  safeSummary: z.object({
    receiptStatus: z.enum(["issued", "blocked", "incomplete"]),
    reconciliationStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationStatusSchema,
    auditReconciliationStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationStatusSchema,
    verificationAuditStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditStatusSchema,
    continuityVerificationStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationStatusSchema,
    continuityStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityStatusSchema,
    custodyChainStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealStatusSchema,
    ledgerIntegrityStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerStatusSchema,
    noExecutionStatus: z.enum(["confirmed", "blocked", "incomplete"]),
    externalCallsZero: z.literal(true),
    rawProviderMaterialAbsent: z.literal(true)
  }).strict(),
  noExecutionFlags: z.object({
    externalCallsZero: z.literal(true),
    executionAttemptCount: z.literal(0),
    providerOutboundCallCount: z.literal(0),
    externalNotificationSendCount: z.literal(0),
    aiCallCount: z.literal(0)
  }).strict(),
  reconciliationRows: z.array(providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationRowSchema),
  inheritedSprint119ContinuityVerificationAuditReceiptSummary: z.object({
    receiptStatus: z.enum(["issued", "blocked", "incomplete"]),
    auditStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditStatusSchema,
    verificationStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationStatusSchema,
    continuityStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityStatusSchema,
    custodyChainStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealStatusSchema,
    ledgerIntegrityStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerStatusSchema,
    safeDigest: z.string().min(1),
    safeFilename: z.string().min(1),
    continuityVerificationAuditDigest: z.string().min(1),
    sprint118ReceiptDigest: z.string().min(1),
    sprint117ReceiptDigest: z.string().min(1),
    auditRowCount: z.number().int().nonnegative(),
    mutationCount: z.literal(0),
    executionAttemptCount: z.literal(0),
    providerOutboundCallCount: z.literal(0),
    externalNotificationSendCount: z.literal(0),
    aiCallCount: z.literal(0),
    externalCallsZero: z.literal(true)
  }).strict(),
  counts: z.object({
    auditReconciliationCheckedCount: z.number().int().nonnegative(),
    auditReconciliationMutationCount: z.literal(0),
    sprint119ContinuityVerificationAuditReceiptCheckedCount: z.number().int().nonnegative(),
    sprint119ContinuityVerificationAuditReceiptMutationCount: z.literal(0),
    sprint118ContinuityVerificationReceiptCheckedCount: z.number().int().nonnegative(),
    sprint118ContinuityVerificationReceiptMutationCount: z.literal(0),
    sprint117ContinuityReceiptCheckedCount: z.number().int().nonnegative(),
    sprint117ContinuityReceiptMutationCount: z.literal(0),
    auditRowCount: z.number().int().nonnegative(),
    auditSafeCount: z.number().int().nonnegative(),
    reconciliationRowCount: z.number().int().nonnegative(),
    reconciliationSafeCount: z.number().int().nonnegative(),
    executionAttemptCount: z.literal(0),
    providerOutboundCallCount: z.literal(0),
    externalNotificationSendCount: z.literal(0),
    aiCallCount: z.literal(0)
  }).strict()
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationReceipt = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationReceiptSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceStatusSchema = z.enum(["accepted", "blocked", "incomplete"]);
export type ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceStatus = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceStatusSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceContinuitySealStatusSchema = z.enum(["sealed", "blocked", "incomplete"]);
export type ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceContinuitySealStatus = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceContinuitySealStatusSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceRowSchema = z.object({
  sprintNumber: z.number().int().min(103).max(121),
  artifactLabel: z.string().min(1),
  artifactStatus: z.enum(["issued", "sealed", "ready", "accepted", "confirmed", "active", "locked", "tenant_scoped", "passed", "closed", "verified", "continuous", "audited", "reconciled", "integrity_confirmed", "continuity_confirmed", "blocked", "failed", "incomplete"]),
  custodyChainStatus: z.enum(["sealed_under_safe_custody", "blocked", "incomplete"]),
  ledgerIntegrityStatus: z.enum(["integrity_confirmed_under_safe_custody", "blocked", "incomplete"]),
  continuityStatus: z.enum(["continuity_confirmed_under_safe_custody", "blocked", "incomplete"]),
  verificationStatus: z.enum(["verified_under_safe_custody", "blocked", "incomplete"]),
  auditStatus: z.enum(["audited_under_safe_custody", "blocked", "incomplete"]),
  reconciliationStatus: z.enum(["reconciled_under_safe_custody", "blocked", "incomplete"]),
  acceptanceStatus: z.enum(["accepted_under_safe_custody", "blocked", "incomplete"]),
  safeDigest: z.string().min(1),
  safeFilename: z.string().min(1).optional(),
  generatedAt: z.string().min(1).optional(),
  verifiedAt: z.string().min(1).optional(),
  auditedAt: z.string().min(1).optional(),
  reconciledAt: z.string().min(1).optional(),
  acceptedAt: z.string().min(1).optional(),
  externalCalls: z.literal(0),
  executionAttemptCount: z.literal(0),
  providerOutboundCallCount: z.literal(0),
  externalNotificationSendCount: z.literal(0),
  aiCallCount: z.literal(0),
  mutationCount: z.literal(0)
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceRow = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceRowSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceReceiptSchema = z.object({
  receiptKind: z.literal("qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-chain-integrity-ledger-continuity-verification-audit-reconciliation-acceptance-receipt"),
  receiptStatus: z.enum(["issued", "blocked", "incomplete"]),
  acceptanceStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceStatusSchema,
  reconciliationAcceptanceStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceStatusSchema,
  auditReconciliationStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationStatusSchema,
  verificationAuditStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditStatusSchema,
  continuityVerificationStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationStatusSchema,
  continuityStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityStatusSchema,
  custodyChainStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealStatusSchema,
  ledgerIntegrityStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerStatusSchema,
  noExecutionStatus: z.enum(["confirmed", "blocked", "incomplete"]),
  redactionStatus: providerWebhookReviewExportRedactionAuditStatusSchema,
  tenantScopeStatus: providerWebhookReviewQaHandoffCertifiedReleaseTenantScopeStatusSchema,
  digestContinuityStatus: providerWebhookReviewQaHandoffCertifiedReleaseDigestContinuityStatusSchema,
  providerOutboundStatus: providerWebhookReviewQaHandoffCertifiedReleaseProviderOutboundStatusSchema,
  externalNotificationStatus: providerWebhookReviewQaHandoffCertifiedReleaseExternalNotificationStatusSchema,
  aiCallStatus: providerWebhookReviewQaHandoffCertifiedReleaseAiCallStatusSchema,
  externalCalls: z.literal(0),
  sourceSprint: z.literal(120),
  derivedFrom: z.object({
    sourceSprint: z.literal(120),
    receiptKind: z.literal("qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-chain-integrity-ledger-continuity-verification-audit-reconciliation-receipt"),
    safeDigest: z.string().min(1),
    safeFilename: z.string().min(1),
    auditReconciliationDigest: z.string().min(1),
    sprint119ReceiptDigest: z.string().min(1),
    sprint118ReceiptDigest: z.string().min(1),
    sprint117ReceiptDigest: z.string().min(1),
    rowRangeStart: z.literal(103),
    rowRangeEnd: z.literal(120),
    rowCount: z.number().int().nonnegative(),
    externalCallsZero: z.literal(true)
  }).strict(),
  acceptedFrom: z.object({
    sprint120ReceiptDigest: z.string().min(1),
    sprint119ReceiptDigest: z.string().min(1),
    sprint118ReceiptDigest: z.string().min(1),
    sprint117ReceiptDigest: z.string().min(1),
    sprint120DerivedFromSprint119: z.literal(true),
    sprint119DerivedFromSprint118: z.literal(true),
    sprint118DerivedFromSprint117: z.literal(true),
    reconciliationRowCount: z.number().int().nonnegative(),
    externalCallsZero: z.literal(true)
  }).strict(),
  safeFilename: z.string().min(1),
  safeDigest: z.string().min(1),
  reconciliationAcceptanceDigest: z.string().min(1),
  sprint120ReceiptDigest: z.string().min(1),
  sprint119ReceiptDigest: z.string().min(1),
  sprint118ReceiptDigest: z.string().min(1),
  sprint117ReceiptDigest: z.string().min(1),
  generatedAt: z.string().min(1),
  acceptedAt: z.string().min(1),
  failClosedReason: z.string().min(1).optional(),
  safeSummary: z.object({
    receiptStatus: z.enum(["issued", "blocked", "incomplete"]),
    acceptanceStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceStatusSchema,
    reconciliationAcceptanceStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceStatusSchema,
    auditReconciliationStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationStatusSchema,
    verificationAuditStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditStatusSchema,
    continuityVerificationStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationStatusSchema,
    continuityStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityStatusSchema,
    custodyChainStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealStatusSchema,
    ledgerIntegrityStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerStatusSchema,
    noExecutionStatus: z.enum(["confirmed", "blocked", "incomplete"]),
    externalCallsZero: z.literal(true),
    rawProviderMaterialAbsent: z.literal(true)
  }).strict(),
  noExecutionFlags: z.object({
    externalCallsZero: z.literal(true),
    executionAttemptCount: z.literal(0),
    providerOutboundCallCount: z.literal(0),
    externalNotificationSendCount: z.literal(0),
    aiCallCount: z.literal(0)
  }).strict(),
  acceptanceRows: z.array(providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceRowSchema),
  inheritedSprint120AuditReconciliationReceiptSummary: z.object({
    receiptStatus: z.enum(["issued", "blocked", "incomplete"]),
    reconciliationStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationStatusSchema,
    auditReconciliationStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationStatusSchema,
    verificationAuditStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditStatusSchema,
    continuityVerificationStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationStatusSchema,
    custodyChainStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealStatusSchema,
    ledgerIntegrityStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerStatusSchema,
    safeDigest: z.string().min(1),
    safeFilename: z.string().min(1),
    auditReconciliationDigest: z.string().min(1),
    sprint119ReceiptDigest: z.string().min(1),
    sprint118ReceiptDigest: z.string().min(1),
    sprint117ReceiptDigest: z.string().min(1),
    reconciliationRowCount: z.number().int().nonnegative(),
    mutationCount: z.literal(0),
    executionAttemptCount: z.literal(0),
    providerOutboundCallCount: z.literal(0),
    externalNotificationSendCount: z.literal(0),
    aiCallCount: z.literal(0),
    externalCallsZero: z.literal(true)
  }).strict(),
  counts: z.object({
    reconciliationAcceptanceCheckedCount: z.number().int().nonnegative(),
    reconciliationAcceptanceMutationCount: z.literal(0),
    sprint120AuditReconciliationReceiptCheckedCount: z.number().int().nonnegative(),
    sprint120AuditReconciliationReceiptMutationCount: z.literal(0),
    sprint119ContinuityVerificationAuditReceiptCheckedCount: z.number().int().nonnegative(),
    sprint119ContinuityVerificationAuditReceiptMutationCount: z.literal(0),
    sprint118ContinuityVerificationReceiptCheckedCount: z.number().int().nonnegative(),
    sprint118ContinuityVerificationReceiptMutationCount: z.literal(0),
    sprint117ContinuityReceiptCheckedCount: z.number().int().nonnegative(),
    sprint117ContinuityReceiptMutationCount: z.literal(0),
    reconciliationRowCount: z.number().int().nonnegative(),
    reconciliationSafeCount: z.number().int().nonnegative(),
    acceptanceRowCount: z.number().int().nonnegative(),
    acceptanceSafeCount: z.number().int().nonnegative(),
    executionAttemptCount: z.literal(0),
    providerOutboundCallCount: z.literal(0),
    externalNotificationSendCount: z.literal(0),
    aiCallCount: z.literal(0)
  }).strict()
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceReceipt = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceReceiptSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceContinuitySealRowSchema = providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceRowSchema.extend({
  sprintNumber: z.number().int().min(103).max(122),
  acceptanceContinuitySealStatus: z.enum(["sealed_under_safe_custody", "blocked", "incomplete"]),
  sealedAt: z.string().min(1).optional()
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceContinuitySealRow = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceContinuitySealRowSchema>;

export const providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceContinuitySealReceiptSchema = z.object({
  receiptKind: z.literal("qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-chain-integrity-ledger-continuity-verification-audit-reconciliation-acceptance-continuity-seal-receipt"),
  receiptStatus: z.enum(["issued", "blocked", "incomplete"]),
  acceptanceContinuitySealStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceContinuitySealStatusSchema,
  acceptanceStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceStatusSchema,
  reconciliationAcceptanceStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceStatusSchema,
  auditReconciliationStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationStatusSchema,
  verificationAuditStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditStatusSchema,
  continuityVerificationStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationStatusSchema,
  continuityStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityStatusSchema,
  custodyChainStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealStatusSchema,
  ledgerIntegrityStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerStatusSchema,
  noExecutionStatus: z.enum(["confirmed", "blocked", "incomplete"]),
  redactionStatus: providerWebhookReviewExportRedactionAuditStatusSchema,
  tenantScopeStatus: providerWebhookReviewQaHandoffCertifiedReleaseTenantScopeStatusSchema,
  digestContinuityStatus: providerWebhookReviewQaHandoffCertifiedReleaseDigestContinuityStatusSchema,
  providerOutboundStatus: providerWebhookReviewQaHandoffCertifiedReleaseProviderOutboundStatusSchema,
  externalNotificationStatus: providerWebhookReviewQaHandoffCertifiedReleaseExternalNotificationStatusSchema,
  aiCallStatus: providerWebhookReviewQaHandoffCertifiedReleaseAiCallStatusSchema,
  externalCalls: z.literal(0),
  sourceSprint: z.literal(121),
  derivedFrom: z.object({
    sourceSprint: z.literal(121),
    receiptKind: z.literal("qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-chain-integrity-ledger-continuity-verification-audit-reconciliation-acceptance-receipt"),
    safeDigest: z.string().min(1),
    safeFilename: z.string().min(1),
    reconciliationAcceptanceDigest: z.string().min(1),
    sprint120ReceiptDigest: z.string().min(1),
    sprint119ReceiptDigest: z.string().min(1),
    sprint118ReceiptDigest: z.string().min(1),
    sprint117ReceiptDigest: z.string().min(1),
    rowRangeStart: z.literal(103),
    rowRangeEnd: z.literal(121),
    rowCount: z.number().int().nonnegative(),
    externalCallsZero: z.literal(true)
  }).strict(),
  sealedFrom: z.object({
    sprint121ReceiptDigest: z.string().min(1),
    sprint120ReceiptDigest: z.string().min(1),
    sprint119ReceiptDigest: z.string().min(1),
    sprint118ReceiptDigest: z.string().min(1),
    sprint117ReceiptDigest: z.string().min(1),
    sprint121DerivedFromSprint120: z.literal(true),
    sprint120DerivedFromSprint119: z.literal(true),
    sprint119DerivedFromSprint118: z.literal(true),
    sprint118DerivedFromSprint117: z.literal(true),
    acceptanceRowCount: z.number().int().nonnegative(),
    externalCallsZero: z.literal(true)
  }).strict(),
  safeFilename: z.string().min(1),
  safeDigest: z.string().min(1),
  acceptanceContinuitySealDigest: z.string().min(1),
  sprint121ReceiptDigest: z.string().min(1),
  sprint120ReceiptDigest: z.string().min(1),
  sprint119ReceiptDigest: z.string().min(1),
  sprint118ReceiptDigest: z.string().min(1),
  sprint117ReceiptDigest: z.string().min(1),
  generatedAt: z.string().min(1),
  sealedAt: z.string().min(1),
  failClosedReason: z.string().min(1).optional(),
  safeSummary: z.object({
    receiptStatus: z.enum(["issued", "blocked", "incomplete"]),
    acceptanceContinuitySealStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceContinuitySealStatusSchema,
    acceptanceStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceStatusSchema,
    reconciliationAcceptanceStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceStatusSchema,
    auditReconciliationStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationStatusSchema,
    verificationAuditStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditStatusSchema,
    continuityVerificationStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationStatusSchema,
    continuityStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityStatusSchema,
    custodyChainStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealStatusSchema,
    ledgerIntegrityStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerStatusSchema,
    noExecutionStatus: z.enum(["confirmed", "blocked", "incomplete"]),
    externalCallsZero: z.literal(true),
    rawProviderMaterialAbsent: z.literal(true)
  }).strict(),
  noExecutionFlags: z.object({
    externalCallsZero: z.literal(true),
    executionAttemptCount: z.literal(0),
    providerOutboundCallCount: z.literal(0),
    externalNotificationSendCount: z.literal(0),
    aiCallCount: z.literal(0)
  }).strict(),
  continuitySealRows: z.array(providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceContinuitySealRowSchema),
  inheritedSprint121ReconciliationAcceptanceReceiptSummary: z.object({
    receiptStatus: z.enum(["issued", "blocked", "incomplete"]),
    acceptanceStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceStatusSchema,
    reconciliationAcceptanceStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceStatusSchema,
    auditReconciliationStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationStatusSchema,
    verificationAuditStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditStatusSchema,
    continuityVerificationStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationStatusSchema,
    custodyChainStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealStatusSchema,
    ledgerIntegrityStatus: providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerStatusSchema,
    safeDigest: z.string().min(1),
    safeFilename: z.string().min(1),
    reconciliationAcceptanceDigest: z.string().min(1),
    sprint120ReceiptDigest: z.string().min(1),
    sprint119ReceiptDigest: z.string().min(1),
    sprint118ReceiptDigest: z.string().min(1),
    sprint117ReceiptDigest: z.string().min(1),
    acceptanceRowCount: z.number().int().nonnegative(),
    mutationCount: z.literal(0),
    executionAttemptCount: z.literal(0),
    providerOutboundCallCount: z.literal(0),
    externalNotificationSendCount: z.literal(0),
    aiCallCount: z.literal(0),
    externalCallsZero: z.literal(true)
  }).strict(),
  counts: z.object({
    acceptanceContinuitySealCheckedCount: z.number().int().nonnegative(),
    acceptanceContinuitySealMutationCount: z.literal(0),
    sprint121ReconciliationAcceptanceReceiptCheckedCount: z.number().int().nonnegative(),
    sprint121ReconciliationAcceptanceReceiptMutationCount: z.literal(0),
    sprint120AuditReconciliationReceiptCheckedCount: z.number().int().nonnegative(),
    sprint120AuditReconciliationReceiptMutationCount: z.literal(0),
    sprint119ContinuityVerificationAuditReceiptCheckedCount: z.number().int().nonnegative(),
    sprint119ContinuityVerificationAuditReceiptMutationCount: z.literal(0),
    sprint118ContinuityVerificationReceiptCheckedCount: z.number().int().nonnegative(),
    sprint118ContinuityVerificationReceiptMutationCount: z.literal(0),
    sprint117ContinuityReceiptCheckedCount: z.number().int().nonnegative(),
    sprint117ContinuityReceiptMutationCount: z.literal(0),
    acceptanceRowCount: z.number().int().nonnegative(),
    acceptanceSafeCount: z.number().int().nonnegative(),
    continuitySealRowCount: z.number().int().nonnegative(),
    continuitySealSafeCount: z.number().int().nonnegative(),
    executionAttemptCount: z.literal(0),
    providerOutboundCallCount: z.literal(0),
    externalNotificationSendCount: z.literal(0),
    aiCallCount: z.literal(0)
  }).strict()
}).strict();
export type ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceContinuitySealReceipt = z.infer<typeof providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceContinuitySealReceiptSchema>;

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
  deliveryStatus: coreDeliveryStatusSchema,
  messageType: messageTypeSchema.default("text"),
  attachments: z.array(messageAttachmentSchema).default([])
}).strict();
export type CoreMessage = z.infer<typeof coreMessageSchema>;

export const agentMessageRequestSchema = z.object({
  text: z.string().trim().default(""),
  senderType: z.literal("agent").default("agent"),
  attachments: z.array(attachmentInputSchema).optional()
}).strict().superRefine((value, ctx) => {
  if (value.text.length === 0 && (value.attachments?.length ?? 0) === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Message must include text or at least one attachment",
      path: ["text"]
    });
  }
});
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

// ---------------------------------------------------------------------------
// Rich message features (STEP 3B)
// Platform-specific interactive message payloads authored in the visual flow
// builder. These are additive helpers stored inside a send_message node's
// free-form `config` under the `richMessage` key, so existing flows remain
// valid and no existing schema changes are required (fully backward-compatible).
// Limits below follow each platform's official developer documentation:
//  - LINE: quick reply max 13 items, Flex carousel max 12 bubbles, buttons
//    template max 4 actions.
//  - Telegram: inline keyboard buttons carry callback_data (1-64 bytes) or a url.
//  - Messenger: generic template max 10 elements, max 3 buttons/card, title &
//    subtitle max 80 chars; quick replies max 13 (title max 20 chars).
//  - Instagram: ice breakers max 4 (question max 80 chars); quick replies max 13.
//  - Webchat: quick-reply chips (in-house surface).
// ---------------------------------------------------------------------------
export const richMessageActionTypeSchema = z.enum(["postback", "uri", "message"]);
export type RichMessageActionType = z.infer<typeof richMessageActionTypeSchema>;

export const richButtonSchema = z.object({
  type: richMessageActionTypeSchema.default("postback"),
  label: z.string().min(1).max(40),
  data: z.string().max(1000).optional(),
  url: z.string().max(2000).optional()
}).strict();
export type RichButton = z.infer<typeof richButtonSchema>;

export const richQuickReplyItemSchema = z.object({
  label: z.string().min(1).max(20),
  data: z.string().max(1000).optional(),
  imageUrl: z.string().max(2000).optional()
}).strict();
export type RichQuickReplyItem = z.infer<typeof richQuickReplyItemSchema>;

export const richFlexBubbleSchema = z.object({
  title: z.string().max(200).optional(),
  text: z.string().max(2000).optional(),
  imageUrl: z.string().max(2000).optional(),
  actions: z.array(richButtonSchema).max(4).default([])
}).strict();
export type RichFlexBubble = z.infer<typeof richFlexBubbleSchema>;

export const richGenericElementSchema = z.object({
  title: z.string().min(1).max(80),
  subtitle: z.string().max(80).optional(),
  imageUrl: z.string().max(2000).optional(),
  defaultActionUrl: z.string().max(2000).optional(),
  buttons: z.array(richButtonSchema).max(3).default([])
}).strict();
export type RichGenericElement = z.infer<typeof richGenericElementSchema>;

export const richIceBreakerSchema = z.object({
  question: z.string().min(1).max(80),
  payload: z.string().min(1).max(1000)
}).strict();
export type RichIceBreaker = z.infer<typeof richIceBreakerSchema>;

export const richTelegramCommandSchema = z.object({
  command: z.string().min(1).max(32).regex(/^[a-z0-9_]+$/, "Use lowercase letters, digits, and underscores only"),
  description: z.string().min(1).max(256)
}).strict();
export type RichTelegramCommand = z.infer<typeof richTelegramCommandSchema>;

export const richMessageKindSchema = z.enum([
  "line_quick_reply",
  "line_flex",
  "line_buttons",
  "telegram_inline_keyboard",
  "telegram_reply_keyboard",
  "telegram_commands",
  "messenger_generic",
  "messenger_quick_replies",
  "instagram_ice_breakers",
  "instagram_quick_replies",
  "webchat_quick_replies"
]);
export type RichMessageKind = z.infer<typeof richMessageKindSchema>;

export const richMessageSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("line_quick_reply"),
    text: z.string().min(1).max(2000),
    items: z.array(richQuickReplyItemSchema).min(1).max(13)
  }).strict(),
  z.object({
    kind: z.literal("line_flex"),
    altText: z.string().min(1).max(400),
    layout: z.enum(["bubble", "carousel"]).default("bubble"),
    bubbles: z.array(richFlexBubbleSchema).min(1).max(12)
  }).strict(),
  z.object({
    kind: z.literal("line_buttons"),
    altText: z.string().min(1).max(400),
    text: z.string().min(1).max(160),
    thumbnailUrl: z.string().max(2000).optional(),
    actions: z.array(richButtonSchema).min(1).max(4)
  }).strict(),
  z.object({
    kind: z.literal("telegram_inline_keyboard"),
    text: z.string().min(1).max(4096),
    rows: z.array(z.array(richButtonSchema).min(1).max(8)).min(1).max(100)
  }).strict(),
  z.object({
    kind: z.literal("telegram_reply_keyboard"),
    text: z.string().min(1).max(4096),
    rows: z.array(z.array(z.string().min(1).max(64)).min(1).max(8)).min(1).max(20),
    resizeKeyboard: z.boolean().default(true),
    oneTimeKeyboard: z.boolean().default(false)
  }).strict(),
  z.object({
    kind: z.literal("telegram_commands"),
    commands: z.array(richTelegramCommandSchema).min(1).max(100)
  }).strict(),
  z.object({
    kind: z.literal("messenger_generic"),
    elements: z.array(richGenericElementSchema).min(1).max(10)
  }).strict(),
  z.object({
    kind: z.literal("messenger_quick_replies"),
    text: z.string().min(1).max(640),
    items: z.array(richQuickReplyItemSchema).min(1).max(13)
  }).strict(),
  z.object({
    kind: z.literal("instagram_ice_breakers"),
    iceBreakers: z.array(richIceBreakerSchema).min(1).max(4)
  }).strict(),
  z.object({
    kind: z.literal("instagram_quick_replies"),
    text: z.string().min(1).max(640),
    items: z.array(richQuickReplyItemSchema).min(1).max(13)
  }).strict(),
  z.object({
    kind: z.literal("webchat_quick_replies"),
    text: z.string().min(1).max(2000),
    items: z.array(richQuickReplyItemSchema).min(1).max(13)
  }).strict()
]);
export type RichMessage = z.infer<typeof richMessageSchema>;

export const RICH_MESSAGE_KINDS_BY_PLATFORM: Record<Platform, RichMessageKind[]> = {
  line: ["line_quick_reply", "line_flex", "line_buttons"],
  telegram: ["telegram_inline_keyboard", "telegram_reply_keyboard", "telegram_commands"],
  facebook: ["messenger_generic", "messenger_quick_replies"],
  instagram: ["instagram_ice_breakers", "instagram_quick_replies"],
  webchat: ["webchat_quick_replies"]
};

export interface RichMessageKindMeta {
  kind: RichMessageKind;
  platform: Platform;
  label: string;
  description: string;
}

export const RICH_MESSAGE_KIND_META: Record<RichMessageKind, RichMessageKindMeta> = {
  line_quick_reply: { kind: "line_quick_reply", platform: "line", label: "Quick Reply", description: "Up to 13 tappable suggestions shown under the message." },
  line_flex: { kind: "line_flex", platform: "line", label: "Flex / Carousel", description: "Rich bubble or carousel (max 12 bubbles) with image, text and actions." },
  line_buttons: { kind: "line_buttons", platform: "line", label: "Buttons Template", description: "Text card with up to 4 action buttons." },
  telegram_inline_keyboard: { kind: "telegram_inline_keyboard", platform: "telegram", label: "Inline Keyboard", description: "Buttons attached to the message with callback data or URLs." },
  telegram_reply_keyboard: { kind: "telegram_reply_keyboard", platform: "telegram", label: "Reply Keyboard", description: "Custom keyboard shown in place of the system keyboard." },
  telegram_commands: { kind: "telegram_commands", platform: "telegram", label: "Bot Commands", description: "Slash-command menu registered for the bot." },
  messenger_generic: { kind: "messenger_generic", platform: "facebook", label: "Generic Template", description: "Carousel of up to 10 cards, each with up to 3 buttons." },
  messenger_quick_replies: { kind: "messenger_quick_replies", platform: "facebook", label: "Quick Replies", description: "Up to 13 quick reply chips (title max 20 chars)." },
  instagram_ice_breakers: { kind: "instagram_ice_breakers", platform: "instagram", label: "Ice Breakers", description: "Up to 4 starter questions shown at the top of a new chat." },
  instagram_quick_replies: { kind: "instagram_quick_replies", platform: "instagram", label: "Quick Replies", description: "Up to 13 quick reply chips (title max 20 chars)." },
  webchat_quick_replies: { kind: "webchat_quick_replies", platform: "webchat", label: "Quick-reply Chips", description: "Suggested reply chips shown in the web chat widget." }
};

export const RICH_MESSAGE_CONFIG_KEY = "richMessage";

export function richMessageKindPlatform(kind: RichMessageKind): Platform {
  return RICH_MESSAGE_KIND_META[kind].platform;
}

export function parseRichMessageConfig(config: Record<string, unknown> | null | undefined): RichMessage | null {
  if (!config) return null;
  const raw = config[RICH_MESSAGE_CONFIG_KEY];
  if (raw == null) return null;
  const parsed = richMessageSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

export function summariseRichMessage(message: RichMessage): string {
  const meta = RICH_MESSAGE_KIND_META[message.kind];
  switch (message.kind) {
    case "line_quick_reply":
    case "messenger_quick_replies":
    case "instagram_quick_replies":
    case "webchat_quick_replies":
      return `${meta.label}: ${message.items.length} item(s)`;
    case "line_flex":
      return `${meta.label}: ${message.bubbles.length} bubble(s)`;
    case "line_buttons":
      return `${meta.label}: ${message.actions.length} button(s)`;
    case "telegram_inline_keyboard":
    case "telegram_reply_keyboard":
      return `${meta.label}: ${message.rows.length} row(s)`;
    case "telegram_commands":
      return `${meta.label}: ${message.commands.length} command(s)`;
    case "messenger_generic":
      return `${meta.label}: ${message.elements.length} card(s)`;
    case "instagram_ice_breakers":
      return `${meta.label}: ${message.iceBreakers.length} question(s)`;
    default:
      return meta.label;
  }
}

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
