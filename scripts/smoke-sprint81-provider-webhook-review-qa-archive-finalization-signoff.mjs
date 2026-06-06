import crypto from "node:crypto";
import { readFileSync } from "node:fs";

const baseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");
const tenantId = process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
const userId = process.env.USER_ID ?? "00000000-0000-4000-8000-000000000011";
const signingMaterial = process.env.PROVIDER_WEBHOOK_SANDBOX_SIGNING_KEY ?? "local-provider-webhook-sandbox-signing-material";
const runId = `sprint81-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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

  const sprint81Source = {
    shared: sourceSlice(shared, "providerWebhookReviewQaHandoffArchiveFinalizationStatusSchema", "providerWebhookUnmatchedInboundBulkReviewRequestSchema"),
    providerController: sourceSlice(providerController, "review-qa-handoff-bundle/locked-archive/finalization", "review-closure-report/export"),
    providerService: [
      sourceSlice(providerService, "getReviewQaHandoffArchiveFinalization(", "private getLockedArchiveContext"),
      sourceSlice(providerService, "function assertQaHandoffArchiveFinalizationReady", "function safeRoomLabel")
    ].join("\n"),
    apiClient: sourceSlice(apiClient, "getProviderWebhookReviewQaHandoffArchiveFinalization", "getProviderWebhookReviewClosureReportExport"),
    settingsData: sourceSlice(settingsData, "loadSettingsProviderWebhookReviewQaHandoffArchiveFinalizationData", "loadSettingsProviderWebhookReviewClosureReportRedactionAuditData"),
    settingsPage: sourceSlice(settingsPage, "loadReviewQaHandoffArchiveFinalization", "loadClosureReportRedactionAudit"),
    providerPanel: sourceSlice(providerPanel, "Load archive finalization", "reviewQaHandoffLockedArchive ?")
  };

  record("smoke:sprint81 registered",
    rootPackage.scripts?.["smoke:sprint81"] === "node scripts/smoke-sprint81-provider-webhook-review-qa-archive-finalization-signoff.mjs"
  );
  record("Sprint 80/79/78/77/76/75/74/73/72/71/54/53/52 regression scripts registered", [
    ["smoke:sprint80", "node scripts/smoke-sprint80-provider-webhook-review-qa-archive-integrity-retention-audit.mjs"],
    ["smoke:sprint79", "node scripts/smoke-sprint79-provider-webhook-review-qa-handoff-locked-archive-export.mjs"],
    ["smoke:sprint78", "node scripts/smoke-sprint78-provider-webhook-review-qa-handoff-acceptance-lock.mjs"],
    ["smoke:sprint77", "node scripts/smoke-sprint77-provider-webhook-review-qa-handoff-receipt-signoff.mjs"],
    ["smoke:sprint76", "node scripts/smoke-sprint76-provider-webhook-review-qa-handoff-bundle-export.mjs"],
    ["smoke:sprint75", "node scripts/smoke-sprint75-provider-webhook-review-qa-handoff-bundle.mjs"],
    ["smoke:sprint74", "node scripts/smoke-sprint74-provider-webhook-review-export-manifest-handoff.mjs"],
    ["smoke:sprint73", "node scripts/smoke-sprint73-provider-webhook-review-export-redaction-audit.mjs"],
    ["smoke:sprint72", "node scripts/smoke-sprint72-provider-webhook-review-closure-evidence-export.mjs"],
    ["smoke:sprint71", "node scripts/smoke-sprint71-provider-webhook-review-closure-evidence-report.mjs"],
    ["smoke:sprint54", "node scripts/smoke-sprint54-provider-ui-readiness.mjs"],
    ["smoke:sprint53", "node scripts/smoke-sprint53-provider-readiness.mjs"],
    ["smoke:sprint52", "node scripts/smoke-sprint52-production-readiness.mjs"]
  ].every(([name, command]) => rootPackage.scripts?.[name] === command));
  record("shared finalization / retention sign-off / receipt DTO exports",
    shared.includes("providerWebhookReviewQaHandoffArchiveFinalizationSchema") &&
    shared.includes("providerWebhookReviewQaHandoffFinalizationSignOffRequestSchema") &&
    shared.includes("providerWebhookReviewQaHandoffFinalizationSignOffResponseSchema") &&
    shared.includes("providerWebhookReviewQaHandoffFinalizationReceiptSchema") &&
    shared.includes("providerWebhookReviewQaHandoffRetentionSignOffStatusSchema") &&
    sprint81Source.shared.includes("externalCalls: z.literal(0)")
  );
  record("backend finalization route registration",
    providerController.includes('@Get("review-qa-handoff-bundle/locked-archive/finalization")') &&
    providerController.includes("getReviewQaHandoffArchiveFinalization") &&
    providerService.includes("getReviewQaHandoffArchiveFinalization")
  );
  record("backend finalization sign-off route registration",
    providerController.includes('@Post("review-qa-handoff-bundle/locked-archive/finalization/sign-off")') &&
    providerController.includes("signOffReviewQaHandoffArchiveFinalization") &&
    providerService.includes("signOffReviewQaHandoffArchiveFinalization")
  );
  record("backend finalization receipt route registration",
    providerController.includes('@Get("review-qa-handoff-bundle/locked-archive/finalization/receipt")') &&
    providerController.includes("getReviewQaHandoffArchiveFinalizationReceipt") &&
    providerService.includes("getReviewQaHandoffArchiveFinalizationReceipt")
  );
  record("service requires archive integrity confirmed",
    providerService.includes("assertQaHandoffArchiveFinalizationReady") &&
    providerService.includes('integrity.integrityStatus !== "confirmed"') &&
    providerService.includes("requires confirmed archive integrity")
  );
  record("service requires retention audit ready/confirmed",
    providerService.includes('retentionAudit.retentionAuditStatus !== "confirmed"') &&
    providerService.includes("requires ready retention audit")
  );
  record("finalization sign-off requires finalization readiness",
    /signOffReviewQaHandoffArchiveFinalization[\s\S]*assertQaHandoffArchiveFinalizationReady/.test(providerService)
  );
  record("API client finalization / sign-off / receipt wiring",
    apiClient.includes("getProviderWebhookReviewQaHandoffArchiveFinalization") &&
    apiClient.includes("signOffProviderWebhookReviewQaHandoffArchiveFinalization") &&
    apiClient.includes("getProviderWebhookReviewQaHandoffArchiveFinalizationReceipt") &&
    apiClient.includes("/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization") &&
    apiClient.includes("/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/sign-off") &&
    apiClient.includes("/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/receipt")
  );
  record("settings-data finalization / sign-off / receipt wiring",
    settingsData.includes("loadSettingsProviderWebhookReviewQaHandoffArchiveFinalizationData") &&
    settingsData.includes("signOffSettingsProviderWebhookReviewQaHandoffArchiveFinalization") &&
    settingsData.includes("loadSettingsProviderWebhookReviewQaHandoffArchiveFinalizationReceiptData") &&
    settingsData.includes("getProviderWebhookReviewQaHandoffArchiveFinalization") &&
    settingsData.includes("signOffProviderWebhookReviewQaHandoffArchiveFinalization") &&
    settingsData.includes("getProviderWebhookReviewQaHandoffArchiveFinalizationReceipt")
  );
  record("provider readiness panel finalization / sign-off / receipt controls/results/errors",
    settingsPage.includes("QA Archive Finalization API error") &&
    settingsPage.includes("QA Retention Sign-off API error") &&
    settingsPage.includes("QA Archive Finalization Receipt API error") &&
    settingsPage.includes("onLoadReviewQaHandoffArchiveFinalization={loadReviewQaHandoffArchiveFinalization}") &&
    settingsPage.includes("onSignOffReviewQaHandoffArchiveFinalization={signOffReviewQaHandoffArchiveFinalization}") &&
    settingsPage.includes("onLoadReviewQaHandoffArchiveFinalizationReceipt={loadReviewQaHandoffArchiveFinalizationReceipt}") &&
    providerPanel.includes("Load archive finalization") &&
    providerPanel.includes("Sign off retention finalization") &&
    providerPanel.includes("Load finalization receipt") &&
    providerPanel.includes("QA archive finalization:") &&
    providerPanel.includes("QA retention sign-off:") &&
    providerPanel.includes("QA finalization receipt:")
  );
  record("no DATA_MODE=api mock/local fallback markers",
    /if \(mode === "api"\) \{\s*return \{\s*mode,\s*finalization: await getProviderWebhookReviewQaHandoffArchiveFinalization/s.test(settingsData) &&
    /if \(mode === "api"\) \{\s*return \{\s*mode,\s*signOff: await signOffProviderWebhookReviewQaHandoffArchiveFinalization/s.test(settingsData) &&
    /if \(mode === "api"\) \{\s*return \{\s*mode,\s*receipt: await getProviderWebhookReviewQaHandoffArchiveFinalizationReceipt/s.test(settingsData) &&
    !/DATA_MODE=api[\s\S]{0,160}(mock|local|fallback)|(?:mock|local|fallback)[\s\S]{0,160}DATA_MODE=api/i.test(settingsData)
  );
  record("static Sprint 81 source has no provider outbound send markers", !containsProviderOutbound(sprint81Source));
  record("static Sprint 81 source has no external notification send markers", !containsExternalNotification(sprint81Source));
  record("static Sprint 81 source has no AI/OpenAI call markers", !containsAiCall(sprint81Source));
  record("static Sprint 81 source has no raw provider material markers", safePayloadObject(sprint81Source));

  const health = await safeJson(await request("GET", "/health"));
  record("GET /health reachable", health?.status === "ok" && health?.service === "api");

  const evidenceItem = await createNoMatchItem("archive-finalization", "Safe Sprint 81 archive finalization target");
  record("create safe sandbox no-match item", evidenceItem?.unmatchedStatus === "review-needed");

  const filters = "provider=line&eventType=message.created";
  const finalizationBeforeLock = await requestJson("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization?${filters}`);
  const signOffBeforeLock = await requestJson("POST", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/sign-off?${filters}`, {
    reviewerRole: "retention reviewer",
    reviewerLabel: "safe sprint81 reviewer"
  });
  const receiptBeforeSignOff = await requestJson("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/receipt?${filters}`);

  const receiptSignOff = await safeJson(await request("POST", `/provider-webhooks/review-qa-handoff-bundle/receipt/sign-off?${filters}`, {
    acknowledgementType: "sign_off",
    reviewerRole: "QA reviewer",
    reviewerLabel: "safe sprint81 reviewer"
  }));
  const lock = await safeJson(await request("POST", `/provider-webhooks/review-qa-handoff-bundle/acceptance-lock?${filters}`, {
    lockReason: "Safe Sprint 81 QA archive finalization accepted",
    acceptedByRole: "QA lead",
    acceptedByLabel: "safe sprint81 reviewer"
  }));
  const archive = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive?${filters}`));
  const exportedArchive = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/export?${filters}`));
  const manifest = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/retention-manifest?${filters}`));
  const integrity = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/integrity?${filters}`));
  const retentionAudit = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/retention-audit?${filters}`));
  const beforeReadPage = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound?provider=line&limit=25&offset=0&sortBy=receivedAt&sortOrder=desc"));
  const stateBeforeRead = unmatchedItems(beforeReadPage).find((item) => item.id === evidenceItem.id);
  const finalization = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization?${filters}`));
  const afterReadPage = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound?provider=line&limit=25&offset=0&sortBy=receivedAt&sortOrder=desc"));
  const stateAfterRead = unmatchedItems(afterReadPage).find((item) => item.id === evidenceItem.id);
  const signOff = await safeJson(await request("POST", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/sign-off?${filters}`, {
    reviewerRole: "retention reviewer",
    reviewerLabel: "safe sprint81 reviewer"
  }));
  const receipt = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/receipt?${filters}`));
  const afterSignOffPage = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound?provider=line&limit=25&offset=0&sortBy=receivedAt&sortOrder=desc"));
  const stateAfterSignOff = unmatchedItems(afterSignOffPage).find((item) => item.id === evidenceItem.id);

  record("finalization requires confirmed integrity before lock", finalizationBeforeLock.status === 409 && /acceptance lock is required|confirmed archive integrity/i.test(JSON.stringify(finalizationBeforeLock.body)));
  record("finalization sign-off requires finalization readiness", signOffBeforeLock.status === 409 && /acceptance lock is required|archive finalization/i.test(JSON.stringify(signOffBeforeLock.body)));
  record("finalization receipt requires sign-off", receiptBeforeSignOff.status === 409 && /acceptance lock is required|sign-off is required/i.test(JSON.stringify(receiptBeforeSignOff.body)));
  record("receipt sign-off endpoint remains reachable", receiptSignOff?.signOffStatus === "signed_off" && receiptSignOff.externalCalls === 0);
  record("acceptance lock remains safe for finalization", lock?.lockStatus === "locked" && ["locked", "already_locked"].includes(lock.lockAction) && lock.externalCalls === 0);
  record("locked archive export remains safe", safeLockedArchiveShape(exportedArchive) && exportedArchive.lockedArchiveStatus === "exported");
  record("retention manifest remains safe", safeRetentionManifestShape(manifest));
  record("archive integrity remains confirmed", safeArchiveIntegrityShape(integrity));
  record("retention audit remains safe and confirmed", safeRetentionAuditShape(retentionAudit));
  record("finalization endpoint reachable", safeArchiveFinalizationShape(finalization) && finalization.finalizationStatus === "ready");
  record("retention sign-off endpoint reachable", safeFinalizationSignOffShape(signOff));
  record("finalization receipt endpoint reachable", safeFinalizationReceiptShape(receipt));
  record("safe filename present", [archive, exportedArchive, manifest, integrity, retentionAudit, finalization, signOff, receipt].every((item) => typeof item.safeFilename === "string" && item.safeFilename.startsWith("provider-webhook-review-qa-handoff")));
  record("safe digest present", [archive, exportedArchive, manifest, integrity, retentionAudit, finalization, signOff, receipt].every((item) => typeof item.safeDigest === "string" && item.safeDigest.startsWith("sha256:")));
  record("digest chain status present", [integrity, retentionAudit, finalization, signOff, receipt].every((item) => item.digestChainStatus === "confirmed"));
  record("finalization status present", [finalization, signOff, receipt].every((item) => typeof item.finalizationStatus === "string"));
  record("retention sign-off status present", [finalization, signOff, receipt].every((item) => typeof item.retentionSignOffStatus === "string"));
  record("deterministic status/counts fields", Number.isInteger(finalization.counts?.finalizationCheckedCount) && Number.isInteger(signOff.counts?.retentionSignOffCount) && Number.isInteger(receipt.counts?.digestChainLinkCount));
  record("no mutation before/after finalization reads", metadataOnlyStateMatches(stateBeforeRead, stateAfterRead));
  record("finalization sign-off mutation only safe finalization/sign-off/audit state", metadataOnlyStateMatches(stateAfterRead, stateAfterSignOff) && signOff.action === "sign_off" && signOff.signOffRecordId?.startsWith("provider-webhook-qa-handoff-archive-finalization-signoff-"));
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
    afterSignOffPage
  }));
  record("no provider outbound", !containsProviderOutbound({ receiptSignOff, lock, archive, exportedArchive, manifest, integrity, retentionAudit, finalization, signOff, receipt }));
  record("no external notification", !containsExternalNotification({ receiptSignOff, lock, archive, exportedArchive, manifest, integrity, retentionAudit, finalization, signOff, receipt }));
  record("no AI/OpenAI call evidence", !containsAiCall({ receiptSignOff, lock, archive, exportedArchive, manifest, integrity, retentionAudit, finalization, signOff, receipt }));
  record("no raw payload/signature/token/replyToken/raw sender/raw room/provider material leakage", safePayloadObject({
    finalizationBeforeLock,
    signOffBeforeLock,
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
    afterSignOffPage
  }));

  finish();
}

