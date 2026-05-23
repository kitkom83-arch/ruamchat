import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import {
  broadcastCampaignStatusSchema,
  broadcastContentJsonSchema,
  broadcastSendLogStatusSchema,
  broadcastSegmentRuleSchema,
  createBroadcastCampaignRequestSchema,
  createBroadcastSegmentRequestSchema,
  platformSchema,
  updateBroadcastCampaignRequestSchema,
  updateBroadcastSegmentRequestSchema,
  type BroadcastAudiencePreviewRecipient,
  type BroadcastAudiencePreviewRequest,
  type BroadcastCampaign,
  type BroadcastContentJson,
  type BroadcastSegment,
  type BroadcastSegmentRule,
  type BroadcastSendLog,
  type BroadcastSendLogStatus,
  type BroadcastSendResult,
  type BroadcastSendTestRequest,
  type CreateBroadcastCampaignRequest,
  type CreateBroadcastSegmentRequest,
  type Platform,
  type ScheduleBroadcastCampaignRequest,
  type UpdateBroadcastCampaignRequest,
  type UpdateBroadcastSegmentRequest
} from "@ai-omni/shared";
import { Prisma } from "@prisma/client";
import { PrismaService } from "./prisma.service.js";

const supportedMockStatuses = new Set<BroadcastSendLogStatus>(["queued_mock", "sent_mock", "skipped_mock", "failed_mock"]);

