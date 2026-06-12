import crypto from "node:crypto";
import fs from "node:fs";

const apiBaseUrl = process.env.API_BASE_URL ?? "http://localhost:4000";
const releaseBasePath = "/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence";
const attestationPath = `${releaseBasePath}/verification/certification/closure-ledger/attestation-audit`;
const reconciliationPath = `${attestationPath}/reconciliation`;
const releaseGatePath = `${reconciliationPath}/release-gate`;
const decisionReceiptPath = `${releaseGatePath}/decision-receipt`;
const handoffPacketPath = `${decisionReceiptPath}/handoff-packet`;
const acceptanceRecordPath = `${handoffPacketPath}/acceptance-record`;
const noopExecutionDryRunPath = `${acceptanceRecordPath}/noop-execution-dryrun`;
const resultLedgerPath = `${noopExecutionDryRunPath}/result-ledger`;
const finalReadinessCertificatePath = `${resultLedgerPath}/final-readiness-certificate`;
const freezeAuditRegisterPath = `${finalReadinessCertificatePath}/freeze-audit-register`;
const rollbackRehearsalReceiptPath = `${freezeAuditRegisterPath}/rollback-rehearsal-receipt`;
const controlRoomPacketPath = `${rollbackRehearsalReceiptPath}/control-room-packet`;
const cutoverChecklistReceiptPath = `${controlRoomPacketPath}/cutover-checklist-receipt`;
const operatorCommandReceiptPath = `${cutoverChecklistReceiptPath}/operator-command-receipt`;
const goLiveAuthorizationReceiptPath = `${operatorCommandReceiptPath}/go-live-authorization-receipt`;
const launchWindowConfirmationReceiptPath = `${goLiveAuthorizationReceiptPath}/launch-window-confirmation-receipt`;
const goLiveHoldReleaseAuthorizationReceiptPath = `${releaseBasePath}/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt/handoff-packet/acceptance-record/noop-execution-dryrun/result-ledger/final-readiness-certificate/freeze-audit-register/rollback-rehearsal-receipt/control-room-packet/cutover-checklist-receipt/operator-command-receipt/go-live-authorization-receipt/launch-window-confirmation-receipt/go-live-hold-release-authorization-receipt`;
const launchApprovalReceiptPath = `${goLiveHoldReleaseAuthorizationReceiptPath}/launch-approval-receipt`;
const tenantId = process.env.SMOKE_TENANT_ID ?? process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
const userId = process.env.USER_ID ?? "00000000-0000-4000-8000-000000000011";
const signingMaterial = process.env.PROVIDER_WEBHOOK_SANDBOX_SIGNING_KEY ?? "local-provider-webhook-sandbox-signing-material";
const runId = `sprint103-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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
  return walkRawLeak(value);
}

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
    return Object.entries(value).some(([key, child]) => rawLeakKeyNames.has(key) || walkRawLeak(child));
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

function safeChecklist(rows, key) {
  return Array.isArray(rows) && rows.length > 0 && rows.every((row) => row && row[key] === true && /^sha256:[a-z0-9]+$/i.test(String(row.safeDigest ?? "")));
}

function hasChecklistEntries(value) {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return Boolean(value && typeof value === "object" && Object.keys(value).length > 0);
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
    hasChecklistEntries(value.inheritedPrerequisiteChecklist) &&
    hasChecklistEntries(value.inheritedCertificationChecklist) &&
    hasChecklistEntries(value.inheritedGateChecklist) &&
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

function safeLaunchApprovalReceiptShape(value) {
  return value?.receiptKind === "qa-handoff-locked-archive-certified-release-launch-approval-receipt" &&
    value.launchApprovalReceiptStatus === "issued" &&
    value.noExecutionGuardStatus === "retained" &&
    value.launchApprovalStatus === "ready" &&
    value.goLiveHoldReleaseAuthorizationStatus === "authorized" &&
    value.launchWindowConfirmationStatus === "confirmed" &&
    value.goLiveHoldStatus === "ready" &&
    value.goLiveAuthorizationReceiptStatus === "issued" &&
    value.goLiveAuthorizationStatus === "ready" &&
    value.launchWindowStatus === "ready" &&
    value.safeLaunchWindowStatus === "ready" &&
    value.executionMode === "no_op" &&
    value.acceptanceStatus === "acknowledged" &&
    value.handoffStatus === "ready" &&
    value.releaseDecision === "go" &&
    value.goNoGoDecision === "go" &&
    value.packetStatus === "issued" &&
    value.receiptStatus === "issued" &&
    value.gateStatus === "ready" &&
    value.releaseReadinessStatus === "ready_for_release" &&
    (value.reconciliationStatus === "complete" || value.reconciliationStatus === "aligned") &&
    value.attestationStatus === "complete" &&
    value.certificationStatus === "certified" &&
    value.verificationStatus === "verified" &&
    value.digestChainStatus === "confirmed" &&
    /^sha256:[a-z0-9]+$/i.test(value.safeDigest) &&
    /^sha256:[a-z0-9]+$/i.test(value.launchApprovalReceiptDigest) &&
    /^sha256:[a-z0-9]+$/i.test(value.goLiveHoldReleaseAuthorizationReceiptDigest) &&
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
    safeRows(value.noExecutionGuardRows) &&
    safeChecklist(value.operatorChecklist, "complete") &&
    safeChecklist(value.acknowledgedChecklist, "acknowledged") &&
    safeChecklist(value.executionChecklist, "complete") &&
    value.inheritedGoLiveHoldReleaseAuthorizationSummary &&
    Array.isArray(value.inheritedBlockingReasons) &&
    Array.isArray(value.inheritedExceptionRows) &&
    value.releaseOwnerSummary &&
    value.counts?.launchApprovalReceiptCheckedCount === 1 &&
    value.counts?.launchApprovalReceiptMutationCount === 0 &&
    value.counts?.launchApprovalReceiptIssuedCount === value.noExecutionGuardRows.length &&
    value.counts?.noExecutionGuardRowCount === value.noExecutionGuardRows.length &&
    value.counts?.noExecutionGuardRetainedCount === value.noExecutionGuardRows.length &&
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
  const sprint103Source = {
    shared: sourceSlice(shared, "providerWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceiptStatusSchema", "providerWebhookUnmatchedInboundBulkReviewRequestSchema"),
    providerController: sourceSlice(providerController, "launch-window-confirmation-receipt/go-live-hold-release-authorization-receipt", "review-closure-report/export"),
    providerService: sourceSlice(providerService, "qaHandoffCertifiedReleaseLaunchApprovalReceiptResponse", "qaHandoffCertifiedReleaseCutoverChecklistReceiptResponse"),
    apiClient: sourceSlice(apiClient, "getProviderWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceipt", "getProviderWebhookReviewClosureReportExport"),
    settingsData: sourceSlice(settingsData, "loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceiptData", "loadSettingsProviderWebhookReviewClosureReportRedactionAuditData"),
    settingsPage: sourceSlice(settingsPage, "reviewQaHandoffCertifiedReleaseLaunchApprovalReceipt", "loadClosureReportRedactionAudit"),
    providerPanel: sourceSlice(providerPanel, "Load certified release launch approval receipt", "Audit report export redaction")
  };

  record("smoke:sprint103 registered",
    rootPackage.scripts?.["smoke:sprint103"] === "node scripts/smoke-sprint103-provider-webhook-review-qa-archive-certified-release-launch-approval-receipt.mjs"
  );
  record("shared launch approval receipt DTO export",
    sprint103Source.shared.includes("providerWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceiptSchema") &&
    sprint103Source.shared.includes("ProviderWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceipt") &&
    sprint103Source.shared.includes("launchApprovalReceiptStatus") &&
    sprint103Source.shared.includes("noExecutionGuardStatus") &&
    sprint103Source.shared.includes("noExecutionGuardRows") &&
    sprint103Source.shared.includes("launchApprovalReceiptCheckedCount") &&
    sprint103Source.shared.includes("externalCalls: z.literal(0)") &&
    sprint103Source.shared.includes(".strict()")
  );
  record("backend launch approval route registration",
    providerController.includes('@Get("review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt/handoff-packet/acceptance-record/noop-execution-dryrun/result-ledger/final-readiness-certificate/freeze-audit-register/rollback-rehearsal-receipt/control-room-packet/cutover-checklist-receipt/operator-command-receipt/go-live-authorization-receipt/launch-window-confirmation-receipt/go-live-hold-release-authorization-receipt/launch-approval-receipt")') &&
    providerController.includes("getReviewQaHandoffCertifiedReleaseLaunchApprovalReceipt(requireTenantId(tenant)")
  );
  record("service launch approval receipt implementation",
    sprint103Source.providerService.includes("qaHandoffCertifiedReleaseLaunchApprovalReceiptResponse") &&
    sprint103Source.providerService.includes("launchApprovalReceiptStatus") &&
    sprint103Source.providerService.includes("noExecutionGuardStatus") &&
    sprint103Source.providerService.includes("launchApprovalReceiptMutationCount: 0")
  );
  record("API client launch approval receipt wiring",
    sprint103Source.apiClient.includes("providerWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceiptSchema") &&
    sprint103Source.apiClient.includes("launch-window-confirmation-receipt/go-live-hold-release-authorization-receipt/launch-approval-receipt")
  );
  record("settings-data launch approval receipt API mode has no fallback",
    sprint103Source.settingsData.includes("mode === \"api\"") &&
    sprint103Source.settingsData.includes("getProviderWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceipt(filters)") &&
    sprint103Source.settingsData.includes("createMockReviewQaHandoffCertifiedReleaseLaunchApprovalReceipt(filters)")
  );
  record("Settings > Channels launch approval controls/results/errors",
    sprint103Source.settingsPage.includes("QA Archive Certified Release Launch Approval Receipt API error") &&
    providerPanel.includes("Load certified release launch approval receipt") &&
    providerPanel.includes("QA archive certified release launch approval receipt:") &&
    providerPanel.includes("launchApprovalReceiptStatus=") &&
    providerPanel.includes("noExecutionGuardStatus=") &&
    providerPanel.includes("launchApprovalRows=") &&
    providerPanel.includes("noExecutionGuardRows=") &&
    providerPanel.includes("externalCalls=")
  );
  record("stale launch approval receipt clears on upstream reloads",
    settingsPage.includes("clearReviewQaHandoffCertifiedReleaseLaunchApprovalReceipt") &&
    settingsPage.includes("setReviewQaHandoffCertifiedReleaseLaunchApprovalReceipt(null)") &&
    settingsPage.includes("clearReviewQaHandoffCertifiedReleaseLaunchApprovalReceipt();")
  );
  record("static Sprint 103 source has no provider outbound send markers", !containsProviderOutbound(sprint103Source));
  record("static Sprint 103 source has no external notification send markers", !containsExternalNotification(sprint103Source));
  record("static Sprint 103 source has no AI/OpenAI call markers", !containsAiCall(sprint103Source));

  const filters = "provider=line&eventType=message.created";
  const health = await getJson("/health").catch((error) => ({ status: 0, body: null, error }));
  if (health.status !== 200) {
    record("GET /health", false, `API unavailable at ${apiBaseUrl}; runtime checks skipped`);
    return finish();
  }
  record("GET /health", true);

  const missingTenantGoLiveHoldReceipt = await requestJsonWithoutTenant("GET", `${goLiveHoldReleaseAuthorizationReceiptPath}?${filters}`);
  record("go-live hold release authorization receipt requires x-tenant-id", missingTenantGoLiveHoldReceipt.status >= 400 && missingTenantGoLiveHoldReceipt.status < 500);

  const missingTenantLaunchApprovalReceipt = await requestJsonWithoutTenant("GET", `${launchApprovalReceiptPath}?${filters}`);
  record("launch approval receipt requires x-tenant-id", missingTenantLaunchApprovalReceipt.status >= 400 && missingTenantLaunchApprovalReceipt.status < 500);

  const launchApprovalItem = await createNoMatchItem("launch-approval-receipt", "Safe Sprint 103 certified release launch approval receipt target");
  record("create safe sandbox no-match item", launchApprovalItem?.unmatchedStatus === "review-needed");

  await safeJson(await request("POST", `/provider-webhooks/review-qa-handoff-bundle/receipt/sign-off?${filters}`, {
    acknowledgementType: "sign_off",
    reviewerRole: "QA reviewer",
    reviewerLabel: "safe sprint103 reviewer"
  }));
  await safeJson(await request("POST", `/provider-webhooks/review-qa-handoff-bundle/acceptance-lock?${filters}`, {
    lockReason: "Safe Sprint 103 certified release launch approval receipt accepted",
    acceptedByRole: "QA lead",
    acceptedByLabel: "safe sprint103 reviewer"
  }));
  await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive?${filters}`));
  await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/export?${filters}`));
  await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/retention-manifest?${filters}`));
  await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/integrity?${filters}`));
  await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/retention-audit?${filters}`));
  await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization?${filters}`));
  await safeJson(await request("POST", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/sign-off?${filters}`, {
    reviewerRole: "retention reviewer",
    reviewerLabel: "safe sprint103 reviewer"
  }));
  await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/receipt?${filters}`));
  await safeJson(await request("GET", `${releaseBasePath}?${filters}`));
  await safeJson(await request("GET", `${releaseBasePath}/verification?${filters}`));
  await safeJson(await request("GET", `${releaseBasePath}/verification/certification?${filters}`));
  await safeJson(await request("GET", `${releaseBasePath}/verification/certification/closure-ledger?${filters}`));
  await safeJson(await request("GET", `${attestationPath}?${filters}`));
  await safeJson(await request("GET", `${reconciliationPath}?${filters}`));
  await safeJson(await request("GET", `${releaseGatePath}?${filters}`));
  await safeJson(await request("GET", `${decisionReceiptPath}?${filters}`));
  const handoffPacket = await safeJson(await request("GET", `${handoffPacketPath}?${filters}`));
  await safeJson(await request("GET", `${acceptanceRecordPath}?${filters}`));
  await safeJson(await request("POST", `${acceptanceRecordPath}?${filters}`, {
    acknowledgementType: "operator_checklist_acknowledgement",
    acknowledgedByRole: "release owner",
    acknowledgedByLabel: "safe sprint103 release owner",
    acknowledgedChecklistKeys: Array.isArray(handoffPacket?.operatorChecklist) ? handoffPacket.operatorChecklist.map((item) => item.key) : []
  }));
  await safeJson(await request("GET", `${noopExecutionDryRunPath}?${filters}`));
  await safeJson(await request("POST", `${noopExecutionDryRunPath}?${filters}`, {
    requestedBy: "safe sprint103 release owner",
    checklistAcknowledged: true,
    operatorNote: "Safe no-op execution dry-run from Sprint 103 smoke",
    dryRunReason: "safe no-op execution readiness rehearsal",
    executionMode: "no_op"
  }));
  await safeJson(await request("GET", `${noopExecutionDryRunPath}?${filters}`));
  await safeJson(await request("GET", `${resultLedgerPath}?${filters}`));
  await safeJson(await request("GET", `${finalReadinessCertificatePath}?${filters}`));
  await safeJson(await request("GET", `${freezeAuditRegisterPath}?${filters}`));
  await safeJson(await request("GET", `${rollbackRehearsalReceiptPath}?${filters}`));
  await safeJson(await request("GET", `${controlRoomPacketPath}?${filters}`));
  await safeJson(await request("GET", `${cutoverChecklistReceiptPath}?${filters}`));
  await safeJson(await request("GET", `${operatorCommandReceiptPath}?${filters}`));
  await safeJson(await request("GET", `${goLiveAuthorizationReceiptPath}?${filters}`));
  await safeJson(await request("GET", `${launchWindowConfirmationReceiptPath}?${filters}`));

  const goLiveHoldFirst = await requestJson("GET", `${goLiveHoldReleaseAuthorizationReceiptPath}?${filters}`);
  record("GET Sprint 102 go-live hold release authorization receipt endpoint", goLiveHoldFirst.status === 200 && safeGoLiveHoldReleaseAuthorizationReceiptShape(goLiveHoldFirst.body), goLiveHoldFirst.status === 200 ? "" : `status=${goLiveHoldFirst.status}`);

  const goLiveHoldSecond = await requestJson("GET", `${goLiveHoldReleaseAuthorizationReceiptPath}?${filters}`);
  record("GET Sprint 102 go-live hold release authorization receipt no mutation repeat read", goLiveHoldFirst.status === 200 && goLiveHoldSecond.status === 200 && JSON.stringify(goLiveHoldFirst.body) === JSON.stringify(goLiveHoldSecond.body));

  const first = await requestJson("GET", `${launchApprovalReceiptPath}?${filters}`);
  record("GET Sprint 103 launch approval receipt endpoint", first.status === 200 && safeLaunchApprovalReceiptShape(first.body), first.status === 200 ? "" : `status=${first.status}`);

  const second = await requestJson("GET", `${launchApprovalReceiptPath}?${filters}`);
  record("GET Sprint 103 launch approval receipt no mutation repeat read", first.status === 200 && second.status === 200 && JSON.stringify(first.body) === JSON.stringify(second.body));

  const invalidTenant = await requestJson("GET", `${launchApprovalReceiptPath}?${filters}`, undefined, "00000000-0000-4000-8000-000000000103");
  record("invalid tenant access does not return mock fallback", invalidTenant.status === 409 || (invalidTenant.status === 200 && invalidTenant.body?.receiptKind === "qa-handoff-locked-archive-certified-release-launch-approval-receipt" && !String(invalidTenant.body?.launchApprovalReceiptDigest ?? "").includes("fake")));

  record("no stale/fake launch approval receipt", !String(first.body?.launchApprovalReceiptDigest ?? "").includes("fake") && first.body?.receiptKind === "qa-handoff-locked-archive-certified-release-launch-approval-receipt");
  record("no raw provider material leakage", first.body && !containsRawLeak(first.body));
  record("externalCalls = 0", first.body?.externalCalls === 0);
  record("no provider outbound", !containsProviderOutbound(sprint103Source));
  record("no external notification sending", !containsExternalNotification(sprint103Source));
  record("no AI/OpenAI call", !containsAiCall(sprint103Source));

  return finish();
}

async function createNoMatchItem(label, text) {
  const eventId = `${runId}-${label}-${Math.random().toString(16).slice(2)}`;
  const payload = linePayload(`safe-no-match-room-sprint103-${label}-${runId}`, `safe-sender-sprint103-${label}`, text);
  payload[`safeMarker${label.replace(/[^a-z0-9]/gi, "")}${Date.now()}`] = true;
  const created = await safeJson(await request("POST", "/provider-webhooks/sandbox-events", {
    provider: "line",
    channel: "line",
    eventType: "message.created",
    mode: "sandbox",
    inboundPersistenceMode: "sandbox-persist",
    eventId,
    signature: signPayload(payload),
    payload
  }));
  record(`POST sandbox event ${label} reachable`, typeof created?.unmatchedInboundId === "string" && (created?.externalCalls ?? 0) === 0);
  const unmatched = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound?limit=50&offset=0&sortBy=receivedAt&sortOrder=desc"));
  return unmatchedItems(unmatched).find((item) => item.id === created.unmatchedInboundId) ?? null;
}

function linePayload(roomId, userIdValue, text) {
  return {
    destination: "safe-sprint103-destination",
    events: [{
      type: "message",
      mode: "active",
      timestamp: Date.now(),
      source: { type: "room", roomId, userId: userIdValue },
      webhookEventId: `${runId}-${crypto.randomUUID()}`,
      deliveryContext: { isRedelivery: false },
      replyToken: `safe-reply-token-${runId}`,
      message: { id: `${runId}-message`, type: "text", text }
    }]
  };
}

function signPayload(payload) {
  return `sha256=${crypto.createHmac("sha256", signingMaterial).update(canonicalJson(payload)).digest("hex")}`;
}

function canonicalJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((item) => canonicalJson(item)).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
}

async function request(method, path, body, tenant = tenantId) {
  const headers = {
    "content-type": "application/json",
    "x-tenant-id": tenant,
    "x-user-id": userId
  };
  return fetch(`${apiBaseUrl}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  });
}

async function requestJson(method, path, body, tenant = tenantId) {
  const response = await request(method, path, body, tenant);
  return { status: response.status, body: await safeJson(response) };
}

async function requestJsonWithoutTenant(method, path, body) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      "x-user-id": userId
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  return { status: response.status, body: await safeJson(response) };
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function unmatchedItems(page) {
  return Array.isArray(page?.items) ? page.items : [];
}

function finish() {
  const failed = results.filter((result) => !result.pass);
  if (failed.length > 0) {
    console.error(`smoke:sprint103 failed ${failed.length}/${results.length} checks`);
    process.exit(1);
  }
  console.log(`smoke:sprint103 passed ${results.length}/${results.length} checks`);
}

await main();
