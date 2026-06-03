import crypto from "node:crypto";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const baseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");
const tenantId = process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
const userId = process.env.USER_ID ?? "00000000-0000-4000-8000-000000000011";
const signingMaterial = process.env.PROVIDER_WEBHOOK_SANDBOX_SIGNING_KEY ?? "local-provider-webhook-sandbox-signing-material";
const runId = `sprint59-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const payloadRunKey = `safeRun_${runId.replace(/[^a-z0-9]/gi, "_")}`;
const results = [];

async function main() {
  record("local API only", isLocalBaseUrl(baseUrl));

  const rootPackage = JSON.parse(readFileSync("package.json", "utf8"));
  const providerService = readFileSync("apps/api/src/services/provider-webhook-events.service.ts", "utf8");
  const apiClient = readFileSync("apps/web/app/api-client.ts", "utf8");
  const providerPanel = readFileSync("apps/web/app/settings/provider-readiness-panel.tsx", "utf8");

  record("smoke script registered", rootPackage.scripts?.["smoke:sprint59"] === "node scripts/smoke-sprint59-provider-webhook-unmatched-inbound-review.mjs");
  record("Sprint 58 regression script registered", rootPackage.scripts?.["smoke:sprint58"] === "node scripts/smoke-sprint58-provider-webhook-inbound-persistence.mjs");
  record("Sprint 57 regression script registered", rootPackage.scripts?.["smoke:sprint57"] === "node scripts/smoke-sprint57-provider-webhook-normalization-dryrun.mjs");
  record("Sprint 56 regression script registered", rootPackage.scripts?.["smoke:sprint56"] === "node scripts/smoke-sprint56-provider-webhook-signature-replay.mjs");
  record("Sprint 55 regression script registered", rootPackage.scripts?.["smoke:sprint55"] === "node scripts/smoke-sprint55-provider-webhook-events.mjs");
  record("Sprint 54 regression script registered", rootPackage.scripts?.["smoke:sprint54"] === "node scripts/smoke-sprint54-provider-ui-readiness.mjs");
  record("Sprint 53 regression script registered", rootPackage.scripts?.["smoke:sprint53"] === "node scripts/smoke-sprint53-provider-readiness.mjs");
  record("service implements unmatched review store", providerService.includes("listUnmatchedInbound") && providerService.includes("unmatchedInboundQueued") && providerService.includes("safe-review-required-no-conversation-match"));
  record("API client uses unmatched endpoint with tenant header", apiClient.includes("getProviderWebhookUnmatchedInbound") && apiClient.includes("\"x-tenant-id\": getApiTenantId()"));
  record("provider UI renders unmatched summary", providerPanel.includes("unmatched inbound review=") && providerPanel.includes("Unmatched inbound review"));

  const health = await request("GET", "/health");
  record("GET /health reachable", health.status === 200);
  const healthBody = await safeJson(health);
  record("health response safe", healthBody?.status === "ok" && healthBody?.service === "api" && noRawSecretFields(healthBody));

  const readiness = await request("GET", "/health/readiness");
  record("GET /health/readiness reachable", readiness.status === 200);
  const readinessBody = await safeJson(readiness);
  record("readiness exposes unmatched inbound summary", safeReadinessUnmatchedSummary(readinessBody?.providerReadiness));
  record("readiness externalCalls=0", noNonzeroExternalCalls(readinessBody));
  record("readiness safe", noRawSecretFields(readinessBody) && noRawPayloadValues(readinessBody));

  const beforeEvents = await request("GET", "/provider-webhooks/events");
  record("GET /provider-webhooks/events reachable", beforeEvents.status === 200);
  const beforeEventsBody = await safeJson(beforeEvents);
  record("initial event log safe", Array.isArray(beforeEventsBody) && noRawSecretFields(beforeEventsBody) && noRawPayloadValues(beforeEventsBody));

  const beforeUnmatched = await request("GET", "/provider-webhooks/unmatched-inbound");
  record("GET /provider-webhooks/unmatched-inbound reachable", beforeUnmatched.status === 200);
  const beforeUnmatchedBody = await safeJson(beforeUnmatched);
  record("initial unmatched list safe", Array.isArray(beforeUnmatchedBody) && beforeUnmatchedBody.every(safeUnmatchedItemShape) && noRawSecretFields(beforeUnmatchedBody) && noRawPayloadValues(beforeUnmatchedBody));

  const eventId = `sprint59-unmatched-${runId}`;
  const payload = linePayload(
    `raw-no-match-room-${runId}`,
    `raw-sender-${runId}`,
    `Safe Sprint 59 unmatched inbound ${runId}`,
    `raw-message-${runId}`,
    `raw-reply-token-${runId}`
  );
  const validRequest = {
    provider: "line",
    channel: "line",
    eventType: "message.created",
    mode: "sandbox",
    inboundPersistenceMode: "sandbox-persist",
    eventId,
    deliveryId: `sprint59-delivery-${runId}`,
    timestamp: "2026-06-01T05:00:00.000Z",
    signature: signPayload(payload),
    payload
  };

  const valid = await request("POST", "/provider-webhooks/sandbox-events", validRequest);
  record("POST valid signed sandbox no-match event reachable", valid.status === 201 || valid.status === 200);
  const validBody = await safeJson(valid);
  record("valid event signature verified", validBody?.signatureVerified === true && validBody?.signatureStatus === "verified");
  record("valid event replay fresh", validBody?.replayDetected === false && validBody?.replayStatus === "fresh");
  record("valid event normalized", validBody?.normalized === true && validBody?.normalizationStatus === "normalized");
  record("valid event lookup not-found", validBody?.conversationLookupStatus === "not-found");
  record("valid event skipped no match", validBody?.inboundPersistenceStatus === "skipped-no-match" && validBody?.messagePersisted === false);
  record("valid event returned unmatched id", typeof validBody?.unmatchedInboundId === "string");
  record("valid event externalCalls=0", validBody?.externalCalls === 0);
  record("valid event safe DTO", safeEventShape(validBody) && noRawSecretFields(validBody) && noRawPayloadValues(validBody));

  const unmatchedAfterValid = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound"));
  const createdUnmatched = Array.isArray(unmatchedAfterValid) ? unmatchedAfterValid.find((item) => item.id === validBody?.unmatchedInboundId) : null;
  record("valid event queued unmatched review", Boolean(createdUnmatched) && createdUnmatched.unmatchedStatus === "review-needed" && validBody?.externalCalls === 0);
  record("unmatched list includes queued item", Boolean(createdUnmatched) && safeUnmatchedItemShape(createdUnmatched) && createdUnmatched.unmatchedStatus === "review-needed" && createdUnmatched.externalCalls === 0);
  record("unmatched list count increased once", Array.isArray(unmatchedAfterValid) && unmatchedAfterValid.filter((item) => item.id === validBody?.unmatchedInboundId).length === 1);
  record("unmatched list safe", noRawSecretFields(unmatchedAfterValid) && noRawPayloadValues(unmatchedAfterValid));

  const duplicate = await request("POST", "/provider-webhooks/sandbox-events", validRequest);
  record("POST duplicate unmatched event reachable", duplicate.status === 201 || duplicate.status === 200);
  const duplicateBody = await safeJson(duplicate);
  record("duplicate replay blocked", duplicateBody?.replayDetected === true && ["duplicate", "replay-blocked"].includes(duplicateBody?.replayStatus) && duplicateBody?.inboundPersistenceStatus === "blocked-replay");
  record("duplicate did not queue unmatched item", duplicateBody?.replayDetected === true && duplicateBody?.unmatchedInboundQueued !== true && duplicateBody?.unmatchedStatus === "duplicate-skipped");
  const unmatchedAfterDuplicate = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound"));
  record("duplicate did not create second unmatched item", Array.isArray(unmatchedAfterDuplicate) && unmatchedAfterDuplicate.filter((item) => item.id === validBody?.unmatchedInboundId).length === 1);

  const invalidPayload = linePayload(
    `raw-invalid-room-${runId}`,
    `raw-invalid-sender-${runId}`,
    `Safe invalid Sprint 59 inbound ${runId}`,
    `raw-invalid-message-${runId}`,
    `raw-invalid-reply-token-${runId}`
  );
  const invalid = await request("POST", "/provider-webhooks/sandbox-events", {
    provider: "line",
    channel: "line",
    eventType: "message.created",
    mode: "sandbox",
    inboundPersistenceMode: "sandbox-persist",
    eventId: `sprint59-invalid-${runId}`,
    deliveryId: `sprint59-invalid-delivery-${runId}`,
    signature: "sha256=invalid-sprint59-proof",
    payload: invalidPayload
  });
  record("POST invalid signature no-match event reachable", invalid.status === 201 || invalid.status === 200);
  const invalidBody = await safeJson(invalid);
  record("invalid signature blocked and not queued", invalidBody?.signatureStatus === "failed" && invalidBody?.inboundPersistenceStatus === "blocked-signature" && invalidBody?.unmatchedInboundQueued === false);
  record("invalid signature safe", safeEventShape(invalidBody) && noRawSecretFields(invalidBody) && noRawPayloadValues(invalidBody));

  const afterReadiness = await safeJson(await request("GET", "/health/readiness"));
  record("readiness reports unmatched counts/status", safeReadinessUnmatchedSummary(afterReadiness?.providerReadiness));
  record("readiness after creates externalCalls=0", noNonzeroExternalCalls(afterReadiness));

  const afterEvents = await safeJson(await request("GET", "/provider-webhooks/events"));
  const validFound = Array.isArray(afterEvents) ? afterEvents.find((event) => event.id === validBody?.id) : null;
  record("event log includes safe unmatched fields", Boolean(validFound) && safeEventShape(validFound) && validFound.unmatchedInboundId === validBody?.unmatchedInboundId && safeUnmatchedReason(validFound.unmatchedReason) && validFound.unmatchedStatus === "review-needed");
  record("event log raw payload not returned", noRawSecretFields(afterEvents) && noRawPayloadValues(afterEvents));
  record("event log externalCalls=0", noNonzeroExternalCalls(afterEvents));
  record("no provider outbound", !containsProviderOutbound({ healthBody, readinessBody, validBody, duplicateBody, invalidBody, afterReadiness, afterEvents, unmatchedAfterDuplicate }));
  record("no live provider network call evidence", noLiveProviderNetworkEvidence({ healthBody, readinessBody, validBody, duplicateBody, invalidBody, afterReadiness, afterEvents, unmatchedAfterDuplicate }));

  finish();
}

async function request(method, path, body, extraHeaders = {}) {
  return fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      "x-tenant-id": tenantId,
      "x-user-id": userId,
      ...extraHeaders
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
}

async function safeJson(response) {
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

function linePayload(roomId, userId, text, messageId, replyToken) {
  return {
    [payloadRunKey]: "safe-sprint59-run",
    events: [{
      type: "message",
      timestamp: 1760000000000,
      replyToken,
      source: { type: "room", userId, roomId },
      message: { id: messageId, type: "text", text }
    }]
  };
}

function signPayload(payload) {
  return `sha256=${crypto.createHmac("sha256", signingMaterial).update(canonicalJson(payload)).digest("hex")}`;
}

function canonicalJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((item) => canonicalJson(item)).join(",")}]`;
  return `{${Object.entries(value).sort(([left], [right]) => left.localeCompare(right)).map(([key, child]) => `${JSON.stringify(key)}:${canonicalJson(child)}`).join(",")}}`;
}