type BroadcastCampaignRecord = {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  status: string;
  channelPlatform: Platform;
  channelAccountId: string | null;
  segmentId: string | null;
  contentJson: Prisma.JsonValue;
  scheduleAt: Date | null;
  createdByUserId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type BroadcastSegmentRecord = {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  rulesJson: Prisma.JsonValue;
  estimatedCount: number;
  createdAt: Date;
  updatedAt: Date;
};

type BroadcastSendLogRecord = {
  id: string;
  tenantId: string;
  campaignId: string;
  contactId: string | null;
  contactIdentityId: string | null;
  platform: Platform;
  channelAccountId: string | null;
  status: string;
  reason: string | null;
  payloadJson: Prisma.JsonValue | null;
  createdAt: Date;
};

type ContactRecord = {
  id: string;
  tenantId: string;
  displayName: string;
  email: string | null;
  phone: string | null;
  leadStatus: string;
  ownerUserId: string | null;
  updatedAt: Date;
  identities: Array<{
    id: string;
    platform: Platform;
    channelAccountId: string;
    externalUserId: string;
    displayName: string | null;
    updatedAt: Date;
    channelAccount?: { displayName: string };
  }>;
  tags: Array<{ tag: { name: string } }>;
  tasks?: Array<{ status: string }>;
  conversations?: Array<{
    roomId: string;
    priority: string;
    status: string;
    slaStatus: string;
    aiState: string;
    lastMessageAt: Date;
  }>;
};

type AudienceCandidate = BroadcastAudiencePreviewRecipient & {
  contactId: string;
  contactIdentityId: string | null;
};

@Injectable()
export class BroadcastService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async listCampaigns(tenantId: string) {
    const campaigns = await this.prisma.broadcastCampaign.findMany({
      where: { tenantId },
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }]
    });
    return campaigns.map(mapCampaign);
  }

  async createCampaign(tenantId: string, actorUserId: string | undefined, request: CreateBroadcastCampaignRequest) {
    const normalized = normalizeCampaignInput(createBroadcastCampaignRequestSchema.parse(request));
    const campaign = await this.prisma.broadcastCampaign.create({
      data: {
        tenantId,
        name: normalized.name ?? "Untitled segment",
        description: normalized.description,
        status: normalized.status,
        channelPlatform: normalized.channelPlatform,
        channelAccountId: normalized.channelAccountId,
        segmentId: normalized.segmentId,
        contentJson: toInputJson(normalized.contentJson),
        scheduleAt: normalized.scheduleAt ? new Date(normalized.scheduleAt) : null,
        createdByUserId: actorUserId ?? null
      }
    });
    return mapCampaign(campaign);
  }

  async getCampaign(tenantId: string, campaignId: string) {
    return mapCampaign(await this.ensureCampaign(tenantId, campaignId));
  }

  async updateCampaign(tenantId: string, campaignId: string, request: UpdateBroadcastCampaignRequest) {
    const existing = mapCampaign(await this.ensureCampaign(tenantId, campaignId));
    const normalized = normalizeCampaignInput(updateBroadcastCampaignRequestSchema.parse({
      name: request.name ?? existing.name,
      description: request.description ?? existing.description,
      status: request.status ?? existing.status,
      channelPlatform: request.channelPlatform ?? existing.channelPlatform ?? existing.platformScope[0] ?? "webchat",
      channelAccountId: request.channelAccountId === undefined ? existing.channelAccountId ?? null : request.channelAccountId,
      segmentId: request.segmentId === undefined ? existing.segmentId : request.segmentId,
      contentJson: request.contentJson ?? readObject(existing.contentJson),
      message: request.message,
      templateId: request.templateId,
      scheduleAt: request.scheduleAt === undefined ? existing.scheduleAt ?? existing.scheduledAt ?? null : request.scheduleAt,
      scheduledAt: request.scheduledAt,
      scheduleType: request.scheduleType,
      platformScope: request.platformScope,
      roomIds: request.roomIds
    }));

    const campaign = await this.prisma.broadcastCampaign.update({
      where: { id: campaignId },
      data: {
        name: normalized.name,
        description: normalized.description,
        status: normalized.status,
        channelPlatform: normalized.channelPlatform,
        channelAccountId: normalized.channelAccountId,
        segmentId: normalized.segmentId,
        contentJson: toInputJson(normalized.contentJson),
        scheduleAt: normalized.scheduleAt ? new Date(normalized.scheduleAt) : null
      }
    });
    return mapCampaign(campaign);
  }

  async archiveCampaign(tenantId: string, campaignId: string) {
    await this.ensureCampaign(tenantId, campaignId);
    const campaign = await this.prisma.broadcastCampaign.update({
      where: { id: campaignId },
      data: { status: "archived" }
    });
    return mapCampaign(campaign);
  }

  async duplicateCampaign(tenantId: string, campaignId: string, actorUserId: string | undefined) {
    const source = await this.ensureCampaign(tenantId, campaignId);
    const campaign = await this.prisma.broadcastCampaign.create({
      data: {
        tenantId,
        name: `${source.name} Copy`,
        description: source.description,
        status: "draft",
        channelPlatform: source.channelPlatform,
        channelAccountId: source.channelAccountId,
        segmentId: source.segmentId,
        contentJson: toInputJson(source.contentJson),
        scheduleAt: null,
        createdByUserId: actorUserId ?? source.createdByUserId
      }
    });
    return mapCampaign(campaign);
  }

  async listSegments(tenantId: string) {
    const segments = await this.prisma.broadcastSegment.findMany({
      where: { tenantId },
      orderBy: { updatedAt: "desc" }
    });
    return segments.map(mapSegment);
  }

  async createSegment(tenantId: string, request: CreateBroadcastSegmentRequest) {
    const normalized = normalizeSegmentInput(createBroadcastSegmentRequestSchema.parse(request));
    const segment = await this.prisma.broadcastSegment.create({
      data: {
        tenantId,
        name: normalized.name ?? "Untitled segment",
        description: normalized.description ?? "",
        rulesJson: toInputJson(normalized.rulesJson ?? { rules: [] }),
        estimatedCount: normalized.estimatedCount ?? 0
      }
    });
    return mapSegment(segment);
  }

  async updateSegment(tenantId: string, segmentId: string, request: UpdateBroadcastSegmentRequest) {
    await this.ensureSegment(tenantId, segmentId);
    const normalized = normalizeSegmentInput(updateBroadcastSegmentRequestSchema.parse(request));
    const segment = await this.prisma.broadcastSegment.update({
      where: { id: segmentId },
      data: {
        name: normalized.name,
        description: normalized.description,
        rulesJson: normalized.rulesJson === undefined ? undefined : toInputJson(normalized.rulesJson),
        estimatedCount: normalized.estimatedCount
      }
    });
    return mapSegment(segment);
  }

  async deleteSegment(tenantId: string, segmentId: string) {
    await this.ensureSegment(tenantId, segmentId);
    await this.prisma.broadcastCampaign.updateMany({
      where: { tenantId, segmentId },
      data: { segmentId: null }
    });
    const segment = await this.prisma.broadcastSegment.delete({ where: { id: segmentId } });
    return mapSegment(segment);
  }

  async audiencePreview(tenantId: string, campaignId: string, request: BroadcastAudiencePreviewRequest = {}) {
    const campaign = await this.ensureCampaign(tenantId, campaignId);
    const candidates = await this.buildAudience(tenantId, campaign, request, { includeSkipped: false });
    return {
      campaignId,
      total: candidates.length,
      recipients: candidates
    };
  }

  async scheduleCampaign(tenantId: string, campaignId: string, request: ScheduleBroadcastCampaignRequest) {
    await this.ensureCampaign(tenantId, campaignId);
    const campaign = await this.prisma.broadcastCampaign.update({
      where: { id: campaignId },
      data: {
        status: "scheduled",
        scheduleAt: new Date(request.scheduleAt)
      }
    });
    return mapCampaign(campaign);
  }

  async sendTest(tenantId: string, campaignId: string, request: BroadcastSendTestRequest = {}) {
    const campaign = await this.ensureCampaign(tenantId, campaignId);
    const log = await this.prisma.broadcastSendLog.create({
      data: {
        tenantId,
        campaignId,
        contactId: request.contactId ?? null,
        contactIdentityId: request.contactIdentityId ?? null,
        platform: request.platform ?? campaign.channelPlatform,
        channelAccountId: campaign.channelAccountId,
        status: "sent_mock",
        reason: "safe test log only; no external outbound call was made",
        payloadJson: toInputJson({
          ...(readObject(request.payloadJson)),
          dryRun: true,
          safeMockOnly: true,
          externalCalls: 0
        })
      }
    });
    return buildSendResult(campaignId, [mapSendLog(log)]);
  }

  async sendNow(tenantId: string, campaignId: string, request: BroadcastAudiencePreviewRequest = {}) {
    const campaign = await this.ensureCampaign(tenantId, campaignId);
    const candidates = await this.buildAudience(tenantId, campaign, request, { includeSkipped: true, limit: 1000 });
    const logs: BroadcastSendLog[] = [];

    for (const candidate of candidates) {
      const status: BroadcastSendLogStatus = candidate.contactIdentityId ? "sent_mock" : "skipped_mock";
      const log = await this.prisma.broadcastSendLog.create({
        data: {
          tenantId,
          campaignId,
          contactId: candidate.contactId,
          contactIdentityId: candidate.contactIdentityId,
          platform: candidate.platform,
          channelAccountId: candidate.channelAccountId,
          status,
          reason: status === "sent_mock"
            ? "safe mock send only; no external outbound call was made"
            : candidate.reason ?? "no supported identity for campaign platform",
          payloadJson: toInputJson({
            message: candidate.renderedMessage,
            safeMockOnly: true,
            externalCalls: 0
          })
        }
      });
      logs.push(mapSendLog(log));
    }

    await this.prisma.broadcastCampaign.update({
      where: { id: campaignId },
      data: { status: "sent" }
    });

    return buildSendResult(campaignId, logs);
  }

  async listSendLogs(tenantId: string, campaignId: string) {
    await this.ensureCampaign(tenantId, campaignId);
    const logs = await this.prisma.broadcastSendLog.findMany({
      where: { tenantId, campaignId },
      orderBy: { createdAt: "desc" },
      take: 200
    });
    return logs.map(mapSendLog);
  }

  private async ensureCampaign(tenantId: string, campaignId: string) {
    const campaign = await this.prisma.broadcastCampaign.findFirst({
      where: { id: campaignId, tenantId }
    });
    if (!campaign) throw new NotFoundException("Broadcast campaign not found");
    return campaign as BroadcastCampaignRecord;
  }

  private async ensureSegment(tenantId: string, segmentId: string) {
    const segment = await this.prisma.broadcastSegment.findFirst({
      where: { id: segmentId, tenantId }
    });
    if (!segment) throw new NotFoundException("Broadcast segment not found");
    return segment as BroadcastSegmentRecord;
  }

  private async buildAudience(
    tenantId: string,
    campaign: BroadcastCampaignRecord,
    request: BroadcastAudiencePreviewRequest,
    options: { includeSkipped: boolean; limit?: number }
  ) {
    const limit = options.limit ?? request.limit ?? 100;
    const targetPlatform = request.platform && request.platform !== "all"
      ? request.platform
      : campaign.channelPlatform;
    const channelAccountId = request.channelAccountId === undefined ? campaign.channelAccountId : request.channelAccountId;
    const segment = campaign.segmentId ? await this.prisma.broadcastSegment.findFirst({ where: { id: campaign.segmentId, tenantId } }) as BroadcastSegmentRecord | null : null;
    const contacts = await this.prisma.contact.findMany({
      where: { tenantId },
      include: {
        identities: { include: { channelAccount: true } },
        tags: { include: { tag: true } },
        tasks: true,
        conversations: { orderBy: { lastMessageAt: "desc" }, take: 5 }
      },
      orderBy: { updatedAt: "desc" },
      take: 1000
    }) as ContactRecord[];

    const rules = segment ? rulesFromSegment(segment) : [];
    const content = readObject(campaign.contentJson);
    const message = String(content.message ?? content.body ?? "Safe broadcast mock message");
    const candidates: AudienceCandidate[] = [];

    for (const contact of contacts) {
      if (!matchesRules(contact, rules)) continue;
      const identities = contact.identities.filter((identity) =>
        identity.platform === targetPlatform &&
        (!channelAccountId || identity.channelAccountId === channelAccountId)
      );
      if (identities.length === 0) {
        if (options.includeSkipped) {
          candidates.push(candidateFromContact(contact, null, targetPlatform, channelAccountId, message, "no supported identity for campaign platform"));
        }
      } else {
        identities.forEach((identity) => {
          candidates.push(candidateFromContact(contact, identity, identity.platform, identity.channelAccountId, message, null));
        });
      }
      if (candidates.length >= limit) break;
    }

    return candidates.slice(0, limit);
  }
}

