import crypto from "node:crypto";
import { readFileSync } from "node:fs";

const baseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");
const tenantId = process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
const userId = process.env.USER_ID ?? "00000000-0000-4000-8000-000000000011";
const signingMaterial = process.env.PROVIDER_WEBHOOK_SANDBOX_SIGNING_KEY ?? "local-provider-webhook-sandbox-signing-material";
const runId = `sprint92-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const releaseBasePath = "/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence";
const attestationPath = `${releaseBasePath}/verification/certification/closure-ledger/attestation-audit`;
const reconciliationPath = `${attestationPath}/reconciliation`;
const releaseGatePath = `${reconciliationPath}/release-gate`;
const decisionReceiptPath = `${releaseGatePath}/decision-receipt`;
const handoffPacketPath = `${decisionReceiptPath}/handoff-packet`;
const acceptanceRecordPath = `${handoffPacketPath}/acceptance-record`;
const noopExecutionDryRunPath = `${acceptanceRecordPath}/noop-execution-dryrun`;
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
  const sprint92Source = {
    shared: sourceSlice(shared, "providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunStatusSchema", "providerWebhookUnmatchedInboundBulkReviewRequestSchema"),
    providerController: sourceSlice(providerController, "acceptance-record/noop-execution-dryrun", "review-closure-report/export"),
    providerService: [
      sourceSlice(providerService, "getReviewQaHandoffCertifiedReleaseNoopExecutionDryRun(", "private getLockedArchiveContext"),
      sourceSlice(providerService, "function assertQaHandoffCertifiedReleaseNoopExecutionDryRunPrerequisites", "function safeRoomLabel")
    ].join("\n"),
    apiClient: sourceSlice(apiClient, "getProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun", "getProviderWebhookReviewClosureReportExport"),
    settingsData: [
      sourceSlice(settingsData, "loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunData", "loadSettingsProviderWebhookReviewClosureReportRedactionAuditData"),
      sourceSlice(settingsData, "function createMockReviewQaHandoffCertifiedReleaseNoopExecutionDryRun", "function createMockReleaseAttestationAuditRow")
    ].join("\n"),
    settingsPage: [
      sourceSlice(settingsPage, "reviewQaHandoffCertifiedReleaseNoopExecutionDryRun", "reviewClosureReportRedactionAudit"),
      sourceSlice(settingsPage, "loadReviewQaHandoffCertifiedReleaseNoopExecutionDryRun", "loadClosureReportRedactionAudit")
    ].join("\n"),
    providerPanel: [
      sourceSlice(providerPanel, "Load certified release handoff acceptance record", "Audit report export redaction"),
      sourceSlice(providerPanel, "QA archive certified release no-op execution dry-run:", "reviewQaHandoffLockedArchive ?")
    ].join("\n")
  };

  record("smoke:sprint92 registered",
    rootPackage.scripts?.["smoke:sprint92"] === "node scripts/smoke-sprint92-provider-webhook-review-qa-archive-certified-release-noop-execution-dryrun.mjs"
  );
  record("Sprint 91/90/89/88/87/86/85/84/83/82/81/80/79/78/77/76/75 regression smoke scripts registered", [
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
  record("shared no-op execution dry-run DTO export",
    sprint92Source.shared.includes("providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunSchema") &&
    sprint92Source.shared.includes("providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunRequestSchema") &&
    sprint92Source.shared.includes("ProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun") &&
    sprint92Source.shared.includes("dryRunStatus") &&
    sprint92Source.shared.includes("executionMode") &&
    sprint92Source.shared.includes("executionChecklist") &&
    sprint92Source.shared.includes("dryRunRows") &&
    sprint92Source.shared.includes("executionPlanRows") &&
    sprint92Source.shared.includes("inheritedAcceptanceSummary") &&
    sprint92Source.shared.includes("externalCalls: z.literal(0)") &&
    sprint92Source.shared.includes(".strict()")
  );
  record("backend no-op execution dry-run route registration",
    providerController.includes('@Get("review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt/handoff-packet/acceptance-record/noop-execution-dryrun")') &&
    providerController.includes('@Post("review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt/handoff-packet/acceptance-record/noop-execution-dryrun")') &&
    providerController.includes("getReviewQaHandoffCertifiedReleaseNoopExecutionDryRun") &&
    providerController.includes("runReviewQaHandoffCertifiedReleaseNoopExecutionDryRun")
  );
  record("service no-op execution dry-run implementation",
    sprint92Source.providerService.includes("qaHandoffCertifiedReleaseNoopExecutionDryRuns") &&
    sprint92Source.providerService.includes("latestCertifiedReleaseNoopExecutionDryRun") &&
    sprint92Source.providerService.includes("qaHandoffCertifiedReleaseNoopExecutionDryRunResponse") &&
    sprint92Source.providerService.includes("certifiedReleaseNoopExecutionReady") &&
    sprint92Source.providerService.includes("noopExecutionDryRunMutationCount") &&
    sprint92Source.providerService.includes("externalCalls: 0 as const")
  );
  record("API client no-op execution dry-run wiring",
    sprint92Source.apiClient.includes("getProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun") &&
    sprint92Source.apiClient.includes("runProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun") &&
    sprint92Source.apiClient.includes("providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunSchema") &&
    sprint92Source.apiClient.includes("/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt/handoff-packet/acceptance-record/noop-execution-dryrun")
  );
  record("settings-data no-op execution dry-run wiring",
    sprint92Source.settingsData.includes("loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunData") &&
    sprint92Source.settingsData.includes("runSettingsProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun") &&
    sprint92Source.settingsData.includes("getProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun") &&
    sprint92Source.settingsData.includes("runProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun") &&
    sprint92Source.settingsData.includes("createMockReviewQaHandoffCertifiedReleaseNoopExecutionDryRun")
  );
  record("provider readiness panel no-op controls/results/errors",
    settingsPage.includes("QA Archive Certified Release No-Op Execution Dry-run API error") &&
    settingsPage.includes("setReviewQaHandoffCertifiedReleaseNoopExecutionDryRun(null)") &&
    settingsPage.includes("onLoadReviewQaHandoffCertifiedReleaseNoopExecutionDryRun={loadReviewQaHandoffCertifiedReleaseNoopExecutionDryRun}") &&
    settingsPage.includes("onRunReviewQaHandoffCertifiedReleaseNoopExecutionDryRun={runReviewQaHandoffCertifiedReleaseNoopExecutionDryRun}") &&
    providerPanel.includes("Load certified release no-op execution dry-run") &&
    providerPanel.includes("Run certified release no-op execution dry-run") &&
    providerPanel.includes("QA archive certified release no-op execution dry-run:") &&
    providerPanel.includes("dryRunStatus=") &&
    providerPanel.includes("executionMode=") &&
    providerPanel.includes("executionChecklistItems=") &&
    providerPanel.includes("dryRunRowStatuses=") &&
    providerPanel.includes("executionPlanRowStatuses=") &&
    providerPanel.includes("externalCalls=")
  );
  record("no DATA_MODE=api mock/local fallback markers",
    /if \(mode === "api"\) \{\s*return \{\s*mode,\s*dryRun: await getProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun/s.test(settingsData) &&
    /if \(mode === "api"\) \{\s*return \{\s*mode,\s*dryRun: await runProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun/s.test(settingsData) &&
    !/DATA_MODE=api[\s\S]{0,180}(mock|local|fallback)|(?:mock|local|fallback)[\s\S]{0,180}DATA_MODE=api/i.test(sprint92Source.settingsData)
  );
  record("static Sprint 92 source has no provider outbound send markers", !containsProviderOutbound(sprint92Source));
  record("static Sprint 92 source has no external notification send markers", !containsExternalNotification(sprint92Source));
  record("static Sprint 92 source has no AI/OpenAI call markers", !containsAiCall(sprint92Source));
  record("static Sprint 92 source has no raw provider material markers", safePayloadObject(sprint92Source));

  const filters = "provider=line&eventType=message.created";
  const health = await safeJson(await request("GET", "/health"));
  record("GET /health reachable", health?.status === "ok" && health?.service === "api");

  const missingTenantDryRun = await requestJsonWithoutTenant("GET", `${noopExecutionDryRunPath}?${filters}`);
  record("no-op execution dry-run requires x-tenant-id", missingTenantDryRun.status >= 400 && missingTenantDryRun.status < 500);

  const dryRunItem = await createNoMatchItem("noop-execution-dryrun", "Safe Sprint 92 certified release no-op execution dry-run target");
  record("create safe sandbox no-match item", dryRunItem?.unmatchedStatus === "review-needed");

  const dryRunBeforePrerequisites = await requestJson("GET", `${noopExecutionDryRunPath}?${filters}`);
  const receiptSignOff = await safeJson(await request("POST", `/provider-webhooks/review-qa-handoff-bundle/receipt/sign-off?${filters}`, {
    acknowledgementType: "sign_off",
    reviewerRole: "QA reviewer",
    reviewerLabel: "safe sprint92 reviewer"
  }));
  const lock = await safeJson(await request("POST", `/provider-webhooks/review-qa-handoff-bundle/acceptance-lock?${filters}`, {
    lockReason: "Safe Sprint 92 certified release no-op execution dry-run accepted",
    acceptedByRole: "QA lead",
    acceptedByLabel: "safe sprint92 reviewer"
  }));
  const archive = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive?${filters}`));
  const exportedArchive = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/export?${filters}`));
  const manifest = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/retention-manifest?${filters}`));
  const integrity = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/integrity?${filters}`));
  const retentionAudit = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/retention-audit?${filters}`));
  const finalization = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization?${filters}`));
  const signOff = await safeJson(await request("POST", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/sign-off?${filters}`, {
    reviewerRole: "retention reviewer",
    reviewerLabel: "safe sprint92 reviewer"
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
    acknowledgedByLabel: "safe sprint92 release owner",
    acknowledgedChecklistKeys: handoffPacket.operatorChecklist.map((item) => item.key)
  }));
  const beforeReadPage = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound?provider=line&limit=25&offset=0&sortBy=receivedAt&sortOrder=desc"));
  const stateBeforeRead = unmatchedItems(beforeReadPage).find((item) => item.id === dryRunItem.id);
  const initialDryRun = await safeJson(await request("GET", `${noopExecutionDryRunPath}?${filters}`));
  const afterReadPage = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound?provider=line&limit=25&offset=0&sortBy=receivedAt&sortOrder=desc"));
  const stateAfterRead = unmatchedItems(afterReadPage).find((item) => item.id === dryRunItem.id);
  const acceptanceRecordBeforePost = await safeJson(await request("GET", `${acceptanceRecordPath}?${filters}`));
  const handoffPacketBeforePost = await safeJson(await request("GET", `${handoffPacketPath}?${filters}`));
  const executedDryRun = await safeJson(await request("POST", `${noopExecutionDryRunPath}?${filters}`, {
    requestedBy: "safe sprint92 release owner",
    checklistAcknowledged: true,
    operatorNote: "Safe no-op execution dry-run from smoke",
    dryRunReason: "safe no-op execution readiness rehearsal",
    executionMode: "no_op"
  }));
  const acceptanceRecordAfterPost = await safeJson(await request("GET", `${acceptanceRecordPath}?${filters}`));
  const handoffPacketAfterPost = await safeJson(await request("GET", `${handoffPacketPath}?${filters}`));
  const dryRunReadback = await safeJson(await request("GET", `${noopExecutionDryRunPath}?${filters}`));
  const afterPostPage = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound?provider=line&limit=25&offset=0&sortBy=receivedAt&sortOrder=desc"));
  const stateAfterPost = unmatchedItems(afterPostPage).find((item) => item.id === dryRunItem.id);
  const invalidTenantDryRun = await requestJson("GET", `${noopExecutionDryRunPath}?${filters}`, undefined, "00000000-0000-4000-8000-000000000092");

  record("incomplete chain returns explicit 409", dryRunBeforePrerequisites.status === 409 && /required|prerequisite|lock|archive/i.test(JSON.stringify(dryRunBeforePrerequisites.body)));
  record("complete safe chain through Sprint 91 acceptance record", [receiptSignOff, lock, exportedArchive, manifest, integrity, retentionAudit, finalization, signOff, receipt, releaseEvidence, releaseVerification, releaseCertification, closureLedger, attestationAudit, reconciliation, releaseGate, decisionReceipt, handoffPacket, acknowledgedRecord].every(Boolean));
  record("initial dryRunStatus not_started", safeNoopExecutionDryRunShape(initialDryRun) && initialDryRun.dryRunStatus === "not_started");
  record("GET no mutation before/after no-op read", metadataOnlyStateMatches(stateBeforeRead, stateAfterRead));
  record("POST no-op execution dry-run returns passed", safeNoopExecutionDryRunShape(executedDryRun) && executedDryRun.dryRunStatus === "passed");
  record("executionMode no_op", executedDryRun.executionMode === "no_op");
  record("acceptanceStatus acknowledged", executedDryRun.acceptanceStatus === "acknowledged");
  record("handoffStatus ready", executedDryRun.handoffStatus === "ready");
  record("releaseDecision go", executedDryRun.releaseDecision === "go");
  record("packetStatus issued", executedDryRun.packetStatus === "issued");
  record("receiptStatus issued", executedDryRun.receiptStatus === "issued");
  record("gateStatus ready", executedDryRun.gateStatus === "ready");
  record("goNoGoDecision go", executedDryRun.goNoGoDecision === "go");
  record("reconciliationStatus complete/aligned", ["complete", "aligned"].includes(executedDryRun.reconciliationStatus));
  record("attestationStatus complete", executedDryRun.attestationStatus === "complete");
  record("ledgerStatus certified_release_closed", executedDryRun.ledgerStatus === "certified_release_closed");
  record("certificationStatus certified", executedDryRun.certificationStatus === "certified");
  record("releaseReadinessStatus ready_for_release", executedDryRun.releaseReadinessStatus === "ready_for_release");
  record("verificationStatus verified", executedDryRun.verificationStatus === "verified");
  record("digestChainStatus confirmed", executedDryRun.digestChainStatus === "confirmed");
  record("prerequisite checklist complete", Object.values(executedDryRun.inheritedPrerequisiteChecklist ?? {}).every(Boolean));
  record("certification checklist complete", Object.values(executedDryRun.inheritedCertificationChecklist ?? {}).every(Boolean));
  record("gate checklist complete", Object.values(executedDryRun.inheritedGateChecklist ?? {}).every(Boolean));
  record("decision receipt summary present", executedDryRun.inheritedDecisionReceiptSummary?.receiptRowCount >= 13 && executedDryRun.inheritedDecisionReceiptSummary?.externalCallsZero === true);
  record("handoff packet summary present", executedDryRun.inheritedHandoffPacketSummary?.packetStatus === "issued" && executedDryRun.inheritedHandoffPacketSummary?.externalCallsZero === true);
  record("acceptance summary present", executedDryRun.inheritedAcceptanceSummary?.acceptanceStatus === "acknowledged" && executedDryRun.inheritedAcceptanceSummary?.externalCallsZero === true);
  record("operatorChecklist present", Array.isArray(executedDryRun.operatorChecklist) && executedDryRun.operatorChecklist.length >= 7 && executedDryRun.operatorChecklist.every(safeOperatorChecklistItemShape));
  record("acknowledgedChecklist present", Array.isArray(executedDryRun.acknowledgedChecklist) && executedDryRun.acknowledgedChecklist.length === executedDryRun.operatorChecklist.length && executedDryRun.acknowledgedChecklist.every(safeAcknowledgedChecklistItemShape));
  record("executionChecklist present", Array.isArray(executedDryRun.executionChecklist) && executedDryRun.executionChecklist.length >= 8 && executedDryRun.executionChecklist.every(safeNoopExecutionChecklistItemShape));
  record("dryRunRows present", Array.isArray(executedDryRun.dryRunRows) && executedDryRun.dryRunRows.length >= 12 && executedDryRun.dryRunRows.every(safeNoopDryRunRowShape));
  record("executionPlanRows present", Array.isArray(executedDryRun.executionPlanRows) && executedDryRun.executionPlanRows.length >= 7 && executedDryRun.executionPlanRows.every(safeNoopExecutionPlanRowShape));
  record("releaseOwnerSummary present", executedDryRun.releaseOwnerSummary?.operatorChecklistAcknowledged === true && executedDryRun.releaseOwnerSummary?.checklistAcknowledged === true && executedDryRun.releaseOwnerSummary?.externalCallsZero === true);
  record("safe digest links aligned",
    executedDryRun.releaseEvidenceDigest === releaseEvidence.safeDigest &&
    executedDryRun.verificationDigest === releaseVerification.safeDigest &&
    executedDryRun.certificationDigest === releaseCertification.safeDigest &&
    executedDryRun.closureLedgerDigest === closureLedger.safeDigest &&
    executedDryRun.attestationAuditDigest === attestationAudit.safeDigest &&
    executedDryRun.reconciliationDigest === reconciliation.reconciliationDigest &&
    executedDryRun.releaseGateDigest === releaseGate.releaseGateDigest &&
    executedDryRun.decisionReceiptDigest === decisionReceipt.decisionReceiptDigest &&
    executedDryRun.handoffPacketDigest === handoffPacket.handoffPacketDigest &&
    executedDryRun.acceptanceRecordDigest === acknowledgedRecord.acceptanceRecordDigest &&
    executedDryRun.noopExecutionDryRunDigest === executedDryRun.safeDigest
  );
  record("inheritedBlockingReasons safe", Array.isArray(executedDryRun.inheritedBlockingReasons) && executedDryRun.inheritedBlockingReasons.every(safeBlockingReasonShape));
  record("inheritedExceptionRows safe", Array.isArray(executedDryRun.inheritedExceptionRows) && executedDryRun.inheritedExceptionRows.every(safeAttestationReconciliationExceptionShape));
  record("counts present", Number.isInteger(executedDryRun.counts?.noopExecutionDryRunCheckedCount) && executedDryRun.counts?.executionChecklistItemCount === executedDryRun.executionChecklist.length && executedDryRun.counts?.dryRunRowCount === executedDryRun.dryRunRows.length);
  record("externalCalls=0", executedDryRun.externalCalls === 0);
  record("readback remains passed", dryRunReadback.dryRunStatus === "passed" && dryRunReadback.noopExecutionDryRunDigest === executedDryRun.noopExecutionDryRunDigest);
  record("POST mutates only safe dry-run/audit state",
    metadataOnlyStateMatches(stateAfterRead, stateAfterPost) &&
    stableJson(acceptanceRecordBeforePost) === stableJson(acceptanceRecordAfterPost) &&
    stableJson(handoffPacketBeforePost) === stableJson(handoffPacketAfterPost) &&
    initialDryRun.noopExecutionDryRunDigest !== executedDryRun.noopExecutionDryRunDigest &&
    executedDryRun.counts.noopExecutionDryRunMutationCount === 1
  );
  record("invalid tenant does not return mock fallback", invalidTenantDryRun.status === 409 && !JSON.stringify(invalidTenantDryRun.body).includes("mockqahandoffcertifiedreleasenoopdryrun"));
  record("no stale/fake no-op dry-run result markers", !JSON.stringify(executedDryRun).includes("mockqahandoffcertifiedreleasenoopdryrun"));
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
    afterPostPage
  }));
  record("no provider outbound", !containsProviderOutbound({ receiptSignOff, lock, archive, exportedArchive, manifest, integrity, retentionAudit, finalization, signOff, receipt, releaseEvidence, releaseVerification, releaseCertification, closureLedger, attestationAudit, reconciliation, releaseGate, decisionReceipt, handoffPacket, initialAcceptanceRecord, acknowledgedRecord, initialDryRun, executedDryRun }));
  record("no external notification", !containsExternalNotification({ receiptSignOff, lock, archive, exportedArchive, manifest, integrity, retentionAudit, finalization, signOff, receipt, releaseEvidence, releaseVerification, releaseCertification, closureLedger, attestationAudit, reconciliation, releaseGate, decisionReceipt, handoffPacket, initialAcceptanceRecord, acknowledgedRecord, initialDryRun, executedDryRun }));
  record("no AI/OpenAI call evidence", !containsAiCall({ receiptSignOff, lock, archive, exportedArchive, manifest, integrity, retentionAudit, finalization, signOff, receipt, releaseEvidence, releaseVerification, releaseCertification, closureLedger, attestationAudit, reconciliation, releaseGate, decisionReceipt, handoffPacket, initialAcceptanceRecord, acknowledgedRecord, initialDryRun, executedDryRun }));
  record("no raw provider material leakage", safePayloadObject({
    dryRunBeforePrerequisites,
    missingTenantDryRun,
    invalidTenantDryRun,
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
    afterPostPage
  }));

  finish();
}

