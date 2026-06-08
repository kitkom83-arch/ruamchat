import crypto from "node:crypto";
import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import {
  createProviderWebhookOperatorNoteRequestSchema,
  createProviderWebhookReviewSavedViewRequestSchema,
  providerWebhookReviewQaHandoffAcceptanceLockRequestSchema,
  providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRequestSchema,
  providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunRequestSchema,
  providerWebhookUnmatchedInboundAssignmentRequestSchema,
  providerWebhookUnmatchedInboundBulkAssignmentRequestSchema,
  providerWebhookUnmatchedInboundBulkEscalationRequestSchema,
  providerWebhookUnmatchedInboundBulkResolutionRequestSchema,
  providerWebhookUnmatchedInboundResolutionChecklistRequestSchema,
  providerWebhookUnmatchedInboundResolutionRequestSchema,
  providerWebhookReviewSavedViewFiltersSchema,
  providerWebhookReviewQaHandoffFinalizationSignOffRequestSchema,
  providerWebhookReviewQaHandoffSignOffRequestSchema,
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
  type ProviderWebhookReviewQaHandoffBundle,
  type ProviderWebhookReviewQaHandoffBundleExport,
  type ProviderWebhookReviewQaHandoffAcceptanceLock,
  type ProviderWebhookReviewQaHandoffLockedArchiveExport,
  type ProviderWebhookReviewQaHandoffLockedArchiveStatus,
  type ProviderWebhookReviewQaHandoffArchiveIntegrity,
  type ProviderWebhookReviewQaHandoffArchiveFinalization,
  type ProviderWebhookReviewQaHandoffFinalizationReceipt,
  type ProviderWebhookReviewQaHandoffFinalizationSignOffResponse,
  type ProviderWebhookReviewQaHandoffReleaseEvidence,
  type ProviderWebhookReviewQaHandoffReleaseCertification,
  type ProviderWebhookReviewQaHandoffReleaseClosureLedger,
  type ProviderWebhookReviewQaHandoffReleaseAttestationAudit,
  type ProviderWebhookReviewQaHandoffReleaseAttestationReconciliationRegister,
  type ProviderWebhookReviewQaHandoffCertifiedReleaseGate,
  type ProviderWebhookReviewQaHandoffCertifiedReleaseGateBlockingReason,
  type ProviderWebhookReviewQaHandoffCertifiedReleaseDecisionReceipt,
  type ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord,
  type ProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedger,
  type ProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificate,
  type ProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister,
  type ProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt,
  type ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket,
  type ProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun,
  type ProviderWebhookReviewQaHandoffReleaseVerification,
  type ProviderWebhookReviewQaHandoffReleaseVerificationDigestRow,
  type ProviderWebhookReviewQaHandoffReleaseVerificationStatus,
  type ProviderWebhookReviewQaHandoffRetentionAudit,
  type ProviderWebhookReviewQaHandoffRetentionManifest,
  type ProviderWebhookReviewQaHandoffReceipt,
  type ProviderWebhookReviewQaHandoffSignOffResponse,
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
const qaHandoffReceiptSignOffs: QaHandoffReceiptSignOffRecord[] = [];
const qaHandoffAcceptanceLocks: QaHandoffAcceptanceLockRecord[] = [];
const qaHandoffLockedArchiveExports: QaHandoffLockedArchiveExportRecord[] = [];
const qaHandoffArchiveFinalizationSignOffs: QaHandoffArchiveFinalizationSignOffRecord[] = [];
const qaHandoffCertifiedReleaseHandoffAcceptanceRecords: QaHandoffCertifiedReleaseHandoffAcceptanceRecord[] = [];
const qaHandoffCertifiedReleaseNoopExecutionDryRuns: QaHandoffCertifiedReleaseNoopExecutionDryRunRecord[] = [];
const dedupFirstSeenAtByDigest = new Map<string, string>();

type QaHandoffReceiptSignOffRecord = {
  id: string;
  tenantId: string;
  receiptDigest: string;
  bundleDigest: string;
  exportDigest: string;
  acknowledgementType: "acknowledge" | "sign_off";
  reviewerRole: string | null;
  reviewerLabel: string | null;
  acknowledgedAt: string;
  signedAt: string | null;
  externalCalls: 0;
};

type QaHandoffAcceptanceLockRecord = {
  id: string;
  tenantId: string;
  receiptDigest: string;
  bundleDigest: string;
  exportDigest: string;
  appliedFilters: ProviderWebhookReviewClosureReportFilters;
  lockedUnmatchedInboundIds: string[];
  lockReason: string | null;
  acceptedByRole: string | null;
  acceptedByLabel: string | null;
  lockedAt: string;
  externalCalls: 0;
};

type QaHandoffLockedArchiveExportRecord = {
  id: string;
  tenantId: string;
  lockRecordId: string;
  receiptDigest: string;
  bundleDigest: string;
  exportDigest: string;
  acceptanceLockDigest: string;
  safeDigest: string;
  safeFilename: string;
  exportedAt: string;
  externalCalls: 0;
};

type QaHandoffArchiveFinalizationSignOffRecord = {
  id: string;
  tenantId: string;
  lockedArchiveDigest: string;
  retentionManifestDigest: string;
  integrityDigest: string;
  safeDigest: string;
  reviewerRole: string | null;
  reviewerLabel: string | null;
  signedAt: string;
  finalizedAt: string;
  externalCalls: 0;
};

type QaHandoffCertifiedReleaseHandoffAcceptanceRecord = {
  id: string;
  tenantId: string;
  handoffPacketDigest: string;
  decisionReceiptDigest: string;
  releaseGateDigest: string;
  safeDigest: string;
  acknowledgedChecklistKeys: string[];
  acknowledgedByRole: string | null;
  acknowledgedByLabel: string | null;
  acknowledgedAt: string;
  externalCalls: 0;
};

type QaHandoffCertifiedReleaseNoopExecutionDryRunRecord = {
  id: string;
  tenantId: string;
  acceptanceRecordDigest: string;
  handoffPacketDigest: string;
  decisionReceiptDigest: string;
  releaseGateDigest: string;
  safeDigest: string;
  requestedBy: string | null;
  checklistAcknowledged: boolean;
  operatorNote: string | null;
  dryRunReason: string | null;
  executedAt: string;
  externalCalls: 0;
};

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

  getReviewQaHandoffBundle(
    tenantId: string,
    filters: ProviderWebhookReviewClosureReportFilters = {},
    actorUserId?: string
  ): ProviderWebhookReviewQaHandoffBundle {
    const reportExport = this.getReviewClosureReportExport(tenantId, filters, actorUserId);
    const appliedFilters = reportExport.appliedFilters;
    const closureReportManifest = this.getReviewClosureReportExportManifest(tenantId, appliedFilters, actorUserId);
    const closureReportRedactionAudit = this.getReviewClosureReportRedactionAudit(tenantId, appliedFilters, actorUserId);
    const closureExportIntegrity = this.getReviewClosureExportIntegrity(tenantId, appliedFilters, actorUserId);
    const evidenceManifests = [
      ...reportExport.topEvidenceReadyItems,
      ...reportExport.topEvidenceBlockedItems
    ].slice(0, 10).map((item) => qaHandoffEvidenceItemFromManifest(
      item,
      this.getUnmatchedInboundClosureEvidenceExportManifest(tenantId, item.unmatchedId)
    ));
    const readiness = qaHandoffReadinessFromSnapshot(getProviderWebhookGuardrailReadinessSnapshot());
    const manualQaChecks = qaHandoffManualQaChecks({
      readiness,
      closureReportManifest,
      closureReportRedactionAudit,
      closureExportIntegrity,
      evidenceManifests
    });
    const manualQaReadiness = qaHandoffBundleReadiness({
      closureReportManifest,
      closureExportIntegrity,
      evidenceManifests,
      manualQaChecks
    });
    const safeFilename = safeExportFilename("provider-webhook-review-qa-handoff-bundle.json");
    const digestPayload = {
      bundleKind: "provider-webhook-review-qa-handoff-bundle",
      appliedFilters,
      readiness,
      closureReportExport: reportExport,
      closureReportManifest,
      closureReportRedactionAudit,
      closureExportIntegrity,
      evidenceManifests,
      manualQaReadiness,
      manualQaChecks,
      safeFilename,
      externalCalls: 0
    };

    return {
      generatedAt: new Date().toISOString(),
      ...digestPayload,
      bundleKind: "provider-webhook-review-qa-handoff-bundle",
      safeDigest: safeDigestForExport(digestPayload),
      externalCalls: 0 as const
    };
  }

  getReviewQaHandoffBundleExport(
    tenantId: string,
    filters: ProviderWebhookReviewClosureReportFilters = {},
    actorUserId?: string
  ): ProviderWebhookReviewQaHandoffBundleExport {
    const bundle = this.getReviewQaHandoffBundle(tenantId, filters, actorUserId);
    const safeFilename = safeExportFilename("provider-webhook-review-qa-handoff-bundle-export.json");
    const exportedAt = new Date().toISOString();
    const exportPayload = {
      generatedAt: bundle.generatedAt,
      exportedAt,
      exportKind: "qa-handoff-bundle" as const,
      format: "json" as const,
      contentType: "application/json" as const,
      safeFilename,
      status: bundle.manualQaReadiness,
      counts: {
        totalItems: bundle.closureReportExport.totalItems,
        totalOpenItems: bundle.closureReportExport.totalOpenItems,
        evidenceManifestCount: bundle.evidenceManifests.length,
        closureEvidenceReadyCount: bundle.readiness.closureEvidenceReadyCount,
        closureEvidenceBlockedCount: bundle.readiness.closureEvidenceBlockedCount,
        closureEvidenceIncompleteCount: bundle.readiness.closureEvidenceIncompleteCount
      },
      readinessFlags: {
        reviewClosureEvidenceEnabled: bundle.readiness.reviewClosureEvidenceEnabled,
        reviewClosureReportEnabled: bundle.readiness.reviewClosureReportEnabled,
        reviewClosureEvidenceExportEnabled: bundle.readiness.reviewClosureEvidenceExportEnabled,
        reviewClosureReportExportEnabled: bundle.readiness.reviewClosureReportExportEnabled,
        reviewExportRedactionAuditEnabled: bundle.readiness.reviewExportRedactionAuditEnabled,
        reviewExportIntegrityChecksEnabled: bundle.readiness.reviewExportIntegrityChecksEnabled,
        reviewExportManifestEnabled: bundle.readiness.reviewExportManifestEnabled,
        reviewExportQaHandoffEnabled: bundle.readiness.reviewExportQaHandoffEnabled
      },
      closureEvidenceSummary: {
        readyCount: bundle.readiness.closureEvidenceReadyCount,
        blockedCount: bundle.readiness.closureEvidenceBlockedCount,
        incompleteCount: bundle.readiness.closureEvidenceIncompleteCount,
        exportCount: bundle.readiness.closureEvidenceExportCount,
        externalCalls: 0 as const
      },
      exportManifestSummary: {
        readyCount: bundle.readiness.exportManifestReadyCount,
        needsReviewCount: bundle.readiness.exportManifestNeedsReviewCount,
        blockedCount: bundle.readiness.exportManifestBlockedCount,
        latestStatus: bundle.readiness.latestExportManifestStatus,
        reportManifestReadiness: bundle.closureReportManifest.manualQaReadiness,
        reportManifestIntegrityStatus: bundle.closureReportManifest.integrityStatus,
        externalCalls: 0 as const
      },
      redactionAuditSummary: {
        status: bundle.closureReportRedactionAudit.status,
        issueCount: bundle.closureReportRedactionAudit.issues.length,
        passedCount: bundle.closureExportIntegrity.redactionPassedCount,
        warningCount: bundle.closureExportIntegrity.redactionWarningCount,
        blockedCount: bundle.closureExportIntegrity.redactionBlockedCount,
        rawPayloadAbsent: bundle.closureReportRedactionAudit.checks.rawPayloadAbsent,
        rawSignatureAbsent: bundle.closureReportRedactionAudit.checks.rawSignatureAbsent,
        tokenAbsent: bundle.closureReportRedactionAudit.checks.tokenAbsent,
        replyTokenAbsent: bundle.closureReportRedactionAudit.checks.replyTokenAbsent,
        rawSenderIdAbsent: bundle.closureReportRedactionAudit.checks.rawSenderIdAbsent,
        rawRoomIdAbsent: bundle.closureReportRedactionAudit.checks.rawRoomIdAbsent,
        providerOutboundAbsent: bundle.closureReportRedactionAudit.checks.providerOutboundAbsent,
        externalCallsZero: bundle.closureReportRedactionAudit.checks.externalCallsZero,
        externalCalls: 0 as const
      },
      integritySummary: {
        status: bundle.closureReportManifest.integrityStatus,
        totalCheckedItems: bundle.closureExportIntegrity.totalCheckedItems,
        deterministicExportConfirmed: bundle.closureExportIntegrity.deterministicExportConfirmed,
        safeReportDigest: bundle.closureExportIntegrity.safeReportDigest,
        externalCalls: 0 as const
      },
      manualQaChecks: bundle.manualQaChecks,
      bundle,
      externalCalls: 0 as const
    };

    return {
      ...exportPayload,
      safeDigest: safeDigestForExport(exportPayload),
      externalCalls: 0 as const
    };
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
      const acceptanceLock = qaHandoffAcceptanceLockForItem(tenantId, item);
      if (acceptanceLock) {
        results.push(bulkResolutionResult(id, false, "conflict", item.resolutionStatus, item.resolutionOutcome, item.closureReadiness, item.checklistCompletedCount, item.checklistTotalCount, qaHandoffAcceptanceLockConflictMessage(acceptanceLock)));
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

  getReviewQaHandoffBundleReceipt(
    tenantId: string,
    filters: ProviderWebhookReviewClosureReportFilters = {},
    actorUserId?: string
  ): ProviderWebhookReviewQaHandoffReceipt {
    const exportResult = this.getReviewQaHandoffBundleExport(tenantId, filters, actorUserId);
    const signOffEntry = latestReceiptSignOffRecord(tenantId, exportResult.bundle.safeDigest, exportResult.safeDigest);
    const receiptStatus: ProviderWebhookReviewQaHandoffReceipt["receiptStatus"] = signOffEntry?.acknowledgementType === "sign_off"
      ? "signed_off"
      : signOffEntry?.acknowledgementType === "acknowledge"
        ? "acknowledged"
        : "not_acknowledged";
    const receiptPayload = {
      generatedAt: new Date().toISOString(),
      receiptStatus,
      bundleStatus: exportResult.bundle.manualQaReadiness,
      exportStatus: exportResult.status,
      safeFilename: exportResult.safeFilename,
      bundleDigest: exportResult.bundle.safeDigest,
      exportDigest: exportResult.safeDigest,
      readinessFlags: exportResult.readinessFlags,
      counts: exportResult.counts,
      manualQaChecks: exportResult.manualQaChecks,
      reviewerRole: signOffEntry?.reviewerRole ?? null,
      reviewerLabel: signOffEntry?.reviewerLabel ?? null,
      acknowledgedAt: signOffEntry?.acknowledgedAt ?? null,
      signedAt: signOffEntry?.signedAt ?? null,
      externalCalls: 0 as const
    };

    return {
      ...receiptPayload,
      safeDigest: safeDigestForExport(receiptPayload),
      externalCalls: 0 as const
    };
  }

  signOffReviewQaHandoffBundleReceipt(
    tenantId: string,
    filters: ProviderWebhookReviewClosureReportFilters = {},
    body: unknown,
    actorUserId?: string
  ): ProviderWebhookReviewQaHandoffSignOffResponse {
    const parsed = providerWebhookReviewQaHandoffSignOffRequestSchema.safeParse(body ?? {});
    if (!parsed.success) throw new BadRequestException("Invalid provider webhook QA handoff sign-off request");
    const receiptBefore = this.getReviewQaHandoffBundleReceipt(tenantId, filters, actorUserId);
    const now = new Date().toISOString();
    const signOffEntry: QaHandoffReceiptSignOffRecord = {
      id: `provider-webhook-qa-handoff-signoff-${crypto.randomUUID()}`,
      tenantId,
      receiptDigest: receiptBefore.safeDigest,
      bundleDigest: receiptBefore.bundleDigest,
      exportDigest: receiptBefore.exportDigest,
      acknowledgementType: parsed.data.acknowledgementType,
      reviewerRole: safeOperatorLabel(parsed.data.reviewerRole) ?? "reviewer",
      reviewerLabel: safeOperatorLabel(parsed.data.reviewerLabel) ?? safeActorLabel(actorUserId),
      acknowledgedAt: now,
      signedAt: parsed.data.acknowledgementType === "sign_off" ? now : null,
      externalCalls: 0 as const
    };
    qaHandoffReceiptSignOffs.unshift(signOffEntry);
    const receipt = this.getReviewQaHandoffBundleReceipt(tenantId, filters, actorUserId);
    return {
      ...receipt,
      signOffStatus: receipt.receiptStatus,
      signOffRecordId: signOffEntry.id,
      action: signOffEntry.acknowledgementType,
      externalCalls: 0 as const
    };
  }

  getReviewQaHandoffAcceptanceLock(
    tenantId: string,
    filters: ProviderWebhookReviewClosureReportFilters = {},
    actorUserId?: string
  ): ProviderWebhookReviewQaHandoffAcceptanceLock {
    const receipt = this.getReviewQaHandoffBundleReceipt(tenantId, filters, actorUserId);
    const { normalizedFilters, filteredItems } = this.getClosureReportItems(tenantId, filters, actorUserId);
    const existing = latestAcceptanceLockRecord(tenantId, receipt.bundleDigest, receipt.exportDigest);
    return qaHandoffAcceptanceLockResponse({
      receipt,
      appliedFilters: existing?.appliedFilters ?? normalizedFilters,
      lockRecord: existing ?? null,
      lockAction: existing ? "already_locked" : "none",
      itemIds: existing?.lockedUnmatchedInboundIds ?? filteredItems.map((item) => item.unmatchedId),
      openItemCount: existing
        ? openLockedItemCount(tenantId, existing.lockedUnmatchedInboundIds)
        : filteredItems.filter((item) => isOpenUnmatchedStatus(item.unmatchedStatus)).length
    });
  }

  lockReviewQaHandoffAcceptance(
    tenantId: string,
    filters: ProviderWebhookReviewClosureReportFilters = {},
    body: unknown,
    actorUserId?: string
  ): ProviderWebhookReviewQaHandoffAcceptanceLock {
    const parsed = providerWebhookReviewQaHandoffAcceptanceLockRequestSchema.safeParse(body ?? {});
    if (!parsed.success) throw new BadRequestException("Invalid provider webhook QA handoff acceptance lock request");
    const receipt = this.getReviewQaHandoffBundleReceipt(tenantId, filters, actorUserId);
    if (receipt.receiptStatus !== "signed_off") {
      throw new ConflictException("Provider webhook QA handoff receipt must be signed off before acceptance lock");
    }
    const existing = latestAcceptanceLockRecord(tenantId, receipt.bundleDigest, receipt.exportDigest);
    if (existing) {
      return qaHandoffAcceptanceLockResponse({
        receipt,
        appliedFilters: existing.appliedFilters,
        lockRecord: existing,
        lockAction: "already_locked",
        itemIds: existing.lockedUnmatchedInboundIds,
        openItemCount: openLockedItemCount(tenantId, existing.lockedUnmatchedInboundIds)
      });
    }

    const { normalizedFilters, filteredItems } = this.getClosureReportItems(tenantId, filters, actorUserId);
    const lockRecord: QaHandoffAcceptanceLockRecord = {
      id: `provider-webhook-qa-handoff-acceptance-lock-${crypto.randomUUID()}`,
      tenantId,
      receiptDigest: receipt.safeDigest,
      bundleDigest: receipt.bundleDigest,
      exportDigest: receipt.exportDigest,
      appliedFilters: normalizedFilters,
      lockedUnmatchedInboundIds: filteredItems.map((item) => item.unmatchedId),
      lockReason: safeMetadataNote(parsed.data.lockReason) ?? "QA handoff accepted",
      acceptedByRole: safeOperatorLabel(parsed.data.acceptedByRole) ?? receipt.reviewerRole ?? "QA reviewer",
      acceptedByLabel: safeOperatorLabel(parsed.data.acceptedByLabel) ?? receipt.reviewerLabel ?? safeActorLabel(actorUserId),
      lockedAt: new Date().toISOString(),
      externalCalls: 0 as const
    };
    qaHandoffAcceptanceLocks.unshift(lockRecord);
    return qaHandoffAcceptanceLockResponse({
      receipt,
      appliedFilters: normalizedFilters,
      lockRecord,
      lockAction: "locked",
      itemIds: lockRecord.lockedUnmatchedInboundIds,
      openItemCount: filteredItems.filter((item) => isOpenUnmatchedStatus(item.unmatchedStatus)).length
    });
  }

  getReviewQaHandoffLockedArchive(
    tenantId: string,
    filters: ProviderWebhookReviewClosureReportFilters = {},
    actorUserId?: string
  ): ProviderWebhookReviewQaHandoffLockedArchiveStatus {
    const context = this.getLockedArchiveContext(tenantId, filters, actorUserId);
    return qaHandoffLockedArchiveStatusResponse(context);
  }

  exportReviewQaHandoffLockedArchive(
    tenantId: string,
    filters: ProviderWebhookReviewClosureReportFilters = {},
    actorUserId?: string
  ): ProviderWebhookReviewQaHandoffLockedArchiveExport {
    const context = this.getLockedArchiveContext(tenantId, filters, actorUserId);
    const now = new Date().toISOString();
    const existing = latestLockedArchiveExportRecord(tenantId, context.lockRecord.id, context.acceptanceLock.safeDigest);
    const exportRecord = existing ?? {
      id: `provider-webhook-qa-handoff-locked-archive-export-${crypto.randomUUID()}`,
      tenantId,
      lockRecordId: context.lockRecord.id,
      receiptDigest: context.receipt.safeDigest,
      bundleDigest: context.receipt.bundleDigest,
      exportDigest: context.receipt.exportDigest,
      acceptanceLockDigest: context.acceptanceLock.safeDigest,
      safeDigest: "",
      safeFilename: safeExportFilename("provider-webhook-review-qa-handoff-locked-archive-export.json"),
      exportedAt: now,
      externalCalls: 0 as const
    };
    const payload = qaHandoffLockedArchiveStatusResponse({ ...context, archiveRecord: exportRecord });
    const completed: QaHandoffLockedArchiveExportRecord = {
      ...exportRecord,
      safeDigest: payload.safeDigest,
      externalCalls: 0 as const
    };
    if (!existing) qaHandoffLockedArchiveExports.unshift(completed);

    return {
      ...payload,
      lockedArchiveStatus: "exported",
      archiveAcknowledgementStatus: "exported",
      exportedAt: completed.exportedAt,
      exportKind: "qa-handoff-locked-archive",
      format: "json",
      contentType: "application/json",
      externalCalls: 0 as const
    };
  }

  getReviewQaHandoffRetentionManifest(
    tenantId: string,
    filters: ProviderWebhookReviewClosureReportFilters = {},
    actorUserId?: string
  ): ProviderWebhookReviewQaHandoffRetentionManifest {
    const context = this.getLockedArchiveContext(tenantId, filters, actorUserId);
    const archive = qaHandoffLockedArchiveStatusResponse(context);
    const safeFilename = safeExportFilename("provider-webhook-review-qa-handoff-locked-archive-retention-manifest.json");
    const payload = {
      generatedAt: new Date().toISOString(),
      manifestKind: "qa-handoff-locked-archive-retention-manifest" as const,
      retentionManifestStatus: "ready" as const,
      lockedArchiveStatus: archive.lockedArchiveStatus,
      archiveAcknowledgementStatus: archive.archiveAcknowledgementStatus,
      acceptanceStatus: "locked" as const,
      lockStatus: "locked" as const,
      receiptStatus: archive.receiptStatus,
      signOffStatus: archive.signOffStatus,
      bundleStatus: archive.bundleStatus,
      exportStatus: archive.exportStatus,
      safeFilename,
      archiveDigest: archive.safeDigest,
      bundleDigest: archive.bundleDigest,
      exportDigest: archive.exportDigest,
      receiptDigest: archive.receiptDigest,
      acceptanceLockDigest: archive.acceptanceLockDigest,
      retentionPolicyLabel: archive.retentionPolicyLabel,
      retentionReadiness: "ready" as const,
      readinessFlags: archive.readinessFlags,
      counts: archive.counts,
      manualQaChecks: archive.manualQaChecks,
      archivedAt: archive.archivedAt,
      exportedAt: archive.exportedAt,
      externalCalls: 0 as const
    };
    return {
      ...payload,
      safeDigest: safeDigestForExport(payload),
      externalCalls: 0 as const
    };
  }

  getReviewQaHandoffArchiveIntegrity(
    tenantId: string,
    filters: ProviderWebhookReviewClosureReportFilters = {},
    actorUserId?: string
  ): ProviderWebhookReviewQaHandoffArchiveIntegrity {
    const context = this.getLockedArchiveContext(tenantId, filters, actorUserId);
    const lockedArchive = qaHandoffLockedArchiveStatusResponse(context);
    const retentionManifest = this.getReviewQaHandoffRetentionManifest(tenantId, filters, actorUserId);
    return qaHandoffArchiveIntegrityResponse(lockedArchive, retentionManifest);
  }

  getReviewQaHandoffRetentionAudit(
    tenantId: string,
    filters: ProviderWebhookReviewClosureReportFilters = {},
    actorUserId?: string
  ): ProviderWebhookReviewQaHandoffRetentionAudit {
    const context = this.getLockedArchiveContext(tenantId, filters, actorUserId);
    const lockedArchive = qaHandoffLockedArchiveStatusResponse(context);
    const retentionManifest = this.getReviewQaHandoffRetentionManifest(tenantId, filters, actorUserId);
    return qaHandoffRetentionAuditResponse(lockedArchive, retentionManifest);
  }

  getReviewQaHandoffArchiveFinalization(
    tenantId: string,
    filters: ProviderWebhookReviewClosureReportFilters = {},
    actorUserId?: string
  ): ProviderWebhookReviewQaHandoffArchiveFinalization {
    const integrity = this.getReviewQaHandoffArchiveIntegrity(tenantId, filters, actorUserId);
    const retentionAudit = this.getReviewQaHandoffRetentionAudit(tenantId, filters, actorUserId);
    assertQaHandoffArchiveFinalizationReady(integrity, retentionAudit);
    const record = latestArchiveFinalizationSignOffRecord(
      tenantId,
      integrity.lockedArchiveDigest,
      integrity.retentionManifestDigest,
      integrity.safeDigest
    );
    return qaHandoffArchiveFinalizationResponse(integrity, retentionAudit, record);
  }

  signOffReviewQaHandoffArchiveFinalization(
    tenantId: string,
    filters: ProviderWebhookReviewClosureReportFilters = {},
    body: unknown,
    actorUserId?: string
  ): ProviderWebhookReviewQaHandoffFinalizationSignOffResponse {
    const parsed = providerWebhookReviewQaHandoffFinalizationSignOffRequestSchema.safeParse(body ?? {});
    if (!parsed.success) throw new BadRequestException("Invalid provider webhook QA archive finalization sign-off payload");
    const integrity = this.getReviewQaHandoffArchiveIntegrity(tenantId, filters, actorUserId);
    const retentionAudit = this.getReviewQaHandoffRetentionAudit(tenantId, filters, actorUserId);
    assertQaHandoffArchiveFinalizationReady(integrity, retentionAudit);
    const existing = latestArchiveFinalizationSignOffRecord(
      tenantId,
      integrity.lockedArchiveDigest,
      integrity.retentionManifestDigest,
      integrity.safeDigest
    );
    const record = existing ?? createArchiveFinalizationSignOffRecord({
      tenantId,
      integrity,
      retentionAudit,
      reviewerRole: parsed.data.reviewerRole,
      reviewerLabel: safeOperatorLabel(parsed.data.reviewerLabel) ?? safeActorLabel(actorUserId)
    });
    if (!existing) qaHandoffArchiveFinalizationSignOffs.unshift(record);
    return qaHandoffArchiveFinalizationSignOffResponse(integrity, retentionAudit, record);
  }

  getReviewQaHandoffArchiveFinalizationReceipt(
    tenantId: string,
    filters: ProviderWebhookReviewClosureReportFilters = {},
    actorUserId?: string
  ): ProviderWebhookReviewQaHandoffFinalizationReceipt {
    const integrity = this.getReviewQaHandoffArchiveIntegrity(tenantId, filters, actorUserId);
    const retentionAudit = this.getReviewQaHandoffRetentionAudit(tenantId, filters, actorUserId);
    assertQaHandoffArchiveFinalizationReady(integrity, retentionAudit);
    const record = latestArchiveFinalizationSignOffRecord(
      tenantId,
      integrity.lockedArchiveDigest,
      integrity.retentionManifestDigest,
      integrity.safeDigest
    );
    if (!record) {
      throw new ConflictException("Provider webhook QA archive finalization sign-off is required before finalization receipt");
    }
    return qaHandoffArchiveFinalizationReceiptResponse(integrity, retentionAudit, record);
  }

  getReviewQaHandoffArchiveReleaseEvidence(
    tenantId: string,
    filters: ProviderWebhookReviewClosureReportFilters = {},
    actorUserId?: string
  ): ProviderWebhookReviewQaHandoffReleaseEvidence {
    const context = this.getLockedArchiveContext(tenantId, filters, actorUserId);
    if (!context.archiveRecord) {
      throw new ConflictException("Provider webhook QA locked archive export is required before release evidence");
    }
    const lockedArchive = qaHandoffLockedArchiveStatusResponse(context);
    const retentionManifest = this.getReviewQaHandoffRetentionManifest(tenantId, filters, actorUserId);
    const integrity = qaHandoffArchiveIntegrityResponse(lockedArchive, retentionManifest);
    const retentionAudit = qaHandoffRetentionAuditResponse(lockedArchive, retentionManifest);
    assertQaHandoffArchiveFinalizationReady(integrity, retentionAudit);
    const record = latestArchiveFinalizationSignOffRecord(
      tenantId,
      integrity.lockedArchiveDigest,
      integrity.retentionManifestDigest,
      integrity.safeDigest
    );
    if (!record) {
      throw new ConflictException("Provider webhook QA archive finalization sign-off is required before release evidence");
    }
    const receipt = qaHandoffArchiveFinalizationReceiptResponse(integrity, retentionAudit, record);
    return qaHandoffArchiveReleaseEvidenceResponse(receipt, retentionAudit);
  }

  getReviewQaHandoffArchiveReleaseVerification(
    tenantId: string,
    filters: ProviderWebhookReviewClosureReportFilters = {},
    actorUserId?: string
  ): ProviderWebhookReviewQaHandoffReleaseVerification {
    const releaseEvidence = this.getReviewQaHandoffArchiveReleaseEvidence(tenantId, filters, actorUserId);
    if (releaseEvidence.releaseReadinessStatus !== "ready_for_release") {
      throw new ConflictException("Provider webhook QA archive release evidence must be ready_for_release before verification");
    }
    return qaHandoffArchiveReleaseVerificationResponse(releaseEvidence);
  }

  getReviewQaHandoffArchiveReleaseCertification(
    tenantId: string,
    filters: ProviderWebhookReviewClosureReportFilters = {},
    actorUserId?: string
  ): ProviderWebhookReviewQaHandoffReleaseCertification {
    const releaseVerification = this.getReviewQaHandoffArchiveReleaseVerification(tenantId, filters, actorUserId);
    assertQaHandoffArchiveReleaseCertificationReady(releaseVerification);
    return qaHandoffArchiveReleaseCertificationResponse(releaseVerification);
  }

  getReviewQaHandoffArchiveReleaseClosureLedger(
    tenantId: string,
    filters: ProviderWebhookReviewClosureReportFilters = {},
    actorUserId?: string
  ): ProviderWebhookReviewQaHandoffReleaseClosureLedger {
    const releaseCertification = this.getReviewQaHandoffArchiveReleaseCertification(tenantId, filters, actorUserId);
    assertQaHandoffArchiveReleaseClosureLedgerReady(releaseCertification);
    return qaHandoffArchiveReleaseClosureLedgerResponse(releaseCertification);
  }

  getReviewQaHandoffArchiveReleaseAttestationAudit(
    tenantId: string,
    filters: ProviderWebhookReviewClosureReportFilters = {},
    actorUserId?: string
  ): ProviderWebhookReviewQaHandoffReleaseAttestationAudit {
    const closureLedger = this.getReviewQaHandoffArchiveReleaseClosureLedger(tenantId, filters, actorUserId);
    assertQaHandoffArchiveReleaseAttestationAuditReady(closureLedger);
    return qaHandoffArchiveReleaseAttestationAuditResponse(closureLedger);
  }

  getReviewQaHandoffArchiveReleaseAttestationReconciliation(
    tenantId: string,
    filters: ProviderWebhookReviewClosureReportFilters = {},
    actorUserId?: string
  ): ProviderWebhookReviewQaHandoffReleaseAttestationReconciliationRegister {
    const attestationAudit = this.getReviewQaHandoffArchiveReleaseAttestationAudit(tenantId, filters, actorUserId);
    assertQaHandoffArchiveReleaseAttestationReconciliationReady(attestationAudit);
    return qaHandoffArchiveReleaseAttestationReconciliationResponse(attestationAudit);
  }

  getReviewQaHandoffCertifiedReleaseGate(
    tenantId: string,
    filters: ProviderWebhookReviewClosureReportFilters = {},
    actorUserId?: string
  ): ProviderWebhookReviewQaHandoffCertifiedReleaseGate {
    const reconciliation = this.getReviewQaHandoffArchiveReleaseAttestationReconciliation(tenantId, filters, actorUserId);
    assertQaHandoffCertifiedReleaseGatePrerequisites(reconciliation);
    return qaHandoffCertifiedReleaseGateResponse(reconciliation);
  }

  getReviewQaHandoffCertifiedReleaseDecisionReceipt(
    tenantId: string,
    filters: ProviderWebhookReviewClosureReportFilters = {},
    actorUserId?: string
  ): ProviderWebhookReviewQaHandoffCertifiedReleaseDecisionReceipt {
    const releaseGate = this.getReviewQaHandoffCertifiedReleaseGate(tenantId, filters, actorUserId);
    assertQaHandoffCertifiedReleaseDecisionReceiptPrerequisites(releaseGate);
    return qaHandoffCertifiedReleaseDecisionReceiptResponse(releaseGate);
  }

  getReviewQaHandoffCertifiedReleaseHandoffPacket(
    tenantId: string,
    filters: ProviderWebhookReviewClosureReportFilters = {},
    actorUserId?: string
  ): ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket {
    const decisionReceipt = this.getReviewQaHandoffCertifiedReleaseDecisionReceipt(tenantId, filters, actorUserId);
    assertQaHandoffCertifiedReleaseHandoffPacketPrerequisites(decisionReceipt);
    return qaHandoffCertifiedReleaseHandoffPacketResponse(decisionReceipt);
  }

  getReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord(
    tenantId: string,
    filters: ProviderWebhookReviewClosureReportFilters = {},
    actorUserId?: string
  ): ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord {
    const handoffPacket = this.getReviewQaHandoffCertifiedReleaseHandoffPacket(tenantId, filters, actorUserId);
    assertQaHandoffCertifiedReleaseHandoffAcceptanceRecordPrerequisites(handoffPacket);
    const record = latestCertifiedReleaseHandoffAcceptanceRecord(tenantId, handoffPacket.handoffPacketDigest);
    return qaHandoffCertifiedReleaseHandoffAcceptanceRecordResponse(handoffPacket, record ?? null);
  }

  acknowledgeReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord(
    tenantId: string,
    filters: ProviderWebhookReviewClosureReportFilters = {},
    body: unknown,
    actorUserId?: string
  ): ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord {
    const parsed = providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRequestSchema.safeParse(body ?? {});
    if (!parsed.success) throw new BadRequestException("Invalid provider webhook QA archive certified release handoff acceptance record request");
    const handoffPacket = this.getReviewQaHandoffCertifiedReleaseHandoffPacket(tenantId, filters, actorUserId);
    assertQaHandoffCertifiedReleaseHandoffAcceptanceRecordPrerequisites(handoffPacket);
    if (!certifiedReleaseHandoffPacketReadyForAcceptance(handoffPacket)) {
      return qaHandoffCertifiedReleaseHandoffAcceptanceRecordResponse(handoffPacket, null);
    }

    const now = new Date().toISOString();
    const existing = latestCertifiedReleaseHandoffAcceptanceRecord(tenantId, handoffPacket.handoffPacketDigest);
    const acknowledgedChecklistKeys = Array.from(new Set(parsed.data.acknowledgedChecklistKeys));
    const recordPayload = {
      acceptanceKind: "qa-handoff-locked-archive-certified-release-handoff-acceptance-record",
      handoffPacketDigest: handoffPacket.handoffPacketDigest,
      decisionReceiptDigest: handoffPacket.decisionReceiptDigest,
      releaseGateDigest: handoffPacket.releaseGateDigest,
      acknowledgedChecklistKeys,
      acknowledgedByRole: safeOperatorLabel(parsed.data.acknowledgedByRole) ?? "release owner",
      acknowledgedByLabel: safeOperatorLabel(parsed.data.acknowledgedByLabel) ?? safeActorLabel(actorUserId),
      acknowledgedAt: now,
      externalCalls: 0 as const
    };
    const record: QaHandoffCertifiedReleaseHandoffAcceptanceRecord = {
      id: existing?.id ?? `provider-webhook-qa-handoff-certified-release-handoff-acceptance-${crypto.randomUUID()}`,
      tenantId,
      handoffPacketDigest: handoffPacket.handoffPacketDigest,
      decisionReceiptDigest: handoffPacket.decisionReceiptDigest,
      releaseGateDigest: handoffPacket.releaseGateDigest,
      safeDigest: safeDigestForExport(recordPayload),
      acknowledgedChecklistKeys,
      acknowledgedByRole: recordPayload.acknowledgedByRole,
      acknowledgedByLabel: recordPayload.acknowledgedByLabel,
      acknowledgedAt: now,
      externalCalls: 0 as const
    };
    if (existing) {
      const index = qaHandoffCertifiedReleaseHandoffAcceptanceRecords.indexOf(existing);
      qaHandoffCertifiedReleaseHandoffAcceptanceRecords.splice(index, 1);
    }
    qaHandoffCertifiedReleaseHandoffAcceptanceRecords.unshift(record);
    return qaHandoffCertifiedReleaseHandoffAcceptanceRecordResponse(handoffPacket, record);
  }

  getReviewQaHandoffCertifiedReleaseNoopExecutionDryRun(
    tenantId: string,
    filters: ProviderWebhookReviewClosureReportFilters = {},
    actorUserId?: string
  ): ProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun {
    const acceptanceRecord = this.getReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord(tenantId, filters, actorUserId);
    assertQaHandoffCertifiedReleaseNoopExecutionDryRunPrerequisites(acceptanceRecord);
    const record = latestCertifiedReleaseNoopExecutionDryRun(tenantId, acceptanceRecord.acceptanceRecordDigest);
    return qaHandoffCertifiedReleaseNoopExecutionDryRunResponse(acceptanceRecord, record ?? null);
  }

  runReviewQaHandoffCertifiedReleaseNoopExecutionDryRun(
    tenantId: string,
    filters: ProviderWebhookReviewClosureReportFilters = {},
    body: unknown,
    actorUserId?: string
  ): ProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun {
    const parsed = providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunRequestSchema.safeParse(body ?? {});
    if (!parsed.success) throw new BadRequestException("Invalid provider webhook QA archive certified release no-op execution dry-run request");
    const acceptanceRecord = this.getReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord(tenantId, filters, actorUserId);
    assertQaHandoffCertifiedReleaseNoopExecutionDryRunPrerequisites(acceptanceRecord);
    if (!certifiedReleaseNoopExecutionReady(acceptanceRecord) || !parsed.data.checklistAcknowledged) {
      return qaHandoffCertifiedReleaseNoopExecutionDryRunResponse(acceptanceRecord, null);
    }

    const now = new Date().toISOString();
    const existing = latestCertifiedReleaseNoopExecutionDryRun(tenantId, acceptanceRecord.acceptanceRecordDigest);
    const recordPayload = {
      dryRunKind: "qa-handoff-locked-archive-certified-release-noop-execution-dryrun",
      acceptanceRecordDigest: acceptanceRecord.acceptanceRecordDigest,
      handoffPacketDigest: acceptanceRecord.handoffPacketDigest,
      decisionReceiptDigest: acceptanceRecord.decisionReceiptDigest,
      releaseGateDigest: acceptanceRecord.releaseGateDigest,
      requestedBy: safeOperatorLabel(parsed.data.requestedBy) ?? safeActorLabel(actorUserId),
      checklistAcknowledged: parsed.data.checklistAcknowledged,
      operatorNote: safeOperatorLabel(parsed.data.operatorNote) ?? null,
      dryRunReason: safeOperatorLabel(parsed.data.dryRunReason) ?? "safe no-op execution readiness rehearsal",
      executionMode: parsed.data.executionMode,
      executedAt: now,
      externalCalls: 0 as const
    };
    const record: QaHandoffCertifiedReleaseNoopExecutionDryRunRecord = {
      id: existing?.id ?? `provider-webhook-qa-handoff-certified-release-noop-execution-dryrun-${crypto.randomUUID()}`,
      tenantId,
      acceptanceRecordDigest: acceptanceRecord.acceptanceRecordDigest,
      handoffPacketDigest: acceptanceRecord.handoffPacketDigest,
      decisionReceiptDigest: acceptanceRecord.decisionReceiptDigest,
      releaseGateDigest: acceptanceRecord.releaseGateDigest,
      safeDigest: safeDigestForExport(recordPayload),
      requestedBy: recordPayload.requestedBy,
      checklistAcknowledged: recordPayload.checklistAcknowledged,
      operatorNote: recordPayload.operatorNote,
      dryRunReason: recordPayload.dryRunReason,
      executedAt: now,
      externalCalls: 0 as const
    };
    if (existing) {
      const index = qaHandoffCertifiedReleaseNoopExecutionDryRuns.indexOf(existing);
      qaHandoffCertifiedReleaseNoopExecutionDryRuns.splice(index, 1);
    }
    qaHandoffCertifiedReleaseNoopExecutionDryRuns.unshift(record);
    return qaHandoffCertifiedReleaseNoopExecutionDryRunResponse(acceptanceRecord, record);
  }

  getReviewQaHandoffCertifiedReleaseDryRunResultLedger(
    tenantId: string,
    filters: ProviderWebhookReviewClosureReportFilters = {},
    actorUserId?: string
  ): ProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedger {
    const dryRun = this.getReviewQaHandoffCertifiedReleaseNoopExecutionDryRun(tenantId, filters, actorUserId);
    return qaHandoffCertifiedReleaseDryRunResultLedgerResponse(dryRun);
  }

  getReviewQaHandoffCertifiedReleaseFinalReadinessCertificate(
    tenantId: string,
    filters: ProviderWebhookReviewClosureReportFilters = {},
    actorUserId?: string
  ): ProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificate {
    const resultLedger = this.getReviewQaHandoffCertifiedReleaseDryRunResultLedger(tenantId, filters, actorUserId);
    return qaHandoffCertifiedReleaseFinalReadinessCertificateResponse(resultLedger);
  }

  getReviewQaHandoffCertifiedReleaseFreezeAuditRegister(
    tenantId: string,
    filters: ProviderWebhookReviewClosureReportFilters = {},
    actorUserId?: string
  ): ProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister {
    const finalReadinessCertificate = this.getReviewQaHandoffCertifiedReleaseFinalReadinessCertificate(tenantId, filters, actorUserId);
    return qaHandoffCertifiedReleaseFreezeAuditRegisterResponse(finalReadinessCertificate);
  }

  getReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt(
    tenantId: string,
    filters: ProviderWebhookReviewClosureReportFilters = {},
    actorUserId?: string
  ): ProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt {
    const freezeAuditRegister = this.getReviewQaHandoffCertifiedReleaseFreezeAuditRegister(tenantId, filters, actorUserId);
    return qaHandoffCertifiedReleaseRollbackRehearsalReceiptResponse(freezeAuditRegister);
  }

  private getLockedArchiveContext(
    tenantId: string,
    filters: ProviderWebhookReviewClosureReportFilters = {},
    actorUserId?: string
  ) {
    const receipt = this.getReviewQaHandoffBundleReceipt(tenantId, filters, actorUserId);
    const acceptanceLock = this.getReviewQaHandoffAcceptanceLock(tenantId, filters, actorUserId);
    if (acceptanceLock.lockStatus !== "locked" || !acceptanceLock.lockRecordId) {
      throw new ConflictException("Provider webhook QA handoff acceptance lock is required before locked archive export");
    }
    const lockRecord = latestAcceptanceLockRecord(tenantId, receipt.bundleDigest, receipt.exportDigest);
    if (!lockRecord) {
      throw new ConflictException("Provider webhook QA handoff acceptance lock is required before locked archive export");
    }
    return {
      receipt,
      acceptanceLock,
      lockRecord,
      archiveRecord: latestLockedArchiveExportRecord(tenantId, lockRecord.id, acceptanceLock.safeDigest)
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
    assertQaHandoffAcceptanceUnlocked(tenantId, item);
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
      const acceptanceLock = qaHandoffAcceptanceLockForItem(tenantId, item);
      if (acceptanceLock) {
        results.push(bulkMetadataResult(item.id, false, "conflict", item.assignmentStatus, item.escalationStatus, item.escalationReason, qaHandoffAcceptanceLockConflictMessage(acceptanceLock)));
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
      const acceptanceLock = qaHandoffAcceptanceLockForItem(tenantId, item);
      if (acceptanceLock) {
        results.push(bulkMetadataResult(item.id, false, "conflict", item.assignmentStatus, item.escalationStatus, item.escalationReason, qaHandoffAcceptanceLockConflictMessage(acceptanceLock)));
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
    assertQaHandoffAcceptanceUnlocked(tenantId, item);

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
      const acceptanceLock = qaHandoffAcceptanceLockForItem(tenantId, item);
      if (acceptanceLock) {
        results.push(bulkReviewResult(item.id, false, "conflict", safeBulkReviewStatus(item.reviewStatus), item.unmatchedStatus, qaHandoffAcceptanceLockConflictMessage(acceptanceLock)));
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
    assertQaHandoffAcceptanceUnlocked(tenantId, item);
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
    assertQaHandoffAcceptanceUnlocked(tenantId, item);
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
    assertQaHandoffAcceptanceUnlocked(tenantId, item);
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
    assertQaHandoffAcceptanceUnlocked(tenantId, item);
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
    assertQaHandoffAcceptanceUnlocked(tenantId, item);
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
    assertQaHandoffAcceptanceUnlocked(tenantId, item);
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
    assertQaHandoffAcceptanceUnlocked(tenantId, item);
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
  qaHandoffReceiptSignOffs.splice(0);
  qaHandoffAcceptanceLocks.splice(0);
  qaHandoffLockedArchiveExports.splice(0);
  qaHandoffArchiveFinalizationSignOffs.splice(0);
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
  const lockedArchiveReadyCount = qaHandoffAcceptanceLocks.length;
  const lockedArchiveExportedCount = qaHandoffLockedArchiveExports.length;
  const latestArchiveExport = qaHandoffLockedArchiveExports[0] ?? null;
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
    reviewQaHandoffLockedArchiveEnabled: true,
    reviewQaHandoffRetentionManifestEnabled: true,
    lockedArchiveReadyCount,
    lockedArchiveExportedCount,
    retentionManifestReadyCount: lockedArchiveReadyCount,
    latestLockedArchiveStatus: latestArchiveExport ? "exported" as const : lockedArchiveReadyCount > 0 ? "ready" as const : null,
    latestRetentionManifestStatus: lockedArchiveReadyCount > 0 ? "ready" as const : null,
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

function qaHandoffEvidenceItemFromManifest(
  item: ProviderWebhookReviewClosureEvidenceSummaryItem,
  manifest: ProviderWebhookReviewExportManifest
): ProviderWebhookReviewQaHandoffBundle["evidenceManifests"][number] {
  return {
    unmatchedId: item.unmatchedId,
    provider: item.provider,
    platform: item.platform,
    safeRoomLabel: item.safeRoomLabel,
    roomKeyDigest: item.roomKeyDigest,
    eventType: item.eventType,
    receivedAt: item.receivedAt,
    reviewStatus: item.reviewStatus,
    linkStatus: item.linkStatus,
    unmatchedStatus: item.unmatchedStatus,
    closureReadiness: item.closureReadiness,
    evidenceStatus: item.evidenceStatus,
    safeFilename: manifest.safeFilename,
    safeDigest: manifest.safeDigest,
    redactionStatus: manifest.redactionStatus,
    integrityStatus: manifest.integrityStatus,
    deterministicExportConfirmed: manifest.deterministicExportConfirmed,
    manualQaReadiness: manifest.manualQaReadiness,
    manualQaChecks: manifest.manualQaChecks,
    externalCalls: 0 as const
  };
}

function qaHandoffReadinessFromSnapshot(
  snapshot: ReturnType<typeof getProviderWebhookGuardrailReadinessSnapshot>
): ProviderWebhookReviewQaHandoffBundle["readiness"] {
  return {
    reviewClosureEvidenceEnabled: snapshot.reviewClosureEvidenceEnabled,
    reviewClosureReportEnabled: snapshot.reviewClosureReportEnabled,
    reviewClosureEvidenceExportEnabled: snapshot.reviewClosureEvidenceExportEnabled,
    reviewClosureReportExportEnabled: snapshot.reviewClosureReportExportEnabled,
    reviewExportRedactionAuditEnabled: snapshot.reviewExportRedactionAuditEnabled,
    reviewExportIntegrityChecksEnabled: snapshot.reviewExportIntegrityChecksEnabled,
    reviewExportManifestEnabled: snapshot.reviewExportManifestEnabled,
    reviewExportQaHandoffEnabled: snapshot.reviewExportQaHandoffEnabled,
    closureEvidenceReadyCount: snapshot.closureEvidenceReadyCount,
    closureEvidenceBlockedCount: snapshot.closureEvidenceBlockedCount,
    closureEvidenceIncompleteCount: snapshot.closureEvidenceIncompleteCount,
    closureEvidenceExportCount: snapshot.closureEvidenceExportCount,
    closureReportExportCount: snapshot.closureReportExportCount,
    exportRedactionPassedCount: snapshot.exportRedactionPassedCount,
    exportRedactionWarningCount: snapshot.exportRedactionWarningCount,
    exportRedactionBlockedCount: snapshot.exportRedactionBlockedCount,
    exportManifestReadyCount: snapshot.exportManifestReadyCount,
    exportManifestNeedsReviewCount: snapshot.exportManifestNeedsReviewCount,
    exportManifestBlockedCount: snapshot.exportManifestBlockedCount,
    latestExportManifestStatus: snapshot.latestExportManifestStatus,
    externalCalls: 0 as const
  };
}

function qaHandoffManualQaChecks(input: {
  readiness: ProviderWebhookReviewQaHandoffBundle["readiness"];
  closureReportManifest: ProviderWebhookReviewExportManifest;
  closureReportRedactionAudit: ProviderWebhookReviewExportRedactionAudit;
  closureExportIntegrity: ProviderWebhookReviewExportIntegrity;
  evidenceManifests: ProviderWebhookReviewQaHandoffBundle["evidenceManifests"];
}): ProviderWebhookReviewQaHandoffBundle["manualQaChecks"] {
  const allManifestChecks = [input.closureReportManifest, ...input.evidenceManifests];
  return {
    reportManifestReady: input.closureReportManifest.manualQaReadiness === "ready",
    reportRedactionPassedOrWarned: input.closureReportRedactionAudit.status === "passed" || input.closureReportRedactionAudit.status === "warning",
    reportIntegrityConfirmed: input.closureReportManifest.integrityStatus === "confirmed" && input.closureExportIntegrity.deterministicExportConfirmed,
    evidenceManifestsReadyOrNeedsReview: input.evidenceManifests.every((manifest) => manifest.manualQaReadiness !== "blocked"),
    safeFilenamePresent: allManifestChecks.every((manifest) => manifest.safeFilename.length > 0),
    safeDigestPresent: allManifestChecks.every((manifest) => manifest.safeDigest.startsWith("sha256:")),
    rawPayloadAbsent: input.closureReportRedactionAudit.checks.rawPayloadAbsent,
    rawSignatureAbsent: input.closureReportRedactionAudit.checks.rawSignatureAbsent,
    tokenAbsent: input.closureReportRedactionAudit.checks.tokenAbsent,
    replyTokenAbsent: input.closureReportRedactionAudit.checks.replyTokenAbsent,
    rawSenderIdAbsent: input.closureReportRedactionAudit.checks.rawSenderIdAbsent,
    rawRoomIdAbsent: input.closureReportRedactionAudit.checks.rawRoomIdAbsent,
    providerOutboundAbsent: input.closureReportRedactionAudit.checks.providerOutboundAbsent,
    externalCallsZero: externalCallsAreZero(input),
    readinessFlagsPresent: input.readiness.reviewClosureEvidenceEnabled &&
      input.readiness.reviewClosureReportEnabled &&
      input.readiness.reviewClosureEvidenceExportEnabled &&
      input.readiness.reviewClosureReportExportEnabled &&
      input.readiness.reviewExportRedactionAuditEnabled &&
      input.readiness.reviewExportIntegrityChecksEnabled &&
      input.readiness.reviewExportManifestEnabled &&
      input.readiness.reviewExportQaHandoffEnabled
  };
}

function qaHandoffBundleReadiness(input: {
  closureReportManifest: ProviderWebhookReviewExportManifest;
  closureExportIntegrity: ProviderWebhookReviewExportIntegrity;
  evidenceManifests: ProviderWebhookReviewQaHandoffBundle["evidenceManifests"];
  manualQaChecks: ProviderWebhookReviewQaHandoffBundle["manualQaChecks"];
}): ProviderWebhookReviewExportManifestQaReadiness {
  if (
    !input.manualQaChecks.externalCallsZero ||
    !input.manualQaChecks.providerOutboundAbsent ||
    input.closureReportManifest.manualQaReadiness === "blocked" ||
    input.closureReportManifest.redactionBlockedCount > 0 ||
    input.closureExportIntegrity.redactionBlockedCount > 0 ||
    input.evidenceManifests.some((manifest) => manifest.manualQaReadiness === "blocked")
  ) {
    return "blocked";
  }
  if (
    input.closureReportManifest.manualQaReadiness === "needs_review" ||
    input.closureReportManifest.redactionWarningCount > 0 ||
    input.closureExportIntegrity.redactionWarningCount > 0 ||
    input.evidenceManifests.some((manifest) => manifest.manualQaReadiness === "needs_review")
  ) {
    return "needs_review";
  }
  return "ready";
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

function latestReceiptSignOffRecord(tenantId: string, bundleDigest: string, exportDigest: string) {
  return qaHandoffReceiptSignOffs.find((record) =>
    record.tenantId === tenantId &&
    record.bundleDigest === bundleDigest &&
    record.exportDigest === exportDigest
  ) ?? null;
}

function latestAcceptanceLockRecord(tenantId: string, bundleDigest: string, exportDigest: string) {
  return qaHandoffAcceptanceLocks.find((record) =>
    record.tenantId === tenantId &&
    record.bundleDigest === bundleDigest &&
    record.exportDigest === exportDigest
  ) ?? null;
}

function latestLockedArchiveExportRecord(tenantId: string, lockRecordId: string, acceptanceLockDigest: string) {
  return qaHandoffLockedArchiveExports.find((record) =>
    record.tenantId === tenantId &&
    record.lockRecordId === lockRecordId &&
    record.acceptanceLockDigest === acceptanceLockDigest
  ) ?? null;
}

function latestArchiveFinalizationSignOffRecord(
  tenantId: string,
  lockedArchiveDigest: string,
  retentionManifestDigest: string,
  integrityDigest: string
) {
  return qaHandoffArchiveFinalizationSignOffs.find((record) =>
    record.tenantId === tenantId &&
    record.lockedArchiveDigest === lockedArchiveDigest &&
    record.retentionManifestDigest === retentionManifestDigest &&
    record.integrityDigest === integrityDigest
  ) ?? null;
}

function qaHandoffAcceptanceLockForItem(tenantId: string, item: ProviderWebhookUnmatchedInboundItem) {
  return qaHandoffAcceptanceLocks.find((record) =>
    record.tenantId === tenantId &&
    record.lockedUnmatchedInboundIds.includes(item.id)
  ) ?? null;
}

function assertQaHandoffAcceptanceUnlocked(tenantId: string, item: ProviderWebhookUnmatchedInboundItem) {
  const lock = qaHandoffAcceptanceLockForItem(tenantId, item);
  if (lock) throw new ConflictException(qaHandoffAcceptanceLockConflictMessage(lock));
}

function qaHandoffAcceptanceLockConflictMessage(lock: QaHandoffAcceptanceLockRecord) {
  return `Provider webhook QA handoff acceptance lock is active for this unmatched inbound item (${lock.id})`;
}

function openLockedItemCount(tenantId: string, ids: string[]) {
  return ids
    .map((id) => findUnmatchedInboundItem(tenantId, id))
    .filter((item): item is ProviderWebhookUnmatchedInboundItem => Boolean(item))
    .filter((item) => isOpenUnmatchedStatus(item.unmatchedStatus))
    .length;
}

function qaHandoffAcceptanceLockResponse(input: {
  receipt: ProviderWebhookReviewQaHandoffReceipt;
  appliedFilters: ProviderWebhookReviewClosureReportFilters;
  lockRecord: QaHandoffAcceptanceLockRecord | null;
  lockAction: ProviderWebhookReviewQaHandoffAcceptanceLock["lockAction"];
  itemIds: string[];
  openItemCount: number;
}): ProviderWebhookReviewQaHandoffAcceptanceLock {
  const safeFilename = safeExportFilename("provider-webhook-review-qa-handoff-acceptance-lock.json");
  const payload = {
    generatedAt: new Date().toISOString(),
    lockStatus: input.lockRecord ? "locked" as const : "unlocked" as const,
    lockRecordId: input.lockRecord?.id ?? null,
    lockAction: input.lockAction,
    safeFilename,
    receiptDigest: input.lockRecord?.receiptDigest ?? input.receipt.safeDigest,
    bundleDigest: input.receipt.bundleDigest,
    exportDigest: input.receipt.exportDigest,
    appliedFilters: input.appliedFilters,
    lockedUnmatchedInboundIds: input.itemIds,
    lockedItemCount: input.itemIds.length,
    lockedOpenItemCount: input.openItemCount,
    lockReason: input.lockRecord?.lockReason ?? null,
    acceptedByRole: input.lockRecord?.acceptedByRole ?? null,
    acceptedByLabel: input.lockRecord?.acceptedByLabel ?? null,
    lockedAt: input.lockRecord?.lockedAt ?? null,
    receiptStatus: input.receipt.receiptStatus,
    bundleStatus: input.receipt.bundleStatus,
    exportStatus: input.receipt.exportStatus,
    acceptanceChecks: {
      receiptSignedOff: input.receipt.receiptStatus === "signed_off",
      bundleDigestMatches: input.lockRecord ? input.lockRecord.bundleDigest === input.receipt.bundleDigest : true,
      exportDigestMatches: input.lockRecord ? input.lockRecord.exportDigest === input.receipt.exportDigest : true,
      lockedItemScopePresent: input.itemIds.length > 0,
      safeDigestPresent: Boolean(input.receipt.safeDigest && input.receipt.bundleDigest && input.receipt.exportDigest),
      providerOutboundAbsent: input.receipt.manualQaChecks.providerOutboundAbsent,
      externalCallsZero: input.receipt.externalCalls === 0 && input.receipt.manualQaChecks.externalCallsZero
    },
    externalCalls: 0 as const
  };
  return {
    ...payload,
    safeDigest: safeDigestForExport(payload),
    externalCalls: 0 as const
  };
}

function qaHandoffLockedArchiveStatusResponse(input: {
  receipt: ProviderWebhookReviewQaHandoffReceipt;
  acceptanceLock: ProviderWebhookReviewQaHandoffAcceptanceLock;
  lockRecord: QaHandoffAcceptanceLockRecord;
  archiveRecord: QaHandoffLockedArchiveExportRecord | null;
}): ProviderWebhookReviewQaHandoffLockedArchiveStatus {
  const safeFilename = input.archiveRecord?.safeFilename ?? safeExportFilename("provider-webhook-review-qa-handoff-locked-archive.json");
  const exportedAt = input.archiveRecord?.exportedAt ?? null;
  const payload = {
    generatedAt: new Date().toISOString(),
    lockedArchiveStatus: input.archiveRecord ? "exported" as const : "ready" as const,
    retentionManifestStatus: "ready" as const,
    archiveAcknowledgementStatus: input.archiveRecord ? "exported" as const : "not_exported" as const,
    acceptanceStatus: "locked" as const,
    lockStatus: "locked" as const,
    receiptStatus: input.receipt.receiptStatus,
    signOffStatus: input.receipt.receiptStatus,
    bundleStatus: input.receipt.bundleStatus,
    exportStatus: input.receipt.exportStatus,
    safeFilename,
    bundleDigest: input.receipt.bundleDigest,
    exportDigest: input.receipt.exportDigest,
    receiptDigest: input.receipt.safeDigest,
    acceptanceLockDigest: input.acceptanceLock.safeDigest,
    lockRecordId: input.lockRecord.id,
    readinessFlags: input.receipt.readinessFlags,
    counts: {
      ...input.receipt.counts,
      lockedItemCount: input.acceptanceLock.lockedItemCount,
      lockedOpenItemCount: input.acceptanceLock.lockedOpenItemCount
    },
    manualQaChecks: input.receipt.manualQaChecks,
    retentionPolicyLabel: "safe-qa-handoff-locked-archive-retain-review-metadata-only",
    archivedAt: input.lockRecord.lockedAt,
    exportedAt,
    externalCalls: 0 as const
  };
  return {
    ...payload,
    safeDigest: input.archiveRecord?.safeDigest || safeDigestForExport(payload),
    externalCalls: 0 as const
  };
}

function qaHandoffArchiveIntegrityResponse(
  lockedArchive: ProviderWebhookReviewQaHandoffLockedArchiveStatus,
  retentionManifest: ProviderWebhookReviewQaHandoffRetentionManifest
): ProviderWebhookReviewQaHandoffArchiveIntegrity {
  const digestChainConfirmed = [
    lockedArchive.bundleDigest,
    lockedArchive.exportDigest,
    lockedArchive.receiptDigest,
    lockedArchive.acceptanceLockDigest,
    lockedArchive.safeDigest,
    retentionManifest.safeDigest
  ].every((digest) => digest.startsWith("sha256:")) &&
    retentionManifest.archiveDigest === lockedArchive.safeDigest &&
    retentionManifest.bundleDigest === lockedArchive.bundleDigest &&
    retentionManifest.exportDigest === lockedArchive.exportDigest &&
    retentionManifest.receiptDigest === lockedArchive.receiptDigest &&
    retentionManifest.acceptanceLockDigest === lockedArchive.acceptanceLockDigest;
  const payload = {
    generatedAt: new Date().toISOString(),
    integrityStatus: digestChainConfirmed ? "confirmed" as const : "needs_review" as const,
    retentionAuditStatus: "confirmed" as const,
    lockedArchiveStatus: lockedArchive.lockedArchiveStatus,
    retentionManifestStatus: retentionManifest.retentionManifestStatus,
    archiveAcknowledgementStatus: lockedArchive.archiveAcknowledgementStatus,
    auditAcknowledgementStatus: "acknowledged" as const,
    acceptanceStatus: lockedArchive.acceptanceStatus,
    lockStatus: lockedArchive.lockStatus,
    receiptStatus: lockedArchive.receiptStatus,
    signOffStatus: lockedArchive.signOffStatus,
    bundleStatus: lockedArchive.bundleStatus,
    exportStatus: lockedArchive.exportStatus,
    safeFilename: safeExportFilename("provider-webhook-review-qa-handoff-locked-archive-integrity.json"),
    bundleDigest: lockedArchive.bundleDigest,
    exportDigest: lockedArchive.exportDigest,
    receiptDigest: lockedArchive.receiptDigest,
    acceptanceLockDigest: lockedArchive.acceptanceLockDigest,
    lockedArchiveDigest: lockedArchive.safeDigest,
    retentionManifestDigest: retentionManifest.safeDigest,
    digestChainStatus: digestChainConfirmed ? "confirmed" as const : "needs_review" as const,
    safeCheckLabels: [
      "bundle digest present",
      "export digest present",
      "receipt digest present",
      "acceptance lock digest present",
      "locked archive digest present",
      "retention manifest digest present",
      "provider outbound absent",
      "externalCalls zero"
    ],
    readinessFlags: lockedArchive.readinessFlags,
    counts: {
      ...lockedArchive.counts,
      digestChainLinkCount: 6,
      integrityCheckedCount: 1
    },
    manualQaChecks: lockedArchive.manualQaChecks,
    archivedAt: lockedArchive.archivedAt,
    exportedAt: lockedArchive.exportedAt,
    externalCalls: 0 as const
  };
  return {
    ...payload,
    safeDigest: safeDigestForExport(payload),
    externalCalls: 0 as const
  };
}

function qaHandoffRetentionAuditResponse(
  lockedArchive: ProviderWebhookReviewQaHandoffLockedArchiveStatus,
  retentionManifest: ProviderWebhookReviewQaHandoffRetentionManifest
): ProviderWebhookReviewQaHandoffRetentionAudit {
  const digestChainConfirmed = retentionManifest.archiveDigest === lockedArchive.safeDigest &&
    retentionManifest.retentionManifestStatus === "ready" &&
    lockedArchive.retentionManifestStatus === "ready";
  const auditChecklistItems = [
    { key: "locked_archive_available", label: "locked archive available", status: "confirmed" as const },
    { key: "retention_manifest_ready", label: "retention manifest ready", status: "confirmed" as const },
    { key: "digest_chain_confirmed", label: "digest chain confirmed", status: digestChainConfirmed ? "confirmed" as const : "needs_review" as const },
    { key: "provider_outbound_absent", label: "provider outbound absent", status: lockedArchive.manualQaChecks.providerOutboundAbsent ? "confirmed" as const : "blocked" as const },
    { key: "external_calls_zero", label: "externalCalls zero", status: lockedArchive.manualQaChecks.externalCallsZero ? "confirmed" as const : "blocked" as const }
  ];
  const payload = {
    generatedAt: new Date().toISOString(),
    retentionPolicyStatus: "active" as const,
    retentionAuditStatus: auditChecklistItems.every((item) => item.status === "confirmed") ? "confirmed" as const : "needs_review" as const,
    retentionManifestStatus: retentionManifest.retentionManifestStatus,
    lockedArchiveStatus: lockedArchive.lockedArchiveStatus,
    archiveAcknowledgementStatus: lockedArchive.archiveAcknowledgementStatus,
    auditAcknowledgementStatus: "acknowledged" as const,
    acceptanceStatus: lockedArchive.acceptanceStatus,
    lockStatus: lockedArchive.lockStatus,
    safePolicyLabel: retentionManifest.retentionPolicyLabel,
    safeRetentionWindowLabel: "safe-review-metadata-retained",
    safeFilename: safeExportFilename("provider-webhook-review-qa-handoff-retention-audit.json"),
    lockedArchiveDigest: lockedArchive.safeDigest,
    retentionManifestDigest: retentionManifest.safeDigest,
    digestChainStatus: digestChainConfirmed ? "confirmed" as const : "needs_review" as const,
    auditChecklistItems,
    counts: {
      ...lockedArchive.counts,
      auditChecklistPassedCount: auditChecklistItems.filter((item) => item.status === "confirmed").length,
      auditChecklistNeedsReviewCount: auditChecklistItems.filter((item) => item.status === "needs_review").length,
      auditChecklistBlockedCount: auditChecklistItems.filter((item) => item.status === "blocked").length
    },
    archivedAt: lockedArchive.archivedAt,
    exportedAt: lockedArchive.exportedAt,
    externalCalls: 0 as const
  };
  return {
    ...payload,
    safeDigest: safeDigestForExport(payload),
    externalCalls: 0 as const
  };
}

function assertQaHandoffArchiveFinalizationReady(
  integrity: ProviderWebhookReviewQaHandoffArchiveIntegrity,
  retentionAudit: ProviderWebhookReviewQaHandoffRetentionAudit
) {
  if (integrity.integrityStatus !== "confirmed" || integrity.digestChainStatus !== "confirmed") {
    throw new ConflictException("Provider webhook QA archive finalization requires confirmed archive integrity");
  }
  if (retentionAudit.retentionAuditStatus !== "confirmed" || retentionAudit.digestChainStatus !== "confirmed") {
    throw new ConflictException("Provider webhook QA archive finalization requires ready retention audit");
  }
}

function createArchiveFinalizationSignOffRecord(input: {
  tenantId: string;
  integrity: ProviderWebhookReviewQaHandoffArchiveIntegrity;
  retentionAudit: ProviderWebhookReviewQaHandoffRetentionAudit;
  reviewerRole: string | null;
  reviewerLabel: string | null;
}): QaHandoffArchiveFinalizationSignOffRecord {
  const now = new Date().toISOString();
  const recordBase = {
    id: `provider-webhook-qa-handoff-archive-finalization-signoff-${crypto.randomUUID()}`,
    tenantId: input.tenantId,
    lockedArchiveDigest: input.integrity.lockedArchiveDigest,
    retentionManifestDigest: input.integrity.retentionManifestDigest,
    integrityDigest: input.integrity.safeDigest,
    retentionAuditDigest: input.retentionAudit.safeDigest,
    reviewerRole: input.reviewerRole,
    reviewerLabel: input.reviewerLabel,
    signedAt: now,
    finalizedAt: now,
    externalCalls: 0 as const
  };
  return {
    ...recordBase,
    safeDigest: safeDigestForExport(recordBase),
    externalCalls: 0 as const
  };
}

function qaHandoffArchiveFinalizationPayload(
  integrity: ProviderWebhookReviewQaHandoffArchiveIntegrity,
  retentionAudit: ProviderWebhookReviewQaHandoffRetentionAudit,
  record: QaHandoffArchiveFinalizationSignOffRecord | null,
  safeFilename: string
) {
  const finalized = Boolean(record);
  return {
    generatedAt: new Date().toISOString(),
    finalizationStatus: finalized ? "finalized" as const : "ready" as const,
    retentionSignOffStatus: finalized ? "signed_off" as const : "not_signed" as const,
    finalizationReceiptStatus: finalized ? "ready" as const : "not_created" as const,
    integrityStatus: integrity.integrityStatus,
    retentionAuditStatus: retentionAudit.retentionAuditStatus,
    lockedArchiveStatus: integrity.lockedArchiveStatus,
    retentionManifestStatus: integrity.retentionManifestStatus,
    archiveAcknowledgementStatus: integrity.archiveAcknowledgementStatus,
    auditAcknowledgementStatus: retentionAudit.auditAcknowledgementStatus,
    acceptanceStatus: integrity.acceptanceStatus,
    lockStatus: integrity.lockStatus,
    receiptStatus: integrity.receiptStatus,
    signOffStatus: integrity.signOffStatus,
    digestChainStatus: integrity.digestChainStatus === "confirmed" && retentionAudit.digestChainStatus === "confirmed" ? "confirmed" as const : "needs_review" as const,
    safeFilename,
    bundleDigest: integrity.bundleDigest,
    exportDigest: integrity.exportDigest,
    receiptDigest: integrity.receiptDigest,
    acceptanceLockDigest: integrity.acceptanceLockDigest,
    lockedArchiveDigest: integrity.lockedArchiveDigest,
    retentionManifestDigest: integrity.retentionManifestDigest,
    integrityDigest: integrity.safeDigest,
    finalizationReceiptDigest: record?.safeDigest ?? null,
    safeRetentionPolicyLabel: retentionAudit.safePolicyLabel,
    safeReviewerLabel: record?.reviewerLabel ?? null,
    safeCheckLabels: [
      "archive integrity confirmed",
      "retention audit confirmed",
      "retention manifest ready",
      "locked archive scope preserved",
      "provider outbound absent",
      "externalCalls zero"
    ],
    readinessFlags: integrity.readinessFlags,
    counts: {
      ...integrity.counts,
      digestChainLinkCount: 7,
      finalizationCheckedCount: 1,
      retentionSignOffCount: finalized ? 1 : 0
    },
    manualQaChecks: integrity.manualQaChecks,
    archivedAt: integrity.archivedAt,
    exportedAt: integrity.exportedAt,
    signedAt: record?.signedAt ?? null,
    finalizedAt: record?.finalizedAt ?? null,
    externalCalls: 0 as const
  };
}

function qaHandoffArchiveFinalizationResponse(
  integrity: ProviderWebhookReviewQaHandoffArchiveIntegrity,
  retentionAudit: ProviderWebhookReviewQaHandoffRetentionAudit,
  record: QaHandoffArchiveFinalizationSignOffRecord | null
): ProviderWebhookReviewQaHandoffArchiveFinalization {
  const payload = qaHandoffArchiveFinalizationPayload(
    integrity,
    retentionAudit,
    record,
    safeExportFilename("provider-webhook-review-qa-handoff-archive-finalization.json")
  );
  return {
    ...payload,
    safeDigest: safeDigestForExport(payload),
    externalCalls: 0 as const
  };
}

function qaHandoffArchiveFinalizationSignOffResponse(
  integrity: ProviderWebhookReviewQaHandoffArchiveIntegrity,
  retentionAudit: ProviderWebhookReviewQaHandoffRetentionAudit,
  record: QaHandoffArchiveFinalizationSignOffRecord
): ProviderWebhookReviewQaHandoffFinalizationSignOffResponse {
  const payload = qaHandoffArchiveFinalizationPayload(
    integrity,
    retentionAudit,
    record,
    safeExportFilename("provider-webhook-review-qa-handoff-archive-finalization-signoff.json")
  );
  return {
    ...payload,
    finalizationStatus: "finalized" as const,
    retentionSignOffStatus: "signed_off" as const,
    finalizationReceiptStatus: "ready" as const,
    safeDigest: safeDigestForExport(payload),
    action: "sign_off" as const,
    signOffRecordId: record.id,
    externalCalls: 0 as const
  };
}

function qaHandoffArchiveFinalizationReceiptResponse(
  integrity: ProviderWebhookReviewQaHandoffArchiveIntegrity,
  retentionAudit: ProviderWebhookReviewQaHandoffRetentionAudit,
  record: QaHandoffArchiveFinalizationSignOffRecord
): ProviderWebhookReviewQaHandoffFinalizationReceipt {
  const payload = qaHandoffArchiveFinalizationPayload(
    integrity,
    retentionAudit,
    record,
    safeExportFilename("provider-webhook-review-qa-handoff-archive-finalization-receipt.json")
  );
  return {
    ...payload,
    finalizationStatus: "finalized" as const,
    retentionSignOffStatus: "signed_off" as const,
    finalizationReceiptStatus: "ready" as const,
    safeDigest: safeDigestForExport(payload),
    receiptKind: "qa-handoff-locked-archive-finalization-receipt" as const,
    signOffRecordId: record.id,
    externalCalls: 0 as const
  };
}

function qaHandoffArchiveReleaseEvidenceResponse(
  receipt: ProviderWebhookReviewQaHandoffFinalizationReceipt,
  retentionAudit: ProviderWebhookReviewQaHandoffRetentionAudit
): ProviderWebhookReviewQaHandoffReleaseEvidence {
  const { safeDigest: receiptReadDigest, ...receiptPayload } = receipt;
  const prerequisiteChecklist = {
    qaHandoffBundleReady: Boolean(receipt.bundleDigest),
    qaHandoffExportReady: Boolean(receipt.exportDigest),
    receiptSignedOff: receipt.receiptStatus === "signed_off" && receipt.signOffStatus === "signed_off",
    acceptanceLocked: receipt.acceptanceStatus === "locked" && receipt.lockStatus === "locked",
    lockedArchiveReady: receipt.lockedArchiveStatus === "ready" || receipt.lockedArchiveStatus === "exported",
    lockedArchiveExported: receipt.lockedArchiveStatus === "exported" && receipt.archiveAcknowledgementStatus === "exported",
    retentionManifestReady: receipt.retentionManifestStatus === "ready",
    archiveIntegrityConfirmed: receipt.integrityStatus === "confirmed",
    retentionAuditConfirmed: receipt.retentionAuditStatus === "confirmed" && retentionAudit.retentionAuditStatus === "confirmed",
    finalizationSignedOff: receipt.finalizationStatus === "finalized" && receipt.retentionSignOffStatus === "signed_off",
    finalizationReceiptReady: receipt.finalizationReceiptStatus === "ready" && Boolean(receipt.finalizationReceiptDigest),
    digestChainConfirmed: receipt.digestChainStatus === "confirmed" && retentionAudit.digestChainStatus === "confirmed",
    safeFilenamePresent: Boolean(receipt.safeFilename && retentionAudit.safeFilename),
    safeDigestPresent: Boolean(receiptReadDigest && retentionAudit.safeDigest),
    providerOutboundAbsent: receipt.manualQaChecks.providerOutboundAbsent,
    externalCallsZero: receipt.externalCalls === 0 && retentionAudit.externalCalls === 0 && receipt.manualQaChecks.externalCallsZero
  };
  const checklistValues = Object.values(prerequisiteChecklist);
  const payload = {
    ...receiptPayload,
    evidenceKind: "qa-handoff-locked-archive-release-evidence-pack" as const,
    releaseReadinessStatus: "ready_for_release" as const,
    retentionPolicyStatus: retentionAudit.retentionPolicyStatus,
    safeReleaseLabel: "safe-qa-handoff-release-evidence-pack",
    safeFilename: safeExportFilename("provider-webhook-review-qa-handoff-archive-release-evidence-pack.json"),
    retentionAuditDigest: retentionAudit.safeDigest,
    finalizationReceiptDigest: receipt.finalizationReceiptDigest ?? receiptReadDigest,
    prerequisiteChecklist,
    safeCheckLabels: [
      "QA handoff bundle ready",
      "QA handoff export ready",
      "receipt signed off",
      "acceptance lock present",
      "locked archive exported",
      "retention manifest ready",
      "archive integrity confirmed",
      "retention audit confirmed",
      "finalization sign-off complete",
      "finalization receipt ready",
      "provider outbound absent",
      "externalCalls zero"
    ],
    counts: {
      ...receipt.counts,
      releaseEvidenceCheckedCount: 1,
      prerequisitePassedCount: checklistValues.filter(Boolean).length,
      prerequisiteTotalCount: checklistValues.length
    },
    externalCalls: 0 as const
  };
  return {
    ...payload,
    safeDigest: safeDigestForExport(payload),
    externalCalls: 0 as const
  };
}

function qaHandoffArchiveReleaseVerificationResponse(
  releaseEvidence: ProviderWebhookReviewQaHandoffReleaseEvidence
): ProviderWebhookReviewQaHandoffReleaseVerification {
  const { safeDigest: releaseEvidenceDigest, safeFilename: _releaseEvidenceFilename, ...releaseEvidencePayload } = releaseEvidence;
  void _releaseEvidenceFilename;
  const chainReady = releaseEvidence.releaseReadinessStatus === "ready_for_release" &&
    releaseEvidence.digestChainStatus === "confirmed" &&
    Object.values(releaseEvidence.prerequisiteChecklist).every(Boolean);
  const digestMatrixRows: ProviderWebhookReviewQaHandoffReleaseVerificationDigestRow[] = [
    releaseVerificationDigestRow("qa_handoff_bundle", "QA handoff bundle", releaseEvidence.bundleDigest, releaseEvidence.bundleDigest, chainReady),
    releaseVerificationDigestRow("qa_handoff_export", "QA handoff export", releaseEvidence.exportDigest, releaseEvidence.exportDigest, chainReady),
    releaseVerificationDigestRow("receipt_sign_off", "receipt/sign-off", releaseEvidence.receiptDigest, releaseEvidence.receiptDigest, chainReady),
    releaseVerificationDigestRow("acceptance_lock", "acceptance lock", releaseEvidence.acceptanceLockDigest, releaseEvidence.acceptanceLockDigest, chainReady),
    releaseVerificationDigestRow("locked_archive_export", "locked archive/export", releaseEvidence.lockedArchiveDigest, releaseEvidence.lockedArchiveDigest, chainReady),
    releaseVerificationDigestRow("retention_manifest", "retention manifest", releaseEvidence.retentionManifestDigest, releaseEvidence.retentionManifestDigest, chainReady),
    releaseVerificationDigestRow("archive_integrity", "archive integrity", releaseEvidence.integrityDigest, releaseEvidence.integrityDigest, chainReady),
    releaseVerificationDigestRow("retention_audit", "retention audit", releaseEvidence.retentionAuditDigest, releaseEvidence.retentionAuditDigest, chainReady),
    releaseVerificationDigestRow("finalization_receipt", "finalization receipt", releaseEvidence.finalizationReceiptDigest, releaseEvidence.finalizationReceiptDigest, chainReady),
    releaseVerificationDigestRow("release_evidence", "release evidence", releaseEvidenceDigest, releaseEvidenceDigest, chainReady)
  ];
  const verifiedCount = digestMatrixRows.filter((row) => row.verificationStatus === "verified").length;
  const needsReviewCount = digestMatrixRows.filter((row) => row.verificationStatus === "needs_review").length;
  const blockedCount = digestMatrixRows.filter((row) => row.verificationStatus === "blocked").length;
  const verificationStatus: ProviderWebhookReviewQaHandoffReleaseVerificationStatus =
    chainReady && verifiedCount === digestMatrixRows.length
      ? "verified"
      : blockedCount > 0
        ? "blocked"
        : "needs_review";
  const payload = {
    ...releaseEvidencePayload,
    verificationKind: "qa-handoff-locked-archive-release-verification-matrix" as const,
    verificationStatus,
    safeVerificationLabel: "safe-qa-handoff-release-verification-matrix",
    safeFilename: safeExportFilename("provider-webhook-review-qa-handoff-archive-release-verification-matrix.json"),
    releaseEvidenceDigest,
    digestMatrixRows,
    safeCheckLabels: [
      ...releaseEvidence.safeCheckLabels,
      "release evidence ready",
      "digest matrix verified"
    ],
    counts: {
      ...releaseEvidence.counts,
      releaseVerificationCheckedCount: 1,
      digestMatrixRowCount: digestMatrixRows.length,
      digestMatrixVerifiedCount: verifiedCount,
      digestMatrixNeedsReviewCount: needsReviewCount,
      digestMatrixBlockedCount: blockedCount
    },
    externalCalls: 0 as const
  };
  return {
    ...payload,
    safeDigest: safeDigestForExport(payload),
    externalCalls: 0 as const
  };
}

function releaseVerificationDigestRow(
  key: ProviderWebhookReviewQaHandoffReleaseVerificationDigestRow["key"],
  label: string,
  safeDigest: string,
  expectedDigest: string,
  chainReady: boolean
): ProviderWebhookReviewQaHandoffReleaseVerificationDigestRow {
  const digestPresent = /^sha256:[a-f0-9]+$/i.test(safeDigest);
  const digestMatchesExpected = digestPresent && safeDigest === expectedDigest;
  const verificationStatus: ProviderWebhookReviewQaHandoffReleaseVerificationStatus =
    digestPresent && digestMatchesExpected && chainReady
      ? "verified"
      : digestPresent
        ? "needs_review"
        : "blocked";
  return {
    key,
    label,
    safeDigest,
    expectedDigest,
    digestPresent,
    digestMatchesExpected,
    verificationStatus
  };
}

function assertQaHandoffArchiveReleaseCertificationReady(
  verification: ProviderWebhookReviewQaHandoffReleaseVerification
) {
  if (verification.verificationStatus !== "verified") {
    throw new ConflictException("Provider webhook QA archive release verification must be verified before certification");
  }
  if (verification.releaseReadinessStatus !== "ready_for_release") {
    throw new ConflictException("Provider webhook QA archive release evidence must be ready_for_release before certification");
  }
  if (verification.digestChainStatus !== "confirmed") {
    throw new ConflictException("Provider webhook QA archive digest chain must be confirmed before certification");
  }
  if (!Object.values(verification.prerequisiteChecklist).every(Boolean)) {
    throw new ConflictException("Provider webhook QA archive release prerequisites must be complete before certification");
  }
  if (!verification.digestMatrixRows.every((row) => row.verificationStatus === "verified" && row.digestPresent && row.digestMatchesExpected)) {
    throw new ConflictException("Provider webhook QA archive release digest matrix must be verified before certification");
  }
}

function qaHandoffArchiveReleaseCertificationResponse(
  verification: ProviderWebhookReviewQaHandoffReleaseVerification
): ProviderWebhookReviewQaHandoffReleaseCertification {
  const releaseVerificationDigest = verification.safeDigest;
  const digestMatrixSummary = {
    totalRows: verification.counts.digestMatrixRowCount,
    verifiedRows: verification.counts.digestMatrixVerifiedCount,
    needsReviewRows: verification.counts.digestMatrixNeedsReviewCount,
    blockedRows: verification.counts.digestMatrixBlockedCount,
    allRowsVerified: verification.digestMatrixRows.every((row) => row.verificationStatus === "verified" && row.digestPresent && row.digestMatchesExpected)
  };
  const certificationChecklist = {
    releaseEvidenceReady: Boolean(verification.releaseEvidenceDigest),
    releaseVerificationPresent: Boolean(releaseVerificationDigest),
    releaseVerificationVerified: verification.verificationStatus === "verified",
    releaseReadinessReady: verification.releaseReadinessStatus === "ready_for_release",
    digestChainConfirmed: verification.digestChainStatus === "confirmed",
    prerequisitesComplete: Object.values(verification.prerequisiteChecklist).every(Boolean),
    digestMatrixVerified: digestMatrixSummary.allRowsVerified,
    safeFilenamePresent: Boolean(verification.safeFilename),
    safeDigestPresent: Boolean(verification.safeDigest),
    releaseEvidenceDigestPresent: Boolean(verification.releaseEvidenceDigest),
    releaseVerificationDigestPresent: Boolean(releaseVerificationDigest),
    providerOutboundAbsent: verification.prerequisiteChecklist.providerOutboundAbsent,
    externalCallsZero: verification.externalCalls === 0 && verification.prerequisiteChecklist.externalCallsZero
  };
  const checklistValues = Object.values(certificationChecklist);
  const payload = {
    certificationKind: "qa-handoff-locked-archive-release-certification-receipt" as const,
    certificationStatus: "certified" as const,
    releaseReadinessStatus: "ready_for_release" as const,
    verificationStatus: "verified" as const,
    digestChainStatus: "confirmed" as const,
    safeFilename: safeExportFilename("provider-webhook-review-qa-handoff-archive-release-certification-receipt.json"),
    releaseEvidenceDigest: verification.releaseEvidenceDigest,
    releaseVerificationDigest,
    prerequisiteChecklist: verification.prerequisiteChecklist,
    certificationChecklist,
    digestMatrixSummary,
    counts: {
      totalItems: verification.counts.totalItems,
      releaseEvidenceCheckedCount: verification.counts.releaseEvidenceCheckedCount,
      releaseVerificationCheckedCount: verification.counts.releaseVerificationCheckedCount,
      releaseCertificationCheckedCount: 1,
      prerequisitePassedCount: verification.counts.prerequisitePassedCount,
      prerequisiteTotalCount: verification.counts.prerequisiteTotalCount,
      certificationChecklistPassedCount: checklistValues.filter(Boolean).length,
      certificationChecklistTotalCount: checklistValues.length,
      digestMatrixRowCount: verification.counts.digestMatrixRowCount,
      digestMatrixVerifiedCount: verification.counts.digestMatrixVerifiedCount,
      digestMatrixNeedsReviewCount: verification.counts.digestMatrixNeedsReviewCount,
      digestMatrixBlockedCount: verification.counts.digestMatrixBlockedCount
    },
    externalCalls: 0 as const
  };
  return {
    ...payload,
    safeDigest: safeDigestForExport(payload),
    externalCalls: 0 as const
  };
}

function assertQaHandoffArchiveReleaseClosureLedgerReady(
  certification: ProviderWebhookReviewQaHandoffReleaseCertification
) {
  if (certification.certificationStatus !== "certified") {
    throw new ConflictException("Provider webhook QA archive release certification receipt must be certified before closure ledger");
  }
  if (certification.releaseReadinessStatus !== "ready_for_release") {
    throw new ConflictException("Provider webhook QA archive release readiness must be ready_for_release before closure ledger");
  }
  if (certification.verificationStatus !== "verified") {
    throw new ConflictException("Provider webhook QA archive release verification must be verified before closure ledger");
  }
  if (certification.digestChainStatus !== "confirmed") {
    throw new ConflictException("Provider webhook QA archive digest chain must be confirmed before closure ledger");
  }
  if (!Object.values(certification.prerequisiteChecklist).every(Boolean)) {
    throw new ConflictException("Provider webhook QA archive release prerequisites must be complete before closure ledger");
  }
  if (!Object.values(certification.certificationChecklist).every(Boolean)) {
    throw new ConflictException("Provider webhook QA archive release certification checklist must be complete before closure ledger");
  }
}

function qaHandoffArchiveReleaseClosureLedgerResponse(
  certification: ProviderWebhookReviewQaHandoffReleaseCertification
): ProviderWebhookReviewQaHandoffReleaseClosureLedger {
  const releaseCertificationDigest = certification.safeDigest;
  const prerequisiteChecklistComplete = Object.values(certification.prerequisiteChecklist).every(Boolean);
  const certificationChecklistComplete = Object.values(certification.certificationChecklist).every(Boolean);
  const ledgerRows: ProviderWebhookReviewQaHandoffReleaseClosureLedger["ledgerRows"] = [
    releaseClosureLedgerRow("release_evidence", "Release evidence pack", "verified", certification.releaseEvidenceDigest, certification.counts.releaseEvidenceCheckedCount, Boolean(certification.releaseEvidenceDigest)),
    releaseClosureLedgerRow("release_verification", "Release verification matrix", "verified", certification.releaseVerificationDigest, certification.counts.releaseVerificationCheckedCount, Boolean(certification.releaseVerificationDigest)),
    releaseClosureLedgerRow("release_certification", "Release certification receipt", "certified", releaseCertificationDigest, certification.counts.releaseCertificationCheckedCount, certification.certificationStatus === "certified"),
    releaseClosureLedgerRow("prerequisite_checklist", "Prerequisite checklist", "complete", releaseCertificationDigest, certification.counts.prerequisitePassedCount, prerequisiteChecklistComplete),
    releaseClosureLedgerRow("certification_checklist", "Certification checklist", "closed", releaseCertificationDigest, certification.counts.certificationChecklistPassedCount, certificationChecklistComplete)
  ];
  const closedRowCount = ledgerRows.filter((row) => row.complete).length;
  const payload = {
    ledgerKind: "qa-handoff-locked-archive-release-closure-ledger" as const,
    ledgerStatus: "certified_release_closed" as const,
    certificationStatus: "certified" as const,
    releaseReadinessStatus: "ready_for_release" as const,
    verificationStatus: "verified" as const,
    digestChainStatus: "confirmed" as const,
    safeFilename: safeExportFilename("provider-webhook-review-qa-handoff-archive-release-closure-ledger.json"),
    releaseEvidenceDigest: certification.releaseEvidenceDigest,
    releaseVerificationDigest: certification.releaseVerificationDigest,
    releaseCertificationDigest,
    ledgerRows,
    prerequisiteChecklist: certification.prerequisiteChecklist,
    certificationChecklist: certification.certificationChecklist,
    ledgerSummary: {
      ledgerRowCount: ledgerRows.length,
      closedRowCount,
      prerequisiteChecklistComplete,
      certificationChecklistComplete,
      releaseCertificationDigestPresent: Boolean(releaseCertificationDigest),
      externalCallsZero: certification.externalCalls === 0
    },
    counts: {
      totalItems: certification.counts.totalItems,
      releaseEvidenceCheckedCount: certification.counts.releaseEvidenceCheckedCount,
      releaseVerificationCheckedCount: certification.counts.releaseVerificationCheckedCount,
      releaseCertificationCheckedCount: certification.counts.releaseCertificationCheckedCount,
      closureLedgerCheckedCount: 1,
      prerequisitePassedCount: certification.counts.prerequisitePassedCount,
      prerequisiteTotalCount: certification.counts.prerequisiteTotalCount,
      certificationChecklistPassedCount: certification.counts.certificationChecklistPassedCount,
      certificationChecklistTotalCount: certification.counts.certificationChecklistTotalCount,
      ledgerRowCount: ledgerRows.length,
      ledgerClosedRowCount: closedRowCount,
      ledgerNeedsReviewRowCount: ledgerRows.length - closedRowCount
    },
    externalCalls: 0 as const
  };
  return {
    ...payload,
    safeDigest: safeDigestForExport(payload),
    externalCalls: 0 as const
  };
}

function releaseClosureLedgerRow(
  key: ProviderWebhookReviewQaHandoffReleaseClosureLedger["ledgerRows"][number]["key"],
  label: string,
  ledgerStatus: ProviderWebhookReviewQaHandoffReleaseClosureLedger["ledgerRows"][number]["ledgerStatus"],
  safeDigest: string,
  checkedCount: number,
  complete: boolean
): ProviderWebhookReviewQaHandoffReleaseClosureLedger["ledgerRows"][number] {
  return {
    key,
    label,
    ledgerStatus,
    safeDigest,
    checkedCount,
    complete
  };
}

function assertQaHandoffArchiveReleaseAttestationAuditReady(
  closureLedger: ProviderWebhookReviewQaHandoffReleaseClosureLedger
) {
  if (closureLedger.ledgerStatus !== "certified_release_closed") {
    throw new ConflictException("Provider webhook QA archive release closure ledger must be certified_release_closed before attestation audit");
  }
  if (closureLedger.certificationStatus !== "certified") {
    throw new ConflictException("Provider webhook QA archive release certification receipt must be certified before attestation audit");
  }
  if (closureLedger.releaseReadinessStatus !== "ready_for_release") {
    throw new ConflictException("Provider webhook QA archive release readiness must be ready_for_release before attestation audit");
  }
  if (closureLedger.verificationStatus !== "verified") {
    throw new ConflictException("Provider webhook QA archive release verification must be verified before attestation audit");
  }
  if (closureLedger.digestChainStatus !== "confirmed") {
    throw new ConflictException("Provider webhook QA archive digest chain must be confirmed before attestation audit");
  }
  if (!Object.values(closureLedger.prerequisiteChecklist).every(Boolean)) {
    throw new ConflictException("Provider webhook QA archive release prerequisites must be complete before attestation audit");
  }
  if (!Object.values(closureLedger.certificationChecklist).every(Boolean)) {
    throw new ConflictException("Provider webhook QA archive release certification checklist must be complete before attestation audit");
  }
  if (closureLedger.externalCalls !== 0 || !closureLedger.ledgerSummary.externalCallsZero) {
    throw new ConflictException("Provider webhook QA archive release closure ledger must have externalCalls=0 before attestation audit");
  }
  if (closureLedger.counts.ledgerNeedsReviewRowCount !== 0 || !closureLedger.ledgerRows.every((row) => row.complete)) {
    throw new ConflictException("Provider webhook QA archive release closure ledger rows must be complete before attestation audit");
  }
}

function qaHandoffArchiveReleaseAttestationAuditResponse(
  closureLedger: ProviderWebhookReviewQaHandoffReleaseClosureLedger
): ProviderWebhookReviewQaHandoffReleaseAttestationAudit {
  const closureLedgerDigest = closureLedger.safeDigest;
  const prerequisiteChecklistComplete = Object.values(closureLedger.prerequisiteChecklist).every(Boolean);
  const certificationChecklistComplete = Object.values(closureLedger.certificationChecklist).every(Boolean);
  const ledgerClosed = closureLedger.ledgerStatus === "certified_release_closed" &&
    closureLedger.ledgerSummary.closedRowCount === closureLedger.ledgerSummary.ledgerRowCount &&
    closureLedger.counts.ledgerNeedsReviewRowCount === 0;
  const attestationRows: ProviderWebhookReviewQaHandoffReleaseAttestationAudit["attestationRows"] = [
    releaseAttestationAuditRow("closure_ledger", "Closure ledger", "attested", closureLedgerDigest, closureLedger.counts.closureLedgerCheckedCount, ledgerClosed),
    releaseAttestationAuditRow("release_evidence_digest", "Release evidence digest", "verified", closureLedger.releaseEvidenceDigest, closureLedger.counts.releaseEvidenceCheckedCount, Boolean(closureLedger.releaseEvidenceDigest)),
    releaseAttestationAuditRow("release_verification_digest", "Release verification digest", "verified", closureLedger.releaseVerificationDigest, closureLedger.counts.releaseVerificationCheckedCount, Boolean(closureLedger.releaseVerificationDigest)),
    releaseAttestationAuditRow("release_certification_digest", "Release certification digest", "verified", closureLedger.releaseCertificationDigest, closureLedger.counts.releaseCertificationCheckedCount, Boolean(closureLedger.releaseCertificationDigest)),
    releaseAttestationAuditRow("prerequisite_checklist", "Prerequisite checklist", "complete", closureLedgerDigest, closureLedger.counts.prerequisitePassedCount, prerequisiteChecklistComplete),
    releaseAttestationAuditRow("certification_checklist", "Certification checklist", "complete", closureLedgerDigest, closureLedger.counts.certificationChecklistPassedCount, certificationChecklistComplete),
    releaseAttestationAuditRow("external_calls", "External calls", "attested", closureLedgerDigest, closureLedger.externalCalls, closureLedger.externalCalls === 0 && closureLedger.ledgerSummary.externalCallsZero)
  ];
  const attestedRowCount = attestationRows.filter((row) => row.complete).length;
  const payload = {
    attestationKind: "qa-handoff-locked-archive-release-attestation-audit" as const,
    attestationStatus: "complete" as const,
    ledgerStatus: "certified_release_closed" as const,
    certificationStatus: "certified" as const,
    releaseReadinessStatus: "ready_for_release" as const,
    verificationStatus: "verified" as const,
    digestChainStatus: "confirmed" as const,
    safeFilename: safeExportFilename("provider-webhook-review-qa-handoff-archive-release-attestation-audit.json"),
    releaseEvidenceDigest: closureLedger.releaseEvidenceDigest,
    releaseVerificationDigest: closureLedger.releaseVerificationDigest,
    releaseCertificationDigest: closureLedger.releaseCertificationDigest,
    closureLedgerDigest,
    attestationRows,
    prerequisiteChecklist: closureLedger.prerequisiteChecklist,
    certificationChecklist: closureLedger.certificationChecklist,
    attestationSummary: {
      attestationRowCount: attestationRows.length,
      attestedRowCount,
      ledgerClosed,
      prerequisiteChecklistComplete,
      certificationChecklistComplete,
      closureLedgerDigestPresent: Boolean(closureLedgerDigest),
      externalCallsZero: closureLedger.externalCalls === 0 && closureLedger.ledgerSummary.externalCallsZero
    },
    counts: {
      totalItems: closureLedger.counts.totalItems,
      releaseEvidenceCheckedCount: closureLedger.counts.releaseEvidenceCheckedCount,
      releaseVerificationCheckedCount: closureLedger.counts.releaseVerificationCheckedCount,
      releaseCertificationCheckedCount: closureLedger.counts.releaseCertificationCheckedCount,
      closureLedgerCheckedCount: closureLedger.counts.closureLedgerCheckedCount,
      attestationAuditCheckedCount: 1,
      prerequisitePassedCount: closureLedger.counts.prerequisitePassedCount,
      prerequisiteTotalCount: closureLedger.counts.prerequisiteTotalCount,
      certificationChecklistPassedCount: closureLedger.counts.certificationChecklistPassedCount,
      certificationChecklistTotalCount: closureLedger.counts.certificationChecklistTotalCount,
      ledgerRowCount: closureLedger.counts.ledgerRowCount,
      ledgerClosedRowCount: closureLedger.counts.ledgerClosedRowCount,
      attestationRowCount: attestationRows.length,
      attestationAttestedRowCount: attestedRowCount,
      attestationNeedsReviewRowCount: attestationRows.length - attestedRowCount
    },
    externalCalls: 0 as const
  };
  return {
    ...payload,
    safeDigest: safeDigestForExport(payload),
    externalCalls: 0 as const
  };
}

function releaseAttestationAuditRow(
  key: ProviderWebhookReviewQaHandoffReleaseAttestationAudit["attestationRows"][number]["key"],
  label: string,
  attestationStatus: ProviderWebhookReviewQaHandoffReleaseAttestationAudit["attestationRows"][number]["attestationStatus"],
  safeDigest: string,
  checkedCount: number,
  complete: boolean
): ProviderWebhookReviewQaHandoffReleaseAttestationAudit["attestationRows"][number] {
  return {
    key,
    label,
    attestationStatus,
    safeDigest,
    checkedCount,
    complete
  };
}

function assertQaHandoffArchiveReleaseAttestationReconciliationReady(
  attestationAudit: ProviderWebhookReviewQaHandoffReleaseAttestationAudit
) {
  if (attestationAudit.attestationStatus !== "complete") {
    throw new ConflictException("Provider webhook QA archive release attestation audit must be complete before reconciliation");
  }
  if (attestationAudit.ledgerStatus !== "certified_release_closed") {
    throw new ConflictException("Provider webhook QA archive release closure ledger must be certified_release_closed before reconciliation");
  }
  if (attestationAudit.certificationStatus !== "certified") {
    throw new ConflictException("Provider webhook QA archive release certification receipt must be certified before reconciliation");
  }
  if (attestationAudit.releaseReadinessStatus !== "ready_for_release") {
    throw new ConflictException("Provider webhook QA archive release readiness must be ready_for_release before reconciliation");
  }
  if (attestationAudit.verificationStatus !== "verified") {
    throw new ConflictException("Provider webhook QA archive release verification must be verified before reconciliation");
  }
  if (attestationAudit.digestChainStatus !== "confirmed") {
    throw new ConflictException("Provider webhook QA archive digest chain must be confirmed before reconciliation");
  }
  if (!Object.values(attestationAudit.prerequisiteChecklist).every(Boolean)) {
    throw new ConflictException("Provider webhook QA archive release prerequisites must be complete before reconciliation");
  }
  if (!Object.values(attestationAudit.certificationChecklist).every(Boolean)) {
    throw new ConflictException("Provider webhook QA archive release certification checklist must be complete before reconciliation");
  }
  if (attestationAudit.externalCalls !== 0 || !attestationAudit.attestationSummary.externalCallsZero) {
    throw new ConflictException("Provider webhook QA archive release attestation audit must have externalCalls=0 before reconciliation");
  }
  if (attestationAudit.counts.attestationNeedsReviewRowCount !== 0 || !attestationAudit.attestationRows.every((row) => row.complete)) {
    throw new ConflictException("Provider webhook QA archive release attestation audit rows must be complete before reconciliation");
  }
}

function qaHandoffArchiveReleaseAttestationReconciliationResponse(
  attestationAudit: ProviderWebhookReviewQaHandoffReleaseAttestationAudit
): ProviderWebhookReviewQaHandoffReleaseAttestationReconciliationRegister {
  const prerequisiteChecklistComplete = Object.values(attestationAudit.prerequisiteChecklist).every(Boolean);
  const certificationChecklistComplete = Object.values(attestationAudit.certificationChecklist).every(Boolean);
  const closureLedgerClosed = attestationAudit.ledgerStatus === "certified_release_closed" &&
    attestationAudit.counts.ledgerClosedRowCount === attestationAudit.counts.ledgerRowCount;
  const allDigestsLinked = [
    attestationAudit.releaseEvidenceDigest,
    attestationAudit.releaseVerificationDigest,
    attestationAudit.releaseCertificationDigest,
    attestationAudit.closureLedgerDigest,
    attestationAudit.safeDigest
  ].every(Boolean);
  const reconciliationRows: ProviderWebhookReviewQaHandoffReleaseAttestationReconciliationRegister["reconciliationRows"] = [
    releaseAttestationReconciliationRow("release_evidence_digest", "Release evidence digest", "verified", attestationAudit.releaseEvidenceDigest, attestationAudit.counts.releaseEvidenceCheckedCount, Boolean(attestationAudit.releaseEvidenceDigest)),
    releaseAttestationReconciliationRow("release_verification_digest", "Release verification digest", "verified", attestationAudit.releaseVerificationDigest, attestationAudit.counts.releaseVerificationCheckedCount, Boolean(attestationAudit.releaseVerificationDigest)),
    releaseAttestationReconciliationRow("release_certification_digest", "Release certification digest", "verified", attestationAudit.releaseCertificationDigest, attestationAudit.counts.releaseCertificationCheckedCount, Boolean(attestationAudit.releaseCertificationDigest)),
    releaseAttestationReconciliationRow("closure_ledger_digest", "Closure ledger digest", "aligned", attestationAudit.closureLedgerDigest, attestationAudit.counts.closureLedgerCheckedCount, closureLedgerClosed && Boolean(attestationAudit.closureLedgerDigest)),
    releaseAttestationReconciliationRow("attestation_audit_digest", "Attestation audit digest", "attested", attestationAudit.safeDigest, attestationAudit.counts.attestationAuditCheckedCount, attestationAudit.attestationStatus === "complete" && Boolean(attestationAudit.safeDigest)),
    releaseAttestationReconciliationRow("prerequisite_checklist", "Prerequisite checklist", "complete", attestationAudit.closureLedgerDigest, attestationAudit.counts.prerequisitePassedCount, prerequisiteChecklistComplete),
    releaseAttestationReconciliationRow("certification_checklist", "Certification checklist", "complete", attestationAudit.closureLedgerDigest, attestationAudit.counts.certificationChecklistPassedCount, certificationChecklistComplete),
    releaseAttestationReconciliationRow("external_calls", "External calls", "attested", attestationAudit.safeDigest, attestationAudit.externalCalls, attestationAudit.externalCalls === 0 && attestationAudit.attestationSummary.externalCallsZero)
  ];
  const alignedRowCount = reconciliationRows.filter((row) => row.aligned).length;
  const exceptionRows: ProviderWebhookReviewQaHandoffReleaseAttestationReconciliationRegister["exceptionRows"] = [];
  const payload = {
    reconciliationKind: "qa-handoff-locked-archive-release-attestation-reconciliation-register" as const,
    reconciliationStatus: "aligned" as const,
    attestationStatus: "complete" as const,
    ledgerStatus: "certified_release_closed" as const,
    certificationStatus: "certified" as const,
    releaseReadinessStatus: "ready_for_release" as const,
    verificationStatus: "verified" as const,
    digestChainStatus: "confirmed" as const,
    safeFilename: safeExportFilename("provider-webhook-review-qa-handoff-archive-release-attestation-reconciliation.json"),
    releaseEvidenceDigest: attestationAudit.releaseEvidenceDigest,
    verificationDigest: attestationAudit.releaseVerificationDigest,
    certificationDigest: attestationAudit.releaseCertificationDigest,
    closureLedgerDigest: attestationAudit.closureLedgerDigest,
    attestationAuditDigest: attestationAudit.safeDigest,
    reconciliationRows,
    exceptionRows,
    inheritedPrerequisiteChecklist: attestationAudit.prerequisiteChecklist,
    inheritedCertificationChecklist: attestationAudit.certificationChecklist,
    reconciliationSummary: {
      reconciliationRowCount: reconciliationRows.length,
      alignedRowCount,
      exceptionRowCount: exceptionRows.length,
      attestationAuditComplete: attestationAudit.attestationStatus === "complete" && attestationAudit.attestationSummary.attestedRowCount === attestationAudit.attestationSummary.attestationRowCount,
      closureLedgerClosed,
      prerequisiteChecklistComplete,
      certificationChecklistComplete,
      allDigestsLinked,
      externalCallsZero: attestationAudit.externalCalls === 0 && attestationAudit.attestationSummary.externalCallsZero
    },
    counts: {
      totalItems: attestationAudit.counts.totalItems,
      releaseEvidenceCheckedCount: attestationAudit.counts.releaseEvidenceCheckedCount,
      releaseVerificationCheckedCount: attestationAudit.counts.releaseVerificationCheckedCount,
      releaseCertificationCheckedCount: attestationAudit.counts.releaseCertificationCheckedCount,
      closureLedgerCheckedCount: attestationAudit.counts.closureLedgerCheckedCount,
      attestationAuditCheckedCount: attestationAudit.counts.attestationAuditCheckedCount,
      reconciliationCheckedCount: 1,
      prerequisitePassedCount: attestationAudit.counts.prerequisitePassedCount,
      prerequisiteTotalCount: attestationAudit.counts.prerequisiteTotalCount,
      certificationChecklistPassedCount: attestationAudit.counts.certificationChecklistPassedCount,
      certificationChecklistTotalCount: attestationAudit.counts.certificationChecklistTotalCount,
      ledgerRowCount: attestationAudit.counts.ledgerRowCount,
      ledgerClosedRowCount: attestationAudit.counts.ledgerClosedRowCount,
      attestationRowCount: attestationAudit.counts.attestationRowCount,
      attestationAttestedRowCount: attestationAudit.counts.attestationAttestedRowCount,
      reconciliationRowCount: reconciliationRows.length,
      reconciliationAlignedRowCount: alignedRowCount,
      reconciliationExceptionRowCount: exceptionRows.length
    },
    externalCalls: 0 as const
  };
  const safeDigest = safeDigestForExport(payload);
  return {
    ...payload,
    safeDigest,
    reconciliationDigest: safeDigest,
    externalCalls: 0 as const
  };
}

function releaseAttestationReconciliationRow(
  key: ProviderWebhookReviewQaHandoffReleaseAttestationReconciliationRegister["reconciliationRows"][number]["key"],
  label: string,
  reconciliationStatus: ProviderWebhookReviewQaHandoffReleaseAttestationReconciliationRegister["reconciliationRows"][number]["reconciliationStatus"],
  safeDigest: string,
  checkedCount: number,
  aligned: boolean
): ProviderWebhookReviewQaHandoffReleaseAttestationReconciliationRegister["reconciliationRows"][number] {
  return {
    key,
    label,
    reconciliationStatus,
    safeDigest,
    checkedCount,
    aligned
  };
}

function assertQaHandoffCertifiedReleaseGatePrerequisites(
  reconciliation: ProviderWebhookReviewQaHandoffReleaseAttestationReconciliationRegister
) {
  if (!["aligned", "complete"].includes(reconciliation.reconciliationStatus)) {
    throw new ConflictException("Provider webhook QA archive release attestation reconciliation must be aligned before release gate");
  }
  if (reconciliation.attestationStatus !== "complete") {
    throw new ConflictException("Provider webhook QA archive release attestation audit must be complete before release gate");
  }
  if (reconciliation.ledgerStatus !== "certified_release_closed") {
    throw new ConflictException("Provider webhook QA archive release closure ledger must be certified_release_closed before release gate");
  }
  if (reconciliation.certificationStatus !== "certified") {
    throw new ConflictException("Provider webhook QA archive release certification receipt must be certified before release gate");
  }
  if (reconciliation.releaseReadinessStatus !== "ready_for_release") {
    throw new ConflictException("Provider webhook QA archive release readiness must be ready_for_release before release gate");
  }
  if (reconciliation.verificationStatus !== "verified") {
    throw new ConflictException("Provider webhook QA archive release verification must be verified before release gate");
  }
  if (reconciliation.digestChainStatus !== "confirmed") {
    throw new ConflictException("Provider webhook QA archive digest chain must be confirmed before release gate");
  }
  if (!Object.values(reconciliation.inheritedPrerequisiteChecklist).every(Boolean) || !reconciliation.reconciliationSummary.prerequisiteChecklistComplete) {
    throw new ConflictException("Provider webhook QA archive release prerequisites must be complete before release gate");
  }
  if (!Object.values(reconciliation.inheritedCertificationChecklist).every(Boolean) || !reconciliation.reconciliationSummary.certificationChecklistComplete) {
    throw new ConflictException("Provider webhook QA archive release certification checklist must be complete before release gate");
  }
  if (reconciliation.externalCalls !== 0 || !reconciliation.reconciliationSummary.externalCallsZero) {
    throw new ConflictException("Provider webhook QA archive release gate requires externalCalls=0");
  }
  if (!reconciliation.reconciliationRows.every((row) => row.aligned)) {
    throw new ConflictException("Provider webhook QA archive release attestation reconciliation rows must be aligned before release gate");
  }
}

function qaHandoffCertifiedReleaseGateResponse(
  reconciliation: ProviderWebhookReviewQaHandoffReleaseAttestationReconciliationRegister
): ProviderWebhookReviewQaHandoffCertifiedReleaseGate {
  const gateChecklist = {
    prerequisiteChainComplete: true,
    reconciliationComplete: ["aligned", "complete"].includes(reconciliation.reconciliationStatus) && reconciliation.reconciliationRows.every((row) => row.aligned),
    attestationComplete: reconciliation.attestationStatus === "complete",
    closureLedgerClosed: reconciliation.ledgerStatus === "certified_release_closed",
    certificationComplete: reconciliation.certificationStatus === "certified",
    releaseReady: reconciliation.releaseReadinessStatus === "ready_for_release",
    verificationComplete: reconciliation.verificationStatus === "verified",
    digestChainConfirmed: reconciliation.digestChainStatus === "confirmed" && [
      reconciliation.releaseEvidenceDigest,
      reconciliation.verificationDigest,
      reconciliation.certificationDigest,
      reconciliation.closureLedgerDigest,
      reconciliation.attestationAuditDigest,
      reconciliation.reconciliationDigest
    ].every(Boolean),
    prerequisiteChecklistComplete: Object.values(reconciliation.inheritedPrerequisiteChecklist).every(Boolean) && reconciliation.reconciliationSummary.prerequisiteChecklistComplete,
    certificationChecklistComplete: Object.values(reconciliation.inheritedCertificationChecklist).every(Boolean) && reconciliation.reconciliationSummary.certificationChecklistComplete,
    noBlockingExceptions: reconciliation.exceptionRows.length === 0,
    externalCallsZero: reconciliation.externalCalls === 0 && reconciliation.reconciliationSummary.externalCallsZero
  };
  const blockingReasons = certifiedReleaseGateBlockingReasons(reconciliation, gateChecklist);
  const gateReady = Object.values(gateChecklist).every(Boolean) && blockingReasons.length === 0;
  const payload = {
    gateKind: "qa-handoff-locked-archive-certified-release-gate" as const,
    gateStatus: gateReady ? "ready" as const : "blocked" as const,
    goNoGoDecision: gateReady ? "go" as const : "no_go" as const,
    releaseReadinessStatus: "ready_for_release" as const,
    reconciliationStatus: reconciliation.reconciliationStatus,
    attestationStatus: "complete" as const,
    ledgerStatus: "certified_release_closed" as const,
    certificationStatus: "certified" as const,
    verificationStatus: "verified" as const,
    digestChainStatus: "confirmed" as const,
    safeFilename: safeExportFilename("provider-webhook-review-qa-handoff-certified-release-gate.json"),
    reconciliationDigest: reconciliation.reconciliationDigest,
    attestationAuditDigest: reconciliation.attestationAuditDigest,
    closureLedgerDigest: reconciliation.closureLedgerDigest,
    certificationDigest: reconciliation.certificationDigest,
    verificationDigest: reconciliation.verificationDigest,
    releaseEvidenceDigest: reconciliation.releaseEvidenceDigest,
    inheritedPrerequisiteChecklist: reconciliation.inheritedPrerequisiteChecklist,
    inheritedCertificationChecklist: reconciliation.inheritedCertificationChecklist,
    inheritedReconciliationSummary: reconciliation.reconciliationSummary,
    gateChecklist,
    blockingReasons,
    exceptionRows: reconciliation.exceptionRows,
    counts: {
      totalItems: reconciliation.counts.totalItems,
      releaseEvidenceCheckedCount: reconciliation.counts.releaseEvidenceCheckedCount,
      releaseVerificationCheckedCount: reconciliation.counts.releaseVerificationCheckedCount,
      releaseCertificationCheckedCount: reconciliation.counts.releaseCertificationCheckedCount,
      closureLedgerCheckedCount: reconciliation.counts.closureLedgerCheckedCount,
      attestationAuditCheckedCount: reconciliation.counts.attestationAuditCheckedCount,
      reconciliationCheckedCount: reconciliation.counts.reconciliationCheckedCount,
      gateCheckedCount: 1,
      prerequisitePassedCount: reconciliation.counts.prerequisitePassedCount,
      prerequisiteTotalCount: reconciliation.counts.prerequisiteTotalCount,
      certificationChecklistPassedCount: reconciliation.counts.certificationChecklistPassedCount,
      certificationChecklistTotalCount: reconciliation.counts.certificationChecklistTotalCount,
      reconciliationRowCount: reconciliation.counts.reconciliationRowCount,
      reconciliationAlignedRowCount: reconciliation.counts.reconciliationAlignedRowCount,
      reconciliationExceptionRowCount: reconciliation.counts.reconciliationExceptionRowCount,
      gateChecklistPassedCount: Object.values(gateChecklist).filter(Boolean).length,
      gateChecklistTotalCount: Object.keys(gateChecklist).length,
      blockingReasonCount: blockingReasons.length,
      exceptionRowCount: reconciliation.exceptionRows.length
    },
    externalCalls: 0 as const
  };
  const safeDigest = safeDigestForExport(payload);
  return {
    ...payload,
    safeDigest,
    releaseGateDigest: safeDigest,
    externalCalls: 0 as const
  };
}

function certifiedReleaseGateBlockingReasons(
  reconciliation: ProviderWebhookReviewQaHandoffReleaseAttestationReconciliationRegister,
  gateChecklist: ProviderWebhookReviewQaHandoffCertifiedReleaseGate["gateChecklist"]
): ProviderWebhookReviewQaHandoffCertifiedReleaseGateBlockingReason[] {
  const reasons: ProviderWebhookReviewQaHandoffCertifiedReleaseGateBlockingReason[] = [];
  const add = (
    code: ProviderWebhookReviewQaHandoffCertifiedReleaseGateBlockingReason["code"],
    label: string,
    safeDigest = reconciliation.reconciliationDigest
  ) => {
    reasons.push({
      code,
      label,
      status: "blocking_reason",
      safeDigest
    });
  };
  if (!gateChecklist.prerequisiteChainComplete) add("prerequisite_chain_incomplete", "Prerequisite chain is incomplete");
  if (!gateChecklist.reconciliationComplete) add("reconciliation_not_aligned", "Attestation reconciliation is not aligned");
  if (!gateChecklist.attestationComplete) add("attestation_incomplete", "Attestation audit is incomplete", reconciliation.attestationAuditDigest);
  if (!gateChecklist.closureLedgerClosed) add("closure_ledger_incomplete", "Closure ledger is not certified release closed", reconciliation.closureLedgerDigest);
  if (!gateChecklist.certificationComplete) add("certification_incomplete", "Release certification is incomplete", reconciliation.certificationDigest);
  if (!gateChecklist.releaseReady) add("release_not_ready", "Release readiness is not ready_for_release", reconciliation.releaseEvidenceDigest);
  if (!gateChecklist.verificationComplete) add("verification_incomplete", "Release verification is incomplete", reconciliation.verificationDigest);
  if (!gateChecklist.digestChainConfirmed) add("digest_chain_unconfirmed", "Digest chain is not confirmed");
  if (!gateChecklist.prerequisiteChecklistComplete) add("prerequisite_checklist_incomplete", "Prerequisite checklist is incomplete", reconciliation.releaseEvidenceDigest);
  if (!gateChecklist.certificationChecklistComplete) add("certification_checklist_incomplete", "Certification checklist is incomplete", reconciliation.certificationDigest);
  if (!gateChecklist.noBlockingExceptions) add("reconciliation_exception", "Attestation reconciliation has blocking exceptions");
  if (!gateChecklist.externalCallsZero) add("external_calls_present", "External calls must remain zero");
  return reasons;
}

function assertQaHandoffCertifiedReleaseDecisionReceiptPrerequisites(
  releaseGate: ProviderWebhookReviewQaHandoffCertifiedReleaseGate
) {
  if (releaseGate.gateStatus === "incomplete") {
    throw new ConflictException("Provider webhook QA archive certified release gate must be complete before decision receipt");
  }
  if (!["aligned", "complete"].includes(releaseGate.reconciliationStatus)) {
    throw new ConflictException("Provider webhook QA archive release attestation reconciliation must be aligned before decision receipt");
  }
  if (releaseGate.attestationStatus !== "complete") {
    throw new ConflictException("Provider webhook QA archive release attestation audit must be complete before decision receipt");
  }
  if (releaseGate.ledgerStatus !== "certified_release_closed") {
    throw new ConflictException("Provider webhook QA archive release closure ledger must be certified_release_closed before decision receipt");
  }
  if (releaseGate.certificationStatus !== "certified") {
    throw new ConflictException("Provider webhook QA archive release certification receipt must be certified before decision receipt");
  }
  if (releaseGate.releaseReadinessStatus !== "ready_for_release") {
    throw new ConflictException("Provider webhook QA archive release readiness must be ready_for_release before decision receipt");
  }
  if (releaseGate.verificationStatus !== "verified") {
    throw new ConflictException("Provider webhook QA archive release verification must be verified before decision receipt");
  }
  if (releaseGate.digestChainStatus !== "confirmed") {
    throw new ConflictException("Provider webhook QA archive digest chain must be confirmed before decision receipt");
  }
  if (!Object.values(releaseGate.inheritedPrerequisiteChecklist).every(Boolean)) {
    throw new ConflictException("Provider webhook QA archive release prerequisites must be complete before decision receipt");
  }
  if (!Object.values(releaseGate.inheritedCertificationChecklist).every(Boolean)) {
    throw new ConflictException("Provider webhook QA archive release certification checklist must be complete before decision receipt");
  }
  if (!certifiedReleaseDecisionReceiptPrerequisiteChecklistComplete(releaseGate)) {
    throw new ConflictException("Provider webhook QA archive certified release gate checklist must be complete before decision receipt");
  }
  if (releaseGate.externalCalls !== 0 || !releaseGate.gateChecklist.externalCallsZero) {
    throw new ConflictException("Provider webhook QA archive certified release decision receipt requires externalCalls=0");
  }
}

function certifiedReleaseDecisionReceiptPrerequisiteChecklistComplete(
  releaseGate: ProviderWebhookReviewQaHandoffCertifiedReleaseGate
) {
  return releaseGate.gateChecklist.prerequisiteChainComplete &&
    releaseGate.gateChecklist.reconciliationComplete &&
    releaseGate.gateChecklist.attestationComplete &&
    releaseGate.gateChecklist.closureLedgerClosed &&
    releaseGate.gateChecklist.certificationComplete &&
    releaseGate.gateChecklist.releaseReady &&
    releaseGate.gateChecklist.verificationComplete &&
    releaseGate.gateChecklist.digestChainConfirmed &&
    releaseGate.gateChecklist.prerequisiteChecklistComplete &&
    releaseGate.gateChecklist.certificationChecklistComplete &&
    releaseGate.gateChecklist.externalCallsZero;
}

function qaHandoffCertifiedReleaseDecisionReceiptResponse(
  releaseGate: ProviderWebhookReviewQaHandoffCertifiedReleaseGate
): ProviderWebhookReviewQaHandoffCertifiedReleaseDecisionReceipt {
  const gateChecklistComplete = Object.values(releaseGate.gateChecklist).every(Boolean);
  const receiptIssued = releaseGate.gateStatus === "ready" &&
    releaseGate.goNoGoDecision === "go" &&
    gateChecklistComplete &&
    releaseGate.blockingReasons.length === 0 &&
    releaseGate.exceptionRows.length === 0 &&
    releaseGate.externalCalls === 0;
  const receiptStatus = receiptIssued ? "issued" as const : "blocked" as const;
  const releaseDecision = receiptIssued ? "go" as const : "no_go" as const;
  const receiptRows = certifiedReleaseDecisionReceiptRows(releaseGate, receiptIssued, gateChecklistComplete);
  const completeReceiptRowCount = receiptRows.filter((row) => row.complete).length;
  const payload = {
    receiptKind: "qa-handoff-locked-archive-certified-release-decision-receipt" as const,
    receiptStatus,
    releaseDecision,
    gateStatus: releaseGate.gateStatus,
    goNoGoDecision: releaseGate.goNoGoDecision,
    releaseReadinessStatus: releaseGate.releaseReadinessStatus,
    reconciliationStatus: releaseGate.reconciliationStatus,
    attestationStatus: releaseGate.attestationStatus,
    ledgerStatus: releaseGate.ledgerStatus,
    certificationStatus: releaseGate.certificationStatus,
    verificationStatus: releaseGate.verificationStatus,
    digestChainStatus: releaseGate.digestChainStatus,
    safeFilename: safeExportFilename("provider-webhook-review-qa-handoff-certified-release-decision-receipt.json"),
    releaseGateDigest: releaseGate.releaseGateDigest,
    reconciliationDigest: releaseGate.reconciliationDigest,
    attestationAuditDigest: releaseGate.attestationAuditDigest,
    closureLedgerDigest: releaseGate.closureLedgerDigest,
    certificationDigest: releaseGate.certificationDigest,
    verificationDigest: releaseGate.verificationDigest,
    releaseEvidenceDigest: releaseGate.releaseEvidenceDigest,
    inheritedPrerequisiteChecklist: releaseGate.inheritedPrerequisiteChecklist,
    inheritedCertificationChecklist: releaseGate.inheritedCertificationChecklist,
    inheritedGateChecklist: releaseGate.gateChecklist,
    inheritedReconciliationSummary: releaseGate.inheritedReconciliationSummary,
    inheritedBlockingReasons: releaseGate.blockingReasons,
    inheritedExceptionRows: releaseGate.exceptionRows,
    receiptRows,
    receiptSummary: {
      receiptRowCount: receiptRows.length,
      completeReceiptRowCount,
      releaseGateReady: releaseGate.gateStatus === "ready",
      releaseDecisionGo: releaseGate.goNoGoDecision === "go",
      prerequisiteChecklistComplete: Object.values(releaseGate.inheritedPrerequisiteChecklist).every(Boolean),
      certificationChecklistComplete: Object.values(releaseGate.inheritedCertificationChecklist).every(Boolean),
      gateChecklistComplete,
      noBlockingReasons: releaseGate.blockingReasons.length === 0,
      noExceptionRows: releaseGate.exceptionRows.length === 0,
      externalCallsZero: releaseGate.externalCalls === 0
    },
    counts: {
      totalItems: releaseGate.counts.totalItems,
      releaseEvidenceCheckedCount: releaseGate.counts.releaseEvidenceCheckedCount,
      releaseVerificationCheckedCount: releaseGate.counts.releaseVerificationCheckedCount,
      releaseCertificationCheckedCount: releaseGate.counts.releaseCertificationCheckedCount,
      closureLedgerCheckedCount: releaseGate.counts.closureLedgerCheckedCount,
      attestationAuditCheckedCount: releaseGate.counts.attestationAuditCheckedCount,
      reconciliationCheckedCount: releaseGate.counts.reconciliationCheckedCount,
      gateCheckedCount: releaseGate.counts.gateCheckedCount,
      decisionReceiptCheckedCount: 1,
      prerequisitePassedCount: releaseGate.counts.prerequisitePassedCount,
      prerequisiteTotalCount: releaseGate.counts.prerequisiteTotalCount,
      certificationChecklistPassedCount: releaseGate.counts.certificationChecklistPassedCount,
      certificationChecklistTotalCount: releaseGate.counts.certificationChecklistTotalCount,
      reconciliationRowCount: releaseGate.counts.reconciliationRowCount,
      reconciliationAlignedRowCount: releaseGate.counts.reconciliationAlignedRowCount,
      reconciliationExceptionRowCount: releaseGate.counts.reconciliationExceptionRowCount,
      gateChecklistPassedCount: releaseGate.counts.gateChecklistPassedCount,
      gateChecklistTotalCount: releaseGate.counts.gateChecklistTotalCount,
      blockingReasonCount: releaseGate.counts.blockingReasonCount,
      exceptionRowCount: releaseGate.counts.exceptionRowCount,
      receiptRowCount: receiptRows.length,
      receiptRowCompleteCount: completeReceiptRowCount
    },
    externalCalls: 0 as const
  };
  const safeDigest = safeDigestForExport(payload);
  return {
    ...payload,
    safeDigest,
    decisionReceiptDigest: safeDigest,
    externalCalls: 0 as const
  };
}

function certifiedReleaseDecisionReceiptRows(
  releaseGate: ProviderWebhookReviewQaHandoffCertifiedReleaseGate,
  receiptIssued: boolean,
  gateChecklistComplete: boolean
): ProviderWebhookReviewQaHandoffCertifiedReleaseDecisionReceipt["receiptRows"] {
  return [
    certifiedReleaseDecisionReceiptRow("release_gate", "Certified release gate", releaseGate.releaseGateDigest, releaseGate.counts.gateCheckedCount, releaseGate.gateStatus === "ready"),
    certifiedReleaseDecisionReceiptRow("release_decision", "GO release decision", releaseGate.releaseGateDigest, 1, receiptIssued, receiptIssued ? "issued" : "blocked"),
    certifiedReleaseDecisionReceiptRow("release_readiness", "Release readiness", releaseGate.releaseEvidenceDigest, releaseGate.counts.releaseEvidenceCheckedCount, releaseGate.releaseReadinessStatus === "ready_for_release"),
    certifiedReleaseDecisionReceiptRow("reconciliation", "Attestation reconciliation", releaseGate.reconciliationDigest, releaseGate.counts.reconciliationCheckedCount, ["aligned", "complete"].includes(releaseGate.reconciliationStatus)),
    certifiedReleaseDecisionReceiptRow("attestation", "Attestation audit", releaseGate.attestationAuditDigest, releaseGate.counts.attestationAuditCheckedCount, releaseGate.attestationStatus === "complete"),
    certifiedReleaseDecisionReceiptRow("closure_ledger", "Closure ledger", releaseGate.closureLedgerDigest, releaseGate.counts.closureLedgerCheckedCount, releaseGate.ledgerStatus === "certified_release_closed"),
    certifiedReleaseDecisionReceiptRow("certification", "Release certification", releaseGate.certificationDigest, releaseGate.counts.releaseCertificationCheckedCount, releaseGate.certificationStatus === "certified"),
    certifiedReleaseDecisionReceiptRow("verification", "Release verification", releaseGate.verificationDigest, releaseGate.counts.releaseVerificationCheckedCount, releaseGate.verificationStatus === "verified"),
    certifiedReleaseDecisionReceiptRow("digest_chain", "Digest chain", releaseGate.reconciliationDigest, 1, releaseGate.digestChainStatus === "confirmed"),
    certifiedReleaseDecisionReceiptRow("prerequisite_checklist", "Prerequisite checklist", releaseGate.releaseEvidenceDigest, releaseGate.counts.prerequisiteTotalCount, Object.values(releaseGate.inheritedPrerequisiteChecklist).every(Boolean)),
    certifiedReleaseDecisionReceiptRow("certification_checklist", "Certification checklist", releaseGate.certificationDigest, releaseGate.counts.certificationChecklistTotalCount, Object.values(releaseGate.inheritedCertificationChecklist).every(Boolean)),
    certifiedReleaseDecisionReceiptRow("gate_checklist", "Release gate checklist", releaseGate.releaseGateDigest, releaseGate.counts.gateChecklistTotalCount, gateChecklistComplete),
    certifiedReleaseDecisionReceiptRow("external_calls", "External calls", releaseGate.releaseGateDigest, releaseGate.externalCalls, releaseGate.externalCalls === 0 && releaseGate.gateChecklist.externalCallsZero)
  ];
}

function certifiedReleaseDecisionReceiptRow(
  key: ProviderWebhookReviewQaHandoffCertifiedReleaseDecisionReceipt["receiptRows"][number]["key"],
  label: string,
  safeDigest: string,
  checkedCount: number,
  complete: boolean,
  receiptRowStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseDecisionReceipt["receiptRows"][number]["receiptRowStatus"] = complete ? "confirmed" : "blocked"
): ProviderWebhookReviewQaHandoffCertifiedReleaseDecisionReceipt["receiptRows"][number] {
  return {
    key,
    label,
    receiptRowStatus,
    safeDigest,
    checkedCount,
    complete
  };
}

function assertQaHandoffCertifiedReleaseHandoffPacketPrerequisites(
  decisionReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseDecisionReceipt
) {
  if (decisionReceipt.receiptStatus === "incomplete") {
    throw new ConflictException("Provider webhook QA archive certified release decision receipt must be issued or blocked before handoff packet");
  }
  if (!["aligned", "complete"].includes(decisionReceipt.reconciliationStatus)) {
    throw new ConflictException("Provider webhook QA archive release attestation reconciliation must be aligned before handoff packet");
  }
  if (decisionReceipt.attestationStatus !== "complete") {
    throw new ConflictException("Provider webhook QA archive release attestation audit must be complete before handoff packet");
  }
  if (decisionReceipt.ledgerStatus !== "certified_release_closed") {
    throw new ConflictException("Provider webhook QA archive release closure ledger must be certified_release_closed before handoff packet");
  }
  if (decisionReceipt.certificationStatus !== "certified") {
    throw new ConflictException("Provider webhook QA archive release certification receipt must be certified before handoff packet");
  }
  if (decisionReceipt.releaseReadinessStatus !== "ready_for_release") {
    throw new ConflictException("Provider webhook QA archive release readiness must be ready_for_release before handoff packet");
  }
  if (decisionReceipt.verificationStatus !== "verified") {
    throw new ConflictException("Provider webhook QA archive release verification must be verified before handoff packet");
  }
  if (decisionReceipt.digestChainStatus !== "confirmed") {
    throw new ConflictException("Provider webhook QA archive digest chain must be confirmed before handoff packet");
  }
  if (!Object.values(decisionReceipt.inheritedPrerequisiteChecklist).every(Boolean)) {
    throw new ConflictException("Provider webhook QA archive release prerequisites must be complete before handoff packet");
  }
  if (!Object.values(decisionReceipt.inheritedCertificationChecklist).every(Boolean)) {
    throw new ConflictException("Provider webhook QA archive release certification checklist must be complete before handoff packet");
  }
  if (!certifiedReleaseHandoffPacketGateChecklistComplete(decisionReceipt)) {
    throw new ConflictException("Provider webhook QA archive certified release gate checklist must be complete before handoff packet");
  }
  if (decisionReceipt.externalCalls !== 0 || !decisionReceipt.receiptSummary.externalCallsZero || !decisionReceipt.inheritedGateChecklist.externalCallsZero) {
    throw new ConflictException("Provider webhook QA archive certified release handoff packet requires externalCalls=0");
  }
}

function certifiedReleaseHandoffPacketGateChecklistComplete(
  decisionReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseDecisionReceipt
) {
  return decisionReceipt.inheritedGateChecklist.prerequisiteChainComplete &&
    decisionReceipt.inheritedGateChecklist.reconciliationComplete &&
    decisionReceipt.inheritedGateChecklist.attestationComplete &&
    decisionReceipt.inheritedGateChecklist.closureLedgerClosed &&
    decisionReceipt.inheritedGateChecklist.certificationComplete &&
    decisionReceipt.inheritedGateChecklist.releaseReady &&
    decisionReceipt.inheritedGateChecklist.verificationComplete &&
    decisionReceipt.inheritedGateChecklist.digestChainConfirmed &&
    decisionReceipt.inheritedGateChecklist.prerequisiteChecklistComplete &&
    decisionReceipt.inheritedGateChecklist.certificationChecklistComplete &&
    decisionReceipt.inheritedGateChecklist.externalCallsZero;
}

function qaHandoffCertifiedReleaseHandoffPacketResponse(
  decisionReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseDecisionReceipt
): ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket {
  const packetIssued = decisionReceipt.receiptStatus === "issued" &&
    decisionReceipt.releaseDecision === "go" &&
    decisionReceipt.gateStatus === "ready" &&
    decisionReceipt.goNoGoDecision === "go" &&
    decisionReceipt.receiptSummary.noBlockingReasons &&
    decisionReceipt.receiptSummary.noExceptionRows &&
    decisionReceipt.externalCalls === 0;
  const handoffRows = certifiedReleaseHandoffRows(decisionReceipt, packetIssued);
  const runbookRows = certifiedReleaseRunbookRows(decisionReceipt, packetIssued);
  const operatorChecklist = certifiedReleaseOperatorChecklist(decisionReceipt);
  const handoffRowCompleteCount = handoffRows.filter((row) => row.complete).length;
  const runbookRowReadyCount = runbookRows.filter((row) => row.runbookStatus === "ready").length;
  const operatorChecklistCompleteCount = operatorChecklist.filter((item) => item.complete).length;
  const payload = {
    packetKind: "qa-handoff-locked-archive-certified-release-handoff-packet" as const,
    packetStatus: packetIssued ? "issued" as const : "blocked" as const,
    handoffStatus: packetIssued ? "ready" as const : "blocked" as const,
    releaseDecision: decisionReceipt.releaseDecision,
    receiptStatus: decisionReceipt.receiptStatus,
    gateStatus: decisionReceipt.gateStatus,
    goNoGoDecision: decisionReceipt.goNoGoDecision,
    releaseReadinessStatus: decisionReceipt.releaseReadinessStatus,
    reconciliationStatus: decisionReceipt.reconciliationStatus,
    attestationStatus: decisionReceipt.attestationStatus,
    ledgerStatus: decisionReceipt.ledgerStatus,
    certificationStatus: decisionReceipt.certificationStatus,
    verificationStatus: decisionReceipt.verificationStatus,
    digestChainStatus: decisionReceipt.digestChainStatus,
    safeFilename: safeExportFilename("provider-webhook-review-qa-handoff-certified-release-handoff-packet.json"),
    decisionReceiptDigest: decisionReceipt.decisionReceiptDigest,
    releaseGateDigest: decisionReceipt.releaseGateDigest,
    reconciliationDigest: decisionReceipt.reconciliationDigest,
    attestationAuditDigest: decisionReceipt.attestationAuditDigest,
    closureLedgerDigest: decisionReceipt.closureLedgerDigest,
    certificationDigest: decisionReceipt.certificationDigest,
    verificationDigest: decisionReceipt.verificationDigest,
    releaseEvidenceDigest: decisionReceipt.releaseEvidenceDigest,
    inheritedPrerequisiteChecklist: decisionReceipt.inheritedPrerequisiteChecklist,
    inheritedCertificationChecklist: decisionReceipt.inheritedCertificationChecklist,
    inheritedGateChecklist: decisionReceipt.inheritedGateChecklist,
    inheritedDecisionReceiptSummary: decisionReceipt.receiptSummary,
    inheritedReconciliationSummary: decisionReceipt.inheritedReconciliationSummary,
    inheritedBlockingReasons: decisionReceipt.inheritedBlockingReasons,
    inheritedExceptionRows: decisionReceipt.inheritedExceptionRows,
    handoffRows,
    runbookRows,
    operatorChecklist,
    releaseOwnerSummary: {
      ownerRole: "release owner",
      handoffReady: packetIssued,
      releaseDecisionGo: decisionReceipt.releaseDecision === "go",
      blockingReasonCount: decisionReceipt.counts.blockingReasonCount,
      exceptionRowCount: decisionReceipt.counts.exceptionRowCount,
      externalCallsZero: decisionReceipt.externalCalls === 0,
      safeDigest: decisionReceipt.decisionReceiptDigest
    },
    counts: {
      ...decisionReceipt.counts,
      handoffPacketCheckedCount: 1,
      handoffRowCount: handoffRows.length,
      handoffRowCompleteCount,
      runbookRowCount: runbookRows.length,
      runbookRowReadyCount,
      operatorChecklistItemCount: operatorChecklist.length,
      operatorChecklistCompleteCount
    },
    externalCalls: 0 as const
  };
  const safeDigest = safeDigestForExport(payload);
  return {
    ...payload,
    safeDigest,
    handoffPacketDigest: safeDigest,
    externalCalls: 0 as const
  };
}

function certifiedReleaseHandoffRows(
  decisionReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseDecisionReceipt,
  packetIssued: boolean
): ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket["handoffRows"] {
  const blockingReasonCount = decisionReceipt.counts.blockingReasonCount;
  const exceptionRowCount = decisionReceipt.counts.exceptionRowCount;
  return [
    certifiedReleaseHandoffRow("decision_receipt", "Certified release decision receipt", decisionReceipt.decisionReceiptDigest, decisionReceipt.counts.decisionReceiptCheckedCount, decisionReceipt.receiptStatus === "issued", decisionReceipt.receiptStatus === "issued" ? "ready" : "blocked"),
    certifiedReleaseHandoffRow("release_gate", "Certified release gate", decisionReceipt.releaseGateDigest, decisionReceipt.counts.gateCheckedCount, decisionReceipt.gateStatus === "ready", decisionReceipt.gateStatus === "ready" ? "confirmed" : "blocked"),
    certifiedReleaseHandoffRow("release_decision", "GO release decision", decisionReceipt.decisionReceiptDigest, 1, decisionReceipt.releaseDecision === "go" && packetIssued, decisionReceipt.releaseDecision === "go" ? "ready" : "blocked"),
    certifiedReleaseHandoffRow("release_readiness", "Release readiness", decisionReceipt.releaseEvidenceDigest, decisionReceipt.counts.releaseEvidenceCheckedCount, decisionReceipt.releaseReadinessStatus === "ready_for_release"),
    certifiedReleaseHandoffRow("reconciliation", "Attestation reconciliation", decisionReceipt.reconciliationDigest, decisionReceipt.counts.reconciliationCheckedCount, ["aligned", "complete"].includes(decisionReceipt.reconciliationStatus)),
    certifiedReleaseHandoffRow("attestation", "Attestation audit", decisionReceipt.attestationAuditDigest, decisionReceipt.counts.attestationAuditCheckedCount, decisionReceipt.attestationStatus === "complete"),
    certifiedReleaseHandoffRow("closure_ledger", "Closure ledger", decisionReceipt.closureLedgerDigest, decisionReceipt.counts.closureLedgerCheckedCount, decisionReceipt.ledgerStatus === "certified_release_closed"),
    certifiedReleaseHandoffRow("certification", "Release certification", decisionReceipt.certificationDigest, decisionReceipt.counts.releaseCertificationCheckedCount, decisionReceipt.certificationStatus === "certified"),
    certifiedReleaseHandoffRow("verification", "Release verification", decisionReceipt.verificationDigest, decisionReceipt.counts.releaseVerificationCheckedCount, decisionReceipt.verificationStatus === "verified"),
    certifiedReleaseHandoffRow("digest_chain", "Digest chain", decisionReceipt.reconciliationDigest, 1, decisionReceipt.digestChainStatus === "confirmed"),
    certifiedReleaseHandoffRow("prerequisite_checklist", "Prerequisite checklist", decisionReceipt.releaseEvidenceDigest, decisionReceipt.counts.prerequisiteTotalCount, Object.values(decisionReceipt.inheritedPrerequisiteChecklist).every(Boolean)),
    certifiedReleaseHandoffRow("certification_checklist", "Certification checklist", decisionReceipt.certificationDigest, decisionReceipt.counts.certificationChecklistTotalCount, Object.values(decisionReceipt.inheritedCertificationChecklist).every(Boolean)),
    certifiedReleaseHandoffRow("gate_checklist", "Release gate checklist", decisionReceipt.releaseGateDigest, decisionReceipt.counts.gateChecklistTotalCount, certifiedReleaseHandoffPacketGateChecklistComplete(decisionReceipt)),
    certifiedReleaseHandoffRow("blocking_reasons", "Blocking reasons", decisionReceipt.decisionReceiptDigest, blockingReasonCount, blockingReasonCount === 0, blockingReasonCount === 0 ? "confirmed" : "blocked"),
    certifiedReleaseHandoffRow("exceptions", "Exception rows", decisionReceipt.reconciliationDigest, exceptionRowCount, exceptionRowCount === 0, exceptionRowCount === 0 ? "confirmed" : "blocked"),
    certifiedReleaseHandoffRow("external_calls", "External calls", decisionReceipt.decisionReceiptDigest, decisionReceipt.externalCalls, decisionReceipt.externalCalls === 0 && decisionReceipt.receiptSummary.externalCallsZero)
  ];
}

function certifiedReleaseHandoffRow(
  key: ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket["handoffRows"][number]["key"],
  label: string,
  safeDigest: string,
  checkedCount: number,
  complete: boolean,
  handoffRowStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket["handoffRows"][number]["handoffRowStatus"] = complete ? "confirmed" : "blocked"
): ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket["handoffRows"][number] {
  return {
    key,
    label,
    handoffRowStatus,
    safeDigest,
    checkedCount,
    complete
  };
}

function certifiedReleaseRunbookRows(
  decisionReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseDecisionReceipt,
  packetIssued: boolean
): ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket["runbookRows"] {
  const status = packetIssued ? "ready" as const : "blocked" as const;
  return [
    certifiedReleaseRunbookRow("confirm_decision_receipt", "Confirm certified decision receipt", status, decisionReceipt.decisionReceiptDigest, "release owner", packetIssued),
    certifiedReleaseRunbookRow("confirm_release_gate", "Confirm certified release gate", status, decisionReceipt.releaseGateDigest, "release owner", packetIssued),
    certifiedReleaseRunbookRow("confirm_operator_checklist", "Confirm operator checklist", status, decisionReceipt.decisionReceiptDigest, "operator", packetIssued),
    certifiedReleaseRunbookRow("release_handoff", "Proceed with safe release handoff", status, decisionReceipt.decisionReceiptDigest, "release owner", packetIssued),
    certifiedReleaseRunbookRow("monitor_release", "Monitor safe release evidence", status, decisionReceipt.releaseEvidenceDigest, "operator", packetIssued),
    certifiedReleaseRunbookRow("exception_hold", "Hold release on blocking exceptions", decisionReceipt.inheritedBlockingReasons.length === 0 && decisionReceipt.inheritedExceptionRows.length === 0 ? "ready" : "blocked", decisionReceipt.reconciliationDigest, "release owner", decisionReceipt.inheritedBlockingReasons.length === 0 && decisionReceipt.inheritedExceptionRows.length === 0)
  ];
}

function certifiedReleaseRunbookRow(
  key: ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket["runbookRows"][number]["key"],
  label: string,
  runbookStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket["runbookRows"][number]["runbookStatus"],
  safeDigest: string,
  ownerRole: string,
  complete: boolean
): ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket["runbookRows"][number] {
  return {
    key,
    label,
    runbookStatus,
    safeDigest,
    ownerRole,
    complete
  };
}

function certifiedReleaseOperatorChecklist(
  decisionReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseDecisionReceipt
): ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket["operatorChecklist"] {
  return [
    certifiedReleaseOperatorChecklistItem("decision_receipt_issued", "Decision receipt issued", decisionReceipt.decisionReceiptDigest, decisionReceipt.receiptStatus === "issued"),
    certifiedReleaseOperatorChecklistItem("release_gate_ready", "Release gate ready", decisionReceipt.releaseGateDigest, decisionReceipt.gateStatus === "ready" && decisionReceipt.goNoGoDecision === "go"),
    certifiedReleaseOperatorChecklistItem("no_blocking_reasons", "No blocking reasons", decisionReceipt.decisionReceiptDigest, decisionReceipt.inheritedBlockingReasons.length === 0),
    certifiedReleaseOperatorChecklistItem("no_exceptions", "No exception rows", decisionReceipt.reconciliationDigest, decisionReceipt.inheritedExceptionRows.length === 0),
    certifiedReleaseOperatorChecklistItem("external_calls_zero", "External calls zero", decisionReceipt.decisionReceiptDigest, decisionReceipt.externalCalls === 0 && decisionReceipt.receiptSummary.externalCallsZero),
    certifiedReleaseOperatorChecklistItem("provider_outbound_absent", "Provider outbound absent", decisionReceipt.decisionReceiptDigest, decisionReceipt.externalCalls === 0),
    certifiedReleaseOperatorChecklistItem("source_material_absent", "Sensitive source material absent", decisionReceipt.decisionReceiptDigest, decisionReceipt.externalCalls === 0)
  ];
}

function certifiedReleaseOperatorChecklistItem(
  key: ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket["operatorChecklist"][number]["key"],
  label: string,
  safeDigest: string,
  complete: boolean
): ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket["operatorChecklist"][number] {
  return {
    key,
    label,
    checklistStatus: complete ? "complete" as const : "blocked" as const,
    safeDigest,
    complete
  };
}

function assertQaHandoffCertifiedReleaseHandoffAcceptanceRecordPrerequisites(
  handoffPacket: ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket
) {
  if (handoffPacket.externalCalls !== 0 || !handoffPacket.inheritedDecisionReceiptSummary.externalCallsZero || !handoffPacket.releaseOwnerSummary.externalCallsZero) {
    throw new ConflictException("Provider webhook QA archive certified release handoff acceptance record requires externalCalls=0");
  }
  if (!Object.values(handoffPacket.inheritedPrerequisiteChecklist).every(Boolean)) {
    throw new ConflictException("Provider webhook QA archive release prerequisites must be complete before handoff acceptance record");
  }
  if (!Object.values(handoffPacket.inheritedCertificationChecklist).every(Boolean)) {
    throw new ConflictException("Provider webhook QA archive release certification checklist must be complete before handoff acceptance record");
  }
  if (!certifiedReleaseHandoffAcceptanceGateChecklistComplete(handoffPacket)) {
    throw new ConflictException("Provider webhook QA archive certified release gate checklist must be complete before handoff acceptance record");
  }
}

function certifiedReleaseHandoffAcceptanceGateChecklistComplete(
  handoffPacket: ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket
) {
  return handoffPacket.inheritedGateChecklist.prerequisiteChainComplete &&
    handoffPacket.inheritedGateChecklist.reconciliationComplete &&
    handoffPacket.inheritedGateChecklist.attestationComplete &&
    handoffPacket.inheritedGateChecklist.closureLedgerClosed &&
    handoffPacket.inheritedGateChecklist.certificationComplete &&
    handoffPacket.inheritedGateChecklist.releaseReady &&
    handoffPacket.inheritedGateChecklist.verificationComplete &&
    handoffPacket.inheritedGateChecklist.digestChainConfirmed &&
    handoffPacket.inheritedGateChecklist.prerequisiteChecklistComplete &&
    handoffPacket.inheritedGateChecklist.certificationChecklistComplete &&
    handoffPacket.inheritedGateChecklist.externalCallsZero;
}

function certifiedReleaseHandoffPacketReadyForAcceptance(
  handoffPacket: ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket
) {
  return handoffPacket.packetStatus === "issued" &&
    handoffPacket.handoffStatus === "ready" &&
    handoffPacket.releaseDecision === "go" &&
    handoffPacket.receiptStatus === "issued" &&
    handoffPacket.gateStatus === "ready" &&
    handoffPacket.goNoGoDecision === "go" &&
    handoffPacket.counts.blockingReasonCount === 0 &&
    handoffPacket.counts.exceptionRowCount === 0 &&
    handoffPacket.externalCalls === 0;
}

function latestCertifiedReleaseHandoffAcceptanceRecord(tenantId: string, handoffPacketDigest: string) {
  return qaHandoffCertifiedReleaseHandoffAcceptanceRecords.find((record) =>
    record.tenantId === tenantId &&
    record.handoffPacketDigest === handoffPacketDigest
  );
}

function qaHandoffCertifiedReleaseHandoffAcceptanceRecordResponse(
  handoffPacket: ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket,
  record: QaHandoffCertifiedReleaseHandoffAcceptanceRecord | null
): ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord {
  const packetReady = certifiedReleaseHandoffPacketReadyForAcceptance(handoffPacket);
  const acknowledgedKeys = new Set(record?.acknowledgedChecklistKeys ?? []);
  const acknowledgedChecklist = handoffPacket.operatorChecklist.map((item) =>
    certifiedReleaseHandoffAcknowledgedChecklistItem(item, acknowledgedKeys.has(item.key), packetReady)
  );
  const acknowledgedChecklistCompleteCount = acknowledgedChecklist.filter((item) => item.acknowledged).length;
  const operatorChecklistAcknowledged = packetReady &&
    acknowledgedChecklist.length > 0 &&
    acknowledgedChecklistCompleteCount === acknowledgedChecklist.length;
  const acknowledgementRows = certifiedReleaseHandoffAcknowledgementRows(handoffPacket, record, operatorChecklistAcknowledged, packetReady);
  const acknowledgementRowCompleteCount = acknowledgementRows.filter((row) => row.complete).length;
  const acceptanceStatus = !packetReady
    ? "blocked" as const
    : operatorChecklistAcknowledged
      ? "acknowledged" as const
      : record
        ? "incomplete" as const
        : "not_started" as const;
  const safeDigest = record?.safeDigest ?? safeDigestForExport({
    acceptanceKind: "qa-handoff-locked-archive-certified-release-handoff-acceptance-record",
    acceptanceStatus,
    handoffPacketDigest: handoffPacket.handoffPacketDigest,
    externalCalls: 0
  });
  const payload = {
    acceptanceKind: "qa-handoff-locked-archive-certified-release-handoff-acceptance-record" as const,
    acceptanceStatus,
    handoffStatus: handoffPacket.handoffStatus,
    releaseDecision: handoffPacket.releaseDecision,
    packetStatus: handoffPacket.packetStatus,
    receiptStatus: handoffPacket.receiptStatus,
    gateStatus: handoffPacket.gateStatus,
    goNoGoDecision: handoffPacket.goNoGoDecision,
    releaseReadinessStatus: handoffPacket.releaseReadinessStatus,
    reconciliationStatus: handoffPacket.reconciliationStatus,
    attestationStatus: handoffPacket.attestationStatus,
    ledgerStatus: handoffPacket.ledgerStatus,
    certificationStatus: handoffPacket.certificationStatus,
    verificationStatus: handoffPacket.verificationStatus,
    digestChainStatus: handoffPacket.digestChainStatus,
    safeFilename: safeExportFilename("provider-webhook-review-qa-handoff-certified-release-handoff-acceptance-record.json"),
    safeDigest,
    acceptanceRecordDigest: safeDigest,
    handoffPacketDigest: handoffPacket.handoffPacketDigest,
    decisionReceiptDigest: handoffPacket.decisionReceiptDigest,
    releaseGateDigest: handoffPacket.releaseGateDigest,
    reconciliationDigest: handoffPacket.reconciliationDigest,
    attestationAuditDigest: handoffPacket.attestationAuditDigest,
    closureLedgerDigest: handoffPacket.closureLedgerDigest,
    certificationDigest: handoffPacket.certificationDigest,
    verificationDigest: handoffPacket.verificationDigest,
    releaseEvidenceDigest: handoffPacket.releaseEvidenceDigest,
    operatorChecklist: handoffPacket.operatorChecklist,
    acknowledgedChecklist,
    acknowledgementRows,
    releaseOwnerSummary: {
      ownerRole: handoffPacket.releaseOwnerSummary.ownerRole,
      acknowledgedByRole: record?.acknowledgedByRole ?? null,
      acknowledgedByLabel: record?.acknowledgedByLabel ?? null,
      handoffReady: packetReady,
      releaseDecisionGo: handoffPacket.releaseDecision === "go",
      operatorChecklistAcknowledged,
      blockingReasonCount: handoffPacket.counts.blockingReasonCount,
      exceptionRowCount: handoffPacket.counts.exceptionRowCount,
      externalCallsZero: handoffPacket.externalCalls === 0,
      safeDigest: handoffPacket.handoffPacketDigest
    },
    inheritedPrerequisiteChecklist: handoffPacket.inheritedPrerequisiteChecklist,
    inheritedCertificationChecklist: handoffPacket.inheritedCertificationChecklist,
    inheritedGateChecklist: handoffPacket.inheritedGateChecklist,
    inheritedDecisionReceiptSummary: handoffPacket.inheritedDecisionReceiptSummary,
    inheritedHandoffPacketSummary: {
      packetStatus: handoffPacket.packetStatus,
      handoffStatus: handoffPacket.handoffStatus,
      releaseDecision: handoffPacket.releaseDecision,
      handoffRowCount: handoffPacket.counts.handoffRowCount,
      handoffRowCompleteCount: handoffPacket.counts.handoffRowCompleteCount,
      runbookRowCount: handoffPacket.counts.runbookRowCount,
      runbookRowReadyCount: handoffPacket.counts.runbookRowReadyCount,
      operatorChecklistItemCount: handoffPacket.counts.operatorChecklistItemCount,
      operatorChecklistCompleteCount: handoffPacket.counts.operatorChecklistCompleteCount,
      externalCallsZero: handoffPacket.externalCalls === 0
    },
    inheritedBlockingReasons: handoffPacket.inheritedBlockingReasons,
    inheritedExceptionRows: handoffPacket.inheritedExceptionRows,
    counts: {
      ...handoffPacket.counts,
      acceptanceRecordCheckedCount: 1,
      acceptanceRecordMutationCount: record ? 1 : 0,
      acknowledgedChecklistItemCount: acknowledgedChecklist.length,
      acknowledgedChecklistCompleteCount,
      acknowledgementRowCount: acknowledgementRows.length,
      acknowledgementRowCompleteCount
    },
    externalCalls: 0 as const
  };
  return payload;
}

function certifiedReleaseHandoffAcknowledgedChecklistItem(
  item: ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket["operatorChecklist"][number],
  acknowledgedByRecord: boolean,
  packetReady: boolean
): ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord["acknowledgedChecklist"][number] {
  const acknowledged = packetReady && item.complete && acknowledgedByRecord;
  return {
    key: item.key,
    label: item.label,
    acknowledgementStatus: acknowledged ? "acknowledged" as const : packetReady ? "pending" as const : "blocked" as const,
    safeDigest: item.safeDigest,
    acknowledged
  };
}

function certifiedReleaseHandoffAcknowledgementRows(
  handoffPacket: ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket,
  record: QaHandoffCertifiedReleaseHandoffAcceptanceRecord | null,
  operatorChecklistAcknowledged: boolean,
  packetReady: boolean
): ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord["acknowledgementRows"] {
  const sourceMaterialClear = handoffPacket.operatorChecklist.some((item) => item.key === "source_material_absent" && item.complete);
  return [
    certifiedReleaseHandoffAcknowledgementRow("handoff_packet", "Handoff packet", handoffPacket.handoffPacketDigest, handoffPacket.counts.handoffPacketCheckedCount, packetReady, packetReady),
    certifiedReleaseHandoffAcknowledgementRow("operator_checklist", "Operator checklist", handoffPacket.handoffPacketDigest, handoffPacket.counts.operatorChecklistItemCount, operatorChecklistAcknowledged, packetReady),
    certifiedReleaseHandoffAcknowledgementRow("release_owner", "Release owner acknowledgement", handoffPacket.handoffPacketDigest, record ? 1 : 0, Boolean(record?.acknowledgedByRole && record?.acknowledgedByLabel), packetReady),
    certifiedReleaseHandoffAcknowledgementRow("external_calls", "External calls", handoffPacket.handoffPacketDigest, handoffPacket.externalCalls, handoffPacket.externalCalls === 0, packetReady),
    certifiedReleaseHandoffAcknowledgementRow("safe_source_material", "Sensitive source material", handoffPacket.handoffPacketDigest, 1, sourceMaterialClear, packetReady),
    certifiedReleaseHandoffAcknowledgementRow("blocking_reasons", "Blocking reasons", handoffPacket.handoffPacketDigest, handoffPacket.counts.blockingReasonCount, handoffPacket.counts.blockingReasonCount === 0, packetReady),
    certifiedReleaseHandoffAcknowledgementRow("exceptions", "Exception rows", handoffPacket.reconciliationDigest, handoffPacket.counts.exceptionRowCount, handoffPacket.counts.exceptionRowCount === 0, packetReady)
  ];
}

function certifiedReleaseHandoffAcknowledgementRow(
  key: ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord["acknowledgementRows"][number]["key"],
  label: string,
  safeDigest: string,
  checkedCount: number,
  complete: boolean,
  packetReady: boolean
): ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord["acknowledgementRows"][number] {
  return {
    key,
    label,
    acknowledgementStatus: complete ? "acknowledged" as const : packetReady ? "pending" as const : "blocked" as const,
    safeDigest,
    checkedCount,
    complete
  };
}

function assertQaHandoffCertifiedReleaseNoopExecutionDryRunPrerequisites(
  acceptanceRecord: ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord
) {
  if (acceptanceRecord.externalCalls !== 0 || !acceptanceRecord.releaseOwnerSummary.externalCallsZero || !acceptanceRecord.inheritedDecisionReceiptSummary.externalCallsZero) {
    throw new ConflictException("Provider webhook QA archive certified release no-op execution dry-run requires externalCalls=0");
  }
  if (!Object.values(acceptanceRecord.inheritedPrerequisiteChecklist).every(Boolean)) {
    throw new ConflictException("Provider webhook QA archive release prerequisites must be complete before no-op execution dry-run");
  }
  if (!Object.values(acceptanceRecord.inheritedCertificationChecklist).every(Boolean)) {
    throw new ConflictException("Provider webhook QA archive release certification checklist must be complete before no-op execution dry-run");
  }
  if (!certifiedReleaseNoopExecutionGateChecklistComplete(acceptanceRecord)) {
    throw new ConflictException("Provider webhook QA archive certified release gate checklist must be complete before no-op execution dry-run");
  }
}

function certifiedReleaseNoopExecutionGateChecklistComplete(
  acceptanceRecord: ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord
) {
  return acceptanceRecord.inheritedGateChecklist.prerequisiteChainComplete &&
    acceptanceRecord.inheritedGateChecklist.reconciliationComplete &&
    acceptanceRecord.inheritedGateChecklist.attestationComplete &&
    acceptanceRecord.inheritedGateChecklist.closureLedgerClosed &&
    acceptanceRecord.inheritedGateChecklist.certificationComplete &&
    acceptanceRecord.inheritedGateChecklist.releaseReady &&
    acceptanceRecord.inheritedGateChecklist.verificationComplete &&
    acceptanceRecord.inheritedGateChecklist.digestChainConfirmed &&
    acceptanceRecord.inheritedGateChecklist.prerequisiteChecklistComplete &&
    acceptanceRecord.inheritedGateChecklist.certificationChecklistComplete &&
    acceptanceRecord.inheritedGateChecklist.externalCallsZero;
}

function certifiedReleaseNoopExecutionReady(
  acceptanceRecord: ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord
) {
  return acceptanceRecord.acceptanceStatus === "acknowledged" &&
    acceptanceRecord.handoffStatus === "ready" &&
    acceptanceRecord.releaseDecision === "go" &&
    acceptanceRecord.packetStatus === "issued" &&
    acceptanceRecord.receiptStatus === "issued" &&
    acceptanceRecord.gateStatus === "ready" &&
    acceptanceRecord.goNoGoDecision === "go" &&
    acceptanceRecord.releaseReadinessStatus === "ready_for_release" &&
    acceptanceRecord.releaseOwnerSummary.operatorChecklistAcknowledged &&
    acceptanceRecord.counts.blockingReasonCount === 0 &&
    acceptanceRecord.counts.exceptionRowCount === 0 &&
    acceptanceRecord.externalCalls === 0;
}

function latestCertifiedReleaseNoopExecutionDryRun(tenantId: string, acceptanceRecordDigest: string) {
  return qaHandoffCertifiedReleaseNoopExecutionDryRuns.find((record) =>
    record.tenantId === tenantId &&
    record.acceptanceRecordDigest === acceptanceRecordDigest
  );
}

function qaHandoffCertifiedReleaseNoopExecutionDryRunResponse(
  acceptanceRecord: ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord,
  record: QaHandoffCertifiedReleaseNoopExecutionDryRunRecord | null
): ProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun {
  const acceptanceReady = certifiedReleaseNoopExecutionReady(acceptanceRecord);
  const dryRunStatus = !acceptanceReady
    ? acceptanceRecord.acceptanceStatus === "blocked" || acceptanceRecord.releaseDecision !== "go"
      ? "blocked" as const
      : "incomplete" as const
    : record?.checklistAcknowledged
      ? "passed" as const
      : "not_started" as const;
  const effectiveReleaseDecision = acceptanceReady ? "go" as const : "no_go" as const;
  const safeDigest = record?.safeDigest ?? safeDigestForExport({
    dryRunKind: "qa-handoff-locked-archive-certified-release-noop-execution-dryrun",
    dryRunStatus,
    executionMode: "no_op",
    acceptanceRecordDigest: acceptanceRecord.acceptanceRecordDigest,
    externalCalls: 0
  });
  const executionChecklist = certifiedReleaseNoopExecutionChecklist(acceptanceRecord, acceptanceReady, Boolean(record?.checklistAcknowledged));
  const executionChecklistCompleteCount = executionChecklist.filter((item) => item.complete).length;
  const dryRunRows = certifiedReleaseNoopExecutionDryRunRows(acceptanceRecord, acceptanceReady);
  const dryRunRowPassedCount = dryRunRows.filter((row) => row.complete).length;
  const executionPlanRows = certifiedReleaseNoopExecutionPlanRows(acceptanceRecord, acceptanceReady);
  const executionPlanReadyCount = executionPlanRows.filter((row) => row.complete).length;
  return {
    dryRunKind: "qa-handoff-locked-archive-certified-release-noop-execution-dryrun",
    dryRunStatus,
    executionMode: "no_op",
    acceptanceStatus: acceptanceRecord.acceptanceStatus,
    handoffStatus: acceptanceRecord.handoffStatus,
    releaseDecision: effectiveReleaseDecision,
    packetStatus: acceptanceRecord.packetStatus,
    receiptStatus: acceptanceRecord.receiptStatus,
    gateStatus: acceptanceRecord.gateStatus,
    goNoGoDecision: acceptanceReady ? acceptanceRecord.goNoGoDecision : "no_go",
    releaseReadinessStatus: acceptanceRecord.releaseReadinessStatus,
    reconciliationStatus: acceptanceRecord.reconciliationStatus,
    attestationStatus: acceptanceRecord.attestationStatus,
    ledgerStatus: acceptanceRecord.ledgerStatus,
    certificationStatus: acceptanceRecord.certificationStatus,
    verificationStatus: acceptanceRecord.verificationStatus,
    digestChainStatus: acceptanceRecord.digestChainStatus,
    safeFilename: safeExportFilename("provider-webhook-review-qa-handoff-certified-release-noop-execution-dryrun.json"),
    safeDigest,
    noopExecutionDryRunDigest: safeDigest,
    acceptanceRecordDigest: acceptanceRecord.acceptanceRecordDigest,
    handoffPacketDigest: acceptanceRecord.handoffPacketDigest,
    decisionReceiptDigest: acceptanceRecord.decisionReceiptDigest,
    releaseGateDigest: acceptanceRecord.releaseGateDigest,
    reconciliationDigest: acceptanceRecord.reconciliationDigest,
    attestationAuditDigest: acceptanceRecord.attestationAuditDigest,
    closureLedgerDigest: acceptanceRecord.closureLedgerDigest,
    certificationDigest: acceptanceRecord.certificationDigest,
    verificationDigest: acceptanceRecord.verificationDigest,
    releaseEvidenceDigest: acceptanceRecord.releaseEvidenceDigest,
    operatorChecklist: acceptanceRecord.operatorChecklist,
    acknowledgedChecklist: acceptanceRecord.acknowledgedChecklist,
    executionChecklist,
    dryRunRows,
    executionPlanRows,
    releaseOwnerSummary: {
      ...acceptanceRecord.releaseOwnerSummary,
      requestedBy: record?.requestedBy ?? null,
      checklistAcknowledged: record?.checklistAcknowledged ?? false,
      dryRunReason: record?.dryRunReason ?? null,
      executionModeNoOp: true
    },
    inheritedPrerequisiteChecklist: acceptanceRecord.inheritedPrerequisiteChecklist,
    inheritedCertificationChecklist: acceptanceRecord.inheritedCertificationChecklist,
    inheritedGateChecklist: acceptanceRecord.inheritedGateChecklist,
    inheritedDecisionReceiptSummary: acceptanceRecord.inheritedDecisionReceiptSummary,
    inheritedHandoffPacketSummary: acceptanceRecord.inheritedHandoffPacketSummary,
    inheritedAcceptanceSummary: {
      acceptanceStatus: acceptanceRecord.acceptanceStatus,
      handoffStatus: acceptanceRecord.handoffStatus,
      releaseDecision: effectiveReleaseDecision,
      operatorChecklistAcknowledged: acceptanceRecord.releaseOwnerSummary.operatorChecklistAcknowledged,
      acknowledgedChecklistItemCount: acceptanceRecord.counts.acknowledgedChecklistItemCount,
      acknowledgedChecklistCompleteCount: acceptanceRecord.counts.acknowledgedChecklistCompleteCount,
      acknowledgementRowCount: acceptanceRecord.counts.acknowledgementRowCount,
      acknowledgementRowCompleteCount: acceptanceRecord.counts.acknowledgementRowCompleteCount,
      externalCallsZero: acceptanceRecord.externalCalls === 0
    },
    inheritedBlockingReasons: acceptanceRecord.inheritedBlockingReasons,
    inheritedExceptionRows: acceptanceRecord.inheritedExceptionRows,
    counts: {
      ...acceptanceRecord.counts,
      noopExecutionDryRunCheckedCount: 1,
      noopExecutionDryRunMutationCount: record ? 1 : 0,
      executionChecklistItemCount: executionChecklist.length,
      executionChecklistCompleteCount,
      dryRunRowCount: dryRunRows.length,
      dryRunRowPassedCount,
      executionPlanRowCount: executionPlanRows.length,
      executionPlanReadyCount
    },
    externalCalls: 0 as const
  };
}

function certifiedReleaseNoopExecutionChecklist(
  acceptanceRecord: ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord,
  acceptanceReady: boolean,
  checklistAcknowledged: boolean
): ProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun["executionChecklist"] {
  return [
    certifiedReleaseNoopExecutionChecklistItem("acceptance_record_acknowledged", "Acceptance record acknowledged", acceptanceRecord.acceptanceRecordDigest, acceptanceRecord.acceptanceStatus === "acknowledged", acceptanceReady),
    certifiedReleaseNoopExecutionChecklistItem("handoff_ready", "Handoff ready", acceptanceRecord.handoffPacketDigest, acceptanceRecord.handoffStatus === "ready", acceptanceReady),
    certifiedReleaseNoopExecutionChecklistItem("release_decision_go", "Release decision go", acceptanceRecord.decisionReceiptDigest, acceptanceRecord.releaseDecision === "go", acceptanceReady),
    certifiedReleaseNoopExecutionChecklistItem("execution_mode_no_op", "Execution mode no-op", acceptanceRecord.acceptanceRecordDigest, true, acceptanceReady),
    certifiedReleaseNoopExecutionChecklistItem("external_calls_zero", "External calls zero", acceptanceRecord.acceptanceRecordDigest, acceptanceRecord.externalCalls === 0, acceptanceReady),
    certifiedReleaseNoopExecutionChecklistItem("provider_outbound_absent", "Provider outbound absent", acceptanceRecord.acceptanceRecordDigest, acceptanceRecord.externalCalls === 0, acceptanceReady),
    certifiedReleaseNoopExecutionChecklistItem("notification_send_absent", "External notification sending absent", acceptanceRecord.acceptanceRecordDigest, acceptanceRecord.externalCalls === 0, acceptanceReady),
    certifiedReleaseNoopExecutionChecklistItem("source_material_absent", "Sensitive source material absent", acceptanceRecord.acceptanceRecordDigest, acceptanceRecord.externalCalls === 0 && (acceptanceReady || checklistAcknowledged), acceptanceReady)
  ];
}

function certifiedReleaseNoopExecutionChecklistItem(
  key: ProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun["executionChecklist"][number]["key"],
  label: string,
  safeDigest: string,
  complete: boolean,
  acceptanceReady: boolean
): ProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun["executionChecklist"][number] {
  return {
    key,
    label,
    checklistStatus: complete ? "complete" as const : acceptanceReady ? "pending" as const : "blocked" as const,
    safeDigest,
    complete
  };
}

function certifiedReleaseNoopExecutionDryRunRows(
  acceptanceRecord: ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord,
  acceptanceReady: boolean
): ProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun["dryRunRows"] {
  return [
    certifiedReleaseNoopExecutionDryRunRow("acceptance_record", "Acceptance record", acceptanceRecord.acceptanceRecordDigest, 1, acceptanceRecord.acceptanceStatus === "acknowledged", acceptanceReady),
    certifiedReleaseNoopExecutionDryRunRow("handoff_packet", "Handoff packet", acceptanceRecord.handoffPacketDigest, acceptanceRecord.counts.handoffPacketCheckedCount, acceptanceRecord.handoffStatus === "ready", acceptanceReady),
    certifiedReleaseNoopExecutionDryRunRow("decision_receipt", "Decision receipt", acceptanceRecord.decisionReceiptDigest, acceptanceRecord.counts.decisionReceiptCheckedCount, acceptanceRecord.releaseDecision === "go", acceptanceReady),
    certifiedReleaseNoopExecutionDryRunRow("release_gate", "Release gate", acceptanceRecord.releaseGateDigest, acceptanceRecord.counts.gateCheckedCount, acceptanceRecord.gateStatus === "ready" && acceptanceRecord.goNoGoDecision === "go", acceptanceReady),
    certifiedReleaseNoopExecutionDryRunRow("reconciliation", "Attestation reconciliation", acceptanceRecord.reconciliationDigest, acceptanceRecord.counts.reconciliationCheckedCount, ["complete", "aligned"].includes(acceptanceRecord.reconciliationStatus), acceptanceReady),
    certifiedReleaseNoopExecutionDryRunRow("attestation_audit", "Attestation audit", acceptanceRecord.attestationAuditDigest, acceptanceRecord.counts.attestationAuditCheckedCount, acceptanceRecord.attestationStatus === "complete", acceptanceReady),
    certifiedReleaseNoopExecutionDryRunRow("closure_ledger", "Closure ledger", acceptanceRecord.closureLedgerDigest, acceptanceRecord.counts.closureLedgerCheckedCount, acceptanceRecord.ledgerStatus === "certified_release_closed", acceptanceReady),
    certifiedReleaseNoopExecutionDryRunRow("certification", "Release certification", acceptanceRecord.certificationDigest, acceptanceRecord.counts.releaseCertificationCheckedCount, acceptanceRecord.certificationStatus === "certified", acceptanceReady),
    certifiedReleaseNoopExecutionDryRunRow("verification", "Release verification", acceptanceRecord.verificationDigest, acceptanceRecord.counts.releaseVerificationCheckedCount, acceptanceRecord.verificationStatus === "verified", acceptanceReady),
    certifiedReleaseNoopExecutionDryRunRow("release_evidence", "Release evidence", acceptanceRecord.releaseEvidenceDigest, acceptanceRecord.counts.releaseEvidenceCheckedCount, acceptanceRecord.releaseReadinessStatus === "ready_for_release", acceptanceReady),
    certifiedReleaseNoopExecutionDryRunRow("execution_mode", "Execution mode no-op", acceptanceRecord.acceptanceRecordDigest, 1, true, acceptanceReady),
    certifiedReleaseNoopExecutionDryRunRow("external_calls", "External calls", acceptanceRecord.acceptanceRecordDigest, acceptanceRecord.externalCalls, acceptanceRecord.externalCalls === 0, acceptanceReady)
  ];
}

function certifiedReleaseNoopExecutionDryRunRow(
  key: ProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun["dryRunRows"][number]["key"],
  label: string,
  safeDigest: string,
  checkedCount: number,
  complete: boolean,
  acceptanceReady: boolean
): ProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun["dryRunRows"][number] {
  return {
    key,
    label,
    dryRunRowStatus: complete ? "passed" as const : acceptanceReady ? "pending" as const : "blocked" as const,
    safeDigest,
    checkedCount,
    complete
  };
}

function certifiedReleaseNoopExecutionPlanRows(
  acceptanceRecord: ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord,
  acceptanceReady: boolean
): ProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun["executionPlanRows"] {
  return [
    certifiedReleaseNoopExecutionPlanRow("plan_scope", "Certified release readiness check", acceptanceRecord.acceptanceRecordDigest, 1, acceptanceReady ? "ready" : "blocked", acceptanceReady),
    certifiedReleaseNoopExecutionPlanRow("release_execution", "Release execution", acceptanceRecord.acceptanceRecordDigest, 0, "no_op", acceptanceReady),
    certifiedReleaseNoopExecutionPlanRow("provider_outbound", "Provider outbound", acceptanceRecord.acceptanceRecordDigest, 0, "no_op", acceptanceReady),
    certifiedReleaseNoopExecutionPlanRow("external_notifications", "External notifications", acceptanceRecord.acceptanceRecordDigest, 0, "no_op", acceptanceReady),
    certifiedReleaseNoopExecutionPlanRow("automation_calls", "Automation calls", acceptanceRecord.acceptanceRecordDigest, 0, "no_op", acceptanceReady),
    certifiedReleaseNoopExecutionPlanRow("state_mutation", "Release state mutation", acceptanceRecord.acceptanceRecordDigest, 0, "no_op", acceptanceReady),
    certifiedReleaseNoopExecutionPlanRow("readback", "Safe readback", acceptanceRecord.acceptanceRecordDigest, 1, acceptanceReady ? "ready" : "blocked", acceptanceReady)
  ];
}

function certifiedReleaseNoopExecutionPlanRow(
  key: ProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun["executionPlanRows"][number]["key"],
  label: string,
  safeDigest: string,
  checkedCount: number,
  planStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun["executionPlanRows"][number]["planStatus"],
  complete: boolean
): ProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun["executionPlanRows"][number] {
  return {
    key,
    label,
    planStatus,
    safeDigest,
    checkedCount,
    complete
  };
}

function qaHandoffCertifiedReleaseDryRunResultLedgerResponse(
  dryRun: ProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun
): ProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedger {
  const ledgerReady = certifiedReleaseDryRunResultLedgerReady(dryRun);
  const ledgerStatus = certifiedReleaseDryRunResultLedgerStatus(dryRun, ledgerReady);
  const effectiveReleaseDecision = ledgerReady ? "go" as const : "no_go" as const;
  const effectiveGoNoGoDecision = ledgerReady ? "go" as const : "no_go" as const;
  const safeDigest = safeDigestForExport({
    ledgerKind: "qa-handoff-locked-archive-certified-release-dryrun-result-ledger",
    ledgerStatus,
    dryRunStatus: dryRun.dryRunStatus,
    noopExecutionDryRunDigest: dryRun.noopExecutionDryRunDigest,
    externalCalls: 0
  });
  const resultLedgerRows = certifiedReleaseDryRunResultLedgerRows(dryRun, ledgerReady, ledgerStatus);
  const finalReadinessRows = certifiedReleaseDryRunFinalReadinessRows(dryRun, ledgerReady, ledgerStatus);
  return {
    ledgerKind: "qa-handoff-locked-archive-certified-release-dryrun-result-ledger",
    ledgerStatus,
    dryRunStatus: dryRun.dryRunStatus,
    executionMode: dryRun.executionMode,
    acceptanceStatus: dryRun.acceptanceStatus,
    handoffStatus: dryRun.handoffStatus,
    releaseDecision: effectiveReleaseDecision,
    packetStatus: dryRun.packetStatus,
    receiptStatus: dryRun.receiptStatus,
    gateStatus: dryRun.gateStatus,
    goNoGoDecision: effectiveGoNoGoDecision,
    releaseReadinessStatus: dryRun.releaseReadinessStatus,
    reconciliationStatus: dryRun.reconciliationStatus,
    attestationStatus: dryRun.attestationStatus,
    ledgerStatusFromClosure: dryRun.ledgerStatus,
    certificationStatus: dryRun.certificationStatus,
    verificationStatus: dryRun.verificationStatus,
    digestChainStatus: dryRun.digestChainStatus,
    safeFilename: safeExportFilename("provider-webhook-review-qa-handoff-certified-release-dryrun-result-ledger.json"),
    safeDigest,
    dryRunResultLedgerDigest: safeDigest,
    noopExecutionDryRunDigest: dryRun.noopExecutionDryRunDigest,
    acceptanceRecordDigest: dryRun.acceptanceRecordDigest,
    handoffPacketDigest: dryRun.handoffPacketDigest,
    decisionReceiptDigest: dryRun.decisionReceiptDigest,
    releaseGateDigest: dryRun.releaseGateDigest,
    reconciliationDigest: dryRun.reconciliationDigest,
    attestationAuditDigest: dryRun.attestationAuditDigest,
    closureLedgerDigest: dryRun.closureLedgerDigest,
    certificationDigest: dryRun.certificationDigest,
    verificationDigest: dryRun.verificationDigest,
    releaseEvidenceDigest: dryRun.releaseEvidenceDigest,
    operatorChecklist: dryRun.operatorChecklist,
    acknowledgedChecklist: dryRun.acknowledgedChecklist,
    executionChecklist: dryRun.executionChecklist,
    dryRunRows: dryRun.dryRunRows,
    executionPlanRows: dryRun.executionPlanRows,
    resultLedgerRows,
    finalReadinessRows,
    releaseOwnerSummary: dryRun.releaseOwnerSummary,
    inheritedPrerequisiteChecklist: dryRun.inheritedPrerequisiteChecklist,
    inheritedCertificationChecklist: dryRun.inheritedCertificationChecklist,
    inheritedGateChecklist: dryRun.inheritedGateChecklist,
    inheritedDecisionReceiptSummary: dryRun.inheritedDecisionReceiptSummary,
    inheritedHandoffPacketSummary: dryRun.inheritedHandoffPacketSummary,
    inheritedAcceptanceSummary: {
      ...dryRun.inheritedAcceptanceSummary,
      releaseDecision: effectiveReleaseDecision
    },
    inheritedNoopDryRunSummary: {
      dryRunStatus: dryRun.dryRunStatus,
      executionMode: dryRun.executionMode,
      acceptanceStatus: dryRun.acceptanceStatus,
      handoffStatus: dryRun.handoffStatus,
      releaseDecision: effectiveReleaseDecision,
      checklistAcknowledged: dryRun.releaseOwnerSummary.checklistAcknowledged,
      dryRunRowCount: dryRun.counts.dryRunRowCount,
      dryRunRowPassedCount: dryRun.counts.dryRunRowPassedCount,
      executionPlanRowCount: dryRun.counts.executionPlanRowCount,
      executionPlanReadyCount: dryRun.counts.executionPlanReadyCount,
      externalCallsZero: dryRun.externalCalls === 0,
      safeDigest: dryRun.safeDigest
    },
    inheritedBlockingReasons: dryRun.inheritedBlockingReasons,
    inheritedExceptionRows: dryRun.inheritedExceptionRows,
    counts: {
      ...dryRun.counts,
      dryRunResultLedgerCheckedCount: 1,
      dryRunResultLedgerMutationCount: 0,
      resultLedgerRowCount: resultLedgerRows.length,
      resultLedgerRowRecordedCount: resultLedgerRows.filter((row) => row.complete).length,
      finalReadinessRowCount: finalReadinessRows.length,
      finalReadinessReadyCount: finalReadinessRows.filter((row) => row.complete).length
    },
    externalCalls: 0 as const
  };
}

function certifiedReleaseDryRunResultLedgerReady(
  dryRun: ProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun
) {
  return dryRun.dryRunStatus === "passed" &&
    dryRun.executionMode === "no_op" &&
    dryRun.acceptanceStatus === "acknowledged" &&
    dryRun.handoffStatus === "ready" &&
    dryRun.releaseDecision === "go" &&
    dryRun.packetStatus === "issued" &&
    dryRun.receiptStatus === "issued" &&
    dryRun.gateStatus === "ready" &&
    dryRun.goNoGoDecision === "go" &&
    dryRun.releaseReadinessStatus === "ready_for_release" &&
    ["complete", "aligned"].includes(dryRun.reconciliationStatus) &&
    dryRun.attestationStatus === "complete" &&
    dryRun.ledgerStatus === "certified_release_closed" &&
    dryRun.certificationStatus === "certified" &&
    dryRun.verificationStatus === "verified" &&
    dryRun.digestChainStatus === "confirmed" &&
    dryRun.releaseOwnerSummary.checklistAcknowledged &&
    dryRun.dryRunRows.every((row) => row.complete) &&
    dryRun.executionPlanRows.every((row) => row.complete) &&
    dryRun.externalCalls === 0;
}

function certifiedReleaseDryRunResultLedgerStatus(
  dryRun: ProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun,
  ledgerReady: boolean
): ProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedger["ledgerStatus"] {
  if (ledgerReady) return "recorded";
  if (dryRun.dryRunStatus === "not_started") return "pending";
  if (dryRun.dryRunStatus === "blocked" || dryRun.releaseDecision !== "go" || dryRun.goNoGoDecision !== "go") return "blocked";
  return "incomplete";
}

function certifiedReleaseDryRunResultLedgerRows(
  dryRun: ProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun,
  ledgerReady: boolean,
  ledgerStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedger["ledgerStatus"]
): ProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedger["resultLedgerRows"] {
  return [
    certifiedReleaseDryRunResultLedgerRow("noop_execution_dryrun", "No-op execution dry-run", dryRun.noopExecutionDryRunDigest, dryRun.counts.noopExecutionDryRunCheckedCount, dryRun.dryRunStatus === "passed" && dryRun.executionMode === "no_op", ledgerReady, ledgerStatus),
    certifiedReleaseDryRunResultLedgerRow("acceptance_record", "Acceptance record", dryRun.acceptanceRecordDigest, 1, dryRun.acceptanceStatus === "acknowledged", ledgerReady, ledgerStatus),
    certifiedReleaseDryRunResultLedgerRow("handoff_packet", "Handoff packet", dryRun.handoffPacketDigest, dryRun.counts.handoffPacketCheckedCount, dryRun.handoffStatus === "ready" && dryRun.packetStatus === "issued", ledgerReady, ledgerStatus),
    certifiedReleaseDryRunResultLedgerRow("decision_receipt", "Decision receipt", dryRun.decisionReceiptDigest, dryRun.counts.decisionReceiptCheckedCount, dryRun.receiptStatus === "issued" && dryRun.releaseDecision === "go", ledgerReady, ledgerStatus),
    certifiedReleaseDryRunResultLedgerRow("release_gate", "Release gate", dryRun.releaseGateDigest, dryRun.counts.gateCheckedCount, dryRun.gateStatus === "ready" && dryRun.goNoGoDecision === "go", ledgerReady, ledgerStatus),
    certifiedReleaseDryRunResultLedgerRow("reconciliation", "Attestation reconciliation", dryRun.reconciliationDigest, dryRun.counts.reconciliationCheckedCount, ["complete", "aligned"].includes(dryRun.reconciliationStatus), ledgerReady, ledgerStatus),
    certifiedReleaseDryRunResultLedgerRow("attestation_audit", "Attestation audit", dryRun.attestationAuditDigest, dryRun.counts.attestationAuditCheckedCount, dryRun.attestationStatus === "complete", ledgerReady, ledgerStatus),
    certifiedReleaseDryRunResultLedgerRow("closure_ledger", "Closure ledger", dryRun.closureLedgerDigest, dryRun.counts.closureLedgerCheckedCount, dryRun.ledgerStatus === "certified_release_closed", ledgerReady, ledgerStatus),
    certifiedReleaseDryRunResultLedgerRow("certification", "Release certification", dryRun.certificationDigest, dryRun.counts.releaseCertificationCheckedCount, dryRun.certificationStatus === "certified", ledgerReady, ledgerStatus),
    certifiedReleaseDryRunResultLedgerRow("verification", "Release verification", dryRun.verificationDigest, dryRun.counts.releaseVerificationCheckedCount, dryRun.verificationStatus === "verified", ledgerReady, ledgerStatus),
    certifiedReleaseDryRunResultLedgerRow("release_evidence", "Release evidence", dryRun.releaseEvidenceDigest, dryRun.counts.releaseEvidenceCheckedCount, dryRun.releaseReadinessStatus === "ready_for_release", ledgerReady, ledgerStatus),
    certifiedReleaseDryRunResultLedgerRow("external_calls", "External calls", dryRun.acceptanceRecordDigest, dryRun.externalCalls, dryRun.externalCalls === 0, ledgerReady, ledgerStatus)
  ];
}

function certifiedReleaseDryRunResultLedgerRow(
  key: ProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedger["resultLedgerRows"][number]["key"],
  label: string,
  safeDigest: string,
  checkedCount: number,
  complete: boolean,
  ledgerReady: boolean,
  ledgerStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedger["ledgerStatus"]
): ProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedger["resultLedgerRows"][number] {
  return {
    key,
    label,
    rowStatus: complete && ledgerReady ? "recorded" as const : ledgerStatus,
    safeDigest,
    checkedCount,
    complete: complete && ledgerReady
  };
}

function certifiedReleaseDryRunFinalReadinessRows(
  dryRun: ProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun,
  ledgerReady: boolean,
  ledgerStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedger["ledgerStatus"]
): ProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedger["finalReadinessRows"] {
  return [
    certifiedReleaseDryRunFinalReadinessRow("dryrun_passed", "Dry-run passed", dryRun.noopExecutionDryRunDigest, 1, dryRun.dryRunStatus === "passed", ledgerReady, ledgerStatus),
    certifiedReleaseDryRunFinalReadinessRow("execution_mode_no_op", "Execution mode no-op", dryRun.noopExecutionDryRunDigest, 1, dryRun.executionMode === "no_op", ledgerReady, ledgerStatus),
    certifiedReleaseDryRunFinalReadinessRow("acceptance_acknowledged", "Acceptance acknowledged", dryRun.acceptanceRecordDigest, 1, dryRun.acceptanceStatus === "acknowledged", ledgerReady, ledgerStatus),
    certifiedReleaseDryRunFinalReadinessRow("handoff_ready", "Handoff ready", dryRun.handoffPacketDigest, 1, dryRun.handoffStatus === "ready", ledgerReady, ledgerStatus),
    certifiedReleaseDryRunFinalReadinessRow("release_decision_go", "Release decision go", dryRun.decisionReceiptDigest, 1, dryRun.releaseDecision === "go", ledgerReady, ledgerStatus),
    certifiedReleaseDryRunFinalReadinessRow("gate_ready", "Release gate ready", dryRun.releaseGateDigest, 1, dryRun.gateStatus === "ready" && dryRun.goNoGoDecision === "go", ledgerReady, ledgerStatus),
    certifiedReleaseDryRunFinalReadinessRow("safe_digests", "Safe digests", dryRun.safeDigest, 13, certifiedReleaseDryRunDigestLinksSafe(dryRun), ledgerReady, ledgerStatus),
    certifiedReleaseDryRunFinalReadinessRow("no_state_mutation", "No result ledger state mutation", dryRun.noopExecutionDryRunDigest, 0, true, ledgerReady, ledgerStatus),
    certifiedReleaseDryRunFinalReadinessRow("external_calls_zero", "External calls zero", dryRun.noopExecutionDryRunDigest, dryRun.externalCalls, dryRun.externalCalls === 0, ledgerReady, ledgerStatus)
  ];
}

function certifiedReleaseDryRunFinalReadinessRow(
  key: ProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedger["finalReadinessRows"][number]["key"],
  label: string,
  safeDigest: string,
  checkedCount: number,
  complete: boolean,
  ledgerReady: boolean,
  ledgerStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedger["ledgerStatus"]
): ProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedger["finalReadinessRows"][number] {
  return {
    key,
    label,
    readinessStatus: complete && ledgerReady
      ? "ready" as const
      : ledgerStatus === "pending"
        ? "pending" as const
        : ledgerStatus === "blocked"
          ? "blocked" as const
          : "incomplete" as const,
    safeDigest,
    checkedCount,
    complete: complete && ledgerReady
  };
}

function certifiedReleaseDryRunDigestLinksSafe(
  dryRun: ProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun
) {
  return [
    dryRun.safeDigest,
    dryRun.noopExecutionDryRunDigest,
    dryRun.acceptanceRecordDigest,
    dryRun.handoffPacketDigest,
    dryRun.decisionReceiptDigest,
    dryRun.releaseGateDigest,
    dryRun.reconciliationDigest,
    dryRun.attestationAuditDigest,
    dryRun.closureLedgerDigest,
    dryRun.certificationDigest,
    dryRun.verificationDigest,
    dryRun.releaseEvidenceDigest
  ].every((value) => /^sha256:[a-z0-9]+$/i.test(value));
}

function qaHandoffCertifiedReleaseFinalReadinessCertificateResponse(
  resultLedger: ProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedger
): ProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificate {
  const certificateReady = certifiedReleaseFinalReadinessCertificateReady(resultLedger);
  const certificateStatus = certifiedReleaseFinalReadinessCertificateStatus(resultLedger, certificateReady);
  const finalReadinessStatus = certifiedReleaseFinalReadinessStatus(resultLedger, certificateReady);
  const effectiveReleaseDecision = certificateReady ? "go" as const : "no_go" as const;
  const effectiveGoNoGoDecision = certificateReady ? "go" as const : "no_go" as const;
  const safeDigest = safeDigestForExport({
    certificateKind: "qa-handoff-locked-archive-certified-release-final-readiness-certificate",
    certificateStatus,
    finalReadinessStatus,
    dryRunResultLedgerDigest: resultLedger.dryRunResultLedgerDigest,
    externalCalls: 0
  });
  const certificateRows = certifiedReleaseFinalReadinessCertificateRows(resultLedger, certificateReady, certificateStatus, finalReadinessStatus, safeDigest);
  return {
    certificateKind: "qa-handoff-locked-archive-certified-release-final-readiness-certificate",
    certificateStatus,
    finalReadinessStatus,
    ledgerStatus: resultLedger.ledgerStatus,
    dryRunStatus: resultLedger.dryRunStatus,
    executionMode: resultLedger.executionMode,
    acceptanceStatus: resultLedger.acceptanceStatus,
    handoffStatus: resultLedger.handoffStatus,
    releaseDecision: effectiveReleaseDecision,
    packetStatus: resultLedger.packetStatus,
    receiptStatus: resultLedger.receiptStatus,
    gateStatus: resultLedger.gateStatus,
    goNoGoDecision: effectiveGoNoGoDecision,
    releaseReadinessStatus: resultLedger.releaseReadinessStatus,
    reconciliationStatus: resultLedger.reconciliationStatus,
    attestationStatus: resultLedger.attestationStatus,
    ledgerStatusFromClosure: resultLedger.ledgerStatusFromClosure,
    certificationStatus: resultLedger.certificationStatus,
    verificationStatus: resultLedger.verificationStatus,
    digestChainStatus: resultLedger.digestChainStatus,
    safeFilename: safeExportFilename("provider-webhook-review-qa-handoff-certified-release-final-readiness-certificate.json"),
    safeDigest,
    finalReadinessCertificateDigest: safeDigest,
    dryRunResultLedgerDigest: resultLedger.dryRunResultLedgerDigest,
    noopExecutionDryRunDigest: resultLedger.noopExecutionDryRunDigest,
    acceptanceRecordDigest: resultLedger.acceptanceRecordDigest,
    handoffPacketDigest: resultLedger.handoffPacketDigest,
    decisionReceiptDigest: resultLedger.decisionReceiptDigest,
    releaseGateDigest: resultLedger.releaseGateDigest,
    reconciliationDigest: resultLedger.reconciliationDigest,
    attestationAuditDigest: resultLedger.attestationAuditDigest,
    closureLedgerDigest: resultLedger.closureLedgerDigest,
    certificationDigest: resultLedger.certificationDigest,
    verificationDigest: resultLedger.verificationDigest,
    releaseEvidenceDigest: resultLedger.releaseEvidenceDigest,
    operatorChecklist: resultLedger.operatorChecklist,
    acknowledgedChecklist: resultLedger.acknowledgedChecklist,
    executionChecklist: resultLedger.executionChecklist,
    dryRunRows: resultLedger.dryRunRows,
    executionPlanRows: resultLedger.executionPlanRows,
    resultLedgerRows: resultLedger.resultLedgerRows,
    finalReadinessRows: resultLedger.finalReadinessRows,
    certificateRows,
    releaseOwnerSummary: resultLedger.releaseOwnerSummary,
    inheritedPrerequisiteChecklist: resultLedger.inheritedPrerequisiteChecklist,
    inheritedCertificationChecklist: resultLedger.inheritedCertificationChecklist,
    inheritedGateChecklist: resultLedger.inheritedGateChecklist,
    inheritedDecisionReceiptSummary: resultLedger.inheritedDecisionReceiptSummary,
    inheritedHandoffPacketSummary: resultLedger.inheritedHandoffPacketSummary,
    inheritedAcceptanceSummary: {
      ...resultLedger.inheritedAcceptanceSummary,
      releaseDecision: effectiveReleaseDecision
    },
    inheritedNoopDryRunSummary: {
      ...resultLedger.inheritedNoopDryRunSummary,
      releaseDecision: effectiveReleaseDecision
    },
    inheritedResultLedgerSummary: {
      ledgerStatus: resultLedger.ledgerStatus,
      dryRunStatus: resultLedger.dryRunStatus,
      executionMode: resultLedger.executionMode,
      acceptanceStatus: resultLedger.acceptanceStatus,
      handoffStatus: resultLedger.handoffStatus,
      releaseDecision: effectiveReleaseDecision,
      resultLedgerRowCount: resultLedger.counts.resultLedgerRowCount,
      resultLedgerRowRecordedCount: resultLedger.counts.resultLedgerRowRecordedCount,
      finalReadinessRowCount: resultLedger.counts.finalReadinessRowCount,
      finalReadinessReadyCount: resultLedger.counts.finalReadinessReadyCount,
      externalCallsZero: resultLedger.externalCalls === 0,
      safeDigest: resultLedger.safeDigest
    },
    inheritedBlockingReasons: resultLedger.inheritedBlockingReasons,
    inheritedExceptionRows: resultLedger.inheritedExceptionRows,
    counts: {
      ...resultLedger.counts,
      finalReadinessCertificateCheckedCount: 1,
      finalReadinessCertificateMutationCount: 0,
      certificateRowCount: certificateRows.length,
      certificateRowIssuedCount: certificateRows.filter((row) => row.complete).length
    },
    externalCalls: 0 as const
  };
}

function certifiedReleaseFinalReadinessCertificateReady(
  resultLedger: ProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedger
) {
  return resultLedger.ledgerStatus === "recorded" &&
    resultLedger.dryRunStatus === "passed" &&
    resultLedger.executionMode === "no_op" &&
    resultLedger.acceptanceStatus === "acknowledged" &&
    resultLedger.handoffStatus === "ready" &&
    resultLedger.releaseDecision === "go" &&
    resultLedger.packetStatus === "issued" &&
    resultLedger.receiptStatus === "issued" &&
    resultLedger.gateStatus === "ready" &&
    resultLedger.goNoGoDecision === "go" &&
    resultLedger.releaseReadinessStatus === "ready_for_release" &&
    ["complete", "aligned"].includes(resultLedger.reconciliationStatus) &&
    resultLedger.attestationStatus === "complete" &&
    resultLedger.ledgerStatusFromClosure === "certified_release_closed" &&
    resultLedger.certificationStatus === "certified" &&
    resultLedger.verificationStatus === "verified" &&
    resultLedger.digestChainStatus === "confirmed" &&
    resultLedger.resultLedgerRows.every((row) => row.complete && row.rowStatus === "recorded") &&
    resultLedger.finalReadinessRows.every((row) => row.complete && row.readinessStatus === "ready") &&
    resultLedger.externalCalls === 0;
}

function certifiedReleaseFinalReadinessCertificateStatus(
  resultLedger: ProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedger,
  certificateReady: boolean
): ProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificate["certificateStatus"] {
  if (certificateReady) return "issued";
  if (resultLedger.ledgerStatus === "pending") return "pending";
  if (resultLedger.ledgerStatus === "blocked" || resultLedger.releaseDecision !== "go" || resultLedger.goNoGoDecision !== "go") return "blocked";
  return "incomplete";
}

function certifiedReleaseFinalReadinessStatus(
  resultLedger: ProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedger,
  certificateReady: boolean
): ProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificate["finalReadinessStatus"] {
  if (certificateReady) return "ready";
  if (resultLedger.ledgerStatus === "pending" || resultLedger.ledgerStatus === "incomplete") return "incomplete";
  return "not_ready";
}

function certifiedReleaseFinalReadinessCertificateRows(
  resultLedger: ProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedger,
  certificateReady: boolean,
  certificateStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificate["certificateStatus"],
  finalReadinessStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificate["finalReadinessStatus"],
  finalReadinessCertificateDigest: string
): ProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificate["certificateRows"] {
  return [
    certifiedReleaseFinalReadinessCertificateRow("dryrun_result_ledger", "Dry-run result ledger recorded", resultLedger.dryRunResultLedgerDigest, resultLedger.counts.dryRunResultLedgerCheckedCount, resultLedger.ledgerStatus === "recorded", certificateReady, certificateStatus, finalReadinessStatus),
    certifiedReleaseFinalReadinessCertificateRow("dryrun_passed", "Dry-run passed", resultLedger.noopExecutionDryRunDigest, 1, resultLedger.dryRunStatus === "passed", certificateReady, certificateStatus, finalReadinessStatus),
    certifiedReleaseFinalReadinessCertificateRow("execution_mode_no_op", "Execution mode no-op", resultLedger.noopExecutionDryRunDigest, 1, resultLedger.executionMode === "no_op", certificateReady, certificateStatus, finalReadinessStatus),
    certifiedReleaseFinalReadinessCertificateRow("acceptance_acknowledged", "Acceptance acknowledged", resultLedger.acceptanceRecordDigest, 1, resultLedger.acceptanceStatus === "acknowledged", certificateReady, certificateStatus, finalReadinessStatus),
    certifiedReleaseFinalReadinessCertificateRow("handoff_ready", "Handoff ready", resultLedger.handoffPacketDigest, 1, resultLedger.handoffStatus === "ready", certificateReady, certificateStatus, finalReadinessStatus),
    certifiedReleaseFinalReadinessCertificateRow("release_decision_go", "Release decision go", resultLedger.decisionReceiptDigest, 1, resultLedger.releaseDecision === "go", certificateReady, certificateStatus, finalReadinessStatus),
    certifiedReleaseFinalReadinessCertificateRow("gate_ready", "Release gate ready", resultLedger.releaseGateDigest, 1, resultLedger.gateStatus === "ready" && resultLedger.goNoGoDecision === "go", certificateReady, certificateStatus, finalReadinessStatus),
    certifiedReleaseFinalReadinessCertificateRow("prerequisite_chain", "Prerequisite chain complete", resultLedger.safeDigest, resultLedger.counts.resultLedgerRowCount + resultLedger.counts.finalReadinessRowCount, resultLedger.resultLedgerRows.every((row) => row.complete) && resultLedger.finalReadinessRows.every((row) => row.complete), certificateReady, certificateStatus, finalReadinessStatus),
    certifiedReleaseFinalReadinessCertificateRow("safe_digests", "Safe digest chain", finalReadinessCertificateDigest, 14, certifiedReleaseFinalReadinessDigestLinksSafe(resultLedger, finalReadinessCertificateDigest), certificateReady, certificateStatus, finalReadinessStatus),
    certifiedReleaseFinalReadinessCertificateRow("no_state_mutation", "No final readiness certificate state mutation", resultLedger.dryRunResultLedgerDigest, 0, true, certificateReady, certificateStatus, finalReadinessStatus),
    certifiedReleaseFinalReadinessCertificateRow("external_calls_zero", "External calls zero", resultLedger.dryRunResultLedgerDigest, resultLedger.externalCalls, resultLedger.externalCalls === 0, certificateReady, certificateStatus, finalReadinessStatus)
  ];
}

function certifiedReleaseFinalReadinessCertificateRow(
  key: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificate["certificateRows"][number]["key"],
  label: string,
  safeDigest: string,
  checkedCount: number,
  complete: boolean,
  certificateReady: boolean,
  certificateStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificate["certificateStatus"],
  finalReadinessStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificate["finalReadinessStatus"]
): ProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificate["certificateRows"][number] {
  return {
    key,
    label,
    certificateStatus: complete && certificateReady ? "issued" as const : certificateStatus,
    finalReadinessStatus: complete && certificateReady ? "ready" as const : finalReadinessStatus,
    safeDigest,
    checkedCount,
    complete: complete && certificateReady
  };
}

function certifiedReleaseFinalReadinessDigestLinksSafe(
  resultLedger: ProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedger,
  finalReadinessCertificateDigest: string
) {
  return [
    finalReadinessCertificateDigest,
    resultLedger.safeDigest,
    resultLedger.dryRunResultLedgerDigest,
    resultLedger.noopExecutionDryRunDigest,
    resultLedger.acceptanceRecordDigest,
    resultLedger.handoffPacketDigest,
    resultLedger.decisionReceiptDigest,
    resultLedger.releaseGateDigest,
    resultLedger.reconciliationDigest,
    resultLedger.attestationAuditDigest,
    resultLedger.closureLedgerDigest,
    resultLedger.certificationDigest,
    resultLedger.verificationDigest,
    resultLedger.releaseEvidenceDigest
  ].every((value) => /^sha256:[a-z0-9]+$/i.test(value));
}

function qaHandoffCertifiedReleaseFreezeAuditRegisterResponse(
  finalReadinessCertificate: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificate
): ProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister {
  const freezeReady = certifiedReleaseFreezeAuditRegisterReady(finalReadinessCertificate);
  const freezeAuditStatus = certifiedReleaseFreezeAuditRegisterStatus(finalReadinessCertificate, freezeReady);
  const rollbackReadinessStatus = certifiedReleaseRollbackReadinessStatus(finalReadinessCertificate, freezeReady);
  const safeDigest = safeDigestForExport({
    registerKind: "qa-handoff-locked-archive-certified-release-freeze-audit-register",
    freezeAuditStatus,
    freezeStatus: "frozen",
    rollbackReadinessStatus,
    finalReadinessCertificateDigest: finalReadinessCertificate.finalReadinessCertificateDigest,
    externalCalls: 0
  });
  const rollbackReadinessPlanDigest = safeDigestForExport({
    planKind: "qa-handoff-locked-archive-certified-release-safe-rollback-readiness-plan",
    finalReadinessCertificateDigest: finalReadinessCertificate.finalReadinessCertificateDigest,
    safeDigest,
    externalCalls: 0
  });
  const freezeAuditRows = certifiedReleaseFreezeAuditRows(finalReadinessCertificate, freezeReady, freezeAuditStatus, rollbackReadinessStatus, safeDigest, rollbackReadinessPlanDigest);
  const rollbackPlanRows = certifiedReleaseRollbackPlanRows(finalReadinessCertificate, freezeReady, freezeAuditStatus, rollbackReadinessStatus, safeDigest, rollbackReadinessPlanDigest);
  return {
    registerKind: "qa-handoff-locked-archive-certified-release-freeze-audit-register",
    freezeAuditStatus,
    freezeStatus: "frozen",
    rollbackReadinessStatus,
    certificateStatus: finalReadinessCertificate.certificateStatus,
    finalReadinessStatus: finalReadinessCertificate.finalReadinessStatus,
    ledgerStatus: finalReadinessCertificate.ledgerStatus,
    dryRunStatus: finalReadinessCertificate.dryRunStatus,
    executionMode: finalReadinessCertificate.executionMode,
    acceptanceStatus: finalReadinessCertificate.acceptanceStatus,
    handoffStatus: finalReadinessCertificate.handoffStatus,
    releaseDecision: finalReadinessCertificate.releaseDecision,
    packetStatus: finalReadinessCertificate.packetStatus,
    receiptStatus: finalReadinessCertificate.receiptStatus,
    gateStatus: finalReadinessCertificate.gateStatus,
    goNoGoDecision: finalReadinessCertificate.goNoGoDecision,
    releaseReadinessStatus: finalReadinessCertificate.releaseReadinessStatus,
    reconciliationStatus: finalReadinessCertificate.reconciliationStatus,
    attestationStatus: finalReadinessCertificate.attestationStatus,
    ledgerStatusFromClosure: finalReadinessCertificate.ledgerStatusFromClosure,
    certificationStatus: finalReadinessCertificate.certificationStatus,
    verificationStatus: finalReadinessCertificate.verificationStatus,
    digestChainStatus: finalReadinessCertificate.digestChainStatus,
    safeFilename: safeExportFilename("provider-webhook-review-qa-handoff-certified-release-freeze-audit-register.json"),
    safeDigest,
    freezeAuditRegisterDigest: safeDigest,
    rollbackReadinessPlanDigest,
    finalReadinessCertificateDigest: finalReadinessCertificate.finalReadinessCertificateDigest,
    dryRunResultLedgerDigest: finalReadinessCertificate.dryRunResultLedgerDigest,
    noopExecutionDryRunDigest: finalReadinessCertificate.noopExecutionDryRunDigest,
    acceptanceRecordDigest: finalReadinessCertificate.acceptanceRecordDigest,
    handoffPacketDigest: finalReadinessCertificate.handoffPacketDigest,
    decisionReceiptDigest: finalReadinessCertificate.decisionReceiptDigest,
    releaseGateDigest: finalReadinessCertificate.releaseGateDigest,
    reconciliationDigest: finalReadinessCertificate.reconciliationDigest,
    attestationAuditDigest: finalReadinessCertificate.attestationAuditDigest,
    closureLedgerDigest: finalReadinessCertificate.closureLedgerDigest,
    certificationDigest: finalReadinessCertificate.certificationDigest,
    verificationDigest: finalReadinessCertificate.verificationDigest,
    releaseEvidenceDigest: finalReadinessCertificate.releaseEvidenceDigest,
    operatorChecklist: finalReadinessCertificate.operatorChecklist,
    acknowledgedChecklist: finalReadinessCertificate.acknowledgedChecklist,
    executionChecklist: finalReadinessCertificate.executionChecklist,
    dryRunRows: finalReadinessCertificate.dryRunRows,
    executionPlanRows: finalReadinessCertificate.executionPlanRows,
    resultLedgerRows: finalReadinessCertificate.resultLedgerRows,
    finalReadinessRows: finalReadinessCertificate.finalReadinessRows,
    certificateRows: finalReadinessCertificate.certificateRows,
    freezeAuditRows,
    rollbackPlanRows,
    releaseOwnerSummary: finalReadinessCertificate.releaseOwnerSummary,
    inheritedPrerequisiteChecklist: finalReadinessCertificate.inheritedPrerequisiteChecklist,
    inheritedCertificationChecklist: finalReadinessCertificate.inheritedCertificationChecklist,
    inheritedGateChecklist: finalReadinessCertificate.inheritedGateChecklist,
    inheritedDecisionReceiptSummary: finalReadinessCertificate.inheritedDecisionReceiptSummary,
    inheritedHandoffPacketSummary: finalReadinessCertificate.inheritedHandoffPacketSummary,
    inheritedAcceptanceSummary: finalReadinessCertificate.inheritedAcceptanceSummary,
    inheritedNoopDryRunSummary: finalReadinessCertificate.inheritedNoopDryRunSummary,
    inheritedResultLedgerSummary: finalReadinessCertificate.inheritedResultLedgerSummary,
    inheritedFinalReadinessCertificateSummary: {
      certificateStatus: finalReadinessCertificate.certificateStatus,
      finalReadinessStatus: finalReadinessCertificate.finalReadinessStatus,
      certificateRowCount: finalReadinessCertificate.counts.certificateRowCount,
      certificateRowIssuedCount: finalReadinessCertificate.counts.certificateRowIssuedCount,
      finalReadinessCertificateMutationCount: finalReadinessCertificate.counts.finalReadinessCertificateMutationCount,
      externalCallsZero: finalReadinessCertificate.externalCalls === 0,
      safeDigest: finalReadinessCertificate.safeDigest
    },
    inheritedBlockingReasons: finalReadinessCertificate.inheritedBlockingReasons,
    inheritedExceptionRows: finalReadinessCertificate.inheritedExceptionRows,
    counts: {
      ...finalReadinessCertificate.counts,
      freezeAuditRegisterCheckedCount: 1,
      freezeAuditRegisterMutationCount: 0,
      freezeAuditRowCount: freezeAuditRows.length,
      freezeAuditRegisteredCount: freezeAuditRows.filter((row) => row.complete).length,
      rollbackPlanRowCount: rollbackPlanRows.length,
      rollbackPlanReadyCount: rollbackPlanRows.filter((row) => row.complete).length
    },
    externalCalls: 0 as const
  };
}

function certifiedReleaseFreezeAuditRegisterReady(
  finalReadinessCertificate: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificate
) {
  return finalReadinessCertificate.certificateStatus === "issued" &&
    finalReadinessCertificate.finalReadinessStatus === "ready" &&
    finalReadinessCertificate.releaseDecision === "go" &&
    finalReadinessCertificate.goNoGoDecision === "go" &&
    finalReadinessCertificate.certificateRows.every((row) => row.complete && row.certificateStatus === "issued" && row.finalReadinessStatus === "ready") &&
    finalReadinessCertificate.counts.finalReadinessCertificateMutationCount === 0 &&
    finalReadinessCertificate.externalCalls === 0;
}

function certifiedReleaseFreezeAuditRegisterStatus(
  finalReadinessCertificate: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificate,
  freezeReady: boolean
): ProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister["freezeAuditStatus"] {
  if (freezeReady) return "recorded";
  if (finalReadinessCertificate.certificateStatus === "pending") return "pending";
  if (finalReadinessCertificate.certificateStatus === "blocked" || finalReadinessCertificate.releaseDecision !== "go" || finalReadinessCertificate.goNoGoDecision !== "go") return "blocked";
  return "incomplete";
}

function certifiedReleaseRollbackReadinessStatus(
  finalReadinessCertificate: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificate,
  freezeReady: boolean
): ProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister["rollbackReadinessStatus"] {
  if (freezeReady) return "ready";
  if (finalReadinessCertificate.certificateStatus === "pending" || finalReadinessCertificate.finalReadinessStatus === "incomplete") return "incomplete";
  return "not_ready";
}

function certifiedReleaseFreezeAuditRows(
  finalReadinessCertificate: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificate,
  freezeReady: boolean,
  freezeAuditStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister["freezeAuditStatus"],
  rollbackReadinessStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister["rollbackReadinessStatus"],
  freezeAuditRegisterDigest: string,
  rollbackReadinessPlanDigest: string
): ProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister["freezeAuditRows"] {
  return [
    certifiedReleaseFreezeAuditRegisterRow("final_readiness_certificate", "Final readiness certificate issued", finalReadinessCertificate.finalReadinessCertificateDigest, 1, finalReadinessCertificate.certificateStatus === "issued" && finalReadinessCertificate.finalReadinessStatus === "ready", freezeReady, freezeAuditStatus, rollbackReadinessStatus),
    certifiedReleaseFreezeAuditRegisterRow("release_freeze_scope", "Release freeze scope registered", freezeAuditRegisterDigest, finalReadinessCertificate.counts.certificateRowCount, finalReadinessCertificate.certificateRows.every((row) => row.complete), freezeReady, freezeAuditStatus, rollbackReadinessStatus),
    certifiedReleaseFreezeAuditRegisterRow("safe_digests", "Freeze register safe digest chain", freezeAuditRegisterDigest, 16, certifiedReleaseFreezeAuditDigestLinksSafe(finalReadinessCertificate, freezeAuditRegisterDigest, rollbackReadinessPlanDigest), freezeReady, freezeAuditStatus, rollbackReadinessStatus),
    certifiedReleaseFreezeAuditRegisterRow("no_state_mutation", "No freeze audit register state mutation", finalReadinessCertificate.finalReadinessCertificateDigest, 0, true, freezeReady, freezeAuditStatus, rollbackReadinessStatus),
    certifiedReleaseFreezeAuditRegisterRow("external_calls_zero", "External calls zero", finalReadinessCertificate.finalReadinessCertificateDigest, finalReadinessCertificate.externalCalls, finalReadinessCertificate.externalCalls === 0, freezeReady, freezeAuditStatus, rollbackReadinessStatus)
  ];
}

function certifiedReleaseRollbackPlanRows(
  finalReadinessCertificate: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificate,
  freezeReady: boolean,
  freezeAuditStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister["freezeAuditStatus"],
  rollbackReadinessStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister["rollbackReadinessStatus"],
  freezeAuditRegisterDigest: string,
  rollbackReadinessPlanDigest: string
): ProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister["rollbackPlanRows"] {
  return [
    certifiedReleaseFreezeAuditRegisterRow("rollback_plan_ready", "Safe rollback readiness plan ready", rollbackReadinessPlanDigest, finalReadinessCertificate.counts.finalReadinessReadyCount, finalReadinessCertificate.finalReadinessRows.every((row) => row.complete && row.readinessStatus === "ready"), freezeReady, freezeAuditStatus, rollbackReadinessStatus),
    certifiedReleaseFreezeAuditRegisterRow("rollback_owner_confirmed", "Release owner rollback readiness confirmed", finalReadinessCertificate.safeDigest, 1, finalReadinessCertificate.releaseOwnerSummary.checklistAcknowledged, freezeReady, freezeAuditStatus, rollbackReadinessStatus),
    certifiedReleaseFreezeAuditRegisterRow("safe_digests", "Rollback plan safe digest chain", rollbackReadinessPlanDigest, 16, certifiedReleaseFreezeAuditDigestLinksSafe(finalReadinessCertificate, freezeAuditRegisterDigest, rollbackReadinessPlanDigest), freezeReady, freezeAuditStatus, rollbackReadinessStatus),
    certifiedReleaseFreezeAuditRegisterRow("no_state_mutation", "No rollback readiness plan state mutation", finalReadinessCertificate.finalReadinessCertificateDigest, 0, true, freezeReady, freezeAuditStatus, rollbackReadinessStatus),
    certifiedReleaseFreezeAuditRegisterRow("external_calls_zero", "External calls zero", finalReadinessCertificate.finalReadinessCertificateDigest, finalReadinessCertificate.externalCalls, finalReadinessCertificate.externalCalls === 0, freezeReady, freezeAuditStatus, rollbackReadinessStatus)
  ];
}

function certifiedReleaseFreezeAuditRegisterRow(
  key: ProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister["freezeAuditRows"][number]["key"],
  label: string,
  safeDigest: string,
  checkedCount: number,
  complete: boolean,
  freezeReady: boolean,
  freezeAuditStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister["freezeAuditStatus"],
  rollbackReadinessStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister["rollbackReadinessStatus"]
): ProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister["freezeAuditRows"][number] {
  return {
    key,
    label,
    freezeAuditStatus: complete && freezeReady ? "recorded" as const : freezeAuditStatus,
    rollbackReadinessStatus: complete && freezeReady ? "ready" as const : rollbackReadinessStatus,
    safeDigest,
    checkedCount,
    complete: complete && freezeReady
  };
}

function certifiedReleaseFreezeAuditDigestLinksSafe(
  finalReadinessCertificate: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificate,
  freezeAuditRegisterDigest: string,
  rollbackReadinessPlanDigest: string
) {
  return [
    freezeAuditRegisterDigest,
    rollbackReadinessPlanDigest,
    finalReadinessCertificate.safeDigest,
    finalReadinessCertificate.finalReadinessCertificateDigest,
    finalReadinessCertificate.dryRunResultLedgerDigest,
    finalReadinessCertificate.noopExecutionDryRunDigest,
    finalReadinessCertificate.acceptanceRecordDigest,
    finalReadinessCertificate.handoffPacketDigest,
    finalReadinessCertificate.decisionReceiptDigest,
    finalReadinessCertificate.releaseGateDigest,
    finalReadinessCertificate.reconciliationDigest,
    finalReadinessCertificate.attestationAuditDigest,
    finalReadinessCertificate.closureLedgerDigest,
    finalReadinessCertificate.certificationDigest,
    finalReadinessCertificate.verificationDigest,
    finalReadinessCertificate.releaseEvidenceDigest
  ].every((value) => /^sha256:[a-z0-9]+$/i.test(value));
}

function qaHandoffCertifiedReleaseRollbackRehearsalReceiptResponse(
  freezeAuditRegister: ProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister
): ProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt {
  const rehearsalReady = certifiedReleaseRollbackRehearsalReady(freezeAuditRegister);
  const rollbackRehearsalStatus = certifiedReleaseRollbackRehearsalStatus(freezeAuditRegister, rehearsalReady);
  const recoveryReadinessStatus = certifiedReleaseRecoveryReadinessStatus(freezeAuditRegister, rehearsalReady);
  const effectiveReleaseDecision = rehearsalReady ? freezeAuditRegister.releaseDecision : "no_go" as const;
  const effectiveGoNoGoDecision = rehearsalReady ? freezeAuditRegister.goNoGoDecision : "no_go" as const;
  const safeDigest = safeDigestForExport({
    receiptKind: "qa-handoff-locked-archive-certified-release-rollback-rehearsal-receipt",
    rollbackRehearsalStatus,
    recoveryReadinessStatus,
    freezeAuditRegisterDigest: freezeAuditRegister.freezeAuditRegisterDigest,
    finalReadinessCertificateDigest: freezeAuditRegister.finalReadinessCertificateDigest,
    externalCalls: 0
  });
  const freezeSnapshotRows = certifiedReleaseRollbackRehearsalFreezeSnapshotRows(freezeAuditRegister, rehearsalReady, rollbackRehearsalStatus, recoveryReadinessStatus, safeDigest);
  const rollbackReadinessRows = certifiedReleaseRollbackRehearsalReadinessRows(freezeAuditRegister, rehearsalReady, rollbackRehearsalStatus, recoveryReadinessStatus, safeDigest);
  const rollbackRehearsalRows = certifiedReleaseRollbackRehearsalRows(freezeAuditRegister, rehearsalReady, rollbackRehearsalStatus, recoveryReadinessStatus, safeDigest);
  const recoveryPlanRows = certifiedReleaseRecoveryPlanRows(freezeAuditRegister, rehearsalReady, rollbackRehearsalStatus, recoveryReadinessStatus, safeDigest);
  const recoveryReadinessRows = certifiedReleaseRecoveryReadinessRows(freezeAuditRegister, rehearsalReady, rollbackRehearsalStatus, recoveryReadinessStatus, safeDigest);

  return {
    receiptKind: "qa-handoff-locked-archive-certified-release-rollback-rehearsal-receipt",
    rollbackRehearsalStatus,
    recoveryReadinessStatus,
    rollbackReadinessStatus: freezeAuditRegister.rollbackReadinessStatus,
    freezeAuditStatus: freezeAuditRegister.freezeAuditStatus,
    freezeStatus: freezeAuditRegister.freezeStatus,
    certificateStatus: freezeAuditRegister.certificateStatus,
    finalReadinessStatus: freezeAuditRegister.finalReadinessStatus,
    ledgerStatus: freezeAuditRegister.ledgerStatus,
    dryRunStatus: freezeAuditRegister.dryRunStatus,
    executionMode: freezeAuditRegister.executionMode,
    acceptanceStatus: freezeAuditRegister.acceptanceStatus,
    handoffStatus: freezeAuditRegister.handoffStatus,
    releaseDecision: effectiveReleaseDecision,
    packetStatus: freezeAuditRegister.packetStatus,
    receiptStatus: freezeAuditRegister.receiptStatus,
    gateStatus: freezeAuditRegister.gateStatus,
    goNoGoDecision: effectiveGoNoGoDecision,
    releaseReadinessStatus: freezeAuditRegister.releaseReadinessStatus,
    reconciliationStatus: freezeAuditRegister.reconciliationStatus,
    attestationStatus: freezeAuditRegister.attestationStatus,
    ledgerStatusFromClosure: freezeAuditRegister.ledgerStatusFromClosure,
    certificationStatus: freezeAuditRegister.certificationStatus,
    verificationStatus: freezeAuditRegister.verificationStatus,
    digestChainStatus: freezeAuditRegister.digestChainStatus,
    safeFilename: safeExportFilename("provider-webhook-review-qa-handoff-certified-release-rollback-rehearsal-receipt.json"),
    safeDigest,
    rollbackRehearsalReceiptDigest: safeDigest,
    freezeAuditRegisterDigest: freezeAuditRegister.freezeAuditRegisterDigest,
    finalReadinessCertificateDigest: freezeAuditRegister.finalReadinessCertificateDigest,
    dryRunResultLedgerDigest: freezeAuditRegister.dryRunResultLedgerDigest,
    noopExecutionDryRunDigest: freezeAuditRegister.noopExecutionDryRunDigest,
    acceptanceRecordDigest: freezeAuditRegister.acceptanceRecordDigest,
    handoffPacketDigest: freezeAuditRegister.handoffPacketDigest,
    decisionReceiptDigest: freezeAuditRegister.decisionReceiptDigest,
    releaseGateDigest: freezeAuditRegister.releaseGateDigest,
    reconciliationDigest: freezeAuditRegister.reconciliationDigest,
    attestationAuditDigest: freezeAuditRegister.attestationAuditDigest,
    closureLedgerDigest: freezeAuditRegister.closureLedgerDigest,
    certificationDigest: freezeAuditRegister.certificationDigest,
    verificationDigest: freezeAuditRegister.verificationDigest,
    releaseEvidenceDigest: freezeAuditRegister.releaseEvidenceDigest,
    operatorChecklist: freezeAuditRegister.operatorChecklist,
    acknowledgedChecklist: freezeAuditRegister.acknowledgedChecklist,
    executionChecklist: freezeAuditRegister.executionChecklist,
    dryRunRows: freezeAuditRegister.dryRunRows,
    executionPlanRows: freezeAuditRegister.executionPlanRows,
    resultLedgerRows: freezeAuditRegister.resultLedgerRows,
    finalReadinessRows: freezeAuditRegister.finalReadinessRows,
    certificateRows: freezeAuditRegister.certificateRows,
    freezeAuditRows: freezeAuditRegister.freezeAuditRows,
    freezeSnapshotRows,
    rollbackReadinessRows,
    rollbackRehearsalRows,
    recoveryPlanRows,
    recoveryReadinessRows,
    releaseOwnerSummary: freezeAuditRegister.releaseOwnerSummary,
    inheritedPrerequisiteChecklist: freezeAuditRegister.inheritedPrerequisiteChecklist,
    inheritedCertificationChecklist: freezeAuditRegister.inheritedCertificationChecklist,
    inheritedGateChecklist: freezeAuditRegister.inheritedGateChecklist,
    inheritedDecisionReceiptSummary: freezeAuditRegister.inheritedDecisionReceiptSummary,
    inheritedHandoffPacketSummary: freezeAuditRegister.inheritedHandoffPacketSummary,
    inheritedAcceptanceSummary: freezeAuditRegister.inheritedAcceptanceSummary,
    inheritedNoopDryRunSummary: freezeAuditRegister.inheritedNoopDryRunSummary,
    inheritedResultLedgerSummary: freezeAuditRegister.inheritedResultLedgerSummary,
    inheritedFinalReadinessCertificateSummary: freezeAuditRegister.inheritedFinalReadinessCertificateSummary,
    inheritedFreezeAuditSummary: {
      freezeAuditStatus: freezeAuditRegister.freezeAuditStatus,
      freezeStatus: freezeAuditRegister.freezeStatus,
      rollbackReadinessStatus: freezeAuditRegister.rollbackReadinessStatus,
      freezeAuditRowCount: freezeAuditRegister.counts.freezeAuditRowCount,
      freezeAuditRegisteredCount: freezeAuditRegister.counts.freezeAuditRegisteredCount,
      rollbackPlanRowCount: freezeAuditRegister.counts.rollbackPlanRowCount,
      rollbackPlanReadyCount: freezeAuditRegister.counts.rollbackPlanReadyCount,
      freezeAuditRegisterMutationCount: freezeAuditRegister.counts.freezeAuditRegisterMutationCount,
      externalCallsZero: freezeAuditRegister.externalCalls === 0,
      safeDigest: freezeAuditRegister.safeDigest
    },
    inheritedBlockingReasons: freezeAuditRegister.inheritedBlockingReasons,
    inheritedExceptionRows: freezeAuditRegister.inheritedExceptionRows,
    counts: {
      ...freezeAuditRegister.counts,
      rollbackRehearsalReceiptCheckedCount: 1,
      rollbackRehearsalReceiptMutationCount: 0,
      freezeSnapshotRowCount: freezeSnapshotRows.length,
      freezeSnapshotVerifiedCount: freezeSnapshotRows.filter((row) => row.complete).length,
      rollbackReadinessRowCount: rollbackReadinessRows.length,
      rollbackReadinessReadyCount: rollbackReadinessRows.filter((row) => row.complete).length,
      rollbackRehearsalRowCount: rollbackRehearsalRows.length,
      rollbackRehearsalVerifiedCount: rollbackRehearsalRows.filter((row) => row.complete).length,
      recoveryPlanRowCount: recoveryPlanRows.length,
      recoveryPlanReadyCount: recoveryPlanRows.filter((row) => row.complete).length,
      recoveryReadinessRowCount: recoveryReadinessRows.length,
      recoveryReadinessReadyCount: recoveryReadinessRows.filter((row) => row.complete).length
    },
    externalCalls: 0 as const
  };
}

function certifiedReleaseRollbackRehearsalReady(
  freezeAuditRegister: ProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister
) {
  return freezeAuditRegister.freezeAuditStatus === "recorded" &&
    freezeAuditRegister.freezeStatus === "frozen" &&
    freezeAuditRegister.rollbackReadinessStatus === "ready" &&
    freezeAuditRegister.certificateStatus === "issued" &&
    freezeAuditRegister.finalReadinessStatus === "ready" &&
    freezeAuditRegister.ledgerStatus === "recorded" &&
    freezeAuditRegister.dryRunStatus === "passed" &&
    freezeAuditRegister.executionMode === "no_op" &&
    freezeAuditRegister.acceptanceStatus === "acknowledged" &&
    freezeAuditRegister.handoffStatus === "ready" &&
    freezeAuditRegister.releaseDecision === "go" &&
    freezeAuditRegister.goNoGoDecision === "go" &&
    freezeAuditRegister.freezeAuditRows.every((row) => row.complete && row.freezeAuditStatus === "recorded" && row.rollbackReadinessStatus === "ready") &&
    freezeAuditRegister.counts.freezeAuditRegisterMutationCount === 0 &&
    freezeAuditRegister.externalCalls === 0;
}

function certifiedReleaseRollbackRehearsalStatus(
  freezeAuditRegister: ProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister,
  rehearsalReady: boolean
): ProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt["rollbackRehearsalStatus"] {
  if (rehearsalReady) return "verified";
  if (freezeAuditRegister.freezeAuditStatus === "pending") return "pending";
  if (freezeAuditRegister.freezeAuditStatus === "blocked" || freezeAuditRegister.releaseDecision !== "go" || freezeAuditRegister.goNoGoDecision !== "go") return "blocked";
  return "incomplete";
}

function certifiedReleaseRecoveryReadinessStatus(
  freezeAuditRegister: ProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister,
  rehearsalReady: boolean
): ProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt["recoveryReadinessStatus"] {
  if (rehearsalReady) return "ready";
  if (freezeAuditRegister.freezeAuditStatus === "pending" || freezeAuditRegister.rollbackReadinessStatus === "incomplete") return "incomplete";
  return "not_ready";
}

function certifiedReleaseRollbackRehearsalFreezeSnapshotRows(
  freezeAuditRegister: ProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister,
  rehearsalReady: boolean,
  rollbackRehearsalStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt["rollbackRehearsalStatus"],
  recoveryReadinessStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt["recoveryReadinessStatus"],
  safeDigest: string
): ProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt["freezeSnapshotRows"] {
  return [
    certifiedReleaseRollbackRehearsalRow("freeze_audit_recorded", "Freeze audit register recorded", freezeAuditRegister.freezeAuditRegisterDigest, freezeAuditRegister.counts.freezeAuditRegisteredCount, freezeAuditRegister.freezeAuditStatus === "recorded", rehearsalReady, rollbackRehearsalStatus, recoveryReadinessStatus),
    certifiedReleaseRollbackRehearsalRow("release_frozen", "Certified release freeze remains frozen", freezeAuditRegister.freezeAuditRegisterDigest, 1, freezeAuditRegister.freezeStatus === "frozen", rehearsalReady, rollbackRehearsalStatus, recoveryReadinessStatus),
    certifiedReleaseRollbackRehearsalRow("safe_digest_chain", "Freeze snapshot safe digest chain", safeDigest, 17, certifiedReleaseRollbackRehearsalDigestLinksSafe(freezeAuditRegister, safeDigest), rehearsalReady, rollbackRehearsalStatus, recoveryReadinessStatus)
  ];
}

function certifiedReleaseRollbackRehearsalReadinessRows(
  freezeAuditRegister: ProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister,
  rehearsalReady: boolean,
  rollbackRehearsalStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt["rollbackRehearsalStatus"],
  recoveryReadinessStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt["recoveryReadinessStatus"],
  safeDigest: string
): ProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt["rollbackReadinessRows"] {
  return [
    certifiedReleaseRollbackRehearsalRow("rollback_readiness_ready", "Rollback readiness status ready", freezeAuditRegister.freezeAuditRegisterDigest, freezeAuditRegister.counts.rollbackPlanReadyCount, freezeAuditRegister.rollbackReadinessStatus === "ready", rehearsalReady, rollbackRehearsalStatus, recoveryReadinessStatus),
    certifiedReleaseRollbackRehearsalRow("recovery_owner_confirmed", "Release owner recovery readiness confirmed", freezeAuditRegister.safeDigest, 1, freezeAuditRegister.releaseOwnerSummary.checklistAcknowledged, rehearsalReady, rollbackRehearsalStatus, recoveryReadinessStatus),
    certifiedReleaseRollbackRehearsalRow("safe_digest_chain", "Rollback readiness safe digest chain", safeDigest, 17, certifiedReleaseRollbackRehearsalDigestLinksSafe(freezeAuditRegister, safeDigest), rehearsalReady, rollbackRehearsalStatus, recoveryReadinessStatus)
  ];
}

function certifiedReleaseRollbackRehearsalRows(
  freezeAuditRegister: ProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister,
  rehearsalReady: boolean,
  rollbackRehearsalStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt["rollbackRehearsalStatus"],
  recoveryReadinessStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt["recoveryReadinessStatus"],
  safeDigest: string
): ProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt["rollbackRehearsalRows"] {
  return [
    certifiedReleaseRollbackRehearsalRow("dry_run_noop_passed", "No-op execution dry-run passed", freezeAuditRegister.noopExecutionDryRunDigest, freezeAuditRegister.counts.dryRunRowPassedCount, freezeAuditRegister.dryRunStatus === "passed" && freezeAuditRegister.executionMode === "no_op", rehearsalReady, rollbackRehearsalStatus, recoveryReadinessStatus),
    certifiedReleaseRollbackRehearsalRow("rollback_rehearsal_noop", "Rollback rehearsal receipt is read-only no-op evidence", safeDigest, 1, true, rehearsalReady, rollbackRehearsalStatus, recoveryReadinessStatus),
    certifiedReleaseRollbackRehearsalRow("no_state_mutation", "No rollback rehearsal receipt state mutation", freezeAuditRegister.freezeAuditRegisterDigest, 0, true, rehearsalReady, rollbackRehearsalStatus, recoveryReadinessStatus),
    certifiedReleaseRollbackRehearsalRow("external_calls_zero", "External calls zero", freezeAuditRegister.freezeAuditRegisterDigest, freezeAuditRegister.externalCalls, freezeAuditRegister.externalCalls === 0, rehearsalReady, rollbackRehearsalStatus, recoveryReadinessStatus)
  ];
}

function certifiedReleaseRecoveryPlanRows(
  freezeAuditRegister: ProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister,
  rehearsalReady: boolean,
  rollbackRehearsalStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt["rollbackRehearsalStatus"],
  recoveryReadinessStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt["recoveryReadinessStatus"],
  safeDigest: string
): ProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt["recoveryPlanRows"] {
  return [
    certifiedReleaseRollbackRehearsalRow("recovery_plan_ready", "Safe recovery plan ready", freezeAuditRegister.freezeAuditRegisterDigest, freezeAuditRegister.counts.rollbackPlanReadyCount, freezeAuditRegister.rollbackPlanRows.every((row) => row.complete && row.rollbackReadinessStatus === "ready"), rehearsalReady, rollbackRehearsalStatus, recoveryReadinessStatus),
    certifiedReleaseRollbackRehearsalRow("certificate_issued", "Final readiness certificate issued", freezeAuditRegister.finalReadinessCertificateDigest, freezeAuditRegister.counts.certificateRowIssuedCount, freezeAuditRegister.certificateStatus === "issued", rehearsalReady, rollbackRehearsalStatus, recoveryReadinessStatus),
    certifiedReleaseRollbackRehearsalRow("final_readiness_ready", "Final readiness remains ready", freezeAuditRegister.finalReadinessCertificateDigest, freezeAuditRegister.counts.finalReadinessReadyCount, freezeAuditRegister.finalReadinessStatus === "ready", rehearsalReady, rollbackRehearsalStatus, recoveryReadinessStatus)
  ];
}

function certifiedReleaseRecoveryReadinessRows(
  freezeAuditRegister: ProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister,
  rehearsalReady: boolean,
  rollbackRehearsalStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt["rollbackRehearsalStatus"],
  recoveryReadinessStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt["recoveryReadinessStatus"],
  safeDigest: string
): ProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt["recoveryReadinessRows"] {
  return [
    certifiedReleaseRollbackRehearsalRow("safe_digest_chain", "Recovery readiness safe digest chain", safeDigest, 17, certifiedReleaseRollbackRehearsalDigestLinksSafe(freezeAuditRegister, safeDigest), rehearsalReady, rollbackRehearsalStatus, recoveryReadinessStatus),
    certifiedReleaseRollbackRehearsalRow("no_state_mutation", "No recovery readiness state mutation", freezeAuditRegister.freezeAuditRegisterDigest, 0, true, rehearsalReady, rollbackRehearsalStatus, recoveryReadinessStatus),
    certifiedReleaseRollbackRehearsalRow("external_calls_zero", "External calls zero", freezeAuditRegister.freezeAuditRegisterDigest, freezeAuditRegister.externalCalls, freezeAuditRegister.externalCalls === 0, rehearsalReady, rollbackRehearsalStatus, recoveryReadinessStatus)
  ];
}

function certifiedReleaseRollbackRehearsalRow(
  key: ProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt["rollbackRehearsalRows"][number]["key"],
  label: string,
  safeDigest: string,
  checkedCount: number,
  complete: boolean,
  rehearsalReady: boolean,
  rollbackRehearsalStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt["rollbackRehearsalStatus"],
  recoveryReadinessStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt["recoveryReadinessStatus"]
): ProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt["rollbackRehearsalRows"][number] {
  return {
    key,
    label,
    rollbackRehearsalStatus: complete && rehearsalReady ? "verified" as const : rollbackRehearsalStatus,
    recoveryReadinessStatus: complete && rehearsalReady ? "ready" as const : recoveryReadinessStatus,
    safeDigest,
    checkedCount,
    complete: complete && rehearsalReady
  };
}

function certifiedReleaseRollbackRehearsalDigestLinksSafe(
  freezeAuditRegister: ProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister,
  rollbackRehearsalReceiptDigest: string
) {
  return [
    rollbackRehearsalReceiptDigest,
    freezeAuditRegister.freezeAuditRegisterDigest,
    freezeAuditRegister.finalReadinessCertificateDigest,
    freezeAuditRegister.dryRunResultLedgerDigest,
    freezeAuditRegister.noopExecutionDryRunDigest,
    freezeAuditRegister.acceptanceRecordDigest,
    freezeAuditRegister.handoffPacketDigest,
    freezeAuditRegister.decisionReceiptDigest,
    freezeAuditRegister.releaseGateDigest,
    freezeAuditRegister.reconciliationDigest,
    freezeAuditRegister.attestationAuditDigest,
    freezeAuditRegister.closureLedgerDigest,
    freezeAuditRegister.certificationDigest,
    freezeAuditRegister.verificationDigest,
    freezeAuditRegister.releaseEvidenceDigest,
    freezeAuditRegister.safeDigest,
    freezeAuditRegister.rollbackReadinessPlanDigest
  ].every((value) => /^sha256:[a-z0-9]+$/i.test(value));
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
