import "reflect-metadata";
import { Module } from "@nestjs/common";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BroadcastsController } from "../controllers/broadcasts.controller.js";
import { AuditService } from "./audit.service.js";
import { BroadcastService } from "./broadcast.service.js";
import { OutboundConsentService } from "./outbound-consent.service.js";
import { PrismaService } from "./prisma.service.js";

const tenantId = "00000000-0000-4000-8000-000000000001";
const otherTenantId = "00000000-0000-4000-8000-000000009999";
const userId = "00000000-0000-4000-8000-000000000011";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("BroadcastService persistence and safe queue APIs", () => {
  it("resolves BroadcastsController through Nest DI with an injected BroadcastService", async () => {
    await withBroadcastRuntime(async ({ controller, service }) => {
      expect((controller as unknown as { broadcasts?: BroadcastService }).broadcasts).toBe(service);

      const campaigns = await controller.listCampaigns(tenantId);
      const segments = await controller.listSegments(tenantId);

      expect(campaigns.map((campaign) => campaign.id)).toEqual(["campaign-web", "campaign-line"]);
      expect(segments.map((segment) => segment.id)).toEqual(["segment-web", "segment-line"]);
    });
  });

  it("lists, creates, updates, archives, duplicates campaigns, and returns readable 404s", async () => {
    await withBroadcastRuntime(async ({ controller }) => {
      const listed = await controller.listCampaigns(tenantId);
      const created = await controller.createCampaign(campaignPayload("Created API campaign"), tenantId, userId);
      const updated = await controller.updateCampaign(created.id, { name: "Updated API campaign", status: "paused" }, tenantId);
      const archived = await controller.deleteCampaign(created.id, tenantId);
      const duplicated = await controller.duplicateCampaign("campaign-web", tenantId, userId);

      expect(listed.map((campaign) => campaign.id)).toEqual(["campaign-web", "campaign-line"]);
      expect(created.channelPlatform).toBe("webchat");
      expect(updated).toMatchObject({ id: created.id, name: "Updated API campaign", status: "paused" });
      expect(archived.status).toBe("archived");
      expect(duplicated.name).toBe("Web campaign Copy");
      expect(duplicated.status).toBe("draft");
      await expect(controller.getCampaign("campaign-other", tenantId)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  it("returns tenant-owned safe campaign detail without raw content or provider config", async () => {
    await withBroadcastRuntime(async ({ controller }) => {
      const detail = await controller.getCampaign("campaign-web", tenantId);

      expect(detail).toMatchObject({
        campaignId: "campaign-web",
        name: "Web campaign",
        title: "Web campaign",
        status: "draft",
        audienceCount: 1,
        suppressionCount: 1,
        externalCalls: 0
      });
      expect(detail.deliverySummary?.total).toBeGreaterThanOrEqual(1);
      expect(detail.deliverySummary?.sentMock).toBeGreaterThanOrEqual(1);
      expect(JSON.stringify(detail)).not.toMatch(/contentJson|payloadJson|message|accessToken|webhookSecret|botToken|apiKey|Bearer|sk-/i);
      await expect(controller.getCampaign("campaign-other", tenantId)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  it("lists, creates, updates, and deletes segments", async () => {
    await withBroadcastRuntime(async ({ controller }) => {
      const listed = await controller.listSegments(tenantId);
      const found = await controller.getSegment("segment-web", tenantId);
      const created = await controller.createSegment({
        name: "Created segment",
        description: "API segment",
        rules: [{ id: "rule-created", field: "leadStatus", operator: "equals", value: "qualified" }]
      }, tenantId);
      const updated = await controller.updateSegment(created.id, { description: "Updated segment", estimatedCount: 3 }, tenantId);
      const deleted = await controller.deleteSegment(created.id, tenantId);

      expect(listed.map((segment) => segment.id)).toEqual(["segment-web", "segment-line"]);
      expect(found).toMatchObject({ id: "segment-web", name: "Web interested" });
      expect(created.rules[0]?.field).toBe("leadStatus");
      expect(updated.estimatedCount).toBe(3);
      expect(deleted.id).toBe(created.id);
      await expect(controller.getSegment("segment-other", tenantId)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  it("previews unsaved and saved segments and applies tenant-owned campaign segments", async () => {
    await withBroadcastRuntime(async ({ controller, outboundConsent }) => {
      const unsaved = await controller.previewSegment({
        platform: "webchat",
        channelAccountId: accountId("webchat"),
        rules: [{ id: "rule-preview", field: "leadStatus", operator: "equals", value: "interested" }]
      }, tenantId);
      const saved = await controller.getSegmentPreview("segment-web", { platform: "webchat", channelAccountId: accountId("webchat"), limit: "100" }, tenantId);
      const applied = await controller.applySegment("campaign-web", { segmentId: "segment-line" }, tenantId);
      const cleared = await controller.applySegment("campaign-web", { segmentId: null }, tenantId);

      expect(unsaved).toMatchObject({
        campaignId: "segment-preview",
        eligibleCount: 1,
        suppressedCount: 0,
        invalidCount: 1,
        externalCalls: 0
      });
      expect(saved).toMatchObject({
        campaignId: "segment-web",
        eligibleCount: 1,
        suppressedCount: 0,
        invalidCount: 1,
        externalCalls: 0
      });
      expect(saved.recipients[0]).toMatchObject({
        tenantId,
        campaignId: "segment-web",
        customerId: "contact-web",
        contactId: "contact-web",
        contactIdentityId: "identity-web",
        conversationId: "conv-web",
        platform: "webchat",
        channelAccountId: accountId("webchat"),
        roomId: "room-webchat",
        externalCalls: 0
      });
      expect(applied).toMatchObject({ id: "campaign-web", segmentId: "segment-line" });
      expect(cleared).toMatchObject({ id: "campaign-web", segmentId: null });

      outboundConsent.setConsent({ optOut: true, doNotContact: true, suppressedReason: "do_not_contact" });
      const blocked = await controller.getSegmentPreview("segment-web", { platform: "webchat", channelAccountId: accountId("webchat") }, tenantId);
      expect(blocked.eligibleCount).toBe(0);
      expect(blocked.suppressedCount).toBe(1);
      expect(blocked.blockedCount).toBe(1);
      expect(blocked.suppressedRecipients[0]).toMatchObject({
        tenantId,
        campaignId: "segment-web",
        customerId: "contact-web",
        contactId: "contact-web",
        conversationId: "conv-web",
        platform: "webchat",
        channelAccountId: accountId("webchat"),
        roomId: "room-webchat",
        reason: "do_not_contact",
        externalCalls: 0
      });
      expect(JSON.stringify({ unsaved, saved, blocked, applied })).not.toMatch(/accessToken|webhookSecret|botToken|apiKey|Bearer|sk-|providerRaw|rawPayload/i);
      await expect(controller.getSegmentPreview("segment-other", { platform: "webchat" }, tenantId)).rejects.toBeInstanceOf(NotFoundException);
      await expect(controller.applySegment("campaign-web", { segmentId: "segment-other" }, tenantId)).rejects.toBeInstanceOf(NotFoundException);
      await expect(controller.applySegment("campaign-other", { segmentId: "segment-web" }, tenantId)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  it("previews audience from tenant-scoped contacts and platform identities only", async () => {
    await withBroadcastRuntime(async ({ controller }) => {
      const preview = await controller.getAudiencePreview("campaign-web", { platform: "webchat", limit: "100" }, tenantId);

      expect(preview.total).toBe(1);
      expect(preview.candidateCount).toBe(2);
      expect(preview.eligibleCount).toBe(1);
      expect(preview.suppressedCount).toBe(0);
      expect(preview.blockedCount).toBe(0);
      expect(preview.invalidCount).toBe(1);
      expect(preview.externalCalls).toBe(0);
      expect(preview.recipients[0]).toMatchObject({
        tenantId,
        campaignId: "campaign-web",
        customerId: "contact-web",
        contactId: "contact-web",
        contactIdentityId: "identity-web",
        conversationId: "conv-web",
        platform: "webchat",
        channelAccountId: accountId("webchat"),
        roomId: "room-webchat",
        externalCalls: 0
      });
      expect(preview.invalidRecipients?.[0]).toMatchObject({
        tenantId,
        campaignId: "campaign-web",
        customerId: "contact-telegram-only",
        contactId: "contact-telegram-only",
        contactIdentityId: null,
        platform: "webchat",
        channelAccountId: accountId("webchat"),
        reason: "no supported identity for campaign platform",
        externalCalls: 0
      });
      expect(preview.recipients.map((recipient) => recipient.contactId)).not.toContain("contact-other-tenant");
      expect(JSON.stringify(preview)).not.toMatch(/accessToken|webhookSecret|botToken|apiKey|Bearer|sk-|providerRaw|rawPayload/i);
    });
  });

  it("suppresses do-not-contact recipients from preview and records safe compliance context", async () => {
    await withBroadcastRuntime(async ({ controller, outboundConsent, prisma }) => {
      outboundConsent.setConsent({ optOut: false, doNotContact: true, suppressedReason: "do_not_contact" });

      const preview = await controller.audiencePreview("campaign-web", { platform: "webchat" }, tenantId);

      expect(preview.total).toBe(0);
      expect(preview.candidateCount).toBe(2);
      expect(preview.eligibleCount).toBe(0);
      expect(preview.suppressedCount).toBe(1);
      expect(preview.blockedCount).toBe(1);
      expect(preview.invalidCount).toBe(1);
      expect(preview.suppressedByReason.do_not_contact).toBe(1);
      expect(preview.externalCalls).toBe(0);
      expect(preview.recipients).toEqual([]);
      expect(preview.suppressedRecipients[0]).toMatchObject({
        tenantId,
        campaignId: "campaign-web",
        customerId: "contact-web",
        contactId: "contact-web",
        conversationId: "conv-web",
        platform: "webchat",
        channelAccountId: accountId("webchat"),
        roomId: "room-webchat",
        reason: "do_not_contact",
        externalCalls: 0
      });
      expect(outboundConsent.recordBlocked).toHaveBeenCalledWith(expect.objectContaining({
        action: "broadcast.recipient_suppressed",
        intent: "marketing",
        reason: "do_not_contact",
        metadata: expect.objectContaining({
          campaignId: "campaign-web",
          sendType: "preview",
          suppressed: true
        })
      }));
      expect(prisma.broadcastSendLog.create).not.toHaveBeenCalled();
    });
  });

  it("suppresses opted-out and revoked consent recipients with safe reason codes", async () => {
    await withBroadcastRuntime(async ({ controller, outboundConsent }) => {
      outboundConsent.setConsent({ optedOut: true, optOut: false, doNotContact: false });
      const optedOut = await controller.dryRun("campaign-web", { platform: "webchat" }, tenantId);
      expect(optedOut.suppressedCount).toBe(1);
      expect(optedOut.suppressedRecipients[0]?.reason).toBe("marketing_opt_out");

      outboundConsent.setConsent({ optedOut: false, optOut: false, marketingConsent: false });
      const missing = await controller.dryRun("campaign-web", { platform: "webchat" }, tenantId);
      expect(missing.suppressedCount).toBe(1);
      expect(missing.suppressedRecipients[0]?.reason).toBe("consent_missing");

      outboundConsent.setConsent({ marketingConsent: null, consentStatus: "revoked" });
      const revoked = await controller.dryRun("campaign-web", { platform: "webchat" }, tenantId);
      expect(revoked.suppressedCount).toBe(1);
      expect(revoked.suppressedRecipients[0]?.reason).toBe("consent_revoked");
      expect(revoked.externalCalls).toBe(0);
    });
  });

  it("validates tenant ownership before recipient selection or suppression", async () => {
    await withBroadcastRuntime(async ({ controller, prisma, outboundConsent }) => {
      await expect(controller.audiencePreview("campaign-other", { platform: "webchat" }, tenantId)).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.contact.findMany).not.toHaveBeenCalled();
      expect(outboundConsent.getContext).not.toHaveBeenCalled();
    });
  });

  it("returns tenant-scoped safe broadcast compliance logs", async () => {
    await withBroadcastRuntime(async ({ controller }) => {
      const logs = await controller.listComplianceLogs("campaign-web", tenantId);

      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({
        tenantId,
        campaignId: "campaign-web",
        customerId: "contact-web",
        contactId: "contact-web",
        conversationId: "conv-web",
        platform: "webchat",
        channelAccountId: accountId("webchat"),
        roomId: "room-webchat",
        reason: "do_not_contact",
        action: "broadcast.recipient_suppressed",
        externalCalls: 0
      });
      expect(JSON.stringify(logs)).not.toMatch(/accessToken|webhookSecret|botToken|apiKey|Bearer|sk-/i);
      await expect(controller.listComplianceLogs("campaign-other", tenantId)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  it("filters paginated compliance rows by safe reason and preserves platform/account/room context", async () => {
    await withBroadcastRuntime(async ({ controller }) => {
      const page = await controller.listComplianceHistory({
        campaignId: "campaign-web",
        reason: "do_not_contact",
        platform: "webchat",
        channelAccountId: accountId("webchat"),
        roomId: "room-webchat",
        conversationId: "conv-web",
        contactId: "contact-web",
        limit: "1",
        offset: "0"
      }, tenantId);

      expect(page).toMatchObject({
        limit: 1,
        offset: 0,
        total: 1,
        nextOffset: null,
        externalCalls: 0
      });
      expect(page.items[0]).toMatchObject({
        tenantId,
        campaignId: "campaign-web",
        customerId: "contact-web",
        contactId: "contact-web",
        conversationId: "conv-web",
        platform: "webchat",
        channelAccountId: accountId("webchat"),
        roomId: "room-webchat",
        reason: "do_not_contact",
        externalCalls: 0
      });
      expect(JSON.stringify(page)).not.toMatch(/accessToken|webhookSecret|botToken|apiKey|Bearer|sk-/i);
      await expect(controller.listComplianceHistory({ campaignId: "campaign-other" }, tenantId)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  it("filters paginated delivery rows by campaign and safe status while preserving conversation context", async () => {
    await withBroadcastRuntime(async ({ controller }) => {
      const page = await controller.listSendLogPage({
        campaignId: "campaign-web",
        status: "sent_mock",
        platform: "webchat",
        channelAccountId: accountId("webchat"),
        roomId: "room-webchat",
        conversationId: "conv-web",
        contactId: "contact-web",
        limit: "1",
        offset: "0"
      }, tenantId);

      expect(page).toMatchObject({
        limit: 1,
        offset: 0,
        total: 1,
        nextOffset: null,
        externalCalls: 0
      });
      expect(page.items[0]).toMatchObject({
        tenantId,
        campaignId: "campaign-web",
        customerId: "contact-web",
        contactId: "contact-web",
        contactIdentityId: "identity-web",
        conversationId: "conv-web",
        platform: "webchat",
        channelAccountId: accountId("webchat"),
        roomId: "room-webchat",
        status: "sent_mock",
        externalCalls: 0
      });
      expect(page.items[0]).not.toHaveProperty("payloadJson");
      expect(JSON.stringify(page)).not.toMatch(/accessToken|webhookSecret|botToken|apiKey|Bearer|sk-|should-not-leak/i);
      await expect(controller.listSendLogPage({ campaignId: "campaign-other" }, tenantId)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  it("normalizes suppressed delivery rows away from sent/provider success", async () => {
    await withBroadcastRuntime(async ({ controller }) => {
      const page = await controller.listSendLogPage({
        campaignId: "campaign-web",
        status: "blocked",
        limit: "10",
        offset: "0"
      }, tenantId);

      expect(page.items).toHaveLength(1);
      expect(page.items[0]).toMatchObject({
        status: "blocked",
        reason: "do_not_contact",
        campaignId: "campaign-web",
        conversationId: "conv-web",
        roomId: "room-webchat",
        externalCalls: 0
      });
      expect(page.items[0]?.status).not.toMatch(/sent|provider/i);
      expect(JSON.stringify(page)).not.toMatch(/accessToken|webhookSecret|botToken|apiKey|Bearer|sk-|should-not-leak/i);
    });
  });

  it("derives tenant-scoped campaign analytics from persisted safe delivery logs", async () => {
    await withBroadcastRuntime(async ({ controller }) => {
      const analytics = await controller.getCampaignAnalytics("campaign-web", {
        platform: "webchat",
        channelAccountId: accountId("webchat")
      }, tenantId);

      expect(analytics).toMatchObject({
        tenantId,
        campaignId: "campaign-web",
        campaignName: "Web campaign",
        filters: {
          campaignId: "campaign-web",
          platform: "webchat",
          channelAccountId: accountId("webchat")
        },
        counts: {
          total: 4,
          queued: 1,
          sent: 1,
          delivered: 1,
          providerSuccess: 1,
          failed: 1,
          blocked: 1,
          externalCalls: 0
        },
        externalCalls: 0
      });
      expect(analytics.counts.sent).toBe(1);
      expect(analytics.counts.providerSuccess).toBe(1);
      expect(analytics.counts.sent).toBeLessThan(analytics.counts.total);
      expect(analytics.contexts[0]).toMatchObject({
        platform: "webchat",
        channelAccountId: accountId("webchat"),
        roomId: "room-webchat",
        total: 4,
        sent: 1,
        blocked: 1
      });
      expect(JSON.stringify(analytics)).not.toMatch(/payloadJson|accessToken|webhookSecret|botToken|apiKey|Bearer|sk-|should-not-leak/i);
      await expect(controller.getCampaignAnalytics("campaign-other", {}, tenantId)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  it("exports filtered safe delivery rows with context and without provider payload fields", async () => {
    await withBroadcastRuntime(async ({ controller }) => {
      const sentExport = await controller.exportCampaignDelivery("campaign-web", {
        status: "sent_mock",
        platform: "webchat",
        channelAccountId: accountId("webchat"),
        roomId: "room-webchat",
        limit: "200",
        offset: "0"
      }, tenantId);
      const failedExport = await controller.exportCampaignDelivery("campaign-web", {
        status: "failed_mock",
        limit: "200",
        offset: "0"
      }, tenantId);

      expect(sentExport).toMatchObject({
        tenantId,
        campaignId: "campaign-web",
        rowCount: 1,
        externalCalls: 0
      });
      expect(sentExport.rows).toHaveLength(sentExport.rowCount);
      expect(sentExport.rows[0]).toMatchObject({
        tenantId,
        campaignId: "campaign-web",
        customerId: "contact-web",
        contactId: "contact-web",
        contactIdentityId: "identity-web",
        conversationId: "conv-web",
        platform: "webchat",
        channelAccountId: accountId("webchat"),
        roomId: "room-webchat",
        status: "sent_mock",
        errorCategory: null,
        errorMessage: null,
        externalCalls: 0
      });
      expect(failedExport.rowCount).toBe(1);
      expect(failedExport.rows[0]?.errorCategory).toBe("failed");
      expect(failedExport.rows[0]?.errorMessage).not.toMatch(/Bearer|sk-/i);
      expect(JSON.stringify({ sentExport, failedExport })).not.toMatch(/payloadJson|accessToken|refreshToken|authorization|webhookSecret|botToken|apiKey|Bearer|sk-|providerRaw|rawPayload|should-not-leak/i);
      await expect(controller.exportCampaignDelivery("campaign-other", {}, tenantId)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  it("schedules campaigns through tenant-scoped readiness checks without sending", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    await withBroadcastRuntime(async ({ controller, prisma, outboundConsent, audit }) => {
      const scheduled = await controller.scheduleCampaign("campaign-web", { scheduleAt: "2099-05-23T04:00:00.000Z" }, tenantId, userId);

      expect(scheduled.status).toBe("scheduled");
      expect(scheduled.scheduleAt).toBe("2099-05-23T04:00:00.000Z");
      expect(scheduled.scheduledAt).toBe("2099-05-23T04:00:00.000Z");
      expect(scheduled.approvalStatus).toBe("draft");
      expect(scheduled.lastWorkflowAction).toBe("schedule");
      expect(outboundConsent.getContext).toHaveBeenCalledWith(expect.objectContaining({
        tenantId,
        contactId: "contact-web",
        platform: "webchat",
        channelAccountId: accountId("webchat")
      }));
      expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({
        tenantId,
        actorUserId: userId,
        action: "broadcast.campaign_scheduled",
        entityType: "broadcast_campaign",
        entityId: "campaign-web",
        metadata: expect.objectContaining({
          campaignId: "campaign-web",
          status: "scheduled",
          platform: "webchat",
          channelAccountId: accountId("webchat"),
          externalCalls: 0
        })
      }));
      expect(prisma.broadcastSendLog.create).not.toHaveBeenCalled();
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });

  it("persists approval request, approve, reject, and cancel approval as safe API workflow state", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    await withBroadcastRuntime(async ({ controller, audit }) => {
      const requested = await controller.requestApproval("campaign-web", { note: "review draft" }, tenantId, userId);
      const approved = await controller.approveCampaign("campaign-web", { note: "approved safely" }, tenantId, userId);
      const rejected = await controller.rejectCampaign("campaign-web", { note: "needs edit" }, tenantId, userId);
      const returned = await controller.cancelApproval("campaign-web", { note: "return to draft" }, tenantId, userId);

      expect(requested).toMatchObject({
        id: "campaign-web",
        status: "pending_approval",
        approvalStatus: "pending_approval",
        approvalNote: "review draft",
        lastWorkflowAction: "request_approval"
      });
      expect(approved).toMatchObject({
        id: "campaign-web",
        status: "approved",
        approvalStatus: "approved",
        approvalReviewedBy: userId,
        lastWorkflowAction: "approve"
      });
      expect(rejected).toMatchObject({
        id: "campaign-web",
        status: "rejected",
        approvalStatus: "rejected",
        scheduleAt: null,
        approvalReviewedBy: userId,
        lastWorkflowAction: "reject"
      });
      expect(returned).toMatchObject({
        id: "campaign-web",
        status: "draft",
        approvalStatus: "draft",
        approvalNote: "return to draft",
        lastWorkflowAction: "cancel_approval"
      });
      expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ action: "broadcast.approval_requested" }));
      expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ action: "broadcast.approved" }));
      expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ action: "broadcast.rejected" }));
      expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ action: "broadcast.approval_cancelled" }));
      expect(JSON.stringify({ requested, approved, rejected, returned })).not.toMatch(/accessToken|webhookSecret|botToken|apiKey|Bearer|sk-|providerRaw|rawPayload/i);
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });

  it("blocks schedule and outbound-like actions for rejected campaigns until returned to draft", async () => {
    await withBroadcastRuntime(async ({ controller, prisma }) => {
      await controller.rejectCampaign("campaign-web", { note: "needs review" }, tenantId, userId);

      await expect(controller.scheduleCampaign("campaign-web", { scheduleAt: "2099-05-23T04:00:00.000Z" }, tenantId, userId)).rejects.toBeInstanceOf(BadRequestException);
      await expect(controller.sendNow("campaign-web", { platform: "webchat" }, tenantId)).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.broadcastSendLog.create).not.toHaveBeenCalled();
    });
  });

  it("rejects invalid tenant schedule/approval calls before mutating campaign state", async () => {
    await withBroadcastRuntime(async ({ controller, prisma }) => {
      await expect(controller.scheduleCampaign("campaign-other", { scheduleAt: "2099-05-23T04:00:00.000Z" }, tenantId, userId)).rejects.toBeInstanceOf(NotFoundException);
      await expect(controller.requestApproval("campaign-other", {}, tenantId, userId)).rejects.toBeInstanceOf(NotFoundException);
      await expect(controller.scheduleCampaign("campaign-web", { scheduleAt: "2020-05-23T04:00:00.000Z" }, tenantId, userId)).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.broadcastCampaign.update).not.toHaveBeenCalledWith(expect.objectContaining({ where: { id: "campaign-other" } }));
    });
  });

  it("enforces suppression guardrails before scheduling or approval readiness", async () => {
    await withBroadcastRuntime(async ({ controller, outboundConsent, prisma }) => {
      outboundConsent.setConsent({ optOut: false, doNotContact: true, suppressedReason: "do_not_contact" });

      await expect(controller.scheduleCampaign("campaign-web", { scheduleAt: "2099-05-23T04:00:00.000Z" }, tenantId, userId)).rejects.toBeInstanceOf(BadRequestException);
      await expect(controller.requestApproval("campaign-web", {}, tenantId, userId)).rejects.toBeInstanceOf(BadRequestException);
      expect(outboundConsent.recordBlocked).toHaveBeenCalledWith(expect.objectContaining({
        action: "broadcast.recipient_suppressed",
        reason: "do_not_contact",
        metadata: expect.objectContaining({
          campaignId: "campaign-web",
          suppressed: true
        })
      }));
      expect(prisma.broadcastSendLog.create).not.toHaveBeenCalled();
    });
  });

  it("records send-test/send-now logs as safe mock only", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    await withBroadcastRuntime(async ({ controller, prisma }) => {
      const testResult = await controller.sendTest("campaign-web", { platform: "webchat", payloadJson: { source: "test" } }, tenantId);
      const sendResult = await controller.sendNow("campaign-web", { platform: "webchat" }, tenantId);
      const logs = await controller.listSendLogs("campaign-web", {}, tenantId);
      const logItems = Array.isArray(logs) ? logs : logs.items;

      expect(testResult.logs[0]?.status).toBe("sent_mock");
      expect(sendResult.externalCalls).toEqual([]);
      expect(sendResult.logs.map((log) => log.status).sort()).toEqual(["sent_mock", "skipped_mock"]);
      expect(logItems.some((log) => log.status === "sent_mock")).toBe(true);
      expect(logItems.some((log) => log.status === "skipped_mock")).toBe(true);
      expect(prisma.broadcastSendLog.create).toHaveBeenCalled();
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });

  it("suppresses marketing broadcast sends when persisted opt-out blocks the recipient", async () => {
    await withBroadcastRuntime(async ({ controller, outboundConsent, prisma }) => {
      outboundConsent.setConsent({ optOut: true, doNotContact: false, suppressedReason: "customer_requested" });

      const sendResult = await controller.sendNow("campaign-web", { platform: "webchat" }, tenantId);

      expect(sendResult.sentMock).toBe(0);
      expect(sendResult.skippedMock).toBe(0);
      expect(sendResult.created).toBe(0);
      expect(sendResult.candidateCount).toBe(2);
      expect(sendResult.eligibleCount).toBe(0);
      expect(sendResult.suppressedCount).toBe(2);
      expect(sendResult.suppressedByReason?.marketing_opt_out).toBe(2);
      expect(sendResult.externalCalls).toEqual([]);
      expect(sendResult.logs).toEqual([]);
      expect(sendResult.suppressedRecipients?.every((recipient) => recipient.reason === "marketing_opt_out")).toBe(true);
      expect(outboundConsent.recordBlocked).toHaveBeenCalledWith(expect.objectContaining({
        action: "broadcast.recipient_suppressed",
        intent: "marketing",
        reason: "marketing_opt_out",
        context: expect.objectContaining({
          tenantId,
          contactId: "contact-web",
          platform: "webchat",
          channelAccountId: accountId("webchat")
        })
      }));
      expect(prisma.broadcastSendLog.create).not.toHaveBeenCalled();
    });
  });

  it("does not expose another tenant's campaigns or audience", async () => {
    await withBroadcastRuntime(async ({ controller }) => {
      const otherCampaigns = await controller.listCampaigns(otherTenantId);
      const defaultCampaigns = await controller.listCampaigns(tenantId);

      expect(otherCampaigns.map((campaign) => campaign.id)).toEqual(["campaign-other"]);
      expect(defaultCampaigns.map((campaign) => campaign.id)).not.toContain("campaign-other");
      await expect(controller.updateCampaign("campaign-other", { name: "Cross tenant" }, tenantId)).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});

async function withBroadcastRuntime<T>(
  run: (context: Awaited<ReturnType<typeof buildBroadcastRuntime>>) => Promise<T>
) {
  const context = await buildBroadcastRuntime();
  try {
    return await run(context);
  } finally {
    await context.close();
  }
}

async function buildBroadcastRuntime() {
  const prisma = buildPrismaFake();
  const outboundConsent = buildOutboundConsentFake();
  const audit = buildAuditFake();

  @Module({
    controllers: [BroadcastsController],
    providers: [
      BroadcastService,
      { provide: AuditService, useValue: audit },
      { provide: OutboundConsentService, useValue: outboundConsent },
      { provide: PrismaService, useValue: prisma }
    ]
  })
  class BroadcastRuntimeTestModule {}

  const app = await NestFactory.createApplicationContext(BroadcastRuntimeTestModule, { logger: false });
  return {
    controller: app.get(BroadcastsController),
    service: app.get(BroadcastService),
    outboundConsent,
    audit,
    prisma,
    close: () => app.close()
  };
}

function buildAuditFake() {
  return {
    record: vi.fn(async (input: Record<string, any>) => ({
      id: `audit-${input.action}`,
      ...input,
      metadata: { ...(input.metadata ?? {}), externalCalls: 0 },
      createdAt: new Date("2026-05-21T05:10:00.000Z")
    }))
  };
}

function buildOutboundConsentFake() {
  let consent = {
    optOut: false,
    optedOut: false,
    doNotContact: false,
    marketingConsent: null as boolean | null,
    consentStatus: null as string | null,
    suppressedReason: undefined as string | undefined
  };
  return {
    setConsent: (next: Partial<typeof consent>) => {
      consent = { ...consent, ...next };
    },
    getContext: vi.fn(async (input: Record<string, any>) => ({
      tenantId: input.tenantId,
      contactId: input.contactId,
      customerId: input.contactId,
      conversationId: "conv-web",
      platform: input.platform,
      channelAccountId: input.channelAccountId,
      roomId: "room-webchat",
      consent
    })),
    decide: vi.fn((value: typeof consent, intent: "support" | "marketing" | "automation") => {
      if (value.doNotContact) return { blocked: true, reason: "do_not_contact" };
      if ((intent === "marketing" || intent === "automation") && (value.optOut || value.optedOut)) return { blocked: true, reason: "marketing_opt_out" };
      if ((intent === "marketing" || intent === "automation") && value.marketingConsent === false) return { blocked: true, reason: "consent_missing" };
      if ((intent === "marketing" || intent === "automation") && value.consentStatus === "revoked") return { blocked: true, reason: "consent_revoked" };
      return { blocked: false, reason: null };
    }),
    recordBlocked: vi.fn(async (input: Record<string, any>) => ({
      id: "audit-blocked",
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      metadata: { blockedReason: input.reason, externalCalls: 0 },
      createdAt: new Date("2026-05-21T05:10:00.000Z")
    }))
  };
}

function buildPrismaFake() {
  const campaigns = [
    campaign("campaign-web", tenantId, "Web campaign", "webchat", "segment-web"),
    campaign("campaign-line", tenantId, "LINE campaign", "line", "segment-line"),
    campaign("campaign-other", otherTenantId, "Other tenant", "webchat", "segment-other")
  ];
  const segments = [
    segment("segment-web", tenantId, "Web interested", [
      { id: "rule-web-status", field: "leadStatus", operator: "equals", value: "interested" }
    ]),
    segment("segment-line", tenantId, "LINE follow-up", [
      { id: "rule-line-platform", field: "platform", operator: "contains", value: "line" }
    ]),
    segment("segment-other", otherTenantId, "Other segment", [
      { id: "rule-other", field: "leadStatus", operator: "equals", value: "interested" }
    ])
  ];
  const logs = [
    sendLog("log-seed", tenantId, "campaign-web", "contact-web", "identity-web", "webchat", "sent_mock"),
    sendLog("log-blocked", tenantId, "campaign-web", "contact-web", "identity-web", "webchat", "skipped_mock", "do_not_contact", { suppressed: true, blockedReason: "do_not_contact", accessToken: "should-not-leak" }),
    sendLog("log-queued", tenantId, "campaign-web", "contact-web", "identity-web", "webchat", "queued_mock"),
    sendLog("log-failed", tenantId, "campaign-web", "contact-web", "identity-web", "webchat", "failed_mock", "failed safe mock Bearer should-not-leak sk-should-not-leak", { providerRaw: "should-not-leak" }),
    sendLog("log-line", tenantId, "campaign-line", "contact-line", "identity-line", "line", "sent_mock")
  ];
  const rooms = [
    { id: "room-webchat", tenantId, platform: "webchat", channelAccountId: accountId("webchat") },
    { id: "room-line", tenantId, platform: "line", channelAccountId: accountId("line") },
    { id: "room-other", tenantId: otherTenantId, platform: "webchat", channelAccountId: accountId("webchat") }
  ];
  const auditLogs = [
    {
      id: "audit-suppressed-web",
      tenantId,
      conversationId: "conv-web",
      action: "broadcast.recipient_suppressed",
      entityType: "broadcast_campaign",
      entityId: "campaign-web",
      metadata: null,
      metadataJson: {
        campaignId: "campaign-web",
        customerId: "contact-web",
        contactId: "contact-web",
        conversationId: "conv-web",
        platform: "webchat",
        channelAccountId: accountId("webchat"),
        roomId: "room-webchat",
        blockedReason: "do_not_contact",
        suppressed: true,
        externalCalls: 0,
        accessToken: "should-not-leak"
      },
      createdAt: new Date("2026-05-21T05:12:00.000Z")
    },
    {
      id: "audit-other-tenant",
      tenantId: otherTenantId,
      conversationId: "conv-other",
      action: "broadcast.recipient_suppressed",
      entityType: "broadcast_campaign",
      entityId: "campaign-other",
      metadata: null,
      metadataJson: {
        campaignId: "campaign-other",
        customerId: "contact-other",
        contactId: "contact-other",
        conversationId: "conv-other",
        platform: "webchat",
        channelAccountId: accountId("webchat"),
        roomId: "room-other",
        blockedReason: "do_not_contact",
        externalCalls: 0
      },
      createdAt: new Date("2026-05-21T05:12:00.000Z")
    },
    {
      id: "audit-suppressed-line",
      tenantId,
      conversationId: "conv-line",
      action: "broadcast.recipient_suppressed",
      entityType: "broadcast_campaign",
      entityId: "campaign-line",
      metadata: null,
      metadataJson: {
        campaignId: "campaign-line",
        customerId: "contact-line",
        contactId: "contact-line",
        conversationId: "conv-line",
        platform: "line",
        channelAccountId: accountId("line"),
        roomId: "room-line",
        blockedReason: "marketing_opt_out",
        externalCalls: 0
      },
      createdAt: new Date("2026-05-21T05:11:00.000Z")
    }
  ];
  const contacts = [
    contact("contact-web", tenantId, "Web Buyer", "interested", [identity("identity-web", "webchat", "web-user")]),
    contact("contact-telegram-only", tenantId, "Telegram Only", "interested", [identity("identity-telegram", "telegram", "tg-user")]),
    contact("contact-line", tenantId, "LINE Member", "follow_up", [identity("identity-line", "line", "line-user")]),
    contact("contact-other-tenant", otherTenantId, "Other Tenant Web", "interested", [identity("identity-other", "webchat", "other-user")])
  ];

  return {
    broadcastCampaign: {
      findMany: vi.fn(async ({ where }: { where: Record<string, any> }) =>
        campaigns.filter((item) => item.tenantId === where.tenantId)
      ),
      findFirst: vi.fn(async ({ where }: { where: Record<string, any> }) =>
        campaigns.find((item) => item.id === where.id && item.tenantId === where.tenantId) ?? null
      ),
      create: vi.fn(async ({ data }: { data: Record<string, any> }) => {
        const saved = {
          id: data.id ?? `campaign-created-${campaigns.length + 1}`,
          tenantId: data.tenantId,
          name: data.name,
          description: data.description ?? "",
          status: data.status,
          channelPlatform: data.channelPlatform,
          channelAccountId: data.channelAccountId ?? null,
          segmentId: data.segmentId ?? null,
          contentJson: data.contentJson,
          scheduleAt: data.scheduleAt ?? null,
          createdByUserId: data.createdByUserId ?? null,
          createdAt: new Date("2026-05-21T05:00:00.000Z"),
          updatedAt: new Date("2026-05-21T05:00:00.000Z")
        };
        campaigns.unshift(saved);
        return saved;
      }),
      update: vi.fn(async ({ where, data }: { where: Record<string, any>; data: Record<string, any> }) => {
        const index = campaigns.findIndex((item) => item.id === where.id);
        const saved = {
          ...campaigns[index],
          ...stripUndefined(data),
          updatedAt: new Date("2026-05-21T05:05:00.000Z")
        };
        campaigns[index] = saved;
        return saved;
      }),
      updateMany: vi.fn(async ({ where, data }: { where: Record<string, any>; data: Record<string, any> }) => {
        campaigns.forEach((item, index) => {
          if (item.tenantId === where.tenantId && item.segmentId === where.segmentId) {
            campaigns[index] = { ...item, ...data };
          }
        });
        return { count: campaigns.filter((item) => item.tenantId === where.tenantId && item.segmentId === data.segmentId).length };
      })
    },
    broadcastSegment: {
      findMany: vi.fn(async ({ where }: { where: Record<string, any> }) =>
        segments.filter((item) => item.tenantId === where.tenantId)
      ),
      findFirst: vi.fn(async ({ where }: { where: Record<string, any> }) =>
        segments.find((item) => item.id === where.id && item.tenantId === where.tenantId) ?? null
      ),
      create: vi.fn(async ({ data }: { data: Record<string, any> }) => {
        const saved = {
          id: data.id ?? `segment-created-${segments.length + 1}`,
          tenantId: data.tenantId,
          name: data.name,
          description: data.description ?? "",
          rulesJson: data.rulesJson ?? { rules: [] },
          estimatedCount: data.estimatedCount ?? 0,
          createdAt: new Date("2026-05-21T05:00:00.000Z"),
          updatedAt: new Date("2026-05-21T05:00:00.000Z")
        };
        segments.unshift(saved);
        return saved;
      }),
      update: vi.fn(async ({ where, data }: { where: Record<string, any>; data: Record<string, any> }) => {
        const index = segments.findIndex((item) => item.id === where.id);
        const saved = {
          ...segments[index],
          ...stripUndefined(data),
          updatedAt: new Date("2026-05-21T05:05:00.000Z")
        };
        segments[index] = saved;
        return saved;
      }),
      delete: vi.fn(async ({ where }: { where: Record<string, any> }) => {
        const index = segments.findIndex((item) => item.id === where.id);
        const [deleted] = segments.splice(index, 1);
        return deleted;
      })
    },
    broadcastSendLog: {
      findMany: vi.fn(async ({ where }: { where: Record<string, any> }) =>
        logs.filter((item) =>
          item.tenantId === where.tenantId &&
          (where.campaignId === undefined || item.campaignId === where.campaignId) &&
          (where.platform === undefined || item.platform === where.platform) &&
          (where.channelAccountId === undefined || item.channelAccountId === where.channelAccountId) &&
          (where.contactId === undefined || item.contactId === where.contactId) &&
          (where.status?.in === undefined || where.status.in.includes(item.status)) &&
          (where.createdAt?.gte === undefined || item.createdAt >= where.createdAt.gte) &&
          (where.createdAt?.lte === undefined || item.createdAt <= where.createdAt.lte)
        )
      ),
      create: vi.fn(async ({ data }: { data: Record<string, any> }) => {
        const saved = {
          id: data.id ?? `send-log-created-${logs.length + 1}`,
          tenantId: data.tenantId,
          campaignId: data.campaignId,
          contactId: data.contactId ?? null,
          contactIdentityId: data.contactIdentityId ?? null,
          platform: data.platform,
          channelAccountId: data.channelAccountId ?? null,
          status: data.status,
          reason: data.reason ?? null,
          payloadJson: data.payloadJson ?? null,
          createdAt: new Date("2026-05-21T05:10:00.000Z")
        };
        logs.unshift(saved);
        return saved;
      })
    },
    room: {
      findFirst: vi.fn(async ({ where }: { where: Record<string, any> }) =>
        rooms.find((item) =>
          item.tenantId === where.tenantId &&
          (where.id === undefined || item.id === where.id) &&
          (where.platform === undefined || item.platform === where.platform) &&
          (where.channelAccountId === undefined || item.channelAccountId === where.channelAccountId)
        ) ?? null
      ),
      findMany: vi.fn(async ({ where }: { where: Record<string, any> }) =>
        rooms.filter((item) =>
          item.tenantId === where.tenantId &&
          (!where.OR || where.OR.some((clause: Record<string, any>) => item.platform === clause.platform && item.channelAccountId === clause.channelAccountId))
        )
      )
    },
    contact: {
      findMany: vi.fn(async ({ where }: { where: Record<string, any> }) =>
        contacts.filter((item) => item.tenantId === where.tenantId)
      ),
      findFirst: vi.fn(async ({ where }: { where: Record<string, any> }) =>
        contacts.find((item) => item.tenantId === where.tenantId && item.id === where.id) ?? null
      )
    },
    conversation: {
      findFirst: vi.fn(async ({ where }: { where: Record<string, any> }) => {
        const conversations = contacts.flatMap((item) => item.conversations.map((conversation) => ({ ...conversation, tenantId: item.tenantId, contactId: item.id })));
        return conversations.find((item) => item.tenantId === where.tenantId && item.id === where.id) ?? null;
      }),
      findMany: vi.fn(async ({ where }: { where: Record<string, any> }) => {
        const conversations = contacts.flatMap((item) => item.conversations.map((conversation) => ({
          ...conversation,
          tenantId: item.tenantId,
          contactId: item.id,
          contactIdentityId: item.identities[0]?.id ?? "identity-missing"
        })));
        return conversations.filter((item) =>
          item.tenantId === where.tenantId &&
          (!where.OR || where.OR.some((clause: Record<string, any>) =>
            clause.contactId?.in?.includes(item.contactId) ||
            clause.contactIdentityId?.in?.includes(item.contactIdentityId)
          ))
        );
      })
    },
    auditLog: {
      findMany: vi.fn(async ({ where }: { where: Record<string, any> }) =>
        auditLogs.filter((item) =>
          item.tenantId === where.tenantId &&
          item.entityType === where.entityType &&
          (where.entityId === undefined || item.entityId === where.entityId) &&
          (where.conversationId === undefined || item.conversationId === where.conversationId) &&
          (!where.action?.in || where.action.in.includes(item.action))
        )
      )
    }
  };
}

function campaign(id: string, tenant: string, name: string, platform: "webchat" | "telegram" | "line" | "facebook" | "instagram", segmentId: string) {
  return {
    id,
    tenantId: tenant,
    name,
    description: `${name} description`,
    status: "draft",
    channelPlatform: platform,
    channelAccountId: accountId(platform),
    segmentId,
    contentJson: { message: "Hello {{contact.name}} from {{platform}}", safeMockOnly: true },
    scheduleAt: null,
    createdByUserId: userId,
    createdAt: new Date("2026-05-21T04:00:00.000Z"),
    updatedAt: new Date("2026-05-21T04:00:00.000Z")
  };
}

function segment(id: string, tenant: string, name: string, rules: Array<Record<string, unknown>>) {
  return {
    id,
    tenantId: tenant,
    name,
    description: `${name} description`,
    rulesJson: { rules },
    estimatedCount: 1,
    createdAt: new Date("2026-05-21T04:00:00.000Z"),
    updatedAt: new Date("2026-05-21T04:00:00.000Z")
  };
}

function sendLog(
  id: string,
  tenant: string,
  campaignId: string,
  contactId: string,
  identityId: string,
  platform: "webchat" | "telegram" | "line" | "facebook" | "instagram",
  status: string,
  reason = "seed safe mock only",
  payloadJson: Record<string, unknown> | null = { safeMockOnly: true }
) {
  return {
    id,
    tenantId: tenant,
    campaignId,
    contactId,
    contactIdentityId: identityId,
    platform,
    channelAccountId: accountId(platform),
    status,
    reason,
    payloadJson,
    createdAt: new Date("2026-05-21T04:00:00.000Z")
  };
}

function contact(id: string, tenant: string, displayName: string, leadStatus: string, identities: ReturnType<typeof identity>[]) {
  const primaryIdentity = identities[0] ?? identity("identity-fallback", "webchat", "fallback-user");
  const platform = primaryIdentity.platform;
  const conversationId = platform === "webchat" ? "conv-web" : `conv-${platform}`;
  return {
    id,
    tenantId: tenant,
    displayName,
    email: `${id}@example.local`,
    phone: "000",
    leadStatus,
    ownerUserId: userId,
    updatedAt: new Date("2026-05-21T04:00:00.000Z"),
    identities,
    tags: [{ tag: { name: "pricing" } }],
    tasks: [{ status: "open" }],
    conversations: [{
      id: conversationId,
      roomId: `room-${platform}`,
      priority: "high",
      status: "open",
      slaStatus: "ok",
      aiState: "need_human",
      lastMessageAt: new Date("2026-05-21T04:00:00.000Z"),
      room: {
        platform,
        channelAccountId: accountId(platform)
      }
    }]
  };
}

function identity(id: string, platform: "webchat" | "telegram" | "line" | "facebook" | "instagram", externalUserId: string) {
  return {
    id,
    platform,
    channelAccountId: accountId(platform),
    externalUserId,
    displayName: externalUserId,
    updatedAt: new Date("2026-05-21T04:00:00.000Z"),
    channelAccount: { displayName: `${platform} account` }
  };
}

function campaignPayload(name: string) {
  return {
    name,
    description: "Created in test",
    channelPlatform: "webchat" as const,
    channelAccountId: accountId("webchat"),
    segmentId: "segment-web",
    contentJson: {
      message: "Hello {{contact.name}}",
      safeMockOnly: true
    }
  };
}

function accountId(platform: "webchat" | "telegram" | "line" | "facebook" | "instagram") {
  if (platform === "webchat") return "00000000-0000-4000-8000-000000000020";
  if (platform === "telegram") return "00000000-0000-4000-8000-000000000021";
  if (platform === "line") return "00000000-0000-4000-8000-000000000022";
  if (platform === "facebook") return "00000000-0000-4000-8000-000000000023";
  return "00000000-0000-4000-8000-000000000024";
}

function stripUndefined<T extends Record<string, any>>(value: T) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined));
}
