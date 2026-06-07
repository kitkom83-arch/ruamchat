import crypto from "node:crypto";
import { readFileSync } from "node:fs";

const baseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");
const tenantId = process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
const userId = process.env.USER_ID ?? "00000000-0000-4000-8000-000000000011";
const signingMaterial = process.env.PROVIDER_WEBHOOK_SANDBOX_SIGNING_KEY ?? "local-provider-webhook-sandbox-signing-material";
const runId = `sprint89-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const releaseBasePath = "/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence";
const attestationPath = `${releaseBasePath}/verification/certification/closure-ledger/attestation-audit`;
const reconciliationPath = `${attestationPath}/reconciliation`;
const releaseGatePath = `${reconciliationPath}/release-gate`;
const decisionReceiptPath = `${releaseGatePath}/decision-receipt`;
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
  const sprint89Source = {
    shared: sourceSlice(shared, "providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptStatusSchema", "providerWebhookUnmatchedInboundBulkReviewRequestSchema"),
    providerController: sourceSlice(providerController, "review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt", "review-closure-report/export"),
    providerService: [
      sourceSlice(providerService, "getReviewQaHandoffCertifiedReleaseDecisionReceipt(", "private getLockedArchiveContext"),
      sourceSlice(providerService, "function assertQaHandoffCertifiedReleaseDecisionReceiptPrerequisites", "function safeRoomLabel")
    ].join("\n"),
    apiClient: sourceSlice(apiClient, "getProviderWebhookReviewQaHandoffCertifiedReleaseDecisionReceipt", "getProviderWebhookReviewClosureReportExport"),
    settingsData: [
      sourceSlice(settingsData, "loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptData", "loadSettingsProviderWebhookReviewClosureReportRedactionAuditData"),
      sourceSlice(settingsData, "function createMockReviewQaHandoffCertifiedReleaseDecisionReceipt", "function createMockReleaseAttestationAuditRow")
    ].join("\n"),
    settingsPage: [
      sourceSlice(settingsPage, "reviewQaHandoffCertifiedReleaseDecisionReceipt", "reviewClosureReportRedactionAudit"),
      sourceSlice(settingsPage, "loadReviewQaHandoffCertifiedReleaseDecisionReceipt", "loadClosureReportRedactionAudit")
    ].join("\n"),
    providerPanel: [
      sourceSlice(providerPanel, "Load certified release gate", "Audit report export redaction"),
      sourceSlice(providerPanel, "QA archive certified release decision receipt:", "reviewQaHandoffLockedArchive ?")
    ].join("\n")
  };

  record("smoke:sprint89 registered",
    rootPackage.scripts?.["smoke:sprint89"] === "node scripts/smoke-sprint89-provider-webhook-review-qa-archive-certified-release-decision-receipt.mjs"
  );
  record("Sprint 88/87/86/85/84/83/82/81/80/79/78/77/76/75 regression smoke scripts registered", [
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
  record("shared certified release decision receipt DTO export",
    sprint89Source.shared.includes("providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptSchema") &&
    sprint89Source.shared.includes("ProviderWebhookReviewQaHandoffCertifiedReleaseDecisionReceipt") &&
    sprint89Source.shared.includes("receiptStatus") &&
    sprint89Source.shared.includes("releaseDecision") &&
    sprint89Source.shared.includes("inheritedGateChecklist") &&
    sprint89Source.shared.includes("inheritedBlockingReasons") &&
    sprint89Source.shared.includes("receiptRows") &&
    sprint89Source.shared.includes("receiptSummary") &&
    sprint89Source.shared.includes("decisionReceiptDigest") &&
    sprint89Source.shared.includes("externalCalls: z.literal(0)") &&
    sprint89Source.shared.includes(".strict()")
  );
  record("backend certified release decision receipt route registration",
    providerController.includes('@Get("review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt")') &&
    providerController.includes("getReviewQaHandoffCertifiedReleaseDecisionReceipt")
  );
  record("service certified release decision receipt implementation",
    sprint89Source.providerService.includes("getReviewQaHandoffCertifiedReleaseDecisionReceipt") &&
    sprint89Source.providerService.includes("qaHandoffCertifiedReleaseDecisionReceiptResponse") &&
    sprint89Source.providerService.includes("assertQaHandoffCertifiedReleaseDecisionReceiptPrerequisites") &&
    sprint89Source.providerService.includes("receiptStatus") &&
    sprint89Source.providerService.includes("releaseDecision") &&
    sprint89Source.providerService.includes("decisionReceiptDigest") &&
    sprint89Source.providerService.includes("externalCalls: 0 as const")
  );
  record("API client certified release decision receipt wiring",
    sprint89Source.apiClient.includes("getProviderWebhookReviewQaHandoffCertifiedReleaseDecisionReceipt") &&
    sprint89Source.apiClient.includes("providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptSchema") &&
    sprint89Source.apiClient.includes("/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt")
  );
  record("settings-data certified release decision receipt wiring",
    sprint89Source.settingsData.includes("loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptData") &&
    sprint89Source.settingsData.includes("getProviderWebhookReviewQaHandoffCertifiedReleaseDecisionReceipt") &&
    sprint89Source.settingsData.includes("createMockReviewQaHandoffCertifiedReleaseDecisionReceipt")
  );
  record("provider readiness panel decision receipt control/result/error text",
    settingsPage.includes("QA Archive Certified Release Decision Receipt API error") &&
    settingsPage.includes("onLoadReviewQaHandoffCertifiedReleaseDecisionReceipt={loadReviewQaHandoffCertifiedReleaseDecisionReceipt}") &&
    providerPanel.includes("Load certified release decision receipt") &&
    providerPanel.includes("QA archive certified release decision receipt:") &&
    providerPanel.includes("receiptStatus=") &&
    providerPanel.includes("releaseDecision=") &&
    providerPanel.includes("blockingReasonCodes=")
  );
  record("decision receipt stale state clears with release gate/API failures",
    settingsPage.includes("setReviewQaHandoffCertifiedReleaseDecisionReceipt(null)") &&
    settingsPage.includes("setQaHandoffCertifiedReleaseDecisionReceiptError") &&
    settingsPage.includes("setReviewQaHandoffCertifiedReleaseGate(null)")
  );
  record("no DATA_MODE=api mock/local fallback markers",
    /if \(mode === "api"\) \{\s*return \{\s*mode,\s*decisionReceipt: await getProviderWebhookReviewQaHandoffCertifiedReleaseDecisionReceipt/s.test(settingsData) &&
    !/DATA_MODE=api[\s\S]{0,180}(mock|local|fallback)|(?:mock|local|fallback)[\s\S]{0,180}DATA_MODE=api/i.test(sprint89Source.settingsData)
  );
  record("static Sprint 89 source has no provider outbound send markers", !containsProviderOutbound(sprint89Source));
  record("static Sprint 89 source has no external notification send markers", !containsExternalNotification(sprint89Source));
  record("static Sprint 89 source has no AI/OpenAI call markers", !containsAiCall(sprint89Source));
  record("static Sprint 89 source has no raw provider material markers", safePayloadObject(sprint89Source));

  const health = await safeJson(await request("GET", "/health"));
  record("GET /health reachable", health?.status === "ok" && health?.service === "api");

  const receiptItem = await createNoMatchItem("decision-receipt", "Safe Sprint 89 certified release decision receipt target");
  record("create safe sandbox no-match item", receiptItem?.unmatchedStatus === "review-needed");

  const filters = "provider=line&eventType=message.created";
  const receiptBeforeLock = await requestJson("GET", `${decisionReceiptPath}?${filters}`);
  const receiptSignOff = await safeJson(await request("POST", `/provider-webhooks/review-qa-handoff-bundle/receipt/sign-off?${filters}`, {
    acknowledgementType: "sign_off",
    reviewerRole: "QA reviewer",
    reviewerLabel: "safe sprint89 reviewer"
  }));
  const lock = await safeJson(await request("POST", `/provider-webhooks/review-qa-handoff-bundle/acceptance-lock?${filters}`, {
    lockReason: "Safe Sprint 89 certified release decision receipt accepted",
    acceptedByRole: "QA lead",
    acceptedByLabel: "safe sprint89 reviewer"
  }));
  const receiptBeforeArchiveExport = await requestJson("GET", `${decisionReceiptPath}?${filters}`);
  const archive = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive?${filters}`));
  const exportedArchive = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/export?${filters}`));
  const manifest = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/retention-manifest?${filters}`));
  const integrity = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/integrity?${filters}`));
  const retentionAudit = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/retention-audit?${filters}`));
  const finalization = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization?${filters}`));
  const receiptBeforeSignOff = await requestJson("GET", `${decisionReceiptPath}?${filters}`);
  const signOff = await safeJson(await request("POST", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/sign-off?${filters}`, {
    reviewerRole: "retention reviewer",
    reviewerLabel: "safe sprint89 reviewer"
  }));
  const receipt = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/receipt?${filters}`));
  const releaseEvidence = await safeJson(await request("GET", `${releaseBasePath}?${filters}`));
  const releaseVerification = await safeJson(await request("GET", `${releaseBasePath}/verification?${filters}`));
  const releaseCertification = await safeJson(await request("GET", `${releaseBasePath}/verification/certification?${filters}`));
  const closureLedger = await safeJson(await request("GET", `${releaseBasePath}/verification/certification/closure-ledger?${filters}`));
  const attestationAudit = await safeJson(await request("GET", `${attestationPath}?${filters}`));
  const reconciliation = await safeJson(await request("GET", `${reconciliationPath}?${filters}`));
  const releaseGate = await safeJson(await request("GET", `${releaseGatePath}?${filters}`));
  const beforeReadPage = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound?provider=line&limit=25&offset=0&sortBy=receivedAt&sortOrder=desc"));
  const stateBeforeRead = unmatchedItems(beforeReadPage).find((item) => item.id === receiptItem.id);
  const decisionReceipt = await safeJson(await request("GET", `${decisionReceiptPath}?${filters}`));
  const afterReadPage = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound?provider=line&limit=25&offset=0&sortBy=receivedAt&sortOrder=desc"));
  const stateAfterRead = unmatchedItems(afterReadPage).find((item) => item.id === receiptItem.id);
  const invalidTenantReceipt = await requestJson("GET", `${decisionReceiptPath}?${filters}`, undefined, "00000000-0000-4000-8000-000000000089");

  record("decision receipt requires acceptance lock before prerequisites", receiptBeforeLock.status === 409 && /acceptance lock is required/i.test(JSON.stringify(receiptBeforeLock.body)));
  record("decision receipt requires locked archive export", receiptBeforeArchiveExport.status === 409 && /locked archive export is required/i.test(JSON.stringify(receiptBeforeArchiveExport.body)));
  record("decision receipt requires finalization sign-off", receiptBeforeSignOff.status === 409 && /finalization sign-off is required/i.test(JSON.stringify(receiptBeforeSignOff.body)));
  record("complete safe chain through Sprint 88 release gate", [receiptSignOff, lock, exportedArchive, manifest, integrity, retentionAudit, finalization, signOff, receipt, releaseEvidence, releaseVerification, releaseCertification, closureLedger, attestationAudit, reconciliation, releaseGate].every(Boolean));
  record("release gate ready/go", safeCertifiedReleaseGateShape(releaseGate) && releaseGate.gateStatus === "ready" && releaseGate.goNoGoDecision === "go");
  record("certified release decision receipt endpoint reachable", safeCertifiedReleaseDecisionReceiptShape(decisionReceipt));
  record("receiptStatus issued", decisionReceipt.receiptStatus === "issued");
  record("releaseDecision go", decisionReceipt.releaseDecision === "go");
  record("gateStatus ready", decisionReceipt.gateStatus === "ready");
  record("goNoGoDecision go", decisionReceipt.goNoGoDecision === "go");
  record("reconciliationStatus complete/aligned", ["complete", "aligned"].includes(decisionReceipt.reconciliationStatus));
  record("attestationStatus complete", decisionReceipt.attestationStatus === "complete");
  record("ledgerStatus certified_release_closed", decisionReceipt.ledgerStatus === "certified_release_closed");
  record("certificationStatus certified", decisionReceipt.certificationStatus === "certified");
  record("releaseReadinessStatus ready_for_release", decisionReceipt.releaseReadinessStatus === "ready_for_release");
  record("verificationStatus verified", decisionReceipt.verificationStatus === "verified");
  record("digestChainStatus confirmed", decisionReceipt.digestChainStatus === "confirmed");
  record("inherited prerequisite checklist complete", Object.values(decisionReceipt.inheritedPrerequisiteChecklist ?? {}).every(Boolean));
  record("inherited certification checklist complete", Object.values(decisionReceipt.inheritedCertificationChecklist ?? {}).every(Boolean));
  record("inherited gate checklist complete", Object.values(decisionReceipt.inheritedGateChecklist ?? {}).every(Boolean));
  record("decision receipt digest links aligned",
    decisionReceipt.releaseEvidenceDigest === releaseEvidence.safeDigest &&
    decisionReceipt.verificationDigest === releaseVerification.safeDigest &&
    decisionReceipt.certificationDigest === releaseCertification.safeDigest &&
    decisionReceipt.closureLedgerDigest === closureLedger.safeDigest &&
    decisionReceipt.attestationAuditDigest === attestationAudit.safeDigest &&
    decisionReceipt.reconciliationDigest === reconciliation.reconciliationDigest &&
    decisionReceipt.releaseGateDigest === releaseGate.releaseGateDigest &&
    decisionReceipt.decisionReceiptDigest === decisionReceipt.safeDigest
  );
  record("receiptRows present and safe", Array.isArray(decisionReceipt.receiptRows) && decisionReceipt.receiptRows.length >= 13 && decisionReceipt.receiptRows.every(safeReceiptRowShape));
  record("receiptSummary present and complete", decisionReceipt.receiptSummary?.receiptRowCount === decisionReceipt.receiptRows.length && decisionReceipt.receiptSummary?.completeReceiptRowCount === decisionReceipt.receiptRows.length && decisionReceipt.receiptSummary?.externalCallsZero === true);
  record("inheritedBlockingReasons safe", Array.isArray(decisionReceipt.inheritedBlockingReasons) && decisionReceipt.inheritedBlockingReasons.length === 0);
  record("inheritedExceptionRows safe", Array.isArray(decisionReceipt.inheritedExceptionRows) && decisionReceipt.inheritedExceptionRows.length === 0);
  record("counts present", Number.isInteger(decisionReceipt.counts?.decisionReceiptCheckedCount) && decisionReceipt.counts?.receiptRowCount === decisionReceipt.receiptRows.length && decisionReceipt.counts?.blockingReasonCount === 0);
  record("externalCalls=0", decisionReceipt.externalCalls === 0);
  record("no mutation before/after decision receipt read", metadataOnlyStateMatches(stateBeforeRead, stateAfterRead));
  record("invalid tenant does not return mock fallback", invalidTenantReceipt.status === 409 && !JSON.stringify(invalidTenantReceipt.body).includes("mockqahandoffcertifiedreleasedecisionreceipt"));
  record("no stale/fake decision receipt result markers", !JSON.stringify(decisionReceipt).includes("mockqahandoffcertifiedreleasedecisionreceipt"));
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
    afterReadPage
  }));
  record("no provider outbound", !containsProviderOutbound({ receiptSignOff, lock, archive, exportedArchive, manifest, integrity, retentionAudit, finalization, signOff, receipt, releaseEvidence, releaseVerification, releaseCertification, closureLedger, attestationAudit, reconciliation, releaseGate, decisionReceipt }));
  record("no external notification", !containsExternalNotification({ receiptSignOff, lock, archive, exportedArchive, manifest, integrity, retentionAudit, finalization, signOff, receipt, releaseEvidence, releaseVerification, releaseCertification, closureLedger, attestationAudit, reconciliation, releaseGate, decisionReceipt }));
  record("no AI/OpenAI call evidence", !containsAiCall({ receiptSignOff, lock, archive, exportedArchive, manifest, integrity, retentionAudit, finalization, signOff, receipt, releaseEvidence, releaseVerification, releaseCertification, closureLedger, attestationAudit, reconciliation, releaseGate, decisionReceipt }));
  record("no raw provider material leakage", safePayloadObject({
    receiptBeforeLock,
    receiptBeforeArchiveExport,
    receiptBeforeSignOff,
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
    invalidTenantReceipt,
    afterReadPage
  }));

  finish();
}

async function createNoMatchItem(label, text) {
  const eventId = `${runId}-${label}-${Math.random().toString(16).slice(2)}`;
  const payload = linePayload(`safe-no-match-room-sprint89-${label}-${runId}`, `safe-sender-sprint89-${label}`, text);
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
  return fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      "x-tenant-id": tenantOverride,
      "x-user-id": userId
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
}

async function requestJson(method, path, body, tenantOverride = tenantId) {
  const response = await request(method, path, body, tenantOverride);
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

function safeCertifiedReleaseGateShape(value) {
  return value &&
    value.gateKind === "qa-handoff-locked-archive-certified-release-gate" &&
    value.gateStatus === "ready" &&
    value.goNoGoDecision === "go" &&
    value.releaseReadinessStatus === "ready_for_release" &&
    ["complete", "aligned"].includes(value.reconciliationStatus) &&
    value.attestationStatus === "complete" &&
    value.ledgerStatus === "certified_release_closed" &&
    value.certificationStatus === "certified" &&
    value.verificationStatus === "verified" &&
    value.digestChainStatus === "confirmed" &&
    value.safeFilename === "provider-webhook-review-qa-handoff-certified-release-gate.json" &&
    value.safeDigest?.startsWith("sha256:") &&
    value.releaseGateDigest === value.safeDigest &&
    Object.values(value.gateChecklist ?? {}).every(Boolean) &&
    Array.isArray(value.blockingReasons) &&
    value.blockingReasons.length === 0 &&
    Array.isArray(value.exceptionRows) &&
    value.exceptionRows.length === 0 &&
    value.externalCalls === 0;
}

function safeCertifiedReleaseDecisionReceiptShape(value) {
  return value &&
    value.receiptKind === "qa-handoff-locked-archive-certified-release-decision-receipt" &&
    ["issued", "blocked", "incomplete"].includes(value.receiptStatus) &&
    ["go", "no_go"].includes(value.releaseDecision) &&
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
    Array.isArray(value.inheritedBlockingReasons) &&
    value.inheritedBlockingReasons.every(safeBlockingReasonShape) &&
    Array.isArray(value.inheritedExceptionRows) &&
    value.inheritedExceptionRows.every(safeAttestationReconciliationExceptionShape) &&
    Array.isArray(value.receiptRows) &&
    value.receiptRows.every(safeReceiptRowShape) &&
    Number.isInteger(value.counts?.decisionReceiptCheckedCount) &&
    value.externalCalls === 0;
}

function safeReceiptRowShape(row) {
  return row &&
    typeof row.key === "string" &&
    typeof row.label === "string" &&
    ["confirmed", "issued", "blocked"].includes(row.receiptRowStatus) &&
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
    console.error(`Sprint 89 smoke failed: ${failed.map((result) => result.name).join(", ")}`);
    process.exitCode = 1;
    return;
  }
  console.log("Sprint 89 smoke passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
