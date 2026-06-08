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
    expect(() => controller.getReviewQaHandoffArchiveReleaseAttestationAudit(undefined, {}, undefined)).toThrow(BadRequestException);
    expect(() => controller.getReviewQaHandoffArchiveReleaseAttestationReconciliation(undefined, {}, undefined)).toThrow(BadRequestException);
    expect(() => controller.getReviewQaHandoffCertifiedReleaseGate(undefined, {}, undefined)).toThrow(BadRequestException);
    expect(() => controller.getReviewQaHandoffCertifiedReleaseDecisionReceipt(undefined, {}, undefined)).toThrow(BadRequestException);
    expect(() => controller.getReviewQaHandoffCertifiedReleaseNoopExecutionDryRun(undefined, {}, undefined)).toThrow(BadRequestException);
    expect(() => controller.runReviewQaHandoffCertifiedReleaseNoopExecutionDryRun(undefined, {}, undefined, { checklistAcknowledged: true, executionMode: "no_op" })).toThrow(BadRequestException);
    expect(() => controller.getReviewQaHandoffCertifiedReleaseDryRunResultLedger(undefined, {}, undefined)).toThrow(BadRequestException);
    expect(() => controller.getReviewQaHandoffCertifiedReleaseFinalReadinessCertificate(undefined, {}, undefined)).toThrow(BadRequestException);
    expect(() => controller.getReviewQaHandoffCertifiedReleaseFreezeAuditRegister(undefined, {}, undefined)).toThrow(BadRequestException);
    expect(() => controller.getReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt(undefined, {}, undefined)).toThrow(BadRequestException);
    expect(() => controller.getReviewQaHandoffCertifiedReleaseControlRoomPacket(undefined, {}, undefined)).toThrow(BadRequestException);
    expect(() => controller.getReviewQaHandoffCertifiedReleaseCutoverChecklistReceipt(undefined, {}, undefined)).toThrow(BadRequestException);
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

  it("returns tenant-scoped safe triage guidance without mutating review state", async () => {
    const { controller } = buildController(noMatchConversations());
    const criticalItem = await createUnmatched(controller, "raw-triage-critical-room-67", "event-triage-critical-67", "Safe triage critical");
    criticalItem.receivedAt = "2026-05-28T00:00:00.000Z";
    const linkableItem = await createUnmatched(controller, "raw-triage-link-room-67", "event-triage-link-67", "Safe triage link");
    const reviewedItem = await createUnmatched(controller, "raw-triage-reviewed-room-67", "event-triage-reviewed-67", "Safe triage reviewed");
    await controller.reviewUnmatchedInbound(tenantId, "user-api", reviewedItem.id, { status: "reviewed" });
    const before = JSON.stringify(controller.listUnmatchedInbound(tenantId, undefined));

    const allTriage = controller.getReviewTriage(tenantId, {});
    const criticalTriage = controller.getReviewTriage(tenantId, {
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      eventType: "message.created",
      severity: "critical",
      triageLane: "critical_stale_open"
    });
    const otherTriage = controller.getReviewTriage("00000000-0000-4000-8000-000000000099", {});
    const after = JSON.stringify(controller.listUnmatchedInbound(tenantId, undefined));
    const serialized = JSON.stringify({ allTriage, criticalTriage, otherTriage });

    expect(() => controller.getReviewTriage(undefined, {})).toThrow(BadRequestException);
    expect(() => controller.getReviewTriage(tenantId, { triageLane: "urgent" })).toThrow(BadRequestException);
    expect(() => controller.getReviewTriage(tenantId, { severity: "urgent" })).toThrow(BadRequestException);
    expect(before).toBe(after);
    expect(allTriage).toMatchObject({
      totalItems: 3,
      totalOpenItems: 2,
      totalTriageLanes: 8,
      thresholds: {
        staleWarningHours: 24,
        staleCriticalHours: 72,
        overSlaHours: 48
      },
      externalCalls: 0
    });
    expect(criticalTriage).toMatchObject({
      appliedFilters: {
        provider: "line",
        reviewStatus: "pending",
        linkStatus: "none",
        unmatchedStatus: "review-needed",
        eventType: "message.created",
        severity: "critical",
        triageLane: "critical_stale_open"
      },
      totalItems: 1,
      totalOpenItems: 1,
      externalCalls: 0
    });
    expect(criticalTriage.lanes.find((lane) => lane.laneKey === "critical_stale_open")).toMatchObject({
      count: 1,
      recommendedNextActions: expect.arrayContaining(["OPEN_DIAGNOSTICS", "VIEW_HISTORY", "APPLY_FILTER", "MARK_REVIEWED", "SKIP"]),
      safeDrilldownFilters: { status: "open" }
    });
    expect(allTriage.byLane.find((item) => item.key === "safe_link_candidate_available")?.count).toBeGreaterThanOrEqual(1);
    expect(allTriage.byReviewStatus.find((item) => item.key === "reviewed")?.count).toBe(1);
    expect(allTriage.topItems).toEqual(expect.arrayContaining([
      expect.objectContaining({
        unmatchedId: criticalItem.id,
        provider: "line",
        platform: "line",
        channelAccountId: "sandbox:line",
        safeRoomLabel: expect.stringContaining("room digest"),
        roomKeyDigest: criticalItem.roomKeyDigest,
        triageLane: "critical_stale_open",
        severity: "critical",
        candidatesAvailable: true,
        diagnosticsAvailable: true,
        historyAvailable: true,
        exportAvailable: true,
        externalCalls: 0
      }),
      expect.objectContaining({
        unmatchedId: linkableItem.id,
        triageLane: "safe_link_candidate_available",
        recommendedNextActions: expect.arrayContaining(["RUN_CANDIDATE_LOOKUP", "LINK_ONLY", "LINK_AND_PERSIST_SAFE_MESSAGE"]),
        externalCalls: 0
      })
    ]));
    expect(otherTriage.totalItems).toBe(0);
    expect(otherTriage.externalCalls).toBe(0);
    expect(serialized).not.toContain("raw-triage");
    expect(serialized).not.toContain("raw-sender-event-triage-critical-67");
    expect(serialized).not.toMatch(/replyToken|rawPayload|providerRaw|payloadJson|authorization|cookie|token|secret|raw room|raw sender|senderId|roomId/i);
  });

  it("keeps assignment, escalation, workload, history, and notes tenant-scoped as internal metadata only", async () => {
    const { controller, audit } = buildController(noMatchConversations());
    const item = await createUnmatched(controller, "raw-assignment-room-69", "event-assignment-69", "Safe assignment target");
    const before = listUnmatchedItems(controller, tenantId, undefined).find((candidate) => candidate.id === item.id);

    expect(() => controller.assignUnmatchedInbound(undefined, "operator-current", item.id, { operation: "ASSIGN_TO_ME" }))
      .toThrow(BadRequestException);
    await expect(controller.assignUnmatchedInbound("other-tenant", "operator-current", item.id, { operation: "ASSIGN_TO_ME" }))
      .rejects.toThrow("Unmatched inbound item not found");
    await expect(controller.escalateUnmatchedInbound("other-tenant", "operator-current", item.id, {
      operation: "ESCALATE",
      escalationReason: "SLA_RISK"
    })).rejects.toThrow("Unmatched inbound item not found");

    const assigned = await controller.assignUnmatchedInbound(tenantId, "operator-current", item.id, {
      operation: "ASSIGN_TO_ME",
      note: "Safe assignment note"
    });
    const assignedSnapshot = JSON.parse(JSON.stringify(assigned));
    const assignedToOperator = await controller.assignUnmatchedInbound(tenantId, "operator-current", item.id, {
      operation: "ASSIGN_TO_OPERATOR",
      assignedToOperatorLabel: "queue lead",
      note: "Safe queue lead handoff"
    });
    const assignedToOperatorSnapshot = JSON.parse(JSON.stringify(assignedToOperator));
    const escalated = await controller.escalateUnmatchedInbound(tenantId, "operator-current", item.id, {
      operation: "ESCALATE",
      escalationReason: "SLA_RISK",
      note: "Safe escalation note"
    });
    const workload = controller.getReviewWorkload(tenantId, {
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      assignmentStatus: "assigned_to_others",
      escalationStatus: "escalated",
      escalationReason: "SLA_RISK"
    }, "operator-current");
    const diagnostics = controller.getUnmatchedInboundDiagnostics(tenantId, item.id);
    const history = controller.listUnmatchedInboundHistory(tenantId, item.id);
    const notes = controller.listOperatorNotes(tenantId, item.id);
    const serialized = JSON.stringify({ assigned, assignedToOperator, escalated, workload, diagnostics, history, notes });

    expect(before).toMatchObject({
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      messagePersisted: false
    });
    expect(assignedSnapshot).toMatchObject({
      assignmentStatus: "assigned",
      assignedToOperatorLabel: "operator:operator-cur",
      assignedByOperatorLabel: "operator:operator-cur",
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      messagePersisted: false,
      externalCalls: 0
    });
    expect(assignedToOperatorSnapshot).toMatchObject({
      assignmentStatus: "assigned",
      assignedToOperatorLabel: "queue lead",
      assignedByOperatorLabel: "operator:operator-cur",
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      messagePersisted: false,
      externalCalls: 0
    });
    expect(escalated).toMatchObject({
      escalationStatus: "escalated",
      escalationReason: "SLA_RISK",
      escalatedByOperatorLabel: "operator:operator-cur",
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      messagePersisted: false,
      externalCalls: 0
    });
    expect(workload).toMatchObject({
      totalItems: 1,
      counts: {
        assignedToOthersOpen: 1,
        escalatedOpen: 1
      },
      externalCalls: 0
    });
    expect(workload.appliedFilters).toMatchObject({
      assignmentStatus: "assigned_to_others",
      escalationStatus: "escalated",
      escalationReason: "SLA_RISK"
    });
    expect(workload.topAssignedItems[0]).toMatchObject({
      unmatchedId: item.id,
      platform: "line",
      channelAccountId: "sandbox:line",
      assignmentStatus: "assigned",
      escalationStatus: "escalated",
      escalationReason: "SLA_RISK",
      historyAvailable: true,
      diagnosticsAvailable: true,
      candidatesAvailable: true,
      externalCalls: 0
    });
    expect(diagnostics).toMatchObject({
      assignmentStatus: "assigned",
      assignedToOperatorLabel: "queue lead",
      escalationStatus: "escalated",
      escalationReason: "SLA_RISK",
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      externalCalls: 0
    });
    expect(history.entries.map((entry) => entry.action)).toEqual(expect.arrayContaining(["assigned", "escalated"]));
    expect(notes.map((note) => note.note)).toEqual(expect.arrayContaining([
      "assignment updated: Safe assignment note",
      "assignment updated: Safe queue lead handoff",
      "escalation updated: Safe escalation note"
    ]));
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({
      action: "provider_webhook.unmatched_inbound_assigned",
      entityType: "provider_webhook_unmatched_inbound_metadata"
    }));
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({
      action: "provider_webhook.unmatched_inbound_escalated",
      entityType: "provider_webhook_unmatched_inbound_metadata"
    }));
    expect(serialized).not.toMatch(/raw-assignment-room-69|raw-sender-event-assignment-69|raw-message-id|replyToken|rawPayload|providerRaw|payloadJson|authorization|cookie|token|secret|raw room|raw sender|senderId|roomId/i);
  });

  it("keeps resolution outcomes and closure checklist tenant-scoped as internal metadata only", async () => {
    const { controller, audit } = buildController(noMatchConversations());
    const item = await createUnmatched(controller, "raw-resolution-room-70", "event-resolution-70", "Safe resolution target");
    const before = listUnmatchedItems(controller, tenantId, undefined).find((candidate) => candidate.id === item.id);

    expect(() => controller.resolveUnmatchedInbound(undefined, "operator-current", item.id, { operation: "SET_RESOLUTION", resolutionOutcome: "NEEDS_REVIEW" }))
      .toThrow(BadRequestException);
    await expect(controller.resolveUnmatchedInbound("other-tenant", "operator-current", item.id, {
      operation: "SET_RESOLUTION",
      resolutionOutcome: "NEEDS_REVIEW"
    })).rejects.toThrow("Unmatched inbound item not found");
    await expect(controller.updateUnmatchedInboundChecklist("other-tenant", "operator-current", item.id, {
      operation: "COMPLETE_STEP",
      step: "VIEWED_DIAGNOSTICS"
    })).rejects.toThrow("Unmatched inbound item not found");

    const resolved = await controller.resolveUnmatchedInbound(tenantId, "operator-current", item.id, {
      operation: "SET_RESOLUTION",
      resolutionOutcome: "NEEDS_REVIEW",
      note: "Safe resolution note"
    });
    let checked: ProviderWebhookUnmatchedInboundItem = resolved;
    for (const step of [
      "VIEWED_DIAGNOSTICS",
      "REVIEWED_HISTORY",
      "REVIEWED_TRIAGE_GUIDANCE",
      "REVIEWED_CANDIDATES",
      "CONFIRMED_NO_RAW_LEAKAGE",
      "CONFIRMED_NO_PROVIDER_OUTBOUND",
      "CONFIRMED_ASSIGNMENT_OR_ESCALATION",
      "CONFIRMED_SAFE_LINK_TARGET",
      "CONFIRMED_OPERATOR_NOTE"
    ] as const) {
      checked = await controller.updateUnmatchedInboundChecklist(tenantId, "operator-current", item.id, {
        operation: "COMPLETE_STEP",
        step
      });
    }
    const summary = controller.getReviewResolutionSummary(tenantId, {
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      resolutionStatus: "resolved",
      resolutionOutcome: "NEEDS_REVIEW",
      checklistIncomplete: "false"
    }, "operator-current");
    const diagnostics = controller.getUnmatchedInboundDiagnostics(tenantId, item.id);
    const history = controller.listUnmatchedInboundHistory(tenantId, item.id);
    const notes = controller.listOperatorNotes(tenantId, item.id);
    const bulkReset = await controller.bulkResolveUnmatchedInbound(tenantId, "operator-current", {
      ids: [item.id],
      operation: "RESET_CHECKLIST",
      note: "Safe checklist reset"
    });
    const afterBulk = controller.listUnmatchedInbound(tenantId, { resolutionStatus: "resolved" })[0];
    const serialized = JSON.stringify({ resolved, checked, summary, diagnostics, history, notes, bulkReset, afterBulk });

    expect(before).toMatchObject({
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      messagePersisted: false
    });
    expect(resolved).toMatchObject({
      id: item.id,
      resolutionStatus: "resolved",
      resolutionOutcome: "NEEDS_REVIEW",
      resolvedByOperatorLabel: "operator:operator-cur",
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      messagePersisted: false,
      externalCalls: 0
    });
    expect(checked).toMatchObject({
      id: item.id,
      checklistCompletedCount: 9,
      checklistTotalCount: 9,
      closureReadiness: "READY_FOR_REVIEW",
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      messagePersisted: false,
      externalCalls: 0
    });
    expect(summary).toMatchObject({
      appliedFilters: {
        provider: "line",
        reviewStatus: "pending",
        linkStatus: "none",
        unmatchedStatus: "review-needed",
        resolutionStatus: "resolved",
        resolutionOutcome: "NEEDS_REVIEW",
        checklistIncomplete: false
      },
      totalItems: 1,
      counts: {
        resolvedRecently: 1,
        readyForReview: 1,
        checklistIncompleteOpen: 0
      },
      externalCalls: 0
    });
    expect(summary.byResolutionOutcome.find((entry) => entry.key === "NEEDS_REVIEW")?.count).toBe(1);
    expect(summary.topReadyItems[0]).toMatchObject({
      unmatchedId: item.id,
      platform: "line",
      channelAccountId: "sandbox:line",
      safeRoomLabel: expect.stringContaining("room digest"),
      resolutionStatus: "resolved",
      resolutionOutcome: "NEEDS_REVIEW",
      closureReadiness: "READY_FOR_REVIEW",
      recommendedNextActions: expect.arrayContaining(["MARK_REVIEWED"]),
      externalCalls: 0
    });
    expect(diagnostics).toMatchObject({
      resolutionStatus: "resolved",
      resolutionOutcome: "NEEDS_REVIEW",
      closureReadiness: "READY_FOR_REVIEW",
      checklistCompletedCount: 9,
      checklistTotalCount: 9,
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      externalCalls: 0
    });
    expect(history.entries.map((entry) => entry.action)).toEqual(expect.arrayContaining(["resolution_set", "checklist_completed"]));
    expect(notes.map((note) => note.note)).toEqual(expect.arrayContaining([
      "resolution updated: Safe resolution note",
      "checklist updated: VIEWED_DIAGNOSTICS"
    ]));
    expect(bulkReset).toMatchObject({
      operation: "RESET_CHECKLIST",
      summary: {
        successCount: 1,
        updatedCount: 1
      },
      externalCalls: 0
    });
    expect(afterBulk).toMatchObject({
      resolutionStatus: "resolved",
      resolutionOutcome: "NEEDS_REVIEW",
      checklistCompletedCount: 0,
      checklistTotalCount: 9,
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      messagePersisted: false,
      externalCalls: 0
    });
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({
      action: "provider_webhook.unmatched_inbound_resolution_set",
      entityType: "provider_webhook_unmatched_inbound_metadata"
    }));
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({
      action: "provider_webhook.unmatched_inbound_checklist_completed",
      entityType: "provider_webhook_unmatched_inbound_metadata"
    }));
    expect(serialized).not.toMatch(/raw-resolution-room-70|raw-sender-event-resolution-70|raw-message-id|replyToken|rawPayload|providerRaw|payloadJson|authorization|cookie|token|secret|raw room|raw sender|senderId|roomId/i);
  });

  it("returns tenant-scoped closure evidence and aggregate report without mutating review/link/message state", async () => {
    const { controller } = buildController(noMatchConversations());
    const item = await createUnmatched(controller, "raw-evidence-room-71", "event-evidence-71", "Safe evidence target");
    await controller.assignUnmatchedInbound(tenantId, "operator-current", item.id, {
      operation: "ASSIGN_TO_ME",
      note: "Safe closure evidence assignment"
    });
    await controller.escalateUnmatchedInbound(tenantId, "operator-current", item.id, {
      operation: "ESCALATE",
      escalationReason: "SLA_RISK",
      note: "Safe closure evidence escalation"
    });
    await controller.resolveUnmatchedInbound(tenantId, "operator-current", item.id, {
      operation: "SET_RESOLUTION",
      resolutionOutcome: "NEEDS_REVIEW",
      note: "Safe closure evidence resolution"
    });
    for (const step of [
      "VIEWED_DIAGNOSTICS",
      "REVIEWED_HISTORY",
      "REVIEWED_TRIAGE_GUIDANCE",
      "REVIEWED_CANDIDATES",
      "CONFIRMED_NO_RAW_LEAKAGE",
      "CONFIRMED_NO_PROVIDER_OUTBOUND",
      "CONFIRMED_ASSIGNMENT_OR_ESCALATION",
      "CONFIRMED_SAFE_LINK_TARGET",
      "CONFIRMED_OPERATOR_NOTE"
    ] as const) {
      await controller.updateUnmatchedInboundChecklist(tenantId, "operator-current", item.id, {
        operation: "COMPLETE_STEP",
        step
      });
    }
    const stateBeforeEvidence = listUnmatchedItems(controller, tenantId, undefined).find((candidate) => candidate.id === item.id);

    expect(() => controller.getUnmatchedInboundClosureEvidence(undefined, item.id)).toThrow(BadRequestException);
    expect(() => controller.getReviewClosureReport(undefined, {}, "operator-current")).toThrow(BadRequestException);
    expect(() => controller.exportUnmatchedInboundClosureEvidence(undefined, item.id)).toThrow(BadRequestException);
    expect(() => controller.exportReviewClosureReport(undefined, {}, "operator-current")).toThrow(BadRequestException);
    expect(() => controller.getUnmatchedInboundClosureEvidenceRedactionAudit(undefined, item.id)).toThrow(BadRequestException);
    expect(() => controller.getReviewClosureReportRedactionAudit(undefined, {}, "operator-current")).toThrow(BadRequestException);
    expect(() => controller.getReviewClosureExportIntegrity(undefined, {}, "operator-current")).toThrow(BadRequestException);
    expect(() => controller.getUnmatchedInboundClosureEvidenceExportManifest(undefined, item.id)).toThrow(BadRequestException);
    expect(() => controller.getReviewClosureReportExportManifest(undefined, {}, "operator-current")).toThrow(BadRequestException);
    expect(() => controller.getReviewQaHandoffBundle(undefined, {}, "operator-current")).toThrow(BadRequestException);
    expect(() => controller.exportReviewQaHandoffBundle(undefined, {}, "operator-current")).toThrow(BadRequestException);
    expect(() => controller.getUnmatchedInboundClosureEvidence("other-tenant", item.id)).toThrow("Unmatched inbound item not found");
    expect(() => controller.exportUnmatchedInboundClosureEvidence("other-tenant", item.id)).toThrow("Unmatched inbound item not found");
    expect(() => controller.getUnmatchedInboundClosureEvidenceRedactionAudit("other-tenant", item.id)).toThrow("Unmatched inbound item not found");
    expect(() => controller.getUnmatchedInboundClosureEvidenceExportManifest("other-tenant", item.id)).toThrow("Unmatched inbound item not found");

    const closureFilters = {
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      assignmentStatus: "assigned_to_me",
      escalationStatus: "escalated",
      escalationReason: "SLA_RISK",
      resolutionStatus: "resolved",
      resolutionOutcome: "NEEDS_REVIEW",
      closureReadiness: "READY_FOR_REVIEW",
      checklistIncomplete: "false",
      eventType: "message.created"
    };
    const evidence = controller.getUnmatchedInboundClosureEvidence(tenantId, item.id);
    const report = controller.getReviewClosureReport(tenantId, closureFilters, "operator-current");
    const evidenceExport = controller.exportUnmatchedInboundClosureEvidence(tenantId, item.id);
    const reportExport = controller.exportReviewClosureReport(tenantId, closureFilters, "operator-current");
    const evidenceRedactionAudit = controller.getUnmatchedInboundClosureEvidenceRedactionAudit(tenantId, item.id);
    const reportRedactionAudit = controller.getReviewClosureReportRedactionAudit(tenantId, closureFilters, "operator-current");
    const exportIntegrity = controller.getReviewClosureExportIntegrity(tenantId, closureFilters, "operator-current");
    const evidenceManifest = controller.getUnmatchedInboundClosureEvidenceExportManifest(tenantId, item.id);
    const reportManifest = controller.getReviewClosureReportExportManifest(tenantId, closureFilters, "operator-current");
    const qaBundle = controller.getReviewQaHandoffBundle(tenantId, closureFilters, "operator-current");
    const qaBundleExport = controller.exportReviewQaHandoffBundle(tenantId, closureFilters, "operator-current");
    const stateAfterEvidence = listUnmatchedItems(controller, tenantId, undefined).find((candidate) => candidate.id === item.id);
    const serialized = JSON.stringify({
      evidence,
      report,
      evidenceExport,
      reportExport,
      evidenceRedactionAudit,
      reportRedactionAudit,
      exportIntegrity,
      evidenceManifest,
      reportManifest,
      qaBundle,
      qaBundleExport
    });

    expect(evidence).toMatchObject({
      unmatchedId: item.id,
      provider: "line",
      platform: "line",
      channelAccountId: "sandbox:line",
      eventType: "message.created",
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      assignmentStatus: "assigned",
      assignedToOperatorLabel: "operator:operator-cur",
      escalationStatus: "escalated",
      escalationReason: "SLA_RISK",
      resolutionStatus: "resolved",
      resolutionOutcome: "NEEDS_REVIEW",
      closureReadiness: "READY_FOR_REVIEW",
      evidenceStatus: "ready",
      checklistCompletedCount: 9,
      checklistTotalCount: 9,
      checklistIncompleteSteps: [],
      evidenceFlags: {
        diagnosticsViewedOrAvailable: true,
        historyAvailable: true,
        operatorNotesAvailable: true,
        candidatesAvailable: true,
        assignmentOrEscalationPresent: true,
        noProviderOutboundConfirmed: true,
        noRawLeakageConfirmed: true,
        safeLinkTargetConfirmed: true
      },
      externalCalls: 0
    });
    expect(evidence.historyEntryCount).toBeGreaterThan(0);
    expect(evidence.operatorNoteCount).toBeGreaterThan(0);
    expect(report).toMatchObject({
      appliedFilters: {
        provider: "line",
        reviewStatus: "pending",
        linkStatus: "none",
        unmatchedStatus: "review-needed",
        assignmentStatus: "assigned_to_me",
        escalationStatus: "escalated",
        escalationReason: "SLA_RISK",
        resolutionStatus: "resolved",
        resolutionOutcome: "NEEDS_REVIEW",
        closureReadiness: "READY_FOR_REVIEW",
        checklistIncomplete: false,
        eventType: "message.created"
      },
      totalItems: 1,
      totalOpenItems: 1,
      evidenceReadyCount: 1,
      evidenceBlockedCount: 0,
      evidenceIncompleteCount: 0,
      externalCalls: 0
    });
    expect(report.byClosureReadiness.find((entry) => entry.key === "READY_FOR_REVIEW")?.count).toBe(1);
    expect(report.byResolutionOutcome.find((entry) => entry.key === "NEEDS_REVIEW")?.count).toBe(1);
    expect(report.byChecklistStep.find((entry) => entry.key === "CONFIRMED_NO_RAW_LEAKAGE")?.count).toBe(0);
    expect(report.topEvidenceReadyItems[0]).toMatchObject({
      unmatchedId: item.id,
      evidenceStatus: "ready",
      externalCalls: 0
    });
    expect(evidenceExport).toMatchObject({
      exportKind: "closure-evidence",
      format: "json",
      contentType: "application/json",
      unmatchedId: item.id,
      evidenceStatus: "ready",
      externalCalls: 0
    });
    expect(evidenceExport.safeFilename).toMatch(/^provider-webhook-closure-evidence-line-provider-webhook-unmatched-/);
    expect(reportExport).toMatchObject({
      exportKind: "closure-report",
      format: "json",
      contentType: "application/json",
      totalItems: 1,
      evidenceReadyCount: 1,
      externalCalls: 0
    });
    expect(reportExport.appliedFilters).toMatchObject({
      provider: "line",
      checklistIncomplete: false
    });
    expect(evidenceRedactionAudit).toMatchObject({
      auditTarget: "closure-evidence-export",
      status: "passed",
      unmatchedId: item.id,
      exportShapeVersion: "provider-webhook-closure-export-v1",
      externalCalls: 0,
      checks: {
        rawPayloadAbsent: true,
        rawSignatureAbsent: true,
        tokenAbsent: true,
        authorizationAbsent: true,
        cookieAbsent: true,
        replyTokenAbsent: true,
        rawSenderIdAbsent: true,
        rawRoomIdAbsent: true,
        providerSecretAbsent: true,
        providerOutboundAbsent: true,
        externalCallsZero: true,
        safeRoomDigestPresent: true,
        tenantScoped: true,
        exportDeterministic: true
      }
    });
    expect(evidenceRedactionAudit.issues).toEqual([]);
    expect(evidenceRedactionAudit.safeDigest).toMatch(/^sha256:/);
    expect(reportRedactionAudit).toMatchObject({
      auditTarget: "closure-report-export",
      status: "passed",
      appliedFilters: {
        provider: "line",
        checklistIncomplete: false
      },
      externalCalls: 0
    });
    expect(reportRedactionAudit.checks.rawPayloadAbsent).toBe(true);
    expect(reportRedactionAudit.checks.replyTokenAbsent).toBe(true);
    expect(exportIntegrity).toMatchObject({
      appliedFilters: {
        provider: "line",
        checklistIncomplete: false
      },
      totalCheckedItems: 1,
      redactionPassedCount: 1,
      redactionWarningCount: 0,
      redactionBlockedCount: 0,
      deterministicExportConfirmed: true,
      exportShapeVersion: "provider-webhook-closure-export-v1",
      externalCalls: 0
    });
    expect(exportIntegrity.safeReportDigest).toMatch(/^sha256:/);
    expect(evidenceManifest).toMatchObject({
      manifestKind: "provider-webhook-review-export-manifest",
      manifestTarget: "closure-evidence-export",
      exportKind: "closure-evidence",
      format: "json",
      contentType: "application/json",
      unmatchedId: item.id,
      totalItems: 1,
      evidenceReadyCount: 1,
      evidenceBlockedCount: 0,
      evidenceIncompleteCount: 0,
      redactionStatus: "passed",
      redactionPassedCount: 1,
      redactionWarningCount: 0,
      redactionBlockedCount: 0,
      integrityStatus: "confirmed",
      deterministicExportConfirmed: true,
      manualQaReadiness: "ready",
      manualQaChecks: {
        redactionPassedOrWarned: true,
        redactionBlockedAbsent: true,
        deterministicExportConfirmed: true,
        safeFilenamePresent: true,
        safeDigestPresent: true,
        externalCallsZero: true,
        manualQaReady: true
      },
      externalCalls: 0
    });
    expect(evidenceManifest.safeFilename).toMatch(/^provider-webhook-closure-evidence-line-provider-webhook-unmatched-/);
    expect(evidenceManifest.safeDigest).toMatch(/^sha256:/);
    expect(reportManifest).toMatchObject({
      manifestKind: "provider-webhook-review-export-manifest",
      manifestTarget: "closure-report-export",
      exportKind: "closure-report",
      format: "json",
      contentType: "application/json",
      appliedFilters: {
        provider: "line",
        checklistIncomplete: false
      },
      totalItems: 1,
      evidenceReadyCount: 1,
      evidenceBlockedCount: 0,
      evidenceIncompleteCount: 0,
      redactionStatus: "passed",
      redactionPassedCount: 1,
      redactionWarningCount: 0,
      redactionBlockedCount: 0,
      integrityStatus: "confirmed",
      deterministicExportConfirmed: true,
      manualQaReadiness: "ready",
      externalCalls: 0
    });
    expect(reportManifest.safeFilename).toBe("provider-webhook-review-closure-report.json");
    expect(reportManifest.safeDigest).toMatch(/^sha256:/);
    expect(reportManifest.safeReportDigest).toMatch(/^sha256:/);
    expect(qaBundle).toMatchObject({
      bundleKind: "provider-webhook-review-qa-handoff-bundle",
      appliedFilters: {
        provider: "line",
        checklistIncomplete: false
      },
      readiness: {
        reviewClosureEvidenceEnabled: true,
        reviewClosureReportEnabled: true,
        reviewClosureEvidenceExportEnabled: true,
        reviewClosureReportExportEnabled: true,
        reviewExportRedactionAuditEnabled: true,
        reviewExportIntegrityChecksEnabled: true,
        reviewExportManifestEnabled: true,
        reviewExportQaHandoffEnabled: true,
        externalCalls: 0
      },
      closureReportExport: {
        exportKind: "closure-report",
        safeFilename: "provider-webhook-review-closure-report.json",
        externalCalls: 0
      },
      closureReportManifest: {
        manifestTarget: "closure-report-export",
        manualQaReadiness: "ready",
        externalCalls: 0
      },
      closureReportRedactionAudit: {
        auditTarget: "closure-report-export",
        status: "passed",
        externalCalls: 0
      },
      closureExportIntegrity: {
        deterministicExportConfirmed: true,
        externalCalls: 0
      },
      manualQaReadiness: "ready",
      manualQaChecks: {
        reportManifestReady: true,
        reportRedactionPassedOrWarned: true,
        reportIntegrityConfirmed: true,
        evidenceManifestsReadyOrNeedsReview: true,
        rawPayloadAbsent: true,
        rawSignatureAbsent: true,
        tokenAbsent: true,
        replyTokenAbsent: true,
        rawSenderIdAbsent: true,
        rawRoomIdAbsent: true,
        providerOutboundAbsent: true,
        externalCallsZero: true,
        readinessFlagsPresent: true
      },
      safeFilename: "provider-webhook-review-qa-handoff-bundle.json",
      externalCalls: 0
    });
    expect(qaBundle.evidenceManifests[0]).toMatchObject({
      unmatchedId: item.id,
      safeFilename: expect.stringMatching(/^provider-webhook-closure-evidence-line-provider-webhook-unmatched-/),
      safeDigest: expect.stringMatching(/^sha256:/),
      redactionStatus: "passed",
      integrityStatus: "confirmed",
      manualQaReadiness: "ready",
      externalCalls: 0
    });
    expect(qaBundle.safeDigest).toMatch(/^sha256:/);
    expect(qaBundleExport).toMatchObject({
      exportKind: "qa-handoff-bundle",
      format: "json",
      contentType: "application/json",
      safeFilename: "provider-webhook-review-qa-handoff-bundle-export.json",
      status: "ready",
      counts: {
        totalItems: 1,
        totalOpenItems: 1,
        evidenceManifestCount: 1,
        closureEvidenceReadyCount: expect.any(Number),
        closureEvidenceBlockedCount: expect.any(Number),
        closureEvidenceIncompleteCount: expect.any(Number)
      },
      readinessFlags: {
        reviewExportQaHandoffEnabled: true,
        reviewClosureReportExportEnabled: true
      },
      closureEvidenceSummary: {
        externalCalls: 0
      },
      exportManifestSummary: {
        reportManifestReadiness: "ready",
        reportManifestIntegrityStatus: "confirmed",
        externalCalls: 0
      },
      redactionAuditSummary: {
        status: "passed",
        rawPayloadAbsent: true,
        rawSignatureAbsent: true,
        tokenAbsent: true,
        replyTokenAbsent: true,
        rawSenderIdAbsent: true,
        rawRoomIdAbsent: true,
        providerOutboundAbsent: true,
        externalCallsZero: true,
        externalCalls: 0
      },
      integritySummary: {
        status: "confirmed",
        totalCheckedItems: 1,
        deterministicExportConfirmed: true,
        externalCalls: 0
      },
      bundle: {
        bundleKind: "provider-webhook-review-qa-handoff-bundle",
        externalCalls: 0
      },
      externalCalls: 0
    });
    expect(qaBundleExport.safeDigest).toMatch(/^sha256:/);
    expect(qaBundleExport.bundle.safeDigest).toBe(qaBundle.safeDigest);
    expect(stateAfterEvidence).toMatchObject({
      reviewStatus: stateBeforeEvidence?.reviewStatus,
      linkStatus: stateBeforeEvidence?.linkStatus,
      unmatchedStatus: stateBeforeEvidence?.unmatchedStatus,
      messagePersisted: stateBeforeEvidence?.messagePersisted
    });
    expect(serialized).not.toMatch(/raw-evidence-room-71|raw-sender-event-evidence-71|raw-message-id|providerRaw|payloadJson|accessToken|webhookSecret|raw room|raw sender|bearer/i);
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

  it("creates, refetches, updates, and archives safe review saved views without hard delete", () => {
    const { controller } = buildController();

    expect(() => controller.listReviewSavedViews(undefined)).toThrow(BadRequestException);
    const created = controller.createReviewSavedView(tenantId, "operator-safe", {
      name: "LINE pending queue",
      description: "Safe filter preset",
      filters: {
        provider: "line",
        reviewStatus: "pending",
        linkStatus: "none",
        unmatchedStatus: "review-needed",
        eventType: "message.created",
        severity: "info",
        triageLane: "safe_link_candidate_available",
        assignedTo: "me",
        assignmentStatus: "assigned_to_me",
        escalationStatus: "escalated",
        escalationReason: "SLA_RISK",
        receivedAtFrom: "2026-05-31T00:00:00.000Z",
        pageSize: 10
      },
      sort: {
        sortBy: "receivedAt",
        sortDirection: "desc"
      },
      pinned: true,
      isDefault: true
    });
    const refetched = controller.listReviewSavedViews(tenantId);
    const createdSnapshot = JSON.parse(JSON.stringify(created));
    const refetchedSnapshot = JSON.parse(JSON.stringify(refetched));
    const updated = controller.updateReviewSavedView(tenantId, "operator-safe", created.id, {
      name: "LINE pending queue updated",
      filters: {
        provider: "line",
        reviewStatus: "pending",
        assignmentStatus: "assigned_to_me",
        escalationStatus: "escalated",
        escalationReason: "SLA_RISK",
        pageSize: 25
      },
      sort: {
        sortBy: "receivedAt",
        sortDirection: "asc"
      },
      pinned: false
    });
    const archived = controller.archiveReviewSavedView(tenantId, "operator-safe", created.id);
    const activeAfterArchive = controller.listReviewSavedViews(tenantId);
    const serialized = JSON.stringify({ createdSnapshot, refetchedSnapshot, updated, archived, activeAfterArchive });

    expect(createdSnapshot).toMatchObject({
      tenantId,
      ownerId: "operator-safe",
      createdBy: "operator:operator-saf",
      pinned: true,
      isDefault: true,
      archived: false,
      externalCalls: 0
    });
    expect(refetchedSnapshot.map((view: { id: string }) => view.id)).toContain(created.id);
    expect(updated).toMatchObject({
      name: "LINE pending queue updated",
      filters: {
        provider: "line",
        reviewStatus: "pending",
        assignmentStatus: "assigned_to_me",
        escalationStatus: "escalated",
        escalationReason: "SLA_RISK",
        pageSize: 25
      },
      sort: { sortBy: "receivedAt", sortDirection: "asc" },
      pinned: false,
      externalCalls: 0
    });
    expect(archived).toMatchObject({
      id: created.id,
      archived: true,
      isDefault: false,
      externalCalls: 0
    });
    expect(activeAfterArchive.map((view) => view.id)).not.toContain(created.id);
    expect(serialized).not.toMatch(/rawPayload|providerRaw|payloadJson|replyToken|authorization|cookie|token[:=]|secret[:=]|raw sender|raw room/i);
  });

  it("rejects unsafe or unknown saved view filters", () => {
    const { controller } = buildController();

    expect(() => controller.createReviewSavedView(tenantId, undefined, {
      name: "Unsafe raw payload",
      filters: { provider: "line" }
    })).toThrow("unsafe provider");
    expect(() => controller.createReviewSavedView(tenantId, undefined, {
      name: "Unknown filters",
      filters: {
        provider: "line",
        rawPayload: "must-not-store"
      }
    })).toThrow("Invalid provider webhook review saved view request");
    expect(() => controller.createReviewSavedView(tenantId, undefined, {
      name: "Secret value",
      description: "secret=must-not-store",
      filters: { provider: "line" }
    })).toThrow("unsafe provider");
  });

  it("creates tenant-scoped operator notes with safe history and no raw provider leakage", async () => {
    const { controller, audit } = buildController(noMatchConversations());
    const item = await createUnmatched(controller, "raw-note-room-68", "event-note-68", "Safe note target");

    expect(() => controller.listOperatorNotes(undefined, item.id)).toThrow(BadRequestException);
    expect(() => controller.listOperatorNotes("other-tenant", item.id)).toThrow("Unmatched inbound item not found");
    const before = controller.listOperatorNotes(tenantId, item.id);
    const note = await controller.createOperatorNote(tenantId, "operator-safe", item.id, {
      note: "Checked safely with local context only."
    });
    const after = controller.listOperatorNotes(tenantId, item.id);
    const history = controller.listUnmatchedInboundHistory(tenantId, item.id);
    const serialized = JSON.stringify({ note, after, history });

    expect(before).toHaveLength(0);
    expect(note).toMatchObject({
      unmatchedId: item.id,
      tenantId,
      authorId: "operator-safe",
      authorLabel: "operator:operator-saf",
      note: "Checked safely with local context only.",
      context: {
        provider: "line",
        platform: "line",
        channelAccountId: "sandbox:line",
        eventType: "message.created",
        reviewStatus: "pending",
        linkStatus: "none",
        unmatchedStatus: "review-needed"
      },
      externalCalls: 0
    });
    expect(after.map((entry) => entry.id)).toContain(note.id);
    expect(history.entries.map((entry) => entry.action)).toContain("operator_note_created");
    expect(history.entries.find((entry) => entry.action === "operator_note_created")).toMatchObject({
      message: "Checked safely with local context only.",
      externalCalls: 0
    });
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({
      action: "provider_webhook.unmatched_inbound_operator_note_created",
      entityType: "provider_webhook_operator_note"
    }));
    expect(serialized).not.toMatch(/raw-note-room-68|raw-sender-event-note-68|raw-message-id|replyToken|rawPayload|providerRaw|payloadJson|authorization|cookie|token|secret|raw room|raw sender/i);
  });

  it("rejects empty, too long, unsafe, and cross-tenant operator notes", async () => {
    const { controller } = buildController(noMatchConversations());
    const item = await createUnmatched(controller, "raw-note-reject-room-68", "event-note-reject-68", "Safe note reject target");

    await expect(controller.createOperatorNote(tenantId, undefined, item.id, { note: "   " }))
      .rejects.toThrow("Invalid provider webhook operator note request");
    await expect(controller.createOperatorNote(tenantId, undefined, item.id, { note: "a".repeat(1001) }))
      .rejects.toThrow("Invalid provider webhook operator note request");
    await expect(controller.createOperatorNote(tenantId, undefined, item.id, { note: "raw sender id raw-line-user-1" }))
      .rejects.toThrow("unsafe provider");
    await expect(controller.createOperatorNote("other-tenant", undefined, item.id, { note: "Safe note" }))
      .rejects.toThrow("Unmatched inbound item not found");
  });

  it("rejects live provider outbound mode", async () => {
    process.env.PROVIDER_OUTBOUND_MODE = "real";
    const { controller } = buildController();

    await expect(controller.createSandboxEvent(tenantId, undefined, safePayload()))
      .rejects.toThrow("disabled while live provider mode is active");
  });

  it("returns safe QA handoff receipts and tenant-scoped sign-off without mutating review state", async () => {
    const { controller } = buildController(noMatchConversations());
    const item = await createUnmatched(controller, "raw-room-qa-receipt", "qa-receipt-1", "Safe QA receipt target");
    const filters = {
      provider: "line",
      eventType: "message.created"
    };
    const before = listUnmatchedItems(controller, tenantId, { limit: 25 })
      .find((candidate) => candidate.id === item.id);

    const receipt = controller.getReviewQaHandoffBundleReceipt(tenantId, filters, "operator-current");
    const afterRead = listUnmatchedItems(controller, tenantId, { limit: 25 })
      .find((candidate) => candidate.id === item.id);
    const signOff = controller.signOffReviewQaHandoffBundleReceipt(tenantId, filters, "operator-current", {
      acknowledgementType: "sign_off",
      reviewerRole: "QA reviewer",
      reviewerLabel: "safe reviewer"
    });
    const signedReceipt = controller.getReviewQaHandoffBundleReceipt(tenantId, filters, "operator-current");
    const otherTenantReceipt = controller.getReviewQaHandoffBundleReceipt("00000000-0000-4000-8000-000000000099", filters, "operator-current");
    const serialized = JSON.stringify({ receipt, signOff, signedReceipt, otherTenantReceipt });

    expect(receipt).toMatchObject({
      receiptStatus: "not_acknowledged",
      bundleStatus: expect.any(String),
      exportStatus: expect.any(String),
      safeFilename: "provider-webhook-review-qa-handoff-bundle-export.json",
      externalCalls: 0
    });
    expect(receipt.safeDigest).toMatch(/^sha256:/);
    expect(receipt.bundleDigest).toMatch(/^sha256:/);
    expect(receipt.exportDigest).toMatch(/^sha256:/);
    expect(afterRead).toMatchObject({
      reviewStatus: before?.reviewStatus,
      linkStatus: before?.linkStatus,
      unmatchedStatus: before?.unmatchedStatus,
      messagePersisted: before?.messagePersisted,
      linkedConversationId: before?.linkedConversationId,
      linkedMessageId: before?.linkedMessageId
    });
    expect(signOff).toMatchObject({
      signOffStatus: "signed_off",
      action: "sign_off",
      reviewerRole: "QA reviewer",
      reviewerLabel: "safe reviewer",
      externalCalls: 0
    });
    expect(signedReceipt.receiptStatus).toBe("signed_off");
    expect(signedReceipt.signedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(otherTenantReceipt.receiptStatus).toBe("not_acknowledged");
    expect(serialized).not.toMatch(/raw-reply-token|raw-room-qa-receipt|"rawPayload"\s*:|"rawSignature"\s*:|"senderId"\s*:|"roomId"\s*:|"token"\s*:|"secret"\s*:|"authorization"\s*:|"cookie"\s*:/i);
  });

  it("locks signed QA handoff acceptance and blocks review mutations for the locked scope", async () => {
    const { controller } = buildController(noMatchConversations());
    const item = await createUnmatched(controller, "raw-room-qa-lock", "qa-lock-1", "Safe QA acceptance lock target");
    const filters = {
      provider: "line",
      eventType: "message.created"
    };
    const before = listUnmatchedItems(controller, tenantId, { limit: 25 })
      .find((candidate) => candidate.id === item.id);

    const unlocked = controller.getReviewQaHandoffAcceptanceLock(tenantId, filters, "operator-current");
    expect(unlocked).toMatchObject({
      lockStatus: "unlocked",
      lockAction: "none",
      receiptStatus: "not_acknowledged",
      externalCalls: 0
    });
    expect(unlocked.acceptanceChecks.receiptSignedOff).toBe(false);
    expect(() => controller.lockReviewQaHandoffAcceptance(tenantId, filters, "operator-current", {
      lockReason: "Safe premature lock"
    })).toThrow("must be signed off before acceptance lock");

    controller.signOffReviewQaHandoffBundleReceipt(tenantId, filters, "operator-current", {
      acknowledgementType: "sign_off",
      reviewerRole: "QA reviewer",
      reviewerLabel: "safe lock reviewer"
    });
    const lock = controller.lockReviewQaHandoffAcceptance(tenantId, filters, "operator-current", {
      lockReason: "Safe QA accepted",
      acceptedByRole: "QA lead",
      acceptedByLabel: "safe lock reviewer"
    });
    const lockReadback = controller.getReviewQaHandoffAcceptanceLock(tenantId, filters, "operator-current");

    expect(lock).toMatchObject({
      lockStatus: "locked",
      lockAction: "locked",
      receiptStatus: "signed_off",
      lockReason: "Safe QA accepted",
      acceptedByRole: "QA lead",
      acceptedByLabel: "safe lock reviewer",
      externalCalls: 0
    });
    expect(lock.lockRecordId).toMatch(/^provider-webhook-qa-handoff-acceptance-lock-/);
    expect(lock.lockedUnmatchedInboundIds).toContain(item.id);
    expect(lock.lockedItemCount).toBeGreaterThanOrEqual(1);
    expect(lock.acceptanceChecks).toMatchObject({
      receiptSignedOff: true,
      bundleDigestMatches: true,
      exportDigestMatches: true,
      lockedItemScopePresent: true,
      providerOutboundAbsent: true,
      externalCallsZero: true
    });
    expect(lockReadback.lockStatus).toBe("locked");
    expect(lockReadback.lockAction).toBe("already_locked");
    expect(lockReadback.lockRecordId).toBe(lock.lockRecordId);

    await expect(controller.assignUnmatchedInbound(tenantId, "operator-current", item.id, {
      operation: "ASSIGN_TO_ME",
      note: "Safe assignment after lock"
    })).rejects.toThrow("acceptance lock is active");
    await expect(controller.createOperatorNote(tenantId, "operator-current", item.id, {
      note: "Safe note after lock"
    })).rejects.toThrow("acceptance lock is active");
    await expect(controller.reviewUnmatchedInbound(tenantId, "operator-current", item.id, {
      status: "reviewed",
      reason: "Safe review after lock"
    })).rejects.toThrow("acceptance lock is active");
    const bulk = await controller.bulkAssignUnmatchedInbound(tenantId, "operator-current", {
      ids: [item.id],
      operation: "ASSIGN_TO_ME",
      note: "Safe bulk assignment after lock"
    });
    const after = listUnmatchedItems(controller, tenantId, { limit: 25 })
      .find((candidate) => candidate.id === item.id);
    const serialized = JSON.stringify({ unlocked, lock, lockReadback, bulk, after });

    expect(bulk.results[0]).toMatchObject({
      ok: false,
      resultStatus: "conflict",
      error: expect.stringContaining("acceptance lock is active"),
      externalCalls: 0
    });
    expect(after).toMatchObject({
      reviewStatus: before?.reviewStatus,
      linkStatus: before?.linkStatus,
      unmatchedStatus: before?.unmatchedStatus,
      assignmentStatus: before?.assignmentStatus,
      escalationStatus: before?.escalationStatus,
      resolutionStatus: before?.resolutionStatus,
      messagePersisted: before?.messagePersisted,
      linkedConversationId: before?.linkedConversationId,
      linkedMessageId: before?.linkedMessageId
    });
    expect(serialized).not.toMatch(/raw-reply-token|raw-room-qa-lock|"rawPayload"\s*:|"rawSignature"\s*:|"senderId"\s*:|"roomId"\s*:|"token"\s*:|"secret"\s*:|"authorization"\s*:|"cookie"\s*:/i);
  });

  it("returns safe QA archive integrity and retention audit without mutating review state", async () => {
    const { controller } = buildController(noMatchConversations());
    const item = await createUnmatched(controller, "raw-room-qa-archive-integrity", "qa-archive-integrity-1", "Safe QA archive integrity target");
    const filters = {
      provider: "line",
      eventType: "message.created"
    };

    expect(() => controller.getReviewQaHandoffArchiveIntegrity(tenantId, filters, "operator-current"))
      .toThrow("acceptance lock is required before locked archive export");
    expect(() => controller.getReviewQaHandoffRetentionAudit(tenantId, filters, "operator-current"))
      .toThrow("acceptance lock is required before locked archive export");

    controller.signOffReviewQaHandoffBundleReceipt(tenantId, filters, "operator-current", {
      acknowledgementType: "sign_off",
      reviewerRole: "QA reviewer",
      reviewerLabel: "safe archive integrity reviewer"
    });
    const lock = controller.lockReviewQaHandoffAcceptance(tenantId, filters, "operator-current", {
      lockReason: "Safe QA accepted for archive integrity",
      acceptedByRole: "QA lead",
      acceptedByLabel: "safe archive integrity reviewer"
    });
    const before = listUnmatchedItems(controller, tenantId, { limit: 25 })
      .find((candidate) => candidate.id === item.id);

    const archive = controller.getReviewQaHandoffLockedArchive(tenantId, filters, "operator-current");
    const exportedArchive = controller.exportReviewQaHandoffLockedArchive(tenantId, filters, "operator-current");
    const manifest = controller.getReviewQaHandoffRetentionManifest(tenantId, filters, "operator-current");
    const integrity = controller.getReviewQaHandoffArchiveIntegrity(tenantId, filters, "operator-current");
    const retentionAudit = controller.getReviewQaHandoffRetentionAudit(tenantId, filters, "operator-current");
    const after = listUnmatchedItems(controller, tenantId, { limit: 25 })
      .find((candidate) => candidate.id === item.id);
    const serialized = JSON.stringify({ lock, archive, exportedArchive, manifest, integrity, retentionAudit, after });

    expect(archive).toMatchObject({
      lockedArchiveStatus: "ready",
      retentionManifestStatus: "ready",
      lockStatus: "locked",
      externalCalls: 0
    });
    expect(exportedArchive).toMatchObject({
      lockedArchiveStatus: "exported",
      archiveAcknowledgementStatus: "exported",
      exportKind: "qa-handoff-locked-archive",
      externalCalls: 0
    });
    expect(manifest).toMatchObject({
      retentionManifestStatus: "ready",
      retentionReadiness: "ready",
      externalCalls: 0
    });
    expect(integrity).toMatchObject({
      integrityStatus: "confirmed",
      retentionAuditStatus: "confirmed",
      digestChainStatus: "confirmed",
      lockedArchiveStatus: "exported",
      retentionManifestStatus: "ready",
      externalCalls: 0
    });
    expect(integrity.safeFilename).toBe("provider-webhook-review-qa-handoff-locked-archive-integrity.json");
    expect(integrity.safeDigest).toMatch(/^sha256:/);
    expect(integrity.lockedArchiveDigest).toBe(exportedArchive.safeDigest);
    expect(integrity.retentionManifestDigest).toMatch(/^sha256:/);
    expect(integrity.counts.digestChainLinkCount).toBe(6);
    expect(retentionAudit).toMatchObject({
      retentionPolicyStatus: "active",
      retentionAuditStatus: "confirmed",
      retentionManifestStatus: "ready",
      lockedArchiveStatus: "exported",
      digestChainStatus: "confirmed",
      externalCalls: 0
    });
    expect(retentionAudit.safeFilename).toBe("provider-webhook-review-qa-handoff-retention-audit.json");
    expect(retentionAudit.safeDigest).toMatch(/^sha256:/);
    expect(retentionAudit.auditChecklistItems.map((entry) => entry.key)).toEqual(expect.arrayContaining([
      "locked_archive_available",
      "retention_manifest_ready",
      "external_calls_zero"
    ]));
    expect(after).toMatchObject({
      reviewStatus: before?.reviewStatus,
      linkStatus: before?.linkStatus,
      unmatchedStatus: before?.unmatchedStatus,
      assignmentStatus: before?.assignmentStatus,
      escalationStatus: before?.escalationStatus,
      resolutionStatus: before?.resolutionStatus,
      messagePersisted: before?.messagePersisted,
      linkedConversationId: before?.linkedConversationId,
      linkedMessageId: before?.linkedMessageId
    });
    expect(serialized).not.toMatch(/raw-reply-token|raw-room-qa-archive-integrity|"rawPayload"\s*:|"rawSignature"\s*:|"senderId"\s*:|"roomId"\s*:|"token"\s*:|"secret"\s*:|"authorization"\s*:|"cookie"\s*:|providerRaw|payloadJson|line\.push|telegram\.send|facebook\.send|instagram\.send|openai|ai\.call|notification\.sent/i);
  });

  it("returns safe QA archive finalization and retention sign-off without mutating review state", async () => {
    const { controller, service } = buildController(noMatchConversations());
    const item = await createUnmatched(controller, "raw-room-qa-archive-finalization", "qa-archive-finalization-1", "Safe QA archive finalization target");
    const filters = {
      provider: "line",
      eventType: "message.created"
    };

    expect(() => controller.getReviewQaHandoffArchiveFinalization(tenantId, filters, "operator-current"))
      .toThrow("acceptance lock is required before locked archive export");
    expect(() => controller.signOffReviewQaHandoffArchiveFinalization(tenantId, filters, "operator-current", {
      reviewerRole: "retention reviewer",
      reviewerLabel: "safe finalization reviewer"
    })).toThrow("acceptance lock is required before locked archive export");

    controller.signOffReviewQaHandoffBundleReceipt(tenantId, filters, "operator-current", {
      acknowledgementType: "sign_off",
      reviewerRole: "QA reviewer",
      reviewerLabel: "safe finalization reviewer"
    });
    controller.lockReviewQaHandoffAcceptance(tenantId, filters, "operator-current", {
      lockReason: "Safe QA accepted for archive finalization",
      acceptedByRole: "QA lead",
      acceptedByLabel: "safe finalization reviewer"
    });
    expect(() => controller.getReviewQaHandoffArchiveReleaseEvidence(tenantId, filters, "operator-current"))
      .toThrow("locked archive export is required before release evidence");
    expect(() => controller.getReviewQaHandoffArchiveReleaseVerification(tenantId, filters, "operator-current"))
      .toThrow("locked archive export is required before release evidence");
    expect(() => controller.getReviewQaHandoffArchiveReleaseCertification(tenantId, filters, "operator-current"))
      .toThrow("locked archive export is required before release evidence");
    expect(() => controller.getReviewQaHandoffArchiveReleaseClosureLedger(tenantId, filters, "operator-current"))
      .toThrow("locked archive export is required before release evidence");
    expect(() => controller.getReviewQaHandoffArchiveReleaseAttestationAudit(tenantId, filters, "operator-current"))
      .toThrow("locked archive export is required before release evidence");
    expect(() => controller.getReviewQaHandoffArchiveReleaseAttestationReconciliation(tenantId, filters, "operator-current"))
      .toThrow("locked archive export is required before release evidence");
    expect(() => controller.getReviewQaHandoffCertifiedReleaseGate(tenantId, filters, "operator-current"))
      .toThrow("locked archive export is required before release evidence");
    expect(() => controller.getReviewQaHandoffCertifiedReleaseDecisionReceipt(tenantId, filters, "operator-current"))
      .toThrow("locked archive export is required before release evidence");
    expect(() => controller.getReviewQaHandoffCertifiedReleaseHandoffPacket(tenantId, filters, "operator-current"))
      .toThrow("locked archive export is required before release evidence");
    expect(() => controller.getReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord(tenantId, filters, "operator-current"))
      .toThrow("locked archive export is required before release evidence");
    controller.exportReviewQaHandoffLockedArchive(tenantId, filters, "operator-current");
    const before = listUnmatchedItems(controller, tenantId, { limit: 25 })
      .find((candidate) => candidate.id === item.id);
    const integrity = controller.getReviewQaHandoffArchiveIntegrity(tenantId, filters, "operator-current");
    const retentionAudit = controller.getReviewQaHandoffRetentionAudit(tenantId, filters, "operator-current");
    const finalization = controller.getReviewQaHandoffArchiveFinalization(tenantId, filters, "operator-current");

    expect(() => controller.getReviewQaHandoffArchiveFinalizationReceipt(tenantId, filters, "operator-current"))
      .toThrow("finalization sign-off is required before finalization receipt");
    expect(() => controller.getReviewQaHandoffArchiveReleaseEvidence(tenantId, filters, "operator-current"))
      .toThrow("finalization sign-off is required before release evidence");
    expect(() => controller.getReviewQaHandoffArchiveReleaseVerification(tenantId, filters, "operator-current"))
      .toThrow("finalization sign-off is required before release evidence");
    expect(() => controller.getReviewQaHandoffArchiveReleaseCertification(tenantId, filters, "operator-current"))
      .toThrow("finalization sign-off is required before release evidence");
    expect(() => controller.getReviewQaHandoffArchiveReleaseClosureLedger(tenantId, filters, "operator-current"))
      .toThrow("finalization sign-off is required before release evidence");
    expect(() => controller.getReviewQaHandoffArchiveReleaseAttestationAudit(tenantId, filters, "operator-current"))
      .toThrow("finalization sign-off is required before release evidence");
    expect(() => controller.getReviewQaHandoffArchiveReleaseAttestationReconciliation(tenantId, filters, "operator-current"))
      .toThrow("finalization sign-off is required before release evidence");
    expect(() => controller.getReviewQaHandoffCertifiedReleaseGate(tenantId, filters, "operator-current"))
      .toThrow("finalization sign-off is required before release evidence");
    expect(() => controller.getReviewQaHandoffCertifiedReleaseDecisionReceipt(tenantId, filters, "operator-current"))
      .toThrow("finalization sign-off is required before release evidence");
    expect(() => controller.getReviewQaHandoffCertifiedReleaseHandoffPacket(tenantId, filters, "operator-current"))
      .toThrow("finalization sign-off is required before release evidence");
    expect(() => controller.getReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord(tenantId, filters, "operator-current"))
      .toThrow("finalization sign-off is required before release evidence");

    const signOff = controller.signOffReviewQaHandoffArchiveFinalization(tenantId, filters, "operator-current", {
      reviewerRole: "retention reviewer",
      reviewerLabel: "safe finalization reviewer"
    });
    const receipt = controller.getReviewQaHandoffArchiveFinalizationReceipt(tenantId, filters, "operator-current");
    const releaseEvidence = controller.getReviewQaHandoffArchiveReleaseEvidence(tenantId, filters, "operator-current");
    const releaseVerification = controller.getReviewQaHandoffArchiveReleaseVerification(tenantId, filters, "operator-current");
    const releaseCertification = controller.getReviewQaHandoffArchiveReleaseCertification(tenantId, filters, "operator-current");
    const closureLedger = controller.getReviewQaHandoffArchiveReleaseClosureLedger(tenantId, filters, "operator-current");
    const attestationAudit = controller.getReviewQaHandoffArchiveReleaseAttestationAudit(tenantId, filters, "operator-current");
    const reconciliation = controller.getReviewQaHandoffArchiveReleaseAttestationReconciliation(tenantId, filters, "operator-current");
    const releaseGate = controller.getReviewQaHandoffCertifiedReleaseGate(tenantId, filters, "operator-current");
    const decisionReceipt = controller.getReviewQaHandoffCertifiedReleaseDecisionReceipt(tenantId, filters, "operator-current");
    const handoffPacket = controller.getReviewQaHandoffCertifiedReleaseHandoffPacket(tenantId, filters, "operator-current");
    const initialAcceptanceRecord = controller.getReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord(tenantId, filters, "operator-current");
    const beforeAcceptancePost = listUnmatchedItems(controller, tenantId, { limit: 25 })
      .find((candidate) => candidate.id === item.id);
    const acknowledgedAcceptanceRecord = controller.acknowledgeReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord(tenantId, filters, "operator-current", {
      acknowledgementType: "operator_checklist_acknowledgement",
      acknowledgedByRole: "release owner",
      acknowledgedByLabel: "safe release owner",
      acknowledgedChecklistKeys: handoffPacket.operatorChecklist.map((entry) => entry.key)
    });
    const acceptedReadback = controller.getReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord(tenantId, filters, "operator-current");
    const handoffPacketAfterAcceptance = controller.getReviewQaHandoffCertifiedReleaseHandoffPacket(tenantId, filters, "operator-current");
    const initialNoopExecutionDryRun = controller.getReviewQaHandoffCertifiedReleaseNoopExecutionDryRun(tenantId, filters, "operator-current");
    const afterNoopRead = listUnmatchedItems(controller, tenantId, { limit: 25 })
      .find((candidate) => candidate.id === item.id);
    const executedNoopExecutionDryRun = controller.runReviewQaHandoffCertifiedReleaseNoopExecutionDryRun(tenantId, filters, "operator-current", {
      requestedBy: "safe release owner",
      checklistAcknowledged: true,
      operatorNote: "Safe no-op execution dry-run from controller test",
      dryRunReason: "safe no-op execution readiness rehearsal",
      executionMode: "no_op"
    });
    const noopExecutionDryRunReadback = controller.getReviewQaHandoffCertifiedReleaseNoopExecutionDryRun(tenantId, filters, "operator-current");
    const dryRunResultLedger = controller.getReviewQaHandoffCertifiedReleaseDryRunResultLedger(tenantId, filters, "operator-current");
    const beforeFinalReadinessCertificateRead = listUnmatchedItems(controller, tenantId, { limit: 25 })
      .find((candidate) => candidate.id === item.id);
    const finalReadinessCertificate = controller.getReviewQaHandoffCertifiedReleaseFinalReadinessCertificate(tenantId, filters, "operator-current");
    const afterFinalReadinessCertificateRead = listUnmatchedItems(controller, tenantId, { limit: 25 })
      .find((candidate) => candidate.id === item.id);
    const beforeFreezeAuditRegisterRead = listUnmatchedItems(controller, tenantId, { limit: 25 })
      .find((candidate) => candidate.id === item.id);
    const freezeAuditRegister = controller.getReviewQaHandoffCertifiedReleaseFreezeAuditRegister(tenantId, filters, "operator-current");
    const afterFreezeAuditRegisterRead = listUnmatchedItems(controller, tenantId, { limit: 25 })
      .find((candidate) => candidate.id === item.id);
    const beforeRollbackRehearsalReceiptRead = listUnmatchedItems(controller, tenantId, { limit: 25 })
      .find((candidate) => candidate.id === item.id);
    const rollbackRehearsalReceipt = controller.getReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt(tenantId, filters, "operator-current");
    const afterRollbackRehearsalReceiptRead = listUnmatchedItems(controller, tenantId, { limit: 25 })
      .find((candidate) => candidate.id === item.id);
    const beforeControlRoomPacketRead = listUnmatchedItems(controller, tenantId, { limit: 25 })
      .find((candidate) => candidate.id === item.id);
    const controlRoomPacket = controller.getReviewQaHandoffCertifiedReleaseControlRoomPacket(tenantId, filters, "operator-current");
    const afterControlRoomPacketRead = listUnmatchedItems(controller, tenantId, { limit: 25 })
      .find((candidate) => candidate.id === item.id);
    const beforeCutoverChecklistReceiptRead = listUnmatchedItems(controller, tenantId, { limit: 25 })
      .find((candidate) => candidate.id === item.id);
    const cutoverChecklistReceipt = controller.getReviewQaHandoffCertifiedReleaseCutoverChecklistReceipt(tenantId, filters, "operator-current");
    const afterCutoverChecklistReceiptRead = listUnmatchedItems(controller, tenantId, { limit: 25 })
      .find((candidate) => candidate.id === item.id);
    const acceptanceRecordAfterNoopExecutionDryRun = controller.getReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord(tenantId, filters, "operator-current");
    const handoffPacketAfterNoopExecutionDryRun = controller.getReviewQaHandoffCertifiedReleaseHandoffPacket(tenantId, filters, "operator-current");
    const after = listUnmatchedItems(controller, tenantId, { limit: 25 })
      .find((candidate) => candidate.id === item.id);
    const serialized = JSON.stringify({ integrity, retentionAudit, finalization, signOff, receipt, releaseEvidence, releaseVerification, releaseCertification, closureLedger, attestationAudit, reconciliation, releaseGate, decisionReceipt, handoffPacket, initialAcceptanceRecord, acknowledgedAcceptanceRecord, acceptedReadback, handoffPacketAfterAcceptance, initialNoopExecutionDryRun, executedNoopExecutionDryRun, noopExecutionDryRunReadback, dryRunResultLedger, finalReadinessCertificate, freezeAuditRegister, rollbackRehearsalReceipt, controlRoomPacket, cutoverChecklistReceipt, acceptanceRecordAfterNoopExecutionDryRun, handoffPacketAfterNoopExecutionDryRun, after });

    expect(finalization).toMatchObject({
      finalizationStatus: "ready",
      retentionSignOffStatus: "not_signed",
      finalizationReceiptStatus: "not_created",
      integrityStatus: "confirmed",
      retentionAuditStatus: "confirmed",
      digestChainStatus: "confirmed",
      externalCalls: 0
    });
    expect(finalization.safeFilename).toBe("provider-webhook-review-qa-handoff-archive-finalization.json");
    expect(finalization.safeDigest).toMatch(/^sha256:/);
    expect(finalization.finalizationReceiptDigest).toBeNull();
    expect(finalization.integrityDigest).toBe(integrity.safeDigest);
    expect(finalization.counts.digestChainLinkCount).toBe(7);
    expect(signOff).toMatchObject({
      action: "sign_off",
      finalizationStatus: "finalized",
      retentionSignOffStatus: "signed_off",
      finalizationReceiptStatus: "ready",
      integrityStatus: "confirmed",
      retentionAuditStatus: "confirmed",
      safeReviewerLabel: "safe finalization reviewer",
      externalCalls: 0
    });
    expect(signOff.safeFilename).toBe("provider-webhook-review-qa-handoff-archive-finalization-signoff.json");
    expect(signOff.safeDigest).toMatch(/^sha256:/);
    expect(signOff.finalizationReceiptDigest).toMatch(/^sha256:/);
    expect(signOff.signOffRecordId).toMatch(/^provider-webhook-qa-handoff-archive-finalization-signoff-/);
    expect(receipt).toMatchObject({
      receiptKind: "qa-handoff-locked-archive-finalization-receipt",
      finalizationStatus: "finalized",
      retentionSignOffStatus: "signed_off",
      finalizationReceiptStatus: "ready",
      signOffRecordId: signOff.signOffRecordId,
      externalCalls: 0
    });
    expect(receipt.safeFilename).toBe("provider-webhook-review-qa-handoff-archive-finalization-receipt.json");
    expect(receipt.safeDigest).toMatch(/^sha256:/);
    expect(releaseEvidence).toMatchObject({
      evidenceKind: "qa-handoff-locked-archive-release-evidence-pack",
      releaseReadinessStatus: "ready_for_release",
      finalizationStatus: "finalized",
      retentionSignOffStatus: "signed_off",
      finalizationReceiptStatus: "ready",
      digestChainStatus: "confirmed",
      prerequisiteChecklist: {
        qaHandoffBundleReady: true,
        qaHandoffExportReady: true,
        receiptSignedOff: true,
        acceptanceLocked: true,
        lockedArchiveReady: true,
        lockedArchiveExported: true,
        retentionManifestReady: true,
        archiveIntegrityConfirmed: true,
        retentionAuditConfirmed: true,
        finalizationSignedOff: true,
        finalizationReceiptReady: true,
        digestChainConfirmed: true,
        safeFilenamePresent: true,
        safeDigestPresent: true,
        providerOutboundAbsent: true,
        externalCallsZero: true
      },
      externalCalls: 0
    });
    expect(releaseEvidence.safeFilename).toBe("provider-webhook-review-qa-handoff-archive-release-evidence-pack.json");
    expect(releaseEvidence.safeDigest).toMatch(/^sha256:/);
    expect(releaseEvidence.retentionAuditDigest).toBe(retentionAudit.safeDigest);
    expect(releaseEvidence.counts.releaseEvidenceCheckedCount).toBe(1);
    expect(releaseEvidence.counts.prerequisitePassedCount).toBe(releaseEvidence.counts.prerequisiteTotalCount);
    expect(releaseVerification).toMatchObject({
      verificationKind: "qa-handoff-locked-archive-release-verification-matrix",
      verificationStatus: "verified",
      releaseReadinessStatus: "ready_for_release",
      digestChainStatus: "confirmed",
      releaseEvidenceDigest: releaseEvidence.safeDigest,
      externalCalls: 0
    });
    expect(releaseVerification.safeFilename).toBe("provider-webhook-review-qa-handoff-archive-release-verification-matrix.json");
    expect(releaseVerification.safeDigest).toMatch(/^sha256:/);
    expect(releaseVerification.digestMatrixRows.map((row) => row.key)).toEqual([
      "qa_handoff_bundle",
      "qa_handoff_export",
      "receipt_sign_off",
      "acceptance_lock",
      "locked_archive_export",
      "retention_manifest",
      "archive_integrity",
      "retention_audit",
      "finalization_receipt",
      "release_evidence"
    ]);
    expect(releaseVerification.digestMatrixRows.every((row) => row.verificationStatus === "verified" && row.digestPresent && row.digestMatchesExpected)).toBe(true);
    expect(releaseVerification.counts.releaseVerificationCheckedCount).toBe(1);
    expect(releaseVerification.counts.digestMatrixRowCount).toBe(10);
    expect(releaseVerification.counts.digestMatrixVerifiedCount).toBe(10);
    expect(releaseCertification).toMatchObject({
      certificationKind: "qa-handoff-locked-archive-release-certification-receipt",
      certificationStatus: "certified",
      releaseReadinessStatus: "ready_for_release",
      verificationStatus: "verified",
      digestChainStatus: "confirmed",
      releaseEvidenceDigest: releaseEvidence.safeDigest,
      releaseVerificationDigest: releaseVerification.safeDigest,
      externalCalls: 0
    });
    expect(releaseCertification.safeFilename).toBe("provider-webhook-review-qa-handoff-archive-release-certification-receipt.json");
    expect(releaseCertification.safeDigest).toMatch(/^sha256:/);
    expect(releaseCertification.certificationChecklist).toMatchObject({
      releaseEvidenceReady: true,
      releaseVerificationPresent: true,
      releaseVerificationVerified: true,
      releaseReadinessReady: true,
      digestChainConfirmed: true,
      prerequisitesComplete: true,
      digestMatrixVerified: true,
      providerOutboundAbsent: true,
      externalCallsZero: true
    });
    expect(releaseCertification.digestMatrixSummary).toMatchObject({
      totalRows: 10,
      verifiedRows: 10,
      needsReviewRows: 0,
      blockedRows: 0,
      allRowsVerified: true
    });
    expect(releaseCertification.counts.releaseCertificationCheckedCount).toBe(1);
    expect(releaseCertification.counts.certificationChecklistPassedCount).toBe(releaseCertification.counts.certificationChecklistTotalCount);
    expect(closureLedger).toMatchObject({
      ledgerKind: "qa-handoff-locked-archive-release-closure-ledger",
      ledgerStatus: "certified_release_closed",
      certificationStatus: "certified",
      releaseReadinessStatus: "ready_for_release",
      verificationStatus: "verified",
      digestChainStatus: "confirmed",
      releaseEvidenceDigest: releaseEvidence.safeDigest,
      releaseVerificationDigest: releaseVerification.safeDigest,
      releaseCertificationDigest: releaseCertification.safeDigest,
      externalCalls: 0
    });
    expect(closureLedger.safeFilename).toBe("provider-webhook-review-qa-handoff-archive-release-closure-ledger.json");
    expect(closureLedger.safeDigest).toMatch(/^sha256:/);
    expect(closureLedger.ledgerRows.map((row) => row.key)).toEqual([
      "release_evidence",
      "release_verification",
      "release_certification",
      "prerequisite_checklist",
      "certification_checklist"
    ]);
    expect(closureLedger.ledgerSummary).toMatchObject({
      ledgerRowCount: 5,
      closedRowCount: 5,
      prerequisiteChecklistComplete: true,
      certificationChecklistComplete: true,
      releaseCertificationDigestPresent: true,
      externalCallsZero: true
    });
    expect(closureLedger.counts.closureLedgerCheckedCount).toBe(1);
    expect(closureLedger.counts.ledgerNeedsReviewRowCount).toBe(0);
    expect(attestationAudit).toMatchObject({
      attestationKind: "qa-handoff-locked-archive-release-attestation-audit",
      attestationStatus: "complete",
      ledgerStatus: "certified_release_closed",
      certificationStatus: "certified",
      releaseReadinessStatus: "ready_for_release",
      verificationStatus: "verified",
      digestChainStatus: "confirmed",
      releaseEvidenceDigest: releaseEvidence.safeDigest,
      releaseVerificationDigest: releaseVerification.safeDigest,
      releaseCertificationDigest: releaseCertification.safeDigest,
      closureLedgerDigest: closureLedger.safeDigest,
      externalCalls: 0
    });
    expect(attestationAudit.safeFilename).toBe("provider-webhook-review-qa-handoff-archive-release-attestation-audit.json");
    expect(attestationAudit.safeDigest).toMatch(/^sha256:/);
    expect(attestationAudit.attestationRows.map((row) => row.key)).toEqual([
      "closure_ledger",
      "release_evidence_digest",
      "release_verification_digest",
      "release_certification_digest",
      "prerequisite_checklist",
      "certification_checklist",
      "external_calls"
    ]);
    expect(attestationAudit.attestationSummary).toMatchObject({
      attestationRowCount: 7,
      attestedRowCount: 7,
      ledgerClosed: true,
      prerequisiteChecklistComplete: true,
      certificationChecklistComplete: true,
      closureLedgerDigestPresent: true,
      externalCallsZero: true
    });
    expect(attestationAudit.counts.attestationAuditCheckedCount).toBe(1);
    expect(attestationAudit.counts.attestationNeedsReviewRowCount).toBe(0);
    expect(reconciliation).toMatchObject({
      reconciliationKind: "qa-handoff-locked-archive-release-attestation-reconciliation-register",
      reconciliationStatus: "aligned",
      attestationStatus: "complete",
      ledgerStatus: "certified_release_closed",
      certificationStatus: "certified",
      releaseReadinessStatus: "ready_for_release",
      verificationStatus: "verified",
      digestChainStatus: "confirmed",
      releaseEvidenceDigest: releaseEvidence.safeDigest,
      verificationDigest: releaseVerification.safeDigest,
      certificationDigest: releaseCertification.safeDigest,
      closureLedgerDigest: closureLedger.safeDigest,
      attestationAuditDigest: attestationAudit.safeDigest,
      externalCalls: 0
    });
    expect(reconciliation.safeFilename).toBe("provider-webhook-review-qa-handoff-archive-release-attestation-reconciliation.json");
    expect(reconciliation.safeDigest).toMatch(/^sha256:/);
    expect(reconciliation.reconciliationDigest).toBe(reconciliation.safeDigest);
    expect(reconciliation.reconciliationRows.map((row) => row.key)).toEqual([
      "release_evidence_digest",
      "release_verification_digest",
      "release_certification_digest",
      "closure_ledger_digest",
      "attestation_audit_digest",
      "prerequisite_checklist",
      "certification_checklist",
      "external_calls"
    ]);
    expect(reconciliation.exceptionRows).toHaveLength(0);
    expect(reconciliation.reconciliationSummary).toMatchObject({
      reconciliationRowCount: 8,
      alignedRowCount: 8,
      exceptionRowCount: 0,
      attestationAuditComplete: true,
      closureLedgerClosed: true,
      prerequisiteChecklistComplete: true,
      certificationChecklistComplete: true,
      allDigestsLinked: true,
      externalCallsZero: true
    });
    expect(reconciliation.counts.reconciliationCheckedCount).toBe(1);
    expect(reconciliation.counts.reconciliationExceptionRowCount).toBe(0);
    expect(releaseGate).toMatchObject({
      gateKind: "qa-handoff-locked-archive-certified-release-gate",
      gateStatus: "ready",
      goNoGoDecision: "go",
      releaseReadinessStatus: "ready_for_release",
      reconciliationStatus: "aligned",
      attestationStatus: "complete",
      ledgerStatus: "certified_release_closed",
      certificationStatus: "certified",
      verificationStatus: "verified",
      digestChainStatus: "confirmed",
      releaseEvidenceDigest: releaseEvidence.safeDigest,
      verificationDigest: releaseVerification.safeDigest,
      certificationDigest: releaseCertification.safeDigest,
      closureLedgerDigest: closureLedger.safeDigest,
      attestationAuditDigest: attestationAudit.safeDigest,
      reconciliationDigest: reconciliation.reconciliationDigest,
      externalCalls: 0
    });
    expect(releaseGate.safeFilename).toBe("provider-webhook-review-qa-handoff-certified-release-gate.json");
    expect(releaseGate.safeDigest).toMatch(/^sha256:/);
    expect(releaseGate.releaseGateDigest).toBe(releaseGate.safeDigest);
    expect(releaseGate.gateChecklist).toMatchObject({
      prerequisiteChainComplete: true,
      reconciliationComplete: true,
      attestationComplete: true,
      closureLedgerClosed: true,
      certificationComplete: true,
      releaseReady: true,
      verificationComplete: true,
      digestChainConfirmed: true,
      prerequisiteChecklistComplete: true,
      certificationChecklistComplete: true,
      noBlockingExceptions: true,
      externalCallsZero: true
    });
    expect(releaseGate.blockingReasons).toHaveLength(0);
    expect(releaseGate.exceptionRows).toHaveLength(0);
    expect(releaseGate.counts.gateCheckedCount).toBe(1);
    expect(releaseGate.counts.gateChecklistPassedCount).toBe(releaseGate.counts.gateChecklistTotalCount);
    expect(releaseGate.counts.blockingReasonCount).toBe(0);
    expect(decisionReceipt).toMatchObject({
      receiptKind: "qa-handoff-locked-archive-certified-release-decision-receipt",
      receiptStatus: "issued",
      releaseDecision: "go",
      gateStatus: "ready",
      goNoGoDecision: "go",
      releaseReadinessStatus: "ready_for_release",
      reconciliationStatus: "aligned",
      attestationStatus: "complete",
      ledgerStatus: "certified_release_closed",
      certificationStatus: "certified",
      verificationStatus: "verified",
      digestChainStatus: "confirmed",
      releaseEvidenceDigest: releaseEvidence.safeDigest,
      verificationDigest: releaseVerification.safeDigest,
      certificationDigest: releaseCertification.safeDigest,
      closureLedgerDigest: closureLedger.safeDigest,
      attestationAuditDigest: attestationAudit.safeDigest,
      reconciliationDigest: reconciliation.reconciliationDigest,
      releaseGateDigest: releaseGate.releaseGateDigest,
      externalCalls: 0
    });
    expect(decisionReceipt.safeFilename).toBe("provider-webhook-review-qa-handoff-certified-release-decision-receipt.json");
    expect(decisionReceipt.safeDigest).toMatch(/^sha256:/);
    expect(decisionReceipt.decisionReceiptDigest).toBe(decisionReceipt.safeDigest);
    expect(decisionReceipt.inheritedGateChecklist.externalCallsZero).toBe(true);
    expect(decisionReceipt.inheritedBlockingReasons).toHaveLength(0);
    expect(decisionReceipt.inheritedExceptionRows).toHaveLength(0);
    expect(decisionReceipt.receiptRows).toHaveLength(13);
    expect(decisionReceipt.receiptSummary).toMatchObject({
      receiptRowCount: 13,
      completeReceiptRowCount: 13,
      releaseGateReady: true,
      releaseDecisionGo: true,
      gateChecklistComplete: true,
      noBlockingReasons: true,
      externalCallsZero: true
    });
    expect(decisionReceipt.counts.decisionReceiptCheckedCount).toBe(1);
    expect(decisionReceipt.counts.receiptRowCompleteCount).toBe(decisionReceipt.counts.receiptRowCount);
    expect(handoffPacket).toMatchObject({
      packetKind: "qa-handoff-locked-archive-certified-release-handoff-packet",
      packetStatus: "issued",
      handoffStatus: "ready",
      releaseDecision: "go",
      receiptStatus: "issued",
      gateStatus: "ready",
      goNoGoDecision: "go",
      releaseReadinessStatus: "ready_for_release",
      reconciliationStatus: "aligned",
      attestationStatus: "complete",
      ledgerStatus: "certified_release_closed",
      certificationStatus: "certified",
      verificationStatus: "verified",
      digestChainStatus: "confirmed",
      decisionReceiptDigest: decisionReceipt.decisionReceiptDigest,
      releaseGateDigest: releaseGate.releaseGateDigest,
      externalCalls: 0
    });
    expect(handoffPacket.safeFilename).toBe("provider-webhook-review-qa-handoff-certified-release-handoff-packet.json");
    expect(handoffPacket.safeDigest).toMatch(/^sha256:/);
    expect(handoffPacket.handoffPacketDigest).toBe(handoffPacket.safeDigest);
    expect(handoffPacket.handoffRows).toHaveLength(16);
    expect(handoffPacket.runbookRows.length).toBeGreaterThan(0);
    expect(handoffPacket.operatorChecklist.length).toBeGreaterThan(0);
    expect(handoffPacket.releaseOwnerSummary).toMatchObject({
      handoffReady: true,
      releaseDecisionGo: true,
      blockingReasonCount: 0,
      exceptionRowCount: 0,
      externalCallsZero: true
    });
    expect(handoffPacket.counts.handoffPacketCheckedCount).toBe(1);
    expect(handoffPacket.counts.handoffRowCompleteCount).toBe(handoffPacket.counts.handoffRowCount);
    expect(handoffPacket.counts.runbookRowReadyCount).toBe(handoffPacket.counts.runbookRowCount);
    expect(handoffPacket.counts.operatorChecklistCompleteCount).toBe(handoffPacket.counts.operatorChecklistItemCount);
    expect(initialAcceptanceRecord).toMatchObject({
      acceptanceKind: "qa-handoff-locked-archive-certified-release-handoff-acceptance-record",
      acceptanceStatus: "not_started",
      handoffStatus: "ready",
      releaseDecision: "go",
      packetStatus: "issued",
      receiptStatus: "issued",
      gateStatus: "ready",
      goNoGoDecision: "go",
      externalCalls: 0
    });
    expect(initialAcceptanceRecord.operatorChecklist).toHaveLength(handoffPacket.operatorChecklist.length);
    expect(initialAcceptanceRecord.acknowledgedChecklist).toHaveLength(handoffPacket.operatorChecklist.length);
    expect(initialAcceptanceRecord.acknowledgementRows.length).toBeGreaterThan(0);
    expect(initialAcceptanceRecord.releaseOwnerSummary.operatorChecklistAcknowledged).toBe(false);
    expect(acknowledgedAcceptanceRecord).toMatchObject({
      acceptanceStatus: "acknowledged",
      handoffStatus: "ready",
      releaseDecision: "go",
      packetStatus: "issued",
      receiptStatus: "issued",
      gateStatus: "ready",
      goNoGoDecision: "go",
      releaseReadinessStatus: "ready_for_release",
      reconciliationStatus: "aligned",
      attestationStatus: "complete",
      ledgerStatus: "certified_release_closed",
      certificationStatus: "certified",
      verificationStatus: "verified",
      digestChainStatus: "confirmed",
      handoffPacketDigest: handoffPacket.handoffPacketDigest,
      decisionReceiptDigest: decisionReceipt.decisionReceiptDigest,
      releaseGateDigest: releaseGate.releaseGateDigest,
      externalCalls: 0
    });
    expect(acknowledgedAcceptanceRecord.safeFilename).toBe("provider-webhook-review-qa-handoff-certified-release-handoff-acceptance-record.json");
    expect(acknowledgedAcceptanceRecord.safeDigest).toMatch(/^sha256:/);
    expect(acknowledgedAcceptanceRecord.acceptanceRecordDigest).toBe(acknowledgedAcceptanceRecord.safeDigest);
    expect(acknowledgedAcceptanceRecord.acknowledgedChecklist.every((entry) => entry.acknowledged)).toBe(true);
    expect(acknowledgedAcceptanceRecord.acknowledgementRows.every((entry) => entry.complete)).toBe(true);
    expect(acknowledgedAcceptanceRecord.inheritedHandoffPacketSummary).toMatchObject({
      packetStatus: "issued",
      handoffStatus: "ready",
      releaseDecision: "go",
      externalCallsZero: true
    });
    expect(acknowledgedAcceptanceRecord.releaseOwnerSummary).toMatchObject({
      acknowledgedByRole: "release owner",
      acknowledgedByLabel: "safe release owner",
      handoffReady: true,
      operatorChecklistAcknowledged: true,
      externalCallsZero: true
    });
    expect(acknowledgedAcceptanceRecord.counts.acceptanceRecordMutationCount).toBe(1);
    expect(acceptedReadback.acceptanceStatus).toBe("acknowledged");
    expect(acceptedReadback.acceptanceRecordDigest).toBe(acknowledgedAcceptanceRecord.acceptanceRecordDigest);
    expect(handoffPacketAfterAcceptance).toEqual(handoffPacket);
    expect(initialNoopExecutionDryRun).toMatchObject({
      dryRunKind: "qa-handoff-locked-archive-certified-release-noop-execution-dryrun",
      dryRunStatus: "not_started",
      executionMode: "no_op",
      acceptanceStatus: "acknowledged",
      handoffStatus: "ready",
      releaseDecision: "go",
      packetStatus: "issued",
      receiptStatus: "issued",
      gateStatus: "ready",
      goNoGoDecision: "go",
      externalCalls: 0
    });
    expect(initialNoopExecutionDryRun.safeFilename).toBe("provider-webhook-review-qa-handoff-certified-release-noop-execution-dryrun.json");
    expect(initialNoopExecutionDryRun.executionChecklist.length).toBeGreaterThan(0);
    expect(initialNoopExecutionDryRun.dryRunRows.length).toBeGreaterThan(0);
    expect(initialNoopExecutionDryRun.executionPlanRows.length).toBeGreaterThan(0);
    expect(executedNoopExecutionDryRun).toMatchObject({
      dryRunStatus: "passed",
      executionMode: "no_op",
      acceptanceStatus: "acknowledged",
      handoffStatus: "ready",
      releaseDecision: "go",
      packetStatus: "issued",
      receiptStatus: "issued",
      gateStatus: "ready",
      goNoGoDecision: "go",
      releaseReadinessStatus: "ready_for_release",
      reconciliationStatus: "aligned",
      attestationStatus: "complete",
      ledgerStatus: "certified_release_closed",
      certificationStatus: "certified",
      verificationStatus: "verified",
      digestChainStatus: "confirmed",
      acceptanceRecordDigest: acknowledgedAcceptanceRecord.acceptanceRecordDigest,
      handoffPacketDigest: handoffPacket.handoffPacketDigest,
      decisionReceiptDigest: decisionReceipt.decisionReceiptDigest,
      releaseGateDigest: releaseGate.releaseGateDigest,
      externalCalls: 0
    });
    expect(executedNoopExecutionDryRun.safeDigest).toMatch(/^sha256:/);
    expect(executedNoopExecutionDryRun.noopExecutionDryRunDigest).toBe(executedNoopExecutionDryRun.safeDigest);
    expect(executedNoopExecutionDryRun.executionChecklist.every((entry) => entry.complete)).toBe(true);
    expect(executedNoopExecutionDryRun.dryRunRows.every((entry) => entry.complete)).toBe(true);
    expect(executedNoopExecutionDryRun.executionPlanRows.every((entry) => entry.complete)).toBe(true);
    expect(executedNoopExecutionDryRun.releaseOwnerSummary).toMatchObject({
      requestedBy: "safe release owner",
      checklistAcknowledged: true,
      handoffReady: true,
      operatorChecklistAcknowledged: true,
      externalCallsZero: true
    });
    expect(executedNoopExecutionDryRun.inheritedAcceptanceSummary).toMatchObject({
      acceptanceStatus: "acknowledged",
      handoffStatus: "ready",
      releaseDecision: "go",
      externalCallsZero: true
    });
    expect(executedNoopExecutionDryRun.counts.noopExecutionDryRunMutationCount).toBe(1);
    expect(noopExecutionDryRunReadback.dryRunStatus).toBe("passed");
    expect(noopExecutionDryRunReadback.noopExecutionDryRunDigest).toBe(executedNoopExecutionDryRun.noopExecutionDryRunDigest);
    expect(dryRunResultLedger).toMatchObject({
      ledgerKind: "qa-handoff-locked-archive-certified-release-dryrun-result-ledger",
      ledgerStatus: "recorded",
      dryRunStatus: "passed",
      executionMode: "no_op",
      acceptanceStatus: "acknowledged",
      handoffStatus: "ready",
      releaseDecision: "go",
      packetStatus: "issued",
      receiptStatus: "issued",
      gateStatus: "ready",
      goNoGoDecision: "go",
      releaseReadinessStatus: "ready_for_release",
      reconciliationStatus: "aligned",
      attestationStatus: "complete",
      ledgerStatusFromClosure: "certified_release_closed",
      certificationStatus: "certified",
      verificationStatus: "verified",
      digestChainStatus: "confirmed",
      noopExecutionDryRunDigest: executedNoopExecutionDryRun.noopExecutionDryRunDigest,
      acceptanceRecordDigest: acknowledgedAcceptanceRecord.acceptanceRecordDigest,
      handoffPacketDigest: handoffPacket.handoffPacketDigest,
      decisionReceiptDigest: decisionReceipt.decisionReceiptDigest,
      releaseGateDigest: releaseGate.releaseGateDigest,
      externalCalls: 0
    });
    expect(dryRunResultLedger.safeFilename).toBe("provider-webhook-review-qa-handoff-certified-release-dryrun-result-ledger.json");
    expect(dryRunResultLedger.safeDigest).toMatch(/^sha256:/);
    expect(dryRunResultLedger.dryRunResultLedgerDigest).toBe(dryRunResultLedger.safeDigest);
    expect(dryRunResultLedger.operatorChecklist.every((entry) => entry.complete)).toBe(true);
    expect(dryRunResultLedger.acknowledgedChecklist.every((entry) => entry.acknowledged)).toBe(true);
    expect(dryRunResultLedger.executionChecklist.every((entry) => entry.complete)).toBe(true);
    expect(dryRunResultLedger.dryRunRows.every((entry) => entry.complete)).toBe(true);
    expect(dryRunResultLedger.executionPlanRows.every((entry) => entry.complete)).toBe(true);
    expect(dryRunResultLedger.resultLedgerRows.every((entry) => entry.complete && entry.rowStatus === "recorded")).toBe(true);
    expect(dryRunResultLedger.finalReadinessRows.every((entry) => entry.complete && entry.readinessStatus === "ready")).toBe(true);
    expect(dryRunResultLedger.inheritedNoopDryRunSummary).toMatchObject({
      dryRunStatus: "passed",
      executionMode: "no_op",
      acceptanceStatus: "acknowledged",
      handoffStatus: "ready",
      releaseDecision: "go",
      externalCallsZero: true
    });
    expect(dryRunResultLedger.counts.dryRunResultLedgerCheckedCount).toBe(1);
    expect(dryRunResultLedger.counts.dryRunResultLedgerMutationCount).toBe(0);
    expect(dryRunResultLedger.counts.resultLedgerRowRecordedCount).toBe(dryRunResultLedger.resultLedgerRows.length);
    expect(dryRunResultLedger.counts.finalReadinessReadyCount).toBe(dryRunResultLedger.finalReadinessRows.length);
    expect(finalReadinessCertificate).toMatchObject({
      certificateKind: "qa-handoff-locked-archive-certified-release-final-readiness-certificate",
      certificateStatus: "issued",
      finalReadinessStatus: "ready",
      ledgerStatus: "recorded",
      dryRunStatus: "passed",
      executionMode: "no_op",
      acceptanceStatus: "acknowledged",
      handoffStatus: "ready",
      releaseDecision: "go",
      packetStatus: "issued",
      receiptStatus: "issued",
      gateStatus: "ready",
      goNoGoDecision: "go",
      dryRunResultLedgerDigest: dryRunResultLedger.dryRunResultLedgerDigest,
      externalCalls: 0
    });
    expect(finalReadinessCertificate.safeFilename).toBe("provider-webhook-review-qa-handoff-certified-release-final-readiness-certificate.json");
    expect(finalReadinessCertificate.finalReadinessCertificateDigest).toBe(finalReadinessCertificate.safeDigest);
    expect(finalReadinessCertificate.resultLedgerRows.every((entry) => entry.complete && entry.rowStatus === "recorded")).toBe(true);
    expect(finalReadinessCertificate.finalReadinessRows.every((entry) => entry.complete && entry.readinessStatus === "ready")).toBe(true);
    expect(finalReadinessCertificate.certificateRows.every((entry) => entry.complete && entry.certificateStatus === "issued" && entry.finalReadinessStatus === "ready")).toBe(true);
    expect(finalReadinessCertificate.inheritedResultLedgerSummary).toMatchObject({
      ledgerStatus: "recorded",
      dryRunStatus: "passed",
      executionMode: "no_op",
      releaseDecision: "go",
      externalCallsZero: true
    });
    expect(finalReadinessCertificate.counts.finalReadinessCertificateCheckedCount).toBe(1);
    expect(finalReadinessCertificate.counts.finalReadinessCertificateMutationCount).toBe(0);
    expect(finalReadinessCertificate.counts.certificateRowIssuedCount).toBe(finalReadinessCertificate.certificateRows.length);
    expect(freezeAuditRegister).toMatchObject({
      registerKind: "qa-handoff-locked-archive-certified-release-freeze-audit-register",
      freezeAuditStatus: "recorded",
      freezeStatus: "frozen",
      rollbackReadinessStatus: "ready",
      certificateStatus: "issued",
      finalReadinessStatus: "ready",
      ledgerStatus: "recorded",
      dryRunStatus: "passed",
      executionMode: "no_op",
      releaseDecision: "go",
      finalReadinessCertificateDigest: finalReadinessCertificate.finalReadinessCertificateDigest,
      externalCalls: 0
    });
    expect(freezeAuditRegister.safeFilename).toBe("provider-webhook-review-qa-handoff-certified-release-freeze-audit-register.json");
    expect(freezeAuditRegister.freezeAuditRegisterDigest).toBe(freezeAuditRegister.safeDigest);
    expect(freezeAuditRegister.rollbackReadinessPlanDigest).toMatch(/^sha256:/);
    expect(freezeAuditRegister.freezeAuditRows.every((entry) => entry.complete && entry.freezeAuditStatus === "recorded" && entry.rollbackReadinessStatus === "ready")).toBe(true);
    expect(freezeAuditRegister.rollbackPlanRows.every((entry) => entry.complete && entry.freezeAuditStatus === "recorded" && entry.rollbackReadinessStatus === "ready")).toBe(true);
    expect(freezeAuditRegister.inheritedFinalReadinessCertificateSummary).toMatchObject({
      certificateStatus: "issued",
      finalReadinessStatus: "ready",
      externalCallsZero: true,
      safeDigest: finalReadinessCertificate.safeDigest
    });
    expect(freezeAuditRegister.counts.freezeAuditRegisterCheckedCount).toBe(1);
    expect(freezeAuditRegister.counts.freezeAuditRegisterMutationCount).toBe(0);
    expect(freezeAuditRegister.counts.freezeAuditRegisteredCount).toBe(freezeAuditRegister.freezeAuditRows.length);
    expect(freezeAuditRegister.counts.rollbackPlanReadyCount).toBe(freezeAuditRegister.rollbackPlanRows.length);
    expect(rollbackRehearsalReceipt).toMatchObject({
      receiptKind: "qa-handoff-locked-archive-certified-release-rollback-rehearsal-receipt",
      rollbackRehearsalStatus: "verified",
      recoveryReadinessStatus: "ready",
      rollbackReadinessStatus: "ready",
      freezeAuditStatus: "recorded",
      freezeStatus: "frozen",
      certificateStatus: "issued",
      finalReadinessStatus: "ready",
      ledgerStatus: "recorded",
      dryRunStatus: "passed",
      executionMode: "no_op",
      releaseDecision: "go",
      freezeAuditRegisterDigest: freezeAuditRegister.freezeAuditRegisterDigest,
      finalReadinessCertificateDigest: finalReadinessCertificate.finalReadinessCertificateDigest,
      externalCalls: 0
    });
    expect(rollbackRehearsalReceipt.safeFilename).toBe("provider-webhook-review-qa-handoff-certified-release-rollback-rehearsal-receipt.json");
    expect(rollbackRehearsalReceipt.rollbackRehearsalReceiptDigest).toBe(rollbackRehearsalReceipt.safeDigest);
    expect(rollbackRehearsalReceipt.freezeSnapshotRows.every((entry) => entry.complete && entry.rollbackRehearsalStatus === "verified" && entry.recoveryReadinessStatus === "ready")).toBe(true);
    expect(rollbackRehearsalReceipt.rollbackReadinessRows.every((entry) => entry.complete && entry.rollbackRehearsalStatus === "verified" && entry.recoveryReadinessStatus === "ready")).toBe(true);
    expect(rollbackRehearsalReceipt.rollbackRehearsalRows.every((entry) => entry.complete && entry.rollbackRehearsalStatus === "verified" && entry.recoveryReadinessStatus === "ready")).toBe(true);
    expect(rollbackRehearsalReceipt.recoveryPlanRows.every((entry) => entry.complete && entry.rollbackRehearsalStatus === "verified" && entry.recoveryReadinessStatus === "ready")).toBe(true);
    expect(rollbackRehearsalReceipt.recoveryReadinessRows.every((entry) => entry.complete && entry.rollbackRehearsalStatus === "verified" && entry.recoveryReadinessStatus === "ready")).toBe(true);
    expect(rollbackRehearsalReceipt.inheritedFreezeAuditSummary).toMatchObject({
      freezeAuditStatus: "recorded",
      freezeStatus: "frozen",
      rollbackReadinessStatus: "ready",
      externalCallsZero: true,
      safeDigest: freezeAuditRegister.safeDigest
    });
    expect(rollbackRehearsalReceipt.counts.rollbackRehearsalReceiptCheckedCount).toBe(1);
    expect(rollbackRehearsalReceipt.counts.rollbackRehearsalReceiptMutationCount).toBe(0);
    expect(rollbackRehearsalReceipt.counts.freezeSnapshotVerifiedCount).toBe(rollbackRehearsalReceipt.freezeSnapshotRows.length);
    expect(rollbackRehearsalReceipt.counts.rollbackReadinessReadyCount).toBe(rollbackRehearsalReceipt.rollbackReadinessRows.length);
    expect(rollbackRehearsalReceipt.counts.rollbackRehearsalVerifiedCount).toBe(rollbackRehearsalReceipt.rollbackRehearsalRows.length);
    expect(rollbackRehearsalReceipt.counts.recoveryReadinessReadyCount).toBe(rollbackRehearsalReceipt.recoveryReadinessRows.length);
    expect(controlRoomPacket).toMatchObject({
      packetKind: "qa-handoff-locked-archive-certified-release-control-room-packet",
      controlRoomStatus: "ready",
      cutoverReadinessStatus: "ready",
      rollbackRehearsalStatus: "verified",
      recoveryReadinessStatus: "ready",
      rollbackReadinessStatus: "ready",
      freezeAuditStatus: "recorded",
      freezeStatus: "frozen",
      certificateStatus: "issued",
      finalReadinessStatus: "ready",
      ledgerStatus: "recorded",
      dryRunStatus: "passed",
      executionMode: "no_op",
      releaseDecision: "go",
      rollbackRehearsalReceiptDigest: rollbackRehearsalReceipt.rollbackRehearsalReceiptDigest,
      freezeAuditRegisterDigest: freezeAuditRegister.freezeAuditRegisterDigest,
      finalReadinessCertificateDigest: finalReadinessCertificate.finalReadinessCertificateDigest,
      externalCalls: 0
    });
    expect(controlRoomPacket.safeFilename).toBe("provider-webhook-review-qa-handoff-certified-release-control-room-packet.json");
    expect(controlRoomPacket.controlRoomPacketDigest).toBe(controlRoomPacket.safeDigest);
    expect(controlRoomPacket.controlRoomRows.every((entry) => entry.complete && entry.controlRoomStatus === "ready" && entry.cutoverReadinessStatus === "ready")).toBe(true);
    expect(controlRoomPacket.cutoverChecklistRows.every((entry) => entry.complete && entry.controlRoomStatus === "ready" && entry.cutoverReadinessStatus === "ready")).toBe(true);
    expect(controlRoomPacket.operatorHandoffRows.every((entry) => entry.complete && entry.controlRoomStatus === "ready" && entry.cutoverReadinessStatus === "ready")).toBe(true);
    expect(controlRoomPacket.inheritedRollbackRehearsalSummary).toMatchObject({
      rollbackRehearsalStatus: "verified",
      recoveryReadinessStatus: "ready",
      externalCallsZero: true,
      safeDigest: rollbackRehearsalReceipt.safeDigest
    });
    expect(controlRoomPacket.counts.controlRoomPacketCheckedCount).toBe(1);
    expect(controlRoomPacket.counts.controlRoomPacketMutationCount).toBe(0);
    expect(controlRoomPacket.counts.controlRoomReadyCount).toBe(controlRoomPacket.controlRoomRows.length);
    expect(controlRoomPacket.counts.cutoverChecklistReadyCount).toBe(controlRoomPacket.cutoverChecklistRows.length);
    expect(controlRoomPacket.counts.operatorHandoffReadyCount).toBe(controlRoomPacket.operatorHandoffRows.length);
    expect(cutoverChecklistReceipt).toMatchObject({
      receiptKind: "qa-handoff-locked-archive-certified-release-cutover-checklist-receipt",
      cutoverChecklistStatus: "verified",
      operatorCommandStatus: "ready",
      controlRoomStatus: "ready",
      cutoverReadinessStatus: "ready",
      rollbackRehearsalStatus: "verified",
      recoveryReadinessStatus: "ready",
      rollbackReadinessStatus: "ready",
      freezeAuditStatus: "recorded",
      freezeStatus: "frozen",
      certificateStatus: "issued",
      finalReadinessStatus: "ready",
      ledgerStatus: "recorded",
      dryRunStatus: "passed",
      executionMode: "no_op",
      acceptanceStatus: "acknowledged",
      handoffStatus: "ready",
      releaseDecision: "go",
      packetStatus: "issued",
      receiptStatus: "issued",
      gateStatus: "ready",
      goNoGoDecision: "go",
      releaseReadinessStatus: "ready_for_release",
      attestationStatus: "complete",
      ledgerStatusFromClosure: "certified_release_closed",
      certificationStatus: "certified",
      verificationStatus: "verified",
      digestChainStatus: "confirmed",
      externalCalls: 0
    });
    expect(["complete", "aligned"]).toContain(cutoverChecklistReceipt.reconciliationStatus);
    expect(cutoverChecklistReceipt.safeFilename).toBe("provider-webhook-review-qa-handoff-certified-release-cutover-checklist-receipt.json");
    expect(cutoverChecklistReceipt.cutoverChecklistReceiptDigest).toBe(cutoverChecklistReceipt.safeDigest);
    expect(cutoverChecklistReceipt.controlRoomPacketDigest).toBe(controlRoomPacket.controlRoomPacketDigest);
    expect(cutoverChecklistReceipt.operatorChecklist).toHaveLength(controlRoomPacket.operatorChecklist.length);
    expect(cutoverChecklistReceipt.acknowledgedChecklist).toHaveLength(controlRoomPacket.acknowledgedChecklist.length);
    expect(cutoverChecklistReceipt.executionChecklist).toHaveLength(controlRoomPacket.executionChecklist.length);
    expect(cutoverChecklistReceipt.controlRoomRows.every((entry) => entry.complete && entry.controlRoomStatus === "ready" && entry.cutoverReadinessStatus === "ready")).toBe(true);
    expect(cutoverChecklistReceipt.cutoverChecklistRows.every((entry) => entry.complete && entry.controlRoomStatus === "ready" && entry.cutoverReadinessStatus === "ready")).toBe(true);
    expect(cutoverChecklistReceipt.operatorHandoffRows.every((entry) => entry.complete && entry.controlRoomStatus === "ready" && entry.cutoverReadinessStatus === "ready")).toBe(true);
    expect(cutoverChecklistReceipt.operatorCommandRows.every((entry) => entry.complete && entry.cutoverChecklistStatus === "verified" && entry.operatorCommandStatus === "ready")).toBe(true);
    expect(cutoverChecklistReceipt.safeCutoverChecklistRows.every((entry) => entry.complete && entry.cutoverChecklistStatus === "verified" && entry.operatorCommandStatus === "ready")).toBe(true);
    expect(cutoverChecklistReceipt.inheritedControlRoomSummary).toMatchObject({
      controlRoomStatus: "ready",
      cutoverReadinessStatus: "ready",
      controlRoomPacketMutationCount: 0,
      externalCallsZero: true,
      safeDigest: controlRoomPacket.safeDigest
    });
    expect(cutoverChecklistReceipt.inheritedBlockingReasons).toHaveLength(0);
    expect(cutoverChecklistReceipt.inheritedExceptionRows).toHaveLength(0);
    expect(cutoverChecklistReceipt.counts.cutoverChecklistReceiptCheckedCount).toBe(1);
    expect(cutoverChecklistReceipt.counts.cutoverChecklistReceiptMutationCount).toBe(0);
    expect(cutoverChecklistReceipt.counts.operatorCommandReadyCount).toBe(cutoverChecklistReceipt.operatorCommandRows.length);
    expect(cutoverChecklistReceipt.counts.safeCutoverChecklistReadyCount).toBe(cutoverChecklistReceipt.safeCutoverChecklistRows.length);
    expect(acceptanceRecordAfterNoopExecutionDryRun).toEqual(acceptedReadback);
    expect(handoffPacketAfterNoopExecutionDryRun).toEqual(handoffPacketAfterAcceptance);
    expect(afterFinalReadinessCertificateRead).toMatchObject({
      reviewStatus: beforeFinalReadinessCertificateRead?.reviewStatus,
      linkStatus: beforeFinalReadinessCertificateRead?.linkStatus,
      unmatchedStatus: beforeFinalReadinessCertificateRead?.unmatchedStatus,
      assignmentStatus: beforeFinalReadinessCertificateRead?.assignmentStatus,
      escalationStatus: beforeFinalReadinessCertificateRead?.escalationStatus,
      resolutionStatus: beforeFinalReadinessCertificateRead?.resolutionStatus,
      messagePersisted: beforeFinalReadinessCertificateRead?.messagePersisted,
      linkedConversationId: beforeFinalReadinessCertificateRead?.linkedConversationId,
      linkedMessageId: beforeFinalReadinessCertificateRead?.linkedMessageId
    });
    expect(afterFreezeAuditRegisterRead).toMatchObject({
      reviewStatus: beforeFreezeAuditRegisterRead?.reviewStatus,
      linkStatus: beforeFreezeAuditRegisterRead?.linkStatus,
      unmatchedStatus: beforeFreezeAuditRegisterRead?.unmatchedStatus,
      assignmentStatus: beforeFreezeAuditRegisterRead?.assignmentStatus,
      escalationStatus: beforeFreezeAuditRegisterRead?.escalationStatus,
      resolutionStatus: beforeFreezeAuditRegisterRead?.resolutionStatus,
      messagePersisted: beforeFreezeAuditRegisterRead?.messagePersisted,
      linkedConversationId: beforeFreezeAuditRegisterRead?.linkedConversationId,
      linkedMessageId: beforeFreezeAuditRegisterRead?.linkedMessageId
    });
    expect(afterRollbackRehearsalReceiptRead).toMatchObject({
      reviewStatus: beforeRollbackRehearsalReceiptRead?.reviewStatus,
      linkStatus: beforeRollbackRehearsalReceiptRead?.linkStatus,
      unmatchedStatus: beforeRollbackRehearsalReceiptRead?.unmatchedStatus,
      assignmentStatus: beforeRollbackRehearsalReceiptRead?.assignmentStatus,
      escalationStatus: beforeRollbackRehearsalReceiptRead?.escalationStatus,
      resolutionStatus: beforeRollbackRehearsalReceiptRead?.resolutionStatus,
      messagePersisted: beforeRollbackRehearsalReceiptRead?.messagePersisted,
      linkedConversationId: beforeRollbackRehearsalReceiptRead?.linkedConversationId,
      linkedMessageId: beforeRollbackRehearsalReceiptRead?.linkedMessageId
    });
    expect(afterControlRoomPacketRead).toMatchObject({
      reviewStatus: beforeControlRoomPacketRead?.reviewStatus,
      linkStatus: beforeControlRoomPacketRead?.linkStatus,
      unmatchedStatus: beforeControlRoomPacketRead?.unmatchedStatus,
      assignmentStatus: beforeControlRoomPacketRead?.assignmentStatus,
      escalationStatus: beforeControlRoomPacketRead?.escalationStatus,
      resolutionStatus: beforeControlRoomPacketRead?.resolutionStatus,
      messagePersisted: beforeControlRoomPacketRead?.messagePersisted,
      linkedConversationId: beforeControlRoomPacketRead?.linkedConversationId,
      linkedMessageId: beforeControlRoomPacketRead?.linkedMessageId
    });
    expect(afterCutoverChecklistReceiptRead).toMatchObject({
      reviewStatus: beforeCutoverChecklistReceiptRead?.reviewStatus,
      linkStatus: beforeCutoverChecklistReceiptRead?.linkStatus,
      unmatchedStatus: beforeCutoverChecklistReceiptRead?.unmatchedStatus,
      assignmentStatus: beforeCutoverChecklistReceiptRead?.assignmentStatus,
      escalationStatus: beforeCutoverChecklistReceiptRead?.escalationStatus,
      resolutionStatus: beforeCutoverChecklistReceiptRead?.resolutionStatus,
      messagePersisted: beforeCutoverChecklistReceiptRead?.messagePersisted,
      linkedConversationId: beforeCutoverChecklistReceiptRead?.linkedConversationId,
      linkedMessageId: beforeCutoverChecklistReceiptRead?.linkedMessageId
    });
    expect(afterNoopRead).toMatchObject({
      reviewStatus: beforeAcceptancePost?.reviewStatus,
      linkStatus: beforeAcceptancePost?.linkStatus,
      unmatchedStatus: beforeAcceptancePost?.unmatchedStatus,
      assignmentStatus: beforeAcceptancePost?.assignmentStatus,
      escalationStatus: beforeAcceptancePost?.escalationStatus,
      resolutionStatus: beforeAcceptancePost?.resolutionStatus,
      messagePersisted: beforeAcceptancePost?.messagePersisted,
      linkedConversationId: beforeAcceptancePost?.linkedConversationId,
      linkedMessageId: beforeAcceptancePost?.linkedMessageId
    });
    expect(after).toMatchObject({
      reviewStatus: beforeAcceptancePost?.reviewStatus,
      linkStatus: beforeAcceptancePost?.linkStatus,
      unmatchedStatus: beforeAcceptancePost?.unmatchedStatus,
      assignmentStatus: beforeAcceptancePost?.assignmentStatus,
      escalationStatus: beforeAcceptancePost?.escalationStatus,
      resolutionStatus: beforeAcceptancePost?.resolutionStatus,
      messagePersisted: beforeAcceptancePost?.messagePersisted,
      linkedConversationId: beforeAcceptancePost?.linkedConversationId,
      linkedMessageId: beforeAcceptancePost?.linkedMessageId
    });
    vi.spyOn(service, "getReviewQaHandoffArchiveReleaseAttestationReconciliation").mockReturnValueOnce({
      ...reconciliation,
      exceptionRows: [{
        code: "digest_gap",
        label: "Safe digest gap",
        status: "safe_exception",
        safeDigest: reconciliation.reconciliationDigest,
        checkedCount: 1
      }],
      reconciliationSummary: {
        ...reconciliation.reconciliationSummary,
        exceptionRowCount: 1
      },
      counts: {
        ...reconciliation.counts,
        reconciliationExceptionRowCount: 1
      }
    });
    const blockedGate = controller.getReviewQaHandoffCertifiedReleaseGate(tenantId, filters, "operator-current");
    expect(blockedGate).toMatchObject({
      gateStatus: "blocked",
      goNoGoDecision: "no_go",
      externalCalls: 0
    });
    expect(blockedGate.blockingReasons.map((reason) => reason.code)).toContain("reconciliation_exception");
    expect(JSON.stringify(blockedGate)).not.toMatch(/rawPayload|rawSignature|senderId|roomId|replyToken|token|secret|authorization|cookie|providerRaw|payloadJson/i);
    vi.spyOn(service, "getReviewQaHandoffCertifiedReleaseGate").mockReturnValueOnce(blockedGate);
    const blockedDecisionReceipt = controller.getReviewQaHandoffCertifiedReleaseDecisionReceipt(tenantId, filters, "operator-current");
    expect(blockedDecisionReceipt).toMatchObject({
      receiptStatus: "blocked",
      releaseDecision: "no_go",
      gateStatus: "blocked",
      goNoGoDecision: "no_go",
      externalCalls: 0
    });
    expect(blockedDecisionReceipt.inheritedBlockingReasons.map((reason) => reason.code)).toContain("reconciliation_exception");
    expect(blockedDecisionReceipt.receiptSummary.noBlockingReasons).toBe(false);
    expect(JSON.stringify(blockedDecisionReceipt)).not.toMatch(/rawPayload|rawSignature|senderId|roomId|replyToken|token|secret|authorization|cookie|providerRaw|payloadJson/i);
    vi.spyOn(service, "getReviewQaHandoffCertifiedReleaseDecisionReceipt").mockReturnValueOnce(blockedDecisionReceipt);
    const blockedHandoffPacket = controller.getReviewQaHandoffCertifiedReleaseHandoffPacket(tenantId, filters, "operator-current");
    expect(blockedHandoffPacket).toMatchObject({
      packetStatus: "blocked",
      handoffStatus: "blocked",
      releaseDecision: "no_go",
      receiptStatus: "blocked",
      gateStatus: "blocked",
      goNoGoDecision: "no_go",
      externalCalls: 0
    });
    expect(blockedHandoffPacket.inheritedBlockingReasons.map((reason) => reason.code)).toContain("reconciliation_exception");
    expect(blockedHandoffPacket.releaseOwnerSummary.handoffReady).toBe(false);
    expect(JSON.stringify(blockedHandoffPacket)).not.toMatch(/rawPayload|rawSignature|senderId|roomId|replyToken|token|secret|authorization|cookie|providerRaw|payloadJson/i);
    vi.spyOn(service, "getReviewQaHandoffCertifiedReleaseHandoffPacket").mockReturnValueOnce(blockedHandoffPacket);
    const blockedAcceptanceRecord = controller.getReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord(tenantId, filters, "operator-current");
    expect(blockedAcceptanceRecord).toMatchObject({
      acceptanceStatus: "blocked",
      handoffStatus: "blocked",
      releaseDecision: "no_go",
      packetStatus: "blocked",
      receiptStatus: "blocked",
      gateStatus: "blocked",
      goNoGoDecision: "no_go",
      externalCalls: 0
    });
    expect(blockedAcceptanceRecord.releaseOwnerSummary.operatorChecklistAcknowledged).toBe(false);
    expect(JSON.stringify(blockedAcceptanceRecord)).not.toMatch(/rawPayload|rawSignature|senderId|roomId|replyToken|token|secret|authorization|cookie|providerRaw|payloadJson/i);
    expect(after).toMatchObject({
      reviewStatus: before?.reviewStatus,
      linkStatus: before?.linkStatus,
      unmatchedStatus: before?.unmatchedStatus,
      assignmentStatus: before?.assignmentStatus,
      escalationStatus: before?.escalationStatus,
      resolutionStatus: before?.resolutionStatus,
      messagePersisted: before?.messagePersisted,
      linkedConversationId: before?.linkedConversationId,
      linkedMessageId: before?.linkedMessageId
    });
    expect(serialized).not.toMatch(/raw-reply-token|raw-room-qa-archive-finalization|"rawPayload"\s*:|"rawSignature"\s*:|"senderId"\s*:|"roomId"\s*:|"token"\s*:|"secret"\s*:|"authorization"\s*:|"cookie"\s*:|providerRaw|payloadJson|line\.push|telegram\.send|facebook\.send|instagram\.send|openai|ai\.call|notification\.sent/i);
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
