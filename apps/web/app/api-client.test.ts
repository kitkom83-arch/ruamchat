import { afterEach, describe, expect, it, vi } from "vitest";
import {
  assignConversation,
  closeConversation,
  completeConversationWorkflowTask,
  createContact,
  createConversationNote,
  createConversationWorkflowTask,
  createKnowledgeBase,
  createKnowledgeChunk,
  createKnowledgeDocument,
  createProviderWebhookSandboxEvent,
  bulkReviewProviderWebhookUnmatchedInbound,
  deleteKnowledgeBase,
  createWebchatMessage,
  deleteKnowledgeChunk,
  deleteKnowledgeDocument,
  getConversationAuditLogs,
  getProviderReadiness,
  getProviderWebhookEvents,
  getProviderWebhookReviewAlerts,
  getProviderWebhookReviewMetrics,
  getProviderWebhookUnmatchedInbound,
  getProviderWebhookUnmatchedInboundCandidates,
  getProviderWebhookUnmatchedInboundDiagnostics,
  getProviderWebhookUnmatchedInboundExport,
  getProviderWebhookUnmatchedInboundHistory,
  linkProviderWebhookUnmatchedInboundConversation,
  reviewProviderWebhookUnmatchedInbound,
  getKnowledgeBases,
  getKnowledgeChunks,
  getKnowledgeDocuments,
  getConversationNotes,
  getConversationStatusHistory,
  getConversationTasks,
  getConversations,
  getContact,
  getContactConversations,
  getContactIdentities,
  getContacts,
  getCustomer360,
  getSettingsChannel,
  getSettingsCannedReply,
  getSettingsCannedReplies,
  getSettingsChannels,
  getSettingsSlaPolicies,
  getSettingsSlaPolicy,
  getSettingsTeam,
  getSettingsTeamMember,
  getTaskDashboard,
  getRoomAiPolicy,
  getRooms,
  linkContactIdentity,
  returnConversationToAi,
  sendAgentMessage,
  setConversationFollowUp,
  setPrimaryContactIdentity,
  markAiSuggestionWrong,
  suggestAiReply,
  takeOverConversation,
  unlinkContactIdentity,
  updateBroadcastConsent,
  updateContact,
  updateCustomer360Consent,
  updateCustomer360Profile,
  updateConversationPriority,
  updateConversationReadState,
  updateConversationSla,
  updateConversationStatus,
  updateConversationWorkflowTask,
  updateKnowledgeBase,
  updateKnowledgeChunk,
  updateKnowledgeDocument,
  updateRoomAiPolicy,
  updateSettingsChannel,
  updateSettingsCannedReply,
  updateSettingsSlaPolicy,
  updateSettingsTeamMember
} from "./api-client";

