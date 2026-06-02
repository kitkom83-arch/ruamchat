import crypto from "node:crypto";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const baseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");
const tenantId = process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
const userId = process.env.USER_ID ?? "00000000-0000-4000-8000-000000000011";
const signingMaterial = process.env.PROVIDER_WEBHOOK_SANDBOX_SIGNING_KEY ?? "local-provider-webhook-sandbox-signing-material";
const runId = `sprint65-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const results = [];

async function main() {
  record("local API only", isLocalBaseUrl(baseUrl));

  const rootPackage = JSON.parse(readFileSync("package.json", "utf8"));
  const shared = readFileSync("packages/shared/src/index.ts", "utf8");
  const providerController = readFileSync("apps/api/src/controllers/provider-webhooks.controller.ts", "utf8");
  const providerService = readFileSync("apps/api/src/services/provider-webhook-events.service.ts", "utf8");
  const apiClient = readFileSync("apps/web/app/api-client.ts", "utf8");
  const settingsData = readFileSync("apps/web/app/settings-data.ts", "utf8");
  const providerPanel = readFileSync("apps/web/app/settings/provider-readiness-panel.tsx", "utf8");

  record("smoke script registered", rootPackage.scripts?.["smoke:sprint65"] === "node scripts/smoke-sprint65-provider-webhook-review-metrics-diagnostics.mjs");
  for (const sprint of [64, 63, 62, 61, 60, 59, 58, 57, 56, 55, 54, 53]) {
    record(`Sprint ${sprint} regression script registered`, typeof rootPackage.scripts?.[`smoke:sprint${sprint}`] === "string");
  }
  record("shared safe metrics/diagnostics DTOs registered", shared.includes("providerWebhookReviewMetricsSchema") && shared.includes("providerWebhookUnmatchedInboundDiagnosticsSchema"));
  record("backend metrics/diagnostics endpoints registered", providerController.includes("review-metrics") && providerController.includes("unmatched-inbound/:id/diagnostics"));
  record("service implements safe metrics and diagnostics", providerService.includes("getReviewMetrics") && providerService.includes("getUnmatchedInboundDiagnostics") && providerService.includes("ageBucketsForOpenItems"));
  record("API client sends metrics/diagnostics requests", apiClient.includes("getProviderWebhookReviewMetrics") && apiClient.includes("getProviderWebhookUnmatchedInboundDiagnostics"));
  record("settings data keeps API metrics/diagnostics backend-only", settingsData.includes("getProviderWebhookReviewMetrics(filters)") && settingsData.includes("getProviderWebhookUnmatchedInboundDiagnostics(unmatchedInboundId)") && settingsData.includes("mode === \"api\""));
  record("provider UI renders metrics and diagnostics controls", providerPanel.includes("Review metrics") && providerPanel.includes("View diagnostics") && providerPanel.includes("Safe diagnostics"));

  const health = await safeJson(await request("GET", "/health"));
  record("GET /health reachable", health?.status === "ok" && health?.service === "api");
  record("health response safe", noRawSecretFields(health) && noRawPayloadValues(health) && noNonzeroExternalCalls(health));

  const readinessBefore = await safeJson(await request("GET", "/health/readiness"));
  record("GET /health/readiness reachable", readinessBefore?.status === "ok" && safeReadinessSprint65Summary(readinessBefore?.providerReadiness));
  record("readiness externalCalls=0", noNonzeroExternalCalls(readinessBefore));
  record("readiness safe", noRawSecretFields(readinessBefore) && noRawPayloadValues(readinessBefore));

  const metricsBefore = await safeJson(await request("GET", "/provider-webhooks/review-metrics"));
  record("GET /provider-webhooks/review-metrics reachable", safeMetricsShape(metricsBefore));
  record("initial review metrics safe", safeMetricsShape(metricsBefore) && noRawSecretFields(metricsBefore) && noRawPayloadValues(metricsBefore) && noNonzeroExternalCalls(metricsBefore));

  const beforeUnmatched = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound"));
  record("GET /provider-webhooks/unmatched-inbound reachable", Array.isArray(unmatchedItems(beforeUnmatched)));
  record("initial unmatched response safe", unmatchedItems(beforeUnmatched).every(safeUnmatchedItemShape) && noRawSecretFields(beforeUnmatched) && noRawPayloadValues(beforeUnmatched));

  const reviewItem = await createNoMatchItem("review-one", "Safe Sprint 65 review metrics one");
  const skipItem = await createNoMatchItem("skip-one", "Safe Sprint 65 diagnostics two");
  record("POST valid signed sandbox no-match events created unmatched items", [reviewItem, skipItem].every((item) => item?.unmatchedStatus === "review-needed"));

  const unmatchedAfterCreate = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound?provider=line&reviewStatus=pending&linkStatus=none&status=open&eventType=message.created&limit=10&offset=0&sortBy=receivedAt&sortOrder=desc"));
  record("created unmatched items appear", safePageShape(unmatchedAfterCreate) && [reviewItem.id, skipItem.id].every((id) => unmatchedAfterCreate.items.some((item) => item.id === id)));

  const metricsAfterCreate = await safeJson(await request("GET", "/provider-webhooks/review-metrics"));
  record("review metrics counts changed safely", safeMetricsShape(metricsAfterCreate)
    && metricsAfterCreate.totalUnmatched >= metricsBefore.totalUnmatched + 2
    && metricsAfterCreate.totalEvents >= metricsBefore.totalEvents + 2
    && metricsAfterCreate.openUnmatched >= metricsBefore.openUnmatched + 2);
  record("review metrics after create safe", safeMetricsShape(metricsAfterCreate) && noRawSecretFields(metricsAfterCreate) && noRawPayloadValues(metricsAfterCreate) && noNonzeroExternalCalls(metricsAfterCreate));

  const filteredMetrics = await safeJson(await request("GET", "/provider-webhooks/review-metrics?provider=line&reviewStatus=pending&linkStatus=none&unmatchedStatus=review-needed&eventType=message.created&receivedAtFrom=2026-01-01T00%3A00%3A00.000Z"));
  record("GET review metrics with safe filters reachable", safeMetricsShape(filteredMetrics) && filteredMetrics.appliedFilters.provider === "line" && filteredMetrics.appliedFilters.reviewStatus === "pending");
  record("review metrics filters are safe", safeMetricsShape(filteredMetrics) && noRawSecretFields(filteredMetrics.appliedFilters) && noRawPayloadValues(filteredMetrics.appliedFilters));
  record("review metrics bucket/funnel fields present", safeMetricsShape(filteredMetrics) && typeof filteredMetrics.ageBuckets.over3Days === "number" && typeof filteredMetrics.funnel.unmatchedQueued === "number");

  const diagnosticsBeforeReview = await safeJson(await request("GET", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(reviewItem.id)}/diagnostics`));
  record("GET unmatched item diagnostics reachable", safeDiagnosticsShape(diagnosticsBeforeReview));
  record("diagnostics contains safe routing/review/link info", safeDiagnosticsShape(diagnosticsBeforeReview)
    && diagnosticsBeforeReview.provider === "line"
    && diagnosticsBeforeReview.platform === "line"
    && diagnosticsBeforeReview.channelAccountId === "sandbox:line"
    && diagnosticsBeforeReview.safeRoomLabel.includes("room digest")
    && diagnosticsBeforeReview.routingOutcome.includes("not-found")
    && diagnosticsBeforeReview.reviewStatus === "pending"
    && diagnosticsBeforeReview.linkStatus === "none");
  record("diagnostics response safe", safeDiagnosticsShape(diagnosticsBeforeReview) && noRawSecretFields(diagnosticsBeforeReview) && noRawPayloadValues(diagnosticsBeforeReview) && noNonzeroExternalCalls(diagnosticsBeforeReview));

  const reviewed = await safeJson(await request("PATCH", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(reviewItem.id)}/review`, {
    status: "reviewed",
    reason: "safe sprint 65 single review"
  }));
  record("single review action reachable", safeUnmatchedItemShape(reviewed) && reviewed.id === reviewItem.id && reviewed.reviewStatus === "reviewed" && reviewed.unmatchedStatus === "reviewed");

  const bulkSkipped = await safeJson(await request("PATCH", "/provider-webhooks/unmatched-inbound/bulk-review", {
    ids: [skipItem.id],
    reviewStatus: "skipped",
    reason: "safe sprint 65 bulk skip"
  }));
  record("bulk skip action reachable", safeBulkReviewShape(bulkSkipped) && bulkSkipped.summary.updatedCount === 1 && bulkSkipped.results[0]?.reviewStatus === "skipped");
  record("review responses safe", noRawSecretFields({ reviewed, bulkSkipped }) && noRawPayloadValues({ reviewed, bulkSkipped }) && noNonzeroExternalCalls({ reviewed, bulkSkipped }));

  const metricsAfterReview = await safeJson(await request("GET", "/provider-webhooks/review-metrics"));
  record("review metrics update after review/skip", safeMetricsShape(metricsAfterReview)
    && metricsAfterReview.reviewedCount >= metricsBefore.reviewedCount + 1
    && metricsAfterReview.skippedCount >= metricsBefore.skippedCount + 1);

  const diagnosticsAfterReview = await safeJson(await request("GET", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(reviewItem.id)}/diagnostics`));
  record("diagnostics refetch after review safe", safeDiagnosticsShape(diagnosticsAfterReview) && diagnosticsAfterReview.reviewStatus === "reviewed" && diagnosticsAfterReview.externalCalls === 0);

  const history = await safeJson(await request("GET", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(reviewItem.id)}/history`));
  record("GET unmatched item history reachable", safeHistoryShape(history));
  record("history contains reviewed entry", safeHistoryShape(history) && history.entries.some((entry) => entry.action === "reviewed"));
  record("history response is safe", noRawSecretFields(history) && noRawPayloadValues(history) && noNonzeroExternalCalls(history));

  const exported = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound/export?provider=line&reviewStatus=reviewed&eventType=message.created&limit=25&offset=0&sortBy=receivedAt&sortOrder=desc&format=json"));
  record("GET unmatched export reachable", safeExportShape(exported));
  record("export includes safe reviewed rows", safeExportShape(exported) && exported.rows.some((row) => row.id === reviewItem.id && row.reviewStatus === "reviewed"));
  record("export response is safe", noRawSecretFields(exported) && noRawPayloadValues(exported) && noNonzeroExternalCalls(exported));

  const afterEvents = await safeJson(await request("GET", "/provider-webhooks/events"));
  record("GET /provider-webhooks/events reachable", Array.isArray(afterEvents));
  record("event safe fields only", Array.isArray(afterEvents) && afterEvents.every(safeEventShape) && noRawSecretFields(afterEvents) && noRawPayloadValues(afterEvents));

  const readinessAfter = await safeJson(await request("GET", "/health/readiness"));
  record("readiness confirms metrics diagnostics and externalCalls=0", safeReadinessSprint65Summary(readinessAfter?.providerReadiness) && noNonzeroExternalCalls(readinessAfter));
  record("no provider outbound", !containsProviderOutbound({ health, readinessBefore, metricsBefore, beforeUnmatched, unmatchedAfterCreate, metricsAfterCreate, filteredMetrics, diagnosticsBeforeReview, reviewed, bulkSkipped, metricsAfterReview, diagnosticsAfterReview, history, exported, afterEvents, readinessAfter }));
  record("no live provider network evidence", noLiveProviderNetworkEvidence({ health, readinessBefore, metricsBefore, beforeUnmatched, unmatchedAfterCreate, metricsAfterCreate, filteredMetrics, diagnosticsBeforeReview, reviewed, bulkSkipped, metricsAfterReview, diagnosticsAfterReview, history, exported, afterEvents, readinessAfter }));

  finish();
}

async function createNoMatchItem(label, text) {
  const eventId = `${runId}-${label}-${Math.random().toString(16).slice(2)}`;
  const payload = linePayload(`safe-no-match-room-sprint65-${label}-${runId}`, `safe-sender-sprint65-${label}`, text);
  payload[`safeMarker${label.replace(/[^a-z0-9]/gi, "")}${Date.now()}`] = true;
  const response = await request("POST", "/provider-webhooks/sandbox-events", {
    provider: "line",
    channel: "line",
    eventType: "message.created",
    mode: "sandbox",
    inboundPersistenceMode: "sandbox-persist",
    eventId,
    timestamp: "2026-06-03T06:00:00.000Z",
    signature: signPayload(payload),
    payload
  });
  const body = await safeJson(response);
  record(`POST valid signed sandbox no-match event reachable (${label})`, response.status === 201 || response.status === 200);
  record(`valid event safe DTO (${label})`, safeEventShape(body) && noRawSecretFields(body) && noRawPayloadValues(body));
  const unmatched = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound"));
  return unmatchedItems(unmatched).find((item) => item.id === body?.unmatchedInboundId) ?? null;
}

async function request(method, path, body, extraHeaders = {}) {
  return fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      "x-tenant-id": tenantId,
      "x-user-id": userId,
      ...extraHeaders
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
}

async function safeJson(response) {
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

function linePayload(roomId, userId, text) {
  return {
    events: [{
      type: "message",
      timestamp: 1760000000000,
      replyToken: "raw-reply-token-sprint65",
      source: { type: "room", userId, roomId },
      message: { id: "safe-message-sprint65", type: "text", text }
    }]
  };
}

function signPayload(payload) {
  return `sha256=${crypto.createHmac("sha256", signingMaterial).update(canonicalJson(payload)).digest("hex")}`;
}

function canonicalJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((item) => canonicalJson(item)).join(",")}]`;
  return `{${Object.entries(value).sort(([left], [right]) => left.localeCompare(right)).map(([key, child]) => `${JSON.stringify(key)}:${canonicalJson(child)}`).join(",")}}`;
}

