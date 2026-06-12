import React from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { ProviderReadiness, ProviderWebhookCandidateConversation, ProviderWebhookEvent, ProviderWebhookOperatorNote, ProviderWebhookReviewAlerts, ProviderWebhookReviewClosureEvidence, ProviderWebhookReviewClosureEvidenceExport, ProviderWebhookReviewExportIntegrity, ProviderWebhookReviewExportManifest, ProviderWebhookReviewQaHandoffArchiveIntegrity, ProviderWebhookReviewQaHandoffBundle, ProviderWebhookReviewQaHandoffBundleExport, ProviderWebhookReviewQaHandoffFinalizationReceipt, ProviderWebhookReviewQaHandoffFinalizationSignOffResponse, ProviderWebhookReviewQaHandoffReleaseEvidence, ProviderWebhookReviewQaHandoffReleaseCertification, ProviderWebhookReviewQaHandoffReleaseAttestationAudit, ProviderWebhookReviewQaHandoffReleaseAttestationReconciliationRegister, ProviderWebhookReviewQaHandoffCertifiedReleaseGate, ProviderWebhookReviewQaHandoffCertifiedReleaseDecisionReceipt, ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket, ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord, ProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedger, ProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificate, ProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister, ProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt, ProviderWebhookReviewQaHandoffCertifiedReleaseControlRoomPacket, ProviderWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceipt, ProviderWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceipt, ProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceipt, ProviderWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceipt, ProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceipt, ProviderWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceipt, ProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun, ProviderWebhookReviewQaHandoffReleaseClosureLedger, ProviderWebhookReviewQaHandoffReleaseVerification, ProviderWebhookReviewQaHandoffRetentionAudit, ProviderWebhookReviewQaHandoffReceipt, ProviderWebhookReviewQaHandoffSignOffResponse, ProviderWebhookReviewExportRedactionAudit, ProviderWebhookReviewClosureReport, ProviderWebhookReviewClosureReportExport, ProviderWebhookReviewMetrics, ProviderWebhookReviewResolutionSummary, ProviderWebhookReviewSavedView, ProviderWebhookReviewTriage, ProviderWebhookReviewWorkload, ProviderWebhookUnmatchedInboundDiagnostics, ProviderWebhookUnmatchedInboundExport, ProviderWebhookUnmatchedInboundHistory, ProviderWebhookUnmatchedInboundItem } from "@ai-omni/shared";
import { ProviderReadinessPanel } from "./provider-readiness-panel";

