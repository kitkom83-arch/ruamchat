import crypto from "node:crypto";
import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import {
  providerWebhookUnmatchedInboundBulkReviewRequestSchema,
  providerWebhookUnmatchedInboundLinkRequestSchema,
  providerWebhookUnmatchedInboundReviewRequestSchema,
  providerWebhookSandboxEventRequestSchema,
  type ProviderWebhookUnmatchedInboundBulkReviewItemResult,
  type ProviderWebhookUnmatchedInboundExport,
  type ProviderWebhookUnmatchedInboundExportQuery,
  type ProviderWebhookUnmatchedInboundExportRow,
  type ProviderWebhookUnmatchedInboundReviewRequest,
  type ProviderWebhookUnmatchedInboundFilters,
  type ProviderWebhookUnmatchedInboundHistory,
  type ProviderWebhookUnmatchedInboundHistoryAction,
  type ProviderWebhookUnmatchedInboundHistoryEntry,
  type ProviderSandboxProvider,
  type ProviderWebhookEvent,
  type ProviderWebhookMessageType,
  type ProviderWebhookNormalizedEventType,
  type ProviderWebhookSandboxEventRequest,
  type ProviderWebhookUnmatchedInboundItem,
  type ProviderWebhookUnmatchedInboundStatus,
  type ProviderWebhookUnmatchedInboundStatusFilter
} from "@ai-omni/shared";
import { MessageType as PrismaMessageType } from "@prisma/client";
import { AuditService } from "./audit.service.js";
import { ConversationService } from "./conversation.service.js";

const maxStoredEvents = 100;
const unmatchedInboundExportMaxLimit = 500;
const events: ProviderWebhookEvent[] = [];
const unmatchedInboundItems: ProviderWebhookUnmatchedInboundItem[] = [];
const unmatchedInboundHistoryEntries: ProviderWebhookUnmatchedInboundHistoryEntry[] = [];
const dedupFirstSeenAtByDigest = new Map<string, string>();

@Injectable()
export class ProviderWebhookEventsService {
  constructor(
    @Inject(AuditService) private readonly audit: AuditService,
    @Inject(ConversationService) private readonly conversations: ConversationService
  ) {}

  list(tenantId: string) {
    return events.filter((event) => event.tenantId === tenantId);
  }

  listUnmatchedInbound(tenantId: string, filters: ProviderWebhookUnmatchedInboundFilters | ProviderWebhookUnmatchedInboundStatusFilter = {}) {
    const normalizedFilters = normalizeUnmatchedInboundFilters(filters);
    const filtered = filterUnmatchedInboundItems(tenantId, normalizedFilters);
    return normalizedFilters.limit ? filtered.slice(0, normalizedFilters.limit) : filtered;
  }

  listUnmatchedInboundPage(tenantId: string, filters: ProviderWebhookUnmatchedInboundFilters | ProviderWebhookUnmatchedInboundStatusFilter = {}) {
    const normalizedFilters = normalizeUnmatchedInboundFilters(filters);
    const limit = normalizedFilters.limit ?? 10;
    const offset = normalizedFilters.offset ?? 0;
    const appliedSort = {
      sortBy: normalizedFilters.sortBy ?? "receivedAt" as const,
      sortOrder: normalizedFilters.sortOrder ?? "desc" as const
    };
    const filtered = filterUnmatchedInboundItems(tenantId, normalizedFilters);
    const sorted = [...filtered].sort((left, right) => {
      const compared = left.receivedAt.localeCompare(right.receivedAt);
      return appliedSort.sortOrder === "asc" ? compared : -compared;
    });
    const items = sorted.slice(offset, offset + limit);
    return {
      items,
      pagination: {
        totalCount: filtered.length,
        limit,
        offset,
        returnedCount: items.length,
        hasNextPage: offset + limit < filtered.length,
        hasPreviousPage: offset > 0
      },
      appliedFilters: cleanUnmatchedInboundFilters({
        ...normalizedFilters,
        limit,
        offset,
        sortBy: appliedSort.sortBy,
        sortOrder: appliedSort.sortOrder
      }),
      appliedSort,
      summary: summarizeUnmatchedInboundItems(filtered),
      externalCalls: 0 as const
    };
  }

  async listUnmatchedInboundCandidates(tenantId: string, id: string) {
    const item = findUnmatchedInboundItem(tenantId, id);
    if (!item) throw new NotFoundException("Unmatched inbound item not found");
    if (!isSafeLinkableUnmatchedItem(item) || !item.channelAccountId || !item.roomKeyDigest) {
      return [];
    }
    return this.conversations.findSafeProviderWebhookCandidateConversations({
      tenantId,
      platform: item.provider,
      channelAccountId: item.channelAccountId,
      roomKeyDigest: item.roomKeyDigest,
      limit: 5
    });
  }

  listUnmatchedInboundHistory(tenantId: string, id: string): ProviderWebhookUnmatchedInboundHistory {
    const item = findUnmatchedInboundItem(tenantId, id);
    if (!item) throw new NotFoundException("Unmatched inbound item not found");
    const entries = buildHistoryEntriesForItem(item);
    return {
      unmatchedInboundId: item.id,
      provider: item.provider,
      channelAccountId: item.channelAccountId,
      safeRoomLabel: safeRoomLabel(item),
      roomKeyDigest: item.roomKeyDigest,
      entries,
      externalCalls: 0 as const
    };
  }

  exportUnmatchedInboundQueue(tenantId: string, query: ProviderWebhookUnmatchedInboundExportQuery = {}): ProviderWebhookUnmatchedInboundExport {
    const normalizedFilters = normalizeUnmatchedInboundExportFilters(query);
    const requestedLimit = normalizedFilters.limit ?? unmatchedInboundExportMaxLimit;
    const limit = Math.min(requestedLimit, unmatchedInboundExportMaxLimit);
    const offset = normalizedFilters.offset ?? 0;
    const appliedSort = {
      sortBy: normalizedFilters.sortBy ?? "receivedAt" as const,
      sortOrder: normalizedFilters.sortOrder ?? "desc" as const
    };
    const filtered = filterUnmatchedInboundItems(tenantId, normalizedFilters);
    const sorted = [...filtered].sort((left, right) => {
      const compared = left.receivedAt.localeCompare(right.receivedAt);
      return appliedSort.sortOrder === "asc" ? compared : -compared;
    });
    const rows = sorted.slice(offset, offset + limit).map(exportRowFromItem);
    const format = normalizedFilters.format ?? "json";
    const appliedFilters = cleanUnmatchedInboundFilters({
      ...normalizedFilters,
      limit,
      offset,
      sortBy: appliedSort.sortBy,
      sortOrder: appliedSort.sortOrder
    }) as ProviderWebhookUnmatchedInboundExportQuery;
    if (format) appliedFilters.format = format;
    return {
      format,
      rows,
      csv: format === "csv" ? rowsToCsv(rows) : null,
      appliedFilters,
      appliedSort,
      requestedLimit,
      exportMaxLimit: unmatchedInboundExportMaxLimit,
      exportedCount: rows.length,
      externalCalls: 0 as const
    };
  }

  async reviewUnmatchedInbound(tenantId: string, id: string, body: unknown, actorUserId?: string) {
    const parsed = providerWebhookUnmatchedInboundReviewRequestSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException("Invalid unmatched inbound review request");

    const item = findUnmatchedInboundItem(tenantId, id);
    if (!item) throw new NotFoundException("Unmatched inbound item not found");

    const input = parsed.data;
    if (item.unmatchedStatus === input.status && item.reviewStatus === input.status) {
      return item;
    }
    if (!isOpenUnmatchedStatus(item.unmatchedStatus)) {
      throw new ConflictException("Unmatched inbound item is already resolved");
    }

    const statusBefore = item.unmatchedStatus;
    const now = new Date().toISOString();
    item.unmatchedStatus = input.status;
    item.reviewStatus = input.status;
    item.reviewedAt = now;
    item.reviewedBy = safeActorId(actorUserId);
    item.reviewReason = safeReviewReason(input.reason);
    item.unmatchedResolvedAt = now;
    item.externalCalls = 0;

    const event = findEventForUnmatchedItem(item);
    if (event) {
      event.unmatchedStatus = input.status;
      event.unmatchedReviewActionStatus = input.status;
      event.unmatchedResolvedAt = now;
      event.externalCalls = 0;
    }

    await this.recordUnmatchedActionAudit({
      tenantId,
      actorUserId,
      item,
      action: input.status === "reviewed" ? "provider_webhook.unmatched_inbound_reviewed" : "provider_webhook.unmatched_inbound_skipped",
      status: input.status,
      conversationId: null,
      messageId: null
    });
    addUnmatchedHistoryEntry(item, {
      action: input.status === "reviewed" ? "reviewed" : "skipped",
      actionStatus: input.status,
      statusBefore,
      statusAfter: item.unmatchedStatus,
      actor: safeActorId(actorUserId),
      reason: item.reviewReason,
      message: input.status === "reviewed" ? "Unmatched inbound item marked reviewed" : "Unmatched inbound item skipped",
      actionAt: now
    });
    return item;
  }

