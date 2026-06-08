import crypto from "node:crypto";
import { readFileSync } from "node:fs";

const baseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");
const tenantId = process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
const userId = process.env.USER_ID ?? "00000000-0000-4000-8000-000000000011";
const signingMaterial = process.env.PROVIDER_WEBHOOK_SANDBOX_SIGNING_KEY ?? "local-provider-webhook-sandbox-signing-material";
const runId = `sprint96-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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
  const sprint96Source = {
    shared: sourceSlice(shared, "providerWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptStatusSchema", "providerWebhookUnmatchedInboundBulkReviewRequestSchema"),
    providerController: sourceSlice(providerController, "freeze-audit-register/rollback-rehearsal-receipt", "review-closure-report/export"),
    providerService: [
      sourceSlice(providerService, "getReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt(", "private getLockedArchiveContext"),
      sourceSlice(providerService, "function qaHandoffCertifiedReleaseRollbackRehearsalReceiptResponse", "function safeRoomLabel")
    ].join("\n"),
    apiClient: sourceSlice(apiClient, "getProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt", "getProviderWebhookReviewClosureReportExport"),
    settingsData: [
      sourceSlice(settingsData, "loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptData", "loadSettingsProviderWebhookReviewClosureReportRedactionAuditData"),
      sourceSlice(settingsData, "function createMockReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt", "function createMockReleaseAttestationAuditRow")
    ].join("\n"),
    settingsPage: [
      sourceSlice(settingsPage, "reviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt", "reviewClosureReportRedactionAudit"),
      sourceSlice(settingsPage, "loadReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt", "loadClosureReportRedactionAudit")
    ].join("\n"),
    providerPanel: [
      sourceSlice(providerPanel, "Load certified release rollback rehearsal receipt", "Audit report export redaction"),
      sourceSlice(providerPanel, "QA archive certified release rollback rehearsal receipt:", "reviewQaHandoffLockedArchive ?")
    ].join("\n")
  };

  record("smoke:sprint96 registered",
    rootPackage.scripts?.["smoke:sprint96"] === "node scripts/smoke-sprint96-provider-webhook-review-qa-archive-certified-release-rollback-rehearsal-receipt.mjs"
  );
  record("Sprint 95 regression smoke still registered",
    rootPackage.scripts?.["smoke:sprint95"] === "node scripts/smoke-sprint95-provider-webhook-review-qa-archive-certified-release-freeze-audit-register.mjs"
  );
  record("shared rollback rehearsal receipt DTO export",
    sprint96Source.shared.includes("providerWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptSchema") &&
    sprint96Source.shared.includes("ProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt") &&
    sprint96Source.shared.includes("rollbackRehearsalStatus") &&
    sprint96Source.shared.includes("recoveryReadinessStatus") &&
    sprint96Source.shared.includes("freezeStatus") &&
    sprint96Source.shared.includes("rollbackReadinessRows") &&
    sprint96Source.shared.includes("recoveryReadinessRows") &&
    sprint96Source.shared.includes("externalCalls: z.literal(0)") &&
    sprint96Source.shared.includes(".strict()")
  );
  record("backend rollback rehearsal receipt route registration",
    providerController.includes('@Get("review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt/handoff-packet/acceptance-record/noop-execution-dryrun/result-ledger/final-readiness-certificate/freeze-audit-register/rollback-rehearsal-receipt")') &&
    providerController.includes("getReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt") &&
    providerController.includes("requireTenantId(tenant)")
  );
  record("service rollback rehearsal receipt implementation",
    providerService.includes("qaHandoffCertifiedReleaseRollbackRehearsalReceiptResponse") &&
    providerService.includes("certifiedReleaseRollbackRehearsalReady") &&
    providerService.includes("rollbackRehearsalReceiptMutationCount: 0") &&
    providerService.includes("externalCalls: 0 as const")
  );
  record("API client rollback rehearsal receipt wiring",
    apiClient.includes("getProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt") &&
    apiClient.includes("providerWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptSchema") &&
    apiClient.includes("/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt/handoff-packet/acceptance-record/noop-execution-dryrun/result-ledger/final-readiness-certificate/freeze-audit-register/rollback-rehearsal-receipt")
  );
  record("settings-data rollback rehearsal receipt wiring",
    settingsData.includes("loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptData") &&
    settingsData.includes("getProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt") &&
    settingsData.includes("createMockReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt")
  );
  record("provider readiness panel rollback rehearsal receipt controls/results/errors",
    settingsPage.includes("QA Archive Certified Release Rollback Rehearsal Receipt API error") &&
    settingsPage.includes("setReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt(null)") &&
    settingsPage.includes("onLoadReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt={loadReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt}") &&
    providerPanel.includes("Load certified release rollback rehearsal receipt") &&
    providerPanel.includes("QA archive certified release rollback rehearsal receipt:") &&
    providerPanel.includes("rollbackRehearsalStatus=") &&
    providerPanel.includes("recoveryReadinessStatus=") &&
    providerPanel.includes("freezeStatus=") &&
    providerPanel.includes("rollbackReadinessRows=") &&
    providerPanel.includes("recoveryReadinessRows=") &&
    providerPanel.includes("externalCalls=")
  );
  record("no DATA_MODE=api mock/local fallback markers",
    /if \(mode === "api"\) \{\s*return \{\s*mode,\s*rollbackRehearsalReceipt: await getProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt/s.test(settingsData) &&
    !/DATA_MODE=api[\s\S]{0,180}(mock|local|fallback)|(?:mock|local|fallback)[\s\S]{0,180}DATA_MODE=api/i.test(settingsData)
  );
  record("static Sprint 96 source has no provider outbound send markers", !containsProviderOutbound(sprint96Source));
  record("static Sprint 96 source has no external notification send markers", !containsExternalNotification(sprint96Source));
  record("static Sprint 96 source has no AI/OpenAI call markers", !containsAiCall(sprint96Source));

  const filters = "provider=line&eventType=message.created";
  const health = await safeJson(await request("GET", "/health"));
  record("GET /health reachable", health?.status === "ok" && health?.service === "api");

  const missingTenantReceipt = await requestJsonWithoutTenant("GET", `${rollbackRehearsalReceiptPath}?${filters}`);
  record("rollback rehearsal receipt requires x-tenant-id", missingTenantReceipt.status >= 400 && missingTenantReceipt.status < 500);

  const rehearsalItem = await createNoMatchItem("rollback-rehearsal-receipt", "Safe Sprint 96 certified release rollback rehearsal receipt target");
  record("create safe sandbox no-match item", rehearsalItem?.unmatchedStatus === "review-needed");

  const receiptBeforePrerequisites = await requestJson("GET", `${rollbackRehearsalReceiptPath}?${filters}`);
  const receiptSignOff = await safeJson(await request("POST", `/provider-webhooks/review-qa-handoff-bundle/receipt/sign-off?${filters}`, {
    acknowledgementType: "sign_off",
    reviewerRole: "QA reviewer",
    reviewerLabel: "safe sprint96 reviewer"
  }));
  const lock = await safeJson(await request("POST", `/provider-webhooks/review-qa-handoff-bundle/acceptance-lock?${filters}`, {
    lockReason: "Safe Sprint 96 certified release rollback rehearsal receipt accepted",
    acceptedByRole: "QA lead",
    acceptedByLabel: "safe sprint96 reviewer"
  }));
  const archive = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive?${filters}`));
  const exportedArchive = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/export?${filters}`));
  const manifest = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/retention-manifest?${filters}`));
  const integrity = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/integrity?${filters}`));
  const retentionAudit = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/retention-audit?${filters}`));
  const finalization = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization?${filters}`));
  const signOff = await safeJson(await request("POST", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/sign-off?${filters}`, {
    reviewerRole: "retention reviewer",
    reviewerLabel: "safe sprint96 reviewer"
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
    acknowledgedByLabel: "safe sprint96 release owner",
    acknowledgedChecklistKeys: handoffPacket.operatorChecklist.map((item) => item.key)
  }));
  const initialDryRun = await safeJson(await request("GET", `${noopExecutionDryRunPath}?${filters}`));
  const executedDryRun = await safeJson(await request("POST", `${noopExecutionDryRunPath}?${filters}`, {
    requestedBy: "safe sprint96 release owner",
    checklistAcknowledged: true,
    operatorNote: "Safe no-op execution dry-run from Sprint 96 smoke",
    dryRunReason: "safe no-op execution readiness rehearsal",
    executionMode: "no_op"
  }));
  const dryRunReadback = await safeJson(await request("GET", `${noopExecutionDryRunPath}?${filters}`));
  const beforeReceiptPage = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound?provider=line&limit=25&offset=0&sortBy=receivedAt&sortOrder=desc"));
  const stateBeforeReceiptRead = unmatchedItems(beforeReceiptPage).find((item) => item.id === rehearsalItem.id);
  const resultLedger = await safeJson(await request("GET", `${resultLedgerPath}?${filters}`));
  const certificate = await safeJson(await request("GET", `${finalReadinessCertificatePath}?${filters}`));
  const register = await safeJson(await request("GET", `${freezeAuditRegisterPath}?${filters}`));
  const rollbackReceipt = await safeJson(await request("GET", `${rollbackRehearsalReceiptPath}?${filters}`));
  const afterReceiptPage = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound?provider=line&limit=25&offset=0&sortBy=receivedAt&sortOrder=desc"));
  const stateAfterReceiptRead = unmatchedItems(afterReceiptPage).find((item) => item.id === rehearsalItem.id);
  const invalidTenantReceipt = await requestJson("GET", `${rollbackRehearsalReceiptPath}?${filters}`, undefined, "00000000-0000-4000-8000-000000000096");

  record("incomplete chain returns explicit 409", receiptBeforePrerequisites.status === 409 && /required|prerequisite|lock|archive|dry/i.test(JSON.stringify(receiptBeforePrerequisites.body)));
  record("complete/load safe chain through Sprint 96 rollback rehearsal receipt", [receiptSignOff, lock, archive, exportedArchive, manifest, integrity, retentionAudit, finalization, signOff, receipt, releaseEvidence, releaseVerification, releaseCertification, closureLedger, attestationAudit, reconciliation, releaseGate, decisionReceipt, handoffPacket, initialAcceptanceRecord, acknowledgedRecord, initialDryRun, executedDryRun, dryRunReadback, resultLedger, certificate, register, rollbackReceipt].every(Boolean));

  record("freezeAuditStatus recorded", safeFreezeAuditRegisterShape(register) && register.freezeAuditStatus === "recorded");
  record("freezeStatus frozen", safeFreezeAuditRegisterShape(register) && register.freezeStatus === "frozen");
  record("rollbackReadinessStatus ready", register.rollbackReadinessStatus === "ready");
  record("rollbackRehearsalStatus verified", safeRollbackRehearsalReceiptShape(rollbackReceipt) && rollbackReceipt.rollbackRehearsalStatus === "verified");
  record("recoveryReadinessStatus ready", rollbackReceipt.recoveryReadinessStatus === "ready");
  record("certificateStatus issued", rollbackReceipt.certificateStatus === "issued");
  record("finalReadinessStatus ready", rollbackReceipt.finalReadinessStatus === "ready");
  record("ledgerStatus recorded", rollbackReceipt.ledgerStatus === "recorded");
  record("dryRunStatus passed", rollbackReceipt.dryRunStatus === "passed");
  record("executionMode no_op", rollbackReceipt.executionMode === "no_op");
  record("releaseDecision go", rollbackReceipt.releaseDecision === "go");
  record("goNoGoDecision go", rollbackReceipt.goNoGoDecision === "go");
  record("rollback receipt chains to freeze audit register", rollbackReceipt.freezeAuditRegisterDigest === register.freezeAuditRegisterDigest && rollbackReceipt.inheritedFreezeAuditSummary?.safeDigest === register.safeDigest);
  record("rollback receipt chains to final readiness certificate", rollbackReceipt.finalReadinessCertificateDigest === certificate.finalReadinessCertificateDigest && rollbackReceipt.inheritedFinalReadinessCertificateSummary?.safeDigest === certificate.safeDigest);
  record("freezeSnapshotRows verified", Array.isArray(rollbackReceipt.freezeSnapshotRows) && rollbackReceipt.freezeSnapshotRows.length >= 3 && rollbackReceipt.freezeSnapshotRows.every(safeRollbackRehearsalRowShape));
  record("rollbackReadinessRows ready", Array.isArray(rollbackReceipt.rollbackReadinessRows) && rollbackReceipt.rollbackReadinessRows.length >= 3 && rollbackReceipt.rollbackReadinessRows.every(safeRollbackRehearsalRowShape));
  record("rollbackRehearsalRows verified", Array.isArray(rollbackReceipt.rollbackRehearsalRows) && rollbackReceipt.rollbackRehearsalRows.length >= 4 && rollbackReceipt.rollbackRehearsalRows.every(safeRollbackRehearsalRowShape));
  record("recoveryPlanRows ready", Array.isArray(rollbackReceipt.recoveryPlanRows) && rollbackReceipt.recoveryPlanRows.length >= 3 && rollbackReceipt.recoveryPlanRows.every(safeRollbackRehearsalRowShape));
  record("recoveryReadinessRows ready", Array.isArray(rollbackReceipt.recoveryReadinessRows) && rollbackReceipt.recoveryReadinessRows.length >= 3 && rollbackReceipt.recoveryReadinessRows.every(safeRollbackRehearsalRowShape));
  record("rollback receipt counts present", Number.isInteger(rollbackReceipt.counts?.rollbackRehearsalReceiptCheckedCount) && rollbackReceipt.counts?.rollbackRehearsalReceiptMutationCount === 0 && rollbackReceipt.counts?.freezeSnapshotRowCount === rollbackReceipt.freezeSnapshotRows.length && rollbackReceipt.counts?.recoveryReadinessRowCount === rollbackReceipt.recoveryReadinessRows.length);
  record("externalCalls=0", rollbackReceipt.externalCalls === 0);
  record("GET no mutation before/after rollback rehearsal receipt read", metadataOnlyStateMatches(stateBeforeReceiptRead, stateAfterReceiptRead) && rollbackReceipt.counts.rollbackRehearsalReceiptMutationCount === 0);
  record("invalid tenant does not return mock fallback", invalidTenantReceipt.status === 409 && !JSON.stringify(invalidTenantReceipt.body).includes("mockqahandoffcertifiedreleaserollbackrehearsalreceipt"));
  record("no stale/fake freeze audit register", !JSON.stringify(register).includes("mockqahandoffcertifiedreleasefreezeauditregister"));
  record("no stale/fake rollback rehearsal receipt", !JSON.stringify(rollbackReceipt).includes("mockqahandoffcertifiedreleaserollbackrehearsalreceipt"));
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
    rollbackReceipt,
    afterReceiptPage
  }));
  record("no provider outbound", !containsProviderOutbound({ rollbackReceipt, register, certificate, resultLedger, executedDryRun, acknowledgedRecord, handoffPacket, decisionReceipt, releaseGate }));
  record("no external notification", !containsExternalNotification({ rollbackReceipt, register, certificate, resultLedger, executedDryRun, acknowledgedRecord, handoffPacket, decisionReceipt, releaseGate }));
  record("no AI/OpenAI call evidence", !containsAiCall({ rollbackReceipt, register, certificate, resultLedger, executedDryRun, acknowledgedRecord, handoffPacket, decisionReceipt, releaseGate }));
  record("no raw provider material leakage", safePayloadObject({
    receiptBeforePrerequisites,
    missingTenantReceipt,
    invalidTenantReceipt,
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
    rollbackReceipt,
    afterReceiptPage
  }));

  finish();
}

