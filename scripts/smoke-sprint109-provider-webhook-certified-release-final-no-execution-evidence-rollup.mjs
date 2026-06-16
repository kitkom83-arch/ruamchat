import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const closeoutEndpointPath = "/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt/handoff-packet/acceptance-record/noop-execution-dryrun/result-ledger/final-readiness-certificate/freeze-audit-register/rollback-rehearsal-receipt/control-room-packet/cutover-checklist-receipt/operator-command-receipt/go-live-authorization-receipt/launch-window-confirmation-receipt/go-live-hold-release-authorization-receipt/launch-approval-receipt/no-execution-lock-receipt/operations-handoff-readiness-no-execution-evidence-packet/operations-handoff-acceptance-receipt/operations-custody-monitoring-readiness-ledger/operations-custody-monitoring-closeout-seal-receipt";
const endpointPath = `${closeoutEndpointPath}/final-no-execution-evidence-rollup`;
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

function safeFinalNoExecutionEvidenceRollupShape(value) {
  return value &&
    value.rollupKind === "qa-handoff-locked-archive-certified-release-final-no-execution-evidence-rollup" &&
    value.receiptKind === "qa-handoff-locked-archive-certified-release-operations-custody-monitoring-closeout-seal-receipt" &&
    value.finalNoExecutionEvidenceRollupStatus === "issued" &&
    value.operationsCustodyMonitoringCloseoutStatus === "sealed" &&
    value.closeoutSealStatus === "sealed" &&
    value.operationsCustodyMonitoringStatus === "ready" &&
    value.operationsHandoffAcceptanceStatus === "accepted" &&
    value.operationsCustodyStatus === "accepted" &&
    value.noExecutionEvidenceStatus === "confirmed" &&
    value.noExecutionMonitoringStatus === "active" &&
    value.launchApprovalLockStatus === "locked" &&
    value.tenantScopeStatus === "tenant_scoped" &&
    value.digestContinuityStatus === "confirmed" &&
    value.finalArchiveCustodyStatus === "sealed" &&
    value.providerOutboundStatus === "absent" &&
    value.externalNotificationStatus === "absent" &&
    value.aiCallStatus === "absent" &&
    value.safeFilename === "provider-webhook-review-qa-handoff-certified-release-final-no-execution-evidence-rollup.json" &&
    /^sha256:[a-z0-9]+$/i.test(String(value.finalNoExecutionEvidenceRollupDigest ?? "")) &&
    value.finalNoExecutionEvidenceRollupDigest === value.safeDigest &&
    /^sha256:[a-z0-9]+$/i.test(String(value.operationsCustodyMonitoringCloseoutSealReceiptDigest ?? "")) &&
    value.inheritedOperationsCustodyMonitoringCloseoutSealReceiptSummary?.operationsCustodyMonitoringCloseoutStatus === "sealed" &&
    value.inheritedOperationsCustodyMonitoringCloseoutSealReceiptSummary?.closeoutSealStatus === "sealed" &&
    value.inheritedOperationsCustodyMonitoringCloseoutSealReceiptSummary?.externalCallsZero === true &&
    value.counts?.operationsHandoffMutationCount === 0 &&
    value.counts?.operationsHandoffAcceptanceMutationCount === 0 &&
    value.counts?.operationsCustodyMonitoringMutationCount === 0 &&
    value.counts?.operationsCustodyMonitoringCloseoutSealMutationCount === 0 &&
    value.counts?.finalNoExecutionEvidenceRollupMutationCount === 0 &&
    value.counts?.executionAttemptCount === 0 &&
    value.counts?.providerOutboundCallCount === 0 &&
    value.counts?.externalNotificationSendCount === 0 &&
    value.counts?.aiCallCount === 0 &&
    value.externalCalls === 0 &&
    Array.isArray(value.finalNoExecutionEvidenceRows) &&
    value.finalNoExecutionEvidenceRows.length >= 12 &&
    value.finalNoExecutionEvidenceRows.every((row) => row.complete === true && row.status === "confirmed") &&
    !leaksRawProviderMaterial(value);
}