  async bulkReviewUnmatchedInbound(tenantId: string, body: unknown, actorUserId?: string) {
    const parsed = providerWebhookUnmatchedInboundBulkReviewRequestSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException("Invalid unmatched inbound bulk review request");

    const input = parsed.data;
    const uniqueIds = Array.from(new Set(input.ids.map((id) => id.trim()).filter(Boolean)));
    const results: ProviderWebhookUnmatchedInboundBulkReviewItemResult[] = [];

    for (const id of uniqueIds) {
      const item = findUnmatchedInboundItem(tenantId, id);
      if (!item) {
        results.push(bulkReviewResult(id, false, "not-found", null, null, "Unmatched inbound item not found"));
        continue;
      }

      if (item.unmatchedStatus === input.reviewStatus && item.reviewStatus === input.reviewStatus) {
        results.push(bulkReviewResult(item.id, true, "already-applied", item.reviewStatus, item.unmatchedStatus, null));
        continue;
      }

      if (!isOpenUnmatchedStatus(item.unmatchedStatus)) {
        results.push(bulkReviewResult(item.id, false, "conflict", safeBulkReviewStatus(item.reviewStatus), item.unmatchedStatus, "Unmatched inbound item is already resolved"));
        continue;
      }

      const statusBefore = item.unmatchedStatus;
      const now = new Date().toISOString();
      item.unmatchedStatus = input.reviewStatus;
      item.reviewStatus = input.reviewStatus;
      item.reviewedAt = now;
      item.reviewedBy = safeActorId(actorUserId);
      item.reviewReason = safeReviewReason(input.reason);
      item.unmatchedResolvedAt = now;
      item.externalCalls = 0;

      const event = findEventForUnmatchedItem(item);
      if (event) {
        event.unmatchedStatus = input.reviewStatus;
        event.unmatchedReviewActionStatus = input.reviewStatus;
        event.unmatchedResolvedAt = now;
        event.externalCalls = 0;
      }

      await this.recordUnmatchedActionAudit({
        tenantId,
        actorUserId,
        item,
        action: input.reviewStatus === "reviewed" ? "provider_webhook.unmatched_inbound_bulk_reviewed" : "provider_webhook.unmatched_inbound_bulk_skipped",
        status: input.reviewStatus,
        conversationId: null,
        messageId: null
      });
      addUnmatchedHistoryEntry(item, {
        action: input.reviewStatus === "reviewed" ? "bulk_reviewed" : "bulk_skipped",
        actionStatus: input.reviewStatus,
        statusBefore,
        statusAfter: item.unmatchedStatus,
        actor: safeActorId(actorUserId),
        reason: item.reviewReason,
        message: input.reviewStatus === "reviewed" ? "Bulk marked reviewed" : "Bulk skipped",
        actionAt: now
      });
      results.push(bulkReviewResult(item.id, true, "updated", item.reviewStatus, item.unmatchedStatus, null));
    }

    return {
      reviewStatus: input.reviewStatus,
      results,
      summary: {
        requestedCount: input.ids.length,
        dedupedCount: uniqueIds.length,
        successCount: results.filter((result) => result.ok).length,
        errorCount: results.filter((result) => !result.ok).length,
        updatedCount: results.filter((result) => result.resultStatus === "updated").length,
        alreadyAppliedCount: results.filter((result) => result.resultStatus === "already-applied").length
      },
      externalCalls: 0 as const
    };
  }

  async linkUnmatchedInboundToConversation(tenantId: string, id: string, body: unknown, actorUserId?: string) {
    const parsed = providerWebhookUnmatchedInboundLinkRequestSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException("Invalid unmatched inbound link request");

    const item = findUnmatchedInboundItem(tenantId, id);
    if (!item) throw new NotFoundException("Unmatched inbound item not found");
    const input = parsed.data;

    if (item.unmatchedStatus === "linked" && item.linkedConversationId === input.conversationId) {
      if (input.actionMode === "link-only" || item.linkedMessageId) return item;
    } else if (!isOpenUnmatchedStatus(item.unmatchedStatus)) {
      throw new ConflictException("Unmatched inbound item is already resolved");
    }

    const statusBefore = item.unmatchedStatus;
    await this.recordUnmatchedActionAudit({
      tenantId,
      actorUserId,
      item,
      action: "provider_webhook.unmatched_inbound_link_attempted",
      status: "attempted",
      conversationId: input.conversationId,
      messageId: null
    });

    if (!isSafeLinkableUnmatchedItem(item)) {
      await this.rejectUnmatchedLink(tenantId, actorUserId, item, input.conversationId, "Unmatched inbound item is not eligible for safe linking");
    }

    const conversation = await this.conversations.getSafeConversationLinkContext(tenantId, input.conversationId)
      .catch(() => this.rejectUnmatchedLink(tenantId, actorUserId, item, input.conversationId, "Conversation not found", "not-found"));

    if (conversation.platform !== item.provider) {
      await this.rejectUnmatchedLink(tenantId, actorUserId, item, input.conversationId, "Safe conversation link rejected: platform mismatch");
    }
    if (conversation.channelAccountId !== item.channelAccountId) {
      await this.rejectUnmatchedLink(tenantId, actorUserId, item, input.conversationId, "Safe conversation link rejected: channel account mismatch");
    }
    if (!item.roomKeyDigest || !conversation.roomKeyDigest || item.roomKeyDigest !== conversation.roomKeyDigest) {
      await this.rejectUnmatchedLink(tenantId, actorUserId, item, input.conversationId, "Safe conversation link rejected: room digest mismatch");
    }
    if (!item.providerEventDigest) {
      await this.rejectUnmatchedLink(tenantId, actorUserId, item, input.conversationId, "Safe conversation link rejected: event digest missing");
    }
    const channelAccountId = item.channelAccountId;
    const roomKeyDigest = item.roomKeyDigest;
    const providerEventDigest = item.providerEventDigest;
    if (!channelAccountId || !roomKeyDigest || !providerEventDigest) {
      await this.rejectUnmatchedLink(tenantId, actorUserId, item, input.conversationId, "Safe conversation link rejected: safe digest missing");
    }

    const now = new Date().toISOString();
    let linkedMessageId: string | null = null;
    let messagePersisted = false;
    let linkStatus: ProviderWebhookUnmatchedInboundItem["linkStatus"] = "linked";

    if (input.actionMode === "link-and-persist-safe-message") {
      const result = await this.conversations.persistLinkedSandboxWebhookInboundMessage({
        tenantId,
        conversationId: input.conversationId,
        platform: item.provider,
        channelAccountId: channelAccountId!,
        roomKeyDigest: roomKeyDigest!,
        text: item.textPreview,
        messageType: mapPrismaMessageType(item.messageType),
        providerEventDigest: providerEventDigest!,
        payloadDigest: item.payloadDigest,
        deliveryDigest: item.deliveryDigest,
        timestamp: item.receivedAt
      });
      linkedMessageId = result.message.id;
      messagePersisted = !result.duplicate;
      linkStatus = result.duplicate ? "duplicate-noop" : "linked-message-persisted";
    }

    item.unmatchedStatus = "linked";
    item.reviewStatus = "linked";
    item.linkStatus = linkStatus;
    item.linkedConversationId = input.conversationId;
    item.linkedMessageId = linkedMessageId ?? item.linkedMessageId;
    item.unmatchedResolvedAt = now;
    item.messagePersisted = messagePersisted || item.messagePersisted;
    item.externalCalls = 0;

    const event = findEventForUnmatchedItem(item);
    if (event) {
      event.unmatchedStatus = "linked";
      event.unmatchedLinkStatus = linkStatus;
      event.linkedConversationId = input.conversationId;
      event.linkedMessageId = item.linkedMessageId;
      event.unmatchedResolvedAt = now;
      event.conversationId = input.conversationId;
      event.persistedMessageId = item.linkedMessageId;
      event.messagePersisted = item.messagePersisted;
      event.externalCalls = 0;
    }

    await this.recordUnmatchedActionAudit({
      tenantId,
      actorUserId,
      item,
      action: input.actionMode === "link-and-persist-safe-message" && messagePersisted
        ? "provider_webhook.unmatched_inbound_linked_message_persisted"
        : "provider_webhook.unmatched_inbound_linked",
      status: linkStatus,
      conversationId: input.conversationId,
      messageId: item.linkedMessageId
    });
    addUnmatchedHistoryEntry(item, {
      action: "linked_to_conversation",
      actionStatus: linkStatus,
      statusBefore,
      statusAfter: item.unmatchedStatus,
      actor: safeActorId(actorUserId),
      reason: input.actionMode,
      message: "Linked to safe conversation",
      linkedConversationId: input.conversationId,
      linkedMessageId: item.linkedMessageId,
      actionAt: now
    });
    if (input.actionMode === "link-and-persist-safe-message") {
      addUnmatchedHistoryEntry(item, {
        action: "linked_message_persisted",
        actionStatus: linkStatus,
        statusBefore: "linked",
        statusAfter: linkStatus,
        actor: safeActorId(actorUserId),
        reason: messagePersisted ? "safe message persisted" : "safe message duplicate noop",
        message: messagePersisted ? "Linked and persisted safe inbound message" : "Linked with duplicate safe message no-op",
        linkedConversationId: input.conversationId,
        linkedMessageId: item.linkedMessageId,
        actionAt: now
      });
    }
    return item;
  }

  async create(tenantId: string, body: unknown, actorUserId?: string) {
    rejectLiveProviderMode();
    const parsed = providerWebhookSandboxEventRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException("Invalid provider webhook sandbox event");
    }

