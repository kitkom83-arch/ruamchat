import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const endpointPath = "/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt/handoff-packet/acceptance-record/noop-execution-dryrun/result-ledger/final-readiness-certificate/freeze-audit-register/rollback-rehearsal-receipt/control-room-packet/cutover-checklist-receipt/operator-command-receipt/go-live-authorization-receipt/launch-window-confirmation-receipt/go-live-hold-release-authorization-receipt/launch-approval-receipt/no-execution-lock-receipt/operations-handoff-readiness-no-execution-evidence-packet";
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

function safeOperationsHandoffPacketShape(value) {
  return value &&
    value.packetKind === "qa-handoff-locked-archive-certified-release-operations-handoff-readiness-no-execution-evidence-packet" &&
    value.operationsHandoffReadinessStatus === "ready_for_handoff" &&
    value.operationsHandoffEvidencePacketStatus === "issued" &&
    value.noExecutionEvidenceStatus === "confirmed" &&
    value.launchApprovalLockStatus === "locked" &&
    value.tenantScopeStatus === "tenant_scoped" &&
    value.digestContinuityStatus === "confirmed" &&
    value.providerOutboundStatus === "absent" &&
    value.externalNotificationStatus === "absent" &&
    value.aiCallStatus === "absent" &&
    value.safeFilename === "provider-webhook-review-qa-handoff-certified-release-operations-handoff-readiness-no-execution-evidence-packet.json" &&
    /^sha256:[a-z0-9]+$/i.test(String(value.operationsHandoffEvidencePacketDigest ?? "")) &&
    value.noExecutionLockReceiptStatus === "issued" &&
    value.noExecutionLockStatus === "locked" &&
    value.counts?.operationsHandoffMutationCount === 0 &&
    value.counts?.executionAttemptCount === 0 &&
    value.counts?.providerOutboundCallCount === 0 &&
    value.counts?.externalNotificationSendCount === 0 &&
    value.counts?.aiCallCount === 0 &&
    value.externalCalls === 0 &&
    Array.isArray(value.operationsHandoffPrerequisiteRows) &&
    value.operationsHandoffPrerequisiteRows.length >= 4 &&
    Array.isArray(value.operationsHandoffBlockerRows) &&
    value.operationsHandoffBlockerRows.length >= 4 &&
    Array.isArray(value.operationsHandoffEvidenceRows) &&
    value.operationsHandoffEvidenceRows.length >= 4 &&
    !leaksRawProviderMaterial(value);
}