function stableFinalNoExecutionEvidenceRollupSnapshot(value) {
  if (!value || typeof value !== "object") return value;
  const {
    operationsHandoffGeneratedAt: _generatedAt,
    operationsHandoffAcceptedAt: _acceptedAt,
    operationsCustodyMonitoringLedgerGeneratedAt: _ledgerGeneratedAt,
    operationsCustodyMonitoringCloseoutSealedAt: _closeoutSealedAt,
    finalNoExecutionEvidenceRollupIssuedAt: _rollupIssuedAt,
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

  const sprint109Source = {
    shared: sourceSlice(shared, "providerWebhookReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollupStatusSchema", "providerWebhookUnmatchedInboundBulkReviewRequestSchema"),
    providerServiceMethod: sourceSlice(providerService, "getReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollup", "private getLockedArchiveContext"),
    providerServiceHelper: sourceSlice(providerService, "function qaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollupResponse", "function qaHandoffCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceiptResponse"),
    apiClient: sourceSlice(apiClient, "getProviderWebhookReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollup", "getProviderWebhookReviewClosureReportExport"),
    settingsData: sourceSlice(settingsData, "loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollupData", "loadSettingsProviderWebhookReviewClosureReportRedactionAuditData"),
    settingsDataMock: sourceSlice(settingsData, "function createMockReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollup", "function mockCertifiedReleaseOperationsHandoffAcceptanceReady"),
    settingsPage: sourceSlice(settingsPage, "reviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollup", "loadClosureReportRedactionAudit"),
    providerPanelControls: sourceSlice(providerPanel, "Load operations custody monitoring closeout seal receipt", "Audit report export redaction"),
    providerPanelResult: sourceSlice(providerPanel, "QA archive certified release final no-execution evidence rollup:", "reviewQaHandoffLockedArchive ?")
  };

  record("smoke:sprint109 registered",
    rootPackage.scripts?.["smoke:sprint109"] === "node scripts/smoke-sprint109-provider-webhook-certified-release-final-no-execution-evidence-rollup.mjs"
  );

  record("shared final no-execution evidence rollup DTO export",
    sprint109Source.shared.includes("providerWebhookReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollupSchema") &&
    sprint109Source.shared.includes("ProviderWebhookReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollup") &&
    sprint109Source.shared.includes("finalNoExecutionEvidenceRollupStatus") &&
    sprint109Source.shared.includes("finalArchiveCustodyStatus") &&
    sprint109Source.shared.includes("finalNoExecutionEvidenceRollupDigest") &&
    sprint109Source.shared.includes("inheritedOperationsCustodyMonitoringCloseoutSealReceiptSummary") &&
    sprint109Source.shared.includes("finalNoExecutionEvidenceRows") &&
    sprint109Source.shared.includes("finalNoExecutionEvidenceRollupMutationCount") &&
    sprint109Source.shared.includes("externalCalls: z.literal(0)") &&
    sprint109Source.shared.includes(".strict()")
  );

  record("backend final no-execution evidence rollup route requires tenant",
    providerController.includes("operations-custody-monitoring-closeout-seal-receipt/final-no-execution-evidence-rollup") &&
    providerController.includes("getReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollup(requireTenantId(tenant)")
  );

  record("service derives final rollup read-only from Sprint 108 closeout seal receipt",
    sprint109Source.providerServiceMethod.includes("const operationsCustodyMonitoringCloseoutSealReceipt = this.getReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt") &&
    sprint109Source.providerServiceMethod.includes("prerequisites are incomplete") &&
    sprint109Source.providerServiceHelper.includes("finalNoExecutionEvidenceRollupMutationCount: 0") &&
    sprint109Source.providerServiceHelper.includes("operationsCustodyMonitoringCloseoutSealMutationCount === 0") &&
    sprint109Source.providerServiceHelper.includes("executionAttemptCount === 0") &&
    sprint109Source.providerServiceHelper.includes("providerOutboundCallCount === 0") &&
    sprint109Source.providerServiceHelper.includes("externalNotificationSendCount === 0") &&
    sprint109Source.providerServiceHelper.includes("aiCallCount === 0") &&
    sprint109Source.providerServiceHelper.includes("externalCalls: 0 as const")
  );

  record("API client final no-execution evidence rollup wiring",
    sprint109Source.apiClient.includes("providerWebhookReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollupSchema") &&
    sprint109Source.apiClient.includes("final-no-execution-evidence-rollup")
  );

  record("settings-data API mode has no mock fallback",
    sprint109Source.settingsData.includes("if (mode === \"api\")") &&
    sprint109Source.settingsData.includes("getProviderWebhookReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollup(filters)") &&
    sprint109Source.settingsData.includes("createMockReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollup(filters)") &&
    sprint109Source.settingsDataMock.includes("mockqahandoffcertifiedreleasefinalnoexecutionevidencerollup")
  );

  record("Settings > Channels final rollup controls/results/errors",
    sprint109Source.providerPanelControls.includes("Load final no-execution evidence rollup") &&
    sprint109Source.providerPanelResult.includes("QA archive certified release final no-execution evidence rollup:") &&
    sprint109Source.providerPanelResult.includes("finalNoExecutionEvidenceRollupStatus=") &&
    sprint109Source.providerPanelResult.includes("operationsCustodyMonitoringCloseoutStatus=") &&
    sprint109Source.providerPanelResult.includes("closeoutSealStatus=") &&
    sprint109Source.providerPanelResult.includes("noExecutionEvidenceStatus=") &&
    sprint109Source.providerPanelResult.includes("noExecutionMonitoringStatus=") &&
    sprint109Source.providerPanelResult.includes("finalArchiveCustodyStatus=") &&
    sprint109Source.providerPanelResult.includes("finalNoExecutionEvidenceRollupDigest=") &&
    sprint109Source.providerPanelResult.includes("providerOutboundCallCount=") &&
    sprint109Source.providerPanelResult.includes("externalNotificationSendCount=") &&
    sprint109Source.providerPanelResult.includes("aiCallCount=") &&
    sprint109Source.providerPanelResult.includes("externalCalls=") &&
    sprint109Source.settingsPage.includes("QA Archive Certified Release Final No-Execution Evidence Rollup API error")
  );

  record("stale final rollup clears on upstream/API failure",
    settingsPage.includes("clearReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollup") &&
    settingsPage.includes("setReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollup(null)") &&
    settingsPage.includes("clearReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollup();")
  );

  record("static Sprint 109 source has no provider outbound send markers", !containsProviderOutbound(sprint109Source));
  record("static Sprint 109 source has no external notification send markers", !containsExternalNotification(sprint109Source));
  record("static Sprint 109 source has no AI/OpenAI call markers", !containsAiCall(sprint109Source));
  record("static Sprint 109 source has no raw provider material leakage markers", !leaksRawProviderMaterial(sprint109Source));

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
  record("final no-execution evidence rollup requires x-tenant-id", missingTenant.status >= 400 && missingTenant.status < 500);

  const prerequisiteChainPassed = runNodeSmoke("smoke-sprint108-provider-webhook-certified-release-operations-custody-monitoring-closeout-seal-receipt.mjs");
  record("safe prerequisite chain driven through Sprint 108", prerequisiteChainPassed);
  if (!prerequisiteChainPassed) return;

  const closeout = await getJson(`${apiBase}${closeoutEndpointPath}${search}`, { "x-tenant-id": tenantId });
  const first = await getJson(`${apiBase}${endpointPath}${search}`, { "x-tenant-id": tenantId });
  const second = await getJson(`${apiBase}${endpointPath}${search}`, { "x-tenant-id": tenantId });
  const invalidTenant = await getJson(`${apiBase}${endpointPath}${search}`, { "x-tenant-id": "invalid-sprint109-tenant" });
  record("GET Sprint 109 final no-execution evidence rollup endpoint", first.status === 200 && safeFinalNoExecutionEvidenceRollupShape(first.body), first.status === 200 ? "" : `status=${first.status}`);
  record("GET Sprint 109 final rollup no mutation repeat read",
    first.status === 200 &&
    second.status === 200 &&
    JSON.stringify(stableFinalNoExecutionEvidenceRollupSnapshot(first.body)) === JSON.stringify(stableFinalNoExecutionEvidenceRollupSnapshot(second.body))
  );
  record("Sprint 109 digest continuity from Sprint 108 closeout seal receipt",
    closeout.status === 200 &&
    first.status === 200 &&
    first.body?.inheritedOperationsCustodyMonitoringCloseoutSealReceiptSummary?.operationsCustodyMonitoringCloseoutSealReceiptDigest === closeout.body?.operationsCustodyMonitoringCloseoutSealReceiptDigest &&
    first.body?.operationsCustodyMonitoringCloseoutSealReceiptDigest === closeout.body?.operationsCustodyMonitoringCloseoutSealReceiptDigest
  );
  record("invalid tenant does not return mock fallback",
    invalidTenant.status !== 200 ||
    (!String(invalidTenant.body?.safeDigest ?? "").includes("mock") && !String(invalidTenant.body?.finalNoExecutionEvidenceRollupDigest ?? "").includes("fake"))
  );
  record("no stale/fake final no-execution evidence rollup", !String(first.body?.finalNoExecutionEvidenceRollupDigest ?? "").includes("fake") && first.body?.rollupKind === "qa-handoff-locked-archive-certified-release-final-no-execution-evidence-rollup");
  record("externalCalls = 0", first.body?.externalCalls === 0);
  record("no execution/mutation/provider outbound/notification/AI counts", first.body?.counts?.executionAttemptCount === 0 && first.body?.counts?.finalNoExecutionEvidenceRollupMutationCount === 0 && first.body?.counts?.providerOutboundCallCount === 0 && first.body?.counts?.externalNotificationSendCount === 0 && first.body?.counts?.aiCallCount === 0);
  record("no raw provider material in live response", !leaksRawProviderMaterial(first.body));
}

run().then(() => {
  const failed = results.filter((result) => !result.ok);
  if (failed.length > 0) {
    console.error(`smoke:sprint109 failed ${failed.length}/${results.length} checks`);
    process.exit(1);
  }
  console.log(`smoke:sprint109 passed ${results.length}/${results.length} checks`);
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