    const input = parsed.data;
    const payload = summarizePayload(input.payload);
    const signature = verifySandboxSignature(input);
    const replay = checkReplayGuardrail(tenantId, input);
    const normalization = normalizeSandboxEvent(input, signature, replay);
    const routing = summarizeDryRunRouting(tenantId, input, normalization, signature, replay);
    const receivedAt = new Date().toISOString();
    const persistence = await this.persistSandboxInbound(tenantId, input, normalization, signature, replay, routing);
    const unmatched = this.prepareUnmatchedInboundReviewItem(tenantId, input, payload, normalization, signature, replay, routing, persistence, receivedAt);
    const event: ProviderWebhookEvent = {
      id: `provider-webhook-event-${crypto.randomUUID()}`,
      tenantId,
      provider: input.provider,
      channel: input.channel ?? input.provider,
      eventType: input.eventType,
      mode: input.mode,
      status: signature.signatureStatus === "failed" ? "failed" : input.status,
      receivedAt,
      payloadSummary: payload.summary,
      payloadFieldCount: payload.fieldCount,
      payloadDigest: payload.digest,
      signatureVerified: signature.signatureVerified,
      signatureStatus: signature.signatureStatus,
      signatureAlgorithm: signature.signatureAlgorithm,
      signatureFingerprint: signature.signatureFingerprint,
      signedAt: input.timestamp ?? null,
      replayDetected: replay.replayDetected,
      replayStatus: replay.replayStatus,
      dedupKeyDigest: replay.dedupKeyDigest,
      previousEventSeenAt: replay.previousEventSeenAt,
      normalized: normalization.normalized,
      normalizationStatus: normalization.normalizationStatus,
      normalizedEventType: normalization.normalizedEventType,
      direction: "inbound",
      messageType: normalization.messageType,
      textPreview: normalization.textPreview,
      textLength: normalization.textLength,
      mediaSummary: normalization.mediaSummary,
      senderKeyDigest: normalization.senderKeyDigest,
      roomKeyDigest: normalization.roomKeyDigest,
      dryRunRouting: routing.dryRunRouting,
      routingStatus: routing.routingStatus,
      conversationLookupStatus: persistence.conversationLookupStatus ?? routing.conversationLookupStatus,
      conversationKeyDigest: routing.conversationKeyDigest,
      channelAccountId: persistence.channelAccountId ?? routing.channelAccountId,
      roomIdDigest: routing.roomIdDigest,
      inboundPersistenceMode: input.inboundPersistenceMode,
      inboundPersistenceStatus: persistence.inboundPersistenceStatus,
      messagePersisted: persistence.messagePersisted,
      persistedMessageId: persistence.persistedMessageId,
      conversationId: persistence.conversationId,
      unmatchedInboundQueued: unmatched.unmatchedInboundQueued,
      unmatchedInboundId: unmatched.unmatchedInboundId,
      unmatchedStatus: unmatched.unmatchedStatus,
      unmatchedReason: unmatched.unmatchedReason,
      unmatchedReviewActionStatus: "none",
      unmatchedLinkStatus: "none",
      linkedConversationId: null,
      linkedMessageId: null,
      unmatchedResolvedAt: null,
      inboundAuditStatus: "skipped",
      externalCalls: 0
    };
    if (persistence.routingStatus) event.routingStatus = persistence.routingStatus;

