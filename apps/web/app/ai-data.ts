import {
  type CoreRoom,
  type DataMode,
  type KnowledgeBase,
  type KnowledgeChunk,
  type KnowledgeDocument,
  type KnowledgeItem,
  type RoomAiPolicy
} from "@ai-omni/shared";
import {
  getKnowledgeBases,
  getKnowledgeChunks,
  getKnowledgeDocuments,
  getRoomAiPolicy,
  getRooms
} from "./api-client";
import { getStoredKnowledgeItems } from "./ai-knowledge-store";

export type AiCenterMockData = {
  mode: "mock";
  knowledgeItems: KnowledgeItem[];
};

export type AiCenterApiData = {
  mode: "api";
  knowledgeBases: KnowledgeBase[];
  documents: KnowledgeDocument[];
  chunks: KnowledgeChunk[];
  rooms: CoreRoom[];
  roomPolicy: RoomAiPolicy | null;
};

export type AiCenterData = AiCenterMockData | AiCenterApiData;

export function loadAiCenterData(mode: "mock"): Promise<AiCenterMockData>;
export function loadAiCenterData(mode: "api"): Promise<AiCenterApiData>;
export function loadAiCenterData(mode: DataMode): Promise<AiCenterData>;
export async function loadAiCenterData(mode: DataMode): Promise<AiCenterData> {
  if (mode === "mock") {
    return {
      mode,
      knowledgeItems: getStoredKnowledgeItems()
    };
  }

  const knowledgeBases = await getKnowledgeBases();
  const documents = (await Promise.all(knowledgeBases.map((knowledgeBase) => getKnowledgeDocuments(knowledgeBase.id)))).flat();
  const chunks = (await Promise.all(documents.map((document) => getKnowledgeChunks(document.id)))).flat();
  const rooms = await getRooms();
  const roomPolicy = rooms[0] ? await getRoomAiPolicy(rooms[0].id) : null;

  return {
    mode,
    knowledgeBases,
    documents,
    chunks,
    rooms,
    roomPolicy
  };
}

export function getDocumentsForKnowledgeBase(documents: KnowledgeDocument[], knowledgeBaseId: string) {
  return documents.filter((document) => document.knowledgeBaseId === knowledgeBaseId);
}

export function getChunksForDocument(chunks: KnowledgeChunk[], documentId: string) {
  return chunks.filter((chunk) => chunk.documentId === documentId);
}

export function buildKnowledgeItemsFromApi(
  knowledgeBases: KnowledgeBase[],
  documents: KnowledgeDocument[],
  chunks: KnowledgeChunk[]
): KnowledgeItem[] {
  const chunkTextByDocument = new Map<string, string[]>();
  chunks.forEach((chunk) => {
    const current = chunkTextByDocument.get(chunk.documentId) ?? [];
    current.push(chunk.content);
    chunkTextByDocument.set(chunk.documentId, current);
  });

  const generated = documents.map((document) => {
    const knowledgeBase = knowledgeBases.find((item) => item.id === document.knowledgeBaseId);
    const chunkText = chunkTextByDocument.get(document.id)?.join("\n\n") ?? "";
    return {
      id: document.id,
      title: document.title,
      category: "faq" as const,
      body: chunkText || `${knowledgeBase?.name ?? "Knowledge base"} document has no chunks yet.`,
      status: document.status,
      tags: [document.sourceType, knowledgeBase?.status ?? "active"].filter(Boolean),
      updatedAt: document.updatedAt
    };
  });

  return generated;
}