describe("ProviderReadinessPanel", () => {
  it("renders provider readiness status safely without secrets or allowlist values", () => {
    const html = renderToString(React.createElement(ProviderReadinessPanel, {
      readiness: providerReadiness(),
      loading: false,
      error: "",
      webhookEvents: [providerWebhookEvent()],
      unmatchedInboundItems: [providerWebhookUnmatchedInboundItem()],
      unmatchedPagination: {
        totalCount: 12,
        limit: 5,
        offset: 5,
        returnedCount: 1,
        hasNextPage: true,
        hasPreviousPage: true
      },
      unmatchedAppliedSort: {
        sortBy: "receivedAt",
        sortOrder: "asc"
      },
      unmatchedPageSummary: {
        openCount: 4,
        reviewedCount: 3,
        skippedCount: 2,
        linkedCount: 1
      },
      candidateItemsById: { "provider-webhook-unmatched-1": [providerWebhookCandidateConversation()] },
      reviewMetrics: providerWebhookReviewMetrics(),
      reviewAlerts: providerWebhookReviewAlerts(),
      reviewTriage: providerWebhookReviewTriage(),
      reviewWorkload: providerWebhookReviewWorkload(),
      reviewResolutionSummary: providerWebhookReviewResolutionSummary(),
      reviewClosureReport: providerWebhookReviewClosureReport(),
      reviewClosureReportExport: providerWebhookReviewClosureReportExport(),
      reviewClosureReportExportManifest: providerWebhookReviewExportManifest("closure-report-export"),
      reviewQaHandoffBundle: providerWebhookReviewQaHandoffBundle(),
      reviewQaHandoffBundleExport: providerWebhookReviewQaHandoffBundleExport(),
      reviewQaHandoffReceipt: providerWebhookReviewQaHandoffReceipt(),
      reviewQaHandoffSignOff: providerWebhookReviewQaHandoffSignOff(),
      reviewQaHandoffLockedArchive: providerWebhookReviewQaHandoffLockedArchive(),
      reviewQaHandoffLockedArchiveExport: providerWebhookReviewQaHandoffLockedArchiveExport(),
      reviewQaHandoffRetentionManifest: providerWebhookReviewQaHandoffRetentionManifest(),
      reviewQaHandoffArchiveIntegrity: providerWebhookReviewQaHandoffArchiveIntegrity(),
      reviewQaHandoffRetentionAudit: providerWebhookReviewQaHandoffRetentionAudit(),
      reviewQaHandoffArchiveReleaseEvidence: providerWebhookReviewQaHandoffArchiveReleaseEvidence(),
      reviewQaHandoffArchiveReleaseVerification: providerWebhookReviewQaHandoffArchiveReleaseVerification(),
      reviewQaHandoffArchiveReleaseCertification: providerWebhookReviewQaHandoffArchiveReleaseCertification(),
      reviewQaHandoffArchiveReleaseClosureLedger: providerWebhookReviewQaHandoffArchiveReleaseClosureLedger(),
      reviewQaHandoffArchiveReleaseAttestationAudit: providerWebhookReviewQaHandoffArchiveReleaseAttestationAudit(),
      reviewQaHandoffArchiveReleaseAttestationReconciliation: providerWebhookReviewQaHandoffArchiveReleaseAttestationReconciliation(),
      reviewQaHandoffCertifiedReleaseGate: providerWebhookReviewQaHandoffCertifiedReleaseGate(),
      reviewQaHandoffCertifiedReleaseDecisionReceipt: providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceipt(),
      reviewQaHandoffCertifiedReleaseHandoffPacket: providerWebhookReviewQaHandoffCertifiedReleaseHandoffPacket(),
      reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord: providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord(),
      reviewQaHandoffCertifiedReleaseNoopExecutionDryRun: providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun(),
      reviewQaHandoffCertifiedReleaseDryRunResultLedger: providerWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedger(),
      reviewQaHandoffCertifiedReleaseFinalReadinessCertificate: providerWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificate(),
      reviewQaHandoffCertifiedReleaseFreezeAuditRegister: providerWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister(),
      reviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt: providerWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt(),
      reviewQaHandoffCertifiedReleaseControlRoomPacket: providerWebhookReviewQaHandoffCertifiedReleaseControlRoomPacket(),
      reviewQaHandoffCertifiedReleaseCutoverChecklistReceipt: providerWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceipt(),
      reviewQaHandoffCertifiedReleaseOperatorCommandReceipt: providerWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceipt(),
      reviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceipt: providerWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceipt(),
      reviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceipt: providerWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceipt(),
      reviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceipt: providerWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceipt(),
      reviewQaHandoffCertifiedReleaseLaunchApprovalReceipt: providerWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceipt(),
      reviewClosureReportRedactionAudit: providerWebhookReviewExportRedactionAudit("closure-report-export"),
      reviewClosureExportIntegrity: providerWebhookReviewExportIntegrity(),
      reviewSavedViews: [providerWebhookReviewSavedView()],
      reviewSavedViewActionStatus: "Saved view Safe queue view; externalCalls=0",
      activeDiagnosticsId: "provider-webhook-unmatched-1",
      activeDiagnostics: providerWebhookDiagnostics(),
      activeClosureEvidenceId: "provider-webhook-unmatched-1",
      activeClosureEvidence: providerWebhookClosureEvidence(),
      activeClosureEvidenceExportId: "provider-webhook-unmatched-1",
      activeClosureEvidenceExport: providerWebhookClosureEvidenceExport(),
      activeClosureEvidenceExportManifestId: "provider-webhook-unmatched-1",
      activeClosureEvidenceExportManifest: providerWebhookReviewExportManifest("closure-evidence-export", "provider-webhook-unmatched-1"),
      activeClosureEvidenceRedactionAuditId: "provider-webhook-unmatched-1",
      activeClosureEvidenceRedactionAudit: providerWebhookReviewExportRedactionAudit("closure-evidence-export", "provider-webhook-unmatched-1"),
      activeHistoryId: "provider-webhook-unmatched-1",
      activeHistory: providerWebhookHistory(),
      operatorNotesById: { "provider-webhook-unmatched-1": [providerWebhookOperatorNote()] },
      unmatchedExportResult: providerWebhookExport(),
      unmatchedActionStatus: "Unmatched inbound provider-webhook-unmatched-1 reviewed; externalCalls=0"
    }));

    expect(html).toContain("Provider sandbox readiness");
    expect(html).toContain("provider mode: disabled");
    expect(html).toContain("sandbox mode: disabled");
    expect(html).toContain("realOutboundEnabled=false");
    expect(html).toContain("externalCalls=0");
    expect(html).toContain("allowlist count=2");
    expect(html).toContain("signature verification=sandbox-ready");
    expect(html).toContain("replay guardrails=enabled");
    expect(html).toContain("normalization=enabled");
    expect(html).toContain("dryRunRouting=enabled");
    expect(html).toContain("latest signature=verified");
    expect(html).toContain("latest replay=fresh");
    expect(html).toContain("latest normalization=normalized");
    expect(html).toContain("latest routing=dry-run-only");
    expect(html).toContain("normalizedEventCount=3");
    expect(html).toContain("routingBlockedCount=1");
    expect(html).toContain("inbound persistence=enabled");
    expect(html).toContain("latest inbound persistence=blocked-replay");
    expect(html).toContain("persistedInboundMessageCount=1");
    expect(html).toContain("inboundPersistenceBlockedCount=1");
    expect(html).toContain("inboundPersistenceReplayBlockedCount=1");
    expect(html).toContain("inboundPersistenceSkippedNoMatchCount=1");
    expect(html).toContain("unmatched inbound review=enabled");
    expect(html).toContain("review actions=enabled");
    expect(html).toContain("candidate lookup=enabled");
    expect(html).toContain("history audit=enabled");
    expect(html).toContain("queue export=enabled");
    expect(html).toContain("export max limit=500");
    expect(html).toContain("review metrics=enabled");
    expect(html).toContain("diagnostics=enabled");
    expect(html).toContain("review alerts=enabled");
    expect(html).toContain("queue health=enabled");
    expect(html).toContain("review triage=enabled");
    expect(html).toContain("triage guidance=enabled");
    expect(html).toContain("saved views=enabled");
    expect(html).toContain("operator notes=enabled");
    expect(html).toContain("assignment=enabled");
    expect(html).toContain("escalation=enabled");
    expect(html).toContain("assignment workload=enabled");
    expect(html).toContain("review resolution=enabled");
    expect(html).toContain("closure checklist=enabled");
    expect(html).toContain("resolution summary=enabled");
    expect(html).toContain("closure evidence=enabled");
    expect(html).toContain("closure report=enabled");
    expect(html).toContain("closure evidence export=enabled");
    expect(html).toContain("closure report export=enabled");
    expect(html).toContain("export redaction audit=enabled");
    expect(html).toContain("export integrity checks=enabled");
    expect(html).toContain("export manifest=enabled");
    expect(html).toContain("QA handoff=enabled");
    expect(html).toContain("QA locked archive=enabled");
    expect(html).toContain("QA retention manifest=enabled");
    expect(html).toContain("locked archive ready count=1");
    expect(html).toContain("locked archive exported count=0");
    expect(html).toContain("retention manifest ready count=1");
    expect(html).toContain("latest locked archive status=ready");
    expect(html).toContain("latest retention manifest status=ready");
    expect(html).toContain("saved view count=1");
    expect(html).toContain("operator note count=1");
    expect(html).toContain("unassigned open count=1");
    expect(html).toContain("assigned open count=0");
    expect(html).toContain("escalated open count=0");
    expect(html).toContain("unresolved open count=1");
    expect(html).toContain("ready for closure count=0");
    expect(html).toContain("blocked resolution count=0");
    expect(html).toContain("checklist incomplete open count=1");
    expect(html).toContain("closure evidence ready count=1");
    expect(html).toContain("closure evidence blocked count=0");
    expect(html).toContain("closure evidence incomplete count=1");
    expect(html).toContain("closure evidence export count=2");
    expect(html).toContain("closure report export count=1");
    expect(html).toContain("export redaction passed count=1");
    expect(html).toContain("export redaction warning count=0");
    expect(html).toContain("export redaction blocked count=0");
    expect(html).toContain("export manifest ready count=1");
    expect(html).toContain("export manifest needs review count=1");
    expect(html).toContain("export manifest blocked count=0");
    expect(html).toContain("latest export manifest status=ready");
    expect(html).toContain("critical alert count=1");
    expect(html).toContain("critical triage count=1");
    expect(html).toContain("open triage count=1");
    expect(html).toContain("open unmatched count=1");
    expect(html).toContain("stale open unmatched count=1");
    expect(html).toContain("unmatched queued count=2");
    expect(html).toContain("unmatched replay blocked count=1");
    expect(html).toContain("reviewed unmatched count=1");
    expect(html).toContain("skipped unmatched count=1");
    expect(html).toContain("linked unmatched count=1");
    expect(html).toContain("latest unmatched status=review-needed");
    expect(html).toContain("latest review action status=reviewed");
    expect(html).toContain("latest link status=linked");
    expect(html).toContain("replayDetectedCount=1");
    expect(html).toContain("LINE");
    expect(html).toContain("Telegram");
    expect(html).toContain("Webhook verification");
    expect(html).toContain("Webhook sandbox event log");
    expect(html).toContain("last received dry-run event");
    expect(html).toContain("message.created / received");
    expect(html).toContain("signature=verified");
    expect(html).toContain("replay=duplicate");
    expect(html).toContain("normalization=blocked-replay");
    expect(html).toContain("normalizedEventType=unknown");
    expect(html).toContain("messageType=unknown");
    expect(html).toContain("routing=blocked-replay");
    expect(html).toContain("lookup=skipped");
    expect(html).toContain("inboundPersistence=blocked-replay");
    expect(html).toContain("messagePersisted=false");
    expect(html).toContain("messageId=none");
    expect(html).toContain("unmatchedQueued=false");
    expect(html).toContain("unmatchedStatus=duplicate-skipped");
    expect(html).toContain("reviewActionStatus=none");
    expect(html).toContain("linkStatus=none");
    expect(html).toContain("unmatchedReason=blocked-replay");
    expect(html).toContain("unmatchedId=provider-webhook-unmatched-1");
    expect(html).toContain("Unmatched inbound review");
    expect(html).toContain("Provider filter");
    expect(html).toContain("Review status");
    expect(html).toContain("Link status");
    expect(html).toContain("Queue status");
    expect(html).toContain("Assigned to");
    expect(html).toContain("Assignment status");
    expect(html).toContain("Escalation status");
    expect(html).toContain("Escalation reason");
    expect(html).toContain("Resolution status");
    expect(html).toContain("Resolution outcome");
    expect(html).toContain("Closure readiness");
    expect(html).toContain("Checklist incomplete");
    expect(html).toContain("Unmatched status");
    expect(html).toContain("Event type");
    expect(html).toContain("Received from");
    expect(html).toContain("Received to");
    expect(html).toContain("Page size");
    expect(html).toContain("Sort order");
    expect(html).toContain("receivedAt oldest first");
    expect(html).toContain("Previous");
    expect(html).toContain("Next");
    expect(html).toContain("Select all visible");
    expect(html).toContain("Clear selection");
    expect(html).toContain("Bulk Mark reviewed");
    expect(html).toContain("Bulk Skip");
    expect(html).toContain("Bulk Assign to me");
    expect(html).toContain("Bulk Unassign");
    expect(html).toContain("Bulk Escalate");
    expect(html).toContain("Bulk Clear escalation");
    expect(html).toContain("Bulk Set resolution");
    expect(html).toContain("Bulk Clear resolution");
    expect(html).toContain("Bulk Complete diagnostics step");
    expect(html).toContain("Bulk Reset checklist");
    expect(html).toContain("Export current filtered queue");
    expect(html).toContain("Export CSV");
    expect(html).toContain("Export json: exportedCount=1; exportMaxLimit=500; externalCalls=0");
    expect(html).toContain("Review metrics");
    expect(html).toContain("metrics generated");
    expect(html).toContain("applied filters=provider=line;reviewStatus=pending");
    expect(html).toContain("total events");
    expect(html).toContain("open unmatched");
    expect(html).toContain("By provider");
    expect(html).toContain("By event type");
    expect(html).toContain("Open age buckets");
    expect(html).toContain("over3Days=1");
    expect(html).toContain("Safe review funnel");
    expect(html).toContain("inbound received=2");
    expect(html).toContain("Queue SLA alerts");
    expect(html).toContain("alerts generated");
    expect(html).toContain("total alerts");
    expect(html).toContain("critical");
    expect(html).toContain("stale open");
    expect(html).toContain("over SLA");
    expect(html).toContain("By severity");
    expect(html).toContain("SLA/staleness thresholds");
    expect(html).toContain("staleWarningHours=24");
    expect(html).toContain("top stale summaries");
    expect(html).toContain("critical / LINE / message.created");
    expect(html).toContain("ageBucket=over3Days");
    expect(html).toContain("Open diagnostics");
    expect(html).toContain("Triage lanes");
    expect(html).toContain("triage generated");
    expect(html).toContain("total triage items");
    expect(html).toContain("open triage items");
    expect(html).toContain("triage lanes");
    expect(html).toContain("critical lane count");
    expect(html).toContain("manual review");
    expect(html).toContain("candidate lookup");
    expect(html).toContain("safe link candidate");
    expect(html).toContain("Triage thresholds");
    expect(html).toContain("Critical stale open / critical");
    expect(html).toContain("laneKey=critical_stale_open");
    expect(html).toContain("safeDrilldownFilters=status=open");
    expect(html).toContain("OPEN_DIAGNOSTICS");
    expect(html).toContain("MARK_REVIEWED");
    expect(html).toContain("LINK_AND_PERSIST_SAFE_MESSAGE");
    expect(html).toContain("critical_stale_open / critical / LINE");
    expect(html).toContain("candidatesAvailable=true");
    expect(html).toContain("exportAvailable=true");
    expect(html).toContain("Assignment workload");
    expect(html).toContain("workload generated");
    expect(html).toContain("total workload items");
    expect(html).toContain("assigned to me");
    expect(html).toContain("escalated open");
    expect(html).toContain("By assignee");
    expect(html).toContain("Workload thresholds");
    expect(html).toContain("assignedTo=operator:current");
    expect(html).toContain("escalationReason=SLA_RISK");
    expect(html).toContain("Resolution checklist summary");
    expect(html).toContain("resolution generated");
    expect(html).toContain("total resolution items");
    expect(html).toContain("checklist incomplete");
    expect(html).toContain("By resolution status");
    expect(html).toContain("By closure readiness");
    expect(html).toContain("Closure evidence report");
    expect(html).toContain("closure report generated");
    expect(html).toContain("Export closure report");
    expect(html).toContain("Load export manifest");
    expect(html).toContain("Load QA handoff bundle");
    expect(html).toContain("Export QA handoff bundle");
    expect(html).toContain("Load QA handoff receipt");
    expect(html).toContain("Sign off QA handoff");
    expect(html).toContain("Load locked archive");
    expect(html).toContain("Export locked archive");
    expect(html).toContain("Load retention manifest");
    expect(html).toContain("Load archive integrity");
    expect(html).toContain("Load retention audit");
    expect(html).toContain("Load release evidence");
    expect(html).toContain("Verify release evidence");
    expect(html).toContain("Load release certification");
    expect(html).toContain("Load closure ledger");
    expect(html).toContain("Load attestation audit");
    expect(html).toContain("Load attestation reconciliation");
    expect(html).toContain("Load certified release gate");
    expect(html).toContain("Load certified release decision receipt");
    expect(html).toContain("Load certified release handoff packet");
    expect(html).toContain("Load certified release handoff acceptance record");
    expect(html).toContain("Acknowledge certified release handoff checklist");
    expect(html).toContain("Load certified release no-op execution dry-run");
    expect(html).toContain("Run certified release no-op execution dry-run");
    expect(html).toContain("Load certified release dry-run result ledger");
    expect(html).toContain("Load certified release final readiness certificate");
    expect(html).toContain("Load certified release freeze audit register");
    expect(html).toContain("Load certified release rollback rehearsal receipt");
    expect(html).toContain("Load certified release control room packet");
    expect(html).toContain("Load certified release cutover checklist receipt");
    expect(html).toContain("Load certified release operator command receipt");
    expect(html).toContain("Load certified release go-live authorization receipt");
    expect(html).toContain("Closure report export json: totalItems=1; evidenceReadyCount=1; safeFilename=provider-webhook-review-closure-report.json; externalCalls=0");
    expect(html).toContain("Closure report export manifest: target=closure-report-export; totalItems=1; redaction=passed; integrity=confirmed; manual QA readiness=ready; safeFilename=provider-webhook-review-closure-report.json; safeDigest=sha256:safeauditdigest; externalCalls=0");
    expect(html).toContain("QA handoff bundle: readiness=ready; totalItems=1; evidenceManifests=1; safeFilename=provider-webhook-review-qa-handoff-bundle.json; safeDigest=sha256:safeqahandoffbundle; externalCalls=0");
    expect(html).toContain("QA handoff bundle export: status=ready; totalItems=1; evidenceManifests=1; safeFilename=provider-webhook-review-qa-handoff-bundle-export.json; safeDigest=sha256:safeqahandoffbundleexport; externalCalls=0");
    expect(html).toContain("QA handoff receipt: receiptStatus=not_acknowledged; bundleStatus=ready; exportStatus=ready; totalItems=1; safeFilename=provider-webhook-review-qa-handoff-receipt.json; safeDigest=sha256:safeqahandoffreceipt; bundleDigest=sha256:safeqahandoffbundle; exportDigest=sha256:safeqahandoffbundleexport; reviewer=none; signedAt=none; externalCalls=0");
    expect(html).toContain("QA handoff sign-off: signOffStatus=signed_off; action=sign_off; recordId=provider-webhook-qa-handoff-signoff-1; safeDigest=sha256:safeqahandoffreceiptsigned; signedAt=2026-05-21T04:00:00.000Z; externalCalls=0");
    expect(html).toContain("QA handoff locked archive: lockedArchiveStatus=ready; retentionManifestStatus=ready; archiveAcknowledgementStatus=not_exported; safeFilename=provider-webhook-review-qa-handoff-locked-archive.json; safeDigest=sha256:safeqahandofflockedarchive; lockedItems=1; totalItems=1; externalCalls=0");
    expect(html).toContain("QA handoff locked archive export: status=exported; exportKind=qa-handoff-locked-archive; safeFilename=provider-webhook-review-qa-handoff-locked-archive-export.json; safeDigest=sha256:safeqahandofflockedarchiveexport; exportedAt=2026-06-04T00:08:00.000Z; externalCalls=0");
    expect(html).toContain("QA handoff retention manifest: retentionManifestStatus=ready; retentionReadiness=ready; safeFilename=provider-webhook-review-qa-handoff-locked-archive-retention-manifest.json; safeDigest=sha256:safeqahandoffretentionmanifest; archiveDigest=sha256:safeqahandofflockedarchive; externalCalls=0");
    expect(html).toContain("QA archive integrity: integrityStatus=confirmed; retentionAuditStatus=confirmed; lockedArchiveStatus=exported; retentionManifestStatus=ready; digestChainStatus=confirmed; safeFilename=provider-webhook-review-qa-handoff-locked-archive-integrity.json; safeDigest=sha256:safeqahandoffarchiveintegrity; externalCalls=0");
    expect(html).toContain("QA retention audit: retentionPolicyStatus=active; retentionAuditStatus=confirmed; retentionManifestStatus=ready; lockedArchiveStatus=exported; digestChainStatus=confirmed; safeFilename=provider-webhook-review-qa-handoff-retention-audit.json; safeDigest=sha256:safeqahandoffretentionaudit; externalCalls=0");
    expect(html).toContain("QA archive release evidence: releaseReadinessStatus=ready_for_release; qaHandoffBundleReady=true; qaHandoffExportReady=true; receiptSignedOff=true; acceptanceLocked=true; lockedArchiveExported=true; retentionManifestReady=true; archiveIntegrityConfirmed=true; retentionAuditConfirmed=true; finalizationSignedOff=true; finalizationReceiptReady=true; digestChainStatus=confirmed; safeFilename=provider-webhook-review-qa-handoff-archive-release-evidence-pack.json; safeDigest=sha256:safeqahandoffarchivereleaseevidence; totalItems=1; prerequisites=16/16; externalCalls=0");
    expect(html).toContain("QA archive release verification: verificationStatus=verified; releaseReadinessStatus=ready_for_release; digestChainStatus=confirmed; prerequisites=16/16; digestRows=10/10; safeFilename=provider-webhook-review-qa-handoff-archive-release-verification-matrix.json; safeDigest=sha256:safeqahandoffarchivereleaseverification; releaseEvidenceDigest=sha256:safeqahandoffarchivereleaseevidence; totalItems=1; externalCalls=0");
    expect(html).toContain("QA archive release certification: certificationStatus=certified; releaseReadinessStatus=ready_for_release; verificationStatus=verified; digestChainStatus=confirmed; safeFilename=provider-webhook-review-qa-handoff-archive-release-certification-receipt.json; safeDigest=sha256:safeqahandoffarchivereleasecertification; releaseEvidenceDigest=sha256:safeqahandoffarchivereleaseevidence; releaseVerificationDigest=sha256:safeqahandoffarchivereleaseverification; certificationChecks=13/13; digestRows=10/10; totalItems=1; externalCalls=0");
    expect(html).toContain("QA archive release closure ledger: ledgerStatus=certified_release_closed; certificationStatus=certified; releaseReadinessStatus=ready_for_release; verificationStatus=verified; digestChainStatus=confirmed; safeFilename=provider-webhook-review-qa-handoff-archive-release-closure-ledger.json; safeDigest=sha256:safeqahandoffarchivereleaseclosureledger; releaseCertificationDigest=sha256:safeqahandoffarchivereleasecertification; ledgerRows=5/5; prerequisites=16/16; certificationChecks=13/13; closureLedgerCheckedCount=1; externalCalls=0");
    expect(html).toContain("QA archive release attestation audit: attestationStatus=complete; ledgerStatus=certified_release_closed; certificationStatus=certified; releaseReadinessStatus=ready_for_release; verificationStatus=verified; digestChainStatus=confirmed; safeFilename=provider-webhook-review-qa-handoff-archive-release-attestation-audit.json; safeDigest=sha256:safeqahandoffarchivereleaseattestationaudit; closureLedgerDigest=sha256:safeqahandoffarchivereleaseclosureledger; attestationRows=7/7; prerequisites=16/16; certificationChecks=13/13; attestationAuditCheckedCount=1; externalCalls=0");
    expect(html).toContain("QA archive release attestation reconciliation: reconciliationStatus=aligned; attestationStatus=complete; ledgerStatus=certified_release_closed; certificationStatus=certified; releaseReadinessStatus=ready_for_release; verificationStatus=verified; digestChainStatus=confirmed; safeFilename=provider-webhook-review-qa-handoff-archive-release-attestation-reconciliation.json; safeDigest=sha256:safeqahandoffarchivereleaseattestationreconciliation; attestationAuditDigest=sha256:safeqahandoffarchivereleaseattestationaudit; reconciliationDigest=sha256:safeqahandoffarchivereleaseattestationreconciliation; reconciliationRows=8/8; exceptions=0; prerequisites=16/16; certificationChecks=13/13; reconciliationCheckedCount=1; externalCalls=0");
    expect(html).toContain("QA archive certified release gate: gateStatus=ready; goNoGoDecision=go; releaseReadinessStatus=ready_for_release; reconciliationStatus=aligned; attestationStatus=complete; ledgerStatus=certified_release_closed; certificationStatus=certified; verificationStatus=verified; digestChainStatus=confirmed; safeFilename=provider-webhook-review-qa-handoff-certified-release-gate.json; safeDigest=sha256:safeqahandoffcertifiedreleasegate; releaseGateDigest=sha256:safeqahandoffcertifiedreleasegate; reconciliationDigest=sha256:safeqahandoffarchivereleaseattestationreconciliation; gateChecklist=12/12; blockingReasons=0; blockingReasonCodes=none; exceptions=0; gateCheckedCount=1; externalCalls=0");
    expect(html).toContain("QA archive certified release decision receipt: receiptStatus=issued; releaseDecision=go; gateStatus=ready; goNoGoDecision=go; releaseReadinessStatus=ready_for_release; reconciliationStatus=aligned; attestationStatus=complete; ledgerStatus=certified_release_closed; certificationStatus=certified; verificationStatus=verified; digestChainStatus=confirmed; safeFilename=provider-webhook-review-qa-handoff-certified-release-decision-receipt.json; safeDigest=sha256:safeqahandoffcertifiedreleasedecisionreceipt; decisionReceiptDigest=sha256:safeqahandoffcertifiedreleasedecisionreceipt; releaseGateDigest=sha256:safeqahandoffcertifiedreleasegate; receiptRows=13/13; gateChecklist=12/12; blockingReasons=0; blockingReasonCodes=none; exceptions=0; decisionReceiptCheckedCount=1; externalCalls=0");
    expect(html).toContain("QA archive certified release handoff packet: packetStatus=issued; handoffStatus=ready; releaseDecision=go; receiptStatus=issued; gateStatus=ready; goNoGoDecision=go; releaseReadinessStatus=ready_for_release; reconciliationStatus=aligned; attestationStatus=complete; ledgerStatus=certified_release_closed; certificationStatus=certified; verificationStatus=verified; digestChainStatus=confirmed; safeFilename=provider-webhook-review-qa-handoff-certified-release-handoff-packet.json; safeDigest=sha256:safeqahandoffcertifiedreleasehandoffpacket; handoffPacketDigest=sha256:safeqahandoffcertifiedreleasehandoffpacket; decisionReceiptDigest=sha256:safeqahandoffcertifiedreleasedecisionreceipt; releaseGateDigest=sha256:safeqahandoffcertifiedreleasegate; handoffRows=16/16; runbookRows=6/6; operatorChecklist=7/7; operatorChecklistItems=decision_receipt_issued:complete,release_gate_ready:complete,no_blocking_reasons:complete,no_exceptions:complete,external_calls_zero:complete,provider_outbound_absent:complete,source_material_absent:complete; runbookRowStatuses=confirm_decision_receipt:ready,confirm_release_gate:ready,confirm_operator_checklist:ready,release_handoff:ready,monitor_release:ready,exception_hold:ready; blockingReasons=0; blockingReasonCodes=none; exceptions=0; releaseOwner=release owner; handoffPacketCheckedCount=1; externalCalls=0");
    expect(html).toContain("QA archive certified release handoff acceptance record: acceptanceStatus=acknowledged; handoffStatus=ready; releaseDecision=go; packetStatus=issued; receiptStatus=issued; gateStatus=ready; goNoGoDecision=go; releaseReadinessStatus=ready_for_release; reconciliationStatus=aligned; attestationStatus=complete; ledgerStatus=certified_release_closed; certificationStatus=certified; verificationStatus=verified; digestChainStatus=confirmed; safeFilename=provider-webhook-review-qa-handoff-certified-release-handoff-acceptance-record.json; safeDigest=sha256:safeqahandoffcertifiedreleasehandoffacceptance; acceptanceRecordDigest=sha256:safeqahandoffcertifiedreleasehandoffacceptance; handoffPacketDigest=sha256:safeqahandoffcertifiedreleasehandoffpacket; decisionReceiptDigest=sha256:safeqahandoffcertifiedreleasedecisionreceipt; releaseGateDigest=sha256:safeqahandoffcertifiedreleasegate; operatorChecklist=7/7; operatorChecklistItems=decision_receipt_issued:complete,release_gate_ready:complete,no_blocking_reasons:complete,no_exceptions:complete,external_calls_zero:complete,provider_outbound_absent:complete,source_material_absent:complete; acknowledgedChecklist=7/7; acknowledgedChecklistItems=decision_receipt_issued:acknowledged,release_gate_ready:acknowledged,no_blocking_reasons:acknowledged,no_exceptions:acknowledged,external_calls_zero:acknowledged,provider_outbound_absent:acknowledged,source_material_absent:acknowledged; acknowledgementRows=7/7; acknowledgementRowStatuses=handoff_packet:acknowledged,operator_checklist:acknowledged,release_owner:acknowledged,external_calls:acknowledged,safe_source_material:acknowledged,blocking_reasons:acknowledged,exceptions:acknowledged; handoffPacketSummary=issued/ready; decisionReceiptExternalCallsZero=true; blockingReasons=0; blockingReasonCodes=none; exceptions=0; releaseOwner=release owner; operatorChecklistAcknowledged=true; acceptanceRecordCheckedCount=1; acceptanceRecordMutationCount=1; externalCalls=0");
    expect(html).toContain("QA archive certified release no-op execution dry-run: dryRunStatus=passed; executionMode=no_op; acceptanceStatus=acknowledged; handoffStatus=ready; releaseDecision=go; packetStatus=issued; receiptStatus=issued; gateStatus=ready; goNoGoDecision=go");
    expect(html).toContain("safeFilename=provider-webhook-review-qa-handoff-certified-release-noop-execution-dryrun.json");
    expect(html).toContain("noopExecutionDryRunDigest=sha256:safeqahandoffcertifiedreleasenoopdryrun");
    expect(html).toContain("executionChecklist=8/8");
    expect(html).toContain("dryRunRows=3/3");
    expect(html).toContain("executionPlanRows=7/7");
    expect(html).toContain("checklistAcknowledged=true");
    expect(html).toContain("noopExecutionDryRunMutationCount=1");
    expect(html).toContain("QA archive certified release dry-run result ledger: ledgerStatus=recorded; dryRunStatus=passed; executionMode=no_op; acceptanceStatus=acknowledged; handoffStatus=ready; releaseDecision=go; packetStatus=issued; receiptStatus=issued; gateStatus=ready; goNoGoDecision=go");
    expect(html).toContain("safeFilename=provider-webhook-review-qa-handoff-certified-release-dryrun-result-ledger.json");
    expect(html).toContain("dryRunResultLedgerDigest=sha256:safeqahandoffcertifiedreleasedryrunresultledger");
    expect(html).toContain("resultLedgerRows=12/12");
    expect(html).toContain("finalReadinessRows=9/9");
    expect(html).toContain("dryRunResultLedgerMutationCount=0");
    expect(html).toContain("QA archive certified release final readiness certificate: certificateStatus=issued; finalReadinessStatus=ready; ledgerStatus=recorded; dryRunStatus=passed; executionMode=no_op; acceptanceStatus=acknowledged; handoffStatus=ready; releaseDecision=go");
    expect(html).toContain("safeFilename=provider-webhook-review-qa-handoff-certified-release-final-readiness-certificate.json");
    expect(html).toContain("finalReadinessCertificateDigest=sha256:safeqahandoffcertifiedreleasefinalreadinesscertificate");
    expect(html).toContain("certificateRows=3/3");
    expect(html).toContain("finalReadinessCertificateMutationCount=0");
    expect(html).toContain("QA archive certified release freeze audit register: freezeAuditStatus=recorded; freezeStatus=frozen; rollbackReadinessStatus=ready; certificateStatus=issued; finalReadinessStatus=ready; ledgerStatus=recorded; dryRunStatus=passed; executionMode=no_op; releaseDecision=go");
    expect(html).toContain("safeFilename=provider-webhook-review-qa-handoff-certified-release-freeze-audit-register.json");
    expect(html).toContain("freezeAuditRows=5/5");
    expect(html).toContain("rollbackPlanRows=5/5");
    expect(html).toContain("freezeAuditRegisterMutationCount=0");
    expect(html).toContain("QA archive certified release rollback rehearsal receipt: rollbackRehearsalStatus=verified; recoveryReadinessStatus=ready; rollbackReadinessStatus=ready; freezeAuditStatus=recorded; freezeStatus=frozen; certificateStatus=issued; finalReadinessStatus=ready; ledgerStatus=recorded; dryRunStatus=passed; executionMode=no_op");
    expect(html).toContain("safeFilename=provider-webhook-review-qa-handoff-certified-release-rollback-rehearsal-receipt.json");
    expect(html).toContain("freezeSnapshotRows=3/3");
    expect(html).toContain("rollbackReadinessRows=3/3");
    expect(html).toContain("rollbackRehearsalRows=4/4");
    expect(html).toContain("recoveryReadinessRows=3/3");
    expect(html).toContain("rollbackRehearsalReceiptMutationCount=0");
    expect(html).toContain("QA archive certified release control room packet: controlRoomStatus=ready; cutoverReadinessStatus=ready; rollbackRehearsalStatus=verified; recoveryReadinessStatus=ready; rollbackReadinessStatus=ready; freezeAuditStatus=recorded; freezeStatus=frozen; certificateStatus=issued; finalReadinessStatus=ready; ledgerStatus=recorded; dryRunStatus=passed; executionMode=no_op");
    expect(html).toContain("safeFilename=provider-webhook-review-qa-handoff-certified-release-control-room-packet.json");
    expect(html).toContain("controlRoomRows=5/5");
    expect(html).toContain("cutoverChecklistRows=5/5");
    expect(html).toContain("operatorHandoffRows=5/5");
    expect(html).toContain("controlRoomPacketMutationCount=0");
    expect(html).toContain("QA archive certified release cutover checklist receipt: cutoverChecklistStatus=verified; operatorCommandStatus=ready; controlRoomStatus=ready; cutoverReadinessStatus=ready; rollbackRehearsalStatus=verified; recoveryReadinessStatus=ready; rollbackReadinessStatus=ready; freezeAuditStatus=recorded; freezeStatus=frozen; certificateStatus=issued; finalReadinessStatus=ready; ledgerStatus=recorded; dryRunStatus=passed; executionMode=no_op");
    expect(html).toContain("safeFilename=provider-webhook-review-qa-handoff-certified-release-cutover-checklist-receipt.json");
    expect(html).toContain("cutoverChecklistReceiptDigest=sha256:safeqahandoffcertifiedreleasecutoverchecklistreceipt");
    expect(html).toContain("operatorCommandRows=6/6");
    expect(html).toContain("safeCutoverChecklistRows=14/14");
    expect(html).toContain("cutoverChecklistReceiptMutationCount=0");
    expect(html).toContain("QA archive certified release operator command receipt: operatorCommandReceiptStatus=issued; goLiveAuthorizationStatus=ready; cutoverChecklistStatus=verified; operatorCommandStatus=ready; controlRoomStatus=ready; cutoverReadinessStatus=ready");
    expect(html).toContain("safeFilename=provider-webhook-review-qa-handoff-certified-release-operator-command-receipt.json");
    expect(html).toContain("operatorCommandReceiptDigest=sha256:safeqahandoffcertifiedreleaseoperatorcommandreceipt");
    expect(html).toContain("goLiveAuthorizationRows=3/3");
    expect(html).toContain("operatorCommandReceiptRows=2/2");
    expect(html).toContain("commandHandoffRows=2/2");
    expect(html).toContain("operatorCommandReceiptMutationCount=0");
    expect(html).toContain("QA archive certified release go-live authorization receipt: goLiveAuthorizationReceiptStatus=issued; goLiveAuthorizationStatus=ready; launchWindowStatus=ready; safeLaunchWindowStatus=ready; operatorCommandReceiptStatus=issued; operatorCommandStatus=ready");
    expect(html).toContain("safeFilename=provider-webhook-review-qa-handoff-certified-release-go-live-authorization-receipt.json");
    expect(html).toContain("goLiveAuthorizationReceiptDigest=sha256:safeqahandoffcertifiedreleasegoliveauthorizationreceipt");
    expect(html).toContain("goLiveAuthorizationReceiptRows=2/2");
    expect(html).toContain("launchWindowRows=2/2");
    expect(html).toContain("safeLaunchWindowRows=2/2");
    expect(html).toContain("goLiveAuthorizationReceiptMutationCount=0");
    expect(html).toContain("Load certified release launch window confirmation receipt");
    expect(html).toContain("QA archive certified release launch window confirmation receipt: launchWindowConfirmationStatus=confirmed; goLiveHoldStatus=ready; goLiveAuthorizationReceiptStatus=issued; goLiveAuthorizationStatus=ready; launchWindowStatus=ready; safeLaunchWindowStatus=ready; operatorCommandReceiptStatus=issued; operatorCommandStatus=ready; cutoverChecklistStatus=verified; controlRoomStatus=ready; cutoverReadinessStatus=ready; externalCalls=0");
    expect(html).toContain("safeFilename=provider-webhook-review-qa-handoff-certified-release-launch-window-confirmation-receipt.json");
    expect(html).toContain("launchWindowConfirmationReceiptDigest=sha256:safeqahandoffcertifiedreleaselaunchwindowconfirmationreceipt");
    expect(html).toContain("launchWindowConfirmationRows=2/2");
    expect(html).toContain("goLiveHoldRows=2/2");
    expect(html).toContain("launchWindowConfirmationReceiptMutationCount=0");
    expect(html).toContain("Load certified release go-live hold release authorization receipt");
    expect(html).toContain("Load certified release launch approval receipt");
    expect(html).toContain("QA archive certified release go-live hold release authorization receipt: goLiveHoldReleaseAuthorizationStatus=authorized; launchApprovalStatus=ready; launchWindowConfirmationStatus=confirmed; goLiveHoldStatus=ready; goLiveAuthorizationReceiptStatus=issued; goLiveAuthorizationStatus=ready; launchWindowStatus=ready; safeLaunchWindowStatus=ready; externalCalls=0");
    expect(html).toContain("QA archive certified release launch approval receipt: launchApprovalReceiptStatus=issued; noExecutionGuardStatus=retained; launchApprovalStatus=ready; goLiveHoldReleaseAuthorizationStatus=authorized; launchWindowConfirmationStatus=confirmed; goLiveHoldStatus=ready; goLiveAuthorizationReceiptStatus=issued; goLiveAuthorizationStatus=ready; launchWindowStatus=ready; safeLaunchWindowStatus=ready; executionMode=no_op; externalCalls=0");
    expect(html).toContain("safeFilename=provider-webhook-review-qa-handoff-certified-release-go-live-hold-release-authorization-receipt.json");
    expect(html).toContain("goLiveHoldReleaseAuthorizationReceiptDigest=sha256:safeqahandoffcertifiedreleasegoliveholdreleaseauthorizationreceipt");
    expect(html).toContain("goLiveHoldReleaseAuthorizationRows=2/2");
    expect(html).toContain("launchApprovalRows=3/3");
    expect(html).toContain("goLiveHoldReleaseAuthorizationReceiptMutationCount=0");
    expect(html).toContain("QA archive integrity digest chain");
    expect(html).toContain("digestChainLinkCount=6");
    expect(html).toContain("QA retention audit checklist");
    expect(html).toContain("auditChecklistPassedCount=3");
    expect(html).toContain("QA handoff export readiness");
    expect(html).toContain("QA handoff export safety");
    expect(html).toContain("reportManifestReady=true");
    expect(html).toContain("reportRedactionPassedOrWarned=true");
    expect(html).toContain("reportIntegrityConfirmed=true");
    expect(html).toContain("providerOutboundAbsent=true");
    expect(html).toContain("externalCallsZero=true");
    expect(html).toContain("safeFilename=provider-webhook-closure-evidence-line-provider-webhook-unmatched-1.json");
    expect(html).toContain("safeDigest=sha256:safeauditdigest");
    expect(html).toContain("Audit report export redaction");
    expect(html).toContain("Check export integrity");
    expect(html).toContain("Closure report redaction audit status=passed");
    expect(html).toContain("rawPayloadAbsent=true");
    expect(html).toContain("tokenAbsent=true");
    expect(html).toContain("replyTokenAbsent=true");
    expect(html).toContain("rawSenderIdAbsent=true");
    expect(html).toContain("rawRoomIdAbsent=true");
    expect(html).toContain("Export integrity: totalCheckedItems=1; passed=1; warning=0; blocked=0; deterministic=true; externalCalls=0");
    expect(html).toContain("redaction passed");
    expect(html).toContain("redaction warning");
    expect(html).toContain("redaction blocked");
    expect(html).toContain("total evidence items");
    expect(html).toContain("evidence ready");
    expect(html).toContain("evidence blocked");
    expect(html).toContain("evidence incomplete");
    expect(html).toContain("By incomplete checklist step");
    expect(html).toContain("ready / READY_FOR_REVIEW / LINE");
    expect(html).toContain("evidenceStatus=ready");
    expect(html).toContain("noProviderOutboundConfirmed=true");
    expect(html).toContain("noRawLeakageConfirmed=true");
    expect(html).toContain("safeLinkTargetConfirmed=true");
    expect(html).toContain("recommendedNextActions=VIEW_HISTORY|RUN_CANDIDATE_LOOKUP|ADD_OPERATOR_NOTE");
    expect(html).toContain("Run candidate lookup");
    expect(html).toContain("visible unmatched count=1");
    expect(html).toContain("total unmatched count=12");
    expect(html).toContain("page size=5");
    expect(html).toContain("page offset=5");
    expect(html).toContain("applied sort=receivedAt asc");
    expect(html).toContain("selected count=0");
    expect(html).toContain("filtered open count=4");
    expect(html).toContain("visible open count=1");
    expect(html).toContain("LINE unmatched inbound");
    expect(html).toContain("safe-review-required-no-conversation-match");
    expect(html).toContain("reviewStatus=pending");
    expect(html).toContain("assignmentStatus=unassigned");
    expect(html).toContain("assignedTo=none");
    expect(html).toContain("escalationStatus=none");
    expect(html).toContain("resolutionStatus=unresolved");
    expect(html).toContain("resolutionOutcome=none");
    expect(html).toContain("closureReadiness=NOT_READY");
    expect(html).toContain("checklist=1/9");
    expect(html).toContain("Mark reviewed");
    expect(html).toContain("Skip");
    expect(html).toContain("Assign to me");
    expect(html).toContain("Assign queue lead");
    expect(html).toContain("Unassign");
    expect(html).toContain("Escalate SLA risk");
    expect(html).toContain("Clear escalation");
    expect(html).toContain("Set needs review");
    expect(html).toContain("Set safe match");
    expect(html).toContain("Set blocked unsafe");
    expect(html).toContain("Clear resolution");
    expect(html).toContain("Reset checklist");
    expect(html).toContain("VIEWED_DIAGNOSTICS");
    expect(html).toContain("Complete");
    expect(html).toContain("Uncomplete");
    expect(html).toContain("Load candidates");
    expect(html).toContain("View diagnostics");
    expect(html).toContain("View closure evidence");
    expect(html).toContain("Export closure evidence");
    expect(html).toContain("Load evidence manifest");
    expect(html).toContain("Audit evidence export redaction");
    expect(html).toContain("evidenceExport=closure-evidence; externalCalls=0");
    expect(html).toContain("evidenceManifest=ready; externalCalls=0");
    expect(html).toContain("evidenceRedactionAudit=passed; externalCalls=0");
    expect(html).toContain("Safe closure evidence");
    expect(html).toContain("Safe closure evidence export");
    expect(html).toContain("Safe closure evidence export manifest");
    expect(html).toContain("exportKind=closure-evidence");
    expect(html).toContain("manual QA readiness=ready");
    expect(html).toContain("integrity=confirmed");
    expect(html).toContain("safeFilename=provider-webhook-closure-evidence-line-provider-webhook-unmatched-1.json");
    expect(html).toContain("Closure evidence redaction audit");
    expect(html).toContain("auditTarget=closure-evidence-export");
    expect(html).toContain("exportShapeVersion=provider-webhook-closure-export-v1");
    expect(html).toContain("Closure evidence");
    expect(html).toContain("historyEntryCount=3");
    expect(html).toContain("operatorNoteCount=2");
    expect(html).toContain("candidateSummaryCount=1");
    expect(html).toContain("diagnostics warnings=2");
    expect(html).toContain("Safe diagnostics");
    expect(html).toContain("routingOutcome=dry-run-only/not-found");
    expect(html).toContain("candidateLookupAvailable=true");
    expect(html).toContain("missingConversationMatch");
    expect(html).toContain("staleOpenItem");
    expect(html).toContain("View history");
    expect(html).toContain("history entries=3");
    expect(html).toContain("inbound_received / received");
    expect(html).toContain("normalized_routed / normalized/dry-run-only");
    expect(html).toContain("unmatched_queued / review-needed");
    expect(html).toContain("safeRoomLabel=line room digest saferoomdige");
    expect(html).toContain("roomKeyDigest=sha256:saferoomdigest");
    expect(html).toContain("candidate count=1");
    expect(html).toContain("conversationId=conversation-safe-internal");
    expect(html).toContain("roomIdDigest=sha256:saferoomdigest");
    expect(html).toContain("matchReason=platform, channel account, and room digest match");
    expect(html).toContain("Link only");
    expect(html).toContain("Link + persist safe message");
    expect(html).toContain("reviewed; externalCalls=0");
    expect(html).toContain("payloadFieldCount=2");
    expect(html).toContain("payloadDigest=sha256:safeeventdigest");
    expect(html).toContain("signatureVerified=true");
    expect(html).toContain("replayDetected=true");
    expect(html).toContain("conversationKeyDigest=none");
    expect(html).toContain("roomIdDigest=none");
    expect(html).toContain("inboundAuditStatus=recorded");
    expect(html).toContain("Saved review views");
    expect(html).toContain("Save current filters");
    expect(html).toContain("Safe queue view");
    expect(html).toContain("filters=provider=line;reviewStatus=pending;linkStatus=none;unmatchedStatus=review-needed;eventType=message.created;severity=info;triageLane=safe_link_candidate_available;assignedTo=me;assignmentStatus=assigned_to_me;escalationStatus=escalated;escalationReason=SLA_RISK;resolutionStatus=unresolved;resolutionOutcome=NEEDS_REVIEW;closureReadiness=NOT_READY;checklistIncomplete=true;pageSize=10");
    expect(html).toContain("sort=receivedAt desc");
    expect(html).toContain("Apply saved view");
    expect(html).toContain("Archive");
    expect(html).toContain("Saved view Safe queue view; externalCalls=0");
    expect(html).toContain("Operator notes");
    expect(html).toContain("Load operator notes");
    expect(html).toContain("Add note");
    expect(html).toContain("note count=1");
    expect(html).toContain("note /");
    expect(html).toContain("Checked safely with local context only.");
    expect(html).toContain("configured");
    expect(html).not.toContain("U-raw-provider-test");
    expect(html).not.toContain("raw-line-token");
    expect(html).not.toContain("raw-line-token");
    expect(html).not.toMatch(/channel secret|webhook secret value|providerRaw|payloadJson|Bearer|sk-|accessToken|webhookSecret/i);
  });

  it("renders multi-select and disabled empty bulk actions safely", () => {
    const html = renderToString(React.createElement(ProviderReadinessPanel, {
      readiness: providerReadiness(),
      loading: false,
      error: "",
      unmatchedInboundItems: [providerWebhookUnmatchedInboundItem()],
      selectedUnmatchedIds: [],
      onUnmatchedSelectionChange: async () => undefined,
      onBulkReviewUnmatchedInbound: async () => undefined
    }));

    expect(html).toContain("Select all visible");
    expect(html).toContain("selected count=0");
    expect(html).toContain("Bulk Mark reviewed");
    expect(html).toContain("Bulk Skip");
    expect(html).toContain("disabled");
    expect(html).not.toMatch(/rawPayload|providerRaw|payloadJson|replyToken|raw sender|raw room/i);
  });

  it("renders safe per-item bulk results", () => {
    const html = renderToString(React.createElement(ProviderReadinessPanel, {
      readiness: providerReadiness(),
      loading: false,
      error: "",
      unmatchedInboundItems: [providerWebhookUnmatchedInboundItem()],
      selectedUnmatchedIds: ["provider-webhook-unmatched-1"],
      unmatchedBulkResult: providerWebhookBulkReviewResult()
    }));

    expect(html).toContain("provider-webhook-unmatched-1: updated");
    expect(html).toContain("reviewStatus=reviewed");
    expect(html).toContain("unmatchedStatus=reviewed");
    expect(html).toContain("externalCalls=0");
    expect(html).not.toMatch(/rawPayload|providerRaw|payloadJson|replyToken|raw sender|raw room/i);
  });

  it("renders an API error state without fake provider rows", () => {
    const html = renderToString(React.createElement(ProviderReadinessPanel, {
      readiness: null,
      loading: false,
      error: "Provider Readiness API error: Failed to fetch"
    }));

    expect(html).toContain("Provider Readiness API error: Failed to fetch");
    expect(html).not.toContain("Credential");
    expect(html).not.toContain("allowlist count=");
  });

  it("renders a webhook API error state without fake event rows", () => {
    const html = renderToString(React.createElement(ProviderReadinessPanel, {
      readiness: providerReadiness(),
      loading: false,
      error: "",
      webhookEvents: [],
      webhookEventsLoading: false,
      webhookEventsError: "Webhook Events API error: Failed to fetch",
      reviewMetrics: null,
      reviewMetricsLoading: false,
      reviewMetricsError: "Review Metrics API error: Failed to fetch",
      reviewAlerts: null,
      reviewAlertsLoading: false,
      reviewAlertsError: "Review Alerts API error: Failed to fetch",
      reviewTriage: null,
      reviewTriageLoading: false,
      reviewTriageError: "Triage Guidance API error: Failed to fetch",
      reviewClosureReport: null,
      reviewClosureReportLoading: false,
      reviewClosureReportError: "Closure Evidence / Report API error: Failed to fetch",
      reviewClosureReportExport: null,
      reviewClosureReportExportLoading: false,
      reviewClosureReportExportError: "Closure Report Export API error: Failed to fetch",
      reviewClosureReportExportManifest: null,
      reviewClosureReportExportManifestLoading: false,
      reviewClosureReportExportManifestError: "Closure Report Export Manifest API error: Failed to fetch",
      reviewQaHandoffBundle: null,
      reviewQaHandoffBundleLoading: false,
      reviewQaHandoffBundleError: "QA Handoff Bundle API error: Failed to fetch",
      reviewQaHandoffBundleExport: null,
      reviewQaHandoffBundleExportLoading: false,
      reviewQaHandoffBundleExportError: "QA Handoff Bundle Export API error: Failed to fetch",
      reviewQaHandoffReceipt: null,
      reviewQaHandoffReceiptLoading: false,
      reviewQaHandoffReceiptError: "QA Handoff Receipt API error: Failed to fetch",
      reviewQaHandoffSignOff: null,
      reviewQaHandoffSignOffLoading: false,
      reviewQaHandoffSignOffError: "QA Handoff Sign-off API error: Failed to fetch",
      reviewQaHandoffArchiveIntegrity: null,
      reviewQaHandoffArchiveIntegrityLoading: false,
      reviewQaHandoffArchiveIntegrityError: "QA Archive Integrity API error: Failed to fetch",
      reviewQaHandoffRetentionAudit: null,
      reviewQaHandoffRetentionAuditLoading: false,
      reviewQaHandoffRetentionAuditError: "QA Retention Audit API error: Failed to fetch",
      reviewQaHandoffArchiveReleaseEvidence: null,
      reviewQaHandoffArchiveReleaseEvidenceLoading: false,
      reviewQaHandoffArchiveReleaseEvidenceError: "QA Archive Release Evidence API error: Failed to fetch",
      reviewQaHandoffArchiveReleaseVerification: null,
      reviewQaHandoffArchiveReleaseVerificationLoading: false,
      reviewQaHandoffArchiveReleaseVerificationError: "QA Archive Release Verification API error: Failed to fetch",
      reviewQaHandoffArchiveReleaseCertification: null,
      reviewQaHandoffArchiveReleaseCertificationLoading: false,
      reviewQaHandoffArchiveReleaseCertificationError: "QA Archive Release Certification API error: Failed to fetch",
      reviewQaHandoffArchiveReleaseClosureLedger: null,
      reviewQaHandoffArchiveReleaseClosureLedgerLoading: false,
      reviewQaHandoffArchiveReleaseClosureLedgerError: "QA Archive Release Closure Ledger API error: Failed to fetch",
      reviewQaHandoffArchiveReleaseAttestationAudit: null,
      reviewQaHandoffArchiveReleaseAttestationAuditLoading: false,
      reviewQaHandoffArchiveReleaseAttestationAuditError: "QA Archive Release Attestation Audit API error: Failed to fetch",
      reviewQaHandoffArchiveReleaseAttestationReconciliation: null,
      reviewQaHandoffArchiveReleaseAttestationReconciliationLoading: false,
      reviewQaHandoffArchiveReleaseAttestationReconciliationError: "QA Archive Release Attestation Reconciliation API error: Failed to fetch",
      reviewQaHandoffCertifiedReleaseGate: null,
      reviewQaHandoffCertifiedReleaseGateLoading: false,
      reviewQaHandoffCertifiedReleaseGateError: "QA Archive Certified Release Gate API error: Failed to fetch",
      reviewQaHandoffCertifiedReleaseDecisionReceipt: null,
      reviewQaHandoffCertifiedReleaseDecisionReceiptLoading: false,
      reviewQaHandoffCertifiedReleaseDecisionReceiptError: "QA Archive Certified Release Decision Receipt API error: Failed to fetch",
      reviewQaHandoffCertifiedReleaseHandoffPacket: null,
      reviewQaHandoffCertifiedReleaseHandoffPacketLoading: false,
      reviewQaHandoffCertifiedReleaseHandoffPacketError: "QA Archive Certified Release Handoff Packet API error: Failed to fetch",
      reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord: null,
      reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordLoading: false,
      reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordAcknowledging: false,
      reviewQaHandoffCertifiedReleaseHandoffAcceptanceRecordError: "QA Archive Certified Release Handoff Acceptance Record API error: Failed to fetch",
      reviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt: null,
      reviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptLoading: false,
      reviewQaHandoffCertifiedReleaseRollbackRehearsalReceiptError: "QA Archive Certified Release Rollback Rehearsal Receipt API error: Failed to fetch",
      reviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceipt: null,
      reviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceiptLoading: false,
      reviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceiptError: "QA Archive Certified Release Go-Live Hold Release Authorization Receipt API error: Failed to fetch",
      reviewQaHandoffCertifiedReleaseLaunchApprovalReceipt: null,
      reviewQaHandoffCertifiedReleaseLaunchApprovalReceiptLoading: false,
      reviewQaHandoffCertifiedReleaseLaunchApprovalReceiptError: "QA Archive Certified Release Launch Approval Receipt API error: Failed to fetch",
      reviewClosureReportRedactionAudit: null,
      reviewClosureReportRedactionAuditLoading: false,
      reviewClosureReportRedactionAuditError: "Closure Report Redaction Audit API error: Failed to fetch",
      reviewClosureExportIntegrity: null,
      reviewClosureExportIntegrityLoading: false,
      reviewClosureExportIntegrityError: "Closure Export Integrity API error: Failed to fetch",
      reviewSavedViews: [],
      reviewSavedViewsLoading: false,
      reviewSavedViewsError: "Saved Views API error: Failed to fetch",
      unmatchedInboundItems: [providerWebhookUnmatchedInboundItem()],
      unmatchedInboundLoading: false,
      unmatchedInboundError: "Unmatched Inbound API error: Failed to fetch",
      activeDiagnosticsId: "provider-webhook-unmatched-1",
      diagnosticsErrorById: { "provider-webhook-unmatched-1": "Diagnostics API error: Failed to fetch" },
      activeClosureEvidenceId: "provider-webhook-unmatched-1",
      closureEvidenceErrorById: { "provider-webhook-unmatched-1": "Closure Evidence / Report API error: Failed to fetch" },
      activeClosureEvidenceExportId: "provider-webhook-unmatched-1",
      closureEvidenceExportErrorById: { "provider-webhook-unmatched-1": "Closure Evidence Export API error: Failed to fetch" },
      activeClosureEvidenceRedactionAuditId: "provider-webhook-unmatched-1",
      closureEvidenceRedactionAuditErrorById: { "provider-webhook-unmatched-1": "Closure Evidence Redaction Audit API error: Failed to fetch" },
      activeHistoryId: "provider-webhook-unmatched-1",
      historyErrorById: { "provider-webhook-unmatched-1": "History API error: Failed to fetch" },
      operatorNotesById: { "provider-webhook-unmatched-1": [] },
      operatorNotesErrorById: { "provider-webhook-unmatched-1": "Operator Notes API error: Failed to fetch" },
      unmatchedExportError: "Unmatched Export API error: Failed to fetch"
    }));

    expect(html).toContain("Webhook Events API error: Failed to fetch");
    expect(html).toContain("Review Metrics API error: Failed to fetch");
    expect(html).toContain("Review Alerts API error: Failed to fetch");
    expect(html).toContain("Triage Guidance API error: Failed to fetch");
    expect(html).toContain("Closure Evidence / Report API error: Failed to fetch");
    expect(html).toContain("Closure Report Export API error: Failed to fetch");
    expect(html).toContain("Closure Report Export Manifest API error: Failed to fetch");
    expect(html).toContain("QA Handoff Bundle API error: Failed to fetch");
    expect(html).toContain("QA Handoff Bundle Export API error: Failed to fetch");
    expect(html).toContain("QA Handoff Receipt API error: Failed to fetch");
    expect(html).toContain("QA Handoff Sign-off API error: Failed to fetch");
    expect(html).toContain("QA Archive Integrity API error: Failed to fetch");
    expect(html).toContain("QA Retention Audit API error: Failed to fetch");
    expect(html).toContain("QA Archive Release Evidence API error: Failed to fetch");
    expect(html).toContain("QA Archive Release Verification API error: Failed to fetch");
    expect(html).toContain("QA Archive Release Certification API error: Failed to fetch");
    expect(html).toContain("QA Archive Release Closure Ledger API error: Failed to fetch");
    expect(html).toContain("QA Archive Release Attestation Audit API error: Failed to fetch");
    expect(html).toContain("QA Archive Release Attestation Reconciliation API error: Failed to fetch");
    expect(html).toContain("QA Archive Certified Release Gate API error: Failed to fetch");
    expect(html).toContain("QA Archive Certified Release Decision Receipt API error: Failed to fetch");
    expect(html).toContain("QA Archive Certified Release Handoff Packet API error: Failed to fetch");
    expect(html).toContain("QA Archive Certified Release Handoff Acceptance Record API error: Failed to fetch");
    expect(html).toContain("QA Archive Certified Release Rollback Rehearsal Receipt API error: Failed to fetch");
    expect(html).toContain("QA Archive Certified Release Go-Live Hold Release Authorization Receipt API error: Failed to fetch");
    expect(html).toContain("QA Archive Certified Release Launch Approval Receipt API error: Failed to fetch");
    expect(html).toContain("Closure Report Redaction Audit API error: Failed to fetch");
    expect(html).toContain("Closure Export Integrity API error: Failed to fetch");
    expect(html).toContain("Closure Evidence Export API error: Failed to fetch");
    expect(html).toContain("Closure Evidence Redaction Audit API error: Failed to fetch");
    expect(html).toContain("Saved Views API error: Failed to fetch");
    expect(html).toContain("Unmatched Inbound API error: Failed to fetch");
    expect(html).toContain("Diagnostics API error: Failed to fetch");
    expect(html).toContain("History API error: Failed to fetch");
    expect(html).toContain("Operator Notes API error: Failed to fetch");
    expect(html).toContain("Unmatched Export API error: Failed to fetch");
    expect(html).not.toContain("QA handoff bundle export: status=");
    expect(html).not.toContain("QA handoff receipt: receiptStatus=");
    expect(html).not.toContain("QA handoff sign-off: signOffStatus=");
    expect(html).not.toContain("QA archive integrity: integrityStatus=");
    expect(html).not.toContain("QA retention audit: retentionPolicyStatus=");
    expect(html).not.toContain("QA archive release evidence: releaseReadinessStatus=");
    expect(html).not.toContain("QA archive release verification: verificationStatus=");
    expect(html).not.toContain("QA archive release certification: certificationStatus=");
    expect(html).not.toContain("QA archive release attestation audit: attestationStatus=");
    expect(html).not.toContain("QA archive certified release gate: gateStatus=");
    expect(html).not.toContain("QA archive certified release decision receipt: receiptStatus=");
    expect(html).not.toContain("QA archive certified release handoff packet: packetStatus=");
    expect(html).not.toContain("QA archive certified release handoff acceptance record: acceptanceStatus=");
    expect(html).not.toContain("QA archive certified release rollback rehearsal receipt: rollbackRehearsalStatus=");
    expect(html).not.toContain("provider-webhook-review-qa-handoff-bundle-export.json");
    expect(html).not.toContain("provider-webhook-review-qa-handoff-locked-archive-integrity.json");
    expect(html).not.toContain("provider-webhook-review-qa-handoff-retention-audit.json");
    expect(html).not.toContain("sha256:safeqahandoffbundleexport");
    expect(html).not.toContain("payloadFieldCount=");
    expect(html).not.toMatch(/rawPayload|providerRaw|payloadJson|Bearer|sk-/i);
  });
});

