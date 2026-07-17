"use client";

import {
  CircleDot,
  Clipboard,
  Clock3,
  Copy,
  CornerDownRight,
  Eye,
  FileText,
  Film,
  Flag,
  GitBranch,
  History,
  Image as ImageIcon,
  MapPin,
  MessageSquareText,
  MoreHorizontal,
  MousePointerClick,
  Pencil,
  Play,
  Plus,
  Radio,
  Redo2,
  Rocket,
  Save,
  Sparkles,
  Square,
  StickyNote,
  Tag,
  Trash2,
  Type as TypeIcon,
  Undo2,
  UserCog,
  UserPlus,
  Users,
  Video,
  Wand2,
  X,
  ZapIcon,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import type { ComponentType, CSSProperties, DragEvent as ReactDragEvent, MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RICH_MESSAGE_CONFIG_KEY, parseRichMessageConfig, summariseRichMessage } from "@ai-omni/shared";
import type { Flow, FlowEdge, FlowNode, FlowNodeType, Platform } from "@ai-omni/shared";
import { RichMessageEditor } from "./RichMessageEditor";

const NODE_WIDTH = 224;
const NODE_HEIGHT = 118;

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

// Node types offered from the "+" connector menu / bottom "add" button (curated shortlist).
const QUICK_ADD_TYPES: FlowNodeType[] = ["send_message", "ai_reply", "condition", "delay", "add_tag", "human_handoff", "end"];

const DRAG_MIME = "application/x-flow-node-type";

const MESSAGE_NODE_TYPES: ReadonlySet<FlowNodeType> = new Set(["send_message", "ai_reply", "note"]);

// ---- Additive rich-content model (stored in node.config.content[], does not touch @ai-omni/shared) ----
type ContentKind = "text" | "image" | "video" | "gif" | "file" | "location" | "button" | "quick_reply";

interface ContentItem {
  id: string;
  kind: ContentKind;
  value?: string;
  label?: string;
  url?: string;
}

interface ContentMenuMeta {
  kind: ContentKind;
  label: string;
  icon: IconType;
}

const CONTENT_MENU: ContentMenuMeta[] = [
  { kind: "text", label: "Text", icon: TypeIcon },
  { kind: "image", label: "Image", icon: ImageIcon },
  { kind: "video", label: "Video", icon: Video },
  { kind: "gif", label: "GIF", icon: Film },
  { kind: "file", label: "File", icon: FileText },
  { kind: "location", label: "Location", icon: MapPin },
  { kind: "button", label: "Add Button", icon: MousePointerClick },
  { kind: "quick_reply", label: "Quick reply", icon: CornerDownRight }
];

const CONTENT_META_BY_KIND = new Map<ContentKind, ContentMenuMeta>(CONTENT_MENU.map((item) => [item.kind, item]));

function defaultContent(kind: ContentKind): ContentItem {
  const id = `content-${Math.random().toString(36).slice(2, 8)}`;
  switch (kind) {
    case "text":
      return { id, kind, value: "" };
    case "image":
      return { id, kind, url: "" };
    case "video":
      return { id, kind, url: "" };
    case "gif":
      return { id, kind, url: "" };
    case "file":
      return { id, kind, label: "document.pdf", url: "" };
    case "location":
      return { id, kind, value: "13.7563,100.5018" };
    case "button":
      return { id, kind, label: "Button", value: "PAYLOAD" };
    case "quick_reply":
      return { id, kind, label: "Quick reply" };
    default:
      return { id, kind: "text", value: "" };
  }
}

function readContent(node: FlowNode): ContentItem[] {
  const raw = (node.config as Record<string, unknown> | undefined)?.content;
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is ContentItem => Boolean(item) && typeof item === "object" && typeof (item as ContentItem).kind === "string");
}