const defaultTenantId = "00000000-0000-4000-8000-000000000001";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("frontend API client", () => {
  it("maps API mode calls to the backend client endpoints", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse([
      {
        id: "room-webchat",
        platform: "webchat",
        platformLabel: "Webchat",
        accountName: "Main Website",
        roomName: "Main Website",
        accent: "#0d9488",
        conversationCount: 1
      }
    ]));

    const rooms = await getRooms();

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/rooms", expect.any(Object));
    expectTenantHeaderForAll(fetchMock);
    expect(rooms[0]?.accountName).toBe("Main Website");
  });

  it("fetches provider readiness through the tenant-scoped API client without exposing secrets", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse(providerReadinessResponse()));

    const readiness = await getProviderReadiness();

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/health/readiness", expect.any(Object));
    expectTenantHeaderForAll(fetchMock);
    expect(readiness.realOutboundEnabled).toBe(false);
    expect(readiness.externalCalls).toBe(0);
    expect(readiness.allowlistCount).toBe(2);
    expect(readiness.providers.map((provider) => provider.name)).toEqual(["line", "telegram", "facebook", "instagram"]);
    expect(readiness.providers.every((provider) => !("allowlistCount" in provider))).toBe(true);
    expect(JSON.stringify(readiness)).not.toContain("U-raw-provider-test");
    expect(JSON.stringify(readiness)).not.toMatch(/token|secret|payloadJson|providerRaw|rawPayload/i);
  });

  it("surfaces provider readiness API errors instead of returning local readiness", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "readiness unavailable" }, 503));

    await expect(getProviderReadiness()).rejects.toThrow("API request failed (503): readiness unavailable");
  });

  it("sends x-tenant-id for provider webhook event, unmatched list, and sandbox event create", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse([providerWebhookEventResponse("provider-webhook-event-1")]))
      .mockResolvedValueOnce(jsonResponse(providerWebhookUnmatchedInboundPageResponse([providerWebhookUnmatchedInboundResponse("provider-webhook-unmatched-1")])))
      .mockResolvedValueOnce(jsonResponse(providerWebhookEventResponse("provider-webhook-event-2", "telegram")))
      .mockResolvedValueOnce(jsonResponse({ ...providerWebhookUnmatchedInboundResponse("provider-webhook-unmatched-1"), unmatchedStatus: "reviewed", reviewStatus: "reviewed" }))
      .mockResolvedValueOnce(jsonResponse({ ...providerWebhookUnmatchedInboundResponse("provider-webhook-unmatched-1"), unmatchedStatus: "linked", reviewStatus: "linked", linkStatus: "linked", linkedConversationId: "conversation-safe-internal" }));

    const events = await getProviderWebhookEvents();
    const unmatched = await getProviderWebhookUnmatchedInbound();
    const created = await createProviderWebhookSandboxEvent({
      provider: "telegram",
      channel: "telegram",
      eventType: "webhook.verified",
      mode: "dry_run",
      eventId: "safe-event-id-1",
      timestamp: "2026-05-31T00:00:00.000Z",
      signature: "sha256=sensitive-sample-b",
      payload: {
        updateId: "safe-update",
        token: "sensitive-sample-a"
      }
    });
    const reviewed = await reviewProviderWebhookUnmatchedInbound("provider-webhook-unmatched-1", { status: "reviewed" });
    const linked = await linkProviderWebhookUnmatchedInboundConversation("provider-webhook-unmatched-1", {
      conversationId: "conversation-safe-internal",
      actionMode: "link-only"
    });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/events", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/unmatched-inbound?limit=10&offset=0&sortBy=receivedAt&sortOrder=desc", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/sandbox-events", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/unmatched-inbound/provider-webhook-unmatched-1/review", expect.objectContaining({ method: "PATCH" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/unmatched-inbound/provider-webhook-unmatched-1/link-conversation", expect.objectContaining({ method: "POST" }));
    expect(JSON.parse(String(fetchMock.mock.calls[2]?.[1]?.body))).toMatchObject({
      provider: "telegram",
      channel: "telegram",
      eventType: "webhook.verified",
      mode: "dry_run",
      eventId: "safe-event-id-1",
      signature: "sha256=sensitive-sample-b"
    });
    expect(JSON.parse(String(fetchMock.mock.calls[3]?.[1]?.body))).toEqual({ status: "reviewed" });
    expect(JSON.parse(String(fetchMock.mock.calls[4]?.[1]?.body))).toEqual({
      conversationId: "conversation-safe-internal",
      actionMode: "link-only"
    });
    expectTenantHeaderForAll(fetchMock);
    expect(events[0]?.externalCalls).toBe(0);
    expect(unmatched.items[0]).toMatchObject({
      id: "provider-webhook-unmatched-1",
      tenantId: defaultTenantId,
      conversationLookupStatus: "not-found",
      unmatchedStatus: "review-needed",
      externalCalls: 0
    });
    expect(unmatched.pagination).toMatchObject({ totalCount: 1, limit: 10, offset: 0 });
    expect(created.provider).toBe("telegram");
    expect(reviewed.reviewStatus).toBe("reviewed");
    expect(linked.linkStatus).toBe("linked");
    expect(JSON.stringify({ events, unmatched, created, reviewed, linked })).not.toContain("sensitive-sample-a");
    expect(JSON.stringify({ events, unmatched, created, reviewed, linked })).not.toMatch(/token|secret|authorization|cookie|rawPayload|providerRaw|payloadJson|replyToken/i);
  });

  it("surfaces provider webhook event API errors without local fallback", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "webhook events unavailable" }, 503));

    await expect(getProviderWebhookEvents()).rejects.toThrow("API request failed (503): webhook events unavailable");
  });

  it("surfaces unmatched inbound API errors without local fallback", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "unmatched unavailable" }, 503));

    await expect(getProviderWebhookUnmatchedInbound()).rejects.toThrow("API request failed (503): unmatched unavailable");
  });

  it("sends safe unmatched filters and x-tenant-id for candidate lookup", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(providerWebhookUnmatchedInboundPageResponse([providerWebhookUnmatchedInboundResponse("provider-webhook-unmatched-1")])))
      .mockResolvedValueOnce(jsonResponse([providerWebhookCandidateResponse("conversation-safe-internal")]));

    const unmatched = await getProviderWebhookUnmatchedInbound({
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      limit: 10,
      offset: 20,
      sortBy: "receivedAt",
      sortOrder: "asc"
    });
    const candidates = await getProviderWebhookUnmatchedInboundCandidates("provider-webhook-unmatched-1");

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/unmatched-inbound?provider=line&reviewStatus=pending&linkStatus=none&limit=10&offset=20&sortBy=receivedAt&sortOrder=asc", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/unmatched-inbound/provider-webhook-unmatched-1/candidates", expect.any(Object));
    expectTenantHeaderForAll(fetchMock);
    expect(unmatched.items[0]?.id).toBe("provider-webhook-unmatched-1");
    expect(candidates[0]).toMatchObject({
      conversationId: "conversation-safe-internal",
      platform: "line",
      channelAccountId: "sandbox:line",
      externalCalls: 0
    });
    expect(JSON.stringify(candidates)).not.toMatch(/token|secret|authorization|cookie|rawPayload|providerRaw|payloadJson|replyToken|raw-room|raw-sender/i);
  });

  it("sends x-tenant-id and safe body for bulk unmatched review", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({
        reviewStatus: "reviewed",
        results: [
          {
            id: "provider-webhook-unmatched-1",
            ok: true,
            resultStatus: "updated",
            reviewStatus: "reviewed",
            unmatchedStatus: "reviewed",
            error: null,
            externalCalls: 0
          }
        ],
        summary: {
          requestedCount: 1,
          dedupedCount: 1,
          successCount: 1,
          errorCount: 0,
          updatedCount: 1,
          alreadyAppliedCount: 0
        },
        externalCalls: 0
      }));

    const result = await bulkReviewProviderWebhookUnmatchedInbound({
      ids: ["provider-webhook-unmatched-1"],
      reviewStatus: "reviewed",
      reason: "safe bulk review"
    });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/unmatched-inbound/bulk-review", expect.objectContaining({ method: "PATCH" }));
    expectTenantHeaderForAll(fetchMock);
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toEqual({
      ids: ["provider-webhook-unmatched-1"],
      reviewStatus: "reviewed",
      reason: "safe bulk review"
    });
    expect(result.summary.successCount).toBe(1);
    expect(result.results[0]).toMatchObject({
      id: "provider-webhook-unmatched-1",
      resultStatus: "updated",
      externalCalls: 0
    });
    expect(JSON.stringify(result)).not.toMatch(/token|secret|authorization|cookie|rawPayload|providerRaw|payloadJson|replyToken|raw-room|raw-sender/i);
  });

  it("sends x-tenant-id for unmatched history and queue export with safe filters", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(providerWebhookHistoryResponse("provider-webhook-unmatched-1")))
      .mockResolvedValueOnce(jsonResponse(providerWebhookExportResponse([providerWebhookUnmatchedInboundResponse("provider-webhook-unmatched-1")], "csv")));

    const history = await getProviderWebhookUnmatchedInboundHistory("provider-webhook-unmatched-1");
    const exported = await getProviderWebhookUnmatchedInboundExport({
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      eventType: "message.created",
      receivedAtFrom: "2026-05-31T00:00:00.000Z",
      offset: 10,
      sortBy: "receivedAt",
      sortOrder: "asc",
      format: "csv",
      limit: 25
    });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/unmatched-inbound/provider-webhook-unmatched-1/history", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/unmatched-inbound/export?provider=line&reviewStatus=pending&linkStatus=none&eventType=message.created&receivedAtFrom=2026-05-31T00%3A00%3A00.000Z&offset=10&sortBy=receivedAt&sortOrder=asc&format=csv&limit=25", expect.any(Object));
    expectTenantHeaderForAll(fetchMock);
    expect(history.entries.map((entry) => entry.action)).toEqual(expect.arrayContaining(["inbound_received", "unmatched_queued"]));
    expect(exported).toMatchObject({
      format: "csv",
      exportedCount: 1,
      exportMaxLimit: 500,
      externalCalls: 0
    });
    expect(exported.rows[0]).toMatchObject({
      id: "provider-webhook-unmatched-1",
      channelAccountId: "sandbox:line",
      safeRoomLabel: "line room digest saferoomdige",
      roomKeyDigest: "sha256:saferoomdigest",
      externalCalls: 0
    });
    expect(JSON.stringify({ history, exported })).not.toMatch(/token|secret|authorization|cookie|rawPayload|providerRaw|payloadJson|replyToken|raw-room|raw-sender|raw room|raw sender/i);
  });

  it("sends x-tenant-id and safe filters for review metrics and item diagnostics", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(providerWebhookReviewMetricsResponse()))
      .mockResolvedValueOnce(jsonResponse(providerWebhookDiagnosticsResponse("provider-webhook-unmatched-1")));

    const metrics = await getProviderWebhookReviewMetrics({
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      eventType: "message.created",
      receivedAtFrom: "2026-05-31T00:00:00.000Z",
      receivedAtTo: "2026-06-01T00:00:00.000Z",
      limit: 10,
      offset: 0,
      sortBy: "receivedAt",
      sortOrder: "desc"
    } as Parameters<typeof getProviderWebhookReviewMetrics>[0]);
    const diagnostics = await getProviderWebhookUnmatchedInboundDiagnostics("provider-webhook-unmatched-1");

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/review-metrics?provider=line&reviewStatus=pending&linkStatus=none&unmatchedStatus=review-needed&eventType=message.created&receivedAtFrom=2026-05-31T00%3A00%3A00.000Z&receivedAtTo=2026-06-01T00%3A00%3A00.000Z", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/unmatched-inbound/provider-webhook-unmatched-1/diagnostics", expect.any(Object));
    expectTenantHeaderForAll(fetchMock);
    expect(metrics).toMatchObject({
      totalEvents: 1,
      openUnmatched: 1,
      externalCalls: 0
    });
    expect(metrics.appliedFilters).toMatchObject({
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      eventType: "message.created"
    });
    expect(diagnostics).toMatchObject({
      unmatchedId: "provider-webhook-unmatched-1",
      provider: "line",
      platform: "line",
      channelAccountId: "sandbox:line",
      safeRoomLabel: "line room digest saferoomdige",
      roomKeyDigest: "sha256:saferoomdigest",
      candidateLookupAvailable: true,
      externalCalls: 0
    });
    expect(JSON.stringify({ metrics, diagnostics })).not.toMatch(/token|secret|authorization|cookie|rawPayload|providerRaw|payloadJson|replyToken|raw-room|raw-sender|raw room|raw sender|senderId|roomId/i);
  });

  it("sends x-tenant-id and safe filters for review alerts", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(providerWebhookReviewAlertsResponse()));

    const alerts = await getProviderWebhookReviewAlerts({
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      eventType: "message.created",
      receivedAtFrom: "2026-05-31T00:00:00.000Z",
      receivedAtTo: "2026-06-01T00:00:00.000Z",
      severity: "critical"
    });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/review-alerts?provider=line&reviewStatus=pending&linkStatus=none&unmatchedStatus=review-needed&eventType=message.created&receivedAtFrom=2026-05-31T00%3A00%3A00.000Z&receivedAtTo=2026-06-01T00%3A00%3A00.000Z&severity=critical", expect.any(Object));
    expectTenantHeaderForAll(fetchMock);
    expect(alerts).toMatchObject({
      totalAlerts: 1,
      criticalCount: 1,
      staleOpenCount: 1,
      overSlaCount: 1,
      externalCalls: 0
    });
    expect(alerts.appliedFilters).toMatchObject({
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      eventType: "message.created",
      severity: "critical"
    });
    expect(alerts.alertItems[0]).toMatchObject({
      provider: "line",
      platform: "line",
      channelAccountId: "sandbox:line",
      safeRoomLabel: "line room digest saferoomdige",
      roomKeyDigest: "sha256:saferoomdigest",
      severity: "critical",
      diagnosticsAvailable: true,
      historyAvailable: true,
      externalCalls: 0
    });
    expect(JSON.stringify(alerts)).not.toMatch(/token|secret|authorization|cookie|rawPayload|providerRaw|payloadJson|replyToken|raw-room|raw-sender|raw room|raw sender|senderId|roomId/i);
  });

  it("surfaces unmatched history and export API errors without local fallback", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "history unavailable" }, 503));
    await expect(getProviderWebhookUnmatchedInboundHistory("provider-webhook-unmatched-1"))
      .rejects.toThrow("API request failed (503): history unavailable");

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "export unavailable" }, 503));
    await expect(getProviderWebhookUnmatchedInboundExport({ format: "json" }))
      .rejects.toThrow("API request failed (503): export unavailable");
  });

  it("surfaces review metrics and diagnostics API errors without local fallback", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "metrics unavailable" }, 503));
    await expect(getProviderWebhookReviewMetrics({ provider: "line" }))
      .rejects.toThrow("API request failed (503): metrics unavailable");

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "alerts unavailable" }, 503));
    await expect(getProviderWebhookReviewAlerts({ provider: "line" }))
      .rejects.toThrow("API request failed (503): alerts unavailable");

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "diagnostics unavailable" }, 503));
    await expect(getProviderWebhookUnmatchedInboundDiagnostics("provider-webhook-unmatched-1"))
      .rejects.toThrow("API request failed (503): diagnostics unavailable");
  });


  it("validates conversations and keeps room filters explicit", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse([
      {
        id: "conv-web",
        roomId: "room-webchat",
        tab: "human",
        platform: "webchat",
        platformLabel: "Webchat",
        channelAccountId: "00000000-0000-4000-8000-000000000020",
        accountName: "Main Website",
        customerName: "Visitor Demo",
        customerEmail: "-",
        customerPhone: "-",
        lastMessage: "hello",
        lastMessageAt: "2026-05-21T04:00:00.000Z",
        lastMessageTime: "11:00",
        unreadCount: 1,
        assignedAgent: null,
        tags: [],
        aiStatus: "Need Human",
        priority: "medium",
        status: "open",
        unreplied: true
      }
    ]));

    const conversations = await getConversations("room-webchat", { tab: "human", filter: "need_human", search: "hello" });

    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("/rooms/room-webchat/conversations?tab=human&filter=need_human&search=hello");
    expectTenantHeaderForAll(fetchMock);
    expect(conversations[0]?.roomId).toBe("room-webchat");
  });

  it("serializes API-mode inbox search filters and pagination with the tenant header", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse([
      conversationResponse("conv-web")
    ]));

    await getConversations("room-webchat", {
      tab: "human",
      filter: "all",
      search: "pricing question",
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      status: "open",
      priority: "high",
      unread: "unread",
      slaStatus: "warning",
      sort: "updated_desc",
      limit: 25,
      offset: 50
    });

    const url = new URL(String(fetchMock.mock.calls[0]?.[0]));
    expect(url.pathname).toBe("/rooms/room-webchat/conversations");
    expect(url.searchParams.get("tab")).toBe("human");
    expect(url.searchParams.get("filter")).toBe("all");
    expect(url.searchParams.get("search")).toBe("pricing question");
    expect(url.searchParams.get("platform")).toBe("webchat");
    expect(url.searchParams.get("channelAccountId")).toBe("00000000-0000-4000-8000-000000000020");
    expect(url.searchParams.get("status")).toBe("open");
    expect(url.searchParams.get("priority")).toBe("high");
    expect(url.searchParams.get("unread")).toBe("true");
    expect(url.searchParams.get("slaStatus")).toBe("warning");
    expect(url.searchParams.get("sort")).toBe("updated_desc");
    expect(url.searchParams.get("limit")).toBe("25");
    expect(url.searchParams.get("offset")).toBe("50");
    expectTenantHeaderForAll(fetchMock);
  });

  it("surfaces inbox search API failures instead of returning mock conversations", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "search unavailable" }, 503));

    await expect(getConversations("room-webchat", { search: "impossible" }))
      .rejects.toThrow("API request failed (503): search unavailable");
  });

  it("creates sent_mock agent replies through the API", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({
      id: "msg-agent",
      conversationId: "conv-web",
      direction: "outbound",
      senderType: "agent",
      text: "รับเรื่องแล้วครับ",
      createdAt: "2026-05-21T04:01:00.000Z",
      platformMessageId: "internal-1",
      deliveryStatus: "queued_mock"
    }));

    const message = await sendAgentMessage("conv-web", "รับเรื่องแล้วครับ");

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/conv-web/messages", expect.objectContaining({ method: "POST" }));
    const init = fetchMock.mock.calls[0]?.[1];
    expect(init?.headers).toEqual(expect.objectContaining({ "x-tenant-id": defaultTenantId }));
    expect(JSON.parse(String(init?.body))).toEqual({ text: "รับเรื่องแล้วครับ", senderType: "agent" });
    expect(message.deliveryStatus).toBe("queued_mock");
    expectTenantHeaderForAll(fetchMock);
  });

  it("fetches Customer 360 data for API mode without using mock fallback", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse(customer360Response("conv-web", "contact-api")));

    const customer360 = await getCustomer360("conv-web");

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/conv-web/customer-360", expect.any(Object));
    expectTenantHeaderForAll(fetchMock);
    expect(customer360.contact.id).toBe("contact-api");
    expect(customer360.identities[0]?.externalUserId).toBe("visitor-api");
    expect(customer360.recentConversations[0]).toMatchObject({
      tenantId: defaultTenantId,
      id: "conv-web",
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      roomId: "room-webchat"
    });
    expect(customer360.notes[0]).toMatchObject({
      tenantId: defaultTenantId,
      conversationId: "conv-web",
      contactId: "contact-api",
      customerId: "contact-api",
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      roomId: "room-webchat",
      externalCalls: 0
    });
    expect(customer360.tasks[0]).toMatchObject({
      conversationId: "conv-web",
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      roomId: "room-webchat",
      externalCalls: 0
    });
    expect(customer360.broadcastHistorySummary.rows[0]).toMatchObject({
      campaignName: "Persisted campaign",
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      roomId: "room-webchat",
      externalCalls: 0
    });
    expect(JSON.stringify(customer360.broadcastHistorySummary)).not.toMatch(/accessToken|webhookSecret|botToken|apiKey|Bearer|sk-/i);
  });

  it("surfaces Customer 360 API errors instead of silently returning mock data", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "Conversation not found" }, 404));

    await expect(getCustomer360("missing")).rejects.toThrow("API request failed (404): Conversation not found");
  });

  it("sends x-tenant-id for Customer 360 profile and tag update calls", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({
      ...customer360Response("conv-web", "contact-api"),
      contact: {
        ...contactResponse("contact-api"),
        leadStatus: "qualified",
        tags: ["vip"]
      },
      identities: contactResponse("contact-api").identities
    }));

    const customer360 = await updateCustomer360Profile("conv-web", {
      contactId: "contact-api",
      leadStatus: "qualified",
      tags: ["vip"]
    });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/conv-web/customer-360", expect.objectContaining({ method: "PATCH" }));
    const init = fetchMock.mock.calls[0]?.[1];
    expect(init?.headers).toEqual(expect.objectContaining({ "x-tenant-id": defaultTenantId }));
    expect(JSON.parse(String(init?.body))).toEqual({
      contactId: "contact-api",
      leadStatus: "qualified",
      tags: ["vip"]
    });
    expect(customer360.contact.leadStatus).toBe("qualified");
    expect(customer360.contact.tags).toEqual(["vip"]);
    expectTenantHeaderForAll(fetchMock);
  });

  it("does not fake Customer 360 profile state when the API update fails", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "Profile unavailable" }, 503));

    await expect(updateCustomer360Profile("conv-web", {
      contactId: "contact-api",
      tags: ["vip"]
    })).rejects.toThrow("API request failed (503): Profile unavailable");

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("sends x-tenant-id for Customer 360 consent update calls", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({
      ...customer360Response("conv-web", "contact-api"),
      contact: {
        ...contactResponse("contact-api"),
        optOutBroadcast: true,
        suppressedReason: "customer_requested"
      },
      broadcastHistorySummary: {
        ...customer360Response("conv-web", "contact-api").broadcastHistorySummary,
        optOut: true,
        suppressedReason: "customer_requested"
      }
    }));

    const customer360 = await updateCustomer360Consent("conv-web", {
      contactId: "contact-api",
      optOut: true
    });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/conv-web/customer-360/consent", expect.objectContaining({ method: "PATCH" }));
    const init = fetchMock.mock.calls[0]?.[1];
    expect(init?.headers).toEqual(expect.objectContaining({ "x-tenant-id": defaultTenantId }));
    expect(JSON.parse(String(init?.body))).toEqual({
      contactId: "contact-api",
      optOut: true
    });
    expect(customer360.contact.optOutBroadcast).toBe(true);
    expect(customer360.broadcastHistorySummary.optOut).toBe(true);
    expectTenantHeaderForAll(fetchMock);
  });

  it("does not fake Customer 360 consent state when the API update fails", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "Consent unavailable" }, 503));

    await expect(updateCustomer360Consent("conv-web", {
      contactId: "contact-api",
      optOut: true
    })).rejects.toThrow("API request failed (503): Consent unavailable");

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("refetches Customer 360 per selected conversation id", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(customer360Response("conv-web", "contact-web")))
      .mockResolvedValueOnce(jsonResponse(customer360Response("conv-telegram", "contact-telegram")));

    await getCustomer360("conv-web");
    await getCustomer360("conv-telegram");

    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("/conversations/conv-web/customer-360");
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain("/conversations/conv-telegram/customer-360");
    expectTenantHeaderForAll(fetchMock);
  });

  it("posts contact create, update, and identity requests to API endpoints", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(contactResponse("contact-created")))
      .mockResolvedValueOnce(jsonResponse({ ...contactResponse("contact-created"), displayName: "Updated API Contact" }))
      .mockResolvedValueOnce(jsonResponse(contactResponse("contact-created", "identity-linked")))
      .mockResolvedValueOnce(jsonResponse(contactResponse("contact-created", "identity-linked")))
      .mockResolvedValueOnce(jsonResponse(contactResponse("contact-created")));

    const created = await createContact({ displayName: "API Contact", leadStatus: "new", tags: [] });
    const updated = await updateContact("contact-created", { displayName: "Updated API Contact" });
    const linked = await linkContactIdentity("contact-created", {
      platform: "telegram",
      channelAccountId: "00000000-0000-4000-8000-000000000021",
      externalUserId: "tg-api-user",
      displayName: "TG API User"
    });
    const primary = await setPrimaryContactIdentity("contact-created", { identityId: "identity-linked" });
    const unlinked = await unlinkContactIdentity("contact-created", { identityId: "identity-linked" });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/contacts", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/contacts/contact-created", expect.objectContaining({ method: "PATCH" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/contacts/contact-created/identities/link", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/contacts/contact-created/primary-identity", expect.objectContaining({ method: "PATCH" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/contacts/contact-created/identities/unlink", expect.objectContaining({ method: "POST" }));
    expect(JSON.parse(String(fetchMock.mock.calls[2]?.[1]?.body))).toEqual({
      platform: "telegram",
      channelAccountId: "00000000-0000-4000-8000-000000000021",
      externalUserId: "tg-api-user",
      displayName: "TG API User",
      isPrimary: false
    });
    expect(JSON.parse(String(fetchMock.mock.calls[3]?.[1]?.body))).toEqual({ identityId: "identity-linked" });
    expect(JSON.parse(String(fetchMock.mock.calls[4]?.[1]?.body))).toEqual({ identityId: "identity-linked" });
    expectTenantHeaderForAll(fetchMock);
    expect(created.id).toBe("contact-created");
    expect(updated.displayName).toBe("Updated API Contact");
    expect(linked.identities[0]?.id).toBe("identity-linked");
    expect(primary.id).toBe("contact-created");
    expect(unlinked.id).toBe("contact-created");
  });

  it("sends tenant-scoped broadcast opt-out updates to the API", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ ...contactResponse("contact-api"), optOutBroadcast: true, suppressedReason: "customer_requested" }));

    const contact = await updateBroadcastConsent("contact-api", { optOut: true, conversationId: "conv-web" });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/contacts/contact-api/broadcast-consent", expect.objectContaining({ method: "PATCH" }));
    const init = fetchMock.mock.calls[0]?.[1];
    expect(init?.headers).toEqual(expect.objectContaining({ "x-tenant-id": defaultTenantId }));
    expect(JSON.parse(String(init?.body))).toEqual({ optOut: true, conversationId: "conv-web" });
    expect(contact.optOutBroadcast).toBe(true);
    expectTenantHeaderForAll(fetchMock);
  });

  it("does not fake local opt-out state when broadcast consent API fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "Consent unavailable" }, 503));

    await expect(updateBroadcastConsent("contact-api", { optOut: true, conversationId: "conv-web" })).rejects.toThrow("API request failed (503): Consent unavailable");
  });

  it("gets contact directory endpoints with the tenant header", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse([contactResponse("contact-api")]))
      .mockResolvedValueOnce(jsonResponse(contactResponse("contact-api", "identity-detail")))
      .mockResolvedValueOnce(jsonResponse(contactResponse("contact-api", "identity-detail").identities))
      .mockResolvedValueOnce(jsonResponse([conversationResponse("conv-web")]));

    const contacts = await getContacts();
    const contact = await getContact("contact-api");
    const identities = await getContactIdentities("contact-api");
    const conversations = await getContactConversations("contact-api");

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/contacts", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/contacts/contact-api", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/contacts/contact-api/identities", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/contacts/contact-api/conversations", expect.any(Object));
    expectTenantHeaderForAll(fetchMock);
    expect(contacts[0]?.id).toBe("contact-api");
    expect(contact.identities[0]?.id).toBe("identity-detail");
    expect(identities[0]?.externalUserId).toBe("visitor-api");
    expect(conversations[0]).toMatchObject({
      roomId: "room-webchat",
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020"
    });
  });

  it("sends tenant headers for settings channels and team requests", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse([settingsChannelResponse("channel-web")]))
      .mockResolvedValueOnce(jsonResponse(settingsChannelResponse("channel-web")))
      .mockResolvedValueOnce(jsonResponse({ ...settingsChannelResponse("channel-web"), accountName: "Updated Website" }))
      .mockResolvedValueOnce(jsonResponse([settingsTeamResponse("agent-may")]))
      .mockResolvedValueOnce(jsonResponse(settingsTeamResponse("agent-may")))
      .mockResolvedValueOnce(jsonResponse({ ...settingsTeamResponse("agent-may"), name: "Updated May", displayName: "Updated May" }));

    const channels = await getSettingsChannels();
    const channel = await getSettingsChannel("channel-web");
    const updatedChannel = await updateSettingsChannel("channel-web", { accountName: "Updated Website" });
    const team = await getSettingsTeam();
    const member = await getSettingsTeamMember("agent-may");
    const updatedMember = await updateSettingsTeamMember("agent-may", { name: "Updated May", role: "supervisor" });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/settings/channels", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/settings/channels/channel-web", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/settings/channels/channel-web", expect.objectContaining({ method: "PATCH" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/settings/team", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/settings/team/agent-may", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/settings/team/agent-may", expect.objectContaining({ method: "PATCH" }));
    expectTenantHeaderForAll(fetchMock);
    expect(channels[0]?.id).toBe("channel-web");
    expect(channel.tokenMasked).toBe("configured:redacted");
    expect(updatedChannel.accountName).toBe("Updated Website");
    expect(team[0]?.id).toBe("agent-may");
    expect(member.email).toBe("may@example.local");
    expect(updatedMember.role).toBe("agent");
  });

  it("sends tenant headers for settings SLA policy requests", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse([settingsSlaPolicyResponse("sla-api")]))
      .mockResolvedValueOnce(jsonResponse(settingsSlaPolicyResponse("sla-api")))
      .mockResolvedValueOnce(jsonResponse({ ...settingsSlaPolicyResponse("sla-api"), firstResponseMinutes: 7 }));

    const policies = await getSettingsSlaPolicies();
    const policy = await getSettingsSlaPolicy("sla-api");
    const updated = await updateSettingsSlaPolicy("sla-api", { firstResponseMinutes: 7 });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/settings/sla-policies", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/settings/sla-policies/sla-api", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/settings/sla-policies/sla-api", expect.objectContaining({ method: "PATCH" }));
    expectTenantHeaderForAll(fetchMock);
    expect(policies[0]?.id).toBe("sla-api");
    expect(policy.priorityScope).toBe("urgent");
    expect(updated.firstResponseMinutes).toBe(7);
  });

  it("sends tenant headers for settings canned reply requests", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse([settingsCannedReplyResponse("reply-api")]))
      .mockResolvedValueOnce(jsonResponse(settingsCannedReplyResponse("reply-api")))
      .mockResolvedValueOnce(jsonResponse({ ...settingsCannedReplyResponse("reply-api"), bodyTemplate: "Updated persisted hello" }));

    const replies = await getSettingsCannedReplies();
    const reply = await getSettingsCannedReply("reply-api");
    const updated = await updateSettingsCannedReply("reply-api", { bodyTemplate: "Updated persisted hello" });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/settings/canned-replies", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/settings/canned-replies/reply-api", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/settings/canned-replies/reply-api", expect.objectContaining({ method: "PATCH" }));
    expectTenantHeaderForAll(fetchMock);
    expect(replies[0]?.shortcut).toBe("/hello");
    expect(reply.bodyTemplate).toBe("Persisted hello");
    expect(updated.bodyTemplate).toBe("Updated persisted hello");
  });

  it("posts Webchat inbound payloads to the webchat webhook endpoint", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({
      accepted: true,
      conversationId: "conv-web",
      messageId: "webchat-msg-1",
      duplicate: false
    }));

    const result = await createWebchatMessage({
      channelAccountId: "demo-webchat",
      visitorId: "visitor-demo",
      sessionId: "webchat-demo-session",
      messageId: "webchat-msg-1",
      text: "hello"
    });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/webhooks/webchat/demo-webchat", expect.objectContaining({ method: "POST" }));
    expectTenantHeaderForAll(fetchMock);
    expect(result.conversationId).toBe("conv-web");
  });

  it("persists internal notes and tasks through workflow API endpoints", async () => {
    const assigneeUserId = "00000000-0000-4000-8000-000000000011";
    const dueAt = "2026-05-22T04:00:00.000Z";
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse([internalNoteResponse("note-api")]))
      .mockResolvedValueOnce(jsonResponse(internalNoteResponse("note-new")))
      .mockResolvedValueOnce(jsonResponse([taskResponse("task-api")]))
      .mockResolvedValueOnce(jsonResponse({ ...taskResponse("task-new"), assigneeUserId, dueAt }))
      .mockResolvedValueOnce(jsonResponse({ ...taskResponse("task-new"), title: "Updated task", assigneeUserId: null, dueAt: null }))
      .mockResolvedValueOnce(jsonResponse({ ...taskResponse("task-new"), status: "done", completedAt: "2026-05-21T04:05:00.000Z" }));

    const notes = await getConversationNotes("conv-web");
    const note = await createConversationNote("conv-web", { body: "persist this", visibility: "team" });
    const tasks = await getConversationTasks("conv-web");
    const task = await createConversationWorkflowTask("conv-web", { title: "Follow up", assigneeUserId, dueAt });
    const updatedTask = await updateConversationWorkflowTask(task.id, { title: "Updated task", assigneeUserId: null, dueAt: null });
    const completed = await completeConversationWorkflowTask(task.id);

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/conv-web/notes", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/conv-web/tasks", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/tasks/task-new", expect.objectContaining({ method: "PATCH" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/tasks/task-new/complete", expect.objectContaining({ method: "PATCH" }));
    expectTenantHeaderForAll(fetchMock);
    expect(JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body))).toEqual({ body: "persist this", visibility: "team" });
    expect(JSON.parse(String(fetchMock.mock.calls[3]?.[1]?.body))).toEqual({ title: "Follow up", assigneeUserId, dueAt });
    expect(JSON.parse(String(fetchMock.mock.calls[4]?.[1]?.body))).toEqual({ title: "Updated task", assigneeUserId: null, dueAt: null });
    expect(notes[0]?.id).toBe("note-api");
    expect(note.id).toBe("note-new");
    expect(note).toMatchObject({
      tenantId: defaultTenantId,
      customerId: "contact-api",
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      roomId: "room-webchat",
      externalCalls: 0
    });
    expect(tasks[0]?.id).toBe("task-api");
    expect(task).toMatchObject({
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      roomId: "room-webchat"
    });
    expect(updatedTask.title).toBe("Updated task");
    expect(updatedTask.assigneeUserId).toBeNull();
    expect(updatedTask.dueAt).toBeNull();
    expect(completed.status).toBe("done");
  });

  it("does not fake local note/task state when workflow API mutations fail", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ message: "Note unavailable" }, 503))
      .mockResolvedValueOnce(jsonResponse({ message: "Task unavailable" }, 503));

    await expect(createConversationNote("conv-web", { body: "do not fake", visibility: "team" }))
      .rejects.toThrow("API request failed (503): Note unavailable");
    await expect(createConversationWorkflowTask("conv-web", { title: "Do not fake" }))
      .rejects.toThrow("API request failed (503): Task unavailable");

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expectTenantHeaderForAll(fetchMock);
  });

  it("does not fake local task lifecycle state when task update APIs fail", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ message: "Task update unavailable" }, 503))
      .mockResolvedValueOnce(jsonResponse({ message: "Task complete unavailable" }, 503));

    await expect(updateConversationWorkflowTask("task-api", { status: "done" }))
      .rejects.toThrow("API request failed (503): Task update unavailable");
    await expect(completeConversationWorkflowTask("task-api"))
      .rejects.toThrow("API request failed (503): Task complete unavailable");

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/tasks/task-api", expect.objectContaining({ method: "PATCH" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/tasks/task-api/complete", expect.objectContaining({ method: "PATCH" }));
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expectTenantHeaderForAll(fetchMock);
  });

  it("loads API task dashboard rows with tenant and conversation context", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse([
      taskDashboardResponse("task-dashboard-open", "conv-web")
    ]));

    const rows = await getTaskDashboard({
      status: "open",
      due: "overdue",
      assigneeUserId: "00000000-0000-4000-8000-000000000011",
      roomId: "room-webchat",
      limit: 25,
      offset: 0
    });

    const url = new URL(String(fetchMock.mock.calls[0]?.[0]));
    expect(url.pathname).toBe("/tasks");
    expect(url.searchParams.get("status")).toBe("open");
    expect(url.searchParams.get("due")).toBe("overdue");
    expect(url.searchParams.get("assigneeUserId")).toBe("00000000-0000-4000-8000-000000000011");
    expect(url.searchParams.get("roomId")).toBe("room-webchat");
    expect(url.searchParams.get("limit")).toBe("25");
    expectTenantHeaderForAll(fetchMock);
    expect(rows[0]).toMatchObject({
      tenantId: defaultTenantId,
      conversationId: "conv-web",
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      roomId: "room-webchat",
      status: "open",
      externalCalls: 0
    });
    expect(JSON.stringify(rows)).not.toMatch(/accessToken|webhookSecret|botToken|apiKey|Bearer\s+[a-z0-9._-]+|(^|[^a-z])sk-[a-z0-9_-]{8,}/i);
  });

  it("sends tenant-scoped due-soon and follow-up task dashboard filters", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse([taskDashboardResponse("task-due-soon", "conv-web")]))
      .mockResolvedValueOnce(jsonResponse([taskDashboardResponse("task-follow-up", "conv-web")]));

    await getTaskDashboard({ due: "due_soon", roomId: "room-webchat" });
    await getTaskDashboard({ due: "follow_up", followUp: true, roomId: "room-webchat" });

    const dueSoonUrl = new URL(String(fetchMock.mock.calls[0]?.[0]));
    const followUpUrl = new URL(String(fetchMock.mock.calls[1]?.[0]));
    expect(dueSoonUrl.searchParams.get("due")).toBe("due_soon");
    expect(followUpUrl.searchParams.get("due")).toBe("follow_up");
    expect(followUpUrl.searchParams.get("followUp")).toBe("true");
    expectTenantHeaderForAll(fetchMock);
  });

  it("surfaces task dashboard API failures without returning local task rows", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "Tasks unavailable" }, 503));

    await expect(getTaskDashboard({ status: "open" })).rejects.toThrow("API request failed (503): Tasks unavailable");
  });

  it("persists assignment, takeover, return-to-AI, and follow-up without mock fallback", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ id: "conv-web", roomId: "room-webchat" }))
      .mockResolvedValueOnce(jsonResponse([conversationResponse("conv-web", "Human Taken")]))
      .mockResolvedValueOnce(jsonResponse({ id: "conv-web", roomId: "room-webchat" }))
      .mockResolvedValueOnce(jsonResponse([conversationResponse("conv-web", "Human Taken")]))
      .mockResolvedValueOnce(jsonResponse({ id: "conv-web", roomId: "room-webchat" }))
      .mockResolvedValueOnce(jsonResponse([conversationResponse("conv-web", "AI Active")]))
      .mockResolvedValueOnce(jsonResponse({ id: "conv-web", roomId: "room-webchat" }))
      .mockResolvedValueOnce(jsonResponse([conversationResponse("conv-web", "Human Taken", "follow_up")]));

    await assignConversation("conv-web", "00000000-0000-4000-8000-000000000011");
    await takeOverConversation("conv-web");
    const returnedToAi = await returnConversationToAi("conv-web");
    const followUp = await setConversationFollowUp("conv-web", { followUpAt: "2026-05-22T04:00:00.000Z" });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/conv-web/assign", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/conv-web/takeover", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/conv-web/return-to-ai", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/conv-web/follow-up", expect.objectContaining({ method: "POST" }));
    expectTenantHeaderForAll(fetchMock);
    expect(returnedToAi.aiStatus).toBe("AI Active");
    expect(followUp.status).toBe("follow_up");
  });

  it("does not refetch or synthesize local action state when an API conversation action fails", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "Conversation not found" }, 404));

    await expect(updateConversationPriority("missing", { priority: "high" })).rejects.toThrow("API request failed (404): Conversation not found");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/missing/priority", expect.objectContaining({ method: "PATCH" }));
    expectTenantHeaderForAll(fetchMock);
  });

  it("calls status, priority, read-state, SLA, close, audit, and status-history API endpoints", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ id: "conv-web", roomId: "room-webchat" }))
      .mockResolvedValueOnce(jsonResponse([conversationResponse("conv-web", "Closed", "closed")]))
      .mockResolvedValueOnce(jsonResponse({ id: "conv-web", roomId: "room-webchat" }))
      .mockResolvedValueOnce(jsonResponse([conversationResponse("conv-web", "Need Human", "open")]))
      .mockResolvedValueOnce(jsonResponse({ id: "conv-web", roomId: "room-webchat" }))
      .mockResolvedValueOnce(jsonResponse([conversationResponse("conv-web", "Need Human", "open")]))
      .mockResolvedValueOnce(jsonResponse({ id: "conv-web", roomId: "room-webchat" }))
      .mockResolvedValueOnce(jsonResponse([{ ...conversationResponse("conv-web", "Need Human", "open"), slaStatus: "warning", slaDueAt: "2026-05-21T04:30:00.000Z" }]))
      .mockResolvedValueOnce(jsonResponse({ id: "conv-web", roomId: "room-webchat" }))
      .mockResolvedValueOnce(jsonResponse([conversationResponse("conv-web", "Closed", "closed")]))
      .mockResolvedValueOnce(jsonResponse([auditLogResponse("audit-1")]))
      .mockResolvedValueOnce(jsonResponse([statusHistoryResponse("history-1")]));

    const status = await updateConversationStatus("conv-web", { status: "closed" });
    const priority = await updateConversationPriority("conv-web", { priority: "normal" });
    const readState = await updateConversationReadState("conv-web", { unread: false, unreplied: false });
    const sla = await updateConversationSla("conv-web", { slaStatus: "warning", slaDueAt: "2026-05-21T04:30:00.000Z" });
    const closed = await closeConversation("conv-web");
    const auditLogs = await getConversationAuditLogs("conv-web");
    const statusHistory = await getConversationStatusHistory("conv-web");

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/conv-web/status", expect.objectContaining({ method: "PATCH" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/conv-web/priority", expect.objectContaining({ method: "PATCH" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/conv-web/read-state", expect.objectContaining({ method: "PATCH" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/conv-web/sla", expect.objectContaining({ method: "PATCH" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/conv-web/close", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/conv-web/audit-logs", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/conv-web/status-history", expect.any(Object));
    expectTenantHeaderForAll(fetchMock);
    expect(status.status).toBe("closed");
    expect(priority.id).toBe("conv-web");
    expect(readState.id).toBe("conv-web");
    expect(sla.slaStatus).toBe("warning");
    expect(closed.status).toBe("closed");
    expect(auditLogs[0]?.action).toBe("conversation.status_updated");
    expect(statusHistory[0]?.toStatus).toBe("closed");
  });

  it("sends x-tenant-id when requesting conversation audit logs", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse([auditLogResponse("audit-tenant")]));

    await getConversationAuditLogs("conv-web");

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/conv-web/audit-logs", expect.any(Object));
    expect(fetchMock.mock.calls[0]?.[1]?.headers).toEqual(expect.objectContaining({ "x-tenant-id": defaultTenantId }));
  });

  it("sends x-tenant-id when requesting conversation status history", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse([statusHistoryResponse("history-tenant")]));

    await getConversationStatusHistory("conv-web");

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/conv-web/status-history", expect.any(Object));
    expect(fetchMock.mock.calls[0]?.[1]?.headers).toEqual(expect.objectContaining({ "x-tenant-id": defaultTenantId }));
  });

  it("surfaces audit log API failures without returning local mock audit data", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "Audit unavailable" }, 503));

    await expect(getConversationAuditLogs("conv-web")).rejects.toThrow("API request failed (503): Audit unavailable");
  });

  it("surfaces status-history API failures without returning local mock history data", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "History unavailable" }, 503));

    await expect(getConversationStatusHistory("conv-web")).rejects.toThrow("API request failed (503): History unavailable");
  });

  it("calls AI Center knowledge base, document, and chunk endpoints", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse([knowledgeBaseResponse("kb-api")]))
      .mockResolvedValueOnce(jsonResponse(knowledgeBaseResponse("kb-new")))
      .mockResolvedValueOnce(jsonResponse({ ...knowledgeBaseResponse("kb-new"), name: "Updated KB" }))
      .mockResolvedValueOnce(jsonResponse({ ...knowledgeBaseResponse("kb-new"), status: "archived" }))
      .mockResolvedValueOnce(jsonResponse([knowledgeDocumentResponse("doc-api", "kb-api")]))
      .mockResolvedValueOnce(jsonResponse(knowledgeDocumentResponse("doc-new", "kb-api")))
      .mockResolvedValueOnce(jsonResponse({ ...knowledgeDocumentResponse("doc-new", "kb-api"), title: "Updated Doc" }))
      .mockResolvedValueOnce(jsonResponse({ ...knowledgeDocumentResponse("doc-new", "kb-api"), status: "archived" }))
      .mockResolvedValueOnce(jsonResponse([knowledgeChunkResponse("chunk-api", "doc-api")]))
      .mockResolvedValueOnce(jsonResponse(knowledgeChunkResponse("chunk-new", "doc-api")))
      .mockResolvedValueOnce(jsonResponse({ ...knowledgeChunkResponse("chunk-new", "doc-api"), content: "Updated chunk" }))
      .mockResolvedValueOnce(jsonResponse({ id: "chunk-new", deleted: true }));

    const bases = await getKnowledgeBases();
    const createdBase = await createKnowledgeBase({ name: "New KB", description: "API", status: "draft" });
    const updatedBase = await updateKnowledgeBase(createdBase.id, { name: "Updated KB" });
    const archivedBase = await deleteKnowledgeBase(createdBase.id);
    const docs = await getKnowledgeDocuments("kb-api");
    const createdDoc = await createKnowledgeDocument("kb-api", { title: "New Doc", sourceType: "manual", status: "active" });
    const updatedDoc = await updateKnowledgeDocument(createdDoc.id, { title: "Updated Doc" });
    const archivedDoc = await deleteKnowledgeDocument(createdDoc.id);
    const chunks = await getKnowledgeChunks("doc-api");
    const createdChunk = await createKnowledgeChunk("doc-api", { content: "New chunk", metadataJson: { section: "demo" } });
    const updatedChunk = await updateKnowledgeChunk(createdChunk.id, { content: "Updated chunk" });
    const deletedChunk = await deleteKnowledgeChunk(createdChunk.id);

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/ai/knowledge-bases", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/ai/knowledge-bases", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/ai/knowledge-bases/kb-new", expect.objectContaining({ method: "PATCH" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/ai/knowledge-bases/kb-new", expect.objectContaining({ method: "DELETE" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/ai/knowledge-bases/kb-api/documents", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/ai/knowledge-bases/kb-api/documents", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/ai/documents/doc-new", expect.objectContaining({ method: "PATCH" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/ai/documents/doc-new", expect.objectContaining({ method: "DELETE" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/ai/documents/doc-api/chunks", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/ai/documents/doc-api/chunks", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/ai/chunks/chunk-new", expect.objectContaining({ method: "PATCH" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/ai/chunks/chunk-new", expect.objectContaining({ method: "DELETE" }));
    expectTenantHeaderForAll(fetchMock);
    expect(bases[0]?.name).toBe("API KB");
    expect(updatedBase.name).toBe("Updated KB");
    expect(archivedBase.status).toBe("archived");
    expect(docs[0]?.knowledgeBaseId).toBe("kb-api");
    expect(updatedDoc.title).toBe("Updated Doc");
    expect(archivedDoc.status).toBe("archived");
    expect(chunks[0]?.documentId).toBe("doc-api");
    expect(updatedChunk.content).toBe("Updated chunk");
    expect(deletedChunk.deleted).toBe(true);
  });

  it("gets and updates room AI policy through the API", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(roomAiPolicyResponse("room-webchat")))
      .mockResolvedValueOnce(jsonResponse({ ...roomAiPolicyResponse("room-webchat"), aiMode: "human_first", knowledgeBaseIds: ["kb-api"] }));

    const before = await getRoomAiPolicy("room-webchat");
    const after = await updateRoomAiPolicy("room-webchat", {
      aiMode: "human_first",
      autoReplyThreshold: 0.8,
      draftThreshold: 0.55,
      requireCitationsForAutoReply: true,
      handoffOnHighRisk: true,
      knowledgeBaseIds: ["kb-api"]
    });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/rooms/room-webchat/ai-policy", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/rooms/room-webchat/ai-policy", expect.objectContaining({ method: "PATCH" }));
    expectTenantHeaderForAll(fetchMock);
    expect(before.aiMode).toBe("suggest");
    expect(after.aiMode).toBe("human_first");
    expect(after.knowledgeBaseIds).toEqual(["kb-api"]);
  });

  it("sends x-tenant-id for AI suggested reply and feedback requests", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(aiSuggestionResponse("ai-run-1", "conv-web")))
      .mockResolvedValueOnce(jsonResponse(aiFeedbackResponse("feedback-1", "ai-run-1", "conv-web")));

    const suggestion = await suggestAiReply("conv-web");
    const feedback = await markAiSuggestionWrong(suggestion.suggestionId, { feedbackType: "mark_wrong" });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/ai/conversations/conv-web/suggest", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/ai/suggestions/ai-run-1/feedback", expect.objectContaining({ method: "POST" }));
    expectTenantHeaderForAll(fetchMock);
    expect(JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body))).toEqual({ feedbackType: "mark_wrong" });
    expect(suggestion).toMatchObject({
      suggestionId: "ai-run-1",
      conversationId: "conv-web",
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      roomId: "room-webchat",
      externalCalls: 0
    });
    expect(feedback.feedbackType).toBe("mark_wrong");
    expect(JSON.stringify(suggestion)).not.toMatch(/accessToken|webhookSecret|botToken|apiKey|Bearer|sk-/i);
  });

  it("surfaces AI suggestion API failures without returning mock suggestions", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "AI unavailable" }, 503));

    await expect(suggestAiReply("conv-web")).rejects.toThrow("API request failed (503): AI unavailable");
  });

  it("returns readable API errors", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "Conversation not found" }, 404));

    await expect(sendAgentMessage("missing", "hello")).rejects.toThrow("API request failed (404): Conversation not found");
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

