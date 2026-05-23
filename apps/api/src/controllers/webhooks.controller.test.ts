import { NotFoundException, UnauthorizedException } from "@nestjs/common";
import { describe, expect, it, vi, afterEach } from "vitest";
import { ChannelAccountsService } from "../services/channel-accounts.service.js";
import { NormalizerService } from "../services/normalizer.service.js";
import { WebhooksController } from "./webhooks.controller.js";

const tenantId = "00000000-0000-4000-8000-000000000001";
const telegramAccount = {
  id: "00000000-0000-4000-8000-000000000021",
  tenantId,
  platform: "telegram",
  displayName: "Bot 007237",
  externalAccountId: "bot-007237",
  accountKey: null,
  accessTokenCiphertext: null,
  webhookSecret: "mock-telegram-secret",
  status: "active",
  createdAt: new Date(),
  updatedAt: new Date()
} as const;
const lineAccount = {
  ...telegramAccount,
  id: "00000000-0000-4000-8000-000000000022",
  platform: "line" as const,
  displayName: "LINE OA Main",
  externalAccountId: "line-oa-main",
  webhookSecret: "mock-line-secret"
};
const facebookAccount = {
  ...telegramAccount,
  id: "00000000-0000-4000-8000-000000000023",
  platform: "facebook" as const,
  displayName: "Page หลัก",
  externalAccountId: "facebook-page-main",
  webhookSecret: null
};
const instagramAccount = {
  ...telegramAccount,
  id: "00000000-0000-4000-8000-000000000024",
  platform: "instagram" as const,
  displayName: "IG ร้านค้า",
  externalAccountId: "instagram-shop",
  webhookSecret: null
};
const webchatAccount = {
  ...telegramAccount,
  id: "00000000-0000-4000-8000-000000000020",
  platform: "webchat" as const,
  displayName: "Main Website",
  externalAccountId: "web-main",
  accountKey: "demo-webchat",
  webhookSecret: null
};

const linePayload = {
  events: [{
    type: "message",
    webhookEventId: "line-event-0001",
    timestamp: 1779236400000,
    source: { type: "user", userId: "UlineCustomer001" },
    replyToken: "mock-reply-token",
    message: { id: "line-msg-0001", type: "text", text: "ขอราคาแพ็กเกจ Pro ผ่าน LINE" }
  }]
};

const telegramPayload = {
  update_id: 7001,
  message: {
    message_id: 42,
    date: 1779236400,
    text: "ขอราคาแพ็กเกจ Pro ผ่าน Telegram",
    from: { id: 55201, first_name: "Krit" },
    chat: { id: 55201, type: "private" }
  }
};
const facebookPayload = {
  object: "page",
  entry: [{
    id: "fb-page-main",
    time: 1779236400000,
    messaging: [{
      sender: { id: "fb-user-381" },
      recipient: { id: "fb-page-main" },
      timestamp: 1779236400000,
      message: { mid: "fb-mid-0001", text: "ขอราคาแพ็กเกจผ่าน Facebook" }
    }]
  }]
};
const instagramDmPayload = {
  object: "instagram",
  entry: [{
    id: "ig-shop",
    time: 1779236400000,
    messaging: [{
      sender: { id: "ig-user-mint" },
      recipient: { id: "ig-shop" },
      timestamp: 1779236400000,
      message: { mid: "ig-mid-0001", text: "ส่งรูปสินค้าใน DM แล้ว ขอราคา wholesale" }
    }]
  }]
};
const instagramCommentPayload = {
  object: "instagram",
  entry: [{
    id: "ig-shop",
    time: 1779236400000,
    changes: [{
      field: "comments",
      value: {
        id: "ig-comment-0001",
        text: "สนใจสินค้าชิ้นนี้ ราคาเท่าไร",
        from: { id: "ig-user-commenter", username: "buyer_demo" },
        media: { id: "ig-media-0001" }
      }
    }]
  }]
};

