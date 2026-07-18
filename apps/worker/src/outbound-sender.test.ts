import { describe, expect, it, vi } from "vitest";
import {
  assertProviderOutboundAllowed,
  providerOutboundEnabled,
  sendFacebookTextMessage,
  sendInstagramTextMessage,
  sendLineMediaMessage,
  sendLineTextMessage,
  sendMetaMediaMessage,
  sendMockOutboundText,
  sendTelegramMediaMessage,
  sendTelegramTextMessage,
  providerOutboundMode,
  providerSandboxMode,
  validateProviderOutboundGuard,
  shouldUseRealChannelSend
} from "./outbound-sender.js";

describe("outbound sender", () => {
  it("returns sent_mock for LINE mock sender", async () => {
    const result = await sendMockOutboundText({
      platform: "line",
      channelAccountId: "00000000-0000-4000-8000-000000000022",
      externalUserId: "U123",
      text: "สวัสดี"
    });

    expect(result.status).toBe("sent_mock");
    expect(result.mockMessageId).toContain("mock-line");
  });

  it("returns sent_mock for Telegram mock sender", async () => {
    const result = await sendMockOutboundText({
      platform: "telegram",
      channelAccountId: "00000000-0000-4000-8000-000000000021",
      externalUserId: "123",
      externalConversationId: "123",
      text: "hello"
    });

    expect(result.status).toBe("sent_mock");
    expect(result.mockMessageId).toContain("mock-telegram");
  });

  it("returns sent_mock for Facebook mock sender", async () => {
    const result = await sendMockOutboundText({
      platform: "facebook",
      channelAccountId: "00000000-0000-4000-8000-000000000023",
      externalUserId: "fb-user-381",
      text: "hello"
    });

    expect(result.status).toBe("sent_mock");
    expect(result.mockMessageId).toContain("mock-facebook");
  });

  it("returns sent_mock for Instagram mock sender", async () => {
    const result = await sendMockOutboundText({
      platform: "instagram",
      channelAccountId: "00000000-0000-4000-8000-000000000024",
      externalUserId: "ig-user-mint",
      text: "hello"
    });

    expect(result.status).toBe("sent_mock");
    expect(result.mockMessageId).toContain("mock-instagram");
  });

  it("does not use real provider sends by default", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const previous = snapshotEnv(providerEnvKeys);
    clearProviderEnv();

    try {
      expect(providerOutboundMode()).toBe("disabled");
      expect(providerOutboundEnabled()).toBe(false);
      expect(providerSandboxMode()).toBe("disabled");
      expect(shouldUseRealChannelSend()).toBe(false);
      expect(shouldUseRealChannelSend({
        provider: "line",
        recipientId: "U123",
        tenantId: tenantIdForTest,
        channelAccountTenantId: tenantIdForTest
      })).toBe(false);
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      restoreEnvSnapshot(previous);
      fetchSpy.mockRestore();
    }
  });

  it("requires outbound enabled, sandbox mode, allowlist, and tenant ownership before real sends", () => {
    const previous = snapshotEnv(providerEnvKeys);
    clearProviderEnv();

    try {
      process.env.CHANNEL_MODE = "real";
      process.env.PROVIDER_OUTBOUND_MODE = "real";
      expect(validateProviderOutboundGuard(lineGuard()).reason).toBe("provider_outbound_disabled");

      process.env.PROVIDER_OUTBOUND_ENABLED = "true";
      expect(validateProviderOutboundGuard(lineGuard()).reason).toBe("provider_sandbox_disabled");

      process.env.PROVIDER_SANDBOX_MODE = "enabled";
      expect(validateProviderOutboundGuard(lineGuard()).reason).toBe("allowlist_required");

      process.env.PROVIDER_SANDBOX_ALLOWLIST = "line:U123";
      expect(validateProviderOutboundGuard(lineGuard({ recipientId: "U999" })).reason).toBe("recipient_not_allowlisted");
      expect(validateProviderOutboundGuard(lineGuard({ channelAccountTenantId: "tenant-other" })).reason).toBe("tenant_ownership_required");
      expect(validateProviderOutboundGuard(lineGuard()).allowed).toBe(true);
      expect(shouldUseRealChannelSend(lineGuard())).toBe(true);
    } finally {
      restoreEnvSnapshot(previous);
    }
  });

  it("provider allowlist blocks non-allowlisted recipients before network access", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const previous = snapshotEnv(providerEnvKeys);
    setSandboxEnv({ allowlist: "line:U123" });

    try {
      const guard = validateProviderOutboundGuard(lineGuard({ recipientId: "U999" }));
      expect(guard.allowed).toBe(false);
      expect(guard.reason).toBe("recipient_not_allowlisted");
      expect(() => assertProviderOutboundAllowed(lineGuard({ recipientId: "U999" }))).toThrow("recipient_not_allowlisted");
      await expect(sendLineTextMessage({
        to: "U999",
        text: "hello",
        tenantId: tenantIdForTest,
        channelAccountTenantId: tenantIdForTest
      })).rejects.toThrow("recipient_not_allowlisted");
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      restoreEnvSnapshot(previous);
      fetchSpy.mockRestore();
    }
  });

  it("provider allowlist allows only an explicitly allowlisted test recipient in sandbox logic", () => {
    const previous = snapshotEnv(providerEnvKeys);
    setSandboxEnv({ allowlist: "line:U123,telegram:55201" });

    try {
      expect(validateProviderOutboundGuard(lineGuard()).allowed).toBe(true);
      expect(validateProviderOutboundGuard(lineGuard({ provider: "telegram", recipientId: "55201" })).allowed).toBe(true);
      expect(validateProviderOutboundGuard(lineGuard({ provider: "facebook", recipientId: "fb-user-381" })).reason).toBe("recipient_not_allowlisted");
    } finally {
      restoreEnvSnapshot(previous);
    }
  });

  it("provider wildcard 'telegram:*' allows any telegram recipient but not other providers", () => {
    const previous = snapshotEnv(providerEnvKeys);
    setSandboxEnv({ allowlist: "telegram:*", meta: true });

    try {
      expect(validateProviderOutboundGuard(lineGuard({ provider: "telegram", recipientId: "999888777" })).allowed).toBe(true);
      expect(validateProviderOutboundGuard(lineGuard({ provider: "telegram", recipientId: "brand-new-chat-id" })).allowed).toBe(true);
      expect(validateProviderOutboundGuard(lineGuard({ provider: "line", recipientId: "U123" })).reason).toBe("recipient_not_allowlisted");
    } finally {
      restoreEnvSnapshot(previous);
    }
  });

  it("bare wildcard '*' allows every provider and recipient", () => {
    const previous = snapshotEnv(providerEnvKeys);
    setSandboxEnv({ allowlist: "*", meta: true });

    try {
      expect(validateProviderOutboundGuard(lineGuard({ provider: "line", recipientId: "U-anything" })).allowed).toBe(true);
      expect(validateProviderOutboundGuard(lineGuard({ provider: "telegram", recipientId: "any-chat" })).allowed).toBe(true);
      expect(validateProviderOutboundGuard(lineGuard({ provider: "facebook", recipientId: "fb-anyone" })).allowed).toBe(true);
      expect(validateProviderOutboundGuard(lineGuard({ provider: "instagram", recipientId: "ig-anyone" })).allowed).toBe(true);
    } finally {
      restoreEnvSnapshot(previous);
    }
  });

  it("per-provider wildcard 'TELEGRAM_SANDBOX_ALLOWLIST=*' allows any telegram recipient", () => {
    const previous = snapshotEnv(providerEnvKeys);
    clearProviderEnv();
    process.env.PROVIDER_OUTBOUND_MODE = "real";
    process.env.PROVIDER_OUTBOUND_ENABLED = "true";
    process.env.PROVIDER_SANDBOX_MODE = "enabled";
    process.env.CHANNEL_MODE = "real";
    process.env.TELEGRAM_SANDBOX_ALLOWLIST = "*";

    try {
      expect(validateProviderOutboundGuard(lineGuard({ provider: "telegram", recipientId: "55201" })).allowed).toBe(true);
      expect(validateProviderOutboundGuard(lineGuard({ provider: "telegram", recipientId: "never-seen-before" })).allowed).toBe(true);
      expect(validateProviderOutboundGuard(lineGuard({ provider: "line", recipientId: "U123" })).reason).toBe("recipient_not_allowlisted");
    } finally {
      restoreEnvSnapshot(previous);
    }
  });

  it("without a wildcard, non-allowlisted recipients stay blocked (existing behavior preserved)", () => {
    const previous = snapshotEnv(providerEnvKeys);
    setSandboxEnv({ allowlist: "telegram:55201" });

    try {
      expect(validateProviderOutboundGuard(lineGuard({ provider: "telegram", recipientId: "55201" })).allowed).toBe(true);
      expect(validateProviderOutboundGuard(lineGuard({ provider: "telegram", recipientId: "55202" })).reason).toBe("recipient_not_allowlisted");
    } finally {
      restoreEnvSnapshot(previous);
    }
  });

  it("real LINE sender is disabled by default even when a token-like value exists", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const previous = snapshotEnv(providerEnvKeys);
    clearProviderEnv();
    process.env.LINE_CHANNEL_ACCESS_TOKEN = "fake-line-token-for-test";

    try {
      await expect(sendLineTextMessage({
        to: "U123",
        text: "hello",
        tenantId: tenantIdForTest,
        channelAccountTenantId: tenantIdForTest
      })).rejects.toThrow("provider_outbound_disabled");
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      restoreEnvSnapshot(previous);
      fetchSpy.mockRestore();
    }
  });

  it("real LINE sender requires a token only after sandbox gates pass", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const previous = snapshotEnv(providerEnvKeys);
    setSandboxEnv({ allowlist: "line:U123" });
    delete process.env.LINE_CHANNEL_ACCESS_TOKEN;

    try {
      await expect(sendLineTextMessage({
        to: "U123",
        text: "hello",
        tenantId: tenantIdForTest,
        channelAccountTenantId: tenantIdForTest
      })).rejects.toThrow("LINE_CHANNEL_ACCESS_TOKEN is required");
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      restoreEnvSnapshot(previous);
      fetchSpy.mockRestore();
    }
  });

  it("real Telegram sender requires a token only after sandbox gates pass", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const previous = snapshotEnv(providerEnvKeys);
    setSandboxEnv({ allowlist: "telegram:55201" });
    delete process.env.TELEGRAM_BOT_TOKEN;

    try {
      await expect(sendTelegramTextMessage({
        chatId: "55201",
        text: "hello",
        tenantId: tenantIdForTest,
        channelAccountTenantId: tenantIdForTest
      })).rejects.toThrow("TELEGRAM_BOT_TOKEN is required");
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      restoreEnvSnapshot(previous);
      fetchSpy.mockRestore();
    }
  });

  it("real Facebook sender requires a token only after sandbox gates pass", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const previous = snapshotEnv(providerEnvKeys);
    setSandboxEnv({ allowlist: "facebook:fb-user-381", meta: true });
    delete process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

    try {
      await expect(sendFacebookTextMessage({
        recipientId: "fb-user-381",
        text: "hello",
        tenantId: tenantIdForTest,
        channelAccountTenantId: tenantIdForTest
      })).rejects.toThrow("FACEBOOK_PAGE_ACCESS_TOKEN is required");
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      restoreEnvSnapshot(previous);
      fetchSpy.mockRestore();
    }
  });

  it("real Instagram sender requires a token only after sandbox gates pass", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const previous = snapshotEnv(providerEnvKeys);
    setSandboxEnv({ allowlist: "instagram:ig-user-mint", meta: true });
    delete process.env.INSTAGRAM_ACCESS_TOKEN;

    try {
      await expect(sendInstagramTextMessage({
        recipientId: "ig-user-mint",
        text: "hello",
        tenantId: tenantIdForTest,
        channelAccountTenantId: tenantIdForTest
      })).rejects.toThrow("INSTAGRAM_ACCESS_TOKEN is required");
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      restoreEnvSnapshot(previous);
      fetchSpy.mockRestore();
    }
  });

  it("blocks outbound media senders when the allowlist is empty", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const previous = snapshotEnv(providerEnvKeys);
    clearProviderEnv();

    try {
      await expect(sendTelegramMediaMessage({
        chatId: "55201",
        mediaType: "image",
        url: "https://cdn.example.com/photo.png",
        tenantId: tenantIdForTest,
        channelAccountTenantId: tenantIdForTest
      })).rejects.toThrow("provider_outbound_disabled");

      await expect(sendLineMediaMessage({
        to: "U123",
        mediaType: "image",
        url: "https://cdn.example.com/photo.png",
        tenantId: tenantIdForTest,
        channelAccountTenantId: tenantIdForTest
      })).rejects.toThrow("provider_outbound_disabled");

      await expect(sendMetaMediaMessage({
        provider: "facebook",
        recipientId: "fb-user-381",
        mediaType: "image",
        url: "https://cdn.example.com/photo.png",
        tenantId: tenantIdForTest,
        channelAccountTenantId: tenantIdForTest
      })).rejects.toThrow("provider_outbound_disabled");

      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      restoreEnvSnapshot(previous);
      fetchSpy.mockRestore();
    }
  });

  it("blocks outbound media to non-allowlisted recipients before network access", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const previous = snapshotEnv(providerEnvKeys);
    setSandboxEnv({ allowlist: "telegram:55201" });

    try {
      await expect(sendTelegramMediaMessage({
        chatId: "99999",
        mediaType: "file",
        url: "https://cdn.example.com/quote.pdf",
        filename: "quote.pdf",
        tenantId: tenantIdForTest,
        channelAccountTenantId: tenantIdForTest
      })).rejects.toThrow("recipient_not_allowlisted");
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      restoreEnvSnapshot(previous);
      fetchSpy.mockRestore();
    }
  });
});

