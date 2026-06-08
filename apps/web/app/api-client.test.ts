import { afterEach, describe, expect, it, vi } from "vitest";
import {
  assignConversation,
  closeConversation,
  completeConversationWorkflowTask,
  createContact,
  createConversationNote,
  createConversationWorkflowTask,
  createKnowledgeBase,
  createKnowledgeChunk,
  createKnowledgeDocument,
  createProviderWebhookOperatorNote,
  createProviderWebhookReviewSavedView,
  createProviderWebhookSandboxEvent,
  archiveProviderWebhookReviewSavedView,
  assignProviderWebhookUnmatchedInbound,
  bulkAssignProviderWebhookUnmatchedInbound,
  bulkEscalateProviderWebhookUnmatchedInbound,
  bulkResolveProviderWebhookUnmatchedInbound,
  bulkReviewProviderWebhookUnmatchedInbound,
  deleteKnowledgeBase,
  createWebchatMessage,
  deleteKnowledgeChunk,
  deleteKnowledgeDocument,
  getConversationAuditLogs,
  getProviderReadiness,
  getProviderWebhookEvents,
  getProviderWebhookReviewAlerts,
  getProviderWebhookReviewClosureReportExport,
  getProviderWebhookReviewClosureReportExportManifest,
  getProviderWebhookReviewClosureReport,
  getProviderWebhookReviewClosureExportIntegrity,
  getProviderWebhookReviewClosureReportRedactionAudit,
  getProviderWebhookReviewQaHandoffBundle,
  getProviderWebhookReviewQaHandoffBundleExport,
  getProviderWebhookReviewQaHandoffBundleReceipt,
  getProviderWebhookReviewQaHandoffLockedArchive,
  exportProviderWebhookReviewQaHandoffLockedArchive,
  getProviderWebhookReviewQaHandoffArchiveIntegrity,
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
  getProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun,
  runProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun,
  getProviderWebhookReviewQaHandoffArchiveReleaseClosureLedger,
  getProviderWebhookReviewQaHandoffArchiveReleaseVerification,
  getProviderWebhookReviewQaHandoffRetentionAudit,
  getProviderWebhookReviewQaHandoffRetentionManifest,
  signOffProviderWebhookReviewQaHandoffArchiveFinalization,
  signOffProviderWebhookReviewQaHandoffBundleReceipt,
  getProviderWebhookReviewMetrics,
  getProviderWebhookReviewResolutionSummary,
  getProviderWebhookReviewSavedViews,
  getProviderWebhookReviewTriage,
  getProviderWebhookReviewWorkload,
  getProviderWebhookOperatorNotes,
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
  resolveProviderWebhookUnmatchedInbound,
  escalateProviderWebhookUnmatchedInbound,
  updateProviderWebhookUnmatchedInboundChecklist,
  updateProviderWebhookReviewSavedView,
  getKnowledgeBases,
  getKnowledgeChunks,
  getKnowledgeDocuments,
  getConversationNotes,
  getConversationStatusHistory,
  getConversationTasks,
  getConversations,
  getContact,
  getContactConversations,
  getContactIdentities,
  getContacts,
  getCustomer360,
  getSettingsChannel,
  getSettingsCannedReply,
  getSettingsCannedReplies,
  getSettingsChannels,
  getSettingsSlaPolicies,
  getSettingsSlaPolicy,
  getSettingsTeam,
  getSettingsTeamMember,
  getTaskDashboard,
  getRoomAiPolicy,
  getRooms,
  linkContactIdentity,
  returnConversationToAi,
  sendAgentMessage,
  setConversationFollowUp,
  setPrimaryContactIdentity,
  markAiSuggestionWrong,
  suggestAiReply,
  takeOverConversation,
  unlinkContactIdentity,
  updateBroadcastConsent,
  updateContact,
  updateCustomer360Consent,
  updateCustomer360Profile,
  updateConversationPriority,
  updateConversationReadState,
  updateConversationSla,
  updateConversationStatus,
  updateConversationWorkflowTask,
  updateKnowledgeBase,
  updateKnowledgeChunk,
  updateKnowledgeDocument,
  updateRoomAiPolicy,
  updateSettingsChannel,
  updateSettingsCannedReply,
  updateSettingsSlaPolicy,
  updateSettingsTeamMember
} from "./api-client";

