import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import {
  createFlowRequestSchema,
  flowEdgeSchema,
  flowNodeSchema,
  flowStatusSchema,
  flowTriggerSchema,
  flowTriggerTypeSchema,
  platformSchema,
  updateFlowRequestSchema,
  type AutomationActionResult,
  type CreateFlowRequest,
  type Flow,
  type FlowEdge,
  type FlowNode,
  type FlowRun,
  type FlowRunStep,
  type FlowStatus,
  type FlowTestRunRequest,
  type Platform,
  type UpdateFlowRequest
} from "@ai-omni/shared";
import { Prisma } from "@prisma/client";
import { AuditService } from "./audit.service.js";
import { OutboundConsentDecision, OutboundConsentService, consentSnapshot } from "./outbound-consent.service.js";
import { PrismaService } from "./prisma.service.js";

const allPlatforms: Platform[] = ["webchat", "telegram", "line", "facebook", "instagram"];
const outboundActionTypes = new Set(["send_message", "trigger_broadcast_mock"]);
const dryRunOnlyActionTypes = new Set(["ai_reply", "add_to_broadcast_segment"]);

type StoredFlowJson = {
  trigger: unknown;
  conditions: unknown;
  actions: unknown;
};

type FlowRecord = {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  status: string;
  triggerType: string;
  triggerConfigJson: Prisma.JsonValue;
  conditionsJson: Prisma.JsonValue;
  actionsJson: Prisma.JsonValue;
  createdByUserId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type FlowRunRecord = {
  id: string;
  tenantId: string;
  flowId: string;
  conversationId: string | null;
  status: string;
  inputJson: Prisma.JsonValue;
  outputJson: Prisma.JsonValue;
  errorMessage: string | null;
  createdAt: Date;
};

@Injectable()
export class FlowService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(AuditService) private readonly audit: AuditService,
    @Inject(OutboundConsentService) private readonly outboundConsent: OutboundConsentService
  ) {}

  async listFlows(tenantId: string) {
    const flows = await this.prisma.flow.findMany({
      where: { tenantId },
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }]
    });
    return flows.map(mapFlow);
  }

  async createFlow(tenantId: string, actorUserId: string | undefined, request: CreateFlowRequest) {
    const normalized = normalizeFlowInput(request);
    const flow = await this.prisma.flow.create({
      data: {
        tenantId,
        name: normalized.name,
        description: normalized.description,
        status: normalized.status,
        triggerType: normalized.triggerType,
        triggerConfigJson: toInputJson(normalized.trigger),
        conditionsJson: toInputJson({
          platformScope: normalized.platformScope,
          roomIds: normalized.roomIds,
          nodes: normalized.nodes.filter((node) => node.type === "condition"),
          edges: normalized.edges
        }),
        actionsJson: toInputJson({
          nodes: normalized.nodes.filter((node) => node.type !== "condition" && node.type !== "trigger"),
          edges: normalized.edges
        }),
        createdByUserId: actorUserId ?? null
      }
    });
    return mapFlow(flow);
  }

  async getFlow(tenantId: string, flowId: string) {
    return mapFlow(await this.ensureFlow(tenantId, flowId));
  }

  async updateFlow(tenantId: string, flowId: string, request: UpdateFlowRequest) {
    const existing = mapFlow(await this.ensureFlow(tenantId, flowId));
    const normalized = normalizeFlowInput({
      name: request.name ?? existing.name,
      description: request.description ?? existing.description,
      status: request.status ?? existing.status,
      triggerType: request.triggerType ?? request.trigger?.type ?? existing.triggerType,
      trigger: request.trigger ?? existing.trigger,
      platformScope: request.platformScope ?? existing.platformScope,
      roomIds: request.roomIds ?? existing.roomIds,
      nodes: request.nodes ?? existing.nodes,
      edges: request.edges ?? existing.edges,
      triggerConfigJson: request.triggerConfigJson,
      conditionsJson: request.conditionsJson,
      actionsJson: request.actionsJson
    });

    const flow = await this.prisma.flow.update({
      where: { id: flowId },
      data: {
        name: normalized.name,
        description: normalized.description,
        status: normalized.status,
        triggerType: normalized.triggerType,
        triggerConfigJson: toInputJson(normalized.trigger),
        conditionsJson: toInputJson({
          platformScope: normalized.platformScope,
          roomIds: normalized.roomIds,
          nodes: normalized.nodes.filter((node) => node.type === "condition"),
          edges: normalized.edges
        }),
        actionsJson: toInputJson({
          nodes: normalized.nodes.filter((node) => node.type !== "condition" && node.type !== "trigger"),
          edges: normalized.edges
        })
      }
    });
    return mapFlow(flow);
  }

  async archiveFlow(tenantId: string, flowId: string) {
    await this.ensureFlow(tenantId, flowId);
    const flow = await this.prisma.flow.update({
      where: { id: flowId },
      data: { status: "archived" }
    });
    return mapFlow(flow);
  }

  async duplicateFlow(tenantId: string, flowId: string, actorUserId: string | undefined) {
    const source = mapFlow(await this.ensureFlow(tenantId, flowId));
    const copy = await this.prisma.flow.create({
      data: {
        tenantId,
        name: `${source.name} Copy`,
        description: source.description,
        status: "draft",
        triggerType: source.triggerType,
        triggerConfigJson: toInputJson({
          ...source.trigger,
          id: `${source.trigger.id}-copy-${Date.now()}`
        }),
        conditionsJson: toInputJson({
          platformScope: source.platformScope,
          roomIds: source.roomIds,
          nodes: source.nodes.filter((node) => node.type === "condition").map((node) => ({ ...node, id: `${node.id}-copy` })),
          edges: []
        }),
        actionsJson: toInputJson({
          nodes: source.nodes.filter((node) => node.type !== "condition" && node.type !== "trigger").map((node) => ({ ...node, id: `${node.id}-copy` })),
          edges: []
        }),
        createdByUserId: actorUserId ?? null
      }
    });
    return mapFlow(copy);
  }

  async updateStatus(tenantId: string, flowId: string, status: FlowStatus) {
    await this.ensureFlow(tenantId, flowId);
    const flow = await this.prisma.flow.update({
      where: { id: flowId },
      data: { status }
    });
    return mapFlow(flow);
  }

  async listRuns(tenantId: string, flowId: string) {
    await this.ensureFlow(tenantId, flowId);
    const runs = await this.prisma.flowRun.findMany({
      where: { tenantId, flowId },
      orderBy: { createdAt: "desc" },
      take: 50
    });
    return runs.map(mapFlowRun);
  }

  async testRun(tenantId: string, flowId: string, request: FlowTestRunRequest) {
    const flow = mapFlow(await this.ensureFlow(tenantId, flowId));
    const requestedConversationId = request.conversationId?.trim();
    if (!requestedConversationId) throw new BadRequestException("conversationId is required");
    const conversation = await this.ensureConversation(tenantId, requestedConversationId);
    const input = {
      conversationId: conversation.id,
      contactId: request.contactId ?? conversation.contactId,
      message: sanitizeString(request.message) ?? "",
      platform: conversation.room.platform,
      roomId: conversation.roomId,
      triggerType: request.triggerType ?? flow.trigger.type,
      tag: request.tag,
      intent: request.intent,
      status: request.status,
      statusFrom: request.statusFrom,
      isFirstMessage: request.isFirstMessage,
      aiConfidence: request.aiConfidence,
      businessHours: request.businessHours ?? true
    };

    const context = {
      tenantId,
      conversationId: conversation.id,
      flowId,
      contactId: conversation.contactId,
      platform: conversation.room.platform,
      channelAccountId: conversation.room.channelAccountId,
      roomId: conversation.roomId
    };
    const consentContext = await this.outboundConsent.getConversationContext(context);
    const consentDecision = this.outboundConsent.decide(consentContext.consent, "automation");
    const result = buildDryRunResult(flow, input, context, consentDecision, new Date());
    const saved = await this.prisma.flowRun.create({
      data: {
        tenantId,
        flowId,
        conversationId: input.conversationId,
        status: result.flowRun.status,
        inputJson: toInputJson(input),
        outputJson: toInputJson({
          triggerMatched: result.triggerMatched,
          summary: result.flowRun.resultSummary,
          steps: result.flowRun.steps,
          actionResults: result.state.actionResults,
          auditLogsCreated: result.state.auditLogsCreated,
          externalCalls: result.state.externalCalls,
          skippedExternalActions: result.state.skippedExternalActions
        }),
        errorMessage: null
      }
    });
    const audit = await this.audit.record({
      tenantId,
      conversationId: conversation.id,
      action: "flow_run_dry_run",
      entityType: "flow_run",
      entityId: saved.id,
      metadata: {
        actionType: "flow_run_dry_run",
        tenantId,
        conversationId: conversation.id,
        flowId,
        runId: saved.id,
        platform: conversation.room.platform,
        channelAccountId: conversation.room.channelAccountId,
        roomId: conversation.roomId,
        customerId: conversation.contactId,
        contactId: conversation.contactId,
        consent: consentSnapshot(consentContext.consent),
        blockedReason: consentDecision.reason,
        trigger: {
          type: flow.trigger.type,
          matched: result.triggerMatched
        },
        conditions: summarizeConditions(flow),
        skippedOutboundActions: result.state.skippedExternalActions,
        actionResults: result.state.actionResults.map((item) => ({
          actionType: item.actionType,
          status: item.status,
          reason: typeof item.metadata.reason === "string" ? item.metadata.reason : item.message
        })),
        externalCalls: 0,
        timestamp: saved.createdAt.toISOString()
      }
    });
    const blockedAudit = consentDecision.blocked && consentDecision.reason
      ? await this.outboundConsent.recordBlocked({
          action: "automation.outbound_blocked",
          intent: "automation",
          entityType: "flow_run",
          entityId: saved.id,
          context: consentContext,
          reason: consentDecision.reason,
          metadata: {
            flowId,
            runId: saved.id,
            skippedOutboundActions: result.state.skippedExternalActions
          }
        })
      : null;

    return {
      ...result,
      flowRun: mapFlowRun(saved),
      state: {
        ...result.state,
        auditLogsCreated: [mapAuditLog(audit), ...(blockedAudit ? [mapAuditLog(blockedAudit)] : [])]
      }
    };
  }

  private async ensureFlow(tenantId: string, flowId: string) {
    const flow = await this.prisma.flow.findFirst({
      where: { id: flowId, tenantId }
    });
    if (!flow) throw new NotFoundException("Flow not found");
    return flow;
  }

  private async ensureConversation(tenantId: string, conversationId: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, tenantId },
      include: {
        room: true
      }
    });
    if (!conversation) throw new NotFoundException("Conversation not found");
    return conversation;
  }
}