interface Snapshot {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

interface FlowVersion {
  id: string;
  at: string;
  label: string;
  snapshot: Snapshot;
}

const VERSIONS_KEY = "ai-omni-flow-versions-v1";

function loadVersions(flowId: string): FlowVersion[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(VERSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Record<string, FlowVersion[]>;
    return Array.isArray(parsed?.[flowId]) ? parsed[flowId] : [];
  } catch {
    return [];
  }
}

function persistVersions(flowId: string, versions: FlowVersion[]) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(VERSIONS_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, FlowVersion[]>) : {};
    parsed[flowId] = versions.slice(0, 20);
    window.localStorage.setItem(VERSIONS_KEY, JSON.stringify(parsed));
  } catch {
    /* ignore quota / serialization errors */
  }
}

interface FlowCanvasProps {
  flow: Flow;
  saving?: boolean;
  onSave: (snapshot: Snapshot) => void | Promise<void>;
  onSaveAndClose?: (snapshot: Snapshot) => void | Promise<void>;
  onTest?: () => void;
  onClose?: () => void;
  onPublish?: () => void | Promise<void>;
  onRenameFlow?: (name: string) => void | Promise<void>;
  onDuplicateFlow?: () => void | Promise<void>;
  onDeleteFlow?: () => void | Promise<void>;
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

type MenuState = { kind: "connect" | "add"; sourceId?: string; x: number; y: number } | null;
type ContentMenuState = { nodeId: string; x: number; y: number } | null;

export default function FlowCanvas({
  flow,
  saving = false,
  onSave,
  onSaveAndClose,
  onTest,
  onClose,
  onPublish,
  onRenameFlow,
  onDuplicateFlow,
  onDeleteFlow
}: FlowCanvasProps) {
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
  const [renamingNodeId, setRenamingNodeId] = useState<string>("");
  const [nodeMenu, setNodeMenu] = useState<MenuState>(null);
  const [contentMenu, setContentMenu] = useState<ContentMenuState>(null);
  const [flowMenuOpen, setFlowMenuOpen] = useState(false);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [versions, setVersions] = useState<FlowVersion[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [renameFlowValue, setRenameFlowValue] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ nodeId: string; startX: number; startY: number; originX: number; originY: number } | null>(null);

  useEffect(() => {
    setPresent({ nodes: flow.nodes, edges: flow.edges });
    setPast([]);
    setFuture([]);
    setSelectedNodeId(flow.nodes[0]?.id ?? "");
    setDirty(false);
    setVersions(loadVersions(flow.id));
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
    if (renamingNodeId === node.id) return;
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
      nodes: present.nodes.map((node) => {
        if (node.id !== nodeId) return node;
        const nextConfig = { ...node.config };
        if (value === undefined) {
          delete nextConfig[key];
        } else {
          nextConfig[key] = value;
        }
        return { ...node, config: nextConfig };
      }),
      edges: present.edges
    });
  }

  function setNodeContent(nodeId: string, content: ContentItem[]) {
    updateNodeConfig(nodeId, "content", content.length > 0 ? content : undefined);
  }

  function addContent(nodeId: string, kind: ContentKind) {
    const node = present.nodes.find((item) => item.id === nodeId);
    if (!node) return;
    setNodeContent(nodeId, [...readContent(node), defaultContent(kind)]);
    setContentMenu(null);
  }

  function updateContent(nodeId: string, contentId: string, patch: Partial<ContentItem>) {
    const node = present.nodes.find((item) => item.id === nodeId);
    if (!node) return;
    setNodeContent(nodeId, readContent(node).map((item) => item.id === contentId ? { ...item, ...patch } : item));
  }

  function removeContent(nodeId: string, contentId: string) {
    const node = present.nodes.find((item) => item.id === nodeId);
    if (!node) return;
    setNodeContent(nodeId, readContent(node).filter((item) => item.id !== contentId));
  }

  function deleteNode(nodeId: string) {
    commit({
      nodes: present.nodes.filter((node) => node.id !== nodeId),
      edges: present.edges.filter((edge) => edge.sourceNodeId !== nodeId && edge.targetNodeId !== nodeId)
    });
    if (selectedNodeId === nodeId) setSelectedNodeId("");
  }

