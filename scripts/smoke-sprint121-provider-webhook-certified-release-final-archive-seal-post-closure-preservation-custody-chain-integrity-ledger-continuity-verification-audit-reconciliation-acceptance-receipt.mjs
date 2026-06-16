import fs from "node:fs";
import { spawnSync } from "node:child_process";

const sprint120EndpointPath = "/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt/handoff-packet/acceptance-record/noop-execution-dryrun/result-ledger/final-readiness-certificate/freeze-audit-register/rollback-rehearsal-receipt/control-room-packet/cutover-checklist-receipt/operator-command-receipt/go-live-authorization-receipt/launch-window-confirmation-receipt/go-live-hold-release-authorization-receipt/launch-approval-receipt/no-execution-lock-receipt/operations-handoff-readiness-no-execution-evidence-packet/operations-handoff-acceptance-receipt/operations-custody-monitoring-readiness-ledger/operations-custody-monitoring-closeout-seal-receipt/final-no-execution-evidence-rollup/final-evidence-index-regression-guardrail-receipt/final-archive-seal-operational-closure-receipt/post-closure-preservation-verification-receipt/post-closure-preservation-continuity-ledger-receipt/post-closure-preservation-custody-audit-receipt/post-closure-preservation-custody-chain-seal-receipt/post-closure-preservation-custody-chain-integrity-ledger-receipt/post-closure-preservation-custody-chain-integrity-ledger-continuity-receipt/post-closure-preservation-custody-chain-integrity-ledger-continuity-verification-receipt/post-closure-preservation-custody-chain-integrity-ledger-continuity-verification-audit-receipt/post-closure-preservation-custody-chain-integrity-ledger-continuity-verification-audit-reconciliation-receipt";
const endpointPath = `${sprint120EndpointPath}/post-closure-preservation-custody-chain-integrity-ledger-continuity-verification-audit-reconciliation-acceptance-receipt`;
const apiBaseUrl = process.env.API_BASE_URL ?? "http://localhost:4000";
const tenantId = process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
const results = [];

function read(path) {
  return fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

function record(name, ok, details = "") {
  results.push({ name, ok, details });
}

async function getJson(path, headers = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      "x-tenant-id": tenantId,
      "x-user-id": "sprint121-smoke",
      ...headers
    }
  });
  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  return { response, body };
}

