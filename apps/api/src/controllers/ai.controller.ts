import { BadRequestException, Body, Controller, Delete, Get, Headers, Inject, Param, Patch, Post } from "@nestjs/common";
import {
  aiSuggestionFeedbackRequestSchema,
  createKnowledgeBaseRequestSchema,
  createKnowledgeChunkRequestSchema,
  createKnowledgeDocumentRequestSchema,
  updateKnowledgeBaseRequestSchema,
  updateKnowledgeChunkRequestSchema,
  updateKnowledgeDocumentRequestSchema
} from "@ai-omni/shared";
import { KnowledgeBaseService } from "../services/knowledge-base.service.js";
import { OpenAiOrchestratorService } from "../services/openai-orchestrator.service.js";

const defaultTenantId = "00000000-0000-4000-8000-000000000001";

@Controller("ai")
export class AiController {
  constructor(
    @Inject(OpenAiOrchestratorService) private readonly ai: OpenAiOrchestratorService,
    @Inject(KnowledgeBaseService) private readonly knowledgeBases: KnowledgeBaseService
  ) {}

  @Get("knowledge-bases")
  async listKnowledgeBases(@Headers("x-tenant-id") tenant = defaultTenantId) {
    return this.knowledgeBases.listKnowledgeBases(tenant);
  }

  @Post("knowledge-bases")
  async createKnowledgeBase(@Body() body: unknown, @Headers("x-tenant-id") tenant = defaultTenantId) {
    return this.knowledgeBases.createKnowledgeBase(tenant, createKnowledgeBaseRequestSchema.parse(body));
  }

  @Patch("knowledge-bases/:knowledgeBaseId")
  async updateKnowledgeBase(
    @Param("knowledgeBaseId") knowledgeBaseId: string,
    @Body() body: unknown,
    @Headers("x-tenant-id") tenant = defaultTenantId
  ) {
    return this.knowledgeBases.updateKnowledgeBase(tenant, knowledgeBaseId, updateKnowledgeBaseRequestSchema.parse(body));
  }

  @Delete("knowledge-bases/:knowledgeBaseId")
  async deleteKnowledgeBase(@Param("knowledgeBaseId") knowledgeBaseId: string, @Headers("x-tenant-id") tenant = defaultTenantId) {
    return this.knowledgeBases.deleteKnowledgeBase(tenant, knowledgeBaseId);
  }

  @Get("knowledge-bases/:knowledgeBaseId/documents")
  async listDocuments(@Param("knowledgeBaseId") knowledgeBaseId: string, @Headers("x-tenant-id") tenant = defaultTenantId) {
    return this.knowledgeBases.listDocuments(tenant, knowledgeBaseId);
  }

  @Post("knowledge-bases/:knowledgeBaseId/documents")
  async createDocument(
    @Param("knowledgeBaseId") knowledgeBaseId: string,
    @Body() body: unknown,
    @Headers("x-tenant-id") tenant = defaultTenantId
  ) {
    return this.knowledgeBases.createDocument(tenant, knowledgeBaseId, createKnowledgeDocumentRequestSchema.parse(body));
  }

  @Patch("documents/:documentId")
  async updateDocument(@Param("documentId") documentId: string, @Body() body: unknown, @Headers("x-tenant-id") tenant = defaultTenantId) {
    return this.knowledgeBases.updateDocument(tenant, documentId, updateKnowledgeDocumentRequestSchema.parse(body));
  }

  @Delete("documents/:documentId")
  async deleteDocument(@Param("documentId") documentId: string, @Headers("x-tenant-id") tenant = defaultTenantId) {
    return this.knowledgeBases.deleteDocument(tenant, documentId);
  }

  @Get("documents/:documentId/chunks")
  async listChunks(@Param("documentId") documentId: string, @Headers("x-tenant-id") tenant = defaultTenantId) {
    return this.knowledgeBases.listChunks(tenant, documentId);
  }

  @Post("documents/:documentId/chunks")
  async createChunk(@Param("documentId") documentId: string, @Body() body: unknown, @Headers("x-tenant-id") tenant = defaultTenantId) {
    return this.knowledgeBases.createChunk(tenant, documentId, createKnowledgeChunkRequestSchema.parse(body));
  }

  @Patch("chunks/:chunkId")
  async updateChunk(@Param("chunkId") chunkId: string, @Body() body: unknown, @Headers("x-tenant-id") tenant = defaultTenantId) {
    return this.knowledgeBases.updateChunk(tenant, chunkId, updateKnowledgeChunkRequestSchema.parse(body));
  }

  @Delete("chunks/:chunkId")
  async deleteChunk(@Param("chunkId") chunkId: string, @Headers("x-tenant-id") tenant = defaultTenantId) {
    return this.knowledgeBases.deleteChunk(tenant, chunkId);
  }

  @Post("conversations/:conversationId/suggest")
  async suggest(@Param("conversationId") conversationId: string, @Headers("x-tenant-id") tenant: string | undefined) {
    return this.ai.suggest(requireTenantId(tenant), conversationId);
  }

  @Post("suggestions/:suggestionId/feedback")
  async feedback(
    @Param("suggestionId") suggestionId: string,
    @Body() body: unknown,
    @Headers("x-tenant-id") tenant: string | undefined,
    @Headers("x-user-id") userId?: string
  ) {
    return this.ai.markWrong(requireTenantId(tenant), suggestionId, userId, aiSuggestionFeedbackRequestSchema.parse(body ?? {}));
  }
}

function requireTenantId(tenant: string | undefined) {
  const tenantId = tenant?.trim();
  if (!tenantId) throw new BadRequestException("x-tenant-id is required");
  return tenantId;
}
