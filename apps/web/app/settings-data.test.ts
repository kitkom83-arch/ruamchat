import { beforeEach, describe, expect, it, vi } from "vitest";
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
    expect(JSON.stringify({ finalization, signOff, receipt, releaseEvidence, releaseVerification, releaseCertification, closureLedger, attestationAudit, reconciliation, releaseGate, decisionReceipt, handoffPacket, acceptanceRecord, acknowledgedRecord, noopDryRun, executedNoopDryRun, resultLedger })).not.toMatch(/providerRaw|payloadJson|raw-room|raw-sender|raw room|raw sender|accessToken|webhookSecret|bearer|"token"\s*:|"secret"\s*:|"replyToken"\s*:|"rawPayload"\s*:|"rawSignature"\s*:/i);
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
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord).not.toHaveBeenCalled();
    expect(api.acknowledgeProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord).not.toHaveBeenCalled();
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun).not.toHaveBeenCalled();
    expect(api.runProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun).not.toHaveBeenCalled();
    expect(api.getProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedger).not.toHaveBeenCalled();
    expect(JSON.stringify({ pending, acknowledged, readback, initialDryRun, executedDryRun, dryRunReadback, resultLedger })).not.toMatch(/providerRaw|payloadJson|raw-room|raw-sender|raw room|raw sender|accessToken|webhookSecret|bearer|"token"\s*:|"secret"\s*:|"replyToken"\s*:|"rawPayload"\s*:|"rawSignature"\s*:/i);
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
