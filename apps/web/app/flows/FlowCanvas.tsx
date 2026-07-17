"use client";

import {
  CircleDot,
  Clipboard,
  Clock3,
  Flag,
  GitBranch,
  MessageSquareText,
  Play,
  Plus,
  Radio,
  Redo2,
  Save,
  Sparkles,
  Square,
  StickyNote,
  Tag,
  Trash2,
  Undo2,
  UserCog,
  UserPlus,
  Users,
  Wand2,
  X,
  ZapIcon,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import type { ComponentType, CSSProperties, DragEvent as ReactDragEvent, PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Flow, FlowEdge, FlowNode, FlowNodeType } from "@ai-omni/shared";

const NODE_WIDTH = 196;
const NODE_HEIGHT = 74;

type IconType = ComponentType<{ size?: number | string }>;

interface NodeMeta {
  type: FlowNodeType;
  label: string;
  icon: IconType;
  accent: string;
  group: "Trigger" | "Message" | "Logic" | "Action" | "Flow";
  defaultConfig?: Record<string, unknown>;
}

const NODE_META: NodeMeta[] = [
  { type: "trigger", label: "Trigger", icon: ZapIcon, accent: "#f59e0b", group: "Trigger", defaultConfig: {} },
  { type: "send_message", label: "Message", icon: MessageSquareText, accent: "#2563eb", group: "Message", defaultConfig: { message: "Hello 👋" } },
  { type: "ai_reply", label: "AI reply", icon: Sparkles, accent: "#7c3aed", group: "Message", defaultConfig: { prompt: "Answer the customer politely." } },
  { type: "note", label: "Note", icon: StickyNote, accent: "#64748b", group: "Message", defaultConfig: { message: "Internal note" } },
  { type: "condition", label: "Condition", icon: GitBranch, accent: "#0d9488", group: "Logic", defaultConfig: { expression: "message contains 'ราคา'" } },
  { type: "delay", label: "Delay", icon: Clock3, accent: "#0891b2", group: "Logic", defaultConfig: { seconds: 30 } },
  { type: "add_tag", label: "Add tag", icon: Tag, accent: "#16a34a", group: "Action", defaultConfig: { tag: "hot lead" } },
  { type: "remove_tag", label: "Remove tag", icon: Tag, accent: "#dc2626", group: "Action", defaultConfig: { tag: "cold" } },
  { type: "set_priority", label: "Set priority", icon: Flag, accent: "#ea580c", group: "Action", defaultConfig: { priority: "high" } },
  { type: "set_status", label: "Set status", icon: CircleDot, accent: "#0284c7", group: "Action", defaultConfig: { status: "follow_up" } },
  { type: "assign_agent", label: "Assign agent", icon: UserPlus, accent: "#4f46e5", group: "Action", defaultConfig: { agentName: "Agent" } },
  { type: "human_handoff", label: "Human handoff", icon: UserCog, accent: "#9333ea", group: "Action", defaultConfig: {} },
  { type: "create_task", label: "Create task", icon: Clipboard, accent: "#0f766e", group: "Action", defaultConfig: { title: "Follow up" } },
  { type: "add_to_broadcast_segment", label: "Add to segment", icon: Users, accent: "#db2777", group: "Action", defaultConfig: { segment: "leads" } },
  { type: "trigger_broadcast_mock", label: "Trigger broadcast", icon: Radio, accent: "#e11d48", group: "Action", defaultConfig: { campaign: "promo" } },
  { type: "end", label: "End", icon: Square, accent: "#334155", group: "Flow", defaultConfig: {} }
];

const NODE_META_BY_TYPE = new Map<FlowNodeType, NodeMeta>(NODE_META.map((meta) => [meta.type, meta]));

const PALETTE_GROUPS: NodeMeta["group"][] = ["Trigger", "Message", "Logic", "Action", "Flow"];

const DRAG_MIME = "application/x-flow-node-type";

interface Snapshot {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

interface FlowCanvasProps {
  flow: Flow;
  saving?: boolean;
  onSave: (snapshot: Snapshot) => void | Promise<void>;
  onSaveAndClose?: (snapshot: Snapshot) => void | Promise<void>;
  onTest?: () => void;
  onClose?: () => void;
}

function metaFor(type: FlowNodeType): NodeMeta {
  return NODE_META_BY_TYPE.get(type) ?? { type, label: type, icon: Square, accent: "#334155", group: "Flow" };
}

function makeNodeId(type: FlowNodeType) {
  return `node-${type}-${Math.random().toString(36).slice(2, 8)}`;
}

function makeEdgeId() {
  return `edge-${Math.random().toString(36).slice(2, 8)}`;
}

export default function FlowCanvas({ flow, saving = false, onSave, onSaveAndClose, onTest, onClose }: FlowCanvasProps) {
  const [present, setPresent] = useState<Snapshot>({ nodes: flow.nodes, edges: flow.edges });
  const [past, setPast] = useState<Snapshot[]>([]);
  const [future, setFuture] = useState<Snapshot[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string>(flow.nodes[0]?.id ?? "");
  const [zoom, setZoom] = useState(1);
  const [dirty, setDirty] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [genLanguage, setGenLanguage] = useState<"th" | "en">("th");
  const [genFunnel, setGenFunnel] = useState<FunnelKind>("lead_capture");
  const [connecting, setConnecting] = useState<{ sourceId: string; x: number; y: number } | null>(null);

  const canvasRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ nodeId: string; startX: number; startY: number; originX: number; originY: number } | null>(null);

  useEffect(() => {
    setPresent({ nodes: flow.nodes, edges: flow.edges });
    setPast([]);
    setFuture([]);
    setSelectedNodeId(flow.nodes[0]?.id ?? "");
    setDirty(false);
  }, [flow.id]);

  const commit = useCallback((next: Snapshot) => {
    setPast((prev) => [...prev.slice(-49), present]);
    setPresent(next);
    setFuture([]);
    setDirty(true);
  }, [present]);

  const undo = useCallback(() => {
    setPast((prev) => {
      if (prev.length === 0) return prev;
      const previous = prev[prev.length - 1];
      setFuture((f) => [present, ...f]);
      setPresent(previous);
      setDirty(true);
      return prev.slice(0, -1);
    });
  }, [present]);

  const redo = useCallback(() => {
    setFuture((prev) => {
      if (prev.length === 0) return prev;
      const next = prev[0];
      setPast((p) => [...p, present]);
      setPresent(next);
      setDirty(true);
      return prev.slice(1);
    });
  }, [present]);

  const selectedNode = present.nodes.find((node) => node.id === selectedNodeId) ?? null;

  const toFlowCoords = useCallback((clientX: number, clientY: number) => {
    const el = canvasRef.current;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    const x = (clientX - rect.left + el.scrollLeft) / zoom;
    const y = (clientY - rect.top + el.scrollTop) / zoom;
    return { x, y };
  }, [zoom]);

  function handleDrop(event: ReactDragEvent<HTMLDivElement>) {
    event.preventDefault();
    const type = event.dataTransfer.getData(DRAG_MIME) as FlowNodeType;
    if (!type) return;
    const meta = metaFor(type);
    const point = toFlowCoords(event.clientX, event.clientY);
    const node: FlowNode = {
      id: makeNodeId(type),
      type,
      label: meta.label,
      config: { ...(meta.defaultConfig ?? {}) },
      position: { x: Math.max(0, Math.round(point.x - NODE_WIDTH / 2)), y: Math.max(0, Math.round(point.y - NODE_HEIGHT / 2)) }
    };
    commit({ nodes: [...present.nodes, node], edges: present.edges });
    setSelectedNodeId(node.id);
  }

  function beginNodeDrag(event: ReactPointerEvent<HTMLDivElement>, node: FlowNode) {
    if (event.button !== 0) return;
    event.stopPropagation();
    setSelectedNodeId(node.id);
    setPast((prev) => [...prev.slice(-49), present]);
    setFuture([]);
    dragRef.current = { nodeId: node.id, startX: event.clientX, startY: event.clientY, originX: node.position.x, originY: node.position.y };
    (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
  }

  const handlePointerMove = useCallback((event: PointerEvent) => {
    const drag = dragRef.current;
    if (drag) {
      const dx = (event.clientX - drag.startX) / zoom;
      const dy = (event.clientY - drag.startY) / zoom;
      setPresent((prev) => ({
        ...prev,
        nodes: prev.nodes.map((node) => node.id === drag.nodeId
          ? { ...node, position: { x: Math.max(0, Math.round(drag.originX + dx)), y: Math.max(0, Math.round(drag.originY + dy)) } }
          : node)
      }));
      setDirty(true);
      return;
    }
    if (connecting) {
      const point = toFlowCoords(event.clientX, event.clientY);
      setConnecting((prev) => prev ? { ...prev, x: point.x, y: point.y } : prev);
    }
  }, [zoom, connecting, toFlowCoords]);

  const handlePointerUp = useCallback((event: PointerEvent) => {
    if (dragRef.current) {
      dragRef.current = null;
      return;
    }
    if (connecting) {
      const target = document.elementFromPoint(event.clientX, event.clientY)?.closest("[data-node-id]") as HTMLElement | null;
      const targetId = target?.getAttribute("data-node-id") ?? "";
      setConnecting(null);
      if (targetId && targetId !== connecting.sourceId) {
        const exists = present.edges.some((edge) => edge.sourceNodeId === connecting.sourceId && edge.targetNodeId === targetId);
        if (!exists) {
          const edge: FlowEdge = { id: makeEdgeId(), sourceNodeId: connecting.sourceId, targetNodeId: targetId };
          commit({ nodes: present.nodes, edges: [...present.edges, edge] });
        }
      }
    }
  }, [connecting, present, commit]);

  useEffect(() => {
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  function beginConnect(event: ReactPointerEvent<HTMLButtonElement>, node: FlowNode) {
    event.stopPropagation();
    event.preventDefault();
    const start = toFlowCoords(event.clientX, event.clientY);
    setConnecting({ sourceId: node.id, x: start.x, y: start.y });
  }

  function updateNode(nodeId: string, patch: Partial<FlowNode>) {
    commit({
      nodes: present.nodes.map((node) => node.id === nodeId ? { ...node, ...patch } : node),
      edges: present.edges
    });
  }

  function updateNodeConfig(nodeId: string, key: string, value: unknown) {
    commit({
      nodes: present.nodes.map((node) => node.id === nodeId ? { ...node, config: { ...node.config, [key]: value } } : node),
      edges: present.edges
    });
  }

  function deleteNode(nodeId: string) {
    commit({
      nodes: present.nodes.filter((node) => node.id !== nodeId),
      edges: present.edges.filter((edge) => edge.sourceNodeId !== nodeId && edge.targetNodeId !== nodeId)
    });
    if (selectedNodeId === nodeId) setSelectedNodeId("");
  }

  function deleteEdge(edgeId: string) {
    commit({ nodes: present.nodes, edges: present.edges.filter((edge) => edge.id !== edgeId) });
  }

  function applyGenerate() {
    const generated = generateFunnel(genFunnel, genLanguage);
    commit(generated);
    setSelectedNodeId(generated.nodes[0]?.id ?? "");
    setGenerateOpen(false);
  }

  const snapshotForSave = useMemo<Snapshot>(() => ({
    nodes: present.nodes.length > 0 ? present.nodes : flow.nodes,
    edges: present.edges
  }), [present, flow.nodes]);

  async function handleSave() {
    await onSave(snapshotForSave);
    setDirty(false);
  }

  async function handleSaveAndClose() {
    if (onSaveAndClose) {
      await onSaveAndClose(snapshotForSave);
    } else {
      await onSave(snapshotForSave);
      onClose?.();
    }
    setDirty(false);
  }

  const canvasSize = useMemo(() => {
    const maxX = present.nodes.reduce((max, node) => Math.max(max, node.position.x + NODE_WIDTH), 960);
    const maxY = present.nodes.reduce((max, node) => Math.max(max, node.position.y + NODE_HEIGHT), 640);
    return { width: maxX + 240, height: maxY + 200 };
  }, [present.nodes]);

  const nodePos = useMemo(() => new Map(present.nodes.map((node) => [node.id, node.position])), [present.nodes]);

  return (
    <div className="flowCanvasRoot">
      <div className="flowCanvasToolbar">
        <div className="flowCanvasToolbarGroup">
          <span className="flowCanvasTitle">{flow.name}</span>
          {dirty && <span className="flowCanvasDirty">Unsaved</span>}
        </div>
        <div className="flowCanvasToolbarGroup">
          <button type="button" className="flowCanvasBtn" onClick={() => setGenerateOpen(true)}><Wand2 size={15} /> Generate workflow</button>
          <button type="button" className="flowCanvasBtn" onClick={onTest} disabled={!onTest || saving}><Play size={15} /> Test chatbot</button>
          <span className="flowCanvasDivider" />
          <button type="button" className="flowCanvasIconBtn" onClick={undo} disabled={past.length === 0} aria-label="Undo" title="Undo"><Undo2 size={16} /></button>
          <button type="button" className="flowCanvasIconBtn" onClick={redo} disabled={future.length === 0} aria-label="Redo" title="Redo"><Redo2 size={16} /></button>
          <span className="flowCanvasDivider" />
          <button type="button" className="flowCanvasIconBtn" onClick={() => setZoom((z) => Math.max(0.5, Math.round((z - 0.1) * 10) / 10))} aria-label="Zoom out" title="Zoom out"><ZoomOut size={16} /></button>
          <span className="flowCanvasZoom">{Math.round(zoom * 100)}%</span>
          <button type="button" className="flowCanvasIconBtn" onClick={() => setZoom((z) => Math.min(1.5, Math.round((z + 0.1) * 10) / 10))} aria-label="Zoom in" title="Zoom in"><ZoomIn size={16} /></button>
          <span className="flowCanvasDivider" />
          <button type="button" className="flowCanvasBtn" onClick={handleSave} disabled={saving}><Save size={15} /> Save</button>
          <button type="button" className="flowCanvasBtn primary" onClick={handleSaveAndClose} disabled={saving}><Save size={15} /> Save &amp; close</button>
        </div>
      </div>

      <div className="flowCanvasBody">
        <aside className="flowPalette" aria-label="Node palette">
          <p className="flowPaletteHint">Drag a block onto the canvas</p>
          {PALETTE_GROUPS.map((group) => (
            <section className="flowPaletteGroup" key={group}>
              <h4>{group}</h4>
              {NODE_META.filter((meta) => meta.group === group).map((meta) => {
                const Icon = meta.icon;
                return (
                  <div
                    key={meta.type}
                    className="flowPaletteItem"
                    draggable
                    onDragStart={(event) => event.dataTransfer.setData(DRAG_MIME, meta.type)}
                    style={{ "--node-accent": meta.accent } as CSSProperties}
                    title={`Drag ${meta.label}`}
                  >
                    <span className="flowPaletteIcon"><Icon size={15} /></span>
                    <span>{meta.label}</span>
                    <Plus size={13} className="flowPalettePlus" />
                  </div>
                );
              })}
            </section>
          ))}
        </aside>

        <div
          className="flowCanvasScroll"
          ref={canvasRef}
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
          onClick={() => setSelectedNodeId("")}
        >
          <div
            className="flowCanvasLayer"
            style={{ width: canvasSize.width, height: canvasSize.height, transform: `scale(${zoom})` }}
          >
            <svg className="flowCanvasEdges" width={canvasSize.width} height={canvasSize.height}>
              <defs>
                <marker id="flowArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
                </marker>
              </defs>
              {present.edges.map((edge) => {
                const source = nodePos.get(edge.sourceNodeId);
                const target = nodePos.get(edge.targetNodeId);
                if (!source || !target) return null;
                const x1 = source.x + NODE_WIDTH;
                const y1 = source.y + NODE_HEIGHT / 2;
                const x2 = target.x;
                const y2 = target.y + NODE_HEIGHT / 2;
                const dx = Math.max(40, Math.abs(x2 - x1) / 2);
                return (
                  <g key={edge.id} className="flowEdgeGroup">
                    <path
                      d={`M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`}
                      className="flowEdgePath"
                      markerEnd="url(#flowArrow)"
                    />
                    <path
                      d={`M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`}
                      className="flowEdgeHit"
                      onClick={(event) => { event.stopPropagation(); deleteEdge(edge.id); }}
                    >
                      <title>Click to remove connection</title>
                    </path>
                  </g>
                );
              })}
              {connecting && (() => {
                const source = nodePos.get(connecting.sourceId);
                if (!source) return null;
                const x1 = source.x + NODE_WIDTH;
                const y1 = source.y + NODE_HEIGHT / 2;
                return <path d={`M ${x1} ${y1} L ${connecting.x} ${connecting.y}`} className="flowEdgeTemp" />;
              })()}
            </svg>

            {present.nodes.map((node) => {
              const meta = metaFor(node.type);
              const Icon = meta.icon;
              return (
                <div
                  key={node.id}
                  data-node-id={node.id}
                  className={node.id === selectedNodeId ? "flowNode selected" : "flowNode"}
                  style={{ left: node.position.x, top: node.position.y, width: NODE_WIDTH, "--node-accent": meta.accent } as CSSProperties}
                  onClick={(event) => { event.stopPropagation(); setSelectedNodeId(node.id); }}
                >
                  <div className="flowNodeHeader" onPointerDown={(event) => beginNodeDrag(event, node)}>
                    <span className="flowNodeIcon"><Icon size={14} /></span>
                    <strong>{node.label}</strong>
                  </div>
                  <p className="flowNodeType">{node.type}</p>
                  <p className="flowNodeSummary">{summariseConfig(node)}</p>
                  <button
                    type="button"
                    className="flowNodeHandle"
                    aria-label="Drag to connect"
                    title="Drag to another block to connect"
                    onPointerDown={(event) => beginConnect(event, node)}
                  />
                </div>
              );
            })}

            {present.nodes.length === 0 && (
              <div className="flowCanvasEmpty">
                <Wand2 size={22} />
                <p>Drag blocks from the palette or click <strong>Generate workflow</strong> to start.</p>
              </div>
            )}
          </div>
        </div>

        <aside className="flowConfigPanel" aria-label="Node configuration">
          {selectedNode ? (
            <FlowNodeConfig
              node={selectedNode}
              onLabelChange={(label) => updateNode(selectedNode.id, { label: label || metaFor(selectedNode.type).label })}
              onConfigChange={(key, value) => updateNodeConfig(selectedNode.id, key, value)}
              onDelete={() => deleteNode(selectedNode.id)}
            />
          ) : (
            <div className="flowConfigEmpty">
              <p>Select a block to edit its settings.</p>
              <p className="flowConfigMeta">{present.nodes.length} blocks / {present.edges.length} connections</p>
            </div>
          )}
        </aside>
      </div>

      {generateOpen && (
        <div className="flowDialogBackdrop" onClick={() => setGenerateOpen(false)}>
          <div className="flowDialog" onClick={(event) => event.stopPropagation()}>
            <div className="flowDialogHeader">
              <h3><Wand2 size={16} /> Generate workflow</h3>
              <button type="button" className="flowCanvasIconBtn" onClick={() => setGenerateOpen(false)} aria-label="Close"><X size={16} /></button>
            </div>
            <label className="flowDialogField">
              Language
              <select value={genLanguage} onChange={(event) => setGenLanguage(event.target.value as "th" | "en")}>
                <option value="th">ไทย (Thai)</option>
                <option value="en">English</option>
              </select>
            </label>
            <label className="flowDialogField">
              Funnel type
              <select value={genFunnel} onChange={(event) => setGenFunnel(event.target.value as FunnelKind)}>
                <option value="lead_capture">Lead capture</option>
                <option value="sales">Sales / pricing</option>
                <option value="support">Support triage</option>
                <option value="booking">Booking / appointment</option>
              </select>
            </label>
            <p className="flowDialogNote">This replaces the current canvas with a template. It is a local mock and does not call any API.</p>
            <div className="flowDialogActions">
              <button type="button" className="flowCanvasBtn" onClick={() => setGenerateOpen(false)}>Cancel</button>
              <button type="button" className="flowCanvasBtn primary" onClick={applyGenerate}><Wand2 size={15} /> Generate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function summariseConfig(node: FlowNode): string {
  const entries = Object.entries(node.config ?? {});
  if (entries.length === 0) return "No settings";
  return entries.map(([key, value]) => `${key}: ${String(value)}`).join(" · ");
}

interface FlowNodeConfigProps {
  node: FlowNode;
  onLabelChange: (label: string) => void;
  onConfigChange: (key: string, value: unknown) => void;
  onDelete: () => void;
}

function FlowNodeConfig({ node, onLabelChange, onConfigChange, onDelete }: FlowNodeConfigProps) {
  const meta = metaFor(node.type);
  const Icon = meta.icon;
  return (
    <div className="flowConfigInner">
      <div className="flowConfigHead" style={{ "--node-accent": meta.accent } as CSSProperties}>
        <span className="flowNodeIcon"><Icon size={15} /></span>
        <div>
          <strong>{meta.label}</strong>
          <small>{node.type}</small>
        </div>
      </div>

      <label className="flowConfigField">
        Label
        <input value={node.label} onChange={(event) => onLabelChange(event.target.value)} />
      </label>

      {renderConfigFields(node, onConfigChange)}

      <button type="button" className="flowConfigDelete" onClick={onDelete}><Trash2 size={14} /> Delete block</button>
    </div>
  );
}

function renderConfigFields(node: FlowNode, onChange: (key: string, value: unknown) => void) {
  const cfg = node.config ?? {};
  const text = (key: string) => String(cfg[key] ?? "");
  switch (node.type) {
    case "send_message":
    case "note":
      return (
        <label className="flowConfigField">
          Message
          <textarea value={text("message")} rows={4} onChange={(event) => onChange("message", event.target.value)} />
        </label>
      );
    case "ai_reply":
      return (
        <label className="flowConfigField">
          AI prompt
          <textarea value={text("prompt")} rows={4} onChange={(event) => onChange("prompt", event.target.value)} />
        </label>
      );
    case "condition":
      return (
        <label className="flowConfigField">
          Condition expression
          <input value={text("expression")} onChange={(event) => onChange("expression", event.target.value)} />
        </label>
      );
    case "delay":
      return (
        <label className="flowConfigField">
          Delay (seconds)
          <input type="number" min={0} value={text("seconds")} onChange={(event) => onChange("seconds", Number(event.target.value) || 0)} />
        </label>
      );
    case "add_tag":
    case "remove_tag":
      return (
        <label className="flowConfigField">
          Tag
          <input value={text("tag")} onChange={(event) => onChange("tag", event.target.value)} />
        </label>
      );
    case "set_priority":
      return (
        <label className="flowConfigField">
          Priority
          <select value={text("priority") || "normal"} onChange={(event) => onChange("priority", event.target.value)}>
            <option value="low">low</option>
            <option value="normal">normal</option>
            <option value="high">high</option>
            <option value="urgent">urgent</option>
          </select>
        </label>
      );
    case "set_status":
      return (
        <label className="flowConfigField">
          Status
          <input value={text("status")} onChange={(event) => onChange("status", event.target.value)} />
        </label>
      );
    case "assign_agent":
      return (
        <label className="flowConfigField">
          Agent name
          <input value={text("agentName")} onChange={(event) => onChange("agentName", event.target.value)} />
        </label>
      );
    case "create_task":
      return (
        <label className="flowConfigField">
          Task title
          <input value={text("title")} onChange={(event) => onChange("title", event.target.value)} />
        </label>
      );
    case "add_to_broadcast_segment":
      return (
        <label className="flowConfigField">
          Segment
          <input value={text("segment")} onChange={(event) => onChange("segment", event.target.value)} />
        </label>
      );
    case "trigger_broadcast_mock":
      return (
        <label className="flowConfigField">
          Campaign
          <input value={text("campaign")} onChange={(event) => onChange("campaign", event.target.value)} />
        </label>
      );
    default:
      return <p className="flowConfigMeta">No extra settings for this block.</p>;
  }
}

type FunnelKind = "lead_capture" | "sales" | "support" | "booking";

function generateFunnel(kind: FunnelKind, language: "th" | "en"): Snapshot {
  const th = language === "th";
  const chains: Record<FunnelKind, Array<{ type: FlowNodeType; label: string; config: Record<string, unknown> }>> = {
    lead_capture: [
      { type: "trigger", label: th ? "เริ่มแชท" : "First message", config: {} },
      { type: "send_message", label: th ? "ทักทาย" : "Greeting", config: { message: th ? "สวัสดีค่ะ 👋 สนใจสินค้าตัวไหนดีคะ" : "Hi 👋 what are you interested in?" } },
      { type: "ai_reply", label: th ? "ถามข้อมูลลูกค้า" : "Qualify lead", config: { prompt: th ? "สอบถามชื่อและความต้องการของลูกค้า" : "Ask for the customer's name and needs." } },
      { type: "add_tag", label: th ? "ติดแท็ก lead" : "Tag lead", config: { tag: "lead" } },
      { type: "create_task", label: th ? "สร้างงานติดตาม" : "Create follow-up", config: { title: th ? "ติดตามลูกค้าใหม่" : "Follow up new lead" } },
      { type: "end", label: th ? "จบ" : "End", config: {} }
    ],
    sales: [
      { type: "trigger", label: th ? "คีย์เวิร์ดราคา" : "Pricing keyword", config: {} },
      { type: "condition", label: th ? "ถามเรื่องราคา?" : "Asking price?", config: { expression: th ? "ข้อความมีคำว่า 'ราคา'" : "message contains 'price'" } },
      { type: "send_message", label: th ? "ส่งแพ็กเกจ" : "Send pricing", config: { message: th ? "แพ็กเกจเริ่มต้น 990 บาท/เดือนค่ะ" : "Plans start at $29/month." } },
      { type: "set_priority", label: th ? "ตั้ง priority" : "Set priority", config: { priority: "high" } },
      { type: "human_handoff", label: th ? "ส่งให้พนักงาน" : "Handoff to human", config: {} },
      { type: "end", label: th ? "จบ" : "End", config: {} }
    ],
    support: [
      { type: "trigger", label: th ? "เริ่มแชท" : "First message", config: {} },
      { type: "ai_reply", label: th ? "จัดหมวดปัญหา" : "Classify issue", config: { prompt: th ? "ระบุประเภทปัญหาของลูกค้า" : "Classify the support issue." } },
      { type: "condition", label: th ? "ปัญหาเร่งด่วน?" : "Urgent?", config: { expression: th ? "ความรุนแรง = สูง" : "severity = high" } },
      { type: "set_status", label: th ? "ตั้งสถานะ" : "Set status", config: { status: "follow_up" } },
      { type: "assign_agent", label: th ? "มอบหมายทีมซัพพอร์ต" : "Assign support", config: { agentName: th ? "ทีมซัพพอร์ต" : "Support team" } },
      { type: "end", label: th ? "จบ" : "End", config: {} }
    ],
    booking: [
      { type: "trigger", label: th ? "ขอนัดหมาย" : "Booking request", config: {} },
      { type: "send_message", label: th ? "ถามวันเวลา" : "Ask date/time", config: { message: th ? "สะดวกวันและเวลาไหนคะ" : "What date and time works for you?" } },
      { type: "delay", label: th ? "รอ 1 นาที" : "Wait 1 min", config: { seconds: 60 } },
      { type: "create_task", label: th ? "สร้างนัดหมาย" : "Create booking task", config: { title: th ? "ยืนยันการนัดหมาย" : "Confirm appointment" } },
      { type: "add_tag", label: th ? "ติดแท็ก booking" : "Tag booking", config: { tag: "booking" } },
      { type: "end", label: th ? "จบ" : "End", config: {} }
    ]
  };

  const chain = chains[kind];
  const startX = 80;
  const startY = 80;
  const stepX = 240;
  const perRow = 3;
  const nodes: FlowNode[] = chain.map((item, index) => {
    const row = Math.floor(index / perRow);
    const col = row % 2 === 0 ? index % perRow : perRow - 1 - (index % perRow);
    return {
      id: makeNodeId(item.type),
      type: item.type,
      label: item.label,
      config: item.config,
      position: { x: startX + col * stepX, y: startY + row * 170 }
    };
  });
  const edges: FlowEdge[] = nodes.slice(1).map((node, index) => ({
    id: makeEdgeId(),
    sourceNodeId: nodes[index].id,
    targetNodeId: node.id
  }));
  return { nodes, edges };
}
