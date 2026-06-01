import { BadRequestException } from "@nestjs/common";
import crypto from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProviderWebhookEventsService, resetProviderWebhookEventStoreForTest } from "../services/provider-webhook-events.service.js";
import { ProviderWebhooksController } from "./provider-webhooks.controller.js";

const tenantId = "00000000-0000-4000-8000-000000000001";

beforeEach(() => {
  resetProviderWebhookEventStoreForTest();
});

afterEach(() => {
  delete process.env.PROVIDER_OUTBOUND_MODE;
  delete process.env.CHANNEL_MODE;
  delete process.env.META_CHANNEL_MODE;
  vi.restoreAllMocks();
});

describe("ProviderWebhooksController sandbox events", () => {
  it("rejects missing tenant ids", async () => {
    const { controller } = buildController();

    expect(() => controller.listEvents(undefined)).toThrow(BadRequestException);
    expect(() => controller.createSandboxEvent("", undefined, safePayload())).toThrow(BadRequestException);
  });

  it("stores and returns only safe sandbox event DTO fields", async () => {
    const { controller, audit } = buildController();

    const event = await controller.createSandboxEvent(tenantId, "user-api", safePayload());
    const events = controller.listEvents(tenantId);
    const serialized = JSON.stringify({ event, events });

    expect(event).toMatchObject({
      tenantId,
      provider: "line",
      channel: "line",
      eventType: "message.created",
      mode: "dry_run",
      status: "received",
      inboundPersistenceMode: "dry-run",
      inboundPersistenceStatus: "dry-run-only",
      messagePersisted: false,
      externalCalls: 0
    });
    expect(event.payloadSummary).toContain("Dry-run object payload accepted");
    expect(event.payloadFieldCount).toBeGreaterThan(0);
    expect(event.payloadDigest).toMatch(/^sha256:/);
    expect(event.signatureVerified).toBe(false);
    expect(event.signatureStatus).toBe("missing");
    expect(event.signatureAlgorithm).toBe("hmac-sha256");
    expect(event.replayDetected).toBe(false);
    expect(event.replayStatus).toBe("fresh");
    expect(event.normalized).toBe(false);
    expect(event.normalizationStatus).toBe("skipped");
    expect(event.normalizedEventType).toBe("unknown");
    expect(event.messageType).toBe("unknown");
    expect(event.dryRunRouting).toBe(false);
    expect(event.routingStatus).toBe("skipped");
    expect(event.conversationLookupStatus).toBe("skipped");
    expect(event.dedupKeyDigest).toBeNull();
    expect(events).toHaveLength(1);
    expect(Object.keys(event).sort()).toEqual([
      "channel",
      "channelAccountId",
      "conversationId",
      "conversationKeyDigest",
      "conversationLookupStatus",
      "dedupKeyDigest",
      "direction",
      "dryRunRouting",
      "eventType",
      "externalCalls",
      "id",
      "inboundAuditStatus",
      "inboundPersistenceMode",
      "inboundPersistenceStatus",
      "mediaSummary",
      "messagePersisted",
      "messageType",
      "mode",
      "normalizationStatus",
      "normalized",
      "normalizedEventType",
      "payloadDigest",
      "payloadFieldCount",
      "payloadSummary",
      "persistedMessageId",
      "previousEventSeenAt",
      "provider",
      "receivedAt",
      "replayDetected",
      "replayStatus",
      "roomIdDigest",
      "roomKeyDigest",
      "routingStatus",
      "senderKeyDigest",
      "signatureAlgorithm",
      "signatureFingerprint",
      "signatureStatus",
      "signatureVerified",
      "signedAt",
      "status",
      "textLength",
      "textPreview",
      "tenantId"
    ].sort());
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({
      tenantId,
      action: "provider_webhook.sandbox_event_received",
      entityType: "provider_webhook_event"
    }));
    expect(serialized).not.toContain("sensitive-sample-a");
    expect(serialized).not.toContain("sensitive-provider-body");
    expect(serialized).not.toContain("sensitive-sample-b");
    expect(serialized).not.toMatch(/accessToken|webhookSecret|authorization|cookie|rawPayload|providerRaw|payloadJson|replyToken/i);
  });

  it("verifies a valid sandbox signature without returning raw inputs", async () => {
    const { controller } = buildController();
    const payload = {
      events: [{
        type: "message",
        timestamp: 1760000000000,
        replyToken: "raw-reply-token-must-not-return",
        source: { type: "room", userId: "raw-line-user-1", roomId: "raw-line-room-1" },
        message: { id: "raw-line-message-1", type: "text", text: "Safe hello from sandbox" }
      }]
    };
    const signature = signPayload(payload);

    const event = await controller.createSandboxEvent(tenantId, undefined, {
      provider: "line",
      eventType: "message.created",
      mode: "sandbox",
      eventId: "event-valid-1",
      timestamp: "2026-05-31T01:00:00.000Z",
      signature,
      payload
    });
    const serialized = JSON.stringify(event);

    expect(event).toMatchObject({
      signatureVerified: true,
      signatureStatus: "verified",
      signatureAlgorithm: "hmac-sha256",
      replayDetected: false,
      replayStatus: "fresh",
      normalized: true,
      normalizationStatus: "normalized",
      normalizedEventType: "message",
      direction: "inbound",
      messageType: "text",
      dryRunRouting: true,
      routingStatus: "dry-run-only",
      conversationLookupStatus: "not-found",
      inboundPersistenceMode: "dry-run",
      inboundPersistenceStatus: "dry-run-only",
      messagePersisted: false,
      externalCalls: 0
    });
    expect(event.textPreview).toBe("Safe hello from sandbox");
    expect(event.textLength).toBe("Safe hello from sandbox".length);
    expect(event.senderKeyDigest).toMatch(/^sha256:/);
    expect(event.roomKeyDigest).toMatch(/^sha256:/);
    expect(event.conversationKeyDigest).toMatch(/^sha256:/);
    expect(event.roomIdDigest).toMatch(/^sha256:/);
    expect(event.channelAccountId).toBe("sandbox:line");
    expect(event.signatureFingerprint).toMatch(/^sha256:/);
    expect(event.dedupKeyDigest).toMatch(/^sha256:/);
    expect(serialized).not.toContain(signature);
    expect(serialized).not.toContain("event-valid-1");
    expect(serialized).not.toMatch(/authorization|cookie|rawPayload|providerRaw|payloadJson|webhookSecret|replyToken|raw-line-user-1|raw-line-room-1|raw-line-message-1/i);
  });

  it("marks invalid sandbox signatures as failed safely", async () => {
    const { controller } = buildController();

    const event = await controller.createSandboxEvent(tenantId, undefined, {
      provider: "line",
      eventType: "webhook.failed",
      mode: "sandbox",
      eventId: "event-invalid-1",
      timestamp: "2026-05-31T01:05:00.000Z",
      signature: "sha256=invalid-sandbox-proof",
      payload: { safe: true }
    });
    const serialized = JSON.stringify(event);

    expect(event.signatureVerified).toBe(false);
    expect(event.signatureStatus).toBe("failed");
    expect(event.status).toBe("failed");
    expect(event.normalized).toBe(false);
    expect(event.normalizationStatus).toBe("blocked-signature");
    expect(event.routingStatus).toBe("blocked-signature");
    expect(event.conversationLookupStatus).toBe("skipped");
    expect(event.inboundPersistenceStatus).toBe("dry-run-only");
    expect(event.messagePersisted).toBe(false);
    expect(event.externalCalls).toBe(0);
    expect(serialized).not.toContain("invalid-sandbox-proof");
    expect(serialized).not.toContain("event-invalid-1");
  });

  it("detects duplicate delivery ids without creating unsafe provider actions", async () => {
    const { controller } = buildController();
    const payload = { message: { type: "text", length: 15 } };
    const signature = signPayload(payload);
    const request = {
      provider: "telegram" as const,
      channel: "telegram" as const,
      eventType: "message.created" as const,
      mode: "dry_run" as const,
      deliveryId: "delivery-duplicate-1",
      signature,
      payload
    };

    const first = await controller.createSandboxEvent(tenantId, undefined, request);
    const second = await controller.createSandboxEvent(tenantId, undefined, request);
    const events = controller.listEvents(tenantId);
    const serialized = JSON.stringify({ first, second, events });

    expect(first.replayDetected).toBe(false);
    expect(first.replayStatus).toBe("fresh");
    expect(second.replayDetected).toBe(true);
    expect(second.replayStatus).toBe("duplicate");
    expect(second.normalized).toBe(false);
    expect(second.normalizationStatus).toBe("blocked-replay");
    expect(second.routingStatus).toBe("blocked-replay");
    expect(second.conversationLookupStatus).toBe("skipped");
    expect(second.inboundPersistenceStatus).toBe("dry-run-only");
    expect(second.messagePersisted).toBe(false);
    expect(second.previousEventSeenAt).toEqual(expect.any(String));
    expect(events).toHaveLength(2);
    expect(events.every((event) => event.externalCalls === 0)).toBe(true);
    expect(serialized).not.toContain("delivery-duplicate-1");
    expect(serialized).not.toMatch(/outbound\.queued|outbound\.sent|line\.push|telegram\.send|facebook\.send|instagram\.send/i);
  });

  it("persists a safe inbound message only for explicit sandbox-persist with a route match", async () => {
    const conversations = {
      persistSandboxWebhookInboundMessage: vi.fn(async () => ({
        status: "matched",
        conversation: {
          id: "conversation-safe-internal",
          room: { channelAccountId: "sandbox:line" }
        },
        message: { id: "message-safe-internal" },
        duplicate: false
      }))
    };
    const { controller, audit } = buildController(conversations);
    const payload = lineMessagePayload("raw-route-room-58", "raw-sender-58", "Safe persisted sandbox inbound");
    const event = await controller.createSandboxEvent(tenantId, "user-api", {
      provider: "line",
      channel: "line",
      eventType: "message.created",
      mode: "sandbox",
      inboundPersistenceMode: "sandbox-persist",
      eventId: "event-persist-58",
      timestamp: "2026-06-01T03:00:00.000Z",
      signature: signPayload(payload),
      payload
    });
    const serialized = JSON.stringify(event);

    expect(conversations.persistSandboxWebhookInboundMessage).toHaveBeenCalledWith(expect.objectContaining({
      tenantId,
      platform: "line",
      channelAccountId: "sandbox:line",
      roomKey: "raw-route-room-58",
      text: "Safe persisted sandbox inbound",
      payloadDigest: expect.stringMatching(/^sha256:/),
      deliveryDigest: expect.stringMatching(/^sha256:/)
    }));
    expect(event).toMatchObject({
      signatureStatus: "verified",
      replayStatus: "fresh",
      normalizationStatus: "normalized",
      routingStatus: "matched",
      conversationLookupStatus: "matched",
      inboundPersistenceMode: "sandbox-persist",
      inboundPersistenceStatus: "persisted",
      messagePersisted: true,
      persistedMessageId: "message-safe-internal",
      conversationId: "conversation-safe-internal",
      inboundAuditStatus: "recorded",
      externalCalls: 0
    });
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({
      action: "provider_webhook.inbound_persistence_persisted",
      conversationId: "conversation-safe-internal",
      metadata: expect.objectContaining({
        status: "persisted",
        externalCalls: 0
      })
    }));
    expect(serialized).not.toContain("raw-route-room-58");
    expect(serialized).not.toContain("raw-sender-58");
    expect(serialized).not.toContain("event-persist-58");
    expect(serialized).not.toMatch(/replyToken|rawPayload|providerRaw|payloadJson|authorization|cookie|token|secret/i);
  });

  it("blocks sandbox-persist for invalid signatures before persistence", async () => {
    const conversations = { persistSandboxWebhookInboundMessage: vi.fn() };
    const { controller } = buildController(conversations);

    const event = await controller.createSandboxEvent(tenantId, undefined, {
      provider: "line",
      eventType: "message.created",
      mode: "sandbox",
      inboundPersistenceMode: "sandbox-persist",
      eventId: "event-invalid-persist-58",
      signature: "sha256=invalid-proof",
      payload: lineMessagePayload("raw-invalid-room-58", "raw-invalid-sender-58", "Safe blocked sandbox inbound")
    });

    expect(conversations.persistSandboxWebhookInboundMessage).not.toHaveBeenCalled();
    expect(event.inboundPersistenceStatus).toBe("blocked-signature");
    expect(event.messagePersisted).toBe(false);
    expect(event.conversationLookupStatus).toBe("skipped");
    expect(JSON.stringify(event)).not.toContain("invalid-proof");
  });

  it("blocks duplicate sandbox-persist events without creating a second message", async () => {
    const conversations = {
      persistSandboxWebhookInboundMessage: vi.fn(async () => ({
        status: "matched",
        conversation: {
          id: "conversation-safe-internal",
          room: { channelAccountId: "sandbox:line" }
        },
        message: { id: "message-safe-internal" },
        duplicate: false
      }))
    };
    const { controller } = buildController(conversations);
    const payload = lineMessagePayload("raw-duplicate-room-58", "raw-duplicate-sender-58", "Safe first inbound");
    const request = {
      provider: "line" as const,
      eventType: "message.created" as const,
      mode: "sandbox" as const,
      inboundPersistenceMode: "sandbox-persist" as const,
      eventId: "event-duplicate-persist-58",
      signature: signPayload(payload),
      payload
    };

    const first = await controller.createSandboxEvent(tenantId, undefined, request);
    const second = await controller.createSandboxEvent(tenantId, undefined, request);

    expect(first.messagePersisted).toBe(true);
    expect(second.replayDetected).toBe(true);
    expect(second.replayStatus).toBe("duplicate");
    expect(second.inboundPersistenceStatus).toBe("blocked-replay");
    expect(second.messagePersisted).toBe(false);
    expect(conversations.persistSandboxWebhookInboundMessage).toHaveBeenCalledTimes(1);
  });

  it("skips sandbox-persist safely when no existing route matches", async () => {
    const conversations = {
      persistSandboxWebhookInboundMessage: vi.fn(async () => ({
        status: "not-found",
        conversation: null,
        message: null,
        duplicate: false
      }))
    };
    const { controller } = buildController(conversations);
    const payload = lineMessagePayload("raw-no-match-room-58", "raw-no-match-sender-58", "Safe no match inbound");

    const event = await controller.createSandboxEvent(tenantId, undefined, {
      provider: "line",
      eventType: "message.created",
      mode: "sandbox",
      inboundPersistenceMode: "sandbox-persist",
      eventId: "event-no-match-58",
      signature: signPayload(payload),
      payload
    });

    expect(event.conversationLookupStatus).toBe("not-found");
    expect(event.inboundPersistenceStatus).toBe("skipped-no-match");
    expect(event.messagePersisted).toBe(false);
    expect(event.conversationId).toBeNull();
    expect(event.persistedMessageId).toBeNull();
  });

  it("keeps tenant event logs separated", async () => {
    const { controller } = buildController();
    const otherTenantId = "00000000-0000-4000-8000-000000000099";

    await controller.createSandboxEvent(tenantId, undefined, safePayload());
    await controller.createSandboxEvent(otherTenantId, undefined, {
      provider: "telegram",
      eventType: "webhook.verified",
      mode: "sandbox",
      payload: { updateId: "tg-safe" }
    });

    expect(controller.listEvents(tenantId).map((event) => event.provider)).toEqual(["line"]);
    expect(controller.listEvents(otherTenantId).map((event) => event.provider)).toEqual(["telegram"]);
  });

  it("rejects live provider outbound mode", async () => {
    process.env.PROVIDER_OUTBOUND_MODE = "real";
    const { controller } = buildController();

    await expect(controller.createSandboxEvent(tenantId, undefined, safePayload()))
      .rejects.toThrow("disabled while live provider mode is active");
  });
});