const defaultTenantId = "00000000-0000-4000-8000-000000000001";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("frontend API client", () => {
  it("maps API mode calls to the backend client endpoints", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse([
      {
        id: "room-webchat",
        platform: "webchat",
        platformLabel: "Webchat",
        accountName: "Main Website",
        roomName: "Main Website",
        accent: "#0d9488",
        conversationCount: 1
      }
    ]));

    const rooms = await getRooms();

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/rooms", expect.any(Object));
    expectTenantHeaderForAll(fetchMock);
    expect(rooms[0]?.accountName).toBe("Main Website");
  });

  it("fetches provider readiness through the tenant-scoped API client without exposing secrets", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse(providerReadinessResponse()));

    const readiness = await getProviderReadiness();

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/health/readiness", expect.any(Object));
    expectTenantHeaderForAll(fetchMock);
    expect(readiness.realOutboundEnabled).toBe(false);
    expect(readiness.externalCalls).toBe(0);
    expect(readiness.allowlistCount).toBe(2);
    expect(readiness.providers.map((provider) => provider.name)).toEqual(["line", "telegram", "facebook", "instagram"]);
    expect(readiness.providers.every((provider) => !("allowlistCount" in provider))).toBe(true);
    expect(JSON.stringify(readiness)).not.toContain("U-raw-provider-test");
    expect(JSON.stringify(readiness)).not.toMatch(/token|secret|payloadJson|providerRaw|rawPayload/i);
  });

  it("surfaces provider readiness API errors instead of returning local readiness", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "readiness unavailable" }, 503));

    await expect(getProviderReadiness()).rejects.toThrow("API request failed (503): readiness unavailable");
  });

  it("wires locked archive and retention manifest through tenant-scoped API calls without fallback", async () => {
    const archive = providerWebhookLockedArchiveResponse();
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(archive))
      .mockResolvedValueOnce(jsonResponse({
        ...archive,
        lockedArchiveStatus: "exported",
        archiveAcknowledgementStatus: "exported",
        safeFilename: "provider-webhook-review-qa-handoff-locked-archive-export.json",
        exportedAt: "2026-06-04T00:08:00.000Z",
        exportKind: "qa-handoff-locked-archive",
        format: "json",
        contentType: "application/json"
      }))
      .mockResolvedValueOnce(jsonResponse(providerWebhookRetentionManifestResponse()));

    const loaded = await getProviderWebhookReviewQaHandoffLockedArchive({ provider: "line", eventType: "message.created" });
    const exported = await exportProviderWebhookReviewQaHandoffLockedArchive({ provider: "line", eventType: "message.created" });
    const manifest = await getProviderWebhookReviewQaHandoffRetentionManifest({ provider: "line", eventType: "message.created" });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/review-qa-handoff-bundle/locked-archive?provider=line&eventType=message.created", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/review-qa-handoff-bundle/locked-archive/export?provider=line&eventType=message.created", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/review-qa-handoff-bundle/locked-archive/retention-manifest?provider=line&eventType=message.created", expect.any(Object));
    expectTenantHeaderForAll(fetchMock);
    expect(loaded).toMatchObject({ lockedArchiveStatus: "ready", safeFilename: "provider-webhook-review-qa-handoff-locked-archive.json", externalCalls: 0 });
    expect(exported).toMatchObject({ lockedArchiveStatus: "exported", exportKind: "qa-handoff-locked-archive", externalCalls: 0 });
    expect(manifest).toMatchObject({ retentionManifestStatus: "ready", retentionReadiness: "ready", externalCalls: 0 });
    expect(JSON.stringify({ loaded, exported, manifest })).not.toMatch(/"rawPayload"\s*:|"rawSignature"\s*:|"replyToken"\s*:|"senderId"\s*:|"roomId"\s*:|"token"\s*:|"secret"\s*:|"authorization"\s*:|"cookie"\s*:|providerRaw|payloadJson|raw-room|raw-sender/i);
  });

  it("wires archive integrity and retention audit through tenant-scoped API calls without fallback", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(providerWebhookArchiveIntegrityResponse()))
      .mockResolvedValueOnce(jsonResponse(providerWebhookRetentionAuditResponse()));

    const integrity = await getProviderWebhookReviewQaHandoffArchiveIntegrity({ provider: "line", eventType: "message.created" });
    const retentionAudit = await getProviderWebhookReviewQaHandoffRetentionAudit({ provider: "line", eventType: "message.created" });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/review-qa-handoff-bundle/locked-archive/integrity?provider=line&eventType=message.created", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/review-qa-handoff-bundle/locked-archive/retention-audit?provider=line&eventType=message.created", expect.any(Object));
    expectTenantHeaderForAll(fetchMock);
    expect(integrity).toMatchObject({ integrityStatus: "confirmed", digestChainStatus: "confirmed", externalCalls: 0 });
    expect(retentionAudit).toMatchObject({ retentionPolicyStatus: "active", retentionAuditStatus: "confirmed", externalCalls: 0 });
    expect(JSON.stringify({ integrity, retentionAudit })).not.toMatch(/"rawPayload"\s*:|"rawSignature"\s*:|"replyToken"\s*:|"senderId"\s*:|"roomId"\s*:|"token"\s*:|"secret"\s*:|"authorization"\s*:|"cookie"\s*:|providerRaw|payloadJson|raw-room|raw-sender/i);
  });

  it("surfaces archive integrity API errors without local fallback", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "archive integrity unavailable" }, 503));

    await expect(getProviderWebhookReviewQaHandoffArchiveIntegrity()).rejects.toThrow("API request failed (503): archive integrity unavailable");
  });

  it("surfaces retention audit API errors without local fallback", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "retention audit unavailable" }, 503));

    await expect(getProviderWebhookReviewQaHandoffRetentionAudit()).rejects.toThrow("API request failed (503): retention audit unavailable");
  });

  it("wires archive finalization, retention sign-off, and receipt through tenant-scoped API calls without fallback", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(providerWebhookArchiveFinalizationResponse()))
      .mockResolvedValueOnce(jsonResponse(providerWebhookArchiveFinalizationSignOffResponse()))
      .mockResolvedValueOnce(jsonResponse(providerWebhookArchiveFinalizationReceiptResponse()))
      .mockResolvedValueOnce(jsonResponse(providerWebhookArchiveReleaseEvidenceResponse()))
      .mockResolvedValueOnce(jsonResponse(providerWebhookArchiveReleaseVerificationResponse()))
      .mockResolvedValueOnce(jsonResponse(providerWebhookArchiveReleaseCertificationResponse()))
      .mockResolvedValueOnce(jsonResponse(providerWebhookArchiveReleaseClosureLedgerResponse()))
      .mockResolvedValueOnce(jsonResponse(providerWebhookArchiveReleaseAttestationAuditResponse()))
      .mockResolvedValueOnce(jsonResponse(providerWebhookArchiveReleaseAttestationReconciliationResponse()))
      .mockResolvedValueOnce(jsonResponse(providerWebhookArchiveCertifiedReleaseGateResponse()))
      .mockResolvedValueOnce(jsonResponse(providerWebhookArchiveCertifiedReleaseDecisionReceiptResponse()))
      .mockResolvedValueOnce(jsonResponse(providerWebhookArchiveCertifiedReleaseHandoffPacketResponse()))
      .mockResolvedValueOnce(jsonResponse(providerWebhookArchiveCertifiedReleaseHandoffAcceptanceRecordResponse("not_started")))
      .mockResolvedValueOnce(jsonResponse(providerWebhookArchiveCertifiedReleaseHandoffAcceptanceRecordResponse("acknowledged")))
      .mockResolvedValueOnce(jsonResponse(providerWebhookArchiveCertifiedReleaseNoopExecutionDryRunResponse("not_started")))
      .mockResolvedValueOnce(jsonResponse(providerWebhookArchiveCertifiedReleaseNoopExecutionDryRunResponse("passed")))
      .mockResolvedValueOnce(jsonResponse(providerWebhookArchiveCertifiedReleaseDryRunResultLedgerResponse()))
      .mockResolvedValueOnce(jsonResponse(providerWebhookArchiveCertifiedReleaseFinalReadinessCertificateResponse()))
      .mockResolvedValueOnce(jsonResponse(providerWebhookArchiveCertifiedReleaseFreezeAuditRegisterResponse()))
      .mockResolvedValueOnce(jsonResponse(providerWebhookArchiveCertifiedReleaseRollbackRehearsalReceiptResponse()))
      .mockResolvedValueOnce(jsonResponse(providerWebhookArchiveCertifiedReleaseControlRoomPacketResponse()))
      .mockResolvedValueOnce(jsonResponse(providerWebhookArchiveCertifiedReleaseCutoverChecklistReceiptResponse()))
      .mockResolvedValueOnce(jsonResponse(providerWebhookArchiveCertifiedReleaseOperatorCommandReceiptResponse()))
      .mockResolvedValueOnce(jsonResponse(providerWebhookArchiveCertifiedReleaseGoLiveAuthorizationReceiptResponse()));

    const filters = { provider: "line" as const, eventType: "message.created" as const };
    const finalization = await getProviderWebhookReviewQaHandoffArchiveFinalization(filters);
    const signOff = await signOffProviderWebhookReviewQaHandoffArchiveFinalization(filters, {
      reviewerRole: "retention reviewer",
      reviewerLabel: "safe reviewer"
    });
    const receipt = await getProviderWebhookReviewQaHandoffArchiveFinalizationReceipt(filters);
    const releaseEvidence = await getProviderWebhookReviewQaHandoffArchiveReleaseEvidence(filters);
    const releaseVerification = await getProviderWebhookReviewQaHandoffArchiveReleaseVerification(filters);
    const releaseCertification = await getProviderWebhookReviewQaHandoffArchiveReleaseCertification(filters);
    const closureLedger = await getProviderWebhookReviewQaHandoffArchiveReleaseClosureLedger(filters);
    const attestationAudit = await getProviderWebhookReviewQaHandoffArchiveReleaseAttestationAudit(filters);
    const reconciliation = await getProviderWebhookReviewQaHandoffArchiveReleaseAttestationReconciliation(filters);
    const releaseGate = await getProviderWebhookReviewQaHandoffCertifiedReleaseGate(filters);
    const decisionReceipt = await getProviderWebhookReviewQaHandoffCertifiedReleaseDecisionReceipt(filters);
    const handoffPacket = await getProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket(filters);
    const acceptanceRecord = await getProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord(filters);
    const acknowledgedRecord = await acknowledgeProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord(filters, {
      acknowledgementType: "operator_checklist_acknowledgement",
      acknowledgedByRole: "release owner",
      acknowledgedByLabel: "safe release owner",
      acknowledgedChecklistKeys: handoffPacket.operatorChecklist.map((item) => item.key)
    });
    const noopDryRun = await getProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun(filters);
    const executedNoopDryRun = await runProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun(filters, {
      requestedBy: "safe release owner",
      checklistAcknowledged: true,
      operatorNote: "safe no-op dry-run",
      dryRunReason: "safe no-op execution readiness rehearsal",
      executionMode: "no_op"
    });
    const resultLedger = await getProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedger(filters);
    const finalReadinessCertificate = await getProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificate(filters);
    const freezeAuditRegister = await getProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister(filters);
    const rollbackRehearsalReceipt = await getProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt(filters);
    const controlRoomPacket = await getProviderWebhookReviewQaHandoffCertifiedReleaseControlRoomPacket(filters);
    const cutoverChecklistReceipt = await getProviderWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceipt(filters);
    const operatorCommandReceipt = await getProviderWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceipt(filters);
    const goLiveAuthorizationReceipt = await getProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceipt(filters);

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization?provider=line&eventType=message.created", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/sign-off?provider=line&eventType=message.created", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/receipt?provider=line&eventType=message.created", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence?provider=line&eventType=message.created", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification?provider=line&eventType=message.created", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification?provider=line&eventType=message.created", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger?provider=line&eventType=message.created", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit?provider=line&eventType=message.created", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation?provider=line&eventType=message.created", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate?provider=line&eventType=message.created", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt?provider=line&eventType=message.created", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt/handoff-packet?provider=line&eventType=message.created", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt/handoff-packet/acceptance-record?provider=line&eventType=message.created", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt/handoff-packet/acceptance-record?provider=line&eventType=message.created", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt/handoff-packet/acceptance-record/noop-execution-dryrun?provider=line&eventType=message.created", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt/handoff-packet/acceptance-record/noop-execution-dryrun?provider=line&eventType=message.created", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt/handoff-packet/acceptance-record/noop-execution-dryrun/result-ledger?provider=line&eventType=message.created", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt/handoff-packet/acceptance-record/noop-execution-dryrun/result-ledger/final-readiness-certificate?provider=line&eventType=message.created", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt/handoff-packet/acceptance-record/noop-execution-dryrun/result-ledger/final-readiness-certificate/freeze-audit-register?provider=line&eventType=message.created", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt/handoff-packet/acceptance-record/noop-execution-dryrun/result-ledger/final-readiness-certificate/freeze-audit-register/rollback-rehearsal-receipt?provider=line&eventType=message.created", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt/handoff-packet/acceptance-record/noop-execution-dryrun/result-ledger/final-readiness-certificate/freeze-audit-register/rollback-rehearsal-receipt/control-room-packet?provider=line&eventType=message.created", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt/handoff-packet/acceptance-record/noop-execution-dryrun/result-ledger/final-readiness-certificate/freeze-audit-register/rollback-rehearsal-receipt/control-room-packet/cutover-checklist-receipt?provider=line&eventType=message.created", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt/handoff-packet/acceptance-record/noop-execution-dryrun/result-ledger/final-readiness-certificate/freeze-audit-register/rollback-rehearsal-receipt/control-room-packet/cutover-checklist-receipt/operator-command-receipt?provider=line&eventType=message.created", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt/handoff-packet/acceptance-record/noop-execution-dryrun/result-ledger/final-readiness-certificate/freeze-audit-register/rollback-rehearsal-receipt/control-room-packet/cutover-checklist-receipt/operator-command-receipt/go-live-authorization-receipt?provider=line&eventType=message.created", expect.any(Object));
    expect(goLiveAuthorizationReceipt.goLiveAuthorizationReceiptStatus).toBe("issued");
    expect(goLiveAuthorizationReceipt.launchWindowStatus).toBe("ready");
    expect(goLiveAuthorizationReceipt.externalCalls).toBe(0);
    expectTenantHeaderForAll(fetchMock);
    expect(JSON.parse(String((fetchMock.mock.calls[1]?.[1] as RequestInit)?.body))).toMatchObject({
      action: "sign_off",
      reviewerRole: "retention reviewer",
      reviewerLabel: "safe reviewer"
    });
    expect(JSON.parse(String((fetchMock.mock.calls[13]?.[1] as RequestInit)?.body))).toMatchObject({
      acknowledgementType: "operator_checklist_acknowledgement",
      acknowledgedByRole: "release owner",
      acknowledgedByLabel: "safe release owner",
      acknowledgedChecklistKeys: handoffPacket.operatorChecklist.map((item) => item.key)
    });
    expect(JSON.parse(String((fetchMock.mock.calls[15]?.[1] as RequestInit)?.body))).toMatchObject({
      requestedBy: "safe release owner",
      checklistAcknowledged: true,
      executionMode: "no_op"
    });
    expect(finalization).toMatchObject({ finalizationStatus: "ready", retentionSignOffStatus: "not_signed", finalizationReceiptStatus: "not_created", externalCalls: 0 });
    expect(signOff).toMatchObject({ finalizationStatus: "finalized", retentionSignOffStatus: "signed_off", action: "sign_off", externalCalls: 0 });
    expect(receipt).toMatchObject({ receiptKind: "qa-handoff-locked-archive-finalization-receipt", finalizationReceiptStatus: "ready", externalCalls: 0 });
    expect(releaseEvidence).toMatchObject({
      evidenceKind: "qa-handoff-locked-archive-release-evidence-pack",
      releaseReadinessStatus: "ready_for_release",
      prerequisiteChecklist: expect.objectContaining({
        qaHandoffBundleReady: true,
        lockedArchiveExported: true,
        finalizationReceiptReady: true
      }),
      externalCalls: 0
    });
    expect(releaseVerification).toMatchObject({
      verificationKind: "qa-handoff-locked-archive-release-verification-matrix",
      verificationStatus: "verified",
      releaseReadinessStatus: "ready_for_release",
      digestChainStatus: "confirmed",
      releaseEvidenceDigest: releaseEvidence.safeDigest,
      externalCalls: 0
    });
    expect(releaseVerification.digestMatrixRows).toHaveLength(10);
    expect(releaseCertification).toMatchObject({
      certificationKind: "qa-handoff-locked-archive-release-certification-receipt",
      certificationStatus: "certified",
      releaseReadinessStatus: "ready_for_release",
      verificationStatus: "verified",
      digestChainStatus: "confirmed",
      releaseEvidenceDigest: releaseEvidence.safeDigest,
      releaseVerificationDigest: releaseVerification.safeDigest,
      externalCalls: 0
    });
    expect(releaseCertification.digestMatrixSummary.allRowsVerified).toBe(true);
    expect(closureLedger).toMatchObject({
      ledgerKind: "qa-handoff-locked-archive-release-closure-ledger",
      ledgerStatus: "certified_release_closed",
      certificationStatus: "certified",
      releaseReadinessStatus: "ready_for_release",
      verificationStatus: "verified",
      digestChainStatus: "confirmed",
      releaseEvidenceDigest: releaseEvidence.safeDigest,
      releaseVerificationDigest: releaseVerification.safeDigest,
      releaseCertificationDigest: releaseCertification.safeDigest,
      externalCalls: 0
    });
    expect(closureLedger.ledgerRows).toHaveLength(5);
    expect(closureLedger.ledgerSummary.certificationChecklistComplete).toBe(true);
    expect(attestationAudit).toMatchObject({
      attestationKind: "qa-handoff-locked-archive-release-attestation-audit",
      attestationStatus: "complete",
      ledgerStatus: "certified_release_closed",
      certificationStatus: "certified",
      releaseReadinessStatus: "ready_for_release",
      verificationStatus: "verified",
      digestChainStatus: "confirmed",
      closureLedgerDigest: closureLedger.safeDigest,
      externalCalls: 0
    });
    expect(attestationAudit.attestationRows).toHaveLength(7);
    expect(attestationAudit.attestationSummary.externalCallsZero).toBe(true);
    expect(reconciliation).toMatchObject({
      reconciliationKind: "qa-handoff-locked-archive-release-attestation-reconciliation-register",
      reconciliationStatus: "aligned",
      attestationStatus: "complete",
      ledgerStatus: "certified_release_closed",
      certificationStatus: "certified",
      releaseReadinessStatus: "ready_for_release",
      verificationStatus: "verified",
      digestChainStatus: "confirmed",
      attestationAuditDigest: attestationAudit.safeDigest,
      externalCalls: 0
    });
    expect(reconciliation.reconciliationRows).toHaveLength(8);
    expect(reconciliation.exceptionRows).toHaveLength(0);
    expect(reconciliation.reconciliationSummary.externalCallsZero).toBe(true);
    expect(releaseGate).toMatchObject({
      gateKind: "qa-handoff-locked-archive-certified-release-gate",
      gateStatus: "ready",
      goNoGoDecision: "go",
      releaseReadinessStatus: "ready_for_release",
      reconciliationStatus: "aligned",
      attestationStatus: "complete",
      externalCalls: 0
    });
    expect(releaseGate.gateChecklist.externalCallsZero).toBe(true);
    expect(releaseGate.blockingReasons).toHaveLength(0);
    expect(decisionReceipt).toMatchObject({
      receiptKind: "qa-handoff-locked-archive-certified-release-decision-receipt",
      receiptStatus: "issued",
      releaseDecision: "go",
      gateStatus: "ready",
      goNoGoDecision: "go",
      releaseReadinessStatus: "ready_for_release",
      externalCalls: 0
    });
    expect(decisionReceipt.receiptRows).toHaveLength(13);
    expect(decisionReceipt.receiptSummary.externalCallsZero).toBe(true);
    expect(decisionReceipt.inheritedBlockingReasons).toHaveLength(0);
    expect(handoffPacket).toMatchObject({
      packetKind: "qa-handoff-locked-archive-certified-release-handoff-packet",
      packetStatus: "issued",
      handoffStatus: "ready",
      releaseDecision: "go",
      receiptStatus: "issued",
      externalCalls: 0
    });
    expect(handoffPacket.handoffRows).toHaveLength(16);
    expect(handoffPacket.runbookRows.length).toBeGreaterThan(0);
    expect(handoffPacket.operatorChecklist.length).toBeGreaterThan(0);
    expect(handoffPacket.releaseOwnerSummary.externalCallsZero).toBe(true);
    expect(acceptanceRecord).toMatchObject({
      acceptanceKind: "qa-handoff-locked-archive-certified-release-handoff-acceptance-record",
      acceptanceStatus: "not_started",
      handoffStatus: "ready",
      releaseDecision: "go",
      packetStatus: "issued",
      receiptStatus: "issued",
      gateStatus: "ready",
      goNoGoDecision: "go",
      externalCalls: 0
    });
    expect(acceptanceRecord.acknowledgedChecklist).toHaveLength(handoffPacket.operatorChecklist.length);
    expect(acknowledgedRecord).toMatchObject({
      acceptanceStatus: "acknowledged",
      handoffStatus: "ready",
      releaseDecision: "go",
      packetStatus: "issued",
      receiptStatus: "issued",
      gateStatus: "ready",
      goNoGoDecision: "go",
      externalCalls: 0
    });
    expect(acknowledgedRecord.acknowledgedChecklist.every((item) => item.acknowledged)).toBe(true);
    expect(acknowledgedRecord.acknowledgementRows.length).toBeGreaterThan(0);
    expect(acknowledgedRecord.releaseOwnerSummary.operatorChecklistAcknowledged).toBe(true);
    expect(noopDryRun).toMatchObject({
      dryRunKind: "qa-handoff-locked-archive-certified-release-noop-execution-dryrun",
      dryRunStatus: "not_started",
      executionMode: "no_op",
      acceptanceStatus: "acknowledged",
      externalCalls: 0
    });
    expect(executedNoopDryRun).toMatchObject({
      dryRunStatus: "passed",
      executionMode: "no_op",
      acceptanceStatus: "acknowledged",
      handoffStatus: "ready",
      releaseDecision: "go",
      externalCalls: 0
    });
    expect(executedNoopDryRun.executionChecklist.length).toBeGreaterThan(0);
    expect(executedNoopDryRun.dryRunRows.length).toBeGreaterThan(0);
    expect(executedNoopDryRun.executionPlanRows.length).toBeGreaterThan(0);
    expect(resultLedger).toMatchObject({
      ledgerKind: "qa-handoff-locked-archive-certified-release-dryrun-result-ledger",
      ledgerStatus: "recorded",
      dryRunStatus: "passed",
      executionMode: "no_op",
      acceptanceStatus: "acknowledged",
      handoffStatus: "ready",
      releaseDecision: "go",
      packetStatus: "issued",
      receiptStatus: "issued",
      gateStatus: "ready",
      goNoGoDecision: "go",
      externalCalls: 0
    });
    expect(resultLedger.resultLedgerRows.length).toBeGreaterThan(0);
    expect(resultLedger.finalReadinessRows.length).toBeGreaterThan(0);
    expect(resultLedger.counts.dryRunResultLedgerMutationCount).toBe(0);
    expect(finalReadinessCertificate).toMatchObject({
      certificateKind: "qa-handoff-locked-archive-certified-release-final-readiness-certificate",
      certificateStatus: "issued",
      finalReadinessStatus: "ready",
      ledgerStatus: "recorded",
      dryRunStatus: "passed",
      executionMode: "no_op",
      releaseDecision: "go",
      externalCalls: 0
    });
    expect(finalReadinessCertificate.certificateRows.length).toBeGreaterThan(0);
    expect(finalReadinessCertificate.counts.finalReadinessCertificateMutationCount).toBe(0);
    expect(freezeAuditRegister).toMatchObject({
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
    expect(freezeAuditRegister.freezeAuditRows.length).toBeGreaterThan(0);
    expect(freezeAuditRegister.rollbackPlanRows.length).toBeGreaterThan(0);
    expect(freezeAuditRegister.counts.freezeAuditRegisterMutationCount).toBe(0);
    expect(rollbackRehearsalReceipt).toMatchObject({
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
    expect(rollbackRehearsalReceipt.freezeSnapshotRows.length).toBeGreaterThan(0);
    expect(rollbackRehearsalReceipt.rollbackReadinessRows.length).toBeGreaterThan(0);
    expect(rollbackRehearsalReceipt.rollbackRehearsalRows.length).toBeGreaterThan(0);
    expect(rollbackRehearsalReceipt.recoveryReadinessRows.length).toBeGreaterThan(0);
    expect(rollbackRehearsalReceipt.counts.rollbackRehearsalReceiptMutationCount).toBe(0);
    expect(controlRoomPacket).toMatchObject({
      packetKind: "qa-handoff-locked-archive-certified-release-control-room-packet",
      controlRoomStatus: "ready",
      cutoverReadinessStatus: "ready",
      rollbackRehearsalStatus: "verified",
      recoveryReadinessStatus: "ready",
      releaseDecision: "go",
      externalCalls: 0
    });
    expect(controlRoomPacket.controlRoomRows.length).toBeGreaterThan(0);
    expect(controlRoomPacket.cutoverChecklistRows.length).toBeGreaterThan(0);
    expect(controlRoomPacket.operatorHandoffRows.length).toBeGreaterThan(0);
    expect(controlRoomPacket.counts.controlRoomPacketMutationCount).toBe(0);
    expect(cutoverChecklistReceipt).toMatchObject({
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
    expect(cutoverChecklistReceipt.operatorCommandRows.length).toBeGreaterThan(0);
    expect(cutoverChecklistReceipt.safeCutoverChecklistRows.length).toBeGreaterThan(0);
    expect(cutoverChecklistReceipt.counts.cutoverChecklistReceiptMutationCount).toBe(0);
    expect(operatorCommandReceipt).toMatchObject({
      receiptKind: "qa-handoff-locked-archive-certified-release-operator-command-receipt",
      operatorCommandReceiptStatus: "issued",
      goLiveAuthorizationStatus: "ready",
      releaseDecision: "go",
      executionMode: "no_op",
      externalCalls: 0
    });
    expect(operatorCommandReceipt.operatorCommandReceiptDigest).toBe(operatorCommandReceipt.safeDigest);
    expect(operatorCommandReceipt.goLiveAuthorizationRows.length).toBeGreaterThan(0);
    expect(operatorCommandReceipt.operatorCommandReceiptRows.length).toBeGreaterThan(0);
    expect(operatorCommandReceipt.commandHandoffRows.length).toBeGreaterThan(0);
    expect(operatorCommandReceipt.counts.operatorCommandReceiptMutationCount).toBe(0);
    expect(JSON.stringify({ finalization, signOff, receipt, releaseEvidence, releaseVerification, releaseCertification, closureLedger, attestationAudit, reconciliation, releaseGate, decisionReceipt, handoffPacket, acceptanceRecord, acknowledgedRecord, noopDryRun, executedNoopDryRun, resultLedger, finalReadinessCertificate, freezeAuditRegister, rollbackRehearsalReceipt, controlRoomPacket, cutoverChecklistReceipt, operatorCommandReceipt })).not.toMatch(/"rawPayload"\s*:|"rawSignature"\s*:|"replyToken"\s*:|"senderId"\s*:|"roomId"\s*:|"token"\s*:|"secret"\s*:|"authorization"\s*:|"cookie"\s*:|providerRaw|payloadJson|raw-room|raw-sender/i);
  });

  it("surfaces archive finalization API errors without local fallback", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "archive finalization unavailable" }, 503));

    await expect(getProviderWebhookReviewQaHandoffArchiveFinalization()).rejects.toThrow("API request failed (503): archive finalization unavailable");
  });

  it("surfaces retention sign-off API errors without local fallback", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "retention sign-off unavailable" }, 503));

    await expect(signOffProviderWebhookReviewQaHandoffArchiveFinalization()).rejects.toThrow("API request failed (503): retention sign-off unavailable");
  });

  it("surfaces archive release evidence API errors without local fallback", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "release evidence unavailable" }, 503));

    await expect(getProviderWebhookReviewQaHandoffArchiveReleaseEvidence()).rejects.toThrow("API request failed (503): release evidence unavailable");
  });

  it("surfaces archive release verification API errors without local fallback", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "release verification unavailable" }, 503));

    await expect(getProviderWebhookReviewQaHandoffArchiveReleaseVerification()).rejects.toThrow("API request failed (503): release verification unavailable");
  });

  it("surfaces archive release certification API errors without local fallback", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "release certification unavailable" }, 503));

    await expect(getProviderWebhookReviewQaHandoffArchiveReleaseCertification()).rejects.toThrow("API request failed (503): release certification unavailable");
  });

  it("surfaces archive release closure ledger API errors without local fallback", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "release closure ledger unavailable" }, 503));

    await expect(getProviderWebhookReviewQaHandoffArchiveReleaseClosureLedger()).rejects.toThrow("API request failed (503): release closure ledger unavailable");
  });

  it("surfaces archive release attestation audit API errors without local fallback", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "release attestation audit unavailable" }, 503));

    await expect(getProviderWebhookReviewQaHandoffArchiveReleaseAttestationAudit()).rejects.toThrow("API request failed (503): release attestation audit unavailable");
  });

  it("surfaces archive release attestation reconciliation API errors without local fallback", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "release attestation reconciliation unavailable" }, 503));

    await expect(getProviderWebhookReviewQaHandoffArchiveReleaseAttestationReconciliation()).rejects.toThrow("API request failed (503): release attestation reconciliation unavailable");
  });

  it("surfaces certified release gate API errors without local fallback", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "certified release gate unavailable" }, 503));

    await expect(getProviderWebhookReviewQaHandoffCertifiedReleaseGate()).rejects.toThrow("API request failed (503): certified release gate unavailable");
  });

  it("surfaces certified release decision receipt API errors without local fallback", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "certified release decision receipt unavailable" }, 503));

    await expect(getProviderWebhookReviewQaHandoffCertifiedReleaseDecisionReceipt()).rejects.toThrow("API request failed (503): certified release decision receipt unavailable");
  });

  it("surfaces certified release handoff packet API errors without local fallback", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "certified release handoff packet unavailable" }, 503));

    await expect(getProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket()).rejects.toThrow("API request failed (503): certified release handoff packet unavailable");
  });

  it("surfaces certified release handoff acceptance record API errors without local fallback", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "certified release handoff acceptance record unavailable" }, 503));

    await expect(getProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord()).rejects.toThrow("API request failed (503): certified release handoff acceptance record unavailable");
  });

  it("surfaces certified release no-op execution dry-run API errors without local fallback", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "certified release no-op dry-run unavailable" }, 503));

    await expect(getProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun()).rejects.toThrow("API request failed (503): certified release no-op dry-run unavailable");
  });

  it("surfaces certified release dry-run result ledger API errors without local fallback", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "certified release dry-run result ledger unavailable" }, 503));

    await expect(getProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedger()).rejects.toThrow("API request failed (503): certified release dry-run result ledger unavailable");
  });

  it("surfaces certified release final readiness certificate API errors without local fallback", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "certified release final readiness certificate unavailable" }, 503));

    await expect(getProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificate()).rejects.toThrow("API request failed (503): certified release final readiness certificate unavailable");
  });

  it("surfaces certified release freeze audit register API errors without local fallback", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "certified release freeze audit register unavailable" }, 503));

    await expect(getProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister()).rejects.toThrow("API request failed (503): certified release freeze audit register unavailable");
  });

  it("surfaces certified release rollback rehearsal receipt API errors without local fallback", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "certified release rollback rehearsal receipt unavailable" }, 503));

    await expect(getProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt()).rejects.toThrow("API request failed (503): certified release rollback rehearsal receipt unavailable");
  });

  it("surfaces certified release handoff acceptance acknowledgement API errors without local fallback", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "certified release handoff acceptance acknowledgement unavailable" }, 503));

    await expect(acknowledgeProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord({}, {
      acknowledgementType: "operator_checklist_acknowledgement",
      acknowledgedChecklistKeys: ["decision_receipt_issued"]
    })).rejects.toThrow("API request failed (503): certified release handoff acceptance acknowledgement unavailable");
  });

  it("sends x-tenant-id for provider webhook event, unmatched list, and sandbox event create", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse([providerWebhookEventResponse("provider-webhook-event-1")]))
      .mockResolvedValueOnce(jsonResponse(providerWebhookUnmatchedInboundPageResponse([providerWebhookUnmatchedInboundResponse("provider-webhook-unmatched-1")])))
      .mockResolvedValueOnce(jsonResponse(providerWebhookEventResponse("provider-webhook-event-2", "telegram")))
      .mockResolvedValueOnce(jsonResponse({ ...providerWebhookUnmatchedInboundResponse("provider-webhook-unmatched-1"), unmatchedStatus: "reviewed", reviewStatus: "reviewed" }))
      .mockResolvedValueOnce(jsonResponse({ ...providerWebhookUnmatchedInboundResponse("provider-webhook-unmatched-1"), unmatchedStatus: "linked", reviewStatus: "linked", linkStatus: "linked", linkedConversationId: "conversation-safe-internal" }));

    const events = await getProviderWebhookEvents();
    const unmatched = await getProviderWebhookUnmatchedInbound();
    const created = await createProviderWebhookSandboxEvent({
      provider: "telegram",
      channel: "telegram",
      eventType: "webhook.verified",
      mode: "dry_run",
      eventId: "safe-event-id-1",
      timestamp: "2026-05-31T00:00:00.000Z",
      signature: "sha256=sensitive-sample-b",
      payload: {
        updateId: "safe-update",
        token: "sensitive-sample-a"
      }
    });
    const reviewed = await reviewProviderWebhookUnmatchedInbound("provider-webhook-unmatched-1", { status: "reviewed" });
    const linked = await linkProviderWebhookUnmatchedInboundConversation("provider-webhook-unmatched-1", {
      conversationId: "conversation-safe-internal",
      actionMode: "link-only"
    });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/events", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/unmatched-inbound?limit=10&offset=0&sortBy=receivedAt&sortOrder=desc", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/sandbox-events", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/unmatched-inbound/provider-webhook-unmatched-1/review", expect.objectContaining({ method: "PATCH" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/unmatched-inbound/provider-webhook-unmatched-1/link-conversation", expect.objectContaining({ method: "POST" }));
    expect(JSON.parse(String(fetchMock.mock.calls[2]?.[1]?.body))).toMatchObject({
      provider: "telegram",
      channel: "telegram",
      eventType: "webhook.verified",
      mode: "dry_run",
      eventId: "safe-event-id-1",
      signature: "sha256=sensitive-sample-b"
    });
    expect(JSON.parse(String(fetchMock.mock.calls[3]?.[1]?.body))).toEqual({ status: "reviewed" });
    expect(JSON.parse(String(fetchMock.mock.calls[4]?.[1]?.body))).toEqual({
      conversationId: "conversation-safe-internal",
      actionMode: "link-only"
    });
    expectTenantHeaderForAll(fetchMock);
    expect(events[0]?.externalCalls).toBe(0);
    expect(unmatched.items[0]).toMatchObject({
      id: "provider-webhook-unmatched-1",
      tenantId: defaultTenantId,
      conversationLookupStatus: "not-found",
      unmatchedStatus: "review-needed",
      externalCalls: 0
    });
    expect(unmatched.pagination).toMatchObject({ totalCount: 1, limit: 10, offset: 0 });
    expect(created.provider).toBe("telegram");
    expect(reviewed.reviewStatus).toBe("reviewed");
    expect(linked.linkStatus).toBe("linked");
    expect(JSON.stringify({ events, unmatched, created, reviewed, linked })).not.toContain("sensitive-sample-a");
    expect(JSON.stringify({ events, unmatched, created, reviewed, linked })).not.toMatch(/token|secret|authorization|cookie|rawPayload|providerRaw|payloadJson|replyToken/i);
  });

  it("surfaces provider webhook event API errors without local fallback", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "webhook events unavailable" }, 503));

    await expect(getProviderWebhookEvents()).rejects.toThrow("API request failed (503): webhook events unavailable");
  });

  it("surfaces unmatched inbound API errors without local fallback", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "unmatched unavailable" }, 503));

    await expect(getProviderWebhookUnmatchedInbound()).rejects.toThrow("API request failed (503): unmatched unavailable");
  });

  it("sends safe unmatched filters and x-tenant-id for candidate lookup", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(providerWebhookUnmatchedInboundPageResponse([providerWebhookUnmatchedInboundResponse("provider-webhook-unmatched-1")])))
      .mockResolvedValueOnce(jsonResponse([providerWebhookCandidateResponse("conversation-safe-internal")]));

    const unmatched = await getProviderWebhookUnmatchedInbound({
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      limit: 10,
      offset: 20,
      sortBy: "receivedAt",
      sortOrder: "asc"
    });
    const candidates = await getProviderWebhookUnmatchedInboundCandidates("provider-webhook-unmatched-1");

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/unmatched-inbound?provider=line&reviewStatus=pending&linkStatus=none&limit=10&offset=20&sortBy=receivedAt&sortOrder=asc", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/unmatched-inbound/provider-webhook-unmatched-1/candidates", expect.any(Object));
    expectTenantHeaderForAll(fetchMock);
    expect(unmatched.items[0]?.id).toBe("provider-webhook-unmatched-1");
    expect(candidates[0]).toMatchObject({
      conversationId: "conversation-safe-internal",
      platform: "line",
      channelAccountId: "sandbox:line",
      externalCalls: 0
    });
    expect(JSON.stringify(candidates)).not.toMatch(/token|secret|authorization|cookie|rawPayload|providerRaw|payloadJson|replyToken|raw-room|raw-sender/i);
  });

  it("sends x-tenant-id and safe body for bulk unmatched review", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({
        reviewStatus: "reviewed",
        results: [
          {
            id: "provider-webhook-unmatched-1",
            ok: true,
            resultStatus: "updated",
            reviewStatus: "reviewed",
            unmatchedStatus: "reviewed",
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
      }));

    const result = await bulkReviewProviderWebhookUnmatchedInbound({
      ids: ["provider-webhook-unmatched-1"],
      reviewStatus: "reviewed",
      reason: "safe bulk review"
    });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/unmatched-inbound/bulk-review", expect.objectContaining({ method: "PATCH" }));
    expectTenantHeaderForAll(fetchMock);
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toEqual({
      ids: ["provider-webhook-unmatched-1"],
      reviewStatus: "reviewed",
      reason: "safe bulk review"
    });
    expect(result.summary.successCount).toBe(1);
    expect(result.results[0]).toMatchObject({
      id: "provider-webhook-unmatched-1",
      resultStatus: "updated",
      externalCalls: 0
    });
    expect(JSON.stringify(result)).not.toMatch(/token|secret|authorization|cookie|rawPayload|providerRaw|payloadJson|replyToken|raw-room|raw-sender/i);
  });

  it("sends x-tenant-id for unmatched history and queue export with safe filters", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(providerWebhookHistoryResponse("provider-webhook-unmatched-1")))
      .mockResolvedValueOnce(jsonResponse(providerWebhookExportResponse([providerWebhookUnmatchedInboundResponse("provider-webhook-unmatched-1")], "csv")));

    const history = await getProviderWebhookUnmatchedInboundHistory("provider-webhook-unmatched-1");
    const exported = await getProviderWebhookUnmatchedInboundExport({
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      eventType: "message.created",
      receivedAtFrom: "2026-05-31T00:00:00.000Z",
      offset: 10,
      sortBy: "receivedAt",
      sortOrder: "asc",
      format: "csv",
      limit: 25
    });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/unmatched-inbound/provider-webhook-unmatched-1/history", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/unmatched-inbound/export?provider=line&reviewStatus=pending&linkStatus=none&eventType=message.created&receivedAtFrom=2026-05-31T00%3A00%3A00.000Z&offset=10&sortBy=receivedAt&sortOrder=asc&format=csv&limit=25", expect.any(Object));
    expectTenantHeaderForAll(fetchMock);
    expect(history.entries.map((entry) => entry.action)).toEqual(expect.arrayContaining(["inbound_received", "unmatched_queued"]));
    expect(exported).toMatchObject({
      format: "csv",
      exportedCount: 1,
      exportMaxLimit: 500,
      externalCalls: 0
    });
    expect(exported.rows[0]).toMatchObject({
      id: "provider-webhook-unmatched-1",
      channelAccountId: "sandbox:line",
      safeRoomLabel: "line room digest saferoomdige",
      roomKeyDigest: "sha256:saferoomdigest",
      externalCalls: 0
    });
    expect(JSON.stringify({ history, exported })).not.toMatch(/token|secret|authorization|cookie|rawPayload|providerRaw|payloadJson|replyToken|raw-room|raw-sender|raw room|raw sender/i);
  });

  it("sends x-tenant-id and safe filters for review metrics and item diagnostics", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(providerWebhookReviewMetricsResponse()))
      .mockResolvedValueOnce(jsonResponse(providerWebhookDiagnosticsResponse("provider-webhook-unmatched-1")));

    const metrics = await getProviderWebhookReviewMetrics({
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      eventType: "message.created",
      receivedAtFrom: "2026-05-31T00:00:00.000Z",
      receivedAtTo: "2026-06-01T00:00:00.000Z",
      limit: 10,
      offset: 0,
      sortBy: "receivedAt",
      sortOrder: "desc"
    } as Parameters<typeof getProviderWebhookReviewMetrics>[0]);
    const diagnostics = await getProviderWebhookUnmatchedInboundDiagnostics("provider-webhook-unmatched-1");

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/review-metrics?provider=line&reviewStatus=pending&linkStatus=none&unmatchedStatus=review-needed&eventType=message.created&receivedAtFrom=2026-05-31T00%3A00%3A00.000Z&receivedAtTo=2026-06-01T00%3A00%3A00.000Z", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/unmatched-inbound/provider-webhook-unmatched-1/diagnostics", expect.any(Object));
    expectTenantHeaderForAll(fetchMock);
    expect(metrics).toMatchObject({
      totalEvents: 1,
      openUnmatched: 1,
      externalCalls: 0
    });
    expect(metrics.appliedFilters).toMatchObject({
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      eventType: "message.created"
    });
    expect(diagnostics).toMatchObject({
      unmatchedId: "provider-webhook-unmatched-1",
      provider: "line",
      platform: "line",
      channelAccountId: "sandbox:line",
      safeRoomLabel: "line room digest saferoomdige",
      roomKeyDigest: "sha256:saferoomdigest",
      candidateLookupAvailable: true,
      externalCalls: 0
    });
    expect(JSON.stringify({ metrics, diagnostics })).not.toMatch(/token|secret|authorization|cookie|rawPayload|providerRaw|payloadJson|replyToken|raw-room|raw-sender|raw room|raw sender|senderId|roomId/i);
  });

  it("sends x-tenant-id and safe filters for review alerts", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(providerWebhookReviewAlertsResponse()));

    const alerts = await getProviderWebhookReviewAlerts({
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      eventType: "message.created",
      receivedAtFrom: "2026-05-31T00:00:00.000Z",
      receivedAtTo: "2026-06-01T00:00:00.000Z",
      severity: "critical"
    });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/review-alerts?provider=line&reviewStatus=pending&linkStatus=none&unmatchedStatus=review-needed&eventType=message.created&receivedAtFrom=2026-05-31T00%3A00%3A00.000Z&receivedAtTo=2026-06-01T00%3A00%3A00.000Z&severity=critical", expect.any(Object));
    expectTenantHeaderForAll(fetchMock);
    expect(alerts).toMatchObject({
      totalAlerts: 1,
      criticalCount: 1,
      staleOpenCount: 1,
      overSlaCount: 1,
      externalCalls: 0
    });
    expect(alerts.appliedFilters).toMatchObject({
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      eventType: "message.created",
      severity: "critical"
    });
    expect(alerts.alertItems[0]).toMatchObject({
      provider: "line",
      platform: "line",
      channelAccountId: "sandbox:line",
      safeRoomLabel: "line room digest saferoomdige",
      roomKeyDigest: "sha256:saferoomdigest",
      severity: "critical",
      diagnosticsAvailable: true,
      historyAvailable: true,
      externalCalls: 0
    });
    expect(JSON.stringify(alerts)).not.toMatch(/token|secret|authorization|cookie|rawPayload|providerRaw|payloadJson|replyToken|raw-room|raw-sender|raw room|raw sender|senderId|roomId/i);
  });

  it("sends x-tenant-id and safe filters for review triage guidance", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(providerWebhookReviewTriageResponse()));

    const triage = await getProviderWebhookReviewTriage({
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      eventType: "message.created",
      receivedAtFrom: "2026-05-31T00:00:00.000Z",
      receivedAtTo: "2026-06-01T00:00:00.000Z",
      severity: "critical",
      triageLane: "critical_stale_open"
    });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/review-triage?provider=line&reviewStatus=pending&linkStatus=none&unmatchedStatus=review-needed&eventType=message.created&receivedAtFrom=2026-05-31T00%3A00%3A00.000Z&receivedAtTo=2026-06-01T00%3A00%3A00.000Z&severity=critical&triageLane=critical_stale_open", expect.any(Object));
    expectTenantHeaderForAll(fetchMock);
    expect(triage).toMatchObject({
      totalItems: 1,
      totalOpenItems: 1,
      totalTriageLanes: 8,
      externalCalls: 0
    });
    expect(triage.appliedFilters).toMatchObject({
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      eventType: "message.created",
      severity: "critical",
      triageLane: "critical_stale_open"
    });
    expect(triage.lanes[0]).toMatchObject({
      laneKey: "critical_stale_open",
      recommendedNextActions: expect.arrayContaining(["OPEN_DIAGNOSTICS", "VIEW_HISTORY", "APPLY_FILTER", "MARK_REVIEWED", "SKIP"]),
      safeDrilldownFilters: { status: "open" }
    });
    expect(triage.topItems[0]).toMatchObject({
      provider: "line",
      platform: "line",
      channelAccountId: "sandbox:line",
      safeRoomLabel: "line room digest saferoomdige",
      roomKeyDigest: "sha256:saferoomdigest",
      triageLane: "critical_stale_open",
      candidatesAvailable: true,
      diagnosticsAvailable: true,
      historyAvailable: true,
      exportAvailable: true,
      externalCalls: 0
    });
    expect(JSON.stringify(triage)).not.toMatch(/token|secret|authorization|cookie|rawPayload|providerRaw|payloadJson|replyToken|raw-room|raw-sender|raw room|raw sender|senderId|roomId/i);
  });

  it("sends x-tenant-id for assignment, escalation, bulk metadata, and workload filters", async () => {
    const assignedItem = {
      ...providerWebhookUnmatchedInboundResponse("provider-webhook-unmatched-1"),
      assignmentStatus: "assigned",
      assignedToOperatorLabel: "operator:current",
      assignedAt: "2026-05-31T00:10:00.000Z",
      assignedByOperatorLabel: "operator:current"
    };
    const escalatedItem = {
      ...assignedItem,
      escalationStatus: "escalated",
      escalationReason: "SLA_RISK",
      escalatedAt: "2026-05-31T00:11:00.000Z",
      escalatedByOperatorLabel: "operator:current"
    };
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(providerWebhookReviewWorkloadResponse()))
      .mockResolvedValueOnce(jsonResponse(assignedItem))
      .mockResolvedValueOnce(jsonResponse(escalatedItem))
      .mockResolvedValueOnce(jsonResponse(providerWebhookBulkAssignmentResponse("ASSIGN_TO_ME")))
      .mockResolvedValueOnce(jsonResponse(providerWebhookBulkEscalationResponse("ESCALATE")));

    const workload = await getProviderWebhookReviewWorkload({
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      eventType: "message.created",
      assignedTo: "me",
      assignmentStatus: "assigned_to_me",
      escalationStatus: "escalated",
      escalationReason: "SLA_RISK",
      receivedAtFrom: "2026-05-31T00:00:00.000Z",
      receivedAtTo: "2026-06-01T00:00:00.000Z",
      severity: "critical",
      triageLane: "critical_stale_open"
    });
    const assigned = await assignProviderWebhookUnmatchedInbound("provider-webhook-unmatched-1", {
      operation: "ASSIGN_TO_ME",
      note: "safe assignment note"
    });
    const escalated = await escalateProviderWebhookUnmatchedInbound("provider-webhook-unmatched-1", {
      operation: "ESCALATE",
      escalationReason: "SLA_RISK",
      note: "safe escalation note"
    });
    const bulkAssigned = await bulkAssignProviderWebhookUnmatchedInbound({
      ids: ["provider-webhook-unmatched-1"],
      operation: "ASSIGN_TO_ME",
      note: "safe bulk assignment"
    });
    const bulkEscalated = await bulkEscalateProviderWebhookUnmatchedInbound({
      ids: ["provider-webhook-unmatched-1"],
      operation: "ESCALATE",
      escalationReason: "SLA_RISK",
      note: "safe bulk escalation"
    });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/review-workload?provider=line&reviewStatus=pending&linkStatus=none&unmatchedStatus=review-needed&eventType=message.created&assignedTo=me&assignmentStatus=assigned_to_me&escalationStatus=escalated&escalationReason=SLA_RISK&receivedAtFrom=2026-05-31T00%3A00%3A00.000Z&receivedAtTo=2026-06-01T00%3A00%3A00.000Z&severity=critical&triageLane=critical_stale_open", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/unmatched-inbound/provider-webhook-unmatched-1/assignment", expect.objectContaining({ method: "PATCH" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/unmatched-inbound/provider-webhook-unmatched-1/escalation", expect.objectContaining({ method: "PATCH" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/unmatched-inbound/bulk-assignment", expect.objectContaining({ method: "PATCH" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/unmatched-inbound/bulk-escalation", expect.objectContaining({ method: "PATCH" }));
    expectTenantHeaderForAll(fetchMock);
    expect(JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body))).toEqual({
      operation: "ASSIGN_TO_ME",
      note: "safe assignment note"
    });
    expect(JSON.parse(String(fetchMock.mock.calls[2]?.[1]?.body))).toEqual({
      operation: "ESCALATE",
      escalationReason: "SLA_RISK",
      note: "safe escalation note"
    });
    expect(JSON.parse(String(fetchMock.mock.calls[3]?.[1]?.body))).toEqual({
      ids: ["provider-webhook-unmatched-1"],
      operation: "ASSIGN_TO_ME",
      note: "safe bulk assignment"
    });
    expect(JSON.parse(String(fetchMock.mock.calls[4]?.[1]?.body))).toEqual({
      ids: ["provider-webhook-unmatched-1"],
      operation: "ESCALATE",
      escalationReason: "SLA_RISK",
      note: "safe bulk escalation"
    });
    expect(workload).toMatchObject({
      totalItems: 1,
      counts: { assignedToMeOpen: 1, escalatedOpen: 1 },
      externalCalls: 0
    });
    expect(assigned).toMatchObject({
      assignmentStatus: "assigned",
      assignedToOperatorLabel: "operator:current",
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
    expect(JSON.stringify({ workload, assigned, escalated, bulkAssigned, bulkEscalated }))
      .not.toMatch(/token|secret|authorization|cookie|rawPayload|providerRaw|payloadJson|replyToken|raw-room|raw-sender|raw room|raw sender|senderId|roomId/i);
  });

  it("sends x-tenant-id and safe bodies for resolution summary, resolution, checklist, and bulk resolution", async () => {
    const resolvedItem = {
      ...providerWebhookUnmatchedInboundResponse("provider-webhook-unmatched-1"),
      resolutionStatus: "resolved",
      resolutionOutcome: "NEEDS_REVIEW",
      resolvedAt: "2026-05-31T00:09:00.000Z",
      resolvedByOperatorLabel: "operator:current"
    };
    const checkedItem = {
      ...resolvedItem,
      checklistCompletedCount: 2,
      checklistIncompleteSteps: [
        "REVIEWED_TRIAGE_GUIDANCE",
        "REVIEWED_CANDIDATES",
        "CONFIRMED_NO_RAW_LEAKAGE",
        "CONFIRMED_NO_PROVIDER_OUTBOUND",
        "CONFIRMED_ASSIGNMENT_OR_ESCALATION",
        "CONFIRMED_SAFE_LINK_TARGET",
        "CONFIRMED_OPERATOR_NOTE"
      ]
    };
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(providerWebhookReviewResolutionSummaryResponse()))
      .mockResolvedValueOnce(jsonResponse(resolvedItem))
      .mockResolvedValueOnce(jsonResponse(checkedItem))
      .mockResolvedValueOnce(jsonResponse(providerWebhookBulkResolutionResponse("RESET_CHECKLIST")));

    const summary = await getProviderWebhookReviewResolutionSummary({
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      eventType: "message.created",
      assignedTo: "me",
      assignmentStatus: "assigned_to_me",
      escalationStatus: "escalated",
      escalationReason: "SLA_RISK",
      resolutionStatus: "unresolved",
      resolutionOutcome: "NEEDS_REVIEW",
      closureReadiness: "NOT_READY",
      checklistIncomplete: true,
      receivedAtFrom: "2026-05-31T00:00:00.000Z",
      receivedAtTo: "2026-06-01T00:00:00.000Z",
      severity: "critical",
      triageLane: "critical_stale_open"
    });
    const resolved = await resolveProviderWebhookUnmatchedInbound("provider-webhook-unmatched-1", {
      operation: "SET_RESOLUTION",
      resolutionOutcome: "NEEDS_REVIEW",
      note: "safe resolution note"
    });
    const checklist = await updateProviderWebhookUnmatchedInboundChecklist("provider-webhook-unmatched-1", {
      operation: "COMPLETE_STEP",
      step: "VIEWED_DIAGNOSTICS"
    });
    const bulk = await bulkResolveProviderWebhookUnmatchedInbound({
      ids: ["provider-webhook-unmatched-1"],
      operation: "RESET_CHECKLIST",
      note: "safe bulk checklist reset"
    });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/review-resolution-summary?provider=line&reviewStatus=pending&linkStatus=none&unmatchedStatus=review-needed&eventType=message.created&assignedTo=me&assignmentStatus=assigned_to_me&escalationStatus=escalated&escalationReason=SLA_RISK&resolutionStatus=unresolved&resolutionOutcome=NEEDS_REVIEW&closureReadiness=NOT_READY&checklistIncomplete=true&receivedAtFrom=2026-05-31T00%3A00%3A00.000Z&receivedAtTo=2026-06-01T00%3A00%3A00.000Z&severity=critical&triageLane=critical_stale_open", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/unmatched-inbound/provider-webhook-unmatched-1/resolution", expect.objectContaining({ method: "PATCH" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/unmatched-inbound/provider-webhook-unmatched-1/resolution-checklist", expect.objectContaining({ method: "PATCH" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/unmatched-inbound/bulk-resolution", expect.objectContaining({ method: "PATCH" }));
    expectTenantHeaderForAll(fetchMock);
    expect(JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body))).toEqual({
      operation: "SET_RESOLUTION",
      resolutionOutcome: "NEEDS_REVIEW",
      note: "safe resolution note"
    });
    expect(JSON.parse(String(fetchMock.mock.calls[2]?.[1]?.body))).toEqual({
      operation: "COMPLETE_STEP",
      step: "VIEWED_DIAGNOSTICS"
    });
    expect(JSON.parse(String(fetchMock.mock.calls[3]?.[1]?.body))).toEqual({
      ids: ["provider-webhook-unmatched-1"],
      operation: "RESET_CHECKLIST",
      note: "safe bulk checklist reset"
    });
    expect(summary).toMatchObject({
      counts: { unresolvedOpen: 1, checklistIncompleteOpen: 1 },
      appliedFilters: {
        resolutionStatus: "unresolved",
        resolutionOutcome: "NEEDS_REVIEW",
        closureReadiness: "NOT_READY",
        checklistIncomplete: true
      },
      externalCalls: 0
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
    expect(checklist).toMatchObject({
      checklistCompletedCount: 2,
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      messagePersisted: false,
      externalCalls: 0
    });
    expect(bulk.summary.successCount).toBe(1);
    expect(JSON.stringify({ summary, resolved, checklist, bulk }))
      .not.toMatch(/token|secret|authorization|cookie|rawPayload|providerRaw|payloadJson|replyToken|raw-room|raw-sender|raw room|raw sender|senderId|roomId/i);
  });

  it("sends x-tenant-id and safe filters for closure evidence and report", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(providerWebhookReviewClosureReportResponse()))
      .mockResolvedValueOnce(jsonResponse(providerWebhookReviewQaHandoffBundleResponse()))
      .mockResolvedValueOnce(jsonResponse(providerWebhookReviewQaHandoffBundleExportResponse()))
      .mockResolvedValueOnce(jsonResponse(providerWebhookClosureEvidenceResponse("provider-webhook-unmatched-1")))
      .mockResolvedValueOnce(jsonResponse(providerWebhookReviewClosureReportExportResponse()))
      .mockResolvedValueOnce(jsonResponse(providerWebhookClosureEvidenceExportResponse("provider-webhook-unmatched-1")))
      .mockResolvedValueOnce(jsonResponse(providerWebhookReviewExportManifestResponse("closure-report-export")))
      .mockResolvedValueOnce(jsonResponse(providerWebhookReviewExportManifestResponse("closure-evidence-export", "provider-webhook-unmatched-1")))
      .mockResolvedValueOnce(jsonResponse(providerWebhookReviewExportRedactionAuditResponse("closure-report-export")))
      .mockResolvedValueOnce(jsonResponse(providerWebhookReviewExportIntegrityResponse()))
      .mockResolvedValueOnce(jsonResponse(providerWebhookReviewExportRedactionAuditResponse("closure-evidence-export", "provider-webhook-unmatched-1")));

    const closureFilters = {
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      eventType: "message.created",
      assignedTo: "me",
      assignmentStatus: "assigned_to_me",
      escalationStatus: "escalated",
      escalationReason: "SLA_RISK",
      resolutionStatus: "resolved",
      resolutionOutcome: "NEEDS_REVIEW",
      closureReadiness: "READY_FOR_REVIEW",
      checklistIncomplete: false,
      receivedAtFrom: "2026-05-31T00:00:00.000Z",
      receivedAtTo: "2026-06-01T00:00:00.000Z",
      severity: "info",
      triageLane: "safe_link_candidate_available"
    } as const;
    const report = await getProviderWebhookReviewClosureReport(closureFilters);
    const qaBundle = await getProviderWebhookReviewQaHandoffBundle(closureFilters);
    const qaBundleExport = await getProviderWebhookReviewQaHandoffBundleExport(closureFilters);
    const evidence = await getProviderWebhookUnmatchedInboundClosureEvidence("provider-webhook-unmatched-1");
    const reportExport = await getProviderWebhookReviewClosureReportExport(closureFilters);
    const evidenceExport = await getProviderWebhookUnmatchedInboundClosureEvidenceExport("provider-webhook-unmatched-1");
    const reportManifest = await getProviderWebhookReviewClosureReportExportManifest(closureFilters);
    const evidenceManifest = await getProviderWebhookUnmatchedInboundClosureEvidenceExportManifest("provider-webhook-unmatched-1");
    const reportAudit = await getProviderWebhookReviewClosureReportRedactionAudit(closureFilters);
    const integrity = await getProviderWebhookReviewClosureExportIntegrity(closureFilters);
    const evidenceAudit = await getProviderWebhookUnmatchedInboundClosureEvidenceRedactionAudit("provider-webhook-unmatched-1");

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/review-closure-report?provider=line&reviewStatus=pending&linkStatus=none&unmatchedStatus=review-needed&eventType=message.created&assignedTo=me&assignmentStatus=assigned_to_me&escalationStatus=escalated&escalationReason=SLA_RISK&resolutionStatus=resolved&resolutionOutcome=NEEDS_REVIEW&closureReadiness=READY_FOR_REVIEW&checklistIncomplete=false&receivedAtFrom=2026-05-31T00%3A00%3A00.000Z&receivedAtTo=2026-06-01T00%3A00%3A00.000Z&severity=info&triageLane=safe_link_candidate_available", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/review-qa-handoff-bundle?provider=line&reviewStatus=pending&linkStatus=none&unmatchedStatus=review-needed&eventType=message.created&assignedTo=me&assignmentStatus=assigned_to_me&escalationStatus=escalated&escalationReason=SLA_RISK&resolutionStatus=resolved&resolutionOutcome=NEEDS_REVIEW&closureReadiness=READY_FOR_REVIEW&checklistIncomplete=false&receivedAtFrom=2026-05-31T00%3A00%3A00.000Z&receivedAtTo=2026-06-01T00%3A00%3A00.000Z&severity=info&triageLane=safe_link_candidate_available", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/review-qa-handoff-bundle/export?provider=line&reviewStatus=pending&linkStatus=none&unmatchedStatus=review-needed&eventType=message.created&assignedTo=me&assignmentStatus=assigned_to_me&escalationStatus=escalated&escalationReason=SLA_RISK&resolutionStatus=resolved&resolutionOutcome=NEEDS_REVIEW&closureReadiness=READY_FOR_REVIEW&checklistIncomplete=false&receivedAtFrom=2026-05-31T00%3A00%3A00.000Z&receivedAtTo=2026-06-01T00%3A00%3A00.000Z&severity=info&triageLane=safe_link_candidate_available", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/unmatched-inbound/provider-webhook-unmatched-1/closure-evidence", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/review-closure-report/export?provider=line&reviewStatus=pending&linkStatus=none&unmatchedStatus=review-needed&eventType=message.created&assignedTo=me&assignmentStatus=assigned_to_me&escalationStatus=escalated&escalationReason=SLA_RISK&resolutionStatus=resolved&resolutionOutcome=NEEDS_REVIEW&closureReadiness=READY_FOR_REVIEW&checklistIncomplete=false&receivedAtFrom=2026-05-31T00%3A00%3A00.000Z&receivedAtTo=2026-06-01T00%3A00%3A00.000Z&severity=info&triageLane=safe_link_candidate_available", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/unmatched-inbound/provider-webhook-unmatched-1/closure-evidence/export", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/review-closure-report/export/manifest?provider=line&reviewStatus=pending&linkStatus=none&unmatchedStatus=review-needed&eventType=message.created&assignedTo=me&assignmentStatus=assigned_to_me&escalationStatus=escalated&escalationReason=SLA_RISK&resolutionStatus=resolved&resolutionOutcome=NEEDS_REVIEW&closureReadiness=READY_FOR_REVIEW&checklistIncomplete=false&receivedAtFrom=2026-05-31T00%3A00%3A00.000Z&receivedAtTo=2026-06-01T00%3A00%3A00.000Z&severity=info&triageLane=safe_link_candidate_available", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/unmatched-inbound/provider-webhook-unmatched-1/closure-evidence/export/manifest", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/review-closure-report/redaction-audit?provider=line&reviewStatus=pending&linkStatus=none&unmatchedStatus=review-needed&eventType=message.created&assignedTo=me&assignmentStatus=assigned_to_me&escalationStatus=escalated&escalationReason=SLA_RISK&resolutionStatus=resolved&resolutionOutcome=NEEDS_REVIEW&closureReadiness=READY_FOR_REVIEW&checklistIncomplete=false&receivedAtFrom=2026-05-31T00%3A00%3A00.000Z&receivedAtTo=2026-06-01T00%3A00%3A00.000Z&severity=info&triageLane=safe_link_candidate_available", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/review-closure-export-integrity?provider=line&reviewStatus=pending&linkStatus=none&unmatchedStatus=review-needed&eventType=message.created&assignedTo=me&assignmentStatus=assigned_to_me&escalationStatus=escalated&escalationReason=SLA_RISK&resolutionStatus=resolved&resolutionOutcome=NEEDS_REVIEW&closureReadiness=READY_FOR_REVIEW&checklistIncomplete=false&receivedAtFrom=2026-05-31T00%3A00%3A00.000Z&receivedAtTo=2026-06-01T00%3A00%3A00.000Z&severity=info&triageLane=safe_link_candidate_available", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/unmatched-inbound/provider-webhook-unmatched-1/closure-evidence/redaction-audit", expect.any(Object));
    expectTenantHeaderForAll(fetchMock);
    expect(report).toMatchObject({
      totalItems: 1,
      evidenceReadyCount: 1,
      evidenceBlockedCount: 0,
      evidenceIncompleteCount: 0,
      appliedFilters: {
        resolutionStatus: "resolved",
        resolutionOutcome: "NEEDS_REVIEW",
        closureReadiness: "READY_FOR_REVIEW",
        checklistIncomplete: false
      },
      externalCalls: 0
    });
    expect(reportExport).toMatchObject({
      exportKind: "closure-report",
      format: "json",
      totalItems: 1,
      evidenceReadyCount: 1,
      externalCalls: 0
    });
    expect(qaBundle).toMatchObject({
      bundleKind: "provider-webhook-review-qa-handoff-bundle",
      manualQaReadiness: "ready",
      safeFilename: "provider-webhook-review-qa-handoff-bundle.json",
      readiness: {
        reviewExportQaHandoffEnabled: true,
        externalCalls: 0
      },
      closureReportManifest: {
        manifestTarget: "closure-report-export",
        manualQaReadiness: "ready",
        externalCalls: 0
      },
      closureReportRedactionAudit: {
        auditTarget: "closure-report-export",
        status: "passed",
        externalCalls: 0
      },
      closureExportIntegrity: {
        deterministicExportConfirmed: true,
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
    expect(qaBundle.safeDigest).toMatch(/^sha256:/);
    expect(qaBundle.evidenceManifests[0]).toMatchObject({
      unmatchedId: "provider-webhook-unmatched-1",
      safeDigest: expect.stringMatching(/^sha256:/),
      externalCalls: 0
    });
    expect(qaBundleExport).toMatchObject({
      exportKind: "qa-handoff-bundle",
      format: "json",
      contentType: "application/json",
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
        rawPayloadAbsent: true,
        tokenAbsent: true,
        replyTokenAbsent: true,
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
    expect(qaBundleExport.safeDigest).toMatch(/^sha256:/);
    expect(evidenceExport).toMatchObject({
      exportKind: "closure-evidence",
      format: "json",
      unmatchedId: "provider-webhook-unmatched-1",
      evidenceStatus: "ready",
      externalCalls: 0
    });
    expect(evidence).toMatchObject({
      unmatchedId: "provider-webhook-unmatched-1",
      evidenceStatus: "ready",
      evidenceFlags: {
        noProviderOutboundConfirmed: true,
        noRawLeakageConfirmed: true,
        safeLinkTargetConfirmed: true
      },
      externalCalls: 0
    });
    expect(reportManifest).toMatchObject({
      manifestTarget: "closure-report-export",
      manualQaReadiness: "ready",
      safeFilename: "provider-webhook-review-closure-report.json",
      externalCalls: 0
    });
    expect(evidenceManifest).toMatchObject({
      manifestTarget: "closure-evidence-export",
      unmatchedId: "provider-webhook-unmatched-1",
      manualQaReadiness: "ready",
      externalCalls: 0
    });
    expect(reportAudit).toMatchObject({
      auditTarget: "closure-report-export",
      status: "passed",
      checks: { rawPayloadAbsent: true, tokenAbsent: true, replyTokenAbsent: true },
      externalCalls: 0
    });
    expect(integrity).toMatchObject({
      totalCheckedItems: 1,
      redactionPassedCount: 1,
      redactionWarningCount: 0,
      redactionBlockedCount: 0,
      deterministicExportConfirmed: true,
      externalCalls: 0
    });
    expect(evidenceAudit).toMatchObject({
      auditTarget: "closure-evidence-export",
      unmatchedId: "provider-webhook-unmatched-1",
      status: "passed",
      externalCalls: 0
    });
    expect(JSON.stringify({ report, qaBundle, qaBundleExport, evidence, reportExport, evidenceExport, reportManifest, evidenceManifest, reportAudit, integrity, evidenceAudit }))
      .not.toMatch(/providerRaw|payloadJson|raw-room|raw-sender|raw room|raw sender|accessToken|webhookSecret|bearer/i);
  });

  it("sends x-tenant-id and safe body for QA handoff receipt sign-off", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(providerWebhookReviewQaHandoffReceiptResponse()))
      .mockResolvedValueOnce(jsonResponse(providerWebhookReviewQaHandoffSignOffResponse()));
    const filters = { provider: "line", resolutionStatus: "resolved", resolutionOutcome: "NEEDS_REVIEW" } as const;

    const receipt = await getProviderWebhookReviewQaHandoffBundleReceipt(filters);
    const signOff = await signOffProviderWebhookReviewQaHandoffBundleReceipt(filters, {
      acknowledgementType: "sign_off",
      reviewerRole: "QA reviewer",
      reviewerLabel: "safe reviewer"
    });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/review-qa-handoff-bundle/receipt?provider=line&resolutionStatus=resolved&resolutionOutcome=NEEDS_REVIEW", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/review-qa-handoff-bundle/receipt/sign-off?provider=line&resolutionStatus=resolved&resolutionOutcome=NEEDS_REVIEW", expect.objectContaining({
      method: "POST",
      body: JSON.stringify({
        acknowledgementType: "sign_off",
        reviewerRole: "QA reviewer",
        reviewerLabel: "safe reviewer"
      })
    }));
    expectTenantHeaderForAll(fetchMock);
    expect(receipt).toMatchObject({
      receiptStatus: "not_acknowledged",
      safeFilename: "provider-webhook-review-qa-handoff-receipt.json",
      externalCalls: 0
    });
    expect(signOff).toMatchObject({
      signOffStatus: "signed_off",
      action: "sign_off",
      reviewerRole: "QA reviewer",
      reviewerLabel: "safe reviewer",
      externalCalls: 0
    });
    expect(JSON.stringify({ receipt, signOff })).not.toMatch(/"rawPayload"\s*:|"rawSignature"\s*:|"replyToken"\s*:|"senderId"\s*:|"roomId"\s*:|"token"\s*:|"secret"\s*:|"authorization"\s*:|"cookie"\s*:/i);
  });

  it("sends x-tenant-id and safe bodies for review saved views and operator notes", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse([providerWebhookReviewSavedViewResponse("provider-webhook-review-view-1")]))
      .mockResolvedValueOnce(jsonResponse(providerWebhookReviewSavedViewResponse("provider-webhook-review-view-2")))
      .mockResolvedValueOnce(jsonResponse({ ...providerWebhookReviewSavedViewResponse("provider-webhook-review-view-2"), name: "Updated safe view" }))
      .mockResolvedValueOnce(jsonResponse({ ...providerWebhookReviewSavedViewResponse("provider-webhook-review-view-2"), archived: true, isDefault: false }))
      .mockResolvedValueOnce(jsonResponse([providerWebhookOperatorNoteResponse("provider-webhook-operator-note-1")]))
      .mockResolvedValueOnce(jsonResponse(providerWebhookOperatorNoteResponse("provider-webhook-operator-note-2")));

    const savedViews = await getProviderWebhookReviewSavedViews();
    const createdView = await createProviderWebhookReviewSavedView({
      name: "Safe queue view",
      description: "safe filter preset",
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
        receivedAtFrom: "2026-05-31T00:00:00.000Z",
        pageSize: 10
      },
      sort: {
        sortBy: "receivedAt",
        sortDirection: "desc"
      },
      pinned: true,
      isDefault: true
    });
    const updatedView = await updateProviderWebhookReviewSavedView("provider-webhook-review-view-2", {
      name: "Updated safe view",
      filters: {
        provider: "line",
        pageSize: 25
      },
      sort: {
        sortBy: "receivedAt",
        sortDirection: "asc"
      }
    });
    const archivedView = await archiveProviderWebhookReviewSavedView("provider-webhook-review-view-2");
    const notes = await getProviderWebhookOperatorNotes("provider-webhook-unmatched-1");
    const createdNote = await createProviderWebhookOperatorNote("provider-webhook-unmatched-1", {
      note: "Checked safely with local context only."
    });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/review-saved-views", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/review-saved-views", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/review-saved-views/provider-webhook-review-view-2", expect.objectContaining({ method: "PATCH" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/review-saved-views/provider-webhook-review-view-2/archive", expect.objectContaining({ method: "PATCH" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/unmatched-inbound/provider-webhook-unmatched-1/operator-notes", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/provider-webhooks/unmatched-inbound/provider-webhook-unmatched-1/operator-notes", expect.objectContaining({ method: "POST" }));
    expectTenantHeaderForAll(fetchMock);
    expect(JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body))).toEqual({
      name: "Safe queue view",
      description: "safe filter preset",
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
        receivedAtFrom: "2026-05-31T00:00:00.000Z",
        pageSize: 10
      },
      sort: {
        sortBy: "receivedAt",
        sortDirection: "desc"
      },
      pinned: true,
      isDefault: true
    });
    expect(JSON.parse(String(fetchMock.mock.calls[2]?.[1]?.body))).toMatchObject({
      name: "Updated safe view",
      filters: { provider: "line", pageSize: 25 },
      sort: { sortBy: "receivedAt", sortDirection: "asc" }
    });
    expect(JSON.parse(String(fetchMock.mock.calls[5]?.[1]?.body))).toEqual({
      note: "Checked safely with local context only."
    });
    expect(savedViews[0]?.externalCalls).toBe(0);
    expect(createdView.filters).toMatchObject({ provider: "line", pageSize: 10 });
    expect(updatedView.name).toBe("Updated safe view");
    expect(archivedView.archived).toBe(true);
    expect(notes[0]).toMatchObject({ unmatchedId: "provider-webhook-unmatched-1", externalCalls: 0 });
    expect(createdNote.note).toBe("Checked safely with local context only.");
    expect(JSON.stringify({ savedViews, createdView, updatedView, archivedView, notes, createdNote })).not.toMatch(/token|secret|authorization|cookie|rawPayload|providerRaw|payloadJson|replyToken|raw-room|raw-sender|raw room|raw sender|senderId|roomId/i);
  });

  it("surfaces unmatched history and export API errors without local fallback", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "history unavailable" }, 503));
    await expect(getProviderWebhookUnmatchedInboundHistory("provider-webhook-unmatched-1"))
      .rejects.toThrow("API request failed (503): history unavailable");

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "export unavailable" }, 503));
    await expect(getProviderWebhookUnmatchedInboundExport({ format: "json" }))
      .rejects.toThrow("API request failed (503): export unavailable");

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "closure evidence export unavailable" }, 503));
    await expect(getProviderWebhookUnmatchedInboundClosureEvidenceExport("provider-webhook-unmatched-1"))
      .rejects.toThrow("API request failed (503): closure evidence export unavailable");

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "closure report export unavailable" }, 503));
    await expect(getProviderWebhookReviewClosureReportExport({ provider: "line" }))
      .rejects.toThrow("API request failed (503): closure report export unavailable");

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "closure evidence manifest unavailable" }, 503));
    await expect(getProviderWebhookUnmatchedInboundClosureEvidenceExportManifest("provider-webhook-unmatched-1"))
      .rejects.toThrow("API request failed (503): closure evidence manifest unavailable");

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "closure report manifest unavailable" }, 503));
    await expect(getProviderWebhookReviewClosureReportExportManifest({ provider: "line" }))
      .rejects.toThrow("API request failed (503): closure report manifest unavailable");

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "qa handoff unavailable" }, 503));
    await expect(getProviderWebhookReviewQaHandoffBundle({ provider: "line" }))
      .rejects.toThrow("API request failed (503): qa handoff unavailable");

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "qa handoff export unavailable" }, 503));
    await expect(getProviderWebhookReviewQaHandoffBundleExport({ provider: "line" }))
      .rejects.toThrow("API request failed (503): qa handoff export unavailable");

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "closure report audit unavailable" }, 503));
    await expect(getProviderWebhookReviewClosureReportRedactionAudit({ provider: "line" }))
      .rejects.toThrow("API request failed (503): closure report audit unavailable");

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "closure export integrity unavailable" }, 503));
    await expect(getProviderWebhookReviewClosureExportIntegrity({ provider: "line" }))
      .rejects.toThrow("API request failed (503): closure export integrity unavailable");

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "closure evidence audit unavailable" }, 503));
    await expect(getProviderWebhookUnmatchedInboundClosureEvidenceRedactionAudit("provider-webhook-unmatched-1"))
      .rejects.toThrow("API request failed (503): closure evidence audit unavailable");
  });

  it("surfaces review metrics and diagnostics API errors without local fallback", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "metrics unavailable" }, 503));
    await expect(getProviderWebhookReviewMetrics({ provider: "line" }))
      .rejects.toThrow("API request failed (503): metrics unavailable");

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "alerts unavailable" }, 503));
    await expect(getProviderWebhookReviewAlerts({ provider: "line" }))
      .rejects.toThrow("API request failed (503): alerts unavailable");

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "triage unavailable" }, 503));
    await expect(getProviderWebhookReviewTriage({ provider: "line" }))
      .rejects.toThrow("API request failed (503): triage unavailable");

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "workload unavailable" }, 503));
    await expect(getProviderWebhookReviewWorkload({ provider: "line" }))
      .rejects.toThrow("API request failed (503): workload unavailable");

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "diagnostics unavailable" }, 503));
    await expect(getProviderWebhookUnmatchedInboundDiagnostics("provider-webhook-unmatched-1"))
      .rejects.toThrow("API request failed (503): diagnostics unavailable");

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "assignment unavailable" }, 503));
    await expect(assignProviderWebhookUnmatchedInbound("provider-webhook-unmatched-1", { operation: "ASSIGN_TO_ME" }))
      .rejects.toThrow("API request failed (503): assignment unavailable");

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "escalation unavailable" }, 503));
    await expect(escalateProviderWebhookUnmatchedInbound("provider-webhook-unmatched-1", { operation: "ESCALATE", escalationReason: "SLA_RISK" }))
      .rejects.toThrow("API request failed (503): escalation unavailable");

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "saved views unavailable" }, 503));
    await expect(getProviderWebhookReviewSavedViews())
      .rejects.toThrow("API request failed (503): saved views unavailable");

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "operator notes unavailable" }, 503));
    await expect(getProviderWebhookOperatorNotes("provider-webhook-unmatched-1"))
      .rejects.toThrow("API request failed (503): operator notes unavailable");
  });


  it("validates conversations and keeps room filters explicit", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse([
      {
        id: "conv-web",
        roomId: "room-webchat",
        tab: "human",
        platform: "webchat",
        platformLabel: "Webchat",
        channelAccountId: "00000000-0000-4000-8000-000000000020",
        accountName: "Main Website",
        customerName: "Visitor Demo",
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
      }
    ]));

    const conversations = await getConversations("room-webchat", { tab: "human", filter: "need_human", search: "hello" });

    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("/rooms/room-webchat/conversations?tab=human&filter=need_human&search=hello");
    expectTenantHeaderForAll(fetchMock);
    expect(conversations[0]?.roomId).toBe("room-webchat");
  });

  it("serializes API-mode inbox search filters and pagination with the tenant header", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse([
      conversationResponse("conv-web")
    ]));

    await getConversations("room-webchat", {
      tab: "human",
      filter: "all",
      search: "pricing question",
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      status: "open",
      priority: "high",
      unread: "unread",
      slaStatus: "warning",
      sort: "updated_desc",
      limit: 25,
      offset: 50
    });

    const url = new URL(String(fetchMock.mock.calls[0]?.[0]));
    expect(url.pathname).toBe("/rooms/room-webchat/conversations");
    expect(url.searchParams.get("tab")).toBe("human");
    expect(url.searchParams.get("filter")).toBe("all");
    expect(url.searchParams.get("search")).toBe("pricing question");
    expect(url.searchParams.get("platform")).toBe("webchat");
    expect(url.searchParams.get("channelAccountId")).toBe("00000000-0000-4000-8000-000000000020");
    expect(url.searchParams.get("status")).toBe("open");
    expect(url.searchParams.get("priority")).toBe("high");
    expect(url.searchParams.get("unread")).toBe("true");
    expect(url.searchParams.get("slaStatus")).toBe("warning");
    expect(url.searchParams.get("sort")).toBe("updated_desc");
    expect(url.searchParams.get("limit")).toBe("25");
    expect(url.searchParams.get("offset")).toBe("50");
    expectTenantHeaderForAll(fetchMock);
  });

  it("surfaces inbox search API failures instead of returning mock conversations", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "search unavailable" }, 503));

    await expect(getConversations("room-webchat", { search: "impossible" }))
      .rejects.toThrow("API request failed (503): search unavailable");
  });

  it("creates sent_mock agent replies through the API", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({
      id: "msg-agent",
      conversationId: "conv-web",
      direction: "outbound",
      senderType: "agent",
      text: "รับเรื่องแล้วครับ",
      createdAt: "2026-05-21T04:01:00.000Z",
      platformMessageId: "internal-1",
      deliveryStatus: "queued_mock"
    }));

    const message = await sendAgentMessage("conv-web", "รับเรื่องแล้วครับ");

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/conv-web/messages", expect.objectContaining({ method: "POST" }));
    const init = fetchMock.mock.calls[0]?.[1];
    expect(init?.headers).toEqual(expect.objectContaining({ "x-tenant-id": defaultTenantId }));
    expect(JSON.parse(String(init?.body))).toEqual({ text: "รับเรื่องแล้วครับ", senderType: "agent" });
    expect(message.deliveryStatus).toBe("queued_mock");
    expectTenantHeaderForAll(fetchMock);
  });

  it("fetches Customer 360 data for API mode without using mock fallback", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse(customer360Response("conv-web", "contact-api")));

    const customer360 = await getCustomer360("conv-web");

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/conv-web/customer-360", expect.any(Object));
    expectTenantHeaderForAll(fetchMock);
    expect(customer360.contact.id).toBe("contact-api");
    expect(customer360.identities[0]?.externalUserId).toBe("visitor-api");
    expect(customer360.recentConversations[0]).toMatchObject({
      tenantId: defaultTenantId,
      id: "conv-web",
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      roomId: "room-webchat"
    });
    expect(customer360.notes[0]).toMatchObject({
      tenantId: defaultTenantId,
      conversationId: "conv-web",
      contactId: "contact-api",
      customerId: "contact-api",
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      roomId: "room-webchat",
      externalCalls: 0
    });
    expect(customer360.tasks[0]).toMatchObject({
      conversationId: "conv-web",
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      roomId: "room-webchat",
      externalCalls: 0
    });
    expect(customer360.broadcastHistorySummary.rows[0]).toMatchObject({
      campaignName: "Persisted campaign",
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      roomId: "room-webchat",
      externalCalls: 0
    });
    expect(JSON.stringify(customer360.broadcastHistorySummary)).not.toMatch(/accessToken|webhookSecret|botToken|apiKey|Bearer|sk-/i);
  });

  it("surfaces Customer 360 API errors instead of silently returning mock data", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "Conversation not found" }, 404));

    await expect(getCustomer360("missing")).rejects.toThrow("API request failed (404): Conversation not found");
  });

  it("sends x-tenant-id for Customer 360 profile and tag update calls", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({
      ...customer360Response("conv-web", "contact-api"),
      contact: {
        ...contactResponse("contact-api"),
        leadStatus: "qualified",
        tags: ["vip"]
      },
      identities: contactResponse("contact-api").identities
    }));

    const customer360 = await updateCustomer360Profile("conv-web", {
      contactId: "contact-api",
      leadStatus: "qualified",
      tags: ["vip"]
    });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/conv-web/customer-360", expect.objectContaining({ method: "PATCH" }));
    const init = fetchMock.mock.calls[0]?.[1];
    expect(init?.headers).toEqual(expect.objectContaining({ "x-tenant-id": defaultTenantId }));
    expect(JSON.parse(String(init?.body))).toEqual({
      contactId: "contact-api",
      leadStatus: "qualified",
      tags: ["vip"]
    });
    expect(customer360.contact.leadStatus).toBe("qualified");
    expect(customer360.contact.tags).toEqual(["vip"]);
    expectTenantHeaderForAll(fetchMock);
  });

  it("does not fake Customer 360 profile state when the API update fails", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "Profile unavailable" }, 503));

    await expect(updateCustomer360Profile("conv-web", {
      contactId: "contact-api",
      tags: ["vip"]
    })).rejects.toThrow("API request failed (503): Profile unavailable");

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("sends x-tenant-id for Customer 360 consent update calls", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({
      ...customer360Response("conv-web", "contact-api"),
      contact: {
        ...contactResponse("contact-api"),
        optOutBroadcast: true,
        suppressedReason: "customer_requested"
      },
      broadcastHistorySummary: {
        ...customer360Response("conv-web", "contact-api").broadcastHistorySummary,
        optOut: true,
        suppressedReason: "customer_requested"
      }
    }));

    const customer360 = await updateCustomer360Consent("conv-web", {
      contactId: "contact-api",
      optOut: true
    });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/conv-web/customer-360/consent", expect.objectContaining({ method: "PATCH" }));
    const init = fetchMock.mock.calls[0]?.[1];
    expect(init?.headers).toEqual(expect.objectContaining({ "x-tenant-id": defaultTenantId }));
    expect(JSON.parse(String(init?.body))).toEqual({
      contactId: "contact-api",
      optOut: true
    });
    expect(customer360.contact.optOutBroadcast).toBe(true);
    expect(customer360.broadcastHistorySummary.optOut).toBe(true);
    expectTenantHeaderForAll(fetchMock);
  });

  it("does not fake Customer 360 consent state when the API update fails", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "Consent unavailable" }, 503));

    await expect(updateCustomer360Consent("conv-web", {
      contactId: "contact-api",
      optOut: true
    })).rejects.toThrow("API request failed (503): Consent unavailable");

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("refetches Customer 360 per selected conversation id", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(customer360Response("conv-web", "contact-web")))
      .mockResolvedValueOnce(jsonResponse(customer360Response("conv-telegram", "contact-telegram")));

    await getCustomer360("conv-web");
    await getCustomer360("conv-telegram");

    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("/conversations/conv-web/customer-360");
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain("/conversations/conv-telegram/customer-360");
    expectTenantHeaderForAll(fetchMock);
  });

  it("posts contact create, update, and identity requests to API endpoints", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(contactResponse("contact-created")))
      .mockResolvedValueOnce(jsonResponse({ ...contactResponse("contact-created"), displayName: "Updated API Contact" }))
      .mockResolvedValueOnce(jsonResponse(contactResponse("contact-created", "identity-linked")))
      .mockResolvedValueOnce(jsonResponse(contactResponse("contact-created", "identity-linked")))
      .mockResolvedValueOnce(jsonResponse(contactResponse("contact-created")));

    const created = await createContact({ displayName: "API Contact", leadStatus: "new", tags: [] });
    const updated = await updateContact("contact-created", { displayName: "Updated API Contact" });
    const linked = await linkContactIdentity("contact-created", {
      platform: "telegram",
      channelAccountId: "00000000-0000-4000-8000-000000000021",
      externalUserId: "tg-api-user",
      displayName: "TG API User"
    });
    const primary = await setPrimaryContactIdentity("contact-created", { identityId: "identity-linked" });
    const unlinked = await unlinkContactIdentity("contact-created", { identityId: "identity-linked" });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/contacts", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/contacts/contact-created", expect.objectContaining({ method: "PATCH" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/contacts/contact-created/identities/link", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/contacts/contact-created/primary-identity", expect.objectContaining({ method: "PATCH" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/contacts/contact-created/identities/unlink", expect.objectContaining({ method: "POST" }));
    expect(JSON.parse(String(fetchMock.mock.calls[2]?.[1]?.body))).toEqual({
      platform: "telegram",
      channelAccountId: "00000000-0000-4000-8000-000000000021",
      externalUserId: "tg-api-user",
      displayName: "TG API User",
      isPrimary: false
    });
    expect(JSON.parse(String(fetchMock.mock.calls[3]?.[1]?.body))).toEqual({ identityId: "identity-linked" });
    expect(JSON.parse(String(fetchMock.mock.calls[4]?.[1]?.body))).toEqual({ identityId: "identity-linked" });
    expectTenantHeaderForAll(fetchMock);
    expect(created.id).toBe("contact-created");
    expect(updated.displayName).toBe("Updated API Contact");
    expect(linked.identities[0]?.id).toBe("identity-linked");
    expect(primary.id).toBe("contact-created");
    expect(unlinked.id).toBe("contact-created");
  });

  it("sends tenant-scoped broadcast opt-out updates to the API", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ ...contactResponse("contact-api"), optOutBroadcast: true, suppressedReason: "customer_requested" }));

    const contact = await updateBroadcastConsent("contact-api", { optOut: true, conversationId: "conv-web" });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/contacts/contact-api/broadcast-consent", expect.objectContaining({ method: "PATCH" }));
    const init = fetchMock.mock.calls[0]?.[1];
    expect(init?.headers).toEqual(expect.objectContaining({ "x-tenant-id": defaultTenantId }));
    expect(JSON.parse(String(init?.body))).toEqual({ optOut: true, conversationId: "conv-web" });
    expect(contact.optOutBroadcast).toBe(true);
    expectTenantHeaderForAll(fetchMock);
  });

  it("does not fake local opt-out state when broadcast consent API fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "Consent unavailable" }, 503));

    await expect(updateBroadcastConsent("contact-api", { optOut: true, conversationId: "conv-web" })).rejects.toThrow("API request failed (503): Consent unavailable");
  });

  it("gets contact directory endpoints with the tenant header", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse([contactResponse("contact-api")]))
      .mockResolvedValueOnce(jsonResponse(contactResponse("contact-api", "identity-detail")))
      .mockResolvedValueOnce(jsonResponse(contactResponse("contact-api", "identity-detail").identities))
      .mockResolvedValueOnce(jsonResponse([conversationResponse("conv-web")]));

    const contacts = await getContacts();
    const contact = await getContact("contact-api");
    const identities = await getContactIdentities("contact-api");
    const conversations = await getContactConversations("contact-api");

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/contacts", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/contacts/contact-api", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/contacts/contact-api/identities", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/contacts/contact-api/conversations", expect.any(Object));
    expectTenantHeaderForAll(fetchMock);
    expect(contacts[0]?.id).toBe("contact-api");
    expect(contact.identities[0]?.id).toBe("identity-detail");
    expect(identities[0]?.externalUserId).toBe("visitor-api");
    expect(conversations[0]).toMatchObject({
      roomId: "room-webchat",
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020"
    });
  });

  it("sends tenant headers for settings channels and team requests", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse([settingsChannelResponse("channel-web")]))
      .mockResolvedValueOnce(jsonResponse(settingsChannelResponse("channel-web")))
      .mockResolvedValueOnce(jsonResponse({ ...settingsChannelResponse("channel-web"), accountName: "Updated Website" }))
      .mockResolvedValueOnce(jsonResponse([settingsTeamResponse("agent-may")]))
      .mockResolvedValueOnce(jsonResponse(settingsTeamResponse("agent-may")))
      .mockResolvedValueOnce(jsonResponse({ ...settingsTeamResponse("agent-may"), name: "Updated May", displayName: "Updated May" }));

    const channels = await getSettingsChannels();
    const channel = await getSettingsChannel("channel-web");
    const updatedChannel = await updateSettingsChannel("channel-web", { accountName: "Updated Website" });
    const team = await getSettingsTeam();
    const member = await getSettingsTeamMember("agent-may");
    const updatedMember = await updateSettingsTeamMember("agent-may", { name: "Updated May", role: "supervisor" });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/settings/channels", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/settings/channels/channel-web", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/settings/channels/channel-web", expect.objectContaining({ method: "PATCH" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/settings/team", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/settings/team/agent-may", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/settings/team/agent-may", expect.objectContaining({ method: "PATCH" }));
    expectTenantHeaderForAll(fetchMock);
    expect(channels[0]?.id).toBe("channel-web");
    expect(channel.tokenMasked).toBe("configured:redacted");
    expect(updatedChannel.accountName).toBe("Updated Website");
    expect(team[0]?.id).toBe("agent-may");
    expect(member.email).toBe("may@example.local");
    expect(updatedMember.role).toBe("agent");
  });

  it("sends tenant headers for settings SLA policy requests", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse([settingsSlaPolicyResponse("sla-api")]))
      .mockResolvedValueOnce(jsonResponse(settingsSlaPolicyResponse("sla-api")))
      .mockResolvedValueOnce(jsonResponse({ ...settingsSlaPolicyResponse("sla-api"), firstResponseMinutes: 7 }));

    const policies = await getSettingsSlaPolicies();
    const policy = await getSettingsSlaPolicy("sla-api");
    const updated = await updateSettingsSlaPolicy("sla-api", { firstResponseMinutes: 7 });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/settings/sla-policies", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/settings/sla-policies/sla-api", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/settings/sla-policies/sla-api", expect.objectContaining({ method: "PATCH" }));
    expectTenantHeaderForAll(fetchMock);
    expect(policies[0]?.id).toBe("sla-api");
    expect(policy.priorityScope).toBe("urgent");
    expect(updated.firstResponseMinutes).toBe(7);
  });

  it("sends tenant headers for settings canned reply requests", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse([settingsCannedReplyResponse("reply-api")]))
      .mockResolvedValueOnce(jsonResponse(settingsCannedReplyResponse("reply-api")))
      .mockResolvedValueOnce(jsonResponse({ ...settingsCannedReplyResponse("reply-api"), bodyTemplate: "Updated persisted hello" }));

    const replies = await getSettingsCannedReplies();
    const reply = await getSettingsCannedReply("reply-api");
    const updated = await updateSettingsCannedReply("reply-api", { bodyTemplate: "Updated persisted hello" });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/settings/canned-replies", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/settings/canned-replies/reply-api", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/settings/canned-replies/reply-api", expect.objectContaining({ method: "PATCH" }));
    expectTenantHeaderForAll(fetchMock);
    expect(replies[0]?.shortcut).toBe("/hello");
    expect(reply.bodyTemplate).toBe("Persisted hello");
    expect(updated.bodyTemplate).toBe("Updated persisted hello");
  });

  it("posts Webchat inbound payloads to the webchat webhook endpoint", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({
      accepted: true,
      conversationId: "conv-web",
      messageId: "webchat-msg-1",
      duplicate: false
    }));

    const result = await createWebchatMessage({
      channelAccountId: "demo-webchat",
      visitorId: "visitor-demo",
      sessionId: "webchat-demo-session",
      messageId: "webchat-msg-1",
      text: "hello"
    });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/webhooks/webchat/demo-webchat", expect.objectContaining({ method: "POST" }));
    expectTenantHeaderForAll(fetchMock);
    expect(result.conversationId).toBe("conv-web");
  });

  it("persists internal notes and tasks through workflow API endpoints", async () => {
    const assigneeUserId = "00000000-0000-4000-8000-000000000011";
    const dueAt = "2026-05-22T04:00:00.000Z";
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse([internalNoteResponse("note-api")]))
      .mockResolvedValueOnce(jsonResponse(internalNoteResponse("note-new")))
      .mockResolvedValueOnce(jsonResponse([taskResponse("task-api")]))
      .mockResolvedValueOnce(jsonResponse({ ...taskResponse("task-new"), assigneeUserId, dueAt }))
      .mockResolvedValueOnce(jsonResponse({ ...taskResponse("task-new"), title: "Updated task", assigneeUserId: null, dueAt: null }))
      .mockResolvedValueOnce(jsonResponse({ ...taskResponse("task-new"), status: "done", completedAt: "2026-05-21T04:05:00.000Z" }));

    const notes = await getConversationNotes("conv-web");
    const note = await createConversationNote("conv-web", { body: "persist this", visibility: "team" });
    const tasks = await getConversationTasks("conv-web");
    const task = await createConversationWorkflowTask("conv-web", { title: "Follow up", assigneeUserId, dueAt });
    const updatedTask = await updateConversationWorkflowTask(task.id, { title: "Updated task", assigneeUserId: null, dueAt: null });
    const completed = await completeConversationWorkflowTask(task.id);

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/conv-web/notes", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/conv-web/tasks", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/tasks/task-new", expect.objectContaining({ method: "PATCH" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/tasks/task-new/complete", expect.objectContaining({ method: "PATCH" }));
    expectTenantHeaderForAll(fetchMock);
    expect(JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body))).toEqual({ body: "persist this", visibility: "team" });
    expect(JSON.parse(String(fetchMock.mock.calls[3]?.[1]?.body))).toEqual({ title: "Follow up", assigneeUserId, dueAt });
    expect(JSON.parse(String(fetchMock.mock.calls[4]?.[1]?.body))).toEqual({ title: "Updated task", assigneeUserId: null, dueAt: null });
    expect(notes[0]?.id).toBe("note-api");
    expect(note.id).toBe("note-new");
    expect(note).toMatchObject({
      tenantId: defaultTenantId,
      customerId: "contact-api",
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      roomId: "room-webchat",
      externalCalls: 0
    });
    expect(tasks[0]?.id).toBe("task-api");
    expect(task).toMatchObject({
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      roomId: "room-webchat"
    });
    expect(updatedTask.title).toBe("Updated task");
    expect(updatedTask.assigneeUserId).toBeNull();
    expect(updatedTask.dueAt).toBeNull();
    expect(completed.status).toBe("done");
  });

  it("does not fake local note/task state when workflow API mutations fail", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ message: "Note unavailable" }, 503))
      .mockResolvedValueOnce(jsonResponse({ message: "Task unavailable" }, 503));

    await expect(createConversationNote("conv-web", { body: "do not fake", visibility: "team" }))
      .rejects.toThrow("API request failed (503): Note unavailable");
    await expect(createConversationWorkflowTask("conv-web", { title: "Do not fake" }))
      .rejects.toThrow("API request failed (503): Task unavailable");

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expectTenantHeaderForAll(fetchMock);
  });

  it("does not fake local task lifecycle state when task update APIs fail", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ message: "Task update unavailable" }, 503))
      .mockResolvedValueOnce(jsonResponse({ message: "Task complete unavailable" }, 503));

    await expect(updateConversationWorkflowTask("task-api", { status: "done" }))
      .rejects.toThrow("API request failed (503): Task update unavailable");
    await expect(completeConversationWorkflowTask("task-api"))
      .rejects.toThrow("API request failed (503): Task complete unavailable");

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/tasks/task-api", expect.objectContaining({ method: "PATCH" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/tasks/task-api/complete", expect.objectContaining({ method: "PATCH" }));
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expectTenantHeaderForAll(fetchMock);
  });

  it("loads API task dashboard rows with tenant and conversation context", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse([
      taskDashboardResponse("task-dashboard-open", "conv-web")
    ]));

    const rows = await getTaskDashboard({
      status: "open",
      due: "overdue",
      assigneeUserId: "00000000-0000-4000-8000-000000000011",
      roomId: "room-webchat",
      limit: 25,
      offset: 0
    });

    const url = new URL(String(fetchMock.mock.calls[0]?.[0]));
    expect(url.pathname).toBe("/tasks");
    expect(url.searchParams.get("status")).toBe("open");
    expect(url.searchParams.get("due")).toBe("overdue");
    expect(url.searchParams.get("assigneeUserId")).toBe("00000000-0000-4000-8000-000000000011");
    expect(url.searchParams.get("roomId")).toBe("room-webchat");
    expect(url.searchParams.get("limit")).toBe("25");
    expectTenantHeaderForAll(fetchMock);
    expect(rows[0]).toMatchObject({
      tenantId: defaultTenantId,
      conversationId: "conv-web",
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      roomId: "room-webchat",
      status: "open",
      externalCalls: 0
    });
    expect(JSON.stringify(rows)).not.toMatch(/accessToken|webhookSecret|botToken|apiKey|Bearer\s+[a-z0-9._-]+|(^|[^a-z])sk-[a-z0-9_-]{8,}/i);
  });

  it("sends tenant-scoped due-soon and follow-up task dashboard filters", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse([taskDashboardResponse("task-due-soon", "conv-web")]))
      .mockResolvedValueOnce(jsonResponse([taskDashboardResponse("task-follow-up", "conv-web")]));

    await getTaskDashboard({ due: "due_soon", roomId: "room-webchat" });
    await getTaskDashboard({ due: "follow_up", followUp: true, roomId: "room-webchat" });

    const dueSoonUrl = new URL(String(fetchMock.mock.calls[0]?.[0]));
    const followUpUrl = new URL(String(fetchMock.mock.calls[1]?.[0]));
    expect(dueSoonUrl.searchParams.get("due")).toBe("due_soon");
    expect(followUpUrl.searchParams.get("due")).toBe("follow_up");
    expect(followUpUrl.searchParams.get("followUp")).toBe("true");
    expectTenantHeaderForAll(fetchMock);
  });

  it("surfaces task dashboard API failures without returning local task rows", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "Tasks unavailable" }, 503));

    await expect(getTaskDashboard({ status: "open" })).rejects.toThrow("API request failed (503): Tasks unavailable");
  });

  it("persists assignment, takeover, return-to-AI, and follow-up without mock fallback", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ id: "conv-web", roomId: "room-webchat" }))
      .mockResolvedValueOnce(jsonResponse([conversationResponse("conv-web", "Human Taken")]))
      .mockResolvedValueOnce(jsonResponse({ id: "conv-web", roomId: "room-webchat" }))
      .mockResolvedValueOnce(jsonResponse([conversationResponse("conv-web", "Human Taken")]))
      .mockResolvedValueOnce(jsonResponse({ id: "conv-web", roomId: "room-webchat" }))
      .mockResolvedValueOnce(jsonResponse([conversationResponse("conv-web", "AI Active")]))
      .mockResolvedValueOnce(jsonResponse({ id: "conv-web", roomId: "room-webchat" }))
      .mockResolvedValueOnce(jsonResponse([conversationResponse("conv-web", "Human Taken", "follow_up")]));

    await assignConversation("conv-web", "00000000-0000-4000-8000-000000000011");
    await takeOverConversation("conv-web");
    const returnedToAi = await returnConversationToAi("conv-web");
    const followUp = await setConversationFollowUp("conv-web", { followUpAt: "2026-05-22T04:00:00.000Z" });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/conv-web/assign", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/conv-web/takeover", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/conv-web/return-to-ai", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/conv-web/follow-up", expect.objectContaining({ method: "POST" }));
    expectTenantHeaderForAll(fetchMock);
    expect(returnedToAi.aiStatus).toBe("AI Active");
    expect(followUp.status).toBe("follow_up");
  });

  it("does not refetch or synthesize local action state when an API conversation action fails", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "Conversation not found" }, 404));

    await expect(updateConversationPriority("missing", { priority: "high" })).rejects.toThrow("API request failed (404): Conversation not found");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/missing/priority", expect.objectContaining({ method: "PATCH" }));
    expectTenantHeaderForAll(fetchMock);
  });

  it("calls status, priority, read-state, SLA, close, audit, and status-history API endpoints", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ id: "conv-web", roomId: "room-webchat" }))
      .mockResolvedValueOnce(jsonResponse([conversationResponse("conv-web", "Closed", "closed")]))
      .mockResolvedValueOnce(jsonResponse({ id: "conv-web", roomId: "room-webchat" }))
      .mockResolvedValueOnce(jsonResponse([conversationResponse("conv-web", "Need Human", "open")]))
      .mockResolvedValueOnce(jsonResponse({ id: "conv-web", roomId: "room-webchat" }))
      .mockResolvedValueOnce(jsonResponse([conversationResponse("conv-web", "Need Human", "open")]))
      .mockResolvedValueOnce(jsonResponse({ id: "conv-web", roomId: "room-webchat" }))
      .mockResolvedValueOnce(jsonResponse([{ ...conversationResponse("conv-web", "Need Human", "open"), slaStatus: "warning", slaDueAt: "2026-05-21T04:30:00.000Z" }]))
      .mockResolvedValueOnce(jsonResponse({ id: "conv-web", roomId: "room-webchat" }))
      .mockResolvedValueOnce(jsonResponse([conversationResponse("conv-web", "Closed", "closed")]))
      .mockResolvedValueOnce(jsonResponse([auditLogResponse("audit-1")]))
      .mockResolvedValueOnce(jsonResponse([statusHistoryResponse("history-1")]));

    const status = await updateConversationStatus("conv-web", { status: "closed" });
    const priority = await updateConversationPriority("conv-web", { priority: "normal" });
    const readState = await updateConversationReadState("conv-web", { unread: false, unreplied: false });
    const sla = await updateConversationSla("conv-web", { slaStatus: "warning", slaDueAt: "2026-05-21T04:30:00.000Z" });
    const closed = await closeConversation("conv-web");
    const auditLogs = await getConversationAuditLogs("conv-web");
    const statusHistory = await getConversationStatusHistory("conv-web");

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/conv-web/status", expect.objectContaining({ method: "PATCH" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/conv-web/priority", expect.objectContaining({ method: "PATCH" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/conv-web/read-state", expect.objectContaining({ method: "PATCH" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/conv-web/sla", expect.objectContaining({ method: "PATCH" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/conv-web/close", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/conv-web/audit-logs", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/conv-web/status-history", expect.any(Object));
    expectTenantHeaderForAll(fetchMock);
    expect(status.status).toBe("closed");
    expect(priority.id).toBe("conv-web");
    expect(readState.id).toBe("conv-web");
    expect(sla.slaStatus).toBe("warning");
    expect(closed.status).toBe("closed");
    expect(auditLogs[0]?.action).toBe("conversation.status_updated");
    expect(statusHistory[0]?.toStatus).toBe("closed");
  });

  it("sends x-tenant-id when requesting conversation audit logs", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse([auditLogResponse("audit-tenant")]));

    await getConversationAuditLogs("conv-web");

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/conv-web/audit-logs", expect.any(Object));
    expect(fetchMock.mock.calls[0]?.[1]?.headers).toEqual(expect.objectContaining({ "x-tenant-id": defaultTenantId }));
  });

  it("sends x-tenant-id when requesting conversation status history", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse([statusHistoryResponse("history-tenant")]));

    await getConversationStatusHistory("conv-web");

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/conv-web/status-history", expect.any(Object));
    expect(fetchMock.mock.calls[0]?.[1]?.headers).toEqual(expect.objectContaining({ "x-tenant-id": defaultTenantId }));
  });

  it("surfaces audit log API failures without returning local mock audit data", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "Audit unavailable" }, 503));

    await expect(getConversationAuditLogs("conv-web")).rejects.toThrow("API request failed (503): Audit unavailable");
  });

  it("surfaces status-history API failures without returning local mock history data", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "History unavailable" }, 503));

    await expect(getConversationStatusHistory("conv-web")).rejects.toThrow("API request failed (503): History unavailable");
  });

  it("calls AI Center knowledge base, document, and chunk endpoints", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse([knowledgeBaseResponse("kb-api")]))
      .mockResolvedValueOnce(jsonResponse(knowledgeBaseResponse("kb-new")))
      .mockResolvedValueOnce(jsonResponse({ ...knowledgeBaseResponse("kb-new"), name: "Updated KB" }))
      .mockResolvedValueOnce(jsonResponse({ ...knowledgeBaseResponse("kb-new"), status: "archived" }))
      .mockResolvedValueOnce(jsonResponse([knowledgeDocumentResponse("doc-api", "kb-api")]))
      .mockResolvedValueOnce(jsonResponse(knowledgeDocumentResponse("doc-new", "kb-api")))
      .mockResolvedValueOnce(jsonResponse({ ...knowledgeDocumentResponse("doc-new", "kb-api"), title: "Updated Doc" }))
      .mockResolvedValueOnce(jsonResponse({ ...knowledgeDocumentResponse("doc-new", "kb-api"), status: "archived" }))
      .mockResolvedValueOnce(jsonResponse([knowledgeChunkResponse("chunk-api", "doc-api")]))
      .mockResolvedValueOnce(jsonResponse(knowledgeChunkResponse("chunk-new", "doc-api")))
      .mockResolvedValueOnce(jsonResponse({ ...knowledgeChunkResponse("chunk-new", "doc-api"), content: "Updated chunk" }))
      .mockResolvedValueOnce(jsonResponse({ id: "chunk-new", deleted: true }));

    const bases = await getKnowledgeBases();
    const createdBase = await createKnowledgeBase({ name: "New KB", description: "API", status: "draft" });
    const updatedBase = await updateKnowledgeBase(createdBase.id, { name: "Updated KB" });
    const archivedBase = await deleteKnowledgeBase(createdBase.id);
    const docs = await getKnowledgeDocuments("kb-api");
    const createdDoc = await createKnowledgeDocument("kb-api", { title: "New Doc", sourceType: "manual", status: "active" });
    const updatedDoc = await updateKnowledgeDocument(createdDoc.id, { title: "Updated Doc" });
    const archivedDoc = await deleteKnowledgeDocument(createdDoc.id);
    const chunks = await getKnowledgeChunks("doc-api");
    const createdChunk = await createKnowledgeChunk("doc-api", { content: "New chunk", metadataJson: { section: "demo" } });
    const updatedChunk = await updateKnowledgeChunk(createdChunk.id, { content: "Updated chunk" });
    const deletedChunk = await deleteKnowledgeChunk(createdChunk.id);

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/ai/knowledge-bases", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/ai/knowledge-bases", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/ai/knowledge-bases/kb-new", expect.objectContaining({ method: "PATCH" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/ai/knowledge-bases/kb-new", expect.objectContaining({ method: "DELETE" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/ai/knowledge-bases/kb-api/documents", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/ai/knowledge-bases/kb-api/documents", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/ai/documents/doc-new", expect.objectContaining({ method: "PATCH" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/ai/documents/doc-new", expect.objectContaining({ method: "DELETE" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/ai/documents/doc-api/chunks", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/ai/documents/doc-api/chunks", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/ai/chunks/chunk-new", expect.objectContaining({ method: "PATCH" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/ai/chunks/chunk-new", expect.objectContaining({ method: "DELETE" }));
    expectTenantHeaderForAll(fetchMock);
    expect(bases[0]?.name).toBe("API KB");
    expect(updatedBase.name).toBe("Updated KB");
    expect(archivedBase.status).toBe("archived");
    expect(docs[0]?.knowledgeBaseId).toBe("kb-api");
    expect(updatedDoc.title).toBe("Updated Doc");
    expect(archivedDoc.status).toBe("archived");
    expect(chunks[0]?.documentId).toBe("doc-api");
    expect(updatedChunk.content).toBe("Updated chunk");
    expect(deletedChunk.deleted).toBe(true);
  });

  it("gets and updates room AI policy through the API", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(roomAiPolicyResponse("room-webchat")))
      .mockResolvedValueOnce(jsonResponse({ ...roomAiPolicyResponse("room-webchat"), aiMode: "human_first", knowledgeBaseIds: ["kb-api"] }));

    const before = await getRoomAiPolicy("room-webchat");
    const after = await updateRoomAiPolicy("room-webchat", {
      aiMode: "human_first",
      autoReplyThreshold: 0.8,
      draftThreshold: 0.55,
      requireCitationsForAutoReply: true,
      handoffOnHighRisk: true,
      knowledgeBaseIds: ["kb-api"]
    });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/rooms/room-webchat/ai-policy", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/rooms/room-webchat/ai-policy", expect.objectContaining({ method: "PATCH" }));
    expectTenantHeaderForAll(fetchMock);
    expect(before.aiMode).toBe("suggest");
    expect(after.aiMode).toBe("human_first");
    expect(after.knowledgeBaseIds).toEqual(["kb-api"]);
  });

  it("sends x-tenant-id for AI suggested reply and feedback requests", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(aiSuggestionResponse("ai-run-1", "conv-web")))
      .mockResolvedValueOnce(jsonResponse(aiFeedbackResponse("feedback-1", "ai-run-1", "conv-web")));

    const suggestion = await suggestAiReply("conv-web");
    const feedback = await markAiSuggestionWrong(suggestion.suggestionId, { feedbackType: "mark_wrong" });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/ai/conversations/conv-web/suggest", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/ai/suggestions/ai-run-1/feedback", expect.objectContaining({ method: "POST" }));
    expectTenantHeaderForAll(fetchMock);
    expect(JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body))).toEqual({ feedbackType: "mark_wrong" });
    expect(suggestion).toMatchObject({
      suggestionId: "ai-run-1",
      conversationId: "conv-web",
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      roomId: "room-webchat",
      externalCalls: 0
    });
    expect(feedback.feedbackType).toBe("mark_wrong");
    expect(JSON.stringify(suggestion)).not.toMatch(/accessToken|webhookSecret|botToken|apiKey|Bearer|sk-/i);
  });

  it("surfaces AI suggestion API failures without returning mock suggestions", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "AI unavailable" }, 503));

    await expect(suggestAiReply("conv-web")).rejects.toThrow("API request failed (503): AI unavailable");
  });

  it("returns readable API errors", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "Conversation not found" }, 404));

    await expect(sendAgentMessage("missing", "hello")).rejects.toThrow("API request failed (404): Conversation not found");
  });
});

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    text: async () => JSON.stringify(body)
  } as Response;
}