function unmatchedItems(value) {
  if (Array.isArray(value)) return value;
  if (value && Array.isArray(value.items)) return value.items;
  return [];
}

function safePageShape(value) {
  if (!value || typeof value !== "object" || !Array.isArray(value.items)) return false;
  const allowed = new Set(["items", "pagination", "appliedFilters", "appliedSort", "summary", "externalCalls"]);
  return Object.keys(value).every((key) => allowed.has(key))
    && value.items.every(safeUnmatchedItemShape)
    && value.pagination?.totalCount >= value.items.length
    && value.pagination?.limit > 0
    && value.pagination?.offset >= 0
    && value.appliedSort?.sortBy === "receivedAt"
    && ["asc", "desc"].includes(value.appliedSort?.sortOrder)
    && value.externalCalls === 0;
}

function safeMetricsShape(value) {
  if (!value || typeof value !== "object") return false;
  const allowed = new Set([
    "generatedAt", "appliedFilters", "totalEvents", "totalUnmatched", "openUnmatched",
    "reviewedCount", "skippedCount", "linkedCount", "persistedInboundCount",
    "signatureRejectedCount", "replayRejectedCount", "byProvider", "byEventType",
    "byReviewStatus", "byLinkStatus", "byUnmatchedStatus", "ageBuckets", "funnel",
    "latestReceivedAt", "oldestOpenReceivedAt", "externalCalls"
  ]);
  return Object.keys(value).every((key) => allowed.has(key))
    && safeCountRows(value.byProvider)
    && safeCountRows(value.byEventType)
    && safeCountRows(value.byReviewStatus)
    && safeCountRows(value.byLinkStatus)
    && safeCountRows(value.byUnmatchedStatus)
    && typeof value.ageBuckets?.under1Hour === "number"
    && typeof value.funnel?.inboundReceived === "number"
    && value.externalCalls === 0;
}

