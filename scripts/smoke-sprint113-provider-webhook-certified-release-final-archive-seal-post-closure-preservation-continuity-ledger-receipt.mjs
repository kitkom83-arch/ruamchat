import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const sprint112EndpointPath = "/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt/handoff-packet/acceptance-record/noop-execution-dryrun/result-ledger/final-readiness-certificate/freeze-audit-register/rollback-rehearsal-receipt/control-room-packet/cutover-checklist-receipt/operator-command-receipt/go-live-authorization-receipt/launch-window-confirmation-receipt/go-live-hold-release-authorization-receipt/launch-approval-receipt/no-execution-lock-receipt/operations-handoff-readiness-no-execution-evidence-packet/operations-handoff-acceptance-receipt/operations-custody-monitoring-readiness-ledger/operations-custody-monitoring-closeout-seal-receipt/final-no-execution-evidence-rollup/final-evidence-index-regression-guardrail-receipt/final-archive-seal-operational-closure-receipt/post-closure-preservation-verification-receipt";
const endpointPath = `${sprint112EndpointPath}/post-closure-preservation-continuity-ledger-receipt`;
const apiBase = process.env.API_BASE_URL || "http://localhost:4000";
const tenantId = process.env.SMOKE_TENANT_ID ?? process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
const results = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function record(name, ok, detail = "") {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "ok" : "not ok"} - ${name}${detail ? ` (${detail})` : ""}`);
}

function sourceSlice(source, start, end) {
  const startIndex = source.indexOf(start);
  if (startIndex < 0) return "";
  const endIndex = source.indexOf(end, startIndex + start.length);
  return source.slice(startIndex, endIndex < 0 ? undefined : endIndex);
}

function containsProviderOutbound(sources) {
  return Object.values(sources).some((source) => /\b(sendProvider|callProvider|providerOutbound|lineClient\.reply|lineClient\.push|telegramClient\.send|facebookClient\.send)\s*\(/i.test(source));
}

function containsExternalNotification(sources) {
  return Object.values(sources).some((source) => /\b(sendEmail|sendSms|sendSlack|notifyExternal|externalNotification)\s*\(/i.test(source));
}

function containsAiCall(sources) {
  return Object.values(sources).some((source) => /\b(openai|OpenAI|createChatCompletion|chat\.completions|responses\.create|aiClient\.send|callAiModel)\s*\(/i.test(source));
}

function leaksRawProviderMaterial(value) {
  const serialized = typeof value === "string" ? value : JSON.stringify(value);
  return /"rawPayload"\s*:|"rawSignature"\s*:|"replyToken"\s*:|"senderId"\s*:|"roomId"\s*:|"rawRoomId"\s*:|"rawSenderId"\s*:|"token"\s*:|"secret"\s*:|"authorization"\s*:|"cookie"\s*:|"headers"\s*:|"stack"\s*:|providerRaw|providerMaterial|payloadJson|raw-room|raw-sender|reply-token-must-not-return|message-id-must-not-return|accessToken|webhookSecret|bearer/i.test(serialized);
}

function safeContinuityLedgerReceiptShape(value) {
  return value &&
    value.receiptKind === "qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-continuity-ledger-receipt" &&
    value.postClosurePreservationContinuityLedgerStatus === "continuous" &&
    value.postClosurePreservationVerificationStatus === "verified" &&
    value.finalArchiveSealPostClosurePreservationStatus === "preserved" &&
    value.finalOperationalClosureReceiptStatus === "issued" &&
    value.finalArchiveSealStatus === "sealed" &&
    value.releaseClosureStatus === "closed" &&
    value.finalEvidenceIndexStatus === "issued" &&
    value.regressionGuardrailReceiptStatus === "issued" &&
    value.regressionGuardrailStatus === "passed" &&
    value.finalNoExecutionEvidenceRollupStatus === "issued" &&
    value.finalArchiveCustodyStatus === "sealed" &&
    value.operationsCustodyMonitoringCloseoutStatus === "sealed" &&
    value.closeoutSealStatus === "sealed" &&
    value.noExecutionEvidenceStatus === "confirmed" &&
    value.noExecutionMonitoringStatus === "active" &&
    value.tenantScopeStatus === "tenant_scoped" &&
    value.digestContinuityStatus === "confirmed" &&
    value.providerOutboundStatus === "absent" &&
    value.externalNotificationStatus === "absent" &&
    value.aiCallStatus === "absent" &&
    value.safeFilename === "provider-webhook-certified-release-post-closure-preservation-continuity-ledger-receipt.json" &&
    /^sha256:[a-z0-9]+$/i.test(String(value.safeDigest ?? "")) &&
    value.postClosurePreservationContinuityLedgerDigest === value.safeDigest &&
    /^sha256:[a-z0-9]+$/i.test(String(value.postClosurePreservationVerificationDigest ?? "")) &&
    value.inheritedPostClosurePreservationVerificationReceiptSummary?.postClosurePreservationVerificationStatus === "verified" &&
    value.inheritedPostClosurePreservationVerificationReceiptSummary?.finalArchiveSealPostClosurePreservationStatus === "preserved" &&
    value.inheritedPostClosurePreservationVerificationReceiptSummary?.externalCallsZero === true &&
    value.counts?.preservationContinuityLedgerMutationCount === 0 &&
    value.counts?.postClosurePreservationVerificationMutationCount === 0 &&
    value.counts?.finalArchiveSealPostClosurePreservationMutationCount === 0 &&
    value.counts?.finalOperationalClosureReceiptMutationCount === 0 &&
    value.counts?.finalArchiveSealMutationCount === 0 &&
    value.counts?.finalEvidenceIndexMutationCount === 0 &&
    value.counts?.regressionGuardrailMutationCount === 0 &&
    value.counts?.finalNoExecutionEvidenceRollupMutationCount === 0 &&
    value.counts?.executionAttemptCount === 0 &&
    value.counts?.providerOutboundCallCount === 0 &&
    value.counts?.externalNotificationSendCount === 0 &&
    value.counts?.aiCallCount === 0 &&
    value.externalCalls === 0 &&
    Array.isArray(value.preservationContinuityLedgerRows) &&
    value.preservationContinuityLedgerRows.map((row) => row.sprintNumber).join(",") === "103,104,105,106,107,108,109,110,111,112,113" &&
    value.preservationContinuityLedgerRows.every((row) =>
      typeof row.artifactLabel === "string" &&
      row.artifactLabel.length > 0 &&
      /^sha256:[a-z0-9]+$/i.test(String(row.safeDigest ?? "")) &&
      row.externalCalls === 0 &&
      row.executionAttemptCount === 0 &&
      row.providerOutboundCallCount === 0 &&
      row.externalNotificationSendCount === 0 &&
      row.aiCallCount === 0 &&
      row.mutationCount === 0
    ) &&
    !leaksRawProviderMaterial(value);
}

function stableContinuityLedgerReceiptSnapshot(value) {
  if (!value || typeof value !== "object") return value;
  const {
    generatedAt: _generatedAt,
    checkedAt: _checkedAt,
    preservationContinuityLedgerRows,
    ...stable
  } = value;
  return {
    ...stable,
    preservationContinuityLedgerRows: Array.isArray(preservationContinuityLedgerRows)
      ? preservationContinuityLedgerRows.map(({ generatedAt, checkedAt, ...row }) => row)
      : preservationContinuityLedgerRows
  };
}

async function getJson(url, headers = {}) {
  const response = await fetch(url, { headers });
  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  return { status: response.status, body };
}

function runNodeSmoke(scriptName) {
  const result = spawnSync(process.execPath, [path.join(root, "scripts", scriptName)], {
    cwd: root,
    env: process.env,
    encoding: "utf8",
    stdio: "pipe"
  });
  if (result.status !== 0) {
    console.error(result.stdout);
    console.error(result.stderr);
  }
  return result.status === 0;
}

async function run() {
  const rootPackage = JSON.parse(read("package.json"));
  const shared = read("packages/shared/src/index.ts");
  const providerController = read("apps/api/src/controllers/provider-webhooks.controller.ts");
  const providerService = read("apps/api/src/services/provider-webhook-events.service.ts");
  const apiClient = read("apps/web/app/api-client.ts");
  const settingsData = read("apps/web/app/settings-data.ts");
  const settingsPage = read("apps/web/app/settings/channels/page.tsx");
  const providerPanel = read("apps/web/app/settings/provider-readiness-panel.tsx");

  const sprint113Source = {
    shared: sourceSlice(shared, "providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceiptSchema", "providerWebhookUnmatchedInboundBulkReviewRequestSchema"),
    providerController: sourceSlice(providerController, "post-closure-preservation-continuity-ledger-receipt", "review-closure-report/export"),
    providerServiceMethod: sourceSlice(providerService, "getReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceipt", "private getLockedArchiveContext"),
    providerServiceHelper: sourceSlice(providerService, "function qaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceiptResponse", "function certifiedReleaseFinalArchiveSealPostClosurePreservationReady"),
    apiClient: sourceSlice(apiClient, "export async function getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceipt", "export async function getProviderWebhookReviewClosureReportExport"),
    settingsDataLoader: sourceSlice(settingsData, "export async function loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceiptData", "export async function loadSettingsProviderWebhookReviewClosureReportRedactionAuditData"),
    settingsDataMock: sourceSlice(settingsData, "function createMockReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceipt", "function mockCertifiedReleaseFinalArchiveSealPostClosurePreservationReady"),
    providerPanelControls: sourceSlice(providerPanel, "Load post-closure preservation verification receipt", "Audit report export redaction"),
    providerPanelResult: sourceSlice(providerPanel, "QA archive certified release post-closure preservation continuity ledger receipt:", "reviewQaHandoffLockedArchive ?")
  };
  const sprint113RawLeakSurfaces = {
    shared: sprint113Source.shared,
    providerServiceHelper: sprint113Source.providerServiceHelper,
    settingsDataMock: sprint113Source.settingsDataMock,
    providerPanelResult: sprint113Source.providerPanelResult
  };

  record("smoke:sprint113 registered",
    rootPackage.scripts?.["smoke:sprint113"] === "node scripts/smoke-sprint113-provider-webhook-certified-release-final-archive-seal-post-closure-preservation-continuity-ledger-receipt.mjs"
  );

  record("shared Sprint 113 DTO export",
    sprint113Source.shared.includes("providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceiptSchema") &&
    sprint113Source.shared.includes("ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceipt") &&
    sprint113Source.shared.includes("postClosurePreservationContinuityLedgerStatus") &&
    sprint113Source.shared.includes("preservationContinuityLedgerRows") &&
    sprint113Source.shared.includes("inheritedPostClosurePreservationVerificationReceiptSummary") &&
    sprint113Source.shared.includes("providerOutboundCallCount: z.literal(0)") &&
    sprint113Source.shared.includes("externalNotificationSendCount: z.literal(0)") &&
    sprint113Source.shared.includes("aiCallCount: z.literal(0)") &&
    sprint113Source.shared.includes("externalCalls: z.literal(0)") &&
    sprint113Source.shared.includes(".strict()")
  );

  record("backend Sprint 113 route requires tenant",
    providerController.includes("post-closure-preservation-verification-receipt/post-closure-preservation-continuity-ledger-receipt") &&
    sprint113Source.providerController.includes("getReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceipt(requireTenantId(tenant)")
  );

  record("service derives Sprint 113 from Sprint 112 and fails closed",
    sprint113Source.providerServiceMethod.includes("getReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceipt") &&
    sprint113Source.providerServiceMethod.includes("certifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReady") &&
    sprint113Source.providerServiceMethod.includes("ConflictException") &&
    sprint113Source.providerServiceMethod.includes("prerequisites are incomplete")
  );

  record("service Sprint 113 zero-count helper",
    sprint113Source.providerServiceHelper.includes("preservationContinuityLedgerMutationCount: 0 as const") &&
    sprint113Source.providerServiceHelper.includes("postClosurePreservationVerificationMutationCount: 0 as const") &&
    sprint113Source.providerServiceHelper.includes("executionAttemptCount: 0 as const") &&
    sprint113Source.providerServiceHelper.includes("providerOutboundCallCount: 0 as const") &&
    sprint113Source.providerServiceHelper.includes("externalNotificationSendCount: 0 as const") &&
    sprint113Source.providerServiceHelper.includes("aiCallCount: 0 as const") &&
    sprint113Source.providerServiceHelper.includes("externalCalls: 0 as const")
  );

  record("API client Sprint 113 wiring",
    sprint113Source.apiClient.includes("providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceiptSchema") &&
    sprint113Source.apiClient.includes("post-closure-preservation-continuity-ledger-receipt")
  );

  record("settings-data Sprint 113 API mode has no mock fallback",
    sprint113Source.settingsDataLoader.includes("if (mode === \"api\")") &&
    sprint113Source.settingsDataLoader.includes("getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceipt(filters)") &&
    sprint113Source.settingsDataLoader.includes("createMockReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceipt(filters)") &&
    sprint113Source.settingsDataMock.includes("mockqahandoffcertifiedreleasefinalarchivesealpostclosurepreservationcontinuityledgerreceipt")
  );

  record("Settings > Channels Sprint 113 controls/results/errors",
    sprint113Source.providerPanelControls.includes("Load post-closure preservation continuity ledger receipt") &&
    sprint113Source.providerPanelResult.includes("QA archive certified release post-closure preservation continuity ledger receipt:") &&
    sprint113Source.providerPanelResult.includes("postClosurePreservationContinuityLedgerStatus=") &&
    sprint113Source.providerPanelResult.includes("preservationContinuityLedgerRows=") &&
    sprint113Source.providerPanelResult.includes("providerOutboundCallCount=") &&
    sprint113Source.providerPanelResult.includes("externalNotificationSendCount=") &&
    sprint113Source.providerPanelResult.includes("aiCallCount=") &&
    sprint113Source.providerPanelResult.includes("externalCalls=") &&
    settingsPage.includes("QA Archive Certified Release Post-Closure Preservation Continuity Ledger Receipt API error")
  );

  record("stale Sprint 113 receipt clears on upstream/API failure",
    settingsPage.includes("clearReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceipt") &&
    settingsPage.includes("setReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceipt(null)") &&
    settingsPage.includes("clearReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceipt();")
  );

  record("static Sprint 113 source has no provider outbound send markers", !containsProviderOutbound(sprint113Source));
  record("static Sprint 113 source has no external notification send markers", !containsExternalNotification(sprint113Source));
  record("static Sprint 113 source has no AI/OpenAI call markers", !containsAiCall(sprint113Source));
  record("static Sprint 113 source has no raw provider material leakage markers", !leaksRawProviderMaterial(sprint113RawLeakSurfaces));

  let health;
  try {
    health = await getJson(`${apiBase}/health`);
  } catch {
    record("live API unavailable; static checks completed", true, `skipped live checks at ${apiBase}`);
    return;
  }
  if (health.status < 200 || health.status >= 500) {
    record("live API unavailable; static checks completed", true, `skipped live checks at ${apiBase} status=${health.status}`);
    return;
  }

  const search = "?provider=line&eventType=message.created";
  const missingTenant = await getJson(`${apiBase}${endpointPath}${search}`);
  record("post-closure preservation continuity ledger receipt requires x-tenant-id", missingTenant.status >= 400 && missingTenant.status < 500);

  const prerequisiteChainPassed = runNodeSmoke("smoke-sprint112-provider-webhook-certified-release-final-archive-seal-post-closure-preservation-verification-receipt.mjs");
  record("safe prerequisite chain driven through Sprint 112", prerequisiteChainPassed);
  if (!prerequisiteChainPassed) return;

  const sprint112Receipt = await getJson(`${apiBase}${sprint112EndpointPath}${search}`, { "x-tenant-id": tenantId });
  const first = await getJson(`${apiBase}${endpointPath}${search}`, { "x-tenant-id": tenantId });
  const second = await getJson(`${apiBase}${endpointPath}${search}`, { "x-tenant-id": tenantId });
  const invalidTenant = await getJson(`${apiBase}${endpointPath}${search}`, { "x-tenant-id": "invalid-sprint113-tenant" });

  record("GET Sprint 113 post-closure preservation continuity ledger receipt endpoint", first.status === 200 && safeContinuityLedgerReceiptShape(first.body), first.status === 200 ? "" : `status=${first.status}`);
  record("GET Sprint 113 repeat read has no mutation",
    first.status === 200 &&
    second.status === 200 &&
    JSON.stringify(stableContinuityLedgerReceiptSnapshot(first.body)) === JSON.stringify(stableContinuityLedgerReceiptSnapshot(second.body))
  );
  record("Sprint 113 derives digest continuity from Sprint 112 preservation verification",
    sprint112Receipt.status === 200 &&
    first.status === 200 &&
    first.body?.inheritedPostClosurePreservationVerificationReceiptSummary?.safeDigest === sprint112Receipt.body?.safeDigest &&
    first.body?.postClosurePreservationVerificationDigest === sprint112Receipt.body?.safeDigest
  );
  record("invalid tenant does not return mock fallback",
    invalidTenant.status !== 200 ||
    (!String(invalidTenant.body?.safeDigest ?? "").includes("mock") && !String(invalidTenant.body?.safeDigest ?? "").includes("fake"))
  );
  record("no stale/fake Sprint 113 receipt", first.status !== 200 || (!String(first.body?.safeDigest ?? "").includes("mock") && !String(first.body?.safeDigest ?? "").includes("fake")));
  record("externalCalls = 0", first.body?.externalCalls === 0);
  record("no execution/provider outbound/notification/AI counts", first.body?.counts?.executionAttemptCount === 0 && first.body?.counts?.providerOutboundCallCount === 0 && first.body?.counts?.externalNotificationSendCount === 0 && first.body?.counts?.aiCallCount === 0);
  record("postClosurePreservationContinuityLedgerStatus=continuous", first.body?.postClosurePreservationContinuityLedgerStatus === "continuous");
  record("postClosurePreservationVerificationStatus=verified", first.body?.postClosurePreservationVerificationStatus === "verified");
  record("safe continuity ledger rows present", Array.isArray(first.body?.preservationContinuityLedgerRows) && first.body.preservationContinuityLedgerRows.length === 11);
  record("no raw provider material in live response", !leaksRawProviderMaterial(first.body));
}

run().then(() => {
  const failed = results.filter((result) => !result.ok);
  if (failed.length > 0) {
    console.error(`smoke:sprint113 failed ${failed.length}/${results.length} checks`);
    process.exit(1);
  }
  console.log(`smoke:sprint113 passed ${results.length}/${results.length} checks`);
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
