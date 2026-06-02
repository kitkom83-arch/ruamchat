import React from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { ProviderReadiness, ProviderWebhookCandidateConversation, ProviderWebhookEvent, ProviderWebhookUnmatchedInboundExport, ProviderWebhookUnmatchedInboundHistory, ProviderWebhookUnmatchedInboundItem } from "@ai-omni/shared";
import { ProviderReadinessPanel } from "./provider-readiness-panel";

describe("ProviderReadinessPanel", () => {
  it("renders provider readiness status safely without secrets or allowlist values", () => {
    const html = renderToString(React.createElement(ProviderReadinessPanel, {
      readiness: providerReadiness(),
      loading: false,
      error: "",
      webhookEvents: [providerWebhookEvent()],
      unmatchedInboundItems: [providerWebhookUnmatchedInboundItem()],
      unmatchedPagination: {
        totalCount: 12,
        limit: 5,
        offset: 5,
        returnedCount: 1,
        hasNextPage: true,
        hasPreviousPage: true
      },
      unmatchedAppliedSort: {
        sortBy: "receivedAt",
        sortOrder: "asc"
      },
      unmatchedPageSummary: {
        openCount: 4,
        reviewedCount: 3,
        skippedCount: 2,
        linkedCount: 1
      },
      candidateItemsById: { "provider-webhook-unmatched-1": [providerWebhookCandidateConversation()] },
      activeHistoryId: "provider-webhook-unmatched-1",
      activeHistory: providerWebhookHistory(),
      unmatchedExportResult: providerWebhookExport(),
      unmatchedActionStatus: "Unmatched inbound provider-webhook-unmatched-1 reviewed; externalCalls=0"
    }));

    expect(html).toContain("Provider sandbox readiness");
    expect(html).toContain("provider mode: disabled");
    expect(html).toContain("sandbox mode: disabled");
    expect(html).toContain("realOutboundEnabled=false");
    expect(html).toContain("externalCalls=0");
    expect(html).toContain("allowlist count=2");
    expect(html).toContain("signature verification=sandbox-ready");
    expect(html).toContain("replay guardrails=enabled");
    expect(html).toContain("normalization=enabled");
    expect(html).toContain("dryRunRouting=enabled");
    expect(html).toContain("latest signature=verified");
    expect(html).toContain("latest replay=fresh");
    expect(html).toContain("latest normalization=normalized");
    expect(html).toContain("latest routing=dry-run-only");
    expect(html).toContain("normalizedEventCount=3");
    expect(html).toContain("routingBlockedCount=1");
    expect(html).toContain("inbound persistence=enabled");
    expect(html).toContain("latest inbound persistence=blocked-replay");
    expect(html).toContain("persistedInboundMessageCount=1");
    expect(html).toContain("inboundPersistenceBlockedCount=1");
    expect(html).toContain("inboundPersistenceReplayBlockedCount=1");
    expect(html).toContain("inboundPersistenceSkippedNoMatchCount=1");
    expect(html).toContain("unmatched inbound review=enabled");
    expect(html).toContain("review actions=enabled");
    expect(html).toContain("candidate lookup=enabled");
    expect(html).toContain("history audit=enabled");
    expect(html).toContain("queue export=enabled");
    expect(html).toContain("export max limit=500");
    expect(html).toContain("open unmatched count=1");
    expect(html).toContain("unmatched queued count=2");
    expect(html).toContain("unmatched replay blocked count=1");
    expect(html).toContain("reviewed unmatched count=1");
    expect(html).toContain("skipped unmatched count=1");
    expect(html).toContain("linked unmatched count=1");
    expect(html).toContain("latest unmatched status=review-needed");
    expect(html).toContain("latest review action status=reviewed");
    expect(html).toContain("latest link status=linked");
    expect(html).toContain("replayDetectedCount=1");
    expect(html).toContain("LINE");
    expect(html).toContain("Telegram");
    expect(html).toContain("Webhook verification");
    expect(html).toContain("Webhook sandbox event log");
    expect(html).toContain("last received dry-run event");
    expect(html).toContain("message.created / received");
    expect(html).toContain("signature=verified");
    expect(html).toContain("replay=duplicate");
    expect(html).toContain("normalization=blocked-replay");
    expect(html).toContain("normalizedEventType=unknown");
    expect(html).toContain("messageType=unknown");
    expect(html).toContain("routing=blocked-replay");
    expect(html).toContain("lookup=skipped");
    expect(html).toContain("inboundPersistence=blocked-replay");
    expect(html).toContain("messagePersisted=false");
    expect(html).toContain("messageId=none");
    expect(html).toContain("unmatchedQueued=false");
    expect(html).toContain("unmatchedStatus=duplicate-skipped");
    expect(html).toContain("reviewActionStatus=none");
    expect(html).toContain("linkStatus=none");
    expect(html).toContain("unmatchedReason=blocked-replay");
    expect(html).toContain("unmatchedId=provider-webhook-unmatched-1");
    expect(html).toContain("Unmatched inbound review");
    expect(html).toContain("Provider filter");
    expect(html).toContain("Review status");
    expect(html).toContain("Link status");
    expect(html).toContain("Queue status");
    expect(html).toContain("Unmatched status");
    expect(html).toContain("Event type");
    expect(html).toContain("Received from");
    expect(html).toContain("Received to");
    expect(html).toContain("Page size");
    expect(html).toContain("Sort order");
    expect(html).toContain("receivedAt oldest first");
    expect(html).toContain("Previous");
    expect(html).toContain("Next");
    expect(html).toContain("Select all visible");
    expect(html).toContain("Clear selection");
    expect(html).toContain("Bulk Mark reviewed");
    expect(html).toContain("Bulk Skip");
    expect(html).toContain("Export current filtered queue");
    expect(html).toContain("Export CSV");
    expect(html).toContain("Export json: exportedCount=1; exportMaxLimit=500; externalCalls=0");
    expect(html).toContain("visible unmatched count=1");
    expect(html).toContain("total unmatched count=12");
    expect(html).toContain("page size=5");
    expect(html).toContain("page offset=5");
    expect(html).toContain("applied sort=receivedAt asc");
    expect(html).toContain("selected count=0");
    expect(html).toContain("filtered open count=4");
    expect(html).toContain("visible open count=1");
    expect(html).toContain("LINE unmatched inbound");
    expect(html).toContain("safe-review-required-no-conversation-match");
    expect(html).toContain("reviewStatus=pending");
    expect(html).toContain("Mark reviewed");
    expect(html).toContain("Skip");
    expect(html).toContain("Load candidates");
    expect(html).toContain("View history");
    expect(html).toContain("history entries=3");
    expect(html).toContain("inbound_received / received");
    expect(html).toContain("normalized_routed / normalized/dry-run-only");
    expect(html).toContain("unmatched_queued / review-needed");
    expect(html).toContain("safeRoomLabel=line room digest saferoomdige");
    expect(html).toContain("roomKeyDigest=sha256:saferoomdigest");
    expect(html).toContain("candidate count=1");
    expect(html).toContain("conversationId=conversation-safe-internal");
    expect(html).toContain("roomIdDigest=sha256:saferoomdigest");
    expect(html).toContain("matchReason=platform, channel account, and room digest match");
    expect(html).toContain("Link only");
    expect(html).toContain("Link + persist safe message");
    expect(html).toContain("reviewed; externalCalls=0");
    expect(html).toContain("payloadFieldCount=2");
    expect(html).toContain("payloadDigest=sha256:safeeventdigest");
    expect(html).toContain("signatureVerified=true");
    expect(html).toContain("replayDetected=true");
    expect(html).toContain("conversationKeyDigest=none");
    expect(html).toContain("roomIdDigest=none");
    expect(html).toContain("inboundAuditStatus=recorded");
    expect(html).toContain("configured");
    expect(html).not.toContain("U-raw-provider-test");
    expect(html).not.toContain("raw-line-token");
    expect(html).not.toContain("raw-line-token");
    expect(html).not.toMatch(/channel secret|webhook secret value|providerRaw|rawPayload|payloadJson|Bearer|sk-|authorization|cookie/i);
  });

  it("renders multi-select and disabled empty bulk actions safely", () => {
    const html = renderToString(React.createElement(ProviderReadinessPanel, {
      readiness: providerReadiness(),
      loading: false,
      error: "",
      unmatchedInboundItems: [providerWebhookUnmatchedInboundItem()],
      selectedUnmatchedIds: [],
      onUnmatchedSelectionChange: async () => undefined,
      onBulkReviewUnmatchedInbound: async () => undefined
    }));

    expect(html).toContain("Select all visible");
    expect(html).toContain("selected count=0");
    expect(html).toContain("Bulk Mark reviewed");
    expect(html).toContain("Bulk Skip");
    expect(html).toContain("disabled");
    expect(html).not.toMatch(/rawPayload|providerRaw|payloadJson|replyToken|raw sender|raw room/i);
  });

  it("renders safe per-item bulk results", () => {
    const html = renderToString(React.createElement(ProviderReadinessPanel, {
      readiness: providerReadiness(),
      loading: false,
      error: "",
      unmatchedInboundItems: [providerWebhookUnmatchedInboundItem()],
      selectedUnmatchedIds: ["provider-webhook-unmatched-1"],
      unmatchedBulkResult: providerWebhookBulkReviewResult()
    }));

    expect(html).toContain("provider-webhook-unmatched-1: updated");
    expect(html).toContain("reviewStatus=reviewed");
    expect(html).toContain("unmatchedStatus=reviewed");
    expect(html).toContain("externalCalls=0");
    expect(html).not.toMatch(/rawPayload|providerRaw|payloadJson|replyToken|raw sender|raw room/i);
  });

  it("renders an API error state without fake provider rows", () => {
    const html = renderToString(React.createElement(ProviderReadinessPanel, {
      readiness: null,
      loading: false,
      error: "Provider Readiness API error: Failed to fetch"
    }));

    expect(html).toContain("Provider Readiness API error: Failed to fetch");
    expect(html).not.toContain("Credential");
    expect(html).not.toContain("allowlist count=");
  });

  it("renders a webhook API error state without fake event rows", () => {
    const html = renderToString(React.createElement(ProviderReadinessPanel, {
      readiness: providerReadiness(),
      loading: false,
      error: "",
      webhookEvents: [],
      webhookEventsLoading: false,
      webhookEventsError: "Webhook Events API error: Failed to fetch",
      unmatchedInboundItems: [providerWebhookUnmatchedInboundItem()],
      unmatchedInboundLoading: false,
      unmatchedInboundError: "Unmatched Inbound API error: Failed to fetch",
      activeHistoryId: "provider-webhook-unmatched-1",
      historyErrorById: { "provider-webhook-unmatched-1": "History API error: Failed to fetch" },
      unmatchedExportError: "Unmatched Export API error: Failed to fetch"
    }));

    expect(html).toContain("Webhook Events API error: Failed to fetch");
    expect(html).toContain("Unmatched Inbound API error: Failed to fetch");
    expect(html).toContain("History API error: Failed to fetch");
    expect(html).toContain("Unmatched Export API error: Failed to fetch");
    expect(html).not.toContain("payloadFieldCount=");
    expect(html).not.toMatch(/rawPayload|providerRaw|payloadJson|Bearer|sk-/i);
  });
});

