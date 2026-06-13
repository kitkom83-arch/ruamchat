import crypto from "node:crypto";
import { readFileSync } from "node:fs";

const baseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");
const tenantId = process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
const userId = process.env.USER_ID ?? "00000000-0000-4000-8000-000000000011";
const signingMaterial = process.env.PROVIDER_WEBHOOK_SANDBOX_SIGNING_KEY ?? "local-provider-webhook-sandbox-signing-material";
const runId = `sprint77-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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

  record("smoke:sprint77 registered",
    rootPackage.scripts?.["smoke:sprint77"] === "node scripts/smoke-sprint77-provider-webhook-review-qa-handoff-receipt-signoff.mjs"
  );
  record("Sprint 76/75/74/73/72/71 regression scripts registered", [
    ["smoke:sprint76", "node scripts/smoke-sprint76-provider-webhook-review-qa-handoff-bundle-export.mjs"],
    ["smoke:sprint75", "node scripts/smoke-sprint75-provider-webhook-review-qa-handoff-bundle.mjs"],
    ["smoke:sprint74", "node scripts/smoke-sprint74-provider-webhook-review-export-manifest-handoff.mjs"],
    ["smoke:sprint73", "node scripts/smoke-sprint73-provider-webhook-review-export-redaction-audit.mjs"],
    ["smoke:sprint72", "node scripts/smoke-sprint72-provider-webhook-review-closure-evidence-export.mjs"],
    ["smoke:sprint71", "node scripts/smoke-sprint71-provider-webhook-review-closure-evidence-report.mjs"]
  ].every(([name, command]) => rootPackage.scripts?.[name] === command));
  record("shared receipt/sign-off DTOs registered",
    shared.includes("providerWebhookReviewQaHandoffReceiptSchema") &&
    shared.includes("providerWebhookReviewQaHandoffSignOffRequestSchema") &&
    shared.includes("providerWebhookReviewQaHandoffSignOffResponseSchema") &&
    shared.includes("externalCalls: z.literal(0)")
  );
  record("backend receipt and sign-off routes registered",
    providerController.includes('review-qa-handoff-bundle/receipt') &&
    providerController.includes('review-qa-handoff-bundle/receipt/sign-off') &&
    providerController.includes("getReviewQaHandoffBundleReceipt") &&
    providerController.includes("signOffReviewQaHandoffBundleReceipt")
  );
  record("service reuses Sprint 75/76 safe metadata",
    providerService.includes("this.getReviewQaHandoffBundleExport(tenantId, filters, actorUserId)") &&
    providerService.includes("bundleDigest: exportResult.bundle.safeDigest") &&
    providerService.includes("exportDigest: exportResult.safeDigest") &&
    providerService.includes("qaHandoffReceiptSignOffs.unshift(signOffEntry)")
  );
  record("API client receipt/sign-off wiring registered",
    apiClient.includes("getProviderWebhookReviewQaHandoffBundleReceipt") &&
    apiClient.includes("signOffProviderWebhookReviewQaHandoffBundleReceipt") &&
    apiClient.includes("/provider-webhooks/review-qa-handoff-bundle/receipt") &&
    apiClient.includes("/provider-webhooks/review-qa-handoff-bundle/receipt/sign-off")
  );
  record("settings-data receipt/sign-off wiring has API mode and distinguishable mock",
    settingsData.includes("loadSettingsProviderWebhookReviewQaHandoffReceiptData") &&
    settingsData.includes("signOffSettingsProviderWebhookReviewQaHandoffReceipt") &&
    settingsData.includes('if (mode === "api")') &&
    settingsData.includes("provider-webhook-review-qa-handoff-receipt.json") &&
    settingsData.includes("sha256:mockqahandoffreceipt")
  );
  record("UI control/result/error text present",
    providerPanel.includes("Load QA handoff receipt") &&
    providerPanel.includes("Sign off QA handoff") &&
    providerPanel.includes("QA handoff receipt:") &&
    providerPanel.includes("QA handoff sign-off:") &&
    settingsPage.includes("QA Handoff Receipt API error") &&
    settingsPage.includes("QA Handoff Sign-off API error") &&
    settingsPage.includes("setReviewQaHandoffReceipt(null)") &&
    settingsPage.includes("setReviewQaHandoffSignOff(null)")
  );
  record("API-mode receipt/sign-off has no silent mock/local fallback markers",
    settingsData.indexOf("getProviderWebhookReviewQaHandoffBundleReceipt") < settingsData.indexOf("createMockReviewQaHandoffReceipt") &&
    settingsData.indexOf("signOffProviderWebhookReviewQaHandoffBundleReceipt") < settingsData.indexOf("createMockReviewQaHandoffSignOff")
  );
  record("static source has no provider outbound send markers", !containsProviderOutbound({ providerController, providerService, apiClient, settingsData, providerPanel }));
  record("static source has no external notification send markers", !containsExternalNotification({ providerController, providerService, apiClient, settingsData, providerPanel }));
  record("static source has no AI/OpenAI call markers", !containsAiCall({ providerController, providerService, apiClient, settingsData, providerPanel }));

  const health = await safeJson(await request("GET", "/health"));
  record("GET /health reachable", health?.status === "ok" && health?.service === "api");

  const evidenceItem = await createNoMatchItem("receipt", "Safe Sprint 77 QA handoff receipt target");
  record("create safe sandbox no-match item", evidenceItem?.unmatchedStatus === "review-needed");

  const filters = "provider=line&eventType=message.created";
  const beforeReadPage = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound?provider=line&limit=25&offset=0&sortBy=receivedAt&sortOrder=desc"));
  const stateBeforeRead = unmatchedItems(beforeReadPage).find((item) => item.id === evidenceItem.id);

  const bundle = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle?${filters}`));
  const exportResult = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/export?${filters}`));
  const receipt = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/receipt?${filters}`));
  const afterReceiptReadPage = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound?provider=line&limit=25&offset=0&sortBy=receivedAt&sortOrder=desc"));
  const stateAfterRead = unmatchedItems(afterReceiptReadPage).find((item) => item.id === evidenceItem.id);
  const signOff = await safeJson(await request("POST", `/provider-webhooks/review-qa-handoff-bundle/receipt/sign-off?${filters}`, {
    acknowledgementType: "sign_off",
    reviewerRole: "QA reviewer",
    reviewerLabel: "safe reviewer"
  }));
  const signedReceipt = await safeJson(await request("GET", `/provider-webhooks/review-qa-handoff-bundle/receipt?${filters}`));

  record("QA handoff bundle/export endpoints reachable", safeQaHandoffBundleShape(bundle) && safeQaHandoffBundleExportShape(exportResult));
  record("receipt endpoint reachable", safeReceiptShape(receipt));
  record("sign-off endpoint reachable", safeSignOffShape(signOff));
  record("safe filename present", receipt.safeFilename === "provider-webhook-review-qa-handoff-bundle-export.json" && signOff.safeFilename === receipt.safeFilename);
  record("safe digest present", receipt.safeDigest.startsWith("sha256:") && receipt.bundleDigest === bundle.safeDigest && receipt.exportDigest === exportResult.safeDigest);
  record("deterministic status/counts fields", ["ready", "needs_review", "blocked"].includes(receipt.bundleStatus) && Number.isInteger(receipt.counts.totalItems));
  record("receipt/sign-off status present", receipt.receiptStatus === "not_acknowledged" && signOff.signOffStatus === "signed_off" && signedReceipt.receiptStatus === "signed_off");
  record("externalCalls=0", noNonzeroExternalCalls({ health, bundle, exportResult, receipt, signOff, signedReceipt }));
  record("receipt read does not mutate review/link/message state", metadataOnlyStateMatches(stateBeforeRead, stateAfterRead));
  record("sign-off mutation only touches safe receipt/sign-off state",
    signOff.signOffRecordId.startsWith("provider-webhook-qa-handoff-signoff-") &&
    signOff.reviewerLabel === "safe reviewer" &&
    signedReceipt.signedAt === signOff.signedAt
  );
  record("no provider outbound", !containsProviderOutbound({ bundle, exportResult, receipt, signOff, signedReceipt }));
  record("no external notification", !containsExternalNotification({ bundle, exportResult, receipt, signOff, signedReceipt }));
  record("no AI/OpenAI call evidence", !containsAiCall({ bundle, exportResult, receipt, signOff, signedReceipt }));
  record("no raw payload/signature/token/replyToken/raw sender/raw room/provider material leakage", safePayloadObject({
    beforeReadPage,
    afterReceiptReadPage,
    bundle,
    exportResult,
    receipt,
    signOff,
    signedReceipt
  }));

  finish();
}

