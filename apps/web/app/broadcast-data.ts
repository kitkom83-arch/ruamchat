import type {
  AuditLog,
  BroadcastCampaign,
  BroadcastComplianceLog,
  BroadcastDeliveryEvent,
  BroadcastRecipient,
  BroadcastRecipientStatus,
  BroadcastRun,
  BroadcastSendLog,
  BroadcastSegment,
  BroadcastSegmentRule,
  BroadcastTemplate,
  Contact,
  ContactIdentity,
  DataMode,
  Platform
} from "@ai-omni/shared";
import { getBroadcastCampaigns, getBroadcastComplianceLogs, getBroadcastSegments, getBroadcastSendLogs } from "./api-client";
import { mockContacts } from "./crm-data";
import { mockConversations, platformRooms, type ConversationCard } from "./inbox-data";

export type BroadcastStore = {
  campaigns: BroadcastCampaign[];
  segments: BroadcastSegment[];
  templates: BroadcastTemplate[];
  recipients: BroadcastRecipient[];
  runs: BroadcastRun[];
  events: BroadcastDeliveryEvent[];
  auditLogs: AuditLog[];
};

export type BroadcastBuilderMockData = {
  mode: "mock";
  store: BroadcastStore;
  sendLogs: BroadcastSendLog[];
};

export type BroadcastBuilderApiData = {
  mode: "api";
  store: BroadcastStore;
  sendLogs: BroadcastSendLog[];
  complianceLogs: BroadcastComplianceLog[];
};

export type BroadcastBuilderData = BroadcastBuilderMockData | BroadcastBuilderApiData;

export type BroadcastSafetyChecklist = {
  mockOnly: boolean;
  reviewedRecipients: boolean;
  reviewedContent: boolean;
  noSecrets: boolean;
  noSensitiveTemplateData: boolean;
};

export type BroadcastPreviewRecipient = BroadcastRecipient & {
  tags: string[];
  leadStatus: Contact["leadStatus"];
  ownerAgent: string;
  roomName: string;
  optOutBroadcast: boolean;
  suppressedReason?: string;
};

export type BroadcastAnalytics = {
  totalCampaigns: number;
  scheduled: number;
  sentMock: number;
  totalRecipients: number;
  sentMockCount: number;
  skippedCount: number;
  failedMockCount: number;
  optOutSkippedCount: number;
  mockSentRate: number;
  topCampaignByRecipients: { id: string; name: string; recipients: number } | null;
};

export const broadcastStoreStorageKey = "ai-omni-broadcast-store-v1";
export const allBroadcastPlatforms: Platform[] = ["webchat", "telegram", "line", "facebook", "instagram"];

const now = "2026-05-21T03:30:00.000Z";

export const safetyChecklistLabels: Array<{ key: keyof BroadcastSafetyChecklist; label: string }> = [
  { key: "mockOnly", label: "I confirm this is mock send only" },
  { key: "reviewedRecipients", label: "I reviewed recipient preview" },
  { key: "reviewedContent", label: "I reviewed message content" },
  { key: "noSecrets", label: "I confirm no secret/token/password in message" },
  { key: "noSensitiveTemplateData", label: "I confirm no sensitive customer data in template" }
];

export const emptySafetyChecklist: BroadcastSafetyChecklist = {
  mockOnly: false,
  reviewedRecipients: false,
  reviewedContent: false,
  noSecrets: false,
  noSensitiveTemplateData: false
};

export const sampleBroadcastTemplates: BroadcastTemplate[] = [
  template("tmpl-promo-follow-up", "Promo follow up", "sales", "สวัสดีคุณ {{contact.firstName}} โปรโมชันสำหรับ {{leadStatus}} ยังเปิดอยู่ครับ ทีม {{ownerAgent}} ช่วยดูต่อได้ครับ", ["contact.firstName", "leadStatus", "ownerAgent"], ["promo", "follow-up"]),
  template("tmpl-pricing-reminder", "Pricing reminder", "sales", "สวัสดีคุณ {{contact.name}} จากที่สนใจราคา ทีมเราสรุปแพ็กเกจให้ตามช่องทาง {{platform}} ได้ครับ", ["contact.name", "platform"], ["pricing"]),
  template("tmpl-appointment-reminder", "Appointment reminder", "support", "แจ้งเตือนนัดหมายของคุณ {{contact.name}} ผ่าน {{roomName}} หากต้องการเลื่อนนัดตอบกลับได้เลยครับ", ["contact.name", "roomName"], ["appointment"]),
  template("tmpl-human-support", "Human support follow up", "support", "สวัสดีคุณ {{contact.firstName}} แอดมิน {{ownerAgent}} จะช่วยติดตามเคสนี้ต่อใน {{roomName}} ครับ", ["contact.firstName", "ownerAgent", "roomName"], ["support"])
];

