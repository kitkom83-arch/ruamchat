import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  findCannedReplyInList,
  getCannedRepliesForMode,
  loadSettingsChannelsData,
  loadSettingsProviderWebhookCandidateData,
  loadSettingsProviderWebhookDiagnosticsData,
  loadSettingsProviderWebhookHistoryData,
  loadSettingsProviderWebhookReviewAlertsData,
  loadSettingsProviderWebhookReviewMetricsData,
  loadSettingsProviderWebhookReviewTriageData,
  loadSettingsProviderReadinessData,
  loadSettingsProviderWebhookEventsData,
  loadSettingsProviderWebhookUnmatchedInboundData,
  exportSettingsProviderWebhookUnmatchedInboundData,
  linkSettingsProviderWebhookUnmatchedInboundConversation,
  bulkReviewSettingsProviderWebhookUnmatchedInbound,
  createSettingsProviderWebhookSandboxEvent,
  loadSettingsTeamData,
  mapSettingsCannedReplyToCannedReply,
  reviewSettingsProviderWebhookUnmatchedInbound,
  mockProviderReadiness,
  mockProviderWebhookEvents,
  mockProviderWebhookUnmatchedInbound,
  resolveCannedReplyComposerDraft,
  mockSettingsChannels,
  searchCannedReplyList
} from "./settings-data";

const api = vi.hoisted(() => ({
  getSettingsChannels: vi.fn(),
  getSettingsCannedReplies: vi.fn(),
  getSettingsSlaPolicies: vi.fn(),
  getSettingsTeam: vi.fn(),
  getProviderReadiness: vi.fn(),
  getProviderWebhookEvents: vi.fn(),
  getProviderWebhookReviewAlerts: vi.fn(),
  getProviderWebhookReviewMetrics: vi.fn(),
  getProviderWebhookReviewTriage: vi.fn(),
  getProviderWebhookUnmatchedInbound: vi.fn(),
  getProviderWebhookUnmatchedInboundCandidates: vi.fn(),
  getProviderWebhookUnmatchedInboundDiagnostics: vi.fn(),
  getProviderWebhookUnmatchedInboundHistory: vi.fn(),
  getProviderWebhookUnmatchedInboundExport: vi.fn(),
  createProviderWebhookSandboxEvent: vi.fn(),
  reviewProviderWebhookUnmatchedInbound: vi.fn(),
  bulkReviewProviderWebhookUnmatchedInbound: vi.fn(),
  linkProviderWebhookUnmatchedInboundConversation: vi.fn()
}));

vi.mock("./api-client", () => ({
  getSettingsChannels: api.getSettingsChannels,
  getSettingsCannedReplies: api.getSettingsCannedReplies,
  getSettingsSlaPolicies: api.getSettingsSlaPolicies,
  getSettingsTeam: api.getSettingsTeam,
  getProviderReadiness: api.getProviderReadiness,
  getProviderWebhookEvents: api.getProviderWebhookEvents,
  getProviderWebhookReviewAlerts: api.getProviderWebhookReviewAlerts,
  getProviderWebhookReviewMetrics: api.getProviderWebhookReviewMetrics,
  getProviderWebhookReviewTriage: api.getProviderWebhookReviewTriage,
  getProviderWebhookUnmatchedInbound: api.getProviderWebhookUnmatchedInbound,
  getProviderWebhookUnmatchedInboundCandidates: api.getProviderWebhookUnmatchedInboundCandidates,
  getProviderWebhookUnmatchedInboundDiagnostics: api.getProviderWebhookUnmatchedInboundDiagnostics,
  getProviderWebhookUnmatchedInboundHistory: api.getProviderWebhookUnmatchedInboundHistory,
  getProviderWebhookUnmatchedInboundExport: api.getProviderWebhookUnmatchedInboundExport,
  createProviderWebhookSandboxEvent: api.createProviderWebhookSandboxEvent,
  reviewProviderWebhookUnmatchedInbound: api.reviewProviderWebhookUnmatchedInbound,
  bulkReviewProviderWebhookUnmatchedInbound: api.bulkReviewProviderWebhookUnmatchedInbound,
  linkProviderWebhookUnmatchedInboundConversation: api.linkProviderWebhookUnmatchedInboundConversation
}));

beforeEach(() => {
  api.getSettingsChannels.mockReset();
  api.getSettingsCannedReplies.mockReset();
  api.getSettingsSlaPolicies.mockReset();
  api.getSettingsTeam.mockReset();
  api.getProviderReadiness.mockReset();
  api.getProviderWebhookEvents.mockReset();
  api.getProviderWebhookReviewAlerts.mockReset();
  api.getProviderWebhookReviewMetrics.mockReset();
  api.getProviderWebhookReviewTriage.mockReset();
  api.getProviderWebhookUnmatchedInbound.mockReset();
  api.getProviderWebhookUnmatchedInboundCandidates.mockReset();
  api.getProviderWebhookUnmatchedInboundDiagnostics.mockReset();
  api.getProviderWebhookUnmatchedInboundHistory.mockReset();
  api.getProviderWebhookUnmatchedInboundExport.mockReset();
  api.createProviderWebhookSandboxEvent.mockReset();
  api.reviewProviderWebhookUnmatchedInbound.mockReset();
  api.bulkReviewProviderWebhookUnmatchedInbound.mockReset();
  api.linkProviderWebhookUnmatchedInboundConversation.mockReset();
});

