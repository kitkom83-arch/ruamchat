import { describe, expect, it } from "vitest";
import { formatValidationReport, parseEnvFile, validateProductionEnv } from "./validate-production-env.mjs";

describe("production env validation", () => {
  it("passes a safe pilot env without printing configured values", () => {
    const env = safePilotEnv({
      POSTGRES_PASSWORD: "sprint52-db-value-must-not-print",
      DATABASE_URL: "postgresql://aiomni:sprint52-db-value-must-not-print@postgres:5432/aiomni?schema=public",
      S3_SECRET_KEY: "sprint52-s3-value-must-not-print",
      JWT_SECRET: "sprint52-jwt-value-must-not-print-32-chars",
      LINE_CHANNEL_ACCESS_TOKEN: "sprint52-line-value-must-not-print",
      META_APP_SECRET: "sprint52-meta-value-must-not-print"
    });

    const result = validateProductionEnv(env);
    const report = formatValidationReport(result);

    expect(result.ok).toBe(true);
    expect(result.externalCalls).toBe(0);
    expect(report).not.toContain("sprint52-db-value-must-not-print");
    expect(report).not.toContain("sprint52-s3-value-must-not-print");
    expect(report).not.toContain("sprint52-jwt-value-must-not-print");
    expect(report).not.toContain("sprint52-line-value-must-not-print");
    expect(report).not.toContain("sprint52-meta-value-must-not-print");
  });

  it("fails when API mode or provider outbound safety is not explicit", () => {
    const result = validateProductionEnv(safePilotEnv({
      API_MODE: "local",
      NEXT_PUBLIC_DATA_MODE: "mock",
      PROVIDER_OUTBOUND_MODE: "real"
    }));

    expect(result.ok).toBe(false);
    expect(result.checks.find((check) => check.name === "API_MODE is api")?.ok).toBe(false);
    expect(result.checks.find((check) => check.name === "NEXT_PUBLIC_DATA_MODE is api")?.ok).toBe(false);
    expect(result.checks.find((check) => check.name === "provider outbound disabled")?.ok).toBe(false);
  });

  it("parses env files without expanding or leaking values", () => {
    const parsed = parseEnvFile([
      "NODE_ENV=production",
      "JWT_SECRET='quoted-sensitive-value'",
      "NEXT_PUBLIC_API_BASE_URL=/api"
    ].join("\n"));

    expect(parsed.JWT_SECRET).toBe("quoted-sensitive-value");
    expect(parsed.NEXT_PUBLIC_API_BASE_URL).toBe("/api");
  });
});

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
    POSTGRES_PASSWORD: "safe-db-password-for-test",
    POSTGRES_DB: "aiomni",
    DATABASE_URL: "postgresql://aiomni:safe-db-password-for-test@postgres:5432/aiomni?schema=public",
    REDIS_URL: "redis://redis:6379",
    S3_ENDPOINT: "http://minio:9000",
    S3_ACCESS_KEY: "pilot-minio-user",
    S3_SECRET_KEY: "safe-s3-password-for-test",
    S3_BUCKET: "omni-chat",
    APP_ENCRYPTION_KEY: Buffer.alloc(32, 7).toString("base64"),
    JWT_SECRET: "safe-jwt-secret-for-test-with-32-chars",
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