export const sampleBroadcastSegments: BroadcastSegment[] = [
  segment("seg-hot-leads", "Hot leads", "Contacts tagged as hot lead.", [rule("rule-hot-tag", "tag", "contains", "hot lead")]),
  segment("seg-line-follow-up", "LINE follow up", "LINE contacts with follow_up lead status.", [
    rule("rule-line-platform", "platform", "equals", "line"),
    rule("rule-follow-status", "leadStatus", "equals", "follow_up")
  ]),
  segment("seg-pricing-interested", "Pricing interested", "Contacts tagged pricing.", [rule("rule-pricing-tag", "tag", "contains", "pricing")]),
  segment("seg-unresolved-urgent", "Unresolved urgent", "Urgent conversations not resolved.", [
    rule("rule-urgent-priority", "priority", "equals", "urgent"),
    rule("rule-not-resolved", "status", "not_equals", "resolved")
  ]),
  segment("seg-facebook-qualified", "Facebook qualified", "Qualified Facebook contacts.", [
    rule("rule-facebook-platform", "platform", "equals", "facebook"),
    rule("rule-qualified", "leadStatus", "equals", "qualified")
  ])
];

export const sampleBroadcastCampaigns: BroadcastCampaign[] = [
  campaign("camp-line-follow-up", "LINE Follow Up Campaign", "Follow up LINE contacts only.", "draft", ["line"], ["line-oa-main"], "seg-line-follow-up", "tmpl-human-support", "สวัสดีคุณ {{contact.firstName}} แอดมิน {{ownerAgent}} ขออนุญาตติดตามผ่าน {{roomName}} ครับ", "now"),
  campaign("camp-pricing-interest", "Pricing Interest Campaign", "Pricing interested contacts across scoped accounts.", "scheduled", ["webchat", "facebook"], ["webchat-main", "facebook-page-main"], "seg-pricing-interested", "tmpl-pricing-reminder", "สวัสดีคุณ {{contact.name}} ทีมเราช่วยสรุปราคาให้ใน {{platform}} ได้ครับ", "scheduled", "2026-05-22T04:00:00.000Z"),
  campaign("camp-hot-lead-reminder", "Hot Lead Reminder", "Reminder for hot leads.", "sent", allBroadcastPlatforms, [], "seg-hot-leads", "tmpl-promo-follow-up", "สวัสดีคุณ {{contact.firstName}} ยังสนใจให้ทีม {{ownerAgent}} ช่วยดูแพ็กเกจต่อไหมครับ", "now", undefined, "2026-05-21T04:20:00.000Z")
];

const sampleRecipients: BroadcastRecipient[] = [
  recipient("recipient-hot-anya-web", "camp-hot-lead-reminder", "contact-anya", "identity-anya-web", "webchat", "webchat-main", "Anya", "sent_mock", "สวัสดีคุณ Anya ยังสนใจให้ทีม May ช่วยดูแพ็กเกจต่อไหมครับ", undefined, "2026-05-21T04:20:00.000Z")
];

const sampleRuns: BroadcastRun[] = [{
  id: "run-camp-hot-lead-reminder",
  campaignId: "camp-hot-lead-reminder",
  status: "completed",
  totalRecipients: 1,
  sentMockCount: 1,
  failedMockCount: 0,
  skippedCount: 0,
  startedAt: "2026-05-21T04:20:00.000Z",
  completedAt: "2026-05-21T04:20:01.000Z",
  summary: "Mock send completed. No external APIs were called."
}];

const sampleEvents: BroadcastDeliveryEvent[] = [{
  id: "event-recipient-hot-anya-web-sent",
  campaignId: "camp-hot-lead-reminder",
  recipientId: "recipient-hot-anya-web",
  status: "sent_mock",
  message: "sent_mock locally only",
  createdAt: "2026-05-21T04:20:01.000Z"
}];

export function createDefaultBroadcastStore(): BroadcastStore {
  return {
    campaigns: sampleBroadcastCampaigns,
    segments: sampleBroadcastSegments,
    templates: sampleBroadcastTemplates,
    recipients: sampleRecipients,
    runs: sampleRuns,
    events: sampleEvents,
    auditLogs: []
  };
}

