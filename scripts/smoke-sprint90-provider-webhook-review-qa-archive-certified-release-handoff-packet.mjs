import crypto from "node:crypto";
import { readFileSync } from "node:fs";

const baseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");
const tenantId = process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
const userId = process.env.USER_ID ?? "00000000-0000-4000-8000-000000000011";
const signingMaterial = process.env.PROVIDER_WEBHOOK_SANDBOX_SIGNING_KEY ?? "local-provider-webhook-sandbox-signing-material";
const runId = `sprint90-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const releaseBasePath = "/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence";
const attestationPath = `${releaseBasePath}/verification/certification/closure-ledger/attestation-audit`;
const reconciliationPath = `${attestationPath}/reconciliation`;
const releaseGatePath = `${reconciliationPath}/release-gate`;
const decisionReceiptPath = `${releaseGatePath}/decision-receipt`;
const handoffPacketPath = `${decisionReceiptPath}/handoff-packet`;
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
  const sprint90Source = {
    shared: sourceSlice(shared, "providerWebhookReviewQaHandoffCertifiedReleaseHandoffPacketStatusSchema", "providerWebhookUnmatchedInboundBulkReviewRequestSchema"),
    providerController: sourceSlice(providerController, "review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt/handoff-packet", "review-closure-report/export"),
    providerService: [
      sourceSlice(providerService, "getReviewQaHandoffCertifiedReleaseHandoffPacket(", "private getLockedArchiveContext"),
      sourceSlice(providerService, "function assertQaHandoffCertifiedReleaseHandoffPacketPrerequisites", "function safeRoomLabel")
    ].join("\n"),
    apiClient: sourceSlice(apiClient, "getProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket", "getProviderWebhookReviewClosureReportExport"),
    settingsData: [
      sourceSlice(settingsData, "loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacketData", "loadSettingsProviderWebhookReviewClosureReportRedactionAuditData"),
      sourceSlice(settingsData, "function createMockReviewQaHandoffCertifiedReleaseHandoffPacket", "function createMockReleaseAttestationAuditRow")
    ].join("\n"),
    settingsPage: [
      sourceSlice(settingsPage, "reviewQaHandoffCertifiedReleaseHandoffPacket", "reviewClosureReportRedactionAudit"),
      sourceSlice(settingsPage, "loadReviewQaHandoffCertifiedReleaseHandoffPacket", "loadClosureReportRedactionAudit")
    ].join("\n"),
    providerPanel: [
      sourceSlice(providerPanel, "Load certified release decision receipt", "Audit report export redaction"),
      sourceSlice(providerPanel, "QA archive certified release handoff packet:", "reviewQaHandoffLockedArchive ?")
    ].join("\n")
  };

  record("smoke:sprint90 registered",
    rootPackage.scripts?.["smoke:sprint90"] === "node scripts/smoke-sprint90-provider-webhook-review-qa-archive-certified-release-handoff-packet.mjs"
  );
  record("Sprint 89/88/87/86/85/84/83/82/81/80/79/78/77/76/75 regression smoke scripts registered", [
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
  record("shared certified release handoff packet DTO export",
    sprint90Source.shared.includes("providerWebhookReviewQaHandoffCertifiedReleaseHandoffPacketSchema") &&
    sprint90Source.shared.includes("ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket") &&
    sprint90Source.shared.includes("packetStatus") &&
    sprint90Source.shared.includes("handoffStatus") &&
    sprint90Source.shared.includes("releaseDecision") &&
    sprint90Source.shared.includes("handoffPacketDigest") &&
    sprint90Source.shared.includes("inheritedDecisionReceiptSummary") &&
    sprint90Source.shared.includes("inheritedBlockingReasons") &&
    sprint90Source.shared.includes("inheritedExceptionRows") &&
    sprint90Source.shared.includes("handoffRows") &&
    sprint90Source.shared.includes("runbookRows") &&
    sprint90Source.shared.includes("operatorChecklist") &&
    sprint90Source.shared.includes("releaseOwnerSummary") &&
    sprint90Source.shared.includes("externalCalls: z.literal(0)") &&
    sprint90Source.shared.includes(".strict()")
  );
  record("backend certified release handoff packet route registration",
    providerController.includes('@Get("review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt/handoff-packet")') &&
    providerController.includes("getReviewQaHandoffCertifiedReleaseHandoffPacket")
  );
  record("service certified release handoff packet implementation",
    sprint90Source.providerService.includes("getReviewQaHandoffCertifiedReleaseHandoffPacket") &&
    sprint90Source.providerService.includes("qaHandoffCertifiedReleaseHandoffPacketResponse") &&
    sprint90Source.providerService.includes("assertQaHandoffCertifiedReleaseHandoffPacketPrerequisites") &&
    sprint90Source.providerService.includes("packetStatus") &&
    sprint90Source.providerService.includes("handoffStatus") &&
    sprint90Source.providerService.includes("handoffPacketDigest") &&
    sprint90Source.providerService.includes("runbookRows") &&
    sprint90Source.providerService.includes("operatorChecklist") &&
    sprint90Source.providerService.includes("externalCalls: 0 as const")
  );
  record("API client certified release handoff packet wiring",
    sprint90Source.apiClient.includes("getProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket") &&
    sprint90Source.apiClient.includes("providerWebhookReviewQaHandoffCertifiedReleaseHandoffPacketSchema") &&
    sprint90Source.apiClient.includes("/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt/handoff-packet")
  );
  record("settings-data certified release handoff packet wiring",
    sprint90Source.settingsData.includes("loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacketData") &&
    sprint90Source.settingsData.includes("getProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket") &&
    sprint90Source.settingsData.includes("createMockReviewQaHandoffCertifiedReleaseHandoffPacket")
  );
  record("provider readiness panel handoff packet control/result/error text",
    settingsPage.includes("QA Archive Certified Release Handoff Packet API error") &&
    settingsPage.includes("onLoadReviewQaHandoffCertifiedReleaseHandoffPacket={loadReviewQaHandoffCertifiedReleaseHandoffPacket}") &&
    providerPanel.includes("Load certified release handoff packet") &&
    providerPanel.includes("QA archive certified release handoff packet:") &&
    providerPanel.includes("packetStatus=") &&
    providerPanel.includes("handoffStatus=") &&
    providerPanel.includes("runbookRowStatuses=") &&
    providerPanel.includes("operatorChecklistItems=") &&
    providerPanel.includes("externalCalls=")
  );
  record("handoff packet stale state clears with upstream/API failures",
    settingsPage.includes("setReviewQaHandoffCertifiedReleaseHandoffPacket(null)") &&
    settingsPage.includes("setQaHandoffCertifiedReleaseHandoffPacketError") &&
    settingsPage.includes("setReviewQaHandoffCertifiedReleaseDecisionReceipt(null)") &&
    settingsPage.includes("setReviewQaHandoffCertifiedReleaseGate(null)")
  );
  record("no DATA_MODE=api mock/local fallback markers",
    /if \(mode === "api"\) \{\s*return \{\s*mode,\s*handoffPacket: await getProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket/s.test(settingsData) &&
    !/DATA_MODE=api[\s\S]{0,180}(mock|local|fallback)|(?:mock|local|fallback)[\s\S]{0,180}DATA_MODE=api/i.test(sprint90Source.settingsData)
  );
  record("static Sprint 90 source has no provider outbound send markers", !containsProviderOutbound(sprint90Source));
  record("static Sprint 90 source has no external notification send markers", !containsExternalNotification(sprint90Source));
  record("static Sprint 90 source has no AI/OpenAI call markers", !containsAiCall(sprint90Source));
  record("static Sprint 90 source has no raw provider material markers", safePayloadObject(sprint90Source));

  const filters = "provider=line&eventType=message.created";
  const health = await safeJson(await request("GET", "/health"));
  record("GET /health reachable", health?.status === "ok" && health?.service === "api");

  const missingTenantPacket = await requestJsonWithoutTenant("GET", `${handoffPacketPath}?${filters}`);
  record("handoff packet requires x-tenant-id", missingTenantPacket.status >= 400 && missingTenantPacket.status < 500);

  const handoffItem = await createNoMatchItem("handoff-packet", "Safe Sprint 90 certified release handoff packet target");
  record("create safe sandbox no-match item", handoffItem?.unmatchedStatus === "review-needed");

  const packetBeforeLock = await requestJson("GET", `${handoffPacketPath}?${filters}`);
  const receiptSignOff = await safeJson(await request("POST", `/provider-webhooks/review-qa-handoff-bundle/receipt/sign-off?${filters}`, {
    acknowledgementType: "sign_off",
    reviewerRole: "QA reviewer",
    reviewerLabel: "safe sprint90 reviewer"
  }));
  const lock = await safeJson(await request("POST", `/provider-webhooks/review-qa-handoff-bundle/acceptance-lock?${filters}`, {
    lockReason: "Safe Sprint 90 certified release handoff packet accepted",
    acceptedByRole: "QA lead",
    acceptedByLabel: "safe sprint90 reviewer"
  }));
  const packetBeforeArchiveExport = await requestJson("GET", `${handoffPacketPath}?${filters}`);
  const archive = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive?${filters}`));
  const exportedArchive = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/export?${filters}`));
  const manifest = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/retention-manifest?${filters}`));
  const integrity = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/integrity?${filters}`));
  const retentionAudit = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/retention-audit?${filters}`));
  const finalization = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization?${filters}`));
  const packetBeforeSignOff = await requestJson("GET", `${handoffPacketPath}?${filters}`);
  const signOff = await safeJson(await request("POST", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/sign-off?${filters}`, {
    reviewerRole: "retention reviewer",
    reviewerLabel: "safe sprint90 reviewer"
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
  const beforeReadPage = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound?provider=line&limit=25&offset=0&sortBy=receivedAt&sortOrder=desc"));
  const stateBeforeRead = unmatchedItems(beforeReadPage).find((item) => item.id === handoffItem.id);
  const handoffPacket = await safeJson(await request("GET", `${handoffPacketPath}?${filters}`));
  const afterReadPage = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound?provider=line&limit=25&offset=0&sortBy=receivedAt&sortOrder=desc"));
  const stateAfterRead = unmatchedItems(afterReadPage).find((item) => item.id === handoffItem.id);
  const invalidTenantPacket = await requestJson("GET", `${handoffPacketPath}?${filters}`, undefined, "00000000-0000-4000-8000-000000000090");

  record("handoff packet requires acceptance lock before prerequisites", packetBeforeLock.status === 409 && /acceptance lock is required/i.test(JSON.stringify(packetBeforeLock.body)));
  record("handoff packet requires locked archive export", packetBeforeArchiveExport.status === 409 && /locked archive export is required/i.test(JSON.stringify(packetBeforeArchiveExport.body)));
  record("handoff packet requires finalization sign-off", packetBeforeSignOff.status === 409 && /finalization sign-off is required/i.test(JSON.stringify(packetBeforeSignOff.body)));
  record("complete safe chain through Sprint 89 decision receipt", [receiptSignOff, lock, exportedArchive, manifest, integrity, retentionAudit, finalization, signOff, receipt, releaseEvidence, releaseVerification, releaseCertification, closureLedger, attestationAudit, reconciliation, releaseGate, decisionReceipt].every(Boolean));
  record("decision receipt issued/go", safeCertifiedReleaseDecisionReceiptShape(decisionReceipt) && decisionReceipt.receiptStatus === "issued" && decisionReceipt.releaseDecision === "go");
  record("certified release handoff packet endpoint reachable", safeCertifiedReleaseHandoffPacketShape(handoffPacket));
  record("packetStatus issued", handoffPacket.packetStatus === "issued");
  record("handoffStatus ready", handoffPacket.handoffStatus === "ready");
  record("releaseDecision go", handoffPacket.releaseDecision === "go");
  record("receiptStatus issued", handoffPacket.receiptStatus === "issued");
  record("gateStatus ready", handoffPacket.gateStatus === "ready");
  record("goNoGoDecision go", handoffPacket.goNoGoDecision === "go");
  record("reconciliationStatus complete/aligned", ["complete", "aligned"].includes(handoffPacket.reconciliationStatus));
  record("attestationStatus complete", handoffPacket.attestationStatus === "complete");
  record("ledgerStatus certified_release_closed", handoffPacket.ledgerStatus === "certified_release_closed");
  record("certificationStatus certified", handoffPacket.certificationStatus === "certified");
  record("releaseReadinessStatus ready_for_release", handoffPacket.releaseReadinessStatus === "ready_for_release");
  record("verificationStatus verified", handoffPacket.verificationStatus === "verified");
  record("digestChainStatus confirmed", handoffPacket.digestChainStatus === "confirmed");
  record("prerequisite checklist complete", Object.values(handoffPacket.inheritedPrerequisiteChecklist ?? {}).every(Boolean));
  record("certification checklist complete", Object.values(handoffPacket.inheritedCertificationChecklist ?? {}).every(Boolean));
  record("gate checklist complete", Object.values(handoffPacket.inheritedGateChecklist ?? {}).every(Boolean));
  record("decision receipt summary present", handoffPacket.inheritedDecisionReceiptSummary?.receiptRowCount >= 13 && handoffPacket.inheritedDecisionReceiptSummary?.externalCallsZero === true);
  record("handoffRows present", Array.isArray(handoffPacket.handoffRows) && handoffPacket.handoffRows.length >= 16 && handoffPacket.handoffRows.every(safeHandoffRowShape));
  record("runbookRows present", Array.isArray(handoffPacket.runbookRows) && handoffPacket.runbookRows.length >= 6 && handoffPacket.runbookRows.every(safeRunbookRowShape));
  record("operatorChecklist present", Array.isArray(handoffPacket.operatorChecklist) && handoffPacket.operatorChecklist.length >= 7 && handoffPacket.operatorChecklist.every(safeOperatorChecklistItemShape));
  record("releaseOwnerSummary present", handoffPacket.releaseOwnerSummary?.handoffReady === true && handoffPacket.releaseOwnerSummary?.externalCallsZero === true);
  record("safe digest links aligned",
    handoffPacket.releaseEvidenceDigest === releaseEvidence.safeDigest &&
    handoffPacket.verificationDigest === releaseVerification.safeDigest &&
    handoffPacket.certificationDigest === releaseCertification.safeDigest &&
    handoffPacket.closureLedgerDigest === closureLedger.safeDigest &&
    handoffPacket.attestationAuditDigest === attestationAudit.safeDigest &&
    handoffPacket.reconciliationDigest === reconciliation.reconciliationDigest &&
    handoffPacket.releaseGateDigest === releaseGate.releaseGateDigest &&
    handoffPacket.decisionReceiptDigest === decisionReceipt.decisionReceiptDigest &&
    handoffPacket.handoffPacketDigest === handoffPacket.safeDigest
  );
  record("inheritedBlockingReasons safe", Array.isArray(handoffPacket.inheritedBlockingReasons) && handoffPacket.inheritedBlockingReasons.every(safeBlockingReasonShape));
  record("inheritedExceptionRows safe", Array.isArray(handoffPacket.inheritedExceptionRows) && handoffPacket.inheritedExceptionRows.every(safeAttestationReconciliationExceptionShape));
  record("counts present", Number.isInteger(handoffPacket.counts?.handoffPacketCheckedCount) && handoffPacket.counts?.handoffRowCount === handoffPacket.handoffRows.length && handoffPacket.counts?.operatorChecklistItemCount === handoffPacket.operatorChecklist.length);
  record("externalCalls=0", handoffPacket.externalCalls === 0);
  record("no mutation before/after handoff packet read", metadataOnlyStateMatches(stateBeforeRead, stateAfterRead));
  record("invalid tenant does not return mock fallback", invalidTenantPacket.status === 409 && !JSON.stringify(invalidTenantPacket.body).includes("mockqahandoffcertifiedreleasehandoffpacket"));
  record("no stale/fake handoff packet result markers", !JSON.stringify(handoffPacket).includes("mockqahandoffcertifiedreleasehandoffpacket"));
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
    afterReadPage
  }));
  record("no provider outbound", !containsProviderOutbound({ receiptSignOff, lock, archive, exportedArchive, manifest, integrity, retentionAudit, finalization, signOff, receipt, releaseEvidence, releaseVerification, releaseCertification, closureLedger, attestationAudit, reconciliation, releaseGate, decisionReceipt, handoffPacket }));
  record("no external notification", !containsExternalNotification({ receiptSignOff, lock, archive, exportedArchive, manifest, integrity, retentionAudit, finalization, signOff, receipt, releaseEvidence, releaseVerification, releaseCertification, closureLedger, attestationAudit, reconciliation, releaseGate, decisionReceipt, handoffPacket }));
  record("no AI/OpenAI call evidence", !containsAiCall({ receiptSignOff, lock, archive, exportedArchive, manifest, integrity, retentionAudit, finalization, signOff, receipt, releaseEvidence, releaseVerification, releaseCertification, closureLedger, attestationAudit, reconciliation, releaseGate, decisionReceipt, handoffPacket }));
  record("no raw provider material leakage", safePayloadObject({
    packetBeforeLock,
    packetBeforeArchiveExport,
    packetBeforeSignOff,
    missingTenantPacket,
    invalidTenantPacket,
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
    afterReadPage
  }));

  finish();
}