    events.unshift(event);
    events.splice(maxStoredEvents);
    event.inboundAuditStatus = await this.recordAudit(event, actorUserId);
    this.recordInitialUnmatchedHistory(event, actorUserId);
    return event;
  }

  private prepareUnmatchedInboundReviewItem(
    tenantId: string,
    input: ProviderWebhookSandboxEventRequest,
    payload: ReturnType<typeof summarizePayload>,
    normalization: ReturnType<typeof normalizeSandboxEvent>,
    signature: ReturnType<typeof verifySandboxSignature>,
    replay: ReturnType<typeof checkReplayGuardrail>,
    routing: ReturnType<typeof summarizeDryRunRouting>,
    persistence: Awaited<ReturnType<ProviderWebhookEventsService["persistSandboxInbound"]>>,
    receivedAt: string
  ): {
    unmatchedInboundQueued: boolean;
    unmatchedInboundId: string | null;
    unmatchedStatus: ProviderWebhookUnmatchedInboundStatus | null;
    unmatchedReason: string | null;
  } {
    if (input.mode !== "sandbox") return unmatchedSkipped(null, null);
    if (signature.signatureStatus === "failed" || signature.signatureStatus === "missing") {
      return unmatchedSkipped("blocked", "blocked-signature");
    }
    if (replay.replayDetected) {
      return unmatchedSkipped("duplicate-skipped", "blocked-replay");
    }
    if (!normalization.normalized) {
      return unmatchedSkipped("skipped", normalization.normalizationStatus === "unsupported" ? "unsupported" : "normalization-skipped");
    }

    const conversationLookupStatus = persistence.conversationLookupStatus ?? routing.conversationLookupStatus;
    if (conversationLookupStatus !== "not-found") return unmatchedSkipped(null, null);

    const channelAccountId = persistence.channelAccountId ?? routing.channelAccountId;
    const idempotencyDigest = replay.dedupKeyDigest ?? payload.digest;
    const existing = unmatchedInboundItems.find((item) =>
      item.tenantId === tenantId &&
      item.provider === input.provider &&
      (item.providerEventDigest === idempotencyDigest || item.payloadDigest === payload.digest)
    );
    if (existing) {
      return {
        unmatchedInboundQueued: false,
        unmatchedInboundId: existing.id,
        unmatchedStatus: "duplicate-skipped",
        unmatchedReason: "duplicate-unmatched-inbound"
      };
    }

    const item: ProviderWebhookUnmatchedInboundItem = {
      id: `provider-webhook-unmatched-${crypto.randomUUID()}`,
      tenantId,
      provider: input.provider,
      channelAccountId,
      mode: "sandbox",
      eventType: input.eventType,
      normalizedEventType: normalization.normalizedEventType,
      messageType: normalization.messageType,
      normalizationStatus: normalization.normalizationStatus,
      routingStatus: persistence.routingStatus ?? routing.routingStatus,
      conversationLookupStatus: "not-found",
      unmatchedStatus: "review-needed",
      unmatchedReason: "safe-review-required-no-conversation-match",
      payloadDigest: payload.digest,
      providerEventDigest: replay.dedupKeyDigest ?? payloadEventDigest(tenantId, input, routing),
      deliveryDigest: replay.dedupKeyDigest,
      senderKeyDigest: normalization.senderKeyDigest,
      roomKeyDigest: normalization.roomKeyDigest,
      textPreview: normalization.textPreview,
      textLength: normalization.textLength,
      receivedAt,
      reviewStatus: "pending",
      reviewedAt: null,
      reviewedBy: null,
      reviewReason: null,
      linkStatus: "none",
      linkedConversationId: null,
      linkedMessageId: null,
      unmatchedResolvedAt: null,
      messagePersisted: false,
      externalCalls: 0
    };

    unmatchedInboundItems.unshift(item);
    unmatchedInboundItems.splice(maxStoredEvents);
    return {
      unmatchedInboundQueued: true,
      unmatchedInboundId: item.id,
      unmatchedStatus: item.unmatchedStatus,
      unmatchedReason: item.unmatchedReason
    };
  }

  private recordInitialUnmatchedHistory(event: ProviderWebhookEvent, actorUserId?: string) {
    if (!event.unmatchedInboundId) return;
    const item = findUnmatchedInboundItem(event.tenantId, event.unmatchedInboundId);
    if (!item) return;
    if (unmatchedInboundHistoryEntries.some((entry) => entry.unmatchedInboundId === item.id && entry.action === "inbound_received")) {
      return;
    }
    addUnmatchedHistoryEntry(item, {
      action: "inbound_received",
      actionStatus: event.status,
      statusBefore: null,
      statusAfter: event.status,
      actor: safeActorId(actorUserId),
      reason: event.payloadSummary,
      message: "Inbound sandbox event received",
      actionAt: event.receivedAt,
      receivedAt: event.receivedAt
    });
    addUnmatchedHistoryEntry(item, {
      action: "normalized_routed",
      actionStatus: `${event.normalizationStatus}/${event.routingStatus}`,
      statusBefore: event.status,
      statusAfter: event.routingStatus,
      actor: safeActorId(actorUserId),
      reason: `lookup=${event.conversationLookupStatus}`,
      message: "Normalized and routed with safe provider context",
      actionAt: event.receivedAt,
      receivedAt: event.receivedAt
    });
    addUnmatchedHistoryEntry(item, {
      action: "unmatched_queued",
      actionStatus: item.unmatchedStatus,
      statusBefore: event.routingStatus,
      statusAfter: item.unmatchedStatus,
      actor: safeActorId(actorUserId),
      reason: item.unmatchedReason,
      message: "Queued for safe unmatched inbound review",
      actionAt: event.receivedAt,
      receivedAt: event.receivedAt
    });
  }

  private async persistSandboxInbound(
    tenantId: string,
    input: ProviderWebhookSandboxEventRequest,
    normalization: ReturnType<typeof normalizeSandboxEvent>,
    signature: ReturnType<typeof verifySandboxSignature>,
    replay: ReturnType<typeof checkReplayGuardrail>,
    routing: ReturnType<typeof summarizeDryRunRouting>
  ): Promise<{
    inboundPersistenceStatus: ProviderWebhookEvent["inboundPersistenceStatus"];
    messagePersisted: boolean;
    persistedMessageId: string | null;
    conversationId: string | null;
    conversationLookupStatus: ProviderWebhookEvent["conversationLookupStatus"] | null;
    channelAccountId: string | null;
    routingStatus: ProviderWebhookEvent["routingStatus"] | null;
  }> {
    if (input.inboundPersistenceMode === "dry-run") {
      return persistenceSkipped("dry-run-only", null);
    }
    if (input.mode !== "sandbox") {
      return persistenceSkipped("skipped", "skipped");
    }
    if (signature.signatureStatus === "failed" || signature.signatureStatus === "missing") {
      return persistenceSkipped("blocked-signature", "skipped");
    }
    if (replay.replayDetected) {
      return persistenceSkipped("blocked-replay", "skipped", "blocked-replay");
    }
    if (!normalization.normalized) {
      return persistenceSkipped(normalization.normalizationStatus === "unsupported" ? "unsupported" : "skipped", "skipped");
    }
    if (!normalization.rawRoomKey || !routing.channelAccountId) {
      return persistenceSkipped("skipped-no-match", "not-found");
    }

    try {
      const result = await this.conversations.persistSandboxWebhookInboundMessage({
        tenantId,
        platform: input.provider,
        channelAccountId: routing.channelAccountId,
        roomKey: normalization.rawRoomKey,
        text: normalization.textPreview,
        messageType: mapPrismaMessageType(normalization.messageType),
        providerEventDigest: replay.dedupKeyDigest ?? routing.conversationKeyDigest ?? payloadEventDigest(tenantId, input, routing),
        payloadDigest: summarizePayload(input.payload).digest,
        deliveryDigest: replay.dedupKeyDigest,
        timestamp: input.timestamp ?? null
      });

      if (result.status === "not-found") {
        return persistenceSkipped("skipped-no-match", "not-found");
      }
      if (result.duplicate) {
        return persistenceSkipped("blocked-replay", "matched", "blocked-replay", result.conversation.id, result.message.id);
      }

      return {
        inboundPersistenceStatus: "persisted",
        messagePersisted: true,
        persistedMessageId: result.message.id,
        conversationId: result.conversation.id,
        conversationLookupStatus: "matched",
        channelAccountId: result.conversation.room.channelAccountId,
        routingStatus: "matched"
      };
    } catch {
      return persistenceSkipped("failed", null);
    }
  }

  private async recordAudit(event: ProviderWebhookEvent, actorUserId?: string): Promise<ProviderWebhookEvent["inboundAuditStatus"]> {
    try {
      await this.audit.record({
        tenantId: event.tenantId,
        actorUserId,
        action: "provider_webhook.sandbox_event_received",
        entityType: "provider_webhook_event",
        entityId: event.id,
        metadata: {
          provider: event.provider,
          channel: event.channel,
          eventType: event.eventType,
          mode: event.mode,
          status: event.status,
          payloadSummary: event.payloadSummary,
          payloadFieldCount: event.payloadFieldCount,
          payloadDigest: event.payloadDigest,
          signatureVerified: event.signatureVerified,
          signatureStatus: event.signatureStatus,
          signatureAlgorithm: event.signatureAlgorithm,
          signatureFingerprint: event.signatureFingerprint,
          signedAt: event.signedAt,
          replayDetected: event.replayDetected,
          replayStatus: event.replayStatus,
          dedupKeyDigest: event.dedupKeyDigest,
          previousEventSeenAt: event.previousEventSeenAt,
          normalized: event.normalized,
          normalizationStatus: event.normalizationStatus,
          normalizedEventType: event.normalizedEventType,
          direction: event.direction,
          messageType: event.messageType,
          textPreview: event.textPreview,
          textLength: event.textLength,
          mediaSummary: event.mediaSummary,
          senderKeyDigest: event.senderKeyDigest,
          roomKeyDigest: event.roomKeyDigest,
          dryRunRouting: event.dryRunRouting,
          routingStatus: event.routingStatus,
          conversationLookupStatus: event.conversationLookupStatus,
          conversationKeyDigest: event.conversationKeyDigest,
          channelAccountId: event.channelAccountId,
          roomIdDigest: event.roomIdDigest,
          inboundPersistenceMode: event.inboundPersistenceMode,
          inboundPersistenceStatus: event.inboundPersistenceStatus,
          messagePersisted: event.messagePersisted,
          persistedMessageId: event.persistedMessageId,
          conversationId: event.conversationId,
          unmatchedInboundQueued: event.unmatchedInboundQueued,
          unmatchedInboundId: event.unmatchedInboundId,
          unmatchedStatus: event.unmatchedStatus,
          unmatchedReason: event.unmatchedReason,
          externalCalls: 0
        }
      });

      if (event.inboundPersistenceMode === "sandbox-persist") {
        const inboundMetadata = {
          tenantId: event.tenantId,
          conversationId: event.conversationId,
          provider: event.provider,
          channelAccountId: event.channelAccountId,
          roomIdDigest: event.roomIdDigest,
          eventDigest: event.dedupKeyDigest,
          payloadDigest: event.payloadDigest,
          status: event.inboundPersistenceStatus,
          externalCalls: 0
        };
        await this.audit.record({
          tenantId: event.tenantId,
          actorUserId,
          conversationId: event.conversationId,
          action: "provider_webhook.inbound_persistence_attempted",
          entityType: "provider_webhook_inbound_persistence",
          entityId: event.persistedMessageId ?? event.id,
          metadata: inboundMetadata
        });
        const outcomeAction = inboundPersistenceAuditAction(event.inboundPersistenceStatus);
        if (outcomeAction !== "provider_webhook.inbound_persistence_attempted") {
          await this.audit.record({
            tenantId: event.tenantId,
            actorUserId,
            conversationId: event.conversationId,
            action: outcomeAction,
            entityType: "provider_webhook_inbound_persistence",
            entityId: event.persistedMessageId ?? event.id,
            metadata: inboundMetadata
          });
        }
      }
      await this.recordUnmatchedAudit(event, actorUserId);
      return "recorded";
    } catch {
      // Sandbox event intake must not fail just because optional audit persistence is unavailable.
      return "failed";
    }
  }

  private async recordUnmatchedAudit(event: ProviderWebhookEvent, actorUserId?: string) {
    const action = unmatchedAuditAction(event);
    if (!action) return;
    await this.audit.record({
      tenantId: event.tenantId,
      actorUserId,
      action,
      entityType: "provider_webhook_unmatched_inbound",
      entityId: event.unmatchedInboundId ?? event.id,
      metadata: {
        tenantId: event.tenantId,
        provider: event.provider,
        channelAccountId: event.channelAccountId,
        eventDigest: event.dedupKeyDigest,
        payloadDigest: event.payloadDigest,
        senderKeyDigest: event.senderKeyDigest,
        roomKeyDigest: event.roomKeyDigest,
        status: event.unmatchedStatus,
        reason: event.unmatchedReason,
        externalCalls: 0
      }
    });
  }

  private async rejectUnmatchedLink(
    tenantId: string,
    actorUserId: string | undefined,
    item: ProviderWebhookUnmatchedInboundItem,
    conversationId: string,
    message: string,
    status: "bad-request" | "not-found" | "conflict" = "bad-request"
  ): Promise<never> {
    const statusBefore = item.linkStatus;
    item.linkStatus = "rejected";
    item.externalCalls = 0;
    const event = findEventForUnmatchedItem(item);
    if (event) {
      event.unmatchedLinkStatus = "rejected";
      event.externalCalls = 0;
    }
    await this.recordUnmatchedActionAudit({
      tenantId,
      actorUserId,
      item,
      action: "provider_webhook.unmatched_inbound_link_rejected",
      status: "rejected",
      conversationId,
      messageId: null
    });
    addUnmatchedHistoryEntry(item, {
      action: "link_rejected",
      actionStatus: "rejected",
      statusBefore,
      statusAfter: item.linkStatus,
      actor: safeActorId(actorUserId),
      reason: safeReviewReason(message),
      message: "Safe conversation link rejected",
      linkedConversationId: conversationId,
      linkedMessageId: null,
      actionAt: new Date().toISOString()
    });
    if (status === "not-found") throw new NotFoundException(message);
    if (status === "conflict") throw new ConflictException(message);
    throw new BadRequestException(message);
  }

  private async recordUnmatchedActionAudit(input: {
    tenantId: string;
    actorUserId: string | undefined;
    item: ProviderWebhookUnmatchedInboundItem;
    action: string;
    status: string;
    conversationId: string | null;
    messageId: string | null;
  }) {
    try {
      await this.audit.record({
        tenantId: input.tenantId,
        actorUserId: input.actorUserId,
        conversationId: input.conversationId,
        action: input.action,
        entityType: "provider_webhook_unmatched_inbound",
        entityId: input.item.id,
        metadata: {
          tenantId: input.tenantId,
          provider: input.item.provider,
          channelAccountId: input.item.channelAccountId,
          unmatchedInboundId: input.item.id,
          conversationId: input.conversationId,
          messageId: input.messageId,
          payloadDigest: input.item.payloadDigest,
          senderKeyDigest: input.item.senderKeyDigest,
          roomKeyDigest: input.item.roomKeyDigest,
          status: input.status,
          externalCalls: 0
        }
      });
    } catch {
      // Review/link mutations remain safe even if optional audit persistence is unavailable.
    }
  }
}

