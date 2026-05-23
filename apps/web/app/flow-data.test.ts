import { describe, expect, it } from "vitest";
import type { Flow } from "@ai-omni/shared";
import { createDefaultAdminStore } from "./admin-data";
import { mockContacts } from "./crm-data";
import { mockConversations } from "./inbox-data";
import {
  activateFlow,
  archiveFlow,
  buildInboxFlowTestInput,
  buildFlowTestInput,
  createDefaultFlowStore,
  createFlow,
  duplicateFlow,
  evaluateCondition,
  evaluateTrigger,
  getAutomationMetrics,
  getFlowRunHistory,
  getFlowStats,
  getMatchingFlows,
  pauseFlow,
  runAndRecordFlow,
  runFlowTest,
  sampleFlows,
  type FlowExecutionState,
  type FlowTestInput
} from "./flow-data";

const pricingFlow = sampleFlows.find((flow) => flow.id === "flow-pricing-lead")!;
const complaintFlow = sampleFlows.find((flow) => flow.id === "flow-complaint-handoff")!;
const lineHotLeadFlow = sampleFlows.find((flow) => flow.id === "flow-line-hot-lead")!;
const followUpFlow = sampleFlows.find((flow) => flow.id === "flow-follow-up")!;
const baseConversation = mockConversations.find((conversation) => conversation.id === "conv-web-01")!;
const baseContact = mockContacts.find((contact) => contact.id === "contact-anya")!;

function input(overrides: Partial<FlowTestInput> = {}): FlowTestInput {
  return buildFlowTestInput(baseConversation, baseContact, {
    message: "อยากทราบราคาแพ็กเกจ",
    platform: "webchat",
    roomId: "webchat-main",
    triggerType: "keyword",
    intent: "pricing",
    tag: "pricing",
    status: "open",
    aiConfidence: 0.82,
    businessHours: true,
    ...overrides
  });
}

function state(): FlowExecutionState {
  return {
    conversations: mockConversations,
    contacts: mockContacts,
    adminStore: createDefaultAdminStore(),
    actionResults: [],
    auditLogsCreated: [],
    externalCalls: []
  };
}

