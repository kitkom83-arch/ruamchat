import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createApiFlow,
  deleteApiFlow,
  duplicateApiFlow,
  testRunApiFlow,
  updateApiFlow,
  updateApiFlowStatus
} from "./api-client";
import { createDefaultFlowStore, loadFlowBuilderData } from "./flow-data";

const defaultTenantId = "00000000-0000-4000-8000-000000000001";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Flow Builder API mode frontend", () => {
  it("keeps mock mode local without API calls", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("should not call API"));

    const data = await loadFlowBuilderData("mock");

    expect(data.mode).toBe("mock");
    expect(data.store.flows.length).toBeGreaterThan(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("loads flows and run history from API mode endpoints", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse([flowResponse("flow-api")]))
      .mockResolvedValueOnce(jsonResponse([flowRunResponse("run-api", "flow-api")]));

    const data = await loadFlowBuilderData("api");

    expect(data.mode).toBe("api");
    expect(data.store.flows[0]?.name).toBe("API Pricing Flow");
    expect(data.store.runs[0]?.status).toBe("dry_run");
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("/flows");
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain("/flows/flow-api/runs");
  });

  it("surfaces API errors instead of silently falling back to mock flow data", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "flows unavailable" }, 503));

    await expect(loadFlowBuilderData("api")).rejects.toThrow("API request failed (503): flows unavailable");
  });

  it("calls create, update, delete, duplicate, status, and dry-run endpoints", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(flowResponse("flow-created")))
      .mockResolvedValueOnce(jsonResponse({ ...flowResponse("flow-created"), name: "Updated Flow" }))
      .mockResolvedValueOnce(jsonResponse({ ...flowResponse("flow-created"), status: "archived" }))
      .mockResolvedValueOnce(jsonResponse(flowResponse("flow-copy", "API Pricing Flow Copy")))
      .mockResolvedValueOnce(jsonResponse({ ...flowResponse("flow-copy"), status: "active" }))
      .mockResolvedValueOnce(jsonResponse(testRunResponse("flow-copy")));

    const created = await createApiFlow(flowPayload("Created Flow"));
    const updated = await updateApiFlow(created.id, { name: "Updated Flow" });
    const archived = await deleteApiFlow(created.id);
    const duplicated = await duplicateApiFlow(created.id);
    const active = await updateApiFlowStatus(duplicated.id, { status: "active" });
    const dryRun = await testRunApiFlow(duplicated.id, {
      conversationId: "conv-web",
      contactId: null,
      message: "ขอราคา",
      platform: "webchat",
      roomId: "room-webchat",
      triggerType: "keyword",
      businessHours: true
    });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/flows", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/flows/flow-created", expect.objectContaining({ method: "PATCH" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/flows/flow-created", expect.objectContaining({ method: "DELETE" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/flows/flow-created/duplicate", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/flows/flow-copy/status", expect.objectContaining({ method: "PATCH" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/flows/flow-copy/test-run", expect.objectContaining({ method: "POST" }));
    expectTenantHeaderForAll(fetchMock);
    expect(updated.name).toBe("Updated Flow");
    expect(archived.status).toBe("archived");
    expect(active.status).toBe("active");
    expect(dryRun.flowRun.status).toBe("dry_run");
    expect(dryRun.state.actionResults[0]?.status).toBe("outbound_skipped_mock");
    const dryRunInit = fetchMock.mock.calls.find(([url]) => String(url).includes("/flows/flow-copy/test-run"))?.[1];
    expect(dryRunInit?.headers).toEqual(expect.objectContaining({ "x-tenant-id": defaultTenantId }));
  });

  it("does not mutate local flow run state when API dry-run fails", async () => {
    const store = createDefaultFlowStore();
    const runIdsBefore = store.runs.map((run) => run.id);
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "Conversation not found" }, 404));

    await expect(testRunApiFlow("flow-api", {
      conversationId: "missing",
      message: "ขอราคา",
      platform: "webchat",
      roomId: "room-webchat",
      triggerType: "keyword"
    })).rejects.toThrow("API request failed (404): Conversation not found");

    expect(store.runs.map((run) => run.id)).toEqual(runIdsBefore);
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

function flowPayload(name: string) {
  return {
    name,
    description: "Created through API client",
    status: "draft" as const,
    triggerType: "keyword" as const,
    trigger: {
      id: "trigger-api",
      type: "keyword" as const,
      keyword: "ราคา",
      matchMode: "contains" as const,
      caseSensitive: false
    },
    platformScope: ["webchat" as const],
    roomIds: [],
    nodes: [
      { id: "node-api-trigger", type: "trigger" as const, label: "Trigger", config: {}, position: { x: 80, y: 80 } },
      { id: "node-api-message", type: "send_message" as const, label: "Dry-run message", config: { message: "dry" }, position: { x: 300, y: 80 } },
      { id: "node-api-end", type: "end" as const, label: "End", config: {}, position: { x: 520, y: 80 } }
    ],
    edges: []
  };
}

function flowResponse(id: string, name = "API Pricing Flow") {
  return {
    id,
    name,
    description: "Persisted from API",
    status: "draft",
    triggerType: "keyword",
    trigger: {
      id: `trigger-${id}`,
      type: "keyword",
      keyword: "ราคา",
      matchMode: "contains",
      caseSensitive: false
    },
    platformScope: ["webchat"],
    roomIds: [],
    nodes: [
      { id: `node-${id}-trigger`, type: "trigger", label: "Trigger", config: {}, position: { x: 80, y: 80 } },
      { id: `node-${id}-message`, type: "send_message", label: "Dry-run message", config: { message: "dry" }, position: { x: 300, y: 80 } },
      { id: `node-${id}-end`, type: "end", label: "End", config: {}, position: { x: 520, y: 80 } }
    ],
    edges: [],
    createdAt: "2026-05-21T04:00:00.000Z",
    updatedAt: "2026-05-21T04:00:00.000Z"
  };
}

function flowRunResponse(id: string, flowId: string) {
  return {
    id,
    flowId,
    conversationId: "conv-web",
    contactId: null,
    status: "dry_run",
    startedAt: "2026-05-21T04:00:00.000Z",
    completedAt: "2026-05-21T04:00:01.000Z",
    resultSummary: "Dry run completed",
    steps: [{
      id: "step-api",
      nodeId: "node-api-trigger",
      nodeType: "trigger",
      status: "completed",
      input: {},
      output: { matched: true },
      createdAt: "2026-05-21T04:00:00.000Z"
    }]
  };
}

function testRunResponse(flowId: string) {
  return {
    triggerMatched: true,
    flowRun: flowRunResponse("run-created", flowId),
    state: {
      actionResults: [{
        actionType: "send_message",
        status: "outbound_skipped_mock",
        message: "send_message skipped in dry-run mode; no external outbound call was made.",
        metadata: { dryRun: true, externalCalls: 0 }
      }],
      auditLogsCreated: [],
      externalCalls: [],
      skippedExternalActions: ["send_message"]
    }
  };
}
