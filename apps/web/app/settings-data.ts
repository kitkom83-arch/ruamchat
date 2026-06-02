import type {
  CannedReply,
  DataMode,
  ProviderReadiness,
  ProviderWebhookCandidateConversation,
  ProviderWebhookEvent,
  ProviderWebhookUnmatchedInboundBulkReviewRequest,
  ProviderWebhookUnmatchedInboundBulkReviewResponse,
  ProviderWebhookUnmatchedInboundFilters,
  ProviderWebhookUnmatchedInboundLinkRequest,
  ProviderWebhookUnmatchedInboundItem,
  ProviderWebhookUnmatchedInboundPage,
  ProviderWebhookUnmatchedInboundReviewRequest,
  ProviderWebhookSandboxEventRequest,
  SettingsCannedReply,
  SettingsChannelAccount,
  SettingsSlaPolicy,
  SettingsTeamMember
} from "@ai-omni/shared";
import {
  createProviderWebhookSandboxEvent,
  bulkReviewProviderWebhookUnmatchedInbound,
  getProviderReadiness,
  getProviderWebhookEvents,
  getProviderWebhookUnmatchedInbound,
  getProviderWebhookUnmatchedInboundCandidates,
  linkProviderWebhookUnmatchedInboundConversation,
  reviewProviderWebhookUnmatchedInbound,
  getSettingsCannedReplies,
  getSettingsChannels,
  getSettingsSlaPolicies,
  getSettingsTeam
} from "./api-client";
import { createDefaultAdminStore, mockCannedReplies, mockSlaPolicies } from "./admin-data";

const now = "2026-05-21T04:00:00.000Z";

export type SettingsChannelsData = {
  mode: DataMode;
  channels: SettingsChannelAccount[];
};

export type SettingsTeamData = {
  mode: DataMode;
  members: SettingsTeamMember[];
  slaPolicies: SettingsSlaPolicy[];
  cannedReplies: SettingsCannedReply[];
};

export type SettingsProviderReadinessData = {
  mode: DataMode;
  providerReadiness: ProviderReadiness;
};

export type SettingsProviderWebhookEventsData = {
  mode: DataMode;
  events: ProviderWebhookEvent[];
};

export type SettingsProviderWebhookUnmatchedInboundData = {
  mode: DataMode;
  items: ProviderWebhookUnmatchedInboundItem[];
  pagination: ProviderWebhookUnmatchedInboundPage["pagination"];
  appliedFilters: ProviderWebhookUnmatchedInboundPage["appliedFilters"];
  appliedSort: ProviderWebhookUnmatchedInboundPage["appliedSort"];
  summary: ProviderWebhookUnmatchedInboundPage["summary"];
  externalCalls: 0;
};

export type SettingsProviderWebhookCandidateData = {
  mode: DataMode;
  candidates: ProviderWebhookCandidateConversation[];
};

export const mockSettingsChannels: SettingsChannelAccount[] = [
  channel("00000000-0000-4000-8000-000000000020", "webchat", "Main Website", "demo-webchat", "https://example.local/webhooks/webchat/demo-webchat", "not configured", false),
  channel("00000000-0000-4000-8000-000000000022", "line", "LINE OA Main", null, "https://example.local/webhooks/line/00000000-0000-4000-8000-000000000022", "configured", true),
  channel("00000000-0000-4000-8000-000000000021", "telegram", "Bot 007237", null, "https://example.local/webhooks/telegram/00000000-0000-4000-8000-000000000021", "not configured", false),
  channel("00000000-0000-4000-8000-000000000023", "facebook", "Page หลัก", null, "https://example.local/webhooks/facebook/00000000-0000-4000-8000-000000000023", "demo/mock", false),
  channel("00000000-0000-4000-8000-000000000024", "instagram", "IG ร้านค้า", null, "https://example.local/webhooks/instagram/00000000-0000-4000-8000-000000000024", "demo/mock", false)
];

