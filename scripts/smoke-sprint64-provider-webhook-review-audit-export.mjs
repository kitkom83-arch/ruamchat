import crypto from "node:crypto";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const baseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");
const tenantId = process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
const userId = process.env.USER_ID ?? "00000000-0000-4000-8000-000000000011";
const signingMaterial = process.env.PROVIDER_WEBHOOK_SANDBOX_SIGNING_KEY ?? "local-provider-webhook-sandbox-signing-material";
const runId = `sprint64-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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

  record("smoke script registered", rootPackage.scripts?.["smoke:sprint64"] === "node scripts/smoke-sprint64-provider-webhook-review-audit-export.mjs");
  for (const sprint of [63, 62, 61, 60, 59, 58, 57, 56, 55, 54, 53]) {
    record(`Sprint ${sprint} regression script registered`, typeof rootPackage.scripts?.[`smoke:sprint${sprint}`] === "string");
  }
  record("shared safe history/export DTOs registered", shared.includes("providerWebhookUnmatchedInboundHistorySchema") && shared.includes("providerWebhookUnmatchedInboundExportSchema"));
  record("backend history/export endpoints registered", providerController.includes("unmatched-inbound/:id/history") && providerController.includes("unmatched-inbound/export"));
  record("service implements safe audit history and queue export", providerService.includes("listUnmatchedInboundHistory") && providerService.includes("exportUnmatchedInboundQueue") && providerService.includes("unmatchedInboundExportMaxLimit"));
  record("API client sends history/export requests", apiClient.includes("getProviderWebhookUnmatchedInboundHistory") && apiClient.includes("getProviderWebhookUnmatchedInboundExport"));
  record("settings data keeps API history/export backend-only", settingsData.includes("getProviderWebhookUnmatchedInboundHistory") && settingsData.includes("getProviderWebhookUnmatchedInboundExport") && settingsData.includes("mode === \"api\""));
  record("provider UI renders history/export controls", providerPanel.includes("View history") && providerPanel.includes("Export current filtered queue") && providerPanel.includes("Export CSV"));

  const health = await safeJson(await request("GET", "/health"));
  record("GET /health reachable", health?.status === "ok" && health?.service === "api");
  record("health response safe", noRawSecretFields(health) && noRawPayloadValues(health) && noNonzeroExternalCalls(health));

  const readinessBefore = await safeJson(await request("GET", "/health/readiness"));
  record("GET /health/readiness reachable", readinessBefore?.status === "ok" && safeReadinessSprint64Summary(readinessBefore?.providerReadiness));
  record("readiness externalCalls=0", noNonzeroExternalCalls(readinessBefore));
  record("readiness safe", noRawSecretFields(readinessBefore) && noRawPayloadValues(readinessBefore));

  const beforeUnmatched = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound"));
  record("GET /provider-webhooks/unmatched-inbound reachable", Array.isArray(unmatchedItems(beforeUnmatched)));
  record("initial unmatched response safe", unmatchedItems(beforeUnmatched).every(safeUnmatchedItemShape) && noRawSecretFields(beforeUnmatched) && noRawPayloadValues(beforeUnmatched));

  const reviewOne = await createNoMatchItem("single-review", "Safe Sprint 64 single review");
  const bulkOne = await createNoMatchItem("bulk-one", "Safe Sprint 64 bulk review one");
  const bulkTwo = await createNoMatchItem("bulk-two", "Safe Sprint 64 bulk skip two");
  record("POST valid signed sandbox no-match events created unmatched items", [reviewOne, bulkOne, bulkTwo].every((item) => item?.unmatchedStatus === "review-needed"));

  const unmatchedAfterCreate = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound?provider=line&reviewStatus=pending&linkStatus=none&status=open&eventType=message.created&limit=10&offset=0&sortBy=receivedAt&sortOrder=desc"));
  record("created unmatched items appear", safePageShape(unmatchedAfterCreate) && [reviewOne.id, bulkOne.id, bulkTwo.id].every((id) => unmatchedAfterCreate.items.some((item) => item.id === id)));

  const reviewed = await safeJson(await request("PATCH", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(reviewOne.id)}/review`, {
    status: "reviewed",
    reason: "safe sprint 64 single review"
  }));
  record("single review action reachable", safeUnmatchedItemShape(reviewed) && reviewed.id === reviewOne.id && reviewed.reviewStatus === "reviewed" && reviewed.unmatchedStatus === "reviewed");
  record("single review response safe", noRawSecretFields(reviewed) && noRawPayloadValues(reviewed));

  const bulkReviewed = await safeJson(await request("PATCH", "/provider-webhooks/unmatched-inbound/bulk-review", {
    ids: [bulkOne.id],
    reviewStatus: "reviewed",
    reason: "safe sprint 64 bulk review"
  }));
  record("bulk review action reachable", safeBulkReviewShape(bulkReviewed) && bulkReviewed.summary.updatedCount === 1 && bulkReviewed.results[0]?.reviewStatus === "reviewed");

  const bulkSkipped = await safeJson(await request("PATCH", "/provider-webhooks/unmatched-inbound/bulk-review", {
    ids: [bulkTwo.id],
    reviewStatus: "skipped",
    reason: "safe sprint 64 bulk skip"
  }));
  record("bulk skip action reachable", safeBulkReviewShape(bulkSkipped) && bulkSkipped.summary.updatedCount === 1 && bulkSkipped.results[0]?.reviewStatus === "skipped");
  record("bulk responses safe", noRawSecretFields({ bulkReviewed, bulkSkipped }) && noRawPayloadValues({ bulkReviewed, bulkSkipped }));

  const singleHistory = await safeJson(await request("GET", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(reviewOne.id)}/history`));
  record("GET unmatched item history reachable", safeHistoryShape(singleHistory));
  record("history contains received/routed/queued/reviewed entries", safeHistoryShape(singleHistory) && ["inbound_received", "normalized_routed", "unmatched_queued", "reviewed"].every((action) => singleHistory.entries.some((entry) => entry.action === action)));
  record("history preserves safe platform/account/room context", singleHistory?.provider === "line" && singleHistory?.channelAccountId === "sandbox:line" && typeof singleHistory?.safeRoomLabel === "string" && /^sha256:/.test(singleHistory?.roomKeyDigest ?? ""));
  record("history response is safe", noRawSecretFields(singleHistory) && noRawPayloadValues(singleHistory) && noNonzeroExternalCalls(singleHistory));

  const bulkHistory = await safeJson(await request("GET", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(bulkTwo.id)}/history`));
  record("history contains bulk skipped entry where applicable", safeHistoryShape(bulkHistory) && bulkHistory.entries.some((entry) => entry.action === "bulk_skipped" && entry.statusAfter === "skipped"));

  const exported = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound/export?provider=line&reviewStatus=reviewed&eventType=message.created&limit=999&offset=0&sortBy=receivedAt&sortOrder=desc&format=csv"));
  record("GET unmatched export with filters reachable", safeExportShape(exported));
  record("export includes safe metadata and exported rows", safeExportShape(exported) && exported.format === "csv" && exported.exportMaxLimit === 500 && exported.requestedLimit === 999 && exported.exportedCount >= 1 && typeof exported.csv === "string");
  record("export respects reviewStatus filter", safeExportShape(exported) && exported.rows.every((row) => row.reviewStatus === "reviewed"));
  record("export cap metadata implemented", safeExportShape(exported) && exported.appliedFilters.limit === 500 && exported.exportMaxLimit === 500);
  record("export preserves safe platform/account/room digest", safeExportShape(exported) && exported.rows.every((row) => row.provider === "line" && row.channelAccountId === "sandbox:line" && row.safeRoomLabel.includes("room digest") && /^sha256:/.test(row.roomKeyDigest ?? "")));
  record("export response is safe", noRawSecretFields(exported) && noRawPayloadValues(exported) && noNonzeroExternalCalls(exported));

  const afterEvents = await safeJson(await request("GET", "/provider-webhooks/events"));
  record("GET /provider-webhooks/events reachable", Array.isArray(afterEvents));
  record("event safe fields only", Array.isArray(afterEvents) && afterEvents.every(safeEventShape) && noRawSecretFields(afterEvents) && noRawPayloadValues(afterEvents));

  const readinessAfter = await safeJson(await request("GET", "/health/readiness"));
  record("readiness after audit/export externalCalls=0", safeReadinessSprint64Summary(readinessAfter?.providerReadiness) && noNonzeroExternalCalls(readinessAfter));
  record("no provider outbound", !containsProviderOutbound({ health, readinessBefore, beforeUnmatched, unmatchedAfterCreate, reviewed, bulkReviewed, bulkSkipped, singleHistory, bulkHistory, exported, afterEvents, readinessAfter }));
  record("no live provider network evidence", noLiveProviderNetworkEvidence({ health, readinessBefore, beforeUnmatched, unmatchedAfterCreate, reviewed, bulkReviewed, bulkSkipped, singleHistory, bulkHistory, exported, afterEvents, readinessAfter }));

  finish();
}

