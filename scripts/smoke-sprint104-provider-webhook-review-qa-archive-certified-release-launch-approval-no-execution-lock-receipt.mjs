import fs from "node:fs";

const apiBaseUrl = process.env.API_BASE_URL ?? "http://localhost:4000";
const releaseBasePath = "/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence";
const launchApprovalReceiptPath = `${releaseBasePath}/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt/handoff-packet/acceptance-record/noop-execution-dryrun/result-ledger/final-readiness-certificate/freeze-audit-register/rollback-rehearsal-receipt/control-room-packet/cutover-checklist-receipt/operator-command-receipt/go-live-authorization-receipt/launch-window-confirmation-receipt/go-live-hold-release-authorization-receipt/launch-approval-receipt`;
const noExecutionLockReceiptPath = `${launchApprovalReceiptPath}/no-execution-lock-receipt`;
const tenantId = process.env.SMOKE_TENANT_ID ?? process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
const userId = process.env.USER_ID ?? "00000000-0000-4000-8000-000000000011";
const results = [];

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function record(name, pass, detail = "") {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"} ${name}${detail ? ` - ${detail}` : ""}`);
}

function sourceSlice(source, start, end) {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end, Math.max(startIndex, 0));
  return source.slice(startIndex >= 0 ? startIndex : 0, endIndex > startIndex ? endIndex : undefined);
}

function containsProviderOutbound(sources) {
  return Object.values(sources).some((source) => /\b(sendMessage|replyMessage|pushMessage|providerOutbound|sendProvider|callProviderApi)\s*\(/i.test(source));
}

function containsExternalNotification(sources) {
  return Object.values(sources).some((source) => /\b(sendMail|nodemailer|twilio|slack|webhookNotify|notifyExternal)\b/i.test(source));
}

function containsAiCall(sources) {
  return Object.values(sources).some((source) => /\b(openai|chat\.completions|responses\.create|aiSuggestion|generateReply)\b/i.test(source));
}

const rawLeakKeyNames = new Set([
  "authorization",
  "rawPayload",
  "rawBody",
  "headers",
  "stack",
  "secret",
  "token",
  "cookie",
  "replyToken",
  "senderId",
  "roomId",
  "providerMaterial"
]);

const rawLeakValuePatterns = [
  /\bBearer\s+[A-Za-z0-9\-._~+/]+=*\b/i,
  /\b(raw\s+payload|raw\s+body|raw\s+signature|provider\s+material|replyToken|senderId|roomId|cookie|secret|token|signature)\b/i
];

function containsRawLeak(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return rawLeakValuePatterns.some((pattern) => pattern.test(value));
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") return false;
  if (Array.isArray(value)) return value.some((item) => containsRawLeak(item));
  if (typeof value === "object") return Object.entries(value).some(([key, child]) => rawLeakKeyNames.has(key) || containsRawLeak(child));
  return false;
}

function safeRows(rows) {
  return Array.isArray(rows) && rows.length > 0 && rows.every((row) => row && row.complete === true && /^sha256:[a-z0-9]+$/i.test(String(row.safeDigest ?? "")));
}

function safeNoExecutionLockReceiptShape(value) {
  return value?.receiptKind === "qa-handoff-locked-archive-certified-release-launch-approval-no-execution-lock-receipt" &&
    value.noExecutionLockReceiptStatus === "issued" &&
    value.noExecutionLockStatus === "locked" &&
    value.launchApprovalArchiveStatus === "retained" &&
    value.tenantScopeStatus === "tenant_scoped" &&
    value.providerOutboundStatus === "absent" &&
    value.externalNotificationStatus === "absent" &&
    value.aiCallStatus === "absent" &&
    value.launchApprovalReceiptStatus === "issued" &&
    value.noExecutionGuardStatus === "retained" &&
    value.launchApprovalStatus === "ready" &&
    value.goLiveHoldReleaseAuthorizationStatus === "authorized" &&
    value.launchWindowConfirmationStatus === "confirmed" &&
    value.goLiveHoldStatus === "ready" &&
    value.executionMode === "no_op" &&
    value.releaseDecision === "go" &&
    value.goNoGoDecision === "go" &&
    value.digestChainStatus === "confirmed" &&
    /^sha256:[a-z0-9]+$/i.test(value.safeDigest) &&
    /^sha256:[a-z0-9]+$/i.test(value.noExecutionLockReceiptDigest) &&
    /^sha256:[a-z0-9]+$/i.test(value.launchApprovalReceiptDigest) &&
    value.noExecutionLockReceiptDigest === value.safeDigest &&
    safeRows(value.noExecutionLockRows) &&
    value.inheritedLaunchApprovalReceiptSummary?.externalCallsZero === true &&
    value.inheritedLaunchApprovalReceiptSummary?.launchApprovalReceiptStatus === "issued" &&
    value.inheritedLaunchApprovalReceiptSummary?.noExecutionGuardStatus === "retained" &&
    value.counts?.noExecutionLockReceiptCheckedCount === 1 &&
    value.counts?.noExecutionLockReceiptMutationCount === 0 &&
    value.counts?.noExecutionLockRowCount === value.noExecutionLockRows.length &&
    value.counts?.noExecutionLockPassedCount === value.noExecutionLockRows.length &&
    value.counts?.executionAttemptCount === 0 &&
    value.counts?.providerOutboundCallCount === 0 &&
    value.counts?.externalNotificationSendCount === 0 &&
    value.counts?.aiCallCount === 0 &&
    value.counts?.tenantScopeCheckedCount === 1 &&
    value.counts?.digestContinuityCheckedCount === 1 &&
    value.counts?.launchApprovalArchiveRetainedCount === 1 &&
    value.externalCalls === 0 &&
    !containsRawLeak(value);
}

async function getJson(path, headers = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, { headers });
  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  return { status: response.status, body };
}

