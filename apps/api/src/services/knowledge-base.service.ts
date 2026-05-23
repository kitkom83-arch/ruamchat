import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import {
  CreateKnowledgeBaseRequest,
  CreateKnowledgeChunkRequest,
  CreateKnowledgeDocumentRequest,
  UpdateKnowledgeBaseRequest,
  UpdateKnowledgeChunkRequest,
  UpdateKnowledgeDocumentRequest
} from "@ai-omni/shared";
import { Prisma } from "@prisma/client";
import { PrismaService } from "./prisma.service.js";

@Injectable()
export class KnowledgeBaseService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async listKnowledgeBases(tenantId: string) {
    const knowledgeBases = await this.prisma.knowledgeBase.findMany({
      where: { tenantId },
      orderBy: { updatedAt: "desc" }
    });
    return knowledgeBases.map(mapKnowledgeBase);
  }

  async createKnowledgeBase(tenantId: string, request: CreateKnowledgeBaseRequest) {
    const knowledgeBase = await this.prisma.knowledgeBase.create({
      data: {
        tenantId,
        name: request.name.trim(),
        description: request.description?.trim() ?? "",
        status: request.status ?? "active"
      }
    });
    return mapKnowledgeBase(knowledgeBase);
  }

  async updateKnowledgeBase(tenantId: string, knowledgeBaseId: string, request: UpdateKnowledgeBaseRequest) {
    await this.ensureKnowledgeBase(tenantId, knowledgeBaseId);
    const knowledgeBase = await this.prisma.knowledgeBase.update({
      where: { id: knowledgeBaseId },
      data: {
        name: request.name?.trim(),
        description: request.description?.trim(),
        status: request.status
      }
    });
    return mapKnowledgeBase(knowledgeBase);
  }

  async deleteKnowledgeBase(tenantId: string, knowledgeBaseId: string) {
    await this.ensureKnowledgeBase(tenantId, knowledgeBaseId);
    const knowledgeBase = await this.prisma.knowledgeBase.update({
      where: { id: knowledgeBaseId },
      data: { status: "archived" }
    });
    return mapKnowledgeBase(knowledgeBase);
  }

  async listDocuments(tenantId: string, knowledgeBaseId: string) {
    await this.ensureKnowledgeBase(tenantId, knowledgeBaseId);
    const documents = await this.prisma.knowledgeDocument.findMany({
      where: { tenantId, knowledgeBaseId },
      orderBy: { updatedAt: "desc" }
    });
    return documents.map(mapKnowledgeDocument);
  }

  async createDocument(tenantId: string, knowledgeBaseId: string, request: CreateKnowledgeDocumentRequest) {
    await this.ensureKnowledgeBase(tenantId, knowledgeBaseId);
    const document = await this.prisma.knowledgeDocument.create({
      data: {
        tenantId,
        knowledgeBaseId,
        title: request.title.trim(),
        sourceType: request.sourceType ?? "manual",
        sourceUrl: request.sourceUrl?.trim() || null,
        status: request.status ?? "active"
      }
    });
    await this.refreshDocumentCount(tenantId, knowledgeBaseId);
    return mapKnowledgeDocument(document);
  }

  async updateDocument(tenantId: string, documentId: string, request: UpdateKnowledgeDocumentRequest) {
    const existing = await this.ensureDocument(tenantId, documentId);
    const document = await this.prisma.knowledgeDocument.update({
      where: { id: documentId },
      data: {
        title: request.title?.trim(),
        sourceType: request.sourceType,
        sourceUrl: request.sourceUrl === undefined ? undefined : request.sourceUrl?.trim() || null,
        status: request.status
      }
    });
    if (request.status !== undefined) await this.refreshDocumentCount(tenantId, existing.knowledgeBaseId);
    return mapKnowledgeDocument(document);
  }

  async deleteDocument(tenantId: string, documentId: string) {
    const existing = await this.ensureDocument(tenantId, documentId);
    const document = await this.prisma.knowledgeDocument.update({
      where: { id: documentId },
      data: { status: "archived" }
    });
    await this.refreshDocumentCount(tenantId, existing.knowledgeBaseId);
    return mapKnowledgeDocument(document);
  }

  async listChunks(tenantId: string, documentId: string) {
    await this.ensureDocument(tenantId, documentId);
    const chunks = await this.prisma.knowledgeChunk.findMany({
      where: { tenantId, documentId },
      orderBy: { createdAt: "asc" }
    });
    return chunks.map(mapKnowledgeChunk);
  }

  async createChunk(tenantId: string, documentId: string, request: CreateKnowledgeChunkRequest) {
    await this.ensureDocument(tenantId, documentId);
    const chunk = await this.prisma.knowledgeChunk.create({
      data: {
        tenantId,
        documentId,
        content: request.content.trim(),
        metadataJson: toInputJson(request.metadataJson)
      }
    });
    return mapKnowledgeChunk(chunk);
  }

  async updateChunk(tenantId: string, chunkId: string, request: UpdateKnowledgeChunkRequest) {
    await this.ensureChunk(tenantId, chunkId);
    const chunk = await this.prisma.knowledgeChunk.update({
      where: { id: chunkId },
      data: {
        content: request.content?.trim(),
        metadataJson: request.metadataJson === undefined ? undefined : toInputJson(request.metadataJson)
      }
    });
    return mapKnowledgeChunk(chunk);
  }

  async deleteChunk(tenantId: string, chunkId: string) {
    await this.ensureChunk(tenantId, chunkId);
    await this.prisma.knowledgeChunk.delete({ where: { id: chunkId } });
    return { id: chunkId, deleted: true };
  }

  private async ensureKnowledgeBase(tenantId: string, knowledgeBaseId: string) {
    const knowledgeBase = await this.prisma.knowledgeBase.findFirst({
      where: { id: knowledgeBaseId, tenantId }
    });
    if (!knowledgeBase) throw new NotFoundException("Knowledge base not found");
    return knowledgeBase;
  }

  private async ensureDocument(tenantId: string, documentId: string) {
    const document = await this.prisma.knowledgeDocument.findFirst({
      where: { id: documentId, tenantId }
    });
    if (!document) throw new NotFoundException("Knowledge document not found");
    return document;
  }

  private async ensureChunk(tenantId: string, chunkId: string) {
    const chunk = await this.prisma.knowledgeChunk.findFirst({
      where: { id: chunkId, tenantId }
    });
    if (!chunk) throw new NotFoundException("Knowledge chunk not found");
    return chunk;
  }

  private async refreshDocumentCount(tenantId: string, knowledgeBaseId: string) {
    const documentCount = await this.prisma.knowledgeDocument.count({
      where: {
        tenantId,
        knowledgeBaseId,
        status: { not: "archived" }
      }
    });
    await this.prisma.knowledgeBase.update({
      where: { id: knowledgeBaseId },
      data: { documentCount }
    });
  }
}