function normalizeFlowInput(request: CreateFlowRequest | (UpdateFlowRequest & { name: string; status: FlowStatus; triggerType: string; platformScope: Platform[]; roomIds: string[]; nodes: FlowNode[]; edges: FlowEdge[] })) {
  const parsed = createFlowRequestSchema.parse({
    name: request.name,
    description: request.description ?? "",
    status: request.status ?? "draft",
    triggerType: request.triggerType,
    trigger: request.trigger,
    platformScope: request.platformScope,
    roomIds: request.roomIds,
    nodes: request.nodes,
    edges: request.edges ?? []
  });
  const trigger = flowTriggerSchema.parse(parsed.trigger ?? {
    id: `trigger-${slug(parsed.name)}`,
    type: parsed.triggerType,
    matchMode: parsed.triggerType === "keyword" ? "contains" : "exact",
    caseSensitive: false
  });
  const nodes = parsed.nodes ?? defaultNodesFor(parsed.name, parsed.triggerType);
  if (!nodes.some((node) => node.type === "trigger")) {
    throw new BadRequestException("Flow must include a trigger node");
  }
  return {
    ...parsed,
    name: parsed.name.trim(),
    description: parsed.description.trim(),
    triggerType: trigger.type,
    trigger,
    nodes,
    edges: parsed.edges.length > 0 ? parsed.edges : defaultEdges(parsed.name, nodes)
  };
}

