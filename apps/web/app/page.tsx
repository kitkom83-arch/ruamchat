"use client";

import {
  Archive,
  AlertTriangle,
  BarChart3,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  Clock3,
  Copy,
  Edit3,
  ExternalLink,
  FileText,
  Inbox,
  MessageSquareText,
  PanelRightOpen,
  Paperclip,
  Pin,
  Radio,
  RotateCcw,
  Search,
  ShieldAlert,
  Sparkles,
  Tags,
  Trash2,
  UserMinus,
  UserPlus,
  UserRoundCheck,
  Wifi,
  Workflow
} from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CannedReply, ConversationAuditLog, ConversationFilter, ConversationPriority, ConversationStatus, ConversationStatusHistory, CoreConversationCard, Customer360, Flow, FlowTestRunResult, InternalNoteVisibility, UpdateTaskRequest } from "@ai-omni/shared";
import type { Contact, LeadStatus, AttachmentInput, MediaAttachmentType } from "@ai-omni/shared";
import { validateMediaUpload } from "@ai-omni/shared";
import Link from "next/link";
import {
  appendStoredDemoMessage,
  applyAiSuggestionToConversation,
  applyApiSentMessagesToConversation,
  applyLocalAgentMessageToConversation,
  filterConversations,
  filterOptions,
  getAiDraftText,
  getAiPanelMockActionStatus,
  getQuickRepliesForMode,
  getRoomConversationCount,
  getStoredDemoMessages,
  mapApiConversationToCard,
  mapApiMessageToChatMessage,
  mapApiRoomToPlatformRoom,
  mergeDemoConversation,
  mockConversations,
  platformRooms,
  resolveAttachmentUrl,
  scopeApiConversationsToRoom,
  subscribeDemoConversationInputs,
  webchatDemoConversationId,
  type AiStatus,
  type ChatMessage,
  type ChatAttachment,
  type ConversationCard,
  type InboxTab,
  type PlatformRoom
} from "./inbox-data";
import {
  getContactAnalytics
} from "./analytics-data";
import {
  addInternalNote,
  assignConversation,
  copyConversationSummary,
  createConversationTask,
  createDefaultAdminStore,
  currentMockAgentId,
  deleteInternalNote,
  filterAdminConversations,
  filterConversationsByAgent,
  getAssignedAgent,
  getAuditLogsForConversation,
  getCollisionWarning,
  getConversationPriority,
  getConversationStatus,
  getOpenAdminTasks,
  getSlaDisplay,
  getSlaState,
  getStoredAdminStore,
  getVisibleInternalNotes,
  pinInternalNote,
  recordCannedReplyUsed,
  recordUseAiDraft,
  returnConversationToAi,
  saveStoredAdminStore,
  setConversationPriority,
  setConversationStatus,
  sortConversationsByPriority,
  subscribeAdminStore,
  takeOverConversation,
  transferConversation,
  unassignConversation,
  updateInternalNote,
  type AdminConversationFilter,
  type AdminTask,
  type AdminStore
} from "./admin-data";
import {
  buildInboxFlowTestInput,
  getFlowRunHistory,
  getMatchingFlows,
  getStoredFlowStore,
  loadFlowBuilderData,
  runAndRecordFlow,
  saveStoredFlowStore,
  subscribeFlowStore,
  type FlowRunTestResult,
  type FlowStore
} from "./flow-data";
import { getStoredKnowledgeItems } from "./ai-knowledge-store";
import {
  createDefaultBroadcastStore,
  getBroadcastHistoryForContact,
  getLastCampaignReceived,
  getStoredBroadcastStore,
  subscribeBroadcastStore,
  toggleContactBroadcastOptOut,
  type BroadcastStore
} from "./broadcast-data";
import {
  addContactTag,
  createContactFromIdentity,
  createIdentityFromConversation,
  findContactForConversation,
  getContactConversations,
  getStoredContacts,
  linkIdentityToContact,
  leadStatusOptions,
  markContactTaskDone,
  removeContactTag,
  saveStoredContacts,
  setPrimaryIdentity,
  mockContacts,
  subscribeContacts,
  unlinkIdentity,
  updateContactLeadStatus
} from "./crm-data";
import {
  createContact as createApiContact,
  assignConversation as assignApiConversation,
  closeConversation as closeApiConversation,
  completeConversationWorkflowTask,
  createConversationNote,
  createConversationWorkflowTask,
  getConversationAuditLogs,
  getConversationMessages,
  getConversationNotes,
  getConversationStatusHistory,
  getConversationTasks,
  getConversations,
  getCustomer360,
  getFlowRuns,
  getRooms,
  getSettingsCannedReplies,
  getTaskDashboard,
  defaultApiUserId,
  linkContactIdentity as linkApiContactIdentity,
  returnConversationToAi as returnApiConversationToAi,
  sendAgentMessage as sendApiAgentMessage,
  setConversationFollowUp,
  setPrimaryContactIdentity as setApiPrimaryContactIdentity,
  markAiSuggestionWrong as markApiAiSuggestionWrong,
  suggestAiReply,
  takeOverConversation as takeOverApiConversation,
  testRunApiFlow,
  unlinkContactIdentity as unlinkApiContactIdentity,
  uploadMedia,
  updateCustomer360Consent,
  updateConversationPriority,
  updateConversationReadState,
  updateConversationSla,
  updateConversationStatus,
  updateConversationWorkflowTask,
  updateCustomer360Profile
} from "./api-client";
import { dataMode, isApiMode, isMockMode } from "./data-mode";
import { findCannedReplyInList, getCannedRepliesForMode, mapSettingsCannedReplyToCannedReply, resolveCannedReplyComposerDraft, searchCannedReplyList } from "./settings-data";
import {
  filterTaskDashboardRows,
  mapApiTaskDashboardRows,
  mapMockTaskDashboardRows,
  taskStatusLabel,
  type TaskDashboardDueFilter,
  type TaskDashboardRow,
  type TaskDashboardStatusFilter
} from "./task-dashboard-data";
import {
  actionFeedbackClassName,
  actionFeedbackDurationMs,
  buildNoteSavePayload,
  buildTaskSavePayload,
  getWorkflowEditorCopy,
  shouldShowActionFeedback,
  type InboxActionFeedbackKey,
  type InboxWorkflowEditorMode
} from "./inbox-action-feedback";

const tabOptions: Array<{ id: InboxTab; label: string }> = [
  { id: "human", label: "Human" },
  { id: "bot", label: "Bot" }
];

const aiStatusClass: Record<AiStatus, string> = {
  "AI Off": "off",
  Suggest: "suggest",
  "AI Active": "active",
  "Need Human": "needHuman",
  "Human Taken": "humanTaken",
  Closed: "closed"
};

const adminFilterIds = new Set<ConversationFilter>(["my", "unassigned", "sla_warning", "sla_breached", "follow_up", "closed", "spam"]);
const priorityOptions: ConversationPriority[] = ["low", "medium", "high", "urgent"];
const statusOptions: ConversationStatus[] = ["open", "pending", "follow_up", "resolved", "closed", "spam"];
const conversationStatusFilterOptions: Array<"all" | ConversationStatus> = ["all", "open", "pending", "follow_up", "closed", "spam"];
const conversationPriorityFilterOptions: Array<"all" | ConversationPriority> = ["all", "low", "medium", "high", "urgent"];
const slaFilterOptions: Array<"all" | "ok" | "warning" | "breached"> = ["all", "ok", "warning", "breached"];
const apiConversationPageSize = 25;
const apiAgentIds: Record<string, string> = {
  "agent-may": "00000000-0000-4000-8000-000000000011",
  "agent-ton": "00000000-0000-4000-8000-000000000012",
  "agent-beam": "00000000-0000-4000-8000-000000000013"
};
const unassignedTaskAssignee = "unassigned";

type BroadcastHistoryPanelRow = {
  id: string;
  campaignName: string;
  platform: string;
  channelAccountId?: string | null;
  roomId?: string | null;
  status: string;
  at?: string | null;
};

type PendingAttachment = {
  id: string;
  attachment: AttachmentInput;
  previewUrl: string;
  filename: string;
  mediaType: MediaAttachmentType;
};

