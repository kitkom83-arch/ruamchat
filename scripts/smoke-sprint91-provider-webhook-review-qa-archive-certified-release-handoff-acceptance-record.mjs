import crypto from "node:crypto";
import { readFileSync } from "node:fs";

const baseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");
const tenantId = process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
const userId = process.env.USER_ID ?? "00000000-0000-4000-8000-000000000011";
const signingMaterial = process.env.PROVIDER_WEBHOOK_SANDBOX_SIGNING_KEY ?? "local-provider-webhook-sandbox-signing-material";
const runId = `sprint91-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const releaseBasePath = "/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence";
const attestationPath = `${releaseBasePath}/verification/certification/closure-ledger/attestation-audit`;
const reconciliationPath = `${attestationPath}/reconciliation`;
const releaseGatePath = `${reconciliationPath}/release-gate`;
const decisionReceiptPath = `${releaseGatePath}/decision-receipt`;
const handoffPacketPath = `${decisionReceiptPath}/handoff-packet`;
const acceptanceRecordPath = `${handoffPacketPath}/acceptance-record`;
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
  const sprint91Source = {
    shared: sourceSlice(shared, "providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceStatusSchema", "providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunStatusSchema"),
    providerController: sourceSlice(providerController, "review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt/handoff-packet/acceptance-record", "acceptance-record/noop-execution-dryrun"),
    providerService: [
      sourceSlice(providerService, "getReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord(", "getReviewQaHandoffCertifiedReleaseNoopExecutionDryRun("),
      sourceSlice(providerService, "function assertQaHandoffCertifiedReleaseHandoffAcceptanceRecordPrerequisites", "function assertQaHandoffCertifiedReleaseNoopExecutionDryRunPrerequisites")
    ].join("\n"),
    apiClient: sourceSlice(apiClient, "getProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord", "getProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun"),
    settingsData: [
      sourceSlice(settingsData, "loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordData", "loadSettingsProviderWebhookReviewClosureReportRedactionAuditData"),
      sourceSlice(settingsData, "function createMockReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord", "function createMockReviewQaHandoffCertifiedReleaseNoopExecutionDryRun")
    ].join("\n"),
    settingsPage: [
      sourceSlice(settingsPage, "reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord", "reviewClosureReportRedactionAudit"),
      sourceSlice(settingsPage, "loadReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord", "loadClosureReportRedactionAudit")
    ].join("\n"),
    providerPanel: [
      sourceSlice(providerPanel, "Load certified release handoff packet", "Audit report export redaction"),
      sourceSlice(providerPanel, "QA archive certified release handoff acceptance record:", "QA archive certified release no-op execution dry-run:")
    ].join("\n")
  };

  record("smoke:sprint91 registered",
    rootPackage.scripts?.["smoke:sprint91"] === "node scripts/smoke-sprint91-provider-webhook-review-qa-archive-certified-release-handoff-acceptance-record.mjs"
  );
  record("Sprint 90/89/88/87/86/85/84/83/82/81/80/79/78/77/76/75 regression smoke scripts registered", [
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
  record("shared certified release handoff acceptance record DTO export",
    sprint91Source.shared.includes("providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordSchema") &&
    sprint91Source.shared.includes("providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRequestSchema") &&
    sprint91Source.shared.includes("ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord") &&
    sprint91Source.shared.includes("acceptanceStatus") &&
    sprint91Source.shared.includes("acknowledgedChecklist") &&
    sprint91Source.shared.includes("acknowledgementRows") &&
    sprint91Source.shared.includes("inheritedHandoffPacketSummary") &&
    sprint91Source.shared.includes("externalCalls: z.literal(0)") &&
    sprint91Source.shared.includes(".strict()")
  );
  record("backend certified release handoff acceptance record route registration",
    providerController.includes('@Get("review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt/handoff-packet/acceptance-record")') &&
    providerController.includes('@Post("review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt/handoff-packet/acceptance-record")') &&
    providerController.includes("getReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord") &&
    providerController.includes("acknowledgeReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord")
  );
  record("service certified release handoff acceptance record implementation",
    sprint91Source.providerService.includes("qaHandoffCertifiedReleaseHandoffAcceptanceRecordResponse") &&
    sprint91Source.providerService.includes("qaHandoffCertifiedReleaseHandoffAcceptanceRecords") &&
    sprint91Source.providerService.includes("latestCertifiedReleaseHandoffAcceptanceRecord") &&
    sprint91Source.providerService.includes("acknowledgedChecklist") &&
    sprint91Source.providerService.includes("acknowledgementRows") &&
    sprint91Source.providerService.includes("acceptanceRecordMutationCount") &&
    sprint91Source.providerService.includes("externalCalls: 0 as const")
  );
  record("API client certified release handoff acceptance record wiring",
    sprint91Source.apiClient.includes("getProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord") &&
    sprint91Source.apiClient.includes("acknowledgeProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord") &&
    sprint91Source.apiClient.includes("providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordSchema") &&
    sprint91Source.apiClient.includes("/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt/handoff-packet/acceptance-record")
  );
  record("settings-data certified release handoff acceptance record wiring",
    sprint91Source.settingsData.includes("loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordData") &&
    sprint91Source.settingsData.includes("acknowledgeSettingsProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord") &&
    sprint91Source.settingsData.includes("getProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord") &&
    sprint91Source.settingsData.includes("acknowledgeProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord") &&
    sprint91Source.settingsData.includes("createMockReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord")
  );
  record("provider readiness panel acceptance record controls/results/errors",
    settingsPage.includes("QA Archive Certified Release Handoff Acceptance Record API error") &&
    settingsPage.includes("onLoadReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord={loadReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord}") &&
    settingsPage.includes("onAcknowledgeReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord={acknowledgeReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord}") &&
    providerPanel.includes("Load certified release handoff acceptance record") &&
    providerPanel.includes("Acknowledge certified release handoff checklist") &&
    providerPanel.includes("QA archive certified release handoff acceptance record:") &&
    providerPanel.includes("acceptanceStatus=") &&
    providerPanel.includes("acknowledgedChecklistItems=") &&
    providerPanel.includes("acknowledgementRowStatuses=") &&
    providerPanel.includes("externalCalls=")
  );
  record("acceptance record stale state clears with upstream/API failures",
    settingsPage.includes("setReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord(null)") &&
    settingsPage.includes("setQaHandoffCertifiedReleaseHandoffAcceptanceRecordError") &&
    settingsPage.includes("reviewQaHandoffCertifiedReleaseHandoffPacket") &&
    settingsPage.includes("setReviewQaHandoffCertifiedReleaseHandoffPacket(null)")
  );
  record("no DATA_MODE=api mock/local fallback markers",
    /if \(mode === "api"\) \{\s*return \{\s*mode,\s*acceptanceRecord: await getProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord/s.test(settingsData) &&
    /if \(mode === "api"\) \{\s*return \{\s*mode,\s*acceptanceRecord: await acknowledgeProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord/s.test(settingsData) &&
    !/DATA_MODE=api[\s\S]{0,180}(mock|local|fallback)|(?:mock|local|fallback)[\s\S]{0,180}DATA_MODE=api/i.test(sprint91Source.settingsData)
  );
  record("static Sprint 91 source has no provider outbound send markers", !containsProviderOutbound(sprint91Source));
  record("static Sprint 91 source has no external notification send markers", !containsExternalNotification(sprint91Source));
  record("static Sprint 91 source has no AI/OpenAI call markers", !containsAiCall(sprint91Source));
  record("static Sprint 91 source has no raw provider material markers", safePayloadObject(sprint91Source));

  const filters = "provider=line&eventType=message.created";
  const health = await safeJson(await request("GET", "/health"));
  record("GET /health reachable", health?.status === "ok" && health?.service === "api");

  const missingTenantRecord = await requestJsonWithoutTenant("GET", `${acceptanceRecordPath}?${filters}`);
  record("acceptance record requires x-tenant-id", missingTenantRecord.status >= 400 && missingTenantRecord.status < 500);

  const acceptanceItem = await createNoMatchItem("acceptance-record", "Safe Sprint 91 certified release handoff acceptance target");
  record("create safe sandbox no-match item", acceptanceItem?.unmatchedStatus === "review-needed");

  const recordBeforeLock = await requestJson("GET", `${acceptanceRecordPath}?${filters}`);
  const receiptSignOff = await safeJson(await request("POST", `/provider-webhooks/review-qa-handoff-bundle/receipt/sign-off?${filters}`, {
    acknowledgementType: "sign_off",
    reviewerRole: "QA reviewer",
    reviewerLabel: "safe sprint91 reviewer"
  }));
  const lock = await safeJson(await request("POST", `/provider-webhooks/review-qa-handoff-bundle/acceptance-lock?${filters}`, {
    lockReason: "Safe Sprint 91 certified release handoff acceptance record accepted",
    acceptedByRole: "QA lead",
    acceptedByLabel: "safe sprint91 reviewer"
  }));
  const recordBeforeArchiveExport = await requestJson("GET", `${acceptanceRecordPath}?${filters}`);
  const archive = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive?${filters}`));
  const exportedArchive = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/export?${filters}`));
  const manifest = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/retention-manifest?${filters}`));
  const integrity = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/integrity?${filters}`));
  const retentionAudit = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/retention-audit?${filters}`));
  const finalization = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization?${filters}`));
  const recordBeforeSignOff = await requestJson("GET", `${acceptanceRecordPath}?${filters}`);
  const signOff = await safeJson(await request("POST", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/sign-off?${filters}`, {
    reviewerRole: "retention reviewer",
    reviewerLabel: "safe sprint91 reviewer"
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
  const beforeReadPage = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound?provider=line&limit=25&offset=0&sortBy=receivedAt&sortOrder=desc"));
  const stateBeforeRead = unmatchedItems(beforeReadPage).find((item) => item.id === acceptanceItem.id);
  const initialAcceptanceRecord = await safeJson(await request("GET", `${acceptanceRecordPath}?${filters}`));
  const afterReadPage = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound?provider=line&limit=25&offset=0&sortBy=receivedAt&sortOrder=desc"));
  const stateAfterRead = unmatchedItems(afterReadPage).find((item) => item.id === acceptanceItem.id);
  const handoffPacketBeforePost = await safeJson(await request("GET", `${handoffPacketPath}?${filters}`));
  const acknowledgedRecord = await safeJson(await request("POST", `${acceptanceRecordPath}?${filters}`, {
    acknowledgementType: "operator_checklist_acknowledgement",
    acknowledgedByRole: "release owner",
    acknowledgedByLabel: "safe sprint91 release owner",
    acknowledgedChecklistKeys: handoffPacket.operatorChecklist.map((item) => item.key)
  }));
  const handoffPacketAfterPost = await safeJson(await request("GET", `${handoffPacketPath}?${filters}`));
  const acceptedReadback = await safeJson(await request("GET", `${acceptanceRecordPath}?${filters}`));
  const afterPostPage = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound?provider=line&limit=25&offset=0&sortBy=receivedAt&sortOrder=desc"));
  const stateAfterPost = unmatchedItems(afterPostPage).find((item) => item.id === acceptanceItem.id);
  const invalidTenantRecord = await requestJson("GET", `${acceptanceRecordPath}?${filters}`, undefined, "00000000-0000-4000-8000-000000000091");

  record("acceptance record requires acceptance lock before prerequisites", recordBeforeLock.status === 409 && /acceptance lock is required/i.test(JSON.stringify(recordBeforeLock.body)));
  record("acceptance record requires locked archive export", recordBeforeArchiveExport.status === 409 && /locked archive export is required/i.test(JSON.stringify(recordBeforeArchiveExport.body)));
  record("acceptance record requires finalization sign-off", recordBeforeSignOff.status === 409 && /finalization sign-off is required/i.test(JSON.stringify(recordBeforeSignOff.body)));
  record("complete safe chain through Sprint 90 handoff packet", [receiptSignOff, lock, exportedArchive, manifest, integrity, retentionAudit, finalization, signOff, receipt, releaseEvidence, releaseVerification, releaseCertification, closureLedger, attestationAudit, reconciliation, releaseGate, decisionReceipt, handoffPacket].every(Boolean));
  record("handoff packet issued/ready/go", safeCertifiedReleaseHandoffPacketShape(handoffPacket));
  record("initial acceptance record endpoint reachable", safeCertifiedReleaseHandoffAcceptanceRecordShape(initialAcceptanceRecord));
  record("initial acceptanceStatus not_started or safe pending", ["not_started", "incomplete"].includes(initialAcceptanceRecord.acceptanceStatus));
  record("GET no mutation before/after acceptance read", metadataOnlyStateMatches(stateBeforeRead, stateAfterRead));
  record("POST acknowledgement returns acknowledged", safeCertifiedReleaseHandoffAcceptanceRecordShape(acknowledgedRecord) && acknowledgedRecord.acceptanceStatus === "acknowledged");
  record("handoffStatus ready", acknowledgedRecord.handoffStatus === "ready");
  record("releaseDecision go", acknowledgedRecord.releaseDecision === "go");
  record("packetStatus issued", acknowledgedRecord.packetStatus === "issued");
  record("receiptStatus issued", acknowledgedRecord.receiptStatus === "issued");
  record("gateStatus ready", acknowledgedRecord.gateStatus === "ready");
  record("goNoGoDecision go", acknowledgedRecord.goNoGoDecision === "go");
  record("reconciliationStatus complete/aligned", ["complete", "aligned"].includes(acknowledgedRecord.reconciliationStatus));
  record("attestationStatus complete", acknowledgedRecord.attestationStatus === "complete");
  record("ledgerStatus certified_release_closed", acknowledgedRecord.ledgerStatus === "certified_release_closed");
  record("certificationStatus certified", acknowledgedRecord.certificationStatus === "certified");
  record("releaseReadinessStatus ready_for_release", acknowledgedRecord.releaseReadinessStatus === "ready_for_release");
  record("verificationStatus verified", acknowledgedRecord.verificationStatus === "verified");
  record("digestChainStatus confirmed", acknowledgedRecord.digestChainStatus === "confirmed");
  record("prerequisite checklist complete", Object.values(acknowledgedRecord.inheritedPrerequisiteChecklist ?? {}).every(Boolean));
  record("certification checklist complete", Object.values(acknowledgedRecord.inheritedCertificationChecklist ?? {}).every(Boolean));
  record("gate checklist complete", Object.values(acknowledgedRecord.inheritedGateChecklist ?? {}).every(Boolean));
  record("decision receipt summary present", acknowledgedRecord.inheritedDecisionReceiptSummary?.receiptRowCount >= 13 && acknowledgedRecord.inheritedDecisionReceiptSummary?.externalCallsZero === true);
  record("handoff packet summary present", acknowledgedRecord.inheritedHandoffPacketSummary?.packetStatus === "issued" && acknowledgedRecord.inheritedHandoffPacketSummary?.externalCallsZero === true);
  record("operatorChecklist present", Array.isArray(acknowledgedRecord.operatorChecklist) && acknowledgedRecord.operatorChecklist.length >= 7 && acknowledgedRecord.operatorChecklist.every(safeOperatorChecklistItemShape));
  record("acknowledgedChecklist present", Array.isArray(acknowledgedRecord.acknowledgedChecklist) && acknowledgedRecord.acknowledgedChecklist.length === acknowledgedRecord.operatorChecklist.length && acknowledgedRecord.acknowledgedChecklist.every(safeAcknowledgedChecklistItemShape));
  record("acknowledgementRows present", Array.isArray(acknowledgedRecord.acknowledgementRows) && acknowledgedRecord.acknowledgementRows.length >= 7 && acknowledgedRecord.acknowledgementRows.every(safeAcknowledgementRowShape));
  record("releaseOwnerSummary present", acknowledgedRecord.releaseOwnerSummary?.operatorChecklistAcknowledged === true && acknowledgedRecord.releaseOwnerSummary?.externalCallsZero === true);
  record("safe digest links aligned",
    acknowledgedRecord.releaseEvidenceDigest === releaseEvidence.safeDigest &&
    acknowledgedRecord.verificationDigest === releaseVerification.safeDigest &&
    acknowledgedRecord.certificationDigest === releaseCertification.safeDigest &&
    acknowledgedRecord.closureLedgerDigest === closureLedger.safeDigest &&
    acknowledgedRecord.attestationAuditDigest === attestationAudit.safeDigest &&
    acknowledgedRecord.reconciliationDigest === reconciliation.reconciliationDigest &&
    acknowledgedRecord.releaseGateDigest === releaseGate.releaseGateDigest &&
    acknowledgedRecord.decisionReceiptDigest === decisionReceipt.decisionReceiptDigest &&
    acknowledgedRecord.handoffPacketDigest === handoffPacket.handoffPacketDigest &&
    acknowledgedRecord.acceptanceRecordDigest === acknowledgedRecord.safeDigest
  );
  record("inheritedBlockingReasons safe", Array.isArray(acknowledgedRecord.inheritedBlockingReasons) && acknowledgedRecord.inheritedBlockingReasons.every(safeBlockingReasonShape));
  record("inheritedExceptionRows safe", Array.isArray(acknowledgedRecord.inheritedExceptionRows) && acknowledgedRecord.inheritedExceptionRows.every(safeAttestationReconciliationExceptionShape));
  record("counts present", Number.isInteger(acknowledgedRecord.counts?.acceptanceRecordCheckedCount) && acknowledgedRecord.counts?.acknowledgedChecklistItemCount === acknowledgedRecord.acknowledgedChecklist.length && acknowledgedRecord.counts?.acknowledgementRowCount === acknowledgedRecord.acknowledgementRows.length);
  record("externalCalls=0", acknowledgedRecord.externalCalls === 0);
  record("readback remains acknowledged", acceptedReadback.acceptanceStatus === "acknowledged" && acceptedReadback.acceptanceRecordDigest === acknowledgedRecord.acceptanceRecordDigest);
  record("POST mutates only safe acceptance record state",
    metadataOnlyStateMatches(stateAfterRead, stateAfterPost) &&
    stableJson(handoffPacketBeforePost) === stableJson(handoffPacketAfterPost) &&
    initialAcceptanceRecord.acceptanceRecordDigest !== acknowledgedRecord.acceptanceRecordDigest &&
    acknowledgedRecord.counts.acceptanceRecordMutationCount === 1
  );
  record("invalid tenant does not return mock fallback", invalidTenantRecord.status === 409 && !JSON.stringify(invalidTenantRecord.body).includes("mockqahandoffcertifiedreleasehandoffacceptance"));
  record("no stale/fake acceptance record result markers", !JSON.stringify(acknowledgedRecord).includes("mockqahandoffcertifiedreleasehandoffacceptance"));
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
    acceptedReadback,
    afterPostPage
  }));
  record("no provider outbound", !containsProviderOutbound({ receiptSignOff, lock, archive, exportedArchive, manifest, integrity, retentionAudit, finalization, signOff, receipt, releaseEvidence, releaseVerification, releaseCertification, closureLedger, attestationAudit, reconciliation, releaseGate, decisionReceipt, handoffPacket, initialAcceptanceRecord, acknowledgedRecord }));
  record("no external notification", !containsExternalNotification({ receiptSignOff, lock, archive, exportedArchive, manifest, integrity, retentionAudit, finalization, signOff, receipt, releaseEvidence, releaseVerification, releaseCertification, closureLedger, attestationAudit, reconciliation, releaseGate, decisionReceipt, handoffPacket, initialAcceptanceRecord, acknowledgedRecord }));
  record("no AI/OpenAI call evidence", !containsAiCall({ receiptSignOff, lock, archive, exportedArchive, manifest, integrity, retentionAudit, finalization, signOff, receipt, releaseEvidence, releaseVerification, releaseCertification, closureLedger, attestationAudit, reconciliation, releaseGate, decisionReceipt, handoffPacket, initialAcceptanceRecord, acknowledgedRecord }));
  record("no raw provider material leakage", safePayloadObject({
    recordBeforeLock,
    recordBeforeArchiveExport,
    recordBeforeSignOff,
    missingTenantRecord,
    invalidTenantRecord,
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
    acceptedReadback,
    afterPostPage
  }));

  finish();
}

