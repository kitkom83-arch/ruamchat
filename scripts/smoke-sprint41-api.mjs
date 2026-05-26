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
  const customer360Before = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/customer-360`);
  record("GET Customer 360", customer360Before?.selectedConversationId === conversation.id);
  record("Customer 360 source context preserved", customer360Before.source?.platform === room.platform && customer360Before.source?.channelAccountId === room.channelAccountId);
  record("Customer 360 grouping does not merge conversation context", conversationsKeepContext(customer360Before.recentConversations, conversation.id));
  record("Customer 360 DTO has no token/secret fields", noRawSecretFields(customer360Before));

  const contactId = customer360Before.contact?.id;
  const marker = `sprint41-${Date.now()}`;
  const nextTags = Array.from(new Set([...(customer360Before.contact?.tags ?? []), marker]));
  const updated = await requestJson("PATCH", `/conversations/${encodeURIComponent(conversation.id)}/customer-360`, {
    contactId,
    tags: nextTags
  });
  record("PATCH Customer 360 profile/tag persists through backend", updated.contact?.id === contactId && updated.contact?.tags?.includes(marker));
  record("PATCH Customer 360 returned context preserved", updated.selectedConversationId === conversation.id && updated.source?.platform === room.platform && updated.source?.channelAccountId === room.channelAccountId);
  record("PATCH Customer 360 DTO has no token/secret fields", noRawSecretFields(updated));

  const refetched = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/customer-360`);
  record("refetch confirms Customer 360 tag persisted", refetched.contact?.id === contactId && refetched.contact?.tags?.includes(marker));
  record("refetch confirms grouping still preserves platform/account/room", conversationsKeepContext(refetched.recentConversations, conversation.id));

  const auditLogs = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/audit-logs`);
  const profileAudit = Array.isArray(auditLogs)
    ? auditLogs.find((log) =>
        ["customer360.tags_updated", "customer360.profile_updated"].includes(log.action) &&
        log.metadataJson?.contactId === contactId &&
        JSON.stringify(log.metadataJson?.next ?? {}).includes(marker)
      )
    : null;
  record("Customer 360 profile/tag audit row exists", Boolean(profileAudit));
  record("Customer 360 audit row includes safe context", hasAuditContext(profileAudit, room, conversation.id, contactId));
  record("audit logs have no token/secret fields", noRawSecretFields(auditLogs));

  const aggregateDtos = { customer360Before, updated, refetched, auditLogs };
  record("externalCalls = 0", noNonzeroExternalCalls(aggregateDtos));
  record("no provider outbound", !containsProviderOutbound(aggregateDtos));

  const invalidTenant = await request("PATCH", `/conversations/${encodeURIComponent(conversation.id)}/customer-360`, {
    contactId,
    tags: [...nextTags, "invalid-tenant-should-not-persist"]
  }, {
    "x-tenant-id": "00000000-0000-4000-8000-000000009999"
  });
  const invalidText = await invalidTenant.text();
  record("invalid/API failure returns API error", invalidTenant.status >= 400);
  record("invalid/API failure does not return mock fallback", !invalidText.includes("Anya Prom") && !invalidText.includes("Krit Market") && !invalidText.includes("ส่งราคา Business"));

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
    throw new Error(`Sprint 41 smoke failed: ${failed.map((item) => item.name).join(", ")}`);
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

function hasAuditContext(value, room, conversationId, contactId) {
  const metadata = value?.metadataJson ?? {};
  const beforeJson = value?.beforeJson ?? {};
  const afterJson = value?.afterJson ?? {};
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
    metadata.externalCalls === 0 &&
    beforeJson.id === contactId &&
    afterJson.id === contactId
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
      if (key === "externalCalls" && child !== 0) return false;
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