function providerReadiness(): ProviderReadiness {
  return {
    mode: "disabled",
    outboundEnabledByEnv: false,
    sandboxMode: "disabled",
    sandboxEnabled: false,
    channelMode: "mock",
    metaChannelMode: "mock",
    realOutboundEnabled: false,
    allowlistCount: 2,
    allowlist: {
      configured: true,
      entryCount: 2
    },
    webhookSignatureVerificationConfigured: true,
    webhookSignatureVerificationReady: true,
    replayGuardrailsEnabled: true,
    lastSandboxEventSignatureStatus: "verified",
    latestReplayStatus: "fresh",
    replayDetectedCount: 1,
    webhookNormalizationEnabled: true,
    webhookDryRunRoutingEnabled: true,
    lastSandboxEventNormalizationStatus: "normalized",
    latestRoutingStatus: "dry-run-only",
    normalizedEventCount: 3,
    routingBlockedCount: 1,
    webhookInboundPersistenceEnabled: true,
    latestInboundPersistenceStatus: "blocked-replay",
    persistedInboundMessageCount: 1,
    inboundPersistenceBlockedCount: 1,
    inboundPersistenceReplayBlockedCount: 1,
    inboundPersistenceSkippedNoMatchCount: 1,
    webhookUnmatchedInboundReviewEnabled: true,
    webhookUnmatchedReviewActionsEnabled: true,
    webhookCandidateLookupEnabled: true,
    webhookUnmatchedHistoryEnabled: true,
    webhookUnmatchedQueueExportEnabled: true,
    webhookUnmatchedQueueExportMaxLimit: 500,
    unmatchedInboundOpenCount: 1,
    unmatchedInboundQueuedCount: 2,
    unmatchedInboundReplayBlockedCount: 1,
    unmatchedInboundReviewedCount: 1,
    unmatchedInboundSkippedCount: 1,
    unmatchedInboundLinkedCount: 1,
    latestUnmatchedInboundStatus: "review-needed",
    latestUnmatchedReviewActionStatus: "reviewed",
    latestUnmatchedLinkStatus: "linked",
    lastSandboxEventAt: "2026-05-31T00:00:00.000Z",
    externalCalls: 0,
    providers: [
      provider("line", true, true, 1),
      provider("telegram", true, true, 1),
      provider("facebook", false, false, 0),
      provider("instagram", false, false, 0)
    ]
  };
}

