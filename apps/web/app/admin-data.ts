import type {
  AIDecision,
  Agent,
  Assignment,
  AuditLog,
  CannedReply,
  ConversationPriority,
  ConversationStatus,
  InternalNote,
  InternalNoteVisibility,
  SlaPolicy,
  SlaState,
  SlaStatus
} from "@ai-omni/shared";
import type { ChatMessage, ConversationCard } from "./inbox-data";

export type AdminActivityState = {
  conversationId: string;
  viewingAgentIds: string[];
  typingAgentIds: string[];
  editingAgentIds: string[];
};

export type ConversationAdminMeta = {
  conversationId: string;
  priority: ConversationPriority;
  status: ConversationStatus;
  aiAutoReplyEnabled: boolean;
  followUpMarked: boolean;
  summaryCopied: boolean;
};

export type AdminTask = {
  id: string;
  conversationId: string;
  contactId: string;
  title: string;
  status: "open" | "done";
  createdBy: string;
  createdAt: string;
};

export type AdminStore = {
  agents: Agent[];
  assignments: Assignment[];
  slaPolicies: SlaPolicy[];
  slaStates: SlaState[];
  internalNotes: InternalNote[];
  cannedReplies: CannedReply[];
  auditLogs: AuditLog[];
  activityStates: AdminActivityState[];
  conversationMeta: ConversationAdminMeta[];
  tasks: AdminTask[];
};

export type AdminConversationFilter = "all" | "my" | "unassigned" | "sla_warning" | "sla_breached" | "follow_up" | "closed" | "spam";

export const currentMockAgentId = "agent-may";
export const adminStoreStorageKey = "ai-omni-admin-store-v1";

const baseTime = "2026-05-20T03:40:00.000Z";

export const mockAgents: Agent[] = [
  {
    id: "agent-may",
    name: "May",
    email: "may@example.com",
    role: "agent",
    status: "online",
    avatarUrl: "https://example.com/avatar-may.png",
    assignedRoomIds: ["webchat-main", "line-oa-main"],
    maxActiveConversations: 6,
    activeConversationCount: 1
  },
  {
    id: "agent-ton",
    name: "Ton",
    email: "ton@example.com",
    role: "supervisor",
    status: "away",
    avatarUrl: "https://example.com/avatar-ton.png",
    assignedRoomIds: ["facebook-page-main", "instagram-shop"],
    maxActiveConversations: 8,
    activeConversationCount: 1
  },
  {
    id: "agent-beam",
    name: "Beam",
    email: "beam@example.com",
    role: "agent",
    status: "online",
    avatarUrl: "https://example.com/avatar-beam.png",
    assignedRoomIds: ["telegram-bot-007237", "webchat-main"],
    maxActiveConversations: 4,
    activeConversationCount: 0
  },
  {
    id: "agent-nok",
    name: "Nok",
    email: "nok@example.com",
    role: "viewer",
    status: "offline",
    avatarUrl: "https://example.com/avatar-nok.png",
    assignedRoomIds: ["line-oa-main"],
    maxActiveConversations: 2,
    activeConversationCount: 0
  }
];

export const mockSlaPolicies: SlaPolicy[] = [
  { id: "sla-low", name: "Low priority", firstResponseMinutes: 60, nextResponseMinutes: 240, resolutionHours: 72, appliesToPriority: "low" },
  { id: "sla-medium", name: "Medium priority", firstResponseMinutes: 30, nextResponseMinutes: 120, resolutionHours: 24, appliesToPriority: "medium" },
  { id: "sla-high", name: "High priority", firstResponseMinutes: 10, nextResponseMinutes: 30, resolutionHours: 8, appliesToPriority: "high" },
  { id: "sla-urgent", name: "Urgent priority", firstResponseMinutes: 5, nextResponseMinutes: 10, resolutionHours: 2, appliesToPriority: "urgent" }
];

