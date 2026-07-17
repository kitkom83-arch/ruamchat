"use client";

import {
  BarChart3,
  Bot,
  Clipboard,
  Download,
  FileText,
  Lightbulb,
  RefreshCw,
  ShieldAlert,
  Table2,
  TrendingUp,
  UsersRound,
  Workflow
} from "lucide-react";
import type { AnalyticsDateRange, Platform } from "@ai-omni/shared";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  buildAnalyticsDashboardData,
  buildExecutiveSummaryText,
  createKnowledgeDraftFromImprovement,
  defaultAnalyticsFilters,
  exportChannelMetricsCsv,
  loadAnalyticsData,
  markImprovementReviewed,
  type AiImprovementItem,
  type AnalyticsApiDashboardData,
  type AnalyticsFilters
} from "../analytics-data";
import { useLang } from "../i18n-data";
import { createDefaultAdminStore, getStoredAdminStore, saveStoredAdminStore, subscribeAdminStore, type AdminStore } from "../admin-data";
import { getStoredContacts, mockContacts, subscribeContacts } from "../crm-data";
import { getStoredKnowledgeItems, saveStoredKnowledgeItems, subscribeStoredKnowledgeItems } from "../ai-knowledge-store";
import { createDefaultFlowStore, getStoredFlowStore, subscribeFlowStore, type FlowStore } from "../flow-data";
import { createDefaultBroadcastStore, getStoredBroadcastStore, subscribeBroadcastStore, type BroadcastStore } from "../broadcast-data";
import { mockConversations, platformRooms } from "../inbox-data";
import { dataMode, isApiMode } from "../data-mode";
import { AnalyticsApiDashboard, AnalyticsApiErrorState } from "./api-dashboard";
import type { Contact, KnowledgeItem } from "@ai-omni/shared";
import type { LucideIcon } from "lucide-react";

const dateRangeOptions: Array<{ id: AnalyticsDateRange; label: string }> = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "last_7_days", label: "Last 7 days" },
  { id: "last_30_days", label: "Last 30 days" }
];

const platformOptions: Array<{ id: Platform | "all"; label: string }> = [
  { id: "all", label: "All platforms" },
  { id: "webchat", label: "Webchat" },
  { id: "telegram", label: "Telegram" },
  { id: "line", label: "LINE" },
  { id: "facebook", label: "Facebook" },
  { id: "instagram", label: "Instagram" }
];

const aiModeOptions: Array<{ id: AnalyticsFilters["aiMode"]; label: string }> = [
  { id: "all", label: "All AI modes" },
  { id: "auto", label: "Auto" },
  { id: "suggest", label: "Suggest" },
  { id: "need_human", label: "Need Human" },
  { id: "human_taken", label: "Human Taken" }
];

export default function AnalyticsPage() {
  return isApiMode() ? <ApiAnalyticsPage /> : <MockAnalyticsPage />;
}

