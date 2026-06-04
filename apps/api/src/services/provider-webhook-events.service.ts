import crypto from "node:crypto";
import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import {
  createProviderWebhookOperatorNoteRequestSchema,
  createProviderWebhookReviewSavedViewRequestSchema,
  providerWebhookUnmatchedInboundAssignmentRequestSchema,
  providerWebhookUnmatchedInboundBulkAssignmentRequestSchema,
  providerWebhookUnmatchedInboundBulkEscalationRequestSchema,
  providerWebhookUnmatchedInboundBulkResolutionRequestSchema,
  providerWebhookUnmatchedInboundResolutionChecklistRequestSchema,
  providerWebhookUnmatchedInboundResolutionRequestSchema,
  providerWebhookReviewSavedViewFiltersSchema,
  providerWebhookUnmatchedInboundEscalationRequestSchema,
  updateProviderWebhookReviewSavedViewRequestSchema,
  type ProviderWebhookOperatorNote,
  providerWebhookUnmatchedInboundBulkReviewRequestSchema,
  providerWebhookUnmatchedInboundLinkRequestSchema,
  providerWebhookUnmatchedInboundReviewRequestSchema,
  providerWebhookSandboxEventRequestSchema,
  type ProviderWebhookReviewSavedView,
  type ProviderWebhookReviewSavedViewFilters,
  type ProviderWebhookReviewSavedViewSort,
  type ProviderWebhookReviewAlerts,
  type ProviderWebhookReviewAlertSeverity,
  type ProviderWebhookReviewAlertsFilters,
  type ProviderWebhookReviewAlertAgeBucket,
  type ProviderWebhookReviewClosureEvidence,
  type ProviderWebhookReviewClosureEvidenceExport,
  type ProviderWebhookReviewClosureEvidenceStatus,
  type ProviderWebhookReviewClosureEvidenceSummaryItem,
  type ProviderWebhookReviewExportRedactionAudit,
  type ProviderWebhookReviewExportRedactionChecks,
  type ProviderWebhookReviewExportRedactionIssue,
  type ProviderWebhookReviewExportRedactionAuditTarget,
  type ProviderWebhookReviewExportIntegrity,
  type ProviderWebhookReviewExportManifest,
  type ProviderWebhookReviewExportManifestIntegrityStatus,
  type ProviderWebhookReviewExportManifestQaReadiness,
  type ProviderWebhookReviewClosureReport,
  type ProviderWebhookReviewClosureReportExport,
  type ProviderWebhookReviewClosureReportFilters,
  type ProviderWebhookReviewMetrics,
  type ProviderWebhookReviewMetricsFilters,
  type ProviderWebhookReviewRecommendedNextAction,
  type ProviderWebhookReviewResolutionOutcome,
  type ProviderWebhookReviewResolutionSummary,
  type ProviderWebhookReviewResolutionSummaryFilters,
  type ProviderWebhookReviewTriage,
  type ProviderWebhookReviewTriageFilters,
  type ProviderWebhookReviewTriageLane,
  type ProviderWebhookReviewWorkload,
  type ProviderWebhookReviewWorkloadFilters,
  type ProviderWebhookTriageRecommendedAction,
  type ProviderWebhookUnmatchedInboundAssignmentRequest,
  type ProviderWebhookUnmatchedInboundBulkAssignmentResponse,
  type ProviderWebhookUnmatchedInboundBulkEscalationResponse,
  type ProviderWebhookUnmatchedInboundBulkMetadataItemResult,
  type ProviderWebhookUnmatchedInboundBulkResolutionItemResult,
  type ProviderWebhookUnmatchedInboundBulkResolutionRequest,
  type ProviderWebhookUnmatchedInboundBulkResolutionResponse,
  type ProviderWebhookUnmatchedInboundBulkAssignmentRequest,
  type ProviderWebhookUnmatchedInboundBulkEscalationRequest,
  type ProviderWebhookUnmatchedInboundBulkReviewItemResult,
  type ProviderWebhookUnmatchedInboundEscalationRequest,
  type ProviderWebhookUnmatchedInboundResolutionChecklistRequest,
  type ProviderWebhookUnmatchedInboundResolutionRequest,
  type ProviderWebhookUnmatchedInboundDiagnostics,
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
  type ProviderWebhookReviewClosureChecklistItem,
  type ProviderWebhookReviewClosureChecklistStep,
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
const reviewClosureExportShapeVersion = "provider-webhook-closure-export-v1";
const reviewAlertThresholds = {
  staleWarningHours: 24,
  staleCriticalHours: 72,
  overSlaHours: 48
} as const;
const triageLanes: ProviderWebhookReviewTriageLane[] = [
  "critical_stale_open",
  "warning_stale_open",
  "candidate_lookup_recommended",
  "safe_link_candidate_available",
  "needs_manual_review",
  "recently_reviewed",
  "skipped_ignored",
  "failed_routing_missing_match"
];
const escalationReasons = [
  "none",
  "SLA_RISK",
  "NO_SAFE_CANDIDATE",
  "ROUTING_FAILED",
  "HIGH_PRIORITY_CUSTOMER",
  "NEEDS_MANAGER_REVIEW",
  "MANUAL_REVIEW_BLOCKED"
] as const;
const resolutionStatuses = ["unresolved", "resolved"] as const;
const resolutionOutcomes = [
  "none",
  "NEEDS_REVIEW",
  "REVIEWED_NO_MATCH",
  "REVIEWED_SAFE_MATCH",
  "LINKED_EXISTING_CONVERSATION",
  "LINKED_AND_PERSISTED_SAFE_MESSAGE",
  "SKIPPED_DUPLICATE",
  "SKIPPED_SPAM",
  "SKIPPED_UNSUPPORTED_EVENT",
  "ESCALATED_TO_MANAGER",
  "BLOCKED_UNSAFE",
  "ROUTING_FAILED",
  "MANUAL_REVIEW_REQUIRED"
] as const;
const closureReadinessValues = [
  "NOT_READY",
  "READY_FOR_REVIEW",
  "READY_FOR_SKIP",
  "READY_FOR_LINK",
  "READY_FOR_LINK_AND_PERSIST",
  "ALREADY_REVIEWED",
  "BLOCKED"
] as const;
const closureChecklistSteps: ProviderWebhookReviewClosureChecklistStep[] = [
  "VIEWED_DIAGNOSTICS",
  "REVIEWED_HISTORY",
  "REVIEWED_TRIAGE_GUIDANCE",
  "REVIEWED_CANDIDATES",
  "CONFIRMED_NO_RAW_LEAKAGE",
  "CONFIRMED_NO_PROVIDER_OUTBOUND",
  "CONFIRMED_ASSIGNMENT_OR_ESCALATION",
  "CONFIRMED_SAFE_LINK_TARGET",
  "CONFIRMED_OPERATOR_NOTE"
];
const triageLaneDetails: Record<ProviderWebhookReviewTriageLane, {
  label: string;
  description: string;
  safeDrilldownFilters: ProviderWebhookReviewMetricsFilters;
}> = {
  critical_stale_open: {
    label: "Critical stale open",
    description: "Open unmatched inbound items past the critical review threshold.",
    safeDrilldownFilters: { status: "open" }
  },
  warning_stale_open: {
    label: "Warning stale open",
    description: "Open unmatched inbound items past the warning review threshold.",
    safeDrilldownFilters: { status: "open" }
  },
  candidate_lookup_recommended: {
    label: "Candidate lookup recommended",
    description: "Open items where a safe candidate lookup should be run next.",
    safeDrilldownFilters: { status: "open", reviewStatus: "pending", linkStatus: "none" }
  },
  safe_link_candidate_available: {
    label: "Safe link candidate available",
    description: "Open normalized items with safe platform, channel account, and room digest context.",
    safeDrilldownFilters: { status: "open", reviewStatus: "pending", linkStatus: "none" }
  },
  needs_manual_review: {
    label: "Needs manual review",
    description: "Open items that need an operator decision before any safe action.",
    safeDrilldownFilters: { status: "open", reviewStatus: "pending" }
  },
  recently_reviewed: {
    label: "Recently reviewed",
    description: "Items already reviewed or safely linked, shown for history follow-up.",
    safeDrilldownFilters: { reviewStatus: "reviewed" }
  },
  skipped_ignored: {
    label: "Skipped / ignored",
    description: "Skipped, duplicate, or blocked items that should only be reviewed through history.",
    safeDrilldownFilters: { status: "skipped" }
  },
  failed_routing_missing_match: {
    label: "Failed routing / missing conversation match",
    description: "Items with blocked routing or missing safe conversation match context.",
    safeDrilldownFilters: { status: "open" }
  }
};
const events: ProviderWebhookEvent[] = [];
const unmatchedInboundItems: ProviderWebhookUnmatchedInboundItem[] = [];
const unmatchedInboundHistoryEntries: ProviderWebhookUnmatchedInboundHistoryEntry[] = [];
const reviewSavedViews: ProviderWebhookReviewSavedView[] = [];
const operatorNotes: ProviderWebhookOperatorNote[] = [];
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

  listUnmatchedInbound(tenantId: string, filters: ProviderWebhookUnmatchedInboundFilters | ProviderWebhookUnmatchedInboundStatusFilter = {}, actorUserId?: string) {
    const normalizedFilters = normalizeUnmatchedInboundFilters(filters);
    const filtered = filterUnmatchedInboundItems(tenantId, normalizedFilters, actorUserId);
    return normalizedFilters.limit ? filtered.slice(0, normalizedFilters.limit) : filtered;
  }

  listUnmatchedInboundPage(tenantId: string, filters: ProviderWebhookUnmatchedInboundFilters | ProviderWebhookUnmatchedInboundStatusFilter = {}, actorUserId?: string) {
    const normalizedFilters = normalizeUnmatchedInboundFilters(filters);
    const limit = normalizedFilters.limit ?? 10;
    const offset = normalizedFilters.offset ?? 0;
    const appliedSort = {
      sortBy: normalizedFilters.sortBy ?? "receivedAt" as const,
      sortOrder: normalizedFilters.sortOrder ?? "desc" as const
    };
    const filtered = filterUnmatchedInboundItems(tenantId, normalizedFilters, actorUserId);
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

  getReviewMetrics(tenantId: string, filters: ProviderWebhookReviewMetricsFilters = {}, actorUserId?: string): ProviderWebhookReviewMetrics {
    const normalizedFilters = cleanReviewMetricsFilters(filters);
    const filteredItems = filterUnmatchedInboundItems(tenantId, normalizedFilters, actorUserId);
    const filteredEvents = filterEventsForMetrics(tenantId, normalizedFilters);
    const openItems = filteredItems.filter(isOpenUnmatchedStatusItem);
    const sortedReceivedAt = [...filteredItems].map((item) => item.receivedAt).sort();
    const sortedOpenReceivedAt = [...openItems].map((item) => item.receivedAt).sort();

    return {
      generatedAt: new Date().toISOString(),
      appliedFilters: normalizedFilters,
      totalEvents: filteredEvents.length,
      totalUnmatched: filteredItems.length,
      openUnmatched: openItems.length,
      reviewedCount: filteredItems.filter((item) => item.reviewStatus === "reviewed").length,
      skippedCount: filteredItems.filter((item) => item.reviewStatus === "skipped").length,
      linkedCount: filteredItems.filter((item) => item.reviewStatus === "linked").length,
      persistedInboundCount: filteredEvents.filter((event) => event.messagePersisted).length,
      signatureRejectedCount: filteredEvents.filter((event) => event.signatureStatus === "failed").length,
      replayRejectedCount: filteredEvents.filter((event) => event.replayDetected || event.routingStatus === "blocked-replay").length,
      byProvider: countByStable(filteredItems, ["line", "telegram", "facebook", "instagram"], (item) => item.provider),
      byEventType: countByStable(filteredItems, ["message.created", "webhook.verified", "webhook.failed"], (item) => item.eventType),
      byReviewStatus: countByStable(filteredItems, ["pending", "reviewed", "skipped", "linked"], (item) => item.reviewStatus),
      byLinkStatus: countByStable(filteredItems, ["none", "rejected", "linked", "linked-message-persisted", "duplicate-noop"], (item) => item.linkStatus),
      byUnmatchedStatus: countByStable(filteredItems, ["open", "review-needed", "reviewed", "blocked", "skipped", "linked", "duplicate-skipped"], (item) => item.unmatchedStatus),
      ageBuckets: ageBucketsForOpenItems(openItems),
      funnel: {
        inboundReceived: filteredEvents.length,
        persisted: filteredEvents.filter((event) => event.messagePersisted).length,
        unmatchedQueued: filteredItems.length,
        reviewed: filteredItems.filter((item) => item.reviewStatus === "reviewed").length,
        skipped: filteredItems.filter((item) => item.reviewStatus === "skipped").length,
        linked: filteredItems.filter((item) => item.reviewStatus === "linked").length,
        exportedHistoryAvailable: filteredItems.filter((item) => buildHistoryEntriesForItem(item).length > 0).length
      },
      latestReceivedAt: sortedReceivedAt.at(-1) ?? null,
      oldestOpenReceivedAt: sortedOpenReceivedAt[0] ?? null,
      externalCalls: 0 as const
    };
  }

  getReviewAlerts(tenantId: string, filters: ProviderWebhookReviewAlertsFilters = {}, actorUserId?: string): ProviderWebhookReviewAlerts {
    const generatedAt = new Date().toISOString();
    const normalizedFilters = cleanReviewAlertsFilters(filters);
    const filteredItems = filterUnmatchedInboundItems(tenantId, normalizedFilters, actorUserId);
    const openItems = filteredItems.filter(isOpenUnmatchedStatusItem);
    const alertItems = openItems
      .map(reviewAlertItemFromUnmatched)
      .filter((item) => !normalizedFilters.severity || item.severity === normalizedFilters.severity)
      .sort((left, right) => left.receivedAt.localeCompare(right.receivedAt));
    const staleOpenCount = alertItems.filter((item) => hoursSince(item.receivedAt) >= reviewAlertThresholds.staleWarningHours).length;
    const overSlaCount = alertItems.filter((item) => hoursSince(item.receivedAt) >= reviewAlertThresholds.overSlaHours).length;

    return {
      generatedAt,
      appliedFilters: normalizedFilters,
      totalAlerts: alertItems.length,
      infoCount: alertItems.filter((item) => item.severity === "info").length,
      warningCount: alertItems.filter((item) => item.severity === "warning").length,
      criticalCount: alertItems.filter((item) => item.severity === "critical").length,
      staleOpenCount,
      overSlaCount,
      oldestOpenReceivedAt: alertItems[0]?.receivedAt ?? null,
      latestAlertGeneratedAt: alertItems.length > 0 ? generatedAt : null,
      thresholds: reviewAlertThresholds,
      byProvider: countByStable(alertItems, ["line", "telegram", "facebook", "instagram"], (item) => item.provider),
      byPlatform: countByStable(alertItems, ["line", "telegram", "facebook", "instagram"], (item) => item.platform),
      byEventType: countByStable(alertItems, ["message.created", "webhook.verified", "webhook.failed"], (item) => item.eventType),
      byReviewStatus: countByStable(alertItems, ["pending", "reviewed", "skipped", "linked"], (item) => item.reviewStatus),
      byLinkStatus: countByStable(alertItems, ["none", "rejected", "linked", "linked-message-persisted", "duplicate-noop"], (item) => item.linkStatus),
      byUnmatchedStatus: countByStable(alertItems, ["open", "review-needed", "reviewed", "blocked", "skipped", "linked", "duplicate-skipped"], (item) => item.unmatchedStatus),
      bySeverity: countByStable(alertItems, ["info", "warning", "critical"], (item) => item.severity),
      alertItems: alertItems.slice(0, 10),
      externalCalls: 0 as const
    };
  }

  getReviewTriage(tenantId: string, filters: ProviderWebhookReviewTriageFilters = {}, actorUserId?: string): ProviderWebhookReviewTriage {
    const normalizedFilters = cleanReviewTriageFilters(filters);
    const baseItems = filterUnmatchedInboundItems(tenantId, reviewTriageBaseFilters(normalizedFilters), actorUserId);
    const triageItems = baseItems
      .map(reviewTriageItemFromUnmatched)
      .filter((item) => !normalizedFilters.severity || item.severity === normalizedFilters.severity)
      .filter((item) => !normalizedFilters.triageLane || item.triageLane === normalizedFilters.triageLane)
      .sort((left, right) => {
        const severityCompared = triageSeverityRank(right.severity) - triageSeverityRank(left.severity);
        if (severityCompared !== 0) return severityCompared;
        return left.receivedAt.localeCompare(right.receivedAt);
      });
    const openItems = triageItems.filter((item) => isOpenUnmatchedStatus(item.unmatchedStatus));

    return {
      generatedAt: new Date().toISOString(),
      appliedFilters: normalizedFilters,
      totalItems: triageItems.length,
      totalOpenItems: openItems.length,
      totalTriageLanes: triageLanes.length,
      thresholds: reviewAlertThresholds,
      lanes: triageLanes.map((laneKey) => ({
        laneKey,
        label: triageLaneDetails[laneKey].label,
        severity: triageLaneSeverity(laneKey),
        count: triageItems.filter((item) => item.triageLane === laneKey).length,
        description: triageLaneDetails[laneKey].description,
        recommendedNextActions: triageActionsForLane(laneKey),
        safeDrilldownFilters: triageLaneDetails[laneKey].safeDrilldownFilters
      })),
      byProvider: countByStable(triageItems, ["line", "telegram", "facebook", "instagram"], (item) => item.provider),
      byPlatform: countByStable(triageItems, ["line", "telegram", "facebook", "instagram"], (item) => item.platform),
      byEventType: countByStable(triageItems, ["message.created", "webhook.verified", "webhook.failed"], (item) => item.eventType),
      byReviewStatus: countByStable(triageItems, ["pending", "reviewed", "skipped", "linked"], (item) => item.reviewStatus),
      byLinkStatus: countByStable(triageItems, ["none", "rejected", "linked", "linked-message-persisted", "duplicate-noop"], (item) => item.linkStatus),
      byUnmatchedStatus: countByStable(triageItems, ["open", "review-needed", "reviewed", "blocked", "skipped", "linked", "duplicate-skipped"], (item) => item.unmatchedStatus),
      byLane: countByStable(triageItems, triageLanes, (item) => item.triageLane),
      topItems: triageItems.slice(0, 10),
      externalCalls: 0 as const
    };
  }

  getReviewWorkload(tenantId: string, filters: ProviderWebhookReviewWorkloadFilters = {}, actorUserId?: string): ProviderWebhookReviewWorkload {
    const normalizedFilters = cleanReviewWorkloadFilters(filters);
    const filteredItems = filterUnmatchedInboundItems(tenantId, reviewTriageBaseFilters(normalizedFilters), actorUserId)
      .map(assignmentSummaryItemFromUnmatched)
      .filter((item) => !normalizedFilters.severity || item.severity === normalizedFilters.severity)
      .filter((item) => !normalizedFilters.triageLane || item.triageLane === normalizedFilters.triageLane)
      .sort((left, right) => right.receivedAt.localeCompare(left.receivedAt));
    const actorLabel = safeActorLabel(actorUserId);
    const openItems = filteredItems.filter((item) => isOpenUnmatchedStatus(item.unmatchedStatus));
    const assignedOpen = openItems.filter((item) => item.assignmentStatus === "assigned");
    const nowMs = Date.now();
    const recentWindowMs = 24 * 60 * 60 * 1000;

    return {
      generatedAt: new Date().toISOString(),
      appliedFilters: normalizedFilters,
      totalItems: filteredItems.length,
      totalOpenItems: openItems.length,
      thresholds: reviewAlertThresholds,
      counts: {
        unassignedOpen: openItems.filter((item) => item.assignmentStatus === "unassigned").length,
        assignedToMeOpen: openItems.filter((item) => item.assignedToOperatorLabel === actorLabel).length,
        assignedToOthersOpen: openItems.filter((item) => item.assignmentStatus === "assigned" && item.assignedToOperatorLabel !== actorLabel).length,
        assignedOpen: assignedOpen.length,
        escalatedOpen: openItems.filter((item) => item.escalationStatus === "escalated").length,
        overdueAssignedOpen: assignedOpen.filter((item) => hoursSince(item.assignedAt ?? item.receivedAt) >= reviewAlertThresholds.overSlaHours).length,
        recentlyAssigned: filteredItems.filter((item) => item.assignedAt && nowMs - new Date(item.assignedAt).getTime() <= recentWindowMs).length,
        recentlyEscalated: filteredItems.filter((item) => item.escalatedAt && nowMs - new Date(item.escalatedAt).getTime() <= recentWindowMs).length,
        resolvedAssigned: filteredItems.filter((item) => item.assignmentStatus === "assigned" && !isOpenUnmatchedStatus(item.unmatchedStatus)).length,
        unresolvedOpen: openItems.filter((item) => item.resolutionStatus === "unresolved").length,
        readyForClosure: openItems.filter((item) =>
          item.closureReadiness === "READY_FOR_REVIEW" ||
          item.closureReadiness === "READY_FOR_SKIP" ||
          item.closureReadiness === "READY_FOR_LINK" ||
          item.closureReadiness === "READY_FOR_LINK_AND_PERSIST"
        ).length,
        blockedResolution: openItems.filter((item) => item.closureReadiness === "BLOCKED").length,
        checklistIncompleteOpen: openItems.filter((item) => item.checklistCompletedCount < item.checklistTotalCount).length
      },
      byAssignee: countByDynamic(filteredItems, (item) => item.assignedToOperatorLabel ?? "unassigned"),
      byAssignmentStatus: countByStable(filteredItems, ["unassigned", "assigned"], (item) => item.assignmentStatus),
      byEscalationStatus: countByStable(filteredItems, ["none", "escalated"], (item) => item.escalationStatus),
      byEscalationReason: countByStable(filteredItems, escalationReasons, (item) => item.escalationReason ?? "none"),
      byProvider: countByStable(filteredItems, ["line", "telegram", "facebook", "instagram"], (item) => item.provider),
      byPlatform: countByStable(filteredItems, ["line", "telegram", "facebook", "instagram"], (item) => item.platform),
      byReviewStatus: countByStable(filteredItems, ["pending", "reviewed", "skipped", "linked"], (item) => item.reviewStatus),
      byLinkStatus: countByStable(filteredItems, ["none", "rejected", "linked", "linked-message-persisted", "duplicate-noop"], (item) => item.linkStatus),
      byUnmatchedStatus: countByStable(filteredItems, ["open", "review-needed", "reviewed", "blocked", "skipped", "linked", "duplicate-skipped"], (item) => item.unmatchedStatus),
      topAssignedItems: filteredItems.filter((item) => item.assignmentStatus === "assigned").slice(0, 10),
      topEscalatedItems: filteredItems.filter((item) => item.escalationStatus === "escalated").slice(0, 10),
      externalCalls: 0 as const
    };
  }

  getReviewResolutionSummary(tenantId: string, filters: ProviderWebhookReviewResolutionSummaryFilters = {}, actorUserId?: string): ProviderWebhookReviewResolutionSummary {
    const normalizedFilters = cleanReviewResolutionSummaryFilters(filters);
    const filteredItems = filterUnmatchedInboundItems(tenantId, reviewTriageBaseFilters(normalizedFilters), actorUserId)
      .map(resolutionSummaryItemFromUnmatched)
      .filter((item) => !normalizedFilters.severity || item.severity === normalizedFilters.severity)
      .filter((item) => !normalizedFilters.triageLane || item.triageLane === normalizedFilters.triageLane)
      .filter((item) => !normalizedFilters.resolutionStatus || item.resolutionStatus === normalizedFilters.resolutionStatus)
      .filter((item) => !normalizedFilters.resolutionOutcome || item.resolutionOutcome === normalizedFilters.resolutionOutcome)
      .filter((item) => !normalizedFilters.closureReadiness || item.closureReadiness === normalizedFilters.closureReadiness)
      .filter((item) => normalizedFilters.checklistIncomplete === undefined || (item.checklistCompletedCount < item.checklistTotalCount) === normalizedFilters.checklistIncomplete)
      .sort((left, right) => right.receivedAt.localeCompare(left.receivedAt));
    const openItems = filteredItems.filter((item) => isOpenUnmatchedStatus(item.unmatchedStatus));
    const nowMs = Date.now();
    const recentWindowMs = 24 * 60 * 60 * 1000;

    return {
      generatedAt: new Date().toISOString(),
      appliedFilters: normalizedFilters,
      totalItems: filteredItems.length,
      totalOpenItems: openItems.length,
      thresholds: reviewAlertThresholds,
      counts: {
        unresolvedOpen: openItems.filter((item) => item.resolutionStatus === "unresolved").length,
        readyForReview: openItems.filter((item) => item.closureReadiness === "READY_FOR_REVIEW").length,
        readyForSkip: openItems.filter((item) => item.closureReadiness === "READY_FOR_SKIP").length,
        readyForLink: openItems.filter((item) => item.closureReadiness === "READY_FOR_LINK").length,
        readyForLinkAndPersist: openItems.filter((item) => item.closureReadiness === "READY_FOR_LINK_AND_PERSIST").length,
        blocked: openItems.filter((item) => item.closureReadiness === "BLOCKED").length,
        resolvedRecently: filteredItems.filter((item) => item.resolvedAt && nowMs - new Date(item.resolvedAt).getTime() <= recentWindowMs).length,
        checklistIncompleteOpen: openItems.filter((item) => item.checklistCompletedCount < item.checklistTotalCount).length
      },
      byResolutionStatus: countByStable(filteredItems, resolutionStatuses, (item) => item.resolutionStatus),
      byResolutionOutcome: countByStable(filteredItems, resolutionOutcomes, (item) => item.resolutionOutcome ?? "none"),
      byClosureReadiness: countByStable(filteredItems, closureReadinessValues, (item) => item.closureReadiness),
      byChecklistStep: countByStable(filteredItems.flatMap((item) => item.closureChecklist.filter((step) => step.completed)), closureChecklistSteps, (step) => step.step),
      byProvider: countByStable(filteredItems, ["line", "telegram", "facebook", "instagram"], (item) => item.provider),
      byPlatform: countByStable(filteredItems, ["line", "telegram", "facebook", "instagram"], (item) => item.platform),
      byReviewStatus: countByStable(filteredItems, ["pending", "reviewed", "skipped", "linked"], (item) => item.reviewStatus),
      byLinkStatus: countByStable(filteredItems, ["none", "rejected", "linked", "linked-message-persisted", "duplicate-noop"], (item) => item.linkStatus),
      byUnmatchedStatus: countByStable(filteredItems, ["open", "review-needed", "reviewed", "blocked", "skipped", "linked", "duplicate-skipped"], (item) => item.unmatchedStatus),
      topReadyItems: filteredItems.filter((item) =>
        item.closureReadiness === "READY_FOR_REVIEW" ||
        item.closureReadiness === "READY_FOR_SKIP" ||
        item.closureReadiness === "READY_FOR_LINK" ||
        item.closureReadiness === "READY_FOR_LINK_AND_PERSIST"
      ).slice(0, 10),
      topBlockedItems: filteredItems.filter((item) => item.closureReadiness === "BLOCKED").slice(0, 10),
      externalCalls: 0 as const
    };
  }

  getUnmatchedInboundClosureEvidence(tenantId: string, id: string): ProviderWebhookReviewClosureEvidence {
    const item = findUnmatchedInboundItem(tenantId, id);
    if (!item) throw new NotFoundException("Unmatched inbound item not found");
    return {
      generatedAt: new Date().toISOString(),
      ...closureEvidenceSummaryItemFromUnmatched(item)
    };
  }

  getUnmatchedInboundClosureEvidenceExport(tenantId: string, id: string): ProviderWebhookReviewClosureEvidenceExport {
    const evidence = this.getUnmatchedInboundClosureEvidence(tenantId, id);
    return {
      ...evidence,
      exportKind: "closure-evidence",
      format: "json",
      contentType: "application/json",
      safeFilename: safeExportFilename(`provider-webhook-closure-evidence-${evidence.provider}-${evidence.unmatchedId}.json`),
      exportedAt: new Date().toISOString()
    };
  }

  getReviewClosureReport(tenantId: string, filters: ProviderWebhookReviewClosureReportFilters = {}, actorUserId?: string): ProviderWebhookReviewClosureReport {
    const { normalizedFilters, filteredItems } = this.getClosureReportItems(tenantId, filters, actorUserId);
    const openItems = filteredItems.filter((item) => isOpenUnmatchedStatus(item.unmatchedStatus));

    return {
      generatedAt: new Date().toISOString(),
      appliedFilters: normalizedFilters,
      totalItems: filteredItems.length,
      totalOpenItems: openItems.length,
      evidenceReadyCount: filteredItems.filter((item) => item.evidenceStatus === "ready").length,
      evidenceBlockedCount: filteredItems.filter((item) => item.evidenceStatus === "blocked").length,
      evidenceIncompleteCount: filteredItems.filter((item) => item.evidenceStatus === "incomplete").length,
      byClosureReadiness: countByStable(filteredItems, closureReadinessValues, (item) => item.closureReadiness),
      byResolutionOutcome: countByStable(filteredItems, resolutionOutcomes, (item) => item.resolutionOutcome ?? "none"),
      byChecklistStep: countByStable(filteredItems.flatMap((item) => item.checklistIncompleteSteps), closureChecklistSteps, (step) => step),
      byAssignmentStatus: countByStable(filteredItems, ["unassigned", "assigned"], (item) => item.assignmentStatus),
      byEscalationStatus: countByStable(filteredItems, ["none", "escalated"], (item) => item.escalationStatus),
      topEvidenceReadyItems: filteredItems.filter((item) => item.evidenceStatus === "ready").slice(0, 10),
      topEvidenceBlockedItems: filteredItems.filter((item) => item.evidenceStatus === "blocked").slice(0, 10),
      externalCalls: 0 as const
    };
  }

  getReviewClosureReportExport(tenantId: string, filters: ProviderWebhookReviewClosureReportFilters = {}, actorUserId?: string): ProviderWebhookReviewClosureReportExport {
    const report = this.getReviewClosureReport(tenantId, filters, actorUserId);
    return {
      ...report,
      exportKind: "closure-report",
      format: "json",
      contentType: "application/json",
      safeFilename: safeExportFilename("provider-webhook-review-closure-report.json"),
      exportedAt: new Date().toISOString()
    };
  }

  getUnmatchedInboundClosureEvidenceRedactionAudit(tenantId: string, id: string): ProviderWebhookReviewExportRedactionAudit {
    const item = findUnmatchedInboundItem(tenantId, id);
    if (!item) throw new NotFoundException("Unmatched inbound item not found");
    const exportPayload = this.getUnmatchedInboundClosureEvidenceExport(tenantId, id);
    return buildExportRedactionAudit({
      auditTarget: "closure-evidence-export",
      exportPayload,
      unmatchedId: id,
      tenantScoped: exportPayload.unmatchedId === id,
      safeRoomDigestPresent: Boolean(exportPayload.roomKeyDigest)
    });
  }

  getReviewClosureReportRedactionAudit(
    tenantId: string,
    filters: ProviderWebhookReviewClosureReportFilters = {},
    actorUserId?: string
  ): ProviderWebhookReviewExportRedactionAudit {
    const exportPayload = this.getReviewClosureReportExport(tenantId, filters, actorUserId);
    return buildExportRedactionAudit({
      auditTarget: "closure-report-export",
      exportPayload,
      appliedFilters: exportPayload.appliedFilters,
      tenantScoped: true,
      safeRoomDigestPresent: exportPayload.totalItems === 0 || [
        ...exportPayload.topEvidenceReadyItems,
        ...exportPayload.topEvidenceBlockedItems
      ].every((item) => Boolean(item.roomKeyDigest))
    });
  }

  getReviewClosureExportIntegrity(
    tenantId: string,
    filters: ProviderWebhookReviewClosureReportFilters = {},
    actorUserId?: string
  ): ProviderWebhookReviewExportIntegrity {
    const { normalizedFilters, filteredItems } = this.getClosureReportItems(tenantId, filters, actorUserId);
    const reportExport = this.getReviewClosureReportExport(tenantId, normalizedFilters, actorUserId);
    const itemAudits = filteredItems.map((item) => buildExportRedactionAudit({
      auditTarget: "closure-evidence-export",
      exportPayload: {
        ...item,
        generatedAt: reportExport.generatedAt,
        exportKind: "closure-evidence" as const,
        format: "json" as const,
        contentType: "application/json" as const,
        safeFilename: safeExportFilename(`provider-webhook-closure-evidence-${item.provider}-${item.unmatchedId}.json`),
        exportedAt: reportExport.exportedAt
      },
      unmatchedId: item.unmatchedId,
      tenantScoped: true,
      safeRoomDigestPresent: Boolean(item.roomKeyDigest)
    }));
    const safeReportDigest = safeDigestForExport(reportExport);

    return {
      generatedAt: new Date().toISOString(),
      appliedFilters: normalizedFilters,
      externalCalls: 0 as const,
      totalCheckedItems: itemAudits.length,
      redactionPassedCount: itemAudits.filter((audit) => audit.status === "passed").length,
      redactionWarningCount: itemAudits.filter((audit) => audit.status === "warning").length,
      redactionBlockedCount: itemAudits.filter((audit) => audit.status === "blocked").length,
      deterministicExportConfirmed: safeReportDigest === safeDigestForExport(reportExport),
      exportShapeVersion: reviewClosureExportShapeVersion,
      safeReportDigest
    };
  }

  getUnmatchedInboundClosureEvidenceExportManifest(tenantId: string, id: string): ProviderWebhookReviewExportManifest {
    const exportPayload = this.getUnmatchedInboundClosureEvidenceExport(tenantId, id);
    const redactionAudit = this.getUnmatchedInboundClosureEvidenceRedactionAudit(tenantId, id);
    const redactionCounts = redactionCountsForStatus(redactionAudit.status);
    const integrityStatus = exportManifestIntegrityStatus({
      redactionStatus: redactionAudit.status,
      deterministicExportConfirmed: redactionAudit.checks.exportDeterministic,
      redactionWarningCount: redactionCounts.redactionWarningCount,
      redactionBlockedCount: redactionCounts.redactionBlockedCount
    });
    const manualQaReadiness = exportManifestQaReadiness({
      integrityStatus,
      redactionWarningCount: redactionCounts.redactionWarningCount,
      redactionBlockedCount: redactionCounts.redactionBlockedCount,
      evidenceBlockedCount: exportPayload.evidenceStatus === "blocked" ? 1 : 0,
      evidenceIncompleteCount: exportPayload.evidenceStatus === "incomplete" ? 1 : 0
    });

    return buildExportManifest({
      manifestTarget: "closure-evidence-export",
      exportKind: exportPayload.exportKind,
      format: exportPayload.format,
      contentType: exportPayload.contentType,
      safeFilename: exportPayload.safeFilename,
      exportedAt: exportPayload.exportedAt,
      unmatchedId: exportPayload.unmatchedId,
      totalItems: 1,
      totalOpenItems: isOpenUnmatchedStatus(exportPayload.unmatchedStatus) ? 1 : 0,
      evidenceReadyCount: exportPayload.evidenceStatus === "ready" ? 1 : 0,
      evidenceBlockedCount: exportPayload.evidenceStatus === "blocked" ? 1 : 0,
      evidenceIncompleteCount: exportPayload.evidenceStatus === "incomplete" ? 1 : 0,
      redactionAudit,
      ...redactionCounts,
      integrityStatus,
      deterministicExportConfirmed: redactionAudit.checks.exportDeterministic,
      safeDigest: redactionAudit.safeDigest,
      manualQaReadiness
    });
  }

  getReviewClosureReportExportManifest(
    tenantId: string,
    filters: ProviderWebhookReviewClosureReportFilters = {},
    actorUserId?: string
  ): ProviderWebhookReviewExportManifest {
    const exportPayload = this.getReviewClosureReportExport(tenantId, filters, actorUserId);
    const redactionAudit = this.getReviewClosureReportRedactionAudit(tenantId, exportPayload.appliedFilters, actorUserId);
    const integrity = this.getReviewClosureExportIntegrity(tenantId, exportPayload.appliedFilters, actorUserId);
    const integrityStatus = exportManifestIntegrityStatus({
      redactionStatus: redactionAudit.status,
      deterministicExportConfirmed: integrity.deterministicExportConfirmed,
      redactionWarningCount: integrity.redactionWarningCount,
      redactionBlockedCount: integrity.redactionBlockedCount
    });
    const manualQaReadiness = exportManifestQaReadiness({
      integrityStatus,
      redactionWarningCount: integrity.redactionWarningCount,
      redactionBlockedCount: integrity.redactionBlockedCount,
      evidenceBlockedCount: exportPayload.evidenceBlockedCount,
      evidenceIncompleteCount: exportPayload.evidenceIncompleteCount
    });

    return buildExportManifest({
      manifestTarget: "closure-report-export",
      exportKind: exportPayload.exportKind,
      format: exportPayload.format,
      contentType: exportPayload.contentType,
      safeFilename: exportPayload.safeFilename,
      exportedAt: exportPayload.exportedAt,
      appliedFilters: exportPayload.appliedFilters,
      totalItems: exportPayload.totalItems,
      totalOpenItems: exportPayload.totalOpenItems,
      evidenceReadyCount: exportPayload.evidenceReadyCount,
      evidenceBlockedCount: exportPayload.evidenceBlockedCount,
      evidenceIncompleteCount: exportPayload.evidenceIncompleteCount,
      redactionAudit,
      redactionPassedCount: integrity.redactionPassedCount,
      redactionWarningCount: integrity.redactionWarningCount,
      redactionBlockedCount: integrity.redactionBlockedCount,
      integrityStatus,
      deterministicExportConfirmed: integrity.deterministicExportConfirmed,
      safeDigest: redactionAudit.safeDigest,
      safeReportDigest: integrity.safeReportDigest,
      manualQaReadiness
    });
  }

  private getClosureReportItems(tenantId: string, filters: ProviderWebhookReviewClosureReportFilters = {}, actorUserId?: string) {
    const normalizedFilters = cleanReviewClosureReportFilters(filters);
    const filteredItems = filterUnmatchedInboundItems(tenantId, reviewTriageBaseFilters(normalizedFilters), actorUserId)
      .map(closureEvidenceSummaryItemFromUnmatched)
      .filter((item) => !normalizedFilters.severity || item.severity === normalizedFilters.severity)
      .filter((item) => !normalizedFilters.triageLane || item.triageLane === normalizedFilters.triageLane)
      .sort((left, right) => right.receivedAt.localeCompare(left.receivedAt));
    return { normalizedFilters, filteredItems };
  }

  async resolveUnmatchedInbound(tenantId: string, unmatchedId: string, body: unknown, actorUserId?: string) {
    const parsed = providerWebhookUnmatchedInboundResolutionRequestSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException("Invalid provider webhook resolution request");
    const item = findUnmatchedInboundItem(tenantId, unmatchedId);
    if (!item) throw new NotFoundException("Unmatched inbound item not found");
    await this.applyResolutionToItem(tenantId, item, parsed.data, actorUserId, false);
    return snapshotUnmatchedInboundItem(item);
  }

  async updateUnmatchedInboundChecklist(tenantId: string, unmatchedId: string, body: unknown, actorUserId?: string) {
    const parsed = providerWebhookUnmatchedInboundResolutionChecklistRequestSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException("Invalid provider webhook resolution checklist request");
    const item = findUnmatchedInboundItem(tenantId, unmatchedId);
    if (!item) throw new NotFoundException("Unmatched inbound item not found");
    await this.applyChecklistToItem(tenantId, item, parsed.data, actorUserId, false);
    return snapshotUnmatchedInboundItem(item);
  }

  async bulkResolveUnmatchedInbound(tenantId: string, body: unknown, actorUserId?: string): Promise<ProviderWebhookUnmatchedInboundBulkResolutionResponse> {
    const parsed = providerWebhookUnmatchedInboundBulkResolutionRequestSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException("Invalid provider webhook bulk resolution request");
    const input = parsed.data;
    const uniqueIds = Array.from(new Set(input.ids.map((id) => id.trim()).filter(Boolean)));
    const results: ProviderWebhookUnmatchedInboundBulkResolutionItemResult[] = [];
    for (const id of uniqueIds) {
      const item = findUnmatchedInboundItem(tenantId, id);
      if (!item) {
        results.push(bulkResolutionResult(id, false, "not-found", null, null, null, null, null, "Unmatched inbound item not found"));
        continue;
      }
      const before = resolutionFingerprint(item);
      if (input.operation === "SET_RESOLUTION" || input.operation === "CLEAR_RESOLUTION") {
        await this.applyResolutionToItem(tenantId, item, {
          operation: input.operation,
          resolutionOutcome: input.resolutionOutcome,
          note: input.note
        }, actorUserId, true);
      } else {
        await this.applyChecklistToItem(tenantId, item, {
          operation: input.operation === "COMPLETE_STEP" ? "COMPLETE_STEP" : "RESET_CHECKLIST",
          step: input.step
        }, actorUserId, true);
      }
      results.push(bulkResolutionResult(
        item.id,
        true,
        before === resolutionFingerprint(item) ? "already-applied" : "updated",
        item.resolutionStatus,
        item.resolutionOutcome,
        item.closureReadiness,
        item.checklistCompletedCount,
        item.checklistTotalCount,
        null
      ));
    }
    return {
      operation: input.operation,
      results,
      summary: bulkResolutionSummary(input.ids.length, uniqueIds.length, results),
      externalCalls: 0 as const
    };
  }

  listReviewSavedViews(tenantId: string): ProviderWebhookReviewSavedView[] {
    return reviewSavedViews
      .filter((view) => view.tenantId === tenantId && !view.archived)
      .sort((left, right) => {
        if (left.pinned !== right.pinned) return left.pinned ? -1 : 1;
        if (left.isDefault !== right.isDefault) return left.isDefault ? -1 : 1;
        return right.updatedAt.localeCompare(left.updatedAt);
      });
  }

  createReviewSavedView(tenantId: string, body: unknown, actorUserId?: string): ProviderWebhookReviewSavedView {
    const parsed = createProviderWebhookReviewSavedViewRequestSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException("Invalid provider webhook review saved view request");
    rejectUnsafeSavedViewInput(parsed.data);

    const now = new Date().toISOString();
    const view: ProviderWebhookReviewSavedView = {
      id: `provider-webhook-review-view-${crypto.randomUUID()}`,
      name: parsed.data.name,
      description: safeOptionalDescription(parsed.data.description),
      tenantId,
      ownerId: safeActorId(actorUserId),
      createdBy: safeActorLabel(actorUserId),
      filters: cleanSavedViewFilters(parsed.data.filters),
      sort: normalizeSavedViewSort(parsed.data.sort),
      pinned: parsed.data.pinned,
      isDefault: parsed.data.isDefault,
      archived: false,
      createdAt: now,
      updatedAt: now,
      externalCalls: 0 as const
    };
    if (view.isDefault) clearDefaultSavedViews(tenantId);
    reviewSavedViews.unshift(view);
    return view;
  }

  updateReviewSavedView(tenantId: string, id: string, body: unknown, actorUserId?: string): ProviderWebhookReviewSavedView {
    void actorUserId;
    const parsed = updateProviderWebhookReviewSavedViewRequestSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException("Invalid provider webhook review saved view update request");
    rejectUnsafeSavedViewInput(parsed.data);

    const view = findReviewSavedView(tenantId, id);
    if (!view) throw new NotFoundException("Provider webhook review saved view not found");
    if (view.archived) throw new ConflictException("Provider webhook review saved view is archived");

    if (parsed.data.name !== undefined) view.name = parsed.data.name;
    if (parsed.data.description !== undefined) view.description = safeOptionalDescription(parsed.data.description ?? undefined);
    if (parsed.data.filters !== undefined) view.filters = cleanSavedViewFilters(parsed.data.filters);
    if (parsed.data.sort !== undefined) view.sort = normalizeSavedViewSort(parsed.data.sort);
    if (parsed.data.pinned !== undefined) view.pinned = parsed.data.pinned;
    if (parsed.data.isDefault !== undefined) {
      if (parsed.data.isDefault) clearDefaultSavedViews(tenantId, view.id);
      view.isDefault = parsed.data.isDefault;
    }
    view.updatedAt = new Date().toISOString();
    view.externalCalls = 0;
    return view;
  }

  archiveReviewSavedView(tenantId: string, id: string, actorUserId?: string): ProviderWebhookReviewSavedView {
    void actorUserId;
    const view = findReviewSavedView(tenantId, id);
    if (!view) throw new NotFoundException("Provider webhook review saved view not found");
    view.archived = true;
    view.isDefault = false;
    view.updatedAt = new Date().toISOString();
    view.externalCalls = 0;
    return view;
  }

  listOperatorNotes(tenantId: string, unmatchedId: string): ProviderWebhookOperatorNote[] {
    const item = findUnmatchedInboundItem(tenantId, unmatchedId);
    if (!item) throw new NotFoundException("Unmatched inbound item not found");
    return operatorNotes
      .filter((note) => note.tenantId === tenantId && note.unmatchedId === unmatchedId)
      .sort((left, right) => left.createdAt.localeCompare(right.createdAt));
  }

  async createOperatorNote(tenantId: string, unmatchedId: string, body: unknown, actorUserId?: string): Promise<ProviderWebhookOperatorNote> {
    const parsed = createProviderWebhookOperatorNoteRequestSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException("Invalid provider webhook operator note request");
    if (hasUnsafeSecretPattern(parsed.data.note)) throw new BadRequestException("Operator note contains unsafe provider or credential content");

    const item = findUnmatchedInboundItem(tenantId, unmatchedId);
    if (!item) throw new NotFoundException("Unmatched inbound item not found");
    const now = new Date().toISOString();
    const note: ProviderWebhookOperatorNote = {
      id: `provider-webhook-operator-note-${crypto.randomUUID()}`,
      unmatchedId: item.id,
      tenantId,
      authorId: safeActorId(actorUserId),
      authorLabel: safeActorLabel(actorUserId),
      note: parsed.data.note,
      context: operatorNoteContext(item),
      createdAt: now,
      updatedAt: now,
      externalCalls: 0 as const
    };
    operatorNotes.push(note);
    item.lastOperatorNoteAt = now;
    item.externalCalls = 0;
    addUnmatchedHistoryEntry(item, {
      action: "operator_note_created",
      actionStatus: "created",
      statusBefore: item.unmatchedStatus,
      statusAfter: item.unmatchedStatus,
      actor: note.authorId,
      reason: "operator note",
      message: note.note,
      actionAt: now,
      receivedAt: item.receivedAt
    });
    await this.recordOperatorNoteAudit(tenantId, actorUserId, item, note);
    return note;
  }

  async assignUnmatchedInbound(tenantId: string, unmatchedId: string, body: unknown, actorUserId?: string) {
    const parsed = providerWebhookUnmatchedInboundAssignmentRequestSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException("Invalid provider webhook assignment request");
    return this.applyAssignment(tenantId, unmatchedId, parsed.data, actorUserId, false);
  }

  async bulkAssignUnmatchedInbound(tenantId: string, body: unknown, actorUserId?: string): Promise<ProviderWebhookUnmatchedInboundBulkAssignmentResponse> {
    const parsed = providerWebhookUnmatchedInboundBulkAssignmentRequestSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException("Invalid provider webhook bulk assignment request");

    const input = parsed.data;
    const uniqueIds = Array.from(new Set(input.ids.map((id) => id.trim()).filter(Boolean)));
    const results: ProviderWebhookUnmatchedInboundBulkMetadataItemResult[] = [];
    for (const id of uniqueIds) {
      const item = findUnmatchedInboundItem(tenantId, id);
      if (!item) {
        results.push(bulkMetadataResult(id, false, "not-found", null, null, null, "Unmatched inbound item not found"));
        continue;
      }
      const before = metadataFingerprint(item);
      await this.applyAssignmentToItem(tenantId, item, input, actorUserId, true);
      results.push(bulkMetadataResult(
        item.id,
        true,
        before === metadataFingerprint(item) ? "already-applied" : "updated",
        item.assignmentStatus,
        item.escalationStatus,
        item.escalationReason,
        null
      ));
    }
    return {
      operation: input.operation,
      results,
      summary: bulkMetadataSummary(input.ids.length, uniqueIds.length, results),
      externalCalls: 0 as const
    };
  }

  async escalateUnmatchedInbound(tenantId: string, unmatchedId: string, body: unknown, actorUserId?: string) {
    const parsed = providerWebhookUnmatchedInboundEscalationRequestSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException("Invalid provider webhook escalation request");
    return this.applyEscalation(tenantId, unmatchedId, parsed.data, actorUserId, false);
  }

  async bulkEscalateUnmatchedInbound(tenantId: string, body: unknown, actorUserId?: string): Promise<ProviderWebhookUnmatchedInboundBulkEscalationResponse> {
    const parsed = providerWebhookUnmatchedInboundBulkEscalationRequestSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException("Invalid provider webhook bulk escalation request");

    const input = parsed.data;
    const uniqueIds = Array.from(new Set(input.ids.map((id) => id.trim()).filter(Boolean)));
    const results: ProviderWebhookUnmatchedInboundBulkMetadataItemResult[] = [];
    for (const id of uniqueIds) {
      const item = findUnmatchedInboundItem(tenantId, id);
      if (!item) {
        results.push(bulkMetadataResult(id, false, "not-found", null, null, null, "Unmatched inbound item not found"));
        continue;
      }
      const before = metadataFingerprint(item);
      await this.applyEscalationToItem(tenantId, item, input, actorUserId, true);
      results.push(bulkMetadataResult(
        item.id,
        true,
        before === metadataFingerprint(item) ? "already-applied" : "updated",
        item.assignmentStatus,
        item.escalationStatus,
        item.escalationReason,
        null
      ));
    }
    return {
      operation: input.operation,
      results,
      summary: bulkMetadataSummary(input.ids.length, uniqueIds.length, results),
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

  getUnmatchedInboundDiagnostics(tenantId: string, id: string): ProviderWebhookUnmatchedInboundDiagnostics {
    const item = findUnmatchedInboundItem(tenantId, id);
    if (!item) throw new NotFoundException("Unmatched inbound item not found");
    const event = findEventForUnmatchedItem(item);
    const historyEntries = buildHistoryEntriesForItem(item);
    return {
      unmatchedId: item.id,
      provider: item.provider,
      platform: item.provider,
      channelAccountId: item.channelAccountId,
      safeRoomLabel: safeRoomLabel(item),
      roomKeyDigest: item.roomKeyDigest,
      eventType: item.eventType,
      receivedAt: item.receivedAt,
      reviewStatus: item.reviewStatus,
      linkStatus: item.linkStatus,
      unmatchedStatus: item.unmatchedStatus,
      assignmentStatus: item.assignmentStatus,
      assignedToOperatorLabel: item.assignedToOperatorLabel,
      assignedAt: item.assignedAt,
      assignedByOperatorLabel: item.assignedByOperatorLabel,
      escalationStatus: item.escalationStatus,
      escalationReason: item.escalationReason,
      escalatedAt: item.escalatedAt,
      escalatedByOperatorLabel: item.escalatedByOperatorLabel,
      resolutionStatus: item.resolutionStatus,
      resolutionOutcome: item.resolutionOutcome,
      resolvedAt: item.resolvedAt,
      resolvedByOperatorLabel: item.resolvedByOperatorLabel,
      closureReadiness: item.closureReadiness,
      closureChecklist: item.closureChecklist,
      checklistCompletedCount: item.checklistCompletedCount,
      checklistTotalCount: item.checklistTotalCount,
      checklistIncompleteSteps: item.checklistIncompleteSteps,
      recommendedNextActions: item.recommendedNextActions,
      lastOperatorNoteAt: item.lastOperatorNoteAt,
      routingOutcome: `${item.routingStatus}/${item.conversationLookupStatus}`,
      normalizedEventType: item.normalizedEventType,
      persistenceOutcome: event?.inboundPersistenceStatus ?? (item.messagePersisted ? "persisted" : "not-persisted"),
      candidateLookupAvailable: isSafeLinkableUnmatchedItem(item),
      historyAvailable: historyEntries.length > 0,
      exportAvailable: true,
      lastActionAt: latestItemActivityAt(item),
      safeWarnings: {
        signatureRejected: event?.signatureStatus === "failed" || item.routingStatus === "blocked-signature",
        replayDuplicate: event?.replayDetected === true || item.routingStatus === "blocked-replay" || item.unmatchedStatus === "duplicate-skipped",
        missingConversationMatch: item.conversationLookupStatus === "not-found",
        staleOpenItem: isStaleOpenUnmatchedItem(item)
      },
      externalCalls: 0 as const
    };
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
    item.candidatesAvailable = isSafeLinkableUnmatchedItem(item);

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
      item.candidatesAvailable = isSafeLinkableUnmatchedItem(item);

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
    item.candidatesAvailable = isSafeLinkableUnmatchedItem(item);

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

  private async applyAssignment(
    tenantId: string,
    unmatchedId: string,
    input: ProviderWebhookUnmatchedInboundAssignmentRequest,
    actorUserId: string | undefined,
    bulk: boolean
  ) {
    const item = findUnmatchedInboundItem(tenantId, unmatchedId);
    if (!item) throw new NotFoundException("Unmatched inbound item not found");
    await this.applyAssignmentToItem(tenantId, item, input, actorUserId, bulk);
    return item;
  }

  private async applyAssignmentToItem(
    tenantId: string,
    item: ProviderWebhookUnmatchedInboundItem,
    input: ProviderWebhookUnmatchedInboundAssignmentRequest | ProviderWebhookUnmatchedInboundBulkAssignmentRequest,
    actorUserId: string | undefined,
    bulk: boolean
  ) {
    const actorLabel = safeActorLabel(actorUserId);
    const note = safeMetadataNote(input.note);
    const beforeStatus = item.assignmentStatus;
    const beforeLabel = item.assignedToOperatorLabel;
    const now = new Date().toISOString();
    let action: ProviderWebhookUnmatchedInboundHistoryAction;
    let actionStatus: string;
    let reason: string | null = note;

    if (input.operation === "UNASSIGN") {
      item.assignmentStatus = "unassigned";
      item.assignedToOperatorLabel = null;
      item.assignedAt = null;
      item.assignedByOperatorLabel = actorLabel;
      action = bulk ? "bulk_unassigned" : "unassigned";
      actionStatus = "unassigned";
      reason = note ?? "assignment cleared";
    } else {
      const assignedTo = input.operation === "ASSIGN_TO_ME"
        ? actorLabel
        : safeOperatorLabel(input.assignedToOperatorLabel);
      if (!assignedTo) throw new BadRequestException("Safe assigned operator label is required");
      item.assignmentStatus = "assigned";
      item.assignedToOperatorLabel = assignedTo;
      item.assignedAt = now;
      item.assignedByOperatorLabel = actorLabel;
      action = bulk ? "bulk_assigned" : "assigned";
      actionStatus = "assigned";
      reason = note ?? `assigned to ${assignedTo}`;
    }
    item.externalCalls = 0;

    addUnmatchedHistoryEntry(item, {
      action,
      actionStatus,
      statusBefore: assignmentStatusText(beforeStatus, beforeLabel),
      statusAfter: assignmentStatusText(item.assignmentStatus, item.assignedToOperatorLabel),
      actor: actorLabel,
      reason,
      message: input.operation === "UNASSIGN"
        ? "Unmatched inbound assignment cleared"
        : "Unmatched inbound assigned for internal review",
      actionAt: now
    });
    addMetadataOperatorNote(tenantId, item, actorUserId, input.operation === "UNASSIGN" ? "assignment cleared" : "assignment updated", note, now);
    await this.recordMetadataAudit(tenantId, actorUserId, item, action, actionStatus);
  }

  private async applyEscalation(
    tenantId: string,
    unmatchedId: string,
    input: ProviderWebhookUnmatchedInboundEscalationRequest,
    actorUserId: string | undefined,
    bulk: boolean
  ) {
    const item = findUnmatchedInboundItem(tenantId, unmatchedId);
    if (!item) throw new NotFoundException("Unmatched inbound item not found");
    await this.applyEscalationToItem(tenantId, item, input, actorUserId, bulk);
    return item;
  }

  private async applyEscalationToItem(
    tenantId: string,
    item: ProviderWebhookUnmatchedInboundItem,
    input: ProviderWebhookUnmatchedInboundEscalationRequest | ProviderWebhookUnmatchedInboundBulkEscalationRequest,
    actorUserId: string | undefined,
    bulk: boolean
  ) {
    const actorLabel = safeActorLabel(actorUserId);
    const note = safeMetadataNote(input.note);
    const beforeStatus = item.escalationStatus;
    const beforeReason = item.escalationReason;
    const now = new Date().toISOString();
    let action: ProviderWebhookUnmatchedInboundHistoryAction;
    let actionStatus: string;
    let reason: string | null = note;

    if (input.operation === "CLEAR_ESCALATION") {
      item.escalationStatus = "none";
      item.escalationReason = null;
      item.escalatedAt = null;
      item.escalatedByOperatorLabel = actorLabel;
      action = bulk ? "bulk_escalation_cleared" : "escalation_cleared";
      actionStatus = "cleared";
      reason = note ?? "escalation cleared";
    } else {
      if (!input.escalationReason) throw new BadRequestException("Safe escalation reason is required");
      item.escalationStatus = "escalated";
      item.escalationReason = input.escalationReason;
      item.escalatedAt = now;
      item.escalatedByOperatorLabel = actorLabel;
      action = bulk ? "bulk_escalated" : "escalated";
      actionStatus = "escalated";
      reason = note ?? input.escalationReason;
    }
    item.externalCalls = 0;

    addUnmatchedHistoryEntry(item, {
      action,
      actionStatus,
      statusBefore: escalationStatusText(beforeStatus, beforeReason),
      statusAfter: escalationStatusText(item.escalationStatus, item.escalationReason),
      actor: actorLabel,
      reason,
      message: input.operation === "CLEAR_ESCALATION"
        ? "Unmatched inbound escalation cleared"
        : "Unmatched inbound escalated for internal review",
      actionAt: now
    });
    addMetadataOperatorNote(tenantId, item, actorUserId, input.operation === "CLEAR_ESCALATION" ? "escalation cleared" : "escalation updated", note ?? input.escalationReason ?? null, now);
    await this.recordMetadataAudit(tenantId, actorUserId, item, action, actionStatus);
  }

  private async applyResolutionToItem(
    tenantId: string,
    item: ProviderWebhookUnmatchedInboundItem,
    input: ProviderWebhookUnmatchedInboundResolutionRequest,
    actorUserId: string | undefined,
    bulk: boolean
  ) {
    const actorLabel = safeActorLabel(actorUserId);
    const note = safeMetadataNote(input.note);
    if (input.note && !note) throw new BadRequestException("Resolution note contains unsafe provider or credential content");

    ensureResolutionState(item);
    const beforeStatus = resolutionStatusText(item);
    const now = new Date().toISOString();
    let action: ProviderWebhookUnmatchedInboundHistoryAction;
    let actionStatus: string;
    let reason: string | null = note;

    if (input.operation === "CLEAR_RESOLUTION") {
      item.resolutionStatus = "unresolved";
      item.resolutionOutcome = null;
      item.resolvedAt = null;
      item.resolvedByOperatorLabel = null;
      action = bulk ? "bulk_resolution_cleared" : "resolution_cleared";
      actionStatus = "cleared";
      reason = note ?? "resolution cleared";
    } else {
      if (!input.resolutionOutcome) throw new BadRequestException("Safe resolution outcome is required");
      item.resolutionStatus = "resolved";
      item.resolutionOutcome = input.resolutionOutcome;
      item.resolvedAt = now;
      item.resolvedByOperatorLabel = actorLabel;
      action = bulk ? "bulk_resolution_set" : "resolution_set";
      actionStatus = input.resolutionOutcome;
      reason = note ?? input.resolutionOutcome;
    }
    syncResolutionState(item);
    item.externalCalls = 0;

    addUnmatchedHistoryEntry(item, {
      action,
      actionStatus,
      statusBefore: beforeStatus,
      statusAfter: resolutionStatusText(item),
      actor: actorLabel,
      reason,
      message: input.operation === "CLEAR_RESOLUTION"
        ? "Resolution metadata cleared"
        : "Resolution metadata updated",
      actionAt: now
    });
    addMetadataOperatorNote(tenantId, item, actorUserId, input.operation === "CLEAR_RESOLUTION" ? "resolution cleared" : "resolution updated", reason, now);
    await this.recordResolutionAudit(tenantId, actorUserId, item, action, actionStatus);
  }

  private async applyChecklistToItem(
    tenantId: string,
    item: ProviderWebhookUnmatchedInboundItem,
    input: ProviderWebhookUnmatchedInboundResolutionChecklistRequest,
    actorUserId: string | undefined,
    bulk: boolean
  ) {
    const actorLabel = safeActorLabel(actorUserId);
    ensureResolutionState(item);
    const now = new Date().toISOString();
    let action: ProviderWebhookUnmatchedInboundHistoryAction;
    let actionStatus: string;
    let reason: string | null = null;
    let statusBefore = checklistStatusText(item);

    if (input.operation === "RESET_CHECKLIST") {
      item.closureChecklist = closureChecklistSteps.map((step) => ({
        step,
        completed: false,
        completedAt: null,
        completedByOperatorLabel: null
      }));
      action = bulk ? "bulk_checklist_reset" : "checklist_reset";
      actionStatus = "reset";
      reason = "checklist reset";
    } else {
      if (!input.step) throw new BadRequestException("Safe checklist step is required");
      const target = item.closureChecklist.find((step) => step.step === input.step);
      if (!target) throw new BadRequestException("Safe checklist step is required");
      statusBefore = `${input.step}:${target.completed ? "complete" : "incomplete"}`;
      if (input.operation === "COMPLETE_STEP") {
        target.completed = true;
        target.completedAt = now;
        target.completedByOperatorLabel = actorLabel;
        action = bulk ? "bulk_checklist_completed" : "checklist_completed";
        actionStatus = input.step;
        reason = input.step;
      } else {
        target.completed = false;
        target.completedAt = null;
        target.completedByOperatorLabel = null;
        action = "checklist_uncompleted";
        actionStatus = input.step;
        reason = input.step;
      }
    }
    syncResolutionState(item);
    item.externalCalls = 0;

    addUnmatchedHistoryEntry(item, {
      action,
      actionStatus,
      statusBefore,
      statusAfter: checklistStatusText(item),
      actor: actorLabel,
      reason,
      message: input.operation === "RESET_CHECKLIST"
        ? "Resolution checklist reset"
        : `Resolution checklist ${input.operation === "COMPLETE_STEP" ? "completed" : "uncompleted"}`,
      actionAt: now
    });
    addMetadataOperatorNote(tenantId, item, actorUserId, input.operation === "RESET_CHECKLIST" ? "checklist reset" : "checklist updated", reason, now);
    await this.recordResolutionAudit(tenantId, actorUserId, item, action, actionStatus);
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
      assignmentStatus: "unassigned",
      assignedToOperatorLabel: null,
      assignedAt: null,
      assignedByOperatorLabel: null,
      escalationStatus: "none",
      escalationReason: null,
      escalatedAt: null,
      escalatedByOperatorLabel: null,
      resolutionStatus: "unresolved",
      resolutionOutcome: null,
      resolvedAt: null,
      resolvedByOperatorLabel: null,
      closureReadiness: "NOT_READY",
      closureChecklist: defaultClosureChecklist(),
      checklistCompletedCount: 0,
      checklistTotalCount: closureChecklistSteps.length,
      checklistIncompleteSteps: [...closureChecklistSteps],
      recommendedNextActions: ["OPEN_DIAGNOSTICS", "VIEW_HISTORY", "RUN_CANDIDATE_LOOKUP", "ADD_OPERATOR_NOTE", "ASSIGN_OWNER"],
      lastOperatorNoteAt: null,
      historyAvailable: true,
      diagnosticsAvailable: true,
      candidatesAvailable: normalization.roomKeyDigest !== null && channelAccountId !== null,
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

  private async recordOperatorNoteAudit(
    tenantId: string,
    actorUserId: string | undefined,
    item: ProviderWebhookUnmatchedInboundItem,
    note: ProviderWebhookOperatorNote
  ) {
    try {
      await this.audit.record({
        tenantId,
        actorUserId,
        action: "provider_webhook.unmatched_inbound_operator_note_created",
        entityType: "provider_webhook_operator_note",
        entityId: note.id,
        metadata: {
          tenantId,
          unmatchedInboundId: item.id,
          provider: item.provider,
          channelAccountId: item.channelAccountId,
          payloadDigest: item.payloadDigest,
          senderKeyDigest: item.senderKeyDigest,
          roomKeyDigest: item.roomKeyDigest,
          noteLength: note.note.length,
          externalCalls: 0
        }
      });
    } catch {
      // Operator notes remain safe even when optional audit persistence is unavailable.
    }
  }

  private async recordMetadataAudit(
    tenantId: string,
    actorUserId: string | undefined,
    item: ProviderWebhookUnmatchedInboundItem,
    action: ProviderWebhookUnmatchedInboundHistoryAction,
    status: string
  ) {
    try {
      await this.audit.record({
        tenantId,
        actorUserId,
        action: `provider_webhook.unmatched_inbound_${action}`,
        entityType: "provider_webhook_unmatched_inbound_metadata",
        entityId: item.id,
        metadata: {
          tenantId,
          unmatchedInboundId: item.id,
          provider: item.provider,
          channelAccountId: item.channelAccountId,
          assignmentStatus: item.assignmentStatus,
          assignedToOperatorLabel: item.assignedToOperatorLabel,
          escalationStatus: item.escalationStatus,
          escalationReason: item.escalationReason,
          payloadDigest: item.payloadDigest,
          senderKeyDigest: item.senderKeyDigest,
          roomKeyDigest: item.roomKeyDigest,
          status,
          externalCalls: 0
        }
      });
    } catch {
      // Assignment and escalation metadata must not depend on optional audit persistence.
    }
  }

  private async recordResolutionAudit(
    tenantId: string,
    actorUserId: string | undefined,
    item: ProviderWebhookUnmatchedInboundItem,
    action: ProviderWebhookUnmatchedInboundHistoryAction,
    status: string
  ) {
    try {
      await this.audit.record({
        tenantId,
        actorUserId,
        action: `provider_webhook.unmatched_inbound_${action}`,
        entityType: "provider_webhook_unmatched_inbound_metadata",
        entityId: item.id,
        metadata: {
          tenantId,
          unmatchedInboundId: item.id,
          provider: item.provider,
          channelAccountId: item.channelAccountId,
          resolutionStatus: item.resolutionStatus,
          resolutionOutcome: item.resolutionOutcome,
          closureReadiness: item.closureReadiness,
          checklistCompletedCount: item.checklistCompletedCount,
          checklistTotalCount: item.checklistTotalCount,
          payloadDigest: item.payloadDigest,
          senderKeyDigest: item.senderKeyDigest,
          roomKeyDigest: item.roomKeyDigest,
          status,
          externalCalls: 0
        }
      });
    } catch {
      // Resolution/checklist metadata must not depend on optional audit persistence.
    }
  }
}

export function resetProviderWebhookEventStoreForTest() {
  events.splice(0);
  unmatchedInboundItems.splice(0);
  unmatchedInboundHistoryEntries.splice(0);
  reviewSavedViews.splice(0);
  operatorNotes.splice(0);
  dedupFirstSeenAtByDigest.clear();
}

export function getProviderWebhookGuardrailReadinessSnapshot() {
  unmatchedInboundItems.forEach(syncResolutionState);
  const latest = events[0] ?? null;
  const latestUnmatched = [...unmatchedInboundItems]
    .sort((left, right) => latestItemActivityAt(right).localeCompare(latestItemActivityAt(left)))[0] ?? null;
  const openAlertItems = unmatchedInboundItems
    .filter(isOpenUnmatchedStatusItem)
    .map(reviewAlertItemFromUnmatched);
  const triageItems = unmatchedInboundItems.map(reviewTriageItemFromUnmatched);
  const closureEvidenceItems = unmatchedInboundItems.map(closureEvidenceSummaryItemFromUnmatched);
  const exportManifestStatuses = closureEvidenceItems.map(exportManifestQaReadinessForEvidenceSummary);
  const openItems = unmatchedInboundItems.filter(isOpenUnmatchedStatusItem);
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
    webhookReviewMetricsEnabled: true,
    webhookDiagnosticsEnabled: true,
    webhookReviewAlertsEnabled: true,
    webhookReviewQueueHealthEnabled: true,
    reviewTriageEnabled: true,
    triageGuidanceEnabled: true,
    reviewSavedViewsEnabled: true,
    operatorNotesEnabled: true,
    reviewAssignmentEnabled: true,
    reviewEscalationEnabled: true,
    assignmentWorkloadEnabled: true,
    reviewResolutionEnabled: true,
    reviewClosureChecklistEnabled: true,
    resolutionSummaryEnabled: true,
    reviewClosureEvidenceEnabled: true,
    reviewClosureReportEnabled: true,
    reviewClosureEvidenceExportEnabled: true,
    reviewClosureReportExportEnabled: true,
    reviewExportRedactionAuditEnabled: true,
    reviewExportIntegrityChecksEnabled: true,
    reviewExportManifestEnabled: true,
    reviewExportQaHandoffEnabled: true,
    exportRedactionPassedCount: closureEvidenceItems.filter((item) => item.roomKeyDigest && item.externalCalls === 0).length,
    exportRedactionWarningCount: closureEvidenceItems.filter((item) => !item.roomKeyDigest).length,
    exportRedactionBlockedCount: 0,
    exportManifestReadyCount: exportManifestStatuses.filter((status) => status === "ready").length,
    exportManifestNeedsReviewCount: exportManifestStatuses.filter((status) => status === "needs_review").length,
    exportManifestBlockedCount: exportManifestStatuses.filter((status) => status === "blocked").length,
    latestExportManifestStatus: latestUnmatched ? exportManifestQaReadinessForEvidenceSummary(closureEvidenceSummaryItemFromUnmatched(latestUnmatched)) : null,
    savedViewCount: reviewSavedViews.filter((view) => !view.archived).length,
    operatorNoteCount: operatorNotes.length,
    unassignedOpenCount: openItems.filter((item) => item.assignmentStatus === "unassigned").length,
    assignedOpenCount: openItems.filter((item) => item.assignmentStatus === "assigned").length,
    escalatedOpenCount: openItems.filter((item) => item.escalationStatus === "escalated").length,
    unresolvedOpenCount: openItems.filter((item) => item.resolutionStatus === "unresolved").length,
    readyForClosureCount: openItems.filter((item) =>
      item.closureReadiness === "READY_FOR_REVIEW" ||
      item.closureReadiness === "READY_FOR_SKIP" ||
      item.closureReadiness === "READY_FOR_LINK" ||
      item.closureReadiness === "READY_FOR_LINK_AND_PERSIST"
    ).length,
    blockedResolutionCount: openItems.filter((item) => item.closureReadiness === "BLOCKED").length,
    checklistIncompleteOpenCount: openItems.filter((item) => item.checklistCompletedCount < item.checklistTotalCount).length,
    closureEvidenceReadyCount: closureEvidenceItems.filter((item) => item.evidenceStatus === "ready").length,
    closureEvidenceBlockedCount: closureEvidenceItems.filter((item) => item.evidenceStatus === "blocked").length,
    closureEvidenceIncompleteCount: closureEvidenceItems.filter((item) => item.evidenceStatus === "incomplete").length,
    closureEvidenceExportCount: closureEvidenceItems.length,
    closureReportExportCount: closureEvidenceItems.length > 0 ? 1 : 0,
    reviewAlertCriticalCount: openAlertItems.filter((item) => item.severity === "critical").length,
    criticalTriageCount: triageItems.filter((item) => item.severity === "critical").length,
    openTriageCount: triageItems.filter((item) => isOpenUnmatchedStatus(item.unmatchedStatus)).length,
    unmatchedInboundOpenCount: unmatchedInboundItems.filter((item) => item.unmatchedStatus === "open" || item.unmatchedStatus === "review-needed").length,
    unmatchedInboundStaleOpenCount: unmatchedInboundItems.filter(isStaleOpenUnmatchedItem).length,
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

function findReviewSavedView(tenantId: string, id: string) {
  return reviewSavedViews.find((view) => view.tenantId === tenantId && view.id === id) ?? null;
}

function clearDefaultSavedViews(tenantId: string, exceptId?: string) {
  for (const view of reviewSavedViews) {
    if (view.tenantId === tenantId && view.id !== exceptId) {
      view.isDefault = false;
    }
  }
}

function cleanSavedViewFilters(filters: ProviderWebhookReviewSavedViewFilters): ProviderWebhookReviewSavedViewFilters {
  return providerWebhookReviewSavedViewFiltersSchema.parse(Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== "")
  ));
}

function normalizeSavedViewSort(sort?: ProviderWebhookReviewSavedViewSort): ProviderWebhookReviewSavedViewSort {
  return {
    sortBy: sort?.sortBy ?? "receivedAt",
    sortDirection: sort?.sortDirection ?? "desc"
  };
}

function safeOptionalDescription(description: string | undefined) {
  const trimmed = description?.replace(/\s+/g, " ").trim();
  return trimmed ? trimmed : null;
}

function rejectUnsafeSavedViewInput(input: unknown) {
  if (containsUnsafeProviderText(input)) {
    throw new BadRequestException("Saved review view contains unsafe provider or credential content");
  }
}

function containsUnsafeProviderText(value: unknown): boolean {
  if (typeof value === "string") return hasUnsafeSecretPattern(value);
  if (!value || typeof value !== "object") return false;
  if (Array.isArray(value)) return value.some(containsUnsafeProviderText);
  return Object.entries(value as Record<string, unknown>).some(([key, child]) =>
    hasUnsafeSecretPattern(key) || containsUnsafeProviderText(child)
  );
}

function operatorNoteContext(item: ProviderWebhookUnmatchedInboundItem): ProviderWebhookOperatorNote["context"] {
  return {
    provider: item.provider,
    platform: item.provider,
    channelAccountId: item.channelAccountId,
    safeRoomLabel: safeRoomLabel(item),
    roomKeyDigest: item.roomKeyDigest,
    eventType: item.eventType,
    reviewStatus: item.reviewStatus,
    linkStatus: item.linkStatus,
    unmatchedStatus: item.unmatchedStatus,
    assignmentStatus: item.assignmentStatus,
    assignedToOperatorLabel: item.assignedToOperatorLabel,
    escalationStatus: item.escalationStatus,
    escalationReason: item.escalationReason,
    resolutionStatus: item.resolutionStatus,
    resolutionOutcome: item.resolutionOutcome,
    closureReadiness: item.closureReadiness,
    checklistCompletedCount: item.checklistCompletedCount,
    checklistTotalCount: item.checklistTotalCount
  };
}

function isOpenUnmatchedStatus(status: ProviderWebhookUnmatchedInboundStatus) {
  return status === "open" || status === "review-needed";
}

function defaultClosureChecklist(): ProviderWebhookReviewClosureChecklistItem[] {
  return closureChecklistSteps.map((step) => ({
    step,
    completed: false,
    completedAt: null,
    completedByOperatorLabel: null
  }));
}

function ensureResolutionState(item: ProviderWebhookUnmatchedInboundItem) {
  item.resolutionStatus = item.resolutionStatus ?? "unresolved";
  item.resolutionOutcome = item.resolutionOutcome ?? null;
  item.resolvedAt = item.resolvedAt ?? null;
  item.resolvedByOperatorLabel = item.resolvedByOperatorLabel ?? null;
  const existing = new Map((item.closureChecklist ?? []).map((step) => [step.step, step]));
  item.closureChecklist = closureChecklistSteps.map((step) => {
    const current = existing.get(step);
    return {
      step,
      completed: current?.completed ?? false,
      completedAt: current?.completedAt ?? null,
      completedByOperatorLabel: current?.completedByOperatorLabel ?? null
    };
  });
}

function syncResolutionState(item: ProviderWebhookUnmatchedInboundItem) {
  ensureResolutionState(item);
  item.checklistTotalCount = item.closureChecklist.length;
  item.checklistCompletedCount = item.closureChecklist.filter((step) => step.completed).length;
  item.checklistIncompleteSteps = item.closureChecklist
    .filter((step) => !step.completed)
    .map((step) => step.step);
  item.resolutionStatus = item.resolutionOutcome ? "resolved" : "unresolved";
  item.closureReadiness = closureReadinessForItem(item);
  item.recommendedNextActions = recommendedNextActionsForItem(item);
  item.externalCalls = 0;
  return item;
}

function snapshotUnmatchedInboundItem(item: ProviderWebhookUnmatchedInboundItem): ProviderWebhookUnmatchedInboundItem {
  const synced = syncResolutionState(item);
  return {
    ...synced,
    closureChecklist: synced.closureChecklist.map((step) => ({ ...step })),
    checklistIncompleteSteps: [...synced.checklistIncompleteSteps],
    recommendedNextActions: [...synced.recommendedNextActions]
  };
}

function closureReadinessForItem(item: ProviderWebhookUnmatchedInboundItem) {
  if (item.unmatchedStatus === "blocked" || item.resolutionOutcome === "BLOCKED_UNSAFE" || item.resolutionOutcome === "ROUTING_FAILED") return "BLOCKED";
  if (item.reviewStatus !== "pending" || !isOpenUnmatchedStatus(item.unmatchedStatus)) return "ALREADY_REVIEWED";
  if (!item.resolutionOutcome) return "NOT_READY";
  if (item.checklistIncompleteSteps.length > 0) return "NOT_READY";
  if (item.resolutionOutcome === "SKIPPED_DUPLICATE" || item.resolutionOutcome === "SKIPPED_SPAM" || item.resolutionOutcome === "SKIPPED_UNSUPPORTED_EVENT") {
    return "READY_FOR_SKIP";
  }
  if (item.resolutionOutcome === "REVIEWED_SAFE_MATCH" || item.resolutionOutcome === "LINKED_EXISTING_CONVERSATION") {
    return "READY_FOR_LINK";
  }
  if (item.resolutionOutcome === "LINKED_AND_PERSISTED_SAFE_MESSAGE") {
    return "READY_FOR_LINK_AND_PERSIST";
  }
  return "READY_FOR_REVIEW";
}

function recommendedNextActionsForItem(item: ProviderWebhookUnmatchedInboundItem): ProviderWebhookReviewRecommendedNextAction[] {
  if (item.closureReadiness === "ALREADY_REVIEWED") return ["VIEW_HISTORY", "OPEN_DIAGNOSTICS"];
  if (item.closureReadiness === "BLOCKED") return item.escalationStatus === "escalated"
    ? ["VIEW_HISTORY", "ADD_OPERATOR_NOTE", "CLEAR_ESCALATION"]
    : ["OPEN_DIAGNOSTICS", "ADD_OPERATOR_NOTE", "ESCALATE"];

  const incomplete = new Set(item.checklistIncompleteSteps);
  const actions: ProviderWebhookReviewRecommendedNextAction[] = [];
  if (incomplete.has("VIEWED_DIAGNOSTICS")) actions.push("OPEN_DIAGNOSTICS");
  if (incomplete.has("REVIEWED_HISTORY")) actions.push("VIEW_HISTORY");
  if (incomplete.has("REVIEWED_CANDIDATES") && isSafeLinkableUnmatchedItem(item)) actions.push("RUN_CANDIDATE_LOOKUP");
  if (incomplete.has("CONFIRMED_OPERATOR_NOTE")) actions.push("ADD_OPERATOR_NOTE");
  if (incomplete.has("CONFIRMED_ASSIGNMENT_OR_ESCALATION") && item.assignmentStatus === "unassigned") actions.push("ASSIGN_OWNER");
  if (item.escalationStatus === "escalated") actions.push("CLEAR_ESCALATION");
  if (!item.resolutionOutcome) actions.push("MARK_REVIEWED");
  if (item.closureReadiness === "READY_FOR_REVIEW") actions.push("MARK_REVIEWED");
  if (item.closureReadiness === "READY_FOR_SKIP") actions.push("SKIP");
  if (item.closureReadiness === "READY_FOR_LINK") actions.push("LINK_ONLY");
  if (item.closureReadiness === "READY_FOR_LINK_AND_PERSIST") actions.push("LINK_AND_PERSIST_SAFE_MESSAGE");
  return Array.from(new Set(actions)).slice(0, 8);
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

function filterUnmatchedInboundItems(tenantId: string, filters: ProviderWebhookUnmatchedInboundFilters, actorUserId?: string) {
  const receivedFrom = filters.receivedAtFrom ?? filters.receivedFrom;
  const receivedTo = filters.receivedAtTo ?? filters.receivedTo;
  const actorLabel = safeActorLabel(actorUserId);
  const assignedTo = filters.assignedTo === "me" ? actorLabel : safeFilterText(filters.assignedTo);
  return unmatchedInboundItems.map((item) => syncResolutionState(item)).filter((item) => {
    if (item.tenantId !== tenantId) return false;
    if (!matchesLegacyStatusFilter(item, filters.status)) return false;
    if (filters.provider && item.provider !== filters.provider) return false;
    if (filters.reviewStatus && item.reviewStatus !== filters.reviewStatus) return false;
    if (filters.linkStatus && item.linkStatus !== filters.linkStatus) return false;
    if (filters.unmatchedStatus && item.unmatchedStatus !== filters.unmatchedStatus) return false;
    if (filters.eventType && item.eventType !== filters.eventType) return false;
    if (assignedTo && item.assignedToOperatorLabel !== assignedTo) return false;
    if (filters.assignmentStatus === "unassigned" && item.assignmentStatus !== "unassigned") return false;
    if (filters.assignmentStatus === "assigned" && item.assignmentStatus !== "assigned") return false;
    if (filters.assignmentStatus === "assigned_to_me" && item.assignedToOperatorLabel !== actorLabel) return false;
    if (filters.assignmentStatus === "assigned_to_others" && (item.assignmentStatus !== "assigned" || item.assignedToOperatorLabel === actorLabel)) return false;
    if (filters.escalationStatus && item.escalationStatus !== filters.escalationStatus) return false;
    if (filters.escalationReason && item.escalationReason !== filters.escalationReason) return false;
    if (filters.severity && triageSeverityForItem(item, triageLaneForItem(item)) !== filters.severity) return false;
    if (filters.triageLane && triageLaneForItem(item) !== filters.triageLane) return false;
    if (filters.resolutionStatus && item.resolutionStatus !== filters.resolutionStatus) return false;
    if (filters.resolutionOutcome && item.resolutionOutcome !== filters.resolutionOutcome) return false;
    if (filters.closureReadiness && item.closureReadiness !== filters.closureReadiness) return false;
    if (filters.checklistIncomplete !== undefined && (item.checklistCompletedCount < item.checklistTotalCount) !== filters.checklistIncomplete) return false;
    if (receivedFrom && item.receivedAt < new Date(receivedFrom).toISOString()) return false;
    if (receivedTo && item.receivedAt > new Date(receivedTo).toISOString()) return false;
    return true;
  });
}

function filterEventsForMetrics(tenantId: string, filters: ProviderWebhookReviewMetricsFilters) {
  const receivedFrom = filters.receivedAtFrom ?? filters.receivedFrom;
  const receivedTo = filters.receivedAtTo ?? filters.receivedTo;
  return events.filter((event) => {
    if (event.tenantId !== tenantId) return false;
    if (filters.provider && event.provider !== filters.provider) return false;
    if (filters.eventType && event.eventType !== filters.eventType) return false;
    if (receivedFrom && event.receivedAt < new Date(receivedFrom).toISOString()) return false;
    if (receivedTo && event.receivedAt > new Date(receivedTo).toISOString()) return false;
    return true;
  });
}

function cleanUnmatchedInboundFilters(filters: ProviderWebhookUnmatchedInboundFilters) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== "")
  ) as ProviderWebhookUnmatchedInboundFilters;
}

function cleanReviewMetricsFilters(filters: ProviderWebhookReviewMetricsFilters) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== "")
  ) as ProviderWebhookReviewMetricsFilters;
}