  function duplicateNode(nodeId: string) {
    const node = present.nodes.find((item) => item.id === nodeId);
    if (!node) return;
    const clone: FlowNode = {
      ...node,
      id: makeNodeId(node.type),
      label: `${node.label} copy`,
      config: JSON.parse(JSON.stringify(node.config ?? {})),
      position: { x: node.position.x + 40, y: node.position.y + 40 }
    };
    commit({ nodes: [...present.nodes, clone], edges: present.edges });
    setSelectedNodeId(clone.id);
  }

  function deleteEdge(edgeId: string) {
    commit({ nodes: present.nodes, edges: present.edges.filter((edge) => edge.id !== edgeId) });
  }

  function createNodeOfType(type: FlowNodeType, position: { x: number; y: number }, connectFromId?: string) {
    const meta = metaFor(type);
    const node: FlowNode = {
      id: makeNodeId(type),
      type,
      label: meta.label,
      config: { ...(meta.defaultConfig ?? {}) },
      position: { x: Math.max(0, Math.round(position.x)), y: Math.max(0, Math.round(position.y)) }
    };
    const edges = connectFromId
      ? [...present.edges, { id: makeEdgeId(), sourceNodeId: connectFromId, targetNodeId: node.id } as FlowEdge]
      : present.edges;
    commit({ nodes: [...present.nodes, node], edges });
    setSelectedNodeId(node.id);
    setNodeMenu(null);
  }

  function handleQuickAdd(type: FlowNodeType) {
    if (nodeMenu?.kind === "connect" && nodeMenu.sourceId) {
      const source = present.nodes.find((item) => item.id === nodeMenu.sourceId);
      const base = source ? { x: source.position.x + NODE_WIDTH + 72, y: source.position.y } : { x: 120, y: 120 };
      createNodeOfType(type, base, nodeMenu.sourceId);
      return;
    }
    // "add" from bottom bar — drop near the current scroll centre.
    const el = canvasRef.current;
    const centre = el
      ? { x: (el.scrollLeft + el.clientWidth / 2) / zoom - NODE_WIDTH / 2, y: (el.scrollTop + el.clientHeight / 2) / zoom - NODE_HEIGHT / 2 }
      : { x: 160, y: 160 };
    createNodeOfType(type, centre);
  }

