import type {
  CannedReply,
  DataMode,
  ProviderReadiness,
  ProviderWebhookEvent,
  ProviderWebhookSandboxEventRequest,
  SettingsCannedReply,
  SettingsChannelAccount,
  SettingsSlaPolicy,
  SettingsTeamMember
} from "@ai-omni/shared";
import {
  createProviderWebhookSandboxEvent,
  getProviderReadiness,
  getProviderWebhookEvents,
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

export async function createSettingsProviderWebhookSandboxEvent(mode: DataMode, payload: ProviderWebhookSandboxEventRequest): Promise<ProviderWebhookEvent> {
  if (mode === "api") {
    return createProviderWebhookSandboxEvent(payload);
  }

  const event = createMockProviderWebhookEvent(payload);
  mockProviderWebhookEvents = [event, ...mockProviderWebhookEvents].slice(0, 25);
  return event;
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
    externalCalls: 0
  }
];

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