describe("flow builder mock store", () => {
  it("matches keyword contains, exact, and caseSensitive triggers", () => {
    const exactFlow: Flow = { ...pricingFlow, trigger: { ...pricingFlow.trigger, matchMode: "exact", keyword: "ราคา" }, triggerType: "keyword" };
    const caseFlow: Flow = { ...pricingFlow, trigger: { ...pricingFlow.trigger, keyword: "PRICE", caseSensitive: true }, triggerType: "keyword" };

    expect(evaluateTrigger(pricingFlow, input({ message: "ขอราคา Pro" }))).toBe(true);
    expect(evaluateTrigger(exactFlow, input({ message: "ราคา" }))).toBe(true);
    expect(evaluateTrigger(exactFlow, input({ message: "ขอราคา" }))).toBe(false);
    expect(evaluateTrigger(caseFlow, input({ message: "price" }))).toBe(false);
    expect(evaluateTrigger(caseFlow, input({ message: "PRICE" }))).toBe(true);
  });

  it("matches ai_intent, tag_added, and status_changed triggers", () => {
    expect(evaluateTrigger(complaintFlow, input({ triggerType: "ai_intent", intent: "complaint" }))).toBe(true);
    expect(evaluateTrigger(lineHotLeadFlow, input({ triggerType: "tag_added", tag: "hot lead", platform: "line", roomId: "line-oa-main" }))).toBe(true);
    expect(evaluateTrigger(followUpFlow, input({ triggerType: "status_changed", status: "follow_up" }))).toBe(true);
  });

  it("evaluates platform, room, tag, lead status, confidence, message, priority, and business hour conditions", () => {
    const baseNode = pricingFlow.nodes.find((node) => node.type === "condition")!;
    const execution = state();

    expect(evaluateCondition({ ...baseNode, config: { operator: "platform_equals", value: "webchat" } }, input(), execution)).toBe(true);
    expect(evaluateCondition({ ...baseNode, config: { operator: "room_equals", value: "webchat-main" } }, input(), execution)).toBe(true);
    expect(evaluateCondition({ ...baseNode, config: { operator: "contact_has_tag", value: "hot lead" } }, input(), execution)).toBe(true);
    expect(evaluateCondition({ ...baseNode, config: { operator: "leadStatus_equals", value: "qualified" } }, input(), execution)).toBe(true);
    expect(evaluateCondition({ ...baseNode, config: { operator: "ai_confidence_gt", value: 0.7 } }, input(), execution)).toBe(true);
    expect(evaluateCondition({ ...baseNode, config: { operator: "message_contains", value: "ราคา" } }, input(), execution)).toBe(true);
    expect(evaluateCondition({ ...baseNode, config: { operator: "priority_equals", value: "high" } }, input(), execution)).toBe(true);
    expect(evaluateCondition({ ...baseNode, config: { operator: "business_hours", value: true } }, input({ businessHours: false }), execution)).toBe(false);
  });

  it("executes send_message, ai_reply, tag, priority, status, task, handoff, note, and delay actions locally", () => {
    const fullFlow: Flow = {
      ...pricingFlow,
      id: "flow-full-action-test",
      nodes: [
        pricingFlow.nodes[0]!,
        { id: "node-send", type: "send_message", label: "Send", config: { message: "local automation" }, position: { x: 1, y: 1 } },
        { id: "node-ai", type: "ai_reply", label: "AI", config: {}, position: { x: 2, y: 1 } },
        { id: "node-assign", type: "assign_agent", label: "Assign", config: { agentId: "agent-beam" }, position: { x: 3, y: 1 } },
        { id: "node-add-tag", type: "add_tag", label: "Add tag", config: { tag: "automation" }, position: { x: 4, y: 1 } },
        { id: "node-remove-tag", type: "remove_tag", label: "Remove tag", config: { tag: "automation" }, position: { x: 5, y: 1 } },
        { id: "node-priority", type: "set_priority", label: "Priority", config: { priority: "urgent" }, position: { x: 6, y: 1 } },
        { id: "node-status", type: "set_status", label: "Status", config: { status: "follow_up" }, position: { x: 7, y: 1 } },
        { id: "node-task", type: "create_task", label: "Task", config: {}, position: { x: 8, y: 1 } },
        { id: "node-handoff", type: "human_handoff", label: "Handoff", config: {}, position: { x: 9, y: 1 } },
        { id: "node-note", type: "note", label: "Note", config: { note: "internal only" }, position: { x: 10, y: 1 } },
        { id: "node-delay", type: "delay", label: "Delay", config: { seconds: 60 }, position: { x: 11, y: 1 } },
        { id: "node-end", type: "end", label: "End", config: {}, position: { x: 12, y: 1 } }
      ],
      edges: []
    };
    const result = runFlowTest(fullFlow, input(), { conversations: mockConversations, contacts: mockContacts, adminStore: createDefaultAdminStore() });
    const conversation = result.state.conversations.find((item) => item.id === "conv-web-01")!;
    const noteMessages = conversation.messages.filter((message) => message.body === "internal only");

    expect(conversation.messages.some((message) => message.sender === "automation" && message.body === "local automation")).toBe(true);
    expect(conversation.messages.some((message) => message.sender === "ai_draft")).toBe(true);
    expect(result.state.externalCalls).toEqual([]);
    expect(result.state.adminStore.assignments.some((assignment) => assignment.agentId === "agent-beam" && assignment.status === "active")).toBe(true);
    expect(conversation.tags).not.toContain("automation");
    expect(conversation.priority).toBe("urgent");
    expect(conversation.status).toBe("follow_up");
    expect(conversation.aiStatus).toBe("Need Human");
    expect(result.state.adminStore.tasks.some((task) => task.conversationId === "conv-web-01")).toBe(true);
    expect(result.state.adminStore.internalNotes.some((note) => note.body === "internal only")).toBe(true);
    expect(noteMessages).toHaveLength(0);
    expect(result.flowRun.steps.find((step) => step.nodeType === "delay")?.status).toBe("skipped");
    expect(result.state.auditLogsCreated.length).toBeGreaterThan(0);
  });

  it("keeps broadcast flow actions as placeholders with no external calls", () => {
    const placeholderFlow: Flow = {
      ...pricingFlow,
      id: "flow-broadcast-placeholder",
      nodes: [
        pricingFlow.nodes[0]!,
        { id: "node-add-broadcast", type: "add_to_broadcast_segment", label: "Add to segment", config: { segmentId: "seg-hot-leads" }, position: { x: 1, y: 1 } },
        { id: "node-trigger-broadcast", type: "trigger_broadcast_mock", label: "Trigger broadcast", config: { campaignId: "camp-hot-lead-reminder" }, position: { x: 2, y: 1 } }
      ],
      edges: []
    };
    const result = runFlowTest(placeholderFlow, input());

    expect(result.flowRun.status).toBe("completed");
    expect(result.flowRun.steps.filter((step) => step.status === "skipped")).toHaveLength(2);
    expect(result.state.externalCalls).toEqual([]);
  });

  it("runs pricing and complaint flows successfully and records history", () => {
    const pricing = runFlowTest(pricingFlow, input());
    const complaint = runFlowTest(complaintFlow, input({ triggerType: "ai_intent", intent: "complaint" }));
    const recorded = runAndRecordFlow(createDefaultFlowStore(), pricingFlow.id, input());

    expect(pricing.flowRun.status).toBe("completed");
    expect(pricing.state.conversations.find((item) => item.id === "conv-web-01")?.priority).toBe("high");
    expect(complaint.state.conversations.find((item) => item.id === "conv-web-01")?.aiStatus).toBe("Need Human");
    expect(recorded.store.runs[0]?.flowId).toBe(pricingFlow.id);
    expect(getFlowRunHistory(recorded.store, pricingFlow.id)[0]?.steps.length).toBeGreaterThan(0);
  });

  it("skips actions when a condition is false and fails when action config asks to fail", () => {
    const falseConditionFlow: Flow = {
      ...pricingFlow,
      nodes: pricingFlow.nodes.map((node) => node.type === "condition" ? { ...node, config: { operator: "platform_equals", value: "line" } } : node),
      edges: []
    };
    const failedFlow: Flow = {
      ...pricingFlow,
      nodes: [pricingFlow.nodes[0]!, { id: "node-fail", type: "send_message", label: "Fail", config: { fail: true }, position: { x: 2, y: 0 } }],
      edges: []
    };

    expect(runFlowTest(falseConditionFlow, input()).flowRun.steps.some((step) => step.status === "skipped")).toBe(true);
    expect(runFlowTest(failedFlow, input()).flowRun.status).toBe("failed");
  });

  it("does not run archived flows, and paused flows do not auto match", () => {
    const archived = { ...pricingFlow, status: "archived" as const };
    const paused = { ...pricingFlow, status: "paused" as const };

    expect(runFlowTest(archived, input()).flowRun.status).toBe("stopped");
    expect(evaluateTrigger(paused, input(), true)).toBe(false);
    expect(evaluateTrigger(paused, input(), false)).toBe(true);
  });

  it("enforces room and platform scope without moving conversations across rooms", () => {
    const facebookFlow: Flow = { ...pricingFlow, id: "flow-facebook-only", platformScope: ["facebook"], roomIds: ["facebook-page-main"] };
    const instagramInput = input({ platform: "instagram", roomId: "instagram-shop" });
    const lineInput = input({ platform: "line", roomId: "line-oa-main", triggerType: "tag_added", tag: "hot lead" });
    const lineResult = runFlowTest(lineHotLeadFlow, lineInput);

    expect(evaluateTrigger(lineHotLeadFlow, input({ platform: "webchat", roomId: "webchat-main", triggerType: "tag_added", tag: "hot lead" }))).toBe(false);
    expect(evaluateTrigger(facebookFlow, instagramInput)).toBe(false);
    expect(lineResult.state.conversations.find((conversation) => conversation.id === lineInput.conversationId)?.roomId).toBe(baseConversation.roomId);
  });

  it("creates, activates, pauses, archives, duplicates, and reports stats", () => {
    const created = createFlow(createDefaultFlowStore(), {
      name: "Draft pricing",
      triggerType: "keyword",
      keyword: "โปร",
      platformScope: ["webchat"],
      roomIds: ["webchat-main"]
    }, new Date("2026-05-21T04:00:00.000Z"));
    const id = created.flows[0]!.id;
    const active = activateFlow(created, id);
    const paused = pauseFlow(active, id);
    const archived = archiveFlow(paused, id);
    const duplicated = duplicateFlow(archived, id);
    const metrics = getAutomationMetrics(duplicated);

    expect(created.flows[0]?.status).toBe("draft");
    expect(active.flows.find((flow) => flow.id === id)?.status).toBe("active");
    expect(paused.flows.find((flow) => flow.id === id)?.status).toBe("paused");
    expect(archived.flows.find((flow) => flow.id === id)?.status).toBe("archived");
    expect(duplicated.flows[0]?.name).toContain("Copy");
    expect(getFlowStats(duplicated, "flow-pricing-lead").runCount).toBeGreaterThan(0);
    expect(metrics.automationRuns).toBeGreaterThan(0);
    expect(getMatchingFlows(duplicated.flows, input()).some((flow) => flow.id === "flow-pricing-lead")).toBe(true);
  });

  it("matches API-loaded persisted pricing flows for the Demo Web package conversation", () => {
    const persistedPricingFlow: Flow = {
      ...pricingFlow,
      id: "00000000-0000-4000-8000-000000000901",
      name: "Demo pricing lead dry-run",
      status: "active",
      trigger: {
        ...pricingFlow.trigger,
        keyword: "ราคา",
        matchMode: "contains",
        caseSensitive: false
      }
    };
    const demoWebConversation = {
      ...baseConversation,
      id: "00000000-0000-4000-8000-000000000201",
      roomId: "room-webchat-api",
      lastMessage: "Manual Sprint 25 safe reply",
      messages: [
        { id: "api-customer", sender: "customer" as const, body: "อยากเทียบแพ็กเกจ Pro กับ Business ก่อนตัดสินใจ", time: "03:40" },
        { id: "api-agent", sender: "agent" as const, body: "Manual Sprint 25 safe reply", time: "03:51" }
      ]
    };
    const apiInput = buildInboxFlowTestInput(persistedPricingFlow, demoWebConversation, baseContact, {
      apiMode: true,
      room: { id: "room-webchat-api", platform: "webchat" },
      status: "open",
      contactId: baseContact.id
    });
    const mockInput = buildInboxFlowTestInput(persistedPricingFlow, demoWebConversation, baseContact, {
      apiMode: false,
      room: { id: "room-webchat-api", platform: "webchat" },
      status: "open",
      contactId: baseContact.id
    });

    expect(getMatchingFlows([persistedPricingFlow], apiInput, true).map((flow) => flow.id)).toEqual(["00000000-0000-4000-8000-000000000901"]);
    expect(getMatchingFlows([persistedPricingFlow], mockInput, true)).toEqual([]);
  });
});
