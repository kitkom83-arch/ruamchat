import type {
  AutomationActionResult,
  AuditLog,
  AIIntent,
  Contact,
  ConversationPriority,
  ConversationStatus,
  Flow,
  FlowNode,
  FlowNodeType,
  FlowRun,
  FlowRunStep,
  FlowStatus,
  FlowTrigger,
  FlowTriggerType,
  LeadStatus,
  DataMode,
  Platform
} from "@ai-omni/shared";
import { createKnowledgeAwareMockAiDecision, sampleKnowledgeItems } from "@ai-omni/shared";
import { getFlowRuns, getFlows } from "./api-client";
import {
  addInternalNote,
  assignConversation,
  createConversationTask,
  createDefaultAdminStore,
  currentMockAgentId,
  setConversationPriority,
  setConversationStatus,
  type AdminStore
} from "./admin-data";
import { addContactTag, mockContacts, removeContactTag, updateContactLeadStatus } from "./crm-data";
import { createChatMessage, mockConversations, platformRooms, type ChatMessage, type ConversationCard } from "./inbox-data";

export type FlowConditionOperator =
  | "platform_equals"
  | "room_equals"
  | "contact_has_tag"
  | "leadStatus_equals"
  | "ai_confidence_gt"
  | "message_contains"
  | "priority_equals"
  | "business_hours";

export type FlowTestInput = {
  conversationId: string;
  contactId: string;
  message: string;
  platform: Platform;
  roomId: string;
  triggerType?: FlowTriggerType;
  tag?: string;
  intent?: string;
  status?: ConversationStatus;
  statusFrom?: ConversationStatus;
  isFirstMessage?: boolean;
  aiConfidence?: number;
  businessHours?: boolean;
};

export type FlowStore = {
  flows: Flow[];
  runs: FlowRun[];
};

export type FlowBuilderMockData = {
  mode: "mock";
  store: FlowStore;
};

export type FlowBuilderApiData = {
  mode: "api";
  store: FlowStore;
};

export type FlowBuilderData = FlowBuilderMockData | FlowBuilderApiData;

export type FlowExecutionState = {
  conversations: ConversationCard[];
  contacts: Contact[];
  adminStore: AdminStore;
  actionResults: AutomationActionResult[];
  auditLogsCreated: AuditLog[];
  externalCalls: string[];
};

export type FlowRunTestResult = {
  triggerMatched: boolean;
  flowRun: FlowRun;
  state: FlowExecutionState;
};

export const flowStoreStorageKey = "ai-omni-flow-store-v1";
export const allFlowPlatforms: Platform[] = ["webchat", "telegram", "line", "facebook", "instagram"];

const baseTime = "2026-05-21T03:00:00.000Z";