function buildController(conversations = {
  persistSandboxWebhookInboundMessage: vi.fn()
}) {
  const audit = {
    record: vi.fn(async () => ({ id: "audit-provider-webhook" }))
  };
  const service = new ProviderWebhookEventsService(audit as never, conversations as never);
  return {
    audit,
    service,
    controller: new ProviderWebhooksController(service)
  };
}

function lineMessagePayload(roomId: string, userId: string, text: string) {
  return {
    events: [{
      type: "message",
      replyToken: "raw-reply-token-must-not-return",
      source: { type: "room", userId, roomId },
      message: { id: "raw-message-id-must-not-return", type: "text", text }
    }]
  };
}

function safePayload() {
  return {
    provider: "line",
    eventType: "message.created",
    mode: "dry_run",
    payload: {
      message: { type: "text", length: 12 },
      accessToken: "sensitive-sample-a",
      rawPayload: "sensitive-provider-body",
      signature: "sensitive-sample-b",
      cookie: "sensitive-sample-c",
      authorization: "sensitive-sample-d"
    }
  };
}

function signPayload(payload: unknown) {
  return `sha256=${crypto
    .createHmac("sha256", "local-provider-webhook-sandbox-signing-material")
    .update(canonicalJson(payload))
    .digest("hex")}`;
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((item) => canonicalJson(item)).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) => left.localeCompare(right));
  return `{${entries.map(([key, child]) => `${JSON.stringify(key)}:${canonicalJson(child)}`).join(",")}}`;
}
