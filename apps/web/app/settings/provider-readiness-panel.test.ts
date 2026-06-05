import React from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { ProviderReadiness, ProviderWebhookCandidateConversation, ProviderWebhookEvent, ProviderWebhookOperatorNote, ProviderWebhookReviewAlerts, ProviderWebhookReviewClosureEvidence, ProviderWebhookReviewClosureEvidenceExport, ProviderWebhookReviewExportIntegrity, ProviderWebhookReviewExportManifest, ProviderWebhookReviewQaHandoffArchiveIntegrity, ProviderWebhookReviewQaHandoffBundle, ProviderWebhookReviewQaHandoffBundleExport, ProviderWebhookReviewQaHandoffRetentionAudit, ProviderWebhookReviewQaHandoffReceipt, ProviderWebhookReviewQaHandoffSignOffResponse, ProviderWebhookReviewExportRedactionAudit, ProviderWebhookReviewClosureReport, ProviderWebhookReviewClosureReportExport, ProviderWebhookReviewMetrics, ProviderWebhookReviewResolutionSummary, ProviderWebhookReviewSavedView, ProviderWebhookReviewTriage, ProviderWebhookReviewWorkload, ProviderWebhookUnmatchedInboundDiagnostics, ProviderWebhookUnmatchedInboundExport, ProviderWebhookUnmatchedInboundHistory, ProviderWebhookUnmatchedInboundItem } from "@ai-omni/shared";
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