function normalizeCampaignInput(request: CreateBroadcastCampaignRequest | UpdateBroadcastCampaignRequest & { name?: string }) {
  const content = {
    ...readObject(request.contentJson),
    ...(request.message ? { message: request.message } : {}),
    ...(request.templateId ? { templateId: request.templateId } : {})
  };
  const scheduleAt = request.scheduleAt ?? request.scheduledAt ?? null;
  const channelPlatform = request.channelPlatform ?? request.platformScope?.[0] ?? "webchat";
  const channelAccountId = request.channelAccountId ?? request.roomIds?.[0] ?? null;
  return {
    name: (request.name ?? "Untitled broadcast").trim() || "Untitled broadcast",
    description: (request.description ?? "").trim(),
    status: broadcastCampaignStatusSchema.catch("draft").parse(request.status ?? (request.scheduleType === "scheduled" ? "scheduled" : "draft")),
    channelPlatform: platformSchema.catch("webchat").parse(channelPlatform),
    channelAccountId,
    segmentId: request.segmentId ?? null,
    contentJson: broadcastContentJsonSchema.parse({
      message: typeof content.message === "string" && content.message.trim() ? content.message : "Safe broadcast mock message",
      ...content,
      safeMockOnly: true
    }) as BroadcastContentJson,
    scheduleAt
  };
}