function cleanReviewAlertsFilters(filters: ProviderWebhookReviewAlertsFilters) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== "")
  ) as ProviderWebhookReviewAlertsFilters;
}

function cleanReviewTriageFilters(filters: ProviderWebhookReviewTriageFilters) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== "")
  ) as ProviderWebhookReviewTriageFilters;
}

function cleanReviewWorkloadFilters(filters: ProviderWebhookReviewWorkloadFilters) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== "")
  ) as ProviderWebhookReviewWorkloadFilters;
}

function cleanReviewResolutionSummaryFilters(filters: ProviderWebhookReviewResolutionSummaryFilters) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== "")
  ) as ProviderWebhookReviewResolutionSummaryFilters;
}

function cleanReviewClosureReportFilters(filters: ProviderWebhookReviewClosureReportFilters) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== "")
  ) as ProviderWebhookReviewClosureReportFilters;
}

function reviewTriageBaseFilters(filters: ProviderWebhookReviewTriageFilters): ProviderWebhookReviewMetricsFilters {
  const { severity: _severity, triageLane: _triageLane, ...baseFilters } = filters;
  return baseFilters;
}

function summarizeUnmatchedInboundItems(items: ProviderWebhookUnmatchedInboundItem[]) {
  return {
    openCount: items.filter(isOpenUnmatchedStatusItem).length,
    reviewedCount: items.filter((item) => item.reviewStatus === "reviewed").length,
    skippedCount: items.filter((item) => item.reviewStatus === "skipped").length,
    linkedCount: items.filter((item) => item.reviewStatus === "linked").length
  };
}