export async function loadSettingsChannelsData(mode: DataMode): Promise<SettingsChannelsData> {
  if (mode === "api") {
    return {
      mode,
      channels: await getSettingsChannels()
    };
  }
  return {
    mode,
    channels: mockSettingsChannels
  };
}

export async function loadSettingsProviderReadinessData(mode: DataMode): Promise<SettingsProviderReadinessData> {
  if (mode === "api") {
    return {
      mode,
      providerReadiness: await getProviderReadiness()
    };
  }

  return {
    mode,
    providerReadiness: mockProviderReadiness
  };
}

export async function loadSettingsProviderWebhookEventsData(mode: DataMode): Promise<SettingsProviderWebhookEventsData> {
  if (mode === "api") {
    return {
      mode,
      events: await getProviderWebhookEvents()
    };
  }

  return {
    mode,
    events: mockProviderWebhookEvents
  };
}

export async function loadSettingsProviderWebhookUnmatchedInboundData(mode: DataMode, filters: ProviderWebhookUnmatchedInboundFilters = {}): Promise<SettingsProviderWebhookUnmatchedInboundData> {
  if (mode === "api") {
    const page = await getProviderWebhookUnmatchedInbound(filters);
    return {
      mode,
      ...page
    };
  }

  const page = createMockUnmatchedInboundPage(filters);
  return {
    mode,
    ...page
  };
}

export async function loadSettingsProviderWebhookCandidateData(mode: DataMode, unmatchedInboundId: string): Promise<SettingsProviderWebhookCandidateData> {
  if (mode === "api") {
    return {
      mode,
      candidates: await getProviderWebhookUnmatchedInboundCandidates(unmatchedInboundId)
    };
  }

  return {
    mode,
    candidates: mockProviderWebhookCandidatesByUnmatchedId[unmatchedInboundId] ?? []
  };
}

export async function createSettingsProviderWebhookSandboxEvent(mode: DataMode, payload: ProviderWebhookSandboxEventRequest): Promise<ProviderWebhookEvent> {
  if (mode === "api") {
    return createProviderWebhookSandboxEvent(payload);
  }

  const event = createMockProviderWebhookEvent(payload);
  mockProviderWebhookEvents = [event, ...mockProviderWebhookEvents].slice(0, 25);
  return event;
}

export async function reviewSettingsProviderWebhookUnmatchedInbound(
  mode: DataMode,
  unmatchedInboundId: string,
  payload: ProviderWebhookUnmatchedInboundReviewRequest
): Promise<ProviderWebhookUnmatchedInboundItem> {
  if (mode === "api") {
    return reviewProviderWebhookUnmatchedInbound(unmatchedInboundId, payload);
  }

  const item = mockProviderWebhookUnmatchedInbound.find((candidate) => candidate.id === unmatchedInboundId);
  if (!item) throw new Error("Unmatched inbound item not found");
  if (item.unmatchedStatus === payload.status && item.reviewStatus === payload.status) {
    return item;
  }
  const nowIso = new Date().toISOString();
  item.unmatchedStatus = payload.status;
  item.reviewStatus = payload.status;
  item.reviewedAt = nowIso;
  item.reviewedBy = "system";
  item.reviewReason = safeMockReason(payload.reason);
  item.unmatchedResolvedAt = nowIso;
  item.externalCalls = 0;
  mockProviderReadiness.latestUnmatchedReviewActionStatus = payload.status;
  mockProviderReadiness.latestUnmatchedInboundStatus = payload.status;
  refreshMockUnmatchedCounts();
  return item;
}

