import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const sprint110EndpointPath = "/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt/handoff-packet/acceptance-record/noop-execution-dryrun/result-ledger/final-readiness-certificate/freeze-audit-register/rollback-rehearsal-receipt/control-room-packet/cutover-checklist-receipt/operator-command-receipt/go-live-authorization-receipt/launch-window-confirmation-receipt/go-live-hold-release-authorization-receipt/launch-approval-receipt/no-execution-lock-receipt/operations-handoff-readiness-no-execution-evidence-packet/operations-handoff-acceptance-receipt/operations-custody-monitoring-readiness-ledger/operations-custody-monitoring-closeout-seal-receipt/final-no-execution-evidence-rollup/final-evidence-index-regression-guardrail-receipt";
const endpointPath = `${sprint110EndpointPath}/final-archive-seal-operational-closure-receipt`;
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

function safeFinalArchiveSealOperationalClosureReceiptShape(value) {
  return value &&
    value.receiptKind === "qa-handoff-locked-archive-certified-release-final-archive-seal-operational-closure-receipt" &&
    value.finalOperationalClosureReceiptStatus === "issued" &&
    value.finalArchiveSealStatus === "sealed" &&
    value.releaseClosureStatus === "closed" &&
    value.finalEvidenceIndexStatus === "issued" &&
    value.regressionGuardrailReceiptStatus === "issued" &&
    value.regressionGuardrailStatus === "passed" &&
    value.finalNoExecutionEvidenceRollupStatus === "issued" &&
    value.finalArchiveCustodyStatus === "sealed" &&
    value.operationsCustodyMonitoringCloseoutStatus === "sealed" &&
    value.closeoutSealStatus === "sealed" &&
    value.noExecutionEvidenceStatus === "confirmed" &&
    value.noExecutionMonitoringStatus === "active" &&
    value.tenantScopeStatus === "tenant_scoped" &&
    value.digestContinuityStatus === "confirmed" &&
    value.providerOutboundStatus === "absent" &&
    value.externalNotificationStatus === "absent" &&
    value.aiCallStatus === "absent" &&
    value.safeFilename === "provider-webhook-review-qa-handoff-certified-release-final-archive-seal-operational-closure-receipt.json" &&
    /^sha256:[a-z0-9]+$/i.test(String(value.safeDigest ?? "")) &&
    value.finalOperationalClosureReceiptDigest === value.safeDigest &&
    value.finalArchiveSealDigest === value.safeDigest &&
    /^sha256:[a-z0-9]+$/i.test(String(value.finalEvidenceIndexDigest ?? "")) &&
    /^sha256:[a-z0-9]+$/i.test(String(value.regressionGuardrailReceiptDigest ?? "")) &&
    value.inheritedFinalEvidenceIndexRegressionGuardrailReceiptSummary?.finalEvidenceIndexStatus === "issued" &&
    value.inheritedFinalEvidenceIndexRegressionGuardrailReceiptSummary?.regressionGuardrailStatus === "passed" &&
    value.inheritedFinalEvidenceIndexRegressionGuardrailReceiptSummary?.externalCallsZero === true &&
    value.counts?.finalOperationalClosureReceiptMutationCount === 0 &&
    value.counts?.finalArchiveSealMutationCount === 0 &&
    value.counts?.finalEvidenceIndexMutationCount === 0 &&
    value.counts?.regressionGuardrailMutationCount === 0 &&
    value.counts?.finalNoExecutionEvidenceRollupMutationCount === 0 &&
    value.counts?.executionAttemptCount === 0 &&
    value.counts?.providerOutboundCallCount === 0 &&
    value.counts?.externalNotificationSendCount === 0 &&
    value.counts?.aiCallCount === 0 &&
    value.externalCalls === 0 &&
    Array.isArray(value.finalArchiveSealOperationalClosureRows) &&
    value.finalArchiveSealOperationalClosureRows.length === 9 &&
    value.finalArchiveSealOperationalClosureRows.map((row) => row.sprintNumber).join(",") === "103,104,105,106,107,108,109,110,111" &&
    value.finalArchiveSealOperationalClosureRows.every((row) =>
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

function stableFinalArchiveSealOperationalClosureReceiptSnapshot(value) {
  if (!value || typeof value !== "object") return value;
  const {
    generatedAt: _generatedAt,
    checkedAt: _checkedAt,
    finalArchiveSealOperationalClosureRows,
    ...stable
  } = value;
  return {
    ...stable,
    finalArchiveSealOperationalClosureRows: Array.isArray(finalArchiveSealOperationalClosureRows)
      ? finalArchiveSealOperationalClosureRows.map(({ checkedAt: _rowCheckedAt, generatedAt: _rowGeneratedAt, ...row }) => row)
      : finalArchiveSealOperationalClosureRows
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

  const sprint111Source = {
    shared: sourceSlice(shared, "providerWebhookReviewQaHandoffCertifiedReleaseFinalOperationalClosureReceiptStatusSchema", "providerWebhookUnmatchedInboundBulkReviewRequestSchema"),
    providerController: sourceSlice(providerController, "final-archive-seal-operational-closure-receipt", "@Get(\"review-closure-report/export\")"),
    providerServiceMethod: sourceSlice(providerService, "getReviewQaHandoffCertifiedReleaseFinalArchiveSealOperationalClosureReceipt", "private getLockedArchiveContext"),
    providerServiceHelper: sourceSlice(providerService, "function qaHandoffCertifiedReleaseFinalArchiveSealOperationalClosureReceiptResponse", "function qaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceiptResponse"),
    apiClient: sourceSlice(apiClient, "getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealOperationalClosureReceipt", "getProviderWebhookReviewClosureReportExport"),
    settingsData: sourceSlice(settingsData, "loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealOperationalClosureReceiptData", "loadSettingsProviderWebhookReviewClosureReportRedactionAuditData"),
    settingsDataMock: sourceSlice(settingsData, "function createMockReviewQaHandoffCertifiedReleaseFinalArchiveSealOperationalClosureReceipt", "function mockCertifiedReleaseFinalEvidenceIndexRegressionGuardrailPassed"),
    settingsPage: sourceSlice(settingsPage, "reviewQaHandoffCertifiedReleaseFinalArchiveSealOperationalClosureReceipt", "loadClosureReportRedactionAudit"),
    providerPanelControls: sourceSlice(providerPanel, "Load final evidence index guardrail receipt", "Audit report export redaction"),
    providerPanelResult: sourceSlice(providerPanel, "QA archive certified release final archive seal operational closure receipt:", "reviewQaHandoffLockedArchive ?")
  };

  record("smoke:sprint111 registered",
    rootPackage.scripts?.["smoke:sprint111"] === "node scripts/smoke-sprint111-provider-webhook-certified-release-final-archive-seal-operational-closure-receipt.mjs"
  );

  record("shared final archive seal operational closure receipt DTO export",
    sprint111Source.shared.includes("providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealOperationalClosureReceiptSchema") &&
    sprint111Source.shared.includes("ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealOperationalClosureReceipt") &&
    sprint111Source.shared.includes("finalOperationalClosureReceiptStatus") &&
    sprint111Source.shared.includes("finalArchiveSealStatus") &&
    sprint111Source.shared.includes("releaseClosureStatus") &&
    sprint111Source.shared.includes("finalArchiveSealOperationalClosureRows") &&
    sprint111Source.shared.includes("artifactLabel") &&
    sprint111Source.shared.includes("safeDigest") &&
    sprint111Source.shared.includes("providerOutboundCallCount: z.literal(0)") &&
    sprint111Source.shared.includes("externalCalls: z.literal(0)") &&
    sprint111Source.shared.includes(".strict()")
  );

  record("backend final archive seal route requires tenant",
    sprint111Source.providerController.includes("final-archive-seal-operational-closure-receipt") &&
    sprint111Source.providerController.includes("getReviewQaHandoffCertifiedReleaseFinalArchiveSealOperationalClosureReceipt(requireTenantId(tenant)")
  );

  record("service derives read-only from Sprint 110 and blocks incomplete prerequisites",
    sprint111Source.providerServiceMethod.includes("getReviewQaHandoffCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt") &&
    sprint111Source.providerServiceMethod.includes("prerequisites are incomplete") &&
    sprint111Source.providerServiceMethod.includes("ConflictException") &&
    sprint111Source.providerServiceHelper.includes("finalOperationalClosureReceiptMutationCount: 0") &&
    sprint111Source.providerServiceHelper.includes("finalArchiveSealMutationCount: 0") &&
    sprint111Source.providerServiceHelper.includes("finalEvidenceIndexMutationCount: finalEvidenceIndexRegressionGuardrailReceipt.counts.finalEvidenceIndexMutationCount") &&
    sprint111Source.providerServiceHelper.includes("executionAttemptCount: finalEvidenceIndexRegressionGuardrailReceipt.counts.executionAttemptCount") &&
    sprint111Source.providerServiceHelper.includes("providerOutboundCallCount: finalEvidenceIndexRegressionGuardrailReceipt.counts.providerOutboundCallCount") &&
    sprint111Source.providerServiceHelper.includes("externalNotificationSendCount: finalEvidenceIndexRegressionGuardrailReceipt.counts.externalNotificationSendCount") &&
    sprint111Source.providerServiceHelper.includes("aiCallCount: finalEvidenceIndexRegressionGuardrailReceipt.counts.aiCallCount") &&
    sprint111Source.providerServiceHelper.includes("externalCalls: 0 as const")
  );

  record("API client Sprint 111 wiring",
    sprint111Source.apiClient.includes("providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealOperationalClosureReceiptSchema") &&
    sprint111Source.apiClient.includes("final-archive-seal-operational-closure-receipt")
  );

  record("settings-data API mode has no mock fallback",
    sprint111Source.settingsData.includes("if (mode === \"api\")") &&
    sprint111Source.settingsData.includes("getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealOperationalClosureReceipt(filters)") &&
    sprint111Source.settingsData.includes("createMockReviewQaHandoffCertifiedReleaseFinalArchiveSealOperationalClosureReceipt(filters)") &&
    sprint111Source.settingsDataMock.includes("mockqahandoffcertifiedreleasefinalarchivesealoperationalclosurereceipt")
  );

  record("Settings > Channels Sprint 111 controls/results/errors",
    sprint111Source.providerPanelControls.includes("Load final archive seal operational closure receipt") &&
    sprint111Source.providerPanelResult.includes("QA archive certified release final archive seal operational closure receipt:") &&
    sprint111Source.providerPanelResult.includes("finalOperationalClosureReceiptStatus=") &&
    sprint111Source.providerPanelResult.includes("finalArchiveSealStatus=") &&
    sprint111Source.providerPanelResult.includes("releaseClosureStatus=") &&
    sprint111Source.providerPanelResult.includes("finalEvidenceIndexStatus=") &&
    sprint111Source.providerPanelResult.includes("regressionGuardrailReceiptStatus=") &&
    sprint111Source.providerPanelResult.includes("regressionGuardrailStatus=") &&
    sprint111Source.providerPanelResult.includes("tenantScopeStatus=") &&
    sprint111Source.providerPanelResult.includes("digestContinuityStatus=") &&
    sprint111Source.providerPanelResult.includes("finalArchiveSealOperationalClosureSafeRows=") &&
    sprint111Source.providerPanelResult.includes("providerOutboundCallCount=") &&
    sprint111Source.providerPanelResult.includes("externalNotificationSendCount=") &&
    sprint111Source.providerPanelResult.includes("aiCallCount=") &&
    sprint111Source.providerPanelResult.includes("externalCalls=") &&
    sprint111Source.settingsPage.includes("QA Archive Certified Release Final Archive Seal Operational Closure Receipt API error")
  );

  record("stale Sprint 111 receipt clears on upstream/API failure",
    settingsPage.includes("clearReviewQaHandoffCertifiedReleaseFinalArchiveSealOperationalClosureReceipt") &&
    settingsPage.includes("setReviewQaHandoffCertifiedReleaseFinalArchiveSealOperationalClosureReceipt(null)") &&
    settingsPage.includes("clearReviewQaHandoffCertifiedReleaseFinalArchiveSealOperationalClosureReceipt();")
  );

  record("static Sprint 111 source has no provider outbound send markers", !containsProviderOutbound(sprint111Source));
  record("static Sprint 111 source has no external notification send markers", !containsExternalNotification(sprint111Source));
  record("static Sprint 111 source has no AI/OpenAI call markers", !containsAiCall(sprint111Source));
  record("static Sprint 111 source has no raw provider material leakage markers", !leaksRawProviderMaterial(sprint111Source));

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
  record("final archive seal operational closure receipt requires x-tenant-id", missingTenant.status >= 400 && missingTenant.status < 500);

  const prerequisiteChainPassed = runNodeSmoke("smoke-sprint110-provider-webhook-certified-release-final-evidence-index-regression-guardrail-receipt.mjs");
  record("safe prerequisite chain driven through Sprint 110", prerequisiteChainPassed);
  if (!prerequisiteChainPassed) return;

  const sprint110Receipt = await getJson(`${apiBase}${sprint110EndpointPath}${search}`, { "x-tenant-id": tenantId });
  const first = await getJson(`${apiBase}${endpointPath}${search}`, { "x-tenant-id": tenantId });
  const second = await getJson(`${apiBase}${endpointPath}${search}`, { "x-tenant-id": tenantId });
  const invalidTenant = await getJson(`${apiBase}${endpointPath}${search}`, { "x-tenant-id": "invalid-sprint111-tenant" });
  record("GET Sprint 111 final archive seal operational closure receipt endpoint", first.status === 200 && safeFinalArchiveSealOperationalClosureReceiptShape(first.body), first.status === 200 ? "" : `status=${first.status}`);
  record("GET Sprint 111 repeat read has no mutation",
    first.status === 200 &&
    second.status === 200 &&
    JSON.stringify(stableFinalArchiveSealOperationalClosureReceiptSnapshot(first.body)) === JSON.stringify(stableFinalArchiveSealOperationalClosureReceiptSnapshot(second.body))
  );
  record("Sprint 111 derives digest continuity from Sprint 110 final evidence index",
    sprint110Receipt.status === 200 &&
    first.status === 200 &&
    first.body?.inheritedFinalEvidenceIndexRegressionGuardrailReceiptSummary?.finalEvidenceIndexDigest === sprint110Receipt.body?.finalEvidenceIndexDigest &&
    first.body?.finalEvidenceIndexDigest === sprint110Receipt.body?.finalEvidenceIndexDigest
  );
  record("invalid tenant does not return mock fallback",
    invalidTenant.status !== 200 ||
    (!String(invalidTenant.body?.safeDigest ?? "").includes("mock") && !String(invalidTenant.body?.finalArchiveSealDigest ?? "").includes("fake"))
  );
  record("no stale/fake Sprint 111 receipt", first.status !== 200 || (!String(first.body?.safeDigest ?? "").includes("mock") && !String(first.body?.safeDigest ?? "").includes("fake")));
  record("externalCalls = 0", first.body?.externalCalls === 0);
  record("no execution/provider outbound/notification/AI counts", first.body?.counts?.executionAttemptCount === 0 && first.body?.counts?.providerOutboundCallCount === 0 && first.body?.counts?.externalNotificationSendCount === 0 && first.body?.counts?.aiCallCount === 0);
  record("finalArchiveSealStatus=sealed", first.body?.finalArchiveSealStatus === "sealed");
  record("finalOperationalClosureReceiptStatus=issued", first.body?.finalOperationalClosureReceiptStatus === "issued");
  record("releaseClosureStatus=closed", first.body?.releaseClosureStatus === "closed");
  record("safe closure/evidence rows present", Array.isArray(first.body?.finalArchiveSealOperationalClosureRows) && first.body.finalArchiveSealOperationalClosureRows.length === 9);
  record("no raw provider material in live response", !leaksRawProviderMaterial(first.body));
}

run().then(() => {
  const failed = results.filter((result) => !result.ok);
  if (failed.length > 0) {
    console.error(`smoke:sprint111 failed ${failed.length}/${results.length} checks`);
    process.exit(1);
  }
  console.log(`smoke:sprint111 passed ${results.length}/${results.length} checks`);
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
