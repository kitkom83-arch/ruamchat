import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import {
  broadcastCampaignStatusSchema,
  broadcastComplianceFiltersSchema,
  broadcastContentJsonSchema,
  broadcastSendLogFiltersSchema,
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
  type BroadcastCampaignDeliverySummary,
  type BroadcastCampaignDetail,
  type BroadcastComplianceFilters,
  type BroadcastComplianceLog,
  type BroadcastContentJson,
  type BroadcastSegment,
  type BroadcastSegmentRule,
  type BroadcastSendLogFilters,
  type BroadcastSendLogPage,
  type BroadcastSendLog,
  type BroadcastSendLogStatus,
  type BroadcastSendResult,
  type BroadcastSendTestRequest,
  type BroadcastSuppressedRecipient,
  type BroadcastSuppressionReason,
  type CreateBroadcastCampaignRequest,
  type CreateBroadcastSegmentRequest,
  type Platform,
  type ScheduleBroadcastCampaignRequest,
  type UpdateBroadcastCampaignRequest,
  type UpdateBroadcastSegmentRequest
} from "@ai-omni/shared";
import { Prisma } from "@prisma/client";
import { OutboundConsentService, type OutboundConsentContext } from "./outbound-consent.service.js";
import { PrismaService } from "./prisma.service.js";

const safeSuppressionReasons = new Set(["do_not_contact", "marketing_opt_out", "consent_missing", "consent_revoked", "unknown_unsafe"]);

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

type SendLogConversationContextRecord = {
  id: string;
  contactId: string;
  contactIdentityId: string;
  roomId: string;
  lastMessageAt?: Date;
  room: {
    id?: string;
    platform: Platform;
    channelAccountId: string;
  };
};

type SendLogRoomRecord = {
  id: string;
  platform: Platform;
  channelAccountId: string;
};

type SendLogContext = {
  customerId: string | null;
  conversationId: string | null;
  roomId: string | null;
};

type BroadcastComplianceAuditRecord = {
  id: string;
  tenantId: string;
  conversationId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata?: Prisma.JsonValue | null;
  metadataJson?: Prisma.JsonValue | null;
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
    id: string;
    roomId: string;
    priority: string;
    status: string;
    slaStatus: string;
    aiState: string;
    lastMessageAt: Date;
    room: {
      platform: Platform;
      channelAccountId: string;
    };
  }>;
};

type AudienceCandidate = BroadcastAudiencePreviewRecipient & {
  contactId: string;
  contactIdentityId: string | null;
};

type AudienceScreeningResult = {
  candidates: AudienceCandidate[];
  eligible: AudienceCandidate[];
  suppressed: BroadcastSuppressedRecipient[];
  suppressedByReason: Record<BroadcastSuppressionReason, number>;
};

