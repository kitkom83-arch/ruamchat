import type { ConversationPriority, TaskDashboardItem } from "@ai-omni/shared";
import type { AdminStore } from "./admin-data";
import type { ConversationCard } from "./inbox-data";

export type TaskDashboardStatusFilter = "all" | "open" | "completed";
export type TaskDashboardDueFilter = "all" | "due" | "overdue" | "upcoming" | "due_soon" | "follow_up";

export type TaskDashboardRow = {
  id: string;
  tenantId?: string;
  conversationId: string;
  contactId: string;
  title: string;
  status: "open" | "done" | "cancelled";
  platform: string;
  platformLabel: string;
  channelAccountId: string;
  roomId: string;
  accountName: string;
  customerName: string;
  conversationTab: "human" | "bot";
  conversationPriority: ConversationPriority;
  assigneeUserId: string | null;
  assigneeName: string | null;
  dueAt: string | null;
  completedAt: string | null;
  createdAt: string;
  externalCalls: 0;
  source: "api" | "mock";
};

export function mapApiTaskDashboardRows(tasks: TaskDashboardItem[]): TaskDashboardRow[] {
  return tasks.map((task) => ({
    id: task.id,
    tenantId: task.tenantId,
    conversationId: task.conversationId,
    contactId: task.contactId,
    title: task.title,
    status: task.status,
    platform: task.platform,
    platformLabel: task.platformLabel,
    channelAccountId: task.channelAccountId,
    roomId: task.roomId,
    accountName: task.accountName,
    customerName: task.customerName,
    conversationTab: task.conversationTab,
    conversationPriority: task.conversationPriority,
    assigneeUserId: task.assigneeUserId,
    assigneeName: task.assignedAgentName,
    dueAt: task.dueAt,
    completedAt: task.completedAt,
    createdAt: task.createdAt,
    externalCalls: task.externalCalls,
    source: "api"
  }));
}

export function mapMockTaskDashboardRows(store: AdminStore, conversations: ConversationCard[]): TaskDashboardRow[] {
  return store.tasks.flatMap((task) => {
    const conversation = conversations.find((item) => item.id === task.conversationId);
    if (!conversation) return [];
    const assignedAgent = store.assignments.find((item) => item.conversationId === task.conversationId && item.status === "active");
    const agent = assignedAgent ? store.agents.find((item) => item.id === assignedAgent.agentId) : null;
    return [{
      id: task.id,
      conversationId: task.conversationId,
      contactId: task.contactId,
      title: task.title,
      status: task.status === "done" ? "done" : "open",
      platform: conversation.platform ?? platformFromLabel(conversation.platformLabel),
      platformLabel: conversation.platformLabel,
      channelAccountId: conversation.channelAccountId ?? conversation.roomId,
      roomId: conversation.roomId,
      accountName: conversation.accountName,
      customerName: conversation.customerName,
      conversationTab: conversation.tab,
      conversationPriority: conversation.priority,
      assigneeUserId: agent?.id ?? null,
      assigneeName: agent?.name ?? null,
      dueAt: task.dueAt ?? null,
      completedAt: task.status === "done" ? task.createdAt : null,
      createdAt: task.createdAt,
      externalCalls: 0 as const,
      source: "mock" as const
    }];
  });
}

export function filterTaskDashboardRows(
  rows: TaskDashboardRow[],
  filters: {
    status: TaskDashboardStatusFilter;
    due: TaskDashboardDueFilter;
    assigneeUserId: string;
    roomId?: string;
  },
  now = new Date()
) {
  return rows.filter((row) => {
    if (filters.status === "open" && row.status !== "open") return false;
    if (filters.status === "completed" && row.status !== "done") return false;
    if (filters.assigneeUserId !== "all" && row.assigneeUserId !== filters.assigneeUserId) return false;
    if (filters.roomId && row.roomId !== filters.roomId) return false;
    if (filters.due === "due" && !row.dueAt) return false;
    if (filters.due === "overdue" && (!row.dueAt || new Date(row.dueAt) >= now || row.status !== "open")) return false;
    if (filters.due === "upcoming" && (!row.dueAt || new Date(row.dueAt) < now)) return false;
    if (filters.due === "due_soon" && (!row.dueAt || new Date(row.dueAt) < now || new Date(row.dueAt).getTime() > now.getTime() + 24 * 60 * 60 * 1000 || row.status !== "open")) return false;
    if (filters.due === "follow_up") return false;
    return true;
  });
}

export function taskStatusLabel(status: TaskDashboardRow["status"]) {
  if (status === "done") return "completed";
  return status;
}

function platformFromLabel(label: string) {
  const normalized = label.toLowerCase();
  if (normalized === "line") return "line";
  if (normalized === "facebook") return "facebook";
  if (normalized === "instagram") return "instagram";
  if (normalized === "telegram") return "telegram";
  return "webchat";
}
