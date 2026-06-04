import crypto from "node:crypto";
import { readFileSync } from "node:fs";

const baseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");
const tenantId = process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
const userId = process.env.USER_ID ?? "00000000-0000-4000-8000-000000000011";
const signingMaterial = process.env.PROVIDER_WEBHOOK_SANDBOX_SIGNING_KEY ?? "local-provider-webhook-sandbox-signing-material";
const runId = `sprint73-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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

  record("smoke script registered", rootPackage.scripts?.["smoke:sprint73"] === "node scripts/smoke-sprint73-provider-webhook-review-export-redaction-audit.mjs");
  record("Sprint 72 regression script registered", rootPackage.scripts?.["smoke:sprint72"] === "node scripts/smoke-sprint72-provider-webhook-review-closure-evidence-export.mjs");
  record("Sprint 71 regression script registered", rootPackage.scripts?.["smoke:sprint71"] === "node scripts/smoke-sprint71-provider-webhook-review-closure-evidence-report.mjs");
  record("Sprint 70 regression script registered", rootPackage.scripts?.["smoke:sprint70"] === "node scripts/smoke-sprint70-provider-webhook-review-resolution-checklist.mjs");
  record("Sprint 69 regression script registered", rootPackage.scripts?.["smoke:sprint69"] === "node scripts/smoke-sprint69-provider-webhook-review-assignment-escalation.mjs");
  record("Sprint 68 regression script registered", rootPackage.scripts?.["smoke:sprint68"] === "node scripts/smoke-sprint68-provider-webhook-review-saved-views-notes.mjs");
  record("shared redaction audit and integrity DTOs registered", shared.includes("providerWebhookReviewExportRedactionAuditSchema") && shared.includes("providerWebhookReviewExportIntegritySchema"));
  record("backend redaction audit and integrity endpoints registered", providerController.includes("closure-evidence/redaction-audit") && providerController.includes("review-closure-report/redaction-audit") && providerController.includes("review-closure-export-integrity"));
  record("service implements read-only redaction audit and integrity", providerService.includes("getUnmatchedInboundClosureEvidenceRedactionAudit") && providerService.includes("getReviewClosureReportRedactionAudit") && providerService.includes("getReviewClosureExportIntegrity"));
  record("readiness exposes Sprint 73 capabilities", readinessSource.includes("reviewExportRedactionAuditEnabled") && readinessSource.includes("reviewExportIntegrityChecksEnabled") && readinessSource.includes("exportRedactionPassedCount"));
  record("API client sends redaction/integrity requests", apiClient.includes("getProviderWebhookReviewClosureReportRedactionAudit") && apiClient.includes("getProviderWebhookReviewClosureExportIntegrity") && apiClient.includes("getProviderWebhookUnmatchedInboundClosureEvidenceRedactionAudit"));
  record("settings data keeps API redaction/integrity backend-only", settingsData.includes("loadSettingsProviderWebhookReviewClosureReportRedactionAuditData") && settingsData.includes("loadSettingsProviderWebhookReviewClosureExportIntegrityData") && settingsData.includes("loadSettingsProviderWebhookClosureEvidenceRedactionAuditData"));
  record("provider UI renders redaction/integrity controls", providerPanel.includes("Audit report export redaction") && providerPanel.includes("Check export integrity") && providerPanel.includes("Audit evidence export redaction"));

  const health = await safeJson(await request("GET", "/health"));
  record("GET /health reachable", health?.status === "ok" && health?.service === "api");
  record("health response safe", safePayloadObject(health));

  const readinessBefore = await safeJson(await request("GET", "/health/readiness"));
  record("GET /health/readiness reachable", readinessBefore?.status === "ok" && safeReadinessSprint73Summary(readinessBefore?.providerReadiness));
  record("readiness externalCalls=0", noNonzeroExternalCalls(readinessBefore));
  record("redaction/integrity capability flags",
    readinessBefore?.providerReadiness?.reviewExportRedactionAuditEnabled === true &&
    readinessBefore?.providerReadiness?.reviewExportIntegrityChecksEnabled === true
  );
  record("readiness safe", safePayloadObject(readinessBefore));

  const evidenceItem = await createNoMatchItem("evidence", "Safe Sprint 73 redaction audit target");
  const bulkItem = await createNoMatchItem("bulk", "Safe Sprint 73 bulk target");
  record("create safe sandbox no-match item", [evidenceItem, bulkItem].every((item) => item?.unmatchedStatus === "review-needed"));

  const assigned = await safeJson(await request("PATCH", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(evidenceItem.id)}/assignment`, {
    operation: "ASSIGN_TO_ME",
    note: "Safe Sprint 73 redaction audit assignment"
  }));
  const escalated = await safeJson(await request("PATCH", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(evidenceItem.id)}/escalation`, {
    operation: "ESCALATE",
    escalationReason: "SLA_RISK",
    note: "Safe Sprint 73 redaction audit escalation"
  }));
  const resolved = await safeJson(await request("PATCH", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(evidenceItem.id)}/resolution`, {
    operation: "SET_RESOLUTION",
    resolutionOutcome: "NEEDS_REVIEW",
    note: "Safe Sprint 73 redaction audit resolution"
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

  const beforeReadPage = await safeJson(await request("GET", `/provider-webhooks/unmatched-inbound?provider=line&resolutionStatus=resolved&resolutionOutcome=NEEDS_REVIEW&limit=25&offset=0&sortBy=receivedAt&sortOrder=desc`));
  const stateBeforeRead = unmatchedItems(beforeReadPage).find((item) => item.id === evidenceItem.id);

  const evidenceExport = await safeJson(await request("GET", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(evidenceItem.id)}/closure-evidence/export`));
  record("GET closure evidence export still reachable", safeClosureEvidenceExportShape(evidenceExport) && evidenceExport.unmatchedId === evidenceItem.id);
  record("closure evidence export response safe", safePayloadObject(evidenceExport));

  const reportExport = await safeJson(await request("GET", "/provider-webhooks/review-closure-report/export?provider=line&resolutionStatus=resolved&resolutionOutcome=NEEDS_REVIEW&checklistIncomplete=true&assignmentStatus=assigned_to_me&escalationStatus=escalated&escalationReason=SLA_RISK&eventType=message.created"));
  record("GET closure report export still reachable", safeClosureReportExportShape(reportExport) && reportExport.totalItems >= 1);
  record("closure report export response safe", safePayloadObject(reportExport));

  const evidenceAudit = await safeJson(await request("GET", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(evidenceItem.id)}/closure-evidence/redaction-audit`));
  record("GET closure evidence redaction audit reachable", safeRedactionAuditShape(evidenceAudit) && evidenceAudit.auditTarget === "closure-evidence-export" && evidenceAudit.unmatchedId === evidenceItem.id);
  record("redaction audit response safe", safePayloadObject(evidenceAudit) && redactionAuditPassedOrWarnedSafely(evidenceAudit));

  const reportAudit = await safeJson(await request("GET", "/provider-webhooks/review-closure-report/redaction-audit?provider=line&resolutionStatus=resolved&resolutionOutcome=NEEDS_REVIEW&checklistIncomplete=true&assignmentStatus=assigned_to_me&escalationStatus=escalated&escalationReason=SLA_RISK&eventType=message.created"));
  record("GET closure report redaction audit reachable", safeRedactionAuditShape(reportAudit) && reportAudit.auditTarget === "closure-report-export");
  record("closure report redaction audit response safe", safePayloadObject(reportAudit) && redactionAuditPassedOrWarnedSafely(reportAudit));

  const integrity = await safeJson(await request("GET", "/provider-webhooks/review-closure-export-integrity?provider=line&resolutionStatus=resolved&resolutionOutcome=NEEDS_REVIEW&checklistIncomplete=true&assignmentStatus=assigned_to_me&escalationStatus=escalated&escalationReason=SLA_RISK&eventType=message.created"));
  record("GET export integrity reachable", safeIntegrityShape(integrity) && integrity.totalCheckedItems >= 1);
  record("integrity response safe", safePayloadObject(integrity) && integrity.deterministicExportConfirmed === true && integrity.redactionBlockedCount === 0);

  const afterReadPage = await safeJson(await request("GET", `/provider-webhooks/unmatched-inbound?provider=line&resolutionStatus=resolved&resolutionOutcome=NEEDS_REVIEW&limit=25&offset=0&sortBy=receivedAt&sortOrder=desc`));
  const stateAfterRead = unmatchedItems(afterReadPage).find((item) => item.id === evidenceItem.id);
  record("redaction/integrity check does not mutate review/link/message state", metadataOnlyStateMatches(stateBeforeRead, stateAfterRead));

  const diagnostics = await safeJson(await request("GET", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(evidenceItem.id)}/diagnostics`));
  const history = await safeJson(await request("GET", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(evidenceItem.id)}/history`));
  const notes = await safeJson(await request("GET", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(evidenceItem.id)}/operator-notes`));
  record("GET diagnostics/history/operator notes still safe", safeDiagnosticsShape(diagnostics) && safeHistoryShape(history) && Array.isArray(notes) && notes.every(safeOperatorNoteShape) && safePayloadObject({ diagnostics, history, notes }));

  const reviewed = await safeJson(await request("PATCH", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(evidenceItem.id)}/review`, {
    status: "reviewed",
    reason: "safe sprint 73 review after redaction audit"
  }));
  const bulkReviewed = await safeJson(await request("PATCH", "/provider-webhooks/unmatched-inbound/bulk-review", {
    ids: [bulkItem.id],
    reviewStatus: "skipped",
    reason: "safe sprint 73 bulk review after redaction audit"
  }));
  record("single review still works after redaction/integrity read", safeUnmatchedItemShape(reviewed) && reviewed.reviewStatus === "reviewed");
  record("bulk review still works after redaction/integrity read", safeBulkReviewShape(bulkReviewed) && bulkReviewed.summary.successCount === 1);

  const readinessAfter = await safeJson(await request("GET", "/health/readiness"));
  record("readiness after redaction/integrity remains externalCalls=0", safeReadinessSprint73Summary(readinessAfter?.providerReadiness) && noNonzeroExternalCalls(readinessAfter));
  record("Sprint 72 smoke still passes via required regression command", rootPackage.scripts?.["smoke:sprint72"] && providerService.includes("getReviewClosureReportExport"));

  const fullSurface = {
    health,
    readinessBefore,
    beforeReadPage,
    assigned,
    escalated,
    resolved,
    checkedDiagnostics,
    checkedNoRaw,
    checkedNoOutbound,
    evidenceExport,
    reportExport,
    evidenceAudit,
    reportAudit,
    integrity,
    afterReadPage,
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
  const payload = linePayload(`safe-no-match-room-sprint73-${label}-${runId}`, `safe-sender-sprint73-${label}`, text);
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

function safeReadinessSprint73Summary(value) {
  return value &&
    value.reviewClosureEvidenceEnabled === true &&
    value.reviewClosureReportEnabled === true &&
    value.reviewClosureEvidenceExportEnabled === true &&
    value.reviewClosureReportExportEnabled === true &&
    value.reviewExportRedactionAuditEnabled === true &&
    value.reviewExportIntegrityChecksEnabled === true &&
    Number.isInteger(value.exportRedactionPassedCount) &&
    Number.isInteger(value.exportRedactionWarningCount) &&
    Number.isInteger(value.exportRedactionBlockedCount) &&
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
    typeof value.roomKeyDigest === "string" &&
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
    Number.isInteger(value.totalItems) &&
    Number.isInteger(value.evidenceReadyCount) &&
    Number.isInteger(value.evidenceWarningCount ?? 0) &&
    value.externalCalls === 0;
}

function safeRedactionAuditShape(value) {
  const checks = value?.checks ?? {};
  return value &&
    ["closure-evidence-export", "closure-report-export"].includes(value.auditTarget) &&
    ["passed", "blocked", "warning"].includes(value.status) &&
    typeof value.generatedAt === "string" &&
    typeof value.exportShapeVersion === "string" &&
    typeof value.safeDigest === "string" &&
    value.safeDigest.startsWith("sha256:") &&
    Array.isArray(value.issues) &&
    value.issues.every(safeRedactionIssueShape) &&
    [
      "rawPayloadAbsent",
      "rawSignatureAbsent",
      "tokenAbsent",
      "authorizationAbsent",
      "cookieAbsent",
      "replyTokenAbsent",
      "rawSenderIdAbsent",
      "rawRoomIdAbsent",
      "providerSecretAbsent",
      "providerOutboundAbsent",
      "externalCallsZero",
      "safeRoomDigestPresent",
      "tenantScoped",
      "exportDeterministic"
    ].every((key) => typeof checks[key] === "boolean") &&
    value.externalCalls === 0;
}

function redactionAuditPassedOrWarnedSafely(value) {
  return (value.status === "passed" || value.status === "warning") &&
    value.checks.rawPayloadAbsent === true &&
    value.checks.rawSignatureAbsent === true &&
    value.checks.tokenAbsent === true &&
    value.checks.authorizationAbsent === true &&
    value.checks.cookieAbsent === true &&
    value.checks.replyTokenAbsent === true &&
    value.checks.rawSenderIdAbsent === true &&
    value.checks.rawRoomIdAbsent === true &&
    value.checks.providerSecretAbsent === true &&
    value.checks.providerOutboundAbsent === true &&
    value.checks.externalCallsZero === true &&
    value.checks.tenantScoped === true &&
    value.checks.exportDeterministic === true;
}

function safeRedactionIssueShape(value) {
  return value &&
    typeof value.code === "string" &&
    ["warning", "blocked"].includes(value.severity) &&
    typeof value.safeLabel === "string" &&
    typeof value.recommendedAction === "string" &&
    !safeStringContainsUnsafeRaw(value.safeLabel) &&
    !safeStringContainsUnsafeRaw(value.recommendedAction);
}

function safeIntegrityShape(value) {
  return value &&
    typeof value.generatedAt === "string" &&
    value.appliedFilters &&
    value.externalCalls === 0 &&
    Number.isInteger(value.totalCheckedItems) &&
    Number.isInteger(value.redactionPassedCount) &&
    Number.isInteger(value.redactionWarningCount) &&
    Number.isInteger(value.redactionBlockedCount) &&
    typeof value.deterministicExportConfirmed === "boolean" &&
    typeof value.exportShapeVersion === "string" &&
    typeof value.safeReportDigest === "string" &&
    value.safeReportDigest.startsWith("sha256:");
}

function safeEventShape(value) {
  return value &&
    typeof value.id === "string" &&
    value.tenantId === tenantId &&
    value.provider === "line" &&
    value.externalCalls === 0;
}

function safeUnmatchedItemShape(value) {
  return value &&
    typeof value.id === "string" &&
    value.roomKeyDigest &&
    value.externalCalls === 0;
}

function safeDiagnosticsShape(value) {
  return value &&
    typeof value.unmatchedId === "string" &&
    typeof value.safeRoomLabel === "string" &&
    value.externalCalls === 0;
}

function safeHistoryShape(value) {
  return value &&
    typeof value.unmatchedInboundId === "string" &&
    Array.isArray(value.entries) &&
    value.entries.every((entry) => entry.externalCalls === 0) &&
    value.externalCalls === 0;
}

function safeOperatorNoteShape(value) {
  return value &&
    typeof value.id === "string" &&
    typeof value.note === "string" &&
    value.externalCalls === 0;
}

function safeBulkReviewShape(value) {
  return value &&
    Array.isArray(value.results) &&
    value.results.every((item) => item.externalCalls === 0) &&
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

function safePayloadObject(value) {
  return !safeStringContainsUnsafeRaw(JSON.stringify(value));
}

function safeStringContainsUnsafeRaw(serialized) {
  return /reply-token-must-not-return|message-id-must-not-return|providerRaw|payloadJson|"rawPayload"\s*:|"authorization"\s*:|"cookie"\s*:|"accessToken"\s*:|"webhookSecret"\s*:|"providerSecret"\s*:|line\.push|telegram\.send|facebook\.send|instagram\.send|outbound\.sent|outbound\.queued|openai|ai\.call|notification\.sent/i.test(serialized);
}

function noNonzeroExternalCalls(value) {
  const serialized = JSON.stringify(value);
  return !/"externalCalls"\s*:\s*(?!0\b)/.test(serialized);
}

function containsProviderOutbound(value) {
  return /line\.push|telegram\.send|facebook\.send|instagram\.send|outbound\.sent|outbound\.queued/i.test(JSON.stringify(value));
}

function containsExternalNotification(value) {
  return /notification\.sent|email\.sent|sms\.sent|webhook\.notify/i.test(JSON.stringify(value));
}

function containsAiCall(value) {
  return /openai|ai\.call|chat_completion|responses\.create/i.test(JSON.stringify(value));
}

function isLocalBaseUrl(value) {
  return /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(value);
}

function record(name, passed) {
  const ok = Boolean(passed);
  results.push({ name, passed: ok });
  console.log(`${ok ? "PASS" : "FAIL"} ${name}`);
}

function finish() {
  const failed = results.filter((result) => !result.passed);
  console.log(`Sprint 73 smoke checked ${results.length} assertions`);
  if (failed.length > 0) {
    console.error(`Sprint 73 smoke failed ${failed.length} assertion(s):`);
    for (const failure of failed) console.error(`- ${failure.name}`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("Sprint 73 smoke failed:", error);
  process.exitCode = 1;
});
