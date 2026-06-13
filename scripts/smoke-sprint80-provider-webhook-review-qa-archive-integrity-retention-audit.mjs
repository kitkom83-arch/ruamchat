import crypto from "node:crypto";
import { readFileSync } from "node:fs";

const baseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");
const tenantId = process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
const userId = process.env.USER_ID ?? "00000000-0000-4000-8000-000000000011";
const signingMaterial = process.env.PROVIDER_WEBHOOK_SANDBOX_SIGNING_KEY ?? "local-provider-webhook-sandbox-signing-material";
const runId = `sprint80-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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

  record("smoke:sprint80 registered",
    rootPackage.scripts?.["smoke:sprint80"] === "node scripts/smoke-sprint80-provider-webhook-review-qa-archive-integrity-retention-audit.mjs"
  );
  record("Sprint 79/78/77/76/75/74/73/72/71 regression scripts registered", [
    ["smoke:sprint79", "node scripts/smoke-sprint79-provider-webhook-review-qa-handoff-locked-archive-export.mjs"],
    ["smoke:sprint78", "node scripts/smoke-sprint78-provider-webhook-review-qa-handoff-acceptance-lock.mjs"],
    ["smoke:sprint77", "node scripts/smoke-sprint77-provider-webhook-review-qa-handoff-receipt-signoff.mjs"],
    ["smoke:sprint76", "node scripts/smoke-sprint76-provider-webhook-review-qa-handoff-bundle-export.mjs"],
    ["smoke:sprint75", "node scripts/smoke-sprint75-provider-webhook-review-qa-handoff-bundle.mjs"],
    ["smoke:sprint74", "node scripts/smoke-sprint74-provider-webhook-review-export-manifest-handoff.mjs"],
    ["smoke:sprint73", "node scripts/smoke-sprint73-provider-webhook-review-export-redaction-audit.mjs"],
    ["smoke:sprint72", "node scripts/smoke-sprint72-provider-webhook-review-closure-evidence-export.mjs"],
    ["smoke:sprint71", "node scripts/smoke-sprint71-provider-webhook-review-closure-evidence-report.mjs"]
  ].every(([name, command]) => rootPackage.scripts?.[name] === command));
  record("shared archive integrity / retention audit DTO registration",
    shared.includes("providerWebhookReviewQaHandoffArchiveIntegritySchema") &&
    shared.includes("providerWebhookReviewQaHandoffRetentionAuditSchema") &&
    shared.includes("providerWebhookReviewQaHandoffDigestChainStatusSchema") &&
    shared.includes("providerWebhookReviewQaHandoffArchiveAuditAcknowledgementStatusSchema") &&
    shared.includes("externalCalls: z.literal(0)")
  );
  record("backend archive integrity route registration",
    providerController.includes("review-qa-handoff-bundle/locked-archive/integrity") &&
    providerController.includes("getReviewQaHandoffArchiveIntegrity") &&
    providerService.includes("getReviewQaHandoffArchiveIntegrity")
  );
  record("backend retention audit route registration",
    providerController.includes("review-qa-handoff-bundle/locked-archive/retention-audit") &&
    providerController.includes("getReviewQaHandoffRetentionAudit") &&
    providerService.includes("getReviewQaHandoffRetentionAudit")
  );
  record("service reuses Sprint 75-79 safe metadata",
    providerService.includes("getReviewQaHandoffBundleReceipt") &&
    providerService.includes("getReviewQaHandoffAcceptanceLock") &&
    providerService.includes("qaHandoffLockedArchiveStatusResponse") &&
    providerService.includes("getReviewQaHandoffRetentionManifest") &&
    providerService.includes("qaHandoffArchiveIntegrityResponse") &&
    providerService.includes("qaHandoffRetentionAuditResponse")
  );
  record("API client archive integrity / retention audit wiring",
    apiClient.includes("getProviderWebhookReviewQaHandoffArchiveIntegrity") &&
    apiClient.includes("getProviderWebhookReviewQaHandoffRetentionAudit") &&
    apiClient.includes("/provider-webhooks/review-qa-handoff-bundle/locked-archive/integrity") &&
    apiClient.includes("/provider-webhooks/review-qa-handoff-bundle/locked-archive/retention-audit")
  );
  record("settings-data archive integrity / retention audit wiring",
    settingsData.includes("loadSettingsProviderWebhookReviewQaHandoffArchiveIntegrityData") &&
    settingsData.includes("loadSettingsProviderWebhookReviewQaHandoffRetentionAuditData") &&
    settingsData.includes("getProviderWebhookReviewQaHandoffArchiveIntegrity") &&
    settingsData.includes("getProviderWebhookReviewQaHandoffRetentionAudit")
  );
  record("UI control/result/error text presence",
    settingsPage.includes("QA Archive Integrity API error") &&
    settingsPage.includes("QA Retention Audit API error") &&
    providerPanel.includes("Load archive integrity") &&
    providerPanel.includes("Load retention audit") &&
    providerPanel.includes("QA archive integrity:") &&
    providerPanel.includes("QA retention audit:")
  );
  record("API-mode no silent mock/local fallback markers",
    /if \(mode === "api"\) \{\s*return \{\s*mode,\s*integrity: await getProviderWebhookReviewQaHandoffArchiveIntegrity/s.test(settingsData) &&
    /if \(mode === "api"\) \{\s*return \{\s*mode,\s*retentionAudit: await getProviderWebhookReviewQaHandoffRetentionAudit/s.test(settingsData)
  );
  record("static source has no provider outbound send markers", !containsProviderOutbound({ providerController, providerService, apiClient, settingsData, providerPanel }));
  record("static source has no external notification send markers", !containsExternalNotification({ providerController, providerService, apiClient, settingsData, providerPanel }));
  record("static source has no AI/OpenAI call markers", !containsAiCall({ providerController, providerService, apiClient, settingsData, providerPanel }));

  const health = await safeJson(await request("GET", "/health"));
  record("GET /health reachable", health?.status === "ok" && health?.service === "api");

  const evidenceItem = await createNoMatchItem("archive-integrity", "Safe Sprint 80 archive integrity target");
  record("create safe sandbox no-match item", evidenceItem?.unmatchedStatus === "review-needed");

  const filters = "provider=line&eventType=message.created";
  const integrityBeforeLock = await requestJson("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/integrity?${filters}`);
  const retentionBeforeLock = await requestJson("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/retention-audit?${filters}`);
  const signOff = await safeJson(await request("POST", `/provider-webhooks/review-qa-handoff-bundle/receipt/sign-off?${filters}`, {
    acknowledgementType: "sign_off",
    reviewerRole: "QA reviewer",
    reviewerLabel: "safe sprint80 reviewer"
  }));
  const lock = await safeJson(await request("POST", `/provider-webhooks/review-qa-handoff-bundle/acceptance-lock?${filters}`, {
    lockReason: "Safe Sprint 80 QA archive integrity accepted",
    acceptedByRole: "QA lead",
    acceptedByLabel: "safe sprint80 reviewer"
  }));
  const beforePage = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound?provider=line&limit=25&offset=0&sortBy=receivedAt&sortOrder=desc"));
  const stateBefore = unmatchedItems(beforePage).find((item) => item.id === evidenceItem.id);
  const archive = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive?${filters}`));
  const exportedArchive = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/export?${filters}`));
  const manifest = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/retention-manifest?${filters}`));
  const integrity = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/integrity?${filters}`));
  const retentionAudit = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/retention-audit?${filters}`));
  const blockedAssignment = await requestJson("PATCH", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(evidenceItem.id)}/assignment`, {
    operation: "ASSIGN_TO_ME",
    note: "Safe assignment after Sprint 80 integrity read"
  });
  const afterPage = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound?provider=line&limit=25&offset=0&sortBy=receivedAt&sortOrder=desc"));
  const stateAfter = unmatchedItems(afterPage).find((item) => item.id === evidenceItem.id);

  record("archive integrity requires locked archive", integrityBeforeLock.status === 409 && /acceptance lock is required/i.test(JSON.stringify(integrityBeforeLock.body)));
  record("retention audit requires retention manifest", retentionBeforeLock.status === 409 && /acceptance lock is required/i.test(JSON.stringify(retentionBeforeLock.body)));
  record("sign-off endpoint remains reachable", safeSignOffShape(signOff));
  record("acceptance lock remains conflict guard for unsafe mutations", blockedAssignment.status === 409 && /acceptance lock is active/i.test(JSON.stringify(blockedAssignment.body)));
  record("locked archive export remains safe", safeLockedArchiveShape(exportedArchive) && exportedArchive.lockedArchiveStatus === "exported");
  record("retention manifest remains safe", safeRetentionManifestShape(manifest));
  record("archive integrity endpoint reachable", safeArchiveIntegrityShape(integrity));
  record("retention audit endpoint reachable", safeRetentionAuditShape(retentionAudit));
  record("safe filename present", [archive, exportedArchive, manifest, integrity, retentionAudit].every((item) => typeof item.safeFilename === "string" && item.safeFilename.startsWith("provider-webhook-review-qa-handoff")));
  record("safe digest present", [archive, exportedArchive, manifest, integrity, retentionAudit].every((item) => typeof item.safeDigest === "string" && item.safeDigest.startsWith("sha256:")));
  record("digest chain status present", integrity.digestChainStatus === "confirmed" && retentionAudit.digestChainStatus === "confirmed");
  record("deterministic status/counts fields", Number.isInteger(integrity.counts?.digestChainLinkCount) && Number.isInteger(retentionAudit.counts?.auditChecklistPassedCount));
  record("no mutation before/after archive integrity / retention audit reads", metadataOnlyStateMatches(stateBefore, stateAfter));
  record("externalCalls=0 throughout", noNonzeroExternalCalls({ health, signOff, lock, archive, exportedArchive, manifest, integrity, retentionAudit, afterPage }));
  record("no provider outbound", !containsProviderOutbound({ signOff, lock, archive, exportedArchive, manifest, integrity, retentionAudit, blockedAssignment }));
  record("no external notification", !containsExternalNotification({ signOff, lock, archive, exportedArchive, manifest, integrity, retentionAudit, blockedAssignment }));
  record("no AI/OpenAI call evidence", !containsAiCall({ signOff, lock, archive, exportedArchive, manifest, integrity, retentionAudit, blockedAssignment }));
  record("no raw payload/signature/token/replyToken/raw sender/raw room/provider material leakage", safePayloadObject({
    integrityBeforeLock,
    retentionBeforeLock,
    signOff,
    lock,
    archive,
    exportedArchive,
    manifest,
    integrity,
    retentionAudit,
    blockedAssignment,
    afterPage
  }));

  finish();
}

