import {
  agentMessageRequestSchema,
  analyticsAgentsSchema,
  analyticsAiSchema,
  analyticsAuditSchema,
  analyticsChannelsSchema,
  analyticsConversationsSchema,
  analyticsOverviewSchema,
  analyticsSlaSchema,
  analyticsTasksSchema,
  applyBroadcastSegmentRequestSchema,
  apiReadinessSchema,
  aiSuggestedReplySchema,
  aiSuggestionFeedbackRequestSchema,
  aiSuggestionFeedbackSchema,
  apiHealthSchema,
  createProviderWebhookOperatorNoteRequestSchema,
  createProviderWebhookReviewSavedViewRequestSchema,
  providerWebhookReviewWorkloadFiltersSchema,
  providerWebhookReviewWorkloadSchema,
  providerWebhookEventSchema,
  providerWebhookCandidateConversationSchema,
  providerWebhookOperatorNoteSchema,
  providerWebhookReviewAlertsFiltersSchema,
  providerWebhookReviewAlertsSchema,
  providerWebhookReviewMetricsFiltersSchema,
  providerWebhookReviewMetricsSchema,
  providerWebhookReviewSavedViewSchema,
  providerWebhookReviewTriageFiltersSchema,
  providerWebhookReviewTriageSchema,
  providerWebhookUnmatchedInboundDiagnosticsSchema,
  providerWebhookUnmatchedInboundExportQuerySchema,
  providerWebhookUnmatchedInboundExportSchema,
  providerWebhookUnmatchedInboundAssignmentRequestSchema,
  providerWebhookUnmatchedInboundBulkAssignmentRequestSchema,
  providerWebhookUnmatchedInboundBulkAssignmentResponseSchema,
  providerWebhookUnmatchedInboundBulkEscalationRequestSchema,
  providerWebhookUnmatchedInboundBulkEscalationResponseSchema,
  providerWebhookUnmatchedInboundBulkReviewRequestSchema,
  providerWebhookUnmatchedInboundBulkReviewResponseSchema,
  providerWebhookUnmatchedInboundEscalationRequestSchema,
  providerWebhookUnmatchedInboundFiltersSchema,
  providerWebhookUnmatchedInboundHistorySchema,
  providerWebhookUnmatchedInboundLinkRequestSchema,
  providerWebhookUnmatchedInboundItemSchema,
  providerWebhookUnmatchedInboundPageSchema,
  providerWebhookUnmatchedInboundReviewRequestSchema,
  providerWebhookSandboxEventRequestSchema,
  updateProviderWebhookReviewSavedViewRequestSchema,
  coreConversationCardSchema,
  coreConversationTabSchema,
  coreMessageSchema,
  coreRoomSchema,
  contactIdentitySchema,
  contactSchema,
  conversationAuditLogSchema,
  broadcastComplianceFiltersSchema,
  broadcastComplianceLogSchema,
  broadcastComplianceLogPageSchema,
  broadcastApprovalRequestSchema,
  conversationStatusHistorySchema,
  broadcastAudiencePreviewRequestSchema,
  broadcastAudiencePreviewResultSchema,
  broadcastCampaignAnalyticsSchema,
  broadcastCampaignDetailSchema,
  broadcastCampaignSchema,
  broadcastDeliveryExportSchema,
  broadcastSendLogSchema,
  broadcastSendLogFiltersSchema,
  broadcastSendLogPageSchema,
  broadcastSendResultSchema,
  broadcastSendTestRequestSchema,
  broadcastSegmentSchema,
  createKnowledgeBaseRequestSchema,
  createKnowledgeChunkRequestSchema,
  createKnowledgeDocumentRequestSchema,
  createBroadcastCampaignRequestSchema,
  createBroadcastSegmentRequestSchema,
  createFlowRequestSchema,
  createInternalNoteRequestSchema,
  createContactRequestSchema,
  createTaskRequestSchema,
  customer360Schema,
  conversationFilterSchema,
  followUpConversationRequestSchema,
  flowRunSchema,
  flowSchema,
  flowTestRunRequestSchema,
  flowTestRunResultSchema,
  internalNoteSchema,
  knowledgeBaseSchema,
  knowledgeChunkSchema,
  knowledgeDocumentSchema,
  linkContactIdentityRequestSchema,
  roomAiPolicyPatchSchema,
  roomAiPolicySchema,
  scheduleBroadcastCampaignRequestSchema,
  setPrimaryIdentityRequestSchema,
  settingsChannelAccountSchema,
  settingsCannedReplySchema,
  settingsSlaPolicySchema,
  settingsTeamMemberSchema,
  taskDashboardItemSchema,
  unlinkContactIdentityRequestSchema,
  updateBroadcastCampaignRequestSchema,
  updateBroadcastConsentRequestSchema,
  updateBroadcastSegmentRequestSchema,
  updateKnowledgeBaseRequestSchema,
  updateKnowledgeChunkRequestSchema,
  updateKnowledgeDocumentRequestSchema,
  updateCustomer360ConsentRequestSchema,
  updateCustomer360ProfileRequestSchema,
  updateFlowRequestSchema,
  updateFlowStatusRequestSchema,
  updateConversationPriorityRequestSchema,
  updateConversationReadStateRequestSchema,
  updateConversationSlaRequestSchema,
  updateConversationStatusRequestSchema,
  updateContactRequestSchema,
  updateSettingsChannelAccountRequestSchema,
  updateSettingsCannedReplyRequestSchema,
  updateSettingsSlaPolicyRequestSchema,
  updateSettingsTeamMemberRequestSchema,
  updateTaskRequestSchema,
  webchatInboundRequestSchema,
  webchatInboundResponseSchema,
  workflowTaskSchema,
  type AgentMessageRequest,
  type AnalyticsAgents,
  type AnalyticsAi,
  type AnalyticsAudit,
  type AnalyticsChannels,
  type AnalyticsConversations,
  type AnalyticsOverview,
  type AnalyticsSla,
  type AnalyticsTasks,
  type ApiReadiness,
  type AiSuggestedReply,
  type AiSuggestionFeedback,
  type AiSuggestionFeedbackRequest,
  type ApiHealth,
  type ApplyBroadcastSegmentRequest,
  type BroadcastAudiencePreviewRequest,
  type BroadcastApprovalRequest,
  type BroadcastAudiencePreviewResult,
  type BroadcastCampaign,
  type BroadcastCampaignAnalytics,
  type BroadcastCampaignDetail,
  type BroadcastComplianceFilters,
  type BroadcastComplianceLog,
  type BroadcastComplianceLogPage,
  type BroadcastDeliveryExport,
  type BroadcastSendLogFilters,
  type BroadcastSendLogPage,
  type BroadcastSendLog,
  type BroadcastSendResult,
  type BroadcastSendTestRequest,
  type BroadcastSegment,
  type ConversationAuditLog,
  type CreateBroadcastCampaignRequest,
  type CreateBroadcastSegmentRequest,
  type CreateInternalNoteRequest,
  type ConversationFilter,
  type CoreConversationCard,
  type CoreConversationTab,
  type CoreMessage,
  type CoreRoom,
  type Contact,
  type ContactIdentity,
  type CreateContactRequest,
  type CreateFlowRequest,
  type CreateKnowledgeBaseRequest,
  type CreateKnowledgeChunkRequest,
  type CreateKnowledgeDocumentRequest,
  type CreateTaskRequest,
  type Customer360,
  type FollowUpConversationRequest,
  type Flow,
  type FlowRun,
  type FlowTestRunRequest,
  type FlowTestRunResult,
  type InternalNote,
  type KnowledgeBase,
  type KnowledgeChunk,
  type KnowledgeDocument,
  type LinkContactIdentityRequest,
  type Platform,
  type ProviderReadiness,
  type CreateProviderWebhookOperatorNoteRequest,
  type CreateProviderWebhookReviewSavedViewRequest,
  type UpdateProviderWebhookReviewSavedViewRequest,
  type ProviderWebhookCandidateConversation,
  type ProviderWebhookEvent,
  type ProviderWebhookOperatorNote,
  type ProviderWebhookReviewAlerts,
  type ProviderWebhookReviewAlertsFilters,
  type ProviderWebhookReviewMetrics,
  type ProviderWebhookReviewMetricsFilters,
  type ProviderWebhookReviewSavedView,
  type ProviderWebhookReviewTriage,
  type ProviderWebhookReviewTriageFilters,
  type ProviderWebhookReviewWorkload,
  type ProviderWebhookReviewWorkloadFilters,
  type ProviderWebhookUnmatchedInboundAssignmentRequest,
  type ProviderWebhookUnmatchedInboundDiagnostics,
  type ProviderWebhookUnmatchedInboundExport,
  type ProviderWebhookUnmatchedInboundExportQuery,
  type ProviderWebhookUnmatchedInboundBulkAssignmentRequest,
  type ProviderWebhookUnmatchedInboundBulkAssignmentResponse,
  type ProviderWebhookUnmatchedInboundBulkEscalationRequest,
  type ProviderWebhookUnmatchedInboundBulkEscalationResponse,
  type ProviderWebhookUnmatchedInboundBulkReviewRequest,
  type ProviderWebhookUnmatchedInboundBulkReviewResponse,
  type ProviderWebhookUnmatchedInboundEscalationRequest,
  type ProviderWebhookUnmatchedInboundFilters,
  type ProviderWebhookUnmatchedInboundHistory,
  type ProviderWebhookUnmatchedInboundLinkRequest,
  type ProviderWebhookUnmatchedInboundItem,
  type ProviderWebhookUnmatchedInboundPage,
  type ProviderWebhookUnmatchedInboundReviewRequest,
  type ProviderWebhookSandboxEventRequest,
  type RoomAiPolicy,
  type RoomAiPolicyPatch,
  type ScheduleBroadcastCampaignRequest,
  type SetPrimaryIdentityRequest,
  type SettingsChannelAccount,
  type SettingsCannedReply,
  type SettingsSlaPolicy,
  type SettingsTeamMember,
  type TaskDashboardItem,
  type ConversationStatusHistory,
  type UpdateConversationPriorityRequest,
  type UpdateConversationReadStateRequest,
  type UpdateConversationSlaRequest,
  type UpdateConversationStatusRequest,
  type UnlinkContactIdentityRequest,
  type UpdateBroadcastCampaignRequest,
  type UpdateBroadcastConsentRequest,
  type UpdateBroadcastSegmentRequest,
  type UpdateContactRequest,
  type UpdateCustomer360ConsentRequest,
  type UpdateCustomer360ProfileRequest,
  type UpdateSettingsChannelAccountRequest,
  type UpdateSettingsCannedReplyRequest,
  type UpdateSettingsSlaPolicyRequest,
  type UpdateSettingsTeamMemberRequest,
  type UpdateFlowRequest,
  type UpdateFlowStatusRequest,
  type UpdateKnowledgeBaseRequest,
  type UpdateKnowledgeChunkRequest,
  type UpdateKnowledgeDocumentRequest,
  type UpdateTaskRequest,
  type WebchatInboundRequest,
  type WebchatInboundResponse,
  type WorkflowTask
} from "@ai-omni/shared";
import { getApiBaseUrl, getApiTenantId } from "./data-mode";