@Injectable()
export class BroadcastService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(OutboundConsentService) private readonly outboundConsent: OutboundConsentService
  ) {}

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

  async getCampaign(tenantId: string, campaignId: string): Promise<BroadcastCampaignDetail> {
    const campaign = await this.ensureCampaign(tenantId, campaignId);
    return this.buildCampaignDetail(tenantId, campaign);
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
    const screened = await this.screenAudience(tenantId, campaignId, candidates, "preview");
    return {
      campaignId,
      total: screened.eligible.length,
      candidateCount: screened.candidates.length,
      eligibleCount: screened.eligible.length,
      suppressedCount: screened.suppressed.length,
      suppressedByReason: screened.suppressedByReason,
      externalCalls: 0,
      recipients: screened.eligible,
      suppressedRecipients: screened.suppressed
    };
  }

  async dryRun(tenantId: string, campaignId: string, request: BroadcastAudiencePreviewRequest = {}) {
    const campaign = await this.ensureCampaign(tenantId, campaignId);
    const candidates = await this.buildAudience(tenantId, campaign, request, { includeSkipped: false });
    const screened = await this.screenAudience(tenantId, campaignId, candidates, "dry_run");
    return {
      campaignId,
      total: screened.eligible.length,
      candidateCount: screened.candidates.length,
      eligibleCount: screened.eligible.length,
      suppressedCount: screened.suppressed.length,
      suppressedByReason: screened.suppressedByReason,
      externalCalls: 0,
      recipients: screened.eligible,
      suppressedRecipients: screened.suppressed
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
    if (request.contactId) {
      const context = await this.outboundConsent.getContext({
        tenantId,
        contactId: request.contactId,
        contactIdentityId: request.contactIdentityId,
        platform: request.platform ?? campaign.channelPlatform,
        channelAccountId: campaign.channelAccountId
      });
      const decision = this.outboundConsent.decide(context.consent, "marketing");
      if (decision.blocked && decision.reason) {
        await this.outboundConsent.recordBlocked({
          action: "broadcast.outbound_blocked",
          intent: "marketing",
          entityType: "broadcast_campaign",
          entityId: campaignId,
          context,
          reason: decision.reason,
          metadata: {
            campaignId,
            sendType: "test"
          }
        });
        const blockedLog = await this.prisma.broadcastSendLog.create({
          data: {
            tenantId,
            campaignId,
            contactId: request.contactId,
            contactIdentityId: request.contactIdentityId ?? null,
            platform: context.platform,
            channelAccountId: context.channelAccountId,
            status: "skipped_mock",
            reason: decision.reason,
            payloadJson: toInputJson({
              dryRun: true,
              suppressed: true,
              blockedReason: decision.reason,
              safeMockOnly: true,
              externalCalls: 0
            })
          }
        });
        return buildSendResult(campaignId, [mapSendLog(blockedLog)]);
      }
    }
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
    const screened = await this.screenAudience(tenantId, campaignId, candidates, "send_now");
    const logs: BroadcastSendLog[] = [];

    for (const candidate of screened.eligible) {
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
            suppressed: false,
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

    return buildSendResult(campaignId, logs, screened);
  }

  async listSendLogs(tenantId: string, campaignId: string) {
    const page = await this.listSendLogPage(tenantId, { campaignId, limit: 200, offset: 0 });
    return page.items;
  }

  async listSendLogPage(tenantId: string, filters: BroadcastSendLogFilters = {}): Promise<BroadcastSendLogPage> {
    const parsed = broadcastSendLogFiltersSchema.parse(filters);
    await this.validateSendLogFilterOwnership(tenantId, parsed);
    const logs = await this.prisma.broadcastSendLog.findMany({
      where: buildSendLogWhere(tenantId, parsed),
      orderBy: { createdAt: "desc" },
      take: 1000
    });
    const rows = await this.mapSendLogsWithContext(tenantId, logs as BroadcastSendLogRecord[]);
    const filtered = rows.filter((log) => matchesSendLogFilters(log, parsed));
    const items = filtered.slice(parsed.offset, parsed.offset + parsed.limit);
    const nextOffset = parsed.offset + items.length < filtered.length ? parsed.offset + items.length : null;
    return {
      items,
      limit: parsed.limit,
      offset: parsed.offset,
      total: filtered.length,
      nextOffset,
      externalCalls: 0
    };
  }

  async listComplianceLogs(tenantId: string, campaignId: string) {
    const page = await this.listComplianceHistory(tenantId, { campaignId, limit: 200, offset: 0 });
    return page.items;
  }

  async listComplianceHistory(tenantId: string, filters: BroadcastComplianceFilters = {}) {
    const parsed = broadcastComplianceFiltersSchema.parse(filters);
    await this.validateComplianceFilterOwnership(tenantId, parsed);
    const logs = await this.prisma.auditLog.findMany({
      where: buildComplianceAuditWhere(tenantId, parsed),
      orderBy: { createdAt: "desc" },
      take: 1000
    });
    const filtered = logs
      .map((log) => mapComplianceLog(log, parsed.campaignId ?? null))
      .filter((log): log is BroadcastComplianceLog => Boolean(log))
      .filter((log) => matchesComplianceFilters(log, parsed));
    const items = filtered.slice(parsed.offset, parsed.offset + parsed.limit);
    const nextOffset = parsed.offset + items.length < filtered.length ? parsed.offset + items.length : null;
    return {
      items,
      limit: parsed.limit,
      offset: parsed.offset,
      total: filtered.length,
      nextOffset,
      externalCalls: 0
    };
  }

  private async validateComplianceFilterOwnership(tenantId: string, filters: ReturnType<typeof broadcastComplianceFiltersSchema.parse>) {
    if (filters.campaignId) await this.ensureCampaign(tenantId, filters.campaignId);
    if (filters.conversationId) {
      const conversation = await this.prisma.conversation.findFirst({ where: { tenantId, id: filters.conversationId } });
      if (!conversation) throw new NotFoundException("Conversation not found");
    }
    const contactId = filters.contactId ?? filters.customerId;
    if (contactId) {
      const contact = await this.prisma.contact.findFirst({ where: { tenantId, id: contactId } });
      if (!contact) throw new NotFoundException("Contact not found");
    }
  }

  private async validateSendLogFilterOwnership(tenantId: string, filters: ReturnType<typeof broadcastSendLogFiltersSchema.parse>) {
    if (filters.campaignId) await this.ensureCampaign(tenantId, filters.campaignId);
    if (filters.conversationId) {
      const conversation = await this.prisma.conversation.findFirst({ where: { tenantId, id: filters.conversationId } });
      if (!conversation) throw new NotFoundException("Conversation not found");
    }
    if (filters.roomId) {
      const room = await this.prisma.room.findFirst({ where: { tenantId, id: filters.roomId } });
      if (!room) throw new NotFoundException("Room not found");
    }
    const contactId = filters.contactId ?? filters.customerId;
    if (contactId) {
      const contact = await this.prisma.contact.findFirst({ where: { tenantId, id: contactId } });
      if (!contact) throw new NotFoundException("Contact not found");
    }
  }

  private async buildCampaignDetail(tenantId: string, campaign: BroadcastCampaignRecord): Promise<BroadcastCampaignDetail> {
    const segment = campaign.segmentId
      ? await this.prisma.broadcastSegment.findFirst({ where: { id: campaign.segmentId, tenantId } }) as BroadcastSegmentRecord | null
      : null;
    const sendLogs = await this.listSendLogPage(tenantId, { campaignId: campaign.id, limit: 200, offset: 0 });
    const compliance = await this.listComplianceHistory(tenantId, { campaignId: campaign.id, limit: 200, offset: 0 });
    return {
      campaignId: campaign.id,
      name: campaign.name,
      title: campaign.name,
      status: broadcastCampaignStatusSchema.catch("draft").parse(campaign.status),
      createdAt: campaign.createdAt.toISOString(),
      updatedAt: campaign.updatedAt.toISOString(),
      audienceCount: segment?.estimatedCount ?? null,
      suppressionCount: compliance.total,
      deliverySummary: summarizeSendLogs(sendLogs.items),
      externalCalls: 0
    };
  }

  private async mapSendLogsWithContext(tenantId: string, logs: BroadcastSendLogRecord[]) {
    const contactIds = uniqueStrings(logs.map((log) => log.contactId));
    const identityIds = uniqueStrings(logs.map((log) => log.contactIdentityId));
    const conversations = contactIds.length > 0 || identityIds.length > 0
      ? await this.prisma.conversation.findMany({
          where: {
            tenantId,
            OR: [
              ...(contactIds.length > 0 ? [{ contactId: { in: contactIds } }] : []),
              ...(identityIds.length > 0 ? [{ contactIdentityId: { in: identityIds } }] : [])
            ]
          },
          include: { room: true },
          orderBy: { lastMessageAt: "desc" }
        }) as SendLogConversationContextRecord[]
      : [];
    const roomKeys = uniqueRoomKeys(logs);
    const rooms = roomKeys.length > 0
      ? await this.prisma.room.findMany({
          where: {
            tenantId,
            OR: roomKeys.map((key) => ({ platform: key.platform, channelAccountId: key.channelAccountId }))
          },
          select: { id: true, platform: true, channelAccountId: true }
        }) as SendLogRoomRecord[]
      : [];
    const roomByKey = new Map(rooms.map((room) => [roomKey(room.platform, room.channelAccountId), room.id]));
    return logs.map((log) => mapSendLog(log, findSendLogContext(log, conversations, roomByKey)));
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
        conversations: { include: { room: true }, orderBy: { lastMessageAt: "desc" }, take: 12 }
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

  private async screenAudience(
    tenantId: string,
    campaignId: string,
    candidates: AudienceCandidate[],
    sendType: "preview" | "dry_run" | "send_now"
  ): Promise<AudienceScreeningResult> {
    const eligible: AudienceCandidate[] = [];
    const suppressed: BroadcastSuppressedRecipient[] = [];
    const suppressedByReason = emptySuppressedByReason();

    for (const candidate of candidates) {
      const context = await this.outboundConsent.getContext({
        tenantId,
        contactId: candidate.contactId,
        contactIdentityId: candidate.contactIdentityId,
        platform: candidate.platform,
        channelAccountId: candidate.channelAccountId,
        conversationId: candidate.conversationId
      });
      const decision = this.outboundConsent.decide(context.consent, "marketing");
      const withContext = applyContextToCandidate(candidate, context);
      if (!decision.blocked || !decision.reason) {
        eligible.push(withContext);
        continue;
      }

      const reason = safeSuppressionReason(decision.reason);
      const suppressedRecipient = suppressedRecipientFromContext(context, reason, candidate.displayName);
      suppressed.push(suppressedRecipient);
      suppressedByReason[reason] += 1;
      await this.outboundConsent.recordBlocked({
        action: "broadcast.recipient_suppressed",
        intent: "marketing",
        entityType: "broadcast_campaign",
        entityId: campaignId,
        context,
        reason,
        metadata: {
          campaignId,
          sendType,
          contactIdentityId: candidate.contactIdentityId,
          suppressed: true
        }
      });
    }

    return { candidates, eligible, suppressed, suppressedByReason };
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

function mapSendLog(log: BroadcastSendLogRecord, context: SendLogContext = { customerId: log.contactId, conversationId: null, roomId: null }): BroadcastSendLog {
  const timestamp = log.createdAt.toISOString();
  return {
    id: log.id,
    tenantId: log.tenantId,
    campaignId: log.campaignId,
    customerId: context.customerId,
    contactId: log.contactId,
    contactIdentityId: log.contactIdentityId,
    conversationId: context.conversationId,
    platform: platformSchema.catch("webchat").parse(log.platform),
    channelAccountId: log.channelAccountId,
    roomId: context.roomId,
    status: normalizeSendLogStatus(log.status, log.reason, log.payloadJson),
    reason: log.reason,
    externalCalls: 0,
    timestamp,
    createdAt: timestamp
  };
}

function buildSendResult(campaignId: string, logs: BroadcastSendLog[], screening?: AudienceScreeningResult): BroadcastSendResult {
  return {
    campaignId,
    created: logs.length,
    sentMock: logs.filter((log) => log.status === "sent_mock" || log.status === "mock_sent").length,
    queuedMock: logs.filter((log) => log.status === "queued_mock").length,
    skippedMock: logs.filter((log) => log.status === "skipped_mock").length,
    failedMock: logs.filter((log) => log.status === "failed_mock" || log.status === "failed_safe").length,
    candidateCount: screening?.candidates.length,
    eligibleCount: screening?.eligible.length,
    suppressedCount: screening?.suppressed.length,
    suppressedByReason: screening?.suppressedByReason,
    suppressedRecipients: screening?.suppressed,
    externalCalls: [],
    logs
  };
}

function summarizeSendLogs(logs: BroadcastSendLog[]): BroadcastCampaignDeliverySummary {
  return {
    total: logs.length,
    previewed: logs.filter((log) => log.status === "previewed").length,
    dryRun: logs.filter((log) => log.status === "dry_run").length,
    suppressed: logs.filter((log) => log.status === "suppressed").length,
    blocked: logs.filter((log) => log.status === "blocked").length,
    queuedMock: logs.filter((log) => log.status === "queued_mock").length,
    mockSent: logs.filter((log) => log.status === "mock_sent").length,
    sentMock: logs.filter((log) => log.status === "sent_mock").length,
    skippedMock: logs.filter((log) => log.status === "skipped_mock").length,
    failedMock: logs.filter((log) => log.status === "failed_mock").length,
    failedSafe: logs.filter((log) => log.status === "failed_safe").length,
    unknownSafe: logs.filter((log) => log.status === "unknown_safe").length,
    externalCalls: 0
  };
}

function buildSendLogWhere(
  tenantId: string,
  filters: ReturnType<typeof broadcastSendLogFiltersSchema.parse>
): Prisma.BroadcastSendLogWhereInput {
  const dbStatuses = filters.status ? dbStatusesForSafeFilter(filters.status) : null;
  return {
    tenantId,
    ...(filters.campaignId ? { campaignId: filters.campaignId } : {}),
    ...(dbStatuses && dbStatuses.length > 0 ? { status: { in: dbStatuses } } : {}),
    ...(filters.platform ? { platform: filters.platform } : {}),
    ...(filters.channelAccountId ? { channelAccountId: filters.channelAccountId } : {}),
    ...(filters.contactId || filters.customerId ? { contactId: filters.contactId ?? filters.customerId } : {}),
    ...(filters.from || filters.to
      ? {
          createdAt: {
            ...(filters.from ? { gte: new Date(filters.from) } : {}),
            ...(filters.to ? { lte: new Date(filters.to) } : {})
          }
        }
      : {})
  };
}

function matchesSendLogFilters(log: BroadcastSendLog, filters: ReturnType<typeof broadcastSendLogFiltersSchema.parse>) {
  if (filters.campaignId && log.campaignId !== filters.campaignId) return false;
  if (filters.status && !safeStatusMatchesFilter(log.status, filters.status)) return false;
  if (filters.platform && log.platform !== filters.platform) return false;
  if (filters.channelAccountId && log.channelAccountId !== filters.channelAccountId) return false;
  if (filters.roomId && log.roomId !== filters.roomId) return false;
  if (filters.conversationId && log.conversationId !== filters.conversationId) return false;
  if (filters.customerId && log.customerId !== filters.customerId) return false;
  if (filters.contactId && log.contactId !== filters.contactId) return false;
  return true;
}

function dbStatusesForSafeFilter(status: BroadcastSendLogStatus) {
  if (status === "mock_sent") return ["sent_mock", "mock_sent"];
  if (status === "sent_mock") return ["sent_mock", "mock_sent"];
  if (status === "failed_safe") return ["failed_mock", "failed_safe"];
  if (status === "failed_mock") return ["failed_mock", "failed_safe"];
  if (status === "blocked" || status === "suppressed") return ["skipped_mock", "blocked", "suppressed"];
  if (status === "unknown_safe") return null;
  return [status];
}

function safeStatusMatchesFilter(actual: BroadcastSendLogStatus, expected: BroadcastSendLogStatus) {
  if ((expected === "mock_sent" || expected === "sent_mock") && (actual === "mock_sent" || actual === "sent_mock")) return true;
  if ((expected === "failed_safe" || expected === "failed_mock") && (actual === "failed_safe" || actual === "failed_mock")) return true;
  return actual === expected;
}

function normalizeSendLogStatus(status: string, reason: string | null, payloadJson: Prisma.JsonValue | null): BroadcastSendLogStatus {
  const raw = status.trim().toLowerCase();
  if (raw === "previewed" || raw === "dry_run" || raw === "suppressed" || raw === "blocked" || raw === "queued_mock" || raw === "mock_sent" || raw === "sent_mock" || raw === "failed_mock" || raw === "failed_safe") {
    return broadcastSendLogStatusSchema.parse(raw);
  }
  if (raw === "skipped" || raw === "skipped_mock") {
    return isSuppressionOrBlockedLog(reason, payloadJson) ? "blocked" : "skipped_mock";
  }
  return "unknown_safe";
}

function isSuppressionOrBlockedLog(reason: string | null, payloadJson: Prisma.JsonValue | null) {
  const payload = readObject(payloadJson);
  const payloadReason = stringOrNull(payload.blockedReason) ?? stringOrNull(payload.reason);
  return Boolean(
    safeSuppressionReasons.has(String(reason ?? "")) ||
    safeSuppressionReasons.has(String(payloadReason ?? "")) ||
    payload.suppressed === true
  );
}

function findSendLogContext(
  log: BroadcastSendLogRecord,
  conversations: SendLogConversationContextRecord[],
  roomByKey: Map<string, string>
): SendLogContext {
  const conversation = conversations.find((item) =>
    (log.contactIdentityId ? item.contactIdentityId === log.contactIdentityId : item.contactId === log.contactId) &&
    item.room.platform === log.platform &&
    (!log.channelAccountId || item.room.channelAccountId === log.channelAccountId)
  );
  const roomId = conversation?.roomId ?? (log.channelAccountId ? roomByKey.get(roomKey(log.platform, log.channelAccountId)) ?? null : null);
  return {
    customerId: log.contactId,
    conversationId: conversation?.id ?? null,
    roomId
  };
}

function uniqueStrings(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value?.trim()))));
}