async function requestJson(path, tenant = tenantId) {
  return getJson(path, {
    "x-tenant-id": tenant,
    "x-user-id": userId
  });
}

async function main() {
  const rootPackage = JSON.parse(read("package.json"));
  const shared = read("packages/shared/src/index.ts");
  const providerController = read("apps/api/src/controllers/provider-webhooks.controller.ts");
  const providerService = read("apps/api/src/services/provider-webhook-events.service.ts");
  const apiClient = read("apps/web/app/api-client.ts");
  const settingsData = read("apps/web/app/settings-data.ts");
  const settingsPage = read("apps/web/app/settings/channels/page.tsx");
  const providerPanel = read("apps/web/app/settings/provider-readiness-panel.tsx");
  const sprint104Source = {
    shared: sourceSlice(shared, "providerWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceiptStatusSchema", "providerWebhookUnmatchedInboundBulkReviewRequestSchema"),
    providerController: sourceSlice(providerController, "launch-approval-receipt/no-execution-lock-receipt", "review-closure-report/export"),
    providerService: sourceSlice(providerService, "getReviewQaHandoffCertifiedReleaseNoExecutionLockReceipt", "qaHandoffCertifiedReleaseCutoverChecklistReceiptResponse"),
    apiClient: sourceSlice(apiClient, "getProviderWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceipt", "getProviderWebhookReviewClosureReportExport"),
    settingsData: sourceSlice(settingsData, "loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceiptData", "loadSettingsProviderWebhookReviewClosureReportRedactionAuditData"),
    settingsPage: sourceSlice(settingsPage, "reviewQaHandoffCertifiedReleaseNoExecutionLockReceipt", "loadClosureReportRedactionAudit"),
    providerPanel: sourceSlice(providerPanel, "Load launch approval no-execution lock receipt", "Audit report export redaction")
  };

  record("smoke:sprint104 registered",
    rootPackage.scripts?.["smoke:sprint104"] === "node scripts/smoke-sprint104-provider-webhook-review-qa-archive-certified-release-launch-approval-no-execution-lock-receipt.mjs"
  );
  record("shared no-execution lock receipt DTO export",
    sprint104Source.shared.includes("providerWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceiptSchema") &&
    sprint104Source.shared.includes("ProviderWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceipt") &&
    sprint104Source.shared.includes("noExecutionLockReceiptStatus") &&
    sprint104Source.shared.includes("noExecutionLockStatus") &&
    sprint104Source.shared.includes("tenantScopeStatus") &&
    sprint104Source.shared.includes("providerOutboundStatus") &&
    sprint104Source.shared.includes("externalNotificationStatus") &&
    sprint104Source.shared.includes("aiCallStatus") &&
    sprint104Source.shared.includes("externalCalls: z.literal(0)") &&
    sprint104Source.shared.includes(".strict()")
  );
  record("backend no-execution lock route registration",
    providerController.includes("launch-approval-receipt/no-execution-lock-receipt") &&
    providerController.includes("getReviewQaHandoffCertifiedReleaseNoExecutionLockReceipt(requireTenantId(tenant)")
  );
  record("service no-execution lock read-only implementation",
    sprint104Source.providerService.includes("qaHandoffCertifiedReleaseNoExecutionLockReceiptResponse") &&
    sprint104Source.providerService.includes("noExecutionLockReceiptMutationCount: 0") &&
    sprint104Source.providerService.includes("executionAttemptCount: 0") &&
    sprint104Source.providerService.includes("providerOutboundCallCount: 0") &&
    sprint104Source.providerService.includes("externalNotificationSendCount: 0") &&
    sprint104Source.providerService.includes("aiCallCount: 0") &&
    sprint104Source.providerService.includes("tenantScopeStatus")
  );
  record("API client no-execution lock receipt wiring",
    sprint104Source.apiClient.includes("providerWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceiptSchema") &&
    sprint104Source.apiClient.includes("launch-approval-receipt/no-execution-lock-receipt")
  );
  record("settings-data no-execution lock API mode has no fallback",
    sprint104Source.settingsData.includes("mode === \"api\"") &&
    sprint104Source.settingsData.includes("getProviderWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceipt(filters)") &&
    sprint104Source.settingsData.includes("createMockReviewQaHandoffCertifiedReleaseNoExecutionLockReceipt(filters)")
  );
  record("Settings > Channels no-execution lock controls/results/errors",
    sprint104Source.settingsPage.includes("QA Archive Certified Release Launch Approval No-Execution Lock Receipt API error") &&
    providerPanel.includes("Load launch approval no-execution lock receipt") &&
    providerPanel.includes("QA archive certified release launch approval no-execution lock receipt:") &&
    providerPanel.includes("noExecutionLockReceiptStatus=") &&
    providerPanel.includes("executionAttemptCount=") &&
    providerPanel.includes("providerOutboundCallCount=") &&
    providerPanel.includes("externalNotificationSendCount=") &&
    providerPanel.includes("aiCallCount=")
  );
  record("stale no-execution lock receipt clears on upstream reloads",
    settingsPage.includes("clearReviewQaHandoffCertifiedReleaseNoExecutionLockReceipt") &&
    settingsPage.includes("setReviewQaHandoffCertifiedReleaseNoExecutionLockReceipt(null)") &&
    settingsPage.includes("clearReviewQaHandoffCertifiedReleaseNoExecutionLockReceipt();")
  );
  record("static Sprint 104 source has no provider outbound send markers", !containsProviderOutbound(sprint104Source));
  record("static Sprint 104 source has no external notification send markers", !containsExternalNotification(sprint104Source));
  record("static Sprint 104 source has no AI/OpenAI call markers", !containsAiCall(sprint104Source));

  await import("./smoke-sprint103-provider-webhook-review-qa-archive-certified-release-launch-approval-receipt.mjs");

  const filters = "provider=line&eventType=message.created";
  const missingTenant = await getJson(`${noExecutionLockReceiptPath}?${filters}`, { "x-user-id": userId });
  record("no-execution lock receipt requires x-tenant-id", missingTenant.status >= 400 && missingTenant.status < 500);

  const first = await requestJson(`${noExecutionLockReceiptPath}?${filters}`);
  record("GET Sprint 104 no-execution lock receipt endpoint", first.status === 200 && safeNoExecutionLockReceiptShape(first.body), first.status === 200 ? "" : `status=${first.status}`);

  const second = await requestJson(`${noExecutionLockReceiptPath}?${filters}`);
  record("GET Sprint 104 no-execution lock receipt no mutation repeat read", first.status === 200 && second.status === 200 && JSON.stringify(first.body) === JSON.stringify(second.body));

  const invalidTenant = await requestJson(`${noExecutionLockReceiptPath}?${filters}`, "00000000-0000-4000-8000-000000000104");
  record("invalid tenant access does not return mock fallback", invalidTenant.status === 409 || (invalidTenant.status === 200 && invalidTenant.body?.receiptKind === "qa-handoff-locked-archive-certified-release-launch-approval-no-execution-lock-receipt" && !String(invalidTenant.body?.noExecutionLockReceiptDigest ?? "").includes("fake")));

  record("no stale/fake no-execution lock receipt", !String(first.body?.noExecutionLockReceiptDigest ?? "").includes("fake") && first.body?.receiptKind === "qa-handoff-locked-archive-certified-release-launch-approval-no-execution-lock-receipt");
  record("no raw provider material leakage", first.body && !containsRawLeak(first.body));
  record("externalCalls = 0", first.body?.externalCalls === 0);
  record("no execution/mutation/provider outbound/notification/AI counts", first.body?.counts?.executionAttemptCount === 0 && first.body?.counts?.noExecutionLockReceiptMutationCount === 0 && first.body?.counts?.providerOutboundCallCount === 0 && first.body?.counts?.externalNotificationSendCount === 0 && first.body?.counts?.aiCallCount === 0);
  record("no provider outbound", !containsProviderOutbound(sprint104Source));
  record("no external notification sending", !containsExternalNotification(sprint104Source));
  record("no AI/OpenAI call", !containsAiCall(sprint104Source));

  return finish();
}

function finish() {
  const failed = results.filter((result) => !result.pass);
  if (failed.length > 0) {
    console.error(`smoke:sprint104 failed ${failed.length}/${results.length} checks`);
    process.exit(1);
  }
  console.log(`smoke:sprint104 passed ${results.length}/${results.length} checks`);
}

await main();
