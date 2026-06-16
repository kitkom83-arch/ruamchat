import { describe, expect, it } from "vitest";
import {
  applyAiDecisionPolicy,
  aiDecisionSchema,
  agentSchema,
  agentPerformanceMetricSchema,
  aiPerformanceMetricSchema,
  analyticsDateRangeSchema,
  assignmentSchema,
  auditLogSchema,
  broadcastCampaignSchema,
  broadcastDeliveryEventSchema,
  broadcastRecipientSchema,
  broadcastRunSchema,
  broadcastSegmentRuleSchema,
  broadcastSegmentSchema,
  broadcastTemplateSchema,
  cannedReplySchema,
  channelMetricSchema,
  conversationFunnelMetricSchema,
  contactIdentitySchema,
  contactSchema,
  contactTaskSchema,
  contactTaskStatusSchema,
  conversationPrioritySchema,
  coreConversationCardSchema,
  createKnowledgeAwareMockAiDecision,
  createFallbackAiDecision,
  findMatchedKnowledge,
  flowEdgeSchema,
  flowNodeSchema,
  flowRunSchema,
  flowSchema,
  flowTriggerSchema,
  internalNoteSchema,
  knowledgeCategorySchema,
  knowledgeMetricSchema,
  knowledgeItemSchema,
  knowledgeStatusSchema,
  leadStatusSchema,
  metricCardSchema,
  metricTrendSchema,
  normalizedInboundMessageSchema,
  parseAiDecisionWithFallback,
  providerWebhookReviewClosureEvidenceExportSchema,
  providerWebhookReviewClosureEvidenceSchema,
  providerWebhookReviewExportIntegritySchema,
  providerWebhookReviewExportManifestSchema,
  providerWebhookReviewQaHandoffBundleSchema,
  providerWebhookReviewQaHandoffBundleExportSchema,
  providerWebhookReviewQaHandoffArchiveIntegritySchema,
  providerWebhookReviewQaHandoffArchiveFinalizationSchema,
  providerWebhookReviewQaHandoffFinalizationReceiptSchema,
  providerWebhookReviewQaHandoffFinalizationSignOffRequestSchema,
  providerWebhookReviewQaHandoffFinalizationSignOffResponseSchema,
  providerWebhookReviewQaHandoffReleaseEvidenceSchema,
  providerWebhookReviewQaHandoffReleaseCertificationSchema,
  providerWebhookReviewQaHandoffReleaseAttestationAuditSchema,
  providerWebhookReviewQaHandoffReleaseAttestationReconciliationRegisterSchema,
  providerWebhookReviewQaHandoffCertifiedReleaseGateSchema,
  providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptSchema,
  providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordSchema,
  providerWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerSchema,
  providerWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificateSchema,
  providerWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegisterSchema,
  providerWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptSchema,
  providerWebhookReviewQaHandoffCertifiedReleaseControlRoomPacketSchema,
  providerWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceiptSchema,
  providerWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceiptSchema,
  providerWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceiptSchema,
  providerWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceiptSchema,
  providerWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceiptSchema,
  providerWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceiptSchema,
  providerWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceiptSchema,
  providerWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacketSchema,
  providerWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceReceiptSchema,
  providerWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedgerSchema,
  providerWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceiptSchema,
  providerWebhookReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollupSchema,
  providerWebhookReviewQaHandoffCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceiptSchema,
  providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealOperationalClosureReceiptSchema,
  providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceiptSchema,
  providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceiptSchema,
  providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceiptSchema,
  providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealReceiptSchema,
  providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerReceiptSchema,
  providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityReceiptSchema,
  providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceiptSchema,
  providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunRequestSchema,
  providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunSchema,
  providerWebhookReviewQaHandoffCertifiedReleaseHandoffPacketSchema,
  providerWebhookReviewQaHandoffReleaseClosureLedgerSchema,
  providerWebhookReviewQaHandoffReleaseVerificationSchema,
  providerWebhookReviewQaHandoffRetentionAuditSchema,
  providerWebhookReviewQaHandoffReceiptSchema,
  providerWebhookReviewQaHandoffSignOffRequestSchema,
  providerWebhookReviewQaHandoffSignOffResponseSchema,
  providerWebhookReviewExportRedactionAuditSchema,
  providerWebhookReviewClosureReportExportSchema,
  providerWebhookReviewClosureReportSchema,
  sampleKnowledgeItems,
  shouldAutoSend,
  shouldHandoff,
  slaPolicySchema,
  slaMetricSchema,
  slaStateSchema,
  updateCustomer360ConsentRequestSchema,
  updateCustomer360ProfileRequestSchema,
  type ProviderWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceipt,
  type ProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceipt,
  type ProviderWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceipt,
  type ProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceipt,
  type ProviderWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceipt,
  type ProviderWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceipt,
  type ProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacket,
  type ProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceReceipt,
  type ProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedger,
  type ProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt,
  type ProviderWebhookReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollup,
  type ProviderWebhookReviewQaHandoffCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt,
  type ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealOperationalClosureReceipt,
  type ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceipt,
  type ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceipt,
  type ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceipt,
  type ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealReceipt,
  type ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerReceipt,
  type ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt
} from "./index.js";