function providerReadinessResponse() {
  return {
    status: "ok",
    service: "api",
    time: "2026-05-31T00:00:00.000Z",
    externalCalls: 0,
    allowlist: {
      configured: true,
      entryCount: 2
    },
    apiMode: {
      apiMode: "api",
      dataMode: "api",
      publicDataMode: "api",
      apiModeExplicit: true,
      dataModeExplicit: true,
      publicDataModeExplicit: true,
      apiBaseConfigured: true
    },
    dependencies: {
      databaseConfigured: true,
      redisConfigured: true
    },
    providerReadiness: {
      mode: "disabled",
      outboundEnabledByEnv: false,
      sandboxMode: "disabled",
      sandboxEnabled: false,
      channelMode: "mock",
      metaChannelMode: "mock",
      realOutboundEnabled: false,
      allowlistCount: 2,
      allowlist: {
        configured: true,
        entryCount: 2
      },
      webhookSignatureVerificationConfigured: true,
      webhookSignatureVerificationReady: true,
      replayGuardrailsEnabled: true,
      lastSandboxEventSignatureStatus: "verified",
      latestReplayStatus: "fresh",
      replayDetectedCount: 0,
      webhookNormalizationEnabled: true,
      webhookDryRunRoutingEnabled: true,
      lastSandboxEventNormalizationStatus: "normalized",
      latestRoutingStatus: "dry-run-only",
      normalizedEventCount: 1,
      routingBlockedCount: 0,
      webhookInboundPersistenceEnabled: true,
      latestInboundPersistenceStatus: "dry-run-only",
      persistedInboundMessageCount: 0,
      inboundPersistenceBlockedCount: 0,
      inboundPersistenceReplayBlockedCount: 0,
      inboundPersistenceSkippedNoMatchCount: 0,
      webhookUnmatchedInboundReviewEnabled: true,
      webhookUnmatchedReviewActionsEnabled: true,
      webhookCandidateLookupEnabled: true,
      webhookUnmatchedHistoryEnabled: true,
      webhookUnmatchedQueueExportEnabled: true,
      webhookUnmatchedQueueExportMaxLimit: 500,
      webhookReviewMetricsEnabled: true,
      webhookDiagnosticsEnabled: true,
      webhookReviewAlertsEnabled: true,
      webhookReviewQueueHealthEnabled: true,
      reviewAlertCriticalCount: 1,
      unmatchedInboundOpenCount: 1,
      unmatchedInboundStaleOpenCount: 0,
      unmatchedInboundQueuedCount: 1,
      unmatchedInboundReplayBlockedCount: 0,
      unmatchedInboundReviewedCount: 0,
      unmatchedInboundSkippedCount: 0,
      unmatchedInboundLinkedCount: 0,
      latestUnmatchedInboundStatus: "review-needed",
      latestUnmatchedReviewActionStatus: null,
      latestUnmatchedLinkStatus: null,
      lastSandboxEventAt: "2026-05-31T00:00:00.000Z",
      externalCalls: 0,
      providers: [
        providerReadinessProviderResponse("line", true, true, 1),
        providerReadinessProviderResponse("telegram", true, true, 1),
        providerReadinessProviderResponse("facebook", false, false, 0),
        providerReadinessProviderResponse("instagram", false, false, 0)
      ]
    },
    monitoring: {
      auditSafetyBaseline: true,
      providerPayloadsExposed: false,
      externalCalls: 0
    },
    checks: [
      { name: "provider outbound disabled", ok: true }
    ]
  };
}

