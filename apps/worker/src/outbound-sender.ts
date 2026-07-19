import {
  type ProviderSandboxProvider,
  validateProviderSandboxOutbound
} from "@ai-omni/shared";

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

export type ProviderOutboundGuardInput = {
  provider: ProviderSandboxProvider;
  recipientId: string;
  tenantId?: string | null;
  channelAccountId?: string | null;
  channelAccountTenantId?: string | null;
};

type ProviderTextGuardInput = {
  tenantId?: string | null;
  channelAccountId?: string | null;
  channelAccountTenantId?: string | null;
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

export async function sendLineTextMessage(input: { token?: string | null; to: string; text: string } & ProviderTextGuardInput) {
  assertProviderOutboundAllowed({
    provider: "line",
    recipientId: input.to,
    tenantId: input.tenantId,
    channelAccountId: input.channelAccountId,
    channelAccountTenantId: input.channelAccountTenantId
  });

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

export async function sendTelegramTextMessage(input: { token?: string | null; chatId: string; text: string } & ProviderTextGuardInput) {
  assertProviderOutboundAllowed({
    provider: "telegram",
    recipientId: input.chatId,
    tenantId: input.tenantId,
    channelAccountId: input.channelAccountId,
    channelAccountTenantId: input.channelAccountTenantId
  });

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

export async function sendFacebookTextMessage(input: { token?: string | null; recipientId: string; text: string } & ProviderTextGuardInput) {
  assertProviderOutboundAllowed({
    provider: "facebook",
    recipientId: input.recipientId,
    tenantId: input.tenantId,
    channelAccountId: input.channelAccountId,
    channelAccountTenantId: input.channelAccountTenantId
  });

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

export async function sendInstagramTextMessage(input: { token?: string | null; recipientId: string; text: string } & ProviderTextGuardInput) {
  assertProviderOutboundAllowed({
    provider: "instagram",
    recipientId: input.recipientId,
    tenantId: input.tenantId,
    channelAccountId: input.channelAccountId,
    channelAccountTenantId: input.channelAccountTenantId
  });

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

// ---- Quick-reply senders ----
// Native, tappable follow-up buttons attached to an AI auto-reply. Each mirrors
// its text counterpart and stays behind assertProviderOutboundAllowed, so nothing
// leaves the system until the sandbox allowlist is opened. Callers wrap these in
// try/catch so a quick-reply failure never breaks the plain-text auto-reply.

export async function sendLineQuickReply(
  input: { token?: string | null; to: string; text: string; labels: string[] } & ProviderTextGuardInput
) {
  assertProviderOutboundAllowed({
    provider: "line",
    recipientId: input.to,
    tenantId: input.tenantId,
    channelAccountId: input.channelAccountId,
    channelAccountTenantId: input.channelAccountTenantId
  });

  const token = input.token ?? process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    throw new Error("LINE_CHANNEL_ACCESS_TOKEN is required to send a real LINE quick reply");
  }

  const response = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      to: input.to,
      messages: [
        {
          type: "text",
          text: input.text,
          quickReply: {
            items: input.labels.map((label) => ({
              type: "action",
              action: { type: "message", label, text: label }
            }))
          }
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`LINE quick reply push failed: ${response.status} ${await response.text()}`);
  }
}

export async function sendTelegramReplyKeyboard(
  input: {
    token?: string | null;
    chatId: string;
    text: string;
    rows: string[][];
    resizeKeyboard?: boolean;
    oneTimeKeyboard?: boolean;
  } & ProviderTextGuardInput
) {
  assertProviderOutboundAllowed({
    provider: "telegram",
    recipientId: input.chatId,
    tenantId: input.tenantId,
    channelAccountId: input.channelAccountId,
    channelAccountTenantId: input.channelAccountTenantId
  });

  const token = input.token ?? process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN is required to send a real Telegram reply keyboard");
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: input.chatId,
      text: input.text,
      reply_markup: {
        keyboard: input.rows.map((row) => row.map((label) => ({ text: label }))),
        resize_keyboard: input.resizeKeyboard ?? true,
        one_time_keyboard: input.oneTimeKeyboard ?? true
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Telegram reply keyboard failed: ${response.status} ${await response.text()}`);
  }
}

export async function sendMetaQuickReplies(
  input: {
    token?: string | null;
    provider: "facebook" | "instagram";
    recipientId: string;
    text: string;
    labels: string[];
  } & ProviderTextGuardInput
) {
  assertProviderOutboundAllowed({
    provider: input.provider,
    recipientId: input.recipientId,
    tenantId: input.tenantId,
    channelAccountId: input.channelAccountId,
    channelAccountTenantId: input.channelAccountTenantId
  });

  const token =
    input.token ??
    (input.provider === "facebook"
      ? process.env.FACEBOOK_PAGE_ACCESS_TOKEN
      : process.env.INSTAGRAM_ACCESS_TOKEN);
  if (!token) {
    throw new Error(
      `${input.provider === "facebook" ? "FACEBOOK_PAGE_ACCESS_TOKEN" : "INSTAGRAM_ACCESS_TOKEN"} is required to send a real ${input.provider} quick reply`
    );
  }

  const response = await fetch("https://graph.facebook.com/v19.0/me/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      recipient: { id: input.recipientId },
      message: {
        text: input.text,
        quick_replies: input.labels.map((label) => ({
          content_type: "text",
          title: label,
          payload: label
        }))
      },
      ...(input.provider === "instagram" ? { messaging_type: "RESPONSE" } : {})
    })
  });

  if (!response.ok) {
    throw new Error(`${input.provider} quick reply send failed: ${response.status} ${await response.text()}`);
  }
}

// ---- Outbound media senders (STEP 6) ----
// Each mirrors its text counterpart and stays behind assertProviderOutboundAllowed,
// so nothing leaves the system until the sandbox allowlist is opened.

export type OutboundMediaType = "image" | "audio" | "file";

export async function sendTelegramMediaMessage(
  input: {
    token?: string | null;
    chatId: string;
    mediaType: OutboundMediaType;
    url: string;
    filename?: string | null;
    caption?: string | null;
  } & ProviderTextGuardInput
) {
  assertProviderOutboundAllowed({
    provider: "telegram",
    recipientId: input.chatId,
    tenantId: input.tenantId,
    channelAccountId: input.channelAccountId,
    channelAccountTenantId: input.channelAccountTenantId
  });

  const token = input.token ?? process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN is required to send a real Telegram media message");
  }

  const method = input.mediaType === "image" ? "sendPhoto" : "sendDocument";
  const body: Record<string, unknown> = { chat_id: input.chatId };
  if (input.mediaType === "image") {
    body.photo = input.url;
  } else {
    body.document = input.url;
  }
  if (input.caption) body.caption = input.caption;

  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`Telegram ${method} failed: ${response.status} ${await response.text()}`);
  }
}

// Attachment shape the worker passes through from Prisma (Message.attachments).
export type TelegramOutboundAttachment = {
  type?: string | null;
  url?: string | null;
  filename?: string | null;
  mimeType?: string | null;
};

/**
 * Orchestrates a full Telegram outbound message (text + attachments).
 *
 * Rules (fixes the "message text is empty" 400 crash):
 *  - Text is only sent via sendMessage when it is a non-empty trimmed string.
 *  - When attachments exist, the text rides along as the caption on the FIRST
 *    attachment instead of a separate sendMessage, so image-only replies never
 *    trigger an empty sendMessage call.
 *  - Images (MessageType `image` or an `image/*` mime type) go via sendPhoto,
 *    everything else via sendDocument.
 *  - Only attachments with an absolute http(s) URL are sendable; Telegram fetches
 *    the media from our public MEDIA_PUBLIC_BASE_URL.
 */
export async function sendTelegramOutbound(
  input: {
    token?: string | null;
    chatId: string;
    text?: string | null;
    attachments?: TelegramOutboundAttachment[] | null;
  } & ProviderTextGuardInput
) {
  const guardFields: ProviderTextGuardInput = {
    tenantId: input.tenantId,
    channelAccountId: input.channelAccountId,
    channelAccountTenantId: input.channelAccountTenantId
  };

  const rawText = input.text ?? "";
  const hasText = rawText.trim().length > 0;
  const sendable = (input.attachments ?? []).filter(
    (attachment): attachment is TelegramOutboundAttachment & { url: string } =>
      typeof attachment.url === "string" && /^https?:\/\//i.test(attachment.url)
  );

  // Text-only message keeps the original standalone sendMessage behavior.
  if (hasText && sendable.length === 0) {
    await sendTelegramTextMessage({ token: input.token, chatId: input.chatId, text: rawText, ...guardFields });
  }

  for (let index = 0; index < sendable.length; index += 1) {
    const attachment = sendable[index];
    const isImage = attachment.type === "image" || (attachment.mimeType?.toLowerCase().startsWith("image/") ?? false);
    const caption = hasText && index === 0 ? rawText : undefined;
    await sendTelegramMediaMessage({
      token: input.token,
      chatId: input.chatId,
      mediaType: isImage ? "image" : "file",
      url: attachment.url,
      filename: attachment.filename,
      caption,
      ...guardFields
    });
  }
}

export async function sendLineMediaMessage(
  input: {
    token?: string | null;
    to: string;
    mediaType: OutboundMediaType;
    url: string;
    previewUrl?: string | null;
    filename?: string | null;
  } & ProviderTextGuardInput
) {
  assertProviderOutboundAllowed({
    provider: "line",
    recipientId: input.to,
    tenantId: input.tenantId,
    channelAccountId: input.channelAccountId,
    channelAccountTenantId: input.channelAccountTenantId
  });

  const token = input.token ?? process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    throw new Error("LINE_CHANNEL_ACCESS_TOKEN is required to send a real LINE media message");
  }

  const message =
    input.mediaType === "image"
      ? { type: "image", originalContentUrl: input.url, previewImageUrl: input.previewUrl ?? input.url }
      : input.mediaType === "audio"
        ? { type: "audio", originalContentUrl: input.url, duration: 0 }
        : { type: "text", text: `File: ${input.filename ?? input.url}\n${input.url}` };

  const response = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ to: input.to, messages: [message] })
  });

  if (!response.ok) {
    throw new Error(`LINE media push failed: ${response.status} ${await response.text()}`);
  }
}

export async function sendMetaMediaMessage(
  input: {
    token?: string | null;
    provider: "facebook" | "instagram";
    recipientId: string;
    mediaType: OutboundMediaType;
    url: string;
  } & ProviderTextGuardInput
) {
  assertProviderOutboundAllowed({
    provider: input.provider,
    recipientId: input.recipientId,
    tenantId: input.tenantId,
    channelAccountId: input.channelAccountId,
    channelAccountTenantId: input.channelAccountTenantId
  });

  const token =
    input.token ??
    (input.provider === "facebook"
      ? process.env.FACEBOOK_PAGE_ACCESS_TOKEN
      : process.env.INSTAGRAM_ACCESS_TOKEN);
  if (!token) {
    throw new Error(
      `${input.provider === "facebook" ? "FACEBOOK_PAGE_ACCESS_TOKEN" : "INSTAGRAM_ACCESS_TOKEN"} is required to send a real ${input.provider} media message`
    );
  }

  const attachmentType = input.mediaType === "image" ? "image" : input.mediaType === "audio" ? "audio" : "file";
  const response = await fetch("https://graph.facebook.com/v19.0/me/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      recipient: { id: input.recipientId },
      message: { attachment: { type: attachmentType, payload: { url: input.url, is_reusable: true } } },
      ...(input.provider === "instagram" ? { messaging_type: "RESPONSE" } : {})
    })
  });

  if (!response.ok) {
    throw new Error(`${input.provider} media send failed: ${response.status} ${await response.text()}`);
  }
}

export function channelMode() {
  return (process.env.META_CHANNEL_MODE ?? process.env.CHANNEL_MODE ?? process.env.AI_MODE ?? "mock").toLowerCase();
}

export function providerOutboundMode() {
  return (process.env.PROVIDER_OUTBOUND_MODE ?? "disabled").toLowerCase();
}

export function providerOutboundEnabled() {
  return (process.env.PROVIDER_OUTBOUND_ENABLED ?? "false").toLowerCase() === "true";
}

export function providerSandboxMode() {
  return (process.env.PROVIDER_SANDBOX_MODE ?? "disabled").toLowerCase();
}

export function validateProviderOutboundGuard(input: ProviderOutboundGuardInput) {
  return validateProviderSandboxOutbound({ ...input, env: process.env });
}

export function assertProviderOutboundAllowed(input: ProviderOutboundGuardInput) {
  const result = validateProviderOutboundGuard(input);
  if (!result.allowed) {
    throw new Error(`Provider outbound blocked: ${result.reason}`);
  }
  return result;
}

export function shouldUseRealChannelSend(input?: ProviderOutboundGuardInput) {
  if (!input) return false;
  return validateProviderOutboundGuard(input).allowed;
}
