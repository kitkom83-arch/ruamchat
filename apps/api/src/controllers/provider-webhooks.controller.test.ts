import { BadRequestException } from "@nestjs/common";
import crypto from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ProviderWebhookUnmatchedInboundFilters, ProviderWebhookUnmatchedInboundItem, ProviderWebhookUnmatchedInboundStatusFilter } from "@ai-omni/shared";
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

    expect(listUnmatchedItems(controller, tenantId, undefined).map((item) => item.textPreview)).toEqual(["Safe tenant one"]);
    expect(listUnmatchedItems(controller, otherTenantId, "open").map((item) => item.textPreview)).toEqual(["Safe tenant two"]);
  });

  it("filters unmatched inbound review lists by safe query fields", async () => {
    const { controller } = buildController(noMatchConversations());
    const reviewedItem = await createUnmatched(controller, "raw-filter-reviewed-room-62", "event-filter-reviewed-62", "Safe reviewed filter");
    const pendingItem = await createUnmatched(controller, "raw-filter-pending-room-62", "event-filter-pending-62", "Safe pending filter");
    await controller.reviewUnmatchedInbound(tenantId, "user-api", reviewedItem.id, { status: "reviewed" });

    const pending = listUnmatchedItems(controller, tenantId, {
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      status: "open",
      eventType: "message.created",
      limit: 5
    });
    const reviewed = listUnmatchedItems(controller, tenantId, {
      reviewStatus: "reviewed",
      unmatchedStatus: "reviewed"
    });

    expect(pending.map((item) => item.id)).toEqual([pendingItem.id]);
    expect(reviewed.map((item) => item.id)).toEqual([reviewedItem.id]);
    expect(() => controller.listUnmatchedInbound(tenantId, { provider: "webchat" })).toThrow(BadRequestException);
    expect(JSON.stringify({ pending, reviewed })).not.toMatch(/raw-filter|replyToken|rawPayload|providerRaw|payloadJson|authorization|cookie|token|secret/i);
  });

  it("returns tenant-scoped paginated unmatched review metadata safely", async () => {
    const { controller } = buildController(noMatchConversations());
    const otherTenantId = "00000000-0000-4000-8000-000000000099";
    const first = await createUnmatched(controller, "raw-page-room-one-63", "event-page-one-63", "Safe page one");
    const second = await createUnmatched(controller, "raw-page-room-two-63", "event-page-two-63", "Safe page two");
    await controller.createSandboxEvent(otherTenantId, undefined, {
      provider: "line",
      eventType: "message.created",
      mode: "sandbox",
      inboundPersistenceMode: "sandbox-persist",
      eventId: "event-page-other-63",
      signature: signPayload(lineMessagePayload("raw-page-room-other-63", "raw-page-sender-other-63", "Safe page other")),
      payload: lineMessagePayload("raw-page-room-other-63", "raw-page-sender-other-63", "Safe page other")
    });

    const page = controller.listUnmatchedInbound(tenantId, {
      limit: "1",
      offset: "0",
      sortBy: "receivedAt",
      sortOrder: "desc",
      provider: "line",
      receivedAtFrom: "2026-01-01T00:00:00.000Z"
    }) as ReturnType<ProviderWebhookEventsService["listUnmatchedInboundPage"]>;
    const serialized = JSON.stringify(page);

    expect(page).toMatchObject({
      pagination: {
        totalCount: 2,
        limit: 1,
        offset: 0,
        returnedCount: 1,
        hasNextPage: true,
        hasPreviousPage: false
      },
      appliedSort: {
        sortBy: "receivedAt",
        sortOrder: "desc"
      },
      summary: {
        openCount: 2,
        reviewedCount: 0,
        skippedCount: 0,
        linkedCount: 0
      },
      externalCalls: 0
    });
    expect(page.items).toHaveLength(1);
    expect(page.items.every((item) => item.tenantId === tenantId)).toBe(true);
    expect([first.id, second.id]).toContain(page.items[0]?.id);
    expect(serialized).not.toMatch(/raw-page|replyToken|rawPayload|providerRaw|payloadJson|authorization|cookie|token|secret/i);
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

  it("bulk reviews unmatched items with dedupe and idempotent repeat", async () => {
    const { controller, audit } = buildController(noMatchConversations());
    const first = await createUnmatched(controller, "raw-bulk-review-room-one-63", "event-bulk-review-one-63", "Safe bulk review one");
    const second = await createUnmatched(controller, "raw-bulk-review-room-two-63", "event-bulk-review-two-63", "Safe bulk review two");

    const result = await controller.bulkReviewUnmatchedInbound(tenantId, "user-api", {
      ids: [first.id, first.id, second.id],
      reviewStatus: "reviewed",
      reason: "safe bulk review"
    });
    const repeat = await controller.bulkReviewUnmatchedInbound(tenantId, "user-api", {
      ids: [first.id, second.id],
      reviewStatus: "reviewed"
    });
    const reviewedPage = controller.listUnmatchedInbound(tenantId, {
      reviewStatus: "reviewed",
      offset: "0",
      limit: "10",
      sortBy: "receivedAt",
      sortOrder: "desc"
    }) as ReturnType<ProviderWebhookEventsService["listUnmatchedInboundPage"]>;
    const serialized = JSON.stringify({ result, repeat, reviewedPage });

    expect(result.summary).toMatchObject({
      requestedCount: 3,
      dedupedCount: 2,
      successCount: 2,
      errorCount: 0,
      updatedCount: 2,
      alreadyAppliedCount: 0
    });
    expect(result.results.map((item) => item.resultStatus)).toEqual(["updated", "updated"]);
    expect(repeat.summary).toMatchObject({
      successCount: 2,
      errorCount: 0,
      updatedCount: 0,
      alreadyAppliedCount: 2
    });
    expect(reviewedPage.items.filter((item) => [first.id, second.id].includes(item.id))).toHaveLength(2);
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({
      action: "provider_webhook.unmatched_inbound_bulk_reviewed",
      metadata: expect.objectContaining({
        status: "reviewed",
        externalCalls: 0
      })
    }));
    expect(serialized).not.toMatch(/raw-bulk-review|replyToken|rawPayload|providerRaw|payloadJson|authorization|cookie|token|secret|raw sender|raw room/i);
  });

  it("bulk skips unmatched items and preserves safe conversation separation fields", async () => {
    const { controller } = buildController(noMatchConversations());
    const item = await createUnmatched(controller, "raw-bulk-skip-room-63", "event-bulk-skip-63", "Safe bulk skip");
    const before = { provider: item.provider, channelAccountId: item.channelAccountId, roomKeyDigest: item.roomKeyDigest };

    const result = await controller.bulkReviewUnmatchedInbound(tenantId, "user-api", {
      ids: [item.id],
      reviewStatus: "skipped"
    });
    const refetched = controller.listUnmatchedInbound(tenantId, "skipped")[0];

    expect(result.results[0]).toMatchObject({
      id: item.id,
      ok: true,
      resultStatus: "updated",
      reviewStatus: "skipped",
      unmatchedStatus: "skipped",
      externalCalls: 0
    });
    expect(refetched).toMatchObject({
      id: item.id,
      provider: before.provider,
      channelAccountId: before.channelAccountId,
      roomKeyDigest: before.roomKeyDigest,
      reviewStatus: "skipped",
      unmatchedStatus: "skipped",
      externalCalls: 0
    });
  });

  it("validates bulk review tenant ownership and rejects unsafe batch bodies", async () => {
    const { controller } = buildController(noMatchConversations());
    const otherTenantId = "00000000-0000-4000-8000-000000000099";
    await controller.createSandboxEvent(otherTenantId, undefined, {
      provider: "line",
      eventType: "message.created",
      mode: "sandbox",
      inboundPersistenceMode: "sandbox-persist",
      eventId: "event-bulk-other-tenant-63",
      signature: signPayload(lineMessagePayload("raw-bulk-other-room-63", "raw-bulk-other-sender-63", "Safe other tenant")),
      payload: lineMessagePayload("raw-bulk-other-room-63", "raw-bulk-other-sender-63", "Safe other tenant")
    });
    const otherItem = controller.listUnmatchedInbound(otherTenantId, undefined)[0];

    const result = await controller.bulkReviewUnmatchedInbound(tenantId, "user-api", {
      ids: [otherItem.id],
      reviewStatus: "reviewed"
    });

    expect(() => controller.bulkReviewUnmatchedInbound(undefined, "user-api", { ids: [otherItem.id], reviewStatus: "reviewed" }))
      .toThrow(BadRequestException);
    await expect(controller.bulkReviewUnmatchedInbound(tenantId, "user-api", { ids: [], reviewStatus: "reviewed" }))
      .rejects.toThrow("Invalid unmatched inbound bulk review request");
    await expect(controller.bulkReviewUnmatchedInbound(tenantId, "user-api", { ids: Array.from({ length: 51 }, (_, index) => `safe-${index}`), reviewStatus: "reviewed" }))
      .rejects.toThrow("Invalid unmatched inbound bulk review request");
    expect(result.results).toEqual([expect.objectContaining({
      id: otherItem.id,
      ok: false,
      resultStatus: "not-found",
      externalCalls: 0
    })]);
    expect(controller.listUnmatchedInbound(otherTenantId, undefined)[0]).toMatchObject({
      id: otherItem.id,
      reviewStatus: "pending",
      unmatchedStatus: "review-needed"
    });
    expect(JSON.stringify(result)).not.toMatch(/raw-bulk-other|replyToken|rawPayload|providerRaw|payloadJson|authorization|cookie|token|secret/i);
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

  it("returns tenant-scoped safe unmatched inbound history without raw provider fields", async () => {
    const { controller } = buildController(noMatchConversations());
    const reviewedItem = await createUnmatched(controller, "raw-history-room-64", "event-history-64", "Safe history review");
    const bulkItem = await createUnmatched(controller, "raw-history-bulk-room-64", "event-history-bulk-64", "Safe history bulk");

    await controller.reviewUnmatchedInbound(tenantId, "user-api", reviewedItem.id, {
      status: "reviewed",
      reason: "safe history review"
    });
    await controller.bulkReviewUnmatchedInbound(tenantId, "user-api", {
      ids: [bulkItem.id],
      reviewStatus: "skipped",
      reason: "safe history bulk skip"
    });

    const reviewedHistory = controller.listUnmatchedInboundHistory(tenantId, reviewedItem.id);
    const bulkHistory = controller.listUnmatchedInboundHistory(tenantId, bulkItem.id);
    const serialized = JSON.stringify({ reviewedHistory, bulkHistory });

    expect(reviewedHistory).toMatchObject({
      unmatchedInboundId: reviewedItem.id,
      provider: "line",
      channelAccountId: "sandbox:line",
      roomKeyDigest: reviewedItem.roomKeyDigest,
      externalCalls: 0
    });
    expect(reviewedHistory.safeRoomLabel).toContain("room digest");
    expect(reviewedHistory.entries.map((entry) => entry.action)).toEqual(expect.arrayContaining([
      "inbound_received",
      "normalized_routed",
      "unmatched_queued",
      "reviewed"
    ]));
    expect(reviewedHistory.entries.find((entry) => entry.action === "reviewed")).toMatchObject({
      actor: "user-api",
      reason: "safe history review",
      statusAfter: "reviewed",
      externalCalls: 0
    });
    expect(bulkHistory.entries.map((entry) => entry.action)).toContain("bulk_skipped");
    expect(bulkHistory.entries.find((entry) => entry.action === "bulk_skipped")).toMatchObject({
      actor: "user-api",
      statusAfter: "skipped",
      externalCalls: 0
    });
    expect(() => controller.listUnmatchedInboundHistory("00000000-0000-4000-8000-000000000099", reviewedItem.id))
      .toThrow("Unmatched inbound item not found");
    expect(() => controller.listUnmatchedInboundHistory(undefined, reviewedItem.id)).toThrow(BadRequestException);
    expect(serialized).not.toMatch(/raw-history|raw-sender|raw-message-id|replyToken|rawPayload|providerRaw|payloadJson|authorization|cookie|token|secret|raw room|raw sender/i);
  });

  it("returns tenant-scoped safe review metrics with filters and no raw provider fields", async () => {
    const { controller } = buildController(noMatchConversations());
    const pendingItem = await createUnmatched(controller, "raw-metrics-pending-room-65", "event-metrics-pending-65", "Safe metrics pending");
    const reviewedItem = await createUnmatched(controller, "raw-metrics-reviewed-room-65", "event-metrics-reviewed-65", "Safe metrics reviewed");
    await controller.reviewUnmatchedInbound(tenantId, "user-api", reviewedItem.id, { status: "reviewed" });

    const allMetrics = controller.getReviewMetrics(tenantId, {});
    const pendingMetrics = controller.getReviewMetrics(tenantId, {
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      eventType: "message.created"
    });
    const serialized = JSON.stringify({ allMetrics, pendingMetrics });

    expect(() => controller.getReviewMetrics(undefined, {})).toThrow(BadRequestException);
    expect(allMetrics).toMatchObject({
      externalCalls: 0,
      totalEvents: 2,
      totalUnmatched: 2,
      reviewedCount: 1,
      openUnmatched: 1
    });
    expect(pendingMetrics).toMatchObject({
      appliedFilters: {
        provider: "line",
        reviewStatus: "pending",
        linkStatus: "none",
        unmatchedStatus: "review-needed",
        eventType: "message.created"
      },
      totalUnmatched: 1,
      openUnmatched: 1,
      reviewedCount: 0,
      skippedCount: 0,
      linkedCount: 0,
      externalCalls: 0
    });
    expect(pendingMetrics.byProvider.find((item) => item.key === "line")?.count).toBe(1);
    expect(pendingMetrics.byReviewStatus.find((item) => item.key === "pending")?.count).toBe(1);
    expect(pendingMetrics.byLinkStatus.find((item) => item.key === "none")?.count).toBe(1);
    expect(pendingMetrics.byUnmatchedStatus.find((item) => item.key === "review-needed")?.count).toBe(1);
    expect(pendingMetrics.byEventType.find((item) => item.key === "message.created")?.count).toBe(1);
    expect(pendingMetrics.latestReceivedAt).toEqual(pendingItem.receivedAt);
    expect(pendingMetrics.funnel.unmatchedQueued).toBe(1);
    expect(serialized).not.toContain("raw-metrics");
    expect(serialized).not.toContain(reviewedItem.senderKeyDigest?.replace("sha256:", "") ?? "not-present-65");
    expect(serialized).not.toMatch(/replyToken|rawPayload|providerRaw|payloadJson|authorization|cookie|token|secret|raw room|raw sender|senderId|roomId/i);
  });

  it("keeps review metrics tenant scoped", async () => {
    const { controller } = buildController(noMatchConversations());
    const otherTenantId = "00000000-0000-4000-8000-000000000099";
    await createUnmatched(controller, "raw-metrics-tenant-room-65", "event-metrics-tenant-65", "Safe other tenant metrics");

    const otherMetrics = controller.getReviewMetrics(otherTenantId, {});
    const currentMetrics = controller.getReviewMetrics(tenantId, {});

    expect(currentMetrics.totalUnmatched).toBe(1);
    expect(otherMetrics.totalUnmatched).toBe(0);
    expect(otherMetrics.externalCalls).toBe(0);
    expect(JSON.stringify(otherMetrics)).not.toMatch(/raw-metrics-tenant|replyToken|rawPayload|providerRaw|payloadJson|authorization|cookie|token|secret/i);
  });

  it("returns tenant-scoped safe review alerts with SLA thresholds and filters", async () => {
    const { controller } = buildController(noMatchConversations());
    const criticalItem = await createUnmatched(controller, "raw-alert-room-66", "event-alert-critical-66", "Safe alert critical");
    criticalItem.receivedAt = "2026-05-28T00:00:00.000Z";
    const reviewedItem = await createUnmatched(controller, "raw-alert-reviewed-room-66", "event-alert-reviewed-66", "Safe alert reviewed");
    await controller.reviewUnmatchedInbound(tenantId, "user-api", reviewedItem.id, { status: "reviewed" });

    const alerts = controller.getReviewAlerts(tenantId, {
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      eventType: "message.created",
      severity: "critical"
    });
    const otherAlerts = controller.getReviewAlerts("00000000-0000-4000-8000-000000000099", {});
    const serialized = JSON.stringify({ alerts, otherAlerts });

    expect(() => controller.getReviewAlerts(undefined, {})).toThrow(BadRequestException);
    expect(() => controller.getReviewAlerts(tenantId, { severity: "urgent" })).toThrow(BadRequestException);
    expect(alerts).toMatchObject({
      appliedFilters: {
        provider: "line",
        reviewStatus: "pending",
        linkStatus: "none",
        unmatchedStatus: "review-needed",
        eventType: "message.created",
        severity: "critical"
      },
      totalAlerts: 1,
      infoCount: 0,
      warningCount: 0,
      criticalCount: 1,
      staleOpenCount: 1,
      overSlaCount: 1,
      oldestOpenReceivedAt: criticalItem.receivedAt,
      thresholds: {
        staleWarningHours: 24,
        staleCriticalHours: 72,
        overSlaHours: 48
      },
      externalCalls: 0
    });
    expect(alerts.byProvider.find((item) => item.key === "line")?.count).toBe(1);
    expect(alerts.byPlatform.find((item) => item.key === "line")?.count).toBe(1);
    expect(alerts.bySeverity.find((item) => item.key === "critical")?.count).toBe(1);
    expect(alerts.alertItems).toEqual([expect.objectContaining({
      unmatchedId: criticalItem.id,
      provider: "line",
      platform: "line",
      channelAccountId: "sandbox:line",
      safeRoomLabel: expect.stringContaining("room digest"),
      roomKeyDigest: criticalItem.roomKeyDigest,
      eventType: "message.created",
      ageBucket: "over3Days",
      severity: "critical",
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      routingOutcome: "dry-run-only/not-found",
      diagnosticsAvailable: true,
      historyAvailable: true,
      externalCalls: 0
    })]);
    expect(otherAlerts.totalAlerts).toBe(0);
    expect(otherAlerts.externalCalls).toBe(0);
    expect(serialized).not.toContain("raw-alert-room-66");
    expect(serialized).not.toContain("raw-sender-event-alert-critical-66");
    expect(serialized).not.toMatch(/replyToken|rawPayload|providerRaw|payloadJson|authorization|cookie|token|secret|raw room|raw sender|senderId|roomId/i);
  });

  it("returns safe diagnostics for tenant-owned unmatched items only", async () => {
    const { controller } = buildController(noMatchConversations());
    const item = await createUnmatched(controller, "raw-diagnostics-room-65", "event-diagnostics-65", "Safe diagnostics");

    const diagnostics = controller.getUnmatchedInboundDiagnostics(tenantId, item.id);
    const serialized = JSON.stringify(diagnostics);

    expect(diagnostics).toMatchObject({
      unmatchedId: item.id,
      provider: "line",
      platform: "line",
      channelAccountId: "sandbox:line",
      safeRoomLabel: expect.stringContaining("room digest"),
      roomKeyDigest: item.roomKeyDigest,
      eventType: "message.created",
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      routingOutcome: "dry-run-only/not-found",
      normalizedEventType: "message",
      persistenceOutcome: "skipped-no-match",
      candidateLookupAvailable: true,
      historyAvailable: true,
      exportAvailable: true,
      externalCalls: 0
    });
    expect(diagnostics.safeWarnings).toMatchObject({
      signatureRejected: false,
      replayDuplicate: false,
      missingConversationMatch: true
    });
    expect(() => controller.getUnmatchedInboundDiagnostics("00000000-0000-4000-8000-000000000099", item.id))
      .toThrow("Unmatched inbound item not found");
    expect(() => controller.getUnmatchedInboundDiagnostics(undefined, item.id)).toThrow(BadRequestException);
    expect(serialized).not.toContain("raw-diagnostics-room-65");
    expect(serialized).not.toContain("raw-sender-event-diagnostics-65");
    expect(serialized).not.toMatch(/replyToken|rawPayload|providerRaw|payloadJson|authorization|cookie|token|secret|raw room|raw sender|senderId|roomId/i);
  });

  it("exports the safe unmatched inbound queue with filters, sort, page, and capped limits", async () => {
    const { controller } = buildController(noMatchConversations());
    const first = await createUnmatched(controller, "raw-export-room-one-64", "event-export-one-64", "Safe export one");
    const second = await createUnmatched(controller, "raw-export-room-two-64", "event-export-two-64", "Safe export two");
    await controller.reviewUnmatchedInbound(tenantId, "user-api", second.id, {
      status: "reviewed",
      reason: "safe export reviewed"
    });

    const exported = controller.exportUnmatchedInbound(tenantId, {
      provider: "line",
      reviewStatus: "pending",
      eventType: "message.created",
      sortBy: "receivedAt",
      sortOrder: "desc",
      offset: "0",
      limit: "999",
      format: "csv"
    });
    const serialized = JSON.stringify(exported);

    expect(exported).toMatchObject({
      format: "csv",
      appliedSort: {
        sortBy: "receivedAt",
        sortOrder: "desc"
      },
      requestedLimit: 999,
      exportMaxLimit: 500,
      exportedCount: 1,
      externalCalls: 0
    });
    expect(exported.appliedFilters).toMatchObject({
      provider: "line",
      reviewStatus: "pending",
      eventType: "message.created",
      limit: 500,
      offset: 0,
      format: "csv"
    });
    expect(exported.rows).toEqual([expect.objectContaining({
      id: first.id,
      provider: "line",
      channelAccountId: "sandbox:line",
      safeRoomLabel: expect.stringContaining("room digest"),
      roomKeyDigest: first.roomKeyDigest,
      eventType: "message.created",
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      safeMessagePreview: "Safe export one",
      safeReason: "safe-review-required-no-conversation-match",
      externalCalls: 0
    })]);
    expect(exported.rows.some((row) => row.id === second.id)).toBe(false);
    expect(exported.csv).toContain("safeRoomLabel");
    expect(() => controller.exportUnmatchedInbound(tenantId, { format: "xml" })).toThrow(BadRequestException);
    expect(() => controller.exportUnmatchedInbound(undefined, { format: "json" })).toThrow(BadRequestException);
    expect(serialized).not.toMatch(/raw-export|raw-sender|raw-message-id|replyToken|rawPayload|providerRaw|payloadJson|authorization|cookie|token|secret|raw room|raw sender/i);
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
    const history = controller.listUnmatchedInboundHistory(tenantId, item.id);

    expect(conversations.persistLinkedSandboxWebhookInboundMessage).toHaveBeenCalledTimes(1);
    expect(linked).toMatchObject({
      linkStatus: "linked-message-persisted",
      linkedMessageId: "message-safe-linked",
      messagePersisted: true,
      externalCalls: 0
    });
    expect(duplicate.id).toBe(linked.id);
    expect(history.entries.map((entry) => entry.action)).toEqual(expect.arrayContaining([
      "linked_to_conversation",
      "linked_message_persisted"
    ]));
    expect(history.entries.find((entry) => entry.action === "linked_message_persisted")).toMatchObject({
      linkedConversationId: "conversation-safe-internal",
      linkedMessageId: "message-safe-linked",
      externalCalls: 0
    });
    expect(JSON.stringify({ linked, duplicate, history })).not.toMatch(/raw-link-persist-room-60|replyToken|rawPayload|providerRaw|payloadJson|authorization|cookie|token|secret|raw room|raw sender/i);
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
  const item = listUnmatchedItems(controller, tenantId, undefined).find((candidate) => candidate.id === event.unmatchedInboundId);
  if (!item) throw new Error("Expected unmatched item to be queued");
  return item;
}

function listUnmatchedItems(
  controller: ProviderWebhooksController,
  tenantIdValue: string,
  filters: ProviderWebhookUnmatchedInboundFilters | ProviderWebhookUnmatchedInboundStatusFilter | undefined
): ProviderWebhookUnmatchedInboundItem[] {
  return controller.listUnmatchedInbound(tenantIdValue, filters) as ProviderWebhookUnmatchedInboundItem[];
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
