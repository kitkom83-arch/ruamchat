import crypto from "node:crypto";
import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import {
  providerWebhookSandboxEventRequestSchema,
  type ProviderSandboxProvider,
  type ProviderWebhookEvent,
  type ProviderWebhookMessageType,
  type ProviderWebhookNormalizedEventType,
  type ProviderWebhookSandboxEventRequest
} from "@ai-omni/shared";
import { MessageType as PrismaMessageType } from "@prisma/client";
import { AuditService } from "./audit.service.js";
import { ConversationService } from "./conversation.service.js";

const maxStoredEvents = 100;
const events: ProviderWebhookEvent[] = [];
const dedupFirstSeenAtByDigest = new Map<string, string>();

@Injectable()
export class ProviderWebhookEventsService {
  constructor(
    @Inject(AuditService) private readonly audit: AuditService,
    @Inject(ConversationService) private readonly conversations: ConversationService
  ) {}

  list(tenantId: string) {
    return events.filter((event) => event.tenantId === tenantId);
  }

  async create(tenantId: string, body: unknown, actorUserId?: string) {
    rejectLiveProviderMode();
    const parsed = providerWebhookSandboxEventRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException("Invalid provider webhook sandbox event");
    }

    const input = parsed.data;
    const payload = summarizePayload(input.payload);
    const signature = verifySandboxSignature(input);
    const replay = checkReplayGuardrail(tenantId, input);
    const normalization = normalizeSandboxEvent(input, signature, replay);
    const routing = summarizeDryRunRouting(tenantId, input, normalization, signature, replay);
    const persistence = await this.persistSandboxInbound(tenantId, input, normalization, signature, replay, routing);
    const receivedAt = new Date().toISOString();
    const event: ProviderWebhookEvent = {
      id: `provider-webhook-event-${crypto.randomUUID()}`,
      tenantId,
      provider: input.provider,
      channel: input.channel ?? input.provider,
      eventType: input.eventType,
      mode: input.mode,
      status: signature.signatureStatus === "failed" ? "failed" : input.status,
      receivedAt,
      payloadSummary: payload.summary,
      payloadFieldCount: payload.fieldCount,
      payloadDigest: payload.digest,
      signatureVerified: signature.signatureVerified,
      signatureStatus: signature.signatureStatus,
      signatureAlgorithm: signature.signatureAlgorithm,
      signatureFingerprint: signature.signatureFingerprint,
      signedAt: input.timestamp ?? null,
      replayDetected: replay.replayDetected,
      replayStatus: replay.replayStatus,
      dedupKeyDigest: replay.dedupKeyDigest,
      previousEventSeenAt: replay.previousEventSeenAt,
      normalized: normalization.normalized,
      normalizationStatus: normalization.normalizationStatus,
      normalizedEventType: normalization.normalizedEventType,
      direction: "inbound",
      messageType: normalization.messageType,
      textPreview: normalization.textPreview,
      textLength: normalization.textLength,
      mediaSummary: normalization.mediaSummary,
      senderKeyDigest: normalization.senderKeyDigest,
      roomKeyDigest: normalization.roomKeyDigest,
      dryRunRouting: routing.dryRunRouting,
      routingStatus: routing.routingStatus,
      conversationLookupStatus: persistence.conversationLookupStatus ?? routing.conversationLookupStatus,
      conversationKeyDigest: routing.conversationKeyDigest,
      channelAccountId: persistence.channelAccountId ?? routing.channelAccountId,
      roomIdDigest: routing.roomIdDigest,
      inboundPersistenceMode: input.inboundPersistenceMode,
      inboundPersistenceStatus: persistence.inboundPersistenceStatus,
      messagePersisted: persistence.messagePersisted,
      persistedMessageId: persistence.persistedMessageId,
      conversationId: persistence.conversationId,
      inboundAuditStatus: "skipped",
      externalCalls: 0
    };
    if (persistence.routingStatus) event.routingStatus = persistence.routingStatus;

