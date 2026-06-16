import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ProviderWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceipt, ProviderWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceipt, ProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacket, ProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceReceipt, ProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedger, ProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt, ProviderWebhookReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollup, ProviderWebhookReviewQaHandoffCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt, ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealOperationalClosureReceipt, ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceipt, ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceipt, ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceipt, ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealReceipt, ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerReceipt, ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt } from "@ai-omni/shared";
import type { ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt, ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceipt } from "@ai-omni/shared";
import {
  findCannedReplyInList,
  getCannedRepliesForMode,
  loadSettingsChannelsData,
  loadSettingsProviderWebhookCandidateData,
  loadSettingsProviderWebhookClosureEvidenceData,
  loadSettingsProviderWebhookDiagnosticsData,
  loadSettingsProviderWebhookHistoryData,
  loadSettingsProviderWebhookReviewAlertsData,
  loadSettingsProviderWebhookReviewClosureExportIntegrityData,
  loadSettingsProviderWebhookReviewClosureReportExportManifestData,
  loadSettingsProviderWebhookReviewClosureReportData,
  loadSettingsProviderWebhookReviewClosureReportRedactionAuditData,
  loadSettingsProviderWebhookReviewQaHandoffBundleData,
  exportSettingsProviderWebhookReviewQaHandoffBundleData,
  loadSettingsProviderWebhookReviewQaHandoffArchiveIntegrityData,
  loadSettingsProviderWebhookReviewQaHandoffArchiveFinalizationData,
  loadSettingsProviderWebhookReviewQaHandoffArchiveFinalizationReceiptData,
  loadSettingsProviderWebhookReviewQaHandoffArchiveReleaseEvidenceData,
  loadSettingsProviderWebhookReviewQaHandoffArchiveReleaseCertificationData,
  loadSettingsProviderWebhookReviewQaHandoffArchiveReleaseAttestationAuditData,
  loadSettingsProviderWebhookReviewQaHandoffArchiveReleaseAttestationReconciliationData,
  loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseGateData,
  loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptData,
  acknowledgeSettingsProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord,
  loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordData,
  loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacketData,
  loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerData,
  loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificateData,
  loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegisterData,
  loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptData,
  loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseControlRoomPacketData,
  loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceiptData,
  loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceiptData,
  loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceiptData,
  loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceiptData,
  loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceiptData,
  loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceiptData,
  loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceiptData,
  loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacketData,
  loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceReceiptData,
  loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedgerData,
  loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceiptData,
  loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollupData,
  loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceiptData,
  loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealOperationalClosureReceiptData,
  loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceiptData,
  loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceiptData,
  loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceiptData,
  loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealReceiptData,
  loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerReceiptData,
  loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityReceiptData,
  loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceiptData,
  loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceiptData,
  loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunData,
  runSettingsProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun,
  loadSettingsProviderWebhookReviewQaHandoffArchiveReleaseClosureLedgerData,
  loadSettingsProviderWebhookReviewQaHandoffArchiveReleaseVerificationData,
  loadSettingsProviderWebhookReviewQaHandoffRetentionAuditData,
  loadSettingsProviderWebhookReviewQaHandoffReceiptData,
  signOffSettingsProviderWebhookReviewQaHandoffArchiveFinalization,
  signOffSettingsProviderWebhookReviewQaHandoffReceipt,
  loadSettingsProviderWebhookReviewMetricsData,
  loadSettingsProviderWebhookReviewResolutionSummaryData,
  loadSettingsProviderWebhookReviewTriageData,
  loadSettingsProviderWebhookReviewWorkloadData,
  loadSettingsProviderWebhookSavedViewsData,
  loadSettingsProviderWebhookOperatorNotesData,
  loadSettingsProviderReadinessData,
  loadSettingsProviderWebhookEventsData,
  loadSettingsProviderWebhookUnmatchedInboundData,
  exportSettingsProviderWebhookClosureEvidenceData,
  loadSettingsProviderWebhookClosureEvidenceExportManifestData,
  exportSettingsProviderWebhookReviewClosureReportData,
  loadSettingsProviderWebhookClosureEvidenceRedactionAuditData,
  exportSettingsProviderWebhookUnmatchedInboundData,
  linkSettingsProviderWebhookUnmatchedInboundConversation,
  bulkReviewSettingsProviderWebhookUnmatchedInbound,
  assignSettingsProviderWebhookUnmatchedInbound,
  bulkAssignSettingsProviderWebhookUnmatchedInbound,
  bulkEscalateSettingsProviderWebhookUnmatchedInbound,
  bulkResolveSettingsProviderWebhookUnmatchedInbound,
  escalateSettingsProviderWebhookUnmatchedInbound,
  archiveSettingsProviderWebhookSavedView,
  createSettingsProviderWebhookOperatorNote,
  createSettingsProviderWebhookSavedView,
  createSettingsProviderWebhookSandboxEvent,
  loadSettingsTeamData,
  mapSettingsCannedReplyToCannedReply,
  reviewSettingsProviderWebhookUnmatchedInbound,
  resolveSettingsProviderWebhookUnmatchedInbound,
  mockProviderReadiness,
  mockProviderWebhookEvents,
  mockProviderWebhookUnmatchedInbound,
  mockProviderWebhookOperatorNotes,
  resolveCannedReplyComposerDraft,
  mockSettingsChannels,
  updateSettingsProviderWebhookUnmatchedInboundChecklist,
  searchCannedReplyList
} from "./settings-data";

const api = vi.hoisted(() => ({
  getSettingsChannels: vi.fn(),
  getSettingsCannedReplies: vi.fn(),
  getSettingsSlaPolicies: vi.fn(),
  getSettingsTeam: vi.fn(),
  getProviderReadiness: vi.fn(),
  getProviderWebhookEvents: vi.fn(),
  getProviderWebhookReviewAlerts: vi.fn(),
  getProviderWebhookReviewClosureExportIntegrity: vi.fn(),
  getProviderWebhookReviewClosureReportExportManifest: vi.fn(),
  getProviderWebhookReviewQaHandoffBundle: vi.fn(),
  getProviderWebhookReviewQaHandoffBundleExport: vi.fn(),
  getProviderWebhookReviewQaHandoffBundleReceipt: vi.fn(),
  getProviderWebhookReviewQaHandoffAcceptanceLock: vi.fn(),
  lockProviderWebhookReviewQaHandoffAcceptance: vi.fn(),
  getProviderWebhookReviewQaHandoffLockedArchive: vi.fn(),
  exportProviderWebhookReviewQaHandoffLockedArchive: vi.fn(),
  getProviderWebhookReviewQaHandoffRetentionManifest: vi.fn(),
  getProviderWebhookReviewQaHandoffArchiveIntegrity: vi.fn(),
  getProviderWebhookReviewQaHandoffRetentionAudit: vi.fn(),
  getProviderWebhookReviewQaHandoffArchiveFinalization: vi.fn(),
  signOffProviderWebhookReviewQaHandoffArchiveFinalization: vi.fn(),
  getProviderWebhookReviewQaHandoffArchiveFinalizationReceipt: vi.fn(),
  getProviderWebhookReviewQaHandoffArchiveReleaseEvidence: vi.fn(),
  getProviderWebhookReviewQaHandoffArchiveReleaseCertification: vi.fn(),
  getProviderWebhookReviewQaHandoffArchiveReleaseAttestationAudit: vi.fn(),
  getProviderWebhookReviewQaHandoffArchiveReleaseAttestationReconciliation: vi.fn(),
  getProviderWebhookReviewQaHandoffCertifiedReleaseGate: vi.fn(),
  getProviderWebhookReviewQaHandoffCertifiedReleaseDecisionReceipt: vi.fn(),
  acknowledgeProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord: vi.fn(),
  getProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord: vi.fn(),
  getProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket: vi.fn(),
  getProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedger: vi.fn(),
  getProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificate: vi.fn(),
  getProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister: vi.fn(),
  getProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt: vi.fn(),
  getProviderWebhookReviewQaHandoffCertifiedReleaseControlRoomPacket: vi.fn(),
  getProviderWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceipt: vi.fn(),
  getProviderWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceipt: vi.fn(),
  getProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceipt: vi.fn(),
  getProviderWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceipt: vi.fn(),
  getProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceipt: vi.fn(),
  getProviderWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceipt: vi.fn(),
  getProviderWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceipt: vi.fn(),
  getProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacket: vi.fn(),
  getProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceReceipt: vi.fn(),
  getProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedger: vi.fn(),
  getProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt: vi.fn(),
  getProviderWebhookReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollup: vi.fn(),
  getProviderWebhookReviewQaHandoffCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt: vi.fn(),
  getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealOperationalClosureReceipt: vi.fn(),
  getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceipt: vi.fn(),
  getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceipt: vi.fn(),
  getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceipt: vi.fn(),
  getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealReceipt: vi.fn(),
  getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerReceipt: vi.fn(),
  getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt: vi.fn(),
  getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt: vi.fn(),
  getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceipt: vi.fn(),
  getProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun: vi.fn(),
  runProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun: vi.fn(),
  getProviderWebhookReviewQaHandoffArchiveReleaseClosureLedger: vi.fn(),
  getProviderWebhookReviewQaHandoffArchiveReleaseVerification: vi.fn(),
  signOffProviderWebhookReviewQaHandoffBundleReceipt: vi.fn(),
  getProviderWebhookReviewClosureReportExport: vi.fn(),
  getProviderWebhookReviewClosureReportRedactionAudit: vi.fn(),
  getProviderWebhookReviewClosureReport: vi.fn(),
  getProviderWebhookReviewMetrics: vi.fn(),
  getProviderWebhookReviewResolutionSummary: vi.fn(),
  getProviderWebhookReviewTriage: vi.fn(),
  getProviderWebhookReviewWorkload: vi.fn(),
  getProviderWebhookReviewSavedViews: vi.fn(),
  createProviderWebhookReviewSavedView: vi.fn(),
  updateProviderWebhookReviewSavedView: vi.fn(),
  archiveProviderWebhookReviewSavedView: vi.fn(),
  getProviderWebhookOperatorNotes: vi.fn(),
  createProviderWebhookOperatorNote: vi.fn(),
  getProviderWebhookUnmatchedInbound: vi.fn(),
  getProviderWebhookUnmatchedInboundCandidates: vi.fn(),
  getProviderWebhookUnmatchedInboundClosureEvidenceExport: vi.fn(),
  getProviderWebhookUnmatchedInboundClosureEvidenceExportManifest: vi.fn(),
  getProviderWebhookUnmatchedInboundClosureEvidenceRedactionAudit: vi.fn(),
  getProviderWebhookUnmatchedInboundClosureEvidence: vi.fn(),
  getProviderWebhookUnmatchedInboundDiagnostics: vi.fn(),
  getProviderWebhookUnmatchedInboundHistory: vi.fn(),
  getProviderWebhookUnmatchedInboundExport: vi.fn(),
  createProviderWebhookSandboxEvent: vi.fn(),
  reviewProviderWebhookUnmatchedInbound: vi.fn(),
  assignProviderWebhookUnmatchedInbound: vi.fn(),
  escalateProviderWebhookUnmatchedInbound: vi.fn(),
  resolveProviderWebhookUnmatchedInbound: vi.fn(),
  updateProviderWebhookUnmatchedInboundChecklist: vi.fn(),
  bulkReviewProviderWebhookUnmatchedInbound: vi.fn(),
  bulkAssignProviderWebhookUnmatchedInbound: vi.fn(),
  bulkEscalateProviderWebhookUnmatchedInbound: vi.fn(),
  bulkResolveProviderWebhookUnmatchedInbound: vi.fn(),
  linkProviderWebhookUnmatchedInboundConversation: vi.fn()
}));

vi.mock("./api-client", () => ({
  getSettingsChannels: api.getSettingsChannels,
  getSettingsCannedReplies: api.getSettingsCannedReplies,
  getSettingsSlaPolicies: api.getSettingsSlaPolicies,
  getSettingsTeam: api.getSettingsTeam,
  getProviderReadiness: api.getProviderReadiness,
  getProviderWebhookEvents: api.getProviderWebhookEvents,
  getProviderWebhookReviewAlerts: api.getProviderWebhookReviewAlerts,
  getProviderWebhookReviewClosureExportIntegrity: api.getProviderWebhookReviewClosureExportIntegrity,
  getProviderWebhookReviewClosureReportExportManifest: api.getProviderWebhookReviewClosureReportExportManifest,
  getProviderWebhookReviewQaHandoffBundle: api.getProviderWebhookReviewQaHandoffBundle,
  getProviderWebhookReviewQaHandoffBundleExport: api.getProviderWebhookReviewQaHandoffBundleExport,
  getProviderWebhookReviewQaHandoffBundleReceipt: api.getProviderWebhookReviewQaHandoffBundleReceipt,
  getProviderWebhookReviewQaHandoffAcceptanceLock: api.getProviderWebhookReviewQaHandoffAcceptanceLock,
  lockProviderWebhookReviewQaHandoffAcceptance: api.lockProviderWebhookReviewQaHandoffAcceptance,
  getProviderWebhookReviewQaHandoffLockedArchive: api.getProviderWebhookReviewQaHandoffLockedArchive,
  exportProviderWebhookReviewQaHandoffLockedArchive: api.exportProviderWebhookReviewQaHandoffLockedArchive,
  getProviderWebhookReviewQaHandoffRetentionManifest: api.getProviderWebhookReviewQaHandoffRetentionManifest,
  getProviderWebhookReviewQaHandoffArchiveIntegrity: api.getProviderWebhookReviewQaHandoffArchiveIntegrity,
  getProviderWebhookReviewQaHandoffRetentionAudit: api.getProviderWebhookReviewQaHandoffRetentionAudit,
  getProviderWebhookReviewQaHandoffArchiveFinalization: api.getProviderWebhookReviewQaHandoffArchiveFinalization,
  signOffProviderWebhookReviewQaHandoffArchiveFinalization: api.signOffProviderWebhookReviewQaHandoffArchiveFinalization,
  getProviderWebhookReviewQaHandoffArchiveFinalizationReceipt: api.getProviderWebhookReviewQaHandoffArchiveFinalizationReceipt,
  getProviderWebhookReviewQaHandoffArchiveReleaseEvidence: api.getProviderWebhookReviewQaHandoffArchiveReleaseEvidence,
  getProviderWebhookReviewQaHandoffArchiveReleaseCertification: api.getProviderWebhookReviewQaHandoffArchiveReleaseCertification,
  getProviderWebhookReviewQaHandoffArchiveReleaseAttestationAudit: api.getProviderWebhookReviewQaHandoffArchiveReleaseAttestationAudit,
  getProviderWebhookReviewQaHandoffArchiveReleaseAttestationReconciliation: api.getProviderWebhookReviewQaHandoffArchiveReleaseAttestationReconciliation,
  getProviderWebhookReviewQaHandoffCertifiedReleaseGate: api.getProviderWebhookReviewQaHandoffCertifiedReleaseGate,
  getProviderWebhookReviewQaHandoffCertifiedReleaseDecisionReceipt: api.getProviderWebhookReviewQaHandoffCertifiedReleaseDecisionReceipt,
  acknowledgeProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord: api.acknowledgeProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord,
  getProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord: api.getProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord,
  getProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket: api.getProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket,
  getProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedger: api.getProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedger,
  getProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificate: api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificate,
  getProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister: api.getProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister,
  getProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt: api.getProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt,
  getProviderWebhookReviewQaHandoffCertifiedReleaseControlRoomPacket: api.getProviderWebhookReviewQaHandoffCertifiedReleaseControlRoomPacket,
  getProviderWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceipt: api.getProviderWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceipt,
  getProviderWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceipt: api.getProviderWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceipt,
  getProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceipt: api.getProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceipt,
  getProviderWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceipt: api.getProviderWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceipt,
  getProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceipt: api.getProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceipt,
  getProviderWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceipt: api.getProviderWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceipt,
  getProviderWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceipt: api.getProviderWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceipt,
  getProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacket: api.getProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacket,
  getProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceReceipt: api.getProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceReceipt,
  getProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedger: api.getProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedger,
  getProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt: api.getProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt,
  getProviderWebhookReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollup: api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollup,
  getProviderWebhookReviewQaHandoffCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt: api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt,
  getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealOperationalClosureReceipt: api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealOperationalClosureReceipt,
  getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceipt: api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceipt,
  getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceipt: api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceipt,
  getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceipt: api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceipt,
  getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealReceipt: api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealReceipt,
  getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerReceipt: api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerReceipt,
  getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt: api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt,
  getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt: api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt,
  getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceipt: api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceipt,
  getProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun: api.getProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun,
  runProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun: api.runProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun,
  getProviderWebhookReviewQaHandoffArchiveReleaseClosureLedger: api.getProviderWebhookReviewQaHandoffArchiveReleaseClosureLedger,
  getProviderWebhookReviewQaHandoffArchiveReleaseVerification: api.getProviderWebhookReviewQaHandoffArchiveReleaseVerification,
  signOffProviderWebhookReviewQaHandoffBundleReceipt: api.signOffProviderWebhookReviewQaHandoffBundleReceipt,
  getProviderWebhookReviewClosureReportExport: api.getProviderWebhookReviewClosureReportExport,
  getProviderWebhookReviewClosureReportRedactionAudit: api.getProviderWebhookReviewClosureReportRedactionAudit,
  getProviderWebhookReviewClosureReport: api.getProviderWebhookReviewClosureReport,
  getProviderWebhookReviewMetrics: api.getProviderWebhookReviewMetrics,
  getProviderWebhookReviewResolutionSummary: api.getProviderWebhookReviewResolutionSummary,
  getProviderWebhookReviewTriage: api.getProviderWebhookReviewTriage,
  getProviderWebhookReviewWorkload: api.getProviderWebhookReviewWorkload,
  getProviderWebhookReviewSavedViews: api.getProviderWebhookReviewSavedViews,
  createProviderWebhookReviewSavedView: api.createProviderWebhookReviewSavedView,
  updateProviderWebhookReviewSavedView: api.updateProviderWebhookReviewSavedView,
  archiveProviderWebhookReviewSavedView: api.archiveProviderWebhookReviewSavedView,
  getProviderWebhookOperatorNotes: api.getProviderWebhookOperatorNotes,
  createProviderWebhookOperatorNote: api.createProviderWebhookOperatorNote,
  getProviderWebhookUnmatchedInbound: api.getProviderWebhookUnmatchedInbound,
  getProviderWebhookUnmatchedInboundCandidates: api.getProviderWebhookUnmatchedInboundCandidates,
  getProviderWebhookUnmatchedInboundClosureEvidenceExport: api.getProviderWebhookUnmatchedInboundClosureEvidenceExport,
  getProviderWebhookUnmatchedInboundClosureEvidenceExportManifest: api.getProviderWebhookUnmatchedInboundClosureEvidenceExportManifest,
  getProviderWebhookUnmatchedInboundClosureEvidenceRedactionAudit: api.getProviderWebhookUnmatchedInboundClosureEvidenceRedactionAudit,
  getProviderWebhookUnmatchedInboundClosureEvidence: api.getProviderWebhookUnmatchedInboundClosureEvidence,
  getProviderWebhookUnmatchedInboundDiagnostics: api.getProviderWebhookUnmatchedInboundDiagnostics,
  getProviderWebhookUnmatchedInboundHistory: api.getProviderWebhookUnmatchedInboundHistory,
  getProviderWebhookUnmatchedInboundExport: api.getProviderWebhookUnmatchedInboundExport,
  createProviderWebhookSandboxEvent: api.createProviderWebhookSandboxEvent,
  reviewProviderWebhookUnmatchedInbound: api.reviewProviderWebhookUnmatchedInbound,
  assignProviderWebhookUnmatchedInbound: api.assignProviderWebhookUnmatchedInbound,
  escalateProviderWebhookUnmatchedInbound: api.escalateProviderWebhookUnmatchedInbound,
  resolveProviderWebhookUnmatchedInbound: api.resolveProviderWebhookUnmatchedInbound,
  updateProviderWebhookUnmatchedInboundChecklist: api.updateProviderWebhookUnmatchedInboundChecklist,
  bulkReviewProviderWebhookUnmatchedInbound: api.bulkReviewProviderWebhookUnmatchedInbound,
  bulkAssignProviderWebhookUnmatchedInbound: api.bulkAssignProviderWebhookUnmatchedInbound,
  bulkEscalateProviderWebhookUnmatchedInbound: api.bulkEscalateProviderWebhookUnmatchedInbound,
  bulkResolveProviderWebhookUnmatchedInbound: api.bulkResolveProviderWebhookUnmatchedInbound,
  linkProviderWebhookUnmatchedInboundConversation: api.linkProviderWebhookUnmatchedInboundConversation
}));

beforeEach(() => {
  api.getSettingsChannels.mockReset();
  api.getSettingsCannedReplies.mockReset();
  api.getSettingsSlaPolicies.mockReset();
  api.getSettingsTeam.mockReset();
  api.getProviderReadiness.mockReset();
  api.getProviderWebhookEvents.mockReset();
  api.getProviderWebhookReviewAlerts.mockReset();
  api.getProviderWebhookReviewClosureExportIntegrity.mockReset();
  api.getProviderWebhookReviewClosureReportExportManifest.mockReset();
  api.getProviderWebhookReviewQaHandoffBundle.mockReset();
  api.getProviderWebhookReviewQaHandoffBundleExport.mockReset();
  api.getProviderWebhookReviewQaHandoffBundleReceipt.mockReset();
  api.getProviderWebhookReviewQaHandoffAcceptanceLock.mockReset();
  api.lockProviderWebhookReviewQaHandoffAcceptance.mockReset();
  api.getProviderWebhookReviewQaHandoffLockedArchive.mockReset();
  api.exportProviderWebhookReviewQaHandoffLockedArchive.mockReset();
  api.getProviderWebhookReviewQaHandoffRetentionManifest.mockReset();
  api.getProviderWebhookReviewQaHandoffArchiveIntegrity.mockReset();
  api.getProviderWebhookReviewQaHandoffRetentionAudit.mockReset();
  api.getProviderWebhookReviewQaHandoffArchiveFinalization.mockReset();
  api.signOffProviderWebhookReviewQaHandoffArchiveFinalization.mockReset();
  api.getProviderWebhookReviewQaHandoffArchiveFinalizationReceipt.mockReset();
  api.getProviderWebhookReviewQaHandoffArchiveReleaseEvidence.mockReset();
  api.getProviderWebhookReviewQaHandoffArchiveReleaseCertification.mockReset();
  api.getProviderWebhookReviewQaHandoffArchiveReleaseAttestationAudit.mockReset();
  api.getProviderWebhookReviewQaHandoffArchiveReleaseAttestationReconciliation.mockReset();
  api.getProviderWebhookReviewQaHandoffCertifiedReleaseGate.mockReset();
  api.getProviderWebhookReviewQaHandoffCertifiedReleaseDecisionReceipt.mockReset();
  api.getProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket.mockReset();
  api.getProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord.mockReset();
  api.acknowledgeProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord.mockReset();
  api.getProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedger.mockReset();
  api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificate.mockReset();
  api.getProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister.mockReset();
  api.getProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt.mockReset();
  api.getProviderWebhookReviewQaHandoffCertifiedReleaseControlRoomPacket.mockReset();
  api.getProviderWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceipt.mockReset();
  api.getProviderWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceipt.mockReset();
  api.getProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceipt.mockReset();
  api.getProviderWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceipt.mockReset();
  api.getProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceipt.mockReset();
  api.getProviderWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceipt.mockReset();
  api.getProviderWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceipt.mockReset();
  api.getProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacket.mockReset();
  api.getProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceReceipt.mockReset();
  api.getProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedger.mockReset();
  api.getProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.mockReset();
  api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollup.mockReset();
  api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt.mockReset();
  api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealOperationalClosureReceipt.mockReset();
  api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceipt.mockReset();
  api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceipt.mockReset();
  api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceipt.mockReset();
  api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealReceipt.mockReset();
  api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerReceipt.mockReset();
  api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.mockReset();
  api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt.mockReset();
  api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceipt.mockReset();
  api.getProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun.mockReset();
  api.runProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun.mockReset();
  api.getProviderWebhookReviewQaHandoffArchiveReleaseClosureLedger.mockReset();
  api.getProviderWebhookReviewQaHandoffArchiveReleaseVerification.mockReset();
  api.signOffProviderWebhookReviewQaHandoffBundleReceipt.mockReset();
  api.getProviderWebhookReviewClosureReportExport.mockReset();
  api.getProviderWebhookReviewClosureReportRedactionAudit.mockReset();
  api.getProviderWebhookReviewClosureReport.mockReset();
  api.getProviderWebhookReviewMetrics.mockReset();
  api.getProviderWebhookReviewResolutionSummary.mockReset();
  api.getProviderWebhookReviewTriage.mockReset();
  api.getProviderWebhookReviewWorkload.mockReset();
  api.getProviderWebhookReviewSavedViews.mockReset();
  api.createProviderWebhookReviewSavedView.mockReset();
  api.updateProviderWebhookReviewSavedView.mockReset();
  api.archiveProviderWebhookReviewSavedView.mockReset();
  api.getProviderWebhookOperatorNotes.mockReset();
  api.createProviderWebhookOperatorNote.mockReset();
  api.getProviderWebhookUnmatchedInbound.mockReset();
  api.getProviderWebhookUnmatchedInboundCandidates.mockReset();
  api.getProviderWebhookUnmatchedInboundClosureEvidenceExport.mockReset();
  api.getProviderWebhookUnmatchedInboundClosureEvidenceExportManifest.mockReset();
  api.getProviderWebhookUnmatchedInboundClosureEvidenceRedactionAudit.mockReset();
  api.getProviderWebhookUnmatchedInboundClosureEvidence.mockReset();
  api.getProviderWebhookUnmatchedInboundDiagnostics.mockReset();
  api.getProviderWebhookUnmatchedInboundHistory.mockReset();
  api.getProviderWebhookUnmatchedInboundExport.mockReset();
  api.createProviderWebhookSandboxEvent.mockReset();
  api.reviewProviderWebhookUnmatchedInbound.mockReset();
  api.assignProviderWebhookUnmatchedInbound.mockReset();
  api.escalateProviderWebhookUnmatchedInbound.mockReset();
  api.resolveProviderWebhookUnmatchedInbound.mockReset();
  api.updateProviderWebhookUnmatchedInboundChecklist.mockReset();
  api.bulkReviewProviderWebhookUnmatchedInbound.mockReset();
  api.bulkAssignProviderWebhookUnmatchedInbound.mockReset();
  api.bulkEscalateProviderWebhookUnmatchedInbound.mockReset();
  api.bulkResolveProviderWebhookUnmatchedInbound.mockReset();
  api.linkProviderWebhookUnmatchedInboundConversation.mockReset();
  mockProviderWebhookOperatorNotes.splice(0);
});

describe("settings API-mode data loaders", () => {
  it("maps persisted channel accounts in API mode without exposing raw secrets", async () => {
    api.getSettingsChannels.mockResolvedValueOnce([settingsChannelResponse("channel-line", "line")]);

    const data = await loadSettingsChannelsData("api");

    expect(api.getSettingsChannels).toHaveBeenCalled();
    expect(data.mode).toBe("api");
    expect(data.channels[0]).toMatchObject({
      id: "channel-line",
      platform: "line",
      accountName: "Persisted LINE",
      hasAccessToken: true,
      tokenMasked: "configured:redacted",
      secretConfigured: true
    });
    expect(JSON.stringify(data.channels)).not.toContain("raw-line-token");
    expect(JSON.stringify(data.channels)).not.toContain("webhookSecret");
  });

  it("maps persisted agents in API mode", async () => {
    api.getSettingsTeam.mockResolvedValueOnce([settingsTeamResponse("agent-api")]);
    api.getSettingsSlaPolicies.mockResolvedValueOnce([settingsSlaPolicyResponse("sla-api")]);
    api.getSettingsCannedReplies.mockResolvedValueOnce([settingsCannedReplyResponse("reply-api")]);

    const data = await loadSettingsTeamData("api");

    expect(api.getSettingsTeam).toHaveBeenCalled();
    expect(api.getSettingsSlaPolicies).toHaveBeenCalled();
    expect(api.getSettingsCannedReplies).toHaveBeenCalled();
    expect(data.mode).toBe("api");
    expect(data.members[0]).toMatchObject({
      id: "agent-api",
      displayName: "API Agent",
      role: "agent",
      maxConcurrentChats: 6
    });
    expect(data.slaPolicies[0]).toMatchObject({
      id: "sla-api",
      priorityScope: "urgent",
      resolutionMinutes: 120
    });
    expect(data.cannedReplies[0]).toMatchObject({
      id: "reply-api",
      shortcut: "/hello",
      bodyTemplate: "Persisted hello"
    });
  });

  it("does not fallback to mock SLA policies or canned replies when API mode fails", async () => {
    api.getSettingsTeam.mockResolvedValueOnce([settingsTeamResponse("agent-api")]);
    api.getSettingsSlaPolicies.mockRejectedValueOnce(new Error("API request failed (503): sla unavailable"));
    api.getSettingsCannedReplies.mockResolvedValueOnce([settingsCannedReplyResponse("reply-api")]);

    await expect(loadSettingsTeamData("api")).rejects.toThrow("sla unavailable");

    api.getSettingsTeam.mockResolvedValueOnce([settingsTeamResponse("agent-api")]);
    api.getSettingsSlaPolicies.mockResolvedValueOnce([settingsSlaPolicyResponse("sla-api")]);
    api.getSettingsCannedReplies.mockRejectedValueOnce(new Error("API request failed (503): replies unavailable"));

    await expect(loadSettingsTeamData("api")).rejects.toThrow("replies unavailable");
  });

  it("does not fallback to mock channels when API mode fails", async () => {
    api.getSettingsChannels.mockRejectedValueOnce(new Error("API request failed (503): settings unavailable"));

    await expect(loadSettingsChannelsData("api")).rejects.toThrow("settings unavailable");
  });

  it("loads provider readiness from API mode without exposing raw values", async () => {
    api.getProviderReadiness.mockResolvedValueOnce(providerReadinessResponse());

    const data = await loadSettingsProviderReadinessData("api");

    expect(api.getProviderReadiness).toHaveBeenCalled();
    expect(data.mode).toBe("api");
    expect(data.providerReadiness.realOutboundEnabled).toBe(false);
    expect(data.providerReadiness.externalCalls).toBe(0);
    expect(data.providerReadiness.allowlistCount).toBe(2);
    expect(data.providerReadiness.providers[0]).toMatchObject({
      name: "line",
      credentialStatus: "configured",
      webhookVerificationConfigured: true
    });
    expect(data.providerReadiness.providers.every((provider) => !("allowlistCount" in provider))).toBe(true);
    expect(JSON.stringify(data.providerReadiness)).not.toContain("U-raw-provider-test");
    expect(JSON.stringify(data.providerReadiness)).not.toMatch(/token|secret|providerRaw|rawPayload|payloadJson/i);
  });

  it("does not fallback to mock provider readiness when API mode fails", async () => {
    api.getProviderReadiness.mockRejectedValueOnce(new Error("API request failed (503): readiness unavailable"));

    await expect(loadSettingsProviderReadinessData("api")).rejects.toThrow("readiness unavailable");
  });

  it("loads provider webhook events from API mode without exposing raw payload values", async () => {
    api.getProviderWebhookEvents.mockResolvedValueOnce([providerWebhookEventResponse("provider-webhook-event-api")]);

    const data = await loadSettingsProviderWebhookEventsData("api");

    expect(api.getProviderWebhookEvents).toHaveBeenCalled();
    expect(data.mode).toBe("api");
    expect(data.events[0]).toMatchObject({
      id: "provider-webhook-event-api",
      provider: "line",
      channel: "line",
      eventType: "message.created",
      externalCalls: 0
    });
    expect(JSON.stringify(data.events)).not.toContain("raw-line-token");
    expect(JSON.stringify(data.events)).not.toMatch(/token|secret|authorization|cookie|providerRaw|rawPayload|payloadJson/i);
  });

  it("loads unmatched inbound review items from API mode without exposing raw values", async () => {
    api.getProviderWebhookUnmatchedInbound.mockResolvedValueOnce(providerWebhookUnmatchedInboundPageResponse([providerWebhookUnmatchedInboundResponse("provider-webhook-unmatched-api")]));

    const data = await loadSettingsProviderWebhookUnmatchedInboundData("api");

    expect(api.getProviderWebhookUnmatchedInbound).toHaveBeenCalled();
    expect(data.mode).toBe("api");
    expect(data.items[0]).toMatchObject({
      id: "provider-webhook-unmatched-api",
      provider: "line",
      channelAccountId: "sandbox:line",
      conversationLookupStatus: "not-found",
      unmatchedStatus: "review-needed",
      externalCalls: 0
    });
    expect(JSON.stringify(data.items)).not.toContain("raw-line-token");
    expect(JSON.stringify(data.items)).not.toMatch(/token|secret|authorization|cookie|providerRaw|rawPayload|payloadJson|replyToken/i);
  });

  it("loads unmatched inbound filters and safe candidates from API mode", async () => {
    api.getProviderWebhookUnmatchedInbound.mockResolvedValueOnce(providerWebhookUnmatchedInboundPageResponse([providerWebhookUnmatchedInboundResponse("provider-webhook-unmatched-api")]));
    api.getProviderWebhookUnmatchedInboundCandidates.mockResolvedValueOnce([providerWebhookCandidateResponse("conversation-safe-internal")]);

    const unmatched = await loadSettingsProviderWebhookUnmatchedInboundData("api", {
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none"
    });
    const candidates = await loadSettingsProviderWebhookCandidateData("api", "provider-webhook-unmatched-api");

    expect(api.getProviderWebhookUnmatchedInbound).toHaveBeenCalledWith(expect.objectContaining({
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none"
    }));
    expect(api.getProviderWebhookUnmatchedInboundCandidates).toHaveBeenCalledWith("provider-webhook-unmatched-api");
    expect(unmatched.items[0]?.id).toBe("provider-webhook-unmatched-api");
    expect(candidates.candidates[0]).toMatchObject({
      conversationId: "conversation-safe-internal",
      roomIdDigest: "sha256:saferoomdigest",
      externalCalls: 0
    });
    expect(JSON.stringify(candidates)).not.toMatch(/token|secret|authorization|cookie|providerRaw|rawPayload|payloadJson|replyToken|raw-room|raw-sender/i);
  });

  it("loads unmatched history and export from API mode without exposing raw values", async () => {
    api.getProviderWebhookUnmatchedInboundHistory.mockResolvedValueOnce(providerWebhookHistoryResponse("provider-webhook-unmatched-api"));
    api.getProviderWebhookUnmatchedInboundExport.mockResolvedValueOnce(providerWebhookExportResponse([providerWebhookUnmatchedInboundResponse("provider-webhook-unmatched-api")], "csv"));

    const history = await loadSettingsProviderWebhookHistoryData("api", "provider-webhook-unmatched-api");
    const exported = await exportSettingsProviderWebhookUnmatchedInboundData("api", {
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      format: "csv",
      limit: 25,
      offset: 10,
      sortBy: "receivedAt",
      sortOrder: "asc"
    });

    expect(api.getProviderWebhookUnmatchedInboundHistory).toHaveBeenCalledWith("provider-webhook-unmatched-api");
    expect(api.getProviderWebhookUnmatchedInboundExport).toHaveBeenCalledWith(expect.objectContaining({
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      format: "csv",
      limit: 25,
      offset: 10
    }));
    expect(history.mode).toBe("api");
    expect(history.history.entries.map((entry) => entry.action)).toEqual(expect.arrayContaining(["inbound_received", "unmatched_queued"]));
    expect(exported.mode).toBe("api");
    expect(exported.exportResult).toMatchObject({
      format: "csv",
      exportedCount: 1,
      exportMaxLimit: 500,
      externalCalls: 0
    });
    expect(JSON.stringify({ history, exported })).not.toMatch(/token|secret|authorization|cookie|providerRaw|rawPayload|payloadJson|replyToken|raw-room|raw-sender|raw room|raw sender/i);
  });

  it("loads review metrics, alerts, and diagnostics from API mode without exposing raw values", async () => {
    api.getProviderWebhookReviewMetrics.mockResolvedValueOnce(providerWebhookReviewMetricsResponse());
    api.getProviderWebhookReviewAlerts.mockResolvedValueOnce(providerWebhookReviewAlertsResponse());
    api.getProviderWebhookReviewTriage.mockResolvedValueOnce(providerWebhookReviewTriageResponse());
    api.getProviderWebhookReviewWorkload.mockResolvedValueOnce(providerWebhookReviewWorkloadResponse());
    api.getProviderWebhookReviewResolutionSummary.mockResolvedValueOnce(providerWebhookReviewResolutionSummaryResponse());
    api.getProviderWebhookReviewClosureReport.mockResolvedValueOnce(providerWebhookReviewClosureReportResponse());
    api.getProviderWebhookReviewClosureReportExport.mockResolvedValueOnce(providerWebhookReviewClosureReportExportResponse());
    api.getProviderWebhookReviewClosureReportExportManifest.mockResolvedValueOnce(providerWebhookReviewExportManifestResponse("closure-report-export"));
    api.getProviderWebhookReviewQaHandoffBundle.mockResolvedValueOnce(providerWebhookReviewQaHandoffBundleResponse());
    api.getProviderWebhookReviewQaHandoffBundleExport.mockResolvedValueOnce(providerWebhookReviewQaHandoffBundleExportResponse());
    api.getProviderWebhookReviewQaHandoffBundleReceipt.mockResolvedValueOnce(providerWebhookReviewQaHandoffReceiptResponse());
    api.signOffProviderWebhookReviewQaHandoffBundleReceipt.mockResolvedValueOnce(providerWebhookReviewQaHandoffSignOffResponse());
    api.getProviderWebhookReviewClosureReportRedactionAudit.mockResolvedValueOnce(providerWebhookReviewExportRedactionAuditResponse("closure-report-export"));
    api.getProviderWebhookReviewClosureExportIntegrity.mockResolvedValueOnce(providerWebhookReviewExportIntegrityResponse());
    api.getProviderWebhookUnmatchedInboundDiagnostics.mockResolvedValueOnce(providerWebhookDiagnosticsResponse("provider-webhook-unmatched-api"));
    api.getProviderWebhookUnmatchedInboundClosureEvidence.mockResolvedValueOnce(providerWebhookClosureEvidenceResponse("provider-webhook-unmatched-api"));
    api.getProviderWebhookUnmatchedInboundClosureEvidenceExport.mockResolvedValueOnce(providerWebhookClosureEvidenceExportResponse("provider-webhook-unmatched-api"));
    api.getProviderWebhookUnmatchedInboundClosureEvidenceExportManifest.mockResolvedValueOnce(providerWebhookReviewExportManifestResponse("closure-evidence-export", "provider-webhook-unmatched-api"));
    api.getProviderWebhookUnmatchedInboundClosureEvidenceRedactionAudit.mockResolvedValueOnce(providerWebhookReviewExportRedactionAuditResponse("closure-evidence-export", "provider-webhook-unmatched-api"));

    const metrics = await loadSettingsProviderWebhookReviewMetricsData("api", {
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      eventType: "message.created"
    });
    const alerts = await loadSettingsProviderWebhookReviewAlertsData("api", {
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      eventType: "message.created",
      severity: "critical"
    });
    const triage = await loadSettingsProviderWebhookReviewTriageData("api", {
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      eventType: "message.created",
      severity: "critical",
      triageLane: "critical_stale_open"
    });
    const workload = await loadSettingsProviderWebhookReviewWorkloadData("api", {
      provider: "line",
      assignmentStatus: "assigned_to_me",
      escalationStatus: "escalated",
      escalationReason: "SLA_RISK"
    });
    const resolutionSummary = await loadSettingsProviderWebhookReviewResolutionSummaryData("api", {
      provider: "line",
      resolutionStatus: "unresolved",
      resolutionOutcome: "NEEDS_REVIEW",
      closureReadiness: "NOT_READY",
      checklistIncomplete: true
    });
    const closureFilters = {
      provider: "line",
      resolutionStatus: "resolved",
      resolutionOutcome: "NEEDS_REVIEW",
      closureReadiness: "READY_FOR_REVIEW",
      checklistIncomplete: false,
      assignmentStatus: "assigned_to_me"
    } as const;
    const closureReport = await loadSettingsProviderWebhookReviewClosureReportData("api", closureFilters);
    const closureReportExport = await exportSettingsProviderWebhookReviewClosureReportData("api", closureFilters);
    const closureReportManifest = await loadSettingsProviderWebhookReviewClosureReportExportManifestData("api", closureFilters);
    const qaHandoffBundle = await loadSettingsProviderWebhookReviewQaHandoffBundleData("api", closureFilters);
    const qaHandoffBundleExport = await exportSettingsProviderWebhookReviewQaHandoffBundleData("api", closureFilters);
    const qaHandoffReceipt = await loadSettingsProviderWebhookReviewQaHandoffReceiptData("api", closureFilters);
    const qaHandoffSignOff = await signOffSettingsProviderWebhookReviewQaHandoffReceipt("api", closureFilters, {
      acknowledgementType: "sign_off",
      reviewerRole: "QA reviewer",
      reviewerLabel: "safe reviewer"
    });
    const closureReportAudit = await loadSettingsProviderWebhookReviewClosureReportRedactionAuditData("api", closureFilters);
    const closureExportIntegrity = await loadSettingsProviderWebhookReviewClosureExportIntegrityData("api", closureFilters);
    const diagnostics = await loadSettingsProviderWebhookDiagnosticsData("api", "provider-webhook-unmatched-api");
    const closureEvidence = await loadSettingsProviderWebhookClosureEvidenceData("api", "provider-webhook-unmatched-api");
    const closureEvidenceExport = await exportSettingsProviderWebhookClosureEvidenceData("api", "provider-webhook-unmatched-api");
    const closureEvidenceManifest = await loadSettingsProviderWebhookClosureEvidenceExportManifestData("api", "provider-webhook-unmatched-api");
    const closureEvidenceAudit = await loadSettingsProviderWebhookClosureEvidenceRedactionAuditData("api", "provider-webhook-unmatched-api");

    expect(api.getProviderWebhookReviewMetrics).toHaveBeenCalledWith(expect.objectContaining({
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      eventType: "message.created"
    }));
    expect(api.getProviderWebhookReviewAlerts).toHaveBeenCalledWith(expect.objectContaining({
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      eventType: "message.created",
      severity: "critical"
    }));
    expect(api.getProviderWebhookReviewTriage).toHaveBeenCalledWith(expect.objectContaining({
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      eventType: "message.created",
      severity: "critical",
      triageLane: "critical_stale_open"
    }));
    expect(api.getProviderWebhookReviewWorkload).toHaveBeenCalledWith(expect.objectContaining({
      provider: "line",
      assignmentStatus: "assigned_to_me",
      escalationStatus: "escalated",
      escalationReason: "SLA_RISK"
    }));
    expect(api.getProviderWebhookReviewResolutionSummary).toHaveBeenCalledWith(expect.objectContaining({
      provider: "line",
      resolutionStatus: "unresolved",
      resolutionOutcome: "NEEDS_REVIEW",
      closureReadiness: "NOT_READY",
      checklistIncomplete: true
    }));
    expect(api.getProviderWebhookReviewClosureReport).toHaveBeenCalledWith(expect.objectContaining({
      provider: "line",
      resolutionStatus: "resolved",
      resolutionOutcome: "NEEDS_REVIEW",
      closureReadiness: "READY_FOR_REVIEW",
      checklistIncomplete: false,
      assignmentStatus: "assigned_to_me"
    }));
    expect(api.getProviderWebhookReviewClosureReportExport).toHaveBeenCalledWith(expect.objectContaining({
      provider: "line",
      resolutionStatus: "resolved",
      resolutionOutcome: "NEEDS_REVIEW",
      closureReadiness: "READY_FOR_REVIEW",
      checklistIncomplete: false,
      assignmentStatus: "assigned_to_me"
    }));
    expect(api.getProviderWebhookReviewClosureReportExportManifest).toHaveBeenCalledWith(expect.objectContaining({
      provider: "line",
      resolutionStatus: "resolved",
      resolutionOutcome: "NEEDS_REVIEW",
      closureReadiness: "READY_FOR_REVIEW",
      checklistIncomplete: false,
      assignmentStatus: "assigned_to_me"
    }));
    expect(api.getProviderWebhookReviewQaHandoffBundle).toHaveBeenCalledWith(expect.objectContaining({
      provider: "line",
      resolutionStatus: "resolved",
      resolutionOutcome: "NEEDS_REVIEW",
      closureReadiness: "READY_FOR_REVIEW",
      checklistIncomplete: false,
      assignmentStatus: "assigned_to_me"
    }));
    expect(api.getProviderWebhookReviewQaHandoffBundleExport).toHaveBeenCalledWith(expect.objectContaining({
      provider: "line",
      resolutionStatus: "resolved",
      resolutionOutcome: "NEEDS_REVIEW",
      closureReadiness: "READY_FOR_REVIEW",
      checklistIncomplete: false,
      assignmentStatus: "assigned_to_me"
    }));
    expect(api.getProviderWebhookReviewQaHandoffBundleReceipt).toHaveBeenCalledWith(expect.objectContaining({
      provider: "line",
      resolutionStatus: "resolved",
      resolutionOutcome: "NEEDS_REVIEW",
      closureReadiness: "READY_FOR_REVIEW",
      checklistIncomplete: false,
      assignmentStatus: "assigned_to_me"
    }));
    expect(api.signOffProviderWebhookReviewQaHandoffBundleReceipt).toHaveBeenCalledWith(expect.objectContaining({
      provider: "line",
      resolutionStatus: "resolved",
      resolutionOutcome: "NEEDS_REVIEW",
      closureReadiness: "READY_FOR_REVIEW",
      checklistIncomplete: false,
      assignmentStatus: "assigned_to_me"
    }), {
      acknowledgementType: "sign_off",
      reviewerRole: "QA reviewer",
      reviewerLabel: "safe reviewer"
    });
    expect(api.getProviderWebhookReviewClosureReportRedactionAudit).toHaveBeenCalledWith(expect.objectContaining({
      provider: "line",
      resolutionStatus: "resolved",
      resolutionOutcome: "NEEDS_REVIEW",
      closureReadiness: "READY_FOR_REVIEW",
      checklistIncomplete: false,
      assignmentStatus: "assigned_to_me"
    }));
    expect(api.getProviderWebhookReviewClosureExportIntegrity).toHaveBeenCalledWith(expect.objectContaining({
      provider: "line",
      resolutionStatus: "resolved",
      resolutionOutcome: "NEEDS_REVIEW",
      closureReadiness: "READY_FOR_REVIEW",
      checklistIncomplete: false,
      assignmentStatus: "assigned_to_me"
    }));
    expect(api.getProviderWebhookUnmatchedInboundDiagnostics).toHaveBeenCalledWith("provider-webhook-unmatched-api");
    expect(api.getProviderWebhookUnmatchedInboundClosureEvidence).toHaveBeenCalledWith("provider-webhook-unmatched-api");
    expect(api.getProviderWebhookUnmatchedInboundClosureEvidenceExport).toHaveBeenCalledWith("provider-webhook-unmatched-api");
    expect(api.getProviderWebhookUnmatchedInboundClosureEvidenceExportManifest).toHaveBeenCalledWith("provider-webhook-unmatched-api");
    expect(api.getProviderWebhookUnmatchedInboundClosureEvidenceRedactionAudit).toHaveBeenCalledWith("provider-webhook-unmatched-api");
    expect(metrics.mode).toBe("api");
    expect(metrics.metrics).toMatchObject({
      totalUnmatched: 1,
      openUnmatched: 1,
      externalCalls: 0
    });
    expect(alerts.mode).toBe("api");
    expect(alerts.alerts).toMatchObject({
      totalAlerts: 1,
      criticalCount: 1,
      staleOpenCount: 1,
      overSlaCount: 1,
      externalCalls: 0
    });
    expect(triage.mode).toBe("api");
    expect(triage.triage).toMatchObject({
      totalItems: 1,
      totalOpenItems: 1,
      totalTriageLanes: 8,
      externalCalls: 0
    });
    expect(triage.triage.topItems[0]).toMatchObject({
      triageLane: "critical_stale_open",
      recommendedNextActions: expect.arrayContaining(["OPEN_DIAGNOSTICS", "VIEW_HISTORY", "APPLY_FILTER"]),
      candidatesAvailable: true,
      externalCalls: 0
    });
    expect(workload.mode).toBe("api");
    expect(workload.workload).toMatchObject({
      totalItems: 1,
      counts: { assignedToMeOpen: 1, escalatedOpen: 1 },
      externalCalls: 0
    });
    expect(resolutionSummary.mode).toBe("api");
    expect(resolutionSummary.summary).toMatchObject({
      totalItems: 1,
      counts: { unresolvedOpen: 1, checklistIncompleteOpen: 1 },
      externalCalls: 0
    });
    expect(closureReport.mode).toBe("api");
    expect(closureReport.report).toMatchObject({
      totalItems: 1,
      evidenceReadyCount: 1,
      evidenceBlockedCount: 0,
      evidenceIncompleteCount: 0,
      externalCalls: 0
    });
    expect(closureReportExport.mode).toBe("api");
    expect(closureReportExport.exportResult).toMatchObject({
      exportKind: "closure-report",
      format: "json",
      totalItems: 1,
      externalCalls: 0
    });
    expect(closureReportManifest.mode).toBe("api");
    expect(closureReportManifest.manifest).toMatchObject({
      manifestTarget: "closure-report-export",
      manualQaReadiness: "ready",
      safeFilename: "provider-webhook-review-closure-report.json",
      externalCalls: 0
    });
    expect(qaHandoffBundle.mode).toBe("api");
    expect(qaHandoffBundle.bundle).toMatchObject({
      bundleKind: "provider-webhook-review-qa-handoff-bundle",
      manualQaReadiness: "ready",
      safeFilename: "provider-webhook-review-qa-handoff-bundle.json",
      readiness: {
        reviewExportQaHandoffEnabled: true,
        externalCalls: 0
      },
      manualQaChecks: {
        rawPayloadAbsent: true,
        rawSignatureAbsent: true,
        tokenAbsent: true,
        replyTokenAbsent: true,
        rawSenderIdAbsent: true,
        rawRoomIdAbsent: true,
        providerOutboundAbsent: true,
        externalCallsZero: true
      },
      externalCalls: 0
    });
    expect(qaHandoffBundle.bundle.safeDigest).toMatch(/^sha256:/);
    expect(qaHandoffBundle.bundle.evidenceManifests[0]?.safeDigest).toMatch(/^sha256:/);
    expect(qaHandoffBundleExport.mode).toBe("api");
    expect(qaHandoffBundleExport.exportResult).toMatchObject({
      exportKind: "qa-handoff-bundle",
      safeFilename: "provider-webhook-review-qa-handoff-bundle-export.json",
      status: "ready",
      counts: {
        totalItems: 1,
        evidenceManifestCount: 1
      },
      readinessFlags: {
        reviewExportQaHandoffEnabled: true
      },
      redactionAuditSummary: {
        providerOutboundAbsent: true,
        externalCallsZero: true,
        externalCalls: 0
      },
      bundle: {
        bundleKind: "provider-webhook-review-qa-handoff-bundle",
        externalCalls: 0
      },
      externalCalls: 0
    });
    expect(qaHandoffBundleExport.exportResult.safeDigest).toMatch(/^sha256:/);
    expect(qaHandoffReceipt.mode).toBe("api");
    expect(qaHandoffReceipt.receipt).toMatchObject({
      receiptStatus: "not_acknowledged",
      safeFilename: "provider-webhook-review-qa-handoff-receipt.json",
      bundleDigest: "sha256:safeqahandoffbundle",
      exportDigest: "sha256:safeqahandoffbundleexport",
      externalCalls: 0
    });
    expect(qaHandoffSignOff.mode).toBe("api");
    expect(qaHandoffSignOff.signOff).toMatchObject({
      signOffStatus: "signed_off",
      action: "sign_off",
      reviewerRole: "QA reviewer",
      reviewerLabel: "safe reviewer",
      externalCalls: 0
    });
    expect(closureReportAudit.mode).toBe("api");
    expect(closureReportAudit.audit).toMatchObject({
      auditTarget: "closure-report-export",
      status: "passed",
      checks: { rawPayloadAbsent: true, tokenAbsent: true, replyTokenAbsent: true },
      externalCalls: 0
    });
    expect(closureExportIntegrity.mode).toBe("api");
    expect(closureExportIntegrity.integrity).toMatchObject({
      totalCheckedItems: 1,
      redactionPassedCount: 1,
      redactionWarningCount: 0,
      redactionBlockedCount: 0,
      deterministicExportConfirmed: true,
      externalCalls: 0
    });
    expect(diagnostics.mode).toBe("api");
    expect(diagnostics.diagnostics).toMatchObject({
      unmatchedId: "provider-webhook-unmatched-api",
      platform: "line",
      channelAccountId: "sandbox:line",
      roomKeyDigest: "sha256:saferoomdigest",
      externalCalls: 0
    });
    expect(closureEvidence.mode).toBe("api");
    expect(closureEvidence.evidence).toMatchObject({
      unmatchedId: "provider-webhook-unmatched-api",
      evidenceStatus: "ready",
      externalCalls: 0
    });
    expect(closureEvidenceExport.mode).toBe("api");
    expect(closureEvidenceExport.exportResult).toMatchObject({
      exportKind: "closure-evidence",
      format: "json",
      unmatchedId: "provider-webhook-unmatched-api",
      externalCalls: 0
    });
    expect(closureEvidenceManifest.mode).toBe("api");
    expect(closureEvidenceManifest.manifest).toMatchObject({
      manifestTarget: "closure-evidence-export",
      unmatchedId: "provider-webhook-unmatched-api",
      manualQaReadiness: "ready",
      externalCalls: 0
    });
    expect(closureEvidenceAudit.mode).toBe("api");
    expect(closureEvidenceAudit.audit).toMatchObject({
      auditTarget: "closure-evidence-export",
      unmatchedId: "provider-webhook-unmatched-api",
      status: "passed",
      externalCalls: 0
    });
    expect(JSON.stringify({ metrics, alerts, triage, workload, resolutionSummary, closureReport, closureReportExport, closureReportManifest, qaHandoffBundle, qaHandoffBundleExport, qaHandoffReceipt, qaHandoffSignOff, closureReportAudit, closureExportIntegrity, diagnostics, closureEvidence, closureEvidenceExport, closureEvidenceManifest, closureEvidenceAudit })).not.toMatch(/providerRaw|payloadJson|raw-room|raw-sender|raw room|raw sender|accessToken|webhookSecret|bearer/i);
  });

  it("does not fallback to mock closure evidence or report data when API mode fails", async () => {
    api.getProviderWebhookReviewClosureReport.mockRejectedValueOnce(new Error("API request failed (503): closure report unavailable"));
    api.getProviderWebhookUnmatchedInboundClosureEvidence.mockRejectedValueOnce(new Error("API request failed (503): closure evidence unavailable"));
    api.getProviderWebhookReviewClosureReportExport.mockRejectedValueOnce(new Error("API request failed (503): closure report export unavailable"));
    api.getProviderWebhookUnmatchedInboundClosureEvidenceExport.mockRejectedValueOnce(new Error("API request failed (503): closure evidence export unavailable"));
    api.getProviderWebhookReviewClosureReportExportManifest.mockRejectedValueOnce(new Error("API request failed (503): closure report manifest unavailable"));
    api.getProviderWebhookReviewQaHandoffBundle.mockRejectedValueOnce(new Error("API request failed (503): qa handoff unavailable"));
    api.getProviderWebhookReviewQaHandoffBundleExport.mockRejectedValueOnce(new Error("API request failed (503): qa handoff export unavailable"));
    api.getProviderWebhookReviewQaHandoffBundleReceipt.mockRejectedValueOnce(new Error("API request failed (503): qa handoff receipt unavailable"));
    api.signOffProviderWebhookReviewQaHandoffBundleReceipt.mockRejectedValueOnce(new Error("API request failed (503): qa handoff sign-off unavailable"));
    api.getProviderWebhookUnmatchedInboundClosureEvidenceExportManifest.mockRejectedValueOnce(new Error("API request failed (503): closure evidence manifest unavailable"));
    api.getProviderWebhookReviewClosureReportRedactionAudit.mockRejectedValueOnce(new Error("API request failed (503): closure report audit unavailable"));
    api.getProviderWebhookReviewClosureExportIntegrity.mockRejectedValueOnce(new Error("API request failed (503): closure export integrity unavailable"));
    api.getProviderWebhookUnmatchedInboundClosureEvidenceRedactionAudit.mockRejectedValueOnce(new Error("API request failed (503): closure evidence audit unavailable"));

    await expect(loadSettingsProviderWebhookReviewClosureReportData("api", { provider: "line" }))
      .rejects.toThrow("closure report unavailable");
    await expect(loadSettingsProviderWebhookClosureEvidenceData("api", "provider-webhook-unmatched-api"))
      .rejects.toThrow("closure evidence unavailable");
    await expect(exportSettingsProviderWebhookReviewClosureReportData("api", { provider: "line" }))
      .rejects.toThrow("closure report export unavailable");
    await expect(exportSettingsProviderWebhookClosureEvidenceData("api", "provider-webhook-unmatched-api"))
      .rejects.toThrow("closure evidence export unavailable");
    await expect(loadSettingsProviderWebhookReviewClosureReportExportManifestData("api", { provider: "line" }))
      .rejects.toThrow("closure report manifest unavailable");
    await expect(loadSettingsProviderWebhookReviewQaHandoffBundleData("api", { provider: "line" }))
      .rejects.toThrow("qa handoff unavailable");
    await expect(exportSettingsProviderWebhookReviewQaHandoffBundleData("api", { provider: "line" }))
      .rejects.toThrow("qa handoff export unavailable");
    await expect(loadSettingsProviderWebhookReviewQaHandoffReceiptData("api", { provider: "line" }))
      .rejects.toThrow("qa handoff receipt unavailable");
    await expect(signOffSettingsProviderWebhookReviewQaHandoffReceipt("api", { provider: "line" }))
      .rejects.toThrow("qa handoff sign-off unavailable");
    await expect(loadSettingsProviderWebhookClosureEvidenceExportManifestData("api", "provider-webhook-unmatched-api"))
      .rejects.toThrow("closure evidence manifest unavailable");
    await expect(loadSettingsProviderWebhookReviewClosureReportRedactionAuditData("api", { provider: "line" }))
      .rejects.toThrow("closure report audit unavailable");
    await expect(loadSettingsProviderWebhookReviewClosureExportIntegrityData("api", { provider: "line" }))
      .rejects.toThrow("closure export integrity unavailable");
    await expect(loadSettingsProviderWebhookClosureEvidenceRedactionAuditData("api", "provider-webhook-unmatched-api"))
      .rejects.toThrow("closure evidence audit unavailable");
  });

  it("loads QA archive integrity and retention audit through API mode without local fallback", async () => {
    api.getProviderWebhookReviewQaHandoffArchiveIntegrity.mockResolvedValueOnce(providerWebhookArchiveIntegrityResponse());
    api.getProviderWebhookReviewQaHandoffRetentionAudit.mockResolvedValueOnce(providerWebhookRetentionAuditResponse());

    const filters = { provider: "line", eventType: "message.created" } as const;
    const integrity = await loadSettingsProviderWebhookReviewQaHandoffArchiveIntegrityData("api", filters);
    const retentionAudit = await loadSettingsProviderWebhookReviewQaHandoffRetentionAuditData("api", filters);

    expect(api.getProviderWebhookReviewQaHandoffArchiveIntegrity).toHaveBeenCalledWith(filters);
    expect(api.getProviderWebhookReviewQaHandoffRetentionAudit).toHaveBeenCalledWith(filters);
    expect(integrity.mode).toBe("api");
    expect(integrity.integrity).toMatchObject({
      integrityStatus: "confirmed",
      retentionAuditStatus: "confirmed",
      digestChainStatus: "confirmed",
      safeFilename: "provider-webhook-review-qa-handoff-locked-archive-integrity.json",
      externalCalls: 0
    });
    expect(retentionAudit.mode).toBe("api");
    expect(retentionAudit.retentionAudit).toMatchObject({
      retentionPolicyStatus: "active",
      retentionAuditStatus: "confirmed",
      digestChainStatus: "confirmed",
      safeFilename: "provider-webhook-review-qa-handoff-retention-audit.json",
      externalCalls: 0
    });
    expect(JSON.stringify({ integrity, retentionAudit })).not.toMatch(/providerRaw|payloadJson|raw-room|raw-sender|raw room|raw sender|accessToken|webhookSecret|bearer|"token"\s*:|"secret"\s*:|"replyToken"\s*:|"rawPayload"\s*:|"rawSignature"\s*:/i);
  });

  it("does not fallback to mock archive integrity or retention audit when API mode fails", async () => {
    api.getProviderWebhookReviewQaHandoffArchiveIntegrity.mockRejectedValueOnce(new Error("API request failed (503): archive integrity unavailable"));
    api.getProviderWebhookReviewQaHandoffRetentionAudit.mockRejectedValueOnce(new Error("API request failed (503): retention audit unavailable"));

    await expect(loadSettingsProviderWebhookReviewQaHandoffArchiveIntegrityData("api", { provider: "line" }))
      .rejects.toThrow("archive integrity unavailable");
    await expect(loadSettingsProviderWebhookReviewQaHandoffRetentionAuditData("api", { provider: "line" }))
      .rejects.toThrow("retention audit unavailable");
  });

  it("loads archive finalization, retention sign-off, and finalization receipt through API mode without local fallback", async () => {
    api.getProviderWebhookReviewQaHandoffArchiveFinalization.mockResolvedValueOnce(providerWebhookArchiveFinalizationResponse());
    api.signOffProviderWebhookReviewQaHandoffArchiveFinalization.mockResolvedValueOnce(providerWebhookArchiveFinalizationSignOffResponse());
    api.getProviderWebhookReviewQaHandoffArchiveFinalizationReceipt.mockResolvedValueOnce(providerWebhookArchiveFinalizationReceiptResponse());
    api.getProviderWebhookReviewQaHandoffArchiveReleaseEvidence.mockResolvedValueOnce(providerWebhookArchiveReleaseEvidenceResponse());
    api.getProviderWebhookReviewQaHandoffArchiveReleaseVerification.mockResolvedValueOnce(providerWebhookArchiveReleaseVerificationResponse());
    api.getProviderWebhookReviewQaHandoffArchiveReleaseCertification.mockResolvedValueOnce(providerWebhookArchiveReleaseCertificationResponse());
    api.getProviderWebhookReviewQaHandoffArchiveReleaseClosureLedger.mockResolvedValueOnce(providerWebhookArchiveReleaseClosureLedgerResponse());
    api.getProviderWebhookReviewQaHandoffArchiveReleaseAttestationAudit.mockResolvedValueOnce(providerWebhookArchiveReleaseAttestationAuditResponse());
    api.getProviderWebhookReviewQaHandoffArchiveReleaseAttestationReconciliation.mockResolvedValueOnce(providerWebhookArchiveReleaseAttestationReconciliationResponse());
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseGate.mockResolvedValueOnce(providerWebhookArchiveCertifiedReleaseGateResponse());
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseDecisionReceipt.mockResolvedValueOnce(providerWebhookArchiveCertifiedReleaseDecisionReceiptResponse());
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket.mockResolvedValueOnce(providerWebhookArchiveCertifiedReleaseHandoffPacketResponse());
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord.mockResolvedValueOnce(providerWebhookArchiveCertifiedReleaseHandoffAcceptanceRecordResponse("not_started"));
    api.acknowledgeProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord.mockResolvedValueOnce(providerWebhookArchiveCertifiedReleaseHandoffAcceptanceRecordResponse("acknowledged"));
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun.mockResolvedValueOnce(providerWebhookArchiveCertifiedReleaseNoopExecutionDryRunResponse("not_started"));
    api.runProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun.mockResolvedValueOnce(providerWebhookArchiveCertifiedReleaseNoopExecutionDryRunResponse("passed"));
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedger.mockResolvedValueOnce(providerWebhookArchiveCertifiedReleaseDryRunResultLedgerResponse());
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificate.mockResolvedValueOnce(providerWebhookArchiveCertifiedReleaseFinalReadinessCertificateResponse());
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister.mockResolvedValueOnce(providerWebhookArchiveCertifiedReleaseFreezeAuditRegisterResponse());
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt.mockResolvedValueOnce(providerWebhookArchiveCertifiedReleaseRollbackRehearsalReceiptResponse());
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseControlRoomPacket.mockResolvedValueOnce(providerWebhookArchiveCertifiedReleaseControlRoomPacketResponse());
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceipt.mockResolvedValueOnce(providerWebhookArchiveCertifiedReleaseCutoverChecklistReceiptResponse());
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceipt.mockResolvedValueOnce(providerWebhookArchiveCertifiedReleaseOperatorCommandReceiptResponse());
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceipt.mockResolvedValueOnce(providerWebhookArchiveCertifiedReleaseGoLiveAuthorizationReceiptResponse());
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceipt.mockResolvedValueOnce(providerWebhookArchiveCertifiedReleaseLaunchWindowConfirmationReceiptResponse());
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceipt.mockResolvedValueOnce(providerWebhookArchiveCertifiedReleaseGoLiveHoldReleaseAuthorizationReceiptResponse());
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceipt.mockResolvedValueOnce(providerWebhookArchiveCertifiedReleaseLaunchApprovalReceiptResponse());
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceipt.mockResolvedValueOnce(providerWebhookArchiveCertifiedReleaseNoExecutionLockReceiptResponse());
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacket.mockResolvedValueOnce(providerWebhookArchiveCertifiedReleaseOperationsHandoffReadinessPacketResponse());
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceReceipt.mockResolvedValueOnce(providerWebhookArchiveCertifiedReleaseOperationsHandoffAcceptanceReceiptResponse());
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedger.mockResolvedValueOnce(providerWebhookArchiveCertifiedReleaseOperationsCustodyMonitoringReadinessLedgerResponse());
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.mockResolvedValueOnce(providerWebhookArchiveCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceiptResponse());
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollup.mockResolvedValueOnce(providerWebhookArchiveCertifiedReleaseFinalNoExecutionEvidenceRollupResponse());
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt.mockResolvedValueOnce(providerWebhookArchiveCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceiptResponse());

    const filters = { provider: "line", eventType: "message.created" } as const;
    const finalization = await loadSettingsProviderWebhookReviewQaHandoffArchiveFinalizationData("api", filters);
    const signOff = await signOffSettingsProviderWebhookReviewQaHandoffArchiveFinalization("api", filters, {
      reviewerRole: "retention reviewer",
      reviewerLabel: "safe reviewer"
    });
    const receipt = await loadSettingsProviderWebhookReviewQaHandoffArchiveFinalizationReceiptData("api", filters);
    const releaseEvidence = await loadSettingsProviderWebhookReviewQaHandoffArchiveReleaseEvidenceData("api", filters);
    const releaseVerification = await loadSettingsProviderWebhookReviewQaHandoffArchiveReleaseVerificationData("api", filters);
    const releaseCertification = await loadSettingsProviderWebhookReviewQaHandoffArchiveReleaseCertificationData("api", filters);
    const closureLedger = await loadSettingsProviderWebhookReviewQaHandoffArchiveReleaseClosureLedgerData("api", filters);
    const attestationAudit = await loadSettingsProviderWebhookReviewQaHandoffArchiveReleaseAttestationAuditData("api", filters);
    const reconciliation = await loadSettingsProviderWebhookReviewQaHandoffArchiveReleaseAttestationReconciliationData("api", filters);
    const releaseGate = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseGateData("api", filters);
    const decisionReceipt = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptData("api", filters);
    const handoffPacket = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacketData("api", filters);
    const acceptanceRecord = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordData("api", filters);
    const acknowledgedRecord = await acknowledgeSettingsProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord("api", filters, {
      acknowledgementType: "operator_checklist_acknowledgement",
      acknowledgedByRole: "release owner",
      acknowledgedByLabel: "safe release owner",
      acknowledgedChecklistKeys: handoffPacket.handoffPacket.operatorChecklist.map((item) => item.key)
    });
    const noopDryRun = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunData("api", filters);
    const executedNoopDryRun = await runSettingsProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun("api", filters, {
      requestedBy: "safe release owner",
      checklistAcknowledged: true,
      operatorNote: "safe no-op dry-run",
      dryRunReason: "safe no-op execution readiness rehearsal",
      executionMode: "no_op"
    });
    const resultLedger = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerData("api", filters);
    const finalReadinessCertificate = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificateData("api", filters);
    const freezeAuditRegister = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegisterData("api", filters);
    const rollbackRehearsalReceipt = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptData("api", filters);
    const controlRoomPacket = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseControlRoomPacketData("api", filters);
    const cutoverChecklistReceipt = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceiptData("api", filters);
    const operatorCommandReceipt = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceiptData("api", filters);
    const goLiveAuthorizationReceipt = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceiptData("api", filters);
    const launchWindowConfirmationReceipt = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceiptData("api", filters);
    const goLiveHoldReleaseAuthorizationReceipt = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceiptData("api", filters);
    const launchApprovalReceipt = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceiptData("api", filters);
    const noExecutionLockReceipt = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceiptData("api", filters);
    const operationsHandoffReadinessPacket = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacketData("api", filters);
    const operationsHandoffAcceptanceReceipt = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceReceiptData("api", filters);
    const operationsCustodyMonitoringReadinessLedger = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedgerData("api", filters);
    const operationsCustodyMonitoringCloseoutSealReceipt = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceiptData("api", filters);
    const finalNoExecutionEvidenceRollup = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollupData("api", filters);
    const finalEvidenceIndexRegressionGuardrailReceipt = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceiptData("api", filters);
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealOperationalClosureReceipt.mockResolvedValueOnce(providerWebhookArchiveCertifiedReleaseFinalArchiveSealOperationalClosureReceiptResponse());
    const finalArchiveSealOperationalClosureReceipt = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealOperationalClosureReceiptData("api", filters);
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceipt.mockResolvedValueOnce(providerWebhookArchiveCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceiptResponse());
    const postClosurePreservationVerificationReceipt = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceiptData("api", filters);
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceipt.mockResolvedValueOnce(providerWebhookArchiveCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceiptResponse());
    const postClosurePreservationContinuityLedgerReceipt = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceiptData("api", filters);
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceipt.mockResolvedValueOnce(providerWebhookArchiveCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceiptResponse());
    const postClosurePreservationCustodyAuditReceipt = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceiptData("api", filters);
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealReceipt.mockResolvedValueOnce(providerWebhookArchiveCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealReceiptResponse());
    const postClosurePreservationCustodyChainSealReceipt = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealReceiptData("api", filters);
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerReceipt.mockResolvedValueOnce(providerWebhookArchiveCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerReceiptResponse());
    const postClosurePreservationCustodyChainIntegrityLedgerReceipt = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerReceiptData("api", filters);
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.mockResolvedValueOnce(providerWebhookArchiveCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityReceiptResponse());
    const postClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityReceiptData("api", filters);
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt.mockResolvedValueOnce(providerWebhookArchiveCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceiptResponse());
    const postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceiptData("api", filters);
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceipt.mockResolvedValueOnce(providerWebhookArchiveCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceiptResponse());
    const postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceipt = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceiptData("api", filters);

    expect(api.getProviderWebhookReviewQaHandoffArchiveFinalization).toHaveBeenCalledWith(filters);
    expect(api.signOffProviderWebhookReviewQaHandoffArchiveFinalization).toHaveBeenCalledWith(filters, {
      reviewerRole: "retention reviewer",
      reviewerLabel: "safe reviewer"
    });
    expect(api.getProviderWebhookReviewQaHandoffArchiveFinalizationReceipt).toHaveBeenCalledWith(filters);
    expect(api.getProviderWebhookReviewQaHandoffArchiveReleaseEvidence).toHaveBeenCalledWith(filters);
    expect(api.getProviderWebhookReviewQaHandoffArchiveReleaseVerification).toHaveBeenCalledWith(filters);
    expect(api.getProviderWebhookReviewQaHandoffArchiveReleaseCertification).toHaveBeenCalledWith(filters);
    expect(api.getProviderWebhookReviewQaHandoffArchiveReleaseClosureLedger).toHaveBeenCalledWith(filters);
    expect(api.getProviderWebhookReviewQaHandoffArchiveReleaseAttestationAudit).toHaveBeenCalledWith(filters);
    expect(api.getProviderWebhookReviewQaHandoffArchiveReleaseAttestationReconciliation).toHaveBeenCalledWith(filters);
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseGate).toHaveBeenCalledWith(filters);
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseDecisionReceipt).toHaveBeenCalledWith(filters);
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket).toHaveBeenCalledWith(filters);
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord).toHaveBeenCalledWith(filters);
    expect(api.acknowledgeProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord).toHaveBeenCalledWith(filters, {
      acknowledgementType: "operator_checklist_acknowledgement",
      acknowledgedByRole: "release owner",
      acknowledgedByLabel: "safe release owner",
      acknowledgedChecklistKeys: handoffPacket.handoffPacket.operatorChecklist.map((item) => item.key)
    });
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun).toHaveBeenCalledWith(filters);
    expect(api.runProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun).toHaveBeenCalledWith(filters, {
      requestedBy: "safe release owner",
      checklistAcknowledged: true,
      operatorNote: "safe no-op dry-run",
      dryRunReason: "safe no-op execution readiness rehearsal",
      executionMode: "no_op"
    });
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedger).toHaveBeenCalledWith(filters);
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificate).toHaveBeenCalledWith(filters);
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister).toHaveBeenCalledWith(filters);
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt).toHaveBeenCalledWith(filters);
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseControlRoomPacket).toHaveBeenCalledWith(filters);
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceipt).toHaveBeenCalledWith(filters);
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceipt).toHaveBeenCalledWith(filters);
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceipt).toHaveBeenCalledWith(filters);
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceipt).toHaveBeenCalledWith(filters);
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceipt).toHaveBeenCalledWith(filters);
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceipt).toHaveBeenCalledWith(filters);
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceipt).toHaveBeenCalledWith(filters);
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacket).toHaveBeenCalledWith(filters);
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceReceipt).toHaveBeenCalledWith(filters);
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedger).toHaveBeenCalledWith(filters);
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt).toHaveBeenCalledWith(filters);
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollup).toHaveBeenCalledWith(filters);
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt).toHaveBeenCalledWith(filters);
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealOperationalClosureReceipt).toHaveBeenCalledWith(filters);
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceipt).toHaveBeenCalledWith(filters);
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceipt).toHaveBeenCalledWith(filters);
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceipt).toHaveBeenCalledWith(filters);
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealReceipt).toHaveBeenCalledWith(filters);
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerReceipt).toHaveBeenCalledWith(filters);
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt).toHaveBeenCalledWith(filters);
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt).toHaveBeenCalledWith(filters);
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceipt).toHaveBeenCalledWith(filters);
    expect(finalization.finalization).toMatchObject({
      finalizationStatus: "ready",
      retentionSignOffStatus: "not_signed",
      finalizationReceiptStatus: "not_created",
      safeFilename: "provider-webhook-review-qa-handoff-archive-finalization.json",
      externalCalls: 0
    });
    expect(signOff.signOff).toMatchObject({
      finalizationStatus: "finalized",
      retentionSignOffStatus: "signed_off",
      action: "sign_off",
      externalCalls: 0
    });
    expect(receipt.receipt).toMatchObject({
      receiptKind: "qa-handoff-locked-archive-finalization-receipt",
      finalizationReceiptStatus: "ready",
      externalCalls: 0
    });
    expect(releaseEvidence.releaseEvidence).toMatchObject({
      evidenceKind: "qa-handoff-locked-archive-release-evidence-pack",
      releaseReadinessStatus: "ready_for_release",
      prerequisiteChecklist: expect.objectContaining({
        lockedArchiveExported: true,
        finalizationReceiptReady: true,
        externalCallsZero: true
      }),
      externalCalls: 0
    });
    expect(releaseVerification.verification).toMatchObject({
      verificationKind: "qa-handoff-locked-archive-release-verification-matrix",
      verificationStatus: "verified",
      releaseReadinessStatus: "ready_for_release",
      digestChainStatus: "confirmed",
      externalCalls: 0
    });
    expect(releaseVerification.verification.digestMatrixRows).toHaveLength(10);
    expect(releaseCertification.certification).toMatchObject({
      certificationKind: "qa-handoff-locked-archive-release-certification-receipt",
      certificationStatus: "certified",
      releaseReadinessStatus: "ready_for_release",
      verificationStatus: "verified",
      digestChainStatus: "confirmed",
      externalCalls: 0
    });
    expect(releaseCertification.certification.releaseVerificationDigest).toBe(releaseVerification.verification.safeDigest);
    expect(closureLedger.closureLedger).toMatchObject({
      ledgerKind: "qa-handoff-locked-archive-release-closure-ledger",
      ledgerStatus: "certified_release_closed",
      certificationStatus: "certified",
      releaseReadinessStatus: "ready_for_release",
      verificationStatus: "verified",
      digestChainStatus: "confirmed",
      externalCalls: 0
    });
    expect(closureLedger.closureLedger.releaseCertificationDigest).toBe(releaseCertification.certification.safeDigest);
    expect(closureLedger.closureLedger.ledgerRows).toHaveLength(5);
    expect(attestationAudit.attestationAudit).toMatchObject({
      attestationKind: "qa-handoff-locked-archive-release-attestation-audit",
      attestationStatus: "complete",
      ledgerStatus: "certified_release_closed",
      certificationStatus: "certified",
      releaseReadinessStatus: "ready_for_release",
      verificationStatus: "verified",
      digestChainStatus: "confirmed",
      closureLedgerDigest: closureLedger.closureLedger.safeDigest,
      externalCalls: 0
    });
    expect(attestationAudit.attestationAudit.attestationRows).toHaveLength(7);
    expect(attestationAudit.attestationAudit.counts.attestationAuditCheckedCount).toBe(1);
    expect(reconciliation.reconciliation).toMatchObject({
      reconciliationKind: "qa-handoff-locked-archive-release-attestation-reconciliation-register",
      reconciliationStatus: "aligned",
      attestationStatus: "complete",
      ledgerStatus: "certified_release_closed",
      certificationStatus: "certified",
      releaseReadinessStatus: "ready_for_release",
      verificationStatus: "verified",
      digestChainStatus: "confirmed",
      attestationAuditDigest: attestationAudit.attestationAudit.safeDigest,
      externalCalls: 0
    });
    expect(reconciliation.reconciliation.reconciliationRows).toHaveLength(8);
    expect(reconciliation.reconciliation.counts.reconciliationCheckedCount).toBe(1);
    expect(releaseGate.releaseGate).toMatchObject({
      gateKind: "qa-handoff-locked-archive-certified-release-gate",
      gateStatus: "ready",
      goNoGoDecision: "go",
      reconciliationStatus: "aligned",
      externalCalls: 0
    });
    expect(releaseGate.releaseGate.gateChecklist.externalCallsZero).toBe(true);
    expect(releaseGate.releaseGate.counts.gateCheckedCount).toBe(1);
    expect(decisionReceipt.decisionReceipt).toMatchObject({
      receiptKind: "qa-handoff-locked-archive-certified-release-decision-receipt",
      receiptStatus: "issued",
      releaseDecision: "go",
      gateStatus: "ready",
      goNoGoDecision: "go",
      releaseReadinessStatus: "ready_for_release",
      externalCalls: 0
    });
    expect(decisionReceipt.decisionReceipt.receiptRows).toHaveLength(13);
    expect(decisionReceipt.decisionReceipt.receiptSummary.externalCallsZero).toBe(true);
    expect(decisionReceipt.decisionReceipt.counts.decisionReceiptCheckedCount).toBe(1);
    expect(handoffPacket.handoffPacket).toMatchObject({
      packetKind: "qa-handoff-locked-archive-certified-release-handoff-packet",
      packetStatus: "issued",
      handoffStatus: "ready",
      releaseDecision: "go",
      receiptStatus: "issued",
      externalCalls: 0
    });
    expect(handoffPacket.handoffPacket.handoffRows).toHaveLength(16);
    expect(handoffPacket.handoffPacket.runbookRows.length).toBeGreaterThan(0);
    expect(handoffPacket.handoffPacket.operatorChecklist.length).toBeGreaterThan(0);
    expect(handoffPacket.handoffPacket.releaseOwnerSummary.externalCallsZero).toBe(true);
    expect(acceptanceRecord.acceptanceRecord).toMatchObject({
      acceptanceKind: "qa-handoff-locked-archive-certified-release-handoff-acceptance-record",
      acceptanceStatus: "not_started",
      handoffStatus: "ready",
      releaseDecision: "go",
      packetStatus: "issued",
      receiptStatus: "issued",
      externalCalls: 0
    });
    expect(acknowledgedRecord.acceptanceRecord).toMatchObject({
      acceptanceStatus: "acknowledged",
      handoffStatus: "ready",
      releaseDecision: "go",
      packetStatus: "issued",
      receiptStatus: "issued",
      gateStatus: "ready",
      goNoGoDecision: "go",
      externalCalls: 0
    });
    expect(acknowledgedRecord.acceptanceRecord.acknowledgedChecklist.every((item) => item.acknowledged)).toBe(true);
    expect(acknowledgedRecord.acceptanceRecord.acknowledgementRows.length).toBeGreaterThan(0);
    expect(acknowledgedRecord.acceptanceRecord.releaseOwnerSummary.operatorChecklistAcknowledged).toBe(true);
    expect(noopDryRun.dryRun).toMatchObject({
      dryRunKind: "qa-handoff-locked-archive-certified-release-noop-execution-dryrun",
      dryRunStatus: "not_started",
      executionMode: "no_op",
      acceptanceStatus: "acknowledged",
      externalCalls: 0
    });
    expect(executedNoopDryRun.dryRun).toMatchObject({
      dryRunStatus: "passed",
      executionMode: "no_op",
      acceptanceStatus: "acknowledged",
      handoffStatus: "ready",
      releaseDecision: "go",
      externalCalls: 0
    });
    expect(executedNoopDryRun.dryRun.executionChecklist.length).toBeGreaterThan(0);
    expect(executedNoopDryRun.dryRun.dryRunRows.length).toBeGreaterThan(0);
    expect(executedNoopDryRun.dryRun.executionPlanRows.length).toBeGreaterThan(0);
    expect(resultLedger.resultLedger).toMatchObject({
      ledgerKind: "qa-handoff-locked-archive-certified-release-dryrun-result-ledger",
      ledgerStatus: "recorded",
      dryRunStatus: "passed",
      executionMode: "no_op",
      acceptanceStatus: "acknowledged",
      handoffStatus: "ready",
      releaseDecision: "go",
      externalCalls: 0
    });
    expect(resultLedger.resultLedger.resultLedgerRows.length).toBeGreaterThan(0);
    expect(resultLedger.resultLedger.finalReadinessRows.length).toBeGreaterThan(0);
    expect(resultLedger.resultLedger.counts.dryRunResultLedgerMutationCount).toBe(0);
    expect(finalReadinessCertificate.finalReadinessCertificate).toMatchObject({
      certificateKind: "qa-handoff-locked-archive-certified-release-final-readiness-certificate",
      certificateStatus: "issued",
      finalReadinessStatus: "ready",
      ledgerStatus: "recorded",
      dryRunStatus: "passed",
      executionMode: "no_op",
      releaseDecision: "go",
      externalCalls: 0
    });
    expect(finalReadinessCertificate.finalReadinessCertificate.certificateRows.length).toBeGreaterThan(0);
    expect(finalReadinessCertificate.finalReadinessCertificate.counts.finalReadinessCertificateMutationCount).toBe(0);
    expect(freezeAuditRegister.freezeAuditRegister).toMatchObject({
      registerKind: "qa-handoff-locked-archive-certified-release-freeze-audit-register",
      freezeAuditStatus: "recorded",
      freezeStatus: "frozen",
      rollbackReadinessStatus: "ready",
      certificateStatus: "issued",
      finalReadinessStatus: "ready",
      ledgerStatus: "recorded",
      dryRunStatus: "passed",
      executionMode: "no_op",
      releaseDecision: "go",
      externalCalls: 0
    });
    expect(freezeAuditRegister.freezeAuditRegister.freezeAuditRows.length).toBeGreaterThan(0);
    expect(freezeAuditRegister.freezeAuditRegister.rollbackPlanRows.length).toBeGreaterThan(0);
    expect(freezeAuditRegister.freezeAuditRegister.counts.freezeAuditRegisterMutationCount).toBe(0);
    expect(rollbackRehearsalReceipt.rollbackRehearsalReceipt).toMatchObject({
      receiptKind: "qa-handoff-locked-archive-certified-release-rollback-rehearsal-receipt",
      rollbackRehearsalStatus: "verified",
      recoveryReadinessStatus: "ready",
      rollbackReadinessStatus: "ready",
      freezeAuditStatus: "recorded",
      freezeStatus: "frozen",
      certificateStatus: "issued",
      finalReadinessStatus: "ready",
      ledgerStatus: "recorded",
      dryRunStatus: "passed",
      executionMode: "no_op",
      releaseDecision: "go",
      externalCalls: 0
    });
    expect(rollbackRehearsalReceipt.rollbackRehearsalReceipt.freezeSnapshotRows.length).toBeGreaterThan(0);
    expect(rollbackRehearsalReceipt.rollbackRehearsalReceipt.rollbackReadinessRows.length).toBeGreaterThan(0);
    expect(rollbackRehearsalReceipt.rollbackRehearsalReceipt.recoveryReadinessRows.length).toBeGreaterThan(0);
    expect(rollbackRehearsalReceipt.rollbackRehearsalReceipt.counts.rollbackRehearsalReceiptMutationCount).toBe(0);
    expect(controlRoomPacket.controlRoomPacket).toMatchObject({
      packetKind: "qa-handoff-locked-archive-certified-release-control-room-packet",
      controlRoomStatus: "ready",
      cutoverReadinessStatus: "ready",
      rollbackRehearsalStatus: "verified",
      recoveryReadinessStatus: "ready",
      externalCalls: 0
    });
    expect(controlRoomPacket.controlRoomPacket.controlRoomRows.length).toBeGreaterThan(0);
    expect(controlRoomPacket.controlRoomPacket.cutoverChecklistRows.length).toBeGreaterThan(0);
    expect(controlRoomPacket.controlRoomPacket.operatorHandoffRows.length).toBeGreaterThan(0);
    expect(controlRoomPacket.controlRoomPacket.counts.controlRoomPacketMutationCount).toBe(0);
    expect(cutoverChecklistReceipt.cutoverChecklistReceipt).toMatchObject({
      receiptKind: "qa-handoff-locked-archive-certified-release-cutover-checklist-receipt",
      cutoverChecklistStatus: "verified",
      operatorCommandStatus: "ready",
      controlRoomStatus: "ready",
      cutoverReadinessStatus: "ready",
      rollbackRehearsalStatus: "verified",
      releaseDecision: "go",
      executionMode: "no_op",
      externalCalls: 0
    });
    expect(cutoverChecklistReceipt.cutoverChecklistReceipt.operatorCommandRows.length).toBeGreaterThan(0);
    expect(cutoverChecklistReceipt.cutoverChecklistReceipt.safeCutoverChecklistRows.length).toBeGreaterThan(0);
    expect(cutoverChecklistReceipt.cutoverChecklistReceipt.counts.cutoverChecklistReceiptMutationCount).toBe(0);
    expect(operatorCommandReceipt.operatorCommandReceipt).toMatchObject({
      receiptKind: "qa-handoff-locked-archive-certified-release-operator-command-receipt",
      operatorCommandReceiptStatus: "issued",
      goLiveAuthorizationStatus: "ready",
      executionMode: "no_op",
      releaseDecision: "go",
      externalCalls: 0
    });
    expect(operatorCommandReceipt.operatorCommandReceipt.operatorCommandReceiptDigest).toBe(operatorCommandReceipt.operatorCommandReceipt.safeDigest);
    expect(operatorCommandReceipt.operatorCommandReceipt.goLiveAuthorizationRows.length).toBeGreaterThan(0);
    expect(operatorCommandReceipt.operatorCommandReceipt.operatorCommandReceiptRows.length).toBeGreaterThan(0);
    expect(operatorCommandReceipt.operatorCommandReceipt.commandHandoffRows.length).toBeGreaterThan(0);
    expect(operatorCommandReceipt.operatorCommandReceipt.counts.operatorCommandReceiptMutationCount).toBe(0);
    expect(goLiveAuthorizationReceipt.goLiveAuthorizationReceipt).toMatchObject({
      receiptKind: "qa-handoff-locked-archive-certified-release-go-live-authorization-receipt",
      goLiveAuthorizationReceiptStatus: "issued",
      goLiveAuthorizationStatus: "ready",
      launchWindowStatus: "ready",
      safeLaunchWindowStatus: "ready",
      executionMode: "no_op",
      releaseDecision: "go",
      externalCalls: 0
    });
    expect(goLiveAuthorizationReceipt.goLiveAuthorizationReceipt.goLiveAuthorizationReceiptDigest).toBe(goLiveAuthorizationReceipt.goLiveAuthorizationReceipt.safeDigest);
    expect(goLiveAuthorizationReceipt.goLiveAuthorizationReceipt.goLiveAuthorizationReceiptRows.length).toBeGreaterThan(0);
    expect(goLiveAuthorizationReceipt.goLiveAuthorizationReceipt.launchWindowRows.length).toBeGreaterThan(0);
    expect(goLiveAuthorizationReceipt.goLiveAuthorizationReceipt.safeLaunchWindowRows.length).toBeGreaterThan(0);
    expect(goLiveAuthorizationReceipt.goLiveAuthorizationReceipt.counts.goLiveAuthorizationReceiptMutationCount).toBe(0);
    expect(launchWindowConfirmationReceipt.launchWindowConfirmationReceipt).toMatchObject({
      receiptKind: "qa-handoff-locked-archive-certified-release-launch-window-confirmation-receipt",
      launchWindowConfirmationStatus: "confirmed",
      goLiveHoldStatus: "ready",
      executionMode: "no_op",
      releaseDecision: "go",
      externalCalls: 0
    });
    expect(launchWindowConfirmationReceipt.launchWindowConfirmationReceipt.launchWindowConfirmationReceiptDigest).toBe(launchWindowConfirmationReceipt.launchWindowConfirmationReceipt.safeDigest);
    expect(launchWindowConfirmationReceipt.launchWindowConfirmationReceipt.launchWindowConfirmationRows.length).toBeGreaterThan(0);
    expect(launchWindowConfirmationReceipt.launchWindowConfirmationReceipt.goLiveHoldRows.length).toBeGreaterThan(0);
    expect(launchWindowConfirmationReceipt.launchWindowConfirmationReceipt.counts.launchWindowConfirmationReceiptMutationCount).toBe(0);
    expect(goLiveHoldReleaseAuthorizationReceipt.goLiveHoldReleaseAuthorizationReceipt).toMatchObject({
      receiptKind: "qa-handoff-locked-archive-certified-release-go-live-hold-release-authorization-receipt",
      goLiveHoldReleaseAuthorizationStatus: "authorized",
      launchApprovalStatus: "ready",
      launchWindowConfirmationStatus: "confirmed",
      goLiveHoldStatus: "ready",
      executionMode: "no_op",
      releaseDecision: "go",
      externalCalls: 0
    });
    expect(goLiveHoldReleaseAuthorizationReceipt.goLiveHoldReleaseAuthorizationReceipt.goLiveHoldReleaseAuthorizationReceiptDigest).toBe(goLiveHoldReleaseAuthorizationReceipt.goLiveHoldReleaseAuthorizationReceipt.safeDigest);
    expect(goLiveHoldReleaseAuthorizationReceipt.goLiveHoldReleaseAuthorizationReceipt.goLiveHoldReleaseAuthorizationRows.length).toBeGreaterThan(0);
    expect(goLiveHoldReleaseAuthorizationReceipt.goLiveHoldReleaseAuthorizationReceipt.launchApprovalRows.length).toBeGreaterThan(0);
    expect(goLiveHoldReleaseAuthorizationReceipt.goLiveHoldReleaseAuthorizationReceipt.counts.goLiveHoldReleaseAuthorizationReceiptMutationCount).toBe(0);
    expect(launchApprovalReceipt.launchApprovalReceipt).toMatchObject({
      receiptKind: "qa-handoff-locked-archive-certified-release-launch-approval-receipt",
      launchApprovalReceiptStatus: "issued",
      noExecutionGuardStatus: "retained",
      launchApprovalStatus: "ready",
      executionMode: "no_op",
      releaseDecision: "go",
      externalCalls: 0
    });
    expect(launchApprovalReceipt.launchApprovalReceipt.launchApprovalReceiptDigest).toBe(launchApprovalReceipt.launchApprovalReceipt.safeDigest);
    expect(launchApprovalReceipt.launchApprovalReceipt.noExecutionGuardRows.length).toBeGreaterThan(0);
    expect(launchApprovalReceipt.launchApprovalReceipt.counts.launchApprovalReceiptMutationCount).toBe(0);
    expect(noExecutionLockReceipt.noExecutionLockReceipt).toMatchObject({
      receiptKind: "qa-handoff-locked-archive-certified-release-launch-approval-no-execution-lock-receipt",
      noExecutionLockReceiptStatus: "issued",
      noExecutionLockStatus: "locked",
      launchApprovalArchiveStatus: "retained",
      tenantScopeStatus: "tenant_scoped",
      providerOutboundStatus: "absent",
      externalNotificationStatus: "absent",
      aiCallStatus: "absent",
      executionMode: "no_op",
      releaseDecision: "go",
      externalCalls: 0
    });
    expect(noExecutionLockReceipt.noExecutionLockReceipt.noExecutionLockReceiptDigest).toBe(noExecutionLockReceipt.noExecutionLockReceipt.safeDigest);
    expect(noExecutionLockReceipt.noExecutionLockReceipt.noExecutionLockRows.length).toBeGreaterThan(0);
    expect(noExecutionLockReceipt.noExecutionLockReceipt.counts.noExecutionLockReceiptMutationCount).toBe(0);
    expect(noExecutionLockReceipt.noExecutionLockReceipt.counts.executionAttemptCount).toBe(0);
    expect(noExecutionLockReceipt.noExecutionLockReceipt.counts.providerOutboundCallCount).toBe(0);
    expect(noExecutionLockReceipt.noExecutionLockReceipt.counts.externalNotificationSendCount).toBe(0);
    expect(noExecutionLockReceipt.noExecutionLockReceipt.counts.aiCallCount).toBe(0);
    expect(operationsHandoffReadinessPacket.operationsHandoffReadinessPacket).toMatchObject({
      packetKind: "qa-handoff-locked-archive-certified-release-operations-handoff-readiness-no-execution-evidence-packet",
      operationsHandoffReadinessStatus: "ready_for_handoff",
      operationsHandoffEvidencePacketStatus: "issued",
      noExecutionEvidenceStatus: "confirmed",
      launchApprovalLockStatus: "locked",
      digestContinuityStatus: "confirmed",
      externalCalls: 0
    });
    expect(operationsHandoffReadinessPacket.operationsHandoffReadinessPacket.operationsHandoffEvidencePacketDigest).toBe(operationsHandoffReadinessPacket.operationsHandoffReadinessPacket.safeDigest);
    expect(operationsHandoffReadinessPacket.operationsHandoffReadinessPacket.counts.operationsHandoffMutationCount).toBe(0);
    expect(operationsHandoffReadinessPacket.operationsHandoffReadinessPacket.counts.operationsHandoffBlockingCount).toBe(0);
    expect(operationsHandoffReadinessPacket.operationsHandoffReadinessPacket.counts.providerOutboundCallCount).toBe(0);
    expect(operationsHandoffReadinessPacket.operationsHandoffReadinessPacket.counts.externalNotificationSendCount).toBe(0);
    expect(operationsHandoffReadinessPacket.operationsHandoffReadinessPacket.counts.aiCallCount).toBe(0);
    expect(operationsHandoffAcceptanceReceipt.operationsHandoffAcceptanceReceipt).toMatchObject({
      receiptKind: "qa-handoff-locked-archive-certified-release-operations-handoff-acceptance-receipt",
      operationsHandoffAcceptanceStatus: "accepted",
      operationsCustodyStatus: "accepted",
      noExecutionEvidenceStatus: "confirmed",
      launchApprovalLockStatus: "locked",
      tenantScopeStatus: "tenant_scoped",
      digestContinuityStatus: "confirmed",
      providerOutboundStatus: "absent",
      externalNotificationStatus: "absent",
      aiCallStatus: "absent",
      externalCalls: 0
    });
    expect(operationsHandoffAcceptanceReceipt.operationsHandoffAcceptanceReceipt.operationsHandoffAcceptanceReceiptDigest).toBe(operationsHandoffAcceptanceReceipt.operationsHandoffAcceptanceReceipt.safeDigest);
    expect(operationsHandoffAcceptanceReceipt.operationsHandoffAcceptanceReceipt.inheritedOperationsHandoffReadinessPacketSummary.operationsHandoffEvidencePacketDigest).toBe(operationsHandoffReadinessPacket.operationsHandoffReadinessPacket.operationsHandoffEvidencePacketDigest);
    expect(operationsHandoffAcceptanceReceipt.operationsHandoffAcceptanceReceipt.counts.operationsHandoffAcceptanceMutationCount).toBe(0);
    expect(operationsHandoffAcceptanceReceipt.operationsHandoffAcceptanceReceipt.counts.executionAttemptCount).toBe(0);
    expect(operationsHandoffAcceptanceReceipt.operationsHandoffAcceptanceReceipt.counts.providerOutboundCallCount).toBe(0);
    expect(operationsHandoffAcceptanceReceipt.operationsHandoffAcceptanceReceipt.counts.externalNotificationSendCount).toBe(0);
    expect(operationsHandoffAcceptanceReceipt.operationsHandoffAcceptanceReceipt.counts.aiCallCount).toBe(0);
    expect(operationsCustodyMonitoringReadinessLedger.operationsCustodyMonitoringReadinessLedger).toMatchObject({
      ledgerKind: "qa-handoff-locked-archive-certified-release-operations-custody-monitoring-readiness-ledger",
      operationsCustodyMonitoringStatus: "ready",
      operationsHandoffAcceptanceStatus: "accepted",
      operationsCustodyStatus: "accepted",
      noExecutionEvidenceStatus: "confirmed",
      launchApprovalLockStatus: "locked",
      tenantScopeStatus: "tenant_scoped",
      digestContinuityStatus: "confirmed",
      monitoringReadinessStatus: "ready",
      noExecutionMonitoringStatus: "active",
      providerOutboundStatus: "absent",
      externalNotificationStatus: "absent",
      aiCallStatus: "absent",
      externalCalls: 0
    });
    expect(operationsCustodyMonitoringReadinessLedger.operationsCustodyMonitoringReadinessLedger.operationsCustodyMonitoringLedgerDigest).toBe(operationsCustodyMonitoringReadinessLedger.operationsCustodyMonitoringReadinessLedger.safeDigest);
    expect(operationsCustodyMonitoringReadinessLedger.operationsCustodyMonitoringReadinessLedger.inheritedOperationsHandoffAcceptanceReceiptSummary.operationsHandoffAcceptanceReceiptDigest).toBe(operationsHandoffAcceptanceReceipt.operationsHandoffAcceptanceReceipt.operationsHandoffAcceptanceReceiptDigest);
    expect(operationsCustodyMonitoringReadinessLedger.operationsCustodyMonitoringReadinessLedger.counts.operationsCustodyMonitoringMutationCount).toBe(0);
    expect(operationsCustodyMonitoringReadinessLedger.operationsCustodyMonitoringReadinessLedger.counts.executionAttemptCount).toBe(0);
    expect(operationsCustodyMonitoringReadinessLedger.operationsCustodyMonitoringReadinessLedger.counts.providerOutboundCallCount).toBe(0);
    expect(operationsCustodyMonitoringReadinessLedger.operationsCustodyMonitoringReadinessLedger.counts.externalNotificationSendCount).toBe(0);
    expect(operationsCustodyMonitoringReadinessLedger.operationsCustodyMonitoringReadinessLedger.counts.aiCallCount).toBe(0);
    expect(operationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyMonitoringCloseoutSealReceipt).toMatchObject({
      receiptKind: "qa-handoff-locked-archive-certified-release-operations-custody-monitoring-closeout-seal-receipt",
      operationsCustodyMonitoringCloseoutStatus: "sealed",
      operationsCustodyMonitoringStatus: "ready",
      operationsHandoffAcceptanceStatus: "accepted",
      operationsCustodyStatus: "accepted",
      noExecutionEvidenceStatus: "confirmed",
      noExecutionMonitoringStatus: "active",
      launchApprovalLockStatus: "locked",
      tenantScopeStatus: "tenant_scoped",
      digestContinuityStatus: "confirmed",
      closeoutSealStatus: "sealed",
      externalCalls: 0
    });
    expect(operationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyMonitoringCloseoutSealReceiptDigest).toBe(operationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyMonitoringCloseoutSealReceipt.safeDigest);
    expect(operationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyMonitoringCloseoutSealReceipt.inheritedOperationsCustodyMonitoringReadinessLedgerSummary.operationsCustodyMonitoringLedgerDigest).toBe(operationsCustodyMonitoringReadinessLedger.operationsCustodyMonitoringReadinessLedger.operationsCustodyMonitoringLedgerDigest);
    expect(operationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyMonitoringCloseoutSealReceipt.counts.operationsCustodyMonitoringCloseoutSealMutationCount).toBe(0);
    expect(operationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyMonitoringCloseoutSealReceipt.counts.executionAttemptCount).toBe(0);
    expect(operationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyMonitoringCloseoutSealReceipt.counts.providerOutboundCallCount).toBe(0);
    expect(operationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyMonitoringCloseoutSealReceipt.counts.externalNotificationSendCount).toBe(0);
    expect(operationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyMonitoringCloseoutSealReceipt.counts.aiCallCount).toBe(0);
    expect(finalNoExecutionEvidenceRollup.finalNoExecutionEvidenceRollup).toMatchObject({
      rollupKind: "qa-handoff-locked-archive-certified-release-final-no-execution-evidence-rollup",
      finalNoExecutionEvidenceRollupStatus: "issued",
      operationsCustodyMonitoringCloseoutStatus: "sealed",
      closeoutSealStatus: "sealed",
      operationsCustodyMonitoringStatus: "ready",
      operationsHandoffAcceptanceStatus: "accepted",
      operationsCustodyStatus: "accepted",
      noExecutionEvidenceStatus: "confirmed",
      noExecutionMonitoringStatus: "active",
      launchApprovalLockStatus: "locked",
      tenantScopeStatus: "tenant_scoped",
      digestContinuityStatus: "confirmed",
      finalArchiveCustodyStatus: "sealed",
      externalCalls: 0
    });
    expect(finalNoExecutionEvidenceRollup.finalNoExecutionEvidenceRollup.finalNoExecutionEvidenceRollupDigest).toBe(finalNoExecutionEvidenceRollup.finalNoExecutionEvidenceRollup.safeDigest);
    expect(finalNoExecutionEvidenceRollup.finalNoExecutionEvidenceRollup.inheritedOperationsCustodyMonitoringCloseoutSealReceiptSummary.operationsCustodyMonitoringCloseoutSealReceiptDigest).toBe(operationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyMonitoringCloseoutSealReceiptDigest);
    expect(finalNoExecutionEvidenceRollup.finalNoExecutionEvidenceRollup.counts.finalNoExecutionEvidenceRollupMutationCount).toBe(0);
    expect(finalNoExecutionEvidenceRollup.finalNoExecutionEvidenceRollup.counts.executionAttemptCount).toBe(0);
    expect(finalNoExecutionEvidenceRollup.finalNoExecutionEvidenceRollup.counts.providerOutboundCallCount).toBe(0);
    expect(finalNoExecutionEvidenceRollup.finalNoExecutionEvidenceRollup.counts.externalNotificationSendCount).toBe(0);
    expect(finalNoExecutionEvidenceRollup.finalNoExecutionEvidenceRollup.counts.aiCallCount).toBe(0);
    expect(finalEvidenceIndexRegressionGuardrailReceipt.finalEvidenceIndexRegressionGuardrailReceipt).toMatchObject({
      receiptKind: "qa-handoff-locked-archive-certified-release-final-evidence-index-regression-guardrail-receipt",
      finalEvidenceIndexStatus: "issued",
      regressionGuardrailReceiptStatus: "issued",
      finalNoExecutionEvidenceRollupStatus: "issued",
      finalArchiveCustodyStatus: "sealed",
      operationsCustodyMonitoringCloseoutStatus: "sealed",
      closeoutSealStatus: "sealed",
      regressionGuardrailStatus: "passed",
      tenantScopeStatus: "tenant_scoped",
      digestContinuityStatus: "confirmed",
      externalCalls: 0
    });
    expect(finalEvidenceIndexRegressionGuardrailReceipt.finalEvidenceIndexRegressionGuardrailReceipt.finalEvidenceIndexRows.map((row) => row.sprintNumber)).toEqual([103, 104, 105, 106, 107, 108, 109, 110]);
    expect(finalEvidenceIndexRegressionGuardrailReceipt.finalEvidenceIndexRegressionGuardrailReceipt.counts.executionAttemptCount).toBe(0);
    expect(finalEvidenceIndexRegressionGuardrailReceipt.finalEvidenceIndexRegressionGuardrailReceipt.counts.providerOutboundCallCount).toBe(0);
    expect(finalEvidenceIndexRegressionGuardrailReceipt.finalEvidenceIndexRegressionGuardrailReceipt.counts.externalNotificationSendCount).toBe(0);
    expect(finalEvidenceIndexRegressionGuardrailReceipt.finalEvidenceIndexRegressionGuardrailReceipt.counts.aiCallCount).toBe(0);
    expect(finalArchiveSealOperationalClosureReceipt.finalArchiveSealOperationalClosureReceipt).toMatchObject({
      receiptKind: "qa-handoff-locked-archive-certified-release-final-archive-seal-operational-closure-receipt",
      finalOperationalClosureReceiptStatus: "issued",
      finalArchiveSealStatus: "sealed",
      releaseClosureStatus: "closed",
      finalEvidenceIndexStatus: "issued",
      regressionGuardrailReceiptStatus: "issued",
      regressionGuardrailStatus: "passed",
      tenantScopeStatus: "tenant_scoped",
      digestContinuityStatus: "confirmed",
      externalCalls: 0
    });
    expect(finalArchiveSealOperationalClosureReceipt.finalArchiveSealOperationalClosureReceipt.finalArchiveSealOperationalClosureRows.map((row) => row.sprintNumber)).toEqual([103, 104, 105, 106, 107, 108, 109, 110, 111]);
    expect(finalArchiveSealOperationalClosureReceipt.finalArchiveSealOperationalClosureReceipt.counts.finalOperationalClosureReceiptMutationCount).toBe(0);
    expect(finalArchiveSealOperationalClosureReceipt.finalArchiveSealOperationalClosureReceipt.counts.finalArchiveSealMutationCount).toBe(0);
    expect(finalArchiveSealOperationalClosureReceipt.finalArchiveSealOperationalClosureReceipt.counts.executionAttemptCount).toBe(0);
    expect(finalArchiveSealOperationalClosureReceipt.finalArchiveSealOperationalClosureReceipt.counts.providerOutboundCallCount).toBe(0);
    expect(finalArchiveSealOperationalClosureReceipt.finalArchiveSealOperationalClosureReceipt.counts.externalNotificationSendCount).toBe(0);
    expect(finalArchiveSealOperationalClosureReceipt.finalArchiveSealOperationalClosureReceipt.counts.aiCallCount).toBe(0);
    expect(postClosurePreservationVerificationReceipt.postClosurePreservationVerificationReceipt).toMatchObject({
      receiptKind: "qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-verification-receipt",
      postClosurePreservationVerificationStatus: "verified",
      finalArchiveSealPostClosurePreservationStatus: "preserved",
      finalArchiveSealStatus: "sealed",
      releaseClosureStatus: "closed",
      tenantScopeStatus: "tenant_scoped",
      digestContinuityStatus: "confirmed",
      externalCalls: 0
    });
    expect(postClosurePreservationVerificationReceipt.postClosurePreservationVerificationReceipt.postClosurePreservationVerificationRows.map((row) => row.sprintNumber)).toEqual([103, 104, 105, 106, 107, 108, 109, 110, 111, 112]);
    expect(postClosurePreservationVerificationReceipt.postClosurePreservationVerificationReceipt.counts.postClosurePreservationVerificationMutationCount).toBe(0);
    expect(postClosurePreservationVerificationReceipt.postClosurePreservationVerificationReceipt.counts.finalArchiveSealPostClosurePreservationMutationCount).toBe(0);
    expect(postClosurePreservationVerificationReceipt.postClosurePreservationVerificationReceipt.counts.executionAttemptCount).toBe(0);
    expect(postClosurePreservationVerificationReceipt.postClosurePreservationVerificationReceipt.counts.providerOutboundCallCount).toBe(0);
    expect(postClosurePreservationVerificationReceipt.postClosurePreservationVerificationReceipt.counts.externalNotificationSendCount).toBe(0);
    expect(postClosurePreservationVerificationReceipt.postClosurePreservationVerificationReceipt.counts.aiCallCount).toBe(0);
    expect(postClosurePreservationContinuityLedgerReceipt.postClosurePreservationContinuityLedgerReceipt).toMatchObject({
      receiptKind: "qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-continuity-ledger-receipt",
      postClosurePreservationContinuityLedgerStatus: "continuous",
      postClosurePreservationVerificationStatus: "verified",
      finalArchiveSealPostClosurePreservationStatus: "preserved",
      finalArchiveSealStatus: "sealed",
      releaseClosureStatus: "closed",
      tenantScopeStatus: "tenant_scoped",
      digestContinuityStatus: "confirmed",
      externalCalls: 0
    });
    expect(postClosurePreservationContinuityLedgerReceipt.postClosurePreservationContinuityLedgerReceipt.postClosurePreservationVerificationDigest).toBe(postClosurePreservationVerificationReceipt.postClosurePreservationVerificationReceipt.safeDigest);
    expect(postClosurePreservationContinuityLedgerReceipt.postClosurePreservationContinuityLedgerReceipt.preservationContinuityLedgerRows.map((row) => row.sprintNumber)).toEqual([103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113]);
    expect(postClosurePreservationContinuityLedgerReceipt.postClosurePreservationContinuityLedgerReceipt.counts.preservationContinuityLedgerMutationCount).toBe(0);
    expect(postClosurePreservationContinuityLedgerReceipt.postClosurePreservationContinuityLedgerReceipt.counts.executionAttemptCount).toBe(0);
    expect(postClosurePreservationContinuityLedgerReceipt.postClosurePreservationContinuityLedgerReceipt.counts.providerOutboundCallCount).toBe(0);
    expect(postClosurePreservationContinuityLedgerReceipt.postClosurePreservationContinuityLedgerReceipt.counts.externalNotificationSendCount).toBe(0);
    expect(postClosurePreservationContinuityLedgerReceipt.postClosurePreservationContinuityLedgerReceipt.counts.aiCallCount).toBe(0);
    expect(postClosurePreservationCustodyAuditReceipt.postClosurePreservationCustodyAuditReceipt).toMatchObject({
      receiptKind: "qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-audit-receipt",
      postClosurePreservationCustodyAuditStatus: "audited",
      postClosurePreservationContinuityLedgerStatus: "continuous",
      postClosurePreservationVerificationStatus: "verified",
      tenantScopeStatus: "tenant_scoped",
      digestContinuityStatus: "confirmed",
      externalCalls: 0
    });
    expect(postClosurePreservationCustodyAuditReceipt.postClosurePreservationCustodyAuditReceipt.postClosurePreservationContinuityLedgerDigest).toBe(postClosurePreservationContinuityLedgerReceipt.postClosurePreservationContinuityLedgerReceipt.safeDigest);
    expect(postClosurePreservationCustodyAuditReceipt.postClosurePreservationCustodyAuditReceipt.custodyAuditRows.map((row) => row.sprintNumber)).toEqual([103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114]);
    expect(postClosurePreservationCustodyAuditReceipt.postClosurePreservationCustodyAuditReceipt.counts.postClosurePreservationCustodyAuditMutationCount).toBe(0);
    expect(postClosurePreservationCustodyAuditReceipt.postClosurePreservationCustodyAuditReceipt.counts.executionAttemptCount).toBe(0);
    expect(postClosurePreservationCustodyAuditReceipt.postClosurePreservationCustodyAuditReceipt.counts.providerOutboundCallCount).toBe(0);
    expect(postClosurePreservationCustodyAuditReceipt.postClosurePreservationCustodyAuditReceipt.counts.externalNotificationSendCount).toBe(0);
    expect(postClosurePreservationCustodyAuditReceipt.postClosurePreservationCustodyAuditReceipt.counts.aiCallCount).toBe(0);
    expect(postClosurePreservationCustodyChainSealReceipt.postClosurePreservationCustodyChainSealReceipt).toMatchObject({
      receiptKind: "qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-chain-seal-receipt",
      postClosurePreservationCustodyChainSealStatus: "sealed",
      postClosurePreservationCustodyAuditStatus: "audited",
      postClosurePreservationContinuityLedgerStatus: "continuous",
      postClosurePreservationVerificationStatus: "verified",
      tenantScopeStatus: "tenant_scoped",
      externalCalls: 0
    });
    expect(postClosurePreservationCustodyChainSealReceipt.postClosurePreservationCustodyChainSealReceipt.postClosurePreservationCustodyAuditDigest).toBe(postClosurePreservationCustodyAuditReceipt.postClosurePreservationCustodyAuditReceipt.safeDigest);
    expect(postClosurePreservationCustodyChainSealReceipt.postClosurePreservationCustodyChainSealReceipt.custodyChainSealRows.map((row) => row.sprintNumber)).toEqual([103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115]);
    expect(postClosurePreservationCustodyChainSealReceipt.postClosurePreservationCustodyChainSealReceipt.counts.postClosurePreservationCustodyChainSealMutationCount).toBe(0);
    expect(postClosurePreservationCustodyChainSealReceipt.postClosurePreservationCustodyChainSealReceipt.counts.executionAttemptCount).toBe(0);
    expect(postClosurePreservationCustodyChainSealReceipt.postClosurePreservationCustodyChainSealReceipt.counts.providerOutboundCallCount).toBe(0);
    expect(postClosurePreservationCustodyChainSealReceipt.postClosurePreservationCustodyChainSealReceipt.counts.externalNotificationSendCount).toBe(0);
    expect(postClosurePreservationCustodyChainSealReceipt.postClosurePreservationCustodyChainSealReceipt.counts.aiCallCount).toBe(0);
    expect(postClosurePreservationCustodyChainIntegrityLedgerReceipt.mode).toBe("api");
    expect(postClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainIntegrityLedgerReceipt).toMatchObject({
      receiptKind: "qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-chain-integrity-ledger-receipt",
      postClosurePreservationCustodyChainIntegrityLedgerStatus: "integrity_confirmed",
      postClosurePreservationCustodyChainSealStatus: "sealed",
      postClosurePreservationCustodyAuditStatus: "audited",
      postClosurePreservationContinuityLedgerStatus: "continuous",
      postClosurePreservationVerificationStatus: "verified",
      tenantScopeStatus: "tenant_scoped",
      providerOutboundStatus: "absent",
      externalNotificationStatus: "absent",
      aiCallStatus: "absent",
      externalCalls: 0
    });
    expect(postClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainIntegrityLedgerReceipt.safeFilename).toBe("provider-webhook-certified-release-post-closure-preservation-custody-chain-integrity-ledger-receipt.json");
    expect(postClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainIntegrityLedgerDigest).toBe(postClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainIntegrityLedgerReceipt.safeDigest);
    expect(postClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainSealDigest).toBe(postClosurePreservationCustodyChainSealReceipt.postClosurePreservationCustodyChainSealReceipt.safeDigest);
    expect(postClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainIntegrityLedgerReceipt.custodyChainIntegrityLedgerRows.map((row) => row.sprintNumber)).toEqual([103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116]);
    expect(postClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainIntegrityLedgerReceipt.custodyChainIntegrityLedgerRows.every((row) => row.externalCalls === 0 && row.providerOutboundCallCount === 0 && row.externalNotificationSendCount === 0 && row.aiCallCount === 0 && row.mutationCount === 0 && row.custodyChainIntegrityLedgerStatus === "integrity_confirmed_under_safe_custody")).toBe(true);
    expect(postClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainIntegrityLedgerReceipt.inheritedPostClosurePreservationCustodyChainSealReceiptSummary.externalCallsZero).toBe(true);
    expect(postClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainIntegrityLedgerReceipt.counts.postClosurePreservationCustodyChainIntegrityLedgerMutationCount).toBe(0);
    expect(postClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainIntegrityLedgerReceipt.counts.postClosurePreservationCustodyChainSealMutationCount).toBe(0);
    expect(postClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainIntegrityLedgerReceipt.counts.executionAttemptCount).toBe(0);
    expect(postClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainIntegrityLedgerReceipt.counts.providerOutboundCallCount).toBe(0);
    expect(postClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainIntegrityLedgerReceipt.counts.externalNotificationSendCount).toBe(0);
    expect(postClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainIntegrityLedgerReceipt.counts.aiCallCount).toBe(0);
    expect(postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt.postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt.safeDigest).toContain("safeqahandoffcertifiedreleasefinalarchivesealpostclosurepreservationcustodychainintegrityledgercontinuityverificationreceipt");
    expect(postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt.postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt.receiptStatus).toBe("issued");
    expect(postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt.postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt.verificationStatus).toBe("verified");
    expect(postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt.postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt.sourceSprint).toBe(117);
    expect(postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt.postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt.derivedFrom.safeDigest).toBe(postClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.postClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.safeDigest);
    expect(postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt.postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt.verificationRows.map((row) => row.sprintNumber)).toEqual([103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118]);
    expect(postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt.postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt.counts.verificationRowCount).toBe(16);
    expect(postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt.postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt.noExecutionFlags.providerOutboundCallCount).toBe(0);
    expect(postClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.mode).toBe("api");
    expect(postClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.postClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt).toMatchObject({
      receiptKind: "qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-chain-integrity-ledger-continuity-receipt",
      postClosurePreservationCustodyChainIntegrityLedgerContinuityStatus: "continuity_confirmed",
      postClosurePreservationCustodyChainIntegrityLedgerStatus: "integrity_confirmed",
      redactionStatus: "passed",
      tenantScopeStatus: "tenant_scoped",
      externalCalls: 0
    });
    expect(postClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.postClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.sprint116ReceiptReference.safeDigest).toBe(postClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainIntegrityLedgerReceipt.safeDigest);
    expect(postClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.postClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.sealedArchiveReference.safeDigest).toBe(postClosurePreservationCustodyChainSealReceipt.postClosurePreservationCustodyChainSealReceipt.safeDigest);
    expect(postClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.postClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.safeRowSummaries.map((row) => row.sprintNumber)).toEqual([103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117]);
    expect(postClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.postClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.counts.custodyChainIntegrityLedgerContinuityRowCount).toBe(15);
    expect(postClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.postClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.counts.custodyChainIntegrityLedgerContinuitySafeCount).toBe(15);
    expect(postClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.postClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.noExecutionFlags.providerOutboundCallCount).toBe(0);
    expect(postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt.mode).toBe("api");
    expect(postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt.postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt).toMatchObject({
      receiptKind: "qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-chain-integrity-ledger-continuity-verification-receipt",
      receiptStatus: "issued",
      verificationStatus: "verified",
      continuityStatus: "continuity_confirmed",
      custodyChainStatus: "sealed",
      ledgerIntegrityStatus: "integrity_confirmed",
      noExecutionStatus: "confirmed",
      sourceSprint: 117,
      externalCalls: 0
    });
    expect(postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt.postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt.derivedFrom.safeDigest).toBe(postClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.postClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.safeDigest);
    expect(postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt.postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt.sprint117ReceiptDigest).toBe(postClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.postClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.safeDigest);
    expect(postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt.postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt.verificationRows.map((row) => row.sprintNumber)).toEqual([103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118]);
    expect(postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt.postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt.counts.verificationRowCount).toBe(16);
    expect(postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt.postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt.counts.verificationSafeCount).toBe(16);
    expect(postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt.postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt.noExecutionFlags.providerOutboundCallCount).toBe(0);
    expect(postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceipt.mode).toBe("api");
    expect(postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceipt.postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceipt).toMatchObject({
      receiptKind: "qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-chain-integrity-ledger-continuity-verification-audit-receipt",
      receiptStatus: "issued",
      auditStatus: "audited",
      verificationStatus: "verified",
      continuityStatus: "continuity_confirmed",
      custodyChainStatus: "sealed",
      ledgerIntegrityStatus: "integrity_confirmed",
      noExecutionStatus: "confirmed",
      sourceSprint: 118,
      externalCalls: 0
    });
    expect(postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceipt.postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceipt.derivedFrom.safeDigest).toBe(postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt.postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt.safeDigest);
    expect(postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceipt.postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceipt.sprint118ReceiptDigest).toBe(postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt.postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt.safeDigest);
    expect(postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceipt.postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceipt.sprint117ReceiptDigest).toBe(postClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.postClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.safeDigest);
    expect(postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceipt.postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceipt.auditRows.map((row) => row.sprintNumber)).toEqual([103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119]);
    expect(postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceipt.postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceipt.counts.auditRowCount).toBe(17);
    expect(postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceipt.postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceipt.counts.auditSafeCount).toBe(17);
    expect(postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceipt.postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceipt.noExecutionFlags.providerOutboundCallCount).toBe(0);
    expect(JSON.stringify({ finalization, signOff, receipt, releaseEvidence, releaseVerification, releaseCertification, closureLedger, attestationAudit, reconciliation, releaseGate, decisionReceipt, handoffPacket, acceptanceRecord, acknowledgedRecord, noopDryRun, executedNoopDryRun, resultLedger, finalReadinessCertificate, freezeAuditRegister, rollbackRehearsalReceipt, controlRoomPacket, cutoverChecklistReceipt, operatorCommandReceipt, goLiveAuthorizationReceipt, launchWindowConfirmationReceipt, goLiveHoldReleaseAuthorizationReceipt, launchApprovalReceipt, noExecutionLockReceipt, operationsHandoffReadinessPacket, operationsHandoffAcceptanceReceipt, operationsCustodyMonitoringReadinessLedger, operationsCustodyMonitoringCloseoutSealReceipt, finalNoExecutionEvidenceRollup, finalEvidenceIndexRegressionGuardrailReceipt, finalArchiveSealOperationalClosureReceipt, postClosurePreservationVerificationReceipt, postClosurePreservationContinuityLedgerReceipt, postClosurePreservationCustodyAuditReceipt, postClosurePreservationCustodyChainSealReceipt, postClosurePreservationCustodyChainIntegrityLedgerReceipt, postClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt, postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt, postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceipt })).not.toMatch(/providerRaw|payloadJson|raw-room|raw-sender|raw room|raw sender|accessToken|webhookSecret|bearer|"token"\s*:|"secret"\s*:|"replyToken"\s*:|"rawPayload"\s*:|"rawSignature"\s*:/i);
  });

  it("does not fallback to mock archive finalization or retention sign-off when API mode fails", async () => {
    api.getProviderWebhookReviewQaHandoffArchiveFinalization.mockRejectedValueOnce(new Error("API request failed (503): archive finalization unavailable"));
    api.signOffProviderWebhookReviewQaHandoffArchiveFinalization.mockRejectedValueOnce(new Error("API request failed (503): retention sign-off unavailable"));
    api.getProviderWebhookReviewQaHandoffArchiveFinalizationReceipt.mockRejectedValueOnce(new Error("API request failed (503): finalization receipt unavailable"));
    api.getProviderWebhookReviewQaHandoffArchiveReleaseEvidence.mockRejectedValueOnce(new Error("API request failed (503): release evidence unavailable"));
    api.getProviderWebhookReviewQaHandoffArchiveReleaseVerification.mockRejectedValueOnce(new Error("API request failed (503): release verification unavailable"));
    api.getProviderWebhookReviewQaHandoffArchiveReleaseCertification.mockRejectedValueOnce(new Error("API request failed (503): release certification unavailable"));
    api.getProviderWebhookReviewQaHandoffArchiveReleaseClosureLedger.mockRejectedValueOnce(new Error("API request failed (503): release closure ledger unavailable"));
    api.getProviderWebhookReviewQaHandoffArchiveReleaseAttestationAudit.mockRejectedValueOnce(new Error("API request failed (503): release attestation audit unavailable"));
    api.getProviderWebhookReviewQaHandoffArchiveReleaseAttestationReconciliation.mockRejectedValueOnce(new Error("API request failed (503): release attestation reconciliation unavailable"));
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseGate.mockRejectedValueOnce(new Error("API request failed (503): certified release gate unavailable"));
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseDecisionReceipt.mockRejectedValueOnce(new Error("API request failed (503): certified release decision receipt unavailable"));
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket.mockRejectedValueOnce(new Error("API request failed (503): certified release handoff packet unavailable"));
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord.mockRejectedValueOnce(new Error("API request failed (503): certified release handoff acceptance record unavailable"));
    api.acknowledgeProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord.mockRejectedValueOnce(new Error("API request failed (503): certified release handoff acceptance acknowledgement unavailable"));
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun.mockRejectedValueOnce(new Error("API request failed (503): certified release no-op dry-run unavailable"));
    api.runProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun.mockRejectedValueOnce(new Error("API request failed (503): certified release no-op dry-run run unavailable"));
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedger.mockRejectedValueOnce(new Error("API request failed (503): certified release dry-run result ledger unavailable"));
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificate.mockRejectedValueOnce(new Error("API request failed (503): certified release final readiness certificate unavailable"));
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister.mockRejectedValueOnce(new Error("API request failed (503): certified release freeze audit register unavailable"));
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt.mockRejectedValueOnce(new Error("API request failed (503): certified release rollback rehearsal receipt unavailable"));
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseControlRoomPacket.mockRejectedValueOnce(new Error("API request failed (503): certified release control room packet unavailable"));
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceipt.mockRejectedValueOnce(new Error("API request failed (503): certified release cutover checklist receipt unavailable"));
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceipt.mockRejectedValueOnce(new Error("API request failed (503): certified release operator command receipt unavailable"));
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceipt.mockRejectedValueOnce(new Error("API request failed (503): certified release go-live authorization receipt unavailable"));
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceipt.mockRejectedValueOnce(new Error("API request failed (503): certified release launch window confirmation receipt unavailable"));
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceipt.mockRejectedValueOnce(new Error("API request failed (503): certified release go-live hold release authorization receipt unavailable"));
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceipt.mockRejectedValueOnce(new Error("API request failed (503): certified release launch approval receipt unavailable"));
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceipt.mockRejectedValueOnce(new Error("API request failed (503): certified release launch approval no-execution lock receipt unavailable"));
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacket.mockRejectedValueOnce(new Error("API request failed (503): certified release operations handoff readiness packet unavailable"));
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceReceipt.mockRejectedValueOnce(new Error("API request failed (503): certified release operations handoff acceptance receipt unavailable"));
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedger.mockRejectedValueOnce(new Error("API request failed (503): certified release operations custody monitoring readiness ledger unavailable"));
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.mockRejectedValueOnce(new Error("API request failed (503): certified release operations custody monitoring closeout seal receipt unavailable"));
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollup.mockRejectedValueOnce(new Error("API request failed (503): certified release final no-execution evidence rollup unavailable"));
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt.mockRejectedValueOnce(new Error("API request failed (503): certified release final evidence index regression guardrail receipt unavailable"));
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceipt.mockRejectedValueOnce(new Error("API request failed (503): certified release post-closure preservation verification receipt unavailable"));
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceipt.mockRejectedValueOnce(new Error("API request failed (503): certified release post-closure preservation continuity ledger receipt unavailable"));
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceipt.mockRejectedValueOnce(new Error("API request failed (503): certified release post-closure preservation custody audit receipt unavailable"));
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealReceipt.mockRejectedValueOnce(new Error("API request failed (503): certified release post-closure preservation custody chain seal receipt unavailable"));
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerReceipt.mockRejectedValueOnce(new Error("API request failed (503): certified release post-closure preservation custody chain integrity ledger receipt unavailable"));
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.mockRejectedValueOnce(new Error("API request failed (503): certified release post-closure preservation custody chain integrity ledger continuity receipt unavailable"));
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt.mockRejectedValueOnce(new Error("API request failed (503): certified release post-closure preservation custody chain integrity ledger continuity verification receipt unavailable"));
    api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceipt.mockRejectedValueOnce(new Error("API request failed (503): certified release post-closure preservation custody chain integrity ledger continuity verification audit receipt unavailable"));

    await expect(loadSettingsProviderWebhookReviewQaHandoffArchiveFinalizationData("api", { provider: "line" }))
      .rejects.toThrow("archive finalization unavailable");
    await expect(signOffSettingsProviderWebhookReviewQaHandoffArchiveFinalization("api", { provider: "line" }))
      .rejects.toThrow("retention sign-off unavailable");
    await expect(loadSettingsProviderWebhookReviewQaHandoffArchiveFinalizationReceiptData("api", { provider: "line" }))
      .rejects.toThrow("finalization receipt unavailable");
    await expect(loadSettingsProviderWebhookReviewQaHandoffArchiveReleaseEvidenceData("api", { provider: "line" }))
      .rejects.toThrow("release evidence unavailable");
    await expect(loadSettingsProviderWebhookReviewQaHandoffArchiveReleaseVerificationData("api", { provider: "line" }))
      .rejects.toThrow("release verification unavailable");
    await expect(loadSettingsProviderWebhookReviewQaHandoffArchiveReleaseCertificationData("api", { provider: "line" }))
      .rejects.toThrow("release certification unavailable");
    await expect(loadSettingsProviderWebhookReviewQaHandoffArchiveReleaseClosureLedgerData("api", { provider: "line" }))
      .rejects.toThrow("release closure ledger unavailable");
    await expect(loadSettingsProviderWebhookReviewQaHandoffArchiveReleaseAttestationAuditData("api", { provider: "line" }))
      .rejects.toThrow("release attestation audit unavailable");
    await expect(loadSettingsProviderWebhookReviewQaHandoffArchiveReleaseAttestationReconciliationData("api", { provider: "line" }))
      .rejects.toThrow("release attestation reconciliation unavailable");
    await expect(loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseGateData("api", { provider: "line" }))
      .rejects.toThrow("certified release gate unavailable");
    await expect(loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptData("api", { provider: "line" }))
      .rejects.toThrow("certified release decision receipt unavailable");
    await expect(loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacketData("api", { provider: "line" }))
      .rejects.toThrow("certified release handoff packet unavailable");
    await expect(loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordData("api", { provider: "line" }))
      .rejects.toThrow("certified release handoff acceptance record unavailable");
    await expect(acknowledgeSettingsProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord("api", { provider: "line" }, {
      acknowledgementType: "operator_checklist_acknowledgement",
      acknowledgedChecklistKeys: ["decision_receipt_issued"]
    })).rejects.toThrow("certified release handoff acceptance acknowledgement unavailable");
    await expect(loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunData("api", { provider: "line" }))
      .rejects.toThrow("certified release no-op dry-run unavailable");
    await expect(runSettingsProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun("api", { provider: "line" }, {
      checklistAcknowledged: true,
      executionMode: "no_op"
    })).rejects.toThrow("certified release no-op dry-run run unavailable");
    await expect(loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerData("api", { provider: "line" }))
      .rejects.toThrow("certified release dry-run result ledger unavailable");
    await expect(loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificateData("api", { provider: "line" }))
      .rejects.toThrow("certified release final readiness certificate unavailable");
    await expect(loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegisterData("api", { provider: "line" }))
      .rejects.toThrow("certified release freeze audit register unavailable");
    await expect(loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptData("api", { provider: "line" }))
      .rejects.toThrow("certified release rollback rehearsal receipt unavailable");
    await expect(loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseControlRoomPacketData("api", { provider: "line" }))
      .rejects.toThrow("certified release control room packet unavailable");
    await expect(loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceiptData("api", { provider: "line" }))
      .rejects.toThrow("certified release cutover checklist receipt unavailable");
    await expect(loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceiptData("api", { provider: "line" }))
      .rejects.toThrow("certified release operator command receipt unavailable");
    await expect(loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceiptData("api", { provider: "line" }))
      .rejects.toThrow("certified release go-live authorization receipt unavailable");
    await expect(loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceiptData("api", { provider: "line" }))
      .rejects.toThrow("certified release launch window confirmation receipt unavailable");
    await expect(loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceiptData("api", { provider: "line" }))
      .rejects.toThrow("certified release go-live hold release authorization receipt unavailable");
    await expect(loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceiptData("api", { provider: "line" }))
      .rejects.toThrow("certified release launch approval receipt unavailable");
    await expect(loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceiptData("api", { provider: "line" }))
      .rejects.toThrow("certified release launch approval no-execution lock receipt unavailable");
    await expect(loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacketData("api", { provider: "line" }))
      .rejects.toThrow("certified release operations handoff readiness packet unavailable");
    await expect(loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceReceiptData("api", { provider: "line" }))
      .rejects.toThrow("certified release operations handoff acceptance receipt unavailable");
    await expect(loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedgerData("api", { provider: "line" }))
      .rejects.toThrow("certified release operations custody monitoring readiness ledger unavailable");
    await expect(loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceiptData("api", { provider: "line" }))
      .rejects.toThrow("certified release operations custody monitoring closeout seal receipt unavailable");
    await expect(loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollupData("api", { provider: "line" }))
      .rejects.toThrow("certified release final no-execution evidence rollup unavailable");
    await expect(loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceiptData("api", { provider: "line" }))
      .rejects.toThrow("certified release final evidence index regression guardrail receipt unavailable");
    await expect(loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceiptData("api", { provider: "line" }))
      .rejects.toThrow("certified release post-closure preservation verification receipt unavailable");
    await expect(loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceiptData("api", { provider: "line" }))
      .rejects.toThrow("certified release post-closure preservation continuity ledger receipt unavailable");
    await expect(loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceiptData("api", { provider: "line" }))
      .rejects.toThrow("certified release post-closure preservation custody audit receipt unavailable");
    await expect(loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealReceiptData("api", { provider: "line" }))
      .rejects.toThrow("certified release post-closure preservation custody chain seal receipt unavailable");
    await expect(loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerReceiptData("api", { provider: "line" }))
      .rejects.toThrow("certified release post-closure preservation custody chain integrity ledger receipt unavailable");
    await expect(loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityReceiptData("api", { provider: "line" }))
      .rejects.toThrow("certified release post-closure preservation custody chain integrity ledger continuity receipt unavailable");
    await expect(loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceiptData("api", { provider: "line" }))
      .rejects.toThrow("certified release post-closure preservation custody chain integrity ledger continuity verification receipt unavailable");
    await expect(loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceiptData("api", { provider: "line" }))
      .rejects.toThrow("certified release post-closure preservation custody chain integrity ledger continuity verification audit receipt unavailable");
  });

  it("loads a safe Sprint 119 continuity verification audit receipt in mock mode", async () => {
    const result = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceiptData("mock", { provider: "line", eventType: "message.created" });

    expect(result.mode).toBe("mock");
    expect(result.postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceipt).toMatchObject({
      receiptKind: "qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-chain-integrity-ledger-continuity-verification-audit-receipt",
      sourceSprint: 118,
      externalCalls: 0
    });
    expect(["issued", "blocked", "incomplete"]).toContain(result.postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceipt.receiptStatus);
    expect(["audited", "blocked", "incomplete"]).toContain(result.postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceipt.auditStatus);
    expect(result.postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceipt.safeDigest).toContain("mockqahandoffcertifiedreleasefinalarchivesealpostclosurepreservationcustodychainintegrityledgercontinuityverificationauditreceipt");
    expect(result.postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceipt.derivedFrom.sourceSprint).toBe(118);
    expect(result.postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceipt.auditRows.map((row) => row.sprintNumber)).toEqual([103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119]);
    expect(result.postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceipt.counts.auditRowCount).toBe(17);
    expect(result.postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceipt.noExecutionFlags.providerOutboundCallCount).toBe(0);
    expect(JSON.stringify(result)).not.toMatch(/providerRaw|payloadJson|raw-room|raw-sender|raw room|raw sender|accessToken|webhookSecret|bearer|"token"\s*:|"secret"\s*:|"replyToken"\s*:|"rawPayload"\s*:|"rawSignature"\s*:/i);
  });

  it("loads and mutates saved views and operator notes through API mode without local fallback", async () => {
    api.getProviderWebhookReviewSavedViews.mockResolvedValueOnce([providerWebhookReviewSavedViewResponse("provider-webhook-review-view-api")]);
    api.createProviderWebhookReviewSavedView.mockResolvedValueOnce(providerWebhookReviewSavedViewResponse("provider-webhook-review-view-created"));
    api.archiveProviderWebhookReviewSavedView.mockResolvedValueOnce({
      ...providerWebhookReviewSavedViewResponse("provider-webhook-review-view-created"),
      archived: true,
      isDefault: false
    });
    api.getProviderWebhookOperatorNotes.mockResolvedValueOnce([providerWebhookOperatorNoteResponse("provider-webhook-operator-note-api")]);
    api.createProviderWebhookOperatorNote.mockResolvedValueOnce(providerWebhookOperatorNoteResponse("provider-webhook-operator-note-created"));

    const savedViews = await loadSettingsProviderWebhookSavedViewsData("api");
    const createdView = await createSettingsProviderWebhookSavedView("api", {
      name: "Safe queue view",
      filters: {
        provider: "line",
        reviewStatus: "pending",
        assignmentStatus: "assigned_to_me",
        escalationStatus: "escalated",
        escalationReason: "SLA_RISK",
        pageSize: 10
      },
      sort: {
        sortBy: "receivedAt",
        sortDirection: "desc"
      }
    });
    const archivedView = await archiveSettingsProviderWebhookSavedView("api", "provider-webhook-review-view-created");
    const notes = await loadSettingsProviderWebhookOperatorNotesData("api", "provider-webhook-unmatched-api");
    const createdNote = await createSettingsProviderWebhookOperatorNote("api", "provider-webhook-unmatched-api", {
      note: "Checked safely with local context only."
    });

    expect(api.getProviderWebhookReviewSavedViews).toHaveBeenCalled();
    expect(api.createProviderWebhookReviewSavedView).toHaveBeenCalledWith(expect.objectContaining({
      name: "Safe queue view",
      filters: expect.objectContaining({
        provider: "line",
        assignmentStatus: "assigned_to_me",
        escalationStatus: "escalated",
        escalationReason: "SLA_RISK",
        pageSize: 10
      })
    }));
    expect(api.archiveProviderWebhookReviewSavedView).toHaveBeenCalledWith("provider-webhook-review-view-created");
    expect(api.getProviderWebhookOperatorNotes).toHaveBeenCalledWith("provider-webhook-unmatched-api");
    expect(api.createProviderWebhookOperatorNote).toHaveBeenCalledWith("provider-webhook-unmatched-api", {
      note: "Checked safely with local context only."
    });
    expect(savedViews.mode).toBe("api");
    expect(savedViews.savedViews[0]).toMatchObject({ filters: { provider: "line" }, externalCalls: 0 });
    expect(createdView.externalCalls).toBe(0);
    expect(archivedView.archived).toBe(true);
    expect(notes.notes[0]).toMatchObject({ unmatchedId: "provider-webhook-unmatched-api", externalCalls: 0 });
    expect(createdNote.note).toBe("Checked safely with local context only.");
    expect(JSON.stringify({ savedViews, createdView, archivedView, notes, createdNote })).not.toMatch(/token|secret|authorization|cookie|providerRaw|rawPayload|payloadJson|replyToken|raw-room|raw-sender|raw room|raw sender|senderId|roomId/i);
  });

  it("surfaces API-mode history and export failures without mutating mock state", async () => {
    const before = JSON.stringify(mockProviderWebhookUnmatchedInbound);
    api.getProviderWebhookUnmatchedInboundHistory.mockRejectedValueOnce(new Error("API request failed (503): history unavailable"));

    await expect(loadSettingsProviderWebhookHistoryData("api", "provider-webhook-unmatched-local-1"))
      .rejects.toThrow("history unavailable");

    api.getProviderWebhookUnmatchedInboundExport.mockRejectedValueOnce(new Error("API request failed (503): export unavailable"));

    await expect(exportSettingsProviderWebhookUnmatchedInboundData("api", { format: "json" }))
      .rejects.toThrow("export unavailable");

    expect(JSON.stringify(mockProviderWebhookUnmatchedInbound)).toBe(before);
  });

  it("surfaces API-mode metrics and diagnostics failures without mutating mock state", async () => {
    const before = JSON.stringify(mockProviderWebhookUnmatchedInbound);
    api.getProviderWebhookReviewMetrics.mockRejectedValueOnce(new Error("API request failed (503): metrics unavailable"));

    await expect(loadSettingsProviderWebhookReviewMetricsData("api", { provider: "line" }))
      .rejects.toThrow("metrics unavailable");

    api.getProviderWebhookReviewAlerts.mockRejectedValueOnce(new Error("API request failed (503): alerts unavailable"));

    await expect(loadSettingsProviderWebhookReviewAlertsData("api", { provider: "line" }))
      .rejects.toThrow("alerts unavailable");

    api.getProviderWebhookReviewTriage.mockRejectedValueOnce(new Error("API request failed (503): triage unavailable"));

    await expect(loadSettingsProviderWebhookReviewTriageData("api", { provider: "line" }))
      .rejects.toThrow("triage unavailable");

    api.getProviderWebhookReviewWorkload.mockRejectedValueOnce(new Error("API request failed (503): workload unavailable"));

    await expect(loadSettingsProviderWebhookReviewWorkloadData("api", { provider: "line" }))
      .rejects.toThrow("workload unavailable");

    api.getProviderWebhookReviewResolutionSummary.mockRejectedValueOnce(new Error("API request failed (503): resolution summary unavailable"));

    await expect(loadSettingsProviderWebhookReviewResolutionSummaryData("api", { provider: "line" }))
      .rejects.toThrow("resolution summary unavailable");

    api.getProviderWebhookUnmatchedInboundDiagnostics.mockRejectedValueOnce(new Error("API request failed (503): diagnostics unavailable"));

    await expect(loadSettingsProviderWebhookDiagnosticsData("api", "provider-webhook-unmatched-local-1"))
      .rejects.toThrow("diagnostics unavailable");

    api.getProviderWebhookReviewSavedViews.mockRejectedValueOnce(new Error("API request failed (503): saved views unavailable"));

    await expect(loadSettingsProviderWebhookSavedViewsData("api"))
      .rejects.toThrow("saved views unavailable");

    api.getProviderWebhookOperatorNotes.mockRejectedValueOnce(new Error("API request failed (503): operator notes unavailable"));

    await expect(loadSettingsProviderWebhookOperatorNotesData("api", "provider-webhook-unmatched-local-1"))
      .rejects.toThrow("operator notes unavailable");

    expect(JSON.stringify(mockProviderWebhookUnmatchedInbound)).toBe(before);
  });

  it("creates provider webhook sandbox events through API mode without local fallback", async () => {
    api.createProviderWebhookSandboxEvent.mockResolvedValueOnce(providerWebhookEventResponse("provider-webhook-event-created", "telegram"));

    const event = await createSettingsProviderWebhookSandboxEvent("api", {
      provider: "telegram",
      eventType: "webhook.verified",
      mode: "dry_run",
      payload: { updateId: "safe-update", token: "sensitive-sample-a" }
    });

    expect(api.createProviderWebhookSandboxEvent).toHaveBeenCalledWith(expect.objectContaining({
      provider: "telegram",
      eventType: "webhook.verified",
      mode: "dry_run"
    }));
    expect(event.provider).toBe("telegram");
    expect(event.externalCalls).toBe(0);
    expect(JSON.stringify(event)).not.toContain("sensitive-sample-a");
  });

  it("runs unmatched review and link actions through API mode without local fallback", async () => {
    api.reviewProviderWebhookUnmatchedInbound.mockResolvedValueOnce({
      ...providerWebhookUnmatchedInboundResponse("provider-webhook-unmatched-api"),
      unmatchedStatus: "reviewed",
      reviewStatus: "reviewed"
    });
    api.linkProviderWebhookUnmatchedInboundConversation.mockResolvedValueOnce({
      ...providerWebhookUnmatchedInboundResponse("provider-webhook-unmatched-api"),
      unmatchedStatus: "linked",
      reviewStatus: "linked",
      linkStatus: "linked",
      linkedConversationId: "conversation-safe-internal"
    });
    api.bulkReviewProviderWebhookUnmatchedInbound.mockResolvedValueOnce(providerWebhookBulkReviewResponse("reviewed"));

    const reviewed = await reviewSettingsProviderWebhookUnmatchedInbound("api", "provider-webhook-unmatched-api", {
      status: "reviewed",
      reason: "safe review"
    });
    const linked = await linkSettingsProviderWebhookUnmatchedInboundConversation("api", "provider-webhook-unmatched-api", {
      conversationId: "conversation-safe-internal",
      actionMode: "link-only"
    });
    const bulk = await bulkReviewSettingsProviderWebhookUnmatchedInbound("api", {
      ids: ["provider-webhook-unmatched-api"],
      reviewStatus: "reviewed",
      reason: "safe bulk review"
    });

    expect(api.reviewProviderWebhookUnmatchedInbound).toHaveBeenCalledWith("provider-webhook-unmatched-api", expect.objectContaining({ status: "reviewed" }));
    expect(api.linkProviderWebhookUnmatchedInboundConversation).toHaveBeenCalledWith("provider-webhook-unmatched-api", expect.objectContaining({
      conversationId: "conversation-safe-internal",
      actionMode: "link-only"
    }));
    expect(api.bulkReviewProviderWebhookUnmatchedInbound).toHaveBeenCalledWith(expect.objectContaining({
      ids: ["provider-webhook-unmatched-api"],
      reviewStatus: "reviewed"
    }));
    expect(reviewed.reviewStatus).toBe("reviewed");
    expect(linked.linkStatus).toBe("linked");
    expect(bulk.summary.successCount).toBe(1);
    expect(JSON.stringify({ reviewed, linked, bulk })).not.toMatch(/token|secret|authorization|cookie|providerRaw|rawPayload|payloadJson|replyToken/i);
  });

  it("runs assignment and escalation metadata actions through API mode without local fallback", async () => {
    api.assignProviderWebhookUnmatchedInbound.mockResolvedValueOnce({
      ...providerWebhookUnmatchedInboundResponse("provider-webhook-unmatched-api"),
      assignmentStatus: "assigned",
      assignedToOperatorLabel: "operator:current",
      assignedAt: "2026-05-31T00:10:00.000Z",
      assignedByOperatorLabel: "operator:current"
    });
    api.escalateProviderWebhookUnmatchedInbound.mockResolvedValueOnce({
      ...providerWebhookUnmatchedInboundResponse("provider-webhook-unmatched-api"),
      escalationStatus: "escalated",
      escalationReason: "SLA_RISK",
      escalatedAt: "2026-05-31T00:11:00.000Z",
      escalatedByOperatorLabel: "operator:current"
    });
    api.bulkAssignProviderWebhookUnmatchedInbound.mockResolvedValueOnce(providerWebhookBulkAssignmentResponse("ASSIGN_TO_ME"));
    api.bulkEscalateProviderWebhookUnmatchedInbound.mockResolvedValueOnce(providerWebhookBulkEscalationResponse("ESCALATE"));

    const assigned = await assignSettingsProviderWebhookUnmatchedInbound("api", "provider-webhook-unmatched-api", {
      operation: "ASSIGN_TO_ME",
      note: "safe assignment note"
    });
    const escalated = await escalateSettingsProviderWebhookUnmatchedInbound("api", "provider-webhook-unmatched-api", {
      operation: "ESCALATE",
      escalationReason: "SLA_RISK",
      note: "safe escalation note"
    });
    const bulkAssigned = await bulkAssignSettingsProviderWebhookUnmatchedInbound("api", {
      ids: ["provider-webhook-unmatched-api"],
      operation: "ASSIGN_TO_ME",
      note: "safe bulk assignment"
    });
    const bulkEscalated = await bulkEscalateSettingsProviderWebhookUnmatchedInbound("api", {
      ids: ["provider-webhook-unmatched-api"],
      operation: "ESCALATE",
      escalationReason: "SLA_RISK",
      note: "safe bulk escalation"
    });

    expect(api.assignProviderWebhookUnmatchedInbound).toHaveBeenCalledWith("provider-webhook-unmatched-api", {
      operation: "ASSIGN_TO_ME",
      note: "safe assignment note"
    });
    expect(api.escalateProviderWebhookUnmatchedInbound).toHaveBeenCalledWith("provider-webhook-unmatched-api", {
      operation: "ESCALATE",
      escalationReason: "SLA_RISK",
      note: "safe escalation note"
    });
    expect(api.bulkAssignProviderWebhookUnmatchedInbound).toHaveBeenCalledWith(expect.objectContaining({
      ids: ["provider-webhook-unmatched-api"],
      operation: "ASSIGN_TO_ME"
    }));
    expect(api.bulkEscalateProviderWebhookUnmatchedInbound).toHaveBeenCalledWith(expect.objectContaining({
      ids: ["provider-webhook-unmatched-api"],
      operation: "ESCALATE",
      escalationReason: "SLA_RISK"
    }));
    expect(assigned).toMatchObject({
      assignmentStatus: "assigned",
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      messagePersisted: false,
      externalCalls: 0
    });
    expect(escalated).toMatchObject({
      escalationStatus: "escalated",
      escalationReason: "SLA_RISK",
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      messagePersisted: false,
      externalCalls: 0
    });
    expect(bulkAssigned.summary.successCount).toBe(1);
    expect(bulkEscalated.summary.successCount).toBe(1);
    expect(JSON.stringify({ assigned, escalated, bulkAssigned, bulkEscalated })).not.toMatch(/token|secret|authorization|cookie|providerRaw|rawPayload|payloadJson|replyToken|raw-room|raw-sender|senderId|roomId/i);
  });

  it("runs resolution and checklist metadata actions through API mode without local fallback", async () => {
    api.resolveProviderWebhookUnmatchedInbound.mockResolvedValueOnce({
      ...providerWebhookUnmatchedInboundResponse("provider-webhook-unmatched-api"),
      resolutionStatus: "resolved",
      resolutionOutcome: "NEEDS_REVIEW",
      resolvedAt: "2026-05-31T00:09:00.000Z",
      resolvedByOperatorLabel: "operator:current"
    });
    api.updateProviderWebhookUnmatchedInboundChecklist.mockResolvedValueOnce({
      ...providerWebhookUnmatchedInboundResponse("provider-webhook-unmatched-api"),
      checklistCompletedCount: 2
    });
    api.bulkResolveProviderWebhookUnmatchedInbound.mockResolvedValueOnce(providerWebhookBulkResolutionResponse("RESET_CHECKLIST"));

    const resolved = await resolveSettingsProviderWebhookUnmatchedInbound("api", "provider-webhook-unmatched-api", {
      operation: "SET_RESOLUTION",
      resolutionOutcome: "NEEDS_REVIEW",
      note: "safe resolution note"
    });
    const checklist = await updateSettingsProviderWebhookUnmatchedInboundChecklist("api", "provider-webhook-unmatched-api", {
      operation: "COMPLETE_STEP",
      step: "VIEWED_DIAGNOSTICS"
    });
    const bulk = await bulkResolveSettingsProviderWebhookUnmatchedInbound("api", {
      ids: ["provider-webhook-unmatched-api"],
      operation: "RESET_CHECKLIST",
      note: "safe bulk checklist reset"
    });

    expect(api.resolveProviderWebhookUnmatchedInbound).toHaveBeenCalledWith("provider-webhook-unmatched-api", {
      operation: "SET_RESOLUTION",
      resolutionOutcome: "NEEDS_REVIEW",
      note: "safe resolution note"
    });
    expect(api.updateProviderWebhookUnmatchedInboundChecklist).toHaveBeenCalledWith("provider-webhook-unmatched-api", {
      operation: "COMPLETE_STEP",
      step: "VIEWED_DIAGNOSTICS"
    });
    expect(api.bulkResolveProviderWebhookUnmatchedInbound).toHaveBeenCalledWith(expect.objectContaining({
      ids: ["provider-webhook-unmatched-api"],
      operation: "RESET_CHECKLIST"
    }));
    expect(resolved).toMatchObject({
      resolutionStatus: "resolved",
      resolutionOutcome: "NEEDS_REVIEW",
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      messagePersisted: false,
      externalCalls: 0
    });
    expect(checklist).toMatchObject({
      checklistCompletedCount: 2,
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      messagePersisted: false,
      externalCalls: 0
    });
    expect(bulk.summary.successCount).toBe(1);
    expect(JSON.stringify({ resolved, checklist, bulk })).not.toMatch(/token|secret|authorization|cookie|providerRaw|rawPayload|payloadJson|replyToken|raw-room|raw-sender|senderId|roomId/i);
  });

  it("does not fallback to mock provider webhook events when API mode fails", async () => {
    api.getProviderWebhookEvents.mockRejectedValueOnce(new Error("API request failed (503): webhook events unavailable"));

    await expect(loadSettingsProviderWebhookEventsData("api")).rejects.toThrow("webhook events unavailable");

    api.getProviderWebhookUnmatchedInbound.mockRejectedValueOnce(new Error("API request failed (503): unmatched unavailable"));

    await expect(loadSettingsProviderWebhookUnmatchedInboundData("api")).rejects.toThrow("unmatched unavailable");

    api.getProviderWebhookUnmatchedInboundCandidates.mockRejectedValueOnce(new Error("API request failed (503): candidates unavailable"));

    await expect(loadSettingsProviderWebhookCandidateData("api", "provider-webhook-unmatched-api"))
      .rejects.toThrow("candidates unavailable");

    api.getProviderWebhookReviewTriage.mockRejectedValueOnce(new Error("API request failed (503): triage unavailable"));

    await expect(loadSettingsProviderWebhookReviewTriageData("api", { provider: "line" }))
      .rejects.toThrow("triage unavailable");

    api.getProviderWebhookUnmatchedInboundHistory.mockRejectedValueOnce(new Error("API request failed (503): history unavailable"));

    await expect(loadSettingsProviderWebhookHistoryData("api", "provider-webhook-unmatched-api"))
      .rejects.toThrow("history unavailable");

    api.getProviderWebhookUnmatchedInboundExport.mockRejectedValueOnce(new Error("API request failed (503): export unavailable"));

    await expect(exportSettingsProviderWebhookUnmatchedInboundData("api", { format: "json" }))
      .rejects.toThrow("export unavailable");

    api.getProviderWebhookReviewSavedViews.mockRejectedValueOnce(new Error("API request failed (503): saved views unavailable"));

    await expect(loadSettingsProviderWebhookSavedViewsData("api"))
      .rejects.toThrow("saved views unavailable");

    api.createProviderWebhookReviewSavedView.mockRejectedValueOnce(new Error("API request failed (503): saved view create unavailable"));

    await expect(createSettingsProviderWebhookSavedView("api", {
      name: "Safe view",
      filters: { provider: "line" }
    })).rejects.toThrow("saved view create unavailable");

    api.archiveProviderWebhookReviewSavedView.mockRejectedValueOnce(new Error("API request failed (503): saved view archive unavailable"));

    await expect(archiveSettingsProviderWebhookSavedView("api", "provider-webhook-review-view-api"))
      .rejects.toThrow("saved view archive unavailable");

    api.getProviderWebhookOperatorNotes.mockRejectedValueOnce(new Error("API request failed (503): operator notes unavailable"));

    await expect(loadSettingsProviderWebhookOperatorNotesData("api", "provider-webhook-unmatched-api"))
      .rejects.toThrow("operator notes unavailable");

    api.createProviderWebhookOperatorNote.mockRejectedValueOnce(new Error("API request failed (503): operator note create unavailable"));

    await expect(createSettingsProviderWebhookOperatorNote("api", "provider-webhook-unmatched-api", {
      note: "Safe note"
    })).rejects.toThrow("operator note create unavailable");

    api.createProviderWebhookSandboxEvent.mockRejectedValueOnce(new Error("API request failed (503): sandbox intake unavailable"));

    await expect(createSettingsProviderWebhookSandboxEvent("api", {
      provider: "line",
      eventType: "message.created",
      mode: "dry_run",
      payload: { safe: true }
    })).rejects.toThrow("sandbox intake unavailable");

    api.reviewProviderWebhookUnmatchedInbound.mockRejectedValueOnce(new Error("API request failed (503): review unavailable"));

    await expect(reviewSettingsProviderWebhookUnmatchedInbound("api", "provider-webhook-unmatched-api", { status: "reviewed" }))
      .rejects.toThrow("review unavailable");

    api.bulkReviewProviderWebhookUnmatchedInbound.mockRejectedValueOnce(new Error("API request failed (503): bulk unavailable"));

    await expect(bulkReviewSettingsProviderWebhookUnmatchedInbound("api", {
      ids: ["provider-webhook-unmatched-api"],
      reviewStatus: "reviewed"
    })).rejects.toThrow("bulk unavailable");

    api.assignProviderWebhookUnmatchedInbound.mockRejectedValueOnce(new Error("API request failed (503): assignment unavailable"));

    await expect(assignSettingsProviderWebhookUnmatchedInbound("api", "provider-webhook-unmatched-api", {
      operation: "ASSIGN_TO_ME"
    })).rejects.toThrow("assignment unavailable");

    api.escalateProviderWebhookUnmatchedInbound.mockRejectedValueOnce(new Error("API request failed (503): escalation unavailable"));

    await expect(escalateSettingsProviderWebhookUnmatchedInbound("api", "provider-webhook-unmatched-api", {
      operation: "ESCALATE",
      escalationReason: "SLA_RISK"
    })).rejects.toThrow("escalation unavailable");

    api.bulkAssignProviderWebhookUnmatchedInbound.mockRejectedValueOnce(new Error("API request failed (503): bulk assignment unavailable"));

    await expect(bulkAssignSettingsProviderWebhookUnmatchedInbound("api", {
      ids: ["provider-webhook-unmatched-api"],
      operation: "ASSIGN_TO_ME"
    })).rejects.toThrow("bulk assignment unavailable");

    api.bulkEscalateProviderWebhookUnmatchedInbound.mockRejectedValueOnce(new Error("API request failed (503): bulk escalation unavailable"));

    await expect(bulkEscalateSettingsProviderWebhookUnmatchedInbound("api", {
      ids: ["provider-webhook-unmatched-api"],
      operation: "ESCALATE",
      escalationReason: "SLA_RISK"
    })).rejects.toThrow("bulk escalation unavailable");

    api.resolveProviderWebhookUnmatchedInbound.mockRejectedValueOnce(new Error("API request failed (503): resolution unavailable"));

    await expect(resolveSettingsProviderWebhookUnmatchedInbound("api", "provider-webhook-unmatched-api", {
      operation: "SET_RESOLUTION",
      resolutionOutcome: "NEEDS_REVIEW"
    })).rejects.toThrow("resolution unavailable");

    api.updateProviderWebhookUnmatchedInboundChecklist.mockRejectedValueOnce(new Error("API request failed (503): checklist unavailable"));

    await expect(updateSettingsProviderWebhookUnmatchedInboundChecklist("api", "provider-webhook-unmatched-api", {
      operation: "COMPLETE_STEP",
      step: "VIEWED_DIAGNOSTICS"
    })).rejects.toThrow("checklist unavailable");

    api.bulkResolveProviderWebhookUnmatchedInbound.mockRejectedValueOnce(new Error("API request failed (503): bulk resolution unavailable"));

    await expect(bulkResolveSettingsProviderWebhookUnmatchedInbound("api", {
      ids: ["provider-webhook-unmatched-api"],
      operation: "RESET_CHECKLIST"
    })).rejects.toThrow("bulk resolution unavailable");

    api.linkProviderWebhookUnmatchedInboundConversation.mockRejectedValueOnce(new Error("API request failed (503): link unavailable"));

    await expect(linkSettingsProviderWebhookUnmatchedInboundConversation("api", "provider-webhook-unmatched-api", {
      conversationId: "conversation-safe-internal",
      actionMode: "link-only"
    })).rejects.toThrow("link unavailable");
  });

  it("keeps API-mode review and link failures from mutating local unmatched state", async () => {
    const before = JSON.stringify(mockProviderWebhookUnmatchedInbound);
    api.reviewProviderWebhookUnmatchedInbound.mockRejectedValueOnce(new Error("API request failed (503): review unavailable"));

    await expect(reviewSettingsProviderWebhookUnmatchedInbound("api", "provider-webhook-unmatched-local-1", { status: "reviewed" }))
      .rejects.toThrow("review unavailable");

    api.bulkReviewProviderWebhookUnmatchedInbound.mockRejectedValueOnce(new Error("API request failed (503): bulk unavailable"));

    await expect(bulkReviewSettingsProviderWebhookUnmatchedInbound("api", {
      ids: ["provider-webhook-unmatched-local-1"],
      reviewStatus: "reviewed"
    })).rejects.toThrow("bulk unavailable");

    api.linkProviderWebhookUnmatchedInboundConversation.mockRejectedValueOnce(new Error("API request failed (503): link unavailable"));

    await expect(linkSettingsProviderWebhookUnmatchedInboundConversation("api", "provider-webhook-unmatched-local-1", {
      conversationId: "conversation-safe-internal",
      actionMode: "link-and-persist-safe-message"
    })).rejects.toThrow("link unavailable");

    expect(JSON.stringify(mockProviderWebhookUnmatchedInbound)).toBe(before);
  });

  it("keeps API-mode assignment and escalation failures from mutating local unmatched state", async () => {
    const before = JSON.stringify(mockProviderWebhookUnmatchedInbound);
    api.assignProviderWebhookUnmatchedInbound.mockRejectedValueOnce(new Error("API request failed (503): assignment unavailable"));

    await expect(assignSettingsProviderWebhookUnmatchedInbound("api", "provider-webhook-unmatched-local-1", {
      operation: "ASSIGN_TO_ME"
    })).rejects.toThrow("assignment unavailable");

    api.escalateProviderWebhookUnmatchedInbound.mockRejectedValueOnce(new Error("API request failed (503): escalation unavailable"));

    await expect(escalateSettingsProviderWebhookUnmatchedInbound("api", "provider-webhook-unmatched-local-1", {
      operation: "ESCALATE",
      escalationReason: "SLA_RISK"
    })).rejects.toThrow("escalation unavailable");

    api.bulkAssignProviderWebhookUnmatchedInbound.mockRejectedValueOnce(new Error("API request failed (503): bulk assignment unavailable"));

    await expect(bulkAssignSettingsProviderWebhookUnmatchedInbound("api", {
      ids: ["provider-webhook-unmatched-local-1"],
      operation: "ASSIGN_TO_ME"
    })).rejects.toThrow("bulk assignment unavailable");

    api.bulkEscalateProviderWebhookUnmatchedInbound.mockRejectedValueOnce(new Error("API request failed (503): bulk escalation unavailable"));

    await expect(bulkEscalateSettingsProviderWebhookUnmatchedInbound("api", {
      ids: ["provider-webhook-unmatched-local-1"],
      operation: "ESCALATE",
      escalationReason: "SLA_RISK"
    })).rejects.toThrow("bulk escalation unavailable");

    expect(JSON.stringify(mockProviderWebhookUnmatchedInbound)).toBe(before);
  });

  it("keeps API-mode resolution and checklist failures from mutating local unmatched state", async () => {
    const before = JSON.stringify(mockProviderWebhookUnmatchedInbound);
    api.resolveProviderWebhookUnmatchedInbound.mockRejectedValueOnce(new Error("API request failed (503): resolution unavailable"));

    await expect(resolveSettingsProviderWebhookUnmatchedInbound("api", "provider-webhook-unmatched-local-1", {
      operation: "SET_RESOLUTION",
      resolutionOutcome: "NEEDS_REVIEW"
    })).rejects.toThrow("resolution unavailable");

    api.updateProviderWebhookUnmatchedInboundChecklist.mockRejectedValueOnce(new Error("API request failed (503): checklist unavailable"));

    await expect(updateSettingsProviderWebhookUnmatchedInboundChecklist("api", "provider-webhook-unmatched-local-1", {
      operation: "COMPLETE_STEP",
      step: "VIEWED_DIAGNOSTICS"
    })).rejects.toThrow("checklist unavailable");

    api.bulkResolveProviderWebhookUnmatchedInbound.mockRejectedValueOnce(new Error("API request failed (503): bulk resolution unavailable"));

    await expect(bulkResolveSettingsProviderWebhookUnmatchedInbound("api", {
      ids: ["provider-webhook-unmatched-local-1"],
      operation: "RESET_CHECKLIST"
    })).rejects.toThrow("bulk resolution unavailable");

    expect(JSON.stringify(mockProviderWebhookUnmatchedInbound)).toBe(before);
  });

  it("does not fallback to mock team when API mode fails", async () => {
    api.getSettingsTeam.mockRejectedValueOnce(new Error("API request failed (503): team unavailable"));
    api.getSettingsSlaPolicies.mockResolvedValueOnce([settingsSlaPolicyResponse("sla-api")]);
    api.getSettingsCannedReplies.mockResolvedValueOnce([settingsCannedReplyResponse("reply-api")]);

    await expect(loadSettingsTeamData("api")).rejects.toThrow("team unavailable");
  });

  it("keeps settings channels and team mock/local mode available", async () => {
    const channels = await loadSettingsChannelsData("mock");
    const team = await loadSettingsTeamData("mock");
    const readiness = await loadSettingsProviderReadinessData("mock");
    const metrics = await loadSettingsProviderWebhookReviewMetricsData("mock", {
      provider: "line",
      limit: 10,
      offset: 0,
      sortBy: "receivedAt",
      sortOrder: "desc"
    } as Parameters<typeof loadSettingsProviderWebhookReviewMetricsData>[1]);
    const alerts = await loadSettingsProviderWebhookReviewAlertsData("mock", {
      provider: "line",
      severity: "critical"
    });
    const triage = await loadSettingsProviderWebhookReviewTriageData("mock", {
      provider: "line",
      triageLane: "critical_stale_open"
    });
    const workload = await loadSettingsProviderWebhookReviewWorkloadData("mock", {
      provider: "line",
      assignmentStatus: "unassigned"
    });
    const resolutionSummary = await loadSettingsProviderWebhookReviewResolutionSummaryData("mock", {
      provider: "line",
      resolutionStatus: "unresolved",
      checklistIncomplete: true
    });
    const qaHandoffBundle = await loadSettingsProviderWebhookReviewQaHandoffBundleData("mock", {
      provider: "line",
      checklistIncomplete: true
    });
    const qaHandoffBundleExport = await exportSettingsProviderWebhookReviewQaHandoffBundleData("mock", {
      provider: "line",
      checklistIncomplete: true
    });
    const savedViews = await loadSettingsProviderWebhookSavedViewsData("mock");
    const note = await createSettingsProviderWebhookOperatorNote("mock", "provider-webhook-unmatched-local-1", {
      note: "Safe local note"
    });
    const notes = await loadSettingsProviderWebhookOperatorNotesData("mock", "provider-webhook-unmatched-local-1");

    expect(channels.channels).toEqual(mockSettingsChannels);
    expect(readiness.providerReadiness).toEqual(mockProviderReadiness);
    expect((await loadSettingsProviderWebhookEventsData("mock")).events).toEqual(mockProviderWebhookEvents);
    expect((await loadSettingsProviderWebhookUnmatchedInboundData("mock")).items[0]?.unmatchedStatus).toBe("review-needed");
    expect(metrics.metrics.externalCalls).toBe(0);
    expect(metrics.metrics.appliedFilters).toEqual({ provider: "line" });
    expect(alerts.alerts.externalCalls).toBe(0);
    expect(alerts.alerts.appliedFilters).toEqual({ provider: "line", severity: "critical" });
    expect(alerts.alerts.bySeverity.find((item) => item.key === "critical")?.count).toBeGreaterThanOrEqual(0);
    expect(triage.triage.externalCalls).toBe(0);
    expect(triage.triage.appliedFilters).toEqual({ provider: "line", triageLane: "critical_stale_open" });
    expect(triage.triage.topItems.every((item) => item.triageLane === "critical_stale_open")).toBe(true);
    expect(workload.workload.externalCalls).toBe(0);
    expect(workload.workload.appliedFilters).toEqual({ provider: "line", assignmentStatus: "unassigned" });
    expect(resolutionSummary.summary.externalCalls).toBe(0);
    expect(resolutionSummary.summary.appliedFilters).toEqual({ provider: "line", resolutionStatus: "unresolved", checklistIncomplete: true });
    expect(qaHandoffBundle.bundle).toMatchObject({
      bundleKind: "provider-webhook-review-qa-handoff-bundle",
      externalCalls: 0,
      manualQaChecks: {
        externalCallsZero: true,
        providerOutboundAbsent: true
      }
    });
    expect(qaHandoffBundleExport.exportResult).toMatchObject({
      exportKind: "qa-handoff-bundle",
      safeFilename: "provider-webhook-review-qa-handoff-bundle-export.json",
      safeDigest: "sha256:mockqahandoffbundleexport",
      externalCalls: 0
    });
    expect(savedViews.savedViews[0]).toMatchObject({
      name: "LINE pending manual review",
      externalCalls: 0
    });
    expect(note.note).toBe("Safe local note");
    expect(notes.notes.map((entry) => entry.id)).toContain(note.id);
    expect((await loadSettingsProviderWebhookDiagnosticsData("mock", "provider-webhook-unmatched-local-1")).diagnostics.safeRoomLabel).toContain("room digest");
    expect(team.members.map((member) => member.id)).toEqual(["agent-may", "agent-ton", "agent-beam", "agent-nok"]);
    expect(team.slaPolicies.map((policy) => policy.priorityScope)).toEqual(["low", "medium", "high", "urgent"]);
    expect(team.cannedReplies.map((reply) => reply.shortcut)).toEqual(["/hello", "/price", "/followup", "/human"]);
    expect(api.getSettingsChannels).not.toHaveBeenCalled();
    expect(api.getSettingsTeam).not.toHaveBeenCalled();
    expect(api.getSettingsSlaPolicies).not.toHaveBeenCalled();
    expect(api.getSettingsCannedReplies).not.toHaveBeenCalled();
    expect(api.getProviderReadiness).not.toHaveBeenCalled();
    expect(api.getProviderWebhookReviewQaHandoffBundle).not.toHaveBeenCalled();
    expect(api.getProviderWebhookReviewQaHandoffBundleExport).not.toHaveBeenCalled();
    expect(api.getProviderWebhookReviewTriage).not.toHaveBeenCalled();
    expect(api.getProviderWebhookReviewWorkload).not.toHaveBeenCalled();
    expect(api.getProviderWebhookReviewResolutionSummary).not.toHaveBeenCalled();
    expect(api.getProviderWebhookReviewAlerts).not.toHaveBeenCalled();
    expect(api.getProviderWebhookReviewMetrics).not.toHaveBeenCalled();
    expect(api.getProviderWebhookReviewSavedViews).not.toHaveBeenCalled();
    expect(api.createProviderWebhookReviewSavedView).not.toHaveBeenCalled();
    expect(api.getProviderWebhookOperatorNotes).not.toHaveBeenCalled();
    expect(api.createProviderWebhookOperatorNote).not.toHaveBeenCalled();
    expect(api.getProviderWebhookUnmatchedInboundDiagnostics).not.toHaveBeenCalled();
    expect(api.getProviderWebhookUnmatchedInbound).not.toHaveBeenCalled();
  });

  it("keeps mock/local certified release handoff acceptance acknowledgement available safely", async () => {
    const filters = { provider: "line", eventType: "message.created" } as const;
    const pending = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordData("mock", filters);
    const acknowledged = await acknowledgeSettingsProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord("mock", filters, {
      acknowledgementType: "operator_checklist_acknowledgement",
      acknowledgedByRole: "release owner",
      acknowledgedByLabel: "safe release owner",
      acknowledgedChecklistKeys: pending.acceptanceRecord.operatorChecklist.map((item) => item.key)
    });
    const readback = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordData("mock", filters);
    const initialDryRun = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunData("mock", filters);
    const executedDryRun = await runSettingsProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun("mock", filters, {
      requestedBy: "safe release owner",
      checklistAcknowledged: true,
      operatorNote: "safe no-op dry-run",
      dryRunReason: "safe no-op execution readiness rehearsal",
      executionMode: "no_op"
    });
    const dryRunReadback = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunData("mock", filters);
    const resultLedger = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerData("mock", filters);
    const finalReadinessCertificate = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificateData("mock", filters);
    const freezeAuditRegister = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegisterData("mock", filters);
    const rollbackRehearsalReceipt = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptData("mock", filters);
    const controlRoomPacket = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseControlRoomPacketData("mock", filters);
    const cutoverChecklistReceipt = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceiptData("mock", filters);
    const operatorCommandReceipt = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceiptData("mock", filters);
    const goLiveAuthorizationReceipt = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceiptData("mock", filters);
    const launchWindowConfirmationReceipt = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceiptData("mock", filters);
    const goLiveHoldReleaseAuthorizationReceipt = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceiptData("mock", filters);
    const launchApprovalReceipt = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceiptData("mock", filters);
    const noExecutionLockReceipt = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceiptData("mock", filters);
    const operationsHandoffReadinessPacket = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacketData("mock", filters);
    const operationsHandoffAcceptanceReceipt = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceReceiptData("mock", filters);
    const operationsCustodyMonitoringReadinessLedger = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedgerData("mock", filters);
    const operationsCustodyMonitoringCloseoutSealReceipt = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceiptData("mock", filters);
    const finalNoExecutionEvidenceRollup = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollupData("mock", filters);
    const finalEvidenceIndexRegressionGuardrailReceipt = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceiptData("mock", filters);
    const finalArchiveSealOperationalClosureReceipt = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealOperationalClosureReceiptData("mock", filters);
    const postClosurePreservationVerificationReceipt = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceiptData("mock", filters);
    const postClosurePreservationContinuityLedgerReceipt = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceiptData("mock", filters);
    const postClosurePreservationCustodyAuditReceipt = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceiptData("mock", filters);
    const postClosurePreservationCustodyChainSealReceipt = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealReceiptData("mock", filters);
    const postClosurePreservationCustodyChainIntegrityLedgerReceipt = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerReceiptData("mock", filters);
    const postClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityReceiptData("mock", filters);
    const postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt = await loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceiptData("mock", filters);

    expect(pending.mode).toBe("mock");
    expect(pending.acceptanceRecord).toMatchObject({
      acceptanceKind: "qa-handoff-locked-archive-certified-release-handoff-acceptance-record",
      acceptanceStatus: "not_started",
      handoffStatus: "ready",
      releaseDecision: "go",
      externalCalls: 0
    });
    expect(acknowledged.acceptanceRecord).toMatchObject({
      acceptanceStatus: "acknowledged",
      handoffStatus: "ready",
      releaseDecision: "go",
      operatorChecklist: expect.any(Array),
      externalCalls: 0
    });
    expect(acknowledged.acceptanceRecord.acknowledgedChecklist.every((item) => item.acknowledged)).toBe(true);
    expect(acknowledged.acceptanceRecord.releaseOwnerSummary.operatorChecklistAcknowledged).toBe(true);
    expect(acknowledged.acceptanceRecord.counts.acceptanceRecordMutationCount).toBe(1);
    expect(readback.acceptanceRecord.acceptanceRecordDigest).toBe(acknowledged.acceptanceRecord.acceptanceRecordDigest);
    expect(initialDryRun.dryRun).toMatchObject({
      dryRunStatus: "not_started",
      executionMode: "no_op",
      acceptanceStatus: "acknowledged",
      externalCalls: 0
    });
    expect(executedDryRun.dryRun).toMatchObject({
      dryRunStatus: "passed",
      executionMode: "no_op",
      acceptanceStatus: "acknowledged",
      handoffStatus: "ready",
      releaseDecision: "go",
      externalCalls: 0
    });
    expect(executedDryRun.dryRun.releaseOwnerSummary.checklistAcknowledged).toBe(true);
    expect(executedDryRun.dryRun.executionChecklist.length).toBeGreaterThan(0);
    expect(executedDryRun.dryRun.dryRunRows.length).toBeGreaterThan(0);
    expect(executedDryRun.dryRun.executionPlanRows.length).toBeGreaterThan(0);
    expect(dryRunReadback.dryRun.noopExecutionDryRunDigest).toBe(executedDryRun.dryRun.noopExecutionDryRunDigest);
    expect(resultLedger.resultLedger).toMatchObject({
      ledgerStatus: "recorded",
      dryRunStatus: "passed",
      executionMode: "no_op",
      releaseDecision: "go",
      externalCalls: 0
    });
    expect(resultLedger.resultLedger.counts.dryRunResultLedgerMutationCount).toBe(0);
    expect(finalReadinessCertificate.finalReadinessCertificate).toMatchObject({
      certificateKind: "qa-handoff-locked-archive-certified-release-final-readiness-certificate",
      executionMode: "no_op",
      externalCalls: 0
    });
    expect(freezeAuditRegister.freezeAuditRegister).toMatchObject({
      registerKind: "qa-handoff-locked-archive-certified-release-freeze-audit-register",
      freezeStatus: "frozen",
      executionMode: "no_op",
      externalCalls: 0
    });
    expect(rollbackRehearsalReceipt.rollbackRehearsalReceipt).toMatchObject({
      receiptKind: "qa-handoff-locked-archive-certified-release-rollback-rehearsal-receipt",
      freezeStatus: "frozen",
      executionMode: "no_op",
      externalCalls: 0
    });
    expect(rollbackRehearsalReceipt.rollbackRehearsalReceipt.counts.rollbackRehearsalReceiptMutationCount).toBe(0);
    expect(controlRoomPacket.controlRoomPacket).toMatchObject({
      packetKind: "qa-handoff-locked-archive-certified-release-control-room-packet",
      controlRoomStatus: "blocked",
      cutoverReadinessStatus: "not_ready",
      rollbackRehearsalStatus: "blocked",
      releaseDecision: "no_go",
      executionMode: "no_op",
      externalCalls: 0
    });
    expect(controlRoomPacket.controlRoomPacket.counts.controlRoomPacketMutationCount).toBe(0);
    expect(cutoverChecklistReceipt.cutoverChecklistReceipt).toMatchObject({
      receiptKind: "qa-handoff-locked-archive-certified-release-cutover-checklist-receipt",
      cutoverChecklistStatus: "blocked",
      operatorCommandStatus: "not_ready",
      controlRoomStatus: "blocked",
      cutoverReadinessStatus: "not_ready",
      releaseDecision: "no_go",
      executionMode: "no_op",
      externalCalls: 0
    });
    expect(cutoverChecklistReceipt.cutoverChecklistReceipt.counts.cutoverChecklistReceiptMutationCount).toBe(0);
    expect(operatorCommandReceipt.operatorCommandReceipt).toMatchObject({
      receiptKind: "qa-handoff-locked-archive-certified-release-operator-command-receipt",
      operatorCommandReceiptStatus: "blocked",
      goLiveAuthorizationStatus: "not_ready",
      executionMode: "no_op",
      externalCalls: 0
    });
    expect(operatorCommandReceipt.operatorCommandReceipt.counts.operatorCommandReceiptMutationCount).toBe(0);
    expect(goLiveAuthorizationReceipt.goLiveAuthorizationReceipt).toMatchObject({
      receiptKind: "qa-handoff-locked-archive-certified-release-go-live-authorization-receipt",
      goLiveAuthorizationReceiptStatus: "blocked",
      launchWindowStatus: "not_ready",
      safeLaunchWindowStatus: "not_ready",
      executionMode: "no_op",
      externalCalls: 0
    });
    expect(goLiveAuthorizationReceipt.goLiveAuthorizationReceipt.counts.goLiveAuthorizationReceiptMutationCount).toBe(0);
    expect(launchWindowConfirmationReceipt.launchWindowConfirmationReceipt).toMatchObject({
      receiptKind: "qa-handoff-locked-archive-certified-release-launch-window-confirmation-receipt",
      launchWindowConfirmationStatus: "blocked",
      goLiveHoldStatus: "not_ready",
      executionMode: "no_op",
      externalCalls: 0
    });
    expect(launchWindowConfirmationReceipt.launchWindowConfirmationReceipt.counts.launchWindowConfirmationReceiptMutationCount).toBe(0);
    expect(goLiveHoldReleaseAuthorizationReceipt.goLiveHoldReleaseAuthorizationReceipt).toMatchObject({
      receiptKind: "qa-handoff-locked-archive-certified-release-go-live-hold-release-authorization-receipt",
      goLiveHoldReleaseAuthorizationStatus: "blocked",
      launchApprovalStatus: "not_ready",
      executionMode: "no_op",
      externalCalls: 0
    });
    expect(goLiveHoldReleaseAuthorizationReceipt.goLiveHoldReleaseAuthorizationReceipt.counts.goLiveHoldReleaseAuthorizationReceiptMutationCount).toBe(0);
    expect(launchApprovalReceipt.launchApprovalReceipt).toMatchObject({
      receiptKind: "qa-handoff-locked-archive-certified-release-launch-approval-receipt",
      launchApprovalReceiptStatus: "blocked",
      noExecutionGuardStatus: "retained",
      executionMode: "no_op",
      externalCalls: 0
    });
    expect(launchApprovalReceipt.launchApprovalReceipt.counts.launchApprovalReceiptMutationCount).toBe(0);
    expect(noExecutionLockReceipt.noExecutionLockReceipt).toMatchObject({
      receiptKind: "qa-handoff-locked-archive-certified-release-launch-approval-no-execution-lock-receipt",
      noExecutionLockReceiptStatus: "blocked",
      noExecutionLockStatus: "incomplete",
      launchApprovalArchiveStatus: "incomplete",
      tenantScopeStatus: "tenant_scoped",
      providerOutboundStatus: "absent",
      externalNotificationStatus: "absent",
      aiCallStatus: "absent",
      executionMode: "no_op",
      externalCalls: 0
    });
    expect(noExecutionLockReceipt.noExecutionLockReceipt.counts.noExecutionLockReceiptMutationCount).toBe(0);
    expect(noExecutionLockReceipt.noExecutionLockReceipt.counts.executionAttemptCount).toBe(0);
    expect(noExecutionLockReceipt.noExecutionLockReceipt.counts.providerOutboundCallCount).toBe(0);
    expect(noExecutionLockReceipt.noExecutionLockReceipt.counts.externalNotificationSendCount).toBe(0);
    expect(noExecutionLockReceipt.noExecutionLockReceipt.counts.aiCallCount).toBe(0);
    expect(operationsHandoffReadinessPacket.mode).toBe("mock");
    expect(operationsHandoffReadinessPacket.operationsHandoffReadinessPacket).toMatchObject({
      packetKind: "qa-handoff-locked-archive-certified-release-operations-handoff-readiness-no-execution-evidence-packet",
      operationsHandoffReadinessStatus: "blocked",
      operationsHandoffEvidencePacketStatus: "blocked",
      noExecutionEvidenceStatus: "incomplete",
      launchApprovalLockStatus: "incomplete",
      tenantScopeStatus: "tenant_scoped",
      providerOutboundStatus: "absent",
      externalNotificationStatus: "absent",
      aiCallStatus: "absent",
      externalCalls: 0
    });
    expect(operationsHandoffReadinessPacket.operationsHandoffReadinessPacket.operationsHandoffEvidencePacketDigest).toBe(operationsHandoffReadinessPacket.operationsHandoffReadinessPacket.safeDigest);
    expect(operationsHandoffReadinessPacket.operationsHandoffReadinessPacket.counts.operationsHandoffMutationCount).toBe(0);
    expect(operationsHandoffReadinessPacket.operationsHandoffReadinessPacket.counts.operationsHandoffBlockingCount).toBe(0);
    expect(operationsHandoffReadinessPacket.operationsHandoffReadinessPacket.counts.executionAttemptCount).toBe(0);
    expect(operationsHandoffReadinessPacket.operationsHandoffReadinessPacket.counts.providerOutboundCallCount).toBe(0);
    expect(operationsHandoffReadinessPacket.operationsHandoffReadinessPacket.counts.externalNotificationSendCount).toBe(0);
    expect(operationsHandoffReadinessPacket.operationsHandoffReadinessPacket.counts.aiCallCount).toBe(0);
    expect(operationsHandoffAcceptanceReceipt.mode).toBe("mock");
    expect(operationsHandoffAcceptanceReceipt.operationsHandoffAcceptanceReceipt).toMatchObject({
      receiptKind: "qa-handoff-locked-archive-certified-release-operations-handoff-acceptance-receipt",
      operationsHandoffAcceptanceStatus: "blocked",
      operationsCustodyStatus: "blocked",
      noExecutionEvidenceStatus: "incomplete",
      launchApprovalLockStatus: "incomplete",
      tenantScopeStatus: "tenant_scoped",
      providerOutboundStatus: "absent",
      externalNotificationStatus: "absent",
      aiCallStatus: "absent",
      externalCalls: 0
    });
    expect(operationsHandoffAcceptanceReceipt.operationsHandoffAcceptanceReceipt.operationsHandoffAcceptanceReceiptDigest).toBe(operationsHandoffAcceptanceReceipt.operationsHandoffAcceptanceReceipt.safeDigest);
    expect(operationsHandoffAcceptanceReceipt.operationsHandoffAcceptanceReceipt.counts.operationsHandoffAcceptanceMutationCount).toBe(0);
    expect(operationsHandoffAcceptanceReceipt.operationsHandoffAcceptanceReceipt.counts.executionAttemptCount).toBe(0);
    expect(operationsHandoffAcceptanceReceipt.operationsHandoffAcceptanceReceipt.counts.providerOutboundCallCount).toBe(0);
    expect(operationsHandoffAcceptanceReceipt.operationsHandoffAcceptanceReceipt.counts.externalNotificationSendCount).toBe(0);
    expect(operationsHandoffAcceptanceReceipt.operationsHandoffAcceptanceReceipt.counts.aiCallCount).toBe(0);
    expect(operationsCustodyMonitoringReadinessLedger.mode).toBe("mock");
    expect(operationsCustodyMonitoringReadinessLedger.operationsCustodyMonitoringReadinessLedger).toMatchObject({
      ledgerKind: "qa-handoff-locked-archive-certified-release-operations-custody-monitoring-readiness-ledger",
      operationsCustodyMonitoringStatus: "blocked",
      operationsHandoffAcceptanceStatus: "blocked",
      operationsCustodyStatus: "blocked",
      noExecutionEvidenceStatus: "incomplete",
      launchApprovalLockStatus: "incomplete",
      tenantScopeStatus: "tenant_scoped",
      providerOutboundStatus: "absent",
      externalNotificationStatus: "absent",
      aiCallStatus: "absent",
      monitoringReadinessStatus: "blocked",
      noExecutionMonitoringStatus: "incomplete",
      externalCalls: 0
    });
    expect(operationsCustodyMonitoringReadinessLedger.operationsCustodyMonitoringReadinessLedger.operationsCustodyMonitoringLedgerDigest).toBe(operationsCustodyMonitoringReadinessLedger.operationsCustodyMonitoringReadinessLedger.safeDigest);
    expect(operationsCustodyMonitoringReadinessLedger.operationsCustodyMonitoringReadinessLedger.counts.operationsCustodyMonitoringMutationCount).toBe(0);
    expect(operationsCustodyMonitoringReadinessLedger.operationsCustodyMonitoringReadinessLedger.counts.executionAttemptCount).toBe(0);
    expect(operationsCustodyMonitoringReadinessLedger.operationsCustodyMonitoringReadinessLedger.counts.providerOutboundCallCount).toBe(0);
    expect(operationsCustodyMonitoringReadinessLedger.operationsCustodyMonitoringReadinessLedger.counts.externalNotificationSendCount).toBe(0);
    expect(operationsCustodyMonitoringReadinessLedger.operationsCustodyMonitoringReadinessLedger.counts.aiCallCount).toBe(0);
    expect(operationsCustodyMonitoringCloseoutSealReceipt.mode).toBe("mock");
    expect(operationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyMonitoringCloseoutSealReceipt).toMatchObject({
      receiptKind: "qa-handoff-locked-archive-certified-release-operations-custody-monitoring-closeout-seal-receipt",
      operationsCustodyMonitoringCloseoutStatus: "blocked",
      operationsCustodyMonitoringStatus: "blocked",
      operationsHandoffAcceptanceStatus: "blocked",
      operationsCustodyStatus: "blocked",
      noExecutionEvidenceStatus: "incomplete",
      noExecutionMonitoringStatus: "incomplete",
      launchApprovalLockStatus: "incomplete",
      tenantScopeStatus: "tenant_scoped",
      closeoutSealStatus: "blocked",
      externalCalls: 0
    });
    expect(operationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyMonitoringCloseoutSealReceiptDigest).toBe(operationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyMonitoringCloseoutSealReceipt.safeDigest);
    expect(operationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyMonitoringCloseoutSealReceipt.inheritedOperationsCustodyMonitoringReadinessLedgerSummary.operationsCustodyMonitoringLedgerDigest).toBe(operationsCustodyMonitoringReadinessLedger.operationsCustodyMonitoringReadinessLedger.operationsCustodyMonitoringLedgerDigest);
    expect(operationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyMonitoringCloseoutSealReceipt.counts.operationsCustodyMonitoringCloseoutSealMutationCount).toBe(0);
    expect(operationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyMonitoringCloseoutSealReceipt.counts.executionAttemptCount).toBe(0);
    expect(operationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyMonitoringCloseoutSealReceipt.counts.providerOutboundCallCount).toBe(0);
    expect(operationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyMonitoringCloseoutSealReceipt.counts.externalNotificationSendCount).toBe(0);
    expect(operationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyMonitoringCloseoutSealReceipt.counts.aiCallCount).toBe(0);
    expect(finalNoExecutionEvidenceRollup.mode).toBe("mock");
    expect(finalNoExecutionEvidenceRollup.finalNoExecutionEvidenceRollup).toMatchObject({
      rollupKind: "qa-handoff-locked-archive-certified-release-final-no-execution-evidence-rollup",
      finalNoExecutionEvidenceRollupStatus: "blocked",
      operationsCustodyMonitoringCloseoutStatus: "blocked",
      closeoutSealStatus: "blocked",
      operationsCustodyMonitoringStatus: "blocked",
      operationsHandoffAcceptanceStatus: "blocked",
      operationsCustodyStatus: "blocked",
      noExecutionEvidenceStatus: "incomplete",
      noExecutionMonitoringStatus: "incomplete",
      launchApprovalLockStatus: "incomplete",
      tenantScopeStatus: "tenant_scoped",
      finalArchiveCustodyStatus: "blocked",
      externalCalls: 0
    });
    expect(finalNoExecutionEvidenceRollup.finalNoExecutionEvidenceRollup.safeDigest).toContain("mockqahandoffcertifiedreleasefinalnoexecutionevidencerollup");
    expect(finalNoExecutionEvidenceRollup.finalNoExecutionEvidenceRollup.finalNoExecutionEvidenceRollupDigest).toBe(finalNoExecutionEvidenceRollup.finalNoExecutionEvidenceRollup.safeDigest);
    expect(finalNoExecutionEvidenceRollup.finalNoExecutionEvidenceRollup.inheritedOperationsCustodyMonitoringCloseoutSealReceiptSummary.operationsCustodyMonitoringCloseoutSealReceiptDigest).toBe(operationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyMonitoringCloseoutSealReceiptDigest);
    expect(finalNoExecutionEvidenceRollup.finalNoExecutionEvidenceRollup.counts.finalNoExecutionEvidenceRollupMutationCount).toBe(0);
    expect(finalNoExecutionEvidenceRollup.finalNoExecutionEvidenceRollup.counts.executionAttemptCount).toBe(0);
    expect(finalNoExecutionEvidenceRollup.finalNoExecutionEvidenceRollup.counts.providerOutboundCallCount).toBe(0);
    expect(finalNoExecutionEvidenceRollup.finalNoExecutionEvidenceRollup.counts.externalNotificationSendCount).toBe(0);
    expect(finalNoExecutionEvidenceRollup.finalNoExecutionEvidenceRollup.counts.aiCallCount).toBe(0);
    expect(finalEvidenceIndexRegressionGuardrailReceipt.mode).toBe("mock");
    expect(finalEvidenceIndexRegressionGuardrailReceipt.finalEvidenceIndexRegressionGuardrailReceipt).toMatchObject({
      receiptKind: "qa-handoff-locked-archive-certified-release-final-evidence-index-regression-guardrail-receipt",
      finalEvidenceIndexStatus: "blocked",
      regressionGuardrailReceiptStatus: "blocked",
      finalNoExecutionEvidenceRollupStatus: "blocked",
      finalArchiveCustodyStatus: "blocked",
      operationsCustodyMonitoringCloseoutStatus: "blocked",
      closeoutSealStatus: "blocked",
      regressionGuardrailStatus: "failed",
      tenantScopeStatus: "tenant_scoped",
      externalCalls: 0
    });
    expect(finalEvidenceIndexRegressionGuardrailReceipt.finalEvidenceIndexRegressionGuardrailReceipt.safeDigest).toContain("mockqahandoffcertifiedreleasefinalevidenceindexregressionguardrailreceipt");
    expect(finalEvidenceIndexRegressionGuardrailReceipt.finalEvidenceIndexRegressionGuardrailReceipt.finalEvidenceIndexRows.map((row) => row.sprintNumber)).toEqual([103, 104, 105, 106, 107, 108, 109, 110]);
    expect(finalEvidenceIndexRegressionGuardrailReceipt.finalEvidenceIndexRegressionGuardrailReceipt.counts.finalEvidenceIndexMutationCount).toBe(0);
    expect(finalEvidenceIndexRegressionGuardrailReceipt.finalEvidenceIndexRegressionGuardrailReceipt.counts.executionAttemptCount).toBe(0);
    expect(finalEvidenceIndexRegressionGuardrailReceipt.finalEvidenceIndexRegressionGuardrailReceipt.counts.providerOutboundCallCount).toBe(0);
    expect(finalEvidenceIndexRegressionGuardrailReceipt.finalEvidenceIndexRegressionGuardrailReceipt.counts.externalNotificationSendCount).toBe(0);
    expect(finalEvidenceIndexRegressionGuardrailReceipt.finalEvidenceIndexRegressionGuardrailReceipt.counts.aiCallCount).toBe(0);
    expect(finalArchiveSealOperationalClosureReceipt.mode).toBe("mock");
    expect(finalArchiveSealOperationalClosureReceipt.finalArchiveSealOperationalClosureReceipt).toMatchObject({
      receiptKind: "qa-handoff-locked-archive-certified-release-final-archive-seal-operational-closure-receipt",
      finalOperationalClosureReceiptStatus: "blocked",
      finalArchiveSealStatus: "blocked",
      releaseClosureStatus: "blocked",
      finalEvidenceIndexStatus: "blocked",
      regressionGuardrailReceiptStatus: "blocked",
      regressionGuardrailStatus: "failed",
      tenantScopeStatus: "tenant_scoped",
      externalCalls: 0
    });
    expect(finalArchiveSealOperationalClosureReceipt.finalArchiveSealOperationalClosureReceipt.safeDigest).toContain("mockqahandoffcertifiedreleasefinalarchivesealoperationalclosurereceipt");
    expect(finalArchiveSealOperationalClosureReceipt.finalArchiveSealOperationalClosureReceipt.finalArchiveSealOperationalClosureRows.map((row) => row.sprintNumber)).toEqual([103, 104, 105, 106, 107, 108, 109, 110, 111]);
    expect(finalArchiveSealOperationalClosureReceipt.finalArchiveSealOperationalClosureReceipt.counts.finalOperationalClosureReceiptMutationCount).toBe(0);
    expect(finalArchiveSealOperationalClosureReceipt.finalArchiveSealOperationalClosureReceipt.counts.finalArchiveSealMutationCount).toBe(0);
    expect(finalArchiveSealOperationalClosureReceipt.finalArchiveSealOperationalClosureReceipt.counts.executionAttemptCount).toBe(0);
    expect(finalArchiveSealOperationalClosureReceipt.finalArchiveSealOperationalClosureReceipt.counts.providerOutboundCallCount).toBe(0);
    expect(finalArchiveSealOperationalClosureReceipt.finalArchiveSealOperationalClosureReceipt.counts.externalNotificationSendCount).toBe(0);
    expect(finalArchiveSealOperationalClosureReceipt.finalArchiveSealOperationalClosureReceipt.counts.aiCallCount).toBe(0);
    expect(postClosurePreservationVerificationReceipt.mode).toBe("mock");
    expect(postClosurePreservationVerificationReceipt.postClosurePreservationVerificationReceipt).toMatchObject({
      receiptKind: "qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-verification-receipt",
      postClosurePreservationVerificationStatus: "blocked",
      finalArchiveSealPostClosurePreservationStatus: "blocked",
      finalArchiveSealStatus: "blocked",
      releaseClosureStatus: "blocked",
      tenantScopeStatus: "tenant_scoped",
      externalCalls: 0
    });
    expect(postClosurePreservationVerificationReceipt.postClosurePreservationVerificationReceipt.safeDigest).toContain("mockqahandoffcertifiedreleasefinalarchivesealpostclosurepreservationverificationreceipt");
    expect(postClosurePreservationVerificationReceipt.postClosurePreservationVerificationReceipt.postClosurePreservationVerificationRows.map((row) => row.sprintNumber)).toEqual([103, 104, 105, 106, 107, 108, 109, 110, 111, 112]);
    expect(postClosurePreservationVerificationReceipt.postClosurePreservationVerificationReceipt.counts.postClosurePreservationVerificationMutationCount).toBe(0);
    expect(postClosurePreservationVerificationReceipt.postClosurePreservationVerificationReceipt.counts.finalArchiveSealPostClosurePreservationMutationCount).toBe(0);
    expect(postClosurePreservationVerificationReceipt.postClosurePreservationVerificationReceipt.counts.executionAttemptCount).toBe(0);
    expect(postClosurePreservationVerificationReceipt.postClosurePreservationVerificationReceipt.counts.providerOutboundCallCount).toBe(0);
    expect(postClosurePreservationVerificationReceipt.postClosurePreservationVerificationReceipt.counts.externalNotificationSendCount).toBe(0);
    expect(postClosurePreservationVerificationReceipt.postClosurePreservationVerificationReceipt.counts.aiCallCount).toBe(0);
    expect(postClosurePreservationContinuityLedgerReceipt.mode).toBe("mock");
    expect(postClosurePreservationContinuityLedgerReceipt.postClosurePreservationContinuityLedgerReceipt).toMatchObject({
      receiptKind: "qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-continuity-ledger-receipt",
      postClosurePreservationContinuityLedgerStatus: "blocked",
      postClosurePreservationVerificationStatus: "blocked",
      finalArchiveSealPostClosurePreservationStatus: "blocked",
      finalArchiveSealStatus: "blocked",
      releaseClosureStatus: "blocked",
      tenantScopeStatus: "tenant_scoped",
      externalCalls: 0
    });
    expect(postClosurePreservationContinuityLedgerReceipt.postClosurePreservationContinuityLedgerReceipt.safeDigest).toContain("mockqahandoffcertifiedreleasefinalarchivesealpostclosurepreservationcontinuityledgerreceipt");
    expect(postClosurePreservationContinuityLedgerReceipt.postClosurePreservationContinuityLedgerReceipt.preservationContinuityLedgerRows.map((row) => row.sprintNumber)).toEqual([103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113]);
    expect(postClosurePreservationContinuityLedgerReceipt.postClosurePreservationContinuityLedgerReceipt.counts.preservationContinuityLedgerMutationCount).toBe(0);
    expect(postClosurePreservationContinuityLedgerReceipt.postClosurePreservationContinuityLedgerReceipt.counts.executionAttemptCount).toBe(0);
    expect(postClosurePreservationContinuityLedgerReceipt.postClosurePreservationContinuityLedgerReceipt.counts.providerOutboundCallCount).toBe(0);
    expect(postClosurePreservationContinuityLedgerReceipt.postClosurePreservationContinuityLedgerReceipt.counts.externalNotificationSendCount).toBe(0);
    expect(postClosurePreservationContinuityLedgerReceipt.postClosurePreservationContinuityLedgerReceipt.counts.aiCallCount).toBe(0);
    expect(postClosurePreservationCustodyAuditReceipt.mode).toBe("mock");
    expect(postClosurePreservationCustodyAuditReceipt.postClosurePreservationCustodyAuditReceipt).toMatchObject({
      receiptKind: "qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-audit-receipt",
      postClosurePreservationCustodyAuditStatus: "blocked",
      postClosurePreservationContinuityLedgerStatus: "blocked",
      postClosurePreservationVerificationStatus: "blocked",
      tenantScopeStatus: "tenant_scoped",
      externalCalls: 0
    });
    expect(postClosurePreservationCustodyAuditReceipt.postClosurePreservationCustodyAuditReceipt.safeDigest).toContain("mockqahandoffcertifiedreleasefinalarchivesealpostclosurepreservationcustodyauditreceipt");
    expect(postClosurePreservationCustodyAuditReceipt.postClosurePreservationCustodyAuditReceipt.custodyAuditRows.map((row) => row.sprintNumber)).toEqual([103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114]);
    expect(postClosurePreservationCustodyAuditReceipt.postClosurePreservationCustodyAuditReceipt.counts.postClosurePreservationCustodyAuditMutationCount).toBe(0);
    expect(postClosurePreservationCustodyAuditReceipt.postClosurePreservationCustodyAuditReceipt.counts.executionAttemptCount).toBe(0);
    expect(postClosurePreservationCustodyAuditReceipt.postClosurePreservationCustodyAuditReceipt.counts.providerOutboundCallCount).toBe(0);
    expect(postClosurePreservationCustodyAuditReceipt.postClosurePreservationCustodyAuditReceipt.counts.externalNotificationSendCount).toBe(0);
    expect(postClosurePreservationCustodyAuditReceipt.postClosurePreservationCustodyAuditReceipt.counts.aiCallCount).toBe(0);
    expect(postClosurePreservationCustodyChainSealReceipt.mode).toBe("mock");
    expect(postClosurePreservationCustodyChainSealReceipt.postClosurePreservationCustodyChainSealReceipt).toMatchObject({
      receiptKind: "qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-chain-seal-receipt",
      postClosurePreservationCustodyChainSealStatus: "blocked",
      postClosurePreservationCustodyAuditStatus: "blocked",
      postClosurePreservationContinuityLedgerStatus: "blocked",
      postClosurePreservationVerificationStatus: "blocked",
      tenantScopeStatus: "tenant_scoped",
      externalCalls: 0
    });
    expect(postClosurePreservationCustodyChainSealReceipt.postClosurePreservationCustodyChainSealReceipt.safeDigest).toContain("mockqahandoffcertifiedreleasefinalarchivesealpostclosurepreservationcustodychainsealreceipt");
    expect(postClosurePreservationCustodyChainSealReceipt.postClosurePreservationCustodyChainSealReceipt.custodyChainSealRows.map((row) => row.sprintNumber)).toEqual([103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115]);
    expect(postClosurePreservationCustodyChainSealReceipt.postClosurePreservationCustodyChainSealReceipt.counts.postClosurePreservationCustodyChainSealMutationCount).toBe(0);
    expect(postClosurePreservationCustodyChainSealReceipt.postClosurePreservationCustodyChainSealReceipt.counts.executionAttemptCount).toBe(0);
    expect(postClosurePreservationCustodyChainSealReceipt.postClosurePreservationCustodyChainSealReceipt.counts.providerOutboundCallCount).toBe(0);
    expect(postClosurePreservationCustodyChainSealReceipt.postClosurePreservationCustodyChainSealReceipt.counts.externalNotificationSendCount).toBe(0);
    expect(postClosurePreservationCustodyChainSealReceipt.postClosurePreservationCustodyChainSealReceipt.counts.aiCallCount).toBe(0);
    expect(postClosurePreservationCustodyChainIntegrityLedgerReceipt.mode).toBe("mock");
    expect(postClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainIntegrityLedgerReceipt).toMatchObject({
      receiptKind: "qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-chain-integrity-ledger-receipt",
      postClosurePreservationCustodyChainIntegrityLedgerStatus: "blocked",
      postClosurePreservationCustodyChainSealStatus: "blocked",
      postClosurePreservationCustodyAuditStatus: "blocked",
      postClosurePreservationContinuityLedgerStatus: "blocked",
      postClosurePreservationVerificationStatus: "blocked",
      tenantScopeStatus: "tenant_scoped",
      providerOutboundStatus: "absent",
      externalNotificationStatus: "absent",
      aiCallStatus: "absent",
      externalCalls: 0
    });
    expect(postClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainIntegrityLedgerReceipt.safeDigest).toContain("mockqahandoffcertifiedreleasefinalarchivesealpostclosurepreservationcustodychainintegrityledgerreceipt");
    expect(postClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainIntegrityLedgerReceipt.safeFilename).toBe("provider-webhook-certified-release-post-closure-preservation-custody-chain-integrity-ledger-receipt.json");
    expect(postClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainIntegrityLedgerDigest).toBe(postClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainIntegrityLedgerReceipt.safeDigest);
    expect(postClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainIntegrityLedgerReceipt.custodyChainIntegrityLedgerRows.map((row) => row.sprintNumber)).toEqual([103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116]);
    expect(postClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainIntegrityLedgerReceipt.counts.postClosurePreservationCustodyChainIntegrityLedgerMutationCount).toBe(0);
    expect(postClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainIntegrityLedgerReceipt.counts.executionAttemptCount).toBe(0);
    expect(postClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainIntegrityLedgerReceipt.counts.providerOutboundCallCount).toBe(0);
    expect(postClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainIntegrityLedgerReceipt.counts.externalNotificationSendCount).toBe(0);
    expect(postClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainIntegrityLedgerReceipt.counts.aiCallCount).toBe(0);
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord).not.toHaveBeenCalled();
    expect(api.acknowledgeProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord).not.toHaveBeenCalled();
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun).not.toHaveBeenCalled();
    expect(api.runProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun).not.toHaveBeenCalled();
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedger).not.toHaveBeenCalled();
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificate).not.toHaveBeenCalled();
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister).not.toHaveBeenCalled();
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt).not.toHaveBeenCalled();
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseControlRoomPacket).not.toHaveBeenCalled();
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceipt).not.toHaveBeenCalled();
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceipt).not.toHaveBeenCalled();
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceipt).not.toHaveBeenCalled();
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceipt).not.toHaveBeenCalled();
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceipt).not.toHaveBeenCalled();
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceipt).not.toHaveBeenCalled();
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceipt).not.toHaveBeenCalled();
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacket).not.toHaveBeenCalled();
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceReceipt).not.toHaveBeenCalled();
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedger).not.toHaveBeenCalled();
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt).not.toHaveBeenCalled();
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollup).not.toHaveBeenCalled();
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt).not.toHaveBeenCalled();
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealOperationalClosureReceipt).not.toHaveBeenCalled();
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceipt).not.toHaveBeenCalled();
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceipt).not.toHaveBeenCalled();
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceipt).not.toHaveBeenCalled();
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealReceipt).not.toHaveBeenCalled();
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerReceipt).not.toHaveBeenCalled();
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt).not.toHaveBeenCalled();
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt).not.toHaveBeenCalled();
    expect(JSON.stringify({ pending, acknowledged, readback, initialDryRun, executedDryRun, dryRunReadback, resultLedger, finalReadinessCertificate, freezeAuditRegister, rollbackRehearsalReceipt, controlRoomPacket, cutoverChecklistReceipt, operatorCommandReceipt, goLiveAuthorizationReceipt, launchWindowConfirmationReceipt, goLiveHoldReleaseAuthorizationReceipt, launchApprovalReceipt, noExecutionLockReceipt, operationsHandoffReadinessPacket, operationsHandoffAcceptanceReceipt, operationsCustodyMonitoringReadinessLedger, operationsCustodyMonitoringCloseoutSealReceipt, finalNoExecutionEvidenceRollup, finalEvidenceIndexRegressionGuardrailReceipt, finalArchiveSealOperationalClosureReceipt, postClosurePreservationVerificationReceipt, postClosurePreservationContinuityLedgerReceipt, postClosurePreservationCustodyAuditReceipt, postClosurePreservationCustodyChainSealReceipt, postClosurePreservationCustodyChainIntegrityLedgerReceipt, postClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt, postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt })).not.toMatch(/providerRaw|payloadJson|raw-room|raw-sender|raw room|raw sender|accessToken|webhookSecret|bearer|"token"\s*:|"secret"\s*:|"replyToken"\s*:|"rawPayload"\s*:|"rawSignature"\s*:/i);
  });

  it("keeps mock/local assignment and escalation metadata actions available safely", async () => {
    const beforeItems = mockProviderWebhookUnmatchedInbound.map((item) => ({ ...item }));
    const beforeReadiness = { ...mockProviderReadiness };
    try {
      const assigned = await assignSettingsProviderWebhookUnmatchedInbound("mock", "provider-webhook-unmatched-local-1", {
        operation: "ASSIGN_TO_ME",
        note: "safe local assignment"
      });
      const assignedSnapshot = JSON.parse(JSON.stringify(assigned));
      const escalated = await escalateSettingsProviderWebhookUnmatchedInbound("mock", "provider-webhook-unmatched-local-1", {
        operation: "ESCALATE",
        escalationReason: "SLA_RISK",
        note: "safe local escalation"
      });
      const escalatedSnapshot = JSON.parse(JSON.stringify(escalated));
      const bulkAssigned = await bulkAssignSettingsProviderWebhookUnmatchedInbound("mock", {
        ids: ["provider-webhook-unmatched-local-1"],
        operation: "UNASSIGN"
      });
      const bulkEscalated = await bulkEscalateSettingsProviderWebhookUnmatchedInbound("mock", {
        ids: ["provider-webhook-unmatched-local-1"],
        operation: "CLEAR_ESCALATION"
      });

      expect(assignedSnapshot).toMatchObject({
        assignmentStatus: "assigned",
        reviewStatus: "pending",
        linkStatus: "none",
        unmatchedStatus: "review-needed",
        messagePersisted: false,
        externalCalls: 0
      });
      expect(escalatedSnapshot).toMatchObject({
        escalationStatus: "escalated",
        escalationReason: "SLA_RISK",
        reviewStatus: "pending",
        linkStatus: "none",
        unmatchedStatus: "review-needed",
        messagePersisted: false,
        externalCalls: 0
      });
      expect(bulkAssigned.summary.successCount).toBe(1);
      expect(bulkEscalated.summary.successCount).toBe(1);
      expect(api.assignProviderWebhookUnmatchedInbound).not.toHaveBeenCalled();
      expect(api.escalateProviderWebhookUnmatchedInbound).not.toHaveBeenCalled();
      expect(api.bulkAssignProviderWebhookUnmatchedInbound).not.toHaveBeenCalled();
      expect(api.bulkEscalateProviderWebhookUnmatchedInbound).not.toHaveBeenCalled();
      expect(JSON.stringify({ assignedSnapshot, escalatedSnapshot, bulkAssigned, bulkEscalated })).not.toMatch(/token|secret|authorization|cookie|providerRaw|rawPayload|payloadJson|replyToken|raw-room|raw-sender|senderId|roomId/i);
    } finally {
      mockProviderWebhookUnmatchedInbound.splice(0, mockProviderWebhookUnmatchedInbound.length, ...beforeItems);
      Object.assign(mockProviderReadiness, beforeReadiness);
    }
  });

  it("keeps mock/local resolution and checklist metadata actions available safely", async () => {
    const beforeItems = JSON.parse(JSON.stringify(mockProviderWebhookUnmatchedInbound));
    const beforeReadiness = { ...mockProviderReadiness };
    try {
      const resolved = await resolveSettingsProviderWebhookUnmatchedInbound("mock", "provider-webhook-unmatched-local-1", {
        operation: "SET_RESOLUTION",
        resolutionOutcome: "NEEDS_REVIEW",
        note: "safe local resolution"
      });
      const checked = await updateSettingsProviderWebhookUnmatchedInboundChecklist("mock", "provider-webhook-unmatched-local-1", {
        operation: "COMPLETE_STEP",
        step: "VIEWED_DIAGNOSTICS"
      });
      const bulkReset = await bulkResolveSettingsProviderWebhookUnmatchedInbound("mock", {
        ids: ["provider-webhook-unmatched-local-1"],
        operation: "RESET_CHECKLIST",
        note: "safe local checklist reset"
      });

      expect(resolved).toMatchObject({
        resolutionStatus: "resolved",
        resolutionOutcome: "NEEDS_REVIEW",
        reviewStatus: "pending",
        linkStatus: "none",
        unmatchedStatus: "review-needed",
        messagePersisted: false,
        externalCalls: 0
      });
      expect(checked).toMatchObject({
        reviewStatus: "pending",
        linkStatus: "none",
        unmatchedStatus: "review-needed",
        messagePersisted: false,
        externalCalls: 0
      });
      expect(bulkReset.summary.successCount).toBe(1);
      expect(api.resolveProviderWebhookUnmatchedInbound).not.toHaveBeenCalled();
      expect(api.updateProviderWebhookUnmatchedInboundChecklist).not.toHaveBeenCalled();
      expect(api.bulkResolveProviderWebhookUnmatchedInbound).not.toHaveBeenCalled();
      expect(JSON.stringify({ resolved, checked, bulkReset })).not.toMatch(/token|secret|authorization|cookie|providerRaw|rawPayload|payloadJson|replyToken|raw-room|raw-sender|senderId|roomId/i);
    } finally {
      mockProviderWebhookUnmatchedInbound.splice(0, mockProviderWebhookUnmatchedInbound.length, ...beforeItems);
      Object.assign(mockProviderReadiness, beforeReadiness);
    }
  });

  it("keeps mock/local bulk unmatched review available safely", async () => {
    const beforeItems = mockProviderWebhookUnmatchedInbound.map((item) => ({ ...item }));
    const beforeReadiness = { ...mockProviderReadiness };
    try {
      const result = await bulkReviewSettingsProviderWebhookUnmatchedInbound("mock", {
        ids: ["provider-webhook-unmatched-local-1", "provider-webhook-unmatched-local-1"],
        reviewStatus: "reviewed",
        reason: "safe local bulk"
      });

      expect(result.summary).toMatchObject({
        requestedCount: 2,
        dedupedCount: 1,
        successCount: 1,
        errorCount: 0
      });
      expect(result.results[0]).toMatchObject({
        id: "provider-webhook-unmatched-local-1",
        resultStatus: "updated",
        reviewStatus: "reviewed",
        externalCalls: 0
      });
      expect(api.bulkReviewProviderWebhookUnmatchedInbound).not.toHaveBeenCalled();
      expect(JSON.stringify(result)).not.toMatch(/token|secret|authorization|cookie|providerRaw|rawPayload|payloadJson|replyToken/i);
    } finally {
      mockProviderWebhookUnmatchedInbound.splice(0, mockProviderWebhookUnmatchedInbound.length, ...beforeItems);
      Object.assign(mockProviderReadiness, beforeReadiness);
    }
  });

  it("maps inbox canned replies from API responses and keeps API empty states separate from mock data", () => {
    const reply = mapSettingsCannedReplyToCannedReply(settingsCannedReplyResponse("reply-api"));

    expect(reply).toMatchObject({
      id: "reply-api",
      body: "Persisted hello",
      isActive: true
    });
    expect(searchCannedReplyList([reply], "hello").map((item) => item.id)).toEqual(["reply-api"]);
    expect(findCannedReplyInList([reply], "/hello extra")?.body).toBe("Persisted hello");
    expect(searchCannedReplyList([], "price")).toEqual([]);
  });

  it("uses only API canned reply data as the inbox source in API mode", () => {
    const apiReply = mapSettingsCannedReplyToCannedReply({
      ...settingsCannedReplyResponse("reply-api"),
      shortcut: "/apihello",
      bodyTemplate: "Persisted API hello"
    });
    const localReply = {
      id: "reply-local",
      title: "Local hello",
      shortcut: "/hello",
      body: "สวัสดีครับ สนใจเรื่องไหนครับ",
      tags: ["hello"],
      category: "general",
      isActive: true
    };

    const source = getCannedRepliesForMode("api", [apiReply], [localReply]);

    expect(source.map((reply) => reply.shortcut)).toEqual(["/apihello"]);
    expect(source.map((reply) => reply.body)).not.toContain("สวัสดีครับ สนใจเรื่องไหนครับ");
  });

  it("keeps mock/local canned reply data as the inbox source in mock mode", () => {
    const localReply = {
      id: "reply-local",
      title: "Local hello",
      shortcut: "/hello",
      body: "สวัสดีครับ สนใจเรื่องไหนครับ",
      tags: ["hello"],
      category: "general",
      isActive: true
    };

    expect(getCannedRepliesForMode("mock", [], [localReply])).toEqual([localReply]);
  });

  it("keeps API-mode canned reply failure empty instead of falling back to local replies", () => {
    const localReply = {
      id: "reply-local",
      title: "Local hello",
      shortcut: "/hello",
      body: "สวัสดีครับ สนใจเรื่องไหนครับ",
      tags: ["hello"],
      category: "general",
      isActive: true
    };

    expect(getCannedRepliesForMode("api", [], [localReply])).toEqual([]);
  });

  it("resolves an API canned reply into a composer draft without outbound calls", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const providerSend = vi.fn();
    const apiReply = mapSettingsCannedReplyToCannedReply({
      ...settingsCannedReplyResponse("reply-api"),
      bodyTemplate: "Persisted API body"
    });

    const draft = resolveCannedReplyComposerDraft([apiReply], "reply-api");

    expect(draft).toMatchObject({
      replyId: "reply-api",
      shortcut: "/hello",
      body: "Persisted API body"
    });
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(providerSend).not.toHaveBeenCalled();
  });
});

function settingsChannelResponse(id: string, platform: "webchat" | "line") {
  return {
    id,
    platform,
    accountName: platform === "line" ? "Persisted LINE" : "Persisted Webchat",
    accountKey: platform === "webchat" ? "demo-webchat" : null,
    status: "active",
    webhookUrl: `http://localhost:4000/webhooks/${platform}/${id}`,
    createdAt: "2026-05-21T04:00:00.000Z",
    updatedAt: "2026-05-21T04:00:00.000Z",
    lastInboundAt: "2026-05-21T04:10:00.000Z",
    lastMessageAt: "2026-05-21T04:12:00.000Z",
    hasAccessToken: true,
    tokenMasked: "configured:redacted",
    secretConfigured: true,
    secretMasked: "configured:redacted"
  };
}

function settingsTeamResponse(id: string) {
  return {
    id,
    name: "API Agent",
    displayName: "API Agent",
    role: "agent",
    email: "agent@example.local",
    status: "online",
    skills: ["support", "omnichannel"],
    maxConcurrentChats: 6,
    createdAt: "2026-05-21T04:00:00.000Z",
    updatedAt: "2026-05-21T04:00:00.000Z"
  };
}

function settingsSlaPolicyResponse(id: string) {
  return {
    id,
    name: "Urgent priority",
    description: "Persisted SLA",
    status: "active",
    priorityScope: "urgent",
    firstResponseMinutes: 5,
    resolutionMinutes: 120,
    businessHoursMode: "always",
    escalationRole: "admin",
    createdAt: "2026-05-21T04:00:00.000Z",
    updatedAt: "2026-05-21T04:00:00.000Z"
  };
}

function settingsCannedReplyResponse(id: string) {
  return {
    id,
    title: "Greeting",
    category: "general",
    shortcut: "/hello",
    bodyTemplate: "Persisted hello",
    tags: ["hello"],
    platformScope: [],
    roomScope: [],
    status: "active",
    createdAt: "2026-05-21T04:00:00.000Z",
    updatedAt: "2026-05-21T04:00:00.000Z"
  };
}

function providerReadinessResponse() {
  return {
    mode: "disabled",
    outboundEnabledByEnv: false,
    sandboxMode: "disabled",
    sandboxEnabled: false,
    channelMode: "mock",
    metaChannelMode: "mock",
    realOutboundEnabled: false,
    allowlistCount: 2,
    allowlist: {
      configured: true,
      entryCount: 2
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
    savedViewCount: 1,
    operatorNoteCount: 1,
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
    unmatchedInboundStaleOpenCount: 0,
    unmatchedInboundQueuedCount: 1,
    unmatchedInboundReplayBlockedCount: 0,
    unmatchedInboundReviewedCount: 0,
    unmatchedInboundSkippedCount: 0,
    unmatchedInboundLinkedCount: 0,
    latestUnmatchedInboundStatus: "review-needed",
    latestUnmatchedReviewActionStatus: null,
    latestUnmatchedLinkStatus: null,
    lastSandboxEventAt: "2026-05-31T00:00:00.000Z",
    externalCalls: 0,
    providers: [
      providerReadinessProviderResponse("line", true, true, 1),
      providerReadinessProviderResponse("telegram", true, true, 1),
      providerReadinessProviderResponse("facebook", false, false, 0),
      providerReadinessProviderResponse("instagram", false, false, 0)
    ]
  };
}

function providerReadinessProviderResponse(name: "line" | "telegram" | "facebook" | "instagram", configured: boolean, webhookConfigured: boolean, allowlistCount: number) {
  void allowlistCount;
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

function providerWebhookEventResponse(id: string, provider: "line" | "telegram" | "facebook" | "instagram" = "line") {
  return {
    id,
    tenantId: "00000000-0000-4000-8000-000000000001",
    provider,
    channel: provider,
    eventType: provider === "telegram" ? "webhook.verified" : "message.created",
    mode: "dry_run",
    status: provider === "telegram" ? "verified" : "received",
    receivedAt: "2026-05-31T00:00:00.000Z",
    payloadSummary: "Dry-run object payload accepted with 2 safe fields.",
    payloadFieldCount: 2,
    payloadDigest: "sha256:safeeventdigest",
    signatureVerified: true,
    signatureStatus: "verified",
    signatureAlgorithm: "hmac-sha256",
    signatureFingerprint: "sha256:safesignature",
    signedAt: "2026-05-31T00:00:00.000Z",
    replayDetected: false,
    replayStatus: "fresh",
    dedupKeyDigest: "sha256:safededupdigest",
    previousEventSeenAt: null,
    normalized: true,
    normalizationStatus: "normalized",
    normalizedEventType: "message",
    direction: "inbound",
    messageType: "text",
    textPreview: "Safe sandbox preview",
    textLength: 20,
    mediaSummary: null,
    senderKeyDigest: "sha256:safesenderdigest",
    roomKeyDigest: "sha256:saferoomdigest",
    dryRunRouting: true,
    routingStatus: "dry-run-only",
    conversationLookupStatus: "not-found",
    conversationKeyDigest: "sha256:safeconversationdigest",
    channelAccountId: `sandbox:${provider}`,
    roomIdDigest: "sha256:saferoomiddigest",
    inboundPersistenceMode: "dry-run",
    inboundPersistenceStatus: "dry-run-only",
    messagePersisted: false,
    persistedMessageId: null,
    conversationId: null,
    unmatchedInboundQueued: true,
    unmatchedInboundId: "provider-webhook-unmatched-api",
    unmatchedStatus: "review-needed",
    unmatchedReason: "safe-review-required-no-conversation-match",
    unmatchedReviewActionStatus: "none",
    unmatchedLinkStatus: "none",
    linkedConversationId: null,
    linkedMessageId: null,
    unmatchedResolvedAt: null,
    inboundAuditStatus: "recorded",
    externalCalls: 0
  };
}

function providerWebhookClosureChecklistResponse() {
  return [
    {
      step: "VIEWED_DIAGNOSTICS",
      completed: true,
      completedAt: "2026-05-31T00:03:00.000Z",
      completedByOperatorLabel: "operator:current"
    },
    {
      step: "REVIEWED_HISTORY",
      completed: false,
      completedAt: null,
      completedByOperatorLabel: null
    },
    {
      step: "REVIEWED_TRIAGE_GUIDANCE",
      completed: false,
      completedAt: null,
      completedByOperatorLabel: null
    },
    {
      step: "REVIEWED_CANDIDATES",
      completed: false,
      completedAt: null,
      completedByOperatorLabel: null
    },
    {
      step: "CONFIRMED_NO_RAW_LEAKAGE",
      completed: false,
      completedAt: null,
      completedByOperatorLabel: null
    },
    {
      step: "CONFIRMED_NO_PROVIDER_OUTBOUND",
      completed: false,
      completedAt: null,
      completedByOperatorLabel: null
    },
    {
      step: "CONFIRMED_ASSIGNMENT_OR_ESCALATION",
      completed: false,
      completedAt: null,
      completedByOperatorLabel: null
    },
    {
      step: "CONFIRMED_SAFE_LINK_TARGET",
      completed: false,
      completedAt: null,
      completedByOperatorLabel: null
    },
    {
      step: "CONFIRMED_OPERATOR_NOTE",
      completed: false,
      completedAt: null,
      completedByOperatorLabel: null
    }
  ];
}

function providerWebhookUnmatchedInboundResponse(id: string, provider: "line" | "telegram" | "facebook" | "instagram" = "line") {
  return {
    id,
    tenantId: "00000000-0000-4000-8000-000000000001",
    provider,
    channelAccountId: `sandbox:${provider}`,
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
    closureChecklist: providerWebhookClosureChecklistResponse(),
    checklistCompletedCount: 1,
    checklistTotalCount: 9,
    checklistIncompleteSteps: [
      "REVIEWED_HISTORY",
      "REVIEWED_TRIAGE_GUIDANCE",
      "REVIEWED_CANDIDATES",
      "CONFIRMED_NO_RAW_LEAKAGE",
      "CONFIRMED_NO_PROVIDER_OUTBOUND",
      "CONFIRMED_ASSIGNMENT_OR_ESCALATION",
      "CONFIRMED_SAFE_LINK_TARGET",
      "CONFIRMED_OPERATOR_NOTE"
    ],
    recommendedNextActions: ["VIEW_HISTORY", "RUN_CANDIDATE_LOOKUP", "ADD_OPERATOR_NOTE"],
    lastOperatorNoteAt: null,
    historyAvailable: true,
    diagnosticsAvailable: true,
    candidatesAvailable: true,
    payloadDigest: "sha256:safeeventdigest",
    providerEventDigest: "sha256:safededupdigest",
    deliveryDigest: "sha256:safededupdigest",
    senderKeyDigest: "sha256:safesenderdigest",
    roomKeyDigest: "sha256:saferoomdigest",
    textPreview: "Safe sandbox preview",
    textLength: 20,
    receivedAt: "2026-05-31T00:00:00.000Z",
    externalCalls: 0
  };
}

function providerWebhookUnmatchedInboundPageResponse(items = [providerWebhookUnmatchedInboundResponse("provider-webhook-unmatched-api")]) {
  return {
    items,
    pagination: {
      totalCount: items.length,
      limit: 10,
      offset: 0,
      returnedCount: items.length,
      hasNextPage: false,
      hasPreviousPage: false
    },
    appliedFilters: {
      limit: 10,
      offset: 0,
      sortBy: "receivedAt",
      sortOrder: "desc"
    },
    appliedSort: {
      sortBy: "receivedAt",
      sortOrder: "desc"
    },
    summary: {
      openCount: items.filter((item) => item.unmatchedStatus === "open" || item.unmatchedStatus === "review-needed").length,
      reviewedCount: items.filter((item) => item.reviewStatus === "reviewed").length,
      skippedCount: items.filter((item) => item.reviewStatus === "skipped").length,
      linkedCount: items.filter((item) => item.reviewStatus === "linked").length
    },
    externalCalls: 0
  };
}

function providerWebhookBulkReviewResponse(reviewStatus: "reviewed" | "skipped") {
  return {
    reviewStatus,
    results: [
      {
        id: "provider-webhook-unmatched-api",
        ok: true,
        resultStatus: "updated",
        reviewStatus,
        unmatchedStatus: reviewStatus,
        error: null,
        externalCalls: 0
      }
    ],
    summary: {
      requestedCount: 1,
      dedupedCount: 1,
      successCount: 1,
      errorCount: 0,
      updatedCount: 1,
      alreadyAppliedCount: 0
    },
    externalCalls: 0
  };
}

function providerWebhookBulkAssignmentResponse(operation: "ASSIGN_TO_ME" | "ASSIGN_TO_OPERATOR" | "UNASSIGN") {
  return {
    operation,
    results: [
      {
        id: "provider-webhook-unmatched-api",
        ok: true,
        resultStatus: "updated",
        assignmentStatus: operation === "UNASSIGN" ? "unassigned" : "assigned",
        escalationStatus: "none",
        escalationReason: null,
        error: null,
        externalCalls: 0
      }
    ],
    summary: {
      requestedCount: 1,
      dedupedCount: 1,
      successCount: 1,
      errorCount: 0,
      updatedCount: 1,
      alreadyAppliedCount: 0
    },
    externalCalls: 0
  };
}

function providerWebhookBulkEscalationResponse(operation: "ESCALATE" | "CLEAR_ESCALATION") {
  return {
    operation,
    results: [
      {
        id: "provider-webhook-unmatched-api",
        ok: true,
        resultStatus: "updated",
        assignmentStatus: "assigned",
        escalationStatus: operation === "ESCALATE" ? "escalated" : "none",
        escalationReason: operation === "ESCALATE" ? "SLA_RISK" : null,
        error: null,
        externalCalls: 0
      }
    ],
    summary: {
      requestedCount: 1,
      dedupedCount: 1,
      successCount: 1,
      errorCount: 0,
      updatedCount: 1,
      alreadyAppliedCount: 0
    },
    externalCalls: 0
  };
}

function providerWebhookBulkResolutionResponse(operation: "SET_RESOLUTION" | "CLEAR_RESOLUTION" | "COMPLETE_STEP" | "RESET_CHECKLIST") {
  return {
    operation,
    results: [
      {
        id: "provider-webhook-unmatched-api",
        ok: true,
        resultStatus: "updated",
        resolutionStatus: operation === "CLEAR_RESOLUTION" ? "unresolved" : "resolved",
        resolutionOutcome: operation === "CLEAR_RESOLUTION" ? null : "NEEDS_REVIEW",
        closureReadiness: "NOT_READY",
        checklistCompletedCount: operation === "RESET_CHECKLIST" ? 0 : 1,
        checklistTotalCount: 9,
        error: null,
        externalCalls: 0
      }
    ],
    summary: {
      requestedCount: 1,
      dedupedCount: 1,
      successCount: 1,
      errorCount: 0,
      updatedCount: 1,
      alreadyAppliedCount: 0
    },
    externalCalls: 0
  };
}

function providerWebhookCandidateResponse(conversationId: string, provider: "line" | "telegram" | "facebook" | "instagram" = "line") {
  return {
    conversationId,
    platform: provider,
    channelAccountId: `sandbox:${provider}`,
    roomIdDigest: "sha256:saferoomdigest",
    safeRoomLabel: `${provider} conversation digest match`,
    latestMessagePreview: "Safe candidate preview",
    latestMessageAt: "2026-05-31T00:00:00.000Z",
    matchReason: "platform, channel account, and room digest match",
    matchConfidence: 0.98,
    externalCalls: 0
  };
}

function providerWebhookReviewSavedViewResponse(id: string) {
  return {
    id,
    name: "Safe queue view",
    description: "safe filter preset",
    tenantId: "00000000-0000-4000-8000-000000000001",
    ownerId: "operator-safe",
    createdBy: "operator:operator-saf",
    filters: {
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      eventType: "message.created",
      severity: "info",
      triageLane: "safe_link_candidate_available",
      assignedTo: "me",
      assignmentStatus: "assigned_to_me",
      escalationStatus: "escalated",
      escalationReason: "SLA_RISK",
      resolutionStatus: "unresolved",
      resolutionOutcome: "NEEDS_REVIEW",
      closureReadiness: "NOT_READY",
      checklistIncomplete: true,
      receivedAtFrom: "2026-05-31T00:00:00.000Z",
      pageSize: 10
    },
    sort: {
      sortBy: "receivedAt",
      sortDirection: "desc"
    },
    pinned: true,
    isDefault: true,
    archived: false,
    createdAt: "2026-05-31T00:00:00.000Z",
    updatedAt: "2026-05-31T00:00:00.000Z",
    externalCalls: 0
  };
}

function providerWebhookOperatorNoteResponse(id: string) {
  return {
    id,
    unmatchedId: "provider-webhook-unmatched-api",
    tenantId: "00000000-0000-4000-8000-000000000001",
    authorId: "operator-safe",
    authorLabel: "operator:operator-saf",
    note: "Checked safely with local context only.",
    context: {
      provider: "line",
      platform: "line",
      channelAccountId: "sandbox:line",
      safeRoomLabel: "line room digest saferoomdige",
      roomKeyDigest: "sha256:saferoomdigest",
      eventType: "message.created",
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      assignmentStatus: "unassigned",
      assignedToOperatorLabel: null,
      escalationStatus: "none",
      escalationReason: null,
      resolutionStatus: "unresolved",
      resolutionOutcome: null,
      closureReadiness: "NOT_READY",
      checklistCompletedCount: 1,
      checklistTotalCount: 9
    },
    createdAt: "2026-05-31T00:00:00.000Z",
    updatedAt: "2026-05-31T00:00:00.000Z",
    externalCalls: 0
  };
}

function providerWebhookHistoryResponse(unmatchedInboundId: string) {
  return {
    unmatchedInboundId,
    provider: "line",
    channelAccountId: "sandbox:line",
    safeRoomLabel: "line room digest saferoomdige",
    roomKeyDigest: "sha256:saferoomdigest",
    entries: [
      providerWebhookHistoryEntryResponse(unmatchedInboundId, "inbound_received", "received"),
      providerWebhookHistoryEntryResponse(unmatchedInboundId, "unmatched_queued", "review-needed")
    ],
    externalCalls: 0
  };
}

function providerWebhookHistoryEntryResponse(unmatchedInboundId: string, action: "inbound_received" | "unmatched_queued", actionStatus: string) {
  return {
    id: `${unmatchedInboundId}-${action}`,
    unmatchedInboundId,
    provider: "line",
    channelAccountId: "sandbox:line",
    safeRoomLabel: "line room digest saferoomdige",
    roomKeyDigest: "sha256:saferoomdigest",
    eventType: "message.created",
    action,
    actionStatus,
    statusBefore: action === "inbound_received" ? null : "dry-run-only",
    statusAfter: actionStatus,
    actor: "system",
    reason: "safe-review-required-no-conversation-match",
    message: "Safe history entry",
    linkedConversationId: null,
    linkedMessageId: null,
    receivedAt: "2026-05-31T00:00:00.000Z",
    actionAt: "2026-05-31T00:00:00.000Z",
    externalCalls: 0
  };
}

function providerWebhookExportResponse(items = [providerWebhookUnmatchedInboundResponse("provider-webhook-unmatched-api")], format: "json" | "csv" = "json") {
  const rows = items.map((item) => ({
    id: item.id,
    provider: item.provider,
    channelAccountId: item.channelAccountId,
    safeRoomLabel: `${item.provider} room digest saferoomdige`,
    roomKeyDigest: item.roomKeyDigest,
    eventType: item.eventType,
    reviewStatus: item.reviewStatus,
    linkStatus: item.linkStatus,
    unmatchedStatus: item.unmatchedStatus,
    receivedAt: item.receivedAt,
    reviewedAt: item.reviewedAt,
    linkedConversationId: item.linkedConversationId,
    candidateCount: null,
    safeMessagePreview: item.textPreview,
    safeReason: item.unmatchedReason,
    safeResultSummary: item.reviewStatus,
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
    externalCalls: 0
  }));
  return {
    format,
    rows,
    csv: format === "csv" ? "id,provider\nprovider-webhook-unmatched-api,line" : null,
    appliedFilters: {
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      offset: 10,
      sortBy: "receivedAt",
      sortOrder: "asc",
      format,
      limit: 25
    },
    appliedSort: {
      sortBy: "receivedAt",
      sortOrder: "asc"
    },
    requestedLimit: 25,
    exportMaxLimit: 500,
    exportedCount: rows.length,
    externalCalls: 0
  };
}

function providerWebhookReviewMetricsResponse() {
  return {
    generatedAt: "2026-05-31T00:05:00.000Z",
    appliedFilters: {
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      eventType: "message.created"
    },
    totalEvents: 1,
    totalUnmatched: 1,
    openUnmatched: 1,
    reviewedCount: 0,
    skippedCount: 0,
    linkedCount: 0,
    persistedInboundCount: 0,
    signatureRejectedCount: 0,
    replayRejectedCount: 0,
    byProvider: [
      { key: "line", label: "line", count: 1 },
      { key: "telegram", label: "telegram", count: 0 },
      { key: "facebook", label: "facebook", count: 0 },
      { key: "instagram", label: "instagram", count: 0 }
    ],
    byEventType: [
      { key: "message.created", label: "message.created", count: 1 },
      { key: "webhook.verified", label: "webhook.verified", count: 0 },
      { key: "webhook.failed", label: "webhook.failed", count: 0 }
    ],
    byReviewStatus: [
      { key: "pending", label: "pending", count: 1 },
      { key: "reviewed", label: "reviewed", count: 0 },
      { key: "skipped", label: "skipped", count: 0 },
      { key: "linked", label: "linked", count: 0 }
    ],
    byLinkStatus: [
      { key: "none", label: "none", count: 1 },
      { key: "rejected", label: "rejected", count: 0 },
      { key: "linked", label: "linked", count: 0 },
      { key: "linked-message-persisted", label: "linked-message-persisted", count: 0 },
      { key: "duplicate-noop", label: "duplicate-noop", count: 0 }
    ],
    byUnmatchedStatus: [
      { key: "open", label: "open", count: 0 },
      { key: "review-needed", label: "review-needed", count: 1 },
      { key: "reviewed", label: "reviewed", count: 0 },
      { key: "blocked", label: "blocked", count: 0 },
      { key: "skipped", label: "skipped", count: 0 },
      { key: "linked", label: "linked", count: 0 },
      { key: "duplicate-skipped", label: "duplicate-skipped", count: 0 }
    ],
    ageBuckets: {
      under1Hour: 1,
      oneTo24Hours: 0,
      oneTo3Days: 0,
      over3Days: 0
    },
    funnel: {
      inboundReceived: 1,
      persisted: 0,
      unmatchedQueued: 1,
      reviewed: 0,
      skipped: 0,
      linked: 0,
      exportedHistoryAvailable: 1
    },
    latestReceivedAt: "2026-05-31T00:00:00.000Z",
    oldestOpenReceivedAt: "2026-05-31T00:00:00.000Z",
    externalCalls: 0
  };
}

function providerWebhookReviewAlertsResponse() {
  return {
    generatedAt: "2026-05-31T00:06:00.000Z",
    appliedFilters: {
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      eventType: "message.created",
      severity: "critical"
    },
    totalAlerts: 1,
    infoCount: 0,
    warningCount: 0,
    criticalCount: 1,
    staleOpenCount: 1,
    overSlaCount: 1,
    oldestOpenReceivedAt: "2026-05-31T00:00:00.000Z",
    latestAlertGeneratedAt: "2026-05-31T00:06:00.000Z",
    thresholds: {
      staleWarningHours: 24,
      staleCriticalHours: 72,
      overSlaHours: 48
    },
    byProvider: [
      { key: "line", label: "line", count: 1 },
      { key: "telegram", label: "telegram", count: 0 },
      { key: "facebook", label: "facebook", count: 0 },
      { key: "instagram", label: "instagram", count: 0 }
    ],
    byPlatform: [
      { key: "line", label: "line", count: 1 },
      { key: "telegram", label: "telegram", count: 0 },
      { key: "facebook", label: "facebook", count: 0 },
      { key: "instagram", label: "instagram", count: 0 }
    ],
    byEventType: [
      { key: "message.created", label: "message.created", count: 1 },
      { key: "webhook.verified", label: "webhook.verified", count: 0 },
      { key: "webhook.failed", label: "webhook.failed", count: 0 }
    ],
    byReviewStatus: [
      { key: "pending", label: "pending", count: 1 },
      { key: "reviewed", label: "reviewed", count: 0 },
      { key: "skipped", label: "skipped", count: 0 },
      { key: "linked", label: "linked", count: 0 }
    ],
    byLinkStatus: [
      { key: "none", label: "none", count: 1 },
      { key: "rejected", label: "rejected", count: 0 },
      { key: "linked", label: "linked", count: 0 },
      { key: "linked-message-persisted", label: "linked-message-persisted", count: 0 },
      { key: "duplicate-noop", label: "duplicate-noop", count: 0 }
    ],
    byUnmatchedStatus: [
      { key: "open", label: "open", count: 0 },
      { key: "review-needed", label: "review-needed", count: 1 },
      { key: "reviewed", label: "reviewed", count: 0 },
      { key: "blocked", label: "blocked", count: 0 },
      { key: "skipped", label: "skipped", count: 0 },
      { key: "linked", label: "linked", count: 0 },
      { key: "duplicate-skipped", label: "duplicate-skipped", count: 0 }
    ],
    bySeverity: [
      { key: "info", label: "info", count: 0 },
      { key: "warning", label: "warning", count: 0 },
      { key: "critical", label: "critical", count: 1 }
    ],
    alertItems: [{
      unmatchedId: "provider-webhook-unmatched-api",
      provider: "line",
      platform: "line",
      channelAccountId: "sandbox:line",
      safeRoomLabel: "line room digest saferoomdige",
      roomKeyDigest: "sha256:saferoomdigest",
      eventType: "message.created",
      receivedAt: "2026-05-31T00:00:00.000Z",
      ageBucket: "over3Days",
      severity: "critical",
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      routingOutcome: "dry-run-only/not-found",
      diagnosticsAvailable: true,
      historyAvailable: true,
      externalCalls: 0
    }],
    externalCalls: 0
  };
}

function providerWebhookReviewTriageResponse() {
  return {
    generatedAt: "2026-05-31T00:07:00.000Z",
    appliedFilters: {
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      eventType: "message.created",
      severity: "critical",
      triageLane: "critical_stale_open"
    },
    totalItems: 1,
    totalOpenItems: 1,
    totalTriageLanes: 8,
    thresholds: {
      staleWarningHours: 24,
      staleCriticalHours: 72,
      overSlaHours: 48
    },
    lanes: [
      {
        laneKey: "critical_stale_open",
        label: "Critical stale open",
        severity: "critical",
        count: 1,
        description: "Open unmatched inbound items past the critical review threshold.",
        recommendedNextActions: ["OPEN_DIAGNOSTICS", "VIEW_HISTORY", "APPLY_FILTER", "MARK_REVIEWED", "SKIP"],
        safeDrilldownFilters: { status: "open" }
      }
    ],
    byProvider: [
      { key: "line", label: "line", count: 1 },
      { key: "telegram", label: "telegram", count: 0 },
      { key: "facebook", label: "facebook", count: 0 },
      { key: "instagram", label: "instagram", count: 0 }
    ],
    byPlatform: [
      { key: "line", label: "line", count: 1 },
      { key: "telegram", label: "telegram", count: 0 },
      { key: "facebook", label: "facebook", count: 0 },
      { key: "instagram", label: "instagram", count: 0 }
    ],
    byEventType: [
      { key: "message.created", label: "message.created", count: 1 },
      { key: "webhook.verified", label: "webhook.verified", count: 0 },
      { key: "webhook.failed", label: "webhook.failed", count: 0 }
    ],
    byReviewStatus: [
      { key: "pending", label: "pending", count: 1 },
      { key: "reviewed", label: "reviewed", count: 0 },
      { key: "skipped", label: "skipped", count: 0 },
      { key: "linked", label: "linked", count: 0 }
    ],
    byLinkStatus: [
      { key: "none", label: "none", count: 1 },
      { key: "rejected", label: "rejected", count: 0 },
      { key: "linked", label: "linked", count: 0 },
      { key: "linked-message-persisted", label: "linked-message-persisted", count: 0 },
      { key: "duplicate-noop", label: "duplicate-noop", count: 0 }
    ],
    byUnmatchedStatus: [
      { key: "open", label: "open", count: 0 },
      { key: "review-needed", label: "review-needed", count: 1 },
      { key: "reviewed", label: "reviewed", count: 0 },
      { key: "blocked", label: "blocked", count: 0 },
      { key: "skipped", label: "skipped", count: 0 },
      { key: "linked", label: "linked", count: 0 },
      { key: "duplicate-skipped", label: "duplicate-skipped", count: 0 }
    ],
    byLane: [
      { key: "critical_stale_open", label: "critical_stale_open", count: 1 },
      { key: "warning_stale_open", label: "warning_stale_open", count: 0 },
      { key: "candidate_lookup_recommended", label: "candidate_lookup_recommended", count: 0 },
      { key: "safe_link_candidate_available", label: "safe_link_candidate_available", count: 0 },
      { key: "needs_manual_review", label: "needs_manual_review", count: 0 },
      { key: "recently_reviewed", label: "recently_reviewed", count: 0 },
      { key: "skipped_ignored", label: "skipped_ignored", count: 0 },
      { key: "failed_routing_missing_match", label: "failed_routing_missing_match", count: 0 }
    ],
    topItems: [{
      unmatchedId: "provider-webhook-unmatched-api",
      provider: "line",
      platform: "line",
      channelAccountId: "sandbox:line",
      safeRoomLabel: "line room digest saferoomdige",
      roomKeyDigest: "sha256:saferoomdigest",
      eventType: "message.created",
      receivedAt: "2026-05-31T00:00:00.000Z",
      ageBucket: "over3Days",
      triageLane: "critical_stale_open",
      severity: "critical",
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      routingOutcome: "dry-run-only/not-found",
      recommendedNextActions: ["OPEN_DIAGNOSTICS", "VIEW_HISTORY", "APPLY_FILTER", "MARK_REVIEWED", "SKIP"],
      diagnosticsAvailable: true,
      historyAvailable: true,
      candidatesAvailable: true,
      exportAvailable: true,
      externalCalls: 0
    }],
    externalCalls: 0
  };
}

function providerWebhookReviewWorkloadResponse() {
  const topItem = providerWebhookAssignmentSummaryItemResponse();
  return {
    generatedAt: "2026-05-31T00:08:00.000Z",
    appliedFilters: {
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      eventType: "message.created",
      assignmentStatus: "assigned_to_me",
      escalationStatus: "escalated",
      escalationReason: "SLA_RISK",
      severity: "critical",
      triageLane: "critical_stale_open"
    },
    totalItems: 1,
    totalOpenItems: 1,
    thresholds: {
      staleWarningHours: 24,
      staleCriticalHours: 72,
      overSlaHours: 48
    },
    counts: {
      unassignedOpen: 0,
      assignedToMeOpen: 1,
      assignedToOthersOpen: 0,
      assignedOpen: 1,
      escalatedOpen: 1,
      overdueAssignedOpen: 0,
      recentlyAssigned: 1,
      recentlyEscalated: 1,
      resolvedAssigned: 0,
      unresolvedOpen: 1,
      readyForClosure: 0,
      blockedResolution: 0,
      checklistIncompleteOpen: 1
    },
    byAssignee: [
      { key: "operator:current", label: "operator:current", count: 1 }
    ],
    byAssignmentStatus: [
      { key: "unassigned", label: "unassigned", count: 0 },
      { key: "assigned", label: "assigned", count: 1 }
    ],
    byEscalationStatus: [
      { key: "none", label: "none", count: 0 },
      { key: "escalated", label: "escalated", count: 1 }
    ],
    byEscalationReason: [
      { key: "none", label: "none", count: 0 },
      { key: "SLA_RISK", label: "SLA_RISK", count: 1 }
    ],
    byProvider: [
      { key: "line", label: "line", count: 1 }
    ],
    byPlatform: [
      { key: "line", label: "line", count: 1 }
    ],
    byReviewStatus: [
      { key: "pending", label: "pending", count: 1 }
    ],
    byLinkStatus: [
      { key: "none", label: "none", count: 1 }
    ],
    byUnmatchedStatus: [
      { key: "review-needed", label: "review-needed", count: 1 }
    ],
    topAssignedItems: [topItem],
    topEscalatedItems: [topItem],
    externalCalls: 0
  };
}

function providerWebhookReviewResolutionSummaryResponse() {
  const {
    assignedAt,
    assignedByOperatorLabel,
    escalatedAt,
    escalatedByOperatorLabel,
    ...baseItem
  } = providerWebhookAssignmentSummaryItemResponse();
  void assignedAt;
  void assignedByOperatorLabel;
  void escalatedAt;
  void escalatedByOperatorLabel;
  const item = {
    ...baseItem,
    resolvedAt: null,
    resolvedByOperatorLabel: null,
    closureChecklist: providerWebhookClosureChecklistResponse(),
    checklistIncompleteSteps: [
      "REVIEWED_HISTORY",
      "REVIEWED_TRIAGE_GUIDANCE",
      "REVIEWED_CANDIDATES",
      "CONFIRMED_NO_RAW_LEAKAGE",
      "CONFIRMED_NO_PROVIDER_OUTBOUND",
      "CONFIRMED_ASSIGNMENT_OR_ESCALATION",
      "CONFIRMED_SAFE_LINK_TARGET",
      "CONFIRMED_OPERATOR_NOTE"
    ],
    recommendedNextActions: ["VIEW_HISTORY", "RUN_CANDIDATE_LOOKUP", "ADD_OPERATOR_NOTE"]
  };
  return {
    generatedAt: "2026-05-31T00:09:00.000Z",
    appliedFilters: {
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      eventType: "message.created",
      assignmentStatus: "assigned_to_me",
      escalationStatus: "escalated",
      escalationReason: "SLA_RISK",
      resolutionStatus: "unresolved",
      resolutionOutcome: "NEEDS_REVIEW",
      closureReadiness: "NOT_READY",
      checklistIncomplete: true,
      severity: "critical",
      triageLane: "critical_stale_open"
    },
    totalItems: 1,
    totalOpenItems: 1,
    thresholds: {
      staleWarningHours: 24,
      staleCriticalHours: 72,
      overSlaHours: 48
    },
    counts: {
      unresolvedOpen: 1,
      readyForReview: 0,
      readyForSkip: 0,
      readyForLink: 0,
      readyForLinkAndPersist: 0,
      blocked: 0,
      resolvedRecently: 0,
      checklistIncompleteOpen: 1
    },
    byResolutionStatus: [{ key: "unresolved", label: "unresolved", count: 1 }],
    byResolutionOutcome: [{ key: "NEEDS_REVIEW", label: "NEEDS_REVIEW", count: 1 }],
    byClosureReadiness: [{ key: "NOT_READY", label: "NOT_READY", count: 1 }],
    byChecklistStep: [{ key: "REVIEWED_HISTORY", label: "REVIEWED_HISTORY", count: 1 }],
    byProvider: [{ key: "line", label: "line", count: 1 }],
    byPlatform: [{ key: "line", label: "line", count: 1 }],
    byReviewStatus: [{ key: "pending", label: "pending", count: 1 }],
    byLinkStatus: [{ key: "none", label: "none", count: 1 }],
    byUnmatchedStatus: [{ key: "review-needed", label: "review-needed", count: 1 }],
    topReadyItems: [item],
    topBlockedItems: [],
    externalCalls: 0
  };
}

function providerWebhookReviewClosureReportResponse() {
  const { generatedAt: _generatedAt, ...item } = providerWebhookClosureEvidenceResponse("provider-webhook-unmatched-api");
  void _generatedAt;
  return {
    generatedAt: "2026-06-04T00:00:00.000Z",
    appliedFilters: {
      provider: "line",
      resolutionStatus: "resolved",
      resolutionOutcome: "NEEDS_REVIEW",
      closureReadiness: "READY_FOR_REVIEW",
      checklistIncomplete: false,
      assignmentStatus: "assigned_to_me"
    },
    totalItems: 1,
    totalOpenItems: 1,
    evidenceReadyCount: 1,
    evidenceBlockedCount: 0,
    evidenceIncompleteCount: 0,
    byClosureReadiness: [{ key: "READY_FOR_REVIEW", label: "READY_FOR_REVIEW", count: 1 }],
    byResolutionOutcome: [{ key: "NEEDS_REVIEW", label: "NEEDS_REVIEW", count: 1 }],
    byChecklistStep: [{ key: "CONFIRMED_NO_RAW_LEAKAGE", label: "CONFIRMED_NO_RAW_LEAKAGE", count: 0 }],
    byAssignmentStatus: [{ key: "assigned", label: "assigned", count: 1 }],
    byEscalationStatus: [{ key: "escalated", label: "escalated", count: 1 }],
    topEvidenceReadyItems: [item],
    topEvidenceBlockedItems: [],
    externalCalls: 0
  };
}

function providerWebhookReviewClosureReportExportResponse() {
  return {
    ...providerWebhookReviewClosureReportResponse(),
    exportKind: "closure-report",
    format: "json",
    contentType: "application/json",
    safeFilename: "provider-webhook-review-closure-report.json",
    exportedAt: "2026-06-04T00:02:00.000Z"
  };
}

function providerWebhookClosureEvidenceResponse(unmatchedId: string) {
  return {
    generatedAt: "2026-06-04T00:00:00.000Z",
    unmatchedId,
    provider: "line",
    platform: "line",
    channelAccountId: "sandbox:line",
    safeRoomLabel: "line room digest saferoomdige",
    roomKeyDigest: "sha256:saferoomdigest",
    eventType: "message.created",
    receivedAt: "2026-05-31T00:00:00.000Z",
    ageBucket: "over3Days",
    reviewStatus: "pending",
    linkStatus: "none",
    unmatchedStatus: "review-needed",
    triageLane: "safe_link_candidate_available",
    severity: "info",
    assignmentStatus: "assigned",
    assignedToOperatorLabel: "operator:current",
    escalationStatus: "escalated",
    escalationReason: "SLA_RISK",
    resolutionStatus: "resolved",
    resolutionOutcome: "NEEDS_REVIEW",
    closureReadiness: "READY_FOR_REVIEW",
    evidenceStatus: "ready",
    checklistCompletedCount: 9,
    checklistTotalCount: 9,
    checklistIncompleteSteps: [],
    recommendedNextActions: ["MARK_REVIEWED"],
    evidenceFlags: {
      diagnosticsViewedOrAvailable: true,
      historyAvailable: true,
      operatorNotesAvailable: true,
      candidatesAvailable: true,
      assignmentOrEscalationPresent: true,
      noProviderOutboundConfirmed: true,
      noRawLeakageConfirmed: true,
      safeLinkTargetConfirmed: true
    },
    historyEntryCount: 3,
    operatorNoteCount: 2,
    candidateSummaryCount: 1,
    externalCalls: 0
  };
}

function providerWebhookClosureEvidenceExportResponse(unmatchedId: string) {
  return {
    ...providerWebhookClosureEvidenceResponse(unmatchedId),
    exportKind: "closure-evidence",
    format: "json",
    contentType: "application/json",
    safeFilename: `provider-webhook-closure-evidence-line-${unmatchedId}.json`,
    exportedAt: "2026-06-04T00:02:00.000Z"
  };
}

function providerWebhookReviewExportRedactionAuditResponse(auditTarget: "closure-report-export" | "closure-evidence-export", unmatchedId?: string) {
  return {
    generatedAt: "2026-06-04T00:03:00.000Z",
    auditTarget,
    status: "passed",
    checks: {
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
      safeRoomDigestPresent: true,
      tenantScoped: true,
      exportDeterministic: true
    },
    issues: [],
    ...(unmatchedId ? { unmatchedId } : {}),
    ...(auditTarget === "closure-report-export" ? { appliedFilters: { provider: "line", checklistIncomplete: false } } : {}),
    exportShapeVersion: "provider-webhook-closure-export-v1",
    safeDigest: "sha256:safeauditdigest",
    externalCalls: 0
  };
}

function providerWebhookReviewExportIntegrityResponse() {
  return {
    generatedAt: "2026-06-04T00:04:00.000Z",
    appliedFilters: { provider: "line", checklistIncomplete: false },
    externalCalls: 0,
    totalCheckedItems: 1,
    redactionPassedCount: 1,
    redactionWarningCount: 0,
    redactionBlockedCount: 0,
    deterministicExportConfirmed: true,
    exportShapeVersion: "provider-webhook-closure-export-v1",
    safeReportDigest: "sha256:safereportdigest"
  };
}

function providerWebhookReviewExportManifestResponse(auditTarget: "closure-report-export" | "closure-evidence-export", unmatchedId?: string) {
  return {
    generatedAt: "2026-06-04T00:05:00.000Z",
    manifestKind: "provider-webhook-review-export-manifest",
    manifestTarget: auditTarget,
    exportKind: auditTarget === "closure-report-export" ? "closure-report" : "closure-evidence",
    format: "json",
    contentType: "application/json",
    safeFilename: auditTarget === "closure-report-export"
      ? "provider-webhook-review-closure-report.json"
      : `provider-webhook-closure-evidence-line-${unmatchedId ?? "provider-webhook-unmatched-api"}.json`,
    exportedAt: "2026-06-04T00:02:00.000Z",
    exportShapeVersion: "provider-webhook-closure-export-v1",
    ...(unmatchedId ? { unmatchedId } : {}),
    ...(auditTarget === "closure-report-export" ? { appliedFilters: { provider: "line", checklistIncomplete: false } } : {}),
    totalItems: 1,
    totalOpenItems: 1,
    evidenceReadyCount: 1,
    evidenceBlockedCount: 0,
    evidenceIncompleteCount: 0,
    redactionStatus: "passed",
    redactionIssueCount: 0,
    redactionPassedCount: 1,
    redactionWarningCount: 0,
    redactionBlockedCount: 0,
    integrityStatus: "confirmed",
    deterministicExportConfirmed: true,
    safeDigest: "sha256:safeauditdigest",
    ...(auditTarget === "closure-report-export" ? { safeReportDigest: "sha256:safereportdigest" } : {}),
    manualQaReadiness: "ready",
    manualQaChecks: {
      safeFilenamePresent: true,
      safeDigestPresent: true,
      redactionPassedOrWarned: true,
      redactionBlockedAbsent: true,
      deterministicExportConfirmed: true,
      externalCallsZero: true,
      manualQaReady: true
    },
    externalCalls: 0
  };
}

function providerWebhookReviewQaHandoffBundleResponse() {
  const evidence = providerWebhookClosureEvidenceResponse("provider-webhook-unmatched-api");
  const evidenceManifest = providerWebhookReviewExportManifestResponse("closure-evidence-export", evidence.unmatchedId);
  return {
    generatedAt: "2026-06-04T00:06:00.000Z",
    bundleKind: "provider-webhook-review-qa-handoff-bundle",
    appliedFilters: { provider: "line", checklistIncomplete: false },
    readiness: {
      reviewClosureEvidenceEnabled: true,
      reviewClosureReportEnabled: true,
      reviewClosureEvidenceExportEnabled: true,
      reviewClosureReportExportEnabled: true,
      reviewExportRedactionAuditEnabled: true,
      reviewExportIntegrityChecksEnabled: true,
      reviewExportManifestEnabled: true,
      reviewExportQaHandoffEnabled: true,
      closureEvidenceReadyCount: 1,
      closureEvidenceBlockedCount: 0,
      closureEvidenceIncompleteCount: 0,
      closureEvidenceExportCount: 1,
      closureReportExportCount: 1,
      exportRedactionPassedCount: 1,
      exportRedactionWarningCount: 0,
      exportRedactionBlockedCount: 0,
      exportManifestReadyCount: 1,
      exportManifestNeedsReviewCount: 0,
      exportManifestBlockedCount: 0,
      latestExportManifestStatus: "ready",
      externalCalls: 0
    },
    closureReportExport: providerWebhookReviewClosureReportExportResponse(),
    closureReportManifest: providerWebhookReviewExportManifestResponse("closure-report-export"),
    closureReportRedactionAudit: providerWebhookReviewExportRedactionAuditResponse("closure-report-export"),
    closureExportIntegrity: providerWebhookReviewExportIntegrityResponse(),
    evidenceManifests: [{
      unmatchedId: evidence.unmatchedId,
      provider: evidence.provider,
      platform: evidence.platform,
      safeRoomLabel: evidence.safeRoomLabel,
      roomKeyDigest: evidence.roomKeyDigest,
      eventType: evidence.eventType,
      receivedAt: evidence.receivedAt,
      reviewStatus: evidence.reviewStatus,
      linkStatus: evidence.linkStatus,
      unmatchedStatus: evidence.unmatchedStatus,
      closureReadiness: evidence.closureReadiness,
      evidenceStatus: evidence.evidenceStatus,
      safeFilename: evidenceManifest.safeFilename,
      safeDigest: evidenceManifest.safeDigest,
      redactionStatus: evidenceManifest.redactionStatus,
      integrityStatus: evidenceManifest.integrityStatus,
      deterministicExportConfirmed: evidenceManifest.deterministicExportConfirmed,
      manualQaReadiness: evidenceManifest.manualQaReadiness,
      manualQaChecks: evidenceManifest.manualQaChecks,
      externalCalls: 0
    }],
    manualQaReadiness: "ready",
    manualQaChecks: {
      reportManifestReady: true,
      reportRedactionPassedOrWarned: true,
      reportIntegrityConfirmed: true,
      evidenceManifestsReadyOrNeedsReview: true,
      safeFilenamePresent: true,
      safeDigestPresent: true,
      rawPayloadAbsent: true,
      rawSignatureAbsent: true,
      tokenAbsent: true,
      replyTokenAbsent: true,
      rawSenderIdAbsent: true,
      rawRoomIdAbsent: true,
      providerOutboundAbsent: true,
      externalCallsZero: true,
      readinessFlagsPresent: true
    },
    safeFilename: "provider-webhook-review-qa-handoff-bundle.json",
    safeDigest: "sha256:safeqahandoffbundle",
    externalCalls: 0
  };
}

function providerWebhookReviewQaHandoffBundleExportResponse() {
  const bundle = providerWebhookReviewQaHandoffBundleResponse();
  return {
    generatedAt: bundle.generatedAt,
    exportedAt: "2026-06-04T00:06:05.000Z",
    exportKind: "qa-handoff-bundle",
    format: "json",
    contentType: "application/json",
    safeFilename: "provider-webhook-review-qa-handoff-bundle-export.json",
    safeDigest: "sha256:safeqahandoffbundleexport",
    status: "ready",
    counts: {
      totalItems: bundle.closureReportExport.totalItems,
      totalOpenItems: bundle.closureReportExport.totalOpenItems,
      evidenceManifestCount: bundle.evidenceManifests.length,
      closureEvidenceReadyCount: bundle.readiness.closureEvidenceReadyCount,
      closureEvidenceBlockedCount: bundle.readiness.closureEvidenceBlockedCount,
      closureEvidenceIncompleteCount: bundle.readiness.closureEvidenceIncompleteCount
    },
    readinessFlags: {
      reviewClosureEvidenceEnabled: true,
      reviewClosureReportEnabled: true,
      reviewClosureEvidenceExportEnabled: true,
      reviewClosureReportExportEnabled: true,
      reviewExportRedactionAuditEnabled: true,
      reviewExportIntegrityChecksEnabled: true,
      reviewExportManifestEnabled: true,
      reviewExportQaHandoffEnabled: true
    },
    closureEvidenceSummary: {
      readyCount: 1,
      blockedCount: 0,
      incompleteCount: 0,
      exportCount: 1,
      externalCalls: 0
    },
    exportManifestSummary: {
      readyCount: 1,
      needsReviewCount: 0,
      blockedCount: 0,
      latestStatus: "ready",
      reportManifestReadiness: "ready",
      reportManifestIntegrityStatus: "confirmed",
      externalCalls: 0
    },
    redactionAuditSummary: {
      status: "passed",
      issueCount: 0,
      passedCount: 1,
      warningCount: 0,
      blockedCount: 0,
      rawPayloadAbsent: true,
      rawSignatureAbsent: true,
      tokenAbsent: true,
      replyTokenAbsent: true,
      rawSenderIdAbsent: true,
      rawRoomIdAbsent: true,
      providerOutboundAbsent: true,
      externalCallsZero: true,
      externalCalls: 0
    },
    integritySummary: {
      status: "confirmed",
      totalCheckedItems: 1,
      deterministicExportConfirmed: true,
      safeReportDigest: "sha256:safereportdigest",
      externalCalls: 0
    },
    manualQaChecks: bundle.manualQaChecks,
    bundle,
    externalCalls: 0
  };
}

function providerWebhookReviewQaHandoffReceiptResponse() {
  const exportResult = providerWebhookReviewQaHandoffBundleExportResponse();
  return {
    generatedAt: "2026-05-21T04:00:00.000Z",
    receiptStatus: "not_acknowledged",
    bundleStatus: exportResult.bundle.manualQaReadiness,
    exportStatus: exportResult.status,
    safeFilename: "provider-webhook-review-qa-handoff-receipt.json",
    safeDigest: "sha256:safeqahandoffreceipt",
    bundleDigest: exportResult.bundle.safeDigest,
    exportDigest: exportResult.safeDigest,
    readinessFlags: exportResult.readinessFlags,
    counts: exportResult.counts,
    manualQaChecks: exportResult.manualQaChecks,
    reviewerRole: null,
    reviewerLabel: null,
    acknowledgedAt: null,
    signedAt: null,
    externalCalls: 0
  };
}

function providerWebhookReviewQaHandoffSignOffResponse() {
  return {
    ...providerWebhookReviewQaHandoffReceiptResponse(),
    receiptStatus: "signed_off",
    safeDigest: "sha256:safeqahandoffreceiptsigned",
    reviewerRole: "QA reviewer",
    reviewerLabel: "safe reviewer",
    acknowledgedAt: "2026-05-21T04:00:00.000Z",
    signedAt: "2026-05-21T04:00:00.000Z",
    signOffStatus: "signed_off",
    signOffRecordId: "provider-webhook-qa-handoff-signoff-1",
    action: "sign_off",
    externalCalls: 0
  };
}

function providerWebhookLockedArchiveResponse() {
  const signOff = providerWebhookReviewQaHandoffSignOffResponse();
  return {
    generatedAt: "2026-06-04T00:08:00.000Z",
    lockedArchiveStatus: "exported",
    retentionManifestStatus: "ready",
    archiveAcknowledgementStatus: "exported",
    acceptanceStatus: "locked",
    lockStatus: "locked",
    receiptStatus: signOff.receiptStatus,
    signOffStatus: signOff.signOffStatus,
    bundleStatus: signOff.bundleStatus,
    exportStatus: signOff.exportStatus,
    safeFilename: "provider-webhook-review-qa-handoff-locked-archive-export.json",
    safeDigest: "sha256:safeqahandofflockedarchive",
    bundleDigest: signOff.bundleDigest,
    exportDigest: signOff.exportDigest,
    receiptDigest: signOff.safeDigest,
    acceptanceLockDigest: "sha256:safeqahandoffacceptancelock",
    lockRecordId: "provider-webhook-qa-handoff-lock-1",
    readinessFlags: signOff.readinessFlags,
    counts: {
      ...signOff.counts,
      lockedItemCount: 1,
      lockedOpenItemCount: 1
    },
    manualQaChecks: signOff.manualQaChecks,
    retentionPolicyLabel: "safe-qa-handoff-locked-archive-retain-review-metadata-only",
    archivedAt: "2026-06-04T00:07:00.000Z",
    exportedAt: "2026-06-04T00:08:00.000Z",
    externalCalls: 0
  };
}

function providerWebhookRetentionManifestResponse() {
  const archive = providerWebhookLockedArchiveResponse();
  return {
    generatedAt: "2026-06-04T00:08:30.000Z",
    manifestKind: "qa-handoff-locked-archive-retention-manifest",
    retentionManifestStatus: "ready",
    lockedArchiveStatus: archive.lockedArchiveStatus,
    archiveAcknowledgementStatus: archive.archiveAcknowledgementStatus,
    acceptanceStatus: archive.acceptanceStatus,
    lockStatus: archive.lockStatus,
    receiptStatus: archive.receiptStatus,
    signOffStatus: archive.signOffStatus,
    bundleStatus: archive.bundleStatus,
    exportStatus: archive.exportStatus,
    safeFilename: "provider-webhook-review-qa-handoff-locked-archive-retention-manifest.json",
    safeDigest: "sha256:safeqahandoffretentionmanifest",
    archiveDigest: archive.safeDigest,
    bundleDigest: archive.bundleDigest,
    exportDigest: archive.exportDigest,
    receiptDigest: archive.receiptDigest,
    acceptanceLockDigest: archive.acceptanceLockDigest,
    retentionPolicyLabel: archive.retentionPolicyLabel,
    retentionReadiness: "ready",
    readinessFlags: archive.readinessFlags,
    counts: archive.counts,
    manualQaChecks: archive.manualQaChecks,
    archivedAt: archive.archivedAt,
    exportedAt: archive.exportedAt,
    externalCalls: 0
  };
}

function providerWebhookArchiveIntegrityResponse() {
  const archive = providerWebhookLockedArchiveResponse();
  const manifest = providerWebhookRetentionManifestResponse();
  return {
    generatedAt: "2026-06-04T00:09:00.000Z",
    integrityStatus: "confirmed",
    retentionAuditStatus: "confirmed",
    lockedArchiveStatus: archive.lockedArchiveStatus,
    retentionManifestStatus: manifest.retentionManifestStatus,
    archiveAcknowledgementStatus: archive.archiveAcknowledgementStatus,
    auditAcknowledgementStatus: "acknowledged",
    acceptanceStatus: archive.acceptanceStatus,
    lockStatus: archive.lockStatus,
    receiptStatus: archive.receiptStatus,
    signOffStatus: archive.signOffStatus,
    bundleStatus: archive.bundleStatus,
    exportStatus: archive.exportStatus,
    safeFilename: "provider-webhook-review-qa-handoff-locked-archive-integrity.json",
    safeDigest: "sha256:safeqahandoffarchiveintegrity",
    bundleDigest: archive.bundleDigest,
    exportDigest: archive.exportDigest,
    receiptDigest: archive.receiptDigest,
    acceptanceLockDigest: archive.acceptanceLockDigest,
    lockedArchiveDigest: archive.safeDigest,
    retentionManifestDigest: manifest.safeDigest,
    digestChainStatus: "confirmed",
    safeCheckLabels: ["bundle digest present", "retention manifest digest present"],
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

function providerWebhookRetentionAuditResponse() {
  const archive = providerWebhookLockedArchiveResponse();
  const manifest = providerWebhookRetentionManifestResponse();
  return {
    generatedAt: "2026-06-04T00:09:30.000Z",
    retentionPolicyStatus: "active",
    retentionAuditStatus: "confirmed",
    retentionManifestStatus: manifest.retentionManifestStatus,
    lockedArchiveStatus: archive.lockedArchiveStatus,
    archiveAcknowledgementStatus: archive.archiveAcknowledgementStatus,
    auditAcknowledgementStatus: "acknowledged",
    acceptanceStatus: archive.acceptanceStatus,
    lockStatus: archive.lockStatus,
    safePolicyLabel: archive.retentionPolicyLabel,
    safeRetentionWindowLabel: "safe-review-metadata-retained",
    safeFilename: "provider-webhook-review-qa-handoff-retention-audit.json",
    safeDigest: "sha256:safeqahandoffretentionaudit",
    lockedArchiveDigest: archive.safeDigest,
    retentionManifestDigest: manifest.safeDigest,
    digestChainStatus: "confirmed",
    auditChecklistItems: [
      { key: "locked_archive_available", label: "locked archive available", status: "confirmed" },
      { key: "retention_manifest_ready", label: "retention manifest ready", status: "confirmed" },
      { key: "external_calls_zero", label: "externalCalls zero", status: "confirmed" }
    ],
    counts: {
      ...archive.counts,
      auditChecklistPassedCount: 3,
      auditChecklistNeedsReviewCount: 0,
      auditChecklistBlockedCount: 0
    },
    archivedAt: archive.archivedAt,
    exportedAt: archive.exportedAt,
    externalCalls: 0
  };
}

function providerWebhookArchiveFinalizationResponse() {
  const integrity = providerWebhookArchiveIntegrityResponse();
  const retentionAudit = providerWebhookRetentionAuditResponse();
  return {
    generatedAt: "2026-06-04T00:10:00.000Z",
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
    safeDigest: "sha256:safeqahandoffarchivefinalization",
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
    safeCheckLabels: ["archive integrity confirmed", "retention audit confirmed"],
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

function providerWebhookArchiveFinalizationSignOffResponse() {
  return {
    ...providerWebhookArchiveFinalizationResponse(),
    generatedAt: "2026-06-04T00:10:30.000Z",
    finalizationStatus: "finalized",
    retentionSignOffStatus: "signed_off",
    finalizationReceiptStatus: "ready",
    safeFilename: "provider-webhook-review-qa-handoff-archive-finalization-signoff.json",
    safeDigest: "sha256:safeqahandoffarchivefinalizationsignoff",
    finalizationReceiptDigest: "sha256:safeqahandoffarchivefinalizationreceipt",
    safeReviewerLabel: "safe reviewer",
    counts: {
      ...providerWebhookArchiveFinalizationResponse().counts,
      retentionSignOffCount: 1
    },
    signedAt: "2026-06-04T00:10:30.000Z",
    finalizedAt: "2026-06-04T00:10:30.000Z",
    action: "sign_off",
    signOffRecordId: "provider-webhook-qa-handoff-archive-finalization-signoff-1",
    externalCalls: 0
  };
}

function providerWebhookArchiveFinalizationReceiptResponse() {
  const signOff = providerWebhookArchiveFinalizationSignOffResponse();
  delete (signOff as Partial<ReturnType<typeof providerWebhookArchiveFinalizationSignOffResponse>>).action;
  return {
    ...signOff,
    safeFilename: "provider-webhook-review-qa-handoff-archive-finalization-receipt.json",
    safeDigest: "sha256:safeqahandoffarchivefinalizationreceiptread",
    receiptKind: "qa-handoff-locked-archive-finalization-receipt",
    externalCalls: 0
  };
}

function providerWebhookArchiveReleaseEvidenceResponse() {
  const receipt = providerWebhookArchiveFinalizationReceiptResponse();
  const retentionAudit = providerWebhookRetentionAuditResponse();
  return {
    ...receipt,
    evidenceKind: "qa-handoff-locked-archive-release-evidence-pack",
    releaseReadinessStatus: "ready_for_release",
    lockedArchiveStatus: "exported",
    archiveAcknowledgementStatus: "exported",
    retentionPolicyStatus: retentionAudit.retentionPolicyStatus,
    safeReleaseLabel: "safe-qa-handoff-release-evidence-pack",
    safeFilename: "provider-webhook-review-qa-handoff-archive-release-evidence-pack.json",
    safeDigest: "sha256:safeqahandoffarchivereleaseevidence",
    retentionAuditDigest: retentionAudit.safeDigest,
    prerequisiteChecklist: {
      qaHandoffBundleReady: true,
      qaHandoffExportReady: true,
      receiptSignedOff: true,
      acceptanceLocked: true,
      lockedArchiveReady: true,
      lockedArchiveExported: true,
      retentionManifestReady: true,
      archiveIntegrityConfirmed: true,
      retentionAuditConfirmed: true,
      finalizationSignedOff: true,
      finalizationReceiptReady: true,
      digestChainConfirmed: true,
      safeFilenamePresent: true,
      safeDigestPresent: true,
      providerOutboundAbsent: true,
      externalCallsZero: true
    },
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
      prerequisitePassedCount: 16,
      prerequisiteTotalCount: 16
    },
    externalCalls: 0
  };
}

function providerWebhookArchiveReleaseVerificationResponse() {
  const releaseEvidence = providerWebhookArchiveReleaseEvidenceResponse();
  const digestMatrixRows = [
    providerWebhookReleaseVerificationDigestRow("qa_handoff_bundle", "QA handoff bundle", releaseEvidence.bundleDigest),
    providerWebhookReleaseVerificationDigestRow("qa_handoff_export", "QA handoff export", releaseEvidence.exportDigest),
    providerWebhookReleaseVerificationDigestRow("receipt_sign_off", "receipt/sign-off", releaseEvidence.receiptDigest),
    providerWebhookReleaseVerificationDigestRow("acceptance_lock", "acceptance lock", releaseEvidence.acceptanceLockDigest),
    providerWebhookReleaseVerificationDigestRow("locked_archive_export", "locked archive/export", releaseEvidence.lockedArchiveDigest),
    providerWebhookReleaseVerificationDigestRow("retention_manifest", "retention manifest", releaseEvidence.retentionManifestDigest),
    providerWebhookReleaseVerificationDigestRow("archive_integrity", "archive integrity", releaseEvidence.integrityDigest),
    providerWebhookReleaseVerificationDigestRow("retention_audit", "retention audit", releaseEvidence.retentionAuditDigest),
    providerWebhookReleaseVerificationDigestRow("finalization_receipt", "finalization receipt", releaseEvidence.finalizationReceiptDigest),
    providerWebhookReleaseVerificationDigestRow("release_evidence", "release evidence", releaseEvidence.safeDigest)
  ];
  return {
    ...releaseEvidence,
    verificationKind: "qa-handoff-locked-archive-release-verification-matrix",
    verificationStatus: "verified",
    safeVerificationLabel: "safe-qa-handoff-release-verification-matrix",
    safeFilename: "provider-webhook-review-qa-handoff-archive-release-verification-matrix.json",
    safeDigest: "sha256:safeqahandoffarchivereleaseverification",
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
      digestMatrixVerifiedCount: 10,
      digestMatrixNeedsReviewCount: 0,
      digestMatrixBlockedCount: 0
    },
    externalCalls: 0
  };
}

function providerWebhookReleaseVerificationDigestRow(key: string, label: string, digest: string) {
  return {
    key,
    label,
    safeDigest: digest,
    expectedDigest: digest,
    digestPresent: true,
    digestMatchesExpected: true,
    verificationStatus: "verified"
  };
}

function providerWebhookArchiveReleaseCertificationResponse() {
  const verification = providerWebhookArchiveReleaseVerificationResponse();
  const certificationChecklist = {
    releaseEvidenceReady: true,
    releaseVerificationPresent: true,
    releaseVerificationVerified: true,
    releaseReadinessReady: true,
    digestChainConfirmed: true,
    prerequisitesComplete: true,
    digestMatrixVerified: true,
    safeFilenamePresent: true,
    safeDigestPresent: true,
    releaseEvidenceDigestPresent: true,
    releaseVerificationDigestPresent: true,
    providerOutboundAbsent: true,
    externalCallsZero: true
  };
  return {
    certificationKind: "qa-handoff-locked-archive-release-certification-receipt",
    certificationStatus: "certified",
    releaseReadinessStatus: "ready_for_release",
    verificationStatus: "verified",
    digestChainStatus: "confirmed",
    safeFilename: "provider-webhook-review-qa-handoff-archive-release-certification-receipt.json",
    safeDigest: "sha256:safeqahandoffarchivereleasecertification",
    releaseEvidenceDigest: verification.releaseEvidenceDigest,
    releaseVerificationDigest: verification.safeDigest,
    prerequisiteChecklist: verification.prerequisiteChecklist,
    certificationChecklist,
    digestMatrixSummary: {
      totalRows: 10,
      verifiedRows: 10,
      needsReviewRows: 0,
      blockedRows: 0,
      allRowsVerified: true
    },
    counts: {
      totalItems: verification.counts.totalItems,
      releaseEvidenceCheckedCount: verification.counts.releaseEvidenceCheckedCount,
      releaseVerificationCheckedCount: verification.counts.releaseVerificationCheckedCount,
      releaseCertificationCheckedCount: 1,
      prerequisitePassedCount: verification.counts.prerequisitePassedCount,
      prerequisiteTotalCount: verification.counts.prerequisiteTotalCount,
      certificationChecklistPassedCount: Object.values(certificationChecklist).filter(Boolean).length,
      certificationChecklistTotalCount: Object.values(certificationChecklist).length,
      digestMatrixRowCount: verification.counts.digestMatrixRowCount,
      digestMatrixVerifiedCount: verification.counts.digestMatrixVerifiedCount,
      digestMatrixNeedsReviewCount: verification.counts.digestMatrixNeedsReviewCount,
      digestMatrixBlockedCount: verification.counts.digestMatrixBlockedCount
    },
    externalCalls: 0
  };
}

function providerWebhookArchiveReleaseClosureLedgerResponse() {
  const certification = providerWebhookArchiveReleaseCertificationResponse();
  const ledgerRows = [
    providerWebhookReleaseClosureLedgerRow("release_evidence", "Release evidence pack", "verified", certification.releaseEvidenceDigest, certification.counts.releaseEvidenceCheckedCount),
    providerWebhookReleaseClosureLedgerRow("release_verification", "Release verification matrix", "verified", certification.releaseVerificationDigest, certification.counts.releaseVerificationCheckedCount),
    providerWebhookReleaseClosureLedgerRow("release_certification", "Release certification receipt", "certified", certification.safeDigest, certification.counts.releaseCertificationCheckedCount),
    providerWebhookReleaseClosureLedgerRow("prerequisite_checklist", "Prerequisite checklist", "complete", certification.safeDigest, certification.counts.prerequisitePassedCount),
    providerWebhookReleaseClosureLedgerRow("certification_checklist", "Certification checklist", "closed", certification.safeDigest, certification.counts.certificationChecklistPassedCount)
  ];
  return {
    ledgerKind: "qa-handoff-locked-archive-release-closure-ledger",
    ledgerStatus: "certified_release_closed",
    certificationStatus: "certified",
    releaseReadinessStatus: "ready_for_release",
    verificationStatus: "verified",
    digestChainStatus: "confirmed",
    safeFilename: "provider-webhook-review-qa-handoff-archive-release-closure-ledger.json",
    safeDigest: "sha256:safeqahandoffarchivereleaseclosureledger",
    releaseEvidenceDigest: certification.releaseEvidenceDigest,
    releaseVerificationDigest: certification.releaseVerificationDigest,
    releaseCertificationDigest: certification.safeDigest,
    ledgerRows,
    prerequisiteChecklist: certification.prerequisiteChecklist,
    certificationChecklist: certification.certificationChecklist,
    ledgerSummary: {
      ledgerRowCount: ledgerRows.length,
      closedRowCount: ledgerRows.length,
      prerequisiteChecklistComplete: true,
      certificationChecklistComplete: true,
      releaseCertificationDigestPresent: true,
      externalCallsZero: true
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
      ledgerClosedRowCount: ledgerRows.length,
      ledgerNeedsReviewRowCount: 0
    },
    externalCalls: 0
  };
}

function providerWebhookArchiveReleaseAttestationAuditResponse() {
  const closureLedger = providerWebhookArchiveReleaseClosureLedgerResponse();
  const attestationRows = [
    providerWebhookReleaseAttestationAuditRow("closure_ledger", "Closure ledger", "attested", closureLedger.safeDigest, closureLedger.counts.closureLedgerCheckedCount),
    providerWebhookReleaseAttestationAuditRow("release_evidence_digest", "Release evidence digest", "verified", closureLedger.releaseEvidenceDigest, closureLedger.counts.releaseEvidenceCheckedCount),
    providerWebhookReleaseAttestationAuditRow("release_verification_digest", "Release verification digest", "verified", closureLedger.releaseVerificationDigest, closureLedger.counts.releaseVerificationCheckedCount),
    providerWebhookReleaseAttestationAuditRow("release_certification_digest", "Release certification digest", "verified", closureLedger.releaseCertificationDigest, closureLedger.counts.releaseCertificationCheckedCount),
    providerWebhookReleaseAttestationAuditRow("prerequisite_checklist", "Prerequisite checklist", "complete", closureLedger.safeDigest, closureLedger.counts.prerequisitePassedCount),
    providerWebhookReleaseAttestationAuditRow("certification_checklist", "Certification checklist", "complete", closureLedger.safeDigest, closureLedger.counts.certificationChecklistPassedCount),
    providerWebhookReleaseAttestationAuditRow("external_calls", "External calls", "attested", closureLedger.safeDigest, closureLedger.externalCalls)
  ];
  return {
    attestationKind: "qa-handoff-locked-archive-release-attestation-audit",
    attestationStatus: "complete",
    ledgerStatus: "certified_release_closed",
    certificationStatus: "certified",
    releaseReadinessStatus: "ready_for_release",
    verificationStatus: "verified",
    digestChainStatus: "confirmed",
    safeFilename: "provider-webhook-review-qa-handoff-archive-release-attestation-audit.json",
    safeDigest: "sha256:safeqahandoffarchivereleaseattestationaudit",
    releaseEvidenceDigest: closureLedger.releaseEvidenceDigest,
    releaseVerificationDigest: closureLedger.releaseVerificationDigest,
    releaseCertificationDigest: closureLedger.releaseCertificationDigest,
    closureLedgerDigest: closureLedger.safeDigest,
    attestationRows,
    prerequisiteChecklist: closureLedger.prerequisiteChecklist,
    certificationChecklist: closureLedger.certificationChecklist,
    attestationSummary: {
      attestationRowCount: attestationRows.length,
      attestedRowCount: attestationRows.length,
      ledgerClosed: true,
      prerequisiteChecklistComplete: true,
      certificationChecklistComplete: true,
      closureLedgerDigestPresent: true,
      externalCallsZero: true
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
      attestationAttestedRowCount: attestationRows.length,
      attestationNeedsReviewRowCount: 0
    },
    externalCalls: 0
  };
}

function providerWebhookReleaseClosureLedgerRow(key: string, label: string, ledgerStatus: string, safeDigest: string, checkedCount: number) {
  return {
    key,
    label,
    ledgerStatus,
    safeDigest,
    checkedCount,
    complete: true
  };
}

function providerWebhookArchiveReleaseAttestationReconciliationResponse() {
  const attestationAudit = providerWebhookArchiveReleaseAttestationAuditResponse();
  const reconciliationRows = [
    providerWebhookReleaseAttestationReconciliationRow("release_evidence_digest", "Release evidence digest", "verified", attestationAudit.releaseEvidenceDigest, attestationAudit.counts.releaseEvidenceCheckedCount),
    providerWebhookReleaseAttestationReconciliationRow("release_verification_digest", "Release verification digest", "verified", attestationAudit.releaseVerificationDigest, attestationAudit.counts.releaseVerificationCheckedCount),
    providerWebhookReleaseAttestationReconciliationRow("release_certification_digest", "Release certification digest", "verified", attestationAudit.releaseCertificationDigest, attestationAudit.counts.releaseCertificationCheckedCount),
    providerWebhookReleaseAttestationReconciliationRow("closure_ledger_digest", "Closure ledger digest", "aligned", attestationAudit.closureLedgerDigest, attestationAudit.counts.closureLedgerCheckedCount),
    providerWebhookReleaseAttestationReconciliationRow("attestation_audit_digest", "Attestation audit digest", "attested", attestationAudit.safeDigest, attestationAudit.counts.attestationAuditCheckedCount),
    providerWebhookReleaseAttestationReconciliationRow("prerequisite_checklist", "Prerequisite checklist", "complete", attestationAudit.closureLedgerDigest, attestationAudit.counts.prerequisitePassedCount),
    providerWebhookReleaseAttestationReconciliationRow("certification_checklist", "Certification checklist", "complete", attestationAudit.closureLedgerDigest, attestationAudit.counts.certificationChecklistPassedCount),
    providerWebhookReleaseAttestationReconciliationRow("external_calls", "External calls", "attested", attestationAudit.safeDigest, attestationAudit.externalCalls)
  ];
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
    safeDigest: "sha256:safeqahandoffarchivereleaseattestationreconciliation",
    releaseEvidenceDigest: attestationAudit.releaseEvidenceDigest,
    verificationDigest: attestationAudit.releaseVerificationDigest,
    certificationDigest: attestationAudit.releaseCertificationDigest,
    closureLedgerDigest: attestationAudit.closureLedgerDigest,
    attestationAuditDigest: attestationAudit.safeDigest,
    reconciliationDigest: "sha256:safeqahandoffarchivereleaseattestationreconciliation",
    reconciliationRows,
    exceptionRows: [],
    inheritedPrerequisiteChecklist: attestationAudit.prerequisiteChecklist,
    inheritedCertificationChecklist: attestationAudit.certificationChecklist,
    reconciliationSummary: {
      reconciliationRowCount: reconciliationRows.length,
      alignedRowCount: reconciliationRows.length,
      exceptionRowCount: 0,
      attestationAuditComplete: true,
      closureLedgerClosed: true,
      prerequisiteChecklistComplete: true,
      certificationChecklistComplete: true,
      allDigestsLinked: true,
      externalCallsZero: true
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
      reconciliationAlignedRowCount: reconciliationRows.length,
      reconciliationExceptionRowCount: 0
    },
    externalCalls: 0
  };
}

function providerWebhookArchiveCertifiedReleaseGateResponse() {
  const reconciliation = providerWebhookArchiveReleaseAttestationReconciliationResponse();
  return {
    gateKind: "qa-handoff-locked-archive-certified-release-gate",
    gateStatus: "ready",
    goNoGoDecision: "go",
    releaseReadinessStatus: "ready_for_release",
    reconciliationStatus: "aligned",
    attestationStatus: "complete",
    ledgerStatus: "certified_release_closed",
    certificationStatus: "certified",
    verificationStatus: "verified",
    digestChainStatus: "confirmed",
    safeFilename: "provider-webhook-review-qa-handoff-certified-release-gate.json",
    safeDigest: "sha256:safeqahandoffcertifiedreleasegate",
    releaseGateDigest: "sha256:safeqahandoffcertifiedreleasegate",
    reconciliationDigest: reconciliation.reconciliationDigest,
    attestationAuditDigest: reconciliation.attestationAuditDigest,
    closureLedgerDigest: reconciliation.closureLedgerDigest,
    certificationDigest: reconciliation.certificationDigest,
    verificationDigest: reconciliation.verificationDigest,
    releaseEvidenceDigest: reconciliation.releaseEvidenceDigest,
    inheritedPrerequisiteChecklist: reconciliation.inheritedPrerequisiteChecklist,
    inheritedCertificationChecklist: reconciliation.inheritedCertificationChecklist,
    inheritedReconciliationSummary: reconciliation.reconciliationSummary,
    gateChecklist: {
      prerequisiteChainComplete: true,
      reconciliationComplete: true,
      attestationComplete: true,
      closureLedgerClosed: true,
      certificationComplete: true,
      releaseReady: true,
      verificationComplete: true,
      digestChainConfirmed: true,
      prerequisiteChecklistComplete: true,
      certificationChecklistComplete: true,
      noBlockingExceptions: true,
      externalCallsZero: true
    },
    blockingReasons: [],
    exceptionRows: [],
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
      gateChecklistPassedCount: 12,
      gateChecklistTotalCount: 12,
      blockingReasonCount: 0,
      exceptionRowCount: 0
    },
    externalCalls: 0
  };
}

function providerWebhookArchiveCertifiedReleaseDecisionReceiptResponse() {
  const releaseGate = providerWebhookArchiveCertifiedReleaseGateResponse();
  const receiptRows = [
    providerWebhookCertifiedReleaseDecisionReceiptRow("release_gate", "Certified release gate", releaseGate.releaseGateDigest, 1),
    providerWebhookCertifiedReleaseDecisionReceiptRow("release_decision", "GO release decision", releaseGate.releaseGateDigest, 1, "issued"),
    providerWebhookCertifiedReleaseDecisionReceiptRow("release_readiness", "Release readiness", releaseGate.releaseEvidenceDigest, 1),
    providerWebhookCertifiedReleaseDecisionReceiptRow("reconciliation", "Attestation reconciliation", releaseGate.reconciliationDigest, 1),
    providerWebhookCertifiedReleaseDecisionReceiptRow("attestation", "Attestation audit", releaseGate.attestationAuditDigest, 1),
    providerWebhookCertifiedReleaseDecisionReceiptRow("closure_ledger", "Closure ledger", releaseGate.closureLedgerDigest, 1),
    providerWebhookCertifiedReleaseDecisionReceiptRow("certification", "Release certification", releaseGate.certificationDigest, 1),
    providerWebhookCertifiedReleaseDecisionReceiptRow("verification", "Release verification", releaseGate.verificationDigest, 1),
    providerWebhookCertifiedReleaseDecisionReceiptRow("digest_chain", "Digest chain", releaseGate.reconciliationDigest, 1),
    providerWebhookCertifiedReleaseDecisionReceiptRow("prerequisite_checklist", "Prerequisite checklist", releaseGate.releaseEvidenceDigest, 16),
    providerWebhookCertifiedReleaseDecisionReceiptRow("certification_checklist", "Certification checklist", releaseGate.certificationDigest, 13),
    providerWebhookCertifiedReleaseDecisionReceiptRow("gate_checklist", "Release gate checklist", releaseGate.releaseGateDigest, 12),
    providerWebhookCertifiedReleaseDecisionReceiptRow("external_calls", "External calls", releaseGate.releaseGateDigest, 0)
  ];
  return {
    receiptKind: "qa-handoff-locked-archive-certified-release-decision-receipt",
    receiptStatus: "issued",
    releaseDecision: "go",
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
    safeDigest: "sha256:safeqahandoffcertifiedreleasedecisionreceipt",
    decisionReceiptDigest: "sha256:safeqahandoffcertifiedreleasedecisionreceipt",
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
      completeReceiptRowCount: receiptRows.length,
      releaseGateReady: true,
      releaseDecisionGo: true,
      prerequisiteChecklistComplete: true,
      certificationChecklistComplete: true,
      gateChecklistComplete: true,
      noBlockingReasons: true,
      noExceptionRows: true,
      externalCallsZero: true
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
      receiptRowCompleteCount: receiptRows.length
    },
    externalCalls: 0
  };
}

function providerWebhookArchiveCertifiedReleaseHandoffPacketResponse() {
  const decisionReceipt = providerWebhookArchiveCertifiedReleaseDecisionReceiptResponse();
  const handoffRows = [
    providerWebhookCertifiedReleaseHandoffRow("decision_receipt", "Certified release decision receipt", decisionReceipt.decisionReceiptDigest, 1, "ready"),
    providerWebhookCertifiedReleaseHandoffRow("release_gate", "Certified release gate", decisionReceipt.releaseGateDigest, 1),
    providerWebhookCertifiedReleaseHandoffRow("release_decision", "GO release decision", decisionReceipt.decisionReceiptDigest, 1, "ready"),
    providerWebhookCertifiedReleaseHandoffRow("release_readiness", "Release readiness", decisionReceipt.releaseEvidenceDigest, 1),
    providerWebhookCertifiedReleaseHandoffRow("reconciliation", "Attestation reconciliation", decisionReceipt.reconciliationDigest, 1),
    providerWebhookCertifiedReleaseHandoffRow("attestation", "Attestation audit", decisionReceipt.attestationAuditDigest, 1),
    providerWebhookCertifiedReleaseHandoffRow("closure_ledger", "Closure ledger", decisionReceipt.closureLedgerDigest, 1),
    providerWebhookCertifiedReleaseHandoffRow("certification", "Release certification", decisionReceipt.certificationDigest, 1),
    providerWebhookCertifiedReleaseHandoffRow("verification", "Release verification", decisionReceipt.verificationDigest, 1),
    providerWebhookCertifiedReleaseHandoffRow("digest_chain", "Digest chain", decisionReceipt.reconciliationDigest, 1),
    providerWebhookCertifiedReleaseHandoffRow("prerequisite_checklist", "Prerequisite checklist", decisionReceipt.releaseEvidenceDigest, 16),
    providerWebhookCertifiedReleaseHandoffRow("certification_checklist", "Certification checklist", decisionReceipt.certificationDigest, 13),
    providerWebhookCertifiedReleaseHandoffRow("gate_checklist", "Release gate checklist", decisionReceipt.releaseGateDigest, 12),
    providerWebhookCertifiedReleaseHandoffRow("blocking_reasons", "Blocking reasons", decisionReceipt.decisionReceiptDigest, 0),
    providerWebhookCertifiedReleaseHandoffRow("exceptions", "Exception rows", decisionReceipt.reconciliationDigest, 0),
    providerWebhookCertifiedReleaseHandoffRow("external_calls", "External calls", decisionReceipt.decisionReceiptDigest, 0)
  ];
  const runbookRows = [
    providerWebhookCertifiedReleaseRunbookRow("confirm_decision_receipt", "Confirm certified decision receipt", decisionReceipt.decisionReceiptDigest, "release owner"),
    providerWebhookCertifiedReleaseRunbookRow("confirm_release_gate", "Confirm certified release gate", decisionReceipt.releaseGateDigest, "release owner"),
    providerWebhookCertifiedReleaseRunbookRow("confirm_operator_checklist", "Confirm operator checklist", decisionReceipt.decisionReceiptDigest, "operator"),
    providerWebhookCertifiedReleaseRunbookRow("release_handoff", "Proceed with safe release handoff", decisionReceipt.decisionReceiptDigest, "release owner"),
    providerWebhookCertifiedReleaseRunbookRow("monitor_release", "Monitor safe release evidence", decisionReceipt.releaseEvidenceDigest, "operator"),
    providerWebhookCertifiedReleaseRunbookRow("exception_hold", "Hold release on blocking exceptions", decisionReceipt.reconciliationDigest, "release owner")
  ];
  const operatorChecklist = [
    providerWebhookCertifiedReleaseOperatorChecklistItem("decision_receipt_issued", "Decision receipt issued", decisionReceipt.decisionReceiptDigest),
    providerWebhookCertifiedReleaseOperatorChecklistItem("release_gate_ready", "Release gate ready", decisionReceipt.releaseGateDigest),
    providerWebhookCertifiedReleaseOperatorChecklistItem("no_blocking_reasons", "No blocking reasons", decisionReceipt.decisionReceiptDigest),
    providerWebhookCertifiedReleaseOperatorChecklistItem("no_exceptions", "No exception rows", decisionReceipt.reconciliationDigest),
    providerWebhookCertifiedReleaseOperatorChecklistItem("external_calls_zero", "External calls zero", decisionReceipt.decisionReceiptDigest),
    providerWebhookCertifiedReleaseOperatorChecklistItem("provider_outbound_absent", "Provider outbound absent", decisionReceipt.decisionReceiptDigest),
    providerWebhookCertifiedReleaseOperatorChecklistItem("source_material_absent", "Sensitive source material absent", decisionReceipt.decisionReceiptDigest)
  ];
  return {
    packetKind: "qa-handoff-locked-archive-certified-release-handoff-packet",
    packetStatus: "issued",
    handoffStatus: "ready",
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
    safeDigest: "sha256:safeqahandoffcertifiedreleasehandoffpacket",
    handoffPacketDigest: "sha256:safeqahandoffcertifiedreleasehandoffpacket",
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
      handoffReady: true,
      releaseDecisionGo: true,
      blockingReasonCount: 0,
      exceptionRowCount: 0,
      externalCallsZero: true,
      safeDigest: decisionReceipt.decisionReceiptDigest
    },
    counts: {
      ...decisionReceipt.counts,
      handoffPacketCheckedCount: 1,
      handoffRowCount: handoffRows.length,
      handoffRowCompleteCount: handoffRows.length,
      runbookRowCount: runbookRows.length,
      runbookRowReadyCount: runbookRows.length,
      operatorChecklistItemCount: operatorChecklist.length,
      operatorChecklistCompleteCount: operatorChecklist.length
    },
    externalCalls: 0
  };
}

function providerWebhookArchiveCertifiedReleaseHandoffAcceptanceRecordResponse(acceptanceStatus: "not_started" | "acknowledged") {
  const handoffPacket = providerWebhookArchiveCertifiedReleaseHandoffPacketResponse();
  const acknowledged = acceptanceStatus === "acknowledged";
  const acknowledgedChecklist = handoffPacket.operatorChecklist.map((item) => ({
    key: item.key,
    label: item.label,
    acknowledgementStatus: acknowledged ? "acknowledged" : "pending",
    safeDigest: item.safeDigest,
    acknowledged
  }));
  const acknowledgementRows = [
    providerWebhookCertifiedReleaseAcknowledgementRow("handoff_packet", "Handoff packet", handoffPacket.handoffPacketDigest, 1, true),
    providerWebhookCertifiedReleaseAcknowledgementRow("operator_checklist", "Operator checklist", handoffPacket.handoffPacketDigest, handoffPacket.operatorChecklist.length, acknowledged),
    providerWebhookCertifiedReleaseAcknowledgementRow("release_owner", "Release owner acknowledgement", handoffPacket.handoffPacketDigest, acknowledged ? 1 : 0, acknowledged),
    providerWebhookCertifiedReleaseAcknowledgementRow("external_calls", "External calls", handoffPacket.handoffPacketDigest, 0, true),
    providerWebhookCertifiedReleaseAcknowledgementRow("safe_source_material", "Sensitive source material", handoffPacket.handoffPacketDigest, 1, true),
    providerWebhookCertifiedReleaseAcknowledgementRow("blocking_reasons", "Blocking reasons", handoffPacket.handoffPacketDigest, 0, true),
    providerWebhookCertifiedReleaseAcknowledgementRow("exceptions", "Exception rows", handoffPacket.reconciliationDigest, 0, true)
  ];
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
    safeDigest: acknowledged ? "sha256:safeqahandoffcertifiedreleasehandoffacceptanceack" : "sha256:safeqahandoffcertifiedreleasehandoffacceptancepending",
    acceptanceRecordDigest: acknowledged ? "sha256:safeqahandoffcertifiedreleasehandoffacceptanceack" : "sha256:safeqahandoffcertifiedreleasehandoffacceptancepending",
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
      ownerRole: "release owner",
      acknowledgedByRole: acknowledged ? "release owner" : null,
      acknowledgedByLabel: acknowledged ? "safe release owner" : null,
      handoffReady: true,
      releaseDecisionGo: true,
      operatorChecklistAcknowledged: acknowledged,
      blockingReasonCount: 0,
      exceptionRowCount: 0,
      externalCallsZero: true,
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
      externalCallsZero: true
    },
    inheritedBlockingReasons: handoffPacket.inheritedBlockingReasons,
    inheritedExceptionRows: handoffPacket.inheritedExceptionRows,
    counts: {
      ...handoffPacket.counts,
      acceptanceRecordCheckedCount: 1,
      acceptanceRecordMutationCount: acknowledged ? 1 : 0,
      acknowledgedChecklistItemCount: acknowledgedChecklist.length,
      acknowledgedChecklistCompleteCount: acknowledged ? acknowledgedChecklist.length : 0,
      acknowledgementRowCount: acknowledgementRows.length,
      acknowledgementRowCompleteCount: acknowledgementRows.filter((row) => row.complete).length
    },
    externalCalls: 0
  };
}

function providerWebhookArchiveCertifiedReleaseNoopExecutionDryRunResponse(dryRunStatus: "not_started" | "passed") {
  const acceptanceRecord = providerWebhookArchiveCertifiedReleaseHandoffAcceptanceRecordResponse("acknowledged");
  const passed = dryRunStatus === "passed";
  const executionChecklist = [
    providerWebhookCertifiedReleaseNoopExecutionChecklistItem("acceptance_record_acknowledged", "Acceptance record acknowledged", acceptanceRecord.acceptanceRecordDigest),
    providerWebhookCertifiedReleaseNoopExecutionChecklistItem("handoff_ready", "Handoff ready", acceptanceRecord.handoffPacketDigest),
    providerWebhookCertifiedReleaseNoopExecutionChecklistItem("release_decision_go", "Release decision go", acceptanceRecord.decisionReceiptDigest),
    providerWebhookCertifiedReleaseNoopExecutionChecklistItem("execution_mode_no_op", "Execution mode no-op", acceptanceRecord.acceptanceRecordDigest),
    providerWebhookCertifiedReleaseNoopExecutionChecklistItem("external_calls_zero", "External calls zero", acceptanceRecord.acceptanceRecordDigest),
    providerWebhookCertifiedReleaseNoopExecutionChecklistItem("provider_outbound_absent", "Provider outbound absent", acceptanceRecord.acceptanceRecordDigest),
    providerWebhookCertifiedReleaseNoopExecutionChecklistItem("notification_send_absent", "External notification sending absent", acceptanceRecord.acceptanceRecordDigest),
    providerWebhookCertifiedReleaseNoopExecutionChecklistItem("source_material_absent", "Sensitive source material absent", acceptanceRecord.acceptanceRecordDigest)
  ];
  const dryRunRows = [
    providerWebhookCertifiedReleaseNoopDryRunRow("acceptance_record", "Acceptance record", acceptanceRecord.acceptanceRecordDigest, 1),
    providerWebhookCertifiedReleaseNoopDryRunRow("handoff_packet", "Handoff packet", acceptanceRecord.handoffPacketDigest, 1),
    providerWebhookCertifiedReleaseNoopDryRunRow("decision_receipt", "Decision receipt", acceptanceRecord.decisionReceiptDigest, 1)
  ];
  const executionPlanRows = [
    providerWebhookCertifiedReleaseNoopExecutionPlanRow("plan_scope", "Certified release readiness check", acceptanceRecord.acceptanceRecordDigest, 1, "ready"),
    providerWebhookCertifiedReleaseNoopExecutionPlanRow("release_execution", "Release execution", acceptanceRecord.acceptanceRecordDigest, 0, "no_op"),
    providerWebhookCertifiedReleaseNoopExecutionPlanRow("provider_outbound", "Provider outbound", acceptanceRecord.acceptanceRecordDigest, 0, "no_op"),
    providerWebhookCertifiedReleaseNoopExecutionPlanRow("external_notifications", "External notifications", acceptanceRecord.acceptanceRecordDigest, 0, "no_op"),
    providerWebhookCertifiedReleaseNoopExecutionPlanRow("automation_calls", "Automation calls", acceptanceRecord.acceptanceRecordDigest, 0, "no_op"),
    providerWebhookCertifiedReleaseNoopExecutionPlanRow("state_mutation", "Release state mutation", acceptanceRecord.acceptanceRecordDigest, 0, "no_op"),
    providerWebhookCertifiedReleaseNoopExecutionPlanRow("readback", "Safe readback", acceptanceRecord.acceptanceRecordDigest, 1, "ready")
  ];
  return {
    dryRunKind: "qa-handoff-locked-archive-certified-release-noop-execution-dryrun",
    dryRunStatus,
    executionMode: "no_op",
    acceptanceStatus: acceptanceRecord.acceptanceStatus,
    handoffStatus: acceptanceRecord.handoffStatus,
    releaseDecision: acceptanceRecord.releaseDecision,
    packetStatus: acceptanceRecord.packetStatus,
    receiptStatus: acceptanceRecord.receiptStatus,
    gateStatus: acceptanceRecord.gateStatus,
    goNoGoDecision: acceptanceRecord.goNoGoDecision,
    releaseReadinessStatus: acceptanceRecord.releaseReadinessStatus,
    reconciliationStatus: acceptanceRecord.reconciliationStatus,
    attestationStatus: acceptanceRecord.attestationStatus,
    ledgerStatus: acceptanceRecord.ledgerStatus,
    certificationStatus: acceptanceRecord.certificationStatus,
    verificationStatus: acceptanceRecord.verificationStatus,
    digestChainStatus: acceptanceRecord.digestChainStatus,
    safeFilename: "provider-webhook-review-qa-handoff-certified-release-noop-execution-dryrun.json",
    safeDigest: passed ? "sha256:safeqahandoffcertifiedreleasenoopdryrun" : "sha256:safeqahandoffcertifiedreleasenoopdryrunpending",
    noopExecutionDryRunDigest: passed ? "sha256:safeqahandoffcertifiedreleasenoopdryrun" : "sha256:safeqahandoffcertifiedreleasenoopdryrunpending",
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
      requestedBy: passed ? "safe release owner" : null,
      checklistAcknowledged: passed,
      dryRunReason: passed ? "safe no-op execution readiness rehearsal" : null,
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
      releaseDecision: acceptanceRecord.releaseDecision,
      operatorChecklistAcknowledged: acceptanceRecord.releaseOwnerSummary.operatorChecklistAcknowledged,
      acknowledgedChecklistItemCount: acceptanceRecord.counts.acknowledgedChecklistItemCount,
      acknowledgedChecklistCompleteCount: acceptanceRecord.counts.acknowledgedChecklistCompleteCount,
      acknowledgementRowCount: acceptanceRecord.counts.acknowledgementRowCount,
      acknowledgementRowCompleteCount: acceptanceRecord.counts.acknowledgementRowCompleteCount,
      externalCallsZero: true
    },
    inheritedBlockingReasons: acceptanceRecord.inheritedBlockingReasons,
    inheritedExceptionRows: acceptanceRecord.inheritedExceptionRows,
    counts: {
      ...acceptanceRecord.counts,
      noopExecutionDryRunCheckedCount: 1,
      noopExecutionDryRunMutationCount: passed ? 1 : 0,
      executionChecklistItemCount: executionChecklist.length,
      executionChecklistCompleteCount: executionChecklist.length,
      dryRunRowCount: dryRunRows.length,
      dryRunRowPassedCount: dryRunRows.length,
      executionPlanRowCount: executionPlanRows.length,
      executionPlanReadyCount: executionPlanRows.length
    },
    externalCalls: 0
  };
}

function providerWebhookArchiveCertifiedReleaseDryRunResultLedgerResponse() {
  const dryRun = providerWebhookArchiveCertifiedReleaseNoopExecutionDryRunResponse("passed");
  const resultLedgerRows = [
    providerWebhookCertifiedReleaseDryRunResultLedgerRow("noop_execution_dryrun", "No-op execution dry-run", dryRun.noopExecutionDryRunDigest, dryRun.counts.noopExecutionDryRunCheckedCount),
    providerWebhookCertifiedReleaseDryRunResultLedgerRow("acceptance_record", "Acceptance record", dryRun.acceptanceRecordDigest, 1),
    providerWebhookCertifiedReleaseDryRunResultLedgerRow("handoff_packet", "Handoff packet", dryRun.handoffPacketDigest, dryRun.counts.handoffPacketCheckedCount),
    providerWebhookCertifiedReleaseDryRunResultLedgerRow("decision_receipt", "Decision receipt", dryRun.decisionReceiptDigest, dryRun.counts.decisionReceiptCheckedCount),
    providerWebhookCertifiedReleaseDryRunResultLedgerRow("release_gate", "Release gate", dryRun.releaseGateDigest, dryRun.counts.gateCheckedCount),
    providerWebhookCertifiedReleaseDryRunResultLedgerRow("reconciliation", "Attestation reconciliation", dryRun.reconciliationDigest, dryRun.counts.reconciliationCheckedCount),
    providerWebhookCertifiedReleaseDryRunResultLedgerRow("attestation_audit", "Attestation audit", dryRun.attestationAuditDigest, dryRun.counts.attestationAuditCheckedCount),
    providerWebhookCertifiedReleaseDryRunResultLedgerRow("closure_ledger", "Closure ledger", dryRun.closureLedgerDigest, dryRun.counts.closureLedgerCheckedCount),
    providerWebhookCertifiedReleaseDryRunResultLedgerRow("certification", "Release certification", dryRun.certificationDigest, dryRun.counts.releaseCertificationCheckedCount),
    providerWebhookCertifiedReleaseDryRunResultLedgerRow("verification", "Release verification", dryRun.verificationDigest, dryRun.counts.releaseVerificationCheckedCount),
    providerWebhookCertifiedReleaseDryRunResultLedgerRow("release_evidence", "Release evidence", dryRun.releaseEvidenceDigest, dryRun.counts.releaseEvidenceCheckedCount),
    providerWebhookCertifiedReleaseDryRunResultLedgerRow("external_calls", "External calls", dryRun.acceptanceRecordDigest, dryRun.externalCalls)
  ];
  const finalReadinessRows = [
    providerWebhookCertifiedReleaseDryRunFinalReadinessRow("dryrun_passed", "Dry-run passed", dryRun.noopExecutionDryRunDigest, 1),
    providerWebhookCertifiedReleaseDryRunFinalReadinessRow("execution_mode_no_op", "Execution mode no-op", dryRun.noopExecutionDryRunDigest, 1),
    providerWebhookCertifiedReleaseDryRunFinalReadinessRow("acceptance_acknowledged", "Acceptance acknowledged", dryRun.acceptanceRecordDigest, 1),
    providerWebhookCertifiedReleaseDryRunFinalReadinessRow("handoff_ready", "Handoff ready", dryRun.handoffPacketDigest, 1),
    providerWebhookCertifiedReleaseDryRunFinalReadinessRow("release_decision_go", "Release decision go", dryRun.decisionReceiptDigest, 1),
    providerWebhookCertifiedReleaseDryRunFinalReadinessRow("gate_ready", "Release gate ready", dryRun.releaseGateDigest, 1),
    providerWebhookCertifiedReleaseDryRunFinalReadinessRow("safe_digests", "Safe digests", dryRun.safeDigest, 13),
    providerWebhookCertifiedReleaseDryRunFinalReadinessRow("no_state_mutation", "No result ledger state mutation", dryRun.noopExecutionDryRunDigest, 0),
    providerWebhookCertifiedReleaseDryRunFinalReadinessRow("external_calls_zero", "External calls zero", dryRun.noopExecutionDryRunDigest, 0)
  ];
  return {
    ledgerKind: "qa-handoff-locked-archive-certified-release-dryrun-result-ledger",
    ledgerStatus: "recorded",
    dryRunStatus: dryRun.dryRunStatus,
    executionMode: dryRun.executionMode,
    acceptanceStatus: dryRun.acceptanceStatus,
    handoffStatus: dryRun.handoffStatus,
    releaseDecision: dryRun.releaseDecision,
    packetStatus: dryRun.packetStatus,
    receiptStatus: dryRun.receiptStatus,
    gateStatus: dryRun.gateStatus,
    goNoGoDecision: dryRun.goNoGoDecision,
    releaseReadinessStatus: dryRun.releaseReadinessStatus,
    reconciliationStatus: dryRun.reconciliationStatus,
    attestationStatus: dryRun.attestationStatus,
    ledgerStatusFromClosure: dryRun.ledgerStatus,
    certificationStatus: dryRun.certificationStatus,
    verificationStatus: dryRun.verificationStatus,
    digestChainStatus: dryRun.digestChainStatus,
    safeFilename: "provider-webhook-review-qa-handoff-certified-release-dryrun-result-ledger.json",
    safeDigest: "sha256:safeqahandoffcertifiedreleasedryrunresultledger",
    dryRunResultLedgerDigest: "sha256:safeqahandoffcertifiedreleasedryrunresultledger",
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
    inheritedAcceptanceSummary: dryRun.inheritedAcceptanceSummary,
    inheritedNoopDryRunSummary: {
      dryRunStatus: dryRun.dryRunStatus,
      executionMode: dryRun.executionMode,
      acceptanceStatus: dryRun.acceptanceStatus,
      handoffStatus: dryRun.handoffStatus,
      releaseDecision: dryRun.releaseDecision,
      checklistAcknowledged: dryRun.releaseOwnerSummary.checklistAcknowledged,
      dryRunRowCount: dryRun.counts.dryRunRowCount,
      dryRunRowPassedCount: dryRun.counts.dryRunRowPassedCount,
      executionPlanRowCount: dryRun.counts.executionPlanRowCount,
      executionPlanReadyCount: dryRun.counts.executionPlanReadyCount,
      externalCallsZero: true,
      safeDigest: dryRun.safeDigest
    },
    inheritedBlockingReasons: dryRun.inheritedBlockingReasons,
    inheritedExceptionRows: dryRun.inheritedExceptionRows,
    counts: {
      ...dryRun.counts,
      dryRunResultLedgerCheckedCount: 1,
      dryRunResultLedgerMutationCount: 0,
      resultLedgerRowCount: resultLedgerRows.length,
      resultLedgerRowRecordedCount: resultLedgerRows.length,
      finalReadinessRowCount: finalReadinessRows.length,
      finalReadinessReadyCount: finalReadinessRows.length
    },
    externalCalls: 0
  };
}

function providerWebhookArchiveCertifiedReleaseFinalReadinessCertificateResponse() {
  const resultLedger = providerWebhookArchiveCertifiedReleaseDryRunResultLedgerResponse();
  const certificateRows = [
    providerWebhookCertifiedReleaseFinalReadinessCertificateRow("dryrun_result_ledger", "Dry-run result ledger recorded", resultLedger.dryRunResultLedgerDigest, resultLedger.counts.dryRunResultLedgerCheckedCount),
    providerWebhookCertifiedReleaseFinalReadinessCertificateRow("dryrun_passed", "Dry-run passed", resultLedger.noopExecutionDryRunDigest, 1),
    providerWebhookCertifiedReleaseFinalReadinessCertificateRow("external_calls_zero", "External calls zero", resultLedger.dryRunResultLedgerDigest, resultLedger.externalCalls)
  ];
  return {
    certificateKind: "qa-handoff-locked-archive-certified-release-final-readiness-certificate",
    certificateStatus: "issued",
    finalReadinessStatus: "ready",
    ledgerStatus: resultLedger.ledgerStatus,
    dryRunStatus: resultLedger.dryRunStatus,
    executionMode: resultLedger.executionMode,
    acceptanceStatus: resultLedger.acceptanceStatus,
    handoffStatus: resultLedger.handoffStatus,
    releaseDecision: resultLedger.releaseDecision,
    packetStatus: resultLedger.packetStatus,
    receiptStatus: resultLedger.receiptStatus,
    gateStatus: resultLedger.gateStatus,
    goNoGoDecision: resultLedger.goNoGoDecision,
    releaseReadinessStatus: resultLedger.releaseReadinessStatus,
    reconciliationStatus: resultLedger.reconciliationStatus,
    attestationStatus: resultLedger.attestationStatus,
    ledgerStatusFromClosure: resultLedger.ledgerStatusFromClosure,
    certificationStatus: resultLedger.certificationStatus,
    verificationStatus: resultLedger.verificationStatus,
    digestChainStatus: resultLedger.digestChainStatus,
    safeFilename: "provider-webhook-review-qa-handoff-certified-release-final-readiness-certificate.json",
    safeDigest: "sha256:safeqahandoffcertifiedreleasefinalreadinesscertificate",
    finalReadinessCertificateDigest: "sha256:safeqahandoffcertifiedreleasefinalreadinesscertificate",
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
    inheritedAcceptanceSummary: resultLedger.inheritedAcceptanceSummary,
    inheritedNoopDryRunSummary: resultLedger.inheritedNoopDryRunSummary,
    inheritedResultLedgerSummary: {
      ledgerStatus: resultLedger.ledgerStatus,
      dryRunStatus: resultLedger.dryRunStatus,
      executionMode: resultLedger.executionMode,
      acceptanceStatus: resultLedger.acceptanceStatus,
      handoffStatus: resultLedger.handoffStatus,
      releaseDecision: resultLedger.releaseDecision,
      resultLedgerRowCount: resultLedger.counts.resultLedgerRowCount,
      resultLedgerRowRecordedCount: resultLedger.counts.resultLedgerRowRecordedCount,
      finalReadinessRowCount: resultLedger.counts.finalReadinessRowCount,
      finalReadinessReadyCount: resultLedger.counts.finalReadinessReadyCount,
      externalCallsZero: true,
      safeDigest: resultLedger.safeDigest
    },
    inheritedBlockingReasons: resultLedger.inheritedBlockingReasons,
    inheritedExceptionRows: resultLedger.inheritedExceptionRows,
    counts: {
      ...resultLedger.counts,
      finalReadinessCertificateCheckedCount: 1,
      finalReadinessCertificateMutationCount: 0,
      certificateRowCount: certificateRows.length,
      certificateRowIssuedCount: certificateRows.length
    },
    externalCalls: 0
  };
}

function providerWebhookArchiveCertifiedReleaseFreezeAuditRegisterResponse() {
  const certificate = providerWebhookArchiveCertifiedReleaseFinalReadinessCertificateResponse();
  const freezeAuditRows = [
    providerWebhookCertifiedReleaseFreezeAuditRegisterRow("final_readiness_certificate", "Final readiness certificate issued", certificate.finalReadinessCertificateDigest, 1),
    providerWebhookCertifiedReleaseFreezeAuditRegisterRow("release_freeze_scope", "Release freeze scope registered", "sha256:safeqahandoffcertifiedreleasefreezeauditregister", certificate.counts.certificateRowCount),
    providerWebhookCertifiedReleaseFreezeAuditRegisterRow("safe_digests", "Freeze register safe digest chain", "sha256:safeqahandoffcertifiedreleasefreezeauditregister", 16),
    providerWebhookCertifiedReleaseFreezeAuditRegisterRow("no_state_mutation", "No freeze audit register state mutation", certificate.finalReadinessCertificateDigest, 0),
    providerWebhookCertifiedReleaseFreezeAuditRegisterRow("external_calls_zero", "External calls zero", certificate.finalReadinessCertificateDigest, 0)
  ];
  const rollbackPlanRows = [
    providerWebhookCertifiedReleaseFreezeAuditRegisterRow("rollback_plan_ready", "Safe rollback readiness plan ready", "sha256:safeqahandoffcertifiedreleaserollbackreadinessplan", certificate.counts.finalReadinessReadyCount),
    providerWebhookCertifiedReleaseFreezeAuditRegisterRow("rollback_owner_confirmed", "Release owner rollback readiness confirmed", certificate.safeDigest, 1),
    providerWebhookCertifiedReleaseFreezeAuditRegisterRow("safe_digests", "Rollback plan safe digest chain", "sha256:safeqahandoffcertifiedreleaserollbackreadinessplan", 16),
    providerWebhookCertifiedReleaseFreezeAuditRegisterRow("no_state_mutation", "No rollback readiness plan state mutation", certificate.finalReadinessCertificateDigest, 0),
    providerWebhookCertifiedReleaseFreezeAuditRegisterRow("external_calls_zero", "External calls zero", certificate.finalReadinessCertificateDigest, 0)
  ];
  return {
    registerKind: "qa-handoff-locked-archive-certified-release-freeze-audit-register",
    freezeAuditStatus: "recorded",
    freezeStatus: "frozen",
    rollbackReadinessStatus: "ready",
    certificateStatus: certificate.certificateStatus,
    finalReadinessStatus: certificate.finalReadinessStatus,
    ledgerStatus: certificate.ledgerStatus,
    dryRunStatus: certificate.dryRunStatus,
    executionMode: certificate.executionMode,
    acceptanceStatus: certificate.acceptanceStatus,
    handoffStatus: certificate.handoffStatus,
    releaseDecision: certificate.releaseDecision,
    packetStatus: certificate.packetStatus,
    receiptStatus: certificate.receiptStatus,
    gateStatus: certificate.gateStatus,
    goNoGoDecision: certificate.goNoGoDecision,
    releaseReadinessStatus: certificate.releaseReadinessStatus,
    reconciliationStatus: certificate.reconciliationStatus,
    attestationStatus: certificate.attestationStatus,
    ledgerStatusFromClosure: certificate.ledgerStatusFromClosure,
    certificationStatus: certificate.certificationStatus,
    verificationStatus: certificate.verificationStatus,
    digestChainStatus: certificate.digestChainStatus,
    safeFilename: "provider-webhook-review-qa-handoff-certified-release-freeze-audit-register.json",
    safeDigest: "sha256:safeqahandoffcertifiedreleasefreezeauditregister",
    freezeAuditRegisterDigest: "sha256:safeqahandoffcertifiedreleasefreezeauditregister",
    rollbackReadinessPlanDigest: "sha256:safeqahandoffcertifiedreleaserollbackreadinessplan",
    finalReadinessCertificateDigest: certificate.finalReadinessCertificateDigest,
    dryRunResultLedgerDigest: certificate.dryRunResultLedgerDigest,
    noopExecutionDryRunDigest: certificate.noopExecutionDryRunDigest,
    acceptanceRecordDigest: certificate.acceptanceRecordDigest,
    handoffPacketDigest: certificate.handoffPacketDigest,
    decisionReceiptDigest: certificate.decisionReceiptDigest,
    releaseGateDigest: certificate.releaseGateDigest,
    reconciliationDigest: certificate.reconciliationDigest,
    attestationAuditDigest: certificate.attestationAuditDigest,
    closureLedgerDigest: certificate.closureLedgerDigest,
    certificationDigest: certificate.certificationDigest,
    verificationDigest: certificate.verificationDigest,
    releaseEvidenceDigest: certificate.releaseEvidenceDigest,
    operatorChecklist: certificate.operatorChecklist,
    acknowledgedChecklist: certificate.acknowledgedChecklist,
    executionChecklist: certificate.executionChecklist,
    dryRunRows: certificate.dryRunRows,
    executionPlanRows: certificate.executionPlanRows,
    resultLedgerRows: certificate.resultLedgerRows,
    finalReadinessRows: certificate.finalReadinessRows,
    certificateRows: certificate.certificateRows,
    freezeAuditRows,
    rollbackPlanRows,
    releaseOwnerSummary: certificate.releaseOwnerSummary,
    inheritedPrerequisiteChecklist: certificate.inheritedPrerequisiteChecklist,
    inheritedCertificationChecklist: certificate.inheritedCertificationChecklist,
    inheritedGateChecklist: certificate.inheritedGateChecklist,
    inheritedDecisionReceiptSummary: certificate.inheritedDecisionReceiptSummary,
    inheritedHandoffPacketSummary: certificate.inheritedHandoffPacketSummary,
    inheritedAcceptanceSummary: certificate.inheritedAcceptanceSummary,
    inheritedNoopDryRunSummary: certificate.inheritedNoopDryRunSummary,
    inheritedResultLedgerSummary: certificate.inheritedResultLedgerSummary,
    inheritedFinalReadinessCertificateSummary: {
      certificateStatus: certificate.certificateStatus,
      finalReadinessStatus: certificate.finalReadinessStatus,
      certificateRowCount: certificate.counts.certificateRowCount,
      certificateRowIssuedCount: certificate.counts.certificateRowIssuedCount,
      finalReadinessCertificateMutationCount: certificate.counts.finalReadinessCertificateMutationCount,
      externalCallsZero: true,
      safeDigest: certificate.safeDigest
    },
    inheritedBlockingReasons: certificate.inheritedBlockingReasons,
    inheritedExceptionRows: certificate.inheritedExceptionRows,
    counts: {
      ...certificate.counts,
      freezeAuditRegisterCheckedCount: 1,
      freezeAuditRegisterMutationCount: 0,
      freezeAuditRowCount: freezeAuditRows.length,
      freezeAuditRegisteredCount: freezeAuditRows.length,
      rollbackPlanRowCount: rollbackPlanRows.length,
      rollbackPlanReadyCount: rollbackPlanRows.length
    },
    externalCalls: 0
  };
}

function providerWebhookArchiveCertifiedReleaseRollbackRehearsalReceiptResponse() {
  const freezeAuditRegister = providerWebhookArchiveCertifiedReleaseFreezeAuditRegisterResponse();
  const rollbackRehearsalReceiptDigest = "sha256:safeqahandoffcertifiedreleaserollbackrehearsalreceipt";
  const freezeSnapshotRows = [
    providerWebhookCertifiedReleaseRollbackRehearsalReceiptRow("freeze_audit_recorded", "Freeze audit register recorded", freezeAuditRegister.freezeAuditRegisterDigest, freezeAuditRegister.counts.freezeAuditRegisteredCount),
    providerWebhookCertifiedReleaseRollbackRehearsalReceiptRow("release_frozen", "Certified release freeze remains frozen", freezeAuditRegister.freezeAuditRegisterDigest, 1),
    providerWebhookCertifiedReleaseRollbackRehearsalReceiptRow("safe_digest_chain", "Freeze snapshot safe digest chain", rollbackRehearsalReceiptDigest, 17)
  ];
  const rollbackReadinessRows = [
    providerWebhookCertifiedReleaseRollbackRehearsalReceiptRow("rollback_readiness_ready", "Rollback readiness status ready", freezeAuditRegister.freezeAuditRegisterDigest, freezeAuditRegister.counts.rollbackPlanReadyCount),
    providerWebhookCertifiedReleaseRollbackRehearsalReceiptRow("recovery_owner_confirmed", "Release owner recovery readiness confirmed", freezeAuditRegister.safeDigest, 1),
    providerWebhookCertifiedReleaseRollbackRehearsalReceiptRow("safe_digest_chain", "Rollback readiness safe digest chain", rollbackRehearsalReceiptDigest, 17)
  ];
  const rollbackRehearsalRows = [
    providerWebhookCertifiedReleaseRollbackRehearsalReceiptRow("dry_run_noop_passed", "No-op execution dry-run passed", freezeAuditRegister.noopExecutionDryRunDigest, freezeAuditRegister.counts.dryRunRowPassedCount),
    providerWebhookCertifiedReleaseRollbackRehearsalReceiptRow("rollback_rehearsal_noop", "Rollback rehearsal receipt is read-only no-op evidence", rollbackRehearsalReceiptDigest, 1),
    providerWebhookCertifiedReleaseRollbackRehearsalReceiptRow("no_state_mutation", "No rollback rehearsal receipt state mutation", freezeAuditRegister.freezeAuditRegisterDigest, 0),
    providerWebhookCertifiedReleaseRollbackRehearsalReceiptRow("external_calls_zero", "External calls zero", freezeAuditRegister.freezeAuditRegisterDigest, 0)
  ];
  const recoveryPlanRows = [
    providerWebhookCertifiedReleaseRollbackRehearsalReceiptRow("recovery_plan_ready", "Safe recovery plan ready", freezeAuditRegister.freezeAuditRegisterDigest, freezeAuditRegister.counts.rollbackPlanReadyCount),
    providerWebhookCertifiedReleaseRollbackRehearsalReceiptRow("certificate_issued", "Final readiness certificate issued", freezeAuditRegister.finalReadinessCertificateDigest, freezeAuditRegister.counts.certificateRowIssuedCount),
    providerWebhookCertifiedReleaseRollbackRehearsalReceiptRow("final_readiness_ready", "Final readiness remains ready", freezeAuditRegister.finalReadinessCertificateDigest, freezeAuditRegister.counts.finalReadinessReadyCount)
  ];
  const recoveryReadinessRows = [
    providerWebhookCertifiedReleaseRollbackRehearsalReceiptRow("safe_digest_chain", "Recovery readiness safe digest chain", rollbackRehearsalReceiptDigest, 17),
    providerWebhookCertifiedReleaseRollbackRehearsalReceiptRow("no_state_mutation", "No recovery readiness state mutation", freezeAuditRegister.freezeAuditRegisterDigest, 0),
    providerWebhookCertifiedReleaseRollbackRehearsalReceiptRow("external_calls_zero", "External calls zero", freezeAuditRegister.freezeAuditRegisterDigest, 0)
  ];
  return {
    receiptKind: "qa-handoff-locked-archive-certified-release-rollback-rehearsal-receipt",
    rollbackRehearsalStatus: "verified",
    recoveryReadinessStatus: "ready",
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
    releaseDecision: freezeAuditRegister.releaseDecision,
    packetStatus: freezeAuditRegister.packetStatus,
    receiptStatus: freezeAuditRegister.receiptStatus,
    gateStatus: freezeAuditRegister.gateStatus,
    goNoGoDecision: freezeAuditRegister.goNoGoDecision,
    releaseReadinessStatus: freezeAuditRegister.releaseReadinessStatus,
    reconciliationStatus: freezeAuditRegister.reconciliationStatus,
    attestationStatus: freezeAuditRegister.attestationStatus,
    ledgerStatusFromClosure: freezeAuditRegister.ledgerStatusFromClosure,
    certificationStatus: freezeAuditRegister.certificationStatus,
    verificationStatus: freezeAuditRegister.verificationStatus,
    digestChainStatus: freezeAuditRegister.digestChainStatus,
    safeFilename: "provider-webhook-review-qa-handoff-certified-release-rollback-rehearsal-receipt.json",
    safeDigest: rollbackRehearsalReceiptDigest,
    rollbackRehearsalReceiptDigest,
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
      externalCallsZero: true,
      safeDigest: freezeAuditRegister.safeDigest
    },
    inheritedBlockingReasons: freezeAuditRegister.inheritedBlockingReasons,
    inheritedExceptionRows: freezeAuditRegister.inheritedExceptionRows,
    counts: {
      ...freezeAuditRegister.counts,
      rollbackRehearsalReceiptCheckedCount: 1,
      rollbackRehearsalReceiptMutationCount: 0,
      freezeSnapshotRowCount: freezeSnapshotRows.length,
      freezeSnapshotVerifiedCount: freezeSnapshotRows.length,
      rollbackReadinessRowCount: rollbackReadinessRows.length,
      rollbackReadinessReadyCount: rollbackReadinessRows.length,
      rollbackRehearsalRowCount: rollbackRehearsalRows.length,
      rollbackRehearsalVerifiedCount: rollbackRehearsalRows.length,
      recoveryPlanRowCount: recoveryPlanRows.length,
      recoveryPlanReadyCount: recoveryPlanRows.length,
      recoveryReadinessRowCount: recoveryReadinessRows.length,
      recoveryReadinessReadyCount: recoveryReadinessRows.length
    },
    externalCalls: 0
  };
}

function providerWebhookArchiveCertifiedReleaseControlRoomPacketResponse() {
  const rollbackRehearsalReceipt = providerWebhookArchiveCertifiedReleaseRollbackRehearsalReceiptResponse();
  const controlRoomPacketDigest = "sha256:safeqahandoffcertifiedreleasecontrolroompacket";
  const controlRoomRows = [
    providerWebhookCertifiedReleaseControlRoomPacketRow("rollback_rehearsal_verified", "Rollback rehearsal receipt verified", rollbackRehearsalReceipt.rollbackRehearsalReceiptDigest, rollbackRehearsalReceipt.counts.rollbackRehearsalVerifiedCount),
    providerWebhookCertifiedReleaseControlRoomPacketRow("recovery_readiness_ready", "Recovery readiness status ready", rollbackRehearsalReceipt.rollbackRehearsalReceiptDigest, rollbackRehearsalReceipt.counts.recoveryReadinessReadyCount),
    providerWebhookCertifiedReleaseControlRoomPacketRow("safe_digest_chain", "Control room packet safe digest chain", controlRoomPacketDigest, 18),
    providerWebhookCertifiedReleaseControlRoomPacketRow("no_state_mutation", "No control room packet state mutation", rollbackRehearsalReceipt.rollbackRehearsalReceiptDigest, 0),
    providerWebhookCertifiedReleaseControlRoomPacketRow("external_calls_zero", "External calls zero", rollbackRehearsalReceipt.rollbackRehearsalReceiptDigest, 0)
  ];
  const cutoverChecklistRows = [
    providerWebhookCertifiedReleaseControlRoomPacketRow("rollback_readiness_ready", "Rollback readiness remains ready", rollbackRehearsalReceipt.freezeAuditRegisterDigest, rollbackRehearsalReceipt.counts.rollbackReadinessReadyCount),
    providerWebhookCertifiedReleaseControlRoomPacketRow("freeze_audit_recorded", "Freeze audit register recorded", rollbackRehearsalReceipt.freezeAuditRegisterDigest, rollbackRehearsalReceipt.counts.freezeAuditRegisteredCount),
    providerWebhookCertifiedReleaseControlRoomPacketRow("release_frozen", "Certified release remains frozen", rollbackRehearsalReceipt.freezeAuditRegisterDigest, 1),
    providerWebhookCertifiedReleaseControlRoomPacketRow("final_readiness_ready", "Final readiness remains ready", rollbackRehearsalReceipt.finalReadinessCertificateDigest, rollbackRehearsalReceipt.counts.finalReadinessReadyCount),
    providerWebhookCertifiedReleaseControlRoomPacketRow("go_decision_confirmed", "Go/no-go decision remains go", controlRoomPacketDigest, 1)
  ];
  const operatorHandoffRows = [
    providerWebhookCertifiedReleaseControlRoomPacketRow("operator_checklist_complete", "Operator checklist complete", rollbackRehearsalReceipt.handoffPacketDigest, rollbackRehearsalReceipt.counts.operatorChecklistCompleteCount),
    providerWebhookCertifiedReleaseControlRoomPacketRow("acknowledgement_complete", "Acknowledged checklist complete", rollbackRehearsalReceipt.acceptanceRecordDigest, rollbackRehearsalReceipt.counts.acknowledgedChecklistCompleteCount),
    providerWebhookCertifiedReleaseControlRoomPacketRow("execution_checklist_complete", "Execution checklist complete", rollbackRehearsalReceipt.noopExecutionDryRunDigest, rollbackRehearsalReceipt.counts.executionChecklistCompleteCount),
    providerWebhookCertifiedReleaseControlRoomPacketRow("receipt_issued", "Decision receipt issued", rollbackRehearsalReceipt.decisionReceiptDigest, 1),
    providerWebhookCertifiedReleaseControlRoomPacketRow("packet_issued", "Handoff packet issued", controlRoomPacketDigest, 1)
  ];
  const { receiptKind: _receiptKind, safeFilename: _safeFilename, safeDigest: _safeDigest, counts: rollbackCounts, externalCalls: _externalCalls, ...base } = rollbackRehearsalReceipt;
  return {
    packetKind: "qa-handoff-locked-archive-certified-release-control-room-packet",
    controlRoomStatus: "ready",
    cutoverReadinessStatus: "ready",
    ...base,
    safeFilename: "provider-webhook-review-qa-handoff-certified-release-control-room-packet.json",
    safeDigest: controlRoomPacketDigest,
    controlRoomPacketDigest,
    controlRoomRows,
    cutoverChecklistRows,
    operatorHandoffRows,
    inheritedRollbackRehearsalSummary: {
      rollbackRehearsalStatus: rollbackRehearsalReceipt.rollbackRehearsalStatus,
      recoveryReadinessStatus: rollbackRehearsalReceipt.recoveryReadinessStatus,
      rollbackRehearsalRowCount: rollbackRehearsalReceipt.counts.rollbackRehearsalRowCount,
      rollbackRehearsalVerifiedCount: rollbackRehearsalReceipt.counts.rollbackRehearsalVerifiedCount,
      recoveryReadinessRowCount: rollbackRehearsalReceipt.counts.recoveryReadinessRowCount,
      recoveryReadinessReadyCount: rollbackRehearsalReceipt.counts.recoveryReadinessReadyCount,
      rollbackRehearsalReceiptMutationCount: rollbackRehearsalReceipt.counts.rollbackRehearsalReceiptMutationCount,
      externalCallsZero: true,
      safeDigest: rollbackRehearsalReceipt.safeDigest
    },
    counts: {
      ...rollbackCounts,
      controlRoomPacketCheckedCount: 1,
      controlRoomPacketMutationCount: 0,
      controlRoomRowCount: controlRoomRows.length,
      controlRoomReadyCount: controlRoomRows.length,
      cutoverChecklistRowCount: cutoverChecklistRows.length,
      cutoverChecklistReadyCount: cutoverChecklistRows.length,
      operatorHandoffRowCount: operatorHandoffRows.length,
      operatorHandoffReadyCount: operatorHandoffRows.length
    },
    externalCalls: 0
  };
}

function providerWebhookArchiveCertifiedReleaseCutoverChecklistReceiptResponse() {
  const controlRoomPacket = providerWebhookArchiveCertifiedReleaseControlRoomPacketResponse();
  const cutoverChecklistReceiptDigest = "sha256:safeqahandoffcertifiedreleasecutoverchecklistreceipt";
  const operatorCommandRows = [
    providerWebhookCertifiedReleaseCutoverChecklistReceiptRow("operator_checklist_complete", "Operator checklist complete", controlRoomPacket.handoffPacketDigest, controlRoomPacket.counts.operatorChecklistCompleteCount),
    providerWebhookCertifiedReleaseCutoverChecklistReceiptRow("acknowledgement_complete", "Acknowledged checklist complete", controlRoomPacket.acceptanceRecordDigest, controlRoomPacket.counts.acknowledgedChecklistCompleteCount),
    providerWebhookCertifiedReleaseCutoverChecklistReceiptRow("execution_checklist_complete", "Execution checklist complete", controlRoomPacket.noopExecutionDryRunDigest, controlRoomPacket.counts.executionChecklistCompleteCount),
    providerWebhookCertifiedReleaseCutoverChecklistReceiptRow("handoff_ready", "Certified release handoff ready", controlRoomPacket.handoffPacketDigest, 1),
    providerWebhookCertifiedReleaseCutoverChecklistReceiptRow("no_op_execution", "No-op execution mode enforced", controlRoomPacket.noopExecutionDryRunDigest, 1),
    providerWebhookCertifiedReleaseCutoverChecklistReceiptRow("operator_command_ready", "Safe operator command handoff ready", cutoverChecklistReceiptDigest, 1)
  ];
  const safeCutoverChecklistRows = [
    providerWebhookCertifiedReleaseCutoverChecklistReceiptRow("control_room_ready", "Control room packet ready", controlRoomPacket.controlRoomPacketDigest, controlRoomPacket.counts.controlRoomReadyCount),
    providerWebhookCertifiedReleaseCutoverChecklistReceiptRow("cutover_readiness_ready", "Cutover readiness ready", controlRoomPacket.controlRoomPacketDigest, controlRoomPacket.counts.cutoverChecklistReadyCount),
    providerWebhookCertifiedReleaseCutoverChecklistReceiptRow("rollback_rehearsal_verified", "Rollback rehearsal receipt verified", controlRoomPacket.rollbackRehearsalReceiptDigest, controlRoomPacket.counts.rollbackRehearsalVerifiedCount),
    providerWebhookCertifiedReleaseCutoverChecklistReceiptRow("recovery_readiness_ready", "Recovery readiness ready", controlRoomPacket.rollbackRehearsalReceiptDigest, controlRoomPacket.counts.recoveryReadinessReadyCount),
    providerWebhookCertifiedReleaseCutoverChecklistReceiptRow("rollback_readiness_ready", "Rollback readiness ready", controlRoomPacket.freezeAuditRegisterDigest, controlRoomPacket.counts.rollbackReadinessReadyCount),
    providerWebhookCertifiedReleaseCutoverChecklistReceiptRow("freeze_audit_recorded", "Freeze audit register recorded", controlRoomPacket.freezeAuditRegisterDigest, controlRoomPacket.counts.freezeAuditRegisteredCount),
    providerWebhookCertifiedReleaseCutoverChecklistReceiptRow("release_frozen", "Certified release frozen", controlRoomPacket.freezeAuditRegisterDigest, 1),
    providerWebhookCertifiedReleaseCutoverChecklistReceiptRow("final_readiness_ready", "Final readiness certificate ready", controlRoomPacket.finalReadinessCertificateDigest, controlRoomPacket.counts.finalReadinessReadyCount),
    providerWebhookCertifiedReleaseCutoverChecklistReceiptRow("ledger_recorded", "Dry-run result ledger recorded", controlRoomPacket.dryRunResultLedgerDigest, controlRoomPacket.counts.resultLedgerRowRecordedCount),
    providerWebhookCertifiedReleaseCutoverChecklistReceiptRow("dry_run_passed", "No-op execution dry-run passed", controlRoomPacket.noopExecutionDryRunDigest, controlRoomPacket.counts.dryRunRowPassedCount),
    providerWebhookCertifiedReleaseCutoverChecklistReceiptRow("release_decision_go", "Release decision remains go", controlRoomPacket.decisionReceiptDigest, 1),
    providerWebhookCertifiedReleaseCutoverChecklistReceiptRow("safe_digest_chain", "Cutover checklist receipt safe digest chain", cutoverChecklistReceiptDigest, 19),
    providerWebhookCertifiedReleaseCutoverChecklistReceiptRow("no_state_mutation", "No cutover checklist receipt state mutation", controlRoomPacket.controlRoomPacketDigest, 0),
    providerWebhookCertifiedReleaseCutoverChecklistReceiptRow("external_calls_zero", "External calls zero", controlRoomPacket.controlRoomPacketDigest, 0)
  ];
  const { packetKind: _packetKind, safeFilename: _safeFilename, safeDigest: _safeDigest, counts: controlRoomCounts, externalCalls: _externalCalls, ...base } = controlRoomPacket;
  return {
    receiptKind: "qa-handoff-locked-archive-certified-release-cutover-checklist-receipt",
    cutoverChecklistStatus: "verified",
    operatorCommandStatus: "ready",
    ...base,
    safeFilename: "provider-webhook-review-qa-handoff-certified-release-cutover-checklist-receipt.json",
    safeDigest: cutoverChecklistReceiptDigest,
    cutoverChecklistReceiptDigest,
    operatorCommandRows,
    safeCutoverChecklistRows,
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
      externalCallsZero: true,
      safeDigest: controlRoomPacket.safeDigest
    },
    counts: {
      ...controlRoomCounts,
      cutoverChecklistReceiptCheckedCount: 1,
      cutoverChecklistReceiptMutationCount: 0,
      operatorCommandRowCount: operatorCommandRows.length,
      operatorCommandReadyCount: operatorCommandRows.length,
      safeCutoverChecklistRowCount: safeCutoverChecklistRows.length,
      safeCutoverChecklistReadyCount: safeCutoverChecklistRows.length
    },
    externalCalls: 0
  };
}

function providerWebhookArchiveCertifiedReleaseOperatorCommandReceiptResponse() {
  const cutoverChecklistReceipt = providerWebhookArchiveCertifiedReleaseCutoverChecklistReceiptResponse();
  const operatorCommandReceiptDigest = "sha256:safeqahandoffcertifiedreleaseoperatorcommandreceipt";
  const goLiveAuthorizationRows = [
    providerWebhookCertifiedReleaseOperatorCommandReceiptRow("cutover_checklist_verified", "Cutover checklist receipt verified", cutoverChecklistReceipt.cutoverChecklistReceiptDigest, 1),
    providerWebhookCertifiedReleaseOperatorCommandReceiptRow("operator_command_ready", "Safe operator command ready", cutoverChecklistReceipt.cutoverChecklistReceiptDigest, cutoverChecklistReceipt.counts.operatorCommandReadyCount),
    providerWebhookCertifiedReleaseOperatorCommandReceiptRow("go_live_authorization_ready", "Safe go-live authorization preview ready", operatorCommandReceiptDigest, 1)
  ];
  const operatorCommandReceiptRows = [
    providerWebhookCertifiedReleaseOperatorCommandReceiptRow("operator_command_receipt_issued", "Operator command receipt issued", operatorCommandReceiptDigest, 1),
    providerWebhookCertifiedReleaseOperatorCommandReceiptRow("safe_digest_chain", "Operator command receipt safe digest chain", operatorCommandReceiptDigest, 20)
  ];
  const commandHandoffRows = [
    providerWebhookCertifiedReleaseOperatorCommandReceiptRow("no_op_execution", "No-op execution mode enforced", cutoverChecklistReceipt.noopExecutionDryRunDigest, 1),
    providerWebhookCertifiedReleaseOperatorCommandReceiptRow("release_decision_go", "Release decision remains go", cutoverChecklistReceipt.decisionReceiptDigest, 1)
  ];

  return {
    ...cutoverChecklistReceipt,
    receiptKind: "qa-handoff-locked-archive-certified-release-operator-command-receipt",
    operatorCommandReceiptStatus: "issued",
    goLiveAuthorizationStatus: "ready",
    safeFilename: "provider-webhook-review-qa-handoff-certified-release-operator-command-receipt.json",
    safeDigest: operatorCommandReceiptDigest,
    operatorCommandReceiptDigest,
    goLiveAuthorizationRows,
    operatorCommandReceiptRows,
    commandHandoffRows,
    inheritedCutoverChecklistSummary: {
      cutoverChecklistStatus: "verified",
      operatorCommandStatus: "ready",
      cutoverChecklistReceiptCheckedCount: 1,
      cutoverChecklistReceiptMutationCount: 0,
      operatorCommandReadyCount: cutoverChecklistReceipt.counts.operatorCommandReadyCount,
      safeCutoverChecklistReadyCount: cutoverChecklistReceipt.counts.safeCutoverChecklistReadyCount,
      externalCallsZero: true,
      safeDigest: cutoverChecklistReceipt.safeDigest
    },
    counts: {
      ...cutoverChecklistReceipt.counts,
      operatorCommandReceiptCheckedCount: 1,
      operatorCommandReceiptMutationCount: 0,
      goLiveAuthorizationRowCount: goLiveAuthorizationRows.length,
      goLiveAuthorizationReadyCount: goLiveAuthorizationRows.length,
      operatorCommandReceiptRowCount: operatorCommandReceiptRows.length,
      operatorCommandReceiptIssuedCount: operatorCommandReceiptRows.length,
      commandHandoffRowCount: commandHandoffRows.length,
      commandHandoffReadyCount: commandHandoffRows.length
    },
    externalCalls: 0
  };
}

function providerWebhookCertifiedReleaseFreezeAuditRegisterRow(key: string, label: string, safeDigest: string, checkedCount: number) {
  return { key, label, freezeAuditStatus: "recorded", rollbackReadinessStatus: "ready", safeDigest, checkedCount, complete: true };
}

function providerWebhookCertifiedReleaseRollbackRehearsalReceiptRow(key: string, label: string, safeDigest: string, checkedCount: number) {
  return { key, label, rollbackRehearsalStatus: "verified", recoveryReadinessStatus: "ready", safeDigest, checkedCount, complete: true };
}

function providerWebhookCertifiedReleaseControlRoomPacketRow(key: string, label: string, safeDigest: string, checkedCount: number) {
  return { key, label, controlRoomStatus: "ready", cutoverReadinessStatus: "ready", safeDigest, checkedCount, complete: true };
}

function providerWebhookCertifiedReleaseCutoverChecklistReceiptRow(key: string, label: string, safeDigest: string, checkedCount: number) {
  return { key, label, cutoverChecklistStatus: "verified", operatorCommandStatus: "ready", safeDigest, checkedCount, complete: true };
}

function providerWebhookCertifiedReleaseOperatorCommandReceiptRow(key: string, label: string, safeDigest: string, checkedCount: number) {
  return { key, label, operatorCommandReceiptStatus: "issued", goLiveAuthorizationStatus: "ready", cutoverChecklistStatus: "verified", operatorCommandStatus: "ready", safeDigest, checkedCount, complete: true };
}

function providerWebhookArchiveCertifiedReleaseGoLiveAuthorizationReceiptResponse() {
  const operatorCommandReceipt = providerWebhookArchiveCertifiedReleaseOperatorCommandReceiptResponse();
  const goLiveAuthorizationReceiptDigest = "sha256:safeqahandoffcertifiedreleasegoliveauthorizationreceipt";
  const goLiveAuthorizationReceiptRows = [
    providerWebhookCertifiedReleaseGoLiveAuthorizationReceiptRow("operator_command_receipt_issued", "Operator command receipt issued", operatorCommandReceipt.operatorCommandReceiptDigest, 1),
    providerWebhookCertifiedReleaseGoLiveAuthorizationReceiptRow("launch_window_ready", "Safe launch window ready", goLiveAuthorizationReceiptDigest, 1)
  ];
  const launchWindowRows = [
    providerWebhookCertifiedReleaseGoLiveAuthorizationReceiptRow("control_room_ready", "Control room packet ready", operatorCommandReceipt.controlRoomPacketDigest, 1),
    providerWebhookCertifiedReleaseGoLiveAuthorizationReceiptRow("safe_digest_chain", "Go-live authorization receipt safe digest chain", goLiveAuthorizationReceiptDigest, 21)
  ];
  const safeLaunchWindowRows = [
    providerWebhookCertifiedReleaseGoLiveAuthorizationReceiptRow("no_op_execution", "No-op execution mode enforced", operatorCommandReceipt.noopExecutionDryRunDigest, 1),
    providerWebhookCertifiedReleaseGoLiveAuthorizationReceiptRow("release_decision_go", "Release decision remains go", operatorCommandReceipt.decisionReceiptDigest, 1)
  ];

  return {
    ...operatorCommandReceipt,
    receiptKind: "qa-handoff-locked-archive-certified-release-go-live-authorization-receipt",
    goLiveAuthorizationReceiptStatus: "issued",
    launchWindowStatus: "ready",
    safeLaunchWindowStatus: "ready",
    safeFilename: "provider-webhook-review-qa-handoff-certified-release-go-live-authorization-receipt.json",
    safeDigest: goLiveAuthorizationReceiptDigest,
    goLiveAuthorizationReceiptDigest,
    goLiveAuthorizationReceiptRows,
    launchWindowRows,
    safeLaunchWindowRows,
    inheritedOperatorCommandSummary: {
      operatorCommandReceiptStatus: "issued",
      goLiveAuthorizationStatus: "ready",
      operatorCommandReceiptCheckedCount: 1,
      operatorCommandReceiptMutationCount: 0,
      goLiveAuthorizationReadyCount: operatorCommandReceipt.goLiveAuthorizationRows.length,
      operatorCommandReceiptIssuedCount: operatorCommandReceipt.operatorCommandReceiptRows.length,
      commandHandoffReadyCount: operatorCommandReceipt.commandHandoffRows.length,
      externalCallsZero: true,
      safeDigest: operatorCommandReceipt.safeDigest
    },
    counts: {
      ...operatorCommandReceipt.counts,
      goLiveAuthorizationReceiptCheckedCount: 1,
      goLiveAuthorizationReceiptMutationCount: 0,
      goLiveAuthorizationReceiptRowCount: goLiveAuthorizationReceiptRows.length,
      goLiveAuthorizationReceiptIssuedCount: goLiveAuthorizationReceiptRows.length,
      launchWindowRowCount: launchWindowRows.length,
      launchWindowReadyCount: launchWindowRows.length,
      safeLaunchWindowRowCount: safeLaunchWindowRows.length,
      safeLaunchWindowReadyCount: safeLaunchWindowRows.length
    },
    externalCalls: 0
  };
}

function providerWebhookCertifiedReleaseGoLiveAuthorizationReceiptRow(key: string, label: string, safeDigest: string, checkedCount: number) {
  return { key, label, goLiveAuthorizationReceiptStatus: "issued", goLiveAuthorizationStatus: "ready", launchWindowStatus: "ready", safeLaunchWindowStatus: "ready", operatorCommandReceiptStatus: "issued", operatorCommandStatus: "ready", safeDigest, checkedCount, complete: true };
}

function providerWebhookArchiveCertifiedReleaseLaunchWindowConfirmationReceiptResponse() {
  const goLiveAuthorizationReceipt = providerWebhookArchiveCertifiedReleaseGoLiveAuthorizationReceiptResponse();
  const launchWindowConfirmationReceiptDigest = "sha256:safeqahandoffcertifiedreleaselaunchwindowconfirmationreceipt";
  const launchWindowConfirmationRows = [
    providerWebhookCertifiedReleaseLaunchWindowConfirmationReceiptRow("go_live_authorization_receipt_issued", "Go-live authorization receipt issued", goLiveAuthorizationReceipt.goLiveAuthorizationReceiptDigest, 1),
    providerWebhookCertifiedReleaseLaunchWindowConfirmationReceiptRow("launch_window_confirmation_confirmed", "Launch window confirmation receipt confirmed", launchWindowConfirmationReceiptDigest, 1)
  ];
  const goLiveHoldRows = [
    providerWebhookCertifiedReleaseLaunchWindowConfirmationReceiptRow("go_live_hold_ready", "Safe go-live hold register ready", launchWindowConfirmationReceiptDigest, 1),
    providerWebhookCertifiedReleaseLaunchWindowConfirmationReceiptRow("safe_digest_chain", "Launch window confirmation receipt safe digest chain", launchWindowConfirmationReceiptDigest, 22)
  ];

  return {
    ...goLiveAuthorizationReceipt,
    receiptKind: "qa-handoff-locked-archive-certified-release-launch-window-confirmation-receipt",
    launchWindowConfirmationStatus: "confirmed",
    goLiveHoldStatus: "ready",
    safeFilename: "provider-webhook-review-qa-handoff-certified-release-launch-window-confirmation-receipt.json",
    safeDigest: launchWindowConfirmationReceiptDigest,
    launchWindowConfirmationReceiptDigest,
    launchWindowConfirmationRows,
    goLiveHoldRows,
    inheritedGoLiveAuthorizationSummary: {
      goLiveAuthorizationReceiptStatus: "issued",
      goLiveAuthorizationStatus: "ready",
      launchWindowStatus: "ready",
      safeLaunchWindowStatus: "ready",
      goLiveAuthorizationReceiptCheckedCount: 1,
      goLiveAuthorizationReceiptMutationCount: 0,
      goLiveAuthorizationReceiptIssuedCount: goLiveAuthorizationReceipt.goLiveAuthorizationReceiptRows.length,
      launchWindowReadyCount: goLiveAuthorizationReceipt.launchWindowRows.length,
      safeLaunchWindowReadyCount: goLiveAuthorizationReceipt.safeLaunchWindowRows.length,
      externalCallsZero: true,
      safeDigest: goLiveAuthorizationReceipt.safeDigest
    },
    counts: {
      ...goLiveAuthorizationReceipt.counts,
      launchWindowConfirmationReceiptCheckedCount: 1,
      launchWindowConfirmationReceiptMutationCount: 0,
      launchWindowConfirmationRowCount: launchWindowConfirmationRows.length,
      launchWindowConfirmationConfirmedCount: launchWindowConfirmationRows.length,
      goLiveHoldRowCount: goLiveHoldRows.length,
      goLiveHoldReadyCount: goLiveHoldRows.length
    },
    externalCalls: 0
  };
}

function providerWebhookCertifiedReleaseLaunchWindowConfirmationReceiptRow(key: string, label: string, safeDigest: string, checkedCount: number) {
  return { key, label, launchWindowConfirmationStatus: "confirmed", goLiveHoldStatus: "ready", goLiveAuthorizationReceiptStatus: "issued", goLiveAuthorizationStatus: "ready", launchWindowStatus: "ready", safeLaunchWindowStatus: "ready", operatorCommandReceiptStatus: "issued", operatorCommandStatus: "ready", safeDigest, checkedCount, complete: true };
}

function providerWebhookArchiveCertifiedReleaseGoLiveHoldReleaseAuthorizationReceiptResponse() {
  const launchWindowConfirmationReceipt = providerWebhookArchiveCertifiedReleaseLaunchWindowConfirmationReceiptResponse();
  const goLiveHoldReleaseAuthorizationReceiptDigest = "sha256:safeqahandoffcertifiedreleasegoliveholdreleaseauthorizationreceipt";
  const goLiveHoldReleaseAuthorizationRows = [
    providerWebhookCertifiedReleaseGoLiveHoldReleaseAuthorizationReceiptRow("launch_window_confirmation_confirmed", "Launch window confirmation receipt confirmed", launchWindowConfirmationReceipt.launchWindowConfirmationReceiptDigest, 1),
    providerWebhookCertifiedReleaseGoLiveHoldReleaseAuthorizationReceiptRow("go_live_hold_release_authorized", "Safe go-live hold release authorization issued", goLiveHoldReleaseAuthorizationReceiptDigest, 1)
  ];
  const launchApprovalRows = [
    providerWebhookCertifiedReleaseGoLiveHoldReleaseAuthorizationReceiptRow("operator_command_receipt_issued", "Operator command receipt issued", launchWindowConfirmationReceipt.operatorCommandReceiptDigest, 1),
    providerWebhookCertifiedReleaseGoLiveHoldReleaseAuthorizationReceiptRow("launch_approval_ready", "Launch approval register ready", goLiveHoldReleaseAuthorizationReceiptDigest, 1),
    providerWebhookCertifiedReleaseGoLiveHoldReleaseAuthorizationReceiptRow("safe_digest_chain", "Go-live hold release authorization receipt safe digest chain", goLiveHoldReleaseAuthorizationReceiptDigest, 23)
  ];

  return {
    ...launchWindowConfirmationReceipt,
    receiptKind: "qa-handoff-locked-archive-certified-release-go-live-hold-release-authorization-receipt",
    goLiveHoldReleaseAuthorizationStatus: "authorized",
    launchApprovalStatus: "ready",
    safeFilename: "provider-webhook-review-qa-handoff-certified-release-go-live-hold-release-authorization-receipt.json",
    safeDigest: goLiveHoldReleaseAuthorizationReceiptDigest,
    goLiveHoldReleaseAuthorizationReceiptDigest,
    goLiveHoldReleaseAuthorizationRows,
    launchApprovalRows,
    inheritedLaunchWindowConfirmationSummary: {
      launchWindowConfirmationStatus: "confirmed",
      goLiveHoldStatus: "ready",
      goLiveAuthorizationReceiptStatus: "issued",
      goLiveAuthorizationStatus: "ready",
      launchWindowStatus: "ready",
      safeLaunchWindowStatus: "ready",
      launchWindowConfirmationReceiptCheckedCount: 1,
      launchWindowConfirmationReceiptMutationCount: 0,
      launchWindowConfirmationConfirmedCount: launchWindowConfirmationReceipt.launchWindowConfirmationRows.length,
      goLiveHoldReadyCount: launchWindowConfirmationReceipt.goLiveHoldRows.length,
      externalCallsZero: true,
      safeDigest: launchWindowConfirmationReceipt.safeDigest
    },
    counts: {
      ...launchWindowConfirmationReceipt.counts,
      goLiveHoldReleaseAuthorizationReceiptCheckedCount: 1,
      goLiveHoldReleaseAuthorizationReceiptMutationCount: 0,
      goLiveHoldReleaseAuthorizationRowCount: goLiveHoldReleaseAuthorizationRows.length,
      goLiveHoldReleaseAuthorizationAuthorizedCount: goLiveHoldReleaseAuthorizationRows.length,
      launchApprovalRowCount: launchApprovalRows.length,
      launchApprovalReadyCount: launchApprovalRows.length
    },
    externalCalls: 0
  };
}

function providerWebhookArchiveCertifiedReleaseLaunchApprovalReceiptResponse() {
  const goLiveHoldReleaseAuthorizationReceipt = providerWebhookArchiveCertifiedReleaseGoLiveHoldReleaseAuthorizationReceiptResponse();
  const launchApprovalReceiptDigest = "sha256:safeqahandoffcertifiedreleaselaunchapprovalreceipt";
  const noExecutionGuardRows = [
    providerWebhookCertifiedReleaseLaunchApprovalReceiptRow("go_live_hold_release_authorized", "Go-live hold release authorization remains authorized", goLiveHoldReleaseAuthorizationReceipt.goLiveHoldReleaseAuthorizationReceiptDigest, 1),
    providerWebhookCertifiedReleaseLaunchApprovalReceiptRow("launch_approval_receipt_issued", "Launch approval receipt issued", launchApprovalReceiptDigest, 1),
    providerWebhookCertifiedReleaseLaunchApprovalReceiptRow("no_execution_guard_retained", "No execution guard retained", goLiveHoldReleaseAuthorizationReceipt.safeDigest, 1),
    providerWebhookCertifiedReleaseLaunchApprovalReceiptRow("launch_approval_ready", "Launch approval remains ready", goLiveHoldReleaseAuthorizationReceipt.goLiveHoldReleaseAuthorizationReceiptDigest, 1),
    providerWebhookCertifiedReleaseLaunchApprovalReceiptRow("external_calls_zero", "External calls zero", goLiveHoldReleaseAuthorizationReceipt.safeDigest, 0),
    providerWebhookCertifiedReleaseLaunchApprovalReceiptRow("no_state_mutation", "No launch approval receipt state mutation", goLiveHoldReleaseAuthorizationReceipt.safeDigest, 0),
    providerWebhookCertifiedReleaseLaunchApprovalReceiptRow("safe_digest_chain", "Launch approval receipt safe digest chain", launchApprovalReceiptDigest, 24)
  ];

  return {
    ...goLiveHoldReleaseAuthorizationReceipt,
    receiptKind: "qa-handoff-locked-archive-certified-release-launch-approval-receipt",
    launchApprovalReceiptStatus: "issued",
    noExecutionGuardStatus: "retained",
    safeFilename: "provider-webhook-review-qa-handoff-certified-release-launch-approval-receipt.json",
    safeDigest: launchApprovalReceiptDigest,
    launchApprovalReceiptDigest,
    noExecutionGuardRows,
    inheritedGoLiveHoldReleaseAuthorizationSummary: {
      goLiveHoldReleaseAuthorizationStatus: "authorized",
      launchApprovalStatus: "ready",
      goLiveHoldReleaseAuthorizationReceiptCheckedCount: 1,
      goLiveHoldReleaseAuthorizationReceiptMutationCount: 0,
      goLiveHoldReleaseAuthorizationAuthorizedCount: 2,
      launchApprovalRowCount: 3,
      launchApprovalReadyCount: 3,
      externalCallsZero: true,
      safeDigest: goLiveHoldReleaseAuthorizationReceipt.safeDigest
    },
    counts: {
      ...goLiveHoldReleaseAuthorizationReceipt.counts,
      launchApprovalReceiptCheckedCount: 1,
      launchApprovalReceiptMutationCount: 0,
      launchApprovalReceiptIssuedCount: noExecutionGuardRows.length,
      noExecutionGuardRowCount: noExecutionGuardRows.length,
      noExecutionGuardRetainedCount: noExecutionGuardRows.length
    },
    externalCalls: 0
  };
}

function providerWebhookArchiveCertifiedReleaseNoExecutionLockReceiptResponse() {
  const launchApprovalReceipt = providerWebhookArchiveCertifiedReleaseLaunchApprovalReceiptResponse();
  const noExecutionLockReceiptDigest = "sha256:safeqahandoffcertifiedreleasenoexecutionlockreceipt";
  const noExecutionLockRows = [
    providerWebhookCertifiedReleaseNoExecutionLockReceiptRow("launch_approval_receipt_archived", "Launch approval receipt remains archived", launchApprovalReceipt.launchApprovalReceiptDigest, 1),
    providerWebhookCertifiedReleaseNoExecutionLockReceiptRow("no_execution_lock_retained", "No execution lock retained", noExecutionLockReceiptDigest, 0),
    providerWebhookCertifiedReleaseNoExecutionLockReceiptRow("no_mutation_lock_retained", "No launch approval lock mutation", launchApprovalReceipt.safeDigest, 0),
    providerWebhookCertifiedReleaseNoExecutionLockReceiptRow("provider_outbound_absent", "Provider outbound absent", launchApprovalReceipt.safeDigest, 0),
    providerWebhookCertifiedReleaseNoExecutionLockReceiptRow("external_notification_absent", "External notification absent", launchApprovalReceipt.safeDigest, 0),
    providerWebhookCertifiedReleaseNoExecutionLockReceiptRow("ai_call_absent", "AI call absent", launchApprovalReceipt.safeDigest, 0),
    providerWebhookCertifiedReleaseNoExecutionLockReceiptRow("tenant_scope_retained", "Tenant scope retained", launchApprovalReceipt.safeDigest, 1),
    providerWebhookCertifiedReleaseNoExecutionLockReceiptRow("digest_continuity_confirmed", "No-execution lock receipt safe digest continuity", noExecutionLockReceiptDigest, 25)
  ];

  return {
    ...launchApprovalReceipt,
    receiptKind: "qa-handoff-locked-archive-certified-release-launch-approval-no-execution-lock-receipt",
    noExecutionLockReceiptStatus: "issued",
    noExecutionLockStatus: "locked",
    launchApprovalArchiveStatus: "retained",
    tenantScopeStatus: "tenant_scoped",
    providerOutboundStatus: "absent",
    externalNotificationStatus: "absent",
    aiCallStatus: "absent",
    safeFilename: "provider-webhook-review-qa-handoff-certified-release-launch-approval-no-execution-lock-receipt.json",
    safeDigest: noExecutionLockReceiptDigest,
    noExecutionLockReceiptDigest,
    noExecutionLockRows,
    inheritedLaunchApprovalReceiptSummary: {
      launchApprovalReceiptStatus: "issued",
      noExecutionGuardStatus: "retained",
      launchApprovalStatus: "ready",
      launchApprovalReceiptCheckedCount: 1,
      launchApprovalReceiptMutationCount: 0,
      launchApprovalReceiptIssuedCount: launchApprovalReceipt.noExecutionGuardRows.length,
      noExecutionGuardRetainedCount: launchApprovalReceipt.noExecutionGuardRows.length,
      externalCallsZero: true,
      safeDigest: launchApprovalReceipt.safeDigest,
      launchApprovalReceiptDigest: launchApprovalReceipt.launchApprovalReceiptDigest
    },
    counts: {
      ...launchApprovalReceipt.counts,
      noExecutionLockReceiptCheckedCount: 1,
      noExecutionLockReceiptMutationCount: 0,
      noExecutionLockRowCount: noExecutionLockRows.length,
      noExecutionLockPassedCount: noExecutionLockRows.length,
      executionAttemptCount: 0,
      providerOutboundCallCount: 0,
      externalNotificationSendCount: 0,
      aiCallCount: 0,
      tenantScopeCheckedCount: 1,
      digestContinuityCheckedCount: 1,
      launchApprovalArchiveRetainedCount: 1
    },
    externalCalls: 0
  };
}

function providerWebhookArchiveCertifiedReleaseOperationsHandoffReadinessPacketResponse(): ProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacket {
  const noExecutionLockReceipt = providerWebhookArchiveCertifiedReleaseNoExecutionLockReceiptResponse();
  const operationsHandoffEvidencePacketDigest = "sha256:safeqahandoffcertifiedreleaseoperationshandoffreadinesspacket";
  const safeFilename = "provider-webhook-review-qa-handoff-certified-release-operations-handoff-readiness-no-execution-evidence-packet.json";
  const operationsHandoffPrerequisiteRows = [
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("no_execution_lock_receipt_issued", "No-execution lock receipt issued", noExecutionLockReceipt.noExecutionLockReceiptDigest, undefined, 1),
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("launch_approval_lock_retained", "Launch approval lock retained", noExecutionLockReceipt.launchApprovalReceiptDigest, undefined, 1),
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("tenant_scope_confirmed", "Tenant scope confirmed", noExecutionLockReceipt.safeDigest, undefined, 1),
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("digest_continuity_confirmed", "Operations handoff safe digest continuity", operationsHandoffEvidencePacketDigest, undefined, 2)
  ];
  const operationsHandoffBlockerRows = [
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("provider_outbound_absent", "Provider outbound absent", noExecutionLockReceipt.safeDigest, undefined, 0),
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("external_notification_absent", "External notification absent", noExecutionLockReceipt.safeDigest, undefined, 0),
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("ai_call_absent", "AI call absent", noExecutionLockReceipt.safeDigest, undefined, 0),
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("execution_attempts_zero", "Execution attempts zero", noExecutionLockReceipt.safeDigest, undefined, 0)
  ];
  const operationsHandoffEvidenceRows = [
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("operations_handoff_packet_ready", "Operations handoff evidence packet ready", operationsHandoffEvidencePacketDigest, safeFilename, 1),
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("no_execution_evidence_confirmed", "No-execution evidence confirmed", noExecutionLockReceipt.noExecutionLockReceiptDigest, noExecutionLockReceipt.safeFilename, noExecutionLockReceipt.counts.noExecutionLockPassedCount),
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("safe_digest_filename_recorded", "Safe digest and filename recorded", operationsHandoffEvidencePacketDigest, safeFilename, 2),
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("human_operations_handoff_ready", "Human operations handoff ready", operationsHandoffEvidencePacketDigest, safeFilename, 1)
  ];

  return {
    ...noExecutionLockReceipt,
    packetKind: "qa-handoff-locked-archive-certified-release-operations-handoff-readiness-no-execution-evidence-packet",
    operationsHandoffReadinessStatus: "ready_for_handoff",
    operationsHandoffEvidencePacketStatus: "issued",
    noExecutionEvidenceStatus: "confirmed",
    launchApprovalLockStatus: "locked",
    tenantScopeStatus: "tenant_scoped",
    digestContinuityStatus: "confirmed",
    providerOutboundStatus: "absent",
    externalNotificationStatus: "absent",
    aiCallStatus: "absent",
    safeFilename,
    safeDigest: operationsHandoffEvidencePacketDigest,
    operationsHandoffEvidencePacketDigest,
    operationsHandoffGeneratedAt: "2026-06-13T00:00:00.000Z",
    operationsHandoffPrerequisiteRows,
    operationsHandoffBlockerRows,
    operationsHandoffEvidenceRows,
    inheritedNoExecutionLockReceiptSummary: {
      noExecutionLockReceiptStatus: "issued",
      noExecutionLockStatus: "locked",
      launchApprovalArchiveStatus: "retained",
      tenantScopeStatus: "tenant_scoped",
      providerOutboundStatus: "absent",
      externalNotificationStatus: "absent",
      aiCallStatus: "absent",
      noExecutionLockReceiptMutationCount: 0,
      executionAttemptCount: 0,
      providerOutboundCallCount: 0,
      externalNotificationSendCount: 0,
      aiCallCount: 0,
      externalCallsZero: true,
      safeDigest: noExecutionLockReceipt.safeDigest,
      safeFilename: noExecutionLockReceipt.safeFilename,
      noExecutionLockReceiptDigest: noExecutionLockReceipt.noExecutionLockReceiptDigest
    },
    counts: {
      ...noExecutionLockReceipt.counts,
      operationsHandoffReadinessCheckedCount: 1,
      operationsHandoffMutationCount: 0,
      operationsHandoffPrerequisiteCount: operationsHandoffPrerequisiteRows.length,
      operationsHandoffPrerequisitePassedCount: operationsHandoffPrerequisiteRows.length,
      operationsHandoffBlockerCount: operationsHandoffBlockerRows.length,
      operationsHandoffBlockingCount: 0,
      operationsHandoffEvidenceRowCount: operationsHandoffEvidenceRows.length,
      operationsHandoffEvidenceReadyCount: operationsHandoffEvidenceRows.length
    },
    externalCalls: 0
  } as ProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacket;
}

function providerWebhookArchiveCertifiedReleaseOperationsHandoffAcceptanceReceiptResponse(): ProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceReceipt {
  const operationsHandoffReadinessPacket = providerWebhookArchiveCertifiedReleaseOperationsHandoffReadinessPacketResponse();
  const operationsHandoffAcceptanceReceiptDigest = "sha256:safeqahandoffcertifiedreleaseoperationshandoffacceptancereceipt";
  const safeFilename = "provider-webhook-review-qa-handoff-certified-release-operations-handoff-acceptance-receipt.json";
  const operationsHandoffAcceptanceRows = [
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("operations_handoff_packet_issued", "Operations handoff packet issued", operationsHandoffReadinessPacket.operationsHandoffEvidencePacketDigest, operationsHandoffReadinessPacket.safeFilename, 1),
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("operations_handoff_readiness_confirmed", "Operations handoff readiness confirmed", operationsHandoffReadinessPacket.operationsHandoffEvidencePacketDigest, operationsHandoffReadinessPacket.safeFilename, 1),
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("no_execution_evidence_confirmed", "No-execution evidence confirmed", operationsHandoffReadinessPacket.noExecutionLockReceiptDigest, operationsHandoffReadinessPacket.safeFilename, operationsHandoffReadinessPacket.counts.noExecutionLockPassedCount),
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("operations_handoff_acceptance_receipt_issued", "Operations handoff acceptance receipt issued", operationsHandoffAcceptanceReceiptDigest, safeFilename, 1)
  ];
  const operationsCustodyRows = [
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("operations_custody_accepted", "Operations custody accepted", operationsHandoffAcceptanceReceiptDigest, safeFilename, 1),
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("tenant_scope_confirmed", "Tenant scope confirmed", operationsHandoffReadinessPacket.safeDigest, undefined, 1),
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("digest_continuity_confirmed", "Operations handoff acceptance digest continuity", operationsHandoffAcceptanceReceiptDigest, safeFilename, 3),
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("provider_outbound_absent", "Provider outbound absent", operationsHandoffReadinessPacket.safeDigest, undefined, 0),
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("external_notification_absent", "External notification absent", operationsHandoffReadinessPacket.safeDigest, undefined, 0),
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("ai_call_absent", "AI call absent", operationsHandoffReadinessPacket.safeDigest, undefined, 0),
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("execution_attempts_zero", "Execution attempts zero", operationsHandoffReadinessPacket.safeDigest, undefined, 0)
  ];

  return {
    ...operationsHandoffReadinessPacket,
    receiptKind: "qa-handoff-locked-archive-certified-release-operations-handoff-acceptance-receipt",
    operationsHandoffAcceptanceStatus: "accepted",
    operationsCustodyStatus: "accepted",
    safeFilename,
    safeDigest: operationsHandoffAcceptanceReceiptDigest,
    operationsHandoffAcceptanceReceiptDigest,
    operationsHandoffAcceptedAt: "2026-06-14T00:00:00.000Z",
    operationsHandoffAcceptanceRows,
    operationsCustodyRows,
    inheritedOperationsHandoffReadinessPacketSummary: {
      operationsHandoffReadinessStatus: "ready_for_handoff",
      operationsHandoffEvidencePacketStatus: "issued",
      noExecutionEvidenceStatus: "confirmed",
      launchApprovalLockStatus: "locked",
      tenantScopeStatus: "tenant_scoped",
      digestContinuityStatus: "confirmed",
      providerOutboundStatus: "absent",
      externalNotificationStatus: "absent",
      aiCallStatus: "absent",
      operationsHandoffMutationCount: 0,
      executionAttemptCount: 0,
      providerOutboundCallCount: 0,
      externalNotificationSendCount: 0,
      aiCallCount: 0,
      externalCallsZero: true,
      safeDigest: operationsHandoffReadinessPacket.safeDigest,
      safeFilename: operationsHandoffReadinessPacket.safeFilename,
      operationsHandoffEvidencePacketDigest: operationsHandoffReadinessPacket.operationsHandoffEvidencePacketDigest
    },
    counts: {
      ...operationsHandoffReadinessPacket.counts,
      operationsHandoffAcceptanceCheckedCount: 1,
      operationsHandoffAcceptanceMutationCount: 0,
      operationsHandoffAcceptanceRowCount: operationsHandoffAcceptanceRows.length,
      operationsHandoffAcceptanceAcceptedCount: operationsHandoffAcceptanceRows.length,
      operationsCustodyRowCount: operationsCustodyRows.length,
      operationsCustodyAcceptedCount: operationsCustodyRows.length
    },
    externalCalls: 0
  };
}

function providerWebhookArchiveCertifiedReleaseOperationsCustodyMonitoringReadinessLedgerResponse(): ProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedger {
  const operationsHandoffAcceptanceReceipt = providerWebhookArchiveCertifiedReleaseOperationsHandoffAcceptanceReceiptResponse();
  const operationsCustodyMonitoringLedgerDigest = "sha256:safeqahandoffcertifiedreleaseoperationscustodymonitoringreadinessledger";
  const safeFilename = "provider-webhook-review-qa-handoff-certified-release-operations-custody-monitoring-readiness-ledger.json";
  const operationsCustodyMonitoringRows = [
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("operations_handoff_acceptance_receipt_confirmed", "Operations handoff acceptance receipt confirmed", operationsHandoffAcceptanceReceipt.operationsHandoffAcceptanceReceiptDigest, operationsHandoffAcceptanceReceipt.safeFilename, 1),
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("operations_custody_accepted", "Operations custody accepted", operationsHandoffAcceptanceReceipt.operationsHandoffAcceptanceReceiptDigest, operationsHandoffAcceptanceReceipt.safeFilename, operationsHandoffAcceptanceReceipt.counts.operationsCustodyAcceptedCount),
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("operations_custody_monitoring_ready", "Operations custody monitoring ready", operationsCustodyMonitoringLedgerDigest, safeFilename, 1),
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("operations_custody_monitoring_ledger_issued", "Operations custody monitoring readiness ledger issued", operationsCustodyMonitoringLedgerDigest, safeFilename, 1)
  ];
  const noExecutionMonitoringRows = [
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("no_execution_monitoring_active", "No-execution monitoring active", operationsCustodyMonitoringLedgerDigest, safeFilename, 0),
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("no_execution_evidence_confirmed", "No-execution evidence confirmed", operationsHandoffAcceptanceReceipt.noExecutionLockReceiptDigest, operationsHandoffAcceptanceReceipt.safeFilename, 0),
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("launch_approval_lock_retained", "Launch approval lock retained", operationsHandoffAcceptanceReceipt.launchApprovalReceiptDigest, operationsHandoffAcceptanceReceipt.safeFilename, 1),
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("tenant_scope_confirmed", "Tenant scope confirmed", operationsHandoffAcceptanceReceipt.safeDigest, operationsHandoffAcceptanceReceipt.safeFilename, 1),
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("digest_continuity_confirmed", "Operations custody monitoring digest continuity", operationsCustodyMonitoringLedgerDigest, safeFilename, 4),
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("provider_outbound_absent", "Provider outbound absent", operationsHandoffAcceptanceReceipt.safeDigest, operationsHandoffAcceptanceReceipt.safeFilename, 0),
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("external_notification_absent", "External notification absent", operationsHandoffAcceptanceReceipt.safeDigest, operationsHandoffAcceptanceReceipt.safeFilename, 0),
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("ai_call_absent", "AI call absent", operationsHandoffAcceptanceReceipt.safeDigest, operationsHandoffAcceptanceReceipt.safeFilename, 0),
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("execution_attempts_zero", "Execution attempts zero", operationsHandoffAcceptanceReceipt.safeDigest, operationsHandoffAcceptanceReceipt.safeFilename, 0),
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("monitoring_readiness_confirmed", "Monitoring readiness confirmed", operationsCustodyMonitoringLedgerDigest, safeFilename, 1)
  ];

  return {
    ...operationsHandoffAcceptanceReceipt,
    ledgerKind: "qa-handoff-locked-archive-certified-release-operations-custody-monitoring-readiness-ledger",
    operationsCustodyMonitoringStatus: "ready",
    monitoringReadinessStatus: "ready",
    noExecutionMonitoringStatus: "active",
    safeFilename,
    safeDigest: operationsCustodyMonitoringLedgerDigest,
    operationsCustodyMonitoringLedgerDigest,
    operationsCustodyMonitoringLedgerGeneratedAt: "2026-06-14T00:00:00.000Z",
    operationsCustodyMonitoringRows,
    noExecutionMonitoringRows,
    inheritedOperationsHandoffAcceptanceReceiptSummary: {
      operationsHandoffAcceptanceStatus: "accepted",
      operationsCustodyStatus: "accepted",
      noExecutionEvidenceStatus: "confirmed",
      launchApprovalLockStatus: "locked",
      tenantScopeStatus: "tenant_scoped",
      digestContinuityStatus: "confirmed",
      providerOutboundStatus: "absent",
      externalNotificationStatus: "absent",
      aiCallStatus: "absent",
      operationsHandoffMutationCount: 0,
      operationsHandoffAcceptanceMutationCount: 0,
      executionAttemptCount: 0,
      providerOutboundCallCount: 0,
      externalNotificationSendCount: 0,
      aiCallCount: 0,
      externalCallsZero: true,
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
      operationsCustodyMonitoringReadyCount: operationsCustodyMonitoringRows.length,
      noExecutionMonitoringRowCount: noExecutionMonitoringRows.length,
      noExecutionMonitoringActiveCount: noExecutionMonitoringRows.length
    },
    externalCalls: 0
  };
}

function providerWebhookArchiveCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceiptResponse(): ProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt {
  const operationsCustodyMonitoringReadinessLedger = providerWebhookArchiveCertifiedReleaseOperationsCustodyMonitoringReadinessLedgerResponse();
  const operationsCustodyMonitoringCloseoutSealReceiptDigest = "sha256:safeqahandoffcertifiedreleaseoperationscustodymonitoringcloseoutsealreceipt";
  const safeFilename = "provider-webhook-review-qa-handoff-certified-release-operations-custody-monitoring-closeout-seal-receipt.json";
  const operationsCustodyMonitoringCloseoutRows = [
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("operations_custody_monitoring_ledger_reviewed", "Operations custody monitoring ledger reviewed", operationsCustodyMonitoringReadinessLedger.operationsCustodyMonitoringLedgerDigest, operationsCustodyMonitoringReadinessLedger.safeFilename, 1),
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("operations_custody_monitoring_closeout_sealed", "Operations custody monitoring closeout sealed", operationsCustodyMonitoringCloseoutSealReceiptDigest, safeFilename, 1),
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("closeout_seal_receipt_issued", "Closeout seal receipt issued", operationsCustodyMonitoringCloseoutSealReceiptDigest, safeFilename, 1),
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("no_execution_monitoring_active", "No-execution monitoring active", operationsCustodyMonitoringReadinessLedger.operationsCustodyMonitoringLedgerDigest, operationsCustodyMonitoringReadinessLedger.safeFilename, 0),
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("digest_continuity_confirmed", "Operations custody monitoring closeout digest continuity", operationsCustodyMonitoringCloseoutSealReceiptDigest, safeFilename, 5),
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("provider_outbound_absent", "Provider outbound absent", operationsCustodyMonitoringReadinessLedger.safeDigest, operationsCustodyMonitoringReadinessLedger.safeFilename, 0),
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("external_notification_absent", "External notification absent", operationsCustodyMonitoringReadinessLedger.safeDigest, operationsCustodyMonitoringReadinessLedger.safeFilename, 0),
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("ai_call_absent", "AI call absent", operationsCustodyMonitoringReadinessLedger.safeDigest, operationsCustodyMonitoringReadinessLedger.safeFilename, 0),
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("execution_attempts_zero", "Execution attempts zero", operationsCustodyMonitoringReadinessLedger.safeDigest, operationsCustodyMonitoringReadinessLedger.safeFilename, 0)
  ];

  return {
    ...operationsCustodyMonitoringReadinessLedger,
    receiptKind: "qa-handoff-locked-archive-certified-release-operations-custody-monitoring-closeout-seal-receipt",
    operationsCustodyMonitoringCloseoutStatus: "sealed",
    closeoutSealStatus: "sealed",
    digestContinuityStatus: "confirmed",
    safeFilename,
    safeDigest: operationsCustodyMonitoringCloseoutSealReceiptDigest,
    operationsCustodyMonitoringCloseoutSealReceiptDigest,
    operationsCustodyMonitoringCloseoutSealedAt: "2026-06-14T00:00:00.000Z",
    operationsCustodyMonitoringCloseoutRows,
    inheritedOperationsCustodyMonitoringReadinessLedgerSummary: {
      operationsCustodyMonitoringStatus: "ready",
      operationsHandoffAcceptanceStatus: "accepted",
      operationsCustodyStatus: "accepted",
      noExecutionEvidenceStatus: "confirmed",
      noExecutionMonitoringStatus: "active",
      launchApprovalLockStatus: "locked",
      tenantScopeStatus: "tenant_scoped",
      digestContinuityStatus: "confirmed",
      monitoringReadinessStatus: "ready",
      providerOutboundStatus: "absent",
      externalNotificationStatus: "absent",
      aiCallStatus: "absent",
      operationsHandoffMutationCount: 0,
      operationsHandoffAcceptanceMutationCount: 0,
      operationsCustodyMonitoringMutationCount: 0,
      executionAttemptCount: 0,
      providerOutboundCallCount: 0,
      externalNotificationSendCount: 0,
      aiCallCount: 0,
      externalCallsZero: true,
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
      operationsCustodyMonitoringCloseoutSealedCount: operationsCustodyMonitoringCloseoutRows.length
    },
    externalCalls: 0
  };
}

function providerWebhookArchiveCertifiedReleaseFinalNoExecutionEvidenceRollupResponse(): ProviderWebhookReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollup {
  const operationsCustodyMonitoringCloseoutSealReceipt = providerWebhookArchiveCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceiptResponse();
  const finalNoExecutionEvidenceRollupDigest = "sha256:safeqahandoffcertifiedreleasefinalnoexecutionevidencerollup";
  const safeFilename = "provider-webhook-review-qa-handoff-certified-release-final-no-execution-evidence-rollup.json";
  const finalNoExecutionEvidenceRows = [
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("sprint_103_launch_approval_receipt_retained", "Sprint 103 launch approval receipt retained", operationsCustodyMonitoringCloseoutSealReceipt.launchApprovalReceiptDigest, operationsCustodyMonitoringCloseoutSealReceipt.safeFilename, 1),
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("sprint_104_no_execution_lock_receipt_retained", "Sprint 104 no-execution lock receipt retained", operationsCustodyMonitoringCloseoutSealReceipt.noExecutionLockReceiptDigest, operationsCustodyMonitoringCloseoutSealReceipt.safeFilename, 1),
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("sprint_105_operations_handoff_packet_retained", "Sprint 105 operations handoff packet retained", operationsCustodyMonitoringCloseoutSealReceipt.operationsHandoffEvidencePacketDigest, operationsCustodyMonitoringCloseoutSealReceipt.safeFilename, 1),
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("sprint_106_operations_handoff_acceptance_retained", "Sprint 106 operations handoff acceptance retained", operationsCustodyMonitoringCloseoutSealReceipt.operationsHandoffAcceptanceReceiptDigest, operationsCustodyMonitoringCloseoutSealReceipt.safeFilename, 1),
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("sprint_107_operations_custody_monitoring_retained", "Sprint 107 operations custody monitoring retained", operationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyMonitoringLedgerDigest, operationsCustodyMonitoringCloseoutSealReceipt.safeFilename, 1),
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("sprint_108_closeout_seal_receipt_retained", "Sprint 108 closeout seal receipt retained", operationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyMonitoringCloseoutSealReceiptDigest, operationsCustodyMonitoringCloseoutSealReceipt.safeFilename, 1),
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("final_no_execution_evidence_rollup_issued", "Final no-execution evidence rollup issued", finalNoExecutionEvidenceRollupDigest, safeFilename, 1),
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("final_archive_custody_sealed", "Final archive custody sealed", finalNoExecutionEvidenceRollupDigest, safeFilename, 1),
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("no_execution_evidence_confirmed", "No-execution evidence confirmed", operationsCustodyMonitoringCloseoutSealReceipt.noExecutionLockReceiptDigest, operationsCustodyMonitoringCloseoutSealReceipt.safeFilename, 0),
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("no_execution_monitoring_active", "No-execution monitoring active", operationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyMonitoringLedgerDigest, operationsCustodyMonitoringCloseoutSealReceipt.safeFilename, 0),
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("launch_approval_lock_retained", "Launch approval lock retained", operationsCustodyMonitoringCloseoutSealReceipt.launchApprovalReceiptDigest, operationsCustodyMonitoringCloseoutSealReceipt.safeFilename, 1),
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("tenant_scope_confirmed", "Tenant scope confirmed", operationsCustodyMonitoringCloseoutSealReceipt.safeDigest, operationsCustodyMonitoringCloseoutSealReceipt.safeFilename, 1),
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("digest_continuity_confirmed", "Final no-execution evidence rollup digest continuity", finalNoExecutionEvidenceRollupDigest, safeFilename, 6),
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("provider_outbound_absent", "Provider outbound absent", operationsCustodyMonitoringCloseoutSealReceipt.safeDigest, operationsCustodyMonitoringCloseoutSealReceipt.safeFilename, 0),
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("external_notification_absent", "External notification absent", operationsCustodyMonitoringCloseoutSealReceipt.safeDigest, operationsCustodyMonitoringCloseoutSealReceipt.safeFilename, 0),
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("ai_call_absent", "AI call absent", operationsCustodyMonitoringCloseoutSealReceipt.safeDigest, operationsCustodyMonitoringCloseoutSealReceipt.safeFilename, 0),
    providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow("execution_attempts_zero", "Execution attempts zero", operationsCustodyMonitoringCloseoutSealReceipt.safeDigest, operationsCustodyMonitoringCloseoutSealReceipt.safeFilename, 0)
  ];

  return {
    ...operationsCustodyMonitoringCloseoutSealReceipt,
    rollupKind: "qa-handoff-locked-archive-certified-release-final-no-execution-evidence-rollup",
    finalNoExecutionEvidenceRollupStatus: "issued",
    finalArchiveCustodyStatus: "sealed",
    digestContinuityStatus: "confirmed",
    safeFilename,
    safeDigest: finalNoExecutionEvidenceRollupDigest,
    finalNoExecutionEvidenceRollupDigest,
    finalNoExecutionEvidenceRollupIssuedAt: "2026-06-14T00:00:00.000Z",
    finalNoExecutionEvidenceRows,
    inheritedOperationsCustodyMonitoringCloseoutSealReceiptSummary: {
      operationsCustodyMonitoringCloseoutStatus: "sealed",
      closeoutSealStatus: "sealed",
      operationsCustodyMonitoringStatus: "ready",
      operationsHandoffAcceptanceStatus: "accepted",
      operationsCustodyStatus: "accepted",
      noExecutionEvidenceStatus: "confirmed",
      noExecutionMonitoringStatus: "active",
      launchApprovalLockStatus: "locked",
      tenantScopeStatus: "tenant_scoped",
      digestContinuityStatus: "confirmed",
      monitoringReadinessStatus: "ready",
      providerOutboundStatus: "absent",
      externalNotificationStatus: "absent",
      aiCallStatus: "absent",
      operationsHandoffMutationCount: 0,
      operationsHandoffAcceptanceMutationCount: 0,
      operationsCustodyMonitoringMutationCount: 0,
      operationsCustodyMonitoringCloseoutSealMutationCount: 0,
      executionAttemptCount: 0,
      providerOutboundCallCount: 0,
      externalNotificationSendCount: 0,
      aiCallCount: 0,
      externalCallsZero: true,
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
      finalNoExecutionEvidenceRollupIssuedCount: finalNoExecutionEvidenceRows.length,
      finalArchiveCustodySealedCount: 1
    },
    externalCalls: 0
  };
}

function providerWebhookArchiveCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceiptResponse(): ProviderWebhookReviewQaHandoffCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt {
  const finalNoExecutionEvidenceRollup = providerWebhookArchiveCertifiedReleaseFinalNoExecutionEvidenceRollupResponse();
  const safeDigest = "sha256:safeqahandoffcertifiedreleasefinalevidenceindexregressionguardrailreceipt";
  const safeFilename = "provider-webhook-review-qa-handoff-certified-release-final-evidence-index-regression-guardrail-receipt.json";
  const finalEvidenceIndexRows: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt["finalEvidenceIndexRows"] = [
    { sprintNumber: 103, artifactLabel: "Sprint 103 launch approval receipt", artifactStatus: "issued", safeDigest: finalNoExecutionEvidenceRollup.launchApprovalReceiptDigest, safeFilename: finalNoExecutionEvidenceRollup.safeFilename, checkedAt: "2026-06-14T00:00:00.000Z", externalCalls: 0, executionAttemptCount: 0, providerOutboundCallCount: 0, externalNotificationSendCount: 0, aiCallCount: 0, mutationCount: 0 },
    { sprintNumber: 104, artifactLabel: "Sprint 104 no-execution lock receipt", artifactStatus: "locked", safeDigest: finalNoExecutionEvidenceRollup.noExecutionLockReceiptDigest, safeFilename: finalNoExecutionEvidenceRollup.safeFilename, checkedAt: "2026-06-14T00:00:00.000Z", externalCalls: 0, executionAttemptCount: 0, providerOutboundCallCount: 0, externalNotificationSendCount: 0, aiCallCount: 0, mutationCount: 0 },
    { sprintNumber: 105, artifactLabel: "Sprint 105 operations handoff readiness packet", artifactStatus: "confirmed", safeDigest: finalNoExecutionEvidenceRollup.operationsHandoffEvidencePacketDigest, safeFilename: finalNoExecutionEvidenceRollup.safeFilename, checkedAt: "2026-06-14T00:00:00.000Z", externalCalls: 0, executionAttemptCount: 0, providerOutboundCallCount: 0, externalNotificationSendCount: 0, aiCallCount: 0, mutationCount: 0 },
    { sprintNumber: 106, artifactLabel: "Sprint 106 operations handoff acceptance receipt", artifactStatus: "accepted", safeDigest: finalNoExecutionEvidenceRollup.operationsHandoffAcceptanceReceiptDigest, safeFilename: finalNoExecutionEvidenceRollup.safeFilename, checkedAt: "2026-06-14T00:00:00.000Z", externalCalls: 0, executionAttemptCount: 0, providerOutboundCallCount: 0, externalNotificationSendCount: 0, aiCallCount: 0, mutationCount: 0 },
    { sprintNumber: 107, artifactLabel: "Sprint 107 operations custody monitoring readiness ledger", artifactStatus: "ready", safeDigest: finalNoExecutionEvidenceRollup.operationsCustodyMonitoringLedgerDigest, safeFilename: finalNoExecutionEvidenceRollup.safeFilename, checkedAt: "2026-06-14T00:00:00.000Z", externalCalls: 0, executionAttemptCount: 0, providerOutboundCallCount: 0, externalNotificationSendCount: 0, aiCallCount: 0, mutationCount: 0 },
    { sprintNumber: 108, artifactLabel: "Sprint 108 operations custody monitoring closeout seal receipt", artifactStatus: "sealed", safeDigest: finalNoExecutionEvidenceRollup.operationsCustodyMonitoringCloseoutSealReceiptDigest, safeFilename: finalNoExecutionEvidenceRollup.safeFilename, checkedAt: "2026-06-14T00:00:00.000Z", externalCalls: 0, executionAttemptCount: 0, providerOutboundCallCount: 0, externalNotificationSendCount: 0, aiCallCount: 0, mutationCount: 0 },
    { sprintNumber: 109, artifactLabel: "Sprint 109 final no-execution evidence rollup", artifactStatus: "issued", safeDigest: finalNoExecutionEvidenceRollup.finalNoExecutionEvidenceRollupDigest, safeFilename: finalNoExecutionEvidenceRollup.safeFilename, checkedAt: "2026-06-14T00:00:00.000Z", externalCalls: 0, executionAttemptCount: 0, providerOutboundCallCount: 0, externalNotificationSendCount: 0, aiCallCount: 0, mutationCount: 0 },
    { sprintNumber: 110, artifactLabel: "Sprint 110 final evidence index regression guardrail receipt", artifactStatus: "passed", safeDigest, safeFilename, generatedAt: "2026-06-14T00:00:00.000Z", externalCalls: 0, executionAttemptCount: 0, providerOutboundCallCount: 0, externalNotificationSendCount: 0, aiCallCount: 0, mutationCount: 0 }
  ];

  return {
    receiptKind: "qa-handoff-locked-archive-certified-release-final-evidence-index-regression-guardrail-receipt",
    finalEvidenceIndexStatus: "issued",
    regressionGuardrailReceiptStatus: "issued",
    regressionGuardrailStatus: "passed",
    finalNoExecutionEvidenceRollupStatus: "issued",
    finalArchiveCustodyStatus: "sealed",
    operationsCustodyMonitoringCloseoutStatus: "sealed",
    operationsCustodyMonitoringStatus: "ready",
    operationsHandoffAcceptanceStatus: "accepted",
    operationsCustodyStatus: "accepted",
    noExecutionEvidenceStatus: "confirmed",
    noExecutionMonitoringStatus: "active",
    launchApprovalLockStatus: "locked",
    tenantScopeStatus: "tenant_scoped",
    digestContinuityStatus: "confirmed",
    closeoutSealStatus: "sealed",
    providerOutboundStatus: "absent",
    externalNotificationStatus: "absent",
    aiCallStatus: "absent",
    safeFilename,
    safeDigest,
    finalEvidenceIndexDigest: safeDigest,
    regressionGuardrailReceiptDigest: safeDigest,
    finalNoExecutionEvidenceRollupDigest: finalNoExecutionEvidenceRollup.finalNoExecutionEvidenceRollupDigest,
    operationsCustodyMonitoringCloseoutSealReceiptDigest: finalNoExecutionEvidenceRollup.operationsCustodyMonitoringCloseoutSealReceiptDigest,
    operationsCustodyMonitoringLedgerDigest: finalNoExecutionEvidenceRollup.operationsCustodyMonitoringLedgerDigest,
    operationsHandoffAcceptanceReceiptDigest: finalNoExecutionEvidenceRollup.operationsHandoffAcceptanceReceiptDigest,
    operationsHandoffEvidencePacketDigest: finalNoExecutionEvidenceRollup.operationsHandoffEvidencePacketDigest,
    noExecutionLockReceiptDigest: finalNoExecutionEvidenceRollup.noExecutionLockReceiptDigest,
    launchApprovalReceiptDigest: finalNoExecutionEvidenceRollup.launchApprovalReceiptDigest,
    generatedAt: "2026-06-14T00:00:00.000Z",
    checkedAt: "2026-06-14T00:00:00.000Z",
    finalEvidenceIndexRows,
    inheritedFinalNoExecutionEvidenceRollupSummary: {
      finalNoExecutionEvidenceRollupStatus: "issued",
      finalArchiveCustodyStatus: "sealed",
      finalNoExecutionEvidenceRollupDigest: finalNoExecutionEvidenceRollup.finalNoExecutionEvidenceRollupDigest,
      safeDigest: finalNoExecutionEvidenceRollup.safeDigest,
      safeFilename: finalNoExecutionEvidenceRollup.safeFilename,
      finalNoExecutionEvidenceRollupMutationCount: 0,
      executionAttemptCount: 0,
      providerOutboundCallCount: 0,
      externalNotificationSendCount: 0,
      aiCallCount: 0,
      externalCallsZero: true
    },
    counts: {
      finalEvidenceIndexCheckedCount: 1,
      finalEvidenceIndexMutationCount: 0,
      finalEvidenceIndexRowCount: finalEvidenceIndexRows.length,
      finalEvidenceIndexIssuedCount: finalEvidenceIndexRows.length,
      regressionGuardrailCheckedCount: 1,
      regressionGuardrailPassedCount: 1,
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

function providerWebhookArchiveCertifiedReleaseFinalArchiveSealOperationalClosureReceiptResponse(): ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealOperationalClosureReceipt {
  const finalEvidenceIndexRegressionGuardrailReceipt = providerWebhookArchiveCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceiptResponse();
  const safeDigest = "sha256:safeqahandoffcertifiedreleasefinalarchivesealoperationalclosurereceipt";
  const safeFilename = "provider-webhook-review-qa-handoff-certified-release-final-archive-seal-operational-closure-receipt.json";
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
    { sprintNumber: 111, artifactLabel: "Sprint 111 final archive seal operational closure receipt", artifactStatus: "closed", safeDigest, safeFilename, generatedAt: "2026-06-14T00:00:00.000Z", ...zeroCounts }
  ];

  return {
    receiptKind: "qa-handoff-locked-archive-certified-release-final-archive-seal-operational-closure-receipt",
    finalOperationalClosureReceiptStatus: "issued",
    finalArchiveSealStatus: "sealed",
    releaseClosureStatus: "closed",
    finalEvidenceIndexStatus: "issued",
    regressionGuardrailReceiptStatus: "issued",
    regressionGuardrailStatus: "passed",
    finalNoExecutionEvidenceRollupStatus: "issued",
    finalArchiveCustodyStatus: "sealed",
    operationsCustodyMonitoringCloseoutStatus: "sealed",
    closeoutSealStatus: "sealed",
    noExecutionEvidenceStatus: "confirmed",
    noExecutionMonitoringStatus: "active",
    tenantScopeStatus: "tenant_scoped",
    digestContinuityStatus: "confirmed",
    providerOutboundStatus: "absent",
    externalNotificationStatus: "absent",
    aiCallStatus: "absent",
    safeFilename,
    safeDigest,
    finalOperationalClosureReceiptDigest: safeDigest,
    finalArchiveSealDigest: safeDigest,
    finalEvidenceIndexDigest: finalEvidenceIndexRegressionGuardrailReceipt.finalEvidenceIndexDigest,
    regressionGuardrailReceiptDigest: finalEvidenceIndexRegressionGuardrailReceipt.regressionGuardrailReceiptDigest,
    finalNoExecutionEvidenceRollupDigest: finalEvidenceIndexRegressionGuardrailReceipt.finalNoExecutionEvidenceRollupDigest,
    generatedAt: "2026-06-14T00:00:00.000Z",
    checkedAt: "2026-06-14T00:00:00.000Z",
    finalArchiveSealOperationalClosureRows,
    inheritedFinalEvidenceIndexRegressionGuardrailReceiptSummary: {
      finalEvidenceIndexStatus: "issued",
      regressionGuardrailReceiptStatus: "issued",
      regressionGuardrailStatus: "passed",
      finalEvidenceIndexDigest: finalEvidenceIndexRegressionGuardrailReceipt.finalEvidenceIndexDigest,
      regressionGuardrailReceiptDigest: finalEvidenceIndexRegressionGuardrailReceipt.regressionGuardrailReceiptDigest,
      safeDigest: finalEvidenceIndexRegressionGuardrailReceipt.safeDigest,
      safeFilename: finalEvidenceIndexRegressionGuardrailReceipt.safeFilename,
      finalEvidenceIndexMutationCount: 0,
      regressionGuardrailMutationCount: 0,
      finalNoExecutionEvidenceRollupMutationCount: 0,
      executionAttemptCount: 0,
      providerOutboundCallCount: 0,
      externalNotificationSendCount: 0,
      aiCallCount: 0,
      externalCallsZero: true
    },
    counts: {
      finalOperationalClosureReceiptCheckedCount: 1,
      finalOperationalClosureReceiptMutationCount: 0,
      finalArchiveSealCheckedCount: 1,
      finalArchiveSealMutationCount: 0,
      releaseClosureCheckedCount: 1,
      finalArchiveSealOperationalClosureRowCount: finalArchiveSealOperationalClosureRows.length,
      finalArchiveSealOperationalClosureSealedCount: finalArchiveSealOperationalClosureRows.length,
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

function providerWebhookArchiveCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceiptResponse(): ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceipt {
  const finalArchiveSealOperationalClosureReceipt = providerWebhookArchiveCertifiedReleaseFinalArchiveSealOperationalClosureReceiptResponse();
  const safeDigest = "sha256:safeqahandoffcertifiedreleasefinalarchivesealpostclosurepreservationverificationreceipt";
  const safeFilename = "provider-webhook-certified-release-post-closure-preservation-verification-receipt.json";
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
    { sprintNumber: 112, artifactLabel: "Sprint 112 post-closure preservation verification receipt", artifactStatus: "verified", safeDigest, safeFilename, generatedAt: "2026-06-15T00:00:00.000Z", checkedAt: "2026-06-15T00:00:00.000Z", ...zeroCounts }
  ];

  return {
    receiptKind: "qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-verification-receipt",
    postClosurePreservationVerificationStatus: "verified",
    finalArchiveSealPostClosurePreservationStatus: "preserved",
    finalOperationalClosureReceiptStatus: "issued",
    finalArchiveSealStatus: "sealed",
    releaseClosureStatus: "closed",
    finalEvidenceIndexStatus: "issued",
    regressionGuardrailReceiptStatus: "issued",
    regressionGuardrailStatus: "passed",
    finalNoExecutionEvidenceRollupStatus: "issued",
    finalArchiveCustodyStatus: "sealed",
    operationsCustodyMonitoringCloseoutStatus: "sealed",
    closeoutSealStatus: "sealed",
    noExecutionEvidenceStatus: "confirmed",
    noExecutionMonitoringStatus: "active",
    tenantScopeStatus: "tenant_scoped",
    digestContinuityStatus: "confirmed",
    providerOutboundStatus: "absent",
    externalNotificationStatus: "absent",
    aiCallStatus: "absent",
    safeFilename,
    safeDigest,
    postClosurePreservationVerificationDigest: safeDigest,
    finalArchiveSealOperationalClosureReceiptDigest: finalArchiveSealOperationalClosureReceipt.safeDigest,
    finalArchiveSealDigest: finalArchiveSealOperationalClosureReceipt.finalArchiveSealDigest,
    finalEvidenceIndexDigest: finalArchiveSealOperationalClosureReceipt.finalEvidenceIndexDigest,
    regressionGuardrailReceiptDigest: finalArchiveSealOperationalClosureReceipt.regressionGuardrailReceiptDigest,
    finalNoExecutionEvidenceRollupDigest: finalArchiveSealOperationalClosureReceipt.finalNoExecutionEvidenceRollupDigest,
    generatedAt: "2026-06-15T00:00:00.000Z",
    checkedAt: "2026-06-15T00:00:00.000Z",
    postClosurePreservationVerificationRows,
    inheritedFinalArchiveSealOperationalClosureReceiptSummary: {
      finalOperationalClosureReceiptStatus: "issued",
      finalArchiveSealStatus: "sealed",
      releaseClosureStatus: "closed",
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
      externalCallsZero: true
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
      postClosurePreservationVerificationVerifiedCount: postClosurePreservationVerificationRows.length,
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

function providerWebhookArchiveCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceiptResponse(): ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceipt {
  const postClosurePreservationVerificationReceipt = providerWebhookArchiveCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceiptResponse();
  const safeDigest = "sha256:safeqahandoffcertifiedreleasefinalarchivesealpostclosurepreservationcontinuityledgerreceipt";
  const safeFilename = "provider-webhook-certified-release-post-closure-preservation-continuity-ledger-receipt.json";
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
    { sprintNumber: 113, artifactLabel: "Sprint 113 post-closure preservation continuity ledger receipt", artifactStatus: "continuous", safeDigest, safeFilename, generatedAt: "2026-06-15T00:00:00.000Z", checkedAt: "2026-06-15T00:00:00.000Z", ...zeroCounts }
  ];

  return {
    receiptKind: "qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-continuity-ledger-receipt",
    postClosurePreservationContinuityLedgerStatus: "continuous",
    postClosurePreservationVerificationStatus: "verified",
    finalArchiveSealPostClosurePreservationStatus: "preserved",
    finalOperationalClosureReceiptStatus: "issued",
    finalArchiveSealStatus: "sealed",
    releaseClosureStatus: "closed",
    finalEvidenceIndexStatus: "issued",
    regressionGuardrailReceiptStatus: "issued",
    regressionGuardrailStatus: "passed",
    finalNoExecutionEvidenceRollupStatus: "issued",
    finalArchiveCustodyStatus: "sealed",
    operationsCustodyMonitoringCloseoutStatus: "sealed",
    closeoutSealStatus: "sealed",
    noExecutionEvidenceStatus: "confirmed",
    noExecutionMonitoringStatus: "active",
    tenantScopeStatus: "tenant_scoped",
    digestContinuityStatus: "confirmed",
    providerOutboundStatus: "absent",
    externalNotificationStatus: "absent",
    aiCallStatus: "absent",
    safeFilename,
    safeDigest,
    postClosurePreservationContinuityLedgerDigest: safeDigest,
    postClosurePreservationVerificationDigest: postClosurePreservationVerificationReceipt.safeDigest,
    finalArchiveSealOperationalClosureReceiptDigest: postClosurePreservationVerificationReceipt.finalArchiveSealOperationalClosureReceiptDigest,
    finalArchiveSealDigest: postClosurePreservationVerificationReceipt.finalArchiveSealDigest,
    finalEvidenceIndexDigest: postClosurePreservationVerificationReceipt.finalEvidenceIndexDigest,
    regressionGuardrailReceiptDigest: postClosurePreservationVerificationReceipt.regressionGuardrailReceiptDigest,
    finalNoExecutionEvidenceRollupDigest: postClosurePreservationVerificationReceipt.finalNoExecutionEvidenceRollupDigest,
    generatedAt: "2026-06-15T00:00:00.000Z",
    checkedAt: "2026-06-15T00:00:00.000Z",
    preservationContinuityLedgerRows,
    inheritedPostClosurePreservationVerificationReceiptSummary: {
      postClosurePreservationVerificationStatus: "verified",
      finalArchiveSealPostClosurePreservationStatus: "preserved",
      finalArchiveSealStatus: "sealed",
      releaseClosureStatus: "closed",
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
      externalCallsZero: true
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
      preservationContinuityLedgerContinuousCount: preservationContinuityLedgerRows.length,
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

function providerWebhookArchiveCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceiptResponse(): ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceipt {
  const postClosurePreservationContinuityLedgerReceipt = providerWebhookArchiveCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceiptResponse();
  const safeDigest = "sha256:safeqahandoffcertifiedreleasefinalarchivesealpostclosurepreservationcustodyauditreceipt";
  const safeFilename = "provider-webhook-certified-release-post-closure-preservation-custody-audit-receipt.json";
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
      custodyAuditStatus: "under_safe_custody" as const,
      safeDigest: row.safeDigest,
      safeFilename: row.safeFilename,
      checkedAt: row.checkedAt,
      generatedAt: row.generatedAt,
      ...zeroCounts
    })),
    { sprintNumber: 114, artifactLabel: "Sprint 114 post-closure preservation custody audit receipt", artifactStatus: "audited", custodyAuditStatus: "under_safe_custody", safeDigest, safeFilename, generatedAt: "2026-06-15T00:00:00.000Z", checkedAt: "2026-06-15T00:00:00.000Z", ...zeroCounts }
  ];

  return {
    receiptKind: "qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-audit-receipt",
    postClosurePreservationCustodyAuditStatus: "audited",
    postClosurePreservationContinuityLedgerStatus: "continuous",
    postClosurePreservationVerificationStatus: "verified",
    finalArchiveSealPostClosurePreservationStatus: "preserved",
    finalOperationalClosureReceiptStatus: "issued",
    finalArchiveSealStatus: "sealed",
    releaseClosureStatus: "closed",
    tenantScopeStatus: "tenant_scoped",
    digestContinuityStatus: "confirmed",
    providerOutboundStatus: "absent",
    externalNotificationStatus: "absent",
    aiCallStatus: "absent",
    safeFilename,
    safeDigest,
    postClosurePreservationCustodyAuditDigest: safeDigest,
    postClosurePreservationContinuityLedgerDigest: postClosurePreservationContinuityLedgerReceipt.safeDigest,
    postClosurePreservationVerificationDigest: postClosurePreservationContinuityLedgerReceipt.postClosurePreservationVerificationDigest,
    generatedAt: "2026-06-15T00:00:00.000Z",
    checkedAt: "2026-06-15T00:00:00.000Z",
    custodyAuditRows,
    inheritedPostClosurePreservationContinuityLedgerReceiptSummary: {
      postClosurePreservationContinuityLedgerStatus: "continuous",
      postClosurePreservationVerificationStatus: "verified",
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
      externalCallsZero: true
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
      postClosurePreservationCustodyAuditSafeCount: custodyAuditRows.length,
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

function providerWebhookArchiveCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealReceiptResponse(): ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealReceipt {
  const postClosurePreservationCustodyAuditReceipt = providerWebhookArchiveCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceiptResponse();
  const safeDigest = "sha256:safeqahandoffcertifiedreleasefinalarchivesealpostclosurepreservationcustodychainsealreceipt";
  const safeFilename = "provider-webhook-certified-release-post-closure-preservation-custody-chain-seal-receipt.json";
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
      custodyChainSealStatus: "sealed_under_safe_custody" as const,
      safeDigest: row.safeDigest,
      safeFilename: row.safeFilename,
      checkedAt: row.checkedAt,
      generatedAt: row.generatedAt,
      ...zeroCounts
    })),
    { sprintNumber: 115, artifactLabel: "Sprint 115 post-closure preservation custody chain seal receipt", artifactStatus: "sealed", custodyAuditStatus: "under_safe_custody", custodyChainSealStatus: "sealed_under_safe_custody", safeDigest, safeFilename, generatedAt: "2026-06-15T00:00:00.000Z", checkedAt: "2026-06-15T00:00:00.000Z", ...zeroCounts }
  ];

  return {
    receiptKind: "qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-chain-seal-receipt",
    postClosurePreservationCustodyChainSealStatus: "sealed",
    postClosurePreservationCustodyAuditStatus: "audited",
    postClosurePreservationContinuityLedgerStatus: "continuous",
    postClosurePreservationVerificationStatus: "verified",
    finalArchiveSealPostClosurePreservationStatus: "preserved",
    finalOperationalClosureReceiptStatus: "issued",
    finalArchiveSealStatus: "sealed",
    releaseClosureStatus: "closed",
    tenantScopeStatus: "tenant_scoped",
    digestContinuityStatus: "confirmed",
    providerOutboundStatus: "absent",
    externalNotificationStatus: "absent",
    aiCallStatus: "absent",
    safeFilename,
    safeDigest,
    postClosurePreservationCustodyChainSealDigest: safeDigest,
    postClosurePreservationCustodyAuditDigest: postClosurePreservationCustodyAuditReceipt.safeDigest,
    postClosurePreservationContinuityLedgerDigest: postClosurePreservationCustodyAuditReceipt.postClosurePreservationContinuityLedgerDigest,
    postClosurePreservationVerificationDigest: postClosurePreservationCustodyAuditReceipt.postClosurePreservationVerificationDigest,
    generatedAt: "2026-06-15T00:00:00.000Z",
    checkedAt: "2026-06-15T00:00:00.000Z",
    custodyChainSealRows,
    inheritedPostClosurePreservationCustodyAuditReceiptSummary: {
      postClosurePreservationCustodyAuditStatus: "audited",
      postClosurePreservationContinuityLedgerStatus: "continuous",
      postClosurePreservationVerificationStatus: "verified",
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
      externalCallsZero: true
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
      postClosurePreservationCustodyChainSealSafeCount: custodyChainSealRows.length,
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

function providerWebhookArchiveCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerReceiptResponse(): ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerReceipt {
  const postClosurePreservationCustodyChainSealReceipt = providerWebhookArchiveCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealReceiptResponse();
  const safeDigest = "sha256:safeqahandoffcertifiedreleasefinalarchivesealpostclosurepreservationcustodychainintegrityledgerreceipt";
  const safeFilename = "provider-webhook-certified-release-post-closure-preservation-custody-chain-integrity-ledger-receipt.json";
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
      custodyChainIntegrityLedgerStatus: "integrity_confirmed_under_safe_custody" as const,
      safeDigest: row.safeDigest,
      safeFilename: row.safeFilename,
      checkedAt: row.checkedAt,
      generatedAt: row.generatedAt,
      ...zeroCounts
    })),
    { sprintNumber: 116, artifactLabel: "Sprint 116 post-closure preservation custody chain integrity ledger receipt", artifactStatus: "integrity_confirmed", custodyAuditStatus: "under_safe_custody", custodyChainSealStatus: "sealed_under_safe_custody", custodyChainIntegrityLedgerStatus: "integrity_confirmed_under_safe_custody", safeDigest, safeFilename, generatedAt: "2026-06-16T00:00:00.000Z", checkedAt: "2026-06-16T00:00:00.000Z", ...zeroCounts }
  ];

  return {
    receiptKind: "qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-chain-integrity-ledger-receipt",
    postClosurePreservationCustodyChainIntegrityLedgerStatus: "integrity_confirmed",
    postClosurePreservationCustodyChainSealStatus: "sealed",
    postClosurePreservationCustodyAuditStatus: "audited",
    postClosurePreservationContinuityLedgerStatus: "continuous",
    postClosurePreservationVerificationStatus: "verified",
    finalArchiveSealPostClosurePreservationStatus: "preserved",
    finalOperationalClosureReceiptStatus: "issued",
    finalArchiveSealStatus: "sealed",
    releaseClosureStatus: "closed",
    tenantScopeStatus: "tenant_scoped",
    digestContinuityStatus: "confirmed",
    providerOutboundStatus: "absent",
    externalNotificationStatus: "absent",
    aiCallStatus: "absent",
    safeFilename,
    safeDigest,
    postClosurePreservationCustodyChainIntegrityLedgerDigest: safeDigest,
    postClosurePreservationCustodyChainSealDigest: postClosurePreservationCustodyChainSealReceipt.safeDigest,
    postClosurePreservationCustodyAuditDigest: postClosurePreservationCustodyChainSealReceipt.postClosurePreservationCustodyAuditDigest,
    postClosurePreservationContinuityLedgerDigest: postClosurePreservationCustodyChainSealReceipt.postClosurePreservationContinuityLedgerDigest,
    postClosurePreservationVerificationDigest: postClosurePreservationCustodyChainSealReceipt.postClosurePreservationVerificationDigest,
    generatedAt: "2026-06-16T00:00:00.000Z",
    checkedAt: "2026-06-16T00:00:00.000Z",
    custodyChainIntegrityLedgerRows,
    inheritedPostClosurePreservationCustodyChainSealReceiptSummary: {
      postClosurePreservationCustodyChainSealStatus: "sealed",
      postClosurePreservationCustodyAuditStatus: "audited",
      postClosurePreservationContinuityLedgerStatus: "continuous",
      postClosurePreservationVerificationStatus: "verified",
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
      externalCallsZero: true
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
      postClosurePreservationCustodyChainIntegrityLedgerSafeCount: custodyChainIntegrityLedgerRows.length,
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

function providerWebhookArchiveCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityReceiptResponse(): ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt {
  const postClosurePreservationCustodyChainIntegrityLedgerReceipt = providerWebhookArchiveCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerReceiptResponse();
  const safeDigest = "sha256:safeqahandoffcertifiedreleasefinalarchivesealpostclosurepreservationcustodychainintegrityledgercontinuityreceipt";
  const safeFilename = "provider-webhook-certified-release-post-closure-preservation-custody-chain-integrity-ledger-continuity-receipt.json";
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
      custodyChainIntegrityLedgerContinuityStatus: "continuity_confirmed_under_safe_custody" as const,
      safeDigest: row.safeDigest,
      safeFilename: row.safeFilename,
      checkedAt: row.checkedAt,
      generatedAt: row.generatedAt,
      ...zeroCounts
    })),
    { sprintNumber: 117, artifactLabel: "Sprint 117 post-closure preservation custody chain integrity ledger continuity receipt", artifactStatus: "continuity_confirmed", custodyAuditStatus: "under_safe_custody", custodyChainSealStatus: "sealed_under_safe_custody", custodyChainIntegrityLedgerStatus: "integrity_confirmed_under_safe_custody", custodyChainIntegrityLedgerContinuityStatus: "continuity_confirmed_under_safe_custody", safeDigest, safeFilename, generatedAt: "2026-06-16T00:00:00.000Z", checkedAt: "2026-06-16T00:00:00.000Z", ...zeroCounts }
  ];

  return {
    receiptKind: "qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-chain-integrity-ledger-continuity-receipt",
    postClosurePreservationCustodyChainIntegrityLedgerContinuityStatus: "continuity_confirmed",
    postClosurePreservationCustodyChainIntegrityLedgerStatus: "integrity_confirmed",
    postClosurePreservationCustodyChainSealStatus: "sealed",
    postClosurePreservationCustodyAuditStatus: "audited",
    postClosurePreservationContinuityLedgerStatus: "continuous",
    postClosurePreservationVerificationStatus: "verified",
    finalArchiveSealPostClosurePreservationStatus: "preserved",
    finalOperationalClosureReceiptStatus: "issued",
    finalArchiveSealStatus: "sealed",
    releaseClosureStatus: "closed",
    redactionStatus: "passed",
    tenantScopeStatus: "tenant_scoped",
    digestContinuityStatus: "confirmed",
    providerOutboundStatus: "absent",
    externalNotificationStatus: "absent",
    aiCallStatus: "absent",
    safeFilename,
    safeDigest,
    postClosurePreservationCustodyChainIntegrityLedgerContinuityDigest: safeDigest,
    postClosurePreservationCustodyChainIntegrityLedgerDigest: postClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainIntegrityLedgerDigest,
    postClosurePreservationCustodyChainSealDigest: postClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainSealDigest,
    generatedAt: "2026-06-16T00:00:00.000Z",
    checkedAt: "2026-06-16T00:00:00.000Z",
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
      postClosurePreservationCustodyChainSealStatus: "sealed",
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
      postClosurePreservationCustodyChainIntegrityLedgerStatus: "integrity_confirmed",
      postClosurePreservationCustodyChainSealStatus: "sealed",
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
      custodyChainIntegrityLedgerContinuitySafeCount: safeRowSummaries.length,
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

function providerWebhookArchiveCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceiptResponse(): ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt {
  const continuityReceipt = providerWebhookArchiveCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityReceiptResponse();
  const safeDigest = "sha256:safeqahandoffcertifiedreleasefinalarchivesealpostclosurepreservationcustodychainintegrityledgercontinuityverificationreceipt";
  const safeFilename = "provider-webhook-certified-release-custody-chain-integrity-ledger-continuity-verification-receipt.json";
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
      verificationStatus: "verified_under_safe_custody" as const,
      safeDigest: row.safeDigest,
      safeFilename: row.safeFilename,
      generatedAt: row.generatedAt,
      verifiedAt: row.checkedAt,
      ...zeroCounts
    })),
    { sprintNumber: 118, artifactLabel: "Sprint 118 post-closure preservation custody chain integrity ledger continuity verification receipt", artifactStatus: "verified", custodyChainStatus: "sealed_under_safe_custody", ledgerIntegrityStatus: "integrity_confirmed_under_safe_custody", continuityStatus: "continuity_confirmed_under_safe_custody", verificationStatus: "verified_under_safe_custody", safeDigest, safeFilename, generatedAt: "2026-06-16T00:00:00.000Z", verifiedAt: "2026-06-16T00:00:00.000Z", ...zeroCounts }
  ];

  return {
    receiptKind: "qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-chain-integrity-ledger-continuity-verification-receipt",
    receiptStatus: "issued",
    verificationStatus: "verified",
    continuityStatus: "continuity_confirmed",
    custodyChainStatus: "sealed",
    ledgerIntegrityStatus: "integrity_confirmed",
    noExecutionStatus: "confirmed",
    redactionStatus: "passed",
    tenantScopeStatus: "tenant_scoped",
    digestContinuityStatus: "confirmed",
    providerOutboundStatus: "absent",
    externalNotificationStatus: "absent",
    aiCallStatus: "absent",
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
    safeFilename,
    safeDigest,
    continuityVerificationDigest: safeDigest,
    sprint117ReceiptDigest: continuityReceipt.safeDigest,
    generatedAt: "2026-06-16T00:00:00.000Z",
    verifiedAt: "2026-06-16T00:00:00.000Z",
    safeSummary: {
      receiptStatus: "issued",
      verificationStatus: "verified",
      continuityStatus: "continuity_confirmed",
      custodyChainStatus: "sealed",
      ledgerIntegrityStatus: "integrity_confirmed",
      noExecutionStatus: "confirmed",
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
      continuityStatus: "continuity_confirmed",
      custodyChainStatus: "sealed",
      ledgerIntegrityStatus: "integrity_confirmed",
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
      custodyChainIntegrityLedgerContinuitySafeCount: continuityReceipt.safeRowSummaries.length,
      verificationRowCount: verificationRows.length,
      verificationSafeCount: verificationRows.length,
      executionAttemptCount: 0,
      providerOutboundCallCount: 0,
      externalNotificationSendCount: 0,
      aiCallCount: 0
    }
  };
}

function providerWebhookArchiveCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceiptResponse(): ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceipt {
  const verificationReceipt = providerWebhookArchiveCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceiptResponse();
  const safeDigest = "sha256:safeqahandoffcertifiedreleasefinalarchivesealpostclosurepreservationcustodychainintegrityledgercontinuityverificationauditreceipt";
  const safeFilename = "provider-webhook-certified-release-custody-chain-integrity-ledger-continuity-verification-audit-receipt.json";
  const zeroCounts = {
    externalCalls: 0 as const,
    executionAttemptCount: 0 as const,
    providerOutboundCallCount: 0 as const,
    externalNotificationSendCount: 0 as const,
    aiCallCount: 0 as const,
    mutationCount: 0 as const
  };
  const auditRows: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceipt["auditRows"] = [
    ...verificationReceipt.verificationRows.map((row) => ({
      sprintNumber: row.sprintNumber,
      artifactLabel: row.artifactLabel,
      artifactStatus: row.artifactStatus,
      custodyChainStatus: row.custodyChainStatus,
      ledgerIntegrityStatus: row.ledgerIntegrityStatus,
      continuityStatus: row.continuityStatus,
      verificationStatus: row.verificationStatus,
      auditStatus: "audited_under_safe_custody" as const,
      safeDigest: row.safeDigest,
      safeFilename: row.safeFilename,
      generatedAt: row.generatedAt,
      verifiedAt: row.verifiedAt,
      auditedAt: "2026-06-16T00:00:00.000Z",
      ...zeroCounts
    })),
    { sprintNumber: 119, artifactLabel: "Sprint 119 post-closure preservation custody chain integrity ledger continuity verification audit receipt", artifactStatus: "audited", custodyChainStatus: "sealed_under_safe_custody", ledgerIntegrityStatus: "integrity_confirmed_under_safe_custody", continuityStatus: "continuity_confirmed_under_safe_custody", verificationStatus: "verified_under_safe_custody", auditStatus: "audited_under_safe_custody", safeDigest, safeFilename, generatedAt: "2026-06-16T00:00:00.000Z", verifiedAt: "2026-06-16T00:00:00.000Z", auditedAt: "2026-06-16T00:00:00.000Z", ...zeroCounts }
  ];

  return {
    receiptKind: "qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-chain-integrity-ledger-continuity-verification-audit-receipt",
    receiptStatus: "issued",
    auditStatus: "audited",
    verificationStatus: "verified",
    continuityStatus: "continuity_confirmed",
    custodyChainStatus: "sealed",
    ledgerIntegrityStatus: "integrity_confirmed",
    noExecutionStatus: "confirmed",
    redactionStatus: "passed",
    tenantScopeStatus: "tenant_scoped",
    digestContinuityStatus: "confirmed",
    providerOutboundStatus: "absent",
    externalNotificationStatus: "absent",
    aiCallStatus: "absent",
    externalCalls: 0,
    sourceSprint: 118,
    derivedFrom: {
      sourceSprint: 118,
      receiptKind: verificationReceipt.receiptKind,
      safeDigest: verificationReceipt.safeDigest,
      safeFilename: verificationReceipt.safeFilename,
      continuityVerificationDigest: verificationReceipt.continuityVerificationDigest,
      sprint117ReceiptDigest: verificationReceipt.sprint117ReceiptDigest,
      rowRangeStart: 103,
      rowRangeEnd: 118,
      rowCount: verificationReceipt.verificationRows.length,
      externalCallsZero: true
    },
    safeFilename,
    safeDigest,
    continuityVerificationAuditDigest: safeDigest,
    sprint118ReceiptDigest: verificationReceipt.safeDigest,
    sprint117ReceiptDigest: verificationReceipt.sprint117ReceiptDigest,
    generatedAt: "2026-06-16T00:00:00.000Z",
    auditedAt: "2026-06-16T00:00:00.000Z",
    safeSummary: {
      receiptStatus: "issued",
      auditStatus: "audited",
      verificationStatus: "verified",
      continuityStatus: "continuity_confirmed",
      custodyChainStatus: "sealed",
      ledgerIntegrityStatus: "integrity_confirmed",
      noExecutionStatus: "confirmed",
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
      receiptStatus: verificationReceipt.receiptStatus,
      verificationStatus: verificationReceipt.verificationStatus,
      continuityStatus: verificationReceipt.continuityStatus,
      custodyChainStatus: verificationReceipt.custodyChainStatus,
      ledgerIntegrityStatus: verificationReceipt.ledgerIntegrityStatus,
      safeDigest: verificationReceipt.safeDigest,
      safeFilename: verificationReceipt.safeFilename,
      continuityVerificationDigest: verificationReceipt.continuityVerificationDigest,
      sprint117ReceiptDigest: verificationReceipt.sprint117ReceiptDigest,
      verificationRowCount: verificationReceipt.verificationRows.length,
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
      continuityVerificationRowCount: verificationReceipt.verificationRows.length,
      continuityVerificationSafeCount: verificationReceipt.verificationRows.length,
      auditRowCount: auditRows.length,
      auditSafeCount: auditRows.length,
      executionAttemptCount: 0,
      providerOutboundCallCount: 0,
      externalNotificationSendCount: 0,
      aiCallCount: 0
    }
  };
}

function providerWebhookCertifiedReleaseGoLiveHoldReleaseAuthorizationReceiptRow(key: string, label: string, safeDigest: string, checkedCount: number) {
  return { key, label, goLiveHoldReleaseAuthorizationStatus: "authorized", launchApprovalStatus: "ready", launchWindowConfirmationStatus: "confirmed", goLiveHoldStatus: "ready", goLiveAuthorizationReceiptStatus: "issued", goLiveAuthorizationStatus: "ready", launchWindowStatus: "ready", safeLaunchWindowStatus: "ready", operatorCommandReceiptStatus: "issued", operatorCommandStatus: "ready", safeDigest, checkedCount, complete: true };
}

function providerWebhookCertifiedReleaseLaunchApprovalReceiptRow(key: string, label: string, safeDigest: string, checkedCount: number): ProviderWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceipt["noExecutionGuardRows"][number] {
  return { key, label, goLiveHoldReleaseAuthorizationStatus: "authorized", launchApprovalStatus: "ready", launchApprovalReceiptStatus: "issued", noExecutionGuardStatus: "retained", launchWindowConfirmationStatus: "confirmed", goLiveHoldStatus: "ready", goLiveAuthorizationReceiptStatus: "issued", goLiveAuthorizationStatus: "ready", launchWindowStatus: "ready", safeLaunchWindowStatus: "ready", operatorCommandReceiptStatus: "issued", operatorCommandStatus: "ready", safeDigest, checkedCount, complete: true } as ProviderWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceipt["noExecutionGuardRows"][number];
}

function providerWebhookCertifiedReleaseNoExecutionLockReceiptRow(key: string, label: string, safeDigest: string, checkedCount: number): ProviderWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceipt["noExecutionLockRows"][number] {
  return { key, label, goLiveHoldReleaseAuthorizationStatus: "authorized", launchApprovalStatus: "ready", launchApprovalReceiptStatus: "issued", noExecutionGuardStatus: "retained", noExecutionLockReceiptStatus: "issued", noExecutionLockStatus: "locked", launchApprovalArchiveStatus: "retained", tenantScopeStatus: "tenant_scoped", providerOutboundStatus: "absent", externalNotificationStatus: "absent", aiCallStatus: "absent", digestChainStatus: "confirmed", launchWindowConfirmationStatus: "confirmed", goLiveHoldStatus: "ready", goLiveAuthorizationReceiptStatus: "issued", goLiveAuthorizationStatus: "ready", launchWindowStatus: "ready", safeLaunchWindowStatus: "ready", operatorCommandReceiptStatus: "issued", operatorCommandStatus: "ready", safeDigest, checkedCount, complete: true } as ProviderWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceipt["noExecutionLockRows"][number];
}

function providerWebhookCertifiedReleaseOperationsHandoffEvidenceRow(
  key: ProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacket["operationsHandoffEvidenceRows"][number]["key"],
  label: string,
  safeDigest: string,
  safeFilename: string | undefined,
  checkedCount: number
): ProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacket["operationsHandoffEvidenceRows"][number] {
  return { key, label, redactedLabel: label, status: "confirmed", safeDigest, ...(safeFilename ? { safeFilename } : {}), checkedCount, complete: true };
}

function providerWebhookCertifiedReleaseFinalReadinessCertificateRow(key: string, label: string, safeDigest: string, checkedCount: number) {
  return {
    key,
    label,
    certificateStatus: "issued",
    finalReadinessStatus: "ready",
    safeDigest,
    checkedCount,
    complete: true
  };
}

function providerWebhookCertifiedReleaseNoopExecutionChecklistItem(key: string, label: string, safeDigest: string) {
  return { key, label, checklistStatus: "complete", safeDigest, complete: true };
}

function providerWebhookCertifiedReleaseDryRunResultLedgerRow(key: string, label: string, safeDigest: string, checkedCount: number) {
  return { key, label, rowStatus: "recorded", safeDigest, checkedCount, complete: true };
}

function providerWebhookCertifiedReleaseDryRunFinalReadinessRow(key: string, label: string, safeDigest: string, checkedCount: number) {
  return { key, label, readinessStatus: "ready", safeDigest, checkedCount, complete: true };
}

function providerWebhookCertifiedReleaseNoopDryRunRow(key: string, label: string, safeDigest: string, checkedCount: number) {
  return { key, label, dryRunRowStatus: "passed", safeDigest, checkedCount, complete: true };
}

function providerWebhookCertifiedReleaseNoopExecutionPlanRow(key: string, label: string, safeDigest: string, checkedCount: number, planStatus: string) {
  return { key, label, planStatus, safeDigest, checkedCount, complete: true };
}

function providerWebhookCertifiedReleaseAcknowledgementRow(key: string, label: string, safeDigest: string, checkedCount: number, complete: boolean) {
  return {
    key,
    label,
    acknowledgementStatus: complete ? "acknowledged" : "pending",
    safeDigest,
    checkedCount,
    complete
  };
}

function providerWebhookCertifiedReleaseHandoffRow(key: string, label: string, safeDigest: string, checkedCount: number, handoffRowStatus = "confirmed") {
  return { key, label, handoffRowStatus, safeDigest, checkedCount, complete: true };
}

function providerWebhookCertifiedReleaseRunbookRow(key: string, label: string, safeDigest: string, ownerRole: string) {
  return { key, label, runbookStatus: "ready", safeDigest, ownerRole, complete: true };
}

function providerWebhookCertifiedReleaseOperatorChecklistItem(key: string, label: string, safeDigest: string) {
  return { key, label, checklistStatus: "complete", safeDigest, complete: true };
}

function providerWebhookCertifiedReleaseDecisionReceiptRow(key: string, label: string, safeDigest: string, checkedCount: number, receiptRowStatus = "confirmed") {
  return {
    key,
    label,
    receiptRowStatus,
    safeDigest,
    checkedCount,
    complete: true
  };
}

function providerWebhookReleaseAttestationReconciliationRow(key: string, label: string, reconciliationStatus: string, safeDigest: string, checkedCount: number) {
  return {
    key,
    label,
    reconciliationStatus,
    safeDigest,
    checkedCount,
    aligned: true
  };
}

function providerWebhookReleaseAttestationAuditRow(key: string, label: string, attestationStatus: string, safeDigest: string, checkedCount: number) {
  return {
    key,
    label,
    attestationStatus,
    safeDigest,
    checkedCount,
    complete: true
  };
}

function providerWebhookAssignmentSummaryItemResponse() {
  return {
    unmatchedId: "provider-webhook-unmatched-api",
    provider: "line",
    platform: "line",
    channelAccountId: "sandbox:line",
    safeRoomLabel: "line room digest saferoomdige",
    roomKeyDigest: "sha256:saferoomdigest",
    eventType: "message.created",
    receivedAt: "2026-05-31T00:00:00.000Z",
    ageBucket: "over3Days",
    reviewStatus: "pending",
    linkStatus: "none",
    unmatchedStatus: "review-needed",
    triageLane: "critical_stale_open",
    severity: "critical",
    assignmentStatus: "assigned",
    assignedToOperatorLabel: "operator:current",
    assignedAt: "2026-05-31T00:10:00.000Z",
    assignedByOperatorLabel: "operator:current",
    escalationStatus: "escalated",
    escalationReason: "SLA_RISK",
    escalatedAt: "2026-05-31T00:11:00.000Z",
    escalatedByOperatorLabel: "operator:current",
    resolutionStatus: "unresolved",
    resolutionOutcome: null,
    closureReadiness: "NOT_READY",
    checklistCompletedCount: 1,
    checklistTotalCount: 9,
    lastOperatorNoteAt: "2026-05-31T00:12:00.000Z",
    historyAvailable: true,
    diagnosticsAvailable: true,
    candidatesAvailable: true,
    externalCalls: 0
  };
}

function providerWebhookDiagnosticsResponse(unmatchedInboundId: string) {
  return {
    unmatchedId: unmatchedInboundId,
    provider: "line",
    platform: "line",
    channelAccountId: "sandbox:line",
    safeRoomLabel: "line room digest saferoomdige",
    roomKeyDigest: "sha256:saferoomdigest",
    eventType: "message.created",
    receivedAt: "2026-05-31T00:00:00.000Z",
    reviewStatus: "pending",
    linkStatus: "none",
    unmatchedStatus: "review-needed",
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
    closureChecklist: providerWebhookClosureChecklistResponse(),
    checklistCompletedCount: 1,
    checklistTotalCount: 9,
    checklistIncompleteSteps: [
      "REVIEWED_HISTORY",
      "REVIEWED_TRIAGE_GUIDANCE",
      "REVIEWED_CANDIDATES",
      "CONFIRMED_NO_RAW_LEAKAGE",
      "CONFIRMED_NO_PROVIDER_OUTBOUND",
      "CONFIRMED_ASSIGNMENT_OR_ESCALATION",
      "CONFIRMED_SAFE_LINK_TARGET",
      "CONFIRMED_OPERATOR_NOTE"
    ],
    recommendedNextActions: ["VIEW_HISTORY", "RUN_CANDIDATE_LOOKUP", "ADD_OPERATOR_NOTE"],
    lastOperatorNoteAt: null,
    routingOutcome: "dry-run-only/not-found",
    normalizedEventType: "message",
    persistenceOutcome: "skipped-no-match",
    candidateLookupAvailable: true,
    historyAvailable: true,
    exportAvailable: true,
    lastActionAt: "2026-05-31T00:00:00.000Z",
    safeWarnings: {
      signatureRejected: false,
      replayDuplicate: false,
      missingConversationMatch: true,
      staleOpenItem: false
    },
    externalCalls: 0
  };
}
