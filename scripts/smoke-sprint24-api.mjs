const baseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");
const tenantId = process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
const userId = process.env.USER_ID ?? "00000000-0000-4000-8000-000000000011";

const results = [];

async function main() {
  record("local API only", isLocalBaseUrl(baseUrl), baseUrl);

  const health = await request("GET", "/health");
  record("GET /health", health.status === 200);

  const team = await requestJson("GET", "/settings/team");
  record("GET /settings/team", Array.isArray(team));
  record("team records include safe fields", Array.isArray(team) && team.every((item) =>
    item?.id && item?.name && item?.displayName && item?.role && item?.email && item?.status
  ));
  record("team records do not expose raw token/secret fields", noRawSecretFields(team));

  const slaPolicies = await requestJson("GET", "/settings/sla-policies");
  record("GET /settings/sla-policies", Array.isArray(slaPolicies));
  record("SLA records include tenant-safe ids and fields", Array.isArray(slaPolicies) && slaPolicies.every((item) =>
    item?.id && item?.name && item?.status && item?.priorityScope &&
    Number.isInteger(item?.firstResponseMinutes) &&
    Number.isInteger(item?.resolutionMinutes) &&
    item?.businessHoursMode &&
    item?.createdAt &&
    item?.updatedAt
  ));
  record("SLA records do not expose raw token/secret fields", noRawSecretFields(slaPolicies));

  const policy = Array.isArray(slaPolicies) ? slaPolicies[0] : null;
  if (policy?.id) {
    const detail = await requestJson("GET", `/settings/sla-policies/${encodeURIComponent(policy.id)}`);
    record("GET /settings/sla-policies/:policyId", detail?.id === policy.id && detail?.name && detail?.priorityScope);
    record("SLA detail is safe", noRawSecretFields(detail));
  } else {
    record("GET /settings/sla-policies/:policyId", true, "skipped; no persisted SLA policies returned");
  }

  const cannedReplies = await requestJson("GET", "/settings/canned-replies");
  record("GET /settings/canned-replies", Array.isArray(cannedReplies));
  record("canned reply records include tenant-safe ids and fields", Array.isArray(cannedReplies) && cannedReplies.every((item) =>
    item?.id && item?.title && item?.category && item?.shortcut && item?.bodyTemplate &&
    Array.isArray(item?.tags) &&
    Array.isArray(item?.platformScope) &&
    Array.isArray(item?.roomScope) &&
    item?.status &&
    item?.createdAt &&
    item?.updatedAt
  ));
  record("canned replies do not expose raw token/secret fields", noRawSecretFields(cannedReplies));

  const reply = Array.isArray(cannedReplies) ? cannedReplies[0] : null;
  if (reply?.id) {
    const detail = await requestJson("GET", `/settings/canned-replies/${encodeURIComponent(reply.id)}`);
    record("GET /settings/canned-replies/:replyId", detail?.id === reply.id && detail?.shortcut && detail?.bodyTemplate);
    record("canned reply detail is safe", noRawSecretFields(detail));
  } else {
    record("GET /settings/canned-replies/:replyId", true, "skipped; no persisted canned replies returned");
  }

  const failed = results.filter((result) => !result.ok);
  console.log(JSON.stringify({ baseUrl, tenantId, externalCalls: 0, results }, null, 2));
  if (failed.length > 0) {
    throw new Error(`Sprint 24 smoke failed: ${failed.map((item) => item.name).join(", ")}`);
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
