import { afterEach, describe, expect, it, vi } from "vitest";
import { loadAiCenterData } from "./ai-data";

const defaultTenantId = "00000000-0000-4000-8000-000000000001";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("AI Center data mode loader", () => {
  it("keeps mock mode local without API calls", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    const data = await loadAiCenterData("mock");

    expect(fetchMock).not.toHaveBeenCalled();
    expect(data.mode).toBe("mock");
    expect(data.knowledgeItems.length).toBeGreaterThan(0);
  });

  it("loads knowledge bases, documents, chunks, rooms, and room policy in API mode", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse([knowledgeBaseResponse("kb-api")]))
      .mockResolvedValueOnce(jsonResponse([knowledgeDocumentResponse("doc-api", "kb-api")]))
      .mockResolvedValueOnce(jsonResponse([knowledgeChunkResponse("chunk-api", "doc-api")]))
      .mockResolvedValueOnce(jsonResponse([roomResponse("room-webchat")]))
      .mockResolvedValueOnce(jsonResponse(roomAiPolicyResponse("room-webchat")));

    const data = await loadAiCenterData("api");

    expect(data.mode).toBe("api");
    expect(data.knowledgeBases[0]?.id).toBe("kb-api");
    expect(data.documents[0]?.id).toBe("doc-api");
    expect(data.chunks[0]?.id).toBe("chunk-api");
    expect(data.roomPolicy?.roomId).toBe("room-webchat");
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("/ai/knowledge-bases");
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain("/ai/knowledge-bases/kb-api/documents");
    expect(String(fetchMock.mock.calls[2]?.[0])).toContain("/ai/documents/doc-api/chunks");
    expect(String(fetchMock.mock.calls[4]?.[0])).toContain("/rooms/room-webchat/ai-policy");
    expectTenantHeaderForAll(fetchMock);
  });

  it("surfaces API errors without falling back to mock data", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "API down" }, 503));

    await expect(loadAiCenterData("api")).rejects.toThrow("API request failed (503): API down");
  });
});

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    text: async () => JSON.stringify(body)
  } as Response;
}

function expectTenantHeaderForAll(fetchMock: { mock: { calls: Array<[unknown, RequestInit?]> } }) {
  for (const [, init] of fetchMock.mock.calls) {
    expect(init).toEqual(expect.objectContaining({
      headers: expect.objectContaining({ "x-tenant-id": defaultTenantId })
    }));
  }
}

function knowledgeBaseResponse(id: string) {
  return {
    id,
    tenantId: "00000000-0000-4000-8000-000000000001",
    name: "API KB",
    description: "API knowledge base",
    status: "active",
    documentCount: 1,
    updatedAt: "2026-05-21T04:00:00.000Z"
  };
}

function knowledgeDocumentResponse(id: string, knowledgeBaseId: string) {
  return {
    id,
    tenantId: "00000000-0000-4000-8000-000000000001",
    knowledgeBaseId,
    title: "API Document",
    sourceType: "manual",
    sourceUrl: null,
    status: "active",
    createdAt: "2026-05-21T04:00:00.000Z",
    updatedAt: "2026-05-21T04:00:00.000Z"
  };
}

function knowledgeChunkResponse(id: string, documentId: string) {
  return {
    id,
    tenantId: "00000000-0000-4000-8000-000000000001",
    documentId,
    content: "API chunk content",
    metadataJson: { section: "demo" },
    createdAt: "2026-05-21T04:00:00.000Z",
    updatedAt: "2026-05-21T04:00:00.000Z"
  };
}

function roomResponse(id: string) {
  return {
    id,
    platform: "webchat",
    platformLabel: "Webchat",
    accountName: "Main Website",
    roomName: "Main Website",
    accent: "#0d9488",
    conversationCount: 1
  };
}

function roomAiPolicyResponse(roomId: string) {
  return {
    roomId,
    aiMode: "suggest",
    autoReplyThreshold: 0.85,
    draftThreshold: 0.6,
    requireCitationsForAutoReply: true,
    handoffOnHighRisk: true,
    knowledgeBaseIds: ["kb-api"],
    updatedAt: "2026-05-21T04:00:00.000Z"
  };
}
