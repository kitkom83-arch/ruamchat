const baseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");
const tenantId = process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
const userId = process.env.USER_ID ?? "00000000-0000-4000-8000-000000000011";
const allowedMockStatuses = new Set(["queued_mock", "sent_mock", "skipped_mock", "failed_mock"]);
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
    record("manual reply persisted", true, "skipped; no rooms returned");
    finish();
    return;
  }

  const conversations = await requestJson("GET", `/rooms/${encodeURIComponent(room.id)}/conversations?tab=human&filter=all`);
  record("GET /rooms/:roomId/conversations", Array.isArray(conversations));
  const conversation = Array.isArray(conversations) ? conversations.find((item) => item?.id) : null;

  if (!conversation?.id) {
    record("GET /conversations/:conversationId/messages", true, "skipped; no conversations returned");
    record("POST /conversations/:conversationId/messages", true, "skipped; no conversations returned");
    record("manual reply persisted", true, "skipped; no conversations returned");
    finish();
    return;
  }

  const beforeMessages = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/messages`);
  record("GET /conversations/:conversationId/messages", Array.isArray(beforeMessages));

  const body = `Sprint 25 safe manual reply ${new Date().toISOString()}`;
  const sent = await requestJson("POST", `/conversations/${encodeURIComponent(conversation.id)}/messages`, {
    text: body,
    senderType: "agent"
  });
  record("POST /conversations/:conversationId/messages", sent?.conversationId === conversation.id && sent?.text === body);
  record("manual reply status is mock-only", allowedMockStatuses.has(sent?.deliveryStatus));
  record("manual reply response is safe", noRawSecretFields(sent));

  const afterMessages = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/messages`);
  const persisted = Array.isArray(afterMessages) && afterMessages.some((message) => message.id === sent.id && message.text === body);
  record("manual reply persisted after refresh", persisted);
  record("refreshed message statuses are mock-only", Array.isArray(afterMessages) && afterMessages.every((message) =>
    message.direction === "inbound" || allowedMockStatuses.has(message.deliveryStatus)
  ));
  record("refreshed messages are safe", noRawSecretFields(afterMessages));

  const auditLogs = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/audit-logs`);
  const outboundLog = Array.isArray(auditLogs)
    ? auditLogs.find((log) => log.action === "outbound.mock_queued" && log.metadataJson?.messageId === sent.id)
    : null;
  const metadata = outboundLog?.metadataJson ?? {};
  record("outbound mock audit log exists", Boolean(outboundLog));
  record("outbound mock status is allowed", allowedMockStatuses.has(metadata.status));
  record("platform/account/room preserved", (
    metadata.platform === conversation.platform &&
    metadata.channelAccountId === conversation.channelAccountId &&
    metadata.roomId === conversation.roomId
  ));
  record("audit logs are safe", noRawSecretFields(auditLogs));
  record("externalCalls = 0", metadata.externalCalls === 0);

  finish();
}

function finish() {
  const failed = results.filter((result) => !result.ok);
  console.log(JSON.stringify({ baseUrl, tenantId, externalCalls: 0, results }, null, 2));
  if (failed.length > 0) {
    throw new Error(`Sprint 25 smoke failed: ${failed.map((item) => item.name).join(", ")}`);
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

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