function safeAcceptanceReceiptShape(value) {
  return Boolean(
    value &&
    value.receiptKind === "qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-chain-integrity-ledger-continuity-verification-audit-reconciliation-acceptance-receipt" &&
    value.receiptStatus === "issued" &&
    value.acceptanceStatus === "accepted" &&
    value.reconciliationAcceptanceStatus === "accepted" &&
    value.auditReconciliationStatus === "reconciled" &&
    value.verificationAuditStatus === "audited" &&
    value.continuityVerificationStatus === "verified" &&
    value.custodyChainStatus === "sealed" &&
    value.ledgerIntegrityStatus === "integrity_confirmed" &&
    value.noExecutionStatus === "confirmed" &&
    value.redactionStatus === "passed" &&
    value.tenantScopeStatus === "tenant_scoped" &&
    value.providerOutboundStatus === "absent" &&
    value.externalNotificationStatus === "absent" &&
    value.aiCallStatus === "absent" &&
    value.externalCalls === 0 &&
    value.sourceSprint === 120 &&
    value.derivedFrom?.sourceSprint === 120 &&
    value.derivedFrom?.receiptKind === "qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-chain-integrity-ledger-continuity-verification-audit-reconciliation-receipt" &&
    value.derivedFrom?.safeDigest === value.sprint120ReceiptDigest &&
    value.acceptedFrom?.sprint120ReceiptDigest === value.sprint120ReceiptDigest &&
    value.acceptedFrom?.sprint119ReceiptDigest === value.sprint119ReceiptDigest &&
    value.acceptedFrom?.sprint118ReceiptDigest === value.sprint118ReceiptDigest &&
    value.acceptedFrom?.sprint117ReceiptDigest === value.sprint117ReceiptDigest &&
    value.acceptedFrom?.sprint120DerivedFromSprint119 === true &&
    value.acceptedFrom?.sprint119DerivedFromSprint118 === true &&
    value.acceptedFrom?.sprint118DerivedFromSprint117 === true &&
    value.safeFilename === "provider-webhook-certified-release-reconciliation-acceptance-receipt.json" &&
    value.reconciliationAcceptanceDigest === value.safeDigest &&
    value.noExecutionFlags?.externalCallsZero === true &&
    value.noExecutionFlags?.executionAttemptCount === 0 &&
    value.noExecutionFlags?.providerOutboundCallCount === 0 &&
    value.noExecutionFlags?.externalNotificationSendCount === 0 &&
    value.noExecutionFlags?.aiCallCount === 0 &&
    value.safeSummary?.rawProviderMaterialAbsent === true &&
    value.inheritedSprint120AuditReconciliationReceiptSummary?.externalCallsZero === true &&
    value.counts?.reconciliationAcceptanceMutationCount === 0 &&
    value.counts?.sprint120AuditReconciliationReceiptMutationCount === 0 &&
    value.counts?.sprint119ContinuityVerificationAuditReceiptMutationCount === 0 &&
    value.counts?.sprint118ContinuityVerificationReceiptMutationCount === 0 &&
    value.counts?.sprint117ContinuityReceiptMutationCount === 0 &&
    value.counts?.acceptanceRowCount === 19 &&
    value.counts?.acceptanceSafeCount === 19 &&
    Array.isArray(value.acceptanceRows) &&
    value.acceptanceRows.map((row) => row.sprintNumber).join(",") === "103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121" &&
    value.acceptanceRows.every((row) =>
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
      row.acceptanceStatus === "accepted_under_safe_custody" &&
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

  record("package script registration", packageJson.includes('"smoke:sprint121"') && packageJson.includes("smoke-sprint121-provider-webhook-certified-release-final-archive-seal-post-closure-preservation-custody-chain-integrity-ledger-continuity-verification-audit-reconciliation-acceptance-receipt.mjs"));
  record("DTO/schema export", shared.includes("providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceReceiptSchema") && shared.includes("ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceReceipt") && shared.includes("sourceSprint: z.literal(120)") && shared.includes("externalCalls: z.literal(0)") && shared.includes("sprint120DerivedFromSprint119: z.literal(true)") && shared.includes("sprint119DerivedFromSprint118: z.literal(true)") && shared.includes("sprint118DerivedFromSprint117: z.literal(true)"));
  record("backend route tenant requirement", controller.includes(`@Get("${endpointPath.slice("/provider-webhooks/".length)}")`) && controller.includes("getReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceReceipt(") && controller.includes("requireTenantId(tenant)"));
  record("backend service derives from Sprint 120 only", service.includes("getReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationReceipt(tenantId, filters, actorUserId)") && service.includes("function qaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceReceiptResponse(") && service.includes("function certifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceReady("));
  record("backend readiness checks ancestry", service.includes("sourceSprint === 119") && service.includes("derivedFrom.sourceSprint === 119") && service.includes("derivedFrom.safeDigest === postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationReceipt.sprint119ReceiptDigest") && service.includes("reconciledAgainst.sprint119DerivedFromSprint118 === true") && service.includes("reconciledAgainst.sprint118DerivedFromSprint117 === true"));
  record("backend readiness checks zero execution", service.includes("reconciliationRows.length === 18") && service.includes("expectedSprintRange === \"103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120\"") && service.includes("externalCalls === 0") && service.includes("!containsUnsafeProviderWebhookReceiptMaterial(postClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationReceipt)"));
  record("web API client wiring", apiClient.includes("getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceReceipt") && apiClient.includes(`${endpointPath}\${search}`) && apiClient.includes("providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceReceiptSchema"));
  record("settings-data API no silent fallback", settingsData.includes("loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceReceiptData") && settingsData.includes("if (mode === \"api\")") && settingsData.includes("await getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceReceipt(filters)"));
  record("settings-data mock safe local receipt", settingsData.includes("createMockReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceReceipt") && settingsData.includes("mockCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceReady") && settingsData.includes("acceptanceRows"));
  record("Settings Channels stale clearing", channelsPage.includes("clearReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainIntegrityLedgerContinuityVerificationAuditReconciliationAcceptanceReceipt()") && channelsPage.includes("QA Archive Certified Release Post-Closure Preservation Custody Chain Integrity Ledger Continuity Verification Audit Reconciliation Acceptance Receipt API error"));
  record("provider panel UI wiring", providerPanel.includes("Load Sprint 121 reconciliation acceptance receipt") && providerPanel.includes("QA archive certified release Sprint 121 custody chain integrity ledger continuity verification audit reconciliation acceptance receipt") && providerPanel.includes("sprint120DerivedFromSprint119"));
}

function runPrerequisiteSmoke(scriptName) {
  const result = spawnSync("npm.cmd", ["run", scriptName], { stdio: "inherit", shell: true });
  return result.status === 0;
}

async function checkLiveApi() {
  record("local API only", /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(apiBaseUrl), apiBaseUrl);
  const health = await fetch(`${apiBaseUrl}/health`);
  record("health endpoint reachable", health.ok, String(health.status));
  const readiness = await fetch(`${apiBaseUrl}/health/readiness`);
  record("readiness endpoint reachable", readiness.ok, String(readiness.status));

  let { response, body } = await getJson(`${endpointPath}?provider=line&eventType=message.created`);
  if (response.status === 409) {
    record("live prerequisite refresh Sprint 119", runPrerequisiteSmoke("smoke:sprint119"));
    record("live prerequisite refresh Sprint 120", runPrerequisiteSmoke("smoke:sprint120"));
    ({ response, body } = await getJson(`${endpointPath}?provider=line&eventType=message.created`));
  }
  record("live endpoint returns HTTP 200", response.ok, String(response.status));
  record("live API Sprint 121 receipt shape", safeAcceptanceReceiptShape(body), JSON.stringify(body).slice(0, 500));
  record("live API no raw provider material", !JSON.stringify(body).match(/rawPayload|rawSignature|replyToken|senderId|roomId|accessToken|authorization|cookie|secret|providerRaw|payloadJson/i));

  const repeat = await getJson(`${endpointPath}?provider=line&eventType=message.created`);
  record("repeat live read returns HTTP 200", repeat.response.ok, String(repeat.response.status));
  record("repeat live read has no mutation", repeat.body?.safeDigest !== body?.safeDigest || safeAcceptanceReceiptShape(repeat.body));

  const invalid = await fetch(`${apiBaseUrl}${endpointPath}?provider=line&eventType=message.created`, {
    headers: { "x-tenant-id": "not-a-uuid", "x-user-id": "sprint121-smoke" }
  });
  record("invalid tenant does not return mock fallback", invalid.status >= 400, String(invalid.status));
}

checkStaticWiring();
try {
  await checkLiveApi();
} catch (error) {
  record("live API checks completed", false, error instanceof Error ? error.message : String(error));
}

const failed = results.filter((entry) => !entry.ok);
for (const entry of results) {
  console.log(`${entry.ok ? "PASS" : "FAIL"} ${entry.name}${entry.details ? ` ${entry.details}` : ""}`);
}
if (failed.length > 0) {
  console.error(`Sprint 121 smoke failed: assertions=${results.length} failed=${failed.length}`);
  process.exit(1);
}
console.log(`Sprint 121 smoke passed: assertions=${results.length} failed=0`);
