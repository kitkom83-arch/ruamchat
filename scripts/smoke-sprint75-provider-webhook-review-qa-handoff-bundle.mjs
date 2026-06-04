import crypto from "node:crypto";
import { readFileSync } from "node:fs";

const baseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");
const tenantId = process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
const userId = process.env.USER_ID ?? "00000000-0000-4000-8000-000000000011";
const signingMaterial = process.env.PROVIDER_WEBHOOK_SANDBOX_SIGNING_KEY ?? "local-provider-webhook-sandbox-signing-material";
const runId = `sprint75-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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

  record("smoke:sprint75 registered",
    rootPackage.scripts?.["smoke:sprint75"] === "node scripts/smoke-sprint75-provider-webhook-review-qa-handoff-bundle.mjs"
  );
  record("Sprint 74/73/72/71 regression scripts registered", [
    ["smoke:sprint74", "node scripts/smoke-sprint74-provider-webhook-review-export-manifest-handoff.mjs"],
    ["smoke:sprint73", "node scripts/smoke-sprint73-provider-webhook-review-export-redaction-audit.mjs"],
    ["smoke:sprint72", "node scripts/smoke-sprint72-provider-webhook-review-closure-evidence-export.mjs"],
    ["smoke:sprint71", "node scripts/smoke-sprint71-provider-webhook-review-closure-evidence-report.mjs"]
  ].every(([name, command]) => rootPackage.scripts?.[name] === command));
  record("shared QA handoff DTOs registered",
    shared.includes("providerWebhookReviewQaHandoffBundleSchema") &&
    shared.includes("providerWebhookReviewQaHandoffBundleEvidenceItemSchema") &&
    shared.includes("providerWebhookReviewQaHandoffBundleReadinessSchema") &&
    shared.includes("providerWebhookReviewQaHandoffBundleChecksSchema") &&
    shared.includes("providerWebhookReviewExportManifestSchema") &&
    shared.includes("providerWebhookReviewExportRedactionAuditSchema") &&
    shared.includes("providerWebhookReviewExportIntegritySchema")
  );
  record("backend QA handoff route registered",
    providerController.includes("review-qa-handoff-bundle") &&
    providerController.includes("getReviewQaHandoffBundle") &&
    providerController.includes("parseReviewClosureReportFilters")
  );
  record("service implements read-only QA handoff bundle reuse",
    providerService.includes("getReviewQaHandoffBundle") &&
    providerService.includes("getReviewClosureReportExport(") &&
    providerService.includes("getReviewClosureReportExportManifest(") &&
    providerService.includes("getReviewClosureReportRedactionAudit(") &&
    providerService.includes("getReviewClosureExportIntegrity(") &&
    providerService.includes("getUnmatchedInboundClosureEvidenceExportManifest(") &&
    providerService.includes("qaHandoffManualQaChecks") &&
    providerService.includes("qaHandoffReadinessFromSnapshot") &&
    providerService.includes("safeDigestForExport")
  );
  record("readiness exposes QA handoff flags and counts",
    readinessSource.includes("reviewExportQaHandoffEnabled") &&
    readinessSource.includes("exportManifestReadyCount") &&
    readinessSource.includes("exportManifestNeedsReviewCount") &&
    readinessSource.includes("exportManifestBlockedCount") &&
    readinessSource.includes("externalCalls: 0")
  );
  record("API client wires QA handoff through backend",
    apiClient.includes("getProviderWebhookReviewQaHandoffBundle") &&
    apiClient.includes("/provider-webhooks/review-qa-handoff-bundle") &&
    apiClient.includes("providerWebhookReviewQaHandoffBundleSchema")
  );
  record("settings-data wires API and distinguishable mock QA handoff data",
    settingsData.includes("loadSettingsProviderWebhookReviewQaHandoffBundleData") &&
    settingsData.includes("getProviderWebhookReviewQaHandoffBundle") &&
    settingsData.includes("createMockReviewQaHandoffBundle") &&
    settingsData.includes("return {") &&
    settingsData.includes("bundle: createMockReviewQaHandoffBundle")
  );
  record("provider UI renders QA handoff controls and results",
    providerPanel.includes("Load QA handoff bundle") &&
    providerPanel.includes("QA handoff bundle:") &&
    providerPanel.includes("reportManifestReady") &&
    providerPanel.includes("providerOutboundAbsent") &&
    providerPanel.includes("externalCallsZero") &&
    providerPanel.includes("reviewQaHandoffBundleError")
  );
  record("static source has no provider outbound send markers",
    !containsProviderOutbound({ providerController, providerService, apiClient, settingsData, providerPanel })
  );
  record("static source has no external notification send markers",
    !containsExternalNotification({ providerController, providerService, apiClient, settingsData, providerPanel })
  );
  record("static source has no AI/OpenAI call markers",
    !containsAiCall({ providerController, providerService, apiClient, settingsData, providerPanel })
  );

  const health = await safeJson(await request("GET", "/health"));
  record("GET /health reachable", health?.status === "ok" && health?.service === "api");
  record("health response safe", safePayloadObject(health));

  const readinessBefore = await safeJson(await request("GET", "/health/readiness"));
  record("GET /health/readiness reachable", readinessBefore?.status === "ok" && safeReadinessSprint75Summary(readinessBefore?.providerReadiness));
  record("readiness externalCalls=0", noNonzeroExternalCalls(readinessBefore));
  record("readiness safe", safePayloadObject(readinessBefore));

  const evidenceItem = await createNoMatchItem("evidence", "Safe Sprint 75 QA handoff target");
  record("create safe sandbox no-match item", evidenceItem?.unmatchedStatus === "review-needed");

  const assigned = await safeJson(await request("PATCH", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(evidenceItem.id)}/assignment`, {
    operation: "ASSIGN_TO_ME",
    note: "Safe Sprint 75 QA handoff assignment"
  }));
  const escalated = await safeJson(await request("PATCH", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(evidenceItem.id)}/escalation`, {
    operation: "ESCALATE",
    escalationReason: "SLA_RISK",
    note: "Safe Sprint 75 QA handoff escalation"
  }));
  const resolved = await safeJson(await request("PATCH", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(evidenceItem.id)}/resolution`, {
    operation: "SET_RESOLUTION",
    resolutionOutcome: "NEEDS_REVIEW",
    note: "Safe Sprint 75 QA handoff resolution"
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

  const qaBundle = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle?${filters}`));
  record("QA handoff bundle endpoint reachable", safeQaHandoffBundleShape(qaBundle));
  record("QA handoff response safe fields only", safePayloadObject(qaBundle));
  record("QA handoff includes applied filters", qaBundle.appliedFilters?.provider === "line" && qaBundle.appliedFilters?.resolutionStatus === "resolved");
  record("QA handoff readiness flags/counts safe",
    qaBundle.readiness?.reviewExportQaHandoffEnabled === true &&
    Number.isInteger(qaBundle.readiness?.exportManifestReadyCount) &&
    Number.isInteger(qaBundle.readiness?.exportManifestNeedsReviewCount) &&
    Number.isInteger(qaBundle.readiness?.exportManifestBlockedCount) &&
    qaBundle.readiness?.externalCalls === 0
  );
  record("QA handoff aggregates Sprint 71-74 evidence",
    safeClosureReportExportShape(qaBundle.closureReportExport) &&
    safeManifestShape(qaBundle.closureReportManifest, "closure-report-export", "closure-report") &&
    safeRedactionAuditShape(qaBundle.closureReportRedactionAudit, "closure-report-export") &&
    safeIntegrityShape(qaBundle.closureExportIntegrity) &&
    Array.isArray(qaBundle.evidenceManifests)
  );
  record("QA handoff evidence manifest summaries safe",
    qaBundle.evidenceManifests.length >= 1 &&
    qaBundle.evidenceManifests.every(safeQaHandoffEvidenceItemShape)
  );
  record("QA handoff deterministic digest and status fields",
    typeof qaBundle.safeDigest === "string" &&
    qaBundle.safeDigest.startsWith("sha256:") &&
    qaBundle.safeFilename === "provider-webhook-review-qa-handoff-bundle.json" &&
    ["ready", "needs_review", "blocked"].includes(qaBundle.manualQaReadiness) &&
    qaBundle.closureExportIntegrity.deterministicExportConfirmed === true &&
    qaBundle.closureReportManifest.safeDigest.startsWith("sha256:")
  );
  record("QA handoff manual checks pass safe guardrails",
    qaBundle.manualQaChecks?.reportManifestReady === true &&
    qaBundle.manualQaChecks?.reportRedactionPassedOrWarned === true &&
    qaBundle.manualQaChecks?.reportIntegrityConfirmed === true &&
    qaBundle.manualQaChecks?.evidenceManifestsReadyOrNeedsReview === true &&
    qaBundle.manualQaChecks?.rawPayloadAbsent === true &&
    qaBundle.manualQaChecks?.rawSignatureAbsent === true &&
    qaBundle.manualQaChecks?.tokenAbsent === true &&
    qaBundle.manualQaChecks?.replyTokenAbsent === true &&
    qaBundle.manualQaChecks?.rawSenderIdAbsent === true &&
    qaBundle.manualQaChecks?.rawRoomIdAbsent === true &&
    qaBundle.manualQaChecks?.providerOutboundAbsent === true &&
    qaBundle.manualQaChecks?.externalCallsZero === true &&
    qaBundle.manualQaChecks?.readinessFlagsPresent === true
  );
  record("QA handoff externalCalls=0", qaBundle.externalCalls === 0 && noNonzeroExternalCalls(qaBundle));

  const afterReadPage = await safeJson(await request("GET", `/provider-webhooks/unmatched-inbound?provider=line&resolutionStatus=resolved&resolutionOutcome=NEEDS_REVIEW&limit=25&offset=0&sortBy=receivedAt&sortOrder=desc`));
  const stateAfterRead = unmatchedItems(afterReadPage).find((item) => item.id === evidenceItem.id);
  record("QA handoff read does not mutate review/link/message state", metadataOnlyStateMatches(stateBeforeRead, stateAfterRead));

  const readinessAfter = await safeJson(await request("GET", "/health/readiness"));
  record("readiness after QA handoff remains externalCalls=0", safeReadinessSprint75Summary(readinessAfter?.providerReadiness) && noNonzeroExternalCalls(readinessAfter));

  const fullSurface = {
    health,
    readinessBefore,
    beforeReadPage,
    assigned,
    escalated,
    resolved,
    checklistResponses,
    qaBundle,
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
  const payload = linePayload(`safe-no-match-room-sprint75-${label}-${runId}`, `safe-sender-sprint75-${label}`, text);
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

function safeReadinessSprint75Summary(value) {
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

function safeQaHandoffBundleShape(value) {
  return value &&
    value.bundleKind === "provider-webhook-review-qa-handoff-bundle" &&
    typeof value.generatedAt === "string" &&
    typeof value.safeFilename === "string" &&
    value.safeFilename.endsWith(".json") &&
    typeof value.safeDigest === "string" &&
    value.safeDigest.startsWith("sha256:") &&
    value.appliedFilters &&
    value.readiness &&
    safeClosureReportExportShape(value.closureReportExport) &&
    safeManifestShape(value.closureReportManifest, "closure-report-export", "closure-report") &&
    safeRedactionAuditShape(value.closureReportRedactionAudit, "closure-report-export") &&
    safeIntegrityShape(value.closureExportIntegrity) &&
    Array.isArray(value.evidenceManifests) &&
    ["ready", "needs_review", "blocked"].includes(value.manualQaReadiness) &&
    value.manualQaChecks &&
    value.externalCalls === 0;
}

function safeQaHandoffEvidenceItemShape(value) {
  return value &&
    typeof value.unmatchedId === "string" &&
    ["line", "telegram", "facebook", "instagram"].includes(value.provider) &&
    ["ready", "needs_review", "blocked"].includes(value.manualQaReadiness) &&
    typeof value.safeRoomLabel === "string" &&
    typeof value.roomKeyDigest === "string" &&
    typeof value.safeFilename === "string" &&
    value.safeFilename.endsWith(".json") &&
    typeof value.safeDigest === "string" &&
    value.safeDigest.startsWith("sha256:") &&
    ["passed", "warning", "blocked"].includes(value.redactionStatus) &&
    ["confirmed", "warning", "blocked"].includes(value.integrityStatus) &&
    typeof value.deterministicExportConfirmed === "boolean" &&
    value.externalCalls === 0 &&
    safePayloadObject(value);
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
    Number.isInteger(value.evidenceReadyCount) &&
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
  return !safeStringContainsUnsafeRaw(JSON.stringify(value));
}

function safeStringContainsUnsafeRaw(serialized) {
  return /reply-token-must-not-return|message-id-must-not-return|providerRaw|payloadJson|"rawPayload"\s*:|"rawSignature"\s*:|"authorization"\s*:|"cookie"\s*:|"accessToken"\s*:|"webhookSecret"\s*:|"providerSecret"\s*:|raw sender|raw room|"senderId"\s*:|"roomId"\s*:|safe-no-match-room-sprint75|safe-sender-sprint75|sha256=.*|line\.push|telegram\.send|facebook\.send|instagram\.send|outbound\.sent|outbound\.queued|openai|ai\.call|notification\.sent/i.test(serialized);
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
  console.log(`Sprint 75 smoke checks: ${results.length - failed.length}/${results.length} passed`);
  if (failed.length > 0) {
    console.error(`Failed checks: ${failed.map((result) => result.name).join(", ")}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