    events.unshift(event);
    events.splice(maxStoredEvents);
    event.inboundAuditStatus = await this.recordAudit(event, actorUserId);
    return event;
  }

  private async persistSandboxInbound(
    tenantId: string,
    input: ProviderWebhookSandboxEventRequest,
    normalization: ReturnType<typeof normalizeSandboxEvent>,
    signature: ReturnType<typeof verifySandboxSignature>,
    replay: ReturnType<typeof checkReplayGuardrail>,
    routing: ReturnType<typeof summarizeDryRunRouting>
  ): Promise<{
    inboundPersistenceStatus: ProviderWebhookEvent["inboundPersistenceStatus"];
    messagePersisted: boolean;
    persistedMessageId: string | null;
    conversationId: string | null;
    conversationLookupStatus: ProviderWebhookEvent["conversationLookupStatus"] | null;
    channelAccountId: string | null;
    routingStatus: ProviderWebhookEvent["routingStatus"] | null;
  }> {
    if (input.inboundPersistenceMode === "dry-run") {
      return persistenceSkipped("dry-run-only", null);
    }
    if (input.mode !== "sandbox") {
      return persistenceSkipped("skipped", "skipped");
    }
    if (signature.signatureStatus === "failed" || signature.signatureStatus === "missing") {
      return persistenceSkipped("blocked-signature", "skipped");
    }
    if (replay.replayDetected) {
      return persistenceSkipped("blocked-replay", "skipped", "blocked-replay");
    }
    if (!normalization.normalized) {
      return persistenceSkipped(normalization.normalizationStatus === "unsupported" ? "unsupported" : "skipped", "skipped");
    }
    if (!normalization.rawRoomKey || !routing.channelAccountId) {
      return persistenceSkipped("skipped-no-match", "not-found");
    }

    try {
      const result = await this.conversations.persistSandboxWebhookInboundMessage({
        tenantId,
        platform: input.provider,
        channelAccountId: routing.channelAccountId,
        roomKey: normalization.rawRoomKey,
        text: normalization.textPreview,
        messageType: mapPrismaMessageType(normalization.messageType),
        providerEventDigest: replay.dedupKeyDigest ?? routing.conversationKeyDigest ?? payloadEventDigest(tenantId, input, routing),
        payloadDigest: summarizePayload(input.payload).digest,
        deliveryDigest: replay.dedupKeyDigest,
        timestamp: input.timestamp ?? null
      });

      if (result.status === "not-found") {
        return persistenceSkipped("skipped-no-match", "not-found");
      }
      if (result.duplicate) {
        return persistenceSkipped("blocked-replay", "matched", "blocked-replay", result.conversation.id, result.message.id);
      }

      return {
        inboundPersistenceStatus: "persisted",
        messagePersisted: true,
        persistedMessageId: result.message.id,
        conversationId: result.conversation.id,
        conversationLookupStatus: "matched",
        channelAccountId: result.conversation.room.channelAccountId,
        routingStatus: "matched"
      };
    } catch {
      return persistenceSkipped("failed", null);
    }
  }

  private async recordAudit(event: ProviderWebhookEvent, actorUserId?: string): Promise<ProviderWebhookEvent["inboundAuditStatus"]> {
    try {
      await this.audit.record({
        tenantId: event.tenantId,
        actorUserId,
        action: "provider_webhook.sandbox_event_received",
        entityType: "provider_webhook_event",
        entityId: event.id,
        metadata: {
          provider: event.provider,
          channel: event.channel,
          eventType: event.eventType,
          mode: event.mode,
          status: event.status,
          payloadSummary: event.payloadSummary,
          payloadFieldCount: event.payloadFieldCount,
          payloadDigest: event.payloadDigest,
          signatureVerified: event.signatureVerified,
          signatureStatus: event.signatureStatus,
          signatureAlgorithm: event.signatureAlgorithm,
          signatureFingerprint: event.signatureFingerprint,
          signedAt: event.signedAt,
          replayDetected: event.replayDetected,
          replayStatus: event.replayStatus,
          dedupKeyDigest: event.dedupKeyDigest,
          previousEventSeenAt: event.previousEventSeenAt,
          normalized: event.normalized,
          normalizationStatus: event.normalizationStatus,
          normalizedEventType: event.normalizedEventType,
          direction: event.direction,
          messageType: event.messageType,
          textPreview: event.textPreview,
          textLength: event.textLength,
          mediaSummary: event.mediaSummary,
          senderKeyDigest: event.senderKeyDigest,
          roomKeyDigest: event.roomKeyDigest,
          dryRunRouting: event.dryRunRouting,
          routingStatus: event.routingStatus,
          conversationLookupStatus: event.conversationLookupStatus,
          conversationKeyDigest: event.conversationKeyDigest,
          channelAccountId: event.channelAccountId,
          roomIdDigest: event.roomIdDigest,
          inboundPersistenceMode: event.inboundPersistenceMode,
          inboundPersistenceStatus: event.inboundPersistenceStatus,
          messagePersisted: event.messagePersisted,
          persistedMessageId: event.persistedMessageId,
          conversationId: event.conversationId,
          externalCalls: 0
        }
      });

      if (event.inboundPersistenceMode === "sandbox-persist") {
        const inboundMetadata = {
          tenantId: event.tenantId,
          conversationId: event.conversationId,
          provider: event.provider,
          channelAccountId: event.channelAccountId,
          roomIdDigest: event.roomIdDigest,
          eventDigest: event.dedupKeyDigest,
          payloadDigest: event.payloadDigest,
          status: event.inboundPersistenceStatus,
          externalCalls: 0
        };
        await this.audit.record({
          tenantId: event.tenantId,
          actorUserId,
          conversationId: event.conversationId,
          action: "provider_webhook.inbound_persistence_attempted",
          entityType: "provider_webhook_inbound_persistence",
          entityId: event.persistedMessageId ?? event.id,
          metadata: inboundMetadata
        });
        const outcomeAction = inboundPersistenceAuditAction(event.inboundPersistenceStatus);
        if (outcomeAction !== "provider_webhook.inbound_persistence_attempted") {
          await this.audit.record({
            tenantId: event.tenantId,
            actorUserId,
            conversationId: event.conversationId,
            action: outcomeAction,
            entityType: "provider_webhook_inbound_persistence",
            entityId: event.persistedMessageId ?? event.id,
            metadata: inboundMetadata
          });
        }
      }
      return "recorded";
    } catch {
      // Sandbox event intake must not fail just because optional audit persistence is unavailable.
      return "failed";
    }
  }
}