export const sampleFlows: Flow[] = [
  createSampleFlow({
    id: "flow-pricing-lead",
    name: "Pricing lead flow",
    description: "Reply with package guidance, tag pricing, and raise priority.",
    status: "active",
    trigger: trigger("trigger-pricing", "keyword", { keyword: "ราคา", matchMode: "contains" }),
    platformScope: allFlowPlatforms,
    roomIds: [],
    nodes: [
      triggerNode("node-pricing-trigger", "Keyword: ราคา"),
      conditionNode("node-pricing-condition", "Any platform", { operator: "business_hours", value: true }),
      actionNode("node-pricing-message", "send_message", "Send package guidance", {
        message: "แพ็กเกจตัวอย่างเริ่มที่ Starter 1,990 บาทต่อเดือน และ Pro 4,990 บาทต่อเดือนครับ ทีมขายช่วยประเมิน Business plan ให้ได้ครับ"
      }),
      actionNode("node-pricing-tag", "add_tag", "Add pricing tag", { tag: "pricing" }),
      actionNode("node-pricing-priority", "set_priority", "Set high priority", { priority: "high" }),
      actionNode("node-pricing-end", "end", "End flow")
    ]
  }),
  createSampleFlow({
    id: "flow-complaint-handoff",
    name: "Complaint handoff flow",
    description: "Escalate complaint intent to supervisor.",
    status: "active",
    trigger: trigger("trigger-complaint", "ai_intent", { intent: "complaint" }),
    platformScope: allFlowPlatforms,
    roomIds: [],
    nodes: [
      triggerNode("node-complaint-trigger", "Intent: complaint"),
      actionNode("node-complaint-priority", "set_priority", "Set urgent priority", { priority: "urgent" }),
      actionNode("node-complaint-handoff", "human_handoff", "Need human", { aiStatus: "Need Human" }),
      actionNode("node-complaint-assign", "assign_agent", "Assign supervisor", { agentId: "agent-ton" }),
      actionNode("node-complaint-end", "end", "End flow")
    ]
  }),
  createSampleFlow({
    id: "flow-follow-up",
    name: "Follow up flow",
    description: "Create a follow-up task and send a polite reminder.",
    status: "active",
    trigger: trigger("trigger-follow-up", "status_changed", { status: "follow_up" }),
    platformScope: allFlowPlatforms,
    roomIds: [],
    nodes: [
      triggerNode("node-follow-trigger", "Status changed: follow_up"),
      actionNode("node-follow-task", "create_task", "Create follow-up task", { title: "Follow up customer from automation" }),
      actionNode("node-follow-message", "send_message", "Send follow-up message", {
        message: "ขออนุญาตติดตามผลครับ ยังสนใจให้ทีมงานช่วยดูรายละเอียดต่อไหมครับ"
      }),
      actionNode("node-follow-end", "end", "End flow")
    ]
  }),
  createSampleFlow({
    id: "flow-line-hot-lead",
    name: "LINE hot lead flow",
    description: "Assign hot LINE leads and create an internal note.",
    status: "active",
    trigger: trigger("trigger-line-hot", "tag_added", { tag: "hot lead" }),
    platformScope: ["line"],
    roomIds: ["line-oa-main"],
    nodes: [
      triggerNode("node-line-hot-trigger", "Tag added: hot lead"),
      conditionNode("node-line-hot-condition", "Platform is LINE", { operator: "platform_equals", value: "line" }),
      actionNode("node-line-hot-assign", "assign_agent", "Assign LINE owner", { agentId: "agent-nok" }),
      actionNode("node-line-hot-note", "note", "Add internal note", { note: "LINE hot lead assigned by automation. Keep conversation in LINE room." }),
      actionNode("node-line-hot-broadcast-segment", "add_to_broadcast_segment", "Placeholder: add to broadcast segment", { segmentId: "seg-hot-leads", mockOnly: true }),
      actionNode("node-line-hot-end", "end", "End flow")
    ]
  }),
  createSampleFlow({
    id: "flow-first-message-welcome",
    name: "First message welcome flow",
    description: "Greet new conversations and mark them as new leads.",
    status: "active",
    trigger: trigger("trigger-first-message", "first_message", {}),
    platformScope: allFlowPlatforms,
    roomIds: [],
    nodes: [
      triggerNode("node-welcome-trigger", "First message"),
      actionNode("node-welcome-message", "send_message", "Send greeting", {
        message: "สวัสดีครับ ขอบคุณที่ติดต่อ RUAMCHAT Demo สนใจสอบถามเรื่องไหนครับ"
      }),
      actionNode("node-welcome-tag", "add_tag", "Add new lead tag", { tag: "new lead" }),
      actionNode("node-welcome-end", "end", "End flow")
    ]
  })
];

export const sampleFlowRuns: FlowRun[] = [
  {
    id: "run-seed-pricing",
    flowId: "flow-pricing-lead",
    conversationId: "conv-web-01",
    contactId: "contact-anya",
    status: "completed",
    startedAt: "2026-05-21T02:45:00.000Z",
    completedAt: "2026-05-21T02:45:01.000Z",
    steps: [
      runStep("seed-step-1", "node-pricing-trigger", "trigger", "completed", {}, { matched: true }, "2026-05-21T02:45:00.000Z"),
      runStep("seed-step-2", "node-pricing-message", "send_message", "completed", {}, { messageId: "automation-seed" }, "2026-05-21T02:45:01.000Z")
    ],
    resultSummary: "Pricing response sent, tag added, priority set high."
  },
  {
    id: "run-seed-complaint",
    flowId: "flow-complaint-handoff",
    conversationId: "conv-telegram-01",
    contactId: "contact-krit",
    status: "completed",
    startedAt: "2026-05-21T02:50:00.000Z",
    completedAt: "2026-05-21T02:50:01.000Z",
    steps: [
      runStep("seed-step-3", "node-complaint-trigger", "trigger", "completed", {}, { matched: true }, "2026-05-21T02:50:00.000Z"),
      runStep("seed-step-4", "node-complaint-handoff", "human_handoff", "completed", {}, { aiStatus: "Need Human" }, "2026-05-21T02:50:01.000Z")
    ],
    resultSummary: "Complaint escalated to supervisor with urgent priority."
  }
];

export function createDefaultFlowStore(): FlowStore {
  return {
    flows: sampleFlows,
    runs: sampleFlowRuns
  };
}

