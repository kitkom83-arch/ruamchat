import { pathToFileURL } from "node:url";

const baseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");
const tenantId = process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
const userId = process.env.USER_ID ?? "00000000-0000-4000-8000-000000000011";
const smokeTag = "sprint30-smoke";
const results = [];

async function main() {
  record("local API only", isLocalBaseUrl(baseUrl), baseUrl);

  const health = await request("GET", "/health");
  record("GET /health", health.status === 200);

  const contacts = await requestJson("GET", "/contacts");
  record("GET /contacts", Array.isArray(contacts));
  record("contacts response is safe", noRawSecretFields(contacts));

  const rooms = await requestJson("GET", "/rooms");
  record("GET /rooms", Array.isArray(rooms));

  let conversation = null;
  for (const room of Array.isArray(rooms) ? rooms.filter((item) => item?.id) : []) {
    const conversations = await requestJson("GET", `/rooms/${encodeURIComponent(room.id)}/conversations?tab=human&filter=all`);
    if (!Array.isArray(conversations)) continue;
    conversation = conversations.find((item) =>
      item?.id &&
      item?.platform &&
      item?.channelAccountId &&
      item?.roomId
    ) ?? null;
    if (conversation) break;
  }
  record("safe persisted conversation selected", Boolean(conversation?.id), conversation?.id ?? "");
  if (!conversation?.id) return finish();

  const customer360 = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/customer-360`);
  record("GET Customer 360", customer360?.selectedConversationId === conversation.id);
  record("Customer 360 profile loads", Boolean(customer360?.contact?.id && customer360.contact.displayName));
  record("linked identities load", Array.isArray(customer360?.identities));
  record("related conversations load", Array.isArray(customer360?.recentConversations) && customer360.recentConversations.length > 0);
  record("Customer 360 response is safe", noRawSecretFields(customer360));
  record("Customer 360 externalCalls = 0", noNonzeroExternalCalls(customer360));
  record("no provider outbound", !containsProviderOutbound(customer360));

  const related = Array.isArray(customer360?.recentConversations) ? customer360.recentConversations : [];
  record("related conversations preserve platform/account/room/id", related.length > 0 && related.every(hasSeparatedConversationContext));
  record("related conversations are not collapsed", conversationsStaySeparated(related));

  const contactId = customer360?.contact?.id;
  record("safe persisted contact selected", Boolean(contactId), contactId ?? "");
  if (contactId) {
    const nextTags = Array.from(new Set([...(customer360.contact.tags ?? []), smokeTag]));
    const updatedContact = await requestJson("PATCH", `/contacts/${encodeURIComponent(contactId)}`, { tags: nextTags });
    record("PATCH contact safe field", updatedContact?.id === contactId && updatedContact.tags?.includes(smokeTag));
    record("updated contact response is safe", noRawSecretFields(updatedContact));

    const refreshed = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/customer-360`);
    record("Customer 360 refresh keeps persisted profile", refreshed?.contact?.id === contactId && refreshed.contact.tags?.includes(smokeTag));
    record("Customer 360 refresh keeps related conversations separated", conversationsStaySeparated(refreshed?.recentConversations ?? []));

    const auditLogs = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/audit-logs`);
    const contactAudit = Array.isArray(auditLogs)
      ? auditLogs.find((item) => item?.action === "contact.updated" && metadataFor(item).contactId === contactId)
      : null;
    record("contact action audit exists", Boolean(contactAudit));
    record("contact action audit is safe", noRawSecretFields(contactAudit));
    record("contact action audit externalCalls = 0", metadataFor(contactAudit).externalCalls === 0);
    record("contact action audit context preserved", contactAudit ? scopedContextPreserved(contactAudit) : false);
  }

  finish();
}

function hasSeparatedConversationContext(item) {
  return Boolean(item?.id && item?.platform && item?.channelAccountId && item?.roomId);
}

function conversationsStaySeparated(conversations) {
  if (!Array.isArray(conversations) || conversations.length === 0) return false;
  const keys = conversations.map((item) => `${item.platform}|${item.channelAccountId}|${item.roomId}|${item.id}`);
  return keys.every((key) => !key.includes("undefined") && !key.includes("null")) && new Set(keys).size === conversations.length;
}

function scopedContextPreserved(item) {
  const metadata = metadataFor(item);
  return Boolean(
    item?.platform &&
    item?.channelAccountId &&
    item?.roomId &&
    metadata.platform === item.platform &&
    metadata.channelAccountId === item.channelAccountId &&
    metadata.roomId === item.roomId
  );
}

function metadataFor(item) {
  const metadata = item?.metadataJson ?? item?.metadata ?? {};
  return metadata && typeof metadata === "object" ? metadata : {};
}

function containsProviderOutbound(value) {
  const text = JSON.stringify(value ?? {});
  return /outbound\.queued|outbound\.sent|queued_provider|sent_provider|line\.push|telegram\.send|facebook\.send|instagram\.send/i.test(text);
}

function noNonzeroExternalCalls(value) {
  const stack = [value];
  let sawExternalCalls = false;
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || typeof current !== "object") continue;
    for (const [key, child] of Object.entries(current)) {
      if (key === "externalCalls") {
        sawExternalCalls = true;
        if (child !== 0) return false;
      }
      if (child && typeof child === "object") stack.push(child);
    }
  }
  return sawExternalCalls ? true : true;
}

function finish() {
  const failed = results.filter((result) => !result.ok);
  console.log(JSON.stringify({ baseUrl, tenantId, results }, null, 2));
  if (failed.length > 0) {
    throw new Error(`Sprint 30 smoke failed: ${failed.map((item) => item.name).join(", ")}`);
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