async function createNoMatchItem(label, text) {
  const eventId = `${runId}-${label}-${Math.random().toString(16).slice(2)}`;
  const payload = linePayload(`safe-no-match-room-sprint64-${label}-${runId}`, `safe-sender-sprint64-${label}`, text);
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
      replyToken: "raw-reply-token-sprint64",
      source: { type: "room", userId, roomId },
      message: { id: "safe-message-sprint64", type: "text", text }
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
    "safeResultSummary", "assignmentStatus", "assignedToOperatorLabel", "assignedAt",
    "escalationStatus", "escalationReason", "escalatedAt", "externalCalls"
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
    "textLength", "receivedAt", "assignmentStatus", "assignedToOperatorLabel", "assignedAt",
    "assignedByOperatorLabel", "escalationStatus", "escalationReason", "escalatedAt",
    "escalatedByOperatorLabel", "lastOperatorNoteAt", "historyAvailable", "diagnosticsAvailable",
    "candidatesAvailable", "externalCalls"
  ]);
  return Object.keys(value).every((key) => allowed.has(key))
    && value.mode === "sandbox"
    && value.conversationLookupStatus === "not-found"
    && value.externalCalls === 0;
}

function safeReadinessSprint64Summary(readiness) {
  return readiness?.webhookUnmatchedInboundReviewEnabled === true
    && readiness.webhookUnmatchedReviewActionsEnabled === true
    && readiness.webhookCandidateLookupEnabled === true
    && readiness.webhookUnmatchedHistoryEnabled === true
    && readiness.webhookUnmatchedQueueExportEnabled === true
    && readiness.webhookUnmatchedQueueExportMaxLimit === 500
    && typeof readiness.unmatchedInboundOpenCount === "number"
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
  return !/safe-message-sprint64|safe-no-match-room-sprint64|safe-sender-sprint64|raw-|reply-token/i.test(JSON.stringify(value ?? {}));
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
    throw new Error(`Sprint 64 smoke failed: ${failed.map((item) => item.name).join(", ")}`);
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