function providerReadiness(): ProviderReadiness {
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
    replayDetectedCount: 1,
    webhookNormalizationEnabled: true,
    webhookDryRunRoutingEnabled: true,
    lastSandboxEventNormalizationStatus: "normalized",
    latestRoutingStatus: "dry-run-only",
    normalizedEventCount: 3,
    routingBlockedCount: 1,
    webhookInboundPersistenceEnabled: true,
    latestInboundPersistenceStatus: "blocked-replay",
    persistedInboundMessageCount: 1,
    inboundPersistenceBlockedCount: 1,
    inboundPersistenceReplayBlockedCount: 1,
    inboundPersistenceSkippedNoMatchCount: 1,
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
    exportManifestNeedsReviewCount: 1,
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
    closureEvidenceReadyCount: 1,
    closureEvidenceBlockedCount: 0,
    closureEvidenceIncompleteCount: 1,
    closureEvidenceExportCount: 2,
    closureReportExportCount: 1,
    reviewAlertCriticalCount: 1,
    criticalTriageCount: 1,
    openTriageCount: 1,
    unmatchedInboundOpenCount: 1,
    unmatchedInboundStaleOpenCount: 1,
    unmatchedInboundQueuedCount: 2,
    unmatchedInboundReplayBlockedCount: 1,
    unmatchedInboundReviewedCount: 1,
    unmatchedInboundSkippedCount: 1,
    unmatchedInboundLinkedCount: 1,
    latestUnmatchedInboundStatus: "review-needed",
    latestUnmatchedReviewActionStatus: "reviewed",
    latestUnmatchedLinkStatus: "linked",
    lastSandboxEventAt: "2026-05-31T00:00:00.000Z",
    externalCalls: 0,
    providers: [
      provider("line", true, true, 1),
      provider("telegram", true, true, 1),
      provider("facebook", false, false, 0),
      provider("instagram", false, false, 0)
    ]
  };
}

