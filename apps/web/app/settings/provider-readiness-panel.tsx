import React, { useState } from "react";
import { Activity, AlertTriangle, BarChart3, Bell, Check, CheckSquare, ChevronLeft, ChevronRight, Download, FileClock, FileText, Flag, Link2, ListChecks, LockKeyhole, NotebookPen, Pin, RadioTower, RotateCcw, Search, Send, ShieldCheck, SkipForward, Star, UserCheck, UserMinus, X } from "lucide-react";
import type { ProviderReadiness, ProviderReadinessProvider, ProviderWebhookCandidateConversation, ProviderWebhookEvent, ProviderWebhookEventType, ProviderWebhookInboundPersistenceMode, ProviderWebhookOperatorNote, ProviderWebhookReviewAlerts, ProviderWebhookReviewClosureChecklistStep, ProviderWebhookReviewClosureEvidence, ProviderWebhookReviewClosureEvidenceExport, ProviderWebhookReviewExportIntegrity, ProviderWebhookReviewExportManifest, ProviderWebhookReviewQaHandoffBundle, ProviderWebhookReviewQaHandoffBundleExport, ProviderWebhookReviewQaHandoffAcceptanceLock, ProviderWebhookReviewQaHandoffArchiveFinalization, ProviderWebhookReviewQaHandoffArchiveIntegrity, ProviderWebhookReviewQaHandoffFinalizationReceipt, ProviderWebhookReviewQaHandoffFinalizationSignOffResponse, ProviderWebhookReviewQaHandoffLockedArchiveExport, ProviderWebhookReviewQaHandoffLockedArchiveStatus, ProviderWebhookReviewQaHandoffReleaseEvidence, ProviderWebhookReviewQaHandoffReleaseCertification, ProviderWebhookReviewQaHandoffReleaseAttestationAudit, ProviderWebhookReviewQaHandoffReleaseAttestationReconciliationRegister, ProviderWebhookReviewQaHandoffCertifiedReleaseGate, ProviderWebhookReviewQaHandoffCertifiedReleaseDecisionReceipt, ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord, ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket, ProviderWebhookReviewQaHandoffReleaseClosureLedger, ProviderWebhookReviewQaHandoffReleaseVerification, ProviderWebhookReviewQaHandoffRetentionAudit, ProviderWebhookReviewQaHandoffRetentionManifest, ProviderWebhookReviewQaHandoffReceipt, ProviderWebhookReviewQaHandoffSignOffResponse, ProviderWebhookReviewExportRedactionAudit, ProviderWebhookReviewClosureReport, ProviderWebhookReviewClosureReportExport, ProviderWebhookReviewEscalationReason, ProviderWebhookReviewMetrics, ProviderWebhookReviewResolutionOutcome, ProviderWebhookReviewResolutionSummary, ProviderWebhookReviewSavedView, ProviderWebhookReviewTriage, ProviderWebhookReviewWorkload, ProviderWebhookSandboxEventRequest, ProviderWebhookUnmatchedInboundBulkAssignmentResponse, ProviderWebhookUnmatchedInboundBulkEscalationResponse, ProviderWebhookUnmatchedInboundBulkResolutionResponse, ProviderWebhookUnmatchedInboundBulkReviewResponse, ProviderWebhookUnmatchedInboundDiagnostics, ProviderWebhookUnmatchedInboundExport, ProviderWebhookUnmatchedInboundExportFormat, ProviderWebhookUnmatchedInboundFilters, ProviderWebhookUnmatchedInboundHistory, ProviderWebhookUnmatchedInboundItem, ProviderWebhookUnmatchedInboundPage } from "@ai-omni/shared";

type ProviderReadinessPanelProps = {
  readiness: ProviderReadiness | null;
  loading: boolean;
  error: string;
  webhookEvents?: ProviderWebhookEvent[];
  webhookEventsLoading?: boolean;
  webhookEventsError?: string;
  unmatchedInboundItems?: ProviderWebhookUnmatchedInboundItem[];
  unmatchedFilters?: ProviderWebhookUnmatchedInboundFilters;
  unmatchedPagination?: ProviderWebhookUnmatchedInboundPage["pagination"] | null;
  unmatchedAppliedSort?: ProviderWebhookUnmatchedInboundPage["appliedSort"] | null;
  unmatchedPageSummary?: ProviderWebhookUnmatchedInboundPage["summary"] | null;
  selectedUnmatchedIds?: string[];
  unmatchedInboundLoading?: boolean;
  unmatchedInboundError?: string;
  unmatchedActionSavingId?: string;
  unmatchedActionStatus?: string;
  unmatchedBulkSavingStatus?: "" | "reviewed" | "skipped";
  unmatchedBulkResult?: ProviderWebhookUnmatchedInboundBulkReviewResponse | null;
  unmatchedBulkMetadataSavingStatus?: string;
  unmatchedBulkMetadataResult?: ProviderWebhookUnmatchedInboundBulkAssignmentResponse | ProviderWebhookUnmatchedInboundBulkEscalationResponse | null;
  unmatchedBulkResolutionResult?: ProviderWebhookUnmatchedInboundBulkResolutionResponse | null;
  reviewMetrics?: ProviderWebhookReviewMetrics | null;
  reviewMetricsLoading?: boolean;
  reviewMetricsError?: string;
  reviewAlerts?: ProviderWebhookReviewAlerts | null;
  reviewAlertsLoading?: boolean;
  reviewAlertsError?: string;
  reviewTriage?: ProviderWebhookReviewTriage | null;
  reviewTriageLoading?: boolean;
  reviewTriageError?: string;
  reviewWorkload?: ProviderWebhookReviewWorkload | null;
  reviewWorkloadLoading?: boolean;
  reviewWorkloadError?: string;
  reviewResolutionSummary?: ProviderWebhookReviewResolutionSummary | null;
  reviewResolutionSummaryLoading?: boolean;
  reviewResolutionSummaryError?: string;
  reviewClosureReport?: ProviderWebhookReviewClosureReport | null;
  reviewClosureReportLoading?: boolean;
  reviewClosureReportError?: string;
  reviewClosureReportExport?: ProviderWebhookReviewClosureReportExport | null;
  reviewClosureReportExportLoading?: boolean;
  reviewClosureReportExportError?: string;
  reviewClosureReportExportManifest?: ProviderWebhookReviewExportManifest | null;
  reviewClosureReportExportManifestLoading?: boolean;
  reviewClosureReportExportManifestError?: string;
  reviewQaHandoffBundle?: ProviderWebhookReviewQaHandoffBundle | null;
  reviewQaHandoffBundleLoading?: boolean;
  reviewQaHandoffBundleError?: string;
  reviewQaHandoffBundleExport?: ProviderWebhookReviewQaHandoffBundleExport | null;
  reviewQaHandoffBundleExportLoading?: boolean;
  reviewQaHandoffBundleExportError?: string;
  reviewQaHandoffReceipt?: ProviderWebhookReviewQaHandoffReceipt | null;
  reviewQaHandoffReceiptLoading?: boolean;
  reviewQaHandoffReceiptError?: string;
  reviewQaHandoffSignOff?: ProviderWebhookReviewQaHandoffSignOffResponse | null;
  reviewQaHandoffSignOffLoading?: boolean;
  reviewQaHandoffSignOffError?: string;
  reviewQaHandoffAcceptanceLock?: ProviderWebhookReviewQaHandoffAcceptanceLock | null;
  reviewQaHandoffAcceptanceLockLoading?: boolean;
  reviewQaHandoffAcceptanceLockError?: string;
  reviewQaHandoffLockedArchive?: ProviderWebhookReviewQaHandoffLockedArchiveStatus | null;
  reviewQaHandoffLockedArchiveLoading?: boolean;
  reviewQaHandoffLockedArchiveError?: string;
  reviewQaHandoffLockedArchiveExport?: ProviderWebhookReviewQaHandoffLockedArchiveExport | null;
  reviewQaHandoffLockedArchiveExportLoading?: boolean;
  reviewQaHandoffLockedArchiveExportError?: string;
  reviewQaHandoffRetentionManifest?: ProviderWebhookReviewQaHandoffRetentionManifest | null;
  reviewQaHandoffRetentionManifestLoading?: boolean;
  reviewQaHandoffRetentionManifestError?: string;
  reviewQaHandoffArchiveIntegrity?: ProviderWebhookReviewQaHandoffArchiveIntegrity | null;
  reviewQaHandoffArchiveIntegrityLoading?: boolean;
  reviewQaHandoffArchiveIntegrityError?: string;
  reviewQaHandoffRetentionAudit?: ProviderWebhookReviewQaHandoffRetentionAudit | null;
  reviewQaHandoffRetentionAuditLoading?: boolean;
  reviewQaHandoffRetentionAuditError?: string;
  reviewQaHandoffArchiveFinalization?: ProviderWebhookReviewQaHandoffArchiveFinalization | null;
  reviewQaHandoffArchiveFinalizationLoading?: boolean;
  reviewQaHandoffArchiveFinalizationError?: string;
  reviewQaHandoffArchiveFinalizationSignOff?: ProviderWebhookReviewQaHandoffFinalizationSignOffResponse | null;
  reviewQaHandoffArchiveFinalizationSignOffLoading?: boolean;
  reviewQaHandoffArchiveFinalizationSignOffError?: string;
  reviewQaHandoffArchiveFinalizationReceipt?: ProviderWebhookReviewQaHandoffFinalizationReceipt | null;
  reviewQaHandoffArchiveFinalizationReceiptLoading?: boolean;
  reviewQaHandoffArchiveFinalizationReceiptError?: string;
  reviewQaHandoffArchiveReleaseEvidence?: ProviderWebhookReviewQaHandoffReleaseEvidence | null;
  reviewQaHandoffArchiveReleaseEvidenceLoading?: boolean;
  reviewQaHandoffArchiveReleaseEvidenceError?: string;
  reviewQaHandoffArchiveReleaseVerification?: ProviderWebhookReviewQaHandoffReleaseVerification | null;
  reviewQaHandoffArchiveReleaseVerificationLoading?: boolean;
  reviewQaHandoffArchiveReleaseVerificationError?: string;
  reviewQaHandoffArchiveReleaseCertification?: ProviderWebhookReviewQaHandoffReleaseCertification | null;
  reviewQaHandoffArchiveReleaseCertificationLoading?: boolean;
  reviewQaHandoffArchiveReleaseCertificationError?: string;
  reviewQaHandoffArchiveReleaseClosureLedger?: ProviderWebhookReviewQaHandoffReleaseClosureLedger | null;
  reviewQaHandoffArchiveReleaseClosureLedgerLoading?: boolean;
  reviewQaHandoffArchiveReleaseClosureLedgerError?: string;
  reviewQaHandoffArchiveReleaseAttestationAudit?: ProviderWebhookReviewQaHandoffReleaseAttestationAudit | null;
  reviewQaHandoffArchiveReleaseAttestationAuditLoading?: boolean;
  reviewQaHandoffArchiveReleaseAttestationAuditError?: string;
  reviewQaHandoffArchiveReleaseAttestationReconciliation?: ProviderWebhookReviewQaHandoffReleaseAttestationReconciliationRegister | null;
  reviewQaHandoffArchiveReleaseAttestationReconciliationLoading?: boolean;
  reviewQaHandoffArchiveReleaseAttestationReconciliationError?: string;
  reviewQaHandoffCertifiedReleaseGate?: ProviderWebhookReviewQaHandoffCertifiedReleaseGate | null;
  reviewQaHandoffCertifiedReleaseGateLoading?: boolean;
  reviewQaHandoffCertifiedReleaseGateError?: string;
  reviewQaHandoffCertifiedReleaseDecisionReceipt?: ProviderWebhookReviewQaHandoffCertifiedReleaseDecisionReceipt | null;
  reviewQaHandoffCertifiedReleaseDecisionReceiptLoading?: boolean;
  reviewQaHandoffCertifiedReleaseDecisionReceiptError?: string;
  reviewQaHandoffCertifiedReleaseHandoffPacket?: ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket | null;
  reviewQaHandoffCertifiedReleaseHandoffPacketLoading?: boolean;
  reviewQaHandoffCertifiedReleaseHandoffPacketError?: string;
  reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord?: ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord | null;
  reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordLoading?: boolean;
  reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordAcknowledging?: boolean;
  reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordError?: string;
  reviewClosureReportRedactionAudit?: ProviderWebhookReviewExportRedactionAudit | null;
  reviewClosureReportRedactionAuditLoading?: boolean;
  reviewClosureReportRedactionAuditError?: string;
  reviewClosureExportIntegrity?: ProviderWebhookReviewExportIntegrity | null;
  reviewClosureExportIntegrityLoading?: boolean;
  reviewClosureExportIntegrityError?: string;
  reviewSavedViews?: ProviderWebhookReviewSavedView[];
  reviewSavedViewsLoading?: boolean;
  reviewSavedViewsError?: string;
  reviewSavedViewSaving?: boolean;
  reviewSavedViewActionStatus?: string;
  activeDiagnosticsId?: string;
  activeDiagnostics?: ProviderWebhookUnmatchedInboundDiagnostics | null;
  diagnosticsLoadingId?: string;
  diagnosticsErrorById?: Record<string, string>;
  activeClosureEvidenceId?: string;
  activeClosureEvidence?: ProviderWebhookReviewClosureEvidence | null;
  closureEvidenceLoadingId?: string;
  closureEvidenceErrorById?: Record<string, string>;
  activeClosureEvidenceExportId?: string;
  activeClosureEvidenceExport?: ProviderWebhookReviewClosureEvidenceExport | null;
  closureEvidenceExportLoadingId?: string;
  closureEvidenceExportErrorById?: Record<string, string>;
  activeClosureEvidenceExportManifestId?: string;
  activeClosureEvidenceExportManifest?: ProviderWebhookReviewExportManifest | null;
  closureEvidenceExportManifestLoadingId?: string;
  closureEvidenceExportManifestErrorById?: Record<string, string>;
  activeClosureEvidenceRedactionAuditId?: string;
  activeClosureEvidenceRedactionAudit?: ProviderWebhookReviewExportRedactionAudit | null;
  closureEvidenceRedactionAuditLoadingId?: string;
  closureEvidenceRedactionAuditErrorById?: Record<string, string>;
  activeHistoryId?: string;
  activeHistory?: ProviderWebhookUnmatchedInboundHistory | null;
  historyLoadingId?: string;
  historyErrorById?: Record<string, string>;
  operatorNotesById?: Record<string, ProviderWebhookOperatorNote[]>;
  operatorNotesLoadingId?: string;
  operatorNotesErrorById?: Record<string, string>;
  operatorNoteSavingId?: string;
  unmatchedExportResult?: ProviderWebhookUnmatchedInboundExport | null;
  unmatchedExportLoadingFormat?: "" | ProviderWebhookUnmatchedInboundExportFormat;
  unmatchedExportError?: string;
  candidateItemsById?: Record<string, ProviderWebhookCandidateConversation[]>;
  candidateErrorById?: Record<string, string>;
  candidateLoadingId?: string;
  webhookEventSaving?: boolean;
  onUnmatchedFiltersChange?: (filters: ProviderWebhookUnmatchedInboundFilters) => void;
  onUnmatchedSelectionChange?: (ids: string[]) => void;
  onCreateSandboxEvent?: (payload: ProviderWebhookSandboxEventRequest) => Promise<void>;
  onReviewUnmatchedInbound?: (unmatchedInboundId: string, status: "reviewed" | "skipped") => Promise<void>;
  onBulkReviewUnmatchedInbound?: (status: "reviewed" | "skipped") => Promise<void>;
  onAssignUnmatchedInbound?: (unmatchedInboundId: string, operation: "ASSIGN_TO_ME" | "ASSIGN_TO_OPERATOR" | "UNASSIGN", assignedToOperatorLabel?: string) => Promise<void>;
  onEscalateUnmatchedInbound?: (unmatchedInboundId: string, operation: "ESCALATE" | "CLEAR_ESCALATION", escalationReason?: ProviderWebhookReviewEscalationReason) => Promise<void>;
  onResolveUnmatchedInbound?: (unmatchedInboundId: string, operation: "SET_RESOLUTION" | "CLEAR_RESOLUTION", resolutionOutcome?: ProviderWebhookReviewResolutionOutcome) => Promise<void>;
  onUpdateResolutionChecklist?: (unmatchedInboundId: string, operation: "COMPLETE_STEP" | "UNCOMPLETE_STEP" | "RESET_CHECKLIST", step?: ProviderWebhookReviewClosureChecklistStep) => Promise<void>;
  onBulkAssignUnmatchedInbound?: (operation: "ASSIGN_TO_ME" | "UNASSIGN") => Promise<void>;
  onBulkEscalateUnmatchedInbound?: (operation: "ESCALATE" | "CLEAR_ESCALATION") => Promise<void>;
  onBulkResolveUnmatchedInbound?: (operation: "SET_RESOLUTION" | "CLEAR_RESOLUTION" | "COMPLETE_STEP" | "RESET_CHECKLIST") => Promise<void>;
  onLinkUnmatchedInbound?: (unmatchedInboundId: string, conversationId: string, actionMode: "link-only" | "link-and-persist-safe-message") => Promise<void>;
  onCreateSavedView?: (name: string, description: string, pinned: boolean, isDefault: boolean) => Promise<void>;
  onApplySavedView?: (savedView: ProviderWebhookReviewSavedView) => void;
  onArchiveSavedView?: (savedViewId: string) => Promise<void>;
  onLoadCandidates?: (unmatchedInboundId: string) => Promise<void>;
  onLoadDiagnostics?: (unmatchedInboundId: string) => Promise<void>;
  onLoadClosureEvidence?: (unmatchedInboundId: string) => Promise<void>;
  onExportClosureEvidence?: (unmatchedInboundId: string) => Promise<void>;
  onLoadClosureEvidenceExportManifest?: (unmatchedInboundId: string) => Promise<void>;
  onLoadClosureEvidenceRedactionAudit?: (unmatchedInboundId: string) => Promise<void>;
  onExportClosureReport?: () => Promise<void>;
  onLoadClosureReportExportManifest?: () => Promise<void>;
  onLoadReviewQaHandoffBundle?: () => Promise<void>;
  onExportReviewQaHandoffBundle?: () => Promise<void>;
  onLoadReviewQaHandoffReceipt?: () => Promise<void>;
  onSignOffReviewQaHandoffReceipt?: () => Promise<void>;
  onLoadReviewQaHandoffAcceptanceLock?: () => Promise<void>;
  onLockReviewQaHandoffAcceptance?: () => Promise<void>;
  onLoadReviewQaHandoffLockedArchive?: () => Promise<void>;
  onExportReviewQaHandoffLockedArchive?: () => Promise<void>;
  onLoadReviewQaHandoffRetentionManifest?: () => Promise<void>;
  onLoadReviewQaHandoffArchiveIntegrity?: () => Promise<void>;
  onLoadReviewQaHandoffRetentionAudit?: () => Promise<void>;
  onLoadReviewQaHandoffArchiveFinalization?: () => Promise<void>;
  onSignOffReviewQaHandoffArchiveFinalization?: () => Promise<void>;
  onLoadReviewQaHandoffArchiveFinalizationReceipt?: () => Promise<void>;
  onLoadReviewQaHandoffArchiveReleaseEvidence?: () => Promise<void>;
  onLoadReviewQaHandoffArchiveReleaseVerification?: () => Promise<void>;
  onLoadReviewQaHandoffArchiveReleaseCertification?: () => Promise<void>;
  onLoadReviewQaHandoffArchiveReleaseClosureLedger?: () => Promise<void>;
  onLoadReviewQaHandoffArchiveReleaseAttestationAudit?: () => Promise<void>;
  onLoadReviewQaHandoffArchiveReleaseAttestationReconciliation?: () => Promise<void>;
  onLoadReviewQaHandoffCertifiedReleaseGate?: () => Promise<void>;
  onLoadReviewQaHandoffCertifiedReleaseDecisionReceipt?: () => Promise<void>;
  onLoadReviewQaHandoffCertifiedReleaseHandoffPacket?: () => Promise<void>;
  onLoadReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord?: () => Promise<void>;
  onAcknowledgeReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord?: () => Promise<void>;
  onLoadClosureReportRedactionAudit?: () => Promise<void>;
  onLoadClosureExportIntegrity?: () => Promise<void>;
  onLoadHistory?: (unmatchedInboundId: string) => Promise<void>;
  onLoadOperatorNotes?: (unmatchedInboundId: string) => Promise<void>;
  onCreateOperatorNote?: (unmatchedInboundId: string, note: string) => Promise<void>;
  onExportUnmatchedInbound?: (format: ProviderWebhookUnmatchedInboundExportFormat) => Promise<void>;
};

const providers = ["line", "telegram", "facebook", "instagram"] as const;
type ProviderOption = (typeof providers)[number];
const eventTypes: ProviderWebhookEventType[] = ["message.created", "webhook.verified", "webhook.failed"];
const reviewStatuses = ["pending", "reviewed", "skipped", "linked"] as const;
const linkStatuses = ["none", "rejected", "linked", "linked-message-persisted", "duplicate-noop"] as const;
const unmatchedStatuses = ["open", "review-needed", "reviewed", "blocked", "skipped", "linked", "duplicate-skipped"] as const;
const queueStatuses = ["open", "reviewed", "blocked", "skipped", "linked"] as const;
const assignmentStatuses = ["unassigned", "assigned", "assigned_to_me", "assigned_to_others"] as const;
const escalationStatuses = ["none", "escalated"] as const;
const escalationReasons: ProviderWebhookReviewEscalationReason[] = ["SLA_RISK", "NO_SAFE_CANDIDATE", "ROUTING_FAILED", "HIGH_PRIORITY_CUSTOMER", "NEEDS_MANAGER_REVIEW", "MANUAL_REVIEW_BLOCKED"];
const resolutionStatuses = ["unresolved", "resolved"] as const;
const resolutionOutcomes: ProviderWebhookReviewResolutionOutcome[] = [
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
];
const closureReadinessValues = ["NOT_READY", "READY_FOR_REVIEW", "READY_FOR_SKIP", "READY_FOR_LINK", "READY_FOR_LINK_AND_PERSIST", "ALREADY_REVIEWED", "BLOCKED"] as const;
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
const pageSizes = [5, 10, 25, 50] as const;

