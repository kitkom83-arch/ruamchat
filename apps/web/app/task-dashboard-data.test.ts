import { describe, expect, it } from "vitest";
import { createDefaultAdminStore } from "./admin-data";
import { mockConversations } from "./inbox-data";
import {
  filterTaskDashboardRows,
  mapApiTaskDashboardRows,
  mapMockTaskDashboardRows,
  taskStatusLabel
} from "./task-dashboard-data";

const tenantId = "00000000-0000-4000-8000-000000000001";

describe("task dashboard data", () => {
  it("maps API task rows into renderable dashboard rows without losing safe context", () => {
    const rows = mapApiTaskDashboardRows([{
      id: "task-api-1",
      tenantId,
      conversationId: "conv-api-1",
      contactId: "contact-api",
      platform: "webchat",
      channelAccountId: "channel-web",
      roomId: "room-web",
      title: "Backend persisted task",
      status: "open",
      assigneeUserId: "00000000-0000-4000-8000-000000000011",
      createdByUserId: "00000000-0000-4000-8000-000000000011",
      dueAt: "2026-05-22T04:00:00.000Z",
      completedAt: null,
      createdAt: "2026-05-21T04:00:00.000Z",
      updatedAt: "2026-05-21T04:00:00.000Z",
      externalCalls: 0,
      conversationTab: "human",
      conversationStatus: "open",
      conversationPriority: "high",
      customerName: "API Customer",
      assignedAgentName: "May",
      accountName: "Main Website",
      platformLabel: "Webchat",
      lastMessageAt: "2026-05-21T04:00:00.000Z"
    }]);

    expect(rows[0]).toMatchObject({
      id: "task-api-1",
      tenantId,
      conversationId: "conv-api-1",
      platform: "webchat",
      channelAccountId: "channel-web",
      roomId: "room-web",
      status: "open",
      externalCalls: 0,
      source: "api"
    });
    expect(JSON.stringify(rows)).not.toMatch(/accessToken|webhookSecret|botToken|apiKey|Bearer\s+[a-z0-9._-]+|(^|[^a-z])sk-[a-z0-9_-]{8,}/i);
  });

  it("filters open, completed, due, overdue, and assignee rows safely", () => {
    const rows = mapApiTaskDashboardRows([
      apiTask("task-open", "open", "agent-1", "2026-05-22T04:00:00.000Z"),
      apiTask("task-done", "done", "agent-1", "2026-05-20T04:00:00.000Z"),
      apiTask("task-other", "open", "agent-2", null)
    ]);

    expect(filterTaskDashboardRows(rows, { status: "open", due: "all", assigneeUserId: "all" }).map((task) => task.id)).toEqual(["task-open", "task-other"]);
    expect(filterTaskDashboardRows(rows, { status: "completed", due: "all", assigneeUserId: "all" }).map((task) => task.id)).toEqual(["task-done"]);
    expect(filterTaskDashboardRows(rows, { status: "all", due: "due", assigneeUserId: "all" }).map((task) => task.id)).toEqual(["task-open", "task-done"]);
    expect(filterTaskDashboardRows(rows, { status: "all", due: "overdue", assigneeUserId: "all" }, new Date("2026-05-21T04:00:00.000Z")).map((task) => task.id)).toEqual([]);
    expect(filterTaskDashboardRows(rows, { status: "all", due: "all", assigneeUserId: "agent-2" }).map((task) => task.id)).toEqual(["task-other"]);
    expect(taskStatusLabel("done")).toBe("completed");
  });

  it("keeps mock/local mode task rows working from the local admin store", () => {
    const rows = mapMockTaskDashboardRows(createDefaultAdminStore(), mockConversations);

    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0]).toMatchObject({
      conversationId: "conv-web-01",
      platform: "webchat",
      roomId: "webchat-main",
      status: "open",
      source: "mock",
      externalCalls: 0
    });
  });
});

function apiTask(id: string, status: "open" | "done" | "cancelled", assigneeUserId: string, dueAt: string | null) {
  return {
    id,
    tenantId,
    conversationId: "conv-api-1",
    contactId: "contact-api",
    platform: "webchat" as const,
    channelAccountId: "channel-web",
    roomId: "room-web",
    title: id,
    status,
    assigneeUserId,
    createdByUserId: null,
    dueAt,
    completedAt: status === "done" ? "2026-05-20T04:10:00.000Z" : null,
    createdAt: "2026-05-21T04:00:00.000Z",
    updatedAt: "2026-05-21T04:00:00.000Z",
    externalCalls: 0 as const,
    conversationTab: "human" as const,
    conversationStatus: "open" as const,
    conversationPriority: "medium" as const,
    customerName: "API Customer",
    assignedAgentName: "May",
    accountName: "Main Website",
    platformLabel: "Webchat",
    lastMessageAt: "2026-05-21T04:00:00.000Z"
  };
}