  function openConnectMenu(event: ReactMouseEvent<HTMLButtonElement>, node: FlowNode) {
    event.stopPropagation();
    event.preventDefault();
    setNodeMenu({ kind: "connect", sourceId: node.id, x: event.clientX, y: event.clientY });
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

  function saveVersion() {
    const version: FlowVersion = {
      id: `ver-${Date.now()}`,
      at: new Date().toISOString(),
      label: `${present.nodes.length} blocks · ${present.edges.length} links`,
      snapshot: JSON.parse(JSON.stringify(present))
    };
    const next = [version, ...versions].slice(0, 20);
    setVersions(next);
    persistVersions(flow.id, next);
  }

  function restoreVersion(version: FlowVersion) {
    commit(JSON.parse(JSON.stringify(version.snapshot)));
    setSelectedNodeId(version.snapshot.nodes[0]?.id ?? "");
    setVersionsOpen(false);
  }

  function removeVersion(versionId: string) {
    const next = versions.filter((item) => item.id !== versionId);
    setVersions(next);
    persistVersions(flow.id, next);
  }

  const canvasSize = useMemo(() => {
    const maxX = present.nodes.reduce((max, node) => Math.max(max, node.position.x + NODE_WIDTH), 960);
    const maxY = present.nodes.reduce((max, node) => Math.max(max, node.position.y + NODE_HEIGHT), 640);
    return { width: maxX + 240, height: maxY + 200 };
  }, [present.nodes]);

  const nodePos = useMemo(() => new Map(present.nodes.map((node) => [node.id, node.position])), [present.nodes]);

  const previewSequence = useMemo(() => orderNodes(present), [present]);

  return (
    <div className="flowCanvasRoot">
      <div className="flowCanvasToolbar">
        <div className="flowCanvasToolbarGroup">
          <span className="flowCanvasTitle">{flow.name}</span>
          <span className={flow.status === "active" ? "flowStatusPill active" : "flowStatusPill"}>{flow.status}</span>
          {dirty && <span className="flowCanvasDirty">Unsaved</span>}
        </div>
        <div className="flowCanvasToolbarGroup">
          <button type="button" className="flowCanvasBtn" onClick={() => setGenerateOpen(true)}><Wand2 size={15} /> Generate</button>
          <button type="button" className="flowCanvasBtn" onClick={onTest} disabled={!onTest || saving}><Play size={15} /> Test</button>
          <span className="flowCanvasDivider" />
          <button type="button" className="flowCanvasIconBtn" onClick={undo} disabled={past.length === 0} aria-label="Undo" title="Undo"><Undo2 size={16} /></button>
          <button type="button" className="flowCanvasIconBtn" onClick={redo} disabled={future.length === 0} aria-label="Redo" title="Redo"><Redo2 size={16} /></button>
          <span className="flowCanvasDivider" />
          <button type="button" className="flowCanvasBtn" onClick={handleSave} disabled={saving}><Save size={15} /> Save</button>
          {onPublish && (
            <button type="button" className="flowCanvasBtn publish" onClick={() => onPublish()} disabled={saving}><Rocket size={15} /> Publish</button>
          )}
          <div className="flowMenuWrap">
            <button type="button" className="flowCanvasIconBtn" onClick={() => setFlowMenuOpen((open) => !open)} aria-label="More" title="More actions"><MoreHorizontal size={16} /></button>
            {flowMenuOpen && (
              <>
                <div className="flowMenuBackdrop" onClick={() => setFlowMenuOpen(false)} />
                <div className="flowMenu" role="menu">
                  {onRenameFlow && (
                    <button type="button" onClick={() => { setRenameFlowValue(flow.name); setFlowMenuOpen(false); }}><Pencil size={14} /> Rename flow</button>
                  )}
                  {onDuplicateFlow && (
                    <button type="button" onClick={() => { onDuplicateFlow(); setFlowMenuOpen(false); }}><Copy size={14} /> Duplicate flow</button>
                  )}
                  <button type="button" onClick={() => { setVersionsOpen(true); setFlowMenuOpen(false); }}><History size={14} /> Flow versions</button>
                  {onDeleteFlow && (
                    <button type="button" className="danger" onClick={() => { onDeleteFlow(); setFlowMenuOpen(false); }}><Trash2 size={14} /> Delete flow</button>
                  )}
                </div>
              </>
            )}
          </div>
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

        <div className="flowCanvasStage">
          <div
            className="flowCanvasScroll"
            ref={canvasRef}
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
            onClick={() => { setSelectedNodeId(""); setRenamingNodeId(""); }}
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
                const isMessage = MESSAGE_NODE_TYPES.has(node.type);
                const contentItems = readContent(node);
                const messageKey = node.type === "ai_reply" ? "prompt" : "message";
                const messageValue = String((node.config as Record<string, unknown>)?.[messageKey] ?? "");
                return (
                  <div
                    key={node.id}
                    data-node-id={node.id}
                    className={node.id === selectedNodeId ? "flowNode selected" : "flowNode"}
                    style={{ left: node.position.x, top: node.position.y, width: NODE_WIDTH, "--node-accent": meta.accent } as CSSProperties}
                    onClick={(event) => { event.stopPropagation(); setSelectedNodeId(node.id); }}
                  >
                    <div className="flowNodeToolbar" onPointerDown={(event) => event.stopPropagation()}>
                      <button type="button" onClick={(event) => { event.stopPropagation(); setSelectedNodeId(node.id); setPreviewOpen(true); }} aria-label="Preview" title="Preview"><Eye size={13} /></button>
                      <button type="button" onClick={(event) => { event.stopPropagation(); onTest?.(); }} disabled={!onTest} aria-label="Test" title="Test"><Play size={13} /></button>
                      <button type="button" onClick={(event) => { event.stopPropagation(); duplicateNode(node.id); }} aria-label="Duplicate" title="Duplicate"><Copy size={13} /></button>
                      <button type="button" onClick={(event) => { event.stopPropagation(); setSelectedNodeId(node.id); setRenamingNodeId(node.id); }} aria-label="Rename" title="Rename"><TypeIcon size={13} /></button>
                      <button type="button" className="danger" onClick={(event) => { event.stopPropagation(); deleteNode(node.id); }} aria-label="Delete" title="Delete"><Trash2 size={13} /></button>
                    </div>

                    <div className="flowNodeHeader" onPointerDown={(event) => beginNodeDrag(event, node)}>
                      <span className="flowNodeIcon"><Icon size={14} /></span>
                      {renamingNodeId === node.id ? (
                        <input
                          className="flowNodeRenameInput"
                          autoFocus
                          value={node.label}
                          onChange={(event) => updateNode(node.id, { label: event.target.value })}
                          onBlur={() => { setRenamingNodeId(""); if (!node.label.trim()) updateNode(node.id, { label: meta.label }); }}
                          onKeyDown={(event) => { if (event.key === "Enter" || event.key === "Escape") setRenamingNodeId(""); }}
                          onClick={(event) => event.stopPropagation()}
                          onPointerDown={(event) => event.stopPropagation()}
                        />
                      ) : (
                        <strong>{node.label}</strong>
                      )}
                    </div>

                    {isMessage ? (
                      <div className="flowNodeMessage" onPointerDown={(event) => event.stopPropagation()}>
                        <textarea
                          className="flowNodeInlineInput"
                          rows={2}
                          value={messageValue}
                          placeholder={node.type === "ai_reply" ? "AI prompt…" : "Type a message…"}
                          onChange={(event) => updateNodeConfig(node.id, messageKey, event.target.value)}
                          onClick={(event) => event.stopPropagation()}
                        />
                        {contentItems.length > 0 && (
                          <div className="flowNodeChips">
                            {contentItems.map((item) => {
                              const cm = CONTENT_META_BY_KIND.get(item.kind);
                              const ChipIcon = cm?.icon ?? TypeIcon;
                              return (
                                <span className="flowNodeChip" key={item.id} title={item.label || item.value || item.url || cm?.label}>
                                  <ChipIcon size={11} /> {item.label || cm?.label}
                                </span>
                              );
                            })}
                          </div>
                        )}
                        <button
                          type="button"
                          className="flowNodeAddContent"
                          onClick={(event) => { event.stopPropagation(); setContentMenu({ nodeId: node.id, x: event.clientX, y: event.clientY }); }}
                        >
                          <Plus size={12} /> Add Content
                        </button>
                      </div>
                    ) : (
                      <p className="flowNodeSummary">{summariseConfig(node)}</p>
                    )}

                    <button
                      type="button"
                      className="flowNodeHandle"
                      aria-label="Drag to connect"
                      title="Drag to another block to connect"
                      onPointerDown={(event) => beginConnect(event, node)}
                    />
                    <button
                      type="button"
                      className="flowNodeContinue"
                      aria-label="Add next block"
                      title="Add next block"
                      onPointerDown={(event) => event.stopPropagation()}
                      onClick={(event) => openConnectMenu(event, node)}
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                );
              })}

              {present.nodes.length === 0 && (
                <div className="flowCanvasEmpty">
                  <Wand2 size={22} />
                  <p>Drag blocks from the palette or click <strong>Generate</strong> to start.</p>
                </div>
              )}
            </div>
          </div>

          <div className="flowBottomBar" onPointerDown={(event) => event.stopPropagation()}>
            <button type="button" className="flowCanvasIconBtn" onClick={() => setPreviewOpen(true)} aria-label="Preview flow" title="Preview flow"><Eye size={16} /></button>
            <span className="flowCanvasDivider" />
            <button type="button" className="flowCanvasIconBtn" onClick={() => setZoom((z) => Math.max(0.5, Math.round((z - 0.1) * 10) / 10))} aria-label="Zoom out" title="Zoom out"><ZoomOut size={16} /></button>
            <span className="flowCanvasZoom">{Math.round(zoom * 100)}%</span>
            <button type="button" className="flowCanvasIconBtn" onClick={() => setZoom((z) => Math.min(1.5, Math.round((z + 0.1) * 10) / 10))} aria-label="Zoom in" title="Zoom in"><ZoomIn size={16} /></button>
            <span className="flowCanvasDivider" />
            <button type="button" className="flowCanvasIconBtn" onClick={() => setGenerateOpen(true)} aria-label="Generate" title="Generate workflow"><Wand2 size={16} /></button>
            <button
              type="button"
              className="flowBottomAdd"
              onClick={(event) => { event.stopPropagation(); setNodeMenu({ kind: "add", x: event.clientX, y: event.clientY }); }}
            >
              <Plus size={15} /> Add
            </button>
          </div>
        </div>

        <aside className="flowConfigPanel" aria-label="Node configuration">
          {selectedNode ? (
            <FlowNodeConfig
              node={selectedNode}
              platformScope={flow.platformScope}
              onLabelChange={(label) => updateNode(selectedNode.id, { label: label || metaFor(selectedNode.type).label })}
              onConfigChange={(key, value) => updateNodeConfig(selectedNode.id, key, value)}
              onContentChange={(contentId, patch) => updateContent(selectedNode.id, contentId, patch)}
              onContentRemove={(contentId) => removeContent(selectedNode.id, contentId)}
              content={readContent(selectedNode)}
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

      {nodeMenu && (
        <>
          <div className="flowMenuBackdrop" onClick={() => setNodeMenu(null)} />
          <div className="flowPopupMenu" style={{ left: nodeMenu.x, top: nodeMenu.y }} role="menu">
            <p className="flowPopupTitle">{nodeMenu.kind === "connect" ? "Add next block" : "Add block"}</p>
            {QUICK_ADD_TYPES.map((type) => {
              const meta = metaFor(type);
              const Icon = meta.icon;
              return (
                <button type="button" key={type} onClick={() => handleQuickAdd(type)} style={{ "--node-accent": meta.accent } as CSSProperties}>
                  <span className="flowPopupIcon"><Icon size={13} /></span> {meta.label}
                </button>
              );
            })}
          </div>
        </>
      )}

      {contentMenu && (
        <>
          <div className="flowMenuBackdrop" onClick={() => setContentMenu(null)} />
          <div className="flowPopupMenu" style={{ left: contentMenu.x, top: contentMenu.y }} role="menu">
            <p className="flowPopupTitle">Add content</p>
            {CONTENT_MENU.map((item) => {
              const Icon = item.icon;
              return (
                <button type="button" key={item.kind} onClick={() => addContent(contentMenu.nodeId, item.kind)}>
                  <span className="flowPopupIcon"><Icon size={13} /></span> {item.label}
                </button>
              );
            })}
          </div>
        </>
      )}

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

      {renameFlowValue !== null && (
        <div className="flowDialogBackdrop" onClick={() => setRenameFlowValue(null)}>
          <div className="flowDialog" onClick={(event) => event.stopPropagation()}>
            <div className="flowDialogHeader">
              <h3><Pencil size={16} /> Rename flow</h3>
              <button type="button" className="flowCanvasIconBtn" onClick={() => setRenameFlowValue(null)} aria-label="Close"><X size={16} /></button>
            </div>
            <label className="flowDialogField">
              Flow name
              <input autoFocus value={renameFlowValue} onChange={(event) => setRenameFlowValue(event.target.value)} />
            </label>
            <div className="flowDialogActions">
              <button type="button" className="flowCanvasBtn" onClick={() => setRenameFlowValue(null)}>Cancel</button>
              <button
                type="button"
                className="flowCanvasBtn primary"
                onClick={() => { if (renameFlowValue.trim() && onRenameFlow) onRenameFlow(renameFlowValue.trim()); setRenameFlowValue(null); }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {versionsOpen && (
        <div className="flowDialogBackdrop" onClick={() => setVersionsOpen(false)}>
          <div className="flowDialog" onClick={(event) => event.stopPropagation()}>
            <div className="flowDialogHeader">
              <h3><History size={16} /> Flow versions</h3>
              <button type="button" className="flowCanvasIconBtn" onClick={() => setVersionsOpen(false)} aria-label="Close"><X size={16} /></button>
            </div>
            <p className="flowDialogNote">Snapshots are saved locally in this browser only.</p>
            <div className="flowDialogActions" style={{ justifyContent: "flex-start" }}>
              <button type="button" className="flowCanvasBtn primary" onClick={saveVersion}><Save size={15} /> Save current version</button>
            </div>
            <div className="flowVersionList">
              {versions.length === 0 && <p className="flowConfigMeta">No versions yet.</p>}
              {versions.map((version) => (
                <div className="flowVersionRow" key={version.id}>
                  <div>
                    <strong>{new Date(version.at).toLocaleString()}</strong>
                    <small>{version.label}</small>
                  </div>
                  <div className="flowVersionActions">
                    <button type="button" className="flowCanvasBtn" onClick={() => restoreVersion(version)}><RotateIcon /> Restore</button>
                    <button type="button" className="flowCanvasIconBtn danger" onClick={() => removeVersion(version.id)} aria-label="Delete version"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {previewOpen && (
        <div className="flowDialogBackdrop" onClick={() => setPreviewOpen(false)}>
          <div className="flowDialog flowPreviewDialog" onClick={(event) => event.stopPropagation()}>
            <div className="flowDialogHeader">
              <h3><Eye size={16} /> Flow preview</h3>
              <button type="button" className="flowCanvasIconBtn" onClick={() => setPreviewOpen(false)} aria-label="Close"><X size={16} /></button>
            </div>
            <div className="flowPreviewBody">
              {previewSequence.length === 0 && <p className="flowConfigMeta">No blocks to preview.</p>}
              {previewSequence.map((node, index) => {
                const meta = metaFor(node.type);
                const Icon = meta.icon;
                return (
                  <div className="flowPreviewStep" key={node.id} style={{ "--node-accent": meta.accent } as CSSProperties}>
                    <span className="flowPreviewIndex">{index + 1}</span>
                    <span className="flowNodeIcon"><Icon size={13} /></span>
                    <div>
                      <strong>{node.label}</strong>
                      <p>{summariseConfig(node)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RotateIcon() {
  return <Redo2 size={14} />;
}

// Order nodes by following edges from the first trigger/root; fall back to insertion order.
function orderNodes(snapshot: Snapshot): FlowNode[] {
  const { nodes, edges } = snapshot;
  if (nodes.length === 0) return [];
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const hasIncoming = new Set(edges.map((edge) => edge.targetNodeId));
  const start = nodes.find((node) => node.type === "trigger" && !hasIncoming.has(node.id))
    ?? nodes.find((node) => !hasIncoming.has(node.id))
    ?? nodes[0];
  const ordered: FlowNode[] = [];
  const seen = new Set<string>();
  let current: FlowNode | undefined = start;
  while (current && !seen.has(current.id)) {
    seen.add(current.id);
    ordered.push(current);
    const nextEdge = edges.find((edge) => edge.sourceNodeId === current!.id);
    current = nextEdge ? byId.get(nextEdge.targetNodeId) : undefined;
  }
  for (const node of nodes) {
    if (!seen.has(node.id)) ordered.push(node);
  }
  return ordered;
}

function summariseConfig(node: FlowNode): string {
  const rich = parseRichMessageConfig(node.config);
  const entries = Object.entries(node.config ?? {}).filter(([key]) => key !== RICH_MESSAGE_CONFIG_KEY && key !== "content");
  const parts = entries.map(([key, value]) => `${key}: ${typeof value === "object" ? JSON.stringify(value) : String(value)}`);
  const content = readContent(node);
  if (content.length > 0) parts.push(`${content.length} content item${content.length > 1 ? "s" : ""}`);
  if (rich) parts.push(summariseRichMessage(rich));
  if (parts.length === 0) return "No settings";
  return parts.join(" · ");
}

interface FlowNodeConfigProps {
  node: FlowNode;
  platformScope?: Platform[];
  content: ContentItem[];
  onLabelChange: (label: string) => void;
  onConfigChange: (key: string, value: unknown) => void;
  onContentChange: (contentId: string, patch: Partial<ContentItem>) => void;
  onContentRemove: (contentId: string) => void;
  onDelete: () => void;
}

const RICH_MESSAGE_NODE_TYPES: ReadonlySet<FlowNodeType> = new Set(["send_message", "ai_reply"]);

function FlowNodeConfig({ node, platformScope, content, onLabelChange, onConfigChange, onContentChange, onContentRemove, onDelete }: FlowNodeConfigProps) {
  const meta = metaFor(node.type);
  const Icon = meta.icon;
  const richMessage = parseRichMessageConfig(node.config);
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

      {content.length > 0 && (
        <div className="flowContentList">
          <p className="flowConfigMeta">Content blocks</p>
          {content.map((item) => {
            const cm = CONTENT_META_BY_KIND.get(item.kind);
            const ContentEditIcon = cm?.icon ?? TypeIcon;
            return (
              <div className="flowContentRow" key={item.id}>
                <div className="flowContentRowHead">
                  <span className="flowContentKind"><ContentEditIcon size={12} /> {cm?.label ?? item.kind}</span>
                  <button type="button" className="flowContentRemove" onClick={() => onContentRemove(item.id)} aria-label="Remove content"><Trash2 size={13} /></button>
                </div>
                {item.kind === "text" && (
                  <textarea rows={2} value={item.value ?? ""} placeholder="Text…" onChange={(event) => onContentChange(item.id, { value: event.target.value })} />
                )}
                {(item.kind === "image" || item.kind === "video" || item.kind === "gif") && (
                  <input value={item.url ?? ""} placeholder="Media URL" onChange={(event) => onContentChange(item.id, { url: event.target.value })} />
                )}
                {item.kind === "file" && (
                  <>
                    <input value={item.label ?? ""} placeholder="File name" onChange={(event) => onContentChange(item.id, { label: event.target.value })} />
                    <input value={item.url ?? ""} placeholder="File URL" onChange={(event) => onContentChange(item.id, { url: event.target.value })} />
                  </>
                )}
                {item.kind === "location" && (
                  <input value={item.value ?? ""} placeholder="lat,lng" onChange={(event) => onContentChange(item.id, { value: event.target.value })} />
                )}
                {item.kind === "button" && (
                  <>
                    <input value={item.label ?? ""} placeholder="Button label" onChange={(event) => onContentChange(item.id, { label: event.target.value })} />
                    <input value={item.value ?? ""} placeholder="Payload or URL" onChange={(event) => onContentChange(item.id, { value: event.target.value })} />
                  </>
                )}
                {item.kind === "quick_reply" && (
                  <input value={item.label ?? ""} placeholder="Quick reply label" onChange={(event) => onContentChange(item.id, { label: event.target.value })} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {RICH_MESSAGE_NODE_TYPES.has(node.type) && (
        <RichMessageEditor
          value={richMessage}
          platformScope={platformScope}
          onChange={(value) => onConfigChange(RICH_MESSAGE_CONFIG_KEY, value ?? undefined)}
        />
      )}

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
  const stepX = 300;
  const perRow = 3;
  const nodes: FlowNode[] = chain.map((item, index) => {
    const row = Math.floor(index / perRow);
    const col = row % 2 === 0 ? index % perRow : perRow - 1 - (index % perRow);
    return {
      id: makeNodeId(item.type),
      type: item.type,
      label: item.label,
      config: item.config,
      position: { x: startX + col * stepX, y: startY + row * 210 }
    };
  });
  const edges: FlowEdge[] = nodes.slice(1).map((node, index) => ({
    id: makeEdgeId(),
    sourceNodeId: nodes[index].id,
    targetNodeId: node.id
  }));
  return { nodes, edges };
}