export async function bulkReviewSettingsProviderWebhookUnmatchedInbound(
  mode: DataMode,
  payload: ProviderWebhookUnmatchedInboundBulkReviewRequest
): Promise<ProviderWebhookUnmatchedInboundBulkReviewResponse> {
  if (mode === "api") {
    return bulkReviewProviderWebhookUnmatchedInbound(payload);
  }

  const uniqueIds = Array.from(new Set(payload.ids.map((id) => id.trim()).filter(Boolean)));
  if (uniqueIds.length === 0) throw new Error("Invalid unmatched inbound bulk review request");
  if (payload.ids.length > 50) throw new Error("Invalid unmatched inbound bulk review request");

  const results: ProviderWebhookUnmatchedInboundBulkReviewResponse["results"] = [];
  for (const id of uniqueIds) {
    const item = mockProviderWebhookUnmatchedInbound.find((candidate) => candidate.id === id);
    if (!item) {
      results.push({ id, ok: false, resultStatus: "not-found", reviewStatus: null, unmatchedStatus: null, error: "Unmatched inbound item not found", externalCalls: 0 });
      continue;
    }
    if (item.unmatchedStatus === payload.reviewStatus && item.reviewStatus === payload.reviewStatus) {
      results.push({ id, ok: true, resultStatus: "already-applied", reviewStatus: payload.reviewStatus, unmatchedStatus: item.unmatchedStatus, error: null, externalCalls: 0 });
      continue;
    }
    if (item.unmatchedStatus !== "open" && item.unmatchedStatus !== "review-needed") {
      results.push({
        id,
        ok: false,
        resultStatus: "conflict",
        reviewStatus: item.reviewStatus === "reviewed" || item.reviewStatus === "skipped" ? item.reviewStatus : null,
        unmatchedStatus: item.unmatchedStatus,
        error: "Unmatched inbound item is already resolved",
        externalCalls: 0
      });
      continue;
    }
    const nowIso = new Date().toISOString();
    item.unmatchedStatus = payload.reviewStatus;
    item.reviewStatus = payload.reviewStatus;
    item.reviewedAt = nowIso;
    item.reviewedBy = "system";
    item.reviewReason = safeMockReason(payload.reason);
    item.unmatchedResolvedAt = nowIso;
    item.externalCalls = 0;
    results.push({ id, ok: true, resultStatus: "updated", reviewStatus: payload.reviewStatus, unmatchedStatus: item.unmatchedStatus, error: null, externalCalls: 0 });
  }

  mockProviderReadiness.latestUnmatchedReviewActionStatus = payload.reviewStatus;
  mockProviderReadiness.latestUnmatchedInboundStatus = payload.reviewStatus;
  refreshMockUnmatchedCounts();
  return {
    reviewStatus: payload.reviewStatus,
    results,
    summary: {
      requestedCount: payload.ids.length,
      dedupedCount: uniqueIds.length,
      successCount: results.filter((result) => result.ok).length,
      errorCount: results.filter((result) => !result.ok).length,
      updatedCount: results.filter((result) => result.resultStatus === "updated").length,
      alreadyAppliedCount: results.filter((result) => result.resultStatus === "already-applied").length
    },
    externalCalls: 0
  };
}

export async function linkSettingsProviderWebhookUnmatchedInboundConversation(
  mode: DataMode,
  unmatchedInboundId: string,
  payload: ProviderWebhookUnmatchedInboundLinkRequest
): Promise<ProviderWebhookUnmatchedInboundItem> {
  if (mode === "api") {
    return linkProviderWebhookUnmatchedInboundConversation(unmatchedInboundId, payload);
  }

  const item = mockProviderWebhookUnmatchedInbound.find((candidate) => candidate.id === unmatchedInboundId);
  if (!item) throw new Error("Unmatched inbound item not found");
  const nowIso = new Date().toISOString();
  item.unmatchedStatus = "linked";
  item.reviewStatus = "linked";
  item.linkStatus = payload.actionMode === "link-and-persist-safe-message" ? "linked-message-persisted" : "linked";
  item.linkedConversationId = payload.conversationId;
  item.linkedMessageId = payload.actionMode === "link-and-persist-safe-message" ? "message-local-linked" : null;
  item.messagePersisted = payload.actionMode === "link-and-persist-safe-message";
  item.unmatchedResolvedAt = nowIso;
  item.externalCalls = 0;
  mockProviderReadiness.latestUnmatchedLinkStatus = item.linkStatus;
  mockProviderReadiness.latestUnmatchedInboundStatus = "linked";
  refreshMockUnmatchedCounts();
  return item;
}

