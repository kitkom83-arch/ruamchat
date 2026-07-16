"use client";

import { Bot, Plus, RotateCcw, Search, ShieldCheck, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { AgentRole, SettingsCannedReply, SettingsSlaPolicy, SettingsTeamMember } from "@ai-omni/shared";
import {
  createDefaultAdminStore,
  getStoredAdminStore,
  saveStoredAdminStore,
  searchCannedReplies,
  subscribeAdminStore,
  type AdminStore
} from "../../admin-data";
import { buildAgentPerformanceMetrics } from "../../analytics-data";
import { updateSettingsTeamMember } from "../../api-client";
import { dataMode } from "../../data-mode";
import { mockConversations } from "../../inbox-data";
import { loadSettingsTeamData } from "../../settings-data";
import UserManagementPanel from "./UserManagementPanel";

const roles: AgentRole[] = ["owner", "admin", "supervisor", "agent", "viewer"];

export default function TeamSettingsPage() {
  const [store, setStore] = useState<AdminStore>(() => createDefaultAdminStore());
  const [members, setMembers] = useState<SettingsTeamMember[]>([]);
  const [slaPolicies, setSlaPolicies] = useState<SettingsSlaPolicy[]>([]);
  const [cannedReplies, setCannedReplies] = useState<SettingsCannedReply[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState("");
  const [draft, setDraft] = useState<{ name: string; role: AgentRole }>({ name: "", role: "agent" });

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    loadSettingsTeamData(dataMode)
      .then((data) => {
        if (!active) return;
        setMembers(data.members);
        setSlaPolicies(data.slaPolicies);
        setCannedReplies(data.cannedReplies);
      })
      .catch((reason) => {
        if (!active) return;
        setMembers([]);
        setSlaPolicies([]);
        setCannedReplies([]);
        setError(`Settings Team API error: ${reason instanceof Error ? reason.message : "Unable to load settings team"}`);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    if (dataMode !== "api") {
      setStore(getStoredAdminStore());
      return () => {
        active = false;
      };
    }
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (dataMode === "api") return;
    return subscribeAdminStore(setStore);
  }, []);

  const replies = useMemo(() => searchCannedReplies(store, search), [search, store]);
  const visibleCannedReplies = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return cannedReplies.filter((reply) => {
      if (reply.status !== "active") return false;
      if (!normalized) return true;
      return [reply.title, reply.shortcut, reply.bodyTemplate, reply.category, ...reply.tags].some((value) =>
        value.toLowerCase().includes(normalized)
      );
    });
  }, [cannedReplies, search]);
  const agentMetrics = useMemo(() => buildAgentPerformanceMetrics(mockConversations, store), [store]);

  function updateStore(nextStore: AdminStore) {
    setStore(nextStore);
    saveStoredAdminStore(nextStore);
  }

  function addMockReply() {
    updateStore({
      ...store,
      cannedReplies: [
        {
          id: `reply-custom-${Date.now()}`,
          title: "Custom follow up",
          shortcut: `/custom${store.cannedReplies.length + 1}`,
          body: "ขอบคุณครับ ทีมงานจะติดตามรายละเอียดให้เร็วที่สุด",
          tags: ["custom"],
          category: "support",
          isActive: true
        },
        ...store.cannedReplies
      ]
    });
  }

  function toggleReply(replyId: string) {
    updateStore({
      ...store,
      cannedReplies: store.cannedReplies.map((reply) => reply.id === replyId ? { ...reply, isActive: !reply.isActive } : reply)
    });
  }

  function resetStore() {
    updateStore(createDefaultAdminStore());
  }

  function beginEdit(member: SettingsTeamMember) {
    setEditingId(member.id);
    setDraft({ name: member.name, role: member.role });
  }

  async function saveMember(memberId: string) {
    try {
      const updated = await updateSettingsTeamMember(memberId, draft);
      setMembers((current) => current.map((member) => member.id === updated.id ? updated : member));
      setEditingId("");
      setError("");
    } catch (reason) {
      setError(`Settings Team API error: ${reason instanceof Error ? reason.message : "Unable to update team member"}`);
    }
  }

  return (
    <main className="settingsPage">
      <header className="settingsHeader">
        <div>
          <p className="eyebrow">Team Settings</p>
          <h1>Agents, SLA policies, canned replies</h1>
        </div>
        {dataMode === "api" ? (
          <span className="settingsMode">DATA_MODE=api</span>
        ) : (
          <div className="aiSectionTabs">
            <button type="button" onClick={addMockReply}><Plus size={15} /> Add canned reply</button>
            <button type="button" onClick={resetStore}><RotateCcw size={15} /> Reset mock data</button>
          </div>
        )}
      </header>

      <UserManagementPanel />

      {error ? <section className="apiErrorBox" role="alert">{error}</section> : null}
      {loading ? <section className="apiLoadingBox">Loading team settings...</section> : null}

      <section className="teamSettingsGrid">
        <article className="channelPanel">
          <div className="channelPanelTop">
            <UsersRound size={20} />
            <div>
              <h2>Agents</h2>
              <p>{dataMode === "api" ? "Persisted tenant team members." : "Mock team assignment capacity and presence."}</p>
            </div>
          </div>
          <div className="identityList">
            {dataMode === "api" ? members.map((member) => (
              <div key={member.id} className="identityRow">
                {editingId === member.id ? (
                  <>
                    <label className="settingsInlineField">
                      <span>Name</span>
                      <input value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} />
                    </label>
                    <label className="settingsInlineField">
                      <span>Role</span>
                      <select value={draft.role} onChange={(event) => setDraft((current) => ({ ...current, role: event.target.value as AgentRole }))}>
                        {roles.map((role) => <option key={role} value={role}>{role}</option>)}
                      </select>
                    </label>
                    <button type="button" onClick={() => saveMember(member.id)}>Save</button>
                  </>
                ) : (
                  <>
                    <strong>{member.displayName} / {member.status}</strong>
                    <span>{member.role} / {member.email}</span>
                    <small>{member.maxConcurrentChats} max chats / skills: {member.skills.join(", ") || "general"}</small>
                    <button type="button" onClick={() => beginEdit(member)}>Edit</button>
                  </>
                )}
              </div>
            )) : store.agents.map((agent) => (
                <div key={agent.id} className="identityRow">
                  <strong>{agent.name} / {agent.status}</strong>
                  <span>{agent.role} / {agent.email}</span>
                  <small>{agent.activeConversationCount}/{agent.maxActiveConversations} active / rooms: {agent.assignedRoomIds.join(", ")}</small>
                  <small>
                    SLA breached {agentMetrics.find((metric) => metric.agentId === agent.id)?.slaBreachedCount ?? 0}
                    {" / "}canned used {agentMetrics.find((metric) => metric.agentId === agent.id)?.cannedRepliesUsed ?? 0}
                  </small>
                </div>
              ))}
            {!loading && !error && dataMode === "api" && members.length === 0 ? <div className="identityRow">No persisted team members returned.</div> : null}
          </div>
        </article>

        <article className="channelPanel">
          <div className="channelPanelTop">
            <ShieldCheck size={20} />
            <div>
              <h2>SLA policies</h2>
              <p>{dataMode === "api" ? "Persisted tenant SLA policies." : "Local policies by conversation priority."}</p>
            </div>
          </div>
          <div className="identityList">
            {dataMode === "api" ? slaPolicies.map((policy) => (
                <div key={policy.id} className="identityRow">
                  <strong>{policy.name} / {policy.priorityScope}</strong>
                  <span>First {policy.firstResponseMinutes}m / Resolution {policy.resolutionMinutes}m</span>
                  <small>{policy.status} / {policy.businessHoursMode} / escalation: {policy.escalationRole ?? "none"}</small>
                </div>
              )) : store.slaPolicies.map((policy) => (
                <div key={policy.id} className="identityRow">
                  <strong>{policy.name} / {policy.appliesToPriority}</strong>
                  <span>First {policy.firstResponseMinutes}m / Next {policy.nextResponseMinutes}m</span>
                  <small>Resolution {policy.resolutionHours}h</small>
                </div>
              ))}
            {!loading && dataMode === "api" && !error && slaPolicies.length === 0 ? <div className="identityRow">No persisted SLA policies returned.</div> : null}
          </div>
        </article>

        <article className="channelPanel teamCannedPanel">
          <div className="channelPanelTop">
            <Bot size={20} />
            <div>
              <h2>Canned replies</h2>
              <p>{dataMode === "api" ? "Persisted tenant canned replies." : "Mock management for shortcuts and categories."}</p>
            </div>
          </div>
          <label className="searchBox">
            <Search size={16} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search canned replies" />
          </label>
          <div className="knowledgeCards">
            {(dataMode === "api" ? visibleCannedReplies : replies).map((reply) => (
              <article key={reply.id} className="knowledgeCard">
                <div className="knowledgeCardTop">
                  <div>
                    <p>{reply.shortcut} / {reply.category}</p>
                    <h3>{reply.title}</h3>
                  </div>
                  <button className={`statusPill ${("isActive" in reply ? reply.isActive : reply.status === "active") ? "active" : "archived"}`} type="button" onClick={() => dataMode === "api" ? undefined : toggleReply(reply.id)}>
                    {"isActive" in reply ? reply.isActive ? "active" : "inactive" : reply.status}
                  </button>
                </div>
                <p className="knowledgeBody">{"body" in reply ? reply.body : reply.bodyTemplate}</p>
                <div className="tagRow">
                  {reply.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>
              </article>
            ))}
            {!loading && dataMode === "api" && !error && visibleCannedReplies.length === 0 ? <div className="identityRow">No persisted canned replies returned.</div> : null}
          </div>
        </article>
      </section>
    </main>
  );
}
