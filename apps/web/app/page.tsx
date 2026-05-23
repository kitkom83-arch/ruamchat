"use client";

import {
  Archive,
  AlertTriangle,
  BarChart3,
  Bot,
  CheckCircle2,
  ChevronDown,
  Clipboard,
  Clock3,
  ContactRound,
  Copy,
  Edit3,
  ExternalLink,
  FileText,
  Inbox,
  MessageSquareText,
  PanelRightOpen,
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
  Workflow,
  type LucideIcon
} from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import type { CannedReply, ConversationAuditLog, ConversationFilter, ConversationPriority, ConversationStatus, ConversationStatusHistory, CoreConversationCard, Customer360, Flow, FlowTestRunResult, InternalNoteVisibility } from "@ai-omni/shared";
import type { Contact, LeadStatus } from "@ai-omni/shared";
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
  scopeApiConversationsToRoom,
  subscribeDemoConversationInputs,
  webchatDemoConversationId,
  type AiStatus,
  type ChatMessage,
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
  addContactNote,
  addContactTag,
  createContactFromIdentity,
  createContactTask,
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
  updateConversationPriority,
  updateConversationReadState,
  updateConversationSla,
  updateConversationStatus,
  updateContact as updateApiContact
} from "./api-client";
import { dataMode, isApiMode, isMockMode } from "./data-mode";
import { findCannedReplyInList, getCannedRepliesForMode, mapSettingsCannedReplyToCannedReply, resolveCannedReplyComposerDraft, searchCannedReplyList } from "./settings-data";

const tabOptions: Array<{ id: InboxTab; label: string }> = [
  { id: "human", label: "Human" },
  { id: "bot", label: "Bot" }
];