function safeEventShape(value) {
  if (!value || typeof value !== "object") return false;
  const allowed = new Set([
    "id",
    "tenantId",
    "provider",
    "channel",
    "eventType",
    "mode",
    "status",
    "receivedAt",
    "payloadSummary",
    "payloadFieldCount",
    "payloadDigest",
    "signatureVerified",
    "signatureStatus",
    "signatureAlgorithm",
    "signatureFingerprint",
    "signedAt",
    "replayDetected",
    "replayStatus",
    "dedupKeyDigest",
    "previousEventSeenAt",
    "normalized",
    "normalizationStatus",
    "normalizedEventType",
    "direction",
    "messageType",
    "textPreview",
    "textLength",
    "mediaSummary",
    "senderKeyDigest",
    "roomKeyDigest",
    "dryRunRouting",
    "routingStatus",
    "conversationLookupStatus",
    "conversationKeyDigest",
    "channelAccountId",
    "roomIdDigest",
    "inboundPersistenceMode",
    "inboundPersistenceStatus",
    "messagePersisted",
    "persistedMessageId",
    "conversationId",
    "unmatchedInboundQueued",
    "unmatchedInboundId",
    "unmatchedStatus",
    "unmatchedReason",
    "inboundAuditStatus",
    "unmatchedReviewActionStatus",
    "unmatchedLinkStatus",
    "linkedConversationId",
    "linkedMessageId",
    "unmatchedResolvedAt",
    "reviewStatus",
    "reviewedAt",
    "reviewedBy",
    "reviewReason",
    "linkStatus",
    "externalCalls"
  ]);
  return Object.keys(value).every((key) => allowed.has(key))
    && value.direction === "inbound"
    && value.externalCalls === 0
    && ["dry-run", "sandbox-persist"].includes(value.inboundPersistenceMode)
    && ["dry-run-only", "persisted", "skipped", "skipped-no-match", "blocked-signature", "blocked-replay", "unsupported", "failed"].includes(value.inboundPersistenceStatus);
}

