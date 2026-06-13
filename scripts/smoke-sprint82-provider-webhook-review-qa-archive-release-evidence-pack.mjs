import crypto from "node:crypto";
import { readFileSync } from "node:fs";

const baseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");
const tenantId = process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
const userId = process.env.USER_ID ?? "00000000-0000-4000-8000-000000000011";
const signingMaterial = process.env.PROVIDER_WEBHOOK_SANDBOX_SIGNING_KEY ?? "local-provider-webhook-sandbox-signing-material";
const runId = `sprint82-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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

  const sprint82Source = {
    shared: sourceSlice(shared, "providerWebhookReviewQaHandoffReleaseEvidenceSchema", "providerWebhookUnmatchedInboundBulkReviewRequestSchema"),
    providerController: sourceSlice(providerController, "review-qa-handoff-bundle/locked-archive/finalization/release-evidence", "review-closure-report/export"),
    providerService: [
      sourceSlice(providerService, "getReviewQaHandoffArchiveReleaseEvidence(", "private getLockedArchiveContext"),
      sourceSlice(providerService, "function qaHandoffArchiveReleaseEvidenceResponse", "function safeRoomLabel")
    ].join("\n"),
    apiClient: sourceSlice(apiClient, "getProviderWebhookReviewQaHandoffArchiveReleaseEvidence", "getProviderWebhookReviewClosureReportExport"),
    settingsData: sourceSlice(settingsData, "loadSettingsProviderWebhookReviewQaHandoffArchiveReleaseEvidenceData", "loadSettingsProviderWebhookReviewClosureReportRedactionAuditData"),
    settingsPage: sourceSlice(settingsPage, "loadReviewQaHandoffArchiveReleaseEvidence", "loadClosureReportRedactionAudit"),
    providerPanel: sourceSlice(providerPanel, "Load release evidence", "Audit report export redaction")
  };

  record("smoke:sprint82 registered",
    rootPackage.scripts?.["smoke:sprint82"] === "node scripts/smoke-sprint82-provider-webhook-review-qa-archive-release-evidence-pack.mjs"
  );
  record("Sprint 81/80/79/78/77/76/75 regression smoke scripts registered", [
    ["smoke:sprint81", "node scripts/smoke-sprint81-provider-webhook-review-qa-archive-finalization-signoff.mjs"],
    ["smoke:sprint80", "node scripts/smoke-sprint80-provider-webhook-review-qa-archive-integrity-retention-audit.mjs"],
    ["smoke:sprint79", "node scripts/smoke-sprint79-provider-webhook-review-qa-handoff-locked-archive-export.mjs"],
    ["smoke:sprint78", "node scripts/smoke-sprint78-provider-webhook-review-qa-handoff-acceptance-lock.mjs"],
    ["smoke:sprint77", "node scripts/smoke-sprint77-provider-webhook-review-qa-handoff-receipt-signoff.mjs"],
    ["smoke:sprint76", "node scripts/smoke-sprint76-provider-webhook-review-qa-handoff-bundle-export.mjs"],
    ["smoke:sprint75", "node scripts/smoke-sprint75-provider-webhook-review-qa-handoff-bundle.mjs"]
  ].every(([name, command]) => rootPackage.scripts?.[name] === command));
  record("shared release evidence DTO export",
    shared.includes("providerWebhookReviewQaHandoffReleaseEvidenceSchema") &&
    shared.includes("ProviderWebhookReviewQaHandoffReleaseEvidence") &&
    sprint82Source.shared.includes("externalCalls: z.literal(0)") &&
    sprint82Source.shared.includes("prerequisiteChecklist") &&
    sprint82Source.shared.includes("releaseReadinessStatus")
  );
  record("backend release evidence route registration",
    providerController.includes('@Get("review-qa-handoff-bundle/locked-archive/finalization/release-evidence")') &&
    providerController.includes("getReviewQaHandoffArchiveReleaseEvidence")
  );
  record("service release evidence implementation",
    providerService.includes("getReviewQaHandoffArchiveReleaseEvidence") &&
    providerService.includes("qaHandoffArchiveReleaseEvidenceResponse") &&
    providerService.includes("locked archive export is required before release evidence") &&
    providerService.includes("finalization sign-off is required before release evidence") &&
    providerService.includes("releaseReadinessStatus") &&
    providerService.includes("prerequisiteChecklist") &&
    providerService.includes("externalCalls: 0 as const")
  );
  record("API client release evidence wiring",
    apiClient.includes("getProviderWebhookReviewQaHandoffArchiveReleaseEvidence") &&
    apiClient.includes("providerWebhookReviewQaHandoffReleaseEvidenceSchema") &&
    apiClient.includes("/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence")
  );
  record("settings-data release evidence wiring",
    settingsData.includes("loadSettingsProviderWebhookReviewQaHandoffArchiveReleaseEvidenceData") &&
    settingsData.includes("getProviderWebhookReviewQaHandoffArchiveReleaseEvidence") &&
    settingsData.includes("createMockReviewQaHandoffArchiveReleaseEvidence")
  );
  record("provider readiness panel release evidence control/result/error text",
    settingsPage.includes("QA Archive Release Evidence API error") &&
    settingsPage.includes("onLoadReviewQaHandoffArchiveReleaseEvidence={loadReviewQaHandoffArchiveReleaseEvidence}") &&
    providerPanel.includes("Load release evidence") &&
    providerPanel.includes("QA archive release evidence:") &&
    providerPanel.includes("releaseReadinessStatus=") &&
    providerPanel.includes("prerequisites=")
  );
  record("no DATA_MODE=api mock/local fallback markers",
    /if \(mode === "api"\) \{\s*return \{\s*mode,\s*releaseEvidence: await getProviderWebhookReviewQaHandoffArchiveReleaseEvidence/s.test(settingsData) &&
    !/DATA_MODE=api[\s\S]{0,180}(mock|local|fallback)|(?:mock|local|fallback)[\s\S]{0,180}DATA_MODE=api/i.test(sprint82Source.settingsData)
  );
  record("static Sprint 82 source has no provider outbound send markers", !containsProviderOutbound(sprint82Source));
  record("static Sprint 82 source has no external notification send markers", !containsExternalNotification(sprint82Source));
  record("static Sprint 82 source has no AI/OpenAI call markers", !containsAiCall(sprint82Source));
  record("static Sprint 82 source has no raw provider material markers", safePayloadObject(sprint82Source));

  const health = await safeJson(await request("GET", "/health"));
  record("GET /health reachable", health?.status === "ok" && health?.service === "api");

  const evidenceItem = await createNoMatchItem("release-evidence", "Safe Sprint 82 release evidence target");
  record("create safe sandbox no-match item", evidenceItem?.unmatchedStatus === "review-needed");

  const filters = "provider=line&eventType=message.created";
  const releaseBeforeLock = await requestJson("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence?${filters}`);
  const receiptSignOff = await safeJson(await request("POST", `/provider-webhooks/review-qa-handoff-bundle/receipt/sign-off?${filters}`, {
    acknowledgementType: "sign_off",
    reviewerRole: "QA reviewer",
    reviewerLabel: "safe sprint82 reviewer"
  }));
  const lock = await safeJson(await request("POST", `/provider-webhooks/review-qa-handoff-bundle/acceptance-lock?${filters}`, {
    lockReason: "Safe Sprint 82 QA archive release evidence accepted",
    acceptedByRole: "QA lead",
    acceptedByLabel: "safe sprint82 reviewer"
  }));
  const releaseBeforeArchiveExport = await requestJson("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence?${filters}`);
  const archive = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive?${filters}`));
  const exportedArchive = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/export?${filters}`));
  const manifest = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/retention-manifest?${filters}`));
  const integrity = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/integrity?${filters}`));
  const retentionAudit = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/retention-audit?${filters}`));
  const finalization = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization?${filters}`));
  const receiptBeforeSignOff = await requestJson("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/receipt?${filters}`);
  const signOff = await safeJson(await request("POST", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/sign-off?${filters}`, {
    reviewerRole: "retention reviewer",
    reviewerLabel: "safe sprint82 reviewer"
  }));
  const receipt = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/receipt?${filters}`));
  const beforeReadPage = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound?provider=line&limit=25&offset=0&sortBy=receivedAt&sortOrder=desc"));
  const stateBeforeRead = unmatchedItems(beforeReadPage).find((item) => item.id === evidenceItem.id);
  const releaseEvidence = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence?${filters}`));
  const afterReadPage = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound?provider=line&limit=25&offset=0&sortBy=receivedAt&sortOrder=desc"));
  const stateAfterRead = unmatchedItems(afterReadPage).find((item) => item.id === evidenceItem.id);

  record("release evidence requires acceptance lock before prerequisites", releaseBeforeLock.status === 409 && /acceptance lock is required/i.test(JSON.stringify(releaseBeforeLock.body)));
  record("release evidence requires locked archive export", releaseBeforeArchiveExport.status === 409 && /locked archive export is required/i.test(JSON.stringify(releaseBeforeArchiveExport.body)));
  record("finalization receipt requires sign-off", receiptBeforeSignOff.status === 409 && /finalization sign-off is required/i.test(JSON.stringify(receiptBeforeSignOff.body)));
  record("receipt sign-off endpoint remains reachable", receiptSignOff?.signOffStatus === "signed_off" && receiptSignOff.externalCalls === 0);
  record("acceptance lock remains safe", lock?.lockStatus === "locked" && ["locked", "already_locked"].includes(lock.lockAction) && lock.externalCalls === 0);
  record("locked archive/export remains safe", safeLockedArchiveShape(archive) && safeLockedArchiveShape(exportedArchive) && exportedArchive.lockedArchiveStatus === "exported");
  record("retention manifest remains safe", safeRetentionManifestShape(manifest));
  record("archive integrity confirmed", safeArchiveIntegrityShape(integrity));
  record("retention audit confirmed/ready", safeRetentionAuditShape(retentionAudit));
  record("finalization/sign-off/receipt reachable", safeArchiveFinalizationShape(finalization) && safeFinalizationSignOffShape(signOff) && safeFinalizationReceiptShape(receipt));
  record("release evidence endpoint reachable", safeReleaseEvidenceShape(releaseEvidence));
  record("prerequisite checklist statuses present", allPrerequisitesPresent(releaseEvidence));
  record("safe filename present", [archive, exportedArchive, manifest, integrity, retentionAudit, finalization, signOff, receipt, releaseEvidence].every((item) => typeof item.safeFilename === "string" && item.safeFilename.startsWith("provider-webhook-review-qa-handoff")));
  record("safe digest present", [archive, exportedArchive, manifest, integrity, retentionAudit, finalization, signOff, receipt, releaseEvidence].every((item) => typeof item.safeDigest === "string" && item.safeDigest.startsWith("sha256:")));
  record("digest chain status present", [integrity, retentionAudit, finalization, signOff, receipt, releaseEvidence].every((item) => item.digestChainStatus === "confirmed"));
  record("release readiness status present", releaseEvidence.releaseReadinessStatus === "ready_for_release");
  record("deterministic release evidence counts present", Number.isInteger(releaseEvidence.counts?.releaseEvidenceCheckedCount) && releaseEvidence.counts?.prerequisitePassedCount === releaseEvidence.counts?.prerequisiteTotalCount);
  record("no mutation before/after release evidence reads", metadataOnlyStateMatches(stateBeforeRead, stateAfterRead));
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
    afterReadPage
  }));
  record("no provider outbound", !containsProviderOutbound({ receiptSignOff, lock, archive, exportedArchive, manifest, integrity, retentionAudit, finalization, signOff, receipt, releaseEvidence }));
  record("no external notification", !containsExternalNotification({ receiptSignOff, lock, archive, exportedArchive, manifest, integrity, retentionAudit, finalization, signOff, receipt, releaseEvidence }));
  record("no AI/OpenAI call evidence", !containsAiCall({ receiptSignOff, lock, archive, exportedArchive, manifest, integrity, retentionAudit, finalization, signOff, receipt, releaseEvidence }));
  record("no raw provider material leakage", safePayloadObject({
    releaseBeforeLock,
    releaseBeforeArchiveExport,
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
    afterReadPage
  }));

  finish();
}

async function createNoMatchItem(label, text) {
  const eventId = `${runId}-${label}-${Math.random().toString(16).slice(2)}`;
  const payload = linePayload(`safe-no-match-room-sprint82-${label}-${runId}`, `safe-sender-sprint82-${label}`, text);
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
  const found = [];
  walk(value, (key, child) => {
    if (key === "externalCalls" && child !== 0) found.push(child);
  });
  return found.length === 0;
}

function safePayloadObject(value) {
  return !/reply-token-must-not-return|message-id-must-not-return|providerRaw|payloadJson|"rawPayload"\s*:|"rawSignature"\s*:|"authorization"\s*:|"cookie"\s*:|"accessToken"\s*:|"webhookSecret"\s*:|"providerSecret"\s*:|raw sender|raw room|"senderId"\s*:|"roomId"\s*:|safe-no-match-room-sprint82|safe-sender-sprint82|sha256=.*|line\.push|telegram\.send|facebook\.send|instagram\.send|outbound\.sent|outbound\.queued|raw provider material|provider material|openai|ai\.call|notification\.sent/i.test(JSON.stringify(value));
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
  return /openai|ai\.call|chat_completion|responses\.create|embeddings/i.test(JSON.stringify(value));
}

function sourceSlice(source, start, end) {
  const startIndex = source.indexOf(start);
  if (startIndex < 0) return "";
  const endIndex = source.indexOf(end, startIndex + start.length);
  return source.slice(startIndex, endIndex < 0 ? undefined : endIndex);
}

function walk(value, visit, key = "") {
  visit(key, value);
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, visit, String(index)));
    return;
  }
  for (const [childKey, childValue] of Object.entries(value)) walk(childValue, visit, childKey);
}

function isLocalBaseUrl(value) {
  try {
    const url = new URL(value);
    return ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  } catch {
    return false;
  }
}

function record(name, pass) {
  results.push({ name, pass: Boolean(pass) });
  console.log(`${pass ? "PASS" : "FAIL"} ${name}`);
}

function finish() {
  const failed = results.filter((result) => !result.pass);
  console.log(`Sprint 82 smoke checks: ${results.length - failed.length}/${results.length} passed`);
  if (failed.length > 0) {
    console.error(`Failed checks: ${failed.map((result) => result.name).join(", ")}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
