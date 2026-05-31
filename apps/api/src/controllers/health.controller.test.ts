import { describe, expect, it } from "vitest";
import { HealthController } from "./health.controller.js";

describe("HealthController", () => {
  it("returns ok health status", () => {
    const result = new HealthController().health();

    expect(result.status).toBe("ok");
    expect(result.service).toBe("api");
    expect(result.mode).toBe("local");
    expect(new Date(result.time).toString()).not.toBe("Invalid Date");
  });

  it("returns readiness without exposing credential values", () => {
    const previous = snapshotEnv([
      "API_MODE",
      "DATA_MODE",
      "NEXT_PUBLIC_DATA_MODE",
      "NEXT_PUBLIC_API_BASE_URL",
      "DATABASE_URL",
      "REDIS_URL",
      "AI_MODE",
      "CHANNEL_MODE",
      "META_CHANNEL_MODE",
      "PROVIDER_OUTBOUND_MODE",
      "PROVIDER_OUTBOUND_ENABLED",
      "PROVIDER_SANDBOX_MODE",
      "PROVIDER_SANDBOX_ALLOWLIST",
      "LINE_SANDBOX_ALLOWLIST",
      "TELEGRAM_SANDBOX_ALLOWLIST",
      "FACEBOOK_SANDBOX_ALLOWLIST",
      "INSTAGRAM_SANDBOX_ALLOWLIST",
      "LINE_CHANNEL_ACCESS_TOKEN",
      "LINE_CHANNEL_SECRET",
      "TELEGRAM_BOT_TOKEN",
      "TELEGRAM_WEBHOOK_SECRET",
      "META_APP_SECRET",
      "FACEBOOK_PAGE_ACCESS_TOKEN",
      "INSTAGRAM_ACCESS_TOKEN"
    ]);
    process.env.API_MODE = "api";
    process.env.DATA_MODE = "api";
    process.env.NEXT_PUBLIC_DATA_MODE = "api";
    process.env.NEXT_PUBLIC_API_BASE_URL = "/api";
    process.env.DATABASE_URL = "postgresql://pilot:sprint52-db-value@postgres:5432/aiomni";
    process.env.REDIS_URL = "redis://redis:6379";
    process.env.AI_MODE = "mock";
    process.env.CHANNEL_MODE = "real";
    process.env.META_CHANNEL_MODE = "real";
    process.env.PROVIDER_OUTBOUND_MODE = "disabled";
    process.env.PROVIDER_OUTBOUND_ENABLED = "false";
    process.env.PROVIDER_SANDBOX_MODE = "disabled";
    process.env.PROVIDER_SANDBOX_ALLOWLIST = "line:U-sprint53-secret-recipient";
    process.env.LINE_SANDBOX_ALLOWLIST = "U-line-sprint53-secret-recipient";
    process.env.TELEGRAM_SANDBOX_ALLOWLIST = "55201";
    process.env.FACEBOOK_SANDBOX_ALLOWLIST = "fb-user-sprint53-secret";
    process.env.INSTAGRAM_SANDBOX_ALLOWLIST = "ig-user-sprint53-secret";
    process.env.LINE_CHANNEL_ACCESS_TOKEN = "sprint52-line-value";
    process.env.LINE_CHANNEL_SECRET = "sprint52-line-webhook-value";
    process.env.TELEGRAM_BOT_TOKEN = "sprint52-telegram-value";
    process.env.TELEGRAM_WEBHOOK_SECRET = "sprint52-telegram-webhook-value";
    process.env.META_APP_SECRET = "sprint52-meta-value";
    process.env.FACEBOOK_PAGE_ACCESS_TOKEN = "sprint52-facebook-value";
    process.env.INSTAGRAM_ACCESS_TOKEN = "sprint52-instagram-value";

    try {
      const result = new HealthController().readiness();
      const serialized = JSON.stringify(result);

      expect(result.status).toBe("ok");
      expect(result.externalCalls).toBe(0);
      expect(result.providerReadiness.realOutboundEnabled).toBe(false);
      expect(result.providerReadiness.outboundEnabledByEnv).toBe(false);
      expect(result.providerReadiness.sandboxEnabled).toBe(false);
      expect(result.providerReadiness.externalCalls).toBe(0);
      expect(result.providerReadiness.allowlistCount).toBe(5);
      expect(result.providerReadiness.allowlist.entryCount).toBe(5);
      expect(result.providerReadiness.providers.every((provider) => provider.status === "disabled_by_default")).toBe(true);
      expect(result.providerReadiness.providers.every((provider) => provider.outboundEnabled === false)).toBe(true);
      expect(result.providerReadiness.providers.every((provider) => typeof provider.webhookVerificationConfigured === "boolean")).toBe(true);
      expect(result.providerReadiness.providers.every((provider) => typeof provider.allowlistCount === "number")).toBe(true);
      expect(serialized).not.toContain("sprint52-line-value");
      expect(serialized).not.toContain("sprint52-line-webhook-value");
      expect(serialized).not.toContain("sprint52-telegram-value");
      expect(serialized).not.toContain("sprint52-telegram-webhook-value");
      expect(serialized).not.toContain("sprint52-meta-value");
      expect(serialized).not.toContain("sprint52-db-value");
      expect(serialized).not.toContain("U-sprint53-secret-recipient");
      expect(serialized).not.toContain("U-line-sprint53-secret-recipient");
      expect(serialized).not.toContain("fb-user-sprint53-secret");
      expect(serialized).not.toContain("ig-user-sprint53-secret");
      expect(serialized).not.toMatch(/accessToken|webhookSecret|botToken|apiKey|authorization|payloadJson|providerRaw|rawPayload/i);
    } finally {
      restoreEnv(previous);
    }
  });
});

function snapshotEnv(keys: string[]) {
  return new Map(keys.map((key) => [key, process.env[key]]));
}

function restoreEnv(values: Map<string, string | undefined>) {
  for (const [key, value] of values) {
    if (value === undefined) {
      delete process.env[key];
      continue;
    }
    process.env[key] = value;
  }
}
