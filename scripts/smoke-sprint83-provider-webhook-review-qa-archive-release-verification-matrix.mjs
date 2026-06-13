import crypto from "node:crypto";
import { readFileSync } from "node:fs";

const baseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");
const tenantId = process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
const userId = process.env.USER_ID ?? "00000000-0000-4000-8000-000000000011";
const signingMaterial = process.env.PROVIDER_WEBHOOK_SANDBOX_SIGNING_KEY ?? "local-provider-webhook-sandbox-signing-material";
const runId = `sprint83-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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

  const sprint83Source = {
    shared: sourceSlice(shared, "providerWebhookReviewQaHandoffReleaseVerificationSchema", "providerWebhookUnmatchedInboundBulkReviewRequestSchema"),
    providerController: sourceSlice(providerController, "review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification", "review-closure-report/export"),
    providerService: [
      sourceSlice(providerService, "getReviewQaHandoffArchiveReleaseVerification(", "private getLockedArchiveContext"),
      sourceSlice(providerService, "function qaHandoffArchiveReleaseVerificationResponse", "function safeRoomLabel")
    ].join("\n"),
    apiClient: sourceSlice(apiClient, "getProviderWebhookReviewQaHandoffArchiveReleaseVerification", "getProviderWebhookReviewClosureReportExport"),
    settingsData: sourceSlice(settingsData, "loadSettingsProviderWebhookReviewQaHandoffArchiveReleaseVerificationData", "loadSettingsProviderWebhookReviewClosureReportRedactionAuditData"),
    settingsPage: sourceSlice(settingsPage, "loadReviewQaHandoffArchiveReleaseVerification", "loadClosureReportRedactionAudit"),
    providerPanel: sourceSlice(providerPanel, "Verify release evidence", "Audit report export redaction")
  };

  record("smoke:sprint83 registered",
    rootPackage.scripts?.["smoke:sprint83"] === "node scripts/smoke-sprint83-provider-webhook-review-qa-archive-release-verification-matrix.mjs"
  );
  record("Sprint 82/81/80/79/78/77/76/75 regression smoke scripts registered", [
    ["smoke:sprint82", "node scripts/smoke-sprint82-provider-webhook-review-qa-archive-release-evidence-pack.mjs"],
    ["smoke:sprint81", "node scripts/smoke-sprint81-provider-webhook-review-qa-archive-finalization-signoff.mjs"],
    ["smoke:sprint80", "node scripts/smoke-sprint80-provider-webhook-review-qa-archive-integrity-retention-audit.mjs"],
    ["smoke:sprint79", "node scripts/smoke-sprint79-provider-webhook-review-qa-handoff-locked-archive-export.mjs"],
    ["smoke:sprint78", "node scripts/smoke-sprint78-provider-webhook-review-qa-handoff-acceptance-lock.mjs"],
    ["smoke:sprint77", "node scripts/smoke-sprint77-provider-webhook-review-qa-handoff-receipt-signoff.mjs"],
    ["smoke:sprint76", "node scripts/smoke-sprint76-provider-webhook-review-qa-handoff-bundle-export.mjs"],
    ["smoke:sprint75", "node scripts/smoke-sprint75-provider-webhook-review-qa-handoff-bundle.mjs"]
  ].every(([name, command]) => rootPackage.scripts?.[name] === command));
  record("shared release verification DTO export",
    shared.includes("providerWebhookReviewQaHandoffReleaseVerificationSchema") &&
    shared.includes("ProviderWebhookReviewQaHandoffReleaseVerification") &&
    sprint83Source.shared.includes("externalCalls: z.literal(0)") &&
    sprint83Source.shared.includes("verificationStatus") &&
    sprint83Source.shared.includes("digestMatrixRows") &&
    sprint83Source.shared.includes("releaseEvidenceDigest")
  );
  record("backend release verification route registration",
    providerController.includes('@Get("review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification")') &&
    providerController.includes("getReviewQaHandoffArchiveReleaseVerification")
  );
  record("service release verification implementation",
    providerService.includes("getReviewQaHandoffArchiveReleaseVerification") &&
    providerService.includes("qaHandoffArchiveReleaseVerificationResponse") &&
    providerService.includes("releaseEvidence.releaseReadinessStatus !== \"ready_for_release\"") &&
    providerService.includes("digestMatrixRows") &&
    providerService.includes("releaseEvidenceDigest") &&
    providerService.includes("externalCalls: 0 as const")
  );
  record("API client release verification wiring",
    apiClient.includes("getProviderWebhookReviewQaHandoffArchiveReleaseVerification") &&
    apiClient.includes("providerWebhookReviewQaHandoffReleaseVerificationSchema") &&
    apiClient.includes("/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification")
  );
  record("settings-data release verification wiring",
    settingsData.includes("loadSettingsProviderWebhookReviewQaHandoffArchiveReleaseVerificationData") &&
    settingsData.includes("getProviderWebhookReviewQaHandoffArchiveReleaseVerification") &&
    settingsData.includes("createMockReviewQaHandoffArchiveReleaseVerification")
  );
  record("provider readiness panel release verification control/result/error text",
    settingsPage.includes("QA Archive Release Verification API error") &&
    settingsPage.includes("onLoadReviewQaHandoffArchiveReleaseVerification={loadReviewQaHandoffArchiveReleaseVerification}") &&
    providerPanel.includes("Verify release evidence") &&
    providerPanel.includes("QA archive release verification:") &&
    providerPanel.includes("verificationStatus=") &&
    providerPanel.includes("digestRows=")
  );
  record("no DATA_MODE=api mock/local fallback markers",
    /if \(mode === "api"\) \{\s*return \{\s*mode,\s*verification: await getProviderWebhookReviewQaHandoffArchiveReleaseVerification/s.test(settingsData) &&
    !/DATA_MODE=api[\s\S]{0,180}(mock|local|fallback)|(?:mock|local|fallback)[\s\S]{0,180}DATA_MODE=api/i.test(sprint83Source.settingsData)
  );
  record("static Sprint 83 source has no provider outbound send markers", !containsProviderOutbound(sprint83Source));
  record("static Sprint 83 source has no external notification send markers", !containsExternalNotification(sprint83Source));
  record("static Sprint 83 source has no AI/OpenAI call markers", !containsAiCall(sprint83Source));
  record("static Sprint 83 source has no raw provider material markers", safePayloadObject(sprint83Source));

  const health = await safeJson(await request("GET", "/health"));
  record("GET /health reachable", health?.status === "ok" && health?.service === "api");

  const verificationItem = await createNoMatchItem("release-verification", "Safe Sprint 83 release verification target");
  record("create safe sandbox no-match item", verificationItem?.unmatchedStatus === "review-needed");

  const filters = "provider=line&eventType=message.created";
  const verificationBeforeLock = await requestJson("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification?${filters}`);
  const receiptSignOff = await safeJson(await request("POST", `/provider-webhooks/review-qa-handoff-bundle/receipt/sign-off?${filters}`, {
    acknowledgementType: "sign_off",
    reviewerRole: "QA reviewer",
    reviewerLabel: "safe sprint83 reviewer"
  }));
  const lock = await safeJson(await request("POST", `/provider-webhooks/review-qa-handoff-bundle/acceptance-lock?${filters}`, {
    lockReason: "Safe Sprint 83 QA archive release verification accepted",
    acceptedByRole: "QA lead",
    acceptedByLabel: "safe sprint83 reviewer"
  }));
  const verificationBeforeArchiveExport = await requestJson("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification?${filters}`);
  const archive = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive?${filters}`));
  const exportedArchive = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/export?${filters}`));
  const manifest = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/retention-manifest?${filters}`));
  const integrity = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/integrity?${filters}`));
  const retentionAudit = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/retention-audit?${filters}`));
  const finalization = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization?${filters}`));
  const receiptBeforeSignOff = await requestJson("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/receipt?${filters}`);
  const signOff = await safeJson(await request("POST", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/sign-off?${filters}`, {
    reviewerRole: "retention reviewer",
    reviewerLabel: "safe sprint83 reviewer"
  }));
  const receipt = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/receipt?${filters}`));
  const releaseEvidence = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence?${filters}`));
  const beforeReadPage = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound?provider=line&limit=25&offset=0&sortBy=receivedAt&sortOrder=desc"));
  const stateBeforeRead = unmatchedItems(beforeReadPage).find((item) => item.id === verificationItem.id);
  const releaseVerification = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification?${filters}`));
  const afterReadPage = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound?provider=line&limit=25&offset=0&sortBy=receivedAt&sortOrder=desc"));
  const stateAfterRead = unmatchedItems(afterReadPage).find((item) => item.id === verificationItem.id);

  record("release verification requires acceptance lock before prerequisites", verificationBeforeLock.status === 409 && /acceptance lock is required/i.test(JSON.stringify(verificationBeforeLock.body)));
  record("release verification requires locked archive export", verificationBeforeArchiveExport.status === 409 && /locked archive export is required/i.test(JSON.stringify(verificationBeforeArchiveExport.body)));
  record("finalization receipt requires sign-off", receiptBeforeSignOff.status === 409 && /finalization sign-off is required/i.test(JSON.stringify(receiptBeforeSignOff.body)));
  record("receipt sign-off endpoint remains reachable", receiptSignOff?.signOffStatus === "signed_off" && receiptSignOff.externalCalls === 0);
  record("acceptance lock remains safe", lock?.lockStatus === "locked" && ["locked", "already_locked"].includes(lock.lockAction) && lock.externalCalls === 0);
  record("locked archive/export remains safe", safeLockedArchiveShape(archive) && safeLockedArchiveShape(exportedArchive) && exportedArchive.lockedArchiveStatus === "exported");
  record("retention manifest remains safe", safeRetentionManifestShape(manifest));
  record("archive integrity confirmed", safeArchiveIntegrityShape(integrity));
  record("retention audit confirmed/ready", safeRetentionAuditShape(retentionAudit));
  record("finalization/sign-off/receipt reachable", safeArchiveFinalizationShape(finalization) && safeFinalizationSignOffShape(signOff) && safeFinalizationReceiptShape(receipt));
  record("release evidence ready before verification", safeReleaseEvidenceShape(releaseEvidence));
  record("complete prerequisite chain through release evidence", [receiptSignOff, lock, exportedArchive, manifest, integrity, retentionAudit, finalization, signOff, receipt, releaseEvidence].every(Boolean));
  record("release verification endpoint reachable", safeReleaseVerificationShape(releaseVerification));
  record("digest matrix present", Array.isArray(releaseVerification.digestMatrixRows) && releaseVerification.digestMatrixRows.length >= 10);
  record("verification status present", releaseVerification.verificationStatus === "verified");
  record("release readiness status present", releaseVerification.releaseReadinessStatus === "ready_for_release");
  record("digest chain status present", releaseVerification.digestChainStatus === "confirmed");
  record("prerequisite checklist statuses present", allPrerequisitesPresent(releaseVerification));
  record("safe filename present", typeof releaseVerification.safeFilename === "string" && releaseVerification.safeFilename.includes("release-verification-matrix"));
  record("safe digest present", typeof releaseVerification.safeDigest === "string" && releaseVerification.safeDigest.startsWith("sha256:"));
  record("release evidence digest present", releaseVerification.releaseEvidenceDigest === releaseEvidence.safeDigest);
  record("deterministic counts present", Number.isInteger(releaseVerification.counts?.releaseVerificationCheckedCount) && releaseVerification.counts?.digestMatrixRowCount === releaseVerification.digestMatrixRows?.length);
  record("externalCalls=0", releaseVerification.externalCalls === 0);
  record("no mutation before/after verification reads", metadataOnlyStateMatches(stateBeforeRead, stateAfterRead));
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
    afterReadPage
  }));
  record("no provider outbound", !containsProviderOutbound({ receiptSignOff, lock, archive, exportedArchive, manifest, integrity, retentionAudit, finalization, signOff, receipt, releaseEvidence, releaseVerification }));
  record("no external notification", !containsExternalNotification({ receiptSignOff, lock, archive, exportedArchive, manifest, integrity, retentionAudit, finalization, signOff, receipt, releaseEvidence, releaseVerification }));
  record("no AI/OpenAI call evidence", !containsAiCall({ receiptSignOff, lock, archive, exportedArchive, manifest, integrity, retentionAudit, finalization, signOff, receipt, releaseEvidence, releaseVerification }));
  record("no raw provider material leakage", safePayloadObject({
    verificationBeforeLock,
    verificationBeforeArchiveExport,
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
    afterReadPage
  }));

  finish();
}

async function createNoMatchItem(label, text) {
  const eventId = `${runId}-${label}-${Math.random().toString(16).slice(2)}`;
  const payload = linePayload(`safe-no-match-room-sprint83-${label}-${runId}`, `safe-sender-sprint83-${label}`, text);
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

function allPrerequisitesPresent(value) {
  const checklist = value?.prerequisiteChecklist ?? {};
  return [
    "qaHandoffBundleReady",
    "qaHandoffExportReady",
    "receiptSignedOff",
    "acceptanceLocked",
    "lockedArchiveReady",
    "lockedArchiveExported",
    "retentionManifestReady",
    "archiveIntegrityConfirmed",
    "retentionAuditConfirmed",
    "finalizationSignedOff",
    "finalizationReceiptReady",
    "digestChainConfirmed",
    "safeFilenamePresent",
    "safeDigestPresent",
    "providerOutboundAbsent",
    "externalCallsZero"
  ].every((key) => checklist[key] === true);
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
    console.error(`Sprint 83 smoke failed: ${failed.map((result) => result.name).join(", ")}`);
    process.exitCode = 1;
    return;
  }
  console.log("Sprint 83 smoke passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