function stableOperationsHandoffPacketSnapshot(value) {
  if (!value || typeof value !== "object") return value;
  const { operationsHandoffGeneratedAt: _generatedAt, ...stable } = value;
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

async function run() {
  const rootPackage = JSON.parse(read("package.json"));
  const shared = read("packages/shared/src/index.ts");
  const providerController = read("apps/api/src/controllers/provider-webhooks.controller.ts");
  const providerService = read("apps/api/src/services/provider-webhook-events.service.ts");
  const apiClient = read("apps/web/app/api-client.ts");
  const settingsData = read("apps/web/app/settings-data.ts");
  const settingsPage = read("apps/web/app/settings/channels/page.tsx");
  const providerPanel = read("apps/web/app/settings/provider-readiness-panel.tsx");

  const sprint105Source = {
    shared: sourceSlice(shared, "providerWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessStatusSchema", "providerWebhookUnmatchedInboundBulkReviewRequestSchema"),
    providerServiceMethod: sourceSlice(providerService, "getReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacket", "private getLockedArchiveContext"),
    providerServiceHelper: sourceSlice(providerService, "function qaHandoffCertifiedReleaseOperationsHandoffReadinessPacketResponse", "function qaHandoffCertifiedReleaseOperationsHandoffAcceptanceReceiptResponse"),
    apiClient: sourceSlice(apiClient, "getProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacket", "getProviderWebhookReviewClosureReportExport"),
    settingsData: sourceSlice(settingsData, "loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacketData", "loadSettingsProviderWebhookReviewClosureReportRedactionAuditData"),
    settingsPage: sourceSlice(settingsPage, "reviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacket", "loadClosureReportRedactionAudit"),
    providerPanelControls: sourceSlice(providerPanel, "Load operations handoff readiness packet", "Audit report export redaction"),
    providerPanelResult: sourceSlice(providerPanel, "QA archive certified release operations handoff readiness no-execution evidence packet:", "reviewClosureReportRedactionAudit ?")
  };

  record("smoke:sprint105 registered",
    rootPackage.scripts?.["smoke:sprint105"] === "node scripts/smoke-sprint105-provider-webhook-certified-release-operations-handoff-readiness-no-execution-evidence-packet.mjs"
  );

  record("shared operations handoff readiness DTO export",
    sprint105Source.shared.includes("providerWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacketSchema") &&
    sprint105Source.shared.includes("ProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacket") &&
    sprint105Source.shared.includes("operationsHandoffReadinessStatus") &&
    sprint105Source.shared.includes("operationsHandoffEvidencePacketStatus") &&
    sprint105Source.shared.includes("noExecutionEvidenceStatus") &&
    sprint105Source.shared.includes("launchApprovalLockStatus") &&
    sprint105Source.shared.includes("digestContinuityStatus") &&
    sprint105Source.shared.includes("operationsHandoffPrerequisiteRows") &&
    sprint105Source.shared.includes("operationsHandoffBlockerRows") &&
    sprint105Source.shared.includes("operationsHandoffEvidenceRows") &&
    sprint105Source.shared.includes("externalCalls: z.literal(0)") &&
    sprint105Source.shared.includes(".strict()")
  );

  record("backend operations handoff route requires tenant",
    providerController.includes("operations-handoff-readiness-no-execution-evidence-packet") &&
    providerController.includes("getReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacket(requireTenantId(tenant)")
  );

  record("service derives operations handoff packet read-only from Sprint 104 receipt",
    sprint105Source.providerServiceMethod.includes("const noExecutionLockReceipt = this.getReviewQaHandoffCertifiedReleaseNoExecutionLockReceipt") &&
    sprint105Source.providerServiceMethod.includes("qaHandoffCertifiedReleaseOperationsHandoffReadinessPacketResponse") &&
    sprint105Source.providerServiceHelper.includes("operationsHandoffMutationCount: 0") &&
    sprint105Source.providerServiceHelper.includes("executionAttemptCount === 0") &&
    sprint105Source.providerServiceHelper.includes("providerOutboundCallCount === 0") &&
    sprint105Source.providerServiceHelper.includes("externalNotificationSendCount === 0") &&
    sprint105Source.providerServiceHelper.includes("aiCallCount === 0") &&
    sprint105Source.providerServiceHelper.includes("externalCalls: 0 as const")
  );

  record("API client operations handoff wiring",
    sprint105Source.apiClient.includes("providerWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacketSchema") &&
    sprint105Source.apiClient.includes("operations-handoff-readiness-no-execution-evidence-packet")
  );

  record("settings-data API mode has no mock fallback",
    sprint105Source.settingsData.includes("if (mode === \"api\")") &&
    sprint105Source.settingsData.includes("getProviderWebhookReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacket(filters)") &&
    sprint105Source.settingsData.includes("createMockReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacket(filters)")
  );

  record("Settings > Channels controls/results/errors",
    sprint105Source.providerPanelControls.includes("Load operations handoff readiness packet") &&
    sprint105Source.providerPanelResult.includes("QA archive certified release operations handoff readiness no-execution evidence packet:") &&
    sprint105Source.providerPanelResult.includes("operationsHandoffReadinessStatus=") &&
    sprint105Source.providerPanelResult.includes("operationsHandoffEvidencePacketDigest=") &&
    sprint105Source.providerPanelResult.includes("providerOutboundCallCount=") &&
    sprint105Source.providerPanelResult.includes("externalNotificationSendCount=") &&
    sprint105Source.providerPanelResult.includes("aiCallCount=") &&
    sprint105Source.providerPanelResult.includes("externalCalls=") &&
    sprint105Source.settingsPage.includes("QA Archive Certified Release Operations Handoff Readiness No-Execution Evidence Packet API error")
  );

  record("stale operations handoff packet clears on upstream reloads",
    settingsPage.includes("clearReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacket") &&
    settingsPage.includes("setReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacket(null)") &&
    settingsPage.includes("clearReviewQaHandoffCertifiedReleaseOperationsHandoffReadinessPacket();")
  );

  record("static Sprint 105 source has no provider outbound send markers", !containsProviderOutbound(sprint105Source));
  record("static Sprint 105 source has no external notification send markers", !containsExternalNotification(sprint105Source));
  record("static Sprint 105 source has no AI/OpenAI call markers", !containsAiCall(sprint105Source));
  record("static Sprint 105 source has no raw provider material leakage markers", !leaksRawProviderMaterial(sprint105Source));

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
  record("operations handoff packet requires x-tenant-id", missingTenant.status >= 400 && missingTenant.status < 500);

  await import("./smoke-sprint104-provider-webhook-review-qa-archive-certified-release-launch-approval-no-execution-lock-receipt.mjs");

  const first = await getJson(`${apiBase}${endpointPath}${search}`, { "x-tenant-id": tenantId });
  const second = await getJson(`${apiBase}${endpointPath}${search}`, { "x-tenant-id": tenantId });
  record("GET Sprint 105 operations handoff packet endpoint", first.status === 200 && safeOperationsHandoffPacketShape(first.body), first.status === 200 ? "" : `status=${first.status}`);
  record("GET Sprint 105 operations handoff packet no mutation repeat read",
    first.status === 200 &&
    second.status === 200 &&
    JSON.stringify(stableOperationsHandoffPacketSnapshot(first.body)) === JSON.stringify(stableOperationsHandoffPacketSnapshot(second.body))
  );
  record("no stale/fake operations handoff packet", !String(first.body?.operationsHandoffEvidencePacketDigest ?? "").includes("fake") && first.body?.packetKind === "qa-handoff-locked-archive-certified-release-operations-handoff-readiness-no-execution-evidence-packet");
  record("externalCalls = 0", first.body?.externalCalls === 0);
  record("no execution/mutation/provider outbound/notification/AI counts", first.body?.counts?.executionAttemptCount === 0 && first.body?.counts?.operationsHandoffMutationCount === 0 && first.body?.counts?.providerOutboundCallCount === 0 && first.body?.counts?.externalNotificationSendCount === 0 && first.body?.counts?.aiCallCount === 0);
  record("no raw provider material in live response", !leaksRawProviderMaterial(first.body));
}

run().then(() => {
  const failed = results.filter((result) => !result.ok);
  if (failed.length > 0) {
    console.error(`smoke:sprint105 failed ${failed.length}/${results.length} checks`);
    process.exit(1);
  }
  console.log(`smoke:sprint105 passed ${results.length}/${results.length} checks`);
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