describe("settings API-mode data loaders", () => {
  it("maps persisted channel accounts in API mode without exposing raw secrets", async () => {
    api.getSettingsChannels.mockResolvedValueOnce([settingsChannelResponse("channel-line", "line")]);

    const data = await loadSettingsChannelsData("api");

    expect(api.getSettingsChannels).toHaveBeenCalled();
    expect(data.mode).toBe("api");
    expect(data.channels[0]).toMatchObject({
      id: "channel-line",
      platform: "line",
      accountName: "Persisted LINE",
      hasAccessToken: true,
      tokenMasked: "configured:redacted",
      secretConfigured: true
    });
    expect(JSON.stringify(data.channels)).not.toContain("raw-line-token");
    expect(JSON.stringify(data.channels)).not.toContain("webhookSecret");
  });

  it("maps persisted agents in API mode", async () => {
    api.getSettingsTeam.mockResolvedValueOnce([settingsTeamResponse("agent-api")]);
    api.getSettingsSlaPolicies.mockResolvedValueOnce([settingsSlaPolicyResponse("sla-api")]);
    api.getSettingsCannedReplies.mockResolvedValueOnce([settingsCannedReplyResponse("reply-api")]);

    const data = await loadSettingsTeamData("api");

    expect(api.getSettingsTeam).toHaveBeenCalled();
    expect(api.getSettingsSlaPolicies).toHaveBeenCalled();
    expect(api.getSettingsCannedReplies).toHaveBeenCalled();
    expect(data.mode).toBe("api");
    expect(data.members[0]).toMatchObject({
      id: "agent-api",
      displayName: "API Agent",
      role: "agent",
      maxConcurrentChats: 6
    });
    expect(data.slaPolicies[0]).toMatchObject({
      id: "sla-api",
      priorityScope: "urgent",
      resolutionMinutes: 120
    });
    expect(data.cannedReplies[0]).toMatchObject({
      id: "reply-api",
      shortcut: "/hello",
      bodyTemplate: "Persisted hello"
    });
  });

  it("does not fallback to mock SLA policies or canned replies when API mode fails", async () => {
    api.getSettingsTeam.mockResolvedValueOnce([settingsTeamResponse("agent-api")]);
    api.getSettingsSlaPolicies.mockRejectedValueOnce(new Error("API request failed (503): sla unavailable"));
    api.getSettingsCannedReplies.mockResolvedValueOnce([settingsCannedReplyResponse("reply-api")]);

    await expect(loadSettingsTeamData("api")).rejects.toThrow("sla unavailable");

    api.getSettingsTeam.mockResolvedValueOnce([settingsTeamResponse("agent-api")]);
    api.getSettingsSlaPolicies.mockResolvedValueOnce([settingsSlaPolicyResponse("sla-api")]);
    api.getSettingsCannedReplies.mockRejectedValueOnce(new Error("API request failed (503): replies unavailable"));

    await expect(loadSettingsTeamData("api")).rejects.toThrow("replies unavailable");
  });

  it("does not fallback to mock channels when API mode fails", async () => {
    api.getSettingsChannels.mockRejectedValueOnce(new Error("API request failed (503): settings unavailable"));

    await expect(loadSettingsChannelsData("api")).rejects.toThrow("settings unavailable");
  });

  it("loads provider readiness from API mode without exposing raw values", async () => {
    api.getProviderReadiness.mockResolvedValueOnce(providerReadinessResponse());

    const data = await loadSettingsProviderReadinessData("api");

    expect(api.getProviderReadiness).toHaveBeenCalled();
    expect(data.mode).toBe("api");
    expect(data.providerReadiness.realOutboundEnabled).toBe(false);
    expect(data.providerReadiness.externalCalls).toBe(0);
    expect(data.providerReadiness.allowlistCount).toBe(2);
    expect(data.providerReadiness.providers[0]).toMatchObject({
      name: "line",
      credentialStatus: "configured",
      webhookVerificationConfigured: true
    });
    expect(data.providerReadiness.providers.every((provider) => !("allowlistCount" in provider))).toBe(true);
    expect(JSON.stringify(data.providerReadiness)).not.toContain("U-raw-provider-test");
    expect(JSON.stringify(data.providerReadiness)).not.toMatch(/token|secret|providerRaw|rawPayload|payloadJson/i);
  });

  it("does not fallback to mock provider readiness when API mode fails", async () => {
    api.getProviderReadiness.mockRejectedValueOnce(new Error("API request failed (503): readiness unavailable"));

    await expect(loadSettingsProviderReadinessData("api")).rejects.toThrow("readiness unavailable");
  });

  it("loads provider webhook events from API mode without exposing raw payload values", async () => {
    api.getProviderWebhookEvents.mockResolvedValueOnce([providerWebhookEventResponse("provider-webhook-event-api")]);

    const data = await loadSettingsProviderWebhookEventsData("api");

    expect(api.getProviderWebhookEvents).toHaveBeenCalled();
    expect(data.mode).toBe("api");
    expect(data.events[0]).toMatchObject({
      id: "provider-webhook-event-api",
      provider: "line",
      channel: "line",
      eventType: "message.created",
      externalCalls: 0
    });
    expect(JSON.stringify(data.events)).not.toContain("raw-line-token");
    expect(JSON.stringify(data.events)).not.toMatch(/token|secret|authorization|cookie|providerRaw|rawPayload|payloadJson/i);
  });

  it("loads unmatched inbound review items from API mode without exposing raw values", async () => {
    api.getProviderWebhookUnmatchedInbound.mockResolvedValueOnce(providerWebhookUnmatchedInboundPageResponse([providerWebhookUnmatchedInboundResponse("provider-webhook-unmatched-api")]));

    const data = await loadSettingsProviderWebhookUnmatchedInboundData("api");

    expect(api.getProviderWebhookUnmatchedInbound).toHaveBeenCalled();
    expect(data.mode).toBe("api");
    expect(data.items[0]).toMatchObject({
      id: "provider-webhook-unmatched-api",
      provider: "line",
      channelAccountId: "sandbox:line",
      conversationLookupStatus: "not-found",
      unmatchedStatus: "review-needed",
      externalCalls: 0
    });
    expect(JSON.stringify(data.items)).not.toContain("raw-line-token");
    expect(JSON.stringify(data.items)).not.toMatch(/token|secret|authorization|cookie|providerRaw|rawPayload|payloadJson|replyToken/i);
  });

  it("loads unmatched inbound filters and safe candidates from API mode", async () => {
    api.getProviderWebhookUnmatchedInbound.mockResolvedValueOnce(providerWebhookUnmatchedInboundPageResponse([providerWebhookUnmatchedInboundResponse("provider-webhook-unmatched-api")]));
    api.getProviderWebhookUnmatchedInboundCandidates.mockResolvedValueOnce([providerWebhookCandidateResponse("conversation-safe-internal")]);

    const unmatched = await loadSettingsProviderWebhookUnmatchedInboundData("api", {
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none"
    });
    const candidates = await loadSettingsProviderWebhookCandidateData("api", "provider-webhook-unmatched-api");

    expect(api.getProviderWebhookUnmatchedInbound).toHaveBeenCalledWith(expect.objectContaining({
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none"
    }));
    expect(api.getProviderWebhookUnmatchedInboundCandidates).toHaveBeenCalledWith("provider-webhook-unmatched-api");
    expect(unmatched.items[0]?.id).toBe("provider-webhook-unmatched-api");
    expect(candidates.candidates[0]).toMatchObject({
      conversationId: "conversation-safe-internal",
      roomIdDigest: "sha256:saferoomdigest",
      externalCalls: 0
    });
    expect(JSON.stringify(candidates)).not.toMatch(/token|secret|authorization|cookie|providerRaw|rawPayload|payloadJson|replyToken|raw-room|raw-sender/i);
  });

  it("loads unmatched history and export from API mode without exposing raw values", async () => {
    api.getProviderWebhookUnmatchedInboundHistory.mockResolvedValueOnce(providerWebhookHistoryResponse("provider-webhook-unmatched-api"));
    api.getProviderWebhookUnmatchedInboundExport.mockResolvedValueOnce(providerWebhookExportResponse([providerWebhookUnmatchedInboundResponse("provider-webhook-unmatched-api")], "csv"));

    const history = await loadSettingsProviderWebhookHistoryData("api", "provider-webhook-unmatched-api");
    const exported = await exportSettingsProviderWebhookUnmatchedInboundData("api", {
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      format: "csv",
      limit: 25,
      offset: 10,
      sortBy: "receivedAt",
      sortOrder: "asc"
    });

    expect(api.getProviderWebhookUnmatchedInboundHistory).toHaveBeenCalledWith("provider-webhook-unmatched-api");
    expect(api.getProviderWebhookUnmatchedInboundExport).toHaveBeenCalledWith(expect.objectContaining({
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      format: "csv",
      limit: 25,
      offset: 10
    }));
    expect(history.mode).toBe("api");
    expect(history.history.entries.map((entry) => entry.action)).toEqual(expect.arrayContaining(["inbound_received", "unmatched_queued"]));
    expect(exported.mode).toBe("api");
    expect(exported.exportResult).toMatchObject({
      format: "csv",
      exportedCount: 1,
      exportMaxLimit: 500,
      externalCalls: 0
    });
    expect(JSON.stringify({ history, exported })).not.toMatch(/token|secret|authorization|cookie|providerRaw|rawPayload|payloadJson|replyToken|raw-room|raw-sender|raw room|raw sender/i);
  });

  it("loads review metrics, alerts, and diagnostics from API mode without exposing raw values", async () => {
    api.getProviderWebhookReviewMetrics.mockResolvedValueOnce(providerWebhookReviewMetricsResponse());
    api.getProviderWebhookReviewAlerts.mockResolvedValueOnce(providerWebhookReviewAlertsResponse());
    api.getProviderWebhookReviewTriage.mockResolvedValueOnce(providerWebhookReviewTriageResponse());
    api.getProviderWebhookUnmatchedInboundDiagnostics.mockResolvedValueOnce(providerWebhookDiagnosticsResponse("provider-webhook-unmatched-api"));

    const metrics = await loadSettingsProviderWebhookReviewMetricsData("api", {
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      eventType: "message.created"
    });
    const alerts = await loadSettingsProviderWebhookReviewAlertsData("api", {
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      eventType: "message.created",
      severity: "critical"
    });
    const triage = await loadSettingsProviderWebhookReviewTriageData("api", {
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      eventType: "message.created",
      severity: "critical",
      triageLane: "critical_stale_open"
    });
    const diagnostics = await loadSettingsProviderWebhookDiagnosticsData("api", "provider-webhook-unmatched-api");

    expect(api.getProviderWebhookReviewMetrics).toHaveBeenCalledWith(expect.objectContaining({
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      eventType: "message.created"
    }));
    expect(api.getProviderWebhookReviewAlerts).toHaveBeenCalledWith(expect.objectContaining({
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      eventType: "message.created",
      severity: "critical"
    }));
    expect(api.getProviderWebhookReviewTriage).toHaveBeenCalledWith(expect.objectContaining({
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      eventType: "message.created",
      severity: "critical",
      triageLane: "critical_stale_open"
    }));
    expect(api.getProviderWebhookUnmatchedInboundDiagnostics).toHaveBeenCalledWith("provider-webhook-unmatched-api");
    expect(metrics.mode).toBe("api");
    expect(metrics.metrics).toMatchObject({
      totalUnmatched: 1,
      openUnmatched: 1,
      externalCalls: 0
    });
    expect(alerts.mode).toBe("api");
    expect(alerts.alerts).toMatchObject({
      totalAlerts: 1,
      criticalCount: 1,
      staleOpenCount: 1,
      overSlaCount: 1,
      externalCalls: 0
    });
    expect(triage.mode).toBe("api");
    expect(triage.triage).toMatchObject({
      totalItems: 1,
      totalOpenItems: 1,
      totalTriageLanes: 8,
      externalCalls: 0
    });
    expect(triage.triage.topItems[0]).toMatchObject({
      triageLane: "critical_stale_open",
      recommendedNextActions: expect.arrayContaining(["OPEN_DIAGNOSTICS", "VIEW_HISTORY", "APPLY_FILTER"]),
      candidatesAvailable: true,
      externalCalls: 0
    });
    expect(diagnostics.mode).toBe("api");
    expect(diagnostics.diagnostics).toMatchObject({
      unmatchedId: "provider-webhook-unmatched-api",
      platform: "line",
      channelAccountId: "sandbox:line",
      roomKeyDigest: "sha256:saferoomdigest",
      externalCalls: 0
    });
    expect(JSON.stringify({ metrics, alerts, triage, diagnostics })).not.toMatch(/token|secret|authorization|cookie|providerRaw|rawPayload|payloadJson|replyToken|raw-room|raw-sender|raw room|raw sender|senderId|roomId/i);
  });

  it("surfaces API-mode history and export failures without mutating mock state", async () => {
    const before = JSON.stringify(mockProviderWebhookUnmatchedInbound);
    api.getProviderWebhookUnmatchedInboundHistory.mockRejectedValueOnce(new Error("API request failed (503): history unavailable"));

    await expect(loadSettingsProviderWebhookHistoryData("api", "provider-webhook-unmatched-local-1"))
      .rejects.toThrow("history unavailable");

    api.getProviderWebhookUnmatchedInboundExport.mockRejectedValueOnce(new Error("API request failed (503): export unavailable"));

    await expect(exportSettingsProviderWebhookUnmatchedInboundData("api", { format: "json" }))
      .rejects.toThrow("export unavailable");

    expect(JSON.stringify(mockProviderWebhookUnmatchedInbound)).toBe(before);
  });

  it("surfaces API-mode metrics and diagnostics failures without mutating mock state", async () => {
    const before = JSON.stringify(mockProviderWebhookUnmatchedInbound);
    api.getProviderWebhookReviewMetrics.mockRejectedValueOnce(new Error("API request failed (503): metrics unavailable"));

    await expect(loadSettingsProviderWebhookReviewMetricsData("api", { provider: "line" }))
      .rejects.toThrow("metrics unavailable");

    api.getProviderWebhookReviewAlerts.mockRejectedValueOnce(new Error("API request failed (503): alerts unavailable"));

    await expect(loadSettingsProviderWebhookReviewAlertsData("api", { provider: "line" }))
      .rejects.toThrow("alerts unavailable");

    api.getProviderWebhookReviewTriage.mockRejectedValueOnce(new Error("API request failed (503): triage unavailable"));

    await expect(loadSettingsProviderWebhookReviewTriageData("api", { provider: "line" }))
      .rejects.toThrow("triage unavailable");

    api.getProviderWebhookUnmatchedInboundDiagnostics.mockRejectedValueOnce(new Error("API request failed (503): diagnostics unavailable"));

    await expect(loadSettingsProviderWebhookDiagnosticsData("api", "provider-webhook-unmatched-local-1"))
      .rejects.toThrow("diagnostics unavailable");

    expect(JSON.stringify(mockProviderWebhookUnmatchedInbound)).toBe(before);
  });

  it("creates provider webhook sandbox events through API mode without local fallback", async () => {
    api.createProviderWebhookSandboxEvent.mockResolvedValueOnce(providerWebhookEventResponse("provider-webhook-event-created", "telegram"));

    const event = await createSettingsProviderWebhookSandboxEvent("api", {
      provider: "telegram",
      eventType: "webhook.verified",
      mode: "dry_run",
      payload: { updateId: "safe-update", token: "sensitive-sample-a" }
    });

    expect(api.createProviderWebhookSandboxEvent).toHaveBeenCalledWith(expect.objectContaining({
      provider: "telegram",
      eventType: "webhook.verified",
      mode: "dry_run"
    }));
    expect(event.provider).toBe("telegram");
    expect(event.externalCalls).toBe(0);
    expect(JSON.stringify(event)).not.toContain("sensitive-sample-a");
  });

  it("runs unmatched review and link actions through API mode without local fallback", async () => {
    api.reviewProviderWebhookUnmatchedInbound.mockResolvedValueOnce({
      ...providerWebhookUnmatchedInboundResponse("provider-webhook-unmatched-api"),
      unmatchedStatus: "reviewed",
      reviewStatus: "reviewed"
    });
    api.linkProviderWebhookUnmatchedInboundConversation.mockResolvedValueOnce({
      ...providerWebhookUnmatchedInboundResponse("provider-webhook-unmatched-api"),
      unmatchedStatus: "linked",
      reviewStatus: "linked",
      linkStatus: "linked",
      linkedConversationId: "conversation-safe-internal"
    });
    api.bulkReviewProviderWebhookUnmatchedInbound.mockResolvedValueOnce(providerWebhookBulkReviewResponse("reviewed"));

    const reviewed = await reviewSettingsProviderWebhookUnmatchedInbound("api", "provider-webhook-unmatched-api", {
      status: "reviewed",
      reason: "safe review"
    });
    const linked = await linkSettingsProviderWebhookUnmatchedInboundConversation("api", "provider-webhook-unmatched-api", {
      conversationId: "conversation-safe-internal",
      actionMode: "link-only"
    });
    const bulk = await bulkReviewSettingsProviderWebhookUnmatchedInbound("api", {
      ids: ["provider-webhook-unmatched-api"],
      reviewStatus: "reviewed",
      reason: "safe bulk review"
    });

    expect(api.reviewProviderWebhookUnmatchedInbound).toHaveBeenCalledWith("provider-webhook-unmatched-api", expect.objectContaining({ status: "reviewed" }));
    expect(api.linkProviderWebhookUnmatchedInboundConversation).toHaveBeenCalledWith("provider-webhook-unmatched-api", expect.objectContaining({
      conversationId: "conversation-safe-internal",
      actionMode: "link-only"
    }));
    expect(api.bulkReviewProviderWebhookUnmatchedInbound).toHaveBeenCalledWith(expect.objectContaining({
      ids: ["provider-webhook-unmatched-api"],
      reviewStatus: "reviewed"
    }));
    expect(reviewed.reviewStatus).toBe("reviewed");
    expect(linked.linkStatus).toBe("linked");
    expect(bulk.summary.successCount).toBe(1);
    expect(JSON.stringify({ reviewed, linked, bulk })).not.toMatch(/token|secret|authorization|cookie|providerRaw|rawPayload|payloadJson|replyToken/i);
  });

  it("does not fallback to mock provider webhook events when API mode fails", async () => {
    api.getProviderWebhookEvents.mockRejectedValueOnce(new Error("API request failed (503): webhook events unavailable"));

    await expect(loadSettingsProviderWebhookEventsData("api")).rejects.toThrow("webhook events unavailable");

    api.getProviderWebhookUnmatchedInbound.mockRejectedValueOnce(new Error("API request failed (503): unmatched unavailable"));

    await expect(loadSettingsProviderWebhookUnmatchedInboundData("api")).rejects.toThrow("unmatched unavailable");

    api.getProviderWebhookUnmatchedInboundCandidates.mockRejectedValueOnce(new Error("API request failed (503): candidates unavailable"));

    await expect(loadSettingsProviderWebhookCandidateData("api", "provider-webhook-unmatched-api"))
      .rejects.toThrow("candidates unavailable");

    api.getProviderWebhookReviewTriage.mockRejectedValueOnce(new Error("API request failed (503): triage unavailable"));

    await expect(loadSettingsProviderWebhookReviewTriageData("api", { provider: "line" }))
      .rejects.toThrow("triage unavailable");

    api.getProviderWebhookUnmatchedInboundHistory.mockRejectedValueOnce(new Error("API request failed (503): history unavailable"));

    await expect(loadSettingsProviderWebhookHistoryData("api", "provider-webhook-unmatched-api"))
      .rejects.toThrow("history unavailable");

    api.getProviderWebhookUnmatchedInboundExport.mockRejectedValueOnce(new Error("API request failed (503): export unavailable"));

    await expect(exportSettingsProviderWebhookUnmatchedInboundData("api", { format: "json" }))
      .rejects.toThrow("export unavailable");

    api.createProviderWebhookSandboxEvent.mockRejectedValueOnce(new Error("API request failed (503): sandbox intake unavailable"));

    await expect(createSettingsProviderWebhookSandboxEvent("api", {
      provider: "line",
      eventType: "message.created",
      mode: "dry_run",
      payload: { safe: true }
    })).rejects.toThrow("sandbox intake unavailable");

    api.reviewProviderWebhookUnmatchedInbound.mockRejectedValueOnce(new Error("API request failed (503): review unavailable"));

    await expect(reviewSettingsProviderWebhookUnmatchedInbound("api", "provider-webhook-unmatched-api", { status: "reviewed" }))
      .rejects.toThrow("review unavailable");

    api.bulkReviewProviderWebhookUnmatchedInbound.mockRejectedValueOnce(new Error("API request failed (503): bulk unavailable"));

    await expect(bulkReviewSettingsProviderWebhookUnmatchedInbound("api", {
      ids: ["provider-webhook-unmatched-api"],
      reviewStatus: "reviewed"
    })).rejects.toThrow("bulk unavailable");

    api.linkProviderWebhookUnmatchedInboundConversation.mockRejectedValueOnce(new Error("API request failed (503): link unavailable"));

    await expect(linkSettingsProviderWebhookUnmatchedInboundConversation("api", "provider-webhook-unmatched-api", {
      conversationId: "conversation-safe-internal",
      actionMode: "link-only"
    })).rejects.toThrow("link unavailable");
  });

  it("keeps API-mode review and link failures from mutating local unmatched state", async () => {
    const before = JSON.stringify(mockProviderWebhookUnmatchedInbound);
    api.reviewProviderWebhookUnmatchedInbound.mockRejectedValueOnce(new Error("API request failed (503): review unavailable"));

    await expect(reviewSettingsProviderWebhookUnmatchedInbound("api", "provider-webhook-unmatched-local-1", { status: "reviewed" }))
      .rejects.toThrow("review unavailable");

    api.bulkReviewProviderWebhookUnmatchedInbound.mockRejectedValueOnce(new Error("API request failed (503): bulk unavailable"));

    await expect(bulkReviewSettingsProviderWebhookUnmatchedInbound("api", {
      ids: ["provider-webhook-unmatched-local-1"],
      reviewStatus: "reviewed"
    })).rejects.toThrow("bulk unavailable");

    api.linkProviderWebhookUnmatchedInboundConversation.mockRejectedValueOnce(new Error("API request failed (503): link unavailable"));

    await expect(linkSettingsProviderWebhookUnmatchedInboundConversation("api", "provider-webhook-unmatched-local-1", {
      conversationId: "conversation-safe-internal",
      actionMode: "link-and-persist-safe-message"
    })).rejects.toThrow("link unavailable");

    expect(JSON.stringify(mockProviderWebhookUnmatchedInbound)).toBe(before);
  });

  it("does not fallback to mock team when API mode fails", async () => {
    api.getSettingsTeam.mockRejectedValueOnce(new Error("API request failed (503): team unavailable"));
    api.getSettingsSlaPolicies.mockResolvedValueOnce([settingsSlaPolicyResponse("sla-api")]);
    api.getSettingsCannedReplies.mockResolvedValueOnce([settingsCannedReplyResponse("reply-api")]);

    await expect(loadSettingsTeamData("api")).rejects.toThrow("team unavailable");
  });

  it("keeps settings channels and team mock/local mode available", async () => {
    const channels = await loadSettingsChannelsData("mock");
    const team = await loadSettingsTeamData("mock");
    const readiness = await loadSettingsProviderReadinessData("mock");
    const metrics = await loadSettingsProviderWebhookReviewMetricsData("mock", {
      provider: "line",
      limit: 10,
      offset: 0,
      sortBy: "receivedAt",
      sortOrder: "desc"
    } as Parameters<typeof loadSettingsProviderWebhookReviewMetricsData>[1]);
    const alerts = await loadSettingsProviderWebhookReviewAlertsData("mock", {
      provider: "line",
      severity: "critical"
    });
    const triage = await loadSettingsProviderWebhookReviewTriageData("mock", {
      provider: "line",
      triageLane: "critical_stale_open"
    });

    expect(channels.channels).toEqual(mockSettingsChannels);
    expect(readiness.providerReadiness).toEqual(mockProviderReadiness);
    expect((await loadSettingsProviderWebhookEventsData("mock")).events).toEqual(mockProviderWebhookEvents);
    expect((await loadSettingsProviderWebhookUnmatchedInboundData("mock")).items[0]?.unmatchedStatus).toBe("review-needed");
    expect(metrics.metrics.externalCalls).toBe(0);
    expect(metrics.metrics.appliedFilters).toEqual({ provider: "line" });
    expect(alerts.alerts.externalCalls).toBe(0);
    expect(alerts.alerts.appliedFilters).toEqual({ provider: "line", severity: "critical" });
    expect(alerts.alerts.bySeverity.find((item) => item.key === "critical")?.count).toBeGreaterThanOrEqual(0);
    expect(triage.triage.externalCalls).toBe(0);
    expect(triage.triage.appliedFilters).toEqual({ provider: "line", triageLane: "critical_stale_open" });
    expect(triage.triage.topItems.every((item) => item.triageLane === "critical_stale_open")).toBe(true);
    expect((await loadSettingsProviderWebhookDiagnosticsData("mock", "provider-webhook-unmatched-local-1")).diagnostics.safeRoomLabel).toContain("room digest");
    expect(team.members.map((member) => member.id)).toEqual(["agent-may", "agent-ton", "agent-beam", "agent-nok"]);
    expect(team.slaPolicies.map((policy) => policy.priorityScope)).toEqual(["low", "medium", "high", "urgent"]);
    expect(team.cannedReplies.map((reply) => reply.shortcut)).toEqual(["/hello", "/price", "/followup", "/human"]);
    expect(api.getSettingsChannels).not.toHaveBeenCalled();
    expect(api.getSettingsTeam).not.toHaveBeenCalled();
    expect(api.getSettingsSlaPolicies).not.toHaveBeenCalled();
    expect(api.getSettingsCannedReplies).not.toHaveBeenCalled();
    expect(api.getProviderReadiness).not.toHaveBeenCalled();
    expect(api.getProviderWebhookReviewTriage).not.toHaveBeenCalled();
    expect(api.getProviderWebhookReviewAlerts).not.toHaveBeenCalled();
    expect(api.getProviderWebhookReviewMetrics).not.toHaveBeenCalled();
    expect(api.getProviderWebhookUnmatchedInboundDiagnostics).not.toHaveBeenCalled();
    expect(api.getProviderWebhookUnmatchedInbound).not.toHaveBeenCalled();
  });

  it("keeps mock/local bulk unmatched review available safely", async () => {
    const beforeItems = mockProviderWebhookUnmatchedInbound.map((item) => ({ ...item }));
    const beforeReadiness = { ...mockProviderReadiness };
    try {
      const result = await bulkReviewSettingsProviderWebhookUnmatchedInbound("mock", {
        ids: ["provider-webhook-unmatched-local-1", "provider-webhook-unmatched-local-1"],
        reviewStatus: "reviewed",
        reason: "safe local bulk"
      });

      expect(result.summary).toMatchObject({
        requestedCount: 2,
        dedupedCount: 1,
        successCount: 1,
        errorCount: 0
      });
      expect(result.results[0]).toMatchObject({
        id: "provider-webhook-unmatched-local-1",
        resultStatus: "updated",
        reviewStatus: "reviewed",
        externalCalls: 0
      });
      expect(api.bulkReviewProviderWebhookUnmatchedInbound).not.toHaveBeenCalled();
      expect(JSON.stringify(result)).not.toMatch(/token|secret|authorization|cookie|providerRaw|rawPayload|payloadJson|replyToken/i);
    } finally {
      mockProviderWebhookUnmatchedInbound.splice(0, mockProviderWebhookUnmatchedInbound.length, ...beforeItems);
      Object.assign(mockProviderReadiness, beforeReadiness);
    }
  });

  it("maps inbox canned replies from API responses and keeps API empty states separate from mock data", () => {
    const reply = mapSettingsCannedReplyToCannedReply(settingsCannedReplyResponse("reply-api"));

    expect(reply).toMatchObject({
      id: "reply-api",
      body: "Persisted hello",
      isActive: true
    });
    expect(searchCannedReplyList([reply], "hello").map((item) => item.id)).toEqual(["reply-api"]);
    expect(findCannedReplyInList([reply], "/hello extra")?.body).toBe("Persisted hello");
    expect(searchCannedReplyList([], "price")).toEqual([]);
  });

  it("uses only API canned reply data as the inbox source in API mode", () => {
    const apiReply = mapSettingsCannedReplyToCannedReply({
      ...settingsCannedReplyResponse("reply-api"),
      shortcut: "/apihello",
      bodyTemplate: "Persisted API hello"
    });
    const localReply = {
      id: "reply-local",
      title: "Local hello",
      shortcut: "/hello",
      body: "สวัสดีครับ สนใจเรื่องไหนครับ",
      tags: ["hello"],
      category: "general",
      isActive: true
    };

    const source = getCannedRepliesForMode("api", [apiReply], [localReply]);

    expect(source.map((reply) => reply.shortcut)).toEqual(["/apihello"]);
    expect(source.map((reply) => reply.body)).not.toContain("สวัสดีครับ สนใจเรื่องไหนครับ");
  });

  it("keeps mock/local canned reply data as the inbox source in mock mode", () => {
    const localReply = {
      id: "reply-local",
      title: "Local hello",
      shortcut: "/hello",
      body: "สวัสดีครับ สนใจเรื่องไหนครับ",
      tags: ["hello"],
      category: "general",
      isActive: true
    };

    expect(getCannedRepliesForMode("mock", [], [localReply])).toEqual([localReply]);
  });

  it("keeps API-mode canned reply failure empty instead of falling back to local replies", () => {
    const localReply = {
      id: "reply-local",
      title: "Local hello",
      shortcut: "/hello",
      body: "สวัสดีครับ สนใจเรื่องไหนครับ",
      tags: ["hello"],
      category: "general",
      isActive: true
    };

    expect(getCannedRepliesForMode("api", [], [localReply])).toEqual([]);
  });

  it("resolves an API canned reply into a composer draft without outbound calls", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const providerSend = vi.fn();
    const apiReply = mapSettingsCannedReplyToCannedReply({
      ...settingsCannedReplyResponse("reply-api"),
      bodyTemplate: "Persisted API body"
    });

    const draft = resolveCannedReplyComposerDraft([apiReply], "reply-api");

    expect(draft).toMatchObject({
      replyId: "reply-api",
      shortcut: "/hello",
      body: "Persisted API body"
    });
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(providerSend).not.toHaveBeenCalled();
  });
});