export const mockCannedReplies: CannedReply[] = [
  {
    id: "reply-hello",
    title: "Greeting",
    shortcut: "/hello",
    body: "สวัสดีครับ สนใจสอบถามเรื่องไหนครับ",
    tags: ["hello", "start"],
    category: "general",
    isActive: true
  },
  {
    id: "reply-price",
    title: "Pricing package",
    shortcut: "/price",
    body: "แพ็กเกจเริ่มต้น 1,990 บาทต่อเดือนครับ ถ้าต้องการใช้งานหลายช่องทางหรือมี SLA ทีมขายช่วยประเมินแพ็กเกจที่เหมาะให้ได้ครับ",
    tags: ["pricing", "sales"],
    category: "sales",
    isActive: true
  },
  {
    id: "reply-followup",
    title: "Follow up",
    shortcut: "/followup",
    body: "ขออนุญาตติดตามผลครับ ยังสนใจให้ทีมงานช่วยดูรายละเอียดต่อไหมครับ",
    tags: ["followup"],
    category: "sales",
    isActive: true
  },
  {
    id: "reply-human",
    title: "Human review",
    shortcut: "/human",
    body: "เดี๋ยวแอดมินตรวจสอบให้ครับ",
    tags: ["handoff", "support"],
    category: "support",
    isActive: true
  }
];

export function createDefaultAdminStore(): AdminStore {
  return recalculateAgentCounts({
    agents: mockAgents,
    assignments: [
      createAssignment("assign-web-01", "conv-web-01", "agent-may", "agent-ton", baseTime, "active"),
      createAssignment("assign-fb-01", "conv-facebook-01", "agent-ton", "agent-ton", baseTime, "active")
    ],
    slaPolicies: mockSlaPolicies,
    slaStates: [
      createSlaState("conv-web-01", "2026-05-20T03:46:00.000Z", "2026-05-20T04:00:00.000Z", "2026-05-20T11:40:00.000Z"),
      createSlaState("conv-web-02", "2026-05-20T04:30:00.000Z", "2026-05-20T05:40:00.000Z", "2026-05-21T03:40:00.000Z"),
      createSlaState("conv-telegram-01", "2026-05-20T03:30:00.000Z", "2026-05-20T03:50:00.000Z", "2026-05-20T10:40:00.000Z"),
      createSlaState("conv-line-01", "2026-05-20T04:20:00.000Z", "2026-05-20T05:20:00.000Z", "2026-05-21T03:40:00.000Z"),
      createSlaState("conv-facebook-01", "2026-05-19T07:00:00.000Z", "2026-05-19T08:00:00.000Z", "2026-05-20T03:40:00.000Z", "ok"),
      createSlaState("conv-instagram-01", "2026-05-20T03:35:00.000Z", "2026-05-20T04:20:00.000Z", "2026-05-20T11:40:00.000Z")
    ],
    internalNotes: [
      createNote("note-web-01", "conv-web-01", "contact-anya", "ลูกค้าถามเรื่อง SLA และ migration ให้ supervisor ช่วยดูส่วนลด", "supervisor", true),
      createNote("note-tg-01", "conv-telegram-01", "contact-krit", "ตรวจ quote template ก่อนตอบกลับ", "team", true)
    ],
    cannedReplies: mockCannedReplies,
    auditLogs: [
      createAuditLog("audit-seed-assign-web", "agent-ton", "assign", "conversation", "conv-web-01", { agentId: "agent-may" }, baseTime),
      createAuditLog("audit-seed-note-web", "agent-may", "note_create", "conversation", "conv-web-01", { noteId: "note-web-01" }, baseTime)
    ],
    activityStates: [
      { conversationId: "conv-web-01", viewingAgentIds: ["agent-beam"], typingAgentIds: ["agent-beam"], editingAgentIds: [] },
      { conversationId: "conv-telegram-01", viewingAgentIds: ["agent-may"], typingAgentIds: [], editingAgentIds: ["agent-may"] }
    ],
    conversationMeta: [
      { conversationId: "conv-web-01", priority: "high", status: "open", aiAutoReplyEnabled: false, followUpMarked: true, summaryCopied: false },
      { conversationId: "conv-web-02", priority: "medium", status: "open", aiAutoReplyEnabled: true, followUpMarked: false, summaryCopied: false },
      { conversationId: "conv-telegram-01", priority: "urgent", status: "open", aiAutoReplyEnabled: false, followUpMarked: false, summaryCopied: false },
      { conversationId: "conv-line-01", priority: "low", status: "pending", aiAutoReplyEnabled: true, followUpMarked: false, summaryCopied: false },
      { conversationId: "conv-facebook-01", priority: "low", status: "closed", aiAutoReplyEnabled: false, followUpMarked: false, summaryCopied: false },
      { conversationId: "conv-instagram-01", priority: "medium", status: "spam", aiAutoReplyEnabled: false, followUpMarked: false, summaryCopied: false }
    ],
    tasks: [
      { id: "task-web-01", conversationId: "conv-web-01", contactId: "contact-anya", title: "ส่งราคา Business พร้อม SLA", status: "open", createdBy: "agent-may", createdAt: baseTime }
    ]
  });
}