function mapFlow(flow: FlowRecord): Flow {
  const json = readStoredFlowJson(flow);
  const trigger = flowTriggerSchema.catch(defaultTrigger(flow)).parse(json.trigger);
  const conditions = readObject(json.conditions);
  const actions = readObject(json.actions);
  const conditionNodes = parseNodes(conditions.nodes).filter((node) => node.type === "condition");
  const actionNodes = parseNodes(actions.nodes).filter((node) => node.type !== "condition" && node.type !== "trigger");
  const triggerNode = flowNodeSchema.catch({
    id: `node-${flow.id}-trigger`,
    type: "trigger",
    label: `Trigger: ${trigger.type}`,
    config: {},
    position: { x: 80, y: 80 }
  }).parse((readObject(json.trigger).node ?? undefined) as unknown);
  const nodes = [triggerNode, ...conditionNodes, ...actionNodes];
  const edges = parseEdges(actions.edges).length > 0
    ? parseEdges(actions.edges)
    : parseEdges(conditions.edges).length > 0
      ? parseEdges(conditions.edges)
      : defaultEdges(flow.name, nodes);
  const platformScope = parsePlatforms(conditions.platformScope);
  const roomIds = Array.isArray(conditions.roomIds)
    ? conditions.roomIds.filter((item): item is string => typeof item === "string" && item.length > 0)
    : [];

  return {
    id: flow.id,
    name: flow.name,
    description: flow.description,
    status: flowStatusSchema.catch("draft").parse(flow.status),
    triggerType: flowTriggerTypeSchema.catch(trigger.type).parse(flow.triggerType),
    trigger,
    platformScope,
    roomIds,
    nodes,
    edges,
    createdAt: flow.createdAt.toISOString(),
    updatedAt: flow.updatedAt.toISOString()
  };
}