function safeCountRows(value) {
  const allowed = new Set(["key", "label", "count"]);
  return Array.isArray(value) && value.every((row) => Object.keys(row).every((key) => allowed.has(key)) && typeof row.count === "number");
}

function safeDiagnosticsShape(value) {
  if (!value || typeof value !== "object") return false;
  const allowed = new Set([
    "unmatchedId", "provider", "platform", "channelAccountId", "safeRoomLabel", "roomKeyDigest",
    "eventType", "receivedAt", "reviewStatus", "linkStatus", "unmatchedStatus",
    "routingOutcome", "normalizedEventType", "persistenceOutcome", "candidateLookupAvailable",
    "historyAvailable", "exportAvailable", "lastActionAt", "safeWarnings", "externalCalls"
  ]);
  const warningAllowed = new Set(["signatureRejected", "replayDuplicate", "missingConversationMatch", "staleOpenItem"]);
  return Object.keys(value).every((key) => allowed.has(key))
    && value.provider === value.platform
    && value.externalCalls === 0
    && value.safeWarnings
    && Object.keys(value.safeWarnings).every((key) => warningAllowed.has(key));
}

function safeBulkReviewShape(value) {
  if (!value || typeof value !== "object" || !Array.isArray(value.results)) return false;
  const allowed = new Set(["reviewStatus", "results", "summary", "externalCalls"]);
  const resultAllowed = new Set(["id", "ok", "resultStatus", "reviewStatus", "unmatchedStatus", "error", "externalCalls"]);
  return Object.keys(value).every((key) => allowed.has(key))
    && ["reviewed", "skipped"].includes(value.reviewStatus)
    && value.externalCalls === 0
    && value.results.every((result) => Object.keys(result).every((key) => resultAllowed.has(key)) && result.externalCalls === 0);
}