function providerReadinessResponse() {
  return {
    status: "ok",
    service: "api",
    time: "2026-05-31T00:00:00.000Z",
    externalCalls: 0,
    allowlist: {
      configured: true,
      entryCount: 2
    },
    apiMode: {
      apiMode: "api",
      dataMode: "api",
      publicDataMode: "api",
      apiModeExplicit: true,
      dataModeExplicit: true,
      publicDataModeExplicit: true,
      apiBaseConfigured: true
    },
    dependencies: {
      databaseConfigured: true,
      redisConfigured: true
    },
    providerReadiness: {
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
      reviewExportRedactionAuditEnabled: true,
      reviewExportIntegrityChecksEnabled: true,
      reviewExportManifestEnabled: true,
      reviewExportQaHandoffEnabled: true,
      reviewQaHandoffLockedArchiveEnabled: true,
      reviewQaHandoffRetentionManifestEnabled: true,
      lockedArchiveReadyCount: 1,
      lockedArchiveExportedCount: 0,
      retentionManifestReadyCount: 1,
      latestLockedArchiveStatus: "ready",
      latestRetentionManifestStatus: "ready",
      exportRedactionPassedCount: 1,
      exportRedactionWarningCount: 0,
      exportRedactionBlockedCount: 0,
      exportManifestReadyCount: 1,
      exportManifestNeedsReviewCount: 0,
      exportManifestBlockedCount: 0,
      latestExportManifestStatus: "ready",
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
    },
    monitoring: {
      auditSafetyBaseline: true,
      providerPayloadsExposed: false,
      externalCalls: 0
    },
    checks: [
      { name: "provider outbound disabled", ok: true }
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
    tenantId: defaultTenantId,
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
    unmatchedInboundId: "provider-webhook-unmatched-1",
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
    tenantId: defaultTenantId,
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

function providerWebhookUnmatchedInboundPageResponse(items = [providerWebhookUnmatchedInboundResponse("provider-webhook-unmatched-1")]) {
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
    tenantId: defaultTenantId,
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
    unmatchedId: "provider-webhook-unmatched-1",
    tenantId: defaultTenantId,
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
      escalationReason: null
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

function providerWebhookExportResponse(items = [providerWebhookUnmatchedInboundResponse("provider-webhook-unmatched-1")], format: "json" | "csv" = "json") {
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
    externalCalls: 0
  }));
  return {
    format,
    rows,
    csv: format === "csv" ? "id,provider\nprovider-webhook-unmatched-1,line" : null,
    appliedFilters: {
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      eventType: "message.created",
      receivedAtFrom: "2026-05-31T00:00:00.000Z",
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
      unmatchedStatus: "review-needed",
      eventType: "message.created",
      receivedAtFrom: "2026-05-31T00:00:00.000Z",
      receivedAtTo: "2026-06-01T00:00:00.000Z"
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
      unmatchedStatus: "review-needed",
      eventType: "message.created",
      receivedAtFrom: "2026-05-31T00:00:00.000Z",
      receivedAtTo: "2026-06-01T00:00:00.000Z",
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
      unmatchedId: "provider-webhook-unmatched-1",
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
      assignmentStatus: "unassigned",
      assignedToOperatorLabel: null,
      escalationStatus: "none",
      escalationReason: null,
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
      receivedAtFrom: "2026-05-31T00:00:00.000Z",
      receivedAtTo: "2026-06-01T00:00:00.000Z",
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
      },
      {
        laneKey: "safe_link_candidate_available",
        label: "Safe link candidate available",
        severity: "info",
        count: 0,
        description: "Open normalized items with safe platform, channel account, and room digest context.",
        recommendedNextActions: ["RUN_CANDIDATE_LOOKUP", "LINK_ONLY", "LINK_AND_PERSIST_SAFE_MESSAGE"],
        safeDrilldownFilters: { status: "open", reviewStatus: "pending", linkStatus: "none" }
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
      unmatchedId: "provider-webhook-unmatched-1",
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
      assignmentStatus: "unassigned",
      assignedToOperatorLabel: null,
      escalationStatus: "none",
      escalationReason: null,
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
      assignedTo: "me",
      assignmentStatus: "assigned_to_me",
      escalationStatus: "escalated",
      escalationReason: "SLA_RISK",
      receivedAtFrom: "2026-05-31T00:00:00.000Z",
      receivedAtTo: "2026-06-01T00:00:00.000Z",
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
      assignedTo: "me",
      assignmentStatus: "assigned_to_me",
      escalationStatus: "escalated",
      escalationReason: "SLA_RISK",
      resolutionStatus: "unresolved",
      resolutionOutcome: "NEEDS_REVIEW",
      closureReadiness: "NOT_READY",
      checklistIncomplete: true,
      receivedAtFrom: "2026-05-31T00:00:00.000Z",
      receivedAtTo: "2026-06-01T00:00:00.000Z",
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
  const { generatedAt: _generatedAt, ...item } = providerWebhookClosureEvidenceResponse("provider-webhook-unmatched-1");
  void _generatedAt;
  return {
    generatedAt: "2026-06-04T00:00:00.000Z",
    appliedFilters: {
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      eventType: "message.created",
      assignedTo: "me",
      assignmentStatus: "assigned_to_me",
      escalationStatus: "escalated",
      escalationReason: "SLA_RISK",
      resolutionStatus: "resolved",
      resolutionOutcome: "NEEDS_REVIEW",
      closureReadiness: "READY_FOR_REVIEW",
      checklistIncomplete: false,
      receivedAtFrom: "2026-05-31T00:00:00.000Z",
      receivedAtTo: "2026-06-01T00:00:00.000Z",
      severity: "info",
      triageLane: "safe_link_candidate_available"
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
      : `provider-webhook-closure-evidence-line-${unmatchedId ?? "provider-webhook-unmatched-1"}.json`,
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
  const evidence = providerWebhookClosureEvidenceResponse("provider-webhook-unmatched-1");
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
    generatedAt: "2026-06-04T00:07:00.000Z",
    lockedArchiveStatus: "ready",
    retentionManifestStatus: "ready",
    archiveAcknowledgementStatus: "not_exported",
    acceptanceStatus: "locked",
    lockStatus: "locked",
    receiptStatus: signOff.receiptStatus,
    signOffStatus: signOff.signOffStatus,
    bundleStatus: signOff.bundleStatus,
    exportStatus: signOff.exportStatus,
    safeFilename: "provider-webhook-review-qa-handoff-locked-archive.json",
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
    retentionPolicyLabel: "safe-qa-handoff-locked-archive-retention",
    archivedAt: "2026-06-04T00:07:00.000Z",
    exportedAt: null,
    externalCalls: 0
  };
}

function providerWebhookRetentionManifestResponse() {
  const archive = providerWebhookLockedArchiveResponse();
  return {
    generatedAt: "2026-06-04T00:07:30.000Z",
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
    safeFilename: "provider-webhook-review-qa-handoff-retention-manifest.json",
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
  const archive = {
    ...providerWebhookLockedArchiveResponse(),
    lockedArchiveStatus: "exported",
    archiveAcknowledgementStatus: "exported",
    safeFilename: "provider-webhook-review-qa-handoff-locked-archive-export.json",
    exportedAt: "2026-06-04T00:08:00.000Z"
  };
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
  const archive = {
    ...providerWebhookLockedArchiveResponse(),
    lockedArchiveStatus: "exported",
    archiveAcknowledgementStatus: "exported",
    exportedAt: "2026-06-04T00:08:00.000Z"
  };
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
    unmatchedId: "provider-webhook-unmatched-1",
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

function providerWebhookBulkAssignmentResponse(operation: "ASSIGN_TO_ME" | "ASSIGN_TO_OPERATOR" | "UNASSIGN") {
  return {
    operation,
    results: [
      {
        id: "provider-webhook-unmatched-1",
        ok: true,
        resultStatus: "updated",
        assignmentStatus: "assigned",
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
        id: "provider-webhook-unmatched-1",
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
        id: "provider-webhook-unmatched-1",
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

function expectTenantHeaderForAll(fetchMock: { mock: { calls: Array<[unknown, RequestInit?]> } }) {
  for (const [, init] of fetchMock.mock.calls) {
    expect(init).toEqual(expect.objectContaining({
      headers: expect.objectContaining({ "x-tenant-id": defaultTenantId })
    }));
  }
}

function contactResponse(id: string, identityId = "identity-api") {
  return {
    id,
    displayName: "API Contact",
    phone: "000",
    email: "api@example.local",
    leadStatus: "new",
    ownerAgent: "Demo",
    tags: [],
    customFields: {},
    identities: [{
      id: identityId,
      contactId: id,
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      accountName: "Main Website",
      externalUserId: "visitor-api",
      displayName: "Visitor API",
      isPrimary: true,
      lastSeenAt: "2026-05-21T04:00:00.000Z"
    }],
    notes: [],
    tasks: [],
    optOutBroadcast: false,
    createdAt: "2026-05-21T04:00:00.000Z",
    updatedAt: "2026-05-21T04:00:00.000Z"
  };
}

function settingsChannelResponse(id: string) {
  return {
    id,
    platform: "webchat",
    accountName: "Main Website",
    accountKey: "demo-webchat",
    status: "active",
    webhookUrl: "http://localhost:4000/webhooks/webchat/demo-webchat",
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
    name: "May",
    displayName: "May",
    role: "agent",
    email: "may@example.local",
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

function customer360Response(conversationId: string, contactId: string) {
  return {
    selectedConversationId: conversationId,
    contact: contactResponse(contactId),
    owner: "Demo",
    priority: "medium",
    status: "open",
    identities: contactResponse(contactId).identities,
    recentConversations: [{
      id: conversationId,
      tenantId: defaultTenantId,
      roomId: "room-webchat",
      tab: "human",
      platform: "webchat",
      platformLabel: "Webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      accountName: "Main Website",
      customerName: "API Contact",
      customerEmail: "api@example.local",
      customerPhone: "000",
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
    }],
    notes: [customer360NoteResponse("note-customer-360", conversationId, contactId)],
    tasks: [contactTaskResponse("task-customer-360", conversationId, contactId)],
    broadcastHistorySummary: {
      contactId,
      customerId: contactId,
      identityId: "identity-api",
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      roomId: "room-webchat",
      conversationId,
      lastCampaignId: "campaign-api",
      lastCampaignName: "Persisted campaign",
      sentMockCount: 1,
      optOut: false,
      externalCalls: 0,
      rows: [{
        id: "send-log-api",
        contactId,
        customerId: contactId,
        identityId: "identity-api",
        campaignId: "campaign-api",
        campaignName: "Persisted campaign",
        campaignStatus: "sent",
        platform: "webchat",
        channelAccountId: "00000000-0000-4000-8000-000000000020",
        roomId: "room-webchat",
        conversationId,
        status: "sent_mock",
        reason: "safe mock send only; no external outbound call was made",
        sentAt: "2026-05-21T04:00:00.000Z",
        queuedAt: null,
        mockOnly: true,
        safe: true,
        externalCalls: 0
      }]
    },
    source: {
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      accountName: "Main Website",
      externalUserId: "visitor-api",
      displayName: "Visitor API"
    }
  };
}

function customer360NoteResponse(id: string, conversationId: string, contactId: string) {
  return {
    id,
    tenantId: defaultTenantId,
    conversationId,
    contactId,
    customerId: contactId,
    platform: "webchat",
    channelAccountId: "00000000-0000-4000-8000-000000000020",
    roomId: "room-webchat",
    body: "Customer 360 persisted note",
    createdBy: "00000000-0000-4000-8000-000000000011",
    createdAt: "2026-05-21T04:00:00.000Z",
    updatedAt: "2026-05-21T04:00:00.000Z",
    externalCalls: 0
  };
}

function contactTaskResponse(id: string, conversationId: string, contactId: string) {
  return {
    id,
    tenantId: defaultTenantId,
    conversationId,
    contactId,
    platform: "webchat",
    channelAccountId: "00000000-0000-4000-8000-000000000020",
    roomId: "room-webchat",
    title: "Customer 360 persisted task",
    status: "open",
    assigneeUserId: null,
    dueAt: null,
    completedAt: null,
    createdAt: "2026-05-21T04:00:00.000Z",
    updatedAt: "2026-05-21T04:00:00.000Z",
    externalCalls: 0
  };
}

function conversationResponse(id: string, aiStatus = "Need Human", status = "open") {
  return {
    id,
    roomId: "room-webchat",
    tab: aiStatus === "AI Active" ? "bot" : "human",
    platform: "webchat",
    platformLabel: "Webchat",
    channelAccountId: "00000000-0000-4000-8000-000000000020",
    accountName: "Main Website",
    customerName: "API Contact",
    customerEmail: "api@example.local",
    customerPhone: "000",
    lastMessage: "hello",
    lastMessageAt: "2026-05-21T04:00:00.000Z",
    lastMessageTime: "11:00",
    unreadCount: 1,
    assignedAgent: "May",
    tags: [],
    aiStatus,
    priority: "medium",
    status,
    unreplied: true,
    followUpAt: status === "follow_up" ? "2026-05-22T04:00:00.000Z" : undefined
  };
}

function internalNoteResponse(id: string) {
  return {
    id,
    tenantId: defaultTenantId,
    conversationId: "conv-web",
    contactId: "contact-api",
    customerId: "contact-api",
    platform: "webchat",
    channelAccountId: "00000000-0000-4000-8000-000000000020",
    roomId: "room-webchat",
    body: "persist this",
    visibility: "team",
    createdBy: "00000000-0000-4000-8000-000000000011",
    createdAt: "2026-05-21T04:00:00.000Z",
    updatedAt: "2026-05-21T04:00:00.000Z",
    pinned: false,
    externalCalls: 0
  };
}

function taskResponse(id: string) {
  return {
    id,
    tenantId: defaultTenantId,
    conversationId: "conv-web",
    contactId: "contact-api",
    platform: "webchat",
    channelAccountId: "00000000-0000-4000-8000-000000000020",
    roomId: "room-webchat",
    title: "Follow up",
    status: "open",
    assigneeUserId: null,
    createdByUserId: "00000000-0000-4000-8000-000000000011",
    dueAt: null,
    completedAt: null,
    createdAt: "2026-05-21T04:00:00.000Z",
    updatedAt: "2026-05-21T04:00:00.000Z",
    externalCalls: 0
  };
}

function taskDashboardResponse(id: string, conversationId: string) {
  return {
    ...taskResponse(id),
    conversationId,
    conversationTab: "human",
    conversationStatus: "open",
    conversationPriority: "medium",
    customerName: "API Contact",
    assignedAgentName: "May",
    accountName: "Main Website",
    platformLabel: "Webchat",
    lastMessageAt: "2026-05-21T04:00:00.000Z"
  };
}

function auditLogResponse(id: string) {
  return {
    id,
    tenantId: "00000000-0000-4000-8000-000000000001",
    conversationId: "conv-web",
    platform: "webchat",
    channelAccountId: "00000000-0000-4000-8000-000000000020",
    roomId: "room-webchat",
    actorUserId: "00000000-0000-4000-8000-000000000011",
    action: "conversation.status_updated",
    beforeJson: { status: "open" },
    afterJson: { status: "closed" },
    metadataJson: {
      fromStatus: "open",
      toStatus: "closed",
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      roomId: "room-webchat"
    },
    createdAt: "2026-05-21T04:00:00.000Z"
  };
}

function statusHistoryResponse(id: string) {
  return {
    id,
    tenantId: "00000000-0000-4000-8000-000000000001",
    conversationId: "conv-web",
    platform: "webchat",
    channelAccountId: "00000000-0000-4000-8000-000000000020",
    roomId: "room-webchat",
    actorUserId: "00000000-0000-4000-8000-000000000011",
    fromStatus: "open",
    toStatus: "closed",
    metadataJson: {
      source: "status_endpoint",
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      roomId: "room-webchat"
    },
    createdAt: "2026-05-21T04:00:00.000Z"
  };
}

function knowledgeBaseResponse(id: string) {
  return {
    id,
    tenantId: "00000000-0000-4000-8000-000000000001",
    name: id === "kb-api" ? "API KB" : "New KB",
    description: "Knowledge from API",
    status: "active",
    documentCount: 1,
    updatedAt: "2026-05-21T04:00:00.000Z"
  };
}

function knowledgeDocumentResponse(id: string, knowledgeBaseId: string) {
  return {
    id,
    tenantId: "00000000-0000-4000-8000-000000000001",
    knowledgeBaseId,
    title: id === "doc-api" ? "API Doc" : "New Doc",
    sourceType: "manual",
    sourceUrl: null,
    status: "active",
    createdAt: "2026-05-21T04:00:00.000Z",
    updatedAt: "2026-05-21T04:00:00.000Z"
  };
}

function knowledgeChunkResponse(id: string, documentId: string) {
  return {
    id,
    tenantId: "00000000-0000-4000-8000-000000000001",
    documentId,
    content: id === "chunk-api" ? "API chunk" : "New chunk",
    metadataJson: { section: "demo" },
    createdAt: "2026-05-21T04:00:00.000Z",
    updatedAt: "2026-05-21T04:00:00.000Z"
  };
}

function roomAiPolicyResponse(roomId: string) {
  return {
    roomId,
    aiMode: "suggest",
    autoReplyThreshold: 0.85,
    draftThreshold: 0.6,
    requireCitationsForAutoReply: true,
    handoffOnHighRisk: true,
    knowledgeBaseIds: [],
    updatedAt: "2026-05-21T04:00:00.000Z"
  };
}

function aiSuggestionResponse(id: string, conversationId: string) {
  return {
    suggestionId: id,
    aiRunId: id,
    tenantId: "00000000-0000-4000-8000-000000000001",
    conversationId,
    platform: "webchat",
    channelAccountId: "00000000-0000-4000-8000-000000000020",
    roomId: "room-webchat",
    summary: "Customer asks for pricing.",
    suggestedReply: "ราคาเริ่มต้นตามแพ็กเกจครับ",
    intent: "pricing",
    confidence: 0.9,
    riskLevel: "low",
    nextAction: "suggest_reply",
    requiresHuman: false,
    sources: [{
      id: "doc-price",
      title: "Pricing FAQ",
      category: "price_rules",
      matchReason: "Matched keywords: price",
      sourceType: "knowledge_doc",
      sourceUrl: null
    }],
    status: "completed",
    error: null,
    externalCalls: 0,
    generatedAt: "2026-05-21T04:00:00.000Z"
  };
}

function aiFeedbackResponse(id: string, suggestionId: string, conversationId: string) {
  return {
    feedbackId: id,
    suggestionId,
    aiRunId: suggestionId,
    tenantId: "00000000-0000-4000-8000-000000000001",
    conversationId,
    platform: "webchat",
    channelAccountId: "00000000-0000-4000-8000-000000000020",
    roomId: "room-webchat",
    feedbackType: "mark_wrong",
    actionType: "feedback.mark_wrong",
    externalCalls: 0,
    createdAt: "2026-05-21T04:00:00.000Z"
  };
}
