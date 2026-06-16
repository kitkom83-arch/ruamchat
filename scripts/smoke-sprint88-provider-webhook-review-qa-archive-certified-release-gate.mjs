import crypto from "node:crypto";
import { readFileSync } from "node:fs";

const baseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");
const tenantId = process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
const userId = process.env.USER_ID ?? "00000000-0000-4000-8000-000000000011";
const signingMaterial = process.env.PROVIDER_WEBHOOK_SANDBOX_SIGNING_KEY ?? "local-provider-webhook-sandbox-signing-material";
const runId = `sprint88-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const releaseBasePath = "/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence";
const attestationPath = `${releaseBasePath}/verification/certification/closure-ledger/attestation-audit`;
const reconciliationPath = `${attestationPath}/reconciliation`;
const releaseGatePath = `${reconciliationPath}/release-gate`;
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
  const sprint88Source = {
    shared: sourceSlice(shared, "providerWebhookReviewQaHandoffCertifiedReleaseGateStatusSchema", "providerWebhookUnmatchedInboundBulkReviewRequestSchema"),
    providerController: sourceSlice(providerController, "review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate", "review-closure-report/export"),
    providerService: [
      sourceSlice(providerService, "getReviewQaHandoffCertifiedReleaseGate(", "private getLockedArchiveContext"),
      sourceSlice(providerService, "function assertQaHandoffCertifiedReleaseGatePrerequisites", "function assertQaHandoffCertifiedReleaseDecisionReceiptPrerequisites")
    ].join("\n"),
    apiClient: sourceSlice(apiClient, "getProviderWebhookReviewQaHandoffCertifiedReleaseGate", "getProviderWebhookReviewClosureReportExport"),
    settingsData: [
      sourceSlice(settingsData, "loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseGateData", "loadSettingsProviderWebhookReviewClosureReportRedactionAuditData"),
      sourceSlice(settingsData, "function createMockReviewQaHandoffCertifiedReleaseGate", "function createMockReleaseAttestationAuditRow")
    ].join("\n"),
    settingsPage: [
      sourceSlice(settingsPage, "reviewQaHandoffCertifiedReleaseGate", "reviewClosureReportRedactionAudit"),
      sourceSlice(settingsPage, "loadReviewQaHandoffCertifiedReleaseGate", "loadClosureReportRedactionAudit")
    ].join("\n"),
    providerPanel: sourceSlice(providerPanel, "Load attestation reconciliation", "Audit report export redaction")
  };

  record("smoke:sprint88 registered",
    rootPackage.scripts?.["smoke:sprint88"] === "node scripts/smoke-sprint88-provider-webhook-review-qa-archive-certified-release-gate.mjs"
  );
  record("Sprint 87/86/85/84/83/82/81/80/79/78/77/76/75 regression smoke scripts registered", [
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
  record("shared certified release gate DTO export",
    sprint88Source.shared.includes("providerWebhookReviewQaHandoffCertifiedReleaseGateSchema") &&
    sprint88Source.shared.includes("ProviderWebhookReviewQaHandoffCertifiedReleaseGate") &&
    sprint88Source.shared.includes("gateStatus") &&
    sprint88Source.shared.includes("goNoGoDecision") &&
    sprint88Source.shared.includes("blockingReasons") &&
    sprint88Source.shared.includes("exceptionRows") &&
    sprint88Source.shared.includes("externalCalls: z.literal(0)") &&
    sprint88Source.shared.includes(".strict()")
  );
  record("backend certified release gate route registration",
    providerController.includes('@Get("review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate")') &&
    providerController.includes("getReviewQaHandoffCertifiedReleaseGate")
  );
  record("service certified release gate implementation",
    sprint88Source.providerService.includes("getReviewQaHandoffCertifiedReleaseGate") &&
    sprint88Source.providerService.includes("qaHandoffCertifiedReleaseGateResponse") &&
    sprint88Source.providerService.includes("assertQaHandoffCertifiedReleaseGatePrerequisites") &&
    sprint88Source.providerService.includes("goNoGoDecision") &&
    sprint88Source.providerService.includes("blockingReasons") &&
    sprint88Source.providerService.includes("releaseGateDigest") &&
    sprint88Source.providerService.includes("externalCalls: 0 as const")
  );
  record("API client certified release gate wiring",
    sprint88Source.apiClient.includes("getProviderWebhookReviewQaHandoffCertifiedReleaseGate") &&
    sprint88Source.apiClient.includes("providerWebhookReviewQaHandoffCertifiedReleaseGateSchema") &&
    sprint88Source.apiClient.includes("/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate")
  );
  record("settings-data certified release gate wiring",
    sprint88Source.settingsData.includes("loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseGateData") &&
    sprint88Source.settingsData.includes("getProviderWebhookReviewQaHandoffCertifiedReleaseGate") &&
    sprint88Source.settingsData.includes("createMockReviewQaHandoffCertifiedReleaseGate")
  );
  record("provider readiness panel certified release gate control/result/error text",
    settingsPage.includes("QA Archive Certified Release Gate API error") &&
    settingsPage.includes("onLoadReviewQaHandoffCertifiedReleaseGate={loadReviewQaHandoffCertifiedReleaseGate}") &&
    providerPanel.includes("Load certified release gate") &&
    providerPanel.includes("QA archive certified release gate:") &&
    providerPanel.includes("gateStatus=") &&
    providerPanel.includes("goNoGoDecision=") &&
    providerPanel.includes("blockingReasonCodes=")
  );
  record("no DATA_MODE=api mock/local fallback markers",
    /if \(mode === "api"\) \{\s*return \{\s*mode,\s*releaseGate: await getProviderWebhookReviewQaHandoffCertifiedReleaseGate/s.test(settingsData) &&
    !/DATA_MODE=api[\s\S]{0,180}(mock|local|fallback)|(?:mock|local|fallback)[\s\S]{0,180}DATA_MODE=api/i.test(sprint88Source.settingsData)
  );
  record("static Sprint 88 source has no provider outbound send markers", !containsProviderOutbound(sprint88Source));
  record("static Sprint 88 source has no external notification send markers", !containsExternalNotification(sprint88Source));
  record("static Sprint 88 source has no AI/OpenAI call markers", !containsAiCall(sprint88Source));
  record("static Sprint 88 source has no raw provider material markers", safePayloadObject(sprint88Source));

  const health = await safeJson(await request("GET", "/health"));
  record("GET /health reachable", health?.status === "ok" && health?.service === "api");

  const gateItem = await createNoMatchItem("certified-release-gate", "Safe Sprint 88 certified release gate target");
  record("create safe sandbox no-match item", gateItem?.unmatchedStatus === "review-needed");

  const filters = "provider=line&eventType=message.created";
  const gateBeforeLock = await requestJson("GET", `${releaseGatePath}?${filters}`);
  const receiptSignOff = await safeJson(await request("POST", `/provider-webhooks/review-qa-handoff-bundle/receipt/sign-off?${filters}`, {
    acknowledgementType: "sign_off",
    reviewerRole: "QA reviewer",
    reviewerLabel: "safe sprint88 reviewer"
  }));
  const lock = await safeJson(await request("POST", `/provider-webhooks/review-qa-handoff-bundle/acceptance-lock?${filters}`, {
    lockReason: "Safe Sprint 88 certified release gate accepted",
    acceptedByRole: "QA lead",
    acceptedByLabel: "safe sprint88 reviewer"
  }));
  const gateBeforeArchiveExport = await requestJson("GET", `${releaseGatePath}?${filters}`);
  const archive = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive?${filters}`));
  const exportedArchive = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/export?${filters}`));
  const manifest = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/retention-manifest?${filters}`));
  const integrity = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/integrity?${filters}`));
  const retentionAudit = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/retention-audit?${filters}`));
  const finalization = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization?${filters}`));
  const gateBeforeSignOff = await requestJson("GET", `${releaseGatePath}?${filters}`);
  const signOff = await safeJson(await request("POST", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/sign-off?${filters}`, {
    reviewerRole: "retention reviewer",
    reviewerLabel: "safe sprint88 reviewer"
  }));
  const receipt = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/receipt?${filters}`));
  const releaseEvidence = await safeJson(await request("GET", `${releaseBasePath}?${filters}`));
  const releaseVerification = await safeJson(await request("GET", `${releaseBasePath}/verification?${filters}`));
  const releaseCertification = await safeJson(await request("GET", `${releaseBasePath}/verification/certification?${filters}`));
  const closureLedger = await safeJson(await request("GET", `${releaseBasePath}/verification/certification/closure-ledger?${filters}`));
  const attestationAudit = await safeJson(await request("GET", `${attestationPath}?${filters}`));
  const reconciliation = await safeJson(await request("GET", `${reconciliationPath}?${filters}`));
  const beforeReadPage = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound?provider=line&limit=25&offset=0&sortBy=receivedAt&sortOrder=desc"));
  const stateBeforeRead = unmatchedItems(beforeReadPage).find((item) => item.id === gateItem.id);
  const releaseGate = await safeJson(await request("GET", `${releaseGatePath}?${filters}`));
  const afterReadPage = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound?provider=line&limit=25&offset=0&sortBy=receivedAt&sortOrder=desc"));
  const stateAfterRead = unmatchedItems(afterReadPage).find((item) => item.id === gateItem.id);
  const invalidTenantGate = await requestJson("GET", `${releaseGatePath}?${filters}`, undefined, "00000000-0000-4000-8000-000000000088");

  record("certified release gate requires acceptance lock before prerequisites", gateBeforeLock.status === 409 && /acceptance lock is required/i.test(JSON.stringify(gateBeforeLock.body)));
  record("certified release gate requires locked archive export", gateBeforeArchiveExport.status === 409 && /locked archive export is required/i.test(JSON.stringify(gateBeforeArchiveExport.body)));
  record("certified release gate requires finalization sign-off", gateBeforeSignOff.status === 409 && /finalization sign-off is required/i.test(JSON.stringify(gateBeforeSignOff.body)));
  record("complete safe chain through Sprint 87 reconciliation", [receiptSignOff, lock, exportedArchive, manifest, integrity, retentionAudit, finalization, signOff, receipt, releaseEvidence, releaseVerification, releaseCertification, closureLedger, attestationAudit, reconciliation].every(Boolean));
  record("release evidence ready", safeReleaseEvidenceShape(releaseEvidence));
  record("release verification verified", safeReleaseVerificationShape(releaseVerification));
  record("release certification certified", safeReleaseCertificationShape(releaseCertification));
  record("closure ledger closed", safeReleaseClosureLedgerShape(closureLedger));
  record("attestation audit complete", safeReleaseAttestationAuditShape(attestationAudit));
  record("reconciliation aligned", safeReleaseAttestationReconciliationShape(reconciliation));
  record("certified release gate endpoint reachable", safeCertifiedReleaseGateShape(releaseGate));
  record("gateStatus ready", releaseGate.gateStatus === "ready");
  record("goNoGoDecision go", releaseGate.goNoGoDecision === "go");
  record("reconciliationStatus complete/aligned", ["complete", "aligned"].includes(releaseGate.reconciliationStatus));
  record("attestationStatus complete", releaseGate.attestationStatus === "complete");
  record("ledgerStatus certified_release_closed", releaseGate.ledgerStatus === "certified_release_closed");
  record("certificationStatus certified", releaseGate.certificationStatus === "certified");
  record("releaseReadinessStatus ready_for_release", releaseGate.releaseReadinessStatus === "ready_for_release");
  record("verificationStatus verified", releaseGate.verificationStatus === "verified");
  record("digestChainStatus confirmed", releaseGate.digestChainStatus === "confirmed");
  record("prerequisite checklist complete", Object.values(releaseGate.inheritedPrerequisiteChecklist ?? {}).every(Boolean));
  record("certification checklist complete", Object.values(releaseGate.inheritedCertificationChecklist ?? {}).every(Boolean));
  record("release gate digest links aligned",
    releaseGate.releaseEvidenceDigest === releaseEvidence.safeDigest &&
    releaseGate.verificationDigest === releaseVerification.safeDigest &&
    releaseGate.certificationDigest === releaseCertification.safeDigest &&
    releaseGate.closureLedgerDigest === closureLedger.safeDigest &&
    releaseGate.attestationAuditDigest === attestationAudit.safeDigest &&
    releaseGate.reconciliationDigest === reconciliation.reconciliationDigest &&
    releaseGate.releaseGateDigest === releaseGate.safeDigest
  );
  record("gateChecklist present and complete", Object.values(releaseGate.gateChecklist ?? {}).every(Boolean) && releaseGate.counts?.gateChecklistPassedCount === releaseGate.counts?.gateChecklistTotalCount);
  record("blockingReasons safe", Array.isArray(releaseGate.blockingReasons) && releaseGate.blockingReasons.length === 0);
  record("exceptionRows safe", Array.isArray(releaseGate.exceptionRows) && releaseGate.exceptionRows.length === 0);
  record("counts present", Number.isInteger(releaseGate.counts?.gateCheckedCount) && releaseGate.counts?.blockingReasonCount === 0 && releaseGate.counts?.exceptionRowCount === 0);
  record("externalCalls=0", releaseGate.externalCalls === 0);
  record("no mutation before/after certified release gate read", metadataOnlyStateMatches(stateBeforeRead, stateAfterRead));
  record("invalid tenant does not return mock fallback", invalidTenantGate.status === 409 && !JSON.stringify(invalidTenantGate.body).includes("mockqahandoffcertifiedreleasegate"));
  record("no stale/fake release gate result markers", !JSON.stringify(releaseGate).includes("mockqahandoffcertifiedreleasegate"));
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
    afterReadPage
  }));
  record("no provider outbound", !containsProviderOutbound({ receiptSignOff, lock, archive, exportedArchive, manifest, integrity, retentionAudit, finalization, signOff, receipt, releaseEvidence, releaseVerification, releaseCertification, closureLedger, attestationAudit, reconciliation, releaseGate }));
  record("no external notification", !containsExternalNotification({ receiptSignOff, lock, archive, exportedArchive, manifest, integrity, retentionAudit, finalization, signOff, receipt, releaseEvidence, releaseVerification, releaseCertification, closureLedger, attestationAudit, reconciliation, releaseGate }));
  record("no AI/OpenAI call evidence", !containsAiCall({ receiptSignOff, lock, archive, exportedArchive, manifest, integrity, retentionAudit, finalization, signOff, receipt, releaseEvidence, releaseVerification, releaseCertification, closureLedger, attestationAudit, reconciliation, releaseGate }));
  record("no raw provider material leakage", safePayloadObject({
    gateBeforeLock,
    gateBeforeArchiveExport,
    gateBeforeSignOff,
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
    invalidTenantGate,
    afterReadPage
  }));

  finish();
}

async function createNoMatchItem(label, text) {
  const eventId = `${runId}-${label}-${Math.random().toString(16).slice(2)}`;
  const payload = linePayload(`safe-no-match-room-sprint88-${label}-${runId}`, `safe-sender-sprint88-${label}`, text);
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

function safeReleaseEvidenceShape(value) {
  return value &&
    value.evidenceKind === "qa-handoff-locked-archive-release-evidence-pack" &&
    value.releaseReadinessStatus === "ready_for_release" &&
    value.finalizationStatus === "finalized" &&
    value.retentionSignOffStatus === "signed_off" &&
    value.finalizationReceiptStatus === "ready" &&
    value.digestChainStatus === "confirmed" &&
    value.safeDigest?.startsWith("sha256:") &&
    value.prerequisiteChecklist?.externalCallsZero === true &&
    value.externalCalls === 0;
}

function safeReleaseVerificationShape(value) {
  return value &&
    value.verificationKind === "qa-handoff-locked-archive-release-verification-matrix" &&
    value.verificationStatus === "verified" &&
    value.releaseReadinessStatus === "ready_for_release" &&
    value.digestChainStatus === "confirmed" &&
    value.safeDigest?.startsWith("sha256:") &&
    value.releaseEvidenceDigest?.startsWith("sha256:") &&
    Array.isArray(value.digestMatrixRows) &&
    value.digestMatrixRows.every(safeDigestMatrixRowShape) &&
    value.externalCalls === 0;
}

function safeReleaseCertificationShape(value) {
  return value &&
    value.certificationKind === "qa-handoff-locked-archive-release-certification-receipt" &&
    value.certificationStatus === "certified" &&
    value.releaseReadinessStatus === "ready_for_release" &&
    value.verificationStatus === "verified" &&
    value.digestChainStatus === "confirmed" &&
    value.safeDigest?.startsWith("sha256:") &&
    value.certificationChecklist?.externalCallsZero === true &&
    value.digestMatrixSummary?.allRowsVerified === true &&
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
    value.safeDigest?.startsWith("sha256:") &&
    Array.isArray(value.ledgerRows) &&
    value.ledgerRows.every(safeClosureLedgerRowShape) &&
    value.ledgerSummary?.externalCallsZero === true &&
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
    value.safeDigest?.startsWith("sha256:") &&
    Array.isArray(value.attestationRows) &&
    value.attestationRows.every(safeAttestationAuditRowShape) &&
    value.attestationSummary?.externalCallsZero === true &&
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
    value.safeDigest?.startsWith("sha256:") &&
    value.reconciliationDigest === value.safeDigest &&
    Array.isArray(value.reconciliationRows) &&
    value.reconciliationRows.every(safeAttestationReconciliationRowShape) &&
    Array.isArray(value.exceptionRows) &&
    value.exceptionRows.every(safeAttestationReconciliationExceptionShape) &&
    value.reconciliationSummary?.externalCallsZero === true &&
    value.externalCalls === 0;
}

function safeCertifiedReleaseGateShape(value) {
  return value &&
    value.gateKind === "qa-handoff-locked-archive-certified-release-gate" &&
    ["ready", "blocked", "incomplete"].includes(value.gateStatus) &&
    ["go", "no_go"].includes(value.goNoGoDecision) &&
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
    value.reconciliationDigest?.startsWith("sha256:") &&
    value.attestationAuditDigest?.startsWith("sha256:") &&
    value.closureLedgerDigest?.startsWith("sha256:") &&
    value.certificationDigest?.startsWith("sha256:") &&
    value.verificationDigest?.startsWith("sha256:") &&
    value.releaseEvidenceDigest?.startsWith("sha256:") &&
    Array.isArray(value.blockingReasons) &&
    value.blockingReasons.every(safeBlockingReasonShape) &&
    Array.isArray(value.exceptionRows) &&
    value.exceptionRows.every(safeAttestationReconciliationExceptionShape) &&
    Number.isInteger(value.counts?.gateCheckedCount) &&
    value.externalCalls === 0;
}

function safeClosureLedgerRowShape(row) {
  return row &&
    typeof row.key === "string" &&
    typeof row.label === "string" &&
    row.safeDigest?.startsWith("sha256:") &&
    Number.isInteger(row.checkedCount) &&
    row.complete === true;
}

function safeAttestationAuditRowShape(row) {
  return row &&
    typeof row.key === "string" &&
    typeof row.label === "string" &&
    ["verified", "complete", "attested"].includes(row.attestationStatus) &&
    row.safeDigest?.startsWith("sha256:") &&
    Number.isInteger(row.checkedCount) &&
    row.complete === true;
}

function safeAttestationReconciliationRowShape(row) {
  return row &&
    typeof row.key === "string" &&
    typeof row.label === "string" &&
    ["aligned", "verified", "complete", "attested"].includes(row.reconciliationStatus) &&
    row.safeDigest?.startsWith("sha256:") &&
    Number.isInteger(row.checkedCount) &&
    row.aligned === true;
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

function safeDigestMatrixRowShape(row) {
  return row &&
    typeof row.key === "string" &&
    typeof row.label === "string" &&
    row.safeDigest?.startsWith("sha256:") &&
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
    console.error(`Sprint 88 smoke failed: ${failed.map((result) => result.name).join(", ")}`);
    process.exitCode = 1;
    return;
  }
  console.log("Sprint 88 smoke passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