export function assignConversation(store: AdminStore, conversationId: string, agentId: string, actorId = currentMockAgentId, at = new Date()) {
  const active = getActiveAssignment(store, conversationId);
  const now = at.toISOString();
  const nextAssignments = store.assignments.map((assignment) =>
    assignment.conversationId === conversationId && assignment.status === "active"
      ? { ...assignment, status: active?.agentId === agentId ? "released" as const : "transferred" as const }
      : assignment
  );
  const action = active && active.agentId !== agentId ? "transfer" : "assign";
  const assignment = createAssignment(`assign-${conversationId}-${agentId}-${at.getTime()}`, conversationId, agentId, actorId, now, "active");

  return recalculateAgentCounts({
    ...store,
    assignments: [...nextAssignments, assignment],
    auditLogs: [
      createAuditLog(`audit-${action}-${conversationId}-${at.getTime()}`, actorId, action, "conversation", conversationId, {
        fromAgentId: active?.agentId,
        agentId
      }, now),
      ...store.auditLogs
    ]
  });
}

export function transferConversation(store: AdminStore, conversationId: string, agentId: string, actorId = currentMockAgentId, at = new Date()) {
  return assignConversation(store, conversationId, agentId, actorId, at);
}

export function unassignConversation(store: AdminStore, conversationId: string, actorId = currentMockAgentId, at = new Date()) {
  const active = getActiveAssignment(store, conversationId);
  const now = at.toISOString();

  return recalculateAgentCounts({
    ...store,
    assignments: store.assignments.map((assignment) =>
      assignment.conversationId === conversationId && assignment.status === "active"
        ? { ...assignment, status: "released" as const }
        : assignment
    ),
    auditLogs: [
      createAuditLog(`audit-unassign-${conversationId}-${at.getTime()}`, actorId, "unassign", "conversation", conversationId, {
        fromAgentId: active?.agentId
      }, now),
      ...store.auditLogs
    ]
  });
}

export function setConversationPriority(
  store: AdminStore,
  conversationId: string,
  priority: ConversationPriority,
  actorId = currentMockAgentId,
  at = new Date()
) {
  const currentPriority = getConversationPriority(store, conversationId);
  if (currentPriority === priority) return store;

  return updateConversationMeta(store, conversationId, { priority }, (next) => ({
    ...next,
    auditLogs: [
      createAuditLog(`audit-priority-${conversationId}-${at.getTime()}`, actorId, "priority_change", "conversation", conversationId, {
        from: currentPriority,
        to: priority
      }, at.toISOString()),
      ...next.auditLogs
    ]
  }));
}

