import crypto from "node:crypto";
import { readFileSync } from "node:fs";

const baseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");
const tenantId = process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
const userId = process.env.USER_ID ?? "00000000-0000-4000-8000-000000000011";
const signingMaterial = process.env.PROVIDER_WEBHOOK_SANDBOX_SIGNING_KEY ?? "local-provider-webhook-sandbox-signing-material";
const runId = `sprint71-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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

  record("smoke script registered", rootPackage.scripts?.["smoke:sprint71"] === "node scripts/smoke-sprint71-provider-webhook-review-closure-evidence-report.mjs");
  record("Sprint 70 regression script registered", rootPackage.scripts?.["smoke:sprint70"] === "node scripts/smoke-sprint70-provider-webhook-review-resolution-checklist.mjs");
  record("Sprint 69 regression script registered", rootPackage.scripts?.["smoke:sprint69"] === "node scripts/smoke-sprint69-provider-webhook-review-assignment-escalation.mjs");
  record("Sprint 68 regression script registered", rootPackage.scripts?.["smoke:sprint68"] === "node scripts/smoke-sprint68-provider-webhook-review-saved-views-notes.mjs");
  record("shared closure evidence report DTOs registered", shared.includes("providerWebhookReviewClosureEvidenceSchema") && shared.includes("providerWebhookReviewClosureReportSchema"));
  record("backend closure evidence report endpoints registered", providerController.includes("review-closure-report") && providerController.includes("closure-evidence"));
  record("service implements read-only closure evidence report", providerService.includes("getUnmatchedInboundClosureEvidence") && providerService.includes("getReviewClosureReport") && providerService.includes("closureEvidenceSummaryItemFromUnmatched"));
  record("readiness exposes Sprint 71 capabilities", readinessSource.includes("reviewClosureEvidenceEnabled") && readinessSource.includes("reviewClosureReportEnabled") && readinessSource.includes("closureEvidenceReadyCount"));
  record("API client sends closure evidence report requests", apiClient.includes("getProviderWebhookReviewClosureReport") && apiClient.includes("/provider-webhooks/review-closure-report") && apiClient.includes("/closure-evidence"));
  record("settings data keeps API closure evidence backend-only", settingsData.includes("loadSettingsProviderWebhookReviewClosureReportData") && settingsData.includes("loadSettingsProviderWebhookClosureEvidenceData"));
  record("provider UI renders closure evidence report controls", providerPanel.includes("Closure evidence report") && providerPanel.includes("View closure evidence"));

  const health = await safeJson(await request("GET", "/health"));
  record("GET /health reachable", health?.status === "ok" && health?.service === "api");
  record("health response safe", safePayloadObject(health));

  const readinessBefore = await safeJson(await request("GET", "/health/readiness"));
  record("GET /health/readiness reachable", readinessBefore?.status === "ok" && safeReadinessSprint71Summary(readinessBefore?.providerReadiness));
  record("readiness externalCalls=0", noNonzeroExternalCalls(readinessBefore));
  record("closure evidence/report capability flags", readinessBefore?.providerReadiness?.reviewClosureEvidenceEnabled === true && readinessBefore?.providerReadiness?.reviewClosureReportEnabled === true);
  record("readiness safe", safePayloadObject(readinessBefore));

  const evidenceItem = await createNoMatchItem("evidence", "Safe Sprint 71 evidence target");
  const bulkItem = await createNoMatchItem("bulk", "Safe Sprint 71 bulk target");
  record("create safe sandbox no-match item", [evidenceItem, bulkItem].every((item) => item?.unmatchedStatus === "review-needed"));

  const unmatchedAfterCreate = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound?provider=line&reviewStatus=pending&linkStatus=none&status=open&eventType=message.created&limit=25&offset=0&sortBy=receivedAt&sortOrder=desc"));
  const evidenceBefore = unmatchedItems(unmatchedAfterCreate).find((item) => item.id === evidenceItem.id);
  record("created unmatched items appear", safePageShape(unmatchedAfterCreate) && [evidenceItem.id, bulkItem.id].every((id) => unmatchedItems(unmatchedAfterCreate).some((item) => item.id === id)));

  const assigned = await safeJson(await request("PATCH", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(evidenceItem.id)}/assignment`, {
    operation: "ASSIGN_TO_ME",
    note: "Safe Sprint 71 evidence assignment"
  }));
  const escalated = await safeJson(await request("PATCH", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(evidenceItem.id)}/escalation`, {
    operation: "ESCALATE",
    escalationReason: "SLA_RISK",
    note: "Safe Sprint 71 evidence escalation"
  }));
  const resolved = await safeJson(await request("PATCH", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(evidenceItem.id)}/resolution`, {
    operation: "SET_RESOLUTION",
    resolutionOutcome: "NEEDS_REVIEW",
    note: "Safe Sprint 71 evidence resolution"
  }));
  const checkedDiagnostics = await safeJson(await request("PATCH", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(evidenceItem.id)}/resolution-checklist`, {
    operation: "COMPLETE_STEP",
    step: "VIEWED_DIAGNOSTICS"
  }));
  const checkedNoRaw = await safeJson(await request("PATCH", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(evidenceItem.id)}/resolution-checklist`, {
    operation: "COMPLETE_STEP",
    step: "CONFIRMED_NO_RAW_LEAKAGE"
  }));
  const checkedNoOutbound = await safeJson(await request("PATCH", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(evidenceItem.id)}/resolution-checklist`, {
    operation: "COMPLETE_STEP",
    step: "CONFIRMED_NO_PROVIDER_OUTBOUND"
  }));
  record("set resolution metadata", safeUnmatchedItemShape(resolved) && resolved.resolutionStatus === "resolved" && resolved.resolutionOutcome === "NEEDS_REVIEW");
  record("complete at least one checklist step", safeUnmatchedItemShape(checkedDiagnostics) && checkedDiagnostics.checklistCompletedCount >= 1);
  record("resolution/checklist responses safe", safePayloadObject({ assigned, escalated, resolved, checkedDiagnostics, checkedNoRaw, checkedNoOutbound }));

  const refetchedBeforeEvidence = await safeJson(await request("GET", `/provider-webhooks/unmatched-inbound?provider=line&resolutionStatus=resolved&resolutionOutcome=NEEDS_REVIEW&limit=25&offset=0&sortBy=receivedAt&sortOrder=desc`));
  const stateBeforeEvidenceRead = unmatchedItems(refetchedBeforeEvidence).find((item) => item.id === evidenceItem.id);
  const closureEvidence = await safeJson(await request("GET", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(evidenceItem.id)}/closure-evidence`));
  record("GET closure evidence reachable", safeClosureEvidenceShape(closureEvidence) && closureEvidence.unmatchedId === evidenceItem.id);
  record("closure evidence response safe", safePayloadObject(closureEvidence));
  record("closure evidence contains resolution/checklist/assignment/escalation safe metadata where available",
    closureEvidence.resolutionStatus === "resolved" &&
    closureEvidence.resolutionOutcome === "NEEDS_REVIEW" &&
    closureEvidence.checklistCompletedCount >= 3 &&
    closureEvidence.assignmentStatus === "assigned" &&
    closureEvidence.escalationStatus === "escalated" &&
    closureEvidence.escalationReason === "SLA_RISK" &&
    closureEvidence.evidenceFlags.noProviderOutboundConfirmed === true &&
    closureEvidence.evidenceFlags.noRawLeakageConfirmed === true
  );

  const refetchedAfterEvidence = await safeJson(await request("GET", `/provider-webhooks/unmatched-inbound?provider=line&resolutionStatus=resolved&resolutionOutcome=NEEDS_REVIEW&limit=25&offset=0&sortBy=receivedAt&sortOrder=desc`));
  const stateAfterEvidenceRead = unmatchedItems(refetchedAfterEvidence).find((item) => item.id === evidenceItem.id);
  record("closure evidence does not mutate review/link/message state", metadataOnlyStateMatches(stateBeforeEvidenceRead ?? evidenceBefore, stateAfterEvidenceRead));

  const closureReport = await safeJson(await request("GET", "/provider-webhooks/review-closure-report?provider=line&resolutionStatus=resolved&resolutionOutcome=NEEDS_REVIEW&checklistIncomplete=true&assignmentStatus=assigned_to_me&escalationStatus=escalated&escalationReason=SLA_RISK&eventType=message.created"));
  record("GET closure report reachable", safeClosureReportShape(closureReport) && closureReport.totalItems >= 1);
  record("closure report filters safe", closureReport.appliedFilters.provider === "line" && closureReport.appliedFilters.resolutionOutcome === "NEEDS_REVIEW" && closureReport.appliedFilters.checklistIncomplete === true && safePayloadObject(closureReport.appliedFilters));
  record("closure report counts safe", Number.isInteger(closureReport.evidenceReadyCount) && Number.isInteger(closureReport.evidenceBlockedCount) && Number.isInteger(closureReport.evidenceIncompleteCount));

  const diagnostics = await safeJson(await request("GET", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(evidenceItem.id)}/diagnostics`));
  const history = await safeJson(await request("GET", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(evidenceItem.id)}/history`));
  const notes = await safeJson(await request("GET", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(evidenceItem.id)}/operator-notes`));
  record("GET diagnostics/history/operator notes still safe", safeDiagnosticsShape(diagnostics) && safeHistoryShape(history) && Array.isArray(notes) && notes.every(safeOperatorNoteShape) && safePayloadObject({ diagnostics, history, notes }));

  const reviewed = await safeJson(await request("PATCH", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(evidenceItem.id)}/review`, {
    status: "reviewed",
    reason: "safe sprint 71 review after evidence read"
  }));
  const bulkReviewed = await safeJson(await request("PATCH", "/provider-webhooks/unmatched-inbound/bulk-review", {
    ids: [bulkItem.id],
    reviewStatus: "skipped",
    reason: "safe sprint 71 bulk review after evidence read"
  }));
  record("single review still works after evidence read", safeUnmatchedItemShape(reviewed) && reviewed.reviewStatus === "reviewed");
  record("bulk review still works after evidence read", safeBulkReviewShape(bulkReviewed) && bulkReviewed.summary.successCount === 1);

  const readinessAfter = await safeJson(await request("GET", "/health/readiness"));
  record("readiness after evidence/report remains externalCalls=0", safeReadinessSprint71Summary(readinessAfter?.providerReadiness) && noNonzeroExternalCalls(readinessAfter));

  const fullSurface = {
    health,
    readinessBefore,
    unmatchedAfterCreate,
    assigned,
    escalated,
    resolved,
    checkedDiagnostics,
    checkedNoRaw,
    checkedNoOutbound,
    refetchedBeforeEvidence,
    closureEvidence,
    refetchedAfterEvidence,
    closureReport,
    diagnostics,
    history,
    notes,
    reviewed,
    bulkReviewed,
    readinessAfter
  };
  record("externalCalls=0 throughout", noNonzeroExternalCalls(fullSurface));
  record("no provider outbound", !containsProviderOutbound(fullSurface));
  record("no external notification", !containsExternalNotification(fullSurface));
  record("no AI/OpenAI call evidence", !containsAiCall(fullSurface));
  record("no raw payload/signature/token/replyToken/raw sender id/raw room id leakage", safePayloadObject(fullSurface));

  finish();
}