export function loadBroadcastBuilderData(mode: "mock"): Promise<BroadcastBuilderMockData>;
export function loadBroadcastBuilderData(mode: "api"): Promise<BroadcastBuilderApiData>;
export function loadBroadcastBuilderData(mode: DataMode): Promise<BroadcastBuilderData>;
export async function loadBroadcastBuilderData(mode: DataMode): Promise<BroadcastBuilderData> {
  if (mode === "mock") {
    return {
      mode,
      store: getStoredBroadcastStore(),
      sendLogs: []
    };
  }

  const [campaigns, segments] = await Promise.all([
    getBroadcastCampaigns(),
    getBroadcastSegments()
  ]);
  const sendLogs = (await Promise.all(campaigns.map((campaign) => getBroadcastSendLogs(campaign.id)))).flat();
  const complianceLogs = (await Promise.all(campaigns.map((campaign) => getBroadcastComplianceLogs(campaign.id)))).flat();
  return {
    mode,
    sendLogs,
    complianceLogs,
    store: {
      campaigns,
      segments,
      templates: sampleBroadcastTemplates,
      recipients: [],
      runs: [],
      events: sendLogs.map(sendLogToDeliveryEvent),
      auditLogs: []
    }
  };
}

export function getStoredBroadcastStore() {
  if (typeof window === "undefined") return createDefaultBroadcastStore();
  try {
    const raw = window.localStorage.getItem(broadcastStoreStorageKey);
    if (!raw) return createDefaultBroadcastStore();
    const parsed = JSON.parse(raw) as Partial<BroadcastStore>;
    return {
      campaigns: Array.isArray(parsed.campaigns) ? parsed.campaigns : sampleBroadcastCampaigns,
      segments: Array.isArray(parsed.segments) ? parsed.segments : sampleBroadcastSegments,
      templates: Array.isArray(parsed.templates) ? parsed.templates : sampleBroadcastTemplates,
      recipients: Array.isArray(parsed.recipients) ? parsed.recipients : sampleRecipients,
      runs: Array.isArray(parsed.runs) ? parsed.runs : sampleRuns,
      events: Array.isArray(parsed.events) ? parsed.events : sampleEvents,
      auditLogs: Array.isArray(parsed.auditLogs) ? parsed.auditLogs : []
    };
  } catch {
    return createDefaultBroadcastStore();
  }
}

export function saveStoredBroadcastStore(store: BroadcastStore) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(broadcastStoreStorageKey, JSON.stringify(store));
  window.dispatchEvent(new CustomEvent(broadcastStoreStorageKey, { detail: store }));
}

export function subscribeBroadcastStore(callback: (store: BroadcastStore) => void) {
  if (typeof window === "undefined") return () => {};
  const notify = () => callback(getStoredBroadcastStore());
  const handleStorage = (event: StorageEvent) => {
    if (event.key === broadcastStoreStorageKey) notify();
  };
  window.addEventListener("storage", handleStorage);
  window.addEventListener(broadcastStoreStorageKey, notify);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(broadcastStoreStorageKey, notify);
  };
}

export function createCampaign(store: BroadcastStore, input: {
  name: string;
  description?: string;
  platformScope: Platform[];
  roomIds: string[];
  segmentId: string;
  templateId?: string;
  message: string;
  scheduleType: BroadcastCampaign["scheduleType"];
  scheduledAt?: string;
  createdBy?: string;
}, at = new Date()) {
  const createdAt = at.toISOString();
  const campaignItem: BroadcastCampaign = {
    id: `camp-${slug(input.name)}-${at.getTime()}`,
    name: input.name.trim() || "Untitled campaign",
    description: input.description?.trim() ?? "",
    status: "draft",
    platformScope: input.platformScope.length > 0 ? input.platformScope : allBroadcastPlatforms,
    roomIds: input.roomIds,
    segmentId: input.segmentId,
    templateId: input.templateId,
    message: input.message.trim() || "สวัสดีคุณ {{contact.name}}",
    scheduleType: input.scheduleType,
    scheduledAt: input.scheduleType === "scheduled" ? input.scheduledAt : undefined,
    createdBy: input.createdBy ?? "Demo Admin",
    createdAt,
    updatedAt: createdAt
  };
  return withAudit({ ...store, campaigns: [campaignItem, ...store.campaigns] }, "broadcast_create_campaign", campaignItem.id, {}, at);
}

