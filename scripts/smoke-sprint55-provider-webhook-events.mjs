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
  const providerController = readFileSync("apps/api/src/controllers/provider-webhooks.controller.ts", "utf8");
  const providerService = readFileSync("apps/api/src/services/provider-webhook-events.service.ts", "utf8");

  record("smoke script registered", rootPackage.scripts?.["smoke:sprint55"] === "node scripts/smoke-sprint55-provider-webhook-events.mjs");
  record("Sprint 54 regression script registered", rootPackage.scripts?.["smoke:sprint54"] === "node scripts/smoke-sprint54-provider-ui-readiness.mjs");
  record("Sprint 53 regression script registered", rootPackage.scripts?.["smoke:sprint53"] === "node scripts/smoke-sprint53-provider-readiness.mjs");
  record("provider webhook endpoints registered", providerController.includes("@Controller(\"provider-webhooks\")") && providerController.includes("sandbox-events") && providerController.includes("events"));
  record("provider webhook API client exists", apiClient.includes("getProviderWebhookEvents") && apiClient.includes("createProviderWebhookSandboxEvent"));
  record("API client sends tenant header", apiClient.includes("\"x-tenant-id\": getApiTenantId()"));
  record("API mode event log has no mock fallback", settingsData.includes("mode === \"api\"") && settingsData.includes("await getProviderWebhookEvents()"));
  record("provider readiness UI renders event log", providerPanel.includes("Webhook sandbox event log") && providerPanel.includes("Submit dry-run"));
  record("provider readiness UI has webhook API error state", providerPanel.includes("webhookEventsError") && providerPanel.includes("role: \"alert\""));
  record("event service rejects live provider mode", providerService.includes("PROVIDER_OUTBOUND_MODE") && providerService.includes("live provider mode"));
  record("event service stores safe DTO only", providerService.includes("payloadSummary") && providerService.includes("payloadFieldCount") && providerService.includes("externalCalls: 0"));
  record("event service does not call provider SDKs", !/api\.line\.me|api\.telegram\.org|graph\.facebook\.com|line\.push|telegram\.send|facebook\.send|instagram\.send/i.test(providerService));

  const health = await request("GET", "/health");
  record("GET /health reachable", health.status === 200);
  const healthBody = await safeJson(health);
  record("health response safe", healthBody?.status === "ok" && healthBody?.service === "api" && noRawSecretFields(healthBody));

  const readiness = await request("GET", "/health/readiness");
  record("GET /health/readiness reachable", readiness.status === 200);
  const readinessBody = await safeJson(readiness);
  const providerReadiness = readinessBody?.providerReadiness;
  record("Sprint 54 readiness still passes", providerReadiness?.providers?.every((provider) => provider.outboundEnabled === false) && readinessBody?.monitoring?.providerPayloadsExposed === false);
  record("readiness externalCalls=0", noNonzeroExternalCalls(readinessBody));

  const before = await request("GET", "/provider-webhooks/events");
  record("GET /provider-webhooks/events reachable", before.status === 200);
  const beforeBody = await safeJson(before);
  record("event list is an array", Array.isArray(beforeBody));
  record("initial event list safe", noRawSecretFields(beforeBody) && noRawPayloadValues(beforeBody));

  const sampleEvent = {
    provider: "line",
    channel: "line",
    eventType: "message.created",
    mode: "dry_run",
    status: "received",
    payload: {
      message: { type: "text", length: 17 },
      token: "sensitive-sample-a",
      secret: "sensitive-sample-b",
      signature: "sensitive-sample-c",
      authorization: "sensitive-sample-d",
      cookie: "sensitive-sample-e",
      rawPayload: "sensitive-provider-body"
    }
  };
  const created = await request("POST", "/provider-webhooks/sandbox-events", sampleEvent);
  record("POST /provider-webhooks/sandbox-events reachable", created.status === 201 || created.status === 200);
  const createdBody = await safeJson(created);
  record("created event has provider/channel/eventType/status", createdBody?.provider === "line" && createdBody?.channel === "line" && createdBody?.eventType === "message.created" && createdBody?.status === "received");
  record("created event payload summary exists", typeof createdBody?.payloadSummary === "string" && createdBody.payloadSummary.length > 0 && typeof createdBody?.payloadFieldCount === "number");
  record("created event externalCalls=0", createdBody?.externalCalls === 0);
  record("created event has safe fields only", safeEventShape(createdBody));
  record("created event raw payload not returned", noRawSecretFields(createdBody) && noRawPayloadValues(createdBody));

  const after = await request("GET", "/provider-webhooks/events");
  record("GET /provider-webhooks/events after create reachable", after.status === 200);
  const afterBody = await safeJson(after);
  const found = Array.isArray(afterBody) ? afterBody.find((event) => event.id === createdBody?.id) : null;
  record("created event exists in event log", Boolean(found));
  record("event log includes required safe fields", Boolean(found) && safeEventShape(found));
  record("event log payload summary exists", typeof found?.payloadSummary === "string" && found.payloadSummary.length > 0);
  record("event log raw payload not returned", noRawSecretFields(afterBody) && noRawPayloadValues(afterBody));
  record("event log externalCalls=0", noNonzeroExternalCalls(afterBody));
  record("no provider outbound", !containsProviderOutbound({ healthBody, readinessBody, createdBody, afterBody }));
  record("no live provider network call evidence", noLiveProviderNetworkEvidence({ healthBody, readinessBody, createdBody, afterBody }));

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

function safeEventShape(value) {
  if (!value || typeof value !== "object") return false;
  const allowed = new Set([
    "id",
    "tenantId",
    "provider",
    "channel",
    "eventType",
    "mode",
    "status",
    "receivedAt",
    "payloadSummary",
    "payloadFieldCount",
    "payloadDigest",
    "externalCalls"
  ]);
  return Object.keys(value).every((key) => allowed.has(key)) && value.externalCalls === 0;
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
    "cookie",
    "signature",
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

function noRawPayloadValues(value) {
  return !/sensitive-sample-a|sensitive-sample-b|sensitive-sample-c|sensitive-sample-d|sensitive-sample-e|sensitive-provider-body/i.test(JSON.stringify(value ?? {}));
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
    throw new Error(`Sprint 55 smoke failed: ${failed.map((item) => item.name).join(", ")}`);
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