async function createNoMatchItem(label, text) {
  const eventId = `${runId}-${label}-${Math.random().toString(16).slice(2)}`;
  const payload = linePayload(`safe-no-match-room-sprint77-${label}-${runId}`, `safe-sender-sprint77-${label}`, text);
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

function safeQaHandoffBundleShape(value) {
  return value?.bundleKind === "provider-webhook-review-qa-handoff-bundle" &&
    value.safeFilename === "provider-webhook-review-qa-handoff-bundle.json" &&
    typeof value.safeDigest === "string" &&
    value.safeDigest.startsWith("sha256:") &&
    value.externalCalls === 0;
}

function safeQaHandoffBundleExportShape(value) {
  return value?.exportKind === "qa-handoff-bundle" &&
    value.safeFilename === "provider-webhook-review-qa-handoff-bundle-export.json" &&
    typeof value.safeDigest === "string" &&
    value.safeDigest.startsWith("sha256:") &&
    value.externalCalls === 0;
}

function safeReceiptShape(value) {
  return value &&
    ["not_acknowledged", "acknowledged", "signed_off"].includes(value.receiptStatus) &&
    ["ready", "needs_review", "blocked"].includes(value.bundleStatus) &&
    ["ready", "needs_review", "blocked"].includes(value.exportStatus) &&
    typeof value.safeFilename === "string" &&
    typeof value.safeDigest === "string" &&
    value.safeDigest.startsWith("sha256:") &&
    typeof value.bundleDigest === "string" &&
    typeof value.exportDigest === "string" &&
    value.readinessFlags?.reviewExportQaHandoffEnabled === true &&
    Number.isInteger(value.counts?.totalItems) &&
    value.manualQaChecks?.externalCallsZero === true &&
    value.externalCalls === 0;
}

function safeSignOffShape(value) {
  return safeReceiptShape(value) &&
    value.signOffStatus === "signed_off" &&
    value.action === "sign_off" &&
    typeof value.signOffRecordId === "string" &&
    value.signedAt &&
    value.externalCalls === 0;
}

function metadataOnlyStateMatches(before, after) {
  return before && after &&
    before.reviewStatus === after.reviewStatus &&
    before.linkStatus === after.linkStatus &&
    before.unmatchedStatus === after.unmatchedStatus &&
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
  return !/reply-token-must-not-return|message-id-must-not-return|providerRaw|payloadJson|"rawPayload"\s*:|"rawSignature"\s*:|"authorization"\s*:|"cookie"\s*:|"accessToken"\s*:|"webhookSecret"\s*:|"providerSecret"\s*:|raw sender|raw room|"senderId"\s*:|"roomId"\s*:|safe-no-match-room-sprint77|safe-sender-sprint77|sha256=.*|line\.push|telegram\.send|facebook\.send|instagram\.send|outbound\.sent|outbound\.queued|openai|ai\.call|notification\.sent/i.test(JSON.stringify(value));
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
  console.log(`Sprint 77 smoke checks: ${results.length - failed.length}/${results.length} passed`);
  if (failed.length > 0) {
    console.error(`Failed checks: ${failed.map((result) => result.name).join(", ")}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
