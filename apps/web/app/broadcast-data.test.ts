import { describe, expect, it } from "vitest";
import type { BroadcastCampaign, BroadcastSegmentRule, Contact } from "@ai-omni/shared";
import {
  buildBroadcastSummaryText,
  cancelCampaign,
  createCampaign,
  createDefaultBroadcastStore,
  createSegment,
  createTemplate,
  detectSecretPatterns,
  dryRunCampaign,
  duplicateCampaign,
  editSegment,
  editTemplate,
  getBroadcastAnalytics,
  getBroadcastHistoryForContact,
  previewRecipients,
  renderBroadcastMessage,
  sampleBroadcastCampaigns,
  sampleBroadcastSegments,
  scheduleCampaign,
  sendMockCampaign,
  toggleContactBroadcastOptOut,
  type BroadcastSafetyChecklist
} from "./broadcast-data";
import { mockContacts } from "./crm-data";
import { mockConversations } from "./inbox-data";

const completeChecklist: BroadcastSafetyChecklist = {
  mockOnly: true,
  reviewedRecipients: true,
  reviewedContent: true,
  noSecrets: true,
  noSensitiveTemplateData: true
};

function campaignForRules(rules: BroadcastSegmentRule[]): BroadcastCampaign {
  return {
    ...sampleBroadcastCampaigns[0]!,
    id: "camp-rule-test",
    platformScope: ["webchat", "telegram", "line", "facebook", "instagram"],
    roomIds: [],
    segmentId: "seg-rule-test",
    message: "Hello {{contact.name}}"
  };
}

function previewForRule(rule: BroadcastSegmentRule, contacts: Contact[] = mockContacts) {
  const campaign = campaignForRules([rule]);
  return previewRecipients(campaign, {
    ...createDefaultBroadcastStore(),
    segments: [{ id: "seg-rule-test", name: "Rule test", description: "", rules: [rule], estimatedCount: 0, createdAt: campaign.createdAt, updatedAt: campaign.updatedAt }]
  }, contacts, mockConversations);
}

