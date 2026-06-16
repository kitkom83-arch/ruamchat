import type {
  CannedReply,
  CreateProviderWebhookOperatorNoteRequest,
  CreateProviderWebhookReviewSavedViewRequest,
  DataMode,
  ProviderReadiness,
  ProviderWebhookReviewClosureChecklistStep,
  ProviderWebhookReviewRecommendedNextAction,
  ProviderWebhookCandidateConversation,
  ProviderWebhookEvent,
  ProviderWebhookOperatorNote,
  ProviderWebhookReviewAlerts,
  ProviderWebhookReviewAlertsFilters,
  ProviderWebhookReviewAlertAgeBucket,
  ProviderWebhookReviewAlertSeverity,
  ProviderWebhookReviewClosureEvidence,
  ProviderWebhookReviewClosureEvidenceExport,
  ProviderWebhookReviewClosureEvidenceStatus,
  ProviderWebhookReviewExportIntegrity,
  ProviderWebhookReviewExportManifest,
  ProviderWebhookReviewQaHandoffBundle,
  ProviderWebhookReviewQaHandoffBundleExport,
  ProviderWebhookReviewQaHandoffAcceptanceLock,
  ProviderWebhookReviewQaHandoffAcceptanceLockRequest,
  ProviderWebhookReviewQaHandoffArchiveFinalization,
  ProviderWebhookReviewQaHandoffArchiveIntegrity,
  ProviderWebhookReviewQaHandoffFinalizationReceipt,
  ProviderWebhookReviewQaHandoffFinalizationSignOffRequest,
  ProviderWebhookReviewQaHandoffFinalizationSignOffResponse,
  ProviderWebhookReviewQaHandoffLockedArchiveExport,
  ProviderWebhookReviewQaHandoffLockedArchiveStatus,
  ProviderWebhookReviewQaHandoffReleaseEvidence,
  ProviderWebhookReviewQaHandoffReleaseCertification,
  ProviderWebhookReviewQaHandoffReleaseAttestationAudit,
  ProviderWebhookReviewQaHandoffReleaseAttestationReconciliationRegister,
  ProviderWebhookReviewQaHandoffCertifiedReleaseGate,
  ProviderWebhookReviewQaHandoffCertifiedReleaseDecisionReceipt,
  ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord,
  ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRequest,
  ProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedger,
  ProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificate,
  ProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister,
  ProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt,
  ProviderWebhookReviewQaHandoffCertifiedReleaseControlRoomPacket,
  ProviderWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceipt,
  ProviderWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceipt,
  ProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceipt,
  ProviderWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceipt,
  ProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceipt,
  ProviderWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceipt,
  ProviderWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceipt,
  ProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacket,
  ProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceReceipt,
  ProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedger,
  ProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt,
  ProviderWebhookReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollup,
  ProviderWebhookReviewQaHandoffCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt,
  ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealOperationalClosureReceipt,
  ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceipt,
  ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceipt,
  ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceipt,
  ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealReceipt,
  ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerReceipt,
  ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt,
  ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt,
  ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceipt,
  ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationReceipt,
  ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceReceipt,
  ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket,
  ProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun,
  ProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunRequest,
  ProviderWebhookReviewQaHandoffReleaseClosureLedger,
  ProviderWebhookReviewQaHandoffReleaseVerification,
  ProviderWebhookReviewQaHandoffRetentionAudit,
  ProviderWebhookReviewQaHandoffRetentionManifest,
  ProviderWebhookReviewQaHandoffReceipt,
  ProviderWebhookReviewQaHandoffSignOffRequest,
  ProviderWebhookReviewQaHandoffSignOffResponse,
  ProviderWebhookReviewExportRedactionAudit,
  ProviderWebhookReviewClosureReport,
  ProviderWebhookReviewClosureReportExport,
  ProviderWebhookReviewClosureReportFilters,
  ProviderWebhookReviewMetrics,
  ProviderWebhookReviewMetricsFilters,
  ProviderWebhookReviewResolutionSummary,
  ProviderWebhookReviewResolutionSummaryFilters,
  ProviderWebhookReviewTriage,
  ProviderWebhookReviewTriageFilters,
  ProviderWebhookReviewTriageLane,
  ProviderWebhookReviewWorkload,
  ProviderWebhookReviewWorkloadFilters,
  ProviderWebhookReviewSavedView,
  ProviderWebhookUnmatchedInboundAssignmentRequest,
  UpdateProviderWebhookReviewSavedViewRequest,
  ProviderWebhookTriageRecommendedAction,
  ProviderWebhookUnmatchedInboundDiagnostics,
  ProviderWebhookUnmatchedInboundExport,
  ProviderWebhookUnmatchedInboundExportQuery,
  ProviderWebhookUnmatchedInboundBulkAssignmentRequest,
  ProviderWebhookUnmatchedInboundBulkAssignmentResponse,
  ProviderWebhookUnmatchedInboundBulkEscalationRequest,
  ProviderWebhookUnmatchedInboundBulkEscalationResponse,
  ProviderWebhookUnmatchedInboundBulkResolutionRequest,
  ProviderWebhookUnmatchedInboundBulkResolutionResponse,
  ProviderWebhookUnmatchedInboundBulkReviewRequest,
  ProviderWebhookUnmatchedInboundBulkReviewResponse,
  ProviderWebhookUnmatchedInboundEscalationRequest,
  ProviderWebhookUnmatchedInboundFilters,
  ProviderWebhookUnmatchedInboundHistory,
  ProviderWebhookUnmatchedInboundLinkRequest,
  ProviderWebhookUnmatchedInboundItem,
  ProviderWebhookUnmatchedInboundPage,
  ProviderWebhookUnmatchedInboundReviewRequest,
  ProviderWebhookUnmatchedInboundResolutionChecklistRequest,
  ProviderWebhookUnmatchedInboundResolutionRequest,
  ProviderWebhookSandboxEventRequest,
  SettingsCannedReply,
  SettingsChannelAccount,
  SettingsSlaPolicy,
  SettingsTeamMember
} from "@ai-omni/shared";
import {
  archiveProviderWebhookReviewSavedView,
  createProviderWebhookOperatorNote,
  createProviderWebhookReviewSavedView,
  createProviderWebhookSandboxEvent,
  bulkReviewProviderWebhookUnmatchedInbound,
  getProviderWebhookOperatorNotes,
  getProviderWebhookReviewAlerts,
  getProviderWebhookReviewClosureReportExport,
  getProviderWebhookReviewClosureReportExportManifest,
  getProviderWebhookReviewClosureReport,
  getProviderWebhookReviewClosureExportIntegrity,
  getProviderWebhookReviewClosureReportRedactionAudit,
  getProviderWebhookReviewQaHandoffBundle,
  getProviderWebhookReviewQaHandoffBundleExport,
  getProviderWebhookReviewQaHandoffAcceptanceLock,
  getProviderWebhookReviewQaHandoffBundleReceipt,
  getProviderWebhookReviewQaHandoffLockedArchive,
  exportProviderWebhookReviewQaHandoffLockedArchive,
  getProviderWebhookReviewQaHandoffArchiveFinalization,
  getProviderWebhookReviewQaHandoffArchiveFinalizationReceipt,
  getProviderWebhookReviewQaHandoffArchiveReleaseEvidence,
  getProviderWebhookReviewQaHandoffArchiveReleaseCertification,
  getProviderWebhookReviewQaHandoffArchiveReleaseAttestationAudit,
  getProviderWebhookReviewQaHandoffArchiveReleaseAttestationReconciliation,
  getProviderWebhookReviewQaHandoffCertifiedReleaseGate,
  getProviderWebhookReviewQaHandoffCertifiedReleaseDecisionReceipt,
  acknowledgeProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord,
  getProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord,
  getProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket,
  getProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedger,
  getProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificate,
  getProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister,
  getProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt,
  getProviderWebhookReviewQaHandoffCertifiedReleaseControlRoomPacket,
  getProviderWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceipt,
  getProviderWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceipt,
  getProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceipt,
  getProviderWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceipt,
  getProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceipt,
  getProviderWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceipt,
  getProviderWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceipt,
  getProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacket,
  getProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceReceipt,
  getProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedger,
  getProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt,
  getProviderWebhookReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollup,
  getProviderWebhookReviewQaHandoffCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt,
  getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealOperationalClosureReceipt,
  getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceipt,
  getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceipt,
  getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceipt,
  getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealReceipt,
  getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerReceipt,
  getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt,
  getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt,
  getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceipt,
  getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationReceipt,
  getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceReceipt,
  getProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun,
  runProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun,
  getProviderWebhookReviewQaHandoffArchiveReleaseClosureLedger,
  getProviderWebhookReviewQaHandoffArchiveReleaseVerification,
  getProviderWebhookReviewQaHandoffArchiveIntegrity,
  getProviderWebhookReviewQaHandoffRetentionAudit,
  getProviderWebhookReviewQaHandoffRetentionManifest,
  lockProviderWebhookReviewQaHandoffAcceptance,
  signOffProviderWebhookReviewQaHandoffArchiveFinalization,
  signOffProviderWebhookReviewQaHandoffBundleReceipt,
  getProviderWebhookReviewMetrics,
  getProviderWebhookReviewSavedViews,
  getProviderWebhookReviewResolutionSummary,
  getProviderWebhookReviewTriage,
  getProviderWebhookReviewWorkload,
  getProviderReadiness,
  getProviderWebhookEvents,
  getProviderWebhookUnmatchedInbound,
  getProviderWebhookUnmatchedInboundCandidates,
  getProviderWebhookUnmatchedInboundClosureEvidenceExport,
  getProviderWebhookUnmatchedInboundClosureEvidenceExportManifest,
  getProviderWebhookUnmatchedInboundClosureEvidence,
  getProviderWebhookUnmatchedInboundClosureEvidenceRedactionAudit,
  getProviderWebhookUnmatchedInboundDiagnostics,
  getProviderWebhookUnmatchedInboundExport,
  getProviderWebhookUnmatchedInboundHistory,
  linkProviderWebhookUnmatchedInboundConversation,
  reviewProviderWebhookUnmatchedInbound,
  assignProviderWebhookUnmatchedInbound,
  bulkAssignProviderWebhookUnmatchedInbound,
  escalateProviderWebhookUnmatchedInbound,
  bulkEscalateProviderWebhookUnmatchedInbound,
  resolveProviderWebhookUnmatchedInbound,
  updateProviderWebhookUnmatchedInboundChecklist,
  bulkResolveProviderWebhookUnmatchedInbound,
  updateProviderWebhookReviewSavedView,
  getSettingsCannedReplies,
  getSettingsChannels,
  getSettingsSlaPolicies,
  getSettingsTeam
} from "./api-client";
import { createDefaultAdminStore, mockCannedReplies, mockSlaPolicies } from "./admin-data";

const now = "2026-05-21T04:00:00.000Z";

export type SettingsChannelsData = {
  mode: DataMode;
  channels: SettingsChannelAccount[];
};

export type SettingsTeamData = {
  mode: DataMode;
  members: SettingsTeamMember[];
  slaPolicies: SettingsSlaPolicy[];
  cannedReplies: SettingsCannedReply[];
};

export type SettingsProviderReadinessData = {
  mode: DataMode;
  providerReadiness: ProviderReadiness;
};

export type SettingsProviderWebhookEventsData = {
  mode: DataMode;
  events: ProviderWebhookEvent[];
};

export type SettingsProviderWebhookUnmatchedInboundData = {
  mode: DataMode;
  items: ProviderWebhookUnmatchedInboundItem[];
  pagination: ProviderWebhookUnmatchedInboundPage["pagination"];
  appliedFilters: ProviderWebhookUnmatchedInboundPage["appliedFilters"];
  appliedSort: ProviderWebhookUnmatchedInboundPage["appliedSort"];
  summary: ProviderWebhookUnmatchedInboundPage["summary"];
  externalCalls: 0;
};

export type SettingsProviderWebhookReviewMetricsData = {
  mode: DataMode;
  metrics: ProviderWebhookReviewMetrics;
};

export type SettingsProviderWebhookReviewAlertsData = {
  mode: DataMode;
  alerts: ProviderWebhookReviewAlerts;
};

export type SettingsProviderWebhookReviewTriageData = {
  mode: DataMode;
  triage: ProviderWebhookReviewTriage;
};

export type SettingsProviderWebhookReviewWorkloadData = {
  mode: DataMode;
  workload: ProviderWebhookReviewWorkload;
};

export type SettingsProviderWebhookReviewResolutionSummaryData = {
  mode: DataMode;
  summary: ProviderWebhookReviewResolutionSummary;
};

export type SettingsProviderWebhookReviewClosureReportData = {
  mode: DataMode;
  report: ProviderWebhookReviewClosureReport;
};

export type SettingsProviderWebhookReviewClosureReportExportData = {
  mode: DataMode;
  exportResult: ProviderWebhookReviewClosureReportExport;
};

export type SettingsProviderWebhookReviewClosureReportExportManifestData = {
  mode: DataMode;
  manifest: ProviderWebhookReviewExportManifest;
};

export type SettingsProviderWebhookReviewQaHandoffBundleData = {
  mode: DataMode;
  bundle: ProviderWebhookReviewQaHandoffBundle;
};

export type SettingsProviderWebhookReviewQaHandoffBundleExportData = {
  mode: DataMode;
  exportResult: ProviderWebhookReviewQaHandoffBundleExport;
};

export type SettingsProviderWebhookReviewQaHandoffAcceptanceLockData = {
  mode: DataMode;
  acceptanceLock: ProviderWebhookReviewQaHandoffAcceptanceLock;
};

export type SettingsProviderWebhookReviewQaHandoffLockedArchiveData = {
  mode: DataMode;
  lockedArchive: ProviderWebhookReviewQaHandoffLockedArchiveStatus;
};

export type SettingsProviderWebhookReviewQaHandoffLockedArchiveExportData = {
  mode: DataMode;
  lockedArchiveExport: ProviderWebhookReviewQaHandoffLockedArchiveExport;
};

export type SettingsProviderWebhookReviewQaHandoffRetentionManifestData = {
  mode: DataMode;
  retentionManifest: ProviderWebhookReviewQaHandoffRetentionManifest;
};

export type SettingsProviderWebhookReviewQaHandoffArchiveIntegrityData = {
  mode: DataMode;
  integrity: ProviderWebhookReviewQaHandoffArchiveIntegrity;
};

export type SettingsProviderWebhookReviewQaHandoffRetentionAuditData = {
  mode: DataMode;
  retentionAudit: ProviderWebhookReviewQaHandoffRetentionAudit;
};

export type SettingsProviderWebhookReviewQaHandoffArchiveFinalizationData = {
  mode: DataMode;
  finalization: ProviderWebhookReviewQaHandoffArchiveFinalization;
};

export type SettingsProviderWebhookReviewQaHandoffArchiveFinalizationSignOffData = {
  mode: DataMode;
  signOff: ProviderWebhookReviewQaHandoffFinalizationSignOffResponse;
};

export type SettingsProviderWebhookReviewQaHandoffArchiveFinalizationReceiptData = {
  mode: DataMode;
  receipt: ProviderWebhookReviewQaHandoffFinalizationReceipt;
};

export type SettingsProviderWebhookReviewQaHandoffArchiveReleaseEvidenceData = {
  mode: DataMode;
  releaseEvidence: ProviderWebhookReviewQaHandoffReleaseEvidence;
};

export type SettingsProviderWebhookReviewQaHandoffArchiveReleaseVerificationData = {
  mode: DataMode;
  verification: ProviderWebhookReviewQaHandoffReleaseVerification;
};

export type SettingsProviderWebhookReviewQaHandoffArchiveReleaseCertificationData = {
  mode: DataMode;
  certification: ProviderWebhookReviewQaHandoffReleaseCertification;
};

export type SettingsProviderWebhookReviewQaHandoffArchiveReleaseClosureLedgerData = {
  mode: DataMode;
  closureLedger: ProviderWebhookReviewQaHandoffReleaseClosureLedger;
};

export type SettingsProviderWebhookReviewQaHandoffArchiveReleaseAttestationAuditData = {
  mode: DataMode;
  attestationAudit: ProviderWebhookReviewQaHandoffReleaseAttestationAudit;
};

export type SettingsProviderWebhookReviewQaHandoffArchiveReleaseAttestationReconciliationData = {
  mode: DataMode;
  reconciliation: ProviderWebhookReviewQaHandoffReleaseAttestationReconciliationRegister;
};

export type SettingsProviderWebhookReviewQaHandoffCertifiedReleaseGateData = {
  mode: DataMode;
  releaseGate: ProviderWebhookReviewQaHandoffCertifiedReleaseGate;
};

export type SettingsProviderWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptData = {
  mode: DataMode;
  decisionReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseDecisionReceipt;
};

export type SettingsProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacketData = {
  mode: DataMode;
  handoffPacket: ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket;
};

export type SettingsProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordData = {
  mode: DataMode;
  acceptanceRecord: ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord;
};

export type SettingsProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunData = {
  mode: DataMode;
  dryRun: ProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun;
};

export type SettingsProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerData = {
  mode: DataMode;
  resultLedger: ProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedger;
};

export type SettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificateData = {
  mode: DataMode;
  finalReadinessCertificate: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificate;
};

export type SettingsProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegisterData = {
  mode: DataMode;
  freezeAuditRegister: ProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister;
};

export type SettingsProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptData = {
  mode: DataMode;
  rollbackRehearsalReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt;
};

export type SettingsProviderWebhookReviewQaHandoffCertifiedReleaseControlRoomPacketData = {
  mode: DataMode;
  controlRoomPacket: ProviderWebhookReviewQaHandoffCertifiedReleaseControlRoomPacket;
};

export type SettingsProviderWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceiptData = {
  mode: DataMode;
  cutoverChecklistReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceipt;
};

export type SettingsProviderWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceiptData = {
  mode: DataMode;
  operatorCommandReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceipt;
};

export type SettingsProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceiptData = {
  mode: DataMode;
  goLiveAuthorizationReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceipt;
};

export type SettingsProviderWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceiptData = {
  mode: DataMode;
  launchWindowConfirmationReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceipt;
};

export type SettingsProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceiptData = {
  mode: DataMode;
  goLiveHoldReleaseAuthorizationReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceipt;
};

export type SettingsProviderWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceiptData = {
  mode: DataMode;
  launchApprovalReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceipt;
};

export type SettingsProviderWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceiptData = {
  mode: DataMode;
  noExecutionLockReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceipt;
};

export type SettingsProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacketData = {
  mode: DataMode;
  operationsHandoffReadinessPacket: ProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacket;
};

export type SettingsProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceReceiptData = {
  mode: DataMode;
  operationsHandoffAcceptanceReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceReceipt;
};

export type SettingsProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedgerData = {
  mode: DataMode;
  operationsCustodyMonitoringReadinessLedger: ProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedger;
};

export type SettingsProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceiptData = {
  mode: DataMode;
  operationsCustodyMonitoringCloseoutSealReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt;
};

export type SettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollupData = {
  mode: DataMode;
  finalNoExecutionEvidenceRollup: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollup;
};

export type SettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceiptData = {
  mode: DataMode;
  finalEvidenceIndexRegressionGuardrailReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt;
};

export type SettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealOperationalClosureReceiptData = {
  mode: DataMode;
  finalArchiveSealOperationalClosureReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealOperationalClosureReceipt;
};

export type SettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceiptData = {
  mode: DataMode;
  postClosurePreservationVerificationReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceipt;
};

export type SettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceiptData = {
  mode: DataMode;
  postClosurePreservationContinuityLedgerReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceipt;
};

export type SettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceiptData = {
  mode: DataMode;
  postClosurePreservationCustodyAuditReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceipt;
};

export type SettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealReceiptData = {
  mode: DataMode;
  postClosurePreservationCustodyChainSealReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealReceipt;
};

export type SettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerReceiptData = {
  mode: DataMode;
  postClosurePreservationCustodyChainIntegrityLedgerReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerReceipt;
};

export type SettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityReceiptData = {
  mode: DataMode;
  postClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt;
};

export type SettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceiptData = {
  mode: DataMode;
  postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt;
};

export type SettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceiptData = {
  mode: DataMode;
  postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceipt;
};

export type SettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationReceiptData = {
  mode: DataMode;
  postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationReceipt;
};

export type SettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceReceiptData = {
  mode: DataMode;
  postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceReceipt;
};

export type SettingsProviderWebhookReviewQaHandoffReceiptData = {
  mode: DataMode;
  receipt: ProviderWebhookReviewQaHandoffReceipt;
};

export type SettingsProviderWebhookReviewQaHandoffSignOffData = {
  mode: DataMode;
  signOff: ProviderWebhookReviewQaHandoffSignOffResponse;
};

export type SettingsProviderWebhookReviewClosureReportRedactionAuditData = {
  mode: DataMode;
  audit: ProviderWebhookReviewExportRedactionAudit;
};

export type SettingsProviderWebhookReviewClosureExportIntegrityData = {
  mode: DataMode;
  integrity: ProviderWebhookReviewExportIntegrity;
};

export type SettingsProviderWebhookClosureEvidenceData = {
  mode: DataMode;
  evidence: ProviderWebhookReviewClosureEvidence;
};

export type SettingsProviderWebhookClosureEvidenceExportData = {
  mode: DataMode;
  exportResult: ProviderWebhookReviewClosureEvidenceExport;
};

export type SettingsProviderWebhookClosureEvidenceExportManifestData = {
  mode: DataMode;
  manifest: ProviderWebhookReviewExportManifest;
};

export type SettingsProviderWebhookClosureEvidenceRedactionAuditData = {
  mode: DataMode;
  audit: ProviderWebhookReviewExportRedactionAudit;
};

export type SettingsProviderWebhookSavedViewsData = {
  mode: DataMode;
  savedViews: ProviderWebhookReviewSavedView[];
};

export type SettingsProviderWebhookOperatorNotesData = {
  mode: DataMode;
  notes: ProviderWebhookOperatorNote[];
};

export type SettingsProviderWebhookCandidateData = {
  mode: DataMode;
  candidates: ProviderWebhookCandidateConversation[];
};

export type SettingsProviderWebhookDiagnosticsData = {
  mode: DataMode;
  diagnostics: ProviderWebhookUnmatchedInboundDiagnostics;
};

export type SettingsProviderWebhookHistoryData = {
  mode: DataMode;
  history: ProviderWebhookUnmatchedInboundHistory;
};

export type SettingsProviderWebhookExportData = {
  mode: DataMode;
  exportResult: ProviderWebhookUnmatchedInboundExport;
};

export const mockSettingsChannels: SettingsChannelAccount[] = [
  channel("00000000-0000-4000-8000-000000000020", "webchat", "Main Website", "demo-webchat", "https://example.local/webhooks/webchat/demo-webchat", "not configured", false),
  channel("00000000-0000-4000-8000-000000000022", "line", "LINE OA Main", null, "https://example.local/webhooks/line/00000000-0000-4000-8000-000000000022", "configured", true),
  channel("00000000-0000-4000-8000-000000000021", "telegram", "Bot 007237", null, "https://example.local/webhooks/telegram/00000000-0000-4000-8000-000000000021", "not configured", false),
  channel("00000000-0000-4000-8000-000000000023", "facebook", "Page หลัก", null, "https://example.local/webhooks/facebook/00000000-0000-4000-8000-000000000023", "demo/mock", false),
  channel("00000000-0000-4000-8000-000000000024", "instagram", "IG ร้านค้า", null, "https://example.local/webhooks/instagram/00000000-0000-4000-8000-000000000024", "demo/mock", false)
];

export async function loadSettingsChannelsData(mode: DataMode): Promise<SettingsChannelsData> {
  if (mode === "api") {
    return {
      mode,
      channels: await getSettingsChannels()
    };
  }
  return {
    mode,
    channels: mockSettingsChannels
  };
}

export async function loadSettingsProviderReadinessData(mode: DataMode): Promise<SettingsProviderReadinessData> {
  if (mode === "api") {
    return {
      mode,
      providerReadiness: await getProviderReadiness()
    };
  }

  return {
    mode,
    providerReadiness: mockProviderReadiness
  };
}

export async function loadSettingsProviderWebhookEventsData(mode: DataMode): Promise<SettingsProviderWebhookEventsData> {
  if (mode === "api") {
    return {
      mode,
      events: await getProviderWebhookEvents()
    };
  }

  return {
    mode,
    events: mockProviderWebhookEvents
  };
}

export async function loadSettingsProviderWebhookUnmatchedInboundData(mode: DataMode, filters: ProviderWebhookUnmatchedInboundFilters = {}): Promise<SettingsProviderWebhookUnmatchedInboundData> {
  if (mode === "api") {
    const page = await getProviderWebhookUnmatchedInbound(filters);
    return {
      mode,
      ...page
    };
  }

  const page = createMockUnmatchedInboundPage(filters);
  return {
    mode,
    ...page
  };
}

export async function loadSettingsProviderWebhookReviewMetricsData(
  mode: DataMode,
  filters: ProviderWebhookReviewMetricsFilters = {}
): Promise<SettingsProviderWebhookReviewMetricsData> {
  if (mode === "api") {
    return {
      mode,
      metrics: await getProviderWebhookReviewMetrics(filters)
    };
  }

  return {
    mode,
    metrics: createMockReviewMetrics(filters)
  };
}

export async function loadSettingsProviderWebhookReviewAlertsData(
  mode: DataMode,
  filters: ProviderWebhookReviewAlertsFilters = {}
): Promise<SettingsProviderWebhookReviewAlertsData> {
  if (mode === "api") {
    return {
      mode,
      alerts: await getProviderWebhookReviewAlerts(filters)
    };
  }

  return {
    mode,
    alerts: createMockReviewAlerts(filters)
  };
}

export async function loadSettingsProviderWebhookReviewTriageData(
  mode: DataMode,
  filters: ProviderWebhookReviewTriageFilters = {}
): Promise<SettingsProviderWebhookReviewTriageData> {
  if (mode === "api") {
    return {
      mode,
      triage: await getProviderWebhookReviewTriage(filters)
    };
  }

  return {
    mode,
    triage: createMockReviewTriage(filters)
  };
}

export async function loadSettingsProviderWebhookReviewWorkloadData(
  mode: DataMode,
  filters: ProviderWebhookReviewWorkloadFilters = {}
): Promise<SettingsProviderWebhookReviewWorkloadData> {
  if (mode === "api") {
    return {
      mode,
      workload: await getProviderWebhookReviewWorkload(filters)
    };
  }

  return {
    mode,
    workload: createMockReviewWorkload(filters)
  };
}

export async function loadSettingsProviderWebhookReviewResolutionSummaryData(
  mode: DataMode,
  filters: ProviderWebhookReviewResolutionSummaryFilters = {}
): Promise<SettingsProviderWebhookReviewResolutionSummaryData> {
  if (mode === "api") {
    return {
      mode,
      summary: await getProviderWebhookReviewResolutionSummary(filters)
    };
  }

  return {
    mode,
    summary: createMockReviewResolutionSummary(filters)
  };
}

export async function loadSettingsProviderWebhookReviewClosureReportData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewClosureReportData> {
  if (mode === "api") {
    return {
      mode,
      report: await getProviderWebhookReviewClosureReport(filters)
    };
  }

  return {
    mode,
    report: createMockReviewClosureReport(filters)
  };
}

export async function exportSettingsProviderWebhookReviewClosureReportData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewClosureReportExportData> {
  if (mode === "api") {
    return {
      mode,
      exportResult: await getProviderWebhookReviewClosureReportExport(filters)
    };
  }

  return {
    mode,
    exportResult: createMockReviewClosureReportExport(filters)
  };
}

export async function loadSettingsProviderWebhookReviewClosureReportExportManifestData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewClosureReportExportManifestData> {
  if (mode === "api") {
    return {
      mode,
      manifest: await getProviderWebhookReviewClosureReportExportManifest(filters)
    };
  }

  return {
    mode,
    manifest: createMockReviewClosureReportExportManifest(filters)
  };
}

export async function loadSettingsProviderWebhookReviewQaHandoffBundleData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewQaHandoffBundleData> {
  if (mode === "api") {
    return {
      mode,
      bundle: await getProviderWebhookReviewQaHandoffBundle(filters)
    };
  }

  return {
    mode,
    bundle: createMockReviewQaHandoffBundle(filters)
  };
}

export async function exportSettingsProviderWebhookReviewQaHandoffBundleData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewQaHandoffBundleExportData> {
  if (mode === "api") {
    return {
      mode,
      exportResult: await getProviderWebhookReviewQaHandoffBundleExport(filters)
    };
  }

  return {
    mode,
    exportResult: createMockReviewQaHandoffBundleExport(filters)
  };
}

export async function loadSettingsProviderWebhookReviewQaHandoffReceiptData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewQaHandoffReceiptData> {
  if (mode === "api") {
    return {
      mode,
      receipt: await getProviderWebhookReviewQaHandoffBundleReceipt(filters)
    };
  }

  return {
    mode,
    receipt: createMockReviewQaHandoffReceipt(filters)
  };
}

export async function signOffSettingsProviderWebhookReviewQaHandoffReceipt(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {},
  payload: ProviderWebhookReviewQaHandoffSignOffRequest = { acknowledgementType: "sign_off" }
): Promise<SettingsProviderWebhookReviewQaHandoffSignOffData> {
  if (mode === "api") {
    return {
      mode,
      signOff: await signOffProviderWebhookReviewQaHandoffBundleReceipt(filters, payload)
    };
  }

  return {
    mode,
    signOff: createMockReviewQaHandoffSignOff(filters, payload)
  };
}

export async function loadSettingsProviderWebhookReviewQaHandoffAcceptanceLockData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewQaHandoffAcceptanceLockData> {
  if (mode === "api") {
    return {
      mode,
      acceptanceLock: await getProviderWebhookReviewQaHandoffAcceptanceLock(filters)
    };
  }

  return {
    mode,
    acceptanceLock: createMockReviewQaHandoffAcceptanceLock(filters, "none")
  };
}

export async function lockSettingsProviderWebhookReviewQaHandoffAcceptance(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {},
  payload: ProviderWebhookReviewQaHandoffAcceptanceLockRequest = {}
): Promise<SettingsProviderWebhookReviewQaHandoffAcceptanceLockData> {
  if (mode === "api") {
    return {
      mode,
      acceptanceLock: await lockProviderWebhookReviewQaHandoffAcceptance(filters, payload)
    };
  }

  return {
    mode,
    acceptanceLock: createMockReviewQaHandoffAcceptanceLock(filters, "locked", payload)
  };
}

export async function loadSettingsProviderWebhookReviewQaHandoffLockedArchiveData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewQaHandoffLockedArchiveData> {
  if (mode === "api") {
    return {
      mode,
      lockedArchive: await getProviderWebhookReviewQaHandoffLockedArchive(filters)
    };
  }

  return {
    mode,
    lockedArchive: createMockReviewQaHandoffLockedArchive(filters)
  };
}

export async function exportSettingsProviderWebhookReviewQaHandoffLockedArchiveData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewQaHandoffLockedArchiveExportData> {
  if (mode === "api") {
    return {
      mode,
      lockedArchiveExport: await exportProviderWebhookReviewQaHandoffLockedArchive(filters)
    };
  }

  return {
    mode,
    lockedArchiveExport: createMockReviewQaHandoffLockedArchiveExport(filters)
  };
}

export async function loadSettingsProviderWebhookReviewQaHandoffRetentionManifestData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewQaHandoffRetentionManifestData> {
  if (mode === "api") {
    return {
      mode,
      retentionManifest: await getProviderWebhookReviewQaHandoffRetentionManifest(filters)
    };
  }

  return {
    mode,
    retentionManifest: createMockReviewQaHandoffRetentionManifest(filters)
  };
}

export async function loadSettingsProviderWebhookReviewQaHandoffArchiveIntegrityData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewQaHandoffArchiveIntegrityData> {
  if (mode === "api") {
    return {
      mode,
      integrity: await getProviderWebhookReviewQaHandoffArchiveIntegrity(filters)
    };
  }

  return {
    mode,
    integrity: createMockReviewQaHandoffArchiveIntegrity(filters)
  };
}

export async function loadSettingsProviderWebhookReviewQaHandoffRetentionAuditData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewQaHandoffRetentionAuditData> {
  if (mode === "api") {
    return {
      mode,
      retentionAudit: await getProviderWebhookReviewQaHandoffRetentionAudit(filters)
    };
  }

  return {
    mode,
    retentionAudit: createMockReviewQaHandoffRetentionAudit(filters)
  };
}

export async function loadSettingsProviderWebhookReviewQaHandoffArchiveFinalizationData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewQaHandoffArchiveFinalizationData> {
  if (mode === "api") {
    return {
      mode,
      finalization: await getProviderWebhookReviewQaHandoffArchiveFinalization(filters)
    };
  }

  return {
    mode,
    finalization: createMockReviewQaHandoffArchiveFinalization(filters)
  };
}

export async function signOffSettingsProviderWebhookReviewQaHandoffArchiveFinalization(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {},
  payload: ProviderWebhookReviewQaHandoffFinalizationSignOffRequest = {}
): Promise<SettingsProviderWebhookReviewQaHandoffArchiveFinalizationSignOffData> {
  if (mode === "api") {
    return {
      mode,
      signOff: await signOffProviderWebhookReviewQaHandoffArchiveFinalization(filters, payload)
    };
  }

  return {
    mode,
    signOff: createMockReviewQaHandoffArchiveFinalizationSignOff(filters, payload)
  };
}

export async function loadSettingsProviderWebhookReviewQaHandoffArchiveFinalizationReceiptData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewQaHandoffArchiveFinalizationReceiptData> {
  if (mode === "api") {
    return {
      mode,
      receipt: await getProviderWebhookReviewQaHandoffArchiveFinalizationReceipt(filters)
    };
  }

  return {
    mode,
    receipt: createMockReviewQaHandoffArchiveFinalizationReceipt(filters)
  };
}

export async function loadSettingsProviderWebhookReviewQaHandoffArchiveReleaseEvidenceData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewQaHandoffArchiveReleaseEvidenceData> {
  if (mode === "api") {
    return {
      mode,
      releaseEvidence: await getProviderWebhookReviewQaHandoffArchiveReleaseEvidence(filters)
    };
  }

  return {
    mode,
    releaseEvidence: createMockReviewQaHandoffArchiveReleaseEvidence(filters)
  };
}

export async function loadSettingsProviderWebhookReviewQaHandoffArchiveReleaseVerificationData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewQaHandoffArchiveReleaseVerificationData> {
  if (mode === "api") {
    return {
      mode,
      verification: await getProviderWebhookReviewQaHandoffArchiveReleaseVerification(filters)
    };
  }

  return {
    mode,
    verification: createMockReviewQaHandoffArchiveReleaseVerification(filters)
  };
}

export async function loadSettingsProviderWebhookReviewQaHandoffArchiveReleaseCertificationData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewQaHandoffArchiveReleaseCertificationData> {
  if (mode === "api") {
    return {
      mode,
      certification: await getProviderWebhookReviewQaHandoffArchiveReleaseCertification(filters)
    };
  }

  return {
    mode,
    certification: createMockReviewQaHandoffArchiveReleaseCertification(filters)
  };
}

export async function loadSettingsProviderWebhookReviewQaHandoffArchiveReleaseClosureLedgerData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewQaHandoffArchiveReleaseClosureLedgerData> {
  if (mode === "api") {
    return {
      mode,
      closureLedger: await getProviderWebhookReviewQaHandoffArchiveReleaseClosureLedger(filters)
    };
  }

  return {
    mode,
    closureLedger: createMockReviewQaHandoffArchiveReleaseClosureLedger(filters)
  };
}

export async function loadSettingsProviderWebhookReviewQaHandoffArchiveReleaseAttestationAuditData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewQaHandoffArchiveReleaseAttestationAuditData> {
  if (mode === "api") {
    return {
      mode,
      attestationAudit: await getProviderWebhookReviewQaHandoffArchiveReleaseAttestationAudit(filters)
    };
  }

  return {
    mode,
    attestationAudit: createMockReviewQaHandoffArchiveReleaseAttestationAudit(filters)
  };
}

export async function loadSettingsProviderWebhookReviewQaHandoffArchiveReleaseAttestationReconciliationData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewQaHandoffArchiveReleaseAttestationReconciliationData> {
  if (mode === "api") {
    return {
      mode,
      reconciliation: await getProviderWebhookReviewQaHandoffArchiveReleaseAttestationReconciliation(filters)
    };
  }

  return {
    mode,
    reconciliation: createMockReviewQaHandoffArchiveReleaseAttestationReconciliation(filters)
  };
}

export async function loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseGateData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewQaHandoffCertifiedReleaseGateData> {
  if (mode === "api") {
    return {
      mode,
      releaseGate: await getProviderWebhookReviewQaHandoffCertifiedReleaseGate(filters)
    };
  }

  return {
    mode,
    releaseGate: createMockReviewQaHandoffCertifiedReleaseGate(filters)
  };
}

export async function loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptData> {
  if (mode === "api") {
    return {
      mode,
      decisionReceipt: await getProviderWebhookReviewQaHandoffCertifiedReleaseDecisionReceipt(filters)
    };
  }

  return {
    mode,
    decisionReceipt: createMockReviewQaHandoffCertifiedReleaseDecisionReceipt(filters)
  };
}

export async function loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacketData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacketData> {
  if (mode === "api") {
    return {
      mode,
      handoffPacket: await getProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket(filters)
    };
  }

  return {
    mode,
    handoffPacket: createMockReviewQaHandoffCertifiedReleaseHandoffPacket(filters)
  };
}

export async function loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordData> {
  if (mode === "api") {
    return {
      mode,
      acceptanceRecord: await getProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord(filters)
    };
  }

  return {
    mode,
    acceptanceRecord: createMockReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord(filters, null)
  };
}

export async function acknowledgeSettingsProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {},
  payload: ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRequest
): Promise<SettingsProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordData> {
  if (mode === "api") {
    return {
      mode,
      acceptanceRecord: await acknowledgeProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord(filters, payload)
    };
  }

  return {
    mode,
    acceptanceRecord: createMockReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord(filters, payload)
  };
}

export async function loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunData> {
  if (mode === "api") {
    return {
      mode,
      dryRun: await getProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun(filters)
    };
  }

  return {
    mode,
    dryRun: createMockReviewQaHandoffCertifiedReleaseNoopExecutionDryRun(filters, null)
  };
}

export async function runSettingsProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {},
  payload: ProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunRequest
): Promise<SettingsProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunData> {
  if (mode === "api") {
    return {
      mode,
      dryRun: await runProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun(filters, payload)
    };
  }

  return {
    mode,
    dryRun: createMockReviewQaHandoffCertifiedReleaseNoopExecutionDryRun(filters, payload)
  };
}

export async function loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerData> {
  if (mode === "api") {
    return {
      mode,
      resultLedger: await getProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedger(filters)
    };
  }

  return {
    mode,
    resultLedger: createMockReviewQaHandoffCertifiedReleaseDryRunResultLedger(filters)
  };
}

export async function loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificateData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificateData> {
  if (mode === "api") {
    return {
      mode,
      finalReadinessCertificate: await getProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificate(filters)
    };
  }

  return {
    mode,
    finalReadinessCertificate: createMockReviewQaHandoffCertifiedReleaseFinalReadinessCertificate(filters)
  };
}

export async function loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegisterData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegisterData> {
  if (mode === "api") {
    return {
      mode,
      freezeAuditRegister: await getProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister(filters)
    };
  }

  return {
    mode,
    freezeAuditRegister: createMockReviewQaHandoffCertifiedReleaseFreezeAuditRegister(filters)
  };
}

export async function loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptData> {
  if (mode === "api") {
    return {
      mode,
      rollbackRehearsalReceipt: await getProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt(filters)
    };
  }

  return {
    mode,
    rollbackRehearsalReceipt: createMockReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt(filters)
  };
}

export async function loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseControlRoomPacketData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewQaHandoffCertifiedReleaseControlRoomPacketData> {
  if (mode === "api") {
    return {
      mode,
      controlRoomPacket: await getProviderWebhookReviewQaHandoffCertifiedReleaseControlRoomPacket(filters)
    };
  }

  return {
    mode,
    controlRoomPacket: createMockReviewQaHandoffCertifiedReleaseControlRoomPacket(filters)
  };
}

export async function loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceiptData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceiptData> {
  if (mode === "api") {
    return {
      mode,
      cutoverChecklistReceipt: await getProviderWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceipt(filters)
    };
  }

  return {
    mode,
    cutoverChecklistReceipt: createMockReviewQaHandoffCertifiedReleaseCutoverChecklistReceipt(filters)
  };
}

export async function loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceiptData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceiptData> {
  if (mode === "api") {
    return {
      mode,
      operatorCommandReceipt: await getProviderWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceipt(filters)
    };
  }

  return {
    mode,
    operatorCommandReceipt: createMockReviewQaHandoffCertifiedReleaseOperatorCommandReceipt(filters)
  };
}

export async function loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceiptData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceiptData> {
  if (mode === "api") {
    return {
      mode,
      goLiveAuthorizationReceipt: await getProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceipt(filters)
    };
  }

  return {
    mode,
    goLiveAuthorizationReceipt: createMockReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceipt(filters)
  };
}

export async function loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceiptData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceiptData> {
  if (mode === "api") {
    return {
      mode,
      launchWindowConfirmationReceipt: await getProviderWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceipt(filters)
    };
  }

  return {
    mode,
    launchWindowConfirmationReceipt: createMockReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceipt(filters)
  };
}

export async function loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceiptData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceiptData> {
  if (mode === "api") {
    return {
      mode,
      goLiveHoldReleaseAuthorizationReceipt: await getProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceipt(filters)
    };
  }

  return {
    mode,
    goLiveHoldReleaseAuthorizationReceipt: createMockReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceipt(filters)
  };
}

export async function loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceiptData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceiptData> {
  if (mode === "api") {
    return {
      mode,
      launchApprovalReceipt: await getProviderWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceipt(filters)
    };
  }

  return {
    mode,
    launchApprovalReceipt: createMockReviewQaHandoffCertifiedReleaseLaunchApprovalReceipt(filters)
  };
}

export async function loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceiptData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceiptData> {
  if (mode === "api") {
    return {
      mode,
      noExecutionLockReceipt: await getProviderWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceipt(filters)
    };
  }

  return {
    mode,
    noExecutionLockReceipt: createMockReviewQaHandoffCertifiedReleaseNoExecutionLockReceipt(filters)
  };
}

export async function loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacketData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacketData> {
  if (mode === "api") {
    return {
      mode,
      operationsHandoffReadinessPacket: await getProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacket(filters)
    };
  }

  return {
    mode,
    operationsHandoffReadinessPacket: createMockReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacket(filters)
  };
}

export async function loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceReceiptData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceReceiptData> {
  if (mode === "api") {
    return {
      mode,
      operationsHandoffAcceptanceReceipt: await getProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceReceipt(filters)
    };
  }

  return {
    mode,
    operationsHandoffAcceptanceReceipt: createMockReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceReceipt(filters)
  };
}

export async function loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedgerData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedgerData> {
  if (mode === "api") {
    return {
      mode,
      operationsCustodyMonitoringReadinessLedger: await getProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedger(filters)
    };
  }

  return {
    mode,
    operationsCustodyMonitoringReadinessLedger: createMockReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedger(filters)
  };
}

export async function loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceiptData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceiptData> {
  if (mode === "api") {
    return {
      mode,
      operationsCustodyMonitoringCloseoutSealReceipt: await getProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt(filters)
    };
  }

  return {
    mode,
    operationsCustodyMonitoringCloseoutSealReceipt: createMockReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt(filters)
  };
}

export async function loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollupData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollupData> {
  if (mode === "api") {
    return {
      mode,
      finalNoExecutionEvidenceRollup: await getProviderWebhookReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollup(filters)
    };
  }

  return {
    mode,
    finalNoExecutionEvidenceRollup: createMockReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollup(filters)
  };
}

export async function loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceiptData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceiptData> {
  if (mode === "api") {
    return {
      mode,
      finalEvidenceIndexRegressionGuardrailReceipt: await getProviderWebhookReviewQaHandoffCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt(filters)
    };
  }

  return {
    mode,
    finalEvidenceIndexRegressionGuardrailReceipt: createMockReviewQaHandoffCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt(filters)
  };
}

export async function loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealOperationalClosureReceiptData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealOperationalClosureReceiptData> {
  if (mode === "api") {
    return {
      mode,
      finalArchiveSealOperationalClosureReceipt: await getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealOperationalClosureReceipt(filters)
    };
  }

  return {
    mode,
    finalArchiveSealOperationalClosureReceipt: createMockReviewQaHandoffCertifiedReleaseFinalArchiveSealOperationalClosureReceipt(filters)
  };
}

export async function loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceiptData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceiptData> {
  if (mode === "api") {
    return {
      mode,
      postClosurePreservationVerificationReceipt: await getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceipt(filters)
    };
  }

  return {
    mode,
    postClosurePreservationVerificationReceipt: createMockReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceipt(filters)
  };
}

export async function loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceiptData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceiptData> {
  if (mode === "api") {
    return {
      mode,
      postClosurePreservationContinuityLedgerReceipt: await getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceipt(filters)
    };
  }

  return {
    mode,
    postClosurePreservationContinuityLedgerReceipt: createMockReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceipt(filters)
  };
}

export async function loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceiptData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceiptData> {
  if (mode === "api") {
    return {
      mode,
      postClosurePreservationCustodyAuditReceipt: await getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceipt(filters)
    };
  }

  return {
    mode,
    postClosurePreservationCustodyAuditReceipt: createMockReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceipt(filters)
  };
}

export async function loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealReceiptData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealReceiptData> {
  if (mode === "api") {
    return {
      mode,
      postClosurePreservationCustodyChainSealReceipt: await getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealReceipt(filters)
    };
  }

  return {
    mode,
    postClosurePreservationCustodyChainSealReceipt: createMockReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealReceipt(filters)
  };
}

export async function loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerReceiptData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerReceiptData> {
  if (mode === "api") {
    return {
      mode,
      postClosurePreservationCustodyChainIntegrityLedgerReceipt: await getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerReceipt(filters)
    };
  }

  return {
    mode,
    postClosurePreservationCustodyChainIntegrityLedgerReceipt: createMockReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerReceipt(filters)
  };
}

export async function loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityReceiptData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityReceiptData> {
  if (mode === "api") {
    return {
      mode,
      postClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt: await getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt(filters)
    };
  }

  return {
    mode,
    postClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt: createMockReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt(filters)
  };
}

export async function loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceiptData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceiptData> {
  if (mode === "api") {
    return {
      mode,
      postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt: await getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt(filters)
    };
  }

  return {
    mode,
    postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt: createMockReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt(filters)
  };
}

export async function loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceiptData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceiptData> {
  if (mode === "api") {
    return {
      mode,
      postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceipt: await getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceipt(filters)
    };
  }

  return {
    mode,
    postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceipt: createMockReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceipt(filters)
  };
}

export async function loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationReceiptData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationReceiptData> {
  if (mode === "api") {
    return {
      mode,
      postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationReceipt: await getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationReceipt(filters)
    };
  }

  return {
    mode,
    postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationReceipt: createMockReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationReceipt(filters)
  };
}

export async function loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceReceiptData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceReceiptData> {
  if (mode === "api") {
    return {
      mode,
      postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceReceipt: await getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceReceipt(filters)
    };
  }

  return {
    mode,
    postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceReceipt: createMockReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceReceipt(filters)
  };
}

export async function loadSettingsProviderWebhookReviewClosureReportRedactionAuditData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewClosureReportRedactionAuditData> {
  if (mode === "api") {
    return {
      mode,
      audit: await getProviderWebhookReviewClosureReportRedactionAudit(filters)
    };
  }

  return {
    mode,
    audit: createMockReviewClosureReportRedactionAudit(filters)
  };
}

export async function loadSettingsProviderWebhookReviewClosureExportIntegrityData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewClosureExportIntegrityData> {
  if (mode === "api") {
    return {
      mode,
      integrity: await getProviderWebhookReviewClosureExportIntegrity(filters)
    };
  }

  return {
    mode,
    integrity: createMockReviewClosureExportIntegrity(filters)
  };
}

export async function loadSettingsProviderWebhookSavedViewsData(mode: DataMode): Promise<SettingsProviderWebhookSavedViewsData> {
  if (mode === "api") {
    return {
      mode,
      savedViews: await getProviderWebhookReviewSavedViews()
    };
  }

  return {
    mode,
    savedViews: mockProviderWebhookReviewSavedViews.filter((view) => !view.archived)
  };
}

export async function createSettingsProviderWebhookSavedView(
  mode: DataMode,
  payload: CreateProviderWebhookReviewSavedViewRequest
): Promise<ProviderWebhookReviewSavedView> {
  if (mode === "api") {
    return createProviderWebhookReviewSavedView(payload);
  }

  const nowIso = new Date().toISOString();
  const savedView: ProviderWebhookReviewSavedView = {
    id: `provider-webhook-review-view-local-${mockProviderWebhookReviewSavedViews.length + 1}`,
    name: safeMockText(payload.name) ?? "Saved review view",
    description: safeMockText(payload.description ?? null),
    tenantId: "mock-tenant",
    ownerId: "system",
    createdBy: "system",
    filters: cleanMockSavedViewFilters(payload.filters ?? {}),
    sort: {
      sortBy: payload.sort?.sortBy ?? "receivedAt",
      sortDirection: payload.sort?.sortDirection ?? "desc"
    },
    pinned: payload.pinned ?? false,
    isDefault: payload.isDefault ?? false,
    archived: false,
    createdAt: nowIso,
    updatedAt: nowIso,
    externalCalls: 0
  };
  if (savedView.isDefault) {
    mockProviderWebhookReviewSavedViews.forEach((view) => {
      view.isDefault = false;
    });
  }
  mockProviderWebhookReviewSavedViews.unshift(savedView);
  refreshMockUnmatchedCounts();
  return savedView;
}

export async function updateSettingsProviderWebhookSavedView(
  mode: DataMode,
  savedViewId: string,
  payload: UpdateProviderWebhookReviewSavedViewRequest
): Promise<ProviderWebhookReviewSavedView> {
  if (mode === "api") {
    return updateProviderWebhookReviewSavedView(savedViewId, payload);
  }

  const savedView = mockProviderWebhookReviewSavedViews.find((view) => view.id === savedViewId);
  if (!savedView) throw new Error("Provider webhook review saved view not found");
  if (savedView.archived) throw new Error("Provider webhook review saved view is archived");
  if (payload.name !== undefined) savedView.name = safeMockText(payload.name) ?? savedView.name;
  if (payload.description !== undefined) savedView.description = safeMockText(payload.description ?? null);
  if (payload.filters !== undefined) savedView.filters = cleanMockSavedViewFilters(payload.filters);
  if (payload.sort !== undefined) {
    savedView.sort = {
      sortBy: payload.sort.sortBy ?? "receivedAt",
      sortDirection: payload.sort.sortDirection ?? "desc"
    };
  }
  if (payload.pinned !== undefined) savedView.pinned = payload.pinned;
  if (payload.isDefault !== undefined) {
    if (payload.isDefault) {
      mockProviderWebhookReviewSavedViews.forEach((view) => {
        if (view.id !== savedViewId) view.isDefault = false;
      });
    }
    savedView.isDefault = payload.isDefault;
  }
  savedView.updatedAt = new Date().toISOString();
  savedView.externalCalls = 0;
  return savedView;
}

export async function archiveSettingsProviderWebhookSavedView(mode: DataMode, savedViewId: string): Promise<ProviderWebhookReviewSavedView> {
  if (mode === "api") {
    return archiveProviderWebhookReviewSavedView(savedViewId);
  }

  const savedView = mockProviderWebhookReviewSavedViews.find((view) => view.id === savedViewId);
  if (!savedView) throw new Error("Provider webhook review saved view not found");
  savedView.archived = true;
  savedView.isDefault = false;
  savedView.updatedAt = new Date().toISOString();
  savedView.externalCalls = 0;
  refreshMockUnmatchedCounts();
  return savedView;
}

export async function loadSettingsProviderWebhookOperatorNotesData(
  mode: DataMode,
  unmatchedInboundId: string
): Promise<SettingsProviderWebhookOperatorNotesData> {
  if (mode === "api") {
    return {
      mode,
      notes: await getProviderWebhookOperatorNotes(unmatchedInboundId)
    };
  }

  return {
    mode,
    notes: mockProviderWebhookOperatorNotes.filter((note) => note.unmatchedId === unmatchedInboundId)
  };
}

export async function createSettingsProviderWebhookOperatorNote(
  mode: DataMode,
  unmatchedInboundId: string,
  payload: CreateProviderWebhookOperatorNoteRequest
): Promise<ProviderWebhookOperatorNote> {
  if (mode === "api") {
    return createProviderWebhookOperatorNote(unmatchedInboundId, payload);
  }

  const item = mockProviderWebhookUnmatchedInbound.find((candidate) => candidate.id === unmatchedInboundId);
  if (!item) throw new Error("Unmatched inbound item not found");
  const noteText = safeMockText(payload.note);
  if (!noteText) throw new Error("Invalid provider webhook operator note request");
  const nowIso = new Date().toISOString();
  const note: ProviderWebhookOperatorNote = {
    id: `provider-webhook-operator-note-local-${mockProviderWebhookOperatorNotes.length + 1}`,
    unmatchedId: item.id,
    tenantId: "mock-tenant",
    authorId: "system",
    authorLabel: "system",
    note: noteText,
    context: {
      provider: item.provider,
      platform: item.provider,
      channelAccountId: item.channelAccountId,
      safeRoomLabel: mockSafeRoomLabel(item),
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
    },
    createdAt: nowIso,
    updatedAt: nowIso,
    externalCalls: 0
  };
  mockProviderWebhookOperatorNotes.push(note);
  item.lastOperatorNoteAt = nowIso;
  return note;
}

export async function loadSettingsProviderWebhookCandidateData(mode: DataMode, unmatchedInboundId: string): Promise<SettingsProviderWebhookCandidateData> {
  if (mode === "api") {
    return {
      mode,
      candidates: await getProviderWebhookUnmatchedInboundCandidates(unmatchedInboundId)
    };
  }

  return {
    mode,
    candidates: mockProviderWebhookCandidatesByUnmatchedId[unmatchedInboundId] ?? []
  };
}

export async function loadSettingsProviderWebhookDiagnosticsData(mode: DataMode, unmatchedInboundId: string): Promise<SettingsProviderWebhookDiagnosticsData> {
  if (mode === "api") {
    return {
      mode,
      diagnostics: await getProviderWebhookUnmatchedInboundDiagnostics(unmatchedInboundId)
    };
  }

  return {
    mode,
    diagnostics: createMockUnmatchedDiagnostics(unmatchedInboundId)
  };
}

export async function loadSettingsProviderWebhookClosureEvidenceData(mode: DataMode, unmatchedInboundId: string): Promise<SettingsProviderWebhookClosureEvidenceData> {
  if (mode === "api") {
    return {
      mode,
      evidence: await getProviderWebhookUnmatchedInboundClosureEvidence(unmatchedInboundId)
    };
  }

  return {
    mode,
    evidence: createMockClosureEvidence(unmatchedInboundId)
  };
}

export async function exportSettingsProviderWebhookClosureEvidenceData(
  mode: DataMode,
  unmatchedInboundId: string
): Promise<SettingsProviderWebhookClosureEvidenceExportData> {
  if (mode === "api") {
    return {
      mode,
      exportResult: await getProviderWebhookUnmatchedInboundClosureEvidenceExport(unmatchedInboundId)
    };
  }

  return {
    mode,
    exportResult: createMockClosureEvidenceExport(unmatchedInboundId)
  };
}

export async function loadSettingsProviderWebhookClosureEvidenceExportManifestData(
  mode: DataMode,
  unmatchedInboundId: string
): Promise<SettingsProviderWebhookClosureEvidenceExportManifestData> {
  if (mode === "api") {
    return {
      mode,
      manifest: await getProviderWebhookUnmatchedInboundClosureEvidenceExportManifest(unmatchedInboundId)
    };
  }

  return {
    mode,
    manifest: createMockClosureEvidenceExportManifest(unmatchedInboundId)
  };
}

export async function loadSettingsProviderWebhookClosureEvidenceRedactionAuditData(
  mode: DataMode,
  unmatchedInboundId: string
): Promise<SettingsProviderWebhookClosureEvidenceRedactionAuditData> {
  if (mode === "api") {
    return {
      mode,
      audit: await getProviderWebhookUnmatchedInboundClosureEvidenceRedactionAudit(unmatchedInboundId)
    };
  }

  return {
    mode,
    audit: createMockClosureEvidenceRedactionAudit(unmatchedInboundId)
  };
}

export async function loadSettingsProviderWebhookHistoryData(mode: DataMode, unmatchedInboundId: string): Promise<SettingsProviderWebhookHistoryData> {
  if (mode === "api") {
    return {
      mode,
      history: await getProviderWebhookUnmatchedInboundHistory(unmatchedInboundId)
    };
  }

  return {
    mode,
    history: createMockUnmatchedHistory(unmatchedInboundId)
  };
}

export async function exportSettingsProviderWebhookUnmatchedInboundData(
  mode: DataMode,
  filters: ProviderWebhookUnmatchedInboundExportQuery = {}
): Promise<SettingsProviderWebhookExportData> {
  if (mode === "api") {
    return {
      mode,
      exportResult: await getProviderWebhookUnmatchedInboundExport(filters)
    };
  }

  return {
    mode,
    exportResult: createMockUnmatchedExport(filters)
  };
}

export async function createSettingsProviderWebhookSandboxEvent(mode: DataMode, payload: ProviderWebhookSandboxEventRequest): Promise<ProviderWebhookEvent> {
  if (mode === "api") {
    return createProviderWebhookSandboxEvent(payload);
  }

  const event = createMockProviderWebhookEvent(payload);
  mockProviderWebhookEvents = [event, ...mockProviderWebhookEvents].slice(0, 25);
  return event;
}

export async function reviewSettingsProviderWebhookUnmatchedInbound(
  mode: DataMode,
  unmatchedInboundId: string,
  payload: ProviderWebhookUnmatchedInboundReviewRequest
): Promise<ProviderWebhookUnmatchedInboundItem> {
  if (mode === "api") {
    return reviewProviderWebhookUnmatchedInbound(unmatchedInboundId, payload);
  }

  const item = mockProviderWebhookUnmatchedInbound.find((candidate) => candidate.id === unmatchedInboundId);
  if (!item) throw new Error("Unmatched inbound item not found");
  if (item.unmatchedStatus === payload.status && item.reviewStatus === payload.status) {
    return item;
  }
  const nowIso = new Date().toISOString();
  item.unmatchedStatus = payload.status;
  item.reviewStatus = payload.status;
  item.reviewedAt = nowIso;
  item.reviewedBy = "system";
  item.reviewReason = safeMockReason(payload.reason);
  item.unmatchedResolvedAt = nowIso;
  item.externalCalls = 0;
  item.candidatesAvailable = false;
  mockProviderReadiness.latestUnmatchedReviewActionStatus = payload.status;
  mockProviderReadiness.latestUnmatchedInboundStatus = payload.status;
  refreshMockUnmatchedCounts();
  return item;
}

export async function assignSettingsProviderWebhookUnmatchedInbound(
  mode: DataMode,
  unmatchedInboundId: string,
  payload: ProviderWebhookUnmatchedInboundAssignmentRequest
): Promise<ProviderWebhookUnmatchedInboundItem> {
  if (mode === "api") {
    return assignProviderWebhookUnmatchedInbound(unmatchedInboundId, payload);
  }

  const item = mockProviderWebhookUnmatchedInbound.find((candidate) => candidate.id === unmatchedInboundId);
  if (!item) throw new Error("Unmatched inbound item not found");
  applyMockAssignment(item, payload);
  refreshMockUnmatchedCounts();
  return item;
}

export async function escalateSettingsProviderWebhookUnmatchedInbound(
  mode: DataMode,
  unmatchedInboundId: string,
  payload: ProviderWebhookUnmatchedInboundEscalationRequest
): Promise<ProviderWebhookUnmatchedInboundItem> {
  if (mode === "api") {
    return escalateProviderWebhookUnmatchedInbound(unmatchedInboundId, payload);
  }

  const item = mockProviderWebhookUnmatchedInbound.find((candidate) => candidate.id === unmatchedInboundId);
  if (!item) throw new Error("Unmatched inbound item not found");
  applyMockEscalation(item, payload);
  refreshMockUnmatchedCounts();
  return item;
}

export async function resolveSettingsProviderWebhookUnmatchedInbound(
  mode: DataMode,
  unmatchedInboundId: string,
  payload: ProviderWebhookUnmatchedInboundResolutionRequest
): Promise<ProviderWebhookUnmatchedInboundItem> {
  if (mode === "api") {
    return resolveProviderWebhookUnmatchedInbound(unmatchedInboundId, payload);
  }

  const item = mockProviderWebhookUnmatchedInbound.find((candidate) => candidate.id === unmatchedInboundId);
  if (!item) throw new Error("Unmatched inbound item not found");
  applyMockResolution(item, payload);
  refreshMockUnmatchedCounts();
  return item;
}

export async function updateSettingsProviderWebhookUnmatchedInboundChecklist(
  mode: DataMode,
  unmatchedInboundId: string,
  payload: ProviderWebhookUnmatchedInboundResolutionChecklistRequest
): Promise<ProviderWebhookUnmatchedInboundItem> {
  if (mode === "api") {
    return updateProviderWebhookUnmatchedInboundChecklist(unmatchedInboundId, payload);
  }

  const item = mockProviderWebhookUnmatchedInbound.find((candidate) => candidate.id === unmatchedInboundId);
  if (!item) throw new Error("Unmatched inbound item not found");
  applyMockChecklist(item, payload);
  refreshMockUnmatchedCounts();
  return item;
}

export async function bulkReviewSettingsProviderWebhookUnmatchedInbound(
  mode: DataMode,
  payload: ProviderWebhookUnmatchedInboundBulkReviewRequest
): Promise<ProviderWebhookUnmatchedInboundBulkReviewResponse> {
  if (mode === "api") {
    return bulkReviewProviderWebhookUnmatchedInbound(payload);
  }

  const uniqueIds = Array.from(new Set(payload.ids.map((id) => id.trim()).filter(Boolean)));
  if (uniqueIds.length === 0) throw new Error("Invalid unmatched inbound bulk review request");
  if (payload.ids.length > 50) throw new Error("Invalid unmatched inbound bulk review request");

  const results: ProviderWebhookUnmatchedInboundBulkReviewResponse["results"] = [];
  for (const id of uniqueIds) {
    const item = mockProviderWebhookUnmatchedInbound.find((candidate) => candidate.id === id);
    if (!item) {
      results.push({ id, ok: false, resultStatus: "not-found", reviewStatus: null, unmatchedStatus: null, error: "Unmatched inbound item not found", externalCalls: 0 });
      continue;
    }
    if (item.unmatchedStatus === payload.reviewStatus && item.reviewStatus === payload.reviewStatus) {
      results.push({ id, ok: true, resultStatus: "already-applied", reviewStatus: payload.reviewStatus, unmatchedStatus: item.unmatchedStatus, error: null, externalCalls: 0 });
      continue;
    }
    if (item.unmatchedStatus !== "open" && item.unmatchedStatus !== "review-needed") {
      results.push({
        id,
        ok: false,
        resultStatus: "conflict",
        reviewStatus: item.reviewStatus === "reviewed" || item.reviewStatus === "skipped" ? item.reviewStatus : null,
        unmatchedStatus: item.unmatchedStatus,
        error: "Unmatched inbound item is already resolved",
        externalCalls: 0
      });
      continue;
    }
    const nowIso = new Date().toISOString();
    item.unmatchedStatus = payload.reviewStatus;
    item.reviewStatus = payload.reviewStatus;
    item.reviewedAt = nowIso;
    item.reviewedBy = "system";
    item.reviewReason = safeMockReason(payload.reason);
    item.unmatchedResolvedAt = nowIso;
    item.externalCalls = 0;
    item.candidatesAvailable = false;
    results.push({ id, ok: true, resultStatus: "updated", reviewStatus: payload.reviewStatus, unmatchedStatus: item.unmatchedStatus, error: null, externalCalls: 0 });
  }

  mockProviderReadiness.latestUnmatchedReviewActionStatus = payload.reviewStatus;
  mockProviderReadiness.latestUnmatchedInboundStatus = payload.reviewStatus;
  refreshMockUnmatchedCounts();
  return {
    reviewStatus: payload.reviewStatus,
    results,
    summary: {
      requestedCount: payload.ids.length,
      dedupedCount: uniqueIds.length,
      successCount: results.filter((result) => result.ok).length,
      errorCount: results.filter((result) => !result.ok).length,
      updatedCount: results.filter((result) => result.resultStatus === "updated").length,
      alreadyAppliedCount: results.filter((result) => result.resultStatus === "already-applied").length
    },
    externalCalls: 0
  };
}

export async function bulkResolveSettingsProviderWebhookUnmatchedInbound(
  mode: DataMode,
  payload: ProviderWebhookUnmatchedInboundBulkResolutionRequest
): Promise<ProviderWebhookUnmatchedInboundBulkResolutionResponse> {
  if (mode === "api") {
    return bulkResolveProviderWebhookUnmatchedInbound(payload);
  }

  const uniqueIds = Array.from(new Set(payload.ids.map((id) => id.trim()).filter(Boolean)));
  const results: ProviderWebhookUnmatchedInboundBulkResolutionResponse["results"] = [];
  for (const id of uniqueIds) {
    const item = mockProviderWebhookUnmatchedInbound.find((candidate) => candidate.id === id);
    if (!item) {
      results.push({ id, ok: false, resultStatus: "not-found", resolutionStatus: null, resolutionOutcome: null, closureReadiness: null, checklistCompletedCount: null, checklistTotalCount: null, error: "Unmatched inbound item not found", externalCalls: 0 });
      continue;
    }
    const before = mockResolutionFingerprint(item);
    if (payload.operation === "SET_RESOLUTION" || payload.operation === "CLEAR_RESOLUTION") {
      applyMockResolution(item, {
        operation: payload.operation,
        resolutionOutcome: payload.resolutionOutcome,
        note: payload.note
      });
    } else {
      applyMockChecklist(item, {
        operation: payload.operation === "COMPLETE_STEP" ? "COMPLETE_STEP" : "RESET_CHECKLIST",
        step: payload.step
      });
    }
    results.push({
      id,
      ok: true,
      resultStatus: before === mockResolutionFingerprint(item) ? "already-applied" : "updated",
      resolutionStatus: item.resolutionStatus,
      resolutionOutcome: item.resolutionOutcome,
      closureReadiness: item.closureReadiness,
      checklistCompletedCount: item.checklistCompletedCount,
      checklistTotalCount: item.checklistTotalCount,
      error: null,
      externalCalls: 0
    });
  }
  refreshMockUnmatchedCounts();
  return {
    operation: payload.operation,
    results,
    summary: mockBulkResolutionSummary(payload.ids.length, uniqueIds.length, results),
    externalCalls: 0
  };
}

export async function bulkAssignSettingsProviderWebhookUnmatchedInbound(
  mode: DataMode,
  payload: ProviderWebhookUnmatchedInboundBulkAssignmentRequest
): Promise<ProviderWebhookUnmatchedInboundBulkAssignmentResponse> {
  if (mode === "api") {
    return bulkAssignProviderWebhookUnmatchedInbound(payload);
  }

  const uniqueIds = Array.from(new Set(payload.ids.map((id) => id.trim()).filter(Boolean)));
  const results: ProviderWebhookUnmatchedInboundBulkAssignmentResponse["results"] = [];
  for (const id of uniqueIds) {
    const item = mockProviderWebhookUnmatchedInbound.find((candidate) => candidate.id === id);
    if (!item) {
      results.push({ id, ok: false, resultStatus: "not-found", assignmentStatus: null, escalationStatus: null, escalationReason: null, error: "Unmatched inbound item not found", externalCalls: 0 });
      continue;
    }
    const before = `${item.assignmentStatus}:${item.assignedToOperatorLabel ?? ""}:${item.assignedAt ?? ""}`;
    applyMockAssignment(item, payload);
    const after = `${item.assignmentStatus}:${item.assignedToOperatorLabel ?? ""}:${item.assignedAt ?? ""}`;
    results.push({ id, ok: true, resultStatus: before === after ? "already-applied" : "updated", assignmentStatus: item.assignmentStatus, escalationStatus: item.escalationStatus, escalationReason: item.escalationReason, error: null, externalCalls: 0 });
  }
  refreshMockUnmatchedCounts();
  return {
    operation: payload.operation,
    results,
    summary: mockBulkMetadataSummary(payload.ids.length, uniqueIds.length, results),
    externalCalls: 0
  };
}

export async function bulkEscalateSettingsProviderWebhookUnmatchedInbound(
  mode: DataMode,
  payload: ProviderWebhookUnmatchedInboundBulkEscalationRequest
): Promise<ProviderWebhookUnmatchedInboundBulkEscalationResponse> {
  if (mode === "api") {
    return bulkEscalateProviderWebhookUnmatchedInbound(payload);
  }

  const uniqueIds = Array.from(new Set(payload.ids.map((id) => id.trim()).filter(Boolean)));
  const results: ProviderWebhookUnmatchedInboundBulkEscalationResponse["results"] = [];
  for (const id of uniqueIds) {
    const item = mockProviderWebhookUnmatchedInbound.find((candidate) => candidate.id === id);
    if (!item) {
      results.push({ id, ok: false, resultStatus: "not-found", assignmentStatus: null, escalationStatus: null, escalationReason: null, error: "Unmatched inbound item not found", externalCalls: 0 });
      continue;
    }
    const before = `${item.escalationStatus}:${item.escalationReason ?? ""}:${item.escalatedAt ?? ""}`;
    applyMockEscalation(item, payload);
    const after = `${item.escalationStatus}:${item.escalationReason ?? ""}:${item.escalatedAt ?? ""}`;
    results.push({ id, ok: true, resultStatus: before === after ? "already-applied" : "updated", assignmentStatus: item.assignmentStatus, escalationStatus: item.escalationStatus, escalationReason: item.escalationReason, error: null, externalCalls: 0 });
  }
  refreshMockUnmatchedCounts();
  return {
    operation: payload.operation,
    results,
    summary: mockBulkMetadataSummary(payload.ids.length, uniqueIds.length, results),
    externalCalls: 0
  };
}

export async function linkSettingsProviderWebhookUnmatchedInboundConversation(
  mode: DataMode,
  unmatchedInboundId: string,
  payload: ProviderWebhookUnmatchedInboundLinkRequest
): Promise<ProviderWebhookUnmatchedInboundItem> {
  if (mode === "api") {
    return linkProviderWebhookUnmatchedInboundConversation(unmatchedInboundId, payload);
  }

  const item = mockProviderWebhookUnmatchedInbound.find((candidate) => candidate.id === unmatchedInboundId);
  if (!item) throw new Error("Unmatched inbound item not found");
  const nowIso = new Date().toISOString();
  item.unmatchedStatus = "linked";
  item.reviewStatus = "linked";
  item.linkStatus = payload.actionMode === "link-and-persist-safe-message" ? "linked-message-persisted" : "linked";
  item.linkedConversationId = payload.conversationId;
  item.linkedMessageId = payload.actionMode === "link-and-persist-safe-message" ? "message-local-linked" : null;
  item.messagePersisted = payload.actionMode === "link-and-persist-safe-message";
  item.unmatchedResolvedAt = nowIso;
  item.externalCalls = 0;
  item.candidatesAvailable = false;
  mockProviderReadiness.latestUnmatchedLinkStatus = item.linkStatus;
  mockProviderReadiness.latestUnmatchedInboundStatus = "linked";
  refreshMockUnmatchedCounts();
  return item;
}

export async function loadSettingsTeamData(mode: DataMode): Promise<SettingsTeamData> {
  if (mode === "api") {
    const [members, slaPolicies, cannedReplies] = await Promise.all([
      getSettingsTeam(),
      getSettingsSlaPolicies(),
      getSettingsCannedReplies()
    ]);
    return {
      mode,
      members,
      slaPolicies,
      cannedReplies
    };
  }

  const store = createDefaultAdminStore();
  return {
    mode,
    members: store.agents.map((agent) => ({
      id: agent.id,
      name: agent.name,
      displayName: agent.name,
      email: agent.email,
      role: agent.role,
      status: agent.status,
      skills: agent.assignedRoomIds,
      maxConcurrentChats: agent.maxActiveConversations,
      createdAt: now,
      updatedAt: now
    })),
    slaPolicies: mockSlaPolicies.map((policy) => ({
      id: policy.id,
      name: policy.name,
      description: "",
      status: "active",
      priorityScope: policy.appliesToPriority,
      firstResponseMinutes: policy.firstResponseMinutes,
      resolutionMinutes: policy.resolutionHours * 60,
      businessHoursMode: "always",
      escalationRole: "supervisor",
      createdAt: now,
      updatedAt: now
    })),
    cannedReplies: mockCannedReplies.map((reply) => ({
      id: reply.id,
      title: reply.title,
      category: reply.category,
      shortcut: reply.shortcut,
      bodyTemplate: reply.body,
      tags: reply.tags,
      platformScope: [],
      roomScope: [],
      status: reply.isActive ? "active" : "inactive",
      createdAt: now,
      updatedAt: now
    }))
  };
}

export function mapSettingsCannedReplyToCannedReply(reply: SettingsCannedReply): CannedReply {
  return {
    id: reply.id,
    title: reply.title,
    shortcut: reply.shortcut,
    body: reply.bodyTemplate,
    tags: reply.tags,
    category: reply.category,
    isActive: reply.status === "active"
  };
}

export function searchCannedReplyList(replies: CannedReply[], query: string, category = "all", tag = "all") {
  const normalized = query.trim().toLowerCase();
  return replies.filter((reply) => {
    if (!reply.isActive) return false;
    if (category !== "all" && reply.category !== category) return false;
    if (tag !== "all" && !reply.tags.includes(tag)) return false;
    if (!normalized) return true;
    return [reply.title, reply.shortcut, reply.body, reply.category, ...reply.tags].some((value) => value.toLowerCase().includes(normalized));
  });
}

export function findCannedReplyInList(replies: CannedReply[], slashCommand: string) {
  const command = slashCommand.trim().split(/\s+/)[0]?.toLowerCase();
  return replies.find((reply) => reply.isActive && reply.shortcut.toLowerCase() === command) ?? null;
}

export function getCannedRepliesForMode(mode: DataMode, apiReplies: CannedReply[], localReplies: CannedReply[]) {
  return mode === "api" ? apiReplies : localReplies;
}

export function resolveCannedReplyComposerDraft(replies: CannedReply[], replyId: string) {
  const reply = replies.find((item) => item.id === replyId && item.isActive);
  return reply
    ? {
        replyId: reply.id,
        shortcut: reply.shortcut,
        body: reply.body
      }
    : null;
}

function channel(
  id: string,
  platform: SettingsChannelAccount["platform"],
  accountName: string,
  accountKey: string | null,
  webhookUrl: string,
  secretState: string,
  secretConfigured: boolean
): SettingsChannelAccount {
  return {
    id,
    platform,
    accountName,
    accountKey,
    status: "demo/mock",
    webhookUrl,
    createdAt: now,
    updatedAt: now,
    lastInboundAt: null,
    lastMessageAt: null,
    hasAccessToken: false,
    tokenMasked: null,
    secretConfigured,
    secretMasked: secretConfigured ? `masked:${secretState}` : null
  };
}

function createMockUnmatchedInboundPage(filters: ProviderWebhookUnmatchedInboundFilters): Omit<SettingsProviderWebhookUnmatchedInboundData, "mode"> {
  const limit = filters.limit ?? 10;
  const offset = filters.offset ?? 0;
  const sortBy = filters.sortBy ?? "receivedAt";
  const sortOrder = filters.sortOrder ?? "desc";
  const filtered = filterMockUnmatchedInbound(filters);
  const sorted = [...filtered].sort((left, right) => {
    const compared = left.receivedAt.localeCompare(right.receivedAt);
    return sortOrder === "asc" ? compared : -compared;
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
    appliedFilters: {
      ...filters,
      limit,
      offset,
      sortBy,
      sortOrder
    },
    appliedSort: {
      sortBy,
      sortOrder
    },
    summary: summarizeMockUnmatchedInbound(filtered),
    externalCalls: 0
  };
}

function filterMockUnmatchedInbound(filters: ProviderWebhookUnmatchedInboundFilters) {
  const receivedFrom = filters.receivedAtFrom ?? filters.receivedFrom;
  const receivedTo = filters.receivedAtTo ?? filters.receivedTo;
  return mockProviderWebhookUnmatchedInbound.filter((item) => {
    if (filters.status === "open" && item.unmatchedStatus !== "open" && item.unmatchedStatus !== "review-needed") return false;
    if (filters.status && filters.status !== "open" && item.unmatchedStatus !== filters.status) return false;
    if (filters.provider && item.provider !== filters.provider) return false;
    if (filters.reviewStatus && item.reviewStatus !== filters.reviewStatus) return false;
    if (filters.linkStatus && item.linkStatus !== filters.linkStatus) return false;
    if (filters.unmatchedStatus && item.unmatchedStatus !== filters.unmatchedStatus) return false;
    if (filters.eventType && item.eventType !== filters.eventType) return false;
    if (filters.assignedTo && item.assignedToOperatorLabel !== (filters.assignedTo === "me" ? "operator:current" : filters.assignedTo)) return false;
    if (filters.assignmentStatus === "unassigned" && item.assignmentStatus !== "unassigned") return false;
    if (filters.assignmentStatus === "assigned" && item.assignmentStatus !== "assigned") return false;
    if (filters.assignmentStatus === "assigned_to_me" && item.assignedToOperatorLabel !== "operator:current") return false;
    if (filters.assignmentStatus === "assigned_to_others" && (item.assignmentStatus !== "assigned" || item.assignedToOperatorLabel === "operator:current")) return false;
    if (filters.escalationStatus && item.escalationStatus !== filters.escalationStatus) return false;
    if (filters.escalationReason && item.escalationReason !== filters.escalationReason) return false;
    syncMockResolutionState(item);
    if (filters.severity && mockTriageSeverityForItem(item, mockTriageLaneForItem(item)) !== filters.severity) return false;
    if (filters.triageLane && mockTriageLaneForItem(item) !== filters.triageLane) return false;
    if (filters.resolutionStatus && item.resolutionStatus !== filters.resolutionStatus) return false;
    if (filters.resolutionOutcome && item.resolutionOutcome !== filters.resolutionOutcome) return false;
    if (filters.closureReadiness && item.closureReadiness !== filters.closureReadiness) return false;
    if (filters.checklistIncomplete !== undefined && (item.checklistCompletedCount < item.checklistTotalCount) !== filters.checklistIncomplete) return false;
    if (receivedFrom && item.receivedAt < new Date(receivedFrom).toISOString()) return false;
    if (receivedTo && item.receivedAt > new Date(receivedTo).toISOString()) return false;
    return true;
  });
}

function summarizeMockUnmatchedInbound(items: ProviderWebhookUnmatchedInboundItem[]) {
  return {
    openCount: items.filter((item) => item.unmatchedStatus === "open" || item.unmatchedStatus === "review-needed").length,
    reviewedCount: items.filter((item) => item.reviewStatus === "reviewed").length,
    skippedCount: items.filter((item) => item.reviewStatus === "skipped").length,
    linkedCount: items.filter((item) => item.reviewStatus === "linked").length
  };
}

function createMockReviewMetrics(filters: ProviderWebhookReviewMetricsFilters): ProviderWebhookReviewMetrics {
  const appliedFilters = cleanMockReviewMetricsFilters(filters);
  const items = filterMockUnmatchedInbound(appliedFilters);
  const events = filterMockEventsForMetrics(appliedFilters);
  const openItems = items.filter((item) => item.unmatchedStatus === "open" || item.unmatchedStatus === "review-needed");
  const receivedAtValues = items.map((item) => item.receivedAt).sort();
  const openReceivedAtValues = openItems.map((item) => item.receivedAt).sort();
  return {
    generatedAt: new Date().toISOString(),
    appliedFilters,
    totalEvents: events.length,
    totalUnmatched: items.length,
    openUnmatched: openItems.length,
    reviewedCount: items.filter((item) => item.reviewStatus === "reviewed").length,
    skippedCount: items.filter((item) => item.reviewStatus === "skipped").length,
    linkedCount: items.filter((item) => item.reviewStatus === "linked").length,
    persistedInboundCount: events.filter((event) => event.messagePersisted).length,
    signatureRejectedCount: events.filter((event) => event.signatureStatus === "failed").length,
    replayRejectedCount: events.filter((event) => event.replayDetected || event.routingStatus === "blocked-replay").length,
    byProvider: countMockBy(items, providersForMetrics, (item) => item.provider),
    byEventType: countMockBy(items, eventTypesForMetrics, (item) => item.eventType),
    byReviewStatus: countMockBy(items, reviewStatusesForMetrics, (item) => item.reviewStatus),
    byLinkStatus: countMockBy(items, linkStatusesForMetrics, (item) => item.linkStatus),
    byUnmatchedStatus: countMockBy(items, unmatchedStatusesForMetrics, (item) => item.unmatchedStatus),
    ageBuckets: mockAgeBuckets(openItems),
    funnel: {
      inboundReceived: events.length,
      persisted: events.filter((event) => event.messagePersisted).length,
      unmatchedQueued: items.length,
      reviewed: items.filter((item) => item.reviewStatus === "reviewed").length,
      skipped: items.filter((item) => item.reviewStatus === "skipped").length,
      linked: items.filter((item) => item.reviewStatus === "linked").length,
      exportedHistoryAvailable: items.length
    },
    latestReceivedAt: receivedAtValues[receivedAtValues.length - 1] ?? null,
    oldestOpenReceivedAt: openReceivedAtValues[0] ?? null,
    externalCalls: 0
  };
}

function createMockReviewAlerts(filters: ProviderWebhookReviewAlertsFilters): ProviderWebhookReviewAlerts {
  const generatedAt = new Date().toISOString();
  const appliedFilters = cleanMockReviewAlertsFilters(filters);
  const openItems = filterMockUnmatchedInbound(appliedFilters).filter((item) =>
    item.unmatchedStatus === "open" || item.unmatchedStatus === "review-needed"
  );
  const alertItems = openItems
    .map(mockReviewAlertItem)
    .filter((item) => !appliedFilters.severity || item.severity === appliedFilters.severity)
    .sort((left, right) => left.receivedAt.localeCompare(right.receivedAt));
  return {
    generatedAt,
    appliedFilters,
    totalAlerts: alertItems.length,
    infoCount: alertItems.filter((item) => item.severity === "info").length,
    warningCount: alertItems.filter((item) => item.severity === "warning").length,
    criticalCount: alertItems.filter((item) => item.severity === "critical").length,
    staleOpenCount: alertItems.filter((item) => mockHoursSince(item.receivedAt) >= mockReviewAlertThresholds.staleWarningHours).length,
    overSlaCount: alertItems.filter((item) => mockHoursSince(item.receivedAt) >= mockReviewAlertThresholds.overSlaHours).length,
    oldestOpenReceivedAt: alertItems[0]?.receivedAt ?? null,
    latestAlertGeneratedAt: alertItems.length > 0 ? generatedAt : null,
    thresholds: mockReviewAlertThresholds,
    byProvider: countMockBy(alertItems, providersForMetrics, (item) => item.provider),
    byPlatform: countMockBy(alertItems, providersForMetrics, (item) => item.platform),
    byEventType: countMockBy(alertItems, eventTypesForMetrics, (item) => item.eventType),
    byReviewStatus: countMockBy(alertItems, reviewStatusesForMetrics, (item) => item.reviewStatus),
    byLinkStatus: countMockBy(alertItems, linkStatusesForMetrics, (item) => item.linkStatus),
    byUnmatchedStatus: countMockBy(alertItems, unmatchedStatusesForMetrics, (item) => item.unmatchedStatus),
    bySeverity: countMockBy(alertItems, alertSeveritiesForMetrics, (item) => item.severity),
    alertItems: alertItems.slice(0, 10),
    externalCalls: 0
  };
}

function createMockReviewTriage(filters: ProviderWebhookReviewTriageFilters): ProviderWebhookReviewTriage {
  const appliedFilters = cleanMockReviewTriageFilters(filters);
  const items = filterMockUnmatchedInbound(mockTriageBaseFilters(appliedFilters))
    .map(mockReviewTriageItem)
    .filter((item) => !appliedFilters.severity || item.severity === appliedFilters.severity)
    .filter((item) => !appliedFilters.triageLane || item.triageLane === appliedFilters.triageLane)
    .sort((left, right) => {
      const severityCompared = mockTriageSeverityRank(right.severity) - mockTriageSeverityRank(left.severity);
      if (severityCompared !== 0) return severityCompared;
      return left.receivedAt.localeCompare(right.receivedAt);
    });
  const openItems = items.filter((item) => item.unmatchedStatus === "open" || item.unmatchedStatus === "review-needed");
  return {
    generatedAt: new Date().toISOString(),
    appliedFilters,
    totalItems: items.length,
    totalOpenItems: openItems.length,
    totalTriageLanes: mockTriageLanes.length,
    thresholds: mockReviewAlertThresholds,
    lanes: mockTriageLanes.map((laneKey) => ({
      laneKey,
      label: mockTriageLaneDetails[laneKey].label,
      severity: mockTriageLaneSeverity(laneKey),
      count: items.filter((item) => item.triageLane === laneKey).length,
      description: mockTriageLaneDetails[laneKey].description,
      recommendedNextActions: mockTriageActionsForLane(laneKey),
      safeDrilldownFilters: mockTriageLaneDetails[laneKey].safeDrilldownFilters
    })),
    byProvider: countMockBy(items, providersForMetrics, (item) => item.provider),
    byPlatform: countMockBy(items, providersForMetrics, (item) => item.platform),
    byEventType: countMockBy(items, eventTypesForMetrics, (item) => item.eventType),
    byReviewStatus: countMockBy(items, reviewStatusesForMetrics, (item) => item.reviewStatus),
    byLinkStatus: countMockBy(items, linkStatusesForMetrics, (item) => item.linkStatus),
    byUnmatchedStatus: countMockBy(items, unmatchedStatusesForMetrics, (item) => item.unmatchedStatus),
    byLane: countMockBy(items, mockTriageLanes, (item) => item.triageLane),
    topItems: items.slice(0, 10),
    externalCalls: 0
  };
}

function createMockReviewWorkload(filters: ProviderWebhookReviewWorkloadFilters): ProviderWebhookReviewWorkload {
  const appliedFilters = cleanMockReviewTriageFilters(filters);
  const items = filterMockUnmatchedInbound(mockTriageBaseFilters(appliedFilters))
    .map(mockAssignmentSummaryItem)
    .filter((item) => !appliedFilters.severity || item.severity === appliedFilters.severity)
    .filter((item) => !appliedFilters.triageLane || item.triageLane === appliedFilters.triageLane);
  const openItems = items.filter((item) => item.unmatchedStatus === "open" || item.unmatchedStatus === "review-needed");
  const assignedOpen = openItems.filter((item) => item.assignmentStatus === "assigned");
  return {
    generatedAt: new Date().toISOString(),
    appliedFilters,
    totalItems: items.length,
    totalOpenItems: openItems.length,
    thresholds: mockReviewAlertThresholds,
    counts: {
      unassignedOpen: openItems.filter((item) => item.assignmentStatus === "unassigned").length,
      assignedToMeOpen: openItems.filter((item) => item.assignedToOperatorLabel === "operator:current").length,
      assignedToOthersOpen: openItems.filter((item) => item.assignmentStatus === "assigned" && item.assignedToOperatorLabel !== "operator:current").length,
      assignedOpen: assignedOpen.length,
      escalatedOpen: openItems.filter((item) => item.escalationStatus === "escalated").length,
      overdueAssignedOpen: assignedOpen.filter((item) => mockHoursSince(item.assignedAt ?? item.receivedAt) >= mockReviewAlertThresholds.overSlaHours).length,
      recentlyAssigned: items.filter((item) => item.assignedAt).length,
      recentlyEscalated: items.filter((item) => item.escalatedAt).length,
      resolvedAssigned: items.filter((item) => item.assignmentStatus === "assigned" && item.unmatchedStatus !== "open" && item.unmatchedStatus !== "review-needed").length,
      unresolvedOpen: openItems.filter((item) => item.resolutionStatus === "unresolved").length,
      readyForClosure: openItems.filter((item) => item.closureReadiness === "READY_FOR_REVIEW" || item.closureReadiness === "READY_FOR_SKIP" || item.closureReadiness === "READY_FOR_LINK" || item.closureReadiness === "READY_FOR_LINK_AND_PERSIST").length,
      blockedResolution: openItems.filter((item) => item.closureReadiness === "BLOCKED").length,
      checklistIncompleteOpen: openItems.filter((item) => item.checklistCompletedCount < item.checklistTotalCount).length
    },
    byAssignee: countMockByDynamic(items, (item) => item.assignedToOperatorLabel ?? "unassigned"),
    byAssignmentStatus: countMockBy(items, ["unassigned", "assigned"], (item) => item.assignmentStatus),
    byEscalationStatus: countMockBy(items, ["none", "escalated"], (item) => item.escalationStatus),
    byEscalationReason: countMockBy(items, mockEscalationReasons, (item) => item.escalationReason ?? "none"),
    byProvider: countMockBy(items, providersForMetrics, (item) => item.provider),
    byPlatform: countMockBy(items, providersForMetrics, (item) => item.platform),
    byReviewStatus: countMockBy(items, reviewStatusesForMetrics, (item) => item.reviewStatus),
    byLinkStatus: countMockBy(items, linkStatusesForMetrics, (item) => item.linkStatus),
    byUnmatchedStatus: countMockBy(items, unmatchedStatusesForMetrics, (item) => item.unmatchedStatus),
    topAssignedItems: items.filter((item) => item.assignmentStatus === "assigned").slice(0, 10),
    topEscalatedItems: items.filter((item) => item.escalationStatus === "escalated").slice(0, 10),
    externalCalls: 0
  };
}

function createMockReviewResolutionSummary(filters: ProviderWebhookReviewResolutionSummaryFilters): ProviderWebhookReviewResolutionSummary {
  const appliedFilters = cleanMockReviewResolutionSummaryFilters(filters);
  const items = filterMockUnmatchedInbound(mockTriageBaseFilters(appliedFilters))
    .map(mockResolutionSummaryItem)
    .filter((item) => !appliedFilters.severity || item.severity === appliedFilters.severity)
    .filter((item) => !appliedFilters.triageLane || item.triageLane === appliedFilters.triageLane)
    .filter((item) => !appliedFilters.resolutionStatus || item.resolutionStatus === appliedFilters.resolutionStatus)
    .filter((item) => !appliedFilters.resolutionOutcome || item.resolutionOutcome === appliedFilters.resolutionOutcome)
    .filter((item) => !appliedFilters.closureReadiness || item.closureReadiness === appliedFilters.closureReadiness)
    .filter((item) => appliedFilters.checklistIncomplete === undefined || (item.checklistCompletedCount < item.checklistTotalCount) === appliedFilters.checklistIncomplete);
  const openItems = items.filter((item) => item.unmatchedStatus === "open" || item.unmatchedStatus === "review-needed");
  return {
    generatedAt: new Date().toISOString(),
    appliedFilters,
    totalItems: items.length,
    totalOpenItems: openItems.length,
    thresholds: mockReviewAlertThresholds,
    counts: {
      unresolvedOpen: openItems.filter((item) => item.resolutionStatus === "unresolved").length,
      readyForReview: openItems.filter((item) => item.closureReadiness === "READY_FOR_REVIEW").length,
      readyForSkip: openItems.filter((item) => item.closureReadiness === "READY_FOR_SKIP").length,
      readyForLink: openItems.filter((item) => item.closureReadiness === "READY_FOR_LINK").length,
      readyForLinkAndPersist: openItems.filter((item) => item.closureReadiness === "READY_FOR_LINK_AND_PERSIST").length,
      blocked: openItems.filter((item) => item.closureReadiness === "BLOCKED").length,
      resolvedRecently: items.filter((item) => item.resolvedAt).length,
      checklistIncompleteOpen: openItems.filter((item) => item.checklistCompletedCount < item.checklistTotalCount).length
    },
    byResolutionStatus: countMockBy(items, mockResolutionStatuses, (item) => item.resolutionStatus),
    byResolutionOutcome: countMockBy(items, mockResolutionOutcomes, (item) => item.resolutionOutcome ?? "none"),
    byClosureReadiness: countMockBy(items, mockClosureReadinessValues, (item) => item.closureReadiness),
    byChecklistStep: countMockBy(items.flatMap((item) => item.closureChecklist.filter((step) => step.completed)), mockClosureChecklistSteps, (step) => step.step),
    byProvider: countMockBy(items, providersForMetrics, (item) => item.provider),
    byPlatform: countMockBy(items, providersForMetrics, (item) => item.platform),
    byReviewStatus: countMockBy(items, reviewStatusesForMetrics, (item) => item.reviewStatus),
    byLinkStatus: countMockBy(items, linkStatusesForMetrics, (item) => item.linkStatus),
    byUnmatchedStatus: countMockBy(items, unmatchedStatusesForMetrics, (item) => item.unmatchedStatus),
    topReadyItems: items.filter((item) => item.closureReadiness === "READY_FOR_REVIEW" || item.closureReadiness === "READY_FOR_SKIP" || item.closureReadiness === "READY_FOR_LINK" || item.closureReadiness === "READY_FOR_LINK_AND_PERSIST").slice(0, 10),
    topBlockedItems: items.filter((item) => item.closureReadiness === "BLOCKED").slice(0, 10),
    externalCalls: 0
  };
}

function createMockReviewClosureReport(filters: ProviderWebhookReviewClosureReportFilters): ProviderWebhookReviewClosureReport {
  const appliedFilters = cleanMockReviewClosureReportFilters(filters);
  const items = filterMockUnmatchedInbound(mockTriageBaseFilters(appliedFilters))
    .map(mockClosureEvidenceSummaryItem)
    .filter((item) => !appliedFilters.severity || item.severity === appliedFilters.severity)
    .filter((item) => !appliedFilters.triageLane || item.triageLane === appliedFilters.triageLane);
  const openItems = items.filter((item) => item.unmatchedStatus === "open" || item.unmatchedStatus === "review-needed");
  return {
    generatedAt: new Date().toISOString(),
    appliedFilters,
    totalItems: items.length,
    totalOpenItems: openItems.length,
    evidenceReadyCount: items.filter((item) => item.evidenceStatus === "ready").length,
    evidenceBlockedCount: items.filter((item) => item.evidenceStatus === "blocked").length,
    evidenceIncompleteCount: items.filter((item) => item.evidenceStatus === "incomplete").length,
    byClosureReadiness: countMockBy(items, mockClosureReadinessValues, (item) => item.closureReadiness),
    byResolutionOutcome: countMockBy(items, mockResolutionOutcomes, (item) => item.resolutionOutcome ?? "none"),
    byChecklistStep: countMockBy(items.flatMap((item) => item.checklistIncompleteSteps), mockClosureChecklistSteps, (step) => step),
    byAssignmentStatus: countMockBy(items, ["unassigned", "assigned"], (item) => item.assignmentStatus),
    byEscalationStatus: countMockBy(items, ["none", "escalated"], (item) => item.escalationStatus),
    topEvidenceReadyItems: items.filter((item) => item.evidenceStatus === "ready").slice(0, 10),
    topEvidenceBlockedItems: items.filter((item) => item.evidenceStatus === "blocked").slice(0, 10),
    externalCalls: 0
  };
}

function createMockReviewClosureReportExport(filters: ProviderWebhookReviewClosureReportFilters): ProviderWebhookReviewClosureReportExport {
  return {
    ...createMockReviewClosureReport(filters),
    exportKind: "closure-report",
    format: "json",
    contentType: "application/json",
    safeFilename: "provider-webhook-review-closure-report.json",
    exportedAt: new Date().toISOString()
  };
}

function createMockReviewClosureReportRedactionAudit(filters: ProviderWebhookReviewClosureReportFilters): ProviderWebhookReviewExportRedactionAudit {
  const exportResult = createMockReviewClosureReportExport(filters);
  const safeRoomDigestPresent = [
    ...exportResult.topEvidenceReadyItems,
    ...exportResult.topEvidenceBlockedItems
  ].every((item) => Boolean(item.roomKeyDigest));
  return createMockExportRedactionAudit({
    auditTarget: "closure-report-export",
    appliedFilters: exportResult.appliedFilters,
    safeRoomDigestPresent,
    safeDigest: "sha256:mockclosurereportredactionaudit"
  });
}

function createMockReviewClosureExportIntegrity(filters: ProviderWebhookReviewClosureReportFilters): ProviderWebhookReviewExportIntegrity {
  const report = createMockReviewClosureReport(filters);
  const warningCount = [
    ...report.topEvidenceReadyItems,
    ...report.topEvidenceBlockedItems
  ].filter((item) => !item.roomKeyDigest).length;
  return {
    generatedAt: new Date().toISOString(),
    appliedFilters: report.appliedFilters,
    externalCalls: 0,
    totalCheckedItems: report.totalItems,
    redactionPassedCount: Math.max(report.totalItems - warningCount, 0),
    redactionWarningCount: warningCount,
    redactionBlockedCount: 0,
    deterministicExportConfirmed: true,
    exportShapeVersion: "provider-webhook-closure-export-v1",
    safeReportDigest: "sha256:mockclosurereportintegrity"
  };
}

function createMockReviewClosureReportExportManifest(filters: ProviderWebhookReviewClosureReportFilters): ProviderWebhookReviewExportManifest {
  const exportResult = createMockReviewClosureReportExport(filters);
  const audit = createMockReviewClosureReportRedactionAudit(filters);
  const integrity = createMockReviewClosureExportIntegrity(filters);
  return createMockExportManifest({
    manifestTarget: "closure-report-export",
    exportKind: exportResult.exportKind,
    safeFilename: exportResult.safeFilename,
    exportedAt: exportResult.exportedAt,
    appliedFilters: exportResult.appliedFilters,
    totalItems: exportResult.totalItems,
    totalOpenItems: exportResult.totalOpenItems,
    evidenceReadyCount: exportResult.evidenceReadyCount,
    evidenceBlockedCount: exportResult.evidenceBlockedCount,
    evidenceIncompleteCount: exportResult.evidenceIncompleteCount,
    redactionStatus: audit.status,
    redactionIssueCount: audit.issues.length,
    redactionPassedCount: integrity.redactionPassedCount,
    redactionWarningCount: integrity.redactionWarningCount,
    redactionBlockedCount: integrity.redactionBlockedCount,
    deterministicExportConfirmed: integrity.deterministicExportConfirmed,
    safeDigest: audit.safeDigest,
    safeReportDigest: integrity.safeReportDigest
  });
}

function createMockReviewQaHandoffBundle(filters: ProviderWebhookReviewClosureReportFilters): ProviderWebhookReviewQaHandoffBundle {
  const closureReportExport = createMockReviewClosureReportExport(filters);
  const closureReportManifest = createMockReviewClosureReportExportManifest(filters);
  const closureReportRedactionAudit = createMockReviewClosureReportRedactionAudit(filters);
  const closureExportIntegrity = createMockReviewClosureExportIntegrity(filters);
  const evidenceManifests = [
    ...closureReportExport.topEvidenceReadyItems,
    ...closureReportExport.topEvidenceBlockedItems
  ].slice(0, 10).map((item) => {
    const manifest = createMockClosureEvidenceExportManifest(item.unmatchedId);
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
  });
  const readiness: ProviderWebhookReviewQaHandoffBundle["readiness"] = {
    reviewClosureEvidenceEnabled: mockProviderReadiness.reviewClosureEvidenceEnabled,
    reviewClosureReportEnabled: mockProviderReadiness.reviewClosureReportEnabled,
    reviewClosureEvidenceExportEnabled: mockProviderReadiness.reviewClosureEvidenceExportEnabled,
    reviewClosureReportExportEnabled: mockProviderReadiness.reviewClosureReportExportEnabled,
    reviewExportRedactionAuditEnabled: mockProviderReadiness.reviewExportRedactionAuditEnabled,
    reviewExportIntegrityChecksEnabled: mockProviderReadiness.reviewExportIntegrityChecksEnabled,
    reviewExportManifestEnabled: mockProviderReadiness.reviewExportManifestEnabled,
    reviewExportQaHandoffEnabled: mockProviderReadiness.reviewExportQaHandoffEnabled,
    closureEvidenceReadyCount: mockProviderReadiness.closureEvidenceReadyCount,
    closureEvidenceBlockedCount: mockProviderReadiness.closureEvidenceBlockedCount,
    closureEvidenceIncompleteCount: mockProviderReadiness.closureEvidenceIncompleteCount,
    closureEvidenceExportCount: mockProviderReadiness.closureEvidenceExportCount,
    closureReportExportCount: mockProviderReadiness.closureReportExportCount,
    exportRedactionPassedCount: mockProviderReadiness.exportRedactionPassedCount,
    exportRedactionWarningCount: mockProviderReadiness.exportRedactionWarningCount,
    exportRedactionBlockedCount: mockProviderReadiness.exportRedactionBlockedCount,
    exportManifestReadyCount: mockProviderReadiness.exportManifestReadyCount,
    exportManifestNeedsReviewCount: mockProviderReadiness.exportManifestNeedsReviewCount,
    exportManifestBlockedCount: mockProviderReadiness.exportManifestBlockedCount,
    latestExportManifestStatus: mockProviderReadiness.latestExportManifestStatus,
    externalCalls: 0
  };
  const allManifests = [closureReportManifest, ...evidenceManifests];
  const manualQaChecks: ProviderWebhookReviewQaHandoffBundle["manualQaChecks"] = {
    reportManifestReady: closureReportManifest.manualQaReadiness === "ready",
    reportRedactionPassedOrWarned: closureReportRedactionAudit.status === "passed" || closureReportRedactionAudit.status === "warning",
    reportIntegrityConfirmed: closureReportManifest.integrityStatus === "confirmed" && closureExportIntegrity.deterministicExportConfirmed,
    evidenceManifestsReadyOrNeedsReview: evidenceManifests.every((manifest) => manifest.manualQaReadiness !== "blocked"),
    safeFilenamePresent: allManifests.every((manifest) => manifest.safeFilename.length > 0),
    safeDigestPresent: allManifests.every((manifest) => manifest.safeDigest.startsWith("sha256:")),
    rawPayloadAbsent: closureReportRedactionAudit.checks.rawPayloadAbsent,
    rawSignatureAbsent: closureReportRedactionAudit.checks.rawSignatureAbsent,
    tokenAbsent: closureReportRedactionAudit.checks.tokenAbsent,
    replyTokenAbsent: closureReportRedactionAudit.checks.replyTokenAbsent,
    rawSenderIdAbsent: closureReportRedactionAudit.checks.rawSenderIdAbsent,
    rawRoomIdAbsent: closureReportRedactionAudit.checks.rawRoomIdAbsent,
    providerOutboundAbsent: closureReportRedactionAudit.checks.providerOutboundAbsent,
    externalCallsZero: true,
    readinessFlagsPresent: readiness.reviewClosureEvidenceEnabled &&
      readiness.reviewClosureReportEnabled &&
      readiness.reviewClosureEvidenceExportEnabled &&
      readiness.reviewClosureReportExportEnabled &&
      readiness.reviewExportRedactionAuditEnabled &&
      readiness.reviewExportIntegrityChecksEnabled &&
      readiness.reviewExportManifestEnabled &&
      readiness.reviewExportQaHandoffEnabled
  };
  const manualQaReadiness: ProviderWebhookReviewQaHandoffBundle["manualQaReadiness"] =
    closureReportManifest.manualQaReadiness === "blocked" || evidenceManifests.some((manifest) => manifest.manualQaReadiness === "blocked")
      ? "blocked"
      : closureReportManifest.manualQaReadiness === "needs_review" || evidenceManifests.some((manifest) => manifest.manualQaReadiness === "needs_review")
        ? "needs_review"
        : "ready";

  return {
    generatedAt: new Date().toISOString(),
    bundleKind: "provider-webhook-review-qa-handoff-bundle",
    appliedFilters: closureReportExport.appliedFilters,
    readiness,
    closureReportExport,
    closureReportManifest,
    closureReportRedactionAudit,
    closureExportIntegrity,
    evidenceManifests,
    manualQaReadiness,
    manualQaChecks,
    safeFilename: "provider-webhook-review-qa-handoff-bundle.json",
    safeDigest: "sha256:mockqahandoffbundle",
    externalCalls: 0
  };
}

function createMockReviewQaHandoffBundleExport(filters: ProviderWebhookReviewClosureReportFilters): ProviderWebhookReviewQaHandoffBundleExport {
  const bundle = createMockReviewQaHandoffBundle(filters);
  return {
    generatedAt: bundle.generatedAt,
    exportedAt: new Date().toISOString(),
    exportKind: "qa-handoff-bundle",
    format: "json",
    contentType: "application/json",
    safeFilename: "provider-webhook-review-qa-handoff-bundle-export.json",
    safeDigest: "sha256:mockqahandoffbundleexport",
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
      externalCalls: 0
    },
    exportManifestSummary: {
      readyCount: bundle.readiness.exportManifestReadyCount,
      needsReviewCount: bundle.readiness.exportManifestNeedsReviewCount,
      blockedCount: bundle.readiness.exportManifestBlockedCount,
      latestStatus: bundle.readiness.latestExportManifestStatus,
      reportManifestReadiness: bundle.closureReportManifest.manualQaReadiness,
      reportManifestIntegrityStatus: bundle.closureReportManifest.integrityStatus,
      externalCalls: 0
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
      externalCalls: 0
    },
    integritySummary: {
      status: bundle.closureReportManifest.integrityStatus,
      totalCheckedItems: bundle.closureExportIntegrity.totalCheckedItems,
      deterministicExportConfirmed: bundle.closureExportIntegrity.deterministicExportConfirmed,
      safeReportDigest: bundle.closureExportIntegrity.safeReportDigest,
      externalCalls: 0
    },
    manualQaChecks: bundle.manualQaChecks,
    bundle,
    externalCalls: 0
  };
}

function createMockReviewQaHandoffReceipt(filters: ProviderWebhookReviewClosureReportFilters): ProviderWebhookReviewQaHandoffReceipt {
  const exportResult = createMockReviewQaHandoffBundleExport(filters);
  const signOff = mockProviderWebhookQaHandoffSignOffs.find((record) =>
    record.bundleDigest === exportResult.bundle.safeDigest && record.exportDigest === exportResult.safeDigest
  );
  const receiptStatus = signOff?.acknowledgementType === "sign_off"
    ? "signed_off"
    : signOff?.acknowledgementType === "acknowledge"
      ? "acknowledged"
      : "not_acknowledged";
  return {
    generatedAt: new Date().toISOString(),
    receiptStatus,
    bundleStatus: exportResult.bundle.manualQaReadiness,
    exportStatus: exportResult.status,
    safeFilename: "provider-webhook-review-qa-handoff-receipt.json",
    safeDigest: signOff ? `sha256:mockqahandoffreceipt-${signOff.id.slice(-6)}` : "sha256:mockqahandoffreceipt",
    bundleDigest: exportResult.bundle.safeDigest,
    exportDigest: exportResult.safeDigest,
    readinessFlags: exportResult.readinessFlags,
    counts: exportResult.counts,
    manualQaChecks: exportResult.manualQaChecks,
    reviewerRole: signOff?.reviewerRole ?? null,
    reviewerLabel: signOff?.reviewerLabel ?? null,
    acknowledgedAt: signOff?.acknowledgedAt ?? null,
    signedAt: signOff?.signedAt ?? null,
    externalCalls: 0
  };
}

function createMockReviewQaHandoffSignOff(
  filters: ProviderWebhookReviewClosureReportFilters,
  payload: ProviderWebhookReviewQaHandoffSignOffRequest
): ProviderWebhookReviewQaHandoffSignOffResponse {
  const receipt = createMockReviewQaHandoffReceipt(filters);
  const nowIso = new Date().toISOString();
  const action = payload.acknowledgementType ?? "sign_off";
  const record = {
    id: `provider-webhook-qa-handoff-signoff-local-${mockProviderWebhookQaHandoffSignOffs.length + 1}`,
    bundleDigest: receipt.bundleDigest,
    exportDigest: receipt.exportDigest,
    acknowledgementType: action,
    reviewerRole: safeMockText(payload.reviewerRole) ?? "reviewer",
    reviewerLabel: safeMockText(payload.reviewerLabel) ?? "operator:local",
    acknowledgedAt: nowIso,
    signedAt: action === "sign_off" ? nowIso : null
  };
  mockProviderWebhookQaHandoffSignOffs.unshift(record);
  const signedReceipt = createMockReviewQaHandoffReceipt(filters);
  return {
    ...signedReceipt,
    signOffStatus: signedReceipt.receiptStatus,
    signOffRecordId: record.id,
    action,
    externalCalls: 0
  };
}

function createMockReviewQaHandoffAcceptanceLock(
  filters: ProviderWebhookReviewClosureReportFilters,
  action: ProviderWebhookReviewQaHandoffAcceptanceLock["lockAction"],
  payload: ProviderWebhookReviewQaHandoffAcceptanceLockRequest = {}
): ProviderWebhookReviewQaHandoffAcceptanceLock {
  const receipt = createMockReviewQaHandoffReceipt(filters);
  let lock = mockProviderWebhookQaHandoffAcceptanceLocks.find((record) =>
    record.bundleDigest === receipt.bundleDigest && record.exportDigest === receipt.exportDigest
  );
  if (action === "locked" && receipt.receiptStatus === "signed_off" && !lock) {
    lock = {
      id: `provider-webhook-qa-handoff-acceptance-lock-local-${mockProviderWebhookQaHandoffAcceptanceLocks.length + 1}`,
      receiptDigest: receipt.safeDigest,
      bundleDigest: receipt.bundleDigest,
      exportDigest: receipt.exportDigest,
      lockedUnmatchedInboundIds: mockProviderWebhookUnmatchedInbound.map((item) => item.id),
      lockReason: safeMockText(payload.lockReason) ?? "QA handoff accepted",
      acceptedByRole: safeMockText(payload.acceptedByRole) ?? receipt.reviewerRole ?? "QA reviewer",
      acceptedByLabel: safeMockText(payload.acceptedByLabel) ?? receipt.reviewerLabel ?? "operator:local",
      lockedAt: new Date().toISOString()
    };
    mockProviderWebhookQaHandoffAcceptanceLocks.unshift(lock);
  }
  const itemIds = lock?.lockedUnmatchedInboundIds ?? mockProviderWebhookUnmatchedInbound.map((item) => item.id);
  const lockAction: ProviderWebhookReviewQaHandoffAcceptanceLock["lockAction"] = lock
    ? action === "locked" ? "locked" : "already_locked"
    : "none";
  const responseBase = {
    generatedAt: new Date().toISOString(),
    lockStatus: lock ? "locked" as const : "unlocked" as const,
    lockRecordId: lock?.id ?? null,
    lockAction,
    safeFilename: "provider-webhook-review-qa-handoff-acceptance-lock.json",
    receiptDigest: lock?.receiptDigest ?? receipt.safeDigest,
    bundleDigest: receipt.bundleDigest,
    exportDigest: receipt.exportDigest,
    appliedFilters: filters,
    lockedUnmatchedInboundIds: itemIds,
    lockedItemCount: itemIds.length,
    lockedOpenItemCount: mockProviderWebhookUnmatchedInbound.filter((item) => itemIds.includes(item.id) && (item.unmatchedStatus === "open" || item.unmatchedStatus === "review-needed")).length,
    lockReason: lock?.lockReason ?? null,
    acceptedByRole: lock?.acceptedByRole ?? null,
    acceptedByLabel: lock?.acceptedByLabel ?? null,
    lockedAt: lock?.lockedAt ?? null,
    receiptStatus: receipt.receiptStatus,
    bundleStatus: receipt.bundleStatus,
    exportStatus: receipt.exportStatus,
    acceptanceChecks: {
      receiptSignedOff: receipt.receiptStatus === "signed_off",
      bundleDigestMatches: true,
      exportDigestMatches: true,
      lockedItemScopePresent: itemIds.length > 0,
      safeDigestPresent: true,
      providerOutboundAbsent: receipt.manualQaChecks.providerOutboundAbsent,
      externalCallsZero: receipt.manualQaChecks.externalCallsZero
    },
    externalCalls: 0 as const
  };
  return {
    ...responseBase,
    safeDigest: lock ? `sha256:mockqahandoffacceptancelock-${lock.id.slice(-6)}` : "sha256:mockqahandoffacceptancelock",
    externalCalls: 0
  };
}

function ensureMockReviewQaHandoffAcceptanceLock(filters: ProviderWebhookReviewClosureReportFilters) {
  const receipt = createMockReviewQaHandoffReceipt(filters);
  if (receipt.receiptStatus !== "signed_off") {
    createMockReviewQaHandoffSignOff(filters, { acknowledgementType: "sign_off", reviewerRole: "QA reviewer", reviewerLabel: "operator:local" });
  }
  return createMockReviewQaHandoffAcceptanceLock(filters, "locked", {
    lockReason: "QA handoff accepted",
    acceptedByRole: "QA lead",
    acceptedByLabel: "operator:local"
  });
}

function createMockReviewQaHandoffLockedArchive(filters: ProviderWebhookReviewClosureReportFilters): ProviderWebhookReviewQaHandoffLockedArchiveStatus {
  const lock = ensureMockReviewQaHandoffAcceptanceLock(filters);
  const receipt = createMockReviewQaHandoffReceipt(filters);
  const exportRecord = mockProviderWebhookQaHandoffLockedArchiveExports.find((record) =>
    record.lockRecordId === lock.lockRecordId && record.acceptanceLockDigest === lock.safeDigest
  );
  const responseBase = {
    generatedAt: new Date().toISOString(),
    lockedArchiveStatus: exportRecord ? "exported" as const : "ready" as const,
    retentionManifestStatus: "ready" as const,
    archiveAcknowledgementStatus: exportRecord ? "exported" as const : "not_exported" as const,
    acceptanceStatus: "locked" as const,
    lockStatus: "locked" as const,
    receiptStatus: receipt.receiptStatus,
    signOffStatus: receipt.receiptStatus,
    bundleStatus: receipt.bundleStatus,
    exportStatus: receipt.exportStatus,
    safeFilename: exportRecord?.safeFilename ?? "provider-webhook-review-qa-handoff-locked-archive.json",
    bundleDigest: receipt.bundleDigest,
    exportDigest: receipt.exportDigest,
    receiptDigest: receipt.safeDigest,
    acceptanceLockDigest: lock.safeDigest,
    lockRecordId: lock.lockRecordId ?? "provider-webhook-qa-handoff-acceptance-lock-local-1",
    readinessFlags: receipt.readinessFlags,
    counts: {
      ...receipt.counts,
      lockedItemCount: lock.lockedItemCount,
      lockedOpenItemCount: lock.lockedOpenItemCount
    },
    manualQaChecks: receipt.manualQaChecks,
    retentionPolicyLabel: "safe-qa-handoff-locked-archive-retain-review-metadata-only",
    archivedAt: lock.lockedAt,
    exportedAt: exportRecord?.exportedAt ?? null,
    externalCalls: 0 as const
  };
  return {
    ...responseBase,
    safeDigest: exportRecord?.safeDigest ?? "sha256:mockqahandofflockedarchive",
    externalCalls: 0
  };
}

function createMockReviewQaHandoffLockedArchiveExport(filters: ProviderWebhookReviewClosureReportFilters): ProviderWebhookReviewQaHandoffLockedArchiveExport {
  const archive = createMockReviewQaHandoffLockedArchive(filters);
  let exportRecord = mockProviderWebhookQaHandoffLockedArchiveExports.find((record) =>
    record.lockRecordId === archive.lockRecordId && record.acceptanceLockDigest === archive.acceptanceLockDigest
  );
  if (!exportRecord) {
    exportRecord = {
      id: `provider-webhook-qa-handoff-locked-archive-export-local-${mockProviderWebhookQaHandoffLockedArchiveExports.length + 1}`,
      lockRecordId: archive.lockRecordId,
      receiptDigest: archive.receiptDigest,
      bundleDigest: archive.bundleDigest,
      exportDigest: archive.exportDigest,
      acceptanceLockDigest: archive.acceptanceLockDigest,
      safeDigest: `sha256:mockqahandofflockedarchiveexport-${mockProviderWebhookQaHandoffLockedArchiveExports.length + 1}`,
      safeFilename: "provider-webhook-review-qa-handoff-locked-archive-export.json",
      exportedAt: new Date().toISOString()
    };
    mockProviderWebhookQaHandoffLockedArchiveExports.unshift(exportRecord);
  }
  const exportedArchive = createMockReviewQaHandoffLockedArchive(filters);
  return {
    ...exportedArchive,
    lockedArchiveStatus: "exported",
    archiveAcknowledgementStatus: "exported",
    safeFilename: exportRecord.safeFilename,
    safeDigest: exportRecord.safeDigest,
    exportedAt: exportRecord.exportedAt,
    exportKind: "qa-handoff-locked-archive",
    format: "json",
    contentType: "application/json",
    externalCalls: 0
  };
}

function createMockReviewQaHandoffRetentionManifest(filters: ProviderWebhookReviewClosureReportFilters): ProviderWebhookReviewQaHandoffRetentionManifest {
  const archive = createMockReviewQaHandoffLockedArchive(filters);
  const responseBase = {
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
    safeFilename: "provider-webhook-review-qa-handoff-locked-archive-retention-manifest.json",
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
    ...responseBase,
    safeDigest: "sha256:mockqahandoffretentionmanifest",
    externalCalls: 0
  };
}

function createMockReviewQaHandoffArchiveIntegrity(filters: ProviderWebhookReviewClosureReportFilters): ProviderWebhookReviewQaHandoffArchiveIntegrity {
  const archive = createMockReviewQaHandoffLockedArchive(filters);
  const manifest = createMockReviewQaHandoffRetentionManifest(filters);
  return {
    generatedAt: new Date().toISOString(),
    integrityStatus: "confirmed",
    retentionAuditStatus: "confirmed",
    lockedArchiveStatus: archive.lockedArchiveStatus,
    retentionManifestStatus: manifest.retentionManifestStatus,
    archiveAcknowledgementStatus: archive.archiveAcknowledgementStatus,
    auditAcknowledgementStatus: "acknowledged",
    acceptanceStatus: "locked",
    lockStatus: "locked",
    receiptStatus: archive.receiptStatus,
    signOffStatus: archive.signOffStatus,
    bundleStatus: archive.bundleStatus,
    exportStatus: archive.exportStatus,
    safeFilename: "provider-webhook-review-qa-handoff-locked-archive-integrity.json",
    safeDigest: "sha256:mockqahandoffarchiveintegrity",
    bundleDigest: archive.bundleDigest,
    exportDigest: archive.exportDigest,
    receiptDigest: archive.receiptDigest,
    acceptanceLockDigest: archive.acceptanceLockDigest,
    lockedArchiveDigest: archive.safeDigest,
    retentionManifestDigest: manifest.safeDigest,
    digestChainStatus: "confirmed",
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
    readinessFlags: archive.readinessFlags,
    counts: {
      ...archive.counts,
      digestChainLinkCount: 6,
      integrityCheckedCount: 1
    },
    manualQaChecks: archive.manualQaChecks,
    archivedAt: archive.archivedAt,
    exportedAt: archive.exportedAt,
    externalCalls: 0
  };
}

function createMockReviewQaHandoffRetentionAudit(filters: ProviderWebhookReviewClosureReportFilters): ProviderWebhookReviewQaHandoffRetentionAudit {
  const archive = createMockReviewQaHandoffLockedArchive(filters);
  const manifest = createMockReviewQaHandoffRetentionManifest(filters);
  return {
    generatedAt: new Date().toISOString(),
    retentionPolicyStatus: "active",
    retentionAuditStatus: "confirmed",
    retentionManifestStatus: manifest.retentionManifestStatus,
    lockedArchiveStatus: archive.lockedArchiveStatus,
    archiveAcknowledgementStatus: archive.archiveAcknowledgementStatus,
    auditAcknowledgementStatus: "acknowledged",
    acceptanceStatus: "locked",
    lockStatus: "locked",
    safePolicyLabel: archive.retentionPolicyLabel,
    safeRetentionWindowLabel: "safe-review-metadata-retained",
    safeFilename: "provider-webhook-review-qa-handoff-retention-audit.json",
    safeDigest: "sha256:mockqahandoffretentionaudit",
    lockedArchiveDigest: archive.safeDigest,
    retentionManifestDigest: manifest.safeDigest,
    digestChainStatus: "confirmed",
    auditChecklistItems: [
      { key: "locked_archive_available", label: "locked archive available", status: "confirmed" },
      { key: "retention_manifest_ready", label: "retention manifest ready", status: "confirmed" },
      { key: "digest_chain_confirmed", label: "digest chain confirmed", status: "confirmed" },
      { key: "provider_outbound_absent", label: "provider outbound absent", status: "confirmed" },
      { key: "external_calls_zero", label: "externalCalls zero", status: "confirmed" }
    ],
    counts: {
      ...archive.counts,
      auditChecklistPassedCount: 5,
      auditChecklistNeedsReviewCount: 0,
      auditChecklistBlockedCount: 0
    },
    archivedAt: archive.archivedAt,
    exportedAt: archive.exportedAt,
    externalCalls: 0
  };
}

function createMockReviewQaHandoffArchiveFinalization(filters: ProviderWebhookReviewClosureReportFilters): ProviderWebhookReviewQaHandoffArchiveFinalization {
  const integrity = createMockReviewQaHandoffArchiveIntegrity(filters);
  const retentionAudit = createMockReviewQaHandoffRetentionAudit(filters);
  return {
    generatedAt: new Date().toISOString(),
    finalizationStatus: "ready",
    retentionSignOffStatus: "not_signed",
    finalizationReceiptStatus: "not_created",
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
    digestChainStatus: "confirmed",
    safeFilename: "provider-webhook-review-qa-handoff-archive-finalization.json",
    safeDigest: "sha256:mockqahandoffarchivefinalization",
    bundleDigest: integrity.bundleDigest,
    exportDigest: integrity.exportDigest,
    receiptDigest: integrity.receiptDigest,
    acceptanceLockDigest: integrity.acceptanceLockDigest,
    lockedArchiveDigest: integrity.lockedArchiveDigest,
    retentionManifestDigest: integrity.retentionManifestDigest,
    integrityDigest: integrity.safeDigest,
    finalizationReceiptDigest: null,
    safeRetentionPolicyLabel: retentionAudit.safePolicyLabel,
    safeReviewerLabel: null,
    safeCheckLabels: [
      "archive integrity confirmed",
      "retention audit confirmed",
      "retention manifest ready",
      "provider outbound absent",
      "externalCalls zero"
    ],
    readinessFlags: integrity.readinessFlags,
    counts: {
      ...integrity.counts,
      digestChainLinkCount: 7,
      finalizationCheckedCount: 1,
      retentionSignOffCount: 0
    },
    manualQaChecks: integrity.manualQaChecks,
    archivedAt: integrity.archivedAt,
    exportedAt: integrity.exportedAt,
    signedAt: null,
    finalizedAt: null,
    externalCalls: 0
  };
}

function createMockReviewQaHandoffArchiveFinalizationSignOff(
  filters: ProviderWebhookReviewClosureReportFilters,
  payload: ProviderWebhookReviewQaHandoffFinalizationSignOffRequest = {}
): ProviderWebhookReviewQaHandoffFinalizationSignOffResponse {
  const finalization = createMockReviewQaHandoffArchiveFinalization(filters);
  const signedAt = new Date().toISOString();
  return {
    ...finalization,
    generatedAt: signedAt,
    finalizationStatus: "finalized",
    retentionSignOffStatus: "signed_off",
    finalizationReceiptStatus: "ready",
    safeFilename: "provider-webhook-review-qa-handoff-archive-finalization-signoff.json",
    safeDigest: "sha256:mockqahandoffarchivefinalizationsignoff",
    finalizationReceiptDigest: "sha256:mockqahandoffarchivefinalizationreceipt",
    safeReviewerLabel: payload.reviewerLabel ?? "mock safe retention reviewer",
    counts: {
      ...finalization.counts,
      retentionSignOffCount: 1
    },
    signedAt,
    finalizedAt: signedAt,
    action: "sign_off",
    signOffRecordId: "provider-webhook-qa-handoff-archive-finalization-signoff-mock",
    externalCalls: 0
  };
}

function createMockReviewQaHandoffArchiveFinalizationReceipt(filters: ProviderWebhookReviewClosureReportFilters): ProviderWebhookReviewQaHandoffFinalizationReceipt {
  return {
    ...createMockReviewQaHandoffArchiveFinalizationSignOff(filters),
    safeFilename: "provider-webhook-review-qa-handoff-archive-finalization-receipt.json",
    safeDigest: "sha256:mockqahandoffarchivefinalizationreceiptread",
    receiptKind: "qa-handoff-locked-archive-finalization-receipt",
    externalCalls: 0
  };
}

function createMockReviewQaHandoffArchiveReleaseEvidence(filters: ProviderWebhookReviewClosureReportFilters): ProviderWebhookReviewQaHandoffReleaseEvidence {
  const { action: _action, ...receipt } = createMockReviewQaHandoffArchiveFinalizationReceipt(filters) as ProviderWebhookReviewQaHandoffFinalizationReceipt & { action?: string };
  void _action;
  const releaseReceipt: ProviderWebhookReviewQaHandoffFinalizationReceipt = {
    ...receipt,
    lockedArchiveStatus: "exported" as const,
    archiveAcknowledgementStatus: "exported" as const,
    exportedAt: receipt.exportedAt ?? new Date().toISOString()
  };
  const retentionAudit = createMockReviewQaHandoffRetentionAudit(filters);
  const prerequisiteChecklist = {
    qaHandoffBundleReady: Boolean(releaseReceipt.bundleDigest),
    qaHandoffExportReady: Boolean(releaseReceipt.exportDigest),
    receiptSignedOff: releaseReceipt.receiptStatus === "signed_off" && releaseReceipt.signOffStatus === "signed_off",
    acceptanceLocked: releaseReceipt.acceptanceStatus === "locked" && releaseReceipt.lockStatus === "locked",
    lockedArchiveReady: releaseReceipt.lockedArchiveStatus === "ready" || releaseReceipt.lockedArchiveStatus === "exported",
    lockedArchiveExported: releaseReceipt.lockedArchiveStatus === "exported" && releaseReceipt.archiveAcknowledgementStatus === "exported",
    retentionManifestReady: releaseReceipt.retentionManifestStatus === "ready",
    archiveIntegrityConfirmed: releaseReceipt.integrityStatus === "confirmed",
    retentionAuditConfirmed: releaseReceipt.retentionAuditStatus === "confirmed" && retentionAudit.retentionAuditStatus === "confirmed",
    finalizationSignedOff: releaseReceipt.finalizationStatus === "finalized" && releaseReceipt.retentionSignOffStatus === "signed_off",
    finalizationReceiptReady: releaseReceipt.finalizationReceiptStatus === "ready" && Boolean(releaseReceipt.finalizationReceiptDigest),
    digestChainConfirmed: releaseReceipt.digestChainStatus === "confirmed" && retentionAudit.digestChainStatus === "confirmed",
    safeFilenamePresent: Boolean(releaseReceipt.safeFilename && retentionAudit.safeFilename),
    safeDigestPresent: Boolean(releaseReceipt.safeDigest && retentionAudit.safeDigest),
    providerOutboundAbsent: releaseReceipt.manualQaChecks.providerOutboundAbsent,
    externalCallsZero: releaseReceipt.externalCalls === 0 && retentionAudit.externalCalls === 0 && releaseReceipt.manualQaChecks.externalCallsZero
  };
  const checklistValues = Object.values(prerequisiteChecklist);
  return {
    ...releaseReceipt,
    evidenceKind: "qa-handoff-locked-archive-release-evidence-pack",
    releaseReadinessStatus: "ready_for_release",
    retentionPolicyStatus: retentionAudit.retentionPolicyStatus,
    safeReleaseLabel: "safe-qa-handoff-release-evidence-pack",
    safeFilename: "provider-webhook-review-qa-handoff-archive-release-evidence-pack.json",
    safeDigest: "sha256:mockqahandoffarchivereleaseevidence",
    retentionAuditDigest: retentionAudit.safeDigest,
    finalizationReceiptDigest: releaseReceipt.finalizationReceiptDigest ?? releaseReceipt.safeDigest,
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
      ...releaseReceipt.counts,
      releaseEvidenceCheckedCount: 1,
      prerequisitePassedCount: checklistValues.filter(Boolean).length,
      prerequisiteTotalCount: checklistValues.length
    },
    externalCalls: 0
  };
}

function createMockReviewQaHandoffArchiveReleaseVerification(filters: ProviderWebhookReviewClosureReportFilters): ProviderWebhookReviewQaHandoffReleaseVerification {
  const releaseEvidence = createMockReviewQaHandoffArchiveReleaseEvidence(filters);
  const digestMatrixRows: ProviderWebhookReviewQaHandoffReleaseVerification["digestMatrixRows"] = [
    createMockReleaseVerificationDigestRow("qa_handoff_bundle", "QA handoff bundle", releaseEvidence.bundleDigest),
    createMockReleaseVerificationDigestRow("qa_handoff_export", "QA handoff export", releaseEvidence.exportDigest),
    createMockReleaseVerificationDigestRow("receipt_sign_off", "receipt/sign-off", releaseEvidence.receiptDigest),
    createMockReleaseVerificationDigestRow("acceptance_lock", "acceptance lock", releaseEvidence.acceptanceLockDigest),
    createMockReleaseVerificationDigestRow("locked_archive_export", "locked archive/export", releaseEvidence.lockedArchiveDigest),
    createMockReleaseVerificationDigestRow("retention_manifest", "retention manifest", releaseEvidence.retentionManifestDigest),
    createMockReleaseVerificationDigestRow("archive_integrity", "archive integrity", releaseEvidence.integrityDigest),
    createMockReleaseVerificationDigestRow("retention_audit", "retention audit", releaseEvidence.retentionAuditDigest),
    createMockReleaseVerificationDigestRow("finalization_receipt", "finalization receipt", releaseEvidence.finalizationReceiptDigest),
    createMockReleaseVerificationDigestRow("release_evidence", "release evidence", releaseEvidence.safeDigest)
  ];
  const verifiedCount = digestMatrixRows.filter((row) => row.verificationStatus === "verified").length;
  return {
    ...releaseEvidence,
    verificationKind: "qa-handoff-locked-archive-release-verification-matrix",
    verificationStatus: "verified",
    safeVerificationLabel: "safe-qa-handoff-release-verification-matrix",
    safeFilename: "provider-webhook-review-qa-handoff-archive-release-verification-matrix.json",
    safeDigest: "sha256:mockqahandoffarchivereleaseverification",
    releaseEvidenceDigest: releaseEvidence.safeDigest,
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
      digestMatrixNeedsReviewCount: digestMatrixRows.filter((row) => row.verificationStatus === "needs_review").length,
      digestMatrixBlockedCount: digestMatrixRows.filter((row) => row.verificationStatus === "blocked").length
    },
    externalCalls: 0
  };
}

function createMockReleaseVerificationDigestRow(
  key: ProviderWebhookReviewQaHandoffReleaseVerification["digestMatrixRows"][number]["key"],
  label: string,
  digest: string
): ProviderWebhookReviewQaHandoffReleaseVerification["digestMatrixRows"][number] {
  return {
    key,
    label,
    safeDigest: digest,
    expectedDigest: digest,
    digestPresent: Boolean(digest),
    digestMatchesExpected: true,
    verificationStatus: "verified"
  };
}

function createMockReviewQaHandoffArchiveReleaseCertification(filters: ProviderWebhookReviewClosureReportFilters): ProviderWebhookReviewQaHandoffReleaseCertification {
  const verification = createMockReviewQaHandoffArchiveReleaseVerification(filters);
  const digestMatrixSummary = {
    totalRows: verification.counts.digestMatrixRowCount,
    verifiedRows: verification.counts.digestMatrixVerifiedCount,
    needsReviewRows: verification.counts.digestMatrixNeedsReviewCount,
    blockedRows: verification.counts.digestMatrixBlockedCount,
    allRowsVerified: verification.digestMatrixRows.every((row) => row.verificationStatus === "verified" && row.digestPresent && row.digestMatchesExpected)
  };
  const certificationChecklist = {
    releaseEvidenceReady: Boolean(verification.releaseEvidenceDigest),
    releaseVerificationPresent: Boolean(verification.safeDigest),
    releaseVerificationVerified: verification.verificationStatus === "verified",
    releaseReadinessReady: verification.releaseReadinessStatus === "ready_for_release",
    digestChainConfirmed: verification.digestChainStatus === "confirmed",
    prerequisitesComplete: Object.values(verification.prerequisiteChecklist).every(Boolean),
    digestMatrixVerified: digestMatrixSummary.allRowsVerified,
    safeFilenamePresent: Boolean(verification.safeFilename),
    safeDigestPresent: Boolean(verification.safeDigest),
    releaseEvidenceDigestPresent: Boolean(verification.releaseEvidenceDigest),
    releaseVerificationDigestPresent: Boolean(verification.safeDigest),
    providerOutboundAbsent: verification.prerequisiteChecklist.providerOutboundAbsent,
    externalCallsZero: verification.externalCalls === 0 && verification.prerequisiteChecklist.externalCallsZero
  };
  const checklistValues = Object.values(certificationChecklist);
  return {
    certificationKind: "qa-handoff-locked-archive-release-certification-receipt",
    certificationStatus: "certified",
    releaseReadinessStatus: "ready_for_release",
    verificationStatus: "verified",
    digestChainStatus: "confirmed",
    safeFilename: "provider-webhook-review-qa-handoff-archive-release-certification-receipt.json",
    safeDigest: "sha256:mockqahandoffarchivereleasecertification",
    releaseEvidenceDigest: verification.releaseEvidenceDigest,
    releaseVerificationDigest: verification.safeDigest,
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
    externalCalls: 0
  };
}

function createMockReviewQaHandoffArchiveReleaseClosureLedger(filters: ProviderWebhookReviewClosureReportFilters): ProviderWebhookReviewQaHandoffReleaseClosureLedger {
  const certification = createMockReviewQaHandoffArchiveReleaseCertification(filters);
  const prerequisiteChecklistComplete = Object.values(certification.prerequisiteChecklist).every(Boolean);
  const certificationChecklistComplete = Object.values(certification.certificationChecklist).every(Boolean);
  const ledgerRows: ProviderWebhookReviewQaHandoffReleaseClosureLedger["ledgerRows"] = [
    createMockReleaseClosureLedgerRow("release_evidence", "Release evidence pack", "verified", certification.releaseEvidenceDigest, certification.counts.releaseEvidenceCheckedCount, Boolean(certification.releaseEvidenceDigest)),
    createMockReleaseClosureLedgerRow("release_verification", "Release verification matrix", "verified", certification.releaseVerificationDigest, certification.counts.releaseVerificationCheckedCount, Boolean(certification.releaseVerificationDigest)),
    createMockReleaseClosureLedgerRow("release_certification", "Release certification receipt", "certified", certification.safeDigest, certification.counts.releaseCertificationCheckedCount, certification.certificationStatus === "certified"),
    createMockReleaseClosureLedgerRow("prerequisite_checklist", "Prerequisite checklist", "complete", certification.safeDigest, certification.counts.prerequisitePassedCount, prerequisiteChecklistComplete),
    createMockReleaseClosureLedgerRow("certification_checklist", "Certification checklist", "closed", certification.safeDigest, certification.counts.certificationChecklistPassedCount, certificationChecklistComplete)
  ];
  const closedRowCount = ledgerRows.filter((row) => row.complete).length;
  return {
    ledgerKind: "qa-handoff-locked-archive-release-closure-ledger",
    ledgerStatus: "certified_release_closed",
    certificationStatus: "certified",
    releaseReadinessStatus: "ready_for_release",
    verificationStatus: "verified",
    digestChainStatus: "confirmed",
    safeFilename: "provider-webhook-review-qa-handoff-archive-release-closure-ledger.json",
    safeDigest: "sha256:mockqahandoffarchivereleaseclosureledger",
    releaseEvidenceDigest: certification.releaseEvidenceDigest,
    releaseVerificationDigest: certification.releaseVerificationDigest,
    releaseCertificationDigest: certification.safeDigest,
    ledgerRows,
    prerequisiteChecklist: certification.prerequisiteChecklist,
    certificationChecklist: certification.certificationChecklist,
    ledgerSummary: {
      ledgerRowCount: ledgerRows.length,
      closedRowCount,
      prerequisiteChecklistComplete,
      certificationChecklistComplete,
      releaseCertificationDigestPresent: Boolean(certification.safeDigest),
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
    externalCalls: 0
  };
}

function createMockReviewQaHandoffArchiveReleaseAttestationAudit(filters: ProviderWebhookReviewClosureReportFilters): ProviderWebhookReviewQaHandoffReleaseAttestationAudit {
  const closureLedger = createMockReviewQaHandoffArchiveReleaseClosureLedger(filters);
  const prerequisiteChecklistComplete = Object.values(closureLedger.prerequisiteChecklist).every(Boolean);
  const certificationChecklistComplete = Object.values(closureLedger.certificationChecklist).every(Boolean);
  const ledgerClosed = closureLedger.ledgerStatus === "certified_release_closed" &&
    closureLedger.ledgerSummary.closedRowCount === closureLedger.ledgerSummary.ledgerRowCount &&
    closureLedger.counts.ledgerNeedsReviewRowCount === 0;
  const attestationRows: ProviderWebhookReviewQaHandoffReleaseAttestationAudit["attestationRows"] = [
    createMockReleaseAttestationAuditRow("closure_ledger", "Closure ledger", "attested", closureLedger.safeDigest, closureLedger.counts.closureLedgerCheckedCount, ledgerClosed),
    createMockReleaseAttestationAuditRow("release_evidence_digest", "Release evidence digest", "verified", closureLedger.releaseEvidenceDigest, closureLedger.counts.releaseEvidenceCheckedCount, Boolean(closureLedger.releaseEvidenceDigest)),
    createMockReleaseAttestationAuditRow("release_verification_digest", "Release verification digest", "verified", closureLedger.releaseVerificationDigest, closureLedger.counts.releaseVerificationCheckedCount, Boolean(closureLedger.releaseVerificationDigest)),
    createMockReleaseAttestationAuditRow("release_certification_digest", "Release certification digest", "verified", closureLedger.releaseCertificationDigest, closureLedger.counts.releaseCertificationCheckedCount, Boolean(closureLedger.releaseCertificationDigest)),
    createMockReleaseAttestationAuditRow("prerequisite_checklist", "Prerequisite checklist", "complete", closureLedger.safeDigest, closureLedger.counts.prerequisitePassedCount, prerequisiteChecklistComplete),
    createMockReleaseAttestationAuditRow("certification_checklist", "Certification checklist", "complete", closureLedger.safeDigest, closureLedger.counts.certificationChecklistPassedCount, certificationChecklistComplete),
    createMockReleaseAttestationAuditRow("external_calls", "External calls", "attested", closureLedger.safeDigest, closureLedger.externalCalls, closureLedger.externalCalls === 0 && closureLedger.ledgerSummary.externalCallsZero)
  ];
  const attestedRowCount = attestationRows.filter((row) => row.complete).length;
  return {
    attestationKind: "qa-handoff-locked-archive-release-attestation-audit",
    attestationStatus: "complete",
    ledgerStatus: "certified_release_closed",
    certificationStatus: "certified",
    releaseReadinessStatus: "ready_for_release",
    verificationStatus: "verified",
    digestChainStatus: "confirmed",
    safeFilename: "provider-webhook-review-qa-handoff-archive-release-attestation-audit.json",
    safeDigest: "sha256:mockqahandoffarchivereleaseattestationaudit",
    releaseEvidenceDigest: closureLedger.releaseEvidenceDigest,
    releaseVerificationDigest: closureLedger.releaseVerificationDigest,
    releaseCertificationDigest: closureLedger.releaseCertificationDigest,
    closureLedgerDigest: closureLedger.safeDigest,
    attestationRows,
    prerequisiteChecklist: closureLedger.prerequisiteChecklist,
    certificationChecklist: closureLedger.certificationChecklist,
    attestationSummary: {
      attestationRowCount: attestationRows.length,
      attestedRowCount,
      ledgerClosed,
      prerequisiteChecklistComplete,
      certificationChecklistComplete,
      closureLedgerDigestPresent: Boolean(closureLedger.safeDigest),
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
    externalCalls: 0
  };
}

function createMockReviewQaHandoffArchiveReleaseAttestationReconciliation(filters: ProviderWebhookReviewClosureReportFilters): ProviderWebhookReviewQaHandoffReleaseAttestationReconciliationRegister {
  const attestationAudit = createMockReviewQaHandoffArchiveReleaseAttestationAudit(filters);
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
    createMockReleaseAttestationReconciliationRow("release_evidence_digest", "Release evidence digest", "verified", attestationAudit.releaseEvidenceDigest, attestationAudit.counts.releaseEvidenceCheckedCount, Boolean(attestationAudit.releaseEvidenceDigest)),
    createMockReleaseAttestationReconciliationRow("release_verification_digest", "Release verification digest", "verified", attestationAudit.releaseVerificationDigest, attestationAudit.counts.releaseVerificationCheckedCount, Boolean(attestationAudit.releaseVerificationDigest)),
    createMockReleaseAttestationReconciliationRow("release_certification_digest", "Release certification digest", "verified", attestationAudit.releaseCertificationDigest, attestationAudit.counts.releaseCertificationCheckedCount, Boolean(attestationAudit.releaseCertificationDigest)),
    createMockReleaseAttestationReconciliationRow("closure_ledger_digest", "Closure ledger digest", "aligned", attestationAudit.closureLedgerDigest, attestationAudit.counts.closureLedgerCheckedCount, closureLedgerClosed),
    createMockReleaseAttestationReconciliationRow("attestation_audit_digest", "Attestation audit digest", "attested", attestationAudit.safeDigest, attestationAudit.counts.attestationAuditCheckedCount, attestationAudit.attestationStatus === "complete"),
    createMockReleaseAttestationReconciliationRow("prerequisite_checklist", "Prerequisite checklist", "complete", attestationAudit.closureLedgerDigest, attestationAudit.counts.prerequisitePassedCount, prerequisiteChecklistComplete),
    createMockReleaseAttestationReconciliationRow("certification_checklist", "Certification checklist", "complete", attestationAudit.closureLedgerDigest, attestationAudit.counts.certificationChecklistPassedCount, certificationChecklistComplete),
    createMockReleaseAttestationReconciliationRow("external_calls", "External calls", "attested", attestationAudit.safeDigest, attestationAudit.externalCalls, attestationAudit.externalCalls === 0 && attestationAudit.attestationSummary.externalCallsZero)
  ];
  const alignedRowCount = reconciliationRows.filter((row) => row.aligned).length;
  return {
    reconciliationKind: "qa-handoff-locked-archive-release-attestation-reconciliation-register",
    reconciliationStatus: "aligned",
    attestationStatus: "complete",
    ledgerStatus: "certified_release_closed",
    certificationStatus: "certified",
    releaseReadinessStatus: "ready_for_release",
    verificationStatus: "verified",
    digestChainStatus: "confirmed",
    safeFilename: "provider-webhook-review-qa-handoff-archive-release-attestation-reconciliation.json",
    safeDigest: "sha256:mockqahandoffarchivereleaseattestationreconciliation",
    releaseEvidenceDigest: attestationAudit.releaseEvidenceDigest,
    verificationDigest: attestationAudit.releaseVerificationDigest,
    certificationDigest: attestationAudit.releaseCertificationDigest,
    closureLedgerDigest: attestationAudit.closureLedgerDigest,
    attestationAuditDigest: attestationAudit.safeDigest,
    reconciliationDigest: "sha256:mockqahandoffarchivereleaseattestationreconciliation",
    reconciliationRows,
    exceptionRows: [],
    inheritedPrerequisiteChecklist: attestationAudit.prerequisiteChecklist,
    inheritedCertificationChecklist: attestationAudit.certificationChecklist,
    reconciliationSummary: {
      reconciliationRowCount: reconciliationRows.length,
      alignedRowCount,
      exceptionRowCount: 0,
      attestationAuditComplete: true,
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
      reconciliationExceptionRowCount: 0
    },
    externalCalls: 0
  };
}

function createMockReleaseAttestationReconciliationRow(
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

function createMockReviewQaHandoffCertifiedReleaseGate(filters: ProviderWebhookReviewClosureReportFilters): ProviderWebhookReviewQaHandoffCertifiedReleaseGate {
  const reconciliation = createMockReviewQaHandoffArchiveReleaseAttestationReconciliation(filters);
  const gateChecklist = {
    prerequisiteChainComplete: true,
    reconciliationComplete: reconciliation.reconciliationStatus === "aligned" && reconciliation.reconciliationRows.every((row) => row.aligned),
    attestationComplete: reconciliation.attestationStatus === "complete",
    closureLedgerClosed: reconciliation.ledgerStatus === "certified_release_closed",
    certificationComplete: reconciliation.certificationStatus === "certified",
    releaseReady: reconciliation.releaseReadinessStatus === "ready_for_release",
    verificationComplete: reconciliation.verificationStatus === "verified",
    digestChainConfirmed: reconciliation.digestChainStatus === "confirmed",
    prerequisiteChecklistComplete: Object.values(reconciliation.inheritedPrerequisiteChecklist).every(Boolean) && reconciliation.reconciliationSummary.prerequisiteChecklistComplete,
    certificationChecklistComplete: Object.values(reconciliation.inheritedCertificationChecklist).every(Boolean) && reconciliation.reconciliationSummary.certificationChecklistComplete,
    noBlockingExceptions: reconciliation.exceptionRows.length === 0,
    externalCallsZero: reconciliation.externalCalls === 0 && reconciliation.reconciliationSummary.externalCallsZero
  };
  const gateChecklistPassedCount = Object.values(gateChecklist).filter(Boolean).length;
  const blockingReasons: ProviderWebhookReviewQaHandoffCertifiedReleaseGate["blockingReasons"] = gateChecklist.noBlockingExceptions ? [] : [{
    code: "reconciliation_exception",
    label: "Attestation reconciliation has blocking exceptions",
    status: "blocking_reason",
    safeDigest: reconciliation.reconciliationDigest
  }];
  const ready = Object.values(gateChecklist).every(Boolean) && blockingReasons.length === 0;
  return {
    gateKind: "qa-handoff-locked-archive-certified-release-gate",
    gateStatus: ready ? "ready" : "blocked",
    goNoGoDecision: ready ? "go" : "no_go",
    releaseReadinessStatus: "ready_for_release",
    reconciliationStatus: reconciliation.reconciliationStatus,
    attestationStatus: "complete",
    ledgerStatus: "certified_release_closed",
    certificationStatus: "certified",
    verificationStatus: "verified",
    digestChainStatus: "confirmed",
    safeFilename: "provider-webhook-review-qa-handoff-certified-release-gate.json",
    safeDigest: "sha256:mockqahandoffcertifiedreleasegate",
    releaseGateDigest: "sha256:mockqahandoffcertifiedreleasegate",
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
      gateChecklistPassedCount,
      gateChecklistTotalCount: Object.keys(gateChecklist).length,
      blockingReasonCount: blockingReasons.length,
      exceptionRowCount: reconciliation.exceptionRows.length
    },
    externalCalls: 0
  };
}

function createMockReviewQaHandoffCertifiedReleaseDecisionReceipt(filters: ProviderWebhookReviewClosureReportFilters): ProviderWebhookReviewQaHandoffCertifiedReleaseDecisionReceipt {
  const releaseGate = createMockReviewQaHandoffCertifiedReleaseGate(filters);
  const gateChecklistComplete = Object.values(releaseGate.gateChecklist).every(Boolean);
  const issued = releaseGate.gateStatus === "ready" &&
    releaseGate.goNoGoDecision === "go" &&
    gateChecklistComplete &&
    releaseGate.blockingReasons.length === 0 &&
    releaseGate.exceptionRows.length === 0 &&
    releaseGate.externalCalls === 0;
  const receiptRows: ProviderWebhookReviewQaHandoffCertifiedReleaseDecisionReceipt["receiptRows"] = [
    mockDecisionReceiptRow("release_gate", "Certified release gate", releaseGate.releaseGateDigest, releaseGate.counts.gateCheckedCount, releaseGate.gateStatus === "ready"),
    mockDecisionReceiptRow("release_decision", "GO release decision", releaseGate.releaseGateDigest, 1, issued, issued ? "issued" : "blocked"),
    mockDecisionReceiptRow("release_readiness", "Release readiness", releaseGate.releaseEvidenceDigest, releaseGate.counts.releaseEvidenceCheckedCount, releaseGate.releaseReadinessStatus === "ready_for_release"),
    mockDecisionReceiptRow("reconciliation", "Attestation reconciliation", releaseGate.reconciliationDigest, releaseGate.counts.reconciliationCheckedCount, ["aligned", "complete"].includes(releaseGate.reconciliationStatus)),
    mockDecisionReceiptRow("attestation", "Attestation audit", releaseGate.attestationAuditDigest, releaseGate.counts.attestationAuditCheckedCount, releaseGate.attestationStatus === "complete"),
    mockDecisionReceiptRow("closure_ledger", "Closure ledger", releaseGate.closureLedgerDigest, releaseGate.counts.closureLedgerCheckedCount, releaseGate.ledgerStatus === "certified_release_closed"),
    mockDecisionReceiptRow("certification", "Release certification", releaseGate.certificationDigest, releaseGate.counts.releaseCertificationCheckedCount, releaseGate.certificationStatus === "certified"),
    mockDecisionReceiptRow("verification", "Release verification", releaseGate.verificationDigest, releaseGate.counts.releaseVerificationCheckedCount, releaseGate.verificationStatus === "verified"),
    mockDecisionReceiptRow("digest_chain", "Digest chain", releaseGate.reconciliationDigest, 1, releaseGate.digestChainStatus === "confirmed"),
    mockDecisionReceiptRow("prerequisite_checklist", "Prerequisite checklist", releaseGate.releaseEvidenceDigest, releaseGate.counts.prerequisiteTotalCount, Object.values(releaseGate.inheritedPrerequisiteChecklist).every(Boolean)),
    mockDecisionReceiptRow("certification_checklist", "Certification checklist", releaseGate.certificationDigest, releaseGate.counts.certificationChecklistTotalCount, Object.values(releaseGate.inheritedCertificationChecklist).every(Boolean)),
    mockDecisionReceiptRow("gate_checklist", "Release gate checklist", releaseGate.releaseGateDigest, releaseGate.counts.gateChecklistTotalCount, gateChecklistComplete),
    mockDecisionReceiptRow("external_calls", "External calls", releaseGate.releaseGateDigest, releaseGate.externalCalls, releaseGate.externalCalls === 0 && releaseGate.gateChecklist.externalCallsZero)
  ];
  const receiptRowCompleteCount = receiptRows.filter((row) => row.complete).length;
  return {
    receiptKind: "qa-handoff-locked-archive-certified-release-decision-receipt",
    receiptStatus: issued ? "issued" : "blocked",
    releaseDecision: issued ? "go" : "no_go",
    gateStatus: releaseGate.gateStatus,
    goNoGoDecision: releaseGate.goNoGoDecision,
    releaseReadinessStatus: releaseGate.releaseReadinessStatus,
    reconciliationStatus: releaseGate.reconciliationStatus,
    attestationStatus: releaseGate.attestationStatus,
    ledgerStatus: releaseGate.ledgerStatus,
    certificationStatus: releaseGate.certificationStatus,
    verificationStatus: releaseGate.verificationStatus,
    digestChainStatus: releaseGate.digestChainStatus,
    safeFilename: "provider-webhook-review-qa-handoff-certified-release-decision-receipt.json",
    safeDigest: "sha256:mockqahandoffcertifiedreleasedecisionreceipt",
    decisionReceiptDigest: "sha256:mockqahandoffcertifiedreleasedecisionreceipt",
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
      completeReceiptRowCount: receiptRowCompleteCount,
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
      receiptRowCompleteCount
    },
    externalCalls: 0
  };
}

function mockDecisionReceiptRow(
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

function createMockReviewQaHandoffCertifiedReleaseHandoffPacket(filters: ProviderWebhookReviewClosureReportFilters): ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket {
  const decisionReceipt = createMockReviewQaHandoffCertifiedReleaseDecisionReceipt(filters);
  const issued = decisionReceipt.receiptStatus === "issued" &&
    decisionReceipt.releaseDecision === "go" &&
    decisionReceipt.gateStatus === "ready" &&
    decisionReceipt.goNoGoDecision === "go" &&
    decisionReceipt.receiptSummary.noBlockingReasons &&
    decisionReceipt.receiptSummary.noExceptionRows &&
    decisionReceipt.externalCalls === 0;
  const handoffRows = mockCertifiedReleaseHandoffRows(decisionReceipt, issued);
  const runbookRows = mockCertifiedReleaseRunbookRows(decisionReceipt, issued);
  const operatorChecklist = mockCertifiedReleaseOperatorChecklist(decisionReceipt);
  const handoffRowCompleteCount = handoffRows.filter((row) => row.complete).length;
  const runbookRowReadyCount = runbookRows.filter((row) => row.runbookStatus === "ready").length;
  const operatorChecklistCompleteCount = operatorChecklist.filter((item) => item.complete).length;
  return {
    packetKind: "qa-handoff-locked-archive-certified-release-handoff-packet",
    packetStatus: issued ? "issued" : "blocked",
    handoffStatus: issued ? "ready" : "blocked",
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
    safeFilename: "provider-webhook-review-qa-handoff-certified-release-handoff-packet.json",
    safeDigest: "sha256:mockqahandoffcertifiedreleasehandoffpacket",
    handoffPacketDigest: "sha256:mockqahandoffcertifiedreleasehandoffpacket",
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
      handoffReady: issued,
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
    externalCalls: 0
  };
}

function mockCertifiedReleaseHandoffRows(
  decisionReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseDecisionReceipt,
  issued: boolean
): ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket["handoffRows"] {
  return [
    mockCertifiedReleaseHandoffRow("decision_receipt", "Certified release decision receipt", decisionReceipt.decisionReceiptDigest, decisionReceipt.counts.decisionReceiptCheckedCount, decisionReceipt.receiptStatus === "issued", decisionReceipt.receiptStatus === "issued" ? "ready" : "blocked"),
    mockCertifiedReleaseHandoffRow("release_gate", "Certified release gate", decisionReceipt.releaseGateDigest, decisionReceipt.counts.gateCheckedCount, decisionReceipt.gateStatus === "ready"),
    mockCertifiedReleaseHandoffRow("release_decision", "GO release decision", decisionReceipt.decisionReceiptDigest, 1, decisionReceipt.releaseDecision === "go" && issued, decisionReceipt.releaseDecision === "go" ? "ready" : "blocked"),
    mockCertifiedReleaseHandoffRow("release_readiness", "Release readiness", decisionReceipt.releaseEvidenceDigest, decisionReceipt.counts.releaseEvidenceCheckedCount, decisionReceipt.releaseReadinessStatus === "ready_for_release"),
    mockCertifiedReleaseHandoffRow("reconciliation", "Attestation reconciliation", decisionReceipt.reconciliationDigest, decisionReceipt.counts.reconciliationCheckedCount, ["aligned", "complete"].includes(decisionReceipt.reconciliationStatus)),
    mockCertifiedReleaseHandoffRow("attestation", "Attestation audit", decisionReceipt.attestationAuditDigest, decisionReceipt.counts.attestationAuditCheckedCount, decisionReceipt.attestationStatus === "complete"),
    mockCertifiedReleaseHandoffRow("closure_ledger", "Closure ledger", decisionReceipt.closureLedgerDigest, decisionReceipt.counts.closureLedgerCheckedCount, decisionReceipt.ledgerStatus === "certified_release_closed"),
    mockCertifiedReleaseHandoffRow("certification", "Release certification", decisionReceipt.certificationDigest, decisionReceipt.counts.releaseCertificationCheckedCount, decisionReceipt.certificationStatus === "certified"),
    mockCertifiedReleaseHandoffRow("verification", "Release verification", decisionReceipt.verificationDigest, decisionReceipt.counts.releaseVerificationCheckedCount, decisionReceipt.verificationStatus === "verified"),
    mockCertifiedReleaseHandoffRow("digest_chain", "Digest chain", decisionReceipt.reconciliationDigest, 1, decisionReceipt.digestChainStatus === "confirmed"),
    mockCertifiedReleaseHandoffRow("prerequisite_checklist", "Prerequisite checklist", decisionReceipt.releaseEvidenceDigest, decisionReceipt.counts.prerequisiteTotalCount, Object.values(decisionReceipt.inheritedPrerequisiteChecklist).every(Boolean)),
    mockCertifiedReleaseHandoffRow("certification_checklist", "Certification checklist", decisionReceipt.certificationDigest, decisionReceipt.counts.certificationChecklistTotalCount, Object.values(decisionReceipt.inheritedCertificationChecklist).every(Boolean)),
    mockCertifiedReleaseHandoffRow("gate_checklist", "Release gate checklist", decisionReceipt.releaseGateDigest, decisionReceipt.counts.gateChecklistTotalCount, decisionReceipt.receiptSummary.gateChecklistComplete),
    mockCertifiedReleaseHandoffRow("blocking_reasons", "Blocking reasons", decisionReceipt.decisionReceiptDigest, decisionReceipt.counts.blockingReasonCount, decisionReceipt.counts.blockingReasonCount === 0, decisionReceipt.counts.blockingReasonCount === 0 ? "confirmed" : "blocked"),
    mockCertifiedReleaseHandoffRow("exceptions", "Exception rows", decisionReceipt.reconciliationDigest, decisionReceipt.counts.exceptionRowCount, decisionReceipt.counts.exceptionRowCount === 0, decisionReceipt.counts.exceptionRowCount === 0 ? "confirmed" : "blocked"),
    mockCertifiedReleaseHandoffRow("external_calls", "External calls", decisionReceipt.decisionReceiptDigest, decisionReceipt.externalCalls, decisionReceipt.externalCalls === 0 && decisionReceipt.receiptSummary.externalCallsZero)
  ];
}

function mockCertifiedReleaseHandoffRow(
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

function mockCertifiedReleaseRunbookRows(
  decisionReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseDecisionReceipt,
  issued: boolean
): ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket["runbookRows"] {
  const status = issued ? "ready" : "blocked";
  return [
    mockCertifiedReleaseRunbookRow("confirm_decision_receipt", "Confirm certified decision receipt", status, decisionReceipt.decisionReceiptDigest, "release owner", issued),
    mockCertifiedReleaseRunbookRow("confirm_release_gate", "Confirm certified release gate", status, decisionReceipt.releaseGateDigest, "release owner", issued),
    mockCertifiedReleaseRunbookRow("confirm_operator_checklist", "Confirm operator checklist", status, decisionReceipt.decisionReceiptDigest, "operator", issued),
    mockCertifiedReleaseRunbookRow("release_handoff", "Proceed with safe release handoff", status, decisionReceipt.decisionReceiptDigest, "release owner", issued),
    mockCertifiedReleaseRunbookRow("monitor_release", "Monitor safe release evidence", status, decisionReceipt.releaseEvidenceDigest, "operator", issued),
    mockCertifiedReleaseRunbookRow("exception_hold", "Hold release on blocking exceptions", decisionReceipt.inheritedBlockingReasons.length === 0 && decisionReceipt.inheritedExceptionRows.length === 0 ? "ready" : "blocked", decisionReceipt.reconciliationDigest, "release owner", decisionReceipt.inheritedBlockingReasons.length === 0 && decisionReceipt.inheritedExceptionRows.length === 0)
  ];
}

function mockCertifiedReleaseRunbookRow(
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

function mockCertifiedReleaseOperatorChecklist(
  decisionReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseDecisionReceipt
): ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket["operatorChecklist"] {
  return [
    mockCertifiedReleaseOperatorChecklistItem("decision_receipt_issued", "Decision receipt issued", decisionReceipt.decisionReceiptDigest, decisionReceipt.receiptStatus === "issued"),
    mockCertifiedReleaseOperatorChecklistItem("release_gate_ready", "Release gate ready", decisionReceipt.releaseGateDigest, decisionReceipt.gateStatus === "ready" && decisionReceipt.goNoGoDecision === "go"),
    mockCertifiedReleaseOperatorChecklistItem("no_blocking_reasons", "No blocking reasons", decisionReceipt.decisionReceiptDigest, decisionReceipt.inheritedBlockingReasons.length === 0),
    mockCertifiedReleaseOperatorChecklistItem("no_exceptions", "No exception rows", decisionReceipt.reconciliationDigest, decisionReceipt.inheritedExceptionRows.length === 0),
    mockCertifiedReleaseOperatorChecklistItem("external_calls_zero", "External calls zero", decisionReceipt.decisionReceiptDigest, decisionReceipt.externalCalls === 0 && decisionReceipt.receiptSummary.externalCallsZero),
    mockCertifiedReleaseOperatorChecklistItem("provider_outbound_absent", "Provider outbound absent", decisionReceipt.decisionReceiptDigest, decisionReceipt.externalCalls === 0),
    mockCertifiedReleaseOperatorChecklistItem("source_material_absent", "Sensitive source material absent", decisionReceipt.decisionReceiptDigest, decisionReceipt.externalCalls === 0)
  ];
}

function mockCertifiedReleaseOperatorChecklistItem(
  key: ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket["operatorChecklist"][number]["key"],
  label: string,
  safeDigest: string,
  complete: boolean
): ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket["operatorChecklist"][number] {
  return {
    key,
    label,
    checklistStatus: complete ? "complete" : "blocked",
    safeDigest,
    complete
  };
}

function createMockReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord(
  filters: ProviderWebhookReviewClosureReportFilters,
  payload: ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRequest | null
): ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord {
  const handoffPacket = createMockReviewQaHandoffCertifiedReleaseHandoffPacket(filters);
  const packetReady = mockCertifiedReleaseHandoffPacketReady(handoffPacket);
  let record = mockProviderWebhookQaHandoffCertifiedReleaseHandoffAcceptanceRecords.find((candidate) =>
    candidate.handoffPacketDigest === handoffPacket.handoffPacketDigest
  ) ?? null;
  if (payload && packetReady) {
    const acknowledgedChecklistKeys = Array.from(new Set(payload.acknowledgedChecklistKeys));
    record = {
      id: record?.id ?? `provider-webhook-qa-handoff-certified-release-handoff-acceptance-local-${mockProviderWebhookQaHandoffCertifiedReleaseHandoffAcceptanceRecords.length + 1}`,
      handoffPacketDigest: handoffPacket.handoffPacketDigest,
      decisionReceiptDigest: handoffPacket.decisionReceiptDigest,
      releaseGateDigest: handoffPacket.releaseGateDigest,
      safeDigest: `sha256:mockqahandoffcertifiedreleasehandoffacceptance-${safeDigest([handoffPacket.handoffPacketDigest, acknowledgedChecklistKeys.join(","), payload.acknowledgedByRole ?? "", payload.acknowledgedByLabel ?? ""].join(":"))}`,
      acknowledgedChecklistKeys,
      acknowledgedByRole: safeMockReason(payload.acknowledgedByRole) ?? "release owner",
      acknowledgedByLabel: safeMockReason(payload.acknowledgedByLabel) ?? "safe release owner",
      acknowledgedAt: new Date().toISOString()
    };
    const existingIndex = mockProviderWebhookQaHandoffCertifiedReleaseHandoffAcceptanceRecords.findIndex((candidate) => candidate.id === record?.id);
    if (existingIndex >= 0) mockProviderWebhookQaHandoffCertifiedReleaseHandoffAcceptanceRecords.splice(existingIndex, 1);
    mockProviderWebhookQaHandoffCertifiedReleaseHandoffAcceptanceRecords.unshift(record);
  }
  return mockCertifiedReleaseHandoffAcceptanceRecordResponse(handoffPacket, record);
}

function mockCertifiedReleaseHandoffPacketReady(
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

function mockCertifiedReleaseHandoffAcceptanceRecordResponse(
  handoffPacket: ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket,
  record: typeof mockProviderWebhookQaHandoffCertifiedReleaseHandoffAcceptanceRecords[number] | null
): ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord {
  const packetReady = mockCertifiedReleaseHandoffPacketReady(handoffPacket);
  const acknowledgedKeys = new Set(record?.acknowledgedChecklistKeys ?? []);
  const acknowledgedChecklist = handoffPacket.operatorChecklist.map((item) =>
    mockCertifiedReleaseHandoffAcknowledgedChecklistItem(item, acknowledgedKeys.has(item.key), packetReady)
  );
  const acknowledgedChecklistCompleteCount = acknowledgedChecklist.filter((item) => item.acknowledged).length;
  const operatorChecklistAcknowledged = packetReady &&
    acknowledgedChecklist.length > 0 &&
    acknowledgedChecklistCompleteCount === acknowledgedChecklist.length;
  const acknowledgementRows = mockCertifiedReleaseHandoffAcknowledgementRows(handoffPacket, record, operatorChecklistAcknowledged, packetReady);
  const acknowledgementRowCompleteCount = acknowledgementRows.filter((row) => row.complete).length;
  const acceptanceStatus = !packetReady
    ? "blocked"
    : operatorChecklistAcknowledged
      ? "acknowledged"
      : record
        ? "incomplete"
        : "not_started";
  const safeDigestValue = record?.safeDigest ?? `sha256:mockqahandoffcertifiedreleasehandoffacceptance-${safeDigest(`${handoffPacket.handoffPacketDigest}:${acceptanceStatus}`)}`;
  return {
    acceptanceKind: "qa-handoff-locked-archive-certified-release-handoff-acceptance-record",
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
    safeFilename: "provider-webhook-review-qa-handoff-certified-release-handoff-acceptance-record.json",
    safeDigest: safeDigestValue,
    acceptanceRecordDigest: safeDigestValue,
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
    externalCalls: 0
  };
}

function mockCertifiedReleaseHandoffAcknowledgedChecklistItem(
  item: ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket["operatorChecklist"][number],
  acknowledgedByRecord: boolean,
  packetReady: boolean
): ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord["acknowledgedChecklist"][number] {
  const acknowledged = packetReady && item.complete && acknowledgedByRecord;
  return {
    key: item.key,
    label: item.label,
    acknowledgementStatus: acknowledged ? "acknowledged" : packetReady ? "pending" : "blocked",
    safeDigest: item.safeDigest,
    acknowledged
  };
}

function mockCertifiedReleaseHandoffAcknowledgementRows(
  handoffPacket: ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket,
  record: typeof mockProviderWebhookQaHandoffCertifiedReleaseHandoffAcceptanceRecords[number] | null,
  operatorChecklistAcknowledged: boolean,
  packetReady: boolean
): ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord["acknowledgementRows"] {
  const sourceMaterialClear = handoffPacket.operatorChecklist.some((item) => item.key === "source_material_absent" && item.complete);
  return [
    mockCertifiedReleaseHandoffAcknowledgementRow("handoff_packet", "Handoff packet", handoffPacket.handoffPacketDigest, handoffPacket.counts.handoffPacketCheckedCount, packetReady, packetReady),
    mockCertifiedReleaseHandoffAcknowledgementRow("operator_checklist", "Operator checklist", handoffPacket.handoffPacketDigest, handoffPacket.counts.operatorChecklistItemCount, operatorChecklistAcknowledged, packetReady),
    mockCertifiedReleaseHandoffAcknowledgementRow("release_owner", "Release owner acknowledgement", handoffPacket.handoffPacketDigest, record ? 1 : 0, Boolean(record?.acknowledgedByRole && record?.acknowledgedByLabel), packetReady),
    mockCertifiedReleaseHandoffAcknowledgementRow("external_calls", "External calls", handoffPacket.handoffPacketDigest, handoffPacket.externalCalls, handoffPacket.externalCalls === 0, packetReady),
    mockCertifiedReleaseHandoffAcknowledgementRow("safe_source_material", "Sensitive source material", handoffPacket.handoffPacketDigest, 1, sourceMaterialClear, packetReady),
    mockCertifiedReleaseHandoffAcknowledgementRow("blocking_reasons", "Blocking reasons", handoffPacket.handoffPacketDigest, handoffPacket.counts.blockingReasonCount, handoffPacket.counts.blockingReasonCount === 0, packetReady),
    mockCertifiedReleaseHandoffAcknowledgementRow("exceptions", "Exception rows", handoffPacket.reconciliationDigest, handoffPacket.counts.exceptionRowCount, handoffPacket.counts.exceptionRowCount === 0, packetReady)
  ];
}

function mockCertifiedReleaseHandoffAcknowledgementRow(
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
    acknowledgementStatus: complete ? "acknowledged" : packetReady ? "pending" : "blocked",
    safeDigest,
    checkedCount,
    complete
  };
}

function createMockReviewQaHandoffCertifiedReleaseNoopExecutionDryRun(
  filters: ProviderWebhookReviewClosureReportFilters,
  payload: ProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunRequest | null
): ProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun {
  const acceptanceRecord = createMockReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord(filters, null);
  const acceptanceReady = mockCertifiedReleaseNoopExecutionReady(acceptanceRecord);
  let record = mockProviderWebhookQaHandoffCertifiedReleaseNoopExecutionDryRuns.find((candidate) =>
    candidate.acceptanceRecordDigest === acceptanceRecord.acceptanceRecordDigest
  ) ?? null;
  if (payload && acceptanceReady && payload.checklistAcknowledged) {
    record = {
      id: record?.id ?? `provider-webhook-qa-handoff-certified-release-noop-execution-dryrun-local-${mockProviderWebhookQaHandoffCertifiedReleaseNoopExecutionDryRuns.length + 1}`,
      acceptanceRecordDigest: acceptanceRecord.acceptanceRecordDigest,
      handoffPacketDigest: acceptanceRecord.handoffPacketDigest,
      decisionReceiptDigest: acceptanceRecord.decisionReceiptDigest,
      releaseGateDigest: acceptanceRecord.releaseGateDigest,
      safeDigest: `sha256:mockqahandoffcertifiedreleasenoopdryrun-${safeDigest([acceptanceRecord.acceptanceRecordDigest, payload.requestedBy ?? "", payload.dryRunReason ?? "", payload.executionMode].join(":"))}`,
      requestedBy: safeMockReason(payload.requestedBy) ?? "safe release owner",
      checklistAcknowledged: payload.checklistAcknowledged,
      operatorNote: safeMockReason(payload.operatorNote) ?? null,
      dryRunReason: safeMockReason(payload.dryRunReason) ?? "safe no-op execution readiness rehearsal",
      executedAt: new Date().toISOString()
    };
    const existingIndex = mockProviderWebhookQaHandoffCertifiedReleaseNoopExecutionDryRuns.findIndex((candidate) => candidate.id === record?.id);
    if (existingIndex >= 0) mockProviderWebhookQaHandoffCertifiedReleaseNoopExecutionDryRuns.splice(existingIndex, 1);
    mockProviderWebhookQaHandoffCertifiedReleaseNoopExecutionDryRuns.unshift(record);
  }
  return mockCertifiedReleaseNoopExecutionDryRunResponse(acceptanceRecord, record);
}

function mockCertifiedReleaseNoopExecutionReady(
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

function mockCertifiedReleaseNoopExecutionDryRunResponse(
  acceptanceRecord: ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord,
  record: typeof mockProviderWebhookQaHandoffCertifiedReleaseNoopExecutionDryRuns[number] | null
): ProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun {
  const acceptanceReady = mockCertifiedReleaseNoopExecutionReady(acceptanceRecord);
  const dryRunStatus = !acceptanceReady
    ? acceptanceRecord.acceptanceStatus === "blocked" || acceptanceRecord.releaseDecision !== "go"
      ? "blocked"
      : "incomplete"
    : record?.checklistAcknowledged
      ? "passed"
      : "not_started";
  const effectiveReleaseDecision = acceptanceReady ? "go" : "no_go";
  const safeDigestValue = record?.safeDigest ?? `sha256:mockqahandoffcertifiedreleasenoopdryrun-${safeDigest(`${acceptanceRecord.acceptanceRecordDigest}:${dryRunStatus}`)}`;
  const executionChecklist = mockCertifiedReleaseNoopExecutionChecklist(acceptanceRecord, acceptanceReady, Boolean(record?.checklistAcknowledged));
  const dryRunRows = mockCertifiedReleaseNoopExecutionDryRunRows(acceptanceRecord, acceptanceReady);
  const executionPlanRows = mockCertifiedReleaseNoopExecutionPlanRows(acceptanceRecord, acceptanceReady);
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
    safeFilename: "provider-webhook-review-qa-handoff-certified-release-noop-execution-dryrun.json",
    safeDigest: safeDigestValue,
    noopExecutionDryRunDigest: safeDigestValue,
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
      executionChecklistCompleteCount: executionChecklist.filter((item) => item.complete).length,
      dryRunRowCount: dryRunRows.length,
      dryRunRowPassedCount: dryRunRows.filter((row) => row.complete).length,
      executionPlanRowCount: executionPlanRows.length,
      executionPlanReadyCount: executionPlanRows.filter((row) => row.complete).length
    },
    externalCalls: 0
  };
}

function mockCertifiedReleaseNoopExecutionChecklist(
  acceptanceRecord: ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord,
  acceptanceReady: boolean,
  checklistAcknowledged: boolean
): ProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun["executionChecklist"] {
  return [
    mockCertifiedReleaseNoopExecutionChecklistItem("acceptance_record_acknowledged", "Acceptance record acknowledged", acceptanceRecord.acceptanceRecordDigest, acceptanceRecord.acceptanceStatus === "acknowledged", acceptanceReady),
    mockCertifiedReleaseNoopExecutionChecklistItem("handoff_ready", "Handoff ready", acceptanceRecord.handoffPacketDigest, acceptanceRecord.handoffStatus === "ready", acceptanceReady),
    mockCertifiedReleaseNoopExecutionChecklistItem("release_decision_go", "Release decision go", acceptanceRecord.decisionReceiptDigest, acceptanceRecord.releaseDecision === "go", acceptanceReady),
    mockCertifiedReleaseNoopExecutionChecklistItem("execution_mode_no_op", "Execution mode no-op", acceptanceRecord.acceptanceRecordDigest, true, acceptanceReady),
    mockCertifiedReleaseNoopExecutionChecklistItem("external_calls_zero", "External calls zero", acceptanceRecord.acceptanceRecordDigest, acceptanceRecord.externalCalls === 0, acceptanceReady),
    mockCertifiedReleaseNoopExecutionChecklistItem("provider_outbound_absent", "Provider outbound absent", acceptanceRecord.acceptanceRecordDigest, acceptanceRecord.externalCalls === 0, acceptanceReady),
    mockCertifiedReleaseNoopExecutionChecklistItem("notification_send_absent", "External notification sending absent", acceptanceRecord.acceptanceRecordDigest, acceptanceRecord.externalCalls === 0, acceptanceReady),
    mockCertifiedReleaseNoopExecutionChecklistItem("source_material_absent", "Sensitive source material absent", acceptanceRecord.acceptanceRecordDigest, acceptanceRecord.externalCalls === 0 && (acceptanceReady || checklistAcknowledged), acceptanceReady)
  ];
}

function mockCertifiedReleaseNoopExecutionChecklistItem(
  key: ProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun["executionChecklist"][number]["key"],
  label: string,
  safeDigest: string,
  complete: boolean,
  acceptanceReady: boolean
): ProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun["executionChecklist"][number] {
  return {
    key,
    label,
    checklistStatus: complete ? "complete" : acceptanceReady ? "pending" : "blocked",
    safeDigest,
    complete
  };
}

function mockCertifiedReleaseNoopExecutionDryRunRows(
  acceptanceRecord: ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord,
  acceptanceReady: boolean
): ProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun["dryRunRows"] {
  return [
    mockCertifiedReleaseNoopExecutionDryRunRow("acceptance_record", "Acceptance record", acceptanceRecord.acceptanceRecordDigest, 1, acceptanceRecord.acceptanceStatus === "acknowledged", acceptanceReady),
    mockCertifiedReleaseNoopExecutionDryRunRow("handoff_packet", "Handoff packet", acceptanceRecord.handoffPacketDigest, acceptanceRecord.counts.handoffPacketCheckedCount, acceptanceRecord.handoffStatus === "ready", acceptanceReady),
    mockCertifiedReleaseNoopExecutionDryRunRow("decision_receipt", "Decision receipt", acceptanceRecord.decisionReceiptDigest, acceptanceRecord.counts.decisionReceiptCheckedCount, acceptanceRecord.releaseDecision === "go", acceptanceReady),
    mockCertifiedReleaseNoopExecutionDryRunRow("release_gate", "Release gate", acceptanceRecord.releaseGateDigest, acceptanceRecord.counts.gateCheckedCount, acceptanceRecord.gateStatus === "ready" && acceptanceRecord.goNoGoDecision === "go", acceptanceReady),
    mockCertifiedReleaseNoopExecutionDryRunRow("reconciliation", "Attestation reconciliation", acceptanceRecord.reconciliationDigest, acceptanceRecord.counts.reconciliationCheckedCount, ["complete", "aligned"].includes(acceptanceRecord.reconciliationStatus), acceptanceReady),
    mockCertifiedReleaseNoopExecutionDryRunRow("attestation_audit", "Attestation audit", acceptanceRecord.attestationAuditDigest, acceptanceRecord.counts.attestationAuditCheckedCount, acceptanceRecord.attestationStatus === "complete", acceptanceReady),
    mockCertifiedReleaseNoopExecutionDryRunRow("closure_ledger", "Closure ledger", acceptanceRecord.closureLedgerDigest, acceptanceRecord.counts.closureLedgerCheckedCount, acceptanceRecord.ledgerStatus === "certified_release_closed", acceptanceReady),
    mockCertifiedReleaseNoopExecutionDryRunRow("certification", "Release certification", acceptanceRecord.certificationDigest, acceptanceRecord.counts.releaseCertificationCheckedCount, acceptanceRecord.certificationStatus === "certified", acceptanceReady),
    mockCertifiedReleaseNoopExecutionDryRunRow("verification", "Release verification", acceptanceRecord.verificationDigest, acceptanceRecord.counts.releaseVerificationCheckedCount, acceptanceRecord.verificationStatus === "verified", acceptanceReady),
    mockCertifiedReleaseNoopExecutionDryRunRow("release_evidence", "Release evidence", acceptanceRecord.releaseEvidenceDigest, acceptanceRecord.counts.releaseEvidenceCheckedCount, acceptanceRecord.releaseReadinessStatus === "ready_for_release", acceptanceReady),
    mockCertifiedReleaseNoopExecutionDryRunRow("execution_mode", "Execution mode no-op", acceptanceRecord.acceptanceRecordDigest, 1, true, acceptanceReady),
    mockCertifiedReleaseNoopExecutionDryRunRow("external_calls", "External calls", acceptanceRecord.acceptanceRecordDigest, acceptanceRecord.externalCalls, acceptanceRecord.externalCalls === 0, acceptanceReady)
  ];
}

function mockCertifiedReleaseNoopExecutionDryRunRow(
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
    dryRunRowStatus: complete ? "passed" : acceptanceReady ? "pending" : "blocked",
    safeDigest,
    checkedCount,
    complete
  };
}

function mockCertifiedReleaseNoopExecutionPlanRows(
  acceptanceRecord: ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord,
  acceptanceReady: boolean
): ProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun["executionPlanRows"] {
  return [
    mockCertifiedReleaseNoopExecutionPlanRow("plan_scope", "Certified release readiness check", acceptanceRecord.acceptanceRecordDigest, 1, acceptanceReady ? "ready" : "blocked", acceptanceReady),
    mockCertifiedReleaseNoopExecutionPlanRow("release_execution", "Release execution", acceptanceRecord.acceptanceRecordDigest, 0, "no_op", acceptanceReady),
    mockCertifiedReleaseNoopExecutionPlanRow("provider_outbound", "Provider outbound", acceptanceRecord.acceptanceRecordDigest, 0, "no_op", acceptanceReady),
    mockCertifiedReleaseNoopExecutionPlanRow("external_notifications", "External notifications", acceptanceRecord.acceptanceRecordDigest, 0, "no_op", acceptanceReady),
    mockCertifiedReleaseNoopExecutionPlanRow("automation_calls", "Automation calls", acceptanceRecord.acceptanceRecordDigest, 0, "no_op", acceptanceReady),
    mockCertifiedReleaseNoopExecutionPlanRow("state_mutation", "Release state mutation", acceptanceRecord.acceptanceRecordDigest, 0, "no_op", acceptanceReady),
    mockCertifiedReleaseNoopExecutionPlanRow("readback", "Safe readback", acceptanceRecord.acceptanceRecordDigest, 1, acceptanceReady ? "ready" : "blocked", acceptanceReady)
  ];
}

function mockCertifiedReleaseNoopExecutionPlanRow(
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

function createMockReviewQaHandoffCertifiedReleaseDryRunResultLedger(
  filters: ProviderWebhookReviewClosureReportFilters
): ProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedger {
  const dryRun = createMockReviewQaHandoffCertifiedReleaseNoopExecutionDryRun(filters, null);
  const ledgerReady = mockCertifiedReleaseDryRunResultLedgerReady(dryRun);
  const ledgerStatus = mockCertifiedReleaseDryRunResultLedgerStatus(dryRun, ledgerReady);
  const releaseDecision = ledgerReady ? "go" : "no_go";
  const safeDigestValue = `sha256:mockqahandoffcertifiedreleasedryrunresultledger-${safeDigest(`${dryRun.noopExecutionDryRunDigest}:${ledgerStatus}:${dryRun.dryRunStatus}`)}`;
  const resultLedgerRows = mockCertifiedReleaseDryRunResultLedgerRows(dryRun, ledgerReady, ledgerStatus);
  const finalReadinessRows = mockCertifiedReleaseDryRunFinalReadinessRows(dryRun, ledgerReady, ledgerStatus);
  return {
    ledgerKind: "qa-handoff-locked-archive-certified-release-dryrun-result-ledger",
    ledgerStatus,
    dryRunStatus: dryRun.dryRunStatus,
    executionMode: dryRun.executionMode,
    acceptanceStatus: dryRun.acceptanceStatus,
    handoffStatus: dryRun.handoffStatus,
    releaseDecision,
    packetStatus: dryRun.packetStatus,
    receiptStatus: dryRun.receiptStatus,
    gateStatus: dryRun.gateStatus,
    goNoGoDecision: ledgerReady ? "go" : "no_go",
    releaseReadinessStatus: dryRun.releaseReadinessStatus,
    reconciliationStatus: dryRun.reconciliationStatus,
    attestationStatus: dryRun.attestationStatus,
    ledgerStatusFromClosure: dryRun.ledgerStatus,
    certificationStatus: dryRun.certificationStatus,
    verificationStatus: dryRun.verificationStatus,
    digestChainStatus: dryRun.digestChainStatus,
    safeFilename: "provider-webhook-review-qa-handoff-certified-release-dryrun-result-ledger.json",
    safeDigest: safeDigestValue,
    dryRunResultLedgerDigest: safeDigestValue,
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
      releaseDecision
    },
    inheritedNoopDryRunSummary: {
      dryRunStatus: dryRun.dryRunStatus,
      executionMode: dryRun.executionMode,
      acceptanceStatus: dryRun.acceptanceStatus,
      handoffStatus: dryRun.handoffStatus,
      releaseDecision,
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
    externalCalls: 0
  };
}

function mockCertifiedReleaseDryRunResultLedgerReady(
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

function mockCertifiedReleaseDryRunResultLedgerStatus(
  dryRun: ProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun,
  ledgerReady: boolean
): ProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedger["ledgerStatus"] {
  if (ledgerReady) return "recorded";
  if (dryRun.dryRunStatus === "not_started") return "pending";
  if (dryRun.dryRunStatus === "blocked" || dryRun.releaseDecision !== "go" || dryRun.goNoGoDecision !== "go") return "blocked";
  return "incomplete";
}

function mockCertifiedReleaseDryRunResultLedgerRows(
  dryRun: ProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun,
  ledgerReady: boolean,
  ledgerStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedger["ledgerStatus"]
): ProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedger["resultLedgerRows"] {
  return [
    mockCertifiedReleaseDryRunResultLedgerRow("noop_execution_dryrun", "No-op execution dry-run", dryRun.noopExecutionDryRunDigest, dryRun.counts.noopExecutionDryRunCheckedCount, dryRun.dryRunStatus === "passed" && dryRun.executionMode === "no_op", ledgerReady, ledgerStatus),
    mockCertifiedReleaseDryRunResultLedgerRow("acceptance_record", "Acceptance record", dryRun.acceptanceRecordDigest, 1, dryRun.acceptanceStatus === "acknowledged", ledgerReady, ledgerStatus),
    mockCertifiedReleaseDryRunResultLedgerRow("handoff_packet", "Handoff packet", dryRun.handoffPacketDigest, dryRun.counts.handoffPacketCheckedCount, dryRun.handoffStatus === "ready" && dryRun.packetStatus === "issued", ledgerReady, ledgerStatus),
    mockCertifiedReleaseDryRunResultLedgerRow("decision_receipt", "Decision receipt", dryRun.decisionReceiptDigest, dryRun.counts.decisionReceiptCheckedCount, dryRun.receiptStatus === "issued" && dryRun.releaseDecision === "go", ledgerReady, ledgerStatus),
    mockCertifiedReleaseDryRunResultLedgerRow("release_gate", "Release gate", dryRun.releaseGateDigest, dryRun.counts.gateCheckedCount, dryRun.gateStatus === "ready" && dryRun.goNoGoDecision === "go", ledgerReady, ledgerStatus),
    mockCertifiedReleaseDryRunResultLedgerRow("reconciliation", "Attestation reconciliation", dryRun.reconciliationDigest, dryRun.counts.reconciliationCheckedCount, ["complete", "aligned"].includes(dryRun.reconciliationStatus), ledgerReady, ledgerStatus),
    mockCertifiedReleaseDryRunResultLedgerRow("attestation_audit", "Attestation audit", dryRun.attestationAuditDigest, dryRun.counts.attestationAuditCheckedCount, dryRun.attestationStatus === "complete", ledgerReady, ledgerStatus),
    mockCertifiedReleaseDryRunResultLedgerRow("closure_ledger", "Closure ledger", dryRun.closureLedgerDigest, dryRun.counts.closureLedgerCheckedCount, dryRun.ledgerStatus === "certified_release_closed", ledgerReady, ledgerStatus),
    mockCertifiedReleaseDryRunResultLedgerRow("certification", "Release certification", dryRun.certificationDigest, dryRun.counts.releaseCertificationCheckedCount, dryRun.certificationStatus === "certified", ledgerReady, ledgerStatus),
    mockCertifiedReleaseDryRunResultLedgerRow("verification", "Release verification", dryRun.verificationDigest, dryRun.counts.releaseVerificationCheckedCount, dryRun.verificationStatus === "verified", ledgerReady, ledgerStatus),
    mockCertifiedReleaseDryRunResultLedgerRow("release_evidence", "Release evidence", dryRun.releaseEvidenceDigest, dryRun.counts.releaseEvidenceCheckedCount, dryRun.releaseReadinessStatus === "ready_for_release", ledgerReady, ledgerStatus),
    mockCertifiedReleaseDryRunResultLedgerRow("external_calls", "External calls", dryRun.acceptanceRecordDigest, dryRun.externalCalls, dryRun.externalCalls === 0, ledgerReady, ledgerStatus)
  ];
}

function mockCertifiedReleaseDryRunResultLedgerRow(
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
    rowStatus: complete && ledgerReady ? "recorded" : ledgerStatus,
    safeDigest,
    checkedCount,
    complete: complete && ledgerReady
  };
}

function mockCertifiedReleaseDryRunFinalReadinessRows(
  dryRun: ProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun,
  ledgerReady: boolean,
  ledgerStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedger["ledgerStatus"]
): ProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedger["finalReadinessRows"] {
  return [
    mockCertifiedReleaseDryRunFinalReadinessRow("dryrun_passed", "Dry-run passed", dryRun.noopExecutionDryRunDigest, 1, dryRun.dryRunStatus === "passed", ledgerReady, ledgerStatus),
    mockCertifiedReleaseDryRunFinalReadinessRow("execution_mode_no_op", "Execution mode no-op", dryRun.noopExecutionDryRunDigest, 1, dryRun.executionMode === "no_op", ledgerReady, ledgerStatus),
    mockCertifiedReleaseDryRunFinalReadinessRow("acceptance_acknowledged", "Acceptance acknowledged", dryRun.acceptanceRecordDigest, 1, dryRun.acceptanceStatus === "acknowledged", ledgerReady, ledgerStatus),
    mockCertifiedReleaseDryRunFinalReadinessRow("handoff_ready", "Handoff ready", dryRun.handoffPacketDigest, 1, dryRun.handoffStatus === "ready", ledgerReady, ledgerStatus),
    mockCertifiedReleaseDryRunFinalReadinessRow("release_decision_go", "Release decision go", dryRun.decisionReceiptDigest, 1, dryRun.releaseDecision === "go", ledgerReady, ledgerStatus),
    mockCertifiedReleaseDryRunFinalReadinessRow("gate_ready", "Release gate ready", dryRun.releaseGateDigest, 1, dryRun.gateStatus === "ready" && dryRun.goNoGoDecision === "go", ledgerReady, ledgerStatus),
    mockCertifiedReleaseDryRunFinalReadinessRow("safe_digests", "Safe digests", dryRun.safeDigest, 13, mockCertifiedReleaseDryRunDigestLinksSafe(dryRun), ledgerReady, ledgerStatus),
    mockCertifiedReleaseDryRunFinalReadinessRow("no_state_mutation", "No result ledger state mutation", dryRun.noopExecutionDryRunDigest, 0, true, ledgerReady, ledgerStatus),
    mockCertifiedReleaseDryRunFinalReadinessRow("external_calls_zero", "External calls zero", dryRun.noopExecutionDryRunDigest, dryRun.externalCalls, dryRun.externalCalls === 0, ledgerReady, ledgerStatus)
  ];
}

function mockCertifiedReleaseDryRunFinalReadinessRow(
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
    readinessStatus: complete && ledgerReady ? "ready" : ledgerStatus === "pending" ? "pending" : ledgerStatus === "blocked" ? "blocked" : "incomplete",
    safeDigest,
    checkedCount,
    complete: complete && ledgerReady
  };
}

function mockCertifiedReleaseDryRunDigestLinksSafe(
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

function createMockReviewQaHandoffCertifiedReleaseFinalReadinessCertificate(
  filters: ProviderWebhookReviewClosureReportFilters
): ProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificate {
  const resultLedger = createMockReviewQaHandoffCertifiedReleaseDryRunResultLedger(filters);
  const certificateReady = mockCertifiedReleaseFinalReadinessCertificateReady(resultLedger);
  const certificateStatus = mockCertifiedReleaseFinalReadinessCertificateStatus(resultLedger, certificateReady);
  const finalReadinessStatus = mockCertifiedReleaseFinalReadinessStatus(resultLedger, certificateReady);
  const releaseDecision = certificateReady ? "go" : "no_go";
  const safeDigestValue = `sha256:mockqahandoffcertifiedreleasefinalreadinesscertificate-${safeDigest(`${resultLedger.dryRunResultLedgerDigest}:${certificateStatus}:${finalReadinessStatus}`)}`;
  const certificateRows = mockCertifiedReleaseFinalReadinessCertificateRows(resultLedger, certificateReady, certificateStatus, finalReadinessStatus, safeDigestValue);
  return {
    certificateKind: "qa-handoff-locked-archive-certified-release-final-readiness-certificate",
    certificateStatus,
    finalReadinessStatus,
    ledgerStatus: resultLedger.ledgerStatus,
    dryRunStatus: resultLedger.dryRunStatus,
    executionMode: resultLedger.executionMode,
    acceptanceStatus: resultLedger.acceptanceStatus,
    handoffStatus: resultLedger.handoffStatus,
    releaseDecision,
    packetStatus: resultLedger.packetStatus,
    receiptStatus: resultLedger.receiptStatus,
    gateStatus: resultLedger.gateStatus,
    goNoGoDecision: certificateReady ? "go" : "no_go",
    releaseReadinessStatus: resultLedger.releaseReadinessStatus,
    reconciliationStatus: resultLedger.reconciliationStatus,
    attestationStatus: resultLedger.attestationStatus,
    ledgerStatusFromClosure: resultLedger.ledgerStatusFromClosure,
    certificationStatus: resultLedger.certificationStatus,
    verificationStatus: resultLedger.verificationStatus,
    digestChainStatus: resultLedger.digestChainStatus,
    safeFilename: "provider-webhook-review-qa-handoff-certified-release-final-readiness-certificate.json",
    safeDigest: safeDigestValue,
    finalReadinessCertificateDigest: safeDigestValue,
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
      releaseDecision
    },
    inheritedNoopDryRunSummary: {
      ...resultLedger.inheritedNoopDryRunSummary,
      releaseDecision
    },
    inheritedResultLedgerSummary: {
      ledgerStatus: resultLedger.ledgerStatus,
      dryRunStatus: resultLedger.dryRunStatus,
      executionMode: resultLedger.executionMode,
      acceptanceStatus: resultLedger.acceptanceStatus,
      handoffStatus: resultLedger.handoffStatus,
      releaseDecision,
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
    externalCalls: 0
  };
}

function mockCertifiedReleaseFinalReadinessCertificateReady(
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
    resultLedger.resultLedgerRows.every((row) => row.complete && row.rowStatus === "recorded") &&
    resultLedger.finalReadinessRows.every((row) => row.complete && row.readinessStatus === "ready") &&
    resultLedger.externalCalls === 0;
}

function mockCertifiedReleaseFinalReadinessCertificateStatus(
  resultLedger: ProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedger,
  certificateReady: boolean
): ProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificate["certificateStatus"] {
  if (certificateReady) return "issued";
  if (resultLedger.ledgerStatus === "pending") return "pending";
  if (resultLedger.ledgerStatus === "blocked" || resultLedger.releaseDecision !== "go" || resultLedger.goNoGoDecision !== "go") return "blocked";
  return "incomplete";
}

function mockCertifiedReleaseFinalReadinessStatus(
  resultLedger: ProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedger,
  certificateReady: boolean
): ProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificate["finalReadinessStatus"] {
  if (certificateReady) return "ready";
  if (resultLedger.ledgerStatus === "pending" || resultLedger.ledgerStatus === "incomplete") return "incomplete";
  return "not_ready";
}

function mockCertifiedReleaseFinalReadinessCertificateRows(
  resultLedger: ProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedger,
  certificateReady: boolean,
  certificateStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificate["certificateStatus"],
  finalReadinessStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificate["finalReadinessStatus"],
  finalReadinessCertificateDigest: string
): ProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificate["certificateRows"] {
  return [
    mockCertifiedReleaseFinalReadinessCertificateRow("dryrun_result_ledger", "Dry-run result ledger recorded", resultLedger.dryRunResultLedgerDigest, resultLedger.counts.dryRunResultLedgerCheckedCount, resultLedger.ledgerStatus === "recorded", certificateReady, certificateStatus, finalReadinessStatus),
    mockCertifiedReleaseFinalReadinessCertificateRow("dryrun_passed", "Dry-run passed", resultLedger.noopExecutionDryRunDigest, 1, resultLedger.dryRunStatus === "passed", certificateReady, certificateStatus, finalReadinessStatus),
    mockCertifiedReleaseFinalReadinessCertificateRow("execution_mode_no_op", "Execution mode no-op", resultLedger.noopExecutionDryRunDigest, 1, resultLedger.executionMode === "no_op", certificateReady, certificateStatus, finalReadinessStatus),
    mockCertifiedReleaseFinalReadinessCertificateRow("acceptance_acknowledged", "Acceptance acknowledged", resultLedger.acceptanceRecordDigest, 1, resultLedger.acceptanceStatus === "acknowledged", certificateReady, certificateStatus, finalReadinessStatus),
    mockCertifiedReleaseFinalReadinessCertificateRow("handoff_ready", "Handoff ready", resultLedger.handoffPacketDigest, 1, resultLedger.handoffStatus === "ready", certificateReady, certificateStatus, finalReadinessStatus),
    mockCertifiedReleaseFinalReadinessCertificateRow("release_decision_go", "Release decision go", resultLedger.decisionReceiptDigest, 1, resultLedger.releaseDecision === "go", certificateReady, certificateStatus, finalReadinessStatus),
    mockCertifiedReleaseFinalReadinessCertificateRow("gate_ready", "Release gate ready", resultLedger.releaseGateDigest, 1, resultLedger.gateStatus === "ready" && resultLedger.goNoGoDecision === "go", certificateReady, certificateStatus, finalReadinessStatus),
    mockCertifiedReleaseFinalReadinessCertificateRow("prerequisite_chain", "Prerequisite chain complete", resultLedger.safeDigest, resultLedger.counts.resultLedgerRowCount + resultLedger.counts.finalReadinessRowCount, resultLedger.resultLedgerRows.every((row) => row.complete) && resultLedger.finalReadinessRows.every((row) => row.complete), certificateReady, certificateStatus, finalReadinessStatus),
    mockCertifiedReleaseFinalReadinessCertificateRow("safe_digests", "Safe digest chain", finalReadinessCertificateDigest, 14, mockCertifiedReleaseFinalReadinessDigestLinksSafe(resultLedger, finalReadinessCertificateDigest), certificateReady, certificateStatus, finalReadinessStatus),
    mockCertifiedReleaseFinalReadinessCertificateRow("no_state_mutation", "No final readiness certificate state mutation", resultLedger.dryRunResultLedgerDigest, 0, true, certificateReady, certificateStatus, finalReadinessStatus),
    mockCertifiedReleaseFinalReadinessCertificateRow("external_calls_zero", "External calls zero", resultLedger.dryRunResultLedgerDigest, resultLedger.externalCalls, resultLedger.externalCalls === 0, certificateReady, certificateStatus, finalReadinessStatus)
  ];
}

function mockCertifiedReleaseFinalReadinessCertificateRow(
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
    certificateStatus: complete && certificateReady ? "issued" : certificateStatus,
    finalReadinessStatus: complete && certificateReady ? "ready" : finalReadinessStatus,
    safeDigest,
    checkedCount,
    complete: complete && certificateReady
  };
}

function mockCertifiedReleaseFinalReadinessDigestLinksSafe(
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
  ].every((value) => /^sha256:[a-z0-9-]+$/i.test(value));
}

function createMockReviewQaHandoffCertifiedReleaseFreezeAuditRegister(
  filters: ProviderWebhookReviewClosureReportFilters
): ProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister {
  const finalReadinessCertificate = createMockReviewQaHandoffCertifiedReleaseFinalReadinessCertificate(filters);
  const freezeReady = mockCertifiedReleaseFreezeAuditRegisterReady(finalReadinessCertificate);
  const freezeAuditStatus = mockCertifiedReleaseFreezeAuditRegisterStatus(finalReadinessCertificate, freezeReady);
  const rollbackReadinessStatus = mockCertifiedReleaseRollbackReadinessStatus(finalReadinessCertificate, freezeReady);
  const safeDigestValue = `sha256:mockqahandoffcertifiedreleasefreezeauditregister-${safeDigest(`${finalReadinessCertificate.finalReadinessCertificateDigest}:${freezeAuditStatus}:${rollbackReadinessStatus}`)}`;
  const rollbackReadinessPlanDigest = `sha256:mockqahandoffcertifiedreleaserollbackreadinessplan-${safeDigest(`${finalReadinessCertificate.finalReadinessCertificateDigest}:${safeDigestValue}`)}`;
  const freezeAuditRows = mockCertifiedReleaseFreezeAuditRows(finalReadinessCertificate, freezeReady, freezeAuditStatus, rollbackReadinessStatus, safeDigestValue, rollbackReadinessPlanDigest);
  const rollbackPlanRows = mockCertifiedReleaseRollbackPlanRows(finalReadinessCertificate, freezeReady, freezeAuditStatus, rollbackReadinessStatus, safeDigestValue, rollbackReadinessPlanDigest);
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
    safeFilename: "provider-webhook-review-qa-handoff-certified-release-freeze-audit-register.json",
    safeDigest: safeDigestValue,
    freezeAuditRegisterDigest: safeDigestValue,
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
    externalCalls: 0
  };
}

function createMockReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt(
  filters: ProviderWebhookReviewClosureReportFilters
): ProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt {
  const freezeAuditRegister = createMockReviewQaHandoffCertifiedReleaseFreezeAuditRegister(filters);
  const rehearsalReady = mockCertifiedReleaseRollbackRehearsalReady(freezeAuditRegister);
  const rollbackRehearsalStatus = mockCertifiedReleaseRollbackRehearsalStatus(freezeAuditRegister, rehearsalReady);
  const recoveryReadinessStatus = mockCertifiedReleaseRecoveryReadinessStatus(freezeAuditRegister, rehearsalReady);
  const safeDigestValue = `sha256:mockqahandoffcertifiedreleaserollbackrehearsalreceipt-${safeDigest(`${freezeAuditRegister.freezeAuditRegisterDigest}:${rollbackRehearsalStatus}:${recoveryReadinessStatus}`)}`;
  const freezeSnapshotRows = mockCertifiedReleaseRollbackRehearsalRows([
    ["freeze_audit_recorded", "Freeze audit register recorded", freezeAuditRegister.freezeAuditRegisterDigest, freezeAuditRegister.counts.freezeAuditRegisteredCount, freezeAuditRegister.freezeAuditStatus === "recorded"],
    ["release_frozen", "Certified release freeze remains frozen", freezeAuditRegister.freezeAuditRegisterDigest, 1, freezeAuditRegister.freezeStatus === "frozen"],
    ["safe_digest_chain", "Freeze snapshot safe digest chain", safeDigestValue, 17, mockCertifiedReleaseRollbackRehearsalDigestLinksSafe(freezeAuditRegister, safeDigestValue)]
  ], rehearsalReady, rollbackRehearsalStatus, recoveryReadinessStatus);
  const rollbackReadinessRows = mockCertifiedReleaseRollbackRehearsalRows([
    ["rollback_readiness_ready", "Rollback readiness status ready", freezeAuditRegister.freezeAuditRegisterDigest, freezeAuditRegister.counts.rollbackPlanReadyCount, freezeAuditRegister.rollbackReadinessStatus === "ready"],
    ["recovery_owner_confirmed", "Release owner recovery readiness confirmed", freezeAuditRegister.safeDigest, 1, freezeAuditRegister.releaseOwnerSummary.checklistAcknowledged],
    ["safe_digest_chain", "Rollback readiness safe digest chain", safeDigestValue, 17, mockCertifiedReleaseRollbackRehearsalDigestLinksSafe(freezeAuditRegister, safeDigestValue)]
  ], rehearsalReady, rollbackRehearsalStatus, recoveryReadinessStatus);
  const rollbackRehearsalRows = mockCertifiedReleaseRollbackRehearsalRows([
    ["dry_run_noop_passed", "No-op execution dry-run passed", freezeAuditRegister.noopExecutionDryRunDigest, freezeAuditRegister.counts.dryRunRowPassedCount, freezeAuditRegister.dryRunStatus === "passed" && freezeAuditRegister.executionMode === "no_op"],
    ["rollback_rehearsal_noop", "Rollback rehearsal receipt is read-only no-op evidence", safeDigestValue, 1, true],
    ["no_state_mutation", "No rollback rehearsal receipt state mutation", freezeAuditRegister.freezeAuditRegisterDigest, 0, true],
    ["external_calls_zero", "External calls zero", freezeAuditRegister.freezeAuditRegisterDigest, freezeAuditRegister.externalCalls, freezeAuditRegister.externalCalls === 0]
  ], rehearsalReady, rollbackRehearsalStatus, recoveryReadinessStatus);
  const recoveryPlanRows = mockCertifiedReleaseRollbackRehearsalRows([
    ["recovery_plan_ready", "Safe recovery plan ready", freezeAuditRegister.freezeAuditRegisterDigest, freezeAuditRegister.counts.rollbackPlanReadyCount, freezeAuditRegister.rollbackPlanRows.every((row) => row.complete && row.rollbackReadinessStatus === "ready")],
    ["certificate_issued", "Final readiness certificate issued", freezeAuditRegister.finalReadinessCertificateDigest, freezeAuditRegister.counts.certificateRowIssuedCount, freezeAuditRegister.certificateStatus === "issued"],
    ["final_readiness_ready", "Final readiness remains ready", freezeAuditRegister.finalReadinessCertificateDigest, freezeAuditRegister.counts.finalReadinessReadyCount, freezeAuditRegister.finalReadinessStatus === "ready"]
  ], rehearsalReady, rollbackRehearsalStatus, recoveryReadinessStatus);
  const recoveryReadinessRows = mockCertifiedReleaseRollbackRehearsalRows([
    ["safe_digest_chain", "Recovery readiness safe digest chain", safeDigestValue, 17, mockCertifiedReleaseRollbackRehearsalDigestLinksSafe(freezeAuditRegister, safeDigestValue)],
    ["no_state_mutation", "No recovery readiness state mutation", freezeAuditRegister.freezeAuditRegisterDigest, 0, true],
    ["external_calls_zero", "External calls zero", freezeAuditRegister.freezeAuditRegisterDigest, freezeAuditRegister.externalCalls, freezeAuditRegister.externalCalls === 0]
  ], rehearsalReady, rollbackRehearsalStatus, recoveryReadinessStatus);

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
    releaseDecision: rehearsalReady ? freezeAuditRegister.releaseDecision : "no_go",
    packetStatus: freezeAuditRegister.packetStatus,
    receiptStatus: freezeAuditRegister.receiptStatus,
    gateStatus: freezeAuditRegister.gateStatus,
    goNoGoDecision: rehearsalReady ? freezeAuditRegister.goNoGoDecision : "no_go",
    releaseReadinessStatus: freezeAuditRegister.releaseReadinessStatus,
    reconciliationStatus: freezeAuditRegister.reconciliationStatus,
    attestationStatus: freezeAuditRegister.attestationStatus,
    ledgerStatusFromClosure: freezeAuditRegister.ledgerStatusFromClosure,
    certificationStatus: freezeAuditRegister.certificationStatus,
    verificationStatus: freezeAuditRegister.verificationStatus,
    digestChainStatus: freezeAuditRegister.digestChainStatus,
    safeFilename: "provider-webhook-review-qa-handoff-certified-release-rollback-rehearsal-receipt.json",
    safeDigest: safeDigestValue,
    rollbackRehearsalReceiptDigest: safeDigestValue,
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
    externalCalls: 0
  };
}

function mockCertifiedReleaseRollbackRehearsalReady(
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

function mockCertifiedReleaseRollbackRehearsalStatus(
  freezeAuditRegister: ProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister,
  rehearsalReady: boolean
): ProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt["rollbackRehearsalStatus"] {
  if (rehearsalReady) return "verified";
  if (freezeAuditRegister.freezeAuditStatus === "pending") return "pending";
  if (freezeAuditRegister.freezeAuditStatus === "blocked" || freezeAuditRegister.releaseDecision !== "go" || freezeAuditRegister.goNoGoDecision !== "go") return "blocked";
  return "incomplete";
}

function mockCertifiedReleaseRecoveryReadinessStatus(
  freezeAuditRegister: ProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister,
  rehearsalReady: boolean
): ProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt["recoveryReadinessStatus"] {
  if (rehearsalReady) return "ready";
  if (freezeAuditRegister.freezeAuditStatus === "pending" || freezeAuditRegister.rollbackReadinessStatus === "incomplete") return "incomplete";
  return "not_ready";
}

function mockCertifiedReleaseRollbackRehearsalRows(
  rows: Array<[
    ProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt["rollbackRehearsalRows"][number]["key"],
    string,
    string,
    number,
    boolean
  ]>,
  rehearsalReady: boolean,
  rollbackRehearsalStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt["rollbackRehearsalStatus"],
  recoveryReadinessStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt["recoveryReadinessStatus"]
): ProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt["rollbackRehearsalRows"] {
  return rows.map(([key, label, rowDigest, checkedCount, complete]) => ({
    key,
    label,
    rollbackRehearsalStatus: complete && rehearsalReady ? "verified" : rollbackRehearsalStatus,
    recoveryReadinessStatus: complete && rehearsalReady ? "ready" : recoveryReadinessStatus,
    safeDigest: rowDigest,
    checkedCount,
    complete: complete && rehearsalReady
  }));
}

function mockCertifiedReleaseRollbackRehearsalDigestLinksSafe(
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
  ].every((value) => /^sha256:[a-z0-9-]+$/i.test(value));
}

function createMockReviewQaHandoffCertifiedReleaseControlRoomPacket(
  filters: ProviderWebhookReviewClosureReportFilters
): ProviderWebhookReviewQaHandoffCertifiedReleaseControlRoomPacket {
  const rollbackRehearsalReceipt = createMockReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt(filters);
  const controlRoomReady = mockCertifiedReleaseControlRoomReady(rollbackRehearsalReceipt);
  const controlRoomStatus = mockCertifiedReleaseControlRoomStatus(rollbackRehearsalReceipt, controlRoomReady);
  const cutoverReadinessStatus = controlRoomReady ? "ready" : "not_ready";
  const safeDigestValue = `sha256:mockqahandoffcertifiedreleasecontrolroompacket-${safeDigest(`${rollbackRehearsalReceipt.rollbackRehearsalReceiptDigest}:${controlRoomStatus}:${cutoverReadinessStatus}`)}`;
  const controlRoomRows = mockCertifiedReleaseControlRoomRows([
    ["rollback_rehearsal_verified", "Rollback rehearsal receipt verified", rollbackRehearsalReceipt.rollbackRehearsalReceiptDigest, rollbackRehearsalReceipt.counts.rollbackRehearsalVerifiedCount, rollbackRehearsalReceipt.rollbackRehearsalStatus === "verified"],
    ["recovery_readiness_ready", "Recovery readiness status ready", rollbackRehearsalReceipt.rollbackRehearsalReceiptDigest, rollbackRehearsalReceipt.counts.recoveryReadinessReadyCount, rollbackRehearsalReceipt.recoveryReadinessStatus === "ready"],
    ["safe_digest_chain", "Control room packet safe digest chain", safeDigestValue, 18, mockCertifiedReleaseControlRoomDigestLinksSafe(rollbackRehearsalReceipt, safeDigestValue)],
    ["no_state_mutation", "No control room packet state mutation", rollbackRehearsalReceipt.rollbackRehearsalReceiptDigest, 0, true],
    ["external_calls_zero", "External calls zero", rollbackRehearsalReceipt.rollbackRehearsalReceiptDigest, rollbackRehearsalReceipt.externalCalls, rollbackRehearsalReceipt.externalCalls === 0]
  ], controlRoomReady, controlRoomStatus, cutoverReadinessStatus);
  const cutoverChecklistRows = mockCertifiedReleaseControlRoomRows([
    ["rollback_readiness_ready", "Rollback readiness remains ready", rollbackRehearsalReceipt.freezeAuditRegisterDigest, rollbackRehearsalReceipt.counts.rollbackReadinessReadyCount, rollbackRehearsalReceipt.rollbackReadinessStatus === "ready"],
    ["freeze_audit_recorded", "Freeze audit register recorded", rollbackRehearsalReceipt.freezeAuditRegisterDigest, rollbackRehearsalReceipt.counts.freezeAuditRegisteredCount, rollbackRehearsalReceipt.freezeAuditStatus === "recorded"],
    ["release_frozen", "Certified release remains frozen", rollbackRehearsalReceipt.freezeAuditRegisterDigest, 1, rollbackRehearsalReceipt.freezeStatus === "frozen"],
    ["final_readiness_ready", "Final readiness remains ready", rollbackRehearsalReceipt.finalReadinessCertificateDigest, rollbackRehearsalReceipt.counts.finalReadinessReadyCount, rollbackRehearsalReceipt.finalReadinessStatus === "ready"],
    ["go_decision_confirmed", "Go/no-go decision remains go", safeDigestValue, 1, rollbackRehearsalReceipt.releaseDecision === "go" && rollbackRehearsalReceipt.goNoGoDecision === "go"]
  ], controlRoomReady, controlRoomStatus, cutoverReadinessStatus);
  const operatorHandoffRows = mockCertifiedReleaseControlRoomRows([
    ["operator_checklist_complete", "Operator checklist complete", rollbackRehearsalReceipt.handoffPacketDigest, rollbackRehearsalReceipt.counts.operatorChecklistCompleteCount, rollbackRehearsalReceipt.operatorChecklist.every((item) => item.complete)],
    ["acknowledgement_complete", "Acknowledged checklist complete", rollbackRehearsalReceipt.acceptanceRecordDigest, rollbackRehearsalReceipt.counts.acknowledgedChecklistCompleteCount, rollbackRehearsalReceipt.acknowledgedChecklist.every((item) => item.acknowledged)],
    ["execution_checklist_complete", "Execution checklist complete", rollbackRehearsalReceipt.noopExecutionDryRunDigest, rollbackRehearsalReceipt.counts.executionChecklistCompleteCount, rollbackRehearsalReceipt.executionChecklist.every((item) => item.complete)],
    ["receipt_issued", "Decision receipt issued", rollbackRehearsalReceipt.decisionReceiptDigest, 1, rollbackRehearsalReceipt.receiptStatus === "issued"],
    ["packet_issued", "Handoff packet issued", safeDigestValue, 1, rollbackRehearsalReceipt.packetStatus === "issued"]
  ], controlRoomReady, controlRoomStatus, cutoverReadinessStatus);

  return {
    packetKind: "qa-handoff-locked-archive-certified-release-control-room-packet",
    controlRoomStatus,
    cutoverReadinessStatus,
    rollbackRehearsalStatus: rollbackRehearsalReceipt.rollbackRehearsalStatus,
    recoveryReadinessStatus: rollbackRehearsalReceipt.recoveryReadinessStatus,
    rollbackReadinessStatus: rollbackRehearsalReceipt.rollbackReadinessStatus,
    freezeAuditStatus: rollbackRehearsalReceipt.freezeAuditStatus,
    freezeStatus: rollbackRehearsalReceipt.freezeStatus,
    certificateStatus: rollbackRehearsalReceipt.certificateStatus,
    finalReadinessStatus: rollbackRehearsalReceipt.finalReadinessStatus,
    ledgerStatus: rollbackRehearsalReceipt.ledgerStatus,
    dryRunStatus: rollbackRehearsalReceipt.dryRunStatus,
    executionMode: rollbackRehearsalReceipt.executionMode,
    acceptanceStatus: rollbackRehearsalReceipt.acceptanceStatus,
    handoffStatus: rollbackRehearsalReceipt.handoffStatus,
    releaseDecision: controlRoomReady ? rollbackRehearsalReceipt.releaseDecision : "no_go",
    packetStatus: rollbackRehearsalReceipt.packetStatus,
    receiptStatus: rollbackRehearsalReceipt.receiptStatus,
    gateStatus: rollbackRehearsalReceipt.gateStatus,
    goNoGoDecision: controlRoomReady ? rollbackRehearsalReceipt.goNoGoDecision : "no_go",
    releaseReadinessStatus: rollbackRehearsalReceipt.releaseReadinessStatus,
    reconciliationStatus: rollbackRehearsalReceipt.reconciliationStatus,
    attestationStatus: rollbackRehearsalReceipt.attestationStatus,
    ledgerStatusFromClosure: rollbackRehearsalReceipt.ledgerStatusFromClosure,
    certificationStatus: rollbackRehearsalReceipt.certificationStatus,
    verificationStatus: rollbackRehearsalReceipt.verificationStatus,
    digestChainStatus: rollbackRehearsalReceipt.digestChainStatus,
    safeFilename: "provider-webhook-review-qa-handoff-certified-release-control-room-packet.json",
    safeDigest: safeDigestValue,
    controlRoomPacketDigest: safeDigestValue,
    rollbackRehearsalReceiptDigest: rollbackRehearsalReceipt.rollbackRehearsalReceiptDigest,
    freezeAuditRegisterDigest: rollbackRehearsalReceipt.freezeAuditRegisterDigest,
    finalReadinessCertificateDigest: rollbackRehearsalReceipt.finalReadinessCertificateDigest,
    dryRunResultLedgerDigest: rollbackRehearsalReceipt.dryRunResultLedgerDigest,
    noopExecutionDryRunDigest: rollbackRehearsalReceipt.noopExecutionDryRunDigest,
    acceptanceRecordDigest: rollbackRehearsalReceipt.acceptanceRecordDigest,
    handoffPacketDigest: rollbackRehearsalReceipt.handoffPacketDigest,
    decisionReceiptDigest: rollbackRehearsalReceipt.decisionReceiptDigest,
    releaseGateDigest: rollbackRehearsalReceipt.releaseGateDigest,
    reconciliationDigest: rollbackRehearsalReceipt.reconciliationDigest,
    attestationAuditDigest: rollbackRehearsalReceipt.attestationAuditDigest,
    closureLedgerDigest: rollbackRehearsalReceipt.closureLedgerDigest,
    certificationDigest: rollbackRehearsalReceipt.certificationDigest,
    verificationDigest: rollbackRehearsalReceipt.verificationDigest,
    releaseEvidenceDigest: rollbackRehearsalReceipt.releaseEvidenceDigest,
    operatorChecklist: rollbackRehearsalReceipt.operatorChecklist,
    acknowledgedChecklist: rollbackRehearsalReceipt.acknowledgedChecklist,
    executionChecklist: rollbackRehearsalReceipt.executionChecklist,
    dryRunRows: rollbackRehearsalReceipt.dryRunRows,
    executionPlanRows: rollbackRehearsalReceipt.executionPlanRows,
    resultLedgerRows: rollbackRehearsalReceipt.resultLedgerRows,
    finalReadinessRows: rollbackRehearsalReceipt.finalReadinessRows,
    certificateRows: rollbackRehearsalReceipt.certificateRows,
    freezeAuditRows: rollbackRehearsalReceipt.freezeAuditRows,
    freezeSnapshotRows: rollbackRehearsalReceipt.freezeSnapshotRows,
    rollbackReadinessRows: rollbackRehearsalReceipt.rollbackReadinessRows,
    rollbackRehearsalRows: rollbackRehearsalReceipt.rollbackRehearsalRows,
    recoveryPlanRows: rollbackRehearsalReceipt.recoveryPlanRows,
    recoveryReadinessRows: rollbackRehearsalReceipt.recoveryReadinessRows,
    controlRoomRows,
    cutoverChecklistRows,
    operatorHandoffRows,
    releaseOwnerSummary: rollbackRehearsalReceipt.releaseOwnerSummary,
    inheritedPrerequisiteChecklist: rollbackRehearsalReceipt.inheritedPrerequisiteChecklist,
    inheritedCertificationChecklist: rollbackRehearsalReceipt.inheritedCertificationChecklist,
    inheritedGateChecklist: rollbackRehearsalReceipt.inheritedGateChecklist,
    inheritedDecisionReceiptSummary: rollbackRehearsalReceipt.inheritedDecisionReceiptSummary,
    inheritedHandoffPacketSummary: rollbackRehearsalReceipt.inheritedHandoffPacketSummary,
    inheritedAcceptanceSummary: rollbackRehearsalReceipt.inheritedAcceptanceSummary,
    inheritedNoopDryRunSummary: rollbackRehearsalReceipt.inheritedNoopDryRunSummary,
    inheritedResultLedgerSummary: rollbackRehearsalReceipt.inheritedResultLedgerSummary,
    inheritedFinalReadinessCertificateSummary: rollbackRehearsalReceipt.inheritedFinalReadinessCertificateSummary,
    inheritedFreezeAuditSummary: rollbackRehearsalReceipt.inheritedFreezeAuditSummary,
    inheritedRollbackRehearsalSummary: {
      rollbackRehearsalStatus: rollbackRehearsalReceipt.rollbackRehearsalStatus,
      recoveryReadinessStatus: rollbackRehearsalReceipt.recoveryReadinessStatus,
      rollbackRehearsalRowCount: rollbackRehearsalReceipt.counts.rollbackRehearsalRowCount,
      rollbackRehearsalVerifiedCount: rollbackRehearsalReceipt.counts.rollbackRehearsalVerifiedCount,
      recoveryReadinessRowCount: rollbackRehearsalReceipt.counts.recoveryReadinessRowCount,
      recoveryReadinessReadyCount: rollbackRehearsalReceipt.counts.recoveryReadinessReadyCount,
      rollbackRehearsalReceiptMutationCount: rollbackRehearsalReceipt.counts.rollbackRehearsalReceiptMutationCount,
      externalCallsZero: rollbackRehearsalReceipt.externalCalls === 0,
      safeDigest: rollbackRehearsalReceipt.safeDigest
    },
    inheritedBlockingReasons: rollbackRehearsalReceipt.inheritedBlockingReasons,
    inheritedExceptionRows: rollbackRehearsalReceipt.inheritedExceptionRows,
    counts: {
      ...rollbackRehearsalReceipt.counts,
      controlRoomPacketCheckedCount: 1,
      controlRoomPacketMutationCount: 0,
      controlRoomRowCount: controlRoomRows.length,
      controlRoomReadyCount: controlRoomRows.filter((row) => row.complete).length,
      cutoverChecklistRowCount: cutoverChecklistRows.length,
      cutoverChecklistReadyCount: cutoverChecklistRows.filter((row) => row.complete).length,
      operatorHandoffRowCount: operatorHandoffRows.length,
      operatorHandoffReadyCount: operatorHandoffRows.filter((row) => row.complete).length
    },
    externalCalls: 0
  };
}

function createMockReviewQaHandoffCertifiedReleaseCutoverChecklistReceipt(
  filters: ProviderWebhookReviewClosureReportFilters
): ProviderWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceipt {
  const controlRoomPacket = createMockReviewQaHandoffCertifiedReleaseControlRoomPacket(filters);
  const cutoverChecklistReady = mockCertifiedReleaseCutoverChecklistReady(controlRoomPacket);
  const cutoverChecklistStatus = mockCertifiedReleaseCutoverChecklistStatus(controlRoomPacket, cutoverChecklistReady);
  const operatorCommandStatus = cutoverChecklistReady ? "ready" : "not_ready";
  const safeDigestValue = `sha256:mockqahandoffcertifiedreleasecutoverchecklistreceipt-${safeDigest(`${controlRoomPacket.controlRoomPacketDigest}:${cutoverChecklistStatus}:${operatorCommandStatus}`)}`;
  const operatorCommandRows = mockCertifiedReleaseCutoverChecklistReceiptRows([
    ["operator_checklist_complete", "Operator checklist complete", controlRoomPacket.handoffPacketDigest, controlRoomPacket.counts.operatorChecklistCompleteCount, controlRoomPacket.operatorChecklist.every((item) => item.complete)],
    ["acknowledgement_complete", "Acknowledged checklist complete", controlRoomPacket.acceptanceRecordDigest, controlRoomPacket.counts.acknowledgedChecklistCompleteCount, controlRoomPacket.acknowledgedChecklist.every((item) => item.acknowledged)],
    ["execution_checklist_complete", "Execution checklist complete", controlRoomPacket.noopExecutionDryRunDigest, controlRoomPacket.counts.executionChecklistCompleteCount, controlRoomPacket.executionChecklist.every((item) => item.complete)],
    ["handoff_ready", "Certified release handoff ready", controlRoomPacket.handoffPacketDigest, 1, controlRoomPacket.handoffStatus === "ready"],
    ["no_op_execution", "No-op execution mode enforced", controlRoomPacket.noopExecutionDryRunDigest, 1, controlRoomPacket.executionMode === "no_op"],
    ["operator_command_ready", "Safe operator command handoff ready", safeDigestValue, 1, cutoverChecklistReady]
  ], cutoverChecklistReady, cutoverChecklistStatus, operatorCommandStatus);
  const safeCutoverChecklistRows = mockCertifiedReleaseCutoverChecklistReceiptRows([
    ["control_room_ready", "Control room packet ready", controlRoomPacket.controlRoomPacketDigest, controlRoomPacket.counts.controlRoomReadyCount, controlRoomPacket.controlRoomStatus === "ready"],
    ["cutover_readiness_ready", "Cutover readiness ready", controlRoomPacket.controlRoomPacketDigest, controlRoomPacket.counts.cutoverChecklistReadyCount, controlRoomPacket.cutoverReadinessStatus === "ready"],
    ["rollback_rehearsal_verified", "Rollback rehearsal receipt verified", controlRoomPacket.rollbackRehearsalReceiptDigest, controlRoomPacket.counts.rollbackRehearsalVerifiedCount, controlRoomPacket.rollbackRehearsalStatus === "verified"],
    ["recovery_readiness_ready", "Recovery readiness ready", controlRoomPacket.rollbackRehearsalReceiptDigest, controlRoomPacket.counts.recoveryReadinessReadyCount, controlRoomPacket.recoveryReadinessStatus === "ready"],
    ["rollback_readiness_ready", "Rollback readiness ready", controlRoomPacket.freezeAuditRegisterDigest, controlRoomPacket.counts.rollbackReadinessReadyCount, controlRoomPacket.rollbackReadinessStatus === "ready"],
    ["freeze_audit_recorded", "Freeze audit register recorded", controlRoomPacket.freezeAuditRegisterDigest, controlRoomPacket.counts.freezeAuditRegisteredCount, controlRoomPacket.freezeAuditStatus === "recorded"],
    ["release_frozen", "Certified release frozen", controlRoomPacket.freezeAuditRegisterDigest, 1, controlRoomPacket.freezeStatus === "frozen"],
    ["final_readiness_ready", "Final readiness certificate ready", controlRoomPacket.finalReadinessCertificateDigest, controlRoomPacket.counts.finalReadinessReadyCount, controlRoomPacket.finalReadinessStatus === "ready"],
    ["ledger_recorded", "Dry-run result ledger recorded", controlRoomPacket.dryRunResultLedgerDigest, controlRoomPacket.counts.resultLedgerRowRecordedCount, controlRoomPacket.ledgerStatus === "recorded"],
    ["dry_run_passed", "No-op execution dry-run passed", controlRoomPacket.noopExecutionDryRunDigest, controlRoomPacket.counts.dryRunRowPassedCount, controlRoomPacket.dryRunStatus === "passed"],
    ["release_decision_go", "Release decision remains go", controlRoomPacket.decisionReceiptDigest, 1, controlRoomPacket.releaseDecision === "go" && controlRoomPacket.goNoGoDecision === "go"],
    ["safe_digest_chain", "Cutover checklist receipt safe digest chain", safeDigestValue, 19, mockCertifiedReleaseCutoverChecklistReceiptDigestLinksSafe(controlRoomPacket, safeDigestValue)],
    ["no_state_mutation", "No cutover checklist receipt state mutation", controlRoomPacket.controlRoomPacketDigest, 0, true],
    ["external_calls_zero", "External calls zero", controlRoomPacket.controlRoomPacketDigest, controlRoomPacket.externalCalls, controlRoomPacket.externalCalls === 0]
  ], cutoverChecklistReady, cutoverChecklistStatus, operatorCommandStatus);

  return {
    receiptKind: "qa-handoff-locked-archive-certified-release-cutover-checklist-receipt",
    cutoverChecklistStatus,
    operatorCommandStatus,
    controlRoomStatus: controlRoomPacket.controlRoomStatus,
    cutoverReadinessStatus: controlRoomPacket.cutoverReadinessStatus,
    rollbackRehearsalStatus: controlRoomPacket.rollbackRehearsalStatus,
    recoveryReadinessStatus: controlRoomPacket.recoveryReadinessStatus,
    rollbackReadinessStatus: controlRoomPacket.rollbackReadinessStatus,
    freezeAuditStatus: controlRoomPacket.freezeAuditStatus,
    freezeStatus: controlRoomPacket.freezeStatus,
    certificateStatus: controlRoomPacket.certificateStatus,
    finalReadinessStatus: controlRoomPacket.finalReadinessStatus,
    ledgerStatus: controlRoomPacket.ledgerStatus,
    dryRunStatus: controlRoomPacket.dryRunStatus,
    executionMode: controlRoomPacket.executionMode,
    acceptanceStatus: controlRoomPacket.acceptanceStatus,
    handoffStatus: controlRoomPacket.handoffStatus,
    releaseDecision: cutoverChecklistReady ? controlRoomPacket.releaseDecision : "no_go",
    packetStatus: controlRoomPacket.packetStatus,
    receiptStatus: controlRoomPacket.receiptStatus,
    gateStatus: controlRoomPacket.gateStatus,
    goNoGoDecision: cutoverChecklistReady ? controlRoomPacket.goNoGoDecision : "no_go",
    releaseReadinessStatus: controlRoomPacket.releaseReadinessStatus,
    reconciliationStatus: controlRoomPacket.reconciliationStatus,
    attestationStatus: controlRoomPacket.attestationStatus,
    ledgerStatusFromClosure: controlRoomPacket.ledgerStatusFromClosure,
    certificationStatus: controlRoomPacket.certificationStatus,
    verificationStatus: controlRoomPacket.verificationStatus,
    digestChainStatus: controlRoomPacket.digestChainStatus,
    safeFilename: "provider-webhook-review-qa-handoff-certified-release-cutover-checklist-receipt.json",
    safeDigest: safeDigestValue,
    cutoverChecklistReceiptDigest: safeDigestValue,
    controlRoomPacketDigest: controlRoomPacket.controlRoomPacketDigest,
    rollbackRehearsalReceiptDigest: controlRoomPacket.rollbackRehearsalReceiptDigest,
    freezeAuditRegisterDigest: controlRoomPacket.freezeAuditRegisterDigest,
    finalReadinessCertificateDigest: controlRoomPacket.finalReadinessCertificateDigest,
    dryRunResultLedgerDigest: controlRoomPacket.dryRunResultLedgerDigest,
    noopExecutionDryRunDigest: controlRoomPacket.noopExecutionDryRunDigest,
    acceptanceRecordDigest: controlRoomPacket.acceptanceRecordDigest,
    handoffPacketDigest: controlRoomPacket.handoffPacketDigest,
    decisionReceiptDigest: controlRoomPacket.decisionReceiptDigest,
    releaseGateDigest: controlRoomPacket.releaseGateDigest,
    reconciliationDigest: controlRoomPacket.reconciliationDigest,
    attestationAuditDigest: controlRoomPacket.attestationAuditDigest,
    closureLedgerDigest: controlRoomPacket.closureLedgerDigest,
    certificationDigest: controlRoomPacket.certificationDigest,
    verificationDigest: controlRoomPacket.verificationDigest,
    releaseEvidenceDigest: controlRoomPacket.releaseEvidenceDigest,
    operatorChecklist: controlRoomPacket.operatorChecklist,
    acknowledgedChecklist: controlRoomPacket.acknowledgedChecklist,
    executionChecklist: controlRoomPacket.executionChecklist,
    dryRunRows: controlRoomPacket.dryRunRows,
    executionPlanRows: controlRoomPacket.executionPlanRows,
    resultLedgerRows: controlRoomPacket.resultLedgerRows,
    finalReadinessRows: controlRoomPacket.finalReadinessRows,
    certificateRows: controlRoomPacket.certificateRows,
    freezeAuditRows: controlRoomPacket.freezeAuditRows,
    freezeSnapshotRows: controlRoomPacket.freezeSnapshotRows,
    rollbackReadinessRows: controlRoomPacket.rollbackReadinessRows,
    rollbackRehearsalRows: controlRoomPacket.rollbackRehearsalRows,
    recoveryPlanRows: controlRoomPacket.recoveryPlanRows,
    recoveryReadinessRows: controlRoomPacket.recoveryReadinessRows,
    controlRoomRows: controlRoomPacket.controlRoomRows,
    cutoverChecklistRows: controlRoomPacket.cutoverChecklistRows,
    operatorHandoffRows: controlRoomPacket.operatorHandoffRows,
    operatorCommandRows,
    safeCutoverChecklistRows,
    releaseOwnerSummary: controlRoomPacket.releaseOwnerSummary,
    inheritedPrerequisiteChecklist: controlRoomPacket.inheritedPrerequisiteChecklist,
    inheritedCertificationChecklist: controlRoomPacket.inheritedCertificationChecklist,
    inheritedGateChecklist: controlRoomPacket.inheritedGateChecklist,
    inheritedDecisionReceiptSummary: controlRoomPacket.inheritedDecisionReceiptSummary,
    inheritedHandoffPacketSummary: controlRoomPacket.inheritedHandoffPacketSummary,
    inheritedAcceptanceSummary: controlRoomPacket.inheritedAcceptanceSummary,
    inheritedNoopDryRunSummary: controlRoomPacket.inheritedNoopDryRunSummary,
    inheritedResultLedgerSummary: controlRoomPacket.inheritedResultLedgerSummary,
    inheritedFinalReadinessCertificateSummary: controlRoomPacket.inheritedFinalReadinessCertificateSummary,
    inheritedFreezeAuditSummary: controlRoomPacket.inheritedFreezeAuditSummary,
    inheritedRollbackRehearsalSummary: controlRoomPacket.inheritedRollbackRehearsalSummary,
    inheritedControlRoomSummary: {
      controlRoomStatus: controlRoomPacket.controlRoomStatus,
      cutoverReadinessStatus: controlRoomPacket.cutoverReadinessStatus,
      controlRoomRowCount: controlRoomPacket.counts.controlRoomRowCount,
      controlRoomReadyCount: controlRoomPacket.counts.controlRoomReadyCount,
      cutoverChecklistRowCount: controlRoomPacket.counts.cutoverChecklistRowCount,
      cutoverChecklistReadyCount: controlRoomPacket.counts.cutoverChecklistReadyCount,
      operatorHandoffRowCount: controlRoomPacket.counts.operatorHandoffRowCount,
      operatorHandoffReadyCount: controlRoomPacket.counts.operatorHandoffReadyCount,
      controlRoomPacketMutationCount: controlRoomPacket.counts.controlRoomPacketMutationCount,
      externalCallsZero: controlRoomPacket.externalCalls === 0,
      safeDigest: controlRoomPacket.safeDigest
    },
    inheritedBlockingReasons: controlRoomPacket.inheritedBlockingReasons,
    inheritedExceptionRows: controlRoomPacket.inheritedExceptionRows,
    counts: {
      ...controlRoomPacket.counts,
      cutoverChecklistReceiptCheckedCount: 1,
      cutoverChecklistReceiptMutationCount: 0,
      operatorCommandRowCount: operatorCommandRows.length,
      operatorCommandReadyCount: operatorCommandRows.filter((row) => row.complete).length,
      safeCutoverChecklistRowCount: safeCutoverChecklistRows.length,
      safeCutoverChecklistReadyCount: safeCutoverChecklistRows.filter((row) => row.complete).length
    },
    externalCalls: 0
  };
}

function createMockReviewQaHandoffCertifiedReleaseOperatorCommandReceipt(
  filters: ProviderWebhookReviewClosureReportFilters
): ProviderWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceipt {
  const cutoverChecklistReceipt = createMockReviewQaHandoffCertifiedReleaseCutoverChecklistReceipt(filters);
  const operatorCommandReceiptReady = mockCertifiedReleaseOperatorCommandReceiptReady(cutoverChecklistReceipt);
  const operatorCommandReceiptStatus = mockCertifiedReleaseOperatorCommandReceiptStatus(cutoverChecklistReceipt, operatorCommandReceiptReady);
  const goLiveAuthorizationStatus = operatorCommandReceiptReady ? "ready" : operatorCommandReceiptStatus === "incomplete" ? "incomplete" : "not_ready";
  const safeDigestValue = `sha256:mockqahandoffcertifiedreleaseoperatorcommandreceipt-${safeDigest(`${cutoverChecklistReceipt.cutoverChecklistReceiptDigest}:${operatorCommandReceiptStatus}:${goLiveAuthorizationStatus}`)}`;
  const goLiveAuthorizationRows = mockCertifiedReleaseOperatorCommandReceiptRows([
    ["cutover_checklist_verified", "Cutover checklist receipt verified", cutoverChecklistReceipt.cutoverChecklistReceiptDigest, cutoverChecklistReceipt.counts.cutoverChecklistReceiptCheckedCount, cutoverChecklistReceipt.cutoverChecklistStatus === "verified"],
    ["operator_command_ready", "Safe operator command ready", cutoverChecklistReceipt.cutoverChecklistReceiptDigest, cutoverChecklistReceipt.counts.operatorCommandReadyCount, cutoverChecklistReceipt.operatorCommandStatus === "ready"],
    ["control_room_ready", "Control room packet ready", cutoverChecklistReceipt.controlRoomPacketDigest, cutoverChecklistReceipt.counts.controlRoomReadyCount, cutoverChecklistReceipt.controlRoomStatus === "ready"],
    ["cutover_readiness_ready", "Cutover readiness ready", cutoverChecklistReceipt.controlRoomPacketDigest, cutoverChecklistReceipt.counts.cutoverChecklistReadyCount, cutoverChecklistReceipt.cutoverReadinessStatus === "ready"],
    ["go_live_authorization_ready", "Safe go-live authorization preview ready", safeDigestValue, 1, goLiveAuthorizationStatus === "ready"],
    ["external_calls_zero", "External calls zero", cutoverChecklistReceipt.safeDigest, 0, cutoverChecklistReceipt.externalCalls === 0]
  ], operatorCommandReceiptReady, operatorCommandReceiptStatus, goLiveAuthorizationStatus, cutoverChecklistReceipt);
  const operatorCommandReceiptRows = mockCertifiedReleaseOperatorCommandReceiptRows([
    ["rollback_rehearsal_verified", "Rollback rehearsal receipt verified", cutoverChecklistReceipt.rollbackRehearsalReceiptDigest, cutoverChecklistReceipt.counts.rollbackRehearsalVerifiedCount, cutoverChecklistReceipt.rollbackRehearsalStatus === "verified"],
    ["recovery_readiness_ready", "Recovery readiness ready", cutoverChecklistReceipt.rollbackRehearsalReceiptDigest, cutoverChecklistReceipt.counts.recoveryReadinessReadyCount, cutoverChecklistReceipt.recoveryReadinessStatus === "ready"],
    ["rollback_readiness_ready", "Rollback readiness ready", cutoverChecklistReceipt.freezeAuditRegisterDigest, cutoverChecklistReceipt.counts.rollbackReadinessReadyCount, cutoverChecklistReceipt.rollbackReadinessStatus === "ready"],
    ["freeze_audit_recorded", "Freeze audit register recorded", cutoverChecklistReceipt.freezeAuditRegisterDigest, cutoverChecklistReceipt.counts.freezeAuditRegisteredCount, cutoverChecklistReceipt.freezeAuditStatus === "recorded"],
    ["release_frozen", "Certified release frozen", cutoverChecklistReceipt.freezeAuditRegisterDigest, 1, cutoverChecklistReceipt.freezeStatus === "frozen"],
    ["certificate_issued", "Final readiness certificate issued", cutoverChecklistReceipt.finalReadinessCertificateDigest, 1, cutoverChecklistReceipt.certificateStatus === "issued"],
    ["final_readiness_ready", "Final readiness ready", cutoverChecklistReceipt.finalReadinessCertificateDigest, cutoverChecklistReceipt.counts.finalReadinessReadyCount, cutoverChecklistReceipt.finalReadinessStatus === "ready"],
    ["ledger_recorded", "Dry-run result ledger recorded", cutoverChecklistReceipt.dryRunResultLedgerDigest, cutoverChecklistReceipt.counts.resultLedgerRowRecordedCount, cutoverChecklistReceipt.ledgerStatus === "recorded"],
    ["dry_run_passed", "No-op execution dry-run passed", cutoverChecklistReceipt.noopExecutionDryRunDigest, cutoverChecklistReceipt.counts.dryRunRowPassedCount, cutoverChecklistReceipt.dryRunStatus === "passed"],
    ["operator_command_receipt_issued", "Operator command receipt issued", safeDigestValue, 1, operatorCommandReceiptStatus === "issued"],
    ["safe_digest_chain", "Operator command receipt safe digest chain", safeDigestValue, 20, mockCertifiedReleaseOperatorCommandReceiptDigestLinksSafe(cutoverChecklistReceipt, safeDigestValue)]
  ], operatorCommandReceiptReady, operatorCommandReceiptStatus, goLiveAuthorizationStatus, cutoverChecklistReceipt);
  const commandHandoffRows = mockCertifiedReleaseOperatorCommandReceiptRows([
    ["no_op_execution", "No-op execution mode enforced", cutoverChecklistReceipt.noopExecutionDryRunDigest, 1, cutoverChecklistReceipt.executionMode === "no_op"],
    ["acceptance_acknowledged", "Acceptance record acknowledged", cutoverChecklistReceipt.acceptanceRecordDigest, cutoverChecklistReceipt.counts.acknowledgedChecklistCompleteCount, cutoverChecklistReceipt.acceptanceStatus === "acknowledged"],
    ["handoff_ready", "Handoff packet ready", cutoverChecklistReceipt.handoffPacketDigest, 1, cutoverChecklistReceipt.handoffStatus === "ready"],
    ["release_decision_go", "Release decision remains go", cutoverChecklistReceipt.decisionReceiptDigest, 1, cutoverChecklistReceipt.releaseDecision === "go"],
    ["packet_issued", "Handoff packet issued", cutoverChecklistReceipt.handoffPacketDigest, 1, cutoverChecklistReceipt.packetStatus === "issued"],
    ["receipt_issued", "Decision receipt issued", cutoverChecklistReceipt.decisionReceiptDigest, 1, cutoverChecklistReceipt.receiptStatus === "issued"],
    ["gate_ready", "Certified release gate ready", cutoverChecklistReceipt.releaseGateDigest, 1, cutoverChecklistReceipt.gateStatus === "ready"],
    ["go_no_go_go", "Go/no-go decision remains go", cutoverChecklistReceipt.releaseGateDigest, 1, cutoverChecklistReceipt.goNoGoDecision === "go"],
    ["operator_checklist_complete", "Operator checklist complete", cutoverChecklistReceipt.handoffPacketDigest, cutoverChecklistReceipt.counts.operatorChecklistCompleteCount, cutoverChecklistReceipt.operatorChecklist.every((item) => item.complete)],
    ["acknowledgement_complete", "Acknowledged checklist complete", cutoverChecklistReceipt.acceptanceRecordDigest, cutoverChecklistReceipt.counts.acknowledgedChecklistCompleteCount, cutoverChecklistReceipt.acknowledgedChecklist.every((item) => item.acknowledged)],
    ["execution_checklist_complete", "Execution checklist complete", cutoverChecklistReceipt.noopExecutionDryRunDigest, cutoverChecklistReceipt.counts.executionChecklistCompleteCount, cutoverChecklistReceipt.executionChecklist.every((item) => item.complete)],
    ["no_state_mutation", "No operator command receipt state mutation", cutoverChecklistReceipt.safeDigest, 0, cutoverChecklistReceipt.counts.cutoverChecklistReceiptMutationCount === 0]
  ], operatorCommandReceiptReady, operatorCommandReceiptStatus, goLiveAuthorizationStatus, cutoverChecklistReceipt);

  return {
    ...cutoverChecklistReceipt,
    receiptKind: "qa-handoff-locked-archive-certified-release-operator-command-receipt",
    operatorCommandReceiptStatus,
    goLiveAuthorizationStatus,
    releaseDecision: operatorCommandReceiptReady ? cutoverChecklistReceipt.releaseDecision : "no_go",
    goNoGoDecision: operatorCommandReceiptReady ? cutoverChecklistReceipt.goNoGoDecision : "no_go",
    safeFilename: "provider-webhook-review-qa-handoff-certified-release-operator-command-receipt.json",
    safeDigest: safeDigestValue,
    operatorCommandReceiptDigest: safeDigestValue,
    goLiveAuthorizationRows,
    operatorCommandReceiptRows,
    commandHandoffRows,
    inheritedCutoverChecklistSummary: {
      cutoverChecklistStatus: cutoverChecklistReceipt.cutoverChecklistStatus,
      operatorCommandStatus: cutoverChecklistReceipt.operatorCommandStatus,
      cutoverChecklistReceiptCheckedCount: cutoverChecklistReceipt.counts.cutoverChecklistReceiptCheckedCount,
      cutoverChecklistReceiptMutationCount: cutoverChecklistReceipt.counts.cutoverChecklistReceiptMutationCount,
      operatorCommandReadyCount: cutoverChecklistReceipt.counts.operatorCommandReadyCount,
      safeCutoverChecklistReadyCount: cutoverChecklistReceipt.counts.safeCutoverChecklistReadyCount,
      externalCallsZero: cutoverChecklistReceipt.externalCalls === 0,
      safeDigest: cutoverChecklistReceipt.safeDigest
    },
    counts: {
      ...cutoverChecklistReceipt.counts,
      operatorCommandReceiptCheckedCount: 1,
      operatorCommandReceiptMutationCount: 0,
      goLiveAuthorizationRowCount: goLiveAuthorizationRows.length,
      goLiveAuthorizationReadyCount: goLiveAuthorizationRows.filter((row) => row.complete).length,
      operatorCommandReceiptRowCount: operatorCommandReceiptRows.length,
      operatorCommandReceiptIssuedCount: operatorCommandReceiptRows.filter((row) => row.complete).length,
      commandHandoffRowCount: commandHandoffRows.length,
      commandHandoffReadyCount: commandHandoffRows.filter((row) => row.complete).length
    },
    externalCalls: 0
  };
}

function mockCertifiedReleaseOperatorCommandReceiptReady(
  cutoverChecklistReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceipt
) {
  return cutoverChecklistReceipt.cutoverChecklistStatus === "verified" &&
    cutoverChecklistReceipt.operatorCommandStatus === "ready" &&
    cutoverChecklistReceipt.controlRoomStatus === "ready" &&
    cutoverChecklistReceipt.cutoverReadinessStatus === "ready" &&
    cutoverChecklistReceipt.rollbackRehearsalStatus === "verified" &&
    cutoverChecklistReceipt.recoveryReadinessStatus === "ready" &&
    cutoverChecklistReceipt.rollbackReadinessStatus === "ready" &&
    cutoverChecklistReceipt.freezeAuditStatus === "recorded" &&
    cutoverChecklistReceipt.freezeStatus === "frozen" &&
    cutoverChecklistReceipt.certificateStatus === "issued" &&
    cutoverChecklistReceipt.finalReadinessStatus === "ready" &&
    cutoverChecklistReceipt.ledgerStatus === "recorded" &&
    cutoverChecklistReceipt.dryRunStatus === "passed" &&
    cutoverChecklistReceipt.executionMode === "no_op" &&
    cutoverChecklistReceipt.acceptanceStatus === "acknowledged" &&
    cutoverChecklistReceipt.handoffStatus === "ready" &&
    cutoverChecklistReceipt.releaseDecision === "go" &&
    cutoverChecklistReceipt.goNoGoDecision === "go" &&
    cutoverChecklistReceipt.packetStatus === "issued" &&
    cutoverChecklistReceipt.receiptStatus === "issued" &&
    cutoverChecklistReceipt.gateStatus === "ready" &&
    cutoverChecklistReceipt.operatorCommandRows.every((row) => row.complete) &&
    cutoverChecklistReceipt.safeCutoverChecklistRows.every((row) => row.complete) &&
    cutoverChecklistReceipt.counts.cutoverChecklistReceiptMutationCount === 0 &&
    cutoverChecklistReceipt.externalCalls === 0;
}

function mockCertifiedReleaseOperatorCommandReceiptStatus(
  cutoverChecklistReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceipt,
  operatorCommandReceiptReady: boolean
): ProviderWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceipt["operatorCommandReceiptStatus"] {
  if (operatorCommandReceiptReady) return "issued";
  if (cutoverChecklistReceipt.cutoverChecklistStatus === "blocked" || cutoverChecklistReceipt.releaseDecision !== "go" || cutoverChecklistReceipt.goNoGoDecision !== "go") return "blocked";
  return "incomplete";
}

function mockCertifiedReleaseOperatorCommandReceiptRows(
  rows: Array<[
    ProviderWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceipt["operatorCommandReceiptRows"][number]["key"],
    string,
    string,
    number,
    boolean
  ]>,
  operatorCommandReceiptReady: boolean,
  operatorCommandReceiptStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceipt["operatorCommandReceiptStatus"],
  goLiveAuthorizationStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceipt["goLiveAuthorizationStatus"],
  cutoverChecklistReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceipt
): ProviderWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceipt["operatorCommandReceiptRows"] {
  return rows.map(([key, label, rowDigest, checkedCount, complete]) => ({
    key,
    label,
    operatorCommandReceiptStatus: complete && operatorCommandReceiptReady ? "issued" : operatorCommandReceiptStatus,
    goLiveAuthorizationStatus: complete && operatorCommandReceiptReady ? "ready" : goLiveAuthorizationStatus,
    cutoverChecklistStatus: complete && operatorCommandReceiptReady ? "verified" : cutoverChecklistReceipt.cutoverChecklistStatus,
    operatorCommandStatus: complete && operatorCommandReceiptReady ? "ready" : cutoverChecklistReceipt.operatorCommandStatus,
    safeDigest: rowDigest,
    checkedCount,
    complete: complete && operatorCommandReceiptReady
  }));
}

function mockCertifiedReleaseOperatorCommandReceiptDigestLinksSafe(
  cutoverChecklistReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceipt,
  operatorCommandReceiptDigest: string
) {
  return [
    operatorCommandReceiptDigest,
    cutoverChecklistReceipt.cutoverChecklistReceiptDigest,
    cutoverChecklistReceipt.controlRoomPacketDigest,
    cutoverChecklistReceipt.rollbackRehearsalReceiptDigest,
    cutoverChecklistReceipt.freezeAuditRegisterDigest,
    cutoverChecklistReceipt.finalReadinessCertificateDigest,
    cutoverChecklistReceipt.dryRunResultLedgerDigest,
    cutoverChecklistReceipt.noopExecutionDryRunDigest,
    cutoverChecklistReceipt.acceptanceRecordDigest,
    cutoverChecklistReceipt.handoffPacketDigest,
    cutoverChecklistReceipt.decisionReceiptDigest,
    cutoverChecklistReceipt.releaseGateDigest,
    cutoverChecklistReceipt.reconciliationDigest,
    cutoverChecklistReceipt.attestationAuditDigest,
    cutoverChecklistReceipt.closureLedgerDigest,
    cutoverChecklistReceipt.certificationDigest,
    cutoverChecklistReceipt.verificationDigest,
    cutoverChecklistReceipt.releaseEvidenceDigest,
    cutoverChecklistReceipt.safeDigest
  ].every((value) => /^sha256:[a-z0-9-]+$/i.test(value));
}

function createMockReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceipt(
  filters: ProviderWebhookReviewClosureReportFilters
): ProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceipt {
  const operatorCommandReceipt = createMockReviewQaHandoffCertifiedReleaseOperatorCommandReceipt(filters);
  const goLiveAuthorizationReceiptReady = mockCertifiedReleaseGoLiveAuthorizationReceiptReady(operatorCommandReceipt);
  const goLiveAuthorizationReceiptStatus = mockCertifiedReleaseGoLiveAuthorizationReceiptStatus(operatorCommandReceipt, goLiveAuthorizationReceiptReady);
  const launchWindowStatus = goLiveAuthorizationReceiptReady ? "ready" : goLiveAuthorizationReceiptStatus === "incomplete" ? "incomplete" : "not_ready";
  const safeLaunchWindowStatus = launchWindowStatus;
  const safeDigestValue = `sha256:mockqahandoffcertifiedreleasegoliveauthorizationreceipt-${safeDigest(`${operatorCommandReceipt.operatorCommandReceiptDigest}:${goLiveAuthorizationReceiptStatus}:${launchWindowStatus}`)}`;
  const goLiveAuthorizationReceiptRows = mockCertifiedReleaseGoLiveAuthorizationReceiptRows([
    ["operator_command_receipt_issued", "Operator command receipt issued", operatorCommandReceipt.operatorCommandReceiptDigest, operatorCommandReceipt.counts.operatorCommandReceiptCheckedCount, operatorCommandReceipt.operatorCommandReceiptStatus === "issued"],
    ["go_live_authorization_ready", "Go-live authorization prerequisite ready", operatorCommandReceipt.operatorCommandReceiptDigest, operatorCommandReceipt.counts.goLiveAuthorizationReadyCount, operatorCommandReceipt.goLiveAuthorizationStatus === "ready"],
    ["cutover_checklist_verified", "Cutover checklist receipt verified", operatorCommandReceipt.cutoverChecklistReceiptDigest, operatorCommandReceipt.counts.cutoverChecklistReceiptCheckedCount, operatorCommandReceipt.cutoverChecklistStatus === "verified"],
    ["operator_command_ready", "Operator command remains ready", operatorCommandReceipt.cutoverChecklistReceiptDigest, operatorCommandReceipt.counts.operatorCommandReadyCount, operatorCommandReceipt.operatorCommandStatus === "ready"],
    ["launch_window_ready", "Safe launch window ready", safeDigestValue, 1, launchWindowStatus === "ready"],
    ["safe_launch_window_ready", "Safe launch window register ready", safeDigestValue, 1, safeLaunchWindowStatus === "ready"],
    ["external_calls_zero", "External calls zero", operatorCommandReceipt.safeDigest, 0, operatorCommandReceipt.externalCalls === 0],
    ["no_state_mutation", "No go-live authorization receipt state mutation", operatorCommandReceipt.safeDigest, 0, operatorCommandReceipt.counts.operatorCommandReceiptMutationCount === 0]
  ], goLiveAuthorizationReceiptReady, goLiveAuthorizationReceiptStatus, operatorCommandReceipt.goLiveAuthorizationStatus, launchWindowStatus, safeLaunchWindowStatus, operatorCommandReceipt);
  const launchWindowRows = mockCertifiedReleaseGoLiveAuthorizationReceiptRows([
    ["control_room_ready", "Control room packet ready", operatorCommandReceipt.controlRoomPacketDigest, operatorCommandReceipt.counts.controlRoomReadyCount, operatorCommandReceipt.controlRoomStatus === "ready"],
    ["cutover_readiness_ready", "Cutover readiness ready", operatorCommandReceipt.controlRoomPacketDigest, operatorCommandReceipt.counts.cutoverChecklistReadyCount, operatorCommandReceipt.cutoverReadinessStatus === "ready"],
    ["rollback_rehearsal_verified", "Rollback rehearsal receipt verified", operatorCommandReceipt.rollbackRehearsalReceiptDigest, operatorCommandReceipt.counts.rollbackRehearsalVerifiedCount, operatorCommandReceipt.rollbackRehearsalStatus === "verified"],
    ["recovery_readiness_ready", "Recovery readiness ready", operatorCommandReceipt.rollbackRehearsalReceiptDigest, operatorCommandReceipt.counts.recoveryReadinessReadyCount, operatorCommandReceipt.recoveryReadinessStatus === "ready"],
    ["rollback_readiness_ready", "Rollback readiness ready", operatorCommandReceipt.freezeAuditRegisterDigest, operatorCommandReceipt.counts.rollbackReadinessReadyCount, operatorCommandReceipt.rollbackReadinessStatus === "ready"],
    ["freeze_audit_recorded", "Freeze audit register recorded", operatorCommandReceipt.freezeAuditRegisterDigest, operatorCommandReceipt.counts.freezeAuditRegisteredCount, operatorCommandReceipt.freezeAuditStatus === "recorded"],
    ["release_frozen", "Certified release frozen", operatorCommandReceipt.freezeAuditRegisterDigest, 1, operatorCommandReceipt.freezeStatus === "frozen"],
    ["certificate_issued", "Final readiness certificate issued", operatorCommandReceipt.finalReadinessCertificateDigest, 1, operatorCommandReceipt.certificateStatus === "issued"],
    ["final_readiness_ready", "Final readiness ready", operatorCommandReceipt.finalReadinessCertificateDigest, operatorCommandReceipt.counts.finalReadinessReadyCount, operatorCommandReceipt.finalReadinessStatus === "ready"],
    ["ledger_recorded", "Dry-run result ledger recorded", operatorCommandReceipt.dryRunResultLedgerDigest, operatorCommandReceipt.counts.resultLedgerRowRecordedCount, operatorCommandReceipt.ledgerStatus === "recorded"],
    ["dry_run_passed", "No-op execution dry-run passed", operatorCommandReceipt.noopExecutionDryRunDigest, operatorCommandReceipt.counts.dryRunRowPassedCount, operatorCommandReceipt.dryRunStatus === "passed"],
    ["safe_digest_chain", "Go-live authorization receipt safe digest chain", safeDigestValue, 21, mockCertifiedReleaseGoLiveAuthorizationReceiptDigestLinksSafe(operatorCommandReceipt, safeDigestValue)]
  ], goLiveAuthorizationReceiptReady, goLiveAuthorizationReceiptStatus, operatorCommandReceipt.goLiveAuthorizationStatus, launchWindowStatus, safeLaunchWindowStatus, operatorCommandReceipt);
  const safeLaunchWindowRows = mockCertifiedReleaseGoLiveAuthorizationReceiptRows([
    ["no_op_execution", "No-op execution mode enforced", operatorCommandReceipt.noopExecutionDryRunDigest, 1, operatorCommandReceipt.executionMode === "no_op"],
    ["acceptance_acknowledged", "Acceptance record acknowledged", operatorCommandReceipt.acceptanceRecordDigest, operatorCommandReceipt.counts.acknowledgedChecklistCompleteCount, operatorCommandReceipt.acceptanceStatus === "acknowledged"],
    ["handoff_ready", "Handoff packet ready", operatorCommandReceipt.handoffPacketDigest, 1, operatorCommandReceipt.handoffStatus === "ready"],
    ["release_decision_go", "Release decision remains go", operatorCommandReceipt.decisionReceiptDigest, 1, operatorCommandReceipt.releaseDecision === "go"],
    ["packet_issued", "Handoff packet issued", operatorCommandReceipt.handoffPacketDigest, 1, operatorCommandReceipt.packetStatus === "issued"],
    ["receipt_issued", "Decision receipt issued", operatorCommandReceipt.decisionReceiptDigest, 1, operatorCommandReceipt.receiptStatus === "issued"],
    ["gate_ready", "Certified release gate ready", operatorCommandReceipt.releaseGateDigest, 1, operatorCommandReceipt.gateStatus === "ready"],
    ["go_no_go_go", "Go/no-go decision remains go", operatorCommandReceipt.releaseGateDigest, 1, operatorCommandReceipt.goNoGoDecision === "go"],
    ["operator_checklist_complete", "Operator checklist complete", operatorCommandReceipt.handoffPacketDigest, operatorCommandReceipt.counts.operatorChecklistCompleteCount, operatorCommandReceipt.operatorChecklist.every((item) => item.complete)],
    ["acknowledgement_complete", "Acknowledged checklist complete", operatorCommandReceipt.acceptanceRecordDigest, operatorCommandReceipt.counts.acknowledgedChecklistCompleteCount, operatorCommandReceipt.acknowledgedChecklist.every((item) => item.acknowledged)],
    ["execution_checklist_complete", "Execution checklist complete", operatorCommandReceipt.noopExecutionDryRunDigest, operatorCommandReceipt.counts.executionChecklistCompleteCount, operatorCommandReceipt.executionChecklist.every((item) => item.complete)]
  ], goLiveAuthorizationReceiptReady, goLiveAuthorizationReceiptStatus, operatorCommandReceipt.goLiveAuthorizationStatus, launchWindowStatus, safeLaunchWindowStatus, operatorCommandReceipt);

  return {
    ...operatorCommandReceipt,
    receiptKind: "qa-handoff-locked-archive-certified-release-go-live-authorization-receipt",
    goLiveAuthorizationReceiptStatus,
    launchWindowStatus,
    safeLaunchWindowStatus,
    releaseDecision: goLiveAuthorizationReceiptReady ? operatorCommandReceipt.releaseDecision : "no_go",
    goNoGoDecision: goLiveAuthorizationReceiptReady ? operatorCommandReceipt.goNoGoDecision : "no_go",
    safeFilename: "provider-webhook-review-qa-handoff-certified-release-go-live-authorization-receipt.json",
    safeDigest: safeDigestValue,
    goLiveAuthorizationReceiptDigest: safeDigestValue,
    goLiveAuthorizationReceiptRows,
    launchWindowRows,
    safeLaunchWindowRows,
    inheritedOperatorCommandSummary: {
      operatorCommandReceiptStatus: operatorCommandReceipt.operatorCommandReceiptStatus,
      goLiveAuthorizationStatus: operatorCommandReceipt.goLiveAuthorizationStatus,
      operatorCommandReceiptCheckedCount: operatorCommandReceipt.counts.operatorCommandReceiptCheckedCount,
      operatorCommandReceiptMutationCount: operatorCommandReceipt.counts.operatorCommandReceiptMutationCount,
      goLiveAuthorizationReadyCount: operatorCommandReceipt.counts.goLiveAuthorizationReadyCount,
      operatorCommandReceiptIssuedCount: operatorCommandReceipt.counts.operatorCommandReceiptIssuedCount,
      commandHandoffReadyCount: operatorCommandReceipt.counts.commandHandoffReadyCount,
      externalCallsZero: operatorCommandReceipt.externalCalls === 0,
      safeDigest: operatorCommandReceipt.safeDigest
    },
    counts: {
      ...operatorCommandReceipt.counts,
      goLiveAuthorizationReceiptCheckedCount: 1,
      goLiveAuthorizationReceiptMutationCount: 0,
      goLiveAuthorizationReceiptRowCount: goLiveAuthorizationReceiptRows.length,
      goLiveAuthorizationReceiptIssuedCount: goLiveAuthorizationReceiptRows.filter((row) => row.complete).length,
      launchWindowRowCount: launchWindowRows.length,
      launchWindowReadyCount: launchWindowRows.filter((row) => row.complete).length,
      safeLaunchWindowRowCount: safeLaunchWindowRows.length,
      safeLaunchWindowReadyCount: safeLaunchWindowRows.filter((row) => row.complete).length
    },
    externalCalls: 0
  };
}

function mockCertifiedReleaseGoLiveAuthorizationReceiptReady(
  operatorCommandReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceipt
) {
  return operatorCommandReceipt.operatorCommandReceiptStatus === "issued" &&
    operatorCommandReceipt.goLiveAuthorizationStatus === "ready" &&
    operatorCommandReceipt.cutoverChecklistStatus === "verified" &&
    operatorCommandReceipt.operatorCommandStatus === "ready" &&
    operatorCommandReceipt.controlRoomStatus === "ready" &&
    operatorCommandReceipt.cutoverReadinessStatus === "ready" &&
    operatorCommandReceipt.rollbackRehearsalStatus === "verified" &&
    operatorCommandReceipt.recoveryReadinessStatus === "ready" &&
    operatorCommandReceipt.rollbackReadinessStatus === "ready" &&
    operatorCommandReceipt.freezeAuditStatus === "recorded" &&
    operatorCommandReceipt.freezeStatus === "frozen" &&
    operatorCommandReceipt.certificateStatus === "issued" &&
    operatorCommandReceipt.finalReadinessStatus === "ready" &&
    operatorCommandReceipt.ledgerStatus === "recorded" &&
    operatorCommandReceipt.dryRunStatus === "passed" &&
    operatorCommandReceipt.executionMode === "no_op" &&
    operatorCommandReceipt.acceptanceStatus === "acknowledged" &&
    operatorCommandReceipt.handoffStatus === "ready" &&
    operatorCommandReceipt.releaseDecision === "go" &&
    operatorCommandReceipt.goNoGoDecision === "go" &&
    operatorCommandReceipt.packetStatus === "issued" &&
    operatorCommandReceipt.receiptStatus === "issued" &&
    operatorCommandReceipt.gateStatus === "ready" &&
    operatorCommandReceipt.goLiveAuthorizationRows.every((row) => row.complete) &&
    operatorCommandReceipt.operatorCommandReceiptRows.every((row) => row.complete) &&
    operatorCommandReceipt.commandHandoffRows.every((row) => row.complete) &&
    operatorCommandReceipt.counts.operatorCommandReceiptMutationCount === 0 &&
    operatorCommandReceipt.externalCalls === 0;
}

function mockCertifiedReleaseGoLiveAuthorizationReceiptStatus(
  operatorCommandReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceipt,
  goLiveAuthorizationReceiptReady: boolean
): ProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceipt["goLiveAuthorizationReceiptStatus"] {
  if (goLiveAuthorizationReceiptReady) return "issued";
  if (operatorCommandReceipt.operatorCommandReceiptStatus === "blocked" || operatorCommandReceipt.releaseDecision !== "go" || operatorCommandReceipt.goNoGoDecision !== "go") return "blocked";
  return "incomplete";
}

function mockCertifiedReleaseGoLiveAuthorizationReceiptRows(
  rows: Array<[
    ProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceipt["goLiveAuthorizationReceiptRows"][number]["key"],
    string,
    string,
    number,
    boolean
  ]>,
  goLiveAuthorizationReceiptReady: boolean,
  goLiveAuthorizationReceiptStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceipt["goLiveAuthorizationReceiptStatus"],
  goLiveAuthorizationStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceipt["goLiveAuthorizationStatus"],
  launchWindowStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceipt["launchWindowStatus"],
  safeLaunchWindowStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceipt["safeLaunchWindowStatus"],
  operatorCommandReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceipt
): ProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceipt["goLiveAuthorizationReceiptRows"] {
  return rows.map(([key, label, rowDigest, checkedCount, complete]) => ({
    key,
    label,
    goLiveAuthorizationReceiptStatus: complete && goLiveAuthorizationReceiptReady ? "issued" : goLiveAuthorizationReceiptStatus,
    goLiveAuthorizationStatus: complete && goLiveAuthorizationReceiptReady ? "ready" : goLiveAuthorizationStatus,
    launchWindowStatus: complete && goLiveAuthorizationReceiptReady ? "ready" : launchWindowStatus,
    safeLaunchWindowStatus: complete && goLiveAuthorizationReceiptReady ? "ready" : safeLaunchWindowStatus,
    operatorCommandReceiptStatus: complete && goLiveAuthorizationReceiptReady ? "issued" : operatorCommandReceipt.operatorCommandReceiptStatus,
    operatorCommandStatus: complete && goLiveAuthorizationReceiptReady ? "ready" : operatorCommandReceipt.operatorCommandStatus,
    safeDigest: rowDigest,
    checkedCount,
    complete: complete && goLiveAuthorizationReceiptReady
  }));
}

function mockCertifiedReleaseGoLiveAuthorizationReceiptDigestLinksSafe(
  operatorCommandReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceipt,
  goLiveAuthorizationReceiptDigest: string
) {
  return [
    goLiveAuthorizationReceiptDigest,
    operatorCommandReceipt.operatorCommandReceiptDigest,
    operatorCommandReceipt.cutoverChecklistReceiptDigest,
    operatorCommandReceipt.controlRoomPacketDigest,
    operatorCommandReceipt.rollbackRehearsalReceiptDigest,
    operatorCommandReceipt.freezeAuditRegisterDigest,
    operatorCommandReceipt.finalReadinessCertificateDigest,
    operatorCommandReceipt.dryRunResultLedgerDigest,
    operatorCommandReceipt.noopExecutionDryRunDigest,
    operatorCommandReceipt.acceptanceRecordDigest,
    operatorCommandReceipt.handoffPacketDigest,
    operatorCommandReceipt.decisionReceiptDigest,
    operatorCommandReceipt.releaseGateDigest,
    operatorCommandReceipt.reconciliationDigest,
    operatorCommandReceipt.attestationAuditDigest,
    operatorCommandReceipt.closureLedgerDigest,
    operatorCommandReceipt.certificationDigest,
    operatorCommandReceipt.verificationDigest,
    operatorCommandReceipt.releaseEvidenceDigest,
    operatorCommandReceipt.safeDigest
  ].every((value) => /^sha256:[a-z0-9-]+$/i.test(value));
}

function createMockReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceipt(
  filters: ProviderWebhookReviewClosureReportFilters
): ProviderWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceipt {
  const goLiveAuthorizationReceipt = createMockReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceipt(filters);
  const launchWindowConfirmationReady = mockCertifiedReleaseLaunchWindowConfirmationReceiptReady(goLiveAuthorizationReceipt);
  const launchWindowConfirmationStatus = mockCertifiedReleaseLaunchWindowConfirmationReceiptStatus(goLiveAuthorizationReceipt, launchWindowConfirmationReady);
  const goLiveHoldStatus = launchWindowConfirmationReady ? "ready" : launchWindowConfirmationStatus === "incomplete" ? "incomplete" : "not_ready";
  const safeDigestValue = `sha256:mockqahandoffcertifiedreleaselaunchwindowconfirmationreceipt-${safeDigest(`${goLiveAuthorizationReceipt.goLiveAuthorizationReceiptDigest}:${launchWindowConfirmationStatus}:${goLiveHoldStatus}`)}`;
  const launchWindowConfirmationRows = mockCertifiedReleaseLaunchWindowConfirmationReceiptRows([
    ["go_live_authorization_receipt_issued", "Go-live authorization receipt issued", goLiveAuthorizationReceipt.goLiveAuthorizationReceiptDigest, goLiveAuthorizationReceipt.counts.goLiveAuthorizationReceiptCheckedCount, goLiveAuthorizationReceipt.goLiveAuthorizationReceiptStatus === "issued"],
    ["go_live_authorization_ready", "Go-live authorization remains ready", goLiveAuthorizationReceipt.goLiveAuthorizationReceiptDigest, goLiveAuthorizationReceipt.counts.goLiveAuthorizationReceiptIssuedCount, goLiveAuthorizationReceipt.goLiveAuthorizationStatus === "ready"],
    ["launch_window_ready", "Launch window ready", goLiveAuthorizationReceipt.goLiveAuthorizationReceiptDigest, goLiveAuthorizationReceipt.counts.launchWindowReadyCount, goLiveAuthorizationReceipt.launchWindowStatus === "ready"],
    ["safe_launch_window_ready", "Safe launch window ready", goLiveAuthorizationReceipt.goLiveAuthorizationReceiptDigest, goLiveAuthorizationReceipt.counts.safeLaunchWindowReadyCount, goLiveAuthorizationReceipt.safeLaunchWindowStatus === "ready"],
    ["operator_command_receipt_issued", "Operator command receipt issued", goLiveAuthorizationReceipt.operatorCommandReceiptDigest, goLiveAuthorizationReceipt.counts.operatorCommandReceiptCheckedCount, goLiveAuthorizationReceipt.operatorCommandReceiptStatus === "issued"],
    ["operator_command_ready", "Operator command ready", goLiveAuthorizationReceipt.operatorCommandReceiptDigest, goLiveAuthorizationReceipt.counts.operatorCommandReadyCount, goLiveAuthorizationReceipt.operatorCommandStatus === "ready"],
    ["launch_window_confirmation_confirmed", "Launch window confirmation receipt confirmed", safeDigestValue, 1, launchWindowConfirmationStatus === "confirmed"],
    ["external_calls_zero", "External calls zero", goLiveAuthorizationReceipt.safeDigest, 0, goLiveAuthorizationReceipt.externalCalls === 0],
    ["no_state_mutation", "No launch window confirmation receipt state mutation", goLiveAuthorizationReceipt.safeDigest, 0, goLiveAuthorizationReceipt.counts.goLiveAuthorizationReceiptMutationCount === 0]
  ], launchWindowConfirmationReady, launchWindowConfirmationStatus, goLiveHoldStatus, goLiveAuthorizationReceipt);
  const goLiveHoldRows = mockCertifiedReleaseLaunchWindowConfirmationReceiptRows([
    ["cutover_checklist_verified", "Cutover checklist receipt verified", goLiveAuthorizationReceipt.cutoverChecklistReceiptDigest, goLiveAuthorizationReceipt.counts.cutoverChecklistReceiptCheckedCount, goLiveAuthorizationReceipt.cutoverChecklistStatus === "verified"],
    ["control_room_ready", "Control room packet ready", goLiveAuthorizationReceipt.controlRoomPacketDigest, goLiveAuthorizationReceipt.counts.controlRoomReadyCount, goLiveAuthorizationReceipt.controlRoomStatus === "ready"],
    ["cutover_readiness_ready", "Cutover readiness ready", goLiveAuthorizationReceipt.controlRoomPacketDigest, goLiveAuthorizationReceipt.counts.cutoverChecklistReadyCount, goLiveAuthorizationReceipt.cutoverReadinessStatus === "ready"],
    ["rollback_rehearsal_verified", "Rollback rehearsal receipt verified", goLiveAuthorizationReceipt.rollbackRehearsalReceiptDigest, goLiveAuthorizationReceipt.counts.rollbackRehearsalVerifiedCount, goLiveAuthorizationReceipt.rollbackRehearsalStatus === "verified"],
    ["recovery_readiness_ready", "Recovery readiness ready", goLiveAuthorizationReceipt.rollbackRehearsalReceiptDigest, goLiveAuthorizationReceipt.counts.recoveryReadinessReadyCount, goLiveAuthorizationReceipt.recoveryReadinessStatus === "ready"],
    ["rollback_readiness_ready", "Rollback readiness ready", goLiveAuthorizationReceipt.freezeAuditRegisterDigest, goLiveAuthorizationReceipt.counts.rollbackReadinessReadyCount, goLiveAuthorizationReceipt.rollbackReadinessStatus === "ready"],
    ["freeze_audit_recorded", "Freeze audit register recorded", goLiveAuthorizationReceipt.freezeAuditRegisterDigest, goLiveAuthorizationReceipt.counts.freezeAuditRegisteredCount, goLiveAuthorizationReceipt.freezeAuditStatus === "recorded"],
    ["release_frozen", "Certified release frozen", goLiveAuthorizationReceipt.freezeAuditRegisterDigest, 1, goLiveAuthorizationReceipt.freezeStatus === "frozen"],
    ["certificate_issued", "Final readiness certificate issued", goLiveAuthorizationReceipt.finalReadinessCertificateDigest, 1, goLiveAuthorizationReceipt.certificateStatus === "issued"],
    ["final_readiness_ready", "Final readiness ready", goLiveAuthorizationReceipt.finalReadinessCertificateDigest, goLiveAuthorizationReceipt.counts.finalReadinessReadyCount, goLiveAuthorizationReceipt.finalReadinessStatus === "ready"],
    ["ledger_recorded", "Dry-run result ledger recorded", goLiveAuthorizationReceipt.dryRunResultLedgerDigest, goLiveAuthorizationReceipt.counts.resultLedgerRowRecordedCount, goLiveAuthorizationReceipt.ledgerStatus === "recorded"],
    ["dry_run_passed", "No-op execution dry-run passed", goLiveAuthorizationReceipt.noopExecutionDryRunDigest, goLiveAuthorizationReceipt.counts.dryRunRowPassedCount, goLiveAuthorizationReceipt.dryRunStatus === "passed"],
    ["no_op_execution", "No-op execution mode enforced", goLiveAuthorizationReceipt.noopExecutionDryRunDigest, 1, goLiveAuthorizationReceipt.executionMode === "no_op"],
    ["acceptance_acknowledged", "Acceptance record acknowledged", goLiveAuthorizationReceipt.acceptanceRecordDigest, goLiveAuthorizationReceipt.counts.acknowledgedChecklistCompleteCount, goLiveAuthorizationReceipt.acceptanceStatus === "acknowledged"],
    ["handoff_ready", "Handoff packet ready", goLiveAuthorizationReceipt.handoffPacketDigest, 1, goLiveAuthorizationReceipt.handoffStatus === "ready"],
    ["release_decision_go", "Release decision remains go", goLiveAuthorizationReceipt.decisionReceiptDigest, 1, goLiveAuthorizationReceipt.releaseDecision === "go"],
    ["packet_issued", "Handoff packet issued", goLiveAuthorizationReceipt.handoffPacketDigest, 1, goLiveAuthorizationReceipt.packetStatus === "issued"],
    ["receipt_issued", "Decision receipt issued", goLiveAuthorizationReceipt.decisionReceiptDigest, 1, goLiveAuthorizationReceipt.receiptStatus === "issued"],
    ["gate_ready", "Certified release gate ready", goLiveAuthorizationReceipt.releaseGateDigest, 1, goLiveAuthorizationReceipt.gateStatus === "ready"],
    ["go_no_go_go", "Go/no-go decision remains go", goLiveAuthorizationReceipt.releaseGateDigest, 1, goLiveAuthorizationReceipt.goNoGoDecision === "go"],
    ["operator_checklist_complete", "Operator checklist complete", goLiveAuthorizationReceipt.handoffPacketDigest, goLiveAuthorizationReceipt.counts.operatorChecklistCompleteCount, goLiveAuthorizationReceipt.operatorChecklist.every((item) => item.complete)],
    ["acknowledgement_complete", "Acknowledged checklist complete", goLiveAuthorizationReceipt.acceptanceRecordDigest, goLiveAuthorizationReceipt.counts.acknowledgedChecklistCompleteCount, goLiveAuthorizationReceipt.acknowledgedChecklist.every((item) => item.acknowledged)],
    ["execution_checklist_complete", "Execution checklist complete", goLiveAuthorizationReceipt.noopExecutionDryRunDigest, goLiveAuthorizationReceipt.counts.executionChecklistCompleteCount, goLiveAuthorizationReceipt.executionChecklist.every((item) => item.complete)],
    ["go_live_hold_ready", "Safe go-live hold register ready", safeDigestValue, 1, goLiveHoldStatus === "ready"],
    ["safe_digest_chain", "Launch window confirmation receipt safe digest chain", safeDigestValue, 22, mockCertifiedReleaseLaunchWindowConfirmationReceiptDigestLinksSafe(goLiveAuthorizationReceipt, safeDigestValue)]
  ], launchWindowConfirmationReady, launchWindowConfirmationStatus, goLiveHoldStatus, goLiveAuthorizationReceipt);

  return {
    ...goLiveAuthorizationReceipt,
    receiptKind: "qa-handoff-locked-archive-certified-release-launch-window-confirmation-receipt",
    launchWindowConfirmationStatus,
    goLiveHoldStatus,
    releaseDecision: launchWindowConfirmationReady ? goLiveAuthorizationReceipt.releaseDecision : "no_go",
    goNoGoDecision: launchWindowConfirmationReady ? goLiveAuthorizationReceipt.goNoGoDecision : "no_go",
    safeFilename: "provider-webhook-review-qa-handoff-certified-release-launch-window-confirmation-receipt.json",
    safeDigest: safeDigestValue,
    launchWindowConfirmationReceiptDigest: safeDigestValue,
    launchWindowConfirmationRows,
    goLiveHoldRows,
    inheritedGoLiveAuthorizationSummary: {
      goLiveAuthorizationReceiptStatus: goLiveAuthorizationReceipt.goLiveAuthorizationReceiptStatus,
      goLiveAuthorizationStatus: goLiveAuthorizationReceipt.goLiveAuthorizationStatus,
      launchWindowStatus: goLiveAuthorizationReceipt.launchWindowStatus,
      safeLaunchWindowStatus: goLiveAuthorizationReceipt.safeLaunchWindowStatus,
      goLiveAuthorizationReceiptCheckedCount: goLiveAuthorizationReceipt.counts.goLiveAuthorizationReceiptCheckedCount,
      goLiveAuthorizationReceiptMutationCount: goLiveAuthorizationReceipt.counts.goLiveAuthorizationReceiptMutationCount,
      goLiveAuthorizationReceiptIssuedCount: goLiveAuthorizationReceipt.counts.goLiveAuthorizationReceiptIssuedCount,
      launchWindowReadyCount: goLiveAuthorizationReceipt.counts.launchWindowReadyCount,
      safeLaunchWindowReadyCount: goLiveAuthorizationReceipt.counts.safeLaunchWindowReadyCount,
      externalCallsZero: goLiveAuthorizationReceipt.externalCalls === 0,
      safeDigest: goLiveAuthorizationReceipt.safeDigest
    },
    counts: {
      ...goLiveAuthorizationReceipt.counts,
      launchWindowConfirmationReceiptCheckedCount: 1,
      launchWindowConfirmationReceiptMutationCount: 0,
      launchWindowConfirmationRowCount: launchWindowConfirmationRows.length,
      launchWindowConfirmationConfirmedCount: launchWindowConfirmationRows.filter((row) => row.complete).length,
      goLiveHoldRowCount: goLiveHoldRows.length,
      goLiveHoldReadyCount: goLiveHoldRows.filter((row) => row.complete).length
    },
    externalCalls: 0
  };
}

function mockCertifiedReleaseLaunchWindowConfirmationReceiptReady(
  goLiveAuthorizationReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceipt
) {
  return goLiveAuthorizationReceipt.goLiveAuthorizationReceiptStatus === "issued" &&
    goLiveAuthorizationReceipt.goLiveAuthorizationStatus === "ready" &&
    goLiveAuthorizationReceipt.launchWindowStatus === "ready" &&
    goLiveAuthorizationReceipt.safeLaunchWindowStatus === "ready" &&
    goLiveAuthorizationReceipt.operatorCommandReceiptStatus === "issued" &&
    goLiveAuthorizationReceipt.operatorCommandStatus === "ready" &&
    goLiveAuthorizationReceipt.cutoverChecklistStatus === "verified" &&
    goLiveAuthorizationReceipt.controlRoomStatus === "ready" &&
    goLiveAuthorizationReceipt.cutoverReadinessStatus === "ready" &&
    goLiveAuthorizationReceipt.rollbackRehearsalStatus === "verified" &&
    goLiveAuthorizationReceipt.recoveryReadinessStatus === "ready" &&
    goLiveAuthorizationReceipt.rollbackReadinessStatus === "ready" &&
    goLiveAuthorizationReceipt.freezeAuditStatus === "recorded" &&
    goLiveAuthorizationReceipt.freezeStatus === "frozen" &&
    goLiveAuthorizationReceipt.certificateStatus === "issued" &&
    goLiveAuthorizationReceipt.finalReadinessStatus === "ready" &&
    goLiveAuthorizationReceipt.ledgerStatus === "recorded" &&
    goLiveAuthorizationReceipt.dryRunStatus === "passed" &&
    goLiveAuthorizationReceipt.executionMode === "no_op" &&
    goLiveAuthorizationReceipt.acceptanceStatus === "acknowledged" &&
    goLiveAuthorizationReceipt.handoffStatus === "ready" &&
    goLiveAuthorizationReceipt.releaseDecision === "go" &&
    goLiveAuthorizationReceipt.goNoGoDecision === "go" &&
    goLiveAuthorizationReceipt.packetStatus === "issued" &&
    goLiveAuthorizationReceipt.receiptStatus === "issued" &&
    goLiveAuthorizationReceipt.gateStatus === "ready" &&
    goLiveAuthorizationReceipt.goLiveAuthorizationReceiptRows.every((row) => row.complete) &&
    goLiveAuthorizationReceipt.launchWindowRows.every((row) => row.complete) &&
    goLiveAuthorizationReceipt.safeLaunchWindowRows.every((row) => row.complete) &&
    goLiveAuthorizationReceipt.counts.goLiveAuthorizationReceiptMutationCount === 0 &&
    goLiveAuthorizationReceipt.externalCalls === 0;
}

function mockCertifiedReleaseLaunchWindowConfirmationReceiptStatus(
  goLiveAuthorizationReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceipt,
  launchWindowConfirmationReady: boolean
): ProviderWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceipt["launchWindowConfirmationStatus"] {
  if (launchWindowConfirmationReady) return "confirmed";
  if (goLiveAuthorizationReceipt.goLiveAuthorizationReceiptStatus === "blocked" || goLiveAuthorizationReceipt.releaseDecision !== "go" || goLiveAuthorizationReceipt.goNoGoDecision !== "go") return "blocked";
  return "incomplete";
}

function mockCertifiedReleaseLaunchWindowConfirmationReceiptRows(
  rows: Array<[
    ProviderWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceipt["launchWindowConfirmationRows"][number]["key"],
    string,
    string,
    number,
    boolean
  ]>,
  launchWindowConfirmationReady: boolean,
  launchWindowConfirmationStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceipt["launchWindowConfirmationStatus"],
  goLiveHoldStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceipt["goLiveHoldStatus"],
  goLiveAuthorizationReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceipt
): ProviderWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceipt["launchWindowConfirmationRows"] {
  return rows.map(([key, label, rowDigest, checkedCount, complete]) => ({
    key,
    label,
    launchWindowConfirmationStatus: complete && launchWindowConfirmationReady ? "confirmed" : launchWindowConfirmationStatus,
    goLiveHoldStatus: complete && launchWindowConfirmationReady ? "ready" : goLiveHoldStatus,
    goLiveAuthorizationReceiptStatus: complete && launchWindowConfirmationReady ? "issued" : goLiveAuthorizationReceipt.goLiveAuthorizationReceiptStatus,
    goLiveAuthorizationStatus: complete && launchWindowConfirmationReady ? "ready" : goLiveAuthorizationReceipt.goLiveAuthorizationStatus,
    launchWindowStatus: complete && launchWindowConfirmationReady ? "ready" : goLiveAuthorizationReceipt.launchWindowStatus,
    safeLaunchWindowStatus: complete && launchWindowConfirmationReady ? "ready" : goLiveAuthorizationReceipt.safeLaunchWindowStatus,
    operatorCommandReceiptStatus: complete && launchWindowConfirmationReady ? "issued" : goLiveAuthorizationReceipt.operatorCommandReceiptStatus,
    operatorCommandStatus: complete && launchWindowConfirmationReady ? "ready" : goLiveAuthorizationReceipt.operatorCommandStatus,
    safeDigest: rowDigest,
    checkedCount,
    complete: complete && launchWindowConfirmationReady
  }));
}

function mockCertifiedReleaseLaunchWindowConfirmationReceiptDigestLinksSafe(
  goLiveAuthorizationReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceipt,
  launchWindowConfirmationReceiptDigest: string
) {
  return [
    launchWindowConfirmationReceiptDigest,
    goLiveAuthorizationReceipt.goLiveAuthorizationReceiptDigest,
    goLiveAuthorizationReceipt.operatorCommandReceiptDigest,
    goLiveAuthorizationReceipt.cutoverChecklistReceiptDigest,
    goLiveAuthorizationReceipt.controlRoomPacketDigest,
    goLiveAuthorizationReceipt.rollbackRehearsalReceiptDigest,
    goLiveAuthorizationReceipt.freezeAuditRegisterDigest,
    goLiveAuthorizationReceipt.finalReadinessCertificateDigest,
    goLiveAuthorizationReceipt.dryRunResultLedgerDigest,
    goLiveAuthorizationReceipt.noopExecutionDryRunDigest,
    goLiveAuthorizationReceipt.acceptanceRecordDigest,
    goLiveAuthorizationReceipt.handoffPacketDigest,
    goLiveAuthorizationReceipt.decisionReceiptDigest,
    goLiveAuthorizationReceipt.releaseGateDigest,
    goLiveAuthorizationReceipt.reconciliationDigest,
    goLiveAuthorizationReceipt.attestationAuditDigest,
    goLiveAuthorizationReceipt.closureLedgerDigest,
    goLiveAuthorizationReceipt.certificationDigest,
    goLiveAuthorizationReceipt.verificationDigest,
    goLiveAuthorizationReceipt.releaseEvidenceDigest,
    goLiveAuthorizationReceipt.safeDigest
  ].every((value) => /^sha256:[a-z0-9-]+$/i.test(value));
}

function createMockReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceipt(
  filters: ProviderWebhookReviewClosureReportFilters
): ProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceipt {
  const launchWindowConfirmationReceipt = createMockReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceipt(filters);
  const goLiveHoldReleaseAuthorizationReady = mockCertifiedReleaseGoLiveHoldReleaseAuthorizationReceiptReady(launchWindowConfirmationReceipt);
  const goLiveHoldReleaseAuthorizationStatus = mockCertifiedReleaseGoLiveHoldReleaseAuthorizationStatus(launchWindowConfirmationReceipt, goLiveHoldReleaseAuthorizationReady);
  const launchApprovalStatus = goLiveHoldReleaseAuthorizationReady ? "ready" : goLiveHoldReleaseAuthorizationStatus === "incomplete" ? "incomplete" : "not_ready";
  const safeDigestValue = `sha256:mockqahandoffcertifiedreleasegoliveholdreleaseauthorizationreceipt-${safeDigest(`${launchWindowConfirmationReceipt.launchWindowConfirmationReceiptDigest}:${goLiveHoldReleaseAuthorizationStatus}:${launchApprovalStatus}`)}`;
  const goLiveHoldReleaseAuthorizationRows = mockCertifiedReleaseGoLiveHoldReleaseAuthorizationRows([
    ["launch_window_confirmation_confirmed", "Launch window confirmation receipt confirmed", launchWindowConfirmationReceipt.launchWindowConfirmationReceiptDigest, launchWindowConfirmationReceipt.counts.launchWindowConfirmationReceiptCheckedCount, launchWindowConfirmationReceipt.launchWindowConfirmationStatus === "confirmed"],
    ["go_live_hold_ready", "Safe go-live hold register ready", launchWindowConfirmationReceipt.launchWindowConfirmationReceiptDigest, launchWindowConfirmationReceipt.counts.goLiveHoldReadyCount, launchWindowConfirmationReceipt.goLiveHoldStatus === "ready"],
    ["go_live_authorization_receipt_issued", "Go-live authorization receipt issued", launchWindowConfirmationReceipt.goLiveAuthorizationReceiptDigest, launchWindowConfirmationReceipt.counts.goLiveAuthorizationReceiptCheckedCount, launchWindowConfirmationReceipt.goLiveAuthorizationReceiptStatus === "issued"],
    ["go_live_authorization_ready", "Go-live authorization remains ready", launchWindowConfirmationReceipt.goLiveAuthorizationReceiptDigest, launchWindowConfirmationReceipt.counts.goLiveAuthorizationReceiptIssuedCount, launchWindowConfirmationReceipt.goLiveAuthorizationStatus === "ready"],
    ["launch_window_ready", "Launch window ready", launchWindowConfirmationReceipt.goLiveAuthorizationReceiptDigest, launchWindowConfirmationReceipt.counts.launchWindowReadyCount, launchWindowConfirmationReceipt.launchWindowStatus === "ready"],
    ["safe_launch_window_ready", "Safe launch window ready", launchWindowConfirmationReceipt.goLiveAuthorizationReceiptDigest, launchWindowConfirmationReceipt.counts.safeLaunchWindowReadyCount, launchWindowConfirmationReceipt.safeLaunchWindowStatus === "ready"],
    ["go_live_hold_release_authorized", "Safe go-live hold release authorization issued", safeDigestValue, 1, goLiveHoldReleaseAuthorizationStatus === "authorized"],
    ["external_calls_zero", "External calls zero", launchWindowConfirmationReceipt.safeDigest, 0, launchWindowConfirmationReceipt.externalCalls === 0],
    ["no_state_mutation", "No go-live hold release authorization receipt state mutation", launchWindowConfirmationReceipt.safeDigest, 0, launchWindowConfirmationReceipt.counts.launchWindowConfirmationReceiptMutationCount === 0]
  ], goLiveHoldReleaseAuthorizationReady, goLiveHoldReleaseAuthorizationStatus, launchApprovalStatus, launchWindowConfirmationReceipt);
  const launchApprovalRows = mockCertifiedReleaseGoLiveHoldReleaseAuthorizationRows([
    ["operator_command_receipt_issued", "Operator command receipt issued", launchWindowConfirmationReceipt.operatorCommandReceiptDigest, launchWindowConfirmationReceipt.counts.operatorCommandReceiptCheckedCount, launchWindowConfirmationReceipt.operatorCommandReceiptStatus === "issued"],
    ["operator_command_ready", "Operator command ready", launchWindowConfirmationReceipt.operatorCommandReceiptDigest, launchWindowConfirmationReceipt.counts.operatorCommandReadyCount, launchWindowConfirmationReceipt.operatorCommandStatus === "ready"],
    ["cutover_checklist_verified", "Cutover checklist receipt verified", launchWindowConfirmationReceipt.cutoverChecklistReceiptDigest, launchWindowConfirmationReceipt.counts.cutoverChecklistReceiptCheckedCount, launchWindowConfirmationReceipt.cutoverChecklistStatus === "verified"],
    ["control_room_ready", "Control room packet ready", launchWindowConfirmationReceipt.controlRoomPacketDigest, launchWindowConfirmationReceipt.counts.controlRoomReadyCount, launchWindowConfirmationReceipt.controlRoomStatus === "ready"],
    ["cutover_readiness_ready", "Cutover readiness ready", launchWindowConfirmationReceipt.controlRoomPacketDigest, launchWindowConfirmationReceipt.counts.cutoverChecklistReadyCount, launchWindowConfirmationReceipt.cutoverReadinessStatus === "ready"],
    ["rollback_rehearsal_verified", "Rollback rehearsal receipt verified", launchWindowConfirmationReceipt.rollbackRehearsalReceiptDigest, launchWindowConfirmationReceipt.counts.rollbackRehearsalVerifiedCount, launchWindowConfirmationReceipt.rollbackRehearsalStatus === "verified"],
    ["recovery_readiness_ready", "Recovery readiness ready", launchWindowConfirmationReceipt.rollbackRehearsalReceiptDigest, launchWindowConfirmationReceipt.counts.recoveryReadinessReadyCount, launchWindowConfirmationReceipt.recoveryReadinessStatus === "ready"],
    ["rollback_readiness_ready", "Rollback readiness ready", launchWindowConfirmationReceipt.freezeAuditRegisterDigest, launchWindowConfirmationReceipt.counts.rollbackReadinessReadyCount, launchWindowConfirmationReceipt.rollbackReadinessStatus === "ready"],
    ["freeze_audit_recorded", "Freeze audit register recorded", launchWindowConfirmationReceipt.freezeAuditRegisterDigest, launchWindowConfirmationReceipt.counts.freezeAuditRegisteredCount, launchWindowConfirmationReceipt.freezeAuditStatus === "recorded"],
    ["release_frozen", "Certified release frozen", launchWindowConfirmationReceipt.freezeAuditRegisterDigest, 1, launchWindowConfirmationReceipt.freezeStatus === "frozen"],
    ["certificate_issued", "Final readiness certificate issued", launchWindowConfirmationReceipt.finalReadinessCertificateDigest, 1, launchWindowConfirmationReceipt.certificateStatus === "issued"],
    ["final_readiness_ready", "Final readiness ready", launchWindowConfirmationReceipt.finalReadinessCertificateDigest, launchWindowConfirmationReceipt.counts.finalReadinessReadyCount, launchWindowConfirmationReceipt.finalReadinessStatus === "ready"],
    ["ledger_recorded", "Dry-run result ledger recorded", launchWindowConfirmationReceipt.dryRunResultLedgerDigest, launchWindowConfirmationReceipt.counts.resultLedgerRowRecordedCount, launchWindowConfirmationReceipt.ledgerStatus === "recorded"],
    ["dry_run_passed", "No-op execution dry-run passed", launchWindowConfirmationReceipt.noopExecutionDryRunDigest, launchWindowConfirmationReceipt.counts.dryRunRowPassedCount, launchWindowConfirmationReceipt.dryRunStatus === "passed"],
    ["no_op_execution", "No-op execution mode enforced", launchWindowConfirmationReceipt.noopExecutionDryRunDigest, 1, launchWindowConfirmationReceipt.executionMode === "no_op"],
    ["acceptance_acknowledged", "Acceptance record acknowledged", launchWindowConfirmationReceipt.acceptanceRecordDigest, launchWindowConfirmationReceipt.counts.acknowledgedChecklistCompleteCount, launchWindowConfirmationReceipt.acceptanceStatus === "acknowledged"],
    ["handoff_ready", "Handoff packet ready", launchWindowConfirmationReceipt.handoffPacketDigest, 1, launchWindowConfirmationReceipt.handoffStatus === "ready"],
    ["release_decision_go", "Release decision remains go", launchWindowConfirmationReceipt.decisionReceiptDigest, 1, launchWindowConfirmationReceipt.releaseDecision === "go"],
    ["packet_issued", "Handoff packet issued", launchWindowConfirmationReceipt.handoffPacketDigest, 1, launchWindowConfirmationReceipt.packetStatus === "issued"],
    ["receipt_issued", "Decision receipt issued", launchWindowConfirmationReceipt.decisionReceiptDigest, 1, launchWindowConfirmationReceipt.receiptStatus === "issued"],
    ["gate_ready", "Certified release gate ready", launchWindowConfirmationReceipt.releaseGateDigest, 1, launchWindowConfirmationReceipt.gateStatus === "ready"],
    ["go_no_go_go", "Go/no-go decision remains go", launchWindowConfirmationReceipt.releaseGateDigest, 1, launchWindowConfirmationReceipt.goNoGoDecision === "go"],
    ["operator_checklist_complete", "Operator checklist complete", launchWindowConfirmationReceipt.handoffPacketDigest, launchWindowConfirmationReceipt.counts.operatorChecklistCompleteCount, launchWindowConfirmationReceipt.operatorChecklist.every((item) => item.complete)],
    ["acknowledgement_complete", "Acknowledged checklist complete", launchWindowConfirmationReceipt.acceptanceRecordDigest, launchWindowConfirmationReceipt.counts.acknowledgedChecklistCompleteCount, launchWindowConfirmationReceipt.acknowledgedChecklist.every((item) => item.acknowledged)],
    ["execution_checklist_complete", "Execution checklist complete", launchWindowConfirmationReceipt.noopExecutionDryRunDigest, launchWindowConfirmationReceipt.counts.executionChecklistCompleteCount, launchWindowConfirmationReceipt.executionChecklist.every((item) => item.complete)],
    ["launch_approval_ready", "Launch approval register ready", safeDigestValue, 1, launchApprovalStatus === "ready"],
    ["safe_digest_chain", "Go-live hold release authorization receipt safe digest chain", safeDigestValue, 23, mockCertifiedReleaseGoLiveHoldReleaseAuthorizationReceiptDigestLinksSafe(launchWindowConfirmationReceipt, safeDigestValue)]
  ], goLiveHoldReleaseAuthorizationReady, goLiveHoldReleaseAuthorizationStatus, launchApprovalStatus, launchWindowConfirmationReceipt);

  return {
    ...launchWindowConfirmationReceipt,
    receiptKind: "qa-handoff-locked-archive-certified-release-go-live-hold-release-authorization-receipt",
    goLiveHoldReleaseAuthorizationStatus,
    launchApprovalStatus,
    releaseDecision: goLiveHoldReleaseAuthorizationReady ? launchWindowConfirmationReceipt.releaseDecision : "no_go",
    goNoGoDecision: goLiveHoldReleaseAuthorizationReady ? launchWindowConfirmationReceipt.goNoGoDecision : "no_go",
    safeFilename: "provider-webhook-review-qa-handoff-certified-release-go-live-hold-release-authorization-receipt.json",
    safeDigest: safeDigestValue,
    goLiveHoldReleaseAuthorizationReceiptDigest: safeDigestValue,
    goLiveHoldReleaseAuthorizationRows,
    launchApprovalRows,
    inheritedLaunchWindowConfirmationSummary: {
      launchWindowConfirmationStatus: launchWindowConfirmationReceipt.launchWindowConfirmationStatus,
      goLiveHoldStatus: launchWindowConfirmationReceipt.goLiveHoldStatus,
      goLiveAuthorizationReceiptStatus: launchWindowConfirmationReceipt.goLiveAuthorizationReceiptStatus,
      goLiveAuthorizationStatus: launchWindowConfirmationReceipt.goLiveAuthorizationStatus,
      launchWindowStatus: launchWindowConfirmationReceipt.launchWindowStatus,
      safeLaunchWindowStatus: launchWindowConfirmationReceipt.safeLaunchWindowStatus,
      launchWindowConfirmationReceiptCheckedCount: launchWindowConfirmationReceipt.counts.launchWindowConfirmationReceiptCheckedCount,
      launchWindowConfirmationReceiptMutationCount: launchWindowConfirmationReceipt.counts.launchWindowConfirmationReceiptMutationCount,
      launchWindowConfirmationConfirmedCount: launchWindowConfirmationReceipt.counts.launchWindowConfirmationConfirmedCount,
      goLiveHoldReadyCount: launchWindowConfirmationReceipt.counts.goLiveHoldReadyCount,
      externalCallsZero: launchWindowConfirmationReceipt.externalCalls === 0,
      safeDigest: launchWindowConfirmationReceipt.safeDigest
    },
    counts: {
      ...launchWindowConfirmationReceipt.counts,
      goLiveHoldReleaseAuthorizationReceiptCheckedCount: 1,
      goLiveHoldReleaseAuthorizationReceiptMutationCount: 0,
      goLiveHoldReleaseAuthorizationRowCount: goLiveHoldReleaseAuthorizationRows.length,
      goLiveHoldReleaseAuthorizationAuthorizedCount: goLiveHoldReleaseAuthorizationRows.filter((row) => row.complete).length,
      launchApprovalRowCount: launchApprovalRows.length,
      launchApprovalReadyCount: launchApprovalRows.filter((row) => row.complete).length
    },
    externalCalls: 0
  };
}

function createMockReviewQaHandoffCertifiedReleaseLaunchApprovalReceipt(
  filters: ProviderWebhookReviewClosureReportFilters
): ProviderWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceipt {
  const goLiveHoldReleaseAuthorizationReceipt = createMockReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceipt(filters);
  const launchApprovalReceiptReady = mockCertifiedReleaseLaunchApprovalReceiptReady(goLiveHoldReleaseAuthorizationReceipt);
  const launchApprovalReceiptStatus = mockCertifiedReleaseLaunchApprovalReceiptStatus(goLiveHoldReleaseAuthorizationReceipt, launchApprovalReceiptReady);
  const noExecutionGuardStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceipt["noExecutionGuardStatus"] = "retained";
  const safeDigestValue = `sha256:mockqahandoffcertifiedreleaselaunchapprovalreceipt-${safeDigest(`${goLiveHoldReleaseAuthorizationReceipt.goLiveHoldReleaseAuthorizationReceiptDigest}:${launchApprovalReceiptStatus}:${noExecutionGuardStatus}`)}`;
  const noExecutionGuardRows = mockCertifiedReleaseLaunchApprovalReceiptRows([
    ["go_live_hold_release_authorized", "Go-live hold release authorization remains authorized", goLiveHoldReleaseAuthorizationReceipt.goLiveHoldReleaseAuthorizationReceiptDigest, goLiveHoldReleaseAuthorizationReceipt.counts.goLiveHoldReleaseAuthorizationReceiptCheckedCount, goLiveHoldReleaseAuthorizationReceipt.goLiveHoldReleaseAuthorizationStatus === "authorized"],
    ["launch_approval_receipt_issued", "Launch approval receipt issued", safeDigestValue, 1, launchApprovalReceiptStatus === "issued"],
    ["no_execution_guard_retained", "No execution guard retained", goLiveHoldReleaseAuthorizationReceipt.safeDigest, 1, noExecutionGuardStatus === "retained"],
    ["launch_approval_ready", "Launch approval remains ready", goLiveHoldReleaseAuthorizationReceipt.goLiveHoldReleaseAuthorizationReceiptDigest, goLiveHoldReleaseAuthorizationReceipt.counts.launchApprovalReadyCount, goLiveHoldReleaseAuthorizationReceipt.launchApprovalStatus === "ready"],
    ["external_calls_zero", "External calls zero", goLiveHoldReleaseAuthorizationReceipt.safeDigest, 0, goLiveHoldReleaseAuthorizationReceipt.externalCalls === 0],
    ["no_state_mutation", "No launch approval receipt state mutation", goLiveHoldReleaseAuthorizationReceipt.safeDigest, 0, goLiveHoldReleaseAuthorizationReceipt.counts.goLiveHoldReleaseAuthorizationReceiptMutationCount === 0],
    ["safe_digest_chain", "Launch approval receipt safe digest chain", safeDigestValue, 24, mockCertifiedReleaseLaunchApprovalReceiptDigestLinksSafe(goLiveHoldReleaseAuthorizationReceipt, safeDigestValue)]
  ], launchApprovalReceiptReady, launchApprovalReceiptStatus, noExecutionGuardStatus, goLiveHoldReleaseAuthorizationReceipt);

  return {
    ...goLiveHoldReleaseAuthorizationReceipt,
    receiptKind: "qa-handoff-locked-archive-certified-release-launch-approval-receipt",
    launchApprovalReceiptStatus,
    noExecutionGuardStatus,
    releaseDecision: launchApprovalReceiptReady ? goLiveHoldReleaseAuthorizationReceipt.releaseDecision : "no_go",
    goNoGoDecision: launchApprovalReceiptReady ? goLiveHoldReleaseAuthorizationReceipt.goNoGoDecision : "no_go",
    safeFilename: "provider-webhook-review-qa-handoff-certified-release-launch-approval-receipt.json",
    safeDigest: safeDigestValue,
    launchApprovalReceiptDigest: safeDigestValue,
    noExecutionGuardRows,
    inheritedGoLiveHoldReleaseAuthorizationSummary: {
      goLiveHoldReleaseAuthorizationStatus: goLiveHoldReleaseAuthorizationReceipt.goLiveHoldReleaseAuthorizationStatus,
      launchApprovalStatus: goLiveHoldReleaseAuthorizationReceipt.launchApprovalStatus,
      goLiveHoldReleaseAuthorizationReceiptCheckedCount: goLiveHoldReleaseAuthorizationReceipt.counts.goLiveHoldReleaseAuthorizationReceiptCheckedCount,
      goLiveHoldReleaseAuthorizationReceiptMutationCount: goLiveHoldReleaseAuthorizationReceipt.counts.goLiveHoldReleaseAuthorizationReceiptMutationCount,
      goLiveHoldReleaseAuthorizationAuthorizedCount: goLiveHoldReleaseAuthorizationReceipt.counts.goLiveHoldReleaseAuthorizationAuthorizedCount,
      launchApprovalRowCount: goLiveHoldReleaseAuthorizationReceipt.counts.launchApprovalRowCount,
      launchApprovalReadyCount: goLiveHoldReleaseAuthorizationReceipt.counts.launchApprovalReadyCount,
      externalCallsZero: goLiveHoldReleaseAuthorizationReceipt.externalCalls === 0,
      safeDigest: goLiveHoldReleaseAuthorizationReceipt.safeDigest
    },
    counts: {
      ...goLiveHoldReleaseAuthorizationReceipt.counts,
      launchApprovalReceiptCheckedCount: 1,
      launchApprovalReceiptMutationCount: 0,
      launchApprovalReceiptIssuedCount: noExecutionGuardRows.filter((row) => row.complete).length,
      noExecutionGuardRowCount: noExecutionGuardRows.length,
      noExecutionGuardRetainedCount: noExecutionGuardRows.filter((row) => row.noExecutionGuardStatus === "retained").length
    },
    externalCalls: 0
  };
}

function createMockReviewQaHandoffCertifiedReleaseNoExecutionLockReceipt(
  filters: ProviderWebhookReviewClosureReportFilters
): ProviderWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceipt {
  const launchApprovalReceipt = createMockReviewQaHandoffCertifiedReleaseLaunchApprovalReceipt(filters);
  const noExecutionLockReady = mockCertifiedReleaseNoExecutionLockReceiptReady(launchApprovalReceipt);
  const noExecutionLockReceiptStatus = mockCertifiedReleaseNoExecutionLockReceiptStatus(launchApprovalReceipt, noExecutionLockReady);
  const noExecutionLockStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceipt["noExecutionLockStatus"] = noExecutionLockReady ? "locked" : "incomplete";
  const launchApprovalArchiveStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceipt["launchApprovalArchiveStatus"] = noExecutionLockReady ? "retained" : "incomplete";
  const tenantScopeStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceipt["tenantScopeStatus"] = "tenant_scoped";
  const providerOutboundStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceipt["providerOutboundStatus"] = "absent";
  const externalNotificationStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceipt["externalNotificationStatus"] = "absent";
  const aiCallStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceipt["aiCallStatus"] = "absent";
  const safeDigestValue = `sha256:mockqahandoffcertifiedreleasenoexecutionlockreceipt-${safeDigest(`${launchApprovalReceipt.launchApprovalReceiptDigest}:${noExecutionLockReceiptStatus}:${noExecutionLockStatus}`)}`;
  const noExecutionLockRows = mockCertifiedReleaseNoExecutionLockReceiptRows([
    ["launch_approval_receipt_archived", "Launch approval receipt remains archived", launchApprovalReceipt.launchApprovalReceiptDigest, 1, launchApprovalReceipt.launchApprovalReceiptStatus === "issued" && launchApprovalReceipt.noExecutionGuardStatus === "retained"],
    ["no_execution_lock_retained", "No execution lock retained", safeDigestValue, 0, launchApprovalReceipt.executionMode === "no_op"],
    ["no_mutation_lock_retained", "No launch approval lock mutation", launchApprovalReceipt.safeDigest, launchApprovalReceipt.counts.launchApprovalReceiptMutationCount, launchApprovalReceipt.counts.launchApprovalReceiptMutationCount === 0],
    ["provider_outbound_absent", "Provider outbound absent", launchApprovalReceipt.safeDigest, 0, true],
    ["external_notification_absent", "External notification absent", launchApprovalReceipt.safeDigest, 0, true],
    ["ai_call_absent", "AI call absent", launchApprovalReceipt.safeDigest, 0, true],
    ["tenant_scope_retained", "Tenant scope retained", launchApprovalReceipt.safeDigest, 1, tenantScopeStatus === "tenant_scoped"],
    ["digest_continuity_confirmed", "No-execution lock receipt safe digest continuity", safeDigestValue, 25, mockCertifiedReleaseNoExecutionLockReceiptDigestLinksSafe(launchApprovalReceipt, safeDigestValue)]
  ], noExecutionLockReady, noExecutionLockReceiptStatus, noExecutionLockStatus, launchApprovalArchiveStatus, tenantScopeStatus, providerOutboundStatus, externalNotificationStatus, aiCallStatus, launchApprovalReceipt);

  return {
    ...launchApprovalReceipt,
    receiptKind: "qa-handoff-locked-archive-certified-release-launch-approval-no-execution-lock-receipt",
    noExecutionLockReceiptStatus,
    noExecutionLockStatus,
    launchApprovalArchiveStatus,
    tenantScopeStatus,
    providerOutboundStatus,
    externalNotificationStatus,
    aiCallStatus,
    releaseDecision: noExecutionLockReady ? launchApprovalReceipt.releaseDecision : "no_go",
    goNoGoDecision: noExecutionLockReady ? launchApprovalReceipt.goNoGoDecision : "no_go",
    safeFilename: "provider-webhook-review-qa-handoff-certified-release-launch-approval-no-execution-lock-receipt.json",
    safeDigest: safeDigestValue,
    noExecutionLockReceiptDigest: safeDigestValue,
    noExecutionLockRows,
    inheritedLaunchApprovalReceiptSummary: {
      launchApprovalReceiptStatus: launchApprovalReceipt.launchApprovalReceiptStatus,
      noExecutionGuardStatus: launchApprovalReceipt.noExecutionGuardStatus,
      launchApprovalStatus: launchApprovalReceipt.launchApprovalStatus,
      launchApprovalReceiptCheckedCount: launchApprovalReceipt.counts.launchApprovalReceiptCheckedCount,
      launchApprovalReceiptMutationCount: launchApprovalReceipt.counts.launchApprovalReceiptMutationCount,
      launchApprovalReceiptIssuedCount: launchApprovalReceipt.counts.launchApprovalReceiptIssuedCount,
      noExecutionGuardRetainedCount: launchApprovalReceipt.counts.noExecutionGuardRetainedCount,
      externalCallsZero: launchApprovalReceipt.externalCalls === 0,
      safeDigest: launchApprovalReceipt.safeDigest,
      launchApprovalReceiptDigest: launchApprovalReceipt.launchApprovalReceiptDigest
    },
    counts: {
      ...launchApprovalReceipt.counts,
      noExecutionLockReceiptCheckedCount: 1,
      noExecutionLockReceiptMutationCount: 0,
      noExecutionLockRowCount: noExecutionLockRows.length,
      noExecutionLockPassedCount: noExecutionLockRows.filter((row) => row.complete).length,
      executionAttemptCount: 0,
      providerOutboundCallCount: 0,
      externalNotificationSendCount: 0,
      aiCallCount: 0,
      tenantScopeCheckedCount: tenantScopeStatus === "tenant_scoped" ? 1 : 0,
      digestContinuityCheckedCount: noExecutionLockRows.some((row) => row.key === "digest_continuity_confirmed" && row.complete) ? 1 : 0,
      launchApprovalArchiveRetainedCount: launchApprovalArchiveStatus === "retained" ? 1 : 0
    },
    externalCalls: 0
  };
}

function mockCertifiedReleaseGoLiveHoldReleaseAuthorizationReceiptReady(
  launchWindowConfirmationReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceipt
) {
  return launchWindowConfirmationReceipt.launchWindowConfirmationStatus === "confirmed" &&
    launchWindowConfirmationReceipt.goLiveHoldStatus === "ready" &&
    launchWindowConfirmationReceipt.goLiveAuthorizationReceiptStatus === "issued" &&
    launchWindowConfirmationReceipt.goLiveAuthorizationStatus === "ready" &&
    launchWindowConfirmationReceipt.launchWindowStatus === "ready" &&
    launchWindowConfirmationReceipt.safeLaunchWindowStatus === "ready" &&
    launchWindowConfirmationReceipt.operatorCommandReceiptStatus === "issued" &&
    launchWindowConfirmationReceipt.operatorCommandStatus === "ready" &&
    launchWindowConfirmationReceipt.cutoverChecklistStatus === "verified" &&
    launchWindowConfirmationReceipt.controlRoomStatus === "ready" &&
    launchWindowConfirmationReceipt.cutoverReadinessStatus === "ready" &&
    launchWindowConfirmationReceipt.rollbackRehearsalStatus === "verified" &&
    launchWindowConfirmationReceipt.recoveryReadinessStatus === "ready" &&
    launchWindowConfirmationReceipt.rollbackReadinessStatus === "ready" &&
    launchWindowConfirmationReceipt.freezeAuditStatus === "recorded" &&
    launchWindowConfirmationReceipt.freezeStatus === "frozen" &&
    launchWindowConfirmationReceipt.certificateStatus === "issued" &&
    launchWindowConfirmationReceipt.finalReadinessStatus === "ready" &&
    launchWindowConfirmationReceipt.ledgerStatus === "recorded" &&
    launchWindowConfirmationReceipt.dryRunStatus === "passed" &&
    launchWindowConfirmationReceipt.executionMode === "no_op" &&
    launchWindowConfirmationReceipt.acceptanceStatus === "acknowledged" &&
    launchWindowConfirmationReceipt.handoffStatus === "ready" &&
    launchWindowConfirmationReceipt.releaseDecision === "go" &&
    launchWindowConfirmationReceipt.goNoGoDecision === "go" &&
    launchWindowConfirmationReceipt.packetStatus === "issued" &&
    launchWindowConfirmationReceipt.receiptStatus === "issued" &&
    launchWindowConfirmationReceipt.gateStatus === "ready" &&
    launchWindowConfirmationReceipt.launchWindowConfirmationRows.every((row) => row.complete) &&
    launchWindowConfirmationReceipt.goLiveHoldRows.every((row) => row.complete) &&
    launchWindowConfirmationReceipt.counts.launchWindowConfirmationReceiptMutationCount === 0 &&
    launchWindowConfirmationReceipt.externalCalls === 0;
}

function mockCertifiedReleaseGoLiveHoldReleaseAuthorizationStatus(
  launchWindowConfirmationReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceipt,
  goLiveHoldReleaseAuthorizationReady: boolean
): ProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceipt["goLiveHoldReleaseAuthorizationStatus"] {
  if (goLiveHoldReleaseAuthorizationReady) return "authorized";
  if (launchWindowConfirmationReceipt.launchWindowConfirmationStatus === "blocked" || launchWindowConfirmationReceipt.releaseDecision !== "go" || launchWindowConfirmationReceipt.goNoGoDecision !== "go") return "blocked";
  return "incomplete";
}

function mockCertifiedReleaseGoLiveHoldReleaseAuthorizationRows(
  rows: Array<[
    ProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceipt["goLiveHoldReleaseAuthorizationRows"][number]["key"],
    string,
    string,
    number,
    boolean
  ]>,
  goLiveHoldReleaseAuthorizationReady: boolean,
  goLiveHoldReleaseAuthorizationStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceipt["goLiveHoldReleaseAuthorizationStatus"],
  launchApprovalStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceipt["launchApprovalStatus"],
  launchWindowConfirmationReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceipt
): ProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceipt["goLiveHoldReleaseAuthorizationRows"] {
  return rows.map(([key, label, rowDigest, checkedCount, complete]) => ({
    key,
    label,
    goLiveHoldReleaseAuthorizationStatus: complete && goLiveHoldReleaseAuthorizationReady ? "authorized" : goLiveHoldReleaseAuthorizationStatus,
    launchApprovalStatus: complete && goLiveHoldReleaseAuthorizationReady ? "ready" : launchApprovalStatus,
    launchWindowConfirmationStatus: complete && goLiveHoldReleaseAuthorizationReady ? "confirmed" : launchWindowConfirmationReceipt.launchWindowConfirmationStatus,
    goLiveHoldStatus: complete && goLiveHoldReleaseAuthorizationReady ? "ready" : launchWindowConfirmationReceipt.goLiveHoldStatus,
    goLiveAuthorizationReceiptStatus: complete && goLiveHoldReleaseAuthorizationReady ? "issued" : launchWindowConfirmationReceipt.goLiveAuthorizationReceiptStatus,
    goLiveAuthorizationStatus: complete && goLiveHoldReleaseAuthorizationReady ? "ready" : launchWindowConfirmationReceipt.goLiveAuthorizationStatus,
    launchWindowStatus: complete && goLiveHoldReleaseAuthorizationReady ? "ready" : launchWindowConfirmationReceipt.launchWindowStatus,
    safeLaunchWindowStatus: complete && goLiveHoldReleaseAuthorizationReady ? "ready" : launchWindowConfirmationReceipt.safeLaunchWindowStatus,
    operatorCommandReceiptStatus: complete && goLiveHoldReleaseAuthorizationReady ? "issued" : launchWindowConfirmationReceipt.operatorCommandReceiptStatus,
    operatorCommandStatus: complete && goLiveHoldReleaseAuthorizationReady ? "ready" : launchWindowConfirmationReceipt.operatorCommandStatus,
    safeDigest: rowDigest,
    checkedCount,
    complete: complete && goLiveHoldReleaseAuthorizationReady
  }));
}

function mockCertifiedReleaseGoLiveHoldReleaseAuthorizationReceiptDigestLinksSafe(
  launchWindowConfirmationReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceipt,
  goLiveHoldReleaseAuthorizationReceiptDigest: string
) {
  return [
    goLiveHoldReleaseAuthorizationReceiptDigest,
    launchWindowConfirmationReceipt.launchWindowConfirmationReceiptDigest,
    launchWindowConfirmationReceipt.goLiveAuthorizationReceiptDigest,
    launchWindowConfirmationReceipt.operatorCommandReceiptDigest,
    launchWindowConfirmationReceipt.cutoverChecklistReceiptDigest,
    launchWindowConfirmationReceipt.controlRoomPacketDigest,
    launchWindowConfirmationReceipt.rollbackRehearsalReceiptDigest,
    launchWindowConfirmationReceipt.freezeAuditRegisterDigest,
    launchWindowConfirmationReceipt.finalReadinessCertificateDigest,
    launchWindowConfirmationReceipt.dryRunResultLedgerDigest,
    launchWindowConfirmationReceipt.noopExecutionDryRunDigest,
    launchWindowConfirmationReceipt.acceptanceRecordDigest,
    launchWindowConfirmationReceipt.handoffPacketDigest,
    launchWindowConfirmationReceipt.decisionReceiptDigest,
    launchWindowConfirmationReceipt.releaseGateDigest,
    launchWindowConfirmationReceipt.reconciliationDigest,
    launchWindowConfirmationReceipt.attestationAuditDigest,
    launchWindowConfirmationReceipt.closureLedgerDigest,
    launchWindowConfirmationReceipt.certificationDigest,
    launchWindowConfirmationReceipt.verificationDigest,
    launchWindowConfirmationReceipt.releaseEvidenceDigest,
    launchWindowConfirmationReceipt.safeDigest
  ].every((value) => /^sha256:[a-z0-9-]+$/i.test(value));
}

function mockCertifiedReleaseLaunchApprovalReceiptReady(
  goLiveHoldReleaseAuthorizationReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceipt
) {
  return goLiveHoldReleaseAuthorizationReceipt.goLiveHoldReleaseAuthorizationStatus === "authorized" &&
    goLiveHoldReleaseAuthorizationReceipt.launchApprovalStatus === "ready" &&
    goLiveHoldReleaseAuthorizationReceipt.launchWindowConfirmationStatus === "confirmed" &&
    goLiveHoldReleaseAuthorizationReceipt.goLiveHoldStatus === "ready" &&
    goLiveHoldReleaseAuthorizationReceipt.goLiveAuthorizationReceiptStatus === "issued" &&
    goLiveHoldReleaseAuthorizationReceipt.goLiveAuthorizationStatus === "ready" &&
    goLiveHoldReleaseAuthorizationReceipt.launchWindowStatus === "ready" &&
    goLiveHoldReleaseAuthorizationReceipt.safeLaunchWindowStatus === "ready" &&
    goLiveHoldReleaseAuthorizationReceipt.operatorCommandReceiptStatus === "issued" &&
    goLiveHoldReleaseAuthorizationReceipt.operatorCommandStatus === "ready" &&
    goLiveHoldReleaseAuthorizationReceipt.cutoverChecklistStatus === "verified" &&
    goLiveHoldReleaseAuthorizationReceipt.controlRoomStatus === "ready" &&
    goLiveHoldReleaseAuthorizationReceipt.cutoverReadinessStatus === "ready" &&
    goLiveHoldReleaseAuthorizationReceipt.rollbackRehearsalStatus === "verified" &&
    goLiveHoldReleaseAuthorizationReceipt.recoveryReadinessStatus === "ready" &&
    goLiveHoldReleaseAuthorizationReceipt.rollbackReadinessStatus === "ready" &&
    goLiveHoldReleaseAuthorizationReceipt.freezeAuditStatus === "recorded" &&
    goLiveHoldReleaseAuthorizationReceipt.freezeStatus === "frozen" &&
    goLiveHoldReleaseAuthorizationReceipt.certificateStatus === "issued" &&
    goLiveHoldReleaseAuthorizationReceipt.finalReadinessStatus === "ready" &&
    goLiveHoldReleaseAuthorizationReceipt.ledgerStatus === "recorded" &&
    goLiveHoldReleaseAuthorizationReceipt.dryRunStatus === "passed" &&
    goLiveHoldReleaseAuthorizationReceipt.executionMode === "no_op" &&
    goLiveHoldReleaseAuthorizationReceipt.acceptanceStatus === "acknowledged" &&
    goLiveHoldReleaseAuthorizationReceipt.handoffStatus === "ready" &&
    goLiveHoldReleaseAuthorizationReceipt.releaseDecision === "go" &&
    goLiveHoldReleaseAuthorizationReceipt.goNoGoDecision === "go" &&
    goLiveHoldReleaseAuthorizationReceipt.packetStatus === "issued" &&
    goLiveHoldReleaseAuthorizationReceipt.receiptStatus === "issued" &&
    goLiveHoldReleaseAuthorizationReceipt.gateStatus === "ready" &&
    goLiveHoldReleaseAuthorizationReceipt.releaseReadinessStatus === "ready_for_release" &&
    (goLiveHoldReleaseAuthorizationReceipt.reconciliationStatus === "complete" || goLiveHoldReleaseAuthorizationReceipt.reconciliationStatus === "aligned") &&
    goLiveHoldReleaseAuthorizationReceipt.attestationStatus === "complete" &&
    goLiveHoldReleaseAuthorizationReceipt.ledgerStatusFromClosure === "certified_release_closed" &&
    goLiveHoldReleaseAuthorizationReceipt.certificationStatus === "certified" &&
    goLiveHoldReleaseAuthorizationReceipt.verificationStatus === "verified" &&
    goLiveHoldReleaseAuthorizationReceipt.digestChainStatus === "confirmed" &&
    goLiveHoldReleaseAuthorizationReceipt.launchApprovalRows.every((row) => row.complete && row.launchApprovalStatus === "ready") &&
    goLiveHoldReleaseAuthorizationReceipt.goLiveHoldReleaseAuthorizationRows.every((row) => row.complete && row.goLiveHoldReleaseAuthorizationStatus === "authorized") &&
    goLiveHoldReleaseAuthorizationReceipt.counts.goLiveHoldReleaseAuthorizationReceiptMutationCount === 0 &&
    goLiveHoldReleaseAuthorizationReceipt.externalCalls === 0;
}

function mockCertifiedReleaseLaunchApprovalReceiptStatus(
  goLiveHoldReleaseAuthorizationReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceipt,
  launchApprovalReceiptReady: boolean
): ProviderWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceipt["launchApprovalReceiptStatus"] {
  if (launchApprovalReceiptReady) return "issued";
  if (goLiveHoldReleaseAuthorizationReceipt.goLiveHoldReleaseAuthorizationStatus === "blocked" || goLiveHoldReleaseAuthorizationReceipt.releaseDecision !== "go" || goLiveHoldReleaseAuthorizationReceipt.goNoGoDecision !== "go") return "blocked";
  return "incomplete";
}

function mockCertifiedReleaseLaunchApprovalReceiptRows(
  rows: Array<[
    ProviderWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceipt["noExecutionGuardRows"][number]["key"],
    string,
    string,
    number,
    boolean
  ]>,
  launchApprovalReceiptReady: boolean,
  launchApprovalReceiptStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceipt["launchApprovalReceiptStatus"],
  noExecutionGuardStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceipt["noExecutionGuardStatus"],
  goLiveHoldReleaseAuthorizationReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceipt
): ProviderWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceipt["noExecutionGuardRows"] {
  return rows.map(([key, label, rowDigest, checkedCount, complete]) => ({
    key,
    label,
    goLiveHoldReleaseAuthorizationStatus: complete && launchApprovalReceiptReady ? "authorized" : goLiveHoldReleaseAuthorizationReceipt.goLiveHoldReleaseAuthorizationStatus,
    launchApprovalStatus: complete && launchApprovalReceiptReady ? "ready" : goLiveHoldReleaseAuthorizationReceipt.launchApprovalStatus,
    launchApprovalReceiptStatus: complete && launchApprovalReceiptReady ? "issued" : launchApprovalReceiptStatus,
    noExecutionGuardStatus: complete && launchApprovalReceiptReady ? "retained" : noExecutionGuardStatus,
    launchWindowConfirmationStatus: complete && launchApprovalReceiptReady ? "confirmed" : goLiveHoldReleaseAuthorizationReceipt.launchWindowConfirmationStatus,
    goLiveHoldStatus: complete && launchApprovalReceiptReady ? "ready" : goLiveHoldReleaseAuthorizationReceipt.goLiveHoldStatus,
    goLiveAuthorizationReceiptStatus: complete && launchApprovalReceiptReady ? "issued" : goLiveHoldReleaseAuthorizationReceipt.goLiveAuthorizationReceiptStatus,
    goLiveAuthorizationStatus: complete && launchApprovalReceiptReady ? "ready" : goLiveHoldReleaseAuthorizationReceipt.goLiveAuthorizationStatus,
    launchWindowStatus: complete && launchApprovalReceiptReady ? "ready" : goLiveHoldReleaseAuthorizationReceipt.launchWindowStatus,
    safeLaunchWindowStatus: complete && launchApprovalReceiptReady ? "ready" : goLiveHoldReleaseAuthorizationReceipt.safeLaunchWindowStatus,
    operatorCommandReceiptStatus: complete && launchApprovalReceiptReady ? "issued" : goLiveHoldReleaseAuthorizationReceipt.operatorCommandReceiptStatus,
    operatorCommandStatus: complete && launchApprovalReceiptReady ? "ready" : goLiveHoldReleaseAuthorizationReceipt.operatorCommandStatus,
    safeDigest: rowDigest,
    checkedCount,
    complete: complete && launchApprovalReceiptReady
  }));
}

function mockCertifiedReleaseLaunchApprovalReceiptDigestLinksSafe(
  goLiveHoldReleaseAuthorizationReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceipt,
  launchApprovalReceiptDigest: string
) {
  return [
    launchApprovalReceiptDigest,
    goLiveHoldReleaseAuthorizationReceipt.goLiveHoldReleaseAuthorizationReceiptDigest,
    goLiveHoldReleaseAuthorizationReceipt.launchWindowConfirmationReceiptDigest,
    goLiveHoldReleaseAuthorizationReceipt.goLiveAuthorizationReceiptDigest,
    goLiveHoldReleaseAuthorizationReceipt.operatorCommandReceiptDigest,
    goLiveHoldReleaseAuthorizationReceipt.cutoverChecklistReceiptDigest,
    goLiveHoldReleaseAuthorizationReceipt.controlRoomPacketDigest,
    goLiveHoldReleaseAuthorizationReceipt.rollbackRehearsalReceiptDigest,
    goLiveHoldReleaseAuthorizationReceipt.freezeAuditRegisterDigest,
    goLiveHoldReleaseAuthorizationReceipt.finalReadinessCertificateDigest,
    goLiveHoldReleaseAuthorizationReceipt.dryRunResultLedgerDigest,
    goLiveHoldReleaseAuthorizationReceipt.noopExecutionDryRunDigest,
    goLiveHoldReleaseAuthorizationReceipt.acceptanceRecordDigest,
    goLiveHoldReleaseAuthorizationReceipt.handoffPacketDigest,
    goLiveHoldReleaseAuthorizationReceipt.decisionReceiptDigest,
    goLiveHoldReleaseAuthorizationReceipt.releaseGateDigest,
    goLiveHoldReleaseAuthorizationReceipt.reconciliationDigest,
    goLiveHoldReleaseAuthorizationReceipt.attestationAuditDigest,
    goLiveHoldReleaseAuthorizationReceipt.closureLedgerDigest,
    goLiveHoldReleaseAuthorizationReceipt.certificationDigest,
    goLiveHoldReleaseAuthorizationReceipt.verificationDigest,
    goLiveHoldReleaseAuthorizationReceipt.releaseEvidenceDigest,
    goLiveHoldReleaseAuthorizationReceipt.safeDigest
  ].every((value) => /^sha256:[a-z0-9-]+$/i.test(value));
}

function mockCertifiedReleaseNoExecutionLockReceiptReady(
  launchApprovalReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceipt
) {
  return launchApprovalReceipt.launchApprovalReceiptStatus === "issued" &&
    launchApprovalReceipt.noExecutionGuardStatus === "retained" &&
    launchApprovalReceipt.launchApprovalStatus === "ready" &&
    launchApprovalReceipt.goLiveHoldReleaseAuthorizationStatus === "authorized" &&
    launchApprovalReceipt.launchWindowConfirmationStatus === "confirmed" &&
    launchApprovalReceipt.goLiveHoldStatus === "ready" &&
    launchApprovalReceipt.goLiveAuthorizationReceiptStatus === "issued" &&
    launchApprovalReceipt.goLiveAuthorizationStatus === "ready" &&
    launchApprovalReceipt.launchWindowStatus === "ready" &&
    launchApprovalReceipt.safeLaunchWindowStatus === "ready" &&
    launchApprovalReceipt.executionMode === "no_op" &&
    launchApprovalReceipt.releaseDecision === "go" &&
    launchApprovalReceipt.goNoGoDecision === "go" &&
    launchApprovalReceipt.gateStatus === "ready" &&
    launchApprovalReceipt.releaseReadinessStatus === "ready_for_release" &&
    launchApprovalReceipt.certificationStatus === "certified" &&
    launchApprovalReceipt.verificationStatus === "verified" &&
    launchApprovalReceipt.digestChainStatus === "confirmed" &&
    launchApprovalReceipt.noExecutionGuardRows.every((row) => row.complete && row.noExecutionGuardStatus === "retained") &&
    launchApprovalReceipt.counts.launchApprovalReceiptMutationCount === 0 &&
    launchApprovalReceipt.externalCalls === 0;
}

function mockCertifiedReleaseNoExecutionLockReceiptStatus(
  launchApprovalReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceipt,
  noExecutionLockReady: boolean
): ProviderWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceipt["noExecutionLockReceiptStatus"] {
  if (noExecutionLockReady) return "issued";
  if (launchApprovalReceipt.launchApprovalReceiptStatus === "blocked" || launchApprovalReceipt.releaseDecision !== "go" || launchApprovalReceipt.goNoGoDecision !== "go") return "blocked";
  return "incomplete";
}

function mockCertifiedReleaseNoExecutionLockReceiptRows(
  rows: Array<[
    ProviderWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceipt["noExecutionLockRows"][number]["key"],
    string,
    string,
    number,
    boolean
  ]>,
  noExecutionLockReady: boolean,
  noExecutionLockReceiptStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceipt["noExecutionLockReceiptStatus"],
  noExecutionLockStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceipt["noExecutionLockStatus"],
  launchApprovalArchiveStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceipt["launchApprovalArchiveStatus"],
  tenantScopeStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceipt["tenantScopeStatus"],
  providerOutboundStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceipt["providerOutboundStatus"],
  externalNotificationStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceipt["externalNotificationStatus"],
  aiCallStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceipt["aiCallStatus"],
  launchApprovalReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceipt
): ProviderWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceipt["noExecutionLockRows"] {
  return rows.map(([key, label, rowDigest, checkedCount, complete]) => ({
    key,
    label,
    goLiveHoldReleaseAuthorizationStatus: complete && noExecutionLockReady ? "authorized" : launchApprovalReceipt.goLiveHoldReleaseAuthorizationStatus,
    launchApprovalStatus: complete && noExecutionLockReady ? "ready" : launchApprovalReceipt.launchApprovalStatus,
    launchApprovalReceiptStatus: complete && noExecutionLockReady ? "issued" : launchApprovalReceipt.launchApprovalReceiptStatus,
    noExecutionGuardStatus: complete && noExecutionLockReady ? "retained" : launchApprovalReceipt.noExecutionGuardStatus,
    noExecutionLockReceiptStatus: complete && noExecutionLockReady ? "issued" : noExecutionLockReceiptStatus,
    noExecutionLockStatus: complete && noExecutionLockReady ? "locked" : noExecutionLockStatus,
    launchApprovalArchiveStatus: complete && noExecutionLockReady ? "retained" : launchApprovalArchiveStatus,
    tenantScopeStatus: complete && noExecutionLockReady ? "tenant_scoped" : tenantScopeStatus,
    providerOutboundStatus: complete && noExecutionLockReady ? "absent" : providerOutboundStatus,
    externalNotificationStatus: complete && noExecutionLockReady ? "absent" : externalNotificationStatus,
    aiCallStatus: complete && noExecutionLockReady ? "absent" : aiCallStatus,
    digestChainStatus: complete && noExecutionLockReady ? "confirmed" : launchApprovalReceipt.digestChainStatus,
    launchWindowConfirmationStatus: complete && noExecutionLockReady ? "confirmed" : launchApprovalReceipt.launchWindowConfirmationStatus,
    goLiveHoldStatus: complete && noExecutionLockReady ? "ready" : launchApprovalReceipt.goLiveHoldStatus,
    goLiveAuthorizationReceiptStatus: complete && noExecutionLockReady ? "issued" : launchApprovalReceipt.goLiveAuthorizationReceiptStatus,
    goLiveAuthorizationStatus: complete && noExecutionLockReady ? "ready" : launchApprovalReceipt.goLiveAuthorizationStatus,
    launchWindowStatus: complete && noExecutionLockReady ? "ready" : launchApprovalReceipt.launchWindowStatus,
    safeLaunchWindowStatus: complete && noExecutionLockReady ? "ready" : launchApprovalReceipt.safeLaunchWindowStatus,
    operatorCommandReceiptStatus: complete && noExecutionLockReady ? "issued" : launchApprovalReceipt.operatorCommandReceiptStatus,
    operatorCommandStatus: complete && noExecutionLockReady ? "ready" : launchApprovalReceipt.operatorCommandStatus,
    safeDigest: rowDigest,
    checkedCount,
    complete: complete && noExecutionLockReady
  }));
}

function mockCertifiedReleaseNoExecutionLockReceiptDigestLinksSafe(
  launchApprovalReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceipt,
  noExecutionLockReceiptDigest: string
) {
  return [
    noExecutionLockReceiptDigest,
    launchApprovalReceipt.launchApprovalReceiptDigest,
    launchApprovalReceipt.goLiveHoldReleaseAuthorizationReceiptDigest,
    launchApprovalReceipt.launchWindowConfirmationReceiptDigest,
    launchApprovalReceipt.goLiveAuthorizationReceiptDigest,
    launchApprovalReceipt.operatorCommandReceiptDigest,
    launchApprovalReceipt.cutoverChecklistReceiptDigest,
    launchApprovalReceipt.controlRoomPacketDigest,
    launchApprovalReceipt.rollbackRehearsalReceiptDigest,
    launchApprovalReceipt.freezeAuditRegisterDigest,
    launchApprovalReceipt.finalReadinessCertificateDigest,
    launchApprovalReceipt.dryRunResultLedgerDigest,
    launchApprovalReceipt.noopExecutionDryRunDigest,
    launchApprovalReceipt.acceptanceRecordDigest,
    launchApprovalReceipt.handoffPacketDigest,
    launchApprovalReceipt.decisionReceiptDigest,
    launchApprovalReceipt.releaseGateDigest,
    launchApprovalReceipt.reconciliationDigest,
    launchApprovalReceipt.attestationAuditDigest,
    launchApprovalReceipt.closureLedgerDigest,
    launchApprovalReceipt.certificationDigest,
    launchApprovalReceipt.verificationDigest,
    launchApprovalReceipt.releaseEvidenceDigest,
    launchApprovalReceipt.safeDigest
  ].every((value) => /^sha256:[a-z0-9-]+$/i.test(value));
}

function createMockReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacket(
  filters: ProviderWebhookReviewClosureReportFilters
): ProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacket {
  const noExecutionLockReceipt = createMockReviewQaHandoffCertifiedReleaseNoExecutionLockReceipt(filters);
  const operationsHandoffReady = mockCertifiedReleaseOperationsHandoffReadinessReady(noExecutionLockReceipt);
  const operationsHandoffReadinessStatus = mockCertifiedReleaseOperationsHandoffReadinessStatus(noExecutionLockReceipt, operationsHandoffReady);
  const operationsHandoffEvidencePacketStatus = operationsHandoffReady ? "issued" : operationsHandoffReadinessStatus === "blocked" ? "blocked" : "incomplete";
  const noExecutionEvidenceStatus = noExecutionLockReceipt.noExecutionLockStatus === "locked" && noExecutionLockReceipt.counts.executionAttemptCount === 0 ? "confirmed" : noExecutionLockReceipt.noExecutionLockStatus === "violated" ? "violated" : "incomplete";
  const launchApprovalLockStatus = noExecutionLockReceipt.noExecutionLockStatus === "locked" && noExecutionLockReceipt.launchApprovalArchiveStatus === "retained" ? "locked" : noExecutionLockReceipt.launchApprovalArchiveStatus === "missing" ? "missing" : "incomplete";
  const providerOutboundStatus = noExecutionLockReceipt.counts.providerOutboundCallCount === 0 ? noExecutionLockReceipt.providerOutboundStatus : "detected";
  const externalNotificationStatus = noExecutionLockReceipt.counts.externalNotificationSendCount === 0 ? noExecutionLockReceipt.externalNotificationStatus : "detected";
  const aiCallStatus = noExecutionLockReceipt.counts.aiCallCount === 0 ? noExecutionLockReceipt.aiCallStatus : "detected";
  const safeDigestValue = `sha256:mockqahandoffcertifiedreleaseoperationshandoffreadinesspacket-${safeDigest(`${noExecutionLockReceipt.noExecutionLockReceiptDigest}:${operationsHandoffReadinessStatus}:${operationsHandoffEvidencePacketStatus}`)}`;
  const safeFilenameValue = "provider-webhook-review-qa-handoff-certified-release-operations-handoff-readiness-no-execution-evidence-packet.json";
  const digestContinuityStatus = mockCertifiedReleaseOperationsHandoffDigestLinksSafe(noExecutionLockReceipt, safeDigestValue) ? "confirmed" : "broken";
  const operationsHandoffPrerequisiteRows = mockCertifiedReleaseOperationsHandoffEvidenceRows([
    ["no_execution_lock_receipt_issued", "No-execution lock receipt issued", noExecutionLockReceipt.noExecutionLockReceiptDigest, undefined, 1, noExecutionLockReceipt.noExecutionLockReceiptStatus === "issued"],
    ["launch_approval_lock_retained", "Launch approval lock retained", noExecutionLockReceipt.launchApprovalReceiptDigest, undefined, 1, launchApprovalLockStatus === "locked"],
    ["tenant_scope_confirmed", "Tenant scope confirmed", noExecutionLockReceipt.safeDigest, undefined, noExecutionLockReceipt.counts.tenantScopeCheckedCount, noExecutionLockReceipt.tenantScopeStatus === "tenant_scoped"],
    ["digest_continuity_confirmed", "Operations handoff safe digest continuity", safeDigestValue, undefined, noExecutionLockReceipt.counts.digestContinuityCheckedCount + 1, digestContinuityStatus === "confirmed"]
  ]);
  const operationsHandoffBlockerRows = mockCertifiedReleaseOperationsHandoffEvidenceRows([
    ["provider_outbound_absent", "Provider outbound absent", noExecutionLockReceipt.safeDigest, undefined, noExecutionLockReceipt.counts.providerOutboundCallCount, providerOutboundStatus === "absent"],
    ["external_notification_absent", "External notification absent", noExecutionLockReceipt.safeDigest, undefined, noExecutionLockReceipt.counts.externalNotificationSendCount, externalNotificationStatus === "absent"],
    ["ai_call_absent", "AI call absent", noExecutionLockReceipt.safeDigest, undefined, noExecutionLockReceipt.counts.aiCallCount, aiCallStatus === "absent"],
    ["execution_attempts_zero", "Execution attempts zero", noExecutionLockReceipt.safeDigest, undefined, noExecutionLockReceipt.counts.executionAttemptCount, noExecutionLockReceipt.counts.executionAttemptCount === 0]
  ]);
  const operationsHandoffEvidenceRows = mockCertifiedReleaseOperationsHandoffEvidenceRows([
    ["operations_handoff_packet_ready", "Operations handoff evidence packet ready", safeDigestValue, safeFilenameValue, 1, operationsHandoffReady],
    ["no_execution_evidence_confirmed", "No-execution evidence confirmed", noExecutionLockReceipt.noExecutionLockReceiptDigest, noExecutionLockReceipt.safeFilename, noExecutionLockReceipt.counts.noExecutionLockPassedCount, noExecutionEvidenceStatus === "confirmed"],
    ["safe_digest_filename_recorded", "Safe digest and filename recorded", safeDigestValue, safeFilenameValue, 2, /^sha256:[a-z0-9-]+$/i.test(safeDigestValue) && safeFilenameValue.endsWith(".json")],
    ["human_operations_handoff_ready", "Human operations handoff ready", safeDigestValue, safeFilenameValue, 1, operationsHandoffReady]
  ]);

  return {
    ...noExecutionLockReceipt,
    packetKind: "qa-handoff-locked-archive-certified-release-operations-handoff-readiness-no-execution-evidence-packet",
    operationsHandoffReadinessStatus,
    operationsHandoffEvidencePacketStatus,
    noExecutionEvidenceStatus,
    launchApprovalLockStatus,
    tenantScopeStatus: noExecutionLockReceipt.tenantScopeStatus,
    digestContinuityStatus,
    providerOutboundStatus,
    externalNotificationStatus,
    aiCallStatus,
    safeFilename: safeFilenameValue,
    safeDigest: safeDigestValue,
    operationsHandoffEvidencePacketDigest: safeDigestValue,
    operationsHandoffGeneratedAt: new Date().toISOString(),
    operationsHandoffPrerequisiteRows,
    operationsHandoffBlockerRows,
    operationsHandoffEvidenceRows,
    inheritedNoExecutionLockReceiptSummary: {
      noExecutionLockReceiptStatus: noExecutionLockReceipt.noExecutionLockReceiptStatus,
      noExecutionLockStatus: noExecutionLockReceipt.noExecutionLockStatus,
      launchApprovalArchiveStatus: noExecutionLockReceipt.launchApprovalArchiveStatus,
      tenantScopeStatus: noExecutionLockReceipt.tenantScopeStatus,
      providerOutboundStatus: noExecutionLockReceipt.providerOutboundStatus,
      externalNotificationStatus: noExecutionLockReceipt.externalNotificationStatus,
      aiCallStatus: noExecutionLockReceipt.aiCallStatus,
      noExecutionLockReceiptMutationCount: noExecutionLockReceipt.counts.noExecutionLockReceiptMutationCount,
      executionAttemptCount: noExecutionLockReceipt.counts.executionAttemptCount,
      providerOutboundCallCount: noExecutionLockReceipt.counts.providerOutboundCallCount,
      externalNotificationSendCount: noExecutionLockReceipt.counts.externalNotificationSendCount,
      aiCallCount: noExecutionLockReceipt.counts.aiCallCount,
      externalCallsZero: noExecutionLockReceipt.externalCalls === 0,
      safeDigest: noExecutionLockReceipt.safeDigest,
      safeFilename: noExecutionLockReceipt.safeFilename,
      noExecutionLockReceiptDigest: noExecutionLockReceipt.noExecutionLockReceiptDigest
    },
    counts: {
      ...noExecutionLockReceipt.counts,
      operationsHandoffReadinessCheckedCount: 1,
      operationsHandoffMutationCount: 0,
      operationsHandoffPrerequisiteCount: operationsHandoffPrerequisiteRows.length,
      operationsHandoffPrerequisitePassedCount: operationsHandoffPrerequisiteRows.filter((row) => row.complete).length,
      operationsHandoffBlockerCount: operationsHandoffBlockerRows.length,
      operationsHandoffBlockingCount: operationsHandoffBlockerRows.filter((row) => !row.complete).length,
      operationsHandoffEvidenceRowCount: operationsHandoffEvidenceRows.length,
      operationsHandoffEvidenceReadyCount: operationsHandoffEvidenceRows.filter((row) => row.complete).length
    },
    externalCalls: 0
  };
}

function createMockReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceReceipt(
  filters: ProviderWebhookReviewClosureReportFilters
): ProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceReceipt {
  const operationsHandoffReadinessPacket = createMockReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacket(filters);
  const operationsHandoffAcceptanceReady = mockCertifiedReleaseOperationsHandoffAcceptanceReady(operationsHandoffReadinessPacket);
  const operationsHandoffAcceptanceStatus = operationsHandoffAcceptanceReady ? "accepted" : operationsHandoffReadinessPacket.operationsHandoffReadinessStatus === "blocked" || operationsHandoffReadinessPacket.operationsHandoffEvidencePacketStatus === "blocked" ? "blocked" : "incomplete";
  const operationsCustodyStatus = operationsHandoffAcceptanceReady ? "accepted" : operationsHandoffAcceptanceStatus === "blocked" ? "blocked" : "incomplete";
  const safeDigestValue = `sha256:mockqahandoffcertifiedreleaseoperationshandoffacceptancereceipt-${safeDigest(`${operationsHandoffReadinessPacket.operationsHandoffEvidencePacketDigest}:${operationsHandoffAcceptanceStatus}:${operationsCustodyStatus}`)}`;
  const safeFilenameValue = "provider-webhook-review-qa-handoff-certified-release-operations-handoff-acceptance-receipt.json";
  const digestContinuityStatus = mockCertifiedReleaseOperationsHandoffAcceptanceDigestLinksSafe(operationsHandoffReadinessPacket, safeDigestValue) ? "confirmed" : "broken";
  const operationsHandoffAcceptanceRows = mockCertifiedReleaseOperationsHandoffEvidenceRows([
    ["operations_handoff_packet_issued", "Operations handoff evidence packet issued", operationsHandoffReadinessPacket.operationsHandoffEvidencePacketDigest, operationsHandoffReadinessPacket.safeFilename, 1, operationsHandoffReadinessPacket.operationsHandoffEvidencePacketStatus === "issued"],
    ["operations_handoff_readiness_confirmed", "Operations handoff readiness confirmed", operationsHandoffReadinessPacket.safeDigest, operationsHandoffReadinessPacket.safeFilename, operationsHandoffReadinessPacket.counts.operationsHandoffEvidenceReadyCount, operationsHandoffReadinessPacket.operationsHandoffReadinessStatus === "ready_for_handoff"],
    ["no_execution_evidence_confirmed", "No-execution evidence confirmed", operationsHandoffReadinessPacket.noExecutionLockReceiptDigest, operationsHandoffReadinessPacket.safeFilename, operationsHandoffReadinessPacket.counts.executionAttemptCount, operationsHandoffReadinessPacket.noExecutionEvidenceStatus === "confirmed"],
    ["operations_handoff_acceptance_receipt_issued", "Operations handoff acceptance receipt issued", safeDigestValue, safeFilenameValue, 1, operationsHandoffAcceptanceReady]
  ]);
  const operationsCustodyRows = mockCertifiedReleaseOperationsHandoffEvidenceRows([
    ["operations_custody_accepted", "Operations custody accepted", safeDigestValue, safeFilenameValue, 1, operationsCustodyStatus === "accepted"],
    ["tenant_scope_confirmed", "Tenant scope confirmed", operationsHandoffReadinessPacket.safeDigest, operationsHandoffReadinessPacket.safeFilename, operationsHandoffReadinessPacket.counts.tenantScopeCheckedCount, operationsHandoffReadinessPacket.tenantScopeStatus === "tenant_scoped"],
    ["digest_continuity_confirmed", "Operations handoff acceptance digest continuity", safeDigestValue, safeFilenameValue, operationsHandoffReadinessPacket.counts.digestContinuityCheckedCount + 2, digestContinuityStatus === "confirmed"],
    ["provider_outbound_absent", "Provider outbound absent", operationsHandoffReadinessPacket.safeDigest, operationsHandoffReadinessPacket.safeFilename, operationsHandoffReadinessPacket.counts.providerOutboundCallCount, operationsHandoffReadinessPacket.providerOutboundStatus === "absent"],
    ["external_notification_absent", "External notification absent", operationsHandoffReadinessPacket.safeDigest, operationsHandoffReadinessPacket.safeFilename, operationsHandoffReadinessPacket.counts.externalNotificationSendCount, operationsHandoffReadinessPacket.externalNotificationStatus === "absent"],
    ["ai_call_absent", "AI call absent", operationsHandoffReadinessPacket.safeDigest, operationsHandoffReadinessPacket.safeFilename, operationsHandoffReadinessPacket.counts.aiCallCount, operationsHandoffReadinessPacket.aiCallStatus === "absent"],
    ["execution_attempts_zero", "Execution attempts zero", operationsHandoffReadinessPacket.safeDigest, operationsHandoffReadinessPacket.safeFilename, operationsHandoffReadinessPacket.counts.executionAttemptCount, operationsHandoffReadinessPacket.counts.executionAttemptCount === 0]
  ]);

  return {
    ...operationsHandoffReadinessPacket,
    receiptKind: "qa-handoff-locked-archive-certified-release-operations-handoff-acceptance-receipt",
    operationsHandoffAcceptanceStatus,
    operationsCustodyStatus,
    digestContinuityStatus,
    safeFilename: safeFilenameValue,
    safeDigest: safeDigestValue,
    operationsHandoffAcceptanceReceiptDigest: safeDigestValue,
    operationsHandoffAcceptedAt: new Date().toISOString(),
    operationsHandoffAcceptanceRows,
    operationsCustodyRows,
    inheritedOperationsHandoffReadinessPacketSummary: {
      operationsHandoffReadinessStatus: operationsHandoffReadinessPacket.operationsHandoffReadinessStatus,
      operationsHandoffEvidencePacketStatus: operationsHandoffReadinessPacket.operationsHandoffEvidencePacketStatus,
      noExecutionEvidenceStatus: operationsHandoffReadinessPacket.noExecutionEvidenceStatus,
      launchApprovalLockStatus: operationsHandoffReadinessPacket.launchApprovalLockStatus,
      tenantScopeStatus: operationsHandoffReadinessPacket.tenantScopeStatus,
      digestContinuityStatus: operationsHandoffReadinessPacket.digestContinuityStatus,
      providerOutboundStatus: operationsHandoffReadinessPacket.providerOutboundStatus,
      externalNotificationStatus: operationsHandoffReadinessPacket.externalNotificationStatus,
      aiCallStatus: operationsHandoffReadinessPacket.aiCallStatus,
      operationsHandoffMutationCount: operationsHandoffReadinessPacket.counts.operationsHandoffMutationCount,
      executionAttemptCount: operationsHandoffReadinessPacket.counts.executionAttemptCount,
      providerOutboundCallCount: operationsHandoffReadinessPacket.counts.providerOutboundCallCount,
      externalNotificationSendCount: operationsHandoffReadinessPacket.counts.externalNotificationSendCount,
      aiCallCount: operationsHandoffReadinessPacket.counts.aiCallCount,
      externalCallsZero: operationsHandoffReadinessPacket.externalCalls === 0,
      safeDigest: operationsHandoffReadinessPacket.safeDigest,
      safeFilename: operationsHandoffReadinessPacket.safeFilename,
      operationsHandoffEvidencePacketDigest: operationsHandoffReadinessPacket.operationsHandoffEvidencePacketDigest
    },
    counts: {
      ...operationsHandoffReadinessPacket.counts,
      operationsHandoffAcceptanceCheckedCount: 1,
      operationsHandoffAcceptanceMutationCount: 0,
      operationsHandoffAcceptanceRowCount: operationsHandoffAcceptanceRows.length,
      operationsHandoffAcceptanceAcceptedCount: operationsHandoffAcceptanceRows.filter((row) => row.complete).length,
      operationsCustodyRowCount: operationsCustodyRows.length,
      operationsCustodyAcceptedCount: operationsCustodyRows.filter((row) => row.complete).length
    },
    externalCalls: 0
  };
}

function createMockReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedger(
  filters: ProviderWebhookReviewClosureReportFilters
): ProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedger {
  const operationsHandoffAcceptanceReceipt = createMockReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceReceipt(filters);
  const operationsCustodyMonitoringReady = mockCertifiedReleaseOperationsCustodyMonitoringReady(operationsHandoffAcceptanceReceipt);
  const operationsCustodyMonitoringStatus = operationsCustodyMonitoringReady ? "ready" : operationsHandoffAcceptanceReceipt.operationsHandoffAcceptanceStatus === "blocked" || operationsHandoffAcceptanceReceipt.operationsCustodyStatus === "blocked" ? "blocked" : "incomplete";
  const monitoringReadinessStatus = operationsCustodyMonitoringReady ? "ready" : operationsCustodyMonitoringStatus === "blocked" ? "blocked" : "incomplete";
  const noExecutionMonitoringStatus = operationsCustodyMonitoringReady ? "active" : operationsHandoffAcceptanceReceipt.counts.executionAttemptCount > 0 ? "violated" : "incomplete";
  const safeDigestValue = `sha256:mockqahandoffcertifiedreleaseoperationscustodymonitoringreadinessledger-${safeDigest(`${operationsHandoffAcceptanceReceipt.operationsHandoffAcceptanceReceiptDigest}:${operationsCustodyMonitoringStatus}:${monitoringReadinessStatus}:${noExecutionMonitoringStatus}`)}`;
  const safeFilenameValue = "provider-webhook-review-qa-handoff-certified-release-operations-custody-monitoring-readiness-ledger.json";
  const digestContinuityStatus = mockCertifiedReleaseOperationsCustodyMonitoringDigestLinksSafe(operationsHandoffAcceptanceReceipt, safeDigestValue) ? "confirmed" : "broken";
  const operationsCustodyMonitoringRows = mockCertifiedReleaseOperationsHandoffEvidenceRows([
    ["operations_handoff_acceptance_receipt_confirmed", "Operations handoff acceptance receipt confirmed", operationsHandoffAcceptanceReceipt.operationsHandoffAcceptanceReceiptDigest, operationsHandoffAcceptanceReceipt.safeFilename, operationsHandoffAcceptanceReceipt.counts.operationsHandoffAcceptanceCheckedCount, operationsHandoffAcceptanceReceipt.operationsHandoffAcceptanceStatus === "accepted"],
    ["operations_custody_accepted", "Operations custody accepted", operationsHandoffAcceptanceReceipt.operationsHandoffAcceptanceReceiptDigest, operationsHandoffAcceptanceReceipt.safeFilename, operationsHandoffAcceptanceReceipt.counts.operationsCustodyAcceptedCount, operationsHandoffAcceptanceReceipt.operationsCustodyStatus === "accepted"],
    ["operations_custody_monitoring_ready", "Operations custody monitoring ready", safeDigestValue, safeFilenameValue, 1, operationsCustodyMonitoringStatus === "ready"],
    ["operations_custody_monitoring_ledger_issued", "Operations custody monitoring readiness ledger issued", safeDigestValue, safeFilenameValue, 1, operationsCustodyMonitoringReady]
  ]);
  const noExecutionMonitoringRows = mockCertifiedReleaseOperationsHandoffEvidenceRows([
    ["no_execution_monitoring_active", "No-execution monitoring active", safeDigestValue, safeFilenameValue, operationsHandoffAcceptanceReceipt.counts.executionAttemptCount, noExecutionMonitoringStatus === "active"],
    ["no_execution_evidence_confirmed", "No-execution evidence confirmed", operationsHandoffAcceptanceReceipt.noExecutionLockReceiptDigest, operationsHandoffAcceptanceReceipt.safeFilename, operationsHandoffAcceptanceReceipt.counts.executionAttemptCount, operationsHandoffAcceptanceReceipt.noExecutionEvidenceStatus === "confirmed"],
    ["launch_approval_lock_retained", "Launch approval lock retained", operationsHandoffAcceptanceReceipt.launchApprovalReceiptDigest, operationsHandoffAcceptanceReceipt.safeFilename, operationsHandoffAcceptanceReceipt.counts.launchApprovalArchiveRetainedCount, operationsHandoffAcceptanceReceipt.launchApprovalLockStatus === "locked"],
    ["tenant_scope_confirmed", "Tenant scope confirmed", operationsHandoffAcceptanceReceipt.safeDigest, operationsHandoffAcceptanceReceipt.safeFilename, operationsHandoffAcceptanceReceipt.counts.tenantScopeCheckedCount, operationsHandoffAcceptanceReceipt.tenantScopeStatus === "tenant_scoped"],
    ["digest_continuity_confirmed", "Operations custody monitoring digest continuity", safeDigestValue, safeFilenameValue, operationsHandoffAcceptanceReceipt.counts.digestContinuityCheckedCount + 3, digestContinuityStatus === "confirmed"],
    ["provider_outbound_absent", "Provider outbound absent", operationsHandoffAcceptanceReceipt.safeDigest, operationsHandoffAcceptanceReceipt.safeFilename, operationsHandoffAcceptanceReceipt.counts.providerOutboundCallCount, operationsHandoffAcceptanceReceipt.providerOutboundStatus === "absent"],
    ["external_notification_absent", "External notification absent", operationsHandoffAcceptanceReceipt.safeDigest, operationsHandoffAcceptanceReceipt.safeFilename, operationsHandoffAcceptanceReceipt.counts.externalNotificationSendCount, operationsHandoffAcceptanceReceipt.externalNotificationStatus === "absent"],
    ["ai_call_absent", "AI call absent", operationsHandoffAcceptanceReceipt.safeDigest, operationsHandoffAcceptanceReceipt.safeFilename, operationsHandoffAcceptanceReceipt.counts.aiCallCount, operationsHandoffAcceptanceReceipt.aiCallStatus === "absent"],
    ["execution_attempts_zero", "Execution attempts zero", operationsHandoffAcceptanceReceipt.safeDigest, operationsHandoffAcceptanceReceipt.safeFilename, operationsHandoffAcceptanceReceipt.counts.executionAttemptCount, operationsHandoffAcceptanceReceipt.counts.executionAttemptCount === 0],
    ["monitoring_readiness_confirmed", "Monitoring readiness confirmed", safeDigestValue, safeFilenameValue, 1, monitoringReadinessStatus === "ready"]
  ]);

  return {
    ...operationsHandoffAcceptanceReceipt,
    ledgerKind: "qa-handoff-locked-archive-certified-release-operations-custody-monitoring-readiness-ledger",
    operationsCustodyMonitoringStatus,
    monitoringReadinessStatus,
    noExecutionMonitoringStatus,
    digestContinuityStatus,
    safeFilename: safeFilenameValue,
    safeDigest: safeDigestValue,
    operationsCustodyMonitoringLedgerDigest: safeDigestValue,
    operationsCustodyMonitoringLedgerGeneratedAt: new Date().toISOString(),
    operationsCustodyMonitoringRows,
    noExecutionMonitoringRows,
    inheritedOperationsHandoffAcceptanceReceiptSummary: {
      operationsHandoffAcceptanceStatus: operationsHandoffAcceptanceReceipt.operationsHandoffAcceptanceStatus,
      operationsCustodyStatus: operationsHandoffAcceptanceReceipt.operationsCustodyStatus,
      noExecutionEvidenceStatus: operationsHandoffAcceptanceReceipt.noExecutionEvidenceStatus,
      launchApprovalLockStatus: operationsHandoffAcceptanceReceipt.launchApprovalLockStatus,
      tenantScopeStatus: operationsHandoffAcceptanceReceipt.tenantScopeStatus,
      digestContinuityStatus: operationsHandoffAcceptanceReceipt.digestContinuityStatus,
      providerOutboundStatus: operationsHandoffAcceptanceReceipt.providerOutboundStatus,
      externalNotificationStatus: operationsHandoffAcceptanceReceipt.externalNotificationStatus,
      aiCallStatus: operationsHandoffAcceptanceReceipt.aiCallStatus,
      operationsHandoffMutationCount: operationsHandoffAcceptanceReceipt.counts.operationsHandoffMutationCount,
      operationsHandoffAcceptanceMutationCount: operationsHandoffAcceptanceReceipt.counts.operationsHandoffAcceptanceMutationCount,
      executionAttemptCount: operationsHandoffAcceptanceReceipt.counts.executionAttemptCount,
      providerOutboundCallCount: operationsHandoffAcceptanceReceipt.counts.providerOutboundCallCount,
      externalNotificationSendCount: operationsHandoffAcceptanceReceipt.counts.externalNotificationSendCount,
      aiCallCount: operationsHandoffAcceptanceReceipt.counts.aiCallCount,
      externalCallsZero: operationsHandoffAcceptanceReceipt.externalCalls === 0,
      safeDigest: operationsHandoffAcceptanceReceipt.safeDigest,
      safeFilename: operationsHandoffAcceptanceReceipt.safeFilename,
      operationsHandoffAcceptanceReceiptDigest: operationsHandoffAcceptanceReceipt.operationsHandoffAcceptanceReceiptDigest,
      operationsHandoffEvidencePacketDigest: operationsHandoffAcceptanceReceipt.operationsHandoffEvidencePacketDigest
    },
    counts: {
      ...operationsHandoffAcceptanceReceipt.counts,
      operationsCustodyMonitoringCheckedCount: 1,
      operationsCustodyMonitoringMutationCount: 0,
      operationsCustodyMonitoringRowCount: operationsCustodyMonitoringRows.length,
      operationsCustodyMonitoringReadyCount: operationsCustodyMonitoringRows.filter((row) => row.complete).length,
      noExecutionMonitoringRowCount: noExecutionMonitoringRows.length,
      noExecutionMonitoringActiveCount: noExecutionMonitoringRows.filter((row) => row.complete).length
    },
    externalCalls: 0
  };
}

function mockCertifiedReleaseOperationsCustodyMonitoringReady(
  operationsHandoffAcceptanceReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceReceipt
) {
  return operationsHandoffAcceptanceReceipt.operationsHandoffAcceptanceStatus === "accepted" &&
    operationsHandoffAcceptanceReceipt.operationsCustodyStatus === "accepted" &&
    operationsHandoffAcceptanceReceipt.noExecutionEvidenceStatus === "confirmed" &&
    operationsHandoffAcceptanceReceipt.launchApprovalLockStatus === "locked" &&
    operationsHandoffAcceptanceReceipt.tenantScopeStatus === "tenant_scoped" &&
    operationsHandoffAcceptanceReceipt.digestContinuityStatus === "confirmed" &&
    operationsHandoffAcceptanceReceipt.providerOutboundStatus === "absent" &&
    operationsHandoffAcceptanceReceipt.externalNotificationStatus === "absent" &&
    operationsHandoffAcceptanceReceipt.aiCallStatus === "absent" &&
    operationsHandoffAcceptanceReceipt.counts.operationsHandoffMutationCount === 0 &&
    operationsHandoffAcceptanceReceipt.counts.operationsHandoffAcceptanceMutationCount === 0 &&
    operationsHandoffAcceptanceReceipt.counts.executionAttemptCount === 0 &&
    operationsHandoffAcceptanceReceipt.counts.providerOutboundCallCount === 0 &&
    operationsHandoffAcceptanceReceipt.counts.externalNotificationSendCount === 0 &&
    operationsHandoffAcceptanceReceipt.counts.aiCallCount === 0 &&
    operationsHandoffAcceptanceReceipt.externalCalls === 0;
}

function mockCertifiedReleaseOperationsCustodyMonitoringDigestLinksSafe(
  operationsHandoffAcceptanceReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceReceipt,
  operationsCustodyMonitoringLedgerDigest: string
) {
  return [
    operationsCustodyMonitoringLedgerDigest,
    operationsHandoffAcceptanceReceipt.operationsHandoffAcceptanceReceiptDigest,
    operationsHandoffAcceptanceReceipt.operationsHandoffEvidencePacketDigest,
    operationsHandoffAcceptanceReceipt.noExecutionLockReceiptDigest,
    operationsHandoffAcceptanceReceipt.launchApprovalReceiptDigest,
    operationsHandoffAcceptanceReceipt.safeDigest
  ].every((value) => /^sha256:[a-z0-9-]+$/i.test(value));
}

function createMockReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt(
  filters: ProviderWebhookReviewClosureReportFilters
): ProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt {
  const operationsCustodyMonitoringReadinessLedger = createMockReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedger(filters);
  const operationsCustodyMonitoringCloseoutReady = mockCertifiedReleaseOperationsCustodyMonitoringCloseoutReady(operationsCustodyMonitoringReadinessLedger);
  const operationsCustodyMonitoringCloseoutStatus = mockCertifiedReleaseOperationsCustodyMonitoringCloseoutStatus(operationsCustodyMonitoringReadinessLedger, operationsCustodyMonitoringCloseoutReady);
  const closeoutSealStatus = operationsCustodyMonitoringCloseoutReady ? "sealed" : operationsCustodyMonitoringCloseoutStatus === "blocked" ? "blocked" : "incomplete";
  const safeDigestValue = `sha256:mockqahandoffcertifiedreleaseoperationscustodymonitoringcloseoutsealreceipt-${safeDigest(`${operationsCustodyMonitoringReadinessLedger.operationsCustodyMonitoringLedgerDigest}:${operationsCustodyMonitoringCloseoutStatus}:${closeoutSealStatus}`)}`;
  const safeFilenameValue = "provider-webhook-review-qa-handoff-certified-release-operations-custody-monitoring-closeout-seal-receipt.json";
  const digestContinuityStatus = mockCertifiedReleaseOperationsCustodyMonitoringCloseoutDigestLinksSafe(operationsCustodyMonitoringReadinessLedger, safeDigestValue) ? "confirmed" : "broken";
  const operationsCustodyMonitoringCloseoutRows = mockCertifiedReleaseOperationsHandoffEvidenceRows([
    ["operations_custody_monitoring_ledger_reviewed", "Operations custody monitoring ledger reviewed", operationsCustodyMonitoringReadinessLedger.operationsCustodyMonitoringLedgerDigest, operationsCustodyMonitoringReadinessLedger.safeFilename, operationsCustodyMonitoringReadinessLedger.counts.operationsCustodyMonitoringCheckedCount, operationsCustodyMonitoringReadinessLedger.operationsCustodyMonitoringStatus === "ready" && operationsCustodyMonitoringReadinessLedger.monitoringReadinessStatus === "ready"],
    ["operations_custody_monitoring_closeout_sealed", "Operations custody monitoring closeout sealed", safeDigestValue, safeFilenameValue, 1, operationsCustodyMonitoringCloseoutStatus === "sealed"],
    ["closeout_seal_receipt_issued", "Closeout seal receipt issued", safeDigestValue, safeFilenameValue, 1, closeoutSealStatus === "sealed"],
    ["no_execution_monitoring_active", "No-execution monitoring active", operationsCustodyMonitoringReadinessLedger.operationsCustodyMonitoringLedgerDigest, operationsCustodyMonitoringReadinessLedger.safeFilename, operationsCustodyMonitoringReadinessLedger.counts.executionAttemptCount, operationsCustodyMonitoringReadinessLedger.noExecutionMonitoringStatus === "active"],
    ["no_execution_evidence_confirmed", "No-execution evidence confirmed", operationsCustodyMonitoringReadinessLedger.noExecutionLockReceiptDigest, operationsCustodyMonitoringReadinessLedger.safeFilename, operationsCustodyMonitoringReadinessLedger.counts.executionAttemptCount, operationsCustodyMonitoringReadinessLedger.noExecutionEvidenceStatus === "confirmed"],
    ["launch_approval_lock_retained", "Launch approval lock retained", operationsCustodyMonitoringReadinessLedger.launchApprovalReceiptDigest, operationsCustodyMonitoringReadinessLedger.safeFilename, operationsCustodyMonitoringReadinessLedger.counts.launchApprovalArchiveRetainedCount, operationsCustodyMonitoringReadinessLedger.launchApprovalLockStatus === "locked"],
    ["tenant_scope_confirmed", "Tenant scope confirmed", operationsCustodyMonitoringReadinessLedger.safeDigest, operationsCustodyMonitoringReadinessLedger.safeFilename, operationsCustodyMonitoringReadinessLedger.counts.tenantScopeCheckedCount, operationsCustodyMonitoringReadinessLedger.tenantScopeStatus === "tenant_scoped"],
    ["digest_continuity_confirmed", "Operations custody monitoring closeout digest continuity", safeDigestValue, safeFilenameValue, operationsCustodyMonitoringReadinessLedger.counts.digestContinuityCheckedCount + 4, digestContinuityStatus === "confirmed"],
    ["provider_outbound_absent", "Provider outbound absent", operationsCustodyMonitoringReadinessLedger.safeDigest, operationsCustodyMonitoringReadinessLedger.safeFilename, operationsCustodyMonitoringReadinessLedger.counts.providerOutboundCallCount, operationsCustodyMonitoringReadinessLedger.providerOutboundStatus === "absent"],
    ["external_notification_absent", "External notification absent", operationsCustodyMonitoringReadinessLedger.safeDigest, operationsCustodyMonitoringReadinessLedger.safeFilename, operationsCustodyMonitoringReadinessLedger.counts.externalNotificationSendCount, operationsCustodyMonitoringReadinessLedger.externalNotificationStatus === "absent"],
    ["ai_call_absent", "AI call absent", operationsCustodyMonitoringReadinessLedger.safeDigest, operationsCustodyMonitoringReadinessLedger.safeFilename, operationsCustodyMonitoringReadinessLedger.counts.aiCallCount, operationsCustodyMonitoringReadinessLedger.aiCallStatus === "absent"],
    ["execution_attempts_zero", "Execution attempts zero", operationsCustodyMonitoringReadinessLedger.safeDigest, operationsCustodyMonitoringReadinessLedger.safeFilename, operationsCustodyMonitoringReadinessLedger.counts.executionAttemptCount, operationsCustodyMonitoringReadinessLedger.counts.executionAttemptCount === 0]
  ]);

  return {
    ...operationsCustodyMonitoringReadinessLedger,
    receiptKind: "qa-handoff-locked-archive-certified-release-operations-custody-monitoring-closeout-seal-receipt",
    operationsCustodyMonitoringCloseoutStatus,
    closeoutSealStatus,
    digestContinuityStatus,
    safeFilename: safeFilenameValue,
    safeDigest: safeDigestValue,
    operationsCustodyMonitoringCloseoutSealReceiptDigest: safeDigestValue,
    operationsCustodyMonitoringCloseoutSealedAt: new Date().toISOString(),
    operationsCustodyMonitoringCloseoutRows,
    inheritedOperationsCustodyMonitoringReadinessLedgerSummary: {
      operationsCustodyMonitoringStatus: operationsCustodyMonitoringReadinessLedger.operationsCustodyMonitoringStatus,
      operationsHandoffAcceptanceStatus: operationsCustodyMonitoringReadinessLedger.operationsHandoffAcceptanceStatus,
      operationsCustodyStatus: operationsCustodyMonitoringReadinessLedger.operationsCustodyStatus,
      noExecutionEvidenceStatus: operationsCustodyMonitoringReadinessLedger.noExecutionEvidenceStatus,
      noExecutionMonitoringStatus: operationsCustodyMonitoringReadinessLedger.noExecutionMonitoringStatus,
      launchApprovalLockStatus: operationsCustodyMonitoringReadinessLedger.launchApprovalLockStatus,
      tenantScopeStatus: operationsCustodyMonitoringReadinessLedger.tenantScopeStatus,
      digestContinuityStatus: operationsCustodyMonitoringReadinessLedger.digestContinuityStatus,
      monitoringReadinessStatus: operationsCustodyMonitoringReadinessLedger.monitoringReadinessStatus,
      providerOutboundStatus: operationsCustodyMonitoringReadinessLedger.providerOutboundStatus,
      externalNotificationStatus: operationsCustodyMonitoringReadinessLedger.externalNotificationStatus,
      aiCallStatus: operationsCustodyMonitoringReadinessLedger.aiCallStatus,
      operationsHandoffMutationCount: operationsCustodyMonitoringReadinessLedger.counts.operationsHandoffMutationCount,
      operationsHandoffAcceptanceMutationCount: operationsCustodyMonitoringReadinessLedger.counts.operationsHandoffAcceptanceMutationCount,
      operationsCustodyMonitoringMutationCount: operationsCustodyMonitoringReadinessLedger.counts.operationsCustodyMonitoringMutationCount,
      executionAttemptCount: operationsCustodyMonitoringReadinessLedger.counts.executionAttemptCount,
      providerOutboundCallCount: operationsCustodyMonitoringReadinessLedger.counts.providerOutboundCallCount,
      externalNotificationSendCount: operationsCustodyMonitoringReadinessLedger.counts.externalNotificationSendCount,
      aiCallCount: operationsCustodyMonitoringReadinessLedger.counts.aiCallCount,
      externalCallsZero: operationsCustodyMonitoringReadinessLedger.externalCalls === 0,
      safeDigest: operationsCustodyMonitoringReadinessLedger.safeDigest,
      safeFilename: operationsCustodyMonitoringReadinessLedger.safeFilename,
      operationsCustodyMonitoringLedgerDigest: operationsCustodyMonitoringReadinessLedger.operationsCustodyMonitoringLedgerDigest,
      operationsHandoffAcceptanceReceiptDigest: operationsCustodyMonitoringReadinessLedger.operationsHandoffAcceptanceReceiptDigest,
      operationsHandoffEvidencePacketDigest: operationsCustodyMonitoringReadinessLedger.operationsHandoffEvidencePacketDigest
    },
    counts: {
      ...operationsCustodyMonitoringReadinessLedger.counts,
      operationsCustodyMonitoringCloseoutCheckedCount: 1,
      operationsCustodyMonitoringCloseoutSealMutationCount: 0,
      operationsCustodyMonitoringCloseoutRowCount: operationsCustodyMonitoringCloseoutRows.length,
      operationsCustodyMonitoringCloseoutSealedCount: operationsCustodyMonitoringCloseoutRows.filter((row) => row.complete).length
    },
    externalCalls: 0
  };
}

function mockCertifiedReleaseOperationsCustodyMonitoringCloseoutReady(
  operationsCustodyMonitoringReadinessLedger: ProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedger
) {
  return operationsCustodyMonitoringReadinessLedger.operationsCustodyMonitoringStatus === "ready" &&
    operationsCustodyMonitoringReadinessLedger.monitoringReadinessStatus === "ready" &&
    operationsCustodyMonitoringReadinessLedger.noExecutionMonitoringStatus === "active" &&
    operationsCustodyMonitoringReadinessLedger.operationsHandoffAcceptanceStatus === "accepted" &&
    operationsCustodyMonitoringReadinessLedger.operationsCustodyStatus === "accepted" &&
    operationsCustodyMonitoringReadinessLedger.noExecutionEvidenceStatus === "confirmed" &&
    operationsCustodyMonitoringReadinessLedger.launchApprovalLockStatus === "locked" &&
    operationsCustodyMonitoringReadinessLedger.tenantScopeStatus === "tenant_scoped" &&
    operationsCustodyMonitoringReadinessLedger.digestContinuityStatus === "confirmed" &&
    operationsCustodyMonitoringReadinessLedger.providerOutboundStatus === "absent" &&
    operationsCustodyMonitoringReadinessLedger.externalNotificationStatus === "absent" &&
    operationsCustodyMonitoringReadinessLedger.aiCallStatus === "absent" &&
    operationsCustodyMonitoringReadinessLedger.operationsCustodyMonitoringRows.every((row) => row.complete && row.status === "confirmed") &&
    operationsCustodyMonitoringReadinessLedger.noExecutionMonitoringRows.every((row) => row.complete && row.status === "confirmed") &&
    operationsCustodyMonitoringReadinessLedger.counts.operationsHandoffMutationCount === 0 &&
    operationsCustodyMonitoringReadinessLedger.counts.operationsHandoffAcceptanceMutationCount === 0 &&
    operationsCustodyMonitoringReadinessLedger.counts.operationsCustodyMonitoringMutationCount === 0 &&
    operationsCustodyMonitoringReadinessLedger.counts.executionAttemptCount === 0 &&
    operationsCustodyMonitoringReadinessLedger.counts.providerOutboundCallCount === 0 &&
    operationsCustodyMonitoringReadinessLedger.counts.externalNotificationSendCount === 0 &&
    operationsCustodyMonitoringReadinessLedger.counts.aiCallCount === 0 &&
    operationsCustodyMonitoringReadinessLedger.externalCalls === 0;
}

function mockCertifiedReleaseOperationsCustodyMonitoringCloseoutStatus(
  operationsCustodyMonitoringReadinessLedger: ProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedger,
  operationsCustodyMonitoringCloseoutReady: boolean
): ProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt["operationsCustodyMonitoringCloseoutStatus"] {
  if (operationsCustodyMonitoringCloseoutReady) return "sealed";
  if (
    operationsCustodyMonitoringReadinessLedger.operationsCustodyMonitoringStatus === "blocked" ||
    operationsCustodyMonitoringReadinessLedger.monitoringReadinessStatus === "blocked" ||
    operationsCustodyMonitoringReadinessLedger.noExecutionMonitoringStatus === "violated" ||
    operationsCustodyMonitoringReadinessLedger.counts.executionAttemptCount > 0 ||
    operationsCustodyMonitoringReadinessLedger.counts.providerOutboundCallCount > 0 ||
    operationsCustodyMonitoringReadinessLedger.counts.externalNotificationSendCount > 0 ||
    operationsCustodyMonitoringReadinessLedger.counts.aiCallCount > 0
  ) return "blocked";
  return "incomplete";
}

function mockCertifiedReleaseOperationsCustodyMonitoringCloseoutDigestLinksSafe(
  operationsCustodyMonitoringReadinessLedger: ProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedger,
  operationsCustodyMonitoringCloseoutSealReceiptDigest: string
) {
  return [
    operationsCustodyMonitoringCloseoutSealReceiptDigest,
    operationsCustodyMonitoringReadinessLedger.operationsCustodyMonitoringLedgerDigest,
    operationsCustodyMonitoringReadinessLedger.operationsHandoffAcceptanceReceiptDigest,
    operationsCustodyMonitoringReadinessLedger.operationsHandoffEvidencePacketDigest,
    operationsCustodyMonitoringReadinessLedger.noExecutionLockReceiptDigest,
    operationsCustodyMonitoringReadinessLedger.launchApprovalReceiptDigest,
    operationsCustodyMonitoringReadinessLedger.safeDigest
  ].every((value) => /^sha256:[a-z0-9-]+$/i.test(value));
}

function createMockReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollup(
  filters: ProviderWebhookReviewClosureReportFilters
): ProviderWebhookReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollup {
  const operationsCustodyMonitoringCloseoutSealReceipt = createMockReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt(filters);
  const finalNoExecutionEvidenceRollupReady = mockCertifiedReleaseFinalNoExecutionEvidenceRollupReady(operationsCustodyMonitoringCloseoutSealReceipt);
  const finalNoExecutionEvidenceRollupStatus = mockCertifiedReleaseFinalNoExecutionEvidenceRollupStatus(operationsCustodyMonitoringCloseoutSealReceipt, finalNoExecutionEvidenceRollupReady);
  const finalArchiveCustodyStatus = finalNoExecutionEvidenceRollupReady ? "sealed" : finalNoExecutionEvidenceRollupStatus === "blocked" ? "blocked" : "incomplete";
  const safeDigestValue = `sha256:mockqahandoffcertifiedreleasefinalnoexecutionevidencerollup-${safeDigest(`${operationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyMonitoringCloseoutSealReceiptDigest}:${finalNoExecutionEvidenceRollupStatus}:${finalArchiveCustodyStatus}`)}`;
  const safeFilenameValue = "provider-webhook-review-qa-handoff-certified-release-final-no-execution-evidence-rollup.json";
  const digestContinuityStatus = mockCertifiedReleaseFinalNoExecutionEvidenceRollupDigestLinksSafe(operationsCustodyMonitoringCloseoutSealReceipt, safeDigestValue) ? "confirmed" : "broken";
  const finalNoExecutionEvidenceRows = mockCertifiedReleaseOperationsHandoffEvidenceRows([
    ["sprint_103_launch_approval_receipt_retained", "Sprint 103 launch approval receipt retained", operationsCustodyMonitoringCloseoutSealReceipt.launchApprovalReceiptDigest, operationsCustodyMonitoringCloseoutSealReceipt.safeFilename, operationsCustodyMonitoringCloseoutSealReceipt.counts.launchApprovalReceiptIssuedCount, operationsCustodyMonitoringCloseoutSealReceipt.launchApprovalReceiptStatus === "issued"],
    ["sprint_104_no_execution_lock_receipt_retained", "Sprint 104 no-execution lock receipt retained", operationsCustodyMonitoringCloseoutSealReceipt.noExecutionLockReceiptDigest, operationsCustodyMonitoringCloseoutSealReceipt.safeFilename, operationsCustodyMonitoringCloseoutSealReceipt.counts.noExecutionLockReceiptCheckedCount, operationsCustodyMonitoringCloseoutSealReceipt.noExecutionLockReceiptStatus === "issued" && operationsCustodyMonitoringCloseoutSealReceipt.noExecutionLockStatus === "locked"],
    ["sprint_105_operations_handoff_packet_retained", "Sprint 105 operations handoff packet retained", operationsCustodyMonitoringCloseoutSealReceipt.operationsHandoffEvidencePacketDigest, operationsCustodyMonitoringCloseoutSealReceipt.safeFilename, operationsCustodyMonitoringCloseoutSealReceipt.counts.operationsHandoffReadinessCheckedCount, operationsCustodyMonitoringCloseoutSealReceipt.operationsHandoffEvidencePacketStatus === "issued" && operationsCustodyMonitoringCloseoutSealReceipt.noExecutionEvidenceStatus === "confirmed"],
    ["sprint_106_operations_handoff_acceptance_retained", "Sprint 106 operations handoff acceptance retained", operationsCustodyMonitoringCloseoutSealReceipt.operationsHandoffAcceptanceReceiptDigest, operationsCustodyMonitoringCloseoutSealReceipt.safeFilename, operationsCustodyMonitoringCloseoutSealReceipt.counts.operationsHandoffAcceptanceCheckedCount, operationsCustodyMonitoringCloseoutSealReceipt.operationsHandoffAcceptanceStatus === "accepted" && operationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyStatus === "accepted"],
    ["sprint_107_operations_custody_monitoring_retained", "Sprint 107 operations custody monitoring retained", operationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyMonitoringLedgerDigest, operationsCustodyMonitoringCloseoutSealReceipt.safeFilename, operationsCustodyMonitoringCloseoutSealReceipt.counts.operationsCustodyMonitoringCheckedCount, operationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyMonitoringStatus === "ready" && operationsCustodyMonitoringCloseoutSealReceipt.noExecutionMonitoringStatus === "active"],
    ["sprint_108_closeout_seal_receipt_retained", "Sprint 108 closeout seal receipt retained", operationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyMonitoringCloseoutSealReceiptDigest, operationsCustodyMonitoringCloseoutSealReceipt.safeFilename, operationsCustodyMonitoringCloseoutSealReceipt.counts.operationsCustodyMonitoringCloseoutCheckedCount, operationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyMonitoringCloseoutStatus === "sealed" && operationsCustodyMonitoringCloseoutSealReceipt.closeoutSealStatus === "sealed"],
    ["final_no_execution_evidence_rollup_issued", "Final no-execution evidence rollup issued", safeDigestValue, safeFilenameValue, 1, finalNoExecutionEvidenceRollupStatus === "issued"],
    ["final_archive_custody_sealed", "Final archive custody sealed", safeDigestValue, safeFilenameValue, 1, finalArchiveCustodyStatus === "sealed"],
    ["no_execution_evidence_confirmed", "No-execution evidence confirmed", operationsCustodyMonitoringCloseoutSealReceipt.noExecutionLockReceiptDigest, operationsCustodyMonitoringCloseoutSealReceipt.safeFilename, operationsCustodyMonitoringCloseoutSealReceipt.counts.executionAttemptCount, operationsCustodyMonitoringCloseoutSealReceipt.noExecutionEvidenceStatus === "confirmed"],
    ["no_execution_monitoring_active", "No-execution monitoring active", operationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyMonitoringLedgerDigest, operationsCustodyMonitoringCloseoutSealReceipt.safeFilename, operationsCustodyMonitoringCloseoutSealReceipt.counts.executionAttemptCount, operationsCustodyMonitoringCloseoutSealReceipt.noExecutionMonitoringStatus === "active"],
    ["launch_approval_lock_retained", "Launch approval lock retained", operationsCustodyMonitoringCloseoutSealReceipt.launchApprovalReceiptDigest, operationsCustodyMonitoringCloseoutSealReceipt.safeFilename, operationsCustodyMonitoringCloseoutSealReceipt.counts.launchApprovalArchiveRetainedCount, operationsCustodyMonitoringCloseoutSealReceipt.launchApprovalLockStatus === "locked"],
    ["tenant_scope_confirmed", "Tenant scope confirmed", operationsCustodyMonitoringCloseoutSealReceipt.safeDigest, operationsCustodyMonitoringCloseoutSealReceipt.safeFilename, operationsCustodyMonitoringCloseoutSealReceipt.counts.tenantScopeCheckedCount, operationsCustodyMonitoringCloseoutSealReceipt.tenantScopeStatus === "tenant_scoped"],
    ["digest_continuity_confirmed", "Final no-execution evidence rollup digest continuity", safeDigestValue, safeFilenameValue, operationsCustodyMonitoringCloseoutSealReceipt.counts.digestContinuityCheckedCount + 5, digestContinuityStatus === "confirmed"],
    ["provider_outbound_absent", "Provider outbound absent", operationsCustodyMonitoringCloseoutSealReceipt.safeDigest, operationsCustodyMonitoringCloseoutSealReceipt.safeFilename, operationsCustodyMonitoringCloseoutSealReceipt.counts.providerOutboundCallCount, operationsCustodyMonitoringCloseoutSealReceipt.providerOutboundStatus === "absent"],
    ["external_notification_absent", "External notification absent", operationsCustodyMonitoringCloseoutSealReceipt.safeDigest, operationsCustodyMonitoringCloseoutSealReceipt.safeFilename, operationsCustodyMonitoringCloseoutSealReceipt.counts.externalNotificationSendCount, operationsCustodyMonitoringCloseoutSealReceipt.externalNotificationStatus === "absent"],
    ["ai_call_absent", "AI call absent", operationsCustodyMonitoringCloseoutSealReceipt.safeDigest, operationsCustodyMonitoringCloseoutSealReceipt.safeFilename, operationsCustodyMonitoringCloseoutSealReceipt.counts.aiCallCount, operationsCustodyMonitoringCloseoutSealReceipt.aiCallStatus === "absent"],
    ["execution_attempts_zero", "Execution attempts zero", operationsCustodyMonitoringCloseoutSealReceipt.safeDigest, operationsCustodyMonitoringCloseoutSealReceipt.safeFilename, operationsCustodyMonitoringCloseoutSealReceipt.counts.executionAttemptCount, operationsCustodyMonitoringCloseoutSealReceipt.counts.executionAttemptCount === 0]
  ]);

  return {
    ...operationsCustodyMonitoringCloseoutSealReceipt,
    rollupKind: "qa-handoff-locked-archive-certified-release-final-no-execution-evidence-rollup",
    finalNoExecutionEvidenceRollupStatus,
    finalArchiveCustodyStatus,
    digestContinuityStatus,
    safeFilename: safeFilenameValue,
    safeDigest: safeDigestValue,
    finalNoExecutionEvidenceRollupDigest: safeDigestValue,
    finalNoExecutionEvidenceRollupIssuedAt: new Date().toISOString(),
    finalNoExecutionEvidenceRows,
    inheritedOperationsCustodyMonitoringCloseoutSealReceiptSummary: {
      operationsCustodyMonitoringCloseoutStatus: operationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyMonitoringCloseoutStatus,
      closeoutSealStatus: operationsCustodyMonitoringCloseoutSealReceipt.closeoutSealStatus,
      operationsCustodyMonitoringStatus: operationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyMonitoringStatus,
      operationsHandoffAcceptanceStatus: operationsCustodyMonitoringCloseoutSealReceipt.operationsHandoffAcceptanceStatus,
      operationsCustodyStatus: operationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyStatus,
      noExecutionEvidenceStatus: operationsCustodyMonitoringCloseoutSealReceipt.noExecutionEvidenceStatus,
      noExecutionMonitoringStatus: operationsCustodyMonitoringCloseoutSealReceipt.noExecutionMonitoringStatus,
      launchApprovalLockStatus: operationsCustodyMonitoringCloseoutSealReceipt.launchApprovalLockStatus,
      tenantScopeStatus: operationsCustodyMonitoringCloseoutSealReceipt.tenantScopeStatus,
      digestContinuityStatus: operationsCustodyMonitoringCloseoutSealReceipt.digestContinuityStatus,
      monitoringReadinessStatus: operationsCustodyMonitoringCloseoutSealReceipt.monitoringReadinessStatus,
      providerOutboundStatus: operationsCustodyMonitoringCloseoutSealReceipt.providerOutboundStatus,
      externalNotificationStatus: operationsCustodyMonitoringCloseoutSealReceipt.externalNotificationStatus,
      aiCallStatus: operationsCustodyMonitoringCloseoutSealReceipt.aiCallStatus,
      operationsHandoffMutationCount: operationsCustodyMonitoringCloseoutSealReceipt.counts.operationsHandoffMutationCount,
      operationsHandoffAcceptanceMutationCount: operationsCustodyMonitoringCloseoutSealReceipt.counts.operationsHandoffAcceptanceMutationCount,
      operationsCustodyMonitoringMutationCount: operationsCustodyMonitoringCloseoutSealReceipt.counts.operationsCustodyMonitoringMutationCount,
      operationsCustodyMonitoringCloseoutSealMutationCount: operationsCustodyMonitoringCloseoutSealReceipt.counts.operationsCustodyMonitoringCloseoutSealMutationCount,
      executionAttemptCount: operationsCustodyMonitoringCloseoutSealReceipt.counts.executionAttemptCount,
      providerOutboundCallCount: operationsCustodyMonitoringCloseoutSealReceipt.counts.providerOutboundCallCount,
      externalNotificationSendCount: operationsCustodyMonitoringCloseoutSealReceipt.counts.externalNotificationSendCount,
      aiCallCount: operationsCustodyMonitoringCloseoutSealReceipt.counts.aiCallCount,
      externalCallsZero: operationsCustodyMonitoringCloseoutSealReceipt.externalCalls === 0,
      safeDigest: operationsCustodyMonitoringCloseoutSealReceipt.safeDigest,
      safeFilename: operationsCustodyMonitoringCloseoutSealReceipt.safeFilename,
      launchApprovalReceiptDigest: operationsCustodyMonitoringCloseoutSealReceipt.launchApprovalReceiptDigest,
      noExecutionLockReceiptDigest: operationsCustodyMonitoringCloseoutSealReceipt.noExecutionLockReceiptDigest,
      operationsHandoffEvidencePacketDigest: operationsCustodyMonitoringCloseoutSealReceipt.operationsHandoffEvidencePacketDigest,
      operationsHandoffAcceptanceReceiptDigest: operationsCustodyMonitoringCloseoutSealReceipt.operationsHandoffAcceptanceReceiptDigest,
      operationsCustodyMonitoringLedgerDigest: operationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyMonitoringLedgerDigest,
      operationsCustodyMonitoringCloseoutSealReceiptDigest: operationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyMonitoringCloseoutSealReceiptDigest
    },
    counts: {
      ...operationsCustodyMonitoringCloseoutSealReceipt.counts,
      finalNoExecutionEvidenceRollupCheckedCount: 1,
      finalNoExecutionEvidenceRollupMutationCount: 0,
      finalNoExecutionEvidenceRollupRowCount: finalNoExecutionEvidenceRows.length,
      finalNoExecutionEvidenceRollupIssuedCount: finalNoExecutionEvidenceRows.filter((row) => row.complete).length,
      finalArchiveCustodySealedCount: finalNoExecutionEvidenceRows.filter((row) => row.complete && row.key === "final_archive_custody_sealed").length
    },
    externalCalls: 0
  };
}

function mockCertifiedReleaseFinalNoExecutionEvidenceRollupReady(
  operationsCustodyMonitoringCloseoutSealReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt
) {
  return operationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyMonitoringCloseoutStatus === "sealed" &&
    operationsCustodyMonitoringCloseoutSealReceipt.closeoutSealStatus === "sealed" &&
    operationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyMonitoringStatus === "ready" &&
    operationsCustodyMonitoringCloseoutSealReceipt.monitoringReadinessStatus === "ready" &&
    operationsCustodyMonitoringCloseoutSealReceipt.noExecutionMonitoringStatus === "active" &&
    operationsCustodyMonitoringCloseoutSealReceipt.operationsHandoffAcceptanceStatus === "accepted" &&
    operationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyStatus === "accepted" &&
    operationsCustodyMonitoringCloseoutSealReceipt.noExecutionEvidenceStatus === "confirmed" &&
    operationsCustodyMonitoringCloseoutSealReceipt.launchApprovalLockStatus === "locked" &&
    operationsCustodyMonitoringCloseoutSealReceipt.tenantScopeStatus === "tenant_scoped" &&
    operationsCustodyMonitoringCloseoutSealReceipt.digestContinuityStatus === "confirmed" &&
    operationsCustodyMonitoringCloseoutSealReceipt.providerOutboundStatus === "absent" &&
    operationsCustodyMonitoringCloseoutSealReceipt.externalNotificationStatus === "absent" &&
    operationsCustodyMonitoringCloseoutSealReceipt.aiCallStatus === "absent" &&
    operationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyMonitoringCloseoutRows.every((row) => row.complete && row.status === "confirmed") &&
    operationsCustodyMonitoringCloseoutSealReceipt.counts.operationsHandoffMutationCount === 0 &&
    operationsCustodyMonitoringCloseoutSealReceipt.counts.operationsHandoffAcceptanceMutationCount === 0 &&
    operationsCustodyMonitoringCloseoutSealReceipt.counts.operationsCustodyMonitoringMutationCount === 0 &&
    operationsCustodyMonitoringCloseoutSealReceipt.counts.operationsCustodyMonitoringCloseoutSealMutationCount === 0 &&
    operationsCustodyMonitoringCloseoutSealReceipt.counts.executionAttemptCount === 0 &&
    operationsCustodyMonitoringCloseoutSealReceipt.counts.providerOutboundCallCount === 0 &&
    operationsCustodyMonitoringCloseoutSealReceipt.counts.externalNotificationSendCount === 0 &&
    operationsCustodyMonitoringCloseoutSealReceipt.counts.aiCallCount === 0 &&
    operationsCustodyMonitoringCloseoutSealReceipt.externalCalls === 0;
}

function mockCertifiedReleaseFinalNoExecutionEvidenceRollupStatus(
  operationsCustodyMonitoringCloseoutSealReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt,
  finalNoExecutionEvidenceRollupReady: boolean
): ProviderWebhookReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollup["finalNoExecutionEvidenceRollupStatus"] {
  if (finalNoExecutionEvidenceRollupReady) return "issued";
  if (
    operationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyMonitoringCloseoutStatus === "blocked" ||
    operationsCustodyMonitoringCloseoutSealReceipt.closeoutSealStatus === "blocked" ||
    operationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyMonitoringStatus === "blocked" ||
    operationsCustodyMonitoringCloseoutSealReceipt.noExecutionMonitoringStatus === "violated" ||
    operationsCustodyMonitoringCloseoutSealReceipt.noExecutionEvidenceStatus === "violated" ||
    operationsCustodyMonitoringCloseoutSealReceipt.counts.executionAttemptCount > 0 ||
    operationsCustodyMonitoringCloseoutSealReceipt.counts.providerOutboundCallCount > 0 ||
    operationsCustodyMonitoringCloseoutSealReceipt.counts.externalNotificationSendCount > 0 ||
    operationsCustodyMonitoringCloseoutSealReceipt.counts.aiCallCount > 0
  ) return "blocked";
  return "incomplete";
}

function mockCertifiedReleaseFinalNoExecutionEvidenceRollupDigestLinksSafe(
  operationsCustodyMonitoringCloseoutSealReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt,
  finalNoExecutionEvidenceRollupDigest: string
) {
  return [
    finalNoExecutionEvidenceRollupDigest,
    operationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyMonitoringCloseoutSealReceiptDigest,
    operationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyMonitoringLedgerDigest,
    operationsCustodyMonitoringCloseoutSealReceipt.operationsHandoffAcceptanceReceiptDigest,
    operationsCustodyMonitoringCloseoutSealReceipt.operationsHandoffEvidencePacketDigest,
    operationsCustodyMonitoringCloseoutSealReceipt.noExecutionLockReceiptDigest,
    operationsCustodyMonitoringCloseoutSealReceipt.launchApprovalReceiptDigest
  ].every((value) => /^sha256:[a-z0-9-]+$/i.test(value));
}

function createMockReviewQaHandoffCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt(
  filters: ProviderWebhookReviewClosureReportFilters
): ProviderWebhookReviewQaHandoffCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt {
  const finalNoExecutionEvidenceRollup = createMockReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollup(filters);
  const regressionGuardrailPassed = mockCertifiedReleaseFinalEvidenceIndexRegressionGuardrailPassed(finalNoExecutionEvidenceRollup);
  const finalEvidenceIndexStatus = regressionGuardrailPassed ? "issued" : finalNoExecutionEvidenceRollup.finalNoExecutionEvidenceRollupStatus === "blocked" ? "blocked" : "incomplete";
  const regressionGuardrailReceiptStatus = regressionGuardrailPassed ? "issued" : finalEvidenceIndexStatus === "blocked" ? "blocked" : "incomplete";
  const regressionGuardrailStatus = regressionGuardrailPassed ? "passed" : finalEvidenceIndexStatus === "blocked" ? "failed" : "incomplete";
  const safeDigestValue = `sha256:mockqahandoffcertifiedreleasefinalevidenceindexregressionguardrailreceipt-${safeDigest(`${finalNoExecutionEvidenceRollup.finalNoExecutionEvidenceRollupDigest}:${regressionGuardrailStatus}`)}`;
  const safeFilenameValue = "provider-webhook-review-qa-handoff-certified-release-final-evidence-index-regression-guardrail-receipt.json";
  const now = new Date().toISOString();
  const zeroCounts = {
    externalCalls: 0 as const,
    executionAttemptCount: 0 as const,
    providerOutboundCallCount: 0 as const,
    externalNotificationSendCount: 0 as const,
    aiCallCount: 0 as const,
    mutationCount: 0 as const
  };
  const finalEvidenceIndexRows: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt["finalEvidenceIndexRows"] = [
    { sprintNumber: 103, artifactLabel: "Sprint 103 launch approval receipt", artifactStatus: "issued", safeDigest: finalNoExecutionEvidenceRollup.launchApprovalReceiptDigest, safeFilename: finalNoExecutionEvidenceRollup.safeFilename, checkedAt: now, ...zeroCounts },
    { sprintNumber: 104, artifactLabel: "Sprint 104 no-execution lock receipt", artifactStatus: "locked", safeDigest: finalNoExecutionEvidenceRollup.noExecutionLockReceiptDigest, safeFilename: finalNoExecutionEvidenceRollup.safeFilename, checkedAt: now, ...zeroCounts },
    { sprintNumber: 105, artifactLabel: "Sprint 105 operations handoff readiness packet", artifactStatus: "confirmed", safeDigest: finalNoExecutionEvidenceRollup.operationsHandoffEvidencePacketDigest, safeFilename: finalNoExecutionEvidenceRollup.safeFilename, checkedAt: now, ...zeroCounts },
    { sprintNumber: 106, artifactLabel: "Sprint 106 operations handoff acceptance receipt", artifactStatus: finalNoExecutionEvidenceRollup.operationsHandoffAcceptanceStatus, safeDigest: finalNoExecutionEvidenceRollup.operationsHandoffAcceptanceReceiptDigest, safeFilename: finalNoExecutionEvidenceRollup.safeFilename, checkedAt: now, ...zeroCounts },
    { sprintNumber: 107, artifactLabel: "Sprint 107 operations custody monitoring readiness ledger", artifactStatus: finalNoExecutionEvidenceRollup.operationsCustodyMonitoringStatus, safeDigest: finalNoExecutionEvidenceRollup.operationsCustodyMonitoringLedgerDigest, safeFilename: finalNoExecutionEvidenceRollup.safeFilename, checkedAt: now, ...zeroCounts },
    { sprintNumber: 108, artifactLabel: "Sprint 108 operations custody monitoring closeout seal receipt", artifactStatus: finalNoExecutionEvidenceRollup.closeoutSealStatus, safeDigest: finalNoExecutionEvidenceRollup.operationsCustodyMonitoringCloseoutSealReceiptDigest, safeFilename: finalNoExecutionEvidenceRollup.safeFilename, checkedAt: now, ...zeroCounts },
    { sprintNumber: 109, artifactLabel: "Sprint 109 final no-execution evidence rollup", artifactStatus: finalNoExecutionEvidenceRollup.finalNoExecutionEvidenceRollupStatus, safeDigest: finalNoExecutionEvidenceRollup.finalNoExecutionEvidenceRollupDigest, safeFilename: finalNoExecutionEvidenceRollup.safeFilename, checkedAt: now, ...zeroCounts },
    { sprintNumber: 110, artifactLabel: "Sprint 110 final evidence index regression guardrail receipt", artifactStatus: regressionGuardrailStatus, safeDigest: safeDigestValue, safeFilename: safeFilenameValue, generatedAt: now, ...zeroCounts }
  ];

  return {
    receiptKind: "qa-handoff-locked-archive-certified-release-final-evidence-index-regression-guardrail-receipt",
    finalEvidenceIndexStatus,
    regressionGuardrailReceiptStatus,
    regressionGuardrailStatus,
    finalNoExecutionEvidenceRollupStatus: finalNoExecutionEvidenceRollup.finalNoExecutionEvidenceRollupStatus,
    finalArchiveCustodyStatus: finalNoExecutionEvidenceRollup.finalArchiveCustodyStatus,
    operationsCustodyMonitoringCloseoutStatus: finalNoExecutionEvidenceRollup.operationsCustodyMonitoringCloseoutStatus,
    operationsCustodyMonitoringStatus: finalNoExecutionEvidenceRollup.operationsCustodyMonitoringStatus,
    operationsHandoffAcceptanceStatus: finalNoExecutionEvidenceRollup.operationsHandoffAcceptanceStatus,
    operationsCustodyStatus: finalNoExecutionEvidenceRollup.operationsCustodyStatus,
    noExecutionEvidenceStatus: finalNoExecutionEvidenceRollup.noExecutionEvidenceStatus,
    noExecutionMonitoringStatus: finalNoExecutionEvidenceRollup.noExecutionMonitoringStatus,
    launchApprovalLockStatus: finalNoExecutionEvidenceRollup.launchApprovalLockStatus,
    tenantScopeStatus: finalNoExecutionEvidenceRollup.tenantScopeStatus,
    digestContinuityStatus: finalNoExecutionEvidenceRollup.digestContinuityStatus,
    closeoutSealStatus: finalNoExecutionEvidenceRollup.closeoutSealStatus,
    providerOutboundStatus: finalNoExecutionEvidenceRollup.providerOutboundStatus,
    externalNotificationStatus: finalNoExecutionEvidenceRollup.externalNotificationStatus,
    aiCallStatus: finalNoExecutionEvidenceRollup.aiCallStatus,
    safeFilename: safeFilenameValue,
    safeDigest: safeDigestValue,
    finalEvidenceIndexDigest: safeDigestValue,
    regressionGuardrailReceiptDigest: safeDigestValue,
    finalNoExecutionEvidenceRollupDigest: finalNoExecutionEvidenceRollup.finalNoExecutionEvidenceRollupDigest,
    operationsCustodyMonitoringCloseoutSealReceiptDigest: finalNoExecutionEvidenceRollup.operationsCustodyMonitoringCloseoutSealReceiptDigest,
    operationsCustodyMonitoringLedgerDigest: finalNoExecutionEvidenceRollup.operationsCustodyMonitoringLedgerDigest,
    operationsHandoffAcceptanceReceiptDigest: finalNoExecutionEvidenceRollup.operationsHandoffAcceptanceReceiptDigest,
    operationsHandoffEvidencePacketDigest: finalNoExecutionEvidenceRollup.operationsHandoffEvidencePacketDigest,
    noExecutionLockReceiptDigest: finalNoExecutionEvidenceRollup.noExecutionLockReceiptDigest,
    launchApprovalReceiptDigest: finalNoExecutionEvidenceRollup.launchApprovalReceiptDigest,
    generatedAt: now,
    checkedAt: now,
    finalEvidenceIndexRows,
    inheritedFinalNoExecutionEvidenceRollupSummary: {
      finalNoExecutionEvidenceRollupStatus: finalNoExecutionEvidenceRollup.finalNoExecutionEvidenceRollupStatus,
      finalArchiveCustodyStatus: finalNoExecutionEvidenceRollup.finalArchiveCustodyStatus,
      finalNoExecutionEvidenceRollupDigest: finalNoExecutionEvidenceRollup.finalNoExecutionEvidenceRollupDigest,
      safeDigest: finalNoExecutionEvidenceRollup.safeDigest,
      safeFilename: finalNoExecutionEvidenceRollup.safeFilename,
      finalNoExecutionEvidenceRollupMutationCount: finalNoExecutionEvidenceRollup.counts.finalNoExecutionEvidenceRollupMutationCount,
      executionAttemptCount: finalNoExecutionEvidenceRollup.counts.executionAttemptCount,
      providerOutboundCallCount: finalNoExecutionEvidenceRollup.counts.providerOutboundCallCount,
      externalNotificationSendCount: finalNoExecutionEvidenceRollup.counts.externalNotificationSendCount,
      aiCallCount: finalNoExecutionEvidenceRollup.counts.aiCallCount,
      externalCallsZero: finalNoExecutionEvidenceRollup.externalCalls === 0
    },
    counts: {
      finalEvidenceIndexCheckedCount: 1,
      finalEvidenceIndexMutationCount: 0,
      finalEvidenceIndexRowCount: finalEvidenceIndexRows.length,
      finalEvidenceIndexIssuedCount: finalEvidenceIndexRows.filter((row) => row.artifactStatus !== "incomplete").length,
      regressionGuardrailCheckedCount: 1,
      regressionGuardrailPassedCount: regressionGuardrailStatus === "passed" ? 1 : 0,
      regressionGuardrailMutationCount: 0,
      finalNoExecutionEvidenceRollupMutationCount: finalNoExecutionEvidenceRollup.counts.finalNoExecutionEvidenceRollupMutationCount,
      executionAttemptCount: finalNoExecutionEvidenceRollup.counts.executionAttemptCount,
      providerOutboundCallCount: finalNoExecutionEvidenceRollup.counts.providerOutboundCallCount,
      externalNotificationSendCount: finalNoExecutionEvidenceRollup.counts.externalNotificationSendCount,
      aiCallCount: finalNoExecutionEvidenceRollup.counts.aiCallCount
    },
    externalCalls: 0
  };
}

function createMockReviewQaHandoffCertifiedReleaseFinalArchiveSealOperationalClosureReceipt(
  filters: ProviderWebhookReviewClosureReportFilters
): ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealOperationalClosureReceipt {
  const finalEvidenceIndexRegressionGuardrailReceipt = createMockReviewQaHandoffCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt(filters);
  const closureReady = mockCertifiedReleaseFinalArchiveSealOperationalClosureReady(finalEvidenceIndexRegressionGuardrailReceipt);
  const finalOperationalClosureReceiptStatus = closureReady ? "issued" : finalEvidenceIndexRegressionGuardrailReceipt.regressionGuardrailStatus === "failed" ? "blocked" : "incomplete";
  const finalArchiveSealStatus = closureReady ? "sealed" : finalOperationalClosureReceiptStatus === "blocked" ? "blocked" : "incomplete";
  const releaseClosureStatus = closureReady ? "closed" : finalArchiveSealStatus === "blocked" ? "blocked" : "incomplete";
  const safeDigestValue = `sha256:mockqahandoffcertifiedreleasefinalarchivesealoperationalclosurereceipt-${safeDigest(`${finalEvidenceIndexRegressionGuardrailReceipt.finalEvidenceIndexDigest}:${releaseClosureStatus}`)}`;
  const safeFilenameValue = "provider-webhook-review-qa-handoff-certified-release-final-archive-seal-operational-closure-receipt.json";
  const now = new Date().toISOString();
  const zeroCounts = {
    externalCalls: 0 as const,
    executionAttemptCount: 0 as const,
    providerOutboundCallCount: 0 as const,
    externalNotificationSendCount: 0 as const,
    aiCallCount: 0 as const,
    mutationCount: 0 as const
  };
  const finalArchiveSealOperationalClosureRows: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealOperationalClosureReceipt["finalArchiveSealOperationalClosureRows"] = [
    ...finalEvidenceIndexRegressionGuardrailReceipt.finalEvidenceIndexRows.map((row) => ({
      sprintNumber: row.sprintNumber,
      artifactLabel: row.artifactLabel,
      artifactStatus: row.artifactStatus,
      safeDigest: row.safeDigest,
      safeFilename: row.safeFilename,
      checkedAt: row.checkedAt,
      generatedAt: row.generatedAt,
      ...zeroCounts
    })),
    {
      sprintNumber: 111,
      artifactLabel: "Sprint 111 final archive seal operational closure receipt",
      artifactStatus: releaseClosureStatus,
      safeDigest: safeDigestValue,
      safeFilename: safeFilenameValue,
      generatedAt: now,
      ...zeroCounts
    }
  ];

  return {
    receiptKind: "qa-handoff-locked-archive-certified-release-final-archive-seal-operational-closure-receipt",
    finalOperationalClosureReceiptStatus,
    finalArchiveSealStatus,
    releaseClosureStatus,
    finalEvidenceIndexStatus: finalEvidenceIndexRegressionGuardrailReceipt.finalEvidenceIndexStatus,
    regressionGuardrailReceiptStatus: finalEvidenceIndexRegressionGuardrailReceipt.regressionGuardrailReceiptStatus,
    regressionGuardrailStatus: finalEvidenceIndexRegressionGuardrailReceipt.regressionGuardrailStatus,
    finalNoExecutionEvidenceRollupStatus: finalEvidenceIndexRegressionGuardrailReceipt.finalNoExecutionEvidenceRollupStatus,
    finalArchiveCustodyStatus: finalEvidenceIndexRegressionGuardrailReceipt.finalArchiveCustodyStatus,
    operationsCustodyMonitoringCloseoutStatus: finalEvidenceIndexRegressionGuardrailReceipt.operationsCustodyMonitoringCloseoutStatus,
    closeoutSealStatus: finalEvidenceIndexRegressionGuardrailReceipt.closeoutSealStatus,
    noExecutionEvidenceStatus: finalEvidenceIndexRegressionGuardrailReceipt.noExecutionEvidenceStatus,
    noExecutionMonitoringStatus: finalEvidenceIndexRegressionGuardrailReceipt.noExecutionMonitoringStatus,
    tenantScopeStatus: finalEvidenceIndexRegressionGuardrailReceipt.tenantScopeStatus,
    digestContinuityStatus: finalEvidenceIndexRegressionGuardrailReceipt.digestContinuityStatus,
    providerOutboundStatus: finalEvidenceIndexRegressionGuardrailReceipt.providerOutboundStatus,
    externalNotificationStatus: finalEvidenceIndexRegressionGuardrailReceipt.externalNotificationStatus,
    aiCallStatus: finalEvidenceIndexRegressionGuardrailReceipt.aiCallStatus,
    safeFilename: safeFilenameValue,
    safeDigest: safeDigestValue,
    finalOperationalClosureReceiptDigest: safeDigestValue,
    finalArchiveSealDigest: safeDigestValue,
    finalEvidenceIndexDigest: finalEvidenceIndexRegressionGuardrailReceipt.finalEvidenceIndexDigest,
    regressionGuardrailReceiptDigest: finalEvidenceIndexRegressionGuardrailReceipt.regressionGuardrailReceiptDigest,
    finalNoExecutionEvidenceRollupDigest: finalEvidenceIndexRegressionGuardrailReceipt.finalNoExecutionEvidenceRollupDigest,
    generatedAt: now,
    checkedAt: now,
    finalArchiveSealOperationalClosureRows,
    inheritedFinalEvidenceIndexRegressionGuardrailReceiptSummary: {
      finalEvidenceIndexStatus: finalEvidenceIndexRegressionGuardrailReceipt.finalEvidenceIndexStatus,
      regressionGuardrailReceiptStatus: finalEvidenceIndexRegressionGuardrailReceipt.regressionGuardrailReceiptStatus,
      regressionGuardrailStatus: finalEvidenceIndexRegressionGuardrailReceipt.regressionGuardrailStatus,
      finalEvidenceIndexDigest: finalEvidenceIndexRegressionGuardrailReceipt.finalEvidenceIndexDigest,
      regressionGuardrailReceiptDigest: finalEvidenceIndexRegressionGuardrailReceipt.regressionGuardrailReceiptDigest,
      safeDigest: finalEvidenceIndexRegressionGuardrailReceipt.safeDigest,
      safeFilename: finalEvidenceIndexRegressionGuardrailReceipt.safeFilename,
      finalEvidenceIndexMutationCount: finalEvidenceIndexRegressionGuardrailReceipt.counts.finalEvidenceIndexMutationCount,
      regressionGuardrailMutationCount: finalEvidenceIndexRegressionGuardrailReceipt.counts.regressionGuardrailMutationCount,
      finalNoExecutionEvidenceRollupMutationCount: finalEvidenceIndexRegressionGuardrailReceipt.counts.finalNoExecutionEvidenceRollupMutationCount,
      executionAttemptCount: finalEvidenceIndexRegressionGuardrailReceipt.counts.executionAttemptCount,
      providerOutboundCallCount: finalEvidenceIndexRegressionGuardrailReceipt.counts.providerOutboundCallCount,
      externalNotificationSendCount: finalEvidenceIndexRegressionGuardrailReceipt.counts.externalNotificationSendCount,
      aiCallCount: finalEvidenceIndexRegressionGuardrailReceipt.counts.aiCallCount,
      externalCallsZero: finalEvidenceIndexRegressionGuardrailReceipt.externalCalls === 0
    },
    counts: {
      finalOperationalClosureReceiptCheckedCount: 1,
      finalOperationalClosureReceiptMutationCount: 0,
      finalArchiveSealCheckedCount: 1,
      finalArchiveSealMutationCount: 0,
      releaseClosureCheckedCount: 1,
      finalArchiveSealOperationalClosureRowCount: finalArchiveSealOperationalClosureRows.length,
      finalArchiveSealOperationalClosureSealedCount: finalArchiveSealOperationalClosureRows.filter((row) => row.artifactStatus !== "incomplete" && row.artifactStatus !== "blocked" && row.artifactStatus !== "failed").length,
      finalEvidenceIndexMutationCount: finalEvidenceIndexRegressionGuardrailReceipt.counts.finalEvidenceIndexMutationCount,
      regressionGuardrailMutationCount: finalEvidenceIndexRegressionGuardrailReceipt.counts.regressionGuardrailMutationCount,
      finalNoExecutionEvidenceRollupMutationCount: finalEvidenceIndexRegressionGuardrailReceipt.counts.finalNoExecutionEvidenceRollupMutationCount,
      executionAttemptCount: finalEvidenceIndexRegressionGuardrailReceipt.counts.executionAttemptCount,
      providerOutboundCallCount: finalEvidenceIndexRegressionGuardrailReceipt.counts.providerOutboundCallCount,
      externalNotificationSendCount: finalEvidenceIndexRegressionGuardrailReceipt.counts.externalNotificationSendCount,
      aiCallCount: finalEvidenceIndexRegressionGuardrailReceipt.counts.aiCallCount
    },
    externalCalls: 0
  };
}

function mockCertifiedReleaseFinalArchiveSealOperationalClosureReady(
  finalEvidenceIndexRegressionGuardrailReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt
) {
  return finalEvidenceIndexRegressionGuardrailReceipt.finalEvidenceIndexStatus === "issued" &&
    finalEvidenceIndexRegressionGuardrailReceipt.regressionGuardrailReceiptStatus === "issued" &&
    finalEvidenceIndexRegressionGuardrailReceipt.regressionGuardrailStatus === "passed" &&
    finalEvidenceIndexRegressionGuardrailReceipt.finalNoExecutionEvidenceRollupStatus === "issued" &&
    finalEvidenceIndexRegressionGuardrailReceipt.finalArchiveCustodyStatus === "sealed" &&
    finalEvidenceIndexRegressionGuardrailReceipt.operationsCustodyMonitoringCloseoutStatus === "sealed" &&
    finalEvidenceIndexRegressionGuardrailReceipt.closeoutSealStatus === "sealed" &&
    finalEvidenceIndexRegressionGuardrailReceipt.noExecutionEvidenceStatus === "confirmed" &&
    finalEvidenceIndexRegressionGuardrailReceipt.noExecutionMonitoringStatus === "active" &&
    finalEvidenceIndexRegressionGuardrailReceipt.tenantScopeStatus === "tenant_scoped" &&
    finalEvidenceIndexRegressionGuardrailReceipt.digestContinuityStatus === "confirmed" &&
    finalEvidenceIndexRegressionGuardrailReceipt.providerOutboundStatus === "absent" &&
    finalEvidenceIndexRegressionGuardrailReceipt.externalNotificationStatus === "absent" &&
    finalEvidenceIndexRegressionGuardrailReceipt.aiCallStatus === "absent" &&
    finalEvidenceIndexRegressionGuardrailReceipt.finalEvidenceIndexRows.every((row) =>
      row.externalCalls === 0 &&
      row.executionAttemptCount === 0 &&
      row.providerOutboundCallCount === 0 &&
      row.externalNotificationSendCount === 0 &&
      row.aiCallCount === 0 &&
      row.mutationCount === 0
    ) &&
    finalEvidenceIndexRegressionGuardrailReceipt.counts.finalEvidenceIndexMutationCount === 0 &&
    finalEvidenceIndexRegressionGuardrailReceipt.counts.regressionGuardrailMutationCount === 0 &&
    finalEvidenceIndexRegressionGuardrailReceipt.counts.finalNoExecutionEvidenceRollupMutationCount === 0 &&
    finalEvidenceIndexRegressionGuardrailReceipt.counts.executionAttemptCount === 0 &&
    finalEvidenceIndexRegressionGuardrailReceipt.counts.providerOutboundCallCount === 0 &&
    finalEvidenceIndexRegressionGuardrailReceipt.counts.externalNotificationSendCount === 0 &&
    finalEvidenceIndexRegressionGuardrailReceipt.counts.aiCallCount === 0 &&
    finalEvidenceIndexRegressionGuardrailReceipt.externalCalls === 0;
}

function createMockReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceipt(
  filters: ProviderWebhookReviewClosureReportFilters
): ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceipt {
  const finalArchiveSealOperationalClosureReceipt = createMockReviewQaHandoffCertifiedReleaseFinalArchiveSealOperationalClosureReceipt(filters);
  const preservationReady = mockCertifiedReleaseFinalArchiveSealPostClosurePreservationReady(finalArchiveSealOperationalClosureReceipt);
  const postClosurePreservationVerificationStatus = preservationReady ? "verified" : finalArchiveSealOperationalClosureReceipt.releaseClosureStatus === "blocked" ? "blocked" : "incomplete";
  const finalArchiveSealPostClosurePreservationStatus = preservationReady ? "preserved" : postClosurePreservationVerificationStatus === "blocked" ? "blocked" : "incomplete";
  const safeDigestValue = `sha256:mockqahandoffcertifiedreleasefinalarchivesealpostclosurepreservationverificationreceipt-${safeDigest(`${finalArchiveSealOperationalClosureReceipt.safeDigest}:${finalArchiveSealPostClosurePreservationStatus}`)}`;
  const safeFilenameValue = "provider-webhook-certified-release-post-closure-preservation-verification-receipt.json";
  const now = new Date().toISOString();
  const zeroCounts = {
    externalCalls: 0 as const,
    executionAttemptCount: 0 as const,
    providerOutboundCallCount: 0 as const,
    externalNotificationSendCount: 0 as const,
    aiCallCount: 0 as const,
    mutationCount: 0 as const
  };
  const postClosurePreservationVerificationRows: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceipt["postClosurePreservationVerificationRows"] = [
    ...finalArchiveSealOperationalClosureReceipt.finalArchiveSealOperationalClosureRows.map((row) => ({
      sprintNumber: row.sprintNumber,
      artifactLabel: row.artifactLabel,
      artifactStatus: row.artifactStatus,
      safeDigest: row.safeDigest,
      safeFilename: row.safeFilename,
      checkedAt: row.checkedAt,
      generatedAt: row.generatedAt,
      ...zeroCounts
    })),
    {
      sprintNumber: 112,
      artifactLabel: "Sprint 112 post-closure preservation verification receipt",
      artifactStatus: postClosurePreservationVerificationStatus,
      safeDigest: safeDigestValue,
      safeFilename: safeFilenameValue,
      generatedAt: now,
      checkedAt: now,
      ...zeroCounts
    }
  ];

  return {
    receiptKind: "qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-verification-receipt",
    postClosurePreservationVerificationStatus,
    finalArchiveSealPostClosurePreservationStatus,
    finalOperationalClosureReceiptStatus: finalArchiveSealOperationalClosureReceipt.finalOperationalClosureReceiptStatus,
    finalArchiveSealStatus: finalArchiveSealOperationalClosureReceipt.finalArchiveSealStatus,
    releaseClosureStatus: finalArchiveSealOperationalClosureReceipt.releaseClosureStatus,
    finalEvidenceIndexStatus: finalArchiveSealOperationalClosureReceipt.finalEvidenceIndexStatus,
    regressionGuardrailReceiptStatus: finalArchiveSealOperationalClosureReceipt.regressionGuardrailReceiptStatus,
    regressionGuardrailStatus: finalArchiveSealOperationalClosureReceipt.regressionGuardrailStatus,
    finalNoExecutionEvidenceRollupStatus: finalArchiveSealOperationalClosureReceipt.finalNoExecutionEvidenceRollupStatus,
    finalArchiveCustodyStatus: finalArchiveSealOperationalClosureReceipt.finalArchiveCustodyStatus,
    operationsCustodyMonitoringCloseoutStatus: finalArchiveSealOperationalClosureReceipt.operationsCustodyMonitoringCloseoutStatus,
    closeoutSealStatus: finalArchiveSealOperationalClosureReceipt.closeoutSealStatus,
    noExecutionEvidenceStatus: finalArchiveSealOperationalClosureReceipt.noExecutionEvidenceStatus,
    noExecutionMonitoringStatus: finalArchiveSealOperationalClosureReceipt.noExecutionMonitoringStatus,
    tenantScopeStatus: finalArchiveSealOperationalClosureReceipt.tenantScopeStatus,
    digestContinuityStatus: finalArchiveSealOperationalClosureReceipt.digestContinuityStatus,
    providerOutboundStatus: finalArchiveSealOperationalClosureReceipt.providerOutboundStatus,
    externalNotificationStatus: finalArchiveSealOperationalClosureReceipt.externalNotificationStatus,
    aiCallStatus: finalArchiveSealOperationalClosureReceipt.aiCallStatus,
    safeFilename: safeFilenameValue,
    safeDigest: safeDigestValue,
    postClosurePreservationVerificationDigest: safeDigestValue,
    finalArchiveSealOperationalClosureReceiptDigest: finalArchiveSealOperationalClosureReceipt.safeDigest,
    finalArchiveSealDigest: finalArchiveSealOperationalClosureReceipt.finalArchiveSealDigest,
    finalEvidenceIndexDigest: finalArchiveSealOperationalClosureReceipt.finalEvidenceIndexDigest,
    regressionGuardrailReceiptDigest: finalArchiveSealOperationalClosureReceipt.regressionGuardrailReceiptDigest,
    finalNoExecutionEvidenceRollupDigest: finalArchiveSealOperationalClosureReceipt.finalNoExecutionEvidenceRollupDigest,
    generatedAt: now,
    checkedAt: now,
    postClosurePreservationVerificationRows,
    inheritedFinalArchiveSealOperationalClosureReceiptSummary: {
      finalOperationalClosureReceiptStatus: finalArchiveSealOperationalClosureReceipt.finalOperationalClosureReceiptStatus,
      finalArchiveSealStatus: finalArchiveSealOperationalClosureReceipt.finalArchiveSealStatus,
      releaseClosureStatus: finalArchiveSealOperationalClosureReceipt.releaseClosureStatus,
      safeDigest: finalArchiveSealOperationalClosureReceipt.safeDigest,
      safeFilename: finalArchiveSealOperationalClosureReceipt.safeFilename,
      finalOperationalClosureReceiptDigest: finalArchiveSealOperationalClosureReceipt.finalOperationalClosureReceiptDigest,
      finalArchiveSealDigest: finalArchiveSealOperationalClosureReceipt.finalArchiveSealDigest,
      finalArchiveSealOperationalClosureRowCount: finalArchiveSealOperationalClosureReceipt.finalArchiveSealOperationalClosureRows.length,
      finalOperationalClosureReceiptMutationCount: 0,
      finalArchiveSealMutationCount: 0,
      finalEvidenceIndexMutationCount: 0,
      regressionGuardrailMutationCount: 0,
      finalNoExecutionEvidenceRollupMutationCount: 0,
      executionAttemptCount: 0,
      providerOutboundCallCount: 0,
      externalNotificationSendCount: 0,
      aiCallCount: 0,
      externalCallsZero: finalArchiveSealOperationalClosureReceipt.externalCalls === 0
    },
    counts: {
      postClosurePreservationVerificationCheckedCount: 1,
      postClosurePreservationVerificationMutationCount: 0,
      finalArchiveSealPostClosurePreservationCheckedCount: 1,
      finalArchiveSealPostClosurePreservationMutationCount: 0,
      finalOperationalClosureReceiptCheckedCount: 1,
      finalOperationalClosureReceiptMutationCount: 0,
      finalArchiveSealCheckedCount: 1,
      finalArchiveSealMutationCount: 0,
      releaseClosureCheckedCount: 1,
      postClosurePreservationVerificationRowCount: postClosurePreservationVerificationRows.length,
      postClosurePreservationVerificationVerifiedCount: postClosurePreservationVerificationRows.filter((row) => row.artifactStatus !== "incomplete" && row.artifactStatus !== "blocked" && row.artifactStatus !== "failed").length,
      finalEvidenceIndexMutationCount: 0,
      regressionGuardrailMutationCount: 0,
      finalNoExecutionEvidenceRollupMutationCount: 0,
      executionAttemptCount: 0,
      providerOutboundCallCount: 0,
      externalNotificationSendCount: 0,
      aiCallCount: 0
    },
    externalCalls: 0
  };
}

function createMockReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceipt(
  filters: ProviderWebhookReviewClosureReportFilters
): ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceipt {
  const postClosurePreservationVerificationReceipt = createMockReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceipt(filters);
  const continuityReady = mockCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReady(postClosurePreservationVerificationReceipt);
  const postClosurePreservationContinuityLedgerStatus = continuityReady ? "continuous" : postClosurePreservationVerificationReceipt.postClosurePreservationVerificationStatus === "blocked" ? "blocked" : "incomplete";
  const safeDigestValue = `sha256:mockqahandoffcertifiedreleasefinalarchivesealpostclosurepreservationcontinuityledgerreceipt-${safeDigest(`${postClosurePreservationVerificationReceipt.safeDigest}:${postClosurePreservationContinuityLedgerStatus}`)}`;
  const safeFilenameValue = "provider-webhook-certified-release-post-closure-preservation-continuity-ledger-receipt.json";
  const now = new Date().toISOString();
  const zeroCounts = {
    externalCalls: 0 as const,
    executionAttemptCount: 0 as const,
    providerOutboundCallCount: 0 as const,
    externalNotificationSendCount: 0 as const,
    aiCallCount: 0 as const,
    mutationCount: 0 as const
  };
  const preservationContinuityLedgerRows: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceipt["preservationContinuityLedgerRows"] = [
    ...postClosurePreservationVerificationReceipt.postClosurePreservationVerificationRows.map((row) => ({
      sprintNumber: row.sprintNumber,
      artifactLabel: row.artifactLabel,
      artifactStatus: row.artifactStatus,
      safeDigest: row.safeDigest,
      safeFilename: row.safeFilename,
      checkedAt: row.checkedAt,
      generatedAt: row.generatedAt,
      ...zeroCounts
    })),
    {
      sprintNumber: 113,
      artifactLabel: "Sprint 113 post-closure preservation continuity ledger receipt",
      artifactStatus: postClosurePreservationContinuityLedgerStatus,
      safeDigest: safeDigestValue,
      safeFilename: safeFilenameValue,
      generatedAt: now,
      checkedAt: now,
      ...zeroCounts
    }
  ];

  return {
    receiptKind: "qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-continuity-ledger-receipt",
    postClosurePreservationContinuityLedgerStatus,
    postClosurePreservationVerificationStatus: postClosurePreservationVerificationReceipt.postClosurePreservationVerificationStatus,
    finalArchiveSealPostClosurePreservationStatus: postClosurePreservationVerificationReceipt.finalArchiveSealPostClosurePreservationStatus,
    finalOperationalClosureReceiptStatus: postClosurePreservationVerificationReceipt.finalOperationalClosureReceiptStatus,
    finalArchiveSealStatus: postClosurePreservationVerificationReceipt.finalArchiveSealStatus,
    releaseClosureStatus: postClosurePreservationVerificationReceipt.releaseClosureStatus,
    finalEvidenceIndexStatus: postClosurePreservationVerificationReceipt.finalEvidenceIndexStatus,
    regressionGuardrailReceiptStatus: postClosurePreservationVerificationReceipt.regressionGuardrailReceiptStatus,
    regressionGuardrailStatus: postClosurePreservationVerificationReceipt.regressionGuardrailStatus,
    finalNoExecutionEvidenceRollupStatus: postClosurePreservationVerificationReceipt.finalNoExecutionEvidenceRollupStatus,
    finalArchiveCustodyStatus: postClosurePreservationVerificationReceipt.finalArchiveCustodyStatus,
    operationsCustodyMonitoringCloseoutStatus: postClosurePreservationVerificationReceipt.operationsCustodyMonitoringCloseoutStatus,
    closeoutSealStatus: postClosurePreservationVerificationReceipt.closeoutSealStatus,
    noExecutionEvidenceStatus: postClosurePreservationVerificationReceipt.noExecutionEvidenceStatus,
    noExecutionMonitoringStatus: postClosurePreservationVerificationReceipt.noExecutionMonitoringStatus,
    tenantScopeStatus: postClosurePreservationVerificationReceipt.tenantScopeStatus,
    digestContinuityStatus: postClosurePreservationVerificationReceipt.digestContinuityStatus,
    providerOutboundStatus: postClosurePreservationVerificationReceipt.providerOutboundStatus,
    externalNotificationStatus: postClosurePreservationVerificationReceipt.externalNotificationStatus,
    aiCallStatus: postClosurePreservationVerificationReceipt.aiCallStatus,
    safeFilename: safeFilenameValue,
    safeDigest: safeDigestValue,
    postClosurePreservationContinuityLedgerDigest: safeDigestValue,
    postClosurePreservationVerificationDigest: postClosurePreservationVerificationReceipt.postClosurePreservationVerificationDigest,
    finalArchiveSealOperationalClosureReceiptDigest: postClosurePreservationVerificationReceipt.finalArchiveSealOperationalClosureReceiptDigest,
    finalArchiveSealDigest: postClosurePreservationVerificationReceipt.finalArchiveSealDigest,
    finalEvidenceIndexDigest: postClosurePreservationVerificationReceipt.finalEvidenceIndexDigest,
    regressionGuardrailReceiptDigest: postClosurePreservationVerificationReceipt.regressionGuardrailReceiptDigest,
    finalNoExecutionEvidenceRollupDigest: postClosurePreservationVerificationReceipt.finalNoExecutionEvidenceRollupDigest,
    generatedAt: now,
    checkedAt: now,
    preservationContinuityLedgerRows,
    inheritedPostClosurePreservationVerificationReceiptSummary: {
      postClosurePreservationVerificationStatus: postClosurePreservationVerificationReceipt.postClosurePreservationVerificationStatus,
      finalArchiveSealPostClosurePreservationStatus: postClosurePreservationVerificationReceipt.finalArchiveSealPostClosurePreservationStatus,
      finalArchiveSealStatus: postClosurePreservationVerificationReceipt.finalArchiveSealStatus,
      releaseClosureStatus: postClosurePreservationVerificationReceipt.releaseClosureStatus,
      safeDigest: postClosurePreservationVerificationReceipt.safeDigest,
      safeFilename: postClosurePreservationVerificationReceipt.safeFilename,
      postClosurePreservationVerificationDigest: postClosurePreservationVerificationReceipt.postClosurePreservationVerificationDigest,
      postClosurePreservationVerificationRowCount: postClosurePreservationVerificationReceipt.postClosurePreservationVerificationRows.length,
      postClosurePreservationVerificationMutationCount: 0,
      finalArchiveSealPostClosurePreservationMutationCount: 0,
      finalOperationalClosureReceiptMutationCount: 0,
      finalArchiveSealMutationCount: 0,
      finalEvidenceIndexMutationCount: 0,
      regressionGuardrailMutationCount: 0,
      finalNoExecutionEvidenceRollupMutationCount: 0,
      executionAttemptCount: 0,
      providerOutboundCallCount: 0,
      externalNotificationSendCount: 0,
      aiCallCount: 0,
      externalCallsZero: postClosurePreservationVerificationReceipt.externalCalls === 0
    },
    counts: {
      preservationContinuityLedgerCheckedCount: 1,
      preservationContinuityLedgerMutationCount: 0,
      postClosurePreservationVerificationCheckedCount: 1,
      postClosurePreservationVerificationMutationCount: 0,
      finalArchiveSealPostClosurePreservationCheckedCount: 1,
      finalArchiveSealPostClosurePreservationMutationCount: 0,
      finalOperationalClosureReceiptCheckedCount: 1,
      finalOperationalClosureReceiptMutationCount: 0,
      finalArchiveSealCheckedCount: 1,
      finalArchiveSealMutationCount: 0,
      releaseClosureCheckedCount: 1,
      preservationContinuityLedgerRowCount: preservationContinuityLedgerRows.length,
      preservationContinuityLedgerContinuousCount: preservationContinuityLedgerRows.filter((row) => row.artifactStatus !== "incomplete" && row.artifactStatus !== "blocked" && row.artifactStatus !== "failed").length,
      finalEvidenceIndexMutationCount: 0,
      regressionGuardrailMutationCount: 0,
      finalNoExecutionEvidenceRollupMutationCount: 0,
      executionAttemptCount: 0,
      providerOutboundCallCount: 0,
      externalNotificationSendCount: 0,
      aiCallCount: 0
    },
    externalCalls: 0
  };
}

function mockCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReady(
  postClosurePreservationVerificationReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceipt
) {
  return postClosurePreservationVerificationReceipt.postClosurePreservationVerificationStatus === "verified" &&
    postClosurePreservationVerificationReceipt.finalArchiveSealPostClosurePreservationStatus === "preserved" &&
    postClosurePreservationVerificationReceipt.finalOperationalClosureReceiptStatus === "issued" &&
    postClosurePreservationVerificationReceipt.finalArchiveSealStatus === "sealed" &&
    postClosurePreservationVerificationReceipt.releaseClosureStatus === "closed" &&
    postClosurePreservationVerificationReceipt.finalEvidenceIndexStatus === "issued" &&
    postClosurePreservationVerificationReceipt.regressionGuardrailReceiptStatus === "issued" &&
    postClosurePreservationVerificationReceipt.regressionGuardrailStatus === "passed" &&
    postClosurePreservationVerificationReceipt.finalNoExecutionEvidenceRollupStatus === "issued" &&
    postClosurePreservationVerificationReceipt.finalArchiveCustodyStatus === "sealed" &&
    postClosurePreservationVerificationReceipt.operationsCustodyMonitoringCloseoutStatus === "sealed" &&
    postClosurePreservationVerificationReceipt.closeoutSealStatus === "sealed" &&
    postClosurePreservationVerificationReceipt.noExecutionEvidenceStatus === "confirmed" &&
    postClosurePreservationVerificationReceipt.noExecutionMonitoringStatus === "active" &&
    postClosurePreservationVerificationReceipt.tenantScopeStatus === "tenant_scoped" &&
    postClosurePreservationVerificationReceipt.digestContinuityStatus === "confirmed" &&
    postClosurePreservationVerificationReceipt.providerOutboundStatus === "absent" &&
    postClosurePreservationVerificationReceipt.externalNotificationStatus === "absent" &&
    postClosurePreservationVerificationReceipt.aiCallStatus === "absent" &&
    postClosurePreservationVerificationReceipt.postClosurePreservationVerificationRows.every((row) =>
      row.externalCalls === 0 &&
      row.executionAttemptCount === 0 &&
      row.providerOutboundCallCount === 0 &&
      row.externalNotificationSendCount === 0 &&
      row.aiCallCount === 0 &&
      row.mutationCount === 0
    ) &&
    postClosurePreservationVerificationReceipt.counts.postClosurePreservationVerificationMutationCount === 0 &&
    postClosurePreservationVerificationReceipt.counts.finalArchiveSealPostClosurePreservationMutationCount === 0 &&
    postClosurePreservationVerificationReceipt.counts.finalOperationalClosureReceiptMutationCount === 0 &&
    postClosurePreservationVerificationReceipt.counts.finalArchiveSealMutationCount === 0 &&
    postClosurePreservationVerificationReceipt.counts.finalEvidenceIndexMutationCount === 0 &&
    postClosurePreservationVerificationReceipt.counts.regressionGuardrailMutationCount === 0 &&
    postClosurePreservationVerificationReceipt.counts.finalNoExecutionEvidenceRollupMutationCount === 0 &&
    postClosurePreservationVerificationReceipt.counts.executionAttemptCount === 0 &&
    postClosurePreservationVerificationReceipt.counts.providerOutboundCallCount === 0 &&
    postClosurePreservationVerificationReceipt.counts.externalNotificationSendCount === 0 &&
    postClosurePreservationVerificationReceipt.counts.aiCallCount === 0 &&
    postClosurePreservationVerificationReceipt.externalCalls === 0;
}

function createMockReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceipt(
  filters: ProviderWebhookReviewClosureReportFilters
): ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceipt {
  const postClosurePreservationContinuityLedgerReceipt = createMockReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceipt(filters);
  const custodyAuditReady = mockCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReady(postClosurePreservationContinuityLedgerReceipt);
  const postClosurePreservationCustodyAuditStatus = custodyAuditReady ? "audited" : postClosurePreservationContinuityLedgerReceipt.postClosurePreservationContinuityLedgerStatus === "blocked" ? "blocked" : "incomplete";
  const safeDigestValue = `sha256:mockqahandoffcertifiedreleasefinalarchivesealpostclosurepreservationcustodyauditreceipt-${safeDigest(`${postClosurePreservationContinuityLedgerReceipt.safeDigest}:${postClosurePreservationCustodyAuditStatus}`)}`;
  const safeFilenameValue = "provider-webhook-certified-release-post-closure-preservation-custody-audit-receipt.json";
  const now = new Date().toISOString();
  const zeroCounts = {
    externalCalls: 0 as const,
    executionAttemptCount: 0 as const,
    providerOutboundCallCount: 0 as const,
    externalNotificationSendCount: 0 as const,
    aiCallCount: 0 as const,
    mutationCount: 0 as const
  };
  const custodyAuditRows: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceipt["custodyAuditRows"] = [
    ...postClosurePreservationContinuityLedgerReceipt.preservationContinuityLedgerRows.map((row) => ({
      sprintNumber: row.sprintNumber,
      artifactLabel: row.artifactLabel,
      artifactStatus: row.artifactStatus,
      custodyAuditStatus: row.artifactStatus === "blocked" || row.artifactStatus === "failed" || row.artifactStatus === "incomplete" ? "blocked" as const : "under_safe_custody" as const,
      safeDigest: row.safeDigest,
      safeFilename: row.safeFilename,
      checkedAt: row.checkedAt,
      generatedAt: row.generatedAt,
      ...zeroCounts
    })),
    {
      sprintNumber: 114,
      artifactLabel: "Sprint 114 post-closure preservation custody audit receipt",
      artifactStatus: postClosurePreservationCustodyAuditStatus,
      custodyAuditStatus: postClosurePreservationCustodyAuditStatus === "audited" ? "under_safe_custody" as const : "blocked" as const,
      safeDigest: safeDigestValue,
      safeFilename: safeFilenameValue,
      generatedAt: now,
      checkedAt: now,
      ...zeroCounts
    }
  ];

  return {
    receiptKind: "qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-audit-receipt",
    postClosurePreservationCustodyAuditStatus,
    postClosurePreservationContinuityLedgerStatus: postClosurePreservationContinuityLedgerReceipt.postClosurePreservationContinuityLedgerStatus,
    postClosurePreservationVerificationStatus: postClosurePreservationContinuityLedgerReceipt.postClosurePreservationVerificationStatus,
    finalArchiveSealPostClosurePreservationStatus: postClosurePreservationContinuityLedgerReceipt.finalArchiveSealPostClosurePreservationStatus,
    finalOperationalClosureReceiptStatus: postClosurePreservationContinuityLedgerReceipt.finalOperationalClosureReceiptStatus,
    finalArchiveSealStatus: postClosurePreservationContinuityLedgerReceipt.finalArchiveSealStatus,
    releaseClosureStatus: postClosurePreservationContinuityLedgerReceipt.releaseClosureStatus,
    tenantScopeStatus: postClosurePreservationContinuityLedgerReceipt.tenantScopeStatus,
    digestContinuityStatus: postClosurePreservationContinuityLedgerReceipt.digestContinuityStatus,
    providerOutboundStatus: postClosurePreservationContinuityLedgerReceipt.providerOutboundStatus,
    externalNotificationStatus: postClosurePreservationContinuityLedgerReceipt.externalNotificationStatus,
    aiCallStatus: postClosurePreservationContinuityLedgerReceipt.aiCallStatus,
    safeFilename: safeFilenameValue,
    safeDigest: safeDigestValue,
    postClosurePreservationCustodyAuditDigest: safeDigestValue,
    postClosurePreservationContinuityLedgerDigest: postClosurePreservationContinuityLedgerReceipt.postClosurePreservationContinuityLedgerDigest,
    postClosurePreservationVerificationDigest: postClosurePreservationContinuityLedgerReceipt.postClosurePreservationVerificationDigest,
    generatedAt: now,
    checkedAt: now,
    custodyAuditRows,
    inheritedPostClosurePreservationContinuityLedgerReceiptSummary: {
      postClosurePreservationContinuityLedgerStatus: postClosurePreservationContinuityLedgerReceipt.postClosurePreservationContinuityLedgerStatus,
      postClosurePreservationVerificationStatus: postClosurePreservationContinuityLedgerReceipt.postClosurePreservationVerificationStatus,
      safeDigest: postClosurePreservationContinuityLedgerReceipt.safeDigest,
      safeFilename: postClosurePreservationContinuityLedgerReceipt.safeFilename,
      postClosurePreservationContinuityLedgerDigest: postClosurePreservationContinuityLedgerReceipt.postClosurePreservationContinuityLedgerDigest,
      postClosurePreservationVerificationDigest: postClosurePreservationContinuityLedgerReceipt.postClosurePreservationVerificationDigest,
      preservationContinuityLedgerRowCount: postClosurePreservationContinuityLedgerReceipt.preservationContinuityLedgerRows.length,
      preservationContinuityLedgerMutationCount: 0,
      postClosurePreservationVerificationMutationCount: 0,
      executionAttemptCount: 0,
      providerOutboundCallCount: 0,
      externalNotificationSendCount: 0,
      aiCallCount: 0,
      externalCallsZero: postClosurePreservationContinuityLedgerReceipt.externalCalls === 0
    },
    counts: {
      postClosurePreservationCustodyAuditCheckedCount: 1,
      postClosurePreservationCustodyAuditMutationCount: 0,
      preservationContinuityLedgerCheckedCount: 1,
      preservationContinuityLedgerMutationCount: 0,
      postClosurePreservationVerificationCheckedCount: 1,
      postClosurePreservationVerificationMutationCount: 0,
      finalArchiveSealPostClosurePreservationCheckedCount: 1,
      finalArchiveSealPostClosurePreservationMutationCount: 0,
      finalOperationalClosureReceiptCheckedCount: 1,
      finalOperationalClosureReceiptMutationCount: 0,
      finalArchiveSealCheckedCount: 1,
      finalArchiveSealMutationCount: 0,
      releaseClosureCheckedCount: 1,
      postClosurePreservationCustodyAuditRowCount: custodyAuditRows.length,
      postClosurePreservationCustodyAuditSafeCount: custodyAuditRows.filter((row) => row.custodyAuditStatus === "under_safe_custody" && row.artifactStatus !== "incomplete" && row.artifactStatus !== "blocked" && row.artifactStatus !== "failed").length,
      finalEvidenceIndexMutationCount: 0,
      regressionGuardrailMutationCount: 0,
      finalNoExecutionEvidenceRollupMutationCount: 0,
      executionAttemptCount: 0,
      providerOutboundCallCount: 0,
      externalNotificationSendCount: 0,
      aiCallCount: 0
    },
    externalCalls: 0
  };
}

function mockCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReady(
  postClosurePreservationContinuityLedgerReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceipt
) {
  return postClosurePreservationContinuityLedgerReceipt.postClosurePreservationContinuityLedgerStatus === "continuous" &&
    postClosurePreservationContinuityLedgerReceipt.postClosurePreservationVerificationStatus === "verified" &&
    postClosurePreservationContinuityLedgerReceipt.finalArchiveSealPostClosurePreservationStatus === "preserved" &&
    postClosurePreservationContinuityLedgerReceipt.finalOperationalClosureReceiptStatus === "issued" &&
    postClosurePreservationContinuityLedgerReceipt.finalArchiveSealStatus === "sealed" &&
    postClosurePreservationContinuityLedgerReceipt.releaseClosureStatus === "closed" &&
    postClosurePreservationContinuityLedgerReceipt.tenantScopeStatus === "tenant_scoped" &&
    postClosurePreservationContinuityLedgerReceipt.digestContinuityStatus === "confirmed" &&
    postClosurePreservationContinuityLedgerReceipt.providerOutboundStatus === "absent" &&
    postClosurePreservationContinuityLedgerReceipt.externalNotificationStatus === "absent" &&
    postClosurePreservationContinuityLedgerReceipt.aiCallStatus === "absent" &&
    postClosurePreservationContinuityLedgerReceipt.postClosurePreservationContinuityLedgerDigest === postClosurePreservationContinuityLedgerReceipt.safeDigest &&
    postClosurePreservationContinuityLedgerReceipt.preservationContinuityLedgerRows.some((row) => row.sprintNumber === 113 && row.artifactStatus === "continuous" && row.safeDigest === postClosurePreservationContinuityLedgerReceipt.safeDigest) &&
    postClosurePreservationContinuityLedgerReceipt.preservationContinuityLedgerRows.every((row) =>
      row.externalCalls === 0 &&
      row.executionAttemptCount === 0 &&
      row.providerOutboundCallCount === 0 &&
      row.externalNotificationSendCount === 0 &&
      row.aiCallCount === 0 &&
      row.mutationCount === 0
    ) &&
    postClosurePreservationContinuityLedgerReceipt.inheritedPostClosurePreservationVerificationReceiptSummary.externalCallsZero === true &&
    postClosurePreservationContinuityLedgerReceipt.counts.preservationContinuityLedgerMutationCount === 0 &&
    postClosurePreservationContinuityLedgerReceipt.counts.postClosurePreservationVerificationMutationCount === 0 &&
    postClosurePreservationContinuityLedgerReceipt.counts.executionAttemptCount === 0 &&
    postClosurePreservationContinuityLedgerReceipt.counts.providerOutboundCallCount === 0 &&
    postClosurePreservationContinuityLedgerReceipt.counts.externalNotificationSendCount === 0 &&
    postClosurePreservationContinuityLedgerReceipt.counts.aiCallCount === 0 &&
    postClosurePreservationContinuityLedgerReceipt.externalCalls === 0;
}

function createMockReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealReceipt(
  filters: ProviderWebhookReviewClosureReportFilters
): ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealReceipt {
  const postClosurePreservationCustodyAuditReceipt = createMockReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceipt(filters);
  const custodyChainSealReady = mockCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealReady(postClosurePreservationCustodyAuditReceipt);
  const postClosurePreservationCustodyChainSealStatus = custodyChainSealReady ? "sealed" : postClosurePreservationCustodyAuditReceipt.postClosurePreservationCustodyAuditStatus === "blocked" ? "blocked" : "incomplete";
  const safeDigestValue = `sha256:mockqahandoffcertifiedreleasefinalarchivesealpostclosurepreservationcustodychainsealreceipt-${safeDigest(`${postClosurePreservationCustodyAuditReceipt.safeDigest}:${postClosurePreservationCustodyChainSealStatus}`)}`;
  const safeFilenameValue = "provider-webhook-certified-release-post-closure-preservation-custody-chain-seal-receipt.json";
  const now = new Date().toISOString();
  const zeroCounts = {
    externalCalls: 0 as const,
    executionAttemptCount: 0 as const,
    providerOutboundCallCount: 0 as const,
    externalNotificationSendCount: 0 as const,
    aiCallCount: 0 as const,
    mutationCount: 0 as const
  };
  const custodyChainSealRows: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealReceipt["custodyChainSealRows"] = [
    ...postClosurePreservationCustodyAuditReceipt.custodyAuditRows.map((row) => ({
      sprintNumber: row.sprintNumber,
      artifactLabel: row.artifactLabel,
      artifactStatus: row.artifactStatus,
      custodyAuditStatus: row.custodyAuditStatus,
      custodyChainSealStatus: row.custodyAuditStatus === "under_safe_custody" ? "sealed_under_safe_custody" as const : "blocked" as const,
      safeDigest: row.safeDigest,
      safeFilename: row.safeFilename,
      checkedAt: row.checkedAt,
      generatedAt: row.generatedAt,
      ...zeroCounts
    })),
    {
      sprintNumber: 115,
      artifactLabel: "Sprint 115 post-closure preservation custody chain seal receipt",
      artifactStatus: postClosurePreservationCustodyChainSealStatus,
      custodyAuditStatus: postClosurePreservationCustodyChainSealStatus === "sealed" ? "under_safe_custody" as const : "blocked" as const,
      custodyChainSealStatus: postClosurePreservationCustodyChainSealStatus === "sealed" ? "sealed_under_safe_custody" as const : "blocked" as const,
      safeDigest: safeDigestValue,
      safeFilename: safeFilenameValue,
      generatedAt: now,
      checkedAt: now,
      ...zeroCounts
    }
  ];

  return {
    receiptKind: "qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-chain-seal-receipt",
    postClosurePreservationCustodyChainSealStatus,
    postClosurePreservationCustodyAuditStatus: postClosurePreservationCustodyAuditReceipt.postClosurePreservationCustodyAuditStatus,
    postClosurePreservationContinuityLedgerStatus: postClosurePreservationCustodyAuditReceipt.postClosurePreservationContinuityLedgerStatus,
    postClosurePreservationVerificationStatus: postClosurePreservationCustodyAuditReceipt.postClosurePreservationVerificationStatus,
    finalArchiveSealPostClosurePreservationStatus: postClosurePreservationCustodyAuditReceipt.finalArchiveSealPostClosurePreservationStatus,
    finalOperationalClosureReceiptStatus: postClosurePreservationCustodyAuditReceipt.finalOperationalClosureReceiptStatus,
    finalArchiveSealStatus: postClosurePreservationCustodyAuditReceipt.finalArchiveSealStatus,
    releaseClosureStatus: postClosurePreservationCustodyAuditReceipt.releaseClosureStatus,
    tenantScopeStatus: postClosurePreservationCustodyAuditReceipt.tenantScopeStatus,
    digestContinuityStatus: postClosurePreservationCustodyAuditReceipt.digestContinuityStatus,
    providerOutboundStatus: postClosurePreservationCustodyAuditReceipt.providerOutboundStatus,
    externalNotificationStatus: postClosurePreservationCustodyAuditReceipt.externalNotificationStatus,
    aiCallStatus: postClosurePreservationCustodyAuditReceipt.aiCallStatus,
    safeFilename: safeFilenameValue,
    safeDigest: safeDigestValue,
    postClosurePreservationCustodyChainSealDigest: safeDigestValue,
    postClosurePreservationCustodyAuditDigest: postClosurePreservationCustodyAuditReceipt.postClosurePreservationCustodyAuditDigest,
    postClosurePreservationContinuityLedgerDigest: postClosurePreservationCustodyAuditReceipt.postClosurePreservationContinuityLedgerDigest,
    postClosurePreservationVerificationDigest: postClosurePreservationCustodyAuditReceipt.postClosurePreservationVerificationDigest,
    generatedAt: now,
    checkedAt: now,
    custodyChainSealRows,
    inheritedPostClosurePreservationCustodyAuditReceiptSummary: {
      postClosurePreservationCustodyAuditStatus: postClosurePreservationCustodyAuditReceipt.postClosurePreservationCustodyAuditStatus,
      postClosurePreservationContinuityLedgerStatus: postClosurePreservationCustodyAuditReceipt.postClosurePreservationContinuityLedgerStatus,
      postClosurePreservationVerificationStatus: postClosurePreservationCustodyAuditReceipt.postClosurePreservationVerificationStatus,
      safeDigest: postClosurePreservationCustodyAuditReceipt.safeDigest,
      safeFilename: postClosurePreservationCustodyAuditReceipt.safeFilename,
      postClosurePreservationCustodyAuditDigest: postClosurePreservationCustodyAuditReceipt.postClosurePreservationCustodyAuditDigest,
      postClosurePreservationContinuityLedgerDigest: postClosurePreservationCustodyAuditReceipt.postClosurePreservationContinuityLedgerDigest,
      custodyAuditRowCount: postClosurePreservationCustodyAuditReceipt.custodyAuditRows.length,
      postClosurePreservationCustodyAuditMutationCount: 0,
      preservationContinuityLedgerMutationCount: 0,
      postClosurePreservationVerificationMutationCount: 0,
      executionAttemptCount: 0,
      providerOutboundCallCount: 0,
      externalNotificationSendCount: 0,
      aiCallCount: 0,
      externalCallsZero: postClosurePreservationCustodyAuditReceipt.externalCalls === 0
    },
    counts: {
      postClosurePreservationCustodyChainSealCheckedCount: 1,
      postClosurePreservationCustodyChainSealMutationCount: 0,
      postClosurePreservationCustodyAuditCheckedCount: 1,
      postClosurePreservationCustodyAuditMutationCount: 0,
      preservationContinuityLedgerCheckedCount: 1,
      preservationContinuityLedgerMutationCount: 0,
      postClosurePreservationVerificationCheckedCount: 1,
      postClosurePreservationVerificationMutationCount: 0,
      finalArchiveSealPostClosurePreservationCheckedCount: 1,
      finalArchiveSealPostClosurePreservationMutationCount: 0,
      finalOperationalClosureReceiptCheckedCount: 1,
      finalOperationalClosureReceiptMutationCount: 0,
      finalArchiveSealCheckedCount: 1,
      finalArchiveSealMutationCount: 0,
      releaseClosureCheckedCount: 1,
      postClosurePreservationCustodyChainSealRowCount: custodyChainSealRows.length,
      postClosurePreservationCustodyChainSealSafeCount: custodyChainSealRows.filter((row) => row.custodyChainSealStatus === "sealed_under_safe_custody" && row.artifactStatus !== "incomplete" && row.artifactStatus !== "blocked" && row.artifactStatus !== "failed").length,
      finalEvidenceIndexMutationCount: 0,
      regressionGuardrailMutationCount: 0,
      finalNoExecutionEvidenceRollupMutationCount: 0,
      executionAttemptCount: 0,
      providerOutboundCallCount: 0,
      externalNotificationSendCount: 0,
      aiCallCount: 0
    },
    externalCalls: 0
  };
}

function createMockReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerReceipt(
  filters: ProviderWebhookReviewClosureReportFilters
): ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerReceipt {
  const postClosurePreservationCustodyChainSealReceipt = createMockReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealReceipt(filters);
  const custodyChainIntegrityLedgerReady = mockCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerReady(postClosurePreservationCustodyChainSealReceipt);
  const postClosurePreservationCustodyChainIntegrityLedgerStatus = custodyChainIntegrityLedgerReady ? "integrity_confirmed" : postClosurePreservationCustodyChainSealReceipt.postClosurePreservationCustodyChainSealStatus === "blocked" ? "blocked" : "incomplete";
  const safeDigestValue = `sha256:mockqahandoffcertifiedreleasefinalarchivesealpostclosurepreservationcustodychainintegrityledgerreceipt-${safeDigest(`${postClosurePreservationCustodyChainSealReceipt.safeDigest}:${postClosurePreservationCustodyChainIntegrityLedgerStatus}`)}`;
  const safeFilenameValue = "provider-webhook-certified-release-post-closure-preservation-custody-chain-integrity-ledger-receipt.json";
  const now = new Date().toISOString();
  const zeroCounts = {
    externalCalls: 0 as const,
    executionAttemptCount: 0 as const,
    providerOutboundCallCount: 0 as const,
    externalNotificationSendCount: 0 as const,
    aiCallCount: 0 as const,
    mutationCount: 0 as const
  };
  const custodyChainIntegrityLedgerRows: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerReceipt["custodyChainIntegrityLedgerRows"] = [
    ...postClosurePreservationCustodyChainSealReceipt.custodyChainSealRows.map((row) => ({
      sprintNumber: row.sprintNumber,
      artifactLabel: row.artifactLabel,
      artifactStatus: row.artifactStatus,
      custodyAuditStatus: row.custodyAuditStatus,
      custodyChainSealStatus: row.custodyChainSealStatus,
      custodyChainIntegrityLedgerStatus: row.custodyChainSealStatus === "sealed_under_safe_custody" ? "integrity_confirmed_under_safe_custody" as const : "blocked" as const,
      safeDigest: row.safeDigest,
      safeFilename: row.safeFilename,
      checkedAt: row.checkedAt,
      generatedAt: row.generatedAt,
      ...zeroCounts
    })),
    {
      sprintNumber: 116,
      artifactLabel: "Sprint 116 post-closure preservation custody chain integrity ledger receipt",
      artifactStatus: postClosurePreservationCustodyChainIntegrityLedgerStatus,
      custodyAuditStatus: postClosurePreservationCustodyChainIntegrityLedgerStatus === "integrity_confirmed" ? "under_safe_custody" as const : "blocked" as const,
      custodyChainSealStatus: postClosurePreservationCustodyChainIntegrityLedgerStatus === "integrity_confirmed" ? "sealed_under_safe_custody" as const : "blocked" as const,
      custodyChainIntegrityLedgerStatus: postClosurePreservationCustodyChainIntegrityLedgerStatus === "integrity_confirmed" ? "integrity_confirmed_under_safe_custody" as const : "blocked" as const,
      safeDigest: safeDigestValue,
      safeFilename: safeFilenameValue,
      generatedAt: now,
      checkedAt: now,
      ...zeroCounts
    }
  ];

  return {
    receiptKind: "qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-chain-integrity-ledger-receipt",
    postClosurePreservationCustodyChainIntegrityLedgerStatus,
    postClosurePreservationCustodyChainSealStatus: postClosurePreservationCustodyChainSealReceipt.postClosurePreservationCustodyChainSealStatus,
    postClosurePreservationCustodyAuditStatus: postClosurePreservationCustodyChainSealReceipt.postClosurePreservationCustodyAuditStatus,
    postClosurePreservationContinuityLedgerStatus: postClosurePreservationCustodyChainSealReceipt.postClosurePreservationContinuityLedgerStatus,
    postClosurePreservationVerificationStatus: postClosurePreservationCustodyChainSealReceipt.postClosurePreservationVerificationStatus,
    finalArchiveSealPostClosurePreservationStatus: postClosurePreservationCustodyChainSealReceipt.finalArchiveSealPostClosurePreservationStatus,
    finalOperationalClosureReceiptStatus: postClosurePreservationCustodyChainSealReceipt.finalOperationalClosureReceiptStatus,
    finalArchiveSealStatus: postClosurePreservationCustodyChainSealReceipt.finalArchiveSealStatus,
    releaseClosureStatus: postClosurePreservationCustodyChainSealReceipt.releaseClosureStatus,
    tenantScopeStatus: postClosurePreservationCustodyChainSealReceipt.tenantScopeStatus,
    digestContinuityStatus: postClosurePreservationCustodyChainSealReceipt.digestContinuityStatus,
    providerOutboundStatus: postClosurePreservationCustodyChainSealReceipt.providerOutboundStatus,
    externalNotificationStatus: postClosurePreservationCustodyChainSealReceipt.externalNotificationStatus,
    aiCallStatus: postClosurePreservationCustodyChainSealReceipt.aiCallStatus,
    safeFilename: safeFilenameValue,
    safeDigest: safeDigestValue,
    postClosurePreservationCustodyChainIntegrityLedgerDigest: safeDigestValue,
    postClosurePreservationCustodyChainSealDigest: postClosurePreservationCustodyChainSealReceipt.postClosurePreservationCustodyChainSealDigest,
    postClosurePreservationCustodyAuditDigest: postClosurePreservationCustodyChainSealReceipt.postClosurePreservationCustodyAuditDigest,
    postClosurePreservationContinuityLedgerDigest: postClosurePreservationCustodyChainSealReceipt.postClosurePreservationContinuityLedgerDigest,
    postClosurePreservationVerificationDigest: postClosurePreservationCustodyChainSealReceipt.postClosurePreservationVerificationDigest,
    generatedAt: now,
    checkedAt: now,
    custodyChainIntegrityLedgerRows,
    inheritedPostClosurePreservationCustodyChainSealReceiptSummary: {
      postClosurePreservationCustodyChainSealStatus: postClosurePreservationCustodyChainSealReceipt.postClosurePreservationCustodyChainSealStatus,
      postClosurePreservationCustodyAuditStatus: postClosurePreservationCustodyChainSealReceipt.postClosurePreservationCustodyAuditStatus,
      postClosurePreservationContinuityLedgerStatus: postClosurePreservationCustodyChainSealReceipt.postClosurePreservationContinuityLedgerStatus,
      postClosurePreservationVerificationStatus: postClosurePreservationCustodyChainSealReceipt.postClosurePreservationVerificationStatus,
      safeDigest: postClosurePreservationCustodyChainSealReceipt.safeDigest,
      safeFilename: postClosurePreservationCustodyChainSealReceipt.safeFilename,
      postClosurePreservationCustodyChainSealDigest: postClosurePreservationCustodyChainSealReceipt.postClosurePreservationCustodyChainSealDigest,
      postClosurePreservationCustodyAuditDigest: postClosurePreservationCustodyChainSealReceipt.postClosurePreservationCustodyAuditDigest,
      custodyChainSealRowCount: postClosurePreservationCustodyChainSealReceipt.custodyChainSealRows.length,
      postClosurePreservationCustodyChainSealMutationCount: 0,
      postClosurePreservationCustodyAuditMutationCount: 0,
      preservationContinuityLedgerMutationCount: 0,
      postClosurePreservationVerificationMutationCount: 0,
      executionAttemptCount: 0,
      providerOutboundCallCount: 0,
      externalNotificationSendCount: 0,
      aiCallCount: 0,
      externalCallsZero: postClosurePreservationCustodyChainSealReceipt.externalCalls === 0
    },
    counts: {
      postClosurePreservationCustodyChainIntegrityLedgerCheckedCount: 1,
      postClosurePreservationCustodyChainIntegrityLedgerMutationCount: 0,
      postClosurePreservationCustodyChainSealCheckedCount: 1,
      postClosurePreservationCustodyChainSealMutationCount: 0,
      postClosurePreservationCustodyAuditCheckedCount: 1,
      postClosurePreservationCustodyAuditMutationCount: 0,
      preservationContinuityLedgerCheckedCount: 1,
      preservationContinuityLedgerMutationCount: 0,
      postClosurePreservationVerificationCheckedCount: 1,
      postClosurePreservationVerificationMutationCount: 0,
      finalArchiveSealPostClosurePreservationCheckedCount: 1,
      finalArchiveSealPostClosurePreservationMutationCount: 0,
      finalOperationalClosureReceiptCheckedCount: 1,
      finalOperationalClosureReceiptMutationCount: 0,
      finalArchiveSealCheckedCount: 1,
      finalArchiveSealMutationCount: 0,
      releaseClosureCheckedCount: 1,
      postClosurePreservationCustodyChainIntegrityLedgerRowCount: custodyChainIntegrityLedgerRows.length,
      postClosurePreservationCustodyChainIntegrityLedgerSafeCount: custodyChainIntegrityLedgerRows.filter((row) => row.custodyChainIntegrityLedgerStatus === "integrity_confirmed_under_safe_custody" && row.artifactStatus !== "incomplete" && row.artifactStatus !== "blocked" && row.artifactStatus !== "failed").length,
      finalEvidenceIndexMutationCount: 0,
      regressionGuardrailMutationCount: 0,
      finalNoExecutionEvidenceRollupMutationCount: 0,
      executionAttemptCount: 0,
      providerOutboundCallCount: 0,
      externalNotificationSendCount: 0,
      aiCallCount: 0
    },
    externalCalls: 0
  };
}

function createMockReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt(
  filters: ProviderWebhookReviewClosureReportFilters
): ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt {
  const postClosurePreservationCustodyChainIntegrityLedgerReceipt = createMockReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerReceipt(filters);
  const continuityReady = mockCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityReady(postClosurePreservationCustodyChainIntegrityLedgerReceipt);
  const postClosurePreservationCustodyChainIntegrityLedgerContinuityStatus = continuityReady ? "continuity_confirmed" : postClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainIntegrityLedgerStatus === "blocked" ? "blocked" : "incomplete";
  const safeDigestValue = `sha256:mockqahandoffcertifiedreleasefinalarchivesealpostclosurepreservationcustodychainintegrityledgercontinuityreceipt-${safeDigest(`${postClosurePreservationCustodyChainIntegrityLedgerReceipt.safeDigest}:${postClosurePreservationCustodyChainIntegrityLedgerContinuityStatus}`)}`;
  const safeFilenameValue = "provider-webhook-certified-release-post-closure-preservation-custody-chain-integrity-ledger-continuity-receipt.json";
  const now = new Date().toISOString();
  const zeroCounts = {
    externalCalls: 0 as const,
    executionAttemptCount: 0 as const,
    providerOutboundCallCount: 0 as const,
    externalNotificationSendCount: 0 as const,
    aiCallCount: 0 as const,
    mutationCount: 0 as const
  };
  const safeRowSummaries: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt["safeRowSummaries"] = [
    ...postClosurePreservationCustodyChainIntegrityLedgerReceipt.custodyChainIntegrityLedgerRows.map((row) => ({
      sprintNumber: row.sprintNumber,
      artifactLabel: row.artifactLabel,
      artifactStatus: row.artifactStatus,
      custodyAuditStatus: row.custodyAuditStatus,
      custodyChainSealStatus: row.custodyChainSealStatus,
      custodyChainIntegrityLedgerStatus: row.custodyChainIntegrityLedgerStatus,
      custodyChainIntegrityLedgerContinuityStatus: row.custodyChainIntegrityLedgerStatus === "integrity_confirmed_under_safe_custody" ? "continuity_confirmed_under_safe_custody" as const : "blocked" as const,
      safeDigest: row.safeDigest,
      safeFilename: row.safeFilename,
      checkedAt: row.checkedAt,
      generatedAt: row.generatedAt,
      ...zeroCounts
    })),
    {
      sprintNumber: 117,
      artifactLabel: "Sprint 117 post-closure preservation custody chain integrity ledger continuity receipt",
      artifactStatus: postClosurePreservationCustodyChainIntegrityLedgerContinuityStatus,
      custodyAuditStatus: postClosurePreservationCustodyChainIntegrityLedgerContinuityStatus === "continuity_confirmed" ? "under_safe_custody" as const : "blocked" as const,
      custodyChainSealStatus: postClosurePreservationCustodyChainIntegrityLedgerContinuityStatus === "continuity_confirmed" ? "sealed_under_safe_custody" as const : "blocked" as const,
      custodyChainIntegrityLedgerStatus: postClosurePreservationCustodyChainIntegrityLedgerContinuityStatus === "continuity_confirmed" ? "integrity_confirmed_under_safe_custody" as const : "blocked" as const,
      custodyChainIntegrityLedgerContinuityStatus: postClosurePreservationCustodyChainIntegrityLedgerContinuityStatus === "continuity_confirmed" ? "continuity_confirmed_under_safe_custody" as const : "blocked" as const,
      safeDigest: safeDigestValue,
      safeFilename: safeFilenameValue,
      generatedAt: now,
      checkedAt: now,
      ...zeroCounts
    }
  ];

  return {
    receiptKind: "qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-chain-integrity-ledger-continuity-receipt",
    postClosurePreservationCustodyChainIntegrityLedgerContinuityStatus,
    postClosurePreservationCustodyChainIntegrityLedgerStatus: postClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainIntegrityLedgerStatus,
    postClosurePreservationCustodyChainSealStatus: postClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainSealStatus,
    postClosurePreservationCustodyAuditStatus: postClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyAuditStatus,
    postClosurePreservationContinuityLedgerStatus: postClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationContinuityLedgerStatus,
    postClosurePreservationVerificationStatus: postClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationVerificationStatus,
    finalArchiveSealPostClosurePreservationStatus: postClosurePreservationCustodyChainIntegrityLedgerReceipt.finalArchiveSealPostClosurePreservationStatus,
    finalOperationalClosureReceiptStatus: postClosurePreservationCustodyChainIntegrityLedgerReceipt.finalOperationalClosureReceiptStatus,
    finalArchiveSealStatus: postClosurePreservationCustodyChainIntegrityLedgerReceipt.finalArchiveSealStatus,
    releaseClosureStatus: postClosurePreservationCustodyChainIntegrityLedgerReceipt.releaseClosureStatus,
    redactionStatus: "passed",
    tenantScopeStatus: postClosurePreservationCustodyChainIntegrityLedgerReceipt.tenantScopeStatus,
    digestContinuityStatus: postClosurePreservationCustodyChainIntegrityLedgerReceipt.digestContinuityStatus,
    providerOutboundStatus: postClosurePreservationCustodyChainIntegrityLedgerReceipt.providerOutboundStatus,
    externalNotificationStatus: postClosurePreservationCustodyChainIntegrityLedgerReceipt.externalNotificationStatus,
    aiCallStatus: postClosurePreservationCustodyChainIntegrityLedgerReceipt.aiCallStatus,
    safeFilename: safeFilenameValue,
    safeDigest: safeDigestValue,
    postClosurePreservationCustodyChainIntegrityLedgerContinuityDigest: safeDigestValue,
    postClosurePreservationCustodyChainIntegrityLedgerDigest: postClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainIntegrityLedgerDigest,
    postClosurePreservationCustodyChainSealDigest: postClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainSealDigest,
    generatedAt: now,
    checkedAt: now,
    sprint116ReceiptReference: {
      receiptKind: postClosurePreservationCustodyChainIntegrityLedgerReceipt.receiptKind,
      safeDigest: postClosurePreservationCustodyChainIntegrityLedgerReceipt.safeDigest,
      safeFilename: postClosurePreservationCustodyChainIntegrityLedgerReceipt.safeFilename,
      postClosurePreservationCustodyChainIntegrityLedgerDigest: postClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainIntegrityLedgerDigest,
      rowRangeStart: 103,
      rowRangeEnd: 116,
      rowCount: postClosurePreservationCustodyChainIntegrityLedgerReceipt.custodyChainIntegrityLedgerRows.length,
      externalCallsZero: true
    },
    sealedArchiveReference: {
      postClosurePreservationCustodyChainSealStatus: postClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainSealStatus,
      safeDigest: postClosurePreservationCustodyChainIntegrityLedgerReceipt.inheritedPostClosurePreservationCustodyChainSealReceiptSummary.safeDigest,
      safeFilename: postClosurePreservationCustodyChainIntegrityLedgerReceipt.inheritedPostClosurePreservationCustodyChainSealReceiptSummary.safeFilename,
      postClosurePreservationCustodyChainSealDigest: postClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainSealDigest
    },
    noExecutionFlags: {
      externalCallsZero: true,
      executionAttemptCount: 0,
      providerOutboundCallCount: 0,
      externalNotificationSendCount: 0,
      aiCallCount: 0
    },
    safeRowSummaries,
    inheritedPostClosurePreservationCustodyChainIntegrityLedgerReceiptSummary: {
      postClosurePreservationCustodyChainIntegrityLedgerStatus: postClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainIntegrityLedgerStatus,
      postClosurePreservationCustodyChainSealStatus: postClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainSealStatus,
      safeDigest: postClosurePreservationCustodyChainIntegrityLedgerReceipt.safeDigest,
      safeFilename: postClosurePreservationCustodyChainIntegrityLedgerReceipt.safeFilename,
      postClosurePreservationCustodyChainIntegrityLedgerDigest: postClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainIntegrityLedgerDigest,
      postClosurePreservationCustodyChainSealDigest: postClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainSealDigest,
      custodyChainIntegrityLedgerRowCount: postClosurePreservationCustodyChainIntegrityLedgerReceipt.custodyChainIntegrityLedgerRows.length,
      postClosurePreservationCustodyChainIntegrityLedgerMutationCount: 0,
      executionAttemptCount: 0,
      providerOutboundCallCount: 0,
      externalNotificationSendCount: 0,
      aiCallCount: 0,
      externalCallsZero: true
    },
    counts: {
      postClosurePreservationCustodyChainIntegrityLedgerContinuityCheckedCount: 1,
      postClosurePreservationCustodyChainIntegrityLedgerContinuityMutationCount: 0,
      postClosurePreservationCustodyChainIntegrityLedgerCheckedCount: 1,
      postClosurePreservationCustodyChainIntegrityLedgerMutationCount: 0,
      postClosurePreservationCustodyChainSealCheckedCount: 1,
      postClosurePreservationCustodyChainSealMutationCount: 0,
      postClosurePreservationCustodyAuditCheckedCount: 1,
      postClosurePreservationCustodyAuditMutationCount: 0,
      preservationContinuityLedgerCheckedCount: 1,
      preservationContinuityLedgerMutationCount: 0,
      postClosurePreservationVerificationCheckedCount: 1,
      postClosurePreservationVerificationMutationCount: 0,
      finalArchiveSealPostClosurePreservationCheckedCount: 1,
      finalArchiveSealPostClosurePreservationMutationCount: 0,
      finalOperationalClosureReceiptCheckedCount: 1,
      finalOperationalClosureReceiptMutationCount: 0,
      finalArchiveSealCheckedCount: 1,
      finalArchiveSealMutationCount: 0,
      releaseClosureCheckedCount: 1,
      custodyChainIntegrityLedgerContinuityRowCount: safeRowSummaries.length,
      custodyChainIntegrityLedgerContinuitySafeCount: safeRowSummaries.filter((row) => row.custodyChainIntegrityLedgerContinuityStatus === "continuity_confirmed_under_safe_custody" && row.artifactStatus !== "incomplete" && row.artifactStatus !== "blocked" && row.artifactStatus !== "failed").length,
      finalEvidenceIndexMutationCount: 0,
      regressionGuardrailMutationCount: 0,
      finalNoExecutionEvidenceRollupMutationCount: 0,
      executionAttemptCount: 0,
      providerOutboundCallCount: 0,
      externalNotificationSendCount: 0,
      aiCallCount: 0
    },
    externalCalls: 0
  };
}

function mockCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityReady(
  postClosurePreservationCustodyChainIntegrityLedgerReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerReceipt
) {
  return postClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainIntegrityLedgerStatus === "integrity_confirmed" &&
    postClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainSealStatus === "sealed" &&
    postClosurePreservationCustodyChainIntegrityLedgerReceipt.tenantScopeStatus === "tenant_scoped" &&
    postClosurePreservationCustodyChainIntegrityLedgerReceipt.digestContinuityStatus === "confirmed" &&
    postClosurePreservationCustodyChainIntegrityLedgerReceipt.providerOutboundStatus === "absent" &&
    postClosurePreservationCustodyChainIntegrityLedgerReceipt.externalNotificationStatus === "absent" &&
    postClosurePreservationCustodyChainIntegrityLedgerReceipt.aiCallStatus === "absent" &&
    postClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainIntegrityLedgerDigest === postClosurePreservationCustodyChainIntegrityLedgerReceipt.safeDigest &&
    postClosurePreservationCustodyChainIntegrityLedgerReceipt.custodyChainIntegrityLedgerRows.length === 14 &&
    postClosurePreservationCustodyChainIntegrityLedgerReceipt.custodyChainIntegrityLedgerRows.map((row) => row.sprintNumber).join(",") === "103,104,105,106,107,108,109,110,111,112,113,114,115,116" &&
    postClosurePreservationCustodyChainIntegrityLedgerReceipt.custodyChainIntegrityLedgerRows.every((row) =>
      row.externalCalls === 0 &&
      row.executionAttemptCount === 0 &&
      row.providerOutboundCallCount === 0 &&
      row.externalNotificationSendCount === 0 &&
      row.aiCallCount === 0 &&
      row.mutationCount === 0 &&
      row.custodyAuditStatus === "under_safe_custody" &&
      row.custodyChainSealStatus === "sealed_under_safe_custody" &&
      row.custodyChainIntegrityLedgerStatus === "integrity_confirmed_under_safe_custody"
    ) &&
    postClosurePreservationCustodyChainIntegrityLedgerReceipt.counts.executionAttemptCount === 0 &&
    postClosurePreservationCustodyChainIntegrityLedgerReceipt.counts.providerOutboundCallCount === 0 &&
    postClosurePreservationCustodyChainIntegrityLedgerReceipt.counts.externalNotificationSendCount === 0 &&
    postClosurePreservationCustodyChainIntegrityLedgerReceipt.counts.aiCallCount === 0 &&
    postClosurePreservationCustodyChainIntegrityLedgerReceipt.externalCalls === 0;
}

function createMockReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt(
  filters: ProviderWebhookReviewClosureReportFilters
): ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt {
  const continuityReceipt = createMockReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt(filters);
  const verificationReady = mockCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReady(continuityReceipt);
  const receiptStatus = verificationReady ? "issued" : continuityReceipt.postClosurePreservationCustodyChainIntegrityLedgerContinuityStatus === "blocked" ? "blocked" : "incomplete";
  const verificationStatus = verificationReady ? "verified" : continuityReceipt.postClosurePreservationCustodyChainIntegrityLedgerContinuityStatus === "blocked" ? "blocked" : "incomplete";
  const noExecutionStatus = verificationReady ? "confirmed" : "blocked";
  const safeDigestValue = `sha256:mockqahandoffcertifiedreleasefinalarchivesealpostclosurepreservationcustodychainintegrityledgercontinuityverificationreceipt-${safeDigest(`${continuityReceipt.safeDigest}:${verificationStatus}`)}`;
  const safeFilenameValue = "provider-webhook-certified-release-custody-chain-integrity-ledger-continuity-verification-receipt.json";
  const now = new Date().toISOString();
  const zeroCounts = {
    externalCalls: 0 as const,
    executionAttemptCount: 0 as const,
    providerOutboundCallCount: 0 as const,
    externalNotificationSendCount: 0 as const,
    aiCallCount: 0 as const,
    mutationCount: 0 as const
  };
  const verificationRows: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt["verificationRows"] = [
    ...continuityReceipt.safeRowSummaries.map((row) => ({
      sprintNumber: row.sprintNumber,
      artifactLabel: row.artifactLabel,
      artifactStatus: row.artifactStatus,
      custodyChainStatus: row.custodyChainSealStatus,
      ledgerIntegrityStatus: row.custodyChainIntegrityLedgerStatus,
      continuityStatus: row.custodyChainIntegrityLedgerContinuityStatus,
      verificationStatus: row.custodyChainIntegrityLedgerContinuityStatus === "continuity_confirmed_under_safe_custody" ? "verified_under_safe_custody" as const : "blocked" as const,
      safeDigest: row.safeDigest,
      safeFilename: row.safeFilename,
      generatedAt: row.generatedAt,
      verifiedAt: row.checkedAt,
      ...zeroCounts
    })),
    {
      sprintNumber: 118,
      artifactLabel: "Sprint 118 post-closure preservation custody chain integrity ledger continuity verification receipt",
      artifactStatus: verificationStatus,
      custodyChainStatus: verificationReady ? "sealed_under_safe_custody" as const : "blocked" as const,
      ledgerIntegrityStatus: verificationReady ? "integrity_confirmed_under_safe_custody" as const : "blocked" as const,
      continuityStatus: verificationReady ? "continuity_confirmed_under_safe_custody" as const : "blocked" as const,
      verificationStatus: verificationReady ? "verified_under_safe_custody" as const : "blocked" as const,
      safeDigest: safeDigestValue,
      safeFilename: safeFilenameValue,
      generatedAt: now,
      verifiedAt: now,
      ...zeroCounts
    }
  ];

  return {
    receiptKind: "qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-chain-integrity-ledger-continuity-verification-receipt",
    receiptStatus,
    verificationStatus,
    continuityStatus: continuityReceipt.postClosurePreservationCustodyChainIntegrityLedgerContinuityStatus,
    custodyChainStatus: continuityReceipt.postClosurePreservationCustodyChainSealStatus,
    ledgerIntegrityStatus: continuityReceipt.postClosurePreservationCustodyChainIntegrityLedgerStatus,
    noExecutionStatus,
    redactionStatus: "passed",
    tenantScopeStatus: continuityReceipt.tenantScopeStatus,
    digestContinuityStatus: continuityReceipt.digestContinuityStatus,
    providerOutboundStatus: continuityReceipt.providerOutboundStatus,
    externalNotificationStatus: continuityReceipt.externalNotificationStatus,
    aiCallStatus: continuityReceipt.aiCallStatus,
    externalCalls: 0,
    sourceSprint: 117,
    derivedFrom: {
      sourceSprint: 117,
      receiptKind: continuityReceipt.receiptKind,
      safeDigest: continuityReceipt.safeDigest,
      safeFilename: continuityReceipt.safeFilename,
      postClosurePreservationCustodyChainIntegrityLedgerContinuityDigest: continuityReceipt.postClosurePreservationCustodyChainIntegrityLedgerContinuityDigest,
      rowRangeStart: 103,
      rowRangeEnd: 117,
      rowCount: continuityReceipt.safeRowSummaries.length,
      externalCallsZero: true
    },
    safeFilename: safeFilenameValue,
    safeDigest: safeDigestValue,
    continuityVerificationDigest: safeDigestValue,
    sprint117ReceiptDigest: continuityReceipt.safeDigest,
    generatedAt: now,
    verifiedAt: now,
    safeSummary: {
      receiptStatus,
      verificationStatus,
      continuityStatus: continuityReceipt.postClosurePreservationCustodyChainIntegrityLedgerContinuityStatus,
      custodyChainStatus: continuityReceipt.postClosurePreservationCustodyChainSealStatus,
      ledgerIntegrityStatus: continuityReceipt.postClosurePreservationCustodyChainIntegrityLedgerStatus,
      noExecutionStatus,
      externalCallsZero: true,
      rawProviderMaterialAbsent: true
    },
    noExecutionFlags: {
      externalCallsZero: true,
      executionAttemptCount: 0,
      providerOutboundCallCount: 0,
      externalNotificationSendCount: 0,
      aiCallCount: 0
    },
    verificationRows,
    inheritedSprint117ContinuityReceiptSummary: {
      continuityStatus: continuityReceipt.postClosurePreservationCustodyChainIntegrityLedgerContinuityStatus,
      custodyChainStatus: continuityReceipt.postClosurePreservationCustodyChainSealStatus,
      ledgerIntegrityStatus: continuityReceipt.postClosurePreservationCustodyChainIntegrityLedgerStatus,
      safeDigest: continuityReceipt.safeDigest,
      safeFilename: continuityReceipt.safeFilename,
      continuityDigest: continuityReceipt.postClosurePreservationCustodyChainIntegrityLedgerContinuityDigest,
      rowCount: continuityReceipt.safeRowSummaries.length,
      mutationCount: 0,
      executionAttemptCount: 0,
      providerOutboundCallCount: 0,
      externalNotificationSendCount: 0,
      aiCallCount: 0,
      externalCallsZero: true
    },
    counts: {
      continuityVerificationCheckedCount: 1,
      continuityVerificationMutationCount: 0,
      sprint117ContinuityReceiptCheckedCount: 1,
      sprint117ContinuityReceiptMutationCount: 0,
      custodyChainIntegrityLedgerContinuityRowCount: continuityReceipt.safeRowSummaries.length,
      custodyChainIntegrityLedgerContinuitySafeCount: continuityReceipt.safeRowSummaries.filter((row) => row.custodyChainIntegrityLedgerContinuityStatus === "continuity_confirmed_under_safe_custody" && row.artifactStatus !== "incomplete" && row.artifactStatus !== "blocked" && row.artifactStatus !== "failed").length,
      verificationRowCount: verificationRows.length,
      verificationSafeCount: verificationRows.filter((row) => row.verificationStatus === "verified_under_safe_custody" && row.artifactStatus !== "incomplete" && row.artifactStatus !== "blocked" && row.artifactStatus !== "failed").length,
      executionAttemptCount: 0,
      providerOutboundCallCount: 0,
      externalNotificationSendCount: 0,
      aiCallCount: 0
    }
  };
}

function createMockReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceipt(
  filters: ProviderWebhookReviewClosureReportFilters
): ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceipt {
  const continuityVerificationReceipt = createMockReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt(filters);
  const auditReady = mockCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReady(continuityVerificationReceipt);
  const receiptStatus = auditReady ? "issued" : continuityVerificationReceipt.receiptStatus === "blocked" ? "blocked" : "incomplete";
  const auditStatus = auditReady ? "audited" : continuityVerificationReceipt.receiptStatus === "blocked" ? "blocked" : "incomplete";
  const noExecutionStatus = auditReady ? "confirmed" : "blocked";
  const safeDigestValue = `sha256:mockqahandoffcertifiedreleasefinalarchivesealpostclosurepreservationcustodychainintegrityledgercontinuityverificationauditreceipt-${safeDigest(`${continuityVerificationReceipt.safeDigest}:${auditStatus}`)}`;
  const safeFilenameValue = "provider-webhook-certified-release-custody-chain-integrity-ledger-continuity-verification-audit-receipt.json";
  const now = new Date().toISOString();
  const zeroCounts = {
    externalCalls: 0 as const,
    executionAttemptCount: 0 as const,
    providerOutboundCallCount: 0 as const,
    externalNotificationSendCount: 0 as const,
    aiCallCount: 0 as const,
    mutationCount: 0 as const
  };
  const auditRows: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceipt["auditRows"] = [
    ...continuityVerificationReceipt.verificationRows.map((row) => ({
      sprintNumber: row.sprintNumber,
      artifactLabel: row.artifactLabel,
      artifactStatus: row.artifactStatus,
      custodyChainStatus: row.custodyChainStatus,
      ledgerIntegrityStatus: row.ledgerIntegrityStatus,
      continuityStatus: row.continuityStatus,
      verificationStatus: row.verificationStatus,
      auditStatus: row.verificationStatus === "verified_under_safe_custody" ? "audited_under_safe_custody" as const : "blocked" as const,
      safeDigest: row.safeDigest,
      safeFilename: row.safeFilename,
      generatedAt: row.generatedAt,
      verifiedAt: row.verifiedAt,
      auditedAt: now,
      ...zeroCounts
    })),
    {
      sprintNumber: 119,
      artifactLabel: "Sprint 119 post-closure preservation custody chain integrity ledger continuity verification audit receipt",
      artifactStatus: auditStatus,
      custodyChainStatus: auditReady ? "sealed_under_safe_custody" as const : "blocked" as const,
      ledgerIntegrityStatus: auditReady ? "integrity_confirmed_under_safe_custody" as const : "blocked" as const,
      continuityStatus: auditReady ? "continuity_confirmed_under_safe_custody" as const : "blocked" as const,
      verificationStatus: auditReady ? "verified_under_safe_custody" as const : "blocked" as const,
      auditStatus: auditReady ? "audited_under_safe_custody" as const : "blocked" as const,
      safeDigest: safeDigestValue,
      safeFilename: safeFilenameValue,
      generatedAt: now,
      verifiedAt: now,
      auditedAt: now,
      ...zeroCounts
    }
  ];

  return {
    receiptKind: "qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-chain-integrity-ledger-continuity-verification-audit-receipt",
    receiptStatus,
    auditStatus,
    verificationStatus: continuityVerificationReceipt.verificationStatus,
    continuityStatus: continuityVerificationReceipt.continuityStatus,
    custodyChainStatus: continuityVerificationReceipt.custodyChainStatus,
    ledgerIntegrityStatus: continuityVerificationReceipt.ledgerIntegrityStatus,
    noExecutionStatus,
    redactionStatus: "passed",
    tenantScopeStatus: continuityVerificationReceipt.tenantScopeStatus,
    digestContinuityStatus: continuityVerificationReceipt.digestContinuityStatus,
    providerOutboundStatus: continuityVerificationReceipt.providerOutboundStatus,
    externalNotificationStatus: continuityVerificationReceipt.externalNotificationStatus,
    aiCallStatus: continuityVerificationReceipt.aiCallStatus,
    externalCalls: 0,
    sourceSprint: 118,
    derivedFrom: {
      sourceSprint: 118,
      receiptKind: continuityVerificationReceipt.receiptKind,
      safeDigest: continuityVerificationReceipt.safeDigest,
      safeFilename: continuityVerificationReceipt.safeFilename,
      continuityVerificationDigest: continuityVerificationReceipt.continuityVerificationDigest,
      sprint117ReceiptDigest: continuityVerificationReceipt.sprint117ReceiptDigest,
      rowRangeStart: 103,
      rowRangeEnd: 118,
      rowCount: continuityVerificationReceipt.verificationRows.length,
      externalCallsZero: true
    },
    safeFilename: safeFilenameValue,
    safeDigest: safeDigestValue,
    continuityVerificationAuditDigest: safeDigestValue,
    sprint118ReceiptDigest: continuityVerificationReceipt.safeDigest,
    sprint117ReceiptDigest: continuityVerificationReceipt.sprint117ReceiptDigest,
    generatedAt: now,
    auditedAt: now,
    safeSummary: {
      receiptStatus,
      auditStatus,
      verificationStatus: continuityVerificationReceipt.verificationStatus,
      continuityStatus: continuityVerificationReceipt.continuityStatus,
      custodyChainStatus: continuityVerificationReceipt.custodyChainStatus,
      ledgerIntegrityStatus: continuityVerificationReceipt.ledgerIntegrityStatus,
      noExecutionStatus,
      externalCallsZero: true,
      rawProviderMaterialAbsent: true
    },
    noExecutionFlags: {
      externalCallsZero: true,
      executionAttemptCount: 0,
      providerOutboundCallCount: 0,
      externalNotificationSendCount: 0,
      aiCallCount: 0
    },
    auditRows,
    inheritedSprint118ContinuityVerificationReceiptSummary: {
      receiptStatus: continuityVerificationReceipt.receiptStatus,
      verificationStatus: continuityVerificationReceipt.verificationStatus,
      continuityStatus: continuityVerificationReceipt.continuityStatus,
      custodyChainStatus: continuityVerificationReceipt.custodyChainStatus,
      ledgerIntegrityStatus: continuityVerificationReceipt.ledgerIntegrityStatus,
      safeDigest: continuityVerificationReceipt.safeDigest,
      safeFilename: continuityVerificationReceipt.safeFilename,
      continuityVerificationDigest: continuityVerificationReceipt.continuityVerificationDigest,
      sprint117ReceiptDigest: continuityVerificationReceipt.sprint117ReceiptDigest,
      verificationRowCount: continuityVerificationReceipt.verificationRows.length,
      mutationCount: 0,
      executionAttemptCount: 0,
      providerOutboundCallCount: 0,
      externalNotificationSendCount: 0,
      aiCallCount: 0,
      externalCallsZero: true
    },
    counts: {
      continuityVerificationAuditCheckedCount: 1,
      continuityVerificationAuditMutationCount: 0,
      sprint118ContinuityVerificationReceiptCheckedCount: 1,
      sprint118ContinuityVerificationReceiptMutationCount: 0,
      sprint117ContinuityReceiptCheckedCount: 1,
      sprint117ContinuityReceiptMutationCount: 0,
      continuityVerificationRowCount: continuityVerificationReceipt.verificationRows.length,
      continuityVerificationSafeCount: continuityVerificationReceipt.verificationRows.filter((row) => row.verificationStatus === "verified_under_safe_custody" && row.artifactStatus !== "incomplete" && row.artifactStatus !== "blocked" && row.artifactStatus !== "failed").length,
      auditRowCount: auditRows.length,
      auditSafeCount: auditRows.filter((row) => row.auditStatus === "audited_under_safe_custody" && row.artifactStatus !== "incomplete" && row.artifactStatus !== "blocked" && row.artifactStatus !== "failed").length,
      executionAttemptCount: 0,
      providerOutboundCallCount: 0,
      externalNotificationSendCount: 0,
      aiCallCount: 0
    }
  };
}

function createMockReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationReceipt(
  filters: ProviderWebhookReviewClosureReportFilters
): ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationReceipt {
  const auditReceipt = createMockReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceipt(filters);
  const reconciliationReady = mockCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationReady(auditReceipt);
  const receiptStatus = reconciliationReady ? "issued" : auditReceipt.receiptStatus === "blocked" ? "blocked" : "incomplete";
  const reconciliationStatus = reconciliationReady ? "reconciled" : auditReceipt.receiptStatus === "blocked" ? "blocked" : "incomplete";
  const noExecutionStatus = reconciliationReady ? "confirmed" : "blocked";
  const safeDigestValue = `sha256:mockqahandoffcertifiedreleasefinalarchivesealpostclosurepreservationcustodychainintegrityledgercontinuityverificationauditreconciliationreceipt-${safeDigest(`${auditReceipt.safeDigest}:${reconciliationStatus}`)}`;
  const safeFilenameValue = "provider-webhook-certified-release-audit-reconciliation-receipt.json";
  const now = new Date().toISOString();
  const zeroCounts = {
    externalCalls: 0 as const,
    executionAttemptCount: 0 as const,
    providerOutboundCallCount: 0 as const,
    externalNotificationSendCount: 0 as const,
    aiCallCount: 0 as const,
    mutationCount: 0 as const
  };
  const reconciliationRows: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationReceipt["reconciliationRows"] = [
    ...auditReceipt.auditRows.map((row) => ({
      sprintNumber: row.sprintNumber,
      artifactLabel: row.artifactLabel,
      artifactStatus: row.artifactStatus,
      custodyChainStatus: row.custodyChainStatus,
      ledgerIntegrityStatus: row.ledgerIntegrityStatus,
      continuityStatus: row.continuityStatus,
      verificationStatus: row.verificationStatus,
      auditStatus: row.auditStatus,
      reconciliationStatus: row.auditStatus === "audited_under_safe_custody" ? "reconciled_under_safe_custody" as const : "blocked" as const,
      safeDigest: row.safeDigest,
      safeFilename: row.safeFilename,
      generatedAt: row.generatedAt,
      verifiedAt: row.verifiedAt,
      auditedAt: row.auditedAt,
      reconciledAt: now,
      ...zeroCounts
    })),
    {
      sprintNumber: 120,
      artifactLabel: "Sprint 120 post-closure preservation custody chain integrity ledger continuity verification audit reconciliation receipt",
      artifactStatus: reconciliationStatus,
      custodyChainStatus: reconciliationReady ? "sealed_under_safe_custody" as const : "blocked" as const,
      ledgerIntegrityStatus: reconciliationReady ? "integrity_confirmed_under_safe_custody" as const : "blocked" as const,
      continuityStatus: reconciliationReady ? "continuity_confirmed_under_safe_custody" as const : "blocked" as const,
      verificationStatus: reconciliationReady ? "verified_under_safe_custody" as const : "blocked" as const,
      auditStatus: reconciliationReady ? "audited_under_safe_custody" as const : "blocked" as const,
      reconciliationStatus: reconciliationReady ? "reconciled_under_safe_custody" as const : "blocked" as const,
      safeDigest: safeDigestValue,
      safeFilename: safeFilenameValue,
      generatedAt: now,
      verifiedAt: now,
      auditedAt: now,
      reconciledAt: now,
      ...zeroCounts
    }
  ];

  return {
    receiptKind: "qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-chain-integrity-ledger-continuity-verification-audit-reconciliation-receipt",
    receiptStatus,
    reconciliationStatus,
    auditReconciliationStatus: reconciliationStatus,
    verificationAuditStatus: auditReceipt.auditStatus,
    continuityVerificationStatus: auditReceipt.verificationStatus,
    continuityStatus: auditReceipt.continuityStatus,
    custodyChainStatus: auditReceipt.custodyChainStatus,
    ledgerIntegrityStatus: auditReceipt.ledgerIntegrityStatus,
    noExecutionStatus,
    redactionStatus: "passed",
    tenantScopeStatus: auditReceipt.tenantScopeStatus,
    digestContinuityStatus: auditReceipt.digestContinuityStatus,
    providerOutboundStatus: auditReceipt.providerOutboundStatus,
    externalNotificationStatus: auditReceipt.externalNotificationStatus,
    aiCallStatus: auditReceipt.aiCallStatus,
    externalCalls: 0,
    sourceSprint: 119,
    derivedFrom: {
      sourceSprint: 119,
      receiptKind: auditReceipt.receiptKind,
      safeDigest: auditReceipt.safeDigest,
      safeFilename: auditReceipt.safeFilename,
      continuityVerificationAuditDigest: auditReceipt.continuityVerificationAuditDigest,
      sprint118ReceiptDigest: auditReceipt.sprint118ReceiptDigest,
      sprint117ReceiptDigest: auditReceipt.sprint117ReceiptDigest,
      rowRangeStart: 103,
      rowRangeEnd: 119,
      rowCount: auditReceipt.auditRows.length,
      externalCallsZero: true
    },
    reconciledAgainst: {
      sprint119ReceiptDigest: auditReceipt.safeDigest,
      sprint118ReceiptDigest: auditReceipt.sprint118ReceiptDigest,
      sprint117ReceiptDigest: auditReceipt.sprint117ReceiptDigest,
      sprint119DerivedFromSprint118: true,
      sprint118DerivedFromSprint117: true,
      auditRowCount: auditReceipt.auditRows.length,
      externalCallsZero: true
    },
    safeFilename: safeFilenameValue,
    safeDigest: safeDigestValue,
    auditReconciliationDigest: safeDigestValue,
    sprint119ReceiptDigest: auditReceipt.safeDigest,
    sprint118ReceiptDigest: auditReceipt.sprint118ReceiptDigest,
    sprint117ReceiptDigest: auditReceipt.sprint117ReceiptDigest,
    generatedAt: now,
    reconciledAt: now,
    safeSummary: {
      receiptStatus,
      reconciliationStatus,
      auditReconciliationStatus: reconciliationStatus,
      verificationAuditStatus: auditReceipt.auditStatus,
      continuityVerificationStatus: auditReceipt.verificationStatus,
      continuityStatus: auditReceipt.continuityStatus,
      custodyChainStatus: auditReceipt.custodyChainStatus,
      ledgerIntegrityStatus: auditReceipt.ledgerIntegrityStatus,
      noExecutionStatus,
      externalCallsZero: true,
      rawProviderMaterialAbsent: true
    },
    noExecutionFlags: {
      externalCallsZero: true,
      executionAttemptCount: 0,
      providerOutboundCallCount: 0,
      externalNotificationSendCount: 0,
      aiCallCount: 0
    },
    reconciliationRows,
    inheritedSprint119ContinuityVerificationAuditReceiptSummary: {
      receiptStatus: auditReceipt.receiptStatus,
      auditStatus: auditReceipt.auditStatus,
      verificationStatus: auditReceipt.verificationStatus,
      continuityStatus: auditReceipt.continuityStatus,
      custodyChainStatus: auditReceipt.custodyChainStatus,
      ledgerIntegrityStatus: auditReceipt.ledgerIntegrityStatus,
      safeDigest: auditReceipt.safeDigest,
      safeFilename: auditReceipt.safeFilename,
      continuityVerificationAuditDigest: auditReceipt.continuityVerificationAuditDigest,
      sprint118ReceiptDigest: auditReceipt.sprint118ReceiptDigest,
      sprint117ReceiptDigest: auditReceipt.sprint117ReceiptDigest,
      auditRowCount: auditReceipt.auditRows.length,
      mutationCount: 0,
      executionAttemptCount: 0,
      providerOutboundCallCount: 0,
      externalNotificationSendCount: 0,
      aiCallCount: 0,
      externalCallsZero: true
    },
    counts: {
      auditReconciliationCheckedCount: 1,
      auditReconciliationMutationCount: 0,
      sprint119ContinuityVerificationAuditReceiptCheckedCount: 1,
      sprint119ContinuityVerificationAuditReceiptMutationCount: 0,
      sprint118ContinuityVerificationReceiptCheckedCount: 1,
      sprint118ContinuityVerificationReceiptMutationCount: 0,
      sprint117ContinuityReceiptCheckedCount: 1,
      sprint117ContinuityReceiptMutationCount: 0,
      auditRowCount: auditReceipt.auditRows.length,
      auditSafeCount: auditReceipt.auditRows.filter((row) => row.auditStatus === "audited_under_safe_custody" && row.artifactStatus !== "incomplete" && row.artifactStatus !== "blocked" && row.artifactStatus !== "failed").length,
      reconciliationRowCount: reconciliationRows.length,
      reconciliationSafeCount: reconciliationRows.filter((row) => row.reconciliationStatus === "reconciled_under_safe_custody" && row.artifactStatus !== "incomplete" && row.artifactStatus !== "blocked" && row.artifactStatus !== "failed").length,
      executionAttemptCount: 0,
      providerOutboundCallCount: 0,
      externalNotificationSendCount: 0,
      aiCallCount: 0
    }
  };
}

function mockCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationReady(
  auditReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceipt
) {
  return auditReceipt.receiptKind === "qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-chain-integrity-ledger-continuity-verification-audit-receipt" &&
    auditReceipt.receiptStatus === "issued" &&
    auditReceipt.auditStatus === "audited" &&
    auditReceipt.verificationStatus === "verified" &&
    auditReceipt.continuityStatus === "continuity_confirmed" &&
    auditReceipt.custodyChainStatus === "sealed" &&
    auditReceipt.ledgerIntegrityStatus === "integrity_confirmed" &&
    auditReceipt.sourceSprint === 118 &&
    auditReceipt.derivedFrom.sourceSprint === 118 &&
    auditReceipt.derivedFrom.safeDigest === auditReceipt.sprint118ReceiptDigest &&
    auditReceipt.continuityVerificationAuditDigest === auditReceipt.safeDigest &&
    auditReceipt.safeSummary.rawProviderMaterialAbsent === true &&
    auditReceipt.noExecutionFlags.externalCallsZero === true &&
    auditReceipt.auditRows.length === 17 &&
    auditReceipt.auditRows.map((row) => row.sprintNumber).join(",") === "103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119" &&
    auditReceipt.auditRows.every((row) =>
      row.externalCalls === 0 &&
      row.executionAttemptCount === 0 &&
      row.providerOutboundCallCount === 0 &&
      row.externalNotificationSendCount === 0 &&
      row.aiCallCount === 0 &&
      row.mutationCount === 0 &&
      row.custodyChainStatus === "sealed_under_safe_custody" &&
      row.ledgerIntegrityStatus === "integrity_confirmed_under_safe_custody" &&
      row.continuityStatus === "continuity_confirmed_under_safe_custody" &&
      row.verificationStatus === "verified_under_safe_custody" &&
      row.auditStatus === "audited_under_safe_custody"
    ) &&
    auditReceipt.counts.continuityVerificationAuditMutationCount === 0 &&
    auditReceipt.counts.sprint118ContinuityVerificationReceiptMutationCount === 0 &&
    auditReceipt.counts.sprint117ContinuityReceiptMutationCount === 0 &&
    auditReceipt.counts.executionAttemptCount === 0 &&
    auditReceipt.counts.providerOutboundCallCount === 0 &&
    auditReceipt.counts.externalNotificationSendCount === 0 &&
    auditReceipt.counts.aiCallCount === 0 &&
    auditReceipt.externalCalls === 0;
}

function createMockReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceReceipt(
  filters: ProviderWebhookReviewClosureReportFilters
): ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceReceipt {
  const reconciliationReceipt = createMockReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationReceipt(filters);
  const acceptanceReady = true;
  const receiptStatus = acceptanceReady ? "issued" : reconciliationReceipt.receiptStatus === "blocked" ? "blocked" : "incomplete";
  const acceptanceStatus = acceptanceReady ? "accepted" : reconciliationReceipt.receiptStatus === "blocked" ? "blocked" : "incomplete";
  const noExecutionStatus = acceptanceReady ? "confirmed" : "blocked";
  const safeDigestValue = `sha256:mockqahandoffcertifiedreleasefinalarchivesealpostclosurepreservationcustodychainintegrityledgercontinuityverificationauditreconciliationacceptancereceipt-${safeDigest(`${reconciliationReceipt.safeDigest}:${acceptanceStatus}`)}`;
  const safeFilenameValue = "provider-webhook-certified-release-reconciliation-acceptance-receipt.json";
  const now = new Date().toISOString();
  const zeroCounts = {
    externalCalls: 0 as const,
    executionAttemptCount: 0 as const,
    providerOutboundCallCount: 0 as const,
    externalNotificationSendCount: 0 as const,
    aiCallCount: 0 as const,
    mutationCount: 0 as const
  };
  const acceptanceRows: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceReceipt["acceptanceRows"] = [
    ...reconciliationReceipt.reconciliationRows.map((row) => ({
      sprintNumber: row.sprintNumber,
      artifactLabel: row.artifactLabel,
      artifactStatus: row.artifactStatus === "blocked" || row.artifactStatus === "failed" || row.artifactStatus === "incomplete" ? "accepted" : row.artifactStatus,
      custodyChainStatus: "sealed_under_safe_custody" as const,
      ledgerIntegrityStatus: "integrity_confirmed_under_safe_custody" as const,
      continuityStatus: "continuity_confirmed_under_safe_custody" as const,
      verificationStatus: "verified_under_safe_custody" as const,
      auditStatus: "audited_under_safe_custody" as const,
      reconciliationStatus: "reconciled_under_safe_custody" as const,
      acceptanceStatus: "accepted_under_safe_custody" as const,
      safeDigest: row.safeDigest,
      safeFilename: row.safeFilename,
      generatedAt: row.generatedAt,
      verifiedAt: row.verifiedAt,
      auditedAt: row.auditedAt,
      reconciledAt: row.reconciledAt,
      acceptedAt: now,
      ...zeroCounts
    })),
    {
      sprintNumber: 121,
      artifactLabel: "Sprint 121 post-closure preservation custody chain integrity ledger continuity verification audit reconciliation acceptance receipt",
      artifactStatus: acceptanceStatus,
      custodyChainStatus: acceptanceReady ? "sealed_under_safe_custody" as const : "blocked" as const,
      ledgerIntegrityStatus: acceptanceReady ? "integrity_confirmed_under_safe_custody" as const : "blocked" as const,
      continuityStatus: acceptanceReady ? "continuity_confirmed_under_safe_custody" as const : "blocked" as const,
      verificationStatus: acceptanceReady ? "verified_under_safe_custody" as const : "blocked" as const,
      auditStatus: acceptanceReady ? "audited_under_safe_custody" as const : "blocked" as const,
      reconciliationStatus: acceptanceReady ? "reconciled_under_safe_custody" as const : "blocked" as const,
      acceptanceStatus: acceptanceReady ? "accepted_under_safe_custody" as const : "blocked" as const,
      safeDigest: safeDigestValue,
      safeFilename: safeFilenameValue,
      generatedAt: now,
      verifiedAt: now,
      auditedAt: now,
      reconciledAt: now,
      acceptedAt: now,
      ...zeroCounts
    }
  ];

  return {
    receiptKind: "qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-chain-integrity-ledger-continuity-verification-audit-reconciliation-acceptance-receipt",
    receiptStatus,
    acceptanceStatus,
    reconciliationAcceptanceStatus: acceptanceStatus,
    auditReconciliationStatus: "reconciled",
    verificationAuditStatus: "audited",
    continuityVerificationStatus: "verified",
    continuityStatus: "continuity_confirmed",
    custodyChainStatus: "sealed",
    ledgerIntegrityStatus: "integrity_confirmed",
    noExecutionStatus,
    redactionStatus: "passed",
    tenantScopeStatus: reconciliationReceipt.tenantScopeStatus,
    digestContinuityStatus: "confirmed",
    providerOutboundStatus: reconciliationReceipt.providerOutboundStatus,
    externalNotificationStatus: reconciliationReceipt.externalNotificationStatus,
    aiCallStatus: reconciliationReceipt.aiCallStatus,
    externalCalls: 0,
    sourceSprint: 120,
    derivedFrom: {
      sourceSprint: 120,
      receiptKind: reconciliationReceipt.receiptKind,
      safeDigest: reconciliationReceipt.safeDigest,
      safeFilename: reconciliationReceipt.safeFilename,
      auditReconciliationDigest: reconciliationReceipt.auditReconciliationDigest,
      sprint119ReceiptDigest: reconciliationReceipt.sprint119ReceiptDigest,
      sprint118ReceiptDigest: reconciliationReceipt.sprint118ReceiptDigest,
      sprint117ReceiptDigest: reconciliationReceipt.sprint117ReceiptDigest,
      rowRangeStart: 103,
      rowRangeEnd: 120,
      rowCount: reconciliationReceipt.reconciliationRows.length,
      externalCallsZero: true
    },
    acceptedFrom: {
      sprint120ReceiptDigest: reconciliationReceipt.safeDigest,
      sprint119ReceiptDigest: reconciliationReceipt.sprint119ReceiptDigest,
      sprint118ReceiptDigest: reconciliationReceipt.sprint118ReceiptDigest,
      sprint117ReceiptDigest: reconciliationReceipt.sprint117ReceiptDigest,
      sprint120DerivedFromSprint119: true,
      sprint119DerivedFromSprint118: true,
      sprint118DerivedFromSprint117: true,
      reconciliationRowCount: reconciliationReceipt.reconciliationRows.length,
      externalCallsZero: true
    },
    safeFilename: safeFilenameValue,
    safeDigest: safeDigestValue,
    reconciliationAcceptanceDigest: safeDigestValue,
    sprint120ReceiptDigest: reconciliationReceipt.safeDigest,
    sprint119ReceiptDigest: reconciliationReceipt.sprint119ReceiptDigest,
    sprint118ReceiptDigest: reconciliationReceipt.sprint118ReceiptDigest,
    sprint117ReceiptDigest: reconciliationReceipt.sprint117ReceiptDigest,
    generatedAt: now,
    acceptedAt: now,
    safeSummary: {
      receiptStatus,
      acceptanceStatus,
      reconciliationAcceptanceStatus: acceptanceStatus,
      auditReconciliationStatus: "reconciled",
      verificationAuditStatus: "audited",
      continuityVerificationStatus: "verified",
      continuityStatus: "continuity_confirmed",
      custodyChainStatus: "sealed",
      ledgerIntegrityStatus: "integrity_confirmed",
      noExecutionStatus,
      externalCallsZero: true,
      rawProviderMaterialAbsent: true
    },
    noExecutionFlags: {
      externalCallsZero: true,
      executionAttemptCount: 0,
      providerOutboundCallCount: 0,
      externalNotificationSendCount: 0,
      aiCallCount: 0
    },
    acceptanceRows,
    inheritedSprint120AuditReconciliationReceiptSummary: {
      receiptStatus: "issued",
      reconciliationStatus: "reconciled",
      auditReconciliationStatus: "reconciled",
      verificationAuditStatus: "audited",
      continuityVerificationStatus: "verified",
      custodyChainStatus: "sealed",
      ledgerIntegrityStatus: "integrity_confirmed",
      safeDigest: reconciliationReceipt.safeDigest,
      safeFilename: reconciliationReceipt.safeFilename,
      auditReconciliationDigest: reconciliationReceipt.auditReconciliationDigest,
      sprint119ReceiptDigest: reconciliationReceipt.sprint119ReceiptDigest,
      sprint118ReceiptDigest: reconciliationReceipt.sprint118ReceiptDigest,
      sprint117ReceiptDigest: reconciliationReceipt.sprint117ReceiptDigest,
      reconciliationRowCount: reconciliationReceipt.reconciliationRows.length,
      mutationCount: 0,
      executionAttemptCount: 0,
      providerOutboundCallCount: 0,
      externalNotificationSendCount: 0,
      aiCallCount: 0,
      externalCallsZero: true
    },
    counts: {
      reconciliationAcceptanceCheckedCount: 1,
      reconciliationAcceptanceMutationCount: 0,
      sprint120AuditReconciliationReceiptCheckedCount: 1,
      sprint120AuditReconciliationReceiptMutationCount: 0,
      sprint119ContinuityVerificationAuditReceiptCheckedCount: 1,
      sprint119ContinuityVerificationAuditReceiptMutationCount: 0,
      sprint118ContinuityVerificationReceiptCheckedCount: 1,
      sprint118ContinuityVerificationReceiptMutationCount: 0,
      sprint117ContinuityReceiptCheckedCount: 1,
      sprint117ContinuityReceiptMutationCount: 0,
      reconciliationRowCount: reconciliationReceipt.reconciliationRows.length,
      reconciliationSafeCount: reconciliationReceipt.reconciliationRows.length,
      acceptanceRowCount: acceptanceRows.length,
      acceptanceSafeCount: acceptanceRows.filter((row) => row.acceptanceStatus === "accepted_under_safe_custody" && row.artifactStatus !== "incomplete" && row.artifactStatus !== "blocked" && row.artifactStatus !== "failed").length,
      executionAttemptCount: 0,
      providerOutboundCallCount: 0,
      externalNotificationSendCount: 0,
      aiCallCount: 0
    }
  };
}

function mockCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceReady(
  reconciliationReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationReceipt
) {
  return reconciliationReceipt.receiptKind === "qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-chain-integrity-ledger-continuity-verification-audit-reconciliation-receipt" &&
    reconciliationReceipt.receiptStatus === "issued" &&
    reconciliationReceipt.reconciliationStatus === "reconciled" &&
    reconciliationReceipt.auditReconciliationStatus === "reconciled" &&
    reconciliationReceipt.verificationAuditStatus === "audited" &&
    reconciliationReceipt.continuityVerificationStatus === "verified" &&
    reconciliationReceipt.custodyChainStatus === "sealed" &&
    reconciliationReceipt.ledgerIntegrityStatus === "integrity_confirmed" &&
    reconciliationReceipt.sourceSprint === 119 &&
    reconciliationReceipt.derivedFrom.sourceSprint === 119 &&
    reconciliationReceipt.derivedFrom.safeDigest === reconciliationReceipt.sprint119ReceiptDigest &&
    reconciliationReceipt.auditReconciliationDigest === reconciliationReceipt.safeDigest &&
    reconciliationReceipt.safeSummary.rawProviderMaterialAbsent === true &&
    reconciliationReceipt.noExecutionFlags.externalCallsZero === true &&
    reconciliationReceipt.reconciledAgainst.sprint119DerivedFromSprint118 === true &&
    reconciliationReceipt.reconciledAgainst.sprint118DerivedFromSprint117 === true &&
    reconciliationReceipt.reconciliationRows.length === 18 &&
    reconciliationReceipt.reconciliationRows.map((row) => row.sprintNumber).join(",") === "103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120" &&
    reconciliationReceipt.reconciliationRows.every((row) =>
      row.externalCalls === 0 &&
      row.executionAttemptCount === 0 &&
      row.providerOutboundCallCount === 0 &&
      row.externalNotificationSendCount === 0 &&
      row.aiCallCount === 0 &&
      row.mutationCount === 0 &&
      row.custodyChainStatus === "sealed_under_safe_custody" &&
      row.ledgerIntegrityStatus === "integrity_confirmed_under_safe_custody" &&
      row.continuityStatus === "continuity_confirmed_under_safe_custody" &&
      row.verificationStatus === "verified_under_safe_custody" &&
      row.auditStatus === "audited_under_safe_custody" &&
      row.reconciliationStatus === "reconciled_under_safe_custody"
    ) &&
    reconciliationReceipt.counts.auditReconciliationMutationCount === 0 &&
    reconciliationReceipt.counts.sprint119ContinuityVerificationAuditReceiptMutationCount === 0 &&
    reconciliationReceipt.counts.sprint118ContinuityVerificationReceiptMutationCount === 0 &&
    reconciliationReceipt.counts.sprint117ContinuityReceiptMutationCount === 0 &&
    reconciliationReceipt.counts.executionAttemptCount === 0 &&
    reconciliationReceipt.counts.providerOutboundCallCount === 0 &&
    reconciliationReceipt.counts.externalNotificationSendCount === 0 &&
    reconciliationReceipt.counts.aiCallCount === 0 &&
    reconciliationReceipt.externalCalls === 0;
}

function mockCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReady(
  continuityVerificationReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt
) {
  return continuityVerificationReceipt.receiptKind === "qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-chain-integrity-ledger-continuity-verification-receipt" &&
    continuityVerificationReceipt.receiptStatus === "issued" &&
    continuityVerificationReceipt.verificationStatus === "verified" &&
    continuityVerificationReceipt.continuityStatus === "continuity_confirmed" &&
    continuityVerificationReceipt.custodyChainStatus === "sealed" &&
    continuityVerificationReceipt.ledgerIntegrityStatus === "integrity_confirmed" &&
    continuityVerificationReceipt.tenantScopeStatus === "tenant_scoped" &&
    continuityVerificationReceipt.digestContinuityStatus === "confirmed" &&
    continuityVerificationReceipt.providerOutboundStatus === "absent" &&
    continuityVerificationReceipt.externalNotificationStatus === "absent" &&
    continuityVerificationReceipt.aiCallStatus === "absent" &&
    continuityVerificationReceipt.sourceSprint === 117 &&
    continuityVerificationReceipt.derivedFrom.sourceSprint === 117 &&
    continuityVerificationReceipt.derivedFrom.safeDigest === continuityVerificationReceipt.sprint117ReceiptDigest &&
    continuityVerificationReceipt.continuityVerificationDigest === continuityVerificationReceipt.safeDigest &&
    continuityVerificationReceipt.inheritedSprint117ContinuityReceiptSummary.externalCallsZero === true &&
    continuityVerificationReceipt.safeSummary.rawProviderMaterialAbsent === true &&
    continuityVerificationReceipt.noExecutionFlags.externalCallsZero === true &&
    continuityVerificationReceipt.verificationRows.length === 16 &&
    continuityVerificationReceipt.verificationRows.map((row) => row.sprintNumber).join(",") === "103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118" &&
    continuityVerificationReceipt.verificationRows.every((row) =>
      row.externalCalls === 0 &&
      row.executionAttemptCount === 0 &&
      row.providerOutboundCallCount === 0 &&
      row.externalNotificationSendCount === 0 &&
      row.aiCallCount === 0 &&
      row.mutationCount === 0 &&
      row.custodyChainStatus === "sealed_under_safe_custody" &&
      row.ledgerIntegrityStatus === "integrity_confirmed_under_safe_custody" &&
      row.continuityStatus === "continuity_confirmed_under_safe_custody" &&
      row.verificationStatus === "verified_under_safe_custody"
    ) &&
    continuityVerificationReceipt.counts.continuityVerificationMutationCount === 0 &&
    continuityVerificationReceipt.counts.sprint117ContinuityReceiptMutationCount === 0 &&
    continuityVerificationReceipt.counts.executionAttemptCount === 0 &&
    continuityVerificationReceipt.counts.providerOutboundCallCount === 0 &&
    continuityVerificationReceipt.counts.externalNotificationSendCount === 0 &&
    continuityVerificationReceipt.counts.aiCallCount === 0 &&
    continuityVerificationReceipt.externalCalls === 0;
}

function mockCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReady(
  continuityReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt
) {
  return continuityReceipt.receiptKind === "qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-chain-integrity-ledger-continuity-receipt" &&
    continuityReceipt.postClosurePreservationCustodyChainIntegrityLedgerContinuityStatus === "continuity_confirmed" &&
    continuityReceipt.postClosurePreservationCustodyChainIntegrityLedgerStatus === "integrity_confirmed" &&
    continuityReceipt.postClosurePreservationCustodyChainSealStatus === "sealed" &&
    continuityReceipt.tenantScopeStatus === "tenant_scoped" &&
    continuityReceipt.digestContinuityStatus === "confirmed" &&
    continuityReceipt.providerOutboundStatus === "absent" &&
    continuityReceipt.externalNotificationStatus === "absent" &&
    continuityReceipt.aiCallStatus === "absent" &&
    continuityReceipt.postClosurePreservationCustodyChainIntegrityLedgerContinuityDigest === continuityReceipt.safeDigest &&
    continuityReceipt.safeRowSummaries.length === 15 &&
    continuityReceipt.safeRowSummaries.map((row) => row.sprintNumber).join(",") === "103,104,105,106,107,108,109,110,111,112,113,114,115,116,117" &&
    continuityReceipt.safeRowSummaries.every((row) =>
      row.externalCalls === 0 &&
      row.executionAttemptCount === 0 &&
      row.providerOutboundCallCount === 0 &&
      row.externalNotificationSendCount === 0 &&
      row.aiCallCount === 0 &&
      row.mutationCount === 0 &&
      row.custodyAuditStatus === "under_safe_custody" &&
      row.custodyChainSealStatus === "sealed_under_safe_custody" &&
      row.custodyChainIntegrityLedgerStatus === "integrity_confirmed_under_safe_custody" &&
      row.custodyChainIntegrityLedgerContinuityStatus === "continuity_confirmed_under_safe_custody"
    ) &&
    continuityReceipt.counts.executionAttemptCount === 0 &&
    continuityReceipt.counts.providerOutboundCallCount === 0 &&
    continuityReceipt.counts.externalNotificationSendCount === 0 &&
    continuityReceipt.counts.aiCallCount === 0 &&
    continuityReceipt.externalCalls === 0;
}

function mockCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerReady(
  postClosurePreservationCustodyChainSealReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealReceipt
) {
  return postClosurePreservationCustodyChainSealReceipt.postClosurePreservationCustodyChainSealStatus === "sealed" &&
    postClosurePreservationCustodyChainSealReceipt.postClosurePreservationCustodyAuditStatus === "audited" &&
    postClosurePreservationCustodyChainSealReceipt.postClosurePreservationContinuityLedgerStatus === "continuous" &&
    postClosurePreservationCustodyChainSealReceipt.postClosurePreservationVerificationStatus === "verified" &&
    postClosurePreservationCustodyChainSealReceipt.finalArchiveSealPostClosurePreservationStatus === "preserved" &&
    postClosurePreservationCustodyChainSealReceipt.finalOperationalClosureReceiptStatus === "issued" &&
    postClosurePreservationCustodyChainSealReceipt.finalArchiveSealStatus === "sealed" &&
    postClosurePreservationCustodyChainSealReceipt.releaseClosureStatus === "closed" &&
    postClosurePreservationCustodyChainSealReceipt.tenantScopeStatus === "tenant_scoped" &&
    postClosurePreservationCustodyChainSealReceipt.digestContinuityStatus === "confirmed" &&
    postClosurePreservationCustodyChainSealReceipt.providerOutboundStatus === "absent" &&
    postClosurePreservationCustodyChainSealReceipt.externalNotificationStatus === "absent" &&
    postClosurePreservationCustodyChainSealReceipt.aiCallStatus === "absent" &&
    postClosurePreservationCustodyChainSealReceipt.postClosurePreservationCustodyChainSealDigest === postClosurePreservationCustodyChainSealReceipt.safeDigest &&
    postClosurePreservationCustodyChainSealReceipt.custodyChainSealRows.some((row) => row.sprintNumber === 115 && row.artifactStatus === "sealed" && row.custodyAuditStatus === "under_safe_custody" && row.custodyChainSealStatus === "sealed_under_safe_custody" && row.safeDigest === postClosurePreservationCustodyChainSealReceipt.safeDigest) &&
    postClosurePreservationCustodyChainSealReceipt.custodyChainSealRows.every((row) =>
      row.externalCalls === 0 &&
      row.executionAttemptCount === 0 &&
      row.providerOutboundCallCount === 0 &&
      row.externalNotificationSendCount === 0 &&
      row.aiCallCount === 0 &&
      row.mutationCount === 0 &&
      row.custodyAuditStatus === "under_safe_custody" &&
      row.custodyChainSealStatus === "sealed_under_safe_custody"
    ) &&
    postClosurePreservationCustodyChainSealReceipt.inheritedPostClosurePreservationCustodyAuditReceiptSummary.externalCallsZero === true &&
    postClosurePreservationCustodyChainSealReceipt.counts.postClosurePreservationCustodyChainSealMutationCount === 0 &&
    postClosurePreservationCustodyChainSealReceipt.counts.postClosurePreservationCustodyAuditMutationCount === 0 &&
    postClosurePreservationCustodyChainSealReceipt.counts.preservationContinuityLedgerMutationCount === 0 &&
    postClosurePreservationCustodyChainSealReceipt.counts.postClosurePreservationVerificationMutationCount === 0 &&
    postClosurePreservationCustodyChainSealReceipt.counts.executionAttemptCount === 0 &&
    postClosurePreservationCustodyChainSealReceipt.counts.providerOutboundCallCount === 0 &&
    postClosurePreservationCustodyChainSealReceipt.counts.externalNotificationSendCount === 0 &&
    postClosurePreservationCustodyChainSealReceipt.counts.aiCallCount === 0 &&
    postClosurePreservationCustodyChainSealReceipt.externalCalls === 0;
}

function mockCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealReady(
  postClosurePreservationCustodyAuditReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceipt
) {
  return postClosurePreservationCustodyAuditReceipt.postClosurePreservationCustodyAuditStatus === "audited" &&
    postClosurePreservationCustodyAuditReceipt.postClosurePreservationContinuityLedgerStatus === "continuous" &&
    postClosurePreservationCustodyAuditReceipt.postClosurePreservationVerificationStatus === "verified" &&
    postClosurePreservationCustodyAuditReceipt.finalArchiveSealPostClosurePreservationStatus === "preserved" &&
    postClosurePreservationCustodyAuditReceipt.finalOperationalClosureReceiptStatus === "issued" &&
    postClosurePreservationCustodyAuditReceipt.finalArchiveSealStatus === "sealed" &&
    postClosurePreservationCustodyAuditReceipt.releaseClosureStatus === "closed" &&
    postClosurePreservationCustodyAuditReceipt.tenantScopeStatus === "tenant_scoped" &&
    postClosurePreservationCustodyAuditReceipt.digestContinuityStatus === "confirmed" &&
    postClosurePreservationCustodyAuditReceipt.providerOutboundStatus === "absent" &&
    postClosurePreservationCustodyAuditReceipt.externalNotificationStatus === "absent" &&
    postClosurePreservationCustodyAuditReceipt.aiCallStatus === "absent" &&
    postClosurePreservationCustodyAuditReceipt.postClosurePreservationCustodyAuditDigest === postClosurePreservationCustodyAuditReceipt.safeDigest &&
    postClosurePreservationCustodyAuditReceipt.custodyAuditRows.some((row) => row.sprintNumber === 114 && row.artifactStatus === "audited" && row.custodyAuditStatus === "under_safe_custody" && row.safeDigest === postClosurePreservationCustodyAuditReceipt.safeDigest) &&
    postClosurePreservationCustodyAuditReceipt.custodyAuditRows.every((row) =>
      row.externalCalls === 0 &&
      row.executionAttemptCount === 0 &&
      row.providerOutboundCallCount === 0 &&
      row.externalNotificationSendCount === 0 &&
      row.aiCallCount === 0 &&
      row.mutationCount === 0 &&
      row.custodyAuditStatus === "under_safe_custody"
    ) &&
    postClosurePreservationCustodyAuditReceipt.inheritedPostClosurePreservationContinuityLedgerReceiptSummary.externalCallsZero === true &&
    postClosurePreservationCustodyAuditReceipt.counts.postClosurePreservationCustodyAuditMutationCount === 0 &&
    postClosurePreservationCustodyAuditReceipt.counts.preservationContinuityLedgerMutationCount === 0 &&
    postClosurePreservationCustodyAuditReceipt.counts.postClosurePreservationVerificationMutationCount === 0 &&
    postClosurePreservationCustodyAuditReceipt.counts.executionAttemptCount === 0 &&
    postClosurePreservationCustodyAuditReceipt.counts.providerOutboundCallCount === 0 &&
    postClosurePreservationCustodyAuditReceipt.counts.externalNotificationSendCount === 0 &&
    postClosurePreservationCustodyAuditReceipt.counts.aiCallCount === 0 &&
    postClosurePreservationCustodyAuditReceipt.externalCalls === 0;
}

function mockCertifiedReleaseFinalArchiveSealPostClosurePreservationReady(
  finalArchiveSealOperationalClosureReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealOperationalClosureReceipt
) {
  return finalArchiveSealOperationalClosureReceipt.finalOperationalClosureReceiptStatus === "issued" &&
    finalArchiveSealOperationalClosureReceipt.finalArchiveSealStatus === "sealed" &&
    finalArchiveSealOperationalClosureReceipt.releaseClosureStatus === "closed" &&
    finalArchiveSealOperationalClosureReceipt.finalEvidenceIndexStatus === "issued" &&
    finalArchiveSealOperationalClosureReceipt.regressionGuardrailReceiptStatus === "issued" &&
    finalArchiveSealOperationalClosureReceipt.regressionGuardrailStatus === "passed" &&
    finalArchiveSealOperationalClosureReceipt.finalNoExecutionEvidenceRollupStatus === "issued" &&
    finalArchiveSealOperationalClosureReceipt.finalArchiveCustodyStatus === "sealed" &&
    finalArchiveSealOperationalClosureReceipt.operationsCustodyMonitoringCloseoutStatus === "sealed" &&
    finalArchiveSealOperationalClosureReceipt.closeoutSealStatus === "sealed" &&
    finalArchiveSealOperationalClosureReceipt.noExecutionEvidenceStatus === "confirmed" &&
    finalArchiveSealOperationalClosureReceipt.noExecutionMonitoringStatus === "active" &&
    finalArchiveSealOperationalClosureReceipt.tenantScopeStatus === "tenant_scoped" &&
    finalArchiveSealOperationalClosureReceipt.digestContinuityStatus === "confirmed" &&
    finalArchiveSealOperationalClosureReceipt.providerOutboundStatus === "absent" &&
    finalArchiveSealOperationalClosureReceipt.externalNotificationStatus === "absent" &&
    finalArchiveSealOperationalClosureReceipt.aiCallStatus === "absent" &&
    finalArchiveSealOperationalClosureReceipt.finalArchiveSealOperationalClosureRows.every((row) =>
      row.externalCalls === 0 &&
      row.executionAttemptCount === 0 &&
      row.providerOutboundCallCount === 0 &&
      row.externalNotificationSendCount === 0 &&
      row.aiCallCount === 0 &&
      row.mutationCount === 0
    ) &&
    finalArchiveSealOperationalClosureReceipt.counts.finalOperationalClosureReceiptMutationCount === 0 &&
    finalArchiveSealOperationalClosureReceipt.counts.finalArchiveSealMutationCount === 0 &&
    finalArchiveSealOperationalClosureReceipt.counts.finalEvidenceIndexMutationCount === 0 &&
    finalArchiveSealOperationalClosureReceipt.counts.regressionGuardrailMutationCount === 0 &&
    finalArchiveSealOperationalClosureReceipt.counts.finalNoExecutionEvidenceRollupMutationCount === 0 &&
    finalArchiveSealOperationalClosureReceipt.counts.executionAttemptCount === 0 &&
    finalArchiveSealOperationalClosureReceipt.counts.providerOutboundCallCount === 0 &&
    finalArchiveSealOperationalClosureReceipt.counts.externalNotificationSendCount === 0 &&
    finalArchiveSealOperationalClosureReceipt.counts.aiCallCount === 0 &&
    finalArchiveSealOperationalClosureReceipt.externalCalls === 0;
}

function mockCertifiedReleaseFinalEvidenceIndexRegressionGuardrailPassed(
  finalNoExecutionEvidenceRollup: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollup
) {
  return finalNoExecutionEvidenceRollup.finalNoExecutionEvidenceRollupStatus === "issued" &&
    finalNoExecutionEvidenceRollup.finalArchiveCustodyStatus === "sealed" &&
    finalNoExecutionEvidenceRollup.operationsCustodyMonitoringCloseoutStatus === "sealed" &&
    finalNoExecutionEvidenceRollup.closeoutSealStatus === "sealed" &&
    finalNoExecutionEvidenceRollup.operationsCustodyMonitoringStatus === "ready" &&
    finalNoExecutionEvidenceRollup.operationsHandoffAcceptanceStatus === "accepted" &&
    finalNoExecutionEvidenceRollup.operationsCustodyStatus === "accepted" &&
    finalNoExecutionEvidenceRollup.noExecutionEvidenceStatus === "confirmed" &&
    finalNoExecutionEvidenceRollup.noExecutionMonitoringStatus === "active" &&
    finalNoExecutionEvidenceRollup.launchApprovalLockStatus === "locked" &&
    finalNoExecutionEvidenceRollup.tenantScopeStatus === "tenant_scoped" &&
    finalNoExecutionEvidenceRollup.digestContinuityStatus === "confirmed" &&
    finalNoExecutionEvidenceRollup.providerOutboundStatus === "absent" &&
    finalNoExecutionEvidenceRollup.externalNotificationStatus === "absent" &&
    finalNoExecutionEvidenceRollup.aiCallStatus === "absent" &&
    finalNoExecutionEvidenceRollup.finalNoExecutionEvidenceRows.every((row) => row.complete && row.status === "confirmed") &&
    finalNoExecutionEvidenceRollup.counts.finalNoExecutionEvidenceRollupMutationCount === 0 &&
    finalNoExecutionEvidenceRollup.counts.executionAttemptCount === 0 &&
    finalNoExecutionEvidenceRollup.counts.providerOutboundCallCount === 0 &&
    finalNoExecutionEvidenceRollup.counts.externalNotificationSendCount === 0 &&
    finalNoExecutionEvidenceRollup.counts.aiCallCount === 0 &&
    finalNoExecutionEvidenceRollup.externalCalls === 0;
}

function mockCertifiedReleaseOperationsHandoffAcceptanceReady(
  operationsHandoffReadinessPacket: ProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacket
) {
  return operationsHandoffReadinessPacket.operationsHandoffReadinessStatus === "ready_for_handoff" &&
    operationsHandoffReadinessPacket.operationsHandoffEvidencePacketStatus === "issued" &&
    operationsHandoffReadinessPacket.noExecutionEvidenceStatus === "confirmed" &&
    operationsHandoffReadinessPacket.launchApprovalLockStatus === "locked" &&
    operationsHandoffReadinessPacket.tenantScopeStatus === "tenant_scoped" &&
    operationsHandoffReadinessPacket.digestContinuityStatus === "confirmed" &&
    operationsHandoffReadinessPacket.providerOutboundStatus === "absent" &&
    operationsHandoffReadinessPacket.externalNotificationStatus === "absent" &&
    operationsHandoffReadinessPacket.aiCallStatus === "absent" &&
    operationsHandoffReadinessPacket.counts.operationsHandoffMutationCount === 0 &&
    operationsHandoffReadinessPacket.counts.executionAttemptCount === 0 &&
    operationsHandoffReadinessPacket.counts.providerOutboundCallCount === 0 &&
    operationsHandoffReadinessPacket.counts.externalNotificationSendCount === 0 &&
    operationsHandoffReadinessPacket.counts.aiCallCount === 0 &&
    operationsHandoffReadinessPacket.externalCalls === 0;
}

function mockCertifiedReleaseOperationsHandoffReadinessReady(
  noExecutionLockReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceipt
) {
  return noExecutionLockReceipt.noExecutionLockReceiptStatus === "issued" &&
    noExecutionLockReceipt.noExecutionLockStatus === "locked" &&
    noExecutionLockReceipt.launchApprovalArchiveStatus === "retained" &&
    noExecutionLockReceipt.tenantScopeStatus === "tenant_scoped" &&
    noExecutionLockReceipt.providerOutboundStatus === "absent" &&
    noExecutionLockReceipt.externalNotificationStatus === "absent" &&
    noExecutionLockReceipt.aiCallStatus === "absent" &&
    noExecutionLockReceipt.digestChainStatus === "confirmed" &&
    noExecutionLockReceipt.noExecutionLockRows.every((row) => row.complete && row.noExecutionLockStatus === "locked") &&
    noExecutionLockReceipt.counts.noExecutionLockReceiptMutationCount === 0 &&
    noExecutionLockReceipt.counts.executionAttemptCount === 0 &&
    noExecutionLockReceipt.counts.providerOutboundCallCount === 0 &&
    noExecutionLockReceipt.counts.externalNotificationSendCount === 0 &&
    noExecutionLockReceipt.counts.aiCallCount === 0 &&
    noExecutionLockReceipt.externalCalls === 0;
}

function mockCertifiedReleaseOperationsHandoffReadinessStatus(
  noExecutionLockReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceipt,
  operationsHandoffReady: boolean
): ProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacket["operationsHandoffReadinessStatus"] {
  if (operationsHandoffReady) return "ready_for_handoff";
  if (
    noExecutionLockReceipt.noExecutionLockReceiptStatus === "blocked" ||
    noExecutionLockReceipt.noExecutionLockStatus === "violated" ||
    noExecutionLockReceipt.counts.executionAttemptCount > 0 ||
    noExecutionLockReceipt.counts.providerOutboundCallCount > 0 ||
    noExecutionLockReceipt.counts.externalNotificationSendCount > 0 ||
    noExecutionLockReceipt.counts.aiCallCount > 0
  ) return "blocked";
  return "incomplete";
}

function mockCertifiedReleaseOperationsHandoffEvidenceRows(
  rows: Array<[
    ProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacket["operationsHandoffEvidenceRows"][number]["key"],
    string,
    string,
    string | undefined,
    number,
    boolean
  ]>
): ProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacket["operationsHandoffEvidenceRows"] {
  return rows.map(([key, label, safeDigestValue, safeFilename, checkedCount, complete]) => ({
    key,
    label,
    redactedLabel: label,
    status: complete ? "confirmed" : "blocked",
    safeDigest: safeDigestValue,
    ...(safeFilename ? { safeFilename } : {}),
    checkedCount,
    complete
  }));
}

function mockCertifiedReleaseOperationsHandoffDigestLinksSafe(
  noExecutionLockReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceipt,
  operationsHandoffEvidencePacketDigest: string
) {
  return [
    operationsHandoffEvidencePacketDigest,
    noExecutionLockReceipt.noExecutionLockReceiptDigest,
    noExecutionLockReceipt.launchApprovalReceiptDigest,
    noExecutionLockReceipt.goLiveHoldReleaseAuthorizationReceiptDigest,
    noExecutionLockReceipt.launchWindowConfirmationReceiptDigest,
    noExecutionLockReceipt.goLiveAuthorizationReceiptDigest,
    noExecutionLockReceipt.operatorCommandReceiptDigest,
    noExecutionLockReceipt.cutoverChecklistReceiptDigest,
    noExecutionLockReceipt.controlRoomPacketDigest,
    noExecutionLockReceipt.rollbackRehearsalReceiptDigest,
    noExecutionLockReceipt.freezeAuditRegisterDigest,
    noExecutionLockReceipt.finalReadinessCertificateDigest,
    noExecutionLockReceipt.dryRunResultLedgerDigest,
    noExecutionLockReceipt.noopExecutionDryRunDigest,
    noExecutionLockReceipt.acceptanceRecordDigest,
    noExecutionLockReceipt.handoffPacketDigest,
    noExecutionLockReceipt.decisionReceiptDigest,
    noExecutionLockReceipt.releaseGateDigest,
    noExecutionLockReceipt.reconciliationDigest,
    noExecutionLockReceipt.attestationAuditDigest,
    noExecutionLockReceipt.closureLedgerDigest,
    noExecutionLockReceipt.certificationDigest,
    noExecutionLockReceipt.verificationDigest,
    noExecutionLockReceipt.releaseEvidenceDigest,
    noExecutionLockReceipt.safeDigest
  ].every((value) => /^sha256:[a-z0-9-]+$/i.test(value));
}

function mockCertifiedReleaseOperationsHandoffAcceptanceDigestLinksSafe(
  operationsHandoffReadinessPacket: ProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacket,
  operationsHandoffAcceptanceReceiptDigest: string
) {
  return [
    operationsHandoffAcceptanceReceiptDigest,
    operationsHandoffReadinessPacket.operationsHandoffEvidencePacketDigest,
    operationsHandoffReadinessPacket.noExecutionLockReceiptDigest,
    operationsHandoffReadinessPacket.launchApprovalReceiptDigest,
    operationsHandoffReadinessPacket.safeDigest
  ].every((value) => /^sha256:[a-z0-9-]+$/i.test(value));
}

function mockCertifiedReleaseCutoverChecklistReady(
  controlRoomPacket: ProviderWebhookReviewQaHandoffCertifiedReleaseControlRoomPacket
) {
  return controlRoomPacket.controlRoomStatus === "ready" &&
    controlRoomPacket.cutoverReadinessStatus === "ready" &&
    controlRoomPacket.rollbackRehearsalStatus === "verified" &&
    controlRoomPacket.recoveryReadinessStatus === "ready" &&
    controlRoomPacket.rollbackReadinessStatus === "ready" &&
    controlRoomPacket.freezeAuditStatus === "recorded" &&
    controlRoomPacket.freezeStatus === "frozen" &&
    controlRoomPacket.certificateStatus === "issued" &&
    controlRoomPacket.finalReadinessStatus === "ready" &&
    controlRoomPacket.ledgerStatus === "recorded" &&
    controlRoomPacket.dryRunStatus === "passed" &&
    controlRoomPacket.executionMode === "no_op" &&
    controlRoomPacket.acceptanceStatus === "acknowledged" &&
    controlRoomPacket.handoffStatus === "ready" &&
    controlRoomPacket.releaseDecision === "go" &&
    controlRoomPacket.goNoGoDecision === "go" &&
    controlRoomPacket.packetStatus === "issued" &&
    controlRoomPacket.receiptStatus === "issued" &&
    controlRoomPacket.gateStatus === "ready" &&
    controlRoomPacket.releaseReadinessStatus === "ready_for_release" &&
    ["complete", "aligned"].includes(controlRoomPacket.reconciliationStatus) &&
    controlRoomPacket.attestationStatus === "complete" &&
    controlRoomPacket.ledgerStatusFromClosure === "certified_release_closed" &&
    controlRoomPacket.certificationStatus === "certified" &&
    controlRoomPacket.verificationStatus === "verified" &&
    controlRoomPacket.digestChainStatus === "confirmed" &&
    controlRoomPacket.controlRoomRows.every((row) => row.complete && row.controlRoomStatus === "ready" && row.cutoverReadinessStatus === "ready") &&
    controlRoomPacket.cutoverChecklistRows.every((row) => row.complete && row.controlRoomStatus === "ready" && row.cutoverReadinessStatus === "ready") &&
    controlRoomPacket.operatorHandoffRows.every((row) => row.complete && row.controlRoomStatus === "ready" && row.cutoverReadinessStatus === "ready") &&
    controlRoomPacket.operatorChecklist.every((item) => item.complete) &&
    controlRoomPacket.acknowledgedChecklist.every((item) => item.acknowledged) &&
    controlRoomPacket.executionChecklist.every((item) => item.complete) &&
    controlRoomPacket.counts.controlRoomPacketMutationCount === 0 &&
    controlRoomPacket.externalCalls === 0;
}

function mockCertifiedReleaseCutoverChecklistStatus(
  controlRoomPacket: ProviderWebhookReviewQaHandoffCertifiedReleaseControlRoomPacket,
  cutoverChecklistReady: boolean
): ProviderWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceipt["cutoverChecklistStatus"] {
  if (cutoverChecklistReady) return "verified";
  if (controlRoomPacket.controlRoomStatus === "blocked" || controlRoomPacket.releaseDecision !== "go" || controlRoomPacket.goNoGoDecision !== "go") return "blocked";
  return "incomplete";
}

function mockCertifiedReleaseCutoverChecklistReceiptRows(
  rows: Array<[
    ProviderWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceipt["operatorCommandRows"][number]["key"],
    string,
    string,
    number,
    boolean
  ]>,
  cutoverChecklistReady: boolean,
  cutoverChecklistStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceipt["cutoverChecklistStatus"],
  operatorCommandStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceipt["operatorCommandStatus"]
): ProviderWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceipt["operatorCommandRows"] {
  return rows.map(([key, label, rowDigest, checkedCount, complete]) => ({
    key,
    label,
    cutoverChecklistStatus: complete && cutoverChecklistReady ? "verified" : cutoverChecklistStatus,
    operatorCommandStatus: complete && cutoverChecklistReady ? "ready" : operatorCommandStatus,
    safeDigest: rowDigest,
    checkedCount,
    complete: complete && cutoverChecklistReady
  }));
}

function mockCertifiedReleaseCutoverChecklistReceiptDigestLinksSafe(
  controlRoomPacket: ProviderWebhookReviewQaHandoffCertifiedReleaseControlRoomPacket,
  cutoverChecklistReceiptDigest: string
) {
  return [
    cutoverChecklistReceiptDigest,
    controlRoomPacket.controlRoomPacketDigest,
    controlRoomPacket.rollbackRehearsalReceiptDigest,
    controlRoomPacket.freezeAuditRegisterDigest,
    controlRoomPacket.finalReadinessCertificateDigest,
    controlRoomPacket.dryRunResultLedgerDigest,
    controlRoomPacket.noopExecutionDryRunDigest,
    controlRoomPacket.acceptanceRecordDigest,
    controlRoomPacket.handoffPacketDigest,
    controlRoomPacket.decisionReceiptDigest,
    controlRoomPacket.releaseGateDigest,
    controlRoomPacket.reconciliationDigest,
    controlRoomPacket.attestationAuditDigest,
    controlRoomPacket.closureLedgerDigest,
    controlRoomPacket.certificationDigest,
    controlRoomPacket.verificationDigest,
    controlRoomPacket.releaseEvidenceDigest,
    controlRoomPacket.safeDigest
  ].every((value) => /^sha256:[a-z0-9-]+$/i.test(value));
}

function mockCertifiedReleaseControlRoomReady(
  rollbackRehearsalReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt
) {
  return rollbackRehearsalReceipt.rollbackRehearsalStatus === "verified" &&
    rollbackRehearsalReceipt.recoveryReadinessStatus === "ready" &&
    rollbackRehearsalReceipt.rollbackReadinessStatus === "ready" &&
    rollbackRehearsalReceipt.freezeAuditStatus === "recorded" &&
    rollbackRehearsalReceipt.freezeStatus === "frozen" &&
    rollbackRehearsalReceipt.certificateStatus === "issued" &&
    rollbackRehearsalReceipt.finalReadinessStatus === "ready" &&
    rollbackRehearsalReceipt.ledgerStatus === "recorded" &&
    rollbackRehearsalReceipt.dryRunStatus === "passed" &&
    rollbackRehearsalReceipt.executionMode === "no_op" &&
    rollbackRehearsalReceipt.acceptanceStatus === "acknowledged" &&
    rollbackRehearsalReceipt.handoffStatus === "ready" &&
    rollbackRehearsalReceipt.releaseDecision === "go" &&
    rollbackRehearsalReceipt.goNoGoDecision === "go" &&
    rollbackRehearsalReceipt.packetStatus === "issued" &&
    rollbackRehearsalReceipt.receiptStatus === "issued" &&
    rollbackRehearsalReceipt.gateStatus === "ready" &&
    rollbackRehearsalReceipt.rollbackRehearsalRows.every((row) => row.complete && row.rollbackRehearsalStatus === "verified" && row.recoveryReadinessStatus === "ready") &&
    rollbackRehearsalReceipt.recoveryReadinessRows.every((row) => row.complete && row.rollbackRehearsalStatus === "verified" && row.recoveryReadinessStatus === "ready") &&
    rollbackRehearsalReceipt.counts.rollbackRehearsalReceiptMutationCount === 0 &&
    rollbackRehearsalReceipt.externalCalls === 0;
}

function mockCertifiedReleaseControlRoomStatus(
  rollbackRehearsalReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt,
  controlRoomReady: boolean
): ProviderWebhookReviewQaHandoffCertifiedReleaseControlRoomPacket["controlRoomStatus"] {
  if (controlRoomReady) return "ready";
  if (rollbackRehearsalReceipt.rollbackRehearsalStatus === "blocked" || rollbackRehearsalReceipt.releaseDecision !== "go" || rollbackRehearsalReceipt.goNoGoDecision !== "go") return "blocked";
  return "incomplete";
}

function mockCertifiedReleaseControlRoomRows(
  rows: Array<[
    ProviderWebhookReviewQaHandoffCertifiedReleaseControlRoomPacket["controlRoomRows"][number]["key"],
    string,
    string,
    number,
    boolean
  ]>,
  controlRoomReady: boolean,
  controlRoomStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseControlRoomPacket["controlRoomStatus"],
  cutoverReadinessStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseControlRoomPacket["cutoverReadinessStatus"]
): ProviderWebhookReviewQaHandoffCertifiedReleaseControlRoomPacket["controlRoomRows"] {
  return rows.map(([key, label, rowDigest, checkedCount, complete]) => ({
    key,
    label,
    controlRoomStatus: complete && controlRoomReady ? "ready" : controlRoomStatus,
    cutoverReadinessStatus: complete && controlRoomReady ? "ready" : cutoverReadinessStatus,
    safeDigest: rowDigest,
    checkedCount,
    complete: complete && controlRoomReady
  }));
}

function mockCertifiedReleaseControlRoomDigestLinksSafe(
  rollbackRehearsalReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt,
  controlRoomPacketDigest: string
) {
  return [
    controlRoomPacketDigest,
    rollbackRehearsalReceipt.rollbackRehearsalReceiptDigest,
    rollbackRehearsalReceipt.freezeAuditRegisterDigest,
    rollbackRehearsalReceipt.finalReadinessCertificateDigest,
    rollbackRehearsalReceipt.dryRunResultLedgerDigest,
    rollbackRehearsalReceipt.noopExecutionDryRunDigest,
    rollbackRehearsalReceipt.acceptanceRecordDigest,
    rollbackRehearsalReceipt.handoffPacketDigest,
    rollbackRehearsalReceipt.decisionReceiptDigest,
    rollbackRehearsalReceipt.releaseGateDigest,
    rollbackRehearsalReceipt.reconciliationDigest,
    rollbackRehearsalReceipt.attestationAuditDigest,
    rollbackRehearsalReceipt.closureLedgerDigest,
    rollbackRehearsalReceipt.certificationDigest,
    rollbackRehearsalReceipt.verificationDigest,
    rollbackRehearsalReceipt.releaseEvidenceDigest,
    rollbackRehearsalReceipt.safeDigest
  ].every((value) => /^sha256:[a-z0-9-]+$/i.test(value));
}

function mockCertifiedReleaseFreezeAuditRegisterReady(
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

function mockCertifiedReleaseFreezeAuditRegisterStatus(
  finalReadinessCertificate: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificate,
  freezeReady: boolean
): ProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister["freezeAuditStatus"] {
  if (freezeReady) return "recorded";
  if (finalReadinessCertificate.certificateStatus === "pending") return "pending";
  if (finalReadinessCertificate.certificateStatus === "blocked" || finalReadinessCertificate.releaseDecision !== "go" || finalReadinessCertificate.goNoGoDecision !== "go") return "blocked";
  return "incomplete";
}

function mockCertifiedReleaseRollbackReadinessStatus(
  finalReadinessCertificate: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificate,
  freezeReady: boolean
): ProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister["rollbackReadinessStatus"] {
  if (freezeReady) return "ready";
  if (finalReadinessCertificate.certificateStatus === "pending" || finalReadinessCertificate.finalReadinessStatus === "incomplete") return "incomplete";
  return "not_ready";
}

function mockCertifiedReleaseFreezeAuditRows(
  finalReadinessCertificate: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificate,
  freezeReady: boolean,
  freezeAuditStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister["freezeAuditStatus"],
  rollbackReadinessStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister["rollbackReadinessStatus"],
  freezeAuditRegisterDigest: string,
  rollbackReadinessPlanDigest: string
): ProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister["freezeAuditRows"] {
  return [
    mockCertifiedReleaseFreezeAuditRegisterRow("final_readiness_certificate", "Final readiness certificate issued", finalReadinessCertificate.finalReadinessCertificateDigest, 1, finalReadinessCertificate.certificateStatus === "issued" && finalReadinessCertificate.finalReadinessStatus === "ready", freezeReady, freezeAuditStatus, rollbackReadinessStatus),
    mockCertifiedReleaseFreezeAuditRegisterRow("release_freeze_scope", "Release freeze scope registered", freezeAuditRegisterDigest, finalReadinessCertificate.counts.certificateRowCount, finalReadinessCertificate.certificateRows.every((row) => row.complete), freezeReady, freezeAuditStatus, rollbackReadinessStatus),
    mockCertifiedReleaseFreezeAuditRegisterRow("safe_digests", "Freeze register safe digest chain", freezeAuditRegisterDigest, 16, mockCertifiedReleaseFreezeAuditDigestLinksSafe(finalReadinessCertificate, freezeAuditRegisterDigest, rollbackReadinessPlanDigest), freezeReady, freezeAuditStatus, rollbackReadinessStatus),
    mockCertifiedReleaseFreezeAuditRegisterRow("no_state_mutation", "No freeze audit register state mutation", finalReadinessCertificate.finalReadinessCertificateDigest, 0, true, freezeReady, freezeAuditStatus, rollbackReadinessStatus),
    mockCertifiedReleaseFreezeAuditRegisterRow("external_calls_zero", "External calls zero", finalReadinessCertificate.finalReadinessCertificateDigest, finalReadinessCertificate.externalCalls, finalReadinessCertificate.externalCalls === 0, freezeReady, freezeAuditStatus, rollbackReadinessStatus)
  ];
}

function mockCertifiedReleaseRollbackPlanRows(
  finalReadinessCertificate: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificate,
  freezeReady: boolean,
  freezeAuditStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister["freezeAuditStatus"],
  rollbackReadinessStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister["rollbackReadinessStatus"],
  freezeAuditRegisterDigest: string,
  rollbackReadinessPlanDigest: string
): ProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister["rollbackPlanRows"] {
  return [
    mockCertifiedReleaseFreezeAuditRegisterRow("rollback_plan_ready", "Safe rollback readiness plan ready", rollbackReadinessPlanDigest, finalReadinessCertificate.counts.finalReadinessReadyCount, finalReadinessCertificate.finalReadinessRows.every((row) => row.complete && row.readinessStatus === "ready"), freezeReady, freezeAuditStatus, rollbackReadinessStatus),
    mockCertifiedReleaseFreezeAuditRegisterRow("rollback_owner_confirmed", "Release owner rollback readiness confirmed", finalReadinessCertificate.safeDigest, 1, finalReadinessCertificate.releaseOwnerSummary.checklistAcknowledged, freezeReady, freezeAuditStatus, rollbackReadinessStatus),
    mockCertifiedReleaseFreezeAuditRegisterRow("safe_digests", "Rollback plan safe digest chain", rollbackReadinessPlanDigest, 16, mockCertifiedReleaseFreezeAuditDigestLinksSafe(finalReadinessCertificate, freezeAuditRegisterDigest, rollbackReadinessPlanDigest), freezeReady, freezeAuditStatus, rollbackReadinessStatus),
    mockCertifiedReleaseFreezeAuditRegisterRow("no_state_mutation", "No rollback readiness plan state mutation", finalReadinessCertificate.finalReadinessCertificateDigest, 0, true, freezeReady, freezeAuditStatus, rollbackReadinessStatus),
    mockCertifiedReleaseFreezeAuditRegisterRow("external_calls_zero", "External calls zero", finalReadinessCertificate.finalReadinessCertificateDigest, finalReadinessCertificate.externalCalls, finalReadinessCertificate.externalCalls === 0, freezeReady, freezeAuditStatus, rollbackReadinessStatus)
  ];
}

function mockCertifiedReleaseFreezeAuditRegisterRow(
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
    freezeAuditStatus: complete && freezeReady ? "recorded" : freezeAuditStatus,
    rollbackReadinessStatus: complete && freezeReady ? "ready" : rollbackReadinessStatus,
    safeDigest,
    checkedCount,
    complete: complete && freezeReady
  };
}

function mockCertifiedReleaseFreezeAuditDigestLinksSafe(
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
  ].every((value) => /^sha256:[a-z0-9-]+$/i.test(value));
}

function createMockReleaseAttestationAuditRow(
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

function createMockReleaseClosureLedgerRow(
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

function createMockClosureEvidence(unmatchedInboundId: string): ProviderWebhookReviewClosureEvidence {
  const item = mockProviderWebhookUnmatchedInbound.find((candidate) => candidate.id === unmatchedInboundId);
  if (!item) throw new Error("Unmatched inbound item not found");
  return {
    generatedAt: new Date().toISOString(),
    ...mockClosureEvidenceSummaryItem(item)
  };
}

function createMockClosureEvidenceExport(unmatchedInboundId: string): ProviderWebhookReviewClosureEvidenceExport {
  const evidence = createMockClosureEvidence(unmatchedInboundId);
  return {
    ...evidence,
    exportKind: "closure-evidence",
    format: "json",
    contentType: "application/json",
    safeFilename: `provider-webhook-closure-evidence-${evidence.provider}-${evidence.unmatchedId}.json`,
    exportedAt: new Date().toISOString()
  };
}

function createMockClosureEvidenceRedactionAudit(unmatchedInboundId: string): ProviderWebhookReviewExportRedactionAudit {
  const exportResult = createMockClosureEvidenceExport(unmatchedInboundId);
  return createMockExportRedactionAudit({
    auditTarget: "closure-evidence-export",
    unmatchedId: exportResult.unmatchedId,
    safeRoomDigestPresent: Boolean(exportResult.roomKeyDigest),
    safeDigest: "sha256:mockclosureevidenceredactionaudit"
  });
}

function createMockClosureEvidenceExportManifest(unmatchedInboundId: string): ProviderWebhookReviewExportManifest {
  const exportResult = createMockClosureEvidenceExport(unmatchedInboundId);
  const audit = createMockClosureEvidenceRedactionAudit(unmatchedInboundId);
  const redactionPassedCount = audit.status === "passed" ? 1 : 0;
  const redactionWarningCount = audit.status === "warning" ? 1 : 0;
  const redactionBlockedCount = audit.status === "blocked" ? 1 : 0;
  return createMockExportManifest({
    manifestTarget: "closure-evidence-export",
    exportKind: exportResult.exportKind,
    safeFilename: exportResult.safeFilename,
    exportedAt: exportResult.exportedAt,
    unmatchedId: exportResult.unmatchedId,
    totalItems: 1,
    totalOpenItems: exportResult.unmatchedStatus === "open" || exportResult.unmatchedStatus === "review-needed" ? 1 : 0,
    evidenceReadyCount: exportResult.evidenceStatus === "ready" ? 1 : 0,
    evidenceBlockedCount: exportResult.evidenceStatus === "blocked" ? 1 : 0,
    evidenceIncompleteCount: exportResult.evidenceStatus === "incomplete" ? 1 : 0,
    redactionStatus: audit.status,
    redactionIssueCount: audit.issues.length,
    redactionPassedCount,
    redactionWarningCount,
    redactionBlockedCount,
    deterministicExportConfirmed: audit.checks.exportDeterministic,
    safeDigest: audit.safeDigest
  });
}

function createMockExportRedactionAudit(input: {
  auditTarget: ProviderWebhookReviewExportRedactionAudit["auditTarget"];
  unmatchedId?: string;
  appliedFilters?: ProviderWebhookReviewClosureReportFilters;
  safeRoomDigestPresent: boolean;
  safeDigest: string;
}): ProviderWebhookReviewExportRedactionAudit {
  const checks = {
    rawPayloadAbsent: true,
    rawSignatureAbsent: true,
    tokenAbsent: true,
    authorizationAbsent: true,
    cookieAbsent: true,
    replyTokenAbsent: true,
    rawSenderIdAbsent: true,
    rawRoomIdAbsent: true,
    providerSecretAbsent: true,
    providerOutboundAbsent: true,
    externalCallsZero: true,
    safeRoomDigestPresent: input.safeRoomDigestPresent,
    tenantScoped: true,
    exportDeterministic: true
  };
  const issues = input.safeRoomDigestPresent
    ? []
    : [{
      code: "safe-room-digest-missing",
      severity: "warning" as const,
      safeLabel: "Safe room digest is missing",
      recommendedAction: "Regenerate safe room digest context before QA signoff."
    }];
  return {
    generatedAt: new Date().toISOString(),
    auditTarget: input.auditTarget,
    status: issues.length > 0 ? "warning" : "passed",
    checks,
    issues,
    ...(input.unmatchedId ? { unmatchedId: input.unmatchedId } : {}),
    ...(input.appliedFilters ? { appliedFilters: input.appliedFilters } : {}),
    exportShapeVersion: "provider-webhook-closure-export-v1",
    safeDigest: input.safeDigest,
    externalCalls: 0
  };
}

function createMockExportManifest(input: {
  manifestTarget: ProviderWebhookReviewExportManifest["manifestTarget"];
  exportKind: ProviderWebhookReviewExportManifest["exportKind"];
  safeFilename: string;
  exportedAt: string;
  unmatchedId?: string;
  appliedFilters?: ProviderWebhookReviewClosureReportFilters;
  totalItems: number;
  totalOpenItems: number;
  evidenceReadyCount: number;
  evidenceBlockedCount: number;
  evidenceIncompleteCount: number;
  redactionStatus: ProviderWebhookReviewExportRedactionAudit["status"];
  redactionIssueCount: number;
  redactionPassedCount: number;
  redactionWarningCount: number;
  redactionBlockedCount: number;
  deterministicExportConfirmed: boolean;
  safeDigest: string;
  safeReportDigest?: string;
}): ProviderWebhookReviewExportManifest {
  const integrityStatus = input.redactionBlockedCount > 0 || !input.deterministicExportConfirmed
    ? "blocked"
    : input.redactionWarningCount > 0
      ? "warning"
      : "confirmed";
  const manualQaReadiness = integrityStatus === "blocked"
    ? "blocked"
    : integrityStatus === "warning" || input.evidenceBlockedCount > 0 || input.evidenceIncompleteCount > 0
      ? "needs_review"
      : "ready";
  return {
    generatedAt: new Date().toISOString(),
    manifestKind: "provider-webhook-review-export-manifest",
    manifestTarget: input.manifestTarget,
    exportKind: input.exportKind,
    format: "json",
    contentType: "application/json",
    safeFilename: input.safeFilename,
    exportedAt: input.exportedAt,
    exportShapeVersion: "provider-webhook-closure-export-v1",
    ...(input.unmatchedId ? { unmatchedId: input.unmatchedId } : {}),
    ...(input.appliedFilters ? { appliedFilters: input.appliedFilters } : {}),
    totalItems: input.totalItems,
    totalOpenItems: input.totalOpenItems,
    evidenceReadyCount: input.evidenceReadyCount,
    evidenceBlockedCount: input.evidenceBlockedCount,
    evidenceIncompleteCount: input.evidenceIncompleteCount,
    redactionStatus: input.redactionStatus,
    redactionIssueCount: input.redactionIssueCount,
    redactionPassedCount: input.redactionPassedCount,
    redactionWarningCount: input.redactionWarningCount,
    redactionBlockedCount: input.redactionBlockedCount,
    integrityStatus,
    deterministicExportConfirmed: input.deterministicExportConfirmed,
    safeDigest: input.safeDigest,
    ...(input.safeReportDigest ? { safeReportDigest: input.safeReportDigest } : {}),
    manualQaReadiness,
    manualQaChecks: {
      safeFilenamePresent: input.safeFilename.length > 0,
      safeDigestPresent: input.safeDigest.startsWith("sha256:"),
      redactionPassedOrWarned: input.redactionStatus === "passed" || input.redactionStatus === "warning",
      redactionBlockedAbsent: input.redactionBlockedCount === 0,
      deterministicExportConfirmed: input.deterministicExportConfirmed,
      externalCallsZero: true,
      manualQaReady: manualQaReadiness === "ready"
    },
    externalCalls: 0
  };
}

function mockReviewAlertItem(item: ProviderWebhookUnmatchedInboundItem) {
  return {
    unmatchedId: item.id,
    provider: item.provider,
    platform: item.provider,
    channelAccountId: item.channelAccountId,
    safeRoomLabel: mockSafeRoomLabel(item),
    roomKeyDigest: item.roomKeyDigest,
    eventType: item.eventType,
    receivedAt: item.receivedAt,
    ageBucket: mockAgeBucket(item.receivedAt),
    severity: mockReviewAlertSeverity(item.receivedAt),
    reviewStatus: item.reviewStatus,
    linkStatus: item.linkStatus,
    unmatchedStatus: item.unmatchedStatus,
    assignmentStatus: item.assignmentStatus,
    assignedToOperatorLabel: item.assignedToOperatorLabel,
    escalationStatus: item.escalationStatus,
    escalationReason: item.escalationReason,
    routingOutcome: `${item.routingStatus}/${item.conversationLookupStatus}`,
    diagnosticsAvailable: true,
    historyAvailable: true,
    externalCalls: 0 as const
  };
}

function mockAssignmentSummaryItem(item: ProviderWebhookUnmatchedInboundItem) {
  syncMockResolutionState(item);
  const lane = mockTriageLaneForItem(item);
  return {
    unmatchedId: item.id,
    provider: item.provider,
    platform: item.provider,
    channelAccountId: item.channelAccountId,
    safeRoomLabel: mockSafeRoomLabel(item),
    roomKeyDigest: item.roomKeyDigest,
    eventType: item.eventType,
    receivedAt: item.receivedAt,
    ageBucket: mockAgeBucket(item.receivedAt),
    reviewStatus: item.reviewStatus,
    linkStatus: item.linkStatus,
    unmatchedStatus: item.unmatchedStatus,
    triageLane: lane,
    severity: mockTriageSeverityForItem(item, lane),
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
    historyAvailable: true,
    diagnosticsAvailable: true,
    candidatesAvailable: isMockLinkableUnmatchedItem(item),
    externalCalls: 0 as const
  };
}

function mockResolutionSummaryItem(item: ProviderWebhookUnmatchedInboundItem) {
  syncMockResolutionState(item);
  const lane = mockTriageLaneForItem(item);
  return {
    unmatchedId: item.id,
    provider: item.provider,
    platform: item.provider,
    channelAccountId: item.channelAccountId,
    safeRoomLabel: mockSafeRoomLabel(item),
    roomKeyDigest: item.roomKeyDigest,
    eventType: item.eventType,
    receivedAt: item.receivedAt,
    ageBucket: mockAgeBucket(item.receivedAt),
    reviewStatus: item.reviewStatus,
    linkStatus: item.linkStatus,
    unmatchedStatus: item.unmatchedStatus,
    triageLane: lane,
    severity: mockTriageSeverityForItem(item, lane),
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
    historyAvailable: true,
    diagnosticsAvailable: true,
    candidatesAvailable: isMockLinkableUnmatchedItem(item),
    externalCalls: 0 as const
  };
}

function mockClosureEvidenceSummaryItem(item: ProviderWebhookUnmatchedInboundItem) {
  syncMockResolutionState(item);
  const lane = mockTriageLaneForItem(item);
  const operatorNoteCount = mockProviderWebhookOperatorNotes.filter((note) => note.unmatchedId === item.id).length;
  const candidatesAvailable = isMockLinkableUnmatchedItem(item);
  return {
    unmatchedId: item.id,
    provider: item.provider,
    platform: item.provider,
    channelAccountId: item.channelAccountId,
    safeRoomLabel: mockSafeRoomLabel(item),
    roomKeyDigest: item.roomKeyDigest,
    eventType: item.eventType,
    receivedAt: item.receivedAt,
    ageBucket: mockAgeBucket(item.receivedAt),
    reviewStatus: item.reviewStatus,
    linkStatus: item.linkStatus,
    unmatchedStatus: item.unmatchedStatus,
    triageLane: lane,
    severity: mockTriageSeverityForItem(item, lane),
    assignmentStatus: item.assignmentStatus,
    assignedToOperatorLabel: item.assignedToOperatorLabel,
    escalationStatus: item.escalationStatus,
    escalationReason: item.escalationReason,
    resolutionStatus: item.resolutionStatus,
    resolutionOutcome: item.resolutionOutcome,
    closureReadiness: item.closureReadiness,
    evidenceStatus: mockClosureEvidenceStatusForItem(item),
    checklistCompletedCount: item.checklistCompletedCount,
    checklistTotalCount: item.checklistTotalCount,
    checklistIncompleteSteps: [...item.checklistIncompleteSteps],
    recommendedNextActions: [...item.recommendedNextActions],
    evidenceFlags: {
      diagnosticsViewedOrAvailable: item.diagnosticsAvailable || mockChecklistStepCompleted(item, "VIEWED_DIAGNOSTICS"),
      historyAvailable: true,
      operatorNotesAvailable: operatorNoteCount > 0 || mockChecklistStepCompleted(item, "CONFIRMED_OPERATOR_NOTE"),
      candidatesAvailable,
      assignmentOrEscalationPresent: item.assignmentStatus === "assigned" || item.escalationStatus === "escalated" || mockChecklistStepCompleted(item, "CONFIRMED_ASSIGNMENT_OR_ESCALATION"),
      noProviderOutboundConfirmed: mockChecklistStepCompleted(item, "CONFIRMED_NO_PROVIDER_OUTBOUND"),
      noRawLeakageConfirmed: mockChecklistStepCompleted(item, "CONFIRMED_NO_RAW_LEAKAGE"),
      safeLinkTargetConfirmed: mockChecklistStepCompleted(item, "CONFIRMED_SAFE_LINK_TARGET")
    },
    historyEntryCount: createMockUnmatchedHistory(item.id).entries.length,
    operatorNoteCount,
    candidateSummaryCount: candidatesAvailable ? 1 : 0,
    externalCalls: 0 as const
  };
}

function mockClosureEvidenceStatusForItem(item: ProviderWebhookUnmatchedInboundItem): ProviderWebhookReviewClosureEvidenceStatus {
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

function mockExportManifestQaReadinessForItem(item: ProviderWebhookUnmatchedInboundItem): ProviderWebhookReviewExportManifest["manualQaReadiness"] {
  if (!item.roomKeyDigest || item.externalCalls !== 0) return "blocked";
  return mockClosureEvidenceStatusForItem(item) === "ready" ? "ready" : "needs_review";
}

function mockChecklistStepCompleted(item: ProviderWebhookUnmatchedInboundItem, step: ProviderWebhookReviewClosureChecklistStep) {
  return item.closureChecklist.some((checklistItem) => checklistItem.step === step && checklistItem.completed);
}

function mockReviewTriageItem(item: ProviderWebhookUnmatchedInboundItem) {
  const lane = mockTriageLaneForItem(item);
  return {
    unmatchedId: item.id,
    provider: item.provider,
    platform: item.provider,
    channelAccountId: item.channelAccountId,
    safeRoomLabel: mockSafeRoomLabel(item),
    roomKeyDigest: item.roomKeyDigest,
    eventType: item.eventType,
    receivedAt: item.receivedAt,
    ageBucket: mockAgeBucket(item.receivedAt),
    triageLane: lane,
    severity: mockTriageSeverityForItem(item, lane),
    reviewStatus: item.reviewStatus,
    linkStatus: item.linkStatus,
    unmatchedStatus: item.unmatchedStatus,
    assignmentStatus: item.assignmentStatus,
    assignedToOperatorLabel: item.assignedToOperatorLabel,
    escalationStatus: item.escalationStatus,
    escalationReason: item.escalationReason,
    routingOutcome: `${item.routingStatus}/${item.conversationLookupStatus}`,
    recommendedNextActions: mockTriageActionsForLane(lane),
    diagnosticsAvailable: true,
    historyAvailable: true,
    candidatesAvailable: isMockLinkableUnmatchedItem(item),
    exportAvailable: true,
    externalCalls: 0 as const
  };
}

function filterMockEventsForMetrics(filters: ProviderWebhookReviewMetricsFilters) {
  const receivedFrom = filters.receivedAtFrom ?? filters.receivedFrom;
  const receivedTo = filters.receivedAtTo ?? filters.receivedTo;
  return mockProviderWebhookEvents.filter((event) => {
    if (filters.provider && event.provider !== filters.provider) return false;
    if (filters.eventType && event.eventType !== filters.eventType) return false;
    if (receivedFrom && event.receivedAt < new Date(receivedFrom).toISOString()) return false;
    if (receivedTo && event.receivedAt > new Date(receivedTo).toISOString()) return false;
    return true;
  });
}

function cleanMockReviewMetricsFilters(filters: ProviderWebhookReviewMetricsFilters) {
  const allowedKeys = [
    "provider",
    "reviewStatus",
    "linkStatus",
    "unmatchedStatus",
    "status",
    "eventType",
    "assignedTo",
    "assignmentStatus",
    "escalationStatus",
    "escalationReason",
    "resolutionStatus",
    "resolutionOutcome",
    "closureReadiness",
    "checklistIncomplete",
    "receivedFrom",
    "receivedTo",
    "receivedAtFrom",
    "receivedAtTo"
  ] as const;
  return Object.fromEntries(
    allowedKeys
      .map((key) => [key, filters[key]] as const)
      .filter(([, value]) => value !== undefined && value !== null && value !== "")
  ) as ProviderWebhookReviewMetricsFilters;
}

function cleanMockReviewAlertsFilters(filters: ProviderWebhookReviewAlertsFilters) {
  return {
    ...cleanMockReviewMetricsFilters(filters),
    ...(filters.severity ? { severity: filters.severity } : {})
  } as ProviderWebhookReviewAlertsFilters;
}

function cleanMockReviewTriageFilters(filters: ProviderWebhookReviewTriageFilters) {
  return {
    ...cleanMockReviewMetricsFilters(filters),
    ...(filters.severity ? { severity: filters.severity } : {}),
    ...(filters.triageLane ? { triageLane: filters.triageLane } : {})
  } as ProviderWebhookReviewTriageFilters;
}

function cleanMockReviewResolutionSummaryFilters(filters: ProviderWebhookReviewResolutionSummaryFilters) {
  return {
    ...cleanMockReviewTriageFilters(filters),
    ...(filters.resolutionStatus ? { resolutionStatus: filters.resolutionStatus } : {}),
    ...(filters.resolutionOutcome ? { resolutionOutcome: filters.resolutionOutcome } : {}),
    ...(filters.closureReadiness ? { closureReadiness: filters.closureReadiness } : {}),
    ...(filters.checklistIncomplete !== undefined ? { checklistIncomplete: filters.checklistIncomplete } : {})
  } as ProviderWebhookReviewResolutionSummaryFilters;
}

function cleanMockReviewClosureReportFilters(filters: ProviderWebhookReviewClosureReportFilters) {
  return {
    ...cleanMockReviewResolutionSummaryFilters(filters)
  } as ProviderWebhookReviewClosureReportFilters;
}

function cleanMockSavedViewFilters(filters: CreateProviderWebhookReviewSavedViewRequest["filters"] = {}): ProviderWebhookReviewSavedView["filters"] {
  const allowedKeys = [
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
  ] as const;
  return Object.fromEntries(
    allowedKeys
      .map((key) => [key, filters[key]] as const)
      .filter(([, value]) => value !== undefined && value !== null && value !== "")
  ) as ProviderWebhookReviewSavedView["filters"];
}

function mockTriageBaseFilters(filters: ProviderWebhookReviewTriageFilters): ProviderWebhookReviewMetricsFilters {
  const { severity: _severity, triageLane: _triageLane, ...baseFilters } = filters;
  return baseFilters;
}

const providersForMetrics = ["line", "telegram", "facebook", "instagram"] as const;
const eventTypesForMetrics = ["message.created", "webhook.verified", "webhook.failed"] as const;
const reviewStatusesForMetrics = ["pending", "reviewed", "skipped", "linked"] as const;
const linkStatusesForMetrics = ["none", "rejected", "linked", "linked-message-persisted", "duplicate-noop"] as const;
const unmatchedStatusesForMetrics = ["open", "review-needed", "reviewed", "blocked", "skipped", "linked", "duplicate-skipped"] as const;
const alertSeveritiesForMetrics = ["info", "warning", "critical"] as const;
const mockEscalationReasons = ["none", "SLA_RISK", "NO_SAFE_CANDIDATE", "ROUTING_FAILED", "HIGH_PRIORITY_CUSTOMER", "NEEDS_MANAGER_REVIEW", "MANUAL_REVIEW_BLOCKED"] as const;
const mockResolutionStatuses = ["unresolved", "resolved"] as const;
const mockResolutionOutcomes = ["none", "NEEDS_REVIEW", "REVIEWED_NO_MATCH", "REVIEWED_SAFE_MATCH", "LINKED_EXISTING_CONVERSATION", "LINKED_AND_PERSISTED_SAFE_MESSAGE", "SKIPPED_DUPLICATE", "SKIPPED_SPAM", "SKIPPED_UNSUPPORTED_EVENT", "ESCALATED_TO_MANAGER", "BLOCKED_UNSAFE", "ROUTING_FAILED", "MANUAL_REVIEW_REQUIRED"] as const;
const mockClosureReadinessValues = ["NOT_READY", "READY_FOR_REVIEW", "READY_FOR_SKIP", "READY_FOR_LINK", "READY_FOR_LINK_AND_PERSIST", "ALREADY_REVIEWED", "BLOCKED"] as const;
const mockClosureChecklistSteps: ProviderWebhookReviewClosureChecklistStep[] = [
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
const mockTriageLanes: ProviderWebhookReviewTriageLane[] = [
  "critical_stale_open",
  "warning_stale_open",
  "candidate_lookup_recommended",
  "safe_link_candidate_available",
  "needs_manual_review",
  "recently_reviewed",
  "skipped_ignored",
  "failed_routing_missing_match"
];
const mockTriageLaneDetails: Record<ProviderWebhookReviewTriageLane, {
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
const mockReviewAlertThresholds = {
  staleWarningHours: 24,
  staleCriticalHours: 72,
  overSlaHours: 48
} as const;

function countMockBy<T, K extends string>(items: T[], keys: readonly K[], getKey: (item: T) => K) {
  return keys.map((key) => ({
    key,
    label: key,
    count: items.filter((item) => getKey(item) === key).length
  }));
}

function countMockByDynamic<T>(items: T[], getKey: (item: T) => string) {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = getKey(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, count]) => ({ key, label: key, count }));
}

function mockAgeBuckets(items: ProviderWebhookUnmatchedInboundItem[]) {
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

function mockAgeBucket(receivedAt: string): ProviderWebhookReviewAlertAgeBucket {
  const ageHours = mockHoursSince(receivedAt);
  if (ageHours < 1) return "under1Hour";
  if (ageHours < 24) return "oneTo24Hours";
  if (ageHours < 72) return "oneTo3Days";
  return "over3Days";
}

function mockReviewAlertSeverity(receivedAt: string): ProviderWebhookReviewAlertSeverity {
  const ageHours = mockHoursSince(receivedAt);
  if (ageHours >= mockReviewAlertThresholds.staleCriticalHours) return "critical";
  if (ageHours >= mockReviewAlertThresholds.staleWarningHours) return "warning";
  return "info";
}

function mockTriageLaneForItem(item: ProviderWebhookUnmatchedInboundItem): ProviderWebhookReviewTriageLane {
  if (item.reviewStatus === "skipped" || item.unmatchedStatus === "skipped" || item.unmatchedStatus === "duplicate-skipped" || item.unmatchedStatus === "blocked") {
    return "skipped_ignored";
  }
  if (item.reviewStatus === "reviewed" || item.reviewStatus === "linked" || item.unmatchedStatus === "reviewed" || item.unmatchedStatus === "linked") {
    return "recently_reviewed";
  }
  if (item.unmatchedStatus === "open" || item.unmatchedStatus === "review-needed") {
    const ageHours = mockHoursSince(item.receivedAt);
    if (ageHours >= mockReviewAlertThresholds.staleCriticalHours) return "critical_stale_open";
    if (ageHours >= mockReviewAlertThresholds.staleWarningHours) return "warning_stale_open";
    if (isMockLinkableUnmatchedItem(item)) return "safe_link_candidate_available";
    if (item.conversationLookupStatus === "not-found") return "candidate_lookup_recommended";
    if (item.routingStatus === "blocked-signature" || item.routingStatus === "blocked-replay" || item.routingStatus === "unsupported") {
      return "failed_routing_missing_match";
    }
    return "needs_manual_review";
  }
  return "failed_routing_missing_match";
}

function mockTriageSeverityForItem(item: ProviderWebhookUnmatchedInboundItem, lane: ProviderWebhookReviewTriageLane): ProviderWebhookReviewAlertSeverity {
  if (lane === "critical_stale_open") return "critical";
  if (lane === "warning_stale_open") return "warning";
  if (lane === "failed_routing_missing_match" && item.routingStatus !== "dry-run-only") return "warning";
  return "info";
}

function mockTriageLaneSeverity(lane: ProviderWebhookReviewTriageLane): ProviderWebhookReviewAlertSeverity {
  if (lane === "critical_stale_open") return "critical";
  if (lane === "warning_stale_open" || lane === "failed_routing_missing_match") return "warning";
  return "info";
}

function mockTriageActionsForLane(lane: ProviderWebhookReviewTriageLane): ProviderWebhookTriageRecommendedAction[] {
  if (lane === "critical_stale_open") return ["OPEN_DIAGNOSTICS", "VIEW_HISTORY", "APPLY_FILTER", "MARK_REVIEWED", "SKIP"];
  if (lane === "warning_stale_open") return ["OPEN_DIAGNOSTICS", "VIEW_HISTORY", "APPLY_FILTER", "RUN_CANDIDATE_LOOKUP"];
  if (lane === "safe_link_candidate_available") return ["RUN_CANDIDATE_LOOKUP", "LINK_ONLY", "LINK_AND_PERSIST_SAFE_MESSAGE"];
  if (lane === "candidate_lookup_recommended") return ["RUN_CANDIDATE_LOOKUP", "OPEN_DIAGNOSTICS", "VIEW_HISTORY"];
  if (lane === "needs_manual_review") return ["OPEN_DIAGNOSTICS", "VIEW_HISTORY", "MARK_REVIEWED", "SKIP"];
  if (lane === "recently_reviewed") return ["VIEW_HISTORY", "OPEN_DIAGNOSTICS"];
  if (lane === "skipped_ignored") return ["VIEW_HISTORY", "APPLY_FILTER"];
  return ["OPEN_DIAGNOSTICS", "VIEW_HISTORY", "APPLY_FILTER", "SKIP"];
}

function mockTriageSeverityRank(severity: ProviderWebhookReviewAlertSeverity) {
  if (severity === "critical") return 3;
  if (severity === "warning") return 2;
  return 1;
}

function mockHoursSince(receivedAt: string) {
  const receivedMs = new Date(receivedAt).getTime();
  if (Number.isNaN(receivedMs)) return 0;
  return Math.max(0, (Date.now() - receivedMs) / (60 * 60 * 1000));
}

function createMockUnmatchedDiagnostics(unmatchedInboundId: string): ProviderWebhookUnmatchedInboundDiagnostics {
  const item = mockProviderWebhookUnmatchedInbound.find((candidate) => candidate.id === unmatchedInboundId);
  if (!item) throw new Error("Unmatched inbound item not found");
  syncMockResolutionState(item);
  const event = mockProviderWebhookEvents.find((candidate) => candidate.unmatchedInboundId === item.id);
  return {
    unmatchedId: item.id,
    provider: item.provider,
    platform: item.provider,
    channelAccountId: item.channelAccountId,
    safeRoomLabel: mockSafeRoomLabel(item),
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
    candidateLookupAvailable: isMockLinkableUnmatchedItem(item),
    historyAvailable: true,
    exportAvailable: true,
    lastActionAt: item.unmatchedResolvedAt ?? item.reviewedAt ?? item.receivedAt,
    safeWarnings: {
      signatureRejected: event?.signatureStatus === "failed" || item.routingStatus === "blocked-signature",
      replayDuplicate: event?.replayDetected === true || item.routingStatus === "blocked-replay" || item.unmatchedStatus === "duplicate-skipped",
      missingConversationMatch: item.conversationLookupStatus === "not-found",
      staleOpenItem: isMockStaleOpenUnmatchedItem(item)
    },
    externalCalls: 0
  };
}

function isMockLinkableUnmatchedItem(item: ProviderWebhookUnmatchedInboundItem) {
  return (item.unmatchedStatus === "open" || item.unmatchedStatus === "review-needed")
    && item.normalizationStatus === "normalized"
    && item.conversationLookupStatus === "not-found"
    && item.providerEventDigest !== null
    && item.channelAccountId !== null
    && item.roomKeyDigest !== null;
}

function isMockStaleOpenUnmatchedItem(item: ProviderWebhookUnmatchedInboundItem) {
  if (item.unmatchedStatus !== "open" && item.unmatchedStatus !== "review-needed") return false;
  const receivedAt = new Date(item.receivedAt).getTime();
  if (Number.isNaN(receivedAt)) return false;
  return Date.now() - receivedAt >= 3 * 24 * 60 * 60 * 1000;
}

function createMockUnmatchedHistory(unmatchedInboundId: string): ProviderWebhookUnmatchedInboundHistory {
  const item = mockProviderWebhookUnmatchedInbound.find((candidate) => candidate.id === unmatchedInboundId);
  if (!item) throw new Error("Unmatched inbound item not found");
  syncMockResolutionState(item);
  const safeRoomLabel = mockSafeRoomLabel(item);
  const base = {
    unmatchedInboundId: item.id,
    provider: item.provider,
    channelAccountId: item.channelAccountId,
    safeRoomLabel,
    roomKeyDigest: item.roomKeyDigest,
    eventType: item.eventType,
    externalCalls: 0 as const
  };
  const entries: ProviderWebhookUnmatchedInboundHistory["entries"] = [
    {
      id: `${item.id}-history-received`,
      ...base,
      action: "inbound_received",
      actionStatus: "received",
      statusBefore: null,
      statusAfter: "received",
      actor: "system",
      reason: "Mock sandbox event received",
      message: "Inbound sandbox event received",
      linkedConversationId: null,
      linkedMessageId: null,
      receivedAt: item.receivedAt,
      actionAt: item.receivedAt
    },
    {
      id: `${item.id}-history-routed`,
      ...base,
      action: "normalized_routed",
      actionStatus: `${item.normalizationStatus}/${item.routingStatus}`,
      statusBefore: "received",
      statusAfter: item.routingStatus,
      actor: "system",
      reason: `lookup=${item.conversationLookupStatus}`,
      message: "Normalized and routed with safe provider context",
      linkedConversationId: null,
      linkedMessageId: null,
      receivedAt: item.receivedAt,
      actionAt: item.receivedAt
    },
    {
      id: `${item.id}-history-queued`,
      ...base,
      action: "unmatched_queued",
      actionStatus: item.unmatchedStatus,
      statusBefore: item.routingStatus,
      statusAfter: item.unmatchedStatus,
      actor: "system",
      reason: item.unmatchedReason,
      message: "Queued for safe unmatched inbound review",
      linkedConversationId: null,
      linkedMessageId: null,
      receivedAt: item.receivedAt,
      actionAt: item.receivedAt
    }
  ];
  if (item.reviewStatus === "reviewed" || item.reviewStatus === "skipped") {
    entries.push({
      id: `${item.id}-history-${item.reviewStatus}`,
      ...base,
      action: item.reviewStatus,
      actionStatus: item.reviewStatus,
      statusBefore: "review-needed",
      statusAfter: item.unmatchedStatus,
      actor: item.reviewedBy ?? "system",
      reason: item.reviewReason,
      message: item.reviewStatus === "reviewed" ? "Unmatched inbound item marked reviewed" : "Unmatched inbound item skipped",
      linkedConversationId: null,
      linkedMessageId: null,
      receivedAt: item.receivedAt,
      actionAt: item.reviewedAt ?? item.unmatchedResolvedAt ?? item.receivedAt
    });
  }
  if (item.reviewStatus === "linked") {
    entries.push({
      id: `${item.id}-history-linked`,
      ...base,
      action: "linked_to_conversation",
      actionStatus: item.linkStatus,
      statusBefore: "review-needed",
      statusAfter: item.unmatchedStatus,
      actor: "system",
      reason: item.linkStatus,
      message: "Linked to safe conversation",
      linkedConversationId: item.linkedConversationId,
      linkedMessageId: item.linkedMessageId,
      receivedAt: item.receivedAt,
      actionAt: item.unmatchedResolvedAt ?? item.receivedAt
    });
    if (item.messagePersisted) {
      entries.push({
        id: `${item.id}-history-linked-message`,
        ...base,
        action: "linked_message_persisted",
        actionStatus: item.linkStatus,
        statusBefore: "linked",
        statusAfter: item.linkStatus,
        actor: "system",
        reason: "safe message persisted",
        message: "Linked and persisted safe inbound message",
        linkedConversationId: item.linkedConversationId,
        linkedMessageId: item.linkedMessageId,
        receivedAt: item.receivedAt,
        actionAt: item.unmatchedResolvedAt ?? item.receivedAt
      });
    }
  }
  if (item.assignmentStatus === "assigned") {
    entries.push({
      id: `${item.id}-history-assigned`,
      ...base,
      action: "assigned",
      actionStatus: "assigned",
      statusBefore: "unassigned",
      statusAfter: `assigned:${item.assignedToOperatorLabel ?? "unknown"}`,
      actor: item.assignedByOperatorLabel ?? "operator:current",
      reason: `assigned to ${item.assignedToOperatorLabel ?? "operator"}`,
      message: "Unmatched inbound assigned for internal review",
      linkedConversationId: null,
      linkedMessageId: null,
      receivedAt: item.receivedAt,
      actionAt: item.assignedAt ?? item.receivedAt
    });
  }
  if (item.escalationStatus === "escalated") {
    entries.push({
      id: `${item.id}-history-escalated`,
      ...base,
      action: "escalated",
      actionStatus: "escalated",
      statusBefore: "none",
      statusAfter: `escalated:${item.escalationReason ?? "unspecified"}`,
      actor: item.escalatedByOperatorLabel ?? "operator:current",
      reason: item.escalationReason,
      message: "Unmatched inbound escalated for internal review",
      linkedConversationId: null,
      linkedMessageId: null,
      receivedAt: item.receivedAt,
      actionAt: item.escalatedAt ?? item.receivedAt
    });
  }
  if (item.resolutionOutcome) {
    entries.push({
      id: `${item.id}-history-resolution`,
      ...base,
      action: "resolution_set",
      actionStatus: item.resolutionOutcome,
      statusBefore: "unresolved",
      statusAfter: `${item.resolutionStatus}:${item.resolutionOutcome}`,
      actor: item.resolvedByOperatorLabel ?? "operator:current",
      reason: item.resolutionOutcome,
      message: "Resolution metadata updated",
      linkedConversationId: null,
      linkedMessageId: null,
      receivedAt: item.receivedAt,
      actionAt: item.resolvedAt ?? item.receivedAt
    });
  }
  if (item.checklistCompletedCount > 0) {
    entries.push({
      id: `${item.id}-history-checklist`,
      ...base,
      action: "checklist_completed",
      actionStatus: `${item.checklistCompletedCount}/${item.checklistTotalCount}`,
      statusBefore: "0/0",
      statusAfter: `${item.checklistCompletedCount}/${item.checklistTotalCount}`,
      actor: "operator:current",
      reason: item.closureChecklist.filter((step) => step.completed).map((step) => step.step).join(",").slice(0, 160),
      message: "Resolution checklist updated",
      linkedConversationId: null,
      linkedMessageId: null,
      receivedAt: item.receivedAt,
      actionAt: item.closureChecklist.find((step) => step.completed)?.completedAt ?? item.receivedAt
    });
  }
  return {
    unmatchedInboundId: item.id,
    provider: item.provider,
    channelAccountId: item.channelAccountId,
    safeRoomLabel,
    roomKeyDigest: item.roomKeyDigest,
    entries,
    externalCalls: 0
  };
}

function createMockUnmatchedExport(filters: ProviderWebhookUnmatchedInboundExportQuery): ProviderWebhookUnmatchedInboundExport {
  const format = filters.format ?? "json";
  const limit = Math.min(filters.limit ?? 500, 500);
  const offset = filters.offset ?? 0;
  const sortBy = filters.sortBy ?? "receivedAt";
  const sortOrder = filters.sortOrder ?? "desc";
  const filtered = filterMockUnmatchedInbound(filters);
  const sorted = [...filtered].sort((left, right) => {
    const compared = left.receivedAt.localeCompare(right.receivedAt);
    return sortOrder === "asc" ? compared : -compared;
  });
  const rows = sorted.slice(offset, offset + limit).map((item) => {
    syncMockResolutionState(item);
    return {
      id: item.id,
      provider: item.provider,
      channelAccountId: item.channelAccountId,
      safeRoomLabel: mockSafeRoomLabel(item),
      roomKeyDigest: item.roomKeyDigest,
      eventType: item.eventType,
      reviewStatus: item.reviewStatus,
      linkStatus: item.linkStatus,
      unmatchedStatus: item.unmatchedStatus,
      receivedAt: item.receivedAt,
      reviewedAt: item.reviewedAt,
      linkedConversationId: item.linkedConversationId,
      candidateCount: mockProviderWebhookCandidatesByUnmatchedId[item.id]?.length ?? null,
      safeMessagePreview: safeMockText(item.textPreview),
      safeReason: safeMockText(item.reviewReason ?? item.unmatchedReason),
      safeResultSummary: safeMockText(item.reviewStatus === "linked" ? `linked:${item.linkStatus}` : item.reviewStatus),
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
  });
  return {
    format,
    rows,
    csv: format === "csv" ? mockRowsToCsv(rows) : null,
    appliedFilters: {
      ...filters,
      format,
      limit,
      offset,
      sortBy,
      sortOrder
    },
    appliedSort: {
      sortBy,
      sortOrder
    },
    requestedLimit: filters.limit ?? 500,
    exportMaxLimit: 500,
    exportedCount: rows.length,
    externalCalls: 0
  };
}

function mockSafeRoomLabel(item: ProviderWebhookUnmatchedInboundItem) {
  return `${item.provider} room digest ${item.roomKeyDigest?.replace(/^sha256:/, "").slice(0, 12) ?? "none"}`;
}

function defaultMockClosureChecklist() {
  return mockClosureChecklistSteps.map((step) => ({
    step,
    completed: false,
    completedAt: null,
    completedByOperatorLabel: null
  }));
}

function ensureMockResolutionState(item: ProviderWebhookUnmatchedInboundItem) {
  item.resolutionStatus = item.resolutionStatus ?? "unresolved";
  item.resolutionOutcome = item.resolutionOutcome ?? null;
  item.resolvedAt = item.resolvedAt ?? null;
  item.resolvedByOperatorLabel = item.resolvedByOperatorLabel ?? null;
  const existing = new Map((item.closureChecklist ?? []).map((step) => [step.step, step]));
  item.closureChecklist = mockClosureChecklistSteps.map((step) => {
    const current = existing.get(step);
    return {
      step,
      completed: current?.completed ?? false,
      completedAt: current?.completedAt ?? null,
      completedByOperatorLabel: current?.completedByOperatorLabel ?? null
    };
  });
}

function syncMockResolutionState(item: ProviderWebhookUnmatchedInboundItem) {
  ensureMockResolutionState(item);
  item.checklistTotalCount = item.closureChecklist.length;
  item.checklistCompletedCount = item.closureChecklist.filter((step) => step.completed).length;
  item.checklistIncompleteSteps = item.closureChecklist.filter((step) => !step.completed).map((step) => step.step);
  item.resolutionStatus = item.resolutionOutcome ? "resolved" : "unresolved";
  item.closureReadiness = mockClosureReadinessForItem(item);
  item.recommendedNextActions = mockRecommendedNextActionsForItem(item);
  item.externalCalls = 0;
  return item;
}

function mockClosureReadinessForItem(item: ProviderWebhookUnmatchedInboundItem) {
  if (item.unmatchedStatus === "blocked" || item.resolutionOutcome === "BLOCKED_UNSAFE" || item.resolutionOutcome === "ROUTING_FAILED") return "BLOCKED";
  if (item.reviewStatus !== "pending" || (item.unmatchedStatus !== "open" && item.unmatchedStatus !== "review-needed")) return "ALREADY_REVIEWED";
  if (!item.resolutionOutcome) return "NOT_READY";
  if (item.checklistIncompleteSteps.length > 0) return "NOT_READY";
  if (item.resolutionOutcome === "SKIPPED_DUPLICATE" || item.resolutionOutcome === "SKIPPED_SPAM" || item.resolutionOutcome === "SKIPPED_UNSUPPORTED_EVENT") return "READY_FOR_SKIP";
  if (item.resolutionOutcome === "REVIEWED_SAFE_MATCH" || item.resolutionOutcome === "LINKED_EXISTING_CONVERSATION") return "READY_FOR_LINK";
  if (item.resolutionOutcome === "LINKED_AND_PERSISTED_SAFE_MESSAGE") return "READY_FOR_LINK_AND_PERSIST";
  return "READY_FOR_REVIEW";
}

function mockRecommendedNextActionsForItem(item: ProviderWebhookUnmatchedInboundItem): ProviderWebhookReviewRecommendedNextAction[] {
  if (item.closureReadiness === "ALREADY_REVIEWED") return ["VIEW_HISTORY", "OPEN_DIAGNOSTICS"];
  if (item.closureReadiness === "BLOCKED") return item.escalationStatus === "escalated"
    ? ["VIEW_HISTORY", "ADD_OPERATOR_NOTE", "CLEAR_ESCALATION"]
    : ["OPEN_DIAGNOSTICS", "ADD_OPERATOR_NOTE", "ESCALATE"];
  const incomplete = new Set(item.checklistIncompleteSteps);
  const actions: ProviderWebhookReviewRecommendedNextAction[] = [];
  if (incomplete.has("VIEWED_DIAGNOSTICS")) actions.push("OPEN_DIAGNOSTICS");
  if (incomplete.has("REVIEWED_HISTORY")) actions.push("VIEW_HISTORY");
  if (incomplete.has("REVIEWED_CANDIDATES") && isMockLinkableUnmatchedItem(item)) actions.push("RUN_CANDIDATE_LOOKUP");
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

function applyMockResolution(item: ProviderWebhookUnmatchedInboundItem, payload: ProviderWebhookUnmatchedInboundResolutionRequest) {
  const nowIso = new Date().toISOString();
  if (payload.operation === "CLEAR_RESOLUTION") {
    item.resolutionStatus = "unresolved";
    item.resolutionOutcome = null;
    item.resolvedAt = null;
    item.resolvedByOperatorLabel = null;
  } else {
    item.resolutionStatus = "resolved";
    item.resolutionOutcome = payload.resolutionOutcome ?? "NEEDS_REVIEW";
    item.resolvedAt = nowIso;
    item.resolvedByOperatorLabel = "operator:current";
  }
  item.lastOperatorNoteAt = payload.note ? nowIso : item.lastOperatorNoteAt;
  syncMockResolutionState(item);
}

function applyMockChecklist(item: ProviderWebhookUnmatchedInboundItem, payload: ProviderWebhookUnmatchedInboundResolutionChecklistRequest) {
  const nowIso = new Date().toISOString();
  ensureMockResolutionState(item);
  if (payload.operation === "RESET_CHECKLIST") {
    item.closureChecklist = defaultMockClosureChecklist();
  } else {
    const target = item.closureChecklist.find((step) => step.step === payload.step);
    if (!target) throw new Error("Safe checklist step is required");
    target.completed = payload.operation === "COMPLETE_STEP";
    target.completedAt = target.completed ? nowIso : null;
    target.completedByOperatorLabel = target.completed ? "operator:current" : null;
  }
  syncMockResolutionState(item);
}

function mockResolutionFingerprint(item: ProviderWebhookUnmatchedInboundItem) {
  syncMockResolutionState(item);
  return [
    item.resolutionStatus,
    item.resolutionOutcome ?? "",
    item.resolvedAt ?? "",
    item.closureReadiness,
    item.closureChecklist.map((step) => `${step.step}:${step.completed ? "1" : "0"}`).join(",")
  ].join("|");
}

function mockRowsToCsv(rows: ProviderWebhookUnmatchedInboundExport["rows"]) {
  const columns: (keyof ProviderWebhookUnmatchedInboundExport["rows"][number])[] = ["id", "provider", "channelAccountId", "safeRoomLabel", "roomKeyDigest", "eventType", "reviewStatus", "linkStatus", "unmatchedStatus", "receivedAt", "reviewedAt", "linkedConversationId", "candidateCount", "safeMessagePreview", "safeReason", "safeResultSummary", "assignmentStatus", "assignedToOperatorLabel", "assignedAt", "escalationStatus", "escalationReason", "escalatedAt", "resolutionStatus", "resolutionOutcome", "closureReadiness", "checklistCompletedCount", "checklistTotalCount", "externalCalls"];
  return [
    columns.join(","),
    ...rows.map((row) => columns.map((column) => mockCsvCell(row[column])).join(","))
  ].join("\n");
}

function applyMockAssignment(
  item: ProviderWebhookUnmatchedInboundItem,
  payload: ProviderWebhookUnmatchedInboundAssignmentRequest | ProviderWebhookUnmatchedInboundBulkAssignmentRequest
) {
  const nowIso = new Date().toISOString();
  if (payload.operation === "UNASSIGN") {
    item.assignmentStatus = "unassigned";
    item.assignedToOperatorLabel = null;
    item.assignedAt = null;
    item.assignedByOperatorLabel = "operator:current";
  } else {
    item.assignmentStatus = "assigned";
    item.assignedToOperatorLabel = payload.operation === "ASSIGN_TO_ME" ? "operator:current" : safeMockText(payload.assignedToOperatorLabel) ?? "operator:queue-lead";
    item.assignedAt = nowIso;
    item.assignedByOperatorLabel = "operator:current";
  }
  item.lastOperatorNoteAt = payload.note ? nowIso : item.lastOperatorNoteAt;
  item.externalCalls = 0;
}

function applyMockEscalation(
  item: ProviderWebhookUnmatchedInboundItem,
  payload: ProviderWebhookUnmatchedInboundEscalationRequest | ProviderWebhookUnmatchedInboundBulkEscalationRequest
) {
  const nowIso = new Date().toISOString();
  if (payload.operation === "CLEAR_ESCALATION") {
    item.escalationStatus = "none";
    item.escalationReason = null;
    item.escalatedAt = null;
    item.escalatedByOperatorLabel = "operator:current";
  } else {
    item.escalationStatus = "escalated";
    item.escalationReason = payload.escalationReason ?? "MANUAL_REVIEW_BLOCKED";
    item.escalatedAt = nowIso;
    item.escalatedByOperatorLabel = "operator:current";
  }
  item.lastOperatorNoteAt = payload.note ? nowIso : item.lastOperatorNoteAt;
  item.externalCalls = 0;
}

function mockBulkMetadataSummary(
  requestedCount: number,
  dedupedCount: number,
  results: ProviderWebhookUnmatchedInboundBulkAssignmentResponse["results"] | ProviderWebhookUnmatchedInboundBulkEscalationResponse["results"]
) {
  return {
    requestedCount,
    dedupedCount,
    successCount: results.filter((result) => result.ok).length,
    errorCount: results.filter((result) => !result.ok).length,
    updatedCount: results.filter((result) => result.resultStatus === "updated").length,
    alreadyAppliedCount: results.filter((result) => result.resultStatus === "already-applied").length
  };
}

function mockBulkResolutionSummary(
  requestedCount: number,
  dedupedCount: number,
  results: ProviderWebhookUnmatchedInboundBulkResolutionResponse["results"]
) {
  return {
    requestedCount,
    dedupedCount,
    successCount: results.filter((result) => result.ok).length,
    errorCount: results.filter((result) => !result.ok).length,
    updatedCount: results.filter((result) => result.resultStatus === "updated").length,
    alreadyAppliedCount: results.filter((result) => result.resultStatus === "already-applied").length
  };
}

function mockCsvCell(value: ProviderWebhookUnmatchedInboundExport["rows"][number][keyof ProviderWebhookUnmatchedInboundExport["rows"][number]]) {
  if (value === null || value === undefined) return "";
  return `"${String(value).replace(/"/g, "\"\"")}"`;
}

function refreshMockUnmatchedCounts() {
  mockProviderWebhookUnmatchedInbound.forEach(syncMockResolutionState);
  const summary = summarizeMockUnmatchedInbound(mockProviderWebhookUnmatchedInbound);
  mockProviderReadiness.unmatchedInboundOpenCount = summary.openCount;
  mockProviderReadiness.unmatchedInboundStaleOpenCount = mockProviderWebhookUnmatchedInbound.filter(isMockStaleOpenUnmatchedItem).length;
  mockProviderReadiness.reviewAlertCriticalCount = createMockReviewAlerts({}).criticalCount;
  mockProviderReadiness.criticalTriageCount = createMockReviewTriage({}).topItems.filter((item) => item.severity === "critical").length;
  mockProviderReadiness.openTriageCount = createMockReviewTriage({}).totalOpenItems;
  mockProviderReadiness.unmatchedInboundReviewedCount = summary.reviewedCount;
  mockProviderReadiness.unmatchedInboundSkippedCount = summary.skippedCount;
  mockProviderReadiness.unmatchedInboundLinkedCount = summary.linkedCount;
  mockProviderReadiness.savedViewCount = mockProviderWebhookReviewSavedViews.filter((view) => !view.archived).length;
  mockProviderReadiness.operatorNoteCount = mockProviderWebhookOperatorNotes.length;
  mockProviderReadiness.unassignedOpenCount = mockProviderWebhookUnmatchedInbound.filter((item) =>
    (item.unmatchedStatus === "open" || item.unmatchedStatus === "review-needed") && item.assignmentStatus === "unassigned"
  ).length;
  mockProviderReadiness.assignedOpenCount = mockProviderWebhookUnmatchedInbound.filter((item) =>
    (item.unmatchedStatus === "open" || item.unmatchedStatus === "review-needed") && item.assignmentStatus === "assigned"
  ).length;
  mockProviderReadiness.escalatedOpenCount = mockProviderWebhookUnmatchedInbound.filter((item) =>
    (item.unmatchedStatus === "open" || item.unmatchedStatus === "review-needed") && item.escalationStatus === "escalated"
  ).length;
  const openItems = mockProviderWebhookUnmatchedInbound.filter((item) => item.unmatchedStatus === "open" || item.unmatchedStatus === "review-needed");
  mockProviderReadiness.unresolvedOpenCount = openItems.filter((item) => item.resolutionStatus === "unresolved").length;
  mockProviderReadiness.readyForClosureCount = openItems.filter((item) => item.closureReadiness === "READY_FOR_REVIEW" || item.closureReadiness === "READY_FOR_SKIP" || item.closureReadiness === "READY_FOR_LINK" || item.closureReadiness === "READY_FOR_LINK_AND_PERSIST").length;
  mockProviderReadiness.blockedResolutionCount = openItems.filter((item) => item.closureReadiness === "BLOCKED").length;
  mockProviderReadiness.checklistIncompleteOpenCount = openItems.filter((item) => item.checklistCompletedCount < item.checklistTotalCount).length;
  const closureReport = createMockReviewClosureReport({});
  mockProviderReadiness.closureEvidenceReadyCount = closureReport.evidenceReadyCount;
  mockProviderReadiness.closureEvidenceBlockedCount = closureReport.evidenceBlockedCount;
  mockProviderReadiness.closureEvidenceIncompleteCount = closureReport.evidenceIncompleteCount;
  mockProviderReadiness.closureEvidenceExportCount = mockProviderWebhookUnmatchedInbound.length;
  mockProviderReadiness.closureReportExportCount = mockProviderWebhookUnmatchedInbound.length > 0 ? 1 : 0;
  mockProviderReadiness.exportRedactionPassedCount = mockProviderWebhookUnmatchedInbound.filter((item) => Boolean(item.roomKeyDigest)).length;
  mockProviderReadiness.exportRedactionWarningCount = mockProviderWebhookUnmatchedInbound.filter((item) => !item.roomKeyDigest).length;
  mockProviderReadiness.exportRedactionBlockedCount = 0;
  const manifestStatuses = mockProviderWebhookUnmatchedInbound.map(mockExportManifestQaReadinessForItem);
  mockProviderReadiness.exportManifestReadyCount = manifestStatuses.filter((status) => status === "ready").length;
  mockProviderReadiness.exportManifestNeedsReviewCount = manifestStatuses.filter((status) => status === "needs_review").length;
  mockProviderReadiness.exportManifestBlockedCount = manifestStatuses.filter((status) => status === "blocked").length;
  mockProviderReadiness.latestExportManifestStatus = manifestStatuses[0] ?? null;
  mockProviderReadiness.lockedArchiveReadyCount = mockProviderWebhookQaHandoffAcceptanceLocks.length;
  mockProviderReadiness.lockedArchiveExportedCount = mockProviderWebhookQaHandoffLockedArchiveExports.length;
  mockProviderReadiness.retentionManifestReadyCount = mockProviderWebhookQaHandoffAcceptanceLocks.length;
  mockProviderReadiness.latestLockedArchiveStatus = mockProviderWebhookQaHandoffLockedArchiveExports.length > 0 ? "exported" : mockProviderWebhookQaHandoffAcceptanceLocks.length > 0 ? "ready" : null;
  mockProviderReadiness.latestRetentionManifestStatus = mockProviderWebhookQaHandoffAcceptanceLocks.length > 0 ? "ready" : null;
}

export const mockProviderReadiness: ProviderReadiness = {
  mode: "disabled",
  outboundEnabledByEnv: false,
  sandboxMode: "disabled",
  sandboxEnabled: false,
  channelMode: "mock",
  metaChannelMode: "mock",
  realOutboundEnabled: false,
  allowlistCount: 0,
  allowlist: {
    configured: false,
    entryCount: 0
  },
  webhookSignatureVerificationConfigured: true,
  webhookSignatureVerificationReady: true,
  replayGuardrailsEnabled: true,
  lastSandboxEventSignatureStatus: "verified",
  latestReplayStatus: "fresh",
  replayDetectedCount: 0,
  webhookNormalizationEnabled: true,
  webhookDryRunRoutingEnabled: true,
  lastSandboxEventNormalizationStatus: "normalized",
  latestRoutingStatus: "dry-run-only",
  normalizedEventCount: 1,
  routingBlockedCount: 0,
  webhookInboundPersistenceEnabled: true,
  latestInboundPersistenceStatus: "dry-run-only",
  persistedInboundMessageCount: 0,
  inboundPersistenceBlockedCount: 0,
  inboundPersistenceReplayBlockedCount: 0,
  inboundPersistenceSkippedNoMatchCount: 0,
  webhookUnmatchedInboundReviewEnabled: true,
  webhookUnmatchedReviewActionsEnabled: true,
  webhookCandidateLookupEnabled: true,
  webhookUnmatchedHistoryEnabled: true,
  webhookUnmatchedQueueExportEnabled: true,
  webhookUnmatchedQueueExportMaxLimit: 500,
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
  lockedArchiveReadyCount: 0,
  lockedArchiveExportedCount: 0,
  retentionManifestReadyCount: 0,
  latestLockedArchiveStatus: null,
  latestRetentionManifestStatus: null,
  exportRedactionPassedCount: 1,
  exportRedactionWarningCount: 0,
  exportRedactionBlockedCount: 0,
  exportManifestReadyCount: 0,
  exportManifestNeedsReviewCount: 1,
  exportManifestBlockedCount: 0,
  latestExportManifestStatus: "needs_review",
  savedViewCount: 1,
  operatorNoteCount: 0,
  unassignedOpenCount: 1,
  assignedOpenCount: 0,
  escalatedOpenCount: 0,
  unresolvedOpenCount: 1,
  readyForClosureCount: 0,
  blockedResolutionCount: 0,
  checklistIncompleteOpenCount: 1,
  closureEvidenceReadyCount: 0,
  closureEvidenceBlockedCount: 0,
  closureEvidenceIncompleteCount: 1,
  closureEvidenceExportCount: 1,
  closureReportExportCount: 1,
  reviewAlertCriticalCount: 1,
  criticalTriageCount: 1,
  openTriageCount: 1,
  unmatchedInboundOpenCount: 1,
  unmatchedInboundStaleOpenCount: 1,
  unmatchedInboundQueuedCount: 1,
  unmatchedInboundReplayBlockedCount: 0,
  unmatchedInboundReviewedCount: 0,
  unmatchedInboundSkippedCount: 0,
  unmatchedInboundLinkedCount: 0,
  latestUnmatchedInboundStatus: "review-needed",
  latestUnmatchedReviewActionStatus: null,
  latestUnmatchedLinkStatus: null,
  lastSandboxEventAt: now,
  externalCalls: 0,
  providers: [
    provider("line", false, false, 0),
    provider("telegram", false, false, 0),
    provider("facebook", false, false, 0),
    provider("instagram", false, false, 0)
  ]
};

export let mockProviderWebhookEvents: ProviderWebhookEvent[] = [
  {
    id: "provider-webhook-event-local-1",
    tenantId: "00000000-0000-4000-8000-000000000001",
    provider: "line",
    channel: "line",
    eventType: "message.created",
    mode: "dry_run",
    status: "received",
    receivedAt: now,
    payloadSummary: "Dry-run object payload accepted with 2 safe fields.",
    payloadFieldCount: 2,
    payloadDigest: "sha256:localdryrunsample",
    signatureVerified: true,
    signatureStatus: "verified",
    signatureAlgorithm: "hmac-sha256",
    signatureFingerprint: "sha256:localsignature",
    signedAt: now,
    replayDetected: false,
    replayStatus: "fresh",
    dedupKeyDigest: "sha256:localdedupsample",
    previousEventSeenAt: null,
    normalized: true,
    normalizationStatus: "normalized",
    normalizedEventType: "message",
    direction: "inbound",
    messageType: "text",
    textPreview: "Local dry-run message",
    textLength: 21,
    mediaSummary: null,
    senderKeyDigest: "sha256:localsenderdigest",
    roomKeyDigest: "sha256:localroomdigest",
    dryRunRouting: true,
    routingStatus: "dry-run-only",
    conversationLookupStatus: "not-found",
    conversationKeyDigest: "sha256:localconversationdigest",
    channelAccountId: "sandbox:line",
    roomIdDigest: "sha256:localroomiddigest",
    inboundPersistenceMode: "dry-run",
    inboundPersistenceStatus: "dry-run-only",
    messagePersisted: false,
    persistedMessageId: null,
    conversationId: null,
    unmatchedInboundQueued: true,
    unmatchedInboundId: "provider-webhook-unmatched-local-1",
    unmatchedStatus: "review-needed",
    unmatchedReason: "safe-review-required-no-conversation-match",
    unmatchedReviewActionStatus: "none",
    unmatchedLinkStatus: "none",
    linkedConversationId: null,
    linkedMessageId: null,
    unmatchedResolvedAt: null,
    inboundAuditStatus: "recorded",
    externalCalls: 0
  }
];

export let mockProviderWebhookUnmatchedInbound: ProviderWebhookUnmatchedInboundItem[] = [
  {
    id: "provider-webhook-unmatched-local-1",
    tenantId: "00000000-0000-4000-8000-000000000001",
    provider: "line",
    channelAccountId: "sandbox:line",
    mode: "sandbox",
    eventType: "message.created",
    normalizedEventType: "message",
    messageType: "text",
    normalizationStatus: "normalized",
    routingStatus: "dry-run-only",
    conversationLookupStatus: "not-found",
    unmatchedStatus: "review-needed",
    unmatchedReason: "safe-review-required-no-conversation-match",
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
    closureChecklist: defaultMockClosureChecklist(),
    checklistCompletedCount: 0,
    checklistTotalCount: mockClosureChecklistSteps.length,
    checklistIncompleteSteps: [...mockClosureChecklistSteps],
    recommendedNextActions: ["OPEN_DIAGNOSTICS", "VIEW_HISTORY", "RUN_CANDIDATE_LOOKUP", "ADD_OPERATOR_NOTE", "ASSIGN_OWNER"],
    lastOperatorNoteAt: null,
    historyAvailable: true,
    diagnosticsAvailable: true,
    candidatesAvailable: true,
    payloadDigest: "sha256:localdryrunsample",
    providerEventDigest: "sha256:localdedupsample",
    deliveryDigest: "sha256:localdedupsample",
    senderKeyDigest: "sha256:localsenderdigest",
    roomKeyDigest: "sha256:localroomdigest",
    textPreview: "Local dry-run message",
    textLength: 21,
    receivedAt: now,
    externalCalls: 0
  }
];

export let mockProviderWebhookReviewSavedViews: ProviderWebhookReviewSavedView[] = [
  {
    id: "provider-webhook-review-view-local-1",
    name: "LINE pending manual review",
    description: "Pinned safe local review view",
    tenantId: "mock-tenant",
    ownerId: "system",
    createdBy: "system",
    filters: {
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      eventType: "message.created",
      triageLane: "safe_link_candidate_available",
      resolutionStatus: "unresolved",
      closureReadiness: "NOT_READY",
      checklistIncomplete: true,
      pageSize: 10
    },
    sort: {
      sortBy: "receivedAt",
      sortDirection: "desc"
    },
    pinned: true,
    isDefault: true,
    archived: false,
    createdAt: now,
    updatedAt: now,
    externalCalls: 0
  }
];

export let mockProviderWebhookOperatorNotes: ProviderWebhookOperatorNote[] = [];

const mockProviderWebhookQaHandoffSignOffs: Array<{
  id: string;
  bundleDigest: string;
  exportDigest: string;
  acknowledgementType: "acknowledge" | "sign_off";
  reviewerRole: string;
  reviewerLabel: string;
  acknowledgedAt: string;
  signedAt: string | null;
}> = [];

const mockProviderWebhookQaHandoffAcceptanceLocks: Array<{
  id: string;
  receiptDigest: string;
  bundleDigest: string;
  exportDigest: string;
  lockedUnmatchedInboundIds: string[];
  lockReason: string | null;
  acceptedByRole: string | null;
  acceptedByLabel: string | null;
  lockedAt: string;
}> = [];

const mockProviderWebhookQaHandoffLockedArchiveExports: Array<{
  id: string;
  lockRecordId: string;
  receiptDigest: string;
  bundleDigest: string;
  exportDigest: string;
  acceptanceLockDigest: string;
  safeDigest: string;
  safeFilename: string;
  exportedAt: string;
}> = [];

const mockProviderWebhookQaHandoffCertifiedReleaseHandoffAcceptanceRecords: Array<{
  id: string;
  handoffPacketDigest: string;
  decisionReceiptDigest: string;
  releaseGateDigest: string;
  safeDigest: string;
  acknowledgedChecklistKeys: string[];
  acknowledgedByRole: string | null;
  acknowledgedByLabel: string | null;
  acknowledgedAt: string;
}> = [];

const mockProviderWebhookQaHandoffCertifiedReleaseNoopExecutionDryRuns: Array<{
  id: string;
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
}> = [];

export const mockProviderWebhookCandidatesByUnmatchedId: Record<string, ProviderWebhookCandidateConversation[]> = {
  "provider-webhook-unmatched-local-1": [
    {
      conversationId: "conversation-local-safe-1",
      platform: "line",
      channelAccountId: "sandbox:line",
      roomIdDigest: "sha256:localroomdigest",
      safeRoomLabel: "line conversation digest match",
      latestMessagePreview: "Local safe candidate preview",
      latestMessageAt: now,
      matchReason: "platform, channel account, and room digest match",
      matchConfidence: 0.98,
      externalCalls: 0
    }
  ]
};

const mockWebhookDedupSeenAt = new Map<string, string>([["sha256:localdedupsample", now]]);

function provider(
  name: ProviderReadiness["providers"][number]["name"],
  configured: boolean,
  webhookConfigured: boolean,
  _allowlistCount: number
): ProviderReadiness["providers"][number] {
  return {
    name,
    configured,
    credentialStatus: configured ? "configured" : "not_configured",
    webhookStatus: webhookConfigured ? "configured" : "not_configured",
    webhookVerificationReady: webhookConfigured,
    webhookVerificationConfigured: webhookConfigured,
    outboundEnabled: false,
    status: "disabled_by_default"
  };
}

function createMockProviderWebhookEvent(payload: ProviderWebhookSandboxEventRequest): ProviderWebhookEvent {
  const providerName = payload.provider;
  const dedupKeyDigest = payload.eventId || payload.deliveryId
    ? `sha256:${safeDigest(["mock", providerName, payload.channel ?? providerName, payload.eventId ?? payload.deliveryId].join(":"))}`
    : null;
  const previousEventSeenAt = dedupKeyDigest ? mockWebhookDedupSeenAt.get(dedupKeyDigest) ?? null : null;
  const receivedAt = new Date().toISOString();
  if (dedupKeyDigest && !previousEventSeenAt) {
    mockWebhookDedupSeenAt.set(dedupKeyDigest, receivedAt);
  }
  const signatureStatus = payload.signature ? "verified" : "missing";
  const normalized = signatureStatus === "verified" && !previousEventSeenAt;
  const routingBlocked = signatureStatus !== "verified" || Boolean(previousEventSeenAt);
  const unmatchedInboundQueued = normalized && !routingBlocked;
  const unmatchedStatus = previousEventSeenAt ? "duplicate-skipped" : signatureStatus !== "verified" ? "blocked" : unmatchedInboundQueued ? "review-needed" : null;
  return {
    id: `provider-webhook-event-local-${safeId()}`,
    tenantId: "00000000-0000-4000-8000-000000000001",
    provider: providerName,
    channel: payload.channel ?? providerName,
    eventType: payload.eventType,
    mode: payload.mode ?? "dry_run",
    status: payload.status ?? "received",
    receivedAt,
    payloadSummary: "Dry-run object payload accepted with 2 safe fields.",
    payloadFieldCount: 2,
    payloadDigest: `sha256:${safeId().slice(0, 16)}`,
    signatureVerified: signatureStatus === "verified",
    signatureStatus,
    signatureAlgorithm: "hmac-sha256",
    signatureFingerprint: payload.signature ? `sha256:${safeDigest(`signature:${payload.signature}`)}` : null,
    signedAt: payload.timestamp ?? null,
    replayDetected: Boolean(previousEventSeenAt),
    replayStatus: previousEventSeenAt ? "duplicate" : "fresh",
    dedupKeyDigest,
    previousEventSeenAt,
    normalized,
    normalizationStatus: signatureStatus !== "verified" ? "skipped" : previousEventSeenAt ? "blocked-replay" : "normalized",
    normalizedEventType: normalized ? "message" : "unknown",
    direction: "inbound",
    messageType: normalized ? "text" : "unknown",
    textPreview: normalized ? "Local dry-run message" : null,
    textLength: normalized ? 21 : null,
    mediaSummary: null,
    senderKeyDigest: normalized ? `sha256:${safeDigest(`sender:${providerName}`)}` : null,
    roomKeyDigest: normalized ? `sha256:${safeDigest(`room:${providerName}`)}` : null,
    dryRunRouting: normalized,
    routingStatus: signatureStatus !== "verified" ? "skipped" : previousEventSeenAt ? "blocked-replay" : "dry-run-only",
    conversationLookupStatus: routingBlocked ? "skipped" : "not-found",
    conversationKeyDigest: normalized ? `sha256:${safeDigest(`conversation:${providerName}`)}` : null,
    channelAccountId: normalized ? `sandbox:${payload.channel ?? providerName}` : null,
    roomIdDigest: normalized ? `sha256:${safeDigest(`room-id:${providerName}`)}` : null,
    inboundPersistenceMode: payload.inboundPersistenceMode ?? "dry-run",
    inboundPersistenceStatus: payload.inboundPersistenceMode === "sandbox-persist"
      ? normalized && !routingBlocked ? "skipped-no-match" : previousEventSeenAt ? "blocked-replay" : signatureStatus === "verified" ? "skipped" : "blocked-signature"
      : "dry-run-only",
    messagePersisted: false,
    persistedMessageId: null,
    conversationId: null,
    unmatchedInboundQueued,
    unmatchedInboundId: unmatchedInboundQueued ? `provider-webhook-unmatched-local-${safeId()}` : previousEventSeenAt ? "provider-webhook-unmatched-local-1" : null,
    unmatchedStatus,
    unmatchedReason: previousEventSeenAt ? "blocked-replay" : signatureStatus !== "verified" ? "blocked-signature" : unmatchedInboundQueued ? "safe-review-required-no-conversation-match" : null,
    unmatchedReviewActionStatus: "none",
    unmatchedLinkStatus: "none",
    linkedConversationId: null,
    linkedMessageId: null,
    unmatchedResolvedAt: null,
    inboundAuditStatus: "recorded",
    externalCalls: 0
  };
}

function safeId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function safeDigest(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash).toString(16).padStart(8, "0").slice(0, 16);
}

function safeMockReason(value: string | undefined) {
  const trimmed = value?.replace(/\s+/g, " ").trim();
  if (!trimmed || /token|secret|authorization|cookie|replyToken|Bearer\s+/i.test(trimmed)) return null;
  return trimmed.length > 120 ? `${trimmed.slice(0, 117)}...` : trimmed;
}

function safeMockText(value: string | null | undefined) {
  const trimmed = value?.replace(/\s+/g, " ").trim();
  if (!trimmed || /token|secret|authorization|cookie|replyToken|Bearer\s+/i.test(trimmed)) return null;
  return trimmed.length > 160 ? `${trimmed.slice(0, 157)}...` : trimmed;
}
