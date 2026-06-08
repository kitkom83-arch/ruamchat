import fs from "node:fs";

const apiBaseUrl = process.env.API_BASE_URL ?? "http://localhost:4000";
const releaseBasePath = "/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence";
const goLiveAuthorizationReceiptPath = `${releaseBasePath}/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt/handoff-packet/acceptance-record/noop-execution-dryrun/result-ledger/final-readiness-certificate/freeze-audit-register/rollback-rehearsal-receipt/control-room-packet/cutover-checklist-receipt/operator-command-receipt/go-live-authorization-receipt`;
const tenantId = process.env.SMOKE_TENANT_ID ?? "smoke-sprint100-tenant";
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

function containsRawLeak(value) {
  return /\b(rawPayload|signature|authorization|cookie|replyToken|senderId|providerMaterial|rawBody|headers|stack|secret|token|raw webhook body|raw signature)\b/i.test(JSON.stringify(value));
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

function safeRows(rows) {
  return Array.isArray(rows) && rows.length > 0 && rows.every((row) => row && row.complete === true && /^sha256:[a-z0-9]+$/i.test(String(row.safeDigest ?? "")));
}

function safeGoLiveAuthorizationReceiptShape(value) {
  return value?.receiptKind === "qa-handoff-locked-archive-certified-release-go-live-authorization-receipt" &&
    value.goLiveAuthorizationReceiptStatus === "issued" &&
    value.goLiveAuthorizationStatus === "ready" &&
    value.launchWindowStatus === "ready" &&
    value.safeLaunchWindowStatus === "ready" &&
    value.operatorCommandReceiptStatus === "issued" &&
    value.operatorCommandStatus === "ready" &&
    value.cutoverChecklistStatus === "verified" &&
    value.controlRoomStatus === "ready" &&
    value.cutoverReadinessStatus === "ready" &&
    value.rollbackRehearsalStatus === "verified" &&
    value.recoveryReadinessStatus === "ready" &&
    value.rollbackReadinessStatus === "ready" &&
    value.freezeAuditStatus === "recorded" &&
    value.freezeStatus === "frozen" &&
    value.certificateStatus === "issued" &&
    value.finalReadinessStatus === "ready" &&
    value.ledgerStatus === "recorded" &&
    value.dryRunStatus === "passed" &&
    value.executionMode === "no_op" &&
    value.acceptanceStatus === "acknowledged" &&
    value.handoffStatus === "ready" &&
    value.releaseDecision === "go" &&
    value.packetStatus === "issued" &&
    value.receiptStatus === "issued" &&
    value.gateStatus === "ready" &&
    value.goNoGoDecision === "go" &&
    value.releaseReadinessStatus === "ready_for_release" &&
    (value.reconciliationStatus === "complete" || value.reconciliationStatus === "aligned") &&
    value.attestationStatus === "complete" &&
    value.ledgerStatusFromClosure === "certified_release_closed" &&
    value.certificationStatus === "certified" &&
    value.verificationStatus === "verified" &&
    value.digestChainStatus === "confirmed" &&
    /^sha256:[a-z0-9]+$/i.test(value.safeDigest) &&
    /^sha256:[a-z0-9]+$/i.test(value.goLiveAuthorizationReceiptDigest) &&
    /^sha256:[a-z0-9]+$/i.test(value.operatorCommandReceiptDigest) &&
    safeRows(value.operatorCommandRows) &&
    safeRows(value.operatorCommandReceiptRows) &&
    safeRows(value.goLiveAuthorizationRows) &&
    safeRows(value.goLiveAuthorizationReceiptRows) &&
    safeRows(value.launchWindowRows) &&
    safeRows(value.safeLaunchWindowRows) &&
    Array.isArray(value.operatorChecklist) &&
    Array.isArray(value.acknowledgedChecklist) &&
    Array.isArray(value.executionChecklist) &&
    value.inheritedPrerequisiteChecklist?.length > 0 &&
    value.inheritedCertificationChecklist?.length > 0 &&
    value.inheritedGateChecklist?.length > 0 &&
    value.inheritedDecisionReceiptSummary &&
    value.inheritedHandoffPacketSummary &&
    value.inheritedAcceptanceSummary &&
    value.inheritedNoopDryRunSummary &&
    value.inheritedResultLedgerSummary &&
    value.inheritedFinalReadinessCertificateSummary &&
    value.inheritedFreezeAuditSummary &&
    value.inheritedRollbackRehearsalSummary &&
    value.inheritedControlRoomSummary &&
    value.inheritedCutoverChecklistSummary &&
    value.inheritedOperatorCommandSummary &&
    Array.isArray(value.inheritedBlockingReasons) &&
    Array.isArray(value.inheritedExceptionRows) &&
    value.releaseOwnerSummary &&
    value.counts?.goLiveAuthorizationReceiptCheckedCount === 1 &&
    value.counts?.goLiveAuthorizationReceiptMutationCount === 0 &&
    value.externalCalls === 0 &&
    !containsRawLeak(value);
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
  const sprint100Source = {
    shared: sourceSlice(shared, "providerWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceiptStatusSchema", "providerWebhookUnmatchedInboundBulkReviewRequestSchema"),
    providerController: sourceSlice(providerController, "operator-command-receipt/go-live-authorization-receipt", "review-closure-report/export"),
    providerService: sourceSlice(providerService, "qaHandoffCertifiedReleaseGoLiveAuthorizationReceiptResponse", "qaHandoffCertifiedReleaseCutoverChecklistReceiptResponse"),
    apiClient: sourceSlice(apiClient, "getProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceipt", "getProviderWebhookReviewClosureReportExport"),
    settingsData: sourceSlice(settingsData, "loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceiptData", "loadSettingsProviderWebhookReviewClosureReportRedactionAuditData"),
    settingsPage: sourceSlice(settingsPage, "reviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceipt", "loadClosureReportRedactionAudit"),
    providerPanel: sourceSlice(providerPanel, "Load certified release go-live authorization receipt", "Audit report export redaction")
  };

  record("smoke:sprint100 registered",
    rootPackage.scripts?.["smoke:sprint100"] === "node scripts/smoke-sprint100-provider-webhook-review-qa-archive-certified-release-go-live-authorization-receipt.mjs"
  );
  record("shared go-live authorization receipt DTO export",
    sprint100Source.shared.includes("providerWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceiptSchema") &&
    sprint100Source.shared.includes("ProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceipt") &&
    sprint100Source.shared.includes("goLiveAuthorizationReceiptStatus") &&
    sprint100Source.shared.includes("launchWindowStatus") &&
    sprint100Source.shared.includes("safeLaunchWindowStatus") &&
    sprint100Source.shared.includes("externalCalls: z.literal(0)") &&
    sprint100Source.shared.includes(".strict()")
  );
  record("backend go-live authorization receipt route registration",
    providerController.includes('@Get("review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt/handoff-packet/acceptance-record/noop-execution-dryrun/result-ledger/final-readiness-certificate/freeze-audit-register/rollback-rehearsal-receipt/control-room-packet/cutover-checklist-receipt/operator-command-receipt/go-live-authorization-receipt")') &&
    providerController.includes("getReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceipt(requireTenantId(tenant)")
  );
  record("service go-live authorization receipt implementation",
    sprint100Source.providerService.includes("qaHandoffCertifiedReleaseGoLiveAuthorizationReceiptResponse") &&
    sprint100Source.providerService.includes("certifiedReleaseGoLiveAuthorizationReceiptReady") &&
    sprint100Source.providerService.includes("goLiveAuthorizationReceiptMutationCount: 0") &&
    sprint100Source.providerService.includes("externalCalls: 0 as const")
  );
  record("API client go-live authorization receipt wiring",
    sprint100Source.apiClient.includes("providerWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceiptSchema") &&
    sprint100Source.apiClient.includes("operator-command-receipt/go-live-authorization-receipt")
  );
  record("settings-data go-live authorization receipt API mode has no fallback",
    sprint100Source.settingsData.includes("mode === \"api\"") &&
    sprint100Source.settingsData.includes("getProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceipt(filters)") &&
    sprint100Source.settingsData.includes("createMockReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceipt(filters)")
  );
  record("Settings > Channels go-live authorization receipt controls/results/errors",
    sprint100Source.settingsPage.includes("QA Archive Certified Release Go-Live Authorization Receipt API error") &&
    providerPanel.includes("Load certified release go-live authorization receipt") &&
    providerPanel.includes("QA archive certified release go-live authorization receipt:") &&
    providerPanel.includes("goLiveAuthorizationReceiptStatus=") &&
    providerPanel.includes("launchWindowStatus=") &&
    providerPanel.includes("safeLaunchWindowStatus=") &&
    providerPanel.includes("externalCalls=")
  );
  record("stale go-live authorization receipt clears on upstream reloads",
    settingsPage.includes("clearReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceipt") &&
    settingsPage.includes("setReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceipt(null)") &&
    settingsPage.includes("clearReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceipt();")
  );
  record("static Sprint 100 source has no provider outbound send markers", !containsProviderOutbound(sprint100Source));
  record("static Sprint 100 source has no external notification send markers", !containsExternalNotification(sprint100Source));
  record("static Sprint 100 source has no AI/OpenAI call markers", !containsAiCall(sprint100Source));

  const health = await getJson("/health").catch((error) => ({ status: 0, body: null, error }));
  if (health.status !== 200) {
    record("GET /health", false, `API unavailable at ${apiBaseUrl}; runtime checks skipped`);
    return finish();
  }
  record("GET /health", true);

  const missingTenantReceipt = await getJson(goLiveAuthorizationReceiptPath);
  record("go-live authorization receipt requires x-tenant-id", missingTenantReceipt.status >= 400 && missingTenantReceipt.status < 500);

  const first = await getJson(goLiveAuthorizationReceiptPath, { "x-tenant-id": tenantId });
  record("GET Sprint 100 go-live authorization receipt endpoint", first.status === 200 && safeGoLiveAuthorizationReceiptShape(first.body), first.status === 200 ? "" : `status=${first.status}`);

  const second = await getJson(goLiveAuthorizationReceiptPath, { "x-tenant-id": tenantId });
  record("GET Sprint 100 go-live authorization receipt no mutation repeat read", first.status === 200 && second.status === 200 && JSON.stringify(first.body) === JSON.stringify(second.body));

  record("no stale/fake go-live authorization receipt", !String(first.body?.goLiveAuthorizationReceiptDigest ?? "").includes("fake") && first.body?.receiptKind === "qa-handoff-locked-archive-certified-release-go-live-authorization-receipt");
  record("no raw provider material leakage", first.body && !containsRawLeak(first.body));
  record("externalCalls = 0", first.body?.externalCalls === 0);
  record("no provider outbound", !containsProviderOutbound(sprint100Source));
  record("no external notification sending", !containsExternalNotification(sprint100Source));
  record("no AI/OpenAI call", !containsAiCall(sprint100Source));

  return finish();
}

function finish() {
  const failed = results.filter((result) => !result.pass);
  if (failed.length > 0) {
    console.error(`smoke:sprint100 failed ${failed.length}/${results.length} checks`);
    process.exit(1);
  }
  console.log(`smoke:sprint100 passed ${results.length}/${results.length} checks`);
}

await main();
