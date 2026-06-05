import crypto from "node:crypto";
import { readFileSync } from "node:fs";

const baseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");
const tenantId = process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
const userId = process.env.USER_ID ?? "00000000-0000-4000-8000-000000000011";
const signingMaterial = process.env.PROVIDER_WEBHOOK_SANDBOX_SIGNING_KEY ?? "local-provider-webhook-sandbox-signing-material";
const runId = `sprint78-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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

  record("smoke:sprint78 registered",
    rootPackage.scripts?.["smoke:sprint78"] === "node scripts/smoke-sprint78-provider-webhook-review-qa-handoff-acceptance-lock.mjs"
  );
  record("Sprint 77/76/75 regression scripts registered", [
    ["smoke:sprint77", "node scripts/smoke-sprint77-provider-webhook-review-qa-handoff-receipt-signoff.mjs"],
    ["smoke:sprint76", "node scripts/smoke-sprint76-provider-webhook-review-qa-handoff-bundle-export.mjs"],
    ["smoke:sprint75", "node scripts/smoke-sprint75-provider-webhook-review-qa-handoff-bundle.mjs"]
  ].every(([name, command]) => rootPackage.scripts?.[name] === command));
  record("shared acceptance lock DTOs registered",
    shared.includes("providerWebhookReviewQaHandoffAcceptanceLockRequestSchema") &&
    shared.includes("providerWebhookReviewQaHandoffAcceptanceLockSchema") &&
    shared.includes('lockStatus: z.enum(["unlocked", "locked"])') &&
    shared.includes("acceptanceChecks") &&
    shared.includes("externalCalls: z.literal(0)")
  );
  record("backend acceptance lock routes registered",
    providerController.includes("review-qa-handoff-bundle/acceptance-lock") &&
    providerController.includes("getReviewQaHandoffAcceptanceLock") &&
    providerController.includes("lockReviewQaHandoffAcceptance")
  );
  record("service stores lock and guards mutation paths",
    providerService.includes("qaHandoffAcceptanceLocks") &&
    providerService.includes("latestAcceptanceLockRecord") &&
    providerService.includes("assertQaHandoffAcceptanceUnlocked") &&
    providerService.includes("acceptance lock is active") &&
    providerService.includes("must be signed off before acceptance lock") &&
    providerService.includes("qaHandoffAcceptanceLocks.splice(0)")
  );
  record("API client acceptance lock wiring registered",
    apiClient.includes("getProviderWebhookReviewQaHandoffAcceptanceLock") &&
    apiClient.includes("lockProviderWebhookReviewQaHandoffAcceptance") &&
    apiClient.includes("/provider-webhooks/review-qa-handoff-bundle/acceptance-lock") &&
    apiClient.includes("providerWebhookReviewQaHandoffAcceptanceLockSchema")
  );
  record("settings acceptance lock UI wiring registered",
    settingsData.includes("loadSettingsProviderWebhookReviewQaHandoffAcceptanceLockData") &&
    settingsData.includes("lockSettingsProviderWebhookReviewQaHandoffAcceptance") &&
    settingsData.includes("createMockReviewQaHandoffAcceptanceLock") &&
    settingsPage.includes("loadReviewQaHandoffAcceptanceLock") &&
    settingsPage.includes("lockReviewQaHandoffAcceptance") &&
    providerPanel.includes("Load acceptance lock") &&
    providerPanel.includes("Lock QA acceptance") &&
    providerPanel.includes("QA handoff acceptance lock:")
  );
  record("static source has no provider outbound send markers", !containsProviderOutbound({ providerController, providerService, apiClient, settingsData, providerPanel }));
  record("static source has no external notification send markers", !containsExternalNotification({ providerController, providerService, apiClient, settingsData, providerPanel }));
  record("static source has no AI/OpenAI call markers", !containsAiCall({ providerController, providerService, apiClient, settingsData, providerPanel }));

  const health = await safeJson(await request("GET", "/health"));
  record("GET /health reachable", health?.status === "ok" && health?.service === "api");

  const evidenceItem = await createNoMatchItem("acceptance-lock", "Safe Sprint 78 QA handoff acceptance lock target");
  record("create safe sandbox no-match item", evidenceItem?.unmatchedStatus === "review-needed");

  const filters = "provider=line&eventType=message.created";
  const beforePage = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound?provider=line&limit=25&offset=0&sortBy=receivedAt&sortOrder=desc"));
  const stateBefore = unmatchedItems(beforePage).find((item) => item.id === evidenceItem.id);
  const lockBefore = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/acceptance-lock?${filters}`));
  const prematureLock = await requestJson("POST", `/provider-webhooks/review-qa-handoff-bundle/acceptance-lock?${filters}`, {
    lockReason: "Safe premature lock attempt"
  });
  const signOff = await safeJson(await request("POST", `/provider-webhooks/review-qa-handoff-bundle/receipt/sign-off?${filters}`, {
    acknowledgementType: "sign_off",
    reviewerRole: "QA reviewer",
    reviewerLabel: "safe sprint78 reviewer"
  }));
  const lock = await safeJson(await request("POST", `/provider-webhooks/review-qa-handoff-bundle/acceptance-lock?${filters}`, {
    lockReason: "Safe Sprint 78 QA handoff accepted",
    acceptedByRole: "QA lead",
    acceptedByLabel: "safe sprint78 reviewer"
  }));
  const lockReadback = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/acceptance-lock?${filters}`));
  const blockedAssignment = await requestJson("PATCH", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(evidenceItem.id)}/assignment`, {
    operation: "ASSIGN_TO_ME",
    note: "Safe assignment after acceptance lock"
  });
  const blockedBulkAssignment = await safeJson(await request("PATCH", "/provider-webhooks/unmatched-inbound/bulk-assignment", {
    ids: [evidenceItem.id],
    operation: "ASSIGN_TO_ME",
    note: "Safe bulk assignment after acceptance lock"
  }));
  const afterPage = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound?provider=line&limit=25&offset=0&sortBy=receivedAt&sortOrder=desc"));
  const stateAfter = unmatchedItems(afterPage).find((item) => item.id === evidenceItem.id);

  record("acceptance lock read starts unlocked", safeAcceptanceLockShape(lockBefore) && lockBefore.lockStatus === "unlocked" && lockBefore.receiptStatus !== "signed_off");
  record("acceptance lock requires signed receipt", prematureLock.status === 409 && /signed off before acceptance lock/i.test(JSON.stringify(prematureLock.body)));
  record("sign-off endpoint remains reachable", safeSignOffShape(signOff));
  record("acceptance lock endpoint locks signed handoff", safeAcceptanceLockShape(lock) && lock.lockStatus === "locked" && lock.lockAction === "locked" && lock.receiptStatus === "signed_off");
  record("acceptance lock readback is stable", lockReadback.lockStatus === "locked" && lockReadback.lockAction === "already_locked" && lockReadback.lockRecordId === lock.lockRecordId);
  record("acceptance lock captures safe item scope", lock.lockedUnmatchedInboundIds.includes(evidenceItem.id) && lock.lockedItemCount >= 1 && lock.acceptanceChecks.lockedItemScopePresent === true);
  record("acceptance lock checks safe guardrails", lock.acceptanceChecks.receiptSignedOff === true && lock.acceptanceChecks.providerOutboundAbsent === true && lock.acceptanceChecks.externalCallsZero === true);
  record("single mutation blocked by acceptance lock", blockedAssignment.status === 409 && /acceptance lock is active/i.test(JSON.stringify(blockedAssignment.body)));
  record("bulk mutation reports conflict", blockedBulkAssignment.results?.[0]?.resultStatus === "conflict" && /acceptance lock is active/i.test(blockedBulkAssignment.results[0].error ?? ""));
  record("locked scope state remains unchanged", metadataOnlyStateMatches(stateBefore, stateAfter));
  record("externalCalls=0 throughout", noNonzeroExternalCalls({ health, lockBefore, signOff, lock, lockReadback, blockedBulkAssignment, afterPage }));
  record("no provider outbound", !containsProviderOutbound({ lockBefore, signOff, lock, lockReadback, blockedAssignment, blockedBulkAssignment }));
  record("no external notification", !containsExternalNotification({ lockBefore, signOff, lock, lockReadback, blockedAssignment, blockedBulkAssignment }));
  record("no AI/OpenAI call evidence", !containsAiCall({ lockBefore, signOff, lock, lockReadback, blockedAssignment, blockedBulkAssignment }));
  record("no raw payload/signature/token/replyToken/raw sender/raw room/provider material leakage", safePayloadObject({
    beforePage,
    lockBefore,
    prematureLock,
    signOff,
    lock,
    lockReadback,
    blockedAssignment,
    blockedBulkAssignment,
    afterPage
  }));

  finish();
}