export function resetProviderWebhookEventStoreForTest() {
  events.splice(0);
  dedupFirstSeenAtByDigest.clear();
}

export function getProviderWebhookGuardrailReadinessSnapshot() {
  const latest = events[0] ?? null;
  return {
    webhookSignatureVerificationConfigured: true,
    webhookSignatureVerificationReady: true,
    replayGuardrailsEnabled: true,
    lastSandboxEventSignatureStatus: latest?.signatureStatus ?? null,
    latestReplayStatus: latest?.replayStatus ?? null,
    replayDetectedCount: events.filter((event) => event.replayDetected).length,
    webhookNormalizationEnabled: true,
    webhookDryRunRoutingEnabled: true,
    lastSandboxEventNormalizationStatus: latest?.normalizationStatus ?? null,
    latestRoutingStatus: latest?.routingStatus ?? null,
    normalizedEventCount: events.filter((event) => event.normalized).length,
    routingBlockedCount: events.filter((event) => event.routingStatus === "blocked-signature" || event.routingStatus === "blocked-replay").length,
    webhookInboundPersistenceEnabled: true,
    latestInboundPersistenceStatus: latest?.inboundPersistenceStatus ?? null,
    persistedInboundMessageCount: events.filter((event) => event.messagePersisted).length,
    inboundPersistenceBlockedCount: events.filter((event) =>
      event.inboundPersistenceStatus === "blocked-signature" ||
      event.inboundPersistenceStatus === "blocked-replay" ||
      event.inboundPersistenceStatus === "failed"
    ).length,
    inboundPersistenceReplayBlockedCount: events.filter((event) => event.inboundPersistenceStatus === "blocked-replay").length,
    inboundPersistenceSkippedNoMatchCount: events.filter((event) => event.inboundPersistenceStatus === "skipped-no-match").length,
    lastSandboxEventAt: latest?.receivedAt ?? null
  };
}

