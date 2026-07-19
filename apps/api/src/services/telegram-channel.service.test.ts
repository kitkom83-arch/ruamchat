import "reflect-metadata";
import { NotFoundException } from "@nestjs/common";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CryptoService } from "./crypto.service.js";
import type { PrismaService } from "./prisma.service.js";
import { TelegramChannelService } from "./telegram-channel.service.js";

const tenantId = "00000000-0000-4000-8000-000000000001";
const channelId = "00000000-0000-4000-8000-000000000021";

const savedEnv = { PUBLIC_BASE_URL: process.env.PUBLIC_BASE_URL, APP_URL: process.env.APP_URL };

function buildService(account: Record<string, unknown> | null) {
  const prisma = {
    channelAccount: {
      findFirst: vi.fn(async () => account)
    }
  } as unknown as PrismaService;
  const crypto = { decrypt: vi.fn((value: string) => value.replace(/^enc:/, "")) } as unknown as CryptoService;
  return { service: new TelegramChannelService(prisma, crypto), prisma, crypto };
}

function telegramAccount(overrides: Record<string, unknown> = {}) {
  return {
    id: channelId,
    tenantId,
    platform: "telegram",
    displayName: "Bot 007237",
    accessTokenCiphertext: "enc:123:ABC",
    webhookSecret: null,
    ...overrides
  };
}

function mockFetchSequence(...responses: unknown[]) {
  const fn = vi.fn();
  for (const body of responses) {
    fn.mockResolvedValueOnce({ status: 200, json: async () => body });
  }
  vi.stubGlobal("fetch", fn);
  return fn;
}

beforeEach(() => {
  process.env.PUBLIC_BASE_URL = "https://chat.bn9.one";
  delete process.env.APP_URL;
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  process.env.PUBLIC_BASE_URL = savedEnv.PUBLIC_BASE_URL;
  process.env.APP_URL = savedEnv.APP_URL;
});

describe("TelegramChannelService", () => {
  it("returns bot info from getMe and never leaks the token", async () => {
    const fetchFn = mockFetchSequence({
      ok: true,
      result: { id: 7237, username: "yindee_bot", first_name: "Yindee", can_join_groups: true }
    });
    const { service } = buildService(telegramAccount());

    const info = await service.getBotInfo(tenantId, channelId);

    expect(info).toEqual({ id: 7237, username: "yindee_bot", firstName: "Yindee", canJoinGroups: true });
    expect(fetchFn.mock.calls[0][0]).toBe("https://api.telegram.org/bot123:ABC/getMe");
    expect(JSON.stringify(info)).not.toContain("123:ABC");
  });

  it("reports token + matching webhook as OK", async () => {
    mockFetchSequence(
      { ok: true, result: { id: 7237, username: "yindee_bot", first_name: "Yindee", can_join_groups: true } },
      {
        ok: true,
        result: {
          url: "https://chat.bn9.one/api/webhooks/telegram/00000000-0000-4000-8000-000000000021",
          pending_update_count: 0
        }
      }
    );
    const { service } = buildService(telegramAccount());

    const result = await service.testConnection(tenantId, channelId, "https://ignored.example");

    expect(result).toMatchObject({
      tokenOk: true,
      webhookOk: true,
      botUsername: "yindee_bot",
      expectedWebhookUrl: "https://chat.bn9.one/api/webhooks/telegram/00000000-0000-4000-8000-000000000021",
      pendingUpdateCount: 0,
      lastErrorMessage: null
    });
  });

  it("flags webhook mismatch and surfaces last error message", async () => {
    mockFetchSequence(
      { ok: true, result: { id: 7237, username: "yindee_bot" } },
      { ok: true, result: { url: "https://old.example/hook", pending_update_count: 3, last_error_message: "boom" } }
    );
    const { service } = buildService(telegramAccount());

    const result = await service.testConnection(tenantId, channelId);

    expect(result.tokenOk).toBe(true);
    expect(result.webhookOk).toBe(false);
    expect(result.currentWebhookUrl).toBe("https://old.example/hook");
    expect(result.lastErrorMessage).toBe("boom");
  });

  it("returns tokenOk=false when getMe rejects the token", async () => {
    mockFetchSequence({ ok: false, description: "Unauthorized" });
    const { service } = buildService(telegramAccount());

    const result = await service.testConnection(tenantId, channelId);

    expect(result.tokenOk).toBe(false);
    expect(result.webhookOk).toBe(false);
    expect(result.lastErrorMessage).toBe("Unauthorized");
  });

  it("returns tokenOk=false without calling Telegram when no token is stored", async () => {
    const fetchFn = mockFetchSequence();
    const { service } = buildService(telegramAccount({ accessTokenCiphertext: null }));

    const result = await service.testConnection(tenantId, channelId);

    expect(result.tokenOk).toBe(false);
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("sets the webhook to the expected url and includes secret_token when configured", async () => {
    const fetchFn = mockFetchSequence({ ok: true, description: "Webhook was set" });
    const { service } = buildService(telegramAccount({ webhookSecret: "s3cr3t" }));

    const result = await service.setWebhook(tenantId, channelId);

    expect(result).toEqual({
      ok: true,
      expectedWebhookUrl: "https://chat.bn9.one/api/webhooks/telegram/00000000-0000-4000-8000-000000000021",
      secretApplied: true,
      description: "Webhook was set"
    });
    const requestBody = JSON.parse((fetchFn.mock.calls[0][1] as { body: string }).body);
    expect(requestBody).toEqual({
      url: "https://chat.bn9.one/api/webhooks/telegram/00000000-0000-4000-8000-000000000021",
      secret_token: "s3cr3t"
    });
  });

  it("throws NotFound when the channel is missing or not telegram", async () => {
    const { service } = buildService(null);
    await expect(service.getBotInfo(tenantId, channelId)).rejects.toBeInstanceOf(NotFoundException);

    const { service: wrongPlatform } = buildService(telegramAccount({ platform: "line" }));
    await expect(wrongPlatform.getBotInfo(tenantId, channelId)).rejects.toBeInstanceOf(NotFoundException);
  });

  it("falls back to the request origin when no public base url env is set", async () => {
    delete process.env.PUBLIC_BASE_URL;
    delete process.env.APP_URL;
    mockFetchSequence({ ok: true, description: "ok" });
    const { service } = buildService(telegramAccount());

    const result = await service.setWebhook(tenantId, channelId, "https://fallback.host");

    expect(result.expectedWebhookUrl).toBe(
      "https://fallback.host/api/webhooks/telegram/00000000-0000-4000-8000-000000000021"
    );
  });
});