function uniqueRoomKeys(logs: BroadcastSendLogRecord[]) {
  const byKey = new Map<string, { platform: Platform; channelAccountId: string }>();
  logs.forEach((log) => {
    if (!log.channelAccountId) return;
    byKey.set(roomKey(log.platform, log.channelAccountId), { platform: log.platform, channelAccountId: log.channelAccountId });
  });
  return Array.from(byKey.values());
}

function roomKey(platform: Platform, channelAccountId: string) {
  return `${platform}:${channelAccountId}`;
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
    tenantId: contact.tenantId,
    customerId: contact.id,
    contactId: contact.id,
    contactIdentityId: identity?.id ?? null,
    conversationId: findCandidateConversation(contact, platform, channelAccountId)?.id ?? null,
    displayName: identity?.displayName ?? contact.displayName,
    platform,
    channelAccountId,
    roomId: findCandidateConversation(contact, platform, channelAccountId)?.roomId ?? null,
    externalUserId: identity?.externalUserId ?? null,
    tags: contact.tags.map((item) => item.tag.name),
    leadStatus: contact.leadStatus,
    reason,
    renderedMessage: renderMessage(message, contact, identity, platform),
    externalCalls: 0
  };
}

function findCandidateConversation(contact: ContactRecord, platform: Platform, channelAccountId: string | null) {
  return contact.conversations?.find((conversation) =>
    conversation.room.platform === platform &&
    (!channelAccountId || conversation.room.channelAccountId === channelAccountId)
  ) ?? null;
}

