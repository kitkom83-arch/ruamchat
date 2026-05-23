const baseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");
const tenantId = process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
const userId = process.env.USER_ID ?? "00000000-0000-4000-8000-000000000011";

const results = [];

async function main() {
  record("local API only", isLocalBaseUrl(baseUrl), baseUrl);

  const health = await request("GET", "/health");
  record("GET /health", health.status === 200);

  const channels = await requestJson("GET", "/settings/channels");
  record("GET /settings/channels", Array.isArray(channels));
  record("channel records include platform and id", Array.isArray(channels) && channels.every((item) => item?.id && item?.platform && item?.accountName));
  record("channel records do not expose raw token/secret fields", noRawSecretFields(channels));
  record("channel redaction fields are safe", Array.isArray(channels) && channels.every((item) =>
    typeof item.hasAccessToken === "boolean" &&
    typeof item.secretConfigured === "boolean" &&
    !looksRawSecret(item.tokenMasked) &&
    !looksRawSecret(item.secretMasked)
  ));

  const channel = Array.isArray(channels) ? channels[0] : null;
  if (channel?.id) {
    const detail = await requestJson("GET", `/settings/channels/${encodeURIComponent(channel.id)}`);
    record("GET /settings/channels/:channelAccountId", detail?.id === channel.id && detail?.platform);
    record("channel detail is redacted", noRawSecretFields(detail) && !looksRawSecret(detail?.tokenMasked) && !looksRawSecret(detail?.secretMasked));
  } else {
    record("GET /settings/channels/:channelAccountId", true, "skipped; no persisted channels returned");
  }

  const team = await requestJson("GET", "/settings/team");
  record("GET /settings/team", Array.isArray(team));
  record("team records include safe fields", Array.isArray(team) && team.every((item) =>
    item?.id && item?.name && item?.displayName && item?.role && item?.email && item?.status && Number.isInteger(item?.maxConcurrentChats)
  ));
  record("team records do not expose raw token/secret fields", noRawSecretFields(team));

  const member = Array.isArray(team) ? team[0] : null;
  if (member?.id) {
    const detail = await requestJson("GET", `/settings/team/${encodeURIComponent(member.id)}`);
    record("GET /settings/team/:agentId", detail?.id === member.id && detail?.role && detail?.email);
    record("team detail is tenant-safe shape", noRawSecretFields(detail));
  } else {
    record("GET /settings/team/:agentId", true, "skipped; no persisted team returned");
  }

  const failed = results.filter((result) => !result.ok);
  console.log(JSON.stringify({ baseUrl, tenantId, externalCalls: 0, results }, null, 2));
  if (failed.length > 0) {
    throw new Error(`Sprint 23 smoke failed: ${failed.map((item) => item.name).join(", ")}`);
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
