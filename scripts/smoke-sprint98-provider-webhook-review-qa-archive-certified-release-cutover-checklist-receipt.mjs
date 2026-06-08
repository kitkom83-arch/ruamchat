import crypto from "node:crypto";
import { readFileSync } from "node:fs";

const baseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");
const tenantId = process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
const userId = process.env.USER_ID ?? "00000000-0000-4000-8000-000000000011";
const signingMaterial = process.env.PROVIDER_WEBHOOK_SANDBOX_SIGNING_KEY ?? "local-provider-webhook-sandbox-signing-material";
const runId = `sprint98-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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
  const sprint98Source = {
    shared: sourceSlice(shared, "providerWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistStatusSchema", "providerWebhookUnmatchedInboundBulkReviewRequestSchema"),
    providerController: sourceSlice(providerController, "control-room-packet/cutover-checklist-receipt", "review-closure-report/export"),
    providerService: [
      sourceSlice(providerService, "getReviewQaHandoffCertifiedReleaseCutoverChecklistReceipt(", "private getLockedArchiveContext"),
      sourceSlice(providerService, "function qaHandoffCertifiedReleaseCutoverChecklistReceiptResponse", "function safeRoomLabel")
    ].join("\n"),
    apiClient: sourceSlice(apiClient, "getProviderWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceipt", "getProviderWebhookReviewClosureReportExport"),
    settingsData: [
      sourceSlice(settingsData, "loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceiptData", "loadSettingsProviderWebhookReviewClosureReportRedactionAuditData"),
      sourceSlice(settingsData, "function createMockReviewQaHandoffCertifiedReleaseCutoverChecklistReceipt", "function mockCertifiedReleaseControlRoomReady")
    ].join("\n"),
    settingsPage: [
      sourceSlice(settingsPage, "reviewQaHandoffCertifiedReleaseCutoverChecklistReceipt", "reviewClosureReportRedactionAudit"),
      sourceSlice(settingsPage, "loadReviewQaHandoffCertifiedReleaseCutoverChecklistReceipt", "loadClosureReportRedactionAudit")
    ].join("\n"),
    providerPanel: [
      sourceSlice(providerPanel, "Load certified release cutover checklist receipt", "Audit report export redaction"),
      sourceSlice(providerPanel, "QA archive certified release cutover checklist receipt:", "reviewQaHandoffLockedArchive ?")
    ].join("\n")
  };

  record("smoke:sprint98 registered",
    rootPackage.scripts?.["smoke:sprint98"] === "node scripts/smoke-sprint98-provider-webhook-review-qa-archive-certified-release-cutover-checklist-receipt.mjs"
  );
  record("Sprint 97 regression smoke still registered",
    rootPackage.scripts?.["smoke:sprint97"] === "node scripts/smoke-sprint97-provider-webhook-review-qa-archive-certified-release-control-room-packet.mjs"
  );
  record("shared cutover checklist receipt DTO export",
    sprint98Source.shared.includes("providerWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceiptSchema") &&
    sprint98Source.shared.includes("ProviderWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceipt") &&
    sprint98Source.shared.includes('"pending"') &&
    sprint98Source.shared.includes('"verified"') &&
    sprint98Source.shared.includes('"blocked"') &&
    sprint98Source.shared.includes("operatorCommandStatus") &&
    sprint98Source.shared.includes("operatorCommandRows") &&
    sprint98Source.shared.includes("safeCutoverChecklistRows") &&
    sprint98Source.shared.includes("cutoverChecklistReceiptDigest") &&
    sprint98Source.shared.includes("externalCalls: z.literal(0)") &&
    sprint98Source.shared.includes(".strict()")
  );
  record("backend cutover checklist receipt route registration",
    providerController.includes('@Get("review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt/handoff-packet/acceptance-record/noop-execution-dryrun/result-ledger/final-readiness-certificate/freeze-audit-register/rollback-rehearsal-receipt/control-room-packet/cutover-checklist-receipt")') &&
    providerController.includes("getReviewQaHandoffCertifiedReleaseCutoverChecklistReceipt") &&
    providerController.includes("requireTenantId(tenant)")
  );
  record("service cutover checklist receipt implementation",
    sprint98Source.providerService.includes("qaHandoffCertifiedReleaseCutoverChecklistReceiptResponse") &&
    sprint98Source.providerService.includes("certifiedReleaseCutoverChecklistReceiptReady") &&
    sprint98Source.providerService.includes("cutoverChecklistReceiptMutationCount: 0") &&
    sprint98Source.providerService.includes("externalCalls: 0 as const")
  );
  record("API client cutover checklist receipt wiring",
    apiClient.includes("getProviderWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceipt") &&
    apiClient.includes("providerWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceiptSchema") &&
    apiClient.includes(`${cutoverChecklistReceiptPath}`)
  );
  record("settings-data cutover checklist receipt API mode has no fallback",
    /if \(mode === "api"\) \{\s*return \{\s*mode,\s*cutoverChecklistReceipt: await getProviderWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceipt/s.test(settingsData) &&
    settingsData.includes("createMockReviewQaHandoffCertifiedReleaseCutoverChecklistReceipt")
  );
  record("Settings > Channels cutover checklist receipt controls/results/errors",
    settingsPage.includes("QA Archive Certified Release Cutover Checklist Receipt API error") &&
    settingsPage.includes("clearReviewQaHandoffCertifiedReleaseCutoverChecklistReceipt") &&
    settingsPage.includes("onLoadReviewQaHandoffCertifiedReleaseCutoverChecklistReceipt={loadReviewQaHandoffCertifiedReleaseCutoverChecklistReceipt}") &&
    providerPanel.includes("Load certified release cutover checklist receipt") &&
    providerPanel.includes("QA archive certified release cutover checklist receipt:") &&
    providerPanel.includes("cutoverChecklistStatus=") &&
    providerPanel.includes("operatorCommandStatus=") &&
    providerPanel.includes("operatorCommandRows=") &&
    providerPanel.includes("safeCutoverChecklistRows=") &&
    providerPanel.includes("externalCalls=")
  );
  record("stale cutover checklist receipt clears on upstream reloads",
    settingsPage.includes("clearReviewQaHandoffCertifiedReleaseControlRoomPacket();") &&
    settingsPage.includes("clearReviewQaHandoffCertifiedReleaseCutoverChecklistReceipt();") &&
    settingsPage.includes("setReviewQaHandoffCertifiedReleaseCutoverChecklistReceipt(null)")
  );
  record("static Sprint 98 source has no provider outbound send markers", !containsProviderOutbound(sprint98Source));
  record("static Sprint 98 source has no external notification send markers", !containsExternalNotification(sprint98Source));
  record("static Sprint 98 source has no AI/OpenAI call markers", !containsAiCall(sprint98Source));

  const filters = "provider=line&eventType=message.created";
  const health = await safeJson(await request("GET", "/health"));
  record("GET /health reachable", health?.status === "ok" && health?.service === "api");

  const missingTenantReceipt = await requestJsonWithoutTenant("GET", `${cutoverChecklistReceiptPath}?${filters}`);
  record("cutover checklist receipt requires x-tenant-id", missingTenantReceipt.status >= 400 && missingTenantReceipt.status < 500);

  const incompleteTenant = `00000000-0000-4000-8000-${String(Date.now()).slice(-12)}`;
  const incompleteChainReceipt = await requestJson("GET", `${cutoverChecklistReceiptPath}?${filters}`, undefined, incompleteTenant);
  record("incomplete chain returns explicit 409", incompleteChainReceipt.status === 409 && /required|prerequisite|lock|archive|dry|rollback|control|packet|rehearsal/i.test(JSON.stringify(incompleteChainReceipt.body)));

  const cutoverItem = await createNoMatchItem("cutover-checklist-receipt", "Safe Sprint 98 certified release cutover checklist receipt target");
  record("create safe sandbox no-match item", cutoverItem?.unmatchedStatus === "review-needed");

  const receiptSignOff = await safeJson(await request("POST", `/provider-webhooks/review-qa-handoff-bundle/receipt/sign-off?${filters}`, {
    acknowledgementType: "sign_off",
    reviewerRole: "QA reviewer",
    reviewerLabel: "safe sprint98 reviewer"
  }));
  const lock = await safeJson(await request("POST", `/provider-webhooks/review-qa-handoff-bundle/acceptance-lock?${filters}`, {
    lockReason: "Safe Sprint 98 certified release cutover checklist receipt accepted",
    acceptedByRole: "QA lead",
    acceptedByLabel: "safe sprint98 reviewer"
  }));
  const archive = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive?${filters}`));
  const exportedArchive = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/export?${filters}`));
  const manifest = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/retention-manifest?${filters}`));
  const integrity = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/integrity?${filters}`));
  const retentionAudit = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/retention-audit?${filters}`));
  const finalization = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization?${filters}`));
  const signOff = await safeJson(await request("POST", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/sign-off?${filters}`, {
    reviewerRole: "retention reviewer",
    reviewerLabel: "safe sprint98 reviewer"
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
    acknowledgedByLabel: "safe sprint98 release owner",
    acknowledgedChecklistKeys: handoffPacket.operatorChecklist.map((item) => item.key)
  }));
  const initialDryRun = await safeJson(await request("GET", `${noopExecutionDryRunPath}?${filters}`));
  const executedDryRun = await safeJson(await request("POST", `${noopExecutionDryRunPath}?${filters}`, {
    requestedBy: "safe sprint98 release owner",
    checklistAcknowledged: true,
    operatorNote: "Safe no-op execution dry-run from Sprint 98 smoke",
    dryRunReason: "safe no-op execution readiness rehearsal",
    executionMode: "no_op"
  }));
  const dryRunReadback = await safeJson(await request("GET", `${noopExecutionDryRunPath}?${filters}`));
  const resultLedger = await safeJson(await request("GET", `${resultLedgerPath}?${filters}`));
  const certificate = await safeJson(await request("GET", `${finalReadinessCertificatePath}?${filters}`));
  const register = await safeJson(await request("GET", `${freezeAuditRegisterPath}?${filters}`));
  const rollbackReceipt = await safeJson(await request("GET", `${rollbackRehearsalReceiptPath}?${filters}`));
  const controlRoomPacket = await safeJson(await request("GET", `${controlRoomPacketPath}?${filters}`));
  const beforeReceiptPage = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound?provider=line&limit=25&offset=0&sortBy=receivedAt&sortOrder=desc"));
  const stateBeforeReceiptRead = unmatchedItems(beforeReceiptPage).find((item) => item.id === cutoverItem.id);
  const cutoverChecklistReceipt = await safeJson(await request("GET", `${cutoverChecklistReceiptPath}?${filters}`));
  const afterReceiptPage = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound?provider=line&limit=25&offset=0&sortBy=receivedAt&sortOrder=desc"));
  const stateAfterReceiptRead = unmatchedItems(afterReceiptPage).find((item) => item.id === cutoverItem.id);
  const invalidTenantReceipt = await requestJson("GET", `${cutoverChecklistReceiptPath}?${filters}`, undefined, "00000000-0000-4000-8000-000000000098");

  record("complete/load safe chain through Sprint 97 certified release control room packet", [receiptSignOff, lock, archive, exportedArchive, manifest, integrity, retentionAudit, finalization, signOff, receipt, releaseEvidence, releaseVerification, releaseCertification, closureLedger, attestationAudit, reconciliation, releaseGate, decisionReceipt, handoffPacket, initialAcceptanceRecord, acknowledgedRecord, initialDryRun, executedDryRun, dryRunReadback, resultLedger, certificate, register, rollbackReceipt, controlRoomPacket].every(Boolean));
  record("GET Sprint 98 cutover checklist receipt endpoint", safeCutoverChecklistReceiptShape(cutoverChecklistReceipt));

  record("cutoverChecklistStatus verified", cutoverChecklistReceipt.cutoverChecklistStatus === "verified");
  record("operatorCommandStatus ready", cutoverChecklistReceipt.operatorCommandStatus === "ready");
  record("controlRoomStatus ready", cutoverChecklistReceipt.controlRoomStatus === "ready");
  record("cutoverReadinessStatus ready", cutoverChecklistReceipt.cutoverReadinessStatus === "ready");
  record("rollbackRehearsalStatus verified", cutoverChecklistReceipt.rollbackRehearsalStatus === "verified");
  record("recoveryReadinessStatus ready", cutoverChecklistReceipt.recoveryReadinessStatus === "ready");
  record("rollbackReadinessStatus ready", cutoverChecklistReceipt.rollbackReadinessStatus === "ready");
  record("freezeAuditStatus recorded", cutoverChecklistReceipt.freezeAuditStatus === "recorded");
  record("freezeStatus frozen", cutoverChecklistReceipt.freezeStatus === "frozen");
  record("certificateStatus issued", cutoverChecklistReceipt.certificateStatus === "issued");
  record("finalReadinessStatus ready", cutoverChecklistReceipt.finalReadinessStatus === "ready");
  record("ledgerStatus recorded", cutoverChecklistReceipt.ledgerStatus === "recorded");
  record("dryRunStatus passed", cutoverChecklistReceipt.dryRunStatus === "passed");
  record("executionMode no_op", cutoverChecklistReceipt.executionMode === "no_op");
  record("acceptanceStatus acknowledged", cutoverChecklistReceipt.acceptanceStatus === "acknowledged");
  record("handoffStatus ready", cutoverChecklistReceipt.handoffStatus === "ready");
  record("releaseDecision go", cutoverChecklistReceipt.releaseDecision === "go");
  record("packetStatus issued", cutoverChecklistReceipt.packetStatus === "issued");
  record("receiptStatus issued", cutoverChecklistReceipt.receiptStatus === "issued");
  record("gateStatus ready", cutoverChecklistReceipt.gateStatus === "ready");
  record("goNoGoDecision go", cutoverChecklistReceipt.goNoGoDecision === "go");
  record("reconciliationStatus complete/aligned", ["complete", "aligned"].includes(cutoverChecklistReceipt.reconciliationStatus));
  record("attestationStatus complete", cutoverChecklistReceipt.attestationStatus === "complete");
  record("closure ledger status certified_release_closed", cutoverChecklistReceipt.ledgerStatusFromClosure === "certified_release_closed");
  record("certificationStatus certified", cutoverChecklistReceipt.certificationStatus === "certified");
  record("releaseReadinessStatus ready_for_release", cutoverChecklistReceipt.releaseReadinessStatus === "ready_for_release");
  record("verificationStatus verified", cutoverChecklistReceipt.verificationStatus === "verified");
  record("digestChainStatus confirmed", cutoverChecklistReceipt.digestChainStatus === "confirmed");
  record("prerequisite checklist complete", Object.values(cutoverChecklistReceipt.inheritedPrerequisiteChecklist ?? {}).every(Boolean));
  record("certification checklist complete", Object.values(cutoverChecklistReceipt.inheritedCertificationChecklist ?? {}).every(Boolean));
  record("gate checklist complete", Object.values(cutoverChecklistReceipt.inheritedGateChecklist ?? {}).every(Boolean));
  record("decision receipt summary present", cutoverChecklistReceipt.inheritedDecisionReceiptSummary?.receiptRowCount >= 13 && cutoverChecklistReceipt.inheritedDecisionReceiptSummary?.externalCallsZero === true);
  record("handoff packet summary present", cutoverChecklistReceipt.inheritedHandoffPacketSummary?.packetStatus === "issued");
  record("acceptance summary present", cutoverChecklistReceipt.inheritedAcceptanceSummary?.acceptanceStatus === "acknowledged");
  record("no-op dry-run summary present", cutoverChecklistReceipt.inheritedNoopDryRunSummary?.dryRunStatus === "passed");
  record("dry-run result ledger summary present", cutoverChecklistReceipt.inheritedResultLedgerSummary?.ledgerStatus === "recorded");
  record("final readiness certificate summary present", cutoverChecklistReceipt.inheritedFinalReadinessCertificateSummary?.certificateStatus === "issued");
  record("freeze audit summary present", cutoverChecklistReceipt.inheritedFreezeAuditSummary?.freezeAuditStatus === "recorded");
  record("rollback rehearsal summary present", cutoverChecklistReceipt.inheritedRollbackRehearsalSummary?.rollbackRehearsalStatus === "verified");
  record("control room summary present", cutoverChecklistReceipt.inheritedControlRoomSummary?.controlRoomStatus === "ready" && cutoverChecklistReceipt.inheritedControlRoomSummary?.externalCallsZero === true);
  record("operatorChecklist present", Array.isArray(cutoverChecklistReceipt.operatorChecklist) && cutoverChecklistReceipt.operatorChecklist.length > 0);
  record("acknowledgedChecklist present", Array.isArray(cutoverChecklistReceipt.acknowledgedChecklist) && cutoverChecklistReceipt.acknowledgedChecklist.length > 0);
  record("executionChecklist present", Array.isArray(cutoverChecklistReceipt.executionChecklist) && cutoverChecklistReceipt.executionChecklist.length > 0);
  record("controlRoomRows present", Array.isArray(cutoverChecklistReceipt.controlRoomRows) && cutoverChecklistReceipt.controlRoomRows.length > 0 && cutoverChecklistReceipt.controlRoomRows.every(safeControlRoomRowShape));
  record("cutoverChecklistRows present", Array.isArray(cutoverChecklistReceipt.cutoverChecklistRows) && cutoverChecklistReceipt.cutoverChecklistRows.length > 0 && cutoverChecklistReceipt.cutoverChecklistRows.every(safeControlRoomRowShape));
  record("operatorHandoffRows present", Array.isArray(cutoverChecklistReceipt.operatorHandoffRows) && cutoverChecklistReceipt.operatorHandoffRows.length > 0 && cutoverChecklistReceipt.operatorHandoffRows.every(safeControlRoomRowShape));
  record("operatorCommandRows present", Array.isArray(cutoverChecklistReceipt.operatorCommandRows) && cutoverChecklistReceipt.operatorCommandRows.length > 0 && cutoverChecklistReceipt.operatorCommandRows.every(safeCutoverChecklistRowShape));
  record("safeCutoverChecklistRows present", Array.isArray(cutoverChecklistReceipt.safeCutoverChecklistRows) && cutoverChecklistReceipt.safeCutoverChecklistRows.length > 0 && cutoverChecklistReceipt.safeCutoverChecklistRows.every(safeCutoverChecklistRowShape));
  record("releaseOwnerSummary present", cutoverChecklistReceipt.releaseOwnerSummary?.ownerRole === "release owner");
  record("safe digests only", safeDigestLinks(cutoverChecklistReceipt));
  record("inheritedBlockingReasons safe", Array.isArray(cutoverChecklistReceipt.inheritedBlockingReasons) && safePayloadObject(cutoverChecklistReceipt.inheritedBlockingReasons));
  record("inheritedExceptionRows safe", Array.isArray(cutoverChecklistReceipt.inheritedExceptionRows) && safePayloadObject(cutoverChecklistReceipt.inheritedExceptionRows));
  record("counts present", Number.isInteger(cutoverChecklistReceipt.counts?.cutoverChecklistReceiptCheckedCount) && cutoverChecklistReceipt.counts?.cutoverChecklistReceiptMutationCount === 0 && cutoverChecklistReceipt.counts?.operatorCommandRowCount === cutoverChecklistReceipt.operatorCommandRows.length);
  record("externalCalls=0", cutoverChecklistReceipt.externalCalls === 0);
  record("GET no mutation before/after cutover checklist receipt read", metadataOnlyStateMatches(stateBeforeReceiptRead, stateAfterReceiptRead) && cutoverChecklistReceipt.counts.cutoverChecklistReceiptMutationCount === 0);
  record("no review/link/message/unmatched/archive/release state mutation", metadataOnlyStateMatches(stateBeforeReceiptRead, stateAfterReceiptRead));
  record("invalid tenant access does not return mock fallback", invalidTenantReceipt.status === 409 && !JSON.stringify(invalidTenantReceipt.body).includes("mockqahandoffcertifiedreleasecutoverchecklistreceipt"));
  record("no stale/fake cutover checklist receipt", !JSON.stringify(cutoverChecklistReceipt).includes("mockqahandoffcertifiedreleasecutoverchecklistreceipt"));
  record("externalCalls=0 throughout", noNonzeroExternalCalls({ health, receiptSignOff, lock, archive, exportedArchive, manifest, integrity, retentionAudit, finalization, signOff, receipt, releaseEvidence, releaseVerification, releaseCertification, closureLedger, attestationAudit, reconciliation, releaseGate, decisionReceipt, handoffPacket, initialAcceptanceRecord, acknowledgedRecord, initialDryRun, executedDryRun, dryRunReadback, resultLedger, certificate, register, rollbackReceipt, controlRoomPacket, cutoverChecklistReceipt, afterReceiptPage }));
  record("no provider outbound", !containsProviderOutbound({ cutoverChecklistReceipt, controlRoomPacket, rollbackReceipt, register, certificate, resultLedger, executedDryRun, acknowledgedRecord, handoffPacket, decisionReceipt, releaseGate }));
  record("no external notification", !containsExternalNotification({ cutoverChecklistReceipt, controlRoomPacket, rollbackReceipt, register, certificate, resultLedger, executedDryRun, acknowledgedRecord, handoffPacket, decisionReceipt, releaseGate }));
  record("no AI/OpenAI call evidence", !containsAiCall({ cutoverChecklistReceipt, controlRoomPacket, rollbackReceipt, register, certificate, resultLedger, executedDryRun, acknowledgedRecord, handoffPacket, decisionReceipt, releaseGate }));
  record("no raw provider material leakage", safePayloadObject({ incompleteChainReceipt, missingTenantReceipt, invalidTenantReceipt, receiptSignOff, lock, archive, exportedArchive, manifest, integrity, retentionAudit, finalization, signOff, receipt, releaseEvidence, releaseVerification, releaseCertification, closureLedger, attestationAudit, reconciliation, releaseGate, decisionReceipt, handoffPacket, initialAcceptanceRecord, acknowledgedRecord, initialDryRun, executedDryRun, dryRunReadback, resultLedger, certificate, register, rollbackReceipt, controlRoomPacket, cutoverChecklistReceipt, afterReceiptPage }));

  finish();
}