export default function InboxDashboard() {
  const apiMode = isApiMode();
  const [rooms, setRooms] = useState<PlatformRoom[]>(() => apiMode ? [] : platformRooms);
  const [roomCounts, setRoomCounts] = useState<Record<string, number>>({});
  const [selectedRoomId, setSelectedRoomId] = useState(() => apiMode ? "" : platformRooms[0]?.id ?? "");
  const [selectedConversationId, setSelectedConversationId] = useState("");
  const [filter, setFilter] = useState<ConversationFilter>("all");
  const [tab, setTab] = useState<InboxTab>("human");
  const [roomSearch, setRoomSearch] = useState("");
  const [conversationSearch, setConversationSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ConversationStatus>("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | ConversationPriority>("all");
  const [unreadFilter, setUnreadFilter] = useState<"all" | "unread" | "read">("all");
  const [slaFilter, setSlaFilter] = useState<"all" | "ok" | "warning" | "breached">("all");
  const [sortOrder, setSortOrder] = useState<"latest_desc" | "latest_asc" | "updated_desc" | "updated_asc">("latest_desc");
  const [conversationLimit, setConversationLimit] = useState(apiConversationPageSize);
  const [hasMoreApiConversations, setHasMoreApiConversations] = useState(false);
  const [conversations, setConversations] = useState<ConversationCard[]>(() => apiMode ? [] : mockConversations);
  const [contacts, setContacts] = useState(mockContacts);
  const [adminStore, setAdminStore] = useState<AdminStore>(() => createDefaultAdminStore());
  const [flowStore, setFlowStore] = useState<FlowStore>(() => apiMode ? { flows: [], runs: [] } : getStoredFlowStore());
  const [broadcastStore, setBroadcastStore] = useState<BroadcastStore>(() => createDefaultBroadcastStore());
  const [lastFlowResult, setLastFlowResult] = useState<FlowTestRunResult | FlowRunTestResult | null>(null);
  const [agentFilter, setAgentFilter] = useState("all");
  const [composer, setComposer] = useState("");
  const [roomsCollapsed, setRoomsCollapsed] = useState(false);
  const [queueCollapsed, setQueueCollapsed] = useState(false);
  const [customerCollapsed, setCustomerCollapsed] = useState(false);
  const [panelsHydrated, setPanelsHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const narrow = window.matchMedia("(max-width: 1280px)").matches;
    const readCollapsed = (key: string, fallback: boolean) => {
      const stored = window.localStorage.getItem(key);
      return stored === null ? fallback : stored === "true";
    };
    setRoomsCollapsed(readCollapsed("ao.inbox.rooms.collapsed", narrow));
    setQueueCollapsed(readCollapsed("ao.inbox.queue.collapsed", false));
    setCustomerCollapsed(readCollapsed("ao.inbox.customer.collapsed", narrow));
    setPanelsHydrated(true);
  }, []);

  const makePanelToggle = (key: string, setter: (updater: (prev: boolean) => boolean) => void) => () => {
    setter((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(key, String(next));
      } catch {
        // ignore persistence errors (e.g. storage disabled)
      }
      return next;
    });
  };

  const toggleRoomsCollapsed = makePanelToggle("ao.inbox.rooms.collapsed", setRoomsCollapsed);
  const toggleQueueCollapsed = makePanelToggle("ao.inbox.queue.collapsed", setQueueCollapsed);
  const toggleCustomerCollapsed = makePanelToggle("ao.inbox.customer.collapsed", setCustomerCollapsed);

  const [aiActionStatus, setAiActionStatus] = useState("AI actions ready");
  const [cannedSearch, setCannedSearch] = useState("");
  const [cannedCategory, setCannedCategory] = useState("all");
  const [activeWorkflowEditor, setActiveWorkflowEditor] = useState<InboxWorkflowEditorMode | null>(null);
  const [workflowEditorActionKey, setWorkflowEditorActionKey] = useState<InboxActionFeedbackKey | null>(null);
  const [workflowEditorError, setWorkflowEditorError] = useState("");
  const [noteDraft, setNoteDraft] = useState("");
  const [noteVisibility, setNoteVisibility] = useState<InternalNoteVisibility>("team");
  const [taskTitleDraft, setTaskTitleDraft] = useState("");
  const [taskDescriptionDraft, setTaskDescriptionDraft] = useState("");
  const [taskPriorityDraft, setTaskPriorityDraft] = useState<ConversationPriority>("medium");
  const [taskAssigneeDraft, setTaskAssigneeDraft] = useState(currentMockAgentId);
  const [taskDueDraft, setTaskDueDraft] = useState("");
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [apiCustomer360, setApiCustomer360] = useState<Customer360 | null>(null);
  const [apiCustomerLoading, setApiCustomerLoading] = useState(false);
  const [apiCustomerError, setApiCustomerError] = useState("");
  const [apiWorkflowLoading, setApiWorkflowLoading] = useState(false);
  const [apiWorkflowError, setApiWorkflowError] = useState("");
  const [apiActionLoading, setApiActionLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [sendError, setSendError] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const attachInputRef = useRef<HTMLInputElement>(null);
  const [apiCannedReplies, setApiCannedReplies] = useState<CannedReply[]>([]);
  const [apiCannedError, setApiCannedError] = useState("");
  const [apiConversationNotes, setApiConversationNotes] = useState<ReturnType<typeof getVisibleInternalNotes>>([]);
  const [apiConversationTasks, setApiConversationTasks] = useState<AdminTask[]>([]);
  const [apiTaskDashboardTasks, setApiTaskDashboardTasks] = useState<TaskDashboardRow[]>([]);
  const [apiTaskDashboardLoading, setApiTaskDashboardLoading] = useState(false);
  const [apiTaskDashboardError, setApiTaskDashboardError] = useState("");
  const [taskDashboardStatus, setTaskDashboardStatus] = useState<TaskDashboardStatusFilter>("open");
  const [taskDashboardDue, setTaskDashboardDue] = useState<TaskDashboardDueFilter>("all");
  const [taskDashboardAssignee, setTaskDashboardAssignee] = useState("all");
  const [taskDashboardVersion, setTaskDashboardVersion] = useState(0);
  const [taskDashboardCompletingId, setTaskDashboardCompletingId] = useState("");
  const [taskDashboardUpdatingId, setTaskDashboardUpdatingId] = useState("");
  const [pendingTaskConversationId, setPendingTaskConversationId] = useState("");
  const [apiAuditLogs, setApiAuditLogs] = useState<ConversationAuditLog[]>([]);
  const [apiStatusHistory, setApiStatusHistory] = useState<ConversationStatusHistory[]>([]);
  const [apiAuditError, setApiAuditError] = useState("");
  const [apiStatusHistoryError, setApiStatusHistoryError] = useState("");
  const [apiAiLoading, setApiAiLoading] = useState(false);
  const [apiAiError, setApiAiError] = useState("");
  const [lastActionFeedback, setLastActionFeedback] = useState<InboxActionFeedbackKey | null>(null);

  const selectedRoom = rooms.find((room) => room.id === selectedRoomId) ?? rooms[0] ?? platformRooms[0];
  const displayedRooms = useMemo(() => {
    const needle = roomSearch.trim().toLowerCase();
    if (!needle) return rooms;
    return rooms.filter((room) =>
      [room.platformLabel, room.accountName, room.roomName, room.id]
        .some((value) => value.toLowerCase().includes(needle))
    );
  }, [roomSearch, rooms]);
  const visibleConversations = useMemo(() => {
    if (apiMode) return scopeApiConversationsToRoom(conversations, selectedRoom.id);
    const baseFilter = adminFilterIds.has(filter) ? "all" : filter;
    const roomScoped = filterConversations(conversations, selectedRoom.id, baseFilter, tab);
    const adminFiltered = isAdminConversationFilter(filter)
      ? filterAdminConversations(roomScoped, adminStore, filter)
      : roomScoped;
    const agentFiltered = filterConversationsByAgent(adminFiltered, adminStore, agentFilter);
    const searched = filterConversationCardsByKeyword(agentFiltered, conversationSearch);
    const statusFiltered = statusFilter === "all" ? searched : searched.filter((conversation) => conversation.status === statusFilter);
    const priorityFiltered = priorityFilter === "all" ? statusFiltered : statusFiltered.filter((conversation) => conversation.priority === priorityFilter);
    const unreadFiltered = unreadFilter === "all"
      ? priorityFiltered
      : priorityFiltered.filter((conversation) => unreadFilter === "unread" ? conversation.unreadCount > 0 : conversation.unreadCount === 0);
    const slaFiltered = slaFilter === "all" ? unreadFiltered : unreadFiltered.filter((conversation) => (conversation.slaStatus ?? "ok") === slaFilter);
    return sortConversationCards(slaFiltered, sortOrder, adminStore);
  }, [adminStore, agentFilter, apiMode, conversations, conversationSearch, filter, priorityFilter, selectedRoom.id, slaFilter, sortOrder, statusFilter, tab, unreadFilter]);

  const selectedConversation =
    visibleConversations.find((conversation) => conversation.id === selectedConversationId) ?? visibleConversations[0] ?? null;
  const selectedContact = apiMode ? apiCustomer360?.contact ?? null : findContactForConversation(contacts, selectedConversation);
  const selectedContactId = selectedContact?.id ?? selectedConversation?.linkedIdentities[0]?.externalUserId ?? "contact-local";
  const selectedAssignedAgent = selectedConversation ? getAssignedAgent(adminStore, selectedConversation.id) : null;
  const selectedAssignedAgentName = apiMode ? apiCustomer360?.owner ?? selectedConversation?.assignedAgent ?? null : selectedAssignedAgent?.name ?? null;
  const selectedPriority = apiMode && apiCustomer360 ? apiCustomer360.priority : selectedConversation ? getConversationPriority(adminStore, selectedConversation.id) : "medium";
  const selectedStatus = apiMode && apiCustomer360 ? apiCustomer360.status : selectedConversation ? getConversationStatus(adminStore, selectedConversation.id) : "open";
  const selectedSla = selectedConversation ? apiMode ? getApiSlaDisplay(selectedConversation) : getSlaDisplay(getSlaState(adminStore, selectedConversation.id), new Date("2026-05-20T03:42:00.000Z")) : null;
  const selectedNotes = selectedConversation ? apiMode ? apiConversationNotes : getVisibleInternalNotes(adminStore, selectedConversation.id, "supervisor") : [];
  const selectedAuditLogs = selectedConversation ? apiMode ? mapApiAuditLogs(apiAuditLogs) : getAuditLogsForConversation(adminStore, selectedConversation.id, selectedContact?.id) : [];
  const selectedTasks = selectedConversation ? apiMode ? apiConversationTasks.filter((task) => task.status === "open") : getOpenAdminTasks(adminStore, selectedConversation.id, selectedContact?.id) : [];
  const selectedCollision = selectedConversation ? getCollisionWarning(adminStore, selectedConversation.id, currentMockAgentId) : null;
  const contactAnalytics = getContactAnalytics(selectedConversation, conversations, adminStore);
  const matchingFlows = selectedConversation
    ? flowStore.flows.filter((flow) => getMatchingFlows([flow], buildSelectedFlowInput(flow), true).length > 0)
    : [];
  const recentFlowRuns = selectedConversation
    ? flowStore.runs.filter((run) => run.conversationId === selectedConversation.id).slice(0, 3)
    : [];
  const cannedSource = getCannedRepliesForMode(dataMode, apiCannedReplies, adminStore.cannedReplies);
  const cannedReplies = useMemo(
    () => searchCannedReplyList(cannedSource, cannedSearch, cannedCategory),
    [cannedCategory, cannedSearch, cannedSource]
  );
  const visibleQuickReplies = getQuickRepliesForMode(dataMode);
  const taskAssigneeAgents = useMemo(
    () => apiMode ? adminStore.agents.filter((agent) => apiAgentIds[agent.id]) : adminStore.agents,
    [adminStore.agents, apiMode]
  );
  const taskDashboardRows = useMemo(() => {
    if (apiMode) return apiTaskDashboardTasks;
    return filterTaskDashboardRows(
      mapMockTaskDashboardRows(adminStore, conversations),
      {
        status: taskDashboardStatus,
        due: taskDashboardDue,
        assigneeUserId: taskDashboardAssignee,
        roomId: selectedRoom.id
      }
    );
  }, [adminStore, apiMode, apiTaskDashboardTasks, conversations, selectedRoom.id, taskDashboardAssignee, taskDashboardDue, taskDashboardStatus]);

  useEffect(() => {
    if (pendingTaskConversationId) return;
    setSelectedConversationId((current) => {
      if (visibleConversations.some((conversation) => conversation.id === current)) return current;
      return visibleConversations[0]?.id ?? "";
    });
  }, [pendingTaskConversationId, visibleConversations]);

  useEffect(() => {
    if (!pendingTaskConversationId) return;
    if (!visibleConversations.some((conversation) => conversation.id === pendingTaskConversationId)) return;
    setSelectedConversationId(pendingTaskConversationId);
    setPendingTaskConversationId("");
  }, [pendingTaskConversationId, visibleConversations]);

  useEffect(() => {
    if (!lastActionFeedback) return;
    const timeoutId = window.setTimeout(() => setLastActionFeedback(null), actionFeedbackDurationMs);
    return () => window.clearTimeout(timeoutId);
  }, [lastActionFeedback]);

  useEffect(() => {
    if (!apiMode) return;
    if (agentFilter !== "all" && !apiUserIdForAgentId(agentFilter)) setAgentFilter("all");
    if (taskDashboardAssignee !== "all" && !apiUserIdForAgentId(taskDashboardAssignee)) setTaskDashboardAssignee("all");
  }, [agentFilter, apiMode, taskDashboardAssignee]);

  useEffect(() => {
    if (!activeWorkflowEditor) return;
    window.requestAnimationFrame(() => {
      document.querySelector(".workflowEditorPanel")?.scrollIntoView({ block: "nearest" });
    });
  }, [activeWorkflowEditor]);

  useEffect(() => {
    if (!apiMode) return;
    let active = true;
    setApiLoading(true);
    getRooms()
      .then((apiRooms) => {
        if (!active) return;
        setRooms(apiRooms.map(mapApiRoomToPlatformRoom));
        setRoomCounts(Object.fromEntries(apiRooms.map((room) => [room.id, room.conversationCount])));
        setSelectedRoomId((current) => apiRooms.some((room) => room.id === current) ? current : apiRooms[0]?.id ?? "");
        setApiError("");
      })
      .catch((error) => {
        if (active) setApiError(readableApiError(error));
      })
      .finally(() => {
        if (active) setApiLoading(false);
      });
    return () => {
      active = false;
    };
  }, [apiMode]);

  useEffect(() => {
    if (!apiMode) return;
    let active = true;
    setApiCannedError("");
    getSettingsCannedReplies()
      .then((replies) => {
        if (!active) return;
        setApiCannedReplies(replies.map(mapSettingsCannedReplyToCannedReply));
      })
      .catch((error) => {
        if (!active) return;
        setApiCannedReplies([]);
        setApiCannedError(readableApiError(error));
      });
    return () => {
      active = false;
    };
  }, [apiMode]);

  useEffect(() => {
    setConversationLimit(apiConversationPageSize);
  }, [agentFilter, conversationSearch, filter, priorityFilter, selectedRoomId, slaFilter, sortOrder, statusFilter, tab, unreadFilter]);

  useEffect(() => {
    if (!apiMode || !selectedRoomId || !rooms.some((room) => room.id === selectedRoomId)) return;
    let active = true;
    const requestedRoomId = selectedRoomId;
    const requestedRoom = rooms.find((room) => room.id === requestedRoomId);
    setApiLoading(true);
    getConversations(requestedRoomId, {
      tab,
      filter,
      agentId: agentFilter === "all" ? undefined : apiAgentIds[agentFilter] ?? agentFilter,
      search: conversationSearch,
      platform: requestedRoom?.platform,
      channelAccountId: requestedRoom?.channelAccountId,
      status: statusFilter,
      priority: priorityFilter,
      unread: unreadFilter,
      slaStatus: slaFilter,
      sort: sortOrder,
      limit: conversationLimit,
      offset: 0
    })
      .then((items) => {
        if (!active) return;
        setConversations(scopeApiConversationsToRoom(items.map((item) => mapApiConversationToCard(item)), requestedRoomId));
        setHasMoreApiConversations(items.length === conversationLimit);
        setApiError("");
      })
      .catch((error) => {
        if (active) {
          setConversations([]);
          setHasMoreApiConversations(false);
          setApiError(readableApiError(error));
        }
      })
      .finally(() => {
        if (active) setApiLoading(false);
      });
    return () => {
      active = false;
    };
  }, [agentFilter, apiMode, conversationLimit, conversationSearch, filter, priorityFilter, rooms, selectedRoomId, slaFilter, sortOrder, statusFilter, tab, unreadFilter]);

  useEffect(() => {
    if (!apiMode || !selectedConversation?.id) return;
    setSendError("");
    let active = true;
    getConversationMessages(selectedConversation.id)
      .then((items) => {
        if (!active) return;
        const mappedMessages = items.map(mapApiMessageToChatMessage);
        setConversations((current) =>
          current.map((conversation) =>
            conversation.id === selectedConversation.id
              ? { ...conversation, messages: mappedMessages }
              : conversation
          )
        );
        setApiError("");
      })
      .catch((error) => {
        if (active) setApiError(readableApiError(error));
      });
    const timer = window.setInterval(() => {
      void getConversationMessages(selectedConversation.id)
        .then((items) => {
          const mappedMessages = items.map(mapApiMessageToChatMessage);
          setConversations((current) =>
            current.map((conversation) =>
              conversation.id === selectedConversation.id
                ? { ...conversation, messages: mappedMessages }
                : conversation
            )
          );
        })
        .catch((error) => setApiError(readableApiError(error)));
    }, 2500);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [apiMode, selectedConversation?.id]);

  useEffect(() => {
    if (!apiMode) return;
    if (!selectedConversation?.id) {
      setApiAiError("");
      setApiAiLoading(false);
      return;
    }
    let active = true;
    const conversationId = selectedConversation.id;
    setApiAiLoading(true);
    setApiAiError("");
    suggestAiReply(conversationId)
      .then((suggestion) => {
        if (!active) return;
        setConversations((current) =>
          current.map((conversation) =>
            conversation.id === conversationId
              ? applyAiSuggestionToConversation(conversation, suggestion)
              : conversation
          )
        );
        setAiActionStatus("AI suggestion loaded from API");
      })
      .catch((error) => {
        if (!active) return;
        setApiAiError(readableApiError(error));
        setAiActionStatus("AI suggestion API error");
      })
      .finally(() => {
        if (active) setApiAiLoading(false);
      });
    return () => {
      active = false;
    };
  }, [apiMode, selectedConversation?.id]);

  useEffect(() => {
    if (!apiMode) return;
    if (!selectedConversation?.id) {
      setApiCustomer360(null);
      setApiCustomerError("");
      setApiCustomerLoading(false);
      return;
    }
    let active = true;
    const conversationId = selectedConversation.id;
    setApiCustomerLoading(true);
    setApiCustomerError("");
    getCustomer360(conversationId)
      .then((customer360) => {
        if (!active) return;
        setApiCustomer360(customer360);
      })
      .catch((error) => {
        if (!active) return;
        setApiCustomer360(null);
        setApiCustomerError(readableApiError(error));
      })
      .finally(() => {
        if (active) setApiCustomerLoading(false);
      });
    return () => {
      active = false;
    };
  }, [apiMode, selectedConversation?.id]);

  useEffect(() => {
    if (!apiMode) return;
    if (!selectedConversation?.id) {
      setApiConversationNotes([]);
      setApiConversationTasks([]);
      setApiAuditLogs([]);
      setApiStatusHistory([]);
      setApiWorkflowError("");
      setApiAuditError("");
      setApiStatusHistoryError("");
      setApiWorkflowLoading(false);
      return;
    }
    let active = true;
    const conversationId = selectedConversation.id;
    setApiWorkflowLoading(true);
    setApiWorkflowError("");
    setApiAuditError("");
    setApiStatusHistoryError("");
    Promise.allSettled([
      getConversationNotes(conversationId),
      getConversationTasks(conversationId),
      getConversationAuditLogs(conversationId),
      getConversationStatusHistory(conversationId)
    ])
      .then(([notesResult, tasksResult, auditResult, statusHistoryResult]) => {
        if (!active) return;
        if (notesResult.status === "fulfilled") setApiConversationNotes(notesResult.value);
        else {
          setApiConversationNotes([]);
          setApiWorkflowError(readableApiError(notesResult.reason));
        }
        if (tasksResult.status === "fulfilled") setApiConversationTasks(tasksResult.value.map(mapApiWorkflowTaskToAdminTask));
        else {
          setApiConversationTasks([]);
          setApiWorkflowError(readableApiError(tasksResult.reason));
        }
        if (auditResult.status === "fulfilled") setApiAuditLogs(auditResult.value);
        else {
          setApiAuditLogs([]);
          setApiAuditError(readableApiError(auditResult.reason));
        }
        if (statusHistoryResult.status === "fulfilled") setApiStatusHistory(statusHistoryResult.value);
        else {
          setApiStatusHistory([]);
          setApiStatusHistoryError(readableApiError(statusHistoryResult.reason));
        }
      })
      .finally(() => {
        if (active) setApiWorkflowLoading(false);
      });
    return () => {
      active = false;
    };
  }, [apiMode, selectedConversation?.id]);

  useEffect(() => {
    if (!apiMode) return;
    if (!selectedRoomId) {
      setApiTaskDashboardTasks([]);
      setApiTaskDashboardError("");
      setApiTaskDashboardLoading(false);
      return;
    }
    let active = true;
    setApiTaskDashboardLoading(true);
    setApiTaskDashboardError("");
    getTaskDashboard({
      status: taskDashboardStatus,
      due: taskDashboardDue,
      assigneeUserId: taskDashboardAssignee === "all" ? undefined : apiAgentIds[taskDashboardAssignee] ?? taskDashboardAssignee,
      roomId: selectedRoomId,
      limit: 50,
      offset: 0
    })
      .then((tasks) => {
        if (!active) return;
        setApiTaskDashboardTasks(mapApiTaskDashboardRows(tasks));
        setApiTaskDashboardError("");
      })
      .catch((error) => {
        if (!active) return;
        setApiTaskDashboardTasks([]);
        setApiTaskDashboardError(readableApiError(error));
      })
      .finally(() => {
        if (active) setApiTaskDashboardLoading(false);
      });
    return () => {
      active = false;
    };
  }, [apiMode, selectedRoomId, taskDashboardAssignee, taskDashboardDue, taskDashboardStatus, taskDashboardVersion]);

  useEffect(() => {
    if (!isMockMode()) return;
    setConversations(mergeDemoConversation(mockConversations, getStoredDemoMessages(), getStoredKnowledgeItems()));
    return subscribeDemoConversationInputs((messages, knowledgeItems) => {
      setConversations(mergeDemoConversation(mockConversations, messages, knowledgeItems));
    });
  }, []);

  useEffect(() => {
    setContacts(getStoredContacts());
    return subscribeContacts(setContacts);
  }, []);

  useEffect(() => {
    setAdminStore(getStoredAdminStore());
    return subscribeAdminStore(setAdminStore);
  }, []);

  useEffect(() => {
    if (apiMode) return;
    setFlowStore(getStoredFlowStore());
    return subscribeFlowStore(setFlowStore);
  }, [apiMode]);

  useEffect(() => {
    if (!apiMode) return;
    let active = true;
    setApiWorkflowError("");
    loadFlowBuilderData("api")
      .then((data) => {
        if (!active) return;
        setFlowStore(data.store);
        setApiWorkflowError("");
      })
      .catch((error) => {
        if (!active) return;
        setFlowStore({ flows: [], runs: [] });
        setApiWorkflowError(readableApiError(error));
      });
    return () => {
      active = false;
    };
  }, [apiMode]);

  useEffect(() => {
    setBroadcastStore(getStoredBroadcastStore());
    return subscribeBroadcastStore(setBroadcastStore);
  }, []);

  function updateContacts(nextContacts: Contact[]) {
    setContacts(nextContacts);
    saveStoredContacts(nextContacts);
  }

  function applyApiContact(contact: Contact) {
    setApiCustomer360((current) => current ? { ...current, contact, identities: contact.identities } : current);
  }

  async function runApiContactAction(action: () => Promise<Contact>, successMessage: string) {
    setApiActionLoading(true);
    try {
      const contact = await action();
      applyApiContact(contact);
      if (selectedConversation) {
        const customer360 = await getCustomer360(selectedConversation.id);
        setApiCustomer360(customer360);
        await refreshApiConversationTimeline(selectedConversation.id);
      }
      setAiActionStatus(successMessage);
    } catch (error) {
      setAiActionStatus(readableApiError(error));
    } finally {
      setApiActionLoading(false);
    }
  }

  async function runApiCustomer360Action(action: () => Promise<Customer360>, successMessage: string) {
    setApiActionLoading(true);
    try {
      const customer360 = await action();
      setApiCustomer360(customer360);
      if (selectedConversation) await refreshApiConversationTimeline(selectedConversation.id);
      setApiCustomerError("");
      setAiActionStatus(successMessage);
    } catch (error) {
      const message = readableApiError(error);
      setApiCustomerError(message);
      setAiActionStatus(message);
    } finally {
      setApiActionLoading(false);
    }
  }

  function updateAdminStore(nextStore: AdminStore) {
    setAdminStore(nextStore);
    saveStoredAdminStore(nextStore);
  }

  function updateFlowStore(nextStore: FlowStore) {
    setFlowStore(nextStore);
    saveStoredFlowStore(nextStore);
  }

  function selectRoom(roomId: string) {
    setSelectedRoomId(roomId);
    setFilter("all");
    setSelectedConversationId("");
  }

  function markActionFeedback(actionKey: InboxActionFeedbackKey, outcome: "opened" | "succeeded" = "succeeded") {
    if (shouldShowActionFeedback(outcome)) setLastActionFeedback(actionKey);
  }

  function openAddNoteFlow(actionKey: InboxActionFeedbackKey) {
    if (!selectedConversation) return;
    setActiveWorkflowEditor("note");
    setWorkflowEditorActionKey(actionKey);
    setWorkflowEditorError("");
    setNoteDraft("");
    setAiActionStatus("Add note flow opened");
    markActionFeedback(actionKey, "opened");
  }

  function openCreateTaskFlow(actionKey: InboxActionFeedbackKey) {
    if (!selectedConversation) return;
    setActiveWorkflowEditor("task");
    setWorkflowEditorActionKey(actionKey);
    setWorkflowEditorError("");
    setTaskTitleDraft("");
    setTaskDescriptionDraft("");
    setTaskPriorityDraft(selectedPriority);
    setTaskAssigneeDraft(currentMockAgentId);
    setTaskDueDraft("");
    setAiActionStatus("Create task flow opened");
    markActionFeedback(actionKey, "opened");
  }

  function cancelWorkflowEditor() {
    setActiveWorkflowEditor(null);
    setWorkflowEditorActionKey(null);
    setWorkflowEditorError("");
    setNoteDraft("");
    setTaskTitleDraft("");
    setTaskDescriptionDraft("");
    setTaskPriorityDraft("medium");
    setTaskAssigneeDraft(currentMockAgentId);
    setTaskDueDraft("");
    setAiActionStatus("Workflow cancelled");
  }

  async function assignSelectedTo(agentId: string, actionKey: InboxActionFeedbackKey = "assign") {
    if (!selectedConversation) return;
    if (apiMode) {
      const userId = apiUserIdForAgentId(agentId);
      if (!userId) {
        setApiError("Selected agent is not available in API mode");
        setAiActionStatus("Selected agent is not available in API mode");
        return;
      }
      await runApiConversationAction(async () => assignApiConversation(selectedConversation.id, userId), "Assignment persisted", actionKey);
      return;
    }
    updateAdminStore(assignConversation(adminStore, selectedConversation.id, agentId));
    setAiActionStatus(`Assigned to ${adminStore.agents.find((agent) => agent.id === agentId)?.name ?? agentId}`);
    markActionFeedback(actionKey);
  }

  async function transferSelectedTo(agentId: string, actionKey: InboxActionFeedbackKey = "transfer") {
    if (!selectedConversation) return;
    if (apiMode) {
      const userId = apiUserIdForAgentId(agentId);
      if (!userId) {
        setApiError("Selected agent is not available in API mode");
        setAiActionStatus("Selected agent is not available in API mode");
        return;
      }
      await runApiConversationAction(async () => assignApiConversation(selectedConversation.id, userId), "Transfer persisted", actionKey);
      return;
    }
    updateAdminStore(transferConversation(adminStore, selectedConversation.id, agentId));
    setAiActionStatus(`Transferred to ${adminStore.agents.find((agent) => agent.id === agentId)?.name ?? agentId}`);
    markActionFeedback(actionKey);
  }

  async function unassignSelected(actionKey: InboxActionFeedbackKey = "unassign") {
    if (!selectedConversation) return;
    if (apiMode) {
      await runApiConversationAction(async () => assignApiConversation(selectedConversation.id, null), "Conversation unassigned in API", actionKey);
      return;
    }
    updateAdminStore(unassignConversation(adminStore, selectedConversation.id));
    setAiActionStatus("Conversation unassigned");
    markActionFeedback(actionKey);
  }

  async function changePriority(priority: ConversationPriority, actionKey: InboxActionFeedbackKey = "priority") {
    if (!selectedConversation) return;
    if (apiMode) {
      await runApiConversationAction(async () => updateConversationPriority(selectedConversation.id, {
        priority: priority === "medium" ? "normal" : priority
      }), `Priority changed to ${priority}`, actionKey);
      return;
    }
    updateAdminStore(setConversationPriority(adminStore, selectedConversation.id, priority));
    setAiActionStatus(`Priority changed to ${priority}`);
    markActionFeedback(actionKey);
  }

  async function changeConversationStatus(status: ConversationStatus, actionKey: InboxActionFeedbackKey = "status") {
    if (!selectedConversation) return;
    if (apiMode) {
      if (status === "follow_up") {
        await runApiConversationAction(async () => setConversationFollowUp(selectedConversation.id), "Follow-up persisted", actionKey);
        return;
      }
      if (status === "resolved") {
        await runApiConversationAction(async () => closeApiConversation(selectedConversation.id), "Conversation closed in API", actionKey);
        return;
      }
      await runApiConversationAction(async () => updateConversationStatus(selectedConversation.id, { status }), `Status changed to ${status}`, actionKey);
      return;
    }
    updateAdminStore(setConversationStatus(adminStore, selectedConversation.id, status));
    setAiActionStatus(`Status changed to ${status}`);
    markActionFeedback(actionKey);
  }

  async function addConversationNote() {
    const payload = buildNoteSavePayload(noteDraft, noteVisibility);
    if (!selectedConversation || !payload) return;
    setLastActionFeedback(null);
    setWorkflowEditorError("");
    if (apiMode) {
      setApiActionLoading(true);
      try {
        await createConversationNote(selectedConversation.id, payload);
        setNoteDraft("");
        setActiveWorkflowEditor(null);
        setWorkflowEditorActionKey(null);
        await refreshApiWorkflowAfterMutation(selectedConversation.id);
        setAiActionStatus("Internal note persisted");
        markActionFeedback("note-save");
      } catch (error) {
        const message = readableApiError(error);
        setApiWorkflowError(message);
        setWorkflowEditorError(message);
        setLastActionFeedback(null);
      } finally {
        setApiActionLoading(false);
      }
      return;
    }
    updateAdminStore(addInternalNote(adminStore, selectedConversation.id, selectedContactId, payload.body, payload.visibility));
    setNoteDraft("");
    setActiveWorkflowEditor(null);
    setWorkflowEditorActionKey(null);
    setAiActionStatus("Internal note added");
    markActionFeedback("note-save");
  }

  function editLatestNote() {
    if (apiMode) {
      setAiActionStatus("API note editing is not available in Sprint 15");
      return;
    }
    const note = selectedNotes[0];
    if (!note) return;
    updateAdminStore(updateInternalNote(adminStore, note.id, `${note.body} (updated)`));
    setAiActionStatus("Internal note updated");
  }

  function deleteLatestNote() {
    if (apiMode) {
      setAiActionStatus("API note deletion is not available in Sprint 15");
      return;
    }
    const note = selectedNotes[0];
    if (!note) return;
    updateAdminStore(deleteInternalNote(adminStore, note.id));
    setAiActionStatus("Internal note deleted");
  }

  function pinLatestNote() {
    if (apiMode) {
      setAiActionStatus("API note pinning is not available in Sprint 15");
      return;
    }
    const note = selectedNotes[0];
    if (!note) return;
    updateAdminStore(pinInternalNote(adminStore, note.id, !note.pinned));
    setAiActionStatus(note.pinned ? "Internal note unpinned" : "Internal note pinned");
  }

  function applyCannedReply(replyId: string) {
    if (!selectedConversation) return;
    const draft = resolveCannedReplyComposerDraft(cannedSource, replyId);
    if (!draft) return;
    setComposer(draft.body);
    if (!apiMode) updateAdminStore(recordCannedReplyUsed(adminStore, selectedConversation.id, draft.replyId));
    setAiActionStatus(`Canned reply loaded: ${draft.shortcut}`);
  }

  function handleComposerChange(value: string) {
    if (!selectedConversation) {
      setComposer(value);
      return;
    }
    const slashReply = value.startsWith("/") ? findCannedReplyInList(cannedSource, value) : null;
    if (slashReply) {
      setComposer(slashReply.body);
      if (!apiMode) updateAdminStore(recordCannedReplyUsed(adminStore, selectedConversation.id, slashReply.id));
      setAiActionStatus(`Slash command used: ${slashReply.shortcut}`);
      return;
    }
    setComposer(value);
  }

  async function handleAttachFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setSendError("");
    setUploadingMedia(true);
    try {
      const uploaded: PendingAttachment[] = [];
      for (const file of Array.from(files)) {
        const check = validateMediaUpload({ mimeType: file.type, sizeBytes: file.size, filename: file.name });
        if (!check.ok) {
          setSendError(check.reason);
          continue;
        }
        if (apiMode) {
          const result = await uploadMedia(file);
          uploaded.push({
            id: `${result.storageKey}`,
            attachment: {
              type: result.type,
              url: result.url,
              storageKey: result.storageKey,
              filename: result.filename,
              mimeType: result.mimeType,
              sizeBytes: result.sizeBytes
            },
            previewUrl: resolveAttachmentUrl(result.url) ?? result.url,
            filename: result.filename,
            mediaType: result.type
          });
        } else {
          const previewUrl = URL.createObjectURL(file);
          uploaded.push({
            id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            attachment: {
              type: check.type,
              url: previewUrl,
              filename: file.name,
              mimeType: file.type,
              sizeBytes: file.size
            },
            previewUrl,
            filename: file.name,
            mediaType: check.type
          });
        }
      }
      if (uploaded.length > 0) {
        setPendingAttachments((current) => [...current, ...uploaded]);
      }
    } catch (error) {
      setSendError(readableApiError(error));
    } finally {
      setUploadingMedia(false);
    }
  }

  function removePendingAttachment(id: string) {
    setPendingAttachments((current) => current.filter((item) => item.id !== id));
  }

  async function sendAgentMessage(text = composer.trim()) {
    if (!selectedConversation) return;
    const attachments = pendingAttachments.map((item) => item.attachment);
    if (!text && attachments.length === 0) return;

    if (apiMode) {
      setSendLoading(true);
      setSendError("");
      try {
        await sendApiAgentMessage(selectedConversation.id, text, attachments);
        const messages = await getConversationMessages(selectedConversation.id);
        setConversations((current) =>
          applyApiSentMessagesToConversation(current, selectedConversation.id, messages, text || "[media]")
        );
        setComposer("");
        setPendingAttachments([]);
        setApiError("");
        setSendError("");
      } catch (error) {
        setSendError(readableApiError(error));
      } finally {
        setSendLoading(false);
      }
      return;
    }

    const localAttachments: ChatAttachment[] = pendingAttachments.map((item) => ({
      id: item.id,
      type: item.mediaType,
      url: item.previewUrl,
      filename: item.filename,
      mimeType: item.attachment.mimeType,
      sizeBytes: item.attachment.sizeBytes
    }));

    if (selectedConversation.id === webchatDemoConversationId) {
      appendStoredDemoMessage("agent", text, localAttachments);
    } else {
      setConversations((current) =>
        applyLocalAgentMessageToConversation(current, selectedConversation.id, text).conversations
      );
    }

    setComposer("");
    setPendingAttachments([]);
  }

  function useAiDraft() {
    if (!selectedConversation) return;
    setComposer(getAiDraftText(selectedConversation));
    if (!apiMode) updateAdminStore(recordUseAiDraft(adminStore, selectedConversation.id));
    setAiActionStatus(apiMode ? "AI draft filled composer only. No message sent." : getAiPanelMockActionStatus("use_ai_draft", selectedConversation));
  }

  function copySuggestedReply() {
    if (!selectedConversation) return;
    const draft = getAiDraftText(selectedConversation);
    void navigator.clipboard?.writeText(draft);
    if (apiMode) setComposer(draft);
    setAiActionStatus(apiMode ? "Suggested reply copied and filled without outbound send" : getAiPanelMockActionStatus("copy_suggested_reply", selectedConversation));
  }

  function viewAiSource() {
    if (apiMode && selectedConversation) {
      const firstSource = selectedConversation.aiAnalysis?.matchedKnowledge?.[0];
      setAiActionStatus(firstSource ? `API source: ${firstSource.title} (${firstSource.category})` : "No safe API source metadata");
      return;
    }
    setAiActionStatus(getAiPanelMockActionStatus("view_source", selectedConversation));
  }

  async function regenerateDraft() {
    if (!selectedConversation) return;
    if (apiMode) {
      setApiAiLoading(true);
      setApiAiError("");
      try {
        const suggestion = await suggestAiReply(selectedConversation.id);
        setConversations((current) =>
          current.map((conversation) =>
            conversation.id === selectedConversation.id
              ? applyAiSuggestionToConversation(conversation, suggestion)
              : conversation
          )
        );
        setAiActionStatus("Draft regenerated through safe API. externalCalls=0");
      } catch (error) {
        setApiAiError(readableApiError(error));
        setAiActionStatus("Regenerate API error");
      } finally {
        setApiAiLoading(false);
      }
      return;
    }
    setAiActionStatus("Draft regenerated in demo mode");
  }

  async function markAiWrong() {
    if (!selectedConversation) return;
    if (apiMode) {
      const suggestionId = selectedConversation.aiSuggestionId;
      if (!suggestionId) {
        setAiActionStatus("No API suggestion id available to mark wrong");
        return;
      }
      setApiAiLoading(true);
      setApiAiError("");
      try {
        await markApiAiSuggestionWrong(suggestionId, { feedbackType: "mark_wrong" });
        const logs = await getConversationAuditLogs(selectedConversation.id);
        setApiAuditLogs(logs);
        setAiActionStatus("Marked wrong and persisted API feedback/audit");
      } catch (error) {
        setApiAiError(readableApiError(error));
        setAiActionStatus("Mark as Wrong API error");
      } finally {
        setApiAiLoading(false);
      }
      return;
    }
    setAiActionStatus(getAiPanelMockActionStatus("mark_wrong", selectedConversation));
  }

  async function takeOverFromAi(actionKey: InboxActionFeedbackKey = "take-over") {
    if (!selectedConversation) return;
    if (apiMode) {
      await runApiConversationAction(async () => takeOverApiConversation(selectedConversation.id), "Human takeover persisted", actionKey);
      return;
    }
    updateAdminStore(takeOverConversation(adminStore, selectedConversation.id));
    setAiActionStatus("Human takeover active");
    markActionFeedback(actionKey);
  }

  async function returnToAi(actionKey: InboxActionFeedbackKey = "return-to-ai") {
    if (!selectedConversation) return;
    if (apiMode) {
      await runApiConversationAction(async () => returnApiConversationToAi(selectedConversation.id), "Returned to AI in API", actionKey);
      return;
    }
    updateAdminStore(returnConversationToAi(adminStore, selectedConversation.id));
    setAiActionStatus("Returned to AI mock mode");
    markActionFeedback(actionKey);
  }

  async function assignToMe(actionKey: InboxActionFeedbackKey = "assign-to-me") {
    if (!selectedConversation) return;
    if (apiMode) {
      await runApiConversationAction(async () => assignApiConversation(selectedConversation.id, defaultApiUserId), "Assigned to me in API", actionKey);
      return;
    }
    updateAdminStore(assignConversation(adminStore, selectedConversation.id, currentMockAgentId));
    setAiActionStatus("Assigned to me");
    markActionFeedback(actionKey);
  }

  async function markFollowUp(actionKey: InboxActionFeedbackKey = "follow-up") {
    if (apiMode && selectedConversation) {
      await runApiConversationAction(async () => setConversationFollowUp(selectedConversation.id), "Follow-up persisted", actionKey);
      return;
    }
    await changeConversationStatus("follow_up", actionKey);
  }

  async function markResolved(actionKey: InboxActionFeedbackKey = "resolved") {
    await changeConversationStatus("resolved", actionKey);
  }

  async function reopenCase(actionKey: InboxActionFeedbackKey = "reopen") {
    await changeConversationStatus("open", actionKey);
  }

  async function markRead(actionKey: InboxActionFeedbackKey = "read") {
    if (!selectedConversation) return;
    if (apiMode) {
      await runApiConversationAction(async () => updateConversationReadState(selectedConversation.id, { unread: false }), "Marked read in API", actionKey);
      return;
    }
    setConversations((current) =>
      current.map((conversation) => conversation.id === selectedConversation.id ? { ...conversation, unreadCount: 0 } : conversation)
    );
    setAiActionStatus("Marked read");
    markActionFeedback(actionKey);
  }

  async function markReplied(actionKey: InboxActionFeedbackKey = "replied") {
    if (!selectedConversation) return;
    if (apiMode) {
      await runApiConversationAction(async () => updateConversationReadState(selectedConversation.id, { unreplied: false }), "Marked replied in API", actionKey);
      return;
    }
    setConversations((current) =>
      current.map((conversation) => conversation.id === selectedConversation.id ? { ...conversation, unreplied: false } : conversation)
    );
    setAiActionStatus("Marked replied");
    markActionFeedback(actionKey);
  }

  async function setDueSoonSla(actionKey: InboxActionFeedbackKey = "sla-soon") {
    if (!selectedConversation) return;
    const dueAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    if (apiMode) {
      await runApiConversationAction(async () => updateConversationSla(selectedConversation.id, {
        slaDueAt: dueAt,
        firstResponseDueAt: dueAt,
        resolutionDueAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        slaStatus: "warning"
      }), "SLA updated in API", actionKey);
      return;
    }
    setAiActionStatus("SLA update is local-only in mock mode");
    markActionFeedback(actionKey);
  }

  async function saveWorkflowTask() {
    const dueAt = dateTimeLocalInputToIso(taskDueDraft);
    if (taskDueDraft.trim() && !dueAt) {
      setWorkflowEditorError("Enter a valid task due date");
      return;
    }
    const assigneeUserId = apiMode
      ? taskAssigneeDraft === unassignedTaskAssignee ? null : apiUserIdForAgentId(taskAssigneeDraft)
      : taskAssigneeDraft === unassignedTaskAssignee ? null : taskAssigneeDraft;
    if (apiMode && taskAssigneeDraft !== unassignedTaskAssignee && !assigneeUserId) {
      setWorkflowEditorError("Selected assignee is not available in API mode");
      return;
    }
    const payload = buildTaskSavePayload(taskTitleDraft, assigneeUserId, dueAt);
    if (!selectedConversation || !payload) return;
    setLastActionFeedback(null);
    setWorkflowEditorError("");
    if (apiMode) {
      setApiActionLoading(true);
      try {
        const task = await createConversationWorkflowTask(selectedConversation.id, payload);
        if (taskPriorityDraft !== selectedPriority) {
          const updatedCard = await updateConversationPriority(selectedConversation.id, {
            priority: taskPriorityDraft === "medium" ? "normal" : taskPriorityDraft
          });
          setConversations((current) => current.map((conversation) =>
            conversation.id === updatedCard.id
              ? mapApiConversationToCard(updatedCard, conversation.messages)
              : conversation
          ));
        }
        setApiConversationTasks((current) => [mapApiWorkflowTaskToAdminTask(task), ...current]);
        setTaskTitleDraft("");
        setTaskDescriptionDraft("");
        setTaskAssigneeDraft(currentMockAgentId);
        setTaskDueDraft("");
        setActiveWorkflowEditor(null);
        setWorkflowEditorActionKey(null);
        await refreshApiWorkflowAfterMutation(selectedConversation.id);
        setTaskDashboardVersion((current) => current + 1);
        setApiWorkflowError("");
        setAiActionStatus("Task persisted");
        markActionFeedback("task-save");
      } catch (error) {
        const message = readableApiError(error);
        setApiWorkflowError(message);
        setWorkflowEditorError(message);
        setLastActionFeedback(null);
      } finally {
        setApiActionLoading(false);
      }
      return;
    }
    let nextStore = createConversationTask(adminStore, selectedConversation.id, selectedContactId, currentMockAgentId, new Date(), payload.title, dueAt);
    nextStore = payload.assigneeUserId
      ? assignConversation(nextStore, selectedConversation.id, payload.assigneeUserId)
      : unassignConversation(nextStore, selectedConversation.id);
    if (taskPriorityDraft !== selectedPriority) nextStore = setConversationPriority(nextStore, selectedConversation.id, taskPriorityDraft);
    updateAdminStore(nextStore);
    setTaskDashboardStatus("open");
    setTaskTitleDraft("");
    setTaskDescriptionDraft("");
    setTaskAssigneeDraft(currentMockAgentId);
    setTaskDueDraft("");
    setActiveWorkflowEditor(null);
    setWorkflowEditorActionKey(null);
    setAiActionStatus("Task created");
    markActionFeedback("task-save");
  }

  async function runApiConversationAction(action: () => Promise<CoreConversationCard>, successMessage: string, actionKey?: InboxActionFeedbackKey) {
    setApiActionLoading(true);
    try {
      const card = mapApiConversationToCard(await action(), selectedConversation?.messages ?? []);
      const [customer360, refreshedCards] = await Promise.all([
        getCustomer360(card.id),
        getConversations(card.roomId, {
          tab,
          filter,
          agentId: agentFilter === "all" ? undefined : apiAgentIds[agentFilter] ?? agentFilter
        })
      ]);
      setConversations(scopeApiConversationsToRoom(refreshedCards.map((item) =>
        mapApiConversationToCard(item, item.id === card.id ? selectedConversation?.messages ?? [] : [])
      ), card.roomId));
      setApiCustomer360(customer360);
      setApiError("");
      setApiWorkflowError("");
      setAiActionStatus(successMessage);
      if (actionKey) markActionFeedback(actionKey);
      await refreshApiConversationTimeline(card.id);
    } catch (error) {
      const message = readableApiError(error);
      setApiError(message);
      setAiActionStatus(message);
    } finally {
      setApiActionLoading(false);
    }
  }

  async function refreshApiConversationTimeline(conversationId: string) {
    const [auditResult, statusHistoryResult] = await Promise.allSettled([
      getConversationAuditLogs(conversationId),
      getConversationStatusHistory(conversationId)
    ]);
    if (auditResult.status === "fulfilled") {
      setApiAuditLogs(auditResult.value);
      setApiAuditError("");
    } else {
      setApiAuditLogs([]);
      setApiAuditError(readableApiError(auditResult.reason));
    }
    if (statusHistoryResult.status === "fulfilled") {
      setApiStatusHistory(statusHistoryResult.value);
      setApiStatusHistoryError("");
    } else {
      setApiStatusHistory([]);
      setApiStatusHistoryError(readableApiError(statusHistoryResult.reason));
    }
  }

  async function refreshApiWorkflowAfterMutation(conversationId: string) {
    const [notesResult, tasksResult, customerResult] = await Promise.allSettled([
      getConversationNotes(conversationId),
      getConversationTasks(conversationId),
      getCustomer360(conversationId)
    ]);
    if (notesResult.status === "fulfilled") {
      setApiConversationNotes(notesResult.value);
      setApiWorkflowError("");
    } else {
      setApiConversationNotes([]);
      setApiWorkflowError(readableApiError(notesResult.reason));
    }
    if (tasksResult.status === "fulfilled") {
      setApiConversationTasks(tasksResult.value.map(mapApiWorkflowTaskToAdminTask));
    } else {
      setApiConversationTasks([]);
      setApiWorkflowError(readableApiError(tasksResult.reason));
    }
    if (customerResult.status === "fulfilled") {
      setApiCustomer360(customerResult.value);
      setApiCustomerError("");
    } else {
      setApiCustomer360(null);
      setApiCustomerError(readableApiError(customerResult.reason));
    }
    await refreshApiConversationTimeline(conversationId);
  }

  function buildSelectedFlowInput(flow: Flow) {
    return buildInboxFlowTestInput(flow, selectedConversation ?? mockConversations[0], selectedContact, {
      apiMode,
      room: selectedRoom,
      status: selectedStatus,
      contactId: selectedContactId
    });
  }

  async function runSelectedFlow(flowId: string) {
    if (!selectedConversation) return;
    const flow = flowStore.flows.find((item) => item.id === flowId);
    if (!flow) return;
    if (apiMode) {
      setApiActionLoading(true);
      setApiWorkflowError("");
      try {
        const result = await testRunApiFlow(flowId, buildSelectedFlowInput(flow));
        const refreshedRuns = await getFlowRuns(flowId).catch(() => [result.flowRun]);
        setFlowStore((current) => ({
          ...current,
          runs: [
            ...refreshedRuns,
            ...current.runs.filter((run) => run.flowId !== flowId)
          ]
        }));
        setLastFlowResult(result);
        setAiActionStatus(`${result.flowRun.resultSummary} Conversation stayed in ${selectedConversation.roomId}.`);
        await refreshApiConversationTimeline(selectedConversation.id);
      } catch (error) {
        const message = readableApiError(error);
        setApiWorkflowError(message);
        setAiActionStatus(message);
      } finally {
        setApiActionLoading(false);
      }
      return;
    }
    const { store: nextFlowStore, result } = runAndRecordFlow(flowStore, flowId, buildSelectedFlowInput(flow), { conversations, contacts, adminStore });
    if (!result) return;
    updateFlowStore(nextFlowStore);
    setLastFlowResult(result);
    setConversations(result.state.conversations);
    updateContacts(result.state.contacts);
    updateAdminStore(result.state.adminStore);
    setAiActionStatus(`${result.flowRun.resultSummary} Conversation stayed in ${selectedConversation.roomId}.`);
  }

  function copySummary() {
    if (!selectedConversation) return;
    void navigator.clipboard?.writeText(selectedConversation.aiSummary);
    updateAdminStore(copyConversationSummary(adminStore, selectedConversation.id));
    setAiActionStatus("Summary copied");
  }

  async function markFirstTaskDone() {
    if (!selectedContact) return;
    if (apiMode) {
      const firstOpenTask = apiConversationTasks.find((task) => task.status === "open");
      if (!firstOpenTask) return;
      setApiActionLoading(true);
      setLastActionFeedback(null);
      try {
        const task = await completeConversationWorkflowTask(firstOpenTask.id);
        const mapped = mapApiWorkflowTaskToAdminTask(task);
        setApiConversationTasks((current) => current.map((item) => item.id === mapped.id ? mapped : item));
        if (selectedConversation) await refreshApiWorkflowAfterMutation(selectedConversation.id);
        setTaskDashboardVersion((current) => current + 1);
        setAiActionStatus("Task completion persisted");
        setApiWorkflowError("");
        markActionFeedback("task-complete");
      } catch (error) {
        const message = readableApiError(error);
        setApiWorkflowError(message);
        setAiActionStatus(message);
        setLastActionFeedback(null);
      } finally {
        setApiActionLoading(false);
      }
      return;
    }
    const firstOpenTask = selectedContact.tasks.find((task) => task.status === "open");
    if (!firstOpenTask) return;
    updateContacts(markContactTaskDone(contacts, selectedContact.id, firstOpenTask.id));
    setAiActionStatus("CRM task marked done");
  }

  function openTaskConversation(task: TaskDashboardRow) {
    setSelectedRoomId(task.roomId);
    setTab(task.conversationTab);
    setFilter("all");
    setStatusFilter("all");
    setPriorityFilter("all");
    setUnreadFilter("all");
    setSlaFilter("all");
    setConversationSearch("");
    setPendingTaskConversationId(task.conversationId);
    setSelectedConversationId(task.conversationId);
    setAiActionStatus(`Opening task conversation ${task.conversationId}`);
  }

  async function completeTaskDashboardRow(task: TaskDashboardRow) {
    if (task.status !== "open") return;
    if (apiMode) {
      setTaskDashboardCompletingId(task.id);
      setApiTaskDashboardError("");
      setLastActionFeedback(null);
      try {
        const completed = await completeConversationWorkflowTask(task.id);
        const mapped = mapApiWorkflowTaskToAdminTask(completed);
        setApiTaskDashboardTasks((current) => current.map((item) =>
          item.id === task.id
            ? {
                ...item,
                status: "done",
                completedAt: completed.completedAt,
                externalCalls: completed.externalCalls
              }
            : item
        ));
        if (selectedConversation?.id === mapped.conversationId) {
          await refreshApiWorkflowAfterMutation(mapped.conversationId);
        } else {
          await refreshApiConversationTimeline(mapped.conversationId).catch(() => undefined);
        }
        setTaskDashboardVersion((current) => current + 1);
        setAiActionStatus("Task completion persisted");
        markActionFeedback("task-complete");
      } catch (error) {
        const message = readableApiError(error);
        setApiTaskDashboardError(message);
        setAiActionStatus(message);
      } finally {
        setTaskDashboardCompletingId("");
      }
      return;
    }

    updateAdminStore({
      ...adminStore,
      tasks: adminStore.tasks.map((item) => item.id === task.id ? { ...item, status: "done" } : item)
    });
    setAiActionStatus("Task marked done");
    markActionFeedback("task-complete");
  }

  async function updateTaskDashboardRow(task: TaskDashboardRow, patch: UpdateTaskRequest, actionKey: InboxActionFeedbackKey) {
    if (apiMode) {
      setTaskDashboardUpdatingId(task.id);
      setApiTaskDashboardError("");
      setLastActionFeedback(null);
      try {
        const updated = await updateConversationWorkflowTask(task.id, patch);
        setApiTaskDashboardTasks((current) => current.map((item) =>
          item.id === task.id
            ? {
                ...item,
                title: updated.title,
                status: updated.status,
                assigneeUserId: updated.assigneeUserId,
                dueAt: updated.dueAt,
                completedAt: updated.completedAt,
                externalCalls: updated.externalCalls
              }
            : item
        ));
        if (selectedConversation?.id === updated.conversationId) {
          await refreshApiWorkflowAfterMutation(updated.conversationId);
        } else {
          await refreshApiConversationTimeline(updated.conversationId).catch(() => undefined);
        }
        setTaskDashboardVersion((current) => current + 1);
        setAiActionStatus(actionKey === "task-assign" ? "Task assignee persisted" : "Task due date persisted");
        markActionFeedback(actionKey);
      } catch (error) {
        const message = readableApiError(error);
        setApiTaskDashboardError(message);
        setAiActionStatus(message);
      } finally {
        setTaskDashboardUpdatingId("");
      }
      return;
    }

    let nextStore: AdminStore = {
      ...adminStore,
      tasks: adminStore.tasks.map((item) =>
        item.id === task.id
          ? {
              ...item,
              dueAt: patch.dueAt === undefined ? item.dueAt : patch.dueAt
            }
          : item
      )
    };
    if (patch.assigneeUserId !== undefined) {
      nextStore = patch.assigneeUserId
        ? assignConversation(nextStore, task.conversationId, patch.assigneeUserId)
        : unassignConversation(nextStore, task.conversationId);
    }
    updateAdminStore(nextStore);
    setAiActionStatus(actionKey === "task-assign" ? "Task assignee updated" : "Task due date updated");
    markActionFeedback(actionKey);
  }

  async function changeTaskDashboardAssignee(task: TaskDashboardRow, agentId: string) {
    const assigneeUserId = apiMode
      ? agentId === unassignedTaskAssignee ? null : apiUserIdForAgentId(agentId)
      : agentId === unassignedTaskAssignee ? null : agentId;
    if (apiMode && agentId !== unassignedTaskAssignee && !assigneeUserId) {
      setApiTaskDashboardError("Selected assignee is not available in API mode");
      setAiActionStatus("Selected assignee is not available in API mode");
      return;
    }
    await updateTaskDashboardRow(task, { assigneeUserId }, "task-assign");
  }

  async function changeTaskDashboardDue(task: TaskDashboardRow, value: string) {
    const dueAt = dateTimeLocalInputToIso(value);
    if (value.trim() && !dueAt) {
      setApiTaskDashboardError("Enter a valid task due date");
      setAiActionStatus("Enter a valid task due date");
      return;
    }
    await updateTaskDashboardRow(task, { dueAt }, "task-due");
  }

  async function changeLeadStatus(leadStatus: LeadStatus) {
    if (!selectedContact) return;
    if (apiMode) {
      if (!selectedConversation) return;
      await runApiCustomer360Action(
        () => updateCustomer360Profile(selectedConversation.id, {
          contactId: selectedContact.id,
          leadStatus
        }),
        `Lead status updated to ${leadStatus}`
      );
      return;
    }
    updateContacts(updateContactLeadStatus(contacts, selectedContact.id, leadStatus));
    setAiActionStatus(`Lead status updated to ${leadStatus}`);
  }

  async function addCrmTag() {
    if (!selectedContact) return;
    if (apiMode) {
      if (!selectedConversation) return;
      await runApiCustomer360Action(
        () => updateCustomer360Profile(selectedConversation.id, {
          contactId: selectedContact.id,
          tags: Array.from(new Set([...selectedContact.tags, "vip"]))
        }),
        "CRM tag added"
      );
      return;
    }
    updateContacts(addContactTag(contacts, selectedContact.id, "vip"));
    setAiActionStatus("CRM tag added");
  }

  async function removeCrmTag(tag: string) {
    if (!selectedContact) return;
    if (apiMode) {
      if (!selectedConversation) return;
      await runApiCustomer360Action(
        () => updateCustomer360Profile(selectedConversation.id, {
          contactId: selectedContact.id,
          tags: selectedContact.tags.filter((item) => item !== tag)
        }),
        "CRM tag removed"
      );
      return;
    }
    updateContacts(removeContactTag(contacts, selectedContact.id, tag));
    setAiActionStatus("CRM tag removed");
  }

  async function linkCurrentIdentity() {
    if (!selectedConversation || !selectedContact) return;
    if (apiMode && apiCustomer360) {
      await runApiContactAction(
        () => linkApiContactIdentity(selectedContact.id, {
          platform: apiCustomer360.source.platform,
          channelAccountId: apiCustomer360.source.channelAccountId,
          externalUserId: apiCustomer360.source.externalUserId,
          displayName: apiCustomer360.source.displayName
        }),
        "Current identity linked without moving conversation rooms"
      );
      return;
    }
    updateContacts(linkIdentityToContact(contacts, selectedContact.id, createIdentityFromConversation(selectedConversation)));
    setAiActionStatus("Current identity linked without moving conversation rooms");
  }

  async function createContactFromCurrentIdentity() {
    if (!selectedConversation) return;
    if (apiMode && apiCustomer360) {
      await runApiContactAction(async () => {
        const contact = await createApiContact({
          displayName: apiCustomer360.source.displayName,
          leadStatus: "new",
          tags: ["new-contact"],
          identity: {
            platform: apiCustomer360.source.platform,
            channelAccountId: apiCustomer360.source.channelAccountId,
            externalUserId: apiCustomer360.source.externalUserId,
            displayName: apiCustomer360.source.displayName,
            isPrimary: true
          }
        });
        return contact;
      }, "New CRM contact created from current identity");
      return;
    }
    updateContacts(createContactFromIdentity(contacts, createIdentityFromConversation(selectedConversation)));
    setAiActionStatus("New CRM contact created from current identity");
  }

  async function unlinkFirstIdentity() {
    if (!selectedContact || selectedContact.identities.length <= 1) return;
    const identity = selectedContact.identities[selectedContact.identities.length - 1];
    if (apiMode) {
      await runApiContactAction(
        () => unlinkApiContactIdentity(selectedContact.id, { identityId: identity.id }),
        "Identity unlinked; conversations remain in their platform rooms"
      );
      return;
    }
    updateContacts(unlinkIdentity(contacts, selectedContact.id, identity.id));
    setAiActionStatus("Identity unlinked; conversations remain in their platform rooms");
  }

  async function setFirstIdentityPrimary() {
    if (!selectedContact || selectedContact.identities.length === 0) return;
    if (apiMode) {
      await runApiContactAction(
        () => setApiPrimaryContactIdentity(selectedContact.id, { identityId: selectedContact.identities[0].id }),
        "Primary identity updated"
      );
      return;
    }
    updateContacts(setPrimaryIdentity(contacts, selectedContact.id, selectedContact.identities[0].id));
    setAiActionStatus("Primary identity updated");
  }

  async function toggleSelectedBroadcastOptOut() {
    if (!selectedContact) return;
    if (apiMode) {
      setApiActionLoading(true);
      try {
        const nextOptOut = !selectedContact.optOutBroadcast;
        if (!selectedConversation) throw new Error("Select a conversation before updating broadcast consent");
        const customer360 = await updateCustomer360Consent(selectedConversation.id, {
          contactId: selectedContact.id,
          optOut: nextOptOut,
        });
        setApiCustomer360(customer360);
        applyApiContact(customer360.contact);
        await refreshApiConversationTimeline(selectedConversation.id);
        setAiActionStatus(nextOptOut ? "Broadcast opt-out persisted through API" : "Broadcast opt-in persisted through API");
      } catch (error) {
        setAiActionStatus(readableApiError(error));
      } finally {
        setApiActionLoading(false);
      }
      return;
    }
    updateContacts(toggleContactBroadcastOptOut(contacts, selectedContact.id, !selectedContact.optOutBroadcast));
    setAiActionStatus(selectedContact.optOutBroadcast ? "Broadcast mock opt-out removed" : "Broadcast mock opt-out enabled");
  }

  const shellClassName = [
    "appShell",
    panelsHydrated && roomsCollapsed ? "roomsCollapsed" : "",
    panelsHydrated && queueCollapsed ? "queueCollapsed" : "",
    panelsHydrated && customerCollapsed ? "customerCollapsed" : ""
  ].filter(Boolean).join(" ");

  return (
    <main className={shellClassName}>
      <aside className={roomsCollapsed ? "roomsSidebar collapsed" : "roomsSidebar"} aria-label="Platform Rooms sidebar">
        {roomsCollapsed && (
          <button
            type="button"
            className="panelRailToggle"
            onClick={toggleRoomsCollapsed}
            aria-label="Expand Platform Rooms"
            title="Expand Platform Rooms"
          >
            <ChevronRight size={16} />
            <span className="panelRailLabel">Rooms</span>
          </button>
        )}
        <header className="sectionHeader">
          <div>
            <p className="eyebrow">Inbox Rooms</p>
            <h1>Platform Rooms</h1>
          </div>
          <div className="panelHeaderActions">
            <button className="iconButton" aria-label="Refresh mock rooms">
              <RotateCcw size={16} />
            </button>
            <button
              type="button"
              className="iconButton panelCollapseToggle"
              onClick={toggleRoomsCollapsed}
              aria-label="Collapse Platform Rooms"
              title="Collapse Platform Rooms"
            >
              <ChevronLeft size={16} />
            </button>
          </div>
        </header>

        <label className="searchBox">
          <Search size={16} />
          <input value={roomSearch} onChange={(event) => setRoomSearch(event.target.value)} placeholder="Search room" aria-label="Search room" />
        </label>

        <div className="roomGroups">
          {displayedRooms.map((room) => (
            <section className="platformGroup" key={room.id}>
              <button className="platformHeader" type="button">
                <span>{room.platformLabel}</span>
                <ChevronDown size={15} />
              </button>
              <button
                className={selectedRoom.id === room.id ? "roomButton selected" : "roomButton"}
                style={{ "--room-accent": room.accent } as CSSProperties}
                type="button"
                onClick={() => selectRoom(room.id)}
                aria-pressed={selectedRoom.id === room.id}
              >
                <span>{room.roomName}</span>
                <small>{apiMode ? roomCounts[room.id] ?? 0 : getRoomConversationCount(room.id, conversations)} conversations</small>
              </button>
            </section>
          ))}
        </div>
      </aside>

      <section className={queueCollapsed ? "queuePanel collapsed" : "queuePanel"} aria-label="Conversation Queue">
        {queueCollapsed && (
          <button
            type="button"
            className="panelRailToggle"
            onClick={toggleQueueCollapsed}
            aria-label="Expand Conversation Queue"
            title="Expand Conversation Queue"
          >
            <ChevronRight size={16} />
            <span className="panelRailLabel">Queue</span>
          </button>
        )}
        <header className="queueHeader">
          <div>
            <p className="eyebrow">Conversation Queue</p>
            <h2>{selectedRoom.platformLabel} / {selectedRoom.accountName}</h2>
          </div>
          <div className="panelHeaderActions">
            <span className="roomBadge">{visibleConversations.length}</span>
            <button
              type="button"
              className="iconButton panelCollapseToggle"
              onClick={toggleQueueCollapsed}
              aria-label="Collapse Conversation Queue"
              title="Collapse Conversation Queue"
            >
              <ChevronLeft size={16} />
            </button>
          </div>
        </header>

        {apiMode && (
          <div className={apiError ? "collisionBanner" : "collisionBanner soft"}>
            <Wifi size={16} /> {apiError || (apiLoading ? "Loading API data..." : `API mode connected via ${dataMode}`)}
          </div>
        )}

        <div className="tabSwitch" aria-label="Human Bot tabs">
          {tabOptions.map((item) => (
            <button
              key={item.id}
              className={tab === item.id ? "tabButton selected" : "tabButton"}
              type="button"
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="filterGrid" aria-label="Conversation filters">
          {filterOptions.map((item) => (
            <button
              key={item.id}
              className={filter === item.id ? "filterButton selected" : "filterButton"}
              type="button"
              onClick={() => setFilter(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <label className="searchBox queueSearch">
          <Search size={16} />
          <input
            value={conversationSearch}
            onChange={(event) => setConversationSearch(event.target.value)}
            placeholder="Search conversations"
            aria-label="Search conversations"
          />
        </label>

        <label className="agentFilter">
          <span>Agent</span>
          <select value={agentFilter} onChange={(event) => setAgentFilter(event.target.value)} aria-label="Filter by agent">
            <option value="all">All agents</option>
            {taskAssigneeAgents.map((agent) => (
              <option key={agent.id} value={agent.id}>{agent.name} / {agent.status}</option>
            ))}
          </select>
        </label>

        <div className="queueSelectGrid" aria-label="Conversation search filters">
          <label>
            <span>Status</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "all" | ConversationStatus)} aria-label="Filter by status">
              {conversationStatusFilterOptions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label>
            <span>Priority</span>
            <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value as "all" | ConversationPriority)} aria-label="Filter by priority">
              {conversationPriorityFilterOptions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label>
            <span>Read</span>
            <select value={unreadFilter} onChange={(event) => setUnreadFilter(event.target.value as "all" | "unread" | "read")} aria-label="Filter by read state">
              <option value="all">all</option>
              <option value="unread">unread</option>
              <option value="read">read</option>
            </select>
          </label>
          <label>
            <span>SLA</span>
            <select value={slaFilter} onChange={(event) => setSlaFilter(event.target.value as "all" | "ok" | "warning" | "breached")} aria-label="Filter by SLA">
              {slaFilterOptions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label>
            <span>Sort</span>
            <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value as "latest_desc" | "latest_asc" | "updated_desc" | "updated_asc")} aria-label="Sort conversations">
              <option value="latest_desc">latest first</option>
              <option value="latest_asc">latest last</option>
              <option value="updated_desc">updated first</option>
              <option value="updated_asc">updated last</option>
            </select>
          </label>
        </div>

        <TaskDashboardPanel
          apiMode={apiMode}
          rows={taskDashboardRows}
          loading={apiTaskDashboardLoading}
          error={apiTaskDashboardError}
          status={taskDashboardStatus}
          due={taskDashboardDue}
          assignee={taskDashboardAssignee}
          agents={taskAssigneeAgents}
          completingId={taskDashboardCompletingId}
          updatingId={taskDashboardUpdatingId}
          onStatusChange={setTaskDashboardStatus}
          onDueChange={setTaskDashboardDue}
          onAssigneeChange={setTaskDashboardAssignee}
          onRefresh={() => setTaskDashboardVersion((current) => current + 1)}
          onOpenConversation={openTaskConversation}
          onCompleteTask={completeTaskDashboardRow}
          onTaskAssigneeChange={changeTaskDashboardAssignee}
          onTaskDueChange={changeTaskDashboardDue}
        />

        <div className="conversationList">
          {visibleConversations.length === 0 ? (
            <EmptyState
              title="No conversations in this view"
              body={
                selectedRoom.id === "webchat-main"
                  ? "Open /webchat-demo and send a visitor message to create a Webchat demo conversation."
                  : `${selectedRoom.platformLabel} / ${selectedRoom.accountName} has no ${tab} conversations for ${filterLabel(filter)}.`
              }
            />
          ) : (
            visibleConversations.map((conversation) => (
              <ConversationButton
                key={conversation.id}
                conversation={conversation}
                adminStore={adminStore}
                selected={selectedConversation?.id === conversation.id}
                onSelect={() => setSelectedConversationId(conversation.id)}
              />
            ))
          )}
        </div>
        {apiMode && hasMoreApiConversations && (
          <button className="loadMoreButton" type="button" onClick={() => setConversationLimit((current) => current + apiConversationPageSize)} disabled={apiLoading}>
            {apiLoading ? "Loading..." : "Load more"}
          </button>
        )}
      </section>

      <section className="chatPanel" aria-label="Chat Window">
        <ChatHeader
          room={selectedRoom}
          conversation={selectedConversation}
          assignableAgents={taskAssigneeAgents}
          assignedAgentName={selectedAssignedAgentName}
          priority={selectedPriority}
          status={selectedStatus}
          sla={selectedSla}
          collision={apiMode ? null : selectedCollision}
          activeActionKey={lastActionFeedback}
          onAssignToMe={() => assignToMe("assign-to-me")}
          onUnassign={() => unassignSelected("unassign")}
          onAssign={(agentId) => assignSelectedTo(agentId, "assign")}
          onTransfer={(agentId) => transferSelectedTo(agentId, "transfer")}
          onPriorityChange={(priority) => changePriority(priority, "priority")}
          onStatusChange={(status) => changeConversationStatus(status, "status")}
          onTakeOver={() => takeOverFromAi("take-over")}
          onReturnToAi={() => returnToAi("return-to-ai")}
          onMarkFollowUp={() => markFollowUp("follow-up")}
          onMarkResolved={() => markResolved("resolved")}
          onReopen={() => reopenCase("reopen")}
          onMarkRead={() => markRead("read")}
          onMarkReplied={() => markReplied("replied")}
          onSetDueSoonSla={() => setDueSoonSla("sla-soon")}
          onCreateTask={() => openCreateTaskFlow("toolbar-create-task")}
          onAddNote={() => openAddNoteFlow("toolbar-add-note")}
          onCopySummary={copySummary}
        />
        <div className="messageTimeline">
          {!apiMode && selectedCollision?.hasTypingWarning && (
            <div className="collisionBanner"><AlertTriangle size={16} /> {selectedCollision.typingText}</div>
          )}
          {!apiMode && selectedCollision?.lockedByAssignment && (
            <div className="collisionBanner soft"><UserRoundCheck size={16} /> Locked by assignment: {selectedCollision.ownerText}</div>
          )}
          {!apiMode && selectedCollision?.viewingText && (
            <div className="collisionBanner soft"><Clock3 size={16} /> {selectedCollision.viewingText}</div>
          )}
          {selectedConversation ? (
            selectedConversation.messages.map((message) => <MessageBubble key={message.id} message={message} />)
          ) : (
            <EmptyState title="Select a conversation" body="Conversation list is scoped to the selected platform room and account." />
          )}
        </div>
        <footer className="composerPanel">
          <div className="quickActions">
            {visibleQuickReplies.map((reply) => (
              <button key={reply} type="button" onClick={() => sendAgentMessage(reply)} disabled={!selectedConversation}>
                <Sparkles size={14} /> {reply}
              </button>
            ))}
          </div>
          <div className="cannedReplyBar">
            <label className="searchBox cannedSearch">
              <Search size={15} />
              <input value={cannedSearch} onChange={(event) => setCannedSearch(event.target.value)} placeholder="Search canned replies" aria-label="Search canned replies" />
            </label>
            <select value={cannedCategory} onChange={(event) => setCannedCategory(event.target.value)} aria-label="Canned reply category">
              <option value="all">All categories</option>
              <option value="general">General</option>
              <option value="sales">Sales</option>
              <option value="support">Support</option>
            </select>
            {cannedReplies.slice(0, 4).map((reply) => (
              <button key={reply.id} type="button" onClick={() => applyCannedReply(reply.id)} disabled={!selectedConversation}>
                {reply.shortcut}
              </button>
            ))}
            {apiMode && apiCannedError ? <span className="noteText">Canned replies API error: {apiCannedError}</span> : null}
            {apiMode && !apiCannedError && cannedReplies.length === 0 ? <span className="noteText">No persisted canned replies</span> : null}
          </div>
          {pendingAttachments.length > 0 ? (
            <div className="composerAttachments" aria-label="Pending attachments">
              {pendingAttachments.map((item) => (
                <div key={item.id} className="composerAttachmentChip">
                  {item.mediaType === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.previewUrl} alt={item.filename} className="composerAttachmentThumb" />
                  ) : (
                    <Paperclip size={14} />
                  )}
                  <span className="composerAttachmentName">{item.filename}</span>
                  <button
                    type="button"
                    className="composerAttachmentRemove"
                    onClick={() => removePendingAttachment(item.id)}
                    aria-label={`Remove ${item.filename}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          ) : null}
          <div className="composerBox">
            <input
              ref={attachInputRef}
              type="file"
              accept="image/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.txt,.csv"
              multiple
              hidden
              onChange={(event) => {
                void handleAttachFiles(event.target.files);
                event.target.value = "";
              }}
            />
            <button
              type="button"
              className="composerAttachButton"
              onClick={() => attachInputRef.current?.click()}
              disabled={!selectedConversation || uploadingMedia}
              aria-label="Attach file or image"
              title="Attach file or image"
            >
              <Paperclip size={16} />
            </button>
            <textarea
              placeholder="Reply in the selected room account"
              value={composer}
              onChange={(event) => handleComposerChange(event.target.value)}
              disabled={!selectedConversation}
            />
            <button
              type="button"
              className="sendButton"
              onClick={() => sendAgentMessage()}
              disabled={!selectedConversation || (!composer.trim() && pendingAttachments.length === 0) || sendLoading || uploadingMedia}
            >
              {sendLoading ? "Sending..." : uploadingMedia ? "Uploading..." : "Send"}
            </button>
          </div>
          {sendError ? <p className="noteText">Send failed: {sendError}</p> : null}
        </footer>
      </section>

      <aside className={customerCollapsed ? "customerPanel collapsed" : "customerPanel"} aria-label="Customer and AI Panel">
        {customerCollapsed ? (
          <button
            type="button"
            className="panelRailToggle"
            onClick={toggleCustomerCollapsed}
            aria-label="Expand Customer panel"
            title="Expand Customer panel"
          >
            <ChevronLeft size={16} />
            <span className="panelRailLabel">Customer</span>
          </button>
        ) : (
          <>
            <div className="panelHeaderActions customerCollapseRow">
              <button
                type="button"
                className="iconButton panelCollapseToggle"
                onClick={toggleCustomerCollapsed}
                aria-label="Collapse Customer panel"
                title="Collapse Customer panel"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <CustomerPanel
          conversation={selectedConversation}
          contact={selectedContact}
          relatedConversations={
            apiMode
              ? apiCustomer360?.recentConversations.map((conversation) => mapApiConversationToCard(conversation)) ?? []
              : selectedContact ? getContactConversations(selectedContact, conversations) : []
          }
          aiActionStatus={aiActionStatus}
          aiLoading={apiAiLoading}
          aiError={apiAiError}
          assignedAgentName={apiMode ? apiCustomer360?.owner ?? "Unassigned" : selectedAssignedAgent?.name ?? "Unassigned"}
          apiMode={apiMode}
          customerLoading={apiCustomerLoading}
          customerError={apiCustomerError}
          workflowLoading={apiWorkflowLoading || apiActionLoading}
          workflowError={apiWorkflowError}
          priority={selectedPriority}
          status={selectedStatus}
          sla={selectedSla}
          notes={selectedNotes}
          auditLogs={selectedAuditLogs}
          statusHistory={apiMode ? apiStatusHistory : []}
          auditError={apiAuditError}
          statusHistoryError={apiStatusHistoryError}
          adminTasks={selectedTasks}
          contactAnalytics={contactAnalytics}
          matchingFlows={matchingFlows}
          recentFlowRuns={recentFlowRuns}
          lastFlowResult={lastFlowResult}
          broadcastHistoryRows={apiMode ? mapApiBroadcastHistoryRows(apiCustomer360?.broadcastHistorySummary.rows ?? []) : selectedContact ? mapLocalBroadcastHistoryRows(getBroadcastHistoryForContact(broadcastStore, selectedContact.id)) : []}
          lastBroadcastCampaignName={apiMode ? apiCustomer360?.broadcastHistorySummary.lastCampaignName ?? "No sent_mock campaign" : selectedContact ? getLastCampaignReceived(broadcastStore, selectedContact.id)?.name ?? "No sent_mock campaign" : "No sent_mock campaign"}
          broadcastHistorySummary={apiMode ? apiCustomer360?.broadcastHistorySummary ?? null : null}
          activeWorkflowEditor={activeWorkflowEditor}
          workflowEditorError={workflowEditorError}
          taskTitleDraft={taskTitleDraft}
          taskDescriptionDraft={taskDescriptionDraft}
          taskPriorityDraft={taskPriorityDraft}
          taskAssigneeDraft={taskAssigneeDraft}
          taskDueDraft={taskDueDraft}
          taskAssigneeAgents={taskAssigneeAgents}
          noteDraft={noteDraft}
          noteVisibility={noteVisibility}
          onUseDraft={useAiDraft}
          onCopySuggestedReply={copySuggestedReply}
          onViewSource={viewAiSource}
          onRegenerate={regenerateDraft}
          onMarkWrong={markAiWrong}
          activeActionKey={lastActionFeedback}
          onTakeOver={() => takeOverFromAi("take-over")}
          onReturnToAi={() => returnToAi("return-to-ai")}
          onAssignToMe={() => assignToMe("assign-to-me")}
          onMarkFollowUp={() => markFollowUp("follow-up")}
          onMarkResolved={() => markResolved("resolved")}
          onReopen={() => reopenCase("reopen")}
          onMarkRead={() => markRead("read")}
          onMarkReplied={() => markReplied("replied")}
          onSetDueSoonSla={() => setDueSoonSla("sla-soon")}
          onCreateAdminTask={() => openCreateTaskFlow("quick-create-task")}
          onRunFlow={runSelectedFlow}
          onCopySummary={copySummary}
          onAddNote={() => openAddNoteFlow("customer-add-note")}
          onQuickAddNote={() => openAddNoteFlow("quick-add-note")}
          onAddInternalNote={addConversationNote}
          onSaveWorkflowTask={saveWorkflowTask}
          onCancelWorkflowEditor={cancelWorkflowEditor}
          onEditInternalNote={editLatestNote}
          onDeleteInternalNote={deleteLatestNote}
          onPinInternalNote={pinLatestNote}
          onNoteDraftChange={setNoteDraft}
          onNoteVisibilityChange={setNoteVisibility}
          onTaskTitleDraftChange={setTaskTitleDraft}
          onTaskDescriptionDraftChange={setTaskDescriptionDraft}
          onTaskPriorityDraftChange={setTaskPriorityDraft}
          onTaskAssigneeDraftChange={setTaskAssigneeDraft}
          onTaskDueDraftChange={setTaskDueDraft}
          onCreateTask={() => openCreateTaskFlow("customer-create-task")}
          onMarkTaskDone={markFirstTaskDone}
          onLeadStatusChange={changeLeadStatus}
          onAddTag={addCrmTag}
          onRemoveTag={removeCrmTag}
          onLinkIdentity={linkCurrentIdentity}
          onCreateContact={createContactFromCurrentIdentity}
          onUnlinkIdentity={unlinkFirstIdentity}
          onSetPrimaryIdentity={setFirstIdentityPrimary}
          onToggleBroadcastOptOut={toggleSelectedBroadcastOptOut}
            />
          </>
        )}
      </aside>
    </main>
  );
}

function TaskDashboardPanel({
  apiMode,
  rows,
  loading,
  error,
  status,
  due,
  assignee,
  agents,
  completingId,
  updatingId,
  onStatusChange,
  onDueChange,
  onAssigneeChange,
  onRefresh,
  onOpenConversation,
  onCompleteTask,
  onTaskAssigneeChange,
  onTaskDueChange
}: {
  apiMode: boolean;
  rows: TaskDashboardRow[];
  loading: boolean;
  error: string;
  status: TaskDashboardStatusFilter;
  due: TaskDashboardDueFilter;
  assignee: string;
  agents: AdminStore["agents"];
  completingId: string;
  updatingId: string;
  onStatusChange: (value: TaskDashboardStatusFilter) => void;
  onDueChange: (value: TaskDashboardDueFilter) => void;
  onAssigneeChange: (value: string) => void;
  onRefresh: () => void;
  onOpenConversation: (task: TaskDashboardRow) => void;
  onCompleteTask: (task: TaskDashboardRow) => void;
  onTaskAssigneeChange: (task: TaskDashboardRow, agentId: string) => void;
  onTaskDueChange: (task: TaskDashboardRow, dueAt: string) => void;
}) {
  const openCount = rows.filter((task) => task.status === "open").length;
  const completedCount = rows.filter((task) => task.status === "done").length;
  return (
    <section className="taskDashboardPanel" aria-label="Task dashboard">
      <header className="taskDashboardHeader">
        <div>
          <p className="eyebrow">Task Dashboard</p>
          <h3>{openCount} open / {completedCount} completed</h3>
        </div>
        <button className="iconButton" type="button" onClick={onRefresh} disabled={loading} aria-label="Refresh task dashboard">
          <RotateCcw size={15} />
        </button>
      </header>

      <div className="taskDashboardFilters" aria-label="Task filters">
        <label>
          <span>Status</span>
          <select value={status} onChange={(event) => onStatusChange(event.target.value as TaskDashboardStatusFilter)} aria-label="Filter tasks by status">
            <option value="open">open</option>
            <option value="completed">completed</option>
            <option value="all">all</option>
          </select>
        </label>
        <label>
          <span>Due</span>
          <select value={due} onChange={(event) => onDueChange(event.target.value as TaskDashboardDueFilter)} aria-label="Filter tasks by due date">
            <option value="all">all</option>
            <option value="due">due</option>
            <option value="due_soon">due soon</option>
            <option value="overdue">overdue</option>
            <option value="upcoming">upcoming</option>
            <option value="follow_up">follow-up</option>
          </select>
        </label>
        <label>
          <span>Assignee</span>
          <select value={assignee} onChange={(event) => onAssigneeChange(event.target.value)} aria-label="Filter tasks by assignee">
            <option value="all">all</option>
            {agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}
          </select>
        </label>
      </div>

      {apiMode && error && <EmptyState title="Task API error" body={error} />}
      {apiMode && loading && !error && <p className="taskDashboardHint">Loading persisted tasks...</p>}
      {!loading && !error && rows.length === 0 && <p className="taskDashboardHint">{apiMode ? "No persisted tasks returned" : "No local tasks in this view"}</p>}

      {!error && rows.length > 0 && (
        <div className="taskDashboardList">
          {rows.slice(0, 8).map((task) => (
            <article className="taskDashboardRow" key={task.id}>
              <div>
                <strong>{task.title}</strong>
                <span>{task.platformLabel} / {task.accountName}</span>
                <small>{task.channelAccountId} / {task.roomId} / {task.conversationId}</small>
                <small>{task.assigneeName ?? task.assigneeUserId ?? "Unassigned"} / {task.dueAt ? formatTaskDate(task.dueAt) : "No due date"}</small>
                <small>Priority: {task.conversationPriority}</small>
              </div>
              <div className="taskDashboardEditGrid">
                <label>
                  <span>Assignee</span>
                  <select
                    value={task.source === "api" ? localAgentIdForApiUserId(task.assigneeUserId) : task.assigneeUserId ?? unassignedTaskAssignee}
                    onChange={(event) => onTaskAssigneeChange(task, event.target.value)}
                    disabled={updatingId === task.id || task.status !== "open"}
                    aria-label={`Assign task ${task.title}`}
                  >
                    <option value={unassignedTaskAssignee}>Unassigned</option>
                    {agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}
                  </select>
                </label>
                <label>
                  <span>Due date</span>
                  <input
                    type="datetime-local"
                    value={toDateTimeLocalValue(task.dueAt)}
                    onChange={(event) => onTaskDueChange(task, event.target.value)}
                    disabled={updatingId === task.id || task.status !== "open"}
                    aria-label={`Task due date ${task.title}`}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => onTaskDueChange(task, "")}
                  disabled={updatingId === task.id || task.status !== "open" || !task.dueAt}
                >
                  Clear
                </button>
              </div>
              <div className="taskDashboardActions">
                <span className={`taskStatus ${task.status}`}>{taskStatusLabel(task.status)}</span>
                <button type="button" onClick={() => onOpenConversation(task)}>
                  <ExternalLink size={13} /> Open
                </button>
                <button
                  className={actionFeedbackClassName("task-complete", completingId === task.id ? "task-complete" : null)}
                  type="button"
                  onClick={() => onCompleteTask(task)}
                  disabled={task.status !== "open" || completingId === task.id || updatingId === task.id}
                >
                  <CheckCircle2 size={13} /> {completingId === task.id ? "Saving" : "Done"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function ConversationButton({
  conversation,
  adminStore,
  selected,
  onSelect
}: {
  conversation: ConversationCard;
  adminStore: AdminStore;
  selected: boolean;
  onSelect: () => void;
}) {
  const assignedAgent = getAssignedAgent(adminStore, conversation.id);
  const priority = conversation.priority;
  const status = conversation.status;
  const sla = conversation.slaStatus
    ? getApiSlaDisplay(conversation)
    : getSlaDisplay(getSlaState(adminStore, conversation.id), new Date("2026-05-20T03:42:00.000Z"));

  return (
    <button className={selected ? "conversationCard selected" : "conversationCard"} type="button" onClick={onSelect}>
      <div className="conversationTop">
        <strong>{conversation.customerName}</strong>
        <time>{conversation.lastMessageTime}</time>
      </div>
      <div className="accountLine">
        <span>{conversation.platformLabel} / {conversation.accountName}</span>
        {conversation.unreadCount > 0 && <span className="unreadCount">{conversation.unreadCount}</span>}
      </div>
      <p>{conversation.lastMessage}</p>
      <div className="cardMeta">
        <AiStatusBadge status={conversation.aiStatus} />
        <span>{conversation.assignedAgent ?? (assignedAgent ? `${assignedAgent.name} / ${assignedAgent.status}` : "Unassigned")}</span>
      </div>
      <div className="badgeRow">
        <PriorityBadge priority={priority} />
        <StatusBadge status={status} />
        <SlaBadge status={sla.status} text={sla.text} />
      </div>
      <div className="tagRow">
        {conversation.tags.map((tag) => <span key={tag}>{tag}</span>)}
      </div>
    </button>
  );
}

function ChatHeader({
  room,
  conversation,
  assignableAgents,
  assignedAgentName,
  priority,
  status,
  sla,
  collision,
  activeActionKey,
  onAssignToMe,
  onUnassign,
  onAssign,
  onTransfer,
  onPriorityChange,
  onStatusChange,
  onTakeOver,
  onReturnToAi,
  onMarkFollowUp,
  onMarkResolved,
  onReopen,
  onMarkRead,
  onMarkReplied,
  onSetDueSoonSla,
  onCreateTask,
  onAddNote,
  onCopySummary
}: {
  room: PlatformRoom;
  conversation: ConversationCard | null;
  assignableAgents: AdminStore["agents"];
  assignedAgentName: string | null;
  priority: ConversationPriority;
  status: ConversationStatus;
  sla: { status: string; text: string } | null;
  collision: ReturnType<typeof getCollisionWarning> | null;
  activeActionKey: InboxActionFeedbackKey | null;
  onAssignToMe: () => void;
  onUnassign: () => void;
  onAssign: (agentId: string) => void;
  onTransfer: (agentId: string) => void;
  onPriorityChange: (priority: ConversationPriority) => void;
  onStatusChange: (status: ConversationStatus) => void;
  onTakeOver: () => void;
  onReturnToAi: () => void;
  onMarkFollowUp: () => void;
  onMarkResolved: () => void;
  onReopen: () => void;
  onMarkRead: () => void;
  onMarkReplied: () => void;
  onSetDueSoonSla: () => void;
  onCreateTask: () => void;
  onAddNote: () => void;
  onCopySummary: () => void;
}) {
  return (
    <header className="chatHeader">
      <div className="chatTitle">
        <h2>{conversation?.customerName ?? "No conversation selected"}</h2>
        <p>{room.platformLabel} / {room.accountName}</p>
        <div className="headerMeta">
          {conversation && <AiStatusBadge status={conversation.aiStatus} />}
          <span>{assignedAgentName ?? "Unassigned"}</span>
          <PriorityBadge priority={priority} />
          <StatusBadge status={status} />
          {sla && <SlaBadge status={sla.status} text={sla.text} />}
          {collision?.lockedByAssignment && <span>Soft warning</span>}
        </div>
      </div>
      <div className="chatActions">
        <button className={actionFeedbackClassName("take-over", activeActionKey)} type="button" onClick={onTakeOver} disabled={!conversation}><UserRoundCheck size={15} /> Take Over</button>
        <button className={actionFeedbackClassName("return-to-ai", activeActionKey)} type="button" onClick={onReturnToAi} disabled={!conversation}><Bot size={15} /> Return to AI</button>
        <button className={actionFeedbackClassName("assign-to-me", activeActionKey)} type="button" onClick={onAssignToMe} disabled={!conversation}><UserPlus size={15} /> Assign to Me</button>
        <button className={actionFeedbackClassName("unassign", activeActionKey)} type="button" onClick={onUnassign} disabled={!conversation}><UserMinus size={15} /> Unassign</button>
        <button className={actionFeedbackClassName("follow-up", activeActionKey)} type="button" onClick={onMarkFollowUp} disabled={!conversation}><Clock3 size={15} /> Follow Up</button>
        <button className={actionFeedbackClassName("resolved", activeActionKey)} type="button" onClick={onMarkResolved} disabled={!conversation}><CheckCircle2 size={15} /> Resolved</button>
        <button className={actionFeedbackClassName("reopen", activeActionKey)} type="button" onClick={onReopen} disabled={!conversation}><RotateCcw size={15} /> Reopen</button>
        <button className={actionFeedbackClassName("read", activeActionKey)} type="button" onClick={onMarkRead} disabled={!conversation}><CheckCircle2 size={15} /> Read</button>
        <button className={actionFeedbackClassName("replied", activeActionKey)} type="button" onClick={onMarkReplied} disabled={!conversation}><MessageSquareText size={15} /> Replied</button>
        <button className={actionFeedbackClassName("sla-soon", activeActionKey)} type="button" onClick={onSetDueSoonSla} disabled={!conversation}><Clock3 size={15} /> SLA Soon</button>
        <button className={actionFeedbackClassName("toolbar-create-task", activeActionKey)} type="button" onClick={onCreateTask} disabled={!conversation}><Clipboard size={15} /> Create Task</button>
        <button className={actionFeedbackClassName("toolbar-add-note", activeActionKey)} type="button" onClick={onAddNote} disabled={!conversation}><Edit3 size={15} /> Add Note</button>
        <button type="button" onClick={onCopySummary} disabled={!conversation}><Copy size={15} /> Copy Summary</button>
        <select className={actionFeedbackClassName("assign", activeActionKey)} value="" onChange={(event) => event.target.value && onAssign(event.target.value)} disabled={!conversation} aria-label="Assign conversation">
          <option value="">Assign</option>
          {assignableAgents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name} / {agent.status}</option>)}
        </select>
        <select className={actionFeedbackClassName("transfer", activeActionKey)} value="" onChange={(event) => event.target.value && onTransfer(event.target.value)} disabled={!conversation} aria-label="Transfer conversation">
          <option value="">Transfer</option>
          {assignableAgents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name} / {agent.status}</option>)}
        </select>
        <select className={actionFeedbackClassName("priority", activeActionKey)} value={priority} onChange={(event) => onPriorityChange(event.target.value as ConversationPriority)} disabled={!conversation} aria-label="Change priority">
          {priorityOptions.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <select className={actionFeedbackClassName("status", activeActionKey)} value={status} onChange={(event) => onStatusChange(event.target.value as ConversationStatus)} disabled={!conversation} aria-label="Change status">
          {statusOptions.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>
    </header>
  );
}

function CustomerPanel({
  conversation,
  contact,
  relatedConversations,
  aiActionStatus,
  aiLoading,
  aiError,
  assignedAgentName,
  apiMode,
  customerLoading,
  customerError,
  workflowLoading,
  workflowError,
  priority,
  status,
  sla,
  notes,
  auditLogs,
  statusHistory,
  auditError,
  statusHistoryError,
  adminTasks,
  contactAnalytics,
  matchingFlows,
  recentFlowRuns,
  lastFlowResult,
  broadcastHistoryRows,
  lastBroadcastCampaignName,
  broadcastHistorySummary,
  activeWorkflowEditor,
  workflowEditorError,
  taskTitleDraft,
  taskDescriptionDraft,
  taskPriorityDraft,
  taskAssigneeDraft,
  taskDueDraft,
  taskAssigneeAgents,
  noteDraft,
  noteVisibility,
  onUseDraft,
  onCopySuggestedReply,
  onViewSource,
  onRegenerate,
  onMarkWrong,
  activeActionKey,
  onTakeOver,
  onReturnToAi,
  onAssignToMe,
  onMarkFollowUp,
  onMarkResolved,
  onReopen,
  onMarkRead,
  onMarkReplied,
  onSetDueSoonSla,
  onCreateAdminTask,
  onRunFlow,
  onCopySummary,
  onAddNote,
  onQuickAddNote,
  onAddInternalNote,
  onSaveWorkflowTask,
  onCancelWorkflowEditor,
  onEditInternalNote,
  onDeleteInternalNote,
  onPinInternalNote,
  onNoteDraftChange,
  onNoteVisibilityChange,
  onTaskTitleDraftChange,
  onTaskDescriptionDraftChange,
  onTaskPriorityDraftChange,
  onTaskAssigneeDraftChange,
  onTaskDueDraftChange,
  onCreateTask,
  onMarkTaskDone,
  onLeadStatusChange,
  onAddTag,
  onRemoveTag,
  onLinkIdentity,
  onCreateContact,
  onUnlinkIdentity,
  onSetPrimaryIdentity,
  onToggleBroadcastOptOut
}: {
  conversation: ConversationCard | null;
  contact: Contact | null;
  relatedConversations: ConversationCard[];
  aiActionStatus: string;
  aiLoading: boolean;
  aiError: string;
  assignedAgentName: string;
  apiMode: boolean;
  customerLoading: boolean;
  customerError: string;
  workflowLoading: boolean;
  workflowError: string;
  priority: ConversationPriority;
  status: ConversationStatus;
  sla: { status: string; text: string } | null;
  notes: ReturnType<typeof getVisibleInternalNotes>;
  auditLogs: ReturnType<typeof getAuditLogsForConversation>;
  statusHistory: ConversationStatusHistory[];
  auditError: string;
  statusHistoryError: string;
  adminTasks: ReturnType<typeof getOpenAdminTasks>;
  contactAnalytics: ReturnType<typeof getContactAnalytics>;
  matchingFlows: ReturnType<typeof getMatchingFlows>;
  recentFlowRuns: ReturnType<typeof getFlowRunHistory>;
  lastFlowResult: FlowTestRunResult | FlowRunTestResult | null;
  broadcastHistoryRows: BroadcastHistoryPanelRow[];
  lastBroadcastCampaignName: string;
  broadcastHistorySummary: Customer360["broadcastHistorySummary"] | null;
  activeWorkflowEditor: InboxWorkflowEditorMode | null;
  workflowEditorError: string;
  taskTitleDraft: string;
  taskDescriptionDraft: string;
  taskPriorityDraft: ConversationPriority;
  taskAssigneeDraft: string;
  taskDueDraft: string;
  taskAssigneeAgents: AdminStore["agents"];
  noteDraft: string;
  noteVisibility: InternalNoteVisibility;
  onUseDraft: () => void;
  onCopySuggestedReply: () => void;
  onViewSource: () => void;
  onRegenerate: () => void;
  onMarkWrong: () => void;
  activeActionKey: InboxActionFeedbackKey | null;
  onTakeOver: () => void;
  onReturnToAi: () => void;
  onAssignToMe: () => void;
  onMarkFollowUp: () => void;
  onMarkResolved: () => void;
  onReopen: () => void;
  onMarkRead: () => void;
  onMarkReplied: () => void;
  onSetDueSoonSla: () => void;
  onCreateAdminTask: () => void;
  onRunFlow: (flowId: string) => void;
  onCopySummary: () => void;
  onAddNote: () => void;
  onQuickAddNote: () => void;
  onAddInternalNote: () => void;
  onSaveWorkflowTask: () => void;
  onCancelWorkflowEditor: () => void;
  onEditInternalNote: () => void;
  onDeleteInternalNote: () => void;
  onPinInternalNote: () => void;
  onNoteDraftChange: (value: string) => void;
  onNoteVisibilityChange: (value: InternalNoteVisibility) => void;
  onTaskTitleDraftChange: (value: string) => void;
  onTaskDescriptionDraftChange: (value: string) => void;
  onTaskPriorityDraftChange: (value: ConversationPriority) => void;
  onTaskAssigneeDraftChange: (value: string) => void;
  onTaskDueDraftChange: (value: string) => void;
  onCreateTask: () => void;
  onMarkTaskDone: () => void;
  onLeadStatusChange: (leadStatus: LeadStatus) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
  onLinkIdentity: () => void;
  onCreateContact: () => void;
  onUnlinkIdentity: () => void;
  onSetPrimaryIdentity: () => void;
  onToggleBroadcastOptOut: () => void;
}) {
  if (!conversation) {
    return (
      <div className="panelBlock">
        <div className="blockHeader">
          <PanelRightOpen size={17} />
          <h3>Customer 360</h3>
        </div>
        <EmptyState title="No customer selected" body="Select a conversation to see Customer 360 and AI context." />
      </div>
    );
  }

  if (apiMode && customerLoading) {
    return (
      <div className="panelBlock">
        <div className="blockHeader">
          <PanelRightOpen size={17} />
          <h3>Customer 360</h3>
        </div>
        <EmptyState title="Loading Customer 360" body="Fetching persisted contact and identity data from the API." />
      </div>
    );
  }

  if (apiMode && customerError) {
    return (
      <div className="panelBlock">
        <div className="blockHeader">
          <PanelRightOpen size={17} />
          <h3>Customer 360</h3>
        </div>
        <EmptyState title="Customer 360 API error" body={customerError} />
      </div>
    );
  }

  return (
    <>
      <section className="panelBlock">
        <div className="blockHeader">
          <PanelRightOpen size={17} />
          <h3>Customer 360</h3>
        </div>
        <dl className="profileGrid">
          <div><dt>Name</dt><dd>{contact?.displayName ?? conversation.customerName}</dd></div>
          <div><dt>Email</dt><dd>{contact?.email ?? conversation.customerEmail}</dd></div>
          <div><dt>Phone</dt><dd>{contact?.phone ?? conversation.customerPhone}</dd></div>
          <div><dt>Owner</dt><dd>{assignedAgentName}</dd></div>
          <div><dt>Priority</dt><dd><PriorityBadge priority={priority} /></dd></div>
          <div><dt>SLA</dt><dd>{sla ? <SlaBadge status={sla.status} text={sla.text} /> : "No SLA"}</dd></div>
          <div><dt>Status</dt><dd><StatusBadge status={status} /></dd></div>
          <div><dt>Lead status</dt><dd>{contact?.leadStatus ?? "new"}</dd></div>
        </dl>
        <div className="crmActionGrid">
          <Link href={contact ? `/contacts?contact=${contact.id}` : "/contacts"} className="crmLinkButton"><ExternalLink size={14} /> Open Full Contact</Link>
          <button className={actionFeedbackClassName("customer-add-note", activeActionKey)} type="button" onClick={onAddNote} disabled={workflowLoading}>Add Note</button>
          <button className={actionFeedbackClassName("customer-create-task", activeActionKey)} type="button" onClick={onCreateTask} disabled={workflowLoading}>Create Task</button>
          <button type="button" onClick={onLinkIdentity} disabled={!contact}>Link Identity</button>
          <button type="button" onClick={onCreateContact}>Create New Contact</button>
          <button type="button" onClick={onUnlinkIdentity} disabled={!contact || contact.identities.length <= 1}>Unlink Identity</button>
          <button type="button" onClick={onSetPrimaryIdentity} disabled={!contact}>Set Primary</button>
          <button type="button" onClick={() => onLeadStatusChange("follow_up")} disabled={!contact}>Set Follow Up</button>
        </div>
      </section>

      {activeWorkflowEditor && (
        <WorkflowEditorPanel
          mode={activeWorkflowEditor}
          activeActionKey={activeActionKey}
          workflowLoading={workflowLoading}
          workflowError={workflowEditorError || workflowError}
          noteDraft={noteDraft}
          noteVisibility={noteVisibility}
          taskTitleDraft={taskTitleDraft}
          taskDescriptionDraft={taskDescriptionDraft}
          taskPriorityDraft={taskPriorityDraft}
          taskAssigneeDraft={taskAssigneeDraft}
          taskDueDraft={taskDueDraft}
          taskAssigneeAgents={taskAssigneeAgents}
          onNoteDraftChange={onNoteDraftChange}
          onNoteVisibilityChange={onNoteVisibilityChange}
          onTaskTitleDraftChange={onTaskTitleDraftChange}
          onTaskDescriptionDraftChange={onTaskDescriptionDraftChange}
          onTaskPriorityDraftChange={onTaskPriorityDraftChange}
          onTaskAssigneeDraftChange={onTaskAssigneeDraftChange}
          onTaskDueDraftChange={onTaskDueDraftChange}
          onSaveNote={onAddInternalNote}
          onSaveTask={onSaveWorkflowTask}
          onCancel={onCancelWorkflowEditor}
        />
      )}

      <section className="panelBlock">
        <div className="blockHeader">
          <Radio size={17} />
          <h3>Broadcast history</h3>
        </div>
        <dl className="profileGrid">
          <div><dt>Opt-out</dt><dd>{contact?.optOutBroadcast ? `Yes / ${contact.suppressedReason ?? "suppressed"}` : "No"}</dd></div>
          <div><dt>Last campaign</dt><dd>{lastBroadcastCampaignName}</dd></div>
          {apiMode && <div><dt>External calls</dt><dd>{broadcastHistorySummary?.externalCalls ?? 0}</dd></div>}
        </dl>
        <button className="smallPanelButton" type="button" onClick={onToggleBroadcastOptOut} disabled={!contact || workflowLoading}>{contact?.optOutBroadcast ? "Allow broadcast" : "Opt out broadcast"}</button>
        {apiMode && <p className="noteText">Broadcast consent and history are loaded from the API for this tenant. Provider outbound remains disabled.</p>}
        <div className="miniList">
          {broadcastHistoryRows.slice(0, 3).map((item) => <p key={item.id}>{item.campaignName} / {item.platform} / {item.status}{item.roomId ? ` / ${item.roomId}` : ""}</p>)}
          {broadcastHistoryRows.length === 0 && <p>{apiMode ? "No persisted API broadcast history yet" : "No broadcast history yet"}</p>}
        </div>
      </section>

      <section className="panelBlock">
        <div className="blockHeader">
          <Clipboard size={17} />
          <h3>Quick actions</h3>
        </div>
        <div className="aiActionGrid">
          <button className={actionFeedbackClassName("assign-to-me", activeActionKey)} type="button" onClick={onAssignToMe} disabled={workflowLoading}>Assign to Me</button>
          <button className={actionFeedbackClassName("take-over", activeActionKey)} type="button" onClick={onTakeOver} disabled={workflowLoading}>Take Over</button>
          <button className={actionFeedbackClassName("return-to-ai", activeActionKey)} type="button" onClick={onReturnToAi}>Return to AI</button>
          <button className={actionFeedbackClassName("follow-up", activeActionKey)} type="button" onClick={onMarkFollowUp} disabled={workflowLoading}>Mark Follow Up</button>
          <button className={actionFeedbackClassName("resolved", activeActionKey)} type="button" onClick={onMarkResolved}>Mark Resolved</button>
          <button className={actionFeedbackClassName("reopen", activeActionKey)} type="button" onClick={onReopen}>Reopen</button>
          <button className={actionFeedbackClassName("read", activeActionKey)} type="button" onClick={onMarkRead} disabled={workflowLoading}>Mark Read</button>
          <button className={actionFeedbackClassName("replied", activeActionKey)} type="button" onClick={onMarkReplied} disabled={workflowLoading}>Mark Replied</button>
          <button className={actionFeedbackClassName("sla-soon", activeActionKey)} type="button" onClick={onSetDueSoonSla} disabled={workflowLoading}>SLA Due Soon</button>
          <button className={actionFeedbackClassName("quick-add-note", activeActionKey)} type="button" onClick={onQuickAddNote} disabled={workflowLoading}>Add Note</button>
          <button className={actionFeedbackClassName("quick-create-task", activeActionKey)} type="button" onClick={onCreateAdminTask} disabled={workflowLoading}>Create Task</button>
          <button type="button" onClick={onCopySummary}>Copy Summary</button>
        </div>
      </section>

      <section className="panelBlock">
        <div className="blockHeader">
          <BarChart3 size={17} />
          <h3>Mini analytics</h3>
        </div>
        <dl className="profileGrid">
          <div><dt>Conversations</dt><dd>{contactAnalytics.conversationCount}</dd></div>
          <div><dt>Last response</dt><dd>{contactAnalytics.lastResponseTime}</dd></div>
          <div><dt>Current SLA</dt><dd>{contactAnalytics.currentSlaState}</dd></div>
          <div><dt>AI confidence</dt><dd>{Math.round(contactAnalytics.latestAiConfidence * 100)}%</dd></div>
          <div><dt>Handoff history</dt><dd>{contactAnalytics.handoffHistoryCount}</dd></div>
        </dl>
      </section>

      <section className="panelBlock">
        <div className="blockHeader">
          <MessageSquareText size={17} />
          <h3>Linked identities</h3>
        </div>
        <div className="identityList">
          {(contact?.identities ?? conversation.linkedIdentities).map((identity) => (
            <div key={`${identity.platform}-${identity.externalUserId}`} className="identityRow">
              <strong>{identity.platform.toUpperCase()}{"isPrimary" in identity && identity.isPrimary ? " / PRIMARY" : ""}</strong>
              <span>{identity.accountName}</span>
              <small>{identity.displayName} / {identity.externalUserId}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="panelBlock">
        <div className="blockHeader">
          <Tags size={17} />
          <h3>Tags</h3>
        </div>
        <div className="tagRow panelTags">
          {(contact?.tags ?? conversation.tags).map((tag) => <button className="tagPillButton" key={tag} type="button" onClick={() => onRemoveTag(tag)}>{tag}</button>)}
        </div>
        <button className="smallPanelButton" type="button" onClick={onAddTag} disabled={!contact}>Add vip tag</button>
      </section>

      <section className="panelBlock">
        <div className="blockHeader">
          <FileText size={17} />
          <h3>Internal notes</h3>
        </div>
        <div className="noteEditor">
          <textarea value={noteDraft} onChange={(event) => onNoteDraftChange(event.target.value)} placeholder="Write an internal note..." />
          <select value={noteVisibility} onChange={(event) => onNoteVisibilityChange(event.target.value as InternalNoteVisibility)}>
            <option value="team">Team</option>
            <option value="supervisor">Supervisor</option>
          </select>
          <button className={actionFeedbackClassName("internal-note-save", activeActionKey)} type="button" onClick={onAddInternalNote} disabled={!noteDraft.trim() || workflowLoading}>Add Note</button>
        </div>
        <div className="inlineActions">
          <button type="button" onClick={onPinInternalNote} disabled={notes.length === 0 || apiMode}><Pin size={13} /> Pin</button>
          <button type="button" onClick={onEditInternalNote} disabled={notes.length === 0 || apiMode}><Edit3 size={13} /> Edit</button>
          <button type="button" onClick={onDeleteInternalNote} disabled={notes.length === 0 || apiMode}><Trash2 size={13} /> Delete</button>
        </div>
        {apiMode && workflowLoading && <p className="noteText">Loading workflow data...</p>}
        {apiMode && workflowError && <p className="noteText">{workflowError}</p>}
        <div className="miniList">
          {(contact?.notes ?? []).slice(0, 4).map((note) => (
            <p key={note.id}>
              CRM / {note.body}
            </p>
          ))}
          {notes.slice(0, 4).map((note) => (
            <p key={note.id}>
              {note.pinned ? "PIN / " : ""}{note.visibility} / {note.body}
            </p>
          ))}
          {notes.length === 0 && (contact?.notes ?? []).length === 0 && <p>{conversation.notesPlaceholder}</p>}
        </div>
      </section>

      <section className="panelBlock">
        <div className="blockHeader">
          <CheckCircle2 size={17} />
          <h3>Open tasks</h3>
        </div>
        <div className="miniList">
          {adminTasks.slice(0, 3).map((task) => <p key={task.id}>{task.title}</p>)}
          {(contact?.tasks.filter((task) => task.status === "open") ?? []).slice(0, 3).map((task) => (
            <p key={task.id}>
              {task.title}
              {apiMode && task.platform && task.channelAccountId && task.roomId
                ? ` / ${task.platform} / ${task.channelAccountId} / ${task.roomId}`
                : ""}
            </p>
          ))}
          {adminTasks.length === 0 && !contact?.tasks.some((task) => task.status === "open") && <p>No open tasks</p>}
        </div>
        <button className={actionFeedbackClassName("task-complete", activeActionKey, "smallPanelButton")} type="button" onClick={onMarkTaskDone} disabled={workflowLoading || !(apiMode ? adminTasks.length > 0 : contact?.tasks.some((task) => task.status === "open"))}>Mark first task done</button>
      </section>

      <section className="panelBlock">
        <div className="blockHeader">
          <MessageSquareText size={17} />
          <h3>Related conversations</h3>
        </div>
        <div className="identityList">
          {relatedConversations.map((item) => (
            <div key={item.id} className="identityRow">
              <strong>{item.platformLabel} / {item.accountName}</strong>
              <span>{item.id} / {item.roomId}</span>
              <small>
                {item.channelAccountId ? `${item.channelAccountId} / ` : ""}
                {item.lastMessage} / {item.closed ? "closed" : "open"}
              </small>
            </div>
          ))}
          {relatedConversations.length === 0 && <p className="noteText">No linked conversations yet</p>}
        </div>
      </section>

      <section className="panelBlock">
        <div className="blockHeader">
          <ShieldAlert size={17} />
          <h3>Audit log</h3>
        </div>
        <div className="identityList">
          {apiMode && auditError && <p className="noteText">Audit log API error: {auditError}</p>}
          {auditLogs.slice(0, 6).map((log) => (
            <div key={log.id} className="identityRow">
              <strong>{log.action}</strong>
              <span>{log.actorId}</span>
              <small>{formatAuditTimelineContext(log.metadata)} / {new Date(log.createdAt).toLocaleString("th-TH")}</small>
            </div>
          ))}
          {auditLogs.length === 0 && !auditError && <p className="noteText">No audit logs yet</p>}
        </div>
      </section>

      {apiMode && (
        <section className="panelBlock">
          <div className="blockHeader">
            <Clock3 size={17} />
            <h3>Status history</h3>
          </div>
          <div className="identityList">
            {statusHistoryError && <p className="noteText">Status history API error: {statusHistoryError}</p>}
            {statusHistory.slice(0, 5).map((item) => (
              <div key={item.id} className="identityRow">
                <strong>{item.fromStatus ?? "new"}{" -> "}{item.toStatus}</strong>
                <span>{item.actorUserId ?? "system"}</span>
                <small>{item.platform} / {item.channelAccountId} / {item.roomId} / {new Date(item.createdAt).toLocaleString("th-TH")}</small>
              </div>
            ))}
            {statusHistory.length === 0 && !statusHistoryError && <p className="noteText">No status changes yet</p>}
          </div>
        </section>
      )}

      <section className="panelBlock">
        <div className="blockHeader">
          <Workflow size={17} />
          <h3>Matching Automations</h3>
        </div>
        <div className="identityList">
          {matchingFlows.slice(0, 4).map((flow) => (
            <div key={flow.id} className="identityRow">
              <strong>{flow.name}</strong>
              <span>{flow.triggerType} / {flow.platformScope.join(", ")}</span>
              <small>{flow.roomIds.length > 0 ? flow.roomIds.join(", ") : "all scoped rooms"}</small>
              <div className="inlineActions">
                <button type="button" onClick={() => onRunFlow(flow.id)}>Run Flow</button>
                <Link href={`/flows?flow=${flow.id}`} className="crmLinkButton"><ExternalLink size={13} /> View Flow</Link>
              </div>
            </div>
          ))}
          {matchingFlows.length === 0 && <p className="noteText">No active automation matches this selected conversation.</p>}
        </div>
        <div className="miniList">
          <strong>Recent Flow Runs</strong>
          {recentFlowRuns.map((run) => (
            <p key={run.id}>{run.status} / {run.resultSummary} / {run.steps.length} steps</p>
          ))}
          {recentFlowRuns.length === 0 && <p>No recent flow runs for this conversation</p>}
        </div>
        {lastFlowResult && lastFlowResult.flowRun.conversationId === conversation.id && (
          <div className="sourceList">
            <strong>Last run steps</strong>
            {lastFlowResult.flowRun.steps.slice(0, 5).map((step) => (
              <article key={step.id} className="sourceItem">
                <span>{step.nodeType} / {step.status}</span>
                <small>{step.error ?? JSON.stringify(step.output ?? {})}</small>
              </article>
            ))}
            <p>Audit logs created: {lastFlowResult.state.auditLogsCreated.length}</p>
          </div>
        )}
      </section>

      <section className="panelBlock aiPanel">
        <div className="blockHeader">
          <Bot size={17} />
          <h3>AI Summary</h3>
        </div>
        {apiMode && aiLoading && <p className="noteText">Loading AI suggestion from API...</p>}
        {apiMode && aiError && <EmptyState title="AI suggestion API error" body={aiError} />}
        <p className="summaryText">{conversation.aiSummary}</p>
        <dl className="aiGrid">
          <div><dt>AI Decision</dt><dd>{conversation.aiDecision}</dd></div>
          <div><dt>Intent</dt><dd>{conversation.intent}</dd></div>
          <div><dt>Confidence</dt><dd>{Math.round(conversation.confidence * 100)}%</dd></div>
          <div><dt>Risk level</dt><dd>{conversation.riskLevel}</dd></div>
          <div><dt>Next action</dt><dd>{conversation.nextAction}</dd></div>
          <div><dt>Suggested reply</dt><dd>{conversation.aiAnalysis?.reply ?? conversation.nextAction}</dd></div>
          <div><dt>Requires human</dt><dd>{conversation.aiAnalysis?.requiresHuman ? "Yes" : conversation.aiStatus === "Need Human" ? "Yes" : "No"}</dd></div>
          {apiMode && <div><dt>External calls</dt><dd>{conversation.aiSuggestionExternalCalls ?? 0}</dd></div>}
        </dl>
        <div className="sourceList">
          <strong>Knowledge Sources</strong>
          {(conversation.aiAnalysis?.matchedKnowledge ?? []).length === 0 ? (
            <p>No active knowledge matched.</p>
          ) : (
            conversation.aiAnalysis?.matchedKnowledge?.map((source) => (
              <article key={source.id} className="sourceItem">
                <span>{source.title}</span>
                <small>{source.category} / {source.matchReason}</small>
              </article>
            ))
          )}
        </div>
        <div className="aiActionGrid">
          <button type="button" onClick={onViewSource} disabled={aiLoading}>View Source</button>
          <button type="button" onClick={onCopySuggestedReply} disabled={aiLoading}>Copy Suggested Reply</button>
          <button type="button" onClick={onUseDraft} disabled={aiLoading}>Use AI Draft</button>
          <button type="button" onClick={onMarkWrong} disabled={aiLoading}>Mark as Wrong</button>
          <button type="button" onClick={onRegenerate} disabled={aiLoading}>Regenerate Draft</button>
          <button className={actionFeedbackClassName("take-over", activeActionKey)} type="button" onClick={onTakeOver}>Take Over</button>
        </div>
        <p className="aiActionStatus">{aiActionStatus}</p>
      </section>
    </>
  );
}

function WorkflowEditorPanel({
  mode,
  activeActionKey,
  workflowLoading,
  workflowError,
  noteDraft,
  noteVisibility,
  taskTitleDraft,
  taskDescriptionDraft,
  taskPriorityDraft,
  taskAssigneeDraft,
  taskDueDraft,
  taskAssigneeAgents,
  onNoteDraftChange,
  onNoteVisibilityChange,
  onTaskTitleDraftChange,
  onTaskDescriptionDraftChange,
  onTaskPriorityDraftChange,
  onTaskAssigneeDraftChange,
  onTaskDueDraftChange,
  onSaveNote,
  onSaveTask,
  onCancel
}: {
  mode: InboxWorkflowEditorMode;
  activeActionKey: InboxActionFeedbackKey | null;
  workflowLoading: boolean;
  workflowError: string;
  noteDraft: string;
  noteVisibility: InternalNoteVisibility;
  taskTitleDraft: string;
  taskDescriptionDraft: string;
  taskPriorityDraft: ConversationPriority;
  taskAssigneeDraft: string;
  taskDueDraft: string;
  taskAssigneeAgents: AdminStore["agents"];
  onNoteDraftChange: (value: string) => void;
  onNoteVisibilityChange: (value: InternalNoteVisibility) => void;
  onTaskTitleDraftChange: (value: string) => void;
  onTaskDescriptionDraftChange: (value: string) => void;
  onTaskPriorityDraftChange: (value: ConversationPriority) => void;
  onTaskAssigneeDraftChange: (value: string) => void;
  onTaskDueDraftChange: (value: string) => void;
  onSaveNote: () => void;
  onSaveTask: () => void;
  onCancel: () => void;
}) {
  const copy = getWorkflowEditorCopy(mode);
  const isNote = mode === "note";
  const noteCopy = getWorkflowEditorCopy("note");
  const taskCopy = getWorkflowEditorCopy("task");
  return (
    <section className="panelBlock workflowEditorPanel" aria-label={copy.title}>
      <div className="blockHeader">
        {isNote ? <FileText size={17} /> : <Clipboard size={17} />}
        <h3>{copy.title}</h3>
      </div>
      {isNote ? (
        <div className="workflowForm">
          <textarea
            autoFocus
            value={noteDraft}
            onChange={(event) => onNoteDraftChange(event.target.value)}
            placeholder={noteCopy.bodyPlaceholder}
            aria-label="Internal note text"
          />
          <select value={noteVisibility} onChange={(event) => onNoteVisibilityChange(event.target.value as InternalNoteVisibility)} aria-label="Note visibility">
            <option value="team">Team</option>
            <option value="supervisor">Supervisor</option>
          </select>
          <div className="workflowButtonRow">
            <button className={actionFeedbackClassName("note-save", activeActionKey)} type="button" onClick={onSaveNote} disabled={!noteDraft.trim() || workflowLoading}>
              {workflowLoading ? "Saving..." : noteCopy.primaryLabel}
            </button>
            <button type="button" onClick={onCancel} disabled={workflowLoading}>{noteCopy.cancelLabel}</button>
          </div>
        </div>
      ) : (
        <div className="workflowForm">
          <input
            autoFocus
            value={taskTitleDraft}
            onChange={(event) => onTaskTitleDraftChange(event.target.value)}
            placeholder={taskCopy.titlePlaceholder}
            aria-label="Task title"
          />
          <textarea
            value={taskDescriptionDraft}
            onChange={(event) => onTaskDescriptionDraftChange(event.target.value)}
            placeholder={taskCopy.descriptionPlaceholder}
            aria-label="Task details"
          />
          <select value={taskPriorityDraft} onChange={(event) => onTaskPriorityDraftChange(event.target.value as ConversationPriority)} aria-label="Task priority">
            {priorityOptions.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <div className="workflowInlineGrid">
            <select value={taskAssigneeDraft} onChange={(event) => onTaskAssigneeDraftChange(event.target.value)} aria-label="Task assignee">
              <option value={unassignedTaskAssignee}>Unassigned</option>
              {taskAssigneeAgents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}
            </select>
            <input
              type="datetime-local"
              value={taskDueDraft}
              onChange={(event) => onTaskDueDraftChange(event.target.value)}
              aria-label="Task due date"
            />
          </div>
          <div className="workflowButtonRow">
            <button className={actionFeedbackClassName("task-save", activeActionKey)} type="button" onClick={onSaveTask} disabled={!taskTitleDraft.trim() || workflowLoading}>
              {workflowLoading ? "Creating..." : taskCopy.primaryLabel}
            </button>
            <button type="button" onClick={onCancel} disabled={workflowLoading}>{taskCopy.cancelLabel}</button>
          </div>
        </div>
      )}
      {workflowError && <p className="noteText workflowError">{workflowError}</p>}
    </section>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const attachments = message.attachments ?? [];
  return (
    <article className={`messageBubble ${message.sender}`}>
      <div className="messageMeta">
        {message.sender === "ai" && <Bot size={13} />}
        {message.sender === "ai_draft" && <Sparkles size={13} />}
        {message.sender === "automation" && <Workflow size={13} />}
        {message.sender === "system" && <ShieldAlert size={13} />}
        {message.sender === "agent" && <UserRoundCheck size={13} />}
        {message.sender === "customer" && <MessageSquareText size={13} />}
        <span>{message.sender}</span>
        <time>{message.time}</time>
      </div>
      {message.body ? <p>{message.body}</p> : null}
      {attachments.length > 0 ? (
        <div className="messageAttachments">
          {attachments.map((attachment) => (
            <MessageAttachmentView key={attachment.id} attachment={attachment} />
          ))}
        </div>
      ) : null}
    </article>
  );
}

function MessageAttachmentView({ attachment }: { attachment: ChatAttachment }) {
  if (attachment.type === "image" && attachment.url) {
    return (
      <a className="messageImageLink" href={attachment.url} target="_blank" rel="noreferrer" title="Open image">
        <img src={attachment.url} alt={attachment.filename ?? "image"} loading="lazy" />
      </a>
    );
  }
  if (attachment.type === "audio" && attachment.url) {
    return <audio className="messageAudio" src={attachment.url} controls preload="none" />;
  }
  const label = attachment.filename ?? "Attachment";
  const size = formatAttachmentSize(attachment.sizeBytes);
  const chip = (
    <span className="messageFileChip">
      <Paperclip size={14} />
      <span className="messageFileName">{label}</span>
      {size ? <span className="messageFileSize">{size}</span> : null}
    </span>
  );
  return attachment.url ? (
    <a className="messageFileLink" href={attachment.url} target="_blank" rel="noreferrer" download={attachment.filename}>
      {chip}
    </a>
  ) : (
    chip
  );
}

function formatAttachmentSize(bytes: number | undefined): string | null {
  if (!bytes || bytes <= 0) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function AiStatusBadge({ status }: { status: AiStatus }) {
  return <span className={`aiBadge ${aiStatusClass[status]}`}>{status}</span>;
}

function PriorityBadge({ priority }: { priority: ConversationPriority }) {
  return <span className={`priorityBadge ${priority}`}>{priority}</span>;
}

function StatusBadge({ status }: { status: ConversationStatus }) {
  return <span className={`statusBadge ${status}`}>{status}</span>;
}

function SlaBadge({ status, text }: { status: string; text: string }) {
  return <span className={`slaBadge ${status}`}>SLA {status} / {text}</span>;
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="emptyState">
      <Archive size={18} />
      <strong>{title}</strong>
      <p>{body}</p>
    </div>
  );
}

function filterLabel(filter: ConversationFilter) {
  return filterOptions.find((item) => item.id === filter)?.label ?? filter;
}

function isAdminConversationFilter(filter: ConversationFilter): filter is AdminConversationFilter {
  return adminFilterIds.has(filter);
}

function mapApiWorkflowTaskToAdminTask(task: {
  id: string;
  conversationId: string;
  contactId: string;
  title: string;
  status: "open" | "done" | "cancelled";
  createdByUserId: string | null;
  dueAt?: string | null;
  createdAt: string;
}): AdminTask {
  return {
    id: task.id,
    conversationId: task.conversationId,
    contactId: task.contactId,
    title: task.title,
    status: task.status === "done" ? "done" : "open",
    createdBy: task.createdByUserId ?? "system",
    createdAt: task.createdAt,
    dueAt: task.dueAt ?? null
  };
}

function mapApiAuditLogs(logs: ConversationAuditLog[]): ReturnType<typeof getAuditLogsForConversation> {
  return logs.map((log) => ({
    id: log.id,
    actorId: log.actorUserId ?? "system",
    action: log.action,
    targetType: "conversation",
    targetId: log.conversationId ?? "",
    metadata: isRecord(log.metadataJson) ? log.metadataJson : {},
    createdAt: log.createdAt
  }));
}

function mapApiBroadcastHistoryRows(rows: Customer360["broadcastHistorySummary"]["rows"]): BroadcastHistoryPanelRow[] {
  return rows.map((row) => ({
    id: row.id,
    campaignName: row.campaignName ?? row.campaignId,
    platform: row.platform,
    channelAccountId: row.channelAccountId,
    roomId: row.roomId,
    status: row.status,
    at: row.sentAt ?? row.queuedAt
  }));
}

function mapLocalBroadcastHistoryRows(rows: ReturnType<typeof getBroadcastHistoryForContact>): BroadcastHistoryPanelRow[] {
  return rows.map((item) => ({
    id: item.recipient.id,
    campaignName: item.campaign?.name ?? item.recipient.campaignId,
    platform: item.recipient.platform,
    roomId: item.recipient.roomId,
    status: item.recipient.status,
    at: item.recipient.updatedAt ?? item.recipient.createdAt
  }));
}

function getApiSlaDisplay(conversation: ConversationCard) {
  const status = conversation.slaStatus ?? "ok";
  const dueAt = conversation.firstResponseDueAt ?? conversation.slaDueAt ?? conversation.resolutionDueAt;
  if (!dueAt) return { status, text: "No SLA" };
  const deltaMs = new Date(dueAt).getTime() - Date.now();
  const minutes = Math.ceil(Math.abs(deltaMs) / 60000);
  return {
    status,
    text: status === "breached" || deltaMs < 0 ? `${minutes}m overdue` : `${minutes}m left`
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function filterConversationCardsByKeyword(conversations: ConversationCard[], keyword: string) {
  const needle = keyword.trim().toLowerCase();
  if (!needle) return conversations;
  return conversations.filter((conversation) =>
    [
      conversation.id,
      conversation.roomId,
      conversation.channelAccountId ?? "",
      conversation.platformLabel,
      conversation.accountName,
      conversation.customerName,
      conversation.customerEmail,
      conversation.customerPhone,
      conversation.lastMessage,
      ...conversation.tags
    ].some((value) => value.toLowerCase().includes(needle))
  );
}

function sortConversationCards(
  conversations: ConversationCard[],
  sortOrder: "latest_desc" | "latest_asc" | "updated_desc" | "updated_asc",
  adminStore: AdminStore
) {
  if (sortOrder === "latest_desc" || sortOrder === "updated_desc") return sortConversationsByPriority(conversations, adminStore);
  return [...sortConversationsByPriority(conversations, adminStore)].reverse();
}

function formatAuditTimelineContext(metadata: Record<string, unknown>) {
  const platform = typeof metadata.platform === "string" ? metadata.platform : "platform?";
  const channelAccountId = typeof metadata.channelAccountId === "string" ? metadata.channelAccountId : "account?";
  const roomId = typeof metadata.roomId === "string" ? metadata.roomId : "room?";
  return `${platform} / ${channelAccountId} / ${roomId}`;
}

function formatTaskDate(value: string) {
  return new Date(value).toLocaleString("th-TH", { dateStyle: "short", timeStyle: "short" });
}

function apiUserIdForAgentId(agentId: string) {
  return apiAgentIds[agentId] ?? null;
}

function localAgentIdForApiUserId(userId: string | null) {
  if (!userId) return unassignedTaskAssignee;
  return Object.entries(apiAgentIds).find(([, apiUserId]) => apiUserId === userId)?.[0] ?? unassignedTaskAssignee;
}

function toDateTimeLocalValue(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function dateTimeLocalInputToIso(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function readableApiError(error: unknown) {
  return error instanceof Error
    ? error.message
    : "API request failed. Check that the backend server is running and NEXT_PUBLIC_API_BASE_URL is correct.";
}