function safeUnmatchedItemShape(value) {
  if (!value || typeof value !== "object") return false;
  const allowed = new Set([
    "id",
    "tenantId",
    "provider",
    "channelAccountId",
    "mode",
    "eventType",
    "normalizedEventType",
    "messageType",
    "normalizationStatus",
    "routingStatus",
    "conversationLookupStatus",
    "unmatchedStatus",
    "unmatchedReason",
    "payloadDigest",
    "providerEventDigest",
    "deliveryDigest",
    "senderKeyDigest",
    "roomKeyDigest",
    "textPreview",
    "textLength",
    "receivedAt",
    "unmatchedReviewActionStatus",
    "unmatchedLinkStatus",
    "linkedConversationId",
    "linkedMessageId",
    "unmatchedResolvedAt",
    "reviewStatus",
    "reviewedAt",
    "reviewedBy",
    "reviewReason",
    "linkStatus",
    "messagePersisted",
    "assignmentStatus",
    "assignedToOperatorLabel",
    "assignedAt",
    "assignedByOperatorLabel",
    "escalationStatus",
    "escalationReason",
    "escalatedAt",
    "escalatedByOperatorLabel",
    "lastOperatorNoteAt",
    "historyAvailable",
    "diagnosticsAvailable",
    "candidatesAvailable",
    "resolutionStatus",
    "resolutionOutcome",
    "resolvedAt",
    "resolvedByOperatorLabel",
    "closureReadiness",
    "closureChecklist",
    "checklistCompletedCount",
    "checklistTotalCount",
    "checklistIncompleteSteps",
    "recommendedNextActions",
    "externalCalls"
  ]);
  return Object.keys(value).every((key) => allowed.has(key))
    && value.mode === "sandbox"
    && value.conversationLookupStatus === "not-found"
    && value.externalCalls === 0;
}