export async function loadSettingsTeamData(mode: DataMode): Promise<SettingsTeamData> {
  if (mode === "api") {
    const [members, slaPolicies, cannedReplies] = await Promise.all([
      getSettingsTeam(),
      getSettingsSlaPolicies(),
      getSettingsCannedReplies()
    ]);
    return {
      mode,
      members,
      slaPolicies,
      cannedReplies
    };
  }

  const store = createDefaultAdminStore();
  return {
    mode,
    members: store.agents.map((agent) => ({
      id: agent.id,
      name: agent.name,
      displayName: agent.name,
      email: agent.email,
      role: agent.role,
      status: agent.status,
      skills: agent.assignedRoomIds,
      maxConcurrentChats: agent.maxActiveConversations,
      createdAt: now,
      updatedAt: now
    })),
    slaPolicies: mockSlaPolicies.map((policy) => ({
      id: policy.id,
      name: policy.name,
      description: "",
      status: "active",
      priorityScope: policy.appliesToPriority,
      firstResponseMinutes: policy.firstResponseMinutes,
      resolutionMinutes: policy.resolutionHours * 60,
      businessHoursMode: "always",
      escalationRole: "supervisor",
      createdAt: now,
      updatedAt: now
    })),
    cannedReplies: mockCannedReplies.map((reply) => ({
      id: reply.id,
      title: reply.title,
      category: reply.category,
      shortcut: reply.shortcut,
      bodyTemplate: reply.body,
      tags: reply.tags,
      platformScope: [],
      roomScope: [],
      status: reply.isActive ? "active" : "inactive",
      createdAt: now,
      updatedAt: now
    }))
  };
}

export function mapSettingsCannedReplyToCannedReply(reply: SettingsCannedReply): CannedReply {
  return {
    id: reply.id,
    title: reply.title,
    shortcut: reply.shortcut,
    body: reply.bodyTemplate,
    tags: reply.tags,
    category: reply.category,
    isActive: reply.status === "active"
  };
}

export function searchCannedReplyList(replies: CannedReply[], query: string, category = "all", tag = "all") {
  const normalized = query.trim().toLowerCase();
  return replies.filter((reply) => {
    if (!reply.isActive) return false;
    if (category !== "all" && reply.category !== category) return false;
    if (tag !== "all" && !reply.tags.includes(tag)) return false;
    if (!normalized) return true;
    return [reply.title, reply.shortcut, reply.body, reply.category, ...reply.tags].some((value) => value.toLowerCase().includes(normalized));
  });
}

export function findCannedReplyInList(replies: CannedReply[], slashCommand: string) {
  const command = slashCommand.trim().split(/\s+/)[0]?.toLowerCase();
  return replies.find((reply) => reply.isActive && reply.shortcut.toLowerCase() === command) ?? null;
}

export function getCannedRepliesForMode(mode: DataMode, apiReplies: CannedReply[], localReplies: CannedReply[]) {
  return mode === "api" ? apiReplies : localReplies;
}

export function resolveCannedReplyComposerDraft(replies: CannedReply[], replyId: string) {
  const reply = replies.find((item) => item.id === replyId && item.isActive);
  return reply
    ? {
        replyId: reply.id,
        shortcut: reply.shortcut,
        body: reply.body
      }
    : null;
}

function channel(
  id: string,
  platform: SettingsChannelAccount["platform"],
  accountName: string,
  accountKey: string | null,
  webhookUrl: string,
  secretState: string,
  secretConfigured: boolean
): SettingsChannelAccount {
  return {
    id,
    platform,
    accountName,
    accountKey,
    status: "demo/mock",
    webhookUrl,
    createdAt: now,
    updatedAt: now,
    lastInboundAt: null,
    lastMessageAt: null,
    hasAccessToken: false,
    tokenMasked: null,
    secretConfigured,
    secretMasked: secretConfigured ? `masked:${secretState}` : null
  };
}