function countByStable<T, K extends string>(items: T[], keys: readonly K[], getKey: (item: T) => K) {
  return keys.map((key) => ({
    key,
    label: key,
    count: items.filter((item) => getKey(item) === key).length
  }));
}

function countByDynamic<T>(items: T[], getKey: (item: T) => string) {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = safeHistoryText(getKey(item)) ?? "unknown";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, count]) => ({ key, label: key, count }));
}

function ageBucketsForOpenItems(items: ProviderWebhookUnmatchedInboundItem[]) {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  const oneDay = 24 * oneHour;
  const threeDays = 3 * oneDay;
  return items.reduce((buckets, item) => {
    const age = Math.max(0, now - new Date(item.receivedAt).getTime());
    if (age < oneHour) buckets.under1Hour += 1;
    else if (age < oneDay) buckets.oneTo24Hours += 1;
    else if (age < threeDays) buckets.oneTo3Days += 1;
    else buckets.over3Days += 1;
    return buckets;
  }, {
    under1Hour: 0,
    oneTo24Hours: 0,
    oneTo3Days: 0,
    over3Days: 0
  });
}

function reviewAlertItemFromUnmatched(item: ProviderWebhookUnmatchedInboundItem) {
  return {
    unmatchedId: item.id,
    provider: item.provider,
    platform: item.provider,
    channelAccountId: item.channelAccountId,
    safeRoomLabel: safeRoomLabel(item),
    roomKeyDigest: item.roomKeyDigest,
    eventType: item.eventType,
    receivedAt: item.receivedAt,
    ageBucket: ageBucketForReceivedAt(item.receivedAt),
    severity: reviewAlertSeverityForReceivedAt(item.receivedAt),
    reviewStatus: item.reviewStatus,
    linkStatus: item.linkStatus,
    unmatchedStatus: item.unmatchedStatus,
    assignmentStatus: item.assignmentStatus,
    assignedToOperatorLabel: item.assignedToOperatorLabel,
    escalationStatus: item.escalationStatus,
    escalationReason: item.escalationReason,
    routingOutcome: `${item.routingStatus}/${item.conversationLookupStatus}`,
    diagnosticsAvailable: true,
    historyAvailable: buildHistoryEntriesForItem(item).length > 0,
    externalCalls: 0 as const
  };
}

