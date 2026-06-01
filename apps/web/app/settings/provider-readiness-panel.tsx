import React, { useState } from "react";
import { RadioTower, Send, ShieldCheck } from "lucide-react";
import type { ProviderReadiness, ProviderReadinessProvider, ProviderWebhookEvent, ProviderWebhookEventType, ProviderWebhookSandboxEventRequest } from "@ai-omni/shared";

type ProviderReadinessPanelProps = {
  readiness: ProviderReadiness | null;
  loading: boolean;
  error: string;
  webhookEvents?: ProviderWebhookEvent[];
  webhookEventsLoading?: boolean;
  webhookEventsError?: string;
  webhookEventSaving?: boolean;
  onCreateSandboxEvent?: (payload: ProviderWebhookSandboxEventRequest) => Promise<void>;
};

const providers = ["line", "telegram", "facebook", "instagram"] as const;
type ProviderOption = (typeof providers)[number];
const eventTypes: ProviderWebhookEventType[] = ["message.created", "webhook.verified", "webhook.failed"];

export function ProviderReadinessPanel({
  readiness,
  loading,
  error,
  webhookEvents = [],
  webhookEventsLoading = false,
  webhookEventsError = "",
  webhookEventSaving = false,
  onCreateSandboxEvent
}: ProviderReadinessPanelProps) {
  const [provider, setProvider] = useState<ProviderOption>("line");
  const [eventType, setEventType] = useState<ProviderWebhookEventType>("message.created");
  const [eventId, setEventId] = useState("sandbox-event-001");
  const [deliveryId, setDeliveryId] = useState("");
  const [signature, setSignature] = useState("");
  const lastEvent = webhookEvents[0] ?? null;
  const replayDetectedCount = readiness?.replayDetectedCount ?? webhookEvents.filter((event) => event.replayDetected).length;

  async function submitSandboxEvent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onCreateSandboxEvent?.({
      provider,
      channel: provider,
      eventType,
      mode: "dry_run",
      status: eventType === "webhook.failed" ? "failed" : eventType === "webhook.verified" ? "verified" : "received",
      eventId: eventId.trim() || undefined,
      deliveryId: deliveryId.trim() || undefined,
      timestamp: new Date().toISOString(),
      signature: signature.trim() || undefined,
      payload: {
        sample: true,
        source: "settings-provider-readiness-panel"
      }
    });
    setSignature("");
  }

  return e("section", { className: "providerReadinessPanel", "aria-label": "Provider sandbox and webhook readiness" },
    e("div", { className: "providerReadinessHeader" },
      e("div", { className: "channelPanelTop" },
        e(ShieldCheck, { size: 20 }),
        e("div", null,
          e("h2", null, "Provider sandbox readiness"),
          e("p", null, "Safe configuration summary only. No token, secret, payload, or allowlist value is displayed.")
        )
      ),
      readiness ? e("div", { className: "providerReadinessSummary", "aria-label": "Provider readiness summary" },
        e("span", null, `provider mode: ${readiness.mode}`),
        e("span", null, `sandbox mode: ${readiness.sandboxMode}`),
        e("span", null, `realOutboundEnabled=${String(readiness.realOutboundEnabled)}`),
        e("span", null, `externalCalls=${readiness.externalCalls}`),
        e("span", null, `allowlist count=${readiness.allowlistCount}`),
        e("span", null, `signature verification=${readiness.webhookSignatureVerificationReady ? "sandbox-ready" : "not ready"}`),
        e("span", null, `replay guardrails=${readiness.replayGuardrailsEnabled ? "enabled" : "disabled"}`),
        e("span", null, `normalization=${readiness.webhookNormalizationEnabled ? "enabled" : "disabled"}`),
        e("span", null, `dryRunRouting=${readiness.webhookDryRunRoutingEnabled ? "enabled" : "disabled"}`),
        e("span", null, `latest signature=${readiness.lastSandboxEventSignatureStatus ?? "none"}`),
        e("span", null, `latest replay=${readiness.latestReplayStatus ?? "none"}`),
        e("span", null, `latest normalization=${readiness.lastSandboxEventNormalizationStatus ?? "none"}`),
        e("span", null, `latest routing=${readiness.latestRoutingStatus ?? "none"}`),
        e("span", null, `normalizedEventCount=${readiness.normalizedEventCount}`),
        e("span", null, `routingBlockedCount=${readiness.routingBlockedCount}`),
        e("span", null, `replayDetectedCount=${replayDetectedCount}`)
      ) : null
    ),
    error ? e("div", { className: "apiErrorBox compact", role: "alert" }, error) : null,
    loading ? e("div", { className: "apiLoadingBox compact" }, "Loading provider readiness...") : null,
    !loading && !error && !readiness ? e("div", { className: "providerEmptyState" }, "No provider readiness data returned.") : null,
    readiness ? e("div", { className: "providerReadinessGrid" },
      ...readiness.providers.map((provider) => e(ProviderReadinessCard, { key: provider.name, provider }))
    ) : null,
    e("div", { className: "webhookEventSurface", "aria-label": "Webhook sandbox event log" },
      e("div", { className: "webhookEventHeader" },
        e("div", null,
          e("h3", null, "Webhook sandbox event log"),
          e("p", null, "Dry-run intake summary only. Raw provider payloads and credentials are never displayed.")
        ),
        lastEvent ? e("div", { className: "webhookLastEvent", "aria-label": "Last received dry-run event" },
          e("span", null, "last received dry-run event"),
          e("strong", null, `${providerLabel(lastEvent.provider)} ${lastEvent.eventType} ${lastEvent.status}`),
          e("span", null, `signature=${lastEvent.signatureStatus} / replay=${lastEvent.replayStatus}`),
          e("span", null, `normalization=${lastEvent.normalizationStatus} / routing=${lastEvent.routingStatus}`)
        ) : null
      ),
      webhookEventsError ? e("div", { className: "apiErrorBox compact", role: "alert" }, webhookEventsError) : null,
      webhookEventsLoading ? e("div", { className: "apiLoadingBox compact" }, "Loading webhook sandbox events...") : null,
      e("form", { className: "webhookEventForm", onSubmit: submitSandboxEvent },
        e("label", { className: "settingsInlineField" },
          e("span", null, "Provider"),
          e("select", { value: provider, onChange: (event: React.ChangeEvent<HTMLSelectElement>) => setProvider(event.target.value as ProviderOption) },
            ...providers.map((item) => e("option", { key: item, value: item }, providerLabel(item)))
          )
        ),
        e("label", { className: "settingsInlineField" },
          e("span", null, "Event type"),
          e("select", { value: eventType, onChange: (event: React.ChangeEvent<HTMLSelectElement>) => setEventType(event.target.value as ProviderWebhookEventType) },
            ...eventTypes.map((item) => e("option", { key: item, value: item }, item))
          )
        ),
        e("label", { className: "settingsInlineField" },
          e("span", null, "Event ID"),
          e("input", {
            value: eventId,
            onChange: (event: React.ChangeEvent<HTMLInputElement>) => setEventId(event.target.value),
            placeholder: "sandbox-event-001"
          })
        ),
        e("label", { className: "settingsInlineField" },
          e("span", null, "Delivery ID"),
          e("input", {
            value: deliveryId,
            onChange: (event: React.ChangeEvent<HTMLInputElement>) => setDeliveryId(event.target.value),
            placeholder: "optional"
          })
        ),
        e("label", { className: "settingsInlineField" },
          e("span", null, "Sandbox signature"),
          e("input", {
            type: "password",
            value: signature,
            onChange: (event: React.ChangeEvent<HTMLInputElement>) => setSignature(event.target.value),
            placeholder: "optional local HMAC",
            autoComplete: "off"
          })
        ),
        e("button", { className: "webhookEventButton", type: "submit", disabled: webhookEventSaving || !onCreateSandboxEvent },
          e(Send, { size: 15 }),
          webhookEventSaving ? "Submitting..." : "Submit dry-run"
        )
      ),
      webhookEvents.length > 0 ? e("div", { className: "webhookEventList" },
        ...webhookEvents.slice(0, 5).map((event) => e("article", { key: event.id, className: "webhookEventRow" },
          e("div", null,
            e("strong", null, `${providerLabel(event.provider)} / ${providerLabel(event.channel)}`),
            e("span", null, `${event.eventType} / ${event.status}`)
          ),
          e("div", null,
            e("span", null, `mode=${event.mode}`),
            e("span", null, `signature=${event.signatureStatus}`),
            e("span", null, `replay=${event.replayStatus}`),
            e("span", null, `normalization=${event.normalizationStatus}`),
            e("span", null, `normalizedEventType=${event.normalizedEventType}`),
            e("span", null, `messageType=${event.messageType}`),
            e("span", null, `routing=${event.routingStatus}`),
            e("span", null, `lookup=${event.conversationLookupStatus}`),
            e("span", null, `externalCalls=${event.externalCalls}`),
            e("span", null, formatDate(event.receivedAt))
          ),
          e("p", null, event.payloadSummary),
          e("small", null, `payloadFieldCount=${event.payloadFieldCount} / payloadDigest=${event.payloadDigest} / signatureVerified=${String(event.signatureVerified)} / replayDetected=${String(event.replayDetected)} / dryRunRouting=${String(event.dryRunRouting)} / conversationKeyDigest=${event.conversationKeyDigest ?? "none"} / roomIdDigest=${event.roomIdDigest ?? "none"}`)
        ))
      ) : !webhookEventsLoading && !webhookEventsError ? e("div", { className: "providerEmptyState" }, "No webhook sandbox events received.") : null
    )
  );
}

