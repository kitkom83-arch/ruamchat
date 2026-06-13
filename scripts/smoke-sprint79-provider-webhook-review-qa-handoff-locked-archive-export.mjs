import crypto from "node:crypto";
import { readFileSync } from "node:fs";

const baseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");
const tenantId = process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
const userId = process.env.USER_ID ?? "00000000-0000-4000-8000-000000000011";
const signingMaterial = process.env.PROVIDER_WEBHOOK_SANDBOX_SIGNING_KEY ?? "local-provider-webhook-sandbox-signing-material";
const runId = `sprint79-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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

  record("smoke:sprint79 registered",
    rootPackage.scripts?.["smoke:sprint79"] === "node scripts/smoke-sprint79-provider-webhook-review-qa-handoff-locked-archive-export.mjs"
  );
  record("Sprint 78 regression script registered",
    rootPackage.scripts?.["smoke:sprint78"] === "node scripts/smoke-sprint78-provider-webhook-review-qa-handoff-acceptance-lock.mjs"
  );
  record("shared locked archive DTOs registered",
    shared.includes("providerWebhookReviewQaHandoffLockedArchiveStatusSchema") &&
    shared.includes("providerWebhookReviewQaHandoffLockedArchiveExportSchema") &&
    shared.includes("providerWebhookReviewQaHandoffRetentionManifestSchema") &&
    shared.includes("retentionManifestStatus") &&
    shared.includes("externalCalls: z.literal(0)")
  );
  record("backend locked archive routes registered",
    providerController.includes("review-qa-handoff-bundle/locked-archive") &&
    providerController.includes("review-qa-handoff-bundle/locked-archive/export") &&
    providerController.includes("review-qa-handoff-bundle/locked-archive/retention-manifest") &&
    providerService.includes("getReviewQaHandoffLockedArchive") &&
    providerService.includes("exportReviewQaHandoffLockedArchive") &&
    providerService.includes("getReviewQaHandoffRetentionManifest")
  );
  record("readiness exposes locked archive counters",
    shared.includes("reviewQaHandoffLockedArchiveEnabled") &&
    shared.includes("reviewQaHandoffRetentionManifestEnabled") &&
    providerService.includes("lockedArchiveReadyCount") &&
    providerService.includes("lockedArchiveExportedCount") &&
    providerPanel.includes("locked archive ready count")
  );
  record("web locked archive wiring registered",
    apiClient.includes("getProviderWebhookReviewQaHandoffLockedArchive") &&
    apiClient.includes("exportProviderWebhookReviewQaHandoffLockedArchive") &&
    apiClient.includes("getProviderWebhookReviewQaHandoffRetentionManifest") &&
    settingsData.includes("loadSettingsProviderWebhookReviewQaHandoffLockedArchiveData") &&
    settingsData.includes("exportSettingsProviderWebhookReviewQaHandoffLockedArchiveData") &&
    settingsData.includes("loadSettingsProviderWebhookReviewQaHandoffRetentionManifestData") &&
    settingsPage.includes("loadReviewQaHandoffLockedArchive") &&
    settingsPage.includes("exportReviewQaHandoffLockedArchive") &&
    settingsPage.includes("loadReviewQaHandoffRetentionManifest") &&
    providerPanel.includes("Load locked archive") &&
    providerPanel.includes("Export locked archive") &&
    providerPanel.includes("Load retention manifest")
  );
  record("static source has no provider outbound send markers", !containsProviderOutbound({ providerController, providerService, apiClient, settingsData, providerPanel }));
  record("static source has no external notification send markers", !containsExternalNotification({ providerController, providerService, apiClient, settingsData, providerPanel }));
  record("static source has no AI/OpenAI call markers", !containsAiCall({ providerController, providerService, apiClient, settingsData, providerPanel }));

  const health = await safeJson(await request("GET", "/health"));
  record("GET /health reachable", health?.status === "ok" && health?.service === "api");

  const evidenceItem = await createNoMatchItem("locked-archive", "Safe Sprint 79 locked archive export target");
  record("create safe sandbox no-match item", evidenceItem?.unmatchedStatus === "review-needed");

  const filters = "provider=line&eventType=message.created";
  const archiveBeforeLock = await requestJson("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive?${filters}`);
  const signOff = await safeJson(await request("POST", `/provider-webhooks/review-qa-handoff-bundle/receipt/sign-off?${filters}`, {
    acknowledgementType: "sign_off",
    reviewerRole: "QA reviewer",
    reviewerLabel: "safe sprint79 reviewer"
  }));
  const lock = await safeJson(await request("POST", `/provider-webhooks/review-qa-handoff-bundle/acceptance-lock?${filters}`, {
    lockReason: "Safe Sprint 79 QA handoff locked archive export",
    acceptedByRole: "QA lead",
    acceptedByLabel: "safe sprint79 reviewer"
  }));
  const archive = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive?${filters}`));
  const exportedArchive = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/export?${filters}`));
  const archiveReadback = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive?${filters}`));
  const manifest = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/retention-manifest?${filters}`));
  const readiness = await safeJson(await request("GET", "/health/readiness"));

  record("locked archive requires acceptance lock when unlocked", archiveBeforeLock.status === 409 || archiveBeforeLock.body?.lockStatus === "locked");
  record("sign-off endpoint remains reachable", safeSignOffShape(signOff));
  record("acceptance lock ready for archive", safeAcceptanceLockShape(lock) && lock.lockStatus === "locked" && ["locked", "already_locked"].includes(lock.lockAction));
  record("locked archive read is safe and ready", safeLockedArchiveShape(archive) && ["ready", "exported"].includes(archive.lockedArchiveStatus));
  record("locked archive export acknowledges export", safeLockedArchiveShape(exportedArchive) && exportedArchive.lockedArchiveStatus === "exported" && exportedArchive.archiveAcknowledgementStatus === "exported" && exportedArchive.exportKind === "qa-handoff-locked-archive");
  record("locked archive readback remains exported", safeLockedArchiveShape(archiveReadback) && archiveReadback.lockedArchiveStatus === "exported" && archiveReadback.safeDigest === exportedArchive.safeDigest);
  record("retention manifest is safe and tied to archive", safeRetentionManifestShape(manifest) && manifest.archiveDigest === archiveReadback.safeDigest && manifest.retentionReadiness === "ready");
  record("archive counts preserve locked scope", exportedArchive.counts.lockedItemCount >= 1 && exportedArchive.counts.lockedOpenItemCount >= 0 && exportedArchive.counts.totalItems >= 0);
  record("readiness counts include archive and retention manifest", readiness.providerReadiness?.reviewQaHandoffLockedArchiveEnabled === true &&
    readiness.providerReadiness?.reviewQaHandoffRetentionManifestEnabled === true &&
    readiness.providerReadiness?.lockedArchiveReadyCount >= 1 &&
    readiness.providerReadiness?.lockedArchiveExportedCount >= 1 &&
    readiness.providerReadiness?.retentionManifestReadyCount >= 1 &&
    readiness.providerReadiness?.latestLockedArchiveStatus === "exported" &&
    readiness.providerReadiness?.latestRetentionManifestStatus === "ready");
  record("externalCalls=0 throughout", noNonzeroExternalCalls({ health, signOff, lock, archive, exportedArchive, archiveReadback, manifest, readiness }));
  record("no provider outbound", !containsProviderOutbound({ signOff, lock, archive, exportedArchive, archiveReadback, manifest, readiness }));
  record("no external notification", !containsExternalNotification({ signOff, lock, archive, exportedArchive, archiveReadback, manifest, readiness }));
  record("no AI/OpenAI call evidence", !containsAiCall({ signOff, lock, archive, exportedArchive, archiveReadback, manifest, readiness }));
  record("no raw payload/signature/token/replyToken/raw sender/raw room/provider material leakage", safePayloadObject({
    archiveBeforeLock,
    signOff,
    lock,
    archive,
    exportedArchive,
    archiveReadback,
    manifest,
    readiness
  }));

  finish();
}

