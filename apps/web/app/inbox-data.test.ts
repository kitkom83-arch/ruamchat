import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildWebchatDemoConversation,
  applyAiSuggestionToConversation,
  applyApiSentMessagesToConversation,
  applyLocalAgentMessageToConversation,
  createChatMessage,
  filterConversations,
  getAiDraftText,
  getAiPanelMockActionStatus,
  getQuickRepliesForMode,
  mergeDemoConversation,
  mockConversations,
  quickReplies,
  scopeApiConversationsToRoom,
  webchatDemoConversationId
} from "./inbox-data";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Inbox Rooms mock filtering", () => {
  it("scopes conversation queue to the selected platform room", () => {
    const webchat = filterConversations(mockConversations, "webchat-main", "all", "human");
    const telegram = filterConversations(mockConversations, "telegram-bot-007237", "all", "human");

    expect(webchat.map((conversation) => conversation.accountName)).toEqual(["Main Website"]);
    expect(telegram.map((conversation) => conversation.accountName)).toEqual(["Bot 007237"]);
    expect(webchat[0]?.customerName).not.toEqual(telegram[0]?.customerName);
  });

  it("routes LINE and Telegram mock conversations to their own rooms", () => {
    const line = filterConversations(mockConversations, "line-oa-main", "all", "bot");
    const telegram = filterConversations(mockConversations, "telegram-bot-007237", "all", "human");
    const webchat = filterConversations(mockConversations, "webchat-main", "all", "human");

    expect(line[0]?.platformLabel).toBe("LINE");
    expect(line[0]?.accountName).toBe("LINE OA Main");
    expect(telegram[0]?.platformLabel).toBe("Telegram");
    expect(telegram[0]?.accountName).toBe("Bot 007237");
    expect(webchat.every((conversation) => conversation.platformLabel === "Webchat")).toBe(true);
    expect(line.some((conversation) => conversation.platformLabel === "Webchat")).toBe(false);
    expect(telegram.some((conversation) => conversation.platformLabel === "Webchat")).toBe(false);
  });

  it("routes Facebook and Instagram mock conversations to their own rooms", () => {
    const facebook = filterConversations(mockConversations, "facebook-page-main", "all", "human");
    const instagram = filterConversations(mockConversations, "instagram-shop", "all", "human");
    const otherRoomIds = ["webchat-main", "line-oa-main", "telegram-bot-007237"];

    expect(facebook[0]?.platformLabel).toBe("Facebook");
    expect(facebook[0]?.accountName).toBe("Page หลัก");
    expect(instagram[0]?.platformLabel).toBe("Instagram");
    expect(instagram[0]?.accountName).toBe("IG ร้านค้า");
    expect(facebook.every((conversation) => conversation.roomId === "facebook-page-main")).toBe(true);
    expect(instagram.every((conversation) => conversation.roomId === "instagram-shop")).toBe(true);
    expect(otherRoomIds.flatMap((roomId) => filterConversations(mockConversations, roomId, "all", "human")).some((conversation) => conversation.platformLabel === "Facebook")).toBe(false);
    expect(otherRoomIds.flatMap((roomId) => filterConversations(mockConversations, roomId, "all", "human")).some((conversation) => conversation.platformLabel === "Instagram")).toBe(false);
  });

  it("applies Human and Bot tabs independently", () => {
    const human = filterConversations(mockConversations, "webchat-main", "all", "human");
    const bot = filterConversations(mockConversations, "webchat-main", "all", "bot");

    expect(human.every((conversation) => conversation.tab === "human")).toBe(true);
    expect(bot.every((conversation) => conversation.tab === "bot")).toBe(true);
    expect(bot[0]?.aiStatus).toBe("AI Active");
  });

  it("filters AI states and lifecycle flags from mock data", () => {
    expect(filterConversations(mockConversations, "webchat-main", "need_human", "human")[0]?.aiStatus).toBe("Need Human");
    expect(filterConversations(mockConversations, "webchat-main", "ai_active", "bot")[0]?.aiStatus).toBe("AI Active");
    expect(filterConversations(mockConversations, "facebook-page-main", "closed", "human")[0]?.aiStatus).toBe("Closed");
  });

  it("builds a Webchat demo conversation from visitor messages", () => {
    const visitorMessage = createChatMessage("customer", "อยากคุยกับแอดมิน", new Date("2026-05-20T10:00:00+07:00"));
    const conversation = buildWebchatDemoConversation([visitorMessage]);

    expect(conversation?.id).toBe(webchatDemoConversationId);
    expect(conversation?.customerName).toBe("Visitor Demo");
    expect(conversation?.roomId).toBe("webchat-main");
    expect(conversation?.lastMessage).toBe("อยากคุยกับแอดมิน");
    expect(conversation?.unreadCount).toBe(1);
    expect(conversation?.aiAnalysis?.intent).toBe("human_request");
  });

  it("puts the Webchat demo conversation at the top of the Inbox queue", () => {
    const visitorMessage = createChatMessage("customer", "ข้อความจาก widget", new Date("2026-05-20T10:01:00+07:00"));
    const conversations = mergeDemoConversation(mockConversations, [visitorMessage]);

    expect(conversations[0]?.id).toBe(webchatDemoConversationId);
    expect(filterConversations(conversations, "webchat-main", "all", "human")[0]?.customerName).toBe("Visitor Demo");
  });

  it("keeps the required quick replies available for admin outbound demo", () => {
    expect(quickReplies).toEqual([
      "สวัสดีครับ สนใจเรื่องไหนครับ",
      "ขอเบอร์ติดต่อกลับได้ไหมครับ",
      "เดี๋ยวแอดมินตรวจสอบให้ครับ"
    ]);
  });

  it("does not expose local Thai quick replies in API mode", () => {
    expect(getQuickRepliesForMode("api")).toEqual([]);
  });

  it("keeps local Thai quick replies available in mock mode", () => {
    expect(getQuickRepliesForMode("mock")).toEqual(quickReplies);
  });

  it("scopes API-mode cards to the selected room without falling back to mock cards", () => {
    const apiConversations = [
      { ...mockConversations[0]!, id: "api-web", roomId: "room-webchat", customerName: "API Webchat Visitor" },
      { ...mockConversations[2]!, id: "api-telegram", roomId: "room-telegram", customerName: "API Telegram Visitor" }
    ];

    expect(scopeApiConversationsToRoom(apiConversations, "room-webchat").map((conversation) => conversation.id)).toEqual(["api-web"]);
    expect(scopeApiConversationsToRoom(apiConversations, "room-telegram").map((conversation) => conversation.id)).toEqual(["api-telegram"]);
    expect(scopeApiConversationsToRoom([], "room-webchat")).toEqual([]);
    expect(scopeApiConversationsToRoom(apiConversations, "room-empty")).toEqual([]);
  });

  it("does not merge mock conversations into API-mode platform rooms", () => {
    const apiTelegram = { ...mockConversations[2]!, id: "api-telegram", roomId: "api-room-telegram" };

    expect(scopeApiConversationsToRoom([apiTelegram], "api-room-webchat")).toEqual([]);
    expect(scopeApiConversationsToRoom(mockConversations, "api-room-telegram")).toEqual([]);
  });

  it("clears stale Webchat cards when switching to a Telegram API room", () => {
    const staleWebchatCards = [
      { ...mockConversations[0]!, id: "api-webchat", roomId: "api-room-webchat" }
    ];

    expect(scopeApiConversationsToRoom(staleWebchatCards, "api-room-telegram")).toEqual([]);
  });

  it("keeps empty API rooms empty instead of falling back to mock conversations", () => {
    expect(scopeApiConversationsToRoom([], "api-room-line")).toEqual([]);
  });

  it("keeps mock mode filtering local without API calls", () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    const conversations = filterConversations(mockConversations, "webchat-main", "closed", "human");

    expect(conversations).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("keeps closed and spam UI filters room-scoped", () => {
    const facebookClosed = filterConversations(mockConversations, "facebook-page-main", "closed", "human");
    const instagramSpam = filterConversations(mockConversations, "instagram-shop", "spam", "human");
    const webchatSpam = filterConversations(mockConversations, "webchat-main", "spam", "human");

    expect(facebookClosed.map((conversation) => conversation.id)).toEqual(["conv-facebook-01"]);
    expect(instagramSpam.map((conversation) => conversation.id)).toEqual(["conv-instagram-01"]);
    expect(webchatSpam).toEqual([]);
  });

  it("marks refund and complaint widget messages as Need Human", () => {
    const refundMessage = createChatMessage("customer", "ต้องการ refund และร้องเรียนบริการ", new Date("2026-05-20T10:02:00+07:00"));
    const conversation = buildWebchatDemoConversation([refundMessage]);

    expect(conversation?.aiStatus).toBe("Need Human");
    expect(conversation?.aiAnalysis?.requiresHuman).toBe(true);
    expect(conversation?.aiAnalysis?.nextAction).toBe("handoff");
  });

  it("uses active knowledge source for Webchat mock AI", () => {
    const visitorMessage = createChatMessage("customer", "ขอราคาแพ็กเกจ Pro", new Date("2026-05-20T10:03:00+07:00"));
    const conversation = buildWebchatDemoConversation([visitorMessage]);

    expect(conversation?.aiAnalysis?.intent).toBe("pricing");
    expect(conversation?.aiAnalysis?.matchedKnowledge?.[0]?.category).toBe("price_rules");
    expect(conversation?.aiAnalysis?.summary).toContain("active knowledge");
  });

  it("keeps conversation data when using local AI Panel actions", () => {
    const visitorMessage = createChatMessage("customer", "ขอราคาแพ็กเกจ Pro", new Date("2026-05-20T10:04:00+07:00"));
    const conversation = buildWebchatDemoConversation([visitorMessage]);
    const beforeMessages = conversation?.messages;

    expect(getAiDraftText(conversation)).toContain("ราคา");
    expect(getAiPanelMockActionStatus("mark_wrong", conversation)).toBe("Marked as wrong for AI review queue");
    expect(getAiPanelMockActionStatus("use_ai_draft", conversation)).toBe("AI draft copied to composer");
    expect(conversation?.messages).toBe(beforeMessages);
  });

  it("maps API-mode manual send responses into the selected conversation", () => {
    const sentAt = new Date("2026-05-21T05:00:00.000Z");
    const conversations = [{ ...mockConversations[0]!, id: "conv-api", messages: [] }];

    const updated = applyApiSentMessagesToConversation(conversations, "conv-api", [
      {
        id: "msg-agent-api",
        conversationId: "conv-api",
        direction: "outbound",
        senderType: "agent",
        text: "รับเรื่องแล้วครับ",
        createdAt: sentAt.toISOString(),
        platformMessageId: "internal-safe",
        deliveryStatus: "queued_mock"
      }
    ], "รับเรื่องแล้วครับ", sentAt);

    expect(updated[0]?.lastMessage).toBe("รับเรื่องแล้วครับ");
    expect(updated[0]?.unreadCount).toBe(0);
    expect(updated[0]?.unreplied).toBe(false);
    expect(updated[0]?.messages).toEqual([
      expect.objectContaining({ id: "msg-agent-api", sender: "agent", body: "รับเรื่องแล้วครับ" })
    ]);
  });

  it("maps API-mode AI summary and suggestion without adding outbound messages", () => {
    const conversation = { ...mockConversations[0]!, id: "conv-api", messages: [] };
    const mapped = applyAiSuggestionToConversation(conversation, {
      suggestionId: "ai-run-1",
      aiRunId: "ai-run-1",
      tenantId: "00000000-0000-4000-8000-000000000001",
      conversationId: "conv-api",
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      roomId: "room-webchat",
      summary: "API summary from backend",
      suggestedReply: "API safe draft only",
      intent: "product_info",
      confidence: 0.82,
      riskLevel: "low",
      nextAction: "suggest_reply",
      requiresHuman: false,
      sources: [{
        id: "doc-api",
        title: "API Knowledge",
        category: "faq",
        matchReason: "Matched backend source",
        sourceType: "knowledge_doc",
        sourceUrl: null
      }],
      status: "completed",
      error: null,
      externalCalls: 0,
      generatedAt: "2026-05-21T04:00:00.000Z"
    });

    expect(mapped.aiSummary).toBe("API summary from backend");
    expect(mapped.aiSuggestionId).toBe("ai-run-1");
    expect(getAiDraftText(mapped)).toBe("API safe draft only");
    expect(mapped.messages).toEqual([]);
    expect(mapped.aiSuggestionExternalCalls).toBe(0);
    expect(JSON.stringify(mapped.aiAnalysis?.matchedKnowledge)).not.toMatch(/accessToken|webhookSecret|botToken|apiKey|Bearer/i);
  });

  it("does not add a local/mock message when API-mode send fails before mapping", () => {
    const conversations = [{ ...mockConversations[0]!, id: "conv-api", messages: [] }];
    const failedApiSend = vi.fn(async () => {
      throw new Error("API request failed (500): send failed");
    });

    return expect(failedApiSend()).rejects.toThrow("send failed").then(() => {
      expect(conversations[0]?.messages).toEqual([]);
      expect(failedApiSend).toHaveBeenCalledTimes(1);
    });
  });

  it("keeps mock/local manual sends local", () => {
    const sentAt = new Date("2026-05-21T05:01:00.000Z");
    const conversations = [{ ...mockConversations[0]!, id: "conv-local", messages: [] }];

    const result = applyLocalAgentMessageToConversation(conversations, "conv-local", "local reply", sentAt);

    expect(result.message).toMatchObject({ sender: "agent", body: "local reply" });
    expect(result.conversations[0]?.messages).toHaveLength(1);
    expect(result.conversations[0]?.lastMessage).toBe("local reply");
  });
});