export function editCampaign(store: BroadcastStore, campaignId: string, patch: Partial<Omit<BroadcastCampaign, "id" | "createdAt">>, at = new Date()) {
  return withAudit({
    ...store,
    campaigns: store.campaigns.map((campaignItem) => campaignItem.id === campaignId ? { ...campaignItem, ...patch, updatedAt: at.toISOString() } : campaignItem)
  }, "broadcast_edit_campaign", campaignId, {}, at);
}

export function duplicateCampaign(store: BroadcastStore, campaignId: string, at = new Date()) {
  const source = store.campaigns.find((item) => item.id === campaignId);
  if (!source) return store;
  const copy: BroadcastCampaign = {
    ...source,
    id: `${source.id}-copy-${at.getTime()}`,
    name: `${source.name} Copy`,
    status: "draft",
    createdAt: at.toISOString(),
    updatedAt: at.toISOString(),
    sentAt: undefined
  };
  return withAudit({ ...store, campaigns: [copy, ...store.campaigns] }, "broadcast_duplicate_campaign", copy.id, { sourceId: campaignId }, at);
}

export function scheduleCampaign(store: BroadcastStore, campaignId: string, scheduledAt: string, at = new Date()) {
  return editCampaign(store, campaignId, { status: "scheduled", scheduleType: "scheduled", scheduledAt }, at);
}

export function cancelCampaign(store: BroadcastStore, campaignId: string, at = new Date()) {
  return editCampaign(store, campaignId, { status: "cancelled" }, at);
}

export function pauseCampaign(store: BroadcastStore, campaignId: string, at = new Date()) {
  return editCampaign(store, campaignId, { status: "paused" }, at);
}

export function resumeCampaign(store: BroadcastStore, campaignId: string, at = new Date()) {
  const campaignItem = store.campaigns.find((item) => item.id === campaignId);
  return editCampaign(store, campaignId, { status: campaignItem?.scheduleType === "scheduled" ? "scheduled" : "draft" }, at);
}

export function createTemplate(store: BroadcastStore, input: Pick<BroadcastTemplate, "name" | "category" | "body" | "variables" | "tags">, at = new Date()) {
  const item = template(`tmpl-${slug(input.name)}-${at.getTime()}`, input.name, input.category, input.body, input.variables, input.tags, at.toISOString(), true);
  return withAudit({ ...store, templates: [item, ...store.templates] }, "broadcast_create_template", item.id, {}, at);
}

export function editTemplate(store: BroadcastStore, templateId: string, patch: Partial<Omit<BroadcastTemplate, "id" | "createdAt">>, at = new Date()) {
  return withAudit({
    ...store,
    templates: store.templates.map((item) => item.id === templateId ? { ...item, ...patch, updatedAt: at.toISOString() } : item)
  }, "broadcast_edit_template", templateId, {}, at);
}

export function archiveTemplate(store: BroadcastStore, templateId: string, at = new Date()) {
  return editTemplate(store, templateId, { isActive: false }, at);
}

export function createSegment(store: BroadcastStore, input: { name: string; description?: string; rules: BroadcastSegmentRule[] }, at = new Date()) {
  const item = segment(`seg-${slug(input.name)}-${at.getTime()}`, input.name.trim() || "Untitled segment", input.description ?? "", input.rules, at.toISOString());
  return withAudit({ ...store, segments: [item, ...store.segments] }, "broadcast_create_segment", item.id, {}, at);
}

export function editSegment(store: BroadcastStore, segmentId: string, patch: Partial<Omit<BroadcastSegment, "id" | "createdAt">>, at = new Date()) {
  return withAudit({
    ...store,
    segments: store.segments.map((item) => item.id === segmentId ? { ...item, ...patch, updatedAt: at.toISOString() } : item)
  }, "broadcast_edit_segment", segmentId, {}, at);
}

export function previewRecipients(
  campaignItem: BroadcastCampaign,
  store: BroadcastStore = createDefaultBroadcastStore(),
  contacts: Contact[] = mockContacts,
  conversations: ConversationCard[] = mockConversations
): BroadcastPreviewRecipient[] {
  const segmentItem = store.segments.find((item) => item.id === campaignItem.segmentId);
  const scopedRooms = platformRooms.filter((room) =>
    campaignItem.platformScope.includes(room.platform) &&
    (campaignItem.roomIds.length === 0 || campaignItem.roomIds.includes(room.id))
  );
  return contacts.flatMap((contact) => {
    const matchingIdentities = contact.identities.filter((identityItem) =>
      scopedRooms.some((room) => room.platform === identityItem.platform && room.id === identityItem.channelAccountId)
    );
    const candidateIdentities = matchingIdentities.length > 0 ? matchingIdentities : [null];
    return candidateIdentities
      .map((identityItem) => buildPreviewRecipient(campaignItem, contact, identityItem, segmentItem, conversations))
      .filter((item): item is BroadcastPreviewRecipient => Boolean(item));
  });
}

