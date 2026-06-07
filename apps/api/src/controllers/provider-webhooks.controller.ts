import { BadRequestException, Body, Controller, Get, Headers, Inject, Param, Patch, Post, Query } from "@nestjs/common";
import { providerWebhookReviewAlertsFiltersSchema, providerWebhookReviewClosureReportFiltersSchema, providerWebhookReviewMetricsFiltersSchema, providerWebhookReviewResolutionSummaryFiltersSchema, providerWebhookReviewTriageFiltersSchema, providerWebhookReviewWorkloadFiltersSchema, providerWebhookUnmatchedInboundExportQuerySchema, providerWebhookUnmatchedInboundFiltersSchema, providerWebhookUnmatchedInboundStatusFilterSchema } from "@ai-omni/shared";
import { ProviderWebhookEventsService } from "../services/provider-webhook-events.service.js";

@Controller("provider-webhooks")
export class ProviderWebhooksController {
  constructor(@Inject(ProviderWebhookEventsService) private readonly events: ProviderWebhookEventsService) {}

  @Get("events")
  listEvents(@Headers("x-tenant-id") tenant: string | undefined) {
    return this.events.list(requireTenantId(tenant));
  }

  @Get("review-metrics")
  getReviewMetrics(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Query() query: unknown,
    @Headers("x-user-id") userId?: string
  ) {
    return this.events.getReviewMetrics(requireTenantId(tenant), parseReviewMetricsFilters(query), userId);
  }

  @Get("review-alerts")
  getReviewAlerts(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Query() query: unknown,
    @Headers("x-user-id") userId?: string
  ) {
    return this.events.getReviewAlerts(requireTenantId(tenant), parseReviewAlertsFilters(query), userId);
  }

  @Get("review-triage")
  getReviewTriage(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Query() query: unknown,
    @Headers("x-user-id") userId?: string
  ) {
    return this.events.getReviewTriage(requireTenantId(tenant), parseReviewTriageFilters(query), userId);
  }

  @Get("review-workload")
  getReviewWorkload(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Query() query: unknown,
    @Headers("x-user-id") userId?: string
  ) {
    return this.events.getReviewWorkload(requireTenantId(tenant), parseReviewWorkloadFilters(query), userId);
  }

  @Get("review-resolution-summary")
  getReviewResolutionSummary(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Query() query: unknown,
    @Headers("x-user-id") userId?: string
  ) {
    return this.events.getReviewResolutionSummary(requireTenantId(tenant), parseReviewResolutionSummaryFilters(query), userId);
  }

  @Get("review-closure-report")
  getReviewClosureReport(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Query() query: unknown,
    @Headers("x-user-id") userId?: string
  ) {
    return this.events.getReviewClosureReport(requireTenantId(tenant), parseReviewClosureReportFilters(query), userId);
  }

  @Get("review-qa-handoff-bundle")
  getReviewQaHandoffBundle(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Query() query: unknown,
    @Headers("x-user-id") userId?: string
  ) {
    return this.events.getReviewQaHandoffBundle(requireTenantId(tenant), parseReviewClosureReportFilters(query), userId);
  }

  @Get("review-qa-handoff-bundle/export")
  exportReviewQaHandoffBundle(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Query() query: unknown,
    @Headers("x-user-id") userId?: string
  ) {
    return this.events.getReviewQaHandoffBundleExport(requireTenantId(tenant), parseReviewClosureReportFilters(query), userId);
  }

  @Get("review-qa-handoff-bundle/receipt")
  getReviewQaHandoffBundleReceipt(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Query() query: unknown,
    @Headers("x-user-id") userId?: string
  ) {
    return this.events.getReviewQaHandoffBundleReceipt(requireTenantId(tenant), parseReviewClosureReportFilters(query), userId);
  }

  @Post("review-qa-handoff-bundle/receipt/sign-off")
  signOffReviewQaHandoffBundleReceipt(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Query() query: unknown,
    @Headers("x-user-id") userId: string | undefined,
    @Body() body: unknown
  ) {
    return this.events.signOffReviewQaHandoffBundleReceipt(requireTenantId(tenant), parseReviewClosureReportFilters(query), body, userId);
  }