async function createNoMatchItem(label, text) {
  const eventId = `${runId}-${label}-${Math.random().toString(16).slice(2)}`;
  const payload = linePayload(`safe-no-match-room-sprint81-${label}-${runId}`, `safe-sender-sprint81-${label}`, text);
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
  return !/reply-token-must-not-return|message-id-must-not-return|providerRaw|payloadJson|"rawPayload"\s*:|"rawSignature"\s*:|"authorization"\s*:|"cookie"\s*:|"accessToken"\s*:|"webhookSecret"\s*:|"providerSecret"\s*:|raw sender|raw room|"senderId"\s*:|"roomId"\s*:|safe-no-match-room-sprint81|safe-sender-sprint81|sha256=.*|line\.push|telegram\.send|facebook\.send|instagram\.send|outbound\.sent|outbound\.queued|raw provider material|provider material|openai|ai\.call|notification\.sent/i.test(JSON.stringify(value));
}

function containsProviderOutbound(value) {
  return /line\.push|telegram\.send|facebook\.send|instagram\.send|outbound\.sent|outbound\.queued|reply api|push api|send api/i.test(JSON.stringify(value));
}

function containsExternalNotification(value) {
  return /notification\.sent|email\.sent|sms\.sent|webhook\.notify|slack/i.test(JSON.stringify(value));
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
  console.log(`Sprint 81 smoke checks: ${results.length - failed.length}/${results.length} passed`);
  if (failed.length > 0) {
    console.error(`Failed checks: ${failed.map((result) => result.name).join(", ")}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
