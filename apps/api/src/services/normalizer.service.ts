import { Injectable } from "@nestjs/common";
import { ChannelAccount } from "@prisma/client";
import {
  AttachmentInput,
  MessageType,
  NormalizedInboundMessage,
  normalizedInboundMessageSchema
} from "@ai-omni/shared";

type WebchatPayload = {
  visitorId?: string;
  sessionId?: string;
  messageId?: string;
  text?: string;
  attachments?: AttachmentInput[];
  timestamp?: string;
  name?: string;
};

type TelegramPayload = {
  update_id?: number | string;
  message?: {
    message_id: number | string;
    date?: number;
    text?: string;
    caption?: string;
    from?: { id: number; first_name?: string; username?: string };
    chat: { id: number | string; type?: string; title?: string; first_name?: string };
    photo?: Array<{ file_id?: string; file_unique_id?: string; file_size?: number; width?: number; height?: number }>;
    voice?: { file_id?: string; mime_type?: string; file_size?: number; duration?: number };
    document?: { file_id?: string; file_name?: string; mime_type?: string; file_size?: number };
  };
};

type LinePayload = {
  events?: Array<{
    type: string;
    webhookEventId?: string;
    timestamp: number;
    replyToken?: string;
    source: { type: "user" | "group" | "room"; userId?: string; groupId?: string; roomId?: string };
    message?: {
      id: string;
      type: string;
      text?: string;
      fileName?: string;
      fileSize?: number;
    };
  }>;
};

type FacebookPayload = {
  object?: "page";
  entry?: Array<{
    id?: string;
    time?: number;
    messaging?: Array<{
      sender?: { id?: string };
      recipient?: { id?: string };
      timestamp?: number;
      message?: {
        mid?: string;
        text?: string;
      };
    }>;
  }>;
};

type InstagramPayload = {
  object?: "instagram";
  entry?: Array<{
    id?: string;
    time?: number;
    messaging?: Array<{
      sender?: { id?: string };
      recipient?: { id?: string };
      timestamp?: number;
      message?: {
        mid?: string;
        text?: string;
      };
    }>;
    changes?: Array<{
      field?: string;
      value?: {
        id?: string;
        text?: string;
        from?: { id?: string; username?: string };
        media?: { id?: string };
        parent_id?: string;
      };
    }>;
  }>;
};

@Injectable()
export class NormalizerService {
  webchat(account: ChannelAccount, body: WebchatPayload): NormalizedInboundMessage {
    const externalUserId = body.visitorId ?? body.sessionId ?? "anonymous";
    return normalizedInboundMessageSchema.parse({
      tenantId: account.tenantId,
      platform: "webchat",
      channelAccountId: account.id,
      externalUserId,
      externalConversationId: body.sessionId ?? externalUserId,
      externalMessageId: body.messageId ?? `webchat-${externalUserId}-${Date.now()}`,
      platformMessageId: body.messageId ?? `webchat-${externalUserId}-${Date.now()}`,
      direction: "inbound",
      senderType: "customer",
      messageType: body.attachments?.[0]?.type ?? "text",
      text: body.text,
      attachments: body.attachments ?? [],
      timestamp: body.timestamp ?? new Date().toISOString(),
      rawPayload: body
    });
  }

  telegram(account: ChannelAccount, body: TelegramPayload): NormalizedInboundMessage | null {
    if (!body.message) {
      return null;
    }

    const message = body.message;
    const messageType = this.telegramMessageType(message);
    const externalUserId = String(message.from?.id ?? message.chat.id);
    const externalMessageId = String(message.message_id);
    return normalizedInboundMessageSchema.parse({
      tenantId: account.tenantId,
      platform: "telegram",
      channelAccountId: account.id,
      externalUserId,
      externalConversationId: String(message.chat.id),
      externalMessageId,
      platformMessageId: body.update_id ? String(body.update_id) : externalMessageId,
      direction: "inbound",
      senderType: "customer",
      messageType,
      text: message.text ?? message.caption,
      attachments: this.telegramAttachments(message, messageType),
      timestamp: message.date ? new Date(message.date * 1000).toISOString() : new Date().toISOString(),
      rawPayload: body
    });
  }

  line(account: ChannelAccount, body: LinePayload): NormalizedInboundMessage[] {
    return (body.events ?? [])
      .filter((event) => event.message)
      .map((event) => {
        const messageType = this.lineMessageType(event.message?.type);
        const externalUserId = event.source.userId ?? event.source.groupId ?? event.source.roomId ?? "unknown";
        const externalMessageId = event.message?.id ?? `${event.timestamp}-${externalUserId}`;
        return normalizedInboundMessageSchema.parse({
          tenantId: account.tenantId,
          platform: "line",
          channelAccountId: account.id,
          externalUserId,
          externalConversationId: event.source.groupId ?? event.source.roomId ?? event.source.userId,
          externalMessageId,
          platformMessageId: event.webhookEventId ?? externalMessageId,
          direction: "inbound",
          senderType: "customer",
          messageType,
          text: event.message?.text,
          attachments: event.message && messageType !== "text"
            ? [{
                type: messageType === "event" ? "file" : messageType,
                filename: event.message.fileName,
                sizeBytes: event.message.fileSize
              }]
            : [],
          timestamp: new Date(event.timestamp).toISOString(),
          rawPayload: event
        });
      });
  }

