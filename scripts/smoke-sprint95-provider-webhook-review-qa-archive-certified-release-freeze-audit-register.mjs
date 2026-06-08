import crypto from "node:crypto";
import { readFileSync } from "node:fs";

const baseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");
const tenantId = process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
const userId = process.env.USER_ID ?? "00000000-0000-4000-8000-000000000011";
const signingMaterial = process.env.PROVIDER_WEBHOOK_SANDBOX_SIGNING_KEY ?? "local-provider-webhook-sandbox-signing-material";
const runId = `sprint95-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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
const results = [];

async function main() {
  record("local API only", isLocalBaseUrl(baseUrl));

  const rootPackage = JSON.parse(readFileSync("package.json", "utf8"));
  const shared = readFileSync("packages/shared/src/index.ts", "utf8");
  const providerController = readFileSync("apps/api/src/controllers/provider-webhooks.controller.ts", "utf8");
  const providerService = readFileSync("apps/api/src/services/provider-webhook-events.service.ts", "utf8");
  const apiClient = readFileSync("apps/web/app/api-client.ts", "utf8");
  const settingsData = readFileSync("apps/web/app/settings-data.ts", "utf8");
  const settingsPage = readFileSync("apps/web/app/settings/channels/page.tsx", "utf8");
  const providerPanel = readFileSync("apps/web/app/settings/provider-readiness-panel.tsx", "utf8");
  const sprint95Source = {
    shared: sourceSlice(shared, "providerWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegisterStatusSchema", "providerWebhookUnmatchedInboundBulkReviewRequestSchema"),
    providerController: sourceSlice(providerController, "final-readiness-certificate", "review-closure-report/export"),
    providerService: [
      sourceSlice(providerService, "getReviewQaHandoffCertifiedReleaseDryRunResultLedger(", "private getLockedArchiveContext"),
      sourceSlice(providerService, "function qaHandoffCertifiedReleaseFinalReadinessCertificateResponse", "function safeRoomLabel")
    ].join("\n"),
    apiClient: sourceSlice(apiClient, "getProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificate", "getProviderWebhookReviewClosureReportExport"),
    settingsData: [
      sourceSlice(settingsData, "loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificateData", "loadSettingsProviderWebhookReviewClosureReportRedactionAuditData"),
      sourceSlice(settingsData, "function createMockReviewQaHandoffCertifiedReleaseFinalReadinessCertificate", "function createMockReleaseAttestationAuditRow")
    ].join("\n"),
    settingsPage: [
      sourceSlice(settingsPage, "reviewQaHandoffCertifiedReleaseDryRunResultLedger", "reviewClosureReportRedactionAudit"),
      sourceSlice(settingsPage, "loadReviewQaHandoffCertifiedReleaseFinalReadinessCertificate", "loadClosureReportRedactionAudit")
    ].join("\n"),
    providerPanel: [
      sourceSlice(providerPanel, "Load certified release no-op execution dry-run", "Audit report export redaction"),
      sourceSlice(providerPanel, "QA archive certified release dry-run result ledger:", "reviewQaHandoffLockedArchive ?")
    ].join("\n")
  };

  record("smoke:sprint95 registered",
    rootPackage.scripts?.["smoke:sprint95"] === "node scripts/smoke-sprint95-provider-webhook-review-qa-archive-certified-release-freeze-audit-register.mjs"
  );
  record("Sprint 94/93/92/91/90/89/88/87/86/85/84/83/82/81/80/79/78/77/76/75 regression smoke scripts registered", [
    ["smoke:sprint94", "node scripts/smoke-sprint94-provider-webhook-review-qa-archive-certified-release-final-readiness-certificate.mjs"],
    ["smoke:sprint93", "node scripts/smoke-sprint93-provider-webhook-review-qa-archive-certified-release-dryrun-result-ledger.mjs"],
    ["smoke:sprint92", "node scripts/smoke-sprint92-provider-webhook-review-qa-archive-certified-release-noop-execution-dryrun.mjs"],
    ["smoke:sprint91", "node scripts/smoke-sprint91-provider-webhook-review-qa-archive-certified-release-handoff-acceptance-record.mjs"],
    ["smoke:sprint90", "node scripts/smoke-sprint90-provider-webhook-review-qa-archive-certified-release-handoff-packet.mjs"],
    ["smoke:sprint89", "node scripts/smoke-sprint89-provider-webhook-review-qa-archive-certified-release-decision-receipt.mjs"],
    ["smoke:sprint88", "node scripts/smoke-sprint88-provider-webhook-review-qa-archive-certified-release-gate.mjs"],
    ["smoke:sprint87", "node scripts/smoke-sprint87-provider-webhook-review-qa-archive-certified-release-attestation-reconciliation.mjs"],
    ["smoke:sprint86", "node scripts/smoke-sprint86-provider-webhook-review-qa-archive-certified-release-attestation-audit.mjs"],
    ["smoke:sprint85", "node scripts/smoke-sprint85-provider-webhook-review-qa-archive-certified-release-closure-ledger.mjs"],
    ["smoke:sprint84", "node scripts/smoke-sprint84-provider-webhook-review-qa-archive-release-certification-receipt.mjs"],
    ["smoke:sprint83", "node scripts/smoke-sprint83-provider-webhook-review-qa-archive-release-verification-matrix.mjs"],
    ["smoke:sprint82", "node scripts/smoke-sprint82-provider-webhook-review-qa-archive-release-evidence-pack.mjs"],
    ["smoke:sprint81", "node scripts/smoke-sprint81-provider-webhook-review-qa-archive-finalization-signoff.mjs"],
    ["smoke:sprint80", "node scripts/smoke-sprint80-provider-webhook-review-qa-archive-integrity-retention-audit.mjs"],
    ["smoke:sprint79", "node scripts/smoke-sprint79-provider-webhook-review-qa-handoff-locked-archive-export.mjs"],
    ["smoke:sprint78", "node scripts/smoke-sprint78-provider-webhook-review-qa-handoff-acceptance-lock.mjs"],
    ["smoke:sprint77", "node scripts/smoke-sprint77-provider-webhook-review-qa-handoff-receipt-signoff.mjs"],
    ["smoke:sprint76", "node scripts/smoke-sprint76-provider-webhook-review-qa-handoff-bundle-export.mjs"],
    ["smoke:sprint75", "node scripts/smoke-sprint75-provider-webhook-review-qa-handoff-bundle.mjs"]
  ].every(([name, command]) => rootPackage.scripts?.[name] === command));
  record("shared freeze audit register DTO export",
    sprint95Source.shared.includes("providerWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegisterSchema") &&
    sprint95Source.shared.includes("ProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister") &&
    sprint95Source.shared.includes("freezeAuditStatus") &&
    sprint95Source.shared.includes("freezeStatus") &&
    sprint95Source.shared.includes("rollbackReadinessStatus") &&
    sprint95Source.shared.includes("freezeAuditRows") &&
    sprint95Source.shared.includes("rollbackPlanRows") &&
    sprint95Source.shared.includes("inheritedFinalReadinessCertificateSummary") &&
    sprint95Source.shared.includes("externalCalls: z.literal(0)") &&
    sprint95Source.shared.includes(".strict()")
  );
  record("backend freeze audit register route registration",
    providerController.includes('@Get("review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt/handoff-packet/acceptance-record/noop-execution-dryrun/result-ledger/final-readiness-certificate/freeze-audit-register")') &&
    providerController.includes("getReviewQaHandoffCertifiedReleaseFreezeAuditRegister")
  );
  record("service freeze audit register implementation",
    sprint95Source.providerService.includes("qaHandoffCertifiedReleaseFreezeAuditRegisterResponse") &&
    sprint95Source.providerService.includes("certifiedReleaseFreezeAuditRegisterReady") &&
    sprint95Source.providerService.includes("freezeAuditRegisterMutationCount: 0") &&
    sprint95Source.providerService.includes("externalCalls: 0 as const")
  );
  record("API client freeze audit register wiring",
    sprint95Source.apiClient.includes("getProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister") &&
    sprint95Source.apiClient.includes("providerWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegisterSchema") &&
    sprint95Source.apiClient.includes("/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt/handoff-packet/acceptance-record/noop-execution-dryrun/result-ledger/final-readiness-certificate/freeze-audit-register")
  );
  record("settings-data freeze audit register wiring",
    sprint95Source.settingsData.includes("loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegisterData") &&
    sprint95Source.settingsData.includes("getProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister") &&
    sprint95Source.settingsData.includes("createMockReviewQaHandoffCertifiedReleaseFreezeAuditRegister")
  );
  record("provider readiness panel freeze audit register controls/results/errors",
    settingsPage.includes("QA Archive Certified Release Freeze Audit Register API error") &&
    settingsPage.includes("setReviewQaHandoffCertifiedReleaseFreezeAuditRegister(null)") &&
    settingsPage.includes("onLoadReviewQaHandoffCertifiedReleaseFreezeAuditRegister={loadReviewQaHandoffCertifiedReleaseFreezeAuditRegister}") &&
    providerPanel.includes("Load certified release freeze audit register") &&
    providerPanel.includes("QA archive certified release freeze audit register:") &&
    providerPanel.includes("freezeAuditStatus=") &&
    providerPanel.includes("freezeStatus=") &&
    providerPanel.includes("rollbackReadinessStatus=") &&
    providerPanel.includes("freezeAuditRowStatuses=") &&
    providerPanel.includes("rollbackPlanRowStatuses=") &&
    providerPanel.includes("externalCalls=")
  );
  record("no DATA_MODE=api mock/local fallback markers",
    /if \(mode === "api"\) \{\s*return \{\s*mode,\s*freezeAuditRegister: await getProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister/s.test(settingsData) &&
    !/DATA_MODE=api[\s\S]{0,180}(mock|local|fallback)|(?:mock|local|fallback)[\s\S]{0,180}DATA_MODE=api/i.test(sprint95Source.settingsData)
  );
  record("static Sprint 95 source has no provider outbound send markers", !containsProviderOutbound(sprint95Source));
  record("static Sprint 95 source has no external notification send markers", !containsExternalNotification(sprint95Source));
  record("static Sprint 95 source has no AI/OpenAI call markers", !containsAiCall(sprint95Source));
  record("static Sprint 95 source has no raw provider material markers", safePayloadObject(sprint95Source));

  const filters = "provider=line&eventType=message.created";
  const health = await safeJson(await request("GET", "/health"));
  record("GET /health reachable", health?.status === "ok" && health?.service === "api");

  const missingTenantRegister = await requestJsonWithoutTenant("GET", `${freezeAuditRegisterPath}?${filters}`);
  record("freeze audit register requires x-tenant-id", missingTenantRegister.status >= 400 && missingTenantRegister.status < 500);

  const ledgerItem = await createNoMatchItem("freeze-audit-register", "Safe Sprint 95 certified release freeze audit register target");
  record("create safe sandbox no-match item", ledgerItem?.unmatchedStatus === "review-needed");

  const registerBeforePrerequisites = await requestJson("GET", `${freezeAuditRegisterPath}?${filters}`);
  const receiptSignOff = await safeJson(await request("POST", `/provider-webhooks/review-qa-handoff-bundle/receipt/sign-off?${filters}`, {
    acknowledgementType: "sign_off",
    reviewerRole: "QA reviewer",
    reviewerLabel: "safe sprint95 reviewer"
  }));
  const lock = await safeJson(await request("POST", `/provider-webhooks/review-qa-handoff-bundle/acceptance-lock?${filters}`, {
    lockReason: "Safe Sprint 95 certified release freeze audit register accepted",
    acceptedByRole: "QA lead",
    acceptedByLabel: "safe sprint95 reviewer"
  }));
  const archive = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive?${filters}`));
  const exportedArchive = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/export?${filters}`));
  const manifest = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/retention-manifest?${filters}`));
  const integrity = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/integrity?${filters}`));
  const retentionAudit = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/retention-audit?${filters}`));
  const finalization = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization?${filters}`));
  const signOff = await safeJson(await request("POST", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/sign-off?${filters}`, {
    reviewerRole: "retention reviewer",
    reviewerLabel: "safe sprint95 reviewer"
  }));
  const receipt = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/receipt?${filters}`));
  const releaseEvidence = await safeJson(await request("GET", `${releaseBasePath}?${filters}`));
  const releaseVerification = await safeJson(await request("GET", `${releaseBasePath}/verification?${filters}`));
  const releaseCertification = await safeJson(await request("GET", `${releaseBasePath}/verification/certification?${filters}`));
  const closureLedger = await safeJson(await request("GET", `${releaseBasePath}/verification/certification/closure-ledger?${filters}`));
  const attestationAudit = await safeJson(await request("GET", `${attestationPath}?${filters}`));
  const reconciliation = await safeJson(await request("GET", `${reconciliationPath}?${filters}`));
  const releaseGate = await safeJson(await request("GET", `${releaseGatePath}?${filters}`));
  const decisionReceipt = await safeJson(await request("GET", `${decisionReceiptPath}?${filters}`));
  const handoffPacket = await safeJson(await request("GET", `${handoffPacketPath}?${filters}`));
  const initialAcceptanceRecord = await safeJson(await request("GET", `${acceptanceRecordPath}?${filters}`));
  const acknowledgedRecord = await safeJson(await request("POST", `${acceptanceRecordPath}?${filters}`, {
    acknowledgementType: "operator_checklist_acknowledgement",
    acknowledgedByRole: "release owner",
    acknowledgedByLabel: "safe sprint95 release owner",
    acknowledgedChecklistKeys: handoffPacket.operatorChecklist.map((item) => item.key)
  }));
  const initialDryRun = await safeJson(await request("GET", `${noopExecutionDryRunPath}?${filters}`));
  const executedDryRun = await safeJson(await request("POST", `${noopExecutionDryRunPath}?${filters}`, {
    requestedBy: "safe sprint95 release owner",
    checklistAcknowledged: true,
    operatorNote: "Safe no-op execution dry-run from Sprint 95 smoke",
    dryRunReason: "safe no-op execution readiness rehearsal",
    executionMode: "no_op"
  }));
  const dryRunReadback = await safeJson(await request("GET", `${noopExecutionDryRunPath}?${filters}`));
  const beforeLedgerPage = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound?provider=line&limit=25&offset=0&sortBy=receivedAt&sortOrder=desc"));
  const stateBeforeLedgerRead = unmatchedItems(beforeLedgerPage).find((item) => item.id === ledgerItem.id);
  const resultLedger = await safeJson(await request("GET", `${resultLedgerPath}?${filters}`));
  const certificate = await safeJson(await request("GET", `${finalReadinessCertificatePath}?${filters}`));
  const register = await safeJson(await request("GET", `${freezeAuditRegisterPath}?${filters}`));
  const afterRegisterPage = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound?provider=line&limit=25&offset=0&sortBy=receivedAt&sortOrder=desc"));
  const stateAfterRegisterRead = unmatchedItems(afterRegisterPage).find((item) => item.id === ledgerItem.id);
  const invalidTenantRegister = await requestJson("GET", `${freezeAuditRegisterPath}?${filters}`, undefined, "00000000-0000-4000-8000-000000000095");

  record("incomplete chain returns explicit 409", registerBeforePrerequisites.status === 409 && /required|prerequisite|lock|archive/i.test(JSON.stringify(registerBeforePrerequisites.body)));
  record("complete/load safe chain through Sprint 92 certified release no-op execution dry-run", [receiptSignOff, lock, exportedArchive, manifest, integrity, retentionAudit, finalization, signOff, receipt, releaseEvidence, releaseVerification, releaseCertification, closureLedger, attestationAudit, reconciliation, releaseGate, decisionReceipt, handoffPacket, acknowledgedRecord, executedDryRun].every(Boolean));
  record("initial dryRunStatus not_started", safeNoopExecutionDryRunShape(initialDryRun) && initialDryRun.dryRunStatus === "not_started");
  record("POST no-op execution dry-run returns passed", safeNoopExecutionDryRunShape(executedDryRun) && executedDryRun.dryRunStatus === "passed");
  record("certificateStatus issued", safeFinalReadinessCertificateShape(certificate) && certificate.certificateStatus === "issued");
  record("finalReadinessStatus ready", certificate.finalReadinessStatus === "ready");
  record("ledgerStatus recorded", certificate.ledgerStatus === "recorded");
  record("dryRunStatus passed", certificate.dryRunStatus === "passed");
  record("executionMode no_op", certificate.executionMode === "no_op");
  record("acceptanceStatus acknowledged", certificate.acceptanceStatus === "acknowledged");
  record("handoffStatus ready", certificate.handoffStatus === "ready");
  record("releaseDecision go", certificate.releaseDecision === "go");
  record("packetStatus issued", certificate.packetStatus === "issued");
  record("receiptStatus issued", certificate.receiptStatus === "issued");
  record("gateStatus ready", certificate.gateStatus === "ready");
  record("goNoGoDecision go", certificate.goNoGoDecision === "go");
  record("reconciliationStatus complete/aligned", ["complete", "aligned"].includes(certificate.reconciliationStatus));
  record("attestationStatus complete", certificate.attestationStatus === "complete");
  record("closure ledger status certified_release_closed", certificate.ledgerStatusFromClosure === "certified_release_closed");
  record("certificationStatus certified", certificate.certificationStatus === "certified");
  record("releaseReadinessStatus ready_for_release", certificate.releaseReadinessStatus === "ready_for_release");
  record("verificationStatus verified", certificate.verificationStatus === "verified");
  record("digestChainStatus confirmed", certificate.digestChainStatus === "confirmed");
  record("prerequisite checklist complete", Object.values(certificate.inheritedPrerequisiteChecklist ?? {}).every(Boolean));
  record("certification checklist complete", Object.values(certificate.inheritedCertificationChecklist ?? {}).every(Boolean));
  record("gate checklist complete", Object.values(certificate.inheritedGateChecklist ?? {}).every(Boolean));
  record("decision receipt summary present", certificate.inheritedDecisionReceiptSummary?.receiptRowCount >= 13 && certificate.inheritedDecisionReceiptSummary?.externalCallsZero === true);
  record("handoff packet summary present", certificate.inheritedHandoffPacketSummary?.packetStatus === "issued" && certificate.inheritedHandoffPacketSummary?.externalCallsZero === true);
  record("acceptance summary present", certificate.inheritedAcceptanceSummary?.acceptanceStatus === "acknowledged" && certificate.inheritedAcceptanceSummary?.externalCallsZero === true);
  record("no-op dry-run summary present", certificate.inheritedNoopDryRunSummary?.dryRunStatus === "passed" && certificate.inheritedNoopDryRunSummary?.externalCallsZero === true);
  record("dry-run result ledger summary present", certificate.inheritedResultLedgerSummary?.ledgerStatus === "recorded" && certificate.inheritedResultLedgerSummary?.externalCallsZero === true);
  record("operatorChecklist present", Array.isArray(certificate.operatorChecklist) && certificate.operatorChecklist.length >= 7 && certificate.operatorChecklist.every(safeOperatorChecklistItemShape));
  record("acknowledgedChecklist present", Array.isArray(certificate.acknowledgedChecklist) && certificate.acknowledgedChecklist.length === certificate.operatorChecklist.length && certificate.acknowledgedChecklist.every(safeAcknowledgedChecklistItemShape));
  record("executionChecklist present", Array.isArray(certificate.executionChecklist) && certificate.executionChecklist.length >= 8 && certificate.executionChecklist.every(safeNoopExecutionChecklistItemShape));
  record("dryRunRows present", Array.isArray(certificate.dryRunRows) && certificate.dryRunRows.length >= 12 && certificate.dryRunRows.every(safeNoopDryRunRowShape));
  record("executionPlanRows present", Array.isArray(certificate.executionPlanRows) && certificate.executionPlanRows.length >= 7 && certificate.executionPlanRows.every(safeNoopExecutionPlanRowShape));
  record("resultLedgerRows present", Array.isArray(certificate.resultLedgerRows) && certificate.resultLedgerRows.length >= 12 && certificate.resultLedgerRows.every(safeResultLedgerRowShape));
  record("finalReadinessRows present", Array.isArray(certificate.finalReadinessRows) && certificate.finalReadinessRows.length >= 9 && certificate.finalReadinessRows.every(safeFinalReadinessRowShape));
  record("certificateRows present", Array.isArray(certificate.certificateRows) && certificate.certificateRows.length >= 11 && certificate.certificateRows.every(safeCertificateRowShape));
  record("releaseOwnerSummary present", certificate.releaseOwnerSummary?.checklistAcknowledged === true && certificate.releaseOwnerSummary?.externalCallsZero === true);
  record("safe digest links aligned",
    certificate.releaseEvidenceDigest === releaseEvidence.safeDigest &&
    certificate.verificationDigest === releaseVerification.safeDigest &&
    certificate.certificationDigest === releaseCertification.safeDigest &&
    certificate.closureLedgerDigest === closureLedger.safeDigest &&
    certificate.attestationAuditDigest === attestationAudit.safeDigest &&
    certificate.reconciliationDigest === reconciliation.reconciliationDigest &&
    certificate.releaseGateDigest === releaseGate.releaseGateDigest &&
    certificate.decisionReceiptDigest === decisionReceipt.decisionReceiptDigest &&
    certificate.handoffPacketDigest === handoffPacket.handoffPacketDigest &&
    certificate.acceptanceRecordDigest === acknowledgedRecord.acceptanceRecordDigest &&
    certificate.noopExecutionDryRunDigest === executedDryRun.noopExecutionDryRunDigest &&
    certificate.dryRunResultLedgerDigest === resultLedger.safeDigest &&
    certificate.finalReadinessCertificateDigest === certificate.safeDigest
  );
  record("inheritedBlockingReasons safe", Array.isArray(certificate.inheritedBlockingReasons) && certificate.inheritedBlockingReasons.every(safeBlockingReasonShape));
  record("inheritedExceptionRows safe", Array.isArray(certificate.inheritedExceptionRows) && certificate.inheritedExceptionRows.every(safeAttestationReconciliationExceptionShape));
  record("counts present", Number.isInteger(certificate.counts?.finalReadinessCertificateCheckedCount) && certificate.counts?.certificateRowCount === certificate.certificateRows.length && certificate.counts?.finalReadinessCertificateMutationCount === 0);
  record("externalCalls=0", certificate.externalCalls === 0);
  record("freezeAuditStatus recorded", safeFreezeAuditRegisterShape(register) && register.freezeAuditStatus === "recorded");
  record("freezeStatus frozen", safeFreezeAuditRegisterShape(register) && register.freezeStatus === "frozen");
  record("rollbackReadinessStatus ready", register.rollbackReadinessStatus === "ready");
  record("freeze audit register chains to final readiness certificate", register.finalReadinessCertificateDigest === certificate.finalReadinessCertificateDigest && register.inheritedFinalReadinessCertificateSummary?.safeDigest === certificate.safeDigest);
  record("freezeAuditRows recorded", Array.isArray(register.freezeAuditRows) && register.freezeAuditRows.length >= 5 && register.freezeAuditRows.every(safeFreezeAuditRegisterRowShape));
  record("rollbackPlanRows ready", Array.isArray(register.rollbackPlanRows) && register.rollbackPlanRows.length >= 5 && register.rollbackPlanRows.every(safeFreezeAuditRegisterRowShape));
  record("freeze audit counts present", Number.isInteger(register.counts?.freezeAuditRegisterCheckedCount) && register.counts?.freezeAuditRowCount === register.freezeAuditRows.length && register.counts?.rollbackPlanRowCount === register.rollbackPlanRows.length && register.counts?.freezeAuditRegisterMutationCount === 0);
  record("safe rollback plan digest present", /^sha256:[a-z0-9]+$/i.test(register.rollbackReadinessPlanDigest));
  record("freeze register externalCalls=0", register.externalCalls === 0);
  record("GET no mutation before/after freeze audit register read", metadataOnlyStateMatches(stateBeforeLedgerRead, stateAfterRegisterRead) && register.counts.freezeAuditRegisterMutationCount === 0);
  record("no review/link/message/unmatched/archive/release state mutation", metadataOnlyStateMatches(stateBeforeLedgerRead, stateAfterRegisterRead) && dryRunReadback.noopExecutionDryRunDigest === executedDryRun.noopExecutionDryRunDigest);
  record("invalid tenant does not return mock fallback", invalidTenantRegister.status === 409 && !JSON.stringify(invalidTenantRegister.body).includes("mockqahandoffcertifiedreleasefreezeauditregister"));
  record("no stale/fake final readiness certificate", !JSON.stringify(certificate).includes("mockqahandoffcertifiedreleasefinalreadinesscertificate"));
  record("no stale/fake freeze audit register", !JSON.stringify(register).includes("mockqahandoffcertifiedreleasefreezeauditregister"));
  record("externalCalls=0 throughout", noNonzeroExternalCalls({
    health,
    receiptSignOff,
    lock,
    archive,
    exportedArchive,
    manifest,
    integrity,
    retentionAudit,
    finalization,
    signOff,
    receipt,
    releaseEvidence,
    releaseVerification,
    releaseCertification,
    closureLedger,
    attestationAudit,
    reconciliation,
    releaseGate,
    decisionReceipt,
    handoffPacket,
    initialAcceptanceRecord,
    acknowledgedRecord,
    initialDryRun,
    executedDryRun,
    dryRunReadback,
    resultLedger,
    certificate,
    register,
    afterRegisterPage
  }));
  record("no provider outbound", !containsProviderOutbound({ register, certificate, resultLedger, executedDryRun, acknowledgedRecord, handoffPacket, decisionReceipt, releaseGate }));
  record("no external notification", !containsExternalNotification({ register, certificate, resultLedger, executedDryRun, acknowledgedRecord, handoffPacket, decisionReceipt, releaseGate }));
  record("no AI/OpenAI call evidence", !containsAiCall({ register, certificate, resultLedger, executedDryRun, acknowledgedRecord, handoffPacket, decisionReceipt, releaseGate }));
  record("no raw provider material leakage", safePayloadObject({
    registerBeforePrerequisites,
    missingTenantRegister,
    invalidTenantRegister,
    receiptSignOff,
    lock,
    archive,
    exportedArchive,
    manifest,
    integrity,
    retentionAudit,
    finalization,
    signOff,
    receipt,
    releaseEvidence,
    releaseVerification,
    releaseCertification,
    closureLedger,
    attestationAudit,
    reconciliation,
    releaseGate,
    decisionReceipt,
    handoffPacket,
    initialAcceptanceRecord,
    acknowledgedRecord,
    initialDryRun,
    executedDryRun,
    dryRunReadback,
    resultLedger,
    certificate,
    register,
    afterRegisterPage
  }));

  finish();
}

async function createNoMatchItem(label, text) {
  const eventId = `${runId}-${label}-${Math.random().toString(16).slice(2)}`;
  const payload = linePayload(`safe-no-match-room-sprint95-${label}-${runId}`, `safe-sender-sprint95-${label}`, text);
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
  record(`POST sandbox event ${label} reachable`, created?.unmatchedInboundQueued === true && typeof created.unmatchedInboundId === "string" && created.externalCalls === 0);
  const unmatched = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound?limit=50&offset=0&sortBy=receivedAt&sortOrder=desc"));
  return unmatchedItems(unmatched).find((item) => item.id === created.unmatchedInboundId) ?? null;
}

function linePayload(roomId, userId, text) {
  return {
    events: [{
      type: "message",
      timestamp: Date.now(),
      replyToken: `reply-token-must-not-return-${runId}`,
      source: { type: "room", userId, roomId },
      message: { id: `message-id-must-not-return-${runId}`, type: "text", text }
    }]
  };
}

async function request(method, path, body, tenantOverride = tenantId) {
  const headers = {
    "content-type": "application/json",
    "x-user-id": userId
  };
  if (tenantOverride !== undefined) headers["x-tenant-id"] = tenantOverride;
  return fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  });
}

async function requestJson(method, path, body, tenantOverride = tenantId) {
  const response = await request(method, path, body, tenantOverride);
  return responseJson(response);
}

async function requestJsonWithoutTenant(method, path, body) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      "x-user-id": userId
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  return responseJson(response);
}

async function responseJson(response) {
  const text = await response.text();
  let parsed = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = text;
  }
  return { status: response.status, ok: response.ok, body: parsed };
}

async function safeJson(response) {
  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`Non-JSON response ${response.status}: ${text.slice(0, 200)}`);
  }
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${JSON.stringify(json).slice(0, 300)}`);
  return json;
}