function providerReadinessProviderResponse(name: "line" | "telegram" | "facebook" | "instagram", configured: boolean, webhookConfigured: boolean, allowlistCount: number) {
  void allowlistCount;
  return {
    name,
    configured,
    credentialStatus: configured ? "configured" : "not_configured",
    webhookStatus: webhookConfigured ? "configured" : "not_configured",
    webhookVerificationReady: webhookConfigured,
    webhookVerificationConfigured: webhookConfigured,
    outboundEnabled: false,
    status: "disabled_by_default"
  };
}

function providerWebhookEventResponse(id: string, provider: "line" | "telegram" | "facebook" | "instagram" = "line") {
  return {
    id,
    tenantId: defaultTenantId,
    provider,
    channel: provider,
    eventType: provider === "telegram" ? "webhook.verified" : "message.created",
    mode: "dry_run",
    status: provider === "telegram" ? "verified" : "received",
    receivedAt: "2026-05-31T00:00:00.000Z",
    payloadSummary: "Dry-run object payload accepted with 2 safe fields.",
    payloadFieldCount: 2,
    payloadDigest: "sha256:safeeventdigest",
    signatureVerified: true,
    signatureStatus: "verified",
    signatureAlgorithm: "hmac-sha256",
    signatureFingerprint: "sha256:safesignature",
    signedAt: "2026-05-31T00:00:00.000Z",
    replayDetected: false,
    replayStatus: "fresh",
    dedupKeyDigest: "sha256:safededupdigest",
    previousEventSeenAt: null,
    normalized: true,
    normalizationStatus: "normalized",
    normalizedEventType: "message",
    direction: "inbound",
    messageType: "text",
    textPreview: "Safe sandbox preview",
    textLength: 20,
    mediaSummary: null,
    senderKeyDigest: "sha256:safesenderdigest",
    roomKeyDigest: "sha256:saferoomdigest",
    dryRunRouting: true,
    routingStatus: "dry-run-only",
    conversationLookupStatus: "not-found",
    conversationKeyDigest: "sha256:safeconversationdigest",
    channelAccountId: `sandbox:${provider}`,
    roomIdDigest: "sha256:saferoomiddigest",
    inboundPersistenceMode: "dry-run",
    inboundPersistenceStatus: "dry-run-only",
    messagePersisted: false,
    persistedMessageId: null,
    conversationId: null,
    unmatchedInboundQueued: true,
    unmatchedInboundId: "provider-webhook-unmatched-1",
    unmatchedStatus: "review-needed",
    unmatchedReason: "safe-review-required-no-conversation-match",
    unmatchedReviewActionStatus: "none",
    unmatchedLinkStatus: "none",
    linkedConversationId: null,
    linkedMessageId: null,
    unmatchedResolvedAt: null,
    inboundAuditStatus: "recorded",
    externalCalls: 0
  };
}