async function createNoMatchItem(label, text) {
  const eventId = `${runId}-${label}-${Math.random().toString(16).slice(2)}`;
  const payload = linePayload(`safe-no-match-room-sprint91-${label}-${runId}`, `safe-sender-sprint91-${label}`, text);
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

function safeCertifiedReleaseHandoffPacketShape(value) {
  return value &&
    value.packetKind === "qa-handoff-locked-archive-certified-release-handoff-packet" &&
    value.packetStatus === "issued" &&
    value.handoffStatus === "ready" &&
    value.releaseDecision === "go" &&
    value.receiptStatus === "issued" &&
    value.gateStatus === "ready" &&
    value.goNoGoDecision === "go" &&
    value.releaseReadinessStatus === "ready_for_release" &&
    ["complete", "aligned"].includes(value.reconciliationStatus) &&
    value.attestationStatus === "complete" &&
    value.ledgerStatus === "certified_release_closed" &&
    value.certificationStatus === "certified" &&
    value.verificationStatus === "verified" &&
    value.digestChainStatus === "confirmed" &&
    value.safeFilename === "provider-webhook-review-qa-handoff-certified-release-handoff-packet.json" &&
    value.safeDigest?.startsWith("sha256:") &&
    value.handoffPacketDigest === value.safeDigest &&
    Array.isArray(value.operatorChecklist) &&
    value.operatorChecklist.every(safeOperatorChecklistItemShape) &&
    value.externalCalls === 0;
}

function safeCertifiedReleaseHandoffAcceptanceRecordShape(value) {
  return value &&
    value.acceptanceKind === "qa-handoff-locked-archive-certified-release-handoff-acceptance-record" &&
    ["not_started", "acknowledged", "blocked", "incomplete"].includes(value.acceptanceStatus) &&
    value.handoffStatus === "ready" &&
    value.releaseDecision === "go" &&
    value.packetStatus === "issued" &&
    value.receiptStatus === "issued" &&
    value.gateStatus === "ready" &&
    value.goNoGoDecision === "go" &&
    value.releaseReadinessStatus === "ready_for_release" &&
    ["complete", "aligned"].includes(value.reconciliationStatus) &&
    value.attestationStatus === "complete" &&
    value.ledgerStatus === "certified_release_closed" &&
    value.certificationStatus === "certified" &&
    value.verificationStatus === "verified" &&
    value.digestChainStatus === "confirmed" &&
    value.safeFilename === "provider-webhook-review-qa-handoff-certified-release-handoff-acceptance-record.json" &&
    value.safeDigest?.startsWith("sha256:") &&
    value.acceptanceRecordDigest === value.safeDigest &&
    value.handoffPacketDigest?.startsWith("sha256:") &&
    value.decisionReceiptDigest?.startsWith("sha256:") &&
    value.releaseGateDigest?.startsWith("sha256:") &&
    value.reconciliationDigest?.startsWith("sha256:") &&
    value.attestationAuditDigest?.startsWith("sha256:") &&
    value.closureLedgerDigest?.startsWith("sha256:") &&
    value.certificationDigest?.startsWith("sha256:") &&
    value.verificationDigest?.startsWith("sha256:") &&
    value.releaseEvidenceDigest?.startsWith("sha256:") &&
    Object.values(value.inheritedPrerequisiteChecklist ?? {}).every(Boolean) &&
    Object.values(value.inheritedCertificationChecklist ?? {}).every(Boolean) &&
    Object.values(value.inheritedGateChecklist ?? {}).every(Boolean) &&
    value.inheritedDecisionReceiptSummary?.externalCallsZero === true &&
    value.inheritedHandoffPacketSummary?.externalCallsZero === true &&
    Array.isArray(value.inheritedBlockingReasons) &&
    value.inheritedBlockingReasons.every(safeBlockingReasonShape) &&
    Array.isArray(value.inheritedExceptionRows) &&
    value.inheritedExceptionRows.every(safeAttestationReconciliationExceptionShape) &&
    Array.isArray(value.operatorChecklist) &&
    value.operatorChecklist.every(safeOperatorChecklistItemShape) &&
    Array.isArray(value.acknowledgedChecklist) &&
    value.acknowledgedChecklist.every(safeAcknowledgedChecklistItemShape) &&
    Array.isArray(value.acknowledgementRows) &&
    value.acknowledgementRows.every(safeAcknowledgementRowShape) &&
    value.releaseOwnerSummary?.externalCallsZero === true &&
    Number.isInteger(value.counts?.acceptanceRecordCheckedCount) &&
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

function safeAcknowledgementRowShape(row) {
  return row &&
    typeof row.key === "string" &&
    typeof row.label === "string" &&
    ["acknowledged", "pending", "blocked"].includes(row.acknowledgementStatus) &&
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
    console.error(`Sprint 91 smoke failed: ${failed.map((result) => result.name).join(", ")}`);
    process.exitCode = 1;
    return;
  }
  console.log("Sprint 91 smoke passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