function signPayload(payload) {
  return `sha256=${crypto.createHmac("sha256", signingMaterial).update(canonicalJson(payload)).digest("hex")}`;
}

function canonicalJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
}

function unmatchedItems(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.items)) return value.items;
  return [];
}

function safeNoopExecutionDryRunShape(value) {
  return value &&
    value.dryRunKind === "qa-handoff-locked-archive-certified-release-noop-execution-dryrun" &&
    ["not_started", "passed", "blocked", "incomplete"].includes(value.dryRunStatus) &&
    value.executionMode === "no_op" &&
    ["acknowledged", "not_started", "blocked", "incomplete"].includes(value.acceptanceStatus) &&
    ["go", "no_go"].includes(value.releaseDecision) &&
    value.safeFilename === "provider-webhook-review-qa-handoff-certified-release-noop-execution-dryrun.json" &&
    value.safeDigest?.startsWith("sha256:") &&
    value.noopExecutionDryRunDigest === value.safeDigest &&
    value.externalCalls === 0;
}

function safeDryRunResultLedgerShape(value) {
  return value &&
    value.ledgerKind === "qa-handoff-locked-archive-certified-release-dryrun-result-ledger" &&
    ["pending", "recorded", "blocked", "incomplete"].includes(value.ledgerStatus) &&
    ["not_started", "passed", "blocked", "incomplete"].includes(value.dryRunStatus) &&
    value.executionMode === "no_op" &&
    ["acknowledged", "not_started", "blocked", "incomplete"].includes(value.acceptanceStatus) &&
    ["go", "no_go"].includes(value.releaseDecision) &&
    value.safeFilename === "provider-webhook-review-qa-handoff-certified-release-dryrun-result-ledger.json" &&
    value.safeDigest?.startsWith("sha256:") &&
    value.dryRunResultLedgerDigest === value.safeDigest &&
    value.noopExecutionDryRunDigest?.startsWith("sha256:") &&
    Array.isArray(value.operatorChecklist) &&
    Array.isArray(value.acknowledgedChecklist) &&
    Array.isArray(value.executionChecklist) &&
    Array.isArray(value.dryRunRows) &&
    Array.isArray(value.executionPlanRows) &&
    Array.isArray(value.resultLedgerRows) &&
    Array.isArray(value.finalReadinessRows) &&
    Object.values(value.inheritedPrerequisiteChecklist ?? {}).every(Boolean) &&
    Object.values(value.inheritedCertificationChecklist ?? {}).every(Boolean) &&
    Object.values(value.inheritedGateChecklist ?? {}).every(Boolean) &&
    value.inheritedNoopDryRunSummary?.externalCallsZero === true &&
    Number.isInteger(value.counts?.dryRunResultLedgerCheckedCount) &&
    value.counts?.dryRunResultLedgerMutationCount === 0 &&
    value.externalCalls === 0;
}