function providerWebhookClosureChecklist() {
  return [
    {
      step: "VIEWED_DIAGNOSTICS" as const,
      completed: true,
      completedAt: "2026-05-31T00:03:00.000Z",
      completedByOperatorLabel: "operator:current"
    },
    {
      step: "REVIEWED_HISTORY" as const,
      completed: false,
      completedAt: null,
      completedByOperatorLabel: null
    },
    {
      step: "REVIEWED_TRIAGE_GUIDANCE" as const,
      completed: false,
      completedAt: null,
      completedByOperatorLabel: null
    },
    {
      step: "REVIEWED_CANDIDATES" as const,
      completed: false,
      completedAt: null,
      completedByOperatorLabel: null
    },
    {
      step: "CONFIRMED_NO_RAW_LEAKAGE" as const,
      completed: false,
      completedAt: null,
      completedByOperatorLabel: null
    },
    {
      step: "CONFIRMED_NO_PROVIDER_OUTBOUND" as const,
      completed: false,
      completedAt: null,
      completedByOperatorLabel: null
    },
    {
      step: "CONFIRMED_ASSIGNMENT_OR_ESCALATION" as const,
      completed: false,
      completedAt: null,
      completedByOperatorLabel: null
    },
    {
      step: "CONFIRMED_SAFE_LINK_TARGET" as const,
      completed: false,
      completedAt: null,
      completedByOperatorLabel: null
    },
    {
      step: "CONFIRMED_OPERATOR_NOTE" as const,
      completed: false,
      completedAt: null,
      completedByOperatorLabel: null
    }
  ];
}

function providerWebhookResolutionFields() {
  return {
    resolutionStatus: "unresolved" as const,
    resolutionOutcome: null,
    resolvedAt: null,
    resolvedByOperatorLabel: null,
    closureReadiness: "NOT_READY" as const,
    closureChecklist: providerWebhookClosureChecklist(),
    checklistCompletedCount: 1,
    checklistTotalCount: 9,
    checklistIncompleteSteps: [
      "REVIEWED_HISTORY" as const,
      "REVIEWED_TRIAGE_GUIDANCE" as const,
      "REVIEWED_CANDIDATES" as const,
      "CONFIRMED_NO_RAW_LEAKAGE" as const,
      "CONFIRMED_NO_PROVIDER_OUTBOUND" as const,
      "CONFIRMED_ASSIGNMENT_OR_ESCALATION" as const,
      "CONFIRMED_SAFE_LINK_TARGET" as const,
      "CONFIRMED_OPERATOR_NOTE" as const
    ],
    recommendedNextActions: ["VIEW_HISTORY" as const, "RUN_CANDIDATE_LOOKUP" as const, "ADD_OPERATOR_NOTE" as const]
  };
}

function provider(name: ProviderReadiness["providers"][number]["name"], configured: boolean, webhookConfigured: boolean, allowlistCount: number) {
  void allowlistCount;
  return {
    name,
    configured,
    credentialStatus: configured ? "configured" as const : "not_configured" as const,
    webhookStatus: webhookConfigured ? "configured" as const : "not_configured" as const,
    webhookVerificationReady: webhookConfigured,
    webhookVerificationConfigured: webhookConfigured,
    outboundEnabled: false as const,
    status: "disabled_by_default" as const
  };
}

function providerWebhookEvent(): ProviderWebhookEvent {
  return {
    id: "provider-webhook-event-1",
    tenantId: "00000000-0000-4000-8000-000000000001",
    provider: "line",
    channel: "line",
    eventType: "message.created",
    mode: "dry_run",
    status: "received",
    receivedAt: "2026-05-31T00:00:00.000Z",
    payloadSummary: "Dry-run object payload accepted with 2 safe fields.",
    payloadFieldCount: 2,
    payloadDigest: "sha256:safeeventdigest",
    signatureVerified: true,
    signatureStatus: "verified",
    signatureAlgorithm: "hmac-sha256",
    signatureFingerprint: "sha256:safesignature",
    signedAt: "2026-05-31T00:00:00.000Z",
    replayDetected: true,
    replayStatus: "duplicate",
    dedupKeyDigest: "sha256:safededupdigest",
    previousEventSeenAt: "2026-05-30T23:59:00.000Z",
    normalized: false,
    normalizationStatus: "blocked-replay",
    normalizedEventType: "unknown",
    direction: "inbound",
    messageType: "unknown",
    textPreview: null,
    textLength: null,
    mediaSummary: null,
    senderKeyDigest: null,
    roomKeyDigest: null,
    dryRunRouting: true,
    routingStatus: "blocked-replay",
    conversationLookupStatus: "skipped",
    conversationKeyDigest: null,
    channelAccountId: null,
    roomIdDigest: null,
    inboundPersistenceMode: "sandbox-persist",
    inboundPersistenceStatus: "blocked-replay",
    messagePersisted: false,
    persistedMessageId: null,
    conversationId: null,
    unmatchedInboundQueued: false,
    unmatchedInboundId: "provider-webhook-unmatched-1",
    unmatchedStatus: "duplicate-skipped",
    unmatchedReason: "blocked-replay",
    unmatchedReviewActionStatus: "none",
    unmatchedLinkStatus: "none",
    linkedConversationId: null,
    linkedMessageId: null,
    unmatchedResolvedAt: null,
    inboundAuditStatus: "recorded",
    externalCalls: 0
  };
}

