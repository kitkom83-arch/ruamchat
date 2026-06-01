import React from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { ProviderReadiness, ProviderWebhookEvent } from "@ai-omni/shared";
import { ProviderReadinessPanel } from "./provider-readiness-panel";

describe("ProviderReadinessPanel", () => {
  it("renders provider readiness status safely without secrets or allowlist values", () => {
    const html = renderToString(React.createElement(ProviderReadinessPanel, {
      readiness: providerReadiness(),
      loading: false,
      error: "",
      webhookEvents: [providerWebhookEvent()]
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
      webhookEventsError: "Webhook Events API error: Failed to fetch"
    }));

    expect(html).toContain("Webhook Events API error: Failed to fetch");
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
    inboundAuditStatus: "recorded",
    externalCalls: 0
  };
}