function safeFinalReadinessCertificateShape(value) {
  return value &&
    value.certificateKind === "qa-handoff-locked-archive-certified-release-final-readiness-certificate" &&
    ["pending", "issued", "blocked", "incomplete"].includes(value.certificateStatus) &&
    ["ready", "not_ready", "incomplete"].includes(value.finalReadinessStatus) &&
    ["pending", "recorded", "blocked", "incomplete"].includes(value.ledgerStatus) &&
    ["not_started", "passed", "blocked", "incomplete"].includes(value.dryRunStatus) &&
    value.executionMode === "no_op" &&
    ["acknowledged", "not_started", "blocked", "incomplete"].includes(value.acceptanceStatus) &&
    ["go", "no_go"].includes(value.releaseDecision) &&
    value.safeFilename === "provider-webhook-review-qa-handoff-certified-release-final-readiness-certificate.json" &&
    value.safeDigest?.startsWith("sha256:") &&
    value.finalReadinessCertificateDigest === value.safeDigest &&
    value.dryRunResultLedgerDigest?.startsWith("sha256:") &&
    Array.isArray(value.operatorChecklist) &&
    Array.isArray(value.acknowledgedChecklist) &&
    Array.isArray(value.executionChecklist) &&
    Array.isArray(value.dryRunRows) &&
    Array.isArray(value.executionPlanRows) &&
    Array.isArray(value.resultLedgerRows) &&
    Array.isArray(value.finalReadinessRows) &&
    Array.isArray(value.certificateRows) &&
    Object.values(value.inheritedPrerequisiteChecklist ?? {}).every(Boolean) &&
    Object.values(value.inheritedCertificationChecklist ?? {}).every(Boolean) &&
    Object.values(value.inheritedGateChecklist ?? {}).every(Boolean) &&
    value.inheritedNoopDryRunSummary?.externalCallsZero === true &&
    value.inheritedResultLedgerSummary?.externalCallsZero === true &&
    Number.isInteger(value.counts?.finalReadinessCertificateCheckedCount) &&
    value.counts?.finalReadinessCertificateMutationCount === 0 &&
    value.externalCalls === 0;
}

