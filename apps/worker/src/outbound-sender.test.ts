import { describe, expect, it, vi } from "vitest";
import {
  sendFacebookTextMessage,
  sendInstagramTextMessage,
  sendLineTextMessage,
  sendMockOutboundText,
  sendTelegramTextMessage,
  providerOutboundMode,
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
    const previousChannelMode = process.env.CHANNEL_MODE;
    const previousMetaChannelMode = process.env.META_CHANNEL_MODE;
    const previousAiMode = process.env.AI_MODE;
    const previousProviderOutboundMode = process.env.PROVIDER_OUTBOUND_MODE;
    delete process.env.CHANNEL_MODE;
    delete process.env.META_CHANNEL_MODE;
    delete process.env.AI_MODE;
    delete process.env.PROVIDER_OUTBOUND_MODE;

    expect(providerOutboundMode()).toBe("disabled");
    expect(shouldUseRealChannelSend()).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();

    restoreEnv("CHANNEL_MODE", previousChannelMode);
    restoreEnv("META_CHANNEL_MODE", previousMetaChannelMode);
    restoreEnv("AI_MODE", previousAiMode);
    restoreEnv("PROVIDER_OUTBOUND_MODE", previousProviderOutboundMode);
    fetchSpy.mockRestore();
  });

  it("requires an explicit provider outbound mode before real sends", () => {
    const previousChannelMode = process.env.CHANNEL_MODE;
    const previousMetaChannelMode = process.env.META_CHANNEL_MODE;
    const previousAiMode = process.env.AI_MODE;
    const previousProviderOutboundMode = process.env.PROVIDER_OUTBOUND_MODE;
    process.env.CHANNEL_MODE = "real";
    delete process.env.META_CHANNEL_MODE;
    delete process.env.AI_MODE;
    delete process.env.PROVIDER_OUTBOUND_MODE;

    expect(shouldUseRealChannelSend()).toBe(false);

    process.env.PROVIDER_OUTBOUND_MODE = "disabled";
    expect(shouldUseRealChannelSend()).toBe(false);

    process.env.PROVIDER_OUTBOUND_MODE = "real";
    expect(shouldUseRealChannelSend()).toBe(true);

    restoreEnv("CHANNEL_MODE", previousChannelMode);
    restoreEnv("META_CHANNEL_MODE", previousMetaChannelMode);
    restoreEnv("AI_MODE", previousAiMode);
    restoreEnv("PROVIDER_OUTBOUND_MODE", previousProviderOutboundMode);
  });

  it("real LINE sender requires a token before network access", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const previous = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    delete process.env.LINE_CHANNEL_ACCESS_TOKEN;

    await expect(sendLineTextMessage({ to: "U123", text: "hello" })).rejects.toThrow("LINE_CHANNEL_ACCESS_TOKEN is required");
    expect(fetchSpy).not.toHaveBeenCalled();

    restoreEnv("LINE_CHANNEL_ACCESS_TOKEN", previous);
    fetchSpy.mockRestore();
  });

  it("real Telegram sender requires a token before network access", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const previous = process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.TELEGRAM_BOT_TOKEN;

    await expect(sendTelegramTextMessage({ chatId: "123", text: "hello" })).rejects.toThrow("TELEGRAM_BOT_TOKEN is required");
    expect(fetchSpy).not.toHaveBeenCalled();

    restoreEnv("TELEGRAM_BOT_TOKEN", previous);
    fetchSpy.mockRestore();
  });

  it("real Facebook sender requires a token before network access", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const previous = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    delete process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

    await expect(sendFacebookTextMessage({ recipientId: "fb-user-381", text: "hello" })).rejects.toThrow("FACEBOOK_PAGE_ACCESS_TOKEN is required");
    expect(fetchSpy).not.toHaveBeenCalled();

    restoreEnv("FACEBOOK_PAGE_ACCESS_TOKEN", previous);
    fetchSpy.mockRestore();
  });

  it("real Instagram sender requires a token before network access", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const previous = process.env.INSTAGRAM_ACCESS_TOKEN;
    delete process.env.INSTAGRAM_ACCESS_TOKEN;

    await expect(sendInstagramTextMessage({ recipientId: "ig-user-mint", text: "hello" })).rejects.toThrow("INSTAGRAM_ACCESS_TOKEN is required");
    expect(fetchSpy).not.toHaveBeenCalled();

    restoreEnv("INSTAGRAM_ACCESS_TOKEN", previous);
    fetchSpy.mockRestore();
  });
});

function restoreEnv(key: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[key];
    return;
  }
  process.env[key] = value;
}