export function resetProviderWebhookEventStoreForTest() {
  events.splice(0);
  unmatchedInboundItems.splice(0);
  unmatchedInboundHistoryEntries.splice(0);
  dedupFirstSeenAtByDigest.clear();
}

export function getProviderWebhookGuardrailReadinessSnapshot() {
  const latest = events[0] ?? null;
  const latestUnmatched = [...unmatchedInboundItems]
    .sort((left, right) => latestItemActivityAt(right).localeCompare(latestItemActivityAt(left)))[0] ?? null;
  return {
    webhookSignatureVerificationConfigured: true,
    webhookSignatureVerificationReady: true,
    replayGuardrailsEnabled: true,
    lastSandboxEventSignatureStatus: latest?.signatureStatus ?? null,
    latestReplayStatus: latest?.replayStatus ?? null,
    replayDetectedCount: events.filter((event) => event.replayDetected).length,
    webhookNormalizationEnabled: true,
    webhookDryRunRoutingEnabled: true,
    lastSandboxEventNormalizationStatus: latest?.normalizationStatus ?? null,
    latestRoutingStatus: latest?.routingStatus ?? null,
    normalizedEventCount: events.filter((event) => event.normalized).length,
    routingBlockedCount: events.filter((event) => event.routingStatus === "blocked-signature" || event.routingStatus === "blocked-replay").length,
    webhookInboundPersistenceEnabled: true,
    latestInboundPersistenceStatus: latest?.inboundPersistenceStatus ?? null,
    persistedInboundMessageCount: events.filter((event) => event.messagePersisted).length,
    inboundPersistenceBlockedCount: events.filter((event) =>
      event.inboundPersistenceStatus === "blocked-signature" ||
      event.inboundPersistenceStatus === "blocked-replay" ||
      event.inboundPersistenceStatus === "failed"
    ).length,
    inboundPersistenceReplayBlockedCount: events.filter((event) => event.inboundPersistenceStatus === "blocked-replay").length,
    inboundPersistenceSkippedNoMatchCount: events.filter((event) => event.inboundPersistenceStatus === "skipped-no-match").length,
    webhookUnmatchedInboundReviewEnabled: true,
    webhookUnmatchedReviewActionsEnabled: true,
    webhookCandidateLookupEnabled: true,
    webhookUnmatchedHistoryEnabled: true,
    webhookUnmatchedQueueExportEnabled: true,
    webhookUnmatchedQueueExportMaxLimit: unmatchedInboundExportMaxLimit,
    unmatchedInboundOpenCount: unmatchedInboundItems.filter((item) => item.unmatchedStatus === "open" || item.unmatchedStatus === "review-needed").length,
    unmatchedInboundQueuedCount: unmatchedInboundItems.length,
    unmatchedInboundReplayBlockedCount: events.filter((event) => event.unmatchedStatus === "duplicate-skipped" || event.unmatchedReason === "blocked-replay").length,
    unmatchedInboundReviewedCount: unmatchedInboundItems.filter((item) => item.reviewStatus === "reviewed").length,
    unmatchedInboundSkippedCount: unmatchedInboundItems.filter((item) => item.reviewStatus === "skipped").length,
    unmatchedInboundLinkedCount: unmatchedInboundItems.filter((item) => item.reviewStatus === "linked").length,
    latestUnmatchedInboundStatus: latestUnmatched?.unmatchedStatus ?? latest?.unmatchedStatus ?? null,
    latestUnmatchedReviewActionStatus: latest?.unmatchedReviewActionStatus !== "none"
      ? latest?.unmatchedReviewActionStatus ?? null
      : latestUnmatched?.reviewStatus === "reviewed" || latestUnmatched?.reviewStatus === "skipped"
        ? latestUnmatched.reviewStatus
        : null,
    latestUnmatchedLinkStatus: latest?.unmatchedLinkStatus !== "none"
      ? latest?.unmatchedLinkStatus ?? null
      : latestUnmatched?.linkStatus && latestUnmatched.linkStatus !== "none"
        ? latestUnmatched.linkStatus
        : null,
    lastSandboxEventAt: latest?.receivedAt ?? null
  };
}

function unmatchedSkipped(
  unmatchedStatus: ProviderWebhookUnmatchedInboundStatus | null,
  unmatchedReason: string | null
) {
  return {
    unmatchedInboundQueued: false,
    unmatchedInboundId: null,
    unmatchedStatus,
    unmatchedReason
  };
}

function findUnmatchedInboundItem(tenantId: string, id: string) {
  return unmatchedInboundItems.find((item) => item.tenantId === tenantId && item.id === id) ?? null;
}

function findEventForUnmatchedItem(item: ProviderWebhookUnmatchedInboundItem) {
  return events.find((event) => event.tenantId === item.tenantId && event.unmatchedInboundId === item.id) ?? null;
}

function isOpenUnmatchedStatus(status: ProviderWebhookUnmatchedInboundStatus) {
  return status === "open" || status === "review-needed";
}

function matchesLegacyStatusFilter(item: ProviderWebhookUnmatchedInboundItem, status: ProviderWebhookUnmatchedInboundStatusFilter | undefined) {
  if (!status) return true;
  if (status === "open") return isOpenUnmatchedStatus(item.unmatchedStatus);
  return item.unmatchedStatus === status;
}

function normalizeUnmatchedInboundFilters(filters: ProviderWebhookUnmatchedInboundFilters | ProviderWebhookUnmatchedInboundStatusFilter): ProviderWebhookUnmatchedInboundFilters {
  if (typeof filters === "string") return { status: filters };
  return filters ?? {};
}

function filterUnmatchedInboundItems(tenantId: string, filters: ProviderWebhookUnmatchedInboundFilters) {
  const receivedFrom = filters.receivedAtFrom ?? filters.receivedFrom;
  const receivedTo = filters.receivedAtTo ?? filters.receivedTo;
  return unmatchedInboundItems.filter((item) => {
    if (item.tenantId !== tenantId) return false;
    if (!matchesLegacyStatusFilter(item, filters.status)) return false;
    if (filters.provider && item.provider !== filters.provider) return false;
    if (filters.reviewStatus && item.reviewStatus !== filters.reviewStatus) return false;
    if (filters.linkStatus && item.linkStatus !== filters.linkStatus) return false;
    if (filters.unmatchedStatus && item.unmatchedStatus !== filters.unmatchedStatus) return false;
    if (filters.eventType && item.eventType !== filters.eventType) return false;
    if (receivedFrom && item.receivedAt < new Date(receivedFrom).toISOString()) return false;
    if (receivedTo && item.receivedAt > new Date(receivedTo).toISOString()) return false;
    return true;
  });
}

function cleanUnmatchedInboundFilters(filters: ProviderWebhookUnmatchedInboundFilters) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== "")
  ) as ProviderWebhookUnmatchedInboundFilters;
}

function summarizeUnmatchedInboundItems(items: ProviderWebhookUnmatchedInboundItem[]) {
  return {
    openCount: items.filter(isOpenUnmatchedStatusItem).length,
    reviewedCount: items.filter((item) => item.reviewStatus === "reviewed").length,
    skippedCount: items.filter((item) => item.reviewStatus === "skipped").length,
    linkedCount: items.filter((item) => item.reviewStatus === "linked").length
  };
}

function buildHistoryEntriesForItem(item: ProviderWebhookUnmatchedInboundItem): ProviderWebhookUnmatchedInboundHistoryEntry[] {
  const stored = unmatchedInboundHistoryEntries.filter((entry) => entry.unmatchedInboundId === item.id);
  const entries = [...stored];
  const event = findEventForUnmatchedItem(item);
  if (event && !entries.some((entry) => entry.action === "inbound_received")) {
    entries.push(historyEntry(item, {
      action: "inbound_received",
      actionStatus: event.status,
      statusBefore: null,
      statusAfter: event.status,
      actor: null,
      reason: event.payloadSummary,
      message: "Inbound sandbox event received",
      actionAt: event.receivedAt,
      receivedAt: event.receivedAt
    }));
  }
  if (event && !entries.some((entry) => entry.action === "normalized_routed")) {
    entries.push(historyEntry(item, {
      action: "normalized_routed",
      actionStatus: `${event.normalizationStatus}/${event.routingStatus}`,
      statusBefore: event.status,
      statusAfter: event.routingStatus,
      actor: null,
      reason: `lookup=${event.conversationLookupStatus}`,
      message: "Normalized and routed with safe provider context",
      actionAt: event.receivedAt,
      receivedAt: event.receivedAt
    }));
  }
  if (!entries.some((entry) => entry.action === "unmatched_queued")) {
    entries.push(historyEntry(item, {
      action: "unmatched_queued",
      actionStatus: item.unmatchedStatus,
      statusBefore: event?.routingStatus ?? null,
      statusAfter: item.unmatchedStatus,
      actor: null,
      reason: item.unmatchedReason,
      message: "Queued for safe unmatched inbound review",
      actionAt: item.receivedAt,
      receivedAt: item.receivedAt
    }));
  }
  if ((item.reviewStatus === "reviewed" || item.reviewStatus === "skipped") && !entries.some((entry) =>
    entry.action === item.reviewStatus || entry.action === `bulk_${item.reviewStatus}`)) {
    entries.push(historyEntry(item, {
      action: item.reviewStatus,
      actionStatus: item.reviewStatus,
      statusBefore: "review-needed",
      statusAfter: item.unmatchedStatus,
      actor: item.reviewedBy,
      reason: item.reviewReason,
      message: item.reviewStatus === "reviewed" ? "Unmatched inbound item marked reviewed" : "Unmatched inbound item skipped",
      actionAt: item.reviewedAt ?? item.unmatchedResolvedAt ?? item.receivedAt,
      receivedAt: item.receivedAt
    }));
  }
  if (item.reviewStatus === "linked" && !entries.some((entry) => entry.action === "linked_to_conversation")) {
    entries.push(historyEntry(item, {
      action: "linked_to_conversation",
      actionStatus: item.linkStatus,
      statusBefore: "review-needed",
      statusAfter: item.unmatchedStatus,
      actor: null,
      reason: item.linkStatus,
      message: "Linked to safe conversation",
      linkedConversationId: item.linkedConversationId,
      linkedMessageId: item.linkedMessageId,
      actionAt: item.unmatchedResolvedAt ?? item.receivedAt,
      receivedAt: item.receivedAt
    }));
  }
  return entries.sort((left, right) => left.actionAt.localeCompare(right.actionAt));
}