function ageBucketForReceivedAt(receivedAt: string): ProviderWebhookReviewAlertAgeBucket {
  const ageHours = hoursSince(receivedAt);
  if (ageHours < 1) return "under1Hour";
  if (ageHours < 24) return "oneTo24Hours";
  if (ageHours < 72) return "oneTo3Days";
  return "over3Days";
}

function reviewAlertSeverityForReceivedAt(receivedAt: string): ProviderWebhookReviewAlertSeverity {
  const ageHours = hoursSince(receivedAt);
  if (ageHours >= reviewAlertThresholds.staleCriticalHours) return "critical";
  if (ageHours >= reviewAlertThresholds.staleWarningHours) return "warning";
  return "info";
}

function reviewTriageItemFromUnmatched(item: ProviderWebhookUnmatchedInboundItem) {
  const lane = triageLaneForItem(item);
  return {
    unmatchedId: item.id,
    provider: item.provider,
    platform: item.provider,
    channelAccountId: item.channelAccountId,
    safeRoomLabel: safeRoomLabel(item),
    roomKeyDigest: item.roomKeyDigest,
    eventType: item.eventType,
    receivedAt: item.receivedAt,
    ageBucket: ageBucketForReceivedAt(item.receivedAt),
    triageLane: lane,
    severity: triageSeverityForItem(item, lane),
    reviewStatus: item.reviewStatus,
    linkStatus: item.linkStatus,
    unmatchedStatus: item.unmatchedStatus,
    assignmentStatus: item.assignmentStatus,
    assignedToOperatorLabel: item.assignedToOperatorLabel,
    escalationStatus: item.escalationStatus,
    escalationReason: item.escalationReason,
    routingOutcome: `${item.routingStatus}/${item.conversationLookupStatus}`,
    recommendedNextActions: triageActionsForLane(lane),
    diagnosticsAvailable: true,
    historyAvailable: buildHistoryEntriesForItem(item).length > 0,
    candidatesAvailable: isSafeLinkableUnmatchedItem(item),
    exportAvailable: true,
    externalCalls: 0 as const
  };
}