export function dryRunCampaign(store: BroadcastStore, campaignId: string, checklist: BroadcastSafetyChecklist = emptySafetyChecklist, at = new Date()) {
  const campaignItem = store.campaigns.find((item) => item.id === campaignId);
  if (!campaignItem) return { store, preview: [], blockedReason: "Campaign not found", externalCalls: [] as string[] };
  const secret = detectSecretPatterns(campaignItem.message);
  const preview = previewRecipients(campaignItem, store);
  const blockedReason = secret.hasSecret ? `Secret pattern detected: ${secret.matches.join(", ")}` : !isSafetyChecklistComplete(checklist) ? "Safety checklist incomplete" : undefined;
  return {
    store: withAudit(store, "broadcast_dry_run", campaignId, { previewCount: preview.length, blocked: Boolean(blockedReason) }, at),
    preview,
    blockedReason,
    externalCalls: [] as string[]
  };
}

export function sendMockCampaign(store: BroadcastStore, campaignId: string, checklist: BroadcastSafetyChecklist, at = new Date()) {
  const campaignItem = store.campaigns.find((item) => item.id === campaignId);
  if (!campaignItem) return { store, run: null, events: [], recipients: [], blockedReason: "Campaign not found", externalCalls: [] as string[] };
  if (!isSafetyChecklistComplete(checklist)) {
    return { store, run: null, events: [], recipients: [], blockedReason: "Safety checklist incomplete", externalCalls: [] as string[] };
  }
  const templateItem = campaignItem.templateId ? store.templates.find((item) => item.id === campaignItem.templateId) : null;
  const secret = detectSecretPatterns([campaignItem.message, templateItem?.body ?? ""].join("\n"));
  if (secret.hasSecret) {
    return { store: editCampaign(store, campaignId, { status: "failed" }, at), run: null, events: [], recipients: [], blockedReason: `Secret pattern detected: ${secret.matches.join(", ")}`, externalCalls: [] as string[] };
  }

  const startedAt = at.toISOString();
  const preview = previewRecipients(campaignItem, store);
  const completedRecipients = preview.map((item) => {
    const status: BroadcastRecipientStatus = item.reason ? "skipped" : "sent_mock";
    return { ...item, status, updatedAt: startedAt };
  });
  const events = completedRecipients.map((item, index): BroadcastDeliveryEvent => ({
    id: `event-${campaignId}-${item.id}-${index}-${at.getTime()}`,
    campaignId,
    recipientId: item.id,
    status: item.status,
    message: item.reason ?? "sent_mock locally only",
    createdAt: new Date(at.getTime() + index + 1).toISOString()
  }));
  const sentMockCount = completedRecipients.filter((item) => item.status === "sent_mock").length;
  const skippedCount = completedRecipients.filter((item) => item.status === "skipped").length;
  const failedMockCount = 0;
  const runItem: BroadcastRun = {
    id: `run-${campaignId}-${at.getTime()}`,
    campaignId,
    status: "completed",
    totalRecipients: completedRecipients.length,
    sentMockCount,
    failedMockCount,
    skippedCount,
    startedAt,
    completedAt: new Date(at.getTime() + Math.max(1, completedRecipients.length) * 1000).toISOString(),
    summary: `Mock send completed: ${sentMockCount} sent_mock, ${skippedCount} skipped, ${failedMockCount} failed_mock. No external APIs were called.`
  };
  const nextStore = withAudit({
    ...store,
    campaigns: store.campaigns.map((item) => item.id === campaignId ? { ...item, status: "sent", sentAt: runItem.completedAt, updatedAt: runItem.completedAt ?? startedAt } : item),
    recipients: [...completedRecipients, ...store.recipients.filter((item) => item.campaignId !== campaignId)],
    runs: [runItem, ...store.runs],
    events: [...events, ...store.events]
  }, "broadcast_send_mock", campaignId, { runId: runItem.id, sentMockCount, skippedCount, failedMockCount }, at);

  return { store: nextStore, run: runItem, events, recipients: completedRecipients, blockedReason: undefined, externalCalls: [] as string[] };
}