function createMockUnmatchedInboundPage(filters: ProviderWebhookUnmatchedInboundFilters): Omit<SettingsProviderWebhookUnmatchedInboundData, "mode"> {
  const limit = filters.limit ?? 10;
  const offset = filters.offset ?? 0;
  const sortBy = filters.sortBy ?? "receivedAt";
  const sortOrder = filters.sortOrder ?? "desc";
  const filtered = filterMockUnmatchedInbound(filters);
  const sorted = [...filtered].sort((left, right) => {
    const compared = left.receivedAt.localeCompare(right.receivedAt);
    return sortOrder === "asc" ? compared : -compared;
  });
  const items = sorted.slice(offset, offset + limit);
  return {
    items,
    pagination: {
      totalCount: filtered.length,
      limit,
      offset,
      returnedCount: items.length,
      hasNextPage: offset + limit < filtered.length,
      hasPreviousPage: offset > 0
    },
    appliedFilters: {
      ...filters,
      limit,
      offset,
      sortBy,
      sortOrder
    },
    appliedSort: {
      sortBy,
      sortOrder
    },
    summary: summarizeMockUnmatchedInbound(filtered),
    externalCalls: 0
  };
}

function filterMockUnmatchedInbound(filters: ProviderWebhookUnmatchedInboundFilters) {
  const receivedFrom = filters.receivedAtFrom ?? filters.receivedFrom;
  const receivedTo = filters.receivedAtTo ?? filters.receivedTo;
  return mockProviderWebhookUnmatchedInbound.filter((item) => {
    if (filters.status === "open" && item.unmatchedStatus !== "open" && item.unmatchedStatus !== "review-needed") return false;
    if (filters.status && filters.status !== "open" && item.unmatchedStatus !== filters.status) return false;
    if (filters.provider && item.provider !== filters.provider) return false;
    if (filters.reviewStatus && item.reviewStatus !== filters.reviewStatus) return false;
    if (filters.linkStatus && item.linkStatus !== filters.linkStatus) return false;
    if (filters.unmatchedStatus && item.unmatchedStatus !== filters.unmatchedStatus) return false;
    if (filters.eventType && item.eventType !== filters.eventType) return false;
    if (receivedFrom && item.receivedAt < new Date(receivedFrom).toISOString()) return false;
    if (receivedTo && item.receivedAt > new Date(receivedTo).toISOString()) return false;
    return true;
  });
}

function summarizeMockUnmatchedInbound(items: ProviderWebhookUnmatchedInboundItem[]) {
  return {
    openCount: items.filter((item) => item.unmatchedStatus === "open" || item.unmatchedStatus === "review-needed").length,
    reviewedCount: items.filter((item) => item.reviewStatus === "reviewed").length,
    skippedCount: items.filter((item) => item.reviewStatus === "skipped").length,
    linkedCount: items.filter((item) => item.reviewStatus === "linked").length
  };
}

function refreshMockUnmatchedCounts() {
  const summary = summarizeMockUnmatchedInbound(mockProviderWebhookUnmatchedInbound);
  mockProviderReadiness.unmatchedInboundOpenCount = summary.openCount;
  mockProviderReadiness.unmatchedInboundReviewedCount = summary.reviewedCount;
  mockProviderReadiness.unmatchedInboundSkippedCount = summary.skippedCount;
  mockProviderReadiness.unmatchedInboundLinkedCount = summary.linkedCount;
}

