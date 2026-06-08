import crypto from "node:crypto";
import { readFileSync } from "node:fs";

const baseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");
const tenantId = process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
const userId = process.env.USER_ID ?? "00000000-0000-4000-8000-000000000011";
const signingMaterial = process.env.PROVIDER_WEBHOOK_SANDBOX_SIGNING_KEY ?? "local-provider-webhook-sandbox-signing-material";
const runId = `sprint97-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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
  const sprint97Source = {
    shared: sourceSlice(shared, "providerWebhookReviewQaHandoffCertifiedReleaseControlRoomStatusSchema", "providerWebhookUnmatchedInboundBulkReviewRequestSchema"),
    providerController: sourceSlice(providerController, "rollback-rehearsal-receipt/control-room-packet", "review-closure-report/export"),
    providerService: [
      sourceSlice(providerService, "getReviewQaHandoffCertifiedReleaseControlRoomPacket(", "private getLockedArchiveContext"),
      sourceSlice(providerService, "function qaHandoffCertifiedReleaseControlRoomPacketResponse", "function safeRoomLabel")
    ].join("\n"),
    apiClient: sourceSlice(apiClient, "getProviderWebhookReviewQaHandoffCertifiedReleaseControlRoomPacket", "getProviderWebhookReviewClosureReportExport"),
    settingsData: [
      sourceSlice(settingsData, "loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseControlRoomPacketData", "loadSettingsProviderWebhookReviewClosureReportRedactionAuditData"),
      sourceSlice(settingsData, "function createMockReviewQaHandoffCertifiedReleaseControlRoomPacket", "function mockCertifiedReleaseFreezeAuditRegisterReady")
    ].join("\n"),
    settingsPage: [
      sourceSlice(settingsPage, "reviewQaHandoffCertifiedReleaseControlRoomPacket", "reviewClosureReportRedactionAudit"),
      sourceSlice(settingsPage, "loadReviewQaHandoffCertifiedReleaseControlRoomPacket", "loadClosureReportRedactionAudit")
    ].join("\n"),
    providerPanel: [
      sourceSlice(providerPanel, "Load certified release control room packet", "Audit report export redaction"),
      sourceSlice(providerPanel, "QA archive certified release control room packet:", "reviewQaHandoffLockedArchive ?")
    ].join("\n")
  };

  record("smoke:sprint97 registered",
    rootPackage.scripts?.["smoke:sprint97"] === "node scripts/smoke-sprint97-provider-webhook-review-qa-archive-certified-release-control-room-packet.mjs"
  );
  record("Sprint 96 regression smoke still registered",
    rootPackage.scripts?.["smoke:sprint96"] === "node scripts/smoke-sprint96-provider-webhook-review-qa-archive-certified-release-rollback-rehearsal-receipt.mjs"
  );
  record("shared control room packet DTO export",
    sprint97Source.shared.includes("providerWebhookReviewQaHandoffCertifiedReleaseControlRoomPacketSchema") &&
    sprint97Source.shared.includes("ProviderWebhookReviewQaHandoffCertifiedReleaseControlRoomPacket") &&
    sprint97Source.shared.includes('"pending"') &&
    sprint97Source.shared.includes('"incomplete"') &&
    sprint97Source.shared.includes("controlRoomStatus") &&
    sprint97Source.shared.includes("cutoverReadinessStatus") &&
    sprint97Source.shared.includes("controlRoomRows") &&
    sprint97Source.shared.includes("externalCalls: z.literal(0)") &&
    sprint97Source.shared.includes(".strict()")
  );
  record("backend control room packet route registration",
    providerController.includes('@Get("review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt/handoff-packet/acceptance-record/noop-execution-dryrun/result-ledger/final-readiness-certificate/freeze-audit-register/rollback-rehearsal-receipt/control-room-packet")') &&
    providerController.includes("getReviewQaHandoffCertifiedReleaseControlRoomPacket") &&
    providerController.includes("requireTenantId(tenant)")
  );
  record("service control room packet implementation",
    providerService.includes("qaHandoffCertifiedReleaseControlRoomPacketResponse") &&
    providerService.includes("certifiedReleaseControlRoomReady") &&
    providerService.includes("controlRoomPacketMutationCount: 0") &&
    providerService.includes("externalCalls: 0 as const")
  );
  record("API client control room packet wiring",
    apiClient.includes("getProviderWebhookReviewQaHandoffCertifiedReleaseControlRoomPacket") &&
    apiClient.includes("providerWebhookReviewQaHandoffCertifiedReleaseControlRoomPacketSchema") &&
    apiClient.includes(`${controlRoomPacketPath}`)
  );
  record("settings-data control room packet API mode has no fallback",
    /if \(mode === "api"\) \{\s*return \{\s*mode,\s*controlRoomPacket: await getProviderWebhookReviewQaHandoffCertifiedReleaseControlRoomPacket/s.test(settingsData) &&
    settingsData.includes("createMockReviewQaHandoffCertifiedReleaseControlRoomPacket")
  );
  record("Settings > Channels control room packet controls/results/errors",
    settingsPage.includes("QA Archive Certified Release Control Room Packet API error") &&
    settingsPage.includes("clearReviewQaHandoffCertifiedReleaseControlRoomPacket") &&
    settingsPage.includes("onLoadReviewQaHandoffCertifiedReleaseControlRoomPacket={loadReviewQaHandoffCertifiedReleaseControlRoomPacket}") &&
    providerPanel.includes("Load certified release control room packet") &&
    providerPanel.includes("QA archive certified release control room packet:") &&
    providerPanel.includes("controlRoomStatus=") &&
    providerPanel.includes("cutoverReadinessStatus=") &&
    providerPanel.includes("controlRoomRows=") &&
    providerPanel.includes("operatorHandoffRows=") &&
    providerPanel.includes("externalCalls=")
  );
  record("static Sprint 97 source has no provider outbound send markers", !containsProviderOutbound(sprint97Source));
  record("static Sprint 97 source has no external notification send markers", !containsExternalNotification(sprint97Source));
  record("static Sprint 97 source has no AI/OpenAI call markers", !containsAiCall(sprint97Source));

  const filters = "provider=line&eventType=message.created";
  const health = await safeJson(await request("GET", "/health"));
  record("GET /health reachable", health?.status === "ok" && health?.service === "api");

  const missingTenantPacket = await requestJsonWithoutTenant("GET", `${controlRoomPacketPath}?${filters}`);
  record("control room packet requires x-tenant-id", missingTenantPacket.status >= 400 && missingTenantPacket.status < 500);

  const controlRoomItem = await createNoMatchItem("control-room-packet", "Safe Sprint 97 certified release control room packet target");
  record("create safe sandbox no-match item", controlRoomItem?.unmatchedStatus === "review-needed");

  const packetBeforePrerequisites = await requestJson("GET", `${controlRoomPacketPath}?${filters}`);
  const receiptSignOff = await safeJson(await request("POST", `/provider-webhooks/review-qa-handoff-bundle/receipt/sign-off?${filters}`, {
    acknowledgementType: "sign_off",
    reviewerRole: "QA reviewer",
    reviewerLabel: "safe sprint97 reviewer"
  }));
  const lock = await safeJson(await request("POST", `/provider-webhooks/review-qa-handoff-bundle/acceptance-lock?${filters}`, {
    lockReason: "Safe Sprint 97 certified release control room packet accepted",
    acceptedByRole: "QA lead",
    acceptedByLabel: "safe sprint97 reviewer"
  }));
  const archive = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive?${filters}`));
  const exportedArchive = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/export?${filters}`));
  const manifest = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/retention-manifest?${filters}`));
  const integrity = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/integrity?${filters}`));
  const retentionAudit = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/retention-audit?${filters}`));
  const finalization = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization?${filters}`));
  const signOff = await safeJson(await request("POST", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/sign-off?${filters}`, {
    reviewerRole: "retention reviewer",
    reviewerLabel: "safe sprint97 reviewer"
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
    acknowledgedByLabel: "safe sprint97 release owner",
    acknowledgedChecklistKeys: handoffPacket.operatorChecklist.map((item) => item.key)
  }));
  const initialDryRun = await safeJson(await request("GET", `${noopExecutionDryRunPath}?${filters}`));
  const executedDryRun = await safeJson(await request("POST", `${noopExecutionDryRunPath}?${filters}`, {
    requestedBy: "safe sprint97 release owner",
    checklistAcknowledged: true,
    operatorNote: "Safe no-op execution dry-run from Sprint 97 smoke",
    dryRunReason: "safe no-op execution readiness rehearsal",
    executionMode: "no_op"
  }));
  const dryRunReadback = await safeJson(await request("GET", `${noopExecutionDryRunPath}?${filters}`));
  const resultLedger = await safeJson(await request("GET", `${resultLedgerPath}?${filters}`));
  const certificate = await safeJson(await request("GET", `${finalReadinessCertificatePath}?${filters}`));
  const register = await safeJson(await request("GET", `${freezeAuditRegisterPath}?${filters}`));
  const rollbackReceipt = await safeJson(await request("GET", `${rollbackRehearsalReceiptPath}?${filters}`));
  const beforePacketPage = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound?provider=line&limit=25&offset=0&sortBy=receivedAt&sortOrder=desc"));
  const stateBeforePacketRead = unmatchedItems(beforePacketPage).find((item) => item.id === controlRoomItem.id);
  const controlRoomPacket = await safeJson(await request("GET", `${controlRoomPacketPath}?${filters}`));
  const afterPacketPage = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound?provider=line&limit=25&offset=0&sortBy=receivedAt&sortOrder=desc"));
  const stateAfterPacketRead = unmatchedItems(afterPacketPage).find((item) => item.id === controlRoomItem.id);
  const invalidTenantPacket = await requestJson("GET", `${controlRoomPacketPath}?${filters}`, undefined, "00000000-0000-4000-8000-000000000097");

  record("incomplete chain returns explicit 409", packetBeforePrerequisites.status === 409 && /required|prerequisite|lock|archive|dry|rollback|rehearsal/i.test(JSON.stringify(packetBeforePrerequisites.body)));
  record("complete/load safe chain through Sprint 96 rollback rehearsal receipt", [receiptSignOff, lock, archive, exportedArchive, manifest, integrity, retentionAudit, finalization, signOff, receipt, releaseEvidence, releaseVerification, releaseCertification, closureLedger, attestationAudit, reconciliation, releaseGate, decisionReceipt, handoffPacket, initialAcceptanceRecord, acknowledgedRecord, initialDryRun, executedDryRun, dryRunReadback, resultLedger, certificate, register, rollbackReceipt].every(Boolean));
  record("GET Sprint 97 control room packet endpoint", safeControlRoomPacketShape(controlRoomPacket));

  record("controlRoomStatus ready", controlRoomPacket.controlRoomStatus === "ready");
  record("cutoverReadinessStatus ready", controlRoomPacket.cutoverReadinessStatus === "ready");
  record("rollbackRehearsalStatus verified", controlRoomPacket.rollbackRehearsalStatus === "verified");
  record("recoveryReadinessStatus ready", controlRoomPacket.recoveryReadinessStatus === "ready");
  record("rollbackReadinessStatus ready", controlRoomPacket.rollbackReadinessStatus === "ready");
  record("freezeAuditStatus recorded", controlRoomPacket.freezeAuditStatus === "recorded");
  record("freezeStatus frozen", controlRoomPacket.freezeStatus === "frozen");
  record("certificateStatus issued", controlRoomPacket.certificateStatus === "issued");
  record("finalReadinessStatus ready", controlRoomPacket.finalReadinessStatus === "ready");
  record("ledgerStatus recorded", controlRoomPacket.ledgerStatus === "recorded");
  record("dryRunStatus passed", controlRoomPacket.dryRunStatus === "passed");
  record("executionMode no_op", controlRoomPacket.executionMode === "no_op");
  record("acceptanceStatus acknowledged", controlRoomPacket.acceptanceStatus === "acknowledged");
  record("handoffStatus ready", controlRoomPacket.handoffStatus === "ready");
  record("releaseDecision go", controlRoomPacket.releaseDecision === "go");
  record("packetStatus issued", controlRoomPacket.packetStatus === "issued");
  record("receiptStatus issued", controlRoomPacket.receiptStatus === "issued");
  record("gateStatus ready", controlRoomPacket.gateStatus === "ready");
  record("goNoGoDecision go", controlRoomPacket.goNoGoDecision === "go");
  record("reconciliationStatus complete/aligned", ["complete", "aligned"].includes(controlRoomPacket.reconciliationStatus));
  record("attestationStatus complete", controlRoomPacket.attestationStatus === "complete");
  record("closure ledger status certified_release_closed", controlRoomPacket.ledgerStatusFromClosure === "certified_release_closed");
  record("certificationStatus certified", controlRoomPacket.certificationStatus === "certified");
  record("releaseReadinessStatus ready_for_release", controlRoomPacket.releaseReadinessStatus === "ready_for_release");
  record("verificationStatus verified", controlRoomPacket.verificationStatus === "verified");
  record("digestChainStatus confirmed", controlRoomPacket.digestChainStatus === "confirmed");
  record("prerequisite checklist complete", Object.values(controlRoomPacket.inheritedPrerequisiteChecklist ?? {}).every(Boolean));
  record("certification checklist complete", Object.values(controlRoomPacket.inheritedCertificationChecklist ?? {}).every(Boolean));
  record("gate checklist complete", Object.values(controlRoomPacket.inheritedGateChecklist ?? {}).every(Boolean));
  record("decision receipt summary present", controlRoomPacket.inheritedDecisionReceiptSummary?.receiptRowCount >= 13 && controlRoomPacket.inheritedDecisionReceiptSummary?.externalCallsZero === true);
  record("handoff packet summary present", controlRoomPacket.inheritedHandoffPacketSummary?.packetStatus === "issued");
  record("acceptance summary present", controlRoomPacket.inheritedAcceptanceSummary?.acceptanceStatus === "acknowledged");
  record("no-op dry-run summary present", controlRoomPacket.inheritedNoopDryRunSummary?.dryRunStatus === "passed");
  record("dry-run result ledger summary present", controlRoomPacket.inheritedResultLedgerSummary?.ledgerStatus === "recorded");
  record("final readiness certificate summary present", controlRoomPacket.inheritedFinalReadinessCertificateSummary?.certificateStatus === "issued");
  record("freeze audit summary present", controlRoomPacket.inheritedFreezeAuditSummary?.freezeAuditStatus === "recorded");
  record("rollback rehearsal summary present", controlRoomPacket.inheritedRollbackRehearsalSummary?.rollbackRehearsalStatus === "verified");
  record("operatorChecklist present", Array.isArray(controlRoomPacket.operatorChecklist) && controlRoomPacket.operatorChecklist.length > 0);
  record("acknowledgedChecklist present", Array.isArray(controlRoomPacket.acknowledgedChecklist) && controlRoomPacket.acknowledgedChecklist.length > 0);
  record("executionChecklist present", Array.isArray(controlRoomPacket.executionChecklist) && controlRoomPacket.executionChecklist.length > 0);
  record("rollbackRehearsalRows present", Array.isArray(controlRoomPacket.rollbackRehearsalRows) && controlRoomPacket.rollbackRehearsalRows.length > 0);
  record("recoveryPlanRows present", Array.isArray(controlRoomPacket.recoveryPlanRows) && controlRoomPacket.recoveryPlanRows.length > 0);
  record("recoveryReadinessRows present", Array.isArray(controlRoomPacket.recoveryReadinessRows) && controlRoomPacket.recoveryReadinessRows.length > 0);
  record("controlRoomRows present", Array.isArray(controlRoomPacket.controlRoomRows) && controlRoomPacket.controlRoomRows.length > 0 && controlRoomPacket.controlRoomRows.every(safeControlRoomRowShape));
  record("cutoverChecklistRows present", Array.isArray(controlRoomPacket.cutoverChecklistRows) && controlRoomPacket.cutoverChecklistRows.length > 0 && controlRoomPacket.cutoverChecklistRows.every(safeControlRoomRowShape));
  record("operatorHandoffRows present", Array.isArray(controlRoomPacket.operatorHandoffRows) && controlRoomPacket.operatorHandoffRows.length > 0 && controlRoomPacket.operatorHandoffRows.every(safeControlRoomRowShape));
  record("releaseOwnerSummary present", controlRoomPacket.releaseOwnerSummary?.ownerRole === "release owner");
  record("safe digests only", safeDigestLinks(controlRoomPacket));
  record("inheritedBlockingReasons safe", Array.isArray(controlRoomPacket.inheritedBlockingReasons) && safePayloadObject(controlRoomPacket.inheritedBlockingReasons));
  record("inheritedExceptionRows safe", Array.isArray(controlRoomPacket.inheritedExceptionRows) && safePayloadObject(controlRoomPacket.inheritedExceptionRows));
  record("counts present", Number.isInteger(controlRoomPacket.counts?.controlRoomPacketCheckedCount) && controlRoomPacket.counts?.controlRoomPacketMutationCount === 0 && controlRoomPacket.counts?.controlRoomRowCount === controlRoomPacket.controlRoomRows.length);
  record("externalCalls=0", controlRoomPacket.externalCalls === 0);
  record("GET no mutation before/after control room packet read", metadataOnlyStateMatches(stateBeforePacketRead, stateAfterPacketRead) && controlRoomPacket.counts.controlRoomPacketMutationCount === 0);
  record("no review/link/message/unmatched/archive/release state mutation", metadataOnlyStateMatches(stateBeforePacketRead, stateAfterPacketRead));
  record("invalid tenant access does not return mock fallback", invalidTenantPacket.status === 409 && !JSON.stringify(invalidTenantPacket.body).includes("mockqahandoffcertifiedreleasecontrolroompacket"));
  record("no stale/fake control room packet", !JSON.stringify(controlRoomPacket).includes("mockqahandoffcertifiedreleasecontrolroompacket"));
  record("externalCalls=0 throughout", noNonzeroExternalCalls({ health, receiptSignOff, lock, archive, exportedArchive, manifest, integrity, retentionAudit, finalization, signOff, receipt, releaseEvidence, releaseVerification, releaseCertification, closureLedger, attestationAudit, reconciliation, releaseGate, decisionReceipt, handoffPacket, initialAcceptanceRecord, acknowledgedRecord, initialDryRun, executedDryRun, dryRunReadback, resultLedger, certificate, register, rollbackReceipt, controlRoomPacket, afterPacketPage }));
  record("no provider outbound", !containsProviderOutbound({ controlRoomPacket, rollbackReceipt, register, certificate, resultLedger, executedDryRun, acknowledgedRecord, handoffPacket, decisionReceipt, releaseGate }));
  record("no external notification", !containsExternalNotification({ controlRoomPacket, rollbackReceipt, register, certificate, resultLedger, executedDryRun, acknowledgedRecord, handoffPacket, decisionReceipt, releaseGate }));
  record("no AI/OpenAI call evidence", !containsAiCall({ controlRoomPacket, rollbackReceipt, register, certificate, resultLedger, executedDryRun, acknowledgedRecord, handoffPacket, decisionReceipt, releaseGate }));
  record("no raw provider material leakage", safePayloadObject({ packetBeforePrerequisites, missingTenantPacket, invalidTenantPacket, receiptSignOff, lock, archive, exportedArchive, manifest, integrity, retentionAudit, finalization, signOff, receipt, releaseEvidence, releaseVerification, releaseCertification, closureLedger, attestationAudit, reconciliation, releaseGate, decisionReceipt, handoffPacket, initialAcceptanceRecord, acknowledgedRecord, initialDryRun, executedDryRun, dryRunReadback, resultLedger, certificate, register, rollbackReceipt, controlRoomPacket, afterPacketPage }));

  finish();
}

async function createNoMatchItem(label, text) {
  const eventId = `${runId}-${label}-${Math.random().toString(16).slice(2)}`;
  const payload = linePayload(`safe-no-match-room-sprint97-${label}-${runId}`, `safe-sender-sprint97-${label}`, text);
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
    destination: "safe-sprint97-destination",
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

function safeControlRoomPacketShape(value) {
  return value &&
    value.packetKind === "qa-handoff-locked-archive-certified-release-control-room-packet" &&
    value.controlRoomStatus === "ready" &&
    value.cutoverReadinessStatus === "ready" &&
    value.safeFilename === "provider-webhook-review-qa-handoff-certified-release-control-room-packet.json" &&
    value.safeDigest === value.controlRoomPacketDigest &&
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

function safeDigestLinks(value) {
  const digests = Object.entries(value)
    .filter(([key]) => /Digest$/.test(key) || key === "safeDigest")
    .map(([, digest]) => digest);
  return digests.length >= 15 && digests.every((digest) => typeof digest === "string" && /^sha256:[a-z0-9-]+$/i.test(digest));
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
  console.log(`\nSprint 97 smoke complete: ${results.length - failed.length}/${results.length} passed`);
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
