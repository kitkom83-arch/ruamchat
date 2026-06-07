import crypto from "node:crypto";
import { readFileSync } from "node:fs";

const baseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");
const tenantId = process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
const userId = process.env.USER_ID ?? "00000000-0000-4000-8000-000000000011";
const signingMaterial = process.env.PROVIDER_WEBHOOK_SANDBOX_SIGNING_KEY ?? "local-provider-webhook-sandbox-signing-material";
const runId = `sprint87-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const attestationPath = "/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit";
const reconciliationPath = `${attestationPath}/reconciliation`;
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

  const sprint87Source = {
    shared: sourceSlice(shared, "providerWebhookReviewQaHandoffReleaseAttestationReconciliationRowKeySchema", "providerWebhookUnmatchedInboundBulkReviewRequestSchema"),
    providerController: sourceSlice(providerController, "review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation", "review-closure-report/export"),
    providerService: [
      sourceSlice(providerService, "getReviewQaHandoffArchiveReleaseAttestationReconciliation(", "private getLockedArchiveContext"),
      sourceSlice(providerService, "function assertQaHandoffArchiveReleaseAttestationReconciliationReady", "function safeRoomLabel")
    ].join("\n"),
    apiClient: sourceSlice(apiClient, "getProviderWebhookReviewQaHandoffArchiveReleaseAttestationReconciliation", "getProviderWebhookReviewClosureReportExport"),
    settingsData: [
      sourceSlice(settingsData, "loadSettingsProviderWebhookReviewQaHandoffArchiveReleaseAttestationReconciliationData", "loadSettingsProviderWebhookReviewClosureReportRedactionAuditData"),
      sourceSlice(settingsData, "function createMockReviewQaHandoffArchiveReleaseAttestationReconciliation", "function createMockReleaseAttestationAuditRow")
    ].join("\n"),
    settingsPage: [
      sourceSlice(settingsPage, "reviewQaHandoffArchiveReleaseAttestationReconciliation", "reviewClosureReportRedactionAudit"),
      sourceSlice(settingsPage, "loadReviewQaHandoffArchiveReleaseAttestationReconciliation", "loadClosureReportRedactionAudit")
    ].join("\n"),
    providerPanel: sourceSlice(providerPanel, "Load closure ledger", "Audit report export redaction")
  };

  record("smoke:sprint87 registered",
    rootPackage.scripts?.["smoke:sprint87"] === "node scripts/smoke-sprint87-provider-webhook-review-qa-archive-certified-release-attestation-reconciliation.mjs"
  );
  record("Sprint 86/85/84/83/82/81/80/79/78/77/76/75 regression smoke scripts registered", [
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
  record("shared attestation reconciliation DTO export",
    shared.includes("providerWebhookReviewQaHandoffReleaseAttestationReconciliationRegisterSchema") &&
    shared.includes("ProviderWebhookReviewQaHandoffReleaseAttestationReconciliationRegister") &&
    sprint87Source.shared.includes("externalCalls: z.literal(0)") &&
    sprint87Source.shared.includes("reconciliationKind") &&
    sprint87Source.shared.includes("reconciliationStatus") &&
    sprint87Source.shared.includes("attestationAuditDigest") &&
    sprint87Source.shared.includes("reconciliationRows") &&
    sprint87Source.shared.includes("exceptionRows") &&
    sprint87Source.shared.includes("inheritedPrerequisiteChecklist") &&
    sprint87Source.shared.includes("inheritedCertificationChecklist") &&
    sprint87Source.shared.includes("reconciliationCheckedCount")
  );
  record("backend attestation reconciliation route registration",
    providerController.includes('@Get("review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation")') &&
    providerController.includes("getReviewQaHandoffArchiveReleaseAttestationReconciliation")
  );
  record("service attestation reconciliation implementation",
    providerService.includes("getReviewQaHandoffArchiveReleaseAttestationReconciliation") &&
    providerService.includes("qaHandoffArchiveReleaseAttestationReconciliationResponse") &&
    providerService.includes("assertQaHandoffArchiveReleaseAttestationReconciliationReady") &&
    providerService.includes("attestationAuditDigest") &&
    providerService.includes("reconciliationRows") &&
    providerService.includes("certificationChecklistComplete") &&
    providerService.includes("externalCalls: 0 as const")
  );
  record("API client attestation reconciliation wiring",
    apiClient.includes("getProviderWebhookReviewQaHandoffArchiveReleaseAttestationReconciliation") &&
    apiClient.includes("providerWebhookReviewQaHandoffReleaseAttestationReconciliationRegisterSchema") &&
    apiClient.includes("/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation")
  );
  record("settings-data attestation reconciliation wiring",
    settingsData.includes("loadSettingsProviderWebhookReviewQaHandoffArchiveReleaseAttestationReconciliationData") &&
    settingsData.includes("getProviderWebhookReviewQaHandoffArchiveReleaseAttestationReconciliation") &&
    settingsData.includes("createMockReviewQaHandoffArchiveReleaseAttestationReconciliation")
  );
  record("provider readiness panel attestation reconciliation control/result/error text",
    settingsPage.includes("QA Archive Release Attestation Reconciliation API error") &&
    settingsPage.includes("onLoadReviewQaHandoffArchiveReleaseAttestationReconciliation={loadReviewQaHandoffArchiveReleaseAttestationReconciliation}") &&
    providerPanel.includes("Load attestation reconciliation") &&
    providerPanel.includes("QA archive release attestation reconciliation:") &&
    providerPanel.includes("reconciliationStatus=") &&
    providerPanel.includes("attestationAuditDigest=") &&
    providerPanel.includes("reconciliationCheckedCount=")
  );
  record("no DATA_MODE=api mock/local fallback markers",
    /if \(mode === "api"\) \{\s*return \{\s*mode,\s*reconciliation: await getProviderWebhookReviewQaHandoffArchiveReleaseAttestationReconciliation/s.test(settingsData) &&
    !/DATA_MODE=api[\s\S]{0,180}(mock|local|fallback)|(?:mock|local|fallback)[\s\S]{0,180}DATA_MODE=api/i.test(sprint87Source.settingsData)
  );
  record("static Sprint 87 source has no provider outbound send markers", !containsProviderOutbound(sprint87Source));
  record("static Sprint 87 source has no external notification send markers", !containsExternalNotification(sprint87Source));
  record("static Sprint 87 source has no AI/OpenAI call markers", !containsAiCall(sprint87Source));
  record("static Sprint 87 source has no raw provider material markers", safePayloadObject(sprint87Source));

  const health = await safeJson(await request("GET", "/health"));
  record("GET /health reachable", health?.status === "ok" && health?.service === "api");

  const attestationItem = await createNoMatchItem("attestation-reconciliation", "Safe Sprint 87 attestation reconciliation target");
  record("create safe sandbox no-match item", attestationItem?.unmatchedStatus === "review-needed");

  const filters = "provider=line&eventType=message.created";
  const reconciliationBeforeLock = await requestJson("GET", `${reconciliationPath}?${filters}`);
  const receiptSignOff = await safeJson(await request("POST", `/provider-webhooks/review-qa-handoff-bundle/receipt/sign-off?${filters}`, {
    acknowledgementType: "sign_off",
    reviewerRole: "QA reviewer",
    reviewerLabel: "safe sprint87 reviewer"
  }));
  const lock = await safeJson(await request("POST", `/provider-webhooks/review-qa-handoff-bundle/acceptance-lock?${filters}`, {
    lockReason: "Safe Sprint 87 QA archive release attestation reconciliation accepted",
    acceptedByRole: "QA lead",
    acceptedByLabel: "safe sprint87 reviewer"
  }));
  const reconciliationBeforeArchiveExport = await requestJson("GET", `${reconciliationPath}?${filters}`);
  const archive = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive?${filters}`));
  const exportedArchive = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/export?${filters}`));
  const manifest = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/retention-manifest?${filters}`));
  const integrity = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/integrity?${filters}`));
  const retentionAudit = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/retention-audit?${filters}`));
  const finalization = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization?${filters}`));
  const reconciliationBeforeSignOff = await requestJson("GET", `${reconciliationPath}?${filters}`);
  const signOff = await safeJson(await request("POST", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/sign-off?${filters}`, {
    reviewerRole: "retention reviewer",
    reviewerLabel: "safe sprint87 reviewer"
  }));
  const receipt = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/receipt?${filters}`));
  const releaseEvidence = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence?${filters}`));
  const releaseVerification = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification?${filters}`));
  const releaseCertification = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification?${filters}`));
  const closureLedger = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger?${filters}`));
  const attestationAudit = await safeJson(await request("GET", `${attestationPath}?${filters}`));
  const beforeReadPage = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound?provider=line&limit=25&offset=0&sortBy=receivedAt&sortOrder=desc"));
  const stateBeforeRead = unmatchedItems(beforeReadPage).find((item) => item.id === attestationItem.id);
  const reconciliation = await safeJson(await request("GET", `${reconciliationPath}?${filters}`));
  const afterReadPage = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound?provider=line&limit=25&offset=0&sortBy=receivedAt&sortOrder=desc"));
  const stateAfterRead = unmatchedItems(afterReadPage).find((item) => item.id === attestationItem.id);

  record("attestation reconciliation requires acceptance lock before prerequisites", reconciliationBeforeLock.status === 409 && /acceptance lock is required/i.test(JSON.stringify(reconciliationBeforeLock.body)));
  record("attestation reconciliation requires locked archive export", reconciliationBeforeArchiveExport.status === 409 && /locked archive export is required/i.test(JSON.stringify(reconciliationBeforeArchiveExport.body)));
  record("attestation reconciliation requires finalization sign-off", reconciliationBeforeSignOff.status === 409 && /finalization sign-off is required/i.test(JSON.stringify(reconciliationBeforeSignOff.body)));
  record("complete prerequisite chain through Sprint 86 attestation audit", [receiptSignOff, lock, exportedArchive, manifest, integrity, retentionAudit, finalization, signOff, receipt, releaseEvidence, releaseVerification, releaseCertification, closureLedger, attestationAudit].every(Boolean));
  record("receipt sign-off endpoint remains reachable", receiptSignOff?.signOffStatus === "signed_off" && receiptSignOff.externalCalls === 0);
  record("acceptance lock remains safe", lock?.lockStatus === "locked" && ["locked", "already_locked"].includes(lock.lockAction) && lock.externalCalls === 0);
  record("locked archive/export remains safe", safeLockedArchiveShape(archive) && safeLockedArchiveShape(exportedArchive) && exportedArchive.lockedArchiveStatus === "exported");
  record("retention manifest remains safe", safeRetentionManifestShape(manifest));
  record("archive integrity confirmed", safeArchiveIntegrityShape(integrity));
  record("retention audit confirmed/ready", safeRetentionAuditShape(retentionAudit));
  record("finalization/sign-off/receipt reachable", safeArchiveFinalizationShape(finalization) && safeFinalizationSignOffShape(signOff) && safeFinalizationReceiptShape(receipt));
  record("release evidence ready", safeReleaseEvidenceShape(releaseEvidence));
  record("release verification verified before certification", safeReleaseVerificationShape(releaseVerification));
  record("release certification certified before closure ledger", safeReleaseCertificationShape(releaseCertification));
  record("closure ledger closed before attestation audit", safeReleaseClosureLedgerShape(closureLedger));
  record("attestation audit complete before reconciliation", safeReleaseAttestationAuditShape(attestationAudit));
  record("attestation audit rows present", Array.isArray(attestationAudit.attestationRows) && attestationAudit.attestationRows.length > 0 && attestationAudit.attestationRows.every(safeAttestationAuditRowShape));
  record("attestation status complete", attestationAudit.attestationStatus === "complete");
  record("certified release closure inherited", attestationAudit.ledgerStatus === "certified_release_closed" && attestationAudit.certificationStatus === "certified");
  record("digest chain confirmed", attestationAudit.digestChainStatus === "confirmed");
  record("closure ledger digest linked", attestationAudit.closureLedgerDigest === closureLedger.safeDigest);
  record("deterministic attestation counts present", Number.isInteger(attestationAudit.counts?.attestationAuditCheckedCount) && attestationAudit.counts?.attestationRowCount === attestationAudit.attestationRows.length && attestationAudit.counts?.attestationNeedsReviewRowCount === 0);
  record("attestation reconciliation endpoint reachable", safeReleaseAttestationReconciliationShape(reconciliation));
  record("reconciliation status aligned", reconciliation.reconciliationStatus === "aligned");
  record("reconciliation rows present", Array.isArray(reconciliation.reconciliationRows) && reconciliation.reconciliationRows.length > 0 && reconciliation.reconciliationRows.every(safeAttestationReconciliationRowShape));
  record("safe exception rows present", Array.isArray(reconciliation.exceptionRows) && reconciliation.exceptionRows.every(safeAttestationReconciliationExceptionShape));
  record("attestation audit digest linked", reconciliation.attestationAuditDigest === attestationAudit.safeDigest);
  record("reconciliation digest linked", reconciliation.reconciliationDigest === reconciliation.safeDigest);
  record("deterministic reconciliation counts present", Number.isInteger(reconciliation.counts?.reconciliationCheckedCount) && reconciliation.counts?.reconciliationRowCount === reconciliation.reconciliationRows.length && reconciliation.counts?.reconciliationExceptionRowCount === reconciliation.exceptionRows.length);
  record("externalCalls=0", reconciliation.externalCalls === 0);
  record("no mutation before/after attestation reconciliation reads", metadataOnlyStateMatches(stateBeforeRead, stateAfterRead));
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
    afterReadPage
  }));
  record("no provider outbound", !containsProviderOutbound({ receiptSignOff, lock, archive, exportedArchive, manifest, integrity, retentionAudit, finalization, signOff, receipt, releaseEvidence, releaseVerification, releaseCertification, closureLedger, attestationAudit, reconciliation }));
  record("no external notification", !containsExternalNotification({ receiptSignOff, lock, archive, exportedArchive, manifest, integrity, retentionAudit, finalization, signOff, receipt, releaseEvidence, releaseVerification, releaseCertification, closureLedger, attestationAudit, reconciliation }));
  record("no AI/OpenAI call evidence", !containsAiCall({ receiptSignOff, lock, archive, exportedArchive, manifest, integrity, retentionAudit, finalization, signOff, receipt, releaseEvidence, releaseVerification, releaseCertification, closureLedger, attestationAudit, reconciliation }));
  record("no raw provider material leakage", safePayloadObject({
    reconciliationBeforeLock,
    reconciliationBeforeArchiveExport,
    reconciliationBeforeSignOff,
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
    afterReadPage
  }));

  finish();
}

async function createNoMatchItem(label, text) {
  const eventId = `${runId}-${label}-${Math.random().toString(16).slice(2)}`;
  const payload = linePayload(`safe-no-match-room-sprint87-${label}-${runId}`, `safe-sender-sprint87-${label}`, text);
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

async function request(method, path, body) {
  return fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      "x-tenant-id": tenantId,
      "x-user-id": userId
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
}

async function requestJson(method, path, body) {
  const response = await request(method, path, body);
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

function safeLockedArchiveShape(value) {
  return value &&
    ["ready", "exported"].includes(value.lockedArchiveStatus) &&
    value.retentionManifestStatus === "ready" &&
    value.lockStatus === "locked" &&
    typeof value.safeFilename === "string" &&
    typeof value.safeDigest === "string" &&
    value.safeDigest.startsWith("sha256:") &&
    value.manualQaChecks?.providerOutboundAbsent === true &&
    value.manualQaChecks?.externalCallsZero === true &&
    value.externalCalls === 0;
}

function safeRetentionManifestShape(value) {
  return value &&
    value.manifestKind === "qa-handoff-locked-archive-retention-manifest" &&
    value.retentionManifestStatus === "ready" &&
    value.retentionReadiness === "ready" &&
    typeof value.archiveDigest === "string" &&
    value.externalCalls === 0;
}

function safeArchiveIntegrityShape(value) {
  return value &&
    value.integrityStatus === "confirmed" &&
    value.retentionAuditStatus === "confirmed" &&
    value.digestChainStatus === "confirmed" &&
    value.lockStatus === "locked" &&
    typeof value.safeFilename === "string" &&
    typeof value.safeDigest === "string" &&
    value.safeDigest.startsWith("sha256:") &&
    typeof value.lockedArchiveDigest === "string" &&
    typeof value.retentionManifestDigest === "string" &&
    Number.isInteger(value.counts?.digestChainLinkCount) &&
    value.externalCalls === 0;
}

function safeRetentionAuditShape(value) {
  return value &&
    value.retentionPolicyStatus === "active" &&
    value.retentionAuditStatus === "confirmed" &&
    value.digestChainStatus === "confirmed" &&
    value.lockStatus === "locked" &&
    typeof value.safePolicyLabel === "string" &&
    Array.isArray(value.auditChecklistItems) &&
    Number.isInteger(value.counts?.auditChecklistPassedCount) &&
    value.externalCalls === 0;
}

function safeArchiveFinalizationShape(value) {
  return value &&
    ["ready", "finalized"].includes(value.finalizationStatus) &&
    ["not_signed", "signed_off"].includes(value.retentionSignOffStatus) &&
    ["not_created", "ready"].includes(value.finalizationReceiptStatus) &&
    value.integrityStatus === "confirmed" &&
    value.retentionAuditStatus === "confirmed" &&
    value.digestChainStatus === "confirmed" &&
    value.lockStatus === "locked" &&
    typeof value.safeFilename === "string" &&
    typeof value.safeDigest === "string" &&
    value.safeDigest.startsWith("sha256:") &&
    typeof value.lockedArchiveDigest === "string" &&
    typeof value.retentionManifestDigest === "string" &&
    typeof value.integrityDigest === "string" &&
    Number.isInteger(value.counts?.finalizationCheckedCount) &&
    value.externalCalls === 0;
}

function safeFinalizationSignOffShape(value) {
  return safeArchiveFinalizationShape(value) &&
    value.action === "sign_off" &&
    value.finalizationStatus === "finalized" &&
    value.retentionSignOffStatus === "signed_off" &&
    value.finalizationReceiptStatus === "ready" &&
    typeof value.signOffRecordId === "string" &&
    value.externalCalls === 0;
}

function safeFinalizationReceiptShape(value) {
  return safeArchiveFinalizationShape(value) &&
    value.receiptKind === "qa-handoff-locked-archive-finalization-receipt" &&
    value.finalizationStatus === "finalized" &&
    value.retentionSignOffStatus === "signed_off" &&
    value.finalizationReceiptStatus === "ready" &&
    typeof value.signOffRecordId === "string" &&
    value.externalCalls === 0;
}

function safeReleaseEvidenceShape(value) {
  return value &&
    value.evidenceKind === "qa-handoff-locked-archive-release-evidence-pack" &&
    value.releaseReadinessStatus === "ready_for_release" &&
    value.finalizationStatus === "finalized" &&
    value.retentionSignOffStatus === "signed_off" &&
    value.finalizationReceiptStatus === "ready" &&
    value.lockedArchiveStatus === "exported" &&
    value.archiveAcknowledgementStatus === "exported" &&
    value.retentionPolicyStatus === "active" &&
    value.digestChainStatus === "confirmed" &&
    typeof value.safeFilename === "string" &&
    value.safeFilename.includes("release-evidence-pack") &&
    typeof value.safeDigest === "string" &&
    value.safeDigest.startsWith("sha256:") &&
    typeof value.retentionAuditDigest === "string" &&
    value.retentionAuditDigest.startsWith("sha256:") &&
    Number.isInteger(value.counts?.releaseEvidenceCheckedCount) &&
    value.externalCalls === 0;
}

function safeReleaseVerificationShape(value) {
  return value &&
    value.verificationKind === "qa-handoff-locked-archive-release-verification-matrix" &&
    value.verificationStatus === "verified" &&
    value.releaseReadinessStatus === "ready_for_release" &&
    value.digestChainStatus === "confirmed" &&
    typeof value.safeFilename === "string" &&
    value.safeFilename.includes("release-verification-matrix") &&
    typeof value.safeDigest === "string" &&
    value.safeDigest.startsWith("sha256:") &&
    typeof value.releaseEvidenceDigest === "string" &&
    value.releaseEvidenceDigest.startsWith("sha256:") &&
    Array.isArray(value.digestMatrixRows) &&
    value.digestMatrixRows.every(safeDigestMatrixRowShape) &&
    Number.isInteger(value.counts?.releaseVerificationCheckedCount) &&
    Number.isInteger(value.counts?.digestMatrixRowCount) &&
    value.externalCalls === 0;
}

function safeReleaseCertificationShape(value) {
  return value &&
    value.certificationKind === "qa-handoff-locked-archive-release-certification-receipt" &&
    value.certificationStatus === "certified" &&
    value.releaseReadinessStatus === "ready_for_release" &&
    value.verificationStatus === "verified" &&
    value.digestChainStatus === "confirmed" &&
    typeof value.safeFilename === "string" &&
    value.safeFilename.includes("release-certification-receipt") &&
    typeof value.safeDigest === "string" &&
    value.safeDigest.startsWith("sha256:") &&
    typeof value.releaseEvidenceDigest === "string" &&
    value.releaseEvidenceDigest.startsWith("sha256:") &&
    typeof value.releaseVerificationDigest === "string" &&
    value.releaseVerificationDigest.startsWith("sha256:") &&
    value.certificationChecklist?.releaseVerificationVerified === true &&
    value.certificationChecklist?.digestMatrixVerified === true &&
    value.certificationChecklist?.externalCallsZero === true &&
    value.digestMatrixSummary?.allRowsVerified === true &&
    Number.isInteger(value.counts?.releaseCertificationCheckedCount) &&
    value.externalCalls === 0;
}

function safeReleaseClosureLedgerShape(value) {
  return value &&
    value.ledgerKind === "qa-handoff-locked-archive-release-closure-ledger" &&
    value.ledgerStatus === "certified_release_closed" &&
    value.certificationStatus === "certified" &&
    value.releaseReadinessStatus === "ready_for_release" &&
    value.verificationStatus === "verified" &&
    value.digestChainStatus === "confirmed" &&
    typeof value.safeFilename === "string" &&
    value.safeFilename.includes("release-closure-ledger") &&
    typeof value.safeDigest === "string" &&
    value.safeDigest.startsWith("sha256:") &&
    typeof value.releaseCertificationDigest === "string" &&
    value.releaseCertificationDigest.startsWith("sha256:") &&
    Array.isArray(value.ledgerRows) &&
    value.ledgerRows.length > 0 &&
    value.ledgerRows.every(safeClosureLedgerRowShape) &&
    value.ledgerSummary?.certificationChecklistComplete === true &&
    value.ledgerSummary?.externalCallsZero === true &&
    Number.isInteger(value.counts?.closureLedgerCheckedCount) &&
    value.externalCalls === 0;
}

function safeReleaseAttestationAuditShape(value) {
  return value &&
    value.attestationKind === "qa-handoff-locked-archive-release-attestation-audit" &&
    value.attestationStatus === "complete" &&
    value.ledgerStatus === "certified_release_closed" &&
    value.certificationStatus === "certified" &&
    value.releaseReadinessStatus === "ready_for_release" &&
    value.verificationStatus === "verified" &&
    value.digestChainStatus === "confirmed" &&
    typeof value.safeFilename === "string" &&
    value.safeFilename.includes("release-attestation-audit") &&
    typeof value.safeDigest === "string" &&
    value.safeDigest.startsWith("sha256:") &&
    typeof value.releaseEvidenceDigest === "string" &&
    value.releaseEvidenceDigest.startsWith("sha256:") &&
    typeof value.releaseVerificationDigest === "string" &&
    value.releaseVerificationDigest.startsWith("sha256:") &&
    typeof value.releaseCertificationDigest === "string" &&
    value.releaseCertificationDigest.startsWith("sha256:") &&
    typeof value.closureLedgerDigest === "string" &&
    value.closureLedgerDigest.startsWith("sha256:") &&
    Array.isArray(value.attestationRows) &&
    value.attestationRows.length > 0 &&
    value.attestationRows.every(safeAttestationAuditRowShape) &&
    value.attestationSummary?.ledgerClosed === true &&
    value.attestationSummary?.prerequisiteChecklistComplete === true &&
    value.attestationSummary?.certificationChecklistComplete === true &&
    value.attestationSummary?.externalCallsZero === true &&
    Number.isInteger(value.counts?.attestationAuditCheckedCount) &&
    value.externalCalls === 0;
}

function safeReleaseAttestationReconciliationShape(value) {
  return value &&
    value.reconciliationKind === "qa-handoff-locked-archive-release-attestation-reconciliation-register" &&
    value.reconciliationStatus === "aligned" &&
    value.attestationStatus === "complete" &&
    value.ledgerStatus === "certified_release_closed" &&
    value.certificationStatus === "certified" &&
    value.releaseReadinessStatus === "ready_for_release" &&
    value.verificationStatus === "verified" &&
    value.digestChainStatus === "confirmed" &&
    typeof value.safeFilename === "string" &&
    value.safeFilename.includes("release-attestation-reconciliation") &&
    typeof value.safeDigest === "string" &&
    value.safeDigest.startsWith("sha256:") &&
    typeof value.releaseEvidenceDigest === "string" &&
    value.releaseEvidenceDigest.startsWith("sha256:") &&
    typeof value.verificationDigest === "string" &&
    value.verificationDigest.startsWith("sha256:") &&
    typeof value.certificationDigest === "string" &&
    value.certificationDigest.startsWith("sha256:") &&
    typeof value.closureLedgerDigest === "string" &&
    value.closureLedgerDigest.startsWith("sha256:") &&
    typeof value.attestationAuditDigest === "string" &&
    value.attestationAuditDigest.startsWith("sha256:") &&
    typeof value.reconciliationDigest === "string" &&
    value.reconciliationDigest === value.safeDigest &&
    Array.isArray(value.reconciliationRows) &&
    value.reconciliationRows.length > 0 &&
    value.reconciliationRows.every(safeAttestationReconciliationRowShape) &&
    Array.isArray(value.exceptionRows) &&
    value.exceptionRows.every(safeAttestationReconciliationExceptionShape) &&
    value.reconciliationSummary?.attestationAuditComplete === true &&
    value.reconciliationSummary?.closureLedgerClosed === true &&
    value.reconciliationSummary?.prerequisiteChecklistComplete === true &&
    value.reconciliationSummary?.certificationChecklistComplete === true &&
    value.reconciliationSummary?.allDigestsLinked === true &&
    value.reconciliationSummary?.externalCallsZero === true &&
    Number.isInteger(value.counts?.reconciliationCheckedCount) &&
    value.externalCalls === 0;
}

function safeClosureLedgerRowShape(row) {
  return row &&
    typeof row.key === "string" &&
    typeof row.label === "string" &&
    typeof row.safeDigest === "string" &&
    row.safeDigest.startsWith("sha256:") &&
    Number.isInteger(row.checkedCount) &&
    row.complete === true;
}

function safeAttestationAuditRowShape(row) {
  return row &&
    typeof row.key === "string" &&
    typeof row.label === "string" &&
    ["verified", "complete", "attested"].includes(row.attestationStatus) &&
    typeof row.safeDigest === "string" &&
    row.safeDigest.startsWith("sha256:") &&
    Number.isInteger(row.checkedCount) &&
    row.complete === true;
}

function safeAttestationReconciliationRowShape(row) {
  return row &&
    typeof row.key === "string" &&
    typeof row.label === "string" &&
    ["aligned", "verified", "complete", "attested"].includes(row.reconciliationStatus) &&
    typeof row.safeDigest === "string" &&
    row.safeDigest.startsWith("sha256:") &&
    Number.isInteger(row.checkedCount) &&
    row.aligned === true;
}

function safeAttestationReconciliationExceptionShape(row) {
  return row &&
    typeof row.code === "string" &&
    typeof row.label === "string" &&
    row.status === "safe_exception" &&
    typeof row.safeDigest === "string" &&
    row.safeDigest.startsWith("sha256:") &&
    Number.isInteger(row.checkedCount);
}

function safeDigestMatrixRowShape(row) {
  return row &&
    typeof row.key === "string" &&
    typeof row.label === "string" &&
    typeof row.safeDigest === "string" &&
    row.safeDigest.startsWith("sha256:") &&
    row.expectedDigest === row.safeDigest &&
    row.digestPresent === true &&
    row.digestMatchesExpected === true &&
    row.verificationStatus === "verified";
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
  return !/"rawPayload"\s*:|"rawSignature"\s*:|"replyToken"\s*:|"senderId"\s*:|"roomId"\s*:|"token"\s*:|"secret"\s*:|"authorization"\s*:|"cookie"\s*:|providerRaw|payloadJson|raw-room|raw-sender|reply-token-must-not-return|message-id-must-not-return|accessToken|webhookSecret|bearer/i.test(serialized(value));
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
    console.error(`Sprint 87 smoke failed: ${failed.map((result) => result.name).join(", ")}`);
    process.exitCode = 1;
    return;
  }
  console.log("Sprint 87 smoke passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
