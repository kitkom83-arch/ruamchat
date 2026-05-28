import { afterEach, describe, expect, it, vi } from "vitest";
import {
  approveBroadcastCampaign,
  cancelBroadcastCampaignApproval,
  createBroadcastCampaign,
  createBroadcastSegment,
  deleteBroadcastCampaign,
  deleteBroadcastSegment,
  dryRunBroadcastAudience,
  duplicateBroadcastCampaign,
  getBroadcastCampaignAnalytics,
  getBroadcastCampaignDetail,
  getBroadcastComplianceHistory,
  getBroadcastComplianceLogs,
  getBroadcastDeliveryExport,
  getBroadcastSendLogPage,
  previewBroadcastAudience,
  rejectBroadcastCampaign,
  requestBroadcastCampaignApproval,
  scheduleBroadcastCampaign,
  sendBroadcastNow,
  sendBroadcastTest,
  updateBroadcastCampaign,
  updateBroadcastSegment
} from "./api-client";
import { loadBroadcastBuilderData } from "./broadcast-data";

const defaultTenantId = "00000000-0000-4000-8000-000000000001";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Broadcast API mode frontend", () => {
  it("keeps mock mode local without API calls", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("should not call API"));

    const data = await loadBroadcastBuilderData("mock");

    expect(data.mode).toBe("mock");
    expect(data.store.campaigns.length).toBeGreaterThan(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("loads campaigns, segments, and send logs from API mode endpoints", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse([campaignResponse("campaign-api")]))
      .mockResolvedValueOnce(jsonResponse([segmentResponse("segment-api")]))
      .mockResolvedValueOnce(jsonResponse(sendLogPageResponse([sendLogResponse("log-api", "campaign-api", "sent_mock")])))
      .mockResolvedValueOnce(jsonResponse(complianceLogPageResponse([complianceLogResponse("audit-api", "campaign-api")])))
      .mockResolvedValueOnce(jsonResponse(analyticsResponse("campaign-api", [sendLogResponse("log-api", "campaign-api", "sent_mock")])))
      .mockResolvedValueOnce(jsonResponse(deliveryExportResponse("campaign-api", [sendLogResponse("log-api", "campaign-api", "sent_mock")])));

    const data = await loadBroadcastBuilderData("api");

    expect(data.mode).toBe("api");
    expect(data.store.campaigns[0]?.name).toBe("API Broadcast");
    expect(data.store.segments[0]?.name).toBe("API Segment");
    expect(data.sendLogs[0]?.status).toBe("sent_mock");
    expect(data.complianceLogs[0]?.reason).toBe("do_not_contact");
    expect(data.analytics?.counts.sent).toBe(1);
    expect(data.deliveryExport?.rowCount).toBe(1);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("/broadcasts/campaigns");
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain("/broadcasts/segments");
    expect(String(fetchMock.mock.calls[2]?.[0])).toContain("/broadcasts/send-logs?");
    expect(String(fetchMock.mock.calls[2]?.[0])).toContain("limit=200");
    expect(String(fetchMock.mock.calls[3]?.[0])).toContain("/broadcasts/compliance-logs?limit=200");
    expect(String(fetchMock.mock.calls[4]?.[0])).toContain("/broadcasts/campaigns/campaign-api/analytics?");
    expect(String(fetchMock.mock.calls[5]?.[0])).toContain("/broadcasts/campaigns/campaign-api/delivery-export?");
  });

  it("surfaces API errors instead of silently falling back to mock broadcast data", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "broadcasts unavailable" }, 503));

    await expect(loadBroadcastBuilderData("api")).rejects.toThrow("API request failed (503): broadcasts unavailable");
  });

  it("loads safe campaign detail and filtered delivery log pages with tenant headers", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(campaignDetailResponse("campaign-api")))
      .mockResolvedValueOnce(jsonResponse(sendLogPageResponse([sendLogResponse("log-api", "campaign-api", "blocked", {
        reason: "do_not_contact",
        contactIdentityId: "identity-api"
      })], { limit: 25, total: 1 })));

    const detail = await getBroadcastCampaignDetail("campaign-api");
    const page = await getBroadcastSendLogPage({
      campaignId: "campaign-api",
      status: "blocked",
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      roomId: "room-webchat",
      conversationId: "conv-api",
      contactId: "contact-api",
      limit: 25,
      offset: 0
    });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/broadcasts/campaigns/campaign-api", expect.objectContaining({
      headers: expect.objectContaining({ "x-tenant-id": defaultTenantId })
    }));
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain("/broadcasts/send-logs?");
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain("campaignId=campaign-api");
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain("status=blocked");
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain("roomId=room-webchat");
    expect(fetchMock.mock.calls[1]?.[1]).toEqual(expect.objectContaining({
      headers: expect.objectContaining({ "x-tenant-id": defaultTenantId })
    }));
    expect(detail).toMatchObject({
      campaignId: "campaign-api",
      name: "API Broadcast",
      status: "draft",
      suppressionCount: 1,
      externalCalls: 0
    });
    expect(page.items[0]).toMatchObject({
      tenantId: defaultTenantId,
      campaignId: "campaign-api",
      customerId: "contact-api",
      contactId: "contact-api",
      conversationId: "conv-api",
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      roomId: "room-webchat",
      status: "blocked",
      reason: "do_not_contact",
      externalCalls: 0
    });
    expect(page).toMatchObject({ limit: 25, offset: 0, total: 1, nextOffset: null, externalCalls: 0 });
    expect(JSON.stringify({ detail, page })).not.toMatch(/contentJson|accessToken|webhookSecret|botToken|apiKey|Bearer|sk-/i);
  });

  it("loads broadcast analytics and delivery export with tenant headers and safe DTOs", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(analyticsResponse("campaign-api", [
        sendLogResponse("log-sent", "campaign-api", "sent_mock"),
        sendLogResponse("log-blocked", "campaign-api", "blocked", { reason: "do_not_contact" })
      ])))
      .mockResolvedValueOnce(jsonResponse(deliveryExportResponse("campaign-api", [
        sendLogResponse("log-sent", "campaign-api", "sent_mock")
      ])));

    const analytics = await getBroadcastCampaignAnalytics("campaign-api", {
      campaignId: "campaign-api",
      status: "sent_mock",
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      roomId: "room-webchat",
      limit: 25,
      offset: 0
    });
    const exported = await getBroadcastDeliveryExport("campaign-api", {
      campaignId: "campaign-api",
      status: "sent_mock",
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      roomId: "room-webchat",
      limit: 25,
      offset: 0
    });

    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("/broadcasts/campaigns/campaign-api/analytics?");
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("status=sent_mock");
    expect(fetchMock.mock.calls[0]?.[1]).toEqual(expect.objectContaining({
      headers: expect.objectContaining({ "x-tenant-id": defaultTenantId })
    }));
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain("/broadcasts/campaigns/campaign-api/delivery-export?");
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain("roomId=room-webchat");
    expect(fetchMock.mock.calls[1]?.[1]).toEqual(expect.objectContaining({
      headers: expect.objectContaining({ "x-tenant-id": defaultTenantId })
    }));
    expect(analytics).toMatchObject({
      tenantId: defaultTenantId,
      campaignId: "campaign-api",
      counts: {
        total: 2,
        sent: 1,
        providerSuccess: 1,
        blocked: 1,
        externalCalls: 0
      },
      externalCalls: 0
    });
    expect(exported.rowCount).toBe(exported.rows.length);
    expect(exported.rows[0]).toMatchObject({
      tenantId: defaultTenantId,
      campaignId: "campaign-api",
      contactId: "contact-api",
      conversationId: "conv-api",
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      roomId: "room-webchat",
      status: "sent_mock",
      externalCalls: 0
    });
    expect(JSON.stringify({ analytics, exported })).not.toMatch(/payloadJson|accessToken|refreshToken|authorization|webhookSecret|botToken|apiKey|Bearer|sk-|providerRaw|rawPayload/i);
  });

  it("surfaces analytics and export API errors without mock fallback", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ message: "analytics unavailable" }, 503))
      .mockResolvedValueOnce(jsonResponse({ message: "export unavailable" }, 503));

    await expect(getBroadcastCampaignAnalytics("campaign-api")).rejects.toThrow("API request failed (503): analytics unavailable");
    await expect(getBroadcastDeliveryExport("campaign-api")).rejects.toThrow("API request failed (503): export unavailable");
  });

  it("persists draft, scheduling, and approval actions through API mode with tenant headers", async () => {
    const scheduledAt = "2099-05-23T04:00:00.000Z";
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(campaignResponse("campaign-api", "Draft Updated", { message: "Updated body" })))
      .mockResolvedValueOnce(jsonResponse(campaignResponse("campaign-api", "Draft Updated", { status: "scheduled", scheduleAt: scheduledAt, scheduledAt, lastWorkflowAction: "schedule" })))
      .mockResolvedValueOnce(jsonResponse(campaignResponse("campaign-api", "Draft Updated", { status: "pending_approval", approvalStatus: "pending_approval", approvalNote: "review", lastWorkflowAction: "request_approval" })))
      .mockResolvedValueOnce(jsonResponse(campaignResponse("campaign-api", "Draft Updated", { status: "approved", approvalStatus: "approved", approvalReviewedBy: "00000000-0000-4000-8000-000000000011", lastWorkflowAction: "approve" })))
      .mockResolvedValueOnce(jsonResponse(campaignResponse("campaign-api", "Draft Updated", { status: "rejected", approvalStatus: "rejected", approvalNote: "needs edit", lastWorkflowAction: "reject" })))
      .mockResolvedValueOnce(jsonResponse(campaignResponse("campaign-api", "Draft Updated", { status: "draft", approvalStatus: "draft", lastWorkflowAction: "cancel_approval" })));

    const updated = await updateBroadcastCampaign("campaign-api", { name: "Draft Updated", message: "Updated body", status: "draft" });
    const scheduled = await scheduleBroadcastCampaign("campaign-api", { scheduleAt: scheduledAt });
    const requested = await requestBroadcastCampaignApproval("campaign-api", { note: "review" });
    const approved = await approveBroadcastCampaign("campaign-api", { note: "approved" });
    const rejected = await rejectBroadcastCampaign("campaign-api", { note: "needs edit" });
    const returned = await cancelBroadcastCampaignApproval("campaign-api", { note: "return draft" });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/broadcasts/campaigns/campaign-api", expect.objectContaining({ method: "PATCH" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/broadcasts/campaigns/campaign-api/schedule", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/broadcasts/campaigns/campaign-api/request-approval", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/broadcasts/campaigns/campaign-api/approve", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/broadcasts/campaigns/campaign-api/reject", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/broadcasts/campaigns/campaign-api/cancel-approval", expect.objectContaining({ method: "POST" }));
    expectTenantHeaderForAll(fetchMock);
    expect(updated.message).toBe("Updated body");
    expect(scheduled).toMatchObject({ status: "scheduled", scheduleAt: scheduledAt, lastWorkflowAction: "schedule" });
    expect(requested).toMatchObject({ status: "pending_approval", approvalStatus: "pending_approval", approvalNote: "review" });
    expect(approved).toMatchObject({ status: "approved", approvalStatus: "approved", approvalReviewedBy: "00000000-0000-4000-8000-000000000011" });
    expect(rejected).toMatchObject({ status: "rejected", approvalStatus: "rejected", approvalNote: "needs edit" });
    expect(returned).toMatchObject({ status: "draft", approvalStatus: "draft", lastWorkflowAction: "cancel_approval" });
    expect(JSON.stringify({ updated, scheduled, requested, approved, rejected, returned })).not.toMatch(/accessToken|webhookSecret|botToken|apiKey|Bearer|sk-|providerRaw|rawPayload/i);
  });

  it("surfaces schedule and approval API errors without mutating local mock state", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ message: "schedule unavailable" }, 503))
      .mockResolvedValueOnce(jsonResponse({ message: "approval unavailable" }, 503));
    const mockData = await loadBroadcastBuilderData("mock");
    const before = JSON.stringify(mockData.store.campaigns);

    await expect(scheduleBroadcastCampaign("campaign-api", { scheduleAt: "2099-05-23T04:00:00.000Z" })).rejects.toThrow("API request failed (503): schedule unavailable");
    await expect(requestBroadcastCampaignApproval("campaign-api", { note: "review" })).rejects.toThrow("API request failed (503): approval unavailable");

    expect(JSON.stringify(mockData.store.campaigns)).toBe(before);
  });

  it("calls campaign, audience, send, log, and segment endpoints", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(campaignResponse("campaign-created", "Created Broadcast")))
      .mockResolvedValueOnce(jsonResponse({ ...campaignResponse("campaign-created", "Updated Broadcast"), status: "paused" }))
      .mockResolvedValueOnce(jsonResponse(campaignResponse("campaign-copy", "API Broadcast Copy")))
      .mockResolvedValueOnce(jsonResponse({ ...campaignResponse("campaign-created", "Updated Broadcast"), status: "archived" }))
      .mockResolvedValueOnce(jsonResponse(audiencePreviewResponse("campaign-created")))
      .mockResolvedValueOnce(jsonResponse(audiencePreviewResponse("campaign-created", {
        suppressedCount: 1,
        suppressedByReason: { do_not_contact: 1 },
        suppressedRecipients: [{
          tenantId: defaultTenantId,
          customerId: "contact-blocked",
          contactId: "contact-blocked",
          conversationId: "conv-blocked",
          platform: "webchat",
          channelAccountId: "00000000-0000-4000-8000-000000000020",
          roomId: "room-webchat",
          reason: "do_not_contact",
          externalCalls: 0
        }]
      })))
      .mockResolvedValueOnce(jsonResponse(sendResultResponse("campaign-created", "sent_mock")))
      .mockResolvedValueOnce(jsonResponse(sendResultResponse("campaign-created", "skipped_mock")))
      .mockResolvedValueOnce(jsonResponse([complianceLogResponse("audit-created", "campaign-created")]))
      .mockResolvedValueOnce(jsonResponse(complianceLogPageResponse([complianceLogResponse("audit-filtered", "campaign-created")], { limit: 25, total: 1 })))
      .mockResolvedValueOnce(jsonResponse(segmentResponse("segment-created", "Created Segment")))
      .mockResolvedValueOnce(jsonResponse({ ...segmentResponse("segment-created", "Updated Segment"), estimatedCount: 3 }))
      .mockResolvedValueOnce(jsonResponse(segmentResponse("segment-created", "Updated Segment")));

    const created = await createBroadcastCampaign(campaignPayload("Created Broadcast"));
    const updated = await updateBroadcastCampaign(created.id, { name: "Updated Broadcast", status: "paused" });
    const duplicated = await duplicateBroadcastCampaign(created.id);
    const archived = await deleteBroadcastCampaign(created.id);
    const preview = await previewBroadcastAudience(created.id, { platform: "webchat" });
    const dryRun = await dryRunBroadcastAudience(created.id, { platform: "webchat" });
    const testResult = await sendBroadcastTest(created.id, { platform: "webchat", payloadJson: { source: "test" } });
    const sendNow = await sendBroadcastNow(created.id, { platform: "webchat" });
    const complianceLogs = await getBroadcastComplianceLogs(created.id);
    const compliancePage = await getBroadcastComplianceHistory({
      campaignId: created.id,
      reason: "do_not_contact",
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      roomId: "room-webchat",
      conversationId: "conv-blocked",
      contactId: "contact-blocked",
      limit: 25,
      offset: 0
    });
    const segment = await createBroadcastSegment({ name: "Created Segment", rules: [{ id: "rule-api", field: "leadStatus", operator: "equals", value: "interested" }] });
    const updatedSegment = await updateBroadcastSegment(segment.id, { name: "Updated Segment", estimatedCount: 3 });
    const deletedSegment = await deleteBroadcastSegment(segment.id);

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/broadcasts/campaigns", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/broadcasts/campaigns/campaign-created", expect.objectContaining({ method: "PATCH" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/broadcasts/campaigns/campaign-created/duplicate", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/broadcasts/campaigns/campaign-created", expect.objectContaining({ method: "DELETE" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/broadcasts/campaigns/campaign-created/audience-preview", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/broadcasts/campaigns/campaign-created/audience-preview", expect.objectContaining({
      headers: expect.objectContaining({ "x-tenant-id": "00000000-0000-4000-8000-000000000001" }),
      method: "POST"
    }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/broadcasts/campaigns/campaign-created/dry-run", expect.objectContaining({
      headers: expect.objectContaining({ "x-tenant-id": "00000000-0000-4000-8000-000000000001" }),
      method: "POST"
    }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/broadcasts/campaigns/campaign-created/send-test", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/broadcasts/campaigns/campaign-created/send-now", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/broadcasts/campaigns/campaign-created/compliance-logs", expect.objectContaining({
      headers: expect.objectContaining({ "x-tenant-id": "00000000-0000-4000-8000-000000000001" })
    }));
    expect(String(fetchMock.mock.calls[9]?.[0])).toContain("/broadcasts/compliance-logs?");
    expect(String(fetchMock.mock.calls[9]?.[0])).toContain("campaignId=campaign-created");
    expect(String(fetchMock.mock.calls[9]?.[0])).toContain("reason=do_not_contact");
    expect(String(fetchMock.mock.calls[9]?.[0])).toContain("platform=webchat");
    expect(fetchMock.mock.calls[9]?.[1]).toEqual(expect.objectContaining({
      headers: expect.objectContaining({ "x-tenant-id": defaultTenantId })
    }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/broadcasts/segments", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/broadcasts/segments/segment-created", expect.objectContaining({ method: "PATCH" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/broadcasts/segments/segment-created", expect.objectContaining({ method: "DELETE" }));
    expectTenantHeaderForAll(fetchMock);
    expect(updated.status).toBe("paused");
    expect(duplicated.name).toContain("Copy");
    expect(archived.status).toBe("archived");
    expect(preview.recipients[0]?.displayName).toBe("API Recipient");
    expect(preview.recipients[0]).toMatchObject({
      tenantId: defaultTenantId,
      customerId: "contact-api",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      platform: "webchat",
      reason: null,
      renderedMessage: "Hello API Recipient",
      externalCalls: 0
    });
    expect(preview.candidateCount).toBe(1);
    expect(preview.eligibleCount).toBe(1);
    expect(preview.suppressedCount).toBe(0);
    expect(preview.externalCalls).toBe(0);
    expect(dryRun.suppressedCount).toBe(1);
    expect(dryRun.suppressedRecipients?.[0]?.reason).toBe("do_not_contact");
    expect(JSON.stringify(dryRun)).not.toMatch(/accessToken|webhookSecret|botToken|apiKey|Bearer|sk-/i);
    expect(testResult.logs[0]?.status).toBe("sent_mock");
    expect(sendNow.logs[0]?.status).toBe("skipped_mock");
    expect(complianceLogs[0]).toMatchObject({
      tenantId: defaultTenantId,
      campaignId: "campaign-created",
      customerId: "contact-blocked",
      contactId: "contact-blocked",
      conversationId: "conv-blocked",
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      roomId: "room-webchat",
      reason: "do_not_contact",
      externalCalls: 0
    });
    expect(compliancePage).toMatchObject({
      limit: 25,
      offset: 0,
      total: 1,
      nextOffset: null,
      externalCalls: 0
    });
    expect(compliancePage.items[0]).toMatchObject({
      reason: "do_not_contact",
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      roomId: "room-webchat",
      externalCalls: 0
    });
    expect(JSON.stringify(complianceLogs)).not.toMatch(/accessToken|webhookSecret|botToken|apiKey|Bearer|sk-/i);
    expect(updatedSegment.estimatedCount).toBe(3);
    expect(deletedSegment.id).toBe(segment.id);
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

function campaignPayload(name: string) {
  return {
    name,
    description: "Created through API client",
    channelPlatform: "webchat" as const,
    channelAccountId: "00000000-0000-4000-8000-000000000020",
    segmentId: "segment-api",
    contentJson: {
      message: "Hello {{contact.name}}",
      safeMockOnly: true
    }
  };
}

function campaignResponse(id: string, name = "API Broadcast", overrides: Record<string, unknown> = {}) {
  const message = typeof overrides.message === "string" ? overrides.message : "Hello {{contact.name}}";
  return {
    id,
    tenantId: "00000000-0000-4000-8000-000000000001",
    name,
    description: "Persisted from API",
    status: "draft",
    channelPlatform: "webchat",
    channelAccountId: "00000000-0000-4000-8000-000000000020",
    platformScope: ["webchat"],
    roomIds: ["00000000-0000-4000-8000-000000000020"],
    segmentId: "segment-api",
    templateId: "template-api",
    message,
    scheduleType: "now",
    scheduleAt: null,
    createdBy: "api",
    createdByUserId: "00000000-0000-4000-8000-000000000011",
    contentJson: { message, safeMockOnly: true },
    createdAt: "2026-05-21T04:00:00.000Z",
    updatedAt: "2026-05-21T04:00:00.000Z",
    ...overrides
  };
}

function segmentResponse(id: string, name = "API Segment") {
  return {
    id,
    tenantId: "00000000-0000-4000-8000-000000000001",
    name,
    description: "Persisted segment",
    rules: [{ id: "rule-api", field: "leadStatus", operator: "equals", value: "interested" }],
    rulesJson: { rules: [{ id: "rule-api", field: "leadStatus", operator: "equals", value: "interested" }] },
    estimatedCount: 1,
    createdAt: "2026-05-21T04:00:00.000Z",
    updatedAt: "2026-05-21T04:00:00.000Z"
  };
}

function campaignDetailResponse(id: string) {
  return {
    campaignId: id,
    name: "API Broadcast",
    title: "API Broadcast",
    status: "draft",
    createdAt: "2026-05-21T04:00:00.000Z",
    updatedAt: "2026-05-21T04:00:00.000Z",
    audienceCount: 1,
    suppressionCount: 1,
    deliverySummary: {
      total: 1,
      previewed: 0,
      dryRun: 0,
      suppressed: 0,
      blocked: 1,
      queuedMock: 0,
      mockSent: 0,
      sentMock: 0,
      skippedMock: 0,
      failedMock: 0,
      failedSafe: 0,
      unknownSafe: 0,
      externalCalls: 0
    },
    externalCalls: 0
  };
}

function sendLogResponse(
  id: string,
  campaignId: string,
  status: "queued_mock" | "sent_mock" | "skipped_mock" | "failed_mock" | "suppressed" | "blocked" | "mock_sent" | "failed_safe" | "unknown_safe",
  overrides: Record<string, unknown> = {}
) {
  return {
    id,
    tenantId: "00000000-0000-4000-8000-000000000001",
    campaignId,
    customerId: "contact-api",
    contactId: "contact-api",
    contactIdentityId: status === "skipped_mock" ? null : "identity-api",
    conversationId: "conv-api",
    platform: "webchat",
    channelAccountId: "00000000-0000-4000-8000-000000000020",
    roomId: "room-webchat",
    status,
    reason: "safe mock only",
    externalCalls: 0,
    timestamp: "2026-05-21T04:00:00.000Z",
    createdAt: "2026-05-21T04:00:00.000Z",
    ...overrides
  };
}

function sendLogPageResponse(items: Array<ReturnType<typeof sendLogResponse>>, overrides: Record<string, unknown> = {}) {
  return {
    items,
    limit: 50,
    offset: 0,
    total: items.length,
    nextOffset: null,
    externalCalls: 0,
    ...overrides
  };
}

function analyticsResponse(campaignId: string, logs: Array<ReturnType<typeof sendLogResponse>>, overrides: Record<string, unknown> = {}) {
  const sent = logs.filter((log) => log.status === "sent_mock" || log.status === "mock_sent").length;
  const failed = logs.filter((log) => log.status === "failed_mock" || log.status === "failed_safe").length;
  const blocked = logs.filter((log) => log.status === "blocked").length;
  const suppressed = logs.filter((log) => log.status === "suppressed").length;
  const skipped = logs.filter((log) => log.status === "skipped_mock").length;
  const queued = logs.filter((log) => log.status === "queued_mock").length;
  const unknownSafe = logs.filter((log) => log.status === "unknown_safe").length;
  return {
    tenantId: defaultTenantId,
    campaignId,
    campaignName: "API Broadcast",
    status: "draft",
    generatedAt: "2026-05-21T04:00:00.000Z",
    filters: deliveryFilterSnapshot(campaignId),
    counts: {
      total: logs.length,
      queued,
      pending: 0,
      sent,
      delivered: sent,
      providerSuccess: sent,
      failed,
      suppressed,
      skipped,
      blocked,
      unknownSafe,
      externalCalls: 0
    },
    deliverySummary: {
      total: logs.length,
      previewed: 0,
      dryRun: 0,
      suppressed,
      blocked,
      queuedMock: queued,
      mockSent: logs.filter((log) => log.status === "mock_sent").length,
      sentMock: logs.filter((log) => log.status === "sent_mock").length,
      skippedMock: skipped,
      failedMock: logs.filter((log) => log.status === "failed_mock").length,
      failedSafe: logs.filter((log) => log.status === "failed_safe").length,
      unknownSafe,
      externalCalls: 0
    },
    contexts: [{
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      roomId: "room-webchat",
      total: logs.length,
      queued,
      pending: 0,
      sent,
      delivered: sent,
      providerSuccess: sent,
      failed,
      suppressed,
      skipped,
      blocked,
      unknownSafe
    }],
    externalCalls: 0,
    ...overrides
  };
}

function deliveryExportResponse(campaignId: string, logs: Array<ReturnType<typeof sendLogResponse>>, overrides: Record<string, unknown> = {}) {
  const rows = logs.map((log) => ({
    tenantId: log.tenantId,
    campaignId: log.campaignId,
    customerId: log.customerId,
    contactId: log.contactId,
    contactIdentityId: log.contactIdentityId,
    conversationId: log.conversationId,
    platform: log.platform,
    channelAccountId: log.channelAccountId,
    roomId: log.roomId,
    status: log.status,
    errorCategory: log.status === "blocked" ? "suppressed" : null,
    errorMessage: log.status === "blocked" ? "do_not_contact" : null,
    timestamp: log.timestamp,
    createdAt: log.createdAt,
    externalCalls: 0
  }));
  return {
    tenantId: defaultTenantId,
    campaignId,
    generatedAt: "2026-05-21T04:00:00.000Z",
    filters: deliveryFilterSnapshot(campaignId),
    rowCount: rows.length,
    rows,
    externalCalls: 0,
    ...overrides
  };
}

function deliveryFilterSnapshot(campaignId: string) {
  return {
    campaignId,
    status: null,
    platform: null,
    channelAccountId: null,
    roomId: null,
    conversationId: null,
    customerId: null,
    contactId: null,
    from: null,
    to: null
  };
}

function complianceLogResponse(id: string, campaignId: string) {
  return {
    id,
    tenantId: defaultTenantId,
    campaignId,
    customerId: "contact-blocked",
    contactId: "contact-blocked",
    conversationId: "conv-blocked",
    platform: "webchat",
    channelAccountId: "00000000-0000-4000-8000-000000000020",
    roomId: "room-webchat",
    reason: "do_not_contact",
    action: "broadcast.recipient_suppressed",
    createdAt: "2026-05-21T04:10:00.000Z",
    externalCalls: 0
  };
}

function complianceLogPageResponse(items: Array<ReturnType<typeof complianceLogResponse>>, overrides: Record<string, unknown> = {}) {
  return {
    items,
    limit: 50,
    offset: 0,
    total: items.length,
    nextOffset: null,
    externalCalls: 0,
    ...overrides
  };
}

function audiencePreviewResponse(campaignId: string, overrides: Record<string, unknown> = {}) {
  return {
    campaignId,
    total: 1,
    candidateCount: 1,
    eligibleCount: 1,
    suppressedCount: 0,
    suppressedByReason: {
      do_not_contact: 0,
      marketing_opt_out: 0,
      consent_missing: 0,
      consent_revoked: 0,
      unknown_unsafe: 0
    },
    externalCalls: 0,
    recipients: [{
      tenantId: defaultTenantId,
      customerId: "contact-api",
      contactId: "contact-api",
      contactIdentityId: "identity-api",
      conversationId: "conv-api",
      displayName: "API Recipient",
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      roomId: "room-webchat",
      externalUserId: "visitor-api",
      tags: ["pricing"],
      leadStatus: "interested",
      reason: null,
      renderedMessage: "Hello API Recipient",
      externalCalls: 0
    }],
    suppressedRecipients: [],
    ...overrides
  };
}

function sendResultResponse(campaignId: string, status: "queued_mock" | "sent_mock" | "skipped_mock" | "failed_mock") {
  const log = sendLogResponse(`log-${status}`, campaignId, status);
  return {
    campaignId,
    created: 1,
    sentMock: status === "sent_mock" ? 1 : 0,
    queuedMock: status === "queued_mock" ? 1 : 0,
    skippedMock: status === "skipped_mock" ? 1 : 0,
    failedMock: status === "failed_mock" ? 1 : 0,
    externalCalls: [],
    logs: [log]
  };
}
