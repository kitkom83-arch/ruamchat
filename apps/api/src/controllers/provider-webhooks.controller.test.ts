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
    expect(event.dedupKeyDigest).toBeNull();
    expect(events).toHaveLength(1);
    expect(Object.keys(event).sort()).toEqual([
      "channel",
      "dedupKeyDigest",
      "eventType",
      "externalCalls",
      "id",
      "mode",
      "payloadDigest",
      "payloadFieldCount",
      "payloadSummary",
      "previousEventSeenAt",
      "provider",
      "receivedAt",
      "replayDetected",
      "replayStatus",
      "signatureAlgorithm",
      "signatureFingerprint",
      "signatureStatus",
      "signatureVerified",
      "signedAt",
      "status",
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
    expect(serialized).not.toMatch(/accessToken|webhookSecret|authorization|cookie|rawPayload|providerRaw|payloadJson/i);
  });

  it("verifies a valid sandbox signature without returning raw inputs", async () => {
    const { controller } = buildController();
    const payload = { message: { type: "text", length: 12 } };
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
      externalCalls: 0
    });
    expect(event.signatureFingerprint).toMatch(/^sha256:/);
    expect(event.dedupKeyDigest).toMatch(/^sha256:/);
    expect(serialized).not.toContain(signature);
    expect(serialized).not.toContain("event-valid-1");
    expect(serialized).not.toMatch(/authorization|cookie|rawPayload|providerRaw|payloadJson|webhookSecret/i);
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
    expect(second.previousEventSeenAt).toEqual(expect.any(String));
    expect(events).toHaveLength(2);
    expect(events.every((event) => event.externalCalls === 0)).toBe(true);
    expect(serialized).not.toContain("delivery-duplicate-1");
    expect(serialized).not.toMatch(/outbound\.queued|outbound\.sent|line\.push|telegram\.send|facebook\.send|instagram\.send/i);
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

function buildController() {
  const audit = {
    record: vi.fn(async () => ({ id: "audit-provider-webhook" }))
  };
  const service = new ProviderWebhookEventsService(audit as never);
  return {
    audit,
    service,
    controller: new ProviderWebhooksController(service)
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
