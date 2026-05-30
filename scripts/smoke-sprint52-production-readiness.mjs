import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { loadEnvFile, formatValidationReport, requiredProductionEnvNames, validateProductionEnv } from "./validate-production-env.mjs";

const baseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");
const tenantId = process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
const userId = process.env.USER_ID ?? "00000000-0000-4000-8000-000000000011";
const results = [];

async function main() {
  record("local API only", isLocalBaseUrl(baseUrl), baseUrl);

  const rootPackage = JSON.parse(readFileSync("package.json", "utf8"));
  const envExample = loadEnvFile(".env.example");
  const prodEnvExample = loadEnvFile(".env.production.example");
  const readinessDoc = readFileSync("docs/PRODUCTION_READINESS.md", "utf8");
  const requiredNames = requiredProductionEnvNames();

  record("required env names documented", requiredNames.every((name) => Object.prototype.hasOwnProperty.call(prodEnvExample, name)));
  record("local mock mode remains available", envExample.NEXT_PUBLIC_DATA_MODE === "mock" && envExample.CHANNEL_MODE === "mock" && envExample.PROVIDER_OUTBOUND_MODE === "disabled");
  record("production API mode explicit", prodEnvExample.API_MODE === "api" && prodEnvExample.DATA_MODE === "api" && prodEnvExample.NEXT_PUBLIC_DATA_MODE === "api" && prodEnvExample.NEXT_PUBLIC_API_BASE_URL === "/api");
  record("provider outbound disabled in production example", prodEnvExample.PROVIDER_OUTBOUND_MODE === "disabled" && prodEnvExample.CHANNEL_MODE === "mock" && prodEnvExample.META_CHANNEL_MODE === "mock");
  record("AI external mode disabled in production example", prodEnvExample.AI_MODE === "mock" && prodEnvExample.OPENAI_API_KEY === "");
  record("deployment checklist documented", ["domain", "SSL", "database", "redis", "env vars", "migrations", "backup", "rollback", "monitoring"].every((term) => readinessDoc.toLowerCase().includes(term.toLowerCase())));
  record("provider readiness checklist documented", ["LINE", "Telegram", "Facebook", "Instagram"].every((term) => readinessDoc.includes(term)));
  record("regression smokes referenced", ["smoke:sprint51", "smoke:sprint50", "smoke:sprint49", "smoke:sprint48"].every((name) => Boolean(rootPackage.scripts?.[name]) && readinessDoc.includes(name)));

  const validationSecret = "sprint52-sensitive-value-must-not-print";
  const validation = validateProductionEnv(safePilotEnv({
    POSTGRES_PASSWORD: validationSecret,
    DATABASE_URL: `postgresql://aiomni:${validationSecret}@postgres:5432/aiomni?schema=public`,
    S3_SECRET_KEY: validationSecret,
    JWT_SECRET: `${validationSecret}-jwt-with-32-characters`,
    LINE_CHANNEL_ACCESS_TOKEN: validationSecret
  }));
  const validationReport = formatValidationReport(validation);
  record("env validation safe pilot passes", validation.ok && validation.externalCalls === 0);
  record("env validation does not print configured values", !validationReport.includes(validationSecret));

  const health = await request("GET", "/health");
  record("health endpoint reachable", health.status === 200);
  const healthBody = await safeJson(health);
  record("health response safe", healthBody?.status === "ok" && healthBody?.service === "api" && noRawSecretFields(healthBody));

  const readiness = await request("GET", "/health/readiness");
  record("readiness endpoint reachable", readiness.status === 200);
  const readinessBody = await safeJson(readiness);
  record("readiness response passes", readinessBody?.status === "ok" && readinessBody?.externalCalls === 0);
  record("readiness response does not expose secrets", noRawSecretFields(readinessBody));
  record("readiness provider outbound disabled", readinessBody?.providerReadiness?.realOutboundEnabled === false && (readinessBody?.providerReadiness?.providers ?? []).every((provider) => provider.outboundEnabled === false));
  record("readiness monitoring baseline safe", readinessBody?.monitoring?.auditSafetyBaseline === true && readinessBody?.monitoring?.providerPayloadsExposed === false && readinessBody?.monitoring?.externalCalls === 0);

  const broadcasts = await request("GET", "/broadcasts/campaigns");
  record("Sprint 51 broadcasts API still reachable", broadcasts.status === 200);
  const broadcastBody = await safeJson(broadcasts);
  record("broadcasts API has no mock fallback raw output", Array.isArray(broadcastBody) && noRawSecretFields(broadcastBody) && noNonzeroExternalCalls(broadcastBody));

  record("no provider outbound", !containsProviderOutbound({ readinessBody, broadcastBody }));
  record("externalCalls = 0", noNonzeroExternalCalls({ readinessBody, broadcastBody, validation }));

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

function safePilotEnv(overrides = {}) {
  return {
    NODE_ENV: "production",
    API_MODE: "api",
    DATA_MODE: "api",
    APP_DOMAIN: "pilot.ruamchat.test",
    APP_URL: "https://pilot.ruamchat.test",
    API_URL: "https://pilot.ruamchat.test/api",
    NEXT_PUBLIC_DATA_MODE: "api",
    NEXT_PUBLIC_API_BASE_URL: "/api",
    POSTGRES_USER: "aiomni",
    POSTGRES_PASSWORD: "safe-db-password-for-smoke",
    POSTGRES_DB: "aiomni",
    DATABASE_URL: "postgresql://aiomni:safe-db-password-for-smoke@postgres:5432/aiomni?schema=public",
    REDIS_URL: "redis://redis:6379",
    S3_ENDPOINT: "http://minio:9000",
    S3_ACCESS_KEY: "pilot-minio-user",
    S3_SECRET_KEY: "safe-s3-password-for-smoke",
    S3_BUCKET: "omni-chat",
    APP_ENCRYPTION_KEY: Buffer.alloc(32, 9).toString("base64"),
    JWT_SECRET: "safe-jwt-secret-for-smoke-with-32-chars",
    AI_MODE: "mock",
    OPENAI_API_KEY: "",
    OPENAI_MODEL: "gpt-5.4-mini",
    OPENAI_CLASSIFIER_MODEL: "gpt-5.4-mini",
    OPENAI_REPLY_MODEL: "gpt-5.5",
    OPENAI_VECTOR_STORE_ID: "",
    PROVIDER_OUTBOUND_MODE: "disabled",
    CHANNEL_MODE: "mock",
    META_CHANNEL_MODE: "mock",
    LINE_CHANNEL_SECRET: "",
    LINE_CHANNEL_ACCESS_TOKEN: "",
    TELEGRAM_BOT_TOKEN: "",
    TELEGRAM_WEBHOOK_SECRET: "",
    META_VERIFY_TOKEN: "",
    META_APP_SECRET: "",
    FACEBOOK_PAGE_ACCESS_TOKEN: "",
    INSTAGRAM_ACCESS_TOKEN: "",
    ...overrides
  };
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
    throw new Error(`Sprint 52 smoke failed: ${failed.map((item) => item.name).join(", ")}`);
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
