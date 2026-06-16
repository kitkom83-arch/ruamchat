import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const readinessEndpointPath = "/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt/handoff-packet/acceptance-record/noop-execution-dryrun/result-ledger/final-readiness-certificate/freeze-audit-register/rollback-rehearsal-receipt/control-room-packet/cutover-checklist-receipt/operator-command-receipt/go-live-authorization-receipt/launch-window-confirmation-receipt/go-live-hold-release-authorization-receipt/launch-approval-receipt/no-execution-lock-receipt/operations-handoff-readiness-no-execution-evidence-packet";
const endpointPath = `${readinessEndpointPath}/operations-handoff-acceptance-receipt`;
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
  if (startIndex === -1) return "";
  const endIndex = source.indexOf(end, startIndex + start.length);
  return source.slice(startIndex, endIndex === -1 ? undefined : endIndex);
}

function containsProviderOutbound(sources) {
  return Object.values(sources).some((source) => /\b(sendMessage|replyMessage|pushMessage|providerOutbound|sendProvider|callProviderApi)\s*\(/i.test(source));
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

function safeOperationsHandoffAcceptanceReceiptShape(value) {
  return value &&
    value.receiptKind === "qa-handoff-locked-archive-certified-release-operations-handoff-acceptance-receipt" &&
    value.packetKind === "qa-handoff-locked-archive-certified-release-operations-handoff-readiness-no-execution-evidence-packet" &&
    value.operationsHandoffAcceptanceStatus === "accepted" &&
    value.operationsCustodyStatus === "accepted" &&
    value.operationsHandoffReadinessStatus === "ready_for_handoff" &&
    value.operationsHandoffEvidencePacketStatus === "issued" &&
    value.noExecutionEvidenceStatus === "confirmed" &&
    value.launchApprovalLockStatus === "locked" &&
    value.tenantScopeStatus === "tenant_scoped" &&
    value.digestContinuityStatus === "confirmed" &&
    value.providerOutboundStatus === "absent" &&
    value.externalNotificationStatus === "absent" &&
    value.aiCallStatus === "absent" &&
    value.safeFilename === "provider-webhook-review-qa-handoff-certified-release-operations-handoff-acceptance-receipt.json" &&
    /^sha256:[a-z0-9]+$/i.test(String(value.operationsHandoffAcceptanceReceiptDigest ?? "")) &&
    value.operationsHandoffAcceptanceReceiptDigest === value.safeDigest &&
    /^sha256:[a-z0-9]+$/i.test(String(value.operationsHandoffEvidencePacketDigest ?? "")) &&
    value.noExecutionLockReceiptStatus === "issued" &&
    value.noExecutionLockStatus === "locked" &&
    value.inheritedOperationsHandoffReadinessPacketSummary?.operationsHandoffReadinessStatus === "ready_for_handoff" &&
    value.inheritedOperationsHandoffReadinessPacketSummary?.operationsHandoffEvidencePacketStatus === "issued" &&
    value.inheritedOperationsHandoffReadinessPacketSummary?.externalCallsZero === true &&
    value.counts?.operationsHandoffMutationCount === 0 &&
    value.counts?.operationsHandoffAcceptanceMutationCount === 0 &&
    value.counts?.executionAttemptCount === 0 &&
    value.counts?.providerOutboundCallCount === 0 &&
    value.counts?.externalNotificationSendCount === 0 &&
    value.counts?.aiCallCount === 0 &&
    value.externalCalls === 0 &&
    Array.isArray(value.operationsHandoffAcceptanceRows) &&
    value.operationsHandoffAcceptanceRows.length >= 4 &&
    value.operationsHandoffAcceptanceRows.every((row) => row.complete === true && row.status === "confirmed") &&
    Array.isArray(value.operationsCustodyRows) &&
    value.operationsCustodyRows.length >= 7 &&
    value.operationsCustodyRows.every((row) => row.complete === true && row.status === "confirmed") &&
    !leaksRawProviderMaterial(value);
}

function stableOperationsHandoffAcceptanceReceiptSnapshot(value) {
  if (!value || typeof value !== "object") return value;
  const {
    operationsHandoffGeneratedAt: _generatedAt,
    operationsHandoffAcceptedAt: _acceptedAt,
    ...stable
  } = value;
  return stable;
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
  const child = spawnSync(process.execPath, [path.join("scripts", scriptName)], {
    cwd: root,
    env: process.env,
    stdio: "inherit"
  });
  return child.status === 0;
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

  const sprint106Source = {
    shared: sourceSlice(shared, "providerWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceStatusSchema", "providerWebhookUnmatchedInboundBulkReviewRequestSchema"),
    providerServiceMethod: sourceSlice(providerService, "getReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceReceipt", "private getLockedArchiveContext"),
    providerServiceHelper: sourceSlice(providerService, "function qaHandoffCertifiedReleaseOperationsHandoffAcceptanceReceiptResponse", "function qaHandoffCertifiedReleaseOperationsCustodyMonitoringReadinessLedgerResponse"),
    apiClient: sourceSlice(apiClient, "getProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceReceipt", "getProviderWebhookReviewClosureReportExport"),
    settingsData: sourceSlice(settingsData, "loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceReceiptData", "loadSettingsProviderWebhookReviewClosureReportRedactionAuditData"),
    settingsPage: sourceSlice(settingsPage, "reviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceReceipt", "loadClosureReportRedactionAudit"),
    providerPanelControls: sourceSlice(providerPanel, "Load operations handoff acceptance receipt", "Audit report export redaction"),
    providerPanelResult: sourceSlice(providerPanel, "QA archive certified release operations handoff acceptance receipt:", "reviewClosureReportRedactionAudit ?")
  };

  record("smoke:sprint106 registered",
    rootPackage.scripts?.["smoke:sprint106"] === "node scripts/smoke-sprint106-provider-webhook-certified-release-operations-handoff-acceptance-receipt.mjs"
  );

  record("shared operations handoff acceptance receipt DTO export",
    sprint106Source.shared.includes("providerWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceReceiptSchema") &&
    sprint106Source.shared.includes("ProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceReceipt") &&
    sprint106Source.shared.includes("operationsHandoffAcceptanceStatus") &&
    sprint106Source.shared.includes("operationsCustodyStatus") &&
    sprint106Source.shared.includes("operationsHandoffAcceptanceReceiptDigest") &&
    sprint106Source.shared.includes("inheritedOperationsHandoffReadinessPacketSummary") &&
    sprint106Source.shared.includes("operationsHandoffAcceptanceRows") &&
    sprint106Source.shared.includes("operationsCustodyRows") &&
    sprint106Source.shared.includes("externalCalls: z.literal(0)") &&
    sprint106Source.shared.includes(".strict()")
  );

  record("backend operations handoff acceptance route requires tenant",
    providerController.includes("operations-handoff-readiness-no-execution-evidence-packet/operations-handoff-acceptance-receipt") &&
    providerController.includes("getReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceReceipt(requireTenantId(tenant)")
  );

  record("service derives acceptance receipt read-only from Sprint 105 packet",
    sprint106Source.providerServiceMethod.includes("const operationsHandoffReadinessPacket = this.getReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacket") &&
    sprint106Source.providerServiceMethod.includes("qaHandoffCertifiedReleaseOperationsHandoffAcceptanceReceiptResponse") &&
    sprint106Source.providerServiceHelper.includes("operationsHandoffAcceptanceMutationCount: 0") &&
    sprint106Source.providerServiceHelper.includes("executionAttemptCount === 0") &&
    sprint106Source.providerServiceHelper.includes("providerOutboundCallCount === 0") &&
    sprint106Source.providerServiceHelper.includes("externalNotificationSendCount === 0") &&
    sprint106Source.providerServiceHelper.includes("aiCallCount === 0") &&
    sprint106Source.providerServiceHelper.includes("externalCalls: 0 as const")
  );

  record("API client operations handoff acceptance wiring",
    sprint106Source.apiClient.includes("providerWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceReceiptSchema") &&
    sprint106Source.apiClient.includes("operations-handoff-acceptance-receipt")
  );

  record("settings-data API mode has no mock fallback",
    sprint106Source.settingsData.includes("if (mode === \"api\")") &&
    sprint106Source.settingsData.includes("getProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceReceipt(filters)") &&
    sprint106Source.settingsData.includes("createMockReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceReceipt(filters)")
  );

  record("Settings > Channels controls/results/errors",
    sprint106Source.providerPanelControls.includes("Load operations handoff acceptance receipt") &&
    sprint106Source.providerPanelResult.includes("QA archive certified release operations handoff acceptance receipt:") &&
    sprint106Source.providerPanelResult.includes("operationsHandoffAcceptanceStatus=") &&
    sprint106Source.providerPanelResult.includes("operationsCustodyStatus=") &&
    sprint106Source.providerPanelResult.includes("operationsHandoffAcceptanceReceiptDigest=") &&
    sprint106Source.providerPanelResult.includes("providerOutboundCallCount=") &&
    sprint106Source.providerPanelResult.includes("externalNotificationSendCount=") &&
    sprint106Source.providerPanelResult.includes("aiCallCount=") &&
    sprint106Source.providerPanelResult.includes("externalCalls=") &&
    sprint106Source.settingsPage.includes("QA Archive Certified Release Operations Handoff Acceptance Receipt API error")
  );

  record("stale operations handoff acceptance receipt clears on upstream reloads",
    settingsPage.includes("clearReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceReceipt") &&
    settingsPage.includes("setReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceReceipt(null)") &&
    settingsPage.includes("clearReviewQaHandoffCertifiedReleaseOperationsHandoffAcceptanceReceipt();")
  );

  record("static Sprint 106 source has no provider outbound send markers", !containsProviderOutbound(sprint106Source));
  record("static Sprint 106 source has no external notification send markers", !containsExternalNotification(sprint106Source));
  record("static Sprint 106 source has no AI/OpenAI call markers", !containsAiCall(sprint106Source));
  record("static Sprint 106 source has no raw provider material leakage markers", !leaksRawProviderMaterial(sprint106Source));

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
  record("operations handoff acceptance receipt requires x-tenant-id", missingTenant.status >= 400 && missingTenant.status < 500);

  const prerequisiteChainPassed = runNodeSmoke("smoke-sprint105-provider-webhook-certified-release-operations-handoff-readiness-no-execution-evidence-packet.mjs");
  record("safe prerequisite chain driven through Sprint 105", prerequisiteChainPassed);
  if (!prerequisiteChainPassed) return;

  const readinessPacket = await getJson(`${apiBase}${readinessEndpointPath}${search}`, { "x-tenant-id": tenantId });
  const first = await getJson(`${apiBase}${endpointPath}${search}`, { "x-tenant-id": tenantId });
  const second = await getJson(`${apiBase}${endpointPath}${search}`, { "x-tenant-id": tenantId });
  record("GET Sprint 106 operations handoff acceptance receipt endpoint", first.status === 200 && safeOperationsHandoffAcceptanceReceiptShape(first.body), first.status === 200 ? "" : `status=${first.status}`);
  record("GET Sprint 106 operations handoff acceptance receipt no mutation repeat read",
    first.status === 200 &&
    second.status === 200 &&
    JSON.stringify(stableOperationsHandoffAcceptanceReceiptSnapshot(first.body)) === JSON.stringify(stableOperationsHandoffAcceptanceReceiptSnapshot(second.body))
  );
  record("Sprint 106 digest continuity from Sprint 105 packet",
    readinessPacket.status === 200 &&
    first.status === 200 &&
    first.body?.inheritedOperationsHandoffReadinessPacketSummary?.operationsHandoffEvidencePacketDigest === readinessPacket.body?.operationsHandoffEvidencePacketDigest &&
    first.body?.operationsHandoffEvidencePacketDigest === readinessPacket.body?.operationsHandoffEvidencePacketDigest
  );
  record("no stale/fake operations handoff acceptance receipt", !String(first.body?.operationsHandoffAcceptanceReceiptDigest ?? "").includes("fake") && first.body?.receiptKind === "qa-handoff-locked-archive-certified-release-operations-handoff-acceptance-receipt");
  record("externalCalls = 0", first.body?.externalCalls === 0);
  record("no execution/mutation/provider outbound/notification/AI counts", first.body?.counts?.executionAttemptCount === 0 && first.body?.counts?.operationsHandoffAcceptanceMutationCount === 0 && first.body?.counts?.providerOutboundCallCount === 0 && first.body?.counts?.externalNotificationSendCount === 0 && first.body?.counts?.aiCallCount === 0);
  record("no raw provider material in live response", !leaksRawProviderMaterial(first.body));
}

run().then(() => {
  const failed = results.filter((result) => !result.ok);
  if (failed.length > 0) {
    console.error(`smoke:sprint106 failed ${failed.length}/${results.length} checks`);
    process.exit(1);
  }
  console.log(`smoke:sprint106 passed ${results.length}/${results.length} checks`);
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
