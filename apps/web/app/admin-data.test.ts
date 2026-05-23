import { describe, expect, it } from "vitest";
import {
  addInternalNote,
  applyAiPriorityPolicy,
  assignConversation,
  canAiAutoReply,
  copyConversationSummary,
  createConversationTask,
  createDefaultAdminStore,
  currentMockAgentId,
  deleteInternalNote,
  evaluateSlaState,
  filterAdminConversations,
  findCannedReplyBySlash,
  getActiveAssignment,
  getAssignedAgent,
  getAuditLogsForConversation,
  getCollisionWarning,
  getConversationPriority,
  getConversationStatus,
  getOpenAdminTasks,
  getSlaState,
  getVisibleInternalNotes,
  pinInternalNote,
  recordCannedReplyUsed,
  recordUseAiDraft,
  returnConversationToAi,
  searchCannedReplies,
  setConversationPriority,
  setConversationStatus,
  shouldMockAiAutoReply,
  sortConversationsByPriority,
  takeOverConversation,
  transferConversation,
  unassignConversation,
  updateInternalNote
} from "./admin-data";
import { mockConversations } from "./inbox-data";

const now = new Date("2026-05-20T03:42:00.000Z");
const later = new Date("2026-05-20T03:50:00.000Z");

describe("admin tools mock store", () => {
  it("assigns, transfers, unassigns, filters inbox ownership, and writes audit logs", () => {
    const start = createDefaultAdminStore();
    const assigned = assignConversation(start, "conv-web-02", "agent-may", currentMockAgentId, now);
    const transferred = transferConversation(assigned, "conv-web-02", "agent-beam", currentMockAgentId, later);
    const unassigned = unassignConversation(transferred, "conv-web-02", currentMockAgentId, new Date("2026-05-20T03:55:00.000Z"));

    expect(getActiveAssignment(assigned, "conv-web-02")?.agentId).toBe("agent-may");
    expect(getActiveAssignment(transferred, "conv-web-02")?.agentId).toBe("agent-beam");
    expect(getActiveAssignment(unassigned, "conv-web-02")).toBeNull();
    expect(filterAdminConversations(mockConversations, assigned, "my").map((conversation) => conversation.id)).toContain("conv-web-02");
    expect(filterAdminConversations(mockConversations, unassigned, "unassigned").map((conversation) => conversation.id)).toContain("conv-web-02");
    expect(transferred.auditLogs[0]?.action).toBe("transfer");
    expect(unassigned.auditLogs[0]?.action).toBe("unassign");
  });

  it("sorts by priority, changes priority, escalates complaint/refund/human intent, and logs changes", () => {
    const store = createDefaultAdminStore();
    const sorted = sortConversationsByPriority(mockConversations, store);
    const changed = setConversationPriority(store, "conv-line-01", "urgent", currentMockAgentId, now);
    const complaint = applyAiPriorityPolicy(changed, {
      id: "conv-line-01",
      intent: "complaint",
      lastMessage: "ร้องเรียน",
      aiAnalysis: undefined
    });

    expect(sorted[0]?.id).toBe("conv-telegram-01");
    expect(getConversationPriority(changed, "conv-line-01")).toBe("urgent");
    expect(changed.auditLogs[0]?.action).toBe("priority_change");
    expect(getConversationPriority(complaint, "conv-line-01")).toBe("urgent");
  });

  it("evaluates SLA warning, breached state, and filters SLA queues", () => {
    const store = createDefaultAdminStore();
    const warningState = evaluateSlaState({
      conversationId: "conv-warning",
      firstResponseDueAt: "2026-05-20T03:46:00.000Z",
      nextResponseDueAt: "2026-05-20T04:00:00.000Z",
      resolutionDueAt: "2026-05-20T08:00:00.000Z",
      status: "ok"
    }, now);
    const breachedState = evaluateSlaState({
      conversationId: "conv-breached",
      firstResponseDueAt: "2026-05-20T03:30:00.000Z",
      nextResponseDueAt: "2026-05-20T04:00:00.000Z",
      resolutionDueAt: "2026-05-20T08:00:00.000Z",
      status: "ok"
    }, now);
    const evaluated = {
      ...store,
      slaStates: store.slaStates.map((state) => evaluateSlaState(state, now))
    };

    expect(warningState.status).toBe("warning");
    expect(breachedState.status).toBe("breached");
    expect(filterAdminConversations(mockConversations, evaluated, "sla_warning").map((conversation) => conversation.id)).toContain("conv-web-01");
    expect(filterAdminConversations(mockConversations, evaluated, "sla_breached").map((conversation) => conversation.id)).toContain("conv-telegram-01");
    expect(getSlaState(evaluated, "conv-web-01")?.status).toBe("warning");
  });

  it("detects typing/viewing collisions and blocks AI auto reply after human takeover", () => {
    const store = createDefaultAdminStore();
    const warning = getCollisionWarning(store, "conv-web-01", currentMockAgentId);
    const taken = takeOverConversation(store, "conv-web-02", currentMockAgentId, now);

    expect(warning.hasTypingWarning).toBe(true);
    expect(warning.typingText).toBe("มีแอดมินอีกคนกำลังตอบเคสนี้");
    expect(warning.ownerText).toBe("Assigned to May");
    expect(canAiAutoReply(taken, "conv-web-02")).toBe(false);
    expect(shouldMockAiAutoReply(taken, "conv-web-02", { requiresHuman: false })).toBe(false);
  });

  it("adds, edits, pins, deletes notes without creating customer messages and respects supervisor visibility", () => {
    const startMessages = mockConversations[0]?.messages.length ?? 0;
    const added = addInternalNote(createDefaultAdminStore(), "conv-web-02", "contact-narin", "Team-only note", "team", currentMockAgentId, now);
    const noteId = added.internalNotes[0]?.id ?? "";
    const edited = updateInternalNote(added, noteId, "Updated note", currentMockAgentId, later);
    const pinned = pinInternalNote(edited, noteId, true, currentMockAgentId, later);
    const deleted = deleteInternalNote(pinned, noteId, currentMockAgentId, later);
    const supervisorNotes = getVisibleInternalNotes(pinned, "conv-web-01", "supervisor");
    const agentNotes = getVisibleInternalNotes(pinned, "conv-web-01", "agent");

    expect(pinned.internalNotes.find((note) => note.id === noteId)?.body).toBe("Updated note");
    expect(pinned.internalNotes.find((note) => note.id === noteId)?.pinned).toBe(true);
    expect(deleted.internalNotes.some((note) => note.id === noteId)).toBe(false);
    expect(mockConversations[0]?.messages.length).toBe(startMessages);
    expect(supervisorNotes.some((note) => note.visibility === "supervisor")).toBe(true);
    expect(agentNotes.some((note) => note.visibility === "supervisor")).toBe(false);
  });

  it("searches canned replies, resolves slash commands, fills composer payload, and logs usage", () => {
    const store = createDefaultAdminStore();
    const results = searchCannedReplies(store, "แพ็กเกจ", "sales", "pricing");
    const slash = findCannedReplyBySlash(store, "/price");
    const logged = recordCannedReplyUsed(store, "conv-web-01", slash?.id ?? "reply-price", currentMockAgentId, now);

    expect(results[0]?.shortcut).toBe("/price");
    expect(slash?.body).toContain("แพ็กเกจเริ่มต้น");
    expect(logged.auditLogs[0]?.action).toBe("canned_reply_used");
  });

  it("runs quick actions and writes audit logs", () => {
    const store = createDefaultAdminStore();
    const assigned = assignConversation(store, "conv-web-02", currentMockAgentId, currentMockAgentId, now);
    const followUp = setConversationStatus(assigned, "conv-web-02", "follow_up", currentMockAgentId, now);
    const resolved = setConversationStatus(followUp, "conv-web-02", "resolved", currentMockAgentId, now);
    const reopened = setConversationStatus(resolved, "conv-web-02", "open", currentMockAgentId, now);
    const taken = takeOverConversation(reopened, "conv-web-02", currentMockAgentId, now);
    const returned = returnConversationToAi(taken, "conv-web-02", currentMockAgentId, now);
    const task = createConversationTask(returned, "conv-web-02", "contact-narin", currentMockAgentId, now);
    const copied = copyConversationSummary(task, "conv-web-02", currentMockAgentId, now);
    const aiDraft = recordUseAiDraft(copied, "conv-web-02", currentMockAgentId, now);

    expect(getAssignedAgent(assigned, "conv-web-02")?.id).toBe(currentMockAgentId);
    expect(getConversationStatus(followUp, "conv-web-02")).toBe("follow_up");
    expect(getConversationStatus(resolved, "conv-web-02")).toBe("resolved");
    expect(getConversationStatus(reopened, "conv-web-02")).toBe("open");
    expect(canAiAutoReply(taken, "conv-web-02")).toBe(false);
    expect(canAiAutoReply(returned, "conv-web-02")).toBe(true);
    expect(getOpenAdminTasks(task, "conv-web-02", "contact-narin").length).toBeGreaterThan(0);
    expect(aiDraft.auditLogs.map((log) => log.action)).toEqual(expect.arrayContaining([
      "assign",
      "status_change",
      "take_over",
      "return_to_ai",
      "task_create",
      "copy_summary",
      "use_ai_draft"
    ]));
  });

  it("returns Customer 360 admin data for assignment, priority, SLA, tasks, pinned notes, and audit logs", () => {
    const store = createDefaultAdminStore();

    expect(getAssignedAgent(store, "conv-web-01")?.name).toBe("May");
    expect(getConversationPriority(store, "conv-web-01")).toBe("high");
    expect(getSlaState(store, "conv-web-01")).not.toBeNull();
    expect(getOpenAdminTasks(store, "conv-web-01", "contact-anya")[0]?.title).toContain("SLA");
    expect(getVisibleInternalNotes(store, "conv-web-01", "supervisor").some((note) => note.pinned)).toBe(true);
    expect(getAuditLogsForConversation(store, "conv-web-01", "contact-anya").length).toBeGreaterThan(0);
  });
});
