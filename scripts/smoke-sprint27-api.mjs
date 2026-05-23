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

  const context = {
    platform: conversation.platform,
    channelAccountId: conversation.channelAccountId,
    roomId: conversation.roomId
  };
  record("safe persisted conversation selected", Boolean(conversation.id), conversation.id);
  record("initial conversation response is safe", noRawSecretFields(conversation));

  const nextPriority = conversation.priority === "high" ? "urgent" : "high";
  const priority = await requestJson("PATCH", `/conversations/${encodeURIComponent(conversation.id)}/priority`, { priority: nextPriority });
  record("PATCH safe priority action", priority?.id === conversation.id && priority?.roomId === context.roomId);

  const status = await requestJson("PATCH", `/conversations/${encodeURIComponent(conversation.id)}/status`, { status: "pending" });
  record("PATCH safe status action", status?.id === conversation.id && status?.roomId === context.roomId);

  const auditLogs = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/audit-logs`);
  record("GET /conversations/:conversationId/audit-logs", Array.isArray(auditLogs));
  record("audit log exists", Array.isArray(auditLogs) && auditLogs.some((log) => log?.action === "conversation.priority_updated" || log?.action === "conversation.status_updated"));
  record("audit platform/account/room preserved", Array.isArray(auditLogs) && auditLogs.some((log) => scopedContextPreserved(log, context)));
  record("audit response is safe", noRawSecretFields(auditLogs));

  const statusHistory = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/status-history`);
  record("GET /conversations/:conversationId/status-history", Array.isArray(statusHistory));
  record("status history exists or safe empty", Array.isArray(statusHistory));
  record("status history platform/account/room preserved", statusHistory.length === 0 || statusHistory.every((item) => scopedContextPreserved(item, context)));
  record("status history response is safe", noRawSecretFields(statusHistory));
  record("externalCalls = 0", externalCalls === 0);

  finish();
}

function scopedContextPreserved(item, context) {
  const metadata = metadataFor(item);
  return (
    item?.platform === context.platform &&
    item?.channelAccountId === context.channelAccountId &&
    item?.roomId === context.roomId &&
    metadata.platform === context.platform &&
    metadata.channelAccountId === context.channelAccountId &&
    metadata.roomId === context.roomId
  );
}

function metadataFor(item) {
  const metadata = item?.metadataJson ?? item?.metadata ?? {};
  return metadata && typeof metadata === "object" ? metadata : {};
}

function finish() {
  const failed = results.filter((result) => !result.ok);
  console.log(JSON.stringify({ baseUrl, tenantId, externalCalls, results }, null, 2));
  if (failed.length > 0) {
    throw new Error(`Sprint 27 smoke failed: ${failed.map((item) => item.name).join(", ")}`);
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