function normalizeSegmentInput(request: CreateBroadcastSegmentRequest | UpdateBroadcastSegmentRequest) {
  const rulesJson = request.rulesJson === undefined && request.rules
    ? { rules: request.rules }
    : request.rulesJson;
  return {
    name: request.name?.trim(),
    description: request.description?.trim(),
    rulesJson,
    estimatedCount: request.estimatedCount
  };
}

function mapCampaign(campaign: BroadcastCampaignRecord): BroadcastCampaign {
  const content = readObject(campaign.contentJson);
  const message = String(content.message ?? content.body ?? "Safe broadcast mock message");
  const templateId = typeof content.templateId === "string" && content.templateId ? content.templateId : undefined;
  const scheduleAt = campaign.scheduleAt?.toISOString() ?? null;
  return {
    id: campaign.id,
    tenantId: campaign.tenantId,
    name: campaign.name,
    description: campaign.description,
    status: broadcastCampaignStatusSchema.catch("draft").parse(campaign.status),
    channelPlatform: campaign.channelPlatform,
    channelAccountId: campaign.channelAccountId,
    platformScope: [campaign.channelPlatform],
    roomIds: campaign.channelAccountId ? [campaign.channelAccountId] : [],
    segmentId: campaign.segmentId,
    templateId,
    message,
    scheduleType: scheduleAt ? "scheduled" : "now",
    scheduledAt: scheduleAt ?? undefined,
    scheduleAt,
    createdBy: campaign.createdByUserId ?? "api",
    createdByUserId: campaign.createdByUserId,
    contentJson: campaign.contentJson,
    createdAt: campaign.createdAt.toISOString(),
    updatedAt: campaign.updatedAt.toISOString()
  };
}