function assignmentSummaryItemFromUnmatched(item: ProviderWebhookUnmatchedInboundItem) {
  syncResolutionState(item);
  const lane = triageLaneForItem(item);
  return {
    unmatchedId: item.id,
    provider: item.provider,
    platform: item.provider,
    channelAccountId: item.channelAccountId,
    safeRoomLabel: safeRoomLabel(item),
    roomKeyDigest: item.roomKeyDigest,
    eventType: item.eventType,
    receivedAt: item.receivedAt,
    ageBucket: ageBucketForReceivedAt(item.receivedAt),
    reviewStatus: item.reviewStatus,
    linkStatus: item.linkStatus,
    unmatchedStatus: item.unmatchedStatus,
    triageLane: lane,
    severity: triageSeverityForItem(item, lane),
    assignmentStatus: item.assignmentStatus,
    assignedToOperatorLabel: item.assignedToOperatorLabel,
    assignedAt: item.assignedAt,
    assignedByOperatorLabel: item.assignedByOperatorLabel,
    escalationStatus: item.escalationStatus,
    escalationReason: item.escalationReason,
    escalatedAt: item.escalatedAt,
    escalatedByOperatorLabel: item.escalatedByOperatorLabel,
    resolutionStatus: item.resolutionStatus,
    resolutionOutcome: item.resolutionOutcome,
    closureReadiness: item.closureReadiness,
    checklistCompletedCount: item.checklistCompletedCount,
    checklistTotalCount: item.checklistTotalCount,
    lastOperatorNoteAt: item.lastOperatorNoteAt,
    historyAvailable: buildHistoryEntriesForItem(item).length > 0,
    diagnosticsAvailable: true,
    candidatesAvailable: isSafeLinkableUnmatchedItem(item),
    externalCalls: 0 as const
  };
}