function safeReadinessUnmatchedSummary(readiness) {
  return readiness?.webhookUnmatchedInboundReviewEnabled === true
    && isNonNegativeNumber(readiness.unmatchedInboundOpenCount)
    && isNonNegativeNumber(readiness.unmatchedInboundQueuedCount)
    && isNonNegativeNumber(readiness.unmatchedInboundReplayBlockedCount)
    && isSafeUnmatchedStatus(readiness.latestUnmatchedInboundStatus)
    && readiness.externalCalls === 0;
}

function isNonNegativeNumber(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isSafeUnmatchedStatus(value) {
  return value === null || ["open", "review-needed", "reviewed", "blocked", "skipped", "linked", "duplicate-skipped"].includes(value);
}

function safeUnmatchedReason(value) {
  return typeof value === "string"
    && value.length > 0
    && noRawSecretFields({ unmatchedReason: value })
    && noRawPayloadValues({ unmatchedReason: value });
}

function isLocalBaseUrl(value) {
  try {
    const parsed = new URL(value);
    return ["localhost", "127.0.0.1", "::1"].includes(parsed.hostname);
  } catch {
    return false;
  }
}

function containsProviderOutbound(value) {
  const text = JSON.stringify(value ?? {});
  return /outbound\.queued|outbound\.sent|queued_provider|sent_provider|line\.push|telegram\.send|facebook\.send|instagram\.send/i.test(text);
}

function noLiveProviderNetworkEvidence(value) {
  const text = JSON.stringify(value ?? {});
  return !/api\.line\.me|api\.telegram\.org|graph\.facebook\.com|provider_network_call|live_provider_call/i.test(text);
}

function noNonzeroExternalCalls(value) {
  const stack = [value];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || typeof current !== "object") continue;
    for (const [key, child] of Object.entries(current)) {
      if (key === "externalCalls") {
        if (Array.isArray(child) && child.length === 0) continue;
        if (child !== 0) return false;
      }
      if (child && typeof child === "object") stack.push(child);
    }
  }
  return true;
}