function providerWebhookUnmatchedInboundResponse(id: string, provider: "line" | "telegram" | "facebook" | "instagram" = "line") {
  return {
    id,
    tenantId: defaultTenantId,
    provider,
    channelAccountId: `sandbox:${provider}`,
    mode: "sandbox",
    eventType: "message.created",
    normalizedEventType: "message",
    messageType: "text",
    normalizationStatus: "normalized",
    routingStatus: "dry-run-only",
    conversationLookupStatus: "not-found",
    unmatchedStatus: "review-needed",
    unmatchedReason: "safe-review-required-no-conversation-match",
    reviewStatus: "pending",
    reviewedAt: null,
    reviewedBy: null,
    reviewReason: null,
    linkStatus: "none",
    linkedConversationId: null,
    linkedMessageId: null,
    unmatchedResolvedAt: null,
    messagePersisted: false,
    payloadDigest: "sha256:safeeventdigest",
    providerEventDigest: "sha256:safededupdigest",
    deliveryDigest: "sha256:safededupdigest",
    senderKeyDigest: "sha256:safesenderdigest",
    roomKeyDigest: "sha256:saferoomdigest",
    textPreview: "Safe sandbox preview",
    textLength: 20,
    receivedAt: "2026-05-31T00:00:00.000Z",
    externalCalls: 0
  };
}

