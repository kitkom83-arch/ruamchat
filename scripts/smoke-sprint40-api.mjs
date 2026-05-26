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
  record("GET /rooms returns persisted rooms", Array.isArray(rooms) && rooms.length > 0);

  const selected = await findConversation(rooms);
  record("safe persisted conversation with Customer 360 data selected", Boolean(selected?.room?.id && selected?.conversation?.id), selected?.conversation?.id ?? "");
  if (!selected) return finish();

  const { room, conversation } = selected;
  record("selected conversation context preserved", hasExactConversationContext(conversation, room, conversation.id));

  const customer360Before = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/customer-360`);
  record("GET Customer 360 returns selected conversation", customer360Before.selectedConversationId === conversation.id);
  record("Customer 360 source preserves platform/account", customer360Before.source?.platform === room.platform && customer360Before.source?.channelAccountId === room.channelAccountId);
  record("Customer 360 identity/contact grouping keeps conversation context", conversationsKeepContext(customer360Before.recentConversations, conversation.id));
  record("Customer 360 DTO is safe", noRawSecretFields(customer360Before));

  const notesBefore = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/notes`);
  record("GET notes returns backend array", Array.isArray(notesBefore));

  const marker = `sprint40-note-${Date.now()}`;
  const createdNote = await requestJson("POST", `/conversations/${encodeURIComponent(conversation.id)}/notes`, {
    body: `Sprint 40 persisted note ${marker}`,
    visibility: "team"
  });
  record("POST note persists through backend", createdNote?.body?.includes(marker) && hasExactConversationContext(createdNote, room, conversation.id));
  record("created note DTO has no token/secret fields", noRawSecretFields(createdNote));

  const notesAfter = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/notes`);
  const refetchedNote = Array.isArray(notesAfter) ? notesAfter.find((note) => note.id === createdNote.id || note.body?.includes(marker)) : null;
  record("refetch notes confirms note persisted", Boolean(refetchedNote));
  record("refetched note preserves tenant/contact/conversation/platform/account/room", hasNoteContext(refetchedNote, room, conversation.id));

  const customer360After = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/customer-360`);
  const customer360Note = customer360After.notes?.find((note) => note.id === createdNote.id || note.body?.includes(marker));
  record("Customer 360 refetch includes persisted note", Boolean(customer360Note));
  record("Customer 360 note context preserved", hasNoteContext(customer360Note, room, conversation.id));
  record("Customer 360 grouping still does not merge conversation context", conversationsKeepContext(customer360After.recentConversations, conversation.id));

  const auditLogs = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/audit-logs`);
  const noteAudit = Array.isArray(auditLogs)
    ? auditLogs.find((log) => log.action === "note.created" && (log.entityId === createdNote.id || log.metadataJson?.noteId === createdNote.id))
    : null;
  record("audit/timeline rows exist for note action", Boolean(noteAudit));
  record("note audit includes safe note/customer/conversation context", hasAuditContext(noteAudit, room, conversation.id, createdNote.id, createdNote.contactId));
  record("audit logs are safe", noRawSecretFields(auditLogs));

  const statusHistory = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/status-history`);
  record("GET status history returns backend array", Array.isArray(statusHistory));
  record("status history rows preserve context when present", !Array.isArray(statusHistory) || statusHistory.every((item) => hasTimelineContext(item, room, item.conversationId)));

  const aggregateDtos = { customer360Before, notesBefore, createdNote, notesAfter, customer360After, auditLogs, statusHistory };
  record("all DTOs have no token/secret fields", noRawSecretFields(aggregateDtos));
  record("externalCalls = 0", noNonzeroExternalCalls(aggregateDtos));
  record("no provider outbound", !containsProviderOutbound(aggregateDtos));

  const invalidTenant = await request("GET", `/conversations/${encodeURIComponent(conversation.id)}/notes`, undefined, {
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
    throw new Error(`Sprint 40 smoke failed: ${failed.map((item) => item.name).join(", ")}`);
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

function hasExactConversationContext(value, room, conversationId) {
  return Boolean(
    value &&
    value.tenantId === tenantId &&
    (value.id === conversationId || value.conversationId === conversationId) &&
    value.platform === room.platform &&
    value.channelAccountId === room.channelAccountId &&
    value.roomId === room.id
  );
}

function hasTimelineContext(value, room, conversationId) {
  return Boolean(
    value &&
    value.tenantId === tenantId &&
    value.conversationId === conversationId &&
    value.platform === room.platform &&
    value.channelAccountId === room.channelAccountId &&
    value.roomId === room.id
  );
}

function hasNoteContext(value, room, conversationId) {
  return Boolean(
    value &&
    hasTimelineContext(value, room, conversationId) &&
    typeof value.contactId === "string" &&
    (value.customerId === undefined || value.customerId === value.contactId)
  );
}

function hasAuditContext(value, room, conversationId, noteId, contactId) {
  const metadata = value?.metadataJson ?? {};
  const afterJson = value?.afterJson ?? {};
  return Boolean(
    value &&
    hasTimelineContext(value, room, conversationId) &&
    metadata.tenantId === tenantId &&
    metadata.conversationId === conversationId &&
    metadata.noteId === noteId &&
    metadata.contactId === contactId &&
    metadata.customerId === contactId &&
    metadata.platform === room.platform &&
    metadata.channelAccountId === room.channelAccountId &&
    metadata.roomId === room.id &&
    metadata.externalCalls === 0 &&
    afterJson.conversationId === conversationId &&
    afterJson.contactId === contactId &&
    afterJson.platform === room.platform &&
    afterJson.channelAccountId === room.channelAccountId &&
    afterJson.roomId === room.id
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