function safeHistoryShape(value) {
  if (!value || typeof value !== "object" || !Array.isArray(value.entries)) return false;
  const allowed = new Set(["unmatchedInboundId", "provider", "channelAccountId", "safeRoomLabel", "roomKeyDigest", "entries", "externalCalls"]);
  const entryAllowed = new Set([
    "id", "unmatchedInboundId", "provider", "channelAccountId", "safeRoomLabel", "roomKeyDigest",
    "eventType", "action", "actionStatus", "statusBefore", "statusAfter", "actor", "reason",
    "message", "linkedConversationId", "linkedMessageId", "receivedAt", "actionAt", "externalCalls"
  ]);
  return Object.keys(value).every((key) => allowed.has(key))
    && value.externalCalls === 0
    && value.entries.every((entry) => Object.keys(entry).every((key) => entryAllowed.has(key)) && entry.externalCalls === 0);
}

function safeExportShape(value) {
  if (!value || typeof value !== "object" || !Array.isArray(value.rows)) return false;
  const allowed = new Set(["format", "rows", "csv", "appliedFilters", "appliedSort", "requestedLimit", "exportMaxLimit", "exportedCount", "externalCalls"]);
  const rowAllowed = new Set([
    "id", "provider", "channelAccountId", "safeRoomLabel", "roomKeyDigest", "eventType",
    "reviewStatus", "linkStatus", "unmatchedStatus", "receivedAt", "reviewedAt",
    "linkedConversationId", "candidateCount", "safeMessagePreview", "safeReason",
    "safeResultSummary", "externalCalls"
  ]);
  return Object.keys(value).every((key) => allowed.has(key))
    && ["json", "csv"].includes(value.format)
    && value.externalCalls === 0
    && value.rows.every((row) => Object.keys(row).every((key) => rowAllowed.has(key)) && row.externalCalls === 0);
}