function applyContextToCandidate(candidate: AudienceCandidate, context: OutboundConsentContext): AudienceCandidate {
  return {
    ...candidate,
    tenantId: context.tenantId,
    customerId: context.customerId,
    conversationId: context.conversationId,
    platform: context.platform,
    channelAccountId: context.channelAccountId,
    roomId: context.roomId,
    externalCalls: 0
  };
}

function suppressedRecipientFromContext(context: OutboundConsentContext, reason: BroadcastSuppressionReason, displayName?: string): BroadcastSuppressedRecipient {
  return {
    tenantId: context.tenantId,
    customerId: context.customerId,
    contactId: context.contactId,
    displayName: displayName?.trim() || undefined,
    conversationId: context.conversationId,
    platform: context.platform,
    channelAccountId: context.channelAccountId,
    roomId: context.roomId,
    reason,
    externalCalls: 0
  };
}

function emptySuppressedByReason(): Record<BroadcastSuppressionReason, number> {
  return {
    do_not_contact: 0,
    marketing_opt_out: 0,
    consent_missing: 0,
    consent_revoked: 0,
    unknown_unsafe: 0
  };
}

function safeSuppressionReason(reason: string): BroadcastSuppressionReason {
  if (
    reason === "do_not_contact" ||
    reason === "marketing_opt_out" ||
    reason === "consent_missing" ||
    reason === "consent_revoked" ||
    reason === "unknown_unsafe"
  ) {
    return reason;
  }
  return "unknown_unsafe";
}