export function applyAiPriorityPolicy(store: AdminStore, conversation: Pick<ConversationCard, "id" | "aiAnalysis" | "intent" | "lastMessage">) {
  const intent = conversation.aiAnalysis?.intent ?? inferIntent(conversation.intent, conversation.lastMessage);
  if (intent === "refund" || intent === "complaint") return setConversationPriority(store, conversation.id, "urgent", "ai-policy", new Date(baseTime));
  if (intent === "human_request") return setConversationPriority(store, conversation.id, "high", "ai-policy", new Date(baseTime));
  return store;
}

export function setConversationStatus(
  store: AdminStore,
  conversationId: string,
  status: ConversationStatus,
  actorId = currentMockAgentId,
  at = new Date()
) {
  const currentStatus = getConversationStatus(store, conversationId);
  if (currentStatus === status) return store;

  return updateConversationMeta(store, conversationId, {
    status,
    followUpMarked: status === "follow_up" ? true : getConversationMeta(store, conversationId).followUpMarked
  }, (next) => ({
    ...next,
    auditLogs: [
      createAuditLog(`audit-status-${conversationId}-${at.getTime()}`, actorId, "status_change", "conversation", conversationId, {
        from: currentStatus,
        to: status
      }, at.toISOString()),
      ...next.auditLogs
    ]
  }));
}

export function takeOverConversation(store: AdminStore, conversationId: string, actorId = currentMockAgentId, at = new Date()) {
  const assigned = getActiveAssignment(store, conversationId);
  const next = assigned?.agentId === actorId ? store : assignConversation(store, conversationId, actorId, actorId, at);
  return updateConversationMeta(next, conversationId, { aiAutoReplyEnabled: false }, (updated) => ({
    ...updated,
    auditLogs: [
      createAuditLog(`audit-take-over-${conversationId}-${at.getTime()}`, actorId, "take_over", "conversation", conversationId, {}, at.toISOString()),
      ...updated.auditLogs
    ]
  }));
}

export function returnConversationToAi(store: AdminStore, conversationId: string, actorId = currentMockAgentId, at = new Date()) {
  return updateConversationMeta(store, conversationId, { aiAutoReplyEnabled: true }, (next) => ({
    ...next,
    auditLogs: [
      createAuditLog(`audit-return-ai-${conversationId}-${at.getTime()}`, actorId, "return_to_ai", "conversation", conversationId, {}, at.toISOString()),
      ...next.auditLogs
    ]
  }));
}

export function createConversationTask(store: AdminStore, conversationId: string, contactId: string, actorId = currentMockAgentId, at = new Date(), title = "Follow up customer") {
  const task: AdminTask = {
    id: `task-${conversationId}-${at.getTime()}`,
    conversationId,
    contactId,
    title,
    status: "open",
    createdBy: actorId,
    createdAt: at.toISOString()
  };

  return {
    ...store,
    tasks: [task, ...store.tasks],
    auditLogs: [
      createAuditLog(`audit-task-${conversationId}-${at.getTime()}`, actorId, "task_create", "conversation", conversationId, { taskId: task.id }, at.toISOString()),
      ...store.auditLogs
    ]
  };
}

export function copyConversationSummary(store: AdminStore, conversationId: string, actorId = currentMockAgentId, at = new Date()) {
  return updateConversationMeta(store, conversationId, { summaryCopied: true }, (next) => ({
    ...next,
    auditLogs: [
      createAuditLog(`audit-copy-summary-${conversationId}-${at.getTime()}`, actorId, "copy_summary", "conversation", conversationId, {}, at.toISOString()),
      ...next.auditLogs
    ]
  }));
}

export function addInternalNote(
  store: AdminStore,
  conversationId: string,
  contactId: string,
  body: string,
  visibility: InternalNoteVisibility = "team",
  actorId = currentMockAgentId,
  at = new Date()
) {
  const note = createNote(`note-${conversationId}-${at.getTime()}`, conversationId, contactId, body, visibility, false, actorId, at.toISOString());
  return {
    ...store,
    internalNotes: [note, ...store.internalNotes],
    auditLogs: [
      createAuditLog(`audit-note-create-${conversationId}-${at.getTime()}`, actorId, "note_create", "conversation", conversationId, { noteId: note.id }, at.toISOString()),
      ...store.auditLogs
    ]
  };
}

