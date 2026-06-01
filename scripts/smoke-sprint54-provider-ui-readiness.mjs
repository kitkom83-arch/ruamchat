import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const baseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");
const tenantId = process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
const userId = process.env.USER_ID ?? "00000000-0000-4000-8000-000000000011";
const results = [];

async function main() {
  record("local API only", isLocalBaseUrl(baseUrl));

  const rootPackage = JSON.parse(readFileSync("package.json", "utf8"));
  const apiClient = readFileSync("apps/web/app/api-client.ts", "utf8");
  const settingsData = readFileSync("apps/web/app/settings-data.ts", "utf8");
  const providerPanel = readFileSync("apps/web/app/settings/provider-readiness-panel.tsx", "utf8");
  const channelSettings = readFileSync("apps/web/app/settings/channels/page.tsx", "utf8");

  record("smoke script registered", rootPackage.scripts?.["smoke:sprint54"] === "node scripts/smoke-sprint54-provider-ui-readiness.mjs");
  record("Sprint 53 regression script registered", rootPackage.scripts?.["smoke:sprint53"] === "node scripts/smoke-sprint53-provider-readiness.mjs");
  record("Sprint 52 regression script registered", rootPackage.scripts?.["smoke:sprint52"] === "node scripts/smoke-sprint52-production-readiness.mjs");
  record("provider readiness API client exists", apiClient.includes("getProviderReadiness") && apiClient.includes("/health/readiness"));
  record("API client sends tenant header", apiClient.includes("\"x-tenant-id\": getApiTenantId()"));
  record("API mode provider readiness has no mock fallback", settingsData.includes("mode === \"api\"") && settingsData.includes("await getProviderReadiness()"));
  record("provider readiness UI mounted in settings channels", channelSettings.includes("ProviderReadinessPanel"));
  record("provider readiness UI shows safe summary fields", [
    "provider mode:",
    "sandbox mode:",
    "realOutboundEnabled=",
    "externalCalls=",
    "allowlist count="
  ].every((term) => providerPanel.includes(term)));
  record("provider readiness UI has API error state", providerPanel.includes("role: \"alert\"") && channelSettings.includes("Provider Readiness API error"));
  record("provider readiness UI does not render forbidden raw field names", !/accessToken|botToken|apiKey|authorization|providerRaw|rawPayload|payloadJson/i.test(providerPanel));

  const health = await request("GET", "/health");
  record("GET /health reachable", health.status === 200);
  const healthBody = await safeJson(health);
  record("health response safe", healthBody?.status === "ok" && healthBody?.service === "api" && noRawSecretFields(healthBody));

  const readiness = await request("GET", "/health/readiness");
  record("GET /health/readiness reachable", readiness.status === 200);
  const readinessBody = await safeJson(readiness);
  const providerReadiness = readinessBody?.providerReadiness;

  record("provider readiness section exists", Boolean(providerReadiness?.providers));
  record("provider readiness includes all providers", ["line", "telegram", "facebook", "instagram"].every((name) =>
    providerReadiness?.providers?.some((provider) => provider.name === name)
  ));
  record("provider outbound disabled by default", providerReadiness?.realOutboundEnabled === false && providerReadiness?.outboundEnabledByEnv === false);
  record("realOutboundEnabled=false", providerReadiness?.realOutboundEnabled === false);
  record("externalCalls=0", readinessBody?.externalCalls === 0 && providerReadiness?.externalCalls === 0 && noNonzeroExternalCalls(readinessBody));
  record("allowlist count summarized only", typeof providerReadiness?.allowlistCount === "number" && typeof providerReadiness?.allowlist?.entryCount === "number" && safeProviderReadiness(providerReadiness));
  record("provider webhook readiness summarized", providerReadiness?.providers?.every((provider) =>
    typeof provider.webhookVerificationConfigured === "boolean" && ["configured", "not_configured"].includes(provider.webhookStatus)
  ));
  record("provider readiness response has no raw token/secret/provider payload", noRawSecretFields(readinessBody));
  record("no provider outbound", !containsProviderOutbound({ readinessBody, healthBody }));
  record("no live provider network call evidence", noLiveProviderNetworkEvidence({ readinessBody, healthBody }));
  record("Sprint 53 key provider readiness regression passes", providerReadiness?.providers?.every((provider) => provider.outboundEnabled === false) && safeProviderReadiness(providerReadiness));
  record("Sprint 52 readiness regression passes", noNonzeroExternalCalls({ readinessBody, healthBody }) && readinessBody?.monitoring?.providerPayloadsExposed === false);

  finish();
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

async function safeJson(response) {
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

function isLocalBaseUrl(value) {
  try {
    const parsed = new URL(value);
    return ["localhost", "127.0.0.1", "::1"].includes(parsed.hostname);
  } catch {
    return false;
  }
}

function safeProviderReadiness(readiness) {
  if (!readiness || typeof readiness !== "object") return false;
  if (!readiness.allowlist || typeof readiness.allowlist.entryCount !== "number") return false;
  const serialized = JSON.stringify(readiness);
  const rawProviderValues = /line-test-recipient|telegram-test-chat|messenger-test-recipient|instagram-test-recipient|fb-user-|ig-user-|U-sprint|replyToken/i;
  const rawProviderKeys = /"(messaging|events|rawPayload|providerRaw|payloadJson)"\s*:/i;
  return !rawProviderValues.test(serialized) && !rawProviderKeys.test(serialized);
}

function containsProviderOutbound(value) {
  const text = JSON.stringify(value ?? {});
  return /outbound\.queued|outbound\.sent|queued_provider|sent_provider|line\.push|telegram\.send|facebook\.send|instagram\.send/i.test(text);
}

function noLiveProviderNetworkEvidence(value) {
  const text = JSON.stringify(value ?? {});
  return !/api\.line\.me|api\.telegram\.org|graph\.facebook\.com|provider_network_call|live_provider_call/i.test(text);
}

function noNonzeroExternalCalls(value) {
  const stack = [value];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || typeof current !== "object") continue;
    for (const [key, child] of Object.entries(current)) {
      if (key === "externalCalls") {
        if (Array.isArray(child) && child.length === 0) continue;
        if (child !== 0) return false;
      }
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
    "token",
    "secret",
    "accessToken",
    "refreshToken",
    "accessTokenCiphertext",
    "webhookSecret",
    "webhookSignature",
    "appSecret",
    "botToken",
    "verifyToken",
    "apiKey",
    "authorization",
    "payloadJson",
    "providerRaw",
    "rawPayload"
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

function finish() {
  const failed = results.filter((result) => !result.ok);
  console.log(JSON.stringify({ baseUrl, tenantId, externalCalls: 0, results }, null, 2));
  if (failed.length > 0) {
    throw new Error(`Sprint 54 smoke failed: ${failed.map((item) => item.name).join(", ")}`);
  }
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