export const mockProviderReadiness: ProviderReadiness = {
  mode: "disabled",
  outboundEnabledByEnv: false,
  sandboxMode: "disabled",
  sandboxEnabled: false,
  channelMode: "mock",
  metaChannelMode: "mock",
  realOutboundEnabled: false,
  allowlistCount: 0,
  allowlist: {
    configured: false,
    entryCount: 0
  },
  webhookSignatureVerificationConfigured: true,
  webhookSignatureVerificationReady: true,
  replayGuardrailsEnabled: true,
  lastSandboxEventSignatureStatus: "verified",
  latestReplayStatus: "fresh",
  replayDetectedCount: 0,
  webhookNormalizationEnabled: true,
  webhookDryRunRoutingEnabled: true,
  lastSandboxEventNormalizationStatus: "normalized",
  latestRoutingStatus: "dry-run-only",
  normalizedEventCount: 1,
  routingBlockedCount: 0,
  webhookInboundPersistenceEnabled: true,
  latestInboundPersistenceStatus: "dry-run-only",
  persistedInboundMessageCount: 0,
  inboundPersistenceBlockedCount: 0,
  inboundPersistenceReplayBlockedCount: 0,
  inboundPersistenceSkippedNoMatchCount: 0,
  webhookUnmatchedInboundReviewEnabled: true,
  webhookUnmatchedReviewActionsEnabled: true,
  webhookCandidateLookupEnabled: true,
  unmatchedInboundOpenCount: 1,
  unmatchedInboundQueuedCount: 1,
  unmatchedInboundReplayBlockedCount: 0,
  unmatchedInboundReviewedCount: 0,
  unmatchedInboundSkippedCount: 0,
  unmatchedInboundLinkedCount: 0,
  latestUnmatchedInboundStatus: "review-needed",
  latestUnmatchedReviewActionStatus: null,
  latestUnmatchedLinkStatus: null,
  lastSandboxEventAt: now,
  externalCalls: 0,
  providers: [
    provider("line", false, false, 0),
    provider("telegram", false, false, 0),
    provider("facebook", false, false, 0),
    provider("instagram", false, false, 0)
  ]
};

export let mockProviderWebhookEvents: ProviderWebhookEvent[] = [
  {
    id: "provider-webhook-event-local-1",
    tenantId: "00000000-0000-4000-8000-000000000001",
    provider: "line",
    channel: "line",
    eventType: "message.created",
    mode: "dry_run",
    status: "received",
    receivedAt: now,
    payloadSummary: "Dry-run object payload accepted with 2 safe fields.",
    payloadFieldCount: 2,
    payloadDigest: "sha256:localdryrunsample",
    signatureVerified: true,
    signatureStatus: "verified",
    signatureAlgorithm: "hmac-sha256",
    signatureFingerprint: "sha256:localsignature",
    signedAt: now,
    replayDetected: false,
    replayStatus: "fresh",
    dedupKeyDigest: "sha256:localdedupsample",
    previousEventSeenAt: null,
    normalized: true,
    normalizationStatus: "normalized",
    normalizedEventType: "message",
    direction: "inbound",
    messageType: "text",
    textPreview: "Local dry-run message",
    textLength: 21,
    mediaSummary: null,
    senderKeyDigest: "sha256:localsenderdigest",
    roomKeyDigest: "sha256:localroomdigest",
    dryRunRouting: true,
    routingStatus: "dry-run-only",
    conversationLookupStatus: "not-found",
    conversationKeyDigest: "sha256:localconversationdigest",
    channelAccountId: "sandbox:line",
    roomIdDigest: "sha256:localroomiddigest",
    inboundPersistenceMode: "dry-run",
    inboundPersistenceStatus: "dry-run-only",
    messagePersisted: false,
    persistedMessageId: null,
    conversationId: null,
    unmatchedInboundQueued: true,
    unmatchedInboundId: "provider-webhook-unmatched-local-1",
    unmatchedStatus: "review-needed",
    unmatchedReason: "safe-review-required-no-conversation-match",
    unmatchedReviewActionStatus: "none",
    unmatchedLinkStatus: "none",
    linkedConversationId: null,
    linkedMessageId: null,
    unmatchedResolvedAt: null,
    inboundAuditStatus: "recorded",
    externalCalls: 0
  }
];