export function ProviderReadinessPanel({
  readiness,
  loading,
  error,
  webhookEvents = [],
  webhookEventsLoading = false,
  webhookEventsError = "",
  unmatchedInboundItems = [],
  unmatchedFilters = {},
  unmatchedPagination = null,
  unmatchedAppliedSort = null,
  unmatchedPageSummary = null,
  selectedUnmatchedIds = [],
  unmatchedInboundLoading = false,
  unmatchedInboundError = "",
  unmatchedActionSavingId = "",
  unmatchedActionStatus = "",
  unmatchedBulkSavingStatus = "",
  unmatchedBulkResult = null,
  unmatchedBulkMetadataSavingStatus = "",
  unmatchedBulkMetadataResult = null,
  unmatchedBulkResolutionResult = null,
  reviewMetrics = null,
  reviewMetricsLoading = false,
  reviewMetricsError = "",
  reviewAlerts = null,
  reviewAlertsLoading = false,
  reviewAlertsError = "",
  reviewTriage = null,
  reviewTriageLoading = false,
  reviewTriageError = "",
  reviewWorkload = null,
  reviewWorkloadLoading = false,
  reviewWorkloadError = "",
  reviewResolutionSummary = null,
  reviewResolutionSummaryLoading = false,
  reviewResolutionSummaryError = "",
  reviewClosureReport = null,
  reviewClosureReportLoading = false,
  reviewClosureReportError = "",
  reviewClosureReportExport = null,
  reviewClosureReportExportLoading = false,
  reviewClosureReportExportError = "",
  reviewClosureReportExportManifest = null,
  reviewClosureReportExportManifestLoading = false,
  reviewClosureReportExportManifestError = "",
  reviewQaHandoffBundle = null,
  reviewQaHandoffBundleLoading = false,
  reviewQaHandoffBundleError = "",
  reviewQaHandoffBundleExport = null,
  reviewQaHandoffBundleExportLoading = false,
  reviewQaHandoffBundleExportError = "",
  reviewQaHandoffReceipt = null,
  reviewQaHandoffReceiptLoading = false,
  reviewQaHandoffReceiptError = "",
  reviewQaHandoffSignOff = null,
  reviewQaHandoffSignOffLoading = false,
  reviewQaHandoffSignOffError = "",
  reviewQaHandoffAcceptanceLock = null,
  reviewQaHandoffAcceptanceLockLoading = false,
  reviewQaHandoffAcceptanceLockError = "",
  reviewQaHandoffLockedArchive = null,
  reviewQaHandoffLockedArchiveLoading = false,
  reviewQaHandoffLockedArchiveError = "",
  reviewQaHandoffLockedArchiveExport = null,
  reviewQaHandoffLockedArchiveExportLoading = false,
  reviewQaHandoffLockedArchiveExportError = "",
  reviewQaHandoffRetentionManifest = null,
  reviewQaHandoffRetentionManifestLoading = false,
  reviewQaHandoffRetentionManifestError = "",
  reviewQaHandoffArchiveIntegrity = null,
  reviewQaHandoffArchiveIntegrityLoading = false,
  reviewQaHandoffArchiveIntegrityError = "",
  reviewQaHandoffRetentionAudit = null,
  reviewQaHandoffRetentionAuditLoading = false,
  reviewQaHandoffRetentionAuditError = "",
  reviewQaHandoffArchiveFinalization = null,
  reviewQaHandoffArchiveFinalizationLoading = false,
  reviewQaHandoffArchiveFinalizationError = "",
  reviewQaHandoffArchiveFinalizationSignOff = null,
  reviewQaHandoffArchiveFinalizationSignOffLoading = false,
  reviewQaHandoffArchiveFinalizationSignOffError = "",
  reviewQaHandoffArchiveFinalizationReceipt = null,
  reviewQaHandoffArchiveFinalizationReceiptLoading = false,
  reviewQaHandoffArchiveFinalizationReceiptError = "",
  reviewQaHandoffArchiveReleaseEvidence = null,
  reviewQaHandoffArchiveReleaseEvidenceLoading = false,
  reviewQaHandoffArchiveReleaseEvidenceError = "",
  reviewQaHandoffArchiveReleaseVerification = null,
  reviewQaHandoffArchiveReleaseVerificationLoading = false,
  reviewQaHandoffArchiveReleaseVerificationError = "",
  reviewQaHandoffArchiveReleaseCertification = null,
  reviewQaHandoffArchiveReleaseCertificationLoading = false,
  reviewQaHandoffArchiveReleaseCertificationError = "",
  reviewQaHandoffArchiveReleaseClosureLedger = null,
  reviewQaHandoffArchiveReleaseClosureLedgerLoading = false,
  reviewQaHandoffArchiveReleaseClosureLedgerError = "",
  reviewQaHandoffArchiveReleaseAttestationAudit = null,
  reviewQaHandoffArchiveReleaseAttestationAuditLoading = false,
  reviewQaHandoffArchiveReleaseAttestationAuditError = "",
  reviewQaHandoffArchiveReleaseAttestationReconciliation = null,
  reviewQaHandoffArchiveReleaseAttestationReconciliationLoading = false,
  reviewQaHandoffArchiveReleaseAttestationReconciliationError = "",
  reviewQaHandoffCertifiedReleaseGate = null,
  reviewQaHandoffCertifiedReleaseGateLoading = false,
  reviewQaHandoffCertifiedReleaseGateError = "",
  reviewQaHandoffCertifiedReleaseDecisionReceipt = null,
  reviewQaHandoffCertifiedReleaseDecisionReceiptLoading = false,
  reviewQaHandoffCertifiedReleaseDecisionReceiptError = "",
  reviewQaHandoffCertifiedReleaseHandoffPacket = null,
  reviewQaHandoffCertifiedReleaseHandoffPacketLoading = false,
  reviewQaHandoffCertifiedReleaseHandoffPacketError = "",
  reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord = null,
  reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordLoading = false,
  reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordAcknowledging = false,
  reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordError = "",
  reviewClosureReportRedactionAudit = null,
  reviewClosureReportRedactionAuditLoading = false,
  reviewClosureReportRedactionAuditError = "",
  reviewClosureExportIntegrity = null,
  reviewClosureExportIntegrityLoading = false,
  reviewClosureExportIntegrityError = "",
  reviewSavedViews = [],
  reviewSavedViewsLoading = false,
  reviewSavedViewsError = "",
  reviewSavedViewSaving = false,
  reviewSavedViewActionStatus = "",
  activeDiagnosticsId = "",
  activeDiagnostics = null,
  diagnosticsLoadingId = "",
  diagnosticsErrorById = {},
  activeClosureEvidenceId = "",
  activeClosureEvidence = null,
  closureEvidenceLoadingId = "",
  closureEvidenceErrorById = {},
  activeClosureEvidenceExportId = "",
  activeClosureEvidenceExport = null,
  closureEvidenceExportLoadingId = "",
  closureEvidenceExportErrorById = {},
  activeClosureEvidenceExportManifestId = "",
  activeClosureEvidenceExportManifest = null,
  closureEvidenceExportManifestLoadingId = "",
  closureEvidenceExportManifestErrorById = {},
  activeClosureEvidenceRedactionAuditId = "",
  activeClosureEvidenceRedactionAudit = null,
  closureEvidenceRedactionAuditLoadingId = "",
  closureEvidenceRedactionAuditErrorById = {},
  activeHistoryId = "",
  activeHistory = null,
  historyLoadingId = "",
  historyErrorById = {},
  operatorNotesById = {},
  operatorNotesLoadingId = "",
  operatorNotesErrorById = {},
  operatorNoteSavingId = "",
  unmatchedExportResult = null,
  unmatchedExportLoadingFormat = "",
  unmatchedExportError = "",
  candidateItemsById = {},
  candidateErrorById = {},
  candidateLoadingId = "",
  webhookEventSaving = false,
  onUnmatchedFiltersChange,
  onUnmatchedSelectionChange,
  onCreateSandboxEvent,
  onReviewUnmatchedInbound,
  onBulkReviewUnmatchedInbound,
  onAssignUnmatchedInbound,
  onEscalateUnmatchedInbound,
  onResolveUnmatchedInbound,
  onUpdateResolutionChecklist,
  onBulkAssignUnmatchedInbound,
  onBulkEscalateUnmatchedInbound,
  onBulkResolveUnmatchedInbound,
  onLinkUnmatchedInbound,
  onCreateSavedView,
  onApplySavedView,
  onArchiveSavedView,
  onLoadCandidates,
  onLoadDiagnostics,
  onLoadClosureEvidence,
  onExportClosureEvidence,
  onLoadClosureEvidenceExportManifest,
  onLoadClosureEvidenceRedactionAudit,
  onExportClosureReport,
  onLoadClosureReportExportManifest,
  onLoadReviewQaHandoffBundle,
  onExportReviewQaHandoffBundle,
  onLoadReviewQaHandoffReceipt,
  onSignOffReviewQaHandoffReceipt,
  onLoadReviewQaHandoffAcceptanceLock,
  onLockReviewQaHandoffAcceptance,
  onLoadReviewQaHandoffLockedArchive,
  onExportReviewQaHandoffLockedArchive,
  onLoadReviewQaHandoffRetentionManifest,
  onLoadReviewQaHandoffArchiveIntegrity,
  onLoadReviewQaHandoffRetentionAudit,
  onLoadReviewQaHandoffArchiveFinalization,
  onSignOffReviewQaHandoffArchiveFinalization,
  onLoadReviewQaHandoffArchiveFinalizationReceipt,
  onLoadReviewQaHandoffArchiveReleaseEvidence,
  onLoadReviewQaHandoffArchiveReleaseVerification,
  onLoadReviewQaHandoffArchiveReleaseCertification,
  onLoadReviewQaHandoffArchiveReleaseClosureLedger,
  onLoadReviewQaHandoffArchiveReleaseAttestationAudit,
  onLoadReviewQaHandoffArchiveReleaseAttestationReconciliation,
  onLoadReviewQaHandoffCertifiedReleaseGate,
  onLoadReviewQaHandoffCertifiedReleaseDecisionReceipt,
  onLoadReviewQaHandoffCertifiedReleaseHandoffPacket,
  onLoadReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord,
  onAcknowledgeReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord,
  onLoadClosureReportRedactionAudit,
  onLoadClosureExportIntegrity,
  onLoadHistory,
  onLoadOperatorNotes,
  onCreateOperatorNote,
  onExportUnmatchedInbound
}: ProviderReadinessPanelProps) {
  const [provider, setProvider] = useState<ProviderOption>("line");
  const [eventType, setEventType] = useState<ProviderWebhookEventType>("message.created");
  const [eventId, setEventId] = useState("sandbox-event-001");
  const [deliveryId, setDeliveryId] = useState("");
  const [signature, setSignature] = useState("");
  const [inboundPersistenceMode, setInboundPersistenceMode] = useState<ProviderWebhookInboundPersistenceMode>("dry-run");
  const [linkConversationIds, setLinkConversationIds] = useState<Record<string, string>>({});
  const [savedViewName, setSavedViewName] = useState("Current review queue");
  const [savedViewDescription, setSavedViewDescription] = useState("");
  const [savedViewPinned, setSavedViewPinned] = useState(false);
  const [savedViewDefault, setSavedViewDefault] = useState(false);
  const [operatorNoteDrafts, setOperatorNoteDrafts] = useState<Record<string, string>>({});
  const lastEvent = webhookEvents[0] ?? null;
  const replayDetectedCount = readiness?.replayDetectedCount ?? webhookEvents.filter((event) => event.replayDetected).length;
  const queueSummary = summarizeUnmatchedQueue(unmatchedInboundItems);
  const selectedUnmatchedSet = new Set(selectedUnmatchedIds);
  const selectableVisibleItems = unmatchedInboundItems.filter(isOpenUnmatchedItem);
  const allVisibleSelected = selectableVisibleItems.length > 0 && selectableVisibleItems.every((item) => selectedUnmatchedSet.has(item.id));
  const pagination = unmatchedPagination ?? {
    totalCount: unmatchedInboundItems.length,
    limit: unmatchedFilters.limit ?? (unmatchedInboundItems.length || 10),
    offset: unmatchedFilters.offset ?? 0,
    returnedCount: unmatchedInboundItems.length,
    hasNextPage: false,
    hasPreviousPage: false
  };
  const appliedSort = unmatchedAppliedSort ?? {
    sortBy: unmatchedFilters.sortBy ?? "receivedAt",
    sortOrder: unmatchedFilters.sortOrder ?? "desc"
  };

  async function submitSandboxEvent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onCreateSandboxEvent?.({
      provider,
      channel: provider,
      eventType,
      mode: inboundPersistenceMode === "sandbox-persist" ? "sandbox" : "dry_run",
      status: eventType === "webhook.failed" ? "failed" : eventType === "webhook.verified" ? "verified" : "received",
      eventId: eventId.trim() || undefined,
      deliveryId: deliveryId.trim() || undefined,
      timestamp: new Date().toISOString(),
      signature: signature.trim() || undefined,
      inboundPersistenceMode,
      payload: {
        sample: true,
        source: "settings-provider-readiness-panel"
      }
    });
    setSignature("");
  }

  function updateQueueFilters(next: ProviderWebhookUnmatchedInboundFilters) {
    onUnmatchedFiltersChange?.({
      ...unmatchedFilters,
      ...next,
      offset: next.offset ?? 0
    });
  }

  async function submitSavedView(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = savedViewName.trim();
    if (!name || !onCreateSavedView) return;
    await onCreateSavedView(name, savedViewDescription, savedViewPinned, savedViewDefault);
  }

  async function submitOperatorNote(unmatchedInboundId: string) {
    const note = (operatorNoteDrafts[unmatchedInboundId] ?? "").trim();
    if (!note || !onCreateOperatorNote) return;
    await onCreateOperatorNote(unmatchedInboundId, note);
    setOperatorNoteDrafts((current) => ({ ...current, [unmatchedInboundId]: "" }));
  }

  function selectVisibleUnmatchedItems() {
    onUnmatchedSelectionChange?.(selectableVisibleItems.map((item) => item.id));
  }

  function clearUnmatchedSelection() {
    onUnmatchedSelectionChange?.([]);
  }

  function toggleUnmatchedSelection(id: string, checked: boolean) {
    if (checked) {
      onUnmatchedSelectionChange?.(Array.from(new Set([...selectedUnmatchedIds, id])));
      return;
    }
    onUnmatchedSelectionChange?.(selectedUnmatchedIds.filter((itemId) => itemId !== id));
  }

  function moveUnmatchedPage(direction: "previous" | "next") {
    const offset = direction === "previous"
      ? Math.max(0, pagination.offset - pagination.limit)
      : pagination.offset + pagination.limit;
    updateQueueFilters({ offset });
  }

  function metricFilterButton(label: string, value: number, filters: ProviderWebhookUnmatchedInboundFilters) {
    return e("button", {
      key: label,
      className: "webhookMetricButton",
      type: "button",
      disabled: !onUnmatchedFiltersChange,
      onClick: () => updateQueueFilters(filters)
    },
      e("span", null, label),
      e("strong", null, String(value))
    );
  }

  function metricCountGroup(
    title: string,
    items: ProviderWebhookReviewMetrics["byProvider"],
    toFilters: (key: string) => ProviderWebhookUnmatchedInboundFilters
  ) {
    return e("div", { className: "webhookMetricGroup" },
      e("strong", null, title),
      e("div", null,
        ...items.map((item) => metricFilterButton(item.label, item.count, toFilters(item.key)))
      )
    );
  }

  function triageActionControl(action: ProviderWebhookReviewTriage["topItems"][number]["recommendedNextActions"][number], item: ProviderWebhookReviewTriage["topItems"][number]) {
    if (action === "OPEN_DIAGNOSTICS") {
      return e("button", {
        key: `${item.unmatchedId}-${action}`,
        className: "webhookEventButton",
        type: "button",
        disabled: !item.diagnosticsAvailable || diagnosticsLoadingId === item.unmatchedId || !onLoadDiagnostics,
        onClick: () => void onLoadDiagnostics?.(item.unmatchedId)
      },
        e(Activity, { size: 15 }),
        diagnosticsLoadingId === item.unmatchedId ? "Loading diagnostics..." : "Open diagnostics"
      );
    }
    if (action === "VIEW_HISTORY") {
      return e("button", {
        key: `${item.unmatchedId}-${action}`,
        className: "webhookEventButton",
        type: "button",
        disabled: !item.historyAvailable || historyLoadingId === item.unmatchedId || !onLoadHistory,
        onClick: () => void onLoadHistory?.(item.unmatchedId)
      },
        e(FileClock, { size: 15 }),
        historyLoadingId === item.unmatchedId ? "Loading history..." : "View history"
      );
    }
    if (action === "RUN_CANDIDATE_LOOKUP") {
      return e("button", {
        key: `${item.unmatchedId}-${action}`,
        className: "webhookEventButton",
        type: "button",
        disabled: !item.candidatesAvailable || candidateLoadingId === item.unmatchedId || !onLoadCandidates,
        onClick: () => void onLoadCandidates?.(item.unmatchedId)
      },
        e(Search, { size: 15 }),
        candidateLoadingId === item.unmatchedId ? "Loading candidates..." : "Run candidate lookup"
      );
    }
    if (action === "APPLY_FILTER") {
      return e("button", {
        key: `${item.unmatchedId}-${action}`,
        className: "webhookEventButton",
        type: "button",
        disabled: !onUnmatchedFiltersChange,
        onClick: () => updateQueueFilters({
          provider: item.provider,
          eventType: item.eventType,
          reviewStatus: item.reviewStatus,
          linkStatus: item.linkStatus,
          unmatchedStatus: item.unmatchedStatus
        })
      }, "Apply queue filter");
    }
    return e("span", { key: `${item.unmatchedId}-${action}`, className: "webhookWarningPill" }, action);
  }

  return e("section", { className: "providerReadinessPanel", "aria-label": "Provider sandbox and webhook readiness" },
    e("div", { className: "providerReadinessHeader" },
      e("div", { className: "channelPanelTop" },
        e(ShieldCheck, { size: 20 }),
        e("div", null,
          e("h2", null, "Provider sandbox readiness"),
          e("p", null, "Safe configuration summary only. No token, secret, payload, or allowlist value is displayed.")
        )
      ),
      readiness ? e("div", { className: "providerReadinessSummary", "aria-label": "Provider readiness summary" },
        e("span", null, `provider mode: ${readiness.mode}`),
        e("span", null, `sandbox mode: ${readiness.sandboxMode}`),
        e("span", null, `realOutboundEnabled=${String(readiness.realOutboundEnabled)}`),
        e("span", null, `externalCalls=${readiness.externalCalls}`),
        e("span", null, `allowlist count=${readiness.allowlistCount}`),
        e("span", null, `signature verification=${readiness.webhookSignatureVerificationReady ? "sandbox-ready" : "not ready"}`),
        e("span", null, `replay guardrails=${readiness.replayGuardrailsEnabled ? "enabled" : "disabled"}`),
        e("span", null, `normalization=${readiness.webhookNormalizationEnabled ? "enabled" : "disabled"}`),
        e("span", null, `dryRunRouting=${readiness.webhookDryRunRoutingEnabled ? "enabled" : "disabled"}`),
        e("span", null, `latest signature=${readiness.lastSandboxEventSignatureStatus ?? "none"}`),
        e("span", null, `latest replay=${readiness.latestReplayStatus ?? "none"}`),
        e("span", null, `latest normalization=${readiness.lastSandboxEventNormalizationStatus ?? "none"}`),
        e("span", null, `latest routing=${readiness.latestRoutingStatus ?? "none"}`),
        e("span", null, `normalizedEventCount=${readiness.normalizedEventCount}`),
        e("span", null, `routingBlockedCount=${readiness.routingBlockedCount}`),
        e("span", null, `inbound persistence=${readiness.webhookInboundPersistenceEnabled ? "enabled" : "disabled"}`),
        e("span", null, `latest inbound persistence=${readiness.latestInboundPersistenceStatus ?? "none"}`),
        e("span", null, `persistedInboundMessageCount=${readiness.persistedInboundMessageCount}`),
        e("span", null, `inboundPersistenceBlockedCount=${readiness.inboundPersistenceBlockedCount}`),
        e("span", null, `inboundPersistenceReplayBlockedCount=${readiness.inboundPersistenceReplayBlockedCount}`),
        e("span", null, `inboundPersistenceSkippedNoMatchCount=${readiness.inboundPersistenceSkippedNoMatchCount}`),
        e("span", null, `unmatched inbound review=${readiness.webhookUnmatchedInboundReviewEnabled ? "enabled" : "disabled"}`),
        e("span", null, `review actions=${readiness.webhookUnmatchedReviewActionsEnabled ? "enabled" : "disabled"}`),
        e("span", null, `candidate lookup=${readiness.webhookCandidateLookupEnabled ? "enabled" : "disabled"}`),
        e("span", null, `history audit=${readiness.webhookUnmatchedHistoryEnabled ? "enabled" : "disabled"}`),
        e("span", null, `queue export=${readiness.webhookUnmatchedQueueExportEnabled ? "enabled" : "disabled"}`),
        e("span", null, `export max limit=${readiness.webhookUnmatchedQueueExportMaxLimit}`),
        e("span", null, `review metrics=${readiness.webhookReviewMetricsEnabled ? "enabled" : "disabled"}`),
        e("span", null, `diagnostics=${readiness.webhookDiagnosticsEnabled ? "enabled" : "disabled"}`),
        e("span", null, `review alerts=${readiness.webhookReviewAlertsEnabled ? "enabled" : "disabled"}`),
        e("span", null, `queue health=${readiness.webhookReviewQueueHealthEnabled ? "enabled" : "disabled"}`),
        e("span", null, `review triage=${readiness.reviewTriageEnabled ? "enabled" : "disabled"}`),
        e("span", null, `triage guidance=${readiness.triageGuidanceEnabled ? "enabled" : "disabled"}`),
        e("span", null, `saved views=${readiness.reviewSavedViewsEnabled ? "enabled" : "disabled"}`),
        e("span", null, `operator notes=${readiness.operatorNotesEnabled ? "enabled" : "disabled"}`),
        e("span", null, `assignment=${readiness.reviewAssignmentEnabled ? "enabled" : "disabled"}`),
        e("span", null, `escalation=${readiness.reviewEscalationEnabled ? "enabled" : "disabled"}`),
        e("span", null, `assignment workload=${readiness.assignmentWorkloadEnabled ? "enabled" : "disabled"}`),
        e("span", null, `review resolution=${readiness.reviewResolutionEnabled ? "enabled" : "disabled"}`),
        e("span", null, `closure checklist=${readiness.reviewClosureChecklistEnabled ? "enabled" : "disabled"}`),
        e("span", null, `resolution summary=${readiness.resolutionSummaryEnabled ? "enabled" : "disabled"}`),
        e("span", null, `closure evidence=${readiness.reviewClosureEvidenceEnabled ? "enabled" : "disabled"}`),
        e("span", null, `closure report=${readiness.reviewClosureReportEnabled ? "enabled" : "disabled"}`),
        e("span", null, `closure evidence export=${readiness.reviewClosureEvidenceExportEnabled ? "enabled" : "disabled"}`),
        e("span", null, `closure report export=${readiness.reviewClosureReportExportEnabled ? "enabled" : "disabled"}`),
        e("span", null, `export redaction audit=${readiness.reviewExportRedactionAuditEnabled ? "enabled" : "disabled"}`),
        e("span", null, `export integrity checks=${readiness.reviewExportIntegrityChecksEnabled ? "enabled" : "disabled"}`),
        e("span", null, `export manifest=${readiness.reviewExportManifestEnabled ? "enabled" : "disabled"}`),
        e("span", null, `QA handoff=${readiness.reviewExportQaHandoffEnabled ? "enabled" : "disabled"}`),
        e("span", null, `QA locked archive=${readiness.reviewQaHandoffLockedArchiveEnabled ? "enabled" : "disabled"}`),
        e("span", null, `QA retention manifest=${readiness.reviewQaHandoffRetentionManifestEnabled ? "enabled" : "disabled"}`),
        e("span", null, `locked archive ready count=${readiness.lockedArchiveReadyCount}`),
        e("span", null, `locked archive exported count=${readiness.lockedArchiveExportedCount}`),
        e("span", null, `retention manifest ready count=${readiness.retentionManifestReadyCount}`),
        e("span", null, `latest locked archive status=${readiness.latestLockedArchiveStatus ?? "none"}`),
        e("span", null, `latest retention manifest status=${readiness.latestRetentionManifestStatus ?? "none"}`),
        e("span", null, `saved view count=${readiness.savedViewCount}`),
        e("span", null, `operator note count=${readiness.operatorNoteCount}`),
        e("span", null, `unassigned open count=${readiness.unassignedOpenCount}`),
        e("span", null, `assigned open count=${readiness.assignedOpenCount}`),
        e("span", null, `escalated open count=${readiness.escalatedOpenCount}`),
        e("span", null, `unresolved open count=${readiness.unresolvedOpenCount}`),
        e("span", null, `ready for closure count=${readiness.readyForClosureCount}`),
        e("span", null, `blocked resolution count=${readiness.blockedResolutionCount}`),
        e("span", null, `checklist incomplete open count=${readiness.checklistIncompleteOpenCount}`),
        e("span", null, `closure evidence ready count=${readiness.closureEvidenceReadyCount}`),
        e("span", null, `closure evidence blocked count=${readiness.closureEvidenceBlockedCount}`),
        e("span", null, `closure evidence incomplete count=${readiness.closureEvidenceIncompleteCount}`),
        e("span", null, `closure evidence export count=${readiness.closureEvidenceExportCount}`),
        e("span", null, `closure report export count=${readiness.closureReportExportCount}`),
        e("span", null, `export redaction passed count=${readiness.exportRedactionPassedCount}`),
        e("span", null, `export redaction warning count=${readiness.exportRedactionWarningCount}`),
        e("span", null, `export redaction blocked count=${readiness.exportRedactionBlockedCount}`),
        e("span", null, `export manifest ready count=${readiness.exportManifestReadyCount}`),
        e("span", null, `export manifest needs review count=${readiness.exportManifestNeedsReviewCount}`),
        e("span", null, `export manifest blocked count=${readiness.exportManifestBlockedCount}`),
        e("span", null, `latest export manifest status=${readiness.latestExportManifestStatus ?? "none"}`),
        e("span", null, `critical alert count=${readiness.reviewAlertCriticalCount}`),
        e("span", null, `critical triage count=${readiness.criticalTriageCount}`),
        e("span", null, `open triage count=${readiness.openTriageCount}`),
        e("span", null, `open unmatched count=${readiness.unmatchedInboundOpenCount}`),
        e("span", null, `stale open unmatched count=${readiness.unmatchedInboundStaleOpenCount}`),
        e("span", null, `unmatched queued count=${readiness.unmatchedInboundQueuedCount}`),
        e("span", null, `unmatched replay blocked count=${readiness.unmatchedInboundReplayBlockedCount}`),
        e("span", null, `reviewed unmatched count=${readiness.unmatchedInboundReviewedCount}`),
        e("span", null, `skipped unmatched count=${readiness.unmatchedInboundSkippedCount}`),
        e("span", null, `linked unmatched count=${readiness.unmatchedInboundLinkedCount}`),
        e("span", null, `latest unmatched status=${readiness.latestUnmatchedInboundStatus ?? "none"}`),
        e("span", null, `latest review action status=${readiness.latestUnmatchedReviewActionStatus ?? "none"}`),
        e("span", null, `latest link status=${readiness.latestUnmatchedLinkStatus ?? "none"}`),
        e("span", null, `replayDetectedCount=${replayDetectedCount}`)
      ) : null
    ),
    error ? e("div", { className: "apiErrorBox compact", role: "alert" }, error) : null,
    loading ? e("div", { className: "apiLoadingBox compact" }, "Loading provider readiness...") : null,
    !loading && !error && !readiness ? e("div", { className: "providerEmptyState" }, "No provider readiness data returned.") : null,
    readiness ? e("div", { className: "providerReadinessGrid" },
      ...readiness.providers.map((provider) => e(ProviderReadinessCard, { key: provider.name, provider }))
    ) : null,
    e("div", { className: "webhookEventSurface", "aria-label": "Provider webhook review metrics" },
      e("div", { className: "webhookEventHeader" },
        e("div", { className: "channelPanelTop" },
          e(BarChart3, { size: 18 }),
          e("div", null,
            e("h3", null, "Review metrics"),
            e("p", null, "Aggregate provider webhook review counts with safe drilldown filters.")
          )
        ),
        reviewMetrics ? e("div", { className: "webhookLastEvent", "aria-label": "Review metrics status" },
          e("span", null, "metrics generated"),
          e("strong", null, formatDate(reviewMetrics.generatedAt)),
          e("span", null, `externalCalls=${reviewMetrics.externalCalls}`),
          e("span", null, `applied filters=${formatAppliedFilters(reviewMetrics.appliedFilters)}`)
        ) : null
      ),
      reviewMetricsError ? e("div", { className: "apiErrorBox compact", role: "alert" }, reviewMetricsError) : null,
      reviewMetricsLoading ? e("div", { className: "apiLoadingBox compact" }, "Loading provider webhook review metrics...") : null,
      reviewMetrics ? e("div", { className: "webhookMetricsGrid" },
        metricFilterButton("total events", reviewMetrics.totalEvents, {}),
        metricFilterButton("total unmatched", reviewMetrics.totalUnmatched, {}),
        metricFilterButton("open unmatched", reviewMetrics.openUnmatched, { status: "open" }),
        metricFilterButton("reviewed", reviewMetrics.reviewedCount, { reviewStatus: "reviewed" }),
        metricFilterButton("skipped", reviewMetrics.skippedCount, { reviewStatus: "skipped" }),
        metricFilterButton("linked", reviewMetrics.linkedCount, { reviewStatus: "linked" }),
        metricFilterButton("persisted inbound", reviewMetrics.persistedInboundCount, {}),
        metricFilterButton("signature rejected", reviewMetrics.signatureRejectedCount, { eventType: "webhook.failed" })
      ) : !reviewMetricsLoading && !reviewMetricsError ? e("div", { className: "providerEmptyState" }, "No review metrics returned.") : null,
      reviewMetrics ? e("div", { className: "webhookMetricGroups" },
        metricCountGroup("By provider", reviewMetrics.byProvider, (key) => ({ provider: key as ProviderWebhookUnmatchedInboundFilters["provider"] })),
        metricCountGroup("By event type", reviewMetrics.byEventType, (key) => ({ eventType: key as ProviderWebhookEventType })),
        metricCountGroup("By review status", reviewMetrics.byReviewStatus, (key) => ({ reviewStatus: key as ProviderWebhookUnmatchedInboundFilters["reviewStatus"] })),
        metricCountGroup("By link status", reviewMetrics.byLinkStatus, (key) => ({ linkStatus: key as ProviderWebhookUnmatchedInboundFilters["linkStatus"] })),
        metricCountGroup("By unmatched status", reviewMetrics.byUnmatchedStatus, (key) => ({ unmatchedStatus: key as ProviderWebhookUnmatchedInboundFilters["unmatchedStatus"] }))
      ) : null,
      reviewMetrics ? e("div", { className: "webhookMetricGroups twoColumn" },
        e("div", { className: "webhookMetricGroup" },
          e("strong", null, "Open age buckets"),
          e("div", null,
            e("span", null, `under1Hour=${reviewMetrics.ageBuckets.under1Hour}`),
            e("span", null, `oneTo24Hours=${reviewMetrics.ageBuckets.oneTo24Hours}`),
            e("span", null, `oneTo3Days=${reviewMetrics.ageBuckets.oneTo3Days}`),
            e("span", null, `over3Days=${reviewMetrics.ageBuckets.over3Days}`)
          )
        ),
        e("div", { className: "webhookMetricGroup" },
          e("strong", null, "Safe review funnel"),
          e("div", null,
            e("span", null, `inbound received=${reviewMetrics.funnel.inboundReceived}`),
            e("span", null, `persisted=${reviewMetrics.funnel.persisted}`),
            e("span", null, `unmatched queued=${reviewMetrics.funnel.unmatchedQueued}`),
            e("span", null, `reviewed=${reviewMetrics.funnel.reviewed}`),
            e("span", null, `skipped=${reviewMetrics.funnel.skipped}`),
            e("span", null, `linked=${reviewMetrics.funnel.linked}`),
            e("span", null, `exported/history available=${reviewMetrics.funnel.exportedHistoryAvailable}`)
          )
        )
      ) : null
    ),
    e("div", { className: "webhookEventSurface", "aria-label": "Provider webhook review triage guidance" },
      e("div", { className: "webhookEventHeader" },
        e("div", { className: "channelPanelTop" },
          e(ListChecks, { size: 18 }),
          e("div", null,
            e("h3", null, "Triage lanes"),
            e("p", null, "Deterministic safe guidance only. Recommended actions do not run automatically.")
          )
        ),
        reviewTriage ? e("div", { className: "webhookLastEvent", "aria-label": "Review triage status" },
          e("span", null, "triage generated"),
          e("strong", null, formatDate(reviewTriage.generatedAt)),
          e("span", null, `externalCalls=${reviewTriage.externalCalls}`),
          e("span", null, `applied filters=${formatAppliedFilters(reviewTriage.appliedFilters)}`)
        ) : null
      ),
      reviewTriageError ? e("div", { className: "apiErrorBox compact", role: "alert" }, reviewTriageError) : null,
      reviewTriageLoading ? e("div", { className: "apiLoadingBox compact" }, "Loading provider webhook triage guidance...") : null,
      reviewTriage ? e("div", { className: "webhookMetricsGrid" },
        metricFilterButton("total triage items", reviewTriage.totalItems, {}),
        metricFilterButton("open triage items", reviewTriage.totalOpenItems, { status: "open" }),
        metricFilterButton("triage lanes", reviewTriage.totalTriageLanes, {}),
        metricFilterButton("top triage summaries", reviewTriage.topItems.length, {}),
        metricFilterButton("critical lane count", reviewTriage.byLane.find((item) => item.key === "critical_stale_open")?.count ?? 0, { status: "open" }),
        metricFilterButton("manual review", reviewTriage.byLane.find((item) => item.key === "needs_manual_review")?.count ?? 0, { status: "open", reviewStatus: "pending" }),
        metricFilterButton("candidate lookup", reviewTriage.byLane.find((item) => item.key === "candidate_lookup_recommended")?.count ?? 0, { status: "open", reviewStatus: "pending" }),
        metricFilterButton("safe link candidate", reviewTriage.byLane.find((item) => item.key === "safe_link_candidate_available")?.count ?? 0, { status: "open", reviewStatus: "pending", linkStatus: "none" })
      ) : !reviewTriageLoading && !reviewTriageError ? e("div", { className: "providerEmptyState" }, "No triage guidance returned.") : null,
      reviewTriage ? e("div", { className: "webhookMetricGroups" },
        metricCountGroup("By provider", reviewTriage.byProvider, (key) => ({ provider: key as ProviderWebhookUnmatchedInboundFilters["provider"] })),
        metricCountGroup("By event type", reviewTriage.byEventType, (key) => ({ eventType: key as ProviderWebhookEventType })),
        metricCountGroup("By review status", reviewTriage.byReviewStatus, (key) => ({ reviewStatus: key as ProviderWebhookUnmatchedInboundFilters["reviewStatus"] })),
        metricCountGroup("By link status", reviewTriage.byLinkStatus, (key) => ({ linkStatus: key as ProviderWebhookUnmatchedInboundFilters["linkStatus"] })),
        metricCountGroup("By unmatched status", reviewTriage.byUnmatchedStatus, (key) => ({ unmatchedStatus: key as ProviderWebhookUnmatchedInboundFilters["unmatchedStatus"] }))
      ) : null,
      reviewTriage ? e("div", { className: "webhookMetricGroups twoColumn" },
        e("div", { className: "webhookMetricGroup" },
          e("strong", null, "Triage thresholds"),
          e("div", null,
            e("span", null, `staleWarningHours=${reviewTriage.thresholds.staleWarningHours}`),
            e("span", null, `staleCriticalHours=${reviewTriage.thresholds.staleCriticalHours}`),
            e("span", null, `overSlaHours=${reviewTriage.thresholds.overSlaHours}`)
          )
        ),
        e("div", { className: "webhookMetricGroup" },
          e("strong", null, "By lane"),
          e("div", null,
            ...reviewTriage.byLane.map((item) => e("span", { key: item.key }, `${item.label}=${item.count}`))
          )
        )
      ) : null,
      reviewTriage ? e("div", { className: "webhookEventList compact", "aria-label": "Safe triage lane cards" },
        ...reviewTriage.lanes.map((lane) => e("article", { key: lane.laneKey, className: "webhookHistoryRow" },
          e("strong", null, `${lane.label} / ${lane.severity}`),
          e("span", null, `laneKey=${lane.laneKey}`),
          e("span", null, `count=${lane.count}`),
          e("span", null, `safeDrilldownFilters=${formatAppliedFilters(lane.safeDrilldownFilters)}`),
          e("p", null, lane.description),
          e("div", { className: "webhookEventActions" },
            e("button", {
              className: "webhookEventButton",
              type: "button",
              disabled: !onUnmatchedFiltersChange,
              onClick: () => updateQueueFilters(lane.safeDrilldownFilters)
            }, "Apply lane filter"),
            ...lane.recommendedNextActions.map((action) => e("span", { key: action, className: "webhookWarningPill" }, action))
          )
        ))
      ) : null,
      reviewTriage && reviewTriage.topItems.length > 0 ? e("div", { className: "webhookEventList compact", "aria-label": "Top safe triage item summaries" },
        ...reviewTriage.topItems.map((item) => e("article", { key: item.unmatchedId, className: "webhookHistoryRow" },
          e("strong", null, `${item.triageLane} / ${item.severity} / ${providerLabel(item.provider)}`),
          e("span", null, `unmatchedId=${item.unmatchedId}`),
          e("span", null, `platform=${item.platform}`),
          e("span", null, `channelAccountId=${item.channelAccountId ?? "none"}`),
          e("span", null, `safeRoomLabel=${item.safeRoomLabel}`),
          e("span", null, `roomKeyDigest=${item.roomKeyDigest ?? "none"}`),
          e("span", null, `eventType=${item.eventType}`),
          e("span", null, `ageBucket=${item.ageBucket}`),
          e("span", null, `reviewStatus=${item.reviewStatus}`),
          e("span", null, `linkStatus=${item.linkStatus}`),
          e("span", null, `unmatchedStatus=${item.unmatchedStatus}`),
          e("span", null, `routingOutcome=${item.routingOutcome}`),
          e("span", null, `diagnosticsAvailable=${String(item.diagnosticsAvailable)}`),
          e("span", null, `historyAvailable=${String(item.historyAvailable)}`),
          e("span", null, `candidatesAvailable=${String(item.candidatesAvailable)}`),
          e("span", null, `exportAvailable=${String(item.exportAvailable)}`),
          e("span", null, `receivedAt=${formatDate(item.receivedAt)}`),
          e("span", null, `externalCalls=${item.externalCalls}`),
          e("div", { className: "webhookEventActions" },
            ...item.recommendedNextActions.map((action) => triageActionControl(action, item))
          )
        ))
      ) : reviewTriage && !reviewTriageLoading ? e("div", { className: "providerEmptyState" }, "No top triage item summaries.") : null
    ),
    e("div", { className: "webhookEventSurface", "aria-label": "Provider webhook review alerts" },
      e("div", { className: "webhookEventHeader" },
        e("div", { className: "channelPanelTop" },
          e(Bell, { size: 18 }),
          e("div", null,
            e("h3", null, "Queue SLA alerts"),
            e("p", null, "Safe queue health, stale unmatched items, and alert drilldown filters.")
          )
        ),
        reviewAlerts ? e("div", { className: "webhookLastEvent", "aria-label": "Review alerts status" },
          e("span", null, "alerts generated"),
          e("strong", null, formatDate(reviewAlerts.generatedAt)),
          e("span", null, `externalCalls=${reviewAlerts.externalCalls}`),
          e("span", null, `applied filters=${formatAppliedFilters(reviewAlerts.appliedFilters)}`)
        ) : null
      ),
      reviewAlertsError ? e("div", { className: "apiErrorBox compact", role: "alert" }, reviewAlertsError) : null,
      reviewAlertsLoading ? e("div", { className: "apiLoadingBox compact" }, "Loading provider webhook review alerts...") : null,
      reviewAlerts ? e("div", { className: "webhookMetricsGrid" },
        metricFilterButton("total alerts", reviewAlerts.totalAlerts, { status: "open" }),
        metricFilterButton("info", reviewAlerts.infoCount, { status: "open" }),
        metricFilterButton("warning", reviewAlerts.warningCount, { status: "open" }),
        metricFilterButton("critical", reviewAlerts.criticalCount, { status: "open" }),
        metricFilterButton("stale open", reviewAlerts.staleOpenCount, { status: "open" }),
        metricFilterButton("over SLA", reviewAlerts.overSlaCount, { status: "open" }),
        metricFilterButton("oldest open", reviewAlerts.oldestOpenReceivedAt ? 1 : 0, { status: "open" }),
        metricFilterButton("top stale summaries", reviewAlerts.alertItems.length, { status: "open" })
      ) : !reviewAlertsLoading && !reviewAlertsError ? e("div", { className: "providerEmptyState" }, "No review alerts returned.") : null,
      reviewAlerts ? e("div", { className: "webhookMetricGroups" },
        metricCountGroup("By severity", reviewAlerts.bySeverity, () => ({ status: "open" })),
        metricCountGroup("By provider", reviewAlerts.byProvider, (key) => ({ provider: key as ProviderWebhookUnmatchedInboundFilters["provider"], status: "open" })),
        metricCountGroup("By event type", reviewAlerts.byEventType, (key) => ({ eventType: key as ProviderWebhookEventType, status: "open" })),
        metricCountGroup("By review status", reviewAlerts.byReviewStatus, (key) => ({ reviewStatus: key as ProviderWebhookUnmatchedInboundFilters["reviewStatus"] })),
        metricCountGroup("By unmatched status", reviewAlerts.byUnmatchedStatus, (key) => ({ unmatchedStatus: key as ProviderWebhookUnmatchedInboundFilters["unmatchedStatus"] }))
      ) : null,
      reviewAlerts ? e("div", { className: "webhookMetricGroups twoColumn" },
        e("div", { className: "webhookMetricGroup" },
          e("strong", null, "SLA/staleness thresholds"),
          e("div", null,
            e("span", null, `staleWarningHours=${reviewAlerts.thresholds.staleWarningHours}`),
            e("span", null, `staleCriticalHours=${reviewAlerts.thresholds.staleCriticalHours}`),
            e("span", null, `overSlaHours=${reviewAlerts.thresholds.overSlaHours}`),
            e("span", null, `latestAlertGeneratedAt=${reviewAlerts.latestAlertGeneratedAt ? formatDate(reviewAlerts.latestAlertGeneratedAt) : "none"}`),
            e("span", null, `oldestOpenReceivedAt=${reviewAlerts.oldestOpenReceivedAt ? formatDate(reviewAlerts.oldestOpenReceivedAt) : "none"}`)
          )
        ),
        e("div", { className: "webhookMetricGroup" },
          e("strong", null, "By link status"),
          e("div", null,
            ...reviewAlerts.byLinkStatus.map((item) => metricFilterButton(item.label, item.count, { linkStatus: item.key as ProviderWebhookUnmatchedInboundFilters["linkStatus"] }))
          )
        )
      ) : null,
      reviewAlerts && reviewAlerts.alertItems.length > 0 ? e("div", { className: "webhookEventList compact", "aria-label": "Top stale unmatched alert summaries" },
        ...reviewAlerts.alertItems.map((item) => e("article", { key: item.unmatchedId, className: "webhookHistoryRow" },
          e("strong", null, `${item.severity} / ${providerLabel(item.provider)} / ${item.eventType}`),
          e("span", null, `unmatchedId=${item.unmatchedId}`),
          e("span", null, `platform=${item.platform}`),
          e("span", null, `channelAccountId=${item.channelAccountId ?? "none"}`),
          e("span", null, `safeRoomLabel=${item.safeRoomLabel}`),
          e("span", null, `roomKeyDigest=${item.roomKeyDigest ?? "none"}`),
          e("span", null, `ageBucket=${item.ageBucket}`),
          e("span", null, `reviewStatus=${item.reviewStatus}`),
          e("span", null, `linkStatus=${item.linkStatus}`),
          e("span", null, `unmatchedStatus=${item.unmatchedStatus}`),
          e("span", null, `routingOutcome=${item.routingOutcome}`),
          e("span", null, `diagnosticsAvailable=${String(item.diagnosticsAvailable)}`),
          e("span", null, `historyAvailable=${String(item.historyAvailable)}`),
          e("span", null, `receivedAt=${formatDate(item.receivedAt)}`),
          e("span", null, `externalCalls=${item.externalCalls}`),
          e("div", { className: "webhookEventActions" },
            e("button", {
              className: "webhookEventButton",
              type: "button",
              disabled: !onUnmatchedFiltersChange,
              onClick: () => updateQueueFilters({
                provider: item.provider,
                eventType: item.eventType,
                reviewStatus: item.reviewStatus,
                linkStatus: item.linkStatus,
                unmatchedStatus: item.unmatchedStatus
              })
            }, "Apply filters"),
            e("button", {
              className: "webhookEventButton",
              type: "button",
              disabled: !item.diagnosticsAvailable || diagnosticsLoadingId === item.unmatchedId || !onLoadDiagnostics,
              onClick: () => void onLoadDiagnostics?.(item.unmatchedId)
            },
              e(Activity, { size: 15 }),
              diagnosticsLoadingId === item.unmatchedId ? "Loading diagnostics..." : "Open diagnostics"
            )
          )
        ))
      ) : reviewAlerts && !reviewAlertsLoading ? e("div", { className: "providerEmptyState" }, "No stale unmatched alert summaries.") : null
    ),
    e("div", { className: "webhookEventSurface", "aria-label": "Webhook sandbox event log" },
      e("div", { className: "webhookEventHeader" },
        e("div", null,
          e("h3", null, "Webhook sandbox event log"),
          e("p", null, "Dry-run intake summary only. Raw provider payloads and credentials are never displayed.")
        ),
        lastEvent ? e("div", { className: "webhookLastEvent", "aria-label": "Last received dry-run event" },
          e("span", null, "last received dry-run event"),
          e("strong", null, `${providerLabel(lastEvent.provider)} ${lastEvent.eventType} ${lastEvent.status}`),
          e("span", null, `signature=${lastEvent.signatureStatus} / replay=${lastEvent.replayStatus}`),
          e("span", null, `normalization=${lastEvent.normalizationStatus} / routing=${lastEvent.routingStatus}`),
          e("span", null, `inboundPersistence=${lastEvent.inboundPersistenceStatus} / messagePersisted=${String(lastEvent.messagePersisted)}`),
          e("span", null, `unmatchedQueued=${String(lastEvent.unmatchedInboundQueued)} / unmatchedStatus=${lastEvent.unmatchedStatus ?? "none"}`)
        ) : null
      ),
      webhookEventsError ? e("div", { className: "apiErrorBox compact", role: "alert" }, webhookEventsError) : null,
      webhookEventsLoading ? e("div", { className: "apiLoadingBox compact" }, "Loading webhook sandbox events...") : null,
      e("form", { className: "webhookEventForm", onSubmit: submitSandboxEvent },
        e("label", { className: "settingsInlineField" },
          e("span", null, "Provider"),
          e("select", { value: provider, onChange: (event: React.ChangeEvent<HTMLSelectElement>) => setProvider(event.target.value as ProviderOption) },
            ...providers.map((item) => e("option", { key: item, value: item }, providerLabel(item)))
          )
        ),
        e("label", { className: "settingsInlineField" },
          e("span", null, "Event type"),
          e("select", { value: eventType, onChange: (event: React.ChangeEvent<HTMLSelectElement>) => setEventType(event.target.value as ProviderWebhookEventType) },
            ...eventTypes.map((item) => e("option", { key: item, value: item }, item))
          )
        ),
        e("label", { className: "settingsInlineField" },
          e("span", null, "Inbound persistence"),
          e("select", { value: inboundPersistenceMode, onChange: (event: React.ChangeEvent<HTMLSelectElement>) => setInboundPersistenceMode(event.target.value as ProviderWebhookInboundPersistenceMode) },
            e("option", { value: "dry-run" }, "dry-run"),
            e("option", { value: "sandbox-persist" }, "sandbox-persist")
          )
        ),
        e("label", { className: "settingsInlineField" },
          e("span", null, "Event ID"),
          e("input", {
            value: eventId,
            onChange: (event: React.ChangeEvent<HTMLInputElement>) => setEventId(event.target.value),
            placeholder: "sandbox-event-001"
          })
        ),
        e("label", { className: "settingsInlineField" },
          e("span", null, "Delivery ID"),
          e("input", {
            value: deliveryId,
            onChange: (event: React.ChangeEvent<HTMLInputElement>) => setDeliveryId(event.target.value),
            placeholder: "optional"
          })
        ),
        e("label", { className: "settingsInlineField" },
          e("span", null, "Sandbox signature"),
          e("input", {
            type: "password",
            value: signature,
            onChange: (event: React.ChangeEvent<HTMLInputElement>) => setSignature(event.target.value),
            placeholder: "optional local HMAC",
            autoComplete: "off"
          })
        ),
        e("button", { className: "webhookEventButton", type: "submit", disabled: webhookEventSaving || !onCreateSandboxEvent },
          e(Send, { size: 15 }),
          webhookEventSaving ? "Submitting..." : "Submit dry-run"
        )
      ),
      webhookEvents.length > 0 ? e("div", { className: "webhookEventList" },
        ...webhookEvents.slice(0, 5).map((event) => e("article", { key: event.id, className: "webhookEventRow" },
          e("div", null,
            e("strong", null, `${providerLabel(event.provider)} / ${providerLabel(event.channel)}`),
            e("span", null, `${event.eventType} / ${event.status}`)
          ),
          e("div", null,
            e("span", null, `mode=${event.mode}`),
            e("span", null, `signature=${event.signatureStatus}`),
            e("span", null, `replay=${event.replayStatus}`),
            e("span", null, `normalization=${event.normalizationStatus}`),
            e("span", null, `normalizedEventType=${event.normalizedEventType}`),
            e("span", null, `messageType=${event.messageType}`),
            e("span", null, `routing=${event.routingStatus}`),
            e("span", null, `lookup=${event.conversationLookupStatus}`),
            e("span", null, `inboundPersistence=${event.inboundPersistenceStatus}`),
            e("span", null, `messagePersisted=${String(event.messagePersisted)}`),
            e("span", null, `messageId=${event.persistedMessageId ?? "none"}`),
            e("span", null, `unmatchedQueued=${String(event.unmatchedInboundQueued)}`),
            e("span", null, `unmatchedStatus=${event.unmatchedStatus ?? "none"}`),
            e("span", null, `reviewActionStatus=${event.unmatchedReviewActionStatus}`),
            e("span", null, `linkStatus=${event.unmatchedLinkStatus}`),
            e("span", null, `unmatchedReason=${event.unmatchedReason ?? "none"}`),
            e("span", null, `unmatchedId=${event.unmatchedInboundId ?? "none"}`),
            e("span", null, `linkedConversationId=${event.linkedConversationId ?? "none"}`),
            e("span", null, `linkedMessageId=${event.linkedMessageId ?? "none"}`),
            e("span", null, `unmatchedResolvedAt=${event.unmatchedResolvedAt ? formatDate(event.unmatchedResolvedAt) : "none"}`),
            e("span", null, `externalCalls=${event.externalCalls}`),
            e("span", null, formatDate(event.receivedAt))
          ),
          e("p", null, event.payloadSummary),
          e("small", null, `payloadFieldCount=${event.payloadFieldCount} / payloadDigest=${event.payloadDigest} / signatureVerified=${String(event.signatureVerified)} / replayDetected=${String(event.replayDetected)} / dryRunRouting=${String(event.dryRunRouting)} / conversationKeyDigest=${event.conversationKeyDigest ?? "none"} / roomIdDigest=${event.roomIdDigest ?? "none"} / conversationId=${event.conversationId ?? "none"} / inboundAuditStatus=${event.inboundAuditStatus}`)
        ))
      ) : !webhookEventsLoading && !webhookEventsError ? e("div", { className: "providerEmptyState" }, "No webhook sandbox events received.") : null
    ),
    e("div", { className: "webhookEventSurface", "aria-label": "Provider webhook assignment workload" },
      e("div", { className: "webhookEventHeader" },
        e("div", { className: "channelPanelTop" },
          e(UserCheck, { size: 18 }),
          e("div", null,
            e("h3", null, "Assignment workload"),
            e("p", null, "Internal assignment and escalation metadata only.")
          )
        ),
        reviewWorkload ? e("div", { className: "webhookLastEvent", "aria-label": "Assignment workload status" },
          e("span", null, "workload generated"),
          e("strong", null, formatDate(reviewWorkload.generatedAt)),
          e("span", null, `externalCalls=${reviewWorkload.externalCalls}`),
          e("span", null, `applied filters=${formatAppliedFilters(reviewWorkload.appliedFilters)}`)
        ) : null
      ),
      reviewWorkloadError ? e("div", { className: "apiErrorBox compact", role: "alert" }, reviewWorkloadError) : null,
      reviewWorkloadLoading ? e("div", { className: "apiLoadingBox compact" }, "Loading provider webhook assignment workload...") : null,
      reviewWorkload ? e("div", { className: "webhookMetricsGrid" },
        metricFilterButton("total workload items", reviewWorkload.totalItems, {}),
        metricFilterButton("open workload items", reviewWorkload.totalOpenItems, { status: "open" }),
        metricFilterButton("unassigned open", reviewWorkload.counts.unassignedOpen, { assignmentStatus: "unassigned", status: "open" }),
        metricFilterButton("assigned to me", reviewWorkload.counts.assignedToMeOpen, { assignmentStatus: "assigned_to_me", status: "open" }),
        metricFilterButton("assigned to others", reviewWorkload.counts.assignedToOthersOpen, { assignmentStatus: "assigned_to_others", status: "open" }),
        metricFilterButton("escalated open", reviewWorkload.counts.escalatedOpen, { escalationStatus: "escalated", status: "open" }),
        metricFilterButton("overdue assigned", reviewWorkload.counts.overdueAssignedOpen, { assignmentStatus: "assigned", status: "open" }),
        metricFilterButton("resolved assigned", reviewWorkload.counts.resolvedAssigned, { assignmentStatus: "assigned" }),
        metricFilterButton("unresolved open", reviewWorkload.counts.unresolvedOpen, { resolutionStatus: "unresolved", status: "open" }),
        metricFilterButton("ready for closure", reviewWorkload.counts.readyForClosure, { status: "open" }),
        metricFilterButton("blocked resolution", reviewWorkload.counts.blockedResolution, { closureReadiness: "BLOCKED" }),
        metricFilterButton("checklist incomplete", reviewWorkload.counts.checklistIncompleteOpen, { checklistIncomplete: true, status: "open" })
      ) : !reviewWorkloadLoading && !reviewWorkloadError ? e("div", { className: "providerEmptyState" }, "No assignment workload returned.") : null,
      reviewWorkload ? e("div", { className: "webhookMetricGroups" },
        metricCountGroup("By assignee", reviewWorkload.byAssignee, (key) => ({ assignedTo: key === "unassigned" ? undefined : key })),
        metricCountGroup("By assignment status", reviewWorkload.byAssignmentStatus, (key) => ({ assignmentStatus: key as ProviderWebhookUnmatchedInboundFilters["assignmentStatus"] })),
        metricCountGroup("By escalation status", reviewWorkload.byEscalationStatus, (key) => ({ escalationStatus: key as ProviderWebhookUnmatchedInboundFilters["escalationStatus"] })),
        metricCountGroup("By escalation reason", reviewWorkload.byEscalationReason, (key) => key === "none" ? { escalationStatus: "none" } : { escalationReason: key as ProviderWebhookReviewEscalationReason })
      ) : null,
      reviewWorkload ? e("div", { className: "webhookMetricGroups twoColumn" },
        e("div", null,
          e("strong", null, "Workload thresholds"),
          e("span", null, `staleWarningHours=${reviewWorkload.thresholds.staleWarningHours}`),
          e("span", null, `staleCriticalHours=${reviewWorkload.thresholds.staleCriticalHours}`),
          e("span", null, `overSlaHours=${reviewWorkload.thresholds.overSlaHours}`),
          e("span", null, `recentlyAssigned=${reviewWorkload.counts.recentlyAssigned}`),
          e("span", null, `recentlyEscalated=${reviewWorkload.counts.recentlyEscalated}`),
          e("span", null, `unresolvedOpen=${reviewWorkload.counts.unresolvedOpen}`),
          e("span", null, `readyForClosure=${reviewWorkload.counts.readyForClosure}`),
          e("span", null, `blockedResolution=${reviewWorkload.counts.blockedResolution}`),
          e("span", null, `checklistIncompleteOpen=${reviewWorkload.counts.checklistIncompleteOpen}`)
        )
      ) : null,
      reviewWorkload && (reviewWorkload.topAssignedItems.length > 0 || reviewWorkload.topEscalatedItems.length > 0) ? e("div", { className: "webhookEventList compact", "aria-label": "Top assignment escalation summaries" },
        ...[...reviewWorkload.topAssignedItems, ...reviewWorkload.topEscalatedItems].slice(0, 10).map((item, index) => e("article", { key: `${item.unmatchedId}-${item.assignmentStatus}-${item.escalationStatus}-${index}`, className: "webhookHistoryRow" },
          e("strong", null, `${item.assignmentStatus} / ${item.escalationStatus} / ${providerLabel(item.provider)}`),
          e("span", null, `unmatchedId=${item.unmatchedId}`),
          e("span", null, `assignedTo=${item.assignedToOperatorLabel ?? "none"}`),
          e("span", null, `assignedAt=${item.assignedAt ? formatDate(item.assignedAt) : "none"}`),
          e("span", null, `escalationReason=${item.escalationReason ?? "none"}`),
          e("span", null, `escalatedAt=${item.escalatedAt ? formatDate(item.escalatedAt) : "none"}`),
          e("span", null, `reviewStatus=${item.reviewStatus}`),
          e("span", null, `linkStatus=${item.linkStatus}`),
          e("span", null, `unmatchedStatus=${item.unmatchedStatus}`),
          e("span", null, `resolutionStatus=${item.resolutionStatus}`),
          e("span", null, `resolutionOutcome=${item.resolutionOutcome ?? "none"}`),
          e("span", null, `closureReadiness=${item.closureReadiness}`),
          e("span", null, `checklist=${item.checklistCompletedCount}/${item.checklistTotalCount}`),
          e("span", null, `safeRoomLabel=${item.safeRoomLabel}`),
          e("span", null, `externalCalls=${item.externalCalls}`)
        ))
      ) : reviewWorkload && !reviewWorkloadLoading ? e("div", { className: "providerEmptyState" }, "No top assignment or escalation summaries.") : null
    ),
    e("div", { className: "webhookEventSurface", "aria-label": "Provider webhook review resolution summary" },
      e("div", { className: "webhookEventHeader" },
        e("div", { className: "channelPanelTop" },
          e(CheckSquare, { size: 18 }),
          e("div", null,
            e("h3", null, "Resolution checklist summary"),
            e("p", null, "Internal closure readiness guidance only. No review, skip, link, or message persistence runs automatically.")
          )
        ),
        reviewResolutionSummary ? e("div", { className: "webhookLastEvent", "aria-label": "Resolution summary status" },
          e("span", null, "resolution generated"),
          e("strong", null, formatDate(reviewResolutionSummary.generatedAt)),
          e("span", null, `externalCalls=${reviewResolutionSummary.externalCalls}`),
          e("span", null, `applied filters=${formatAppliedFilters(reviewResolutionSummary.appliedFilters)}`)
        ) : null
      ),
      reviewResolutionSummaryError ? e("div", { className: "apiErrorBox compact", role: "alert" }, reviewResolutionSummaryError) : null,
      reviewResolutionSummaryLoading ? e("div", { className: "apiLoadingBox compact" }, "Loading provider webhook resolution summary...") : null,
      reviewResolutionSummary ? e("div", { className: "webhookMetricsGrid" },
        metricFilterButton("total resolution items", reviewResolutionSummary.totalItems, {}),
        metricFilterButton("open resolution items", reviewResolutionSummary.totalOpenItems, { status: "open" }),
        metricFilterButton("unresolved open", reviewResolutionSummary.counts.unresolvedOpen, { resolutionStatus: "unresolved", status: "open" }),
        metricFilterButton("ready review", reviewResolutionSummary.counts.readyForReview, { closureReadiness: "READY_FOR_REVIEW" }),
        metricFilterButton("ready skip", reviewResolutionSummary.counts.readyForSkip, { closureReadiness: "READY_FOR_SKIP" }),
        metricFilterButton("ready link", reviewResolutionSummary.counts.readyForLink, { closureReadiness: "READY_FOR_LINK" }),
        metricFilterButton("ready link persist", reviewResolutionSummary.counts.readyForLinkAndPersist, { closureReadiness: "READY_FOR_LINK_AND_PERSIST" }),
        metricFilterButton("blocked", reviewResolutionSummary.counts.blocked, { closureReadiness: "BLOCKED" }),
        metricFilterButton("resolved recently", reviewResolutionSummary.counts.resolvedRecently, { resolutionStatus: "resolved" }),
        metricFilterButton("checklist incomplete", reviewResolutionSummary.counts.checklistIncompleteOpen, { checklistIncomplete: true, status: "open" })
      ) : !reviewResolutionSummaryLoading && !reviewResolutionSummaryError ? e("div", { className: "providerEmptyState" }, "No resolution summary returned.") : null,
      reviewResolutionSummary ? e("div", { className: "webhookMetricGroups" },
        metricCountGroup("By resolution status", reviewResolutionSummary.byResolutionStatus, (key) => ({ resolutionStatus: key as ProviderWebhookUnmatchedInboundFilters["resolutionStatus"] })),
        metricCountGroup("By resolution outcome", reviewResolutionSummary.byResolutionOutcome, (key) => key === "none" ? { resolutionStatus: "unresolved" } : { resolutionOutcome: key as ProviderWebhookReviewResolutionOutcome }),
        metricCountGroup("By closure readiness", reviewResolutionSummary.byClosureReadiness, (key) => ({ closureReadiness: key as ProviderWebhookUnmatchedInboundFilters["closureReadiness"] })),
        metricCountGroup("By checklist step", reviewResolutionSummary.byChecklistStep, () => ({ checklistIncomplete: true })),
        metricCountGroup("By provider", reviewResolutionSummary.byProvider, (key) => ({ provider: key as ProviderWebhookUnmatchedInboundFilters["provider"] })),
        metricCountGroup("By review status", reviewResolutionSummary.byReviewStatus, (key) => ({ reviewStatus: key as ProviderWebhookUnmatchedInboundFilters["reviewStatus"] })),
        metricCountGroup("By link status", reviewResolutionSummary.byLinkStatus, (key) => ({ linkStatus: key as ProviderWebhookUnmatchedInboundFilters["linkStatus"] })),
        metricCountGroup("By unmatched status", reviewResolutionSummary.byUnmatchedStatus, (key) => ({ unmatchedStatus: key as ProviderWebhookUnmatchedInboundFilters["unmatchedStatus"] }))
      ) : null,
      reviewResolutionSummary ? e("div", { className: "webhookMetricGroups twoColumn" },
        e("div", null,
          e("strong", null, "Resolution thresholds"),
          e("span", null, `staleWarningHours=${reviewResolutionSummary.thresholds.staleWarningHours}`),
          e("span", null, `staleCriticalHours=${reviewResolutionSummary.thresholds.staleCriticalHours}`),
          e("span", null, `overSlaHours=${reviewResolutionSummary.thresholds.overSlaHours}`)
        )
      ) : null,
      reviewResolutionSummary && (reviewResolutionSummary.topReadyItems.length > 0 || reviewResolutionSummary.topBlockedItems.length > 0) ? e("div", { className: "webhookEventList compact", "aria-label": "Top resolution summaries" },
        ...[...reviewResolutionSummary.topReadyItems, ...reviewResolutionSummary.topBlockedItems].slice(0, 10).map((item) => e("article", { key: `${item.unmatchedId}-${item.closureReadiness}-${item.resolutionOutcome ?? "none"}`, className: "webhookHistoryRow" },
          e("strong", null, `${item.closureReadiness} / ${item.resolutionOutcome ?? "none"} / ${providerLabel(item.provider)}`),
          e("span", null, `unmatchedId=${item.unmatchedId}`),
          e("span", null, `platform=${item.platform}`),
          e("span", null, `channelAccountId=${item.channelAccountId ?? "none"}`),
          e("span", null, `safeRoomLabel=${item.safeRoomLabel}`),
          e("span", null, `roomKeyDigest=${item.roomKeyDigest ?? "none"}`),
          e("span", null, `eventType=${item.eventType}`),
          e("span", null, `ageBucket=${item.ageBucket}`),
          e("span", null, `reviewStatus=${item.reviewStatus}`),
          e("span", null, `linkStatus=${item.linkStatus}`),
          e("span", null, `unmatchedStatus=${item.unmatchedStatus}`),
          e("span", null, `assignmentStatus=${item.assignmentStatus}`),
          e("span", null, `assignedTo=${item.assignedToOperatorLabel ?? "none"}`),
          e("span", null, `escalationStatus=${item.escalationStatus}`),
          e("span", null, `escalationReason=${item.escalationReason ?? "none"}`),
          e("span", null, `resolutionStatus=${item.resolutionStatus}`),
          e("span", null, `resolvedAt=${item.resolvedAt ? formatDate(item.resolvedAt) : "none"}`),
          e("span", null, `resolvedBy=${item.resolvedByOperatorLabel ?? "none"}`),
          e("span", null, `checklist=${item.checklistCompletedCount}/${item.checklistTotalCount}`),
          e("span", null, `incompleteSteps=${item.checklistIncompleteSteps.join("|") || "none"}`),
          e("span", null, `recommendedNextActions=${item.recommendedNextActions.join("|") || "none"}`),
          e("span", null, `externalCalls=${item.externalCalls}`)
        ))
      ) : reviewResolutionSummary && !reviewResolutionSummaryLoading ? e("div", { className: "providerEmptyState" }, "No top ready or blocked resolution summaries.") : null
    ),
    e("div", { className: "webhookEventSurface", "aria-label": "Provider webhook closure evidence report" },
      e("div", { className: "webhookEventHeader" },
        e("div", { className: "channelPanelTop" },
          e(ShieldCheck, { size: 18 }),
          e("div", null,
            e("h3", null, "Closure evidence report"),
            e("p", null, "Deterministic safe closure evidence summaries only. No review, skip, link, assignment, notification, provider, or AI action runs automatically.")
          )
        ),
        reviewClosureReport ? e("div", { className: "webhookLastEvent", "aria-label": "Closure evidence report status" },
          e("span", null, "closure report generated"),
          e("strong", null, formatDate(reviewClosureReport.generatedAt)),
          e("span", null, `externalCalls=${reviewClosureReport.externalCalls}`),
          e("span", null, `applied filters=${formatAppliedFilters(reviewClosureReport.appliedFilters)}`)
        ) : null
      ),
      e("div", { className: "webhookEventActions" },
        e("button", {
          className: "webhookEventButton",
          type: "button",
          disabled: reviewClosureReportExportLoading || !onExportClosureReport,
          onClick: () => void onExportClosureReport?.()
        },
          e(Download, { size: 15 }),
          reviewClosureReportExportLoading ? "Exporting report..." : "Export closure report"
        ),
        e("button", {
          className: "webhookEventButton",
          type: "button",
          disabled: reviewClosureReportExportManifestLoading || !onLoadClosureReportExportManifest,
          onClick: () => void onLoadClosureReportExportManifest?.()
        },
          e(FileText, { size: 15 }),
          reviewClosureReportExportManifestLoading ? "Loading manifest..." : "Load export manifest"
        ),
        e("button", {
          className: "webhookEventButton",
          type: "button",
          disabled: reviewQaHandoffBundleLoading || !onLoadReviewQaHandoffBundle,
          onClick: () => void onLoadReviewQaHandoffBundle?.()
        },
          e(CheckSquare, { size: 15 }),
          reviewQaHandoffBundleLoading ? "Loading QA bundle..." : "Load QA handoff bundle"
        ),
        e("button", {
          className: "webhookEventButton",
          type: "button",
          disabled: reviewQaHandoffBundleExportLoading || !onExportReviewQaHandoffBundle,
          onClick: () => void onExportReviewQaHandoffBundle?.()
        },
          e(Download, { size: 15 }),
          reviewQaHandoffBundleExportLoading ? "Exporting QA bundle..." : "Export QA handoff bundle"
        ),
        e("button", {
          className: "webhookEventButton",
          type: "button",
          disabled: reviewQaHandoffReceiptLoading || !onLoadReviewQaHandoffReceipt,
          onClick: () => void onLoadReviewQaHandoffReceipt?.()
        },
          e(FileClock, { size: 15 }),
          reviewQaHandoffReceiptLoading ? "Loading receipt..." : "Load QA handoff receipt"
        ),
        e("button", {
          className: "webhookEventButton",
          type: "button",
          disabled: reviewQaHandoffSignOffLoading || !onSignOffReviewQaHandoffReceipt,
          onClick: () => void onSignOffReviewQaHandoffReceipt?.()
        },
          e(UserCheck, { size: 15 }),
          reviewQaHandoffSignOffLoading ? "Signing off..." : "Sign off QA handoff"
        ),
        e("button", {
          className: "webhookEventButton",
          type: "button",
          disabled: reviewQaHandoffAcceptanceLockLoading || !onLoadReviewQaHandoffAcceptanceLock,
          onClick: () => void onLoadReviewQaHandoffAcceptanceLock?.()
        },
          e(LockKeyhole, { size: 15 }),
          reviewQaHandoffAcceptanceLockLoading ? "Loading lock..." : "Load acceptance lock"
        ),
        e("button", {
          className: "webhookEventButton",
          type: "button",
          disabled: reviewQaHandoffAcceptanceLockLoading || !onLockReviewQaHandoffAcceptance,
          onClick: () => void onLockReviewQaHandoffAcceptance?.()
        },
          e(LockKeyhole, { size: 15 }),
          reviewQaHandoffAcceptanceLockLoading ? "Locking..." : "Lock QA acceptance"
        ),
        e("button", {
          className: "webhookEventButton",
          type: "button",
          disabled: reviewQaHandoffLockedArchiveLoading || !onLoadReviewQaHandoffLockedArchive,
          onClick: () => void onLoadReviewQaHandoffLockedArchive?.()
        },
          e(FileClock, { size: 15 }),
          reviewQaHandoffLockedArchiveLoading ? "Loading archive..." : "Load locked archive"
        ),
        e("button", {
          className: "webhookEventButton",
          type: "button",
          disabled: reviewQaHandoffLockedArchiveExportLoading || !onExportReviewQaHandoffLockedArchive,
          onClick: () => void onExportReviewQaHandoffLockedArchive?.()
        },
          e(Download, { size: 15 }),
          reviewQaHandoffLockedArchiveExportLoading ? "Exporting archive..." : "Export locked archive"
        ),
        e("button", {
          className: "webhookEventButton",
          type: "button",
          disabled: reviewQaHandoffRetentionManifestLoading || !onLoadReviewQaHandoffRetentionManifest,
          onClick: () => void onLoadReviewQaHandoffRetentionManifest?.()
        },
          e(FileText, { size: 15 }),
          reviewQaHandoffRetentionManifestLoading ? "Loading retention..." : "Load retention manifest"
        ),
        e("button", {
          className: "webhookEventButton",
          type: "button",
          disabled: reviewQaHandoffArchiveIntegrityLoading || !onLoadReviewQaHandoffArchiveIntegrity,
          onClick: () => void onLoadReviewQaHandoffArchiveIntegrity?.()
        },
          e(ShieldCheck, { size: 15 }),
          reviewQaHandoffArchiveIntegrityLoading ? "Checking archive..." : "Load archive integrity"
        ),
        e("button", {
          className: "webhookEventButton",
          type: "button",
          disabled: reviewQaHandoffRetentionAuditLoading || !onLoadReviewQaHandoffRetentionAudit,
          onClick: () => void onLoadReviewQaHandoffRetentionAudit?.()
        },
          e(ListChecks, { size: 15 }),
          reviewQaHandoffRetentionAuditLoading ? "Auditing retention..." : "Load retention audit"
        ),
        e("button", {
          className: "webhookEventButton",
          type: "button",
          disabled: reviewQaHandoffArchiveFinalizationLoading || !onLoadReviewQaHandoffArchiveFinalization,
          onClick: () => void onLoadReviewQaHandoffArchiveFinalization?.()
        },
          e(ShieldCheck, { size: 15 }),
          reviewQaHandoffArchiveFinalizationLoading ? "Checking finalization..." : "Load archive finalization"
        ),
        e("button", {
          className: "webhookEventButton",
          type: "button",
          disabled: reviewQaHandoffArchiveFinalizationSignOffLoading || !onSignOffReviewQaHandoffArchiveFinalization,
          onClick: () => void onSignOffReviewQaHandoffArchiveFinalization?.()
        },
          e(UserCheck, { size: 15 }),
          reviewQaHandoffArchiveFinalizationSignOffLoading ? "Signing retention..." : "Sign off retention finalization"
        ),
        e("button", {
          className: "webhookEventButton",
          type: "button",
          disabled: reviewQaHandoffArchiveFinalizationReceiptLoading || !onLoadReviewQaHandoffArchiveFinalizationReceipt,
          onClick: () => void onLoadReviewQaHandoffArchiveFinalizationReceipt?.()
        },
          e(FileText, { size: 15 }),
          reviewQaHandoffArchiveFinalizationReceiptLoading ? "Loading finalization receipt..." : "Load finalization receipt"
        ),
        e("button", {
          className: "webhookEventButton",
          type: "button",
          disabled: reviewQaHandoffArchiveReleaseEvidenceLoading || !onLoadReviewQaHandoffArchiveReleaseEvidence,
          onClick: () => void onLoadReviewQaHandoffArchiveReleaseEvidence?.()
        },
          e(FileText, { size: 15 }),
          reviewQaHandoffArchiveReleaseEvidenceLoading ? "Loading release evidence..." : "Load release evidence"
        ),
        e("button", {
          className: "webhookEventButton",
          type: "button",
          disabled: reviewQaHandoffArchiveReleaseVerificationLoading || !onLoadReviewQaHandoffArchiveReleaseVerification,
          onClick: () => void onLoadReviewQaHandoffArchiveReleaseVerification?.()
        },
          e(ShieldCheck, { size: 15 }),
          reviewQaHandoffArchiveReleaseVerificationLoading ? "Verifying release evidence..." : "Verify release evidence"
        ),
        e("button", {
          className: "webhookEventButton",
          type: "button",
          disabled: reviewQaHandoffArchiveReleaseCertificationLoading || !onLoadReviewQaHandoffArchiveReleaseCertification,
          onClick: () => void onLoadReviewQaHandoffArchiveReleaseCertification?.()
        },
          e(FileText, { size: 15 }),
          reviewQaHandoffArchiveReleaseCertificationLoading ? "Loading release certification..." : "Load release certification"
        ),
        e("button", {
          className: "webhookEventButton",
          type: "button",
          disabled: reviewQaHandoffArchiveReleaseClosureLedgerLoading || !onLoadReviewQaHandoffArchiveReleaseClosureLedger,
          onClick: () => void onLoadReviewQaHandoffArchiveReleaseClosureLedger?.()
        },
          e(ListChecks, { size: 15 }),
          reviewQaHandoffArchiveReleaseClosureLedgerLoading ? "Loading closure ledger..." : "Load closure ledger"
        ),
        e("button", {
          className: "webhookEventButton",
          type: "button",
          disabled: reviewQaHandoffArchiveReleaseAttestationAuditLoading || !onLoadReviewQaHandoffArchiveReleaseAttestationAudit,
          onClick: () => void onLoadReviewQaHandoffArchiveReleaseAttestationAudit?.()
        },
          e(ShieldCheck, { size: 15 }),
          reviewQaHandoffArchiveReleaseAttestationAuditLoading ? "Loading attestation audit..." : "Load attestation audit"
        ),
        e("button", {
          className: "webhookEventButton",
          type: "button",
          disabled: reviewQaHandoffArchiveReleaseAttestationReconciliationLoading || !onLoadReviewQaHandoffArchiveReleaseAttestationReconciliation,
          onClick: () => void onLoadReviewQaHandoffArchiveReleaseAttestationReconciliation?.()
        },
          e(ListChecks, { size: 15 }),
          reviewQaHandoffArchiveReleaseAttestationReconciliationLoading ? "Loading attestation reconciliation..." : "Load attestation reconciliation"
        ),
        e("button", {
          className: "webhookEventButton",
          type: "button",
          disabled: reviewQaHandoffCertifiedReleaseGateLoading || !onLoadReviewQaHandoffCertifiedReleaseGate,
          onClick: () => void onLoadReviewQaHandoffCertifiedReleaseGate?.()
        },
          e(CheckSquare, { size: 15 }),
          reviewQaHandoffCertifiedReleaseGateLoading ? "Loading release gate..." : "Load certified release gate"
        ),
        e("button", {
          className: "webhookEventButton",
          type: "button",
          disabled: reviewQaHandoffCertifiedReleaseDecisionReceiptLoading || !onLoadReviewQaHandoffCertifiedReleaseDecisionReceipt,
          onClick: () => void onLoadReviewQaHandoffCertifiedReleaseDecisionReceipt?.()
        },
          e(FileText, { size: 15 }),
          reviewQaHandoffCertifiedReleaseDecisionReceiptLoading ? "Loading decision receipt..." : "Load certified release decision receipt"
        ),
        e("button", {
          className: "webhookEventButton",
          type: "button",
          disabled: reviewQaHandoffCertifiedReleaseHandoffPacketLoading || !onLoadReviewQaHandoffCertifiedReleaseHandoffPacket,
          onClick: () => void onLoadReviewQaHandoffCertifiedReleaseHandoffPacket?.()
        },
          e(FileText, { size: 15 }),
          reviewQaHandoffCertifiedReleaseHandoffPacketLoading ? "Loading handoff packet..." : "Load certified release handoff packet"
        ),
        e("button", {
          className: "webhookEventButton",
          type: "button",
          disabled: reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordLoading || !onLoadReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord,
          onClick: () => void onLoadReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord?.()
        },
          e(FileText, { size: 15 }),
          reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordLoading ? "Loading acceptance record..." : "Load certified release handoff acceptance record"
        ),
        e("button", {
          className: "webhookEventButton",
          type: "button",
          disabled: reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordAcknowledging || !onAcknowledgeReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord,
          onClick: () => void onAcknowledgeReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord?.()
        },
          e(UserCheck, { size: 15 }),
          reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordAcknowledging ? "Acknowledging checklist..." : "Acknowledge certified release handoff checklist"
        ),
        e("button", {
          className: "webhookEventButton",
          type: "button",
          disabled: reviewClosureReportRedactionAuditLoading || !onLoadClosureReportRedactionAudit,
          onClick: () => void onLoadClosureReportRedactionAudit?.()
        },
          e(ShieldCheck, { size: 15 }),
          reviewClosureReportRedactionAuditLoading ? "Auditing report..." : "Audit report export redaction"
        ),
        e("button", {
          className: "webhookEventButton",
          type: "button",
          disabled: reviewClosureExportIntegrityLoading || !onLoadClosureExportIntegrity,
          onClick: () => void onLoadClosureExportIntegrity?.()
        },
          e(CheckSquare, { size: 15 }),
          reviewClosureExportIntegrityLoading ? "Checking integrity..." : "Check export integrity"
        )
      ),
      reviewClosureReportError ? e("div", { className: "apiErrorBox compact", role: "alert" }, reviewClosureReportError) : null,
      reviewClosureReportExportError ? e("div", { className: "apiErrorBox compact", role: "alert" }, reviewClosureReportExportError) : null,
      reviewClosureReportExportManifestError ? e("div", { className: "apiErrorBox compact", role: "alert" }, reviewClosureReportExportManifestError) : null,
      reviewQaHandoffBundleError ? e("div", { className: "apiErrorBox compact", role: "alert" }, reviewQaHandoffBundleError) : null,
      reviewQaHandoffBundleExportError ? e("div", { className: "apiErrorBox compact", role: "alert" }, reviewQaHandoffBundleExportError) : null,
      reviewQaHandoffReceiptError ? e("div", { className: "apiErrorBox compact", role: "alert" }, reviewQaHandoffReceiptError) : null,
      reviewQaHandoffSignOffError ? e("div", { className: "apiErrorBox compact", role: "alert" }, reviewQaHandoffSignOffError) : null,
      reviewQaHandoffAcceptanceLockError ? e("div", { className: "apiErrorBox compact", role: "alert" }, reviewQaHandoffAcceptanceLockError) : null,
      reviewQaHandoffLockedArchiveError ? e("div", { className: "apiErrorBox compact", role: "alert" }, reviewQaHandoffLockedArchiveError) : null,
      reviewQaHandoffLockedArchiveExportError ? e("div", { className: "apiErrorBox compact", role: "alert" }, reviewQaHandoffLockedArchiveExportError) : null,
      reviewQaHandoffRetentionManifestError ? e("div", { className: "apiErrorBox compact", role: "alert" }, reviewQaHandoffRetentionManifestError) : null,
      reviewQaHandoffArchiveIntegrityError ? e("div", { className: "apiErrorBox compact", role: "alert" }, reviewQaHandoffArchiveIntegrityError) : null,
      reviewQaHandoffRetentionAuditError ? e("div", { className: "apiErrorBox compact", role: "alert" }, reviewQaHandoffRetentionAuditError) : null,
      reviewQaHandoffArchiveFinalizationError ? e("div", { className: "apiErrorBox compact", role: "alert" }, reviewQaHandoffArchiveFinalizationError) : null,
      reviewQaHandoffArchiveFinalizationSignOffError ? e("div", { className: "apiErrorBox compact", role: "alert" }, reviewQaHandoffArchiveFinalizationSignOffError) : null,
      reviewQaHandoffArchiveFinalizationReceiptError ? e("div", { className: "apiErrorBox compact", role: "alert" }, reviewQaHandoffArchiveFinalizationReceiptError) : null,
      reviewQaHandoffArchiveReleaseEvidenceError ? e("div", { className: "apiErrorBox compact", role: "alert" }, reviewQaHandoffArchiveReleaseEvidenceError) : null,
      reviewQaHandoffArchiveReleaseVerificationError ? e("div", { className: "apiErrorBox compact", role: "alert" }, reviewQaHandoffArchiveReleaseVerificationError) : null,
      reviewQaHandoffArchiveReleaseCertificationError ? e("div", { className: "apiErrorBox compact", role: "alert" }, reviewQaHandoffArchiveReleaseCertificationError) : null,
      reviewQaHandoffArchiveReleaseClosureLedgerError ? e("div", { className: "apiErrorBox compact", role: "alert" }, reviewQaHandoffArchiveReleaseClosureLedgerError) : null,
      reviewQaHandoffArchiveReleaseAttestationAuditError ? e("div", { className: "apiErrorBox compact", role: "alert" }, reviewQaHandoffArchiveReleaseAttestationAuditError) : null,
      reviewQaHandoffArchiveReleaseAttestationReconciliationError ? e("div", { className: "apiErrorBox compact", role: "alert" }, reviewQaHandoffArchiveReleaseAttestationReconciliationError) : null,
      reviewQaHandoffCertifiedReleaseGateError ? e("div", { className: "apiErrorBox compact", role: "alert" }, reviewQaHandoffCertifiedReleaseGateError) : null,
      reviewQaHandoffCertifiedReleaseDecisionReceiptError ? e("div", { className: "apiErrorBox compact", role: "alert" }, reviewQaHandoffCertifiedReleaseDecisionReceiptError) : null,
      reviewQaHandoffCertifiedReleaseHandoffPacketError ? e("div", { className: "apiErrorBox compact", role: "alert" }, reviewQaHandoffCertifiedReleaseHandoffPacketError) : null,
      reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordError ? e("div", { className: "apiErrorBox compact", role: "alert" }, reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordError) : null,
      reviewClosureReportRedactionAuditError ? e("div", { className: "apiErrorBox compact", role: "alert" }, reviewClosureReportRedactionAuditError) : null,
      reviewClosureExportIntegrityError ? e("div", { className: "apiErrorBox compact", role: "alert" }, reviewClosureExportIntegrityError) : null,
      reviewClosureReportLoading ? e("div", { className: "apiLoadingBox compact" }, "Loading provider webhook closure evidence report...") : null,
      reviewClosureReportExportManifestLoading ? e("div", { className: "apiLoadingBox compact" }, "Loading safe export manifest...") : null,
      reviewQaHandoffBundleLoading ? e("div", { className: "apiLoadingBox compact" }, "Loading safe QA handoff bundle...") : null,
      reviewQaHandoffBundleExportLoading ? e("div", { className: "apiLoadingBox compact" }, "Exporting safe QA handoff bundle...") : null,
      reviewQaHandoffReceiptLoading ? e("div", { className: "apiLoadingBox compact" }, "Loading safe QA handoff receipt...") : null,
      reviewQaHandoffSignOffLoading ? e("div", { className: "apiLoadingBox compact" }, "Signing off safe QA handoff receipt...") : null,
      reviewQaHandoffAcceptanceLockLoading ? e("div", { className: "apiLoadingBox compact" }, "Checking safe QA handoff acceptance lock...") : null,
      reviewQaHandoffLockedArchiveLoading ? e("div", { className: "apiLoadingBox compact" }, "Loading safe QA handoff locked archive...") : null,
      reviewQaHandoffLockedArchiveExportLoading ? e("div", { className: "apiLoadingBox compact" }, "Exporting safe QA handoff locked archive...") : null,
      reviewQaHandoffRetentionManifestLoading ? e("div", { className: "apiLoadingBox compact" }, "Loading safe QA handoff retention manifest...") : null,
      reviewQaHandoffArchiveIntegrityLoading ? e("div", { className: "apiLoadingBox compact" }, "Checking safe QA handoff archive integrity...") : null,
      reviewQaHandoffRetentionAuditLoading ? e("div", { className: "apiLoadingBox compact" }, "Loading safe QA handoff retention audit...") : null,
      reviewQaHandoffArchiveFinalizationLoading ? e("div", { className: "apiLoadingBox compact" }, "Checking safe QA handoff archive finalization...") : null,
      reviewQaHandoffArchiveFinalizationSignOffLoading ? e("div", { className: "apiLoadingBox compact" }, "Signing off safe QA handoff archive finalization...") : null,
      reviewQaHandoffArchiveFinalizationReceiptLoading ? e("div", { className: "apiLoadingBox compact" }, "Loading safe QA handoff finalization receipt...") : null,
      reviewQaHandoffArchiveReleaseEvidenceLoading ? e("div", { className: "apiLoadingBox compact" }, "Loading safe QA archive release evidence...") : null,
      reviewQaHandoffArchiveReleaseVerificationLoading ? e("div", { className: "apiLoadingBox compact" }, "Verifying safe QA archive release evidence...") : null,
      reviewQaHandoffArchiveReleaseCertificationLoading ? e("div", { className: "apiLoadingBox compact" }, "Loading safe QA archive release certification...") : null,
      reviewQaHandoffArchiveReleaseClosureLedgerLoading ? e("div", { className: "apiLoadingBox compact" }, "Loading safe QA archive release closure ledger...") : null,
      reviewQaHandoffArchiveReleaseAttestationAuditLoading ? e("div", { className: "apiLoadingBox compact" }, "Loading safe QA archive release attestation audit...") : null,
      reviewQaHandoffArchiveReleaseAttestationReconciliationLoading ? e("div", { className: "apiLoadingBox compact" }, "Loading safe QA archive release attestation reconciliation...") : null,
      reviewQaHandoffCertifiedReleaseGateLoading ? e("div", { className: "apiLoadingBox compact" }, "Loading safe QA archive certified release gate...") : null,
      reviewQaHandoffCertifiedReleaseDecisionReceiptLoading ? e("div", { className: "apiLoadingBox compact" }, "Loading safe QA archive certified release decision receipt...") : null,
      reviewQaHandoffCertifiedReleaseHandoffPacketLoading ? e("div", { className: "apiLoadingBox compact" }, "Loading safe QA archive certified release handoff packet...") : null,
      reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordLoading ? e("div", { className: "apiLoadingBox compact" }, "Loading safe QA archive certified release handoff acceptance record...") : null,
      reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordAcknowledging ? e("div", { className: "apiLoadingBox compact" }, "Acknowledging safe QA archive certified release handoff checklist...") : null,
      reviewClosureReportExport ? e("div", { className: "webhookActionStatus", role: "status", "aria-live": "polite" },
        `Closure report export ${reviewClosureReportExport.format}: totalItems=${reviewClosureReportExport.totalItems}; evidenceReadyCount=${reviewClosureReportExport.evidenceReadyCount}; safeFilename=${reviewClosureReportExport.safeFilename}; externalCalls=${reviewClosureReportExport.externalCalls}`
      ) : null,
      reviewClosureReportExportManifest ? e("div", { className: "webhookActionStatus", role: "status", "aria-live": "polite" },
        `Closure report export manifest: target=${reviewClosureReportExportManifest.manifestTarget}; totalItems=${reviewClosureReportExportManifest.totalItems}; redaction=${reviewClosureReportExportManifest.redactionStatus}; integrity=${reviewClosureReportExportManifest.integrityStatus}; manual QA readiness=${reviewClosureReportExportManifest.manualQaReadiness}; safeFilename=${reviewClosureReportExportManifest.safeFilename}; safeDigest=${reviewClosureReportExportManifest.safeDigest}; externalCalls=${reviewClosureReportExportManifest.externalCalls}`
      ) : null,
      reviewQaHandoffBundle ? e("div", { className: "webhookActionStatus", role: "status", "aria-live": "polite" },
        `QA handoff bundle: readiness=${reviewQaHandoffBundle.manualQaReadiness}; totalItems=${reviewQaHandoffBundle.closureReportExport.totalItems}; evidenceManifests=${reviewQaHandoffBundle.evidenceManifests.length}; safeFilename=${reviewQaHandoffBundle.safeFilename}; safeDigest=${reviewQaHandoffBundle.safeDigest}; externalCalls=${reviewQaHandoffBundle.externalCalls}`
      ) : null,
      reviewQaHandoffBundleExport ? e("div", { className: "webhookActionStatus", role: "status", "aria-live": "polite" },
        `QA handoff bundle export: status=${reviewQaHandoffBundleExport.status}; totalItems=${reviewQaHandoffBundleExport.counts.totalItems}; evidenceManifests=${reviewQaHandoffBundleExport.counts.evidenceManifestCount}; safeFilename=${reviewQaHandoffBundleExport.safeFilename}; safeDigest=${reviewQaHandoffBundleExport.safeDigest}; externalCalls=${reviewQaHandoffBundleExport.externalCalls}`
      ) : null,
      reviewQaHandoffReceipt ? e("div", { className: "webhookActionStatus", role: "status", "aria-live": "polite" },
        `QA handoff receipt: receiptStatus=${reviewQaHandoffReceipt.receiptStatus}; bundleStatus=${reviewQaHandoffReceipt.bundleStatus}; exportStatus=${reviewQaHandoffReceipt.exportStatus}; totalItems=${reviewQaHandoffReceipt.counts.totalItems}; safeFilename=${reviewQaHandoffReceipt.safeFilename}; safeDigest=${reviewQaHandoffReceipt.safeDigest}; bundleDigest=${reviewQaHandoffReceipt.bundleDigest}; exportDigest=${reviewQaHandoffReceipt.exportDigest}; reviewer=${reviewQaHandoffReceipt.reviewerLabel ?? "none"}; signedAt=${reviewQaHandoffReceipt.signedAt ?? "none"}; externalCalls=${reviewQaHandoffReceipt.externalCalls}`
      ) : null,
      reviewQaHandoffSignOff ? e("div", { className: "webhookActionStatus", role: "status", "aria-live": "polite" },
        `QA handoff sign-off: signOffStatus=${reviewQaHandoffSignOff.signOffStatus}; action=${reviewQaHandoffSignOff.action}; recordId=${reviewQaHandoffSignOff.signOffRecordId}; safeDigest=${reviewQaHandoffSignOff.safeDigest}; signedAt=${reviewQaHandoffSignOff.signedAt ?? "none"}; externalCalls=${reviewQaHandoffSignOff.externalCalls}`
      ) : null,
      reviewQaHandoffAcceptanceLock ? e("div", { className: "webhookActionStatus", role: "status", "aria-live": "polite" },
        `QA handoff acceptance lock: status=${reviewQaHandoffAcceptanceLock.lockStatus}; action=${reviewQaHandoffAcceptanceLock.lockAction}; recordId=${reviewQaHandoffAcceptanceLock.lockRecordId ?? "none"}; lockedItems=${reviewQaHandoffAcceptanceLock.lockedItemCount}; lockedOpenItems=${reviewQaHandoffAcceptanceLock.lockedOpenItemCount}; safeDigest=${reviewQaHandoffAcceptanceLock.safeDigest}; lockedAt=${reviewQaHandoffAcceptanceLock.lockedAt ?? "none"}; externalCalls=${reviewQaHandoffAcceptanceLock.externalCalls}`
      ) : null,
      reviewQaHandoffLockedArchive ? e("div", { className: "webhookActionStatus", role: "status", "aria-live": "polite" },
        `QA handoff locked archive: lockedArchiveStatus=${reviewQaHandoffLockedArchive.lockedArchiveStatus}; retentionManifestStatus=${reviewQaHandoffLockedArchive.retentionManifestStatus}; archiveAcknowledgementStatus=${reviewQaHandoffLockedArchive.archiveAcknowledgementStatus}; safeFilename=${reviewQaHandoffLockedArchive.safeFilename}; safeDigest=${reviewQaHandoffLockedArchive.safeDigest}; lockedItems=${reviewQaHandoffLockedArchive.counts.lockedItemCount}; totalItems=${reviewQaHandoffLockedArchive.counts.totalItems}; externalCalls=${reviewQaHandoffLockedArchive.externalCalls}`
      ) : null,
      reviewQaHandoffLockedArchiveExport ? e("div", { className: "webhookActionStatus", role: "status", "aria-live": "polite" },
        `QA handoff locked archive export: status=${reviewQaHandoffLockedArchiveExport.lockedArchiveStatus}; exportKind=${reviewQaHandoffLockedArchiveExport.exportKind}; safeFilename=${reviewQaHandoffLockedArchiveExport.safeFilename}; safeDigest=${reviewQaHandoffLockedArchiveExport.safeDigest}; exportedAt=${reviewQaHandoffLockedArchiveExport.exportedAt}; externalCalls=${reviewQaHandoffLockedArchiveExport.externalCalls}`
      ) : null,
      reviewQaHandoffRetentionManifest ? e("div", { className: "webhookActionStatus", role: "status", "aria-live": "polite" },
        `QA handoff retention manifest: retentionManifestStatus=${reviewQaHandoffRetentionManifest.retentionManifestStatus}; retentionReadiness=${reviewQaHandoffRetentionManifest.retentionReadiness}; safeFilename=${reviewQaHandoffRetentionManifest.safeFilename}; safeDigest=${reviewQaHandoffRetentionManifest.safeDigest}; archiveDigest=${reviewQaHandoffRetentionManifest.archiveDigest}; externalCalls=${reviewQaHandoffRetentionManifest.externalCalls}`
      ) : null,
      reviewQaHandoffArchiveIntegrity ? e("div", { className: "webhookActionStatus", role: "status", "aria-live": "polite" },
        `QA archive integrity: integrityStatus=${reviewQaHandoffArchiveIntegrity.integrityStatus}; retentionAuditStatus=${reviewQaHandoffArchiveIntegrity.retentionAuditStatus}; lockedArchiveStatus=${reviewQaHandoffArchiveIntegrity.lockedArchiveStatus}; retentionManifestStatus=${reviewQaHandoffArchiveIntegrity.retentionManifestStatus}; digestChainStatus=${reviewQaHandoffArchiveIntegrity.digestChainStatus}; safeFilename=${reviewQaHandoffArchiveIntegrity.safeFilename}; safeDigest=${reviewQaHandoffArchiveIntegrity.safeDigest}; externalCalls=${reviewQaHandoffArchiveIntegrity.externalCalls}`
      ) : null,
      reviewQaHandoffRetentionAudit ? e("div", { className: "webhookActionStatus", role: "status", "aria-live": "polite" },
        `QA retention audit: retentionPolicyStatus=${reviewQaHandoffRetentionAudit.retentionPolicyStatus}; retentionAuditStatus=${reviewQaHandoffRetentionAudit.retentionAuditStatus}; retentionManifestStatus=${reviewQaHandoffRetentionAudit.retentionManifestStatus}; lockedArchiveStatus=${reviewQaHandoffRetentionAudit.lockedArchiveStatus}; digestChainStatus=${reviewQaHandoffRetentionAudit.digestChainStatus}; safeFilename=${reviewQaHandoffRetentionAudit.safeFilename}; safeDigest=${reviewQaHandoffRetentionAudit.safeDigest}; externalCalls=${reviewQaHandoffRetentionAudit.externalCalls}`
      ) : null,
      reviewQaHandoffArchiveFinalization ? e("div", { className: "webhookActionStatus", role: "status", "aria-live": "polite" },
        `QA archive finalization: finalizationStatus=${reviewQaHandoffArchiveFinalization.finalizationStatus}; retentionSignOffStatus=${reviewQaHandoffArchiveFinalization.retentionSignOffStatus}; finalizationReceiptStatus=${reviewQaHandoffArchiveFinalization.finalizationReceiptStatus}; integrityStatus=${reviewQaHandoffArchiveFinalization.integrityStatus}; retentionAuditStatus=${reviewQaHandoffArchiveFinalization.retentionAuditStatus}; digestChainStatus=${reviewQaHandoffArchiveFinalization.digestChainStatus}; safeFilename=${reviewQaHandoffArchiveFinalization.safeFilename}; safeDigest=${reviewQaHandoffArchiveFinalization.safeDigest}; externalCalls=${reviewQaHandoffArchiveFinalization.externalCalls}`
      ) : null,
      reviewQaHandoffArchiveFinalizationSignOff ? e("div", { className: "webhookActionStatus", role: "status", "aria-live": "polite" },
        `QA retention sign-off: retentionSignOffStatus=${reviewQaHandoffArchiveFinalizationSignOff.retentionSignOffStatus}; finalizationStatus=${reviewQaHandoffArchiveFinalizationSignOff.finalizationStatus}; finalizationReceiptStatus=${reviewQaHandoffArchiveFinalizationSignOff.finalizationReceiptStatus}; action=${reviewQaHandoffArchiveFinalizationSignOff.action}; safeFilename=${reviewQaHandoffArchiveFinalizationSignOff.safeFilename}; safeDigest=${reviewQaHandoffArchiveFinalizationSignOff.safeDigest}; signedAt=${reviewQaHandoffArchiveFinalizationSignOff.signedAt ?? "none"}; externalCalls=${reviewQaHandoffArchiveFinalizationSignOff.externalCalls}`
      ) : null,
      reviewQaHandoffArchiveFinalizationReceipt ? e("div", { className: "webhookActionStatus", role: "status", "aria-live": "polite" },
        `QA finalization receipt: receiptKind=${reviewQaHandoffArchiveFinalizationReceipt.receiptKind}; finalizationStatus=${reviewQaHandoffArchiveFinalizationReceipt.finalizationStatus}; retentionSignOffStatus=${reviewQaHandoffArchiveFinalizationReceipt.retentionSignOffStatus}; finalizationReceiptStatus=${reviewQaHandoffArchiveFinalizationReceipt.finalizationReceiptStatus}; digestChainStatus=${reviewQaHandoffArchiveFinalizationReceipt.digestChainStatus}; safeFilename=${reviewQaHandoffArchiveFinalizationReceipt.safeFilename}; safeDigest=${reviewQaHandoffArchiveFinalizationReceipt.safeDigest}; externalCalls=${reviewQaHandoffArchiveFinalizationReceipt.externalCalls}`
      ) : null,
      reviewQaHandoffArchiveReleaseEvidence ? e("div", { className: "webhookActionStatus", role: "status", "aria-live": "polite" },
        `QA archive release evidence: releaseReadinessStatus=${reviewQaHandoffArchiveReleaseEvidence.releaseReadinessStatus}; qaHandoffBundleReady=${reviewQaHandoffArchiveReleaseEvidence.prerequisiteChecklist.qaHandoffBundleReady}; qaHandoffExportReady=${reviewQaHandoffArchiveReleaseEvidence.prerequisiteChecklist.qaHandoffExportReady}; receiptSignedOff=${reviewQaHandoffArchiveReleaseEvidence.prerequisiteChecklist.receiptSignedOff}; acceptanceLocked=${reviewQaHandoffArchiveReleaseEvidence.prerequisiteChecklist.acceptanceLocked}; lockedArchiveExported=${reviewQaHandoffArchiveReleaseEvidence.prerequisiteChecklist.lockedArchiveExported}; retentionManifestReady=${reviewQaHandoffArchiveReleaseEvidence.prerequisiteChecklist.retentionManifestReady}; archiveIntegrityConfirmed=${reviewQaHandoffArchiveReleaseEvidence.prerequisiteChecklist.archiveIntegrityConfirmed}; retentionAuditConfirmed=${reviewQaHandoffArchiveReleaseEvidence.prerequisiteChecklist.retentionAuditConfirmed}; finalizationSignedOff=${reviewQaHandoffArchiveReleaseEvidence.prerequisiteChecklist.finalizationSignedOff}; finalizationReceiptReady=${reviewQaHandoffArchiveReleaseEvidence.prerequisiteChecklist.finalizationReceiptReady}; digestChainStatus=${reviewQaHandoffArchiveReleaseEvidence.digestChainStatus}; safeFilename=${reviewQaHandoffArchiveReleaseEvidence.safeFilename}; safeDigest=${reviewQaHandoffArchiveReleaseEvidence.safeDigest}; totalItems=${reviewQaHandoffArchiveReleaseEvidence.counts.totalItems}; prerequisites=${reviewQaHandoffArchiveReleaseEvidence.counts.prerequisitePassedCount}/${reviewQaHandoffArchiveReleaseEvidence.counts.prerequisiteTotalCount}; externalCalls=${reviewQaHandoffArchiveReleaseEvidence.externalCalls}`
      ) : null,
      reviewQaHandoffArchiveReleaseVerification ? e("div", { className: "webhookActionStatus", role: "status", "aria-live": "polite" },
        `QA archive release verification: verificationStatus=${reviewQaHandoffArchiveReleaseVerification.verificationStatus}; releaseReadinessStatus=${reviewQaHandoffArchiveReleaseVerification.releaseReadinessStatus}; digestChainStatus=${reviewQaHandoffArchiveReleaseVerification.digestChainStatus}; prerequisites=${reviewQaHandoffArchiveReleaseVerification.counts.prerequisitePassedCount}/${reviewQaHandoffArchiveReleaseVerification.counts.prerequisiteTotalCount}; digestRows=${reviewQaHandoffArchiveReleaseVerification.counts.digestMatrixVerifiedCount}/${reviewQaHandoffArchiveReleaseVerification.counts.digestMatrixRowCount}; safeFilename=${reviewQaHandoffArchiveReleaseVerification.safeFilename}; safeDigest=${reviewQaHandoffArchiveReleaseVerification.safeDigest}; releaseEvidenceDigest=${reviewQaHandoffArchiveReleaseVerification.releaseEvidenceDigest}; totalItems=${reviewQaHandoffArchiveReleaseVerification.counts.totalItems}; externalCalls=${reviewQaHandoffArchiveReleaseVerification.externalCalls}`
      ) : null,
      reviewQaHandoffArchiveReleaseCertification ? e("div", { className: "webhookActionStatus", role: "status", "aria-live": "polite" },
        `QA archive release certification: certificationStatus=${reviewQaHandoffArchiveReleaseCertification.certificationStatus}; releaseReadinessStatus=${reviewQaHandoffArchiveReleaseCertification.releaseReadinessStatus}; verificationStatus=${reviewQaHandoffArchiveReleaseCertification.verificationStatus}; digestChainStatus=${reviewQaHandoffArchiveReleaseCertification.digestChainStatus}; safeFilename=${reviewQaHandoffArchiveReleaseCertification.safeFilename}; safeDigest=${reviewQaHandoffArchiveReleaseCertification.safeDigest}; releaseEvidenceDigest=${reviewQaHandoffArchiveReleaseCertification.releaseEvidenceDigest}; releaseVerificationDigest=${reviewQaHandoffArchiveReleaseCertification.releaseVerificationDigest}; certificationChecks=${reviewQaHandoffArchiveReleaseCertification.counts.certificationChecklistPassedCount}/${reviewQaHandoffArchiveReleaseCertification.counts.certificationChecklistTotalCount}; digestRows=${reviewQaHandoffArchiveReleaseCertification.digestMatrixSummary.verifiedRows}/${reviewQaHandoffArchiveReleaseCertification.digestMatrixSummary.totalRows}; totalItems=${reviewQaHandoffArchiveReleaseCertification.counts.totalItems}; externalCalls=${reviewQaHandoffArchiveReleaseCertification.externalCalls}`
      ) : null,
      reviewQaHandoffArchiveReleaseClosureLedger ? e("div", { className: "webhookActionStatus", role: "status", "aria-live": "polite" },
        `QA archive release closure ledger: ledgerStatus=${reviewQaHandoffArchiveReleaseClosureLedger.ledgerStatus}; certificationStatus=${reviewQaHandoffArchiveReleaseClosureLedger.certificationStatus}; releaseReadinessStatus=${reviewQaHandoffArchiveReleaseClosureLedger.releaseReadinessStatus}; verificationStatus=${reviewQaHandoffArchiveReleaseClosureLedger.verificationStatus}; digestChainStatus=${reviewQaHandoffArchiveReleaseClosureLedger.digestChainStatus}; safeFilename=${reviewQaHandoffArchiveReleaseClosureLedger.safeFilename}; safeDigest=${reviewQaHandoffArchiveReleaseClosureLedger.safeDigest}; releaseCertificationDigest=${reviewQaHandoffArchiveReleaseClosureLedger.releaseCertificationDigest}; ledgerRows=${reviewQaHandoffArchiveReleaseClosureLedger.counts.ledgerClosedRowCount}/${reviewQaHandoffArchiveReleaseClosureLedger.counts.ledgerRowCount}; prerequisites=${reviewQaHandoffArchiveReleaseClosureLedger.counts.prerequisitePassedCount}/${reviewQaHandoffArchiveReleaseClosureLedger.counts.prerequisiteTotalCount}; certificationChecks=${reviewQaHandoffArchiveReleaseClosureLedger.counts.certificationChecklistPassedCount}/${reviewQaHandoffArchiveReleaseClosureLedger.counts.certificationChecklistTotalCount}; closureLedgerCheckedCount=${reviewQaHandoffArchiveReleaseClosureLedger.counts.closureLedgerCheckedCount}; externalCalls=${reviewQaHandoffArchiveReleaseClosureLedger.externalCalls}`
      ) : null,
      reviewQaHandoffArchiveReleaseAttestationAudit ? e("div", { className: "webhookActionStatus", role: "status", "aria-live": "polite" },
        `QA archive release attestation audit: attestationStatus=${reviewQaHandoffArchiveReleaseAttestationAudit.attestationStatus}; ledgerStatus=${reviewQaHandoffArchiveReleaseAttestationAudit.ledgerStatus}; certificationStatus=${reviewQaHandoffArchiveReleaseAttestationAudit.certificationStatus}; releaseReadinessStatus=${reviewQaHandoffArchiveReleaseAttestationAudit.releaseReadinessStatus}; verificationStatus=${reviewQaHandoffArchiveReleaseAttestationAudit.verificationStatus}; digestChainStatus=${reviewQaHandoffArchiveReleaseAttestationAudit.digestChainStatus}; safeFilename=${reviewQaHandoffArchiveReleaseAttestationAudit.safeFilename}; safeDigest=${reviewQaHandoffArchiveReleaseAttestationAudit.safeDigest}; closureLedgerDigest=${reviewQaHandoffArchiveReleaseAttestationAudit.closureLedgerDigest}; attestationRows=${reviewQaHandoffArchiveReleaseAttestationAudit.counts.attestationAttestedRowCount}/${reviewQaHandoffArchiveReleaseAttestationAudit.counts.attestationRowCount}; prerequisites=${reviewQaHandoffArchiveReleaseAttestationAudit.counts.prerequisitePassedCount}/${reviewQaHandoffArchiveReleaseAttestationAudit.counts.prerequisiteTotalCount}; certificationChecks=${reviewQaHandoffArchiveReleaseAttestationAudit.counts.certificationChecklistPassedCount}/${reviewQaHandoffArchiveReleaseAttestationAudit.counts.certificationChecklistTotalCount}; attestationAuditCheckedCount=${reviewQaHandoffArchiveReleaseAttestationAudit.counts.attestationAuditCheckedCount}; externalCalls=${reviewQaHandoffArchiveReleaseAttestationAudit.externalCalls}`
      ) : null,
      reviewQaHandoffArchiveReleaseAttestationReconciliation ? e("div", { className: "webhookActionStatus", role: "status", "aria-live": "polite" },
        `QA archive release attestation reconciliation: reconciliationStatus=${reviewQaHandoffArchiveReleaseAttestationReconciliation.reconciliationStatus}; attestationStatus=${reviewQaHandoffArchiveReleaseAttestationReconciliation.attestationStatus}; ledgerStatus=${reviewQaHandoffArchiveReleaseAttestationReconciliation.ledgerStatus}; certificationStatus=${reviewQaHandoffArchiveReleaseAttestationReconciliation.certificationStatus}; releaseReadinessStatus=${reviewQaHandoffArchiveReleaseAttestationReconciliation.releaseReadinessStatus}; verificationStatus=${reviewQaHandoffArchiveReleaseAttestationReconciliation.verificationStatus}; digestChainStatus=${reviewQaHandoffArchiveReleaseAttestationReconciliation.digestChainStatus}; safeFilename=${reviewQaHandoffArchiveReleaseAttestationReconciliation.safeFilename}; safeDigest=${reviewQaHandoffArchiveReleaseAttestationReconciliation.safeDigest}; attestationAuditDigest=${reviewQaHandoffArchiveReleaseAttestationReconciliation.attestationAuditDigest}; reconciliationDigest=${reviewQaHandoffArchiveReleaseAttestationReconciliation.reconciliationDigest}; reconciliationRows=${reviewQaHandoffArchiveReleaseAttestationReconciliation.counts.reconciliationAlignedRowCount}/${reviewQaHandoffArchiveReleaseAttestationReconciliation.counts.reconciliationRowCount}; exceptions=${reviewQaHandoffArchiveReleaseAttestationReconciliation.counts.reconciliationExceptionRowCount}; prerequisites=${reviewQaHandoffArchiveReleaseAttestationReconciliation.counts.prerequisitePassedCount}/${reviewQaHandoffArchiveReleaseAttestationReconciliation.counts.prerequisiteTotalCount}; certificationChecks=${reviewQaHandoffArchiveReleaseAttestationReconciliation.counts.certificationChecklistPassedCount}/${reviewQaHandoffArchiveReleaseAttestationReconciliation.counts.certificationChecklistTotalCount}; reconciliationCheckedCount=${reviewQaHandoffArchiveReleaseAttestationReconciliation.counts.reconciliationCheckedCount}; externalCalls=${reviewQaHandoffArchiveReleaseAttestationReconciliation.externalCalls}`
      ) : null,
      reviewQaHandoffCertifiedReleaseGate ? e("div", { className: "webhookActionStatus", role: "status", "aria-live": "polite" },
        `QA archive certified release gate: gateStatus=${reviewQaHandoffCertifiedReleaseGate.gateStatus}; goNoGoDecision=${reviewQaHandoffCertifiedReleaseGate.goNoGoDecision}; releaseReadinessStatus=${reviewQaHandoffCertifiedReleaseGate.releaseReadinessStatus}; reconciliationStatus=${reviewQaHandoffCertifiedReleaseGate.reconciliationStatus}; attestationStatus=${reviewQaHandoffCertifiedReleaseGate.attestationStatus}; ledgerStatus=${reviewQaHandoffCertifiedReleaseGate.ledgerStatus}; certificationStatus=${reviewQaHandoffCertifiedReleaseGate.certificationStatus}; verificationStatus=${reviewQaHandoffCertifiedReleaseGate.verificationStatus}; digestChainStatus=${reviewQaHandoffCertifiedReleaseGate.digestChainStatus}; safeFilename=${reviewQaHandoffCertifiedReleaseGate.safeFilename}; safeDigest=${reviewQaHandoffCertifiedReleaseGate.safeDigest}; releaseGateDigest=${reviewQaHandoffCertifiedReleaseGate.releaseGateDigest}; reconciliationDigest=${reviewQaHandoffCertifiedReleaseGate.reconciliationDigest}; gateChecklist=${reviewQaHandoffCertifiedReleaseGate.counts.gateChecklistPassedCount}/${reviewQaHandoffCertifiedReleaseGate.counts.gateChecklistTotalCount}; blockingReasons=${reviewQaHandoffCertifiedReleaseGate.counts.blockingReasonCount}; blockingReasonCodes=${reviewQaHandoffCertifiedReleaseGate.blockingReasons.map((reason) => reason.code).join(",") || "none"}; exceptions=${reviewQaHandoffCertifiedReleaseGate.counts.exceptionRowCount}; gateCheckedCount=${reviewQaHandoffCertifiedReleaseGate.counts.gateCheckedCount}; externalCalls=${reviewQaHandoffCertifiedReleaseGate.externalCalls}`
      ) : null,
      reviewQaHandoffCertifiedReleaseDecisionReceipt ? e("div", { className: "webhookActionStatus", role: "status", "aria-live": "polite" },
        `QA archive certified release decision receipt: receiptStatus=${reviewQaHandoffCertifiedReleaseDecisionReceipt.receiptStatus}; releaseDecision=${reviewQaHandoffCertifiedReleaseDecisionReceipt.releaseDecision}; gateStatus=${reviewQaHandoffCertifiedReleaseDecisionReceipt.gateStatus}; goNoGoDecision=${reviewQaHandoffCertifiedReleaseDecisionReceipt.goNoGoDecision}; releaseReadinessStatus=${reviewQaHandoffCertifiedReleaseDecisionReceipt.releaseReadinessStatus}; reconciliationStatus=${reviewQaHandoffCertifiedReleaseDecisionReceipt.reconciliationStatus}; attestationStatus=${reviewQaHandoffCertifiedReleaseDecisionReceipt.attestationStatus}; ledgerStatus=${reviewQaHandoffCertifiedReleaseDecisionReceipt.ledgerStatus}; certificationStatus=${reviewQaHandoffCertifiedReleaseDecisionReceipt.certificationStatus}; verificationStatus=${reviewQaHandoffCertifiedReleaseDecisionReceipt.verificationStatus}; digestChainStatus=${reviewQaHandoffCertifiedReleaseDecisionReceipt.digestChainStatus}; safeFilename=${reviewQaHandoffCertifiedReleaseDecisionReceipt.safeFilename}; safeDigest=${reviewQaHandoffCertifiedReleaseDecisionReceipt.safeDigest}; decisionReceiptDigest=${reviewQaHandoffCertifiedReleaseDecisionReceipt.decisionReceiptDigest}; releaseGateDigest=${reviewQaHandoffCertifiedReleaseDecisionReceipt.releaseGateDigest}; receiptRows=${reviewQaHandoffCertifiedReleaseDecisionReceipt.counts.receiptRowCompleteCount}/${reviewQaHandoffCertifiedReleaseDecisionReceipt.counts.receiptRowCount}; gateChecklist=${reviewQaHandoffCertifiedReleaseDecisionReceipt.counts.gateChecklistPassedCount}/${reviewQaHandoffCertifiedReleaseDecisionReceipt.counts.gateChecklistTotalCount}; blockingReasons=${reviewQaHandoffCertifiedReleaseDecisionReceipt.counts.blockingReasonCount}; blockingReasonCodes=${reviewQaHandoffCertifiedReleaseDecisionReceipt.inheritedBlockingReasons.map((reason) => reason.code).join(",") || "none"}; exceptions=${reviewQaHandoffCertifiedReleaseDecisionReceipt.counts.exceptionRowCount}; decisionReceiptCheckedCount=${reviewQaHandoffCertifiedReleaseDecisionReceipt.counts.decisionReceiptCheckedCount}; externalCalls=${reviewQaHandoffCertifiedReleaseDecisionReceipt.externalCalls}`
      ) : null,
      reviewQaHandoffCertifiedReleaseHandoffPacket ? e("div", { className: "webhookActionStatus", role: "status", "aria-live": "polite" },
        `QA archive certified release handoff packet: packetStatus=${reviewQaHandoffCertifiedReleaseHandoffPacket.packetStatus}; handoffStatus=${reviewQaHandoffCertifiedReleaseHandoffPacket.handoffStatus}; releaseDecision=${reviewQaHandoffCertifiedReleaseHandoffPacket.releaseDecision}; receiptStatus=${reviewQaHandoffCertifiedReleaseHandoffPacket.receiptStatus}; gateStatus=${reviewQaHandoffCertifiedReleaseHandoffPacket.gateStatus}; goNoGoDecision=${reviewQaHandoffCertifiedReleaseHandoffPacket.goNoGoDecision}; releaseReadinessStatus=${reviewQaHandoffCertifiedReleaseHandoffPacket.releaseReadinessStatus}; reconciliationStatus=${reviewQaHandoffCertifiedReleaseHandoffPacket.reconciliationStatus}; attestationStatus=${reviewQaHandoffCertifiedReleaseHandoffPacket.attestationStatus}; ledgerStatus=${reviewQaHandoffCertifiedReleaseHandoffPacket.ledgerStatus}; certificationStatus=${reviewQaHandoffCertifiedReleaseHandoffPacket.certificationStatus}; verificationStatus=${reviewQaHandoffCertifiedReleaseHandoffPacket.verificationStatus}; digestChainStatus=${reviewQaHandoffCertifiedReleaseHandoffPacket.digestChainStatus}; safeFilename=${reviewQaHandoffCertifiedReleaseHandoffPacket.safeFilename}; safeDigest=${reviewQaHandoffCertifiedReleaseHandoffPacket.safeDigest}; handoffPacketDigest=${reviewQaHandoffCertifiedReleaseHandoffPacket.handoffPacketDigest}; decisionReceiptDigest=${reviewQaHandoffCertifiedReleaseHandoffPacket.decisionReceiptDigest}; releaseGateDigest=${reviewQaHandoffCertifiedReleaseHandoffPacket.releaseGateDigest}; handoffRows=${reviewQaHandoffCertifiedReleaseHandoffPacket.counts.handoffRowCompleteCount}/${reviewQaHandoffCertifiedReleaseHandoffPacket.counts.handoffRowCount}; runbookRows=${reviewQaHandoffCertifiedReleaseHandoffPacket.counts.runbookRowReadyCount}/${reviewQaHandoffCertifiedReleaseHandoffPacket.counts.runbookRowCount}; operatorChecklist=${reviewQaHandoffCertifiedReleaseHandoffPacket.counts.operatorChecklistCompleteCount}/${reviewQaHandoffCertifiedReleaseHandoffPacket.counts.operatorChecklistItemCount}; operatorChecklistItems=${reviewQaHandoffCertifiedReleaseHandoffPacket.operatorChecklist.map((item) => `${item.key}:${item.checklistStatus}`).join(",")}; runbookRowStatuses=${reviewQaHandoffCertifiedReleaseHandoffPacket.runbookRows.map((row) => `${row.key}:${row.runbookStatus}`).join(",")}; blockingReasons=${reviewQaHandoffCertifiedReleaseHandoffPacket.counts.blockingReasonCount}; blockingReasonCodes=${reviewQaHandoffCertifiedReleaseHandoffPacket.inheritedBlockingReasons.map((reason) => reason.code).join(",") || "none"}; exceptions=${reviewQaHandoffCertifiedReleaseHandoffPacket.counts.exceptionRowCount}; releaseOwner=${reviewQaHandoffCertifiedReleaseHandoffPacket.releaseOwnerSummary.ownerRole}; handoffPacketCheckedCount=${reviewQaHandoffCertifiedReleaseHandoffPacket.counts.handoffPacketCheckedCount}; externalCalls=${reviewQaHandoffCertifiedReleaseHandoffPacket.externalCalls}`
      ) : null,
      reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord ? e("div", { className: "webhookActionStatus", role: "status", "aria-live": "polite" },
        `QA archive certified release handoff acceptance record: acceptanceStatus=${reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord.acceptanceStatus}; handoffStatus=${reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord.handoffStatus}; releaseDecision=${reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord.releaseDecision}; packetStatus=${reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord.packetStatus}; receiptStatus=${reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord.receiptStatus}; gateStatus=${reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord.gateStatus}; goNoGoDecision=${reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord.goNoGoDecision}; releaseReadinessStatus=${reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord.releaseReadinessStatus}; reconciliationStatus=${reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord.reconciliationStatus}; attestationStatus=${reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord.attestationStatus}; ledgerStatus=${reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord.ledgerStatus}; certificationStatus=${reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord.certificationStatus}; verificationStatus=${reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord.verificationStatus}; digestChainStatus=${reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord.digestChainStatus}; safeFilename=${reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord.safeFilename}; safeDigest=${reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord.safeDigest}; acceptanceRecordDigest=${reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord.acceptanceRecordDigest}; handoffPacketDigest=${reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord.handoffPacketDigest}; decisionReceiptDigest=${reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord.decisionReceiptDigest}; releaseGateDigest=${reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord.releaseGateDigest}; operatorChecklist=${reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord.counts.operatorChecklistCompleteCount}/${reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord.counts.operatorChecklistItemCount}; operatorChecklistItems=${reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord.operatorChecklist.map((item) => `${item.key}:${item.checklistStatus}`).join(",")}; acknowledgedChecklist=${reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord.counts.acknowledgedChecklistCompleteCount}/${reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord.counts.acknowledgedChecklistItemCount}; acknowledgedChecklistItems=${reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord.acknowledgedChecklist.map((item) => `${item.key}:${item.acknowledgementStatus}`).join(",")}; acknowledgementRows=${reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord.counts.acknowledgementRowCompleteCount}/${reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord.counts.acknowledgementRowCount}; acknowledgementRowStatuses=${reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord.acknowledgementRows.map((row) => `${row.key}:${row.acknowledgementStatus}`).join(",")}; handoffPacketSummary=${reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord.inheritedHandoffPacketSummary.packetStatus}/${reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord.inheritedHandoffPacketSummary.handoffStatus}; decisionReceiptExternalCallsZero=${String(reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord.inheritedDecisionReceiptSummary.externalCallsZero)}; blockingReasons=${reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord.counts.blockingReasonCount}; blockingReasonCodes=${reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord.inheritedBlockingReasons.map((reason) => reason.code).join(",") || "none"}; exceptions=${reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord.counts.exceptionRowCount}; releaseOwner=${reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord.releaseOwnerSummary.ownerRole}; operatorChecklistAcknowledged=${String(reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord.releaseOwnerSummary.operatorChecklistAcknowledged)}; acceptanceRecordCheckedCount=${reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord.counts.acceptanceRecordCheckedCount}; acceptanceRecordMutationCount=${reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord.counts.acceptanceRecordMutationCount}; externalCalls=${reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord.externalCalls}`
      ) : null,
      reviewQaHandoffLockedArchive ? e("div", { className: "webhookMetricGroups twoColumn" },
        e("div", null,
          e("strong", null, "QA locked archive digest chain"),
          e("span", null, `receiptDigest=${reviewQaHandoffLockedArchive.receiptDigest}`),
          e("span", null, `bundleDigest=${reviewQaHandoffLockedArchive.bundleDigest}`),
          e("span", null, `exportDigest=${reviewQaHandoffLockedArchive.exportDigest}`),
          e("span", null, `acceptanceLockDigest=${reviewQaHandoffLockedArchive.acceptanceLockDigest}`),
          e("span", null, `retentionPolicyLabel=${reviewQaHandoffLockedArchive.retentionPolicyLabel}`)
        ),
        e("div", null,
          e("strong", null, "QA locked archive counts"),
          e("span", null, `lockedItemCount=${reviewQaHandoffLockedArchive.counts.lockedItemCount}`),
          e("span", null, `lockedOpenItemCount=${reviewQaHandoffLockedArchive.counts.lockedOpenItemCount}`),
          e("span", null, `evidenceManifestCount=${reviewQaHandoffLockedArchive.counts.evidenceManifestCount}`),
          e("span", null, `closureEvidenceReadyCount=${reviewQaHandoffLockedArchive.counts.closureEvidenceReadyCount}`),
          e("span", null, `externalCalls=${reviewQaHandoffLockedArchive.externalCalls}`)
        )
      ) : null,
      reviewQaHandoffRetentionManifest ? e("div", { className: "webhookMetricGroups twoColumn" },
        e("div", null,
          e("strong", null, "QA retention manifest status"),
          e("span", null, `lockedArchiveStatus=${reviewQaHandoffRetentionManifest.lockedArchiveStatus}`),
          e("span", null, `archiveAcknowledgementStatus=${reviewQaHandoffRetentionManifest.archiveAcknowledgementStatus}`),
          e("span", null, `retentionPolicyLabel=${reviewQaHandoffRetentionManifest.retentionPolicyLabel}`),
          e("span", null, `archivedAt=${reviewQaHandoffRetentionManifest.archivedAt ?? "none"}`),
          e("span", null, `exportedAt=${reviewQaHandoffRetentionManifest.exportedAt ?? "none"}`)
        ),
        e("div", null,
          e("strong", null, "QA retention manifest safety"),
          e("span", null, `providerOutboundAbsent=${String(reviewQaHandoffRetentionManifest.manualQaChecks.providerOutboundAbsent)}`),
          e("span", null, `externalCallsZero=${String(reviewQaHandoffRetentionManifest.manualQaChecks.externalCallsZero)}`),
          e("span", null, `rawPayloadAbsent=${String(reviewQaHandoffRetentionManifest.manualQaChecks.rawPayloadAbsent)}`),
          e("span", null, `rawSignatureAbsent=${String(reviewQaHandoffRetentionManifest.manualQaChecks.rawSignatureAbsent)}`)
        )
      ) : null,
      reviewQaHandoffArchiveIntegrity ? e("div", { className: "webhookMetricGroups twoColumn" },
        e("div", null,
          e("strong", null, "QA archive integrity digest chain"),
          e("span", null, `bundleDigest=${reviewQaHandoffArchiveIntegrity.bundleDigest}`),
          e("span", null, `exportDigest=${reviewQaHandoffArchiveIntegrity.exportDigest}`),
          e("span", null, `receiptDigest=${reviewQaHandoffArchiveIntegrity.receiptDigest}`),
          e("span", null, `acceptanceLockDigest=${reviewQaHandoffArchiveIntegrity.acceptanceLockDigest}`),
          e("span", null, `lockedArchiveDigest=${reviewQaHandoffArchiveIntegrity.lockedArchiveDigest}`),
          e("span", null, `retentionManifestDigest=${reviewQaHandoffArchiveIntegrity.retentionManifestDigest}`)
        ),
        e("div", null,
          e("strong", null, "QA archive integrity counts"),
          e("span", null, `digestChainLinkCount=${reviewQaHandoffArchiveIntegrity.counts.digestChainLinkCount}`),
          e("span", null, `integrityCheckedCount=${reviewQaHandoffArchiveIntegrity.counts.integrityCheckedCount}`),
          e("span", null, `lockedItemCount=${reviewQaHandoffArchiveIntegrity.counts.lockedItemCount}`),
          e("span", null, `safeCheckLabels=${reviewQaHandoffArchiveIntegrity.safeCheckLabels.join("|")}`),
          e("span", null, `externalCalls=${reviewQaHandoffArchiveIntegrity.externalCalls}`)
        )
      ) : null,
      reviewQaHandoffRetentionAudit ? e("div", { className: "webhookMetricGroups twoColumn" },
        e("div", null,
          e("strong", null, "QA retention audit policy"),
          e("span", null, `safePolicyLabel=${reviewQaHandoffRetentionAudit.safePolicyLabel}`),
          e("span", null, `safeRetentionWindowLabel=${reviewQaHandoffRetentionAudit.safeRetentionWindowLabel}`),
          e("span", null, `auditAcknowledgementStatus=${reviewQaHandoffRetentionAudit.auditAcknowledgementStatus}`),
          e("span", null, `lockedArchiveDigest=${reviewQaHandoffRetentionAudit.lockedArchiveDigest}`),
          e("span", null, `retentionManifestDigest=${reviewQaHandoffRetentionAudit.retentionManifestDigest}`)
        ),
        e("div", null,
          e("strong", null, "QA retention audit checklist"),
          e("span", null, `auditChecklistPassedCount=${reviewQaHandoffRetentionAudit.counts.auditChecklistPassedCount}`),
          e("span", null, `auditChecklistNeedsReviewCount=${reviewQaHandoffRetentionAudit.counts.auditChecklistNeedsReviewCount}`),
          e("span", null, `auditChecklistBlockedCount=${reviewQaHandoffRetentionAudit.counts.auditChecklistBlockedCount}`),
          e("span", null, `auditChecklistItems=${reviewQaHandoffRetentionAudit.auditChecklistItems.map((item) => `${item.key}:${item.status}`).join("|")}`),
          e("span", null, `externalCalls=${reviewQaHandoffRetentionAudit.externalCalls}`)
        )
      ) : null,
      reviewQaHandoffAcceptanceLock ? e("div", { className: "webhookMetricGroups twoColumn" },
        e("div", null,
          e("strong", null, "QA acceptance lock checks"),
          e("span", null, `receiptSignedOff=${String(reviewQaHandoffAcceptanceLock.acceptanceChecks.receiptSignedOff)}`),
          e("span", null, `bundleDigestMatches=${String(reviewQaHandoffAcceptanceLock.acceptanceChecks.bundleDigestMatches)}`),
          e("span", null, `exportDigestMatches=${String(reviewQaHandoffAcceptanceLock.acceptanceChecks.exportDigestMatches)}`),
          e("span", null, `lockedItemScopePresent=${String(reviewQaHandoffAcceptanceLock.acceptanceChecks.lockedItemScopePresent)}`),
          e("span", null, `providerOutboundAbsent=${String(reviewQaHandoffAcceptanceLock.acceptanceChecks.providerOutboundAbsent)}`),
          e("span", null, `externalCallsZero=${String(reviewQaHandoffAcceptanceLock.acceptanceChecks.externalCallsZero)}`)
        ),
        e("div", null,
          e("strong", null, "QA acceptance lock receipt"),
          e("span", null, `receiptStatus=${reviewQaHandoffAcceptanceLock.receiptStatus}`),
          e("span", null, `bundleStatus=${reviewQaHandoffAcceptanceLock.bundleStatus}`),
          e("span", null, `exportStatus=${reviewQaHandoffAcceptanceLock.exportStatus}`),
          e("span", null, `receiptDigest=${reviewQaHandoffAcceptanceLock.receiptDigest}`),
          e("span", null, `bundleDigest=${reviewQaHandoffAcceptanceLock.bundleDigest}`),
          e("span", null, `exportDigest=${reviewQaHandoffAcceptanceLock.exportDigest}`)
        )
      ) : null,
      reviewQaHandoffBundleExport ? e("div", { className: "webhookMetricGroups twoColumn" },
        e("div", null,
          e("strong", null, "QA handoff export readiness"),
          e("span", null, `reviewExportQaHandoffEnabled=${String(reviewQaHandoffBundleExport.readinessFlags.reviewExportQaHandoffEnabled)}`),
          e("span", null, `closureReportExportEnabled=${String(reviewQaHandoffBundleExport.readinessFlags.reviewClosureReportExportEnabled)}`),
          e("span", null, `manifestReady=${reviewQaHandoffBundleExport.exportManifestSummary.readyCount}`),
          e("span", null, `manifestNeedsReview=${reviewQaHandoffBundleExport.exportManifestSummary.needsReviewCount}`),
          e("span", null, `manifestBlocked=${reviewQaHandoffBundleExport.exportManifestSummary.blockedCount}`)
        ),
        e("div", null,
          e("strong", null, "QA handoff export safety"),
          e("span", null, `redaction=${reviewQaHandoffBundleExport.redactionAuditSummary.status}`),
          e("span", null, `integrity=${reviewQaHandoffBundleExport.integritySummary.status}`),
          e("span", null, `deterministic=${String(reviewQaHandoffBundleExport.integritySummary.deterministicExportConfirmed)}`),
          e("span", null, `providerOutboundAbsent=${String(reviewQaHandoffBundleExport.redactionAuditSummary.providerOutboundAbsent)}`),
          e("span", null, `externalCallsZero=${String(reviewQaHandoffBundleExport.redactionAuditSummary.externalCallsZero)}`)
        )
      ) : null,
      reviewQaHandoffBundle ? e("div", { className: "webhookMetricGroups twoColumn" },
        e("div", null,
          e("strong", null, "QA handoff readiness"),
          e("span", null, `reportManifestReady=${String(reviewQaHandoffBundle.manualQaChecks.reportManifestReady)}`),
          e("span", null, `reportRedactionPassedOrWarned=${String(reviewQaHandoffBundle.manualQaChecks.reportRedactionPassedOrWarned)}`),
          e("span", null, `reportIntegrityConfirmed=${String(reviewQaHandoffBundle.manualQaChecks.reportIntegrityConfirmed)}`),
          e("span", null, `evidenceManifestsReadyOrNeedsReview=${String(reviewQaHandoffBundle.manualQaChecks.evidenceManifestsReadyOrNeedsReview)}`),
          e("span", null, `providerOutboundAbsent=${String(reviewQaHandoffBundle.manualQaChecks.providerOutboundAbsent)}`),
          e("span", null, `externalCallsZero=${String(reviewQaHandoffBundle.manualQaChecks.externalCallsZero)}`)
        ),
        e("div", null,
          e("strong", null, "QA handoff readiness counts"),
          e("span", null, `closureEvidenceReady=${reviewQaHandoffBundle.readiness.closureEvidenceReadyCount}`),
          e("span", null, `closureEvidenceBlocked=${reviewQaHandoffBundle.readiness.closureEvidenceBlockedCount}`),
          e("span", null, `closureEvidenceIncomplete=${reviewQaHandoffBundle.readiness.closureEvidenceIncompleteCount}`),
          e("span", null, `manifestReady=${reviewQaHandoffBundle.readiness.exportManifestReadyCount}`),
          e("span", null, `manifestNeedsReview=${reviewQaHandoffBundle.readiness.exportManifestNeedsReviewCount}`),
          e("span", null, `manifestBlocked=${reviewQaHandoffBundle.readiness.exportManifestBlockedCount}`)
        )
      ) : null,
      reviewQaHandoffBundle && reviewQaHandoffBundle.evidenceManifests.length > 0 ? e("div", { className: "webhookEventList compact", "aria-label": "QA handoff evidence manifest summaries" },
        ...reviewQaHandoffBundle.evidenceManifests.map((item) => e("article", { key: `${item.unmatchedId}-${item.safeDigest}`, className: "webhookHistoryRow" },
          e("strong", null, `${item.manualQaReadiness} / ${item.evidenceStatus} / ${providerLabel(item.provider)}`),
          e("span", null, `unmatchedId=${item.unmatchedId}`),
          e("span", null, `safeRoomLabel=${item.safeRoomLabel}`),
          e("span", null, `roomKeyDigest=${item.roomKeyDigest ?? "none"}`),
          e("span", null, `safeFilename=${item.safeFilename}`),
          e("span", null, `safeDigest=${item.safeDigest}`),
          e("span", null, `redaction=${item.redactionStatus}`),
          e("span", null, `integrity=${item.integrityStatus}`),
          e("span", null, `externalCalls=${item.externalCalls}`)
        ))
      ) : null,
      reviewClosureReportRedactionAudit ? e("div", { className: "webhookActionStatus", role: "status", "aria-live": "polite" },
        `Closure report redaction audit status=${reviewClosureReportRedactionAudit.status}; rawPayloadAbsent=${reviewClosureReportRedactionAudit.checks.rawPayloadAbsent}; tokenAbsent=${reviewClosureReportRedactionAudit.checks.tokenAbsent}; replyTokenAbsent=${reviewClosureReportRedactionAudit.checks.replyTokenAbsent}; rawSenderIdAbsent=${reviewClosureReportRedactionAudit.checks.rawSenderIdAbsent}; rawRoomIdAbsent=${reviewClosureReportRedactionAudit.checks.rawRoomIdAbsent}; externalCalls=${reviewClosureReportRedactionAudit.externalCalls}`
      ) : null,
      reviewClosureReportRedactionAudit && reviewClosureReportRedactionAudit.issues.length > 0 ? e("div", { className: "webhookMetricGroups twoColumn" },
        e("div", null,
          e("strong", null, "Report redaction audit issues"),
          ...reviewClosureReportRedactionAudit.issues.map((issue) => e("span", { key: issue.code }, `${issue.severity}:${issue.safeLabel}; action=${issue.recommendedAction}`))
        )
      ) : null,
      reviewClosureExportIntegrity ? e("div", { className: "webhookActionStatus", role: "status", "aria-live": "polite" },
        `Export integrity: totalCheckedItems=${reviewClosureExportIntegrity.totalCheckedItems}; passed=${reviewClosureExportIntegrity.redactionPassedCount}; warning=${reviewClosureExportIntegrity.redactionWarningCount}; blocked=${reviewClosureExportIntegrity.redactionBlockedCount}; deterministic=${String(reviewClosureExportIntegrity.deterministicExportConfirmed)}; externalCalls=${reviewClosureExportIntegrity.externalCalls}`
      ) : null,
      reviewClosureReport ? e("div", { className: "webhookMetricsGrid" },
        metricFilterButton("total evidence items", reviewClosureReport.totalItems, {}),
        metricFilterButton("open evidence items", reviewClosureReport.totalOpenItems, { status: "open" }),
        metricFilterButton("evidence ready", reviewClosureReport.evidenceReadyCount, {}),
        metricFilterButton("evidence blocked", reviewClosureReport.evidenceBlockedCount, { closureReadiness: "BLOCKED" }),
        metricFilterButton("evidence incomplete", reviewClosureReport.evidenceIncompleteCount, { checklistIncomplete: true }),
        metricFilterButton("redaction passed", reviewClosureExportIntegrity?.redactionPassedCount ?? 0, {}),
        metricFilterButton("redaction warning", reviewClosureExportIntegrity?.redactionWarningCount ?? 0, {}),
        metricFilterButton("redaction blocked", reviewClosureExportIntegrity?.redactionBlockedCount ?? 0, {})
      ) : !reviewClosureReportLoading && !reviewClosureReportError ? e("div", { className: "providerEmptyState" }, "No closure evidence report returned.") : null,
      reviewClosureReport ? e("div", { className: "webhookMetricGroups" },
        metricCountGroup("By closure readiness", reviewClosureReport.byClosureReadiness, (key) => ({ closureReadiness: key as ProviderWebhookUnmatchedInboundFilters["closureReadiness"] })),
        metricCountGroup("By resolution outcome", reviewClosureReport.byResolutionOutcome, (key) => key === "none" ? { resolutionStatus: "unresolved" } : { resolutionOutcome: key as ProviderWebhookReviewResolutionOutcome }),
        metricCountGroup("By incomplete checklist step", reviewClosureReport.byChecklistStep, () => ({ checklistIncomplete: true })),
        metricCountGroup("By assignment status", reviewClosureReport.byAssignmentStatus, (key) => ({ assignmentStatus: key as ProviderWebhookUnmatchedInboundFilters["assignmentStatus"] })),
        metricCountGroup("By escalation status", reviewClosureReport.byEscalationStatus, (key) => ({ escalationStatus: key as ProviderWebhookUnmatchedInboundFilters["escalationStatus"] }))
      ) : null,
      reviewClosureReport && (reviewClosureReport.topEvidenceReadyItems.length > 0 || reviewClosureReport.topEvidenceBlockedItems.length > 0) ? e("div", { className: "webhookEventList compact", "aria-label": "Top closure evidence summaries" },
        ...[...reviewClosureReport.topEvidenceReadyItems, ...reviewClosureReport.topEvidenceBlockedItems].slice(0, 10).map((item) => e("article", { key: `${item.unmatchedId}-${item.evidenceStatus}-${item.closureReadiness}`, className: "webhookHistoryRow" },
          e("strong", null, `${item.evidenceStatus} / ${item.closureReadiness} / ${providerLabel(item.provider)}`),
          e("span", null, `unmatchedId=${item.unmatchedId}`),
          e("span", null, `platform=${item.platform}`),
          e("span", null, `channelAccountId=${item.channelAccountId ?? "none"}`),
          e("span", null, `safeRoomLabel=${item.safeRoomLabel}`),
          e("span", null, `roomKeyDigest=${item.roomKeyDigest ?? "none"}`),
          e("span", null, `eventType=${item.eventType}`),
          e("span", null, `ageBucket=${item.ageBucket}`),
          e("span", null, `reviewStatus=${item.reviewStatus}`),
          e("span", null, `linkStatus=${item.linkStatus}`),
          e("span", null, `unmatchedStatus=${item.unmatchedStatus}`),
          e("span", null, `assignmentStatus=${item.assignmentStatus}`),
          e("span", null, `assignedTo=${item.assignedToOperatorLabel ?? "none"}`),
          e("span", null, `escalationStatus=${item.escalationStatus}`),
          e("span", null, `escalationReason=${item.escalationReason ?? "none"}`),
          e("span", null, `resolutionStatus=${item.resolutionStatus}`),
          e("span", null, `resolutionOutcome=${item.resolutionOutcome ?? "none"}`),
          e("span", null, `checklist=${item.checklistCompletedCount}/${item.checklistTotalCount}`),
          e("span", null, `incompleteSteps=${item.checklistIncompleteSteps.join("|") || "none"}`),
          e("span", null, `historyEntryCount=${item.historyEntryCount}`),
          e("span", null, `operatorNoteCount=${item.operatorNoteCount}`),
          e("span", null, `candidateSummaryCount=${item.candidateSummaryCount}`),
          ...Object.entries(item.evidenceFlags).map(([key, value]) => e("span", { key }, `${key}=${String(value)}`)),
          e("span", null, `recommendedNextActions=${item.recommendedNextActions.join("|") || "none"}`),
          e("span", null, `externalCalls=${item.externalCalls}`)
        ))
      ) : reviewClosureReport && !reviewClosureReportLoading ? e("div", { className: "providerEmptyState" }, "No top ready or blocked closure evidence summaries.") : null
    ),
    e("div", { className: "webhookEventSurface", "aria-label": "Provider webhook review saved views" },
      e("div", { className: "webhookEventHeader" },
        e("div", { className: "channelPanelTop" },
          e(Star, { size: 18 }),
          e("div", null,
            e("h3", null, "Saved review views"),
            e("p", null, "Safe filter presets only. Applying a view updates filters without review, skip, link, or message persistence.")
          )
        ),
        e("div", { className: "webhookLastEvent", "aria-label": "Saved views status" },
          e("span", null, `saved view count=${reviewSavedViews.length}`),
          e("span", null, `externalCalls=${reviewSavedViews.every((view) => view.externalCalls === 0) ? 0 : "check"}`)
        )
      ),
      reviewSavedViewsError ? e("div", { className: "apiErrorBox compact", role: "alert" }, reviewSavedViewsError) : null,
      reviewSavedViewsLoading ? e("div", { className: "apiLoadingBox compact" }, "Loading saved review views...") : null,
      reviewSavedViewActionStatus ? e("div", { className: "webhookActionStatus", role: "status", "aria-live": "polite" }, reviewSavedViewActionStatus) : null,
      e("form", { className: "webhookEventForm", onSubmit: submitSavedView },
        e("label", { className: "settingsInlineField" },
          e("span", null, "View name"),
          e("input", {
            value: savedViewName,
            maxLength: 80,
            onChange: (event: React.ChangeEvent<HTMLInputElement>) => setSavedViewName(event.target.value),
            placeholder: "Current review queue"
          })
        ),
        e("label", { className: "settingsInlineField" },
          e("span", null, "Description"),
          e("input", {
            value: savedViewDescription,
            maxLength: 240,
            onChange: (event: React.ChangeEvent<HTMLInputElement>) => setSavedViewDescription(event.target.value),
            placeholder: "optional safe label"
          })
        ),
        e("label", { className: "webhookSelectRow" },
          e("input", {
            type: "checkbox",
            checked: savedViewPinned,
            onChange: (event: React.ChangeEvent<HTMLInputElement>) => setSavedViewPinned(event.target.checked)
          }),
          e("span", null, "Pin")
        ),
        e("label", { className: "webhookSelectRow" },
          e("input", {
            type: "checkbox",
            checked: savedViewDefault,
            onChange: (event: React.ChangeEvent<HTMLInputElement>) => setSavedViewDefault(event.target.checked)
          }),
          e("span", null, "Default")
        ),
        e("button", {
          className: "webhookEventButton",
          type: "submit",
          disabled: reviewSavedViewSaving || !savedViewName.trim() || !onCreateSavedView
        },
          e(Star, { size: 15 }),
          reviewSavedViewSaving ? "Saving view..." : "Save current filters"
        )
      ),
      reviewSavedViews.length > 0 ? e("div", { className: "webhookEventList compact" },
        ...reviewSavedViews.map((view) => e("article", { key: view.id, className: "webhookHistoryRow" },
          e("strong", null, view.name),
          view.description ? e("span", null, `description=${view.description}`) : null,
          e("span", null, `filters=${formatSavedViewFilters(view)}`),
          e("span", null, `sort=${view.sort.sortBy} ${view.sort.sortDirection}`),
          e("span", null, `pinned=${String(view.pinned)}`),
          e("span", null, `default=${String(view.isDefault)}`),
          e("span", null, `archived=${String(view.archived)}`),
          e("span", null, `createdBy=${view.createdBy ?? "system"}`),
          e("span", null, `updatedAt=${formatDate(view.updatedAt)}`),
          e("span", null, `externalCalls=${view.externalCalls}`),
          e("div", { className: "webhookEventActions" },
            e("button", {
              className: "webhookEventButton",
              type: "button",
              disabled: !onApplySavedView,
              onClick: () => onApplySavedView?.(view)
            },
              e(Pin, { size: 15 }),
              "Apply saved view"
            ),
            e("button", {
              className: "webhookEventButton",
              type: "button",
              disabled: reviewSavedViewSaving || !onArchiveSavedView,
              onClick: () => void onArchiveSavedView?.(view.id)
            },
              e(X, { size: 15 }),
              "Archive"
            )
          )
        ))
      ) : !reviewSavedViewsLoading && !reviewSavedViewsError ? e("div", { className: "providerEmptyState" }, "No saved review views yet.") : null
    ),
    e("div", { className: "webhookEventSurface", "aria-label": "Unmatched inbound review queue" },
      e("div", { className: "webhookEventHeader" },
        e("div", null,
          e("h3", null, "Unmatched inbound review"),
          e("p", null, "Sandbox no-match queue with safe digests only.")
        ),
        e("div", { className: "providerReadinessSummary", "aria-label": "Unmatched inbound queue summary" },
          e("span", null, `visible unmatched count=${unmatchedInboundItems.length}`),
          e("span", null, `total unmatched count=${pagination.totalCount}`),
          e("span", null, `page size=${pagination.limit}`),
          e("span", null, `page offset=${pagination.offset}`),
          e("span", null, `applied sort=${appliedSort.sortBy} ${appliedSort.sortOrder}`),
          e("span", null, `selected count=${selectedUnmatchedIds.length}`),
          e("span", null, `visible open count=${queueSummary.open}`),
          e("span", null, `visible reviewed count=${queueSummary.reviewed}`),
          e("span", null, `visible skipped count=${queueSummary.skipped}`),
          e("span", null, `visible linked count=${queueSummary.linked}`),
          unmatchedPageSummary ? e("span", null, `filtered open count=${unmatchedPageSummary.openCount}`) : null
        )
      ),
      e("div", { className: "webhookEventForm", "aria-label": "Unmatched inbound queue filters" },
        e("label", { className: "settingsInlineField" },
          e("span", null, "Provider filter"),
          e("select", {
            value: unmatchedFilters.provider ?? "all",
            onChange: (event: React.ChangeEvent<HTMLSelectElement>) => updateQueueFilters({ provider: event.target.value === "all" ? undefined : event.target.value as ProviderWebhookUnmatchedInboundFilters["provider"] })
          },
            e("option", { value: "all" }, "All providers"),
            ...providers.map((item) => e("option", { key: item, value: item }, providerLabel(item)))
          )
        ),
        e("label", { className: "settingsInlineField" },
          e("span", null, "Review status"),
          e("select", {
            value: unmatchedFilters.reviewStatus ?? "all",
            onChange: (event: React.ChangeEvent<HTMLSelectElement>) => updateQueueFilters({ reviewStatus: event.target.value === "all" ? undefined : event.target.value as ProviderWebhookUnmatchedInboundFilters["reviewStatus"] })
          },
            e("option", { value: "all" }, "All review"),
            ...reviewStatuses.map((item) => e("option", { key: item, value: item }, item))
          )
        ),
        e("label", { className: "settingsInlineField" },
          e("span", null, "Link status"),
          e("select", {
            value: unmatchedFilters.linkStatus ?? "all",
            onChange: (event: React.ChangeEvent<HTMLSelectElement>) => updateQueueFilters({ linkStatus: event.target.value === "all" ? undefined : event.target.value as ProviderWebhookUnmatchedInboundFilters["linkStatus"] })
          },
            e("option", { value: "all" }, "All links"),
            ...linkStatuses.map((item) => e("option", { key: item, value: item }, item))
          )
        ),
        e("label", { className: "settingsInlineField" },
          e("span", null, "Queue status"),
          e("select", {
            value: unmatchedFilters.status ?? "all",
            onChange: (event: React.ChangeEvent<HTMLSelectElement>) => updateQueueFilters({ status: event.target.value === "all" ? undefined : event.target.value as ProviderWebhookUnmatchedInboundFilters["status"] })
          },
            e("option", { value: "all" }, "All queue"),
            ...queueStatuses.map((item) => e("option", { key: item, value: item }, item))
          )
        ),
        e("label", { className: "settingsInlineField" },
          e("span", null, "Unmatched status"),
          e("select", {
            value: unmatchedFilters.unmatchedStatus ?? "all",
            onChange: (event: React.ChangeEvent<HTMLSelectElement>) => updateQueueFilters({ unmatchedStatus: event.target.value === "all" ? undefined : event.target.value as ProviderWebhookUnmatchedInboundFilters["unmatchedStatus"] })
          },
            e("option", { value: "all" }, "All unmatched"),
            ...unmatchedStatuses.map((item) => e("option", { key: item, value: item }, item))
          )
        ),
        e("label", { className: "settingsInlineField" },
          e("span", null, "Event type"),
          e("select", {
            value: unmatchedFilters.eventType ?? "all",
            onChange: (event: React.ChangeEvent<HTMLSelectElement>) => updateQueueFilters({ eventType: event.target.value === "all" ? undefined : event.target.value as ProviderWebhookEventType })
          },
            e("option", { value: "all" }, "All events"),
            ...eventTypes.map((item) => e("option", { key: item, value: item }, item))
          )
        ),
        e("label", { className: "settingsInlineField" },
          e("span", null, "Assigned to"),
          e("input", {
            value: unmatchedFilters.assignedTo ?? "",
            onChange: (event: React.ChangeEvent<HTMLInputElement>) => updateQueueFilters({ assignedTo: event.target.value.trim() || undefined }),
            placeholder: "me or safe label"
          })
        ),
        e("label", { className: "settingsInlineField" },
          e("span", null, "Assignment status"),
          e("select", {
            value: unmatchedFilters.assignmentStatus ?? "all",
            onChange: (event: React.ChangeEvent<HTMLSelectElement>) => updateQueueFilters({ assignmentStatus: event.target.value === "all" ? undefined : event.target.value as ProviderWebhookUnmatchedInboundFilters["assignmentStatus"] })
          },
            e("option", { value: "all" }, "All assignment"),
            ...assignmentStatuses.map((item) => e("option", { key: item, value: item }, item))
          )
        ),
        e("label", { className: "settingsInlineField" },
          e("span", null, "Escalation status"),
          e("select", {
            value: unmatchedFilters.escalationStatus ?? "all",
            onChange: (event: React.ChangeEvent<HTMLSelectElement>) => updateQueueFilters({ escalationStatus: event.target.value === "all" ? undefined : event.target.value as ProviderWebhookUnmatchedInboundFilters["escalationStatus"] })
          },
            e("option", { value: "all" }, "All escalation"),
            ...escalationStatuses.map((item) => e("option", { key: item, value: item }, item))
          )
        ),
        e("label", { className: "settingsInlineField" },
          e("span", null, "Escalation reason"),
          e("select", {
            value: unmatchedFilters.escalationReason ?? "all",
            onChange: (event: React.ChangeEvent<HTMLSelectElement>) => updateQueueFilters({ escalationReason: event.target.value === "all" ? undefined : event.target.value as ProviderWebhookReviewEscalationReason })
          },
            e("option", { value: "all" }, "All reasons"),
            ...escalationReasons.map((item) => e("option", { key: item, value: item }, item))
          )
        ),
        e("label", { className: "settingsInlineField" },
          e("span", null, "Resolution status"),
          e("select", {
            value: unmatchedFilters.resolutionStatus ?? "all",
            onChange: (event: React.ChangeEvent<HTMLSelectElement>) => updateQueueFilters({ resolutionStatus: event.target.value === "all" ? undefined : event.target.value as ProviderWebhookUnmatchedInboundFilters["resolutionStatus"] })
          },
            e("option", { value: "all" }, "All resolution"),
            ...resolutionStatuses.map((item) => e("option", { key: item, value: item }, item))
          )
        ),
        e("label", { className: "settingsInlineField" },
          e("span", null, "Resolution outcome"),
          e("select", {
            value: unmatchedFilters.resolutionOutcome ?? "all",
            onChange: (event: React.ChangeEvent<HTMLSelectElement>) => updateQueueFilters({ resolutionOutcome: event.target.value === "all" ? undefined : event.target.value as ProviderWebhookReviewResolutionOutcome })
          },
            e("option", { value: "all" }, "All outcomes"),
            ...resolutionOutcomes.map((item) => e("option", { key: item, value: item }, item))
          )
        ),
        e("label", { className: "settingsInlineField" },
          e("span", null, "Closure readiness"),
          e("select", {
            value: unmatchedFilters.closureReadiness ?? "all",
            onChange: (event: React.ChangeEvent<HTMLSelectElement>) => updateQueueFilters({ closureReadiness: event.target.value === "all" ? undefined : event.target.value as ProviderWebhookUnmatchedInboundFilters["closureReadiness"] })
          },
            e("option", { value: "all" }, "All readiness"),
            ...closureReadinessValues.map((item) => e("option", { key: item, value: item }, item))
          )
        ),
        e("label", { className: "settingsInlineField" },
          e("span", null, "Checklist incomplete"),
          e("select", {
            value: unmatchedFilters.checklistIncomplete === undefined ? "all" : String(unmatchedFilters.checklistIncomplete),
            onChange: (event: React.ChangeEvent<HTMLSelectElement>) => updateQueueFilters({ checklistIncomplete: event.target.value === "all" ? undefined : event.target.value === "true" })
          },
            e("option", { value: "all" }, "All checklist"),
            e("option", { value: "true" }, "Incomplete only"),
            e("option", { value: "false" }, "Complete only")
          )
        ),
        e("label", { className: "settingsInlineField" },
          e("span", null, "Received from"),
          e("input", {
            type: "datetime-local",
            value: toDateTimeLocal(unmatchedFilters.receivedAtFrom ?? unmatchedFilters.receivedFrom),
            onChange: (event: React.ChangeEvent<HTMLInputElement>) => updateQueueFilters({ receivedAtFrom: fromDateTimeLocal(event.target.value) })
          })
        ),
        e("label", { className: "settingsInlineField" },
          e("span", null, "Received to"),
          e("input", {
            type: "datetime-local",
            value: toDateTimeLocal(unmatchedFilters.receivedAtTo ?? unmatchedFilters.receivedTo),
            onChange: (event: React.ChangeEvent<HTMLInputElement>) => updateQueueFilters({ receivedAtTo: fromDateTimeLocal(event.target.value) })
          })
        ),
        e("label", { className: "settingsInlineField" },
          e("span", null, "Page size"),
          e("select", {
            value: String(pagination.limit),
            onChange: (event: React.ChangeEvent<HTMLSelectElement>) => updateQueueFilters({ limit: Number(event.target.value), offset: 0 })
          },
            ...pageSizes.map((item) => e("option", { key: item, value: item }, String(item)))
          )
        ),
        e("label", { className: "settingsInlineField" },
          e("span", null, "Sort order"),
          e("select", {
            value: appliedSort.sortOrder,
            onChange: (event: React.ChangeEvent<HTMLSelectElement>) => updateQueueFilters({ sortBy: "receivedAt", sortOrder: event.target.value as ProviderWebhookUnmatchedInboundFilters["sortOrder"] })
          },
            e("option", { value: "desc" }, "receivedAt newest first"),
            e("option", { value: "asc" }, "receivedAt oldest first")
          )
        ),
        e("button", {
          className: "webhookEventButton",
          type: "button",
          disabled: !pagination.hasPreviousPage || !onUnmatchedFiltersChange,
          onClick: () => moveUnmatchedPage("previous")
        },
          e(ChevronLeft, { size: 15 }),
          "Previous"
        ),
        e("button", {
          className: "webhookEventButton",
          type: "button",
          disabled: !pagination.hasNextPage || !onUnmatchedFiltersChange,
          onClick: () => moveUnmatchedPage("next")
        },
          e(ChevronRight, { size: 15 }),
          "Next"
        ),
        e("button", {
          className: "webhookEventButton",
          type: "button",
          disabled: !onUnmatchedFiltersChange,
          onClick: () => onUnmatchedFiltersChange?.({ limit: pagination.limit, offset: 0, sortBy: "receivedAt", sortOrder: "desc" })
        },
          e(X, { size: 15 }),
          "Clear filters"
        )
      ),
      e("div", { className: "webhookEventActions", "aria-label": "Unmatched inbound bulk selection" },
        e("button", {
          className: "webhookEventButton",
          type: "button",
          disabled: selectableVisibleItems.length === 0 || !onUnmatchedSelectionChange || allVisibleSelected,
          onClick: selectVisibleUnmatchedItems
        },
          e(CheckSquare, { size: 15 }),
          "Select all visible"
        ),
        e("button", {
          className: "webhookEventButton",
          type: "button",
          disabled: selectedUnmatchedIds.length === 0 || !onUnmatchedSelectionChange,
          onClick: clearUnmatchedSelection
        },
          e(X, { size: 15 }),
          "Clear selection"
        ),
        e("button", {
          className: "webhookEventButton",
          type: "button",
          disabled: selectedUnmatchedIds.length === 0 || Boolean(unmatchedBulkSavingStatus) || !onBulkReviewUnmatchedInbound,
          onClick: () => void onBulkReviewUnmatchedInbound?.("reviewed")
        },
          e(Check, { size: 15 }),
          unmatchedBulkSavingStatus === "reviewed" ? "Bulk saving..." : "Bulk Mark reviewed"
        ),
        e("button", {
          className: "webhookEventButton",
          type: "button",
          disabled: selectedUnmatchedIds.length === 0 || Boolean(unmatchedBulkSavingStatus) || !onBulkReviewUnmatchedInbound,
          onClick: () => void onBulkReviewUnmatchedInbound?.("skipped")
        },
          e(SkipForward, { size: 15 }),
          unmatchedBulkSavingStatus === "skipped" ? "Bulk saving..." : "Bulk Skip"
        ),
        e("button", {
          className: "webhookEventButton",
          type: "button",
          disabled: selectedUnmatchedIds.length === 0 || Boolean(unmatchedBulkMetadataSavingStatus) || !onBulkAssignUnmatchedInbound,
          onClick: () => void onBulkAssignUnmatchedInbound?.("ASSIGN_TO_ME")
        },
          e(UserCheck, { size: 15 }),
          unmatchedBulkMetadataSavingStatus === "ASSIGN_TO_ME" ? "Bulk assigning..." : "Bulk Assign to me"
        ),
        e("button", {
          className: "webhookEventButton",
          type: "button",
          disabled: selectedUnmatchedIds.length === 0 || Boolean(unmatchedBulkMetadataSavingStatus) || !onBulkAssignUnmatchedInbound,
          onClick: () => void onBulkAssignUnmatchedInbound?.("UNASSIGN")
        },
          e(UserMinus, { size: 15 }),
          unmatchedBulkMetadataSavingStatus === "UNASSIGN" ? "Bulk unassigning..." : "Bulk Unassign"
        ),
        e("button", {
          className: "webhookEventButton",
          type: "button",
          disabled: selectedUnmatchedIds.length === 0 || Boolean(unmatchedBulkMetadataSavingStatus) || !onBulkEscalateUnmatchedInbound,
          onClick: () => void onBulkEscalateUnmatchedInbound?.("ESCALATE")
        },
          e(Flag, { size: 15 }),
          unmatchedBulkMetadataSavingStatus === "ESCALATE" ? "Bulk escalating..." : "Bulk Escalate"
        ),
        e("button", {
          className: "webhookEventButton",
          type: "button",
          disabled: selectedUnmatchedIds.length === 0 || Boolean(unmatchedBulkMetadataSavingStatus) || !onBulkEscalateUnmatchedInbound,
          onClick: () => void onBulkEscalateUnmatchedInbound?.("CLEAR_ESCALATION")
        },
          e(RotateCcw, { size: 15 }),
          unmatchedBulkMetadataSavingStatus === "CLEAR_ESCALATION" ? "Bulk clearing..." : "Bulk Clear escalation"
        ),
        e("button", {
          className: "webhookEventButton",
          type: "button",
          disabled: selectedUnmatchedIds.length === 0 || Boolean(unmatchedBulkMetadataSavingStatus) || !onBulkResolveUnmatchedInbound,
          onClick: () => void onBulkResolveUnmatchedInbound?.("SET_RESOLUTION")
        },
          e(CheckSquare, { size: 15 }),
          unmatchedBulkMetadataSavingStatus === "SET_RESOLUTION" ? "Bulk resolving..." : "Bulk Set resolution"
        ),
        e("button", {
          className: "webhookEventButton",
          type: "button",
          disabled: selectedUnmatchedIds.length === 0 || Boolean(unmatchedBulkMetadataSavingStatus) || !onBulkResolveUnmatchedInbound,
          onClick: () => void onBulkResolveUnmatchedInbound?.("CLEAR_RESOLUTION")
        },
          e(RotateCcw, { size: 15 }),
          unmatchedBulkMetadataSavingStatus === "CLEAR_RESOLUTION" ? "Bulk clearing..." : "Bulk Clear resolution"
        ),
        e("button", {
          className: "webhookEventButton",
          type: "button",
          disabled: selectedUnmatchedIds.length === 0 || Boolean(unmatchedBulkMetadataSavingStatus) || !onBulkResolveUnmatchedInbound,
          onClick: () => void onBulkResolveUnmatchedInbound?.("COMPLETE_STEP")
        },
          e(ListChecks, { size: 15 }),
          unmatchedBulkMetadataSavingStatus === "COMPLETE_STEP" ? "Bulk checklist..." : "Bulk Complete diagnostics step"
        ),
        e("button", {
          className: "webhookEventButton",
          type: "button",
          disabled: selectedUnmatchedIds.length === 0 || Boolean(unmatchedBulkMetadataSavingStatus) || !onBulkResolveUnmatchedInbound,
          onClick: () => void onBulkResolveUnmatchedInbound?.("RESET_CHECKLIST")
        },
          e(RotateCcw, { size: 15 }),
          unmatchedBulkMetadataSavingStatus === "RESET_CHECKLIST" ? "Bulk resetting..." : "Bulk Reset checklist"
        ),
        e("button", {
          className: "webhookEventButton",
          type: "button",
          disabled: Boolean(unmatchedExportLoadingFormat) || !onExportUnmatchedInbound,
          onClick: () => void onExportUnmatchedInbound?.("json")
        },
          e(Download, { size: 15 }),
          unmatchedExportLoadingFormat === "json" ? "Exporting JSON..." : "Export current filtered queue"
        ),
        e("button", {
          className: "webhookEventButton",
          type: "button",
          disabled: Boolean(unmatchedExportLoadingFormat) || !onExportUnmatchedInbound,
          onClick: () => void onExportUnmatchedInbound?.("csv")
        },
          e(Download, { size: 15 }),
          unmatchedExportLoadingFormat === "csv" ? "Exporting CSV..." : "Export CSV"
        )
      ),
      unmatchedInboundError ? e("div", { className: "apiErrorBox compact", role: "alert" }, unmatchedInboundError) : null,
      unmatchedExportError ? e("div", { className: "apiErrorBox compact", role: "alert" }, unmatchedExportError) : null,
      unmatchedExportResult ? e("div", { className: "webhookActionStatus", role: "status", "aria-live": "polite" },
        `Export ${unmatchedExportResult.format}: exportedCount=${unmatchedExportResult.exportedCount}; exportMaxLimit=${unmatchedExportResult.exportMaxLimit}; externalCalls=${unmatchedExportResult.externalCalls}`
      ) : null,
      unmatchedActionStatus ? e("div", { className: "webhookActionStatus", role: "status", "aria-live": "polite" }, unmatchedActionStatus) : null,
      unmatchedBulkResult ? e("div", { className: "webhookEventList compact", "aria-label": "Bulk unmatched review result" },
        ...unmatchedBulkResult.results.map((result) => e("div", { key: `${result.id}-${result.resultStatus}`, className: "webhookActionStatus", role: result.ok ? "status" : "alert" },
          `${result.id}: ${result.resultStatus}; reviewStatus=${result.reviewStatus ?? "none"}; unmatchedStatus=${result.unmatchedStatus ?? "none"}; error=${result.error ?? "none"}; externalCalls=${result.externalCalls}`
        ))
      ) : null,
      unmatchedBulkMetadataResult ? e("div", { className: "webhookEventList compact", "aria-label": "Bulk assignment escalation result" },
        ...unmatchedBulkMetadataResult.results.map((result) => e("div", { key: `${result.id}-${result.resultStatus}-${result.assignmentStatus ?? "none"}-${result.escalationStatus ?? "none"}`, className: "webhookActionStatus", role: result.ok ? "status" : "alert" },
          `${result.id}: ${result.resultStatus}; assignmentStatus=${result.assignmentStatus ?? "none"}; escalationStatus=${result.escalationStatus ?? "none"}; escalationReason=${result.escalationReason ?? "none"}; error=${result.error ?? "none"}; externalCalls=${result.externalCalls}`
        ))
      ) : null,
      unmatchedBulkResolutionResult ? e("div", { className: "webhookEventList compact", "aria-label": "Bulk resolution checklist result" },
        ...unmatchedBulkResolutionResult.results.map((result) => e("div", { key: `${result.id}-${result.resultStatus}-${result.resolutionStatus ?? "none"}-${result.closureReadiness ?? "none"}`, className: "webhookActionStatus", role: result.ok ? "status" : "alert" },
          `${result.id}: ${result.resultStatus}; resolutionStatus=${result.resolutionStatus ?? "none"}; resolutionOutcome=${result.resolutionOutcome ?? "none"}; closureReadiness=${result.closureReadiness ?? "none"}; checklist=${result.checklistCompletedCount ?? "none"}/${result.checklistTotalCount ?? "none"}; error=${result.error ?? "none"}; externalCalls=${result.externalCalls}`
        ))
      ) : null,
      unmatchedInboundLoading ? e("div", { className: "apiLoadingBox compact" }, "Loading unmatched inbound review items...") : null,
      unmatchedInboundItems.length > 0 ? e("div", { className: "webhookEventList" },
        ...unmatchedInboundItems.map((item) => e("article", { key: item.id, className: "webhookEventRow" },
          e("div", null,
            e("label", { className: "webhookSelectRow" },
              e("input", {
                type: "checkbox",
                checked: selectedUnmatchedSet.has(item.id),
                disabled: !isOpenUnmatchedItem(item) || !onUnmatchedSelectionChange || Boolean(unmatchedBulkSavingStatus),
                onChange: (event: React.ChangeEvent<HTMLInputElement>) => toggleUnmatchedSelection(item.id, event.target.checked)
              }),
              e("strong", null, `${providerLabel(item.provider)} unmatched inbound`)
            ),
            e("span", null, `${item.eventType} / ${item.unmatchedStatus}`)
          ),
          e("div", null,
            e("span", null, `id=${item.id}`),
            e("span", null, `channelAccountId=${item.channelAccountId ?? "none"}`),
            e("span", null, `normalization=${item.normalizationStatus}`),
            e("span", null, `normalizedEventType=${item.normalizedEventType}`),
            e("span", null, `messageType=${item.messageType}`),
            e("span", null, `routing=${item.routingStatus}`),
            e("span", null, `lookup=${item.conversationLookupStatus}`),
            e("span", null, `reason=${item.unmatchedReason}`),
            e("span", null, `reviewStatus=${item.reviewStatus}`),
            e("span", null, `linkStatus=${item.linkStatus}`),
            e("span", { className: item.assignmentStatus === "assigned" ? "webhookWarningPill" : undefined }, `assignmentStatus=${item.assignmentStatus}`),
            e("span", null, `assignedTo=${item.assignedToOperatorLabel ?? "none"}`),
            e("span", null, `assignedAt=${item.assignedAt ? formatDate(item.assignedAt) : "none"}`),
            e("span", null, `assignedBy=${item.assignedByOperatorLabel ?? "none"}`),
            e("span", { className: item.escalationStatus === "escalated" ? "webhookWarningPill" : undefined }, `escalationStatus=${item.escalationStatus}`),
            e("span", null, `escalationReason=${item.escalationReason ?? "none"}`),
            e("span", null, `escalatedAt=${item.escalatedAt ? formatDate(item.escalatedAt) : "none"}`),
            e("span", null, `escalatedBy=${item.escalatedByOperatorLabel ?? "none"}`),
            e("span", { className: item.resolutionStatus === "resolved" ? "webhookWarningPill" : undefined }, `resolutionStatus=${item.resolutionStatus}`),
            e("span", null, `resolutionOutcome=${item.resolutionOutcome ?? "none"}`),
            e("span", { className: item.closureReadiness === "BLOCKED" ? "webhookWarningPill" : undefined }, `closureReadiness=${item.closureReadiness}`),
            e("span", null, `resolvedAt=${item.resolvedAt ? formatDate(item.resolvedAt) : "none"}`),
            e("span", null, `resolvedBy=${item.resolvedByOperatorLabel ?? "none"}`),
            e("span", null, `checklist=${item.checklistCompletedCount}/${item.checklistTotalCount}`),
            e("span", null, `incompleteSteps=${item.checklistIncompleteSteps.join("|") || "none"}`),
            e("span", null, `recommendedNextActions=${item.recommendedNextActions.join("|") || "none"}`),
            e("span", null, `lastOperatorNoteAt=${item.lastOperatorNoteAt ? formatDate(item.lastOperatorNoteAt) : "none"}`),
            e("span", null, `messagePersisted=${String(item.messagePersisted)}`),
            e("span", null, `linkedConversationId=${item.linkedConversationId ?? "none"}`),
            e("span", null, `linkedMessageId=${item.linkedMessageId ?? "none"}`),
            e("span", null, `reviewedAt=${item.reviewedAt ? formatDate(item.reviewedAt) : "none"}`),
            e("span", null, `unmatchedResolvedAt=${item.unmatchedResolvedAt ? formatDate(item.unmatchedResolvedAt) : "none"}`),
            e("span", null, `externalCalls=${item.externalCalls}`),
            e("span", null, formatDate(item.receivedAt))
          ),
          item.textPreview ? e("p", null, item.textPreview) : null,
          e("div", { className: "webhookEventActions" },
            e("button", {
              className: "webhookEventButton",
              type: "button",
              disabled: diagnosticsLoadingId === item.id || !onLoadDiagnostics,
              onClick: () => void onLoadDiagnostics?.(item.id)
            },
              e(Activity, { size: 15 }),
              diagnosticsLoadingId === item.id ? "Loading diagnostics..." : "View diagnostics"
            ),
            e("button", {
              className: "webhookEventButton",
              type: "button",
              disabled: historyLoadingId === item.id || !onLoadHistory,
              onClick: () => void onLoadHistory?.(item.id)
            },
              e(FileClock, { size: 15 }),
              historyLoadingId === item.id ? "Loading history..." : "View history"
            ),
            e("button", {
              className: "webhookEventButton",
              type: "button",
              disabled: closureEvidenceLoadingId === item.id || !onLoadClosureEvidence,
              onClick: () => void onLoadClosureEvidence?.(item.id)
            },
              e(ShieldCheck, { size: 15 }),
              closureEvidenceLoadingId === item.id ? "Loading evidence..." : "View closure evidence"
            ),
            e("button", {
              className: "webhookEventButton",
              type: "button",
              disabled: closureEvidenceExportLoadingId === item.id || !onExportClosureEvidence,
              onClick: () => void onExportClosureEvidence?.(item.id)
            },
              e(Download, { size: 15 }),
              closureEvidenceExportLoadingId === item.id ? "Exporting evidence..." : "Export closure evidence"
            ),
            e("button", {
              className: "webhookEventButton",
              type: "button",
              disabled: closureEvidenceExportManifestLoadingId === item.id || !onLoadClosureEvidenceExportManifest,
              onClick: () => void onLoadClosureEvidenceExportManifest?.(item.id)
            },
              e(FileText, { size: 15 }),
              closureEvidenceExportManifestLoadingId === item.id ? "Loading manifest..." : "Load evidence manifest"
            ),
            e("button", {
              className: "webhookEventButton",
              type: "button",
              disabled: closureEvidenceRedactionAuditLoadingId === item.id || !onLoadClosureEvidenceRedactionAudit,
              onClick: () => void onLoadClosureEvidenceRedactionAudit?.(item.id)
            },
              e(ShieldCheck, { size: 15 }),
              closureEvidenceRedactionAuditLoadingId === item.id ? "Auditing evidence..." : "Audit evidence export redaction"
            ),
            activeDiagnosticsId === item.id && activeDiagnostics ? e("span", null, `diagnostics warnings=${warningLabels(activeDiagnostics).length}`) : null,
            activeClosureEvidenceId === item.id && activeClosureEvidence ? e("span", null, `evidenceStatus=${activeClosureEvidence.evidenceStatus}`) : null,
            activeClosureEvidenceExportId === item.id && activeClosureEvidenceExport ? e("span", null, `evidenceExport=${activeClosureEvidenceExport.exportKind}; externalCalls=${activeClosureEvidenceExport.externalCalls}`) : null,
            activeClosureEvidenceExportManifestId === item.id && activeClosureEvidenceExportManifest ? e("span", null, `evidenceManifest=${activeClosureEvidenceExportManifest.manualQaReadiness}; externalCalls=${activeClosureEvidenceExportManifest.externalCalls}`) : null,
            activeClosureEvidenceRedactionAuditId === item.id && activeClosureEvidenceRedactionAudit ? e("span", null, `evidenceRedactionAudit=${activeClosureEvidenceRedactionAudit.status}; externalCalls=${activeClosureEvidenceRedactionAudit.externalCalls}`) : null,
            activeHistoryId === item.id && activeHistory ? e("span", null, `history entries=${activeHistory.entries.length}`) : null
          ),
          isOpenUnmatchedItem(item) ? e("div", { className: "webhookEventActions", "aria-label": `Assignment escalation controls for ${item.id}` },
            e("button", {
              className: "webhookEventButton",
              type: "button",
              disabled: unmatchedActionSavingId === item.id || Boolean(unmatchedBulkMetadataSavingStatus) || !onAssignUnmatchedInbound,
              onClick: () => void onAssignUnmatchedInbound?.(item.id, "ASSIGN_TO_ME")
            },
              e(UserCheck, { size: 15 }),
              unmatchedActionSavingId === item.id ? "Saving..." : "Assign to me"
            ),
            e("button", {
              className: "webhookEventButton",
              type: "button",
              disabled: unmatchedActionSavingId === item.id || Boolean(unmatchedBulkMetadataSavingStatus) || !onAssignUnmatchedInbound,
              onClick: () => void onAssignUnmatchedInbound?.(item.id, "ASSIGN_TO_OPERATOR", "operator:queue-lead")
            },
              e(UserCheck, { size: 15 }),
              "Assign queue lead"
            ),
            e("button", {
              className: "webhookEventButton",
              type: "button",
              disabled: unmatchedActionSavingId === item.id || Boolean(unmatchedBulkMetadataSavingStatus) || !onAssignUnmatchedInbound,
              onClick: () => void onAssignUnmatchedInbound?.(item.id, "UNASSIGN")
            },
              e(UserMinus, { size: 15 }),
              "Unassign"
            ),
            e("button", {
              className: "webhookEventButton",
              type: "button",
              disabled: unmatchedActionSavingId === item.id || Boolean(unmatchedBulkMetadataSavingStatus) || !onEscalateUnmatchedInbound,
              onClick: () => void onEscalateUnmatchedInbound?.(item.id, "ESCALATE", "SLA_RISK")
            },
              e(Flag, { size: 15 }),
              "Escalate SLA risk"
            ),
            e("button", {
              className: "webhookEventButton",
              type: "button",
              disabled: unmatchedActionSavingId === item.id || Boolean(unmatchedBulkMetadataSavingStatus) || !onEscalateUnmatchedInbound,
              onClick: () => void onEscalateUnmatchedInbound?.(item.id, "CLEAR_ESCALATION")
            },
              e(RotateCcw, { size: 15 }),
              "Clear escalation"
            )
          ) : null,
          isOpenUnmatchedItem(item) ? e("div", { className: "webhookHistorySurface", "aria-label": `Resolution checklist controls for ${item.id}` },
            e("div", { className: "webhookEventActions" },
              e("button", {
                className: "webhookEventButton",
                type: "button",
                disabled: unmatchedActionSavingId === item.id || Boolean(unmatchedBulkMetadataSavingStatus) || !onResolveUnmatchedInbound,
                onClick: () => void onResolveUnmatchedInbound?.(item.id, "SET_RESOLUTION", "NEEDS_REVIEW")
              },
                e(CheckSquare, { size: 15 }),
                unmatchedActionSavingId === item.id ? "Saving..." : "Set needs review"
              ),
              e("button", {
                className: "webhookEventButton",
                type: "button",
                disabled: unmatchedActionSavingId === item.id || Boolean(unmatchedBulkMetadataSavingStatus) || !onResolveUnmatchedInbound,
                onClick: () => void onResolveUnmatchedInbound?.(item.id, "SET_RESOLUTION", "REVIEWED_SAFE_MATCH")
              },
                e(Check, { size: 15 }),
                "Set safe match"
              ),
              e("button", {
                className: "webhookEventButton",
                type: "button",
                disabled: unmatchedActionSavingId === item.id || Boolean(unmatchedBulkMetadataSavingStatus) || !onResolveUnmatchedInbound,
                onClick: () => void onResolveUnmatchedInbound?.(item.id, "SET_RESOLUTION", "BLOCKED_UNSAFE")
              },
                e(AlertTriangle, { size: 15 }),
                "Set blocked unsafe"
              ),
              e("button", {
                className: "webhookEventButton",
                type: "button",
                disabled: unmatchedActionSavingId === item.id || Boolean(unmatchedBulkMetadataSavingStatus) || !onResolveUnmatchedInbound,
                onClick: () => void onResolveUnmatchedInbound?.(item.id, "CLEAR_RESOLUTION")
              },
                e(RotateCcw, { size: 15 }),
                "Clear resolution"
              ),
              e("button", {
                className: "webhookEventButton",
                type: "button",
                disabled: unmatchedActionSavingId === item.id || Boolean(unmatchedBulkMetadataSavingStatus) || !onUpdateResolutionChecklist,
                onClick: () => void onUpdateResolutionChecklist?.(item.id, "RESET_CHECKLIST")
              },
                e(RotateCcw, { size: 15 }),
                "Reset checklist"
              )
            ),
            e("div", { className: "webhookEventList compact", "aria-label": `Closure checklist for ${item.id}` },
              ...item.closureChecklist.map((step) => e("div", { key: `${item.id}-${step.step}`, className: "webhookHistoryRow" },
                e("strong", null, step.step),
                e("span", null, `completed=${String(step.completed)}`),
                e("span", null, `completedAt=${step.completedAt ? formatDate(step.completedAt) : "none"}`),
                e("span", null, `completedBy=${step.completedByOperatorLabel ?? "none"}`),
                e("div", { className: "webhookEventActions" },
                  e("button", {
                    className: "webhookEventButton",
                    type: "button",
                    disabled: unmatchedActionSavingId === item.id || Boolean(unmatchedBulkMetadataSavingStatus) || !onUpdateResolutionChecklist || step.completed,
                    onClick: () => void onUpdateResolutionChecklist?.(item.id, "COMPLETE_STEP", step.step)
                  },
                    e(Check, { size: 15 }),
                    "Complete"
                  ),
                  e("button", {
                    className: "webhookEventButton",
                    type: "button",
                    disabled: unmatchedActionSavingId === item.id || Boolean(unmatchedBulkMetadataSavingStatus) || !onUpdateResolutionChecklist || !step.completed,
                    onClick: () => void onUpdateResolutionChecklist?.(item.id, "UNCOMPLETE_STEP", step.step)
                  },
                    e(RotateCcw, { size: 15 }),
                    "Uncomplete"
                  )
                )
              ))
            )
          ) : null,
          activeDiagnosticsId === item.id ? e("div", { className: "webhookHistorySurface", "aria-label": `Safe diagnostics for ${item.id}` },
            diagnosticsErrorById[item.id] ? e("div", { className: "apiErrorBox compact", role: "alert" }, diagnosticsErrorById[item.id]) : null,
            diagnosticsLoadingId === item.id ? e("div", { className: "apiLoadingBox compact" }, "Loading safe diagnostics...") : null,
            activeDiagnostics && activeDiagnostics.unmatchedId === item.id ? e("div", { className: "webhookDiagnosticsGrid" },
              e("div", null,
                e("strong", null, "Routing"),
                e("span", null, `platform=${activeDiagnostics.platform}`),
                e("span", null, `channelAccountId=${activeDiagnostics.channelAccountId ?? "none"}`),
                e("span", null, `safeRoomLabel=${activeDiagnostics.safeRoomLabel}`),
                e("span", null, `roomKeyDigest=${activeDiagnostics.roomKeyDigest ?? "none"}`),
                e("span", null, `routingOutcome=${activeDiagnostics.routingOutcome}`),
                e("span", null, `normalizedEventType=${activeDiagnostics.normalizedEventType}`)
              ),
              e("div", null,
                e("strong", null, "Review state"),
                e("span", null, `eventType=${activeDiagnostics.eventType}`),
                e("span", null, `reviewStatus=${activeDiagnostics.reviewStatus}`),
                e("span", null, `linkStatus=${activeDiagnostics.linkStatus}`),
                e("span", null, `unmatchedStatus=${activeDiagnostics.unmatchedStatus}`),
                e("span", null, `assignmentStatus=${activeDiagnostics.assignmentStatus}`),
                e("span", null, `assignedTo=${activeDiagnostics.assignedToOperatorLabel ?? "none"}`),
                e("span", null, `assignedAt=${activeDiagnostics.assignedAt ? formatDate(activeDiagnostics.assignedAt) : "none"}`),
                e("span", null, `escalationStatus=${activeDiagnostics.escalationStatus}`),
                e("span", null, `escalationReason=${activeDiagnostics.escalationReason ?? "none"}`),
                e("span", null, `escalatedAt=${activeDiagnostics.escalatedAt ? formatDate(activeDiagnostics.escalatedAt) : "none"}`),
                e("span", null, `resolutionStatus=${activeDiagnostics.resolutionStatus}`),
                e("span", null, `resolutionOutcome=${activeDiagnostics.resolutionOutcome ?? "none"}`),
                e("span", null, `closureReadiness=${activeDiagnostics.closureReadiness}`),
                e("span", null, `resolvedAt=${activeDiagnostics.resolvedAt ? formatDate(activeDiagnostics.resolvedAt) : "none"}`),
                e("span", null, `resolvedBy=${activeDiagnostics.resolvedByOperatorLabel ?? "none"}`),
                e("span", null, `checklist=${activeDiagnostics.checklistCompletedCount}/${activeDiagnostics.checklistTotalCount}`),
                e("span", null, `checklistIncompleteSteps=${activeDiagnostics.checklistIncompleteSteps.join("|") || "none"}`),
                e("span", null, `recommendedNextActions=${activeDiagnostics.recommendedNextActions.join("|") || "none"}`),
                e("span", null, `lastOperatorNoteAt=${activeDiagnostics.lastOperatorNoteAt ? formatDate(activeDiagnostics.lastOperatorNoteAt) : "none"}`),
                e("span", null, `persistenceOutcome=${activeDiagnostics.persistenceOutcome}`),
                e("span", null, `lastActionAt=${activeDiagnostics.lastActionAt ? formatDate(activeDiagnostics.lastActionAt) : "none"}`)
              ),
              e("div", null,
                e("strong", null, "Safe capabilities"),
                e("span", null, `candidateLookupAvailable=${String(activeDiagnostics.candidateLookupAvailable)}`),
                e("span", null, `historyAvailable=${String(activeDiagnostics.historyAvailable)}`),
                e("span", null, `exportAvailable=${String(activeDiagnostics.exportAvailable)}`),
                e("span", null, `externalCalls=${activeDiagnostics.externalCalls}`)
              ),
              e("div", null,
                e("strong", null, "Warnings"),
                ...warningLabels(activeDiagnostics).map((warning) => e("span", { key: warning, className: "webhookWarningPill" },
                  e(AlertTriangle, { size: 13 }),
                  warning
                )),
                warningLabels(activeDiagnostics).length === 0 ? e("span", null, "none") : null
              )
            ) : !diagnosticsLoadingId && !diagnosticsErrorById[item.id] ? e("div", { className: "providerEmptyState" }, "No safe diagnostics returned for this unmatched item.") : null
          ) : null,
          activeClosureEvidenceId === item.id ? e("div", { className: "webhookHistorySurface", "aria-label": `Safe closure evidence for ${item.id}` },
            closureEvidenceErrorById[item.id] ? e("div", { className: "apiErrorBox compact", role: "alert" }, closureEvidenceErrorById[item.id]) : null,
            closureEvidenceExportErrorById[item.id] ? e("div", { className: "apiErrorBox compact", role: "alert" }, closureEvidenceExportErrorById[item.id]) : null,
            closureEvidenceExportManifestErrorById[item.id] ? e("div", { className: "apiErrorBox compact", role: "alert" }, closureEvidenceExportManifestErrorById[item.id]) : null,
            closureEvidenceRedactionAuditErrorById[item.id] ? e("div", { className: "apiErrorBox compact", role: "alert" }, closureEvidenceRedactionAuditErrorById[item.id]) : null,
            closureEvidenceLoadingId === item.id ? e("div", { className: "apiLoadingBox compact" }, "Loading safe closure evidence...") : null,
            closureEvidenceExportLoadingId === item.id ? e("div", { className: "apiLoadingBox compact" }, "Exporting safe closure evidence...") : null,
            closureEvidenceExportManifestLoadingId === item.id ? e("div", { className: "apiLoadingBox compact" }, "Loading safe closure evidence export manifest...") : null,
            closureEvidenceRedactionAuditLoadingId === item.id ? e("div", { className: "apiLoadingBox compact" }, "Auditing safe closure evidence export...") : null,
            activeClosureEvidence && activeClosureEvidence.unmatchedId === item.id ? e("div", { className: "webhookDiagnosticsGrid" },
              e("div", null,
                e("strong", null, "Closure evidence"),
                e("span", null, `generatedAt=${formatDate(activeClosureEvidence.generatedAt)}`),
                e("span", null, `evidenceStatus=${activeClosureEvidence.evidenceStatus}`),
                e("span", null, `closureReadiness=${activeClosureEvidence.closureReadiness}`),
                e("span", null, `resolutionStatus=${activeClosureEvidence.resolutionStatus}`),
                e("span", null, `resolutionOutcome=${activeClosureEvidence.resolutionOutcome ?? "none"}`),
                e("span", null, `reviewStatus=${activeClosureEvidence.reviewStatus}`),
                e("span", null, `linkStatus=${activeClosureEvidence.linkStatus}`),
                e("span", null, `unmatchedStatus=${activeClosureEvidence.unmatchedStatus}`)
              ),
              e("div", null,
                e("strong", null, "Safe identifiers"),
                e("span", null, `platform=${activeClosureEvidence.platform}`),
                e("span", null, `channelAccountId=${activeClosureEvidence.channelAccountId ?? "none"}`),
                e("span", null, `safeRoomLabel=${activeClosureEvidence.safeRoomLabel}`),
                e("span", null, `roomKeyDigest=${activeClosureEvidence.roomKeyDigest ?? "none"}`),
                e("span", null, `eventType=${activeClosureEvidence.eventType}`),
                e("span", null, `ageBucket=${activeClosureEvidence.ageBucket}`),
                e("span", null, `receivedAt=${formatDate(activeClosureEvidence.receivedAt)}`)
              ),
              e("div", null,
                e("strong", null, "Assignment"),
                e("span", null, `assignmentStatus=${activeClosureEvidence.assignmentStatus}`),
                e("span", null, `assignedTo=${activeClosureEvidence.assignedToOperatorLabel ?? "none"}`),
                e("span", null, `escalationStatus=${activeClosureEvidence.escalationStatus}`),
                e("span", null, `escalationReason=${activeClosureEvidence.escalationReason ?? "none"}`)
              ),
              e("div", null,
                e("strong", null, "Checklist"),
                e("span", null, `checklist=${activeClosureEvidence.checklistCompletedCount}/${activeClosureEvidence.checklistTotalCount}`),
                e("span", null, `incompleteSteps=${activeClosureEvidence.checklistIncompleteSteps.join("|") || "none"}`),
                e("span", null, `recommendedNextActions=${activeClosureEvidence.recommendedNextActions.join("|") || "none"}`),
                e("span", null, `historyEntryCount=${activeClosureEvidence.historyEntryCount}`),
                e("span", null, `operatorNoteCount=${activeClosureEvidence.operatorNoteCount}`),
                e("span", null, `candidateSummaryCount=${activeClosureEvidence.candidateSummaryCount}`),
                e("span", null, `externalCalls=${activeClosureEvidence.externalCalls}`)
              ),
              e("div", null,
                e("strong", null, "Evidence flags"),
                ...Object.entries(activeClosureEvidence.evidenceFlags).map(([key, value]) => e("span", { key }, `${key}=${String(value)}`))
              )
            ) : !closureEvidenceLoadingId && !closureEvidenceErrorById[item.id] ? e("div", { className: "providerEmptyState" }, "No safe closure evidence returned for this unmatched item.") : null
          ) : null,
          activeClosureEvidenceExportId === item.id && activeClosureEvidenceExport ? e("div", { className: "webhookHistorySurface", "aria-label": `Safe closure evidence export for ${item.id}` },
            e("div", { className: "webhookDiagnosticsGrid" },
              e("div", null,
                e("strong", null, "Closure evidence export"),
                e("span", null, `exportKind=${activeClosureEvidenceExport.exportKind}`),
                e("span", null, `format=${activeClosureEvidenceExport.format}`),
                e("span", null, `contentType=${activeClosureEvidenceExport.contentType}`),
                e("span", null, `safeFilename=${activeClosureEvidenceExport.safeFilename}`),
                e("span", null, `exportedAt=${formatDate(activeClosureEvidenceExport.exportedAt)}`),
                e("span", null, `unmatchedId=${activeClosureEvidenceExport.unmatchedId}`),
                e("span", null, `evidenceStatus=${activeClosureEvidenceExport.evidenceStatus}`),
                e("span", null, `externalCalls=${activeClosureEvidenceExport.externalCalls}`)
              )
            )
          ) : null,
          activeClosureEvidenceExportManifestId === item.id && activeClosureEvidenceExportManifest ? e("div", { className: "webhookHistorySurface", "aria-label": `Safe closure evidence export manifest for ${item.id}` },
            e("div", { className: "webhookDiagnosticsGrid" },
              e("div", null,
                e("strong", null, "Closure evidence export manifest"),
                e("span", null, `manifestTarget=${activeClosureEvidenceExportManifest.manifestTarget}`),
                e("span", null, `exportShapeVersion=${activeClosureEvidenceExportManifest.exportShapeVersion}`),
                e("span", null, `safeFilename=${activeClosureEvidenceExportManifest.safeFilename}`),
                e("span", null, `safeDigest=${activeClosureEvidenceExportManifest.safeDigest}`),
                e("span", null, `manual QA readiness=${activeClosureEvidenceExportManifest.manualQaReadiness}`),
                e("span", null, `externalCalls=${activeClosureEvidenceExportManifest.externalCalls}`)
              ),
              e("div", null,
                e("strong", null, "Manifest status"),
                e("span", null, `redaction=${activeClosureEvidenceExportManifest.redactionStatus}`),
                e("span", null, `integrity=${activeClosureEvidenceExportManifest.integrityStatus}`),
                e("span", null, `deterministic=${String(activeClosureEvidenceExportManifest.deterministicExportConfirmed)}`),
                e("span", null, `counts=${activeClosureEvidenceExportManifest.totalItems}/${activeClosureEvidenceExportManifest.evidenceReadyCount}/${activeClosureEvidenceExportManifest.evidenceBlockedCount}/${activeClosureEvidenceExportManifest.evidenceIncompleteCount}`),
                e("span", null, `redactionCounts=${activeClosureEvidenceExportManifest.redactionPassedCount}/${activeClosureEvidenceExportManifest.redactionWarningCount}/${activeClosureEvidenceExportManifest.redactionBlockedCount}`)
              ),
              e("div", null,
                e("strong", null, "QA checks"),
                ...Object.entries(activeClosureEvidenceExportManifest.manualQaChecks).map(([key, value]) => e("span", { key }, `${key}=${String(value)}`))
              )
            )
          ) : null,
          activeClosureEvidenceRedactionAuditId === item.id && activeClosureEvidenceRedactionAudit ? e("div", { className: "webhookHistorySurface", "aria-label": `Safe closure evidence redaction audit for ${item.id}` },
            e("div", { className: "webhookDiagnosticsGrid" },
              e("div", null,
                e("strong", null, "Closure evidence redaction audit"),
                e("span", null, `auditTarget=${activeClosureEvidenceRedactionAudit.auditTarget}`),
                e("span", null, `status=${activeClosureEvidenceRedactionAudit.status}`),
                e("span", null, `exportShapeVersion=${activeClosureEvidenceRedactionAudit.exportShapeVersion}`),
                e("span", null, `unmatchedId=${activeClosureEvidenceRedactionAudit.unmatchedId ?? "none"}`),
                e("span", null, `externalCalls=${activeClosureEvidenceRedactionAudit.externalCalls}`)
              ),
              e("div", null,
                e("strong", null, "Safe checks"),
                ...Object.entries(activeClosureEvidenceRedactionAudit.checks).map(([key, value]) => e("span", { key }, `${key}=${String(value)}`))
              ),
              e("div", null,
                e("strong", null, "Safe issues"),
                activeClosureEvidenceRedactionAudit.issues.length === 0 ? e("span", null, "none") : null,
                ...activeClosureEvidenceRedactionAudit.issues.map((issue) => e("span", { key: issue.code }, `${issue.severity}:${issue.safeLabel}; action=${issue.recommendedAction}`))
              )
            )
          ) : null,
          activeHistoryId === item.id ? e("div", { className: "webhookHistorySurface", "aria-label": `Safe history for ${item.id}` },
            historyErrorById[item.id] ? e("div", { className: "apiErrorBox compact", role: "alert" }, historyErrorById[item.id]) : null,
            historyLoadingId === item.id ? e("div", { className: "apiLoadingBox compact" }, "Loading unmatched inbound history...") : null,
            activeHistory && activeHistory.unmatchedInboundId === item.id && activeHistory.entries.length > 0 ? e("div", { className: "webhookEventList compact" },
              ...activeHistory.entries.map((entry) => e("div", { key: entry.id, className: "webhookHistoryRow" },
                e("strong", null, `${entry.action} / ${entry.actionStatus}`),
                e("span", null, `time=${formatDate(entry.actionAt)}`),
                e("span", null, `actor=${entry.actor ?? "system"}`),
                e("span", null, `platform=${entry.provider}`),
                e("span", null, `channelAccountId=${entry.channelAccountId ?? "none"}`),
                e("span", null, `safeRoomLabel=${entry.safeRoomLabel}`),
                e("span", null, `roomKeyDigest=${entry.roomKeyDigest ?? "none"}`),
                e("span", null, `statusBefore=${entry.statusBefore ?? "none"}`),
                e("span", null, `statusAfter=${entry.statusAfter ?? "none"}`),
                e("span", null, `linkedConversationId=${entry.linkedConversationId ?? "none"}`),
                e("span", null, `linkedMessageId=${entry.linkedMessageId ?? "none"}`),
                e("span", null, `receivedAt=${entry.receivedAt ? formatDate(entry.receivedAt) : "none"}`),
                entry.reason ? e("p", null, `reason=${entry.reason}`) : null,
                entry.message ? e("p", null, entry.message) : null,
                e("span", null, `externalCalls=${entry.externalCalls}`)
              ))
            ) : !historyLoadingId && !historyErrorById[item.id] ? e("div", { className: "providerEmptyState" }, "No safe history entries for this unmatched item.") : null
          ) : null,
          e("div", { className: "webhookHistorySurface", "aria-label": `Operator notes for ${item.id}` },
            e("div", { className: "webhookEventActions" },
              e("button", {
                className: "webhookEventButton",
                type: "button",
                disabled: operatorNotesLoadingId === item.id || !onLoadOperatorNotes,
                onClick: () => void onLoadOperatorNotes?.(item.id)
              },
                e(NotebookPen, { size: 15 }),
                operatorNotesLoadingId === item.id ? "Loading notes..." : "Load operator notes"
              ),
              (operatorNotesById[item.id] ?? []).length > 0 ? e("span", null, `note count=${operatorNotesById[item.id].length}`) : null
            ),
            operatorNotesErrorById[item.id] ? e("div", { className: "apiErrorBox compact", role: "alert" }, operatorNotesErrorById[item.id]) : null,
            operatorNotesLoadingId === item.id ? e("div", { className: "apiLoadingBox compact" }, "Loading operator notes...") : null,
            e("div", { className: "webhookEventForm" },
              e("label", { className: "settingsInlineField wide" },
                e("span", null, "Operator note"),
                e("input", {
                  value: operatorNoteDrafts[item.id] ?? "",
                  maxLength: 1000,
                  onChange: (event: React.ChangeEvent<HTMLInputElement>) => setOperatorNoteDrafts((current) => ({ ...current, [item.id]: event.target.value })),
                  placeholder: "Add safe note"
                })
              ),
              e("button", {
                className: "webhookEventButton",
                type: "button",
                disabled: operatorNoteSavingId === item.id || !(operatorNoteDrafts[item.id] ?? "").trim() || !onCreateOperatorNote,
                onClick: () => void submitOperatorNote(item.id)
              },
                e(NotebookPen, { size: 15 }),
                operatorNoteSavingId === item.id ? "Saving note..." : "Add note"
              )
            ),
            (operatorNotesById[item.id] ?? []).length > 0 ? e("div", { className: "webhookEventList compact" },
              ...operatorNotesById[item.id].map((note) => e("div", { key: note.id, className: "webhookHistoryRow" },
                e("strong", null, `note / ${formatDate(note.createdAt)}`),
                e("span", null, `author=${note.authorLabel ?? note.authorId ?? "system"}`),
                e("span", null, `platform=${note.context.platform}`),
                e("span", null, `channelAccountId=${note.context.channelAccountId ?? "none"}`),
                e("span", null, `safeRoomLabel=${note.context.safeRoomLabel}`),
                e("span", null, `eventType=${note.context.eventType}`),
                e("span", null, `reviewStatus=${note.context.reviewStatus}`),
                e("span", null, `linkStatus=${note.context.linkStatus}`),
                e("span", null, `unmatchedStatus=${note.context.unmatchedStatus}`),
                e("span", null, `assignmentStatus=${note.context.assignmentStatus ?? "unassigned"}`),
                e("span", null, `assignedTo=${note.context.assignedToOperatorLabel ?? "none"}`),
                e("span", null, `escalationStatus=${note.context.escalationStatus ?? "none"}`),
                e("span", null, `escalationReason=${note.context.escalationReason ?? "none"}`),
                e("span", null, `resolutionStatus=${note.context.resolutionStatus ?? "unresolved"}`),
                e("span", null, `resolutionOutcome=${note.context.resolutionOutcome ?? "none"}`),
                e("span", null, `closureReadiness=${note.context.closureReadiness ?? "NOT_READY"}`),
                e("span", null, `checklist=${note.context.checklistCompletedCount ?? 0}/${note.context.checklistTotalCount ?? closureChecklistSteps.length}`),
                e("p", null, note.note),
                e("span", null, `externalCalls=${note.externalCalls}`)
              ))
            ) : operatorNotesById[item.id] && !operatorNotesErrorById[item.id] && operatorNotesLoadingId !== item.id ? e("div", { className: "providerEmptyState" }, "No operator notes for this unmatched item.") : null
          ),
          isOpenUnmatchedItem(item) ? e("div", { className: "webhookCandidateSurface" },
            e("div", { className: "webhookEventActions" },
              e("button", {
                className: "webhookEventButton",
                type: "button",
                disabled: candidateLoadingId === item.id || !onLoadCandidates,
                onClick: () => void onLoadCandidates?.(item.id)
              },
                e(Search, { size: 15 }),
                candidateLoadingId === item.id ? "Loading candidates..." : "Load candidates"
              ),
              (candidateItemsById[item.id] ?? []).length > 0 ? e("span", null, `candidate count=${candidateItemsById[item.id].length}`) : null
            ),
            candidateErrorById[item.id] ? e("div", { className: "apiErrorBox compact", role: "alert" }, candidateErrorById[item.id]) : null,
            (candidateItemsById[item.id] ?? []).length > 0 ? e("div", { className: "webhookEventList compact" },
              ...candidateItemsById[item.id].map((candidate) => e("label", { key: candidate.conversationId, className: "webhookCandidateRow" },
                e("input", {
                  type: "radio",
                  name: `candidate-${item.id}`,
                  checked: (linkConversationIds[item.id] ?? "") === candidate.conversationId,
                  onChange: () => setLinkConversationIds((current) => ({ ...current, [item.id]: candidate.conversationId }))
                }),
                e("span", null, `conversationId=${candidate.conversationId}`),
                e("span", null, `platform=${candidate.platform}`),
                e("span", null, `channelAccountId=${candidate.channelAccountId}`),
                e("span", null, `roomIdDigest=${candidate.roomIdDigest}`),
                e("span", null, `safeRoomLabel=${candidate.safeRoomLabel}`),
                e("span", null, `matchConfidence=${candidate.matchConfidence}`),
                e("span", null, `matchReason=${candidate.matchReason}`),
                e("span", null, `latestMessageAt=${candidate.latestMessageAt ? formatDate(candidate.latestMessageAt) : "none"}`),
                candidate.latestMessagePreview ? e("p", null, candidate.latestMessagePreview) : null,
                e("span", null, `externalCalls=${candidate.externalCalls}`)
              ))
            ) : candidateItemsById[item.id] && !candidateErrorById[item.id] && candidateLoadingId !== item.id ? e("div", { className: "providerEmptyState" }, "No safe candidate conversations found.") : null
          ) : null,
          isOpenUnmatchedItem(item) ? e("div", { className: "webhookEventActions" },
            e("button", {
              className: "webhookEventButton",
              type: "button",
              disabled: unmatchedActionSavingId === item.id || Boolean(unmatchedBulkSavingStatus) || !onReviewUnmatchedInbound,
              onClick: () => void onReviewUnmatchedInbound?.(item.id, "reviewed")
            },
              e(Check, { size: 15 }),
              unmatchedActionSavingId === item.id ? "Saving..." : "Mark reviewed"
            ),
            e("button", {
              className: "webhookEventButton",
              type: "button",
              disabled: unmatchedActionSavingId === item.id || Boolean(unmatchedBulkSavingStatus) || !onReviewUnmatchedInbound,
              onClick: () => void onReviewUnmatchedInbound?.(item.id, "skipped")
            },
              e(SkipForward, { size: 15 }),
              unmatchedActionSavingId === item.id ? "Saving..." : "Skip"
            ),
            e("label", { className: "settingsInlineField" },
              e("span", null, "Conversation ID"),
              e("input", {
                value: linkConversationIds[item.id] ?? "",
                onChange: (event: React.ChangeEvent<HTMLInputElement>) => setLinkConversationIds((current) => ({ ...current, [item.id]: event.target.value })),
                placeholder: "existing safe conversation id"
              })
            ),
            e("button", {
              className: "webhookEventButton",
              type: "button",
              disabled: unmatchedActionSavingId === item.id || Boolean(unmatchedBulkSavingStatus) || !onLinkUnmatchedInbound || !(linkConversationIds[item.id] ?? "").trim(),
              onClick: () => void onLinkUnmatchedInbound?.(item.id, (linkConversationIds[item.id] ?? "").trim(), "link-only")
            },
              e(Link2, { size: 15 }),
              "Link only"
            ),
            e("button", {
              className: "webhookEventButton",
              type: "button",
              disabled: unmatchedActionSavingId === item.id || Boolean(unmatchedBulkSavingStatus) || !onLinkUnmatchedInbound || !(linkConversationIds[item.id] ?? "").trim(),
              onClick: () => void onLinkUnmatchedInbound?.(item.id, (linkConversationIds[item.id] ?? "").trim(), "link-and-persist-safe-message")
            },
              e(Send, { size: 15 }),
              "Link + persist safe message"
            )
          ) : null,
          e("small", null, `payloadDigest=${item.payloadDigest} / providerEventDigest=${item.providerEventDigest ?? "none"} / deliveryDigest=${item.deliveryDigest ?? "none"} / senderKeyDigest=${item.senderKeyDigest ?? "none"} / roomKeyDigest=${item.roomKeyDigest ?? "none"} / textLength=${item.textLength ?? "none"}`)
        ))
      ) : !unmatchedInboundLoading && !unmatchedInboundError ? e("div", { className: "providerEmptyState" }, "No unmatched inbound review items.") : null
    )
  );
}

