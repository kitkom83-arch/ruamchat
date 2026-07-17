"use client";

import {
  Archive,
  Bot,
  CheckCircle2,
  Copy,
  Database,
  Edit3,
  FileText,
  Link2,
  Plus,
  RefreshCw,
  Save,
  Search,
  Sparkles,
  TestTube2,
  Trash2
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  createKnowledgeAwareMockAiDecision,
  getActiveKnowledgeItems,
  knowledgeItemSchema,
  type AIDecision,
  type AiMode,
  type CoreRoom,
  type KnowledgeBase,
  type KnowledgeCategory,
  type KnowledgeChunk,
  type KnowledgeDocument,
  type KnowledgeItem,
  type KnowledgeSourceType,
  type KnowledgeStatus,
  type RoomAiPolicy
} from "@ai-omni/shared";
import {
  createKnowledgeBase,
  createKnowledgeChunk,
  createKnowledgeDocument,
  deleteKnowledgeBase,
  deleteKnowledgeChunk,
  deleteKnowledgeDocument,
  getRoomAiPolicy,
  updateKnowledgeBase,
  updateKnowledgeChunk,
  updateKnowledgeDocument,
  updateRoomAiPolicy
} from "../api-client";
import { useLang } from "../i18n-data";
import {
  buildKnowledgeItemsFromApi,
  getChunksForDocument,
  getDocumentsForKnowledgeBase,
  loadAiCenterData
} from "../ai-data";
import {
  createEmptyKnowledgeItem,
  getKnowledgeCategoryLabel,
  getStoredKnowledgeItems,
  knowledgeCategories,
  knowledgeStatuses,
  saveStoredKnowledgeItems
} from "../ai-knowledge-store";
import { dataMode, isApiMode } from "../data-mode";
import { AiCenterApiKnowledgeList } from "./api-knowledge-list";

const allCategory = "all";
const allStatus = "all";
const sourceTypes: KnowledgeSourceType[] = ["manual", "url", "file", "import"];
const aiModes: AiMode[] = ["off", "suggest", "auto_faq", "auto_sales", "ai_agent", "human_first"];

type KnowledgeForm = {
  id: string;
  title: string;
  category: KnowledgeCategory;
  body: string;
  status: KnowledgeStatus;
  tagsText: string;
  updatedAt: string;
};

type KnowledgeBaseForm = {
  id: string;
  name: string;
  description: string;
  status: KnowledgeStatus;
};

type DocumentForm = {
  id: string;
  title: string;
  sourceType: KnowledgeSourceType;
  sourceUrl: string;
  status: KnowledgeStatus;
};

type ChunkForm = {
  id: string;
  content: string;
  metadataText: string;
};

type PolicyForm = {
  aiMode: AiMode;
  autoReplyThreshold: string;
  draftThreshold: string;
  requireCitationsForAutoReply: boolean;
  handoffOnHighRisk: boolean;
  knowledgeBaseIds: string[];
};

type RefreshSelection = {
  knowledgeBaseId?: string;
  documentId?: string;
  roomId?: string;
};

export default function AiCenterPage() {
  return isApiMode() ? <ApiAiCenterPage /> : <MockAiCenterPage />;
}