function mapSegment(segment: BroadcastSegmentRecord): BroadcastSegment {
  return {
    id: segment.id,
    tenantId: segment.tenantId,
    name: segment.name,
    description: segment.description,
    rules: rulesFromSegment(segment),
    rulesJson: segment.rulesJson,
    estimatedCount: segment.estimatedCount,
    createdAt: segment.createdAt.toISOString(),
    updatedAt: segment.updatedAt.toISOString()
  };
}

function mapSendLog(log: BroadcastSendLogRecord): BroadcastSendLog {
  return {
    id: log.id,
    tenantId: log.tenantId,
    campaignId: log.campaignId,
    contactId: log.contactId,
    contactIdentityId: log.contactIdentityId,
    platform: platformSchema.catch("webchat").parse(log.platform),
    channelAccountId: log.channelAccountId,
    status: supportedMockStatuses.has(log.status as BroadcastSendLogStatus)
      ? broadcastSendLogStatusSchema.parse(log.status)
      : "skipped_mock",
    reason: log.reason,
    payloadJson: log.payloadJson,
    createdAt: log.createdAt.toISOString()
  };
}

function buildSendResult(campaignId: string, logs: BroadcastSendLog[]): BroadcastSendResult {
  return {
    campaignId,
    created: logs.length,
    sentMock: logs.filter((log) => log.status === "sent_mock").length,
    queuedMock: logs.filter((log) => log.status === "queued_mock").length,
    skippedMock: logs.filter((log) => log.status === "skipped_mock").length,
    failedMock: logs.filter((log) => log.status === "failed_mock").length,
    externalCalls: [],
    logs
  };
}

function rulesFromSegment(segment: BroadcastSegmentRecord) {
  const value = readObject(segment.rulesJson);
  const rawRules = Array.isArray(value.rules) ? value.rules : Array.isArray(segment.rulesJson) ? segment.rulesJson : [];
  return rawRules
    .map((rule) => broadcastSegmentRuleSchema.safeParse(rule))
    .filter((rule) => rule.success)
    .map((rule) => rule.data);
}

function matchesRules(contact: ContactRecord, rules: BroadcastSegmentRule[]) {
  return rules.every((rule) => compare(getRuleValue(contact, rule), rule.operator, rule.value));
}