type ConversationFilters = {
  tab?: CoreConversationTab;
  filter?: ConversationFilter;
  agentId?: string;
  search?: string;
  platform?: Platform | "all";
  channelAccountId?: string;
  status?: "all" | "open" | "pending" | "follow_up" | "resolved" | "closed" | "spam";
  priority?: "all" | "low" | "medium" | "high" | "urgent";
  unread?: "all" | "unread" | "read";
  slaStatus?: "all" | "ok" | "warning" | "breached";
  sort?: "latest_desc" | "latest_asc" | "updated_desc" | "updated_asc";
  limit?: number;
  offset?: number;
};

type WebchatMessagePayload = WebchatInboundRequest & {
  channelAccountId?: string;
};

type AnalyticsQuery = {
  from?: string;
  to?: string;
  platform?: Platform | "all";
  roomId?: string;
  agentId?: string;
};

type TaskDashboardFilters = {
  status?: "all" | "open" | "completed" | "done" | "cancelled";
  due?: "all" | "due" | "overdue" | "upcoming" | "due_soon" | "follow_up";
  followUp?: boolean;
  assigneeUserId?: string;
  roomId?: string;
  platform?: Platform | "all";
  limit?: number;
  offset?: number;
};

export const defaultApiUserId = "00000000-0000-4000-8000-000000000011";

export async function getApiHealth(): Promise<ApiHealth> {
  return request("/health", apiHealthSchema);
}

export async function getApiReadiness(): Promise<ApiReadiness> {
  return request("/health/readiness", apiReadinessSchema);
}

export async function getProviderReadiness(): Promise<ProviderReadiness> {
  const readiness = await getApiReadiness();
  return readiness.providerReadiness;
}

export async function getProviderWebhookEvents(): Promise<ProviderWebhookEvent[]> {
  return request("/provider-webhooks/events", providerWebhookEventSchema.array());
}

export async function getProviderWebhookReviewMetrics(filters: ProviderWebhookReviewMetricsFilters = {}): Promise<ProviderWebhookReviewMetrics> {
  const parsed = providerWebhookReviewMetricsFiltersSchema.parse(filters);
  const params = new URLSearchParams();
  const orderedKeys: (keyof ProviderWebhookReviewMetricsFilters)[] = [
    "provider",
    "reviewStatus",
    "linkStatus",
    "unmatchedStatus",
    "status",
    "eventType",
    "assignedTo",
    "assignmentStatus",
    "escalationStatus",
    "escalationReason",
    "receivedFrom",
    "receivedTo",
    "receivedAtFrom",
    "receivedAtTo"
  ];
  for (const key of orderedKeys) {
    const value = parsed[key];
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  }
  const search = params.toString();
  return request(`/provider-webhooks/review-metrics${search ? `?${search}` : ""}`, providerWebhookReviewMetricsSchema);
}

export async function getProviderWebhookReviewAlerts(filters: ProviderWebhookReviewAlertsFilters = {}): Promise<ProviderWebhookReviewAlerts> {
  const parsed = providerWebhookReviewAlertsFiltersSchema.parse(filters);
  const params = new URLSearchParams();
  const orderedKeys: (keyof ProviderWebhookReviewAlertsFilters)[] = [
    "provider",
    "reviewStatus",
    "linkStatus",
    "unmatchedStatus",
    "status",
    "eventType",
    "assignedTo",
    "assignmentStatus",
    "escalationStatus",
    "escalationReason",
    "receivedFrom",
    "receivedTo",
    "receivedAtFrom",
    "receivedAtTo",
    "severity"
  ];
  for (const key of orderedKeys) {
    const value = parsed[key];
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  }
  const search = params.toString();
  return request(`/provider-webhooks/review-alerts${search ? `?${search}` : ""}`, providerWebhookReviewAlertsSchema);
}

export async function getProviderWebhookReviewTriage(filters: ProviderWebhookReviewTriageFilters = {}): Promise<ProviderWebhookReviewTriage> {
  const parsed = providerWebhookReviewTriageFiltersSchema.parse(filters);
  const params = new URLSearchParams();
  const orderedKeys: (keyof ProviderWebhookReviewTriageFilters)[] = [
    "provider",
    "reviewStatus",
    "linkStatus",
    "unmatchedStatus",
    "status",
    "eventType",
    "assignedTo",
    "assignmentStatus",
    "escalationStatus",
    "escalationReason",
    "receivedFrom",
    "receivedTo",
    "receivedAtFrom",
    "receivedAtTo",
    "severity",
    "triageLane"
  ];
  for (const key of orderedKeys) {
    const value = parsed[key];
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  }
  const search = params.toString();
  return request(`/provider-webhooks/review-triage${search ? `?${search}` : ""}`, providerWebhookReviewTriageSchema);
}