function provider(name: ProviderReadiness["providers"][number]["name"], configured: boolean, webhookConfigured: boolean, allowlistCount: number) {
  void allowlistCount;
  return {
    name,
    configured,
    credentialStatus: configured ? "configured" as const : "not_configured" as const,
    webhookStatus: webhookConfigured ? "configured" as const : "not_configured" as const,
    webhookVerificationReady: webhookConfigured,
    webhookVerificationConfigured: webhookConfigured,
    outboundEnabled: false as const,
    status: "disabled_by_default" as const
  };
}

function providerWebhookEvent(): ProviderWebhookEvent {
  return {
    id: "provider-webhook-event-1",
    tenantId: "00000000-0000-4000-8000-000000000001",
    provider: "line",
    channel: "line",
    eventType: "message.created",
    mode: "dry_run",
    status: "received",
    receivedAt: "2026-05-31T00:00:00.000Z",
    payloadSummary: "Dry-run object payload accepted with 2 safe fields.",
    payloadFieldCount: 2,
    payloadDigest: "sha256:safeeventdigest",
    signatureVerified: true,
    signatureStatus: "verified",
    signatureAlgorithm: "hmac-sha256",
    signatureFingerprint: "sha256:safesignature",
    signedAt: "2026-05-31T00:00:00.000Z",
    replayDetected: true,
    replayStatus: "duplicate",
    dedupKeyDigest: "sha256:safededupdigest",
    previousEventSeenAt: "2026-05-30T23:59:00.000Z",
    normalized: false,
    normalizationStatus: "blocked-replay",
    normalizedEventType: "unknown",
    direction: "inbound",
    messageType: "unknown",
    textPreview: null,
    textLength: null,
    mediaSummary: null,
    senderKeyDigest: null,
    roomKeyDigest: null,
    dryRunRouting: true,
    routingStatus: "blocked-replay",
    conversationLookupStatus: "skipped",
    conversationKeyDigest: null,
    channelAccountId: null,
    roomIdDigest: null,
    inboundPersistenceMode: "sandbox-persist",
    inboundPersistenceStatus: "blocked-replay",
    messagePersisted: false,
    persistedMessageId: null,
    conversationId: null,
    unmatchedInboundQueued: false,
    unmatchedInboundId: "provider-webhook-unmatched-1",
    unmatchedStatus: "duplicate-skipped",
    unmatchedReason: "blocked-replay",
    unmatchedReviewActionStatus: "none",
    unmatchedLinkStatus: "none",
    linkedConversationId: null,
    linkedMessageId: null,
    unmatchedResolvedAt: null,
    inboundAuditStatus: "recorded",
    externalCalls: 0
  };
}