export function updateInternalNote(store: AdminStore, noteId: string, body: string, actorId = currentMockAgentId, at = new Date()) {
  const note = store.internalNotes.find((item) => item.id === noteId);
  return {
    ...store,
    internalNotes: store.internalNotes.map((item) => item.id === noteId ? { ...item, body, updatedAt: at.toISOString() } : item),
    auditLogs: note ? [
      createAuditLog(`audit-note-update-${note.conversationId}-${at.getTime()}`, actorId, "note_update", "conversation", note.conversationId, { noteId }, at.toISOString()),
      ...store.auditLogs
    ] : store.auditLogs
  };
}

export function deleteInternalNote(store: AdminStore, noteId: string, actorId = currentMockAgentId, at = new Date()) {
  const note = store.internalNotes.find((item) => item.id === noteId);
  return {
    ...store,
    internalNotes: store.internalNotes.filter((item) => item.id !== noteId),
    auditLogs: note ? [
      createAuditLog(`audit-note-delete-${note.conversationId}-${at.getTime()}`, actorId, "note_delete", "conversation", note.conversationId, { noteId }, at.toISOString()),
      ...store.auditLogs
    ] : store.auditLogs
  };
}

export function pinInternalNote(store: AdminStore, noteId: string, pinned = true, actorId = currentMockAgentId, at = new Date()) {
  const note = store.internalNotes.find((item) => item.id === noteId);
  return {
    ...store,
    internalNotes: store.internalNotes.map((item) => item.id === noteId ? { ...item, pinned, updatedAt: at.toISOString() } : item),
    auditLogs: note ? [
      createAuditLog(`audit-note-pin-${note.conversationId}-${at.getTime()}`, actorId, "note_update", "conversation", note.conversationId, { noteId, pinned }, at.toISOString()),
      ...store.auditLogs
    ] : store.auditLogs
  };
}

export function getVisibleInternalNotes(store: AdminStore, conversationId: string, viewerRole: Agent["role"] = "agent") {
  return store.internalNotes.filter((note) => {
    if (note.conversationId !== conversationId) return false;
    return note.visibility === "team" || viewerRole === "supervisor" || viewerRole === "admin" || viewerRole === "owner";
  });
}

export function searchCannedReplies(store: AdminStore, query: string, category = "all", tag = "all") {
  const normalized = query.trim().toLowerCase();
  return store.cannedReplies.filter((reply) => {
    if (!reply.isActive) return false;
    if (category !== "all" && reply.category !== category) return false;
    if (tag !== "all" && !reply.tags.includes(tag)) return false;
    if (!normalized) return true;
    return [reply.title, reply.shortcut, reply.body, reply.category, ...reply.tags].some((value) => value.toLowerCase().includes(normalized));
  });
}

export function findCannedReplyBySlash(store: AdminStore, slashCommand: string) {
  const command = slashCommand.trim().split(/\s+/)[0]?.toLowerCase();
  return store.cannedReplies.find((reply) => reply.isActive && reply.shortcut.toLowerCase() === command) ?? null;
}

export function recordCannedReplyUsed(store: AdminStore, conversationId: string, replyId: string, actorId = currentMockAgentId, at = new Date()) {
  return {
    ...store,
    auditLogs: [
      createAuditLog(`audit-canned-${conversationId}-${at.getTime()}`, actorId, "canned_reply_used", "conversation", conversationId, { replyId }, at.toISOString()),
      ...store.auditLogs
    ]
  };
}

