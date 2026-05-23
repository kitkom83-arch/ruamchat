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
  const room = Array.isArray(rooms) ? rooms.find((item) => item?.id && item?.platform && item?.channelAccountId) : null;
  record("safe persisted room selected", Boolean(room?.id), room?.id ?? "");
  if (!room?.id) return finish();

  const basePath = `/rooms/${encodeURIComponent(room.id)}/conversations?tab=human&filter=all`;
  const conversations = await requestJson("GET", basePath);
  record("GET conversation list no filters", Array.isArray(conversations));
  record("results belong to tenant context", conversations.every((item) => item.roomId === room.id && item.platform === room.platform && item.channelAccountId === room.channelAccountId));
  record("required separated conversation fields", conversations.every(hasSeparatedConversationContext));
  record("no conversations collapsed across platform/account/room", conversationsStaySeparated(conversations));
  record("conversation list is safe", noRawSecretFields(conversations));
  record("conversation list externalCalls = 0", noNonzeroExternalCalls(conversations));

  const selected = conversations.find((item) => item?.id && item?.lastMessage && item.lastMessage !== "-") ?? conversations[0] ?? null;
  if (selected) {
    const keyword = encodeURIComponent(String(selected.customerName ?? selected.lastMessage).split(/\s+/)[0] ?? selected.id);
    const searched = await requestJson("GET", `${basePath}&search=${keyword}`);
    record("GET conversation list with search keyword", Array.isArray(searched));
    record("search keeps room context", searched.every((item) => item.roomId === room.id && item.platform === room.platform && item.channelAccountId === room.channelAccountId));
    record("search does not collapse conversations", conversationsStaySeparated(searched));
  } else {
    record("GET conversation list with search keyword", true, "skipped: no conversations");
    record("search keeps room context", true, "skipped: no conversations");
    record("search does not collapse conversations", true, "skipped: no conversations");
  }

  const platformFiltered = await requestJson("GET", `${basePath}&platform=${encodeURIComponent(room.platform)}`);
  record("GET conversation list with platform filter", Array.isArray(platformFiltered));
  record("platform filter preserves context", platformFiltered.every((item) => item.platform === room.platform && item.channelAccountId === room.channelAccountId && item.roomId === room.id));

  const statusFiltered = await requestJson("GET", `${basePath}&status=open`);
  record("GET conversation list with status filter", Array.isArray(statusFiltered));
  record("status filter preserves context", statusFiltered.every((item) => item.status === "open" && item.roomId === room.id));

  const priorityFiltered = await requestJson("GET", `${basePath}&priority=medium`);
  record("GET conversation list with priority filter", Array.isArray(priorityFiltered));
  record("priority filter preserves context", priorityFiltered.every((item) => item.priority === "medium" && item.roomId === room.id));

  const paged = await requestJson("GET", `${basePath}&limit=1&offset=0`);
  record("GET conversation list with pagination limit", Array.isArray(paged) && paged.length <= 1);
  record("pagination result preserves required fields", paged.every(hasSeparatedConversationContext));

  const impossible = await requestJson("GET", `${basePath}&search=${encodeURIComponent("sprint31-impossible-filter-no-mock")}`);
  record("impossible filter returns empty API state", Array.isArray(impossible) && impossible.length === 0);
  record("impossible filter does not return mock fallback", !JSON.stringify(impossible).includes("Anya Prom") && !JSON.stringify(impossible).includes("Krit Market"));

  record("no provider outbound", !containsProviderOutbound({ conversations, platformFiltered, statusFiltered, priorityFiltered, paged, impossible }));

  finish();
}

function hasSeparatedConversationContext(item) {
  return Boolean(item?.id && item?.platform && item?.channelAccountId && item?.roomId);
}

function conversationsStaySeparated(conversations) {
  if (!Array.isArray(conversations)) return false;
  const keys = conversations.map((item) => `${item.platform}|${item.channelAccountId}|${item.roomId}|${item.id}`);
  return keys.every((key) => !key.includes("undefined") && !key.includes("null")) && new Set(keys).size === conversations.length;
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

function finish() {
  const failed = results.filter((result) => !result.ok);
  console.log(JSON.stringify({ baseUrl, tenantId, results }, null, 2));
  if (failed.length > 0) {
    throw new Error(`Sprint 31 smoke failed: ${failed.map((item) => item.name).join(", ")}`);
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