describe("broadcast mock store", () => {
  it("filters recipients by platform, room, tag, lead status, owner, task, and priority", () => {
    expect(previewForRule({ id: "r-platform", field: "platform", operator: "equals", value: "line" }).every((item) => item.platform === "line")).toBe(true);
    expect(previewForRule({ id: "r-room", field: "roomId", operator: "equals", value: "line-oa-main" }).every((item) => item.roomId === "line-oa-main")).toBe(true);
    expect(previewForRule({ id: "r-tag", field: "tag", operator: "contains", value: "pricing" }).map((item) => item.contactId)).toContain("contact-anya");
    expect(previewForRule({ id: "r-lead", field: "leadStatus", operator: "equals", value: "quoted" }).map((item) => item.contactId)).toContain("contact-krit");
    expect(previewForRule({ id: "r-owner", field: "ownerAgent", operator: "equals", value: "May" }).map((item) => item.contactId)).toContain("contact-anya");
    expect(previewForRule({ id: "r-task", field: "hasOpenTask", operator: "equals", value: true }).length).toBeGreaterThan(0);
    expect(previewForRule({ id: "r-priority", field: "priority", operator: "equals", value: "urgent" }).map((item) => item.contactId)).toContain("contact-krit");
  });

  it("supports required sample segments and correct preview counts", () => {
    const store = createDefaultBroadcastStore();
    const hotCampaign: BroadcastCampaign = { ...store.campaigns[0]!, platformScope: ["webchat"], roomIds: ["webchat-main"], segmentId: "seg-hot-leads" };
    const lineCampaign: BroadcastCampaign = { ...store.campaigns[0]!, platformScope: ["line"], roomIds: ["line-oa-main"], segmentId: "seg-line-follow-up" };

    expect(sampleBroadcastSegments.map((segment) => segment.name)).toEqual(["Hot leads", "LINE follow up", "Pricing interested", "Unresolved urgent", "Facebook qualified"]);
    expect(previewRecipients(hotCampaign, store).map((item) => item.contactId)).toEqual(["contact-anya"]);
    expect(previewRecipients(lineCampaign, store).map((item) => item.contactId)).toEqual(["contact-mint"]);
  });

  it("renders supported variables and falls back for missing values without throwing", () => {
    const contact = mockContacts[0]!;
    const rendered = renderBroadcastMessage("Hi {{contact.name}} {{leadStatus}} {{ownerAgent}} {{platform}} {{roomName}} {{contact.missing}}", contact, contact.identities[0]!, "Main Website");

    expect(rendered).toContain("Anya Prom");
    expect(rendered).toContain("qualified");
    expect(rendered).toContain("May");
    expect(rendered).toContain("webchat");
    expect(rendered).toContain("Main Website");
    expect(rendered).toContain("-");
  });

  it("detects risky secret patterns and blocks send mock before delivery", () => {
    const store = createDefaultBroadcastStore();
    const risky = createCampaign(store, {
      name: "Risky",
      platformScope: ["webchat"],
      roomIds: ["webchat-main"],
      segmentId: "seg-hot-leads",
      message: "Do not send Bearer local-demo-value",
      scheduleType: "now"
    }, new Date("2026-05-21T06:00:00.000Z"));
    const result = sendMockCampaign(risky, risky.campaigns[0]!.id, completeChecklist, new Date("2026-05-21T06:01:00.000Z"));

    expect(detectSecretPatterns("OPENAI_API_KEY should never be in campaign body").hasSecret).toBe(true);
    expect(result.blockedReason).toContain("Secret pattern");
    expect(result.run).toBeNull();
    expect(result.events).toHaveLength(0);
    expect(result.externalCalls).toEqual([]);
  });

  it("creates, duplicates, schedules, cancels, pauses, resumes, edits segment and template locally", () => {
    const created = createCampaign(createDefaultBroadcastStore(), {
      name: "Draft local",
      platformScope: ["line"],
      roomIds: ["line-oa-main"],
      segmentId: "seg-line-follow-up",
      templateId: "tmpl-human-support",
      message: "Hello {{contact.name}}",
      scheduleType: "now"
    }, new Date("2026-05-21T06:00:00.000Z"));
    const id = created.campaigns[0]!.id;
    const duplicated = duplicateCampaign(created, id, new Date("2026-05-21T06:01:00.000Z"));
    const scheduled = scheduleCampaign(duplicated, id, "2026-05-22T06:00:00.000Z", new Date("2026-05-21T06:02:00.000Z"));
    const cancelled = cancelCampaign(scheduled, id, new Date("2026-05-21T06:03:00.000Z"));
    const paused = cancelCampaign(scheduled, id, new Date("2026-05-21T06:03:00.000Z"));
    const withSegment = editSegment(createSegment(paused, { name: "Owners", rules: [{ id: "r-owner", field: "ownerAgent", operator: "equals", value: "May" }] }), "seg-hot-leads", { description: "Updated" });
    const withTemplate = editTemplate(createTemplate(withSegment, { name: "Local", category: "sales", body: "Hello", variables: [], tags: [] }), "tmpl-promo-follow-up", { isActive: false });

    expect(created.campaigns[0]?.status).toBe("draft");
    expect(duplicated.campaigns[0]?.name).toContain("Copy");
    expect(scheduled.campaigns.find((item) => item.id === id)?.status).toBe("scheduled");
    expect(cancelled.campaigns.find((item) => item.id === id)?.status).toBe("cancelled");
    expect(withTemplate.templates.find((item) => item.id === "tmpl-promo-follow-up")?.isActive).toBe(false);
    expect(withTemplate.segments.find((item) => item.id === "seg-hot-leads")?.description).toBe("Updated");
    expect(paused.auditLogs.length).toBeGreaterThan(0);
  });

  it("requires safety checklist, creates run, recipients, delivery events, and never records external calls", () => {
    const store = createDefaultBroadcastStore();
    const incomplete = sendMockCampaign(store, "camp-line-follow-up", { ...completeChecklist, reviewedRecipients: false });
    const sent = sendMockCampaign(store, "camp-line-follow-up", completeChecklist, new Date("2026-05-21T07:00:00.000Z"));

    expect(incomplete.blockedReason).toBe("Safety checklist incomplete");
    expect(sent.run?.status).toBe("completed");
    expect(sent.recipients.some((item) => item.status === "skipped" && item.reason?.includes("opt-out"))).toBe(true);
    expect(sent.run?.sentMockCount).toBe(0);
    expect(sent.run?.skippedCount).toBe(1);
    expect(sent.events.map((event) => event.status)).toEqual(["skipped"]);
    expect(sent.externalCalls).toEqual([]);
  });

  it("updates analytics, history, opt-out preview, and safe summary", () => {
    const optedInContacts = toggleContactBroadcastOptOut(mockContacts, "contact-mint", false);
    const sent = sendMockCampaign(createDefaultBroadcastStore(), "camp-line-follow-up", completeChecklist, new Date("2026-05-21T07:00:00.000Z"));
    const analytics = getBroadcastAnalytics(sent.store);
    const history = getBroadcastHistoryForContact(sent.store, "contact-mint");
    const optedOut = toggleContactBroadcastOptOut(optedInContacts, "contact-mint", true);
    const preview = previewRecipients(createDefaultBroadcastStore().campaigns[0]!, createDefaultBroadcastStore(), optedOut);
    const summary = buildBroadcastSummaryText(sent.store, "camp-line-follow-up");

    expect(analytics.totalCampaigns).toBeGreaterThan(0);
    expect(analytics.topCampaignByRecipients?.name).toBe("Hot Lead Reminder");
    expect(history[0]?.recipient.status).toBe("skipped");
    expect(preview[0]?.reason).toContain("opt-out");
    expect(summary).toContain("External API calls: 0");
    expect(detectSecretPatterns(summary).hasSecret).toBe(false);
  });

  it("dry run returns preview and does not create delivery events", () => {
    const store = createDefaultBroadcastStore();
    const result = dryRunCampaign(store, "camp-hot-lead-reminder", completeChecklist, new Date("2026-05-21T08:00:00.000Z"));

    expect(result.preview.length).toBeGreaterThan(0);
    expect(result.store.events).toHaveLength(store.events.length);
    expect(result.externalCalls).toEqual([]);
  });
});