function MockAnalyticsPage() {
  const { t } = useLang();
  const [adminStore, setAdminStore] = useState<AdminStore>(() => createDefaultAdminStore());
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>(() => getStoredKnowledgeItems());
  const [flowStore, setFlowStore] = useState<FlowStore>(() => createDefaultFlowStore());
  const [broadcastStore, setBroadcastStore] = useState<BroadcastStore>(() => createDefaultBroadcastStore());
  const [filters, setFilters] = useState<AnalyticsFilters>(defaultAnalyticsFilters);
  const [queueState, setQueueState] = useState<AiImprovementItem[] | null>(null);
  const [actionStatus, setActionStatus] = useState("Analytics actions ready");

  useEffect(() => {
    setAdminStore(getStoredAdminStore());
    return subscribeAdminStore(setAdminStore);
  }, []);

  useEffect(() => {
    setContacts(getStoredContacts());
    return subscribeContacts(setContacts);
  }, []);

  useEffect(() => {
    setKnowledgeItems(getStoredKnowledgeItems());
    return subscribeStoredKnowledgeItems(setKnowledgeItems);
  }, []);

  useEffect(() => {
    setFlowStore(getStoredFlowStore());
    return subscribeFlowStore(setFlowStore);
  }, []);

  useEffect(() => {
    setBroadcastStore(getStoredBroadcastStore());
    return subscribeBroadcastStore(setBroadcastStore);
  }, []);

  const data = useMemo(
    () => buildAnalyticsDashboardData(mockConversations, contacts, adminStore, knowledgeItems, filters, flowStore, broadcastStore),
    [adminStore, broadcastStore, contacts, filters, flowStore, knowledgeItems]
  );
  const improvementQueue = queueState ?? data.improvementQueue;

  function updateFilter<K extends keyof AnalyticsFilters>(key: K, value: AnalyticsFilters[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
    setQueueState(null);
  }

  function exportCsv() {
    const csv = exportChannelMetricsCsv(data.channelMetrics);
    void navigator.clipboard?.writeText(csv);
    setActionStatus(`CSV copied (${data.channelMetrics.length} rows)`);
  }

  function copySummary() {
    void navigator.clipboard?.writeText(buildExecutiveSummaryText(data));
    setActionStatus("Executive summary copied");
  }

  function markReviewed(itemId: string) {
    setQueueState(markImprovementReviewed(improvementQueue, itemId));
    setActionStatus("AI improvement item marked reviewed");
  }

  function createDraft(item: AiImprovementItem) {
    const nextKnowledge = createKnowledgeDraftFromImprovement(knowledgeItems, item);
    setKnowledgeItems(nextKnowledge);
    saveStoredKnowledgeItems(nextKnowledge);
    setActionStatus("Knowledge draft created as draft only");
  }

  return (
    <main className="analyticsPage">
      <header className="analyticsHeader">
        <div>
          <p className="eyebrow">{t("page.analytics.eyebrow")}</p>
          <h1>{t("page.analytics.h1")}</h1>
          <p className="analyticsLead">{t("page.analytics.lead")}</p>
        </div>
        <div className="analyticsActions">
          <button type="button" onClick={exportCsv}><Download size={15} /> Export CSV</button>
          <button type="button" onClick={copySummary}><Clipboard size={15} /> Copy Summary</button>
        </div>
      </header>

      <section className="analyticsControls" aria-label="Analytics filters">
        <label>Date range<select value={filters.dateRange} onChange={(event) => updateFilter("dateRange", event.target.value as AnalyticsDateRange)}>{dateRangeOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
        <label>Platform<select value={filters.platform} onChange={(event) => updateFilter("platform", event.target.value as Platform | "all")}>{platformOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
        <label>Agent<select value={filters.agentId} onChange={(event) => updateFilter("agentId", event.target.value)}><option value="all">All agents</option>{adminStore.agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}</select></label>
        <label>Room<select value={filters.roomId} onChange={(event) => updateFilter("roomId", event.target.value)}><option value="all">All rooms</option>{platformRooms.map((room) => <option key={room.id} value={room.id}>{room.platformLabel} / {room.accountName}</option>)}</select></label>
        <label>AI mode<select value={filters.aiMode} onChange={(event) => updateFilter("aiMode", event.target.value as AnalyticsFilters["aiMode"])}>{aiModeOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
      </section>

      <section className="executiveSummary">
        <div>
          <div className="blockHeader"><TrendingUp size={18} /><h2>Executive Summary</h2></div>
          <p>{data.executiveSummary}</p>
        </div>
        <span>{actionStatus}</span>
      </section>

      <section className="metricCardGrid">
        {data.metricCards.map((card) => (
          <article key={card.id} className="analyticsMetricCard">
            <div className="metricTop">
              <span>{card.title}</span>
              <strong className={card.trend}>{card.trend} {card.changePercent}%</strong>
            </div>
            <h2>{card.value}<small>{card.unit}</small></h2>
            <p>{card.description}</p>
          </article>
        ))}
      </section>

      <section className="analyticsGrid">
        <AnalyticsPanel title="Channel Performance" icon={Table2}>
          <div className="analyticsTableWrap">
            <table className="analyticsTable">
              <thead><tr><th>Channel</th><th>Total</th><th>Resolved</th><th>Unresolved</th><th>AI</th><th>Human</th><th>First response</th><th>Action</th></tr></thead>
              <tbody>
                {data.channelMetrics.map((metric) => (
                  <tr key={`${metric.platform}-${metric.accountName}`}>
                    <td><strong>{metric.platform}</strong><small>{metric.accountName}</small></td>
                    <td>{metric.totalConversations}</td>
                    <td>{metric.resolvedConversations}</td>
                    <td>{metric.unresolvedConversations}</td>
                    <td>{metric.aiHandledCount}</td>
                    <td>{metric.humanHandledCount}</td>
                    <td>{metric.averageFirstResponseMinutes}m</td>
                    <td><button type="button" onClick={() => setActionStatus(`Open room: ${metric.accountName}`)}>Open room</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AnalyticsPanel>

        <AnalyticsPanel title="AI Performance" icon={Bot}>
          <div className="analyticsStatGrid">
            <MiniStat label="Auto replies" value={data.aiPerformance.autoReplies} />
            <MiniStat label="Suggested replies" value={data.aiPerformance.suggestedReplies} />
            <MiniStat label="Handoffs" value={data.aiPerformance.handoffs} />
            <MiniStat label="Average confidence" value={`${Math.round(data.aiPerformance.averageConfidence * 100)}%`} />
            <MiniStat label="Low confidence" value={data.aiPerformance.lowConfidenceCount} />
            <MiniStat label="Marked wrong" value={data.aiPerformance.markedWrongCount} />
            <MiniStat label="No knowledge match" value={data.aiPerformance.noKnowledgeMatchCount} />
          </div>
          <BarList title="Top intents" rows={data.aiPerformance.topIntents.map((item) => ({ label: item.intent, value: item.count }))} />
          <BarList title="Top handoff reasons" rows={data.aiPerformance.topFailureReasons.map((item) => ({ label: item.reason, value: item.count }))} />
          <button className="panelCommand" type="button" onClick={() => setActionStatus("Review AI failures opened in mock mode")}>Review AI failures</button>
        </AnalyticsPanel>

        <AnalyticsPanel title="Admin Productivity" icon={UsersRound}>
          <div className="analyticsTableWrap">
            <table className="analyticsTable">
              <thead><tr><th>Agent</th><th>Assigned</th><th>Resolved</th><th>First response</th><th>Handle time</th><th>SLA breached</th><th>Canned</th><th>Takeover</th></tr></thead>
              <tbody>
                {data.agentPerformance.map((agent) => (
                  <tr key={agent.agentId}>
                    <td><strong>{agent.agentName}</strong><small>{agent.agentId}</small></td>
                    <td>{agent.assignedCount}</td>
                    <td>{agent.resolvedCount}</td>
                    <td>{agent.averageFirstResponseMinutes}m</td>
                    <td>{agent.averageHandleTimeMinutes}m</td>
                    <td>{agent.slaBreachedCount}</td>
                    <td>{agent.cannedRepliesUsed}</td>
                    <td>{agent.takeoverCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AnalyticsPanel>

        <AnalyticsPanel title="SLA Dashboard" icon={ShieldAlert}>
          <div className="slaOverview">
            <MiniStat label="OK" value={data.slaMetric.okCount} />
            <MiniStat label="Warning" value={data.slaMetric.warningCount} />
            <MiniStat label="Breached" value={data.slaMetric.breachedCount} />
            <MiniStat label="Breach rate" value={`${data.slaMetric.breachRatePercent}%`} />
          </div>
          <BarList title="Top breached rooms" rows={data.slaMetric.topBreachedRooms.map((room) => ({ label: room.roomName, value: room.breachedCount }))} />
          <button className="panelCommand" type="button" onClick={() => setActionStatus("SLA breached conversations filtered in mock mode")}>Review SLA breached</button>
        </AnalyticsPanel>

        <AnalyticsPanel title="Automation Metrics" icon={Workflow}>
          <div className="analyticsStatGrid">
            <MiniStat label="Automation runs" value={data.automationMetrics.automationRuns} />
            <MiniStat label="Success rate" value={`${data.automationMetrics.automationSuccessRate}%`} />
            <MiniStat label="Failed automations" value={data.automationMetrics.failedAutomationCount} />
          </div>
          <BarList title="Top active flows" rows={data.automationMetrics.topActiveFlows.map((flow) => ({ label: flow.name, value: flow.count }))} />
          <button className="panelCommand" type="button" onClick={() => setActionStatus("Automation run history opened in mock mode")}>Review automations</button>
        </AnalyticsPanel>

        <AnalyticsPanel title="Broadcast Metrics" icon={Clipboard}>
          <div className="analyticsStatGrid">
            <MiniStat label="Campaigns" value={data.broadcastAnalytics.totalCampaigns} />
            <MiniStat label="Recipients" value={data.broadcastAnalytics.totalRecipients} />
            <MiniStat label="Mock sent rate" value={`${data.broadcastAnalytics.mockSentRate}%`} />
            <MiniStat label="Skipped opt-out" value={data.broadcastAnalytics.optOutSkippedCount} />
          </div>
          <BarList title="Broadcast delivery" rows={[
            { label: "sent_mock", value: data.broadcastAnalytics.sentMockCount },
            { label: "skipped", value: data.broadcastAnalytics.skippedCount },
            { label: "failed_mock", value: data.broadcastAnalytics.failedMockCount }
          ]} />
          <div className="recommendationBox">
            <strong>Top campaign by recipients</strong>
            <p>{data.broadcastAnalytics.topCampaignByRecipients ? `${data.broadcastAnalytics.topCampaignByRecipients.name}: ${data.broadcastAnalytics.topCampaignByRecipients.recipients}` : "No sent mock runs yet"}</p>
          </div>
        </AnalyticsPanel>

        <AnalyticsPanel title="Knowledge Base Usage" icon={FileText}>
          <div className="analyticsTableWrap compact">
            <table className="analyticsTable">
              <thead><tr><th>Knowledge</th><th>Category</th><th>Used</th><th>Success</th><th>Wrong</th></tr></thead>
              <tbody>
                {data.knowledgeMetrics.slice(0, 6).map((metric) => (
                  <tr key={metric.knowledgeId}>
                    <td><strong>{metric.title}</strong></td>
                    <td>{metric.category}</td>
                    <td>{metric.usedCount}</td>
                    <td>{metric.successfulUseCount}</td>
                    <td>{metric.markedWrongCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="recommendationBox">
            <strong>Recommended improvements</strong>
            <p>Add FAQ for top unknown intents. Review marked wrong replies. Update price rules if pricing intent has low confidence.</p>
          </div>
        </AnalyticsPanel>

        <AnalyticsPanel title="Lead Funnel" icon={BarChart3}>
          <BarList title="CRM status" rows={Object.entries(data.funnel).map(([label, value]) => ({ label, value }))} />
          <button className="panelCommand" type="button" onClick={() => setActionStatus("Open contact drilldown in mock mode")}>Open contact</button>
        </AnalyticsPanel>
      </section>

      <section className="analyticsPanel improvementPanel">
        <div className="blockHeader"><Lightbulb size={18} /><h2>AI Improvement Queue</h2></div>
        <div className="improvementList">
          {improvementQueue.map((item) => (
            <article key={item.id} className="improvementItem">
              <div>
                <strong>{item.issueType} / {item.relatedIntent}</strong>
                <p>{item.sampleCustomerQuestion}</p>
                <small>{item.recommendedAction}{item.linkedKnowledgeSource ? ` / source: ${item.linkedKnowledgeSource}` : ""}</small>
              </div>
              <span className={`statusPill ${item.status === "open" ? "draft" : "active"}`}>{item.status}</span>
              <button type="button" onClick={() => markReviewed(item.id)}>Mark Reviewed</button>
              <button type="button" onClick={() => createDraft(item)}>Create Knowledge Draft</button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function ApiAnalyticsPage() {
  const { t } = useLang();
  const [filters, setFilters] = useState<AnalyticsFilters>(defaultAnalyticsFilters);
  const [apiData, setApiData] = useState<AnalyticsApiDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionStatus, setActionStatus] = useState("API analytics ready");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setApiData(null);
    loadAnalyticsData("api", filters)
      .then((result) => {
        if (cancelled) return;
        if (result.mode === "api") {
          setApiData(result.data);
          setActionStatus("API analytics loaded");
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setError(readableError(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filters]);

  function updateFilter<K extends keyof AnalyticsFilters>(key: K, value: AnalyticsFilters[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  const roomOptions = apiData?.channels.items ?? [];
  const agentOptions = apiData?.agents.items ?? [];

  return (
    <main className="analyticsPage">
      <header className="analyticsHeader">
        <div>
          <p className="eyebrow">{t("page.analytics.eyebrow")}</p>
          <h1>{t("page.analytics.h1Api")}</h1>
          <p className="analyticsLead">{t("page.analytics.leadApi")}</p>
        </div>
        <div className="analyticsActions">
          <button type="button" onClick={() => setFilters({ ...filters })}><RefreshCw size={15} /> Refresh</button>
        </div>
      </header>

      <section className="analyticsControls" aria-label="Analytics filters">
        <label>Date range<select value={filters.dateRange} onChange={(event) => updateFilter("dateRange", event.target.value as AnalyticsDateRange)}>{dateRangeOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
        <label>Platform<select value={filters.platform} onChange={(event) => updateFilter("platform", event.target.value as Platform | "all")}>{platformOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
        <label>Agent<select value={filters.agentId} onChange={(event) => updateFilter("agentId", event.target.value)}><option value="all">All agents</option>{agentOptions.map((agent) => <option key={agent.agentId} value={agent.agentId}>{agent.agentName}</option>)}</select></label>
        <label>Room<select value={filters.roomId} onChange={(event) => updateFilter("roomId", event.target.value)}><option value="all">All rooms</option>{roomOptions.map((room) => <option key={room.roomId} value={room.roomId}>{room.platform} / {room.accountName}</option>)}</select></label>
      </section>

      <section className="warningBand">
        <strong>{dataMode.toUpperCase()} mode</strong>
        <span>No mock fallback when API requests fail</span>
        <span>No external platform or OpenAI calls from analytics</span>
      </section>

      {error && <AnalyticsApiErrorState message={error} />}
      {loading && <section className="loadingBand"><RefreshCw size={16} /> Loading analytics API data...</section>}
      {!loading && apiData && <AnalyticsApiDashboard apiData={apiData} actionStatus={actionStatus} onActionStatus={setActionStatus} />}
    </main>
  );
}

function AnalyticsPanel({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: ReactNode }) {
  return (
    <section className="analyticsPanel">
      <div className="blockHeader"><Icon size={18} /><h2>{title}</h2></div>
      {children}
    </section>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="miniStat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function BarList({ title, rows }: { title: string; rows: Array<{ label: string; value: number }> }) {
  const max = Math.max(1, ...rows.map((row) => row.value));
  return (
    <div className="barList">
      <strong>{title}</strong>
      {rows.length === 0 ? <p>No data</p> : rows.map((row) => (
        <div key={row.label} className="barRow">
          <span>{row.label}</span>
          <div><i style={{ width: `${Math.max(8, (row.value / max) * 100)}%` }} /></div>
          <b>{row.value}</b>
        </div>
      ))}
    </div>
  );
}

function readableError(error: unknown) {
  return error instanceof Error ? error.message : "Unknown analytics API error";
}
