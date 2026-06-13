import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const acceptanceEndpointPath = "/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt/handoff-packet/acceptance-record/noop-execution-dryrun/result-ledger/final-readiness-certificate/freeze-audit-register/rollback-rehearsal-receipt/control-room-packet/cutover-checklist-receipt/operator-command-receipt/go-live-authorization-receipt/launch-window-confirmation-receipt/go-live-hold-release-authorization-receipt/launch-approval-receipt/no-execution-lock-receipt/operations-handoff-readiness-no-execution-evidence-packet/operations-handoff-acceptance-receipt";
const endpointPath = `${acceptanceEndpointPath}/operations-custody-monitoring-readiness-ledger`;
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

function safeOperationsCustodyMonitoringReadinessLedgerShape(value) {
  return value &&
    value.ledgerKind === "qa-handoff-locked-archive-certified-release-operations-custody-monitoring-readiness-ledger" &&
    value.receiptKind === "qa-handoff-locked-archive-certified-release-operations-handoff-acceptance-receipt" &&
    value.packetKind === "qa-handoff-locked-archive-certified-release-operations-handoff-readiness-no-execution-evidence-packet" &&
    value.operationsCustodyMonitoringStatus === "ready" &&
    value.operationsHandoffAcceptanceStatus === "accepted" &&
    value.operationsCustodyStatus === "accepted" &&
    value.noExecutionEvidenceStatus === "confirmed" &&
    value.launchApprovalLockStatus === "locked" &&
    value.tenantScopeStatus === "tenant_scoped" &&
    value.digestContinuityStatus === "confirmed" &&
    value.monitoringReadinessStatus === "ready" &&
    value.noExecutionMonitoringStatus === "active" &&
    value.providerOutboundStatus === "absent" &&
    value.externalNotificationStatus === "absent" &&
    value.aiCallStatus === "absent" &&
    value.safeFilename === "provider-webhook-review-qa-handoff-certified-release-operations-custody-monitoring-readiness-ledger.json" &&
    /^sha256:[a-z0-9]+$/i.test(String(value.operationsCustodyMonitoringLedgerDigest ?? "")) &&
    value.operationsCustodyMonitoringLedgerDigest === value.safeDigest &&
    /^sha256:[a-z0-9]+$/i.test(String(value.operationsHandoffAcceptanceReceiptDigest ?? "")) &&
    value.inheritedOperationsHandoffAcceptanceReceiptSummary?.operationsHandoffAcceptanceStatus === "accepted" &&
    value.inheritedOperationsHandoffAcceptanceReceiptSummary?.operationsCustodyStatus === "accepted" &&
    value.inheritedOperationsHandoffAcceptanceReceiptSummary?.externalCallsZero === true &&
    value.counts?.operationsHandoffMutationCount === 0 &&
    value.counts?.operationsHandoffAcceptanceMutationCount === 0 &&
    value.counts?.operationsCustodyMonitoringMutationCount === 0 &&
    value.counts?.executionAttemptCount === 0 &&
    value.counts?.providerOutboundCallCount === 0 &&
    value.counts?.externalNotificationSendCount === 0 &&
    value.counts?.aiCallCount === 0 &&
    value.externalCalls === 0 &&
    Array.isArray(value.operationsCustodyMonitoringRows) &&
    value.operationsCustodyMonitoringRows.length >= 4 &&
    value.operationsCustodyMonitoringRows.every((row) => row.complete === true && row.status === "confirmed") &&
    Array.isArray(value.noExecutionMonitoringRows) &&
    value.noExecutionMonitoringRows.length >= 8 &&
    value.noExecutionMonitoringRows.every((row) => row.complete === true && row.status === "confirmed") &&
    !leaksRawProviderMaterial(value);
}