function mapFlowRun(run: FlowRunRecord): FlowRun {
  const output = readObject(run.outputJson);
  const input = readObject(run.inputJson);
  return {
    id: run.id,
    flowId: run.flowId,
    conversationId: run.conversationId,
    contactId: typeof input.contactId === "string" ? input.contactId : null,
    status: run.status as FlowRun["status"],
    startedAt: run.createdAt.toISOString(),
    completedAt: run.createdAt.toISOString(),
    steps: parseRunSteps(output.steps),
    resultSummary: typeof output.summary === "string" ? output.summary : run.errorMessage ?? "Flow run recorded."
  };
}

function buildDryRunResult(
  flow: Flow,
  input: FlowTestRunRequest & { conversationId: string; contactId: string | null; businessHours: boolean },
  context: {
    tenantId: string;
    conversationId: string;
    flowId: string;
    platform: Platform;
    channelAccountId: string;
    roomId: string;
    contactId: string;
  },
  consentDecision: OutboundConsentDecision,
  at: Date
) {
  const triggerMatched = evaluateTrigger(flow, input) && flow.status !== "archived";
  const steps: FlowRunStep[] = [];
  const actionResults: AutomationActionResult[] = [];
  const skippedExternalActions: string[] = [];

  const sequence = previewSequence(flow);
  let skipActions = !triggerMatched;
  let failed = false;

  sequence.forEach((node, index) => {
    const createdAt = new Date(at.getTime() + index * 1000).toISOString();
    if (node.type === "trigger") {
      steps.push(stepFromNode(node, triggerMatched ? "completed" : "skipped", safeStepInput(input, context), { matched: triggerMatched }, undefined, createdAt));
      return;
    }
    if (skipActions && node.type !== "condition" && node.type !== "end") {
      steps.push(stepFromNode(node, "skipped", safeStepInput(input, context), { reason: "dry_run_only" }, undefined, createdAt));
      return;
    }
    if (node.type === "condition") {
      const matched = evaluateCondition(node, input);
      skipActions = !matched;
      steps.push(stepFromNode(node, "completed", safeStepInput(input, context), { matched }, undefined, createdAt));
      return;
    }

    const result = dryRunAction(node, consentDecision);
    actionResults.push(result);
    if (result.status === "outbound_skipped_mock" || result.status === "skipped_mock") skippedExternalActions.push(node.type);
    if (result.status === "failed_mock") failed = true;
    steps.push(stepFromNode(node, result.status === "failed_mock" ? "failed" : result.status === "skipped_mock" || result.status === "outbound_skipped_mock" ? "skipped" : "completed", safeStepInput(input, context), result, result.status === "failed_mock" ? result.message : undefined, createdAt));
  });

  const summary = !triggerMatched
    ? "Dry run skipped because the trigger did not match or the flow is archived."
    : failed
      ? `Dry run failed after ${steps.length} step(s).`
      : `Dry run completed with ${actionResults.filter((item) => item.status === "success_mock").length} simulated action(s) and ${skippedExternalActions.length} skipped external action(s).`;

  return {
    triggerMatched,
    flowRun: {
      id: `dry-run-${flow.id}-${at.getTime()}`,
      flowId: flow.id,
      conversationId: input.conversationId,
      contactId: input.contactId,
      status: "dry_run" as const,
      startedAt: at.toISOString(),
      completedAt: new Date(at.getTime() + Math.max(1, steps.length) * 1000).toISOString(),
      steps,
      resultSummary: summary
    },
    state: {
      actionResults,
      auditLogsCreated: [],
      externalCalls: [],
      skippedExternalActions
    }
  };
}