  facebook(account: ChannelAccount, body: FacebookPayload): NormalizedInboundMessage[] {
    return (body.entry ?? []).flatMap((entry) =>
      (entry.messaging ?? [])
        .filter((event) => event.message?.text)
        .map((event) => {
          const externalUserId = event.sender?.id ?? "unknown";
          const externalMessageId = event.message?.mid ?? `${event.timestamp ?? entry.time ?? Date.now()}-${externalUserId}`;
          return normalizedInboundMessageSchema.parse({
            tenantId: account.tenantId,
            platform: "facebook",
            channelAccountId: account.id,
            externalUserId,
            externalConversationId: externalUserId,
            externalMessageId,
            platformMessageId: externalMessageId,
            direction: "inbound",
            senderType: "customer",
            messageType: "text",
            text: event.message?.text,
            attachments: [],
            timestamp: new Date(event.timestamp ?? entry.time ?? Date.now()).toISOString(),
            rawPayload: event
          });
        })
    );
  }

  instagram(account: ChannelAccount, body: InstagramPayload): NormalizedInboundMessage[] {
    const dmMessages = (body.entry ?? []).flatMap((entry) =>
      (entry.messaging ?? [])
        .filter((event) => event.message?.text)
        .map((event) => {
          const externalUserId = event.sender?.id ?? "unknown";
          const externalMessageId = event.message?.mid ?? `${event.timestamp ?? entry.time ?? Date.now()}-${externalUserId}`;
          return normalizedInboundMessageSchema.parse({
            tenantId: account.tenantId,
            platform: "instagram",
            channelAccountId: account.id,
            externalUserId,
            externalConversationId: externalUserId,
            externalMessageId,
            platformMessageId: externalMessageId,
            direction: "inbound",
            senderType: "customer",
            messageType: "text",
            text: event.message?.text,
            attachments: [],
            timestamp: new Date(event.timestamp ?? entry.time ?? Date.now()).toISOString(),
            rawPayload: { ...event, sourceSubtype: "dm" }
          });
        })
    );

    const commentMessages = (body.entry ?? []).flatMap((entry) =>
      (entry.changes ?? [])
        .filter((change) => change.field === "comments" && change.value?.text)
        .map((change) => {
          const externalUserId = change.value?.from?.id ?? "unknown";
          const externalMessageId = change.value?.id ?? `${entry.time ?? Date.now()}-${externalUserId}`;
          return normalizedInboundMessageSchema.parse({
            tenantId: account.tenantId,
            platform: "instagram",
            channelAccountId: account.id,
            externalUserId,
            externalConversationId: change.value?.media?.id ?? externalUserId,
            externalMessageId,
            platformMessageId: externalMessageId,
            direction: "inbound",
            senderType: "customer",
            messageType: "text",
            text: change.value?.text,
            attachments: [],
            timestamp: new Date(entry.time ?? Date.now()).toISOString(),
            rawPayload: { ...change, sourceSubtype: "comment" }
          });
        })
    );

    return [...dmMessages, ...commentMessages];
  }

  private telegramMessageType(message: NonNullable<TelegramPayload["message"]>): MessageType {
    if (message.photo && message.photo.length > 0) return "image";
    if (message.voice) return "audio";
    if (message.document) return "file";
    return "text";
  }

  private telegramAttachments(message: NonNullable<TelegramPayload["message"]>, type: MessageType): AttachmentInput[] {
    if (type === "file" && message.document) {
      return [{
        type: "file",
        filename: message.document.file_name,
        mimeType: message.document.mime_type,
        sizeBytes: message.document.file_size,
        // storageKey holds the provider file reference until the worker downloads it (gated).
        storageKey: message.document.file_id ? `telegram:${message.document.file_id}` : undefined,
        externalRef: message.document.file_id
      }];
    }
    if (type === "image" && message.photo && message.photo.length > 0) {
      // Telegram sends multiple sizes; pick the largest by file_size.
      const largest = [...message.photo].sort((a, b) => (b.file_size ?? 0) - (a.file_size ?? 0))[0];
      const fileId = largest?.file_id;
      return [{
        type: "image",
        sizeBytes: largest?.file_size,
        storageKey: fileId ? `telegram:${fileId}` : undefined,
        externalRef: fileId
      }];
    }
    if (type === "audio") {
      const fileId = message.voice?.file_id;
      return [{
        type: "audio",
        mimeType: message.voice?.mime_type,
        sizeBytes: message.voice?.file_size,
        storageKey: fileId ? `telegram:${fileId}` : undefined,
        externalRef: fileId
      }];
    }
    return [];
  }

  private lineMessageType(type: string | undefined): MessageType {
    if (type === "image") return "image";
    if (type === "audio") return "audio";
    if (type === "file" || type === "video") return "file";
    if (type === "text") return "text";
    return "event";
  }
}