function ProviderReadinessCard({ provider }: { provider: ProviderReadinessProvider }) {
  return e("article", { className: "providerReadinessCard" },
    e("div", { className: "channelPanelTop" },
      e(RadioTower, { size: 18 }),
      e("div", null,
        e("h3", null, providerLabel(provider.name)),
        e("p", null, provider.status)
      )
    ),
    e("dl", { className: "channelMeta providerReadinessMeta" },
      definition("Credential", formatStatus(provider.credentialStatus)),
      definition("Webhook verification", provider.webhookVerificationConfigured ? "configured" : "not configured"),
      definition("Signature guardrail", provider.webhookVerificationReady ? "sandbox-ready" : "not ready"),
      definition("Webhook secret", formatStatus(provider.webhookStatus)),
      definition("Outbound enabled", String(provider.outboundEnabled))
    )
  );
}

function definition(label: string, value: string) {
  return e("div", { key: label },
    e("dt", null, label),
    e("dd", null, value)
  );
}

function providerLabel(provider: ProviderReadinessProvider["name"]) {
  const labels: Record<ProviderReadinessProvider["name"], string> = {
    line: "LINE",
    telegram: "Telegram",
    facebook: "Facebook",
    instagram: "Instagram"
  };
  return labels[provider];
}

function formatStatus(status: ProviderReadinessProvider["credentialStatus"]) {
  return status === "configured" ? "configured" : "not configured";
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("th-TH");
}