function evaluateTrigger(flow: Flow, input: FlowTestRunRequest) {
  if (!flow.platformScope.includes(input.platform ?? "webchat")) return false;
  if (flow.roomIds.length > 0 && !flow.roomIds.includes(input.roomId ?? "")) return false;
  const expectedType = input.triggerType ?? flow.trigger.type;
  if (flow.trigger.type !== "manual_test" && expectedType !== flow.trigger.type) return false;
  switch (flow.trigger.type) {
    case "keyword":
      return matchText(input.message ?? "", flow.trigger.keyword ?? "", flow.trigger.matchMode, flow.trigger.caseSensitive);
    case "first_message":
      return input.isFirstMessage === true;
    case "tag_added":
      return normalizeText(input.tag ?? "", true) === normalizeText(flow.trigger.tag ?? "", true);
    case "ai_intent":
      return normalizeText(input.intent ?? "", true) === normalizeText(flow.trigger.intent ?? "", true);
    case "status_changed":
      return input.status === flow.trigger.status;
    case "manual_test":
      return true;
    default:
      return false;
  }
}

function evaluateCondition(node: FlowNode, input: FlowTestRunRequest) {
  const operator = String(node.config.operator ?? "");
  const value = node.config.value;
  if (operator === "platform_equals") return input.platform === value;
  if (operator === "room_equals") return input.roomId === value;
  if (operator === "contact_has_tag") return input.tag === value;
  if (operator === "ai_confidence_gt") return (input.aiConfidence ?? 0) > Number(value);
  if (operator === "message_contains") return String(input.message ?? "").toLowerCase().includes(String(value).toLowerCase());
  if (operator === "business_hours") return input.businessHours ?? Boolean(value);
  return true;
}

function dryRunAction(node: FlowNode, consentDecision: OutboundConsentDecision): AutomationActionResult {
  if (node.config.fail === true) {
    return {
      actionType: node.type,
      status: "failed_mock",
      message: `${node.type} failed in dry-run mode by test config.`,
      metadata: { dryRun: true, externalCalls: 0, reason: "dry_run_only" }
    };
  }
  if (
    consentDecision.blocked &&
    consentDecision.reason &&
    (outboundActionTypes.has(node.type) || node.type === "ai_reply" || node.type === "add_to_broadcast_segment")
  ) {
    return {
      actionType: node.type,
      status: "skipped_mock",
      message: `${node.type} suppressed by customer consent; no external outbound call was made.`,
      metadata: {
        dryRun: true,
        externalCalls: 0,
        reason: consentDecision.reason,
        blocked: true
      }
    };
  }
  if (outboundActionTypes.has(node.type)) {
    return {
      actionType: node.type,
      status: "outbound_skipped_mock",
      message: `${node.type} skipped in dry-run mode; no external outbound call was made.`,
      metadata: { dryRun: true, externalCalls: 0, reason: "outbound_skipped_mock" }
    };
  }
  if (dryRunOnlyActionTypes.has(node.type)) {
    return {
      actionType: node.type,
      status: "skipped_mock",
      message: `${node.type} skipped in dry-run mode; no external or AI call was made.`,
      metadata: { dryRun: true, externalCalls: 0, reason: "dry_run_only" }
    };
  }
  if (node.type === "delay") {
    return {
      actionType: node.type,
      status: "skipped_mock",
      message: "Delay skipped in dry-run mode.",
      metadata: { dryRun: true, externalCalls: 0, reason: "dry_run_only" }
    };
  }
  return {
    actionType: node.type,
    status: "success_mock",
    message: `${node.type} simulated in dry-run mode.`,
    metadata: { dryRun: true, externalCalls: 0, reason: "dry_run_only" }
  };
}

