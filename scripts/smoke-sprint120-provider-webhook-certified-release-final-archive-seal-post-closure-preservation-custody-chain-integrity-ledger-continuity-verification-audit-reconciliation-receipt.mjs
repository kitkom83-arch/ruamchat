import fs from "node:fs";

const sprint119EndpointPath = "/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt/handoff-packet/acceptance-record/noop-execution-dryrun/result-ledger/final-readiness-certificate/freeze-audit-register/rollback-rehearsal-receipt/control-room-packet/cutover-checklist-receipt/operator-command-receipt/go-live-authorization-receipt/launch-window-confirmation-receipt/go-live-hold-release-authorization-receipt/launch-approval-receipt/no-execution-lock-receipt/operations-handoff-readiness-no-execution-evidence-packet/operations-handoff-acceptance-receipt/operations-custody-monitoring-readiness-ledger/operations-custody-monitoring-closeout-seal-receipt/final-no-execution-evidence-rollup/final-evidence-index-regression-guardrail-receipt/final-archive-seal-operational-closure-receipt/post-closure-preservation-verification-receipt/post-closure-preservation-continuity-ledger-receipt/post-closure-preservation-custody-audit-receipt/post-closure-preservation-custody-chain-seal-receipt/post-closure-preservation-custody-chain-integrity-ledger-receipt/post-closure-preservation-custody-chain-integrity-ledger-continuity-receipt/post-closure-preservation-custody-chain-integrity-ledger-continuity-verification-receipt/post-closure-preservation-custody-chain-integrity-ledger-continuity-verification-audit-receipt";
const endpointPath = `${sprint119EndpointPath}/post-closure-preservation-custody-chain-integrity-ledger-continuity-verification-audit-reconciliation-receipt`;
const apiBaseUrl = process.env.API_BASE_URL ?? "http://localhost:4000";
const tenantId = process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
const results = [];