export let mockProviderWebhookUnmatchedInbound: ProviderWebhookUnmatchedInboundItem[] = [
  {
    id: "provider-webhook-unmatched-local-1",
    tenantId: "00000000-0000-4000-8000-000000000001",
    provider: "line",
    channelAccountId: "sandbox:line",
    mode: "sandbox",
    eventType: "message.created",
    normalizedEventType: "message",
    messageType: "text",
    normalizationStatus: "normalized",
    routingStatus: "dry-run-only",
    conversationLookupStatus: "not-found",
    unmatchedStatus: "review-needed",
    unmatchedReason: "safe-review-required-no-conversation-match",
    reviewStatus: "pending",
    reviewedAt: null,
    reviewedBy: null,
    reviewReason: null,
    linkStatus: "none",
    linkedConversationId: null,
    linkedMessageId: null,
    unmatchedResolvedAt: null,
    messagePersisted: false,
    payloadDigest: "sha256:localdryrunsample",
    providerEventDigest: "sha256:localdedupsample",
    deliveryDigest: "sha256:localdedupsample",
    senderKeyDigest: "sha256:localsenderdigest",
    roomKeyDigest: "sha256:localroomdigest",
    textPreview: "Local dry-run message",
    textLength: 21,
    receivedAt: now,
    externalCalls: 0
  }
];

export const mockProviderWebhookCandidatesByUnmatchedId: Record<string, ProviderWebhookCandidateConversation[]> = {
  "provider-webhook-unmatched-local-1": [
    {
      conversationId: "conversation-local-safe-1",
      platform: "line",
      channelAccountId: "sandbox:line",
      roomIdDigest: "sha256:localroomdigest",
      safeRoomLabel: "line conversation digest match",
      latestMessagePreview: "Local safe candidate preview",
      latestMessageAt: now,
      matchReason: "platform, channel account, and room digest match",
      matchConfidence: 0.98,
      externalCalls: 0
    }
  ]
};

const mockWebhookDedupSeenAt = new Map<string, string>([["sha256:localdedupsample", now]]);

function provider(
  name: ProviderReadiness["providers"][number]["name"],
  configured: boolean,
  webhookConfigured: boolean,
  _allowlistCount: number
): ProviderReadiness["providers"][number] {
  return {
    name,
    configured,
    credentialStatus: configured ? "configured" : "not_configured",
    webhookStatus: webhookConfigured ? "configured" : "not_configured",
    webhookVerificationReady: webhookConfigured,
    webhookVerificationConfigured: webhookConfigured,
    outboundEnabled: false,
    status: "disabled_by_default"
  };
}

