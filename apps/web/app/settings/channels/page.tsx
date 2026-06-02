"use client";

import { Check, Copy, MessageSquareText } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ProviderReadiness, ProviderWebhookCandidateConversation, ProviderWebhookEvent, ProviderWebhookSandboxEventRequest, ProviderWebhookUnmatchedInboundFilters, ProviderWebhookUnmatchedInboundItem, SettingsChannelAccount } from "@ai-omni/shared";
import { dataMode } from "../../data-mode";
import {
  createSettingsProviderWebhookSandboxEvent,
  linkSettingsProviderWebhookUnmatchedInboundConversation,
  loadSettingsChannelsData,
  loadSettingsProviderWebhookCandidateData,
  loadSettingsProviderReadinessData,
  loadSettingsProviderWebhookEventsData,
  loadSettingsProviderWebhookUnmatchedInboundData,
  reviewSettingsProviderWebhookUnmatchedInbound
} from "../../settings-data";
import { ProviderReadinessPanel } from "../provider-readiness-panel";

export default function ChannelSettingsPage() {
  const [copied, setCopied] = useState("");
  const [channels, setChannels] = useState<SettingsChannelAccount[]>([]);
  const [providerReadiness, setProviderReadiness] = useState<ProviderReadiness | null>(null);
  const [webhookEvents, setWebhookEvents] = useState<ProviderWebhookEvent[]>([]);
  const [unmatchedInboundItems, setUnmatchedInboundItems] = useState<ProviderWebhookUnmatchedInboundItem[]>([]);
  const [unmatchedFilters, setUnmatchedFilters] = useState<ProviderWebhookUnmatchedInboundFilters>({});
  const [candidateItemsById, setCandidateItemsById] = useState<Record<string, ProviderWebhookCandidateConversation[]>>({});
  const [candidateErrorById, setCandidateErrorById] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [providerLoading, setProviderLoading] = useState(true);
  const [webhookEventsLoading, setWebhookEventsLoading] = useState(true);
  const [unmatchedInboundLoading, setUnmatchedInboundLoading] = useState(true);
  const [candidateLoadingId, setCandidateLoadingId] = useState("");
  const [webhookEventSaving, setWebhookEventSaving] = useState(false);
  const [error, setError] = useState("");
  const [providerError, setProviderError] = useState("");
  const [webhookEventsError, setWebhookEventsError] = useState("");
  const [unmatchedInboundError, setUnmatchedInboundError] = useState("");
  const [unmatchedActionSavingId, setUnmatchedActionSavingId] = useState("");
  const [unmatchedActionStatus, setUnmatchedActionStatus] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    loadSettingsChannelsData(dataMode)
      .then((data) => {
        if (!active) return;
        setChannels(data.channels);
      })
      .catch((reason) => {
        if (!active) return;
        setChannels([]);
        setError(`Settings Channels API error: ${reason instanceof Error ? reason.message : "Unable to load settings channels"}`);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    setProviderLoading(true);
    setProviderError("");
    loadSettingsProviderReadinessData(dataMode)
      .then((data) => {
        if (!active) return;
        setProviderReadiness(data.providerReadiness);
      })
      .catch((reason) => {
        if (!active) return;
        setProviderReadiness(null);
        setProviderError(`Provider Readiness API error: ${reason instanceof Error ? reason.message : "Unable to load provider readiness"}`);
      })
      .finally(() => {
        if (active) setProviderLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const refreshWebhookEvents = useCallback(async () => {
    setWebhookEventsLoading(true);
    setUnmatchedInboundLoading(true);
    setWebhookEventsError("");
    setUnmatchedInboundError("");
    const [eventsResult, unmatchedResult] = await Promise.allSettled([
      loadSettingsProviderWebhookEventsData(dataMode),
      loadSettingsProviderWebhookUnmatchedInboundData(dataMode, unmatchedFilters)
    ]);
    if (eventsResult.status === "fulfilled") {
      setWebhookEvents(eventsResult.value.events);
    } else {
      setWebhookEvents([]);
      setWebhookEventsError(`Webhook Events API error: ${eventsResult.reason instanceof Error ? eventsResult.reason.message : "Unable to load webhook events"}`);
    }
    if (unmatchedResult.status === "fulfilled") {
      setUnmatchedInboundItems(unmatchedResult.value.items);
    } else {
      setUnmatchedInboundItems([]);
      setUnmatchedInboundError(`Unmatched Inbound API error: ${unmatchedResult.reason instanceof Error ? unmatchedResult.reason.message : "Unable to load unmatched inbound review"}`);
    }
    setWebhookEventsLoading(false);
    setUnmatchedInboundLoading(false);
  }, [unmatchedFilters]);

  useEffect(() => {
    void refreshWebhookEvents();
  }, [refreshWebhookEvents]);

  async function loadCandidates(unmatchedInboundId: string) {
    setCandidateLoadingId(unmatchedInboundId);
    setCandidateErrorById((current) => ({ ...current, [unmatchedInboundId]: "" }));
    try {
      const result = await loadSettingsProviderWebhookCandidateData(dataMode, unmatchedInboundId);
      setCandidateItemsById((current) => ({ ...current, [unmatchedInboundId]: result.candidates }));
    } catch (reason) {
      setCandidateItemsById((current) => ({ ...current, [unmatchedInboundId]: [] }));
      setCandidateErrorById((current) => ({
        ...current,
        [unmatchedInboundId]: `Candidate lookup API error: ${reason instanceof Error ? reason.message : "Unable to load candidates"}`
      }));
    } finally {
      setCandidateLoadingId("");
    }
  }

  const groupedChannels = useMemo(() => {
    const groups = new Map<string, SettingsChannelAccount[]>();
    for (const channel of channels) {
      const group = groups.get(channel.platform) ?? [];
      group.push(channel);
      groups.set(channel.platform, group);
    }
    return Array.from(groups.entries());
  }, [channels]);

  async function copyWebhook(url: string) {
    try {
      await navigator.clipboard?.writeText(url);
    } catch {
      // Demo fallback: keep the mock copy interaction visible even when clipboard permission is blocked.
    }
    setCopied(url);
    window.setTimeout(() => setCopied(""), 1400);
  }

  async function createSandboxEvent(payload: ProviderWebhookSandboxEventRequest) {
    setWebhookEventSaving(true);
    setWebhookEventsError("");
    try {
      await createSettingsProviderWebhookSandboxEvent(dataMode, payload);
      await refreshWebhookEvents();
      const readiness = await loadSettingsProviderReadinessData(dataMode);
      setProviderReadiness(readiness.providerReadiness);
    } catch (reason) {
      setWebhookEventsError(`Webhook Events API error: ${reason instanceof Error ? reason.message : "Unable to submit webhook event"}`);
    } finally {
      setWebhookEventSaving(false);
    }
  }

  async function reviewUnmatchedInbound(unmatchedInboundId: string, status: "reviewed" | "skipped") {
    setUnmatchedActionSavingId(unmatchedInboundId);
    setUnmatchedInboundError("");
    setUnmatchedActionStatus("");
    try {
      const result = await reviewSettingsProviderWebhookUnmatchedInbound(dataMode, unmatchedInboundId, { status });
      setUnmatchedActionStatus(`Unmatched inbound ${result.id} ${result.reviewStatus}; externalCalls=${result.externalCalls}`);
      await refreshWebhookEvents();
      if (candidateItemsById[unmatchedInboundId]) await loadCandidates(unmatchedInboundId);
      const readiness = await loadSettingsProviderReadinessData(dataMode);
      setProviderReadiness(readiness.providerReadiness);
    } catch (reason) {
      setUnmatchedInboundError(`Unmatched Inbound API error: ${reason instanceof Error ? reason.message : "Unable to update unmatched inbound review"}`);
    } finally {
      setUnmatchedActionSavingId("");
    }
  }

  async function linkUnmatchedInbound(unmatchedInboundId: string, conversationId: string, actionMode: "link-only" | "link-and-persist-safe-message") {
    setUnmatchedActionSavingId(unmatchedInboundId);
    setUnmatchedInboundError("");
    setUnmatchedActionStatus("");
    try {
      const result = await linkSettingsProviderWebhookUnmatchedInboundConversation(dataMode, unmatchedInboundId, { conversationId, actionMode });
      setUnmatchedActionStatus(`Unmatched inbound ${result.id} ${result.linkStatus}; messagePersisted=${String(result.messagePersisted)}; externalCalls=${result.externalCalls}`);
      await refreshWebhookEvents();
      if (candidateItemsById[unmatchedInboundId]) await loadCandidates(unmatchedInboundId);
      const readiness = await loadSettingsProviderReadinessData(dataMode);
      setProviderReadiness(readiness.providerReadiness);
    } catch (reason) {
      setUnmatchedInboundError(`Unmatched Inbound API error: ${reason instanceof Error ? reason.message : "Unable to link unmatched inbound review"}`);
    } finally {
      setUnmatchedActionSavingId("");
    }
  }

  return (
    <main className="settingsPage">
      <header className="settingsHeader">
        <div>
          <p className="eyebrow">Settings</p>
          <h1>Channels</h1>
        </div>
        <span className="settingsMode">DATA_MODE={dataMode}</span>
      </header>

      {error ? <section className="apiErrorBox" role="alert">{error}</section> : null}
      {loading ? <section className="apiLoadingBox">Loading channel settings...</section> : null}

      <ProviderReadinessPanel
        readiness={providerReadiness}
        loading={providerLoading}
        error={providerError}
        webhookEvents={webhookEvents}
        webhookEventsLoading={webhookEventsLoading}
        webhookEventsError={webhookEventsError}
        unmatchedInboundItems={unmatchedInboundItems}
        unmatchedFilters={unmatchedFilters}
        unmatchedInboundLoading={unmatchedInboundLoading}
        unmatchedInboundError={unmatchedInboundError}
        unmatchedActionSavingId={unmatchedActionSavingId}
        unmatchedActionStatus={unmatchedActionStatus}
        candidateItemsById={candidateItemsById}
        candidateErrorById={candidateErrorById}
        candidateLoadingId={candidateLoadingId}
        webhookEventSaving={webhookEventSaving}
        onUnmatchedFiltersChange={setUnmatchedFilters}
        onCreateSandboxEvent={createSandboxEvent}
        onReviewUnmatchedInbound={reviewUnmatchedInbound}
        onLinkUnmatchedInbound={linkUnmatchedInbound}
        onLoadCandidates={loadCandidates}
      />

      <section className="channelGrid" aria-label="Channel webhook settings">
        {groupedChannels.map(([platform, items]) => (
          <div key={platform} className="channelPlatformGroup">
            <h2>{platformLabel(platform as SettingsChannelAccount["platform"])}</h2>
            {items.map((channel) => (
              <article key={channel.id} className="channelPanel">
                <div className="channelPanelTop">
                  <MessageSquareText size={18} />
                  <div>
                    <h3>{channel.accountName}</h3>
                    <p>Status: {channel.status}</p>
                  </div>
                </div>
                <dl className="channelMeta">
                  <div>
                    <dt>Channel account ID</dt>
                    <dd>{channel.id}</dd>
                  </div>
                  <div>
                    <dt>Account key</dt>
                    <dd>{channel.accountKey ?? "not configured"}</dd>
                  </div>
                  <div>
                    <dt>Webhook URL</dt>
                    <dd>{channel.webhookUrl ?? "not configured"}</dd>
                  </div>
                  <div>
                    <dt>Last inbound</dt>
                    <dd>{formatDate(channel.lastInboundAt)}</dd>
                  </div>
                  <div>
                    <dt>Last message</dt>
                    <dd>{formatDate(channel.lastMessageAt)}</dd>
                  </div>
                  <div>
                    <dt>Access token</dt>
                    <dd>{channel.hasAccessToken ? channel.tokenMasked ?? "configured" : "not configured"}</dd>
                  </div>
                  <div>
                    <dt>Webhook secret</dt>
                    <dd>{channel.secretConfigured ? channel.secretMasked ?? "configured" : "not configured"}</dd>
                  </div>
                </dl>
                {channel.webhookUrl ? (
                  <button className="copyWebhookButton" type="button" onClick={() => copyWebhook(channel.webhookUrl ?? "")}>
                    {copied === channel.webhookUrl ? <Check size={15} /> : <Copy size={15} />}
                    {copied === channel.webhookUrl ? "Copied" : "Copy webhook URL"}
                  </button>
                ) : null}
              </article>
            ))}
          </div>
        ))}
        {!loading && !error && channels.length === 0 ? (
          <article className="channelPanel">
            <div className="channelPanelTop">
              <MessageSquareText size={18} />
              <div>
                <h2>No channels configured</h2>
                <p>No persisted channel accounts were returned.</p>
              </div>
            </div>
          </article>
        ) : null}
      </section>
    </main>
  );
}

function platformLabel(platform: SettingsChannelAccount["platform"]) {
  const labels: Record<SettingsChannelAccount["platform"], string> = {
    webchat: "Webchat",
    telegram: "Telegram",
    line: "LINE",
    facebook: "Facebook",
    instagram: "Instagram"
  };
  return labels[platform];
}

function formatDate(value: string | null | undefined) {
  return value ? new Date(value).toLocaleString("th-TH") : "not received";
}
