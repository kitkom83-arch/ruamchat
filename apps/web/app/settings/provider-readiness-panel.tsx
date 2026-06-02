import React, { useState } from "react";
import { Activity, AlertTriangle, BarChart3, Bell, Check, CheckSquare, ChevronLeft, ChevronRight, Download, FileClock, Link2, ListChecks, NotebookPen, Pin, RadioTower, Search, Send, ShieldCheck, SkipForward, Star, X } from "lucide-react";
import type { ProviderReadiness, ProviderReadinessProvider, ProviderWebhookCandidateConversation, ProviderWebhookEvent, ProviderWebhookEventType, ProviderWebhookInboundPersistenceMode, ProviderWebhookOperatorNote, ProviderWebhookReviewAlerts, ProviderWebhookReviewMetrics, ProviderWebhookReviewSavedView, ProviderWebhookReviewTriage, ProviderWebhookSandboxEventRequest, ProviderWebhookUnmatchedInboundBulkReviewResponse, ProviderWebhookUnmatchedInboundDiagnostics, ProviderWebhookUnmatchedInboundExport, ProviderWebhookUnmatchedInboundExportFormat, ProviderWebhookUnmatchedInboundFilters, ProviderWebhookUnmatchedInboundHistory, ProviderWebhookUnmatchedInboundItem, ProviderWebhookUnmatchedInboundPage } from "@ai-omni/shared";

type ProviderReadinessPanelProps = {
  readiness: ProviderReadiness | null;
  loading: boolean;
  error: string;
  webhookEvents?: ProviderWebhookEvent[];
  webhookEventsLoading?: boolean;
  webhookEventsError?: string;
  unmatchedInboundItems?: ProviderWebhookUnmatchedInboundItem[];
  unmatchedFilters?: ProviderWebhookUnmatchedInboundFilters;
  unmatchedPagination?: ProviderWebhookUnmatchedInboundPage["pagination"] | null;
  unmatchedAppliedSort?: ProviderWebhookUnmatchedInboundPage["appliedSort"] | null;
  unmatchedPageSummary?: ProviderWebhookUnmatchedInboundPage["summary"] | null;
  selectedUnmatchedIds?: string[];
  unmatchedInboundLoading?: boolean;
  unmatchedInboundError?: string;
  unmatchedActionSavingId?: string;
  unmatchedActionStatus?: string;
  unmatchedBulkSavingStatus?: "" | "reviewed" | "skipped";
  unmatchedBulkResult?: ProviderWebhookUnmatchedInboundBulkReviewResponse | null;
  reviewMetrics?: ProviderWebhookReviewMetrics | null;
  reviewMetricsLoading?: boolean;
  reviewMetricsError?: string;
  reviewAlerts?: ProviderWebhookReviewAlerts | null;
  reviewAlertsLoading?: boolean;
  reviewAlertsError?: string;
  reviewTriage?: ProviderWebhookReviewTriage | null;
  reviewTriageLoading?: boolean;
  reviewTriageError?: string;
  reviewSavedViews?: ProviderWebhookReviewSavedView[];
  reviewSavedViewsLoading?: boolean;
  reviewSavedViewsError?: string;
  reviewSavedViewSaving?: boolean;
  reviewSavedViewActionStatus?: string;
  activeDiagnosticsId?: string;
  activeDiagnostics?: ProviderWebhookUnmatchedInboundDiagnostics | null;
  diagnosticsLoadingId?: string;
  diagnosticsErrorById?: Record<string, string>;
  activeHistoryId?: string;
  activeHistory?: ProviderWebhookUnmatchedInboundHistory | null;
  historyLoadingId?: string;
  historyErrorById?: Record<string, string>;
  operatorNotesById?: Record<string, ProviderWebhookOperatorNote[]>;
  operatorNotesLoadingId?: string;
  operatorNotesErrorById?: Record<string, string>;
  operatorNoteSavingId?: string;
  unmatchedExportResult?: ProviderWebhookUnmatchedInboundExport | null;
  unmatchedExportLoadingFormat?: "" | ProviderWebhookUnmatchedInboundExportFormat;
  unmatchedExportError?: string;
  candidateItemsById?: Record<string, ProviderWebhookCandidateConversation[]>;
  candidateErrorById?: Record<string, string>;
  candidateLoadingId?: string;
  webhookEventSaving?: boolean;
  onUnmatchedFiltersChange?: (filters: ProviderWebhookUnmatchedInboundFilters) => void;
  onUnmatchedSelectionChange?: (ids: string[]) => void;
  onCreateSandboxEvent?: (payload: ProviderWebhookSandboxEventRequest) => Promise<void>;
  onReviewUnmatchedInbound?: (unmatchedInboundId: string, status: "reviewed" | "skipped") => Promise<void>;
  onBulkReviewUnmatchedInbound?: (status: "reviewed" | "skipped") => Promise<void>;
  onLinkUnmatchedInbound?: (unmatchedInboundId: string, conversationId: string, actionMode: "link-only" | "link-and-persist-safe-message") => Promise<void>;
  onCreateSavedView?: (name: string, description: string, pinned: boolean, isDefault: boolean) => Promise<void>;
  onApplySavedView?: (savedView: ProviderWebhookReviewSavedView) => void;
  onArchiveSavedView?: (savedViewId: string) => Promise<void>;
  onLoadCandidates?: (unmatchedInboundId: string) => Promise<void>;
  onLoadDiagnostics?: (unmatchedInboundId: string) => Promise<void>;
  onLoadHistory?: (unmatchedInboundId: string) => Promise<void>;
  onLoadOperatorNotes?: (unmatchedInboundId: string) => Promise<void>;
  onCreateOperatorNote?: (unmatchedInboundId: string, note: string) => Promise<void>;
  onExportUnmatchedInbound?: (format: ProviderWebhookUnmatchedInboundExportFormat) => Promise<void>;
};

const providers = ["line", "telegram", "facebook", "instagram"] as const;
type ProviderOption = (typeof providers)[number];
const eventTypes: ProviderWebhookEventType[] = ["message.created", "webhook.verified", "webhook.failed"];
const reviewStatuses = ["pending", "reviewed", "skipped", "linked"] as const;
const linkStatuses = ["none", "rejected", "linked", "linked-message-persisted", "duplicate-noop"] as const;
const unmatchedStatuses = ["open", "review-needed", "reviewed", "blocked", "skipped", "linked", "duplicate-skipped"] as const;
const queueStatuses = ["open", "reviewed", "blocked", "skipped", "linked"] as const;
const pageSizes = [5, 10, 25, 50] as const;