function addUnmatchedHistoryEntry(
  item: ProviderWebhookUnmatchedInboundItem,
  input: {
    action: ProviderWebhookUnmatchedInboundHistoryAction;
    actionStatus: string;
    statusBefore: string | null;
    statusAfter: string | null;
    actor: string | null;
    reason: string | null;
    message: string | null;
    linkedConversationId?: string | null;
    linkedMessageId?: string | null;
    receivedAt?: string | null;
    actionAt: string;
  }
) {
  unmatchedInboundHistoryEntries.push(historyEntry(item, input));
  if (unmatchedInboundHistoryEntries.length > maxStoredEvents * 10) {
    unmatchedInboundHistoryEntries.splice(0, unmatchedInboundHistoryEntries.length - maxStoredEvents * 10);
  }
}

function historyEntry(
  item: ProviderWebhookUnmatchedInboundItem,
  input: {
    action: ProviderWebhookUnmatchedInboundHistoryAction;
    actionStatus: string;
    statusBefore: string | null;
    statusAfter: string | null;
    actor: string | null;
    reason: string | null;
    message: string | null;
    linkedConversationId?: string | null;
    linkedMessageId?: string | null;
    receivedAt?: string | null;
    actionAt: string;
  }
): ProviderWebhookUnmatchedInboundHistoryEntry {
  return {
    id: `provider-webhook-history-${crypto.randomUUID()}`,
    unmatchedInboundId: item.id,
    provider: item.provider,
    channelAccountId: item.channelAccountId,
    safeRoomLabel: safeRoomLabel(item),
    roomKeyDigest: item.roomKeyDigest,
    eventType: item.eventType,
    action: input.action,
    actionStatus: safeHistoryText(input.actionStatus) ?? "recorded",
    statusBefore: safeHistoryText(input.statusBefore),
    statusAfter: safeHistoryText(input.statusAfter),
    actor: safeHistoryText(input.actor),
    reason: safeHistoryText(input.reason),
    message: safeHistoryText(input.message),
    linkedConversationId: safeHistoryText(input.linkedConversationId ?? null),
    linkedMessageId: safeHistoryText(input.linkedMessageId ?? null),
    receivedAt: input.receivedAt ?? item.receivedAt,
    actionAt: input.actionAt,
    externalCalls: 0 as const
  };
}

function isOpenUnmatchedStatusItem(item: ProviderWebhookUnmatchedInboundItem) {
  return isOpenUnmatchedStatus(item.unmatchedStatus);
}

function normalizeUnmatchedInboundExportFilters(filters: ProviderWebhookUnmatchedInboundExportQuery): ProviderWebhookUnmatchedInboundExportQuery {
  return {
    ...filters,
    limit: filters.limit ?? unmatchedInboundExportMaxLimit,
    sortBy: filters.sortBy ?? "receivedAt",
    sortOrder: filters.sortOrder ?? "desc",
    format: filters.format ?? "json"
  };
}

function exportRowFromItem(item: ProviderWebhookUnmatchedInboundItem): ProviderWebhookUnmatchedInboundExportRow {
  return {
    id: item.id,
    provider: item.provider,
    channelAccountId: item.channelAccountId,
    safeRoomLabel: safeRoomLabel(item),
    roomKeyDigest: item.roomKeyDigest,
    eventType: item.eventType,
    reviewStatus: item.reviewStatus,
    linkStatus: item.linkStatus,
    unmatchedStatus: item.unmatchedStatus,
    receivedAt: item.receivedAt,
    reviewedAt: item.reviewedAt,
    linkedConversationId: item.linkedConversationId,
    candidateCount: null,
    safeMessagePreview: safeHistoryText(item.textPreview),
    safeReason: safeHistoryText(item.reviewReason ?? item.unmatchedReason),
    safeResultSummary: safeHistoryText(exportResultSummary(item)),
    externalCalls: 0 as const
  };
}

function exportResultSummary(item: ProviderWebhookUnmatchedInboundItem) {
  if (item.reviewStatus === "linked") return `linked:${item.linkStatus}`;
  if (item.reviewStatus === "reviewed" || item.reviewStatus === "skipped") return item.reviewStatus;
  return item.unmatchedStatus;
}

function rowsToCsv(rows: ProviderWebhookUnmatchedInboundExportRow[]) {
  const columns: (keyof ProviderWebhookUnmatchedInboundExportRow)[] = [
    "id",
    "provider",
    "channelAccountId",
    "safeRoomLabel",
    "roomKeyDigest",
    "eventType",
    "reviewStatus",
    "linkStatus",
    "unmatchedStatus",
    "receivedAt",
    "reviewedAt",
    "linkedConversationId",
    "candidateCount",
    "safeMessagePreview",
    "safeReason",
    "safeResultSummary",
    "externalCalls"
  ];
  const csvRows = [
    columns.join(","),
    ...rows.map((row) => columns.map((column) => csvCell(row[column])).join(","))
  ];
  return csvRows.join("\n");
}

function csvCell(value: ProviderWebhookUnmatchedInboundExportRow[keyof ProviderWebhookUnmatchedInboundExportRow]) {
  if (value === null || value === undefined) return "";
  return `"${String(value).replace(/"/g, "\"\"")}"`;
}

function bulkReviewResult(
  id: string,
  ok: boolean,
  resultStatus: ProviderWebhookUnmatchedInboundBulkReviewItemResult["resultStatus"],
  reviewStatus: ProviderWebhookUnmatchedInboundBulkReviewItemResult["reviewStatus"],
  unmatchedStatus: ProviderWebhookUnmatchedInboundBulkReviewItemResult["unmatchedStatus"],
  error: string | null
): ProviderWebhookUnmatchedInboundBulkReviewItemResult {
  return {
    id,
    ok,
    resultStatus,
    reviewStatus,
    unmatchedStatus,
    error,
    externalCalls: 0
  };
}

function safeBulkReviewStatus(status: ProviderWebhookUnmatchedInboundItem["reviewStatus"]) {
  return status === "reviewed" || status === "skipped" ? status : null;
}

function isSafeLinkableUnmatchedItem(item: ProviderWebhookUnmatchedInboundItem) {
  return isOpenUnmatchedStatus(item.unmatchedStatus)
    && item.mode === "sandbox"
    && item.normalizationStatus === "normalized"
    && item.conversationLookupStatus === "not-found"
    && item.routingStatus !== "blocked-signature"
    && item.routingStatus !== "blocked-replay"
    && item.routingStatus !== "unsupported"
    && item.providerEventDigest !== null
    && item.channelAccountId !== null
    && item.roomKeyDigest !== null;
}

function safeActorId(actorUserId: string | undefined) {
  const trimmed = actorUserId?.trim();
  return trimmed && !isUnsafeText(trimmed) ? trimmed : "system";
}

function safeReviewReason(reason: ProviderWebhookUnmatchedInboundReviewRequest["reason"]) {
  const trimmed = reason?.replace(/\s+/g, " ").trim();
  if (!trimmed || isUnsafeText(trimmed)) return null;
  return trimmed.length > 120 ? `${trimmed.slice(0, 117)}...` : trimmed;
}

function safeHistoryText(value: string | null | undefined) {
  const trimmed = value?.replace(/\s+/g, " ").trim();
  if (!trimmed || isUnsafeText(trimmed)) return null;
  return trimmed.length > 160 ? `${trimmed.slice(0, 157)}...` : trimmed;
}

function safeRoomLabel(item: ProviderWebhookUnmatchedInboundItem) {
  const digest = item.roomKeyDigest?.replace(/^sha256:/, "").slice(0, 12) ?? "none";
  return `${item.provider} room digest ${digest}`;
}

function latestItemActivityAt(item: ProviderWebhookUnmatchedInboundItem) {
  return item.unmatchedResolvedAt ?? item.reviewedAt ?? item.receivedAt;
}