function triageLaneForItem(item: ProviderWebhookUnmatchedInboundItem): ProviderWebhookReviewTriageLane {
  if (item.reviewStatus === "skipped" || item.unmatchedStatus === "skipped" || item.unmatchedStatus === "duplicate-skipped" || item.unmatchedStatus === "blocked") {
    return "skipped_ignored";
  }
  if (item.reviewStatus === "reviewed" || item.reviewStatus === "linked" || item.unmatchedStatus === "reviewed" || item.unmatchedStatus === "linked") {
    return "recently_reviewed";
  }
  if (isOpenUnmatchedStatusItem(item)) {
    const ageHours = hoursSince(item.receivedAt);
    if (ageHours >= reviewAlertThresholds.staleCriticalHours) return "critical_stale_open";
    if (ageHours >= reviewAlertThresholds.staleWarningHours) return "warning_stale_open";
    if (isSafeLinkableUnmatchedItem(item)) return "safe_link_candidate_available";
    if (item.conversationLookupStatus === "not-found") return "candidate_lookup_recommended";
    if (item.routingStatus === "blocked-signature" || item.routingStatus === "blocked-replay" || item.routingStatus === "unsupported") {
      return "failed_routing_missing_match";
    }
    return "needs_manual_review";
  }
  return "failed_routing_missing_match";
}