function rejectLiveProviderMode() {
  const providerOutboundMode = normalized(process.env.PROVIDER_OUTBOUND_MODE, "disabled");
  const channelMode = normalized(process.env.CHANNEL_MODE, "mock");
  const metaChannelMode = normalized(process.env.META_CHANNEL_MODE, "mock");
  if (providerOutboundMode === "real" || channelMode === "real" || metaChannelMode === "real") {
    throw new BadRequestException("Provider webhook sandbox events are disabled while live provider mode is active");
  }
}

function normalizeSandboxEvent(
  input: ProviderWebhookSandboxEventRequest,
  signature: ReturnType<typeof verifySandboxSignature>,
  replay: ReturnType<typeof checkReplayGuardrail>
) {
  if (signature.signatureStatus === "failed") {
    return blockedNormalization("blocked-signature");
  }
  if (signature.signatureStatus === "missing") {
    return blockedNormalization("skipped");
  }
  if (replay.replayDetected) {
    return blockedNormalization("blocked-replay");
  }

  const summary = summarizeProviderPayload(input.provider, input.payload);
  if (!summary.supported) {
    return {
      ...blockedNormalization("unsupported"),
      normalizedEventType: summary.normalizedEventType,
      messageType: summary.messageType,
      mediaSummary: summary.mediaSummary
    };
  }

  return {
    normalized: true,
    normalizationStatus: "normalized" as const,
    normalizedEventType: summary.normalizedEventType,
    messageType: summary.messageType,
    textPreview: safeTextPreview(summary.text),
    textLength: typeof summary.text === "string" ? summary.text.length : null,
    mediaSummary: summary.mediaSummary,
    senderKeyDigest: safeKeyDigest("sender", summary.senderKey),
    roomKeyDigest: safeKeyDigest("room", summary.roomKey),
    rawRoomKey: summary.roomKey,
    externalCalls: 0 as const
  };
}

function blockedNormalization(status: "skipped" | "failed" | "blocked-signature" | "blocked-replay" | "unsupported") {
  return {
    normalized: false,
    normalizationStatus: status,
    normalizedEventType: "unknown" as const,
    messageType: "unknown" as const,
    textPreview: null,
    textLength: null,
    mediaSummary: null,
    senderKeyDigest: null,
    roomKeyDigest: null,
    rawRoomKey: null,
    externalCalls: 0 as const
  };
}

function summarizeDryRunRouting(
  tenantId: string,
  input: ProviderWebhookSandboxEventRequest,
  normalization: ReturnType<typeof normalizeSandboxEvent>,
  signature: ReturnType<typeof verifySandboxSignature>,
  replay: ReturnType<typeof checkReplayGuardrail>
) {
  if (signature.signatureStatus === "failed") {
    return blockedRouting("blocked-signature");
  }
  if (replay.replayDetected) {
    return blockedRouting("blocked-replay");
  }
  if (!normalization.normalized) {
    return blockedRouting(normalization.normalizationStatus === "unsupported" ? "unsupported" : "skipped");
  }

  const channel = input.channel ?? input.provider;
  const channelAccountId = `sandbox:${channel}`;
  const roomKey = normalization.rawRoomKey ?? channelAccountId;
  return {
    dryRunRouting: true,
    routingStatus: "dry-run-only" as const,
    conversationLookupStatus: "not-found" as const,
    conversationKeyDigest: safeDigest(canonicalJson({
      tenantId,
      platform: input.provider,
      channelAccountId,
      roomKey
    })),
    channelAccountId,
    roomIdDigest: safeDigest(`room:${roomKey}`),
    externalCalls: 0 as const
  };
}

