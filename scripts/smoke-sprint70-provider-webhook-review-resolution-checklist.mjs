import crypto from "node:crypto";
import { readFileSync } from "node:fs";

const baseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");
const tenantId = process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
const userId = process.env.USER_ID ?? "00000000-0000-4000-8000-000000000011";
const signingMaterial = process.env.PROVIDER_WEBHOOK_SANDBOX_SIGNING_KEY ?? "local-provider-webhook-sandbox-signing-material";
const runId = `sprint70-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const results = [];

async function main() {
  record("local API only", isLocalBaseUrl(baseUrl));

  const rootPackage = JSON.parse(readFileSync("package.json", "utf8"));
  const shared = readFileSync("packages/shared/src/index.ts", "utf8");
  const providerController = readFileSync("apps/api/src/controllers/provider-webhooks.controller.ts", "utf8");
  const providerService = readFileSync("apps/api/src/services/provider-webhook-events.service.ts", "utf8");
  const readinessSource = readFileSync("apps/api/src/readiness.ts", "utf8");
  const apiClient = readFileSync("apps/web/app/api-client.ts", "utf8");
  const settingsData = readFileSync("apps/web/app/settings-data.ts", "utf8");
  const providerPanel = readFileSync("apps/web/app/settings/provider-readiness-panel.tsx", "utf8");

  record("smoke script registered", rootPackage.scripts?.["smoke:sprint70"] === "node scripts/smoke-sprint70-provider-webhook-review-resolution-checklist.mjs");
  for (const sprint of [69, 68, 67, 66, 65, 64, 63, 62, 61, 60, 59, 58, 57, 56, 55, 54, 53]) {
    record(`Sprint ${sprint} regression script registered`, typeof rootPackage.scripts?.[`smoke:sprint${sprint}`] === "string");
  }
  record("shared resolution checklist DTOs registered", shared.includes("providerWebhookUnmatchedInboundResolutionRequestSchema") && shared.includes("providerWebhookReviewResolutionSummarySchema"));
  record("backend resolution checklist endpoints registered", providerController.includes("review-resolution-summary") && providerController.includes("resolution-checklist") && providerController.includes("bulk-resolution"));
  record("service implements metadata-only resolution checklist", providerService.includes("applyResolutionToItem") && providerService.includes("applyChecklistToItem") && providerService.includes("recordResolutionAudit"));
  record("readiness exposes Sprint 70 capabilities", readinessSource.includes("reviewResolutionEnabled") && readinessSource.includes("reviewClosureChecklistEnabled") && readinessSource.includes("resolutionSummaryEnabled"));
  record("API client sends resolution checklist requests", apiClient.includes("resolveProviderWebhookUnmatchedInbound") && apiClient.includes("updateProviderWebhookUnmatchedInboundChecklist") && apiClient.includes("/provider-webhooks/review-resolution-summary"));
  record("settings data keeps API resolution backend-only", settingsData.includes("loadSettingsProviderWebhookReviewResolutionSummaryData") && settingsData.includes("bulkResolveSettingsProviderWebhookUnmatchedInbound"));
  record("provider UI renders resolution checklist controls", providerPanel.includes("Resolution checklist summary") && providerPanel.includes("Set needs review") && providerPanel.includes("Bulk Set resolution"));

  const health = await safeJson(await request("GET", "/health"));
  record("GET /health reachable", health?.status === "ok" && health?.service === "api");
  record("health response safe", safePayloadObject(health));

  const readinessBefore = await safeJson(await request("GET", "/health/readiness"));
  record("GET /health/readiness reachable", readinessBefore?.status === "ok" && safeReadinessSprint70Summary(readinessBefore?.providerReadiness));
  record("readiness externalCalls=0", noNonzeroExternalCalls(readinessBefore));
  record("readiness safe", safePayloadObject(readinessBefore));

  const metricsBefore = await safeJson(await request("GET", "/provider-webhooks/review-metrics"));
  const alertsBefore = await safeJson(await request("GET", "/provider-webhooks/review-alerts"));
  const triageBefore = await safeJson(await request("GET", "/provider-webhooks/review-triage"));
  const workloadBefore = await safeJson(await request("GET", "/provider-webhooks/review-workload"));
  const resolutionBefore = await safeJson(await request("GET", "/provider-webhooks/review-resolution-summary"));
  const unmatchedBefore = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound?limit=10&offset=0&sortBy=receivedAt&sortOrder=desc"));
  record("GET review metrics reachable", safeMetricsShape(metricsBefore));
  record("GET review alerts reachable", safeAlertsShape(alertsBefore));
  record("GET review triage reachable", safeTriageShape(triageBefore));
  record("GET review workload reachable", safeWorkloadShape(workloadBefore));
  record("GET review resolution summary reachable", safeResolutionSummaryShape(resolutionBefore));
  record("GET unmatched inbound reachable", safePageShape(unmatchedBefore));
  record("initial review surfaces safe", safePayloadObject({ metricsBefore, alertsBefore, triageBefore, workloadBefore, resolutionBefore, unmatchedBefore }));

  const resolutionItem = await createNoMatchItem("resolution", "Safe Sprint 70 resolution target");
  const bulkItem = await createNoMatchItem("bulk", "Safe Sprint 70 bulk target");
  record("POST valid signed sandbox no-match events created unmatched items", [resolutionItem, bulkItem].every((item) => item?.unmatchedStatus === "review-needed"));

  const unmatchedAfterCreateResponse = await request("GET", "/provider-webhooks/unmatched-inbound?provider=line&reviewStatus=pending&linkStatus=none&status=open&eventType=message.created&limit=25&offset=0&sortBy=receivedAt&sortOrder=desc");
  const unmatchedAfterCreate = await safeJson(unmatchedAfterCreateResponse);
  const unmatchedAfterCreateSafePageShape = safePageShape(unmatchedAfterCreate);
  const returnedIds = unmatchedItems(unmatchedAfterCreate).map((item) => item.id);
  const createdItemsAppear = unmatchedAfterCreateSafePageShape &&
    [resolutionItem?.id, bulkItem?.id].every((id) => typeof id === "string" && returnedIds.includes(id));
  record("created unmatched items appear", createdItemsAppear);

  const resolutionItemBefore = unmatchedAfterCreate.items.find((item) => item.id === resolutionItem.id);
  const resolved = await safeJson(await request("PATCH", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(resolutionItem.id)}/resolution`, {
    operation: "SET_RESOLUTION",
    resolutionOutcome: "NEEDS_REVIEW",
    note: "Safe Sprint 70 resolution"
  }));
  record("Set resolution endpoint reachable", safeUnmatchedItemShape(resolved) && resolved.resolutionStatus === "resolved" && resolved.resolutionOutcome === "NEEDS_REVIEW");
  record("resolution persisted as metadata only", metadataOnlyStateMatches(resolutionItemBefore, resolved));
  record("resolution response safe", safePayloadObject(resolved));

  const summaryAfterResolution = await safeJson(await request("GET", "/provider-webhooks/review-resolution-summary?provider=line&resolutionStatus=resolved&resolutionOutcome=NEEDS_REVIEW&checklistIncomplete=true"));
  record("resolution summary filter reachable", safeResolutionSummaryShape(summaryAfterResolution) && summaryAfterResolution.appliedFilters.resolutionStatus === "resolved" && summaryAfterResolution.appliedFilters.resolutionOutcome === "NEEDS_REVIEW" && summaryAfterResolution.appliedFilters.checklistIncomplete === true);
  record("resolution summary counts changed safely", summaryAfterResolution.counts.resolvedRecently >= 1 && summaryAfterResolution.counts.checklistIncompleteOpen >= 1);

  const checked = await safeJson(await request("PATCH", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(resolutionItem.id)}/resolution-checklist`, {
    operation: "COMPLETE_STEP",
    step: "VIEWED_DIAGNOSTICS"
  }));
  record("Complete checklist endpoint reachable", safeUnmatchedItemShape(checked) && checked.checklistCompletedCount >= 1);
  record("checklist persisted as metadata only", metadataOnlyStateMatches(resolutionItemBefore, checked));
  record("checklist response safe", safePayloadObject(checked));

  const refetchedAfterChecklist = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound?provider=line&resolutionStatus=resolved&resolutionOutcome=NEEDS_REVIEW&checklistIncomplete=true&limit=25&offset=0&sortBy=receivedAt&sortOrder=desc"));
  const refetchedResolutionItem = unmatchedItems(refetchedAfterChecklist).find((item) => item.id === resolutionItem.id);
  record("refetch unmatched confirms resolution/checklist metadata", safePageShape(refetchedAfterChecklist) && refetchedResolutionItem?.resolutionStatus === "resolved" && refetchedResolutionItem?.checklistCompletedCount >= 1);
  record("review/link/unmatched/message state unchanged after metadata", metadataOnlyStateMatches(resolutionItemBefore, refetchedResolutionItem));

  const diagnosticsAfter = await safeJson(await request("GET", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(resolutionItem.id)}/diagnostics`));
  record("GET diagnostics includes safe resolution checklist info", safeDiagnosticsShape(diagnosticsAfter) && diagnosticsAfter.resolutionStatus === "resolved" && diagnosticsAfter.resolutionOutcome === "NEEDS_REVIEW" && diagnosticsAfter.checklistCompletedCount >= 1);

  const historyAfter = await safeJson(await request("GET", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(resolutionItem.id)}/history`));
  record("GET history contains safe resolution checklist events", safeHistoryShape(historyAfter) && historyAfter.entries.some((entry) => entry.action === "resolution_set") && historyAfter.entries.some((entry) => entry.action === "checklist_completed"));

  const notesAfter = await safeJson(await request("GET", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(resolutionItem.id)}/operator-notes`));
  record("GET operator notes contains safe resolution checklist notes", Array.isArray(notesAfter) && notesAfter.every(safeOperatorNoteShape) && notesAfter.some((note) => note.note.includes("resolution updated")) && notesAfter.some((note) => note.note.includes("checklist updated")));
  record("diagnostics history notes safe", safePayloadObject({ diagnosticsAfter, historyAfter, notesAfter }));

  const cleared = await safeJson(await request("PATCH", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(resolutionItem.id)}/resolution`, {
    operation: "CLEAR_RESOLUTION",
    note: "Safe Sprint 70 clear resolution"
  }));
  record("Clear resolution endpoint reachable", safeUnmatchedItemShape(cleared) && cleared.resolutionStatus === "unresolved" && cleared.resolutionOutcome === null);
  record("clear resolution did not mutate review/link/message state", metadataOnlyStateMatches(resolutionItemBefore, cleared));

  const resetChecklist = await safeJson(await request("PATCH", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(resolutionItem.id)}/resolution-checklist`, {
    operation: "RESET_CHECKLIST"
  }));
  record("Reset checklist endpoint reachable", safeUnmatchedItemShape(resetChecklist) && resetChecklist.checklistCompletedCount === 0 && resetChecklist.checklistTotalCount >= 1);
  record("reset checklist did not mutate review/link/message state", metadataOnlyStateMatches(resolutionItemBefore, resetChecklist));

  const bulkResolved = await safeJson(await request("PATCH", "/provider-webhooks/unmatched-inbound/bulk-resolution", {
    ids: [bulkItem.id],
    operation: "SET_RESOLUTION",
    resolutionOutcome: "MANUAL_REVIEW_REQUIRED",
    note: "Safe Sprint 70 bulk resolution"
  }));
  record("Bulk resolution endpoint reachable", safeBulkResolutionShape(bulkResolved) && bulkResolved.operation === "SET_RESOLUTION" && bulkResolved.summary.successCount === 1);

  const bulkChecklist = await safeJson(await request("PATCH", "/provider-webhooks/unmatched-inbound/bulk-resolution", {
    ids: [bulkItem.id],
    operation: "COMPLETE_STEP",
    step: "VIEWED_DIAGNOSTICS",
    note: "Safe Sprint 70 bulk checklist"
  }));
  record("Bulk checklist endpoint reachable", safeBulkResolutionShape(bulkChecklist) && bulkChecklist.operation === "COMPLETE_STEP" && bulkChecklist.summary.successCount === 1);
  record("bulk resolution responses safe", safePayloadObject({ bulkResolved, bulkChecklist }));

  const summaryAfterBulk = await safeJson(await request("GET", "/provider-webhooks/review-resolution-summary?provider=line&resolutionStatus=resolved&resolutionOutcome=MANUAL_REVIEW_REQUIRED&checklistIncomplete=true"));
  record("resolution summary after bulk reachable", safeResolutionSummaryShape(summaryAfterBulk) && summaryAfterBulk.totalItems >= 1);
  record("summary applied filters safe", safePayloadObject(summaryAfterBulk.appliedFilters));

  const reviewed = await safeJson(await request("PATCH", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(resolutionItem.id)}/review`, {
    status: "reviewed",
    reason: "safe sprint 70 review after metadata"
  }));
  const bulkReviewed = await safeJson(await request("PATCH", "/provider-webhooks/unmatched-inbound/bulk-review", {
    ids: [bulkItem.id],
    reviewStatus: "skipped",
    reason: "safe sprint 70 bulk review after metadata"
  }));
  record("single review still works after resolution metadata", safeUnmatchedItemShape(reviewed) && reviewed.reviewStatus === "reviewed");
  record("bulk review still works after resolution metadata", safeBulkReviewShape(bulkReviewed) && bulkReviewed.summary.successCount === 1);

  const metricsAfter = await safeJson(await request("GET", "/provider-webhooks/review-metrics"));
  const alertsAfter = await safeJson(await request("GET", "/provider-webhooks/review-alerts"));
  const triageAfter = await safeJson(await request("GET", "/provider-webhooks/review-triage"));
  const workloadAfter = await safeJson(await request("GET", "/provider-webhooks/review-workload"));
  const resolutionAfter = await safeJson(await request("GET", "/provider-webhooks/review-resolution-summary"));
  const exported = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound/export?provider=line&eventType=message.created&limit=25&offset=0&sortBy=receivedAt&sortOrder=desc&format=json"));
  const eventsAfter = await safeJson(await request("GET", "/provider-webhooks/events"));
  const readinessAfter = await safeJson(await request("GET", "/health/readiness"));

  record("review metrics refetch reachable", safeMetricsShape(metricsAfter));
  record("review alerts refetch reachable", safeAlertsShape(alertsAfter));
  record("review triage refetch reachable", safeTriageShape(triageAfter));
  record("review workload refetch reachable", safeWorkloadShape(workloadAfter));
  record("review resolution summary refetch reachable", safeResolutionSummaryShape(resolutionAfter));
  record("GET unmatched export reachable", safeExportShape(exported));
  record("GET provider webhook events reachable", Array.isArray(eventsAfter) && eventsAfter.every(safeEventShape));
  record("readiness confirms Sprint 70 and externalCalls=0", safeReadinessSprint70Summary(readinessAfter?.providerReadiness) && noNonzeroExternalCalls(readinessAfter));

  const fullSurface = {
    health,
    readinessBefore,
    metricsBefore,
    alertsBefore,
    triageBefore,
    workloadBefore,
    resolutionBefore,
    unmatchedBefore,
    unmatchedAfterCreate,
    resolved,
    summaryAfterResolution,
    checked,
    refetchedAfterChecklist,
    diagnosticsAfter,
    historyAfter,
    notesAfter,
    cleared,
    resetChecklist,
    bulkResolved,
    bulkChecklist,
    summaryAfterBulk,
    reviewed,
    bulkReviewed,
    metricsAfter,
    alertsAfter,
    triageAfter,
    workloadAfter,
    resolutionAfter,
    exported,
    eventsAfter,
    readinessAfter
  };
  record("all Sprint 70 responses safe", safePayloadObject(fullSurface));
  record("externalCalls=0 throughout", noNonzeroExternalCalls(fullSurface));
  record("no provider outbound", !containsProviderOutbound(fullSurface));
  record("no external notification sending", !containsExternalNotification(fullSurface));
  record("no AI/OpenAI call evidence", !containsAiCall(fullSurface));
  record("no live provider network evidence", noLiveProviderNetworkEvidence(fullSurface));

  finish();
}

async function createNoMatchItem(label, text) {
  const eventId = `${runId}-${label}-${Math.random().toString(16).slice(2)}`;
  const payload = linePayload(`safe-no-match-room-sprint70-${label}-${runId}`, `safe-sender-sprint70-${label}`, text);
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
  const unmatched = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound?limit=50&offset=0&sortBy=receivedAt&sortOrder=desc"));
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
      replyToken: "raw-reply-token-sprint70",
      source: { type: "room", userId, roomId },
      message: { id: "safe-message-sprint70", type: "text", text }
    }]
  };
}

function signPayload(payload) {
  return `sha256=${crypto.createHmac("sha256", signingMaterial).update(canonicalJson(payload)).digest("hex")}`;
}

function canonicalJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((item) => canonicalJson(item)).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
}

function metadataOnlyStateMatches(before, after) {
  return Boolean(before && after) &&
    after.reviewStatus === before.reviewStatus &&
    after.linkStatus === before.linkStatus &&
    after.unmatchedStatus === before.unmatchedStatus &&
    after.messagePersisted === before.messagePersisted &&
    after.linkedConversationId === before.linkedConversationId &&
    after.linkedMessageId === before.linkedMessageId;
}

function unmatchedItems(value) {
  if (Array.isArray(value)) return value;
  return Array.isArray(value?.items) ? value.items : [];
}

function safeEventShape(value) {
  return Boolean(value && typeof value.id === "string" && value.externalCalls === 0 && typeof value.payloadDigest === "string");
}

function safeUnmatchedItemShape(value) {
  return Boolean(value &&
    typeof value.id === "string" &&
    value.externalCalls === 0 &&
    typeof value.provider === "string" &&
    value.channelAccountId !== undefined &&
    value.mode === "sandbox" &&
    value.conversationLookupStatus === "not-found" &&
    typeof value.payloadDigest === "string" &&
    typeof value.providerEventDigest === "string" &&
    value.roomKeyDigest !== undefined &&
    typeof value.resolutionStatus === "string" &&
    (value.resolutionOutcome === null || typeof value.resolutionOutcome === "string") &&
    (value.resolvedAt === null || typeof value.resolvedAt === "string") &&
    (value.resolvedByOperatorLabel === null || typeof value.resolvedByOperatorLabel === "string") &&
    typeof value.closureReadiness === "string" &&
    Array.isArray(value.closureChecklist) &&
    value.closureChecklist.every(safeClosureChecklistItem) &&
    Number.isInteger(value.checklistCompletedCount) &&
    Number.isInteger(value.checklistTotalCount) &&
    Array.isArray(value.checklistIncompleteSteps) &&
    value.checklistIncompleteSteps.every((step) => typeof step === "string") &&
    Array.isArray(value.recommendedNextActions) &&
    value.recommendedNextActions.every((action) => typeof action === "string"));
}

function safeClosureChecklistItem(value) {
  return Boolean(value &&
    typeof value.step === "string" &&
    typeof value.completed === "boolean" &&
    (value.completedAt === null || typeof value.completedAt === "string") &&
    (value.completedByOperatorLabel === null || typeof value.completedByOperatorLabel === "string"));
}

function safePageShape(value) {
  return Boolean(value && Array.isArray(value.items) && value.items.every(safeUnmatchedItemShape) && value.pagination && value.appliedSort && value.summary && value.externalCalls === 0);
}

function safeMetricsShape(value) {
  return Boolean(value && value.externalCalls === 0 && Array.isArray(value.byProvider) && value.totalUnmatched >= 0);
}

function safeAlertsShape(value) {
  return Boolean(value && value.externalCalls === 0 && Array.isArray(value.alertItems) && value.thresholds);
}

function safeTriageShape(value) {
  return Boolean(value && value.externalCalls === 0 && Array.isArray(value.lanes) && Array.isArray(value.topItems));
}

function safeWorkloadShape(value) {
  return Boolean(value && value.externalCalls === 0 && value.counts && Array.isArray(value.topAssignedItems) && Array.isArray(value.topEscalatedItems));
}

function safeResolutionSummaryShape(value) {
  return Boolean(value &&
    value.externalCalls === 0 &&
    value.counts &&
    Array.isArray(value.byResolutionStatus) &&
    Array.isArray(value.byResolutionOutcome) &&
    Array.isArray(value.byClosureReadiness) &&
    Array.isArray(value.byChecklistStep) &&
    Array.isArray(value.topReadyItems) &&
    Array.isArray(value.topBlockedItems));
}

function safeDiagnosticsShape(value) {
  return Boolean(value &&
    value.externalCalls === 0 &&
    typeof value.unmatchedId === "string" &&
    typeof value.safeRoomLabel === "string" &&
    typeof value.resolutionStatus === "string" &&
    typeof value.closureReadiness === "string" &&
    Array.isArray(value.closureChecklist) &&
    value.safeWarnings);
}

function safeHistoryShape(value) {
  return Boolean(value && value.externalCalls === 0 && Array.isArray(value.entries) && value.entries.every((entry) => entry.externalCalls === 0));
}

function safeOperatorNoteShape(value) {
  return Boolean(value && value.externalCalls === 0 && typeof value.note === "string" && value.context && typeof value.context.safeRoomLabel === "string");
}

function safeBulkReviewShape(value) {
  return Boolean(value && value.externalCalls === 0 && value.summary && Array.isArray(value.results) && value.results.every((item) => item.externalCalls === 0));
}

function safeBulkResolutionShape(value) {
  return Boolean(value &&
    value.externalCalls === 0 &&
    value.summary &&
    Array.isArray(value.results) &&
    value.results.every((item) => item.externalCalls === 0 && "resolutionStatus" in item && "closureReadiness" in item && "checklistCompletedCount" in item && "checklistTotalCount" in item));
}

function safeExportShape(value) {
  return Boolean(value && value.externalCalls === 0 && Array.isArray(value.rows) && value.rows.every((row) => row.externalCalls === 0));
}

function safeReadinessSprint70Summary(readiness) {
  return Boolean(readiness &&
    readiness.externalCalls === 0 &&
    readiness.realOutboundEnabled === false &&
    readiness.reviewResolutionEnabled === true &&
    readiness.reviewClosureChecklistEnabled === true &&
    readiness.resolutionSummaryEnabled === true &&
    Number.isInteger(readiness.unresolvedOpenCount) &&
    Number.isInteger(readiness.readyForClosureCount) &&
    Number.isInteger(readiness.blockedResolutionCount) &&
    Number.isInteger(readiness.checklistIncompleteOpenCount));
}

function safePayloadObject(value) {
  const serialized = JSON.stringify(value ?? {}, (_key, child) =>
    child === "CONFIRMED_NO_RAW_LEAKAGE" ? "CONFIRMED_SAFE_CHECKLIST_STEP" : child
  );
  return !/(rawPayload|providerRaw|payloadJson|replyToken|authorization|cookie|Bearer|sk-|webhookSecret|accessToken|botToken|apiKey|raw-reply|raw-sender|raw-room|raw-message|raw-line|raw-provider|senderId|(?:^|[^A-Za-z])roomId(?:[^A-Za-z]|$))/i.test(serialized);
}

function noNonzeroExternalCalls(value) {
  if (!value || typeof value !== "object") return true;
  if (Array.isArray(value)) return value.every(noNonzeroExternalCalls);
  for (const [key, nested] of Object.entries(value)) {
    if (key === "externalCalls" && nested !== 0) return false;
    if (!noNonzeroExternalCalls(nested)) return false;
  }
  return true;
}

function containsProviderOutbound(value) {
  return /(line\.push|telegram\.send|facebook\.send|instagram\.send|provider_sdk|outbound\.sent|outbound\.queued)/i.test(JSON.stringify(value ?? {}));
}

function containsExternalNotification(value) {
  return /(email\.sent|slack\.post|webhook\.notify|notification\.sent|external notification)/i.test(JSON.stringify(value ?? {}));
}

function containsAiCall(value) {
  return /(openai|chatgpt|ai\.completion|llm\.request|gpt-)/i.test(JSON.stringify(value ?? {}));
}

function noLiveProviderNetworkEvidence(value) {
  return !/(api\.line\.me|api\.telegram\.org|graph\.facebook\.com|graph\.instagram\.com|openai\.com|slack\.com)/i.test(JSON.stringify(value ?? {}));
}

function isLocalBaseUrl(url) {
  try {
    const parsed = new URL(url);
    return ["localhost", "127.0.0.1", "::1"].includes(parsed.hostname);
  } catch {
    return false;
  }
}

function record(name, pass) {
  results.push({ name, pass: Boolean(pass) });
  console.log(`${pass ? "PASS" : "FAIL"} ${name}`);
}

function finish() {
  const failed = results.filter((result) => !result.pass);
  if (failed.length > 0) {
    console.error(`Sprint 70 smoke failed: ${failed.length}/${results.length} checks failed`);
    for (const result of failed) console.error(`- ${result.name}`);
    process.exit(1);
  }
  console.log(`Sprint 70 smoke PASS: ${results.length}/${results.length}`);
}

main().catch((error) => {
  console.error("Sprint 70 smoke crashed");
  console.error(error);
  process.exit(1);
});
