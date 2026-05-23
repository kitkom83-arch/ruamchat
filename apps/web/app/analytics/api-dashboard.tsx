"use client";

import {
  AlertTriangle,
  BarChart3,
  Bot,
  Clipboard,
  ShieldAlert,
  Table2,
  TrendingUp,
  UsersRound
} from "lucide-react";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { buildAnalyticsDashboardDataFromApi, type AnalyticsApiDashboardData } from "../analytics-data";

export function AnalyticsApiErrorState({ message }: { message: string }) {
  return <section className="errorBand" role="alert"><strong>Analytics API error</strong><span>{message}</span></section>;
}

export function AnalyticsApiDashboard({
  apiData,
  actionStatus,
  onActionStatus = () => {}
}: {
  apiData: AnalyticsApiDashboardData;
  actionStatus: string;
  onActionStatus?: (message: string) => void;
}) {
  const data = buildAnalyticsDashboardDataFromApi(apiData);

  return (
    <>
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
              <thead><tr><th>Channel</th><th>Conversations</th><th>Open</th><th>Closed</th><th>Messages</th><th>Inbound</th><th>Outbound</th><th>Action</th></tr></thead>
              <tbody>
                {apiData.channels.items.length === 0 ? (
                  <tr><td colSpan={8}>No API channel data for this filter.</td></tr>
                ) : apiData.channels.items.map((metric) => (
                  <tr key={`${metric.platform}-${metric.roomId}`}>
                    <td><strong>{metric.platform}</strong><small>{metric.accountName}</small></td>
                    <td>{metric.conversations}</td>
                    <td>{metric.openConversations}</td>
                    <td>{metric.closedConversations}</td>
                    <td>{metric.messages}</td>
                    <td>{metric.inboundMessages}</td>
                    <td>{metric.outboundMessages}</td>
                    <td><button type="button" onClick={() => onActionStatus(`Filtered room: ${metric.accountName}`)}>Inspect</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <BarList title="Platform split" rows={apiData.channels.platformSplit.map((item) => ({ label: item.platform, value: item.conversations }))} />
        </AnalyticsPanel>

        <AnalyticsPanel title="Conversation Status" icon={BarChart3}>
          <div className="analyticsStatGrid">
            <MiniStat label="Total" value={apiData.conversations.total} />
            <MiniStat label="Unread" value={apiData.overview.unreadConversations} />
            <MiniStat label="Unreplied" value={apiData.overview.unrepliedConversations} />
            <MiniStat label="Messages" value={apiData.overview.messagesCount} />
          </div>
          <BarList title="By status" rows={apiData.conversations.byStatus.map((item) => ({ label: item.key, value: item.count }))} />
        </AnalyticsPanel>

        <AnalyticsPanel title="Agent Workload" icon={UsersRound}>
          <div className="analyticsTableWrap">
            <table className="analyticsTable">
              <thead><tr><th>Agent</th><th>Assigned</th><th>Closed</th><th>Open tasks</th><th>Done tasks</th><th>Overdue</th></tr></thead>
              <tbody>
                {apiData.agents.items.length === 0 ? (
                  <tr><td colSpan={6}>No agent rows returned by the API.</td></tr>
                ) : apiData.agents.items.map((agent) => (
                  <tr key={agent.agentId}>
                    <td><strong>{agent.agentName}</strong><small>{agent.email}</small></td>
                    <td>{agent.assignedConversations}</td>
                    <td>{agent.closedConversations}</td>
                    <td>{agent.openTasks}</td>
                    <td>{agent.doneTasks}</td>
                    <td>{agent.overdueTasks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AnalyticsPanel>

        <AnalyticsPanel title="SLA Dashboard" icon={ShieldAlert}>
          <div className="slaOverview">
            <MiniStat label="Healthy" value={apiData.sla.healthyCount} />
            <MiniStat label="Warning" value={apiData.sla.warningCount} />
            <MiniStat label="Breached" value={apiData.sla.breachedCount} />
            <MiniStat label="Avg first response" value={`${apiData.sla.averageTimeToFirstResponseMinutes}m`} />
          </div>
          <BarList title="Resolution due" rows={Object.entries(apiData.sla.resolutionDue).map(([label, value]) => ({ label, value }))} />
        </AnalyticsPanel>

        <AnalyticsPanel title="AI & Knowledge" icon={Bot}>
          <div className="analyticsStatGrid">
            <MiniStat label="AI runs" value={apiData.ai.aiRunCount} />
            <MiniStat label="Knowledge bases" value={apiData.ai.knowledgeBaseCount} />
            <MiniStat label="Documents" value={apiData.ai.documentCount} />
            <MiniStat label="Chunks" value={apiData.ai.chunkCount} />
          </div>
          <BarList title="AI state distribution" rows={apiData.ai.aiStateDistribution.map((item) => ({ label: item.key, value: item.count }))} />
          <BarList title="Room policy modes" rows={apiData.ai.policyModeCounts.map((item) => ({ label: item.key, value: item.count }))} />
        </AnalyticsPanel>

        <AnalyticsPanel title="Tasks" icon={Clipboard}>
          <div className="analyticsStatGrid">
            <MiniStat label="Open" value={apiData.tasks.openTasks} />
            <MiniStat label="Done" value={apiData.tasks.doneTasks} />
            <MiniStat label="Overdue" value={apiData.tasks.overdueTasks} />
          </div>
          <div className="analyticsTableWrap compact">
            <table className="analyticsTable">
              <thead><tr><th>Task</th><th>Status</th><th>Due</th></tr></thead>
              <tbody>
                {apiData.tasks.latest.length === 0 ? (
                  <tr><td colSpan={3}>No tasks returned by the API.</td></tr>
                ) : apiData.tasks.latest.slice(0, 6).map((task) => (
                  <tr key={task.id}>
                    <td><strong>{task.title}</strong><small>{task.conversationId}</small></td>
                    <td>{task.status}</td>
                    <td>{task.dueAt ? new Date(task.dueAt).toLocaleDateString("th-TH") : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AnalyticsPanel>

        <AnalyticsPanel title="Audit" icon={AlertTriangle}>
          <BarList title="Actions" rows={apiData.audit.actions.map((item) => ({ label: item.key, value: item.count }))} />
          <div className="analyticsTableWrap compact">
            <table className="analyticsTable">
              <thead><tr><th>Latest event</th><th>Entity</th><th>Time</th></tr></thead>
              <tbody>
                {apiData.audit.latest.length === 0 ? (
                  <tr><td colSpan={3}>No audit events returned by the API.</td></tr>
                ) : apiData.audit.latest.slice(0, 6).map((event) => (
                  <tr key={event.id}>
                    <td><strong>{event.action}</strong><small>{event.actorUserId ?? "system"}</small></td>
                    <td>{event.entityType}</td>
                    <td>{new Date(event.createdAt).toLocaleString("th-TH")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AnalyticsPanel>
      </section>
    </>
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