function formatAppliedFilters(filters: Record<string, unknown>) {
  const entries = Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== "");
  return entries.length > 0 ? entries.map(([key, value]) => `${key}=${String(value)}`).join(";") : "none";
}

function formatSavedViewFilters(view: ProviderWebhookReviewSavedView) {
  const allowedKeys: (keyof ProviderWebhookReviewSavedView["filters"])[] = [
    "provider",
    "reviewStatus",
    "linkStatus",
    "unmatchedStatus",
    "eventType",
    "severity",
    "triageLane",
    "assignedTo",
    "assignmentStatus",
    "escalationStatus",
    "escalationReason",
    "resolutionStatus",
    "resolutionOutcome",
    "closureReadiness",
    "checklistIncomplete",
    "receivedAtFrom",
    "receivedAtTo",
    "pageSize"
  ];
  const entries = allowedKeys
    .map((key) => [key, view.filters[key]] as const)
    .filter(([, value]) => value !== undefined && value !== null && value !== "");
  return entries.length > 0 ? entries.map(([key, value]) => `${key}=${String(value)}`).join(";") : "none";
}

function warningLabels(diagnostics: ProviderWebhookUnmatchedInboundDiagnostics) {
  const warnings: string[] = [];
  if (diagnostics.safeWarnings.signatureRejected) warnings.push("signatureRejected");
  if (diagnostics.safeWarnings.replayDuplicate) warnings.push("replayDuplicate");
  if (diagnostics.safeWarnings.missingConversationMatch) warnings.push("missingConversationMatch");
  if (diagnostics.safeWarnings.staleOpenItem) warnings.push("staleOpenItem");
  return warnings;
}

function toDateTimeLocal(value: string | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

function fromDateTimeLocal(value: string) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function isOpenUnmatchedItem(item: ProviderWebhookUnmatchedInboundItem) {
  return item.unmatchedStatus === "open" || item.unmatchedStatus === "review-needed";
}

function summarizeUnmatchedQueue(items: ProviderWebhookUnmatchedInboundItem[]) {
  return {
    open: items.filter(isOpenUnmatchedItem).length,
    reviewed: items.filter((item) => item.reviewStatus === "reviewed").length,
    skipped: items.filter((item) => item.reviewStatus === "skipped").length,
    linked: items.filter((item) => item.reviewStatus === "linked").length
  };
}

const e = React.createElement;