function blockedRouting(status: "blocked-signature" | "blocked-replay" | "unsupported" | "skipped") {
  return {
    dryRunRouting: status !== "skipped",
    routingStatus: status,
    conversationLookupStatus: "skipped" as const,
    conversationKeyDigest: null,
    channelAccountId: null,
    roomIdDigest: null,
    externalCalls: 0 as const
  };
}

function persistenceSkipped(
  inboundPersistenceStatus: ProviderWebhookEvent["inboundPersistenceStatus"],
  conversationLookupStatus: ProviderWebhookEvent["conversationLookupStatus"] | null,
  routingStatus: ProviderWebhookEvent["routingStatus"] | null = null,
  conversationId: string | null = null,
  persistedMessageId: string | null = null
) {
  return {
    inboundPersistenceStatus,
    messagePersisted: false,
    persistedMessageId,
    conversationId,
    conversationLookupStatus,
    channelAccountId: null,
    routingStatus
  };
}

function mapPrismaMessageType(messageType: ProviderWebhookMessageType): PrismaMessageType {
  if (messageType === "text") return PrismaMessageType.text;
  if (messageType === "image") return PrismaMessageType.image;
  if (messageType === "file") return PrismaMessageType.file;
  return PrismaMessageType.event;
}

function payloadEventDigest(
  tenantId: string,
  input: ProviderWebhookSandboxEventRequest,
  routing: ReturnType<typeof summarizeDryRunRouting>
) {
  return safeDigest(canonicalJson({
    tenantId,
    provider: input.provider,
    channel: input.channel ?? input.provider,
    payloadDigest: summarizePayload(input.payload).digest,
    conversationKeyDigest: routing.conversationKeyDigest
  }));
}

function inboundPersistenceAuditAction(status: ProviderWebhookEvent["inboundPersistenceStatus"]) {
  if (status === "persisted") return "provider_webhook.inbound_persistence_persisted";
  if (status === "blocked-signature") return "provider_webhook.inbound_persistence_blocked_signature";
  if (status === "blocked-replay") return "provider_webhook.inbound_persistence_blocked_replay";
  if (status === "skipped-no-match") return "provider_webhook.inbound_persistence_skipped_no_match";
  return "provider_webhook.inbound_persistence_attempted";
}

function summarizePayload(payload: ProviderWebhookSandboxEventRequest["payload"]) {
  const descriptor = describePayload(payload);
  const fieldCount = countSafePayloadFields(payload);
  const digest = crypto.createHash("sha256").update(JSON.stringify(descriptor)).digest("hex").slice(0, 24);
  const kind = payload === null ? "null" : Array.isArray(payload) ? "array" : typeof payload;
  const summary = kind === "object" || kind === "array"
    ? `Dry-run ${kind} payload accepted with ${fieldCount} safe fields.`
    : `Dry-run ${kind} payload accepted.`;
  return {
    summary,
    fieldCount,
    digest: `sha256:${digest}`
  };
}