function rejectLiveProviderMode() {
  const providerOutboundMode = normalized(process.env.PROVIDER_OUTBOUND_MODE, "disabled");
  const channelMode = normalized(process.env.CHANNEL_MODE, "mock");
  const metaChannelMode = normalized(process.env.META_CHANNEL_MODE, "mock");
  if (providerOutboundMode === "real" || channelMode === "real" || metaChannelMode === "real") {
    throw new BadRequestException("Provider webhook sandbox events are disabled while live provider mode is active");
  }
}

function normalizeSandboxEvent(
  input: ProviderWebhookSandboxEventRequest,
  signature: ReturnType<typeof verifySandboxSignature>,
  replay: ReturnType<typeof checkReplayGuardrail>
) {
  if (signature.signatureStatus === "failed") {
    return blockedNormalization("blocked-signature");
  }
  if (signature.signatureStatus === "missing") {
    return blockedNormalization("skipped");
  }
  if (replay.replayDetected) {
    return blockedNormalization("blocked-replay");
  }

  const summary = summarizeProviderPayload(input.provider, input.payload);
  if (!summary.supported) {
    return {
      ...blockedNormalization("unsupported"),
      normalizedEventType: summary.normalizedEventType,
      messageType: summary.messageType,
      mediaSummary: summary.mediaSummary
    };
  }

  return {
    normalized: true,
    normalizationStatus: "normalized" as const,
    normalizedEventType: summary.normalizedEventType,
    messageType: summary.messageType,
    textPreview: safeTextPreview(summary.text),
    textLength: typeof summary.text === "string" ? summary.text.length : null,
    mediaSummary: summary.mediaSummary,
    senderKeyDigest: safeKeyDigest("sender", summary.senderKey),
    roomKeyDigest: safeKeyDigest("room", summary.roomKey),
    rawRoomKey: summary.roomKey,
    externalCalls: 0 as const
  };
}

function blockedNormalization(status: "skipped" | "failed" | "blocked-signature" | "blocked-replay" | "unsupported") {
  return {
    normalized: false,
    normalizationStatus: status,
    normalizedEventType: "unknown" as const,
    messageType: "unknown" as const,
    textPreview: null,
    textLength: null,
    mediaSummary: null,
    senderKeyDigest: null,
    roomKeyDigest: null,
    rawRoomKey: null,
    externalCalls: 0 as const
  };
}

function summarizeDryRunRouting(
  tenantId: string,
  input: ProviderWebhookSandboxEventRequest,
  normalization: ReturnType<typeof normalizeSandboxEvent>,
  signature: ReturnType<typeof verifySandboxSignature>,
  replay: ReturnType<typeof checkReplayGuardrail>
) {
  if (signature.signatureStatus === "failed") {
    return blockedRouting("blocked-signature");
  }
  if (replay.replayDetected) {
    return blockedRouting("blocked-replay");
  }
  if (!normalization.normalized) {
    return blockedRouting(normalization.normalizationStatus === "unsupported" ? "unsupported" : "skipped");
  }

  const channel = input.channel ?? input.provider;
  const channelAccountId = `sandbox:${channel}`;
  const roomKey = normalization.rawRoomKey ?? channelAccountId;
  return {
    dryRunRouting: true,
    routingStatus: "dry-run-only" as const,
    conversationLookupStatus: "not-found" as const,
    conversationKeyDigest: safeDigest(canonicalJson({
      tenantId,
      platform: input.provider,
      channelAccountId,
      roomKey
    })),
    channelAccountId,
    roomIdDigest: safeDigest(`room:${roomKey}`),
    externalCalls: 0 as const
  };
}

function blockedRouting(status: "blocked-signature" | "blocked-replay" | "unsupported" | "skipped") {
  return {
    dryRunRouting: status !== "skipped",
    routingStatus: status,
    conversationLookupStatus: "skipped" as const,
    conversationKeyDigest: null,
    channelAccountId: null,
    roomIdDigest: null,
    externalCalls: 0 as const
  };
}

function persistenceSkipped(
  inboundPersistenceStatus: ProviderWebhookEvent["inboundPersistenceStatus"],
  conversationLookupStatus: ProviderWebhookEvent["conversationLookupStatus"] | null,
  routingStatus: ProviderWebhookEvent["routingStatus"] | null = null,
  conversationId: string | null = null,
  persistedMessageId: string | null = null
) {
  return {
    inboundPersistenceStatus,
    messagePersisted: false,
    persistedMessageId,
    conversationId,
    conversationLookupStatus,
    channelAccountId: null,
    routingStatus
  };
}

function mapPrismaMessageType(messageType: ProviderWebhookMessageType): PrismaMessageType {
  if (messageType === "text") return PrismaMessageType.text;
  if (messageType === "image") return PrismaMessageType.image;
  if (messageType === "file") return PrismaMessageType.file;
  return PrismaMessageType.event;
}

function payloadEventDigest(
  tenantId: string,
  input: ProviderWebhookSandboxEventRequest,
  routing: ReturnType<typeof summarizeDryRunRouting>
) {
  return safeDigest(canonicalJson({
    tenantId,
    provider: input.provider,
    channel: input.channel ?? input.provider,
    payloadDigest: summarizePayload(input.payload).digest,
    conversationKeyDigest: routing.conversationKeyDigest
  }));
}

function inboundPersistenceAuditAction(status: ProviderWebhookEvent["inboundPersistenceStatus"]) {
  if (status === "persisted") return "provider_webhook.inbound_persistence_persisted";
  if (status === "blocked-signature") return "provider_webhook.inbound_persistence_blocked_signature";
  if (status === "blocked-replay") return "provider_webhook.inbound_persistence_blocked_replay";
  if (status === "skipped-no-match") return "provider_webhook.inbound_persistence_skipped_no_match";
  return "provider_webhook.inbound_persistence_attempted";
}

function unmatchedAuditAction(event: ProviderWebhookEvent) {
  if (event.unmatchedInboundQueued) return "provider_webhook.unmatched_inbound_queued";
  if (event.unmatchedStatus === "duplicate-skipped") return "provider_webhook.unmatched_inbound_duplicate_skipped";
  if (event.unmatchedReason === "blocked-signature") return "provider_webhook.unmatched_inbound_blocked_signature";
  return null;
}

function summarizePayload(payload: ProviderWebhookSandboxEventRequest["payload"]) {
  const descriptor = describePayload(payload);
  const fieldCount = countSafePayloadFields(payload);
  const digest = crypto.createHash("sha256").update(JSON.stringify(descriptor)).digest("hex").slice(0, 24);
  const kind = payload === null ? "null" : Array.isArray(payload) ? "array" : typeof payload;
  const summary = kind === "object" || kind === "array"
    ? `Dry-run ${kind} payload accepted with ${fieldCount} safe fields.`
    : `Dry-run ${kind} payload accepted.`;
  return {
    summary,
    fieldCount,
    digest: `sha256:${digest}`
  };
}

function verifySandboxSignature(input: ProviderWebhookSandboxEventRequest) {
  const signature = input.signature?.trim();
  if (!signature) {
    return {
      signatureVerified: false,
      signatureStatus: "missing" as const,
      signatureAlgorithm: "hmac-sha256" as const,
      signatureFingerprint: null
    };
  }

  const expected = crypto
    .createHmac("sha256", sandboxSigningMaterial(input.provider))
    .update(canonicalJson(input.payload ?? null))
    .digest("hex");
  const normalizedSignature = signature.startsWith("sha256=") ? signature.slice("sha256=".length) : signature;
  const verified = safeEqual(normalizedSignature, expected);

  return {
    signatureVerified: verified,
    signatureStatus: verified ? "verified" as const : "failed" as const,
    signatureAlgorithm: "hmac-sha256" as const,
    signatureFingerprint: `sha256:${crypto.createHash("sha256").update(`provider-webhook:${signature}`).digest("hex").slice(0, 16)}`
  };
}

function checkReplayGuardrail(tenantId: string, input: ProviderWebhookSandboxEventRequest) {
  const dedupIdentifier = input.eventId ?? input.deliveryId;
  if (!dedupIdentifier) {
    return {
      replayDetected: false,
      replayStatus: "fresh" as const,
      dedupKeyDigest: null,
      previousEventSeenAt: null
    };
  }

  const channel = input.channel ?? input.provider;
  const dedupKeyDigest = `sha256:${crypto
    .createHash("sha256")
    .update(canonicalJson({ tenantId, provider: input.provider, channel, dedupIdentifier }))
    .digest("hex")
    .slice(0, 24)}`;
  const previousEventSeenAt = dedupFirstSeenAtByDigest.get(dedupKeyDigest) ?? null;
  if (!previousEventSeenAt) {
    dedupFirstSeenAtByDigest.set(dedupKeyDigest, new Date().toISOString());
  }

  return {
    replayDetected: Boolean(previousEventSeenAt),
    replayStatus: previousEventSeenAt ? "duplicate" as const : "fresh" as const,
    dedupKeyDigest,
    previousEventSeenAt
  };
}

type ProviderPayloadSummary = {
  supported: boolean;
  normalizedEventType: ProviderWebhookNormalizedEventType;
  messageType: ProviderWebhookMessageType;
  text: string | null;
  mediaSummary: string | null;
  senderKey: string | null;
  roomKey: string | null;
};

