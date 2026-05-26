import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createBroadcastCampaign,
  createBroadcastSegment,
  deleteBroadcastCampaign,
  deleteBroadcastSegment,
  dryRunBroadcastAudience,
  duplicateBroadcastCampaign,
  getBroadcastComplianceLogs,
  previewBroadcastAudience,
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
      .mockResolvedValueOnce(jsonResponse([sendLogResponse("log-api", "campaign-api", "sent_mock")]))
      .mockResolvedValueOnce(jsonResponse([complianceLogResponse("audit-api", "campaign-api")]));

    const data = await loadBroadcastBuilderData("api");

    expect(data.mode).toBe("api");
    expect(data.store.campaigns[0]?.name).toBe("API Broadcast");
    expect(data.store.segments[0]?.name).toBe("API Segment");
    expect(data.sendLogs[0]?.status).toBe("sent_mock");
    expect(data.complianceLogs[0]?.reason).toBe("do_not_contact");
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("/broadcasts/campaigns");
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain("/broadcasts/segments");
    expect(String(fetchMock.mock.calls[2]?.[0])).toContain("/broadcasts/campaigns/campaign-api/send-logs");
    expect(String(fetchMock.mock.calls[3]?.[0])).toContain("/broadcasts/campaigns/campaign-api/compliance-logs");
  });

  it("surfaces API errors instead of silently falling back to mock broadcast data", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "broadcasts unavailable" }, 503));

    await expect(loadBroadcastBuilderData("api")).rejects.toThrow("API request failed (503): broadcasts unavailable");
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

function campaignResponse(id: string, name = "API Broadcast") {
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
    message: "Hello {{contact.name}}",
    scheduleType: "now",
    scheduleAt: null,
    createdBy: "api",
    createdByUserId: "00000000-0000-4000-8000-000000000011",
    contentJson: { message: "Hello {{contact.name}}", safeMockOnly: true },
    createdAt: "2026-05-21T04:00:00.000Z",
    updatedAt: "2026-05-21T04:00:00.000Z"
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

function sendLogResponse(id: string, campaignId: string, status: "queued_mock" | "sent_mock" | "skipped_mock" | "failed_mock") {
  return {
    id,
    tenantId: "00000000-0000-4000-8000-000000000001",
    campaignId,
    contactId: "contact-api",
    contactIdentityId: status === "skipped_mock" ? null : "identity-api",
    platform: "webchat",
    channelAccountId: "00000000-0000-4000-8000-000000000020",
    status,
    reason: "safe mock only",
    payloadJson: { safeMockOnly: true },
    createdAt: "2026-05-21T04:00:00.000Z"
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