function safeEventShape(value) {
  if (!value || typeof value !== "object") return false;
  const allowed = new Set([
    "id", "tenantId", "provider", "channel", "eventType", "mode", "status", "receivedAt",
    "payloadSummary", "payloadFieldCount", "payloadDigest", "signatureVerified", "signatureStatus",
    "signatureAlgorithm", "signatureFingerprint", "signedAt", "replayDetected", "replayStatus",
    "dedupKeyDigest", "previousEventSeenAt", "normalized", "normalizationStatus", "normalizedEventType",
    "direction", "messageType", "textPreview", "textLength", "mediaSummary", "senderKeyDigest",
    "roomKeyDigest", "dryRunRouting", "routingStatus", "conversationLookupStatus", "conversationKeyDigest",
    "channelAccountId", "roomIdDigest", "inboundPersistenceMode", "inboundPersistenceStatus",
    "messagePersisted", "persistedMessageId", "conversationId", "unmatchedInboundQueued",
    "unmatchedInboundId", "unmatchedStatus", "unmatchedReason", "unmatchedReviewActionStatus",
    "unmatchedLinkStatus", "linkedConversationId", "linkedMessageId", "unmatchedResolvedAt",
    "inboundAuditStatus", "externalCalls"
  ]);
  return Object.keys(value).every((key) => allowed.has(key)) && value.direction === "inbound" && value.externalCalls === 0;
}

function safeUnmatchedItemShape(value) {
  if (!value || typeof value !== "object") return false;
  const allowed = new Set([
    "id", "tenantId", "provider", "channelAccountId", "mode", "eventType", "normalizedEventType",
    "messageType", "normalizationStatus", "routingStatus", "conversationLookupStatus", "unmatchedStatus",
    "unmatchedReason", "reviewStatus", "reviewedAt", "reviewedBy", "reviewReason", "linkStatus",
    "linkedConversationId", "linkedMessageId", "unmatchedResolvedAt", "messagePersisted", "payloadDigest",
    "providerEventDigest", "deliveryDigest", "senderKeyDigest", "roomKeyDigest", "textPreview",
    "textLength", "receivedAt", "externalCalls"
  ]);
  return Object.keys(value).every((key) => allowed.has(key))
    && value.mode === "sandbox"
    && value.conversationLookupStatus === "not-found"
    && value.externalCalls === 0;
}

