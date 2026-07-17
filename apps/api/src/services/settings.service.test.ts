import "reflect-metadata";
import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NotFoundException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import { SettingsController } from "../controllers/settings.controller.js";
import { CryptoService } from "./crypto.service.js";
import { PrismaService } from "./prisma.service.js";
import { SettingsService } from "./settings.service.js";

const tenantId = "00000000-0000-4000-8000-000000000001";
const otherTenantId = "00000000-0000-4000-8000-000000009999";

describe("SettingsService tenant-scoped API surfaces", () => {
  it("returns tenant-scoped safe channel settings without raw token or secret fields", async () => {
    await withSettingsRuntime(async ({ service }) => {
      const channels = await service.listChannels(tenantId);
      const channel = await service.getChannel(tenantId, "channel-line");

      expect(channels.map((item) => item.id)).toEqual(["channel-line", "channel-web"]);
      expect(channel).toMatchObject({
        id: "channel-line",
        platform: "line",
        accountName: "LINE Main",
        hasAccessToken: true,
        tokenMasked: "configured:redacted",
        secretConfigured: true,
        secretMasked: "configured:redacted",
        lastInboundAt: "2026-05-21T04:05:00.000Z"
      });
      const serialized = JSON.stringify(channel);
      expect(serialized).not.toContain("raw-line-token");
      expect(serialized).not.toContain("mock-line-secret");
      expect(serialized).not.toContain("accessTokenCiphertext");
      expect(serialized).not.toContain("webhookSecret");
    });
  });

  it("does not return another tenant channel and keeps updates scoped", async () => {
    await withSettingsRuntime(async ({ service, prisma }) => {
      await expect(service.getChannel(tenantId, "channel-other")).rejects.toBeInstanceOf(NotFoundException);
      const updated = await service.updateChannel(tenantId, "channel-web", { accountName: "Updated Website", status: "paused" });

      expect(updated).toMatchObject({ id: "channel-web", accountName: "Updated Website", status: "paused" });
      expect(prisma.channelAccount.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: "channel-web" },
        data: { displayName: "Updated Website", status: "paused" }
      }));
    });
  });

  it("encrypts access token and stores webhook secret without returning raw values", async () => {
    await withSettingsRuntime(async ({ service, prisma, crypto }) => {
      const updated = await service.updateChannel(tenantId, "channel-web", {
        accessToken: "  raw-secret-token  ",
        webhookSecret: "  hook-secret  "
      });

      expect(crypto.encrypt).toHaveBeenCalledWith("raw-secret-token");
      expect(prisma.channelAccount.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: "channel-web" },
        data: {
          displayName: undefined,
          status: undefined,
          accessTokenCiphertext: "enc(raw-secret-token)",
          webhookSecret: "hook-secret"
        }
      }));
      expect(updated).toMatchObject({ id: "channel-web", hasAccessToken: true, secretConfigured: true });
      const serialized = JSON.stringify(updated);
      expect(serialized).not.toContain("raw-secret-token");
      expect(serialized).not.toContain("hook-secret");
    });
  });

  it("does not touch token or secret fields when they are not supplied", async () => {
    await withSettingsRuntime(async ({ service, prisma, crypto }) => {
      await service.updateChannel(tenantId, "channel-web", { accountName: "Renamed" });

      expect(crypto.encrypt).not.toHaveBeenCalled();
      const call = prisma.channelAccount.update.mock.calls[0][0];
      expect(call.data).not.toHaveProperty("accessTokenCiphertext");
      expect(call.data).not.toHaveProperty("webhookSecret");
    });
  });

  it("returns and updates tenant-scoped team members only", async () => {
    await withSettingsRuntime(async ({ service }) => {
      const members = await service.listTeam(tenantId);
      const member = await service.getTeamMember(tenantId, "agent-may");
      const updated = await service.updateTeamMember(tenantId, "agent-may", { name: "May Updated", role: "supervisor" });

      expect(members.map((item) => item.id)).toEqual(["agent-may", "agent-ton"]);
      expect(member).toMatchObject({
        id: "agent-may",
        email: "may@example.local",
        role: "agent",
        maxConcurrentChats: 6
      });
      expect(updated).toMatchObject({
        id: "agent-may",
        displayName: "May Updated",
        role: "supervisor",
        skills: ["supervision", "handoff", "sla"]
      });
      await expect(service.getTeamMember(tenantId, "agent-other")).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  it("returns and updates tenant-scoped SLA policies only", async () => {
    await withSettingsRuntime(async ({ service }) => {
      const policies = await service.listSlaPolicies(tenantId);
      const policy = await service.getSlaPolicy(tenantId, "sla-urgent");
      const updated = await service.updateSlaPolicy(tenantId, "sla-urgent", { firstResponseMinutes: 7 });

      expect(policies.map((item) => item.id)).toEqual(["sla-urgent", "sla-normal"]);
      expect(policy).toMatchObject({
        id: "sla-urgent",
        priorityScope: "urgent",
        firstResponseMinutes: 5,
        resolutionMinutes: 120
      });
      expect(updated.firstResponseMinutes).toBe(7);
      await expect(service.getSlaPolicy(tenantId, "sla-other")).rejects.toBeInstanceOf(NotFoundException);
      const serialized = JSON.stringify(updated);
      expect(serialized).not.toContain("token");
      expect(serialized).not.toContain("secret");
    });
  });

  it("returns and updates tenant-scoped canned replies only without raw secret fields", async () => {
    await withSettingsRuntime(async ({ service }) => {
      const replies = await service.listCannedReplies(tenantId);
      const reply = await service.getCannedReply(tenantId, "reply-hello");
      const updated = await service.updateCannedReply(tenantId, "reply-hello", { bodyTemplate: "Updated hello" });

      expect(replies.map((item) => item.id)).toEqual(["reply-hello", "reply-price"]);
      expect(reply).toMatchObject({
        id: "reply-hello",
        shortcut: "/hello",
        bodyTemplate: "Persisted hello",
        status: "active"
      });
      expect(updated.bodyTemplate).toBe("Updated hello");
      await expect(service.getCannedReply(tenantId, "reply-other")).rejects.toBeInstanceOf(NotFoundException);
      const serialized = JSON.stringify(updated);
      expect(serialized).not.toContain("raw-token");
      expect(serialized).not.toContain("secret");
      expect(serialized).not.toContain("accessToken");
    });
  });

  it("resolves settings controller through explicit Nest DI and makes no external calls", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    try {
      await withSettingsRuntime(async ({ controller }) => {
        const [channels, channel, team, member] = await Promise.all([
          controller.listChannels(tenantId),
          controller.getChannel("channel-web", tenantId),
          controller.listTeam(tenantId),
          controller.getTeamMember("agent-may", tenantId),
          controller.listSlaPolicies(tenantId),
          controller.getSlaPolicy("sla-urgent", tenantId),
          controller.listCannedReplies(tenantId),
          controller.getCannedReply("reply-hello", tenantId)
        ]);

        expect(channels).toHaveLength(2);
        expect(channel.id).toBe("channel-web");
        expect(team).toHaveLength(2);
        expect(member.id).toBe("agent-may");
        expect(fetchSpy).not.toHaveBeenCalled();
      });
    } finally {
      fetchSpy.mockRestore();
    }
  });
});

async function withSettingsRuntime<T>(
  run: (context: Awaited<ReturnType<typeof buildSettingsRuntime>>) => Promise<T>
) {
  const context = await buildSettingsRuntime();
  try {
    return await run(context);
  } finally {
    await context.close();
  }
}

async function buildSettingsRuntime() {
  const { prisma } = buildPrismaFake();
  const crypto = { encrypt: vi.fn((value: string) => `enc(${value})`), decrypt: vi.fn((value: string) => value) };

  @Module({
    controllers: [SettingsController],
    providers: [
      SettingsService,
      { provide: PrismaService, useValue: prisma },
      { provide: CryptoService, useValue: crypto }
    ]
  })
  class SettingsRuntimeTestModule {}

  const app = await NestFactory.createApplicationContext(SettingsRuntimeTestModule, { logger: false });

  return {
    service: app.get(SettingsService),
    controller: app.get(SettingsController),
    prisma,
    crypto,
    close: () => app.close()
  };
}

function buildPrismaFake() {
  const channels = [
    channel("channel-line", tenantId, "line", "LINE Main", null, "raw-line-token", "mock-line-secret", "active"),
    channel("channel-web", tenantId, "webchat", "Main Website", "demo-webchat", null, null, "active"),
    channel("channel-other", otherTenantId, "line", "Other LINE", null, "other-token", "other-secret", "active")
  ];
  const messages = [
    message("msg-line-in", tenantId, "channel-line", "user", "2026-05-21T04:05:00.000Z"),
    message("msg-line-agent", tenantId, "channel-line", "agent", "2026-05-21T04:07:00.000Z"),
    message("msg-other", otherTenantId, "channel-other", "user", "2026-05-21T04:09:00.000Z")
  ];
  const memberships = [
    membership("membership-may", tenantId, "agent-may", "agent", "May", "may@example.local"),
    membership("membership-ton", tenantId, "agent-ton", "supervisor", "Ton", "ton@example.local"),
    membership("membership-other", otherTenantId, "agent-other", "agent", "Other", "other@example.local")
  ];
  const slaPolicies = [
    slaPolicy("sla-urgent", tenantId, "Urgent priority", "urgent", 5, 120),
    slaPolicy("sla-normal", tenantId, "Normal priority", "medium", 30, 1440),
    slaPolicy("sla-other", otherTenantId, "Other tenant SLA", "urgent", 1, 60)
  ];
  const cannedReplies = [
    cannedReply("reply-hello", tenantId, "Greeting", "general", "/hello", "Persisted hello"),
    cannedReply("reply-price", tenantId, "Pricing", "sales", "/price", "Persisted price"),
    cannedReply("reply-other", otherTenantId, "Other tenant", "support", "/other", "Other secret reply")
  ];

  const prisma = {
    channelAccount: {
      findMany: vi.fn(async ({ where }: { where: Record<string, any> }) =>
        channels.filter((item) => item.tenantId === where.tenantId && (!where.id || item.id === where.id))
      ),
      findFirst: vi.fn(async ({ where }: { where: Record<string, any> }) =>
        channels.find((item) => item.tenantId === where.tenantId && item.id === where.id) ?? null
      ),
      update: vi.fn(async ({ where, data }: { where: Record<string, any>; data: Record<string, any> }) => {
        const item = channels.find((channelItem) => channelItem.id === where.id);
        if (!item) throw new Error("missing channel");
        item.displayName = data.displayName ?? item.displayName;
        item.status = data.status ?? item.status;
        if (data.accessTokenCiphertext !== undefined) item.accessTokenCiphertext = data.accessTokenCiphertext;
        if (data.webhookSecret !== undefined) item.webhookSecret = data.webhookSecret;
        item.updatedAt = new Date("2026-05-21T05:00:00.000Z");
        return item;
      })
    },
    message: {
      findFirst: vi.fn(async ({ where, orderBy }: { where: Record<string, any>; orderBy: Record<string, string> }) => {
        void orderBy;
        return messages
          .filter((item) =>
            item.tenantId === where.tenantId &&
            item.channelAccountId === where.channelAccountId &&
            (!where.senderType || item.senderType === where.senderType)
          )
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0] ?? null;
      })
    },
    slaPolicy: {
      findMany: vi.fn(async ({ where }: { where: Record<string, any> }) =>
        slaPolicies.filter((item) => item.tenantId === where.tenantId)
      ),
      findFirst: vi.fn(async ({ where }: { where: Record<string, any> }) =>
        slaPolicies.find((item) => item.tenantId === where.tenantId && item.id === where.id) ?? null
      ),
      update: vi.fn(async ({ where, data }: { where: Record<string, any>; data: Record<string, any> }) => {
        const item = slaPolicies.find((policyItem) => policyItem.id === where.id);
        if (!item) throw new Error("missing SLA policy");
        item.name = data.name ?? item.name;
        item.description = data.description ?? item.description;
        item.status = data.status ?? item.status;
        item.priorityScope = data.priorityScope ?? item.priorityScope;
        item.firstResponseMinutes = data.firstResponseMinutes ?? item.firstResponseMinutes;
        item.resolutionMinutes = data.resolutionMinutes ?? item.resolutionMinutes;
        item.businessHoursMode = data.businessHoursMode ?? item.businessHoursMode;
        item.escalationRole = data.escalationRole ?? item.escalationRole;
        item.updatedAt = new Date("2026-05-21T05:00:00.000Z");
        return item;
      })
    },
    cannedReply: {
      findMany: vi.fn(async ({ where }: { where: Record<string, any> }) =>
        cannedReplies.filter((item) => item.tenantId === where.tenantId)
      ),
      findFirst: vi.fn(async ({ where }: { where: Record<string, any> }) =>
        cannedReplies.find((item) => item.tenantId === where.tenantId && item.id === where.id) ?? null
      ),
      update: vi.fn(async ({ where, data }: { where: Record<string, any>; data: Record<string, any> }) => {
        const item = cannedReplies.find((replyItem) => replyItem.id === where.id);
        if (!item) throw new Error("missing canned reply");
        item.title = data.title ?? item.title;
        item.category = data.category ?? item.category;
        item.shortcut = data.shortcut ?? item.shortcut;
        item.bodyTemplate = data.bodyTemplate ?? item.bodyTemplate;
        item.tags = data.tags ?? item.tags;
        item.platformScope = data.platformScope ?? item.platformScope;
        item.roomScope = data.roomScope ?? item.roomScope;
        item.status = data.status ?? item.status;
        item.updatedAt = new Date("2026-05-21T05:00:00.000Z");
        return item;
      })
    },
    teamMembership: {
      findMany: vi.fn(async ({ where }: { where: Record<string, any> }) =>
        memberships.filter((item) => item.tenantId === where.tenantId)
      ),
      findFirst: vi.fn(async ({ where }: { where: Record<string, any> }) =>
        memberships.find((item) => item.tenantId === where.tenantId && item.userId === where.userId) ?? null
      ),
      update: vi.fn(async ({ where, data }: { where: { tenantId_userId: { tenantId: string; userId: string } }; data: Record<string, any> }) => {
        const item = memberships.find((membershipItem) =>
          membershipItem.tenantId === where.tenantId_userId.tenantId &&
          membershipItem.userId === where.tenantId_userId.userId
        );
        if (!item) throw new Error("missing membership");
        item.role = data.role ?? item.role;
        return item;
      })
    },
    user: {
      update: vi.fn(async ({ where, data }: { where: Record<string, any>; data: Record<string, any> }) => {
        const item = memberships.find((membershipItem) => membershipItem.userId === where.id);
        if (!item) throw new Error("missing user");
        item.user.name = data.name ?? item.user.name;
        item.user.updatedAt = new Date("2026-05-21T05:00:00.000Z");
        return item.user;
      })
    }
  };

  return { prisma };
}