export function recordUseAiDraft(store: AdminStore, conversationId: string, actorId = currentMockAgentId, at = new Date()) {
  return {
    ...store,
    auditLogs: [
      createAuditLog(`audit-ai-draft-${conversationId}-${at.getTime()}`, actorId, "use_ai_draft", "conversation", conversationId, {}, at.toISOString()),
      ...store.auditLogs
    ]
  };
}

export function getCollisionWarning(store: AdminStore, conversationId: string, viewerAgentId = currentMockAgentId) {
  const activity = store.activityStates.find((state) => state.conversationId === conversationId);
  const typingAgents = (activity?.typingAgentIds ?? []).filter((agentId) => agentId !== viewerAgentId).map((agentId) => getAgentName(store, agentId));
  const viewingAgents = (activity?.viewingAgentIds ?? []).filter((agentId) => agentId !== viewerAgentId).map((agentId) => getAgentName(store, agentId));
  const assignment = getActiveAssignment(store, conversationId);
  const assignedAgent = assignment ? getAgent(store, assignment.agentId) : null;

  return {
    hasTypingWarning: typingAgents.length > 0,
    typingText: typingAgents.length > 0 ? "มีแอดมินอีกคนกำลังตอบเคสนี้" : "",
    viewingText: viewingAgents.length > 0 ? `Agent viewing: ${viewingAgents.join(", ")}` : "",
    ownerText: assignedAgent ? `Assigned to ${assignedAgent.name}` : "Unassigned",
    lockedByAssignment: Boolean(assignedAgent && assignedAgent.id !== viewerAgentId)
  };
}

export function canAiAutoReply(store: AdminStore, conversationId: string) {
  const meta = getConversationMeta(store, conversationId);
  return meta.aiAutoReplyEnabled;
}

export function shouldMockAiAutoReply(store: AdminStore, conversationId: string, decision: Pick<AIDecision, "requiresHuman"> | null | undefined) {
  return canAiAutoReply(store, conversationId) && !decision?.requiresHuman;
}

export function evaluateSlaState(state: SlaState, now = new Date()) {
  const dueDates = [
    { label: "first response", date: new Date(state.firstResponseDueAt) },
    { label: "next response", date: new Date(state.nextResponseDueAt) },
    { label: "resolution", date: new Date(state.resolutionDueAt) }
  ];
  const breached = dueDates.find((due) => due.date.getTime() < now.getTime());
  if (breached) {
    return {
      ...state,
      status: "breached" as const,
      breachedReason: `${breached.label} overdue`
    };
  }

  const warning = dueDates.find((due) => due.date.getTime() - now.getTime() <= 5 * 60 * 1000);
  if (warning) {
    return {
      ...state,
      status: "warning" as const,
      breachedReason: `${warning.label} due soon`
    };
  }

  return { ...state, status: "ok" as const, breachedReason: undefined };
}

export function refreshSlaStates(store: AdminStore, now = new Date()) {
  return {
    ...store,
    slaStates: store.slaStates.map((state) => evaluateSlaState(state, now))
  };
}

export function getSlaState(store: AdminStore, conversationId: string) {
  return store.slaStates.find((state) => state.conversationId === conversationId) ?? null;
}

export function getSlaDisplay(state: SlaState | null, now = new Date()) {
  if (!state) return { status: "ok" as SlaStatus, text: "No SLA" };
  const evaluated = evaluateSlaState(state, now);
  const nextDue = new Date(evaluated.firstResponseDueAt);
  const deltaMs = nextDue.getTime() - now.getTime();
  const minutes = Math.ceil(Math.abs(deltaMs) / 60000);

  return {
    status: evaluated.status,
    text: evaluated.status === "breached" ? `${minutes}m overdue` : `${minutes}m left`
  };
}