function buildController() {
  const realAccounts = new ChannelAccountsService({} as never);
  const conversations = {
    seen: new Set<string>(),
    ingest: vi.fn(async (message) => {
      const duplicate = conversations.seen.has(message.platformMessageId);
      conversations.seen.add(message.platformMessageId);
      return {
        duplicate,
        conversation: { id: `${message.platform}-${message.channelAccountId}` },
        message: { id: message.platformMessageId }
      };
    })
  };
  const accounts = {
    byId: vi.fn(async (_id: string, platform: string) => {
      if (_id === "unknown-account") throw new NotFoundException("Unknown channel account");
      if (platform === "line") return lineAccount;
      if (platform === "facebook") return facebookAccount;
      if (platform === "instagram") return instagramAccount;
      return telegramAccount;
    }),
    byWebchatKey: vi.fn(),
    verifyLineSignature: realAccounts.verifyLineSignature.bind(realAccounts),
    verifyTelegramSecret: realAccounts.verifyTelegramSecret.bind(realAccounts),
    verifyMetaWebhook: realAccounts.verifyMetaWebhook.bind(realAccounts),
    verifyMetaSignature: realAccounts.verifyMetaSignature.bind(realAccounts)
  };

  return {
    controller: new WebhooksController(accounts as never, new NormalizerService(), conversations as never),
    conversations
  };
}

afterEach(() => {
  delete process.env.CHANNEL_MODE;
  delete process.env.AI_MODE;
  delete process.env.META_CHANNEL_MODE;
  delete process.env.META_VERIFY_TOKEN;
  delete process.env.META_APP_SECRET;
});