const navItems: Array<{ label: string; icon: LucideIcon; href: string; active?: boolean }> = [
  { label: "Inbox", icon: Inbox, href: "/", active: true },
  { label: "Analytics", icon: BarChart3, href: "/analytics" },
  { label: "Contacts", icon: ContactRound, href: "/contacts" },
  { label: "Broadcasts", icon: Radio, href: "/broadcasts" },
  { label: "AI Center", icon: Bot, href: "/ai-center" },
  { label: "Flows", icon: Workflow, href: "/flows" }
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
const apiAgentIds: Record<string, string> = {
  "agent-may": "00000000-0000-4000-8000-000000000011",
  "agent-ton": "00000000-0000-4000-8000-000000000012",
  "agent-beam": "00000000-0000-4000-8000-000000000013"
};

export default function InboxDashboard() {
  const apiMode = isApiMode();
  const [rooms, setRooms] = useState<PlatformRoom[]>(() => apiMode ? [] : platformRooms);
  const [roomCounts, setRoomCounts] = useState<Record<string, number>>({});
  const [selectedRoomId, setSelectedRoomId] = useState(() => apiMode ? "" : platformRooms[0]?.id ?? "");
  const [selectedConversationId, setSelectedConversationId] = useState("");
  const [filter, setFilter] = useState<ConversationFilter>("all");
  const [tab, setTab] = useState<InboxTab>("human");
  const [conversations, setConversations] = useState<ConversationCard[]>(() => apiMode ? [] : mockConversations);
  const [contacts, setContacts] = useState(mockContacts);
  const [adminStore, setAdminStore] = useState<AdminStore>(() => createDefaultAdminStore());
  const [flowStore, setFlowStore] = useState<FlowStore>(() => apiMode ? { flows: [], runs: [] } : getStoredFlowStore());
  const [broadcastStore, setBroadcastStore] = useState<BroadcastStore>(() => createDefaultBroadcastStore());
  const [lastFlowResult, setLastFlowResult] = useState<FlowTestRunResult | FlowRunTestResult | null>(null);
  const [agentFilter, setAgentFilter] = useState("all");
  const [composer, setComposer] = useState("");
  const [aiActionStatus, setAiActionStatus] = useState("AI actions ready");
  const [cannedSearch, setCannedSearch] = useState("");
  const [cannedCategory, setCannedCategory] = useState("all");
  const [noteDraft, setNoteDraft] = useState("");
  const [noteVisibility, setNoteVisibility] = useState<InternalNoteVisibility>("team");
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
  const [apiCannedReplies, setApiCannedReplies] = useState<CannedReply[]>([]);
  const [apiCannedError, setApiCannedError] = useState("");
  const [apiConversationNotes, setApiConversationNotes] = useState<ReturnType<typeof getVisibleInternalNotes>>([]);
  const [apiConversationTasks, setApiConversationTasks] = useState<AdminTask[]>([]);
  const [apiAuditLogs, setApiAuditLogs] = useState<ConversationAuditLog[]>([]);
  const [apiStatusHistory, setApiStatusHistory] = useState<ConversationStatusHistory[]>([]);
  const [apiAuditError, setApiAuditError] = useState("");
  const [apiStatusHistoryError, setApiStatusHistoryError] = useState("");
  const [apiAiLoading, setApiAiLoading] = useState(false);
  const [apiAiError, setApiAiError] = useState("");

  const selectedRoom = rooms.find((room) => room.id === selectedRoomId) ?? rooms[0] ?? platformRooms[0];
  const visibleConversations = useMemo(() => {
    if (apiMode) return scopeApiConversationsToRoom(conversations, selectedRoom.id);
    const baseFilter = adminFilterIds.has(filter) ? "all" : filter;
    const roomScoped = filterConversations(conversations, selectedRoom.id, baseFilter, tab);
    const adminFiltered = isAdminConversationFilter(filter)
      ? filterAdminConversations(roomScoped, adminStore, filter)
      : roomScoped;
    return sortConversationsByPriority(filterConversationsByAgent(adminFiltered, adminStore, agentFilter), adminStore);
  }, [adminStore, agentFilter, apiMode, conversations, filter, selectedRoom.id, tab]);

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

  useEffect(() => {
    setSelectedConversationId((current) => {
      if (visibleConversations.some((conversation) => conversation.id === current)) return current;
      return visibleConversations[0]?.id ?? "";
    });
  }, [visibleConversations]);

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
    if (!apiMode || !selectedRoomId || !rooms.some((room) => room.id === selectedRoomId)) return;
    let active = true;
    const requestedRoomId = selectedRoomId;
    setApiLoading(true);
    getConversations(requestedRoomId, {
      tab,
      filter,
      agentId: agentFilter === "all" ? undefined : apiAgentIds[agentFilter] ?? agentFilter
    })
      .then((items) => {
        if (!active) return;
        setConversations(scopeApiConversationsToRoom(items.map((item) => mapApiConversationToCard(item)), requestedRoomId));
        setApiError("");
      })
      .catch((error) => {
        if (active) {
          setConversations([]);
          setApiError(readableApiError(error));
        }
      })
      .finally(() => {
        if (active) setApiLoading(false);
      });
    return () => {
      active = false;
    };
  }, [agentFilter, apiMode, filter, rooms, selectedRoomId, tab]);

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

  async function assignSelectedTo(agentId: string) {
    if (!selectedConversation) return;
    if (apiMode) {
      await runApiConversationAction(async () => assignApiConversation(selectedConversation.id, apiAgentIds[agentId] ?? defaultApiUserId), "Assignment persisted");
      return;
    }
    updateAdminStore(assignConversation(adminStore, selectedConversation.id, agentId));
    setAiActionStatus(`Assigned to ${adminStore.agents.find((agent) => agent.id === agentId)?.name ?? agentId}`);
  }

  async function transferSelectedTo(agentId: string) {
    if (!selectedConversation) return;
    if (apiMode) {
      await runApiConversationAction(async () => assignApiConversation(selectedConversation.id, apiAgentIds[agentId] ?? defaultApiUserId), "Transfer persisted");
      return;
    }
    updateAdminStore(transferConversation(adminStore, selectedConversation.id, agentId));
    setAiActionStatus(`Transferred to ${adminStore.agents.find((agent) => agent.id === agentId)?.name ?? agentId}`);
  }

  async function unassignSelected() {
    if (!selectedConversation) return;
    if (apiMode) {
      await runApiConversationAction(async () => assignApiConversation(selectedConversation.id, null), "Conversation unassigned in API");
      return;
    }
    updateAdminStore(unassignConversation(adminStore, selectedConversation.id));
    setAiActionStatus("Conversation unassigned");
  }

  async function changePriority(priority: ConversationPriority) {
    if (!selectedConversation) return;
    if (apiMode) {
      await runApiConversationAction(async () => updateConversationPriority(selectedConversation.id, {
        priority: priority === "medium" ? "normal" : priority
      }), `Priority changed to ${priority}`);
      return;
    }
    updateAdminStore(setConversationPriority(adminStore, selectedConversation.id, priority));
    setAiActionStatus(`Priority changed to ${priority}`);
  }

  async function changeConversationStatus(status: ConversationStatus) {
    if (!selectedConversation) return;
    if (apiMode) {
      if (status === "follow_up") {
        await runApiConversationAction(async () => setConversationFollowUp(selectedConversation.id), "Follow-up persisted");
        return;
      }
      if (status === "resolved") {
        await runApiConversationAction(async () => closeApiConversation(selectedConversation.id), "Conversation closed in API");
        return;
      }
      await runApiConversationAction(async () => updateConversationStatus(selectedConversation.id, { status }), `Status changed to ${status}`);
      return;
    }
    updateAdminStore(setConversationStatus(adminStore, selectedConversation.id, status));
    setAiActionStatus(`Status changed to ${status}`);
  }

  async function addConversationNote() {
    if (!selectedConversation || !noteDraft.trim()) return;
    if (apiMode) {
      setApiActionLoading(true);
      try {
        const note = await createConversationNote(selectedConversation.id, { body: noteDraft.trim(), visibility: noteVisibility });
        setApiConversationNotes((current) => [note, ...current]);
        setNoteDraft("");
        setApiWorkflowError("");
        setAiActionStatus("Internal note persisted");
      } catch (error) {
        setApiWorkflowError(readableApiError(error));
      } finally {
        setApiActionLoading(false);
      }
      return;
    }
    updateAdminStore(addInternalNote(adminStore, selectedConversation.id, selectedContactId, noteDraft.trim(), noteVisibility));
    setNoteDraft("");
    setAiActionStatus("Internal note added");
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

  async function sendAgentMessage(text = composer.trim()) {
    if (!selectedConversation || !text) return;

    if (apiMode) {
      setSendLoading(true);
      setSendError("");
      try {
        await sendApiAgentMessage(selectedConversation.id, text);
        const messages = await getConversationMessages(selectedConversation.id);
        setConversations((current) =>
          applyApiSentMessagesToConversation(current, selectedConversation.id, messages, text)
        );
        setComposer("");
        setApiError("");
        setSendError("");
      } catch (error) {
        setSendError(readableApiError(error));
      } finally {
        setSendLoading(false);
      }
      return;
    }

    if (selectedConversation.id === webchatDemoConversationId) {
      appendStoredDemoMessage("agent", text);
    } else {
      setConversations((current) =>
        applyLocalAgentMessageToConversation(current, selectedConversation.id, text).conversations
      );
    }

    setComposer("");
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

  async function takeOverFromAi() {
    if (!selectedConversation) return;
    if (apiMode) {
      await runApiConversationAction(async () => takeOverApiConversation(selectedConversation.id), "Human takeover persisted");
      return;
    }
    updateAdminStore(takeOverConversation(adminStore, selectedConversation.id));
    setAiActionStatus("Human takeover active");
  }

  async function returnToAi() {
    if (!selectedConversation) return;
    if (apiMode) {
      await runApiConversationAction(async () => returnApiConversationToAi(selectedConversation.id), "Returned to AI in API");
      return;
    }
    updateAdminStore(returnConversationToAi(adminStore, selectedConversation.id));
    setAiActionStatus("Returned to AI mock mode");
  }

  async function assignToMe() {
    if (!selectedConversation) return;
    if (apiMode) {
      await runApiConversationAction(async () => assignApiConversation(selectedConversation.id, defaultApiUserId), "Assigned to me in API");
      return;
    }
    updateAdminStore(assignConversation(adminStore, selectedConversation.id, currentMockAgentId));
    setAiActionStatus("Assigned to me");
  }

  async function markFollowUp() {
    if (apiMode && selectedConversation) {
      await runApiConversationAction(async () => setConversationFollowUp(selectedConversation.id), "Follow-up persisted");
      return;
    }
    await changeConversationStatus("follow_up");
  }

  async function markResolved() {
    await changeConversationStatus("resolved");
  }

  async function reopenCase() {
    await changeConversationStatus("open");
  }

  async function markRead() {
    if (!selectedConversation) return;
    if (apiMode) {
      await runApiConversationAction(async () => updateConversationReadState(selectedConversation.id, { unread: false }), "Marked read in API");
      return;
    }
    setConversations((current) =>
      current.map((conversation) => conversation.id === selectedConversation.id ? { ...conversation, unreadCount: 0 } : conversation)
    );
    setAiActionStatus("Marked read");
  }

  async function markReplied() {
    if (!selectedConversation) return;
    if (apiMode) {
      await runApiConversationAction(async () => updateConversationReadState(selectedConversation.id, { unreplied: false }), "Marked replied in API");
      return;
    }
    setConversations((current) =>
      current.map((conversation) => conversation.id === selectedConversation.id ? { ...conversation, unreplied: false } : conversation)
    );
    setAiActionStatus("Marked replied");
  }

  async function setDueSoonSla() {
    if (!selectedConversation) return;
    const dueAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    if (apiMode) {
      await runApiConversationAction(async () => updateConversationSla(selectedConversation.id, {
        slaDueAt: dueAt,
        firstResponseDueAt: dueAt,
        resolutionDueAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        slaStatus: "warning"
      }), "SLA updated in API");
      return;
    }
    setAiActionStatus("SLA update is local-only in mock mode");
  }

  async function createAdminTask() {
    if (!selectedConversation) return;
    if (apiMode) {
      setApiActionLoading(true);
      try {
        const task = await createConversationWorkflowTask(selectedConversation.id, {
          title: `Follow up ${selectedConversation.customerName}`,
          assigneeUserId: defaultApiUserId
        });
        setApiConversationTasks((current) => [mapApiWorkflowTaskToAdminTask(task), ...current]);
        setApiWorkflowError("");
        setAiActionStatus("Task persisted");
      } catch (error) {
        setApiWorkflowError(readableApiError(error));
      } finally {
        setApiActionLoading(false);
      }
      return;
    }
    updateAdminStore(createConversationTask(adminStore, selectedConversation.id, selectedContactId));
    setAiActionStatus("Task created");
  }

  async function runApiConversationAction(action: () => Promise<CoreConversationCard>, successMessage: string) {
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

  async function addCrmNote() {
    if (!selectedContact) return;
    if (apiMode) {
      if (!selectedConversation) return;
      setApiActionLoading(true);
      try {
        const note = await createConversationNote(selectedConversation.id, {
          body: `Internal note from ${selectedConversation.platformLabel} conversation`,
          visibility: "team"
        });
        setApiConversationNotes((current) => [note, ...current]);
        setAiActionStatus("CRM note persisted as internal note");
        setApiWorkflowError("");
      } catch (error) {
        setApiWorkflowError(readableApiError(error));
      } finally {
        setApiActionLoading(false);
      }
      return;
    }
    updateContacts(addContactNote(contacts, selectedContact.id, `Internal note from ${selectedConversation?.platformLabel ?? "Inbox"} conversation`));
    setAiActionStatus("CRM note added");
  }

  async function createCrmTask() {
    if (!selectedContact) return;
    if (apiMode) {
      if (!selectedConversation) return;
      setApiActionLoading(true);
      try {
        const task = await createConversationWorkflowTask(selectedConversation.id, {
          title: `Follow up ${selectedContact.displayName}`,
          assigneeUserId: defaultApiUserId
        });
        setApiConversationTasks((current) => [mapApiWorkflowTaskToAdminTask(task), ...current]);
        setAiActionStatus("CRM task persisted");
        setApiWorkflowError("");
      } catch (error) {
        setApiWorkflowError(readableApiError(error));
      } finally {
        setApiActionLoading(false);
      }
      return;
    }
    updateContacts(createContactTask(contacts, selectedContact.id, `Follow up ${selectedContact.displayName}`));
    setAiActionStatus("CRM task created");
  }

  async function markFirstTaskDone() {
    if (!selectedContact) return;
    if (apiMode) {
      const firstOpenTask = apiConversationTasks.find((task) => task.status === "open");
      if (!firstOpenTask) return;
      setApiActionLoading(true);
      try {
        const task = await completeConversationWorkflowTask(firstOpenTask.id);
        const mapped = mapApiWorkflowTaskToAdminTask(task);
        setApiConversationTasks((current) => current.map((item) => item.id === mapped.id ? mapped : item));
        setAiActionStatus("Task completion persisted");
        setApiWorkflowError("");
      } catch (error) {
        setApiWorkflowError(readableApiError(error));
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

  async function changeLeadStatus(leadStatus: LeadStatus) {
    if (!selectedContact) return;
    if (apiMode) {
      try {
        applyApiContact(await updateApiContact(selectedContact.id, { leadStatus }));
        setAiActionStatus(`Lead status updated to ${leadStatus}`);
      } catch (error) {
        setAiActionStatus(readableApiError(error));
      }
      return;
    }
    updateContacts(updateContactLeadStatus(contacts, selectedContact.id, leadStatus));
    setAiActionStatus(`Lead status updated to ${leadStatus}`);
  }

  async function addCrmTag() {
    if (!selectedContact) return;
    if (apiMode) {
      try {
        applyApiContact(await updateApiContact(selectedContact.id, { tags: Array.from(new Set([...selectedContact.tags, "vip"])) }));
        setAiActionStatus("CRM tag added");
      } catch (error) {
        setAiActionStatus(readableApiError(error));
      }
      return;
    }
    updateContacts(addContactTag(contacts, selectedContact.id, "vip"));
    setAiActionStatus("CRM tag added");
  }

  async function removeCrmTag(tag: string) {
    if (!selectedContact) return;
    if (apiMode) {
      try {
        applyApiContact(await updateApiContact(selectedContact.id, { tags: selectedContact.tags.filter((item) => item !== tag) }));
        setAiActionStatus("CRM tag removed");
      } catch (error) {
        setAiActionStatus(readableApiError(error));
      }
      return;
    }
    updateContacts(removeContactTag(contacts, selectedContact.id, tag));
    setAiActionStatus("CRM tag removed");
  }

  async function linkCurrentIdentity() {
    if (!selectedConversation || !selectedContact) return;
    if (apiMode && apiCustomer360) {
      try {
        applyApiContact(await linkApiContactIdentity(selectedContact.id, {
          platform: apiCustomer360.source.platform,
          channelAccountId: apiCustomer360.source.channelAccountId,
          externalUserId: apiCustomer360.source.externalUserId,
          displayName: apiCustomer360.source.displayName
        }));
        setAiActionStatus("Current identity linked without moving conversation rooms");
      } catch (error) {
        setAiActionStatus(readableApiError(error));
      }
      return;
    }
    updateContacts(linkIdentityToContact(contacts, selectedContact.id, createIdentityFromConversation(selectedConversation)));
    setAiActionStatus("Current identity linked without moving conversation rooms");
  }

  async function createContactFromCurrentIdentity() {
    if (!selectedConversation) return;
    if (apiMode && apiCustomer360) {
      try {
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
        applyApiContact(contact);
        setAiActionStatus("New CRM contact created from current identity");
      } catch (error) {
        setAiActionStatus(readableApiError(error));
      }
      return;
    }
    updateContacts(createContactFromIdentity(contacts, createIdentityFromConversation(selectedConversation)));
    setAiActionStatus("New CRM contact created from current identity");
  }

  async function unlinkFirstIdentity() {
    if (!selectedContact || selectedContact.identities.length <= 1) return;
    const identity = selectedContact.identities[selectedContact.identities.length - 1];
    if (apiMode) {
      try {
        applyApiContact(await unlinkApiContactIdentity(selectedContact.id, { identityId: identity.id }));
        setAiActionStatus("Identity unlinked; conversations remain in their platform rooms");
      } catch (error) {
        setAiActionStatus(readableApiError(error));
      }
      return;
    }
    updateContacts(unlinkIdentity(contacts, selectedContact.id, identity.id));
    setAiActionStatus("Identity unlinked; conversations remain in their platform rooms");
  }

  async function setFirstIdentityPrimary() {
    if (!selectedContact || selectedContact.identities.length === 0) return;
    if (apiMode) {
      try {
        applyApiContact(await setApiPrimaryContactIdentity(selectedContact.id, { identityId: selectedContact.identities[0].id }));
        setAiActionStatus("Primary identity updated");
      } catch (error) {
        setAiActionStatus(readableApiError(error));
      }
      return;
    }
    updateContacts(setPrimaryIdentity(contacts, selectedContact.id, selectedContact.identities[0].id));
    setAiActionStatus("Primary identity updated");
  }

  function toggleSelectedBroadcastOptOut() {
    if (!selectedContact) return;
    if (apiMode) {
      setAiActionStatus("Broadcast opt-out remains local/mock-only in Sprint 14 API mode");
      return;
    }
    updateContacts(toggleContactBroadcastOptOut(contacts, selectedContact.id, !selectedContact.optOutBroadcast));
    setAiActionStatus(selectedContact.optOutBroadcast ? "Broadcast mock opt-out removed" : "Broadcast mock opt-out enabled");
  }

  return (
    <main className="appShell">
      <aside className="mainMenu" aria-label="Main menu">
        <div className="brandMark">AO</div>
        <span className="menuLabel">Main menu</span>
        <nav className="navStack">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} className={item.active ? "navIcon active" : "navIcon"} aria-label={item.label} title={item.label}>
              <item.icon size={19} />
            </Link>
          ))}
        </nav>
      </aside>

      <aside className="roomsSidebar" aria-label="Platform Rooms sidebar">
        <header className="sectionHeader">
          <div>
            <p className="eyebrow">Inbox Rooms</p>
            <h1>Platform Rooms</h1>
          </div>
          <button className="iconButton" aria-label="Refresh mock rooms">
            <RotateCcw size={16} />
          </button>
        </header>

        <label className="searchBox">
          <Search size={16} />
          <input placeholder="Search room" aria-label="Search room" />
        </label>

        <div className="roomGroups">
          {rooms.map((room) => (
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

      <section className="queuePanel" aria-label="Conversation Queue">
        <header className="queueHeader">
          <div>
            <p className="eyebrow">Conversation Queue</p>
            <h2>{selectedRoom.platformLabel} / {selectedRoom.accountName}</h2>
          </div>
          <span className="roomBadge">{visibleConversations.length}</span>
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

        <label className="agentFilter">
          <span>Agent</span>
          <select value={agentFilter} onChange={(event) => setAgentFilter(event.target.value)} aria-label="Filter by agent">
            <option value="all">All agents</option>
            {adminStore.agents.map((agent) => (
              <option key={agent.id} value={agent.id}>{agent.name} / {agent.status}</option>
            ))}
          </select>
        </label>

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
      </section>

      <section className="chatPanel" aria-label="Chat Window">
        <ChatHeader
          room={selectedRoom}
          conversation={selectedConversation}
          adminStore={adminStore}
          assignedAgentName={selectedAssignedAgentName}
          priority={selectedPriority}
          status={selectedStatus}
          sla={selectedSla}
          collision={apiMode ? null : selectedCollision}
          onAssignToMe={assignToMe}
          onUnassign={unassignSelected}
          onAssign={assignSelectedTo}
          onTransfer={transferSelectedTo}
          onPriorityChange={changePriority}
          onStatusChange={changeConversationStatus}
          onTakeOver={takeOverFromAi}
          onReturnToAi={returnToAi}
          onMarkFollowUp={markFollowUp}
          onMarkResolved={markResolved}
          onReopen={reopenCase}
          onMarkRead={markRead}
          onMarkReplied={markReplied}
          onSetDueSoonSla={setDueSoonSla}
          onCreateTask={createAdminTask}
          onAddNote={() => setNoteDraft("ติดตามจาก quick action")}
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
          <div className="composerBox">
            <textarea
              placeholder="Reply in the selected room account"
              value={composer}
              onChange={(event) => handleComposerChange(event.target.value)}
              disabled={!selectedConversation}
            />
            <button type="button" className="sendButton" onClick={() => sendAgentMessage()} disabled={!selectedConversation || !composer.trim() || sendLoading}>
              {sendLoading ? "Sending..." : "Send"}
            </button>
          </div>
          {apiMode && sendError ? <p className="noteText">Send failed: {sendError}</p> : null}
        </footer>
      </section>

      <aside className="customerPanel" aria-label="Customer and AI Panel">
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
          adminStore={adminStore}
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
          broadcastHistory={apiMode ? [] : selectedContact ? getBroadcastHistoryForContact(broadcastStore, selectedContact.id) : []}
          lastBroadcastCampaignName={apiMode ? apiCustomer360?.broadcastHistorySummary.lastCampaignName ?? "No sent_mock campaign" : selectedContact ? getLastCampaignReceived(broadcastStore, selectedContact.id)?.name ?? "No sent_mock campaign" : "No sent_mock campaign"}
          noteDraft={noteDraft}
          noteVisibility={noteVisibility}
          onUseDraft={useAiDraft}
          onCopySuggestedReply={copySuggestedReply}
          onViewSource={viewAiSource}
          onRegenerate={regenerateDraft}
          onMarkWrong={markAiWrong}
          onTakeOver={takeOverFromAi}
          onReturnToAi={returnToAi}
          onAssignToMe={assignToMe}
          onMarkFollowUp={markFollowUp}
          onMarkResolved={markResolved}
          onReopen={reopenCase}
          onMarkRead={markRead}
          onMarkReplied={markReplied}
          onSetDueSoonSla={setDueSoonSla}
          onCreateAdminTask={createAdminTask}
          onRunFlow={runSelectedFlow}
          onCopySummary={copySummary}
          onAddNote={addCrmNote}
          onAddInternalNote={addConversationNote}
          onEditInternalNote={editLatestNote}
          onDeleteInternalNote={deleteLatestNote}
          onPinInternalNote={pinLatestNote}
          onNoteDraftChange={setNoteDraft}
          onNoteVisibilityChange={setNoteVisibility}
          onCreateTask={createCrmTask}
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
      </aside>
    </main>
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
  adminStore,
  assignedAgentName,
  priority,
  status,
  sla,
  collision,
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
  adminStore: AdminStore;
  assignedAgentName: string | null;
  priority: ConversationPriority;
  status: ConversationStatus;
  sla: { status: string; text: string } | null;
  collision: ReturnType<typeof getCollisionWarning> | null;
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
        <button type="button" onClick={onTakeOver} disabled={!conversation}><UserRoundCheck size={15} /> Take Over</button>
        <button type="button" onClick={onReturnToAi} disabled={!conversation}><Bot size={15} /> Return to AI</button>
        <button type="button" onClick={onAssignToMe} disabled={!conversation}><UserPlus size={15} /> Assign to Me</button>
        <button type="button" onClick={onUnassign} disabled={!conversation}><UserMinus size={15} /> Unassign</button>
        <button type="button" onClick={onMarkFollowUp} disabled={!conversation}><Clock3 size={15} /> Follow Up</button>
        <button type="button" onClick={onMarkResolved} disabled={!conversation}><CheckCircle2 size={15} /> Resolved</button>
        <button type="button" onClick={onReopen} disabled={!conversation}><RotateCcw size={15} /> Reopen</button>
        <button type="button" onClick={onMarkRead} disabled={!conversation}><CheckCircle2 size={15} /> Read</button>
        <button type="button" onClick={onMarkReplied} disabled={!conversation}><MessageSquareText size={15} /> Replied</button>
        <button type="button" onClick={onSetDueSoonSla} disabled={!conversation}><Clock3 size={15} /> SLA Soon</button>
        <button type="button" onClick={onCreateTask} disabled={!conversation}><Clipboard size={15} /> Create Task</button>
        <button type="button" onClick={onAddNote} disabled={!conversation}><Edit3 size={15} /> Add Note</button>
        <button type="button" onClick={onCopySummary} disabled={!conversation}><Copy size={15} /> Copy Summary</button>
        <select value="" onChange={(event) => event.target.value && onAssign(event.target.value)} disabled={!conversation} aria-label="Assign conversation">
          <option value="">Assign</option>
          {adminStore.agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name} / {agent.status}</option>)}
        </select>
        <select value="" onChange={(event) => event.target.value && onTransfer(event.target.value)} disabled={!conversation} aria-label="Transfer conversation">
          <option value="">Transfer</option>
          {adminStore.agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name} / {agent.status}</option>)}
        </select>
        <select value={priority} onChange={(event) => onPriorityChange(event.target.value as ConversationPriority)} disabled={!conversation} aria-label="Change priority">
          {priorityOptions.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <select value={status} onChange={(event) => onStatusChange(event.target.value as ConversationStatus)} disabled={!conversation} aria-label="Change status">
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
  broadcastHistory,
  lastBroadcastCampaignName,
  noteDraft,
  noteVisibility,
  onUseDraft,
  onCopySuggestedReply,
  onViewSource,
  onRegenerate,
  onMarkWrong,
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
  onAddInternalNote,
  onEditInternalNote,
  onDeleteInternalNote,
  onPinInternalNote,
  onNoteDraftChange,
  onNoteVisibilityChange,
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
  adminStore: AdminStore;
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
  broadcastHistory: ReturnType<typeof getBroadcastHistoryForContact>;
  lastBroadcastCampaignName: string;
  noteDraft: string;
  noteVisibility: InternalNoteVisibility;
  onUseDraft: () => void;
  onCopySuggestedReply: () => void;
  onViewSource: () => void;
  onRegenerate: () => void;
  onMarkWrong: () => void;
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
  onAddInternalNote: () => void;
  onEditInternalNote: () => void;
  onDeleteInternalNote: () => void;
  onPinInternalNote: () => void;
  onNoteDraftChange: (value: string) => void;
  onNoteVisibilityChange: (value: InternalNoteVisibility) => void;
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
          <button type="button" onClick={onAddNote} disabled={!contact || workflowLoading}>Add Note</button>
          <button type="button" onClick={onCreateTask} disabled={!contact || workflowLoading}>Create Task</button>
          <button type="button" onClick={onLinkIdentity} disabled={!contact}>Link Identity</button>
          <button type="button" onClick={onCreateContact}>Create New Contact</button>
          <button type="button" onClick={onUnlinkIdentity} disabled={!contact || contact.identities.length <= 1}>Unlink Identity</button>
          <button type="button" onClick={onSetPrimaryIdentity} disabled={!contact}>Set Primary</button>
          <button type="button" onClick={() => onLeadStatusChange("follow_up")} disabled={!contact}>Set Follow Up</button>
        </div>
      </section>

      <section className="panelBlock">
        <div className="blockHeader">
          <Radio size={17} />
          <h3>Broadcast history</h3>
        </div>
        <dl className="profileGrid">
          <div><dt>Opt-out</dt><dd>{contact?.optOutBroadcast ? `Yes / ${contact.suppressedReason ?? "suppressed"}` : "No"}</dd></div>
          <div><dt>Last campaign</dt><dd>{lastBroadcastCampaignName}</dd></div>
        </dl>
        <button className="smallPanelButton" type="button" onClick={onToggleBroadcastOptOut} disabled={!contact}>{contact?.optOutBroadcast ? "Allow mock broadcast" : "Opt out mock"}</button>
        {apiMode && <p className="noteText">Broadcast actions remain local/mock-only in Sprint 14 API mode.</p>}
        <div className="miniList">
          {broadcastHistory.slice(0, 3).map((item) => <p key={item.recipient.id}>{item.campaign?.name ?? item.recipient.campaignId} / {item.recipient.platform} / {item.recipient.status}</p>)}
          {broadcastHistory.length === 0 && <p>No broadcast history yet</p>}
        </div>
      </section>

      <section className="panelBlock">
        <div className="blockHeader">
          <Clipboard size={17} />
          <h3>Quick actions</h3>
        </div>
        <div className="aiActionGrid">
          <button type="button" onClick={onAssignToMe} disabled={workflowLoading}>Assign to Me</button>
          <button type="button" onClick={onTakeOver} disabled={workflowLoading}>Take Over</button>
          <button type="button" onClick={onReturnToAi}>Return to AI</button>
          <button type="button" onClick={onMarkFollowUp} disabled={workflowLoading}>Mark Follow Up</button>
          <button type="button" onClick={onMarkResolved}>Mark Resolved</button>
          <button type="button" onClick={onReopen}>Reopen</button>
          <button type="button" onClick={onMarkRead} disabled={workflowLoading}>Mark Read</button>
          <button type="button" onClick={onMarkReplied} disabled={workflowLoading}>Mark Replied</button>
          <button type="button" onClick={onSetDueSoonSla} disabled={workflowLoading}>SLA Due Soon</button>
          <button type="button" onClick={onCreateAdminTask} disabled={workflowLoading}>Create Task</button>
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
          <textarea value={noteDraft} onChange={(event) => onNoteDraftChange(event.target.value)} placeholder="Add internal note" />
          <select value={noteVisibility} onChange={(event) => onNoteVisibilityChange(event.target.value as InternalNoteVisibility)}>
            <option value="team">Team</option>
            <option value="supervisor">Supervisor</option>
          </select>
          <button type="button" onClick={onAddInternalNote} disabled={!noteDraft.trim() || workflowLoading}>Add Note</button>
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
          {(contact?.tasks.filter((task) => task.status === "open") ?? []).slice(0, 3).map((task) => <p key={task.id}>{task.title}</p>)}
          {adminTasks.length === 0 && !contact?.tasks.some((task) => task.status === "open") && <p>No open tasks</p>}
        </div>
        <button className="smallPanelButton" type="button" onClick={onMarkTaskDone} disabled={workflowLoading || !(apiMode ? adminTasks.length > 0 : contact?.tasks.some((task) => task.status === "open"))}>Mark first task done</button>
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
              <span>{item.id}</span>
              <small>{item.lastMessage} / {item.closed ? "closed" : "open"}</small>
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
          <button type="button" onClick={onTakeOver}>Take Over</button>
        </div>
        <p className="aiActionStatus">{aiActionStatus}</p>
      </section>
    </>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
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
      <p>{message.body}</p>
    </article>
  );
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
  createdAt: string;
}): AdminTask {
  return {
    id: task.id,
    conversationId: task.conversationId,
    contactId: task.contactId,
    title: task.title,
    status: task.status === "done" ? "done" : "open",
    createdBy: task.createdByUserId ?? "system",
    createdAt: task.createdAt
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

function formatAuditTimelineContext(metadata: Record<string, unknown>) {
  const platform = typeof metadata.platform === "string" ? metadata.platform : "platform?";
  const channelAccountId = typeof metadata.channelAccountId === "string" ? metadata.channelAccountId : "account?";
  const roomId = typeof metadata.roomId === "string" ? metadata.roomId : "room?";
  return `${platform} / ${channelAccountId} / ${roomId}`;
}

function readableApiError(error: unknown) {
  return error instanceof Error
    ? error.message
    : "API request failed. Check that the backend server is running and NEXT_PUBLIC_API_BASE_URL is correct.";
}