function read(path) {
  return fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

function record(name, ok, details = "") {
  results.push({ name, ok, details });
}

function safeAuditReconciliationReceiptShape(value) {
  return Boolean(
    value &&
    value.receiptKind === "qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-chain-integrity-ledger-continuity-verification-audit-reconciliation-receipt" &&
    value.receiptStatus === "issued" &&
    value.reconciliationStatus === "reconciled" &&
    value.auditReconciliationStatus === "reconciled" &&
    value.verificationAuditStatus === "audited" &&
    value.continuityVerificationStatus === "verified" &&
    value.continuityStatus === "continuity_confirmed" &&
    value.custodyChainStatus === "sealed" &&
    value.ledgerIntegrityStatus === "integrity_confirmed" &&
    value.noExecutionStatus === "confirmed" &&
    value.redactionStatus === "passed" &&
    value.tenantScopeStatus === "tenant_scoped" &&
    value.providerOutboundStatus === "absent" &&
    value.externalNotificationStatus === "absent" &&
    value.aiCallStatus === "absent" &&
    value.externalCalls === 0 &&
    value.sourceSprint === 119 &&
    value.derivedFrom?.sourceSprint === 119 &&
    value.derivedFrom?.receiptKind === "qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-chain-integrity-ledger-continuity-verification-audit-receipt" &&
    value.derivedFrom?.safeDigest === value.sprint119ReceiptDigest &&
    value.reconciledAgainst?.sprint119ReceiptDigest === value.sprint119ReceiptDigest &&
    value.reconciledAgainst?.sprint118ReceiptDigest === value.sprint118ReceiptDigest &&
    value.reconciledAgainst?.sprint117ReceiptDigest === value.sprint117ReceiptDigest &&
    value.reconciledAgainst?.sprint119DerivedFromSprint118 === true &&
    value.reconciledAgainst?.sprint118DerivedFromSprint117 === true &&
    value.safeFilename === "provider-webhook-certified-release-audit-reconciliation-receipt.json" &&
    value.auditReconciliationDigest === value.safeDigest &&
    value.noExecutionFlags?.externalCallsZero === true &&
    value.noExecutionFlags?.executionAttemptCount === 0 &&
    value.noExecutionFlags?.providerOutboundCallCount === 0 &&
    value.noExecutionFlags?.externalNotificationSendCount === 0 &&
    value.noExecutionFlags?.aiCallCount === 0 &&
    value.safeSummary?.rawProviderMaterialAbsent === true &&
    value.inheritedSprint119ContinuityVerificationAuditReceiptSummary?.externalCallsZero === true &&
    value.counts?.auditReconciliationMutationCount === 0 &&
    value.counts?.sprint119ContinuityVerificationAuditReceiptMutationCount === 0 &&
    value.counts?.sprint118ContinuityVerificationReceiptMutationCount === 0 &&
    value.counts?.sprint117ContinuityReceiptMutationCount === 0 &&
    value.counts?.reconciliationRowCount === 18 &&
    value.counts?.reconciliationSafeCount === 18 &&
    Array.isArray(value.reconciliationRows) &&
    value.reconciliationRows.map((row) => row.sprintNumber).join(",") === "103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120" &&
    value.reconciliationRows.every((row) =>
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
      row.reconciliationStatus === "reconciled_under_safe_custody" &&
      typeof row.safeDigest === "string" &&
      row.safeDigest.length > 0
    )
  );
}

function checkStaticWiring() {
  const packageJson = read("package.json");
  const shared = read("packages/shared/src/index.ts");
  const service = read("apps/api/src/services/provider-webhook-events.service.ts");
  const controller = read("apps/api/src/controllers/provider-webhooks.controller.ts");
  const apiClient = read("apps/web/app/api-client.ts");
  const settingsData = read("apps/web/app/settings-data.ts");
  const channelsPage = read("apps/web/app/settings/channels/page.tsx");
  const providerPanel = read("apps/web/app/settings/provider-readiness-panel.tsx");

  record("package script registration", packageJson.includes('"smoke:sprint120"') && packageJson.includes("smoke-sprint120-provider-webhook-certified-release-final-archive-seal-post-closure-preservation-custody-chain-integrity-ledger-continuity-verification-audit-reconciliation-receipt.mjs"));
  record("DTO/schema export", shared.includes("providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationReceiptSchema") && shared.includes("ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationReceipt") && shared.includes("sourceSprint: z.literal(119)") && shared.includes("externalCalls: z.literal(0)") && shared.includes("sprint119DerivedFromSprint118: z.literal(true)") && shared.includes("sprint118DerivedFromSprint117: z.literal(true)"));
  record("backend route tenant requirement", controller.includes(`@Get("${endpointPath.slice("/provider-webhooks/".length)}")`) && controller.includes("getReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationReceipt(") && controller.includes("requireTenantId(tenant)"));
  record("backend service derives from Sprint 119 only", service.includes("getReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceipt(tenantId, filters, actorUserId)") && service.includes("function qaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationReceiptResponse(") && service.includes("function certifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationReady("));
  record("backend readiness checks ancestry", service.includes("sourceSprint === 118") && service.includes("derivedFrom.sourceSprint === 118") && service.includes("derivedFrom.safeDigest === postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceipt.sprint118ReceiptDigest") && service.includes("sprint117ReceiptDigest === postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceipt.inheritedSprint118ContinuityVerificationReceiptSummary.sprint117ReceiptDigest"));
  record("backend readiness checks zero execution", service.includes("auditRows.length === 17") && service.includes("expectedSprintRange === \"103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119\"") && service.includes("externalCalls === 0") && service.includes("!containsUnsafeProviderWebhookReceiptMaterial(postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReceipt)"));
  record("web API client wiring", apiClient.includes("getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationReceipt") && apiClient.includes(`${endpointPath}\${search}`) && apiClient.includes("providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationReceiptSchema"));
  record("settings-data API no silent fallback", settingsData.includes("loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationReceiptData") && settingsData.includes("if (mode === \"api\")") && settingsData.includes("await getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationReceipt(filters)"));
  record("settings-data mock safe local receipt", settingsData.includes("createMockReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationReceipt") && settingsData.includes("mockCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationReady") && settingsData.includes("reconciliationRows"));
  record("Settings Channels stale clearing", channelsPage.includes("clearReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationReceipt()") && channelsPage.includes("QA Archive Certified Release Post-Closure Preservation Custody Chain Integrity Ledger Continuity Verification Audit Reconciliation Receipt API error"));
  record("provider panel UI wiring", providerPanel.includes("Load Sprint 120 audit reconciliation receipt") && providerPanel.includes("QA archive certified release Sprint 120 custody chain integrity ledger continuity verification audit reconciliation receipt") && providerPanel.includes("sprint119DerivedFromSprint118"));
}

async function checkLiveApi() {
  try {
    const response = await fetch(`${apiBaseUrl}${endpointPath}?provider=line&eventType=message.created`, {
      headers: {
        "x-tenant-id": tenantId,
        "x-user-id": "sprint120-smoke"
      }
    });
    if (!response.ok) {
      record("live API Sprint 120 receipt", false, `status=${response.status}`);
      return;
    }
    const body = await response.json();
    record("live API Sprint 120 receipt shape", safeAuditReconciliationReceiptShape(body), JSON.stringify(body).slice(0, 500));
    record("live API no raw provider material", !JSON.stringify(body).match(/rawPayload|rawSignature|replyToken|senderId|roomId|accessToken|authorization|cookie|secret|providerRaw|payloadJson/i));
  } catch (error) {
    record("live API unavailable skip", true, error instanceof Error ? error.message : String(error));
  }
}

checkStaticWiring();
await checkLiveApi();

const failed = results.filter((entry) => !entry.ok);
for (const entry of results) {
  console.log(`${entry.ok ? "PASS" : "FAIL"} ${entry.name}${entry.details ? ` ${entry.details}` : ""}`);
}
if (failed.length > 0) {
  console.error(`Sprint 120 smoke failed: assertions=${results.length} failed=${failed.length}`);
  process.exit(1);
}
console.log(`Sprint 120 smoke passed: assertions=${results.length} failed=0`);