async function createNoMatchItem(label, text) {
  const eventId = `${runId}-${label}-${Math.random().toString(16).slice(2)}`;
  const payload = linePayload(`safe-no-match-room-sprint80-${label}-${runId}`, `safe-sender-sprint80-${label}`, text);
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

function safeSignOffShape(value) {
  return value &&
    value.signOffStatus === "signed_off" &&
    value.action === "sign_off" &&
    typeof value.signOffRecordId === "string" &&
    value.externalCalls === 0;
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
  return !/reply-token-must-not-return|message-id-must-not-return|providerRaw|payloadJson|"rawPayload"\s*:|"rawSignature"\s*:|"authorization"\s*:|"cookie"\s*:|"accessToken"\s*:|"webhookSecret"\s*:|"providerSecret"\s*:|raw sender|raw room|"senderId"\s*:|"roomId"\s*:|safe-no-match-room-sprint80|safe-sender-sprint80|sha256=.*|line\.push|telegram\.send|facebook\.send|instagram\.send|outbound\.sent|outbound\.queued|openai|ai\.call|notification\.sent/i.test(JSON.stringify(value));
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
  console.log(`Sprint 80 smoke checks: ${results.length - failed.length}/${results.length} passed`);
  if (failed.length > 0) {
    console.error(`Failed checks: ${failed.map((result) => result.name).join(", ")}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
