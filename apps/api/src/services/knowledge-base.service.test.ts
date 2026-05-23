import { NotFoundException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import { KnowledgeBaseService } from "./knowledge-base.service.js";

const tenantId = "00000000-0000-4000-8000-000000000001";
const otherTenantId = "00000000-0000-4000-8000-000000009999";

function buildService() {
  const now = new Date("2026-05-21T04:00:00.000Z");
  const knowledgeBases: Array<Record<string, any>> = [
    {
      id: "kb-default",
      tenantId,
      name: "Default API KB",
      description: "Demo KB",
      status: "active",
      documentCount: 1,
      createdAt: now,
      updatedAt: now
    },
    {
      id: "kb-other",
      tenantId: otherTenantId,
      name: "Other tenant KB",
      description: "Hidden",
      status: "active",
      documentCount: 0,
      createdAt: now,
      updatedAt: now
    }
  ];
  const documents: Array<Record<string, any>> = [
    {
      id: "doc-pricing",
      tenantId,
      knowledgeBaseId: "kb-default",
      title: "Pricing FAQ",
      sourceType: "manual",
      sourceUrl: null,
      status: "active",
      createdAt: now,
      updatedAt: now
    }
  ];
  const chunks: Array<Record<string, any>> = [
    {
      id: "chunk-pricing",
      tenantId,
      documentId: "doc-pricing",
      content: "Pro package starts at 4,990 THB.",
      metadataJson: { section: "pricing" },
      createdAt: now,
      updatedAt: now
    }
  ];

  const prisma = {
    knowledgeBase: {
      findMany: vi.fn(async ({ where }) => knowledgeBases.filter((item) => item.tenantId === where.tenantId)),
      findFirst: vi.fn(async ({ where }) =>
        knowledgeBases.find((item) => item.id === where.id && item.tenantId === where.tenantId) ?? null
      ),
      create: vi.fn(async ({ data }) => {
        const saved = {
          id: `kb-${knowledgeBases.length + 1}`,
          documentCount: 0,
          createdAt: now,
          updatedAt: now,
          ...data
        };
        knowledgeBases.unshift(saved);
        return saved;
      }),
      update: vi.fn(async ({ where, data }) => {
        const index = knowledgeBases.findIndex((item) => item.id === where.id);
        const saved = { ...knowledgeBases[index], ...stripUndefined(data), updatedAt: now };
        knowledgeBases[index] = saved;
        return saved;
      })
    },
    knowledgeDocument: {
      findMany: vi.fn(async ({ where }) =>
        documents.filter((item) => item.tenantId === where.tenantId && item.knowledgeBaseId === where.knowledgeBaseId)
      ),
      findFirst: vi.fn(async ({ where }) =>
        documents.find((item) => item.id === where.id && item.tenantId === where.tenantId) ?? null
      ),
      create: vi.fn(async ({ data }) => {
        const saved = {
          id: `doc-${documents.length + 1}`,
          createdAt: now,
          updatedAt: now,
          ...data
        };
        documents.unshift(saved);
        return saved;
      }),
      update: vi.fn(async ({ where, data }) => {
        const index = documents.findIndex((item) => item.id === where.id);
        const saved = { ...documents[index], ...stripUndefined(data), updatedAt: now };
        documents[index] = saved;
        return saved;
      }),
      count: vi.fn(async ({ where }) =>
        documents.filter((item) =>
          item.tenantId === where.tenantId &&
          item.knowledgeBaseId === where.knowledgeBaseId &&
          item.status !== where.status.not
        ).length
      )
    },
    knowledgeChunk: {
      findMany: vi.fn(async ({ where }) =>
        chunks.filter((item) => item.tenantId === where.tenantId && item.documentId === where.documentId)
      ),
      findFirst: vi.fn(async ({ where }) =>
        chunks.find((item) => item.id === where.id && item.tenantId === where.tenantId) ?? null
      ),
      create: vi.fn(async ({ data }) => {
        const saved = {
          id: `chunk-${chunks.length + 1}`,
          metadataJson: null,
          createdAt: now,
          updatedAt: now,
          ...data
        };
        chunks.unshift(saved);
        return saved;
      }),
      update: vi.fn(async ({ where, data }) => {
        const index = chunks.findIndex((item) => item.id === where.id);
        const saved = { ...chunks[index], ...stripUndefined(data), updatedAt: now };
        chunks[index] = saved;
        return saved;
      }),
      delete: vi.fn(async ({ where }) => {
        const index = chunks.findIndex((item) => item.id === where.id);
        const [deleted] = chunks.splice(index, 1);
        return deleted;
      })
    }
  };

  return {
    service: new KnowledgeBaseService(prisma as never),
    prisma,
    knowledgeBases,
    documents,
    chunks
  };
}

describe("KnowledgeBaseService", () => {
  it("lists knowledge bases with tenant scoping", async () => {
    const { service } = buildService();

    const items = await service.listKnowledgeBases(tenantId);

    expect(items.map((item) => item.id)).toEqual(["kb-default"]);
    expect(items.every((item) => item.tenantId === tenantId)).toBe(true);
  });

  it("creates, updates, and archives a knowledge base", async () => {
    const { service, knowledgeBases } = buildService();

    const created = await service.createKnowledgeBase(tenantId, {
      name: "API Policy KB",
      description: "Policy snippets",
      status: "draft"
    });
    const updated = await service.updateKnowledgeBase(tenantId, created.id, {
      name: "API Policy KB v2",
      status: "active"
    });
    const archived = await service.deleteKnowledgeBase(tenantId, created.id);

    expect(created).toMatchObject({ tenantId, name: "API Policy KB", documentCount: 0 });
    expect(updated).toMatchObject({ name: "API Policy KB v2", status: "active" });
    expect(archived.status).toBe("archived");
    expect(knowledgeBases.find((item) => item.id === created.id)?.status).toBe("archived");
  });

  it("lists, creates, updates, and archives documents by knowledge base", async () => {
    const { service, knowledgeBases } = buildService();

    const listed = await service.listDocuments(tenantId, "kb-default");
    const created = await service.createDocument(tenantId, "kb-default", {
      title: "Support Policy",
      sourceType: "manual",
      sourceUrl: null,
      status: "active"
    });
    const updated = await service.updateDocument(tenantId, created.id, {
      title: "Support Policy v2",
      sourceType: "url",
      sourceUrl: "https://example.local/support"
    });
    const archived = await service.deleteDocument(tenantId, created.id);

    expect(listed.map((item) => item.id)).toEqual(["doc-pricing"]);
    expect(created).toMatchObject({ knowledgeBaseId: "kb-default", title: "Support Policy" });
    expect(updated).toMatchObject({ title: "Support Policy v2", sourceType: "url" });
    expect(archived.status).toBe("archived");
    expect(knowledgeBases.find((item) => item.id === "kb-default")?.documentCount).toBe(1);
  });

  it("lists, creates, updates, and deletes chunks by document", async () => {
    const { service, chunks } = buildService();

    const listed = await service.listChunks(tenantId, "doc-pricing");
    const created = await service.createChunk(tenantId, "doc-pricing", {
      content: "Refund requests require human handoff.",
      metadataJson: { section: "safety" }
    });
    const updated = await service.updateChunk(tenantId, created.id, {
      content: "Cancellation and refund requests require human handoff.",
      metadataJson: null
    });
    const deleted = await service.deleteChunk(tenantId, created.id);

    expect(listed.map((item) => item.id)).toEqual(["chunk-pricing"]);
    expect(created).toMatchObject({ documentId: "doc-pricing", metadataJson: { section: "safety" } });
    expect(updated).toMatchObject({ content: "Cancellation and refund requests require human handoff.", metadataJson: null });
    expect(deleted).toEqual({ id: created.id, deleted: true });
    expect(chunks.some((item) => item.id === created.id)).toBe(false);
  });

  it("returns readable 404s for unknown or cross-tenant resources", async () => {
    const { service } = buildService();

    await expect(service.updateKnowledgeBase(tenantId, "missing-kb", { name: "Nope" })).rejects.toMatchObject({
      constructor: NotFoundException,
      message: "Knowledge base not found"
    });
    await expect(service.listDocuments(tenantId, "kb-other")).rejects.toMatchObject({
      constructor: NotFoundException,
      message: "Knowledge base not found"
    });
    await expect(service.updateDocument(tenantId, "missing-doc", { title: "Nope" })).rejects.toMatchObject({
      constructor: NotFoundException,
      message: "Knowledge document not found"
    });
    await expect(service.updateChunk(tenantId, "missing-chunk", { content: "Nope" })).rejects.toMatchObject({
      constructor: NotFoundException,
      message: "Knowledge chunk not found"
    });
  });
});

function stripUndefined<T extends Record<string, any>>(value: T) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined));
}