  @Get("review-qa-handoff-bundle/acceptance-lock")
  getReviewQaHandoffAcceptanceLock(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Query() query: unknown,
    @Headers("x-user-id") userId?: string
  ) {
    return this.events.getReviewQaHandoffAcceptanceLock(requireTenantId(tenant), parseReviewClosureReportFilters(query), userId);
  }

  @Post("review-qa-handoff-bundle/acceptance-lock")
  lockReviewQaHandoffAcceptance(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Query() query: unknown,
    @Headers("x-user-id") userId: string | undefined,
    @Body() body: unknown
  ) {
    return this.events.lockReviewQaHandoffAcceptance(requireTenantId(tenant), parseReviewClosureReportFilters(query), body, userId);
  }

  @Get("review-qa-handoff-bundle/locked-archive")
  getReviewQaHandoffLockedArchive(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Query() query: unknown,
    @Headers("x-user-id") userId?: string
  ) {
    return this.events.getReviewQaHandoffLockedArchive(requireTenantId(tenant), parseReviewClosureReportFilters(query), userId);
  }

  @Get("review-qa-handoff-bundle/locked-archive/export")
  exportReviewQaHandoffLockedArchive(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Query() query: unknown,
    @Headers("x-user-id") userId?: string
  ) {
    return this.events.exportReviewQaHandoffLockedArchive(requireTenantId(tenant), parseReviewClosureReportFilters(query), userId);
  }

  @Get("review-qa-handoff-bundle/locked-archive/retention-manifest")
  getReviewQaHandoffRetentionManifest(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Query() query: unknown,
    @Headers("x-user-id") userId?: string
  ) {
    return this.events.getReviewQaHandoffRetentionManifest(requireTenantId(tenant), parseReviewClosureReportFilters(query), userId);
  }

  @Get("review-qa-handoff-bundle/locked-archive/integrity")
  getReviewQaHandoffArchiveIntegrity(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Query() query: unknown,
    @Headers("x-user-id") userId?: string
  ) {
    return this.events.getReviewQaHandoffArchiveIntegrity(requireTenantId(tenant), parseReviewClosureReportFilters(query), userId);
  }

  @Get("review-qa-handoff-bundle/locked-archive/retention-audit")
  getReviewQaHandoffRetentionAudit(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Query() query: unknown,
    @Headers("x-user-id") userId?: string
  ) {
    return this.events.getReviewQaHandoffRetentionAudit(requireTenantId(tenant), parseReviewClosureReportFilters(query), userId);
  }

  @Get("review-qa-handoff-bundle/locked-archive/finalization")
  getReviewQaHandoffArchiveFinalization(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Query() query: unknown,
    @Headers("x-user-id") userId?: string
  ) {
    return this.events.getReviewQaHandoffArchiveFinalization(requireTenantId(tenant), parseReviewClosureReportFilters(query), userId);
  }

  @Post("review-qa-handoff-bundle/locked-archive/finalization/sign-off")
  signOffReviewQaHandoffArchiveFinalization(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Query() query: unknown,
    @Headers("x-user-id") userId: string | undefined,
    @Body() body: unknown
  ) {
    return this.events.signOffReviewQaHandoffArchiveFinalization(requireTenantId(tenant), parseReviewClosureReportFilters(query), body, userId);
  }

  @Get("review-qa-handoff-bundle/locked-archive/finalization/receipt")
  getReviewQaHandoffArchiveFinalizationReceipt(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Query() query: unknown,
    @Headers("x-user-id") userId?: string
  ) {
    return this.events.getReviewQaHandoffArchiveFinalizationReceipt(requireTenantId(tenant), parseReviewClosureReportFilters(query), userId);
  }

  @Get("review-qa-handoff-bundle/locked-archive/finalization/release-evidence")
  getReviewQaHandoffArchiveReleaseEvidence(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Query() query: unknown,
    @Headers("x-user-id") userId?: string
  ) {
    return this.events.getReviewQaHandoffArchiveReleaseEvidence(requireTenantId(tenant), parseReviewClosureReportFilters(query), userId);
  }

  @Get("review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification")
  getReviewQaHandoffArchiveReleaseVerification(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Query() query: unknown,
    @Headers("x-user-id") userId?: string
  ) {
    return this.events.getReviewQaHandoffArchiveReleaseVerification(requireTenantId(tenant), parseReviewClosureReportFilters(query), userId);
  }

