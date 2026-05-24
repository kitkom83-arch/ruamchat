import { pathToFileURL } from "node:url";

const baseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");
const tenantId = process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
const userId = process.env.USER_ID ?? "00000000-0000-4000-8000-000000000011";
const results = [];

async function main() {
  record("local API only", isLocalBaseUrl(baseUrl), baseUrl);

  const health = await request("GET", "/health");
  record("GET /health", health.status === 200);

  const rooms = await requestJson("GET", "/rooms");
  record("GET /rooms", Array.isArray(rooms));

  const selected = await findConversation(rooms);
  record("safe persisted room/conversation selected", Boolean(selected?.room?.id && selected?.conversation?.id), selected?.conversation?.id ?? "");
  if (!selected) return finish();

  const { room, conversation } = selected;
  record("conversation preserves platform/account/room", conversation.platform === room.platform && conversation.channelAccountId === room.channelAccountId && conversation.roomId === room.id);

  const customer360 = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/customer-360`);
  record("Customer 360 loads from API", customer360?.selectedConversationId === conversation.id && customer360?.contact?.id);
  record("broadcast history summary loads from API", customer360?.broadcastHistorySummary && Array.isArray(customer360.broadcastHistorySummary.rows));
  record("opt-out status loads from API", typeof customer360?.broadcastHistorySummary?.optOut === "boolean" && customer360.contact.optOutBroadcast === customer360.broadcastHistorySummary.optOut);
  record("broadcast context preserves platform/account/room", customer360.broadcastHistorySummary.platform === room.platform && customer360.broadcastHistorySummary.channelAccountId === room.channelAccountId && customer360.broadcastHistorySummary.roomId === room.id);
  record("broadcast response is safe", noRawSecretFields(customer360.broadcastHistorySummary));
  record("broadcast externalCalls = 0", noNonzeroExternalCalls(customer360.broadcastHistorySummary));

  const contactId = customer360.contact.id;
  const previousOptOut = customer360.broadcastHistorySummary.optOut;
  const nextOptOut = !previousOptOut;
  const updatedContact = await requestJson("PATCH", `/contacts/${encodeURIComponent(contactId)}/broadcast-consent`, {
    optOut: nextOptOut,
    conversationId: conversation.id
  });
  record("safe opt-out/opt-in update persisted via API", updatedContact.optOutBroadcast === nextOptOut);

  const refetched = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/customer-360`);
  record("refetch preserves updated opt-out state", refetched.contact.optOutBroadcast === nextOptOut && refetched.broadcastHistorySummary.optOut === nextOptOut);
  record("updated response keeps context", refetched.broadcastHistorySummary.platform === room.platform && refetched.broadcastHistorySummary.channelAccountId === room.channelAccountId && refetched.broadcastHistorySummary.roomId === room.id);
  record("updated response is safe", noRawSecretFields(refetched));
  record("updated externalCalls = 0", noNonzeroExternalCalls(refetched));

  const auditLogs = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/audit-logs`);
  const consentAudit = auditLogs.find((log) => log.action === "contact.broadcast_consent_updated");
  record("audit log exists for broadcast consent action", Boolean(consentAudit?.id));
  record("audit log preserves safe context", consentAudit?.platform === room.platform && consentAudit?.channelAccountId === room.channelAccountId && consentAudit?.roomId === room.id);
  record("audit log is safe", noRawSecretFields(consentAudit));
  record("audit externalCalls = 0", noNonzeroExternalCalls(consentAudit));

  await requestJson("PATCH", `/contacts/${encodeURIComponent(contactId)}/broadcast-consent`, {
    optOut: previousOptOut,
    conversationId: conversation.id
  });
  const restored = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/customer-360`);
  record("original opt-out state restored after smoke", restored.broadcastHistorySummary.optOut === previousOptOut);

  const missing = await request("GET", "/conversations/sprint32-missing-no-mock/customer-360");
  record("missing Customer 360 returns API error/empty state, not mock fallback", missing.status === 404);
  const missingText = await missing.text();
  record("missing case does not return mock fallback", !missingText.includes("Anya Prom") && !missingText.includes("Krit Market"));

  record("no provider outbound", !containsProviderOutbound({ customer360, refetched, restored, auditLogs }));

  finish();
}

async function findConversation(rooms) {
  if (!Array.isArray(rooms)) return null;
  for (const room of rooms) {
    if (!room?.id || !room?.platform || !room?.channelAccountId) continue;
    const conversations = await requestJson("GET", `/rooms/${encodeURIComponent(room.id)}/conversations?tab=human&filter=all&limit=10`);
    const conversation = Array.isArray(conversations)
      ? conversations.find((item) => item?.id && item?.roomId === room.id && item?.platform === room.platform && item?.channelAccountId === room.channelAccountId)
      : null;
    if (conversation) return { room, conversation };
  }
  return null;
}

function finish() {
  const failed = results.filter((result) => !result.ok);
  console.log(JSON.stringify({ baseUrl, tenantId, results }, null, 2));
  if (failed.length > 0) {
    throw new Error(`Sprint 32 smoke failed: ${failed.map((item) => item.name).join(", ")}`);
  }
}

async function requestJson(method, path, body) {
  const response = await request(method, path, body);
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const detail = typeof data?.message === "string" ? data.message : response.statusText;
    throw new Error(`${method} ${path} failed (${response.status}): ${detail}`);
  }
  return data;
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

function isLocalBaseUrl(value) {
  try {
    const parsed = new URL(value);
    return ["localhost", "127.0.0.1", "::1"].includes(parsed.hostname);
  } catch {
    return false;
  }
}

function containsProviderOutbound(value) {
  const text = JSON.stringify(value ?? {});
  return /outbound\.queued|outbound\.sent|queued_provider|sent_provider|line\.push|telegram\.send|facebook\.send|instagram\.send/i.test(text);
}

function noNonzeroExternalCalls(value) {
  const stack = [value];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || typeof current !== "object") continue;
    for (const [key, child] of Object.entries(current)) {
      if (key === "externalCalls" && child !== 0) return false;
      if (child && typeof child === "object") stack.push(child);
    }
  }
  return true;
}

function noRawSecretFields(value) {
  const forbidden = new Set([
    "accessToken",
    "accessTokenCiphertext",
    "webhookSecret",
    "appSecret",
    "botToken",
    "verifyToken",
    "apiKey",
    "password"
  ]);
  const stack = [value];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || typeof current !== "object") continue;
    for (const [key, child] of Object.entries(current)) {
      if (forbidden.has(key)) return false;
      if (looksRawSecret(child)) return false;
      if (child && typeof child === "object") stack.push(child);
    }
  }
  return true;
}

function looksRawSecret(value) {
  if (value === null || value === undefined) return false;
  const text = String(value);
  return /sk-[a-z0-9_-]{8,}|Bearer\s+[a-z0-9._-]+|raw-|mock-line-secret|xox[baprs]-|EA[A-Za-z0-9]{20,}/i.test(text);
}

function record(name, ok, detail = "") {
  results.push({ name, ok: Boolean(ok), detail });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
