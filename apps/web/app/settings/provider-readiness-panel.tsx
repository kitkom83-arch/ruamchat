import React, { useState } from "react";
import { Check, Link2, RadioTower, Send, ShieldCheck, SkipForward } from "lucide-react";
import type { ProviderReadiness, ProviderReadinessProvider, ProviderWebhookEvent, ProviderWebhookEventType, ProviderWebhookInboundPersistenceMode, ProviderWebhookSandboxEventRequest, ProviderWebhookUnmatchedInboundItem } from "@ai-omni/shared";

type ProviderReadinessPanelProps = {
  readiness: ProviderReadiness | null;
  loading: boolean;
  error: string;
  webhookEvents?: ProviderWebhookEvent[];
  webhookEventsLoading?: boolean;
  webhookEventsError?: string;
  unmatchedInboundItems?: ProviderWebhookUnmatchedInboundItem[];
  unmatchedInboundLoading?: boolean;
  unmatchedInboundError?: string;
  unmatchedActionSavingId?: string;
  webhookEventSaving?: boolean;
  onCreateSandboxEvent?: (payload: ProviderWebhookSandboxEventRequest) => Promise<void>;
  onReviewUnmatchedInbound?: (unmatchedInboundId: string, status: "reviewed" | "skipped") => Promise<void>;
  onLinkUnmatchedInbound?: (unmatchedInboundId: string, conversationId: string, actionMode: "link-only" | "link-and-persist-safe-message") => Promise<void>;
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
  unmatchedInboundItems = [],
  unmatchedInboundLoading = false,
  unmatchedInboundError = "",
  unmatchedActionSavingId = "",
  webhookEventSaving = false,
  onCreateSandboxEvent,
  onReviewUnmatchedInbound,
  onLinkUnmatchedInbound
}: ProviderReadinessPanelProps) {
  const [provider, setProvider] = useState<ProviderOption>("line");
  const [eventType, setEventType] = useState<ProviderWebhookEventType>("message.created");
  const [eventId, setEventId] = useState("sandbox-event-001");
  const [deliveryId, setDeliveryId] = useState("");
  const [signature, setSignature] = useState("");
  const [inboundPersistenceMode, setInboundPersistenceMode] = useState<ProviderWebhookInboundPersistenceMode>("dry-run");
  const [linkConversationIds, setLinkConversationIds] = useState<Record<string, string>>({});
  const lastEvent = webhookEvents[0] ?? null;
  const replayDetectedCount = readiness?.replayDetectedCount ?? webhookEvents.filter((event) => event.replayDetected).length;

  async function submitSandboxEvent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onCreateSandboxEvent?.({
      provider,
      channel: provider,
      eventType,
      mode: inboundPersistenceMode === "sandbox-persist" ? "sandbox" : "dry_run",
      status: eventType === "webhook.failed" ? "failed" : eventType === "webhook.verified" ? "verified" : "received",
      eventId: eventId.trim() || undefined,
      deliveryId: deliveryId.trim() || undefined,
      timestamp: new Date().toISOString(),
      signature: signature.trim() || undefined,
      inboundPersistenceMode,
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
        e("span", null, `inbound persistence=${readiness.webhookInboundPersistenceEnabled ? "enabled" : "disabled"}`),
        e("span", null, `latest inbound persistence=${readiness.latestInboundPersistenceStatus ?? "none"}`),
        e("span", null, `persistedInboundMessageCount=${readiness.persistedInboundMessageCount}`),
        e("span", null, `inboundPersistenceBlockedCount=${readiness.inboundPersistenceBlockedCount}`),
        e("span", null, `inboundPersistenceReplayBlockedCount=${readiness.inboundPersistenceReplayBlockedCount}`),
        e("span", null, `inboundPersistenceSkippedNoMatchCount=${readiness.inboundPersistenceSkippedNoMatchCount}`),
        e("span", null, `unmatched inbound review=${readiness.webhookUnmatchedInboundReviewEnabled ? "enabled" : "disabled"}`),
        e("span", null, `review actions=${readiness.webhookUnmatchedReviewActionsEnabled ? "enabled" : "disabled"}`),
        e("span", null, `open unmatched count=${readiness.unmatchedInboundOpenCount}`),
        e("span", null, `unmatched queued count=${readiness.unmatchedInboundQueuedCount}`),
        e("span", null, `unmatched replay blocked count=${readiness.unmatchedInboundReplayBlockedCount}`),
        e("span", null, `reviewed unmatched count=${readiness.unmatchedInboundReviewedCount}`),
        e("span", null, `skipped unmatched count=${readiness.unmatchedInboundSkippedCount}`),
        e("span", null, `linked unmatched count=${readiness.unmatchedInboundLinkedCount}`),
        e("span", null, `latest unmatched status=${readiness.latestUnmatchedInboundStatus ?? "none"}`),
        e("span", null, `latest review action status=${readiness.latestUnmatchedReviewActionStatus ?? "none"}`),
        e("span", null, `latest link status=${readiness.latestUnmatchedLinkStatus ?? "none"}`),
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
          e("span", null, `normalization=${lastEvent.normalizationStatus} / routing=${lastEvent.routingStatus}`),
          e("span", null, `inboundPersistence=${lastEvent.inboundPersistenceStatus} / messagePersisted=${String(lastEvent.messagePersisted)}`),
          e("span", null, `unmatchedQueued=${String(lastEvent.unmatchedInboundQueued)} / unmatchedStatus=${lastEvent.unmatchedStatus ?? "none"}`)
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
          e("span", null, "Inbound persistence"),
          e("select", { value: inboundPersistenceMode, onChange: (event: React.ChangeEvent<HTMLSelectElement>) => setInboundPersistenceMode(event.target.value as ProviderWebhookInboundPersistenceMode) },
            e("option", { value: "dry-run" }, "dry-run"),
            e("option", { value: "sandbox-persist" }, "sandbox-persist")
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
            e("span", null, `inboundPersistence=${event.inboundPersistenceStatus}`),
            e("span", null, `messagePersisted=${String(event.messagePersisted)}`),
            e("span", null, `messageId=${event.persistedMessageId ?? "none"}`),
            e("span", null, `unmatchedQueued=${String(event.unmatchedInboundQueued)}`),
            e("span", null, `unmatchedStatus=${event.unmatchedStatus ?? "none"}`),
            e("span", null, `reviewActionStatus=${event.unmatchedReviewActionStatus}`),
            e("span", null, `linkStatus=${event.unmatchedLinkStatus}`),
            e("span", null, `unmatchedReason=${event.unmatchedReason ?? "none"}`),
            e("span", null, `unmatchedId=${event.unmatchedInboundId ?? "none"}`),
            e("span", null, `linkedConversationId=${event.linkedConversationId ?? "none"}`),
            e("span", null, `linkedMessageId=${event.linkedMessageId ?? "none"}`),
            e("span", null, `unmatchedResolvedAt=${event.unmatchedResolvedAt ? formatDate(event.unmatchedResolvedAt) : "none"}`),
            e("span", null, `externalCalls=${event.externalCalls}`),
            e("span", null, formatDate(event.receivedAt))
          ),
          e("p", null, event.payloadSummary),
          e("small", null, `payloadFieldCount=${event.payloadFieldCount} / payloadDigest=${event.payloadDigest} / signatureVerified=${String(event.signatureVerified)} / replayDetected=${String(event.replayDetected)} / dryRunRouting=${String(event.dryRunRouting)} / conversationKeyDigest=${event.conversationKeyDigest ?? "none"} / roomIdDigest=${event.roomIdDigest ?? "none"} / conversationId=${event.conversationId ?? "none"} / inboundAuditStatus=${event.inboundAuditStatus}`)
        ))
      ) : !webhookEventsLoading && !webhookEventsError ? e("div", { className: "providerEmptyState" }, "No webhook sandbox events received.") : null
    ),
    e("div", { className: "webhookEventSurface", "aria-label": "Unmatched inbound review queue" },
      e("div", { className: "webhookEventHeader" },
        e("div", null,
          e("h3", null, "Unmatched inbound review"),
          e("p", null, "Sandbox no-match queue with safe digests only.")
        )
      ),
      unmatchedInboundError ? e("div", { className: "apiErrorBox compact", role: "alert" }, unmatchedInboundError) : null,
      unmatchedInboundLoading ? e("div", { className: "apiLoadingBox compact" }, "Loading unmatched inbound review items...") : null,
      unmatchedInboundItems.length > 0 ? e("div", { className: "webhookEventList" },
        ...unmatchedInboundItems.slice(0, 5).map((item) => e("article", { key: item.id, className: "webhookEventRow" },
          e("div", null,
            e("strong", null, `${providerLabel(item.provider)} unmatched inbound`),
            e("span", null, `${item.eventType} / ${item.unmatchedStatus}`)
          ),
          e("div", null,
            e("span", null, `id=${item.id}`),
            e("span", null, `channelAccountId=${item.channelAccountId ?? "none"}`),
            e("span", null, `normalization=${item.normalizationStatus}`),
            e("span", null, `normalizedEventType=${item.normalizedEventType}`),
            e("span", null, `messageType=${item.messageType}`),
            e("span", null, `routing=${item.routingStatus}`),
            e("span", null, `lookup=${item.conversationLookupStatus}`),
            e("span", null, `reason=${item.unmatchedReason}`),
            e("span", null, `reviewStatus=${item.reviewStatus}`),
            e("span", null, `linkStatus=${item.linkStatus}`),
            e("span", null, `messagePersisted=${String(item.messagePersisted)}`),
            e("span", null, `linkedConversationId=${item.linkedConversationId ?? "none"}`),
            e("span", null, `linkedMessageId=${item.linkedMessageId ?? "none"}`),
            e("span", null, `reviewedAt=${item.reviewedAt ? formatDate(item.reviewedAt) : "none"}`),
            e("span", null, `unmatchedResolvedAt=${item.unmatchedResolvedAt ? formatDate(item.unmatchedResolvedAt) : "none"}`),
            e("span", null, `externalCalls=${item.externalCalls}`),
            e("span", null, formatDate(item.receivedAt))
          ),
          item.textPreview ? e("p", null, item.textPreview) : null,
          isOpenUnmatchedItem(item) ? e("div", { className: "webhookEventActions" },
            e("button", {
              className: "webhookEventButton",
              type: "button",
              disabled: unmatchedActionSavingId === item.id || !onReviewUnmatchedInbound,
              onClick: () => void onReviewUnmatchedInbound?.(item.id, "reviewed")
            },
              e(Check, { size: 15 }),
              unmatchedActionSavingId === item.id ? "Saving..." : "Mark reviewed"
            ),
            e("button", {
              className: "webhookEventButton",
              type: "button",
              disabled: unmatchedActionSavingId === item.id || !onReviewUnmatchedInbound,
              onClick: () => void onReviewUnmatchedInbound?.(item.id, "skipped")
            },
              e(SkipForward, { size: 15 }),
              unmatchedActionSavingId === item.id ? "Saving..." : "Skip"
            ),
            e("label", { className: "settingsInlineField" },
              e("span", null, "Conversation ID"),
              e("input", {
                value: linkConversationIds[item.id] ?? "",
                onChange: (event: React.ChangeEvent<HTMLInputElement>) => setLinkConversationIds((current) => ({ ...current, [item.id]: event.target.value })),
                placeholder: "existing safe conversation id"
              })
            ),
            e("button", {
              className: "webhookEventButton",
              type: "button",
              disabled: unmatchedActionSavingId === item.id || !onLinkUnmatchedInbound || !(linkConversationIds[item.id] ?? "").trim(),
              onClick: () => void onLinkUnmatchedInbound?.(item.id, (linkConversationIds[item.id] ?? "").trim(), "link-only")
            },
              e(Link2, { size: 15 }),
              "Link only"
            ),
            e("button", {
              className: "webhookEventButton",
              type: "button",
              disabled: unmatchedActionSavingId === item.id || !onLinkUnmatchedInbound || !(linkConversationIds[item.id] ?? "").trim(),
              onClick: () => void onLinkUnmatchedInbound?.(item.id, (linkConversationIds[item.id] ?? "").trim(), "link-and-persist-safe-message")
            },
              e(Send, { size: 15 }),
              "Link + persist safe message"
            )
          ) : null,
          e("small", null, `payloadDigest=${item.payloadDigest} / providerEventDigest=${item.providerEventDigest ?? "none"} / deliveryDigest=${item.deliveryDigest ?? "none"} / senderKeyDigest=${item.senderKeyDigest ?? "none"} / roomKeyDigest=${item.roomKeyDigest ?? "none"} / textLength=${item.textLength ?? "none"}`)
        ))
      ) : !unmatchedInboundLoading && !unmatchedInboundError ? e("div", { className: "providerEmptyState" }, "No unmatched inbound review items.") : null
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

function isOpenUnmatchedItem(item: ProviderWebhookUnmatchedInboundItem) {
  return item.unmatchedStatus === "open" || item.unmatchedStatus === "review-needed";
}

const e = React.createElement;