function triageSeverityForItem(item: ProviderWebhookUnmatchedInboundItem, lane: ProviderWebhookReviewTriageLane): ProviderWebhookReviewAlertSeverity {
  if (lane === "critical_stale_open") return "critical";
  if (lane === "warning_stale_open") return "warning";
  if (lane === "failed_routing_missing_match" && item.routingStatus !== "dry-run-only") return "warning";
  return "info";
}

function triageLaneSeverity(lane: ProviderWebhookReviewTriageLane): ProviderWebhookReviewAlertSeverity {
  if (lane === "critical_stale_open") return "critical";
  if (lane === "warning_stale_open" || lane === "failed_routing_missing_match") return "warning";
  return "info";
}

function triageActionsForLane(lane: ProviderWebhookReviewTriageLane): ProviderWebhookTriageRecommendedAction[] {
  if (lane === "critical_stale_open") return ["OPEN_DIAGNOSTICS", "VIEW_HISTORY", "APPLY_FILTER", "MARK_REVIEWED", "SKIP"];
  if (lane === "warning_stale_open") return ["OPEN_DIAGNOSTICS", "VIEW_HISTORY", "APPLY_FILTER", "RUN_CANDIDATE_LOOKUP"];
  if (lane === "safe_link_candidate_available") return ["RUN_CANDIDATE_LOOKUP", "LINK_ONLY", "LINK_AND_PERSIST_SAFE_MESSAGE"];
  if (lane === "candidate_lookup_recommended") return ["RUN_CANDIDATE_LOOKUP", "OPEN_DIAGNOSTICS", "VIEW_HISTORY"];
  if (lane === "needs_manual_review") return ["OPEN_DIAGNOSTICS", "VIEW_HISTORY", "MARK_REVIEWED", "SKIP"];
  if (lane === "recently_reviewed") return ["VIEW_HISTORY", "OPEN_DIAGNOSTICS"];
  if (lane === "skipped_ignored") return ["VIEW_HISTORY", "APPLY_FILTER"];
  return ["OPEN_DIAGNOSTICS", "VIEW_HISTORY", "APPLY_FILTER", "SKIP"];
}

function triageSeverityRank(severity: ProviderWebhookReviewAlertSeverity) {
  if (severity === "critical") return 3;
  if (severity === "warning") return 2;
  return 1;
}

function hoursSince(receivedAt: string) {
  const receivedMs = new Date(receivedAt).getTime();
  if (Number.isNaN(receivedMs)) return 0;
  return Math.max(0, (Date.now() - receivedMs) / (60 * 60 * 1000));
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
    assignmentStatus: item.assignmentStatus,
    assignedToOperatorLabel: item.assignedToOperatorLabel,
    assignedAt: item.assignedAt,
    escalationStatus: item.escalationStatus,
    escalationReason: item.escalationReason,
    escalatedAt: item.escalatedAt,
    resolutionStatus: item.resolutionStatus,
    resolutionOutcome: item.resolutionOutcome,
    closureReadiness: item.closureReadiness,
    checklistCompletedCount: item.checklistCompletedCount,
    checklistTotalCount: item.checklistTotalCount,
    externalCalls: 0 as const
  };
}

function resolutionSummaryItemFromUnmatched(item: ProviderWebhookUnmatchedInboundItem) {
  syncResolutionState(item);
  const lane = triageLaneForItem(item);
  return {
    unmatchedId: item.id,
    provider: item.provider,
    platform: item.provider,
    channelAccountId: item.channelAccountId,
    safeRoomLabel: safeRoomLabel(item),
    roomKeyDigest: item.roomKeyDigest,
    eventType: item.eventType,
    receivedAt: item.receivedAt,
    ageBucket: ageBucketForReceivedAt(item.receivedAt),
    reviewStatus: item.reviewStatus,
    linkStatus: item.linkStatus,
    unmatchedStatus: item.unmatchedStatus,
    triageLane: lane,
    severity: triageSeverityForItem(item, lane),
    assignmentStatus: item.assignmentStatus,
    assignedToOperatorLabel: item.assignedToOperatorLabel,
    escalationStatus: item.escalationStatus,
    escalationReason: item.escalationReason,
    resolutionStatus: item.resolutionStatus,
    resolutionOutcome: item.resolutionOutcome,
    resolvedAt: item.resolvedAt,
    resolvedByOperatorLabel: item.resolvedByOperatorLabel,
    closureReadiness: item.closureReadiness,
    closureChecklist: item.closureChecklist,
    checklistCompletedCount: item.checklistCompletedCount,
    checklistTotalCount: item.checklistTotalCount,
    checklistIncompleteSteps: item.checklistIncompleteSteps,
    recommendedNextActions: item.recommendedNextActions,
    lastOperatorNoteAt: item.lastOperatorNoteAt,
    historyAvailable: buildHistoryEntriesForItem(item).length > 0,
    diagnosticsAvailable: true,
    candidatesAvailable: isSafeLinkableUnmatchedItem(item),
    externalCalls: 0 as const
  };
}

function closureEvidenceSummaryItemFromUnmatched(item: ProviderWebhookUnmatchedInboundItem): ProviderWebhookReviewClosureEvidenceSummaryItem {
  syncResolutionState(item);
  const lane = triageLaneForItem(item);
  const historyEntryCount = buildHistoryEntriesForItem(item).length;
  const operatorNoteCount = countOperatorNotesForItem(item);
  const candidatesAvailable = isSafeLinkableUnmatchedItem(item);
  const noProviderOutboundConfirmed = checklistStepCompleted(item, "CONFIRMED_NO_PROVIDER_OUTBOUND");
  const noRawLeakageConfirmed = checklistStepCompleted(item, "CONFIRMED_NO_RAW_LEAKAGE");
  const safeLinkTargetConfirmed = checklistStepCompleted(item, "CONFIRMED_SAFE_LINK_TARGET");
  const assignmentOrEscalationPresent =
    item.assignmentStatus === "assigned" ||
    item.escalationStatus === "escalated" ||
    checklistStepCompleted(item, "CONFIRMED_ASSIGNMENT_OR_ESCALATION");

  return {
    unmatchedId: item.id,
    provider: item.provider,
    platform: item.provider,
    channelAccountId: item.channelAccountId,
    safeRoomLabel: safeRoomLabel(item),
    roomKeyDigest: item.roomKeyDigest,
    eventType: item.eventType,
    receivedAt: item.receivedAt,
    ageBucket: ageBucketForReceivedAt(item.receivedAt),
    reviewStatus: item.reviewStatus,
    linkStatus: item.linkStatus,
    unmatchedStatus: item.unmatchedStatus,
    triageLane: lane,
    severity: triageSeverityForItem(item, lane),
    assignmentStatus: item.assignmentStatus,
    assignedToOperatorLabel: item.assignedToOperatorLabel,
    escalationStatus: item.escalationStatus,
    escalationReason: item.escalationReason,
    resolutionStatus: item.resolutionStatus,
    resolutionOutcome: item.resolutionOutcome,
    closureReadiness: item.closureReadiness,
    evidenceStatus: closureEvidenceStatusForItem(item),
    checklistCompletedCount: item.checklistCompletedCount,
    checklistTotalCount: item.checklistTotalCount,
    checklistIncompleteSteps: [...item.checklistIncompleteSteps],
    recommendedNextActions: [...item.recommendedNextActions],
    evidenceFlags: {
      diagnosticsViewedOrAvailable: item.diagnosticsAvailable || checklistStepCompleted(item, "VIEWED_DIAGNOSTICS"),
      historyAvailable: historyEntryCount > 0,
      operatorNotesAvailable: operatorNoteCount > 0 || checklistStepCompleted(item, "CONFIRMED_OPERATOR_NOTE"),
      candidatesAvailable,
      assignmentOrEscalationPresent,
      noProviderOutboundConfirmed,
      noRawLeakageConfirmed,
      safeLinkTargetConfirmed
    },
    historyEntryCount,
    operatorNoteCount,
    candidateSummaryCount: candidatesAvailable ? 1 : 0,
    externalCalls: 0 as const
  };
}

function closureEvidenceStatusForItem(item: ProviderWebhookUnmatchedInboundItem): ProviderWebhookReviewClosureEvidenceStatus {
  if (item.closureReadiness === "BLOCKED") return "blocked";
  if (
    item.closureReadiness === "READY_FOR_REVIEW" ||
    item.closureReadiness === "READY_FOR_SKIP" ||
    item.closureReadiness === "READY_FOR_LINK" ||
    item.closureReadiness === "READY_FOR_LINK_AND_PERSIST"
  ) {
    return "ready";
  }
  return "incomplete";
}

function buildExportRedactionAudit(input: {
  auditTarget: ProviderWebhookReviewExportRedactionAuditTarget;
  exportPayload: unknown;
  unmatchedId?: string;
  appliedFilters?: ProviderWebhookReviewClosureReportFilters;
  tenantScoped: boolean;
  safeRoomDigestPresent: boolean;
}): ProviderWebhookReviewExportRedactionAudit {
  const safeDigest = safeDigestForExport(input.exportPayload);
  const checks: ProviderWebhookReviewExportRedactionChecks = {
    rawPayloadAbsent: unsafePatternAbsent(input.exportPayload, /rawPayload|providerRaw|payloadJson/i),
    rawSignatureAbsent: unsafePatternAbsent(input.exportPayload, /rawSignature|signatureValue|signatureSecret/i),
    tokenAbsent: unsafePatternAbsent(input.exportPayload, /replyToken|accessToken|refreshToken|bearerToken/i),
    authorizationAbsent: unsafePatternAbsent(input.exportPayload, /authorization|authHeader/i),
    cookieAbsent: unsafePatternAbsent(input.exportPayload, /cookie|set-cookie/i),
    replyTokenAbsent: unsafePatternAbsent(input.exportPayload, /replyToken/i),
    rawSenderIdAbsent: unsafePatternAbsent(input.exportPayload, /rawSender|senderId|sender id/i),
    rawRoomIdAbsent: unsafePatternAbsent(input.exportPayload, /rawRoom|roomId|room id/i),
    providerSecretAbsent: unsafePatternAbsent(input.exportPayload, /providerSecret|webhookSecret|secretValue/i),
    providerOutboundAbsent: unsafePatternAbsent(input.exportPayload, /outbound\.queued|outbound\.sent|line\.push|telegram\.send|facebook\.send|instagram\.send/i),
    externalCallsZero: externalCallsAreZero(input.exportPayload),
    safeRoomDigestPresent: input.safeRoomDigestPresent,
    tenantScoped: input.tenantScoped,
    exportDeterministic: safeDigest === safeDigestForExport(input.exportPayload)
  };
  const issues = redactionIssuesForChecks(checks);
  const status = issues.some((issue) => issue.severity === "blocked")
    ? "blocked"
    : issues.length > 0
      ? "warning"
      : "passed";

  return {
    generatedAt: new Date().toISOString(),
    auditTarget: input.auditTarget,
    status,
    checks,
    issues,
    ...(input.unmatchedId ? { unmatchedId: input.unmatchedId } : {}),
    ...(input.appliedFilters ? { appliedFilters: input.appliedFilters } : {}),
    exportShapeVersion: reviewClosureExportShapeVersion,
    safeDigest,
    externalCalls: 0 as const
  };
}

function buildExportManifest(input: {
  manifestTarget: ProviderWebhookReviewExportManifest["manifestTarget"];
  exportKind: ProviderWebhookReviewExportManifest["exportKind"];
  format: "json";
  contentType: "application/json";
  safeFilename: string;
  exportedAt: string;
  unmatchedId?: string;
  appliedFilters?: ProviderWebhookReviewClosureReportFilters;
  totalItems: number;
  totalOpenItems: number;
  evidenceReadyCount: number;
  evidenceBlockedCount: number;
  evidenceIncompleteCount: number;
  redactionAudit: ProviderWebhookReviewExportRedactionAudit;
  redactionPassedCount: number;
  redactionWarningCount: number;
  redactionBlockedCount: number;
  integrityStatus: ProviderWebhookReviewExportManifestIntegrityStatus;
  deterministicExportConfirmed: boolean;
  safeDigest: string;
  safeReportDigest?: string;
  manualQaReadiness: ProviderWebhookReviewExportManifestQaReadiness;
}): ProviderWebhookReviewExportManifest {
  const manualQaChecks = {
    safeFilenamePresent: input.safeFilename.length > 0,
    safeDigestPresent: input.safeDigest.startsWith("sha256:"),
    redactionPassedOrWarned: input.redactionAudit.status === "passed" || input.redactionAudit.status === "warning",
    redactionBlockedAbsent: input.redactionBlockedCount === 0,
    deterministicExportConfirmed: input.deterministicExportConfirmed,
    externalCallsZero: input.redactionAudit.externalCalls === 0,
    manualQaReady: input.manualQaReadiness === "ready"
  };

  return {
    generatedAt: new Date().toISOString(),
    manifestKind: "provider-webhook-review-export-manifest",
    manifestTarget: input.manifestTarget,
    exportKind: input.exportKind,
    format: input.format,
    contentType: input.contentType,
    safeFilename: input.safeFilename,
    exportedAt: input.exportedAt,
    exportShapeVersion: input.redactionAudit.exportShapeVersion,
    ...(input.unmatchedId ? { unmatchedId: input.unmatchedId } : {}),
    ...(input.appliedFilters ? { appliedFilters: input.appliedFilters } : {}),
    totalItems: input.totalItems,
    totalOpenItems: input.totalOpenItems,
    evidenceReadyCount: input.evidenceReadyCount,
    evidenceBlockedCount: input.evidenceBlockedCount,
    evidenceIncompleteCount: input.evidenceIncompleteCount,
    redactionStatus: input.redactionAudit.status,
    redactionIssueCount: input.redactionAudit.issues.length,
    redactionPassedCount: input.redactionPassedCount,
    redactionWarningCount: input.redactionWarningCount,
    redactionBlockedCount: input.redactionBlockedCount,
    integrityStatus: input.integrityStatus,
    deterministicExportConfirmed: input.deterministicExportConfirmed,
    safeDigest: input.safeDigest,
    ...(input.safeReportDigest ? { safeReportDigest: input.safeReportDigest } : {}),
    manualQaReadiness: input.manualQaReadiness,
    manualQaChecks,
    externalCalls: 0 as const
  };
}

function redactionCountsForStatus(status: ProviderWebhookReviewExportRedactionAudit["status"]) {
  return {
    redactionPassedCount: status === "passed" ? 1 : 0,
    redactionWarningCount: status === "warning" ? 1 : 0,
    redactionBlockedCount: status === "blocked" ? 1 : 0
  };
}

function exportManifestIntegrityStatus(input: {
  redactionStatus: ProviderWebhookReviewExportRedactionAudit["status"];
  deterministicExportConfirmed: boolean;
  redactionWarningCount: number;
  redactionBlockedCount: number;
}): ProviderWebhookReviewExportManifestIntegrityStatus {
  if (input.redactionStatus === "blocked" || input.redactionBlockedCount > 0 || !input.deterministicExportConfirmed) return "blocked";
  if (input.redactionStatus === "warning" || input.redactionWarningCount > 0) return "warning";
  return "confirmed";
}