function safeReadinessSprint65Summary(readiness) {
  return readiness?.webhookUnmatchedInboundReviewEnabled === true
    && readiness.webhookUnmatchedReviewActionsEnabled === true
    && readiness.webhookCandidateLookupEnabled === true
    && readiness.webhookUnmatchedHistoryEnabled === true
    && readiness.webhookUnmatchedQueueExportEnabled === true
    && readiness.webhookReviewMetricsEnabled === true
    && readiness.webhookDiagnosticsEnabled === true
    && readiness.webhookUnmatchedQueueExportMaxLimit === 500
    && typeof readiness.unmatchedInboundOpenCount === "number"
    && typeof readiness.unmatchedInboundStaleOpenCount === "number"
    && typeof readiness.unmatchedInboundQueuedCount === "number"
    && typeof readiness.unmatchedInboundReviewedCount === "number"
    && typeof readiness.unmatchedInboundSkippedCount === "number"
    && typeof readiness.unmatchedInboundLinkedCount === "number"
    && readiness.externalCalls === 0;
}

function isLocalBaseUrl(value) {
  try {
    const parsed = new URL(value);
    return ["localhost", "127.0.0.1", "::1"].includes(parsed.hostname);
  } catch {
    return false;
  }
}

function containsProviderOutbound(value) {
  const text = JSON.stringify(value ?? {});
  return /outbound\.queued|outbound\.sent|queued_provider|sent_provider|line\.push|telegram\.send|facebook\.send|instagram\.send/i.test(text);
}

function noLiveProviderNetworkEvidence(value) {
  const text = JSON.stringify(value ?? {});
  return !/api\.line\.me|api\.telegram\.org|graph\.facebook\.com|provider_network_call|live_provider_call/i.test(text);
}

function noNonzeroExternalCalls(value) {
  const stack = [value];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || typeof current !== "object") continue;
    for (const [key, child] of Object.entries(current)) {
      if (key === "externalCalls") {
        if (Array.isArray(child) && child.length === 0) continue;
        if (child !== 0) return false;
      }
      if (child && typeof child === "object") stack.push(child);
    }
  }
  return true;
}

function noRawSecretFields(value) {
  return !findUnsafeSecretPath(value);
}

function findUnsafeSecretPath(value) {
  const forbidden = new Set([
    "token", "secret", "accessToken", "refreshToken", "accessTokenCiphertext", "webhookSecret",
    "webhookSignature", "appSecret", "botToken", "verifyToken", "apiKey", "authorization",
    "cookie", "signature", "payloadJson", "providerRaw", "rawPayload", "replyToken", "senderId",
    "roomId", "rawSenderId", "rawRoomId"
  ]);
  const stack = [{ value, path: "$" }];
  while (stack.length > 0) {
    const item = stack.pop();
    const current = item?.value;
    const path = item?.path ?? "$";
    if (!current || typeof current !== "object") continue;
    for (const [key, child] of Object.entries(current)) {
      const childPath = `${path}.${key}`;
      if (forbidden.has(key)) return childPath;
      if (looksRawSecret(child)) return `${childPath}=${String(child).slice(0, 80)}`;
      if (child && typeof child === "object") stack.push({ value: child, path: childPath });
    }
  }
  return null;
}

function noRawPayloadValues(value) {
  return !/safe-message-sprint65|safe-no-match-room-sprint65|safe-sender-sprint65|raw-|reply-token/i.test(JSON.stringify(value ?? {}));
}

function looksRawSecret(value) {
  if (value === null || value === undefined) return false;
  const text = String(value);
  if (/^sha256:[a-f0-9]{8,}$/i.test(text)) return false;
  return /(^|[^a-z])sk-[a-z0-9_-]{8,}|Bearer\s+[a-z0-9._-]+|raw-|mock-line-secret|xox[baprs]-|EA[A-Za-z0-9]{20,}/i.test(text);
}

function finish() {
  const failed = results.filter((result) => !result.ok);
  console.log(JSON.stringify({ baseUrl, tenantId, externalCalls: 0, results }, null, 2));
  if (failed.length > 0) {
    throw new Error(`Sprint 65 smoke failed: ${failed.map((item) => item.name).join(", ")}`);
  }
}

function record(name, ok, detail = "") {
  results.push({ name, ok: Boolean(ok), detail });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