function providerWebhookUnmatchedInboundPageResponse(items = [providerWebhookUnmatchedInboundResponse("provider-webhook-unmatched-1")]) {
  return {
    items,
    pagination: {
      totalCount: items.length,
      limit: 10,
      offset: 0,
      returnedCount: items.length,
      hasNextPage: false,
      hasPreviousPage: false
    },
    appliedFilters: {
      limit: 10,
      offset: 0,
      sortBy: "receivedAt",
      sortOrder: "desc"
    },
    appliedSort: {
      sortBy: "receivedAt",
      sortOrder: "desc"
    },
    summary: {
      openCount: items.filter((item) => item.unmatchedStatus === "open" || item.unmatchedStatus === "review-needed").length,
      reviewedCount: items.filter((item) => item.reviewStatus === "reviewed").length,
      skippedCount: items.filter((item) => item.reviewStatus === "skipped").length,
      linkedCount: items.filter((item) => item.reviewStatus === "linked").length
    },
    externalCalls: 0
  };
}

function providerWebhookCandidateResponse(conversationId: string, provider: "line" | "telegram" | "facebook" | "instagram" = "line") {
  return {
    conversationId,
    platform: provider,
    channelAccountId: `sandbox:${provider}`,
    roomIdDigest: "sha256:saferoomdigest",
    safeRoomLabel: `${provider} conversation digest match`,
    latestMessagePreview: "Safe candidate preview",
    latestMessageAt: "2026-05-31T00:00:00.000Z",
    matchReason: "platform, channel account, and room digest match",
    matchConfidence: 0.98,
    externalCalls: 0
  };
}

function providerWebhookHistoryResponse(unmatchedInboundId: string) {
  return {
    unmatchedInboundId,
    provider: "line",
    channelAccountId: "sandbox:line",
    safeRoomLabel: "line room digest saferoomdige",
    roomKeyDigest: "sha256:saferoomdigest",
    entries: [
      providerWebhookHistoryEntryResponse(unmatchedInboundId, "inbound_received", "received"),
      providerWebhookHistoryEntryResponse(unmatchedInboundId, "unmatched_queued", "review-needed")
    ],
    externalCalls: 0
  };
}