async function createNoMatchItem(label, text) {
  const eventId = `${runId}-${label}-${Math.random().toString(16).slice(2)}`;
  const payload = linePayload(`safe-no-match-room-sprint96-${label}-${runId}`, `safe-sender-sprint96-${label}`, text);
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
    destination: "safe-sprint96-destination",
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
  return crypto.createHmac("sha256", signingMaterial).update(JSON.stringify(payload)).digest("base64");
}

async function request(method, path, body, tenant = tenantId) {
  const headers = {
    "content-type": "application/json",
    "x-tenant-id": tenant,
    "x-user-id": userId
  };
  return fetch(`${baseUrl}${path}`, {
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

function safeFreezeAuditRegisterShape(value) {
  return value &&
    value.registerKind === "qa-handoff-locked-archive-certified-release-freeze-audit-register" &&
    value.freezeAuditStatus === "recorded" &&
    value.freezeStatus === "frozen" &&
    value.rollbackReadinessStatus === "ready" &&
    value.safeFilename === "provider-webhook-review-qa-handoff-certified-release-freeze-audit-register.json" &&
    value.safeDigest === value.freezeAuditRegisterDigest &&
    value.externalCalls === 0;
}

function safeRollbackRehearsalReceiptShape(value) {
  return value &&
    value.receiptKind === "qa-handoff-locked-archive-certified-release-rollback-rehearsal-receipt" &&
    value.rollbackRehearsalStatus === "verified" &&
    value.recoveryReadinessStatus === "ready" &&
    value.rollbackReadinessStatus === "ready" &&
    value.freezeAuditStatus === "recorded" &&
    value.freezeStatus === "frozen" &&
    value.safeFilename === "provider-webhook-review-qa-handoff-certified-release-rollback-rehearsal-receipt.json" &&
    value.safeDigest === value.rollbackRehearsalReceiptDigest &&
    value.externalCalls === 0;
}

function safeRollbackRehearsalRowShape(row) {
  return row &&
    typeof row.key === "string" &&
    typeof row.label === "string" &&
    row.rollbackRehearsalStatus === "verified" &&
    row.recoveryReadinessStatus === "ready" &&
    typeof row.safeDigest === "string" &&
    row.safeDigest.startsWith("sha256:") &&
    Number.isInteger(row.checkedCount) &&
    row.checkedCount >= 0 &&
    row.complete === true;
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
  return !/"rawPayload"\s*:|rawSignature|replyToken|raw-line|raw-room|raw-sender|"senderId"\s*:|"roomId"\s*:|"token"\s*:|"secret"\s*:|"authorization"\s*:|"cookie"\s*:|providerRaw|payloadJson|accessToken|webhookSecret/i.test(JSON.stringify(value));
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
  console.log(`\nSprint 96 smoke complete: ${results.length - failed.length}/${results.length} passed`);
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
