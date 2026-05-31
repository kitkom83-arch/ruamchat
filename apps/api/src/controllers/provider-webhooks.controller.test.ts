import { BadRequestException } from "@nestjs/common";
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
    expect(events).toHaveLength(1);
    expect(Object.keys(event).sort()).toEqual([
      "channel",
      "eventType",
      "externalCalls",
      "id",
      "mode",
      "payloadDigest",
      "payloadFieldCount",
      "payloadSummary",
      "provider",
      "receivedAt",
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
