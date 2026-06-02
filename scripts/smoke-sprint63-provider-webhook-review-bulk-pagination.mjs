import crypto from "node:crypto";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const baseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");
const tenantId = process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
const userId = process.env.USER_ID ?? "00000000-0000-4000-8000-000000000011";
const signingMaterial = process.env.PROVIDER_WEBHOOK_SANDBOX_SIGNING_KEY ?? "local-provider-webhook-sandbox-signing-material";
const runId = `sprint63-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const results = [];

async function main() {
  record("local API only", isLocalBaseUrl(baseUrl));

  const rootPackage = JSON.parse(readFileSync("package.json", "utf8"));
  const providerService = readFileSync("apps/api/src/services/provider-webhook-events.service.ts", "utf8");
  const apiClient = readFileSync("apps/web/app/api-client.ts", "utf8");
  const settingsData = readFileSync("apps/web/app/settings-data.ts", "utf8");
  const providerPanel = readFileSync("apps/web/app/settings/provider-readiness-panel.tsx", "utf8");

  record("smoke script registered", rootPackage.scripts?.["smoke:sprint63"] === "node scripts/smoke-sprint63-provider-webhook-review-bulk-pagination.mjs");
  for (const sprint of [62, 61, 60, 59, 58, 57, 56, 55, 54, 53]) {
    record(`Sprint ${sprint} regression script registered`, typeof rootPackage.scripts?.[`smoke:sprint${sprint}`] === "string");
  }
  record("service implements page and bulk review", providerService.includes("listUnmatchedInboundPage") && providerService.includes("bulkReviewUnmatchedInbound"));
  record("API client sends page params and bulk review", apiClient.includes("offset: parsed.offset ?? 0") && apiClient.includes("bulkReviewProviderWebhookUnmatchedInbound"));
  record("settings data keeps API bulk backend-only", settingsData.includes("bulkReviewProviderWebhookUnmatchedInbound(payload)") && settingsData.includes("mode === \"api\""));
  record("provider UI renders Sprint 63 controls", providerPanel.includes("Page size") && providerPanel.includes("Sort order") && providerPanel.includes("Select all visible") && providerPanel.includes("Bulk Mark reviewed") && providerPanel.includes("Bulk Skip"));

  const health = await safeJson(await request("GET", "/health"));
  record("GET /health reachable", health?.status === "ok" && health?.service === "api");
  record("health response safe", noRawSecretFields(health) && noRawPayloadValues(health) && noNonzeroExternalCalls(health));

  const readinessBefore = await safeJson(await request("GET", "/health/readiness"));
  record("GET /health/readiness reachable", readinessBefore?.status === "ok" && safeReadinessSprint63Summary(readinessBefore?.providerReadiness));
  record("readiness externalCalls=0", noNonzeroExternalCalls(readinessBefore));
  record("readiness safe", noRawSecretFields(readinessBefore) && noRawPayloadValues(readinessBefore));

  const beforeUnmatched = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound"));
  record("GET /provider-webhooks/unmatched-inbound reachable", Array.isArray(unmatchedItems(beforeUnmatched)));
  record("initial unmatched response safe", unmatchedItems(beforeUnmatched).every(safeUnmatchedItemShape) && noRawSecretFields(beforeUnmatched) && noRawPayloadValues(beforeUnmatched));

  const reviewOne = await createNoMatchItem("review-one", "Safe Sprint 63 bulk review one");
  const reviewTwo = await createNoMatchItem("review-two", "Safe Sprint 63 bulk review two");
  const skipOne = await createNoMatchItem("skip-one", "Safe Sprint 63 bulk skip one");
  record("POST multiple signed sandbox no-match events created unmatched items", [reviewOne, reviewTwo, skipOne].every((item) => item?.unmatchedStatus === "review-needed"));

  const paged = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound?limit=2&offset=0&sortBy=receivedAt&sortOrder=desc"));
  record("GET unmatched list with limit/offset/sort reachable", safePageShape(paged) && paged.items.length <= 2);
  record("pagination metadata is safe", safePageShape(paged) && paged.pagination.limit === 2 && paged.appliedSort.sortBy === "receivedAt" && paged.appliedSort.sortOrder === "desc" && noRawSecretFields(paged) && noRawPayloadValues(paged));
  record("unmatched items appear in paged response", [reviewOne.id, reviewTwo.id, skipOne.id].some((id) => paged.items.some((item) => item.id === id)));

  const filtered = await safeJson(await request("GET", `/provider-webhooks/unmatched-inbound?provider=line&reviewStatus=pending&linkStatus=none&status=open&eventType=message.created&receivedAtFrom=${encodeURIComponent("2026-01-01T00:00:00.000Z")}&limit=10&offset=0&sortBy=receivedAt&sortOrder=desc`));
  record("GET unmatched list with safe filters reachable", safePageShape(filtered) && [reviewOne.id, reviewTwo.id, skipOne.id].every((id) => filtered.items.some((item) => item.id === id)));
  record("filter response safe", safePageShape(filtered) && filtered.items.every(safeUnmatchedItemShape) && noRawSecretFields(filtered) && noRawPayloadValues(filtered));

  const bulkReviewed = await safeJson(await request("PATCH", "/provider-webhooks/unmatched-inbound/bulk-review", {
    ids: [reviewOne.id, reviewOne.id, reviewTwo.id],
    reviewStatus: "reviewed",
    reason: "safe sprint 63 bulk review"
  }));
  record("bulk mark reviewed reachable", safeBulkReviewShape(bulkReviewed) && bulkReviewed.summary.requestedCount === 3 && bulkReviewed.summary.dedupedCount === 2 && bulkReviewed.summary.updatedCount === 2);
  record("bulk reviewed response safe", safeBulkReviewShape(bulkReviewed) && noRawSecretFields(bulkReviewed) && noRawPayloadValues(bulkReviewed));

  const reviewedAfter = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound?reviewStatus=reviewed&limit=10&offset=0&sortBy=receivedAt&sortOrder=desc"));
  record("bulk reviewed persists after refetch", safePageShape(reviewedAfter) && [reviewOne.id, reviewTwo.id].every((id) => reviewedAfter.items.some((item) => item.id === id && item.reviewStatus === "reviewed" && item.unmatchedStatus === "reviewed")));

  const repeatReviewed = await safeJson(await request("PATCH", "/provider-webhooks/unmatched-inbound/bulk-review", {
    ids: [reviewOne.id, reviewTwo.id],
    reviewStatus: "reviewed"
  }));
  record("repeat bulk reviewed is idempotent", safeBulkReviewShape(repeatReviewed) && repeatReviewed.summary.alreadyAppliedCount === 2 && repeatReviewed.summary.updatedCount === 0);

  const bulkSkipped = await safeJson(await request("PATCH", "/provider-webhooks/unmatched-inbound/bulk-review", {
    ids: [skipOne.id],
    reviewStatus: "skipped"
  }));
  record("bulk skip reachable", safeBulkReviewShape(bulkSkipped) && bulkSkipped.summary.updatedCount === 1 && bulkSkipped.results[0]?.reviewStatus === "skipped");

  const skippedAfter = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound?reviewStatus=skipped&limit=10&offset=0&sortBy=receivedAt&sortOrder=desc"));
  record("bulk skipped persists after refetch", safePageShape(skippedAfter) && skippedAfter.items.some((item) => item.id === skipOne.id && item.reviewStatus === "skipped" && item.unmatchedStatus === "skipped"));

  const readinessAfter = await safeJson(await request("GET", "/health/readiness"));
  record("readiness counts updated safely", safeReadinessSprint63Summary(readinessAfter?.providerReadiness)
    && readinessAfter.providerReadiness.unmatchedInboundReviewedCount >= (readinessBefore?.providerReadiness?.unmatchedInboundReviewedCount ?? 0) + 2
    && readinessAfter.providerReadiness.unmatchedInboundSkippedCount >= (readinessBefore?.providerReadiness?.unmatchedInboundSkippedCount ?? 0) + 1);
  record("readiness after bulk externalCalls=0", noNonzeroExternalCalls(readinessAfter));

  const afterEvents = await safeJson(await request("GET", "/provider-webhooks/events"));
  record("GET /provider-webhooks/events reachable", Array.isArray(afterEvents));
  record("event safe fields only", Array.isArray(afterEvents) && afterEvents.every(safeEventShape) && noRawSecretFields(afterEvents) && noRawPayloadValues(afterEvents));
  record("event log externalCalls=0", noNonzeroExternalCalls(afterEvents));
  record("no provider outbound", !containsProviderOutbound({ health, readinessBefore, beforeUnmatched, paged, filtered, bulkReviewed, repeatReviewed, bulkSkipped, readinessAfter, afterEvents }));
  record("no live provider network evidence", noLiveProviderNetworkEvidence({ health, readinessBefore, beforeUnmatched, paged, filtered, bulkReviewed, repeatReviewed, bulkSkipped, readinessAfter, afterEvents }));

  finish();
}

async function createNoMatchItem(label, text) {
  const eventId = `${runId}-${label}-${Math.random().toString(16).slice(2)}`;
  const payload = linePayload(`safe-no-match-room-sprint63-${label}-${runId}`, `safe-sender-sprint63-${label}`, text);
  payload[`safeMarker${label.replace(/[^a-z0-9]/gi, "")}${Date.now()}`] = true;
  const response = await request("POST", "/provider-webhooks/sandbox-events", {
    provider: "line",
    channel: "line",
    eventType: "message.created",
    mode: "sandbox",
    inboundPersistenceMode: "sandbox-persist",
    eventId,
    timestamp: "2026-06-02T06:00:00.000Z",
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
      source: { type: "room", userId, roomId },
      message: { id: "safe-message-sprint63", type: "text", text }
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

function safeReadinessSprint63Summary(readiness) {
  return readiness?.webhookUnmatchedInboundReviewEnabled === true
    && readiness.webhookUnmatchedReviewActionsEnabled === true
    && readiness.webhookCandidateLookupEnabled === true
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
  return !/safe-message-sprint63|safe-no-match-room-sprint63|safe-sender-sprint63|raw-|reply-token/i.test(JSON.stringify(value ?? {}));
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
    throw new Error(`Sprint 63 smoke failed: ${failed.map((item) => item.name).join(", ")}`);
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
