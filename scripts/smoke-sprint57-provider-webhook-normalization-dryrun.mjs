import crypto from "node:crypto";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const baseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");
const tenantId = process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
const userId = process.env.USER_ID ?? "00000000-0000-4000-8000-000000000011";
const signingMaterial = process.env.PROVIDER_WEBHOOK_SANDBOX_SIGNING_KEY ?? "local-provider-webhook-sandbox-signing-material";
const results = [];

async function main() {
  record("local API only", isLocalBaseUrl(baseUrl));

  const rootPackage = JSON.parse(readFileSync("package.json", "utf8"));
  const apiClient = readFileSync("apps/web/app/api-client.ts", "utf8");
  const settingsData = readFileSync("apps/web/app/settings-data.ts", "utf8");
  const providerPanel = readFileSync("apps/web/app/settings/provider-readiness-panel.tsx", "utf8");
  const providerService = readFileSync("apps/api/src/services/provider-webhook-events.service.ts", "utf8");

  record("smoke script registered", rootPackage.scripts?.["smoke:sprint57"] === "node scripts/smoke-sprint57-provider-webhook-normalization-dryrun.mjs");
  record("Sprint 56 regression script registered", rootPackage.scripts?.["smoke:sprint56"] === "node scripts/smoke-sprint56-provider-webhook-signature-replay.mjs");
  record("Sprint 55 regression script registered", rootPackage.scripts?.["smoke:sprint55"] === "node scripts/smoke-sprint55-provider-webhook-events.mjs");
  record("Sprint 54 regression script registered", rootPackage.scripts?.["smoke:sprint54"] === "node scripts/smoke-sprint54-provider-ui-readiness.mjs");
  record("Sprint 53 regression script registered", rootPackage.scripts?.["smoke:sprint53"] === "node scripts/smoke-sprint53-provider-readiness.mjs");
  record("API client sends tenant header", apiClient.includes("\"x-tenant-id\": getApiTenantId()"));
  record("API mode event log has no mock fallback", settingsData.includes("mode === \"api\"") && settingsData.includes("await getProviderWebhookEvents()"));
  record("provider UI renders normalization and routing summaries", providerPanel.includes("latest normalization=") && providerPanel.includes("routingBlockedCount=") && providerPanel.includes("conversationKeyDigest="));
  record("event service normalizes and routes dry-run only", providerService.includes("normalizeSandboxEvent") && providerService.includes("summarizeDryRunRouting") && providerService.includes("dry-run-only"));
  record("event service does not call provider SDKs", !/api\.line\.me|api\.telegram\.org|graph\.facebook\.com|line\.push|telegram\.send|facebook\.send|instagram\.send/i.test(providerService));

  const health = await request("GET", "/health");
  record("GET /health reachable", health.status === 200);
  const healthBody = await safeJson(health);
  record("health response safe", healthBody?.status === "ok" && healthBody?.service === "api" && noRawSecretFields(healthBody));

  const readiness = await request("GET", "/health/readiness");
  record("GET /health/readiness reachable", readiness.status === 200);
  const readinessBody = await safeJson(readiness);
  const providerReadiness = readinessBody?.providerReadiness;
  record("readiness exposes normalization/routing summary", providerReadiness?.webhookNormalizationEnabled === true && providerReadiness?.webhookDryRunRoutingEnabled === true && typeof providerReadiness?.normalizedEventCount === "number" && typeof providerReadiness?.routingBlockedCount === "number");
  record("readiness externalCalls=0", noNonzeroExternalCalls(readinessBody));
  record("readiness remains safe", safeProviderReadiness(providerReadiness) && noRawSecretFields(readinessBody));

  const before = await request("GET", "/provider-webhooks/events");
  record("GET /provider-webhooks/events reachable", before.status === 200);
  const beforeBody = await safeJson(before);
  record("initial event list is safe", Array.isArray(beforeBody) && noRawSecretFields(beforeBody) && noRawPayloadValues(beforeBody));

  const eventId = `sprint57-event-${Date.now()}`;
  const payload = {
    events: [{
      type: "message",
      timestamp: 1760000000000,
      replyToken: "raw-reply-token-sprint57",
      source: { type: "room", userId: "raw-sender-sprint57", roomId: "raw-room-sprint57" },
      message: { id: "raw-message-sprint57", type: "text", text: "Safe sandbox message for routing" }
    }]
  };
  const validSignature = signPayload(payload);
  const validEvent = {
    provider: "line",
    channel: "line",
    eventType: "message.created",
    mode: "sandbox",
    status: "received",
    eventId,
    timestamp: "2026-06-01T02:00:00.000Z",
    signature: validSignature,
    payload
  };

  const valid = await request("POST", "/provider-webhooks/sandbox-events", validEvent);
  record("POST valid signed sandbox event reachable", valid.status === 201 || valid.status === 200);
  const validBody = await safeJson(valid);
  record("valid event signature verified", validBody?.signatureVerified === true && validBody?.signatureStatus === "verified");
  record("valid event replay fresh", validBody?.replayDetected === false && validBody?.replayStatus === "fresh");
  record("valid event normalized", validBody?.normalized === true && validBody?.normalizationStatus === "normalized");
  record("valid event normalized event/message type present", validBody?.normalizedEventType === "message" && validBody?.messageType === "text");
  record("valid event dry-run routed", validBody?.dryRunRouting === true && validBody?.routingStatus === "dry-run-only" && validBody?.conversationLookupStatus === "not-found");
  record("valid event route digest only", isDigest(validBody?.conversationKeyDigest) && isDigest(validBody?.roomIdDigest) && isDigest(validBody?.senderKeyDigest) && isDigest(validBody?.roomKeyDigest));
  record("valid event externalCalls=0", validBody?.externalCalls === 0);
  record("valid event safe DTO", safeEventShape(validBody) && noRawSecretFields(validBody) && noRawPayloadValues(validBody));
  record("valid event raw signature not returned", !JSON.stringify(validBody ?? {}).includes(validSignature));
  record("valid event raw ids not returned", !/raw-sender-sprint57|raw-room-sprint57|raw-message-sprint57|raw-reply-token-sprint57/.test(JSON.stringify(validBody ?? {})));

  const invalid = await request("POST", "/provider-webhooks/sandbox-events", {
    ...validEvent,
    eventId: `${eventId}-invalid`,
    signature: "sha256=invalid-sprint57-proof",
    payload: {
      events: [{
        type: "message",
        source: { type: "user", userId: "raw-invalid-user" },
        message: { id: "raw-invalid-message", type: "text", text: "Safe invalid signature sample" }
      }]
    }
  });
  record("POST invalid signature sandbox event reachable", invalid.status === 201 || invalid.status === 200);
  const invalidBody = await safeJson(invalid);
  record("invalid signature normalization blocked", invalidBody?.signatureStatus === "failed" && invalidBody?.normalizationStatus === "blocked-signature" && invalidBody?.routingStatus === "blocked-signature");
  record("invalid signature routing skipped lookup", invalidBody?.conversationLookupStatus === "skipped" && invalidBody?.externalCalls === 0);
  record("invalid event safe DTO", safeEventShape(invalidBody) && noRawSecretFields(invalidBody) && noRawPayloadValues(invalidBody));

  const duplicate = await request("POST", "/provider-webhooks/sandbox-events", validEvent);
  record("POST duplicate sandbox event reachable", duplicate.status === 201 || duplicate.status === 200);
  const duplicateBody = await safeJson(duplicate);
  record("duplicate replay detected", duplicateBody?.replayDetected === true && ["duplicate", "replay-blocked"].includes(duplicateBody?.replayStatus));
  record("duplicate dry-run routing blocked", duplicateBody?.normalizationStatus === "blocked-replay" && duplicateBody?.routingStatus === "blocked-replay" && duplicateBody?.conversationLookupStatus === "skipped");
  record("duplicate did not create unsafe routing action", duplicateBody?.conversationKeyDigest === null && duplicateBody?.externalCalls === 0);
  record("duplicate safe DTO", safeEventShape(duplicateBody) && noRawSecretFields(duplicateBody) && noRawPayloadValues(duplicateBody));

  const after = await request("GET", "/provider-webhooks/events");
  record("GET /provider-webhooks/events after creates reachable", after.status === 200);
  const afterBody = await safeJson(after);
  const validFound = Array.isArray(afterBody) ? afterBody.find((event) => event.id === validBody?.id) : null;
  const duplicateFound = Array.isArray(afterBody) ? afterBody.find((event) => event.id === duplicateBody?.id) : null;
  record("event log includes safe normalization/routing fields", Boolean(validFound) && safeEventShape(validFound) && Boolean(duplicateFound) && safeEventShape(duplicateFound));
  record("event log raw payload not returned", noRawSecretFields(afterBody) && noRawPayloadValues(afterBody));
  record("event log raw signature not returned", !JSON.stringify(afterBody ?? {}).includes(validSignature));
  record("event log externalCalls=0", noNonzeroExternalCalls(afterBody));
  record("no provider outbound", !containsProviderOutbound({ healthBody, readinessBody, validBody, invalidBody, duplicateBody, afterBody }));
  record("no live provider network call evidence", noLiveProviderNetworkEvidence({ healthBody, readinessBody, validBody, invalidBody, duplicateBody, afterBody }));

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
    "conversationId",
    "channelAccountId",
    "roomIdDigest",
    "inboundAuditStatus",
    "inboundPersistenceMode",
    "inboundPersistenceStatus",
    "messagePersisted",
    "persistedMessageId",
    "unmatchedInboundQueued",
    "unmatchedInboundId",
    "unmatchedStatus",
    "unmatchedReason",
    "externalCalls"
  ]);
  return Object.keys(value).every((key) => allowed.has(key))
    && value.direction === "inbound"
    && value.externalCalls === 0
    && ["verified", "failed", "missing", "skipped"].includes(value.signatureStatus)
    && ["fresh", "duplicate", "replay-blocked"].includes(value.replayStatus)
    && ["normalized", "skipped", "failed", "blocked-signature", "blocked-replay", "unsupported"].includes(value.normalizationStatus)
    && ["dry-run-only", "matched", "blocked-signature", "blocked-replay", "unsupported", "skipped"].includes(value.routingStatus);
}