function safeFreezeAuditRegisterShape(value) {
  return value &&
    value.registerKind === "qa-handoff-locked-archive-certified-release-freeze-audit-register" &&
    ["pending", "recorded", "blocked", "incomplete"].includes(value.freezeAuditStatus) &&
    value.freezeStatus === "frozen" &&
    ["ready", "not_ready", "incomplete"].includes(value.rollbackReadinessStatus) &&
    ["pending", "issued", "blocked", "incomplete"].includes(value.certificateStatus) &&
    ["ready", "not_ready", "incomplete"].includes(value.finalReadinessStatus) &&
    ["pending", "recorded", "blocked", "incomplete"].includes(value.ledgerStatus) &&
    ["not_started", "passed", "blocked", "incomplete"].includes(value.dryRunStatus) &&
    value.executionMode === "no_op" &&
    ["go", "no_go"].includes(value.releaseDecision) &&
    value.safeFilename === "provider-webhook-review-qa-handoff-certified-release-freeze-audit-register.json" &&
    value.safeDigest?.startsWith("sha256:") &&
    value.freezeAuditRegisterDigest === value.safeDigest &&
    value.rollbackReadinessPlanDigest?.startsWith("sha256:") &&
    value.finalReadinessCertificateDigest?.startsWith("sha256:") &&
    Array.isArray(value.operatorChecklist) &&
    Array.isArray(value.acknowledgedChecklist) &&
    Array.isArray(value.executionChecklist) &&
    Array.isArray(value.resultLedgerRows) &&
    Array.isArray(value.finalReadinessRows) &&
    Array.isArray(value.certificateRows) &&
    Array.isArray(value.freezeAuditRows) &&
    Array.isArray(value.rollbackPlanRows) &&
    value.inheritedFinalReadinessCertificateSummary?.externalCallsZero === true &&
    Number.isInteger(value.counts?.freezeAuditRegisterCheckedCount) &&
    value.counts?.freezeAuditRegisterMutationCount === 0 &&
    value.externalCalls === 0;
}