async function createNoMatchItem(label, text) {
  const eventId = `${runId}-${label}-${Math.random().toString(16).slice(2)}`;
  const payload = linePayload(`safe-no-match-room-sprint79-${label}-${runId}`, `safe-sender-sprint79-${label}`, text);
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

function safeAcceptanceLockShape(value) {
  return value &&
    value.lockStatus === "locked" &&
    ["locked", "already_locked"].includes(value.lockAction) &&
    typeof value.safeDigest === "string" &&
    value.safeDigest.startsWith("sha256:") &&
    typeof value.lockRecordId === "string" &&
    Number.isInteger(value.lockedItemCount) &&
    Number.isInteger(value.lockedOpenItemCount) &&
    value.acceptanceChecks?.externalCallsZero === true &&
    value.externalCalls === 0;
}

function safeLockedArchiveShape(value) {
  return value &&
    ["ready", "exported"].includes(value.lockedArchiveStatus) &&
    value.retentionManifestStatus === "ready" &&
    ["not_exported", "exported"].includes(value.archiveAcknowledgementStatus) &&
    value.acceptanceStatus === "locked" &&
    value.lockStatus === "locked" &&
    typeof value.safeFilename === "string" &&
    value.safeFilename.includes("provider-webhook-review-qa-handoff-locked-archive") &&
    typeof value.safeDigest === "string" &&
    value.safeDigest.startsWith("sha256:") &&
    typeof value.acceptanceLockDigest === "string" &&
    Number.isInteger(value.counts?.lockedItemCount) &&
    value.manualQaChecks?.providerOutboundAbsent === true &&
    value.manualQaChecks?.externalCallsZero === true &&
    value.externalCalls === 0;
}

function safeRetentionManifestShape(value) {
  return value &&
    value.manifestKind === "qa-handoff-locked-archive-retention-manifest" &&
    value.retentionManifestStatus === "ready" &&
    value.lockStatus === "locked" &&
    value.retentionReadiness === "ready" &&
    typeof value.safeFilename === "string" &&
    value.safeFilename.includes("retention-manifest") &&
    typeof value.safeDigest === "string" &&
    value.safeDigest.startsWith("sha256:") &&
    typeof value.archiveDigest === "string" &&
    value.manualQaChecks?.providerOutboundAbsent === true &&
    value.manualQaChecks?.externalCallsZero === true &&
    value.externalCalls === 0;
}

function noNonzeroExternalCalls(value) {
  const found = [];
  walk(value, (key, child) => {
    if (key === "externalCalls" && child !== 0) found.push(child);
  });
  return found.length === 0;
}

function safePayloadObject(value) {
  return !/reply-token-must-not-return|message-id-must-not-return|providerRaw|payloadJson|"rawPayload"\s*:|"rawSignature"\s*:|"authorization"\s*:|"cookie"\s*:|"accessToken"\s*:|"webhookSecret"\s*:|"providerSecret"\s*:|raw sender|raw room|"senderId"\s*:|"roomId"\s*:|safe-no-match-room-sprint79|safe-sender-sprint79|sha256=.*|line\.push|telegram\.send|facebook\.send|instagram\.send|outbound\.sent|outbound\.queued|openai|ai\.call|notification\.sent/i.test(JSON.stringify(value));
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
  console.log(`Sprint 79 smoke checks: ${results.length - failed.length}/${results.length} passed`);
  if (failed.length > 0) {
    console.error(`Failed checks: ${failed.map((result) => result.name).join(", ")}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