function mapKnowledgeBase(knowledgeBase: {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  status: string;
  documentCount: number;
  updatedAt: Date;
}) {
  return {
    id: knowledgeBase.id,
    tenantId: knowledgeBase.tenantId,
    name: knowledgeBase.name,
    description: knowledgeBase.description,
    status: normalizeStatus(knowledgeBase.status),
    documentCount: knowledgeBase.documentCount,
    updatedAt: knowledgeBase.updatedAt.toISOString()
  };
}

function mapKnowledgeDocument(document: {
  id: string;
  tenantId: string;
  knowledgeBaseId: string;
  title: string;
  sourceType: string;
  sourceUrl: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: document.id,
    tenantId: document.tenantId,
    knowledgeBaseId: document.knowledgeBaseId,
    title: document.title,
    sourceType: normalizeSourceType(document.sourceType),
    sourceUrl: document.sourceUrl,
    status: normalizeStatus(document.status),
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString()
  };
}

function mapKnowledgeChunk(chunk: {
  id: string;
  tenantId: string;
  documentId: string;
  content: string;
  metadataJson: Prisma.JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: chunk.id,
    tenantId: chunk.tenantId,
    documentId: chunk.documentId,
    content: chunk.content,
    metadataJson: fromStoredJson(chunk.metadataJson),
    createdAt: chunk.createdAt.toISOString(),
    updatedAt: chunk.updatedAt.toISOString()
  };
}

function normalizeStatus(status: string) {
  if (status === "draft" || status === "active" || status === "archived") return status;
  return "draft";
}

function normalizeSourceType(sourceType: string) {
  if (sourceType === "manual" || sourceType === "url" || sourceType === "file" || sourceType === "import") return sourceType;
  return "manual";
}

function toInputJson(value: unknown) {
  if (value === undefined) return undefined;
  if (value === null) return Prisma.JsonNull;
  return value as Prisma.InputJsonValue;
}

function fromStoredJson(value: Prisma.JsonValue | typeof Prisma.JsonNull | null) {
  if (value === null || value === Prisma.JsonNull) return null;
  return value;
}