function safeStepInput(
  input: FlowTestRunRequest & { conversationId: string; contactId: string | null; businessHours: boolean },
  context: {
    tenantId: string;
    conversationId: string;
    flowId: string;
    platform: Platform;
    channelAccountId: string;
    roomId: string;
  }
) {
  return {
    tenantId: context.tenantId,
    conversationId: context.conversationId,
    flowId: context.flowId,
    contactId: input.contactId,
    platform: context.platform,
    channelAccountId: context.channelAccountId,
    roomId: context.roomId,
    triggerType: input.triggerType,
    tag: sanitizeString(input.tag),
    intent: sanitizeString(input.intent),
    status: input.status,
    statusFrom: input.statusFrom,
    isFirstMessage: input.isFirstMessage,
    aiConfidence: input.aiConfidence,
    businessHours: input.businessHours,
    externalCalls: 0
  };
}

function summarizeConditions(flow: Flow) {
  return flow.nodes
    .filter((node) => node.type === "condition")
    .map((node) => ({
      nodeId: node.id,
      operator: typeof node.config.operator === "string" ? node.config.operator : "condition"
    }));
}

function mapAuditLog(log: {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Prisma.JsonValue | null;
  createdAt: Date;
}) {
  return {
    id: log.id,
    actorId: "automation-flow",
    action: log.action,
    targetType: log.entityType,
    targetId: log.entityId ?? "",
    metadata: readObject(log.metadata),
    createdAt: log.createdAt.toISOString()
  };
}

function sanitizeString(value: string | undefined | null) {
  if (typeof value !== "string") return undefined;
  return looksRawSecret(value) ? "[redacted]" : value;
}

function looksRawSecret(value: string) {
  return /sk-[a-z0-9_-]{8,}|Bearer\s+[a-z0-9._-]+|raw-|mock-line-secret|xox[baprs]-|EA[A-Za-z0-9]{20,}/i.test(value);
}

function readStoredFlowJson(flow: FlowRecord): StoredFlowJson {
  return {
    trigger: flow.triggerConfigJson,
    conditions: flow.conditionsJson,
    actions: flow.actionsJson
  };
}

function defaultTrigger(flow: FlowRecord) {
  return {
    id: `trigger-${flow.id}`,
    type: flowTriggerTypeSchema.catch("keyword").parse(flow.triggerType),
    matchMode: "contains" as const,
    caseSensitive: false
  };
}

function parseNodes(value: unknown) {
  return Array.isArray(value)
    ? value.map((item) => flowNodeSchema.safeParse(item)).filter((item) => item.success).map((item) => item.data)
    : [];
}

function parseEdges(value: unknown) {
  return Array.isArray(value)
    ? value.map((item) => flowEdgeSchema.safeParse(item)).filter((item) => item.success).map((item) => item.data)
    : [];
}

function parseRunSteps(value: unknown) {
  return Array.isArray(value)
    ? value.map((item) => flowRunStep(item)).filter((item): item is FlowRunStep => item !== null)
    : [];
}