function safeOperatorChecklistItemShape(item) {
  return item &&
    typeof item.key === "string" &&
    typeof item.label === "string" &&
    ["complete", "blocked"].includes(item.checklistStatus) &&
    item.safeDigest?.startsWith("sha256:") &&
    typeof item.complete === "boolean";
}

function safeAcknowledgedChecklistItemShape(item) {
  return item &&
    typeof item.key === "string" &&
    typeof item.label === "string" &&
    ["acknowledged", "pending", "blocked"].includes(item.acknowledgementStatus) &&
    item.safeDigest?.startsWith("sha256:") &&
    typeof item.acknowledged === "boolean";
}

function safeNoopExecutionChecklistItemShape(item) {
  return item &&
    typeof item.key === "string" &&
    typeof item.label === "string" &&
    ["complete", "pending", "blocked"].includes(item.checklistStatus) &&
    item.safeDigest?.startsWith("sha256:") &&
    typeof item.complete === "boolean";
}

function safeNoopDryRunRowShape(row) {
  return row &&
    typeof row.key === "string" &&
    typeof row.label === "string" &&
    ["passed", "pending", "blocked", "incomplete"].includes(row.dryRunRowStatus) &&
    row.safeDigest?.startsWith("sha256:") &&
    Number.isInteger(row.checkedCount) &&
    typeof row.complete === "boolean";
}