function MockAiCenterPage() {
  const { t } = useLang();
  const [items, setItems] = useState<KnowledgeItem[]>(() => getStoredKnowledgeItems());
  const [editing, setEditing] = useState<KnowledgeForm>(() => toForm(createEmptyKnowledgeItem("faq")));
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<KnowledgeCategory | typeof allCategory>(allCategory);
  const [statusFilter, setStatusFilter] = useState<KnowledgeStatus | typeof allStatus>(allStatus);
  const [tagFilter, setTagFilter] = useState("");
  const [formMessage, setFormMessage] = useState("Ready");
  const [labQuestion, setLabQuestion] = useState("ขอทราบราคาแพ็กเกจ Pro");
  const [labScope, setLabScope] = useState<KnowledgeCategory | typeof allCategory>(allCategory);
  const [labResult, setLabResult] = useState<AIDecision | null>(() => createKnowledgeAwareMockAiDecision("ขอทราบราคาแพ็กเกจ Pro", items));

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    const tag = tagFilter.trim().toLowerCase();

    return items.filter((item) => {
      const matchesCategory = categoryFilter === allCategory || item.category === categoryFilter;
      const matchesStatus = statusFilter === allStatus || item.status === statusFilter;
      const matchesTag = !tag || item.tags.some((itemTag) => itemTag.toLowerCase().includes(tag));
      const matchesQuery = !query || [item.title, item.body, item.category, item.tags.join(" ")].join(" ").toLowerCase().includes(query);
      return matchesCategory && matchesStatus && matchesTag && matchesQuery;
    });
  }, [categoryFilter, items, search, statusFilter, tagFilter]);

  const activeItems = getActiveKnowledgeItems(items);
  const matchedForLab = labResult?.matchedKnowledge ?? [];

  function persist(nextItems: KnowledgeItem[]) {
    setItems(nextItems);
    saveStoredKnowledgeItems(nextItems);
  }

  function resetForm(category: KnowledgeCategory = "faq") {
    setEditing(toForm(createEmptyKnowledgeItem(category)));
    setFormMessage("New draft");
  }

  function saveForm() {
    const candidate = knowledgeItemSchema.safeParse({
      id: editing.id,
      title: editing.title.trim(),
      category: editing.category,
      body: editing.body.trim(),
      status: editing.status,
      tags: editing.tagsText.split(",").map((tag) => tag.trim()).filter(Boolean),
      updatedAt: new Date().toISOString()
    });

    if (!candidate.success) {
      setFormMessage("Please fill title, body, category, status, and tags correctly.");
      return;
    }

    const exists = items.some((item) => item.id === candidate.data.id);
    persist(exists ? items.map((item) => item.id === candidate.data.id ? candidate.data : item) : [candidate.data, ...items]);
    setEditing(toForm(candidate.data));
    setFormMessage(exists ? "Knowledge item updated" : "Knowledge item created");
  }

  function archiveItem(itemId: string) {
    persist(items.map((item) => item.id === itemId ? { ...item, status: "archived", updatedAt: new Date().toISOString() } : item));
    setFormMessage("Knowledge item archived");
  }

  function toggleDraftActive(itemId: string) {
    persist(items.map((item) => {
      if (item.id !== itemId || item.status === "archived") return item;
      return { ...item, status: item.status === "active" ? "draft" : "active", updatedAt: new Date().toISOString() };
    }));
  }

  function runLab() {
    const categories = labScope === allCategory ? undefined : [labScope];
    const result = createKnowledgeAwareMockAiDecision(labQuestion, items, { categories });
    setLabResult(result);
  }

  return (
    <main className="aiCenterPage">
      <header className="aiCenterHeader">
        <div>
          <p className="eyebrow">{t("page.ai.eyebrow")}</p>
          <h1>{t("page.ai.h1")}</h1>
          <p className="aiCenterCopy">{t("page.ai.lead")}</p>
        </div>
        <div className="aiCenterStats">
          <span><CheckCircle2 size={15} /> {activeItems.length} active</span>
          <span><Archive size={15} /> {items.filter((item) => item.status === "archived").length} archived</span>
          <span><Bot size={15} /> local storage</span>
        </div>
      </header>

      <section className="warningBand">
        <strong>Demo safety rules</strong>
        <span>ห้ามใส่ secret/token/password/API key</span>
        <span>ห้ามใส่ข้อมูลลูกค้าส่วนตัวจริงใน demo</span>
        <span>ข้อมูล active จะถูกใช้เป็นฐานตอบของ AI</span>
      </section>

      <nav className="aiSectionTabs" aria-label="AI Center sections">
        {knowledgeCategories.map((category) => (
          <button key={category.id} type="button" onClick={() => setCategoryFilter(category.id)}>
            {category.label}
          </button>
        ))}
        <button type="button" onClick={() => document.getElementById("ai-test-lab")?.scrollIntoView({ behavior: "smooth" })}>
          AI Test Lab
        </button>
      </nav>

      <section className="knowledgeWorkspace">
        <aside className="knowledgeEditor">
          <div className="blockHeader">
            <Edit3 size={17} />
            <h2>{items.some((item) => item.id === editing.id) ? "Edit Knowledge" : "Create Knowledge"}</h2>
          </div>
          <label>Title<input value={editing.title} onChange={(event) => setEditing({ ...editing, title: event.target.value })} /></label>
          <label>Category<select value={editing.category} onChange={(event) => setEditing({ ...editing, category: event.target.value as KnowledgeCategory })}>
            {knowledgeCategories.map((category) => <option key={category.id} value={category.id}>{category.label}</option>)}
          </select></label>
          <label>Status<select value={editing.status} onChange={(event) => setEditing({ ...editing, status: event.target.value as KnowledgeStatus })}>
            {knowledgeStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </select></label>
          <label>Body<textarea value={editing.body} onChange={(event) => setEditing({ ...editing, body: event.target.value })} /></label>
          <label>Tags<input value={editing.tagsText} onChange={(event) => setEditing({ ...editing, tagsText: event.target.value })} placeholder="pricing, faq, demo" /></label>
          <div className="editorActions">
            <button type="button" onClick={saveForm}><FileText size={15} /> Save</button>
            <button type="button" onClick={() => resetForm(editing.category)}><Plus size={15} /> New</button>
          </div>
          <p className="aiActionStatus">{formMessage}</p>
        </aside>

        <section className="knowledgeListPanel">
          <div className="knowledgeFilters">
            <label className="searchBox">
              <Search size={16} />
              <input placeholder="Search title/body" value={search} onChange={(event) => setSearch(event.target.value)} />
            </label>
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value as KnowledgeCategory | typeof allCategory)}>
              <option value={allCategory}>All categories</option>
              {knowledgeCategories.map((category) => <option key={category.id} value={category.id}>{category.label}</option>)}
            </select>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as KnowledgeStatus | typeof allStatus)}>
              <option value={allStatus}>All statuses</option>
              {knowledgeStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
            <input value={tagFilter} onChange={(event) => setTagFilter(event.target.value)} placeholder="Filter tag" />
          </div>

          <div className="knowledgeCards">
            {filteredItems.map((item) => (
              <article key={item.id} className="knowledgeCard">
                <div className="knowledgeCardTop">
                  <div>
                    <span className={`statusPill ${item.status}`}>{item.status}</span>
                    <h3>{item.title}</h3>
                    <p>{getKnowledgeCategoryLabel(item.category)}</p>
                  </div>
                  <time>{new Date(item.updatedAt).toLocaleDateString("th-TH")}</time>
                </div>
                <p className="knowledgeBody">{item.body}</p>
                <div className="tagRow">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                <div className="knowledgeActions">
                  <button type="button" onClick={() => setEditing(toForm(item))}>Edit</button>
                  <button type="button" onClick={() => toggleDraftActive(item.id)} disabled={item.status === "archived"}>
                    {item.status === "active" ? "Set Draft" : "Set Active"}
                  </button>
                  <button type="button" onClick={() => archiveItem(item.id)}>Archive</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>

      <MockAiLab
        items={items}
        labQuestion={labQuestion}
        labScope={labScope}
        labResult={labResult}
        matchedForLab={matchedForLab}
        onQuestionChange={setLabQuestion}
        onScopeChange={setLabScope}
        onRun={runLab}
      />
    </main>
  );
}

function ApiAiCenterPage() {
  const { t } = useLang();
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [chunks, setChunks] = useState<KnowledgeChunk[]>([]);
  const [rooms, setRooms] = useState<CoreRoom[]>([]);
  const [roomPolicy, setRoomPolicy] = useState<RoomAiPolicy | null>(null);
  const [selectedKnowledgeBaseId, setSelectedKnowledgeBaseId] = useState("");
  const [selectedDocumentId, setSelectedDocumentId] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [knowledgeBaseForm, setKnowledgeBaseForm] = useState<KnowledgeBaseForm>(() => emptyKnowledgeBaseForm());
  const [documentForm, setDocumentForm] = useState<DocumentForm>(() => emptyDocumentForm());
  const [chunkForm, setChunkForm] = useState<ChunkForm>(() => emptyChunkForm());
  const [policyForm, setPolicyForm] = useState<PolicyForm>(() => defaultPolicyForm());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState("Ready");
  const [labQuestion, setLabQuestion] = useState("ขอทราบราคาแพ็กเกจ Pro");
  const [labResult, setLabResult] = useState<AIDecision | null>(null);

  const selectedKnowledgeBase = knowledgeBases.find((item) => item.id === selectedKnowledgeBaseId) ?? null;
  const selectedDocuments = useMemo(
    () => getDocumentsForKnowledgeBase(documents, selectedKnowledgeBaseId),
    [documents, selectedKnowledgeBaseId]
  );
  const selectedDocument = documents.find((item) => item.id === selectedDocumentId) ?? null;
  const selectedChunks = useMemo(
    () => getChunksForDocument(chunks, selectedDocumentId),
    [chunks, selectedDocumentId]
  );
  const labItems = useMemo(
    () => buildKnowledgeItemsFromApi(knowledgeBases, documents, chunks),
    [chunks, documents, knowledgeBases]
  );
  const activeKnowledgeBaseCount = knowledgeBases.filter((item) => item.status === "active").length;
  const matchedForLab = labResult?.matchedKnowledge ?? [];

  useEffect(() => {
    void refreshData();
  }, []);

  async function refreshData(selection: RefreshSelection = {}) {
    setLoading(true);
    setError(null);
    try {
      const data = await loadAiCenterData("api");
      setKnowledgeBases(data.knowledgeBases);
      setDocuments(data.documents);
      setChunks(data.chunks);
      setRooms(data.rooms);

      const nextKnowledgeBaseId = selection.knowledgeBaseId ??
        (selectedKnowledgeBaseId && data.knowledgeBases.some((item) => item.id === selectedKnowledgeBaseId)
          ? selectedKnowledgeBaseId
          : data.knowledgeBases[0]?.id ?? "");
      const nextDocuments = getDocumentsForKnowledgeBase(data.documents, nextKnowledgeBaseId);
      const nextDocumentId = selection.documentId ??
        (selectedDocumentId && nextDocuments.some((item) => item.id === selectedDocumentId)
          ? selectedDocumentId
          : nextDocuments[0]?.id ?? "");
      const nextRoomId = selection.roomId ??
        (selectedRoomId && data.rooms.some((item) => item.id === selectedRoomId)
          ? selectedRoomId
          : data.rooms[0]?.id ?? "");
      const nextRoomPolicy = nextRoomId && data.roomPolicy?.roomId !== nextRoomId
        ? await getRoomAiPolicy(nextRoomId)
        : data.roomPolicy;

      setSelectedKnowledgeBaseId(nextKnowledgeBaseId);
      setSelectedDocumentId(nextDocumentId);
      setSelectedRoomId(nextRoomId);
      setRoomPolicy(nextRoomPolicy);
      setKnowledgeBaseForm(toKnowledgeBaseForm(data.knowledgeBases.find((item) => item.id === nextKnowledgeBaseId) ?? null));
      setDocumentForm(toDocumentForm(nextDocuments.find((item) => item.id === nextDocumentId) ?? null));
      setChunkForm(emptyChunkForm());
      setPolicyForm(nextRoomPolicy ? toPolicyForm(nextRoomPolicy) : defaultPolicyForm());
    } catch (err) {
      setError(readableError(err));
    } finally {
      setLoading(false);
    }
  }

  async function saveKnowledgeBaseForm() {
    if (!knowledgeBaseForm.name.trim()) {
      setFormMessage("Knowledge base name is required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const saved = knowledgeBaseForm.id
        ? await updateKnowledgeBase(knowledgeBaseForm.id, {
          name: knowledgeBaseForm.name,
          description: knowledgeBaseForm.description,
          status: knowledgeBaseForm.status
        })
        : await createKnowledgeBase({
          name: knowledgeBaseForm.name,
          description: knowledgeBaseForm.description,
          status: knowledgeBaseForm.status
        });
      setFormMessage(knowledgeBaseForm.id ? "Knowledge base updated" : "Knowledge base created");
      await refreshData({ knowledgeBaseId: saved.id });
    } catch (err) {
      setError(readableError(err));
    } finally {
      setSaving(false);
    }
  }

  async function archiveKnowledgeBaseForm() {
    if (!knowledgeBaseForm.id) return;
    await archiveKnowledgeBaseById(knowledgeBaseForm.id);
  }

  async function archiveKnowledgeBaseById(knowledgeBaseId: string) {
    setSaving(true);
    setError(null);
    try {
      const archived = await deleteKnowledgeBase(knowledgeBaseId);
      setFormMessage("Knowledge base archived");
      await refreshData({ knowledgeBaseId: archived.id });
    } catch (err) {
      setError(readableError(err));
    } finally {
      setSaving(false);
    }
  }

  async function saveDocumentForm() {
    if (!selectedKnowledgeBaseId) {
      setFormMessage("Select a knowledge base first");
      return;
    }
    if (!documentForm.title.trim()) {
      setFormMessage("Document title is required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title: documentForm.title,
        sourceType: documentForm.sourceType,
        sourceUrl: documentForm.sourceUrl.trim() ? documentForm.sourceUrl.trim() : null,
        status: documentForm.status
      };
      const saved = documentForm.id
        ? await updateKnowledgeDocument(documentForm.id, payload)
        : await createKnowledgeDocument(selectedKnowledgeBaseId, payload);
      setFormMessage(documentForm.id ? "Document updated" : "Document created");
      await refreshData({ knowledgeBaseId: saved.knowledgeBaseId, documentId: saved.id });
    } catch (err) {
      setError(readableError(err));
    } finally {
      setSaving(false);
    }
  }

  async function archiveDocumentForm() {
    if (!documentForm.id) return;
    setSaving(true);
    setError(null);
    try {
      const archived = await deleteKnowledgeDocument(documentForm.id);
      setFormMessage("Document archived");
      await refreshData({ knowledgeBaseId: archived.knowledgeBaseId, documentId: archived.id });
    } catch (err) {
      setError(readableError(err));
    } finally {
      setSaving(false);
    }
  }

  async function saveChunkForm() {
    if (!selectedDocumentId) {
      setFormMessage("Select a document first");
      return;
    }
    if (!chunkForm.content.trim()) {
      setFormMessage("Chunk content is required");
      return;
    }
    const metadataJson = parseMetadata(chunkForm.metadataText);
    if (metadataJson instanceof Error) {
      setFormMessage(metadataJson.message);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        content: chunkForm.content,
        metadataJson
      };
      const saved = chunkForm.id
        ? await updateKnowledgeChunk(chunkForm.id, payload)
        : await createKnowledgeChunk(selectedDocumentId, payload);
      setFormMessage(chunkForm.id ? "Chunk updated" : "Chunk created");
      await refreshData({ knowledgeBaseId: selectedKnowledgeBaseId, documentId: saved.documentId });
    } catch (err) {
      setError(readableError(err));
    } finally {
      setSaving(false);
    }
  }

  async function removeChunk(chunkId: string) {
    setSaving(true);
    setError(null);
    try {
      await deleteKnowledgeChunk(chunkId);
      setFormMessage("Chunk deleted");
      await refreshData({ knowledgeBaseId: selectedKnowledgeBaseId, documentId: selectedDocumentId });
    } catch (err) {
      setError(readableError(err));
    } finally {
      setSaving(false);
    }
  }

  async function loadRoomPolicy(roomId: string) {
    setSelectedRoomId(roomId);
    setError(null);
    try {
      const policy = await getRoomAiPolicy(roomId);
      setRoomPolicy(policy);
      setPolicyForm(toPolicyForm(policy));
    } catch (err) {
      setError(readableError(err));
    }
  }

  async function savePolicy() {
    if (!selectedRoomId) return;
    setSaving(true);
    setError(null);
    try {
      const policy = await updateRoomAiPolicy(selectedRoomId, {
        aiMode: policyForm.aiMode,
        autoReplyThreshold: Number(policyForm.autoReplyThreshold),
        draftThreshold: Number(policyForm.draftThreshold),
        requireCitationsForAutoReply: policyForm.requireCitationsForAutoReply,
        handoffOnHighRisk: policyForm.handoffOnHighRisk,
        knowledgeBaseIds: policyForm.knowledgeBaseIds
      });
      setRoomPolicy(policy);
      setPolicyForm(toPolicyForm(policy));
      setFormMessage("Room AI policy updated");
    } catch (err) {
      setError(readableError(err));
    } finally {
      setSaving(false);
    }
  }

  function runLab() {
    const result = createKnowledgeAwareMockAiDecision(labQuestion, labItems);
    setLabResult(result);
  }

  return (
    <main className="aiCenterPage">
      <header className="aiCenterHeader">
        <div>
          <p className="eyebrow">{t("page.ai.eyebrow")}</p>
          <h1>{t("page.ai.h1")}</h1>
          <p className="aiCenterCopy">{t("page.ai.leadApi")}</p>
        </div>
        <div className="aiCenterStats">
          <span><CheckCircle2 size={15} /> {activeKnowledgeBaseCount} active KBs</span>
          <span><FileText size={15} /> {documents.length} documents</span>
          <span><Database size={15} /> API mode</span>
        </div>
      </header>

      <section className="warningBand">
        <strong>Demo safety rules</strong>
        <span>No secrets, tokens, passwords, or real customer private data</span>
        <span>No real OpenAI/vector-store calls from this screen</span>
        <span>API errors are shown instead of falling back to mock data</span>
      </section>

      {error && <section className="errorBand" role="alert"><strong>API error</strong><span>{error}</span></section>}
      {loading && <section className="loadingBand"><RefreshCw size={16} /> Loading AI Center API data...</section>}

      {!loading && (
        <>
          <section className="knowledgeWorkspace apiKnowledgeWorkspace">
            <aside className="knowledgeEditor">
              <div className="blockHeader">
                <Edit3 size={17} />
                <h2>{knowledgeBaseForm.id ? "Edit Knowledge Base" : "Create Knowledge Base"}</h2>
              </div>
              <label>Name<input value={knowledgeBaseForm.name} onChange={(event) => setKnowledgeBaseForm({ ...knowledgeBaseForm, name: event.target.value })} /></label>
              <label>Description<textarea value={knowledgeBaseForm.description} onChange={(event) => setKnowledgeBaseForm({ ...knowledgeBaseForm, description: event.target.value })} /></label>
              <label>Status<select value={knowledgeBaseForm.status} onChange={(event) => setKnowledgeBaseForm({ ...knowledgeBaseForm, status: event.target.value as KnowledgeStatus })}>
                {knowledgeStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
              </select></label>
              <div className="editorActions">
                <button type="button" onClick={saveKnowledgeBaseForm} disabled={saving}><Save size={15} /> Save KB</button>
                <button type="button" onClick={() => setKnowledgeBaseForm(emptyKnowledgeBaseForm())}><Plus size={15} /> New KB</button>
                <button type="button" onClick={archiveKnowledgeBaseForm} disabled={!knowledgeBaseForm.id || saving}><Archive size={15} /> Archive</button>
              </div>
              <p className="aiActionStatus">{formMessage}</p>
            </aside>

            <section className="knowledgeListPanel">
              <div className="knowledgeFilters">
                <button type="button" onClick={() => void refreshData()} disabled={saving}><RefreshCw size={15} /> Refresh</button>
                <span>{dataMode.toUpperCase()} / {knowledgeBases.length} KBs / {chunks.length} chunks</span>
              </div>
              <AiCenterApiKnowledgeList
                knowledgeBases={knowledgeBases}
                selectedKnowledgeBaseId={selectedKnowledgeBaseId}
                onSelect={(knowledgeBase) => {
                  setSelectedKnowledgeBaseId(knowledgeBase.id);
                  setKnowledgeBaseForm(toKnowledgeBaseForm(knowledgeBase));
                  const firstDocument = getDocumentsForKnowledgeBase(documents, knowledgeBase.id)[0] ?? null;
                  setSelectedDocumentId(firstDocument?.id ?? "");
                  setDocumentForm(toDocumentForm(firstDocument));
                  setChunkForm(emptyChunkForm());
                }}
                onEdit={(knowledgeBase) => setKnowledgeBaseForm(toKnowledgeBaseForm(knowledgeBase))}
                onArchive={(knowledgeBase) => void archiveKnowledgeBaseById(knowledgeBase.id)}
              />
            </section>
          </section>

          <section className="knowledgeWorkspace apiKnowledgeWorkspace">
            <aside className="knowledgeEditor">
              <div className="blockHeader">
                <FileText size={17} />
                <h2>{documentForm.id ? "Edit Document" : "Create Document"}</h2>
              </div>
              <label>Knowledge base<input value={selectedKnowledgeBase?.name ?? ""} readOnly /></label>
              <label>Title<input value={documentForm.title} onChange={(event) => setDocumentForm({ ...documentForm, title: event.target.value })} /></label>
              <label>Source type<select value={documentForm.sourceType} onChange={(event) => setDocumentForm({ ...documentForm, sourceType: event.target.value as KnowledgeSourceType })}>
                {sourceTypes.map((sourceType) => <option key={sourceType} value={sourceType}>{sourceType}</option>)}
              </select></label>
              <label>Source URL<input value={documentForm.sourceUrl} onChange={(event) => setDocumentForm({ ...documentForm, sourceUrl: event.target.value })} /></label>
              <label>Status<select value={documentForm.status} onChange={(event) => setDocumentForm({ ...documentForm, status: event.target.value as KnowledgeStatus })}>
                {knowledgeStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
              </select></label>
              <div className="editorActions">
                <button type="button" onClick={saveDocumentForm} disabled={saving || !selectedKnowledgeBaseId}><Save size={15} /> Save Doc</button>
                <button type="button" onClick={() => setDocumentForm(emptyDocumentForm())} disabled={!selectedKnowledgeBaseId}><Plus size={15} /> New Doc</button>
                <button type="button" onClick={archiveDocumentForm} disabled={!documentForm.id || saving}><Archive size={15} /> Archive</button>
              </div>
            </aside>

            <section className="knowledgeListPanel">
              <div className="knowledgeFilters">
                <span>{selectedDocuments.length} documents in selected KB</span>
              </div>
              <div className="knowledgeCards">
                {selectedDocuments.length === 0 ? <p className="emptyState">No documents returned by the API.</p> : selectedDocuments.map((document) => (
                  <article key={document.id} className={`knowledgeCard ${document.id === selectedDocumentId ? "selected" : ""}`}>
                    <div className="knowledgeCardTop">
                      <div>
                        <span className={`statusPill ${document.status}`}>{document.status}</span>
                        <h3>{document.title}</h3>
                        <p>{document.sourceType}{document.sourceUrl ? ` / ${document.sourceUrl}` : ""}</p>
                      </div>
                      <time>{new Date(document.updatedAt).toLocaleDateString("th-TH")}</time>
                    </div>
                    <div className="knowledgeActions">
                      <button type="button" onClick={() => {
                        setSelectedDocumentId(document.id);
                        setDocumentForm(toDocumentForm(document));
                        setChunkForm(emptyChunkForm());
                      }}>Select</button>
                      <button type="button" onClick={() => setDocumentForm(toDocumentForm(document))}>Edit</button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </section>

          <section className="knowledgeWorkspace apiKnowledgeWorkspace">
            <aside className="knowledgeEditor">
              <div className="blockHeader">
                <Database size={17} />
                <h2>{chunkForm.id ? "Edit Chunk" : "Create Chunk"}</h2>
              </div>
              <label>Document<input value={selectedDocument?.title ?? ""} readOnly /></label>
              <label>Content<textarea value={chunkForm.content} onChange={(event) => setChunkForm({ ...chunkForm, content: event.target.value })} /></label>
              <label>Metadata JSON<textarea value={chunkForm.metadataText} onChange={(event) => setChunkForm({ ...chunkForm, metadataText: event.target.value })} placeholder='{"section":"faq"}' /></label>
              <div className="editorActions">
                <button type="button" onClick={saveChunkForm} disabled={saving || !selectedDocumentId}><Save size={15} /> Save Chunk</button>
                <button type="button" onClick={() => setChunkForm(emptyChunkForm())} disabled={!selectedDocumentId}><Plus size={15} /> New Chunk</button>
              </div>
            </aside>

            <section className="knowledgeListPanel">
              <div className="knowledgeFilters">
                <span>{selectedChunks.length} chunks in selected document</span>
              </div>
              <div className="knowledgeCards">
                {selectedChunks.length === 0 ? <p className="emptyState">No chunks returned by the API.</p> : selectedChunks.map((chunk) => (
                  <article key={chunk.id} className="knowledgeCard">
                    <div className="knowledgeCardTop">
                      <div>
                        <span className="statusPill active">chunk</span>
                        <h3>{chunk.content.slice(0, 72)}{chunk.content.length > 72 ? "..." : ""}</h3>
                        <p>{chunk.metadataJson ? JSON.stringify(chunk.metadataJson) : "metadata: null"}</p>
                      </div>
                      <time>{new Date(chunk.updatedAt).toLocaleDateString("th-TH")}</time>
                    </div>
                    <p className="knowledgeBody">{chunk.content}</p>
                    <div className="knowledgeActions">
                      <button type="button" onClick={() => setChunkForm(toChunkForm(chunk))}>Edit</button>
                      <button type="button" onClick={() => void removeChunk(chunk.id)} disabled={saving}><Trash2 size={14} /> Delete</button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </section>

          <section className="aiTestLab">
            <div className="blockHeader">
              <Link2 size={18} />
              <h2>Room AI Policy</h2>
            </div>
            <div className="testLabGrid">
              <div className="labInput">
                <label>Room<select value={selectedRoomId} onChange={(event) => void loadRoomPolicy(event.target.value)}>
                  {rooms.map((room) => <option key={room.id} value={room.id}>{room.platformLabel} / {room.accountName}</option>)}
                </select></label>
                <label>AI mode<select value={policyForm.aiMode} onChange={(event) => setPolicyForm({ ...policyForm, aiMode: event.target.value as AiMode })}>
                  {aiModes.map((mode) => <option key={mode} value={mode}>{mode}</option>)}
                </select></label>
                <label>Auto reply threshold<input type="number" min="0" max="1" step="0.01" value={policyForm.autoReplyThreshold} onChange={(event) => setPolicyForm({ ...policyForm, autoReplyThreshold: event.target.value })} /></label>
                <label>Draft threshold<input type="number" min="0" max="1" step="0.01" value={policyForm.draftThreshold} onChange={(event) => setPolicyForm({ ...policyForm, draftThreshold: event.target.value })} /></label>
                <label className="checkRow"><input type="checkbox" checked={policyForm.requireCitationsForAutoReply} onChange={(event) => setPolicyForm({ ...policyForm, requireCitationsForAutoReply: event.target.checked })} /> Require citations</label>
                <label className="checkRow"><input type="checkbox" checked={policyForm.handoffOnHighRisk} onChange={(event) => setPolicyForm({ ...policyForm, handoffOnHighRisk: event.target.checked })} /> Handoff high risk</label>
                <button type="button" onClick={savePolicy} disabled={saving || !selectedRoomId}><Save size={15} /> Save Policy</button>
              </div>
              <div className="labOutput">
                <h3>Linked knowledge bases</h3>
                <div className="policyKbList">
                  {knowledgeBases.map((knowledgeBase) => {
                    const checked = policyForm.knowledgeBaseIds.includes(knowledgeBase.id);
                    return (
                      <label key={knowledgeBase.id} className="checkRow">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(event) => {
                            const nextIds = event.target.checked
                              ? [...policyForm.knowledgeBaseIds, knowledgeBase.id]
                              : policyForm.knowledgeBaseIds.filter((id) => id !== knowledgeBase.id);
                            setPolicyForm({ ...policyForm, knowledgeBaseIds: Array.from(new Set(nextIds)) });
                          }}
                        />
                        {knowledgeBase.name}
                      </label>
                    );
                  })}
                </div>
                {roomPolicy && (
                  <dl className="aiGrid labResultGrid">
                    <div><dt>Room</dt><dd>{roomPolicy.roomId}</dd></div>
                    <div><dt>Mode</dt><dd>{roomPolicy.aiMode}</dd></div>
                    <div><dt>KB links</dt><dd>{roomPolicy.knowledgeBaseIds.length}</dd></div>
                  </dl>
                )}
              </div>
            </div>
          </section>

          <section id="ai-test-lab" className="aiTestLab">
            <div className="blockHeader">
              <TestTube2 size={18} />
              <h2>AI Test Lab</h2>
            </div>
            <div className="testLabGrid">
              <div className="labInput">
                <label>Customer question<textarea value={labQuestion} onChange={(event) => setLabQuestion(event.target.value)} /></label>
                <button type="button" onClick={runLab}><Sparkles size={15} /> Test AI</button>
              </div>
              <div className="labOutput">
                <h3>Matched knowledge</h3>
                {matchedForLab.length === 0 ? <p>No API chunks matched.</p> : matchedForLab.map((source) => (
                  <article key={source.id} className="sourceItem">
                    <span>{source.title}</span>
                    <small>{getKnowledgeCategoryLabel(source.category)} / {source.matchReason}</small>
                  </article>
                ))}
                {labResult && (
                  <dl className="aiGrid labResultGrid">
                    <div><dt>Intent</dt><dd>{labResult.intent}</dd></div>
                    <div><dt>Confidence</dt><dd>{Math.round(labResult.confidence * 100)}%</dd></div>
                    <div><dt>Summary</dt><dd>{labResult.summary}</dd></div>
                    <div><dt>Suggested reply</dt><dd>{labResult.reply}</dd></div>
                    <div><dt>Requires human</dt><dd>{labResult.requiresHuman ? "Yes" : "No"}</dd></div>
                  </dl>
                )}
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  );
}

function MockAiLab({
  items,
  labQuestion,
  labScope,
  labResult,
  matchedForLab,
  onQuestionChange,
  onScopeChange,
  onRun
}: {
  items: KnowledgeItem[];
  labQuestion: string;
  labScope: KnowledgeCategory | typeof allCategory;
  labResult: AIDecision | null;
  matchedForLab: NonNullable<AIDecision["matchedKnowledge"]>;
  onQuestionChange: (value: string) => void;
  onScopeChange: (value: KnowledgeCategory | typeof allCategory) => void;
  onRun: () => void;
}) {
  return (
    <section id="ai-test-lab" className="aiTestLab">
      <div className="blockHeader">
        <TestTube2 size={18} />
        <h2>AI Test Lab</h2>
      </div>
      <div className="testLabGrid">
        <div className="labInput">
          <label>Customer question<textarea value={labQuestion} onChange={(event) => onQuestionChange(event.target.value)} /></label>
          <label>Category scope<select value={labScope} onChange={(event) => onScopeChange(event.target.value as KnowledgeCategory | typeof allCategory)}>
            <option value={allCategory}>All active knowledge</option>
            {knowledgeCategories.map((category) => <option key={category.id} value={category.id}>{category.label}</option>)}
          </select></label>
          <button type="button" onClick={onRun}><Sparkles size={15} /> Test AI</button>
        </div>
        <div className="labOutput">
          <h3>Matched knowledge</h3>
          {matchedForLab.length === 0 ? <p>No active knowledge matched.</p> : matchedForLab.map((source) => (
            <article key={source.id} className="sourceItem">
              <span>{source.title}</span>
              <small>{getKnowledgeCategoryLabel(source.category)} / {source.matchReason}</small>
            </article>
          ))}
          {labResult && (
            <dl className="aiGrid labResultGrid">
              <div><dt>Intent</dt><dd>{labResult.intent}</dd></div>
              <div><dt>Confidence</dt><dd>{Math.round(labResult.confidence * 100)}%</dd></div>
              <div><dt>Summary</dt><dd>{labResult.summary}</dd></div>
              <div><dt>Suggested reply</dt><dd>{labResult.reply}</dd></div>
              <div><dt>Tags</dt><dd>{labResult.tags.join(", ")}</dd></div>
              <div><dt>Requires human</dt><dd>{labResult.requiresHuman ? "Yes" : "No"}</dd></div>
              <div><dt>Reason</dt><dd>{labResult.reason}</dd></div>
            </dl>
          )}
          <button type="button" onClick={() => void navigator.clipboard?.writeText(labResult?.reply ?? "")}><Copy size={15} /> Copy Suggested Reply</button>
        </div>
      </div>
      <span className="srOnly">{items.length}</span>
    </section>
  );
}

function toForm(item: KnowledgeItem): KnowledgeForm {
  return {
    id: item.id,
    title: item.title,
    category: item.category,
    body: item.body,
    status: item.status,
    tagsText: item.tags.join(", "),
    updatedAt: item.updatedAt
  };
}

function emptyKnowledgeBaseForm(): KnowledgeBaseForm {
  return { id: "", name: "", description: "", status: "draft" };
}

function toKnowledgeBaseForm(knowledgeBase: KnowledgeBase | null): KnowledgeBaseForm {
  if (!knowledgeBase) return emptyKnowledgeBaseForm();
  return {
    id: knowledgeBase.id,
    name: knowledgeBase.name,
    description: knowledgeBase.description,
    status: knowledgeBase.status
  };
}

function emptyDocumentForm(): DocumentForm {
  return { id: "", title: "", sourceType: "manual", sourceUrl: "", status: "draft" };
}

function toDocumentForm(document: KnowledgeDocument | null): DocumentForm {
  if (!document) return emptyDocumentForm();
  return {
    id: document.id,
    title: document.title,
    sourceType: document.sourceType,
    sourceUrl: document.sourceUrl ?? "",
    status: document.status
  };
}

function emptyChunkForm(): ChunkForm {
  return { id: "", content: "", metadataText: "" };
}

function toChunkForm(chunk: KnowledgeChunk): ChunkForm {
  return {
    id: chunk.id,
    content: chunk.content,
    metadataText: chunk.metadataJson ? JSON.stringify(chunk.metadataJson, null, 2) : ""
  };
}

function defaultPolicyForm(): PolicyForm {
  return {
    aiMode: "suggest",
    autoReplyThreshold: "0.85",
    draftThreshold: "0.6",
    requireCitationsForAutoReply: true,
    handoffOnHighRisk: true,
    knowledgeBaseIds: []
  };
}

function toPolicyForm(policy: RoomAiPolicy): PolicyForm {
  return {
    aiMode: policy.aiMode,
    autoReplyThreshold: String(policy.autoReplyThreshold),
    draftThreshold: String(policy.draftThreshold),
    requireCitationsForAutoReply: policy.requireCitationsForAutoReply,
    handoffOnHighRisk: policy.handoffOnHighRisk,
    knowledgeBaseIds: policy.knowledgeBaseIds
  };
}

function parseMetadata(value: string) {
  if (!value.trim()) return null;
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return new Error("Metadata must be valid JSON");
  }
}

function readableError(error: unknown) {
  return error instanceof Error ? error.message : "Unknown API error";
}
