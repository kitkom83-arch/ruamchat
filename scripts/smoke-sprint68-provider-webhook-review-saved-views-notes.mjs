import crypto from "node:crypto";
import { readFileSync } from "node:fs";

const baseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");
const tenantId = process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
const userId = process.env.USER_ID ?? "00000000-0000-4000-8000-000000000011";
const signingMaterial = process.env.PROVIDER_WEBHOOK_SANDBOX_SIGNING_KEY ?? "local-provider-webhook-sandbox-signing-material";
const runId = `sprint68-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const results = [];

async function main() {
  record("local API only", isLocalBaseUrl(baseUrl));

  const rootPackage = JSON.parse(readFileSync("package.json", "utf8"));
  const shared = readFileSync("packages/shared/src/index.ts", "utf8");
  const providerController = readFileSync("apps/api/src/controllers/provider-webhooks.controller.ts", "utf8");
  const providerService = readFileSync("apps/api/src/services/provider-webhook-events.service.ts", "utf8");
  const readiness = readFileSync("apps/api/src/readiness.ts", "utf8");
  const apiClient = readFileSync("apps/web/app/api-client.ts", "utf8");
  const settingsData = readFileSync("apps/web/app/settings-data.ts", "utf8");
  const providerPanel = readFileSync("apps/web/app/settings/provider-readiness-panel.tsx", "utf8");

  record("smoke script registered", rootPackage.scripts?.["smoke:sprint68"] === "node scripts/smoke-sprint68-provider-webhook-review-saved-views-notes.mjs");
  for (const sprint of [67, 66, 65, 64, 63, 62, 61, 60, 59, 58, 57, 56, 55, 54, 53]) {
    record(`Sprint ${sprint} regression script registered`, typeof rootPackage.scripts?.[`smoke:sprint${sprint}`] === "string");
  }
  record("shared saved view and operator note DTOs registered", shared.includes("providerWebhookReviewSavedViewSchema") && shared.includes("providerWebhookOperatorNoteSchema"));
  record("backend saved view endpoints registered", providerController.includes("review-saved-views") && providerController.includes("createReviewSavedView") && providerController.includes("archiveReviewSavedView"));
  record("backend operator note endpoints registered", providerController.includes("operator-notes") && providerController.includes("createOperatorNote"));
  record("service validates safe saved views and notes", providerService.includes("rejectUnsafeSavedViewInput") && providerService.includes("hasUnsafeSecretPattern") && providerService.includes("operator_note_created"));
  record("readiness exposes Sprint 68 capabilities", readiness.includes("reviewSavedViewsEnabled") && readiness.includes("operatorNotesEnabled") && readiness.includes("savedViewCount") && readiness.includes("operatorNoteCount"));
  record("API client sends saved view and operator note requests", apiClient.includes("getProviderWebhookReviewSavedViews") && apiClient.includes("createProviderWebhookOperatorNote"));
  record("settings data keeps API mode backend-only", settingsData.includes("loadSettingsProviderWebhookSavedViewsData") && settingsData.includes("createSettingsProviderWebhookOperatorNote"));
  record("provider UI renders saved views and operator notes", providerPanel.includes("Saved review views") && providerPanel.includes("Apply saved view") && providerPanel.includes("Operator notes"));

  const health = await safeJson(await request("GET", "/health"));
  record("GET /health reachable", health?.status === "ok" && health?.service === "api");
  record("health response safe", safePayloadObject(health));

  const readinessBefore = await safeJson(await request("GET", "/health/readiness"));
  record("GET /health/readiness reachable", readinessBefore?.status === "ok" && safeReadinessSprint68Summary(readinessBefore?.providerReadiness));
  record("readiness externalCalls=0", noNonzeroExternalCalls(readinessBefore));
  record("readiness safe", safePayloadObject(readinessBefore));

  const triageBefore = await safeJson(await request("GET", "/provider-webhooks/review-triage"));
  record("GET /provider-webhooks/review-triage reachable", safeTriageShape(triageBefore));
  record("initial review triage safe", safePayloadObject(triageBefore));

  const savedViewsBefore = await safeJson(await request("GET", "/provider-webhooks/review-saved-views"));
  record("GET /provider-webhooks/review-saved-views reachable", Array.isArray(savedViewsBefore) && savedViewsBefore.every(safeSavedViewShape));
  record("initial saved views safe", safePayloadObject(savedViewsBefore));

  const createdSavedView = await safeJson(await request("POST", "/provider-webhooks/review-saved-views", {
    name: `Safe Sprint 68 ${runId}`,
    description: "Safe saved view smoke preset",
    filters: {
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      eventType: "message.created",
      severity: "info",
      triageLane: "safe_link_candidate_available",
      receivedAtFrom: "2026-01-01T00:00:00.000Z",
      pageSize: 10
    },
    sort: {
      sortBy: "receivedAt",
      sortDirection: "desc"
    },
    pinned: true,
    isDefault: true
  }));
  record("POST /provider-webhooks/review-saved-views reachable", safeSavedViewShape(createdSavedView) && createdSavedView.name.includes(runId));
  record("created saved view safe", safePayloadObject(createdSavedView));

  const savedViewsAfterCreate = await safeJson(await request("GET", "/provider-webhooks/review-saved-views"));
  record("saved view persisted after refetch", Array.isArray(savedViewsAfterCreate) && savedViewsAfterCreate.some((view) => view.id === createdSavedView.id));

  const updatedSavedView = await safeJson(await request("PATCH", `/provider-webhooks/review-saved-views/${encodeURIComponent(createdSavedView.id)}`, {
    name: `Safe Sprint 68 updated ${runId}`,
    filters: {
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      eventType: "message.created",
      severity: "info",
      triageLane: "safe_link_candidate_available",
      pageSize: 25
    },
    sort: {
      sortBy: "receivedAt",
      sortDirection: "asc"
    },
    pinned: false
  }));
  record("PATCH saved view safely", safeSavedViewShape(updatedSavedView) && updatedSavedView.filters.pageSize === 25 && updatedSavedView.sort.sortDirection === "asc");

  const appliedUnmatched = await safeJson(await request("GET", `/provider-webhooks/unmatched-inbound${savedViewToUnmatchedQuery(updatedSavedView)}`));
  record("Apply saved view filters to unmatched endpoint", safePageShape(appliedUnmatched) && appliedUnmatched.appliedFilters.provider === "line" && appliedUnmatched.appliedFilters.limit === 25);
  record("applied unmatched filters safe", safePayloadObject(appliedUnmatched.appliedFilters));

  const appliedTriage = await safeJson(await request("GET", `/provider-webhooks/review-triage${savedViewToTriageQuery(updatedSavedView)}`));
  record("Apply saved view filters to triage endpoint", safeTriageShape(appliedTriage) && appliedTriage.appliedFilters.triageLane === "safe_link_candidate_available");
  record("applied triage filters safe", safePayloadObject(appliedTriage.appliedFilters));

  const reviewItem = await createNoMatchItem("note-one", "Safe Sprint 68 note target");
  record("POST valid signed sandbox no-match event created unmatched item", reviewItem?.unmatchedStatus === "review-needed");

  const unmatchedAfterCreate = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound?provider=line&reviewStatus=pending&linkStatus=none&status=open&eventType=message.created&limit=10&offset=0&sortBy=receivedAt&sortOrder=desc"));
  record("GET /provider-webhooks/unmatched-inbound reachable", safePageShape(unmatchedAfterCreate) && unmatchedAfterCreate.items.some((item) => item.id === reviewItem.id));

  const notesBefore = await safeJson(await request("GET", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(reviewItem.id)}/operator-notes`));
  record("GET operator notes reachable", Array.isArray(notesBefore) && notesBefore.every(safeOperatorNoteShape));
  record("initial operator notes safe", safePayloadObject(notesBefore));

  const createdNote = await safeJson(await request("POST", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(reviewItem.id)}/operator-notes`, {
    note: "Checked safely with local context only."
  }));
  record("POST operator note reachable", safeOperatorNoteShape(createdNote) && createdNote.unmatchedId === reviewItem.id);
  record("created operator note safe", safePayloadObject(createdNote));

  const notesAfter = await safeJson(await request("GET", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(reviewItem.id)}/operator-notes`));
  record("operator note persisted after refetch", Array.isArray(notesAfter) && notesAfter.some((note) => note.id === createdNote.id));

  const history = await safeJson(await request("GET", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(reviewItem.id)}/history`));
  record("GET unmatched item history reachable", safeHistoryShape(history));
  record("history contains operator note action", safeHistoryShape(history) && history.entries.some((entry) => entry.action === "operator_note_created"));
  record("history remains safe", safePayloadObject(history));

  const diagnostics = await safeJson(await request("GET", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(reviewItem.id)}/diagnostics`));
  record("GET diagnostics reachable", safeDiagnosticsShape(diagnostics));
  record("diagnostics remains safe", safePayloadObject(diagnostics));

  const metrics = await safeJson(await request("GET", "/provider-webhooks/review-metrics"));
  const alerts = await safeJson(await request("GET", "/provider-webhooks/review-alerts"));
  const triageAfter = await safeJson(await request("GET", "/provider-webhooks/review-triage"));
  record("GET review metrics reachable", safeMetricsShape(metrics));
  record("GET review alerts reachable", safeAlertsShape(alerts));
  record("GET review triage again reachable", safeTriageShape(triageAfter));
  record("review surfaces safe", safePayloadObject({ metrics, alerts, triageAfter }));

  const archivedSavedView = await safeJson(await request("PATCH", `/provider-webhooks/review-saved-views/${encodeURIComponent(createdSavedView.id)}/archive`));
  const savedViewsAfterArchive = await safeJson(await request("GET", "/provider-webhooks/review-saved-views"));
  record("Archive saved view without hard delete endpoint", safeSavedViewShape(archivedSavedView) && archivedSavedView.archived === true);
  record("archived view not listed in active list", Array.isArray(savedViewsAfterArchive) && !savedViewsAfterArchive.some((view) => view.id === createdSavedView.id));

  const eventsAfter = await safeJson(await request("GET", "/provider-webhooks/events"));
  const readinessAfter = await safeJson(await request("GET", "/health/readiness"));
  const fullSurface = { health, readinessBefore, triageBefore, savedViewsBefore, createdSavedView, savedViewsAfterCreate, updatedSavedView, appliedUnmatched, appliedTriage, reviewItem, unmatchedAfterCreate, notesBefore, createdNote, notesAfter, history, diagnostics, metrics, alerts, triageAfter, archivedSavedView, savedViewsAfterArchive, eventsAfter, readinessAfter };
  record("all Sprint 68 responses safe", safePayloadObject(fullSurface));
  record("externalCalls=0 throughout", noNonzeroExternalCalls(fullSurface));
  record("no provider outbound", !containsProviderOutbound(fullSurface));
  record("no live provider network evidence", noLiveProviderNetworkEvidence(fullSurface));

  finish();
}