function safeNoopExecutionPlanRowShape(row) {
  return row &&
    typeof row.key === "string" &&
    typeof row.label === "string" &&
    ["ready", "no_op", "blocked", "incomplete"].includes(row.planStatus) &&
    row.safeDigest?.startsWith("sha256:") &&
    Number.isInteger(row.checkedCount) &&
    typeof row.complete === "boolean";
}

function safeResultLedgerRowShape(row) {
  return row &&
    typeof row.key === "string" &&
    typeof row.label === "string" &&
    ["pending", "recorded", "blocked", "incomplete"].includes(row.rowStatus) &&
    row.safeDigest?.startsWith("sha256:") &&
    Number.isInteger(row.checkedCount) &&
    typeof row.complete === "boolean";
}

function safeFinalReadinessRowShape(row) {
  return row &&
    typeof row.key === "string" &&
    typeof row.label === "string" &&
    ["ready", "pending", "blocked", "incomplete"].includes(row.readinessStatus) &&
    row.safeDigest?.startsWith("sha256:") &&
    Number.isInteger(row.checkedCount) &&
    typeof row.complete === "boolean";
}

function safeCertificateRowShape(row) {
  return row &&
    typeof row.key === "string" &&
    typeof row.label === "string" &&
    ["pending", "issued", "blocked", "incomplete"].includes(row.certificateStatus) &&
    ["ready", "not_ready", "incomplete"].includes(row.finalReadinessStatus) &&
    row.safeDigest?.startsWith("sha256:") &&
    Number.isInteger(row.checkedCount) &&
    typeof row.complete === "boolean";
}