export function filterAdminConversations(
  conversations: ConversationCard[],
  store: AdminStore,
  filter: AdminConversationFilter,
  currentAgentId = currentMockAgentId
) {
  return conversations.filter((conversation) => {
    const assignment = getActiveAssignment(store, conversation.id);
    const status = getConversationStatus(store, conversation.id);
    const slaStatus = getSlaState(store, conversation.id)?.status;

    switch (filter) {
      case "my":
        return assignment?.agentId === currentAgentId;
      case "unassigned":
        return !assignment;
      case "sla_warning":
        return slaStatus === "warning";
      case "sla_breached":
        return slaStatus === "breached";
      case "follow_up":
        return status === "follow_up" || getConversationMeta(store, conversation.id).followUpMarked;
      case "closed":
        return status === "closed" || status === "resolved";
      case "spam":
        return status === "spam";
      default:
        return true;
    }
  });
}

export function filterConversationsByAgent(conversations: ConversationCard[], store: AdminStore, agentId: string) {
  if (agentId === "all") return conversations;
  return conversations.filter((conversation) => getActiveAssignment(store, conversation.id)?.agentId === agentId);
}

export function sortConversationsByPriority(conversations: ConversationCard[], store: AdminStore) {
  return [...conversations].sort((a, b) => {
    const priorityDelta = priorityRank(getConversationPriority(store, b.id)) - priorityRank(getConversationPriority(store, a.id));
    return priorityDelta || a.customerName.localeCompare(b.customerName);
  });
}

export function getAuditLogsForConversation(store: AdminStore, conversationId: string, contactId?: string) {
  return store.auditLogs.filter((log) =>
    (log.targetType === "conversation" && log.targetId === conversationId) ||
    Boolean(contactId && log.targetType === "contact" && log.targetId === contactId)
  );
}

export function getOpenAdminTasks(store: AdminStore, conversationId: string, contactId?: string) {
  return store.tasks.filter((task) => task.status === "open" && (task.conversationId === conversationId || task.contactId === contactId));
}

export function getActiveAssignment(store: AdminStore, conversationId: string) {
  return store.assignments.find((assignment) => assignment.conversationId === conversationId && assignment.status === "active") ?? null;
}

export function getAssignedAgent(store: AdminStore, conversationId: string) {
  const assignment = getActiveAssignment(store, conversationId);
  return assignment ? getAgent(store, assignment.agentId) : null;
}

export function getAgent(store: AdminStore, agentId: string) {
  return store.agents.find((agent) => agent.id === agentId) ?? null;
}

export function getAgentName(store: AdminStore, agentId: string) {
  return getAgent(store, agentId)?.name ?? agentId;
}

export function getConversationPriority(store: AdminStore, conversationId: string) {
  return getConversationMeta(store, conversationId).priority;
}

export function getConversationStatus(store: AdminStore, conversationId: string) {
  return getConversationMeta(store, conversationId).status;
}

export function getConversationMeta(store: AdminStore, conversationId: string): ConversationAdminMeta {
  return store.conversationMeta.find((meta) => meta.conversationId === conversationId) ?? {
    conversationId,
    priority: "medium",
    status: "open",
    aiAutoReplyEnabled: true,
    followUpMarked: false,
    summaryCopied: false
  };
}

export function saveStoredAdminStore(store: AdminStore) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(adminStoreStorageKey, JSON.stringify(store));
  window.dispatchEvent(new CustomEvent(adminStoreStorageKey, { detail: store }));
}

export function getStoredAdminStore() {
  if (typeof window === "undefined") return createDefaultAdminStore();

  try {
    const raw = window.localStorage.getItem(adminStoreStorageKey);
    return raw ? { ...createDefaultAdminStore(), ...JSON.parse(raw) as AdminStore } : createDefaultAdminStore();
  } catch {
    return createDefaultAdminStore();
  }
}

export function subscribeAdminStore(callback: (store: AdminStore) => void) {
  if (typeof window === "undefined") return () => {};
  const notify = () => callback(getStoredAdminStore());
  const handleStorage = (event: StorageEvent) => {
    if (event.key === adminStoreStorageKey) notify();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(adminStoreStorageKey, notify);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(adminStoreStorageKey, notify);
  };
}