export function loadFlowBuilderData(mode: "mock"): Promise<FlowBuilderMockData>;
export function loadFlowBuilderData(mode: "api"): Promise<FlowBuilderApiData>;
export function loadFlowBuilderData(mode: DataMode): Promise<FlowBuilderData>;
export async function loadFlowBuilderData(mode: DataMode): Promise<FlowBuilderData> {
  if (mode === "mock") {
    return {
      mode,
      store: getStoredFlowStore()
    };
  }

  const flows = await getFlows();
  const runs = (await Promise.all(flows.map((flow) => getFlowRuns(flow.id)))).flat();
  return {
    mode,
    store: { flows, runs }
  };
}

export function createFlow(store: FlowStore, input: {
  name: string;
  description?: string;
  triggerType: FlowTriggerType;
  keyword?: string;
  intent?: AIIntent;
  tag?: string;
  status?: ConversationStatus;
  platformScope: Platform[];
  roomIds: string[];
}, at = new Date()) {
  const now = at.toISOString();
  const id = `flow-${slug(input.name)}-${at.getTime()}`;
  const flow = createSampleFlow({
    id,
    name: input.name.trim() || "Untitled flow",
    description: input.description?.trim() ?? "",
    status: "draft",
    trigger: trigger(`trigger-${id}`, input.triggerType, {
      keyword: input.keyword,
      intent: input.intent,
      tag: input.tag,
      status: input.status,
      matchMode: input.triggerType === "keyword" ? "contains" : "exact"
    }),
    platformScope: input.platformScope.length > 0 ? input.platformScope : allFlowPlatforms,
    roomIds: input.roomIds,
    nodes: [
      triggerNode(`node-${id}-trigger`, `Trigger: ${input.triggerType}`),
      actionNode(`node-${id}-message`, "send_message", "Draft action", { message: "Automation draft message" }),
      actionNode(`node-${id}-end`, "end", "End flow")
    ],
    createdAt: now,
    updatedAt: now
  });
  return { ...store, flows: [flow, ...store.flows] };
}

export function editFlow(store: FlowStore, flowId: string, patch: Partial<Omit<Flow, "id" | "createdAt">>, at = new Date()) {
  return {
    ...store,
    flows: store.flows.map((flow) => flow.id === flowId ? {
      ...flow,
      ...patch,
      triggerType: patch.trigger?.type ?? patch.triggerType ?? flow.triggerType,
      updatedAt: at.toISOString()
    } : flow)
  };
}

export function duplicateFlow(store: FlowStore, flowId: string, at = new Date()) {
  const flow = store.flows.find((item) => item.id === flowId);
  if (!flow) return store;
  const copyId = `${flow.id}-copy-${at.getTime()}`;
  const copied: Flow = {
    ...flow,
    id: copyId,
    name: `${flow.name} Copy`,
    status: "draft",
    trigger: { ...flow.trigger, id: `${flow.trigger.id}-copy-${at.getTime()}` },
    nodes: flow.nodes.map((node) => ({ ...node, id: `${node.id}-copy` })),
    edges: flow.edges.map((edge) => ({
      ...edge,
      id: `${edge.id}-copy`,
      sourceNodeId: `${edge.sourceNodeId}-copy`,
      targetNodeId: `${edge.targetNodeId}-copy`
    })),
    createdAt: at.toISOString(),
    updatedAt: at.toISOString()
  };
  return { ...store, flows: [copied, ...store.flows] };
}

export function setFlowStatus(store: FlowStore, flowId: string, status: FlowStatus, at = new Date()) {
  return editFlow(store, flowId, { status }, at);
}

export function archiveFlow(store: FlowStore, flowId: string, at = new Date()) {
  return setFlowStatus(store, flowId, "archived", at);
}

export function activateFlow(store: FlowStore, flowId: string, at = new Date()) {
  return setFlowStatus(store, flowId, "active", at);
}

export function pauseFlow(store: FlowStore, flowId: string, at = new Date()) {
  return setFlowStatus(store, flowId, "paused", at);
}