describe("WebhooksController LINE and Telegram", () => {
  it("accepts Webchat inbound messages and marks duplicate message ids", async () => {
    const { controller, conversations } = buildController();
    const accounts = (controller as unknown as { accounts: { byWebchatKey: ReturnType<typeof vi.fn> } }).accounts;
    accounts.byWebchatKey.mockResolvedValue(webchatAccount);
    const payload = {
      visitorId: "visitor-demo",
      sessionId: "webchat-demo-session",
      messageId: "webchat-msg-0001",
      text: "สนใจแพ็กเกจผ่าน Webchat",
      timestamp: "2026-05-21T04:00:00.000Z"
    };

    const first = await controller.webchat("demo-webchat", payload);
    const second = await controller.webchat("demo-webchat", payload);

    expect(first).toMatchObject({ accepted: true, conversationId: `webchat-${webchatAccount.id}`, messageId: "webchat-msg-0001", duplicate: false });
    expect(second.duplicate).toBe(true);
    expect(conversations.ingest).toHaveBeenCalledWith(expect.objectContaining({
      platform: "webchat",
      channelAccountId: webchatAccount.id,
      externalUserId: "visitor-demo",
      externalConversationId: "webchat-demo-session",
      platformMessageId: "webchat-msg-0001"
    }));
  });

  it("accepts and normalizes a valid LINE mock webhook", async () => {
    process.env.CHANNEL_MODE = "mock";
    const { controller, conversations } = buildController();

    const result = await controller.line(
      lineAccount.id,
      "mock-line-signature",
      { rawBody: Buffer.from(JSON.stringify(linePayload)) } as never,
      linePayload
    );

    expect(result.accepted).toBe(true);
    expect(result.conversations[0]?.messageId).toBe("line-event-0001");
    expect(conversations.ingest).toHaveBeenCalledWith(expect.objectContaining({
      platform: "line",
      channelAccountId: lineAccount.id,
      externalUserId: "UlineCustomer001",
      externalMessageId: "line-msg-0001",
      platformMessageId: "line-event-0001",
      text: "ขอราคาแพ็กเกจ Pro ผ่าน LINE"
    }));
  });

  it("rejects invalid LINE signature in real mode", async () => {
    process.env.CHANNEL_MODE = "real";
    const { controller } = buildController();

    await expect(controller.line(
      lineAccount.id,
      "invalid-signature",
      { rawBody: Buffer.from(JSON.stringify(linePayload)) } as never,
      linePayload
    )).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("does not create a second message for duplicate LINE webhookEventId", async () => {
    process.env.CHANNEL_MODE = "mock";
    const { controller } = buildController();

    const first = await controller.line(lineAccount.id, "mock-line-signature", { rawBody: Buffer.from("{}") } as never, linePayload);
    const second = await controller.line(lineAccount.id, "mock-line-signature", { rawBody: Buffer.from("{}") } as never, {
      events: [{ ...linePayload.events[0], message: { ...linePayload.events[0].message, id: "line-msg-redelivered" } }]
    });

    expect(first.conversations[0]?.duplicate).toBe(false);
    expect(second.conversations[0]?.duplicate).toBe(true);
  });

  it("accepts and normalizes a valid Telegram mock webhook", async () => {
    process.env.CHANNEL_MODE = "mock";
    const { controller, conversations } = buildController();

    const result = await controller.telegram(telegramAccount.id, "mock-telegram-secret", telegramPayload);

    expect(result.accepted).toBe(true);
    expect(result.messageId).toBe("7001");
    expect(conversations.ingest).toHaveBeenCalledWith(expect.objectContaining({
      platform: "telegram",
      channelAccountId: telegramAccount.id,
      externalUserId: "55201",
      externalConversationId: "55201",
      externalMessageId: "42",
      platformMessageId: "7001",
      text: "ขอราคาแพ็กเกจ Pro ผ่าน Telegram"
    }));
  });

  it("accepts the lightweight Telegram demo payload and returns message id", async () => {
    process.env.CHANNEL_MODE = "mock";
    const { controller, conversations } = buildController();

    const result = await controller.telegram(telegramAccount.id, "mock-telegram-secret", {
      message: {
        message_id: "tg-msg-001",
        chat: { id: "tg-user-1", first_name: "Krit" },
        text: "telegram test message"
      }
    });

    expect(result).toMatchObject({
      accepted: true,
      conversationId: `telegram-${telegramAccount.id}`,
      messageId: "tg-msg-001",
      duplicate: false
    });
    expect(conversations.ingest).toHaveBeenCalledWith(expect.objectContaining({
      platform: "telegram",
      externalUserId: "tg-user-1",
      externalConversationId: "tg-user-1",
      platformMessageId: "tg-msg-001",
      text: "telegram test message"
    }));
  });

  it("rejects invalid Telegram secret", async () => {
    process.env.CHANNEL_MODE = "real";
    const { controller } = buildController();

    await expect(controller.telegram(telegramAccount.id, "wrong-mock-secret", telegramPayload)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("returns Meta webhook challenge for a valid verify token", async () => {
    process.env.META_CHANNEL_MODE = "mock";
    const { controller } = buildController();

    await expect(controller.facebookVerify(facebookAccount.id, "subscribe", "test_verify_token", "fb-challenge-123")).resolves.toBe("fb-challenge-123");
    await expect(controller.instagramVerify(instagramAccount.id, "subscribe", "test_verify_token", "ig-challenge-123")).resolves.toBe("ig-challenge-123");
  });

  it("rejects invalid Meta verify token", async () => {
    process.env.META_CHANNEL_MODE = "mock";
    const { controller } = buildController();

    await expect(controller.facebookVerify(facebookAccount.id, "subscribe", "wrong_verify_token", "fb-challenge-123")).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("accepts valid mock Meta signature and normalizes Facebook text webhook", async () => {
    process.env.META_CHANNEL_MODE = "mock";
    const { controller, conversations } = buildController();

    const result = await controller.facebook(
      facebookAccount.id,
      "mock-meta-signature",
      { rawBody: Buffer.from(JSON.stringify(facebookPayload)) } as never,
      facebookPayload
    );

    expect(result.accepted).toBe(true);
    expect(result.conversations[0]?.messageId).toBe("fb-mid-0001");
    expect(conversations.ingest).toHaveBeenCalledWith(expect.objectContaining({
      platform: "facebook",
      channelAccountId: facebookAccount.id,
      externalUserId: "fb-user-381",
      externalConversationId: "fb-user-381",
      externalMessageId: "fb-mid-0001",
      platformMessageId: "fb-mid-0001",
      text: "ขอราคาแพ็กเกจผ่าน Facebook"
    }));
  });

  it("rejects invalid Meta signature in real mode", async () => {
    process.env.META_CHANNEL_MODE = "real";
    process.env.META_APP_SECRET = "mock-meta-app-secret";
    const { controller } = buildController();

    await expect(controller.facebook(
      facebookAccount.id,
      "sha256=invalid",
      { rawBody: Buffer.from(JSON.stringify(facebookPayload)) } as never,
      facebookPayload
    )).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("does not create a second Facebook message for duplicate message.mid", async () => {
    process.env.META_CHANNEL_MODE = "mock";
    const { controller } = buildController();

    const first = await controller.facebook(facebookAccount.id, "mock-meta-signature", { rawBody: Buffer.from("{}") } as never, facebookPayload);
    const second = await controller.facebook(facebookAccount.id, "mock-meta-signature", { rawBody: Buffer.from("{}") } as never, facebookPayload);

    expect(first.conversations[0]?.duplicate).toBe(false);
    expect(second.conversations[0]?.duplicate).toBe(true);
  });

  it("normalizes Instagram DM and comment webhook events", async () => {
    process.env.META_CHANNEL_MODE = "mock";
    const { controller, conversations } = buildController();

    const dm = await controller.instagram(instagramAccount.id, "mock-meta-signature", { rawBody: Buffer.from("{}") } as never, instagramDmPayload);
    const comment = await controller.instagram(instagramAccount.id, "mock-meta-signature", { rawBody: Buffer.from("{}") } as never, instagramCommentPayload);

    expect(dm.accepted).toBe(true);
    expect(comment.accepted).toBe(true);
    expect(conversations.ingest).toHaveBeenCalledWith(expect.objectContaining({
      platform: "instagram",
      channelAccountId: instagramAccount.id,
      externalUserId: "ig-user-mint",
      externalConversationId: "ig-user-mint",
      externalMessageId: "ig-mid-0001",
      platformMessageId: "ig-mid-0001"
    }));
    expect(conversations.ingest).toHaveBeenCalledWith(expect.objectContaining({
      platform: "instagram",
      externalUserId: "ig-user-commenter",
      externalConversationId: "ig-media-0001",
      externalMessageId: "ig-comment-0001",
      platformMessageId: "ig-comment-0001",
      text: "สนใจสินค้าชิ้นนี้ ราคาเท่าไร"
    }));
  });

  it("returns a readable error for unknown channel accounts", async () => {
    process.env.CHANNEL_MODE = "mock";
    const { controller } = buildController();

    await expect(controller.telegram("unknown-account", "mock-telegram-secret", telegramPayload)).rejects.toThrow("Unknown channel account");
  });

  it("does not create a second Instagram message for duplicate event id", async () => {
    process.env.META_CHANNEL_MODE = "mock";
    const { controller } = buildController();

    const first = await controller.instagram(instagramAccount.id, "mock-meta-signature", { rawBody: Buffer.from("{}") } as never, instagramDmPayload);
    const second = await controller.instagram(instagramAccount.id, "mock-meta-signature", { rawBody: Buffer.from("{}") } as never, instagramDmPayload);

    expect(first.conversations[0]?.duplicate).toBe(false);
    expect(second.conversations[0]?.duplicate).toBe(true);
  });
});