export function getBroadcastAnalytics(store: BroadcastStore): BroadcastAnalytics {
  const sentMockCount = store.runs.reduce((sum, runItem) => sum + runItem.sentMockCount, 0);
  const skippedCount = store.runs.reduce((sum, runItem) => sum + runItem.skippedCount, 0);
  const failedMockCount = store.runs.reduce((sum, runItem) => sum + runItem.failedMockCount, 0);
  const totalRecipients = store.runs.reduce((sum, runItem) => sum + runItem.totalRecipients, 0);
  const byCampaign = store.campaigns
    .map((campaignItem) => ({ id: campaignItem.id, name: campaignItem.name, recipients: store.runs.filter((runItem) => runItem.campaignId === campaignItem.id).reduce((sum, runItem) => sum + runItem.totalRecipients, 0) }))
    .sort((a, b) => b.recipients - a.recipients || a.name.localeCompare(b.name));
  return {
    totalCampaigns: store.campaigns.length,
    scheduled: store.campaigns.filter((item) => item.status === "scheduled").length,
    sentMock: store.campaigns.filter((item) => item.status === "sent").length,
    totalRecipients,
    sentMockCount,
    skippedCount,
    failedMockCount,
    optOutSkippedCount: store.events.filter((event) => event.status === "skipped" && event.message.toLowerCase().includes("opt-out")).length,
    mockSentRate: totalRecipients === 0 ? 0 : Math.round((sentMockCount / totalRecipients) * 100),
    topCampaignByRecipients: byCampaign[0]?.recipients ? byCampaign[0] : null
  };
}

export function getBroadcastHistoryForContact(store: BroadcastStore, contactId: string) {
  return store.recipients
    .filter((recipientItem) => recipientItem.contactId === contactId)
    .map((recipientItem) => ({
      recipient: recipientItem,
      campaign: store.campaigns.find((item) => item.id === recipientItem.campaignId),
      events: store.events.filter((event) => event.recipientId === recipientItem.id)
    }))
    .sort((a, b) => b.recipient.updatedAt.localeCompare(a.recipient.updatedAt));
}

export function getLastCampaignReceived(store: BroadcastStore, contactId: string) {
  return getBroadcastHistoryForContact(store, contactId).find((item) => item.recipient.status === "sent_mock")?.campaign ?? null;
}

export function toggleContactBroadcastOptOut(contacts: Contact[], contactId: string, optOutBroadcast: boolean, suppressedReason = "Mock opt-out from Customer 360") {
  return contacts.map((contact) => contact.id === contactId ? {
    ...contact,
    optOutBroadcast,
    suppressedReason: optOutBroadcast ? suppressedReason : undefined,
    updatedAt: new Date().toISOString()
  } : contact);
}

export function renderBroadcastMessage(message: string, contact: Contact, identityItem: ContactIdentity | null, roomName = "-") {
  const firstName = contact.displayName.split(/\s+/)[0] ?? contact.displayName;
  const values: Record<string, string | undefined> = {
    "contact.name": contact.displayName,
    "contact.firstName": firstName,
    "contact.email": contact.email,
    "contact.phone": contact.phone,
    leadStatus: contact.leadStatus,
    ownerAgent: contact.ownerAgent,
    platform: identityItem?.platform,
    roomName
  };
  return message.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_match, key: string) => values[key.trim()] ?? "-");
}

export function detectSecretPatterns(value: string) {
  const patterns = [
    { label: "sk-", regex: /sk-[a-z0-9_-]{3,}/i },
    { label: "Bearer", regex: /\bBearer\s+[a-z0-9._-]+/i },
    { label: "OPENAI_API_KEY", regex: /OPENAI_API_KEY/i },
    { label: "LINE_CHANNEL_SECRET", regex: /LINE_CHANNEL_SECRET/i },
    { label: "TELEGRAM_BOT_TOKEN", regex: /TELEGRAM_BOT_TOKEN/i },
    { label: "META_APP_SECRET", regex: /META_APP_SECRET/i },
    { label: "ACCESS_TOKEN", regex: /ACCESS_TOKEN/i },
    { label: "password", regex: /\bpassword\b/i },
    { label: "token", regex: /\btoken\b/i },
    { label: "secret", regex: /\bsecret\b/i }
  ];
  const matches = patterns.filter((pattern) => pattern.regex.test(value)).map((pattern) => pattern.label);
  return { hasSecret: matches.length > 0, matches };
}

