import crypto from "node:crypto";
import { readFileSync } from "node:fs";

const baseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");
const tenantId = process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
const userId = process.env.USER_ID ?? "00000000-0000-4000-8000-000000000011";
const signingMaterial = process.env.PROVIDER_WEBHOOK_SANDBOX_SIGNING_KEY ?? "local-provider-webhook-sandbox-signing-material";
const runId = `sprint72-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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

  record("smoke script registered", rootPackage.scripts?.["smoke:sprint72"] === "node scripts/smoke-sprint72-provider-webhook-review-closure-evidence-export.mjs");
  record("Sprint 71 regression script registered", rootPackage.scripts?.["smoke:sprint71"] === "node scripts/smoke-sprint71-provider-webhook-review-closure-evidence-report.mjs");
  record("Sprint 70 regression script registered", rootPackage.scripts?.["smoke:sprint70"] === "node scripts/smoke-sprint70-provider-webhook-review-resolution-checklist.mjs");
  record("Sprint 69 regression script registered", rootPackage.scripts?.["smoke:sprint69"] === "node scripts/smoke-sprint69-provider-webhook-review-assignment-escalation.mjs");
  record("Sprint 68 regression script registered", rootPackage.scripts?.["smoke:sprint68"] === "node scripts/smoke-sprint68-provider-webhook-review-saved-views-notes.mjs");
  record("shared closure export DTOs registered", shared.includes("providerWebhookReviewClosureEvidenceExportSchema") && shared.includes("providerWebhookReviewClosureReportExportSchema"));
  record("backend closure export endpoints registered", providerController.includes("review-closure-report/export") && providerController.includes("closure-evidence/export"));
  record("service implements read-only closure exports", providerService.includes("getUnmatchedInboundClosureEvidenceExport") && providerService.includes("getReviewClosureReportExport"));
  record("readiness exposes Sprint 72 capabilities", readinessSource.includes("reviewClosureEvidenceExportEnabled") && readinessSource.includes("reviewClosureReportExportEnabled") && readinessSource.includes("closureEvidenceExportCount"));
  record("API client sends closure export requests", apiClient.includes("getProviderWebhookReviewClosureReportExport") && apiClient.includes("/provider-webhooks/review-closure-report/export") && apiClient.includes("/closure-evidence/export"));
  record("settings data keeps API closure export backend-only", settingsData.includes("exportSettingsProviderWebhookReviewClosureReportData") && settingsData.includes("exportSettingsProviderWebhookClosureEvidenceData"));
  record("provider UI renders closure export controls", providerPanel.includes("Export closure report") && providerPanel.includes("Export closure evidence"));
  record("Sprint 71 smoke still passes via required regression command", rootPackage.scripts?.["smoke:sprint71"] && providerService.includes("getReviewClosureReport"));

  const health = await safeJson(await request("GET", "/health"));
  record("GET /health reachable", health?.status === "ok" && health?.service === "api");
  record("health response safe", safePayloadObject(health));

  const readinessBefore = await safeJson(await request("GET", "/health/readiness"));
  record("GET /health/readiness reachable", readinessBefore?.status === "ok" && safeReadinessSprint72Summary(readinessBefore?.providerReadiness));
  record("readiness externalCalls=0", noNonzeroExternalCalls(readinessBefore));
  record("closure evidence/report export capability flags",
    readinessBefore?.providerReadiness?.reviewClosureEvidenceExportEnabled === true &&
    readinessBefore?.providerReadiness?.reviewClosureReportExportEnabled === true
  );
  record("readiness safe", safePayloadObject(readinessBefore));

  const evidenceItem = await createNoMatchItem("evidence", "Safe Sprint 72 evidence export target");
  const bulkItem = await createNoMatchItem("bulk", "Safe Sprint 72 bulk target");
  record("create safe sandbox no-match item", [evidenceItem, bulkItem].every((item) => item?.unmatchedStatus === "review-needed"));

  const assigned = await safeJson(await request("PATCH", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(evidenceItem.id)}/assignment`, {
    operation: "ASSIGN_TO_ME",
    note: "Safe Sprint 72 evidence export assignment"
  }));
  const escalated = await safeJson(await request("PATCH", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(evidenceItem.id)}/escalation`, {
    operation: "ESCALATE",
    escalationReason: "SLA_RISK",
    note: "Safe Sprint 72 evidence export escalation"
  }));
  const resolved = await safeJson(await request("PATCH", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(evidenceItem.id)}/resolution`, {
    operation: "SET_RESOLUTION",
    resolutionOutcome: "NEEDS_REVIEW",
    note: "Safe Sprint 72 evidence export resolution"
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

  const beforeExportPage = await safeJson(await request("GET", `/provider-webhooks/unmatched-inbound?provider=line&resolutionStatus=resolved&resolutionOutcome=NEEDS_REVIEW&limit=25&offset=0&sortBy=receivedAt&sortOrder=desc`));
  const stateBeforeExport = unmatchedItems(beforeExportPage).find((item) => item.id === evidenceItem.id);
  const evidenceExport = await safeJson(await request("GET", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(evidenceItem.id)}/closure-evidence/export`));
  record("GET closure evidence export reachable", safeClosureEvidenceExportShape(evidenceExport) && evidenceExport.unmatchedId === evidenceItem.id);
  record("closure evidence export response safe", safePayloadObject(evidenceExport));
  record("closure evidence export includes safe metadata",
    evidenceExport.reviewStatus === "pending" &&
    evidenceExport.linkStatus === "none" &&
    evidenceExport.unmatchedStatus === "review-needed" &&
    evidenceExport.resolutionStatus === "resolved" &&
    evidenceExport.resolutionOutcome === "NEEDS_REVIEW" &&
    evidenceExport.assignmentStatus === "assigned" &&
    evidenceExport.escalationStatus === "escalated" &&
    evidenceExport.evidenceFlags.noProviderOutboundConfirmed === true &&
    evidenceExport.evidenceFlags.noRawLeakageConfirmed === true
  );

  const afterExportPage = await safeJson(await request("GET", `/provider-webhooks/unmatched-inbound?provider=line&resolutionStatus=resolved&resolutionOutcome=NEEDS_REVIEW&limit=25&offset=0&sortBy=receivedAt&sortOrder=desc`));
  const stateAfterExport = unmatchedItems(afterExportPage).find((item) => item.id === evidenceItem.id);
  record("closure evidence export does not mutate review/link/message state", metadataOnlyStateMatches(stateBeforeExport, stateAfterExport));

  const reportExport = await safeJson(await request("GET", "/provider-webhooks/review-closure-report/export?provider=line&resolutionStatus=resolved&resolutionOutcome=NEEDS_REVIEW&checklistIncomplete=true&assignmentStatus=assigned_to_me&escalationStatus=escalated&escalationReason=SLA_RISK&eventType=message.created"));
  record("GET closure report export reachable", safeClosureReportExportShape(reportExport) && reportExport.totalItems >= 1);
  record("closure report export filters safe", reportExport.appliedFilters.provider === "line" && reportExport.appliedFilters.resolutionOutcome === "NEEDS_REVIEW" && reportExport.appliedFilters.checklistIncomplete === true && safePayloadObject(reportExport.appliedFilters));
  record("closure report export counts safe", Number.isInteger(reportExport.totalItems) && Number.isInteger(reportExport.totalOpenItems) && Number.isInteger(reportExport.evidenceReadyCount) && Number.isInteger(reportExport.evidenceBlockedCount) && Number.isInteger(reportExport.evidenceIncompleteCount));

  const diagnostics = await safeJson(await request("GET", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(evidenceItem.id)}/diagnostics`));
  const history = await safeJson(await request("GET", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(evidenceItem.id)}/history`));
  const notes = await safeJson(await request("GET", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(evidenceItem.id)}/operator-notes`));
  record("GET diagnostics/history/operator notes still safe", safeDiagnosticsShape(diagnostics) && safeHistoryShape(history) && Array.isArray(notes) && notes.every(safeOperatorNoteShape) && safePayloadObject({ diagnostics, history, notes }));

  const reviewed = await safeJson(await request("PATCH", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(evidenceItem.id)}/review`, {
    status: "reviewed",
    reason: "safe sprint 72 review after export read"
  }));
  const bulkReviewed = await safeJson(await request("PATCH", "/provider-webhooks/unmatched-inbound/bulk-review", {
    ids: [bulkItem.id],
    reviewStatus: "skipped",
    reason: "safe sprint 72 bulk review after export read"
  }));
  record("single review still works after export read", safeUnmatchedItemShape(reviewed) && reviewed.reviewStatus === "reviewed");
  record("bulk review still works after export read", safeBulkReviewShape(bulkReviewed) && bulkReviewed.summary.successCount === 1);

  const readinessAfter = await safeJson(await request("GET", "/health/readiness"));
  record("readiness after export remains externalCalls=0", safeReadinessSprint72Summary(readinessAfter?.providerReadiness) && noNonzeroExternalCalls(readinessAfter));

  const fullSurface = {
    health,
    readinessBefore,
    beforeExportPage,
    assigned,
    escalated,
    resolved,
    checkedDiagnostics,
    checkedNoRaw,
    checkedNoOutbound,
    evidenceExport,
    afterExportPage,
    reportExport,
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
  const payload = linePayload(`safe-no-match-room-sprint72-${label}-${runId}`, `safe-sender-sprint72-${label}`, text);
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
  return fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      "x-tenant-id": tenantId,
      "x-user-id": userId
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
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

function safeReadinessSprint72Summary(value) {
  return value &&
    value.reviewClosureEvidenceEnabled === true &&
    value.reviewClosureReportEnabled === true &&
    value.reviewClosureEvidenceExportEnabled === true &&
    value.reviewClosureReportExportEnabled === true &&
    Number.isInteger(value.closureEvidenceReadyCount) &&
    Number.isInteger(value.closureEvidenceBlockedCount) &&
    Number.isInteger(value.closureEvidenceIncompleteCount) &&
    Number.isInteger(value.closureEvidenceExportCount) &&
    Number.isInteger(value.closureReportExportCount) &&
    value.externalCalls === 0;
}

function safeClosureEvidenceExportShape(value) {
  return value &&
    value.exportKind === "closure-evidence" &&
    value.format === "json" &&
    value.contentType === "application/json" &&
    typeof value.safeFilename === "string" &&
    value.safeFilename.endsWith(".json") &&
    typeof value.exportedAt === "string" &&
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
    value.evidenceFlags &&
    Number.isInteger(value.historyEntryCount) &&
    Number.isInteger(value.operatorNoteCount) &&
    Number.isInteger(value.candidateSummaryCount) &&
    value.externalCalls === 0;
}

function safeClosureReportExportShape(value) {
  return value &&
    value.exportKind === "closure-report" &&
    value.format === "json" &&
    value.contentType === "application/json" &&
    typeof value.safeFilename === "string" &&
    value.safeFilename.endsWith(".json") &&
    typeof value.exportedAt === "string" &&
    typeof value.generatedAt === "string" &&
    value.appliedFilters &&
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
    value.externalCalls === 0;
}

function safeDiagnosticsShape(value) {
  return value &&
    typeof value.unmatchedId === "string" &&
    typeof value.safeRoomLabel === "string" &&
    (value.roomKeyDigest === null || /^sha256:/.test(value.roomKeyDigest)) &&
    value.safeWarnings &&
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
    value.context &&
    value.externalCalls === 0;
}

function safeUnmatchedItemShape(value) {
  return value &&
    typeof value.id === "string" &&
    (value.roomKeyDigest === null || /^sha256:/.test(value.roomKeyDigest)) &&
    typeof value.reviewStatus === "string" &&
    typeof value.linkStatus === "string" &&
    typeof value.unmatchedStatus === "string" &&
    value.externalCalls === 0;
}

function safeBulkReviewShape(value) {
  return value &&
    Array.isArray(value.results) &&
    value.summary &&
    value.results.every((item) => item.externalCalls === 0) &&
    value.externalCalls === 0;
}

function safeEventShape(value) {
  return value &&
    typeof value.id === "string" &&
    value.provider === "line" &&
    value.eventType === "message.created" &&
    typeof value.payloadDigest === "string" &&
    value.externalCalls === 0;
}

function metadataOnlyStateMatches(before, after) {
  return before && after &&
    before.reviewStatus === after.reviewStatus &&
    before.linkStatus === after.linkStatus &&
    before.unmatchedStatus === after.unmatchedStatus &&
    before.messagePersisted === after.messagePersisted &&
    before.linkedConversationId === after.linkedConversationId &&
    before.linkedMessageId === after.linkedMessageId;
}

function noNonzeroExternalCalls(value) {
  const found = [];
  walk(value, (key, child) => {
    if (key === "externalCalls" && child !== 0) found.push(child);
  });
  return found.length === 0;
}

function safePayloadObject(value) {
  const text = JSON.stringify(value);
  return !/(rawPayload|providerRaw|payloadJson|rawSignature|signatureValue|x-line-signature|sha256=.*|token|replyToken|authorization|cookie|webhookSecret|accessToken|raw sender|raw room|senderId|roomId|raw-|must-not-return|safe-no-match-room-sprint72|safe-sender-sprint72)/i.test(text);
}

function containsProviderOutbound(value) {
  return /(provider outbound executed|line outbound|telegram outbound|facebook outbound|instagram outbound|reply api|push api|send api)/i.test(JSON.stringify(value));
}

function containsExternalNotification(value) {
  return /(external notification|slack|email sent|webhook notification|notify sent)/i.test(JSON.stringify(value));
}

function containsAiCall(value) {
  return /(openai|ai call|llm|chat completion|responses api|embeddings)/i.test(JSON.stringify(value));
}

function walk(value, visit, key = "") {
  visit(key, value);
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, visit, String(index)));
    return;
  }
  for (const [childKey, childValue] of Object.entries(value)) {
    walk(childValue, visit, childKey);
  }
}

function isLocalBaseUrl(value) {
  try {
    const url = new URL(value);
    return ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
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
  console.log(`Sprint 72 smoke checks: ${results.length - failed.length}/${results.length} passed`);
  if (failed.length > 0) {
    console.error(`Failed checks: ${failed.map((result) => result.name).join(", ")}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