async function createNoMatchItem(label, text) {
  const eventId = `${runId}-${label}-${Math.random().toString(16).slice(2)}`;
  const payload = linePayload(`safe-no-match-room-sprint71-${label}-${runId}`, `safe-sender-sprint71-${label}`, text);
  payload[`safeMarker${label.replace(/[^a-z0-9]/gi, "")}${Date.now()}`] = true;
  const response = await request("POST", "/provider-webhooks/sandbox-events", {
    provider: "line",
    channel: "line",
    eventType: "message.created",
    mode: "sandbox",
    inboundPersistenceMode: "sandbox-persist",
    eventId,
    signature: signPayload(payload),
    payload
  });
  const created = await safeJson(response);
  record(`POST sandbox event ${label} reachable`, safeEventShape(created) && created.unmatchedInboundQueued === true && typeof created.unmatchedInboundId === "string");
  const unmatched = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound?limit=50&offset=0&sortBy=receivedAt&sortOrder=desc"));
  return unmatchedItems(unmatched).find((item) => item.id === created.unmatchedInboundId) ?? null;
}

function linePayload(roomId, userId, text) {
  return {
    events: [{
      type: "message",
      timestamp: Date.now(),
      replyToken: `reply-token-must-not-return-${runId}`,
      source: { type: "room", userId, roomId },
      message: { id: `message-id-must-not-return-${runId}`, type: "text", text }
    }]
  };
}