  @Get("review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification")
  getReviewQaHandoffArchiveReleaseCertification(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Query() query: unknown,
    @Headers("x-user-id") userId?: string
  ) {
    return this.events.getReviewQaHandoffArchiveReleaseCertification(requireTenantId(tenant), parseReviewClosureReportFilters(query), userId);
  }

  @Get("review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger")
  getReviewQaHandoffArchiveReleaseClosureLedger(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Query() query: unknown,
    @Headers("x-user-id") userId?: string
  ) {
    return this.events.getReviewQaHandoffArchiveReleaseClosureLedger(requireTenantId(tenant), parseReviewClosureReportFilters(query), userId);
  }

  @Get("review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit")
  getReviewQaHandoffArchiveReleaseAttestationAudit(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Query() query: unknown,
    @Headers("x-user-id") userId?: string
  ) {
    return this.events.getReviewQaHandoffArchiveReleaseAttestationAudit(requireTenantId(tenant), parseReviewClosureReportFilters(query), userId);
  }

  @Get("review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation")
  getReviewQaHandoffArchiveReleaseAttestationReconciliation(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Query() query: unknown,
    @Headers("x-user-id") userId?: string
  ) {
    return this.events.getReviewQaHandoffArchiveReleaseAttestationReconciliation(requireTenantId(tenant), parseReviewClosureReportFilters(query), userId);
  }

  @Get("review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate")
  getReviewQaHandoffCertifiedReleaseGate(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Query() query: unknown,
    @Headers("x-user-id") userId?: string
  ) {
    return this.events.getReviewQaHandoffCertifiedReleaseGate(requireTenantId(tenant), parseReviewClosureReportFilters(query), userId);
  }

  @Get("review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt")
  getReviewQaHandoffCertifiedReleaseDecisionReceipt(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Query() query: unknown,
    @Headers("x-user-id") userId?: string
  ) {
    return this.events.getReviewQaHandoffCertifiedReleaseDecisionReceipt(requireTenantId(tenant), parseReviewClosureReportFilters(query), userId);
  }

  @Get("review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt/handoff-packet")
  getReviewQaHandoffCertifiedReleaseHandoffPacket(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Query() query: unknown,
    @Headers("x-user-id") userId?: string
  ) {
    return this.events.getReviewQaHandoffCertifiedReleaseHandoffPacket(requireTenantId(tenant), parseReviewClosureReportFilters(query), userId);
  }

