export type OutboundPlatform = "webchat" | "telegram" | "line" | "facebook" | "instagram";
export type OutboundSendStatus = "queued_mock" | "sent_mock" | "skipped_mock" | "failed_mock";

export type OutboundTextInput = {
  platform: OutboundPlatform;
  channelAccountId: string;
  externalConversationId?: string | null;
  externalUserId: string;
  text: string;
};

export type MockSendResult = {
  status: OutboundSendStatus;
  platform: OutboundPlatform;
  channelAccountId: string;
  externalUserId: string;
  externalConversationId?: string | null;
  mockMessageId: string;
  error?: string;
};

export async function sendMockOutboundText(input: OutboundTextInput): Promise<MockSendResult> {
  if (!input.text.trim()) {
    return {
      status: "failed_mock",
      platform: input.platform,
      channelAccountId: input.channelAccountId,
      externalUserId: input.externalUserId,
      externalConversationId: input.externalConversationId,
      mockMessageId: `mock-failed-${Date.now()}`,
      error: "Cannot send an empty outbound message in mock mode"
    };
  }

  return {
    status: "sent_mock",
    platform: input.platform,
    channelAccountId: input.channelAccountId,
    externalUserId: input.externalUserId,
    externalConversationId: input.externalConversationId,
    mockMessageId: `mock-${input.platform}-${Date.now()}`
  };
}

export async function sendLineTextMessage(input: { token?: string | null; to: string; text: string }) {
  const token = input.token ?? process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    throw new Error("LINE_CHANNEL_ACCESS_TOKEN is required to send a real LINE message");
  }

  const response = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      to: input.to,
      messages: [{ type: "text", text: input.text }]
    })
  });

  if (!response.ok) {
    throw new Error(`LINE push failed: ${response.status} ${await response.text()}`);
  }
}

export async function sendTelegramTextMessage(input: { token?: string | null; chatId: string; text: string }) {
  const token = input.token ?? process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN is required to send a real Telegram message");
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: input.chatId,
      text: input.text
    })
  });

  if (!response.ok) {
    throw new Error(`Telegram sendMessage failed: ${response.status} ${await response.text()}`);
  }
}

export async function sendFacebookTextMessage(input: { token?: string | null; recipientId: string; text: string }) {
  const token = input.token ?? process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  if (!token) {
    throw new Error("FACEBOOK_PAGE_ACCESS_TOKEN is required to send a real Facebook message");
  }

  const response = await fetch("https://graph.facebook.com/v19.0/me/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      recipient: { id: input.recipientId },
      message: { text: input.text }
    })
  });

  if (!response.ok) {
    throw new Error(`Facebook sendMessage failed: ${response.status} ${await response.text()}`);
  }
}

export async function sendInstagramTextMessage(input: { token?: string | null; recipientId: string; text: string }) {
  const token = input.token ?? process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) {
    throw new Error("INSTAGRAM_ACCESS_TOKEN is required to send a real Instagram message");
  }

  const response = await fetch("https://graph.facebook.com/v19.0/me/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      recipient: { id: input.recipientId },
      message: { text: input.text },
      messaging_type: "RESPONSE"
    })
  });

  if (!response.ok) {
    throw new Error(`Instagram sendMessage failed: ${response.status} ${await response.text()}`);
  }
}

export function channelMode() {
  return (process.env.META_CHANNEL_MODE ?? process.env.CHANNEL_MODE ?? process.env.AI_MODE ?? "mock").toLowerCase();
}

export function providerOutboundMode() {
  return (process.env.PROVIDER_OUTBOUND_MODE ?? "disabled").toLowerCase();
}

export function shouldUseRealChannelSend() {
  return providerOutboundMode() === "real" && channelMode() === "real";
}
