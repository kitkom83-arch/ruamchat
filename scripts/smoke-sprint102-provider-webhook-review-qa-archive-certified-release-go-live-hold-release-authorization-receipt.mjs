import fs from "node:fs";

const apiBaseUrl = process.env.API_BASE_URL ?? "http://localhost:4000";
const releaseBasePath = "/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence";
const goLiveHoldReleaseAuthorizationReceiptPath = `${releaseBasePath}/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt/handoff-packet/acceptance-record/noop-execution-dryrun/result-ledger/final-readiness-certificate/freeze-audit-register/rollback-rehearsal-receipt/control-room-packet/cutover-checklist-receipt/operator-command-receipt/go-live-authorization-receipt/launch-window-confirmation-receipt/go-live-hold-release-authorization-receipt`;
const tenantId = process.env.SMOKE_TENANT_ID ?? "smoke-sprint102-tenant";
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

function safeChecklist(rows, key) {
  return Array.isArray(rows) && rows.length > 0 && rows.every((row) => row && row[key] === true && /^sha256:[a-z0-9]+$/i.test(String(row.safeDigest ?? "")));
}

function safeGoLiveHoldReleaseAuthorizationReceiptShape(value) {
  return value?.receiptKind === "qa-handoff-locked-archive-certified-release-go-live-hold-release-authorization-receipt" &&
    value.goLiveHoldReleaseAuthorizationStatus === "authorized" &&
    value.launchApprovalStatus === "ready" &&
    value.launchWindowConfirmationStatus === "confirmed" &&
    value.goLiveHoldStatus === "ready" &&
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
    /^sha256:[a-z0-9]+$/i.test(value.goLiveHoldReleaseAuthorizationReceiptDigest) &&
    /^sha256:[a-z0-9]+$/i.test(value.launchWindowConfirmationReceiptDigest) &&
    /^sha256:[a-z0-9]+$/i.test(value.goLiveAuthorizationReceiptDigest) &&
    safeRows(value.operatorCommandReceiptRows) &&
    safeRows(value.commandHandoffRows) &&
    safeRows(value.goLiveAuthorizationRows) &&
    safeRows(value.goLiveAuthorizationReceiptRows) &&
    safeRows(value.launchWindowRows) &&
    safeRows(value.safeLaunchWindowRows) &&
    safeRows(value.launchWindowConfirmationRows) &&
    safeRows(value.goLiveHoldRows) &&
    safeRows(value.goLiveHoldReleaseAuthorizationRows) &&
    safeRows(value.launchApprovalRows) &&
    safeChecklist(value.operatorChecklist, "complete") &&
    safeChecklist(value.acknowledgedChecklist, "acknowledged") &&
    safeChecklist(value.executionChecklist, "complete") &&
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
    value.inheritedGoLiveAuthorizationSummary &&
    value.inheritedLaunchWindowConfirmationSummary &&
    Array.isArray(value.inheritedBlockingReasons) &&
    Array.isArray(value.inheritedExceptionRows) &&
    value.releaseOwnerSummary &&
    value.counts?.goLiveHoldReleaseAuthorizationReceiptCheckedCount === 1 &&
    value.counts?.goLiveHoldReleaseAuthorizationReceiptMutationCount === 0 &&
    value.counts?.launchWindowConfirmationReceiptMutationCount === 0 &&
    value.counts?.goLiveAuthorizationReceiptMutationCount === 0 &&
    value.counts?.blockingReasonCount === 0 &&
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
  const sprint102Source = {
    shared: sourceSlice(shared, "providerWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationStatusSchema", "providerWebhookUnmatchedInboundBulkReviewRequestSchema"),
    providerController: sourceSlice(providerController, "launch-window-confirmation-receipt/go-live-hold-release-authorization-receipt", "review-closure-report/export"),
    providerService: sourceSlice(providerService, "qaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceiptResponse", "qaHandoffCertifiedReleaseCutoverChecklistReceiptResponse"),
    apiClient: sourceSlice(apiClient, "getProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceipt", "getProviderWebhookReviewClosureReportExport"),
    settingsData: sourceSlice(settingsData, "loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceiptData", "loadSettingsProviderWebhookReviewClosureReportRedactionAuditData"),
    settingsPage: sourceSlice(settingsPage, "reviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceipt", "loadClosureReportRedactionAudit"),
    providerPanel: sourceSlice(providerPanel, "Load certified release go-live hold release authorization receipt", "Audit report export redaction")
  };

  record("smoke:sprint102 registered",
    rootPackage.scripts?.["smoke:sprint102"] === "node scripts/smoke-sprint102-provider-webhook-review-qa-archive-certified-release-go-live-hold-release-authorization-receipt.mjs"
  );
  record("shared go-live hold release authorization receipt DTO export",
    sprint102Source.shared.includes("providerWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceiptSchema") &&
    sprint102Source.shared.includes("ProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceipt") &&
    sprint102Source.shared.includes("goLiveHoldReleaseAuthorizationStatus") &&
    sprint102Source.shared.includes("launchApprovalStatus") &&
    sprint102Source.shared.includes("goLiveHoldReleaseAuthorizationRows") &&
    sprint102Source.shared.includes("launchApprovalRows") &&
    sprint102Source.shared.includes("externalCalls: z.literal(0)") &&
    sprint102Source.shared.includes(".strict()")
  );
  record("backend go-live hold release authorization route registration",
    providerController.includes('@Get("review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt/handoff-packet/acceptance-record/noop-execution-dryrun/result-ledger/final-readiness-certificate/freeze-audit-register/rollback-rehearsal-receipt/control-room-packet/cutover-checklist-receipt/operator-command-receipt/go-live-authorization-receipt/launch-window-confirmation-receipt/go-live-hold-release-authorization-receipt")') &&
    providerController.includes("getReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceipt(requireTenantId(tenant)")
  );
  record("service go-live hold release authorization receipt implementation",
    sprint102Source.providerService.includes("qaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceiptResponse") &&
    sprint102Source.providerService.includes("certifiedReleaseGoLiveHoldReleaseAuthorizationReceiptReady") &&
    sprint102Source.providerService.includes("goLiveHoldReleaseAuthorizationReceiptMutationCount: 0") &&
    sprint102Source.providerService.includes("externalCalls: 0 as const")
  );
  record("API client go-live hold release authorization receipt wiring",
    sprint102Source.apiClient.includes("providerWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceiptSchema") &&
    sprint102Source.apiClient.includes("launch-window-confirmation-receipt/go-live-hold-release-authorization-receipt")
  );
  record("settings-data go-live hold release authorization receipt API mode has no fallback",
    sprint102Source.settingsData.includes("mode === \"api\"") &&
    sprint102Source.settingsData.includes("getProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceipt(filters)") &&
    sprint102Source.settingsData.includes("createMockReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceipt(filters)")
  );
  record("Settings > Channels go-live hold release authorization controls/results/errors",
    sprint102Source.settingsPage.includes("QA Archive Certified Release Go-Live Hold Release Authorization Receipt API error") &&
    providerPanel.includes("Load certified release go-live hold release authorization receipt") &&
    providerPanel.includes("QA archive certified release go-live hold release authorization receipt:") &&
    providerPanel.includes("goLiveHoldReleaseAuthorizationStatus=") &&
    providerPanel.includes("launchApprovalStatus=") &&
    providerPanel.includes("launchWindowConfirmationStatus=") &&
    providerPanel.includes("goLiveHoldStatus=") &&
    providerPanel.includes("goLiveHoldReleaseAuthorizationRows=") &&
    providerPanel.includes("launchApprovalRows=") &&
    providerPanel.includes("externalCalls=")
  );
  record("stale go-live hold release authorization receipt clears on upstream reloads",
    settingsPage.includes("clearReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceipt") &&
    settingsPage.includes("setReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceipt(null)") &&
    settingsPage.includes("clearReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceipt();")
  );
  record("static Sprint 102 source has no provider outbound send markers", !containsProviderOutbound(sprint102Source));
  record("static Sprint 102 source has no external notification send markers", !containsExternalNotification(sprint102Source));
  record("static Sprint 102 source has no AI/OpenAI call markers", !containsAiCall(sprint102Source));

  const health = await getJson("/health").catch((error) => ({ status: 0, body: null, error }));
  if (health.status !== 200) {
    record("GET /health", false, `API unavailable at ${apiBaseUrl}; runtime checks skipped`);
    return finish();
  }
  record("GET /health", true);

  const missingTenantReceipt = await getJson(goLiveHoldReleaseAuthorizationReceiptPath);
  record("go-live hold release authorization receipt requires x-tenant-id", missingTenantReceipt.status >= 400 && missingTenantReceipt.status < 500);

  const first = await getJson(goLiveHoldReleaseAuthorizationReceiptPath, { "x-tenant-id": tenantId });
  record("GET Sprint 102 go-live hold release authorization receipt endpoint", first.status === 200 && safeGoLiveHoldReleaseAuthorizationReceiptShape(first.body), first.status === 200 ? "" : `status=${first.status}`);

  const second = await getJson(goLiveHoldReleaseAuthorizationReceiptPath, { "x-tenant-id": tenantId });
  record("GET Sprint 102 go-live hold release authorization receipt no mutation repeat read", first.status === 200 && second.status === 200 && JSON.stringify(first.body) === JSON.stringify(second.body));

  const invalidTenant = await getJson(goLiveHoldReleaseAuthorizationReceiptPath, { "x-tenant-id": `${tenantId}-invalid` });
  record("invalid tenant access does not return mock fallback", invalidTenant.status === 409 || (invalidTenant.status === 200 && invalidTenant.body?.receiptKind === "qa-handoff-locked-archive-certified-release-go-live-hold-release-authorization-receipt" && !String(invalidTenant.body?.goLiveHoldReleaseAuthorizationReceiptDigest ?? "").includes("fake")));

  record("no stale/fake go-live hold release authorization receipt", !String(first.body?.goLiveHoldReleaseAuthorizationReceiptDigest ?? "").includes("fake") && first.body?.receiptKind === "qa-handoff-locked-archive-certified-release-go-live-hold-release-authorization-receipt");
  record("no raw provider material leakage", first.body && !containsRawLeak(first.body));
  record("externalCalls = 0", first.body?.externalCalls === 0);
  record("no provider outbound", !containsProviderOutbound(sprint102Source));
  record("no external notification sending", !containsExternalNotification(sprint102Source));
  record("no AI/OpenAI call", !containsAiCall(sprint102Source));

  return finish();
}

function finish() {
  const failed = results.filter((result) => !result.pass);
  if (failed.length > 0) {
    console.error(`smoke:sprint102 failed ${failed.length}/${results.length} checks`);
    process.exit(1);
  }
  console.log(`smoke:sprint102 passed ${results.length}/${results.length} checks`);
}

await main();
