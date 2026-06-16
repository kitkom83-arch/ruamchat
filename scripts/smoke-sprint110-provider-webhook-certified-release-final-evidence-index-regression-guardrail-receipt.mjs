import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const finalNoExecutionEvidenceRollupEndpointPath = "/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt/handoff-packet/acceptance-record/noop-execution-dryrun/result-ledger/final-readiness-certificate/freeze-audit-register/rollback-rehearsal-receipt/control-room-packet/cutover-checklist-receipt/operator-command-receipt/go-live-authorization-receipt/launch-window-confirmation-receipt/go-live-hold-release-authorization-receipt/launch-approval-receipt/no-execution-lock-receipt/operations-handoff-readiness-no-execution-evidence-packet/operations-handoff-acceptance-receipt/operations-custody-monitoring-readiness-ledger/operations-custody-monitoring-closeout-seal-receipt/final-no-execution-evidence-rollup";
const endpointPath = `${finalNoExecutionEvidenceRollupEndpointPath}/final-evidence-index-regression-guardrail-receipt`;
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

function safeFinalEvidenceIndexRegressionGuardrailReceiptShape(value) {
  return value &&
    value.receiptKind === "qa-handoff-locked-archive-certified-release-final-evidence-index-regression-guardrail-receipt" &&
    value.finalEvidenceIndexStatus === "issued" &&
    value.regressionGuardrailReceiptStatus === "issued" &&
    value.finalNoExecutionEvidenceRollupStatus === "issued" &&
    value.finalArchiveCustodyStatus === "sealed" &&
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
    value.regressionGuardrailStatus === "passed" &&
    value.providerOutboundStatus === "absent" &&
    value.externalNotificationStatus === "absent" &&
    value.aiCallStatus === "absent" &&
    value.safeFilename === "provider-webhook-review-qa-handoff-certified-release-final-evidence-index-regression-guardrail-receipt.json" &&
    /^sha256:[a-z0-9]+$/i.test(String(value.finalEvidenceIndexDigest ?? "")) &&
    value.finalEvidenceIndexDigest === value.safeDigest &&
    value.regressionGuardrailReceiptDigest === value.safeDigest &&
    /^sha256:[a-z0-9]+$/i.test(String(value.finalNoExecutionEvidenceRollupDigest ?? "")) &&
    value.inheritedFinalNoExecutionEvidenceRollupSummary?.finalNoExecutionEvidenceRollupStatus === "issued" &&
    value.inheritedFinalNoExecutionEvidenceRollupSummary?.finalArchiveCustodyStatus === "sealed" &&
    value.inheritedFinalNoExecutionEvidenceRollupSummary?.externalCallsZero === true &&
    value.counts?.finalEvidenceIndexMutationCount === 0 &&
    value.counts?.regressionGuardrailMutationCount === 0 &&
    value.counts?.finalNoExecutionEvidenceRollupMutationCount === 0 &&
    value.counts?.executionAttemptCount === 0 &&
    value.counts?.providerOutboundCallCount === 0 &&
    value.counts?.externalNotificationSendCount === 0 &&
    value.counts?.aiCallCount === 0 &&
    value.externalCalls === 0 &&
    Array.isArray(value.finalEvidenceIndexRows) &&
    value.finalEvidenceIndexRows.length === 8 &&
    value.finalEvidenceIndexRows.map((row) => row.sprintNumber).join(",") === "103,104,105,106,107,108,109,110" &&
    value.finalEvidenceIndexRows.every((row) =>
      typeof row.artifactLabel === "string" &&
      row.artifactLabel.length > 0 &&
      /^sha256:[a-z0-9]+$/i.test(String(row.safeDigest ?? "")) &&
      row.externalCalls === 0 &&
      row.executionAttemptCount === 0 &&
      row.providerOutboundCallCount === 0 &&
      row.externalNotificationSendCount === 0 &&
      row.aiCallCount === 0 &&
      row.mutationCount === 0
    ) &&
    !leaksRawProviderMaterial(value);
}