function providerWebhookUnmatchedInboundItem(): ProviderWebhookUnmatchedInboundItem {
  return {
    id: "provider-webhook-unmatched-1",
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
    ...providerWebhookResolutionFields(),
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

function providerWebhookReviewMetrics(): ProviderWebhookReviewMetrics {
  return {
    generatedAt: "2026-05-31T00:05:00.000Z",
    appliedFilters: {
      provider: "line",
      reviewStatus: "pending"
    },
    totalEvents: 2,
    totalUnmatched: 1,
    openUnmatched: 1,
    reviewedCount: 0,
    skippedCount: 0,
    linkedCount: 0,
    persistedInboundCount: 0,
    signatureRejectedCount: 0,
    replayRejectedCount: 1,
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
      under1Hour: 0,
      oneTo24Hours: 0,
      oneTo3Days: 0,
      over3Days: 1
    },
    funnel: {
      inboundReceived: 2,
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

function providerWebhookReviewAlerts(): ProviderWebhookReviewAlerts {
  return {
    generatedAt: "2026-05-31T00:06:00.000Z",
    appliedFilters: {
      provider: "line",
      reviewStatus: "pending"
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

function providerWebhookReviewTriage(): ProviderWebhookReviewTriage {
  return {
    generatedAt: "2026-05-31T00:07:00.000Z",
    appliedFilters: {
      provider: "line",
      reviewStatus: "pending"
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
        count: 1,
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
      { key: "safe_link_candidate_available", label: "safe_link_candidate_available", count: 1 },
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
      recommendedNextActions: ["OPEN_DIAGNOSTICS", "VIEW_HISTORY", "RUN_CANDIDATE_LOOKUP", "APPLY_FILTER", "MARK_REVIEWED", "SKIP"],
      diagnosticsAvailable: true,
      historyAvailable: true,
      candidatesAvailable: true,
      exportAvailable: true,
      externalCalls: 0
    }],
    externalCalls: 0
  };
}

function providerWebhookReviewWorkload(): ProviderWebhookReviewWorkload {
  const item = {
    unmatchedId: "provider-webhook-unmatched-1",
    provider: "line" as const,
    platform: "line" as const,
    channelAccountId: "sandbox:line",
    safeRoomLabel: "line room digest saferoomdige",
    roomKeyDigest: "sha256:saferoomdigest",
    eventType: "message.created" as const,
    receivedAt: "2026-05-31T00:00:00.000Z",
    ageBucket: "over3Days" as const,
    reviewStatus: "pending" as const,
    linkStatus: "none" as const,
    unmatchedStatus: "review-needed" as const,
    triageLane: "critical_stale_open" as const,
    severity: "critical" as const,
    assignmentStatus: "assigned" as const,
    assignedToOperatorLabel: "operator:current",
    assignedAt: "2026-05-31T00:10:00.000Z",
    assignedByOperatorLabel: "operator:current",
    escalationStatus: "escalated" as const,
    escalationReason: "SLA_RISK" as const,
    escalatedAt: "2026-05-31T00:11:00.000Z",
    escalatedByOperatorLabel: "operator:current",
    resolutionStatus: "unresolved" as const,
    resolutionOutcome: null,
    closureReadiness: "NOT_READY" as const,
    checklistCompletedCount: 1,
    checklistTotalCount: 9,
    lastOperatorNoteAt: "2026-05-31T00:12:00.000Z",
    historyAvailable: true,
    diagnosticsAvailable: true,
    candidatesAvailable: true,
    externalCalls: 0 as const
  };
  return {
    generatedAt: "2026-05-31T00:08:00.000Z",
    appliedFilters: {
      provider: "line",
      assignmentStatus: "assigned_to_me",
      escalationStatus: "escalated",
      escalationReason: "SLA_RISK"
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
    byAssignee: [{ key: "operator:current", label: "operator:current", count: 1 }],
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
    byProvider: [{ key: "line", label: "line", count: 1 }],
    byPlatform: [{ key: "line", label: "line", count: 1 }],
    byReviewStatus: [{ key: "pending", label: "pending", count: 1 }],
    byLinkStatus: [{ key: "none", label: "none", count: 1 }],
    byUnmatchedStatus: [{ key: "review-needed", label: "review-needed", count: 1 }],
    topAssignedItems: [item],
    topEscalatedItems: [item],
    externalCalls: 0
  };
}

function providerWebhookReviewResolutionSummary(): ProviderWebhookReviewResolutionSummary {
  const baseItem = {
    unmatchedId: "provider-webhook-unmatched-1",
    provider: "line" as const,
    platform: "line" as const,
    channelAccountId: "sandbox:line",
    safeRoomLabel: "line room digest saferoomdige",
    roomKeyDigest: "sha256:saferoomdigest",
    eventType: "message.created" as const,
    receivedAt: "2026-05-31T00:00:00.000Z",
    ageBucket: "over3Days" as const,
    reviewStatus: "pending" as const,
    linkStatus: "none" as const,
    unmatchedStatus: "review-needed" as const,
    triageLane: "critical_stale_open" as const,
    severity: "critical" as const,
    assignmentStatus: "assigned" as const,
    assignedToOperatorLabel: "operator:current",
    escalationStatus: "escalated" as const,
    escalationReason: "SLA_RISK" as const,
    resolutionStatus: "unresolved" as const,
    resolutionOutcome: "NEEDS_REVIEW" as const,
    resolvedAt: null,
    resolvedByOperatorLabel: null,
    closureReadiness: "NOT_READY" as const,
    closureChecklist: providerWebhookClosureChecklist(),
    checklistCompletedCount: 1,
    checklistTotalCount: 9,
    checklistIncompleteSteps: [
      "REVIEWED_HISTORY" as const,
      "REVIEWED_TRIAGE_GUIDANCE" as const,
      "REVIEWED_CANDIDATES" as const,
      "CONFIRMED_NO_RAW_LEAKAGE" as const,
      "CONFIRMED_NO_PROVIDER_OUTBOUND" as const,
      "CONFIRMED_ASSIGNMENT_OR_ESCALATION" as const,
      "CONFIRMED_SAFE_LINK_TARGET" as const,
      "CONFIRMED_OPERATOR_NOTE" as const
    ],
    recommendedNextActions: ["VIEW_HISTORY" as const, "RUN_CANDIDATE_LOOKUP" as const, "ADD_OPERATOR_NOTE" as const],
    lastOperatorNoteAt: "2026-05-31T00:12:00.000Z",
    historyAvailable: true,
    diagnosticsAvailable: true,
    candidatesAvailable: true,
    externalCalls: 0 as const
  };
  return {
    generatedAt: "2026-05-31T00:09:00.000Z",
    appliedFilters: {
      provider: "line",
      resolutionStatus: "unresolved",
      resolutionOutcome: "NEEDS_REVIEW",
      closureReadiness: "NOT_READY",
      checklistIncomplete: true
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
    topReadyItems: [baseItem],
    topBlockedItems: [],
    externalCalls: 0
  };
}

function providerWebhookClosureEvidence(): ProviderWebhookReviewClosureEvidence {
  return {
    generatedAt: "2026-06-04T00:00:00.000Z",
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

function providerWebhookClosureEvidenceExport(): ProviderWebhookReviewClosureEvidenceExport {
  return {
    ...providerWebhookClosureEvidence(),
    exportKind: "closure-evidence",
    format: "json",
    contentType: "application/json",
    safeFilename: "provider-webhook-closure-evidence-line-provider-webhook-unmatched-1.json",
    exportedAt: "2026-06-04T00:02:00.000Z"
  };
}

function providerWebhookReviewClosureReport(): ProviderWebhookReviewClosureReport {
  const { generatedAt: _generatedAt, ...item } = providerWebhookClosureEvidence();
  void _generatedAt;
  return {
    generatedAt: "2026-06-04T00:00:00.000Z",
    appliedFilters: {
      provider: "line",
      resolutionStatus: "resolved",
      resolutionOutcome: "NEEDS_REVIEW",
      closureReadiness: "READY_FOR_REVIEW",
      checklistIncomplete: false
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

function providerWebhookReviewClosureReportExport(): ProviderWebhookReviewClosureReportExport {
  return {
    ...providerWebhookReviewClosureReport(),
    exportKind: "closure-report",
    format: "json",
    contentType: "application/json",
    safeFilename: "provider-webhook-review-closure-report.json",
    exportedAt: "2026-06-04T00:02:00.000Z"
  };
}

function providerWebhookReviewExportRedactionAudit(
  auditTarget: "closure-report-export" | "closure-evidence-export",
  unmatchedId?: string
): ProviderWebhookReviewExportRedactionAudit {
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

function providerWebhookReviewExportIntegrity(): ProviderWebhookReviewExportIntegrity {
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

function providerWebhookReviewExportManifest(
  manifestTarget: "closure-report-export" | "closure-evidence-export",
  unmatchedId?: string
): ProviderWebhookReviewExportManifest {
  return {
    generatedAt: "2026-06-04T00:05:00.000Z",
    manifestKind: "provider-webhook-review-export-manifest",
    manifestTarget,
    exportKind: manifestTarget === "closure-report-export" ? "closure-report" : "closure-evidence",
    format: "json",
    contentType: "application/json",
    safeFilename: manifestTarget === "closure-report-export"
      ? "provider-webhook-review-closure-report.json"
      : `provider-webhook-closure-evidence-line-${unmatchedId ?? "provider-webhook-unmatched-1"}.json`,
    exportedAt: "2026-06-04T00:02:00.000Z",
    exportShapeVersion: "provider-webhook-closure-export-v1",
    ...(unmatchedId ? { unmatchedId } : {}),
    ...(manifestTarget === "closure-report-export" ? { appliedFilters: { provider: "line", checklistIncomplete: false } } : {}),
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
    ...(manifestTarget === "closure-report-export" ? { safeReportDigest: "sha256:safereportdigest" } : {}),
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

function providerWebhookReviewQaHandoffBundle(): ProviderWebhookReviewQaHandoffBundle {
  const evidence = providerWebhookClosureEvidence();
  const evidenceManifest = providerWebhookReviewExportManifest("closure-evidence-export", evidence.unmatchedId);
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
    closureReportExport: providerWebhookReviewClosureReportExport(),
    closureReportManifest: providerWebhookReviewExportManifest("closure-report-export"),
    closureReportRedactionAudit: providerWebhookReviewExportRedactionAudit("closure-report-export"),
    closureExportIntegrity: providerWebhookReviewExportIntegrity(),
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

function providerWebhookReviewQaHandoffBundleExport(): ProviderWebhookReviewQaHandoffBundleExport {
  const bundle = providerWebhookReviewQaHandoffBundle();
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

function providerWebhookReviewQaHandoffReceipt(): ProviderWebhookReviewQaHandoffReceipt {
  const exportResult = providerWebhookReviewQaHandoffBundleExport();
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

function providerWebhookReviewQaHandoffSignOff(): ProviderWebhookReviewQaHandoffSignOffResponse {
  return {
    ...providerWebhookReviewQaHandoffReceipt(),
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

function providerWebhookReviewQaHandoffLockedArchive() {
  const signOff = providerWebhookReviewQaHandoffSignOff();
  return {
    generatedAt: "2026-06-04T00:07:00.000Z",
    lockedArchiveStatus: "ready" as const,
    retentionManifestStatus: "ready" as const,
    archiveAcknowledgementStatus: "not_exported" as const,
    acceptanceStatus: "locked" as const,
    lockStatus: "locked" as const,
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
    retentionPolicyLabel: "safe-qa-handoff-locked-archive-retain-review-metadata-only",
    archivedAt: "2026-06-04T00:07:00.000Z",
    exportedAt: null,
    externalCalls: 0 as const
  };
}

function providerWebhookReviewQaHandoffLockedArchiveExport() {
  return {
    ...providerWebhookReviewQaHandoffLockedArchive(),
    lockedArchiveStatus: "exported" as const,
    archiveAcknowledgementStatus: "exported" as const,
    safeFilename: "provider-webhook-review-qa-handoff-locked-archive-export.json",
    safeDigest: "sha256:safeqahandofflockedarchiveexport",
    exportedAt: "2026-06-04T00:08:00.000Z",
    exportKind: "qa-handoff-locked-archive" as const,
    format: "json" as const,
    contentType: "application/json" as const,
    externalCalls: 0 as const
  };
}

function providerWebhookReviewQaHandoffRetentionManifest() {
  const archive = providerWebhookReviewQaHandoffLockedArchive();
  return {
    generatedAt: "2026-06-04T00:08:30.000Z",
    manifestKind: "qa-handoff-locked-archive-retention-manifest" as const,
    retentionManifestStatus: "ready" as const,
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
    retentionReadiness: "ready" as const,
    readinessFlags: archive.readinessFlags,
    counts: archive.counts,
    manualQaChecks: archive.manualQaChecks,
    archivedAt: archive.archivedAt,
    exportedAt: archive.exportedAt,
    externalCalls: 0 as const
  };
}

function providerWebhookReviewQaHandoffArchiveIntegrity(): ProviderWebhookReviewQaHandoffArchiveIntegrity {
  const archive = providerWebhookReviewQaHandoffLockedArchiveExport();
  const manifest = providerWebhookReviewQaHandoffRetentionManifest();
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

function providerWebhookReviewQaHandoffRetentionAudit(): ProviderWebhookReviewQaHandoffRetentionAudit {
  const archive = providerWebhookReviewQaHandoffLockedArchiveExport();
  const manifest = providerWebhookReviewQaHandoffRetentionManifest();
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

function providerWebhookReviewQaHandoffArchiveFinalizationSignOff(): ProviderWebhookReviewQaHandoffFinalizationSignOffResponse {
  const integrity = providerWebhookReviewQaHandoffArchiveIntegrity();
  const retentionAudit = providerWebhookReviewQaHandoffRetentionAudit();
  return {
    generatedAt: "2026-06-04T00:10:30.000Z",
    finalizationStatus: "finalized",
    retentionSignOffStatus: "signed_off",
    finalizationReceiptStatus: "ready",
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
    safeFilename: "provider-webhook-review-qa-handoff-archive-finalization-signoff.json",
    safeDigest: "sha256:safeqahandoffarchivefinalizationsignoff",
    bundleDigest: integrity.bundleDigest,
    exportDigest: integrity.exportDigest,
    receiptDigest: integrity.receiptDigest,
    acceptanceLockDigest: integrity.acceptanceLockDigest,
    lockedArchiveDigest: integrity.lockedArchiveDigest,
    retentionManifestDigest: integrity.retentionManifestDigest,
    integrityDigest: integrity.safeDigest,
    finalizationReceiptDigest: "sha256:safeqahandoffarchivefinalizationreceipt",
    safeRetentionPolicyLabel: retentionAudit.safePolicyLabel,
    safeReviewerLabel: "safe reviewer",
    safeCheckLabels: ["archive integrity confirmed", "retention audit confirmed", "finalization receipt ready"],
    readinessFlags: integrity.readinessFlags,
    counts: {
      ...integrity.counts,
      digestChainLinkCount: 7,
      finalizationCheckedCount: 1,
      retentionSignOffCount: 1
    },
    manualQaChecks: integrity.manualQaChecks,
    archivedAt: integrity.archivedAt,
    exportedAt: integrity.exportedAt,
    signedAt: "2026-06-04T00:10:30.000Z",
    finalizedAt: "2026-06-04T00:10:30.000Z",
    action: "sign_off",
    signOffRecordId: "provider-webhook-qa-handoff-archive-finalization-signoff-1",
    externalCalls: 0
  };
}

function providerWebhookReviewQaHandoffArchiveFinalizationReceipt(): ProviderWebhookReviewQaHandoffFinalizationReceipt {
  const signOff = providerWebhookReviewQaHandoffArchiveFinalizationSignOff();
  return {
    ...signOff,
    safeFilename: "provider-webhook-review-qa-handoff-archive-finalization-receipt.json",
    safeDigest: "sha256:safeqahandoffarchivefinalizationreceiptread",
    receiptKind: "qa-handoff-locked-archive-finalization-receipt",
    externalCalls: 0
  };
}

function providerWebhookReviewQaHandoffArchiveReleaseEvidence(): ProviderWebhookReviewQaHandoffReleaseEvidence {
  const { action: _action, ...receipt } = providerWebhookReviewQaHandoffArchiveFinalizationReceipt() as ProviderWebhookReviewQaHandoffFinalizationReceipt & { action?: string };
  void _action;
  const retentionAudit = providerWebhookReviewQaHandoffRetentionAudit();
  return {
    ...receipt,
    evidenceKind: "qa-handoff-locked-archive-release-evidence-pack",
    releaseReadinessStatus: "ready_for_release",
    retentionPolicyStatus: retentionAudit.retentionPolicyStatus,
    safeReleaseLabel: "safe-qa-handoff-release-evidence-pack",
    safeFilename: "provider-webhook-review-qa-handoff-archive-release-evidence-pack.json",
    safeDigest: "sha256:safeqahandoffarchivereleaseevidence",
    retentionAuditDigest: retentionAudit.safeDigest,
    finalizationReceiptDigest: receipt.finalizationReceiptDigest ?? receipt.safeDigest,
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

function providerWebhookReviewQaHandoffArchiveReleaseVerification(): ProviderWebhookReviewQaHandoffReleaseVerification {
  const releaseEvidence = providerWebhookReviewQaHandoffArchiveReleaseEvidence();
  const digestMatrixRows: ProviderWebhookReviewQaHandoffReleaseVerification["digestMatrixRows"] = [
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

function providerWebhookReleaseVerificationDigestRow(
  key: ProviderWebhookReviewQaHandoffReleaseVerification["digestMatrixRows"][number]["key"],
  label: string,
  digest: string
): ProviderWebhookReviewQaHandoffReleaseVerification["digestMatrixRows"][number] {
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

function providerWebhookReviewQaHandoffArchiveReleaseCertification(): ProviderWebhookReviewQaHandoffReleaseCertification {
  const verification = providerWebhookReviewQaHandoffArchiveReleaseVerification();
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

function providerWebhookReviewQaHandoffArchiveReleaseClosureLedger(): ProviderWebhookReviewQaHandoffReleaseClosureLedger {
  const certification = providerWebhookReviewQaHandoffArchiveReleaseCertification();
  const ledgerRows: ProviderWebhookReviewQaHandoffReleaseClosureLedger["ledgerRows"] = [
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

function providerWebhookReviewQaHandoffArchiveReleaseAttestationAudit(): ProviderWebhookReviewQaHandoffReleaseAttestationAudit {
  const closureLedger = providerWebhookReviewQaHandoffArchiveReleaseClosureLedger();
  const attestationRows: ProviderWebhookReviewQaHandoffReleaseAttestationAudit["attestationRows"] = [
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

function providerWebhookReviewQaHandoffArchiveReleaseAttestationReconciliation(): ProviderWebhookReviewQaHandoffReleaseAttestationReconciliationRegister {
  const attestationAudit = providerWebhookReviewQaHandoffArchiveReleaseAttestationAudit();
  const reconciliationRows: ProviderWebhookReviewQaHandoffReleaseAttestationReconciliationRegister["reconciliationRows"] = [
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

function providerWebhookReviewQaHandoffCertifiedReleaseGate(): ProviderWebhookReviewQaHandoffCertifiedReleaseGate {
  const reconciliation = providerWebhookReviewQaHandoffArchiveReleaseAttestationReconciliation();
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

function providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceipt(): ProviderWebhookReviewQaHandoffCertifiedReleaseDecisionReceipt {
  const releaseGate = providerWebhookReviewQaHandoffCertifiedReleaseGate();
  const receiptRows: ProviderWebhookReviewQaHandoffCertifiedReleaseDecisionReceipt["receiptRows"] = [
    providerWebhookDecisionReceiptRow("release_gate", "Certified release gate", releaseGate.releaseGateDigest, 1),
    providerWebhookDecisionReceiptRow("release_decision", "GO release decision", releaseGate.releaseGateDigest, 1, "issued"),
    providerWebhookDecisionReceiptRow("release_readiness", "Release readiness", releaseGate.releaseEvidenceDigest, 1),
    providerWebhookDecisionReceiptRow("reconciliation", "Attestation reconciliation", releaseGate.reconciliationDigest, 1),
    providerWebhookDecisionReceiptRow("attestation", "Attestation audit", releaseGate.attestationAuditDigest, 1),
    providerWebhookDecisionReceiptRow("closure_ledger", "Closure ledger", releaseGate.closureLedgerDigest, 1),
    providerWebhookDecisionReceiptRow("certification", "Release certification", releaseGate.certificationDigest, 1),
    providerWebhookDecisionReceiptRow("verification", "Release verification", releaseGate.verificationDigest, 1),
    providerWebhookDecisionReceiptRow("digest_chain", "Digest chain", releaseGate.reconciliationDigest, 1),
    providerWebhookDecisionReceiptRow("prerequisite_checklist", "Prerequisite checklist", releaseGate.releaseEvidenceDigest, 16),
    providerWebhookDecisionReceiptRow("certification_checklist", "Certification checklist", releaseGate.certificationDigest, 13),
    providerWebhookDecisionReceiptRow("gate_checklist", "Release gate checklist", releaseGate.releaseGateDigest, 12),
    providerWebhookDecisionReceiptRow("external_calls", "External calls", releaseGate.releaseGateDigest, 0)
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

function providerWebhookReviewQaHandoffCertifiedReleaseHandoffPacket(): ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket {
  const decisionReceipt = providerWebhookReviewQaHandoffCertifiedReleaseDecisionReceipt();
  const handoffRows: ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket["handoffRows"] = [
    providerWebhookHandoffPacketRow("decision_receipt", "Certified release decision receipt", decisionReceipt.decisionReceiptDigest, 1, "ready"),
    providerWebhookHandoffPacketRow("release_gate", "Certified release gate", decisionReceipt.releaseGateDigest, 1),
    providerWebhookHandoffPacketRow("release_decision", "GO release decision", decisionReceipt.decisionReceiptDigest, 1, "ready"),
    providerWebhookHandoffPacketRow("release_readiness", "Release readiness", decisionReceipt.releaseEvidenceDigest, 1),
    providerWebhookHandoffPacketRow("reconciliation", "Attestation reconciliation", decisionReceipt.reconciliationDigest, 1),
    providerWebhookHandoffPacketRow("attestation", "Attestation audit", decisionReceipt.attestationAuditDigest, 1),
    providerWebhookHandoffPacketRow("closure_ledger", "Closure ledger", decisionReceipt.closureLedgerDigest, 1),
    providerWebhookHandoffPacketRow("certification", "Release certification", decisionReceipt.certificationDigest, 1),
    providerWebhookHandoffPacketRow("verification", "Release verification", decisionReceipt.verificationDigest, 1),
    providerWebhookHandoffPacketRow("digest_chain", "Digest chain", decisionReceipt.reconciliationDigest, 1),
    providerWebhookHandoffPacketRow("prerequisite_checklist", "Prerequisite checklist", decisionReceipt.releaseEvidenceDigest, 16),
    providerWebhookHandoffPacketRow("certification_checklist", "Certification checklist", decisionReceipt.certificationDigest, 13),
    providerWebhookHandoffPacketRow("gate_checklist", "Release gate checklist", decisionReceipt.releaseGateDigest, 12),
    providerWebhookHandoffPacketRow("blocking_reasons", "Blocking reasons", decisionReceipt.decisionReceiptDigest, 0),
    providerWebhookHandoffPacketRow("exceptions", "Exception rows", decisionReceipt.reconciliationDigest, 0),
    providerWebhookHandoffPacketRow("external_calls", "External calls", decisionReceipt.decisionReceiptDigest, 0)
  ];
  const runbookRows: ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket["runbookRows"] = [
    providerWebhookHandoffRunbookRow("confirm_decision_receipt", "Confirm certified decision receipt", decisionReceipt.decisionReceiptDigest, "release owner"),
    providerWebhookHandoffRunbookRow("confirm_release_gate", "Confirm certified release gate", decisionReceipt.releaseGateDigest, "release owner"),
    providerWebhookHandoffRunbookRow("confirm_operator_checklist", "Confirm operator checklist", decisionReceipt.decisionReceiptDigest, "operator"),
    providerWebhookHandoffRunbookRow("release_handoff", "Proceed with safe release handoff", decisionReceipt.decisionReceiptDigest, "release owner"),
    providerWebhookHandoffRunbookRow("monitor_release", "Monitor safe release evidence", decisionReceipt.releaseEvidenceDigest, "operator"),
    providerWebhookHandoffRunbookRow("exception_hold", "Hold release on blocking exceptions", decisionReceipt.reconciliationDigest, "release owner")
  ];
  const operatorChecklist: ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket["operatorChecklist"] = [
    providerWebhookHandoffOperatorChecklistItem("decision_receipt_issued", "Decision receipt issued", decisionReceipt.decisionReceiptDigest),
    providerWebhookHandoffOperatorChecklistItem("release_gate_ready", "Release gate ready", decisionReceipt.releaseGateDigest),
    providerWebhookHandoffOperatorChecklistItem("no_blocking_reasons", "No blocking reasons", decisionReceipt.decisionReceiptDigest),
    providerWebhookHandoffOperatorChecklistItem("no_exceptions", "No exception rows", decisionReceipt.reconciliationDigest),
    providerWebhookHandoffOperatorChecklistItem("external_calls_zero", "External calls zero", decisionReceipt.decisionReceiptDigest),
    providerWebhookHandoffOperatorChecklistItem("provider_outbound_absent", "Provider outbound absent", decisionReceipt.decisionReceiptDigest),
    providerWebhookHandoffOperatorChecklistItem("source_material_absent", "Sensitive source material absent", decisionReceipt.decisionReceiptDigest)
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

function providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord(): ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord {
  const handoffPacket = providerWebhookReviewQaHandoffCertifiedReleaseHandoffPacket();
  const acknowledgedChecklist: ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord["acknowledgedChecklist"] = handoffPacket.operatorChecklist.map((item) => ({
    key: item.key,
    label: item.label,
    acknowledgementStatus: "acknowledged",
    safeDigest: item.safeDigest,
    acknowledged: true
  }));
  const acknowledgementRows: ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord["acknowledgementRows"] = [
    providerWebhookHandoffAcknowledgementRow("handoff_packet", "Handoff packet", handoffPacket.handoffPacketDigest, 1),
    providerWebhookHandoffAcknowledgementRow("operator_checklist", "Operator checklist", handoffPacket.handoffPacketDigest, handoffPacket.operatorChecklist.length),
    providerWebhookHandoffAcknowledgementRow("release_owner", "Release owner acknowledgement", handoffPacket.handoffPacketDigest, 1),
    providerWebhookHandoffAcknowledgementRow("external_calls", "External calls", handoffPacket.handoffPacketDigest, 0),
    providerWebhookHandoffAcknowledgementRow("safe_source_material", "Sensitive source material", handoffPacket.handoffPacketDigest, 1),
    providerWebhookHandoffAcknowledgementRow("blocking_reasons", "Blocking reasons", handoffPacket.handoffPacketDigest, 0),
    providerWebhookHandoffAcknowledgementRow("exceptions", "Exception rows", handoffPacket.reconciliationDigest, 0)
  ];
  return {
    acceptanceKind: "qa-handoff-locked-archive-certified-release-handoff-acceptance-record",
    acceptanceStatus: "acknowledged",
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
    safeDigest: "sha256:safeqahandoffcertifiedreleasehandoffacceptance",
    acceptanceRecordDigest: "sha256:safeqahandoffcertifiedreleasehandoffacceptance",
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
      acknowledgedByRole: "release owner",
      acknowledgedByLabel: "safe release owner",
      handoffReady: true,
      releaseDecisionGo: true,
      operatorChecklistAcknowledged: true,
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
      acceptanceRecordMutationCount: 1,
      acknowledgedChecklistItemCount: acknowledgedChecklist.length,
      acknowledgedChecklistCompleteCount: acknowledgedChecklist.length,
      acknowledgementRowCount: acknowledgementRows.length,
      acknowledgementRowCompleteCount: acknowledgementRows.length
    },
    externalCalls: 0
  };
}

function providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun(): ProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun {
  const acceptanceRecord = providerWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord();
  const executionChecklist: ProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun["executionChecklist"] = [
    providerWebhookNoopExecutionChecklistItem("acceptance_record_acknowledged", "Acceptance record acknowledged", acceptanceRecord.acceptanceRecordDigest),
    providerWebhookNoopExecutionChecklistItem("handoff_ready", "Handoff ready", acceptanceRecord.handoffPacketDigest),
    providerWebhookNoopExecutionChecklistItem("release_decision_go", "Release decision go", acceptanceRecord.decisionReceiptDigest),
    providerWebhookNoopExecutionChecklistItem("execution_mode_no_op", "Execution mode no-op", acceptanceRecord.acceptanceRecordDigest),
    providerWebhookNoopExecutionChecklistItem("external_calls_zero", "External calls zero", acceptanceRecord.acceptanceRecordDigest),
    providerWebhookNoopExecutionChecklistItem("provider_outbound_absent", "Provider outbound absent", acceptanceRecord.acceptanceRecordDigest),
    providerWebhookNoopExecutionChecklistItem("notification_send_absent", "External notification sending absent", acceptanceRecord.acceptanceRecordDigest),
    providerWebhookNoopExecutionChecklistItem("source_material_absent", "Sensitive source material absent", acceptanceRecord.acceptanceRecordDigest)
  ];
  const dryRunRows: ProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun["dryRunRows"] = [
    providerWebhookNoopDryRunRow("acceptance_record", "Acceptance record", acceptanceRecord.acceptanceRecordDigest, 1),
    providerWebhookNoopDryRunRow("handoff_packet", "Handoff packet", acceptanceRecord.handoffPacketDigest, 1),
    providerWebhookNoopDryRunRow("decision_receipt", "Decision receipt", acceptanceRecord.decisionReceiptDigest, 1)
  ];
  const executionPlanRows: ProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun["executionPlanRows"] = [
    providerWebhookNoopExecutionPlanRow("plan_scope", "Certified release readiness check", acceptanceRecord.acceptanceRecordDigest, 1, "ready"),
    providerWebhookNoopExecutionPlanRow("release_execution", "Release execution", acceptanceRecord.acceptanceRecordDigest, 0, "no_op"),
    providerWebhookNoopExecutionPlanRow("provider_outbound", "Provider outbound", acceptanceRecord.acceptanceRecordDigest, 0, "no_op"),
    providerWebhookNoopExecutionPlanRow("external_notifications", "External notifications", acceptanceRecord.acceptanceRecordDigest, 0, "no_op"),
    providerWebhookNoopExecutionPlanRow("automation_calls", "Automation calls", acceptanceRecord.acceptanceRecordDigest, 0, "no_op"),
    providerWebhookNoopExecutionPlanRow("state_mutation", "Release state mutation", acceptanceRecord.acceptanceRecordDigest, 0, "no_op"),
    providerWebhookNoopExecutionPlanRow("readback", "Safe readback", acceptanceRecord.acceptanceRecordDigest, 1, "ready")
  ];
  return {
    dryRunKind: "qa-handoff-locked-archive-certified-release-noop-execution-dryrun",
    dryRunStatus: "passed",
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
    safeDigest: "sha256:safeqahandoffcertifiedreleasenoopdryrun",
    noopExecutionDryRunDigest: "sha256:safeqahandoffcertifiedreleasenoopdryrun",
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
      requestedBy: "safe release owner",
      checklistAcknowledged: true,
      dryRunReason: "safe no-op execution readiness rehearsal",
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
      operatorChecklistAcknowledged: true,
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
      noopExecutionDryRunMutationCount: 1,
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

function providerWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedger(): ProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedger {
  const dryRun = providerWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun();
  const resultLedgerRows: ProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedger["resultLedgerRows"] = [
    providerWebhookDryRunResultLedgerRow("noop_execution_dryrun", "No-op execution dry-run", dryRun.noopExecutionDryRunDigest, dryRun.counts.noopExecutionDryRunCheckedCount),
    providerWebhookDryRunResultLedgerRow("acceptance_record", "Acceptance record", dryRun.acceptanceRecordDigest, 1),
    providerWebhookDryRunResultLedgerRow("handoff_packet", "Handoff packet", dryRun.handoffPacketDigest, dryRun.counts.handoffPacketCheckedCount),
    providerWebhookDryRunResultLedgerRow("decision_receipt", "Decision receipt", dryRun.decisionReceiptDigest, dryRun.counts.decisionReceiptCheckedCount),
    providerWebhookDryRunResultLedgerRow("release_gate", "Release gate", dryRun.releaseGateDigest, dryRun.counts.gateCheckedCount),
    providerWebhookDryRunResultLedgerRow("reconciliation", "Attestation reconciliation", dryRun.reconciliationDigest, dryRun.counts.reconciliationCheckedCount),
    providerWebhookDryRunResultLedgerRow("attestation_audit", "Attestation audit", dryRun.attestationAuditDigest, dryRun.counts.attestationAuditCheckedCount),
    providerWebhookDryRunResultLedgerRow("closure_ledger", "Closure ledger", dryRun.closureLedgerDigest, dryRun.counts.closureLedgerCheckedCount),
    providerWebhookDryRunResultLedgerRow("certification", "Release certification", dryRun.certificationDigest, dryRun.counts.releaseCertificationCheckedCount),
    providerWebhookDryRunResultLedgerRow("verification", "Release verification", dryRun.verificationDigest, dryRun.counts.releaseVerificationCheckedCount),
    providerWebhookDryRunResultLedgerRow("release_evidence", "Release evidence", dryRun.releaseEvidenceDigest, dryRun.counts.releaseEvidenceCheckedCount),
    providerWebhookDryRunResultLedgerRow("external_calls", "External calls", dryRun.acceptanceRecordDigest, dryRun.externalCalls)
  ];
  const finalReadinessRows: ProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedger["finalReadinessRows"] = [
    providerWebhookDryRunFinalReadinessRow("dryrun_passed", "Dry-run passed", dryRun.noopExecutionDryRunDigest, 1),
    providerWebhookDryRunFinalReadinessRow("execution_mode_no_op", "Execution mode no-op", dryRun.noopExecutionDryRunDigest, 1),
    providerWebhookDryRunFinalReadinessRow("acceptance_acknowledged", "Acceptance acknowledged", dryRun.acceptanceRecordDigest, 1),
    providerWebhookDryRunFinalReadinessRow("handoff_ready", "Handoff ready", dryRun.handoffPacketDigest, 1),
    providerWebhookDryRunFinalReadinessRow("release_decision_go", "Release decision go", dryRun.decisionReceiptDigest, 1),
    providerWebhookDryRunFinalReadinessRow("gate_ready", "Release gate ready", dryRun.releaseGateDigest, 1),
    providerWebhookDryRunFinalReadinessRow("safe_digests", "Safe digests", dryRun.safeDigest, 13),
    providerWebhookDryRunFinalReadinessRow("no_state_mutation", "No result ledger state mutation", dryRun.noopExecutionDryRunDigest, 0),
    providerWebhookDryRunFinalReadinessRow("external_calls_zero", "External calls zero", dryRun.noopExecutionDryRunDigest, 0)
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

function providerWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificate(): ProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificate {
  const resultLedger = providerWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedger();
  const certificateRows: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificate["certificateRows"] = [
    providerWebhookFinalReadinessCertificateRow("dryrun_result_ledger", "Dry-run result ledger recorded", resultLedger.dryRunResultLedgerDigest, resultLedger.counts.dryRunResultLedgerCheckedCount),
    providerWebhookFinalReadinessCertificateRow("dryrun_passed", "Dry-run passed", resultLedger.noopExecutionDryRunDigest, 1),
    providerWebhookFinalReadinessCertificateRow("external_calls_zero", "External calls zero", resultLedger.dryRunResultLedgerDigest, resultLedger.externalCalls)
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

function providerWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister(): ProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister {
  const certificate = providerWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificate();
  const freezeAuditRows: ProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister["freezeAuditRows"] = [
    providerWebhookFreezeAuditRegisterRow("final_readiness_certificate", "Final readiness certificate issued", certificate.finalReadinessCertificateDigest, 1),
    providerWebhookFreezeAuditRegisterRow("release_freeze_scope", "Release freeze scope registered", "sha256:safeqahandoffcertifiedreleasefreezeauditregister", certificate.counts.certificateRowCount),
    providerWebhookFreezeAuditRegisterRow("safe_digests", "Freeze register safe digest chain", "sha256:safeqahandoffcertifiedreleasefreezeauditregister", 16),
    providerWebhookFreezeAuditRegisterRow("no_state_mutation", "No freeze audit register state mutation", certificate.finalReadinessCertificateDigest, 0),
    providerWebhookFreezeAuditRegisterRow("external_calls_zero", "External calls zero", certificate.finalReadinessCertificateDigest, 0)
  ];
  const rollbackPlanRows: ProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister["rollbackPlanRows"] = [
    providerWebhookFreezeAuditRegisterRow("rollback_plan_ready", "Safe rollback readiness plan ready", "sha256:safeqahandoffcertifiedreleaserollbackreadinessplan", certificate.counts.finalReadinessReadyCount),
    providerWebhookFreezeAuditRegisterRow("rollback_owner_confirmed", "Release owner rollback readiness confirmed", certificate.safeDigest, 1),
    providerWebhookFreezeAuditRegisterRow("safe_digests", "Rollback plan safe digest chain", "sha256:safeqahandoffcertifiedreleaserollbackreadinessplan", 16),
    providerWebhookFreezeAuditRegisterRow("no_state_mutation", "No rollback readiness plan state mutation", certificate.finalReadinessCertificateDigest, 0),
    providerWebhookFreezeAuditRegisterRow("external_calls_zero", "External calls zero", certificate.finalReadinessCertificateDigest, 0)
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

function providerWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt(): ProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt {
  const freezeAuditRegister = providerWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister();
  const rollbackRehearsalReceiptDigest = "sha256:safeqahandoffcertifiedreleaserollbackrehearsalreceipt";
  const freezeSnapshotRows: ProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt["freezeSnapshotRows"] = [
    providerWebhookRollbackRehearsalReceiptRow("freeze_audit_recorded", "Freeze audit register recorded", freezeAuditRegister.freezeAuditRegisterDigest, freezeAuditRegister.counts.freezeAuditRegisteredCount),
    providerWebhookRollbackRehearsalReceiptRow("release_frozen", "Certified release freeze remains frozen", freezeAuditRegister.freezeAuditRegisterDigest, 1),
    providerWebhookRollbackRehearsalReceiptRow("safe_digest_chain", "Freeze snapshot safe digest chain", rollbackRehearsalReceiptDigest, 17)
  ];
  const rollbackReadinessRows: ProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt["rollbackReadinessRows"] = [
    providerWebhookRollbackRehearsalReceiptRow("rollback_readiness_ready", "Rollback readiness status ready", freezeAuditRegister.freezeAuditRegisterDigest, freezeAuditRegister.counts.rollbackPlanReadyCount),
    providerWebhookRollbackRehearsalReceiptRow("recovery_owner_confirmed", "Release owner recovery readiness confirmed", freezeAuditRegister.safeDigest, 1),
    providerWebhookRollbackRehearsalReceiptRow("safe_digest_chain", "Rollback readiness safe digest chain", rollbackRehearsalReceiptDigest, 17)
  ];
  const rollbackRehearsalRows: ProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt["rollbackRehearsalRows"] = [
    providerWebhookRollbackRehearsalReceiptRow("dry_run_noop_passed", "No-op execution dry-run passed", freezeAuditRegister.noopExecutionDryRunDigest, freezeAuditRegister.counts.dryRunRowPassedCount),
    providerWebhookRollbackRehearsalReceiptRow("rollback_rehearsal_noop", "Rollback rehearsal receipt is read-only no-op evidence", rollbackRehearsalReceiptDigest, 1),
    providerWebhookRollbackRehearsalReceiptRow("no_state_mutation", "No rollback rehearsal receipt state mutation", freezeAuditRegister.freezeAuditRegisterDigest, 0),
    providerWebhookRollbackRehearsalReceiptRow("external_calls_zero", "External calls zero", freezeAuditRegister.freezeAuditRegisterDigest, 0)
  ];
  const recoveryPlanRows: ProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt["recoveryPlanRows"] = [
    providerWebhookRollbackRehearsalReceiptRow("recovery_plan_ready", "Safe recovery plan ready", freezeAuditRegister.freezeAuditRegisterDigest, freezeAuditRegister.counts.rollbackPlanReadyCount),
    providerWebhookRollbackRehearsalReceiptRow("certificate_issued", "Final readiness certificate issued", freezeAuditRegister.finalReadinessCertificateDigest, freezeAuditRegister.counts.certificateRowIssuedCount),
    providerWebhookRollbackRehearsalReceiptRow("final_readiness_ready", "Final readiness remains ready", freezeAuditRegister.finalReadinessCertificateDigest, freezeAuditRegister.counts.finalReadinessReadyCount)
  ];
  const recoveryReadinessRows: ProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt["recoveryReadinessRows"] = [
    providerWebhookRollbackRehearsalReceiptRow("safe_digest_chain", "Recovery readiness safe digest chain", rollbackRehearsalReceiptDigest, 17),
    providerWebhookRollbackRehearsalReceiptRow("no_state_mutation", "No recovery readiness state mutation", freezeAuditRegister.freezeAuditRegisterDigest, 0),
    providerWebhookRollbackRehearsalReceiptRow("external_calls_zero", "External calls zero", freezeAuditRegister.freezeAuditRegisterDigest, 0)
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

function providerWebhookReviewQaHandoffCertifiedReleaseControlRoomPacket(): ProviderWebhookReviewQaHandoffCertifiedReleaseControlRoomPacket {
  const rollbackRehearsalReceipt = providerWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt();
  const controlRoomPacketDigest = "sha256:safeqahandoffcertifiedreleasecontrolroompacket";
  const controlRoomRows = [
    providerWebhookControlRoomPacketRow("rollback_rehearsal_verified", "Rollback rehearsal receipt verified", rollbackRehearsalReceipt.rollbackRehearsalReceiptDigest, rollbackRehearsalReceipt.counts.rollbackRehearsalVerifiedCount),
    providerWebhookControlRoomPacketRow("recovery_readiness_ready", "Recovery readiness status ready", rollbackRehearsalReceipt.rollbackRehearsalReceiptDigest, rollbackRehearsalReceipt.counts.recoveryReadinessReadyCount),
    providerWebhookControlRoomPacketRow("safe_digest_chain", "Control room packet safe digest chain", controlRoomPacketDigest, 18),
    providerWebhookControlRoomPacketRow("no_state_mutation", "No control room packet state mutation", rollbackRehearsalReceipt.rollbackRehearsalReceiptDigest, 0),
    providerWebhookControlRoomPacketRow("external_calls_zero", "External calls zero", rollbackRehearsalReceipt.rollbackRehearsalReceiptDigest, 0)
  ];
  const cutoverChecklistRows = [
    providerWebhookControlRoomPacketRow("rollback_readiness_ready", "Rollback readiness remains ready", rollbackRehearsalReceipt.freezeAuditRegisterDigest, rollbackRehearsalReceipt.counts.rollbackReadinessReadyCount),
    providerWebhookControlRoomPacketRow("freeze_audit_recorded", "Freeze audit register recorded", rollbackRehearsalReceipt.freezeAuditRegisterDigest, rollbackRehearsalReceipt.counts.freezeAuditRegisteredCount),
    providerWebhookControlRoomPacketRow("release_frozen", "Certified release remains frozen", rollbackRehearsalReceipt.freezeAuditRegisterDigest, 1),
    providerWebhookControlRoomPacketRow("final_readiness_ready", "Final readiness remains ready", rollbackRehearsalReceipt.finalReadinessCertificateDigest, rollbackRehearsalReceipt.counts.finalReadinessReadyCount),
    providerWebhookControlRoomPacketRow("go_decision_confirmed", "Go/no-go decision remains go", controlRoomPacketDigest, 1)
  ];
  const operatorHandoffRows = [
    providerWebhookControlRoomPacketRow("operator_checklist_complete", "Operator checklist complete", rollbackRehearsalReceipt.handoffPacketDigest, rollbackRehearsalReceipt.counts.operatorChecklistCompleteCount),
    providerWebhookControlRoomPacketRow("acknowledgement_complete", "Acknowledged checklist complete", rollbackRehearsalReceipt.acceptanceRecordDigest, rollbackRehearsalReceipt.counts.acknowledgedChecklistCompleteCount),
    providerWebhookControlRoomPacketRow("execution_checklist_complete", "Execution checklist complete", rollbackRehearsalReceipt.noopExecutionDryRunDigest, rollbackRehearsalReceipt.counts.executionChecklistCompleteCount),
    providerWebhookControlRoomPacketRow("receipt_issued", "Decision receipt issued", rollbackRehearsalReceipt.decisionReceiptDigest, 1),
    providerWebhookControlRoomPacketRow("packet_issued", "Handoff packet issued", controlRoomPacketDigest, 1)
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

function providerWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceipt(): ProviderWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceipt {
  const controlRoomPacket = providerWebhookReviewQaHandoffCertifiedReleaseControlRoomPacket();
  const cutoverChecklistReceiptDigest = "sha256:safeqahandoffcertifiedreleasecutoverchecklistreceipt";
  const operatorCommandRows = [
    providerWebhookCutoverChecklistReceiptRow("operator_checklist_complete", "Operator checklist complete", controlRoomPacket.handoffPacketDigest, controlRoomPacket.counts.operatorChecklistCompleteCount),
    providerWebhookCutoverChecklistReceiptRow("acknowledgement_complete", "Acknowledged checklist complete", controlRoomPacket.acceptanceRecordDigest, controlRoomPacket.counts.acknowledgedChecklistCompleteCount),
    providerWebhookCutoverChecklistReceiptRow("execution_checklist_complete", "Execution checklist complete", controlRoomPacket.noopExecutionDryRunDigest, controlRoomPacket.counts.executionChecklistCompleteCount),
    providerWebhookCutoverChecklistReceiptRow("handoff_ready", "Certified release handoff ready", controlRoomPacket.handoffPacketDigest, 1),
    providerWebhookCutoverChecklistReceiptRow("no_op_execution", "No-op execution mode enforced", controlRoomPacket.noopExecutionDryRunDigest, 1),
    providerWebhookCutoverChecklistReceiptRow("operator_command_ready", "Safe operator command handoff ready", cutoverChecklistReceiptDigest, 1)
  ];
  const safeCutoverChecklistRows = [
    providerWebhookCutoverChecklistReceiptRow("control_room_ready", "Control room packet ready", controlRoomPacket.controlRoomPacketDigest, controlRoomPacket.counts.controlRoomReadyCount),
    providerWebhookCutoverChecklistReceiptRow("cutover_readiness_ready", "Cutover readiness ready", controlRoomPacket.controlRoomPacketDigest, controlRoomPacket.counts.cutoverChecklistReadyCount),
    providerWebhookCutoverChecklistReceiptRow("rollback_rehearsal_verified", "Rollback rehearsal receipt verified", controlRoomPacket.rollbackRehearsalReceiptDigest, controlRoomPacket.counts.rollbackRehearsalVerifiedCount),
    providerWebhookCutoverChecklistReceiptRow("recovery_readiness_ready", "Recovery readiness ready", controlRoomPacket.rollbackRehearsalReceiptDigest, controlRoomPacket.counts.recoveryReadinessReadyCount),
    providerWebhookCutoverChecklistReceiptRow("rollback_readiness_ready", "Rollback readiness ready", controlRoomPacket.freezeAuditRegisterDigest, controlRoomPacket.counts.rollbackReadinessReadyCount),
    providerWebhookCutoverChecklistReceiptRow("freeze_audit_recorded", "Freeze audit register recorded", controlRoomPacket.freezeAuditRegisterDigest, controlRoomPacket.counts.freezeAuditRegisteredCount),
    providerWebhookCutoverChecklistReceiptRow("release_frozen", "Certified release frozen", controlRoomPacket.freezeAuditRegisterDigest, 1),
    providerWebhookCutoverChecklistReceiptRow("final_readiness_ready", "Final readiness certificate ready", controlRoomPacket.finalReadinessCertificateDigest, controlRoomPacket.counts.finalReadinessReadyCount),
    providerWebhookCutoverChecklistReceiptRow("ledger_recorded", "Dry-run result ledger recorded", controlRoomPacket.dryRunResultLedgerDigest, controlRoomPacket.counts.resultLedgerRowRecordedCount),
    providerWebhookCutoverChecklistReceiptRow("dry_run_passed", "No-op execution dry-run passed", controlRoomPacket.noopExecutionDryRunDigest, controlRoomPacket.counts.dryRunRowPassedCount),
    providerWebhookCutoverChecklistReceiptRow("release_decision_go", "Release decision remains go", controlRoomPacket.decisionReceiptDigest, 1),
    providerWebhookCutoverChecklistReceiptRow("safe_digest_chain", "Cutover checklist receipt safe digest chain", cutoverChecklistReceiptDigest, 19),
    providerWebhookCutoverChecklistReceiptRow("no_state_mutation", "No cutover checklist receipt state mutation", controlRoomPacket.controlRoomPacketDigest, 0),
    providerWebhookCutoverChecklistReceiptRow("external_calls_zero", "External calls zero", controlRoomPacket.controlRoomPacketDigest, 0)
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

function providerWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceipt(): ProviderWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceipt {
  const cutoverChecklistReceipt = providerWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceipt();
  const operatorCommandReceiptDigest = "sha256:safeqahandoffcertifiedreleaseoperatorcommandreceipt";
  const goLiveAuthorizationRows = [
    providerWebhookOperatorCommandReceiptRow("cutover_checklist_verified", "Cutover checklist receipt verified", cutoverChecklistReceipt.cutoverChecklistReceiptDigest, 1),
    providerWebhookOperatorCommandReceiptRow("operator_command_ready", "Safe operator command ready", cutoverChecklistReceipt.cutoverChecklistReceiptDigest, cutoverChecklistReceipt.counts.operatorCommandReadyCount),
    providerWebhookOperatorCommandReceiptRow("go_live_authorization_ready", "Safe go-live authorization preview ready", operatorCommandReceiptDigest, 1)
  ];
  const operatorCommandReceiptRows = [
    providerWebhookOperatorCommandReceiptRow("operator_command_receipt_issued", "Operator command receipt issued", operatorCommandReceiptDigest, 1),
    providerWebhookOperatorCommandReceiptRow("safe_digest_chain", "Operator command receipt safe digest chain", operatorCommandReceiptDigest, 20)
  ];
  const commandHandoffRows = [
    providerWebhookOperatorCommandReceiptRow("no_op_execution", "No-op execution mode enforced", cutoverChecklistReceipt.noopExecutionDryRunDigest, 1),
    providerWebhookOperatorCommandReceiptRow("release_decision_go", "Release decision remains go", cutoverChecklistReceipt.decisionReceiptDigest, 1)
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

function providerWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceipt(): ProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceipt {
  const operatorCommandReceipt = providerWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceipt();
  const goLiveAuthorizationReceiptDigest = "sha256:safeqahandoffcertifiedreleasegoliveauthorizationreceipt";
  const goLiveAuthorizationReceiptRows = [
    providerWebhookGoLiveAuthorizationReceiptRow("operator_command_receipt_issued", "Operator command receipt issued", operatorCommandReceipt.operatorCommandReceiptDigest, 1),
    providerWebhookGoLiveAuthorizationReceiptRow("launch_window_ready", "Safe launch window ready", goLiveAuthorizationReceiptDigest, 1)
  ];
  const launchWindowRows = [
    providerWebhookGoLiveAuthorizationReceiptRow("control_room_ready", "Control room packet ready", operatorCommandReceipt.controlRoomPacketDigest, 1),
    providerWebhookGoLiveAuthorizationReceiptRow("safe_digest_chain", "Go-live authorization receipt safe digest chain", goLiveAuthorizationReceiptDigest, 21)
  ];
  const safeLaunchWindowRows = [
    providerWebhookGoLiveAuthorizationReceiptRow("no_op_execution", "No-op execution mode enforced", operatorCommandReceipt.noopExecutionDryRunDigest, 1),
    providerWebhookGoLiveAuthorizationReceiptRow("release_decision_go", "Release decision remains go", operatorCommandReceipt.decisionReceiptDigest, 1)
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

function providerWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceipt(): ProviderWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceipt {
  const goLiveAuthorizationReceipt = providerWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceipt();
  const launchWindowConfirmationReceiptDigest = "sha256:safeqahandoffcertifiedreleaselaunchwindowconfirmationreceipt";
  const launchWindowConfirmationRows = [
    providerWebhookLaunchWindowConfirmationReceiptRow("go_live_authorization_receipt_issued", "Go-live authorization receipt issued", goLiveAuthorizationReceipt.goLiveAuthorizationReceiptDigest, 1),
    providerWebhookLaunchWindowConfirmationReceiptRow("launch_window_confirmation_confirmed", "Launch window confirmation receipt confirmed", launchWindowConfirmationReceiptDigest, 1)
  ];
  const goLiveHoldRows = [
    providerWebhookLaunchWindowConfirmationReceiptRow("go_live_hold_ready", "Safe go-live hold register ready", launchWindowConfirmationReceiptDigest, 1),
    providerWebhookLaunchWindowConfirmationReceiptRow("safe_digest_chain", "Launch window confirmation receipt safe digest chain", launchWindowConfirmationReceiptDigest, 22)
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

function providerWebhookLaunchWindowConfirmationReceiptRow(
  key: ProviderWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceipt["launchWindowConfirmationRows"][number]["key"],
  label: string,
  safeDigest: string,
  checkedCount: number
): ProviderWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceipt["launchWindowConfirmationRows"][number] {
  return { key, label, launchWindowConfirmationStatus: "confirmed", goLiveHoldStatus: "ready", goLiveAuthorizationReceiptStatus: "issued", goLiveAuthorizationStatus: "ready", launchWindowStatus: "ready", safeLaunchWindowStatus: "ready", operatorCommandReceiptStatus: "issued", operatorCommandStatus: "ready", safeDigest, checkedCount, complete: true };
}

function providerWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceipt(): ProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceipt {
  const launchWindowConfirmationReceipt = providerWebhookReviewQaHandoffCertifiedReleaseLaunchWindowConfirmationReceipt();
  const goLiveHoldReleaseAuthorizationReceiptDigest = "sha256:safeqahandoffcertifiedreleasegoliveholdreleaseauthorizationreceipt";
  const goLiveHoldReleaseAuthorizationRows = [
    providerWebhookGoLiveHoldReleaseAuthorizationReceiptRow("launch_window_confirmation_confirmed", "Launch window confirmation receipt confirmed", launchWindowConfirmationReceipt.launchWindowConfirmationReceiptDigest, 1),
    providerWebhookGoLiveHoldReleaseAuthorizationReceiptRow("go_live_hold_release_authorized", "Safe go-live hold release authorization issued", goLiveHoldReleaseAuthorizationReceiptDigest, 1)
  ];
  const launchApprovalRows = [
    providerWebhookGoLiveHoldReleaseAuthorizationReceiptRow("operator_command_receipt_issued", "Operator command receipt issued", launchWindowConfirmationReceipt.operatorCommandReceiptDigest, 1),
    providerWebhookGoLiveHoldReleaseAuthorizationReceiptRow("launch_approval_ready", "Launch approval register ready", goLiveHoldReleaseAuthorizationReceiptDigest, 1),
    providerWebhookGoLiveHoldReleaseAuthorizationReceiptRow("safe_digest_chain", "Go-live hold release authorization receipt safe digest chain", goLiveHoldReleaseAuthorizationReceiptDigest, 23)
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

function providerWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceipt(): ProviderWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceipt {
  const goLiveHoldReleaseAuthorizationReceipt = providerWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceipt();
  const launchApprovalReceiptDigest = "sha256:safeqahandoffcertifiedreleaselaunchapprovalreceipt";
  const noExecutionGuardRows = [
    providerWebhookLaunchApprovalReceiptRow("go_live_hold_release_authorized", "Go-live hold release authorization remains authorized", goLiveHoldReleaseAuthorizationReceipt.goLiveHoldReleaseAuthorizationReceiptDigest, 1),
    providerWebhookLaunchApprovalReceiptRow("launch_approval_receipt_issued", "Launch approval receipt issued", launchApprovalReceiptDigest, 1),
    providerWebhookLaunchApprovalReceiptRow("no_execution_guard_retained", "No execution guard retained", goLiveHoldReleaseAuthorizationReceipt.safeDigest, 1),
    providerWebhookLaunchApprovalReceiptRow("launch_approval_ready", "Launch approval remains ready", goLiveHoldReleaseAuthorizationReceipt.goLiveHoldReleaseAuthorizationReceiptDigest, 1),
    providerWebhookLaunchApprovalReceiptRow("external_calls_zero", "External calls zero", goLiveHoldReleaseAuthorizationReceipt.safeDigest, 0),
    providerWebhookLaunchApprovalReceiptRow("no_state_mutation", "No launch approval receipt state mutation", goLiveHoldReleaseAuthorizationReceipt.safeDigest, 0),
    providerWebhookLaunchApprovalReceiptRow("safe_digest_chain", "Launch approval receipt safe digest chain", launchApprovalReceiptDigest, 24)
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

function providerWebhookGoLiveHoldReleaseAuthorizationReceiptRow(
  key: ProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceipt["goLiveHoldReleaseAuthorizationRows"][number]["key"],
  label: string,
  safeDigest: string,
  checkedCount: number
): ProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveHoldReleaseAuthorizationReceipt["goLiveHoldReleaseAuthorizationRows"][number] {
  return { key, label, goLiveHoldReleaseAuthorizationStatus: "authorized", launchApprovalStatus: "ready", launchWindowConfirmationStatus: "confirmed", goLiveHoldStatus: "ready", goLiveAuthorizationReceiptStatus: "issued", goLiveAuthorizationStatus: "ready", launchWindowStatus: "ready", safeLaunchWindowStatus: "ready", operatorCommandReceiptStatus: "issued", operatorCommandStatus: "ready", safeDigest, checkedCount, complete: true };
}

function providerWebhookLaunchApprovalReceiptRow(
  key: ProviderWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceipt["noExecutionGuardRows"][number]["key"],
  label: string,
  safeDigest: string,
  checkedCount: number
): ProviderWebhookReviewQaHandoffCertifiedReleaseLaunchApprovalReceipt["noExecutionGuardRows"][number] {
  return { key, label, goLiveHoldReleaseAuthorizationStatus: "authorized", launchApprovalStatus: "ready", launchApprovalReceiptStatus: "issued", noExecutionGuardStatus: "retained", launchWindowConfirmationStatus: "confirmed", goLiveHoldStatus: "ready", goLiveAuthorizationReceiptStatus: "issued", goLiveAuthorizationStatus: "ready", launchWindowStatus: "ready", safeLaunchWindowStatus: "ready", operatorCommandReceiptStatus: "issued", operatorCommandStatus: "ready", safeDigest, checkedCount, complete: true };
}

function providerWebhookFreezeAuditRegisterRow(
  key: ProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister["freezeAuditRows"][number]["key"],
  label: string,
  safeDigest: string,
  checkedCount: number
): ProviderWebhookReviewQaHandoffCertifiedReleaseFreezeAuditRegister["freezeAuditRows"][number] {
  return { key, label, freezeAuditStatus: "recorded", rollbackReadinessStatus: "ready", safeDigest, checkedCount, complete: true };
}

function providerWebhookRollbackRehearsalReceiptRow(
  key: ProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt["rollbackRehearsalRows"][number]["key"],
  label: string,
  safeDigest: string,
  checkedCount: number
): ProviderWebhookReviewQaHandoffCertifiedReleaseRollbackRehearsalReceipt["rollbackRehearsalRows"][number] {
  return { key, label, rollbackRehearsalStatus: "verified", recoveryReadinessStatus: "ready", safeDigest, checkedCount, complete: true };
}

function providerWebhookControlRoomPacketRow(
  key: ProviderWebhookReviewQaHandoffCertifiedReleaseControlRoomPacket["controlRoomRows"][number]["key"],
  label: string,
  safeDigest: string,
  checkedCount: number
): ProviderWebhookReviewQaHandoffCertifiedReleaseControlRoomPacket["controlRoomRows"][number] {
  return { key, label, controlRoomStatus: "ready", cutoverReadinessStatus: "ready", safeDigest, checkedCount, complete: true };
}

function providerWebhookCutoverChecklistReceiptRow(
  key: ProviderWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceipt["operatorCommandRows"][number]["key"],
  label: string,
  safeDigest: string,
  checkedCount: number
): ProviderWebhookReviewQaHandoffCertifiedReleaseCutoverChecklistReceipt["operatorCommandRows"][number] {
  return { key, label, cutoverChecklistStatus: "verified", operatorCommandStatus: "ready", safeDigest, checkedCount, complete: true };
}

function providerWebhookOperatorCommandReceiptRow(
  key: ProviderWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceipt["operatorCommandReceiptRows"][number]["key"],
  label: string,
  safeDigest: string,
  checkedCount: number
): ProviderWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceipt["operatorCommandReceiptRows"][number] {
  return { key, label, operatorCommandReceiptStatus: "issued", goLiveAuthorizationStatus: "ready", cutoverChecklistStatus: "verified", operatorCommandStatus: "ready", safeDigest, checkedCount, complete: true };
}

function providerWebhookGoLiveAuthorizationReceiptRow(
  key: ProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceipt["goLiveAuthorizationReceiptRows"][number]["key"],
  label: string,
  safeDigest: string,
  checkedCount: number
): ProviderWebhookReviewQaHandoffCertifiedReleaseGoLiveAuthorizationReceipt["goLiveAuthorizationReceiptRows"][number] {
  return { key, label, goLiveAuthorizationReceiptStatus: "issued", goLiveAuthorizationStatus: "ready", launchWindowStatus: "ready", safeLaunchWindowStatus: "ready", operatorCommandReceiptStatus: "issued", operatorCommandStatus: "ready", safeDigest, checkedCount, complete: true };
}

function providerWebhookFinalReadinessCertificateRow(
  key: ProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificate["certificateRows"][number]["key"],
  label: string,
  safeDigest: string,
  checkedCount: number
): ProviderWebhookReviewQaHandoffCertifiedReleaseFinalReadinessCertificate["certificateRows"][number] {
  return { key, label, certificateStatus: "issued", finalReadinessStatus: "ready", safeDigest, checkedCount, complete: true };
}

function providerWebhookNoopExecutionChecklistItem(
  key: ProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun["executionChecklist"][number]["key"],
  label: string,
  safeDigest: string
): ProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun["executionChecklist"][number] {
  return { key, label, checklistStatus: "complete", safeDigest, complete: true };
}

function providerWebhookDryRunResultLedgerRow(
  key: ProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedger["resultLedgerRows"][number]["key"],
  label: string,
  safeDigest: string,
  checkedCount: number
): ProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedger["resultLedgerRows"][number] {
  return { key, label, rowStatus: "recorded", safeDigest, checkedCount, complete: true };
}

function providerWebhookDryRunFinalReadinessRow(
  key: ProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedger["finalReadinessRows"][number]["key"],
  label: string,
  safeDigest: string,
  checkedCount: number
): ProviderWebhookReviewQaHandoffCertifiedReleaseDryRunResultLedger["finalReadinessRows"][number] {
  return { key, label, readinessStatus: "ready", safeDigest, checkedCount, complete: true };
}

function providerWebhookNoopDryRunRow(
  key: ProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun["dryRunRows"][number]["key"],
  label: string,
  safeDigest: string,
  checkedCount: number
): ProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun["dryRunRows"][number] {
  return { key, label, dryRunRowStatus: "passed", safeDigest, checkedCount, complete: true };
}

function providerWebhookNoopExecutionPlanRow(
  key: ProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun["executionPlanRows"][number]["key"],
  label: string,
  safeDigest: string,
  checkedCount: number,
  planStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun["executionPlanRows"][number]["planStatus"]
): ProviderWebhookReviewQaHandoffCertifiedReleaseNoopExecutionDryRun["executionPlanRows"][number] {
  return { key, label, planStatus, safeDigest, checkedCount, complete: true };
}

function providerWebhookHandoffAcknowledgementRow(
  key: ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord["acknowledgementRows"][number]["key"],
  label: string,
  safeDigest: string,
  checkedCount: number
): ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord["acknowledgementRows"][number] {
  return {
    key,
    label,
    acknowledgementStatus: "acknowledged",
    safeDigest,
    checkedCount,
    complete: true
  };
}

function providerWebhookHandoffPacketRow(
  key: ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket["handoffRows"][number]["key"],
  label: string,
  safeDigest: string,
  checkedCount: number,
  handoffRowStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket["handoffRows"][number]["handoffRowStatus"] = "confirmed"
): ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket["handoffRows"][number] {
  return {
    key,
    label,
    handoffRowStatus,
    safeDigest,
    checkedCount,
    complete: true
  };
}

function providerWebhookHandoffRunbookRow(
  key: ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket["runbookRows"][number]["key"],
  label: string,
  safeDigest: string,
  ownerRole: string
): ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket["runbookRows"][number] {
  return {
    key,
    label,
    runbookStatus: "ready",
    safeDigest,
    ownerRole,
    complete: true
  };
}

function providerWebhookHandoffOperatorChecklistItem(
  key: ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket["operatorChecklist"][number]["key"],
  label: string,
  safeDigest: string
): ProviderWebhookReviewQaHandoffCertifiedReleaseHandoffPacket["operatorChecklist"][number] {
  return {
    key,
    label,
    checklistStatus: "complete",
    safeDigest,
    complete: true
  };
}

function providerWebhookDecisionReceiptRow(
  key: ProviderWebhookReviewQaHandoffCertifiedReleaseDecisionReceipt["receiptRows"][number]["key"],
  label: string,
  safeDigest: string,
  checkedCount: number,
  receiptRowStatus: ProviderWebhookReviewQaHandoffCertifiedReleaseDecisionReceipt["receiptRows"][number]["receiptRowStatus"] = "confirmed"
): ProviderWebhookReviewQaHandoffCertifiedReleaseDecisionReceipt["receiptRows"][number] {
  return {
    key,
    label,
    receiptRowStatus,
    safeDigest,
    checkedCount,
    complete: true
  };
}

function providerWebhookReleaseClosureLedgerRow(
  key: ProviderWebhookReviewQaHandoffReleaseClosureLedger["ledgerRows"][number]["key"],
  label: string,
  ledgerStatus: ProviderWebhookReviewQaHandoffReleaseClosureLedger["ledgerRows"][number]["ledgerStatus"],
  safeDigest: string,
  checkedCount: number
): ProviderWebhookReviewQaHandoffReleaseClosureLedger["ledgerRows"][number] {
  return {
    key,
    label,
    ledgerStatus,
    safeDigest,
    checkedCount,
    complete: true
  };
}

function providerWebhookReleaseAttestationAuditRow(
  key: ProviderWebhookReviewQaHandoffReleaseAttestationAudit["attestationRows"][number]["key"],
  label: string,
  attestationStatus: ProviderWebhookReviewQaHandoffReleaseAttestationAudit["attestationRows"][number]["attestationStatus"],
  safeDigest: string,
  checkedCount: number
): ProviderWebhookReviewQaHandoffReleaseAttestationAudit["attestationRows"][number] {
  return {
    key,
    label,
    attestationStatus,
    safeDigest,
    checkedCount,
    complete: true
  };
}

function providerWebhookReleaseAttestationReconciliationRow(
  key: ProviderWebhookReviewQaHandoffReleaseAttestationReconciliationRegister["reconciliationRows"][number]["key"],
  label: string,
  reconciliationStatus: ProviderWebhookReviewQaHandoffReleaseAttestationReconciliationRegister["reconciliationRows"][number]["reconciliationStatus"],
  safeDigest: string,
  checkedCount: number
): ProviderWebhookReviewQaHandoffReleaseAttestationReconciliationRegister["reconciliationRows"][number] {
  return {
    key,
    label,
    reconciliationStatus,
    safeDigest,
    checkedCount,
    aligned: true
  };
}

function providerWebhookReviewSavedView(): ProviderWebhookReviewSavedView {
  return {
    id: "provider-webhook-review-view-1",
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

function providerWebhookOperatorNote(): ProviderWebhookOperatorNote {
  return {
    id: "provider-webhook-operator-note-1",
    unmatchedId: "provider-webhook-unmatched-1",
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

function providerWebhookDiagnostics(): ProviderWebhookUnmatchedInboundDiagnostics {
  return {
    unmatchedId: "provider-webhook-unmatched-1",
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
    ...providerWebhookResolutionFields(),
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
      staleOpenItem: true
    },
    externalCalls: 0
  };
}

function providerWebhookHistory(): ProviderWebhookUnmatchedInboundHistory {
  return {
    unmatchedInboundId: "provider-webhook-unmatched-1",
    provider: "line",
    channelAccountId: "sandbox:line",
    safeRoomLabel: "line room digest saferoomdige",
    roomKeyDigest: "sha256:saferoomdigest",
    entries: [
      providerWebhookHistoryEntry("inbound_received", "received", null, "received"),
      providerWebhookHistoryEntry("normalized_routed", "normalized/dry-run-only", "received", "dry-run-only"),
      providerWebhookHistoryEntry("unmatched_queued", "review-needed", "dry-run-only", "review-needed")
    ],
    externalCalls: 0
  };
}

function providerWebhookHistoryEntry(
  action: ProviderWebhookUnmatchedInboundHistory["entries"][number]["action"],
  actionStatus: string,
  statusBefore: string | null,
  statusAfter: string | null
): ProviderWebhookUnmatchedInboundHistory["entries"][number] {
  return {
    id: `provider-webhook-history-${action}`,
    unmatchedInboundId: "provider-webhook-unmatched-1",
    provider: "line",
    channelAccountId: "sandbox:line",
    safeRoomLabel: "line room digest saferoomdige",
    roomKeyDigest: "sha256:saferoomdigest",
    eventType: "message.created",
    action,
    actionStatus,
    statusBefore,
    statusAfter,
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

function providerWebhookExport(): ProviderWebhookUnmatchedInboundExport {
  return {
    format: "json",
    rows: [{
      id: "provider-webhook-unmatched-1",
      provider: "line",
      channelAccountId: "sandbox:line",
      safeRoomLabel: "line room digest saferoomdige",
      roomKeyDigest: "sha256:saferoomdigest",
      eventType: "message.created",
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      receivedAt: "2026-05-31T00:00:00.000Z",
      reviewedAt: null,
      linkedConversationId: null,
      candidateCount: 1,
      safeMessagePreview: "Safe sandbox preview",
      safeReason: "safe-review-required-no-conversation-match",
      safeResultSummary: "pending",
      assignmentStatus: "unassigned",
      assignedToOperatorLabel: null,
      assignedAt: null,
      escalationStatus: "none",
      escalationReason: null,
      escalatedAt: null,
      resolutionStatus: "unresolved",
      resolutionOutcome: null,
      closureReadiness: "NOT_READY",
      checklistCompletedCount: 1,
      checklistTotalCount: 9,
      externalCalls: 0
    }],
    csv: null,
    appliedFilters: {
      format: "json",
      limit: 10,
      offset: 0,
      sortBy: "receivedAt",
      sortOrder: "desc"
    },
    appliedSort: {
      sortBy: "receivedAt",
      sortOrder: "desc"
    },
    requestedLimit: 10,
    exportMaxLimit: 500,
    exportedCount: 1,
    externalCalls: 0
  };
}

function providerWebhookCandidateConversation(): ProviderWebhookCandidateConversation {
  return {
    conversationId: "conversation-safe-internal",
    platform: "line",
    channelAccountId: "sandbox:line",
    roomIdDigest: "sha256:saferoomdigest",
    safeRoomLabel: "line conversation digest match",
    latestMessagePreview: "Safe candidate preview",
    latestMessageAt: "2026-05-31T00:00:00.000Z",
    matchReason: "platform, channel account, and room digest match",
    matchConfidence: 0.98,
    externalCalls: 0
  };
}

function providerWebhookBulkReviewResult() {
  return {
    reviewStatus: "reviewed" as const,
    results: [
      {
        id: "provider-webhook-unmatched-1",
        ok: true,
        resultStatus: "updated" as const,
        reviewStatus: "reviewed" as const,
        unmatchedStatus: "reviewed" as const,
        error: null,
        externalCalls: 0 as const
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
    externalCalls: 0 as const
  };
}