  @Get("review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt/handoff-packet/acceptance-record")
  getReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Query() query: unknown,
    @Headers("x-user-id") userId?: string
  ) {
    return this.events.getReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord(requireTenantId(tenant), parseReviewClosureReportFilters(query), userId);
  }

  @Post("review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt/handoff-packet/acceptance-record")
  acknowledgeReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Query() query: unknown,
    @Headers("x-user-id") userId: string | undefined,
    @Body() body: unknown
  ) {
    return this.events.acknowledgeReviewQaHandoffCertifiedReleaseHandoffAcceptanceRecord(requireTenantId(tenant), parseReviewClosureReportFilters(query), body, userId);
  }

  @Get("review-closure-report/export")
  exportReviewClosureReport(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Query() query: unknown,
    @Headers("x-user-id") userId?: string
  ) {
    return this.events.getReviewClosureReportExport(requireTenantId(tenant), parseReviewClosureReportFilters(query), userId);
  }

  @Get("review-closure-report/export/manifest")
  getReviewClosureReportExportManifest(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Query() query: unknown,
    @Headers("x-user-id") userId?: string
  ) {
    return this.events.getReviewClosureReportExportManifest(requireTenantId(tenant), parseReviewClosureReportFilters(query), userId);
  }

  @Get("review-closure-report/redaction-audit")
  getReviewClosureReportRedactionAudit(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Query() query: unknown,
    @Headers("x-user-id") userId?: string
  ) {
    return this.events.getReviewClosureReportRedactionAudit(requireTenantId(tenant), parseReviewClosureReportFilters(query), userId);
  }

  @Get("review-closure-export-integrity")
  getReviewClosureExportIntegrity(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Query() query: unknown,
    @Headers("x-user-id") userId?: string
  ) {
    return this.events.getReviewClosureExportIntegrity(requireTenantId(tenant), parseReviewClosureReportFilters(query), userId);
  }

  @Get("review-saved-views")
  listReviewSavedViews(@Headers("x-tenant-id") tenant: string | undefined) {
    return this.events.listReviewSavedViews(requireTenantId(tenant));
  }

  @Post("review-saved-views")
  createReviewSavedView(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Headers("x-user-id") userId: string | undefined,
    @Body() body: unknown
  ) {
    return this.events.createReviewSavedView(requireTenantId(tenant), body, userId);
  }

  @Patch("review-saved-views/:id")
  updateReviewSavedView(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Headers("x-user-id") userId: string | undefined,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    return this.events.updateReviewSavedView(requireTenantId(tenant), id, body, userId);
  }

  @Patch("review-saved-views/:id/archive")
  archiveReviewSavedView(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Headers("x-user-id") userId: string | undefined,
    @Param("id") id: string
  ) {
    return this.events.archiveReviewSavedView(requireTenantId(tenant), id, userId);
  }

  @Get("unmatched-inbound")
  listUnmatchedInbound(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Query() query: unknown,
    @Headers("x-user-id") userId?: string
  ): any {
    const filters = parseUnmatchedInboundFilters(query);
    return shouldReturnPagedUnmatchedInbound(query)
      ? this.events.listUnmatchedInboundPage(requireTenantId(tenant), filters, userId)
      : this.events.listUnmatchedInbound(requireTenantId(tenant), filters, userId);
  }

  @Get("unmatched-inbound/export")
  exportUnmatchedInbound(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Query() query: unknown
  ) {
    const filters = parseUnmatchedInboundExportQuery(query);
    return this.events.exportUnmatchedInboundQueue(requireTenantId(tenant), filters);
  }

  @Get("unmatched-inbound/:id/closure-evidence")
  getUnmatchedInboundClosureEvidence(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Param("id") id: string
  ) {
    return this.events.getUnmatchedInboundClosureEvidence(requireTenantId(tenant), id);
  }

  @Get("unmatched-inbound/:id/closure-evidence/export")
  exportUnmatchedInboundClosureEvidence(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Param("id") id: string
  ) {
    return this.events.getUnmatchedInboundClosureEvidenceExport(requireTenantId(tenant), id);
  }

  @Get("unmatched-inbound/:id/closure-evidence/export/manifest")
  getUnmatchedInboundClosureEvidenceExportManifest(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Param("id") id: string
  ) {
    return this.events.getUnmatchedInboundClosureEvidenceExportManifest(requireTenantId(tenant), id);
  }

  @Get("unmatched-inbound/:id/closure-evidence/redaction-audit")
  getUnmatchedInboundClosureEvidenceRedactionAudit(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Param("id") id: string
  ) {
    return this.events.getUnmatchedInboundClosureEvidenceRedactionAudit(requireTenantId(tenant), id);
  }

  @Get("unmatched-inbound/:id/operator-notes")
  listOperatorNotes(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Param("id") id: string
  ) {
    return this.events.listOperatorNotes(requireTenantId(tenant), id);
  }

  @Post("unmatched-inbound/:id/operator-notes")
  createOperatorNote(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Headers("x-user-id") userId: string | undefined,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    return this.events.createOperatorNote(requireTenantId(tenant), id, body, userId);
  }

  @Get("unmatched-inbound/:id/diagnostics")
  getUnmatchedInboundDiagnostics(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Param("id") id: string
  ) {
    return this.events.getUnmatchedInboundDiagnostics(requireTenantId(tenant), id);
  }

  @Get("unmatched-inbound/:id/history")
  listUnmatchedInboundHistory(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Param("id") id: string
  ) {
    return this.events.listUnmatchedInboundHistory(requireTenantId(tenant), id);
  }

  @Get("unmatched-inbound/:id/candidates")
  listUnmatchedInboundCandidates(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Param("id") id: string
  ) {
    return this.events.listUnmatchedInboundCandidates(requireTenantId(tenant), id);
  }

  @Patch("unmatched-inbound/:id/review")
  reviewUnmatchedInbound(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Headers("x-user-id") userId: string | undefined,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    return this.events.reviewUnmatchedInbound(requireTenantId(tenant), id, body, userId);
  }

  @Patch("unmatched-inbound/:id/assignment")
  assignUnmatchedInbound(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Headers("x-user-id") userId: string | undefined,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    return this.events.assignUnmatchedInbound(requireTenantId(tenant), id, body, userId);
  }

  @Patch("unmatched-inbound/:id/escalation")
  escalateUnmatchedInbound(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Headers("x-user-id") userId: string | undefined,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    return this.events.escalateUnmatchedInbound(requireTenantId(tenant), id, body, userId);
  }

  @Patch("unmatched-inbound/:id/resolution")
  resolveUnmatchedInbound(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Headers("x-user-id") userId: string | undefined,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    return this.events.resolveUnmatchedInbound(requireTenantId(tenant), id, body, userId);
  }

  @Patch("unmatched-inbound/:id/resolution-checklist")
  updateUnmatchedInboundChecklist(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Headers("x-user-id") userId: string | undefined,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    return this.events.updateUnmatchedInboundChecklist(requireTenantId(tenant), id, body, userId);
  }

  @Patch("unmatched-inbound/bulk-review")
  bulkReviewUnmatchedInbound(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Headers("x-user-id") userId: string | undefined,
    @Body() body: unknown
  ) {
    return this.events.bulkReviewUnmatchedInbound(requireTenantId(tenant), body, userId);
  }

  @Patch("unmatched-inbound/bulk-assignment")
  bulkAssignUnmatchedInbound(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Headers("x-user-id") userId: string | undefined,
    @Body() body: unknown
  ) {
    return this.events.bulkAssignUnmatchedInbound(requireTenantId(tenant), body, userId);
  }

  @Patch("unmatched-inbound/bulk-escalation")
  bulkEscalateUnmatchedInbound(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Headers("x-user-id") userId: string | undefined,
    @Body() body: unknown
  ) {
    return this.events.bulkEscalateUnmatchedInbound(requireTenantId(tenant), body, userId);
  }

  @Patch("unmatched-inbound/bulk-resolution")
  bulkResolveUnmatchedInbound(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Headers("x-user-id") userId: string | undefined,
    @Body() body: unknown
  ) {
    return this.events.bulkResolveUnmatchedInbound(requireTenantId(tenant), body, userId);
  }

  @Post("unmatched-inbound/:id/link-conversation")
  linkUnmatchedInboundToConversation(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Headers("x-user-id") userId: string | undefined,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    return this.events.linkUnmatchedInboundToConversation(requireTenantId(tenant), id, body, userId);
  }

  @Post("sandbox-events")
  createSandboxEvent(
    @Headers("x-tenant-id") tenant: string | undefined,
    @Headers("x-user-id") userId: string | undefined,
    @Body() body: unknown
  ) {
    return this.events.create(requireTenantId(tenant), body, userId);
  }
}

