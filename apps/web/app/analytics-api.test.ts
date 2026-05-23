import { afterEach, describe, expect, it, vi } from "vitest";
import type { AnalyticsApiDashboardData } from "./analytics-data";
import {
  buildAnalyticsDashboardDataFromApi,
  defaultAnalyticsFilters,
  loadAnalyticsData
} from "./analytics-data";

const defaultTenantId = "00000000-0000-4000-8000-000000000001";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("analytics API mode frontend", () => {
  it("does not call API endpoints in mock mode", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("should not call API"));

    const result = await loadAnalyticsData("mock", defaultAnalyticsFilters, new Date("2026-05-22T00:00:00.000Z"));

    expect(result.mode).toBe("mock");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("calls all analytics endpoints in API mode with explicit query filters", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      return jsonResponse(responseForUrl(url));
    });

    const result = await loadAnalyticsData("api", {
      ...defaultAnalyticsFilters,
      platform: "webchat",
      roomId: "room-webchat",
      agentId: "agent-may"
    }, new Date("2026-05-22T00:00:00.000Z"));

    const urls = fetchMock.mock.calls.map((call) => String(call[0]));
    expect(result.mode).toBe("api");
    expect(urls).toHaveLength(8);
    expect(urls).toEqual(expect.arrayContaining([
      expect.stringContaining("/analytics/overview?"),
      expect.stringContaining("/analytics/conversations?"),
      expect.stringContaining("/analytics/channels?"),
      expect.stringContaining("/analytics/agents?"),
      expect.stringContaining("/analytics/sla?"),
      expect.stringContaining("/analytics/ai?"),
      expect.stringContaining("/analytics/tasks?"),
      expect.stringContaining("/analytics/audit?")
    ]));
    expect(urls[0]).toContain("platform=webchat");
    expect(urls[0]).toContain("roomId=room-webchat");
    expect(urls[0]).toContain("agentId=agent-may");
    expectTenantHeaderForAll(fetchMock);
  });

  it("surfaces API errors instead of silently falling back to mock data", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes("/analytics/overview")) return jsonResponse({ message: "analytics unavailable" }, 503);
      return jsonResponse(responseForUrl(url));
    });

    await expect(loadAnalyticsData("api", defaultAnalyticsFilters, new Date("2026-05-22T00:00:00.000Z")))
      .rejects.toThrow("API request failed (503): analytics unavailable");
  });

  it("maps empty API data safely to zero dashboard metrics", () => {
    const dashboard = buildAnalyticsDashboardDataFromApi(emptyApiData());

    expect(dashboard.totalConversations).toBe(0);
    expect(dashboard.channelMetrics).toEqual([]);
    expect(dashboard.metricCards.find((card) => card.id === "messages")?.value).toBe(0);
    expect(dashboard.slaMetric.breachRatePercent).toBe(0);
  });

  it("maps API metrics for dashboard tables and chart rows", () => {
    const dashboard = buildAnalyticsDashboardDataFromApi(sampleApiData());

    expect(dashboard.executiveSummary).toContain("API mode shows 2 persisted conversations");
    expect(dashboard.channelMetrics[0]).toMatchObject({ platform: "webchat", accountName: "Main Website", totalConversations: 2 });
    expect(dashboard.agentPerformance[0]).toMatchObject({ agentName: "May", assignedCount: 2, resolvedCount: 1 });
    expect(dashboard.metricCards.find((card) => card.id === "tasks-open")?.value).toBe(1);
    expect(dashboard.topIssue).toBe("conversation.sla_updated");
  });
});

function responseForUrl(url: string) {
  const data = sampleApiData();
  if (url.includes("/analytics/overview")) return data.overview;
  if (url.includes("/analytics/conversations")) return data.conversations;
  if (url.includes("/analytics/channels")) return data.channels;
  if (url.includes("/analytics/agents")) return data.agents;
  if (url.includes("/analytics/sla")) return data.sla;
  if (url.includes("/analytics/ai")) return data.ai;
  if (url.includes("/analytics/tasks")) return data.tasks;
  if (url.includes("/analytics/audit")) return data.audit;
  throw new Error(`Unhandled URL ${url}`);
}