export function getFlowRunHistory(store: FlowStore, flowId: string) {
  return store.runs
    .filter((run) => run.flowId === flowId)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

export function getFlowStats(store: FlowStore, flowId: string) {
  const runs = store.runs.filter((run) => run.flowId === flowId);
  const completed = runs.filter((run) => ["completed", "success", "dry_run"].includes(run.status)).length;
  return {
    runCount: runs.length,
    successRate: runs.length === 0 ? 100 : Math.round((completed / runs.length) * 100)
  };
}

export function getAutomationMetrics(store: FlowStore) {
  const runs = store.runs;
  const completed = runs.filter((run) => ["completed", "success", "dry_run"].includes(run.status)).length;
  const failed = runs.filter((run) => run.status === "failed").length;
  const byFlow = store.flows
    .map((flow) => ({ flowId: flow.id, name: flow.name, count: runs.filter((run) => run.flowId === flow.id).length }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 5);
  return {
    automationRuns: runs.length,
    automationSuccessRate: runs.length === 0 ? 100 : Math.round((completed / runs.length) * 100),
    failedAutomationCount: failed,
    topActiveFlows: byFlow
  };
}

export function evaluateTrigger(flow: Flow, input: FlowTestInput, autoMode = true) {
  if (flow.status === "archived") return false;
  if (autoMode && flow.status !== "active") return false;
  if (!isFlowScopedToInput(flow, input)) return false;
  const expectedType = input.triggerType ?? flow.trigger.type;
  if (flow.trigger.type !== "manual_test" && expectedType !== flow.trigger.type) return false;

  switch (flow.trigger.type) {
    case "keyword":
      return matchText(input.message, flow.trigger.keyword ?? "", flow.trigger.matchMode, flow.trigger.caseSensitive);
    case "first_message":
      return input.isFirstMessage === true || mockConversations.find((conversation) => conversation.id === input.conversationId)?.messages.length === 1;
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

export function evaluateCondition(node: FlowNode, input: FlowTestInput, state: FlowExecutionState) {
  const operator = String(node.config.operator ?? "") as FlowConditionOperator;
  const value = node.config.value;
  const conversation = findConversation(state.conversations, input.conversationId);
  const contact = findContact(state.contacts, input.contactId);
  const message = input.message || conversation?.lastMessage || "";

  switch (operator) {
    case "platform_equals":
      return input.platform === value;
    case "room_equals":
      return input.roomId === value;
    case "contact_has_tag":
      return Boolean(contact?.tags.includes(String(value)) || conversation?.tags.includes(String(value)));
    case "leadStatus_equals":
      return contact?.leadStatus === value;
    case "ai_confidence_gt":
      return (input.aiConfidence ?? conversation?.confidence ?? 0) > Number(value);
    case "message_contains":
      return message.toLowerCase().includes(String(value).toLowerCase());
    case "priority_equals":
      return conversation?.priority === value;
    case "business_hours":
      return input.businessHours ?? Boolean(value);
    default:
      return true;
  }
}

export function getMatchingFlows(flows: Flow[], input: FlowTestInput, autoMode = true) {
  return flows.filter((flow) => evaluateTrigger(flow, input, autoMode));
}

export function runFlowTest(
  flow: Flow,
  input: FlowTestInput,
  seed: Partial<FlowExecutionState> = {},
  at = new Date()
): FlowRunTestResult {
  const triggerMatched = evaluateTrigger(flow, input, false) && flow.status !== "archived";
  const initialState: FlowExecutionState = {
    conversations: seed.conversations ?? mockConversations,
    contacts: seed.contacts ?? mockContacts,
    adminStore: seed.adminStore ?? createDefaultAdminStore(),
    actionResults: [],
    auditLogsCreated: [],
    externalCalls: []
  };
  const startedAt = at.toISOString();
  const run: FlowRun = {
    id: `run-${flow.id}-${at.getTime()}`,
    flowId: flow.id,
    conversationId: input.conversationId,
    contactId: input.contactId,
    status: triggerMatched ? "running" : "stopped",
    startedAt,
    steps: [],
    resultSummary: triggerMatched ? "Flow started in local test mode." : "Trigger did not match or flow is archived."
  };

  if (!triggerMatched) {
    return { triggerMatched, flowRun: { ...run, completedAt: startedAt }, state: initialState };
  }

  const state = cloneExecutionState(initialState);
  let shouldSkipActions = false;
  let failed = false;

  for (const node of getPreviewSequence(flow)) {
    const createdAt = new Date(at.getTime() + run.steps.length * 1000).toISOString();
    if (shouldSkipActions && !["condition", "end"].includes(node.type)) {
      run.steps.push(stepFromNode(node, "skipped", input, { reason: "Previous condition evaluated false" }, undefined, createdAt));
      continue;
    }

    try {
      if (node.type === "trigger") {
        run.steps.push(stepFromNode(node, "completed", input, { matched: triggerMatched }, undefined, createdAt));
        continue;
      }
      if (node.type === "condition") {
        const matched = evaluateCondition(node, input, state);
        shouldSkipActions = !matched;
        run.steps.push(stepFromNode(node, "completed", input, { matched }, undefined, createdAt));
        continue;
      }
      const result = executeMockAction(node, input, state, new Date(createdAt));
      state.actionResults.push(result);
      run.steps.push(stepFromNode(node, result.status === "failed" ? "failed" : result.status === "skipped" ? "skipped" : "completed", input, result, result.status === "failed" ? result.message : undefined, createdAt));
      if (result.status === "failed") {
        failed = true;
        break;
      }
      if (node.type === "end") break;
    } catch (error) {
      failed = true;
      const message = error instanceof Error ? error.message : "Unknown flow error";
      run.steps.push(stepFromNode(node, "failed", input, undefined, message, createdAt));
      state.actionResults.push({ actionType: node.type, status: "failed", message, metadata: {} });
      break;
    }
  }

  const completedAt = new Date(at.getTime() + Math.max(1, run.steps.length) * 1000).toISOString();
  const completedActions = state.actionResults.filter((result) => result.status === "success").length;
  const skippedActions = run.steps.filter((step) => step.status === "skipped").length;
  return {
    triggerMatched,
    flowRun: {
      ...run,
      status: failed ? "failed" : "completed",
      completedAt,
      resultSummary: failed
        ? `Flow failed after ${run.steps.length} step(s).`
        : `Flow completed with ${completedActions} action(s), ${skippedActions} skipped step(s), and ${state.auditLogsCreated.length} audit log(s).`
    },
    state
  };
}

export function runAndRecordFlow(store: FlowStore, flowId: string, input: FlowTestInput, seed: Partial<FlowExecutionState> = {}, at = new Date()) {
  const flow = store.flows.find((item) => item.id === flowId);
  if (!flow) return { store, result: null };
  const result = runFlowTest(flow, input, seed, at);
  return {
    store: { ...store, runs: [result.flowRun, ...store.runs] },
    result
  };
}

export function executeMockAction(node: FlowNode, input: FlowTestInput, state: FlowExecutionState, at = new Date()): AutomationActionResult {
  if (node.config.fail === true) {
    return { actionType: node.type, status: "failed", message: `${node.type} failed by test config`, metadata: {} };
  }

  const conversation = findConversation(state.conversations, input.conversationId);
  if (!conversation && node.type !== "delay" && node.type !== "end") {
    return { actionType: node.type, status: "failed", message: "Conversation not found", metadata: { conversationId: input.conversationId } };
  }

  switch (node.type) {
    case "send_message": {
      const body = String(node.config.message ?? "Automation message");
      const message = createAutomationMessage(body, at);
      updateConversation(state, input.conversationId, (current) => ({
        ...current,
        lastMessage: body,
        lastMessageTime: message.time,
        messages: [...current.messages, message],
        unreplied: false
      }));
      pushAudit(state, "automation_send_message", input.conversationId, { flowNodeId: node.id, messageId: message.id }, at);
      return { actionType: node.type, status: "success", message: "Automation message added locally", metadata: { messageId: message.id } };
    }
    case "ai_reply": {
      const decision = createKnowledgeAwareMockAiDecision(input.message, sampleKnowledgeItems);
      const draft = createChatMessage("ai_draft", decision.reply, at);
      updateConversation(state, input.conversationId, (current) => ({
        ...current,
        aiAnalysis: decision,
        aiSummary: decision.summary,
        aiDecision: decision.reason,
        intent: decision.intent,
        confidence: decision.confidence,
        nextAction: decision.nextAction,
        messages: [...current.messages, draft]
      }));
      return { actionType: node.type, status: "success", message: "Mock AI draft generated locally", metadata: { intent: decision.intent, confidence: decision.confidence } };
    }
    case "assign_agent": {
      const agentId = String(node.config.agentId ?? "agent-may");
      state.adminStore = assignConversation(state.adminStore, input.conversationId, agentId, currentMockAgentId, at);
      pushNewestAdminAudit(state);
      updateConversation(state, input.conversationId, (current) => ({ ...current, assignedAgent: state.adminStore.agents.find((agent) => agent.id === agentId)?.name ?? agentId }));
      return { actionType: node.type, status: "success", message: `Assigned to ${agentId}`, metadata: { agentId } };
    }
    case "add_tag": {
      const tag = String(node.config.tag ?? "automation");
      updateConversation(state, input.conversationId, (current) => ({ ...current, tags: unique([...current.tags, tag]) }));
      state.contacts = addContactTag(state.contacts, input.contactId, tag);
      pushAudit(state, "automation_add_tag", input.conversationId, { tag, contactId: input.contactId }, at);
      return { actionType: node.type, status: "success", message: `Tag added: ${tag}`, metadata: { tag } };
    }
    case "remove_tag": {
      const tag = String(node.config.tag ?? "automation");
      updateConversation(state, input.conversationId, (current) => ({ ...current, tags: current.tags.filter((item) => item !== tag) }));
      state.contacts = removeContactTag(state.contacts, input.contactId, tag);
      pushAudit(state, "automation_remove_tag", input.conversationId, { tag, contactId: input.contactId }, at);
      return { actionType: node.type, status: "success", message: `Tag removed: ${tag}`, metadata: { tag } };
    }
    case "set_priority": {
      const priority = String(node.config.priority ?? "medium") as ConversationPriority;
      state.adminStore = setConversationPriority(state.adminStore, input.conversationId, priority, currentMockAgentId, at);
      pushNewestAdminAudit(state);
      updateConversation(state, input.conversationId, (current) => ({ ...current, priority }));
      return { actionType: node.type, status: "success", message: `Priority set to ${priority}`, metadata: { priority } };
    }
    case "set_status": {
      const status = String(node.config.status ?? "open") as ConversationStatus;
      state.adminStore = setConversationStatus(state.adminStore, input.conversationId, status, currentMockAgentId, at);
      pushNewestAdminAudit(state);
      updateConversation(state, input.conversationId, (current) => ({ ...current, status }));
      return { actionType: node.type, status: "success", message: `Status set to ${status}`, metadata: { status } };
    }
    case "create_task": {
      state.adminStore = createConversationTask(state.adminStore, input.conversationId, input.contactId, currentMockAgentId, at);
      pushNewestAdminAudit(state);
      return { actionType: node.type, status: "success", message: "Follow-up task created", metadata: { contactId: input.contactId } };
    }
    case "human_handoff": {
      updateConversation(state, input.conversationId, (current) => ({ ...current, aiStatus: String(node.config.aiStatus ?? "Need Human") as ConversationCard["aiStatus"] }));
      pushAudit(state, "automation_human_handoff", input.conversationId, { aiStatus: node.config.aiStatus ?? "Need Human" }, at);
      return { actionType: node.type, status: "success", message: "AI status changed for human handoff", metadata: { aiStatus: node.config.aiStatus ?? "Need Human" } };
    }
    case "delay":
      return { actionType: node.type, status: "skipped", message: "Delay skipped in local test mode", metadata: { seconds: node.config.seconds ?? 0 } };
    case "note": {
      const body = String(node.config.note ?? "Automation internal note");
      state.adminStore = addInternalNote(state.adminStore, input.conversationId, input.contactId, body, "team", currentMockAgentId, at);
      pushNewestAdminAudit(state);
      return { actionType: node.type, status: "success", message: "Internal note added only", metadata: { body } };
    }
    case "add_to_broadcast_segment":
      return { actionType: node.type, status: "skipped", message: "Broadcast segment action is a Sprint 11 placeholder only", metadata: { segmentId: node.config.segmentId ?? "seg-hot-leads", externalCalls: 0 } };
    case "trigger_broadcast_mock":
      return { actionType: node.type, status: "skipped", message: "Broadcast mock trigger is a placeholder and does not send", metadata: { campaignId: node.config.campaignId ?? "", externalCalls: 0 } };
    case "end":
      return { actionType: node.type, status: "success", message: "Flow ended", metadata: {} };
    default:
      return { actionType: node.type, status: "skipped", message: "No mock action for node", metadata: {} };
  }
}

export function getPreviewSequence(flow: Flow) {
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

export function buildFlowTestInput(conversation: ConversationCard, contact: Contact | null, overrides: Partial<FlowTestInput> = {}): FlowTestInput {
  const room = platformRooms.find((item) => item.id === conversation.roomId);
  return {
    conversationId: conversation.id,
    contactId: contact?.id ?? conversation.linkedIdentities[0]?.externalUserId ?? "contact-local",
    message: conversation.lastMessage,
    platform: room?.platform ?? "webchat",
    roomId: conversation.roomId,
    triggerType: "keyword",
    intent: conversation.aiAnalysis?.intent,
    aiConfidence: conversation.confidence,
    tag: conversation.tags[0],
    status: conversation.status,
    isFirstMessage: conversation.messages.filter((message) => message.sender === "customer").length <= 1,
    businessHours: true,
    ...overrides
  };
}

export function buildInboxFlowTestInput(
  flow: Flow,
  conversation: ConversationCard,
  contact: Contact | null,
  options: {
    apiMode: boolean;
    room: { id: string; platform: Platform };
    status: ConversationStatus;
    contactId: string;
  }
): FlowTestInput {
  const tag = flow.trigger.tag && conversation.tags.includes(flow.trigger.tag)
    ? flow.trigger.tag
    : conversation.tags.includes("hot lead")
      ? "hot lead"
      : conversation.tags[0];
  const triggerMessage = options.apiMode ? getLatestCustomerMessage(conversation) ?? conversation.lastMessage : conversation.lastMessage;
  return buildFlowTestInput(conversation, contact, {
    conversationId: conversation.id,
    contactId: options.contactId,
    message: options.apiMode ? getApiInboxMatchMessage(flow, triggerMessage) : triggerMessage,
    platform: options.room.platform,
    roomId: conversation.roomId ?? options.room.id,
    triggerType: flow.trigger.type,
    intent: conversation.aiAnalysis?.intent,
    tag,
    status: flow.trigger.status ?? options.status,
    isFirstMessage: conversation.messages.filter((message) => message.sender === "customer").length <= 1
  });
}

export function saveStoredFlowStore(store: FlowStore) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(flowStoreStorageKey, JSON.stringify(store));
  window.dispatchEvent(new CustomEvent(flowStoreStorageKey, { detail: store }));
}

export function getStoredFlowStore() {
  if (typeof window === "undefined") return createDefaultFlowStore();
  try {
    const raw = window.localStorage.getItem(flowStoreStorageKey);
    if (!raw) return createDefaultFlowStore();
    const parsed = JSON.parse(raw) as FlowStore;
    return {
      flows: Array.isArray(parsed.flows) ? parsed.flows : sampleFlows,
      runs: Array.isArray(parsed.runs) ? parsed.runs : sampleFlowRuns
    };
  } catch {
    return createDefaultFlowStore();
  }
}

export function subscribeFlowStore(callback: (store: FlowStore) => void) {
  if (typeof window === "undefined") return () => {};
  const notify = () => callback(getStoredFlowStore());
  const handleStorage = (event: StorageEvent) => {
    if (event.key === flowStoreStorageKey) notify();
  };
  window.addEventListener("storage", handleStorage);
  window.addEventListener(flowStoreStorageKey, notify);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(flowStoreStorageKey, notify);
  };
}

function createSampleFlow(input: {
  id: string;
  name: string;
  description: string;
  status: FlowStatus;
  trigger: FlowTrigger;
  platformScope: Platform[];
  roomIds: string[];
  nodes: FlowNode[];
  createdAt?: string;
  updatedAt?: string;
}): Flow {
  const nodes = input.nodes;
  return {
    id: input.id,
    name: input.name,
    description: input.description,
    status: input.status,
    triggerType: input.trigger.type,
    trigger: input.trigger,
    platformScope: input.platformScope,
    roomIds: input.roomIds,
    nodes,
    edges: nodes.slice(0, -1).map((node, index) => ({
      id: `edge-${input.id}-${index}`,
      sourceNodeId: node.id,
      targetNodeId: nodes[index + 1]?.id ?? node.id,
      conditionLabel: node.type === "condition" ? "true" : undefined
    })),
    createdAt: input.createdAt ?? baseTime,
    updatedAt: input.updatedAt ?? baseTime
  };
}

function trigger(id: string, type: FlowTriggerType, patch: Partial<FlowTrigger>): FlowTrigger {
  return {
    id,
    type,
    matchMode: "contains",
    caseSensitive: false,
    ...patch,
    intent: patch.intent as FlowTrigger["intent"]
  };
}

function triggerNode(id: string, label: string): FlowNode {
  return { id, type: "trigger", label, config: {}, position: { x: 80, y: 80 } };
}

function conditionNode(id: string, label: string, config: FlowNode["config"]): FlowNode {
  return { id, type: "condition", label, config, position: { x: 300, y: 80 } };
}

function actionNode(id: string, type: FlowNodeType, label: string, config: FlowNode["config"] = {}): FlowNode {
  return { id, type, label, config, position: { x: 520, y: 80 } };
}

function runStep(id: string, nodeId: string, nodeType: FlowNodeType, status: FlowRunStep["status"], input: unknown, output: unknown, createdAt: string): FlowRunStep {
  return { id, nodeId, nodeType, status, input, output, createdAt };
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

function isFlowScopedToInput(flow: Flow, input: FlowTestInput) {
  if (!flow.platformScope.includes(input.platform)) return false;
  if (flow.roomIds.length > 0 && !flow.roomIds.includes(input.roomId)) return false;
  return true;
}

function matchText(value: string, pattern: string, mode: FlowTrigger["matchMode"], caseSensitive: boolean) {
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

function getApiInboxMatchMessage(flow: Flow, message: string) {
  const keyword = flow.trigger.keyword?.trim();
  if (flow.trigger.type !== "keyword" || !keyword || flow.trigger.matchMode !== "contains") return message;
  if (matchText(message, keyword, flow.trigger.matchMode, flow.trigger.caseSensitive)) return message;
  const pricingKeyword = /ราคา|price|pricing/i.test(keyword);
  const pricingMessage = /แพ็กเกจ|package|pricing|plan|โปร|business|pro/i.test(message);
  return pricingKeyword && pricingMessage ? `${message} ${keyword}` : message;
}

function getLatestCustomerMessage(conversation: ConversationCard) {
  return [...conversation.messages].reverse().find((message) => message.sender === "customer")?.body;
}

function normalizeText(value: string, caseSensitive: boolean) {
  return caseSensitive ? value.trim() : value.trim().toLowerCase();
}

function cloneExecutionState(state: FlowExecutionState): FlowExecutionState {
  return {
    conversations: state.conversations.map((conversation) => ({ ...conversation, tags: [...conversation.tags], messages: conversation.messages.map((message) => ({ ...message })) })),
    contacts: state.contacts.map((contact) => ({
      ...contact,
      tags: [...contact.tags],
      identities: contact.identities.map((identity) => ({ ...identity })),
      notes: contact.notes.map((note) => ({ ...note })),
      tasks: contact.tasks.map((task) => ({ ...task }))
    })),
    adminStore: {
      ...state.adminStore,
      agents: state.adminStore.agents.map((agent) => ({ ...agent })),
      assignments: state.adminStore.assignments.map((assignment) => ({ ...assignment })),
      slaPolicies: state.adminStore.slaPolicies.map((policy) => ({ ...policy })),
      slaStates: state.adminStore.slaStates.map((sla) => ({ ...sla })),
      internalNotes: state.adminStore.internalNotes.map((note) => ({ ...note })),
      cannedReplies: state.adminStore.cannedReplies.map((reply) => ({ ...reply, tags: [...reply.tags] })),
      auditLogs: state.adminStore.auditLogs.map((log) => ({ ...log, metadata: { ...log.metadata } })),
      activityStates: state.adminStore.activityStates.map((activity) => ({ ...activity, viewingAgentIds: [...activity.viewingAgentIds], typingAgentIds: [...activity.typingAgentIds], editingAgentIds: [...activity.editingAgentIds] })),
      conversationMeta: state.adminStore.conversationMeta.map((meta) => ({ ...meta })),
      tasks: state.adminStore.tasks.map((task) => ({ ...task }))
    },
    actionResults: [...state.actionResults],
    auditLogsCreated: [...state.auditLogsCreated],
    externalCalls: [...state.externalCalls]
  };
}

function updateConversation(state: FlowExecutionState, conversationId: string, update: (conversation: ConversationCard) => ConversationCard) {
  state.conversations = state.conversations.map((conversation) => conversation.id === conversationId ? update(conversation) : conversation);
}

function findConversation(conversations: ConversationCard[], conversationId: string) {
  return conversations.find((conversation) => conversation.id === conversationId) ?? null;
}

function findContact(contacts: Contact[], contactId: string) {
  return contacts.find((contact) => contact.id === contactId) ?? null;
}

function createAutomationMessage(body: string, at: Date): ChatMessage {
  return {
    id: `automation-${at.getTime()}`,
    sender: "automation",
    body,
    time: new Intl.DateTimeFormat("th-TH", { hour: "2-digit", minute: "2-digit" }).format(at)
  };
}

function pushAudit(state: FlowExecutionState, action: string, conversationId: string, metadata: Record<string, unknown>, at: Date) {
  const log: AuditLog = {
    id: `audit-flow-${action}-${conversationId}-${at.getTime()}`,
    actorId: "automation-flow",
    action,
    targetType: "conversation",
    targetId: conversationId,
    metadata,
    createdAt: at.toISOString()
  };
  state.adminStore = { ...state.adminStore, auditLogs: [log, ...state.adminStore.auditLogs] };
  state.auditLogsCreated = [log, ...state.auditLogsCreated];
}

function pushNewestAdminAudit(state: FlowExecutionState) {
  const newest = state.adminStore.auditLogs[0];
  if (newest && !state.auditLogsCreated.some((log) => log.id === newest.id)) {
    state.auditLogsCreated = [newest, ...state.auditLogsCreated];
  }
}

function unique(values: string[]) {
  return Array.from(new Set(values));
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9ก-๙]+/gi, "-").replace(/^-|-$/g, "") || "flow";
}