function providerWebhookHistoryEntryResponse(unmatchedInboundId: string, action: "inbound_received" | "unmatched_queued", actionStatus: string) {
  return {
    id: `${unmatchedInboundId}-${action}`,
    unmatchedInboundId,
    provider: "line",
    channelAccountId: "sandbox:line",
    safeRoomLabel: "line room digest saferoomdige",
    roomKeyDigest: "sha256:saferoomdigest",
    eventType: "message.created",
    action,
    actionStatus,
    statusBefore: action === "inbound_received" ? null : "dry-run-only",
    statusAfter: actionStatus,
    actor: "system",
    reason: "safe-review-required-no-conversation-match",
    message: "Safe history entry",
    linkedConversationId: null,
    linkedMessageId: null,
    receivedAt: "2026-05-31T00:00:00.000Z",
    actionAt: "2026-05-31T00:00:00.000Z",
    externalCalls: 0
  };
}

function providerWebhookExportResponse(items = [providerWebhookUnmatchedInboundResponse("provider-webhook-unmatched-1")], format: "json" | "csv" = "json") {
  const rows = items.map((item) => ({
    id: item.id,
    provider: item.provider,
    channelAccountId: item.channelAccountId,
    safeRoomLabel: `${item.provider} room digest saferoomdige`,
    roomKeyDigest: item.roomKeyDigest,
    eventType: item.eventType,
    reviewStatus: item.reviewStatus,
    linkStatus: item.linkStatus,
    unmatchedStatus: item.unmatchedStatus,
    receivedAt: item.receivedAt,
    reviewedAt: item.reviewedAt,
    linkedConversationId: item.linkedConversationId,
    candidateCount: null,
    safeMessagePreview: item.textPreview,
    safeReason: item.unmatchedReason,
    safeResultSummary: item.reviewStatus,
    externalCalls: 0
  }));
  return {
    format,
    rows,
    csv: format === "csv" ? "id,provider\nprovider-webhook-unmatched-1,line" : null,
    appliedFilters: {
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      eventType: "message.created",
      receivedAtFrom: "2026-05-31T00:00:00.000Z",
      offset: 10,
      sortBy: "receivedAt",
      sortOrder: "asc",
      format,
      limit: 25
    },
    appliedSort: {
      sortBy: "receivedAt",
      sortOrder: "asc"
    },
    requestedLimit: 25,
    exportMaxLimit: 500,
    exportedCount: rows.length,
    externalCalls: 0
  };
}

function providerWebhookReviewMetricsResponse() {
  return {
    generatedAt: "2026-05-31T00:05:00.000Z",
    appliedFilters: {
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      eventType: "message.created",
      receivedAtFrom: "2026-05-31T00:00:00.000Z",
      receivedAtTo: "2026-06-01T00:00:00.000Z"
    },
    totalEvents: 1,
    totalUnmatched: 1,
    openUnmatched: 1,
    reviewedCount: 0,
    skippedCount: 0,
    linkedCount: 0,
    persistedInboundCount: 0,
    signatureRejectedCount: 0,
    replayRejectedCount: 0,
    byProvider: [
      { key: "line", label: "line", count: 1 },
      { key: "telegram", label: "telegram", count: 0 },
      { key: "facebook", label: "facebook", count: 0 },
      { key: "instagram", label: "instagram", count: 0 }
    ],
    byEventType: [
      { key: "message.created", label: "message.created", count: 1 },
      { key: "webhook.verified", label: "webhook.verified", count: 0 },
      { key: "webhook.failed", label: "webhook.failed", count: 0 }
    ],
    byReviewStatus: [
      { key: "pending", label: "pending", count: 1 },
      { key: "reviewed", label: "reviewed", count: 0 },
      { key: "skipped", label: "skipped", count: 0 },
      { key: "linked", label: "linked", count: 0 }
    ],
    byLinkStatus: [
      { key: "none", label: "none", count: 1 },
      { key: "rejected", label: "rejected", count: 0 },
      { key: "linked", label: "linked", count: 0 },
      { key: "linked-message-persisted", label: "linked-message-persisted", count: 0 },
      { key: "duplicate-noop", label: "duplicate-noop", count: 0 }
    ],
    byUnmatchedStatus: [
      { key: "open", label: "open", count: 0 },
      { key: "review-needed", label: "review-needed", count: 1 },
      { key: "reviewed", label: "reviewed", count: 0 },
      { key: "blocked", label: "blocked", count: 0 },
      { key: "skipped", label: "skipped", count: 0 },
      { key: "linked", label: "linked", count: 0 },
      { key: "duplicate-skipped", label: "duplicate-skipped", count: 0 }
    ],
    ageBuckets: {
      under1Hour: 1,
      oneTo24Hours: 0,
      oneTo3Days: 0,
      over3Days: 0
    },
    funnel: {
      inboundReceived: 1,
      persisted: 0,
      unmatchedQueued: 1,
      reviewed: 0,
      skipped: 0,
      linked: 0,
      exportedHistoryAvailable: 1
    },
    latestReceivedAt: "2026-05-31T00:00:00.000Z",
    oldestOpenReceivedAt: "2026-05-31T00:00:00.000Z",
    externalCalls: 0
  };
}

function providerWebhookReviewAlertsResponse() {
  return {
    generatedAt: "2026-05-31T00:06:00.000Z",
    appliedFilters: {
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      eventType: "message.created",
      receivedAtFrom: "2026-05-31T00:00:00.000Z",
      receivedAtTo: "2026-06-01T00:00:00.000Z",
      severity: "critical"
    },
    totalAlerts: 1,
    infoCount: 0,
    warningCount: 0,
    criticalCount: 1,
    staleOpenCount: 1,
    overSlaCount: 1,
    oldestOpenReceivedAt: "2026-05-31T00:00:00.000Z",
    latestAlertGeneratedAt: "2026-05-31T00:06:00.000Z",
    thresholds: {
      staleWarningHours: 24,
      staleCriticalHours: 72,
      overSlaHours: 48
    },
    byProvider: [
      { key: "line", label: "line", count: 1 },
      { key: "telegram", label: "telegram", count: 0 },
      { key: "facebook", label: "facebook", count: 0 },
      { key: "instagram", label: "instagram", count: 0 }
    ],
    byPlatform: [
      { key: "line", label: "line", count: 1 },
      { key: "telegram", label: "telegram", count: 0 },
      { key: "facebook", label: "facebook", count: 0 },
      { key: "instagram", label: "instagram", count: 0 }
    ],
    byEventType: [
      { key: "message.created", label: "message.created", count: 1 },
      { key: "webhook.verified", label: "webhook.verified", count: 0 },
      { key: "webhook.failed", label: "webhook.failed", count: 0 }
    ],
    byReviewStatus: [
      { key: "pending", label: "pending", count: 1 },
      { key: "reviewed", label: "reviewed", count: 0 },
      { key: "skipped", label: "skipped", count: 0 },
      { key: "linked", label: "linked", count: 0 }
    ],
    byLinkStatus: [
      { key: "none", label: "none", count: 1 },
      { key: "rejected", label: "rejected", count: 0 },
      { key: "linked", label: "linked", count: 0 },
      { key: "linked-message-persisted", label: "linked-message-persisted", count: 0 },
      { key: "duplicate-noop", label: "duplicate-noop", count: 0 }
    ],
    byUnmatchedStatus: [
      { key: "open", label: "open", count: 0 },
      { key: "review-needed", label: "review-needed", count: 1 },
      { key: "reviewed", label: "reviewed", count: 0 },
      { key: "blocked", label: "blocked", count: 0 },
      { key: "skipped", label: "skipped", count: 0 },
      { key: "linked", label: "linked", count: 0 },
      { key: "duplicate-skipped", label: "duplicate-skipped", count: 0 }
    ],
    bySeverity: [
      { key: "info", label: "info", count: 0 },
      { key: "warning", label: "warning", count: 0 },
      { key: "critical", label: "critical", count: 1 }
    ],
    alertItems: [{
      unmatchedId: "provider-webhook-unmatched-1",
      provider: "line",
      platform: "line",
      channelAccountId: "sandbox:line",
      safeRoomLabel: "line room digest saferoomdige",
      roomKeyDigest: "sha256:saferoomdigest",
      eventType: "message.created",
      receivedAt: "2026-05-31T00:00:00.000Z",
      ageBucket: "over3Days",
      severity: "critical",
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      routingOutcome: "dry-run-only/not-found",
      diagnosticsAvailable: true,
      historyAvailable: true,
      externalCalls: 0
    }],
    externalCalls: 0
  };
}

function providerWebhookDiagnosticsResponse(unmatchedInboundId: string) {
  return {
    unmatchedId: unmatchedInboundId,
    provider: "line",
    platform: "line",
    channelAccountId: "sandbox:line",
    safeRoomLabel: "line room digest saferoomdige",
    roomKeyDigest: "sha256:saferoomdigest",
    eventType: "message.created",
    receivedAt: "2026-05-31T00:00:00.000Z",
    reviewStatus: "pending",
    linkStatus: "none",
    unmatchedStatus: "review-needed",
    routingOutcome: "dry-run-only/not-found",
    normalizedEventType: "message",
    persistenceOutcome: "skipped-no-match",
    candidateLookupAvailable: true,
    historyAvailable: true,
    exportAvailable: true,
    lastActionAt: "2026-05-31T00:00:00.000Z",
    safeWarnings: {
      signatureRejected: false,
      replayDuplicate: false,
      missingConversationMatch: true,
      staleOpenItem: false
    },
    externalCalls: 0
  };
}

function expectTenantHeaderForAll(fetchMock: { mock: { calls: Array<[unknown, RequestInit?]> } }) {
  for (const [, init] of fetchMock.mock.calls) {
    expect(init).toEqual(expect.objectContaining({
      headers: expect.objectContaining({ "x-tenant-id": defaultTenantId })
    }));
  }
}

function contactResponse(id: string, identityId = "identity-api") {
  return {
    id,
    displayName: "API Contact",
    phone: "000",
    email: "api@example.local",
    leadStatus: "new",
    ownerAgent: "Demo",
    tags: [],
    customFields: {},
    identities: [{
      id: identityId,
      contactId: id,
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      accountName: "Main Website",
      externalUserId: "visitor-api",
      displayName: "Visitor API",
      isPrimary: true,
      lastSeenAt: "2026-05-21T04:00:00.000Z"
    }],
    notes: [],
    tasks: [],
    optOutBroadcast: false,
    createdAt: "2026-05-21T04:00:00.000Z",
    updatedAt: "2026-05-21T04:00:00.000Z"
  };
}

function settingsChannelResponse(id: string) {
  return {
    id,
    platform: "webchat",
    accountName: "Main Website",
    accountKey: "demo-webchat",
    status: "active",
    webhookUrl: "http://localhost:4000/webhooks/webchat/demo-webchat",
    createdAt: "2026-05-21T04:00:00.000Z",
    updatedAt: "2026-05-21T04:00:00.000Z",
    lastInboundAt: "2026-05-21T04:10:00.000Z",
    lastMessageAt: "2026-05-21T04:12:00.000Z",
    hasAccessToken: true,
    tokenMasked: "configured:redacted",
    secretConfigured: true,
    secretMasked: "configured:redacted"
  };
}

