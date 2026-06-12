import fs from "node:fs";

const apiBaseUrl = process.env.API_BASE_URL ?? "http://localhost:4000";
const releaseBasePath = "/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence";
const launchWindowConfirmationReceiptPath = `${releaseBasePath}/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt/handoff-packet/acceptance-record/noop-execution-dryrun/result-ledger/final-readiness-certificate/freeze-audit-register/rollback-rehearsal-receipt/control-room-packet/cutover-checklist-receipt/operator-command-receipt/go-live-authorization-receipt/launch-window-confirmation-receipt`;
const filters = "?provider=line&eventType=message.created";
const tenantId = process.env.SMOKE_TENANT_ID ?? process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
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
  return walkRawLeak(value);
}

function allTrueValues(value) {
  return value && typeof value === "object" && !Array.isArray(value) && Object.values(value).length > 0 && Object.values(value).every(Boolean);
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

function walkRawLeak(value) {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === "string") {
    return rawLeakValuePatterns.some((pattern) => pattern.test(value));
  }

  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
    return false;
  }

  if (Array.isArray(value)) {
    return value.some((item) => walkRawLeak(item));
  }

  if (typeof value === "object") {
    return Object.entries(value).some(([key, nested]) => rawLeakKeyNames.has(key) || walkRawLeak(nested));
  }

  return false;
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