function verifySandboxSignature(input: ProviderWebhookSandboxEventRequest) {
  const signature = input.signature?.trim();
  if (!signature) {
    return {
      signatureVerified: false,
      signatureStatus: "missing" as const,
      signatureAlgorithm: "hmac-sha256" as const,
      signatureFingerprint: null
    };
  }

  const expected = crypto
    .createHmac("sha256", sandboxSigningMaterial(input.provider))
    .update(canonicalJson(input.payload ?? null))
    .digest("hex");
  const normalizedSignature = signature.startsWith("sha256=") ? signature.slice("sha256=".length) : signature;
  const verified = safeEqual(normalizedSignature, expected);

  return {
    signatureVerified: verified,
    signatureStatus: verified ? "verified" as const : "failed" as const,
    signatureAlgorithm: "hmac-sha256" as const,
    signatureFingerprint: `sha256:${crypto.createHash("sha256").update(`provider-webhook:${signature}`).digest("hex").slice(0, 16)}`
  };
}

function checkReplayGuardrail(tenantId: string, input: ProviderWebhookSandboxEventRequest) {
  const dedupIdentifier = input.eventId ?? input.deliveryId;
  if (!dedupIdentifier) {
    return {
      replayDetected: false,
      replayStatus: "fresh" as const,
      dedupKeyDigest: null,
      previousEventSeenAt: null
    };
  }

  const channel = input.channel ?? input.provider;
  const dedupKeyDigest = `sha256:${crypto
    .createHash("sha256")
    .update(canonicalJson({ tenantId, provider: input.provider, channel, dedupIdentifier }))
    .digest("hex")
    .slice(0, 24)}`;
  const previousEventSeenAt = dedupFirstSeenAtByDigest.get(dedupKeyDigest) ?? null;
  if (!previousEventSeenAt) {
    dedupFirstSeenAtByDigest.set(dedupKeyDigest, new Date().toISOString());
  }

  return {
    replayDetected: Boolean(previousEventSeenAt),
    replayStatus: previousEventSeenAt ? "duplicate" as const : "fresh" as const,
    dedupKeyDigest,
    previousEventSeenAt
  };
}

type ProviderPayloadSummary = {
  supported: boolean;
  normalizedEventType: ProviderWebhookNormalizedEventType;
  messageType: ProviderWebhookMessageType;
  text: string | null;
  mediaSummary: string | null;
  senderKey: string | null;
  roomKey: string | null;
};

function summarizeProviderPayload(provider: ProviderSandboxProvider, payload: unknown): ProviderPayloadSummary {
  const objectPayload = asRecord(payload);
  if (!objectPayload) return unsupportedPayloadSummary();

  if (provider === "line") return summarizeLinePayload(objectPayload);
  if (provider === "telegram") return summarizeTelegramPayload(objectPayload);
  if (provider === "facebook" || provider === "instagram") return summarizeMetaPayload(objectPayload);
  return unsupportedPayloadSummary();
}

function summarizeLinePayload(payload: Record<string, unknown>): ProviderPayloadSummary {
  const event = firstRecord(payload.events);
  if (!event) return genericMessageSummary(payload);

  const eventType = normalizeProviderEventType(asString(event.type));
  const message = asRecord(event.message);
  const source = asRecord(event.source);
  const sourceType = asString(source?.type);
  const roomKey = asString(source?.groupId) ?? asString(source?.roomId) ?? asString(source?.userId);
  const senderKey = asString(source?.userId) ?? roomKey;
  const messageType = normalizeMessageType(asString(message?.type));
  return {
    supported: eventType !== "unknown" || Boolean(message),
    normalizedEventType: message ? "message" : eventType,
    messageType,
    text: asString(message?.text),
    mediaSummary: mediaSummary(messageType, sourceType ? `source:${sourceType}` : null),
    senderKey,
    roomKey
  };
}