function requireTenantId(tenant: string | undefined) {
  const tenantId = tenant?.trim();
  if (!tenantId) throw new BadRequestException("x-tenant-id is required");
  return tenantId;
}

function parseUnmatchedInboundFilters(query: unknown) {
  if (typeof query === "string" || query === undefined) {
    const parsedStatus = providerWebhookUnmatchedInboundStatusFilterSchema.safeParse(query);
    if (!parsedStatus.success) throw new BadRequestException("Invalid unmatched inbound status filter");
    return parsedStatus.data ? { status: parsedStatus.data } : {};
  }

  if (!query || typeof query !== "object" || Array.isArray(query)) {
    throw new BadRequestException("Invalid unmatched inbound filters");
  }

  const cleaned = Object.fromEntries(
    Object.entries(query as Record<string, unknown>).filter(([, value]) =>
      typeof value === "string" && value.trim().length > 0
    )
  );
  const parsed = providerWebhookUnmatchedInboundFiltersSchema.safeParse(cleaned);
  if (!parsed.success) throw new BadRequestException("Invalid unmatched inbound filters");
  return parsed.data;
}

function parseUnmatchedInboundExportQuery(query: unknown) {
  if (!query || typeof query !== "object" || Array.isArray(query)) {
    return {};
  }

  const cleaned = Object.fromEntries(
    Object.entries(query as Record<string, unknown>).filter(([, value]) =>
      typeof value === "string" && value.trim().length > 0
    )
  );
  const parsed = providerWebhookUnmatchedInboundExportQuerySchema.safeParse(cleaned);
  if (!parsed.success) throw new BadRequestException("Invalid unmatched inbound export query");
  return parsed.data;
}

