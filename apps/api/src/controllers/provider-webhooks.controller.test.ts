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
      "linkedConversationId",
      "linkedMessageId",
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
      "tenantId",
      "unmatchedInboundId",
      "unmatchedInboundQueued",
      "unmatchedLinkStatus",
      "unmatchedReason",
      "unmatchedResolvedAt",
      "unmatchedReviewActionStatus",
      "unmatchedStatus"
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
    expect(event.unmatchedInboundQueued).toBe(true);
    expect(event.unmatchedInboundId).toMatch(/^provider-webhook-unmatched-/);
    expect(event.unmatchedStatus).toBe("review-needed");
    expect(event.unmatchedReason).toBe("safe-review-required-no-conversation-match");
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
    expect(event.unmatchedInboundQueued).toBe(false);
    expect(event.unmatchedStatus).toBe("blocked");
    expect(event.unmatchedReason).toBe("blocked-signature");
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
    expect(second.unmatchedInboundQueued).toBe(false);
    expect(second.unmatchedStatus).toBeNull();
    expect(second.unmatchedReason).toBeNull();
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

  it("queues a safe unmatched review item when sandbox-persist has no existing route match", async () => {
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
    expect(event.unmatchedInboundQueued).toBe(true);
    expect(event.unmatchedInboundId).toMatch(/^provider-webhook-unmatched-/);
    expect(event.unmatchedStatus).toBe("review-needed");
    expect(event.unmatchedReason).toBe("safe-review-required-no-conversation-match");

    const unmatched = controller.listUnmatchedInbound(tenantId, undefined);
    const serialized = JSON.stringify({ event, unmatched });
    expect(unmatched).toHaveLength(1);
    expect(unmatched[0]).toMatchObject({
      id: event.unmatchedInboundId,
      tenantId,
      provider: "line",
      channelAccountId: "sandbox:line",
      mode: "sandbox",
      eventType: "message.created",
      normalizedEventType: "message",
      messageType: "text",
      normalizationStatus: "normalized",
      routingStatus: "dry-run-only",
      conversationLookupStatus: "not-found",
      unmatchedStatus: "review-needed",
      unmatchedReason: "safe-review-required-no-conversation-match",
      externalCalls: 0
    });
    expect(unmatched[0]?.payloadDigest).toMatch(/^sha256:/);
    expect(unmatched[0]?.providerEventDigest).toMatch(/^sha256:/);
    expect(unmatched[0]?.senderKeyDigest).toMatch(/^sha256:/);
    expect(unmatched[0]?.roomKeyDigest).toMatch(/^sha256:/);
    expect(unmatched[0]?.textPreview).toBe("Safe no match inbound");
    expect(serialized).not.toContain("raw-no-match-room-58");
    expect(serialized).not.toContain("raw-no-match-sender-58");
    expect(serialized).not.toContain("event-no-match-58");
    expect(serialized).not.toMatch(/replyToken|rawPayload|providerRaw|payloadJson|authorization|cookie|token|secret/i);
  });

  it("does not duplicate unmatched review items on replay", async () => {
    const conversations = {
      persistSandboxWebhookInboundMessage: vi.fn(async () => ({
        status: "not-found",
        conversation: null,
        message: null,
        duplicate: false
      }))
    };
    const { controller } = buildController(conversations);
    const payload = lineMessagePayload("raw-no-match-room-59", "raw-no-match-sender-59", "Safe duplicate unmatched inbound");
    const request = {
      provider: "line" as const,
      eventType: "message.created" as const,
      mode: "sandbox" as const,
      inboundPersistenceMode: "sandbox-persist" as const,
      eventId: "event-no-match-duplicate-59",
      signature: signPayload(payload),
      payload
    };

    const first = await controller.createSandboxEvent(tenantId, undefined, request);
    const second = await controller.createSandboxEvent(tenantId, undefined, request);
    const unmatched = controller.listUnmatchedInbound(tenantId, undefined);

    expect(first.unmatchedInboundQueued).toBe(true);
    expect(second.replayDetected).toBe(true);
    expect(second.inboundPersistenceStatus).toBe("blocked-replay");
    expect(second.unmatchedInboundQueued).toBe(false);
    expect(second.unmatchedStatus).toBe("duplicate-skipped");
    expect(unmatched).toHaveLength(1);
    expect(conversations.persistSandboxWebhookInboundMessage).toHaveBeenCalledTimes(1);
  });

  it("skips unsupported sandbox events without queueing unmatched items", async () => {
    const conversations = { persistSandboxWebhookInboundMessage: vi.fn() };
    const { controller } = buildController(conversations);
    const payload = { not_supported: true };

    const event = await controller.createSandboxEvent(tenantId, undefined, {
      provider: "line",
      eventType: "message.created",
      mode: "sandbox",
      inboundPersistenceMode: "sandbox-persist",
      eventId: "event-unsupported-59",
      signature: signPayload(payload),
      payload
    });

    expect(event.normalizationStatus).toBe("unsupported");
    expect(event.inboundPersistenceStatus).toBe("unsupported");
    expect(event.unmatchedInboundQueued).toBe(false);
    expect(event.unmatchedStatus).toBe("skipped");
    expect(event.unmatchedReason).toBe("unsupported");
    expect(controller.listUnmatchedInbound(tenantId, undefined)).toHaveLength(0);
    expect(conversations.persistSandboxWebhookInboundMessage).not.toHaveBeenCalled();
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

  it("keeps unmatched inbound review lists tenant scoped", async () => {
    const conversations = {
      persistSandboxWebhookInboundMessage: vi.fn(async () => ({
        status: "not-found",
        conversation: null,
        message: null,
        duplicate: false
      }))
    };
    const { controller } = buildController(conversations);
    const otherTenantId = "00000000-0000-4000-8000-000000000099";
    const firstPayload = lineMessagePayload("raw-tenant-room-1", "raw-tenant-sender-1", "Safe tenant one");
    const secondPayload = lineMessagePayload("raw-tenant-room-2", "raw-tenant-sender-2", "Safe tenant two");

    await controller.createSandboxEvent(tenantId, undefined, {
      provider: "line",
      eventType: "message.created",
      mode: "sandbox",
      inboundPersistenceMode: "sandbox-persist",
      eventId: "event-tenant-one-59",
      signature: signPayload(firstPayload),
      payload: firstPayload
    });
    await controller.createSandboxEvent(otherTenantId, undefined, {
      provider: "line",
      eventType: "message.created",
      mode: "sandbox",
      inboundPersistenceMode: "sandbox-persist",
      eventId: "event-tenant-two-59",
      signature: signPayload(secondPayload),
      payload: secondPayload
    });

    expect(controller.listUnmatchedInbound(tenantId, undefined).map((item) => item.textPreview)).toEqual(["Safe tenant one"]);
    expect(controller.listUnmatchedInbound(otherTenantId, "open").map((item) => item.textPreview)).toEqual(["Safe tenant two"]);
  });

  it("filters unmatched inbound review lists by safe query fields", async () => {
    const { controller } = buildController(noMatchConversations());
    const reviewedItem = await createUnmatched(controller, "raw-filter-reviewed-room-62", "event-filter-reviewed-62", "Safe reviewed filter");
    const pendingItem = await createUnmatched(controller, "raw-filter-pending-room-62", "event-filter-pending-62", "Safe pending filter");
    await controller.reviewUnmatchedInbound(tenantId, "user-api", reviewedItem.id, { status: "reviewed" });

    const pending = controller.listUnmatchedInbound(tenantId, {
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      status: "open",
      eventType: "message.created",
      limit: "5"
    });
    const reviewed = controller.listUnmatchedInbound(tenantId, {
      reviewStatus: "reviewed",
      unmatchedStatus: "reviewed"
    });

    expect(pending.map((item) => item.id)).toEqual([pendingItem.id]);
    expect(reviewed.map((item) => item.id)).toEqual([reviewedItem.id]);
    expect(() => controller.listUnmatchedInbound(tenantId, { provider: "webchat" })).toThrow(BadRequestException);
    expect(JSON.stringify({ pending, reviewed })).not.toMatch(/raw-filter|replyToken|rawPayload|providerRaw|payloadJson|authorization|cookie|token|secret/i);
  });

  it("requires tenant ids for unmatched review actions", async () => {
    const { controller } = buildController();

    expect(() => controller.reviewUnmatchedInbound(undefined, undefined, "provider-webhook-unmatched-missing", { status: "reviewed" }))
      .toThrow(BadRequestException);
    expect(() => controller.linkUnmatchedInboundToConversation("", undefined, "provider-webhook-unmatched-missing", {
      conversationId: "conversation-safe-internal",
      actionMode: "link-only"
    })).toThrow(BadRequestException);
  });

  it("marks unmatched inbound items reviewed and skipped safely", async () => {
    const { controller, audit } = buildController(noMatchConversations());
    const reviewedItem = await createUnmatched(controller, "raw-review-room-60", "event-review-60", "Safe review Sprint 60");
    const skippedItem = await createUnmatched(controller, "raw-skip-room-60", "event-skip-60", "Safe skip Sprint 60");

    const reviewed = await controller.reviewUnmatchedInbound(tenantId, "user-api", reviewedItem.id, {
      status: "reviewed",
      reason: "safe manual review"
    });
    const skipped = await controller.reviewUnmatchedInbound(tenantId, "user-api", skippedItem.id, { status: "skipped" });
    const serialized = JSON.stringify({ reviewed, skipped, events: controller.listEvents(tenantId) });

    expect(reviewed).toMatchObject({
      id: reviewedItem.id,
      tenantId,
      unmatchedStatus: "reviewed",
      reviewStatus: "reviewed",
      reviewedBy: "user-api",
      reviewReason: "safe manual review",
      externalCalls: 0
    });
    expect(skipped).toMatchObject({
      id: skippedItem.id,
      unmatchedStatus: "skipped",
      reviewStatus: "skipped",
      externalCalls: 0
    });
    expect(reviewed.reviewedAt).toEqual(expect.any(String));
    expect(reviewed.unmatchedResolvedAt).toEqual(expect.any(String));
    expect(controller.listUnmatchedInbound(tenantId, "reviewed")).toHaveLength(1);
    expect(controller.listUnmatchedInbound(tenantId, "skipped")).toHaveLength(1);
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({
      action: "provider_webhook.unmatched_inbound_reviewed",
      metadata: expect.objectContaining({
        unmatchedInboundId: reviewedItem.id,
        status: "reviewed",
        externalCalls: 0
      })
    }));
    expect(serialized).not.toMatch(/raw-review-room-60|raw-skip-room-60|replyToken|rawPayload|providerRaw|payloadJson|authorization|cookie|token|secret/i);
  });

  it("keeps unmatched review actions tenant scoped", async () => {
    const { controller } = buildController(noMatchConversations());
    const item = await createUnmatched(controller, "raw-tenant-scope-room-60", "event-tenant-scope-60", "Safe tenant scoped review");

    await expect(controller.reviewUnmatchedInbound("00000000-0000-4000-8000-000000000099", "user-api", item.id, { status: "reviewed" }))
      .rejects.toThrow("Unmatched inbound item not found");
  });

  it("returns safe candidate conversations for tenant-owned unmatched items only", async () => {
    const conversations = {
      ...noMatchConversations(),
      findSafeProviderWebhookCandidateConversations: vi.fn(async () => ([{
        conversationId: "conversation-safe-internal",
        platform: "line",
        channelAccountId: "sandbox:line",
        roomIdDigest: "sha256:saferoomdigest",
        safeRoomLabel: "line conversation digest match",
        latestMessagePreview: "Safe candidate preview",
        latestMessageAt: "2026-05-31T00:00:00.000Z",
        matchReason: "platform, channel account, and room digest match",
        matchConfidence: 0.98,
        externalCalls: 0
      }]))
    };
    const { controller } = buildController(conversations);
    const item = await createUnmatched(controller, "raw-candidate-room-62", "event-candidate-62", "Safe candidate lookup");

    const candidates = await controller.listUnmatchedInboundCandidates(tenantId, item.id);

    expect(conversations.findSafeProviderWebhookCandidateConversations).toHaveBeenCalledWith({
      tenantId,
      platform: "line",
      channelAccountId: "sandbox:line",
      roomKeyDigest: item.roomKeyDigest,
      limit: 5
    });
    expect(candidates).toEqual([expect.objectContaining({
      conversationId: "conversation-safe-internal",
      platform: "line",
      channelAccountId: "sandbox:line",
      roomIdDigest: "sha256:saferoomdigest",
      externalCalls: 0
    })]);
    expect(JSON.stringify(candidates)).not.toMatch(/raw-candidate|raw-sender|replyToken|rawPayload|providerRaw|payloadJson|authorization|cookie|token|secret/i);
    await expect(controller.listUnmatchedInboundCandidates("00000000-0000-4000-8000-000000000099", item.id))
      .rejects.toThrow("Unmatched inbound item not found");
  });

  it("rejects unsafe conversation links and records safe rejected status", async () => {
    const { controller, audit } = buildController({
      ...noMatchConversations(),
      getSafeConversationLinkContext: vi.fn(async () => ({
        id: "conversation-platform-mismatch",
        tenantId,
        platform: "telegram",
        channelAccountId: "sandbox:line",
        roomId: "room-safe",
        roomKeyDigest: "sha256:mismatch",
        externalCalls: 0
      }))
    });
    const item = await createUnmatched(controller, "raw-link-reject-room-60", "event-link-reject-60", "Safe rejected link");

    await expect(controller.linkUnmatchedInboundToConversation(tenantId, "user-api", item.id, {
      conversationId: "conversation-platform-mismatch",
      actionMode: "link-only"
    })).rejects.toThrow("platform mismatch");

    expect(controller.listUnmatchedInbound(tenantId, undefined)[0]).toMatchObject({
      id: item.id,
      unmatchedStatus: "review-needed",
      linkStatus: "rejected",
      externalCalls: 0
    });
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({
      action: "provider_webhook.unmatched_inbound_link_rejected",
      metadata: expect.objectContaining({
        conversationId: "conversation-platform-mismatch",
        status: "rejected",
        externalCalls: 0
      })
    }));
  });

  it("links unmatched inbound to an existing conversation without persisting a message", async () => {
    const { controller, conversations } = buildController(noMatchConversations());
    const item = await createUnmatched(controller, "raw-link-room-60", "event-link-only-60", "Safe link only");
    conversations.getSafeConversationLinkContext = vi.fn(async () => ({
      id: "conversation-safe-internal",
      tenantId,
      platform: "line",
      channelAccountId: "sandbox:line",
      roomId: "room-safe",
      roomKeyDigest: item.roomKeyDigest,
      externalCalls: 0
    }));
    conversations.persistLinkedSandboxWebhookInboundMessage = vi.fn();

    const linked = await controller.linkUnmatchedInboundToConversation(tenantId, "user-api", item.id, {
      conversationId: "conversation-safe-internal",
      actionMode: "link-only"
    });

    expect(linked).toMatchObject({
      unmatchedStatus: "linked",
      reviewStatus: "linked",
      linkStatus: "linked",
      linkedConversationId: "conversation-safe-internal",
      linkedMessageId: null,
      messagePersisted: false,
      externalCalls: 0
    });
    expect(conversations.persistLinkedSandboxWebhookInboundMessage).not.toHaveBeenCalled();
  });

  it("persists one safe inbound message for link-and-persist and no-ops duplicates", async () => {
    const { controller, conversations } = buildController(noMatchConversations());
    const item = await createUnmatched(controller, "raw-link-persist-room-60", "event-link-persist-60", "Safe link persist");
    conversations.getSafeConversationLinkContext = vi.fn(async () => ({
      id: "conversation-safe-internal",
      tenantId,
      platform: "line",
      channelAccountId: "sandbox:line",
      roomId: "room-safe",
      roomKeyDigest: item.roomKeyDigest,
      externalCalls: 0
    }));
    conversations.persistLinkedSandboxWebhookInboundMessage = vi.fn(async () => ({
      conversation: { id: "conversation-safe-internal" },
      message: { id: "message-safe-linked" },
      duplicate: false
    }));

    const linked = await controller.linkUnmatchedInboundToConversation(tenantId, "user-api", item.id, {
      conversationId: "conversation-safe-internal",
      actionMode: "link-and-persist-safe-message"
    });
    const duplicate = await controller.linkUnmatchedInboundToConversation(tenantId, "user-api", item.id, {
      conversationId: "conversation-safe-internal",
      actionMode: "link-and-persist-safe-message"
    });

    expect(conversations.persistLinkedSandboxWebhookInboundMessage).toHaveBeenCalledTimes(1);
    expect(linked).toMatchObject({
      linkStatus: "linked-message-persisted",
      linkedMessageId: "message-safe-linked",
      messagePersisted: true,
      externalCalls: 0
    });
    expect(duplicate.id).toBe(linked.id);
    expect(JSON.stringify({ linked, duplicate })).not.toMatch(/raw-link-persist-room-60|replyToken|rawPayload|providerRaw|payloadJson|authorization|cookie|token|secret/i);
  });

  it("rejects live provider outbound mode", async () => {
    process.env.PROVIDER_OUTBOUND_MODE = "real";
    const { controller } = buildController();

    await expect(controller.createSandboxEvent(tenantId, undefined, safePayload()))
      .rejects.toThrow("disabled while live provider mode is active");
  });
});