function settingsChannelResponse(id: string, platform: "webchat" | "line") {
  return {
    id,
    platform,
    accountName: platform === "line" ? "Persisted LINE" : "Persisted Webchat",
    accountKey: platform === "webchat" ? "demo-webchat" : null,
    status: "active",
    webhookUrl: `http://localhost:4000/webhooks/${platform}/${id}`,
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
    name: "API Agent",
    displayName: "API Agent",
    role: "agent",
    email: "agent@example.local",
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

function providerReadinessResponse() {
  return {
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
    reviewTriageEnabled: true,
    triageGuidanceEnabled: true,
    reviewAlertCriticalCount: 1,
    criticalTriageCount: 1,
    openTriageCount: 1,
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
    tenantId: "00000000-0000-4000-8000-000000000001",
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
    unmatchedInboundId: "provider-webhook-unmatched-api",
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
    tenantId: "00000000-0000-4000-8000-000000000001",
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

function providerWebhookUnmatchedInboundPageResponse(items = [providerWebhookUnmatchedInboundResponse("provider-webhook-unmatched-api")]) {
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

function providerWebhookBulkReviewResponse(reviewStatus: "reviewed" | "skipped") {
  return {
    reviewStatus,
    results: [
      {
        id: "provider-webhook-unmatched-api",
        ok: true,
        resultStatus: "updated",
        reviewStatus,
        unmatchedStatus: reviewStatus,
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

function providerWebhookExportResponse(items = [providerWebhookUnmatchedInboundResponse("provider-webhook-unmatched-api")], format: "json" | "csv" = "json") {
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
    csv: format === "csv" ? "id,provider\nprovider-webhook-unmatched-api,line" : null,
    appliedFilters: {
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
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
      eventType: "message.created"
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
      eventType: "message.created",
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
      unmatchedId: "provider-webhook-unmatched-api",
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

function providerWebhookReviewTriageResponse() {
  return {
    generatedAt: "2026-05-31T00:07:00.000Z",
    appliedFilters: {
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      eventType: "message.created",
      severity: "critical",
      triageLane: "critical_stale_open"
    },
    totalItems: 1,
    totalOpenItems: 1,
    totalTriageLanes: 8,
    thresholds: {
      staleWarningHours: 24,
      staleCriticalHours: 72,
      overSlaHours: 48
    },
    lanes: [
      {
        laneKey: "critical_stale_open",
        label: "Critical stale open",
        severity: "critical",
        count: 1,
        description: "Open unmatched inbound items past the critical review threshold.",
        recommendedNextActions: ["OPEN_DIAGNOSTICS", "VIEW_HISTORY", "APPLY_FILTER", "MARK_REVIEWED", "SKIP"],
        safeDrilldownFilters: { status: "open" }
      }
    ],
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
    byLane: [
      { key: "critical_stale_open", label: "critical_stale_open", count: 1 },
      { key: "warning_stale_open", label: "warning_stale_open", count: 0 },
      { key: "candidate_lookup_recommended", label: "candidate_lookup_recommended", count: 0 },
      { key: "safe_link_candidate_available", label: "safe_link_candidate_available", count: 0 },
      { key: "needs_manual_review", label: "needs_manual_review", count: 0 },
      { key: "recently_reviewed", label: "recently_reviewed", count: 0 },
      { key: "skipped_ignored", label: "skipped_ignored", count: 0 },
      { key: "failed_routing_missing_match", label: "failed_routing_missing_match", count: 0 }
    ],
    topItems: [{
      unmatchedId: "provider-webhook-unmatched-api",
      provider: "line",
      platform: "line",
      channelAccountId: "sandbox:line",
      safeRoomLabel: "line room digest saferoomdige",
      roomKeyDigest: "sha256:saferoomdigest",
      eventType: "message.created",
      receivedAt: "2026-05-31T00:00:00.000Z",
      ageBucket: "over3Days",
      triageLane: "critical_stale_open",
      severity: "critical",
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      routingOutcome: "dry-run-only/not-found",
      recommendedNextActions: ["OPEN_DIAGNOSTICS", "VIEW_HISTORY", "APPLY_FILTER", "MARK_REVIEWED", "SKIP"],
      diagnosticsAvailable: true,
      historyAvailable: true,
      candidatesAvailable: true,
      exportAvailable: true,
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