const tenantIdForTest = "00000000-0000-4000-8000-000000000001";

const providerEnvKeys = [
  "CHANNEL_MODE",
  "META_CHANNEL_MODE",
  "AI_MODE",
  "PROVIDER_OUTBOUND_MODE",
  "PROVIDER_OUTBOUND_ENABLED",
  "PROVIDER_SANDBOX_MODE",
  "PROVIDER_SANDBOX_ALLOWLIST",
  "LINE_SANDBOX_ALLOWLIST",
  "TELEGRAM_SANDBOX_ALLOWLIST",
  "FACEBOOK_SANDBOX_ALLOWLIST",
  "INSTAGRAM_SANDBOX_ALLOWLIST",
  "LINE_CHANNEL_ACCESS_TOKEN",
  "TELEGRAM_BOT_TOKEN",
  "FACEBOOK_PAGE_ACCESS_TOKEN",
  "INSTAGRAM_ACCESS_TOKEN"
];

function lineGuard(overrides: Partial<Parameters<typeof validateProviderOutboundGuard>[0]> = {}) {
  return {
    provider: "line" as const,
    recipientId: "U123",
    tenantId: tenantIdForTest,
    channelAccountTenantId: tenantIdForTest,
    ...overrides
  };
}

function setSandboxEnv(options: { allowlist: string; meta?: boolean }) {
  clearProviderEnv();
  process.env.PROVIDER_OUTBOUND_MODE = "real";
  process.env.PROVIDER_OUTBOUND_ENABLED = "true";
  process.env.PROVIDER_SANDBOX_MODE = "enabled";
  process.env.PROVIDER_SANDBOX_ALLOWLIST = options.allowlist;
  process.env.CHANNEL_MODE = "real";
  if (options.meta) {
    process.env.META_CHANNEL_MODE = "real";
  }
}

function clearProviderEnv() {
  for (const key of providerEnvKeys) {
    delete process.env[key];
  }
}

function snapshotEnv(keys: string[]) {
  return new Map(keys.map((key) => [key, process.env[key]]));
}

function restoreEnvSnapshot(values: Map<string, string | undefined>) {
  for (const [key, value] of values) {
    if (value === undefined) {
      delete process.env[key];
      continue;
    }
    process.env[key] = value;
  }
}
