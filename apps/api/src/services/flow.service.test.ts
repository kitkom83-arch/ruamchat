import "reflect-metadata";
import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FlowsController } from "../controllers/flows.controller.js";
import { AuditService } from "./audit.service.js";
import { FlowService } from "./flow.service.js";
import { OutboundConsentService } from "./outbound-consent.service.js";
import { PrismaService } from "./prisma.service.js";

const tenantId = "00000000-0000-4000-8000-000000000001";
const otherTenantId = "00000000-0000-4000-8000-000000009999";
const userId = "00000000-0000-4000-8000-000000000011";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("FlowService persistence APIs", () => {
  it("lists tenant-scoped flows and returns readable 404s", async () => {
    await withFlowRuntime(async ({ controller }) => {
      const flows = await controller.listFlows(tenantId);

      expect(flows.map((flow) => flow.id)).toEqual(["flow-active", "flow-paused"]);
      await expect(controller.getFlow("flow-other", tenantId)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  it("creates, updates, archives, duplicates, and changes flow status", async () => {
    await withFlowRuntime(async ({ controller }) => {
      const created = await controller.createFlow(createFlowPayload("Created flow"), tenantId, userId);
      const updated = await controller.updateFlow(created.id, { name: "Updated flow", description: "Changed" }, tenantId);
      const paused = await controller.updateStatus(created.id, { status: "paused" }, tenantId);
      const duplicated = await controller.duplicateFlow(created.id, tenantId, userId);
      const archived = await controller.deleteFlow(created.id, tenantId);

      expect(created.status).toBe("draft");
      expect(updated).toMatchObject({ id: created.id, name: "Updated flow", description: "Changed" });
      expect(paused.status).toBe("paused");
      expect(duplicated.name).toBe("Updated flow Copy");
      expect(duplicated.status).toBe("draft");
      expect(archived.status).toBe("archived");
    });
  });

  it("records dry-run test results without external calls and lists run history", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    await withFlowRuntime(async ({ controller, prisma }) => {
      const result = await controller.testRun("flow-active", {
        conversationId: "conv-web",
        contactId: "contact-web",
        message: "ขอราคาแพ็กเกจ",
        platform: "webchat",
        roomId: "room-webchat",
        triggerType: "keyword",
        businessHours: true
      }, tenantId);
      const runs = await controller.listRuns("flow-active", tenantId);

      expect(result.flowRun.status).toBe("dry_run");
      expect(result.state.externalCalls).toEqual([]);
      expect(result.state.actionResults).toContainEqual(expect.objectContaining({
        actionType: "send_message",
        status: "outbound_skipped_mock"
      }));
      expect(result.state.actionResults).toContainEqual(expect.objectContaining({
        actionType: "add_tag",
        status: "success_mock"
      }));
      expect(result.state.auditLogsCreated[0]).toEqual(expect.objectContaining({
        action: "flow_run_dry_run"
      }));
      expect(runs[0]?.id).toBe(result.flowRun.id);
      expect(prisma.flowRun.create).toHaveBeenCalled();
      expect(prisma.auditLog.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          tenantId,
          conversationId: "conv-web",
          action: "flow_run_dry_run",
          entityType: "flow_run"
        })
      }));
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });

  it("suppresses automation outbound-like actions when do-not-contact is enabled", async () => {
    await withFlowRuntime(async ({ controller, outboundConsent, prisma }) => {
      outboundConsent.setConsent({ optOut: false, doNotContact: true, suppressedReason: "do_not_contact" });

      const result = await controller.testRun("flow-active", {
        conversationId: "conv-web",
        contactId: "contact-web",
        message: "ขอราคาแพ็กเกจ",
        platform: "webchat",
        roomId: "room-webchat",
        triggerType: "keyword",
        businessHours: true
      }, tenantId);

      expect(result.state.externalCalls).toEqual([]);
      expect(result.state.actionResults).toContainEqual(expect.objectContaining({
        actionType: "send_message",
        status: "skipped_mock",
        metadata: expect.objectContaining({
          blocked: true,
          reason: "do_not_contact",
          externalCalls: 0
        })
      }));
      expect(result.state.auditLogsCreated.some((log) => log.action === "automation.outbound_blocked")).toBe(true);
      expect(prisma.auditLog.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          action: "flow_run_dry_run",
          metadata: expect.objectContaining({
            contactId: "contact-web",
            platform: "webchat",
            channelAccountId: "channel-web",
            roomId: "room-webchat",
            blockedReason: "do_not_contact",
            externalCalls: 0
          })
        })
      }));
    });
  });

  it("keeps non-matching trigger in dry-run mode", async () => {
    await withFlowRuntime(async ({ controller }) => {
      const result = await controller.testRun("flow-active", {
        conversationId: "conv-web",
        contactId: "contact-web",
        message: "hello",
        platform: "webchat",
        roomId: "room-webchat",
        triggerType: "keyword"
      }, tenantId);

      expect(result.triggerMatched).toBe(false);
      expect(result.flowRun.status).toBe("dry_run");
      expect(result.flowRun.resultSummary).toContain("Dry run skipped");
    });
  });

  it("requires a tenant-scoped conversation and preserves platform/account/room in audit metadata", async () => {
    await withFlowRuntime(async ({ controller, prisma }) => {
      await expect(controller.testRun("flow-active", {
        message: "ขอราคาแพ็กเกจ",
        platform: "webchat",
        roomId: "room-webchat"
      }, tenantId)).rejects.toBeInstanceOf(BadRequestException);

      await expect(controller.testRun("flow-active", {
        conversationId: "conv-other",
        message: "ขอราคาแพ็กเกจ",
        platform: "webchat",
        roomId: "room-webchat",
        triggerType: "keyword"
      }, tenantId)).rejects.toBeInstanceOf(NotFoundException);

      const result = await controller.testRun("flow-active", {
        conversationId: "conv-web",
        message: "ขอราคาแพ็กเกจ",
        platform: "line",
        roomId: "wrong-room",
        triggerType: "keyword"
      }, tenantId);
      const audit = prisma.auditLog.create.mock.calls.at(-1)?.[0]?.data;
      const metadata = audit?.metadataJson ?? audit?.metadata;

      expect(result.flowRun.conversationId).toBe("conv-web");
      expect(metadata).toEqual(expect.objectContaining({
        tenantId,
        conversationId: "conv-web",
        flowId: "flow-active",
        platform: "webchat",
        channelAccountId: "channel-web",
        roomId: "room-webchat",
        externalCalls: 0
      }));
      expect(metadata.skippedOutboundActions).toContain("send_message");
      expect(JSON.stringify(result)).not.toMatch(/accessToken|webhookSecret|botToken|apiKey|sk-[a-z0-9_-]{8,}|Bearer\s+/i);
      expect(result.state.externalCalls).toEqual([]);
    });
  });

  it("does not expose or mutate another tenant's flows", async () => {
    await withFlowRuntime(async ({ controller }) => {
      const otherTenantFlows = await controller.listFlows(otherTenantId);
      const defaultTenantFlows = await controller.listFlows(tenantId);

      expect(otherTenantFlows.map((flow) => flow.id)).toEqual(["flow-other"]);
      expect(defaultTenantFlows.map((flow) => flow.id)).not.toContain("flow-other");
      await expect(controller.updateFlow("flow-other", { name: "Cross tenant" }, tenantId)).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});

async function withFlowRuntime<T>(
  run: (context: Awaited<ReturnType<typeof buildFlowRuntime>>) => Promise<T>
) {
  const context = await buildFlowRuntime();
  try {
    return await run(context);
  } finally {
    await context.close();
  }
}

async function buildFlowRuntime() {
  const prisma = buildPrismaFake();
  const outboundConsent = buildOutboundConsentFake(prisma);

  @Module({
    controllers: [FlowsController],
    providers: [
      AuditService,
      FlowService,
      { provide: OutboundConsentService, useValue: outboundConsent },
      { provide: PrismaService, useValue: prisma }
    ]
  })
  class FlowRuntimeTestModule {}

  const app = await NestFactory.createApplicationContext(FlowRuntimeTestModule, { logger: false });
  return {
    controller: app.get(FlowsController),
    service: app.get(FlowService),
    outboundConsent,
    prisma,
    close: () => app.close()
  };
}

function buildOutboundConsentFake(prisma: ReturnType<typeof buildPrismaFake>) {
  let consent = { optOut: false, doNotContact: false, suppressedReason: undefined as string | undefined };
  return {
    setConsent: (next: typeof consent) => {
      consent = next;
    },
    getConversationContext: vi.fn(async (input: Record<string, any>) => ({
      tenantId: input.tenantId,
      contactId: input.contactId,
      customerId: input.contactId,
      conversationId: input.conversationId,
      platform: input.platform,
      channelAccountId: input.channelAccountId,
      roomId: input.roomId,
      consent
    })),
    decide: vi.fn((value: typeof consent, intent: "support" | "marketing" | "automation") => {
      if (value.doNotContact) return { blocked: true, reason: "do_not_contact" };
      if ((intent === "marketing" || intent === "automation") && value.optOut) return { blocked: true, reason: "marketing_opt_out" };
      return { blocked: false, reason: null };
    }),
    recordBlocked: vi.fn(async (input: Record<string, any>) => prisma.auditLog.create({
      data: {
        tenantId: input.context.tenantId,
        conversationId: input.context.conversationId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        metadata: {
          blocked: true,
          blockedReason: input.reason,
          tenantId: input.context.tenantId,
          contactId: input.context.contactId,
          customerId: input.context.customerId,
          conversationId: input.context.conversationId,
          platform: input.context.platform,
          channelAccountId: input.context.channelAccountId,
          roomId: input.context.roomId,
          externalCalls: 0,
          ...(input.metadata ?? {})
        }
      }
    }))
  };
}

function buildPrismaFake() {
  const flows = [
    flow("flow-active", tenantId, "Active pricing flow", "active"),
    flow("flow-paused", tenantId, "Paused handoff flow", "paused", "tag_added"),
    flow("flow-other", otherTenantId, "Other tenant flow", "active")
  ];
  const runs = [
    flowRun("run-seed", tenantId, "flow-active", "dry_run")
  ];
  const conversations = [
    conversation("conv-web", tenantId, "room-webchat", "webchat", "channel-web", "contact-web"),
    conversation("conv-other", otherTenantId, "room-other", "telegram", "channel-other", "contact-other")
  ];
  const auditLogs: any[] = [];

  return {
    auditLog: {
      create: vi.fn(async ({ data }: { data: Record<string, any> }) => {
        const saved = {
          id: `audit-${auditLogs.length + 1}`,
          tenantId: data.tenantId,
          conversationId: data.conversationId ?? null,
          actorUserId: data.actorUserId ?? null,
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId ?? null,
          beforeJson: data.beforeJson ?? null,
          afterJson: data.afterJson ?? null,
          metadata: data.metadata ?? null,
          metadataJson: data.metadataJson ?? data.metadata ?? null,
          createdAt: new Date("2026-05-21T05:11:00.000Z")
        };
        auditLogs.unshift(saved);
        return saved;
      })
    },
    conversation: {
      findFirst: vi.fn(async ({ where }: { where: Record<string, any> }) =>
        conversations.find((item) => item.id === where.id && item.tenantId === where.tenantId) ?? null
      )
    },
    flow: {
      findMany: vi.fn(async ({ where }: { where: Record<string, any> }) =>
        flows.filter((item) => item.tenantId === where.tenantId)
      ),
      findFirst: vi.fn(async ({ where }: { where: Record<string, any> }) =>
        flows.find((item) => item.id === where.id && item.tenantId === where.tenantId) ?? null
      ),
      create: vi.fn(async ({ data }: { data: Record<string, any> }) => {
        const saved = {
          id: data.id ?? `flow-created-${flows.length + 1}`,
          tenantId: data.tenantId,
          name: data.name,
          description: data.description ?? "",
          status: data.status,
          triggerType: data.triggerType,
          triggerConfigJson: data.triggerConfigJson,
          conditionsJson: data.conditionsJson,
          actionsJson: data.actionsJson,
          createdByUserId: data.createdByUserId ?? null,
          createdAt: new Date("2026-05-21T05:00:00.000Z"),
          updatedAt: new Date("2026-05-21T05:00:00.000Z")
        };
        flows.unshift(saved);
        return saved;
      }),
      update: vi.fn(async ({ where, data }: { where: Record<string, any>; data: Record<string, any> }) => {
        const index = flows.findIndex((item) => item.id === where.id);
        const saved = {
          ...flows[index],
          ...stripUndefined(data),
          updatedAt: new Date("2026-05-21T05:05:00.000Z")
        };
        flows[index] = saved;
        return saved;
      })
    },
    flowRun: {
      findMany: vi.fn(async ({ where }: { where: Record<string, any> }) =>
        runs.filter((item) => item.tenantId === where.tenantId && item.flowId === where.flowId)
      ),
      create: vi.fn(async ({ data }: { data: Record<string, any> }) => {
        const saved = {
          id: `run-created-${runs.length + 1}`,
          tenantId: data.tenantId,
          flowId: data.flowId,
          conversationId: data.conversationId ?? null,
          status: data.status,
          inputJson: data.inputJson,
          outputJson: data.outputJson,
          errorMessage: data.errorMessage ?? null,
          createdAt: new Date("2026-05-21T05:10:00.000Z")
        };
        runs.unshift(saved);
        return saved;
      })
    }
  };
}

function conversation(id: string, tenant: string, roomId: string, platform: string, channelAccountId: string, contactId: string) {
  return {
    id,
    tenantId: tenant,
    roomId,
    contactId,
    room: {
      id: roomId,
      tenantId: tenant,
      platform,
      channelAccountId,
      name: roomId,
      aiMode: "suggest",
      autoReplyThreshold: 0.85,
      draftThreshold: 0.6,
      requireCitationsForAutoReply: true,
      handoffOnHighRisk: true,
      createdAt: new Date("2026-05-21T04:00:00.000Z"),
      updatedAt: new Date("2026-05-21T04:00:00.000Z")
    }
  };
}

function flow(id: string, tenant: string, name: string, status: string, triggerType = "keyword") {
  return {
    id,
    tenantId: tenant,
    name,
    description: `${name} description`,
    status,
    triggerType,
    triggerConfigJson: triggerType === "keyword"
      ? { id: `trigger-${id}`, type: "keyword", keyword: "ราคา", matchMode: "contains", caseSensitive: false }
      : { id: `trigger-${id}`, type: "tag_added", tag: "hot lead", matchMode: "exact", caseSensitive: false },
    conditionsJson: {
      platformScope: triggerType === "keyword" ? ["webchat", "telegram", "line", "facebook", "instagram"] : ["line"],
      roomIds: [],
      nodes: [{ id: `node-${id}-condition`, type: "condition", label: "Business hours", config: { operator: "business_hours", value: true }, position: { x: 300, y: 80 } }],
      edges: []
    },
    actionsJson: {
      nodes: [
        { id: `node-${id}-message`, type: "send_message", label: "Send message", config: { message: "No send in tests" }, position: { x: 520, y: 80 } },
        { id: `node-${id}-tag`, type: "add_tag", label: "Add tag", config: { tag: "pricing" }, position: { x: 740, y: 80 } },
        { id: `node-${id}-end`, type: "end", label: "End flow", config: {}, position: { x: 960, y: 80 } }
      ],
      edges: []
    },
    createdByUserId: userId,
    createdAt: new Date("2026-05-21T04:00:00.000Z"),
    updatedAt: new Date("2026-05-21T04:00:00.000Z")
  };
}

function flowRun(id: string, tenant: string, flowId: string, status: string) {
  return {
    id,
    tenantId: tenant,
    flowId,
    conversationId: "conv-web",
    status,
    inputJson: { conversationId: "conv-web", contactId: "contact-web" },
    outputJson: {
      summary: "Seed dry run",
      steps: [{
        id: "step-seed",
        nodeId: "node-seed",
        nodeType: "trigger",
        status: "completed",
        input: {},
        output: { matched: true },
        createdAt: "2026-05-21T04:00:00.000Z"
      }]
    },
    errorMessage: null,
    createdAt: new Date("2026-05-21T04:00:00.000Z")
  };
}

function createFlowPayload(name: string) {
  return {
    name,
    description: "Created in test",
    triggerType: "keyword",
    trigger: {
      id: `trigger-${name.toLowerCase().replace(/\s+/g, "-")}`,
      type: "keyword",
      keyword: "ราคา",
      matchMode: "contains",
      caseSensitive: false
    },
    platformScope: ["webchat"],
    roomIds: [],
    nodes: [
      { id: "node-created-trigger", type: "trigger", label: "Trigger", config: {}, position: { x: 80, y: 80 } },
      { id: "node-created-note", type: "note", label: "Note", config: { note: "dry" }, position: { x: 300, y: 80 } },
      { id: "node-created-end", type: "end", label: "End", config: {}, position: { x: 520, y: 80 } }
    ],
    edges: []
  } as const;
}

function stripUndefined<T extends Record<string, any>>(value: T) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined));
}
