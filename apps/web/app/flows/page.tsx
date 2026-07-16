"use client";

import {
  Archive,
  CheckCircle2,
  Copy,
  Edit3,
  Inbox,
  Pause,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Send,
  Trash2,
  Workflow
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { AIIntent, ConversationStatus, Flow, FlowTestRunResult as ApiFlowTestRunResult, FlowTriggerType, Platform } from "@ai-omni/shared";
import {
  createApiFlow,
  deleteApiFlow,
  duplicateApiFlow,
  testRunApiFlow,
  updateApiFlow,
  updateApiFlowStatus
} from "../api-client";
import {
  activateFlow,
  allFlowPlatforms,
  archiveFlow,
  buildFlowTestInput,
  createDefaultFlowStore,
  createFlow,
  duplicateFlow,
  getFlowRunHistory,
  getFlowStats,
  loadFlowBuilderData,
  getStoredFlowStore,
  getPreviewSequence,
  pauseFlow,
  runAndRecordFlow,
  saveStoredFlowStore,
  subscribeFlowStore,
  type FlowRunTestResult,
  type FlowStore
} from "../flow-data";
import { dataMode, isApiMode } from "../data-mode";
import { createDefaultAdminStore } from "../admin-data";
import { findContactForConversation, mockContacts } from "../crm-data";
import { mockConversations, platformRooms } from "../inbox-data";

const triggerTypes: FlowTriggerType[] = ["keyword", "first_message", "tag_added", "ai_intent", "status_changed", "manual_test"];

export default function FlowsPage() {
  return isApiMode() ? <ApiFlowsPage /> : <MockFlowsPage />;
}

function MockFlowsPage() {
  const [flowStore, setFlowStore] = useState<FlowStore>(() => createDefaultFlowStore());
  const [selectedFlowId, setSelectedFlowId] = useState("flow-pricing-lead");
  const [lastResult, setLastResult] = useState<FlowRunTestResult | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    triggerType: "keyword" as FlowTriggerType,
    keyword: "ราคา",
    intent: "pricing",
    tag: "hot lead",
    status: "follow_up",
    platform: "all",
    roomId: "all"
  });
  const [testInput, setTestInput] = useState({
    conversationId: "conv-web-01",
    message: "อยากทราบราคาแพ็กเกจ",
    platform: "webchat" as Platform,
    roomId: "webchat-main"
  });

  useEffect(() => {
    const store = getStoredFlowStore();
    setFlowStore(store);
    setSelectedFlowId((current) => store.flows.some((flow) => flow.id === current) ? current : store.flows[0]?.id ?? "");
    return subscribeFlowStore(setFlowStore);
  }, []);

  const selectedFlow = flowStore.flows.find((flow) => flow.id === selectedFlowId) ?? flowStore.flows[0];
  const selectedConversation = mockConversations.find((conversation) => conversation.id === testInput.conversationId) ?? mockConversations[0];
  const selectedContact = findContactForConversation(mockContacts, selectedConversation);
  const selectedRuns = selectedFlow ? getFlowRunHistory(flowStore, selectedFlow.id) : [];

  const automationMetrics = useMemo(() => {
    const total = flowStore.runs.length;
    const success = flowStore.runs.filter((run) => run.status === "completed").length;
    return {
      runs: total,
      successRate: total === 0 ? 100 : Math.round((success / total) * 100),
      failed: flowStore.runs.filter((run) => run.status === "failed").length
    };
  }, [flowStore]);

  function persist(nextStore: FlowStore) {
    setFlowStore(nextStore);
    saveStoredFlowStore(nextStore);
  }

  function createDraftFlow() {
    const platforms = form.platform === "all" ? allFlowPlatforms : [form.platform as Platform];
    const roomIds = form.roomId === "all" ? [] : [form.roomId];
    const nextStore = createFlow(flowStore, {
      name: form.name || "Draft automation",
      description: form.description,
      triggerType: form.triggerType,
      keyword: form.keyword,
      intent: form.intent as AIIntent,
      tag: form.tag,
      status: form.status as ConversationStatus,
      platformScope: platforms,
      roomIds
    });
    persist(nextStore);
    setSelectedFlowId(nextStore.flows[0]?.id ?? selectedFlowId);
  }

  function runTest(flow: Flow) {
    const input = buildFlowTestInput(selectedConversation, selectedContact, {
      message: testInput.message,
      platform: testInput.platform,
      roomId: testInput.roomId,
      triggerType: flow.trigger.type,
      intent: flow.trigger.intent ?? selectedConversation.aiAnalysis?.intent,
      tag: flow.trigger.tag ?? selectedConversation.tags[0],
      status: flow.trigger.status ?? selectedConversation.status,
      isFirstMessage: flow.trigger.type === "first_message" ? true : undefined,
      businessHours: true
    });
    const { store: nextStore, result } = runAndRecordFlow(flowStore, flow.id, input, {
      conversations: mockConversations,
      contacts: mockContacts,
      adminStore: createDefaultAdminStore()
    });
    if (result) setLastResult(result);
    persist(nextStore);
  }

  function setStatus(flowId: string, action: "active" | "paused" | "archived") {
    if (action === "active") persist(activateFlow(flowStore, flowId));
    if (action === "paused") persist(pauseFlow(flowStore, flowId));
    if (action === "archived") persist(archiveFlow(flowStore, flowId));
  }

  return (
    <main className="flowsShell">
      <section className="flowsPage">
        <header className="flowsHeader">
          <div>
            <p className="eyebrow">Flow Builder</p>
            <h1>Automation rules for separated platform rooms</h1>
            <p>Mock/local builder for Webchat, Telegram, LINE, Facebook, and Instagram. Tests never call external APIs.</p>
          </div>
          <div className="flowMetricStrip">
            <MiniStat label="Automation runs" value={automationMetrics.runs} />
            <MiniStat label="Success rate" value={`${automationMetrics.successRate}%`} />
            <MiniStat label="Failed" value={automationMetrics.failed} />
          </div>
        </header>

        <section className="flowCreatePanel">
          <div className="blockHeader"><Plus size={18} /><h2>Create Flow</h2></div>
          <div className="flowFormGrid">
            <label>Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Draft automation" /></label>
            <label>Description<input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="What this automation does" /></label>
            <label>Trigger<select value={form.triggerType} onChange={(event) => setForm({ ...form, triggerType: event.target.value as FlowTriggerType })}>{triggerTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
            <label>Keyword<input value={form.keyword} onChange={(event) => setForm({ ...form, keyword: event.target.value })} /></label>
            <label>Intent<input value={form.intent} onChange={(event) => setForm({ ...form, intent: event.target.value })} /></label>
            <label>Tag<input value={form.tag} onChange={(event) => setForm({ ...form, tag: event.target.value })} /></label>
            <label>Status<input value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} /></label>
            <label>Platform<select value={form.platform} onChange={(event) => setForm({ ...form, platform: event.target.value, roomId: "all" })}><option value="all">All platforms</option>{allFlowPlatforms.map((platform) => <option key={platform} value={platform}>{platform}</option>)}</select></label>
            <label>Room<select value={form.roomId} onChange={(event) => setForm({ ...form, roomId: event.target.value })}><option value="all">All rooms</option>{platformRooms.filter((room) => form.platform === "all" || room.platform === form.platform).map((room) => <option key={room.id} value={room.id}>{room.platformLabel} / {room.accountName}</option>)}</select></label>
            <button type="button" onClick={createDraftFlow}><Plus size={15} /> Create draft</button>
          </div>
        </section>

        <section className="flowWorkspace">
          <div className="flowListPanel">
            <div className="blockHeader"><Workflow size={18} /><h2>Flow list</h2></div>
            <div className="flowList">
              {flowStore.flows.map((flow) => {
                const stats = getFlowStats(flowStore, flow.id);
                return (
                  <article key={flow.id} className={flow.id === selectedFlow?.id ? "flowListItem selected" : "flowListItem"}>
                    <button type="button" onClick={() => setSelectedFlowId(flow.id)}>
                      <strong>{flow.name}</strong>
                      <span>{flow.status} / {flow.triggerType}</span>
                      <small>{flow.platformScope.join(", ")} / {flow.roomIds.length > 0 ? flow.roomIds.join(", ") : "all rooms"}</small>
                      <small>Updated {new Date(flow.updatedAt).toLocaleString("th-TH")} / runs {stats.runCount} / success {stats.successRate}%</small>
                    </button>
                    <div className="flowButtonRow">
                      <button type="button" onClick={() => setSelectedFlowId(flow.id)}><Edit3 size={13} /> Edit</button>
                      <button type="button" onClick={() => persist(duplicateFlow(flowStore, flow.id))}><Copy size={13} /> Duplicate</button>
                      <button type="button" onClick={() => setStatus(flow.id, "active")}><Play size={13} /> Activate</button>
                      <button type="button" onClick={() => setStatus(flow.id, "paused")}><Pause size={13} /> Pause</button>
                      <button type="button" onClick={() => setStatus(flow.id, "archived")}><Archive size={13} /> Archive</button>
                      <button type="button" onClick={() => runTest(flow)}><RotateCcw size={13} /> Test</button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {selectedFlow && (
            <div className="flowEditorPanel">
              <section className="flowEditorSection">
                <div className="blockHeader"><Edit3 size={18} /><h2>{selectedFlow.name}</h2></div>
                <p>{selectedFlow.description}</p>
                <div className="flowScopeRow">
                  <span className={`statusPill ${selectedFlow.status}`}>{selectedFlow.status}</span>
                  <span>{selectedFlow.platformScope.join(", ")}</span>
                  <span>{selectedFlow.roomIds.length > 0 ? selectedFlow.roomIds.join(", ") : "all rooms"}</span>
                </div>
              </section>

              <section className="flowEditorGrid">
                <FlowSection title="Trigger" nodes={selectedFlow.nodes.filter((node) => node.type === "trigger")} />
                <FlowSection title="Conditions" nodes={selectedFlow.nodes.filter((node) => node.type === "condition")} />
                <FlowSection title="Actions" nodes={selectedFlow.nodes.filter((node) => !["trigger", "condition"].includes(node.type))} />
              </section>

              <section className="flowEditorSection">
                <div className="blockHeader"><Workflow size={18} /><h2>Preview sequence</h2></div>
                <div className="nodeSequence">
                  {getPreviewSequence(selectedFlow).map((node, index) => (
                    <div key={node.id} className="nodeChip">
                      <span>{index + 1}</span>
                      <strong>{node.type}</strong>
                      <small>{node.label}</small>
                    </div>
                  ))}
                </div>
              </section>

              <section className="flowEditorSection">
                <div className="blockHeader"><Send size={18} /><h2>Test Flow Panel</h2></div>
                <div className="flowFormGrid testGrid">
                  <label>Conversation<select value={testInput.conversationId} onChange={(event) => setTestInput({ ...testInput, conversationId: event.target.value })}>{mockConversations.map((conversation) => <option key={conversation.id} value={conversation.id}>{conversation.platformLabel} / {conversation.customerName}</option>)}</select></label>
                  <label>Customer message<input value={testInput.message} onChange={(event) => setTestInput({ ...testInput, message: event.target.value })} /></label>
                  <label>Platform<select value={testInput.platform} onChange={(event) => setTestInput({ ...testInput, platform: event.target.value as Platform })}>{allFlowPlatforms.map((platform) => <option key={platform} value={platform}>{platform}</option>)}</select></label>
                  <label>Room<select value={testInput.roomId} onChange={(event) => setTestInput({ ...testInput, roomId: event.target.value })}>{platformRooms.filter((room) => room.platform === testInput.platform).map((room) => <option key={room.id} value={room.id}>{room.accountName}</option>)}</select></label>
                  <label>Contact<input value={selectedContact?.displayName ?? "Local contact"} readOnly /></label>
                  <button type="button" onClick={() => runTest(selectedFlow)}><RotateCcw size={15} /> Run Test</button>
                </div>

                {lastResult && lastResult.flowRun.flowId === selectedFlow.id && (
                  <div className="flowRunResult">
                    <div className="flowResultSummary">
                      <MiniStat label="Trigger matched" value={lastResult.triggerMatched ? "yes" : "no"} />
                      <MiniStat label="Run status" value={lastResult.flowRun.status} />
                      <MiniStat label="Steps" value={lastResult.flowRun.steps.length} />
                      <MiniStat label="Audit logs" value={lastResult.state.auditLogsCreated.length} />
                    </div>
                    <div className="flowResultColumns">
                      <div>
                        <strong>Step-by-step run</strong>
                        {lastResult.flowRun.steps.map((step) => (
                          <p key={step.id}>{step.nodeType} / {step.status} / {step.error ?? JSON.stringify(step.output ?? {})}</p>
                        ))}
                      </div>
                      <div>
                        <strong>Action results</strong>
                        {lastResult.state.actionResults.map((result, index) => (
                          <p key={`${result.actionType}-${index}`}>{result.actionType} / {result.status} / {result.message}</p>
                        ))}
                      </div>
                      <div>
                        <strong>Final conversation state</strong>
                        <p>Room: {lastResult.state.conversations.find((item) => item.id === testInput.conversationId)?.roomId}</p>
                        <p>Tags: {lastResult.state.conversations.find((item) => item.id === testInput.conversationId)?.tags.join(", ")}</p>
                        <p>Status: {lastResult.state.conversations.find((item) => item.id === testInput.conversationId)?.status}</p>
                        <p>Priority: {lastResult.state.conversations.find((item) => item.id === testInput.conversationId)?.priority}</p>
                      </div>
                      <div>
                        <strong>Audit logs created</strong>
                        {lastResult.state.auditLogsCreated.map((log) => (
                          <p key={log.id}>{log.action} / {log.targetId}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </section>

              <section className="flowEditorSection">
                <div className="blockHeader"><CheckCircle2 size={18} /><h2>Recent runs</h2></div>
                <div className="analyticsTableWrap">
                  <table className="analyticsTable">
                    <thead><tr><th>Status</th><th>Conversation</th><th>Started</th><th>Summary</th><th>Steps</th><th>Failed step</th></tr></thead>
                    <tbody>
                      {selectedRuns.map((run) => {
                        const failedStep = run.steps.find((step) => step.status === "failed");
                        return (
                          <tr key={run.id}>
                            <td>{run.status}</td>
                            <td>{run.conversationId}</td>
                            <td>{new Date(run.startedAt).toLocaleString("th-TH")}</td>
                            <td>{run.resultSummary}</td>
                            <td>{run.steps.length}</td>
                            <td>{failedStep?.nodeId ?? "-"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function ApiFlowsPage() {
  const [flowStore, setFlowStore] = useState<FlowStore>(() => ({ flows: [], runs: [] }));
  const [selectedFlowId, setSelectedFlowId] = useState("");
  const [lastResult, setLastResult] = useState<ApiFlowTestRunResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState("API flow builder ready");
  const [form, setForm] = useState({
    name: "",
    description: "",
    triggerType: "keyword" as FlowTriggerType,
    keyword: "ราคา",
    intent: "pricing",
    tag: "hot lead",
    status: "follow_up",
    platform: "all",
    roomId: "all"
  });
  const [testInput, setTestInput] = useState({
    conversationId: "00000000-0000-4000-8000-000000000201",
    message: "อยากทราบราคาแพ็กเกจ",
    platform: "webchat" as Platform,
    roomId: "room-webchat"
  });

  const selectedFlow = flowStore.flows.find((flow) => flow.id === selectedFlowId) ?? flowStore.flows[0];
  const selectedRuns = selectedFlow ? getFlowRunHistory(flowStore, selectedFlow.id) : [];

  const automationMetrics = useMemo(() => {
    const total = flowStore.runs.length;
    const completed = flowStore.runs.filter((run) => ["completed", "success", "dry_run"].includes(run.status)).length;
    return {
      runs: total,
      successRate: total === 0 ? 100 : Math.round((completed / total) * 100),
      failed: flowStore.runs.filter((run) => run.status === "failed").length
    };
  }, [flowStore]);

  useEffect(() => {
    void refreshData();
  }, []);

  useEffect(() => {
    if (!selectedFlow) return;
    setForm({
      name: selectedFlow.name,
      description: selectedFlow.description,
      triggerType: selectedFlow.triggerType,
      keyword: selectedFlow.trigger.keyword ?? "ราคา",
      intent: selectedFlow.trigger.intent ?? "pricing",
      tag: selectedFlow.trigger.tag ?? "hot lead",
      status: selectedFlow.trigger.status ?? "follow_up",
      platform: selectedFlow.platformScope.length === allFlowPlatforms.length ? "all" : selectedFlow.platformScope[0] ?? "all",
      roomId: selectedFlow.roomIds[0] ?? "all"
    });
  }, [selectedFlow?.id]);

  async function refreshData(nextSelectedFlowId = selectedFlowId) {
    setLoading(true);
    setError(null);
    try {
      const data = await loadFlowBuilderData("api");
      setFlowStore(data.store);
      const candidate = nextSelectedFlowId && data.store.flows.some((flow) => flow.id === nextSelectedFlowId)
        ? nextSelectedFlowId
        : data.store.flows[0]?.id ?? "";
      setSelectedFlowId(candidate);
      setFormMessage("API flow data loaded");
    } catch (err) {
      setError(readableFlowError(err));
    } finally {
      setLoading(false);
    }
  }

  function flowPayload(status: Flow["status"] = "draft") {
    const platforms = form.platform === "all" ? allFlowPlatforms : [form.platform as Platform];
    const roomIds = form.roomId === "all" ? [] : [form.roomId];
    const idBase = form.name.toLowerCase().replace(/[^a-z0-9ก-๙]+/gi, "-").replace(/^-|-$/g, "") || "api-flow";
    return {
      name: form.name.trim() || "Draft automation",
      description: form.description.trim(),
      status,
      triggerType: form.triggerType,
      trigger: {
        id: `trigger-${idBase}`,
        type: form.triggerType,
        keyword: form.keyword,
        intent: form.intent as AIIntent,
        tag: form.tag,
        status: form.status as ConversationStatus,
        matchMode: form.triggerType === "keyword" ? "contains" as const : "exact" as const,
        caseSensitive: false
      },
      platformScope: platforms,
      roomIds,
      nodes: [
        { id: `node-${idBase}-trigger`, type: "trigger" as const, label: `Trigger: ${form.triggerType}`, config: {}, position: { x: 80, y: 80 } },
        { id: `node-${idBase}-message`, type: "send_message" as const, label: "Dry-run outbound placeholder", config: { message: "Dry-run only; no message is sent." }, position: { x: 300, y: 80 } },
        { id: `node-${idBase}-tag`, type: "add_tag" as const, label: "Simulate tag", config: { tag: form.tag || "automation" }, position: { x: 520, y: 80 } },
        { id: `node-${idBase}-end`, type: "end" as const, label: "End flow", config: {}, position: { x: 740, y: 80 } }
      ],
      edges: []
    };
  }

  async function createDraftFlow() {
    setSaving(true);
    setError(null);
    try {
      const saved = await createApiFlow(flowPayload("draft"));
      setFormMessage("Flow created in API");
      await refreshData(saved.id);
    } catch (err) {
      setError(readableFlowError(err));
    } finally {
      setSaving(false);
    }
  }

  async function saveSelectedFlow() {
    if (!selectedFlow) return;
    setSaving(true);
    setError(null);
    try {
      const saved = await updateApiFlow(selectedFlow.id, flowPayload(selectedFlow.status));
      setFormMessage("Flow updated in API");
      await refreshData(saved.id);
    } catch (err) {
      setError(readableFlowError(err));
    } finally {
      setSaving(false);
    }
  }

  async function setStatus(flowId: string, status: Flow["status"]) {
    setSaving(true);
    setError(null);
    try {
      const saved = await updateApiFlowStatus(flowId, { status });
      setFormMessage(`Flow status set to ${status}`);
      await refreshData(saved.id);
    } catch (err) {
      setError(readableFlowError(err));
    } finally {
      setSaving(false);
    }
  }

  async function duplicateFlowById(flowId: string) {
    setSaving(true);
    setError(null);
    try {
      const saved = await duplicateApiFlow(flowId);
      setFormMessage("Flow duplicated in API");
      await refreshData(saved.id);
    } catch (err) {
      setError(readableFlowError(err));
    } finally {
      setSaving(false);
    }
  }

  async function archiveFlowById(flowId: string) {
    setSaving(true);
    setError(null);
    try {
      const saved = await deleteApiFlow(flowId);
      setFormMessage("Flow archived through API delete endpoint");
      await refreshData(saved.id);
    } catch (err) {
      setError(readableFlowError(err));
    } finally {
      setSaving(false);
    }
  }

  async function runTest(flow: Flow) {
    setSaving(true);
    setError(null);
    try {
      const result = await testRunApiFlow(flow.id, {
        conversationId: testInput.conversationId || null,
        contactId: null,
        message: testInput.message,
        platform: testInput.platform,
        roomId: testInput.roomId,
        triggerType: flow.trigger.type,
        intent: flow.trigger.intent,
        tag: flow.trigger.tag,
        status: flow.trigger.status,
        isFirstMessage: flow.trigger.type === "first_message" ? true : undefined,
        businessHours: true
      });
      setLastResult(result);
      setFormMessage("Dry-run recorded by API");
      await refreshData(flow.id);
    } catch (err) {
      setError(readableFlowError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="flowsShell">
      <section className="flowsPage">
        <header className="flowsHeader">
          <div>
            <p className="eyebrow">Flow Builder</p>
            <h1>Persisted automation rules from backend API</h1>
            <p>API mode reads and writes tenant-scoped flows. Test runs are dry-run only and never call OpenAI or external platforms.</p>
          </div>
          <div className="flowMetricStrip">
            <MiniStat label="Automation runs" value={automationMetrics.runs} />
            <MiniStat label="Dry-run success" value={`${automationMetrics.successRate}%`} />
            <MiniStat label="Failed" value={automationMetrics.failed} />
          </div>
        </header>

        <section className="warningBand">
          <strong>{dataMode.toUpperCase()} mode</strong>
          <span>No mock fallback when API requests fail</span>
          <span>Dry-run only; outbound actions are skipped_mock</span>
        </section>

        {error && <section className="errorBand" role="alert"><strong>API error</strong><span>{error}</span></section>}
        {loading && <section className="loadingBand"><RefreshCw size={16} /> Loading Flow Builder API data...</section>}

        <section className="flowCreatePanel">
          <div className="blockHeader"><Plus size={18} /><h2>Create / Edit Flow</h2></div>
          <div className="flowFormGrid">
            <label>Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Draft automation" /></label>
            <label>Description<input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="What this automation does" /></label>
            <label>Trigger<select value={form.triggerType} onChange={(event) => setForm({ ...form, triggerType: event.target.value as FlowTriggerType })}>{triggerTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
            <label>Keyword<input value={form.keyword} onChange={(event) => setForm({ ...form, keyword: event.target.value })} /></label>
            <label>Intent<input value={form.intent} onChange={(event) => setForm({ ...form, intent: event.target.value })} /></label>
            <label>Tag<input value={form.tag} onChange={(event) => setForm({ ...form, tag: event.target.value })} /></label>
            <label>Status trigger<input value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} /></label>
            <label>Platform<select value={form.platform} onChange={(event) => setForm({ ...form, platform: event.target.value, roomId: "all" })}><option value="all">All platforms</option>{allFlowPlatforms.map((platform) => <option key={platform} value={platform}>{platform}</option>)}</select></label>
            <label>Room<input value={form.roomId} onChange={(event) => setForm({ ...form, roomId: event.target.value || "all" })} /></label>
            <button type="button" onClick={createDraftFlow} disabled={saving}><Plus size={15} /> Create draft</button>
            <button type="button" onClick={saveSelectedFlow} disabled={saving || !selectedFlow}><Save size={15} /> Save selected</button>
          </div>
          <p className="formStatus">{formMessage}</p>
        </section>

        <section className="flowWorkspace">
          <div className="flowListPanel">
            <div className="blockHeader"><Workflow size={18} /><h2>Flow list</h2></div>
            <div className="flowList">
              {!loading && flowStore.flows.length === 0 && <p>No flows returned by the API.</p>}
              {flowStore.flows.map((flow) => {
                const stats = getFlowStats(flowStore, flow.id);
                return (
                  <article key={flow.id} className={flow.id === selectedFlow?.id ? "flowListItem selected" : "flowListItem"}>
                    <button type="button" onClick={() => setSelectedFlowId(flow.id)}>
                      <strong>{flow.name}</strong>
                      <span>{flow.status} / {flow.triggerType}</span>
                      <small>{flow.platformScope.join(", ")} / {flow.roomIds.length > 0 ? flow.roomIds.join(", ") : "all rooms"}</small>
                      <small>Updated {new Date(flow.updatedAt).toLocaleString("th-TH")} / runs {stats.runCount} / success {stats.successRate}%</small>
                    </button>
                    <div className="flowButtonRow">
                      <button type="button" onClick={() => setSelectedFlowId(flow.id)} disabled={saving}><Edit3 size={13} /> Edit</button>
                      <button type="button" onClick={() => duplicateFlowById(flow.id)} disabled={saving}><Copy size={13} /> Duplicate</button>
                      <button type="button" onClick={() => setStatus(flow.id, "active")} disabled={saving}><Play size={13} /> Activate</button>
                      <button type="button" onClick={() => setStatus(flow.id, "paused")} disabled={saving}><Pause size={13} /> Pause</button>
                      <button type="button" onClick={() => archiveFlowById(flow.id)} disabled={saving}><Trash2 size={13} /> Delete</button>
                      <button type="button" onClick={() => runTest(flow)} disabled={saving}><RotateCcw size={13} /> Test</button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {selectedFlow && (
            <div className="flowEditorPanel">
              <section className="flowEditorSection">
                <div className="blockHeader"><Edit3 size={18} /><h2>{selectedFlow.name}</h2></div>
                <p>{selectedFlow.description}</p>
                <div className="flowScopeRow">
                  <span className={`statusPill ${selectedFlow.status}`}>{selectedFlow.status}</span>
                  <span>{selectedFlow.platformScope.join(", ")}</span>
                  <span>{selectedFlow.roomIds.length > 0 ? selectedFlow.roomIds.join(", ") : "all rooms"}</span>
                </div>
              </section>

              <section className="flowEditorGrid">
                <FlowSection title="Trigger" nodes={selectedFlow.nodes.filter((node) => node.type === "trigger")} />
                <FlowSection title="Conditions" nodes={selectedFlow.nodes.filter((node) => node.type === "condition")} />
                <FlowSection title="Actions" nodes={selectedFlow.nodes.filter((node) => !["trigger", "condition"].includes(node.type))} />
              </section>

              <section className="flowEditorSection">
                <div className="blockHeader"><Send size={18} /><h2>Dry-run Test Panel</h2></div>
                <div className="flowFormGrid testGrid">
                  <label>Conversation ID<input value={testInput.conversationId} onChange={(event) => setTestInput({ ...testInput, conversationId: event.target.value })} /></label>
                  <label>Customer message<input value={testInput.message} onChange={(event) => setTestInput({ ...testInput, message: event.target.value })} /></label>
                  <label>Platform<select value={testInput.platform} onChange={(event) => setTestInput({ ...testInput, platform: event.target.value as Platform })}>{allFlowPlatforms.map((platform) => <option key={platform} value={platform}>{platform}</option>)}</select></label>
                  <label>Room ID<input value={testInput.roomId} onChange={(event) => setTestInput({ ...testInput, roomId: event.target.value })} /></label>
                  <button type="button" onClick={() => runTest(selectedFlow)} disabled={saving}><RotateCcw size={15} /> Run dry-run</button>
                </div>

                {lastResult && lastResult.flowRun.flowId === selectedFlow.id && (
                  <div className="flowRunResult">
                    <div className="flowResultSummary">
                      <MiniStat label="Trigger matched" value={lastResult.triggerMatched ? "yes" : "no"} />
                      <MiniStat label="Run status" value={lastResult.flowRun.status} />
                      <MiniStat label="Steps" value={lastResult.flowRun.steps.length} />
                      <MiniStat label="External calls" value={lastResult.state.externalCalls.length} />
                    </div>
                    <div className="flowResultColumns">
                      <div>
                        <strong>Step-by-step dry-run</strong>
                        {lastResult.flowRun.steps.map((step) => (
                          <p key={step.id}>{step.nodeType} / {step.status} / {step.error ?? JSON.stringify(step.output ?? {})}</p>
                        ))}
                      </div>
                      <div>
                        <strong>Action results</strong>
                        {lastResult.state.actionResults.map((result, index) => (
                          <p key={`${result.actionType}-${index}`}>{result.actionType} / {result.status} / {result.message}</p>
                        ))}
                      </div>
                      <div>
                        <strong>Skipped external actions</strong>
                        {(lastResult.state.skippedExternalActions.length > 0 ? lastResult.state.skippedExternalActions : ["none"]).map((item) => <p key={item}>{item}</p>)}
                      </div>
                    </div>
                  </div>
                )}
              </section>

              <section className="flowEditorSection">
                <div className="blockHeader"><CheckCircle2 size={18} /><h2>Recent runs</h2></div>
                <div className="analyticsTableWrap">
                  <table className="analyticsTable">
                    <thead><tr><th>Status</th><th>Conversation</th><th>Started</th><th>Summary</th><th>Steps</th><th>Failed step</th></tr></thead>
                    <tbody>
                      {selectedRuns.map((run) => {
                        const failedStep = run.steps.find((step) => step.status === "failed");
                        return (
                          <tr key={run.id}>
                            <td>{run.status}</td>
                            <td>{run.conversationId ?? "-"}</td>
                            <td>{new Date(run.startedAt).toLocaleString("th-TH")}</td>
                            <td>{run.resultSummary}</td>
                            <td>{run.steps.length}</td>
                            <td>{failedStep?.nodeId ?? "-"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function FlowSection({ title, nodes }: { title: string; nodes: Flow["nodes"] }) {
  return (
    <section className="flowMiniPanel">
      <h3>{title}</h3>
      {nodes.length === 0 ? <p>No nodes</p> : nodes.map((node) => (
        <article key={node.id} className="flowNodeCard">
          <strong>{node.label}</strong>
          <span>{node.type}</span>
          <small>{Object.entries(node.config).map(([key, value]) => `${key}: ${String(value)}`).join(" / ") || "default config"}</small>
        </article>
      ))}
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

function readableFlowError(error: unknown) {
  return error instanceof Error ? error.message : "Unknown Flow Builder API error";
}
