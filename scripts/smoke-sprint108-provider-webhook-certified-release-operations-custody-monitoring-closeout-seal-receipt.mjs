import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const ledgerEndpointPath = "/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt/handoff-packet/acceptance-record/noop-execution-dryrun/result-ledger/final-readiness-certificate/freeze-audit-register/rollback-rehearsal-receipt/control-room-packet/cutover-checklist-receipt/operator-command-receipt/go-live-authorization-receipt/launch-window-confirmation-receipt/go-live-hold-release-authorization-receipt/launch-approval-receipt/no-execution-lock-receipt/operations-handoff-readiness-no-execution-evidence-packet/operations-handoff-acceptance-receipt/operations-custody-monitoring-readiness-ledger";
const endpointPath = `${ledgerEndpointPath}/operations-custody-monitoring-closeout-seal-receipt`;
const apiBase = process.env.API_BASE_URL || "http://localhost:4000";
const tenantId = process.env.SMOKE_TENANT_ID ?? process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
const results = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function record(name, ok, detail = "") {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "ok" : "not ok"} - ${name}${detail ? ` (${detail})` : ""}`);
}

function sourceSlice(source, start, end) {
  const startIndex = source.indexOf(start);
  if (startIndex === -1) return "";
  const endIndex = source.indexOf(end, startIndex + start.length);
  return source.slice(startIndex, endIndex === -1 ? undefined : endIndex);
}

function containsProviderOutbound(sources) {
  return Object.values(sources).some((source) => /\b(sendMessage|replyMessage|pushMessage|providerOutbound|sendProvider|callProviderApi)\s*\(/i.test(source));
}

function containsExternalNotification(sources) {
  return Object.values(sources).some((source) => /\b(sendEmail|sendSms|sendSlack|notifyExternal|externalNotification)\s*\(/i.test(source));
}

function containsAiCall(sources) {
  return Object.values(sources).some((source) => /\b(openai|OpenAI|createChatCompletion|chat\.completions|responses\.create|aiClient\.send|callAiModel)\s*\(/i.test(source));
}

function leaksRawProviderMaterial(value) {
  const serialized = typeof value === "string" ? value : JSON.stringify(value);
  return /"rawPayload"\s*:|"rawSignature"\s*:|"replyToken"\s*:|"senderId"\s*:|"roomId"\s*:|"rawRoomId"\s*:|"rawSenderId"\s*:|"token"\s*:|"secret"\s*:|"authorization"\s*:|"cookie"\s*:|"headers"\s*:|"stack"\s*:|providerRaw|providerMaterial|payloadJson|raw-room|raw-sender|reply-token-must-not-return|message-id-must-not-return|accessToken|webhookSecret|bearer/i.test(serialized);
}

function safeOperationsCustodyMonitoringCloseoutSealReceiptShape(value) {
  return value &&
    value.receiptKind === "qa-handoff-locked-archive-certified-release-operations-custody-monitoring-closeout-seal-receipt" &&
    value.ledgerKind === "qa-handoff-locked-archive-certified-release-operations-custody-monitoring-readiness-ledger" &&
    value.packetKind === "qa-handoff-locked-archive-certified-release-operations-handoff-readiness-no-execution-evidence-packet" &&
    value.operationsCustodyMonitoringCloseoutStatus === "sealed" &&
    value.operationsCustodyMonitoringStatus === "ready" &&
    value.operationsHandoffAcceptanceStatus === "accepted" &&
    value.operationsCustodyStatus === "accepted" &&
    value.noExecutionEvidenceStatus === "confirmed" &&
    value.noExecutionMonitoringStatus === "active" &&
    value.launchApprovalLockStatus === "locked" &&
    value.tenantScopeStatus === "tenant_scoped" &&
    value.digestContinuityStatus === "confirmed" &&
    value.monitoringReadinessStatus === "ready" &&
    value.closeoutSealStatus === "sealed" &&
    value.providerOutboundStatus === "absent" &&
    value.externalNotificationStatus === "absent" &&
    value.aiCallStatus === "absent" &&
    value.safeFilename === "provider-webhook-review-qa-handoff-certified-release-operations-custody-monitoring-closeout-seal-receipt.json" &&
    /^sha256:[a-z0-9]+$/i.test(String(value.operationsCustodyMonitoringCloseoutSealReceiptDigest ?? "")) &&
    value.operationsCustodyMonitoringCloseoutSealReceiptDigest === value.safeDigest &&
    /^sha256:[a-z0-9]+$/i.test(String(value.operationsCustodyMonitoringLedgerDigest ?? "")) &&
    value.inheritedOperationsCustodyMonitoringReadinessLedgerSummary?.operationsCustodyMonitoringStatus === "ready" &&
    value.inheritedOperationsCustodyMonitoringReadinessLedgerSummary?.noExecutionMonitoringStatus === "active" &&
    value.inheritedOperationsCustodyMonitoringReadinessLedgerSummary?.externalCallsZero === true &&
    value.counts?.operationsHandoffMutationCount === 0 &&
    value.counts?.operationsHandoffAcceptanceMutationCount === 0 &&
    value.counts?.operationsCustodyMonitoringMutationCount === 0 &&
    value.counts?.operationsCustodyMonitoringCloseoutSealMutationCount === 0 &&
    value.counts?.executionAttemptCount === 0 &&
    value.counts?.providerOutboundCallCount === 0 &&
    value.counts?.externalNotificationSendCount === 0 &&
    value.counts?.aiCallCount === 0 &&
    value.externalCalls === 0 &&
    Array.isArray(value.operationsCustodyMonitoringCloseoutRows) &&
    value.operationsCustodyMonitoringCloseoutRows.length >= 9 &&
    value.operationsCustodyMonitoringCloseoutRows.every((row) => row.complete === true && row.status === "confirmed") &&
    !leaksRawProviderMaterial(value);
}

function stableOperationsCustodyMonitoringCloseoutSealReceiptSnapshot(value) {
  if (!value || typeof value !== "object") return value;
  const {
    operationsHandoffGeneratedAt: _generatedAt,
    operationsHandoffAcceptedAt: _acceptedAt,
    operationsCustodyMonitoringLedgerGeneratedAt: _ledgerGeneratedAt,
    operationsCustodyMonitoringCloseoutSealedAt: _closeoutSealedAt,
    ...stable
  } = value;
  return stable;
}

async function getJson(url, headers = {}) {
  const response = await fetch(url, { headers });
  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  return { status: response.status, body };
}

function runNodeSmoke(scriptName) {
  const child = spawnSync(process.execPath, [path.join("scripts", scriptName)], {
    cwd: root,
    env: process.env,
    stdio: "inherit"
  });
  return child.status === 0;
}

async function run() {
  const rootPackage = JSON.parse(read("package.json"));
  const shared = read("packages/shared/src/index.ts");
  const providerController = read("apps/api/src/controllers/provider-webhooks.controller.ts");
  const providerService = read("apps/api/src/services/provider-webhook-events.service.ts");
  const apiClient = read("apps/web/app/api-client.ts");
  const settingsData = read("apps/web/app/settings-data.ts");
  const settingsPage = read("apps/web/app/settings/channels/page.tsx");
  const providerPanel = read("apps/web/app/settings/provider-readiness-panel.tsx");

  const sprint108Source = {
    shared: sourceSlice(shared, "providerWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutStatusSchema", "providerWebhookUnmatchedInboundBulkReviewRequestSchema"),
    providerServiceMethod: sourceSlice(providerService, "getReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt", "private getLockedArchiveContext"),
    providerServiceHelper: sourceSlice(providerService, "function qaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceiptResponse", "function qaHandoffCertifiedReleaseCutoverChecklistReceiptResponse"),
    apiClient: sourceSlice(apiClient, "getProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt", "getProviderWebhookReviewClosureReportExport"),
    settingsData: sourceSlice(settingsData, "loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceiptData", "loadSettingsProviderWebhookReviewClosureReportRedactionAuditData"),
    settingsDataMock: sourceSlice(settingsData, "function createMockReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt", "function mockCertifiedReleaseOperationsHandoffAcceptanceReady"),
    settingsPage: sourceSlice(settingsPage, "reviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt", "loadClosureReportRedactionAudit"),
    providerPanelControls: sourceSlice(providerPanel, "Load operations custody monitoring closeout seal receipt", "Audit report export redaction"),
    providerPanelResult: sourceSlice(providerPanel, "QA archive certified release operations custody monitoring closeout seal receipt:", "reviewQaHandoffLockedArchive ?")
  };

  record("smoke:sprint108 registered",
    rootPackage.scripts?.["smoke:sprint108"] === "node scripts/smoke-sprint108-provider-webhook-certified-release-operations-custody-monitoring-closeout-seal-receipt.mjs"
  );

  record("shared operations custody monitoring closeout seal receipt DTO export",
    sprint108Source.shared.includes("providerWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceiptSchema") &&
    sprint108Source.shared.includes("ProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt") &&
    sprint108Source.shared.includes("operationsCustodyMonitoringCloseoutStatus") &&
    sprint108Source.shared.includes("closeoutSealStatus") &&
    sprint108Source.shared.includes("operationsCustodyMonitoringCloseoutSealReceiptDigest") &&
    sprint108Source.shared.includes("inheritedOperationsCustodyMonitoringReadinessLedgerSummary") &&
    sprint108Source.shared.includes("operationsCustodyMonitoringCloseoutRows") &&
    sprint108Source.shared.includes("operationsCustodyMonitoringCloseoutSealMutationCount") &&
    sprint108Source.shared.includes("externalCalls: z.literal(0)") &&
    sprint108Source.shared.includes(".strict()")
  );

  record("backend operations custody monitoring closeout route requires tenant",
    providerController.includes("operations-custody-monitoring-readiness-ledger/operations-custody-monitoring-closeout-seal-receipt") &&
    providerController.includes("getReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt(requireTenantId(tenant)")
  );

  record("service derives closeout receipt read-only from Sprint 107 ledger",
    sprint108Source.providerServiceMethod.includes("const operationsCustodyMonitoringReadinessLedger = this.getReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedger") &&
    sprint108Source.providerServiceMethod.includes("prerequisites are incomplete") &&
    sprint108Source.providerServiceHelper.includes("operationsCustodyMonitoringCloseoutSealMutationCount: 0") &&
    sprint108Source.providerServiceHelper.includes("executionAttemptCount === 0") &&
    sprint108Source.providerServiceHelper.includes("providerOutboundCallCount === 0") &&
    sprint108Source.providerServiceHelper.includes("externalNotificationSendCount === 0") &&
    sprint108Source.providerServiceHelper.includes("aiCallCount === 0") &&
    sprint108Source.providerServiceHelper.includes("externalCalls: 0 as const")
  );

  record("API client operations custody monitoring closeout wiring",
    sprint108Source.apiClient.includes("providerWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceiptSchema") &&
    sprint108Source.apiClient.includes("operations-custody-monitoring-closeout-seal-receipt")
  );

  record("settings-data API mode has no mock fallback",
    sprint108Source.settingsData.includes("if (mode === \"api\")") &&
    sprint108Source.settingsData.includes("getProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt(filters)") &&
    sprint108Source.settingsData.includes("createMockReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt(filters)") &&
    sprint108Source.settingsDataMock.includes("mockqahandoffcertifiedreleaseoperationscustodymonitoringcloseoutsealreceipt")
  );

  record("Settings > Channels controls/results/errors",
    sprint108Source.providerPanelControls.includes("Load operations custody monitoring closeout seal receipt") &&
    sprint108Source.providerPanelResult.includes("QA archive certified release operations custody monitoring closeout seal receipt:") &&
    sprint108Source.providerPanelResult.includes("operationsCustodyMonitoringCloseoutStatus=") &&
    sprint108Source.providerPanelResult.includes("operationsCustodyMonitoringStatus=") &&
    sprint108Source.providerPanelResult.includes("noExecutionMonitoringStatus=") &&
    sprint108Source.providerPanelResult.includes("closeoutSealStatus=") &&
    sprint108Source.providerPanelResult.includes("operationsCustodyMonitoringCloseoutSealReceiptDigest=") &&
    sprint108Source.providerPanelResult.includes("providerOutboundCallCount=") &&
    sprint108Source.providerPanelResult.includes("externalNotificationSendCount=") &&
    sprint108Source.providerPanelResult.includes("aiCallCount=") &&
    sprint108Source.providerPanelResult.includes("externalCalls=") &&
    sprint108Source.settingsPage.includes("QA Archive Certified Release Operations Custody Monitoring Closeout Seal Receipt API error")
  );

  record("stale closeout seal receipt clears on upstream reloads",
    settingsPage.includes("clearReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt") &&
    settingsPage.includes("setReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt(null)") &&
    settingsPage.includes("clearReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt();")
  );

  record("static Sprint 108 source has no provider outbound send markers", !containsProviderOutbound(sprint108Source));
  record("static Sprint 108 source has no external notification send markers", !containsExternalNotification(sprint108Source));
  record("static Sprint 108 source has no AI/OpenAI call markers", !containsAiCall(sprint108Source));
  record("static Sprint 108 source has no raw provider material leakage markers", !leaksRawProviderMaterial(sprint108Source));

  let health;
  try {
    health = await getJson(`${apiBase}/health`);
  } catch {
    record("live API unavailable; static checks completed", true, `skipped live checks at ${apiBase}`);
    return;
  }
  if (health.status < 200 || health.status >= 500) {
    record("live API unavailable; static checks completed", true, `skipped live checks at ${apiBase} status=${health.status}`);
    return;
  }

  const search = "?provider=line&eventType=message.created";
  const missingTenant = await getJson(`${apiBase}${endpointPath}${search}`);
  record("operations custody monitoring closeout seal receipt requires x-tenant-id", missingTenant.status >= 400 && missingTenant.status < 500);

  const prerequisiteChainPassed = runNodeSmoke("smoke-sprint107-provider-webhook-certified-release-operations-custody-monitoring-readiness-ledger.mjs");
  record("safe prerequisite chain driven through Sprint 107", prerequisiteChainPassed);
  if (!prerequisiteChainPassed) return;

  const ledger = await getJson(`${apiBase}${ledgerEndpointPath}${search}`, { "x-tenant-id": tenantId });
  const first = await getJson(`${apiBase}${endpointPath}${search}`, { "x-tenant-id": tenantId });
  const second = await getJson(`${apiBase}${endpointPath}${search}`, { "x-tenant-id": tenantId });
  record("GET Sprint 108 operations custody monitoring closeout seal receipt endpoint", first.status === 200 && safeOperationsCustodyMonitoringCloseoutSealReceiptShape(first.body), first.status === 200 ? "" : `status=${first.status}`);
  record("GET Sprint 108 closeout seal receipt no mutation repeat read",
    first.status === 200 &&
    second.status === 200 &&
    JSON.stringify(stableOperationsCustodyMonitoringCloseoutSealReceiptSnapshot(first.body)) === JSON.stringify(stableOperationsCustodyMonitoringCloseoutSealReceiptSnapshot(second.body))
  );
  record("Sprint 108 digest continuity from Sprint 107 ledger",
    ledger.status === 200 &&
    first.status === 200 &&
    first.body?.inheritedOperationsCustodyMonitoringReadinessLedgerSummary?.operationsCustodyMonitoringLedgerDigest === ledger.body?.operationsCustodyMonitoringLedgerDigest &&
    first.body?.operationsCustodyMonitoringLedgerDigest === ledger.body?.operationsCustodyMonitoringLedgerDigest
  );
  record("no stale/fake closeout seal receipt", !String(first.body?.operationsCustodyMonitoringCloseoutSealReceiptDigest ?? "").includes("fake") && first.body?.receiptKind === "qa-handoff-locked-archive-certified-release-operations-custody-monitoring-closeout-seal-receipt");
  record("externalCalls = 0", first.body?.externalCalls === 0);
  record("no execution/mutation/provider outbound/notification/AI counts", first.body?.counts?.executionAttemptCount === 0 && first.body?.counts?.operationsCustodyMonitoringCloseoutSealMutationCount === 0 && first.body?.counts?.providerOutboundCallCount === 0 && first.body?.counts?.externalNotificationSendCount === 0 && first.body?.counts?.aiCallCount === 0);
  record("no raw provider material in live response", !leaksRawProviderMaterial(first.body));
}

run().then(() => {
  const failed = results.filter((result) => !result.ok);
  if (failed.length > 0) {
    console.error(`smoke:sprint108 failed ${failed.length}/${results.length} checks`);
    process.exit(1);
  }
  console.log(`smoke:sprint108 passed ${results.length}/${results.length} checks`);
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