function parseReviewMetricsFilters(query: unknown) {
  if (!query || typeof query !== "object" || Array.isArray(query)) {
    return {};
  }

  const cleaned = Object.fromEntries(
    Object.entries(query as Record<string, unknown>).filter(([, value]) =>
      typeof value === "string" && value.trim().length > 0
    )
  );
  const parsed = providerWebhookReviewMetricsFiltersSchema.safeParse(cleaned);
  if (!parsed.success) throw new BadRequestException("Invalid provider webhook review metrics filters");
  return parsed.data;
}

function parseReviewAlertsFilters(query: unknown) {
  if (!query || typeof query !== "object" || Array.isArray(query)) {
    return {};
  }

  const cleaned = Object.fromEntries(
    Object.entries(query as Record<string, unknown>).filter(([, value]) =>
      typeof value === "string" && value.trim().length > 0
    )
  );
  const parsed = providerWebhookReviewAlertsFiltersSchema.safeParse(cleaned);
  if (!parsed.success) throw new BadRequestException("Invalid provider webhook review alerts filters");
  return parsed.data;
}

function parseReviewTriageFilters(query: unknown) {
  if (!query || typeof query !== "object" || Array.isArray(query)) {
    return {};
  }

  const cleaned = Object.fromEntries(
    Object.entries(query as Record<string, unknown>).filter(([, value]) =>
      typeof value === "string" && value.trim().length > 0
    )
  );
  const parsed = providerWebhookReviewTriageFiltersSchema.safeParse(cleaned);
  if (!parsed.success) throw new BadRequestException("Invalid provider webhook review triage filters");
  return parsed.data;
}

function parseReviewWorkloadFilters(query: unknown) {
  if (!query || typeof query !== "object" || Array.isArray(query)) {
    return {};
  }

  const cleaned = Object.fromEntries(
    Object.entries(query as Record<string, unknown>).filter(([, value]) =>
      typeof value === "string" && value.trim().length > 0
    )
  );
  const parsed = providerWebhookReviewWorkloadFiltersSchema.safeParse(cleaned);
  if (!parsed.success) throw new BadRequestException("Invalid provider webhook review workload filters");
  return parsed.data;
}

function parseReviewResolutionSummaryFilters(query: unknown) {
  if (!query || typeof query !== "object" || Array.isArray(query)) {
    return {};
  }

  const cleaned = Object.fromEntries(
    Object.entries(query as Record<string, unknown>).filter(([, value]) =>
      typeof value === "string" && value.trim().length > 0
    )
  );
  const parsed = providerWebhookReviewResolutionSummaryFiltersSchema.safeParse(cleaned);
  if (!parsed.success) throw new BadRequestException("Invalid provider webhook review resolution summary filters");
  return parsed.data;
}

function parseReviewClosureReportFilters(query: unknown) {
  if (!query || typeof query !== "object" || Array.isArray(query)) {
    return {};
  }

  const cleaned = Object.fromEntries(
    Object.entries(query as Record<string, unknown>).filter(([, value]) =>
      typeof value === "string" && value.trim().length > 0
    )
  );
  const parsed = providerWebhookReviewClosureReportFiltersSchema.safeParse(cleaned);
  if (!parsed.success) throw new BadRequestException("Invalid provider webhook review closure report filters");
  return parsed.data;
}

function shouldReturnPagedUnmatchedInbound(query: unknown) {
  if (!query || typeof query !== "object" || Array.isArray(query)) return false;
  const keys = new Set(Object.keys(query as Record<string, unknown>));
  return keys.has("offset") || keys.has("sortBy") || keys.has("sortOrder") || keys.has("receivedAtFrom") || keys.has("receivedAtTo");
}