export function buildBroadcastSummaryText(store: BroadcastStore, campaignId: string) {
  const campaignItem = store.campaigns.find((item) => item.id === campaignId);
  const runs = store.runs.filter((item) => item.campaignId === campaignId);
  const sentMockCount = runs.reduce((sum, item) => sum + item.sentMockCount, 0);
  const skippedCount = runs.reduce((sum, item) => sum + item.skippedCount, 0);
  const text = `Campaign: ${campaignItem?.name ?? campaignId}. Status: ${campaignItem?.status ?? "unknown"}. Mock sent: ${sentMockCount}. Skipped: ${skippedCount}. External API calls: 0.`;
  return detectSecretPatterns(text).hasSecret ? "Broadcast summary blocked by secret guard." : text;
}

export function isSafetyChecklistComplete(checklist: BroadcastSafetyChecklist) {
  return Object.values(checklist).every(Boolean);
}

function buildPreviewRecipient(
  campaignItem: BroadcastCampaign,
  contact: Contact,
  identityItem: ContactIdentity | null,
  segmentItem: BroadcastSegment | undefined,
  conversations: ConversationCard[]
): BroadcastPreviewRecipient | null {
  const room = identityItem ? platformRooms.find((item) => item.id === identityItem.channelAccountId && item.platform === identityItem.platform) : null;
  if (segmentItem && !matchesSegment(contact, identityItem, segmentItem, conversations)) return null;
  const platform = identityItem?.platform ?? campaignItem.platformScope[0] ?? "webchat";
  const roomId = identityItem?.channelAccountId ?? campaignItem.roomIds[0] ?? `${platform}-missing`;
  const reason = contact.optOutBroadcast
    ? `opt-out: ${contact.suppressedReason ?? "suppressed for broadcast"}`
    : identityItem === null
      ? "missing identity in campaign platform scope"
      : undefined;
  return {
    id: `recipient-${campaignItem.id}-${contact.id}-${identityItem?.id ?? "missing"}`,
    campaignId: campaignItem.id,
    contactId: contact.id,
    identityId: identityItem?.id ?? "missing-identity",
    platform,
    roomId,
    displayName: identityItem?.displayName ?? contact.displayName,
    status: "pending",
    reason,
    renderedMessage: renderBroadcastMessage(campaignItem.message, contact, identityItem, room?.roomName ?? "-"),
    createdAt: campaignItem.updatedAt,
    updatedAt: campaignItem.updatedAt,
    tags: contact.tags,
    leadStatus: contact.leadStatus,
    ownerAgent: contact.ownerAgent ?? "Unassigned",
    roomName: room?.roomName ?? "-",
    optOutBroadcast: Boolean(contact.optOutBroadcast),
    suppressedReason: contact.suppressedReason
  };
}

function matchesSegment(contact: Contact, identityItem: ContactIdentity | null, segmentItem: BroadcastSegment, conversations: ConversationCard[]) {
  return segmentItem.rules.every((ruleItem) => matchesRule(contact, identityItem, ruleItem, conversations));
}

function matchesRule(contact: Contact, identityItem: ContactIdentity | null, ruleItem: BroadcastSegmentRule, conversations: ConversationCard[]) {
  const related = getRelatedConversations(contact, identityItem, conversations);
  const latestConversation = related[0];
  const value = getRuleValue(contact, identityItem, latestConversation, ruleItem);
  return compare(value, ruleItem.operator, ruleItem.value);
}

function getRuleValue(contact: Contact, identityItem: ContactIdentity | null, conversation: ConversationCard | undefined, ruleItem: BroadcastSegmentRule): unknown {
  switch (ruleItem.field) {
    case "platform":
      return identityItem?.platform;
    case "roomId":
      return identityItem?.channelAccountId;
    case "tag":
      return contact.tags;
    case "leadStatus":
      return contact.leadStatus;
    case "ownerAgent":
      return contact.ownerAgent;
    case "lastSeenDays":
      return Math.floor((new Date("2026-05-21T00:00:00.000Z").getTime() - new Date(identityItem?.lastSeenAt ?? contact.updatedAt).getTime()) / 86400000);
    case "hasOpenTask":
      return contact.tasks.some((taskItem) => taskItem.status === "open");
    case "priority":
      return conversation?.priority ?? "medium";
    case "slaStatus":
      return conversation?.priority === "urgent" ? "breached" : conversation?.priority === "high" ? "warning" : "ok";
    case "aiStatus":
      return conversation?.aiStatus ?? "AI Off";
    case "status":
      return conversation?.status ?? "open";
    case "contactField":
      return contact.customFields[String(ruleItem.value ?? "")];
    default:
      return undefined;
  }
}