function getRuleValue(contact: ContactRecord, rule: BroadcastSegmentRule): unknown {
  const latestConversation = contact.conversations?.[0];
  switch (rule.field) {
    case "platform":
      return contact.identities.map((identity) => identity.platform);
    case "roomId":
      return contact.identities.map((identity) => identity.channelAccountId);
    case "tag":
      return contact.tags.map((item) => item.tag.name);
    case "leadStatus":
      return contact.leadStatus;
    case "ownerAgent":
      return contact.ownerUserId;
    case "hasOpenTask":
      return Boolean(contact.tasks?.some((task) => task.status === "open"));
    case "priority":
      return latestConversation?.priority;
    case "slaStatus":
      return latestConversation?.slaStatus;
    case "aiStatus":
      return latestConversation?.aiState;
    case "status":
      return latestConversation?.status;
    case "lastSeenDays": {
      const lastSeen = contact.identities.reduce<Date | null>((latest, identity) => latest && latest > identity.updatedAt ? latest : identity.updatedAt, null);
      if (!lastSeen) return null;
      return Math.floor((Date.now() - lastSeen.getTime()) / 86_400_000);
    }
    case "contactField":
      return [contact.displayName, contact.email, contact.phone].filter(Boolean);
    default:
      return undefined;
  }
}

function compare(actual: unknown, operator: BroadcastSegmentRule["operator"], expected: unknown) {
  const actualValues = Array.isArray(actual) ? actual : [actual];
  const expectedValues = Array.isArray(expected) ? expected : [expected];
  const normalizedActual = actualValues.map(normalizeComparable);
  const normalizedExpected = expectedValues.map(normalizeComparable);
  if (operator === "exists") return actualValues.some((item) => item !== null && item !== undefined && String(item).length > 0);
  if (operator === "not_exists") return actualValues.every((item) => item === null || item === undefined || String(item).length === 0);
  if (operator === "equals") return normalizedActual.some((item) => normalizedExpected.includes(item));
  if (operator === "not_equals") return normalizedActual.every((item) => !normalizedExpected.includes(item));
  if (operator === "contains") return normalizedActual.some((item) => normalizedExpected.some((expectedItem) => item.includes(expectedItem)));
  if (operator === "not_contains") return normalizedActual.every((item) => normalizedExpected.every((expectedItem) => !item.includes(expectedItem)));
  if (operator === "in") return normalizedActual.some((item) => normalizedExpected.includes(item));
  if (operator === "not_in") return normalizedActual.every((item) => !normalizedExpected.includes(item));
  if (operator === "greater_than") return Number(actualValues[0] ?? 0) > Number(expected);
  if (operator === "less_than") return Number(actualValues[0] ?? 0) < Number(expected);
  return false;
}

function normalizeComparable(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function candidateFromContact(
  contact: ContactRecord,
  identity: ContactRecord["identities"][number] | null,
  platform: Platform,
  channelAccountId: string | null,
  message: string,
  reason: string | null
): AudienceCandidate {
  return {
    contactId: contact.id,
    contactIdentityId: identity?.id ?? null,
    displayName: identity?.displayName ?? contact.displayName,
    platform,
    channelAccountId,
    externalUserId: identity?.externalUserId ?? null,
    tags: contact.tags.map((item) => item.tag.name),
    leadStatus: contact.leadStatus,
    reason,
    renderedMessage: renderMessage(message, contact, identity, platform)
  };
}

function renderMessage(message: string, contact: ContactRecord, identity: ContactRecord["identities"][number] | null, platform: Platform) {
  const firstName = contact.displayName.split(/\s+/)[0] ?? contact.displayName;
  return message
    .replaceAll("{{contact.name}}", contact.displayName)
    .replaceAll("{{contact.firstName}}", firstName)
    .replaceAll("{{leadStatus}}", contact.leadStatus)
    .replaceAll("{{ownerAgent}}", contact.ownerUserId ?? "-")
    .replaceAll("{{platform}}", platform)
    .replaceAll("{{roomName}}", identity?.channelAccount?.displayName ?? "-");
}

function readObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function toInputJson(value: unknown) {
  if (value === null) return Prisma.JsonNull;
  if (value === undefined) return Prisma.JsonNull;
  return value as Prisma.InputJsonValue;
}