function settingsTeamResponse(id: string) {
  return {
    id,
    name: "May",
    displayName: "May",
    role: "agent",
    email: "may@example.local",
    status: "online",
    skills: ["support", "omnichannel"],
    maxConcurrentChats: 6,
    createdAt: "2026-05-21T04:00:00.000Z",
    updatedAt: "2026-05-21T04:00:00.000Z"
  };
}

function settingsSlaPolicyResponse(id: string) {
  return {
    id,
    name: "Urgent priority",
    description: "Persisted SLA",
    status: "active",
    priorityScope: "urgent",
    firstResponseMinutes: 5,
    resolutionMinutes: 120,
    businessHoursMode: "always",
    escalationRole: "admin",
    createdAt: "2026-05-21T04:00:00.000Z",
    updatedAt: "2026-05-21T04:00:00.000Z"
  };
}

function settingsCannedReplyResponse(id: string) {
  return {
    id,
    title: "Greeting",
    category: "general",
    shortcut: "/hello",
    bodyTemplate: "Persisted hello",
    tags: ["hello"],
    platformScope: [],
    roomScope: [],
    status: "active",
    createdAt: "2026-05-21T04:00:00.000Z",
    updatedAt: "2026-05-21T04:00:00.000Z"
  };
}

function customer360Response(conversationId: string, contactId: string) {
  return {
    selectedConversationId: conversationId,
    contact: contactResponse(contactId),
    owner: "Demo",
    priority: "medium",
    status: "open",
    identities: contactResponse(contactId).identities,
    recentConversations: [{
      id: conversationId,
      tenantId: defaultTenantId,
      roomId: "room-webchat",
      tab: "human",
      platform: "webchat",
      platformLabel: "Webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      accountName: "Main Website",
      customerName: "API Contact",
      customerEmail: "api@example.local",
      customerPhone: "000",
      lastMessage: "hello",
      lastMessageAt: "2026-05-21T04:00:00.000Z",
      lastMessageTime: "11:00",
      unreadCount: 1,
      assignedAgent: null,
      tags: [],
      aiStatus: "Need Human",
      priority: "medium",
      status: "open",
      unreplied: true
    }],
    notes: [customer360NoteResponse("note-customer-360", conversationId, contactId)],
    tasks: [contactTaskResponse("task-customer-360", conversationId, contactId)],
    broadcastHistorySummary: {
      contactId,
      customerId: contactId,
      identityId: "identity-api",
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      roomId: "room-webchat",
      conversationId,
      lastCampaignId: "campaign-api",
      lastCampaignName: "Persisted campaign",
      sentMockCount: 1,
      optOut: false,
      externalCalls: 0,
      rows: [{
        id: "send-log-api",
        contactId,
        customerId: contactId,
        identityId: "identity-api",
        campaignId: "campaign-api",
        campaignName: "Persisted campaign",
        campaignStatus: "sent",
        platform: "webchat",
        channelAccountId: "00000000-0000-4000-8000-000000000020",
        roomId: "room-webchat",
        conversationId,
        status: "sent_mock",
        reason: "safe mock send only; no external outbound call was made",
        sentAt: "2026-05-21T04:00:00.000Z",
        queuedAt: null,
        mockOnly: true,
        safe: true,
        externalCalls: 0
      }]
    },
    source: {
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      accountName: "Main Website",
      externalUserId: "visitor-api",
      displayName: "Visitor API"
    }
  };
}

function customer360NoteResponse(id: string, conversationId: string, contactId: string) {
  return {
    id,
    tenantId: defaultTenantId,
    conversationId,
    contactId,
    customerId: contactId,
    platform: "webchat",
    channelAccountId: "00000000-0000-4000-8000-000000000020",
    roomId: "room-webchat",
    body: "Customer 360 persisted note",
    createdBy: "00000000-0000-4000-8000-000000000011",
    createdAt: "2026-05-21T04:00:00.000Z",
    updatedAt: "2026-05-21T04:00:00.000Z",
    externalCalls: 0
  };
}

function contactTaskResponse(id: string, conversationId: string, contactId: string) {
  return {
    id,
    tenantId: defaultTenantId,
    conversationId,
    contactId,
    platform: "webchat",
    channelAccountId: "00000000-0000-4000-8000-000000000020",
    roomId: "room-webchat",
    title: "Customer 360 persisted task",
    status: "open",
    assigneeUserId: null,
    dueAt: null,
    completedAt: null,
    createdAt: "2026-05-21T04:00:00.000Z",
    updatedAt: "2026-05-21T04:00:00.000Z",
    externalCalls: 0
  };
}

function conversationResponse(id: string, aiStatus = "Need Human", status = "open") {
  return {
    id,
    roomId: "room-webchat",
    tab: aiStatus === "AI Active" ? "bot" : "human",
    platform: "webchat",
    platformLabel: "Webchat",
    channelAccountId: "00000000-0000-4000-8000-000000000020",
    accountName: "Main Website",
    customerName: "API Contact",
    customerEmail: "api@example.local",
    customerPhone: "000",
    lastMessage: "hello",
    lastMessageAt: "2026-05-21T04:00:00.000Z",
    lastMessageTime: "11:00",
    unreadCount: 1,
    assignedAgent: "May",
    tags: [],
    aiStatus,
    priority: "medium",
    status,
    unreplied: true,
    followUpAt: status === "follow_up" ? "2026-05-22T04:00:00.000Z" : undefined
  };
}

function internalNoteResponse(id: string) {
  return {
    id,
    tenantId: defaultTenantId,
    conversationId: "conv-web",
    contactId: "contact-api",
    customerId: "contact-api",
    platform: "webchat",
    channelAccountId: "00000000-0000-4000-8000-000000000020",
    roomId: "room-webchat",
    body: "persist this",
    visibility: "team",
    createdBy: "00000000-0000-4000-8000-000000000011",
    createdAt: "2026-05-21T04:00:00.000Z",
    updatedAt: "2026-05-21T04:00:00.000Z",
    pinned: false,
    externalCalls: 0
  };
}

function taskResponse(id: string) {
  return {
    id,
    tenantId: defaultTenantId,
    conversationId: "conv-web",
    contactId: "contact-api",
    platform: "webchat",
    channelAccountId: "00000000-0000-4000-8000-000000000020",
    roomId: "room-webchat",
    title: "Follow up",
    status: "open",
    assigneeUserId: null,
    createdByUserId: "00000000-0000-4000-8000-000000000011",
    dueAt: null,
    completedAt: null,
    createdAt: "2026-05-21T04:00:00.000Z",
    updatedAt: "2026-05-21T04:00:00.000Z",
    externalCalls: 0
  };
}

function taskDashboardResponse(id: string, conversationId: string) {
  return {
    ...taskResponse(id),
    conversationId,
    conversationTab: "human",
    conversationStatus: "open",
    conversationPriority: "medium",
    customerName: "API Contact",
    assignedAgentName: "May",
    accountName: "Main Website",
    platformLabel: "Webchat",
    lastMessageAt: "2026-05-21T04:00:00.000Z"
  };
}

function auditLogResponse(id: string) {
  return {
    id,
    tenantId: "00000000-0000-4000-8000-000000000001",
    conversationId: "conv-web",
    platform: "webchat",
    channelAccountId: "00000000-0000-4000-8000-000000000020",
    roomId: "room-webchat",
    actorUserId: "00000000-0000-4000-8000-000000000011",
    action: "conversation.status_updated",
    beforeJson: { status: "open" },
    afterJson: { status: "closed" },
    metadataJson: {
      fromStatus: "open",
      toStatus: "closed",
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      roomId: "room-webchat"
    },
    createdAt: "2026-05-21T04:00:00.000Z"
  };
}

function statusHistoryResponse(id: string) {
  return {
    id,
    tenantId: "00000000-0000-4000-8000-000000000001",
    conversationId: "conv-web",
    platform: "webchat",
    channelAccountId: "00000000-0000-4000-8000-000000000020",
    roomId: "room-webchat",
    actorUserId: "00000000-0000-4000-8000-000000000011",
    fromStatus: "open",
    toStatus: "closed",
    metadataJson: {
      source: "status_endpoint",
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      roomId: "room-webchat"
    },
    createdAt: "2026-05-21T04:00:00.000Z"
  };
}

function knowledgeBaseResponse(id: string) {
  return {
    id,
    tenantId: "00000000-0000-4000-8000-000000000001",
    name: id === "kb-api" ? "API KB" : "New KB",
    description: "Knowledge from API",
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
    title: id === "doc-api" ? "API Doc" : "New Doc",
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
    content: id === "chunk-api" ? "API chunk" : "New chunk",
    metadataJson: { section: "demo" },
    createdAt: "2026-05-21T04:00:00.000Z",
    updatedAt: "2026-05-21T04:00:00.000Z"
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
    knowledgeBaseIds: [],
    updatedAt: "2026-05-21T04:00:00.000Z"
  };
}

function aiSuggestionResponse(id: string, conversationId: string) {
  return {
    suggestionId: id,
    aiRunId: id,
    tenantId: "00000000-0000-4000-8000-000000000001",
    conversationId,
    platform: "webchat",
    channelAccountId: "00000000-0000-4000-8000-000000000020",
    roomId: "room-webchat",
    summary: "Customer asks for pricing.",
    suggestedReply: "ราคาเริ่มต้นตามแพ็กเกจครับ",
    intent: "pricing",
    confidence: 0.9,
    riskLevel: "low",
    nextAction: "suggest_reply",
    requiresHuman: false,
    sources: [{
      id: "doc-price",
      title: "Pricing FAQ",
      category: "price_rules",
      matchReason: "Matched keywords: price",
      sourceType: "knowledge_doc",
      sourceUrl: null
    }],
    status: "completed",
    error: null,
    externalCalls: 0,
    generatedAt: "2026-05-21T04:00:00.000Z"
  };
}

function aiFeedbackResponse(id: string, suggestionId: string, conversationId: string) {
  return {
    feedbackId: id,
    suggestionId,
    aiRunId: suggestionId,
    tenantId: "00000000-0000-4000-8000-000000000001",
    conversationId,
    platform: "webchat",
    channelAccountId: "00000000-0000-4000-8000-000000000020",
    roomId: "room-webchat",
    feedbackType: "mark_wrong",
    actionType: "feedback.mark_wrong",
    externalCalls: 0,
    createdAt: "2026-05-21T04:00:00.000Z"
  };
}