function buildComplianceAuditWhere(
  tenantId: string,
  filters: ReturnType<typeof broadcastComplianceFiltersSchema.parse>
): Prisma.AuditLogWhereInput {
  return {
    tenantId,
    entityType: "broadcast_campaign",
    ...(filters.campaignId ? { entityId: filters.campaignId } : {}),
    ...(filters.conversationId ? { conversationId: filters.conversationId } : {}),
    action: { in: ["broadcast.recipient_suppressed", "broadcast.outbound_blocked"] },
    ...(filters.from || filters.to
      ? {
          createdAt: {
            ...(filters.from ? { gte: new Date(filters.from) } : {}),
            ...(filters.to ? { lte: new Date(filters.to) } : {})
          }
        }
      : {})
  };
}

function matchesComplianceFilters(log: BroadcastComplianceLog, filters: ReturnType<typeof broadcastComplianceFiltersSchema.parse>) {
  if (filters.campaignId && log.campaignId !== filters.campaignId) return false;
  if (filters.reason && log.reason !== filters.reason) return false;
  if (filters.platform && log.platform !== filters.platform) return false;
  if (filters.channelAccountId && log.channelAccountId !== filters.channelAccountId) return false;
  if (filters.roomId && log.roomId !== filters.roomId) return false;
  if (filters.conversationId && log.conversationId !== filters.conversationId) return false;
  if (filters.customerId && log.customerId !== filters.customerId) return false;
  if (filters.contactId && log.contactId !== filters.contactId) return false;
  return true;
}

function mapComplianceLog(log: BroadcastComplianceAuditRecord, campaignId: string | null): BroadcastComplianceLog | null {
  const metadata = readObject(log.metadataJson ?? log.metadata);
  const parsedPlatform = platformSchema.safeParse(metadata.platform);
  if (!parsedPlatform.success) return null;
  return {
    id: log.id,
    tenantId: log.tenantId,
    campaignId: stringOrNull(metadata.campaignId) ?? log.entityId ?? campaignId,
    customerId: stringOrNull(metadata.customerId),
    contactId: stringOrNull(metadata.contactId),
    conversationId: stringOrNull(metadata.conversationId) ?? log.conversationId,
    platform: parsedPlatform.data,
    channelAccountId: stringOrNull(metadata.channelAccountId),
    roomId: stringOrNull(metadata.roomId),
    reason: safeSuppressionReason(stringOrNull(metadata.blockedReason) ?? stringOrNull(metadata.reason) ?? "unknown_unsafe"),
    action: log.action,
    createdAt: log.createdAt.toISOString(),
    externalCalls: 0
  };
}

function stringOrNull(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
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