function safeFreezeAuditRegisterRowShape(row) {
  return row &&
    typeof row.key === "string" &&
    typeof row.label === "string" &&
    ["pending", "recorded", "blocked", "incomplete"].includes(row.freezeAuditStatus) &&
    ["ready", "not_ready", "incomplete"].includes(row.rollbackReadinessStatus) &&
    row.safeDigest?.startsWith("sha256:") &&
    Number.isInteger(row.checkedCount) &&
    typeof row.complete === "boolean";
}

function safeAttestationReconciliationExceptionShape(row) {
  return row &&
    typeof row.code === "string" &&
    typeof row.label === "string" &&
    row.status === "safe_exception" &&
    row.safeDigest?.startsWith("sha256:") &&
    Number.isInteger(row.checkedCount);
}

function safeBlockingReasonShape(row) {
  return row &&
    typeof row.code === "string" &&
    typeof row.label === "string" &&
    row.status === "blocking_reason" &&
    row.safeDigest?.startsWith("sha256:");
}

function metadataOnlyStateMatches(before, after) {
  return before && after &&
    before.reviewStatus === after.reviewStatus &&
    before.linkStatus === after.linkStatus &&
    before.unmatchedStatus === after.unmatchedStatus &&
    before.assignmentStatus === after.assignmentStatus &&
    before.escalationStatus === after.escalationStatus &&
    before.resolutionStatus === after.resolutionStatus &&
    before.messagePersisted === after.messagePersisted &&
    before.linkedConversationId === after.linkedConversationId &&
    before.linkedMessageId === after.linkedMessageId;
}

