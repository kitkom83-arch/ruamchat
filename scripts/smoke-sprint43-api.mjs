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
  record("GET /rooms", Array.isArray(rooms) && rooms.length > 0);

  const selected = await findConversation(rooms);
  record("safe persisted conversation selected", Boolean(selected?.room?.id && selected?.conversation?.id), selected?.conversation?.id ?? "");
  if (!selected) return finish();

  const { room, conversation } = selected;
  const beforeMessages = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/messages`);
  const customer360Before = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/customer-360`);
  const contactId = customer360Before.contact?.id;
  const originalOptOut = Boolean(customer360Before.contact?.optOutBroadcast ?? customer360Before.broadcastHistorySummary?.optOut);
  const originalDoNotContact = Boolean(customer360Before.contact?.doNotContact);
  record("GET Customer 360", customer360Before?.selectedConversationId === conversation.id && Boolean(contactId));
  record("Customer 360 context is separated", customer360Before.source?.platform === room.platform && customer360Before.source?.channelAccountId === room.channelAccountId);
  record("Customer 360 DTO has no token/secret fields", noRawSecretFields(customer360Before));

  const blockedState = await requestJson("PATCH", `/conversations/${encodeURIComponent(conversation.id)}/customer-360/consent`, {
    contactId,
    optOut: originalOptOut,
    doNotContact: true
  });
  record("set doNotContact through backend API", blockedState.contact?.id === contactId && blockedState.contact?.doNotContact === true);

  const blockedReply = await request("POST", `/conversations/${encodeURIComponent(conversation.id)}/messages`, {
    text: `Sprint 43 blocked manual reply ${new Date().toISOString()}`,
    senderType: "agent"
  });
  const blockedText = await blockedReply.text();
  record("manual reply is blocked by doNotContact", blockedReply.status === 403, blockedText);
  record("blocked response has no token/secret fields", noRawSecretFields(blockedText));

  const afterMessages = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/messages`);
  record("blocked action did not create fake sent/queued message", Array.isArray(afterMessages) && afterMessages.length === beforeMessages.length);

  const auditLogs = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/audit-logs`);
  const blockedAudit = Array.isArray(auditLogs)
    ? auditLogs.find((log) =>
        log.action === "outbound.blocked" &&
        log.metadataJson?.blockedReason === "do_not_contact" &&
        log.metadataJson?.contactId === contactId
      )
    : null;
  record("blocked audit row exists", Boolean(blockedAudit));
  record("blocked audit context preserved", hasBlockedAuditContext(blockedAudit, room, conversation.id, contactId));
  record("audit logs have no token/secret fields", noRawSecretFields(auditLogs));

  const invalidTenant = await request("POST", `/conversations/${encodeURIComponent(conversation.id)}/messages`, {
    text: "invalid tenant must not fallback",
    senderType: "agent"
  }, {
    "x-tenant-id": "00000000-0000-4000-8000-000000009999"
  });
  const invalidText = await invalidTenant.text();
  record("invalid/API failure returns API error", invalidTenant.status >= 400);
  record("invalid/API failure does not return mock fallback", !invalidText.includes("Anya Prom") && !invalidText.includes("Krit Market") && !invalidText.includes("ส่งราคา Business"));

  const restored = await requestJson("PATCH", `/conversations/${encodeURIComponent(conversation.id)}/customer-360/consent`, {
    contactId,
    optOut: originalOptOut,
    doNotContact: originalDoNotContact
  });
  const refetched = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/customer-360`);
  record("restored original consent through backend API", restored.contact?.doNotContact === originalDoNotContact && refetched.contact?.optOutBroadcast === originalOptOut && refetched.contact?.doNotContact === originalDoNotContact);
  record("conversation grouping still preserves platform/account/room", conversationsKeepContext(refetched.recentConversations, conversation.id));

  const aggregateDtos = { customer360Before, blockedState, auditLogs, restored, refetched };
  record("externalCalls = 0", noNonzeroExternalCalls(aggregateDtos));
  record("no provider outbound", !containsProviderOutbound(aggregateDtos));

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
  console.log(JSON.stringify({ baseUrl, tenantId, externalCalls: 0, results }, null, 2));
  if (failed.length > 0) {
    throw new Error(`Sprint 43 smoke failed: ${failed.map((item) => item.name).join(", ")}`);
  }
}

async function requestJson(method, path, body, extraHeaders) {
  const response = await request(method, path, body, extraHeaders);
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const detail = typeof data?.message === "string" ? data.message : response.statusText;
    throw new Error(`${method} ${path} failed (${response.status}): ${detail}`);
  }
  return data;
}

async function request(method, path, body, extraHeaders = {}) {
  return fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      "x-tenant-id": tenantId,
      "x-user-id": userId,
      ...extraHeaders
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
}

function hasBlockedAuditContext(value, room, conversationId, contactId) {
  const metadata = value?.metadataJson ?? {};
  return Boolean(
    value &&
    value.tenantId === tenantId &&
    value.conversationId === conversationId &&
    value.platform === room.platform &&
    value.channelAccountId === room.channelAccountId &&
    value.roomId === room.id &&
    metadata.tenantId === tenantId &&
    metadata.conversationId === conversationId &&
    metadata.contactId === contactId &&
    metadata.customerId === contactId &&
    metadata.platform === room.platform &&
    metadata.channelAccountId === room.channelAccountId &&
    metadata.roomId === room.id &&
    metadata.blocked === true &&
    metadata.blockedReason === "do_not_contact" &&
    metadata.externalCalls === 0
  );
}

function conversationsKeepContext(conversations, selectedConversationId) {
  if (!Array.isArray(conversations) || conversations.length === 0) return false;
  const contextKeys = new Set();
  for (const item of conversations) {
    if (
      item.tenantId !== tenantId ||
      typeof item.id !== "string" ||
      typeof item.platform !== "string" ||
      typeof item.channelAccountId !== "string" ||
      typeof item.roomId !== "string"
    ) {
      return false;
    }
    contextKeys.add(`${item.id}:${item.platform}:${item.channelAccountId}:${item.roomId}`);
  }
  return contextKeys.size === conversations.length && conversations.some((item) => item.id === selectedConversationId);
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
      if (key === "externalCalls") {
        if (Array.isArray(child) && child.length === 0) continue;
        if (child !== 0) return false;
      }
      if (child && typeof child === "object") stack.push(child);
    }
  }
  return true;
}

function noRawSecretFields(value) {
  return !findUnsafeSecretPath(value);
}

function findUnsafeSecretPath(value) {
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
  const stack = [{ value, path: "$" }];
  while (stack.length > 0) {
    const item = stack.pop();
    const current = item?.value;
    const path = item?.path ?? "$";
    if (!current || typeof current !== "object") continue;
    for (const [key, child] of Object.entries(current)) {
      const childPath = `${path}.${key}`;
      if (forbidden.has(key)) return childPath;
      if (looksRawSecret(child)) return `${childPath}=${String(child).slice(0, 80)}`;
      if (child && typeof child === "object") stack.push({ value: child, path: childPath });
    }
  }
  return null;
}

function looksRawSecret(value) {
  if (value === null || value === undefined) return false;
  const text = String(value);
  return /(^|[^a-z])sk-[a-z0-9_-]{8,}|Bearer\s+[a-z0-9._-]+|raw-|mock-line-secret|xox[baprs]-|EA[A-Za-z0-9]{20,}/i.test(text);
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