function providerWebhookUnmatchedInboundItem(): ProviderWebhookUnmatchedInboundItem {
  return {
    id: "provider-webhook-unmatched-1",
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
    payloadDigest: "sha256:safeeventdigest",
    providerEventDigest: "sha256:safededupdigest",
    deliveryDigest: "sha256:safededupdigest",
    senderKeyDigest: "sha256:safesenderdigest",
    roomKeyDigest: "sha256:saferoomdigest",
    textPreview: "Safe sandbox preview",
    textLength: 20,
    receivedAt: "2026-05-31T00:00:00.000Z",
    externalCalls: 0
  };
}

function providerWebhookHistory(): ProviderWebhookUnmatchedInboundHistory {
  return {
    unmatchedInboundId: "provider-webhook-unmatched-1",
    provider: "line",
    channelAccountId: "sandbox:line",
    safeRoomLabel: "line room digest saferoomdige",
    roomKeyDigest: "sha256:saferoomdigest",
    entries: [
      providerWebhookHistoryEntry("inbound_received", "received", null, "received"),
      providerWebhookHistoryEntry("normalized_routed", "normalized/dry-run-only", "received", "dry-run-only"),
      providerWebhookHistoryEntry("unmatched_queued", "review-needed", "dry-run-only", "review-needed")
    ],
    externalCalls: 0
  };
}