function isDigest(value) {
  return typeof value === "string" && /^sha256:[a-f0-9]{8,}$/i.test(value);
}

function isLocalBaseUrl(value) {
  try {
    const parsed = new URL(value);
    return ["localhost", "127.0.0.1", "::1"].includes(parsed.hostname);
  } catch {
    return false;
  }
}

function safeProviderReadiness(readiness) {
  if (!readiness || typeof readiness !== "object") return false;
  if (!readiness.allowlist || typeof readiness.allowlist.entryCount !== "number") return false;
  const serialized = JSON.stringify(readiness);
  const rawProviderValues = /line-test-recipient|telegram-test-chat|messenger-test-recipient|instagram-test-recipient|fb-user-|ig-user-|U-sprint|replyToken|raw-room|raw-sender/i;
  const rawProviderKeys = /"(messaging|events|rawPayload|providerRaw|payloadJson)"\s*:/i;
  return !rawProviderValues.test(serialized) && !rawProviderKeys.test(serialized);
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
  return !/sensitive-sample-|sensitive-provider-body|invalid-sprint57-proof|raw-sender-sprint57|raw-room-sprint57|raw-message-sprint57|raw-reply-token-sprint57|raw-invalid-user|raw-invalid-message/i.test(JSON.stringify(value ?? {}));
}

function looksRawSecret(value) {
  if (value === null || value === undefined) return false;
  const text = String(value);
  if (/^sha256:[a-f0-9]{8,}$/i.test(text)) return false;
  return /(^|[^a-z])sk-[a-z0-9_-]{8,}|Bearer\s+[a-z0-9._-]+|raw-|mock-line-secret|xox[baprs]-|EA[A-Za-z0-9]{20,}/i.test(text);
}

function finish() {
  const failed = results.filter((result) => !result.ok);
  console.log(JSON.stringify({ baseUrl, tenantId, externalCalls: 0, results }, null, 2));
  if (failed.length > 0) {
    throw new Error(`Sprint 57 smoke failed: ${failed.map((item) => item.name).join(", ")}`);
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
