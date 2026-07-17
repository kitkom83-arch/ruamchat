import { describe, expect, it } from "vitest";
import { NormalizerService } from "./normalizer.service.js";

const account = {
  id: "00000000-0000-4000-8000-000000000021",
  tenantId: "00000000-0000-4000-8000-000000000001",
  platform: "telegram",
  displayName: "Bot 007237",
  externalAccountId: "bot-007237",
  accountKey: null,
  accessTokenCiphertext: null,
  webhookSecret: null,
  status: "active",
  createdAt: new Date(),
  updatedAt: new Date()
} as const;

describe("NormalizerService", () => {
  const service = new NormalizerService();

  it("normalizes Telegram private messages", () => {
    const normalized = service.telegram(account, {
      update_id: 1001,
      message: {
        message_id: 42,
        date: 1710000000,
        text: "สวัสดี",
        from: { id: 123, first_name: "Somchai" },
        chat: { id: 123, type: "private" }
      }
    });

    expect(normalized?.platform).toBe("telegram");
    expect(normalized?.externalUserId).toBe("123");
    expect(normalized?.externalConversationId).toBe("123");
    expect(normalized?.externalMessageId).toBe("42");
    expect(normalized?.platformMessageId).toBe("1001");
    expect(normalized?.direction).toBe("inbound");
    expect(normalized?.senderType).toBe("customer");
  });

  it("captures Telegram photo attachments with the largest file reference", () => {
    const normalized = service.telegram(account, {
      update_id: 1002,
      message: {
        message_id: 43,
        date: 1710000001,
        from: { id: 123, first_name: "Somchai" },
        chat: { id: 123, type: "private" },
        photo: [
          { file_id: "small-id", file_size: 1024 },
          { file_id: "large-id", file_size: 8192 }
        ]
      }
    });

    expect(normalized?.messageType).toBe("image");
    expect(normalized?.attachments).toHaveLength(1);
    expect(normalized?.attachments?.[0]).toMatchObject({
      type: "image",
      storageKey: "telegram:large-id",
      externalRef: "large-id",
      sizeBytes: 8192
    });
  });

  it("captures Telegram document attachments with filename and mime", () => {
    const normalized = service.telegram(account, {
      update_id: 1003,
      message: {
        message_id: 44,
        date: 1710000002,
        from: { id: 123, first_name: "Somchai" },
        chat: { id: 123, type: "private" },
        document: { file_id: "doc-id", file_name: "quote.pdf", mime_type: "application/pdf", file_size: 2048 }
      }
    });

    expect(normalized?.messageType).toBe("file");
    expect(normalized?.attachments?.[0]).toMatchObject({
      type: "file",
      filename: "quote.pdf",
      mimeType: "application/pdf",
      storageKey: "telegram:doc-id",
      externalRef: "doc-id"
    });
  });

  it("normalizes lightweight Telegram demo payloads without update_id", () => {
    const normalized = service.telegram(account, {
      message: {
        message_id: "tg-msg-001",
        text: "telegram test message",
        chat: { id: "tg-user-1", first_name: "Krit" }
      }
    });

    expect(normalized).toMatchObject({
      platform: "telegram",
      externalUserId: "tg-user-1",
      externalConversationId: "tg-user-1",
      externalMessageId: "tg-msg-001",
      platformMessageId: "tg-msg-001",
      text: "telegram test message"
    });
  });

  it("normalizes LINE text events", () => {
    const lineAccount = { ...account, platform: "line" as const };
    const normalized = service.line(lineAccount, {
      events: [{
        type: "message",
        webhookEventId: "line-event-1",
        timestamp: 1710000000000,
        replyToken: "reply-token",
        source: { type: "user", userId: "U123" },
        message: { id: "line-msg-1", type: "text", text: "ราคาเท่าไร" }
      }]
    });

    expect(normalized).toHaveLength(1);
    expect(normalized[0].platform).toBe("line");
    expect(normalized[0].messageType).toBe("text");
    expect(normalized[0].externalUserId).toBe("U123");
    expect(normalized[0].externalConversationId).toBe("U123");
    expect(normalized[0].externalMessageId).toBe("line-msg-1");
    expect(normalized[0].platformMessageId).toBe("line-event-1");
    expect(normalized[0].text).toBe("ราคาเท่าไร");
  });

  it("normalizes Facebook Messenger text events", () => {
    const facebookAccount = {
      ...account,
      id: "00000000-0000-4000-8000-000000000023",
      platform: "facebook" as const,
      displayName: "Page หลัก"
    };
    const normalized = service.facebook(facebookAccount, {
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
    });

    expect(normalized).toHaveLength(1);
    expect(normalized[0]).toMatchObject({
      platform: "facebook",
      externalUserId: "fb-user-381",
      externalConversationId: "fb-user-381",
      externalMessageId: "fb-mid-0001",
      platformMessageId: "fb-mid-0001",
      messageType: "text",
      text: "ขอราคาแพ็กเกจผ่าน Facebook"
    });
  });

  it("normalizes Instagram DM and comment events", () => {
    const instagramAccount = {
      ...account,
      id: "00000000-0000-4000-8000-000000000024",
      platform: "instagram" as const,
      displayName: "IG ร้านค้า"
    };
    const normalized = service.instagram(instagramAccount, {
      object: "instagram",
      entry: [{
        id: "ig-shop",
        time: 1779236400000,
        messaging: [{
          sender: { id: "ig-user-mint" },
          recipient: { id: "ig-shop" },
          timestamp: 1779236400000,
          message: { mid: "ig-mid-0001", text: "ส่งรูปสินค้าใน DM แล้ว ขอราคา wholesale" }
        }],
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
    });

    expect(normalized).toHaveLength(2);
    expect(normalized[0]).toMatchObject({
      platform: "instagram",
      externalUserId: "ig-user-mint",
      externalConversationId: "ig-user-mint",
      externalMessageId: "ig-mid-0001",
      platformMessageId: "ig-mid-0001"
    });
    expect(normalized[1]).toMatchObject({
      platform: "instagram",
      externalUserId: "ig-user-commenter",
      externalConversationId: "ig-media-0001",
      externalMessageId: "ig-comment-0001",
      platformMessageId: "ig-comment-0001",
      messageType: "text"
    });
    expect(normalized[1].rawPayload).toMatchObject({ sourceSubtype: "comment" });
  });
});