function sampleApiData(): AnalyticsApiDashboardData {
  const filters = appliedFilters();
  return {
    overview: {
      filters,
      totalConversations: 2,
      openConversations: 1,
      closedConversations: 1,
      pendingConversations: 0,
      followUpConversations: 0,
      unreadConversations: 1,
      unrepliedConversations: 1,
      messagesCount: 4,
      inboundMessagesCount: 2,
      outboundMessagesCount: 2
    },
    conversations: {
      filters,
      total: 2,
      byStatus: [{ key: "open", count: 1 }, { key: "closed", count: 1 }],
      latest: []
    },
    channels: {
      filters,
      items: [{
        platform: "webchat",
        roomId: "room-webchat",
        accountId: "account-webchat",
        accountName: "Main Website",
        roomName: "Main Website",
        conversations: 2,
        openConversations: 1,
        closedConversations: 1,
        messages: 4,
        inboundMessages: 2,
        outboundMessages: 2
      }],
      platformSplit: [{ platform: "webchat", conversations: 2, messages: 4 }]
    },
    agents: {
      filters,
      items: [{
        agentId: "agent-may",
        agentName: "May",
        email: "may@example.com",
        assignedConversations: 2,
        closedConversations: 1,
        openTasks: 1,
        doneTasks: 1,
        overdueTasks: 1
      }]
    },
    sla: {
      filters,
      healthyCount: 1,
      warningCount: 0,
      breachedCount: 1,
      averageTimeToFirstResponseMinutes: 5,
      resolutionDue: { overdue: 1, dueSoon: 0, healthy: 1, none: 0 }
    },
    ai: {
      filters,
      aiStateDistribution: [{ key: "need_human", count: 1 }, { key: "idle", count: 1 }],
      policyModeCounts: [{ key: "suggest", count: 1 }],
      knowledgeBaseCount: 1,
      documentCount: 2,
      chunkCount: 3,
      aiRunCount: 2,
      aiRunStatusCounts: [{ key: "completed", count: 2 }]
    },
    tasks: {
      filters,
      openTasks: 1,
      doneTasks: 1,
      overdueTasks: 1,
      latest: [{
        id: "task-1",
        conversationId: "conv-web",
        title: "Follow up quote",
        status: "open",
        assigneeUserId: "agent-may",
        dueAt: "2026-05-21T04:00:00.000Z",
        completedAt: null,
        createdAt: "2026-05-21T04:00:00.000Z"
      }]
    },
    audit: {
      filters,
      actions: [{ key: "conversation.sla_updated", count: 1 }],
      latest: [{
        id: "audit-1",
        conversationId: "conv-web",
        actorUserId: "agent-may",
        action: "conversation.sla_updated",
        entityType: "conversation",
        entityId: "conv-web",
        createdAt: "2026-05-21T04:00:00.000Z"
      }]
    }
  };
}

function emptyApiData(): AnalyticsApiDashboardData {
  const filters = appliedFilters();
  return {
    overview: {
      filters,
      totalConversations: 0,
      openConversations: 0,
      closedConversations: 0,
      pendingConversations: 0,
      followUpConversations: 0,
      unreadConversations: 0,
      unrepliedConversations: 0,
      messagesCount: 0,
      inboundMessagesCount: 0,
      outboundMessagesCount: 0
    },
    conversations: { filters, total: 0, byStatus: [], latest: [] },
    channels: { filters, items: [], platformSplit: [] },
    agents: { filters, items: [] },
    sla: {
      filters,
      healthyCount: 0,
      warningCount: 0,
      breachedCount: 0,
      averageTimeToFirstResponseMinutes: 0,
      resolutionDue: { overdue: 0, dueSoon: 0, healthy: 0, none: 0 }
    },
    ai: {
      filters,
      aiStateDistribution: [],
      policyModeCounts: [],
      knowledgeBaseCount: 0,
      documentCount: 0,
      chunkCount: 0,
      aiRunCount: 0,
      aiRunStatusCounts: []
    },
    tasks: { filters, openTasks: 0, doneTasks: 0, overdueTasks: 0, latest: [] },
    audit: { filters, actions: [], latest: [] }
  };
}

function appliedFilters() {
  return {
    from: "2026-05-21T00:00:00.000Z",
    to: "2026-05-21T23:59:59.999Z",
    platform: null,
    roomId: null,
    agentId: null
  };
}

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    text: async () => JSON.stringify(body)
  } as Response;
}

function expectTenantHeaderForAll(fetchMock: { mock: { calls: Array<[unknown, RequestInit?]> } }) {
  for (const [, init] of fetchMock.mock.calls) {
    expect(init).toEqual(expect.objectContaining({
      headers: expect.objectContaining({ "x-tenant-id": defaultTenantId })
    }));
  }
}