export async function getProviderWebhookReviewWorkload(filters: ProviderWebhookReviewWorkloadFilters = {}): Promise<ProviderWebhookReviewWorkload> {
  const parsed = providerWebhookReviewWorkloadFiltersSchema.parse(filters);
  const params = new URLSearchParams();
  const orderedKeys: (keyof ProviderWebhookReviewWorkloadFilters)[] = [
    "provider",
    "reviewStatus",
    "linkStatus",
    "unmatchedStatus",
    "status",
    "eventType",
    "assignedTo",
    "assignmentStatus",
    "escalationStatus",
    "escalationReason",
    "receivedFrom",
    "receivedTo",
    "receivedAtFrom",
    "receivedAtTo",
    "severity",
    "triageLane"
  ];
  for (const key of orderedKeys) {
    const value = parsed[key];
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  }
  const search = params.toString();
  return request(`/provider-webhooks/review-workload${search ? `?${search}` : ""}`, providerWebhookReviewWorkloadSchema);
}

export async function getProviderWebhookReviewSavedViews(): Promise<ProviderWebhookReviewSavedView[]> {
  return request("/provider-webhooks/review-saved-views", providerWebhookReviewSavedViewSchema.array());
}

export async function createProviderWebhookReviewSavedView(payload: CreateProviderWebhookReviewSavedViewRequest): Promise<ProviderWebhookReviewSavedView> {
  const body = createProviderWebhookReviewSavedViewRequestSchema.parse(payload);
  return request("/provider-webhooks/review-saved-views", providerWebhookReviewSavedViewSchema, {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export async function updateProviderWebhookReviewSavedView(
  savedViewId: string,
  payload: UpdateProviderWebhookReviewSavedViewRequest
): Promise<ProviderWebhookReviewSavedView> {
  const body = updateProviderWebhookReviewSavedViewRequestSchema.parse(payload);
  return request(`/provider-webhooks/review-saved-views/${encodeURIComponent(savedViewId)}`, providerWebhookReviewSavedViewSchema, {
    method: "PATCH",
    body: JSON.stringify(body)
  });
}

export async function archiveProviderWebhookReviewSavedView(savedViewId: string): Promise<ProviderWebhookReviewSavedView> {
  return request(`/provider-webhooks/review-saved-views/${encodeURIComponent(savedViewId)}/archive`, providerWebhookReviewSavedViewSchema, {
    method: "PATCH"
  });
}

export async function getProviderWebhookUnmatchedInbound(filters: ProviderWebhookUnmatchedInboundFilters = {}): Promise<ProviderWebhookUnmatchedInboundPage> {
  const parsed = providerWebhookUnmatchedInboundFiltersSchema.parse(filters);
  const pageFilters: ProviderWebhookUnmatchedInboundFilters = {
    ...parsed,
    limit: parsed.limit ?? 10,
    offset: parsed.offset ?? 0,
    sortBy: parsed.sortBy ?? "receivedAt",
    sortOrder: parsed.sortOrder ?? "desc"
  };
  const params = new URLSearchParams();
  Object.entries(pageFilters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  });
  const search = params.toString();
  return request(`/provider-webhooks/unmatched-inbound${search ? `?${search}` : ""}`, providerWebhookUnmatchedInboundPageSchema);
}

export async function getProviderWebhookUnmatchedInboundCandidates(unmatchedInboundId: string): Promise<ProviderWebhookCandidateConversation[]> {
  return request(`/provider-webhooks/unmatched-inbound/${encodeURIComponent(unmatchedInboundId)}/candidates`, providerWebhookCandidateConversationSchema.array());
}

export async function getProviderWebhookUnmatchedInboundHistory(unmatchedInboundId: string): Promise<ProviderWebhookUnmatchedInboundHistory> {
  return request(`/provider-webhooks/unmatched-inbound/${encodeURIComponent(unmatchedInboundId)}/history`, providerWebhookUnmatchedInboundHistorySchema);
}

export async function getProviderWebhookUnmatchedInboundDiagnostics(unmatchedInboundId: string): Promise<ProviderWebhookUnmatchedInboundDiagnostics> {
  return request(`/provider-webhooks/unmatched-inbound/${encodeURIComponent(unmatchedInboundId)}/diagnostics`, providerWebhookUnmatchedInboundDiagnosticsSchema);
}

export async function getProviderWebhookOperatorNotes(unmatchedInboundId: string): Promise<ProviderWebhookOperatorNote[]> {
  return request(`/provider-webhooks/unmatched-inbound/${encodeURIComponent(unmatchedInboundId)}/operator-notes`, providerWebhookOperatorNoteSchema.array());
}

export async function createProviderWebhookOperatorNote(
  unmatchedInboundId: string,
  payload: CreateProviderWebhookOperatorNoteRequest
): Promise<ProviderWebhookOperatorNote> {
  const body = createProviderWebhookOperatorNoteRequestSchema.parse(payload);
  return request(`/provider-webhooks/unmatched-inbound/${encodeURIComponent(unmatchedInboundId)}/operator-notes`, providerWebhookOperatorNoteSchema, {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export async function getProviderWebhookUnmatchedInboundExport(filters: ProviderWebhookUnmatchedInboundExportQuery = {}): Promise<ProviderWebhookUnmatchedInboundExport> {
  const parsed = providerWebhookUnmatchedInboundExportQuerySchema.parse(filters);
  const params = new URLSearchParams();
  const orderedKeys: (keyof ProviderWebhookUnmatchedInboundExportQuery)[] = [
    "provider",
    "reviewStatus",
    "linkStatus",
    "unmatchedStatus",
    "status",
    "eventType",
    "assignedTo",
    "assignmentStatus",
    "escalationStatus",
    "escalationReason",
    "receivedFrom",
    "receivedTo",
    "receivedAtFrom",
    "receivedAtTo",
    "offset",
    "sortBy",
    "sortOrder",
    "format",
    "limit"
  ];
  for (const key of orderedKeys) {
    const value = parsed[key];
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  }
  const search = params.toString();
  return request(`/provider-webhooks/unmatched-inbound/export${search ? `?${search}` : ""}`, providerWebhookUnmatchedInboundExportSchema);
}

export async function createProviderWebhookSandboxEvent(payload: ProviderWebhookSandboxEventRequest): Promise<ProviderWebhookEvent> {
  const body = providerWebhookSandboxEventRequestSchema.parse(payload);
  return request("/provider-webhooks/sandbox-events", providerWebhookEventSchema, {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export async function reviewProviderWebhookUnmatchedInbound(
  unmatchedInboundId: string,
  payload: ProviderWebhookUnmatchedInboundReviewRequest
): Promise<ProviderWebhookUnmatchedInboundItem> {
  const body = providerWebhookUnmatchedInboundReviewRequestSchema.parse(payload);
  return request(`/provider-webhooks/unmatched-inbound/${encodeURIComponent(unmatchedInboundId)}/review`, providerWebhookUnmatchedInboundItemSchema, {
    method: "PATCH",
    body: JSON.stringify(body)
  });
}

export async function assignProviderWebhookUnmatchedInbound(
  unmatchedInboundId: string,
  payload: ProviderWebhookUnmatchedInboundAssignmentRequest
): Promise<ProviderWebhookUnmatchedInboundItem> {
  const body = providerWebhookUnmatchedInboundAssignmentRequestSchema.parse(payload);
  return request(`/provider-webhooks/unmatched-inbound/${encodeURIComponent(unmatchedInboundId)}/assignment`, providerWebhookUnmatchedInboundItemSchema, {
    method: "PATCH",
    body: JSON.stringify(body)
  });
}

export async function escalateProviderWebhookUnmatchedInbound(
  unmatchedInboundId: string,
  payload: ProviderWebhookUnmatchedInboundEscalationRequest
): Promise<ProviderWebhookUnmatchedInboundItem> {
  const body = providerWebhookUnmatchedInboundEscalationRequestSchema.parse(payload);
  return request(`/provider-webhooks/unmatched-inbound/${encodeURIComponent(unmatchedInboundId)}/escalation`, providerWebhookUnmatchedInboundItemSchema, {
    method: "PATCH",
    body: JSON.stringify(body)
  });
}

export async function bulkReviewProviderWebhookUnmatchedInbound(
  payload: ProviderWebhookUnmatchedInboundBulkReviewRequest
): Promise<ProviderWebhookUnmatchedInboundBulkReviewResponse> {
  const body = providerWebhookUnmatchedInboundBulkReviewRequestSchema.parse(payload);
  return request("/provider-webhooks/unmatched-inbound/bulk-review", providerWebhookUnmatchedInboundBulkReviewResponseSchema, {
    method: "PATCH",
    body: JSON.stringify(body)
  });
}

export async function bulkAssignProviderWebhookUnmatchedInbound(
  payload: ProviderWebhookUnmatchedInboundBulkAssignmentRequest
): Promise<ProviderWebhookUnmatchedInboundBulkAssignmentResponse> {
  const body = providerWebhookUnmatchedInboundBulkAssignmentRequestSchema.parse(payload);
  return request("/provider-webhooks/unmatched-inbound/bulk-assignment", providerWebhookUnmatchedInboundBulkAssignmentResponseSchema, {
    method: "PATCH",
    body: JSON.stringify(body)
  });
}

export async function bulkEscalateProviderWebhookUnmatchedInbound(
  payload: ProviderWebhookUnmatchedInboundBulkEscalationRequest
): Promise<ProviderWebhookUnmatchedInboundBulkEscalationResponse> {
  const body = providerWebhookUnmatchedInboundBulkEscalationRequestSchema.parse(payload);
  return request("/provider-webhooks/unmatched-inbound/bulk-escalation", providerWebhookUnmatchedInboundBulkEscalationResponseSchema, {
    method: "PATCH",
    body: JSON.stringify(body)
  });
}

export async function linkProviderWebhookUnmatchedInboundConversation(
  unmatchedInboundId: string,
  payload: ProviderWebhookUnmatchedInboundLinkRequest
): Promise<ProviderWebhookUnmatchedInboundItem> {
  const body = providerWebhookUnmatchedInboundLinkRequestSchema.parse(payload);
  return request(`/provider-webhooks/unmatched-inbound/${encodeURIComponent(unmatchedInboundId)}/link-conversation`, providerWebhookUnmatchedInboundItemSchema, {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export async function getAnalyticsOverview(query: AnalyticsQuery = {}): Promise<AnalyticsOverview> {
  return request(analyticsPath("/analytics/overview", query), analyticsOverviewSchema);
}

export async function getAnalyticsConversations(query: AnalyticsQuery = {}): Promise<AnalyticsConversations> {
  return request(analyticsPath("/analytics/conversations", query), analyticsConversationsSchema);
}

export async function getAnalyticsChannels(query: AnalyticsQuery = {}): Promise<AnalyticsChannels> {
  return request(analyticsPath("/analytics/channels", query), analyticsChannelsSchema);
}

export async function getAnalyticsAgents(query: AnalyticsQuery = {}): Promise<AnalyticsAgents> {
  return request(analyticsPath("/analytics/agents", query), analyticsAgentsSchema);
}

export async function getAnalyticsSla(query: AnalyticsQuery = {}): Promise<AnalyticsSla> {
  return request(analyticsPath("/analytics/sla", query), analyticsSlaSchema);
}

export async function getAnalyticsAi(query: AnalyticsQuery = {}): Promise<AnalyticsAi> {
  return request(analyticsPath("/analytics/ai", query), analyticsAiSchema);
}

export async function getAnalyticsTasks(query: AnalyticsQuery = {}): Promise<AnalyticsTasks> {
  return request(analyticsPath("/analytics/tasks", query), analyticsTasksSchema);
}

export async function getAnalyticsAudit(query: AnalyticsQuery = {}): Promise<AnalyticsAudit> {
  return request(analyticsPath("/analytics/audit", query), analyticsAuditSchema);
}

export async function getFlows(): Promise<Flow[]> {
  return request("/flows", flowSchema.array());
}

export async function createApiFlow(payload: CreateFlowRequest): Promise<Flow> {
  const body = createFlowRequestSchema.parse(payload);
  return request("/flows", flowSchema, {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export async function getFlow(flowId: string): Promise<Flow> {
  return request(`/flows/${encodeURIComponent(flowId)}`, flowSchema);
}

export async function updateApiFlow(flowId: string, payload: UpdateFlowRequest): Promise<Flow> {
  const body = updateFlowRequestSchema.parse(payload);
  return request(`/flows/${encodeURIComponent(flowId)}`, flowSchema, {
    method: "PATCH",
    body: JSON.stringify(body)
  });
}

export async function deleteApiFlow(flowId: string): Promise<Flow> {
  return request(`/flows/${encodeURIComponent(flowId)}`, flowSchema, {
    method: "DELETE"
  });
}

export async function duplicateApiFlow(flowId: string): Promise<Flow> {
  return request(`/flows/${encodeURIComponent(flowId)}/duplicate`, flowSchema, {
    method: "POST"
  });
}

export async function updateApiFlowStatus(flowId: string, payload: UpdateFlowStatusRequest): Promise<Flow> {
  const body = updateFlowStatusRequestSchema.parse(payload);
  return request(`/flows/${encodeURIComponent(flowId)}/status`, flowSchema, {
    method: "PATCH",
    body: JSON.stringify(body)
  });
}

export async function getFlowRuns(flowId: string): Promise<FlowRun[]> {
  return request(`/flows/${encodeURIComponent(flowId)}/runs`, flowRunSchema.array());
}

export async function testRunApiFlow(flowId: string, payload: FlowTestRunRequest): Promise<FlowTestRunResult> {
  const body = flowTestRunRequestSchema.parse(payload);
  return request(`/flows/${encodeURIComponent(flowId)}/test-run`, flowTestRunResultSchema, {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export async function getBroadcastCampaigns(): Promise<BroadcastCampaign[]> {
  return request("/broadcasts/campaigns", broadcastCampaignSchema.array());
}

export async function createBroadcastCampaign(payload: CreateBroadcastCampaignRequest): Promise<BroadcastCampaign> {
  const body = createBroadcastCampaignRequestSchema.parse(payload);
  return request("/broadcasts/campaigns", broadcastCampaignSchema, {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export async function getBroadcastCampaign(campaignId: string): Promise<BroadcastCampaignDetail> {
  return getBroadcastCampaignDetail(campaignId);
}

export async function getBroadcastCampaignDetail(campaignId: string): Promise<BroadcastCampaignDetail> {
  return request(`/broadcasts/campaigns/${encodeURIComponent(campaignId)}`, broadcastCampaignDetailSchema);
}

export async function updateBroadcastCampaign(campaignId: string, payload: UpdateBroadcastCampaignRequest): Promise<BroadcastCampaign> {
  const body = updateBroadcastCampaignRequestSchema.parse(payload);
  return request(`/broadcasts/campaigns/${encodeURIComponent(campaignId)}`, broadcastCampaignSchema, {
    method: "PATCH",
    body: JSON.stringify(body)
  });
}

export async function deleteBroadcastCampaign(campaignId: string): Promise<BroadcastCampaign> {
  return request(`/broadcasts/campaigns/${encodeURIComponent(campaignId)}`, broadcastCampaignSchema, {
    method: "DELETE"
  });
}

export async function duplicateBroadcastCampaign(campaignId: string): Promise<BroadcastCampaign> {
  return request(`/broadcasts/campaigns/${encodeURIComponent(campaignId)}/duplicate`, broadcastCampaignSchema, {
    method: "POST"
  });
}

export async function previewBroadcastAudience(campaignId: string, payload: BroadcastAudiencePreviewRequest = {}): Promise<BroadcastAudiencePreviewResult> {
  const parsed = broadcastAudiencePreviewRequestSchema.parse(payload);
  const params = new URLSearchParams();
  if (parsed.platform) params.set("platform", parsed.platform);
  if (parsed.channelAccountId !== undefined && parsed.channelAccountId !== null) params.set("channelAccountId", parsed.channelAccountId);
  if (parsed.limit !== undefined) params.set("limit", String(parsed.limit));
  const search = params.toString();
  return request(`/broadcasts/campaigns/${encodeURIComponent(campaignId)}/audience-preview${search ? `?${search}` : ""}`, broadcastAudiencePreviewResultSchema);
}

export async function dryRunBroadcastAudience(campaignId: string, payload: BroadcastAudiencePreviewRequest = {}): Promise<BroadcastAudiencePreviewResult> {
  const body = broadcastAudiencePreviewRequestSchema.parse(payload);
  return request(`/broadcasts/campaigns/${encodeURIComponent(campaignId)}/dry-run`, broadcastAudiencePreviewResultSchema, {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export async function scheduleBroadcastCampaign(campaignId: string, payload: ScheduleBroadcastCampaignRequest): Promise<BroadcastCampaign> {
  const body = scheduleBroadcastCampaignRequestSchema.parse(payload);
  return request(`/broadcasts/campaigns/${encodeURIComponent(campaignId)}/schedule`, broadcastCampaignSchema, {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export async function requestBroadcastCampaignApproval(campaignId: string, payload: BroadcastApprovalRequest = {}): Promise<BroadcastCampaign> {
  const body = broadcastApprovalRequestSchema.parse(payload);
  return request(`/broadcasts/campaigns/${encodeURIComponent(campaignId)}/request-approval`, broadcastCampaignSchema, {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export async function approveBroadcastCampaign(campaignId: string, payload: BroadcastApprovalRequest = {}): Promise<BroadcastCampaign> {
  const body = broadcastApprovalRequestSchema.parse(payload);
  return request(`/broadcasts/campaigns/${encodeURIComponent(campaignId)}/approve`, broadcastCampaignSchema, {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export async function rejectBroadcastCampaign(campaignId: string, payload: BroadcastApprovalRequest = {}): Promise<BroadcastCampaign> {
  const body = broadcastApprovalRequestSchema.parse(payload);
  return request(`/broadcasts/campaigns/${encodeURIComponent(campaignId)}/reject`, broadcastCampaignSchema, {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export async function cancelBroadcastCampaignApproval(campaignId: string, payload: BroadcastApprovalRequest = {}): Promise<BroadcastCampaign> {
  const body = broadcastApprovalRequestSchema.parse(payload);
  return request(`/broadcasts/campaigns/${encodeURIComponent(campaignId)}/cancel-approval`, broadcastCampaignSchema, {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export async function sendBroadcastTest(campaignId: string, payload: BroadcastSendTestRequest = {}): Promise<BroadcastSendResult> {
  const body = broadcastSendTestRequestSchema.parse(payload);
  return request(`/broadcasts/campaigns/${encodeURIComponent(campaignId)}/send-test`, broadcastSendResultSchema, {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export async function sendBroadcastNow(campaignId: string, payload: BroadcastAudiencePreviewRequest = {}): Promise<BroadcastSendResult> {
  const body = broadcastAudiencePreviewRequestSchema.parse(payload);
  return request(`/broadcasts/campaigns/${encodeURIComponent(campaignId)}/send-now`, broadcastSendResultSchema, {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export async function getBroadcastSendLogs(campaignId: string): Promise<BroadcastSendLog[]> {
  return request(`/broadcasts/campaigns/${encodeURIComponent(campaignId)}/send-logs`, broadcastSendLogSchema.array());
}

export async function getBroadcastSendLogPage(filters: BroadcastSendLogFilters = {}): Promise<BroadcastSendLogPage> {
  const parsed = broadcastSendLogFiltersSchema.parse(filters);
  const params = new URLSearchParams();
  Object.entries(parsed).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  });
  const search = params.toString();
  return request(`/broadcasts/send-logs${search ? `?${search}` : ""}`, broadcastSendLogPageSchema);
}

export async function getBroadcastCampaignAnalytics(campaignId: string, filters: BroadcastSendLogFilters = {}): Promise<BroadcastCampaignAnalytics> {
  const parsed = broadcastSendLogFiltersSchema.parse({ ...filters, campaignId });
  return request(`/broadcasts/campaigns/${encodeURIComponent(campaignId)}/analytics${broadcastSendLogSearch(parsed)}`, broadcastCampaignAnalyticsSchema);
}

export async function getBroadcastDeliveryExport(campaignId: string, filters: BroadcastSendLogFilters = {}): Promise<BroadcastDeliveryExport> {
  const parsed = broadcastSendLogFiltersSchema.parse({ ...filters, campaignId });
  return request(`/broadcasts/campaigns/${encodeURIComponent(campaignId)}/delivery-export${broadcastSendLogSearch(parsed)}`, broadcastDeliveryExportSchema);
}

export async function getBroadcastComplianceLogs(campaignId: string): Promise<BroadcastComplianceLog[]> {
  return request(`/broadcasts/campaigns/${encodeURIComponent(campaignId)}/compliance-logs`, broadcastComplianceLogSchema.array());
}

export async function getBroadcastComplianceHistory(filters: BroadcastComplianceFilters = {}): Promise<BroadcastComplianceLogPage> {
  const parsed = broadcastComplianceFiltersSchema.parse(filters);
  const params = new URLSearchParams();
  Object.entries(parsed).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  });
  const search = params.toString();
  return request(`/broadcasts/compliance-logs${search ? `?${search}` : ""}`, broadcastComplianceLogPageSchema);
}

export async function getBroadcastSegments(): Promise<BroadcastSegment[]> {
  return request("/broadcasts/segments", broadcastSegmentSchema.array());
}

export async function previewBroadcastSegment(payload: UpdateBroadcastSegmentRequest & BroadcastAudiencePreviewRequest = {}): Promise<BroadcastAudiencePreviewResult> {
  const value = payload as UpdateBroadcastSegmentRequest & BroadcastAudiencePreviewRequest;
  const segmentBody = updateBroadcastSegmentRequestSchema.parse({
    name: value.name,
    description: value.description,
    rules: value.rules,
    rulesJson: value.rulesJson,
    estimatedCount: value.estimatedCount
  });
  const previewBody = broadcastAudiencePreviewRequestSchema.parse({
    platform: value.platform,
    channelAccountId: value.channelAccountId,
    limit: value.limit
  });
  return request("/broadcasts/segments/preview", broadcastAudiencePreviewResultSchema, {
    method: "POST",
    body: JSON.stringify({ segment: segmentBody, preview: previewBody })
  });
}

export async function previewSavedBroadcastSegment(segmentId: string, payload: BroadcastAudiencePreviewRequest = {}): Promise<BroadcastAudiencePreviewResult> {
  const parsed = broadcastAudiencePreviewRequestSchema.parse(payload);
  const params = new URLSearchParams();
  if (parsed.platform) params.set("platform", parsed.platform);
  if (parsed.channelAccountId !== undefined && parsed.channelAccountId !== null) params.set("channelAccountId", parsed.channelAccountId);
  if (parsed.limit !== undefined) params.set("limit", String(parsed.limit));
  const search = params.toString();
  return request(`/broadcasts/segments/${encodeURIComponent(segmentId)}/preview${search ? `?${search}` : ""}`, broadcastAudiencePreviewResultSchema);
}

export async function applyBroadcastSegmentToCampaign(campaignId: string, payload: ApplyBroadcastSegmentRequest): Promise<BroadcastCampaign> {
  const body = applyBroadcastSegmentRequestSchema.parse(payload);
  return request(`/broadcasts/campaigns/${encodeURIComponent(campaignId)}/apply-segment`, broadcastCampaignSchema, {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export async function createBroadcastSegment(payload: CreateBroadcastSegmentRequest): Promise<BroadcastSegment> {
  const body = createBroadcastSegmentRequestSchema.parse(payload);
  return request("/broadcasts/segments", broadcastSegmentSchema, {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export async function updateBroadcastSegment(segmentId: string, payload: UpdateBroadcastSegmentRequest): Promise<BroadcastSegment> {
  const body = updateBroadcastSegmentRequestSchema.parse(payload);
  return request(`/broadcasts/segments/${encodeURIComponent(segmentId)}`, broadcastSegmentSchema, {
    method: "PATCH",
    body: JSON.stringify(body)
  });
}

export async function deleteBroadcastSegment(segmentId: string): Promise<BroadcastSegment> {
  return request(`/broadcasts/segments/${encodeURIComponent(segmentId)}`, broadcastSegmentSchema, {
    method: "DELETE"
  });
}

export async function getRooms(): Promise<CoreRoom[]> {
  return request("/rooms", coreRoomSchema.array());
}

export async function getKnowledgeBases(): Promise<KnowledgeBase[]> {
  return request("/ai/knowledge-bases", knowledgeBaseSchema.array());
}

export async function createKnowledgeBase(payload: CreateKnowledgeBaseRequest): Promise<KnowledgeBase> {
  const body = createKnowledgeBaseRequestSchema.parse(payload);
  return request("/ai/knowledge-bases", knowledgeBaseSchema, {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export async function updateKnowledgeBase(knowledgeBaseId: string, payload: UpdateKnowledgeBaseRequest): Promise<KnowledgeBase> {
  const body = updateKnowledgeBaseRequestSchema.parse(payload);
  return request(`/ai/knowledge-bases/${encodeURIComponent(knowledgeBaseId)}`, knowledgeBaseSchema, {
    method: "PATCH",
    body: JSON.stringify(body)
  });
}

export async function deleteKnowledgeBase(knowledgeBaseId: string): Promise<KnowledgeBase> {
  return request(`/ai/knowledge-bases/${encodeURIComponent(knowledgeBaseId)}`, knowledgeBaseSchema, {
    method: "DELETE"
  });
}

export async function getKnowledgeDocuments(knowledgeBaseId: string): Promise<KnowledgeDocument[]> {
  return request(`/ai/knowledge-bases/${encodeURIComponent(knowledgeBaseId)}/documents`, knowledgeDocumentSchema.array());
}

export async function createKnowledgeDocument(knowledgeBaseId: string, payload: CreateKnowledgeDocumentRequest): Promise<KnowledgeDocument> {
  const body = createKnowledgeDocumentRequestSchema.parse(payload);
  return request(`/ai/knowledge-bases/${encodeURIComponent(knowledgeBaseId)}/documents`, knowledgeDocumentSchema, {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export async function updateKnowledgeDocument(documentId: string, payload: UpdateKnowledgeDocumentRequest): Promise<KnowledgeDocument> {
  const body = updateKnowledgeDocumentRequestSchema.parse(payload);
  return request(`/ai/documents/${encodeURIComponent(documentId)}`, knowledgeDocumentSchema, {
    method: "PATCH",
    body: JSON.stringify(body)
  });
}

export async function deleteKnowledgeDocument(documentId: string): Promise<KnowledgeDocument> {
  return request(`/ai/documents/${encodeURIComponent(documentId)}`, knowledgeDocumentSchema, {
    method: "DELETE"
  });
}

export async function getKnowledgeChunks(documentId: string): Promise<KnowledgeChunk[]> {
  return request(`/ai/documents/${encodeURIComponent(documentId)}/chunks`, knowledgeChunkSchema.array());
}

export async function createKnowledgeChunk(documentId: string, payload: CreateKnowledgeChunkRequest): Promise<KnowledgeChunk> {
  const body = createKnowledgeChunkRequestSchema.parse(payload);
  return request(`/ai/documents/${encodeURIComponent(documentId)}/chunks`, knowledgeChunkSchema, {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export async function updateKnowledgeChunk(chunkId: string, payload: UpdateKnowledgeChunkRequest): Promise<KnowledgeChunk> {
  const body = updateKnowledgeChunkRequestSchema.parse(payload);
  return request(`/ai/chunks/${encodeURIComponent(chunkId)}`, knowledgeChunkSchema, {
    method: "PATCH",
    body: JSON.stringify(body)
  });
}

export async function deleteKnowledgeChunk(chunkId: string): Promise<{ id: string; deleted: true }> {
  return requestRaw(`/ai/chunks/${encodeURIComponent(chunkId)}`, {
    method: "DELETE"
  }) as Promise<{ id: string; deleted: true }>;
}

export async function getRoomAiPolicy(roomId: string): Promise<RoomAiPolicy> {
  return request(`/rooms/${encodeURIComponent(roomId)}/ai-policy`, roomAiPolicySchema);
}

export async function updateRoomAiPolicy(roomId: string, payload: RoomAiPolicyPatch): Promise<RoomAiPolicy> {
  const body = roomAiPolicyPatchSchema.parse(payload);
  return request(`/rooms/${encodeURIComponent(roomId)}/ai-policy`, roomAiPolicySchema, {
    method: "PATCH",
    body: JSON.stringify(body)
  });
}

export async function suggestAiReply(conversationId: string): Promise<AiSuggestedReply> {
  return request(`/ai/conversations/${encodeURIComponent(conversationId)}/suggest`, aiSuggestedReplySchema, {
    method: "POST"
  });
}

export async function markAiSuggestionWrong(suggestionId: string, payload: AiSuggestionFeedbackRequest = { feedbackType: "mark_wrong" }): Promise<AiSuggestionFeedback> {
  const body = aiSuggestionFeedbackRequestSchema.parse(payload);
  return request(`/ai/suggestions/${encodeURIComponent(suggestionId)}/feedback`, aiSuggestionFeedbackSchema, {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export async function getConversations(roomId: string, filters: ConversationFilters = {}): Promise<CoreConversationCard[]> {
  const params = new URLSearchParams();
  const tab = coreConversationTabSchema.catch("human").parse(filters.tab);
  const filter = conversationFilterSchema.catch("all").parse(filters.filter);
  params.set("tab", tab);
  params.set("filter", filter);
  if (filters.agentId) params.set("agentId", filters.agentId);
  if (filters.search?.trim()) params.set("search", filters.search.trim());
  if (filters.platform && filters.platform !== "all") params.set("platform", filters.platform);
  if (filters.channelAccountId?.trim()) params.set("channelAccountId", filters.channelAccountId.trim());
  if (filters.status && filters.status !== "all") params.set("status", filters.status);
  if (filters.priority && filters.priority !== "all") params.set("priority", filters.priority);
  if (filters.unread && filters.unread !== "all") params.set("unread", filters.unread === "unread" ? "true" : "false");
  if (filters.slaStatus && filters.slaStatus !== "all") params.set("slaStatus", filters.slaStatus);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.limit !== undefined) params.set("limit", String(filters.limit));
  if (filters.offset !== undefined) params.set("offset", String(filters.offset));
  return request(`/rooms/${encodeURIComponent(roomId)}/conversations?${params.toString()}`, coreConversationCardSchema.array());
}

export async function getConversationMessages(conversationId: string): Promise<CoreMessage[]> {
  return request(`/conversations/${encodeURIComponent(conversationId)}/messages`, coreMessageSchema.array());
}

export async function getCustomer360(conversationId: string): Promise<Customer360> {
  return request(`/conversations/${encodeURIComponent(conversationId)}/customer-360`, customer360Schema);
}

export async function updateCustomer360Profile(conversationId: string, payload: UpdateCustomer360ProfileRequest): Promise<Customer360> {
  const body = updateCustomer360ProfileRequestSchema.parse(payload);
  return request(`/conversations/${encodeURIComponent(conversationId)}/customer-360`, customer360Schema, {
    method: "PATCH",
    body: JSON.stringify(body)
  });
}

export async function updateCustomer360Consent(conversationId: string, payload: UpdateCustomer360ConsentRequest): Promise<Customer360> {
  const body = updateCustomer360ConsentRequestSchema.parse(payload);
  return request(`/conversations/${encodeURIComponent(conversationId)}/customer-360/consent`, customer360Schema, {
    method: "PATCH",
    body: JSON.stringify(body)
  });
}

export async function getConversationNotes(conversationId: string): Promise<InternalNote[]> {
  return request(`/conversations/${encodeURIComponent(conversationId)}/notes`, internalNoteSchema.array());
}

export async function createConversationNote(conversationId: string, payload: CreateInternalNoteRequest): Promise<InternalNote> {
  const body = createInternalNoteRequestSchema.parse(payload);
  return request(`/conversations/${encodeURIComponent(conversationId)}/notes`, internalNoteSchema, {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export async function getConversationTasks(conversationId: string): Promise<WorkflowTask[]> {
  return request(`/conversations/${encodeURIComponent(conversationId)}/tasks`, workflowTaskSchema.array());
}

export async function getTaskDashboard(filters: TaskDashboardFilters = {}): Promise<TaskDashboardItem[]> {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== "all") params.set("status", filters.status);
  if (filters.due && filters.due !== "all") params.set("due", filters.due);
  if (filters.followUp !== undefined) params.set("followUp", String(filters.followUp));
  if (filters.assigneeUserId?.trim() && filters.assigneeUserId !== "all") params.set("assigneeUserId", filters.assigneeUserId.trim());
  if (filters.roomId?.trim() && filters.roomId !== "all") params.set("roomId", filters.roomId.trim());
  if (filters.platform && filters.platform !== "all") params.set("platform", filters.platform);
  if (filters.limit !== undefined) params.set("limit", String(filters.limit));
  if (filters.offset !== undefined) params.set("offset", String(filters.offset));
  const search = params.toString();
  return request(`/tasks${search ? `?${search}` : ""}`, taskDashboardItemSchema.array());
}

export async function createConversationWorkflowTask(conversationId: string, payload: CreateTaskRequest): Promise<WorkflowTask> {
  const body = createTaskRequestSchema.parse(payload);
  return request(`/conversations/${encodeURIComponent(conversationId)}/tasks`, workflowTaskSchema, {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export async function updateConversationWorkflowTask(taskId: string, payload: UpdateTaskRequest): Promise<WorkflowTask> {
  const body = updateTaskRequestSchema.parse(payload);
  return request(`/tasks/${encodeURIComponent(taskId)}`, workflowTaskSchema, {
    method: "PATCH",
    body: JSON.stringify(body)
  });
}

export async function completeConversationWorkflowTask(taskId: string): Promise<WorkflowTask> {
  return request(`/tasks/${encodeURIComponent(taskId)}/complete`, workflowTaskSchema, {
    method: "PATCH"
  });
}

export async function assignConversation(conversationId: string, userId: string | null): Promise<CoreConversationCard> {
  return mutateConversation(conversationId, "assign", { userId });
}

export async function takeOverConversation(conversationId: string): Promise<CoreConversationCard> {
  return mutateConversation(conversationId, "takeover", undefined);
}

export async function returnConversationToAi(conversationId: string): Promise<CoreConversationCard> {
  return mutateConversation(conversationId, "return-to-ai", undefined, [{ tab: "bot", filter: "all" }]);
}

export async function setConversationFollowUp(conversationId: string, payload: FollowUpConversationRequest = {}): Promise<CoreConversationCard> {
  const body = followUpConversationRequestSchema.parse(payload);
  return mutateConversation(conversationId, "follow-up", body);
}

export async function closeConversation(conversationId: string): Promise<CoreConversationCard> {
  return mutateConversation(conversationId, "close", undefined, [{ tab: "human", filter: "closed" }, { tab: "bot", filter: "closed" }]);
}

export async function updateConversationStatus(conversationId: string, payload: UpdateConversationStatusRequest): Promise<CoreConversationCard> {
  const body = updateConversationStatusRequestSchema.parse(payload);
  const filters = body.status === "closed"
    ? [{ tab: "human" as const, filter: "closed" as const }, { tab: "bot" as const, filter: "closed" as const }]
    : body.status === "spam"
      ? [{ tab: "human" as const, filter: "spam" as const }, { tab: "bot" as const, filter: "spam" as const }]
      : [{ tab: "human" as const, filter: "all" as const }, { tab: "bot" as const, filter: "all" as const }];
  return patchConversation(conversationId, "status", body, filters);
}

export async function updateConversationPriority(conversationId: string, payload: UpdateConversationPriorityRequest): Promise<CoreConversationCard> {
  const body = updateConversationPriorityRequestSchema.parse(payload);
  return patchConversation(conversationId, "priority", body);
}

export async function updateConversationReadState(conversationId: string, payload: UpdateConversationReadStateRequest): Promise<CoreConversationCard> {
  const body = updateConversationReadStateRequestSchema.parse(payload);
  return patchConversation(conversationId, "read-state", body);
}

export async function updateConversationSla(conversationId: string, payload: UpdateConversationSlaRequest): Promise<CoreConversationCard> {
  const body = updateConversationSlaRequestSchema.parse(payload);
  return patchConversation(conversationId, "sla", body);
}

export async function getConversationAuditLogs(conversationId: string): Promise<ConversationAuditLog[]> {
  return request(`/conversations/${encodeURIComponent(conversationId)}/audit-logs`, conversationAuditLogSchema.array());
}

export async function getConversationStatusHistory(conversationId: string): Promise<ConversationStatusHistory[]> {
  return request(`/conversations/${encodeURIComponent(conversationId)}/status-history`, conversationStatusHistorySchema.array());
}

export async function sendAgentMessage(conversationId: string, text: string): Promise<CoreMessage> {
  const body: AgentMessageRequest = agentMessageRequestSchema.parse({ text, senderType: "agent" });
  return request(`/conversations/${encodeURIComponent(conversationId)}/messages`, coreMessageSchema, {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export async function createWebchatMessage(payload: WebchatMessagePayload): Promise<WebchatInboundResponse> {
  const { channelAccountId = "demo-webchat", ...message } = payload;
  const body = webchatInboundRequestSchema.parse(message);
  return request(`/webhooks/webchat/${encodeURIComponent(channelAccountId)}`, webchatInboundResponseSchema, {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export async function createContact(payload: CreateContactRequest): Promise<Contact> {
  const body = createContactRequestSchema.parse(payload);
  return request("/contacts", contactSchema, {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export async function getContacts(): Promise<Contact[]> {
  return request("/contacts", contactSchema.array());
}

export async function getSettingsChannels(): Promise<SettingsChannelAccount[]> {
  return request("/settings/channels", settingsChannelAccountSchema.array());
}

export async function getSettingsChannel(channelAccountId: string): Promise<SettingsChannelAccount> {
  return request(`/settings/channels/${encodeURIComponent(channelAccountId)}`, settingsChannelAccountSchema);
}

export async function updateSettingsChannel(channelAccountId: string, payload: UpdateSettingsChannelAccountRequest): Promise<SettingsChannelAccount> {
  const body = updateSettingsChannelAccountRequestSchema.parse(payload);
  return request(`/settings/channels/${encodeURIComponent(channelAccountId)}`, settingsChannelAccountSchema, {
    method: "PATCH",
    body: JSON.stringify(body)
  });
}

export async function getSettingsTeam(): Promise<SettingsTeamMember[]> {
  return request("/settings/team", settingsTeamMemberSchema.array());
}

export async function getSettingsTeamMember(agentId: string): Promise<SettingsTeamMember> {
  return request(`/settings/team/${encodeURIComponent(agentId)}`, settingsTeamMemberSchema);
}

export async function updateSettingsTeamMember(agentId: string, payload: UpdateSettingsTeamMemberRequest): Promise<SettingsTeamMember> {
  const body = updateSettingsTeamMemberRequestSchema.parse(payload);
  return request(`/settings/team/${encodeURIComponent(agentId)}`, settingsTeamMemberSchema, {
    method: "PATCH",
    body: JSON.stringify(body)
  });
}

export async function getSettingsSlaPolicies(): Promise<SettingsSlaPolicy[]> {
  return request("/settings/sla-policies", settingsSlaPolicySchema.array());
}

export async function getSettingsSlaPolicy(policyId: string): Promise<SettingsSlaPolicy> {
  return request(`/settings/sla-policies/${encodeURIComponent(policyId)}`, settingsSlaPolicySchema);
}

export async function updateSettingsSlaPolicy(policyId: string, payload: UpdateSettingsSlaPolicyRequest): Promise<SettingsSlaPolicy> {
  const body = updateSettingsSlaPolicyRequestSchema.parse(payload);
  return request(`/settings/sla-policies/${encodeURIComponent(policyId)}`, settingsSlaPolicySchema, {
    method: "PATCH",
    body: JSON.stringify(body)
  });
}

export async function getSettingsCannedReplies(): Promise<SettingsCannedReply[]> {
  return request("/settings/canned-replies", settingsCannedReplySchema.array());
}

export async function getSettingsCannedReply(replyId: string): Promise<SettingsCannedReply> {
  return request(`/settings/canned-replies/${encodeURIComponent(replyId)}`, settingsCannedReplySchema);
}

export async function updateSettingsCannedReply(replyId: string, payload: UpdateSettingsCannedReplyRequest): Promise<SettingsCannedReply> {
  const body = updateSettingsCannedReplyRequestSchema.parse(payload);
  return request(`/settings/canned-replies/${encodeURIComponent(replyId)}`, settingsCannedReplySchema, {
    method: "PATCH",
    body: JSON.stringify(body)
  });
}

export async function getContact(contactId: string): Promise<Contact> {
  return request(`/contacts/${encodeURIComponent(contactId)}`, contactSchema);
}

export async function getContactIdentities(contactId: string): Promise<ContactIdentity[]> {
  return request(`/contacts/${encodeURIComponent(contactId)}/identities`, contactIdentitySchema.array());
}

export async function getContactConversations(contactId: string): Promise<CoreConversationCard[]> {
  return request(`/contacts/${encodeURIComponent(contactId)}/conversations`, coreConversationCardSchema.array());
}

export async function updateContact(contactId: string, payload: UpdateContactRequest): Promise<Contact> {
  const body = updateContactRequestSchema.parse(payload);
  return request(`/contacts/${encodeURIComponent(contactId)}`, contactSchema, {
    method: "PATCH",
    body: JSON.stringify(body)
  });
}

export async function linkContactIdentity(contactId: string, payload: LinkContactIdentityRequest): Promise<Contact> {
  const body = linkContactIdentityRequestSchema.parse(payload);
  return request(`/contacts/${encodeURIComponent(contactId)}/identities/link`, contactSchema, {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export async function unlinkContactIdentity(contactId: string, payload: UnlinkContactIdentityRequest): Promise<Contact> {
  const body = unlinkContactIdentityRequestSchema.parse(payload);
  return request(`/contacts/${encodeURIComponent(contactId)}/identities/unlink`, contactSchema, {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export async function setPrimaryContactIdentity(contactId: string, payload: SetPrimaryIdentityRequest): Promise<Contact> {
  const body = setPrimaryIdentityRequestSchema.parse(payload);
  return request(`/contacts/${encodeURIComponent(contactId)}/primary-identity`, contactSchema, {
    method: "PATCH",
    body: JSON.stringify(body)
  });
}

export async function updateBroadcastConsent(contactId: string, payload: UpdateBroadcastConsentRequest): Promise<Contact> {
  const body = updateBroadcastConsentRequestSchema.parse(payload);
  return request(`/contacts/${encodeURIComponent(contactId)}/broadcast-consent`, contactSchema, {
    method: "PATCH",
    body: JSON.stringify(body)
  });
}

async function mutateConversation(
  conversationId: string,
  action: "assign" | "takeover" | "return-to-ai" | "follow-up" | "close",
  body: unknown,
  preferredFilters: ConversationFilters[] = []
): Promise<CoreConversationCard> {
  const response = await requestRaw(`/conversations/${encodeURIComponent(conversationId)}/${action}`, {
    method: "POST",
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  return refetchMutatedConversation(conversationId, response, preferredFilters, action);
}

async function patchConversation(
  conversationId: string,
  action: "status" | "priority" | "read-state" | "sla",
  body: unknown,
  preferredFilters: ConversationFilters[] = []
): Promise<CoreConversationCard> {
  const response = await requestRaw(`/conversations/${encodeURIComponent(conversationId)}/${action}`, {
    method: "PATCH",
    body: JSON.stringify(body)
  });
  return refetchMutatedConversation(conversationId, response, preferredFilters, action);
}

async function refetchMutatedConversation(
  conversationId: string,
  response: unknown,
  preferredFilters: ConversationFilters[],
  action: string
) {
  const data = response as { roomId?: string };
  if (!data.roomId) throw new Error(`API response shape is invalid for /conversations/${conversationId}/${action}`);
  const fallbackFilters: ConversationFilters[] = [
    { tab: "human", filter: "all" },
    { tab: "bot", filter: "all" },
    { tab: "human", filter: "closed" },
    { tab: "bot", filter: "closed" },
    { tab: "human", filter: "spam" },
    { tab: "bot", filter: "spam" },
    { tab: "human", filter: "follow_up" },
    { tab: "bot", filter: "follow_up" }
  ];
  for (const filters of [...preferredFilters, ...fallbackFilters]) {
    const cards = await getConversations(data.roomId, filters);
    const card = cards.find((item) => item.id === conversationId);
    if (card) return card;
  }
  throw new Error(`Updated conversation ${conversationId} was not returned by the API`);
}

async function request<T>(path: string, schema: { parse(value: unknown): T }, init: RequestInit = {}) {
  const data = await requestRaw(path, init);
  try {
    return schema.parse(data);
  } catch {
    throw new Error(`API response shape is invalid for ${path}`);
  }
}

async function requestRaw(path: string, init: RequestInit = {}) {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      "x-tenant-id": getApiTenantId(),
      "x-user-id": defaultApiUserId,
      ...init.headers
    }
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const detail = typeof data?.message === "string" ? data.message : response.statusText;
    throw new Error(`API request failed (${response.status}): ${detail}`);
  }

  return data;
}

function analyticsPath(path: string, query: AnalyticsQuery) {
  const params = new URLSearchParams();
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);
  if (query.platform && query.platform !== "all") params.set("platform", query.platform);
  if (query.roomId && query.roomId !== "all") params.set("roomId", query.roomId);
  if (query.agentId && query.agentId !== "all") params.set("agentId", query.agentId);
  const search = params.toString();
  return search ? `${path}?${search}` : path;
}

function broadcastSendLogSearch(filters: ReturnType<typeof broadcastSendLogFiltersSchema.parse>) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  });
  const search = params.toString();
  return search ? `?${search}` : "";
}