function exportManifestQaReadiness(input: {
  integrityStatus: ProviderWebhookReviewExportManifestIntegrityStatus;
  redactionWarningCount: number;
  redactionBlockedCount: number;
  evidenceBlockedCount: number;
  evidenceIncompleteCount: number;
}): ProviderWebhookReviewExportManifestQaReadiness {
  if (input.integrityStatus === "blocked" || input.redactionBlockedCount > 0) return "blocked";
  if (
    input.integrityStatus === "warning" ||
    input.redactionWarningCount > 0 ||
    input.evidenceBlockedCount > 0 ||
    input.evidenceIncompleteCount > 0
  ) {
    return "needs_review";
  }
  return "ready";
}

function exportManifestQaReadinessForEvidenceSummary(item: ProviderWebhookReviewClosureEvidenceSummaryItem): ProviderWebhookReviewExportManifestQaReadiness {
  const redactionWarningCount = item.roomKeyDigest ? 0 : 1;
  const redactionBlockedCount = item.externalCalls === 0 ? 0 : 1;
  const integrityStatus = exportManifestIntegrityStatus({
    redactionStatus: redactionBlockedCount > 0 ? "blocked" : redactionWarningCount > 0 ? "warning" : "passed",
    deterministicExportConfirmed: item.externalCalls === 0,
    redactionWarningCount,
    redactionBlockedCount
  });
  return exportManifestQaReadiness({
    integrityStatus,
    redactionWarningCount,
    redactionBlockedCount,
    evidenceBlockedCount: item.evidenceStatus === "blocked" ? 1 : 0,
    evidenceIncompleteCount: item.evidenceStatus === "incomplete" ? 1 : 0
  });
}

function redactionIssuesForChecks(checks: ProviderWebhookReviewExportRedactionChecks): ProviderWebhookReviewExportRedactionIssue[] {
  const issues: ProviderWebhookReviewExportRedactionIssue[] = [];
  const blockedChecks: Array<[keyof ProviderWebhookReviewExportRedactionChecks, string, string, string]> = [
    ["rawPayloadAbsent", "raw-payload-present", "Raw payload reference detected", "Remove raw provider payload fields before QA export."],
    ["rawSignatureAbsent", "raw-signature-present", "Raw signature reference detected", "Remove raw signature material before QA export."],
    ["tokenAbsent", "token-present", "Provider token reference detected", "Remove token fields before QA export."],
    ["authorizationAbsent", "authorization-present", "Authorization reference detected", "Remove authorization headers before QA export."],
    ["cookieAbsent", "cookie-present", "Cookie reference detected", "Remove cookie fields before QA export."],
    ["replyTokenAbsent", "reply-token-present", "Reply token reference detected", "Remove reply token fields before QA export."],
    ["rawSenderIdAbsent", "raw-sender-id-present", "Raw sender id reference detected", "Use safe sender digest metadata only."],
    ["rawRoomIdAbsent", "raw-room-id-present", "Raw room id reference detected", "Use safe room digest metadata only."],
    ["providerSecretAbsent", "provider-secret-present", "Provider secret reference detected", "Remove provider secret fields before QA export."],
    ["providerOutboundAbsent", "provider-outbound-present", "Provider outbound action reference detected", "Keep audit/export metadata read-only."],
    ["externalCallsZero", "external-calls-nonzero", "External call count is not zero", "Investigate and keep audit/export checks local only."],
    ["tenantScoped", "tenant-scope-not-confirmed", "Tenant scope was not confirmed", "Verify x-tenant-id filtering before QA signoff."],
    ["exportDeterministic", "export-not-deterministic", "Export deterministic digest was not confirmed", "Regenerate export from stable safe fields only."]
  ];
  for (const [check, code, safeLabel, recommendedAction] of blockedChecks) {
    if (!checks[check]) {
      issues.push({ code, severity: "blocked", safeLabel, recommendedAction });
    }
  }
  if (!checks.safeRoomDigestPresent) {
    issues.push({
      code: "safe-room-digest-missing",
      severity: "warning",
      safeLabel: "Safe room digest is missing",
      recommendedAction: "Regenerate safe room digest context before QA signoff."
    });
  }
  return issues;
}

function unsafePatternAbsent(value: unknown, pattern: RegExp) {
  return !pattern.test(JSON.stringify(value));
}

function externalCallsAreZero(value: unknown): boolean {
  if (Array.isArray(value)) return value.every(externalCallsAreZero);
  if (!value || typeof value !== "object") return true;
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (key === "externalCalls" && entry !== 0) return false;
    if (!externalCallsAreZero(entry)) return false;
  }
  return true;
}

function safeDigestForExport(value: unknown) {
  return `sha256:${crypto.createHash("sha256").update(stableStringify(stripVolatileExportFields(value))).digest("hex")}`;
}

function stripVolatileExportFields(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripVolatileExportFields);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([key]) => key !== "generatedAt" && key !== "exportedAt")
      .map(([key, entry]) => [key, stripVolatileExportFields(entry)])
  );
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (!value || typeof value !== "object") return JSON.stringify(value);
  return `{${Object.keys(value as Record<string, unknown>).sort().map((key) =>
    `${JSON.stringify(key)}:${stableStringify((value as Record<string, unknown>)[key])}`
  ).join(",")}}`;
}

function checklistStepCompleted(item: ProviderWebhookUnmatchedInboundItem, step: ProviderWebhookReviewClosureChecklistStep) {
  return item.closureChecklist.some((checklistItem) => checklistItem.step === step && checklistItem.completed);
}

function countOperatorNotesForItem(item: ProviderWebhookUnmatchedInboundItem) {
  return operatorNotes.filter((note) => note.tenantId === item.tenantId && note.unmatchedId === item.id).length;
}

function exportResultSummary(item: ProviderWebhookUnmatchedInboundItem) {
  if (item.reviewStatus === "linked") return `linked:${item.linkStatus}`;
  if (item.reviewStatus === "reviewed" || item.reviewStatus === "skipped") return item.reviewStatus;
  return item.unmatchedStatus;
}

function assignmentStatusText(status: ProviderWebhookUnmatchedInboundItem["assignmentStatus"], label: string | null) {
  return status === "assigned" ? `assigned:${label ?? "unknown"}` : "unassigned";
}

function escalationStatusText(status: ProviderWebhookUnmatchedInboundItem["escalationStatus"], reason: ProviderWebhookUnmatchedInboundItem["escalationReason"]) {
  return status === "escalated" ? `escalated:${reason ?? "unspecified"}` : "none";
}

function metadataFingerprint(item: ProviderWebhookUnmatchedInboundItem) {
  return [
    item.assignmentStatus,
    item.assignedToOperatorLabel ?? "",
    item.assignedAt ?? "",
    item.escalationStatus,
    item.escalationReason ?? "",
    item.escalatedAt ?? ""
  ].join("|");
}

function resolutionFingerprint(item: ProviderWebhookUnmatchedInboundItem) {
  syncResolutionState(item);
  return [
    item.resolutionStatus,
    item.resolutionOutcome ?? "",
    item.resolvedAt ?? "",
    item.resolvedByOperatorLabel ?? "",
    item.closureReadiness,
    item.closureChecklist.map((step) => `${step.step}:${step.completed ? "1" : "0"}`).join(",")
  ].join("|");
}

function resolutionStatusText(item: ProviderWebhookUnmatchedInboundItem) {
  return item.resolutionOutcome ? `${item.resolutionStatus}:${item.resolutionOutcome}` : item.resolutionStatus;
}

function checklistStatusText(item: ProviderWebhookUnmatchedInboundItem) {
  return `${item.checklistCompletedCount}/${item.checklistTotalCount}`;
}

function bulkMetadataResult(
  id: string,
  ok: boolean,
  resultStatus: ProviderWebhookUnmatchedInboundBulkMetadataItemResult["resultStatus"],
  assignmentStatus: ProviderWebhookUnmatchedInboundBulkMetadataItemResult["assignmentStatus"],
  escalationStatus: ProviderWebhookUnmatchedInboundBulkMetadataItemResult["escalationStatus"],
  escalationReason: ProviderWebhookUnmatchedInboundBulkMetadataItemResult["escalationReason"],
  error: string | null
): ProviderWebhookUnmatchedInboundBulkMetadataItemResult {
  return {
    id,
    ok,
    resultStatus,
    assignmentStatus,
    escalationStatus,
    escalationReason,
    error,
    externalCalls: 0 as const
  };
}

function bulkResolutionResult(
  id: string,
  ok: boolean,
  resultStatus: ProviderWebhookUnmatchedInboundBulkResolutionItemResult["resultStatus"],
  resolutionStatus: ProviderWebhookUnmatchedInboundBulkResolutionItemResult["resolutionStatus"],
  resolutionOutcome: ProviderWebhookUnmatchedInboundBulkResolutionItemResult["resolutionOutcome"],
  closureReadiness: ProviderWebhookUnmatchedInboundBulkResolutionItemResult["closureReadiness"],
  checklistCompletedCount: ProviderWebhookUnmatchedInboundBulkResolutionItemResult["checklistCompletedCount"],
  checklistTotalCount: ProviderWebhookUnmatchedInboundBulkResolutionItemResult["checklistTotalCount"],
  error: string | null
): ProviderWebhookUnmatchedInboundBulkResolutionItemResult {
  return {
    id,
    ok,
    resultStatus,
    resolutionStatus,
    resolutionOutcome,
    closureReadiness,
    checklistCompletedCount,
    checklistTotalCount,
    error,
    externalCalls: 0 as const
  };
}

function bulkMetadataSummary(requestedCount: number, dedupedCount: number, results: ProviderWebhookUnmatchedInboundBulkMetadataItemResult[]) {
  return {
    requestedCount,
    dedupedCount,
    successCount: results.filter((result) => result.ok).length,
    errorCount: results.filter((result) => !result.ok).length,
    updatedCount: results.filter((result) => result.resultStatus === "updated").length,
    alreadyAppliedCount: results.filter((result) => result.resultStatus === "already-applied").length
  };
}

function bulkResolutionSummary(requestedCount: number, dedupedCount: number, results: ProviderWebhookUnmatchedInboundBulkResolutionItemResult[]) {
  return {
    requestedCount,
    dedupedCount,
    successCount: results.filter((result) => result.ok).length,
    errorCount: results.filter((result) => !result.ok).length,
    updatedCount: results.filter((result) => result.resultStatus === "updated").length,
    alreadyAppliedCount: results.filter((result) => result.resultStatus === "already-applied").length
  };
}

function addMetadataOperatorNote(
  tenantId: string,
  item: ProviderWebhookUnmatchedInboundItem,
  actorUserId: string | undefined,
  eventLabel: string,
  note: string | null,
  now: string
) {
  const safeNote = safeMetadataNote(note ?? undefined);
  const text = safeNote ? `${eventLabel}: ${safeNote}` : eventLabel;
  if (hasUnsafeSecretPattern(text)) return;
  const operatorNote: ProviderWebhookOperatorNote = {
    id: `provider-webhook-operator-note-${crypto.randomUUID()}`,
    unmatchedId: item.id,
    tenantId,
    authorId: safeActorId(actorUserId),
    authorLabel: safeActorLabel(actorUserId),
    note: text,
    context: operatorNoteContext(item),
    createdAt: now,
    updatedAt: now,
    externalCalls: 0 as const
  };
  operatorNotes.push(operatorNote);
  item.lastOperatorNoteAt = now;
  item.externalCalls = 0;
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
    "assignmentStatus",
    "assignedToOperatorLabel",
    "assignedAt",
    "escalationStatus",
    "escalationReason",
    "escalatedAt",
    "resolutionStatus",
    "resolutionOutcome",
    "closureReadiness",
    "checklistCompletedCount",
    "checklistTotalCount",
    "externalCalls"
  ];
  const csvRows = [
    columns.join(","),
    ...rows.map((row) => columns.map((column) => csvCell(row[column], column)).join(","))
  ];
  return csvRows.join("\n");
}

function csvCell(value: ProviderWebhookUnmatchedInboundExportRow[keyof ProviderWebhookUnmatchedInboundExportRow], column: keyof ProviderWebhookUnmatchedInboundExportRow) {
  if (value === null || value === undefined) return "";
  const safeValue = column === "roomKeyDigest" ? csvSafeDigest(String(value)) : String(value);
  return `"${safeValue.replace(/"/g, "\"\"")}"`;
}

function csvSafeDigest(value: string) {
  if (!value.startsWith("sha256:")) return value;
  const digest = value.slice("sha256:".length);
  return `sha256:${digest.match(/.{1,8}/g)?.join("-") ?? digest}`;
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

function safeActorLabel(actorUserId: string | undefined) {
  const actor = safeActorId(actorUserId);
  return actor === "system" ? "system" : `operator:${actor.slice(0, 12)}`;
}

function safeOperatorLabel(label: string | undefined) {
  const trimmed = label?.replace(/\s+/g, " ").trim();
  if (!trimmed || isUnsafeText(trimmed) || hasUnsafeSecretPattern(trimmed)) return null;
  return trimmed.length > 80 ? `${trimmed.slice(0, 77)}...` : trimmed;
}

function safeReviewReason(reason: ProviderWebhookUnmatchedInboundReviewRequest["reason"]) {
  const trimmed = reason?.replace(/\s+/g, " ").trim();
  if (!trimmed || isUnsafeText(trimmed)) return null;
  return trimmed.length > 120 ? `${trimmed.slice(0, 117)}...` : trimmed;
}

function safeMetadataNote(note: string | undefined) {
  const trimmed = note?.replace(/\s+/g, " ").trim();
  if (!trimmed || isUnsafeText(trimmed) || hasUnsafeSecretPattern(trimmed)) return null;
  return trimmed.length > 240 ? `${trimmed.slice(0, 237)}...` : trimmed;
}

function safeFilterText(value: string | undefined) {
  const trimmed = value?.replace(/\s+/g, " ").trim();
  if (!trimmed || isUnsafeText(trimmed) || hasUnsafeSecretPattern(trimmed)) return null;
  return trimmed.length > 80 ? `${trimmed.slice(0, 77)}...` : trimmed;
}

function safeHistoryText(value: string | null | undefined) {
  const trimmed = value?.replace(/\s+/g, " ").trim();
  if (!trimmed || isUnsafeText(trimmed)) return null;
  return trimmed.length > 160 ? `${trimmed.slice(0, 157)}...` : trimmed;
}

function safeExportFilename(value: string) {
  const sanitized = value
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
  return sanitized.endsWith(".json") ? sanitized : `${sanitized || "provider-webhook-export"}.json`;
}

function safeRoomLabel(item: ProviderWebhookUnmatchedInboundItem) {
  const digest = item.roomKeyDigest?.replace(/^sha256:/, "").slice(0, 12) ?? "none";
  return `${item.provider} room digest ${digest}`;
}

function latestItemActivityAt(item: ProviderWebhookUnmatchedInboundItem) {
  return item.lastOperatorNoteAt ?? item.escalatedAt ?? item.assignedAt ?? item.unmatchedResolvedAt ?? item.reviewedAt ?? item.receivedAt;
}

function isStaleOpenUnmatchedItem(item: ProviderWebhookUnmatchedInboundItem) {
  if (!isOpenUnmatchedStatusItem(item)) return false;
  const receivedAt = new Date(item.receivedAt).getTime();
  if (Number.isNaN(receivedAt)) return false;
  return Date.now() - receivedAt >= 3 * 24 * 60 * 60 * 1000;
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

function hasUnsafeSecretPattern(value: string) {
  return /raw\s*(provider\s*)?(payload|webhook payload|signature|sender|room|sender id|room id)|replyToken|authorization|cookie|bearer\s+|token\s*[:=]|secret\s*[:=]|signature\s*[:=]|provider credential|access token|webhook secret|sk-[a-z0-9_-]{8,}|EA[A-Za-z0-9]{20,}/i.test(value);
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