async function createNoMatchItem(label, text) {
  const eventId = `${runId}-${label}-${Math.random().toString(16).slice(2)}`;
  const payload = linePayload(`safe-no-match-room-sprint78-${label}-${runId}`, `safe-sender-sprint78-${label}`, text);
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

function safeAcceptanceLockShape(value) {
  return value &&
    ["unlocked", "locked"].includes(value.lockStatus) &&
    ["none", "locked", "already_locked"].includes(value.lockAction) &&
    value.safeFilename === "provider-webhook-review-qa-handoff-acceptance-lock.json" &&
    typeof value.safeDigest === "string" &&
    value.safeDigest.startsWith("sha256:") &&
    typeof value.bundleDigest === "string" &&
    typeof value.exportDigest === "string" &&
    Array.isArray(value.lockedUnmatchedInboundIds) &&
    Number.isInteger(value.lockedItemCount) &&
    Number.isInteger(value.lockedOpenItemCount) &&
    value.acceptanceChecks?.externalCallsZero === true &&
    value.externalCalls === 0;
}

function safeSignOffShape(value) {
  return value &&
    value.signOffStatus === "signed_off" &&
    value.action === "sign_off" &&
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
  return !/reply-token-must-not-return|message-id-must-not-return|providerRaw|payloadJson|"rawPayload"\s*:|"rawSignature"\s*:|"authorization"\s*:|"cookie"\s*:|"accessToken"\s*:|"webhookSecret"\s*:|"providerSecret"\s*:|raw sender|raw room|"senderId"\s*:|"roomId"\s*:|safe-no-match-room-sprint78|safe-sender-sprint78|sha256=.*|line\.push|telegram\.send|facebook\.send|instagram\.send|outbound\.sent|outbound\.queued|openai|ai\.call|notification\.sent/i.test(JSON.stringify(value));
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
  console.log(`Sprint 78 smoke checks: ${results.length - failed.length}/${results.length} passed`);
  if (failed.length > 0) {
    console.error(`Failed checks: ${failed.map((result) => result.name).join(", ")}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