function summarizeTelegramPayload(payload: Record<string, unknown>): ProviderPayloadSummary {
  const callback = asRecord(payload.callback_query);
  if (callback) {
    const from = asRecord(callback.from);
    const message = asRecord(callback.message);
    const chat = asRecord(message?.chat);
    return {
      supported: true,
      normalizedEventType: "postback",
      messageType: "unknown",
      text: null,
      mediaSummary: null,
      senderKey: numberLike(from?.id),
      roomKey: numberLike(chat?.id) ?? numberLike(from?.id)
    };
  }

  const message = asRecord(payload.message) ?? asRecord(payload.edited_message);
  if (!message) return genericMessageSummary(payload);
  const from = asRecord(message.from);
  const chat = asRecord(message.chat);
  const messageType = telegramMessageType(message);
  return {
    supported: true,
    normalizedEventType: "message",
    messageType,
    text: asString(message.text) ?? asString(message.caption),
    mediaSummary: mediaSummary(messageType, attachmentDescriptor(message)),
    senderKey: numberLike(from?.id) ?? numberLike(chat?.id),
    roomKey: numberLike(chat?.id)
  };
}

function summarizeMetaPayload(payload: Record<string, unknown>): ProviderPayloadSummary {
  const entry = firstRecord(payload.entry);
  const messaging = firstRecord(entry?.messaging);
  if (messaging) {
    const sender = asRecord(messaging.sender);
    const recipient = asRecord(messaging.recipient);
    const message = asRecord(messaging.message);
    const delivery = asRecord(messaging.delivery);
    const postback = asRecord(messaging.postback);
    const messageType = metaMessageType(message);
    return {
      supported: Boolean(message || delivery || postback),
      normalizedEventType: postback ? "postback" : delivery ? "delivery" : "message",
      messageType,
      text: asString(message?.text),
      mediaSummary: mediaSummary(messageType, message ? attachmentDescriptor(message) : null),
      senderKey: asString(sender?.id),
      roomKey: asString(sender?.id) ?? asString(recipient?.id)
    };
  }

  const change = firstRecord(entry?.changes);
  const value = asRecord(change?.value);
  if (asString(change?.field) === "comments" && value) {
    const from = asRecord(value.from);
    const media = asRecord(value.media);
    return {
      supported: true,
      normalizedEventType: "message",
      messageType: "text",
      text: asString(value.text),
      mediaSummary: mediaSummary("text", "comment"),
      senderKey: asString(from?.id),
      roomKey: asString(media?.id) ?? asString(from?.id)
    };
  }

  return genericMessageSummary(payload);
}

function genericMessageSummary(payload: Record<string, unknown>): ProviderPayloadSummary {
  const message = asRecord(payload.message);
  const type = normalizeMessageType(asString(message?.type));
  return {
    supported: Boolean(message),
    normalizedEventType: message ? "message" : "unknown",
    messageType: type,
    text: asString(message?.text),
    mediaSummary: mediaSummary(type, null),
    senderKey: asString(payload.senderId) ?? asString(payload.senderKey),
    roomKey: asString(payload.roomId) ?? asString(payload.roomKey) ?? asString(payload.chatId)
  };
}

function unsupportedPayloadSummary(): ProviderPayloadSummary {
  return {
    supported: false,
    normalizedEventType: "unknown",
    messageType: "unknown",
    text: null,
    mediaSummary: null,
    senderKey: null,
    roomKey: null
  };
}

function describePayload(value: unknown, depth = 0): unknown {
  if (depth > 4) return "[depth-limit]";
  if (value === null) return "null";
  if (Array.isArray(value)) return value.slice(0, 10).map((item) => describePayload(item, depth + 1));
  if (typeof value !== "object") return typeof value;

  const output: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value as Record<string, unknown>).slice(0, 50)) {
    if (isUnsafePayloadKey(key)) continue;
    output[key] = describePayload(child, depth + 1);
  }
  return output;
}