async function createNoMatchItem(label, text) {
  const eventId = `${runId}-${label}-${Math.random().toString(16).slice(2)}`;
  const payload = linePayload(`safe-no-match-room-sprint68-${label}-${runId}`, `safe-sender-sprint68-${label}`, text);
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
  record(`valid event safe DTO (${label})`, safeEventShape(body) && safePayloadObject(body));
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

function savedViewToUnmatchedQuery(view) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(view.filters ?? {})) {
    if (["severity", "triageLane", "pageSize"].includes(key)) continue;
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  }
  if (view.filters?.pageSize) params.set("limit", String(view.filters.pageSize));
  params.set("offset", "0");
  params.set("sortBy", view.sort.sortBy);
  params.set("sortOrder", view.sort.sortDirection);
  const search = params.toString();
  return search ? `?${search}` : "";
}

function savedViewToTriageQuery(view) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(view.filters ?? {})) {
    if (key === "pageSize") continue;
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  }
  const search = params.toString();
  return search ? `?${search}` : "";
}

function linePayload(roomId, userId, text) {
  return {
    events: [{
      type: "message",
      timestamp: 1760000000000,
      replyToken: "raw-reply-token-sprint68",
      source: { type: "room", userId, roomId },
      message: { id: "safe-message-sprint68", type: "text", text }
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

function safeSavedViewShape(value) {
  const allowed = new Set(["id", "name", "description", "tenantId", "ownerId", "createdBy", "filters", "sort", "pinned", "isDefault", "archived", "createdAt", "updatedAt", "externalCalls"]);
  const filterAllowed = new Set(["provider", "reviewStatus", "linkStatus", "unmatchedStatus", "eventType", "severity", "triageLane", "receivedAtFrom", "receivedAtTo", "pageSize"]);
  const sortAllowed = new Set(["sortBy", "sortDirection"]);
  return value && typeof value === "object"
    && Object.keys(value).every((key) => allowed.has(key))
    && Object.keys(value.filters ?? {}).every((key) => filterAllowed.has(key))
    && Object.keys(value.sort ?? {}).every((key) => sortAllowed.has(key))
    && value.externalCalls === 0;
}

function safeOperatorNoteShape(value) {
  const allowed = new Set(["id", "unmatchedId", "tenantId", "authorId", "authorLabel", "note", "context", "createdAt", "updatedAt", "externalCalls"]);
  const contextAllowed = new Set(["provider", "platform", "channelAccountId", "safeRoomLabel", "roomKeyDigest", "eventType", "reviewStatus", "linkStatus", "unmatchedStatus"]);
  return value && typeof value === "object"
    && Object.keys(value).every((key) => allowed.has(key))
    && Object.keys(value.context ?? {}).every((key) => contextAllowed.has(key))
    && value.context?.provider === value.context?.platform
    && value.externalCalls === 0;
}

function safePageShape(value) {
  if (!value || typeof value !== "object" || !Array.isArray(value.items)) return false;
  const allowed = new Set(["items", "pagination", "appliedFilters", "appliedSort", "summary", "externalCalls"]);
  return Object.keys(value).every((key) => allowed.has(key))
    && value.items.every(safeUnmatchedItemShape)
    && value.pagination?.totalCount >= value.items.length
    && value.appliedSort?.sortBy === "receivedAt"
    && ["asc", "desc"].includes(value.appliedSort?.sortOrder)
    && value.externalCalls === 0;
}

function safeMetricsShape(value) {
  if (!value || typeof value !== "object") return false;
  return value.externalCalls === 0
    && Array.isArray(value.byProvider)
    && typeof value.totalUnmatched === "number"
    && typeof value.funnel?.unmatchedQueued === "number";
}

function safeAlertsShape(value) {
  if (!value || typeof value !== "object") return false;
  return value.externalCalls === 0
    && Array.isArray(value.alertItems)
    && typeof value.thresholds?.staleWarningHours === "number";
}

function safeTriageShape(value) {
  if (!value || typeof value !== "object") return false;
  return value.externalCalls === 0
    && Array.isArray(value.lanes)
    && Array.isArray(value.topItems)
    && typeof value.totalTriageLanes === "number";
}

function safeDiagnosticsShape(value) {
  if (!value || typeof value !== "object") return false;
  const allowed = new Set([
    "unmatchedId", "provider", "platform", "channelAccountId", "safeRoomLabel", "roomKeyDigest",
    "eventType", "receivedAt", "reviewStatus", "linkStatus", "unmatchedStatus",
    "routingOutcome", "normalizedEventType", "persistenceOutcome", "candidateLookupAvailable",
    "historyAvailable", "exportAvailable", "lastActionAt", "safeWarnings", "externalCalls"
  ]);
  return Object.keys(value).every((key) => allowed.has(key)) && value.provider === value.platform && value.externalCalls === 0;
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

function safeEventShape(value) {
  if (!value || typeof value !== "object") return false;
  return value.direction === "inbound" && value.externalCalls === 0 && typeof value.payloadDigest === "string";
}

function safeUnmatchedItemShape(value) {
  if (!value || typeof value !== "object") return false;
  return value.mode === "sandbox" && value.conversationLookupStatus === "not-found" && value.externalCalls === 0;
}

function safeReadinessSprint68Summary(value) {
  return value
    && value.externalCalls === 0
    && value.reviewTriageEnabled === true
    && value.reviewSavedViewsEnabled === true
    && value.operatorNotesEnabled === true
    && typeof value.savedViewCount === "number"
    && typeof value.operatorNoteCount === "number"
    && value.realOutboundEnabled === false;
}

function safePayloadObject(value) {
  return noRawSecretFields(value) && noRawPayloadValues(value) && noNonzeroExternalCalls(value);
}

function noRawSecretFields(value) {
  return !/token|secret|authorization|cookie|replyToken|rawPayload|providerRaw|payloadJson|raw sender|raw room|senderId|roomId(?!Digest)/i.test(JSON.stringify(value));
}

function noRawPayloadValues(value) {
  return !/raw-reply-token|safe-no-match-room-sprint68|safe-sender-sprint68|raw-line|raw-message-id|provider credential|Bearer|sk-/i.test(JSON.stringify(value));
}

function noNonzeroExternalCalls(value) {
  const serialized = JSON.stringify(value);
  return !/"externalCalls"\s*:\s*(?!0\b)\d+/i.test(serialized);
}

function containsProviderOutbound(value) {
  return /outbound\.queued|outbound\.sent|line\.push|telegram\.send|facebook\.send|instagram\.send|provider outbound true/i.test(JSON.stringify(value));
}

function noLiveProviderNetworkEvidence(value) {
  return !/api\.line\.me|api\.telegram\.org|graph\.facebook\.com|graph\.instagram\.com|live provider network/i.test(JSON.stringify(value));
}

function isLocalBaseUrl(value) {
  return /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(value);
}

function record(name, ok) {
  results.push({ name, ok: Boolean(ok) });
  console.log(`${ok ? "PASS" : "FAIL"} ${name}`);
}

function finish() {
  const failed = results.filter((result) => !result.ok);
  console.log(`Sprint 68 smoke results: ${results.length - failed.length}/${results.length} passed`);
  if (failed.length > 0) {
    console.error("Failed checks:");
    for (const result of failed) console.error(`- ${result.name}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