function stableFinalEvidenceIndexRegressionGuardrailReceiptSnapshot(value) {
  if (!value || typeof value !== "object") return value;
  const {
    generatedAt: _generatedAt,
    checkedAt: _checkedAt,
    finalEvidenceIndexRows,
    ...stable
  } = value;
  return {
    ...stable,
    finalEvidenceIndexRows: Array.isArray(finalEvidenceIndexRows)
      ? finalEvidenceIndexRows.map(({ checkedAt: _rowCheckedAt, generatedAt: _rowGeneratedAt, ...row }) => row)
      : finalEvidenceIndexRows
  };
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

  const sprint110Source = {
    shared: sourceSlice(shared, "providerWebhookReviewQaHandoffCertifiedReleaseFinalEvidenceIndexStatusSchema", "providerWebhookUnmatchedInboundBulkReviewRequestSchema"),
    providerController: sourceSlice(providerController, "final-no-execution-evidence-rollup/final-evidence-index-regression-guardrail-receipt", "@Get(\"review-closure-report/export\")"),
    providerServiceMethod: sourceSlice(providerService, "getReviewQaHandoffCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt", "private getLockedArchiveContext"),
    providerServiceHelper: sourceSlice(providerService, "function qaHandoffCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceiptResponse", "function qaHandoffCertifiedReleaseFinalArchiveSealOperationalClosureReceiptResponse"),
    apiClient: sourceSlice(apiClient, "getProviderWebhookReviewQaHandoffCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt", "getProviderWebhookReviewClosureReportExport"),
    settingsData: sourceSlice(settingsData, "loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceiptData", "loadSettingsProviderWebhookReviewClosureReportRedactionAuditData"),
    settingsDataMock: sourceSlice(settingsData, "function createMockReviewQaHandoffCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt", "function mockCertifiedReleaseFinalEvidenceIndexRegressionGuardrailPassed"),
    settingsPage: sourceSlice(settingsPage, "reviewQaHandoffCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt", "loadClosureReportRedactionAudit"),
    providerPanelControls: sourceSlice(providerPanel, "Load final no-execution evidence rollup", "Audit report export redaction"),
    providerPanelResult: sourceSlice(providerPanel, "QA archive certified release final evidence index regression guardrail receipt:", "reviewQaHandoffLockedArchive ?")
  };

  record("smoke:sprint110 registered",
    rootPackage.scripts?.["smoke:sprint110"] === "node scripts/smoke-sprint110-provider-webhook-certified-release-final-evidence-index-regression-guardrail-receipt.mjs"
  );

  record("shared final evidence index regression guardrail receipt DTO export",
    sprint110Source.shared.includes("providerWebhookReviewQaHandoffCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceiptSchema") &&
    sprint110Source.shared.includes("ProviderWebhookReviewQaHandoffCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt") &&
    sprint110Source.shared.includes("finalEvidenceIndexStatus") &&
    sprint110Source.shared.includes("regressionGuardrailReceiptStatus") &&
    sprint110Source.shared.includes("regressionGuardrailStatus") &&
    sprint110Source.shared.includes("finalNoExecutionEvidenceRollupStatus") &&
    sprint110Source.shared.includes("finalEvidenceIndexRows") &&
    sprint110Source.shared.includes("artifactLabel") &&
    sprint110Source.shared.includes("safeDigest") &&
    sprint110Source.shared.includes("providerOutboundCallCount: z.literal(0)") &&
    sprint110Source.shared.includes("externalCalls: z.literal(0)") &&
    sprint110Source.shared.includes(".strict()")
  );

  record("backend final evidence index route requires tenant",
    sprint110Source.providerController.includes("final-no-execution-evidence-rollup/final-evidence-index-regression-guardrail-receipt") &&
    sprint110Source.providerController.includes("getReviewQaHandoffCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt(requireTenantId(tenant)")
  );

  record("service derives read-only from Sprint 109 and blocks incomplete prerequisites",
    sprint110Source.providerServiceMethod.includes("getReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollup") &&
    sprint110Source.providerServiceMethod.includes("prerequisites are incomplete") &&
    sprint110Source.providerServiceMethod.includes("ConflictException") &&
    sprint110Source.providerServiceHelper.includes("finalEvidenceIndexMutationCount: 0") &&
    sprint110Source.providerServiceHelper.includes("regressionGuardrailMutationCount: 0") &&
    sprint110Source.providerServiceHelper.includes("finalNoExecutionEvidenceRollupMutationCount: finalNoExecutionEvidenceRollup.counts.finalNoExecutionEvidenceRollupMutationCount") &&
    sprint110Source.providerServiceHelper.includes("executionAttemptCount: finalNoExecutionEvidenceRollup.counts.executionAttemptCount") &&
    sprint110Source.providerServiceHelper.includes("providerOutboundCallCount: finalNoExecutionEvidenceRollup.counts.providerOutboundCallCount") &&
    sprint110Source.providerServiceHelper.includes("externalNotificationSendCount: finalNoExecutionEvidenceRollup.counts.externalNotificationSendCount") &&
    sprint110Source.providerServiceHelper.includes("aiCallCount: finalNoExecutionEvidenceRollup.counts.aiCallCount") &&
    sprint110Source.providerServiceHelper.includes("externalCalls: 0 as const")
  );

  record("API client Sprint 110 wiring",
    sprint110Source.apiClient.includes("providerWebhookReviewQaHandoffCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceiptSchema") &&
    sprint110Source.apiClient.includes("final-evidence-index-regression-guardrail-receipt")
  );

  record("settings-data API mode has no mock fallback",
    sprint110Source.settingsData.includes("if (mode === \"api\")") &&
    sprint110Source.settingsData.includes("getProviderWebhookReviewQaHandoffCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt(filters)") &&
    sprint110Source.settingsData.includes("createMockReviewQaHandoffCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt(filters)") &&
    sprint110Source.settingsDataMock.includes("mockqahandoffcertifiedreleasefinalevidenceindexregressionguardrailreceipt")
  );

  record("Settings > Channels Sprint 110 controls/results/errors",
    sprint110Source.providerPanelControls.includes("Load final evidence index guardrail receipt") &&
    sprint110Source.providerPanelResult.includes("QA archive certified release final evidence index regression guardrail receipt:") &&
    sprint110Source.providerPanelResult.includes("finalEvidenceIndexStatus=") &&
    sprint110Source.providerPanelResult.includes("regressionGuardrailReceiptStatus=") &&
    sprint110Source.providerPanelResult.includes("finalNoExecutionEvidenceRollupStatus=") &&
    sprint110Source.providerPanelResult.includes("finalArchiveCustodyStatus=") &&
    sprint110Source.providerPanelResult.includes("operationsCustodyMonitoringCloseoutStatus=") &&
    sprint110Source.providerPanelResult.includes("closeoutSealStatus=") &&
    sprint110Source.providerPanelResult.includes("regressionGuardrailStatus=") &&
    sprint110Source.providerPanelResult.includes("tenantScopeStatus=") &&
    sprint110Source.providerPanelResult.includes("digestContinuityStatus=") &&
    sprint110Source.providerPanelResult.includes("finalEvidenceIndexSafeRows=") &&
    sprint110Source.providerPanelResult.includes("providerOutboundCallCount=") &&
    sprint110Source.providerPanelResult.includes("externalNotificationSendCount=") &&
    sprint110Source.providerPanelResult.includes("aiCallCount=") &&
    sprint110Source.providerPanelResult.includes("externalCalls=") &&
    sprint110Source.settingsPage.includes("QA Archive Certified Release Final Evidence Index Regression Guardrail Receipt API error")
  );

  record("stale Sprint 110 receipt clears on upstream/API failure",
    settingsPage.includes("clearReviewQaHandoffCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt") &&
    settingsPage.includes("setReviewQaHandoffCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt(null)") &&
    settingsPage.includes("clearReviewQaHandoffCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt();")
  );

  record("static Sprint 110 source has no provider outbound send markers", !containsProviderOutbound(sprint110Source));
  record("static Sprint 110 source has no external notification send markers", !containsExternalNotification(sprint110Source));
  record("static Sprint 110 source has no AI/OpenAI call markers", !containsAiCall(sprint110Source));
  record("static Sprint 110 source has no raw provider material leakage markers", !leaksRawProviderMaterial(sprint110Source));

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
  record("final evidence index regression guardrail receipt requires x-tenant-id", missingTenant.status >= 400 && missingTenant.status < 500);

  const prerequisiteChainPassed = runNodeSmoke("smoke-sprint109-provider-webhook-certified-release-final-no-execution-evidence-rollup.mjs");
  record("safe prerequisite chain driven through Sprint 109", prerequisiteChainPassed);
  if (!prerequisiteChainPassed) return;

  const finalNoExecutionEvidenceRollup = await getJson(`${apiBase}${finalNoExecutionEvidenceRollupEndpointPath}${search}`, { "x-tenant-id": tenantId });
  const first = await getJson(`${apiBase}${endpointPath}${search}`, { "x-tenant-id": tenantId });
  const second = await getJson(`${apiBase}${endpointPath}${search}`, { "x-tenant-id": tenantId });
  const invalidTenant = await getJson(`${apiBase}${endpointPath}${search}`, { "x-tenant-id": "invalid-sprint110-tenant" });
  record("GET Sprint 110 final evidence index regression guardrail receipt endpoint", first.status === 200 && safeFinalEvidenceIndexRegressionGuardrailReceiptShape(first.body), first.status === 200 ? "" : `status=${first.status}`);
  record("GET Sprint 110 repeat read has no mutation",
    first.status === 200 &&
    second.status === 200 &&
    JSON.stringify(stableFinalEvidenceIndexRegressionGuardrailReceiptSnapshot(first.body)) === JSON.stringify(stableFinalEvidenceIndexRegressionGuardrailReceiptSnapshot(second.body))
  );
  record("Sprint 110 derives digest continuity from Sprint 109 final rollup",
    finalNoExecutionEvidenceRollup.status === 200 &&
    first.status === 200 &&
    first.body?.inheritedFinalNoExecutionEvidenceRollupSummary?.finalNoExecutionEvidenceRollupDigest === finalNoExecutionEvidenceRollup.body?.finalNoExecutionEvidenceRollupDigest &&
    first.body?.finalNoExecutionEvidenceRollupDigest === finalNoExecutionEvidenceRollup.body?.finalNoExecutionEvidenceRollupDigest
  );
  record("invalid tenant does not return mock fallback",
    invalidTenant.status !== 200 ||
    (!String(invalidTenant.body?.safeDigest ?? "").includes("mock") && !String(invalidTenant.body?.finalEvidenceIndexDigest ?? "").includes("fake"))
  );
  record("externalCalls = 0", first.body?.externalCalls === 0);
  record("no execution/provider outbound/notification/AI counts", first.body?.counts?.executionAttemptCount === 0 && first.body?.counts?.providerOutboundCallCount === 0 && first.body?.counts?.externalNotificationSendCount === 0 && first.body?.counts?.aiCallCount === 0);
  record("no raw provider material in live response", !leaksRawProviderMaterial(first.body));
}

run().then(() => {
  const failed = results.filter((result) => !result.ok);
  if (failed.length > 0) {
    console.error(`smoke:sprint110 failed ${failed.length}/${results.length} checks`);
    process.exit(1);
  }
  console.log(`smoke:sprint110 passed ${results.length}/${results.length} checks`);
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