function countSafePayloadFields(value: unknown, depth = 0): number {
  if (depth > 6 || value === null || value === undefined) return 0;
  if (Array.isArray(value)) return value.reduce((sum, item) => sum + countSafePayloadFields(item, depth + 1), 0);
  if (typeof value !== "object") return 0;

  let count = 0;
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (isUnsafePayloadKey(key)) continue;
    count += 1 + countSafePayloadFields(child, depth + 1);
  }
  return count;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function firstRecord(value: unknown): Record<string, unknown> | null {
  if (Array.isArray(value)) return asRecord(value[0]);
  return asRecord(value);
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function numberLike(value: unknown): string | null {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return asString(value);
}

function normalizeProviderEventType(value: string | null): ProviderWebhookNormalizedEventType {
  if (value === "message") return "message";
  if (value === "delivery" || value === "delivered" || value === "read") return "delivery";
  if (value === "follow") return "follow";
  if (value === "postback") return "postback";
  return "unknown";
}

function normalizeMessageType(value: string | null): ProviderWebhookMessageType {
  if (value === "text") return "text";
  if (value === "image" || value === "photo") return "image";
  if (value === "file" || value === "document" || value === "video" || value === "audio" || value === "voice") return "file";
  if (value === "sticker") return "sticker";
  return "unknown";
}

function telegramMessageType(message: Record<string, unknown>): ProviderWebhookMessageType {
  if (message.photo) return "image";
  if (message.document || message.video || message.voice || message.audio) return "file";
  if (message.sticker) return "sticker";
  if (message.text || message.caption) return "text";
  return "unknown";
}

function metaMessageType(message: Record<string, unknown> | null): ProviderWebhookMessageType {
  if (!message) return "unknown";
  if (message.text) return "text";
  const attachment = firstRecord(message.attachments);
  return normalizeMessageType(asString(attachment?.type));
}

function attachmentDescriptor(message: Record<string, unknown>) {
  if (message.photo) return "photo";
  if (message.document) return "document";
  if (message.video) return "video";
  if (message.voice || message.audio) return "audio";
  if (message.sticker) return "sticker";
  if (message.attachments) return "attachment";
  return null;
}

function mediaSummary(messageType: ProviderWebhookMessageType, descriptor: string | null) {
  if (messageType === "text" && !descriptor) return null;
  if (messageType === "unknown" && !descriptor) return null;
  return descriptor ? `${messageType} media summary: ${descriptor}` : `${messageType} media present`;
}

function safeTextPreview(value: string | null) {
  if (!value || isUnsafeText(value)) return null;
  const compact = value.replace(/\s+/g, " ").trim();
  if (!compact) return null;
  return compact.length > 80 ? `${compact.slice(0, 77)}...` : compact;
}

function isUnsafeText(value: string) {
  return /token|secret|authorization|cookie|replyToken|Bearer\s+|sk-[a-z0-9_-]{8,}|EA[A-Za-z0-9]{20,}/i.test(value);
}

function safeKeyDigest(kind: string, value: string | null) {
  return value ? safeDigest(`${kind}:${value}`) : null;
}

function safeDigest(value: string) {
  return `sha256:${crypto.createHash("sha256").update(value).digest("hex").slice(0, 24)}`;
}

function isUnsafePayloadKey(key: string) {
  return /token|secret|signature|authorization|cookie|providerraw|rawpayload|payloadjson|allowlist/i.test(key);
}

function sandboxSigningMaterial(provider: ProviderWebhookSandboxEventRequest["provider"]) {
  const providerEnvName = `${provider.toUpperCase()}_SANDBOX_WEBHOOK_SIGNING_KEY`;
  return process.env[providerEnvName]?.trim()
    || process.env.PROVIDER_WEBHOOK_SANDBOX_SIGNING_KEY?.trim()
    || "local-provider-webhook-sandbox-signing-material";
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((item) => canonicalJson(item)).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) => left.localeCompare(right));
  return `{${entries.map(([key, child]) => `${JSON.stringify(key)}:${canonicalJson(child)}`).join(",")}}`;
}

function safeEqual(actual: string, expected: string) {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(actualBuffer, expectedBuffer);
}

function normalized(value: string | undefined, fallback: string) {
  const trimmed = value?.trim().toLowerCase();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
}