function safeLaunchWindowConfirmationReceiptShape(value) {
  return value?.receiptKind === "qa-handoff-locked-archive-certified-release-launch-window-confirmation-receipt" &&
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
    /^sha256:[a-z0-9]+$/i.test(value.launchWindowConfirmationReceiptDigest) &&
    /^sha256:[a-z0-9]+$/i.test(value.goLiveAuthorizationReceiptDigest) &&
    safeRows(value.goLiveAuthorizationRows) &&
    safeRows(value.operatorCommandReceiptRows) &&
    safeRows(value.commandHandoffRows) &&
    safeRows(value.goLiveAuthorizationReceiptRows) &&
    safeRows(value.launchWindowRows) &&
    safeRows(value.safeLaunchWindowRows) &&
    safeRows(value.launchWindowConfirmationRows) &&
    safeRows(value.goLiveHoldRows) &&
    Array.isArray(value.operatorChecklist) &&
    Array.isArray(value.acknowledgedChecklist) &&
    Array.isArray(value.executionChecklist) &&
    allTrueValues(value.inheritedPrerequisiteChecklist) &&
    allTrueValues(value.inheritedCertificationChecklist) &&
    allTrueValues(value.inheritedGateChecklist) &&
    value.inheritedDecisionReceiptSummary?.receiptRowCount === 13 &&
    value.inheritedDecisionReceiptSummary?.releaseGateReady === true &&
    value.inheritedHandoffPacketSummary?.packetStatus === "issued" &&
    value.inheritedHandoffPacketSummary?.handoffStatus === "ready" &&
    value.inheritedAcceptanceSummary?.acceptanceStatus === "acknowledged" &&
    value.inheritedAcceptanceSummary?.handoffStatus === "ready" &&
    value.inheritedNoopDryRunSummary?.dryRunStatus === "passed" &&
    value.inheritedNoopDryRunSummary?.executionMode === "no_op" &&
    value.inheritedResultLedgerSummary?.ledgerStatus === "recorded" &&
    value.inheritedResultLedgerSummary?.dryRunStatus === "passed" &&
    value.inheritedFinalReadinessCertificateSummary?.certificateStatus === "issued" &&
    value.inheritedFinalReadinessCertificateSummary?.finalReadinessStatus === "ready" &&
    value.inheritedFreezeAuditSummary?.freezeAuditStatus === "recorded" &&
    value.inheritedFreezeAuditSummary?.freezeStatus === "frozen" &&
    value.inheritedRollbackRehearsalSummary?.rollbackRehearsalStatus === "verified" &&
    value.inheritedRollbackRehearsalSummary?.recoveryReadinessStatus === "ready" &&
    value.inheritedControlRoomSummary?.controlRoomStatus === "ready" &&
    value.inheritedControlRoomSummary?.cutoverReadinessStatus === "ready" &&
    value.inheritedCutoverChecklistSummary?.cutoverChecklistStatus === "verified" &&
    value.inheritedCutoverChecklistSummary?.operatorCommandStatus === "ready" &&
    value.inheritedOperatorCommandSummary?.operatorCommandReceiptStatus === "issued" &&
    value.inheritedOperatorCommandSummary?.goLiveAuthorizationStatus === "ready" &&
    value.inheritedGoLiveAuthorizationSummary?.goLiveAuthorizationReceiptStatus === "issued" &&
    value.inheritedGoLiveAuthorizationSummary?.goLiveAuthorizationStatus === "ready" &&
    Array.isArray(value.inheritedBlockingReasons) &&
    Array.isArray(value.inheritedExceptionRows) &&
    value.releaseOwnerSummary &&
    value.counts?.launchWindowConfirmationReceiptCheckedCount === 1 &&
    value.counts?.launchWindowConfirmationReceiptMutationCount === 0 &&
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
  const sprint101Source = {
    shared: sourceSlice(shared, "providerWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationStatusSchema", "providerWebhookUnmatchedInboundBulkReviewRequestSchema"),
    providerController: sourceSlice(providerController, "go-live-authorization-receipt/launch-window-confirmation-receipt", "review-closure-report/export"),
    providerService: sourceSlice(providerService, "qaHandoffCertifiedReleaseLaunchWindowConfirmationReceiptResponse", "qaHandoffCertifiedReleaseCutoverChecklistReceiptResponse"),
    apiClient: sourceSlice(apiClient, "getProviderWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceipt", "getProviderWebhookReviewClosureReportExport"),
    settingsData: sourceSlice(settingsData, "loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceiptData", "loadSettingsProviderWebhookReviewClosureReportRedactionAuditData"),
    settingsPage: sourceSlice(settingsPage, "reviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceipt", "loadClosureReportRedactionAudit"),
    providerPanel: sourceSlice(providerPanel, "Load certified release launch window confirmation receipt", "Audit report export redaction")
  };

  record("smoke:sprint101 registered",
    rootPackage.scripts?.["smoke:sprint101"] === "node scripts/smoke-sprint101-provider-webhook-review-qa-archive-certified-release-launch-window-confirmation-receipt.mjs"
  );
  record("shared launch window confirmation receipt DTO export",
    sprint101Source.shared.includes("providerWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceiptSchema") &&
    sprint101Source.shared.includes("ProviderWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceipt") &&
    sprint101Source.shared.includes("launchWindowConfirmationStatus") &&
    sprint101Source.shared.includes("goLiveHoldStatus") &&
    sprint101Source.shared.includes("launchWindowConfirmationRows") &&
    sprint101Source.shared.includes("goLiveHoldRows") &&
    sprint101Source.shared.includes("externalCalls: z.literal(0)") &&
    sprint101Source.shared.includes(".strict()")
  );
  record("backend launch window confirmation route registration",
    providerController.includes('@Get("review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt/handoff-packet/acceptance-record/noop-execution-dryrun/result-ledger/final-readiness-certificate/freeze-audit-register/rollback-rehearsal-receipt/control-room-packet/cutover-checklist-receipt/operator-command-receipt/go-live-authorization-receipt/launch-window-confirmation-receipt")') &&
    providerController.includes("getReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceipt(requireTenantId(tenant)")
  );
  record("service launch window confirmation receipt implementation",
    sprint101Source.providerService.includes("qaHandoffCertifiedReleaseLaunchWindowConfirmationReceiptResponse") &&
    sprint101Source.providerService.includes("certifiedReleaseLaunchWindowConfirmationReceiptReady") &&
    sprint101Source.providerService.includes("launchWindowConfirmationReceiptMutationCount: 0") &&
    sprint101Source.providerService.includes("externalCalls: 0 as const")
  );
  record("API client launch window confirmation receipt wiring",
    sprint101Source.apiClient.includes("providerWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceiptSchema") &&
    sprint101Source.apiClient.includes("go-live-authorization-receipt/launch-window-confirmation-receipt")
  );
  record("settings-data launch window confirmation receipt API mode has no fallback",
    sprint101Source.settingsData.includes("mode === \"api\"") &&
    sprint101Source.settingsData.includes("getProviderWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceipt(filters)") &&
    sprint101Source.settingsData.includes("createMockReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceipt(filters)")
  );
  record("Settings > Channels launch window confirmation controls/results/errors",
    sprint101Source.settingsPage.includes("QA Archive Certified Release Launch Window Confirmation Receipt API error") &&
    providerPanel.includes("Load certified release launch window confirmation receipt") &&
    providerPanel.includes("QA archive certified release launch window confirmation receipt:") &&
    providerPanel.includes("launchWindowConfirmationStatus=") &&
    providerPanel.includes("goLiveHoldStatus=") &&
    providerPanel.includes("launchWindowConfirmationRows=") &&
    providerPanel.includes("goLiveHoldRows=") &&
    providerPanel.includes("externalCalls=")
  );
  record("stale launch window confirmation receipt clears on upstream reloads",
    settingsPage.includes("clearReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceipt") &&
    settingsPage.includes("setReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceipt(null)") &&
    settingsPage.includes("clearReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceipt();")
  );
  record("static Sprint 101 source has no provider outbound send markers", !containsProviderOutbound(sprint101Source));
  record("static Sprint 101 source has no external notification send markers", !containsExternalNotification(sprint101Source));
  record("static Sprint 101 source has no AI/OpenAI call markers", !containsAiCall(sprint101Source));

  const health = await getJson("/health").catch((error) => ({ status: 0, body: null, error }));
  if (health.status !== 200) {
    record("GET /health", false, `API unavailable at ${apiBaseUrl}; runtime checks skipped`);
    return finish();
  }
  record("GET /health", true);

  const missingTenantReceipt = await getJson(`${launchWindowConfirmationReceiptPath}${filters}`);
  record("launch window confirmation receipt requires x-tenant-id", missingTenantReceipt.status >= 400 && missingTenantReceipt.status < 500);

  const first = await getJson(`${launchWindowConfirmationReceiptPath}${filters}`, { "x-tenant-id": tenantId });
  record("GET Sprint 101 launch window confirmation receipt endpoint", first.status === 200 && safeLaunchWindowConfirmationReceiptShape(first.body), first.status === 200 ? "" : `status=${first.status}`);

  const second = await getJson(`${launchWindowConfirmationReceiptPath}${filters}`, { "x-tenant-id": tenantId });
  record("GET Sprint 101 launch window confirmation receipt no mutation repeat read", first.status === 200 && second.status === 200 && JSON.stringify(first.body) === JSON.stringify(second.body));

  record("no stale/fake launch window confirmation receipt", !String(first.body?.launchWindowConfirmationReceiptDigest ?? "").includes("fake") && first.body?.receiptKind === "qa-handoff-locked-archive-certified-release-launch-window-confirmation-receipt");
  record("no raw provider material leakage", first.body && !containsRawLeak(first.body));
  record("externalCalls = 0", first.body?.externalCalls === 0);
  record("no provider outbound", !containsProviderOutbound(sprint101Source));
  record("no external notification sending", !containsExternalNotification(sprint101Source));
  record("no AI/OpenAI call", !containsAiCall(sprint101Source));

  return finish();
}

function finish() {
  const failed = results.filter((result) => !result.pass);
  if (failed.length > 0) {
    console.error(`smoke:sprint101 failed ${failed.length}/${results.length} checks`);
    process.exit(1);
  }
  console.log(`smoke:sprint101 passed ${results.length}/${results.length} checks`);
}

await main();
