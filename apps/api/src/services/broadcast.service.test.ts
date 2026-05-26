import "reflect-metadata";
import { Module } from "@nestjs/common";
import { NotFoundException } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BroadcastsController } from "../controllers/broadcasts.controller.js";
import { BroadcastService } from "./broadcast.service.js";
import { OutboundConsentService } from "./outbound-consent.service.js";
import { PrismaService } from "./prisma.service.js";

const tenantId = "00000000-0000-4000-8000-000000000001";
const otherTenantId = "00000000-0000-4000-8000-000000009999";
const userId = "00000000-0000-4000-8000-000000000011";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("BroadcastService persistence and safe queue APIs", () => {
  it("resolves BroadcastsController through Nest DI with an injected BroadcastService", async () => {
    await withBroadcastRuntime(async ({ controller, service }) => {
      expect((controller as unknown as { broadcasts?: BroadcastService }).broadcasts).toBe(service);

      const campaigns = await controller.listCampaigns(tenantId);
      const segments = await controller.listSegments(tenantId);

      expect(campaigns.map((campaign) => campaign.id)).toEqual(["campaign-web", "campaign-line"]);
      expect(segments.map((segment) => segment.id)).toEqual(["segment-web", "segment-line"]);
    });
  });

  it("lists, creates, updates, archives, duplicates campaigns, and returns readable 404s", async () => {
    await withBroadcastRuntime(async ({ controller }) => {
      const listed = await controller.listCampaigns(tenantId);
      const created = await controller.createCampaign(campaignPayload("Created API campaign"), tenantId, userId);
      const updated = await controller.updateCampaign(created.id, { name: "Updated API campaign", status: "paused" }, tenantId);
      const archived = await controller.deleteCampaign(created.id, tenantId);
      const duplicated = await controller.duplicateCampaign("campaign-web", tenantId, userId);

      expect(listed.map((campaign) => campaign.id)).toEqual(["campaign-web", "campaign-line"]);
      expect(created.channelPlatform).toBe("webchat");
      expect(updated).toMatchObject({ id: created.id, name: "Updated API campaign", status: "paused" });
      expect(archived.status).toBe("archived");
      expect(duplicated.name).toBe("Web campaign Copy");
      expect(duplicated.status).toBe("draft");
      await expect(controller.getCampaign("campaign-other", tenantId)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  it("lists, creates, updates, and deletes segments", async () => {
    await withBroadcastRuntime(async ({ controller }) => {
      const listed = await controller.listSegments(tenantId);
      const created = await controller.createSegment({
        name: "Created segment",
        description: "API segment",
        rules: [{ id: "rule-created", field: "leadStatus", operator: "equals", value: "qualified" }]
      }, tenantId);
      const updated = await controller.updateSegment(created.id, { description: "Updated segment", estimatedCount: 3 }, tenantId);
      const deleted = await controller.deleteSegment(created.id, tenantId);

      expect(listed.map((segment) => segment.id)).toEqual(["segment-web", "segment-line"]);
      expect(created.rules[0]?.field).toBe("leadStatus");
      expect(updated.estimatedCount).toBe(3);
      expect(deleted.id).toBe(created.id);
    });
  });

  it("previews audience from tenant-scoped contacts and platform identities only", async () => {
    await withBroadcastRuntime(async ({ controller }) => {
      const preview = await controller.audiencePreview("campaign-web", { platform: "webchat" }, tenantId);

      expect(preview.total).toBe(1);
      expect(preview.candidateCount).toBe(1);
      expect(preview.eligibleCount).toBe(1);
      expect(preview.suppressedCount).toBe(0);
      expect(preview.externalCalls).toBe(0);
      expect(preview.recipients[0]).toMatchObject({
        tenantId,
        customerId: "contact-web",
        contactId: "contact-web",
        contactIdentityId: "identity-web",
        conversationId: "conv-web",
        platform: "webchat",
        channelAccountId: accountId("webchat"),
        roomId: "room-webchat",
        externalCalls: 0
      });
      expect(preview.recipients.map((recipient) => recipient.contactId)).not.toContain("contact-other-tenant");
    });
  });

  it("suppresses do-not-contact recipients from preview and records safe compliance context", async () => {
    await withBroadcastRuntime(async ({ controller, outboundConsent, prisma }) => {
      outboundConsent.setConsent({ optOut: false, doNotContact: true, suppressedReason: "do_not_contact" });

      const preview = await controller.audiencePreview("campaign-web", { platform: "webchat" }, tenantId);

      expect(preview.total).toBe(0);
      expect(preview.candidateCount).toBe(1);
      expect(preview.eligibleCount).toBe(0);
      expect(preview.suppressedCount).toBe(1);
      expect(preview.suppressedByReason.do_not_contact).toBe(1);
      expect(preview.externalCalls).toBe(0);
      expect(preview.recipients).toEqual([]);
      expect(preview.suppressedRecipients[0]).toMatchObject({
        tenantId,
        customerId: "contact-web",
        contactId: "contact-web",
        conversationId: "conv-web",
        platform: "webchat",
        channelAccountId: accountId("webchat"),
        roomId: "room-webchat",
        reason: "do_not_contact",
        externalCalls: 0
      });
      expect(outboundConsent.recordBlocked).toHaveBeenCalledWith(expect.objectContaining({
        action: "broadcast.recipient_suppressed",
        intent: "marketing",
        reason: "do_not_contact",
        metadata: expect.objectContaining({
          campaignId: "campaign-web",
          sendType: "preview",
          suppressed: true
        })
      }));
      expect(prisma.broadcastSendLog.create).not.toHaveBeenCalled();
    });
  });

  it("suppresses opted-out and revoked consent recipients with safe reason codes", async () => {
    await withBroadcastRuntime(async ({ controller, outboundConsent }) => {
      outboundConsent.setConsent({ optedOut: true, optOut: false, doNotContact: false });
      const optedOut = await controller.dryRun("campaign-web", { platform: "webchat" }, tenantId);
      expect(optedOut.suppressedCount).toBe(1);
      expect(optedOut.suppressedRecipients[0]?.reason).toBe("marketing_opt_out");

      outboundConsent.setConsent({ optedOut: false, optOut: false, marketingConsent: false });
      const missing = await controller.dryRun("campaign-web", { platform: "webchat" }, tenantId);
      expect(missing.suppressedCount).toBe(1);
      expect(missing.suppressedRecipients[0]?.reason).toBe("consent_missing");

      outboundConsent.setConsent({ marketingConsent: null, consentStatus: "revoked" });
      const revoked = await controller.dryRun("campaign-web", { platform: "webchat" }, tenantId);
      expect(revoked.suppressedCount).toBe(1);
      expect(revoked.suppressedRecipients[0]?.reason).toBe("consent_revoked");
      expect(revoked.externalCalls).toBe(0);
    });
  });

  it("validates tenant ownership before recipient selection or suppression", async () => {
    await withBroadcastRuntime(async ({ controller, prisma, outboundConsent }) => {
      await expect(controller.audiencePreview("campaign-other", { platform: "webchat" }, tenantId)).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.contact.findMany).not.toHaveBeenCalled();
      expect(outboundConsent.getContext).not.toHaveBeenCalled();
    });
  });

  it("schedules campaigns without sending and records send-test/send-now logs as safe mock only", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    await withBroadcastRuntime(async ({ controller, prisma }) => {
      const scheduled = await controller.scheduleCampaign("campaign-web", { scheduleAt: "2026-05-23T04:00:00.000Z" }, tenantId);
      const testResult = await controller.sendTest("campaign-web", { platform: "webchat", payloadJson: { source: "test" } }, tenantId);
      const sendResult = await controller.sendNow("campaign-web", { platform: "webchat" }, tenantId);
      const logs = await controller.listSendLogs("campaign-web", tenantId);

      expect(scheduled.status).toBe("scheduled");
      expect(testResult.logs[0]?.status).toBe("sent_mock");
      expect(sendResult.externalCalls).toEqual([]);
      expect(sendResult.logs.map((log) => log.status).sort()).toEqual(["sent_mock", "skipped_mock"]);
      expect(logs.some((log) => log.status === "sent_mock")).toBe(true);
      expect(logs.some((log) => log.status === "skipped_mock")).toBe(true);
      expect(prisma.broadcastSendLog.create).toHaveBeenCalled();
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });

  it("suppresses marketing broadcast sends when persisted opt-out blocks the recipient", async () => {
    await withBroadcastRuntime(async ({ controller, outboundConsent, prisma }) => {
      outboundConsent.setConsent({ optOut: true, doNotContact: false, suppressedReason: "customer_requested" });

      const sendResult = await controller.sendNow("campaign-web", { platform: "webchat" }, tenantId);

      expect(sendResult.sentMock).toBe(0);
      expect(sendResult.skippedMock).toBe(0);
      expect(sendResult.created).toBe(0);
      expect(sendResult.candidateCount).toBe(2);
      expect(sendResult.eligibleCount).toBe(0);
      expect(sendResult.suppressedCount).toBe(2);
      expect(sendResult.suppressedByReason?.marketing_opt_out).toBe(2);
      expect(sendResult.externalCalls).toEqual([]);
      expect(sendResult.logs).toEqual([]);
      expect(sendResult.suppressedRecipients?.every((recipient) => recipient.reason === "marketing_opt_out")).toBe(true);
      expect(outboundConsent.recordBlocked).toHaveBeenCalledWith(expect.objectContaining({
        action: "broadcast.recipient_suppressed",
        intent: "marketing",
        reason: "marketing_opt_out",
        context: expect.objectContaining({
          tenantId,
          contactId: "contact-web",
          platform: "webchat",
          channelAccountId: accountId("webchat")
        })
      }));
      expect(prisma.broadcastSendLog.create).not.toHaveBeenCalled();
    });
  });

  it("does not expose another tenant's campaigns or audience", async () => {
    await withBroadcastRuntime(async ({ controller }) => {
      const otherCampaigns = await controller.listCampaigns(otherTenantId);
      const defaultCampaigns = await controller.listCampaigns(tenantId);

      expect(otherCampaigns.map((campaign) => campaign.id)).toEqual(["campaign-other"]);
      expect(defaultCampaigns.map((campaign) => campaign.id)).not.toContain("campaign-other");
      await expect(controller.updateCampaign("campaign-other", { name: "Cross tenant" }, tenantId)).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});

async function withBroadcastRuntime<T>(
  run: (context: Awaited<ReturnType<typeof buildBroadcastRuntime>>) => Promise<T>
) {
  const context = await buildBroadcastRuntime();
  try {
    return await run(context);
  } finally {
    await context.close();
  }
}

async function buildBroadcastRuntime() {
  const prisma = buildPrismaFake();
  const outboundConsent = buildOutboundConsentFake();

  @Module({
    controllers: [BroadcastsController],
    providers: [
      BroadcastService,
      { provide: OutboundConsentService, useValue: outboundConsent },
      { provide: PrismaService, useValue: prisma }
    ]
  })
  class BroadcastRuntimeTestModule {}

  const app = await NestFactory.createApplicationContext(BroadcastRuntimeTestModule, { logger: false });
  return {
    controller: app.get(BroadcastsController),
    service: app.get(BroadcastService),
    outboundConsent,
    prisma,
    close: () => app.close()
  };
}

function buildOutboundConsentFake() {
  let consent = {
    optOut: false,
    optedOut: false,
    doNotContact: false,
    marketingConsent: null as boolean | null,
    consentStatus: null as string | null,
    suppressedReason: undefined as string | undefined
  };
  return {
    setConsent: (next: Partial<typeof consent>) => {
      consent = { ...consent, ...next };
    },
    getContext: vi.fn(async (input: Record<string, any>) => ({
      tenantId: input.tenantId,
      contactId: input.contactId,
      customerId: input.contactId,
      conversationId: "conv-web",
      platform: input.platform,
      channelAccountId: input.channelAccountId,
      roomId: "room-webchat",
      consent
    })),
    decide: vi.fn((value: typeof consent, intent: "support" | "marketing" | "automation") => {
      if (value.doNotContact) return { blocked: true, reason: "do_not_contact" };
      if ((intent === "marketing" || intent === "automation") && (value.optOut || value.optedOut)) return { blocked: true, reason: "marketing_opt_out" };
      if ((intent === "marketing" || intent === "automation") && value.marketingConsent === false) return { blocked: true, reason: "consent_missing" };
      if ((intent === "marketing" || intent === "automation") && value.consentStatus === "revoked") return { blocked: true, reason: "consent_revoked" };
      return { blocked: false, reason: null };
    }),
    recordBlocked: vi.fn(async (input: Record<string, any>) => ({
      id: "audit-blocked",
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      metadata: { blockedReason: input.reason, externalCalls: 0 },
      createdAt: new Date("2026-05-21T05:10:00.000Z")
    }))
  };
}

function buildPrismaFake() {
  const campaigns = [
    campaign("campaign-web", tenantId, "Web campaign", "webchat", "segment-web"),
    campaign("campaign-line", tenantId, "LINE campaign", "line", "segment-line"),
    campaign("campaign-other", otherTenantId, "Other tenant", "webchat", "segment-other")
  ];
  const segments = [
    segment("segment-web", tenantId, "Web interested", [
      { id: "rule-web-status", field: "leadStatus", operator: "equals", value: "interested" }
    ]),
    segment("segment-line", tenantId, "LINE follow-up", [
      { id: "rule-line-platform", field: "platform", operator: "contains", value: "line" }
    ]),
    segment("segment-other", otherTenantId, "Other segment", [
      { id: "rule-other", field: "leadStatus", operator: "equals", value: "interested" }
    ])
  ];
  const logs = [
    sendLog("log-seed", tenantId, "campaign-web", "contact-web", "identity-web", "webchat", "sent_mock")
  ];
  const contacts = [
    contact("contact-web", tenantId, "Web Buyer", "interested", [identity("identity-web", "webchat", "web-user")]),
    contact("contact-telegram-only", tenantId, "Telegram Only", "interested", [identity("identity-telegram", "telegram", "tg-user")]),
    contact("contact-line", tenantId, "LINE Member", "follow_up", [identity("identity-line", "line", "line-user")]),
    contact("contact-other-tenant", otherTenantId, "Other Tenant Web", "interested", [identity("identity-other", "webchat", "other-user")])
  ];

  return {
    broadcastCampaign: {
      findMany: vi.fn(async ({ where }: { where: Record<string, any> }) =>
        campaigns.filter((item) => item.tenantId === where.tenantId)
      ),
      findFirst: vi.fn(async ({ where }: { where: Record<string, any> }) =>
        campaigns.find((item) => item.id === where.id && item.tenantId === where.tenantId) ?? null
      ),
      create: vi.fn(async ({ data }: { data: Record<string, any> }) => {
        const saved = {
          id: data.id ?? `campaign-created-${campaigns.length + 1}`,
          tenantId: data.tenantId,
          name: data.name,
          description: data.description ?? "",
          status: data.status,
          channelPlatform: data.channelPlatform,
          channelAccountId: data.channelAccountId ?? null,
          segmentId: data.segmentId ?? null,
          contentJson: data.contentJson,
          scheduleAt: data.scheduleAt ?? null,
          createdByUserId: data.createdByUserId ?? null,
          createdAt: new Date("2026-05-21T05:00:00.000Z"),
          updatedAt: new Date("2026-05-21T05:00:00.000Z")
        };
        campaigns.unshift(saved);
        return saved;
      }),
      update: vi.fn(async ({ where, data }: { where: Record<string, any>; data: Record<string, any> }) => {
        const index = campaigns.findIndex((item) => item.id === where.id);
        const saved = {
          ...campaigns[index],
          ...stripUndefined(data),
          updatedAt: new Date("2026-05-21T05:05:00.000Z")
        };
        campaigns[index] = saved;
        return saved;
      }),
      updateMany: vi.fn(async ({ where, data }: { where: Record<string, any>; data: Record<string, any> }) => {
        campaigns.forEach((item, index) => {
          if (item.tenantId === where.tenantId && item.segmentId === where.segmentId) {
            campaigns[index] = { ...item, ...data };
          }
        });
        return { count: campaigns.filter((item) => item.tenantId === where.tenantId && item.segmentId === data.segmentId).length };
      })
    },
    broadcastSegment: {
      findMany: vi.fn(async ({ where }: { where: Record<string, any> }) =>
        segments.filter((item) => item.tenantId === where.tenantId)
      ),
      findFirst: vi.fn(async ({ where }: { where: Record<string, any> }) =>
        segments.find((item) => item.id === where.id && item.tenantId === where.tenantId) ?? null
      ),
      create: vi.fn(async ({ data }: { data: Record<string, any> }) => {
        const saved = {
          id: data.id ?? `segment-created-${segments.length + 1}`,
          tenantId: data.tenantId,
          name: data.name,
          description: data.description ?? "",
          rulesJson: data.rulesJson ?? { rules: [] },
          estimatedCount: data.estimatedCount ?? 0,
          createdAt: new Date("2026-05-21T05:00:00.000Z"),
          updatedAt: new Date("2026-05-21T05:00:00.000Z")
        };
        segments.unshift(saved);
        return saved;
      }),
      update: vi.fn(async ({ where, data }: { where: Record<string, any>; data: Record<string, any> }) => {
        const index = segments.findIndex((item) => item.id === where.id);
        const saved = {
          ...segments[index],
          ...stripUndefined(data),
          updatedAt: new Date("2026-05-21T05:05:00.000Z")
        };
        segments[index] = saved;
        return saved;
      }),
      delete: vi.fn(async ({ where }: { where: Record<string, any> }) => {
        const index = segments.findIndex((item) => item.id === where.id);
        const [deleted] = segments.splice(index, 1);
        return deleted;
      })
    },
    broadcastSendLog: {
      findMany: vi.fn(async ({ where }: { where: Record<string, any> }) =>
        logs.filter((item) => item.tenantId === where.tenantId && item.campaignId === where.campaignId)
      ),
      create: vi.fn(async ({ data }: { data: Record<string, any> }) => {
        const saved = {
          id: data.id ?? `send-log-created-${logs.length + 1}`,
          tenantId: data.tenantId,
          campaignId: data.campaignId,
          contactId: data.contactId ?? null,
          contactIdentityId: data.contactIdentityId ?? null,
          platform: data.platform,
          channelAccountId: data.channelAccountId ?? null,
          status: data.status,
          reason: data.reason ?? null,
          payloadJson: data.payloadJson ?? null,
          createdAt: new Date("2026-05-21T05:10:00.000Z")
        };
        logs.unshift(saved);
        return saved;
      })
    },
    contact: {
      findMany: vi.fn(async ({ where }: { where: Record<string, any> }) =>
        contacts.filter((item) => item.tenantId === where.tenantId)
      )
    }
  };
}

function campaign(id: string, tenant: string, name: string, platform: "webchat" | "telegram" | "line" | "facebook" | "instagram", segmentId: string) {
  return {
    id,
    tenantId: tenant,
    name,
    description: `${name} description`,
    status: "draft",
    channelPlatform: platform,
    channelAccountId: accountId(platform),
    segmentId,
    contentJson: { message: "Hello {{contact.name}} from {{platform}}", safeMockOnly: true },
    scheduleAt: null,
    createdByUserId: userId,
    createdAt: new Date("2026-05-21T04:00:00.000Z"),
    updatedAt: new Date("2026-05-21T04:00:00.000Z")
  };
}

function segment(id: string, tenant: string, name: string, rules: Array<Record<string, unknown>>) {
  return {
    id,
    tenantId: tenant,
    name,
    description: `${name} description`,
    rulesJson: { rules },
    estimatedCount: 1,
    createdAt: new Date("2026-05-21T04:00:00.000Z"),
    updatedAt: new Date("2026-05-21T04:00:00.000Z")
  };
}

function sendLog(id: string, tenant: string, campaignId: string, contactId: string, identityId: string, platform: "webchat" | "telegram" | "line" | "facebook" | "instagram", status: string) {
  return {
    id,
    tenantId: tenant,
    campaignId,
    contactId,
    contactIdentityId: identityId,
    platform,
    channelAccountId: accountId(platform),
    status,
    reason: "seed safe mock only",
    payloadJson: { safeMockOnly: true },
    createdAt: new Date("2026-05-21T04:00:00.000Z")
  };
}

function contact(id: string, tenant: string, displayName: string, leadStatus: string, identities: ReturnType<typeof identity>[]) {
  return {
    id,
    tenantId: tenant,
    displayName,
    email: `${id}@example.local`,
    phone: "000",
    leadStatus,
    ownerUserId: userId,
    updatedAt: new Date("2026-05-21T04:00:00.000Z"),
    identities,
    tags: [{ tag: { name: "pricing" } }],
    tasks: [{ status: "open" }],
    conversations: [{
      id: "conv-web",
      roomId: "room-webchat",
      priority: "high",
      status: "open",
      slaStatus: "ok",
      aiState: "need_human",
      lastMessageAt: new Date("2026-05-21T04:00:00.000Z"),
      room: {
        platform: "webchat",
        channelAccountId: accountId("webchat")
      }
    }]
  };
}

function identity(id: string, platform: "webchat" | "telegram" | "line" | "facebook" | "instagram", externalUserId: string) {
  return {
    id,
    platform,
    channelAccountId: accountId(platform),
    externalUserId,
    displayName: externalUserId,
    updatedAt: new Date("2026-05-21T04:00:00.000Z"),
    channelAccount: { displayName: `${platform} account` }
  };
}

function campaignPayload(name: string) {
  return {
    name,
    description: "Created in test",
    channelPlatform: "webchat" as const,
    channelAccountId: accountId("webchat"),
    segmentId: "segment-web",
    contentJson: {
      message: "Hello {{contact.name}}",
      safeMockOnly: true
    }
  };
}

function accountId(platform: "webchat" | "telegram" | "line" | "facebook" | "instagram") {
  if (platform === "webchat") return "00000000-0000-4000-8000-000000000020";
  if (platform === "telegram") return "00000000-0000-4000-8000-000000000021";
  if (platform === "line") return "00000000-0000-4000-8000-000000000022";
  if (platform === "facebook") return "00000000-0000-4000-8000-000000000023";
  return "00000000-0000-4000-8000-000000000024";
}

function stripUndefined<T extends Record<string, any>>(value: T) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined));
}
