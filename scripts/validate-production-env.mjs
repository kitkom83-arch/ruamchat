import { existsSync, readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const requiredNames = [
  "NODE_ENV",
  "API_MODE",
  "DATA_MODE",
  "APP_DOMAIN",
  "APP_URL",
  "API_URL",
  "NEXT_PUBLIC_DATA_MODE",
  "NEXT_PUBLIC_API_BASE_URL",
  "POSTGRES_USER",
  "POSTGRES_PASSWORD",
  "POSTGRES_DB",
  "DATABASE_URL",
  "REDIS_URL",
  "S3_ENDPOINT",
  "S3_ACCESS_KEY",
  "S3_SECRET_KEY",
  "S3_BUCKET",
  "APP_ENCRYPTION_KEY",
  "JWT_SECRET",
  "AI_MODE",
  "OPENAI_API_KEY",
  "OPENAI_MODEL",
  "OPENAI_CLASSIFIER_MODEL",
  "OPENAI_REPLY_MODEL",
  "OPENAI_VECTOR_STORE_ID",
  "PROVIDER_OUTBOUND_MODE",
  "PROVIDER_OUTBOUND_ENABLED",
  "PROVIDER_SANDBOX_MODE",
  "PROVIDER_SANDBOX_ALLOWLIST",
  "CHANNEL_MODE",
  "META_CHANNEL_MODE",
  "LINE_SANDBOX_ALLOWLIST",
  "LINE_CHANNEL_SECRET",
  "LINE_CHANNEL_ACCESS_TOKEN",
  "TELEGRAM_SANDBOX_ALLOWLIST",
  "TELEGRAM_BOT_TOKEN",
  "TELEGRAM_WEBHOOK_SECRET",
  "META_VERIFY_TOKEN",
  "FACEBOOK_VERIFY_TOKEN",
  "INSTAGRAM_VERIFY_TOKEN",
  "META_APP_SECRET",
  "FACEBOOK_SANDBOX_ALLOWLIST",
  "FACEBOOK_PAGE_ACCESS_TOKEN",
  "INSTAGRAM_SANDBOX_ALLOWLIST",
  "INSTAGRAM_ACCESS_TOKEN"
];

const placeholderPattern = /^(change-this|replace-with|example|chat\.example\.com|https:\/\/chat\.example\.com|postgresql:\/\/aiomni:change-this|<.*>)|your[-_]/i;

export function parseEnvFile(text) {
  const env = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    const value = stripQuotes(line.slice(separator + 1).trim());
    if (key) env[key] = value;
  }
  return env;
}

export function loadEnvFile(filePath) {
  return parseEnvFile(readFileSync(filePath, "utf8"));
}

export function requiredProductionEnvNames() {
  return [...requiredNames];
}

