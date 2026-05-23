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
  if (!room?.id) return finish();

  const conversations = await requestJson("GET", `/rooms/${encodeURIComponent(room.id)}/conversations?tab=human&filter=all`);
  record("GET /rooms/:roomId/conversations", Array.isArray(conversations));
  const conversation = Array.isArray(conversations)
    ? conversations.find((item) => item?.id && item?.platform && item?.channelAccountId && item?.roomId)
    : null;
  if (!conversation?.id) return finish();

  const context = {
    platform: conversation.platform,
    channelAccountId: conversation.channelAccountId,
    roomId: conversation.roomId
  };
  record("safe persisted conversation selected", Boolean(conversation.id), conversation.id);

  const flows = await requestJson("GET", "/flows");
  record("GET /flows", Array.isArray(flows));
  const flow = Array.isArray(flows) ? flows.find((item) => item?.id && item?.trigger && Array.isArray(item?.nodes)) : null;
  if (!flow?.id) return finish();
  record("safe persisted flow selected", Boolean(flow.id), flow.id);

  const dryRun = await requestJson("POST", `/flows/${encodeURIComponent(flow.id)}/test-run`, buildDryRunPayload(flow, conversation));
  record("POST /flows/:flowId/test-run", dryRun?.flowRun?.flowId === flow.id);
  record("dry-run result", dryRun?.flowRun?.status === "dry_run");
  record("mock/dry-run statuses only", dryRunStatusesAreSafe(dryRun));
  record("no real outbound status", noRealOutboundStatus(dryRun));
  record("dry-run response is safe", noRawSecretFields(dryRun));
  record("externalCalls = 0", externalCallsAreZero(dryRun));

  const runs = await requestJson("GET", `/flows/${encodeURIComponent(flow.id)}/runs`);
  record("GET /flows/:flowId/runs", Array.isArray(runs));
  record("persisted run exists", Array.isArray(runs) && runs.some((item) => item?.id === dryRun.flowRun.id));
  record("run history response is safe", noRawSecretFields(runs));

  const auditLogs = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/audit-logs`);
  record("GET audit logs", Array.isArray(auditLogs));
  const audit = Array.isArray(auditLogs)
    ? auditLogs.find((item) => item?.action === "flow_run_dry_run" && metadataFor(item).runId === dryRun.flowRun.id)
    : null;
  record("flow run audit exists", Boolean(audit));
  record("audit platform/account/room preserved", audit ? scopedContextPreserved(audit, context) : false);
  record("audit response is safe", noRawSecretFields(auditLogs));
  record("audit externalCalls = 0", audit ? metadataFor(audit).externalCalls === 0 : false);

  finish();
}

function buildDryRunPayload(flow, conversation) {
  const triggerType = flow.trigger?.type ?? flow.triggerType ?? "manual_test";
  const payload = {
    conversationId: conversation.id,
    contactId: null,
    message: conversation.lastMessage ?? "",
    platform: conversation.platform,
    roomId: conversation.roomId,
    triggerType,
    businessHours: true
  };
  if (triggerType === "keyword") payload.message = flow.trigger?.keyword ?? conversation.lastMessage ?? "";
  if (triggerType === "tag_added") payload.tag = flow.trigger?.tag ?? conversation.tags?.[0] ?? "hot lead";
  if (triggerType === "ai_intent") payload.intent = flow.trigger?.intent ?? "pricing";
  if (triggerType === "status_changed") payload.status = flow.trigger?.status ?? conversation.status ?? "open";
  if (triggerType === "first_message") payload.isFirstMessage = true;
  return payload;
}

function dryRunStatusesAreSafe(value) {
  const allowed = new Set(["dry_run", "success_mock", "skipped_mock", "failed_mock", "outbound_skipped_mock"]);
  const statuses = collectStatuses(value);
  return statuses.length > 0 && statuses.every((status) => allowed.has(status) || ["completed", "failed", "skipped"].includes(status));
}

function noRealOutboundStatus(value) {
  return !collectStatuses(value).some((status) => ["sent", "queued", "delivered"].includes(status));
}

function collectStatuses(value) {
  const statuses = [];
  const stack = [value];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || typeof current !== "object") continue;
    for (const [key, child] of Object.entries(current)) {
      if (key === "status" && typeof child === "string") statuses.push(child);
      if (child && typeof child === "object") stack.push(child);
    }
  }
  return statuses;
}

function externalCallsAreZero(value) {
  const stack = [value];
  let seen = false;
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || typeof current !== "object") continue;
    for (const [key, child] of Object.entries(current)) {
      if (key === "externalCalls") {
        seen = true;
        if (Array.isArray(child) && child.length !== 0) return false;
        if (typeof child === "number" && child !== 0) return false;
      }
      if (child && typeof child === "object") stack.push(child);
    }
  }
  return seen;
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
  console.log(JSON.stringify({ baseUrl, tenantId, results }, null, 2));
  if (failed.length > 0) {
    throw new Error(`Sprint 28 smoke failed: ${failed.map((item) => item.name).join(", ")}`);
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