export function withAgentCounts(store: AdminStore) {
  return recalculateAgentCounts(store);
}

function updateConversationMeta(
  store: AdminStore,
  conversationId: string,
  patch: Partial<Omit<ConversationAdminMeta, "conversationId">>,
  finalize: (store: AdminStore) => AdminStore = (next) => next
) {
  const current = getConversationMeta(store, conversationId);
  const nextMeta = { ...current, ...patch };
  const exists = store.conversationMeta.some((meta) => meta.conversationId === conversationId);
  const nextStore = {
    ...store,
    conversationMeta: exists
      ? store.conversationMeta.map((meta) => meta.conversationId === conversationId ? nextMeta : meta)
      : [nextMeta, ...store.conversationMeta]
  };
  return finalize(nextStore);
}

function recalculateAgentCounts(store: AdminStore): AdminStore {
  const activeCounts = new Map<string, number>();
  store.assignments
    .filter((assignment) => assignment.status === "active")
    .forEach((assignment) => activeCounts.set(assignment.agentId, (activeCounts.get(assignment.agentId) ?? 0) + 1));

  return {
    ...store,
    agents: store.agents.map((agent) => ({
      ...agent,
      activeConversationCount: activeCounts.get(agent.id) ?? 0
    }))
  };
}

function priorityRank(priority: ConversationPriority) {
  return { low: 0, medium: 1, high: 2, urgent: 3 }[priority];
}

function inferIntent(intent: string, body: string) {
  const text = `${intent} ${body}`.toLowerCase();
  if (["refund", "คืนเงิน", "ยกเลิก"].some((word) => text.includes(word))) return "refund";
  if (["complaint", "ร้องเรียน", "ผิด", "แย่"].some((word) => text.includes(word))) return "complaint";
  if (["human", "แอดมิน", "เจ้าหน้าที่"].some((word) => text.includes(word))) return "human_request";
  return "unknown";
}

function createAssignment(id: string, conversationId: string, agentId: string, assignedBy: string, assignedAt: string, status: Assignment["status"]): Assignment {
  return { id, conversationId, agentId, assignedBy, assignedAt, status };
}

function createSlaState(
  conversationId: string,
  firstResponseDueAt: string,
  nextResponseDueAt: string,
  resolutionDueAt: string,
  status: SlaStatus = "ok",
  breachedReason?: string
): SlaState {
  return { conversationId, firstResponseDueAt, nextResponseDueAt, resolutionDueAt, status, breachedReason };
}

function createNote(
  id: string,
  conversationId: string,
  contactId: string,
  body: string,
  visibility: InternalNoteVisibility,
  pinned = false,
  createdBy = currentMockAgentId,
  createdAt = baseTime
): InternalNote {
  return { id, conversationId, contactId, ...mockConversationContext(conversationId), body, visibility, createdBy, createdAt, updatedAt: createdAt, pinned };
}

function createAuditLog(id: string, actorId: string, action: string, targetType: string, targetId: string, metadata: Record<string, unknown>, createdAt: string): AuditLog {
  return { id, actorId, action, targetType, targetId, metadata, createdAt };
}

function mockConversationContext(conversationId: string) {
  if (conversationId.includes("telegram")) {
    return { platform: "telegram" as const, channelAccountId: "telegram-bot-007237", roomId: "telegram-bot-007237" };
  }
  if (conversationId.includes("line")) {
    return { platform: "line" as const, channelAccountId: "line-oa-main", roomId: "line-oa-main" };
  }
  if (conversationId.includes("facebook")) {
    return { platform: "facebook" as const, channelAccountId: "facebook-page-main", roomId: "facebook-page-main" };
  }
  if (conversationId.includes("instagram")) {
    return { platform: "instagram" as const, channelAccountId: "instagram-shop", roomId: "instagram-shop" };
  }
  return { platform: "webchat" as const, channelAccountId: "webchat-main", roomId: "webchat-main" };
}