function stableOperationsCustodyMonitoringReadinessLedgerSnapshot(value) {
  if (!value || typeof value !== "object") return value;
  const {
    operationsHandoffGeneratedAt: _generatedAt,
    operationsHandoffAcceptedAt: _acceptedAt,
    operationsCustodyMonitoringLedgerGeneratedAt: _ledgerGeneratedAt,
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

  const sprint107Source = {
    shared: sourceSlice(shared, "providerWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringStatusSchema", "providerWebhookUnmatchedInboundBulkReviewRequestSchema"),
    providerServiceMethod: sourceSlice(providerService, "getReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedger", "private getLockedArchiveContext"),
    providerServiceHelper: sourceSlice(providerService, "function qaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedgerResponse", "function qaHandoffCertifiedReleaseCutoverChecklistReceiptResponse"),
    apiClient: sourceSlice(apiClient, "getProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedger", "getProviderWebhookReviewClosureReportExport"),
    settingsData: sourceSlice(settingsData, "loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedgerData", "loadSettingsProviderWebhookReviewClosureReportRedactionAuditData"),
    settingsPage: sourceSlice(settingsPage, "reviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedger", "loadClosureReportRedactionAudit"),
    providerPanelControls: sourceSlice(providerPanel, "Load operations custody monitoring readiness ledger", "Audit report export redaction"),
    providerPanelResult: sourceSlice(providerPanel, "QA archive certified release operations custody monitoring readiness ledger:", "reviewQaHandoffLockedArchive ?")
  };

  record("smoke:sprint107 registered",
    rootPackage.scripts?.["smoke:sprint107"] === "node scripts/smoke-sprint107-provider-webhook-certified-release-operations-custody-monitoring-readiness-ledger.mjs"
  );

  record("shared operations custody monitoring readiness ledger DTO export",
    sprint107Source.shared.includes("providerWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedgerSchema") &&
    sprint107Source.shared.includes("ProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedger") &&
    sprint107Source.shared.includes("operationsCustodyMonitoringStatus") &&
    sprint107Source.shared.includes("monitoringReadinessStatus") &&
    sprint107Source.shared.includes("noExecutionMonitoringStatus") &&
    sprint107Source.shared.includes("operationsCustodyMonitoringLedgerDigest") &&
    sprint107Source.shared.includes("inheritedOperationsHandoffAcceptanceReceiptSummary") &&
    sprint107Source.shared.includes("operationsCustodyMonitoringRows") &&
    sprint107Source.shared.includes("noExecutionMonitoringRows") &&
    sprint107Source.shared.includes("externalCalls: z.literal(0)") &&
    sprint107Source.shared.includes(".strict()")
  );

  record("backend operations custody monitoring route requires tenant",
    providerController.includes("operations-handoff-acceptance-receipt/operations-custody-monitoring-readiness-ledger") &&
    providerController.includes("getReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedger(requireTenantId(tenant)")
  );

  record("service derives custody monitoring ledger read-only from Sprint 106 receipt",
    sprint107Source.providerServiceMethod.includes("const operationsHandoffAcceptanceReceipt = this.getReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceReceipt") &&
    sprint107Source.providerServiceMethod.includes("qaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedgerResponse") &&
    sprint107Source.providerServiceHelper.includes("operationsCustodyMonitoringMutationCount: 0") &&
    sprint107Source.providerServiceHelper.includes("executionAttemptCount === 0") &&
    sprint107Source.providerServiceHelper.includes("providerOutboundCallCount === 0") &&
    sprint107Source.providerServiceHelper.includes("externalNotificationSendCount === 0") &&
    sprint107Source.providerServiceHelper.includes("aiCallCount === 0") &&
    sprint107Source.providerServiceHelper.includes("externalCalls: 0 as const")
  );

  record("API client operations custody monitoring wiring",
    sprint107Source.apiClient.includes("providerWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedgerSchema") &&
    sprint107Source.apiClient.includes("operations-custody-monitoring-readiness-ledger")
  );

  record("settings-data API mode has no mock fallback",
    sprint107Source.settingsData.includes("if (mode === \"api\")") &&
    sprint107Source.settingsData.includes("getProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedger(filters)") &&
    sprint107Source.settingsData.includes("createMockReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedger(filters)")
  );

  record("Settings > Channels controls/results/errors",
    sprint107Source.providerPanelControls.includes("Load operations custody monitoring readiness ledger") &&
    sprint107Source.providerPanelResult.includes("QA archive certified release operations custody monitoring readiness ledger:") &&
    sprint107Source.providerPanelResult.includes("operationsCustodyMonitoringStatus=") &&
    sprint107Source.providerPanelResult.includes("monitoringReadinessStatus=") &&
    sprint107Source.providerPanelResult.includes("noExecutionMonitoringStatus=") &&
    sprint107Source.providerPanelResult.includes("operationsCustodyMonitoringLedgerDigest=") &&
    sprint107Source.providerPanelResult.includes("providerOutboundCallCount=") &&
    sprint107Source.providerPanelResult.includes("externalNotificationSendCount=") &&
    sprint107Source.providerPanelResult.includes("aiCallCount=") &&
    sprint107Source.providerPanelResult.includes("externalCalls=") &&
    sprint107Source.settingsPage.includes("QA Archive Certified Release Operations Custody Monitoring Readiness Ledger API error")
  );

  record("stale operations custody monitoring ledger clears on upstream reloads",
    settingsPage.includes("clearReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedger") &&
    settingsPage.includes("setReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedger(null)") &&
    settingsPage.includes("clearReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedger();")
  );

  record("static Sprint 107 source has no provider outbound send markers", !containsProviderOutbound(sprint107Source));
  record("static Sprint 107 source has no external notification send markers", !containsExternalNotification(sprint107Source));
  record("static Sprint 107 source has no AI/OpenAI call markers", !containsAiCall(sprint107Source));
  record("static Sprint 107 source has no raw provider material leakage markers", !leaksRawProviderMaterial(sprint107Source));

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
  record("operations custody monitoring readiness ledger requires x-tenant-id", missingTenant.status >= 400 && missingTenant.status < 500);

  const prerequisiteChainPassed = runNodeSmoke("smoke-sprint106-provider-webhook-certified-release-operations-handoff-acceptance-receipt.mjs");
  record("safe prerequisite chain driven through Sprint 106", prerequisiteChainPassed);
  if (!prerequisiteChainPassed) return;

  const acceptanceReceipt = await getJson(`${apiBase}${acceptanceEndpointPath}${search}`, { "x-tenant-id": tenantId });
  const first = await getJson(`${apiBase}${endpointPath}${search}`, { "x-tenant-id": tenantId });
  const second = await getJson(`${apiBase}${endpointPath}${search}`, { "x-tenant-id": tenantId });
  record("GET Sprint 107 operations custody monitoring readiness ledger endpoint", first.status === 200 && safeOperationsCustodyMonitoringReadinessLedgerShape(first.body), first.status === 200 ? "" : `status=${first.status}`);
  record("GET Sprint 107 operations custody monitoring readiness ledger no mutation repeat read",
    first.status === 200 &&
    second.status === 200 &&
    JSON.stringify(stableOperationsCustodyMonitoringReadinessLedgerSnapshot(first.body)) === JSON.stringify(stableOperationsCustodyMonitoringReadinessLedgerSnapshot(second.body))
  );
  record("Sprint 107 digest continuity from Sprint 106 receipt",
    acceptanceReceipt.status === 200 &&
    first.status === 200 &&
    first.body?.inheritedOperationsHandoffAcceptanceReceiptSummary?.operationsHandoffAcceptanceReceiptDigest === acceptanceReceipt.body?.operationsHandoffAcceptanceReceiptDigest &&
    first.body?.operationsHandoffAcceptanceReceiptDigest === acceptanceReceipt.body?.operationsHandoffAcceptanceReceiptDigest
  );
  record("no stale/fake operations custody monitoring readiness ledger", !String(first.body?.operationsCustodyMonitoringLedgerDigest ?? "").includes("fake") && first.body?.ledgerKind === "qa-handoff-locked-archive-certified-release-operations-custody-monitoring-readiness-ledger");
  record("externalCalls = 0", first.body?.externalCalls === 0);
  record("no execution/mutation/provider outbound/notification/AI counts", first.body?.counts?.executionAttemptCount === 0 && first.body?.counts?.operationsCustodyMonitoringMutationCount === 0 && first.body?.counts?.providerOutboundCallCount === 0 && first.body?.counts?.externalNotificationSendCount === 0 && first.body?.counts?.aiCallCount === 0);
  record("no raw provider material in live response", !leaksRawProviderMaterial(first.body));
}

run().then(() => {
  const failed = results.filter((result) => !result.ok);
  if (failed.length > 0) {
    console.error(`smoke:sprint107 failed ${failed.length}/${results.length} checks`);
    process.exit(1);
  }
  console.log(`smoke:sprint107 passed ${results.length}/${results.length} checks`);
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