function createMockProviderWebhookEvent(payload: ProviderWebhookSandboxEventRequest): ProviderWebhookEvent {
  const providerName = payload.provider;
  const dedupKeyDigest = payload.eventId || payload.deliveryId
    ? `sha256:${safeDigest(["mock", providerName, payload.channel ?? providerName, payload.eventId ?? payload.deliveryId].join(":"))}`
    : null;
  const previousEventSeenAt = dedupKeyDigest ? mockWebhookDedupSeenAt.get(dedupKeyDigest) ?? null : null;
  const receivedAt = new Date().toISOString();
  if (dedupKeyDigest && !previousEventSeenAt) {
    mockWebhookDedupSeenAt.set(dedupKeyDigest, receivedAt);
  }
  const signatureStatus = payload.signature ? "verified" : "missing";
  const normalized = signatureStatus === "verified" && !previousEventSeenAt;
  const routingBlocked = signatureStatus !== "verified" || Boolean(previousEventSeenAt);
  const unmatchedInboundQueued = normalized && !routingBlocked;
  const unmatchedStatus = previousEventSeenAt ? "duplicate-skipped" : signatureStatus !== "verified" ? "blocked" : unmatchedInboundQueued ? "review-needed" : null;
  return {
    id: `provider-webhook-event-local-${safeId()}`,
    tenantId: "00000000-0000-4000-8000-000000000001",
    provider: providerName,
    channel: payload.channel ?? providerName,
    eventType: payload.eventType,
    mode: payload.mode ?? "dry_run",
    status: payload.status ?? "received",
    receivedAt,
    payloadSummary: "Dry-run object payload accepted with 2 safe fields.",
    payloadFieldCount: 2,
    payloadDigest: `sha256:${safeId().slice(0, 16)}`,
    signatureVerified: signatureStatus === "verified",
    signatureStatus,
    signatureAlgorithm: "hmac-sha256",
    signatureFingerprint: payload.signature ? `sha256:${safeDigest(`signature:${payload.signature}`)}` : null,
    signedAt: payload.timestamp ?? null,
    replayDetected: Boolean(previousEventSeenAt),
    replayStatus: previousEventSeenAt ? "duplicate" : "fresh",
    dedupKeyDigest,
    previousEventSeenAt,
    normalized,
    normalizationStatus: signatureStatus !== "verified" ? "skipped" : previousEventSeenAt ? "blocked-replay" : "normalized",
    normalizedEventType: normalized ? "message" : "unknown",
    direction: "inbound",
    messageType: normalized ? "text" : "unknown",
    textPreview: normalized ? "Local dry-run message" : null,
    textLength: normalized ? 21 : null,
    mediaSummary: null,
    senderKeyDigest: normalized ? `sha256:${safeDigest(`sender:${providerName}`)}` : null,
    roomKeyDigest: normalized ? `sha256:${safeDigest(`room:${providerName}`)}` : null,
    dryRunRouting: normalized,
    routingStatus: signatureStatus !== "verified" ? "skipped" : previousEventSeenAt ? "blocked-replay" : "dry-run-only",
    conversationLookupStatus: routingBlocked ? "skipped" : "not-found",
    conversationKeyDigest: normalized ? `sha256:${safeDigest(`conversation:${providerName}`)}` : null,
    channelAccountId: normalized ? `sandbox:${payload.channel ?? providerName}` : null,
    roomIdDigest: normalized ? `sha256:${safeDigest(`room-id:${providerName}`)}` : null,
    inboundPersistenceMode: payload.inboundPersistenceMode ?? "dry-run",
    inboundPersistenceStatus: payload.inboundPersistenceMode === "sandbox-persist"
      ? normalized && !routingBlocked ? "skipped-no-match" : previousEventSeenAt ? "blocked-replay" : signatureStatus === "verified" ? "skipped" : "blocked-signature"
      : "dry-run-only",
    messagePersisted: false,
    persistedMessageId: null,
    conversationId: null,
    unmatchedInboundQueued,
    unmatchedInboundId: unmatchedInboundQueued ? `provider-webhook-unmatched-local-${safeId()}` : previousEventSeenAt ? "provider-webhook-unmatched-local-1" : null,
    unmatchedStatus,
    unmatchedReason: previousEventSeenAt ? "blocked-replay" : signatureStatus !== "verified" ? "blocked-signature" : unmatchedInboundQueued ? "safe-review-required-no-conversation-match" : null,
    unmatchedReviewActionStatus: "none",
    unmatchedLinkStatus: "none",
    linkedConversationId: null,
    linkedMessageId: null,
    unmatchedResolvedAt: null,
    inboundAuditStatus: "recorded",
    externalCalls: 0
  };
}

function safeId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function safeDigest(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash).toString(16).padStart(8, "0").slice(0, 16);
}

function safeMockReason(value: string | undefined) {
  const trimmed = value?.replace(/\s+/g, " ").trim();
  if (!trimmed || /token|secret|authorization|cookie|replyToken|Bearer\s+/i.test(trimmed)) return null;
  return trimmed.length > 120 ? `${trimmed.slice(0, 117)}...` : trimmed;
}