function providerWebhookHistoryEntry(
  action: ProviderWebhookUnmatchedInboundHistory["entries"][number]["action"],
  actionStatus: string,
  statusBefore: string | null,
  statusAfter: string | null
): ProviderWebhookUnmatchedInboundHistory["entries"][number] {
  return {
    id: `provider-webhook-history-${action}`,
    unmatchedInboundId: "provider-webhook-unmatched-1",
    provider: "line",
    channelAccountId: "sandbox:line",
    safeRoomLabel: "line room digest saferoomdige",
    roomKeyDigest: "sha256:saferoomdigest",
    eventType: "message.created",
    action,
    actionStatus,
    statusBefore,
    statusAfter,
    actor: "system",
    reason: "safe-review-required-no-conversation-match",
    message: "Safe history entry",
    linkedConversationId: null,
    linkedMessageId: null,
    receivedAt: "2026-05-31T00:00:00.000Z",
    actionAt: "2026-05-31T00:00:00.000Z",
    externalCalls: 0
  };
}

function providerWebhookExport(): ProviderWebhookUnmatchedInboundExport {
  return {
    format: "json",
    rows: [{
      id: "provider-webhook-unmatched-1",
      provider: "line",
      channelAccountId: "sandbox:line",
      safeRoomLabel: "line room digest saferoomdige",
      roomKeyDigest: "sha256:saferoomdigest",
      eventType: "message.created",
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      receivedAt: "2026-05-31T00:00:00.000Z",
      reviewedAt: null,
      linkedConversationId: null,
      candidateCount: 1,
      safeMessagePreview: "Safe sandbox preview",
      safeReason: "safe-review-required-no-conversation-match",
      safeResultSummary: "pending",
      externalCalls: 0
    }],
    csv: null,
    appliedFilters: {
      format: "json",
      limit: 10,
      offset: 0,
      sortBy: "receivedAt",
      sortOrder: "desc"
    },
    appliedSort: {
      sortBy: "receivedAt",
      sortOrder: "desc"
    },
    requestedLimit: 10,
    exportMaxLimit: 500,
    exportedCount: 1,
    externalCalls: 0
  };
}

function providerWebhookCandidateConversation(): ProviderWebhookCandidateConversation {
  return {
    conversationId: "conversation-safe-internal",
    platform: "line",
    channelAccountId: "sandbox:line",
    roomIdDigest: "sha256:saferoomdigest",
    safeRoomLabel: "line conversation digest match",
    latestMessagePreview: "Safe candidate preview",
    latestMessageAt: "2026-05-31T00:00:00.000Z",
    matchReason: "platform, channel account, and room digest match",
    matchConfidence: 0.98,
    externalCalls: 0
  };
}

function providerWebhookBulkReviewResult() {
  return {
    reviewStatus: "reviewed" as const,
    results: [
      {
        id: "provider-webhook-unmatched-1",
        ok: true,
        resultStatus: "updated" as const,
        reviewStatus: "reviewed" as const,
        unmatchedStatus: "reviewed" as const,
        error: null,
        externalCalls: 0 as const
      }
    ],
    summary: {
      requestedCount: 1,
      dedupedCount: 1,
      successCount: 1,
      errorCount: 0,
      updatedCount: 1,
      alreadyAppliedCount: 0
    },
    externalCalls: 0 as const
  };
}