function noNonzeroExternalCalls(value) {
  if (value === null || value === undefined) return true;
  if (Array.isArray(value)) return value.every(noNonzeroExternalCalls);
  if (typeof value !== "object") return true;
  if (Object.prototype.hasOwnProperty.call(value, "externalCalls") && value.externalCalls !== 0) return false;
  return Object.values(value).every(noNonzeroExternalCalls);
}

function sourceSlice(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  if (start === -1) return "";
  const end = source.indexOf(endMarker, start + startMarker.length);
  return source.slice(start, end === -1 ? undefined : end);
}

function containsProviderOutbound(value) {
  return /line\.push|telegram\.send|facebook\.send|instagram\.send|replyToken(?:Send|ProviderSend)|providerOutbound(?:Call|Send|Sent)|outboundProviderCall|pushMessage|sendMessageToProvider/i.test(serialized(value));
}

function containsExternalNotification(value) {
  return /notification\.sent|sendNotification|externalNotification|webhookNotify|slack\.send|email\.send|sms\.send/i.test(serialized(value));
}

function containsAiCall(value) {
  return /openai|ai\.call|chat\.completions|responses\.create|generateText|modelInvoke|llm/i.test(serialized(value));
}

function safePayloadObject(value) {
  return !/"rawPayload"\s*:|"rawSignature"\s*:|"replyToken"\s*:|"senderId"\s*:|"roomId"\s*:|"rawRoomId"\s*:|"rawSenderId"\s*:|"token"\s*:|"secret"\s*:|"authorization"\s*:|"cookie"\s*:|"headers"\s*:|"stack"\s*:|providerRaw|providerMaterial|payloadJson|raw-room|raw-sender|reply-token-must-not-return|message-id-must-not-return|accessToken|webhookSecret|bearer/i.test(serialized(value));
}

function serialized(value) {
  return typeof value === "string" ? value : JSON.stringify(value);
}

function isLocalBaseUrl(value) {
  try {
    const parsed = new URL(value);
    return ["localhost", "127.0.0.1", "::1"].includes(parsed.hostname);
  } catch {
    return false;
  }
}

function record(name, passed) {
  results.push({ name, passed: Boolean(passed) });
  const marker = passed ? "PASS" : "FAIL";
  console.log(`[${marker}] ${name}`);
}

function finish() {
  const failed = results.filter((result) => !result.passed);
  if (failed.length > 0) {
    console.error(`Sprint 95 smoke failed: ${failed.map((result) => result.name).join(", ")}`);
    process.exitCode = 1;
    return;
  }
  console.log("Sprint 95 smoke passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