async function createNoMatchItem(label, text) {
  const eventId = `${runId}-${label}-${Math.random().toString(16).slice(2)}`;
  const payload = linePayload(`safe-no-match-room-sprint98-${label}-${runId}`, `safe-sender-sprint98-${label}`, text);
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

function linePayload(roomId, userIdValue, text) {
  return {
    destination: "safe-sprint98-destination",
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
  return fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      "x-tenant-id": tenant,
      "x-user-id": userId
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
}

async function requestJson(method, path, body, tenant = tenantId) {
  const response = await request(method, path, body, tenant);
  return { status: response.status, body: await safeJson(response) };
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

function safeCutoverChecklistReceiptShape(value) {
  return value &&
    value.receiptKind === "qa-handoff-locked-archive-certified-release-cutover-checklist-receipt" &&
    value.cutoverChecklistStatus === "verified" &&
    value.operatorCommandStatus === "ready" &&
    value.safeFilename === "provider-webhook-review-qa-handoff-certified-release-cutover-checklist-receipt.json" &&
    value.safeDigest === value.cutoverChecklistReceiptDigest &&
    value.externalCalls === 0;
}

function safeControlRoomRowShape(row) {
  return row &&
    typeof row.key === "string" &&
    typeof row.label === "string" &&
    row.controlRoomStatus === "ready" &&
    row.cutoverReadinessStatus === "ready" &&
    typeof row.safeDigest === "string" &&
    row.safeDigest.startsWith("sha256:") &&
    Number.isInteger(row.checkedCount) &&
    row.checkedCount >= 0 &&
    row.complete === true;
}

function safeCutoverChecklistRowShape(row) {
  return row &&
    typeof row.key === "string" &&
    typeof row.label === "string" &&
    row.cutoverChecklistStatus === "verified" &&
    row.operatorCommandStatus === "ready" &&
    typeof row.safeDigest === "string" &&
    row.safeDigest.startsWith("sha256:") &&
    Number.isInteger(row.checkedCount) &&
    row.checkedCount >= 0 &&
    row.complete === true;
}

function safeDigestLinks(value) {
  const digests = Object.entries(value)
    .filter(([key]) => /Digest$/.test(key) || key === "safeDigest")
    .map(([, digest]) => digest);
  return digests.length >= 16 && digests.every((digest) => typeof digest === "string" && /^sha256:[a-z0-9-]+$/i.test(digest));
}

function metadataOnlyStateMatches(before, after) {
  if (!before || !after) return false;
  const keys = [
    "reviewStatus",
    "linkStatus",
    "unmatchedStatus",
    "assignmentStatus",
    "escalationStatus",
    "resolutionStatus",
    "messagePersisted",
    "linkedConversationId",
    "linkedMessageId"
  ];
  return keys.every((key) => before[key] === after[key]);
}

function noNonzeroExternalCalls(value) {
  if (Array.isArray(value)) return value.every(noNonzeroExternalCalls);
  if (!value || typeof value !== "object") return true;
  if (Object.prototype.hasOwnProperty.call(value, "externalCalls") && value.externalCalls !== 0) return false;
  return Object.values(value).every(noNonzeroExternalCalls);
}

function safePayloadObject(value) {
  return !/"rawPayload"\s*:|"rawSignature"\s*:|"replyToken"\s*:|raw-line|raw-room|raw-sender|"senderId"\s*:|"roomId"\s*:|"token"\s*:|"secret"\s*:|"authorization"\s*:|"cookie"\s*:|providerRaw|payloadJson|accessToken|webhookSecret/i.test(JSON.stringify(value));
}

function containsProviderOutbound(value) {
  return /line\.push|line\.reply|telegram\.send|facebook\.send|instagram\.send|provider_webhook\.outbound|outbound\.queued|outbound\.sent|sendProvider/i.test(JSON.stringify(value));
}

function containsExternalNotification(value) {
  return /sendEmail|sendSms|sendNotification|notification sent|webhook notify|slack|discord/i.test(JSON.stringify(value));
}

function containsAiCall(value) {
  return /openai|chat\.completions|responses\.create|aiDecision|llm|model:/i.test(JSON.stringify(value));
}

function isLocalBaseUrl(url) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(url);
}

function sourceSlice(source, startNeedle, endNeedle) {
  const start = source.indexOf(startNeedle);
  if (start === -1) return "";
  const end = source.indexOf(endNeedle, start + startNeedle.length);
  return source.slice(start, end === -1 ? undefined : end);
}

function record(name, pass) {
  results.push({ name, pass: Boolean(pass) });
  console.log(`${pass ? "PASS" : "FAIL"} ${name}`);
}

function finish() {
  const failed = results.filter((result) => !result.pass);
  console.log(`\nSprint 98 smoke complete: ${results.length - failed.length}/${results.length} passed`);
  if (failed.length > 0) {
    console.error("Failed checks:");
    for (const result of failed) console.error(`- ${result.name}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