function summarizeProviderPayload(provider: ProviderSandboxProvider, payload: unknown): ProviderPayloadSummary {
  const objectPayload = asRecord(payload);
  if (!objectPayload) return unsupportedPayloadSummary();

  if (provider === "line") return summarizeLinePayload(objectPayload);
  if (provider === "telegram") return summarizeTelegramPayload(objectPayload);
  if (provider === "facebook" || provider === "instagram") return summarizeMetaPayload(objectPayload);
  return unsupportedPayloadSummary();
}

function summarizeLinePayload(payload: Record<string, unknown>): ProviderPayloadSummary {
  const event = firstRecord(payload.events);
  if (!event) return genericMessageSummary(payload);

  const eventType = normalizeProviderEventType(asString(event.type));
  const message = asRecord(event.message);
  const source = asRecord(event.source);
  const sourceType = asString(source?.type);
  const roomKey = asString(source?.groupId) ?? asString(source?.roomId) ?? asString(source?.userId);
  const senderKey = asString(source?.userId) ?? roomKey;
  const messageType = normalizeMessageType(asString(message?.type));
  return {
    supported: eventType !== "unknown" || Boolean(message),
    normalizedEventType: message ? "message" : eventType,
    messageType,
    text: asString(message?.text),
    mediaSummary: mediaSummary(messageType, sourceType ? `source:${sourceType}` : null),
    senderKey,
    roomKey
  };
}

function summarizeTelegramPayload(payload: Record<string, unknown>): ProviderPayloadSummary {
  const callback = asRecord(payload.callback_query);
  if (callback) {
    const from = asRecord(callback.from);
    const message = asRecord(callback.message);
    const chat = asRecord(message?.chat);
    return {
      supported: true,
      normalizedEventType: "postback",
      messageType: "unknown",
      text: null,
      mediaSummary: null,
      senderKey: numberLike(from?.id),
      roomKey: numberLike(chat?.id) ?? numberLike(from?.id)
    };
  }

  const message = asRecord(payload.message) ?? asRecord(payload.edited_message);
  if (!message) return genericMessageSummary(payload);
  const from = asRecord(message.from);
  const chat = asRecord(message.chat);
  const messageType = telegramMessageType(message);
  return {
    supported: true,
    normalizedEventType: "message",
    messageType,
    text: asString(message.text) ?? asString(message.caption),
    mediaSummary: mediaSummary(messageType, attachmentDescriptor(message)),
    senderKey: numberLike(from?.id) ?? numberLike(chat?.id),
    roomKey: numberLike(chat?.id)
  };
}

function summarizeMetaPayload(payload: Record<string, unknown>): ProviderPayloadSummary {
  const entry = firstRecord(payload.entry);
  const messaging = firstRecord(entry?.messaging);
  if (messaging) {
    const sender = asRecord(messaging.sender);
    const recipient = asRecord(messaging.recipient);
    const message = asRecord(messaging.message);
    const delivery = asRecord(messaging.delivery);
    const postback = asRecord(messaging.postback);
    const messageType = metaMessageType(message);
    return {
      supported: Boolean(message || delivery || postback),
      normalizedEventType: postback ? "postback" : delivery ? "delivery" : "message",
      messageType,
      text: asString(message?.text),
      mediaSummary: mediaSummary(messageType, message ? attachmentDescriptor(message) : null),
      senderKey: asString(sender?.id),
      roomKey: asString(sender?.id) ?? asString(recipient?.id)
    };
  }

  const change = firstRecord(entry?.changes);
  const value = asRecord(change?.value);
  if (asString(change?.field) === "comments" && value) {
    const from = asRecord(value.from);
    const media = asRecord(value.media);
    return {
      supported: true,
      normalizedEventType: "message",
      messageType: "text",
      text: asString(value.text),
      mediaSummary: mediaSummary("text", "comment"),
      senderKey: asString(from?.id),
      roomKey: asString(media?.id) ?? asString(from?.id)
    };
  }

  return genericMessageSummary(payload);
}

function genericMessageSummary(payload: Record<string, unknown>): ProviderPayloadSummary {
  const message = asRecord(payload.message);
  const type = normalizeMessageType(asString(message?.type));
  return {
    supported: Boolean(message),
    normalizedEventType: message ? "message" : "unknown",
    messageType: type,
    text: asString(message?.text),
    mediaSummary: mediaSummary(type, null),
    senderKey: asString(payload.senderId) ?? asString(payload.senderKey),
    roomKey: asString(payload.roomId) ?? asString(payload.roomKey) ?? asString(payload.chatId)
  };
}

function unsupportedPayloadSummary(): ProviderPayloadSummary {
  return {
    supported: false,
    normalizedEventType: "unknown",
    messageType: "unknown",
    text: null,
    mediaSummary: null,
    senderKey: null,
    roomKey: null
  };
}

function describePayload(value: unknown, depth = 0): unknown {
  if (depth > 4) return "[depth-limit]";
  if (value === null) return "null";
  if (Array.isArray(value)) return value.slice(0, 10).map((item) => describePayload(item, depth + 1));
  if (typeof value !== "object") return typeof value;

  const output: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value as Record<string, unknown>).slice(0, 50)) {
    if (isUnsafePayloadKey(key)) continue;
    output[key] = describePayload(child, depth + 1);
  }
  return output;
}

function countSafePayloadFields(value: unknown, depth = 0): number {
  if (depth > 6 || value === null || value === undefined) return 0;
  if (Array.isArray(value)) return value.reduce((sum, item) => sum + countSafePayloadFields(item, depth + 1), 0);
  if (typeof value !== "object") return 0;

  let count = 0;
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (isUnsafePayloadKey(key)) continue;
    count += 1 + countSafePayloadFields(child, depth + 1);
  }
  return count;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function firstRecord(value: unknown): Record<string, unknown> | null {
  if (Array.isArray(value)) return asRecord(value[0]);
  return asRecord(value);
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function numberLike(value: unknown): string | null {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return asString(value);
}

function normalizeProviderEventType(value: string | null): ProviderWebhookNormalizedEventType {
  if (value === "message") return "message";
  if (value === "delivery" || value === "delivered" || value === "read") return "delivery";
  if (value === "follow") return "follow";
  if (value === "postback") return "postback";
  return "unknown";
}

function normalizeMessageType(value: string | null): ProviderWebhookMessageType {
  if (value === "text") return "text";
  if (value === "image" || value === "photo") return "image";
  if (value === "file" || value === "document" || value === "video" || value === "audio" || value === "voice") return "file";
  if (value === "sticker") return "sticker";
  return "unknown";
}

function telegramMessageType(message: Record<string, unknown>): ProviderWebhookMessageType {
  if (message.photo) return "image";
  if (message.document || message.video || message.voice || message.audio) return "file";
  if (message.sticker) return "sticker";
  if (message.text || message.caption) return "text";
  return "unknown";
}

function metaMessageType(message: Record<string, unknown> | null): ProviderWebhookMessageType {
  if (!message) return "unknown";
  if (message.text) return "text";
  const attachment = firstRecord(message.attachments);
  return normalizeMessageType(asString(attachment?.type));
}

function attachmentDescriptor(message: Record<string, unknown>) {
  if (message.photo) return "photo";
  if (message.document) return "document";
  if (message.video) return "video";
  if (message.voice || message.audio) return "audio";
  if (message.sticker) return "sticker";
  if (message.attachments) return "attachment";
  return null;
}

function mediaSummary(messageType: ProviderWebhookMessageType, descriptor: string | null) {
  if (messageType === "text" && !descriptor) return null;
  if (messageType === "unknown" && !descriptor) return null;
  return descriptor ? `${messageType} media summary: ${descriptor}` : `${messageType} media present`;
}

function safeTextPreview(value: string | null) {
  if (!value || isUnsafeText(value)) return null;
  const compact = value.replace(/\s+/g, " ").trim();
  if (!compact) return null;
  return compact.length > 80 ? `${compact.slice(0, 77)}...` : compact;
}

function isUnsafeText(value: string) {
  return /token|secret|authorization|cookie|replyToken|Bearer\s+|sk-[a-z0-9_-]{8,}|EA[A-Za-z0-9]{20,}/i.test(value);
}

function safeKeyDigest(kind: string, value: string | null) {
  return value ? safeDigest(`${kind}:${value}`) : null;
}

function safeDigest(value: string) {
  return `sha256:${crypto.createHash("sha256").update(value).digest("hex").slice(0, 24)}`;
}

function isUnsafePayloadKey(key: string) {
  return /token|secret|signature|authorization|cookie|providerraw|rawpayload|payloadjson|allowlist/i.test(key);
}

function sandboxSigningMaterial(provider: ProviderWebhookSandboxEventRequest["provider"]) {
  const providerEnvName = `${provider.toUpperCase()}_SANDBOX_WEBHOOK_SIGNING_KEY`;
  return process.env[providerEnvName]?.trim()
    || process.env.PROVIDER_WEBHOOK_SANDBOX_SIGNING_KEY?.trim()
    || "local-provider-webhook-sandbox-signing-material";
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((item) => canonicalJson(item)).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) => left.localeCompare(right));
  return `{${entries.map(([key, child]) => `${JSON.stringify(key)}:${canonicalJson(child)}`).join(",")}}`;
}

function safeEqual(actual: string, expected: string) {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(actualBuffer, expectedBuffer);
}

function normalized(value: string | undefined, fallback: string) {
  const trimmed = value?.trim().toLowerCase();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
}
