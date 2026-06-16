import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const sprint113EndpointPath = "/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence/verification/certification/closure-ledger/attestation-audit/reconciliation/release-gate/decision-receipt/handoff-packet/acceptance-record/noop-execution-dryrun/result-ledger/final-readiness-certificate/freeze-audit-register/rollback-rehearsal-receipt/control-room-packet/cutover-checklist-receipt/operator-command-receipt/go-live-authorization-receipt/launch-window-confirmation-receipt/go-live-hold-release-authorization-receipt/launch-approval-receipt/no-execution-lock-receipt/operations-handoff-readiness-no-execution-evidence-packet/operations-handoff-acceptance-receipt/operations-custody-monitoring-readiness-ledger/operations-custody-monitoring-closeout-seal-receipt/final-no-execution-evidence-rollup/final-evidence-index-regression-guardrail-receipt/final-archive-seal-operational-closure-receipt/post-closure-preservation-verification-receipt/post-closure-preservation-continuity-ledger-receipt";
const endpointPath = `${sprint113EndpointPath}/post-closure-preservation-custody-audit-receipt`;
const releaseBasePath = "/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/release-evidence";
const attestationPath = `${releaseBasePath}/verification/certification/closure-ledger/attestation-audit`;
const reconciliationPath = `${attestationPath}/reconciliation`;
const releaseGatePath = `${reconciliationPath}/release-gate`;
const decisionReceiptPath = `${releaseGatePath}/decision-receipt`;
const handoffPacketPath = `${decisionReceiptPath}/handoff-packet`;
const acceptanceRecordPath = `${handoffPacketPath}/acceptance-record`;
const noopExecutionDryRunPath = `${acceptanceRecordPath}/noop-execution-dryrun`;
const apiBase = process.env.API_BASE_URL || "http://localhost:4000";
const tenantId = process.env.SMOKE_TENANT_ID ?? process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
const userId = process.env.USER_ID ?? "00000000-0000-4000-8000-000000000011";
const signingMaterial = process.env.PROVIDER_WEBHOOK_SANDBOX_SIGNING_KEY ?? "local-provider-webhook-sandbox-signing-material";
const runId = `sprint114-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const results = [];
let liveChecks = 0;

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function record(name, passed, detail = "") {
  results.push({ name, passed, detail });
  console.log(`${passed ? "PASS" : "FAIL"} ${name}${detail ? ` - ${detail}` : ""}`);
}

function leaksRawProviderMaterial(value) {
  const serialized = (typeof value === "string" ? value : JSON.stringify(value))
    .replace(/rawProviderMaterialAbsent/g, "");
  return /"rawPayload"\s*:|"rawSignature"\s*:|"replyToken"\s*:|"senderId"\s*:|"roomId"\s*:|"rawRoomId"\s*:|"rawSenderId"\s*:|"token"\s*:|"secret"\s*:|"authorization"\s*:|"cookie"\s*:|"headers"\s*:|"stack"\s*:|providerRaw|providerMaterial|payloadJson|raw-room|raw-sender|reply-token-must-not-return|message-id-must-not-return|accessToken|webhookSecret|bearer/i.test(serialized);
}

function safeCustodyAuditReceiptShape(value) {
  return value &&
    value.receiptKind === "qa-handoff-locked-archive-certified-release-final-archive-seal-post-closure-preservation-custody-audit-receipt" &&
    value.postClosurePreservationCustodyAuditStatus === "audited" &&
    value.postClosurePreservationContinuityLedgerStatus === "continuous" &&
    value.postClosurePreservationVerificationStatus === "verified" &&
    value.finalArchiveSealPostClosurePreservationStatus === "preserved" &&
    value.finalOperationalClosureReceiptStatus === "issued" &&
    value.finalArchiveSealStatus === "sealed" &&
    value.releaseClosureStatus === "closed" &&
    value.tenantScopeStatus === "tenant_scoped" &&
    value.digestContinuityStatus === "confirmed" &&
    value.providerOutboundStatus === "absent" &&
    value.externalNotificationStatus === "absent" &&
    value.aiCallStatus === "absent" &&
    value.safeFilename === "provider-webhook-certified-release-post-closure-preservation-custody-audit-receipt.json" &&
    /^sha256:[a-z0-9]+$/i.test(String(value.safeDigest ?? "")) &&
    value.postClosurePreservationCustodyAuditDigest === value.safeDigest &&
    /^sha256:[a-z0-9]+$/i.test(String(value.postClosurePreservationContinuityLedgerDigest ?? "")) &&
    value.inheritedPostClosurePreservationContinuityLedgerReceiptSummary?.postClosurePreservationContinuityLedgerStatus === "continuous" &&
    value.inheritedPostClosurePreservationContinuityLedgerReceiptSummary?.postClosurePreservationVerificationStatus === "verified" &&
    value.inheritedPostClosurePreservationContinuityLedgerReceiptSummary?.externalCallsZero === true &&
    value.counts?.postClosurePreservationCustodyAuditMutationCount === 0 &&
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
    Array.isArray(value.custodyAuditRows) &&
    value.custodyAuditRows.map((row) => row.sprintNumber).join(",") === "103,104,105,106,107,108,109,110,111,112,113,114" &&
    value.custodyAuditRows.every((row) =>
      typeof row.artifactLabel === "string" &&
      row.artifactLabel.length > 0 &&
      row.custodyAuditStatus === "under_safe_custody" &&
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

function stableCustodyAuditReceiptSnapshot(value) {
  if (!value || typeof value !== "object") return value;
  const {
    generatedAt: _generatedAt,
    checkedAt: _checkedAt,
    custodyAuditRows,
    ...stable
  } = value;
  return {
    ...stable,
    custodyAuditRows: Array.isArray(custodyAuditRows)
      ? custodyAuditRows.map(({ generatedAt, checkedAt, ...row }) => row)
      : custodyAuditRows
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
  return { response, body };
}

async function request(method, requestPath, body, tenant = tenantId) {
  return fetch(`${apiBase}${requestPath}`, {
    method,
    headers: {
      "content-type": "application/json",
      "x-tenant-id": tenant,
      "x-user-id": userId
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
}

async function requestJson(method, requestPath, body, tenant = tenantId) {
  const response = await request(method, requestPath, body, tenant);
  let parsed = null;
  try {
    parsed = await response.json();
  } catch {
    parsed = null;
  }
  return { response, body: parsed };
}

async function prepareLiveArchiveChain(filters) {
  const payload = linePayload(`safe-no-match-room-sprint114-${runId}`, `safe-sender-sprint114-${runId}`, "Safe Sprint 114 custody audit receipt target");
  const created = await requestJson("POST", "/provider-webhooks/sandbox-events", {
    provider: "line",
    channel: "line",
    eventType: "message.created",
    mode: "sandbox",
    inboundPersistenceMode: "sandbox-persist",
    eventId: `${runId}-custody-audit`,
    signature: signPayload(payload),
    payload
  });
  record("live setup safe sandbox no-match item", created.response.status < 500 && (created.body?.externalCalls ?? 0) === 0, `${created.response.status}`);

  await requestJson("POST", `/provider-webhooks/review-qa-handoff-bundle/receipt/sign-off?${filters}`, {
    acknowledgementType: "sign_off",
    reviewerRole: "QA reviewer",
    reviewerLabel: "safe sprint114 reviewer"
  });
  await requestJson("POST", `/provider-webhooks/review-qa-handoff-bundle/acceptance-lock?${filters}`, {
    lockReason: "Safe Sprint 114 certified release custody audit receipt accepted",
    acceptedByRole: "QA lead",
    acceptedByLabel: "safe sprint114 reviewer"
  });
  await requestJson("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/export?${filters}`);
  await requestJson("POST", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/sign-off?${filters}`, {
    reviewerRole: "retention reviewer",
    reviewerLabel: "safe sprint114 reviewer"
  });
  await requestJson("GET", `/provider-webhooks/review-qa-handoff-bundle/locked-archive/finalization/receipt?${filters}`);

  const handoffPacket = await requestJson("GET", `${handoffPacketPath}?${filters}`);
  const acknowledgedChecklistKeys = Array.isArray(handoffPacket.body?.operatorChecklist)
    ? handoffPacket.body.operatorChecklist.map((item) => item.key)
    : [];
  await requestJson("POST", `${acceptanceRecordPath}?${filters}`, {
    acknowledgementType: "operator_checklist_acknowledgement",
    acknowledgedByRole: "release owner",
    acknowledgedByLabel: "safe sprint114 release owner",
    acknowledgedChecklistKeys
  });
  await requestJson("POST", `${noopExecutionDryRunPath}?${filters}`, {
    requestedBy: "safe sprint114 release owner",
    checklistAcknowledged: true,
    operatorNote: "Safe no-op execution dry-run from Sprint 114 smoke",
    dryRunReason: "safe no-op execution readiness rehearsal",
    executionMode: "no_op"
  });
}

function linePayload(roomId, userIdValue, text) {
  return {
    destination: "safe-sprint114-destination",
    events: [{
      type: "message",
      mode: "active",
      timestamp: Date.now(),
      source: { type: "room", roomId, userId: userIdValue },
      webhookEventId: `${runId}-${crypto.randomUUID()}`,
      deliveryContext: { isRedelivery: false },
      replyToken: `safe-reply-token-${runId}`,
      message: { id: `${runId}-message`, type: "text", text }
    }]
  };
}

function signPayload(payload) {
  return `sha256=${crypto.createHmac("sha256", signingMaterial).update(canonicalJson(payload)).digest("hex")}`;
}

function canonicalJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((item) => canonicalJson(item)).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
}

function sourceSlice(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);
  if (start < 0) return "";
  return source.slice(start, end > start ? end : undefined);
}

async function main() {
  const packageJson = read("package.json");
  const shared = read("packages/shared/src/index.ts");
  const providerController = read("apps/api/src/controllers/provider-webhooks.controller.ts");
  const providerService = read("apps/api/src/services/provider-webhook-events.service.ts");
  const apiClient = read("apps/web/app/api-client.ts");
  const settingsData = read("apps/web/app/settings-data.ts");
  const settingsPage = read("apps/web/app/settings/channels/page.tsx");
  const providerPanel = read("apps/web/app/settings/provider-readiness-panel.tsx");
  const controllerTest = read("apps/api/src/controllers/provider-webhooks.controller.test.ts");
  const settingsDataTest = read("apps/web/app/settings-data.test.ts");
  const providerPanelTest = read("apps/web/app/settings/provider-readiness-panel.test.ts");
  const sharedTest = read("packages/shared/src/index.test.ts");

  const serviceMethod = sourceSlice(
    providerService,
    "getReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceipt(",
    "private getLockedArchiveContext("
  );
  const serviceResponse = sourceSlice(
    providerService,
    "function qaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceiptResponse(",
    "function qaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyChainSealReceiptResponse("
  );
  const settingsDataLoader = sourceSlice(
    settingsData,
    "export async function loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceiptData(",
    "export async function loadSettingsProviderWebhookReviewClosureReportRedactionAuditData("
  );
  const pageHandler = sourceSlice(
    settingsPage,
    "async function loadReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceipt()",
    "async function loadClosureReportRedactionAudit()"
  );

  record("package script registration", packageJson.includes('"smoke:sprint114"') && packageJson.includes("smoke-sprint114-provider-webhook-certified-release-final-archive-seal-post-closure-preservation-custody-audit-receipt.mjs"));
  record("DTO/schema export", shared.includes("providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceiptSchema") && shared.includes("ProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceipt") && shared.includes("externalCalls: z.literal(0)") && shared.includes("providerOutboundCallCount: z.literal(0)") && shared.includes("externalNotificationSendCount: z.literal(0)") && shared.includes("aiCallCount: z.literal(0)"));
  record("backend route tenant requirement", providerController.includes(`@Get("${endpointPath.slice("/provider-webhooks/".length)}")`) && providerController.includes("getReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceipt(") && providerController.includes("requireTenantId(tenant)"));
  record("service derives from Sprint 113", serviceMethod.includes("getReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationContinuityLedgerReceipt") && !serviceMethod.includes("getReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationVerificationReceipt(") && serviceResponse.includes("postClosurePreservationContinuityLedgerReceipt"));
  record("service fails closed on incomplete Sprint 113 prerequisites", serviceMethod.includes("ConflictException") && serviceMethod.includes("custody audit receipt prerequisites are incomplete") && providerService.includes("function certifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReady(") && providerService.includes("postClosurePreservationContinuityLedgerStatus === \"continuous\"") && providerService.includes("row.sprintNumber === 113"));
  record("API client wiring", apiClient.includes("getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceipt") && apiClient.includes(endpointPath) && apiClient.includes("providerWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceiptSchema"));
  record("settings-data API mode has no mock fallback", settingsDataLoader.includes('if (mode === "api")') && settingsDataLoader.indexOf("getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceipt") < settingsDataLoader.indexOf("createMockReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceipt"));
  record("mock/local safe fixture remains safe", settingsData.includes("createMockReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceipt") && settingsData.includes("mockqahandoffcertifiedreleasefinalarchivesealpostclosurepreservationcustodyauditreceipt") && settingsData.includes("provider-webhook-certified-release-post-closure-preservation-custody-audit-receipt.json") && !leaksRawProviderMaterial(sourceSlice(settingsData, "function createMockReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceipt(", "function mockCertifiedReleaseFinalArchiveSealPostClosurePreservationReady(")));
  record("Settings > Channels Sprint 114 control/result/error text", providerPanel.includes("Load post-closure preservation custody audit receipt") && providerPanel.includes("QA archive certified release post-closure preservation custody audit receipt") && settingsPage.includes("Post-Closure Preservation Custody Audit Receipt API error"));
  record("stale Sprint 114 receipt clears on upstream/API failure", settingsPage.includes("clearReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceipt()") && pageHandler.includes("setReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceipt(null)") && pageHandler.includes("catch (reason)"));
  record("no provider outbound markers", !/line\.push|telegram\.send|facebook\.send|instagram\.send|providerOutboundCallCount:\s*[1-9]/i.test(serviceResponse));
  record("no external notification send markers", !/externalNotificationSendCount:\s*[1-9]|notification\.sent|sendNotification/i.test(serviceResponse));
  record("no AI/OpenAI call markers", !/openai|ai\.call|aiCallCount:\s*[1-9]/i.test(serviceResponse));
  record("no raw provider material leakage markers", !leaksRawProviderMaterial(serviceResponse) && !leaksRawProviderMaterial(sourceSlice(providerPanel, "reviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceipt ? e", "reviewQaHandoffLockedArchive ? e")));
  record("externalCalls=0 and execution/provider/notification/AI counts are 0", serviceResponse.includes("externalCalls: 0 as const") && serviceResponse.includes("executionAttemptCount: 0 as const") && serviceResponse.includes("providerOutboundCallCount: 0 as const") && serviceResponse.includes("externalNotificationSendCount: 0 as const") && serviceResponse.includes("aiCallCount: 0 as const"));
  record("repeat read has no mutation test coverage", controllerTest.includes("postClosurePreservationCustodyAuditReceiptReadback") && controllerTest.includes("beforePostClosurePreservationCustodyAuditReceiptRead") && controllerTest.includes("afterPostClosurePreservationCustodyAuditReceiptRead"));
  record("digest continuity from Sprint 113", serviceResponse.includes("postClosurePreservationContinuityLedgerDigest: postClosurePreservationContinuityLedgerReceipt.postClosurePreservationContinuityLedgerDigest") && serviceResponse.includes("postClosurePreservationContinuityLedgerDigest: postClosurePreservationContinuityLedgerReceipt.safeDigest"));
  record("focused tests cover shared/API/web/settings/panel behavior", sharedTest.includes("postClosurePreservationCustodyAuditStatus") && controllerTest.includes("postClosurePreservationCustodyAuditReceipt") && apiClient.includes("getProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceipt") && settingsDataTest.includes("loadSettingsProviderWebhookReviewQaHandoffCertifiedReleaseFinalArchiveSealPostClosurePreservationCustodyAuditReceiptData") && providerPanelTest.includes("Load post-closure preservation custody audit receipt"));

  const filters = "provider=line&eventType=message.created";
  const url = `${apiBase}${endpointPath}?${filters}`;
  let firstLive = null;
  let secondLive = null;
  try {
    const preflight = await getJson(url, { "x-tenant-id": tenantId });
    if (preflight.response.status !== 200) {
      await prepareLiveArchiveChain(filters);
    }

    const first = await getJson(url, { "x-tenant-id": tenantId });
    liveChecks += 1;
    firstLive = first.body;
    record("live endpoint returns HTTP 200", first.response.status === 200, `${first.response.status}`);
    record("live endpoint safe Sprint 114 shape", safeCustodyAuditReceiptShape(first.body));

    const second = await getJson(url, { "x-tenant-id": tenantId });
    liveChecks += 1;
    secondLive = second.body;
    record("repeat live read returns HTTP 200", second.response.status === 200, `${second.response.status}`);
    record("repeat live read has no mutation", JSON.stringify(stableCustodyAuditReceiptSnapshot(firstLive)) === JSON.stringify(stableCustodyAuditReceiptSnapshot(secondLive)));

    const invalidTenant = await getJson(url);
    liveChecks += 1;
    record("invalid tenant does not return mock fallback", invalidTenant.response.status >= 400 && !safeCustodyAuditReceiptShape(invalidTenant.body), `${invalidTenant.response.status}`);
  } catch (error) {
    record("live endpoint checks completed", false, error instanceof Error ? error.message : String(error));
  }

  const failed = results.filter((result) => !result.passed);
  console.log(`[sprint114-smoke] assertions=${results.length} liveChecks=${liveChecks} failed=${failed.length}`);
  if (liveChecks < 3) {
    console.error("[sprint114-smoke] live endpoint checks are mandatory and did not complete");
    process.exitCode = 1;
  }
  if (failed.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