function flowRunStep(value: unknown): FlowRunStep | null {
  const item = readObject(value);
  const nodeId = typeof item.nodeId === "string" ? item.nodeId : "";
  const nodeType = flowNodeSchema.shape.type.safeParse(item.nodeType);
  const status = flowNodeStepStatus(item.status);
  const createdAt = typeof item.createdAt === "string" ? item.createdAt : new Date().toISOString();
  if (!nodeId || !nodeType.success || !status) return null;
  return {
    id: typeof item.id === "string" ? item.id : `step-${nodeId}`,
    nodeId,
    nodeType: nodeType.data,
    status,
    input: item.input,
    output: item.output,
    error: typeof item.error === "string" ? item.error : undefined,
    createdAt
  };
}

function flowNodeStepStatus(value: unknown): FlowRunStep["status"] | null {
  if (value === "pending" || value === "running" || value === "completed" || value === "failed" || value === "skipped") return value;
  return null;
}

function parsePlatforms(value: unknown) {
  if (!Array.isArray(value)) return allPlatforms;
  const platforms = value.map((item) => platformSchema.safeParse(item)).filter((item) => item.success).map((item) => item.data);
  return platforms.length > 0 ? platforms : allPlatforms;
}

function readObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function defaultNodesFor(name: string, triggerType: string): FlowNode[] {
  const id = slug(name);
  return [
    { id: `node-${id}-trigger`, type: "trigger", label: `Trigger: ${triggerType}`, config: {}, position: { x: 80, y: 80 } },
    { id: `node-${id}-note`, type: "note", label: "Dry-run note", config: { note: "Automation dry-run note" }, position: { x: 300, y: 80 } },
    { id: `node-${id}-end`, type: "end", label: "End flow", config: {}, position: { x: 520, y: 80 } }
  ];
}

function defaultEdges(name: string, nodes: FlowNode[]): FlowEdge[] {
  const id = slug(name);
  return nodes.slice(0, -1).map((node, index) => ({
    id: `edge-${id}-${index}`,
    sourceNodeId: node.id,
    targetNodeId: nodes[index + 1]?.id ?? node.id,
    conditionLabel: node.type === "condition" ? "true" : undefined
  }));
}

function previewSequence(flow: Flow) {
  if (flow.edges.length === 0) return flow.nodes;
  const byId = new Map(flow.nodes.map((node) => [node.id, node]));
  const outgoing = new Map(flow.edges.map((edge) => [edge.sourceNodeId, edge.targetNodeId]));
  const start = flow.nodes.find((node) => node.type === "trigger") ?? flow.nodes[0];
  const sequence: FlowNode[] = [];
  const seen = new Set<string>();
  let current: FlowNode | undefined = start;
  while (current && !seen.has(current.id)) {
    sequence.push(current);
    seen.add(current.id);
    current = byId.get(outgoing.get(current.id) ?? "");
  }
  return sequence.length > 0 ? sequence : flow.nodes;
}

function stepFromNode(node: FlowNode, status: FlowRunStep["status"], input: unknown, output: unknown, error: string | undefined, createdAt: string): FlowRunStep {
  return {
    id: `step-${node.id}-${createdAt.replace(/\D/g, "")}`,
    nodeId: node.id,
    nodeType: node.type,
    status,
    input,
    output,
    error,
    createdAt
  };
}

function matchText(value: string, pattern: string, mode: string, caseSensitive: boolean) {
  const text = normalizeText(value, caseSensitive);
  const expected = normalizeText(pattern, caseSensitive);
  if (!expected) return false;
  if (mode === "exact") return text === expected;
  if (mode === "starts_with") return text.startsWith(expected);
  if (mode === "regex") {
    try {
      return new RegExp(pattern, caseSensitive ? "" : "i").test(value);
    } catch {
      return false;
    }
  }
  return text.includes(expected);
}

function normalizeText(value: string, caseSensitive: boolean) {
  return caseSensitive ? value.trim() : value.trim().toLowerCase();
}

function toInputJson(value: unknown) {
  if (value === null) return Prisma.JsonNull;
  return value as Prisma.InputJsonValue;
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9ก-๙]+/gi, "-").replace(/^-|-$/g, "") || "flow";
}