function buildController(conversations: Record<string, unknown> = {
  persistSandboxWebhookInboundMessage: vi.fn()
}) {
  const audit = {
    record: vi.fn(async () => ({ id: "audit-provider-webhook" }))
  };
  const service = new ProviderWebhookEventsService(audit as never, conversations as never);
  return {
    audit,
    conversations: conversations as Record<string, ReturnType<typeof vi.fn>>,
    service,
    controller: new ProviderWebhooksController(service)
  };
}

function noMatchConversations() {
  return {
    persistSandboxWebhookInboundMessage: vi.fn(async () => ({
      status: "not-found",
      conversation: null,
      message: null,
      duplicate: false
    })),
    getSafeConversationLinkContext: vi.fn(),
    findSafeProviderWebhookCandidateConversations: vi.fn(async () => []),
    persistLinkedSandboxWebhookInboundMessage: vi.fn()
  };
}

async function createUnmatched(controller: ProviderWebhooksController, roomId: string, eventId: string, text: string) {
  const payload = lineMessagePayload(roomId, `raw-sender-${eventId}`, text);
  Object.assign(payload, { [`safeMarker${eventId.replace(/[^a-z0-9]/gi, "")}`]: true });
  const event = await controller.createSandboxEvent(tenantId, undefined, {
    provider: "line",
    eventType: "message.created",
    mode: "sandbox",
    inboundPersistenceMode: "sandbox-persist",
    eventId,
    signature: signPayload(payload),
    payload
  });
  const item = controller.listUnmatchedInbound(tenantId, undefined).find((candidate) => candidate.id === event.unmatchedInboundId);
  if (!item) throw new Error("Expected unmatched item to be queued");
  return item;
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