async function request(method, path, body) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      "x-tenant-id": tenantId,
      "x-user-id": userId
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  return response;
}

async function safeJson(response) {
  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`Non-JSON response ${response.status}: ${text.slice(0, 200)}`);
  }
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${JSON.stringify(json).slice(0, 300)}`);
  }
  return json;
}

function signPayload(payload) {
  return `sha256=${crypto
    .createHmac("sha256", signingMaterial)
    .update(canonicalJson(payload))
    .digest("hex")}`;
}

function canonicalJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
}

function unmatchedItems(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.items)) return value.items;
  return [];
}

function safeReadinessSprint71Summary(value) {
  return value &&
    value.reviewClosureEvidenceEnabled === true &&
    value.reviewClosureReportEnabled === true &&
    Number.isInteger(value.closureEvidenceReadyCount) &&
    Number.isInteger(value.closureEvidenceBlockedCount) &&
    Number.isInteger(value.closureEvidenceIncompleteCount) &&
    value.externalCalls === 0;
}

function safeClosureEvidenceShape(value) {
  return value &&
    typeof value.unmatchedId === "string" &&
    ["line", "telegram", "facebook", "instagram"].includes(value.provider) &&
    typeof value.safeRoomLabel === "string" &&
    (value.roomKeyDigest === null || /^sha256:/.test(value.roomKeyDigest)) &&
    typeof value.reviewStatus === "string" &&
    typeof value.linkStatus === "string" &&
    typeof value.unmatchedStatus === "string" &&
    typeof value.resolutionStatus === "string" &&
    (value.resolutionOutcome === null || typeof value.resolutionOutcome === "string") &&
    typeof value.closureReadiness === "string" &&
    ["ready", "blocked", "incomplete"].includes(value.evidenceStatus) &&
    Number.isInteger(value.checklistCompletedCount) &&
    Number.isInteger(value.checklistTotalCount) &&
    Array.isArray(value.checklistIncompleteSteps) &&
    Array.isArray(value.recommendedNextActions) &&
    safeEvidenceFlags(value.evidenceFlags) &&
    Number.isInteger(value.historyEntryCount) &&
    Number.isInteger(value.operatorNoteCount) &&
    Number.isInteger(value.candidateSummaryCount) &&
    value.externalCalls === 0;
}

function safeClosureReportShape(value) {
  return value &&
    typeof value.generatedAt === "string" &&
    typeof value.appliedFilters === "object" &&
    Number.isInteger(value.totalItems) &&
    Number.isInteger(value.totalOpenItems) &&
    Number.isInteger(value.evidenceReadyCount) &&
    Number.isInteger(value.evidenceBlockedCount) &&
    Number.isInteger(value.evidenceIncompleteCount) &&
    Array.isArray(value.byClosureReadiness) &&
    Array.isArray(value.byResolutionOutcome) &&
    Array.isArray(value.byChecklistStep) &&
    Array.isArray(value.byAssignmentStatus) &&
    Array.isArray(value.byEscalationStatus) &&
    Array.isArray(value.topEvidenceReadyItems) &&
    Array.isArray(value.topEvidenceBlockedItems) &&
    [...value.topEvidenceReadyItems, ...value.topEvidenceBlockedItems].every(safeClosureEvidenceSummaryShape) &&
    value.externalCalls === 0;
}

function safeClosureEvidenceSummaryShape(value) {
  return safeClosureEvidenceShape({ ...value, generatedAt: new Date().toISOString() });
}

function safeEvidenceFlags(value) {
  return value &&
    typeof value.diagnosticsViewedOrAvailable === "boolean" &&
    typeof value.historyAvailable === "boolean" &&
    typeof value.operatorNotesAvailable === "boolean" &&
    typeof value.candidatesAvailable === "boolean" &&
    typeof value.assignmentOrEscalationPresent === "boolean" &&
    typeof value.noProviderOutboundConfirmed === "boolean" &&
    typeof value.noRawLeakageConfirmed === "boolean" &&
    typeof value.safeLinkTargetConfirmed === "boolean";
}

function safePageShape(value) {
  return value && Array.isArray(value.items) && value.items.every(safeUnmatchedItemShape) && value.externalCalls === 0;
}

function safeUnmatchedItemShape(value) {
  return value &&
    typeof value.id === "string" &&
    typeof value.provider === "string" &&
    typeof value.reviewStatus === "string" &&
    typeof value.linkStatus === "string" &&
    typeof value.unmatchedStatus === "string" &&
    typeof value.messagePersisted === "boolean" &&
    value.externalCalls === 0;
}

function safeEventShape(value) {
  return value &&
    typeof value.id === "string" &&
    typeof value.provider === "string" &&
    typeof value.payloadDigest === "string" &&
    value.externalCalls === 0;
}

function safeDiagnosticsShape(value) {
  return value &&
    typeof value.unmatchedId === "string" &&
    typeof value.safeRoomLabel === "string" &&
    typeof value.routingOutcome === "string" &&
    value.externalCalls === 0;
}

function safeHistoryShape(value) {
  return value &&
    typeof value.unmatchedInboundId === "string" &&
    Array.isArray(value.entries) &&
    value.entries.every((entry) => entry.externalCalls === 0 && typeof entry.action === "string") &&
    value.externalCalls === 0;
}

function safeOperatorNoteShape(value) {
  return value &&
    typeof value.id === "string" &&
    typeof value.unmatchedId === "string" &&
    typeof value.note === "string" &&
    value.externalCalls === 0;
}

function safeBulkReviewShape(value) {
  return value &&
    Array.isArray(value.results) &&
    value.results.every((item) => item.externalCalls === 0) &&
    value.summary &&
    value.externalCalls === 0;
}

function metadataOnlyStateMatches(before, after) {
  return before && after &&
    after.reviewStatus === before.reviewStatus &&
    after.linkStatus === before.linkStatus &&
    after.unmatchedStatus === before.unmatchedStatus &&
    after.messagePersisted === before.messagePersisted;
}

function noNonzeroExternalCalls(value) {
  const serialized = JSON.stringify(value);
  return !/"externalCalls"\s*:\s*(?!0\b)/.test(serialized);
}

function safePayloadObject(value) {
  const serialized = JSON.stringify(value);
  return !/(rawPayload|providerRaw|payloadJson|replyToken|authorization|cookie|Bearer|accessToken|webhookSecret|signatureFingerprintRaw|raw sender|raw room|senderId|roomId|message-id-must-not-return|reply-token-must-not-return|safe-no-match-room-sprint71|safe-sender-sprint71|token|secret)/i.test(serialized);
}

function containsProviderOutbound(value) {
  return /(replyMessage|pushMessage|sendMessage|line outbound sent|telegram outbound sent|facebook outbound sent|instagram outbound sent|graph\.facebook|api\.line\.me|"realOutboundEnabled"\s*:\s*true)/i.test(JSON.stringify(value));
}

function containsExternalNotification(value) {
  return /(notification sent|send notification|email sent|slack|webhook notification|external notification)/i.test(JSON.stringify(value));
}

function containsAiCall(value) {
  return /(openai|chat.completions|responses\.create|ai call|model invocation)/i.test(JSON.stringify(value));
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
  console.log(`Sprint 71 smoke: ${results.length - failed.length}/${results.length} checks passed`);
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
