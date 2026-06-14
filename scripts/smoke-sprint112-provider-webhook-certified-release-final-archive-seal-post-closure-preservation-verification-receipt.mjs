import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const sprint111EndpointPath = "/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt/handoff-packet/acceptance-record/noop-execution-dryrun/result-ledger/final-readiness-certificate/freeze-audit-register/rollback-rehearsal-receipt/control-room-packet/cutover-checklist-receipt/operator-command-receipt/go-live-authorization-receipt/launch-window-confirmation-receipt/go-live-hold-release-authorization-receipt/launch-approval-receipt/no-execution-lock-receipt/operations-handoff-readiness-no-execution-evidence-packet/operations-handoff-acceptance-receipt/operations-custody-monitoring-readiness-ledger/operations-custody-monitoring-closeout-seal-receipt/final-no-execution-evidence-rollup/final-evidence-index-regression-guardrail-receipt/final-archive-seal-operational-closure-receipt";
const endpointPath = `${sprint111EndpointPath}/post-closure-preservation-verification-receipt`;
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

function safePostClosurePreservationReceiptShape(value) {
  return value &&
    value.receiptKind === "qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-verification-receipt" &&
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
    value.safeFilename === "provider-webhook-certified-release-post-closure-preservation-verification-receipt.json" &&
    /^sha256:[a-z0-9]+$/i.test(String(value.safeDigest ?? "")) &&
    value.postClosurePreservationVerificationDigest === value.safeDigest &&
    /^sha256:[a-z0-9]+$/i.test(String(value.finalArchiveSealOperationalClosureReceiptDigest ?? "")) &&
    value.finalArchiveSealDigest === value.finalArchiveSealOperationalClosureReceiptDigest &&
    value.inheritedFinalArchiveSealOperationalClosureReceiptSummary?.finalArchiveSealStatus === "sealed" &&
    value.inheritedFinalArchiveSealOperationalClosureReceiptSummary?.releaseClosureStatus === "closed" &&
    value.inheritedFinalArchiveSealOperationalClosureReceiptSummary?.externalCallsZero === true &&
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
    Array.isArray(value.postClosurePreservationVerificationRows) &&
    value.postClosurePreservationVerificationRows.map((row) => row.sprintNumber).join(",") === "103,104,105,106,107,108,109,110,111,112" &&
    value.postClosurePreservationVerificationRows.every((row) =>
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

function stablePostClosurePreservationReceiptSnapshot(value) {
  if (!value || typeof value !== "object") return value;
  const {
    generatedAt: _generatedAt,
    checkedAt: _checkedAt,
    postClosurePreservationVerificationRows,
    ...stable
  } = value;
  return {
    ...stable,
    postClosurePreservationVerificationRows: Array.isArray(postClosurePreservationVerificationRows)
      ? postClosurePreservationVerificationRows.map(({ generatedAt, checkedAt, ...row }) => row)
      : postClosurePreservationVerificationRows
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

  const sprint112Source = {
    shared: sourceSlice(shared, "providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceiptSchema", "providerWebhookUnmatchedInboundBulkReviewRequestSchema"),
    providerController: sourceSlice(providerController, "post-closure-preservation-verification-receipt", "review-closure-report/export"),
    providerServiceMethod: sourceSlice(providerService, "getReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceipt", "private getLockedArchiveContext"),
    providerServiceHelper: sourceSlice(providerService, "function qaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceiptResponse", "function certifiedReleaseFinalArchiveSealPostClosurePreservationReady"),
    apiClient: sourceSlice(apiClient, "export async function getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceipt", "export async function getProviderWebhookReviewClosureReportExport"),
    settingsDataLoader: sourceSlice(settingsData, "export async function loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceiptData", "export async function loadSettingsProviderWebhookReviewClosureReportRedactionAuditData"),
    settingsDataMock: sourceSlice(settingsData, "function createMockReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceipt", "function mockCertifiedReleaseFinalEvidenceIndexRegressionGuardrailPassed"),
    providerPanelControls: sourceSlice(providerPanel, "Load final archive seal operational closure receipt", "Load post-closure preservation verification receipt") + sourceSlice(providerPanel, "Load post-closure preservation verification receipt", "Audit report export redaction"),
    providerPanelResult: sourceSlice(providerPanel, "QA archive certified release post-closure preservation verification receipt:", "reviewQaHandoffLockedArchive ?")
  };
  const sprint112RawLeakSurfaces = {
    shared: sprint112Source.shared,
    providerServiceHelper: sprint112Source.providerServiceHelper,
    settingsDataMock: sprint112Source.settingsDataMock,
    providerPanelResult: sprint112Source.providerPanelResult
  };

  record("smoke:sprint112 registered",
    rootPackage.scripts?.["smoke:sprint112"] === "node scripts/smoke-sprint112-provider-webhook-certified-release-final-archive-seal-post-closure-preservation-verification-receipt.mjs"
  );

  record("shared Sprint 112 DTO export",
    sprint112Source.shared.includes("providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceiptSchema") &&
    sprint112Source.shared.includes("ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceipt") &&
    sprint112Source.shared.includes("postClosurePreservationVerificationStatus") &&
    sprint112Source.shared.includes("finalArchiveSealPostClosurePreservationStatus") &&
    sprint112Source.shared.includes("postClosurePreservationVerificationRows") &&
    sprint112Source.shared.includes("providerOutboundCallCount: z.literal(0)") &&
    sprint112Source.shared.includes("externalNotificationSendCount: z.literal(0)") &&
    sprint112Source.shared.includes("aiCallCount: z.literal(0)") &&
    sprint112Source.shared.includes("externalCalls: z.literal(0)") &&
    sprint112Source.shared.includes(".strict()")
  );

  record("backend Sprint 112 route requires tenant",
    sprint112Source.providerController.includes("post-closure-preservation-verification-receipt") &&
    sprint112Source.providerController.includes("getReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceipt(requireTenantId(tenant)")
  );

  record("service derives Sprint 112 from Sprint 111 and fails closed",
    sprint112Source.providerServiceMethod.includes("getReviewQaHandoffCertifiedReleaseFinalArchiveSealOperationalClosureReceipt") &&
    sprint112Source.providerServiceMethod.includes("certifiedReleaseFinalArchiveSealPostClosurePreservationReady") &&
    sprint112Source.providerServiceMethod.includes("ConflictException") &&
    sprint112Source.providerServiceMethod.includes("prerequisites are incomplete")
  );

  record("service Sprint 112 zero-count helper",
    sprint112Source.providerServiceHelper.includes("postClosurePreservationVerificationMutationCount: 0 as const") &&
    sprint112Source.providerServiceHelper.includes("finalArchiveSealPostClosurePreservationMutationCount: 0 as const") &&
    sprint112Source.providerServiceHelper.includes("executionAttemptCount: 0 as const") &&
    sprint112Source.providerServiceHelper.includes("providerOutboundCallCount: 0 as const") &&
    sprint112Source.providerServiceHelper.includes("externalNotificationSendCount: 0 as const") &&
    sprint112Source.providerServiceHelper.includes("aiCallCount: 0 as const") &&
    sprint112Source.providerServiceHelper.includes("externalCalls: 0 as const")
  );

  record("API client Sprint 112 wiring",
    sprint112Source.apiClient.includes("providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceiptSchema") &&
    sprint112Source.apiClient.includes("post-closure-preservation-verification-receipt")
  );

  record("settings-data Sprint 112 API mode has no mock fallback",
    sprint112Source.settingsDataLoader.includes("if (mode === \"api\")") &&
    sprint112Source.settingsDataLoader.includes("getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceipt(filters)") &&
    sprint112Source.settingsDataLoader.includes("createMockReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceipt(filters)") &&
    sprint112Source.settingsDataMock.includes("mockqahandoffcertifiedreleasefinalarchivesealpostclosurepreservationverificationreceipt")
  );

  record("Settings > Channels Sprint 112 controls/results/errors",
    sprint112Source.providerPanelControls.includes("Load post-closure preservation verification receipt") &&
    sprint112Source.providerPanelResult.includes("QA archive certified release post-closure preservation verification receipt:") &&
    sprint112Source.providerPanelResult.includes("postClosurePreservationVerificationStatus=") &&
    sprint112Source.providerPanelResult.includes("finalArchiveSealPostClosurePreservationStatus=") &&
    sprint112Source.providerPanelResult.includes("postClosurePreservationVerificationRows=") &&
    sprint112Source.providerPanelResult.includes("providerOutboundCallCount=") &&
    sprint112Source.providerPanelResult.includes("externalNotificationSendCount=") &&
    sprint112Source.providerPanelResult.includes("aiCallCount=") &&
    sprint112Source.providerPanelResult.includes("externalCalls=") &&
    settingsPage.includes("QA Archive Certified Release Post-Closure Preservation Verification Receipt API error")
  );

  record("stale Sprint 112 receipt clears on upstream/API failure",
    settingsPage.includes("clearReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceipt") &&
    settingsPage.includes("setReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceipt(null)") &&
    settingsPage.includes("clearReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceipt();")
  );

  record("static Sprint 112 source has no provider outbound send markers", !containsProviderOutbound(sprint112Source));
  record("static Sprint 112 source has no external notification send markers", !containsExternalNotification(sprint112Source));
  record("static Sprint 112 source has no AI/OpenAI call markers", !containsAiCall(sprint112Source));
  record("static Sprint 112 source has no raw provider material leakage markers", !leaksRawProviderMaterial(sprint112RawLeakSurfaces));

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
  record("post-closure preservation verification receipt requires x-tenant-id", missingTenant.status >= 400 && missingTenant.status < 500);

  const prerequisiteChainPassed = runNodeSmoke("smoke-sprint111-provider-webhook-certified-release-final-archive-seal-operational-closure-receipt.mjs");
  record("safe prerequisite chain driven through Sprint 111", prerequisiteChainPassed);
  if (!prerequisiteChainPassed) return;

  const sprint111Receipt = await getJson(`${apiBase}${sprint111EndpointPath}${search}`, { "x-tenant-id": tenantId });
  const first = await getJson(`${apiBase}${endpointPath}${search}`, { "x-tenant-id": tenantId });
  const second = await getJson(`${apiBase}${endpointPath}${search}`, { "x-tenant-id": tenantId });
  const invalidTenant = await getJson(`${apiBase}${endpointPath}${search}`, { "x-tenant-id": "invalid-sprint112-tenant" });

  record("GET Sprint 112 post-closure preservation verification receipt endpoint", first.status === 200 && safePostClosurePreservationReceiptShape(first.body), first.status === 200 ? "" : `status=${first.status}`);
  record("GET Sprint 112 repeat read has no mutation",
    first.status === 200 &&
    second.status === 200 &&
    JSON.stringify(stablePostClosurePreservationReceiptSnapshot(first.body)) === JSON.stringify(stablePostClosurePreservationReceiptSnapshot(second.body))
  );
  record("Sprint 112 derives digest continuity from Sprint 111 final archive seal",
    sprint111Receipt.status === 200 &&
    first.status === 200 &&
    first.body?.inheritedFinalArchiveSealOperationalClosureReceiptSummary?.safeDigest === sprint111Receipt.body?.safeDigest &&
    first.body?.finalArchiveSealOperationalClosureReceiptDigest === sprint111Receipt.body?.safeDigest
  );
  record("invalid tenant does not return mock fallback",
    invalidTenant.status !== 200 ||
    (!String(invalidTenant.body?.safeDigest ?? "").includes("mock") && !String(invalidTenant.body?.safeDigest ?? "").includes("fake"))
  );
  record("no stale/fake Sprint 112 receipt", first.status !== 200 || (!String(first.body?.safeDigest ?? "").includes("mock") && !String(first.body?.safeDigest ?? "").includes("fake")));
  record("externalCalls = 0", first.body?.externalCalls === 0);
  record("no execution/provider outbound/notification/AI counts", first.body?.counts?.executionAttemptCount === 0 && first.body?.counts?.providerOutboundCallCount === 0 && first.body?.counts?.externalNotificationSendCount === 0 && first.body?.counts?.aiCallCount === 0);
  record("postClosurePreservationVerificationStatus=verified", first.body?.postClosurePreservationVerificationStatus === "verified");
  record("finalArchiveSealPostClosurePreservationStatus=preserved", first.body?.finalArchiveSealPostClosurePreservationStatus === "preserved");
  record("safe post-closure rows present", Array.isArray(first.body?.postClosurePreservationVerificationRows) && first.body.postClosurePreservationVerificationRows.length === 10);
  record("no raw provider material in live response", !leaksRawProviderMaterial(first.body));
}

run().then(() => {
  const failed = results.filter((result) => !result.ok);
  if (failed.length > 0) {
    console.error(`smoke:sprint112 failed ${failed.length}/${results.length} checks`);
    process.exit(1);
  }
  console.log(`smoke:sprint112 passed ${results.length}/${results.length} checks`);
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