function compare(actual: unknown, operator: BroadcastSegmentRule["operator"], expected: unknown) {
  const actualText = normalize(actual);
  const expectedText = normalize(expected);
  const actualArray = Array.isArray(actual) ? actual.map(normalize) : [actualText];
  const expectedArray = Array.isArray(expected) ? expected.map(normalize) : [expectedText];
  if (operator === "equals") return actualText === expectedText;
  if (operator === "not_equals") return actualText !== expectedText;
  if (operator === "contains") return actualArray.some((item) => item.includes(expectedText));
  if (operator === "not_contains") return actualArray.every((item) => !item.includes(expectedText));
  if (operator === "in") return expectedArray.includes(actualText);
  if (operator === "not_in") return !expectedArray.includes(actualText);
  if (operator === "greater_than") return Number(actual) > Number(expected);
  if (operator === "less_than") return Number(actual) < Number(expected);
  if (operator === "exists") return actual !== undefined && actual !== null && actualText !== "";
  if (operator === "not_exists") return actual === undefined || actual === null || actualText === "";
  return false;
}

function getRelatedConversations(contact: Contact, identityItem: ContactIdentity | null, conversations: ConversationCard[]) {
  return conversations.filter((conversation) =>
    contact.identities.some((contactIdentity) =>
      conversation.linkedIdentities.some((linked) =>
        linked.platform === contactIdentity.platform &&
        linked.accountName === contactIdentity.accountName &&
        linked.externalUserId === contactIdentity.externalUserId &&
        (!identityItem || identityItem.id === contactIdentity.id)
      )
    )
  );
}

function template(id: string, name: string, category: string, body: string, variables: string[], tags: string[], at = now, isActive = true): BroadcastTemplate {
  return { id, name, category, body, variables, tags, isActive, createdAt: at, updatedAt: at };
}

function segment(id: string, name: string, description: string, rules: BroadcastSegmentRule[], at = now): BroadcastSegment {
  return { id, name, description, rules, estimatedCount: 0, createdAt: at, updatedAt: at };
}

function rule(id: string, field: BroadcastSegmentRule["field"], operator: BroadcastSegmentRule["operator"], value: unknown): BroadcastSegmentRule {
  return { id, field, operator, value };
}

function campaign(
  id: string,
  name: string,
  description: string,
  status: BroadcastCampaign["status"],
  platformScope: Platform[],
  roomIds: string[],
  segmentId: string,
  templateId: string,
  message: string,
  scheduleType: BroadcastCampaign["scheduleType"],
  scheduledAt?: string,
  sentAt?: string
): BroadcastCampaign {
  return { id, name, description, status, platformScope, roomIds, segmentId, templateId, message, scheduleType, scheduledAt, createdBy: "Demo Admin", createdAt: now, updatedAt: sentAt ?? now, sentAt };
}

function recipient(id: string, campaignId: string, contactId: string, identityId: string, platform: Platform, roomId: string, displayName: string, status: BroadcastRecipientStatus, renderedMessage: string, reason?: string, at = now): BroadcastRecipient {
  return { id, campaignId, contactId, identityId, platform, roomId, displayName, status, reason, renderedMessage, createdAt: at, updatedAt: at };
}

function sendLogToDeliveryEvent(log: BroadcastSendLog): BroadcastDeliveryEvent {
  return {
    id: `event-${log.id}`,
    campaignId: log.campaignId,
    recipientId: log.contactIdentityId ?? log.contactId ?? log.id,
    status: log.status,
    message: log.reason ?? "Safe mock broadcast log",
    createdAt: log.createdAt
  };
}

function withAudit(store: BroadcastStore, action: string, targetId: string, metadata: Record<string, unknown>, at: Date): BroadcastStore {
  const log: AuditLog = {
    id: `audit-broadcast-${action}-${targetId}-${at.getTime()}`,
    actorId: "broadcast-mock",
    action,
    targetType: "broadcast",
    targetId,
    metadata,
    createdAt: at.toISOString()
  };
  return { ...store, auditLogs: [log, ...store.auditLogs] };
}

function normalize(value: unknown) {
  return String(value ?? "").toLowerCase().trim();
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9ก-๙]+/gi, "-").replace(/^-|-$/g, "") || "broadcast";
}
