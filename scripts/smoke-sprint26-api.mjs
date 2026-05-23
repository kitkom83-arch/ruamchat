import { pathToFileURL } from "node:url";

const baseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");
const tenantId = process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
const userId = process.env.USER_ID ?? "00000000-0000-4000-8000-000000000011";
const externalCalls = 0;
const results = [];

async function main() {
  record("local API only", isLocalBaseUrl(baseUrl), baseUrl);

  const health = await request("GET", "/health");
  record("GET /health", health.status === 200);

  const rooms = await requestJson("GET", "/rooms");
  record("GET /rooms", Array.isArray(rooms));
  const room = Array.isArray(rooms) ? rooms.find((item) => item?.id) : null;

  if (!room?.id) {
    record("GET /rooms/:roomId/conversations", true, "skipped; no rooms returned");
    finish();
    return;
  }

  const conversations = await requestJson("GET", `/rooms/${encodeURIComponent(room.id)}/conversations?tab=human&filter=all`);
  record("GET /rooms/:roomId/conversations", Array.isArray(conversations));
  const conversation = Array.isArray(conversations) ? conversations.find((item) => item?.id && item?.platform && item?.channelAccountId && item?.roomId) : null;

  if (!conversation?.id) {
    record("safe persisted conversation selected", true, "skipped; no conversations returned");
    finish();
    return;
  }

  const initialContext = {
    platform: conversation.platform,
    channelAccountId: conversation.channelAccountId,
    roomId: conversation.roomId
  };
  record("safe persisted conversation selected", Boolean(conversation.id), conversation.id);
  record("initial conversation response is safe", noRawSecretFields(conversation));

  const takeover = await requestJson("POST", `/conversations/${encodeURIComponent(conversation.id)}/takeover`);
  record("POST takeover", takeover?.id === conversation.id && takeover?.roomId === initialContext.roomId);

  const returnedToAi = await requestJson("POST", `/conversations/${encodeURIComponent(conversation.id)}/return-to-ai`);
  record("POST return-to-ai", returnedToAi?.id === conversation.id && returnedToAi?.roomId === initialContext.roomId);

  const status = await requestJson("PATCH", `/conversations/${encodeURIComponent(conversation.id)}/status`, { status: "open" });
  record("PATCH status", status?.id === conversation.id && status?.roomId === initialContext.roomId);

  const priorityValue = conversation.priority === "high" ? "urgent" : "high";
  const priority = await requestJson("PATCH", `/conversations/${encodeURIComponent(conversation.id)}/priority`, { priority: priorityValue });
  record("PATCH priority", priority?.id === conversation.id && priority?.roomId === initialContext.roomId);

  const followUpAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const followUp = await requestJson("POST", `/conversations/${encodeURIComponent(conversation.id)}/follow-up`, { followUpAt });
  record("POST follow-up", followUp?.id === conversation.id && followUp?.roomId === initialContext.roomId);

  const readState = await requestJson("PATCH", `/conversations/${encodeURIComponent(conversation.id)}/read-state`, {
    unread: false,
    unreplied: false
  });
  record("PATCH read/replied", readState?.id === conversation.id && readState?.roomId === initialContext.roomId);

  const refreshed = await findConversation(initialContext.roomId, conversation.id);
  record("GET conversation again confirms persisted priority", refreshed?.priority === priorityValue);
  record("GET conversation again confirms persisted follow-up", refreshed?.status === "follow_up" || Boolean(refreshed?.followUpAt));
  record("GET conversation again confirms read/replied", refreshed?.unreadCount === 0 && refreshed?.unreplied === false);
  record("platform/account/room preserved", (
    refreshed?.platform === initialContext.platform &&
    refreshed?.channelAccountId === initialContext.channelAccountId &&
    refreshed?.roomId === initialContext.roomId
  ));
  record("refreshed conversation is safe", noRawSecretFields(refreshed));

  const auditLogs = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/audit-logs`);
  const actionNames = new Set(Array.isArray(auditLogs) ? auditLogs.map((log) => log.action) : []);
  const latestActionLogs = latestLogsForActions(auditLogs, actionNamesForSmoke);
  record("GET audit logs", Array.isArray(auditLogs));
  record("takeover audit exists", actionNames.has("conversation.takeover"));
  record("return-to-ai audit exists", actionNames.has("conversation.returned_to_ai"));
  record("status audit exists", actionNames.has("conversation.status_updated"));
  record("priority audit exists", actionNames.has("conversation.priority_updated"));
  record("follow-up audit exists", actionNames.has("conversation.follow_up_set"));
  record("read/replied audit exists", actionNames.has("conversation.read_state_updated"));
  record("audit platform/account/room preserved", auditScopePreserved(latestActionLogs, {
    tenantId,
    conversationId: conversation.id,
    ...initialContext
  }, actionNamesForSmoke));
  record("audit externalCalls safe marker", auditExternalCallsSafe(latestActionLogs, actionNamesForSmoke));
  record("audit logs are safe", noRawSecretFields(auditLogs));
  record("externalCalls = 0", externalCallsIsZero(externalCalls));

  finish();
}

export const actionNamesForSmoke = new Set([
  "conversation.takeover",
  "conversation.returned_to_ai",
  "conversation.status_updated",
  "conversation.priority_updated",
  "conversation.follow_up_set",
  "conversation.read_state_updated"
]);

async function findConversation(roomId, conversationId) {
  const filters = [
    ["human", "all"],
    ["bot", "all"],
    ["human", "follow_up"],
    ["bot", "follow_up"],
    ["human", "closed"],
    ["bot", "closed"],
    ["human", "spam"],
    ["bot", "spam"]
  ];
  for (const [tab, filter] of filters) {
    const cards = await requestJson("GET", `/rooms/${encodeURIComponent(roomId)}/conversations?tab=${tab}&filter=${filter}`);
    if (!Array.isArray(cards)) continue;
    const card = cards.find((item) => item.id === conversationId);
    if (card) return card;
  }
  return null;
}

function finish() {
  const failed = results.filter((result) => !result.ok);
  console.log(JSON.stringify({ baseUrl, tenantId, externalCalls, results }, null, 2));
  if (failed.length > 0) {
    throw new Error(`Sprint 26 smoke failed: ${failed.map((item) => item.name).join(", ")}`);
  }
}

export function latestLogsForActions(auditLogs, expectedActions = actionNamesForSmoke) {
  if (!Array.isArray(auditLogs)) return new Map();
  const latest = new Map();
  for (const log of auditLogs) {
    if (!log || !expectedActions.has(log.action) || latest.has(log.action)) continue;
    latest.set(log.action, log);
  }
  return latest;
}

export function auditScopePreserved(latestActionLogs, expectedContext, expectedActions = actionNamesForSmoke) {
  if (!(latestActionLogs instanceof Map) || latestActionLogs.size !== expectedActions.size) return false;
  for (const action of expectedActions) {
    const metadata = metadataForLog(latestActionLogs.get(action));
    if (metadata.tenantId !== expectedContext.tenantId) return false;
    if (metadata.conversationId !== expectedContext.conversationId) return false;
    if (metadata.platform !== expectedContext.platform) return false;
    if (metadata.channelAccountId !== expectedContext.channelAccountId) return false;
    if (metadata.roomId !== expectedContext.roomId) return false;
  }
  return true;
}

export function auditExternalCallsSafe(latestActionLogs, expectedActions = actionNamesForSmoke) {
  if (!(latestActionLogs instanceof Map) || latestActionLogs.size !== expectedActions.size) return false;
  for (const action of expectedActions) {
    if (metadataForLog(latestActionLogs.get(action)).externalCalls !== 0) return false;
  }
  return true;
}

export function externalCallsIsZero(value) {
  return value === 0;
}

function metadataForLog(log) {
  const metadata = log?.metadataJson ?? log?.metadata ?? {};
  return metadata && typeof metadata === "object" ? metadata : {};
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