describe("shared contracts", () => {
  it("validates normalized inbound messages", () => {
    const parsed = normalizedInboundMessageSchema.parse({
      tenantId: "00000000-0000-4000-8000-000000000001",
      platform: "telegram",
      channelAccountId: "00000000-0000-4000-8000-000000000002",
      externalUserId: "123",
      platformMessageId: "tg-1",
      messageType: "text",
      text: "hello",
      attachments: [],
      timestamp: new Date().toISOString(),
      rawPayload: {}
    });

    expect(parsed.platform).toBe("telegram");
  });

  it("validates QA handoff receipt and sign-off DTOs without raw provider fields", () => {
    const manualQaChecks = {
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
    };
    const receipt = providerWebhookReviewQaHandoffReceiptSchema.parse({
      generatedAt: "2026-05-21T04:00:00.000Z",
      receiptStatus: "not_acknowledged",
      bundleStatus: "ready",
      exportStatus: "ready",
      safeFilename: "provider-webhook-review-qa-handoff-receipt.json",
      safeDigest: "sha256:receipt",
      bundleDigest: "sha256:bundle",
      exportDigest: "sha256:export",
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
      counts: {
        totalItems: 1,
        totalOpenItems: 0,
        evidenceManifestCount: 1,
        closureEvidenceReadyCount: 1,
        closureEvidenceBlockedCount: 0,
        closureEvidenceIncompleteCount: 0
      },
      manualQaChecks,
      reviewerRole: null,
      reviewerLabel: null,
      acknowledgedAt: null,
      signedAt: null,
      externalCalls: 0
    });

    expect(receipt.externalCalls).toBe(0);
    expect(providerWebhookReviewQaHandoffSignOffRequestSchema.parse({}).acknowledgementType).toBe("sign_off");
    expect(providerWebhookReviewQaHandoffSignOffResponseSchema.parse({
      ...receipt,
      receiptStatus: "signed_off",
      reviewerRole: "reviewer",
      reviewerLabel: "operator:safe",
      acknowledgedAt: "2026-05-21T04:00:00.000Z",
      signedAt: "2026-05-21T04:00:00.000Z",
      signOffStatus: "signed_off",
      signOffRecordId: "provider-webhook-qa-handoff-signoff-1",
      action: "sign_off"
    }).signOffStatus).toBe("signed_off");
    expect(() => providerWebhookReviewQaHandoffReceiptSchema.parse({ ...receipt, rawPayload: {} })).toThrow();
    expect(() => providerWebhookReviewQaHandoffSignOffRequestSchema.parse({ reviewerLabel: "safe", replyToken: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffReceiptSchema.parse({ ...receipt, externalCalls: 1 })).toThrow();
  });

  it("validates QA archive integrity and retention audit DTOs without raw provider fields", () => {
    const manualQaChecks = {
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
    };
    const readinessFlags = {
      reviewClosureEvidenceEnabled: true,
      reviewClosureReportEnabled: true,
      reviewClosureEvidenceExportEnabled: true,
      reviewClosureReportExportEnabled: true,
      reviewExportRedactionAuditEnabled: true,
      reviewExportIntegrityChecksEnabled: true,
      reviewExportManifestEnabled: true,
      reviewExportQaHandoffEnabled: true
    };
    const counts = {
      totalItems: 1,
      totalOpenItems: 1,
      evidenceManifestCount: 1,
      closureEvidenceReadyCount: 1,
      closureEvidenceBlockedCount: 0,
      closureEvidenceIncompleteCount: 0,
      lockedItemCount: 1,
      lockedOpenItemCount: 1
    };
    const integrity = providerWebhookReviewQaHandoffArchiveIntegritySchema.parse({
      generatedAt: "2026-06-06T00:00:00.000Z",
      integrityStatus: "confirmed",
      retentionAuditStatus: "confirmed",
      lockedArchiveStatus: "exported",
      retentionManifestStatus: "ready",
      archiveAcknowledgementStatus: "exported",
      auditAcknowledgementStatus: "acknowledged",
      acceptanceStatus: "locked",
      lockStatus: "locked",
      receiptStatus: "signed_off",
      signOffStatus: "signed_off",
      bundleStatus: "ready",
      exportStatus: "ready",
      safeFilename: "provider-webhook-review-qa-handoff-locked-archive-integrity.json",
      safeDigest: "sha256:integrity",
      bundleDigest: "sha256:bundle",
      exportDigest: "sha256:export",
      receiptDigest: "sha256:receipt",
      acceptanceLockDigest: "sha256:acceptance",
      lockedArchiveDigest: "sha256:archive",
      retentionManifestDigest: "sha256:retention",
      digestChainStatus: "confirmed",
      safeCheckLabels: ["bundle digest present", "retention manifest digest present"],
      readinessFlags,
      counts: {
        ...counts,
        digestChainLinkCount: 6,
        integrityCheckedCount: 1
      },
      manualQaChecks,
      archivedAt: "2026-06-06T00:00:00.000Z",
      exportedAt: "2026-06-06T00:01:00.000Z",
      externalCalls: 0
    });
    const retentionAudit = providerWebhookReviewQaHandoffRetentionAuditSchema.parse({
      generatedAt: "2026-06-06T00:00:00.000Z",
      retentionPolicyStatus: "active",
      retentionAuditStatus: "confirmed",
      retentionManifestStatus: "ready",
      lockedArchiveStatus: "exported",
      archiveAcknowledgementStatus: "exported",
      auditAcknowledgementStatus: "acknowledged",
      acceptanceStatus: "locked",
      lockStatus: "locked",
      safePolicyLabel: "safe-qa-handoff-locked-archive-retain-review-metadata-only",
      safeRetentionWindowLabel: "safe-review-metadata-retained",
      safeFilename: "provider-webhook-review-qa-handoff-retention-audit.json",
      safeDigest: "sha256:retentionaudit",
      lockedArchiveDigest: integrity.lockedArchiveDigest,
      retentionManifestDigest: integrity.retentionManifestDigest,
      digestChainStatus: "confirmed",
      auditChecklistItems: [
        { key: "retention_manifest_ready", label: "retention manifest ready", status: "confirmed" },
        { key: "external_calls_zero", label: "externalCalls zero", status: "confirmed" }
      ],
      counts: {
        ...counts,
        auditChecklistPassedCount: 2,
        auditChecklistNeedsReviewCount: 0,
        auditChecklistBlockedCount: 0
      },
      archivedAt: integrity.archivedAt,
      exportedAt: integrity.exportedAt,
      externalCalls: 0
    });

    expect(integrity.digestChainStatus).toBe("confirmed");
    expect(integrity.externalCalls).toBe(0);
    expect(retentionAudit.retentionAuditStatus).toBe("confirmed");
    expect(retentionAudit.externalCalls).toBe(0);
    expect(() => providerWebhookReviewQaHandoffArchiveIntegritySchema.parse({ ...integrity, rawPayload: {} })).toThrow();
    expect(() => providerWebhookReviewQaHandoffRetentionAuditSchema.parse({ ...retentionAudit, replyToken: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffArchiveIntegritySchema.parse({ ...integrity, externalCalls: 1 })).toThrow();
  });

  it("validates QA archive finalization and retention sign-off DTOs without raw provider fields", () => {
    const manualQaChecks = {
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
    };
    const readinessFlags = {
      reviewClosureEvidenceEnabled: true,
      reviewClosureReportEnabled: true,
      reviewClosureEvidenceExportEnabled: true,
      reviewClosureReportExportEnabled: true,
      reviewExportRedactionAuditEnabled: true,
      reviewExportIntegrityChecksEnabled: true,
      reviewExportManifestEnabled: true,
      reviewExportQaHandoffEnabled: true
    };
    const finalization = providerWebhookReviewQaHandoffArchiveFinalizationSchema.parse({
      generatedAt: "2026-06-06T00:00:00.000Z",
      finalizationStatus: "ready",
      retentionSignOffStatus: "not_signed",
      finalizationReceiptStatus: "not_created",
      integrityStatus: "confirmed",
      retentionAuditStatus: "confirmed",
      lockedArchiveStatus: "exported",
      retentionManifestStatus: "ready",
      archiveAcknowledgementStatus: "exported",
      auditAcknowledgementStatus: "acknowledged",
      acceptanceStatus: "locked",
      lockStatus: "locked",
      receiptStatus: "signed_off",
      signOffStatus: "signed_off",
      digestChainStatus: "confirmed",
      safeFilename: "provider-webhook-review-qa-handoff-archive-finalization.json",
      safeDigest: "sha256:finalization",
      bundleDigest: "sha256:bundle",
      exportDigest: "sha256:export",
      receiptDigest: "sha256:receipt",
      acceptanceLockDigest: "sha256:acceptance",
      lockedArchiveDigest: "sha256:archive",
      retentionManifestDigest: "sha256:retention",
      integrityDigest: "sha256:integrity",
      finalizationReceiptDigest: null,
      safeRetentionPolicyLabel: "safe-qa-handoff-locked-archive-retain-review-metadata-only",
      safeReviewerLabel: null,
      safeCheckLabels: ["archive integrity confirmed", "retention audit confirmed"],
      readinessFlags,
      counts: {
        totalItems: 1,
        totalOpenItems: 1,
        evidenceManifestCount: 1,
        closureEvidenceReadyCount: 1,
        closureEvidenceBlockedCount: 0,
        closureEvidenceIncompleteCount: 0,
        lockedItemCount: 1,
        lockedOpenItemCount: 1,
        digestChainLinkCount: 7,
        finalizationCheckedCount: 1,
        retentionSignOffCount: 0
      },
      manualQaChecks,
      archivedAt: "2026-06-06T00:00:00.000Z",
      exportedAt: "2026-06-06T00:01:00.000Z",
      signedAt: null,
      finalizedAt: null,
      externalCalls: 0
    });

    const request = providerWebhookReviewQaHandoffFinalizationSignOffRequestSchema.parse({
      reviewerRole: "retention reviewer",
      reviewerLabel: "safe finalization reviewer"
    });
    const signed = providerWebhookReviewQaHandoffFinalizationSignOffResponseSchema.parse({
      ...finalization,
      generatedAt: "2026-06-06T00:02:00.000Z",
      finalizationStatus: "finalized",
      retentionSignOffStatus: "signed_off",
      finalizationReceiptStatus: "ready",
      safeFilename: "provider-webhook-review-qa-handoff-archive-finalization-signoff.json",
      safeDigest: "sha256:signoff",
      finalizationReceiptDigest: "sha256:receiptfinal",
      safeReviewerLabel: "safe finalization reviewer",
      counts: {
        ...finalization.counts,
        retentionSignOffCount: 1
      },
      signedAt: "2026-06-06T00:02:00.000Z",
      finalizedAt: "2026-06-06T00:02:00.000Z",
      action: "sign_off",
      signOffRecordId: "provider-webhook-qa-archive-finalization-signoff-1"
    });
    const receiptBase: Omit<typeof signed, "action"> & Partial<Pick<typeof signed, "action">> = { ...signed };
    delete receiptBase.action;
    const receipt = providerWebhookReviewQaHandoffFinalizationReceiptSchema.parse({
      ...receiptBase,
      receiptKind: "qa-handoff-locked-archive-finalization-receipt"
    });
    const releaseEvidence = providerWebhookReviewQaHandoffReleaseEvidenceSchema.parse({
      ...receipt,
      evidenceKind: "qa-handoff-locked-archive-release-evidence-pack",
      releaseReadinessStatus: "ready_for_release",
      retentionPolicyStatus: "active",
      safeReleaseLabel: "safe-qa-handoff-release-evidence-pack",
      safeFilename: "provider-webhook-review-qa-handoff-archive-release-evidence-pack.json",
      safeDigest: "sha256:releaseevidence",
      retentionAuditDigest: "sha256:retentionaudit",
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
      safeCheckLabels: ["QA handoff bundle ready", "finalization receipt ready"],
      counts: {
        ...receipt.counts,
        releaseEvidenceCheckedCount: 1,
        prerequisitePassedCount: 16,
        prerequisiteTotalCount: 16
      }
    });
    const releaseVerification = providerWebhookReviewQaHandoffReleaseVerificationSchema.parse({
      ...releaseEvidence,
      verificationKind: "qa-handoff-locked-archive-release-verification-matrix",
      verificationStatus: "verified",
      safeVerificationLabel: "safe-qa-handoff-release-verification-matrix",
      safeFilename: "provider-webhook-review-qa-handoff-archive-release-verification-matrix.json",
      safeDigest: "sha256:releaseverification",
      releaseEvidenceDigest: releaseEvidence.safeDigest,
      digestMatrixRows: [
        { key: "qa_handoff_bundle", label: "QA handoff bundle", safeDigest: releaseEvidence.bundleDigest, expectedDigest: releaseEvidence.bundleDigest, digestPresent: true, digestMatchesExpected: true, verificationStatus: "verified" },
        { key: "qa_handoff_export", label: "QA handoff export", safeDigest: releaseEvidence.exportDigest, expectedDigest: releaseEvidence.exportDigest, digestPresent: true, digestMatchesExpected: true, verificationStatus: "verified" },
        { key: "receipt_sign_off", label: "receipt/sign-off", safeDigest: releaseEvidence.receiptDigest, expectedDigest: releaseEvidence.receiptDigest, digestPresent: true, digestMatchesExpected: true, verificationStatus: "verified" },
        { key: "acceptance_lock", label: "acceptance lock", safeDigest: releaseEvidence.acceptanceLockDigest, expectedDigest: releaseEvidence.acceptanceLockDigest, digestPresent: true, digestMatchesExpected: true, verificationStatus: "verified" },
        { key: "locked_archive_export", label: "locked archive/export", safeDigest: releaseEvidence.lockedArchiveDigest, expectedDigest: releaseEvidence.lockedArchiveDigest, digestPresent: true, digestMatchesExpected: true, verificationStatus: "verified" },
        { key: "retention_manifest", label: "retention manifest", safeDigest: releaseEvidence.retentionManifestDigest, expectedDigest: releaseEvidence.retentionManifestDigest, digestPresent: true, digestMatchesExpected: true, verificationStatus: "verified" },
        { key: "archive_integrity", label: "archive integrity", safeDigest: releaseEvidence.integrityDigest, expectedDigest: releaseEvidence.integrityDigest, digestPresent: true, digestMatchesExpected: true, verificationStatus: "verified" },
        { key: "retention_audit", label: "retention audit", safeDigest: releaseEvidence.retentionAuditDigest, expectedDigest: releaseEvidence.retentionAuditDigest, digestPresent: true, digestMatchesExpected: true, verificationStatus: "verified" },
        { key: "finalization_receipt", label: "finalization receipt", safeDigest: releaseEvidence.finalizationReceiptDigest, expectedDigest: releaseEvidence.finalizationReceiptDigest, digestPresent: true, digestMatchesExpected: true, verificationStatus: "verified" },
        { key: "release_evidence", label: "release evidence", safeDigest: releaseEvidence.safeDigest, expectedDigest: releaseEvidence.safeDigest, digestPresent: true, digestMatchesExpected: true, verificationStatus: "verified" }
      ],
      counts: {
        ...releaseEvidence.counts,
        releaseVerificationCheckedCount: 1,
        digestMatrixRowCount: 10,
        digestMatrixVerifiedCount: 10,
        digestMatrixNeedsReviewCount: 0,
        digestMatrixBlockedCount: 0
      }
    });
    const releaseCertification = providerWebhookReviewQaHandoffReleaseCertificationSchema.parse({
      certificationKind: "qa-handoff-locked-archive-release-certification-receipt",
      certificationStatus: "certified",
      releaseReadinessStatus: "ready_for_release",
      verificationStatus: "verified",
      digestChainStatus: "confirmed",
      safeFilename: "provider-webhook-review-qa-handoff-archive-release-certification-receipt.json",
      safeDigest: "sha256:releasecertification",
      releaseEvidenceDigest: releaseVerification.releaseEvidenceDigest,
      releaseVerificationDigest: releaseVerification.safeDigest,
      prerequisiteChecklist: releaseVerification.prerequisiteChecklist,
      certificationChecklist: {
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
      },
      digestMatrixSummary: {
        totalRows: 10,
        verifiedRows: 10,
        needsReviewRows: 0,
        blockedRows: 0,
        allRowsVerified: true
      },
      counts: {
        totalItems: releaseVerification.counts.totalItems,
        releaseEvidenceCheckedCount: 1,
        releaseVerificationCheckedCount: 1,
        releaseCertificationCheckedCount: 1,
        prerequisitePassedCount: 16,
        prerequisiteTotalCount: 16,
        certificationChecklistPassedCount: 13,
        certificationChecklistTotalCount: 13,
        digestMatrixRowCount: 10,
        digestMatrixVerifiedCount: 10,
        digestMatrixNeedsReviewCount: 0,
        digestMatrixBlockedCount: 0
      },
      externalCalls: 0
    });
    const releaseClosureLedger = providerWebhookReviewQaHandoffReleaseClosureLedgerSchema.parse({
      ledgerKind: "qa-handoff-locked-archive-release-closure-ledger",
      ledgerStatus: "certified_release_closed",
      certificationStatus: "certified",
      releaseReadinessStatus: "ready_for_release",
      verificationStatus: "verified",
      digestChainStatus: "confirmed",
      safeFilename: "provider-webhook-review-qa-handoff-archive-release-closure-ledger.json",
      safeDigest: "sha256:releaseclosureledger",
      releaseEvidenceDigest: releaseCertification.releaseEvidenceDigest,
      releaseVerificationDigest: releaseCertification.releaseVerificationDigest,
      releaseCertificationDigest: releaseCertification.safeDigest,
      ledgerRows: [
        { key: "release_evidence", label: "Release evidence pack", ledgerStatus: "verified", safeDigest: releaseCertification.releaseEvidenceDigest, checkedCount: 1, complete: true },
        { key: "release_verification", label: "Release verification matrix", ledgerStatus: "verified", safeDigest: releaseCertification.releaseVerificationDigest, checkedCount: 1, complete: true },
        { key: "release_certification", label: "Release certification receipt", ledgerStatus: "certified", safeDigest: releaseCertification.safeDigest, checkedCount: 1, complete: true },
        { key: "prerequisite_checklist", label: "Prerequisite checklist", ledgerStatus: "complete", safeDigest: releaseCertification.safeDigest, checkedCount: 16, complete: true },
        { key: "certification_checklist", label: "Certification checklist", ledgerStatus: "closed", safeDigest: releaseCertification.safeDigest, checkedCount: 13, complete: true }
      ],
      prerequisiteChecklist: releaseCertification.prerequisiteChecklist,
      certificationChecklist: releaseCertification.certificationChecklist,
      ledgerSummary: {
        ledgerRowCount: 5,
        closedRowCount: 5,
        prerequisiteChecklistComplete: true,
        certificationChecklistComplete: true,
        releaseCertificationDigestPresent: true,
        externalCallsZero: true
      },
      counts: {
        totalItems: releaseCertification.counts.totalItems,
        releaseEvidenceCheckedCount: 1,
        releaseVerificationCheckedCount: 1,
        releaseCertificationCheckedCount: 1,
        closureLedgerCheckedCount: 1,
        prerequisitePassedCount: 16,
        prerequisiteTotalCount: 16,
        certificationChecklistPassedCount: 13,
        certificationChecklistTotalCount: 13,
        ledgerRowCount: 5,
        ledgerClosedRowCount: 5,
        ledgerNeedsReviewRowCount: 0
      },
      externalCalls: 0
    });
    const releaseAttestationAudit = providerWebhookReviewQaHandoffReleaseAttestationAuditSchema.parse({
      attestationKind: "qa-handoff-locked-archive-release-attestation-audit",
      attestationStatus: "complete",
      ledgerStatus: "certified_release_closed",
      certificationStatus: "certified",
      releaseReadinessStatus: "ready_for_release",
      verificationStatus: "verified",
      digestChainStatus: "confirmed",
      safeFilename: "provider-webhook-review-qa-handoff-archive-release-attestation-audit.json",
      safeDigest: "sha256:releaseattestationaudit",
      releaseEvidenceDigest: releaseClosureLedger.releaseEvidenceDigest,
      releaseVerificationDigest: releaseClosureLedger.releaseVerificationDigest,
      releaseCertificationDigest: releaseClosureLedger.releaseCertificationDigest,
      closureLedgerDigest: releaseClosureLedger.safeDigest,
      attestationRows: [
        { key: "closure_ledger", label: "Closure ledger", attestationStatus: "attested", safeDigest: releaseClosureLedger.safeDigest, checkedCount: 1, complete: true },
        { key: "release_evidence_digest", label: "Release evidence digest", attestationStatus: "verified", safeDigest: releaseClosureLedger.releaseEvidenceDigest, checkedCount: 1, complete: true },
        { key: "release_verification_digest", label: "Release verification digest", attestationStatus: "verified", safeDigest: releaseClosureLedger.releaseVerificationDigest, checkedCount: 1, complete: true },
        { key: "release_certification_digest", label: "Release certification digest", attestationStatus: "verified", safeDigest: releaseClosureLedger.releaseCertificationDigest, checkedCount: 1, complete: true },
        { key: "prerequisite_checklist", label: "Prerequisite checklist", attestationStatus: "complete", safeDigest: releaseClosureLedger.safeDigest, checkedCount: 16, complete: true },
        { key: "certification_checklist", label: "Certification checklist", attestationStatus: "complete", safeDigest: releaseClosureLedger.safeDigest, checkedCount: 13, complete: true },
        { key: "external_calls", label: "External calls", attestationStatus: "attested", safeDigest: releaseClosureLedger.safeDigest, checkedCount: 0, complete: true }
      ],
      prerequisiteChecklist: releaseClosureLedger.prerequisiteChecklist,
      certificationChecklist: releaseClosureLedger.certificationChecklist,
      attestationSummary: {
        attestationRowCount: 7,
        attestedRowCount: 7,
        ledgerClosed: true,
        prerequisiteChecklistComplete: true,
        certificationChecklistComplete: true,
        closureLedgerDigestPresent: true,
        externalCallsZero: true
      },
      counts: {
        totalItems: releaseClosureLedger.counts.totalItems,
        releaseEvidenceCheckedCount: 1,
        releaseVerificationCheckedCount: 1,
        releaseCertificationCheckedCount: 1,
        closureLedgerCheckedCount: 1,
        attestationAuditCheckedCount: 1,
        prerequisitePassedCount: 16,
        prerequisiteTotalCount: 16,
        certificationChecklistPassedCount: 13,
        certificationChecklistTotalCount: 13,
        ledgerRowCount: 5,
        ledgerClosedRowCount: 5,
        attestationRowCount: 7,
        attestationAttestedRowCount: 7,
        attestationNeedsReviewRowCount: 0
      },
      externalCalls: 0
    });
    const releaseAttestationReconciliation = providerWebhookReviewQaHandoffReleaseAttestationReconciliationRegisterSchema.parse({
      reconciliationKind: "qa-handoff-locked-archive-release-attestation-reconciliation-register",
      reconciliationStatus: "aligned",
      attestationStatus: "complete",
      ledgerStatus: "certified_release_closed",
      certificationStatus: "certified",
      releaseReadinessStatus: "ready_for_release",
      verificationStatus: "verified",
      digestChainStatus: "confirmed",
      safeFilename: "provider-webhook-review-qa-handoff-archive-release-attestation-reconciliation.json",
      safeDigest: "sha256:releaseattestationreconciliation",
      releaseEvidenceDigest: releaseAttestationAudit.releaseEvidenceDigest,
      verificationDigest: releaseAttestationAudit.releaseVerificationDigest,
      certificationDigest: releaseAttestationAudit.releaseCertificationDigest,
      closureLedgerDigest: releaseAttestationAudit.closureLedgerDigest,
      attestationAuditDigest: releaseAttestationAudit.safeDigest,
      reconciliationDigest: "sha256:releaseattestationreconciliation",
      reconciliationRows: [
        { key: "release_evidence_digest", label: "Release evidence digest", reconciliationStatus: "verified", safeDigest: releaseAttestationAudit.releaseEvidenceDigest, checkedCount: 1, aligned: true },
        { key: "release_verification_digest", label: "Release verification digest", reconciliationStatus: "verified", safeDigest: releaseAttestationAudit.releaseVerificationDigest, checkedCount: 1, aligned: true },
        { key: "release_certification_digest", label: "Release certification digest", reconciliationStatus: "verified", safeDigest: releaseAttestationAudit.releaseCertificationDigest, checkedCount: 1, aligned: true },
        { key: "closure_ledger_digest", label: "Closure ledger digest", reconciliationStatus: "aligned", safeDigest: releaseAttestationAudit.closureLedgerDigest, checkedCount: 1, aligned: true },
        { key: "attestation_audit_digest", label: "Attestation audit digest", reconciliationStatus: "attested", safeDigest: releaseAttestationAudit.safeDigest, checkedCount: 1, aligned: true },
        { key: "prerequisite_checklist", label: "Prerequisite checklist", reconciliationStatus: "complete", safeDigest: releaseAttestationAudit.closureLedgerDigest, checkedCount: 16, aligned: true },
        { key: "certification_checklist", label: "Certification checklist", reconciliationStatus: "complete", safeDigest: releaseAttestationAudit.closureLedgerDigest, checkedCount: 13, aligned: true },
        { key: "external_calls", label: "External calls", reconciliationStatus: "attested", safeDigest: releaseAttestationAudit.safeDigest, checkedCount: 0, aligned: true }
      ],
      exceptionRows: [],
      inheritedPrerequisiteChecklist: releaseAttestationAudit.prerequisiteChecklist,
      inheritedCertificationChecklist: releaseAttestationAudit.certificationChecklist,
      reconciliationSummary: {
        reconciliationRowCount: 8,
        alignedRowCount: 8,
        exceptionRowCount: 0,
        attestationAuditComplete: true,
        closureLedgerClosed: true,
        prerequisiteChecklistComplete: true,
        certificationChecklistComplete: true,
        allDigestsLinked: true,
        externalCallsZero: true
      },
      counts: {
        totalItems: releaseAttestationAudit.counts.totalItems,
        releaseEvidenceCheckedCount: 1,
        releaseVerificationCheckedCount: 1,
        releaseCertificationCheckedCount: 1,
        closureLedgerCheckedCount: 1,
        attestationAuditCheckedCount: 1,
        reconciliationCheckedCount: 1,
        prerequisitePassedCount: 16,
        prerequisiteTotalCount: 16,
        certificationChecklistPassedCount: 13,
        certificationChecklistTotalCount: 13,
        ledgerRowCount: 5,
        ledgerClosedRowCount: 5,
        attestationRowCount: 7,
        attestationAttestedRowCount: 7,
        reconciliationRowCount: 8,
        reconciliationAlignedRowCount: 8,
        reconciliationExceptionRowCount: 0
      },
      externalCalls: 0
    });
    const certifiedReleaseGate = providerWebhookReviewQaHandoffCertifiedReleaseGateSchema.parse({
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
      safeDigest: "sha256:certifiedreleasegate",
      releaseGateDigest: "sha256:certifiedreleasegate",
      reconciliationDigest: releaseAttestationReconciliation.reconciliationDigest,
      attestationAuditDigest: releaseAttestationReconciliation.attestationAuditDigest,
      closureLedgerDigest: releaseAttestationReconciliation.closureLedgerDigest,
      certificationDigest: releaseAttestationReconciliation.certificationDigest,
      verificationDigest: releaseAttestationReconciliation.verificationDigest,
      releaseEvidenceDigest: releaseAttestationReconciliation.releaseEvidenceDigest,
      inheritedPrerequisiteChecklist: releaseAttestationReconciliation.inheritedPrerequisiteChecklist,
      inheritedCertificationChecklist: releaseAttestationReconciliation.inheritedCertificationChecklist,
      inheritedReconciliationSummary: releaseAttestationReconciliation.reconciliationSummary,
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
        totalItems: releaseAttestationReconciliation.counts.totalItems,
        releaseEvidenceCheckedCount: 1,
        releaseVerificationCheckedCount: 1,
        releaseCertificationCheckedCount: 1,
        closureLedgerCheckedCount: 1,
        attestationAuditCheckedCount: 1,
        reconciliationCheckedCount: 1,
        gateCheckedCount: 1,
        prerequisitePassedCount: 16,
        prerequisiteTotalCount: 16,
        certificationChecklistPassedCount: 13,
        certificationChecklistTotalCount: 13,
        reconciliationRowCount: 8,
        reconciliationAlignedRowCount: 8,
        reconciliationExceptionRowCount: 0,
        gateChecklistPassedCount: 12,
        gateChecklistTotalCount: 12,
        blockingReasonCount: 0,
        exceptionRowCount: 0
      },
      externalCalls: 0
    });
    const certifiedReleaseDecisionReceipt = providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptSchema.parse({
      receiptKind: "qa-handoff-locked-archive-certified-release-decision-receipt",
      receiptStatus: "issued",
      releaseDecision: "go",
      gateStatus: "ready",
      goNoGoDecision: "go",
      releaseReadinessStatus: "ready_for_release",
      reconciliationStatus: "aligned",
      attestationStatus: "complete",
      ledgerStatus: "certified_release_closed",
      certificationStatus: "certified",
      verificationStatus: "verified",
      digestChainStatus: "confirmed",
      safeFilename: "provider-webhook-review-qa-handoff-certified-release-decision-receipt.json",
      safeDigest: "sha256:certifiedreleasedecisionreceipt",
      decisionReceiptDigest: "sha256:certifiedreleasedecisionreceipt",
      releaseGateDigest: certifiedReleaseGate.releaseGateDigest,
      reconciliationDigest: certifiedReleaseGate.reconciliationDigest,
      attestationAuditDigest: certifiedReleaseGate.attestationAuditDigest,
      closureLedgerDigest: certifiedReleaseGate.closureLedgerDigest,
      certificationDigest: certifiedReleaseGate.certificationDigest,
      verificationDigest: certifiedReleaseGate.verificationDigest,
      releaseEvidenceDigest: certifiedReleaseGate.releaseEvidenceDigest,
      inheritedPrerequisiteChecklist: certifiedReleaseGate.inheritedPrerequisiteChecklist,
      inheritedCertificationChecklist: certifiedReleaseGate.inheritedCertificationChecklist,
      inheritedGateChecklist: certifiedReleaseGate.gateChecklist,
      inheritedReconciliationSummary: certifiedReleaseGate.inheritedReconciliationSummary,
      inheritedBlockingReasons: certifiedReleaseGate.blockingReasons,
      inheritedExceptionRows: certifiedReleaseGate.exceptionRows,
      receiptRows: [
        { key: "release_gate", label: "Certified release gate", receiptRowStatus: "confirmed", safeDigest: certifiedReleaseGate.releaseGateDigest, checkedCount: 1, complete: true },
        { key: "release_decision", label: "GO release decision", receiptRowStatus: "issued", safeDigest: certifiedReleaseGate.releaseGateDigest, checkedCount: 1, complete: true },
        { key: "release_readiness", label: "Release readiness", receiptRowStatus: "confirmed", safeDigest: certifiedReleaseGate.releaseEvidenceDigest, checkedCount: 1, complete: true },
        { key: "reconciliation", label: "Attestation reconciliation", receiptRowStatus: "confirmed", safeDigest: certifiedReleaseGate.reconciliationDigest, checkedCount: 1, complete: true },
        { key: "attestation", label: "Attestation audit", receiptRowStatus: "confirmed", safeDigest: certifiedReleaseGate.attestationAuditDigest, checkedCount: 1, complete: true },
        { key: "closure_ledger", label: "Closure ledger", receiptRowStatus: "confirmed", safeDigest: certifiedReleaseGate.closureLedgerDigest, checkedCount: 1, complete: true },
        { key: "certification", label: "Release certification", receiptRowStatus: "confirmed", safeDigest: certifiedReleaseGate.certificationDigest, checkedCount: 1, complete: true },
        { key: "verification", label: "Release verification", receiptRowStatus: "confirmed", safeDigest: certifiedReleaseGate.verificationDigest, checkedCount: 1, complete: true },
        { key: "digest_chain", label: "Digest chain", receiptRowStatus: "confirmed", safeDigest: certifiedReleaseGate.reconciliationDigest, checkedCount: 1, complete: true },
        { key: "prerequisite_checklist", label: "Prerequisite checklist", receiptRowStatus: "confirmed", safeDigest: certifiedReleaseGate.releaseEvidenceDigest, checkedCount: 16, complete: true },
        { key: "certification_checklist", label: "Certification checklist", receiptRowStatus: "confirmed", safeDigest: certifiedReleaseGate.certificationDigest, checkedCount: 13, complete: true },
        { key: "gate_checklist", label: "Release gate checklist", receiptRowStatus: "confirmed", safeDigest: certifiedReleaseGate.releaseGateDigest, checkedCount: 12, complete: true },
        { key: "external_calls", label: "External calls", receiptRowStatus: "confirmed", safeDigest: certifiedReleaseGate.releaseGateDigest, checkedCount: 0, complete: true }
      ],
      receiptSummary: {
        receiptRowCount: 13,
        completeReceiptRowCount: 13,
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
        totalItems: certifiedReleaseGate.counts.totalItems,
        releaseEvidenceCheckedCount: 1,
        releaseVerificationCheckedCount: 1,
        releaseCertificationCheckedCount: 1,
        closureLedgerCheckedCount: 1,
        attestationAuditCheckedCount: 1,
        reconciliationCheckedCount: 1,
        gateCheckedCount: 1,
        decisionReceiptCheckedCount: 1,
        prerequisitePassedCount: 16,
        prerequisiteTotalCount: 16,
        certificationChecklistPassedCount: 13,
        certificationChecklistTotalCount: 13,
        reconciliationRowCount: 8,
        reconciliationAlignedRowCount: 8,
        reconciliationExceptionRowCount: 0,
        gateChecklistPassedCount: 12,
        gateChecklistTotalCount: 12,
        blockingReasonCount: 0,
        exceptionRowCount: 0,
        receiptRowCount: 13,
        receiptRowCompleteCount: 13
      },
      externalCalls: 0
    });
    const certifiedReleaseHandoffPacket = providerWebhookReviewQaHandoffCertifiedReleaseHandoffPacketSchema.parse({
      packetKind: "qa-handoff-locked-archive-certified-release-handoff-packet",
      packetStatus: "issued",
      handoffStatus: "ready",
      releaseDecision: "go",
      receiptStatus: "issued",
      gateStatus: "ready",
      goNoGoDecision: "go",
      releaseReadinessStatus: "ready_for_release",
      reconciliationStatus: "aligned",
      attestationStatus: "complete",
      ledgerStatus: "certified_release_closed",
      certificationStatus: "certified",
      verificationStatus: "verified",
      digestChainStatus: "confirmed",
      safeFilename: "provider-webhook-review-qa-handoff-certified-release-handoff-packet.json",
      safeDigest: "sha256:certifiedreleasehandoffpacket",
      handoffPacketDigest: "sha256:certifiedreleasehandoffpacket",
      decisionReceiptDigest: certifiedReleaseDecisionReceipt.decisionReceiptDigest,
      releaseGateDigest: certifiedReleaseDecisionReceipt.releaseGateDigest,
      reconciliationDigest: certifiedReleaseDecisionReceipt.reconciliationDigest,
      attestationAuditDigest: certifiedReleaseDecisionReceipt.attestationAuditDigest,
      closureLedgerDigest: certifiedReleaseDecisionReceipt.closureLedgerDigest,
      certificationDigest: certifiedReleaseDecisionReceipt.certificationDigest,
      verificationDigest: certifiedReleaseDecisionReceipt.verificationDigest,
      releaseEvidenceDigest: certifiedReleaseDecisionReceipt.releaseEvidenceDigest,
      inheritedPrerequisiteChecklist: certifiedReleaseDecisionReceipt.inheritedPrerequisiteChecklist,
      inheritedCertificationChecklist: certifiedReleaseDecisionReceipt.inheritedCertificationChecklist,
      inheritedGateChecklist: certifiedReleaseDecisionReceipt.inheritedGateChecklist,
      inheritedDecisionReceiptSummary: certifiedReleaseDecisionReceipt.receiptSummary,
      inheritedReconciliationSummary: certifiedReleaseDecisionReceipt.inheritedReconciliationSummary,
      inheritedBlockingReasons: certifiedReleaseDecisionReceipt.inheritedBlockingReasons,
      inheritedExceptionRows: certifiedReleaseDecisionReceipt.inheritedExceptionRows,
      handoffRows: [
        { key: "decision_receipt", label: "Certified release decision receipt", handoffRowStatus: "ready", safeDigest: certifiedReleaseDecisionReceipt.decisionReceiptDigest, checkedCount: 1, complete: true },
        { key: "release_gate", label: "Certified release gate", handoffRowStatus: "confirmed", safeDigest: certifiedReleaseDecisionReceipt.releaseGateDigest, checkedCount: 1, complete: true },
        { key: "release_decision", label: "GO release decision", handoffRowStatus: "ready", safeDigest: certifiedReleaseDecisionReceipt.decisionReceiptDigest, checkedCount: 1, complete: true },
        { key: "release_readiness", label: "Release readiness", handoffRowStatus: "confirmed", safeDigest: certifiedReleaseDecisionReceipt.releaseEvidenceDigest, checkedCount: 1, complete: true },
        { key: "reconciliation", label: "Attestation reconciliation", handoffRowStatus: "confirmed", safeDigest: certifiedReleaseDecisionReceipt.reconciliationDigest, checkedCount: 1, complete: true },
        { key: "attestation", label: "Attestation audit", handoffRowStatus: "confirmed", safeDigest: certifiedReleaseDecisionReceipt.attestationAuditDigest, checkedCount: 1, complete: true },
        { key: "closure_ledger", label: "Closure ledger", handoffRowStatus: "confirmed", safeDigest: certifiedReleaseDecisionReceipt.closureLedgerDigest, checkedCount: 1, complete: true },
        { key: "certification", label: "Release certification", handoffRowStatus: "confirmed", safeDigest: certifiedReleaseDecisionReceipt.certificationDigest, checkedCount: 1, complete: true },
        { key: "verification", label: "Release verification", handoffRowStatus: "confirmed", safeDigest: certifiedReleaseDecisionReceipt.verificationDigest, checkedCount: 1, complete: true },
        { key: "digest_chain", label: "Digest chain", handoffRowStatus: "confirmed", safeDigest: certifiedReleaseDecisionReceipt.reconciliationDigest, checkedCount: 1, complete: true },
        { key: "prerequisite_checklist", label: "Prerequisite checklist", handoffRowStatus: "confirmed", safeDigest: certifiedReleaseDecisionReceipt.releaseEvidenceDigest, checkedCount: 16, complete: true },
        { key: "certification_checklist", label: "Certification checklist", handoffRowStatus: "confirmed", safeDigest: certifiedReleaseDecisionReceipt.certificationDigest, checkedCount: 13, complete: true },
        { key: "gate_checklist", label: "Release gate checklist", handoffRowStatus: "confirmed", safeDigest: certifiedReleaseDecisionReceipt.releaseGateDigest, checkedCount: 12, complete: true },
        { key: "blocking_reasons", label: "Blocking reasons", handoffRowStatus: "confirmed", safeDigest: certifiedReleaseDecisionReceipt.decisionReceiptDigest, checkedCount: 0, complete: true },
        { key: "exceptions", label: "Exception rows", handoffRowStatus: "confirmed", safeDigest: certifiedReleaseDecisionReceipt.reconciliationDigest, checkedCount: 0, complete: true },
        { key: "external_calls", label: "External calls", handoffRowStatus: "confirmed", safeDigest: certifiedReleaseDecisionReceipt.decisionReceiptDigest, checkedCount: 0, complete: true }
      ],
      runbookRows: [
        { key: "confirm_decision_receipt", label: "Confirm certified decision receipt", runbookStatus: "ready", safeDigest: certifiedReleaseDecisionReceipt.decisionReceiptDigest, ownerRole: "release owner", complete: true },
        { key: "confirm_release_gate", label: "Confirm certified release gate", runbookStatus: "ready", safeDigest: certifiedReleaseDecisionReceipt.releaseGateDigest, ownerRole: "release owner", complete: true },
        { key: "confirm_operator_checklist", label: "Confirm operator checklist", runbookStatus: "ready", safeDigest: certifiedReleaseDecisionReceipt.decisionReceiptDigest, ownerRole: "operator", complete: true },
        { key: "release_handoff", label: "Proceed with safe release handoff", runbookStatus: "ready", safeDigest: certifiedReleaseDecisionReceipt.decisionReceiptDigest, ownerRole: "release owner", complete: true },
        { key: "monitor_release", label: "Monitor safe release evidence", runbookStatus: "ready", safeDigest: certifiedReleaseDecisionReceipt.releaseEvidenceDigest, ownerRole: "operator", complete: true },
        { key: "exception_hold", label: "Hold release on blocking exceptions", runbookStatus: "ready", safeDigest: certifiedReleaseDecisionReceipt.reconciliationDigest, ownerRole: "release owner", complete: true }
      ],
      operatorChecklist: [
        { key: "decision_receipt_issued", label: "Decision receipt issued", checklistStatus: "complete", safeDigest: certifiedReleaseDecisionReceipt.decisionReceiptDigest, complete: true },
        { key: "release_gate_ready", label: "Release gate ready", checklistStatus: "complete", safeDigest: certifiedReleaseDecisionReceipt.releaseGateDigest, complete: true },
        { key: "no_blocking_reasons", label: "No blocking reasons", checklistStatus: "complete", safeDigest: certifiedReleaseDecisionReceipt.decisionReceiptDigest, complete: true },
        { key: "no_exceptions", label: "No exception rows", checklistStatus: "complete", safeDigest: certifiedReleaseDecisionReceipt.reconciliationDigest, complete: true },
        { key: "external_calls_zero", label: "External calls zero", checklistStatus: "complete", safeDigest: certifiedReleaseDecisionReceipt.decisionReceiptDigest, complete: true },
        { key: "provider_outbound_absent", label: "Provider outbound absent", checklistStatus: "complete", safeDigest: certifiedReleaseDecisionReceipt.decisionReceiptDigest, complete: true },
        { key: "source_material_absent", label: "Sensitive source material absent", checklistStatus: "complete", safeDigest: certifiedReleaseDecisionReceipt.decisionReceiptDigest, complete: true }
      ],
      releaseOwnerSummary: {
        ownerRole: "release owner",
        handoffReady: true,
        releaseDecisionGo: true,
        blockingReasonCount: 0,
        exceptionRowCount: 0,
        externalCallsZero: true,
        safeDigest: certifiedReleaseDecisionReceipt.decisionReceiptDigest
      },
      counts: {
        ...certifiedReleaseDecisionReceipt.counts,
        handoffPacketCheckedCount: 1,
        handoffRowCount: 16,
        handoffRowCompleteCount: 16,
        runbookRowCount: 6,
        runbookRowReadyCount: 6,
        operatorChecklistItemCount: 7,
        operatorChecklistCompleteCount: 7
      },
      externalCalls: 0
    });
    const certifiedReleaseHandoffAcceptanceRecord = providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordSchema.parse({
      acceptanceKind: "qa-handoff-locked-archive-certified-release-handoff-acceptance-record",
      acceptanceStatus: "acknowledged",
      handoffStatus: "ready",
      releaseDecision: "go",
      packetStatus: "issued",
      receiptStatus: "issued",
      gateStatus: "ready",
      goNoGoDecision: "go",
      releaseReadinessStatus: "ready_for_release",
      reconciliationStatus: "aligned",
      attestationStatus: "complete",
      ledgerStatus: "certified_release_closed",
      certificationStatus: "certified",
      verificationStatus: "verified",
      digestChainStatus: "confirmed",
      safeFilename: "provider-webhook-review-qa-handoff-certified-release-handoff-acceptance-record.json",
      safeDigest: "sha256:certifiedreleasehandoffacceptance",
      acceptanceRecordDigest: "sha256:certifiedreleasehandoffacceptance",
      handoffPacketDigest: certifiedReleaseHandoffPacket.handoffPacketDigest,
      decisionReceiptDigest: certifiedReleaseHandoffPacket.decisionReceiptDigest,
      releaseGateDigest: certifiedReleaseHandoffPacket.releaseGateDigest,
      reconciliationDigest: certifiedReleaseHandoffPacket.reconciliationDigest,
      attestationAuditDigest: certifiedReleaseHandoffPacket.attestationAuditDigest,
      closureLedgerDigest: certifiedReleaseHandoffPacket.closureLedgerDigest,
      certificationDigest: certifiedReleaseHandoffPacket.certificationDigest,
      verificationDigest: certifiedReleaseHandoffPacket.verificationDigest,
      releaseEvidenceDigest: certifiedReleaseHandoffPacket.releaseEvidenceDigest,
      operatorChecklist: certifiedReleaseHandoffPacket.operatorChecklist,
      acknowledgedChecklist: certifiedReleaseHandoffPacket.operatorChecklist.map((item) => ({
        key: item.key,
        label: item.label,
        acknowledgementStatus: "acknowledged" as const,
        safeDigest: item.safeDigest,
        acknowledged: true
      })),
      acknowledgementRows: [
        { key: "handoff_packet", label: "Handoff packet", acknowledgementStatus: "acknowledged", safeDigest: certifiedReleaseHandoffPacket.handoffPacketDigest, checkedCount: 1, complete: true },
        { key: "operator_checklist", label: "Operator checklist", acknowledgementStatus: "acknowledged", safeDigest: certifiedReleaseHandoffPacket.handoffPacketDigest, checkedCount: 7, complete: true },
        { key: "release_owner", label: "Release owner acknowledgement", acknowledgementStatus: "acknowledged", safeDigest: certifiedReleaseHandoffPacket.handoffPacketDigest, checkedCount: 1, complete: true },
        { key: "external_calls", label: "External calls", acknowledgementStatus: "acknowledged", safeDigest: certifiedReleaseHandoffPacket.handoffPacketDigest, checkedCount: 0, complete: true },
        { key: "safe_source_material", label: "Sensitive source material", acknowledgementStatus: "acknowledged", safeDigest: certifiedReleaseHandoffPacket.handoffPacketDigest, checkedCount: 1, complete: true },
        { key: "blocking_reasons", label: "Blocking reasons", acknowledgementStatus: "acknowledged", safeDigest: certifiedReleaseHandoffPacket.handoffPacketDigest, checkedCount: 0, complete: true },
        { key: "exceptions", label: "Exception rows", acknowledgementStatus: "acknowledged", safeDigest: certifiedReleaseHandoffPacket.reconciliationDigest, checkedCount: 0, complete: true }
      ],
      releaseOwnerSummary: {
        ownerRole: "release owner",
        acknowledgedByRole: "release owner",
        acknowledgedByLabel: "safe release owner",
        handoffReady: true,
        releaseDecisionGo: true,
        operatorChecklistAcknowledged: true,
        blockingReasonCount: 0,
        exceptionRowCount: 0,
        externalCallsZero: true,
        safeDigest: certifiedReleaseHandoffPacket.handoffPacketDigest
      },
      inheritedPrerequisiteChecklist: certifiedReleaseHandoffPacket.inheritedPrerequisiteChecklist,
      inheritedCertificationChecklist: certifiedReleaseHandoffPacket.inheritedCertificationChecklist,
      inheritedGateChecklist: certifiedReleaseHandoffPacket.inheritedGateChecklist,
      inheritedDecisionReceiptSummary: certifiedReleaseHandoffPacket.inheritedDecisionReceiptSummary,
      inheritedHandoffPacketSummary: {
        packetStatus: "issued",
        handoffStatus: "ready",
        releaseDecision: "go",
        handoffRowCount: 16,
        handoffRowCompleteCount: 16,
        runbookRowCount: 6,
        runbookRowReadyCount: 6,
        operatorChecklistItemCount: 7,
        operatorChecklistCompleteCount: 7,
        externalCallsZero: true
      },
      inheritedBlockingReasons: certifiedReleaseHandoffPacket.inheritedBlockingReasons,
      inheritedExceptionRows: certifiedReleaseHandoffPacket.inheritedExceptionRows,
      counts: {
        ...certifiedReleaseHandoffPacket.counts,
        acceptanceRecordCheckedCount: 1,
        acceptanceRecordMutationCount: 1,
        acknowledgedChecklistItemCount: 7,
        acknowledgedChecklistCompleteCount: 7,
        acknowledgementRowCount: 7,
        acknowledgementRowCompleteCount: 7
      },
      externalCalls: 0
    });
    const noopExecutionDryRunRequest = providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunRequestSchema.parse({
      requestedBy: "safe release owner",
      checklistAcknowledged: true,
      operatorNote: "safe no-op dry-run note",
      dryRunReason: "safe no-op execution readiness rehearsal",
      executionMode: "no_op"
    });
    const certifiedReleaseNoopExecutionDryRun = providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunSchema.parse({
      dryRunKind: "qa-handoff-locked-archive-certified-release-noop-execution-dryrun",
      dryRunStatus: "passed",
      executionMode: noopExecutionDryRunRequest.executionMode,
      acceptanceStatus: certifiedReleaseHandoffAcceptanceRecord.acceptanceStatus,
      handoffStatus: certifiedReleaseHandoffAcceptanceRecord.handoffStatus,
      releaseDecision: certifiedReleaseHandoffAcceptanceRecord.releaseDecision,
      packetStatus: certifiedReleaseHandoffAcceptanceRecord.packetStatus,
      receiptStatus: certifiedReleaseHandoffAcceptanceRecord.receiptStatus,
      gateStatus: certifiedReleaseHandoffAcceptanceRecord.gateStatus,
      goNoGoDecision: certifiedReleaseHandoffAcceptanceRecord.goNoGoDecision,
      releaseReadinessStatus: certifiedReleaseHandoffAcceptanceRecord.releaseReadinessStatus,
      reconciliationStatus: certifiedReleaseHandoffAcceptanceRecord.reconciliationStatus,
      attestationStatus: certifiedReleaseHandoffAcceptanceRecord.attestationStatus,
      ledgerStatus: certifiedReleaseHandoffAcceptanceRecord.ledgerStatus,
      certificationStatus: certifiedReleaseHandoffAcceptanceRecord.certificationStatus,
      verificationStatus: certifiedReleaseHandoffAcceptanceRecord.verificationStatus,
      digestChainStatus: certifiedReleaseHandoffAcceptanceRecord.digestChainStatus,
      safeFilename: "provider-webhook-review-qa-handoff-certified-release-noop-execution-dryrun.json",
      safeDigest: "sha256:certifiedreleasenoopdryrun",
      noopExecutionDryRunDigest: "sha256:certifiedreleasenoopdryrun",
      acceptanceRecordDigest: certifiedReleaseHandoffAcceptanceRecord.acceptanceRecordDigest,
      handoffPacketDigest: certifiedReleaseHandoffAcceptanceRecord.handoffPacketDigest,
      decisionReceiptDigest: certifiedReleaseHandoffAcceptanceRecord.decisionReceiptDigest,
      releaseGateDigest: certifiedReleaseHandoffAcceptanceRecord.releaseGateDigest,
      reconciliationDigest: certifiedReleaseHandoffAcceptanceRecord.reconciliationDigest,
      attestationAuditDigest: certifiedReleaseHandoffAcceptanceRecord.attestationAuditDigest,
      closureLedgerDigest: certifiedReleaseHandoffAcceptanceRecord.closureLedgerDigest,
      certificationDigest: certifiedReleaseHandoffAcceptanceRecord.certificationDigest,
      verificationDigest: certifiedReleaseHandoffAcceptanceRecord.verificationDigest,
      releaseEvidenceDigest: certifiedReleaseHandoffAcceptanceRecord.releaseEvidenceDigest,
      operatorChecklist: certifiedReleaseHandoffAcceptanceRecord.operatorChecklist,
      acknowledgedChecklist: certifiedReleaseHandoffAcceptanceRecord.acknowledgedChecklist,
      executionChecklist: [
        { key: "acceptance_record_acknowledged", label: "Acceptance record acknowledged", checklistStatus: "complete", safeDigest: certifiedReleaseHandoffAcceptanceRecord.acceptanceRecordDigest, complete: true },
        { key: "handoff_ready", label: "Handoff ready", checklistStatus: "complete", safeDigest: certifiedReleaseHandoffAcceptanceRecord.handoffPacketDigest, complete: true },
        { key: "release_decision_go", label: "Release decision go", checklistStatus: "complete", safeDigest: certifiedReleaseHandoffAcceptanceRecord.decisionReceiptDigest, complete: true },
        { key: "execution_mode_no_op", label: "Execution mode no-op", checklistStatus: "complete", safeDigest: certifiedReleaseHandoffAcceptanceRecord.acceptanceRecordDigest, complete: true },
        { key: "external_calls_zero", label: "External calls zero", checklistStatus: "complete", safeDigest: certifiedReleaseHandoffAcceptanceRecord.acceptanceRecordDigest, complete: true },
        { key: "provider_outbound_absent", label: "Provider outbound absent", checklistStatus: "complete", safeDigest: certifiedReleaseHandoffAcceptanceRecord.acceptanceRecordDigest, complete: true },
        { key: "notification_send_absent", label: "External notification sending absent", checklistStatus: "complete", safeDigest: certifiedReleaseHandoffAcceptanceRecord.acceptanceRecordDigest, complete: true },
        { key: "source_material_absent", label: "Sensitive source material absent", checklistStatus: "complete", safeDigest: certifiedReleaseHandoffAcceptanceRecord.acceptanceRecordDigest, complete: true }
      ],
      dryRunRows: [
        { key: "acceptance_record", label: "Acceptance record", dryRunRowStatus: "passed", safeDigest: certifiedReleaseHandoffAcceptanceRecord.acceptanceRecordDigest, checkedCount: 1, complete: true },
        { key: "handoff_packet", label: "Handoff packet", dryRunRowStatus: "passed", safeDigest: certifiedReleaseHandoffAcceptanceRecord.handoffPacketDigest, checkedCount: 1, complete: true }
      ],
      executionPlanRows: [
        { key: "plan_scope", label: "Certified release readiness check", planStatus: "ready", safeDigest: certifiedReleaseHandoffAcceptanceRecord.acceptanceRecordDigest, checkedCount: 1, complete: true },
        { key: "release_execution", label: "Release execution", planStatus: "no_op", safeDigest: certifiedReleaseHandoffAcceptanceRecord.acceptanceRecordDigest, checkedCount: 0, complete: true },
        { key: "provider_outbound", label: "Provider outbound", planStatus: "no_op", safeDigest: certifiedReleaseHandoffAcceptanceRecord.acceptanceRecordDigest, checkedCount: 0, complete: true },
        { key: "external_notifications", label: "External notifications", planStatus: "no_op", safeDigest: certifiedReleaseHandoffAcceptanceRecord.acceptanceRecordDigest, checkedCount: 0, complete: true },
        { key: "automation_calls", label: "Automation calls", planStatus: "no_op", safeDigest: certifiedReleaseHandoffAcceptanceRecord.acceptanceRecordDigest, checkedCount: 0, complete: true },
        { key: "state_mutation", label: "Release state mutation", planStatus: "no_op", safeDigest: certifiedReleaseHandoffAcceptanceRecord.acceptanceRecordDigest, checkedCount: 0, complete: true },
        { key: "readback", label: "Safe readback", planStatus: "ready", safeDigest: certifiedReleaseHandoffAcceptanceRecord.acceptanceRecordDigest, checkedCount: 1, complete: true }
      ],
      releaseOwnerSummary: {
        ...certifiedReleaseHandoffAcceptanceRecord.releaseOwnerSummary,
        requestedBy: noopExecutionDryRunRequest.requestedBy,
        checklistAcknowledged: true,
        dryRunReason: noopExecutionDryRunRequest.dryRunReason,
        executionModeNoOp: true
      },
      inheritedPrerequisiteChecklist: certifiedReleaseHandoffAcceptanceRecord.inheritedPrerequisiteChecklist,
      inheritedCertificationChecklist: certifiedReleaseHandoffAcceptanceRecord.inheritedCertificationChecklist,
      inheritedGateChecklist: certifiedReleaseHandoffAcceptanceRecord.inheritedGateChecklist,
      inheritedDecisionReceiptSummary: certifiedReleaseHandoffAcceptanceRecord.inheritedDecisionReceiptSummary,
      inheritedHandoffPacketSummary: certifiedReleaseHandoffAcceptanceRecord.inheritedHandoffPacketSummary,
      inheritedAcceptanceSummary: {
        acceptanceStatus: certifiedReleaseHandoffAcceptanceRecord.acceptanceStatus,
        handoffStatus: certifiedReleaseHandoffAcceptanceRecord.handoffStatus,
        releaseDecision: certifiedReleaseHandoffAcceptanceRecord.releaseDecision,
        operatorChecklistAcknowledged: true,
        acknowledgedChecklistItemCount: 7,
        acknowledgedChecklistCompleteCount: 7,
        acknowledgementRowCount: 7,
        acknowledgementRowCompleteCount: 7,
        externalCallsZero: true
      },
      inheritedBlockingReasons: certifiedReleaseHandoffAcceptanceRecord.inheritedBlockingReasons,
      inheritedExceptionRows: certifiedReleaseHandoffAcceptanceRecord.inheritedExceptionRows,
      counts: {
        ...certifiedReleaseHandoffAcceptanceRecord.counts,
        noopExecutionDryRunCheckedCount: 1,
        noopExecutionDryRunMutationCount: 1,
        executionChecklistItemCount: 8,
        executionChecklistCompleteCount: 8,
        dryRunRowCount: 2,
        dryRunRowPassedCount: 2,
        executionPlanRowCount: 7,
        executionPlanReadyCount: 7
      },
      externalCalls: 0
    });
    const certifiedReleaseDryRunResultLedger = providerWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerSchema.parse({
      ledgerKind: "qa-handoff-locked-archive-certified-release-dryrun-result-ledger",
      ledgerStatus: "recorded",
      dryRunStatus: certifiedReleaseNoopExecutionDryRun.dryRunStatus,
      executionMode: certifiedReleaseNoopExecutionDryRun.executionMode,
      acceptanceStatus: certifiedReleaseNoopExecutionDryRun.acceptanceStatus,
      handoffStatus: certifiedReleaseNoopExecutionDryRun.handoffStatus,
      releaseDecision: certifiedReleaseNoopExecutionDryRun.releaseDecision,
      packetStatus: certifiedReleaseNoopExecutionDryRun.packetStatus,
      receiptStatus: certifiedReleaseNoopExecutionDryRun.receiptStatus,
      gateStatus: certifiedReleaseNoopExecutionDryRun.gateStatus,
      goNoGoDecision: certifiedReleaseNoopExecutionDryRun.goNoGoDecision,
      releaseReadinessStatus: certifiedReleaseNoopExecutionDryRun.releaseReadinessStatus,
      reconciliationStatus: certifiedReleaseNoopExecutionDryRun.reconciliationStatus,
      attestationStatus: certifiedReleaseNoopExecutionDryRun.attestationStatus,
      ledgerStatusFromClosure: certifiedReleaseNoopExecutionDryRun.ledgerStatus,
      certificationStatus: certifiedReleaseNoopExecutionDryRun.certificationStatus,
      verificationStatus: certifiedReleaseNoopExecutionDryRun.verificationStatus,
      digestChainStatus: certifiedReleaseNoopExecutionDryRun.digestChainStatus,
      safeFilename: "provider-webhook-review-qa-handoff-certified-release-dryrun-result-ledger.json",
      safeDigest: "sha256:certifiedreleasedryrunresultledger",
      dryRunResultLedgerDigest: "sha256:certifiedreleasedryrunresultledger",
      noopExecutionDryRunDigest: certifiedReleaseNoopExecutionDryRun.noopExecutionDryRunDigest,
      acceptanceRecordDigest: certifiedReleaseNoopExecutionDryRun.acceptanceRecordDigest,
      handoffPacketDigest: certifiedReleaseNoopExecutionDryRun.handoffPacketDigest,
      decisionReceiptDigest: certifiedReleaseNoopExecutionDryRun.decisionReceiptDigest,
      releaseGateDigest: certifiedReleaseNoopExecutionDryRun.releaseGateDigest,
      reconciliationDigest: certifiedReleaseNoopExecutionDryRun.reconciliationDigest,
      attestationAuditDigest: certifiedReleaseNoopExecutionDryRun.attestationAuditDigest,
      closureLedgerDigest: certifiedReleaseNoopExecutionDryRun.closureLedgerDigest,
      certificationDigest: certifiedReleaseNoopExecutionDryRun.certificationDigest,
      verificationDigest: certifiedReleaseNoopExecutionDryRun.verificationDigest,
      releaseEvidenceDigest: certifiedReleaseNoopExecutionDryRun.releaseEvidenceDigest,
      operatorChecklist: certifiedReleaseNoopExecutionDryRun.operatorChecklist,
      acknowledgedChecklist: certifiedReleaseNoopExecutionDryRun.acknowledgedChecklist,
      executionChecklist: certifiedReleaseNoopExecutionDryRun.executionChecklist,
      dryRunRows: certifiedReleaseNoopExecutionDryRun.dryRunRows,
      executionPlanRows: certifiedReleaseNoopExecutionDryRun.executionPlanRows,
      resultLedgerRows: [
        { key: "noop_execution_dryrun", label: "No-op execution dry-run", rowStatus: "recorded", safeDigest: certifiedReleaseNoopExecutionDryRun.noopExecutionDryRunDigest, checkedCount: 1, complete: true },
        { key: "acceptance_record", label: "Acceptance record", rowStatus: "recorded", safeDigest: certifiedReleaseNoopExecutionDryRun.acceptanceRecordDigest, checkedCount: 1, complete: true },
        { key: "external_calls", label: "External calls", rowStatus: "recorded", safeDigest: certifiedReleaseNoopExecutionDryRun.acceptanceRecordDigest, checkedCount: 0, complete: true }
      ],
      finalReadinessRows: [
        { key: "dryrun_passed", label: "Dry-run passed", readinessStatus: "ready", safeDigest: certifiedReleaseNoopExecutionDryRun.noopExecutionDryRunDigest, checkedCount: 1, complete: true },
        { key: "execution_mode_no_op", label: "Execution mode no-op", readinessStatus: "ready", safeDigest: certifiedReleaseNoopExecutionDryRun.noopExecutionDryRunDigest, checkedCount: 1, complete: true },
        { key: "external_calls_zero", label: "External calls zero", readinessStatus: "ready", safeDigest: certifiedReleaseNoopExecutionDryRun.noopExecutionDryRunDigest, checkedCount: 0, complete: true }
      ],
      releaseOwnerSummary: certifiedReleaseNoopExecutionDryRun.releaseOwnerSummary,
      inheritedPrerequisiteChecklist: certifiedReleaseNoopExecutionDryRun.inheritedPrerequisiteChecklist,
      inheritedCertificationChecklist: certifiedReleaseNoopExecutionDryRun.inheritedCertificationChecklist,
      inheritedGateChecklist: certifiedReleaseNoopExecutionDryRun.inheritedGateChecklist,
      inheritedDecisionReceiptSummary: certifiedReleaseNoopExecutionDryRun.inheritedDecisionReceiptSummary,
      inheritedHandoffPacketSummary: certifiedReleaseNoopExecutionDryRun.inheritedHandoffPacketSummary,
      inheritedAcceptanceSummary: certifiedReleaseNoopExecutionDryRun.inheritedAcceptanceSummary,
      inheritedNoopDryRunSummary: {
        dryRunStatus: certifiedReleaseNoopExecutionDryRun.dryRunStatus,
        executionMode: certifiedReleaseNoopExecutionDryRun.executionMode,
        acceptanceStatus: certifiedReleaseNoopExecutionDryRun.acceptanceStatus,
        handoffStatus: certifiedReleaseNoopExecutionDryRun.handoffStatus,
        releaseDecision: certifiedReleaseNoopExecutionDryRun.releaseDecision,
        checklistAcknowledged: certifiedReleaseNoopExecutionDryRun.releaseOwnerSummary.checklistAcknowledged,
        dryRunRowCount: certifiedReleaseNoopExecutionDryRun.counts.dryRunRowCount,
        dryRunRowPassedCount: certifiedReleaseNoopExecutionDryRun.counts.dryRunRowPassedCount,
        executionPlanRowCount: certifiedReleaseNoopExecutionDryRun.counts.executionPlanRowCount,
        executionPlanReadyCount: certifiedReleaseNoopExecutionDryRun.counts.executionPlanReadyCount,
        externalCallsZero: true,
        safeDigest: certifiedReleaseNoopExecutionDryRun.safeDigest
      },
      inheritedBlockingReasons: certifiedReleaseNoopExecutionDryRun.inheritedBlockingReasons,
      inheritedExceptionRows: certifiedReleaseNoopExecutionDryRun.inheritedExceptionRows,
      counts: {
        ...certifiedReleaseNoopExecutionDryRun.counts,
        dryRunResultLedgerCheckedCount: 1,
        dryRunResultLedgerMutationCount: 0,
        resultLedgerRowCount: 3,
        resultLedgerRowRecordedCount: 3,
        finalReadinessRowCount: 3,
        finalReadinessReadyCount: 3
      },
      externalCalls: 0
    });

    const certifiedReleaseFinalReadinessCertificate = providerWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificateSchema.parse({
      certificateKind: "qa-handoff-locked-archive-certified-release-final-readiness-certificate",
      certificateStatus: "issued",
      finalReadinessStatus: "ready",
      ledgerStatus: certifiedReleaseDryRunResultLedger.ledgerStatus,
      dryRunStatus: certifiedReleaseDryRunResultLedger.dryRunStatus,
      executionMode: certifiedReleaseDryRunResultLedger.executionMode,
      acceptanceStatus: certifiedReleaseDryRunResultLedger.acceptanceStatus,
      handoffStatus: certifiedReleaseDryRunResultLedger.handoffStatus,
      releaseDecision: certifiedReleaseDryRunResultLedger.releaseDecision,
      packetStatus: certifiedReleaseDryRunResultLedger.packetStatus,
      receiptStatus: certifiedReleaseDryRunResultLedger.receiptStatus,
      gateStatus: certifiedReleaseDryRunResultLedger.gateStatus,
      goNoGoDecision: certifiedReleaseDryRunResultLedger.goNoGoDecision,
      releaseReadinessStatus: certifiedReleaseDryRunResultLedger.releaseReadinessStatus,
      reconciliationStatus: certifiedReleaseDryRunResultLedger.reconciliationStatus,
      attestationStatus: certifiedReleaseDryRunResultLedger.attestationStatus,
      ledgerStatusFromClosure: certifiedReleaseDryRunResultLedger.ledgerStatusFromClosure,
      certificationStatus: certifiedReleaseDryRunResultLedger.certificationStatus,
      verificationStatus: certifiedReleaseDryRunResultLedger.verificationStatus,
      digestChainStatus: certifiedReleaseDryRunResultLedger.digestChainStatus,
      safeFilename: "provider-webhook-review-qa-handoff-certified-release-final-readiness-certificate.json",
      safeDigest: "sha256:certifiedreleasefinalreadinesscertificate",
      finalReadinessCertificateDigest: "sha256:certifiedreleasefinalreadinesscertificate",
      dryRunResultLedgerDigest: certifiedReleaseDryRunResultLedger.dryRunResultLedgerDigest,
      noopExecutionDryRunDigest: certifiedReleaseDryRunResultLedger.noopExecutionDryRunDigest,
      acceptanceRecordDigest: certifiedReleaseDryRunResultLedger.acceptanceRecordDigest,
      handoffPacketDigest: certifiedReleaseDryRunResultLedger.handoffPacketDigest,
      decisionReceiptDigest: certifiedReleaseDryRunResultLedger.decisionReceiptDigest,
      releaseGateDigest: certifiedReleaseDryRunResultLedger.releaseGateDigest,
      reconciliationDigest: certifiedReleaseDryRunResultLedger.reconciliationDigest,
      attestationAuditDigest: certifiedReleaseDryRunResultLedger.attestationAuditDigest,
      closureLedgerDigest: certifiedReleaseDryRunResultLedger.closureLedgerDigest,
      certificationDigest: certifiedReleaseDryRunResultLedger.certificationDigest,
      verificationDigest: certifiedReleaseDryRunResultLedger.verificationDigest,
      releaseEvidenceDigest: certifiedReleaseDryRunResultLedger.releaseEvidenceDigest,
      operatorChecklist: certifiedReleaseDryRunResultLedger.operatorChecklist,
      acknowledgedChecklist: certifiedReleaseDryRunResultLedger.acknowledgedChecklist,
      executionChecklist: certifiedReleaseDryRunResultLedger.executionChecklist,
      dryRunRows: certifiedReleaseDryRunResultLedger.dryRunRows,
      executionPlanRows: certifiedReleaseDryRunResultLedger.executionPlanRows,
      resultLedgerRows: certifiedReleaseDryRunResultLedger.resultLedgerRows,
      finalReadinessRows: certifiedReleaseDryRunResultLedger.finalReadinessRows,
      certificateRows: [
        { key: "dryrun_result_ledger", label: "Dry-run result ledger recorded", certificateStatus: "issued", finalReadinessStatus: "ready", safeDigest: certifiedReleaseDryRunResultLedger.dryRunResultLedgerDigest, checkedCount: 1, complete: true },
        { key: "dryrun_passed", label: "Dry-run passed", certificateStatus: "issued", finalReadinessStatus: "ready", safeDigest: certifiedReleaseDryRunResultLedger.noopExecutionDryRunDigest, checkedCount: 1, complete: true },
        { key: "external_calls_zero", label: "External calls zero", certificateStatus: "issued", finalReadinessStatus: "ready", safeDigest: certifiedReleaseDryRunResultLedger.dryRunResultLedgerDigest, checkedCount: 0, complete: true }
      ],
      releaseOwnerSummary: certifiedReleaseDryRunResultLedger.releaseOwnerSummary,
      inheritedPrerequisiteChecklist: certifiedReleaseDryRunResultLedger.inheritedPrerequisiteChecklist,
      inheritedCertificationChecklist: certifiedReleaseDryRunResultLedger.inheritedCertificationChecklist,
      inheritedGateChecklist: certifiedReleaseDryRunResultLedger.inheritedGateChecklist,
      inheritedDecisionReceiptSummary: certifiedReleaseDryRunResultLedger.inheritedDecisionReceiptSummary,
      inheritedHandoffPacketSummary: certifiedReleaseDryRunResultLedger.inheritedHandoffPacketSummary,
      inheritedAcceptanceSummary: certifiedReleaseDryRunResultLedger.inheritedAcceptanceSummary,
      inheritedNoopDryRunSummary: certifiedReleaseDryRunResultLedger.inheritedNoopDryRunSummary,
      inheritedResultLedgerSummary: {
        ledgerStatus: certifiedReleaseDryRunResultLedger.ledgerStatus,
        dryRunStatus: certifiedReleaseDryRunResultLedger.dryRunStatus,
        executionMode: certifiedReleaseDryRunResultLedger.executionMode,
        acceptanceStatus: certifiedReleaseDryRunResultLedger.acceptanceStatus,
        handoffStatus: certifiedReleaseDryRunResultLedger.handoffStatus,
        releaseDecision: certifiedReleaseDryRunResultLedger.releaseDecision,
        resultLedgerRowCount: certifiedReleaseDryRunResultLedger.counts.resultLedgerRowCount,
        resultLedgerRowRecordedCount: certifiedReleaseDryRunResultLedger.counts.resultLedgerRowRecordedCount,
        finalReadinessRowCount: certifiedReleaseDryRunResultLedger.counts.finalReadinessRowCount,
        finalReadinessReadyCount: certifiedReleaseDryRunResultLedger.counts.finalReadinessReadyCount,
        externalCallsZero: true,
        safeDigest: certifiedReleaseDryRunResultLedger.safeDigest
      },
      inheritedBlockingReasons: certifiedReleaseDryRunResultLedger.inheritedBlockingReasons,
      inheritedExceptionRows: certifiedReleaseDryRunResultLedger.inheritedExceptionRows,
      counts: {
        ...certifiedReleaseDryRunResultLedger.counts,
        finalReadinessCertificateCheckedCount: 1,
        finalReadinessCertificateMutationCount: 0,
        certificateRowCount: 3,
        certificateRowIssuedCount: 3
      },
      externalCalls: 0
    });
    const certifiedReleaseFreezeAuditRegister = providerWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegisterSchema.parse({
      registerKind: "qa-handoff-locked-archive-certified-release-freeze-audit-register",
      freezeAuditStatus: "recorded",
      freezeStatus: "frozen",
      rollbackReadinessStatus: "ready",
      certificateStatus: certifiedReleaseFinalReadinessCertificate.certificateStatus,
      finalReadinessStatus: certifiedReleaseFinalReadinessCertificate.finalReadinessStatus,
      ledgerStatus: certifiedReleaseFinalReadinessCertificate.ledgerStatus,
      dryRunStatus: certifiedReleaseFinalReadinessCertificate.dryRunStatus,
      executionMode: certifiedReleaseFinalReadinessCertificate.executionMode,
      acceptanceStatus: certifiedReleaseFinalReadinessCertificate.acceptanceStatus,
      handoffStatus: certifiedReleaseFinalReadinessCertificate.handoffStatus,
      releaseDecision: certifiedReleaseFinalReadinessCertificate.releaseDecision,
      packetStatus: certifiedReleaseFinalReadinessCertificate.packetStatus,
      receiptStatus: certifiedReleaseFinalReadinessCertificate.receiptStatus,
      gateStatus: certifiedReleaseFinalReadinessCertificate.gateStatus,
      goNoGoDecision: certifiedReleaseFinalReadinessCertificate.goNoGoDecision,
      releaseReadinessStatus: certifiedReleaseFinalReadinessCertificate.releaseReadinessStatus,
      reconciliationStatus: certifiedReleaseFinalReadinessCertificate.reconciliationStatus,
      attestationStatus: certifiedReleaseFinalReadinessCertificate.attestationStatus,
      ledgerStatusFromClosure: certifiedReleaseFinalReadinessCertificate.ledgerStatusFromClosure,
      certificationStatus: certifiedReleaseFinalReadinessCertificate.certificationStatus,
      verificationStatus: certifiedReleaseFinalReadinessCertificate.verificationStatus,
      digestChainStatus: certifiedReleaseFinalReadinessCertificate.digestChainStatus,
      safeFilename: "provider-webhook-review-qa-handoff-certified-release-freeze-audit-register.json",
      safeDigest: "sha256:certifiedreleasefreezeauditregister",
      freezeAuditRegisterDigest: "sha256:certifiedreleasefreezeauditregister",
      rollbackReadinessPlanDigest: "sha256:certifiedreleaserollbackreadinessplan",
      finalReadinessCertificateDigest: certifiedReleaseFinalReadinessCertificate.finalReadinessCertificateDigest,
      dryRunResultLedgerDigest: certifiedReleaseFinalReadinessCertificate.dryRunResultLedgerDigest,
      noopExecutionDryRunDigest: certifiedReleaseFinalReadinessCertificate.noopExecutionDryRunDigest,
      acceptanceRecordDigest: certifiedReleaseFinalReadinessCertificate.acceptanceRecordDigest,
      handoffPacketDigest: certifiedReleaseFinalReadinessCertificate.handoffPacketDigest,
      decisionReceiptDigest: certifiedReleaseFinalReadinessCertificate.decisionReceiptDigest,
      releaseGateDigest: certifiedReleaseFinalReadinessCertificate.releaseGateDigest,
      reconciliationDigest: certifiedReleaseFinalReadinessCertificate.reconciliationDigest,
      attestationAuditDigest: certifiedReleaseFinalReadinessCertificate.attestationAuditDigest,
      closureLedgerDigest: certifiedReleaseFinalReadinessCertificate.closureLedgerDigest,
      certificationDigest: certifiedReleaseFinalReadinessCertificate.certificationDigest,
      verificationDigest: certifiedReleaseFinalReadinessCertificate.verificationDigest,
      releaseEvidenceDigest: certifiedReleaseFinalReadinessCertificate.releaseEvidenceDigest,
      operatorChecklist: certifiedReleaseFinalReadinessCertificate.operatorChecklist,
      acknowledgedChecklist: certifiedReleaseFinalReadinessCertificate.acknowledgedChecklist,
      executionChecklist: certifiedReleaseFinalReadinessCertificate.executionChecklist,
      dryRunRows: certifiedReleaseFinalReadinessCertificate.dryRunRows,
      executionPlanRows: certifiedReleaseFinalReadinessCertificate.executionPlanRows,
      resultLedgerRows: certifiedReleaseFinalReadinessCertificate.resultLedgerRows,
      finalReadinessRows: certifiedReleaseFinalReadinessCertificate.finalReadinessRows,
      certificateRows: certifiedReleaseFinalReadinessCertificate.certificateRows,
      freezeAuditRows: [
        { key: "final_readiness_certificate", label: "Final readiness certificate issued", freezeAuditStatus: "recorded", rollbackReadinessStatus: "ready", safeDigest: certifiedReleaseFinalReadinessCertificate.finalReadinessCertificateDigest, checkedCount: 1, complete: true },
        { key: "release_freeze_scope", label: "Release freeze scope registered", freezeAuditStatus: "recorded", rollbackReadinessStatus: "ready", safeDigest: "sha256:certifiedreleasefreezeauditregister", checkedCount: certifiedReleaseFinalReadinessCertificate.counts.certificateRowCount, complete: true },
        { key: "safe_digests", label: "Freeze register safe digest chain", freezeAuditStatus: "recorded", rollbackReadinessStatus: "ready", safeDigest: "sha256:certifiedreleasefreezeauditregister", checkedCount: 16, complete: true },
        { key: "no_state_mutation", label: "No freeze audit register state mutation", freezeAuditStatus: "recorded", rollbackReadinessStatus: "ready", safeDigest: certifiedReleaseFinalReadinessCertificate.finalReadinessCertificateDigest, checkedCount: 0, complete: true },
        { key: "external_calls_zero", label: "External calls zero", freezeAuditStatus: "recorded", rollbackReadinessStatus: "ready", safeDigest: certifiedReleaseFinalReadinessCertificate.finalReadinessCertificateDigest, checkedCount: 0, complete: true }
      ],
      rollbackPlanRows: [
        { key: "rollback_plan_ready", label: "Safe rollback readiness plan ready", freezeAuditStatus: "recorded", rollbackReadinessStatus: "ready", safeDigest: "sha256:certifiedreleaserollbackreadinessplan", checkedCount: certifiedReleaseFinalReadinessCertificate.counts.finalReadinessReadyCount, complete: true },
        { key: "rollback_owner_confirmed", label: "Release owner rollback readiness confirmed", freezeAuditStatus: "recorded", rollbackReadinessStatus: "ready", safeDigest: certifiedReleaseFinalReadinessCertificate.safeDigest, checkedCount: 1, complete: true },
        { key: "safe_digests", label: "Rollback plan safe digest chain", freezeAuditStatus: "recorded", rollbackReadinessStatus: "ready", safeDigest: "sha256:certifiedreleaserollbackreadinessplan", checkedCount: 16, complete: true },
        { key: "no_state_mutation", label: "No rollback readiness plan state mutation", freezeAuditStatus: "recorded", rollbackReadinessStatus: "ready", safeDigest: certifiedReleaseFinalReadinessCertificate.finalReadinessCertificateDigest, checkedCount: 0, complete: true },
        { key: "external_calls_zero", label: "External calls zero", freezeAuditStatus: "recorded", rollbackReadinessStatus: "ready", safeDigest: certifiedReleaseFinalReadinessCertificate.finalReadinessCertificateDigest, checkedCount: 0, complete: true }
      ],
      releaseOwnerSummary: certifiedReleaseFinalReadinessCertificate.releaseOwnerSummary,
      inheritedPrerequisiteChecklist: certifiedReleaseFinalReadinessCertificate.inheritedPrerequisiteChecklist,
      inheritedCertificationChecklist: certifiedReleaseFinalReadinessCertificate.inheritedCertificationChecklist,
      inheritedGateChecklist: certifiedReleaseFinalReadinessCertificate.inheritedGateChecklist,
      inheritedDecisionReceiptSummary: certifiedReleaseFinalReadinessCertificate.inheritedDecisionReceiptSummary,
      inheritedHandoffPacketSummary: certifiedReleaseFinalReadinessCertificate.inheritedHandoffPacketSummary,
      inheritedAcceptanceSummary: certifiedReleaseFinalReadinessCertificate.inheritedAcceptanceSummary,
      inheritedNoopDryRunSummary: certifiedReleaseFinalReadinessCertificate.inheritedNoopDryRunSummary,
      inheritedResultLedgerSummary: certifiedReleaseFinalReadinessCertificate.inheritedResultLedgerSummary,
      inheritedFinalReadinessCertificateSummary: {
        certificateStatus: certifiedReleaseFinalReadinessCertificate.certificateStatus,
        finalReadinessStatus: certifiedReleaseFinalReadinessCertificate.finalReadinessStatus,
        certificateRowCount: certifiedReleaseFinalReadinessCertificate.counts.certificateRowCount,
        certificateRowIssuedCount: certifiedReleaseFinalReadinessCertificate.counts.certificateRowIssuedCount,
        finalReadinessCertificateMutationCount: certifiedReleaseFinalReadinessCertificate.counts.finalReadinessCertificateMutationCount,
        externalCallsZero: true,
        safeDigest: certifiedReleaseFinalReadinessCertificate.safeDigest
      },
      inheritedBlockingReasons: certifiedReleaseFinalReadinessCertificate.inheritedBlockingReasons,
      inheritedExceptionRows: certifiedReleaseFinalReadinessCertificate.inheritedExceptionRows,
      counts: {
        ...certifiedReleaseFinalReadinessCertificate.counts,
        freezeAuditRegisterCheckedCount: 1,
        freezeAuditRegisterMutationCount: 0,
        freezeAuditRowCount: 5,
        freezeAuditRegisteredCount: 5,
        rollbackPlanRowCount: 5,
        rollbackPlanReadyCount: 5
      },
      externalCalls: 0
    });
    const { registerKind: _freezeRegisterKind, rollbackPlanRows: _freezeRollbackPlanRows, rollbackReadinessPlanDigest: _freezeRollbackReadinessPlanDigest, safeFilename: _freezeSafeFilename, safeDigest: freezeSafeDigest, counts: freezeCounts, externalCalls: _freezeExternalCalls, ...certifiedReleaseRollbackRehearsalBase } = certifiedReleaseFreezeAuditRegister;
    const rollbackRehearsalRow = (
      key: "freeze_audit_recorded" | "release_frozen" | "rollback_readiness_ready" | "certificate_issued" | "final_readiness_ready" | "dry_run_noop_passed" | "safe_digest_chain" | "rollback_rehearsal_noop" | "recovery_owner_confirmed" | "recovery_plan_ready" | "no_state_mutation" | "external_calls_zero",
      label: string,
      safeDigest: string,
      checkedCount: number
    ) => ({
      key,
      label,
      rollbackRehearsalStatus: "verified" as const,
      recoveryReadinessStatus: "ready" as const,
      safeDigest,
      checkedCount,
      complete: true
    });
    const certifiedReleaseRollbackRehearsalReceipt = providerWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptSchema.parse({
      receiptKind: "qa-handoff-locked-archive-certified-release-rollback-rehearsal-receipt",
      rollbackRehearsalStatus: "verified",
      recoveryReadinessStatus: "ready",
      ...certifiedReleaseRollbackRehearsalBase,
      safeFilename: "provider-webhook-review-qa-handoff-certified-release-rollback-rehearsal-receipt.json",
      safeDigest: "sha256:certifiedreleaserollbackrehearsalreceipt",
      rollbackRehearsalReceiptDigest: "sha256:certifiedreleaserollbackrehearsalreceipt",
      freezeSnapshotRows: [
        rollbackRehearsalRow("freeze_audit_recorded", "Freeze audit register recorded", certifiedReleaseFreezeAuditRegister.freezeAuditRegisterDigest, certifiedReleaseFreezeAuditRegister.counts.freezeAuditRegisteredCount),
        rollbackRehearsalRow("release_frozen", "Certified release freeze remains frozen", certifiedReleaseFreezeAuditRegister.freezeAuditRegisterDigest, 1),
        rollbackRehearsalRow("safe_digest_chain", "Freeze snapshot safe digest chain", "sha256:certifiedreleaserollbackrehearsalreceipt", 17)
      ],
      rollbackReadinessRows: [
        rollbackRehearsalRow("rollback_readiness_ready", "Rollback readiness status ready", certifiedReleaseFreezeAuditRegister.freezeAuditRegisterDigest, certifiedReleaseFreezeAuditRegister.counts.rollbackPlanReadyCount),
        rollbackRehearsalRow("recovery_owner_confirmed", "Release owner recovery readiness confirmed", certifiedReleaseFreezeAuditRegister.safeDigest, 1),
        rollbackRehearsalRow("safe_digest_chain", "Rollback readiness safe digest chain", "sha256:certifiedreleaserollbackrehearsalreceipt", 17)
      ],
      rollbackRehearsalRows: [
        rollbackRehearsalRow("dry_run_noop_passed", "No-op execution dry-run passed", certifiedReleaseFreezeAuditRegister.noopExecutionDryRunDigest, certifiedReleaseFreezeAuditRegister.counts.dryRunRowPassedCount),
        rollbackRehearsalRow("rollback_rehearsal_noop", "Rollback rehearsal receipt is read-only no-op evidence", "sha256:certifiedreleaserollbackrehearsalreceipt", 1),
        rollbackRehearsalRow("no_state_mutation", "No rollback rehearsal receipt state mutation", certifiedReleaseFreezeAuditRegister.freezeAuditRegisterDigest, 0),
        rollbackRehearsalRow("external_calls_zero", "External calls zero", certifiedReleaseFreezeAuditRegister.freezeAuditRegisterDigest, 0)
      ],
      recoveryPlanRows: [
        rollbackRehearsalRow("recovery_plan_ready", "Safe recovery plan ready", certifiedReleaseFreezeAuditRegister.freezeAuditRegisterDigest, certifiedReleaseFreezeAuditRegister.counts.rollbackPlanReadyCount),
        rollbackRehearsalRow("certificate_issued", "Final readiness certificate issued", certifiedReleaseFreezeAuditRegister.finalReadinessCertificateDigest, certifiedReleaseFreezeAuditRegister.counts.certificateRowIssuedCount),
        rollbackRehearsalRow("final_readiness_ready", "Final readiness remains ready", certifiedReleaseFreezeAuditRegister.finalReadinessCertificateDigest, certifiedReleaseFreezeAuditRegister.counts.finalReadinessReadyCount)
      ],
      recoveryReadinessRows: [
        rollbackRehearsalRow("safe_digest_chain", "Recovery readiness safe digest chain", "sha256:certifiedreleaserollbackrehearsalreceipt", 17),
        rollbackRehearsalRow("no_state_mutation", "No recovery readiness state mutation", certifiedReleaseFreezeAuditRegister.freezeAuditRegisterDigest, 0),
        rollbackRehearsalRow("external_calls_zero", "External calls zero", certifiedReleaseFreezeAuditRegister.freezeAuditRegisterDigest, 0)
      ],
      inheritedFreezeAuditSummary: {
        freezeAuditStatus: certifiedReleaseFreezeAuditRegister.freezeAuditStatus,
        freezeStatus: certifiedReleaseFreezeAuditRegister.freezeStatus,
        rollbackReadinessStatus: certifiedReleaseFreezeAuditRegister.rollbackReadinessStatus,
        freezeAuditRowCount: certifiedReleaseFreezeAuditRegister.counts.freezeAuditRowCount,
        freezeAuditRegisteredCount: certifiedReleaseFreezeAuditRegister.counts.freezeAuditRegisteredCount,
        rollbackPlanRowCount: certifiedReleaseFreezeAuditRegister.counts.rollbackPlanRowCount,
        rollbackPlanReadyCount: certifiedReleaseFreezeAuditRegister.counts.rollbackPlanReadyCount,
        freezeAuditRegisterMutationCount: certifiedReleaseFreezeAuditRegister.counts.freezeAuditRegisterMutationCount,
        externalCallsZero: true,
        safeDigest: freezeSafeDigest
      },
      counts: {
        ...freezeCounts,
        rollbackRehearsalReceiptCheckedCount: 1,
        rollbackRehearsalReceiptMutationCount: 0,
        freezeSnapshotRowCount: 3,
        freezeSnapshotVerifiedCount: 3,
        rollbackReadinessRowCount: 3,
        rollbackReadinessReadyCount: 3,
        rollbackRehearsalRowCount: 4,
        rollbackRehearsalVerifiedCount: 4,
        recoveryPlanRowCount: 3,
        recoveryPlanReadyCount: 3,
        recoveryReadinessRowCount: 3,
        recoveryReadinessReadyCount: 3
      },
      externalCalls: 0
    });
    const { receiptKind: _rollbackReceiptKind, safeFilename: _rollbackSafeFilename, safeDigest: rollbackSafeDigest, counts: rollbackCounts, externalCalls: _rollbackExternalCalls, ...certifiedReleaseControlRoomBase } = certifiedReleaseRollbackRehearsalReceipt;
    const controlRoomRow = (
      key: "rollback_rehearsal_verified" | "recovery_readiness_ready" | "rollback_readiness_ready" | "freeze_audit_recorded" | "release_frozen" | "final_readiness_ready" | "go_decision_confirmed" | "operator_checklist_complete" | "acknowledgement_complete" | "execution_checklist_complete" | "receipt_issued" | "packet_issued" | "safe_digest_chain" | "no_state_mutation" | "external_calls_zero",
      label: string,
      safeDigest: string,
      checkedCount: number
    ) => ({
      key,
      label,
      controlRoomStatus: "ready" as const,
      cutoverReadinessStatus: "ready" as const,
      safeDigest,
      checkedCount,
      complete: true
    });
    const controlRoomRows = [
      controlRoomRow("rollback_rehearsal_verified", "Rollback rehearsal receipt verified", certifiedReleaseRollbackRehearsalReceipt.rollbackRehearsalReceiptDigest, certifiedReleaseRollbackRehearsalReceipt.counts.rollbackRehearsalVerifiedCount),
      controlRoomRow("recovery_readiness_ready", "Recovery readiness status ready", certifiedReleaseRollbackRehearsalReceipt.rollbackRehearsalReceiptDigest, certifiedReleaseRollbackRehearsalReceipt.counts.recoveryReadinessReadyCount),
      controlRoomRow("safe_digest_chain", "Control room packet safe digest chain", "sha256:certifiedreleasecontrolroompacket", 18),
      controlRoomRow("no_state_mutation", "No control room packet state mutation", certifiedReleaseRollbackRehearsalReceipt.rollbackRehearsalReceiptDigest, 0),
      controlRoomRow("external_calls_zero", "External calls zero", certifiedReleaseRollbackRehearsalReceipt.rollbackRehearsalReceiptDigest, 0)
    ];
    const cutoverChecklistRows = [
      controlRoomRow("rollback_readiness_ready", "Rollback readiness remains ready", certifiedReleaseRollbackRehearsalReceipt.freezeAuditRegisterDigest, certifiedReleaseRollbackRehearsalReceipt.counts.rollbackReadinessReadyCount),
      controlRoomRow("freeze_audit_recorded", "Freeze audit register recorded", certifiedReleaseRollbackRehearsalReceipt.freezeAuditRegisterDigest, certifiedReleaseRollbackRehearsalReceipt.counts.freezeAuditRegisteredCount),
      controlRoomRow("release_frozen", "Certified release remains frozen", certifiedReleaseRollbackRehearsalReceipt.freezeAuditRegisterDigest, 1),
      controlRoomRow("final_readiness_ready", "Final readiness remains ready", certifiedReleaseRollbackRehearsalReceipt.finalReadinessCertificateDigest, certifiedReleaseRollbackRehearsalReceipt.counts.finalReadinessReadyCount),
      controlRoomRow("go_decision_confirmed", "Go/no-go decision remains go", "sha256:certifiedreleasecontrolroompacket", 1)
    ];
    const operatorHandoffRows = [
      controlRoomRow("operator_checklist_complete", "Operator checklist complete", certifiedReleaseRollbackRehearsalReceipt.handoffPacketDigest, certifiedReleaseRollbackRehearsalReceipt.counts.operatorChecklistCompleteCount),
      controlRoomRow("acknowledgement_complete", "Acknowledged checklist complete", certifiedReleaseRollbackRehearsalReceipt.acceptanceRecordDigest, certifiedReleaseRollbackRehearsalReceipt.counts.acknowledgedChecklistCompleteCount),
      controlRoomRow("execution_checklist_complete", "Execution checklist complete", certifiedReleaseRollbackRehearsalReceipt.noopExecutionDryRunDigest, certifiedReleaseRollbackRehearsalReceipt.counts.executionChecklistCompleteCount),
      controlRoomRow("receipt_issued", "Decision receipt issued", certifiedReleaseRollbackRehearsalReceipt.decisionReceiptDigest, 1),
      controlRoomRow("packet_issued", "Handoff packet issued", "sha256:certifiedreleasecontrolroompacket", 1)
    ];
    const certifiedReleaseControlRoomPacket = providerWebhookReviewQaHandoffCertifiedReleaseControlRoomPacketSchema.parse({
      packetKind: "qa-handoff-locked-archive-certified-release-control-room-packet",
      controlRoomStatus: "ready",
      cutoverReadinessStatus: "ready",
      ...certifiedReleaseControlRoomBase,
      safeFilename: "provider-webhook-review-qa-handoff-certified-release-control-room-packet.json",
      safeDigest: "sha256:certifiedreleasecontrolroompacket",
      controlRoomPacketDigest: "sha256:certifiedreleasecontrolroompacket",
      controlRoomRows,
      cutoverChecklistRows,
      operatorHandoffRows,
      inheritedRollbackRehearsalSummary: {
        rollbackRehearsalStatus: certifiedReleaseRollbackRehearsalReceipt.rollbackRehearsalStatus,
        recoveryReadinessStatus: certifiedReleaseRollbackRehearsalReceipt.recoveryReadinessStatus,
        rollbackRehearsalRowCount: certifiedReleaseRollbackRehearsalReceipt.counts.rollbackRehearsalRowCount,
        rollbackRehearsalVerifiedCount: certifiedReleaseRollbackRehearsalReceipt.counts.rollbackRehearsalVerifiedCount,
        recoveryReadinessRowCount: certifiedReleaseRollbackRehearsalReceipt.counts.recoveryReadinessRowCount,
        recoveryReadinessReadyCount: certifiedReleaseRollbackRehearsalReceipt.counts.recoveryReadinessReadyCount,
        rollbackRehearsalReceiptMutationCount: certifiedReleaseRollbackRehearsalReceipt.counts.rollbackRehearsalReceiptMutationCount,
        externalCallsZero: true,
        safeDigest: rollbackSafeDigest
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
    });
    const { packetKind: _controlRoomPacketKind, safeFilename: _controlRoomSafeFilename, safeDigest: controlRoomSafeDigest, counts: controlRoomCounts, externalCalls: _controlRoomExternalCalls, ...certifiedReleaseCutoverChecklistBase } = certifiedReleaseControlRoomPacket;
    const cutoverChecklistReceiptRow = (
      key: "control_room_ready" | "cutover_readiness_ready" | "rollback_rehearsal_verified" | "recovery_readiness_ready" | "rollback_readiness_ready" | "freeze_audit_recorded" | "release_frozen" | "final_readiness_ready" | "ledger_recorded" | "dry_run_passed" | "no_op_execution" | "operator_checklist_complete" | "acknowledgement_complete" | "execution_checklist_complete" | "handoff_ready" | "operator_command_ready" | "release_decision_go" | "safe_digest_chain" | "no_state_mutation" | "external_calls_zero",
      label: string,
      safeDigest: string,
      checkedCount: number
    ) => ({
      key,
      label,
      cutoverChecklistStatus: "verified" as const,
      operatorCommandStatus: "ready" as const,
      safeDigest,
      checkedCount,
      complete: true
    });
    const operatorCommandRows = [
      cutoverChecklistReceiptRow("operator_checklist_complete", "Operator checklist complete", certifiedReleaseControlRoomPacket.handoffPacketDigest, certifiedReleaseControlRoomPacket.counts.operatorChecklistCompleteCount),
      cutoverChecklistReceiptRow("acknowledgement_complete", "Acknowledged checklist complete", certifiedReleaseControlRoomPacket.acceptanceRecordDigest, certifiedReleaseControlRoomPacket.counts.acknowledgedChecklistCompleteCount),
      cutoverChecklistReceiptRow("execution_checklist_complete", "Execution checklist complete", certifiedReleaseControlRoomPacket.noopExecutionDryRunDigest, certifiedReleaseControlRoomPacket.counts.executionChecklistCompleteCount),
      cutoverChecklistReceiptRow("handoff_ready", "Certified release handoff ready", certifiedReleaseControlRoomPacket.handoffPacketDigest, 1),
      cutoverChecklistReceiptRow("no_op_execution", "No-op execution mode enforced", certifiedReleaseControlRoomPacket.noopExecutionDryRunDigest, 1),
      cutoverChecklistReceiptRow("operator_command_ready", "Safe operator command handoff ready", "sha256:certifiedreleasecutoverchecklistreceipt", 1)
    ];
    const safeCutoverChecklistRows = [
      cutoverChecklistReceiptRow("control_room_ready", "Control room packet ready", certifiedReleaseControlRoomPacket.controlRoomPacketDigest, certifiedReleaseControlRoomPacket.counts.controlRoomReadyCount),
      cutoverChecklistReceiptRow("cutover_readiness_ready", "Cutover readiness ready", certifiedReleaseControlRoomPacket.controlRoomPacketDigest, certifiedReleaseControlRoomPacket.counts.cutoverChecklistReadyCount),
      cutoverChecklistReceiptRow("rollback_rehearsal_verified", "Rollback rehearsal receipt verified", certifiedReleaseControlRoomPacket.rollbackRehearsalReceiptDigest, certifiedReleaseControlRoomPacket.counts.rollbackRehearsalVerifiedCount),
      cutoverChecklistReceiptRow("recovery_readiness_ready", "Recovery readiness ready", certifiedReleaseControlRoomPacket.rollbackRehearsalReceiptDigest, certifiedReleaseControlRoomPacket.counts.recoveryReadinessReadyCount),
      cutoverChecklistReceiptRow("rollback_readiness_ready", "Rollback readiness ready", certifiedReleaseControlRoomPacket.freezeAuditRegisterDigest, certifiedReleaseControlRoomPacket.counts.rollbackReadinessReadyCount),
      cutoverChecklistReceiptRow("freeze_audit_recorded", "Freeze audit register recorded", certifiedReleaseControlRoomPacket.freezeAuditRegisterDigest, certifiedReleaseControlRoomPacket.counts.freezeAuditRegisteredCount),
      cutoverChecklistReceiptRow("release_frozen", "Certified release frozen", certifiedReleaseControlRoomPacket.freezeAuditRegisterDigest, 1),
      cutoverChecklistReceiptRow("final_readiness_ready", "Final readiness certificate ready", certifiedReleaseControlRoomPacket.finalReadinessCertificateDigest, certifiedReleaseControlRoomPacket.counts.finalReadinessReadyCount),
      cutoverChecklistReceiptRow("ledger_recorded", "Dry-run result ledger recorded", certifiedReleaseControlRoomPacket.dryRunResultLedgerDigest, certifiedReleaseControlRoomPacket.counts.resultLedgerRowRecordedCount),
      cutoverChecklistReceiptRow("dry_run_passed", "No-op execution dry-run passed", certifiedReleaseControlRoomPacket.noopExecutionDryRunDigest, certifiedReleaseControlRoomPacket.counts.dryRunRowPassedCount),
      cutoverChecklistReceiptRow("release_decision_go", "Release decision remains go", certifiedReleaseControlRoomPacket.decisionReceiptDigest, 1),
      cutoverChecklistReceiptRow("safe_digest_chain", "Cutover checklist receipt safe digest chain", "sha256:certifiedreleasecutoverchecklistreceipt", 19),
      cutoverChecklistReceiptRow("no_state_mutation", "No cutover checklist receipt state mutation", certifiedReleaseControlRoomPacket.controlRoomPacketDigest, 0),
      cutoverChecklistReceiptRow("external_calls_zero", "External calls zero", certifiedReleaseControlRoomPacket.controlRoomPacketDigest, 0)
    ];
    const certifiedReleaseCutoverChecklistReceipt = providerWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceiptSchema.parse({
      receiptKind: "qa-handoff-locked-archive-certified-release-cutover-checklist-receipt",
      cutoverChecklistStatus: "verified",
      operatorCommandStatus: "ready",
      ...certifiedReleaseCutoverChecklistBase,
      safeFilename: "provider-webhook-review-qa-handoff-certified-release-cutover-checklist-receipt.json",
      safeDigest: "sha256:certifiedreleasecutoverchecklistreceipt",
      cutoverChecklistReceiptDigest: "sha256:certifiedreleasecutoverchecklistreceipt",
      operatorCommandRows,
      safeCutoverChecklistRows,
      inheritedControlRoomSummary: {
        controlRoomStatus: certifiedReleaseControlRoomPacket.controlRoomStatus,
        cutoverReadinessStatus: certifiedReleaseControlRoomPacket.cutoverReadinessStatus,
        controlRoomRowCount: certifiedReleaseControlRoomPacket.counts.controlRoomRowCount,
        controlRoomReadyCount: certifiedReleaseControlRoomPacket.counts.controlRoomReadyCount,
        cutoverChecklistRowCount: certifiedReleaseControlRoomPacket.counts.cutoverChecklistRowCount,
        cutoverChecklistReadyCount: certifiedReleaseControlRoomPacket.counts.cutoverChecklistReadyCount,
        operatorHandoffRowCount: certifiedReleaseControlRoomPacket.counts.operatorHandoffRowCount,
        operatorHandoffReadyCount: certifiedReleaseControlRoomPacket.counts.operatorHandoffReadyCount,
        controlRoomPacketMutationCount: certifiedReleaseControlRoomPacket.counts.controlRoomPacketMutationCount,
        externalCallsZero: true,
        safeDigest: controlRoomSafeDigest
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
    });
    const operatorCommandReceiptRow = (
      key: ProviderWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceipt["operatorCommandReceiptRows"][number]["key"],
      label: string,
      safeDigest: string,
      checkedCount: number
    ) => ({
      key,
      label,
      operatorCommandReceiptStatus: "issued" as const,
      goLiveAuthorizationStatus: "ready" as const,
      cutoverChecklistStatus: "verified" as const,
      operatorCommandStatus: "ready" as const,
      safeDigest,
      checkedCount,
      complete: true
    });
    const certifiedReleaseOperatorCommandReceipt = providerWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceiptSchema.parse({
      ...certifiedReleaseCutoverChecklistReceipt,
      receiptKind: "qa-handoff-locked-archive-certified-release-operator-command-receipt",
      operatorCommandReceiptStatus: "issued",
      goLiveAuthorizationStatus: "ready",
      safeFilename: "provider-webhook-review-qa-handoff-certified-release-operator-command-receipt.json",
      safeDigest: "sha256:certifiedreleaseoperatorcommandreceipt",
      operatorCommandReceiptDigest: "sha256:certifiedreleaseoperatorcommandreceipt",
      goLiveAuthorizationRows: [
        operatorCommandReceiptRow("cutover_checklist_verified", "Cutover checklist receipt verified", "sha256:certifiedreleasecutoverchecklistreceipt", 1),
        operatorCommandReceiptRow("go_live_authorization_ready", "Safe go-live authorization preview ready", "sha256:certifiedreleaseoperatorcommandreceipt", 1)
      ],
      operatorCommandReceiptRows: [
        operatorCommandReceiptRow("operator_command_receipt_issued", "Operator command receipt issued", "sha256:certifiedreleaseoperatorcommandreceipt", 1),
        operatorCommandReceiptRow("safe_digest_chain", "Operator command receipt safe digest chain", "sha256:certifiedreleaseoperatorcommandreceipt", 20)
      ],
      commandHandoffRows: [
        operatorCommandReceiptRow("no_op_execution", "No-op execution mode enforced", certifiedReleaseCutoverChecklistReceipt.noopExecutionDryRunDigest, 1),
        operatorCommandReceiptRow("release_decision_go", "Release decision remains go", certifiedReleaseCutoverChecklistReceipt.decisionReceiptDigest, 1)
      ],
      inheritedCutoverChecklistSummary: {
        cutoverChecklistStatus: "verified",
        operatorCommandStatus: "ready",
        cutoverChecklistReceiptCheckedCount: 1,
        cutoverChecklistReceiptMutationCount: 0,
        operatorCommandReadyCount: operatorCommandRows.length,
        safeCutoverChecklistReadyCount: safeCutoverChecklistRows.length,
        externalCallsZero: true,
        safeDigest: certifiedReleaseCutoverChecklistReceipt.safeDigest
      },
      counts: {
        ...certifiedReleaseCutoverChecklistReceipt.counts,
        operatorCommandReceiptCheckedCount: 1,
        operatorCommandReceiptMutationCount: 0,
        goLiveAuthorizationRowCount: 2,
        goLiveAuthorizationReadyCount: 2,
        operatorCommandReceiptRowCount: 2,
        operatorCommandReceiptIssuedCount: 2,
        commandHandoffRowCount: 2,
        commandHandoffReadyCount: 2
      }
    });
    const goLiveAuthorizationReceiptRow = (
      key: ProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceipt["goLiveAuthorizationReceiptRows"][number]["key"],
      label: string,
      safeDigest: string,
      checkedCount: number
    ) => ({
      key,
      label,
      goLiveAuthorizationReceiptStatus: "issued" as const,
      goLiveAuthorizationStatus: "ready" as const,
      launchWindowStatus: "ready" as const,
      safeLaunchWindowStatus: "ready" as const,
      operatorCommandReceiptStatus: "issued" as const,
      operatorCommandStatus: "ready" as const,
      safeDigest,
      checkedCount,
      complete: true
    });
    const certifiedReleaseGoLiveAuthorizationReceipt = providerWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceiptSchema.parse({
      ...certifiedReleaseOperatorCommandReceipt,
      receiptKind: "qa-handoff-locked-archive-certified-release-go-live-authorization-receipt",
      goLiveAuthorizationReceiptStatus: "issued",
      launchWindowStatus: "ready",
      safeLaunchWindowStatus: "ready",
      safeFilename: "provider-webhook-review-qa-handoff-certified-release-go-live-authorization-receipt.json",
      safeDigest: "sha256:certifiedreleasegoliveauthorizationreceipt",
      goLiveAuthorizationReceiptDigest: "sha256:certifiedreleasegoliveauthorizationreceipt",
      goLiveAuthorizationReceiptRows: [
        goLiveAuthorizationReceiptRow("operator_command_receipt_issued", "Operator command receipt issued", certifiedReleaseOperatorCommandReceipt.operatorCommandReceiptDigest, 1),
        goLiveAuthorizationReceiptRow("launch_window_ready", "Safe launch window ready", "sha256:certifiedreleasegoliveauthorizationreceipt", 1)
      ],
      launchWindowRows: [
        goLiveAuthorizationReceiptRow("control_room_ready", "Control room packet ready", certifiedReleaseOperatorCommandReceipt.controlRoomPacketDigest, 1),
        goLiveAuthorizationReceiptRow("safe_digest_chain", "Go-live authorization receipt safe digest chain", "sha256:certifiedreleasegoliveauthorizationreceipt", 21)
      ],
      safeLaunchWindowRows: [
        goLiveAuthorizationReceiptRow("no_op_execution", "No-op execution mode enforced", certifiedReleaseOperatorCommandReceipt.noopExecutionDryRunDigest, 1),
        goLiveAuthorizationReceiptRow("release_decision_go", "Release decision remains go", certifiedReleaseOperatorCommandReceipt.decisionReceiptDigest, 1)
      ],
      inheritedOperatorCommandSummary: {
        operatorCommandReceiptStatus: "issued",
        goLiveAuthorizationStatus: "ready",
        operatorCommandReceiptCheckedCount: 1,
        operatorCommandReceiptMutationCount: 0,
        goLiveAuthorizationReadyCount: 2,
        operatorCommandReceiptIssuedCount: 2,
        commandHandoffReadyCount: 2,
        externalCallsZero: true,
        safeDigest: certifiedReleaseOperatorCommandReceipt.safeDigest
      },
      counts: {
        ...certifiedReleaseOperatorCommandReceipt.counts,
        goLiveAuthorizationReceiptCheckedCount: 1,
        goLiveAuthorizationReceiptMutationCount: 0,
        goLiveAuthorizationReceiptRowCount: 2,
        goLiveAuthorizationReceiptIssuedCount: 2,
        launchWindowRowCount: 2,
        launchWindowReadyCount: 2,
        safeLaunchWindowRowCount: 2,
        safeLaunchWindowReadyCount: 2
      }
    });
    const launchWindowConfirmationRow = (
      key: ProviderWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceipt["launchWindowConfirmationRows"][number]["key"],
      label: string,
      safeDigest: string,
      checkedCount: number
    ) => ({
      key,
      label,
      launchWindowConfirmationStatus: "confirmed" as const,
      goLiveHoldStatus: "ready" as const,
      goLiveAuthorizationReceiptStatus: "issued" as const,
      goLiveAuthorizationStatus: "ready" as const,
      launchWindowStatus: "ready" as const,
      safeLaunchWindowStatus: "ready" as const,
      operatorCommandReceiptStatus: "issued" as const,
      operatorCommandStatus: "ready" as const,
      safeDigest,
      checkedCount,
      complete: true
    });
    const certifiedReleaseLaunchWindowConfirmationReceipt = providerWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceiptSchema.parse({
      ...certifiedReleaseGoLiveAuthorizationReceipt,
      receiptKind: "qa-handoff-locked-archive-certified-release-launch-window-confirmation-receipt",
      launchWindowConfirmationStatus: "confirmed",
      goLiveHoldStatus: "ready",
      safeFilename: "provider-webhook-review-qa-handoff-certified-release-launch-window-confirmation-receipt.json",
      safeDigest: "sha256:certifiedreleaselaunchwindowconfirmationreceipt",
      launchWindowConfirmationReceiptDigest: "sha256:certifiedreleaselaunchwindowconfirmationreceipt",
      launchWindowConfirmationRows: [
        launchWindowConfirmationRow("go_live_authorization_receipt_issued", "Go-live authorization receipt issued", certifiedReleaseGoLiveAuthorizationReceipt.goLiveAuthorizationReceiptDigest, 1),
        launchWindowConfirmationRow("launch_window_confirmation_confirmed", "Launch window confirmation receipt confirmed", "sha256:certifiedreleaselaunchwindowconfirmationreceipt", 1)
      ],
      goLiveHoldRows: [
        launchWindowConfirmationRow("go_live_hold_ready", "Safe go-live hold register ready", "sha256:certifiedreleaselaunchwindowconfirmationreceipt", 1),
        launchWindowConfirmationRow("safe_digest_chain", "Launch window confirmation receipt safe digest chain", "sha256:certifiedreleaselaunchwindowconfirmationreceipt", 22)
      ],
      inheritedGoLiveAuthorizationSummary: {
        goLiveAuthorizationReceiptStatus: "issued",
        goLiveAuthorizationStatus: "ready",
        launchWindowStatus: "ready",
        safeLaunchWindowStatus: "ready",
        goLiveAuthorizationReceiptCheckedCount: 1,
        goLiveAuthorizationReceiptMutationCount: 0,
        goLiveAuthorizationReceiptIssuedCount: 2,
        launchWindowReadyCount: 2,
        safeLaunchWindowReadyCount: 2,
        externalCallsZero: true,
        safeDigest: certifiedReleaseGoLiveAuthorizationReceipt.safeDigest
      },
      counts: {
        ...certifiedReleaseGoLiveAuthorizationReceipt.counts,
        launchWindowConfirmationReceiptCheckedCount: 1,
        launchWindowConfirmationReceiptMutationCount: 0,
        launchWindowConfirmationRowCount: 2,
        launchWindowConfirmationConfirmedCount: 2,
        goLiveHoldRowCount: 2,
        goLiveHoldReadyCount: 2
      }
    });
    const goLiveHoldReleaseAuthorizationRow = (
      key: ProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceipt["goLiveHoldReleaseAuthorizationRows"][number]["key"],
      label: string,
      safeDigest: string,
      checkedCount: number
    ) => ({
      key,
      label,
      goLiveHoldReleaseAuthorizationStatus: "authorized" as const,
      launchApprovalStatus: "ready" as const,
      launchWindowConfirmationStatus: "confirmed" as const,
      goLiveHoldStatus: "ready" as const,
      goLiveAuthorizationReceiptStatus: "issued" as const,
      goLiveAuthorizationStatus: "ready" as const,
      launchWindowStatus: "ready" as const,
      safeLaunchWindowStatus: "ready" as const,
      operatorCommandReceiptStatus: "issued" as const,
      operatorCommandStatus: "ready" as const,
      safeDigest,
      checkedCount,
      complete: true
    });
    const certifiedReleaseGoLiveHoldReleaseAuthorizationReceipt = providerWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceiptSchema.parse({
      ...certifiedReleaseLaunchWindowConfirmationReceipt,
      receiptKind: "qa-handoff-locked-archive-certified-release-go-live-hold-release-authorization-receipt",
      goLiveHoldReleaseAuthorizationStatus: "authorized",
      launchApprovalStatus: "ready",
      safeFilename: "provider-webhook-review-qa-handoff-certified-release-go-live-hold-release-authorization-receipt.json",
      safeDigest: "sha256:certifiedreleasegoliveholdreleaseauthorizationreceipt",
      goLiveHoldReleaseAuthorizationReceiptDigest: "sha256:certifiedreleasegoliveholdreleaseauthorizationreceipt",
      goLiveHoldReleaseAuthorizationRows: [
        goLiveHoldReleaseAuthorizationRow("launch_window_confirmation_confirmed", "Launch window confirmation receipt confirmed", certifiedReleaseLaunchWindowConfirmationReceipt.launchWindowConfirmationReceiptDigest, 1),
        goLiveHoldReleaseAuthorizationRow("go_live_hold_release_authorized", "Safe go-live hold release authorization issued", "sha256:certifiedreleasegoliveholdreleaseauthorizationreceipt", 1)
      ],
      launchApprovalRows: [
        goLiveHoldReleaseAuthorizationRow("launch_approval_ready", "Launch approval register ready", "sha256:certifiedreleasegoliveholdreleaseauthorizationreceipt", 1),
        goLiveHoldReleaseAuthorizationRow("safe_digest_chain", "Go-live hold release authorization receipt safe digest chain", "sha256:certifiedreleasegoliveholdreleaseauthorizationreceipt", 23)
      ],
      inheritedLaunchWindowConfirmationSummary: {
        launchWindowConfirmationStatus: "confirmed",
        goLiveHoldStatus: "ready",
        goLiveAuthorizationReceiptStatus: "issued",
        goLiveAuthorizationStatus: "ready",
        launchWindowStatus: "ready",
        safeLaunchWindowStatus: "ready",
        launchWindowConfirmationReceiptCheckedCount: 1,
        launchWindowConfirmationReceiptMutationCount: 0,
        launchWindowConfirmationConfirmedCount: 2,
        goLiveHoldReadyCount: 2,
        externalCallsZero: true,
        safeDigest: certifiedReleaseLaunchWindowConfirmationReceipt.safeDigest
      },
      counts: {
        ...certifiedReleaseLaunchWindowConfirmationReceipt.counts,
        goLiveHoldReleaseAuthorizationReceiptCheckedCount: 1,
        goLiveHoldReleaseAuthorizationReceiptMutationCount: 0,
        goLiveHoldReleaseAuthorizationRowCount: 2,
        goLiveHoldReleaseAuthorizationAuthorizedCount: 2,
        launchApprovalRowCount: 2,
        launchApprovalReadyCount: 2
      }
    });
    const launchApprovalReceiptRow = (
      key: ProviderWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceipt["noExecutionGuardRows"][number]["key"],
      label: string,
      safeDigest: string,
      checkedCount: number
    ) => ({
      key,
      label,
      goLiveHoldReleaseAuthorizationStatus: "authorized" as const,
      launchApprovalStatus: "ready" as const,
      launchApprovalReceiptStatus: "issued" as const,
      noExecutionGuardStatus: "retained" as const,
      launchWindowConfirmationStatus: "confirmed" as const,
      goLiveHoldStatus: "ready" as const,
      goLiveAuthorizationReceiptStatus: "issued" as const,
      goLiveAuthorizationStatus: "ready" as const,
      launchWindowStatus: "ready" as const,
      safeLaunchWindowStatus: "ready" as const,
      operatorCommandReceiptStatus: "issued" as const,
      operatorCommandStatus: "ready" as const,
      safeDigest,
      checkedCount,
      complete: true
    });
    const certifiedReleaseLaunchApprovalReceipt = providerWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceiptSchema.parse({
      ...certifiedReleaseGoLiveHoldReleaseAuthorizationReceipt,
      receiptKind: "qa-handoff-locked-archive-certified-release-launch-approval-receipt",
      launchApprovalReceiptStatus: "issued",
      noExecutionGuardStatus: "retained",
      safeFilename: "provider-webhook-review-qa-handoff-certified-release-launch-approval-receipt.json",
      safeDigest: "sha256:certifiedreleaselaunchapprovalreceipt",
      launchApprovalReceiptDigest: "sha256:certifiedreleaselaunchapprovalreceipt",
      noExecutionGuardRows: [
        launchApprovalReceiptRow("go_live_hold_release_authorized", "Go-live hold release authorization remains authorized", certifiedReleaseGoLiveHoldReleaseAuthorizationReceipt.goLiveHoldReleaseAuthorizationReceiptDigest, 1),
        launchApprovalReceiptRow("launch_approval_receipt_issued", "Launch approval receipt issued", "sha256:certifiedreleaselaunchapprovalreceipt", 1),
        launchApprovalReceiptRow("no_execution_guard_retained", "No execution guard retained", certifiedReleaseGoLiveHoldReleaseAuthorizationReceipt.safeDigest, 1),
        launchApprovalReceiptRow("launch_approval_ready", "Launch approval remains ready", certifiedReleaseGoLiveHoldReleaseAuthorizationReceipt.goLiveHoldReleaseAuthorizationReceiptDigest, 1),
        launchApprovalReceiptRow("external_calls_zero", "External calls zero", certifiedReleaseGoLiveHoldReleaseAuthorizationReceipt.safeDigest, 0),
        launchApprovalReceiptRow("no_state_mutation", "No launch approval receipt state mutation", certifiedReleaseGoLiveHoldReleaseAuthorizationReceipt.safeDigest, 0),
        launchApprovalReceiptRow("safe_digest_chain", "Launch approval receipt safe digest chain", "sha256:certifiedreleaselaunchapprovalreceipt", 24)
      ],
      inheritedGoLiveHoldReleaseAuthorizationSummary: {
        goLiveHoldReleaseAuthorizationStatus: "authorized",
        launchApprovalStatus: "ready",
        goLiveHoldReleaseAuthorizationReceiptCheckedCount: 1,
        goLiveHoldReleaseAuthorizationReceiptMutationCount: 0,
        goLiveHoldReleaseAuthorizationAuthorizedCount: 2,
        launchApprovalRowCount: 2,
        launchApprovalReadyCount: 2,
        externalCallsZero: true,
        safeDigest: certifiedReleaseGoLiveHoldReleaseAuthorizationReceipt.safeDigest
      },
      counts: {
        ...certifiedReleaseGoLiveHoldReleaseAuthorizationReceipt.counts,
        launchApprovalReceiptCheckedCount: 1,
        launchApprovalReceiptMutationCount: 0,
        launchApprovalReceiptIssuedCount: 7,
        noExecutionGuardRowCount: 7,
        noExecutionGuardRetainedCount: 7
      }
    });
    const noExecutionLockReceiptRow = (
      key: ProviderWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceipt["noExecutionLockRows"][number]["key"],
      label: string,
      safeDigest: string,
      checkedCount: number
    ) => ({
      key,
      label,
      goLiveHoldReleaseAuthorizationStatus: "authorized" as const,
      launchApprovalStatus: "ready" as const,
      launchApprovalReceiptStatus: "issued" as const,
      noExecutionGuardStatus: "retained" as const,
      noExecutionLockReceiptStatus: "issued" as const,
      noExecutionLockStatus: "locked" as const,
      launchApprovalArchiveStatus: "retained" as const,
      tenantScopeStatus: "tenant_scoped" as const,
      providerOutboundStatus: "absent" as const,
      externalNotificationStatus: "absent" as const,
      aiCallStatus: "absent" as const,
      digestChainStatus: "confirmed" as const,
      launchWindowConfirmationStatus: "confirmed" as const,
      goLiveHoldStatus: "ready" as const,
      goLiveAuthorizationReceiptStatus: "issued" as const,
      goLiveAuthorizationStatus: "ready" as const,
      launchWindowStatus: "ready" as const,
      safeLaunchWindowStatus: "ready" as const,
      operatorCommandReceiptStatus: "issued" as const,
      operatorCommandStatus: "ready" as const,
      safeDigest,
      checkedCount,
      complete: true
    });
    const certifiedReleaseNoExecutionLockReceipt = providerWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceiptSchema.parse({
      ...certifiedReleaseLaunchApprovalReceipt,
      receiptKind: "qa-handoff-locked-archive-certified-release-launch-approval-no-execution-lock-receipt",
      noExecutionLockReceiptStatus: "issued",
      noExecutionLockStatus: "locked",
      launchApprovalArchiveStatus: "retained",
      tenantScopeStatus: "tenant_scoped",
      providerOutboundStatus: "absent",
      externalNotificationStatus: "absent",
      aiCallStatus: "absent",
      safeFilename: "provider-webhook-review-qa-handoff-certified-release-launch-approval-no-execution-lock-receipt.json",
      safeDigest: "sha256:certifiedreleasenoexecutionlockreceipt",
      noExecutionLockReceiptDigest: "sha256:certifiedreleasenoexecutionlockreceipt",
      noExecutionLockRows: [
        noExecutionLockReceiptRow("launch_approval_receipt_archived", "Launch approval receipt remains archived", certifiedReleaseLaunchApprovalReceipt.launchApprovalReceiptDigest, 1),
        noExecutionLockReceiptRow("no_execution_lock_retained", "No execution lock retained", "sha256:certifiedreleasenoexecutionlockreceipt", 0),
        noExecutionLockReceiptRow("no_mutation_lock_retained", "No launch approval lock mutation", certifiedReleaseLaunchApprovalReceipt.safeDigest, 0),
        noExecutionLockReceiptRow("provider_outbound_absent", "Provider outbound absent", certifiedReleaseLaunchApprovalReceipt.safeDigest, 0),
        noExecutionLockReceiptRow("external_notification_absent", "External notification absent", certifiedReleaseLaunchApprovalReceipt.safeDigest, 0),
        noExecutionLockReceiptRow("ai_call_absent", "AI call absent", certifiedReleaseLaunchApprovalReceipt.safeDigest, 0),
        noExecutionLockReceiptRow("tenant_scope_retained", "Tenant scope retained", certifiedReleaseLaunchApprovalReceipt.safeDigest, 1),
        noExecutionLockReceiptRow("digest_continuity_confirmed", "No-execution lock receipt safe digest continuity", "sha256:certifiedreleasenoexecutionlockreceipt", 25)
      ],
      inheritedLaunchApprovalReceiptSummary: {
        launchApprovalReceiptStatus: "issued",
        noExecutionGuardStatus: "retained",
        launchApprovalStatus: "ready",
        launchApprovalReceiptCheckedCount: 1,
        launchApprovalReceiptMutationCount: 0,
        launchApprovalReceiptIssuedCount: 7,
        noExecutionGuardRetainedCount: 7,
        externalCallsZero: true,
        safeDigest: certifiedReleaseLaunchApprovalReceipt.safeDigest,
        launchApprovalReceiptDigest: certifiedReleaseLaunchApprovalReceipt.launchApprovalReceiptDigest
      },
      counts: {
        ...certifiedReleaseLaunchApprovalReceipt.counts,
        noExecutionLockReceiptCheckedCount: 1,
        noExecutionLockReceiptMutationCount: 0,
        noExecutionLockRowCount: 8,
        noExecutionLockPassedCount: 8,
        executionAttemptCount: 0,
        providerOutboundCallCount: 0,
        externalNotificationSendCount: 0,
        aiCallCount: 0,
        tenantScopeCheckedCount: 1,
        digestContinuityCheckedCount: 1,
        launchApprovalArchiveRetainedCount: 1
      }
    });
    const operationsHandoffEvidenceRow = (
      key: ProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacket["operationsHandoffEvidenceRows"][number]["key"],
      label: string,
      safeDigest: string,
      safeFilename: string | undefined,
      checkedCount: number,
      complete = true
    ) => ({
      key,
      label,
      redactedLabel: label,
      status: complete ? "confirmed" as const : "blocked" as const,
      safeDigest,
      ...(safeFilename ? { safeFilename } : {}),
      checkedCount,
      complete
    });
    const certifiedReleaseOperationsHandoffReadinessPacket = providerWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacketSchema.parse({
      ...certifiedReleaseNoExecutionLockReceipt,
      packetKind: "qa-handoff-locked-archive-certified-release-operations-handoff-readiness-no-execution-evidence-packet",
      operationsHandoffReadinessStatus: "ready_for_handoff",
      operationsHandoffEvidencePacketStatus: "issued",
      noExecutionEvidenceStatus: "confirmed",
      launchApprovalLockStatus: "locked",
      digestContinuityStatus: "confirmed",
      safeFilename: "provider-webhook-review-qa-handoff-certified-release-operations-handoff-readiness-no-execution-evidence-packet.json",
      safeDigest: "sha256:certifiedreleaseoperationshandoffreadinesspacket",
      operationsHandoffEvidencePacketDigest: "sha256:certifiedreleaseoperationshandoffreadinesspacket",
      operationsHandoffGeneratedAt: "2026-06-13T00:00:00.000Z",
      operationsHandoffPrerequisiteRows: [
        operationsHandoffEvidenceRow("no_execution_lock_receipt_issued", "No-execution lock receipt issued", certifiedReleaseNoExecutionLockReceipt.noExecutionLockReceiptDigest, undefined, 1),
        operationsHandoffEvidenceRow("launch_approval_lock_retained", "Launch approval lock retained", certifiedReleaseNoExecutionLockReceipt.launchApprovalReceiptDigest, undefined, 1),
        operationsHandoffEvidenceRow("tenant_scope_confirmed", "Tenant scope confirmed", certifiedReleaseNoExecutionLockReceipt.safeDigest, undefined, 1),
        operationsHandoffEvidenceRow("digest_continuity_confirmed", "Operations handoff safe digest continuity", "sha256:certifiedreleaseoperationshandoffreadinesspacket", undefined, 2)
      ],
      operationsHandoffBlockerRows: [
        operationsHandoffEvidenceRow("provider_outbound_absent", "Provider outbound absent", certifiedReleaseNoExecutionLockReceipt.safeDigest, undefined, 0),
        operationsHandoffEvidenceRow("external_notification_absent", "External notification absent", certifiedReleaseNoExecutionLockReceipt.safeDigest, undefined, 0),
        operationsHandoffEvidenceRow("ai_call_absent", "AI call absent", certifiedReleaseNoExecutionLockReceipt.safeDigest, undefined, 0),
        operationsHandoffEvidenceRow("execution_attempts_zero", "Execution attempts zero", certifiedReleaseNoExecutionLockReceipt.safeDigest, undefined, 0)
      ],
      operationsHandoffEvidenceRows: [
        operationsHandoffEvidenceRow("operations_handoff_packet_ready", "Operations handoff evidence packet ready", "sha256:certifiedreleaseoperationshandoffreadinesspacket", "provider-webhook-review-qa-handoff-certified-release-operations-handoff-readiness-no-execution-evidence-packet.json", 1),
        operationsHandoffEvidenceRow("no_execution_evidence_confirmed", "No-execution evidence confirmed", certifiedReleaseNoExecutionLockReceipt.noExecutionLockReceiptDigest, certifiedReleaseNoExecutionLockReceipt.safeFilename, 8),
        operationsHandoffEvidenceRow("safe_digest_filename_recorded", "Safe digest and filename recorded", "sha256:certifiedreleaseoperationshandoffreadinesspacket", "provider-webhook-review-qa-handoff-certified-release-operations-handoff-readiness-no-execution-evidence-packet.json", 2),
        operationsHandoffEvidenceRow("human_operations_handoff_ready", "Human operations handoff ready", "sha256:certifiedreleaseoperationshandoffreadinesspacket", "provider-webhook-review-qa-handoff-certified-release-operations-handoff-readiness-no-execution-evidence-packet.json", 1)
      ],
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
        safeDigest: certifiedReleaseNoExecutionLockReceipt.safeDigest,
        safeFilename: certifiedReleaseNoExecutionLockReceipt.safeFilename,
        noExecutionLockReceiptDigest: certifiedReleaseNoExecutionLockReceipt.noExecutionLockReceiptDigest
      },
      counts: {
        ...certifiedReleaseNoExecutionLockReceipt.counts,
        operationsHandoffReadinessCheckedCount: 1,
        operationsHandoffMutationCount: 0,
        operationsHandoffPrerequisiteCount: 4,
        operationsHandoffPrerequisitePassedCount: 4,
        operationsHandoffBlockerCount: 4,
        operationsHandoffBlockingCount: 0,
        operationsHandoffEvidenceRowCount: 4,
        operationsHandoffEvidenceReadyCount: 4
      },
      externalCalls: 0
    });
    const certifiedReleaseOperationsHandoffAcceptanceReceiptDigest = "sha256:certifiedreleaseoperationshandoffacceptancereceipt";
    const certifiedReleaseOperationsHandoffAcceptanceReceiptFilename = "provider-webhook-review-qa-handoff-certified-release-operations-handoff-acceptance-receipt.json";
    const operationsHandoffAcceptanceRows = [
      operationsHandoffEvidenceRow("operations_handoff_packet_issued", "Operations handoff packet issued", certifiedReleaseOperationsHandoffReadinessPacket.operationsHandoffEvidencePacketDigest, certifiedReleaseOperationsHandoffReadinessPacket.safeFilename, 1),
      operationsHandoffEvidenceRow("operations_handoff_readiness_confirmed", "Operations handoff readiness confirmed", certifiedReleaseOperationsHandoffReadinessPacket.operationsHandoffEvidencePacketDigest, certifiedReleaseOperationsHandoffReadinessPacket.safeFilename, 1),
      operationsHandoffEvidenceRow("no_execution_evidence_confirmed", "No-execution evidence confirmed", certifiedReleaseNoExecutionLockReceipt.noExecutionLockReceiptDigest, certifiedReleaseNoExecutionLockReceipt.safeFilename, 8),
      operationsHandoffEvidenceRow("operations_handoff_acceptance_receipt_issued", "Operations handoff acceptance receipt issued", certifiedReleaseOperationsHandoffAcceptanceReceiptDigest, certifiedReleaseOperationsHandoffAcceptanceReceiptFilename, 1)
    ];
    const operationsCustodyRows = [
      operationsHandoffEvidenceRow("operations_custody_accepted", "Operations custody accepted", certifiedReleaseOperationsHandoffAcceptanceReceiptDigest, certifiedReleaseOperationsHandoffAcceptanceReceiptFilename, 1),
      operationsHandoffEvidenceRow("tenant_scope_confirmed", "Tenant scope confirmed", certifiedReleaseOperationsHandoffReadinessPacket.safeDigest, undefined, 1),
      operationsHandoffEvidenceRow("digest_continuity_confirmed", "Operations handoff acceptance digest continuity", certifiedReleaseOperationsHandoffAcceptanceReceiptDigest, certifiedReleaseOperationsHandoffAcceptanceReceiptFilename, 3),
      operationsHandoffEvidenceRow("provider_outbound_absent", "Provider outbound absent", certifiedReleaseNoExecutionLockReceipt.safeDigest, undefined, 0),
      operationsHandoffEvidenceRow("external_notification_absent", "External notification absent", certifiedReleaseNoExecutionLockReceipt.safeDigest, undefined, 0),
      operationsHandoffEvidenceRow("ai_call_absent", "AI call absent", certifiedReleaseNoExecutionLockReceipt.safeDigest, undefined, 0),
      operationsHandoffEvidenceRow("execution_attempts_zero", "Execution attempts zero", certifiedReleaseNoExecutionLockReceipt.safeDigest, undefined, 0)
    ];
    const certifiedReleaseOperationsHandoffAcceptanceReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceReceipt = providerWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceReceiptSchema.parse({
      ...certifiedReleaseOperationsHandoffReadinessPacket,
      receiptKind: "qa-handoff-locked-archive-certified-release-operations-handoff-acceptance-receipt",
      operationsHandoffAcceptanceStatus: "accepted",
      operationsCustodyStatus: "accepted",
      safeFilename: certifiedReleaseOperationsHandoffAcceptanceReceiptFilename,
      safeDigest: certifiedReleaseOperationsHandoffAcceptanceReceiptDigest,
      operationsHandoffAcceptanceReceiptDigest: certifiedReleaseOperationsHandoffAcceptanceReceiptDigest,
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
        safeDigest: certifiedReleaseOperationsHandoffReadinessPacket.safeDigest,
        safeFilename: certifiedReleaseOperationsHandoffReadinessPacket.safeFilename,
        operationsHandoffEvidencePacketDigest: certifiedReleaseOperationsHandoffReadinessPacket.operationsHandoffEvidencePacketDigest
      },
      counts: {
        ...certifiedReleaseOperationsHandoffReadinessPacket.counts,
        operationsHandoffAcceptanceCheckedCount: 1,
        operationsHandoffAcceptanceMutationCount: 0,
        operationsHandoffAcceptanceRowCount: operationsHandoffAcceptanceRows.length,
        operationsHandoffAcceptanceAcceptedCount: operationsHandoffAcceptanceRows.length,
        operationsCustodyRowCount: operationsCustodyRows.length,
        operationsCustodyAcceptedCount: operationsCustodyRows.length
      },
      externalCalls: 0
    });
    const certifiedReleaseOperationsCustodyMonitoringLedgerDigest = "sha256:certifiedreleaseoperationscustodymonitoringreadinessledger";
    const certifiedReleaseOperationsCustodyMonitoringLedgerFilename = "provider-webhook-review-qa-handoff-certified-release-operations-custody-monitoring-readiness-ledger.json";
    const operationsCustodyMonitoringRows = [
      operationsHandoffEvidenceRow("operations_handoff_acceptance_receipt_confirmed", "Operations handoff acceptance receipt confirmed", certifiedReleaseOperationsHandoffAcceptanceReceipt.operationsHandoffAcceptanceReceiptDigest, certifiedReleaseOperationsHandoffAcceptanceReceipt.safeFilename, 1),
      operationsHandoffEvidenceRow("operations_custody_accepted", "Operations custody accepted", certifiedReleaseOperationsHandoffAcceptanceReceipt.operationsHandoffAcceptanceReceiptDigest, certifiedReleaseOperationsHandoffAcceptanceReceipt.safeFilename, operationsCustodyRows.length),
      operationsHandoffEvidenceRow("operations_custody_monitoring_ready", "Operations custody monitoring ready", certifiedReleaseOperationsCustodyMonitoringLedgerDigest, certifiedReleaseOperationsCustodyMonitoringLedgerFilename, 1),
      operationsHandoffEvidenceRow("operations_custody_monitoring_ledger_issued", "Operations custody monitoring readiness ledger issued", certifiedReleaseOperationsCustodyMonitoringLedgerDigest, certifiedReleaseOperationsCustodyMonitoringLedgerFilename, 1)
    ];
    const noExecutionMonitoringRows = [
      operationsHandoffEvidenceRow("no_execution_monitoring_active", "No-execution monitoring active", certifiedReleaseOperationsCustodyMonitoringLedgerDigest, certifiedReleaseOperationsCustodyMonitoringLedgerFilename, 0),
      operationsHandoffEvidenceRow("no_execution_evidence_confirmed", "No-execution evidence confirmed", certifiedReleaseNoExecutionLockReceipt.noExecutionLockReceiptDigest, certifiedReleaseOperationsHandoffAcceptanceReceipt.safeFilename, 0),
      operationsHandoffEvidenceRow("launch_approval_lock_retained", "Launch approval lock retained", certifiedReleaseNoExecutionLockReceipt.launchApprovalReceiptDigest, certifiedReleaseOperationsHandoffAcceptanceReceipt.safeFilename, 1),
      operationsHandoffEvidenceRow("tenant_scope_confirmed", "Tenant scope confirmed", certifiedReleaseOperationsHandoffAcceptanceReceipt.safeDigest, certifiedReleaseOperationsHandoffAcceptanceReceipt.safeFilename, 1),
      operationsHandoffEvidenceRow("digest_continuity_confirmed", "Operations custody monitoring digest continuity", certifiedReleaseOperationsCustodyMonitoringLedgerDigest, certifiedReleaseOperationsCustodyMonitoringLedgerFilename, 4),
      operationsHandoffEvidenceRow("provider_outbound_absent", "Provider outbound absent", certifiedReleaseOperationsHandoffAcceptanceReceipt.safeDigest, certifiedReleaseOperationsHandoffAcceptanceReceipt.safeFilename, 0),
      operationsHandoffEvidenceRow("external_notification_absent", "External notification absent", certifiedReleaseOperationsHandoffAcceptanceReceipt.safeDigest, certifiedReleaseOperationsHandoffAcceptanceReceipt.safeFilename, 0),
      operationsHandoffEvidenceRow("ai_call_absent", "AI call absent", certifiedReleaseOperationsHandoffAcceptanceReceipt.safeDigest, certifiedReleaseOperationsHandoffAcceptanceReceipt.safeFilename, 0),
      operationsHandoffEvidenceRow("execution_attempts_zero", "Execution attempts zero", certifiedReleaseOperationsHandoffAcceptanceReceipt.safeDigest, certifiedReleaseOperationsHandoffAcceptanceReceipt.safeFilename, 0),
      operationsHandoffEvidenceRow("monitoring_readiness_confirmed", "Monitoring readiness confirmed", certifiedReleaseOperationsCustodyMonitoringLedgerDigest, certifiedReleaseOperationsCustodyMonitoringLedgerFilename, 1)
    ];
    const certifiedReleaseOperationsCustodyMonitoringReadinessLedger: ProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedger = providerWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedgerSchema.parse({
      ...certifiedReleaseOperationsHandoffAcceptanceReceipt,
      ledgerKind: "qa-handoff-locked-archive-certified-release-operations-custody-monitoring-readiness-ledger",
      operationsCustodyMonitoringStatus: "ready",
      monitoringReadinessStatus: "ready",
      noExecutionMonitoringStatus: "active",
      safeFilename: certifiedReleaseOperationsCustodyMonitoringLedgerFilename,
      safeDigest: certifiedReleaseOperationsCustodyMonitoringLedgerDigest,
      operationsCustodyMonitoringLedgerDigest: certifiedReleaseOperationsCustodyMonitoringLedgerDigest,
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
        safeDigest: certifiedReleaseOperationsHandoffAcceptanceReceipt.safeDigest,
        safeFilename: certifiedReleaseOperationsHandoffAcceptanceReceipt.safeFilename,
        operationsHandoffAcceptanceReceiptDigest: certifiedReleaseOperationsHandoffAcceptanceReceipt.operationsHandoffAcceptanceReceiptDigest,
        operationsHandoffEvidencePacketDigest: certifiedReleaseOperationsHandoffAcceptanceReceipt.operationsHandoffEvidencePacketDigest
      },
      counts: {
        ...certifiedReleaseOperationsHandoffAcceptanceReceipt.counts,
        operationsCustodyMonitoringCheckedCount: 1,
        operationsCustodyMonitoringMutationCount: 0,
        operationsCustodyMonitoringRowCount: operationsCustodyMonitoringRows.length,
        operationsCustodyMonitoringReadyCount: operationsCustodyMonitoringRows.length,
        noExecutionMonitoringRowCount: noExecutionMonitoringRows.length,
        noExecutionMonitoringActiveCount: noExecutionMonitoringRows.length
      },
      externalCalls: 0
    });
    const certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceiptDigest = "sha256:certifiedreleaseoperationscustodymonitoringcloseoutsealreceipt";
    const certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceiptFilename = "provider-webhook-review-qa-handoff-certified-release-operations-custody-monitoring-closeout-seal-receipt.json";
    const operationsCustodyMonitoringCloseoutRows = [
      operationsHandoffEvidenceRow("operations_custody_monitoring_ledger_reviewed", "Operations custody monitoring ledger reviewed", certifiedReleaseOperationsCustodyMonitoringReadinessLedger.operationsCustodyMonitoringLedgerDigest, certifiedReleaseOperationsCustodyMonitoringReadinessLedger.safeFilename, 1),
      operationsHandoffEvidenceRow("operations_custody_monitoring_closeout_sealed", "Operations custody monitoring closeout sealed", certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceiptDigest, certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceiptFilename, 1),
      operationsHandoffEvidenceRow("closeout_seal_receipt_issued", "Closeout seal receipt issued", certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceiptDigest, certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceiptFilename, 1),
      operationsHandoffEvidenceRow("no_execution_monitoring_active", "No-execution monitoring active", certifiedReleaseOperationsCustodyMonitoringReadinessLedger.operationsCustodyMonitoringLedgerDigest, certifiedReleaseOperationsCustodyMonitoringReadinessLedger.safeFilename, 0),
      operationsHandoffEvidenceRow("digest_continuity_confirmed", "Operations custody monitoring closeout digest continuity", certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceiptDigest, certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceiptFilename, 5),
      operationsHandoffEvidenceRow("provider_outbound_absent", "Provider outbound absent", certifiedReleaseOperationsCustodyMonitoringReadinessLedger.safeDigest, certifiedReleaseOperationsCustodyMonitoringReadinessLedger.safeFilename, 0),
      operationsHandoffEvidenceRow("external_notification_absent", "External notification absent", certifiedReleaseOperationsCustodyMonitoringReadinessLedger.safeDigest, certifiedReleaseOperationsCustodyMonitoringReadinessLedger.safeFilename, 0),
      operationsHandoffEvidenceRow("ai_call_absent", "AI call absent", certifiedReleaseOperationsCustodyMonitoringReadinessLedger.safeDigest, certifiedReleaseOperationsCustodyMonitoringReadinessLedger.safeFilename, 0),
      operationsHandoffEvidenceRow("execution_attempts_zero", "Execution attempts zero", certifiedReleaseOperationsCustodyMonitoringReadinessLedger.safeDigest, certifiedReleaseOperationsCustodyMonitoringReadinessLedger.safeFilename, 0)
    ];
    const certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt: ProviderWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt = providerWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceiptSchema.parse({
      ...certifiedReleaseOperationsCustodyMonitoringReadinessLedger,
      receiptKind: "qa-handoff-locked-archive-certified-release-operations-custody-monitoring-closeout-seal-receipt",
      operationsCustodyMonitoringCloseoutStatus: "sealed",
      closeoutSealStatus: "sealed",
      safeFilename: certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceiptFilename,
      safeDigest: certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceiptDigest,
      operationsCustodyMonitoringCloseoutSealReceiptDigest: certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceiptDigest,
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
        safeDigest: certifiedReleaseOperationsCustodyMonitoringReadinessLedger.safeDigest,
        safeFilename: certifiedReleaseOperationsCustodyMonitoringReadinessLedger.safeFilename,
        operationsCustodyMonitoringLedgerDigest: certifiedReleaseOperationsCustodyMonitoringReadinessLedger.operationsCustodyMonitoringLedgerDigest,
        operationsHandoffAcceptanceReceiptDigest: certifiedReleaseOperationsCustodyMonitoringReadinessLedger.operationsHandoffAcceptanceReceiptDigest,
        operationsHandoffEvidencePacketDigest: certifiedReleaseOperationsCustodyMonitoringReadinessLedger.operationsHandoffEvidencePacketDigest
      },
      counts: {
        ...certifiedReleaseOperationsCustodyMonitoringReadinessLedger.counts,
        operationsCustodyMonitoringCloseoutCheckedCount: 1,
        operationsCustodyMonitoringCloseoutSealMutationCount: 0,
        operationsCustodyMonitoringCloseoutRowCount: operationsCustodyMonitoringCloseoutRows.length,
        operationsCustodyMonitoringCloseoutSealedCount: operationsCustodyMonitoringCloseoutRows.length
      },
      externalCalls: 0
    });
    const certifiedReleaseFinalNoExecutionEvidenceRollupDigest = "sha256:certifiedreleasefinalnoexecutionevidencerollup";
    const certifiedReleaseFinalNoExecutionEvidenceRollupFilename = "provider-webhook-review-qa-handoff-certified-release-final-no-execution-evidence-rollup.json";
    const finalNoExecutionEvidenceRows = [
      operationsHandoffEvidenceRow("sprint_103_launch_approval_receipt_retained", "Sprint 103 launch approval receipt retained", certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.launchApprovalReceiptDigest, certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.safeFilename, 1),
      operationsHandoffEvidenceRow("sprint_104_no_execution_lock_receipt_retained", "Sprint 104 no-execution lock receipt retained", certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.noExecutionLockReceiptDigest, certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.safeFilename, 1),
      operationsHandoffEvidenceRow("sprint_105_operations_handoff_packet_retained", "Sprint 105 operations handoff packet retained", certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.operationsHandoffEvidencePacketDigest, certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.safeFilename, 1),
      operationsHandoffEvidenceRow("sprint_106_operations_handoff_acceptance_retained", "Sprint 106 operations handoff acceptance retained", certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.operationsHandoffAcceptanceReceiptDigest, certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.safeFilename, 1),
      operationsHandoffEvidenceRow("sprint_107_operations_custody_monitoring_retained", "Sprint 107 operations custody monitoring retained", certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyMonitoringLedgerDigest, certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.safeFilename, 1),
      operationsHandoffEvidenceRow("sprint_108_closeout_seal_receipt_retained", "Sprint 108 closeout seal receipt retained", certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyMonitoringCloseoutSealReceiptDigest, certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.safeFilename, 1),
      operationsHandoffEvidenceRow("final_no_execution_evidence_rollup_issued", "Final no-execution evidence rollup issued", certifiedReleaseFinalNoExecutionEvidenceRollupDigest, certifiedReleaseFinalNoExecutionEvidenceRollupFilename, 1),
      operationsHandoffEvidenceRow("final_archive_custody_sealed", "Final archive custody sealed", certifiedReleaseFinalNoExecutionEvidenceRollupDigest, certifiedReleaseFinalNoExecutionEvidenceRollupFilename, 1),
      operationsHandoffEvidenceRow("no_execution_evidence_confirmed", "No-execution evidence confirmed", certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.noExecutionLockReceiptDigest, certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.safeFilename, 0),
      operationsHandoffEvidenceRow("no_execution_monitoring_active", "No-execution monitoring active", certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyMonitoringLedgerDigest, certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.safeFilename, 0),
      operationsHandoffEvidenceRow("launch_approval_lock_retained", "Launch approval lock retained", certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.launchApprovalReceiptDigest, certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.safeFilename, 1),
      operationsHandoffEvidenceRow("tenant_scope_confirmed", "Tenant scope confirmed", certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.safeDigest, certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.safeFilename, 1),
      operationsHandoffEvidenceRow("digest_continuity_confirmed", "Final no-execution evidence rollup digest continuity", certifiedReleaseFinalNoExecutionEvidenceRollupDigest, certifiedReleaseFinalNoExecutionEvidenceRollupFilename, 6),
      operationsHandoffEvidenceRow("provider_outbound_absent", "Provider outbound absent", certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.safeDigest, certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.safeFilename, 0),
      operationsHandoffEvidenceRow("external_notification_absent", "External notification absent", certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.safeDigest, certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.safeFilename, 0),
      operationsHandoffEvidenceRow("ai_call_absent", "AI call absent", certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.safeDigest, certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.safeFilename, 0),
      operationsHandoffEvidenceRow("execution_attempts_zero", "Execution attempts zero", certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.safeDigest, certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.safeFilename, 0)
    ];
    const certifiedReleaseFinalNoExecutionEvidenceRollup: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollup = providerWebhookReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollupSchema.parse({
      ...certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt,
      rollupKind: "qa-handoff-locked-archive-certified-release-final-no-execution-evidence-rollup",
      finalNoExecutionEvidenceRollupStatus: "issued",
      finalArchiveCustodyStatus: "sealed",
      safeFilename: certifiedReleaseFinalNoExecutionEvidenceRollupFilename,
      safeDigest: certifiedReleaseFinalNoExecutionEvidenceRollupDigest,
      finalNoExecutionEvidenceRollupDigest: certifiedReleaseFinalNoExecutionEvidenceRollupDigest,
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
        safeDigest: certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.safeDigest,
        safeFilename: certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.safeFilename,
        launchApprovalReceiptDigest: certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.launchApprovalReceiptDigest,
        noExecutionLockReceiptDigest: certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.noExecutionLockReceiptDigest,
        operationsHandoffEvidencePacketDigest: certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.operationsHandoffEvidencePacketDigest,
        operationsHandoffAcceptanceReceiptDigest: certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.operationsHandoffAcceptanceReceiptDigest,
        operationsCustodyMonitoringLedgerDigest: certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyMonitoringLedgerDigest,
        operationsCustodyMonitoringCloseoutSealReceiptDigest: certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyMonitoringCloseoutSealReceiptDigest
      },
      counts: {
        ...certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.counts,
        finalNoExecutionEvidenceRollupCheckedCount: 1,
        finalNoExecutionEvidenceRollupMutationCount: 0,
        finalNoExecutionEvidenceRollupRowCount: finalNoExecutionEvidenceRows.length,
        finalNoExecutionEvidenceRollupIssuedCount: finalNoExecutionEvidenceRows.length,
        finalArchiveCustodySealedCount: 1
      },
      externalCalls: 0
    });
    const certifiedReleaseFinalEvidenceIndexRegressionGuardrailReceiptDigest = "sha256:certifiedreleasefinalevidenceindexregressionguardrailreceipt";
    const certifiedReleaseFinalEvidenceIndexRegressionGuardrailReceiptFilename = "provider-webhook-review-qa-handoff-certified-release-final-evidence-index-regression-guardrail-receipt.json";
    const finalEvidenceIndexRows: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt["finalEvidenceIndexRows"] = [
      { sprintNumber: 103, artifactLabel: "Sprint 103 launch approval receipt", artifactStatus: "issued", safeDigest: certifiedReleaseFinalNoExecutionEvidenceRollup.launchApprovalReceiptDigest, safeFilename: certifiedReleaseFinalNoExecutionEvidenceRollup.safeFilename, checkedAt: "2026-06-14T00:00:00.000Z", externalCalls: 0, executionAttemptCount: 0, providerOutboundCallCount: 0, externalNotificationSendCount: 0, aiCallCount: 0, mutationCount: 0 },
      { sprintNumber: 104, artifactLabel: "Sprint 104 no-execution lock receipt", artifactStatus: "locked", safeDigest: certifiedReleaseFinalNoExecutionEvidenceRollup.noExecutionLockReceiptDigest, safeFilename: certifiedReleaseFinalNoExecutionEvidenceRollup.safeFilename, checkedAt: "2026-06-14T00:00:00.000Z", externalCalls: 0, executionAttemptCount: 0, providerOutboundCallCount: 0, externalNotificationSendCount: 0, aiCallCount: 0, mutationCount: 0 },
      { sprintNumber: 105, artifactLabel: "Sprint 105 operations handoff readiness packet", artifactStatus: "confirmed", safeDigest: certifiedReleaseFinalNoExecutionEvidenceRollup.operationsHandoffEvidencePacketDigest, safeFilename: certifiedReleaseFinalNoExecutionEvidenceRollup.safeFilename, checkedAt: "2026-06-14T00:00:00.000Z", externalCalls: 0, executionAttemptCount: 0, providerOutboundCallCount: 0, externalNotificationSendCount: 0, aiCallCount: 0, mutationCount: 0 },
      { sprintNumber: 106, artifactLabel: "Sprint 106 operations handoff acceptance receipt", artifactStatus: "accepted", safeDigest: certifiedReleaseFinalNoExecutionEvidenceRollup.operationsHandoffAcceptanceReceiptDigest, safeFilename: certifiedReleaseFinalNoExecutionEvidenceRollup.safeFilename, checkedAt: "2026-06-14T00:00:00.000Z", externalCalls: 0, executionAttemptCount: 0, providerOutboundCallCount: 0, externalNotificationSendCount: 0, aiCallCount: 0, mutationCount: 0 },
      { sprintNumber: 107, artifactLabel: "Sprint 107 operations custody monitoring readiness ledger", artifactStatus: "ready", safeDigest: certifiedReleaseFinalNoExecutionEvidenceRollup.operationsCustodyMonitoringLedgerDigest, safeFilename: certifiedReleaseFinalNoExecutionEvidenceRollup.safeFilename, checkedAt: "2026-06-14T00:00:00.000Z", externalCalls: 0, executionAttemptCount: 0, providerOutboundCallCount: 0, externalNotificationSendCount: 0, aiCallCount: 0, mutationCount: 0 },
      { sprintNumber: 108, artifactLabel: "Sprint 108 operations custody monitoring closeout seal receipt", artifactStatus: "sealed", safeDigest: certifiedReleaseFinalNoExecutionEvidenceRollup.operationsCustodyMonitoringCloseoutSealReceiptDigest, safeFilename: certifiedReleaseFinalNoExecutionEvidenceRollup.safeFilename, checkedAt: "2026-06-14T00:00:00.000Z", externalCalls: 0, executionAttemptCount: 0, providerOutboundCallCount: 0, externalNotificationSendCount: 0, aiCallCount: 0, mutationCount: 0 },
      { sprintNumber: 109, artifactLabel: "Sprint 109 final no-execution evidence rollup", artifactStatus: "issued", safeDigest: certifiedReleaseFinalNoExecutionEvidenceRollup.finalNoExecutionEvidenceRollupDigest, safeFilename: certifiedReleaseFinalNoExecutionEvidenceRollup.safeFilename, checkedAt: "2026-06-14T00:00:00.000Z", externalCalls: 0, executionAttemptCount: 0, providerOutboundCallCount: 0, externalNotificationSendCount: 0, aiCallCount: 0, mutationCount: 0 },
      { sprintNumber: 110, artifactLabel: "Sprint 110 final evidence index regression guardrail receipt", artifactStatus: "passed", safeDigest: certifiedReleaseFinalEvidenceIndexRegressionGuardrailReceiptDigest, safeFilename: certifiedReleaseFinalEvidenceIndexRegressionGuardrailReceiptFilename, generatedAt: "2026-06-14T00:00:00.000Z", externalCalls: 0, executionAttemptCount: 0, providerOutboundCallCount: 0, externalNotificationSendCount: 0, aiCallCount: 0, mutationCount: 0 }
    ];
    const certifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt = providerWebhookReviewQaHandoffCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceiptSchema.parse({
      receiptKind: "qa-handoff-locked-archive-certified-release-final-evidence-index-regression-guardrail-receipt",
      finalEvidenceIndexStatus: "issued",
      regressionGuardrailReceiptStatus: "issued",
      regressionGuardrailStatus: "passed",
      finalNoExecutionEvidenceRollupStatus: certifiedReleaseFinalNoExecutionEvidenceRollup.finalNoExecutionEvidenceRollupStatus,
      finalArchiveCustodyStatus: certifiedReleaseFinalNoExecutionEvidenceRollup.finalArchiveCustodyStatus,
      operationsCustodyMonitoringCloseoutStatus: certifiedReleaseFinalNoExecutionEvidenceRollup.operationsCustodyMonitoringCloseoutStatus,
      operationsCustodyMonitoringStatus: certifiedReleaseFinalNoExecutionEvidenceRollup.operationsCustodyMonitoringStatus,
      operationsHandoffAcceptanceStatus: certifiedReleaseFinalNoExecutionEvidenceRollup.operationsHandoffAcceptanceStatus,
      operationsCustodyStatus: certifiedReleaseFinalNoExecutionEvidenceRollup.operationsCustodyStatus,
      noExecutionEvidenceStatus: certifiedReleaseFinalNoExecutionEvidenceRollup.noExecutionEvidenceStatus,
      noExecutionMonitoringStatus: certifiedReleaseFinalNoExecutionEvidenceRollup.noExecutionMonitoringStatus,
      launchApprovalLockStatus: certifiedReleaseFinalNoExecutionEvidenceRollup.launchApprovalLockStatus,
      tenantScopeStatus: certifiedReleaseFinalNoExecutionEvidenceRollup.tenantScopeStatus,
      digestContinuityStatus: certifiedReleaseFinalNoExecutionEvidenceRollup.digestContinuityStatus,
      closeoutSealStatus: certifiedReleaseFinalNoExecutionEvidenceRollup.closeoutSealStatus,
      providerOutboundStatus: certifiedReleaseFinalNoExecutionEvidenceRollup.providerOutboundStatus,
      externalNotificationStatus: certifiedReleaseFinalNoExecutionEvidenceRollup.externalNotificationStatus,
      aiCallStatus: certifiedReleaseFinalNoExecutionEvidenceRollup.aiCallStatus,
      safeFilename: certifiedReleaseFinalEvidenceIndexRegressionGuardrailReceiptFilename,
      safeDigest: certifiedReleaseFinalEvidenceIndexRegressionGuardrailReceiptDigest,
      finalEvidenceIndexDigest: certifiedReleaseFinalEvidenceIndexRegressionGuardrailReceiptDigest,
      regressionGuardrailReceiptDigest: certifiedReleaseFinalEvidenceIndexRegressionGuardrailReceiptDigest,
      finalNoExecutionEvidenceRollupDigest: certifiedReleaseFinalNoExecutionEvidenceRollup.finalNoExecutionEvidenceRollupDigest,
      operationsCustodyMonitoringCloseoutSealReceiptDigest: certifiedReleaseFinalNoExecutionEvidenceRollup.operationsCustodyMonitoringCloseoutSealReceiptDigest,
      operationsCustodyMonitoringLedgerDigest: certifiedReleaseFinalNoExecutionEvidenceRollup.operationsCustodyMonitoringLedgerDigest,
      operationsHandoffAcceptanceReceiptDigest: certifiedReleaseFinalNoExecutionEvidenceRollup.operationsHandoffAcceptanceReceiptDigest,
      operationsHandoffEvidencePacketDigest: certifiedReleaseFinalNoExecutionEvidenceRollup.operationsHandoffEvidencePacketDigest,
      noExecutionLockReceiptDigest: certifiedReleaseFinalNoExecutionEvidenceRollup.noExecutionLockReceiptDigest,
      launchApprovalReceiptDigest: certifiedReleaseFinalNoExecutionEvidenceRollup.launchApprovalReceiptDigest,
      generatedAt: "2026-06-14T00:00:00.000Z",
      checkedAt: "2026-06-14T00:00:00.000Z",
      finalEvidenceIndexRows,
      inheritedFinalNoExecutionEvidenceRollupSummary: {
        finalNoExecutionEvidenceRollupStatus: "issued",
        finalArchiveCustodyStatus: "sealed",
        finalNoExecutionEvidenceRollupDigest: certifiedReleaseFinalNoExecutionEvidenceRollup.finalNoExecutionEvidenceRollupDigest,
        safeDigest: certifiedReleaseFinalNoExecutionEvidenceRollup.safeDigest,
        safeFilename: certifiedReleaseFinalNoExecutionEvidenceRollup.safeFilename,
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
    });
    const certifiedReleaseFinalArchiveSealOperationalClosureReceiptDigest = "sha256:certifiedreleasefinalarchivesealoperationalclosurereceipt";
    const certifiedReleaseFinalArchiveSealOperationalClosureReceiptFilename = "provider-webhook-review-qa-handoff-certified-release-final-archive-seal-operational-closure-receipt.json";
    const finalArchiveSealOperationalClosureRows: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealOperationalClosureReceipt["finalArchiveSealOperationalClosureRows"] = [
      ...finalEvidenceIndexRows,
      { sprintNumber: 111, artifactLabel: "Sprint 111 final archive seal operational closure receipt", artifactStatus: "closed", safeDigest: certifiedReleaseFinalArchiveSealOperationalClosureReceiptDigest, safeFilename: certifiedReleaseFinalArchiveSealOperationalClosureReceiptFilename, generatedAt: "2026-06-14T00:00:00.000Z", externalCalls: 0, executionAttemptCount: 0, providerOutboundCallCount: 0, externalNotificationSendCount: 0, aiCallCount: 0, mutationCount: 0 }
    ];
    const certifiedReleaseFinalArchiveSealOperationalClosureReceipt = providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealOperationalClosureReceiptSchema.parse({
      receiptKind: "qa-handoff-locked-archive-certified-release-final-archive-seal-operational-closure-receipt",
      finalOperationalClosureReceiptStatus: "issued",
      finalArchiveSealStatus: "sealed",
      releaseClosureStatus: "closed",
      finalEvidenceIndexStatus: certifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt.finalEvidenceIndexStatus,
      regressionGuardrailReceiptStatus: certifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt.regressionGuardrailReceiptStatus,
      regressionGuardrailStatus: certifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt.regressionGuardrailStatus,
      finalNoExecutionEvidenceRollupStatus: certifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt.finalNoExecutionEvidenceRollupStatus,
      finalArchiveCustodyStatus: certifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt.finalArchiveCustodyStatus,
      operationsCustodyMonitoringCloseoutStatus: certifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt.operationsCustodyMonitoringCloseoutStatus,
      closeoutSealStatus: certifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt.closeoutSealStatus,
      noExecutionEvidenceStatus: certifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt.noExecutionEvidenceStatus,
      noExecutionMonitoringStatus: certifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt.noExecutionMonitoringStatus,
      tenantScopeStatus: certifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt.tenantScopeStatus,
      digestContinuityStatus: certifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt.digestContinuityStatus,
      providerOutboundStatus: certifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt.providerOutboundStatus,
      externalNotificationStatus: certifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt.externalNotificationStatus,
      aiCallStatus: certifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt.aiCallStatus,
      safeFilename: certifiedReleaseFinalArchiveSealOperationalClosureReceiptFilename,
      safeDigest: certifiedReleaseFinalArchiveSealOperationalClosureReceiptDigest,
      finalOperationalClosureReceiptDigest: certifiedReleaseFinalArchiveSealOperationalClosureReceiptDigest,
      finalArchiveSealDigest: certifiedReleaseFinalArchiveSealOperationalClosureReceiptDigest,
      finalEvidenceIndexDigest: certifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt.finalEvidenceIndexDigest,
      regressionGuardrailReceiptDigest: certifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt.regressionGuardrailReceiptDigest,
      finalNoExecutionEvidenceRollupDigest: certifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt.finalNoExecutionEvidenceRollupDigest,
      generatedAt: "2026-06-14T00:00:00.000Z",
      checkedAt: "2026-06-14T00:00:00.000Z",
      finalArchiveSealOperationalClosureRows,
      inheritedFinalEvidenceIndexRegressionGuardrailReceiptSummary: {
        finalEvidenceIndexStatus: "issued",
        regressionGuardrailReceiptStatus: "issued",
        regressionGuardrailStatus: "passed",
        finalEvidenceIndexDigest: certifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt.finalEvidenceIndexDigest,
        regressionGuardrailReceiptDigest: certifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt.regressionGuardrailReceiptDigest,
        safeDigest: certifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt.safeDigest,
        safeFilename: certifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt.safeFilename,
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
    });
    const certifiedReleasePostClosurePreservationVerificationReceiptDigest = "sha256:certifiedreleasepostclosurepreservationverificationreceipt";
    const certifiedReleasePostClosurePreservationVerificationReceiptFilename = "provider-webhook-certified-release-post-closure-preservation-verification-receipt.json";
    const postClosurePreservationVerificationRows: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceipt["postClosurePreservationVerificationRows"] = [
      ...finalArchiveSealOperationalClosureRows,
      { sprintNumber: 112, artifactLabel: "Sprint 112 post-closure preservation verification receipt", artifactStatus: "verified", safeDigest: certifiedReleasePostClosurePreservationVerificationReceiptDigest, safeFilename: certifiedReleasePostClosurePreservationVerificationReceiptFilename, generatedAt: "2026-06-15T00:00:00.000Z", checkedAt: "2026-06-15T00:00:00.000Z", externalCalls: 0, executionAttemptCount: 0, providerOutboundCallCount: 0, externalNotificationSendCount: 0, aiCallCount: 0, mutationCount: 0 }
    ];
    const certifiedReleasePostClosurePreservationVerificationReceipt = providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceiptSchema.parse({
      receiptKind: "qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-verification-receipt",
      postClosurePreservationVerificationStatus: "verified",
      finalArchiveSealPostClosurePreservationStatus: "preserved",
      finalOperationalClosureReceiptStatus: certifiedReleaseFinalArchiveSealOperationalClosureReceipt.finalOperationalClosureReceiptStatus,
      finalArchiveSealStatus: certifiedReleaseFinalArchiveSealOperationalClosureReceipt.finalArchiveSealStatus,
      releaseClosureStatus: certifiedReleaseFinalArchiveSealOperationalClosureReceipt.releaseClosureStatus,
      finalEvidenceIndexStatus: certifiedReleaseFinalArchiveSealOperationalClosureReceipt.finalEvidenceIndexStatus,
      regressionGuardrailReceiptStatus: certifiedReleaseFinalArchiveSealOperationalClosureReceipt.regressionGuardrailReceiptStatus,
      regressionGuardrailStatus: certifiedReleaseFinalArchiveSealOperationalClosureReceipt.regressionGuardrailStatus,
      finalNoExecutionEvidenceRollupStatus: certifiedReleaseFinalArchiveSealOperationalClosureReceipt.finalNoExecutionEvidenceRollupStatus,
      finalArchiveCustodyStatus: certifiedReleaseFinalArchiveSealOperationalClosureReceipt.finalArchiveCustodyStatus,
      operationsCustodyMonitoringCloseoutStatus: certifiedReleaseFinalArchiveSealOperationalClosureReceipt.operationsCustodyMonitoringCloseoutStatus,
      closeoutSealStatus: certifiedReleaseFinalArchiveSealOperationalClosureReceipt.closeoutSealStatus,
      noExecutionEvidenceStatus: certifiedReleaseFinalArchiveSealOperationalClosureReceipt.noExecutionEvidenceStatus,
      noExecutionMonitoringStatus: certifiedReleaseFinalArchiveSealOperationalClosureReceipt.noExecutionMonitoringStatus,
      tenantScopeStatus: certifiedReleaseFinalArchiveSealOperationalClosureReceipt.tenantScopeStatus,
      digestContinuityStatus: certifiedReleaseFinalArchiveSealOperationalClosureReceipt.digestContinuityStatus,
      providerOutboundStatus: certifiedReleaseFinalArchiveSealOperationalClosureReceipt.providerOutboundStatus,
      externalNotificationStatus: certifiedReleaseFinalArchiveSealOperationalClosureReceipt.externalNotificationStatus,
      aiCallStatus: certifiedReleaseFinalArchiveSealOperationalClosureReceipt.aiCallStatus,
      safeFilename: certifiedReleasePostClosurePreservationVerificationReceiptFilename,
      safeDigest: certifiedReleasePostClosurePreservationVerificationReceiptDigest,
      postClosurePreservationVerificationDigest: certifiedReleasePostClosurePreservationVerificationReceiptDigest,
      finalArchiveSealOperationalClosureReceiptDigest: certifiedReleaseFinalArchiveSealOperationalClosureReceipt.safeDigest,
      finalArchiveSealDigest: certifiedReleaseFinalArchiveSealOperationalClosureReceipt.finalArchiveSealDigest,
      finalEvidenceIndexDigest: certifiedReleaseFinalArchiveSealOperationalClosureReceipt.finalEvidenceIndexDigest,
      regressionGuardrailReceiptDigest: certifiedReleaseFinalArchiveSealOperationalClosureReceipt.regressionGuardrailReceiptDigest,
      finalNoExecutionEvidenceRollupDigest: certifiedReleaseFinalArchiveSealOperationalClosureReceipt.finalNoExecutionEvidenceRollupDigest,
      generatedAt: "2026-06-15T00:00:00.000Z",
      checkedAt: "2026-06-15T00:00:00.000Z",
      postClosurePreservationVerificationRows,
      inheritedFinalArchiveSealOperationalClosureReceiptSummary: {
        finalOperationalClosureReceiptStatus: "issued",
        finalArchiveSealStatus: "sealed",
        releaseClosureStatus: "closed",
        safeDigest: certifiedReleaseFinalArchiveSealOperationalClosureReceipt.safeDigest,
        safeFilename: certifiedReleaseFinalArchiveSealOperationalClosureReceipt.safeFilename,
        finalOperationalClosureReceiptDigest: certifiedReleaseFinalArchiveSealOperationalClosureReceipt.finalOperationalClosureReceiptDigest,
        finalArchiveSealDigest: certifiedReleaseFinalArchiveSealOperationalClosureReceipt.finalArchiveSealDigest,
        finalArchiveSealOperationalClosureRowCount: certifiedReleaseFinalArchiveSealOperationalClosureReceipt.finalArchiveSealOperationalClosureRows.length,
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
    });
    const certifiedReleasePostClosurePreservationContinuityLedgerReceiptDigest = "sha256:certifiedreleasepostclosurepreservationcontinuityledgerreceipt";
    const certifiedReleasePostClosurePreservationContinuityLedgerReceiptFilename = "provider-webhook-certified-release-post-closure-preservation-continuity-ledger-receipt.json";
    const preservationContinuityLedgerRows: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceipt["preservationContinuityLedgerRows"] = [
      ...postClosurePreservationVerificationRows,
      { sprintNumber: 113, artifactLabel: "Sprint 113 post-closure preservation continuity ledger receipt", artifactStatus: "continuous", safeDigest: certifiedReleasePostClosurePreservationContinuityLedgerReceiptDigest, safeFilename: certifiedReleasePostClosurePreservationContinuityLedgerReceiptFilename, generatedAt: "2026-06-15T00:00:00.000Z", checkedAt: "2026-06-15T00:00:00.000Z", externalCalls: 0, executionAttemptCount: 0, providerOutboundCallCount: 0, externalNotificationSendCount: 0, aiCallCount: 0, mutationCount: 0 }
    ];
    const certifiedReleasePostClosurePreservationContinuityLedgerReceipt = providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceiptSchema.parse({
      receiptKind: "qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-continuity-ledger-receipt",
      postClosurePreservationContinuityLedgerStatus: "continuous",
      postClosurePreservationVerificationStatus: certifiedReleasePostClosurePreservationVerificationReceipt.postClosurePreservationVerificationStatus,
      finalArchiveSealPostClosurePreservationStatus: certifiedReleasePostClosurePreservationVerificationReceipt.finalArchiveSealPostClosurePreservationStatus,
      finalOperationalClosureReceiptStatus: certifiedReleasePostClosurePreservationVerificationReceipt.finalOperationalClosureReceiptStatus,
      finalArchiveSealStatus: certifiedReleasePostClosurePreservationVerificationReceipt.finalArchiveSealStatus,
      releaseClosureStatus: certifiedReleasePostClosurePreservationVerificationReceipt.releaseClosureStatus,
      finalEvidenceIndexStatus: certifiedReleasePostClosurePreservationVerificationReceipt.finalEvidenceIndexStatus,
      regressionGuardrailReceiptStatus: certifiedReleasePostClosurePreservationVerificationReceipt.regressionGuardrailReceiptStatus,
      regressionGuardrailStatus: certifiedReleasePostClosurePreservationVerificationReceipt.regressionGuardrailStatus,
      finalNoExecutionEvidenceRollupStatus: certifiedReleasePostClosurePreservationVerificationReceipt.finalNoExecutionEvidenceRollupStatus,
      finalArchiveCustodyStatus: certifiedReleasePostClosurePreservationVerificationReceipt.finalArchiveCustodyStatus,
      operationsCustodyMonitoringCloseoutStatus: certifiedReleasePostClosurePreservationVerificationReceipt.operationsCustodyMonitoringCloseoutStatus,
      closeoutSealStatus: certifiedReleasePostClosurePreservationVerificationReceipt.closeoutSealStatus,
      noExecutionEvidenceStatus: certifiedReleasePostClosurePreservationVerificationReceipt.noExecutionEvidenceStatus,
      noExecutionMonitoringStatus: certifiedReleasePostClosurePreservationVerificationReceipt.noExecutionMonitoringStatus,
      tenantScopeStatus: certifiedReleasePostClosurePreservationVerificationReceipt.tenantScopeStatus,
      digestContinuityStatus: certifiedReleasePostClosurePreservationVerificationReceipt.digestContinuityStatus,
      providerOutboundStatus: certifiedReleasePostClosurePreservationVerificationReceipt.providerOutboundStatus,
      externalNotificationStatus: certifiedReleasePostClosurePreservationVerificationReceipt.externalNotificationStatus,
      aiCallStatus: certifiedReleasePostClosurePreservationVerificationReceipt.aiCallStatus,
      safeFilename: certifiedReleasePostClosurePreservationContinuityLedgerReceiptFilename,
      safeDigest: certifiedReleasePostClosurePreservationContinuityLedgerReceiptDigest,
      postClosurePreservationContinuityLedgerDigest: certifiedReleasePostClosurePreservationContinuityLedgerReceiptDigest,
      postClosurePreservationVerificationDigest: certifiedReleasePostClosurePreservationVerificationReceipt.postClosurePreservationVerificationDigest,
      finalArchiveSealOperationalClosureReceiptDigest: certifiedReleasePostClosurePreservationVerificationReceipt.finalArchiveSealOperationalClosureReceiptDigest,
      finalArchiveSealDigest: certifiedReleasePostClosurePreservationVerificationReceipt.finalArchiveSealDigest,
      finalEvidenceIndexDigest: certifiedReleasePostClosurePreservationVerificationReceipt.finalEvidenceIndexDigest,
      regressionGuardrailReceiptDigest: certifiedReleasePostClosurePreservationVerificationReceipt.regressionGuardrailReceiptDigest,
      finalNoExecutionEvidenceRollupDigest: certifiedReleasePostClosurePreservationVerificationReceipt.finalNoExecutionEvidenceRollupDigest,
      generatedAt: "2026-06-15T00:00:00.000Z",
      checkedAt: "2026-06-15T00:00:00.000Z",
      preservationContinuityLedgerRows,
      inheritedPostClosurePreservationVerificationReceiptSummary: {
        postClosurePreservationVerificationStatus: "verified",
        finalArchiveSealPostClosurePreservationStatus: "preserved",
        finalArchiveSealStatus: "sealed",
        releaseClosureStatus: "closed",
        safeDigest: certifiedReleasePostClosurePreservationVerificationReceipt.safeDigest,
        safeFilename: certifiedReleasePostClosurePreservationVerificationReceipt.safeFilename,
        postClosurePreservationVerificationDigest: certifiedReleasePostClosurePreservationVerificationReceipt.postClosurePreservationVerificationDigest,
        postClosurePreservationVerificationRowCount: certifiedReleasePostClosurePreservationVerificationReceipt.postClosurePreservationVerificationRows.length,
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
    });
    const certifiedReleasePostClosurePreservationCustodyAuditReceiptDigest = "sha256:certifiedreleasepostclosurepreservationcustodyauditreceipt";
    const certifiedReleasePostClosurePreservationCustodyAuditReceiptFilename = "provider-webhook-certified-release-post-closure-preservation-custody-audit-receipt.json";
    const custodyAuditRows: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceipt["custodyAuditRows"] = [
      ...preservationContinuityLedgerRows.map((row) => ({ ...row, custodyAuditStatus: "under_safe_custody" as const })),
      { sprintNumber: 114, artifactLabel: "Sprint 114 post-closure preservation custody audit receipt", artifactStatus: "audited", custodyAuditStatus: "under_safe_custody", safeDigest: certifiedReleasePostClosurePreservationCustodyAuditReceiptDigest, safeFilename: certifiedReleasePostClosurePreservationCustodyAuditReceiptFilename, generatedAt: "2026-06-15T00:00:00.000Z", checkedAt: "2026-06-15T00:00:00.000Z", externalCalls: 0, executionAttemptCount: 0, providerOutboundCallCount: 0, externalNotificationSendCount: 0, aiCallCount: 0, mutationCount: 0 }
    ];
    const certifiedReleasePostClosurePreservationCustodyAuditReceipt = providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceiptSchema.parse({
      receiptKind: "qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-audit-receipt",
      postClosurePreservationCustodyAuditStatus: "audited",
      postClosurePreservationContinuityLedgerStatus: certifiedReleasePostClosurePreservationContinuityLedgerReceipt.postClosurePreservationContinuityLedgerStatus,
      postClosurePreservationVerificationStatus: certifiedReleasePostClosurePreservationContinuityLedgerReceipt.postClosurePreservationVerificationStatus,
      finalArchiveSealPostClosurePreservationStatus: certifiedReleasePostClosurePreservationContinuityLedgerReceipt.finalArchiveSealPostClosurePreservationStatus,
      finalOperationalClosureReceiptStatus: certifiedReleasePostClosurePreservationContinuityLedgerReceipt.finalOperationalClosureReceiptStatus,
      finalArchiveSealStatus: certifiedReleasePostClosurePreservationContinuityLedgerReceipt.finalArchiveSealStatus,
      releaseClosureStatus: certifiedReleasePostClosurePreservationContinuityLedgerReceipt.releaseClosureStatus,
      tenantScopeStatus: certifiedReleasePostClosurePreservationContinuityLedgerReceipt.tenantScopeStatus,
      digestContinuityStatus: certifiedReleasePostClosurePreservationContinuityLedgerReceipt.digestContinuityStatus,
      providerOutboundStatus: certifiedReleasePostClosurePreservationContinuityLedgerReceipt.providerOutboundStatus,
      externalNotificationStatus: certifiedReleasePostClosurePreservationContinuityLedgerReceipt.externalNotificationStatus,
      aiCallStatus: certifiedReleasePostClosurePreservationContinuityLedgerReceipt.aiCallStatus,
      safeFilename: certifiedReleasePostClosurePreservationCustodyAuditReceiptFilename,
      safeDigest: certifiedReleasePostClosurePreservationCustodyAuditReceiptDigest,
      postClosurePreservationCustodyAuditDigest: certifiedReleasePostClosurePreservationCustodyAuditReceiptDigest,
      postClosurePreservationContinuityLedgerDigest: certifiedReleasePostClosurePreservationContinuityLedgerReceipt.postClosurePreservationContinuityLedgerDigest,
      postClosurePreservationVerificationDigest: certifiedReleasePostClosurePreservationContinuityLedgerReceipt.postClosurePreservationVerificationDigest,
      generatedAt: "2026-06-15T00:00:00.000Z",
      checkedAt: "2026-06-15T00:00:00.000Z",
      custodyAuditRows,
      inheritedPostClosurePreservationContinuityLedgerReceiptSummary: {
        postClosurePreservationContinuityLedgerStatus: "continuous",
        postClosurePreservationVerificationStatus: "verified",
        safeDigest: certifiedReleasePostClosurePreservationContinuityLedgerReceipt.safeDigest,
        safeFilename: certifiedReleasePostClosurePreservationContinuityLedgerReceipt.safeFilename,
        postClosurePreservationContinuityLedgerDigest: certifiedReleasePostClosurePreservationContinuityLedgerReceipt.postClosurePreservationContinuityLedgerDigest,
        postClosurePreservationVerificationDigest: certifiedReleasePostClosurePreservationContinuityLedgerReceipt.postClosurePreservationVerificationDigest,
        preservationContinuityLedgerRowCount: certifiedReleasePostClosurePreservationContinuityLedgerReceipt.preservationContinuityLedgerRows.length,
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
    });
    const certifiedReleasePostClosurePreservationCustodyChainSealReceiptDigest = "sha256:certifiedreleasepostclosurepreservationcustodychainsealreceipt";
    const certifiedReleasePostClosurePreservationCustodyChainSealReceiptFilename = "provider-webhook-certified-release-post-closure-preservation-custody-chain-seal-receipt.json";
    const custodyChainSealRows: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealReceipt["custodyChainSealRows"] = [
      ...custodyAuditRows.map((row) => ({ ...row, custodyChainSealStatus: "sealed_under_safe_custody" as const })),
      { sprintNumber: 115, artifactLabel: "Sprint 115 post-closure preservation custody chain seal receipt", artifactStatus: "sealed", custodyAuditStatus: "under_safe_custody", custodyChainSealStatus: "sealed_under_safe_custody", safeDigest: certifiedReleasePostClosurePreservationCustodyChainSealReceiptDigest, safeFilename: certifiedReleasePostClosurePreservationCustodyChainSealReceiptFilename, generatedAt: "2026-06-15T00:00:00.000Z", checkedAt: "2026-06-15T00:00:00.000Z", externalCalls: 0, executionAttemptCount: 0, providerOutboundCallCount: 0, externalNotificationSendCount: 0, aiCallCount: 0, mutationCount: 0 }
    ];
    const certifiedReleasePostClosurePreservationCustodyChainSealReceipt = providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealReceiptSchema.parse({
      receiptKind: "qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-chain-seal-receipt",
      postClosurePreservationCustodyChainSealStatus: "sealed",
      postClosurePreservationCustodyAuditStatus: certifiedReleasePostClosurePreservationCustodyAuditReceipt.postClosurePreservationCustodyAuditStatus,
      postClosurePreservationContinuityLedgerStatus: certifiedReleasePostClosurePreservationCustodyAuditReceipt.postClosurePreservationContinuityLedgerStatus,
      postClosurePreservationVerificationStatus: certifiedReleasePostClosurePreservationCustodyAuditReceipt.postClosurePreservationVerificationStatus,
      finalArchiveSealPostClosurePreservationStatus: certifiedReleasePostClosurePreservationCustodyAuditReceipt.finalArchiveSealPostClosurePreservationStatus,
      finalOperationalClosureReceiptStatus: certifiedReleasePostClosurePreservationCustodyAuditReceipt.finalOperationalClosureReceiptStatus,
      finalArchiveSealStatus: certifiedReleasePostClosurePreservationCustodyAuditReceipt.finalArchiveSealStatus,
      releaseClosureStatus: certifiedReleasePostClosurePreservationCustodyAuditReceipt.releaseClosureStatus,
      tenantScopeStatus: certifiedReleasePostClosurePreservationCustodyAuditReceipt.tenantScopeStatus,
      digestContinuityStatus: certifiedReleasePostClosurePreservationCustodyAuditReceipt.digestContinuityStatus,
      providerOutboundStatus: certifiedReleasePostClosurePreservationCustodyAuditReceipt.providerOutboundStatus,
      externalNotificationStatus: certifiedReleasePostClosurePreservationCustodyAuditReceipt.externalNotificationStatus,
      aiCallStatus: certifiedReleasePostClosurePreservationCustodyAuditReceipt.aiCallStatus,
      safeFilename: certifiedReleasePostClosurePreservationCustodyChainSealReceiptFilename,
      safeDigest: certifiedReleasePostClosurePreservationCustodyChainSealReceiptDigest,
      postClosurePreservationCustodyChainSealDigest: certifiedReleasePostClosurePreservationCustodyChainSealReceiptDigest,
      postClosurePreservationCustodyAuditDigest: certifiedReleasePostClosurePreservationCustodyAuditReceipt.postClosurePreservationCustodyAuditDigest,
      postClosurePreservationContinuityLedgerDigest: certifiedReleasePostClosurePreservationCustodyAuditReceipt.postClosurePreservationContinuityLedgerDigest,
      postClosurePreservationVerificationDigest: certifiedReleasePostClosurePreservationCustodyAuditReceipt.postClosurePreservationVerificationDigest,
      generatedAt: "2026-06-15T00:00:00.000Z",
      checkedAt: "2026-06-15T00:00:00.000Z",
      custodyChainSealRows,
      inheritedPostClosurePreservationCustodyAuditReceiptSummary: {
        postClosurePreservationCustodyAuditStatus: "audited",
        postClosurePreservationContinuityLedgerStatus: "continuous",
        postClosurePreservationVerificationStatus: "verified",
        safeDigest: certifiedReleasePostClosurePreservationCustodyAuditReceipt.safeDigest,
        safeFilename: certifiedReleasePostClosurePreservationCustodyAuditReceipt.safeFilename,
        postClosurePreservationCustodyAuditDigest: certifiedReleasePostClosurePreservationCustodyAuditReceipt.postClosurePreservationCustodyAuditDigest,
        postClosurePreservationContinuityLedgerDigest: certifiedReleasePostClosurePreservationCustodyAuditReceipt.postClosurePreservationContinuityLedgerDigest,
        custodyAuditRowCount: certifiedReleasePostClosurePreservationCustodyAuditReceipt.custodyAuditRows.length,
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
    });
    const certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceiptDigest = "sha256:certifiedreleasepostclosurepreservationcustodychainintegrityledgerreceipt";
    const certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceiptFilename = "provider-webhook-certified-release-post-closure-preservation-custody-chain-integrity-ledger-receipt.json";
    const custodyChainIntegrityLedgerRows: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerReceipt["custodyChainIntegrityLedgerRows"] = [
      ...custodyChainSealRows.map((row) => ({ ...row, custodyChainIntegrityLedgerStatus: "integrity_confirmed_under_safe_custody" as const })),
      { sprintNumber: 116, artifactLabel: "Sprint 116 post-closure preservation custody chain integrity ledger receipt", artifactStatus: "integrity_confirmed", custodyAuditStatus: "under_safe_custody", custodyChainSealStatus: "sealed_under_safe_custody", custodyChainIntegrityLedgerStatus: "integrity_confirmed_under_safe_custody", safeDigest: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceiptDigest, safeFilename: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceiptFilename, generatedAt: "2026-06-16T00:00:00.000Z", checkedAt: "2026-06-16T00:00:00.000Z", externalCalls: 0, executionAttemptCount: 0, providerOutboundCallCount: 0, externalNotificationSendCount: 0, aiCallCount: 0, mutationCount: 0 }
    ];
    const certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceipt = providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerReceiptSchema.parse({
      receiptKind: "qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-chain-integrity-ledger-receipt",
      postClosurePreservationCustodyChainIntegrityLedgerStatus: "integrity_confirmed",
      postClosurePreservationCustodyChainSealStatus: certifiedReleasePostClosurePreservationCustodyChainSealReceipt.postClosurePreservationCustodyChainSealStatus,
      postClosurePreservationCustodyAuditStatus: certifiedReleasePostClosurePreservationCustodyChainSealReceipt.postClosurePreservationCustodyAuditStatus,
      postClosurePreservationContinuityLedgerStatus: certifiedReleasePostClosurePreservationCustodyChainSealReceipt.postClosurePreservationContinuityLedgerStatus,
      postClosurePreservationVerificationStatus: certifiedReleasePostClosurePreservationCustodyChainSealReceipt.postClosurePreservationVerificationStatus,
      finalArchiveSealPostClosurePreservationStatus: certifiedReleasePostClosurePreservationCustodyChainSealReceipt.finalArchiveSealPostClosurePreservationStatus,
      finalOperationalClosureReceiptStatus: certifiedReleasePostClosurePreservationCustodyChainSealReceipt.finalOperationalClosureReceiptStatus,
      finalArchiveSealStatus: certifiedReleasePostClosurePreservationCustodyChainSealReceipt.finalArchiveSealStatus,
      releaseClosureStatus: certifiedReleasePostClosurePreservationCustodyChainSealReceipt.releaseClosureStatus,
      tenantScopeStatus: certifiedReleasePostClosurePreservationCustodyChainSealReceipt.tenantScopeStatus,
      digestContinuityStatus: certifiedReleasePostClosurePreservationCustodyChainSealReceipt.digestContinuityStatus,
      providerOutboundStatus: certifiedReleasePostClosurePreservationCustodyChainSealReceipt.providerOutboundStatus,
      externalNotificationStatus: certifiedReleasePostClosurePreservationCustodyChainSealReceipt.externalNotificationStatus,
      aiCallStatus: certifiedReleasePostClosurePreservationCustodyChainSealReceipt.aiCallStatus,
      safeFilename: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceiptFilename,
      safeDigest: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceiptDigest,
      postClosurePreservationCustodyChainIntegrityLedgerDigest: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceiptDigest,
      postClosurePreservationCustodyChainSealDigest: certifiedReleasePostClosurePreservationCustodyChainSealReceipt.postClosurePreservationCustodyChainSealDigest,
      postClosurePreservationCustodyAuditDigest: certifiedReleasePostClosurePreservationCustodyChainSealReceipt.postClosurePreservationCustodyAuditDigest,
      postClosurePreservationContinuityLedgerDigest: certifiedReleasePostClosurePreservationCustodyChainSealReceipt.postClosurePreservationContinuityLedgerDigest,
      postClosurePreservationVerificationDigest: certifiedReleasePostClosurePreservationCustodyChainSealReceipt.postClosurePreservationVerificationDigest,
      generatedAt: "2026-06-16T00:00:00.000Z",
      checkedAt: "2026-06-16T00:00:00.000Z",
      custodyChainIntegrityLedgerRows,
      inheritedPostClosurePreservationCustodyChainSealReceiptSummary: {
        postClosurePreservationCustodyChainSealStatus: "sealed",
        postClosurePreservationCustodyAuditStatus: "audited",
        postClosurePreservationContinuityLedgerStatus: "continuous",
        postClosurePreservationVerificationStatus: "verified",
        safeDigest: certifiedReleasePostClosurePreservationCustodyChainSealReceipt.safeDigest,
        safeFilename: certifiedReleasePostClosurePreservationCustodyChainSealReceipt.safeFilename,
        postClosurePreservationCustodyChainSealDigest: certifiedReleasePostClosurePreservationCustodyChainSealReceipt.postClosurePreservationCustodyChainSealDigest,
        postClosurePreservationCustodyAuditDigest: certifiedReleasePostClosurePreservationCustodyChainSealReceipt.postClosurePreservationCustodyAuditDigest,
        custodyChainSealRowCount: certifiedReleasePostClosurePreservationCustodyChainSealReceipt.custodyChainSealRows.length,
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
    });
    const certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityReceiptDigest = "sha256:certifiedreleasepostclosurepreservationcustodychainintegrityledgercontinuityreceipt";
    const certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityReceiptFilename = "provider-webhook-certified-release-post-closure-preservation-custody-chain-integrity-ledger-continuity-receipt.json";
    const custodyChainIntegrityLedgerContinuityRows: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt["safeRowSummaries"] = [
      ...certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceipt.custodyChainIntegrityLedgerRows.map((row) => ({ ...row, custodyChainIntegrityLedgerContinuityStatus: "continuity_confirmed_under_safe_custody" as const })),
      { sprintNumber: 117, artifactLabel: "Sprint 117 post-closure preservation custody chain integrity ledger continuity receipt", artifactStatus: "continuity_confirmed", custodyAuditStatus: "under_safe_custody", custodyChainSealStatus: "sealed_under_safe_custody", custodyChainIntegrityLedgerStatus: "integrity_confirmed_under_safe_custody", custodyChainIntegrityLedgerContinuityStatus: "continuity_confirmed_under_safe_custody", safeDigest: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityReceiptDigest, safeFilename: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityReceiptFilename, generatedAt: "2026-06-16T00:00:00.000Z", checkedAt: "2026-06-16T00:00:00.000Z", externalCalls: 0, executionAttemptCount: 0, providerOutboundCallCount: 0, externalNotificationSendCount: 0, aiCallCount: 0, mutationCount: 0 }
    ];
    const certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt = providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityReceiptSchema.parse({
      receiptKind: "qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-chain-integrity-ledger-continuity-receipt",
      postClosurePreservationCustodyChainIntegrityLedgerContinuityStatus: "continuity_confirmed",
      postClosurePreservationCustodyChainIntegrityLedgerStatus: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainIntegrityLedgerStatus,
      postClosurePreservationCustodyChainSealStatus: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainSealStatus,
      postClosurePreservationCustodyAuditStatus: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyAuditStatus,
      postClosurePreservationContinuityLedgerStatus: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationContinuityLedgerStatus,
      postClosurePreservationVerificationStatus: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationVerificationStatus,
      finalArchiveSealPostClosurePreservationStatus: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceipt.finalArchiveSealPostClosurePreservationStatus,
      finalOperationalClosureReceiptStatus: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceipt.finalOperationalClosureReceiptStatus,
      finalArchiveSealStatus: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceipt.finalArchiveSealStatus,
      releaseClosureStatus: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceipt.releaseClosureStatus,
      redactionStatus: "passed",
      tenantScopeStatus: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceipt.tenantScopeStatus,
      digestContinuityStatus: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceipt.digestContinuityStatus,
      providerOutboundStatus: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceipt.providerOutboundStatus,
      externalNotificationStatus: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceipt.externalNotificationStatus,
      aiCallStatus: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceipt.aiCallStatus,
      safeFilename: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityReceiptFilename,
      safeDigest: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityReceiptDigest,
      postClosurePreservationCustodyChainIntegrityLedgerContinuityDigest: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityReceiptDigest,
      postClosurePreservationCustodyChainIntegrityLedgerDigest: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainIntegrityLedgerDigest,
      postClosurePreservationCustodyChainSealDigest: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainSealDigest,
      generatedAt: "2026-06-16T00:00:00.000Z",
      checkedAt: "2026-06-16T00:00:00.000Z",
      sprint116ReceiptReference: {
        receiptKind: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceipt.receiptKind,
        safeDigest: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceipt.safeDigest,
        safeFilename: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceipt.safeFilename,
        postClosurePreservationCustodyChainIntegrityLedgerDigest: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainIntegrityLedgerDigest,
        rowRangeStart: 103,
        rowRangeEnd: 116,
        rowCount: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceipt.custodyChainIntegrityLedgerRows.length,
        externalCallsZero: true
      },
      sealedArchiveReference: {
        postClosurePreservationCustodyChainSealStatus: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainSealStatus,
        safeDigest: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceipt.inheritedPostClosurePreservationCustodyChainSealReceiptSummary.safeDigest,
        safeFilename: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceipt.inheritedPostClosurePreservationCustodyChainSealReceiptSummary.safeFilename,
        postClosurePreservationCustodyChainSealDigest: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainSealDigest
      },
      noExecutionFlags: {
        externalCallsZero: true,
        executionAttemptCount: 0,
        providerOutboundCallCount: 0,
        externalNotificationSendCount: 0,
        aiCallCount: 0
      },
      safeRowSummaries: custodyChainIntegrityLedgerContinuityRows,
      inheritedPostClosurePreservationCustodyChainIntegrityLedgerReceiptSummary: {
        postClosurePreservationCustodyChainIntegrityLedgerStatus: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainIntegrityLedgerStatus,
        postClosurePreservationCustodyChainSealStatus: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainSealStatus,
        safeDigest: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceipt.safeDigest,
        safeFilename: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceipt.safeFilename,
        postClosurePreservationCustodyChainIntegrityLedgerDigest: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainIntegrityLedgerDigest,
        postClosurePreservationCustodyChainSealDigest: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainSealDigest,
        custodyChainIntegrityLedgerRowCount: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceipt.custodyChainIntegrityLedgerRows.length,
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
        custodyChainIntegrityLedgerContinuityRowCount: custodyChainIntegrityLedgerContinuityRows.length,
        custodyChainIntegrityLedgerContinuitySafeCount: custodyChainIntegrityLedgerContinuityRows.length,
        finalEvidenceIndexMutationCount: 0,
        regressionGuardrailMutationCount: 0,
        finalNoExecutionEvidenceRollupMutationCount: 0,
        executionAttemptCount: 0,
        providerOutboundCallCount: 0,
        externalNotificationSendCount: 0,
        aiCallCount: 0
      },
      externalCalls: 0
    });
    const certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceiptDigest = "sha256:certifiedreleasepostclosurepreservationcustodychainintegrityledgercontinuityverificationreceipt";
    const certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceiptFilename = "provider-webhook-certified-release-custody-chain-integrity-ledger-continuity-verification-receipt.json";
    const continuityVerificationRows = [
      ...certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.safeRowSummaries.map((row) => ({
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
        externalCalls: 0 as const,
        executionAttemptCount: 0 as const,
        providerOutboundCallCount: 0 as const,
        externalNotificationSendCount: 0 as const,
        aiCallCount: 0 as const,
        mutationCount: 0 as const
      })),
      { sprintNumber: 118, artifactLabel: "Sprint 118 post-closure preservation custody chain integrity ledger continuity verification receipt", artifactStatus: "verified", custodyChainStatus: "sealed_under_safe_custody", ledgerIntegrityStatus: "integrity_confirmed_under_safe_custody", continuityStatus: "continuity_confirmed_under_safe_custody", verificationStatus: "verified_under_safe_custody", safeDigest: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceiptDigest, safeFilename: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceiptFilename, generatedAt: "2026-06-16T00:00:00.000Z", verifiedAt: "2026-06-16T00:00:00.000Z", externalCalls: 0 as const, executionAttemptCount: 0 as const, providerOutboundCallCount: 0 as const, externalNotificationSendCount: 0 as const, aiCallCount: 0 as const, mutationCount: 0 as const }
    ];
    const certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt = providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceiptSchema.parse({
      receiptKind: "qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-chain-integrity-ledger-continuity-verification-receipt",
      receiptStatus: "issued",
      verificationStatus: "verified",
      continuityStatus: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.postClosurePreservationCustodyChainIntegrityLedgerContinuityStatus,
      custodyChainStatus: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.postClosurePreservationCustodyChainSealStatus,
      ledgerIntegrityStatus: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.postClosurePreservationCustodyChainIntegrityLedgerStatus,
      noExecutionStatus: "confirmed",
      redactionStatus: "passed",
      tenantScopeStatus: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.tenantScopeStatus,
      digestContinuityStatus: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.digestContinuityStatus,
      providerOutboundStatus: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.providerOutboundStatus,
      externalNotificationStatus: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.externalNotificationStatus,
      aiCallStatus: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.aiCallStatus,
      externalCalls: 0,
      sourceSprint: 117,
      derivedFrom: {
        sourceSprint: 117,
        receiptKind: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.receiptKind,
        safeDigest: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.safeDigest,
        safeFilename: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.safeFilename,
        postClosurePreservationCustodyChainIntegrityLedgerContinuityDigest: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.postClosurePreservationCustodyChainIntegrityLedgerContinuityDigest,
        rowRangeStart: 103,
        rowRangeEnd: 117,
        rowCount: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.safeRowSummaries.length,
        externalCallsZero: true
      },
      safeFilename: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceiptFilename,
      safeDigest: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceiptDigest,
      continuityVerificationDigest: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceiptDigest,
      sprint117ReceiptDigest: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.safeDigest,
      generatedAt: "2026-06-16T00:00:00.000Z",
      verifiedAt: "2026-06-16T00:00:00.000Z",
      safeSummary: {
        receiptStatus: "issued",
        verificationStatus: "verified",
        continuityStatus: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.postClosurePreservationCustodyChainIntegrityLedgerContinuityStatus,
        custodyChainStatus: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.postClosurePreservationCustodyChainSealStatus,
        ledgerIntegrityStatus: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.postClosurePreservationCustodyChainIntegrityLedgerStatus,
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
      verificationRows: continuityVerificationRows,
      inheritedSprint117ContinuityReceiptSummary: {
        continuityStatus: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.postClosurePreservationCustodyChainIntegrityLedgerContinuityStatus,
        custodyChainStatus: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.postClosurePreservationCustodyChainSealStatus,
        ledgerIntegrityStatus: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.postClosurePreservationCustodyChainIntegrityLedgerStatus,
        safeDigest: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.safeDigest,
        safeFilename: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.safeFilename,
        continuityDigest: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.postClosurePreservationCustodyChainIntegrityLedgerContinuityDigest,
        rowCount: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.safeRowSummaries.length,
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
        custodyChainIntegrityLedgerContinuityRowCount: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.safeRowSummaries.length,
        custodyChainIntegrityLedgerContinuitySafeCount: certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.safeRowSummaries.length,
        verificationRowCount: continuityVerificationRows.length,
        verificationSafeCount: continuityVerificationRows.length,
        executionAttemptCount: 0,
        providerOutboundCallCount: 0,
        externalNotificationSendCount: 0,
        aiCallCount: 0
      }
    });
    expect(finalization.finalizationStatus).toBe("ready");
    expect(request.action).toBe("sign_off");
    expect(signed.retentionSignOffStatus).toBe("signed_off");
    expect(receipt.finalizationReceiptStatus).toBe("ready");
    expect(receipt.externalCalls).toBe(0);
    expect(releaseEvidence.releaseReadinessStatus).toBe("ready_for_release");
    expect(releaseEvidence.prerequisiteChecklist.externalCallsZero).toBe(true);
    expect(releaseVerification.verificationStatus).toBe("verified");
    expect(releaseVerification.digestMatrixRows).toHaveLength(10);
    expect(releaseVerification.releaseEvidenceDigest).toBe(releaseEvidence.safeDigest);
    expect(releaseCertification.certificationStatus).toBe("certified");
    expect(releaseCertification.releaseVerificationDigest).toBe(releaseVerification.safeDigest);
    expect(releaseCertification.digestMatrixSummary.allRowsVerified).toBe(true);
    expect(releaseClosureLedger.ledgerStatus).toBe("certified_release_closed");
    expect(releaseClosureLedger.releaseCertificationDigest).toBe(releaseCertification.safeDigest);
    expect(releaseClosureLedger.ledgerRows).toHaveLength(5);
    expect(releaseClosureLedger.ledgerSummary.certificationChecklistComplete).toBe(true);
    expect(releaseClosureLedger.externalCalls).toBe(0);
    expect(releaseAttestationAudit.attestationStatus).toBe("complete");
    expect(releaseAttestationAudit.closureLedgerDigest).toBe(releaseClosureLedger.safeDigest);
    expect(releaseAttestationAudit.attestationRows).toHaveLength(7);
    expect(releaseAttestationAudit.attestationSummary.externalCallsZero).toBe(true);
    expect(releaseAttestationAudit.externalCalls).toBe(0);
    expect(releaseAttestationReconciliation.reconciliationStatus).toBe("aligned");
    expect(releaseAttestationReconciliation.attestationAuditDigest).toBe(releaseAttestationAudit.safeDigest);
    expect(releaseAttestationReconciliation.reconciliationRows).toHaveLength(8);
    expect(releaseAttestationReconciliation.exceptionRows).toHaveLength(0);
    expect(releaseAttestationReconciliation.reconciliationSummary.externalCallsZero).toBe(true);
    expect(releaseAttestationReconciliation.externalCalls).toBe(0);
    expect(certifiedReleaseGate.gateStatus).toBe("ready");
    expect(certifiedReleaseGate.goNoGoDecision).toBe("go");
    expect(certifiedReleaseGate.reconciliationDigest).toBe(releaseAttestationReconciliation.reconciliationDigest);
    expect(certifiedReleaseGate.gateChecklist.externalCallsZero).toBe(true);
    expect(certifiedReleaseGate.blockingReasons).toHaveLength(0);
    expect(certifiedReleaseGate.externalCalls).toBe(0);
    expect(certifiedReleaseDecisionReceipt.receiptStatus).toBe("issued");
    expect(certifiedReleaseDecisionReceipt.releaseDecision).toBe("go");
    expect(certifiedReleaseDecisionReceipt.releaseGateDigest).toBe(certifiedReleaseGate.releaseGateDigest);
    expect(certifiedReleaseDecisionReceipt.receiptRows).toHaveLength(13);
    expect(certifiedReleaseDecisionReceipt.receiptSummary.externalCallsZero).toBe(true);
    expect(certifiedReleaseDecisionReceipt.externalCalls).toBe(0);
    expect(certifiedReleaseHandoffPacket.packetStatus).toBe("issued");
    expect(certifiedReleaseHandoffPacket.handoffStatus).toBe("ready");
    expect(certifiedReleaseHandoffPacket.releaseDecision).toBe("go");
    expect(certifiedReleaseHandoffPacket.decisionReceiptDigest).toBe(certifiedReleaseDecisionReceipt.decisionReceiptDigest);
    expect(certifiedReleaseHandoffPacket.handoffRows).toHaveLength(16);
    expect(certifiedReleaseHandoffPacket.runbookRows).toHaveLength(6);
    expect(certifiedReleaseHandoffPacket.operatorChecklist).toHaveLength(7);
    expect(certifiedReleaseHandoffPacket.releaseOwnerSummary.externalCallsZero).toBe(true);
    expect(certifiedReleaseHandoffPacket.externalCalls).toBe(0);
    expect(certifiedReleaseHandoffAcceptanceRecord.acceptanceStatus).toBe("acknowledged");
    expect(certifiedReleaseHandoffAcceptanceRecord.handoffStatus).toBe("ready");
    expect(certifiedReleaseHandoffAcceptanceRecord.releaseDecision).toBe("go");
    expect(certifiedReleaseHandoffAcceptanceRecord.handoffPacketDigest).toBe(certifiedReleaseHandoffPacket.handoffPacketDigest);
    expect(certifiedReleaseHandoffAcceptanceRecord.acknowledgedChecklist).toHaveLength(7);
    expect(certifiedReleaseHandoffAcceptanceRecord.acknowledgementRows).toHaveLength(7);
    expect(certifiedReleaseHandoffAcceptanceRecord.inheritedHandoffPacketSummary.externalCallsZero).toBe(true);
    expect(certifiedReleaseHandoffAcceptanceRecord.releaseOwnerSummary.operatorChecklistAcknowledged).toBe(true);
    expect(certifiedReleaseHandoffAcceptanceRecord.externalCalls).toBe(0);
    expect(certifiedReleaseNoopExecutionDryRun.dryRunStatus).toBe("passed");
    expect(certifiedReleaseNoopExecutionDryRun.executionMode).toBe("no_op");
    expect(certifiedReleaseNoopExecutionDryRun.releaseDecision).toBe("go");
    expect(certifiedReleaseNoopExecutionDryRun.executionChecklist).toHaveLength(8);
    expect(certifiedReleaseNoopExecutionDryRun.dryRunRows).toHaveLength(2);
    expect(certifiedReleaseNoopExecutionDryRun.executionPlanRows).toHaveLength(7);
    expect(certifiedReleaseNoopExecutionDryRun.releaseOwnerSummary.checklistAcknowledged).toBe(true);
    expect(certifiedReleaseNoopExecutionDryRun.inheritedAcceptanceSummary.externalCallsZero).toBe(true);
    expect(certifiedReleaseNoopExecutionDryRun.externalCalls).toBe(0);
    expect(certifiedReleaseDryRunResultLedger.ledgerStatus).toBe("recorded");
    expect(certifiedReleaseDryRunResultLedger.dryRunStatus).toBe("passed");
    expect(certifiedReleaseDryRunResultLedger.executionMode).toBe("no_op");
    expect(certifiedReleaseDryRunResultLedger.releaseDecision).toBe("go");
    expect(certifiedReleaseDryRunResultLedger.resultLedgerRows).toHaveLength(3);
    expect(certifiedReleaseDryRunResultLedger.finalReadinessRows).toHaveLength(3);
    expect(certifiedReleaseDryRunResultLedger.counts.dryRunResultLedgerMutationCount).toBe(0);
    expect(certifiedReleaseDryRunResultLedger.externalCalls).toBe(0);
    expect(certifiedReleaseFinalReadinessCertificate.certificateStatus).toBe("issued");
    expect(certifiedReleaseFinalReadinessCertificate.finalReadinessStatus).toBe("ready");
    expect(certifiedReleaseFinalReadinessCertificate.ledgerStatus).toBe("recorded");
    expect(certifiedReleaseFinalReadinessCertificate.releaseDecision).toBe("go");
    expect(certifiedReleaseFinalReadinessCertificate.certificateRows).toHaveLength(3);
    expect(certifiedReleaseFinalReadinessCertificate.inheritedResultLedgerSummary.externalCallsZero).toBe(true);
    expect(certifiedReleaseFinalReadinessCertificate.counts.finalReadinessCertificateMutationCount).toBe(0);
    expect(certifiedReleaseFinalReadinessCertificate.externalCalls).toBe(0);
    expect(certifiedReleaseFreezeAuditRegister.freezeAuditStatus).toBe("recorded");
    expect(certifiedReleaseFreezeAuditRegister.freezeStatus).toBe("frozen");
    expect(certifiedReleaseFreezeAuditRegister.rollbackReadinessStatus).toBe("ready");
    expect(certifiedReleaseFreezeAuditRegister.finalReadinessCertificateDigest).toBe(certifiedReleaseFinalReadinessCertificate.finalReadinessCertificateDigest);
    expect(certifiedReleaseFreezeAuditRegister.freezeAuditRows.every((row) => row.complete && row.freezeAuditStatus === "recorded" && row.rollbackReadinessStatus === "ready")).toBe(true);
    expect(certifiedReleaseFreezeAuditRegister.rollbackPlanRows.every((row) => row.complete && row.freezeAuditStatus === "recorded" && row.rollbackReadinessStatus === "ready")).toBe(true);
    expect(certifiedReleaseFreezeAuditRegister.externalCalls).toBe(0);
    expect(certifiedReleaseRollbackRehearsalReceipt.rollbackRehearsalStatus).toBe("verified");
    expect(certifiedReleaseRollbackRehearsalReceipt.recoveryReadinessStatus).toBe("ready");
    expect(certifiedReleaseRollbackRehearsalReceipt.rollbackReadinessStatus).toBe("ready");
    expect(certifiedReleaseRollbackRehearsalReceipt.freezeAuditStatus).toBe("recorded");
    expect(certifiedReleaseRollbackRehearsalReceipt.freezeStatus).toBe("frozen");
    expect(certifiedReleaseRollbackRehearsalReceipt.releaseDecision).toBe("go");
    expect(certifiedReleaseRollbackRehearsalReceipt.freezeAuditRegisterDigest).toBe(certifiedReleaseFreezeAuditRegister.freezeAuditRegisterDigest);
    expect(certifiedReleaseRollbackRehearsalReceipt.freezeSnapshotRows.every((row) => row.complete && row.rollbackRehearsalStatus === "verified" && row.recoveryReadinessStatus === "ready")).toBe(true);
    expect(certifiedReleaseRollbackRehearsalReceipt.rollbackReadinessRows.every((row) => row.complete && row.rollbackRehearsalStatus === "verified" && row.recoveryReadinessStatus === "ready")).toBe(true);
    expect(certifiedReleaseRollbackRehearsalReceipt.rollbackRehearsalRows.every((row) => row.complete && row.rollbackRehearsalStatus === "verified" && row.recoveryReadinessStatus === "ready")).toBe(true);
    expect(certifiedReleaseRollbackRehearsalReceipt.recoveryReadinessRows.every((row) => row.complete && row.rollbackRehearsalStatus === "verified" && row.recoveryReadinessStatus === "ready")).toBe(true);
    expect(certifiedReleaseRollbackRehearsalReceipt.counts.rollbackRehearsalReceiptMutationCount).toBe(0);
    expect(certifiedReleaseRollbackRehearsalReceipt.externalCalls).toBe(0);
    expect(certifiedReleaseControlRoomPacket.controlRoomStatus).toBe("ready");
    expect(certifiedReleaseControlRoomPacket.cutoverReadinessStatus).toBe("ready");
    expect(certifiedReleaseControlRoomPacket.rollbackRehearsalReceiptDigest).toBe(certifiedReleaseRollbackRehearsalReceipt.rollbackRehearsalReceiptDigest);
    expect(certifiedReleaseControlRoomPacket.inheritedRollbackRehearsalSummary.externalCallsZero).toBe(true);
    expect(certifiedReleaseControlRoomPacket.controlRoomRows.every((row) => row.complete && row.controlRoomStatus === "ready" && row.cutoverReadinessStatus === "ready")).toBe(true);
    expect(certifiedReleaseControlRoomPacket.cutoverChecklistRows.every((row) => row.complete && row.controlRoomStatus === "ready" && row.cutoverReadinessStatus === "ready")).toBe(true);
    expect(certifiedReleaseControlRoomPacket.operatorHandoffRows.every((row) => row.complete && row.controlRoomStatus === "ready" && row.cutoverReadinessStatus === "ready")).toBe(true);
    expect(certifiedReleaseControlRoomPacket.counts.controlRoomPacketMutationCount).toBe(0);
    expect(certifiedReleaseControlRoomPacket.externalCalls).toBe(0);
    expect(certifiedReleaseCutoverChecklistReceipt.cutoverChecklistStatus).toBe("verified");
    expect(certifiedReleaseCutoverChecklistReceipt.operatorCommandStatus).toBe("ready");
    expect(certifiedReleaseCutoverChecklistReceipt.controlRoomPacketDigest).toBe(certifiedReleaseControlRoomPacket.controlRoomPacketDigest);
    expect(certifiedReleaseCutoverChecklistReceipt.cutoverChecklistReceiptDigest).toBe(certifiedReleaseCutoverChecklistReceipt.safeDigest);
    expect(certifiedReleaseCutoverChecklistReceipt.inheritedControlRoomSummary.externalCallsZero).toBe(true);
    expect(certifiedReleaseCutoverChecklistReceipt.operatorCommandRows.every((row) => row.complete && row.cutoverChecklistStatus === "verified" && row.operatorCommandStatus === "ready")).toBe(true);
    expect(certifiedReleaseCutoverChecklistReceipt.safeCutoverChecklistRows.every((row) => row.complete && row.cutoverChecklistStatus === "verified" && row.operatorCommandStatus === "ready")).toBe(true);
    expect(certifiedReleaseCutoverChecklistReceipt.counts.cutoverChecklistReceiptMutationCount).toBe(0);
    expect(certifiedReleaseCutoverChecklistReceipt.externalCalls).toBe(0);
    expect(certifiedReleaseOperatorCommandReceipt.operatorCommandReceiptStatus).toBe("issued");
    expect(certifiedReleaseOperatorCommandReceipt.goLiveAuthorizationStatus).toBe("ready");
    expect(certifiedReleaseOperatorCommandReceipt.operatorCommandReceiptDigest).toBe(certifiedReleaseOperatorCommandReceipt.safeDigest);
    expect(certifiedReleaseOperatorCommandReceipt.inheritedCutoverChecklistSummary.externalCallsZero).toBe(true);
    expect(certifiedReleaseOperatorCommandReceipt.operatorCommandReceiptRows.every((row) => row.complete && row.operatorCommandReceiptStatus === "issued" && row.goLiveAuthorizationStatus === "ready")).toBe(true);
    expect(certifiedReleaseOperatorCommandReceipt.counts.operatorCommandReceiptMutationCount).toBe(0);
    expect(certifiedReleaseOperatorCommandReceipt.externalCalls).toBe(0);
    expect(certifiedReleaseGoLiveAuthorizationReceipt.goLiveAuthorizationReceiptStatus).toBe("issued");
    expect(certifiedReleaseGoLiveAuthorizationReceipt.launchWindowStatus).toBe("ready");
    expect(certifiedReleaseGoLiveAuthorizationReceipt.safeLaunchWindowStatus).toBe("ready");
    expect(certifiedReleaseGoLiveAuthorizationReceipt.goLiveAuthorizationReceiptDigest).toBe(certifiedReleaseGoLiveAuthorizationReceipt.safeDigest);
    expect(certifiedReleaseGoLiveAuthorizationReceipt.inheritedOperatorCommandSummary.externalCallsZero).toBe(true);
    expect(certifiedReleaseGoLiveAuthorizationReceipt.goLiveAuthorizationReceiptRows.every((row) => row.complete && row.goLiveAuthorizationReceiptStatus === "issued" && row.launchWindowStatus === "ready")).toBe(true);
    expect(certifiedReleaseGoLiveAuthorizationReceipt.launchWindowRows.every((row) => row.complete && row.safeLaunchWindowStatus === "ready")).toBe(true);
    expect(certifiedReleaseGoLiveAuthorizationReceipt.safeLaunchWindowRows.every((row) => row.complete && row.safeLaunchWindowStatus === "ready")).toBe(true);
    expect(certifiedReleaseGoLiveAuthorizationReceipt.counts.goLiveAuthorizationReceiptMutationCount).toBe(0);
    expect(certifiedReleaseGoLiveAuthorizationReceipt.externalCalls).toBe(0);
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceiptSchema.parse({ ...certifiedReleaseGoLiveAuthorizationReceipt, rawPayload: {} })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceiptSchema.parse({ ...certifiedReleaseGoLiveAuthorizationReceipt, token: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceiptSchema.parse({ ...certifiedReleaseGoLiveAuthorizationReceipt, externalCalls: 1 })).toThrow();
    expect(certifiedReleaseLaunchWindowConfirmationReceipt.launchWindowConfirmationStatus).toBe("confirmed");
    expect(certifiedReleaseLaunchWindowConfirmationReceipt.goLiveHoldStatus).toBe("ready");
    expect(certifiedReleaseLaunchWindowConfirmationReceipt.launchWindowConfirmationReceiptDigest).toBe(certifiedReleaseLaunchWindowConfirmationReceipt.safeDigest);
    expect(certifiedReleaseLaunchWindowConfirmationReceipt.inheritedGoLiveAuthorizationSummary.externalCallsZero).toBe(true);
    expect(certifiedReleaseLaunchWindowConfirmationReceipt.launchWindowConfirmationRows.every((row) => row.complete && row.launchWindowConfirmationStatus === "confirmed" && row.goLiveHoldStatus === "ready")).toBe(true);
    expect(certifiedReleaseLaunchWindowConfirmationReceipt.goLiveHoldRows.every((row) => row.complete && row.goLiveHoldStatus === "ready")).toBe(true);
    expect(certifiedReleaseLaunchWindowConfirmationReceipt.counts.launchWindowConfirmationReceiptMutationCount).toBe(0);
    expect(certifiedReleaseLaunchWindowConfirmationReceipt.externalCalls).toBe(0);
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceiptSchema.parse({ ...certifiedReleaseLaunchWindowConfirmationReceipt, rawPayload: {} })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceiptSchema.parse({ ...certifiedReleaseLaunchWindowConfirmationReceipt, token: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceiptSchema.parse({ ...certifiedReleaseLaunchWindowConfirmationReceipt, externalCalls: 1 })).toThrow();
    expect(certifiedReleaseGoLiveHoldReleaseAuthorizationReceipt.goLiveHoldReleaseAuthorizationStatus).toBe("authorized");
    expect(certifiedReleaseGoLiveHoldReleaseAuthorizationReceipt.launchApprovalStatus).toBe("ready");
    expect(certifiedReleaseGoLiveHoldReleaseAuthorizationReceipt.goLiveHoldReleaseAuthorizationReceiptDigest).toBe(certifiedReleaseGoLiveHoldReleaseAuthorizationReceipt.safeDigest);
    expect(certifiedReleaseGoLiveHoldReleaseAuthorizationReceipt.inheritedLaunchWindowConfirmationSummary.externalCallsZero).toBe(true);
    expect(certifiedReleaseGoLiveHoldReleaseAuthorizationReceipt.goLiveHoldReleaseAuthorizationRows.every((row) => row.complete && row.goLiveHoldReleaseAuthorizationStatus === "authorized" && row.launchApprovalStatus === "ready")).toBe(true);
    expect(certifiedReleaseGoLiveHoldReleaseAuthorizationReceipt.launchApprovalRows.every((row) => row.complete && row.launchApprovalStatus === "ready")).toBe(true);
    expect(certifiedReleaseGoLiveHoldReleaseAuthorizationReceipt.counts.goLiveHoldReleaseAuthorizationReceiptMutationCount).toBe(0);
    expect(certifiedReleaseGoLiveHoldReleaseAuthorizationReceipt.externalCalls).toBe(0);
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceiptSchema.parse({ ...certifiedReleaseGoLiveHoldReleaseAuthorizationReceipt, rawPayload: {} })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceiptSchema.parse({ ...certifiedReleaseGoLiveHoldReleaseAuthorizationReceipt, token: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceiptSchema.parse({ ...certifiedReleaseGoLiveHoldReleaseAuthorizationReceipt, externalCalls: 1 })).toThrow();
    expect(certifiedReleaseLaunchApprovalReceipt.launchApprovalReceiptStatus).toBe("issued");
    expect(certifiedReleaseLaunchApprovalReceipt.noExecutionGuardStatus).toBe("retained");
    expect(certifiedReleaseLaunchApprovalReceipt.launchApprovalReceiptDigest).toBe(certifiedReleaseLaunchApprovalReceipt.safeDigest);
    expect(certifiedReleaseLaunchApprovalReceipt.inheritedGoLiveHoldReleaseAuthorizationSummary.externalCallsZero).toBe(true);
    expect(certifiedReleaseLaunchApprovalReceipt.noExecutionGuardRows.every((row) => row.complete && row.noExecutionGuardStatus === "retained")).toBe(true);
    expect(certifiedReleaseLaunchApprovalReceipt.counts.launchApprovalReceiptMutationCount).toBe(0);
    expect(certifiedReleaseLaunchApprovalReceipt.externalCalls).toBe(0);
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceiptSchema.parse({ ...certifiedReleaseLaunchApprovalReceipt, rawPayload: {} })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceiptSchema.parse({ ...certifiedReleaseLaunchApprovalReceipt, token: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceiptSchema.parse({ ...certifiedReleaseLaunchApprovalReceipt, externalCalls: 1 })).toThrow();
    expect(certifiedReleaseNoExecutionLockReceipt.noExecutionLockReceiptStatus).toBe("issued");
    expect(certifiedReleaseNoExecutionLockReceipt.noExecutionLockStatus).toBe("locked");
    expect(certifiedReleaseNoExecutionLockReceipt.launchApprovalArchiveStatus).toBe("retained");
    expect(certifiedReleaseNoExecutionLockReceipt.tenantScopeStatus).toBe("tenant_scoped");
    expect(certifiedReleaseNoExecutionLockReceipt.providerOutboundStatus).toBe("absent");
    expect(certifiedReleaseNoExecutionLockReceipt.externalNotificationStatus).toBe("absent");
    expect(certifiedReleaseNoExecutionLockReceipt.aiCallStatus).toBe("absent");
    expect(certifiedReleaseNoExecutionLockReceipt.noExecutionLockReceiptDigest).toBe(certifiedReleaseNoExecutionLockReceipt.safeDigest);
    expect(certifiedReleaseNoExecutionLockReceipt.inheritedLaunchApprovalReceiptSummary.externalCallsZero).toBe(true);
    expect(certifiedReleaseNoExecutionLockReceipt.noExecutionLockRows.every((row) => row.complete && row.noExecutionLockStatus === "locked")).toBe(true);
    expect(certifiedReleaseNoExecutionLockReceipt.counts.noExecutionLockReceiptMutationCount).toBe(0);
    expect(certifiedReleaseNoExecutionLockReceipt.counts.executionAttemptCount).toBe(0);
    expect(certifiedReleaseNoExecutionLockReceipt.counts.providerOutboundCallCount).toBe(0);
    expect(certifiedReleaseNoExecutionLockReceipt.counts.externalNotificationSendCount).toBe(0);
    expect(certifiedReleaseNoExecutionLockReceipt.counts.aiCallCount).toBe(0);
    expect(certifiedReleaseNoExecutionLockReceipt.externalCalls).toBe(0);
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceiptSchema.parse({ ...certifiedReleaseNoExecutionLockReceipt, rawPayload: {} })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceiptSchema.parse({ ...certifiedReleaseNoExecutionLockReceipt, token: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseNoExecutionLockReceiptSchema.parse({ ...certifiedReleaseNoExecutionLockReceipt, externalCalls: 1 })).toThrow();
    expect(certifiedReleaseOperationsHandoffReadinessPacket.operationsHandoffReadinessStatus).toBe("ready_for_handoff");
    expect(certifiedReleaseOperationsHandoffReadinessPacket.operationsHandoffEvidencePacketStatus).toBe("issued");
    expect(certifiedReleaseOperationsHandoffReadinessPacket.noExecutionEvidenceStatus).toBe("confirmed");
    expect(certifiedReleaseOperationsHandoffReadinessPacket.launchApprovalLockStatus).toBe("locked");
    expect(certifiedReleaseOperationsHandoffReadinessPacket.digestContinuityStatus).toBe("confirmed");
    expect(certifiedReleaseOperationsHandoffReadinessPacket.operationsHandoffEvidencePacketDigest).toBe(certifiedReleaseOperationsHandoffReadinessPacket.safeDigest);
    expect(certifiedReleaseOperationsHandoffReadinessPacket.inheritedNoExecutionLockReceiptSummary.externalCallsZero).toBe(true);
    expect(certifiedReleaseOperationsHandoffReadinessPacket.operationsHandoffPrerequisiteRows.every((row) => row.complete && row.status === "confirmed")).toBe(true);
    expect(certifiedReleaseOperationsHandoffReadinessPacket.operationsHandoffBlockerRows.every((row) => row.complete && row.status === "confirmed")).toBe(true);
    expect(certifiedReleaseOperationsHandoffReadinessPacket.counts.operationsHandoffMutationCount).toBe(0);
    expect(certifiedReleaseOperationsHandoffReadinessPacket.counts.operationsHandoffBlockingCount).toBe(0);
    expect(certifiedReleaseOperationsHandoffReadinessPacket.counts.providerOutboundCallCount).toBe(0);
    expect(certifiedReleaseOperationsHandoffReadinessPacket.counts.externalNotificationSendCount).toBe(0);
    expect(certifiedReleaseOperationsHandoffReadinessPacket.counts.aiCallCount).toBe(0);
    expect(certifiedReleaseOperationsHandoffReadinessPacket.externalCalls).toBe(0);
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacketSchema.parse({ ...certifiedReleaseOperationsHandoffReadinessPacket, rawPayload: {} })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacketSchema.parse({ ...certifiedReleaseOperationsHandoffReadinessPacket, replyToken: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacketSchema.parse({ ...certifiedReleaseOperationsHandoffReadinessPacket, externalCalls: 1 })).toThrow();
    expect(certifiedReleaseOperationsHandoffAcceptanceReceipt.receiptKind).toBe("qa-handoff-locked-archive-certified-release-operations-handoff-acceptance-receipt");
    expect(certifiedReleaseOperationsHandoffAcceptanceReceipt.operationsHandoffAcceptanceStatus).toBe("accepted");
    expect(certifiedReleaseOperationsHandoffAcceptanceReceipt.operationsCustodyStatus).toBe("accepted");
    expect(certifiedReleaseOperationsHandoffAcceptanceReceipt.noExecutionEvidenceStatus).toBe("confirmed");
    expect(certifiedReleaseOperationsHandoffAcceptanceReceipt.launchApprovalLockStatus).toBe("locked");
    expect(certifiedReleaseOperationsHandoffAcceptanceReceipt.tenantScopeStatus).toBe("tenant_scoped");
    expect(certifiedReleaseOperationsHandoffAcceptanceReceipt.digestContinuityStatus).toBe("confirmed");
    expect(certifiedReleaseOperationsHandoffAcceptanceReceipt.operationsHandoffAcceptanceReceiptDigest).toBe(certifiedReleaseOperationsHandoffAcceptanceReceipt.safeDigest);
    expect(certifiedReleaseOperationsHandoffAcceptanceReceipt.inheritedOperationsHandoffReadinessPacketSummary.operationsHandoffEvidencePacketDigest).toBe(certifiedReleaseOperationsHandoffReadinessPacket.operationsHandoffEvidencePacketDigest);
    expect(certifiedReleaseOperationsHandoffAcceptanceReceipt.inheritedOperationsHandoffReadinessPacketSummary.externalCallsZero).toBe(true);
    expect(certifiedReleaseOperationsHandoffAcceptanceReceipt.operationsHandoffAcceptanceRows.every((row) => row.complete && row.status === "confirmed")).toBe(true);
    expect(certifiedReleaseOperationsHandoffAcceptanceReceipt.operationsCustodyRows.every((row) => row.complete && row.status === "confirmed")).toBe(true);
    expect(certifiedReleaseOperationsHandoffAcceptanceReceipt.counts.operationsHandoffAcceptanceMutationCount).toBe(0);
    expect(certifiedReleaseOperationsHandoffAcceptanceReceipt.counts.executionAttemptCount).toBe(0);
    expect(certifiedReleaseOperationsHandoffAcceptanceReceipt.counts.providerOutboundCallCount).toBe(0);
    expect(certifiedReleaseOperationsHandoffAcceptanceReceipt.counts.externalNotificationSendCount).toBe(0);
    expect(certifiedReleaseOperationsHandoffAcceptanceReceipt.counts.aiCallCount).toBe(0);
    expect(certifiedReleaseOperationsHandoffAcceptanceReceipt.externalCalls).toBe(0);
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceReceiptSchema.parse({ ...certifiedReleaseOperationsHandoffAcceptanceReceipt, rawPayload: {} })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceReceiptSchema.parse({ ...certifiedReleaseOperationsHandoffAcceptanceReceipt, replyToken: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceReceiptSchema.parse({ ...certifiedReleaseOperationsHandoffAcceptanceReceipt, externalCalls: 1 })).toThrow();
    expect(certifiedReleaseOperationsCustodyMonitoringReadinessLedger.ledgerKind).toBe("qa-handoff-locked-archive-certified-release-operations-custody-monitoring-readiness-ledger");
    expect(certifiedReleaseOperationsCustodyMonitoringReadinessLedger.operationsCustodyMonitoringStatus).toBe("ready");
    expect(certifiedReleaseOperationsCustodyMonitoringReadinessLedger.operationsHandoffAcceptanceStatus).toBe("accepted");
    expect(certifiedReleaseOperationsCustodyMonitoringReadinessLedger.operationsCustodyStatus).toBe("accepted");
    expect(certifiedReleaseOperationsCustodyMonitoringReadinessLedger.noExecutionEvidenceStatus).toBe("confirmed");
    expect(certifiedReleaseOperationsCustodyMonitoringReadinessLedger.launchApprovalLockStatus).toBe("locked");
    expect(certifiedReleaseOperationsCustodyMonitoringReadinessLedger.tenantScopeStatus).toBe("tenant_scoped");
    expect(certifiedReleaseOperationsCustodyMonitoringReadinessLedger.digestContinuityStatus).toBe("confirmed");
    expect(certifiedReleaseOperationsCustodyMonitoringReadinessLedger.monitoringReadinessStatus).toBe("ready");
    expect(certifiedReleaseOperationsCustodyMonitoringReadinessLedger.noExecutionMonitoringStatus).toBe("active");
    expect(certifiedReleaseOperationsCustodyMonitoringReadinessLedger.operationsCustodyMonitoringLedgerDigest).toBe(certifiedReleaseOperationsCustodyMonitoringReadinessLedger.safeDigest);
    expect(certifiedReleaseOperationsCustodyMonitoringReadinessLedger.inheritedOperationsHandoffAcceptanceReceiptSummary.operationsHandoffAcceptanceReceiptDigest).toBe(certifiedReleaseOperationsHandoffAcceptanceReceipt.operationsHandoffAcceptanceReceiptDigest);
    expect(certifiedReleaseOperationsCustodyMonitoringReadinessLedger.inheritedOperationsHandoffAcceptanceReceiptSummary.externalCallsZero).toBe(true);
    expect(certifiedReleaseOperationsCustodyMonitoringReadinessLedger.operationsCustodyMonitoringRows.every((row) => row.complete && row.status === "confirmed")).toBe(true);
    expect(certifiedReleaseOperationsCustodyMonitoringReadinessLedger.noExecutionMonitoringRows.every((row) => row.complete && row.status === "confirmed")).toBe(true);
    expect(certifiedReleaseOperationsCustodyMonitoringReadinessLedger.counts.operationsCustodyMonitoringMutationCount).toBe(0);
    expect(certifiedReleaseOperationsCustodyMonitoringReadinessLedger.counts.executionAttemptCount).toBe(0);
    expect(certifiedReleaseOperationsCustodyMonitoringReadinessLedger.counts.providerOutboundCallCount).toBe(0);
    expect(certifiedReleaseOperationsCustodyMonitoringReadinessLedger.counts.externalNotificationSendCount).toBe(0);
    expect(certifiedReleaseOperationsCustodyMonitoringReadinessLedger.counts.aiCallCount).toBe(0);
    expect(certifiedReleaseOperationsCustodyMonitoringReadinessLedger.externalCalls).toBe(0);
    expect(certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.receiptKind).toBe("qa-handoff-locked-archive-certified-release-operations-custody-monitoring-closeout-seal-receipt");
    expect(certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.ledgerKind).toBe("qa-handoff-locked-archive-certified-release-operations-custody-monitoring-readiness-ledger");
    expect(certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyMonitoringCloseoutStatus).toBe("sealed");
    expect(certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.closeoutSealStatus).toBe("sealed");
    expect(certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyMonitoringStatus).toBe("ready");
    expect(certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.operationsHandoffAcceptanceStatus).toBe("accepted");
    expect(certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyStatus).toBe("accepted");
    expect(certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.noExecutionEvidenceStatus).toBe("confirmed");
    expect(certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.noExecutionMonitoringStatus).toBe("active");
    expect(certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.launchApprovalLockStatus).toBe("locked");
    expect(certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.tenantScopeStatus).toBe("tenant_scoped");
    expect(certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.digestContinuityStatus).toBe("confirmed");
    expect(certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyMonitoringCloseoutSealReceiptDigest).toBe(certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.safeDigest);
    expect(certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.inheritedOperationsCustodyMonitoringReadinessLedgerSummary.operationsCustodyMonitoringLedgerDigest).toBe(certifiedReleaseOperationsCustodyMonitoringReadinessLedger.operationsCustodyMonitoringLedgerDigest);
    expect(certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.inheritedOperationsCustodyMonitoringReadinessLedgerSummary.externalCallsZero).toBe(true);
    expect(certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyMonitoringCloseoutRows.every((row) => row.complete && row.status === "confirmed")).toBe(true);
    expect(certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.counts.operationsCustodyMonitoringCloseoutSealMutationCount).toBe(0);
    expect(certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.counts.executionAttemptCount).toBe(0);
    expect(certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.counts.providerOutboundCallCount).toBe(0);
    expect(certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.counts.externalNotificationSendCount).toBe(0);
    expect(certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.counts.aiCallCount).toBe(0);
    expect(certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.externalCalls).toBe(0);
    expect(certifiedReleaseFinalNoExecutionEvidenceRollup.rollupKind).toBe("qa-handoff-locked-archive-certified-release-final-no-execution-evidence-rollup");
    expect(certifiedReleaseFinalNoExecutionEvidenceRollup.finalNoExecutionEvidenceRollupStatus).toBe("issued");
    expect(certifiedReleaseFinalNoExecutionEvidenceRollup.finalArchiveCustodyStatus).toBe("sealed");
    expect(certifiedReleaseFinalNoExecutionEvidenceRollup.operationsCustodyMonitoringCloseoutStatus).toBe("sealed");
    expect(certifiedReleaseFinalNoExecutionEvidenceRollup.closeoutSealStatus).toBe("sealed");
    expect(certifiedReleaseFinalNoExecutionEvidenceRollup.operationsCustodyMonitoringStatus).toBe("ready");
    expect(certifiedReleaseFinalNoExecutionEvidenceRollup.operationsHandoffAcceptanceStatus).toBe("accepted");
    expect(certifiedReleaseFinalNoExecutionEvidenceRollup.operationsCustodyStatus).toBe("accepted");
    expect(certifiedReleaseFinalNoExecutionEvidenceRollup.noExecutionEvidenceStatus).toBe("confirmed");
    expect(certifiedReleaseFinalNoExecutionEvidenceRollup.noExecutionMonitoringStatus).toBe("active");
    expect(certifiedReleaseFinalNoExecutionEvidenceRollup.launchApprovalLockStatus).toBe("locked");
    expect(certifiedReleaseFinalNoExecutionEvidenceRollup.tenantScopeStatus).toBe("tenant_scoped");
    expect(certifiedReleaseFinalNoExecutionEvidenceRollup.digestContinuityStatus).toBe("confirmed");
    expect(certifiedReleaseFinalNoExecutionEvidenceRollup.finalNoExecutionEvidenceRollupDigest).toBe(certifiedReleaseFinalNoExecutionEvidenceRollup.safeDigest);
    expect(certifiedReleaseFinalNoExecutionEvidenceRollup.inheritedOperationsCustodyMonitoringCloseoutSealReceiptSummary.operationsCustodyMonitoringCloseoutSealReceiptDigest).toBe(certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt.operationsCustodyMonitoringCloseoutSealReceiptDigest);
    expect(certifiedReleaseFinalNoExecutionEvidenceRollup.inheritedOperationsCustodyMonitoringCloseoutSealReceiptSummary.externalCallsZero).toBe(true);
    expect(certifiedReleaseFinalNoExecutionEvidenceRollup.finalNoExecutionEvidenceRows.every((row) => row.complete && row.status === "confirmed")).toBe(true);
    expect(certifiedReleaseFinalNoExecutionEvidenceRollup.counts.finalNoExecutionEvidenceRollupMutationCount).toBe(0);
    expect(certifiedReleaseFinalNoExecutionEvidenceRollup.counts.finalNoExecutionEvidenceRollupIssuedCount).toBe(certifiedReleaseFinalNoExecutionEvidenceRollup.finalNoExecutionEvidenceRows.length);
    expect(certifiedReleaseFinalNoExecutionEvidenceRollup.counts.executionAttemptCount).toBe(0);
    expect(certifiedReleaseFinalNoExecutionEvidenceRollup.counts.providerOutboundCallCount).toBe(0);
    expect(certifiedReleaseFinalNoExecutionEvidenceRollup.counts.externalNotificationSendCount).toBe(0);
    expect(certifiedReleaseFinalNoExecutionEvidenceRollup.counts.aiCallCount).toBe(0);
    expect(certifiedReleaseFinalNoExecutionEvidenceRollup.externalCalls).toBe(0);
    expect(certifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt.receiptKind).toBe("qa-handoff-locked-archive-certified-release-final-evidence-index-regression-guardrail-receipt");
    expect(certifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt.finalEvidenceIndexStatus).toBe("issued");
    expect(certifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt.regressionGuardrailReceiptStatus).toBe("issued");
    expect(certifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt.regressionGuardrailStatus).toBe("passed");
    expect(certifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt.finalNoExecutionEvidenceRollupStatus).toBe("issued");
    expect(certifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt.finalArchiveCustodyStatus).toBe("sealed");
    expect(certifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt.operationsCustodyMonitoringCloseoutStatus).toBe("sealed");
    expect(certifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt.closeoutSealStatus).toBe("sealed");
    expect(certifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt.tenantScopeStatus).toBe("tenant_scoped");
    expect(certifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt.digestContinuityStatus).toBe("confirmed");
    expect(certifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt.finalEvidenceIndexDigest).toBe(certifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt.safeDigest);
    expect(certifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt.finalEvidenceIndexRows.map((row) => row.sprintNumber)).toEqual([103, 104, 105, 106, 107, 108, 109, 110]);
    expect(certifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt.finalEvidenceIndexRows.every((row) => row.externalCalls === 0 && row.mutationCount === 0)).toBe(true);
    expect(certifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt.counts.finalEvidenceIndexMutationCount).toBe(0);
    expect(certifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt.counts.regressionGuardrailMutationCount).toBe(0);
    expect(certifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt.counts.executionAttemptCount).toBe(0);
    expect(certifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt.counts.providerOutboundCallCount).toBe(0);
    expect(certifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt.counts.externalNotificationSendCount).toBe(0);
    expect(certifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt.counts.aiCallCount).toBe(0);
    expect(certifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt.externalCalls).toBe(0);
    expect(certifiedReleaseFinalArchiveSealOperationalClosureReceipt.receiptKind).toBe("qa-handoff-locked-archive-certified-release-final-archive-seal-operational-closure-receipt");
    expect(certifiedReleaseFinalArchiveSealOperationalClosureReceipt.finalOperationalClosureReceiptStatus).toBe("issued");
    expect(certifiedReleaseFinalArchiveSealOperationalClosureReceipt.finalArchiveSealStatus).toBe("sealed");
    expect(certifiedReleaseFinalArchiveSealOperationalClosureReceipt.releaseClosureStatus).toBe("closed");
    expect(certifiedReleaseFinalArchiveSealOperationalClosureReceipt.finalEvidenceIndexStatus).toBe("issued");
    expect(certifiedReleaseFinalArchiveSealOperationalClosureReceipt.regressionGuardrailReceiptStatus).toBe("issued");
    expect(certifiedReleaseFinalArchiveSealOperationalClosureReceipt.regressionGuardrailStatus).toBe("passed");
    expect(certifiedReleaseFinalArchiveSealOperationalClosureReceipt.finalNoExecutionEvidenceRollupStatus).toBe("issued");
    expect(certifiedReleaseFinalArchiveSealOperationalClosureReceipt.finalArchiveCustodyStatus).toBe("sealed");
    expect(certifiedReleaseFinalArchiveSealOperationalClosureReceipt.tenantScopeStatus).toBe("tenant_scoped");
    expect(certifiedReleaseFinalArchiveSealOperationalClosureReceipt.digestContinuityStatus).toBe("confirmed");
    expect(certifiedReleaseFinalArchiveSealOperationalClosureReceipt.finalOperationalClosureReceiptDigest).toBe(certifiedReleaseFinalArchiveSealOperationalClosureReceipt.safeDigest);
    expect(certifiedReleaseFinalArchiveSealOperationalClosureReceipt.finalArchiveSealDigest).toBe(certifiedReleaseFinalArchiveSealOperationalClosureReceipt.safeDigest);
    expect(certifiedReleaseFinalArchiveSealOperationalClosureReceipt.finalArchiveSealOperationalClosureRows.map((row) => row.sprintNumber)).toEqual([103, 104, 105, 106, 107, 108, 109, 110, 111]);
    expect(certifiedReleaseFinalArchiveSealOperationalClosureReceipt.finalArchiveSealOperationalClosureRows.every((row) => row.externalCalls === 0 && row.mutationCount === 0)).toBe(true);
    expect(certifiedReleaseFinalArchiveSealOperationalClosureReceipt.counts.finalOperationalClosureReceiptMutationCount).toBe(0);
    expect(certifiedReleaseFinalArchiveSealOperationalClosureReceipt.counts.finalArchiveSealMutationCount).toBe(0);
    expect(certifiedReleaseFinalArchiveSealOperationalClosureReceipt.counts.executionAttemptCount).toBe(0);
    expect(certifiedReleaseFinalArchiveSealOperationalClosureReceipt.counts.providerOutboundCallCount).toBe(0);
    expect(certifiedReleaseFinalArchiveSealOperationalClosureReceipt.counts.externalNotificationSendCount).toBe(0);
    expect(certifiedReleaseFinalArchiveSealOperationalClosureReceipt.counts.aiCallCount).toBe(0);
    expect(certifiedReleaseFinalArchiveSealOperationalClosureReceipt.externalCalls).toBe(0);
    expect(certifiedReleasePostClosurePreservationVerificationReceipt.receiptKind).toBe("qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-verification-receipt");
    expect(certifiedReleasePostClosurePreservationVerificationReceipt.postClosurePreservationVerificationStatus).toBe("verified");
    expect(certifiedReleasePostClosurePreservationVerificationReceipt.finalArchiveSealPostClosurePreservationStatus).toBe("preserved");
    expect(certifiedReleasePostClosurePreservationVerificationReceipt.finalArchiveSealStatus).toBe("sealed");
    expect(certifiedReleasePostClosurePreservationVerificationReceipt.releaseClosureStatus).toBe("closed");
    expect(certifiedReleasePostClosurePreservationVerificationReceipt.tenantScopeStatus).toBe("tenant_scoped");
    expect(certifiedReleasePostClosurePreservationVerificationReceipt.digestContinuityStatus).toBe("confirmed");
    expect(certifiedReleasePostClosurePreservationVerificationReceipt.postClosurePreservationVerificationDigest).toBe(certifiedReleasePostClosurePreservationVerificationReceipt.safeDigest);
    expect(certifiedReleasePostClosurePreservationVerificationReceipt.finalArchiveSealOperationalClosureReceiptDigest).toBe(certifiedReleaseFinalArchiveSealOperationalClosureReceipt.safeDigest);
    expect(certifiedReleasePostClosurePreservationVerificationReceipt.postClosurePreservationVerificationRows.map((row) => row.sprintNumber)).toEqual([103, 104, 105, 106, 107, 108, 109, 110, 111, 112]);
    expect(certifiedReleasePostClosurePreservationVerificationReceipt.postClosurePreservationVerificationRows.every((row) => row.externalCalls === 0 && row.mutationCount === 0)).toBe(true);
    expect(certifiedReleasePostClosurePreservationVerificationReceipt.counts.postClosurePreservationVerificationMutationCount).toBe(0);
    expect(certifiedReleasePostClosurePreservationVerificationReceipt.counts.finalArchiveSealPostClosurePreservationMutationCount).toBe(0);
    expect(certifiedReleasePostClosurePreservationVerificationReceipt.counts.finalOperationalClosureReceiptMutationCount).toBe(0);
    expect(certifiedReleasePostClosurePreservationVerificationReceipt.counts.finalArchiveSealMutationCount).toBe(0);
    expect(certifiedReleasePostClosurePreservationVerificationReceipt.counts.executionAttemptCount).toBe(0);
    expect(certifiedReleasePostClosurePreservationVerificationReceipt.counts.providerOutboundCallCount).toBe(0);
    expect(certifiedReleasePostClosurePreservationVerificationReceipt.counts.externalNotificationSendCount).toBe(0);
    expect(certifiedReleasePostClosurePreservationVerificationReceipt.counts.aiCallCount).toBe(0);
    expect(certifiedReleasePostClosurePreservationVerificationReceipt.externalCalls).toBe(0);
    expect(certifiedReleasePostClosurePreservationContinuityLedgerReceipt.receiptKind).toBe("qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-continuity-ledger-receipt");
    expect(certifiedReleasePostClosurePreservationContinuityLedgerReceipt.postClosurePreservationContinuityLedgerStatus).toBe("continuous");
    expect(certifiedReleasePostClosurePreservationContinuityLedgerReceipt.postClosurePreservationVerificationStatus).toBe("verified");
    expect(certifiedReleasePostClosurePreservationContinuityLedgerReceipt.finalArchiveSealPostClosurePreservationStatus).toBe("preserved");
    expect(certifiedReleasePostClosurePreservationContinuityLedgerReceipt.postClosurePreservationContinuityLedgerDigest).toBe(certifiedReleasePostClosurePreservationContinuityLedgerReceipt.safeDigest);
    expect(certifiedReleasePostClosurePreservationContinuityLedgerReceipt.postClosurePreservationVerificationDigest).toBe(certifiedReleasePostClosurePreservationVerificationReceipt.safeDigest);
    expect(certifiedReleasePostClosurePreservationContinuityLedgerReceipt.preservationContinuityLedgerRows.map((row) => row.sprintNumber)).toEqual([103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113]);
    expect(certifiedReleasePostClosurePreservationContinuityLedgerReceipt.preservationContinuityLedgerRows.every((row) => row.externalCalls === 0 && row.mutationCount === 0)).toBe(true);
    expect(certifiedReleasePostClosurePreservationContinuityLedgerReceipt.inheritedPostClosurePreservationVerificationReceiptSummary).toMatchObject({
      postClosurePreservationVerificationStatus: "verified",
      finalArchiveSealPostClosurePreservationStatus: "preserved",
      postClosurePreservationVerificationMutationCount: 0,
      finalArchiveSealPostClosurePreservationMutationCount: 0,
      executionAttemptCount: 0,
      providerOutboundCallCount: 0,
      externalNotificationSendCount: 0,
      aiCallCount: 0,
      externalCallsZero: true
    });
    expect(certifiedReleasePostClosurePreservationContinuityLedgerReceipt.counts.preservationContinuityLedgerMutationCount).toBe(0);
    expect(certifiedReleasePostClosurePreservationContinuityLedgerReceipt.counts.postClosurePreservationVerificationMutationCount).toBe(0);
    expect(certifiedReleasePostClosurePreservationContinuityLedgerReceipt.counts.finalArchiveSealPostClosurePreservationMutationCount).toBe(0);
    expect(certifiedReleasePostClosurePreservationContinuityLedgerReceipt.counts.executionAttemptCount).toBe(0);
    expect(certifiedReleasePostClosurePreservationContinuityLedgerReceipt.counts.providerOutboundCallCount).toBe(0);
    expect(certifiedReleasePostClosurePreservationContinuityLedgerReceipt.counts.externalNotificationSendCount).toBe(0);
    expect(certifiedReleasePostClosurePreservationContinuityLedgerReceipt.counts.aiCallCount).toBe(0);
    expect(certifiedReleasePostClosurePreservationContinuityLedgerReceipt.externalCalls).toBe(0);
    expect(certifiedReleasePostClosurePreservationCustodyAuditReceipt.receiptKind).toBe("qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-audit-receipt");
    expect(certifiedReleasePostClosurePreservationCustodyAuditReceipt.postClosurePreservationCustodyAuditStatus).toBe("audited");
    expect(certifiedReleasePostClosurePreservationCustodyAuditReceipt.postClosurePreservationContinuityLedgerStatus).toBe("continuous");
    expect(certifiedReleasePostClosurePreservationCustodyAuditReceipt.digestContinuityStatus).toBe("confirmed");
    expect(certifiedReleasePostClosurePreservationCustodyAuditReceipt.postClosurePreservationCustodyAuditDigest).toBe(certifiedReleasePostClosurePreservationCustodyAuditReceipt.safeDigest);
    expect(certifiedReleasePostClosurePreservationCustodyAuditReceipt.postClosurePreservationContinuityLedgerDigest).toBe(certifiedReleasePostClosurePreservationContinuityLedgerReceipt.safeDigest);
    expect(certifiedReleasePostClosurePreservationCustodyAuditReceipt.custodyAuditRows.map((row) => row.sprintNumber)).toEqual([103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114]);
    expect(certifiedReleasePostClosurePreservationCustodyAuditReceipt.custodyAuditRows.every((row) => row.externalCalls === 0 && row.mutationCount === 0 && row.custodyAuditStatus === "under_safe_custody")).toBe(true);
    expect(certifiedReleasePostClosurePreservationCustodyAuditReceipt.inheritedPostClosurePreservationContinuityLedgerReceiptSummary).toMatchObject({
      postClosurePreservationContinuityLedgerStatus: "continuous",
      postClosurePreservationVerificationStatus: "verified",
      preservationContinuityLedgerMutationCount: 0,
      postClosurePreservationVerificationMutationCount: 0,
      executionAttemptCount: 0,
      providerOutboundCallCount: 0,
      externalNotificationSendCount: 0,
      aiCallCount: 0,
      externalCallsZero: true
    });
    expect(certifiedReleasePostClosurePreservationCustodyAuditReceipt.counts.postClosurePreservationCustodyAuditMutationCount).toBe(0);
    expect(certifiedReleasePostClosurePreservationCustodyAuditReceipt.counts.preservationContinuityLedgerMutationCount).toBe(0);
    expect(certifiedReleasePostClosurePreservationCustodyAuditReceipt.counts.executionAttemptCount).toBe(0);
    expect(certifiedReleasePostClosurePreservationCustodyAuditReceipt.counts.providerOutboundCallCount).toBe(0);
    expect(certifiedReleasePostClosurePreservationCustodyAuditReceipt.counts.externalNotificationSendCount).toBe(0);
    expect(certifiedReleasePostClosurePreservationCustodyAuditReceipt.counts.aiCallCount).toBe(0);
    expect(certifiedReleasePostClosurePreservationCustodyAuditReceipt.externalCalls).toBe(0);
    expect(certifiedReleasePostClosurePreservationCustodyChainSealReceipt.receiptKind).toBe("qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-chain-seal-receipt");
    expect(certifiedReleasePostClosurePreservationCustodyChainSealReceipt.postClosurePreservationCustodyChainSealStatus).toBe("sealed");
    expect(certifiedReleasePostClosurePreservationCustodyChainSealReceipt.postClosurePreservationCustodyAuditStatus).toBe("audited");
    expect(certifiedReleasePostClosurePreservationCustodyChainSealReceipt.postClosurePreservationCustodyChainSealDigest).toBe(certifiedReleasePostClosurePreservationCustodyChainSealReceipt.safeDigest);
    expect(certifiedReleasePostClosurePreservationCustodyChainSealReceipt.postClosurePreservationCustodyAuditDigest).toBe(certifiedReleasePostClosurePreservationCustodyAuditReceipt.safeDigest);
    expect(certifiedReleasePostClosurePreservationCustodyChainSealReceipt.custodyChainSealRows.map((row) => row.sprintNumber)).toEqual([103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115]);
    expect(certifiedReleasePostClosurePreservationCustodyChainSealReceipt.custodyChainSealRows.every((row) => row.externalCalls === 0 && row.mutationCount === 0 && row.custodyAuditStatus === "under_safe_custody" && row.custodyChainSealStatus === "sealed_under_safe_custody")).toBe(true);
    expect(certifiedReleasePostClosurePreservationCustodyChainSealReceipt.inheritedPostClosurePreservationCustodyAuditReceiptSummary).toMatchObject({
      postClosurePreservationCustodyAuditStatus: "audited",
      postClosurePreservationContinuityLedgerStatus: "continuous",
      postClosurePreservationVerificationStatus: "verified",
      postClosurePreservationCustodyAuditMutationCount: 0,
      preservationContinuityLedgerMutationCount: 0,
      postClosurePreservationVerificationMutationCount: 0,
      executionAttemptCount: 0,
      providerOutboundCallCount: 0,
      externalNotificationSendCount: 0,
      aiCallCount: 0,
      externalCallsZero: true
    });
    expect(certifiedReleasePostClosurePreservationCustodyChainSealReceipt.counts.postClosurePreservationCustodyChainSealMutationCount).toBe(0);
    expect(certifiedReleasePostClosurePreservationCustodyChainSealReceipt.counts.postClosurePreservationCustodyAuditMutationCount).toBe(0);
    expect(certifiedReleasePostClosurePreservationCustodyChainSealReceipt.counts.executionAttemptCount).toBe(0);
    expect(certifiedReleasePostClosurePreservationCustodyChainSealReceipt.counts.providerOutboundCallCount).toBe(0);
    expect(certifiedReleasePostClosurePreservationCustodyChainSealReceipt.counts.externalNotificationSendCount).toBe(0);
    expect(certifiedReleasePostClosurePreservationCustodyChainSealReceipt.counts.aiCallCount).toBe(0);
    expect(certifiedReleasePostClosurePreservationCustodyChainSealReceipt.externalCalls).toBe(0);
    expect(certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceipt.receiptKind).toBe("qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-chain-integrity-ledger-receipt");
    expect(certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainIntegrityLedgerStatus).toBe("integrity_confirmed");
    expect(certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainSealStatus).toBe("sealed");
    expect(certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainIntegrityLedgerDigest).toBe(certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceipt.safeDigest);
    expect(certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceipt.postClosurePreservationCustodyChainSealDigest).toBe(certifiedReleasePostClosurePreservationCustodyChainSealReceipt.safeDigest);
    expect(certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceipt.custodyChainIntegrityLedgerRows.map((row) => row.sprintNumber)).toEqual([103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116]);
    expect(certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceipt.custodyChainIntegrityLedgerRows.every((row) => row.externalCalls === 0 && row.mutationCount === 0 && row.custodyAuditStatus === "under_safe_custody" && row.custodyChainSealStatus === "sealed_under_safe_custody" && row.custodyChainIntegrityLedgerStatus === "integrity_confirmed_under_safe_custody")).toBe(true);
    expect(certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceipt.inheritedPostClosurePreservationCustodyChainSealReceiptSummary).toMatchObject({
      postClosurePreservationCustodyChainSealStatus: "sealed",
      postClosurePreservationCustodyAuditStatus: "audited",
      postClosurePreservationCustodyChainSealMutationCount: 0,
      postClosurePreservationCustodyAuditMutationCount: 0,
      preservationContinuityLedgerMutationCount: 0,
      postClosurePreservationVerificationMutationCount: 0,
      executionAttemptCount: 0,
      providerOutboundCallCount: 0,
      externalNotificationSendCount: 0,
      aiCallCount: 0,
      externalCallsZero: true
    });
    expect(certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceipt.counts.postClosurePreservationCustodyChainIntegrityLedgerMutationCount).toBe(0);
    expect(certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceipt.counts.postClosurePreservationCustodyChainSealMutationCount).toBe(0);
    expect(certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceipt.counts.executionAttemptCount).toBe(0);
    expect(certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceipt.counts.providerOutboundCallCount).toBe(0);
    expect(certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceipt.counts.externalNotificationSendCount).toBe(0);
    expect(certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceipt.counts.aiCallCount).toBe(0);
    expect(certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceipt.externalCalls).toBe(0);
    expect(certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.receiptKind).toBe("qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-chain-integrity-ledger-continuity-receipt");
    expect(certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.postClosurePreservationCustodyChainIntegrityLedgerContinuityStatus).toBe("continuity_confirmed");
    expect(certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.postClosurePreservationCustodyChainIntegrityLedgerStatus).toBe("integrity_confirmed");
    expect(certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.redactionStatus).toBe("passed");
    expect(certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.postClosurePreservationCustodyChainIntegrityLedgerContinuityDigest).toBe(certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.safeDigest);
    expect(certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.sprint116ReceiptReference.safeDigest).toBe(certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceipt.safeDigest);
    expect(certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.sealedArchiveReference.safeDigest).toBe(certifiedReleasePostClosurePreservationCustodyChainSealReceipt.safeDigest);
    expect(certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.safeRowSummaries.map((row) => row.sprintNumber)).toEqual([103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117]);
    expect(certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.safeRowSummaries.every((row) => row.externalCalls === 0 && row.mutationCount === 0 && row.custodyAuditStatus === "under_safe_custody" && row.custodyChainSealStatus === "sealed_under_safe_custody" && row.custodyChainIntegrityLedgerStatus === "integrity_confirmed_under_safe_custody" && row.custodyChainIntegrityLedgerContinuityStatus === "continuity_confirmed_under_safe_custody")).toBe(true);
    expect(certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.counts.custodyChainIntegrityLedgerContinuityRowCount).toBe(15);
    expect(certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.counts.custodyChainIntegrityLedgerContinuitySafeCount).toBe(15);
    expect(certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.noExecutionFlags).toMatchObject({
      externalCallsZero: true,
      executionAttemptCount: 0,
      providerOutboundCallCount: 0,
      externalNotificationSendCount: 0,
      aiCallCount: 0
    });
    expect(certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.externalCalls).toBe(0);
    expect(certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt.receiptKind).toBe("qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-chain-integrity-ledger-continuity-verification-receipt");
    expect(certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt.receiptStatus).toBe("issued");
    expect(certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt.verificationStatus).toBe("verified");
    expect(certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt.continuityStatus).toBe("continuity_confirmed");
    expect(certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt.custodyChainStatus).toBe("sealed");
    expect(certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt.ledgerIntegrityStatus).toBe("integrity_confirmed");
    expect(certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt.noExecutionStatus).toBe("confirmed");
    expect(certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt.sourceSprint).toBe(117);
    expect(certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt.derivedFrom.safeDigest).toBe(certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.safeDigest);
    expect(certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt.sprint117ReceiptDigest).toBe(certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.safeDigest);
    expect(certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt.continuityVerificationDigest).toBe(certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt.safeDigest);
    expect(certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt.verificationRows.map((row) => row.sprintNumber)).toEqual([103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118]);
    expect(certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt.verificationRows.every((row) => row.externalCalls === 0 && row.mutationCount === 0 && row.custodyChainStatus === "sealed_under_safe_custody" && row.ledgerIntegrityStatus === "integrity_confirmed_under_safe_custody" && row.continuityStatus === "continuity_confirmed_under_safe_custody" && row.verificationStatus === "verified_under_safe_custody")).toBe(true);
    expect(certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt.counts.verificationRowCount).toBe(16);
    expect(certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt.counts.verificationSafeCount).toBe(16);
    expect(certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt.safeSummary.rawProviderMaterialAbsent).toBe(true);
    expect(certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt.externalCalls).toBe(0);
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedgerSchema.parse({ ...certifiedReleaseOperationsCustodyMonitoringReadinessLedger, rawPayload: {} })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedgerSchema.parse({ ...certifiedReleaseOperationsCustodyMonitoringReadinessLedger, replyToken: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedgerSchema.parse({ ...certifiedReleaseOperationsCustodyMonitoringReadinessLedger, externalCalls: 1 })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceiptSchema.parse({ ...certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt, rawPayload: {} })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceiptSchema.parse({ ...certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt, replyToken: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseOperationsCustodyMonitoringCloseoutSealReceiptSchema.parse({ ...certifiedReleaseOperationsCustodyMonitoringCloseoutSealReceipt, externalCalls: 1 })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollupSchema.parse({ ...certifiedReleaseFinalNoExecutionEvidenceRollup, rawPayload: {} })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollupSchema.parse({ ...certifiedReleaseFinalNoExecutionEvidenceRollup, replyToken: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseFinalNoExecutionEvidenceRollupSchema.parse({ ...certifiedReleaseFinalNoExecutionEvidenceRollup, externalCalls: 1 })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceiptSchema.parse({ ...certifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt, rawPayload: {} })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceiptSchema.parse({ ...certifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt, replyToken: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseFinalEvidenceIndexRegressionGuardrailReceiptSchema.parse({ ...certifiedReleaseFinalEvidenceIndexRegressionGuardrailReceipt, externalCalls: 1 })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealOperationalClosureReceiptSchema.parse({ ...certifiedReleaseFinalArchiveSealOperationalClosureReceipt, rawPayload: {} })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealOperationalClosureReceiptSchema.parse({ ...certifiedReleaseFinalArchiveSealOperationalClosureReceipt, replyToken: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealOperationalClosureReceiptSchema.parse({ ...certifiedReleaseFinalArchiveSealOperationalClosureReceipt, externalCalls: 1 })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceiptSchema.parse({ ...certifiedReleasePostClosurePreservationVerificationReceipt, rawPayload: {} })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceiptSchema.parse({ ...certifiedReleasePostClosurePreservationVerificationReceipt, replyToken: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceiptSchema.parse({ ...certifiedReleasePostClosurePreservationVerificationReceipt, externalCalls: 1 })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceiptSchema.parse({ ...certifiedReleasePostClosurePreservationVerificationReceipt, counts: { ...certifiedReleasePostClosurePreservationVerificationReceipt.counts, providerOutboundCallCount: 1 } })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceiptSchema.parse({ ...certifiedReleasePostClosurePreservationContinuityLedgerReceipt, rawPayload: {} })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceiptSchema.parse({ ...certifiedReleasePostClosurePreservationContinuityLedgerReceipt, replyToken: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceiptSchema.parse({ ...certifiedReleasePostClosurePreservationContinuityLedgerReceipt, externalCalls: 1 })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceiptSchema.parse({ ...certifiedReleasePostClosurePreservationContinuityLedgerReceipt, counts: { ...certifiedReleasePostClosurePreservationContinuityLedgerReceipt.counts, providerOutboundCallCount: 1 } })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceiptSchema.parse({ ...certifiedReleasePostClosurePreservationCustodyAuditReceipt, rawPayload: {} })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceiptSchema.parse({ ...certifiedReleasePostClosurePreservationCustodyAuditReceipt, replyToken: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceiptSchema.parse({ ...certifiedReleasePostClosurePreservationCustodyAuditReceipt, externalCalls: 1 })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceiptSchema.parse({ ...certifiedReleasePostClosurePreservationCustodyAuditReceipt, counts: { ...certifiedReleasePostClosurePreservationCustodyAuditReceipt.counts, providerOutboundCallCount: 1 } })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealReceiptSchema.parse({ ...certifiedReleasePostClosurePreservationCustodyChainSealReceipt, rawPayload: {} })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealReceiptSchema.parse({ ...certifiedReleasePostClosurePreservationCustodyChainSealReceipt, replyToken: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealReceiptSchema.parse({ ...certifiedReleasePostClosurePreservationCustodyChainSealReceipt, externalCalls: 1 })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealReceiptSchema.parse({ ...certifiedReleasePostClosurePreservationCustodyChainSealReceipt, counts: { ...certifiedReleasePostClosurePreservationCustodyChainSealReceipt.counts, providerOutboundCallCount: 1 } })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerReceiptSchema.parse({ ...certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceipt, rawPayload: {} })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerReceiptSchema.parse({ ...certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceipt, replyToken: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerReceiptSchema.parse({ ...certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceipt, externalCalls: 1 })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerReceiptSchema.parse({ ...certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceipt, counts: { ...certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerReceipt.counts, providerOutboundCallCount: 1 } })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityReceiptSchema.parse({ ...certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt, rawPayload: {} })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityReceiptSchema.parse({ ...certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt, replyToken: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityReceiptSchema.parse({ ...certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt, externalCalls: 1 })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityReceiptSchema.parse({ ...certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt, counts: { ...certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityReceipt.counts, providerOutboundCallCount: 1 } })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceiptSchema.parse({ ...certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt, rawPayload: {} })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceiptSchema.parse({ ...certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt, replyToken: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceiptSchema.parse({ ...certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt, externalCalls: 1 })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceiptSchema.parse({ ...certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt, counts: { ...certifiedReleasePostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationReceipt.counts, continuityVerificationMutationCount: 1 } })).toThrow();
    expect(() => providerWebhookReviewQaHandoffArchiveFinalizationSchema.parse({ ...finalization, rawPayload: {} })).toThrow();
    expect(() => providerWebhookReviewQaHandoffFinalizationSignOffRequestSchema.parse({ reviewerLabel: "safe", replyToken: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffFinalizationReceiptSchema.parse({ ...receipt, token: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffReleaseEvidenceSchema.parse({ ...releaseEvidence, authorization: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffReleaseEvidenceSchema.parse({ ...releaseEvidence, rawSenderId: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffReleaseVerificationSchema.parse({ ...releaseVerification, rawPayload: {} })).toThrow();
    expect(() => providerWebhookReviewQaHandoffReleaseVerificationSchema.parse({ ...releaseVerification, replyToken: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffReleaseCertificationSchema.parse({ ...releaseCertification, authorization: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffReleaseCertificationSchema.parse({ ...releaseCertification, rawRoomId: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffReleaseClosureLedgerSchema.parse({ ...releaseClosureLedger, rawPayload: {} })).toThrow();
    expect(() => providerWebhookReviewQaHandoffReleaseClosureLedgerSchema.parse({ ...releaseClosureLedger, replyToken: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffReleaseAttestationAuditSchema.parse({ ...releaseAttestationAudit, rawPayload: {} })).toThrow();
    expect(() => providerWebhookReviewQaHandoffReleaseAttestationAuditSchema.parse({ ...releaseAttestationAudit, replyToken: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffReleaseAttestationReconciliationRegisterSchema.parse({ ...releaseAttestationReconciliation, rawPayload: {} })).toThrow();
    expect(() => providerWebhookReviewQaHandoffReleaseAttestationReconciliationRegisterSchema.parse({ ...releaseAttestationReconciliation, signature: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffReleaseAttestationReconciliationRegisterSchema.parse({ ...releaseAttestationReconciliation, token: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffReleaseAttestationReconciliationRegisterSchema.parse({ ...releaseAttestationReconciliation, authorization: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffReleaseAttestationReconciliationRegisterSchema.parse({ ...releaseAttestationReconciliation, cookie: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffReleaseAttestationReconciliationRegisterSchema.parse({ ...releaseAttestationReconciliation, replyToken: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffReleaseAttestationReconciliationRegisterSchema.parse({ ...releaseAttestationReconciliation, senderId: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffReleaseAttestationReconciliationRegisterSchema.parse({ ...releaseAttestationReconciliation, roomId: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffReleaseAttestationReconciliationRegisterSchema.parse({ ...releaseAttestationReconciliation, providerMaterial: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffReleaseAttestationReconciliationRegisterSchema.parse({ ...releaseAttestationReconciliation, rawBody: {} })).toThrow();
    expect(() => providerWebhookReviewQaHandoffReleaseAttestationReconciliationRegisterSchema.parse({ ...releaseAttestationReconciliation, headers: {} })).toThrow();
    expect(() => providerWebhookReviewQaHandoffReleaseAttestationReconciliationRegisterSchema.parse({ ...releaseAttestationReconciliation, stack: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseGateSchema.parse({ ...certifiedReleaseGate, rawPayload: {} })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseGateSchema.parse({ ...certifiedReleaseGate, signature: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseGateSchema.parse({ ...certifiedReleaseGate, token: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseGateSchema.parse({ ...certifiedReleaseGate, authorization: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseGateSchema.parse({ ...certifiedReleaseGate, cookie: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseGateSchema.parse({ ...certifiedReleaseGate, replyToken: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseGateSchema.parse({ ...certifiedReleaseGate, senderId: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseGateSchema.parse({ ...certifiedReleaseGate, roomId: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseGateSchema.parse({ ...certifiedReleaseGate, providerMaterial: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseGateSchema.parse({ ...certifiedReleaseGate, rawBody: {} })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseGateSchema.parse({ ...certifiedReleaseGate, headers: {} })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseGateSchema.parse({ ...certifiedReleaseGate, stack: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptSchema.parse({ ...certifiedReleaseDecisionReceipt, rawPayload: {} })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptSchema.parse({ ...certifiedReleaseDecisionReceipt, signature: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptSchema.parse({ ...certifiedReleaseDecisionReceipt, token: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptSchema.parse({ ...certifiedReleaseDecisionReceipt, authorization: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptSchema.parse({ ...certifiedReleaseDecisionReceipt, cookie: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptSchema.parse({ ...certifiedReleaseDecisionReceipt, replyToken: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptSchema.parse({ ...certifiedReleaseDecisionReceipt, senderId: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptSchema.parse({ ...certifiedReleaseDecisionReceipt, roomId: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptSchema.parse({ ...certifiedReleaseDecisionReceipt, providerMaterial: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptSchema.parse({ ...certifiedReleaseDecisionReceipt, rawBody: {} })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptSchema.parse({ ...certifiedReleaseDecisionReceipt, headers: {} })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptSchema.parse({ ...certifiedReleaseDecisionReceipt, stack: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseHandoffPacketSchema.parse({ ...certifiedReleaseHandoffPacket, rawPayload: {} })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseHandoffPacketSchema.parse({ ...certifiedReleaseHandoffPacket, signature: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseHandoffPacketSchema.parse({ ...certifiedReleaseHandoffPacket, token: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseHandoffPacketSchema.parse({ ...certifiedReleaseHandoffPacket, authorization: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseHandoffPacketSchema.parse({ ...certifiedReleaseHandoffPacket, cookie: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseHandoffPacketSchema.parse({ ...certifiedReleaseHandoffPacket, replyToken: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseHandoffPacketSchema.parse({ ...certifiedReleaseHandoffPacket, senderId: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseHandoffPacketSchema.parse({ ...certifiedReleaseHandoffPacket, roomId: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseHandoffPacketSchema.parse({ ...certifiedReleaseHandoffPacket, providerMaterial: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseHandoffPacketSchema.parse({ ...certifiedReleaseHandoffPacket, rawBody: {} })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseHandoffPacketSchema.parse({ ...certifiedReleaseHandoffPacket, headers: {} })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseHandoffPacketSchema.parse({ ...certifiedReleaseHandoffPacket, stack: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordSchema.parse({ ...certifiedReleaseHandoffAcceptanceRecord, rawPayload: {} })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordSchema.parse({ ...certifiedReleaseHandoffAcceptanceRecord, signature: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordSchema.parse({ ...certifiedReleaseHandoffAcceptanceRecord, token: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordSchema.parse({ ...certifiedReleaseHandoffAcceptanceRecord, authorization: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordSchema.parse({ ...certifiedReleaseHandoffAcceptanceRecord, cookie: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordSchema.parse({ ...certifiedReleaseHandoffAcceptanceRecord, replyToken: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordSchema.parse({ ...certifiedReleaseHandoffAcceptanceRecord, senderId: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordSchema.parse({ ...certifiedReleaseHandoffAcceptanceRecord, roomId: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordSchema.parse({ ...certifiedReleaseHandoffAcceptanceRecord, providerMaterial: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordSchema.parse({ ...certifiedReleaseHandoffAcceptanceRecord, rawBody: {} })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordSchema.parse({ ...certifiedReleaseHandoffAcceptanceRecord, headers: {} })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordSchema.parse({ ...certifiedReleaseHandoffAcceptanceRecord, stack: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunRequestSchema.parse({ checklistAcknowledged: true, executionMode: "live" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunRequestSchema.parse({ checklistAcknowledged: true, executionMode: "no_op", replyToken: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunSchema.parse({ ...certifiedReleaseNoopExecutionDryRun, rawPayload: {} })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunSchema.parse({ ...certifiedReleaseNoopExecutionDryRun, signature: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunSchema.parse({ ...certifiedReleaseNoopExecutionDryRun, token: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunSchema.parse({ ...certifiedReleaseNoopExecutionDryRun, authorization: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunSchema.parse({ ...certifiedReleaseNoopExecutionDryRun, cookie: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunSchema.parse({ ...certifiedReleaseNoopExecutionDryRun, replyToken: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunSchema.parse({ ...certifiedReleaseNoopExecutionDryRun, senderId: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunSchema.parse({ ...certifiedReleaseNoopExecutionDryRun, roomId: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunSchema.parse({ ...certifiedReleaseNoopExecutionDryRun, providerMaterial: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunSchema.parse({ ...certifiedReleaseNoopExecutionDryRun, rawBody: {} })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunSchema.parse({ ...certifiedReleaseNoopExecutionDryRun, headers: {} })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunSchema.parse({ ...certifiedReleaseNoopExecutionDryRun, stack: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerSchema.parse({ ...certifiedReleaseDryRunResultLedger, rawPayload: {} })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerSchema.parse({ ...certifiedReleaseDryRunResultLedger, signature: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerSchema.parse({ ...certifiedReleaseDryRunResultLedger, token: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerSchema.parse({ ...certifiedReleaseDryRunResultLedger, authorization: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerSchema.parse({ ...certifiedReleaseDryRunResultLedger, cookie: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerSchema.parse({ ...certifiedReleaseDryRunResultLedger, replyToken: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerSchema.parse({ ...certifiedReleaseDryRunResultLedger, senderId: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerSchema.parse({ ...certifiedReleaseDryRunResultLedger, roomId: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerSchema.parse({ ...certifiedReleaseDryRunResultLedger, providerMaterial: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerSchema.parse({ ...certifiedReleaseDryRunResultLedger, rawBody: {} })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerSchema.parse({ ...certifiedReleaseDryRunResultLedger, headers: {} })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerSchema.parse({ ...certifiedReleaseDryRunResultLedger, stack: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificateSchema.parse({ ...certifiedReleaseFinalReadinessCertificate, rawPayload: {} })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificateSchema.parse({ ...certifiedReleaseFinalReadinessCertificate, token: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegisterSchema.parse({ ...certifiedReleaseFreezeAuditRegister, rawPayload: {} })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegisterSchema.parse({ ...certifiedReleaseFreezeAuditRegister, token: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptSchema.parse({ ...certifiedReleaseRollbackRehearsalReceipt, rawPayload: {} })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptSchema.parse({ ...certifiedReleaseRollbackRehearsalReceipt, token: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseControlRoomPacketSchema.parse({ ...certifiedReleaseControlRoomPacket, rawPayload: {} })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseControlRoomPacketSchema.parse({ ...certifiedReleaseControlRoomPacket, token: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceiptSchema.parse({ ...certifiedReleaseCutoverChecklistReceipt, rawPayload: {} })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceiptSchema.parse({ ...certifiedReleaseCutoverChecklistReceipt, token: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceiptSchema.parse({ ...certifiedReleaseOperatorCommandReceipt, rawPayload: {} })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceiptSchema.parse({ ...certifiedReleaseOperatorCommandReceipt, token: "raw" })).toThrow();
    expect(() => providerWebhookReviewQaHandoffArchiveFinalizationSchema.parse({ ...finalization, externalCalls: 1 })).toThrow();
    expect(() => providerWebhookReviewQaHandoffReleaseEvidenceSchema.parse({ ...releaseEvidence, externalCalls: 1 })).toThrow();
    expect(() => providerWebhookReviewQaHandoffReleaseVerificationSchema.parse({ ...releaseVerification, externalCalls: 1 })).toThrow();
    expect(() => providerWebhookReviewQaHandoffReleaseCertificationSchema.parse({ ...releaseCertification, externalCalls: 1 })).toThrow();
    expect(() => providerWebhookReviewQaHandoffReleaseClosureLedgerSchema.parse({ ...releaseClosureLedger, externalCalls: 1 })).toThrow();
    expect(() => providerWebhookReviewQaHandoffReleaseAttestationAuditSchema.parse({ ...releaseAttestationAudit, externalCalls: 1 })).toThrow();
    expect(() => providerWebhookReviewQaHandoffReleaseAttestationReconciliationRegisterSchema.parse({ ...releaseAttestationReconciliation, externalCalls: 1 })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseGateSchema.parse({ ...certifiedReleaseGate, externalCalls: 1 })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceiptSchema.parse({ ...certifiedReleaseDecisionReceipt, externalCalls: 1 })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseHandoffPacketSchema.parse({ ...certifiedReleaseHandoffPacket, externalCalls: 1 })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordSchema.parse({ ...certifiedReleaseHandoffAcceptanceRecord, externalCalls: 1 })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRunSchema.parse({ ...certifiedReleaseNoopExecutionDryRun, externalCalls: 1 })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedgerSchema.parse({ ...certifiedReleaseDryRunResultLedger, externalCalls: 1 })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificateSchema.parse({ ...certifiedReleaseFinalReadinessCertificate, externalCalls: 1 })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegisterSchema.parse({ ...certifiedReleaseFreezeAuditRegister, externalCalls: 1 })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptSchema.parse({ ...certifiedReleaseRollbackRehearsalReceipt, externalCalls: 1 })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseControlRoomPacketSchema.parse({ ...certifiedReleaseControlRoomPacket, externalCalls: 1 })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceiptSchema.parse({ ...certifiedReleaseCutoverChecklistReceipt, externalCalls: 1 })).toThrow();
    expect(() => providerWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceiptSchema.parse({ ...certifiedReleaseOperatorCommandReceipt, externalCalls: 1 })).toThrow();
  });

  it("validates provider webhook closure evidence and report DTOs", () => {
    const evidence = providerWebhookReviewClosureEvidenceSchema.parse({
      generatedAt: "2026-06-04T00:00:00.000Z",
      unmatchedId: "provider-webhook-unmatched-1",
      provider: "line",
      platform: "line",
      channelAccountId: "sandbox:line",
      safeRoomLabel: "line room digest safe",
      roomKeyDigest: "sha256:saferoomdigest",
      eventType: "message.created",
      receivedAt: "2026-06-04T00:00:00.000Z",
      ageBucket: "under1Hour",
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      triageLane: "safe_link_candidate_available",
      severity: "info",
      assignmentStatus: "assigned",
      assignedToOperatorLabel: "operator:current",
      escalationStatus: "none",
      escalationReason: null,
      resolutionStatus: "resolved",
      resolutionOutcome: "NEEDS_REVIEW",
      closureReadiness: "NOT_READY",
      evidenceStatus: "incomplete",
      checklistCompletedCount: 1,
      checklistTotalCount: 9,
      checklistIncompleteSteps: ["CONFIRMED_NO_RAW_LEAKAGE"],
      recommendedNextActions: ["OPEN_DIAGNOSTICS"],
      evidenceFlags: {
        diagnosticsViewedOrAvailable: true,
        historyAvailable: true,
        operatorNotesAvailable: false,
        candidatesAvailable: true,
        assignmentOrEscalationPresent: true,
        noProviderOutboundConfirmed: false,
        noRawLeakageConfirmed: false,
        safeLinkTargetConfirmed: false
      },
      historyEntryCount: 2,
      operatorNoteCount: 0,
      candidateSummaryCount: 1,
      externalCalls: 0
    });

    const { generatedAt: _generatedAt, ...evidenceSummary } = evidence;
    const report = providerWebhookReviewClosureReportSchema.parse({
      generatedAt: "2026-06-04T00:00:00.000Z",
      appliedFilters: {
        provider: "line",
        checklistIncomplete: true
      },
      totalItems: 1,
      totalOpenItems: 1,
      evidenceReadyCount: 0,
      evidenceBlockedCount: 0,
      evidenceIncompleteCount: 1,
      byClosureReadiness: [{ key: "NOT_READY", label: "NOT_READY", count: 1 }],
      byResolutionOutcome: [{ key: "NEEDS_REVIEW", label: "NEEDS_REVIEW", count: 1 }],
      byChecklistStep: [{ key: "CONFIRMED_NO_RAW_LEAKAGE", label: "CONFIRMED_NO_RAW_LEAKAGE", count: 1 }],
      byAssignmentStatus: [{ key: "assigned", label: "assigned", count: 1 }],
      byEscalationStatus: [{ key: "none", label: "none", count: 1 }],
      topEvidenceReadyItems: [],
      topEvidenceBlockedItems: [evidenceSummary],
      externalCalls: 0
    });

    const evidenceExport = providerWebhookReviewClosureEvidenceExportSchema.parse({
      ...evidence,
      exportKind: "closure-evidence",
      format: "json",
      contentType: "application/json",
      safeFilename: "provider-webhook-closure-evidence-line-provider-webhook-unmatched-1.json",
      exportedAt: "2026-06-04T00:01:00.000Z"
    });

    const reportExport = providerWebhookReviewClosureReportExportSchema.parse({
      ...report,
      exportKind: "closure-report",
      format: "json",
      contentType: "application/json",
      safeFilename: "provider-webhook-review-closure-report.json",
      exportedAt: "2026-06-04T00:01:00.000Z"
    });

    const redactionAudit = providerWebhookReviewExportRedactionAuditSchema.parse({
      generatedAt: "2026-06-04T00:02:00.000Z",
      auditTarget: "closure-evidence-export",
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
      unmatchedId: "provider-webhook-unmatched-1",
      exportShapeVersion: "provider-webhook-closure-export-v1",
      safeDigest: "sha256:safeauditdigest",
      externalCalls: 0
    });

    const integrity = providerWebhookReviewExportIntegritySchema.parse({
      generatedAt: "2026-06-04T00:03:00.000Z",
      appliedFilters: {
        provider: "line",
        checklistIncomplete: true
      },
      externalCalls: 0,
      totalCheckedItems: 1,
      redactionPassedCount: 1,
      redactionWarningCount: 0,
      redactionBlockedCount: 0,
      deterministicExportConfirmed: true,
      exportShapeVersion: "provider-webhook-closure-export-v1",
      safeReportDigest: "sha256:safereportdigest"
    });

    const reportRedactionAudit = providerWebhookReviewExportRedactionAuditSchema.parse({
      ...redactionAudit,
      auditTarget: "closure-report-export",
      unmatchedId: undefined,
      appliedFilters: {
        provider: "line",
        checklistIncomplete: true
      },
      safeDigest: "sha256:safereportauditdigest"
    });

    const manifest = providerWebhookReviewExportManifestSchema.parse({
      generatedAt: "2026-06-04T00:04:00.000Z",
      manifestKind: "provider-webhook-review-export-manifest",
      manifestTarget: "closure-report-export",
      exportKind: "closure-report",
      format: "json",
      contentType: "application/json",
      safeFilename: "provider-webhook-review-closure-report.json",
      exportedAt: "2026-06-04T00:01:00.000Z",
      exportShapeVersion: "provider-webhook-closure-export-v1",
      appliedFilters: {
        provider: "line",
        checklistIncomplete: true
      },
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
      safeReportDigest: "sha256:safereportdigest",
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
    });

    const qaBundle = providerWebhookReviewQaHandoffBundleSchema.parse({
      generatedAt: "2026-06-04T00:05:00.000Z",
      bundleKind: "provider-webhook-review-qa-handoff-bundle",
      appliedFilters: report.appliedFilters,
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
      closureReportExport: reportExport,
      closureReportManifest: manifest,
      closureReportRedactionAudit: reportRedactionAudit,
      closureExportIntegrity: integrity,
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
        safeFilename: evidenceExport.safeFilename,
        safeDigest: "sha256:safeevidencedigest",
        redactionStatus: "passed",
        integrityStatus: "confirmed",
        deterministicExportConfirmed: true,
        manualQaReadiness: "ready",
        manualQaChecks: manifest.manualQaChecks,
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
      safeDigest: "sha256:safebundledigest",
      externalCalls: 0
    });

    expect(evidence.externalCalls).toBe(0);
    expect(report.appliedFilters.checklistIncomplete).toBe(true);
    expect(evidenceExport.exportKind).toBe("closure-evidence");
    expect(reportExport.externalCalls).toBe(0);
    expect(redactionAudit.checks.rawPayloadAbsent).toBe(true);
    expect(integrity.redactionPassedCount).toBe(1);
    expect(manifest.manualQaReadiness).toBe("ready");
    expect(qaBundle.manualQaChecks.externalCallsZero).toBe(true);
    expect(qaBundle.evidenceManifests[0]?.safeDigest).toMatch(/^sha256:/);
    expect(() => providerWebhookReviewQaHandoffBundleSchema.parse({
      ...qaBundle,
      rawPayload: {}
    })).toThrow();

    const qaBundleExport = providerWebhookReviewQaHandoffBundleExportSchema.parse({
      generatedAt: "2026-06-04T00:06:00.000Z",
      exportedAt: "2026-06-04T00:06:05.000Z",
      exportKind: "qa-handoff-bundle",
      format: "json",
      contentType: "application/json",
      safeFilename: "provider-webhook-review-qa-handoff-bundle-export.json",
      safeDigest: "sha256:safebundleexportdigest",
      status: "ready",
      counts: {
        totalItems: qaBundle.closureReportExport.totalItems,
        totalOpenItems: qaBundle.closureReportExport.totalOpenItems,
        evidenceManifestCount: qaBundle.evidenceManifests.length,
        closureEvidenceReadyCount: qaBundle.readiness.closureEvidenceReadyCount,
        closureEvidenceBlockedCount: qaBundle.readiness.closureEvidenceBlockedCount,
        closureEvidenceIncompleteCount: qaBundle.readiness.closureEvidenceIncompleteCount
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
      manualQaChecks: qaBundle.manualQaChecks,
      bundle: qaBundle,
      externalCalls: 0
    });

    expect(qaBundleExport.safeFilename).toBe("provider-webhook-review-qa-handoff-bundle-export.json");
    expect(qaBundleExport.safeDigest).toMatch(/^sha256:/);
    expect(qaBundleExport.externalCalls).toBe(0);
    expect(qaBundleExport.bundle.externalCalls).toBe(0);
    expect(qaBundleExport.redactionAuditSummary.providerOutboundAbsent).toBe(true);
    expect(() => providerWebhookReviewQaHandoffBundleExportSchema.parse({
      ...qaBundleExport,
      replyToken: "reply-token-must-not-parse"
    })).toThrow();
  });

  it("validates structured AI decisions", () => {
    const decision = aiDecisionSchema.parse({
      intent: "pricing",
      sentiment: "neutral",
      priority: "medium",
      confidence: 0.95,
      riskLevel: "low",
      requiresHuman: false,
      nextAction: "auto_reply",
      reply: "ราคาขึ้นอยู่กับแพ็กเกจครับ",
      summary: "Customer asks about pricing.",
      tags: ["pricing"],
      reason: "High confidence pricing FAQ."
    });

    expect(shouldAutoSend(decision, "auto_faq", true)).toBe(true);
  });

  it("falls back to requiresHuman when structured AI validation fails", () => {
    const decision = parseAiDecisionWithFallback({ intent: "bad" }, "bad-json");

    expect(decision.requiresHuman).toBe(true);
    expect(decision.nextAction).toBe("handoff");
    expect(decision.reason).toBe("bad-json");
  });

  it("hands off high-risk fallback decisions", () => {
    expect(shouldHandoff(createFallbackAiDecision())).toBe(true);
  });

  it("forces refund, complaint, and human requests to require a human", () => {
    for (const intent of ["refund", "complaint", "human_request"] as const) {
      const decision = applyAiDecisionPolicy({
        intent,
        sentiment: "neutral",
        priority: "low",
        confidence: 0.95,
        riskLevel: "low",
        requiresHuman: false,
        nextAction: "auto_reply",
        reply: "mock reply",
        summary: "mock summary",
        tags: [],
        reason: "policy test"
      });

      expect(decision.requiresHuman).toBe(true);
      expect(decision.nextAction).toBe("handoff");
    }
  });

  it("hands off confidence below 0.60", () => {
    const decision = applyAiDecisionPolicy({
      intent: "unknown",
      sentiment: "neutral",
      priority: "medium",
      confidence: 0.59,
      riskLevel: "low",
      requiresHuman: false,
      nextAction: "suggest_reply",
      reply: "mock reply",
      summary: "mock summary",
      tags: [],
      reason: "low confidence"
    });

    expect(decision.requiresHuman).toBe(true);
    expect(decision.nextAction).toBe("handoff");
  });

  it("allows high confidence low risk replies under auto mode", () => {
    const decision = applyAiDecisionPolicy({
      intent: "product_info",
      sentiment: "neutral",
      priority: "low",
      confidence: 0.9,
      riskLevel: "low",
      requiresHuman: false,
      nextAction: "auto_reply",
      reply: "mock reply",
      summary: "mock summary",
      tags: [],
      reason: "safe answer"
    });

    expect(decision.requiresHuman).toBe(false);
    expect(shouldAutoSend(decision, "ai_agent", true)).toBe(true);
  });

  it("validates knowledge item schema", () => {
    const parsed = knowledgeItemSchema.parse(sampleKnowledgeItems[0]);

    expect(parsed.id).toBe("kb-business-demo");
    expect(parsed.status).toBe("active");
  });

  it("validates knowledge category and status enums", () => {
    expect(knowledgeCategorySchema.parse("price_rules")).toBe("price_rules");
    expect(knowledgeStatusSchema.parse("archived")).toBe("archived");
    expect(() => knowledgeCategorySchema.parse("secret_docs")).toThrow();
    expect(() => knowledgeStatusSchema.parse("deleted")).toThrow();
  });

  it("validates CRM contact schemas and enums", () => {
    const identity = contactIdentitySchema.parse({
      id: "identity-1",
      contactId: "contact-1",
      platform: "line",
      channelAccountId: "line-oa-main",
      accountName: "LINE OA Main",
      externalUserId: "U123",
      externalConversationId: "U123",
      displayName: "Ploy",
      isPrimary: true,
      lastSeenAt: new Date().toISOString()
    });
    const task = contactTaskSchema.parse({
      id: "task-1",
      contactId: "contact-1",
      title: "Follow up",
      status: "open",
      ownerAgent: "May",
      createdAt: new Date().toISOString()
    });
    const contact = contactSchema.parse({
      id: "contact-1",
      displayName: "Ploy Smile",
      phone: "081-222-3434",
      email: "ploy@example.com",
      leadStatus: "interested",
      ownerAgent: "May",
      tags: ["faq"],
      customFields: { branch: "Siam" },
      identities: [identity],
      notes: [],
      tasks: [task],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    expect(contact.identities[0]?.isPrimary).toBe(true);
    expect(leadStatusSchema.parse("follow_up")).toBe("follow_up");
    expect(contactTaskStatusSchema.parse("done")).toBe("done");
    expect(() => leadStatusSchema.parse("merged")).toThrow();
    expect(() => contactTaskStatusSchema.parse("waiting")).toThrow();
  });

  it("validates safe Customer 360 profile update payloads", () => {
    const parsed = updateCustomer360ProfileRequestSchema.parse({
      contactId: "contact-1",
      displayName: "Ploy Smile",
      email: "ploy@example.com",
      phone: "081-222-3434",
      leadStatus: "qualified",
      tags: ["vip", "sprint41"]
    });

    expect(parsed.tags).toEqual(["vip", "sprint41"]);
    expect(() => updateCustomer360ProfileRequestSchema.parse({
      contactId: "contact-1",
      apiKey: "sk-should-not-be-accepted"
    })).toThrow();
  });

  it("validates safe Customer 360 consent update payloads", () => {
    const parsed = updateCustomer360ConsentRequestSchema.parse({
      contactId: "contact-1",
      optOut: true
    });

    expect(parsed).toEqual({ contactId: "contact-1", optOut: true });
    expect(() => updateCustomer360ConsentRequestSchema.parse({
      contactId: "contact-1",
      optOut: true,
      token: "secret-token"
    })).toThrow();
  });

  it("requires contact conversation cards to keep platform account room separation fields", () => {
    const card = coreConversationCardSchema.parse({
      id: "conv-line",
      roomId: "682ba6aa-901c-4617-af0f-78acc601615b",
      tab: "human",
      platform: "line",
      platformLabel: "LINE",
      channelAccountId: "00000000-0000-4000-8000-000000000022",
      accountName: "LINE OA Main",
      customerName: "Demo LINE Member",
      customerEmail: "-",
      customerPhone: "-",
      lastMessage: "hello",
      lastMessageAt: "2026-05-21T04:00:00.000Z",
      lastMessageTime: "11:00",
      unreadCount: 1,
      assignedAgent: null,
      tags: [],
      aiStatus: "Need Human",
      priority: "medium",
      status: "open",
      unreplied: true
    });

    expect(card).toMatchObject({
      id: "conv-line",
      roomId: "682ba6aa-901c-4617-af0f-78acc601615b",
      platform: "line",
      channelAccountId: "00000000-0000-4000-8000-000000000022",
      accountName: "LINE OA Main"
    });
    expect(() => coreConversationCardSchema.parse({ ...card, channelAccountId: undefined })).toThrow();
  });

  it("validates Sprint 8 admin tools schemas", () => {
    const now = new Date("2026-05-20T10:00:00.000Z").toISOString();
    const agent = agentSchema.parse({
      id: "agent-may",
      name: "May",
      email: "may@example.com",
      role: "agent",
      status: "online",
      avatarUrl: "https://example.com/may.png",
      assignedRoomIds: ["webchat-main"],
      maxActiveConversations: 5,
      activeConversationCount: 2
    });
    const assignment = assignmentSchema.parse({
      id: "assign-1",
      conversationId: "conv-web-01",
      agentId: agent.id,
      assignedBy: "agent-owner",
      assignedAt: now,
      status: "active"
    });
    const slaPolicy = slaPolicySchema.parse({
      id: "sla-high",
      name: "High priority",
      firstResponseMinutes: 10,
      nextResponseMinutes: 15,
      resolutionHours: 4,
      appliesToPriority: "high"
    });
    const slaState = slaStateSchema.parse({
      conversationId: "conv-web-01",
      firstResponseDueAt: now,
      nextResponseDueAt: now,
      resolutionDueAt: now,
      status: "warning",
      breachedReason: "First response due soon"
    });
    const note = internalNoteSchema.parse({
      id: "note-1",
      tenantId: "tenant-demo",
      conversationId: "conv-web-01",
      contactId: "contact-anya",
      customerId: "contact-anya",
      platform: "webchat",
      channelAccountId: "channel-webchat",
      roomId: "room-webchat",
      body: "Pinned team context",
      visibility: "team",
      createdBy: agent.id,
      createdAt: now,
      updatedAt: now,
      pinned: true,
      externalCalls: 0
    });
    const reply = cannedReplySchema.parse({
      id: "reply-price",
      title: "Pricing",
      shortcut: "/price",
      body: "แพ็กเกจเริ่มต้น...",
      tags: ["pricing"],
      category: "sales",
      isActive: true
    });
    const audit = auditLogSchema.parse({
      id: "audit-1",
      actorId: agent.id,
      action: "assign",
      targetType: "conversation",
      targetId: "conv-web-01",
      metadata: { agentId: agent.id },
      createdAt: now
    });

    expect(agent.role).toBe("agent");
    expect(assignment.status).toBe("active");
    expect(slaPolicy.appliesToPriority).toBe("high");
    expect(slaState.status).toBe("warning");
    expect(note.pinned).toBe(true);
    expect(reply.shortcut).toBe("/price");
    expect(audit.action).toBe("assign");
    expect(conversationPrioritySchema.parse("urgent")).toBe("urgent");
  });

  it("validates Sprint 9 analytics schemas and enums", () => {
    expect(analyticsDateRangeSchema.parse("last_7_days")).toBe("last_7_days");
    expect(metricTrendSchema.parse("flat")).toBe("flat");

    expect(metricCardSchema.parse({
      id: "total",
      title: "Total conversations",
      value: 128,
      previousValue: 100,
      changePercent: 28,
      trend: "up",
      unit: "conversations",
      description: "All conversations"
    }).trend).toBe("up");

    expect(channelMetricSchema.parse({
      platform: "line",
      accountName: "LINE OA Main",
      totalConversations: 20,
      newConversations: 5,
      resolvedConversations: 8,
      unresolvedConversations: 12,
      averageFirstResponseMinutes: 4,
      averageResolutionHours: 2,
      aiHandledCount: 12,
      humanHandledCount: 8,
      handoffCount: 3
    }).platform).toBe("line");

    expect(aiPerformanceMetricSchema.parse({
      totalAiRuns: 10,
      autoReplies: 4,
      suggestedReplies: 3,
      handoffs: 3,
      averageConfidence: 0.82,
      lowConfidenceCount: 1,
      markedWrongCount: 1,
      knowledgeSourceUsedCount: 7,
      noKnowledgeMatchCount: 2,
      topIntents: [{ intent: "pricing", count: 4 }],
      topFailureReasons: [{ reason: "low confidence", count: 1 }]
    }).topIntents[0]?.intent).toBe("pricing");

    expect(agentPerformanceMetricSchema.parse({
      agentId: "agent-may",
      agentName: "May",
      assignedCount: 4,
      resolvedCount: 2,
      averageFirstResponseMinutes: 5,
      averageHandleTimeMinutes: 30,
      slaBreachedCount: 1,
      notesCreated: 2,
      cannedRepliesUsed: 3,
      takeoverCount: 1
    }).agentName).toBe("May");

    expect(slaMetricSchema.parse({
      okCount: 5,
      warningCount: 2,
      breachedCount: 1,
      breachRatePercent: 12.5,
      topBreachedRooms: [{ roomId: "webchat-main", roomName: "Main Website", breachedCount: 1 }]
    }).breachedCount).toBe(1);

    expect(knowledgeMetricSchema.parse({
      knowledgeId: "kb-price-package",
      title: "Price",
      category: "price_rules",
      usedCount: 5,
      successfulUseCount: 4,
      markedWrongCount: 1,
      lastUsedAt: new Date().toISOString()
    }).category).toBe("price_rules");

    expect(conversationFunnelMetricSchema.parse({
      new: 1,
      interested: 2,
      qualified: 3,
      quoted: 4,
      won: 5,
      lost: 6,
      follow_up: 7
    }).follow_up).toBe(7);
  });

  it("does not use archived knowledge for matching", () => {
    const archivedOnly = sampleKnowledgeItems.map((item) => ({ ...item, status: "archived" as const }));

    expect(findMatchedKnowledge("ขอราคาแพ็กเกจ", archivedOnly)).toEqual([]);
  });

  it("matches active FAQ and price knowledge with customer questions", () => {
    const faq = findMatchedKnowledge("มีคู่มือ webhook ไหม", sampleKnowledgeItems, { categories: ["faq"] });
    const pricing = createKnowledgeAwareMockAiDecision("ขอราคาแพ็กเกจ Pro", sampleKnowledgeItems);

    expect(faq[0]?.category).toBe("faq");
    expect(pricing.intent).toBe("pricing");
    expect(pricing.matchedKnowledge?.[0]?.title).toContain("ราคา");
  });

  it("forces forbidden answers to require a human", () => {
    const decision = createKnowledgeAwareMockAiDecision("ช่วยยกเลิกบริการและ refund ให้ด้วย", sampleKnowledgeItems);

    expect(decision.requiresHuman).toBe(true);
    expect(decision.nextAction).toBe("handoff");
    expect(decision.matchedKnowledge?.some((item) => item.category === "forbidden_answers")).toBe(true);
  });

  it("returns matched knowledge in AI Test Lab mock results", () => {
    const decision = createKnowledgeAwareMockAiDecision("รองรับ Platform Rooms และ Customer 360 ไหม", sampleKnowledgeItems, { categories: ["product_service"] });

    expect(decision.matchedKnowledge?.length).toBeGreaterThan(0);
    expect(decision.summary).toContain("active knowledge");
  });

  it("validates Sprint 10 flow builder schemas", () => {
    const trigger = flowTriggerSchema.parse({
      id: "trigger-pricing",
      type: "keyword",
      keyword: "ราคา",
      matchMode: "contains",
      caseSensitive: false
    });
    const triggerNode = flowNodeSchema.parse({
      id: "node-trigger",
      type: "trigger",
      label: "Keyword trigger",
      config: {},
      position: { x: 0, y: 0 }
    });
    const actionNode = flowNodeSchema.parse({
      id: "node-message",
      type: "send_message",
      label: "Send package details",
      config: { message: "แพ็กเกจเริ่มต้น" },
      position: { x: 200, y: 0 }
    });
    const edge = flowEdgeSchema.parse({
      id: "edge-1",
      sourceNodeId: triggerNode.id,
      targetNodeId: actionNode.id,
      conditionLabel: "true"
    });
    const flow = flowSchema.parse({
      id: "flow-test",
      name: "Pricing flow",
      description: "Test flow",
      status: "draft",
      triggerType: "keyword",
      trigger,
      roomIds: ["webchat-main"],
      platformScope: ["webchat"],
      nodes: [triggerNode, actionNode],
      edges: [edge],
      createdAt: "2026-05-21T00:00:00.000Z",
      updatedAt: "2026-05-21T00:00:00.000Z"
    });
    const run = flowRunSchema.parse({
      id: "run-test",
      flowId: flow.id,
      conversationId: "conv-web-01",
      contactId: "contact-anya",
      status: "completed",
      startedAt: "2026-05-21T00:00:01.000Z",
      completedAt: "2026-05-21T00:00:02.000Z",
      steps: [{
        id: "step-1",
        nodeId: actionNode.id,
        nodeType: actionNode.type,
        status: "completed",
        input: { message: "ราคา" },
        output: { action: "mock" },
        createdAt: "2026-05-21T00:00:01.000Z"
      }],
      resultSummary: "Completed"
    });

    expect(flow.triggerType).toBe("keyword");
    expect(run.steps[0]?.nodeType).toBe("send_message");
  });

  it("validates Sprint 11 broadcast schemas", () => {
    const campaign = broadcastCampaignSchema.parse({
      id: "camp-test",
      name: "Test campaign",
      description: "Mock only",
      status: "draft",
      platformScope: ["line"],
      roomIds: ["line-oa-main"],
      segmentId: "seg-test",
      templateId: "tmpl-test",
      message: "Hello {{contact.name}}",
      scheduleType: "now",
      createdBy: "Demo Admin",
      createdAt: "2026-05-21T00:00:00.000Z",
      updatedAt: "2026-05-21T00:00:00.000Z"
    });
    const rule = broadcastSegmentRuleSchema.parse({
      id: "rule-test",
      field: "tag",
      operator: "contains",
      value: "pricing"
    });
    const segment = broadcastSegmentSchema.parse({
      id: "seg-test",
      name: "Pricing",
      description: "Pricing contacts",
      rules: [rule],
      createdAt: "2026-05-21T00:00:00.000Z",
      updatedAt: "2026-05-21T00:00:00.000Z"
    });
    const template = broadcastTemplateSchema.parse({
      id: "tmpl-test",
      name: "Pricing reminder",
      category: "sales",
      body: "Hello {{contact.name}}",
      variables: ["contact.name"],
      tags: ["pricing"],
      isActive: true,
      createdAt: "2026-05-21T00:00:00.000Z",
      updatedAt: "2026-05-21T00:00:00.000Z"
    });
    const recipient = broadcastRecipientSchema.parse({
      id: "recipient-test",
      campaignId: campaign.id,
      contactId: "contact-anya",
      identityId: "identity-anya-web",
      platform: "webchat",
      roomId: "webchat-main",
      displayName: "Anya",
      status: "pending",
      renderedMessage: "Hello Anya",
      createdAt: "2026-05-21T00:00:00.000Z",
      updatedAt: "2026-05-21T00:00:00.000Z"
    });
    const run = broadcastRunSchema.parse({
      id: "run-test",
      campaignId: campaign.id,
      status: "completed",
      totalRecipients: 1,
      sentMockCount: 1,
      failedMockCount: 0,
      skippedCount: 0,
      startedAt: "2026-05-21T00:00:00.000Z",
      completedAt: "2026-05-21T00:00:01.000Z",
      summary: "Mock completed"
    });
    const event = broadcastDeliveryEventSchema.parse({
      id: "event-test",
      campaignId: campaign.id,
      recipientId: recipient.id,
      status: "sent_mock",
      message: "local only",
      createdAt: "2026-05-21T00:00:01.000Z"
    });

    expect(segment.rules[0]?.field).toBe("tag");
    expect(template.isActive).toBe(true);
    expect(run.sentMockCount).toBe(1);
    expect(event.status).toBe("sent_mock");
  });
});