async function createNoMatchItem(label, text) {
  const eventId = `${runId}-${label}-${Math.random().toString(16).slice(2)}`;
  const payload = linePayload(`safe-no-match-room-sprint90-${label}-${runId}`, `safe-sender-sprint90-${label}`, text);
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

function safeCertifiedReleaseDecisionReceiptShape(value) {
  return value &&
    value.receiptKind === "qa-handoff-locked-archive-certified-release-decision-receipt" &&
    value.receiptStatus === "issued" &&
    value.releaseDecision === "go" &&
    value.gateStatus === "ready" &&
    value.goNoGoDecision === "go" &&
    value.releaseReadinessStatus === "ready_for_release" &&
    ["complete", "aligned"].includes(value.reconciliationStatus) &&
    value.attestationStatus === "complete" &&
    value.ledgerStatus === "certified_release_closed" &&
    value.certificationStatus === "certified" &&
    value.verificationStatus === "verified" &&
    value.digestChainStatus === "confirmed" &&
    value.safeFilename === "provider-webhook-review-qa-handoff-certified-release-decision-receipt.json" &&
    value.safeDigest?.startsWith("sha256:") &&
    value.decisionReceiptDigest === value.safeDigest &&
    Object.values(value.inheritedPrerequisiteChecklist ?? {}).every(Boolean) &&
    Object.values(value.inheritedCertificationChecklist ?? {}).every(Boolean) &&
    Object.values(value.inheritedGateChecklist ?? {}).every(Boolean) &&
    Array.isArray(value.inheritedBlockingReasons) &&
    value.inheritedBlockingReasons.every(safeBlockingReasonShape) &&
    Array.isArray(value.inheritedExceptionRows) &&
    value.inheritedExceptionRows.every(safeAttestationReconciliationExceptionShape) &&
    Array.isArray(value.receiptRows) &&
    value.externalCalls === 0;
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
    Array.isArray(value.inheritedBlockingReasons) &&
    value.inheritedBlockingReasons.every(safeBlockingReasonShape) &&
    Array.isArray(value.inheritedExceptionRows) &&
    value.inheritedExceptionRows.every(safeAttestationReconciliationExceptionShape) &&
    Array.isArray(value.handoffRows) &&
    value.handoffRows.every(safeHandoffRowShape) &&
    Array.isArray(value.runbookRows) &&
    value.runbookRows.every(safeRunbookRowShape) &&
    Array.isArray(value.operatorChecklist) &&
    value.operatorChecklist.every(safeOperatorChecklistItemShape) &&
    value.releaseOwnerSummary?.externalCallsZero === true &&
    Number.isInteger(value.counts?.handoffPacketCheckedCount) &&
    value.externalCalls === 0;
}

function safeHandoffRowShape(row) {
  return row &&
    typeof row.key === "string" &&
    typeof row.label === "string" &&
    ["ready", "confirmed", "blocked"].includes(row.handoffRowStatus) &&
    row.safeDigest?.startsWith("sha256:") &&
    Number.isInteger(row.checkedCount) &&
    typeof row.complete === "boolean";
}

function safeRunbookRowShape(row) {
  return row &&
    typeof row.key === "string" &&
    typeof row.label === "string" &&
    ["ready", "blocked"].includes(row.runbookStatus) &&
    row.safeDigest?.startsWith("sha256:") &&
    typeof row.ownerRole === "string" &&
    typeof row.complete === "boolean";
}

function safeOperatorChecklistItemShape(item) {
  return item &&
    typeof item.key === "string" &&
    typeof item.label === "string" &&
    ["complete", "blocked"].includes(item.checklistStatus) &&
    item.safeDigest?.startsWith("sha256:") &&
    typeof item.complete === "boolean";
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
    console.error(`Sprint 90 smoke failed: ${failed.map((result) => result.name).join(", ")}`);
    process.exitCode = 1;
    return;
  }
  console.log("Sprint 90 smoke passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