function channel(
  id: string,
  tenant: string,
  platform: string,
  displayName: string,
  accountKey: string | null,
  accessTokenCiphertext: string | null,
  webhookSecret: string | null,
  status: string
) {
  return {
    id,
    tenantId: tenant,
    platform,
    displayName,
    accountKey,
    accessTokenCiphertext,
    webhookSecret,
    status,
    createdAt: new Date("2026-05-21T04:00:00.000Z"),
    updatedAt: new Date("2026-05-21T04:00:00.000Z")
  };
}

function message(id: string, tenant: string, channelAccountId: string, senderType: string, createdAt: string) {
  return { id, tenantId: tenant, channelAccountId, senderType, createdAt: new Date(createdAt) };
}

function membership(id: string, tenant: string, userId: string, role: string, name: string, email: string) {
  return {
    id,
    tenantId: tenant,
    userId,
    role,
    createdAt: new Date("2026-05-21T04:00:00.000Z"),
    user: {
      id: userId,
      name,
      email,
      createdAt: new Date("2026-05-21T04:00:00.000Z"),
      updatedAt: new Date("2026-05-21T04:00:00.000Z")
    }
  };
}

function slaPolicy(id: string, tenant: string, name: string, priorityScope: string, firstResponseMinutes: number, resolutionMinutes: number) {
  return {
    id,
    tenantId: tenant,
    name,
    description: "Persisted tenant SLA",
    status: "active",
    priorityScope,
    firstResponseMinutes,
    resolutionMinutes,
    businessHoursMode: "always",
    escalationRole: "supervisor",
    createdAt: new Date("2026-05-21T04:00:00.000Z"),
    updatedAt: new Date("2026-05-21T04:00:00.000Z")
  };
}

function cannedReply(id: string, tenant: string, title: string, category: string, shortcut: string, bodyTemplate: string) {
  return {
    id,
    tenantId: tenant,
    title,
    category,
    shortcut,
    bodyTemplate,
    tags: [category],
    platformScope: [],
    roomScope: [],
    status: "active",
    createdAt: new Date("2026-05-21T04:00:00.000Z"),
    updatedAt: new Date("2026-05-21T04:00:00.000Z")
  };
}
