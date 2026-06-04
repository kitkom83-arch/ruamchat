import crypto from "node:crypto";
import { readFileSync } from "node:fs";

const baseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");
const tenantId = process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
const userId = process.env.USER_ID ?? "00000000-0000-4000-8000-000000000011";
const signingMaterial = process.env.PROVIDER_WEBHOOK_SANDBOX_SIGNING_KEY ?? "local-provider-webhook-sandbox-signing-material";
const runId = `sprint74-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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

  record("smoke script registered", rootPackage.scripts?.["smoke:sprint74"] === "node scripts/smoke-sprint74-provider-webhook-review-export-manifest-handoff.mjs");
  record("Sprint 73 direct regression script registered", rootPackage.scripts?.["smoke:sprint73"] === "node scripts/smoke-sprint73-provider-webhook-review-export-redaction-audit.mjs");
  record("related regression scripts registered", [
    "smoke:sprint72",
    "smoke:sprint71",
    "smoke:sprint64",
    "smoke:sprint60",
    "smoke:sprint54",
    "smoke:sprint52"
  ].every((name) => typeof rootPackage.scripts?.[name] === "string"));
  record("shared export manifest DTOs registered",
    shared.includes("providerWebhookReviewExportManifestSchema") &&
    shared.includes("ProviderWebhookReviewExportManifest") &&
    shared.includes("manualQaReadiness") &&
    shared.includes("manualQaChecks")
  );
  record("backend GET manifest endpoints registered",
    providerController.includes("review-closure-report/export/manifest") &&
    providerController.includes("closure-evidence/export/manifest") &&
    providerController.includes("@Get")
  );
  record("service implements read-only manifest reuse",
    providerService.includes("getUnmatchedInboundClosureEvidenceExportManifest") &&
    providerService.includes("getReviewClosureReportExportManifest") &&
    providerService.includes("getUnmatchedInboundClosureEvidenceRedactionAudit") &&
    providerService.includes("getReviewClosureReportRedactionAudit") &&
    providerService.includes("getReviewClosureExportIntegrity")
  );
  record("readiness exposes safe manifest flags and counts",
    readinessSource.includes("reviewExportManifestEnabled") &&
    readinessSource.includes("reviewExportQaHandoffEnabled") &&
    readinessSource.includes("exportManifestReadyCount") &&
    readinessSource.includes("latestExportManifestStatus")
  );
  record("API client sends manifest requests only through backend",
    apiClient.includes("getProviderWebhookReviewClosureReportExportManifest") &&
    apiClient.includes("getProviderWebhookUnmatchedInboundClosureEvidenceExportManifest") &&
    apiClient.includes("review-closure-report/export/manifest") &&
    apiClient.includes("closure-evidence/export/manifest")
  );
  record("settings data has API and mock manifest loaders",
    settingsData.includes("loadSettingsProviderWebhookReviewClosureReportExportManifestData") &&
    settingsData.includes("loadSettingsProviderWebhookClosureEvidenceExportManifestData") &&
    settingsData.includes("createMockReviewClosureReportExportManifest") &&
    settingsData.includes("createMockClosureEvidenceExportManifest")
  );
  record("provider UI renders compact manifest controls and results",
    providerPanel.includes("Load export manifest") &&
    providerPanel.includes("Load evidence manifest") &&
    providerPanel.includes("manual QA readiness") &&
    providerPanel.includes("Closure report export manifest")
  );

  const health = await safeJson(await request("GET", "/health"));
  record("GET /health reachable", health?.status === "ok" && health?.service === "api");
  record("health response safe", safePayloadObject(health));

  const readinessBefore = await safeJson(await request("GET", "/health/readiness"));
  record("GET /health/readiness reachable", readinessBefore?.status === "ok" && safeReadinessSprint74Summary(readinessBefore?.providerReadiness));
  record("readiness externalCalls=0", noNonzeroExternalCalls(readinessBefore));
  record("manifest capability flags enabled",
    readinessBefore?.providerReadiness?.reviewExportManifestEnabled === true &&
    readinessBefore?.providerReadiness?.reviewExportQaHandoffEnabled === true
  );
  record("readiness safe", safePayloadObject(readinessBefore));

  const evidenceItem = await createNoMatchItem("evidence", "Safe Sprint 74 manifest target");
  record("create safe sandbox no-match item", evidenceItem?.unmatchedStatus === "review-needed");

  const assigned = await safeJson(await request("PATCH", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(evidenceItem.id)}/assignment`, {
    operation: "ASSIGN_TO_ME",
    note: "Safe Sprint 74 manifest assignment"
  }));
  const escalated = await safeJson(await request("PATCH", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(evidenceItem.id)}/escalation`, {
    operation: "ESCALATE",
    escalationReason: "SLA_RISK",
    note: "Safe Sprint 74 manifest escalation"
  }));
  const resolved = await safeJson(await request("PATCH", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(evidenceItem.id)}/resolution`, {
    operation: "SET_RESOLUTION",
    resolutionOutcome: "NEEDS_REVIEW",
    note: "Safe Sprint 74 manifest resolution"
  }));

  const checklistResponses = [];
  for (const step of [
    "VIEWED_DIAGNOSTICS",
    "REVIEWED_HISTORY",
    "REVIEWED_TRIAGE_GUIDANCE",
    "REVIEWED_CANDIDATES",
    "CONFIRMED_NO_RAW_LEAKAGE",
    "CONFIRMED_NO_PROVIDER_OUTBOUND",
    "CONFIRMED_ASSIGNMENT_OR_ESCALATION",
    "CONFIRMED_SAFE_LINK_TARGET",
    "CONFIRMED_OPERATOR_NOTE"
  ]) {
    checklistResponses.push(await safeJson(await request("PATCH", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(evidenceItem.id)}/resolution-checklist`, {
      operation: "COMPLETE_STEP",
      step
    })));
  }
  record("set closure QA state", safeUnmatchedItemShape(resolved) && resolved.resolutionStatus === "resolved" && resolved.resolutionOutcome === "NEEDS_REVIEW");
  record("complete closure checklist", checklistResponses.at(-1)?.checklistCompletedCount >= 9 && checklistResponses.at(-1)?.checklistTotalCount >= 9);
  record("mutation setup responses safe", safePayloadObject({ assigned, escalated, resolved, checklistResponses }));

  const filters = "provider=line&resolutionStatus=resolved&resolutionOutcome=NEEDS_REVIEW&checklistIncomplete=false&assignmentStatus=assigned_to_me&escalationStatus=escalated&escalationReason=SLA_RISK&eventType=message.created";
  const beforeReadPage = await safeJson(await request("GET", `/provider-webhooks/unmatched-inbound?provider=line&resolutionStatus=resolved&resolutionOutcome=NEEDS_REVIEW&limit=25&offset=0&sortBy=receivedAt&sortOrder=desc`));
  const stateBeforeRead = unmatchedItems(beforeReadPage).find((item) => item.id === evidenceItem.id);

  const evidenceExport = await safeJson(await request("GET", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(evidenceItem.id)}/closure-evidence/export`));
  const reportExport = await safeJson(await request("GET", `/provider-webhooks/review-closure-report/export?${filters}`));
  const evidenceAudit = await safeJson(await request("GET", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(evidenceItem.id)}/closure-evidence/redaction-audit`));
  const reportAudit = await safeJson(await request("GET", `/provider-webhooks/review-closure-report/redaction-audit?${filters}`));
  const integrity = await safeJson(await request("GET", `/provider-webhooks/review-closure-export-integrity?${filters}`));
  const evidenceManifest = await safeJson(await request("GET", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(evidenceItem.id)}/closure-evidence/export/manifest`));
  const reportManifest = await safeJson(await request("GET", `/provider-webhooks/review-closure-report/export/manifest?${filters}`));

  record("closure exports still reachable", safeClosureExportShape(evidenceExport, "closure-evidence") && safeClosureExportShape(reportExport, "closure-report"));
  record("redaction audits still reachable", safeRedactionAuditShape(evidenceAudit, "closure-evidence-export") && safeRedactionAuditShape(reportAudit, "closure-report-export"));
  record("export integrity still reachable", safeIntegrityShape(integrity));
  record("evidence export manifest reachable", safeManifestShape(evidenceManifest, "closure-evidence-export", "closure-evidence") && evidenceManifest.unmatchedId === evidenceItem.id);
  record("report export manifest reachable", safeManifestShape(reportManifest, "closure-report-export", "closure-report") && reportManifest.appliedFilters?.provider === "line");
  record("manifests summarize redaction and integrity safely",
    [evidenceManifest, reportManifest].every((manifest) =>
      manifest.redactionStatus === "passed" &&
      manifest.integrityStatus === "confirmed" &&
      manifest.deterministicExportConfirmed === true &&
      manifest.manualQaReadiness === "ready" &&
      manifest.manualQaChecks?.redactionPassedOrWarned === true &&
      manifest.manualQaChecks?.redactionBlockedAbsent === true &&
      manifest.manualQaChecks?.externalCallsZero === true &&
      manifest.manualQaChecks?.safeFilenamePresent === true &&
      manifest.manualQaChecks?.safeDigestPresent === true &&
      manifest.manualQaChecks?.manualQaReady === true
    )
  );
  record("manifest safe filenames and digests",
    evidenceManifest.safeFilename.endsWith(".json") &&
    reportManifest.safeFilename.endsWith(".json") &&
    evidenceManifest.safeDigest.startsWith("sha256:") &&
    reportManifest.safeDigest.startsWith("sha256:") &&
    reportManifest.safeReportDigest.startsWith("sha256:")
  );
  record("manifest counts safe",
    evidenceManifest.totalItems === 1 &&
    evidenceManifest.evidenceReadyCount === 1 &&
    reportManifest.totalItems >= 1 &&
    reportManifest.evidenceReadyCount >= 1 &&
    [evidenceManifest, reportManifest].every((manifest) =>
      Number.isInteger(manifest.redactionPassedCount) &&
      Number.isInteger(manifest.redactionWarningCount) &&
      Number.isInteger(manifest.redactionBlockedCount)
    )
  );

  const afterReadPage = await safeJson(await request("GET", `/provider-webhooks/unmatched-inbound?provider=line&resolutionStatus=resolved&resolutionOutcome=NEEDS_REVIEW&limit=25&offset=0&sortBy=receivedAt&sortOrder=desc`));
  const stateAfterRead = unmatchedItems(afterReadPage).find((item) => item.id === evidenceItem.id);
  record("manifest reads do not mutate review/link/message state", metadataOnlyStateMatches(stateBeforeRead, stateAfterRead));

  const readinessAfter = await safeJson(await request("GET", "/health/readiness"));
  record("readiness after manifest reads remains externalCalls=0", safeReadinessSprint74Summary(readinessAfter?.providerReadiness) && noNonzeroExternalCalls(readinessAfter));

  const fullSurface = {
    health,
    readinessBefore,
    beforeReadPage,
    assigned,
    escalated,
    resolved,
    checklistResponses,
    evidenceExport,
    reportExport,
    evidenceAudit,
    reportAudit,
    integrity,
    evidenceManifest,
    reportManifest,
    afterReadPage,
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
  const payload = linePayload(`safe-no-match-room-sprint74-${label}-${runId}`, `safe-sender-sprint74-${label}`, text);
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

function safeReadinessSprint74Summary(value) {
  return value &&
    value.reviewClosureEvidenceEnabled === true &&
    value.reviewClosureReportEnabled === true &&
    value.reviewClosureEvidenceExportEnabled === true &&
    value.reviewClosureReportExportEnabled === true &&
    value.reviewExportRedactionAuditEnabled === true &&
    value.reviewExportIntegrityChecksEnabled === true &&
    value.reviewExportManifestEnabled === true &&
    value.reviewExportQaHandoffEnabled === true &&
    Number.isInteger(value.exportManifestReadyCount) &&
    Number.isInteger(value.exportManifestNeedsReviewCount) &&
    Number.isInteger(value.exportManifestBlockedCount) &&
    (value.latestExportManifestStatus === null || ["ready", "needs_review", "blocked"].includes(value.latestExportManifestStatus)) &&
    value.externalCalls === 0;
}

function safeClosureExportShape(value, exportKind) {
  return value &&
    value.exportKind === exportKind &&
    value.format === "json" &&
    value.contentType === "application/json" &&
    typeof value.safeFilename === "string" &&
    value.safeFilename.endsWith(".json") &&
    typeof value.exportedAt === "string" &&
    value.externalCalls === 0;
}

function safeRedactionAuditShape(value, target) {
  const checks = value?.checks ?? {};
  return value &&
    value.auditTarget === target &&
    ["passed", "blocked", "warning"].includes(value.status) &&
    typeof value.generatedAt === "string" &&
    typeof value.exportShapeVersion === "string" &&
    typeof value.safeDigest === "string" &&
    value.safeDigest.startsWith("sha256:") &&
    Array.isArray(value.issues) &&
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

function safeIntegrityShape(value) {
  return value &&
    typeof value.generatedAt === "string" &&
    value.appliedFilters &&
    Number.isInteger(value.totalCheckedItems) &&
    Number.isInteger(value.redactionPassedCount) &&
    Number.isInteger(value.redactionWarningCount) &&
    Number.isInteger(value.redactionBlockedCount) &&
    typeof value.deterministicExportConfirmed === "boolean" &&
    typeof value.exportShapeVersion === "string" &&
    typeof value.safeReportDigest === "string" &&
    value.safeReportDigest.startsWith("sha256:") &&
    value.externalCalls === 0;
}

function safeManifestShape(value, target, exportKind) {
  const checks = value?.manualQaChecks ?? {};
  return value &&
    value.manifestKind === "provider-webhook-review-export-manifest" &&
    value.manifestTarget === target &&
    value.exportKind === exportKind &&
    value.format === "json" &&
    value.contentType === "application/json" &&
    typeof value.safeFilename === "string" &&
    value.safeFilename.endsWith(".json") &&
    typeof value.generatedAt === "string" &&
    typeof value.exportedAt === "string" &&
    typeof value.exportShapeVersion === "string" &&
    ["passed", "warning", "blocked"].includes(value.redactionStatus) &&
    ["confirmed", "warning", "blocked"].includes(value.integrityStatus) &&
    ["ready", "needs_review", "blocked"].includes(value.manualQaReadiness) &&
    typeof value.safeDigest === "string" &&
    value.safeDigest.startsWith("sha256:") &&
    Number.isInteger(value.totalItems) &&
    Number.isInteger(value.totalOpenItems) &&
    Number.isInteger(value.evidenceReadyCount) &&
    Number.isInteger(value.evidenceBlockedCount) &&
    Number.isInteger(value.evidenceIncompleteCount) &&
    Number.isInteger(value.redactionPassedCount) &&
    Number.isInteger(value.redactionWarningCount) &&
    Number.isInteger(value.redactionBlockedCount) &&
    [
      "redactionPassedOrWarned",
      "redactionBlockedAbsent",
      "deterministicExportConfirmed",
      "safeFilenamePresent",
      "safeDigestPresent",
      "externalCallsZero",
      "manualQaReady"
    ].every((key) => typeof checks[key] === "boolean") &&
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

function safeUnmatchedItemShape(value) {
  return value &&
    typeof value.id === "string" &&
    typeof value.reviewStatus === "string" &&
    typeof value.linkStatus === "string" &&
    typeof value.unmatchedStatus === "string" &&
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
  return !/(reply-token-must-not-return|message-id-must-not-return|providerRaw|payloadJson|"rawPayload"\s*:|"rawSignature"\s*:|"authorization"\s*:|"cookie"\s*:|"accessToken"\s*:|"webhookSecret"\s*:|"providerSecret"\s*:|raw sender|raw room|"senderId"\s*:|"roomId"\s*:|safe-no-match-room-sprint74|safe-sender-sprint74|sha256=.*|line\.push|telegram\.send|facebook\.send|instagram\.send|outbound\.sent|outbound\.queued|openai|ai\.call|notification\.sent)/i.test(text);
}

function containsProviderOutbound(value) {
  return /line\.push|telegram\.send|facebook\.send|instagram\.send|outbound\.sent|outbound\.queued|reply api|push api|send api/i.test(JSON.stringify(value));
}

function containsExternalNotification(value) {
  return /notification\.sent|email\.sent|sms\.sent|webhook\.notify|slack/i.test(JSON.stringify(value));
}

function containsAiCall(value) {
  return /openai|ai\.call|chat_completion|responses\.create|embeddings/i.test(JSON.stringify(value));
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
  console.log(`Sprint 74 smoke checks: ${results.length - failed.length}/${results.length} passed`);
  if (failed.length > 0) {
    console.error(`Failed checks: ${failed.map((result) => result.name).join(", ")}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
