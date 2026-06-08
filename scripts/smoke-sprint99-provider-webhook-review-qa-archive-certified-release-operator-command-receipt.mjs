import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const baseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");
const tenantId = process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
const userId = process.env.USER_ID ?? "00000000-0000-4000-8000-000000000011";
const filters = "provider=line&eventType=message.created";
const releaseBasePath = "/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence";
const operatorCommandReceiptPath = `${releaseBasePath}/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt/handoff-packet/acceptance-record/noop-execution-dryrun/result-ledger/final-readiness-certificate/freeze-audit-register/rollback-rehearsal-receipt/control-room-packet/cutover-checklist-receipt/operator-command-receipt`;
const results = [];

async function main() {
  record("local API only", isLocalBaseUrl(baseUrl));

  const rootPackage = JSON.parse(readFileSync("package.json", "utf8"));
  const shared = readFileSync("packages/shared/src/index.ts", "utf8");
  const providerController = readFileSync("apps/api/src/controllers/provider-webhooks.controller.ts", "utf8");
  const providerService = readFileSync("apps/api/src/services/provider-webhook-events.service.ts", "utf8");
  const apiClient = readFileSync("apps/web/app/api-client.ts", "utf8");
  const settingsData = readFileSync("apps/web/app/settings-data.ts", "utf8");
  const settingsPage = readFileSync("apps/web/app/settings/channels/page.tsx", "utf8");
  const providerPanel = readFileSync("apps/web/app/settings/provider-readiness-panel.tsx", "utf8");
  const sprint99Source = {
    shared: sourceSlice(shared, "providerWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceiptStatusSchema", "providerWebhookUnmatchedInboundBulkReviewRequestSchema"),
    providerController: sourceSlice(providerController, "cutover-checklist-receipt/operator-command-receipt", "review-closure-report/export"),
    providerService: [
      sourceSlice(providerService, "getReviewQaHandoffCertifiedReleaseOperatorCommandReceipt(", "private getLockedArchiveContext"),
      sourceSlice(providerService, "function qaHandoffCertifiedReleaseOperatorCommandReceiptResponse", "function qaHandoffCertifiedReleaseCutoverChecklistReceiptResponse")
    ].join("\n"),
    apiClient: sourceSlice(apiClient, "getProviderWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceipt", "getProviderWebhookReviewClosureReportExport"),
    settingsData: [
      sourceSlice(settingsData, "loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceiptData", "loadSettingsProviderWebhookReviewClosureReportRedactionAuditData"),
      sourceSlice(settingsData, "function createMockReviewQaHandoffCertifiedReleaseOperatorCommandReceipt", "function mockCertifiedReleaseCutoverChecklistReady")
    ].join("\n"),
    settingsPage: [
      sourceSlice(settingsPage, "reviewQaHandoffCertifiedReleaseOperatorCommandReceipt", "reviewClosureReportRedactionAudit"),
      sourceSlice(settingsPage, "loadReviewQaHandoffCertifiedReleaseOperatorCommandReceipt", "loadClosureReportRedactionAudit")
    ].join("\n"),
    providerPanel: [
      sourceSlice(providerPanel, "Load certified release operator command receipt", "Audit report export redaction"),
      sourceSlice(providerPanel, "QA archive certified release operator command receipt:", "reviewQaHandoffLockedArchive ?")
    ].join("\n")
  };

  record("smoke:sprint99 registered",
    rootPackage.scripts?.["smoke:sprint99"] === "node scripts/smoke-sprint99-provider-webhook-review-qa-archive-certified-release-operator-command-receipt.mjs"
  );
  record("Sprint 98 regression smoke still registered",
    rootPackage.scripts?.["smoke:sprint98"] === "node scripts/smoke-sprint98-provider-webhook-review-qa-archive-certified-release-cutover-checklist-receipt.mjs"
  );
  record("shared operator command receipt DTO export",
    sprint99Source.shared.includes("providerWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceiptSchema") &&
    sprint99Source.shared.includes("ProviderWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceipt") &&
    sprint99Source.shared.includes('"pending"') &&
    sprint99Source.shared.includes('"issued"') &&
    sprint99Source.shared.includes('"blocked"') &&
    sprint99Source.shared.includes('"incomplete"') &&
    sprint99Source.shared.includes("goLiveAuthorizationStatus") &&
    sprint99Source.shared.includes("operatorCommandReceiptDigest") &&
    sprint99Source.shared.includes("goLiveAuthorizationRows") &&
    sprint99Source.shared.includes("operatorCommandReceiptRows") &&
    sprint99Source.shared.includes("commandHandoffRows") &&
    sprint99Source.shared.includes("externalCalls: z.literal(0)") &&
    sprint99Source.shared.includes(".strict()")
  );
  record("backend operator command receipt route registration",
    providerController.includes('@Get("review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt/handoff-packet/acceptance-record/noop-execution-dryrun/result-ledger/final-readiness-certificate/freeze-audit-register/rollback-rehearsal-receipt/control-room-packet/cutover-checklist-receipt/operator-command-receipt")') &&
    providerController.includes("getReviewQaHandoffCertifiedReleaseOperatorCommandReceipt") &&
    providerController.includes("requireTenantId(tenant)")
  );
  record("service operator command receipt implementation",
    sprint99Source.providerService.includes("qaHandoffCertifiedReleaseOperatorCommandReceiptResponse") &&
    sprint99Source.providerService.includes("certifiedReleaseOperatorCommandReceiptReady") &&
    sprint99Source.providerService.includes("operatorCommandReceiptMutationCount: 0") &&
    sprint99Source.providerService.includes("externalCalls: 0 as const")
  );
  record("API client operator command receipt wiring",
    apiClient.includes("getProviderWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceipt") &&
    apiClient.includes("providerWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceiptSchema") &&
    apiClient.includes(`${operatorCommandReceiptPath}`)
  );
  record("settings-data operator command receipt API mode has no fallback",
    /if \(mode === "api"\) \{\s*return \{\s*mode,\s*operatorCommandReceipt: await getProviderWebhookReviewQaHandoffCertifiedReleaseOperatorCommandReceipt/s.test(settingsData) &&
    settingsData.includes("createMockReviewQaHandoffCertifiedReleaseOperatorCommandReceipt")
  );
  record("Settings > Channels operator command receipt controls/results/errors",
    settingsPage.includes("QA Archive Certified Release Operator Command Receipt API error") &&
    settingsPage.includes("clearReviewQaHandoffCertifiedReleaseOperatorCommandReceipt") &&
    settingsPage.includes("onLoadReviewQaHandoffCertifiedReleaseOperatorCommandReceipt={loadReviewQaHandoffCertifiedReleaseOperatorCommandReceipt}") &&
    providerPanel.includes("Load certified release operator command receipt") &&
    providerPanel.includes("QA archive certified release operator command receipt:") &&
    providerPanel.includes("operatorCommandReceiptStatus=") &&
    providerPanel.includes("goLiveAuthorizationStatus=") &&
    providerPanel.includes("operatorCommandReceiptRows=") &&
    providerPanel.includes("commandHandoffRows=") &&
    providerPanel.includes("externalCalls=")
  );
  record("stale operator command receipt clears on upstream reloads",
    settingsPage.includes("clearReviewQaHandoffCertifiedReleaseCutoverChecklistReceipt();") &&
    settingsPage.includes("clearReviewQaHandoffCertifiedReleaseOperatorCommandReceipt();") &&
    settingsPage.includes("setReviewQaHandoffCertifiedReleaseOperatorCommandReceipt(null)")
  );
  record("static Sprint 99 source has no provider outbound send markers", !containsProviderOutbound(sprint99Source));
  record("static Sprint 99 source has no external notification send markers", !containsExternalNotification(sprint99Source));
  record("static Sprint 99 source has no AI/OpenAI call markers", !containsAiCall(sprint99Source));

  const health = await safeJson(await request("GET", "/health"));
  record("GET /health reachable", health?.status === "ok" && health?.service === "api");

  const missingTenantReceipt = await requestJsonWithoutTenant("GET", `${operatorCommandReceiptPath}?${filters}`);
  record("operator command receipt requires x-tenant-id", missingTenantReceipt.status >= 400 && missingTenantReceipt.status < 500);

  const incompleteTenant = `00000000-0000-4000-8000-${String(Date.now()).slice(-12)}`;
  const incompleteChainReceipt = await requestJson("GET", `${operatorCommandReceiptPath}?${filters}`, undefined, incompleteTenant);
  record("incomplete chain returns explicit 409", incompleteChainReceipt.status === 409 && /required|prerequisite|lock|archive|dry|rollback|control|packet|cutover/i.test(JSON.stringify(incompleteChainReceipt.body)));

  record("complete/load safe chain through Sprint 98 certified release cutover checklist receipt", runSprint98Smoke());

  const beforeReceiptPage = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound?provider=line&limit=25&offset=0&sortBy=receivedAt&sortOrder=desc"));
  const beforeSnapshot = stableQueueSnapshot(beforeReceiptPage);
  const operatorCommandReceipt = await safeJson(await request("GET", `${operatorCommandReceiptPath}?${filters}`));
  const afterReceiptPage = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound?provider=line&limit=25&offset=0&sortBy=receivedAt&sortOrder=desc"));
  const afterSnapshot = stableQueueSnapshot(afterReceiptPage);
  const invalidTenantReceipt = await requestJson("GET", `${operatorCommandReceiptPath}?${filters}`, undefined, "00000000-0000-4000-8000-000000000099");

  record("GET Sprint 99 operator command receipt endpoint", safeOperatorCommandReceiptShape(operatorCommandReceipt));
  record("operatorCommandReceiptStatus issued", operatorCommandReceipt.operatorCommandReceiptStatus === "issued");
  record("goLiveAuthorizationStatus ready", operatorCommandReceipt.goLiveAuthorizationStatus === "ready");
  record("cutoverChecklistStatus verified", operatorCommandReceipt.cutoverChecklistStatus === "verified");
  record("operatorCommandStatus ready", operatorCommandReceipt.operatorCommandStatus === "ready");
  record("controlRoomStatus ready", operatorCommandReceipt.controlRoomStatus === "ready");
  record("cutoverReadinessStatus ready", operatorCommandReceipt.cutoverReadinessStatus === "ready");
  record("rollbackRehearsalStatus verified", operatorCommandReceipt.rollbackRehearsalStatus === "verified");
  record("recoveryReadinessStatus ready", operatorCommandReceipt.recoveryReadinessStatus === "ready");
  record("rollbackReadinessStatus ready", operatorCommandReceipt.rollbackReadinessStatus === "ready");
  record("freezeAuditStatus recorded", operatorCommandReceipt.freezeAuditStatus === "recorded");
  record("freezeStatus frozen", operatorCommandReceipt.freezeStatus === "frozen");
  record("certificateStatus issued", operatorCommandReceipt.certificateStatus === "issued");
  record("finalReadinessStatus ready", operatorCommandReceipt.finalReadinessStatus === "ready");
  record("ledgerStatus recorded", operatorCommandReceipt.ledgerStatus === "recorded");
  record("dryRunStatus passed", operatorCommandReceipt.dryRunStatus === "passed");
  record("executionMode no_op", operatorCommandReceipt.executionMode === "no_op");
  record("acceptanceStatus acknowledged", operatorCommandReceipt.acceptanceStatus === "acknowledged");
  record("handoffStatus ready", operatorCommandReceipt.handoffStatus === "ready");
  record("releaseDecision go", operatorCommandReceipt.releaseDecision === "go");
  record("packetStatus issued", operatorCommandReceipt.packetStatus === "issued");
  record("receiptStatus issued", operatorCommandReceipt.receiptStatus === "issued");
  record("gateStatus ready", operatorCommandReceipt.gateStatus === "ready");
  record("goNoGoDecision go", operatorCommandReceipt.goNoGoDecision === "go");
  record("reconciliationStatus complete/aligned", ["complete", "aligned"].includes(operatorCommandReceipt.reconciliationStatus));
  record("attestationStatus complete", operatorCommandReceipt.attestationStatus === "complete");
  record("closure ledger status certified_release_closed", operatorCommandReceipt.ledgerStatusFromClosure === "certified_release_closed");
  record("certificationStatus certified", operatorCommandReceipt.certificationStatus === "certified");
  record("releaseReadinessStatus ready_for_release", operatorCommandReceipt.releaseReadinessStatus === "ready_for_release");
  record("verificationStatus verified", operatorCommandReceipt.verificationStatus === "verified");
  record("digestChainStatus confirmed", operatorCommandReceipt.digestChainStatus === "confirmed");
  record("prerequisite checklist complete", operatorCommandReceipt.inheritedPrerequisiteChecklist?.every((item) => item.complete));
  record("certification checklist complete", operatorCommandReceipt.inheritedCertificationChecklist?.every((item) => item.complete));
  record("gate checklist complete", operatorCommandReceipt.inheritedGateChecklist?.every((item) => item.complete));
  record("decision receipt summary present", Boolean(operatorCommandReceipt.inheritedDecisionReceiptSummary?.safeDigest));
  record("handoff packet summary present", Boolean(operatorCommandReceipt.inheritedHandoffPacketSummary?.safeDigest));
  record("acceptance summary present", Boolean(operatorCommandReceipt.inheritedAcceptanceSummary?.safeDigest));
  record("no-op dry-run summary present", Boolean(operatorCommandReceipt.inheritedNoopDryRunSummary?.safeDigest));
  record("dry-run result ledger summary present", Boolean(operatorCommandReceipt.inheritedResultLedgerSummary?.safeDigest));
  record("final readiness certificate summary present", Boolean(operatorCommandReceipt.inheritedFinalReadinessCertificateSummary?.safeDigest));
  record("freeze audit summary present", Boolean(operatorCommandReceipt.inheritedFreezeAuditSummary?.safeDigest));
  record("rollback rehearsal summary present", Boolean(operatorCommandReceipt.inheritedRollbackRehearsalSummary?.safeDigest));
  record("control room summary present", Boolean(operatorCommandReceipt.inheritedControlRoomSummary?.safeDigest));
  record("cutover checklist summary present", Boolean(operatorCommandReceipt.inheritedCutoverChecklistSummary?.safeDigest));
  record("operatorChecklist present", operatorCommandReceipt.operatorChecklist?.length > 0 && operatorCommandReceipt.operatorChecklist.every((item) => item.complete));
  record("acknowledgedChecklist present", operatorCommandReceipt.acknowledgedChecklist?.length > 0 && operatorCommandReceipt.acknowledgedChecklist.every((item) => item.acknowledged));
  record("executionChecklist present", operatorCommandReceipt.executionChecklist?.length > 0 && operatorCommandReceipt.executionChecklist.every((item) => item.complete));
  record("cutoverChecklistRows present", operatorCommandReceipt.cutoverChecklistRows?.length > 0);
  record("operatorHandoffRows present", operatorCommandReceipt.operatorHandoffRows?.length > 0);
  record("operatorCommandRows present", operatorCommandReceipt.operatorCommandRows?.length > 0 && operatorCommandReceipt.operatorCommandRows.every((row) => row.complete));
  record("safeCutoverChecklistRows present", operatorCommandReceipt.safeCutoverChecklistRows?.length > 0 && operatorCommandReceipt.safeCutoverChecklistRows.every((row) => row.complete));
  record("goLiveAuthorizationRows present", operatorCommandReceipt.goLiveAuthorizationRows?.length > 0 && operatorCommandReceipt.goLiveAuthorizationRows.every((row) => row.complete));
  record("operatorCommandReceiptRows present", operatorCommandReceipt.operatorCommandReceiptRows?.length > 0 && operatorCommandReceipt.operatorCommandReceiptRows.every((row) => row.complete));
  record("commandHandoffRows present", operatorCommandReceipt.commandHandoffRows?.length > 0 && operatorCommandReceipt.commandHandoffRows.every((row) => row.complete));
  record("releaseOwnerSummary present", Boolean(operatorCommandReceipt.releaseOwnerSummary?.ownerRole));
  record("safe digests only", safeDigestFieldsOnly(operatorCommandReceipt));
  record("inheritedBlockingReasons safe", Array.isArray(operatorCommandReceipt.inheritedBlockingReasons) && !JSON.stringify(operatorCommandReceipt.inheritedBlockingReasons).match(rawLeakPattern()));
  record("inheritedExceptionRows safe", Array.isArray(operatorCommandReceipt.inheritedExceptionRows) && !JSON.stringify(operatorCommandReceipt.inheritedExceptionRows).match(rawLeakPattern()));
  record("counts present", operatorCommandReceipt.counts && operatorCommandReceipt.counts.operatorCommandReceiptCheckedCount === 1);
  record("externalCalls = 0", operatorCommandReceipt.externalCalls === 0);
  record("GET no mutation before/after read", JSON.stringify(beforeSnapshot) === JSON.stringify(afterSnapshot));
  record("no review/link/message/unmatched/archive/release state mutation", operatorCommandReceipt.counts.operatorCommandReceiptMutationCount === 0);
  record("invalid tenant access does not return mock fallback", invalidTenantReceipt.status >= 400 && invalidTenantReceipt.status < 500);
  record("no stale/fake operator command receipt", !String(operatorCommandReceipt.operatorCommandReceiptDigest ?? "").includes("fake") && operatorCommandReceipt.receiptKind === "qa-handoff-locked-archive-certified-release-operator-command-receipt");
  record("no raw leakage", !JSON.stringify(operatorCommandReceipt).match(rawLeakPattern()));
  record("no provider outbound", !containsProviderOutbound(sprint99Source));
  record("no external notification sending", !containsExternalNotification(sprint99Source));
  record("no AI/OpenAI call", !containsAiCall(sprint99Source));

  summarize();
}

function runSprint98Smoke() {
  const command = process.platform === "win32" ? "npm.cmd" : "npm";
  const result = spawnSync(command, ["run", "smoke:sprint98"], {
    cwd: process.cwd(),
    env: process.env,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
  if (result.status !== 0) {
    console.error(result.stdout);
    console.error(result.stderr);
  }
  return result.status === 0;
}

async function request(method, path, body, requestTenantId = tenantId) {
  const headers = {
    "content-type": "application/json",
    "x-tenant-id": requestTenantId,
    "x-user-id": userId
  };
  return fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  });
}

async function requestJson(method, path, body, requestTenantId = tenantId) {
  const response = await request(method, path, body, requestTenantId);
  return {
    status: response.status,
    body: await safeJson(response)
  };
}

async function requestJsonWithoutTenant(method, path, body) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      "x-user-id": userId
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  return {
    status: response.status,
    body: await safeJson(response)
  };
}

async function safeJson(response) {
  const text = await response.text();
  if (!response.ok) {
    try {
      return JSON.parse(text);
    } catch {
      return { statusCode: response.status, message: text };
    }
  }
  return text ? JSON.parse(text) : null;
}

function stableQueueSnapshot(page) {
  return (page?.items ?? []).map((item) => ({
    id: item.id,
    reviewStatus: item.reviewStatus,
    linkStatus: item.linkStatus,
    unmatchedStatus: item.unmatchedStatus,
    assignmentStatus: item.assignmentStatus,
    escalationStatus: item.escalationStatus,
    resolutionStatus: item.resolutionStatus,
    messagePersisted: item.messagePersisted,
    linkedConversationId: item.linkedConversationId,
    linkedMessageId: item.linkedMessageId
  }));
}

function safeOperatorCommandReceiptShape(value) {
  return value?.receiptKind === "qa-handoff-locked-archive-certified-release-operator-command-receipt" &&
    value.operatorCommandReceiptStatus === "issued" &&
    value.goLiveAuthorizationStatus === "ready" &&
    value.executionMode === "no_op" &&
    value.externalCalls === 0 &&
    Array.isArray(value.goLiveAuthorizationRows) &&
    Array.isArray(value.operatorCommandReceiptRows) &&
    Array.isArray(value.commandHandoffRows);
}

function safeDigestFieldsOnly(value) {
  return Object.entries(flatten(value))
    .filter(([key]) => /digest/i.test(key))
    .every(([, digest]) => typeof digest !== "string" || /^sha256:[a-z0-9-]+$/i.test(digest));
}

function flatten(value, prefix = "", out = {}) {
  if (!value || typeof value !== "object") return out;
  for (const [key, nested] of Object.entries(value)) {
    const nextKey = prefix ? `${prefix}.${key}` : key;
    if (nested && typeof nested === "object" && !Array.isArray(nested)) {
      flatten(nested, nextKey, out);
    } else {
      out[nextKey] = nested;
    }
  }
  return out;
}

function sourceSlice(source, start, end) {
  const startIndex = source.indexOf(start);
  if (startIndex < 0) return "";
  const endIndex = source.indexOf(end, startIndex + start.length);
  return source.slice(startIndex, endIndex < 0 ? undefined : endIndex);
}

function containsProviderOutbound(sourceMap) {
  return Object.values(sourceMap).some((source) => /\b(push|send|reply|broadcast|notify|providerOutbound|callProvider|webhookDispatch)\b/i.test(source));
}

function containsExternalNotification(sourceMap) {
  return Object.values(sourceMap).some((source) => /\b(sendEmail|sendSms|externalNotification|notifyExternal|notificationClient)\b/i.test(source));
}

function containsAiCall(sourceMap) {
  return Object.values(sourceMap).some((source) => /\b(openai|OpenAI|chat\.completions|responses\.create|aiSuggested|llm)\b/i.test(source));
}

function rawLeakPattern() {
  return /\b(rawPayload|signature|token|authorization|cookie|replyToken|senderId|rawRoom|providerMaterial|rawBody|headers|stack|secret|raw provider|raw webhook|raw signature)\b/i;
}

function isLocalBaseUrl(value) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(value);
}

function record(name, ok) {
  results.push({ name, ok: Boolean(ok) });
  console.log(`${ok ? "PASS" : "FAIL"} ${name}`);
}

function summarize() {
  const failed = results.filter((result) => !result.ok);
  if (failed.length > 0) {
    console.error(`Sprint 99 smoke failed: ${failed.map((result) => result.name).join("; ")}`);
    process.exitCode = 1;
    return;
  }
  console.log(`Sprint 99 smoke passed: ${results.length} checks`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