function noRawSecretFields(value) {
  return !findUnsafeSecretPath(value);
}

function findUnsafeSecretPath(value) {
  const forbidden = new Set([
    "token",
    "secret",
    "accessToken",
    "refreshToken",
    "accessTokenCiphertext",
    "webhookSecret",
    "webhookSignature",
    "appSecret",
    "botToken",
    "verifyToken",
    "apiKey",
    "authorization",
    "cookie",
    "signature",
    "payloadJson",
    "providerRaw",
    "rawPayload",
    "replyToken"
  ]);
  const stack = [{ value, path: "$" }];
  while (stack.length > 0) {
    const item = stack.pop();
    const current = item?.value;
    const path = item?.path ?? "$";
    if (!current || typeof current !== "object") continue;
    for (const [key, child] of Object.entries(current)) {
      const childPath = `${path}.${key}`;
      if (forbidden.has(key)) return childPath;
      if (looksRawSecret(child)) return `${childPath}=${String(child).slice(0, 80)}`;
      if (child && typeof child === "object") stack.push({ value: child, path: childPath });
    }
  }
  return null;
}

function noRawPayloadValues(value) {
  return !/invalid-sprint59-proof|raw-sender-sprint59|raw-no-match-room-sprint59|raw-invalid-room-sprint59|raw-invalid-sender-sprint59|raw-message-sprint59|raw-reply-token-sprint59/i.test(JSON.stringify(value ?? {}));
}

function looksRawSecret(value) {
  if (value === null || value === undefined) return false;
  if (value === "CONFIRMED_NO_RAW_LEAKAGE") return false;
  const text = String(value);
  if (/^sha256:[a-f0-9]{8,}$/i.test(text)) return false;
  return /(^|[^a-z])sk-[a-z0-9_-]{8,}|Bearer\s+[a-z0-9._-]+|raw-|mock-line-secret|xox[baprs]-|EA[A-Za-z0-9]{20,}/i.test(text);
}

function finish() {
  const failed = results.filter((result) => !result.ok);
  console.log(JSON.stringify({ baseUrl, tenantId, externalCalls: 0, results }, null, 2));
  if (failed.length > 0) {
    throw new Error(`Sprint 59 smoke failed: ${failed.map((item) => item.name).join(", ")}`);
  }
}

function record(name, ok, detail = "") {
  results.push({ name, ok: Boolean(ok), detail });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