export function ProviderReadinessPanel({
  readiness,
  loading,
  error,
  webhookEvents = [],
  webhookEventsLoading = false,
  webhookEventsError = "",
  unmatchedInboundItems = [],
  unmatchedFilters = {},
  unmatchedPagination = null,
  unmatchedAppliedSort = null,
  unmatchedPageSummary = null,
  selectedUnmatchedIds = [],
  unmatchedInboundLoading = false,
  unmatchedInboundError = "",
  unmatchedActionSavingId = "",
  unmatchedActionStatus = "",
  unmatchedBulkSavingStatus = "",
  unmatchedBulkResult = null,
  reviewMetrics = null,
  reviewMetricsLoading = false,
  reviewMetricsError = "",
  reviewAlerts = null,
  reviewAlertsLoading = false,
  reviewAlertsError = "",
  reviewTriage = null,
  reviewTriageLoading = false,
  reviewTriageError = "",
  reviewSavedViews = [],
  reviewSavedViewsLoading = false,
  reviewSavedViewsError = "",
  reviewSavedViewSaving = false,
  reviewSavedViewActionStatus = "",
  activeDiagnosticsId = "",
  activeDiagnostics = null,
  diagnosticsLoadingId = "",
  diagnosticsErrorById = {},
  activeHistoryId = "",
  activeHistory = null,
  historyLoadingId = "",
  historyErrorById = {},
  operatorNotesById = {},
  operatorNotesLoadingId = "",
  operatorNotesErrorById = {},
  operatorNoteSavingId = "",
  unmatchedExportResult = null,
  unmatchedExportLoadingFormat = "",
  unmatchedExportError = "",
  candidateItemsById = {},
  candidateErrorById = {},
  candidateLoadingId = "",
  webhookEventSaving = false,
  onUnmatchedFiltersChange,
  onUnmatchedSelectionChange,
  onCreateSandboxEvent,
  onReviewUnmatchedInbound,
  onBulkReviewUnmatchedInbound,
  onLinkUnmatchedInbound,
  onCreateSavedView,
  onApplySavedView,
  onArchiveSavedView,
  onLoadCandidates,
  onLoadDiagnostics,
  onLoadHistory,
  onLoadOperatorNotes,
  onCreateOperatorNote,
  onExportUnmatchedInbound
}: ProviderReadinessPanelProps) {
  const [provider, setProvider] = useState<ProviderOption>("line");
  const [eventType, setEventType] = useState<ProviderWebhookEventType>("message.created");
  const [eventId, setEventId] = useState("sandbox-event-001");
  const [deliveryId, setDeliveryId] = useState("");
  const [signature, setSignature] = useState("");
  const [inboundPersistenceMode, setInboundPersistenceMode] = useState<ProviderWebhookInboundPersistenceMode>("dry-run");
  const [linkConversationIds, setLinkConversationIds] = useState<Record<string, string>>({});
  const [savedViewName, setSavedViewName] = useState("Current review queue");
  const [savedViewDescription, setSavedViewDescription] = useState("");
  const [savedViewPinned, setSavedViewPinned] = useState(false);
  const [savedViewDefault, setSavedViewDefault] = useState(false);
  const [operatorNoteDrafts, setOperatorNoteDrafts] = useState<Record<string, string>>({});
  const lastEvent = webhookEvents[0] ?? null;
  const replayDetectedCount = readiness?.replayDetectedCount ?? webhookEvents.filter((event) => event.replayDetected).length;
  const queueSummary = summarizeUnmatchedQueue(unmatchedInboundItems);
  const selectedUnmatchedSet = new Set(selectedUnmatchedIds);
  const selectableVisibleItems = unmatchedInboundItems.filter(isOpenUnmatchedItem);
  const allVisibleSelected = selectableVisibleItems.length > 0 && selectableVisibleItems.every((item) => selectedUnmatchedSet.has(item.id));
  const pagination = unmatchedPagination ?? {
    totalCount: unmatchedInboundItems.length,
    limit: unmatchedFilters.limit ?? (unmatchedInboundItems.length || 10),
    offset: unmatchedFilters.offset ?? 0,
    returnedCount: unmatchedInboundItems.length,
    hasNextPage: false,
    hasPreviousPage: false
  };
  const appliedSort = unmatchedAppliedSort ?? {
    sortBy: unmatchedFilters.sortBy ?? "receivedAt",
    sortOrder: unmatchedFilters.sortOrder ?? "desc"
  };

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

  function updateQueueFilters(next: ProviderWebhookUnmatchedInboundFilters) {
    onUnmatchedFiltersChange?.({
      ...unmatchedFilters,
      ...next,
      offset: next.offset ?? 0
    });
  }

  async function submitSavedView(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = savedViewName.trim();
    if (!name || !onCreateSavedView) return;
    await onCreateSavedView(name, savedViewDescription, savedViewPinned, savedViewDefault);
  }

  async function submitOperatorNote(unmatchedInboundId: string) {
    const note = (operatorNoteDrafts[unmatchedInboundId] ?? "").trim();
    if (!note || !onCreateOperatorNote) return;
    await onCreateOperatorNote(unmatchedInboundId, note);
    setOperatorNoteDrafts((current) => ({ ...current, [unmatchedInboundId]: "" }));
  }

  function selectVisibleUnmatchedItems() {
    onUnmatchedSelectionChange?.(selectableVisibleItems.map((item) => item.id));
  }

  function clearUnmatchedSelection() {
    onUnmatchedSelectionChange?.([]);
  }

  function toggleUnmatchedSelection(id: string, checked: boolean) {
    if (checked) {
      onUnmatchedSelectionChange?.(Array.from(new Set([...selectedUnmatchedIds, id])));
      return;
    }
    onUnmatchedSelectionChange?.(selectedUnmatchedIds.filter((itemId) => itemId !== id));
  }

  function moveUnmatchedPage(direction: "previous" | "next") {
    const offset = direction === "previous"
      ? Math.max(0, pagination.offset - pagination.limit)
      : pagination.offset + pagination.limit;
    updateQueueFilters({ offset });
  }

  function metricFilterButton(label: string, value: number, filters: ProviderWebhookUnmatchedInboundFilters) {
    return e("button", {
      key: label,
      className: "webhookMetricButton",
      type: "button",
      disabled: !onUnmatchedFiltersChange,
      onClick: () => updateQueueFilters(filters)
    },
      e("span", null, label),
      e("strong", null, String(value))
    );
  }

  function metricCountGroup(
    title: string,
    items: ProviderWebhookReviewMetrics["byProvider"],
    toFilters: (key: string) => ProviderWebhookUnmatchedInboundFilters
  ) {
    return e("div", { className: "webhookMetricGroup" },
      e("strong", null, title),
      e("div", null,
        ...items.map((item) => metricFilterButton(item.label, item.count, toFilters(item.key)))
      )
    );
  }

  function triageActionControl(action: ProviderWebhookReviewTriage["topItems"][number]["recommendedNextActions"][number], item: ProviderWebhookReviewTriage["topItems"][number]) {
    if (action === "OPEN_DIAGNOSTICS") {
      return e("button", {
        key: `${item.unmatchedId}-${action}`,
        className: "webhookEventButton",
        type: "button",
        disabled: !item.diagnosticsAvailable || diagnosticsLoadingId === item.unmatchedId || !onLoadDiagnostics,
        onClick: () => void onLoadDiagnostics?.(item.unmatchedId)
      },
        e(Activity, { size: 15 }),
        diagnosticsLoadingId === item.unmatchedId ? "Loading diagnostics..." : "Open diagnostics"
      );
    }
    if (action === "VIEW_HISTORY") {
      return e("button", {
        key: `${item.unmatchedId}-${action}`,
        className: "webhookEventButton",
        type: "button",
        disabled: !item.historyAvailable || historyLoadingId === item.unmatchedId || !onLoadHistory,
        onClick: () => void onLoadHistory?.(item.unmatchedId)
      },
        e(FileClock, { size: 15 }),
        historyLoadingId === item.unmatchedId ? "Loading history..." : "View history"
      );
    }
    if (action === "RUN_CANDIDATE_LOOKUP") {
      return e("button", {
        key: `${item.unmatchedId}-${action}`,
        className: "webhookEventButton",
        type: "button",
        disabled: !item.candidatesAvailable || candidateLoadingId === item.unmatchedId || !onLoadCandidates,
        onClick: () => void onLoadCandidates?.(item.unmatchedId)
      },
        e(Search, { size: 15 }),
        candidateLoadingId === item.unmatchedId ? "Loading candidates..." : "Run candidate lookup"
      );
    }
    if (action === "APPLY_FILTER") {
      return e("button", {
        key: `${item.unmatchedId}-${action}`,
        className: "webhookEventButton",
        type: "button",
        disabled: !onUnmatchedFiltersChange,
        onClick: () => updateQueueFilters({
          provider: item.provider,
          eventType: item.eventType,
          reviewStatus: item.reviewStatus,
          linkStatus: item.linkStatus,
          unmatchedStatus: item.unmatchedStatus
        })
      }, "Apply queue filter");
    }
    return e("span", { key: `${item.unmatchedId}-${action}`, className: "webhookWarningPill" }, action);
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
        e("span", null, `candidate lookup=${readiness.webhookCandidateLookupEnabled ? "enabled" : "disabled"}`),
        e("span", null, `history audit=${readiness.webhookUnmatchedHistoryEnabled ? "enabled" : "disabled"}`),
        e("span", null, `queue export=${readiness.webhookUnmatchedQueueExportEnabled ? "enabled" : "disabled"}`),
        e("span", null, `export max limit=${readiness.webhookUnmatchedQueueExportMaxLimit}`),
        e("span", null, `review metrics=${readiness.webhookReviewMetricsEnabled ? "enabled" : "disabled"}`),
        e("span", null, `diagnostics=${readiness.webhookDiagnosticsEnabled ? "enabled" : "disabled"}`),
        e("span", null, `review alerts=${readiness.webhookReviewAlertsEnabled ? "enabled" : "disabled"}`),
        e("span", null, `queue health=${readiness.webhookReviewQueueHealthEnabled ? "enabled" : "disabled"}`),
        e("span", null, `review triage=${readiness.reviewTriageEnabled ? "enabled" : "disabled"}`),
        e("span", null, `triage guidance=${readiness.triageGuidanceEnabled ? "enabled" : "disabled"}`),
        e("span", null, `saved views=${readiness.reviewSavedViewsEnabled ? "enabled" : "disabled"}`),
        e("span", null, `operator notes=${readiness.operatorNotesEnabled ? "enabled" : "disabled"}`),
        e("span", null, `saved view count=${readiness.savedViewCount}`),
        e("span", null, `operator note count=${readiness.operatorNoteCount}`),
        e("span", null, `critical alert count=${readiness.reviewAlertCriticalCount}`),
        e("span", null, `critical triage count=${readiness.criticalTriageCount}`),
        e("span", null, `open triage count=${readiness.openTriageCount}`),
        e("span", null, `open unmatched count=${readiness.unmatchedInboundOpenCount}`),
        e("span", null, `stale open unmatched count=${readiness.unmatchedInboundStaleOpenCount}`),
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
    e("div", { className: "webhookEventSurface", "aria-label": "Provider webhook review metrics" },
      e("div", { className: "webhookEventHeader" },
        e("div", { className: "channelPanelTop" },
          e(BarChart3, { size: 18 }),
          e("div", null,
            e("h3", null, "Review metrics"),
            e("p", null, "Aggregate provider webhook review counts with safe drilldown filters.")
          )
        ),
        reviewMetrics ? e("div", { className: "webhookLastEvent", "aria-label": "Review metrics status" },
          e("span", null, "metrics generated"),
          e("strong", null, formatDate(reviewMetrics.generatedAt)),
          e("span", null, `externalCalls=${reviewMetrics.externalCalls}`),
          e("span", null, `applied filters=${formatAppliedFilters(reviewMetrics.appliedFilters)}`)
        ) : null
      ),
      reviewMetricsError ? e("div", { className: "apiErrorBox compact", role: "alert" }, reviewMetricsError) : null,
      reviewMetricsLoading ? e("div", { className: "apiLoadingBox compact" }, "Loading provider webhook review metrics...") : null,
      reviewMetrics ? e("div", { className: "webhookMetricsGrid" },
        metricFilterButton("total events", reviewMetrics.totalEvents, {}),
        metricFilterButton("total unmatched", reviewMetrics.totalUnmatched, {}),
        metricFilterButton("open unmatched", reviewMetrics.openUnmatched, { status: "open" }),
        metricFilterButton("reviewed", reviewMetrics.reviewedCount, { reviewStatus: "reviewed" }),
        metricFilterButton("skipped", reviewMetrics.skippedCount, { reviewStatus: "skipped" }),
        metricFilterButton("linked", reviewMetrics.linkedCount, { reviewStatus: "linked" }),
        metricFilterButton("persisted inbound", reviewMetrics.persistedInboundCount, {}),
        metricFilterButton("signature rejected", reviewMetrics.signatureRejectedCount, { eventType: "webhook.failed" })
      ) : !reviewMetricsLoading && !reviewMetricsError ? e("div", { className: "providerEmptyState" }, "No review metrics returned.") : null,
      reviewMetrics ? e("div", { className: "webhookMetricGroups" },
        metricCountGroup("By provider", reviewMetrics.byProvider, (key) => ({ provider: key as ProviderWebhookUnmatchedInboundFilters["provider"] })),
        metricCountGroup("By event type", reviewMetrics.byEventType, (key) => ({ eventType: key as ProviderWebhookEventType })),
        metricCountGroup("By review status", reviewMetrics.byReviewStatus, (key) => ({ reviewStatus: key as ProviderWebhookUnmatchedInboundFilters["reviewStatus"] })),
        metricCountGroup("By link status", reviewMetrics.byLinkStatus, (key) => ({ linkStatus: key as ProviderWebhookUnmatchedInboundFilters["linkStatus"] })),
        metricCountGroup("By unmatched status", reviewMetrics.byUnmatchedStatus, (key) => ({ unmatchedStatus: key as ProviderWebhookUnmatchedInboundFilters["unmatchedStatus"] }))
      ) : null,
      reviewMetrics ? e("div", { className: "webhookMetricGroups twoColumn" },
        e("div", { className: "webhookMetricGroup" },
          e("strong", null, "Open age buckets"),
          e("div", null,
            e("span", null, `under1Hour=${reviewMetrics.ageBuckets.under1Hour}`),
            e("span", null, `oneTo24Hours=${reviewMetrics.ageBuckets.oneTo24Hours}`),
            e("span", null, `oneTo3Days=${reviewMetrics.ageBuckets.oneTo3Days}`),
            e("span", null, `over3Days=${reviewMetrics.ageBuckets.over3Days}`)
          )
        ),
        e("div", { className: "webhookMetricGroup" },
          e("strong", null, "Safe review funnel"),
          e("div", null,
            e("span", null, `inbound received=${reviewMetrics.funnel.inboundReceived}`),
            e("span", null, `persisted=${reviewMetrics.funnel.persisted}`),
            e("span", null, `unmatched queued=${reviewMetrics.funnel.unmatchedQueued}`),
            e("span", null, `reviewed=${reviewMetrics.funnel.reviewed}`),
            e("span", null, `skipped=${reviewMetrics.funnel.skipped}`),
            e("span", null, `linked=${reviewMetrics.funnel.linked}`),
            e("span", null, `exported/history available=${reviewMetrics.funnel.exportedHistoryAvailable}`)
          )
        )
      ) : null
    ),
    e("div", { className: "webhookEventSurface", "aria-label": "Provider webhook review triage guidance" },
      e("div", { className: "webhookEventHeader" },
        e("div", { className: "channelPanelTop" },
          e(ListChecks, { size: 18 }),
          e("div", null,
            e("h3", null, "Triage lanes"),
            e("p", null, "Deterministic safe guidance only. Recommended actions do not run automatically.")
          )
        ),
        reviewTriage ? e("div", { className: "webhookLastEvent", "aria-label": "Review triage status" },
          e("span", null, "triage generated"),
          e("strong", null, formatDate(reviewTriage.generatedAt)),
          e("span", null, `externalCalls=${reviewTriage.externalCalls}`),
          e("span", null, `applied filters=${formatAppliedFilters(reviewTriage.appliedFilters)}`)
        ) : null
      ),
      reviewTriageError ? e("div", { className: "apiErrorBox compact", role: "alert" }, reviewTriageError) : null,
      reviewTriageLoading ? e("div", { className: "apiLoadingBox compact" }, "Loading provider webhook triage guidance...") : null,
      reviewTriage ? e("div", { className: "webhookMetricsGrid" },
        metricFilterButton("total triage items", reviewTriage.totalItems, {}),
        metricFilterButton("open triage items", reviewTriage.totalOpenItems, { status: "open" }),
        metricFilterButton("triage lanes", reviewTriage.totalTriageLanes, {}),
        metricFilterButton("top triage summaries", reviewTriage.topItems.length, {}),
        metricFilterButton("critical lane count", reviewTriage.byLane.find((item) => item.key === "critical_stale_open")?.count ?? 0, { status: "open" }),
        metricFilterButton("manual review", reviewTriage.byLane.find((item) => item.key === "needs_manual_review")?.count ?? 0, { status: "open", reviewStatus: "pending" }),
        metricFilterButton("candidate lookup", reviewTriage.byLane.find((item) => item.key === "candidate_lookup_recommended")?.count ?? 0, { status: "open", reviewStatus: "pending" }),
        metricFilterButton("safe link candidate", reviewTriage.byLane.find((item) => item.key === "safe_link_candidate_available")?.count ?? 0, { status: "open", reviewStatus: "pending", linkStatus: "none" })
      ) : !reviewTriageLoading && !reviewTriageError ? e("div", { className: "providerEmptyState" }, "No triage guidance returned.") : null,
      reviewTriage ? e("div", { className: "webhookMetricGroups" },
        metricCountGroup("By provider", reviewTriage.byProvider, (key) => ({ provider: key as ProviderWebhookUnmatchedInboundFilters["provider"] })),
        metricCountGroup("By event type", reviewTriage.byEventType, (key) => ({ eventType: key as ProviderWebhookEventType })),
        metricCountGroup("By review status", reviewTriage.byReviewStatus, (key) => ({ reviewStatus: key as ProviderWebhookUnmatchedInboundFilters["reviewStatus"] })),
        metricCountGroup("By link status", reviewTriage.byLinkStatus, (key) => ({ linkStatus: key as ProviderWebhookUnmatchedInboundFilters["linkStatus"] })),
        metricCountGroup("By unmatched status", reviewTriage.byUnmatchedStatus, (key) => ({ unmatchedStatus: key as ProviderWebhookUnmatchedInboundFilters["unmatchedStatus"] }))
      ) : null,
      reviewTriage ? e("div", { className: "webhookMetricGroups twoColumn" },
        e("div", { className: "webhookMetricGroup" },
          e("strong", null, "Triage thresholds"),
          e("div", null,
            e("span", null, `staleWarningHours=${reviewTriage.thresholds.staleWarningHours}`),
            e("span", null, `staleCriticalHours=${reviewTriage.thresholds.staleCriticalHours}`),
            e("span", null, `overSlaHours=${reviewTriage.thresholds.overSlaHours}`)
          )
        ),
        e("div", { className: "webhookMetricGroup" },
          e("strong", null, "By lane"),
          e("div", null,
            ...reviewTriage.byLane.map((item) => e("span", { key: item.key }, `${item.label}=${item.count}`))
          )
        )
      ) : null,
      reviewTriage ? e("div", { className: "webhookEventList compact", "aria-label": "Safe triage lane cards" },
        ...reviewTriage.lanes.map((lane) => e("article", { key: lane.laneKey, className: "webhookHistoryRow" },
          e("strong", null, `${lane.label} / ${lane.severity}`),
          e("span", null, `laneKey=${lane.laneKey}`),
          e("span", null, `count=${lane.count}`),
          e("span", null, `safeDrilldownFilters=${formatAppliedFilters(lane.safeDrilldownFilters)}`),
          e("p", null, lane.description),
          e("div", { className: "webhookEventActions" },
            e("button", {
              className: "webhookEventButton",
              type: "button",
              disabled: !onUnmatchedFiltersChange,
              onClick: () => updateQueueFilters(lane.safeDrilldownFilters)
            }, "Apply lane filter"),
            ...lane.recommendedNextActions.map((action) => e("span", { key: action, className: "webhookWarningPill" }, action))
          )
        ))
      ) : null,
      reviewTriage && reviewTriage.topItems.length > 0 ? e("div", { className: "webhookEventList compact", "aria-label": "Top safe triage item summaries" },
        ...reviewTriage.topItems.map((item) => e("article", { key: item.unmatchedId, className: "webhookHistoryRow" },
          e("strong", null, `${item.triageLane} / ${item.severity} / ${providerLabel(item.provider)}`),
          e("span", null, `unmatchedId=${item.unmatchedId}`),
          e("span", null, `platform=${item.platform}`),
          e("span", null, `channelAccountId=${item.channelAccountId ?? "none"}`),
          e("span", null, `safeRoomLabel=${item.safeRoomLabel}`),
          e("span", null, `roomKeyDigest=${item.roomKeyDigest ?? "none"}`),
          e("span", null, `eventType=${item.eventType}`),
          e("span", null, `ageBucket=${item.ageBucket}`),
          e("span", null, `reviewStatus=${item.reviewStatus}`),
          e("span", null, `linkStatus=${item.linkStatus}`),
          e("span", null, `unmatchedStatus=${item.unmatchedStatus}`),
          e("span", null, `routingOutcome=${item.routingOutcome}`),
          e("span", null, `diagnosticsAvailable=${String(item.diagnosticsAvailable)}`),
          e("span", null, `historyAvailable=${String(item.historyAvailable)}`),
          e("span", null, `candidatesAvailable=${String(item.candidatesAvailable)}`),
          e("span", null, `exportAvailable=${String(item.exportAvailable)}`),
          e("span", null, `receivedAt=${formatDate(item.receivedAt)}`),
          e("span", null, `externalCalls=${item.externalCalls}`),
          e("div", { className: "webhookEventActions" },
            ...item.recommendedNextActions.map((action) => triageActionControl(action, item))
          )
        ))
      ) : reviewTriage && !reviewTriageLoading ? e("div", { className: "providerEmptyState" }, "No top triage item summaries.") : null
    ),
    e("div", { className: "webhookEventSurface", "aria-label": "Provider webhook review alerts" },
      e("div", { className: "webhookEventHeader" },
        e("div", { className: "channelPanelTop" },
          e(Bell, { size: 18 }),
          e("div", null,
            e("h3", null, "Queue SLA alerts"),
            e("p", null, "Safe queue health, stale unmatched items, and alert drilldown filters.")
          )
        ),
        reviewAlerts ? e("div", { className: "webhookLastEvent", "aria-label": "Review alerts status" },
          e("span", null, "alerts generated"),
          e("strong", null, formatDate(reviewAlerts.generatedAt)),
          e("span", null, `externalCalls=${reviewAlerts.externalCalls}`),
          e("span", null, `applied filters=${formatAppliedFilters(reviewAlerts.appliedFilters)}`)
        ) : null
      ),
      reviewAlertsError ? e("div", { className: "apiErrorBox compact", role: "alert" }, reviewAlertsError) : null,
      reviewAlertsLoading ? e("div", { className: "apiLoadingBox compact" }, "Loading provider webhook review alerts...") : null,
      reviewAlerts ? e("div", { className: "webhookMetricsGrid" },
        metricFilterButton("total alerts", reviewAlerts.totalAlerts, { status: "open" }),
        metricFilterButton("info", reviewAlerts.infoCount, { status: "open" }),
        metricFilterButton("warning", reviewAlerts.warningCount, { status: "open" }),
        metricFilterButton("critical", reviewAlerts.criticalCount, { status: "open" }),
        metricFilterButton("stale open", reviewAlerts.staleOpenCount, { status: "open" }),
        metricFilterButton("over SLA", reviewAlerts.overSlaCount, { status: "open" }),
        metricFilterButton("oldest open", reviewAlerts.oldestOpenReceivedAt ? 1 : 0, { status: "open" }),
        metricFilterButton("top stale summaries", reviewAlerts.alertItems.length, { status: "open" })
      ) : !reviewAlertsLoading && !reviewAlertsError ? e("div", { className: "providerEmptyState" }, "No review alerts returned.") : null,
      reviewAlerts ? e("div", { className: "webhookMetricGroups" },
        metricCountGroup("By severity", reviewAlerts.bySeverity, () => ({ status: "open" })),
        metricCountGroup("By provider", reviewAlerts.byProvider, (key) => ({ provider: key as ProviderWebhookUnmatchedInboundFilters["provider"], status: "open" })),
        metricCountGroup("By event type", reviewAlerts.byEventType, (key) => ({ eventType: key as ProviderWebhookEventType, status: "open" })),
        metricCountGroup("By review status", reviewAlerts.byReviewStatus, (key) => ({ reviewStatus: key as ProviderWebhookUnmatchedInboundFilters["reviewStatus"] })),
        metricCountGroup("By unmatched status", reviewAlerts.byUnmatchedStatus, (key) => ({ unmatchedStatus: key as ProviderWebhookUnmatchedInboundFilters["unmatchedStatus"] }))
      ) : null,
      reviewAlerts ? e("div", { className: "webhookMetricGroups twoColumn" },
        e("div", { className: "webhookMetricGroup" },
          e("strong", null, "SLA/staleness thresholds"),
          e("div", null,
            e("span", null, `staleWarningHours=${reviewAlerts.thresholds.staleWarningHours}`),
            e("span", null, `staleCriticalHours=${reviewAlerts.thresholds.staleCriticalHours}`),
            e("span", null, `overSlaHours=${reviewAlerts.thresholds.overSlaHours}`),
            e("span", null, `latestAlertGeneratedAt=${reviewAlerts.latestAlertGeneratedAt ? formatDate(reviewAlerts.latestAlertGeneratedAt) : "none"}`),
            e("span", null, `oldestOpenReceivedAt=${reviewAlerts.oldestOpenReceivedAt ? formatDate(reviewAlerts.oldestOpenReceivedAt) : "none"}`)
          )
        ),
        e("div", { className: "webhookMetricGroup" },
          e("strong", null, "By link status"),
          e("div", null,
            ...reviewAlerts.byLinkStatus.map((item) => metricFilterButton(item.label, item.count, { linkStatus: item.key as ProviderWebhookUnmatchedInboundFilters["linkStatus"] }))
          )
        )
      ) : null,
      reviewAlerts && reviewAlerts.alertItems.length > 0 ? e("div", { className: "webhookEventList compact", "aria-label": "Top stale unmatched alert summaries" },
        ...reviewAlerts.alertItems.map((item) => e("article", { key: item.unmatchedId, className: "webhookHistoryRow" },
          e("strong", null, `${item.severity} / ${providerLabel(item.provider)} / ${item.eventType}`),
          e("span", null, `unmatchedId=${item.unmatchedId}`),
          e("span", null, `platform=${item.platform}`),
          e("span", null, `channelAccountId=${item.channelAccountId ?? "none"}`),
          e("span", null, `safeRoomLabel=${item.safeRoomLabel}`),
          e("span", null, `roomKeyDigest=${item.roomKeyDigest ?? "none"}`),
          e("span", null, `ageBucket=${item.ageBucket}`),
          e("span", null, `reviewStatus=${item.reviewStatus}`),
          e("span", null, `linkStatus=${item.linkStatus}`),
          e("span", null, `unmatchedStatus=${item.unmatchedStatus}`),
          e("span", null, `routingOutcome=${item.routingOutcome}`),
          e("span", null, `diagnosticsAvailable=${String(item.diagnosticsAvailable)}`),
          e("span", null, `historyAvailable=${String(item.historyAvailable)}`),
          e("span", null, `receivedAt=${formatDate(item.receivedAt)}`),
          e("span", null, `externalCalls=${item.externalCalls}`),
          e("div", { className: "webhookEventActions" },
            e("button", {
              className: "webhookEventButton",
              type: "button",
              disabled: !onUnmatchedFiltersChange,
              onClick: () => updateQueueFilters({
                provider: item.provider,
                eventType: item.eventType,
                reviewStatus: item.reviewStatus,
                linkStatus: item.linkStatus,
                unmatchedStatus: item.unmatchedStatus
              })
            }, "Apply filters"),
            e("button", {
              className: "webhookEventButton",
              type: "button",
              disabled: !item.diagnosticsAvailable || diagnosticsLoadingId === item.unmatchedId || !onLoadDiagnostics,
              onClick: () => void onLoadDiagnostics?.(item.unmatchedId)
            },
              e(Activity, { size: 15 }),
              diagnosticsLoadingId === item.unmatchedId ? "Loading diagnostics..." : "Open diagnostics"
            )
          )
        ))
      ) : reviewAlerts && !reviewAlertsLoading ? e("div", { className: "providerEmptyState" }, "No stale unmatched alert summaries.") : null
    ),
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
    e("div", { className: "webhookEventSurface", "aria-label": "Provider webhook review saved views" },
      e("div", { className: "webhookEventHeader" },
        e("div", { className: "channelPanelTop" },
          e(Star, { size: 18 }),
          e("div", null,
            e("h3", null, "Saved review views"),
            e("p", null, "Safe filter presets only. Applying a view updates filters without review, skip, link, or message persistence.")
          )
        ),
        e("div", { className: "webhookLastEvent", "aria-label": "Saved views status" },
          e("span", null, `saved view count=${reviewSavedViews.length}`),
          e("span", null, `externalCalls=${reviewSavedViews.every((view) => view.externalCalls === 0) ? 0 : "check"}`)
        )
      ),
      reviewSavedViewsError ? e("div", { className: "apiErrorBox compact", role: "alert" }, reviewSavedViewsError) : null,
      reviewSavedViewsLoading ? e("div", { className: "apiLoadingBox compact" }, "Loading saved review views...") : null,
      reviewSavedViewActionStatus ? e("div", { className: "webhookActionStatus", role: "status", "aria-live": "polite" }, reviewSavedViewActionStatus) : null,
      e("form", { className: "webhookEventForm", onSubmit: submitSavedView },
        e("label", { className: "settingsInlineField" },
          e("span", null, "View name"),
          e("input", {
            value: savedViewName,
            maxLength: 80,
            onChange: (event: React.ChangeEvent<HTMLInputElement>) => setSavedViewName(event.target.value),
            placeholder: "Current review queue"
          })
        ),
        e("label", { className: "settingsInlineField" },
          e("span", null, "Description"),
          e("input", {
            value: savedViewDescription,
            maxLength: 240,
            onChange: (event: React.ChangeEvent<HTMLInputElement>) => setSavedViewDescription(event.target.value),
            placeholder: "optional safe label"
          })
        ),
        e("label", { className: "webhookSelectRow" },
          e("input", {
            type: "checkbox",
            checked: savedViewPinned,
            onChange: (event: React.ChangeEvent<HTMLInputElement>) => setSavedViewPinned(event.target.checked)
          }),
          e("span", null, "Pin")
        ),
        e("label", { className: "webhookSelectRow" },
          e("input", {
            type: "checkbox",
            checked: savedViewDefault,
            onChange: (event: React.ChangeEvent<HTMLInputElement>) => setSavedViewDefault(event.target.checked)
          }),
          e("span", null, "Default")
        ),
        e("button", {
          className: "webhookEventButton",
          type: "submit",
          disabled: reviewSavedViewSaving || !savedViewName.trim() || !onCreateSavedView
        },
          e(Star, { size: 15 }),
          reviewSavedViewSaving ? "Saving view..." : "Save current filters"
        )
      ),
      reviewSavedViews.length > 0 ? e("div", { className: "webhookEventList compact" },
        ...reviewSavedViews.map((view) => e("article", { key: view.id, className: "webhookHistoryRow" },
          e("strong", null, view.name),
          view.description ? e("span", null, `description=${view.description}`) : null,
          e("span", null, `filters=${formatSavedViewFilters(view)}`),
          e("span", null, `sort=${view.sort.sortBy} ${view.sort.sortDirection}`),
          e("span", null, `pinned=${String(view.pinned)}`),
          e("span", null, `default=${String(view.isDefault)}`),
          e("span", null, `archived=${String(view.archived)}`),
          e("span", null, `createdBy=${view.createdBy ?? "system"}`),
          e("span", null, `updatedAt=${formatDate(view.updatedAt)}`),
          e("span", null, `externalCalls=${view.externalCalls}`),
          e("div", { className: "webhookEventActions" },
            e("button", {
              className: "webhookEventButton",
              type: "button",
              disabled: !onApplySavedView,
              onClick: () => onApplySavedView?.(view)
            },
              e(Pin, { size: 15 }),
              "Apply saved view"
            ),
            e("button", {
              className: "webhookEventButton",
              type: "button",
              disabled: reviewSavedViewSaving || !onArchiveSavedView,
              onClick: () => void onArchiveSavedView?.(view.id)
            },
              e(X, { size: 15 }),
              "Archive"
            )
          )
        ))
      ) : !reviewSavedViewsLoading && !reviewSavedViewsError ? e("div", { className: "providerEmptyState" }, "No saved review views yet.") : null
    ),
    e("div", { className: "webhookEventSurface", "aria-label": "Unmatched inbound review queue" },
      e("div", { className: "webhookEventHeader" },
        e("div", null,
          e("h3", null, "Unmatched inbound review"),
          e("p", null, "Sandbox no-match queue with safe digests only.")
        ),
        e("div", { className: "providerReadinessSummary", "aria-label": "Unmatched inbound queue summary" },
          e("span", null, `visible unmatched count=${unmatchedInboundItems.length}`),
          e("span", null, `total unmatched count=${pagination.totalCount}`),
          e("span", null, `page size=${pagination.limit}`),
          e("span", null, `page offset=${pagination.offset}`),
          e("span", null, `applied sort=${appliedSort.sortBy} ${appliedSort.sortOrder}`),
          e("span", null, `selected count=${selectedUnmatchedIds.length}`),
          e("span", null, `visible open count=${queueSummary.open}`),
          e("span", null, `visible reviewed count=${queueSummary.reviewed}`),
          e("span", null, `visible skipped count=${queueSummary.skipped}`),
          e("span", null, `visible linked count=${queueSummary.linked}`),
          unmatchedPageSummary ? e("span", null, `filtered open count=${unmatchedPageSummary.openCount}`) : null
        )
      ),
      e("div", { className: "webhookEventForm", "aria-label": "Unmatched inbound queue filters" },
        e("label", { className: "settingsInlineField" },
          e("span", null, "Provider filter"),
          e("select", {
            value: unmatchedFilters.provider ?? "all",
            onChange: (event: React.ChangeEvent<HTMLSelectElement>) => updateQueueFilters({ provider: event.target.value === "all" ? undefined : event.target.value as ProviderWebhookUnmatchedInboundFilters["provider"] })
          },
            e("option", { value: "all" }, "All providers"),
            ...providers.map((item) => e("option", { key: item, value: item }, providerLabel(item)))
          )
        ),
        e("label", { className: "settingsInlineField" },
          e("span", null, "Review status"),
          e("select", {
            value: unmatchedFilters.reviewStatus ?? "all",
            onChange: (event: React.ChangeEvent<HTMLSelectElement>) => updateQueueFilters({ reviewStatus: event.target.value === "all" ? undefined : event.target.value as ProviderWebhookUnmatchedInboundFilters["reviewStatus"] })
          },
            e("option", { value: "all" }, "All review"),
            ...reviewStatuses.map((item) => e("option", { key: item, value: item }, item))
          )
        ),
        e("label", { className: "settingsInlineField" },
          e("span", null, "Link status"),
          e("select", {
            value: unmatchedFilters.linkStatus ?? "all",
            onChange: (event: React.ChangeEvent<HTMLSelectElement>) => updateQueueFilters({ linkStatus: event.target.value === "all" ? undefined : event.target.value as ProviderWebhookUnmatchedInboundFilters["linkStatus"] })
          },
            e("option", { value: "all" }, "All links"),
            ...linkStatuses.map((item) => e("option", { key: item, value: item }, item))
          )
        ),
        e("label", { className: "settingsInlineField" },
          e("span", null, "Queue status"),
          e("select", {
            value: unmatchedFilters.status ?? "all",
            onChange: (event: React.ChangeEvent<HTMLSelectElement>) => updateQueueFilters({ status: event.target.value === "all" ? undefined : event.target.value as ProviderWebhookUnmatchedInboundFilters["status"] })
          },
            e("option", { value: "all" }, "All queue"),
            ...queueStatuses.map((item) => e("option", { key: item, value: item }, item))
          )
        ),
        e("label", { className: "settingsInlineField" },
          e("span", null, "Unmatched status"),
          e("select", {
            value: unmatchedFilters.unmatchedStatus ?? "all",
            onChange: (event: React.ChangeEvent<HTMLSelectElement>) => updateQueueFilters({ unmatchedStatus: event.target.value === "all" ? undefined : event.target.value as ProviderWebhookUnmatchedInboundFilters["unmatchedStatus"] })
          },
            e("option", { value: "all" }, "All unmatched"),
            ...unmatchedStatuses.map((item) => e("option", { key: item, value: item }, item))
          )
        ),
        e("label", { className: "settingsInlineField" },
          e("span", null, "Event type"),
          e("select", {
            value: unmatchedFilters.eventType ?? "all",
            onChange: (event: React.ChangeEvent<HTMLSelectElement>) => updateQueueFilters({ eventType: event.target.value === "all" ? undefined : event.target.value as ProviderWebhookEventType })
          },
            e("option", { value: "all" }, "All events"),
            ...eventTypes.map((item) => e("option", { key: item, value: item }, item))
          )
        ),
        e("label", { className: "settingsInlineField" },
          e("span", null, "Received from"),
          e("input", {
            type: "datetime-local",
            value: toDateTimeLocal(unmatchedFilters.receivedAtFrom ?? unmatchedFilters.receivedFrom),
            onChange: (event: React.ChangeEvent<HTMLInputElement>) => updateQueueFilters({ receivedAtFrom: fromDateTimeLocal(event.target.value) })
          })
        ),
        e("label", { className: "settingsInlineField" },
          e("span", null, "Received to"),
          e("input", {
            type: "datetime-local",
            value: toDateTimeLocal(unmatchedFilters.receivedAtTo ?? unmatchedFilters.receivedTo),
            onChange: (event: React.ChangeEvent<HTMLInputElement>) => updateQueueFilters({ receivedAtTo: fromDateTimeLocal(event.target.value) })
          })
        ),
        e("label", { className: "settingsInlineField" },
          e("span", null, "Page size"),
          e("select", {
            value: String(pagination.limit),
            onChange: (event: React.ChangeEvent<HTMLSelectElement>) => updateQueueFilters({ limit: Number(event.target.value), offset: 0 })
          },
            ...pageSizes.map((item) => e("option", { key: item, value: item }, String(item)))
          )
        ),
        e("label", { className: "settingsInlineField" },
          e("span", null, "Sort order"),
          e("select", {
            value: appliedSort.sortOrder,
            onChange: (event: React.ChangeEvent<HTMLSelectElement>) => updateQueueFilters({ sortBy: "receivedAt", sortOrder: event.target.value as ProviderWebhookUnmatchedInboundFilters["sortOrder"] })
          },
            e("option", { value: "desc" }, "receivedAt newest first"),
            e("option", { value: "asc" }, "receivedAt oldest first")
          )
        ),
        e("button", {
          className: "webhookEventButton",
          type: "button",
          disabled: !pagination.hasPreviousPage || !onUnmatchedFiltersChange,
          onClick: () => moveUnmatchedPage("previous")
        },
          e(ChevronLeft, { size: 15 }),
          "Previous"
        ),
        e("button", {
          className: "webhookEventButton",
          type: "button",
          disabled: !pagination.hasNextPage || !onUnmatchedFiltersChange,
          onClick: () => moveUnmatchedPage("next")
        },
          e(ChevronRight, { size: 15 }),
          "Next"
        ),
        e("button", {
          className: "webhookEventButton",
          type: "button",
          disabled: !onUnmatchedFiltersChange,
          onClick: () => onUnmatchedFiltersChange?.({ limit: pagination.limit, offset: 0, sortBy: "receivedAt", sortOrder: "desc" })
        },
          e(X, { size: 15 }),
          "Clear filters"
        )
      ),
      e("div", { className: "webhookEventActions", "aria-label": "Unmatched inbound bulk selection" },
        e("button", {
          className: "webhookEventButton",
          type: "button",
          disabled: selectableVisibleItems.length === 0 || !onUnmatchedSelectionChange || allVisibleSelected,
          onClick: selectVisibleUnmatchedItems
        },
          e(CheckSquare, { size: 15 }),
          "Select all visible"
        ),
        e("button", {
          className: "webhookEventButton",
          type: "button",
          disabled: selectedUnmatchedIds.length === 0 || !onUnmatchedSelectionChange,
          onClick: clearUnmatchedSelection
        },
          e(X, { size: 15 }),
          "Clear selection"
        ),
        e("button", {
          className: "webhookEventButton",
          type: "button",
          disabled: selectedUnmatchedIds.length === 0 || Boolean(unmatchedBulkSavingStatus) || !onBulkReviewUnmatchedInbound,
          onClick: () => void onBulkReviewUnmatchedInbound?.("reviewed")
        },
          e(Check, { size: 15 }),
          unmatchedBulkSavingStatus === "reviewed" ? "Bulk saving..." : "Bulk Mark reviewed"
        ),
        e("button", {
          className: "webhookEventButton",
          type: "button",
          disabled: selectedUnmatchedIds.length === 0 || Boolean(unmatchedBulkSavingStatus) || !onBulkReviewUnmatchedInbound,
          onClick: () => void onBulkReviewUnmatchedInbound?.("skipped")
        },
          e(SkipForward, { size: 15 }),
          unmatchedBulkSavingStatus === "skipped" ? "Bulk saving..." : "Bulk Skip"
        ),
        e("button", {
          className: "webhookEventButton",
          type: "button",
          disabled: Boolean(unmatchedExportLoadingFormat) || !onExportUnmatchedInbound,
          onClick: () => void onExportUnmatchedInbound?.("json")
        },
          e(Download, { size: 15 }),
          unmatchedExportLoadingFormat === "json" ? "Exporting JSON..." : "Export current filtered queue"
        ),
        e("button", {
          className: "webhookEventButton",
          type: "button",
          disabled: Boolean(unmatchedExportLoadingFormat) || !onExportUnmatchedInbound,
          onClick: () => void onExportUnmatchedInbound?.("csv")
        },
          e(Download, { size: 15 }),
          unmatchedExportLoadingFormat === "csv" ? "Exporting CSV..." : "Export CSV"
        )
      ),
      unmatchedInboundError ? e("div", { className: "apiErrorBox compact", role: "alert" }, unmatchedInboundError) : null,
      unmatchedExportError ? e("div", { className: "apiErrorBox compact", role: "alert" }, unmatchedExportError) : null,
      unmatchedExportResult ? e("div", { className: "webhookActionStatus", role: "status", "aria-live": "polite" },
        `Export ${unmatchedExportResult.format}: exportedCount=${unmatchedExportResult.exportedCount}; exportMaxLimit=${unmatchedExportResult.exportMaxLimit}; externalCalls=${unmatchedExportResult.externalCalls}`
      ) : null,
      unmatchedActionStatus ? e("div", { className: "webhookActionStatus", role: "status", "aria-live": "polite" }, unmatchedActionStatus) : null,
      unmatchedBulkResult ? e("div", { className: "webhookEventList compact", "aria-label": "Bulk unmatched review result" },
        ...unmatchedBulkResult.results.map((result) => e("div", { key: `${result.id}-${result.resultStatus}`, className: "webhookActionStatus", role: result.ok ? "status" : "alert" },
          `${result.id}: ${result.resultStatus}; reviewStatus=${result.reviewStatus ?? "none"}; unmatchedStatus=${result.unmatchedStatus ?? "none"}; error=${result.error ?? "none"}; externalCalls=${result.externalCalls}`
        ))
      ) : null,
      unmatchedInboundLoading ? e("div", { className: "apiLoadingBox compact" }, "Loading unmatched inbound review items...") : null,
      unmatchedInboundItems.length > 0 ? e("div", { className: "webhookEventList" },
        ...unmatchedInboundItems.map((item) => e("article", { key: item.id, className: "webhookEventRow" },
          e("div", null,
            e("label", { className: "webhookSelectRow" },
              e("input", {
                type: "checkbox",
                checked: selectedUnmatchedSet.has(item.id),
                disabled: !isOpenUnmatchedItem(item) || !onUnmatchedSelectionChange || Boolean(unmatchedBulkSavingStatus),
                onChange: (event: React.ChangeEvent<HTMLInputElement>) => toggleUnmatchedSelection(item.id, event.target.checked)
              }),
              e("strong", null, `${providerLabel(item.provider)} unmatched inbound`)
            ),
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
          e("div", { className: "webhookEventActions" },
            e("button", {
              className: "webhookEventButton",
              type: "button",
              disabled: diagnosticsLoadingId === item.id || !onLoadDiagnostics,
              onClick: () => void onLoadDiagnostics?.(item.id)
            },
              e(Activity, { size: 15 }),
              diagnosticsLoadingId === item.id ? "Loading diagnostics..." : "View diagnostics"
            ),
            e("button", {
              className: "webhookEventButton",
              type: "button",
              disabled: historyLoadingId === item.id || !onLoadHistory,
              onClick: () => void onLoadHistory?.(item.id)
            },
              e(FileClock, { size: 15 }),
              historyLoadingId === item.id ? "Loading history..." : "View history"
            ),
            activeDiagnosticsId === item.id && activeDiagnostics ? e("span", null, `diagnostics warnings=${warningLabels(activeDiagnostics).length}`) : null,
            activeHistoryId === item.id && activeHistory ? e("span", null, `history entries=${activeHistory.entries.length}`) : null
          ),
          activeDiagnosticsId === item.id ? e("div", { className: "webhookHistorySurface", "aria-label": `Safe diagnostics for ${item.id}` },
            diagnosticsErrorById[item.id] ? e("div", { className: "apiErrorBox compact", role: "alert" }, diagnosticsErrorById[item.id]) : null,
            diagnosticsLoadingId === item.id ? e("div", { className: "apiLoadingBox compact" }, "Loading safe diagnostics...") : null,
            activeDiagnostics && activeDiagnostics.unmatchedId === item.id ? e("div", { className: "webhookDiagnosticsGrid" },
              e("div", null,
                e("strong", null, "Routing"),
                e("span", null, `platform=${activeDiagnostics.platform}`),
                e("span", null, `channelAccountId=${activeDiagnostics.channelAccountId ?? "none"}`),
                e("span", null, `safeRoomLabel=${activeDiagnostics.safeRoomLabel}`),
                e("span", null, `roomKeyDigest=${activeDiagnostics.roomKeyDigest ?? "none"}`),
                e("span", null, `routingOutcome=${activeDiagnostics.routingOutcome}`),
                e("span", null, `normalizedEventType=${activeDiagnostics.normalizedEventType}`)
              ),
              e("div", null,
                e("strong", null, "Review state"),
                e("span", null, `eventType=${activeDiagnostics.eventType}`),
                e("span", null, `reviewStatus=${activeDiagnostics.reviewStatus}`),
                e("span", null, `linkStatus=${activeDiagnostics.linkStatus}`),
                e("span", null, `unmatchedStatus=${activeDiagnostics.unmatchedStatus}`),
                e("span", null, `persistenceOutcome=${activeDiagnostics.persistenceOutcome}`),
                e("span", null, `lastActionAt=${activeDiagnostics.lastActionAt ? formatDate(activeDiagnostics.lastActionAt) : "none"}`)
              ),
              e("div", null,
                e("strong", null, "Safe capabilities"),
                e("span", null, `candidateLookupAvailable=${String(activeDiagnostics.candidateLookupAvailable)}`),
                e("span", null, `historyAvailable=${String(activeDiagnostics.historyAvailable)}`),
                e("span", null, `exportAvailable=${String(activeDiagnostics.exportAvailable)}`),
                e("span", null, `externalCalls=${activeDiagnostics.externalCalls}`)
              ),
              e("div", null,
                e("strong", null, "Warnings"),
                ...warningLabels(activeDiagnostics).map((warning) => e("span", { key: warning, className: "webhookWarningPill" },
                  e(AlertTriangle, { size: 13 }),
                  warning
                )),
                warningLabels(activeDiagnostics).length === 0 ? e("span", null, "none") : null
              )
            ) : !diagnosticsLoadingId && !diagnosticsErrorById[item.id] ? e("div", { className: "providerEmptyState" }, "No safe diagnostics returned for this unmatched item.") : null
          ) : null,
          activeHistoryId === item.id ? e("div", { className: "webhookHistorySurface", "aria-label": `Safe history for ${item.id}` },
            historyErrorById[item.id] ? e("div", { className: "apiErrorBox compact", role: "alert" }, historyErrorById[item.id]) : null,
            historyLoadingId === item.id ? e("div", { className: "apiLoadingBox compact" }, "Loading unmatched inbound history...") : null,
            activeHistory && activeHistory.unmatchedInboundId === item.id && activeHistory.entries.length > 0 ? e("div", { className: "webhookEventList compact" },
              ...activeHistory.entries.map((entry) => e("div", { key: entry.id, className: "webhookHistoryRow" },
                e("strong", null, `${entry.action} / ${entry.actionStatus}`),
                e("span", null, `time=${formatDate(entry.actionAt)}`),
                e("span", null, `actor=${entry.actor ?? "system"}`),
                e("span", null, `platform=${entry.provider}`),
                e("span", null, `channelAccountId=${entry.channelAccountId ?? "none"}`),
                e("span", null, `safeRoomLabel=${entry.safeRoomLabel}`),
                e("span", null, `roomKeyDigest=${entry.roomKeyDigest ?? "none"}`),
                e("span", null, `statusBefore=${entry.statusBefore ?? "none"}`),
                e("span", null, `statusAfter=${entry.statusAfter ?? "none"}`),
                e("span", null, `linkedConversationId=${entry.linkedConversationId ?? "none"}`),
                e("span", null, `linkedMessageId=${entry.linkedMessageId ?? "none"}`),
                e("span", null, `receivedAt=${entry.receivedAt ? formatDate(entry.receivedAt) : "none"}`),
                entry.reason ? e("p", null, `reason=${entry.reason}`) : null,
                entry.message ? e("p", null, entry.message) : null,
                e("span", null, `externalCalls=${entry.externalCalls}`)
              ))
            ) : !historyLoadingId && !historyErrorById[item.id] ? e("div", { className: "providerEmptyState" }, "No safe history entries for this unmatched item.") : null
          ) : null,
          e("div", { className: "webhookHistorySurface", "aria-label": `Operator notes for ${item.id}` },
            e("div", { className: "webhookEventActions" },
              e("button", {
                className: "webhookEventButton",
                type: "button",
                disabled: operatorNotesLoadingId === item.id || !onLoadOperatorNotes,
                onClick: () => void onLoadOperatorNotes?.(item.id)
              },
                e(NotebookPen, { size: 15 }),
                operatorNotesLoadingId === item.id ? "Loading notes..." : "Load operator notes"
              ),
              (operatorNotesById[item.id] ?? []).length > 0 ? e("span", null, `note count=${operatorNotesById[item.id].length}`) : null
            ),
            operatorNotesErrorById[item.id] ? e("div", { className: "apiErrorBox compact", role: "alert" }, operatorNotesErrorById[item.id]) : null,
            operatorNotesLoadingId === item.id ? e("div", { className: "apiLoadingBox compact" }, "Loading operator notes...") : null,
            e("div", { className: "webhookEventForm" },
              e("label", { className: "settingsInlineField wide" },
                e("span", null, "Operator note"),
                e("input", {
                  value: operatorNoteDrafts[item.id] ?? "",
                  maxLength: 1000,
                  onChange: (event: React.ChangeEvent<HTMLInputElement>) => setOperatorNoteDrafts((current) => ({ ...current, [item.id]: event.target.value })),
                  placeholder: "Add safe note"
                })
              ),
              e("button", {
                className: "webhookEventButton",
                type: "button",
                disabled: operatorNoteSavingId === item.id || !(operatorNoteDrafts[item.id] ?? "").trim() || !onCreateOperatorNote,
                onClick: () => void submitOperatorNote(item.id)
              },
                e(NotebookPen, { size: 15 }),
                operatorNoteSavingId === item.id ? "Saving note..." : "Add note"
              )
            ),
            (operatorNotesById[item.id] ?? []).length > 0 ? e("div", { className: "webhookEventList compact" },
              ...operatorNotesById[item.id].map((note) => e("div", { key: note.id, className: "webhookHistoryRow" },
                e("strong", null, `note / ${formatDate(note.createdAt)}`),
                e("span", null, `author=${note.authorLabel ?? note.authorId ?? "system"}`),
                e("span", null, `platform=${note.context.platform}`),
                e("span", null, `channelAccountId=${note.context.channelAccountId ?? "none"}`),
                e("span", null, `safeRoomLabel=${note.context.safeRoomLabel}`),
                e("span", null, `eventType=${note.context.eventType}`),
                e("span", null, `reviewStatus=${note.context.reviewStatus}`),
                e("span", null, `linkStatus=${note.context.linkStatus}`),
                e("span", null, `unmatchedStatus=${note.context.unmatchedStatus}`),
                e("p", null, note.note),
                e("span", null, `externalCalls=${note.externalCalls}`)
              ))
            ) : operatorNotesById[item.id] && !operatorNotesErrorById[item.id] && operatorNotesLoadingId !== item.id ? e("div", { className: "providerEmptyState" }, "No operator notes for this unmatched item.") : null
          ),
          isOpenUnmatchedItem(item) ? e("div", { className: "webhookCandidateSurface" },
            e("div", { className: "webhookEventActions" },
              e("button", {
                className: "webhookEventButton",
                type: "button",
                disabled: candidateLoadingId === item.id || !onLoadCandidates,
                onClick: () => void onLoadCandidates?.(item.id)
              },
                e(Search, { size: 15 }),
                candidateLoadingId === item.id ? "Loading candidates..." : "Load candidates"
              ),
              (candidateItemsById[item.id] ?? []).length > 0 ? e("span", null, `candidate count=${candidateItemsById[item.id].length}`) : null
            ),
            candidateErrorById[item.id] ? e("div", { className: "apiErrorBox compact", role: "alert" }, candidateErrorById[item.id]) : null,
            (candidateItemsById[item.id] ?? []).length > 0 ? e("div", { className: "webhookEventList compact" },
              ...candidateItemsById[item.id].map((candidate) => e("label", { key: candidate.conversationId, className: "webhookCandidateRow" },
                e("input", {
                  type: "radio",
                  name: `candidate-${item.id}`,
                  checked: (linkConversationIds[item.id] ?? "") === candidate.conversationId,
                  onChange: () => setLinkConversationIds((current) => ({ ...current, [item.id]: candidate.conversationId }))
                }),
                e("span", null, `conversationId=${candidate.conversationId}`),
                e("span", null, `platform=${candidate.platform}`),
                e("span", null, `channelAccountId=${candidate.channelAccountId}`),
                e("span", null, `roomIdDigest=${candidate.roomIdDigest}`),
                e("span", null, `safeRoomLabel=${candidate.safeRoomLabel}`),
                e("span", null, `matchConfidence=${candidate.matchConfidence}`),
                e("span", null, `matchReason=${candidate.matchReason}`),
                e("span", null, `latestMessageAt=${candidate.latestMessageAt ? formatDate(candidate.latestMessageAt) : "none"}`),
                candidate.latestMessagePreview ? e("p", null, candidate.latestMessagePreview) : null,
                e("span", null, `externalCalls=${candidate.externalCalls}`)
              ))
            ) : candidateItemsById[item.id] && !candidateErrorById[item.id] && candidateLoadingId !== item.id ? e("div", { className: "providerEmptyState" }, "No safe candidate conversations found.") : null
          ) : null,
          isOpenUnmatchedItem(item) ? e("div", { className: "webhookEventActions" },
            e("button", {
              className: "webhookEventButton",
              type: "button",
              disabled: unmatchedActionSavingId === item.id || Boolean(unmatchedBulkSavingStatus) || !onReviewUnmatchedInbound,
              onClick: () => void onReviewUnmatchedInbound?.(item.id, "reviewed")
            },
              e(Check, { size: 15 }),
              unmatchedActionSavingId === item.id ? "Saving..." : "Mark reviewed"
            ),
            e("button", {
              className: "webhookEventButton",
              type: "button",
              disabled: unmatchedActionSavingId === item.id || Boolean(unmatchedBulkSavingStatus) || !onReviewUnmatchedInbound,
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
              disabled: unmatchedActionSavingId === item.id || Boolean(unmatchedBulkSavingStatus) || !onLinkUnmatchedInbound || !(linkConversationIds[item.id] ?? "").trim(),
              onClick: () => void onLinkUnmatchedInbound?.(item.id, (linkConversationIds[item.id] ?? "").trim(), "link-only")
            },
              e(Link2, { size: 15 }),
              "Link only"
            ),
            e("button", {
              className: "webhookEventButton",
              type: "button",
              disabled: unmatchedActionSavingId === item.id || Boolean(unmatchedBulkSavingStatus) || !onLinkUnmatchedInbound || !(linkConversationIds[item.id] ?? "").trim(),
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

function formatAppliedFilters(filters: ProviderWebhookReviewMetrics["appliedFilters"]) {
  const entries = Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== "");
  return entries.length > 0 ? entries.map(([key, value]) => `${key}=${String(value)}`).join(";") : "none";
}

function formatSavedViewFilters(view: ProviderWebhookReviewSavedView) {
  const allowedKeys: (keyof ProviderWebhookReviewSavedView["filters"])[] = [
    "provider",
    "reviewStatus",
    "linkStatus",
    "unmatchedStatus",
    "eventType",
    "severity",
    "triageLane",
    "receivedAtFrom",
    "receivedAtTo",
    "pageSize"
  ];
  const entries = allowedKeys
    .map((key) => [key, view.filters[key]] as const)
    .filter(([, value]) => value !== undefined && value !== null && value !== "");
  return entries.length > 0 ? entries.map(([key, value]) => `${key}=${String(value)}`).join(";") : "none";
}

function warningLabels(diagnostics: ProviderWebhookUnmatchedInboundDiagnostics) {
  const warnings: string[] = [];
  if (diagnostics.safeWarnings.signatureRejected) warnings.push("signatureRejected");
  if (diagnostics.safeWarnings.replayDuplicate) warnings.push("replayDuplicate");
  if (diagnostics.safeWarnings.missingConversationMatch) warnings.push("missingConversationMatch");
  if (diagnostics.safeWarnings.staleOpenItem) warnings.push("staleOpenItem");
  return warnings;
}

function toDateTimeLocal(value: string | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

function fromDateTimeLocal(value: string) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function isOpenUnmatchedItem(item: ProviderWebhookUnmatchedInboundItem) {
  return item.unmatchedStatus === "open" || item.unmatchedStatus === "review-needed";
}

function summarizeUnmatchedQueue(items: ProviderWebhookUnmatchedInboundItem[]) {
  return {
    open: items.filter(isOpenUnmatchedItem).length,
    reviewed: items.filter((item) => item.reviewStatus === "reviewed").length,
    skipped: items.filter((item) => item.reviewStatus === "skipped").length,
    linked: items.filter((item) => item.reviewStatus === "linked").length
  };
}

const e = React.createElement;