export function validateProductionEnv(env) {
  const checks = [];
  const add = (name, ok, message) => checks.push({ name, ok: Boolean(ok), message });

  for (const name of requiredNames) {
    add(`name documented: ${name}`, Object.prototype.hasOwnProperty.call(env, name), "Required env name is present.");
  }

  add("NODE_ENV is production", env.NODE_ENV === "production", "Production deploys must set NODE_ENV=production.");
  add("API_MODE is api", env.API_MODE === "api", "API mode must be explicit.");
  add("DATA_MODE is api", !configured(env.DATA_MODE) || env.DATA_MODE === "api", "DATA_MODE is optional but must not disagree with API mode.");
  add("NEXT_PUBLIC_DATA_MODE is api", env.NEXT_PUBLIC_DATA_MODE === "api", "The web app must call the API in production and must not silently fall back to mock data.");
  add("NEXT_PUBLIC_API_BASE_URL configured", configured(env.NEXT_PUBLIC_API_BASE_URL), "The web API base URL must be explicit.");
  add("APP_DOMAIN replaced", configured(env.APP_DOMAIN) && !placeholderPattern.test(env.APP_DOMAIN), "Use a real pilot domain.");
  add("APP_URL replaced", configured(env.APP_URL) && !placeholderPattern.test(env.APP_URL), "Use the real HTTPS app URL.");
  add("API_URL replaced", configured(env.API_URL) && !placeholderPattern.test(env.API_URL), "Use the real API URL.");
  add("DATABASE_URL configured", configured(env.DATABASE_URL) && !placeholderPattern.test(env.DATABASE_URL), "Database connection string must be set.");
  add("REDIS_URL configured", configured(env.REDIS_URL), "Redis URL must be set.");
  add("S3 storage configured", ["S3_ENDPOINT", "S3_ACCESS_KEY", "S3_SECRET_KEY", "S3_BUCKET"].every((name) => configured(env[name]) && !placeholderPattern.test(env[name])), "Object storage names must be replaced.");
  add("APP_ENCRYPTION_KEY is base64 32 bytes", isBase64Key32(env.APP_ENCRYPTION_KEY), "Generate with: openssl rand -base64 32.");
  add("JWT_SECRET replaced", configured(env.JWT_SECRET) && !placeholderPattern.test(env.JWT_SECRET) && env.JWT_SECRET.length >= 32, "Use a long random value.");
  add("AI_MODE is mock", env.AI_MODE === "mock", "Sprint 53 pilot readiness keeps AI local/mock.");
  add("provider outbound disabled", env.PROVIDER_OUTBOUND_MODE === "disabled", "Real LINE/Telegram/Facebook/Instagram outbound must stay disabled.");
  add("PROVIDER_OUTBOUND_ENABLED is false", env.PROVIDER_OUTBOUND_ENABLED === "false", "Provider outbound requires an explicit runtime flag and is false by default.");
  add("PROVIDER_SANDBOX_MODE is disabled", env.PROVIDER_SANDBOX_MODE === "disabled", "Provider sandbox outbound is disabled by default.");
  add("CHANNEL_MODE is mock", env.CHANNEL_MODE === "mock", "Provider channel mode must stay mock.");
  add("META_CHANNEL_MODE is mock", env.META_CHANNEL_MODE === "mock", "Meta provider mode must stay mock.");
  add("provider credential names present", providerEnvNames().every((name) => Object.prototype.hasOwnProperty.call(env, name)), "Provider readiness can be checked without enabling outbound.");
  add("provider sandbox allowlist names present", providerSandboxEnvNames().every((name) => Object.prototype.hasOwnProperty.call(env, name)), "Provider sandbox allowlists are documented without exposing recipient values.");

  const failed = checks.filter((check) => !check.ok);
  return {
    ok: failed.length === 0,
    externalCalls: 0,
    summary: {
      total: checks.length,
      passed: checks.length - failed.length,
      failed: failed.length
    },
    checks
  };
}

export function formatValidationReport(result) {
  return JSON.stringify({
    ok: result.ok,
    externalCalls: 0,
    summary: result.summary,
    checks: result.checks
  }, null, 2);
}

export function providerEnvNames() {
  return [
    "LINE_CHANNEL_SECRET",
    "LINE_CHANNEL_ACCESS_TOKEN",
    "TELEGRAM_BOT_TOKEN",
    "TELEGRAM_WEBHOOK_SECRET",
    "META_VERIFY_TOKEN",
    "FACEBOOK_VERIFY_TOKEN",
    "INSTAGRAM_VERIFY_TOKEN",
    "META_APP_SECRET",
    "FACEBOOK_PAGE_ACCESS_TOKEN",
    "INSTAGRAM_ACCESS_TOKEN"
  ];
}

export function providerSandboxEnvNames() {
  return [
    "PROVIDER_SANDBOX_ALLOWLIST",
    "LINE_SANDBOX_ALLOWLIST",
    "TELEGRAM_SANDBOX_ALLOWLIST",
    "FACEBOOK_SANDBOX_ALLOWLIST",
    "INSTAGRAM_SANDBOX_ALLOWLIST"
  ];
}

function configured(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function stripQuotes(value) {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}

function isBase64Key32(value) {
  if (!configured(value) || placeholderPattern.test(value)) return false;
  try {
    return Buffer.from(value, "base64").length === 32;
  } catch {
    return false;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const envPath = process.argv[2] ?? ".env.production";
  if (!existsSync(envPath)) {
    console.error(`Missing ${envPath}`);
    process.exitCode = 1;
  } else {
    const result = validateProductionEnv(loadEnvFile(envPath));
    console.log(formatValidationReport(result));
    process.exitCode = result.ok ? 0 : 1;
  }
}