function ProviderReadinessCard({ provider }: { provider: ProviderReadinessProvider }) {
  return e("article", { className: "providerReadinessCard" },
    e("div", { className: "channelPanelTop" },
      e(RadioTower, { size: 18 }),
      e("div", null,
        e("h3", null, providerLabel(provider.name)),
        e("p", null, provider.status)
      )
    ),
    e("dl", { className: "channelMeta providerReadinessMeta" },
      definition("Credential", formatStatus(provider.credentialStatus)),
      definition("Webhook verification", provider.webhookVerificationConfigured ? "configured" : "not configured"),
      definition("Signature guardrail", provider.webhookVerificationReady ? "sandbox-ready" : "not ready"),
      definition("Webhook secret", formatStatus(provider.webhookStatus)),
      definition("Outbound enabled", String(provider.outboundEnabled))
    )
  );
}

function definition(label: string, value: string) {
  return e("div", { key: label },
    e("dt", null, label),
    e("dd", null, value)
  );
}

function providerLabel(provider: ProviderReadinessProvider["name"]) {
  const labels: Record<ProviderReadinessProvider["name"], string> = {
    line: "LINE",
    telegram: "Telegram",
    facebook: "Facebook",
    instagram: "Instagram"
  };
  return labels[provider];
}

function formatStatus(status: ProviderReadinessProvider["credentialStatus"]) {
  return status === "configured" ? "configured" : "not configured";
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("th-TH");
}

const e = React.createElement;