async function createNoMatchItem(label, text) {
  const eventId = `${runId}-${label}-${Math.random().toString(16).slice(2)}`;
  const payload = linePayload(`safe-no-match-room-sprint92-${label}-${runId}`, `safe-sender-sprint92-${label}`, text);
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
    value.acceptanceRecordDigest?.startsWith("sha256:") &&
    value.handoffPacketDigest?.startsWith("sha256:") &&
    value.decisionReceiptDigest?.startsWith("sha256:") &&
    value.releaseGateDigest?.startsWith("sha256:") &&
    value.reconciliationDigest?.startsWith("sha256:") &&
    value.attestationAuditDigest?.startsWith("sha256:") &&
    value.closureLedgerDigest?.startsWith("sha256:") &&
    value.certificationDigest?.startsWith("sha256:") &&
    value.verificationDigest?.startsWith("sha256:") &&
    value.releaseEvidenceDigest?.startsWith("sha256:") &&
    Array.isArray(value.operatorChecklist) &&
    value.operatorChecklist.every(safeOperatorChecklistItemShape) &&
    Array.isArray(value.acknowledgedChecklist) &&
    value.acknowledgedChecklist.every(safeAcknowledgedChecklistItemShape) &&
    Array.isArray(value.executionChecklist) &&
    value.executionChecklist.every(safeNoopExecutionChecklistItemShape) &&
    Array.isArray(value.dryRunRows) &&
    value.dryRunRows.every(safeNoopDryRunRowShape) &&
    Array.isArray(value.executionPlanRows) &&
    value.executionPlanRows.every(safeNoopExecutionPlanRowShape) &&
    Object.values(value.inheritedPrerequisiteChecklist ?? {}).every(Boolean) &&
    Object.values(value.inheritedCertificationChecklist ?? {}).every(Boolean) &&
    Object.values(value.inheritedGateChecklist ?? {}).every(Boolean) &&
    value.inheritedDecisionReceiptSummary?.externalCallsZero === true &&
    value.inheritedHandoffPacketSummary?.externalCallsZero === true &&
    value.inheritedAcceptanceSummary?.externalCallsZero === true &&
    value.releaseOwnerSummary?.externalCallsZero === true &&
    Number.isInteger(value.counts?.noopExecutionDryRunCheckedCount) &&
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

function stableJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(",")}}`;
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

function containsProviderOutbound(sources) {
  return Object.values(sources).some((source) =>
    /\b(sendMessage|replyMessage|pushMessage|providerOutbound|sendProvider|callProviderApi)\s*\(/i.test(source)
  );
}


function containsExternalNotification(sources) {
  return Object.values(sources).some((source) =>
    /\b(sendNotification|sendExternalNotification|notifyExternal|dispatchNotification|externalNotification)\s*\(/i.test(source)
  );
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
    console.error(`Sprint 92 smoke failed: ${failed.map((result) => result.name).join(", ")}`);
    process.exitCode = 1;
    return;
  }
  console.log("Sprint 92 smoke passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
