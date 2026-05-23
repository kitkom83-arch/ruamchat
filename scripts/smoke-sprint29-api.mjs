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
  const room = Array.isArray(rooms) ? rooms.find((item) => item?.id) : null;
  if (!room?.id) {
    record("safe persisted room selected", false);
    return finish();
  }

  let conversations = [];
  let conversation = null;
  for (const candidateRoom of rooms.filter((item) => item?.id)) {
    conversations = await requestJson("GET", `/rooms/${encodeURIComponent(candidateRoom.id)}/conversations?tab=human&filter=all`);
    if (Array.isArray(conversations)) {
      conversation = conversations.find((item) => item?.id && item?.platform && item?.channelAccountId && item?.roomId) ?? null;
    }
    if (conversation) break;
  }
  record("GET /rooms/:roomId/conversations", Array.isArray(conversations));
  if (!conversation?.id) {
    record("safe persisted conversation selected", false);
    return finish();
  }

  const context = {
    platform: conversation.platform,
    channelAccountId: conversation.channelAccountId,
    roomId: conversation.roomId
  };
  record("safe persisted conversation selected", Boolean(conversation.id), conversation.id);

  const suggestion = await requestJson("POST", `/ai/conversations/${encodeURIComponent(conversation.id)}/suggest`);
  record("POST /ai/conversations/:conversationId/suggest", suggestion?.conversationId === conversation.id);
  record("suggestion response is safe", noRawSecretFields(suggestion));
  record("suggestion externalCalls = 0", suggestion?.externalCalls === 0);
  record("suggestion platform/account/room preserved", scopedContextPreserved(suggestion, context));
  record("suggestion is draft-only", !containsProviderOutbound(suggestion));

  const feedback = await requestJson("POST", `/ai/suggestions/${encodeURIComponent(suggestion.suggestionId)}/feedback`, {
    feedbackType: "mark_wrong"
  });
  record("POST feedback / mark-wrong endpoint", feedback?.suggestionId === suggestion.suggestionId);
  record("feedback response is safe", noRawSecretFields(feedback));
  record("feedback externalCalls = 0", feedback?.externalCalls === 0);
  record("feedback platform/account/room preserved", scopedContextPreserved(feedback, context));

  const auditLogs = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/audit-logs`);
  record("GET audit logs", Array.isArray(auditLogs));
  const suggestionAudit = Array.isArray(auditLogs)
    ? auditLogs.find((item) => item?.action === "ai.suggested_reply.generated" && metadataFor(item).suggestionId === suggestion.suggestionId)
    : null;
  const feedbackAudit = Array.isArray(auditLogs)
    ? auditLogs.find((item) => item?.action === "ai.feedback.mark_wrong" && metadataFor(item).suggestionId === suggestion.suggestionId)
    : null;
  record("AI suggestion audit exists", Boolean(suggestionAudit));
  record("AI feedback audit exists", Boolean(feedbackAudit));
  record("audit platform/account/room preserved", suggestionAudit && feedbackAudit
    ? scopedContextPreserved(suggestionAudit, context) && scopedContextPreserved(feedbackAudit, context)
    : false);
  record("audit response is safe", noRawSecretFields(auditLogs));
  record("audit externalCalls = 0", suggestionAudit && feedbackAudit
    ? metadataFor(suggestionAudit).externalCalls === 0 && metadataFor(feedbackAudit).externalCalls === 0
    : false);
  record("no provider outbound", !containsProviderOutbound({ suggestion, feedback, auditLogs }));

  finish();
}

function scopedContextPreserved(item, context) {
  const metadata = metadataFor(item);
  return (
    item?.platform === context.platform &&
    item?.channelAccountId === context.channelAccountId &&
    item?.roomId === context.roomId &&
    (metadata.platform === undefined || metadata.platform === context.platform) &&
    (metadata.channelAccountId === undefined || metadata.channelAccountId === context.channelAccountId) &&
    (metadata.roomId === undefined || metadata.roomId === context.roomId)
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

function finish() {
  const failed = results.filter((result) => !result.ok);
  console.log(JSON.stringify({ baseUrl, tenantId, results }, null, 2));
  if (failed.length > 0) {
    throw new Error(`Sprint 29 smoke failed: ${failed.map((item) => item.name).join(", ")}`);
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
