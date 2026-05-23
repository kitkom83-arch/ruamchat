import { describe, expect, it } from "vitest";
import { sampleKnowledgeItems } from "@ai-omni/shared";
import { createDefaultAdminStore } from "./admin-data";
import {
  buildAiImprovementQueue,
  buildAnalyticsDashboardData,
  buildExecutiveSummaryText,
  createKnowledgeDraftFromImprovement,
  defaultAnalyticsFilters,
  exportChannelMetricsCsv,
  filterAnalyticsConversations,
  markImprovementReviewed
} from "./analytics-data";
import { mockContacts } from "./crm-data";
import { mockConversations } from "./inbox-data";

describe("analytics mock calculations", () => {
  it("calculates core metric cards from conversations", () => {
    const data = buildAnalyticsDashboardData(mockConversations, mockContacts, createDefaultAdminStore(), sampleKnowledgeItems, {
      ...defaultAnalyticsFilters,
      dateRange: "last_30_days"
    });

    expect(data.totalConversations).toBe(6);
    expect(data.metricCards.find((card) => card.id === "total")?.value).toBe(6);
    expect(data.metricCards.find((card) => card.id === "unreplied")?.value).toBe(3);
  });

  it("builds channel metrics split by all 5 platform accounts", () => {
    const data = buildAnalyticsDashboardData(mockConversations, mockContacts, createDefaultAdminStore(), sampleKnowledgeItems, {
      ...defaultAnalyticsFilters,
      dateRange: "last_30_days"
    });

    expect(data.channelMetrics).toHaveLength(5);
    expect(data.channelMetrics.map((metric) => `${metric.platform}/${metric.accountName}`)).toEqual([
      "webchat/Main Website",
      "telegram/Bot 007237",
      "line/LINE OA Main",
      "facebook/Page หลัก",
      "instagram/IG ร้านค้า"
    ]);
    expect(data.channelMetrics.find((metric) => metric.platform === "webchat")?.totalConversations).toBe(2);
  });

  it("calculates AI handled, handoff, SLA breach, lead funnel, and agent productivity", () => {
    const data = buildAnalyticsDashboardData(mockConversations, mockContacts, createDefaultAdminStore(), sampleKnowledgeItems, {
      ...defaultAnalyticsFilters,
      dateRange: "last_30_days"
    });

    expect(data.aiPerformance.totalAiRuns).toBe(5);
    expect(data.aiHandledRatePercent).toBe(40);
    expect(data.handoffRatePercent).toBe(40);
    expect(data.slaMetric.breachedCount).toBeGreaterThan(0);
    expect(data.slaMetric.breachRatePercent).toBeGreaterThan(0);
    expect(data.funnel.qualified).toBe(1);
    expect(data.funnel.quoted).toBe(1);
    expect(data.funnel.follow_up).toBe(1);
    expect(data.agentPerformance.find((agent) => agent.agentId === "agent-may")?.assignedCount).toBe(1);
  });

  it("does not include archived knowledge in usage metrics and counts no-match AI runs", () => {
    const archived = sampleKnowledgeItems.map((item) => item.id === "kb-price-package" ? { ...item, status: "archived" as const } : item);
    const data = buildAnalyticsDashboardData(mockConversations, mockContacts, createDefaultAdminStore(), archived, {
      ...defaultAnalyticsFilters,
      dateRange: "last_30_days"
    });

    expect(data.knowledgeMetrics.some((metric) => metric.knowledgeId === "kb-price-package")).toBe(false);
    expect(data.aiPerformance.noKnowledgeMatchCount).toBeGreaterThan(0);
  });

  it("applies date range, platform, agent, room, and AI mode filters", () => {
    const store = createDefaultAdminStore();

    expect(filterAnalyticsConversations(mockConversations, store, { ...defaultAnalyticsFilters, dateRange: "today" }).map((item) => item.id)).toEqual(["conv-line-01"]);
    expect(filterAnalyticsConversations(mockConversations, store, { ...defaultAnalyticsFilters, platform: "webchat", dateRange: "last_30_days" })).toHaveLength(2);
    expect(filterAnalyticsConversations(mockConversations, store, { ...defaultAnalyticsFilters, agentId: "agent-may", dateRange: "last_30_days" }).map((item) => item.id)).toEqual(["conv-web-01"]);
    expect(filterAnalyticsConversations(mockConversations, store, { ...defaultAnalyticsFilters, roomId: "telegram-bot-007237", dateRange: "last_30_days" }).map((item) => item.id)).toEqual(["conv-telegram-01"]);
    expect(filterAnalyticsConversations(mockConversations, store, { ...defaultAnalyticsFilters, aiMode: "need_human", dateRange: "last_30_days" }).map((item) => item.aiStatus)).toEqual(["Need Human"]);
  });

  it("builds and updates AI improvement queue without activating draft knowledge", () => {
    const queue = buildAiImprovementQueue(mockConversations, createDefaultAdminStore());
    const lowConfidence = queue.find((item) => item.issueType === "low_confidence");
    const noMatch = queue.find((item) => item.issueType === "no_knowledge_match");
    const highHandoff = queue.find((item) => item.issueType === "high_handoff");
    const reviewed = markImprovementReviewed(queue, queue[0]?.id ?? "");
    const draftItems = createKnowledgeDraftFromImprovement(sampleKnowledgeItems, queue[0]);

    expect(lowConfidence).toBeTruthy();
    expect(noMatch).toBeTruthy();
    expect(highHandoff).toBeTruthy();
    expect(reviewed[0]?.status).toBe("reviewed");
    expect(draftItems[0]?.status).toBe("draft");
    expect(sampleKnowledgeItems.filter((item) => item.status === "active")).toHaveLength(7);
  });

  it("exports CSV and summary text with required metrics", () => {
    const data = buildAnalyticsDashboardData(mockConversations, mockContacts, createDefaultAdminStore(), sampleKnowledgeItems, {
      ...defaultAnalyticsFilters,
      dateRange: "last_30_days"
    });
    const csv = exportChannelMetricsCsv(data.channelMetrics);
    const summary = buildExecutiveSummaryText(data);

    expect(csv.split("\n")[0]).toBe("platform,accountName,totalConversations,resolvedConversations,unresolvedConversations,aiHandledCount,humanHandledCount,averageFirstResponseMinutes,handoffCount");
    expect(summary).toContain("Total conversations");
    expect(summary).toContain("AI handled rate");
    expect(summary).toContain("Handoff rate");
    expect(summary).toContain("SLA breach rate");
    expect(summary).toContain("Top channel");
    expect(summary).toContain("Top issue");
  });

  it("provides data for every analytics dashboard section", () => {
    const data = buildAnalyticsDashboardData();

    expect(data.metricCards.length).toBeGreaterThan(0);
    expect(data.channelMetrics).toHaveLength(5);
    expect(data.aiPerformance.topIntents.length).toBeGreaterThan(0);
    expect(data.agentPerformance.length).toBeGreaterThan(0);
    expect(data.slaMetric.okCount + data.slaMetric.warningCount + data.slaMetric.breachedCount).toBeGreaterThan(0);
    expect(data.knowledgeMetrics.length).toBeGreaterThan(0);
    expect(Object.keys(data.funnel)).toEqual(["new", "interested", "qualified", "quoted", "won", "lost", "follow_up"]);
    expect(data.automationMetrics.automationRuns).toBeGreaterThan(0);
    expect(data.automationMetrics.automationSuccessRate).toBeGreaterThan(0);
    expect(data.automationMetrics.topActiveFlows.length).toBeGreaterThan(0);
    expect(data.broadcastAnalytics.totalCampaigns).toBeGreaterThan(0);
    expect(data.broadcastAnalytics.sentMockCount).toBeGreaterThan(0);
    expect(data.broadcastAnalytics.topCampaignByRecipients?.name).toBe("Hot Lead Reminder");
  });
});
