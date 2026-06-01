import crypto from "node:crypto";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { PrismaClient } from "@prisma/client";

const baseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");
const tenantId = process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
const userId = process.env.USER_ID ?? "00000000-0000-4000-8000-000000000011";
const signingMaterial = process.env.PROVIDER_WEBHOOK_SANDBOX_SIGNING_KEY ?? "local-provider-webhook-sandbox-signing-material";
const results = [];

process.env.DATABASE_URL ??= "postgresql://postgres:postgres@127.0.0.1:55434/aiomni?schema=public";

async function main() {
  record("local API only", isLocalBaseUrl(baseUrl));

  const rootPackage = JSON.parse(readFileSync("package.json", "utf8"));
  const providerService = readFileSync("apps/api/src/services/provider-webhook-events.service.ts", "utf8");
  const conversationService = readFileSync("apps/api/src/services/conversation.service.ts", "utf8");
  const providerPanel = readFileSync("apps/web/app/settings/provider-readiness-panel.tsx", "utf8");

  record("smoke script registered", rootPackage.scripts?.["smoke:sprint58"] === "node scripts/smoke-sprint58-provider-webhook-inbound-persistence.mjs");
  record("Sprint 57 regression script registered", rootPackage.scripts?.["smoke:sprint57"] === "node scripts/smoke-sprint57-provider-webhook-normalization-dryrun.mjs");
  record("Sprint 56 regression script registered", rootPackage.scripts?.["smoke:sprint56"] === "node scripts/smoke-sprint56-provider-webhook-signature-replay.mjs");
  record("Sprint 55 regression script registered", rootPackage.scripts?.["smoke:sprint55"] === "node scripts/smoke-sprint55-provider-webhook-events.mjs");
  record("Sprint 54 regression script registered", rootPackage.scripts?.["smoke:sprint54"] === "node scripts/smoke-sprint54-provider-ui-readiness.mjs");
  record("Sprint 53 regression script registered", rootPackage.scripts?.["smoke:sprint53"] === "node scripts/smoke-sprint53-provider-readiness.mjs");
  record("provider service has explicit sandbox persistence mode", providerService.includes("sandbox-persist") && providerService.includes("inboundPersistenceStatus"));
  record("conversation persistence does not enqueue AI", conversationService.includes("persistSandboxWebhookInboundMessage") && !/persistSandboxWebhookInboundMessage[\s\S]*enqueueAi/.test(conversationService));
  record("provider UI renders inbound persistence safely", providerPanel.includes("latest inbound persistence=") && providerPanel.includes("messagePersisted=") && providerPanel.includes("Inbound persistence"));

  const route = await prepareSandboxRoute();

  const health = await request("GET", "/health");
  record("GET /health reachable", health.status === 200);
  const healthBody = await safeJson(health);
  record("health response safe", healthBody?.status === "ok" && healthBody?.service === "api" && noRawSecretFields(healthBody));

  const readiness = await request("GET", "/health/readiness");
  record("GET /health/readiness reachable", readiness.status === 200);
  const readinessBody = await safeJson(readiness);
  const providerReadiness = readinessBody?.providerReadiness;
  record("readiness exposes inbound persistence summary", providerReadiness?.webhookInboundPersistenceEnabled === true && typeof providerReadiness?.persistedInboundMessageCount === "number" && typeof providerReadiness?.inboundPersistenceBlockedCount === "number");
  record("readiness externalCalls=0", noNonzeroExternalCalls(readinessBody));
  record("readiness safe", noRawSecretFields(readinessBody) && noRawPayloadValues(readinessBody));

  const beforeEvents = await request("GET", "/provider-webhooks/events");
  record("GET /provider-webhooks/events reachable", beforeEvents.status === 200);
  const beforeEventsBody = await safeJson(beforeEvents);
  record("initial event log safe", Array.isArray(beforeEventsBody) && noRawSecretFields(beforeEventsBody) && noRawPayloadValues(beforeEventsBody));

  const dryRunPayload = linePayload(route.roomKey, "raw-sender-sprint58-dry", "Safe Sprint 58 dry run inbound");
  const dryRun = await request("POST", "/provider-webhooks/sandbox-events", {
    provider: "line",
    channel: "line",
    eventType: "message.created",
    mode: "sandbox",
    eventId: `sprint58-dry-${Date.now()}`,
    timestamp: "2026-06-01T04:00:00.000Z",
    signature: signPayload(dryRunPayload),
    payload: dryRunPayload
  });
  record("POST default dry-run reachable", dryRun.status === 201 || dryRun.status === 200);
  const dryRunBody = await safeJson(dryRun);
  record("default remains dry-run", dryRunBody?.inboundPersistenceMode === "dry-run" && dryRunBody?.inboundPersistenceStatus === "dry-run-only" && dryRunBody?.messagePersisted === false);
  record("default dry-run safe", safeEventShape(dryRunBody) && noRawSecretFields(dryRunBody) && noRawPayloadValues(dryRunBody));

  const persistEventId = `sprint58-persist-${Date.now()}`;
  const persistedText = `Safe Sprint 58 persisted inbound ${Date.now()}`;
  const persistPayload = linePayload(route.roomKey, "raw-sender-sprint58-persist", persistedText);
  const persistRequest = {
    provider: "line",
    channel: "line",
    eventType: "message.created",
    mode: "sandbox",
    inboundPersistenceMode: "sandbox-persist",
    eventId: persistEventId,
    timestamp: "2026-06-01T04:05:00.000Z",
    signature: signPayload(persistPayload),
    payload: persistPayload
  };
  const persist = await request("POST", "/provider-webhooks/sandbox-events", persistRequest);
  record("POST valid sandbox-persist reachable", persist.status === 201 || persist.status === 200);
  const persistBody = await safeJson(persist);
  record("sandbox-persist signature verified", persistBody?.signatureVerified === true && persistBody?.signatureStatus === "verified");
  record("sandbox-persist replay fresh", persistBody?.replayDetected === false && persistBody?.replayStatus === "fresh");
  record("sandbox-persist normalized", persistBody?.normalized === true && persistBody?.normalizationStatus === "normalized");
  record("sandbox-persist route matched", persistBody?.conversationLookupStatus === "matched" && persistBody?.routingStatus === "matched");
  record("sandbox-persist message persisted", persistBody?.inboundPersistenceStatus === "persisted" && persistBody?.messagePersisted === true && typeof persistBody?.persistedMessageId === "string");
  record("sandbox-persist safe DTO", safeEventShape(persistBody) && noRawSecretFields(persistBody) && noRawPayloadValues(persistBody));

  const messages = await request("GET", `/conversations/${encodeURIComponent(route.conversationId)}/messages`);
  record("refetch conversation messages reachable", messages.status === 200);
  const messagesBody = await safeJson(messages);
  const persistedMessages = Array.isArray(messagesBody) ? messagesBody.filter((message) => message.text === persistedText) : [];
  record("safe inbound message persisted in conversation", persistedMessages.length === 1 && persistedMessages[0]?.direction === "inbound" && persistedMessages[0]?.id === persistBody?.persistedMessageId);
  record("messages API safe", noRawSecretFields(messagesBody) && noRawPayloadValues(messagesBody));

  const invalidPayload = linePayload(route.roomKey, "raw-sender-sprint58-invalid", "Safe invalid signature inbound");
  const invalid = await request("POST", "/provider-webhooks/sandbox-events", {
    provider: "line",
    channel: "line",
    eventType: "message.created",
    mode: "sandbox",
    inboundPersistenceMode: "sandbox-persist",
    eventId: `sprint58-invalid-${Date.now()}`,
    signature: "sha256=invalid-sprint58-proof",
    payload: invalidPayload
  });
  record("POST invalid signature sandbox-persist reachable", invalid.status === 201 || invalid.status === 200);
  const invalidBody = await safeJson(invalid);
  record("invalid signature persistence blocked", invalidBody?.signatureStatus === "failed" && invalidBody?.inboundPersistenceStatus === "blocked-signature" && invalidBody?.messagePersisted === false);
  record("invalid signature safe", safeEventShape(invalidBody) && noRawSecretFields(invalidBody) && noRawPayloadValues(invalidBody));

  const duplicate = await request("POST", "/provider-webhooks/sandbox-events", persistRequest);
  record("POST duplicate sandbox-persist reachable", duplicate.status === 201 || duplicate.status === 200);
  const duplicateBody = await safeJson(duplicate);
  record("duplicate replay blocked", duplicateBody?.replayDetected === true && ["duplicate", "replay-blocked"].includes(duplicateBody?.replayStatus) && duplicateBody?.inboundPersistenceStatus === "blocked-replay");
  record("duplicate did not persist second message", duplicateBody?.messagePersisted === false);
  const messagesAfterDuplicate = await safeJson(await request("GET", `/conversations/${encodeURIComponent(route.conversationId)}/messages`));
  const duplicateCount = Array.isArray(messagesAfterDuplicate) ? messagesAfterDuplicate.filter((message) => message.text === persistedText).length : 0;
  record("duplicate did not create second message", duplicateCount === 1);

  const afterEvents = await request("GET", "/provider-webhooks/events");
  record("GET /provider-webhooks/events after creates reachable", afterEvents.status === 200);
  const afterEventsBody = await safeJson(afterEvents);
  record("event log includes Sprint 58 safe fields", Array.isArray(afterEventsBody) && afterEventsBody.some((event) => event.id === persistBody?.id && safeEventShape(event) && event.inboundPersistenceStatus === "persisted"));
  record("event log raw payload not returned", noRawSecretFields(afterEventsBody) && noRawPayloadValues(afterEventsBody));
  record("event log externalCalls=0", noNonzeroExternalCalls(afterEventsBody));
  record("no provider outbound", !containsProviderOutbound({ healthBody, readinessBody, dryRunBody, persistBody, invalidBody, duplicateBody, afterEventsBody }));
  record("no live provider network call evidence", noLiveProviderNetworkEvidence({ healthBody, readinessBody, dryRunBody, persistBody, invalidBody, duplicateBody, afterEventsBody }));

  finish();
}

async function prepareSandboxRoute() {
  const prisma = new PrismaClient();
  const roomKey = `sprint58-route-room-${Date.now()}`;
  const channelAccountId = "sandbox:line";
  try {
    await prisma.tenant.upsert({
      where: { id: tenantId },
      update: { name: "Sprint 58 Smoke Tenant" },
      create: { id: tenantId, name: "Sprint 58 Smoke Tenant" }
    });
    await prisma.channelAccount.upsert({
      where: { id: channelAccountId },
      update: { tenantId, platform: "line", displayName: "Sprint 58 Sandbox LINE", status: "active" },
      create: { id: channelAccountId, tenantId, platform: "line", displayName: "Sprint 58 Sandbox LINE", status: "active" }
    });
    const room = await prisma.room.upsert({
      where: { tenantId_platform_channelAccountId: { tenantId, platform: "line", channelAccountId } },
      update: { name: "Sprint 58 Sandbox LINE" },
      create: { tenantId, platform: "line", channelAccountId, name: "Sprint 58 Sandbox LINE", aiMode: "human_first" }
    });
    const contact = await prisma.contact.create({
      data: { tenantId, displayName: "Sprint 58 Sandbox Contact" }
    });
    const identity = await prisma.contactIdentity.create({
      data: {
        tenantId,
        contactId: contact.id,
        platform: "line",
        channelAccountId,
        externalUserId: `sprint58-identity-${Date.now()}`,
        displayName: "Sprint 58 Sandbox Contact"
      }
    });
    const conversation = await prisma.conversation.create({
      data: {
        tenantId,
        roomId: room.id,
        contactId: contact.id,
        contactIdentityId: identity.id,
        externalConversationId: roomKey,
        status: "open",
        aiState: "need_human"
      }
    });
    record("safe existing tenant-scoped route prepared", Boolean(conversation.id && room.id && identity.id));
    return { roomKey, conversationId: conversation.id, channelAccountId };
  } finally {
    await prisma.$disconnect();
  }
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

function linePayload(roomId, userId, text) {
  return {
    events: [{
      type: "message",
      timestamp: 1760000000000,
      replyToken: "raw-reply-token-sprint58",
      source: { type: "room", userId, roomId },
      message: { id: "raw-message-sprint58", type: "text", text }
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
    "inboundAuditStatus",
    "externalCalls"
  ]);
  return Object.keys(value).every((key) => allowed.has(key))
    && value.direction === "inbound"
    && value.externalCalls === 0
    && ["dry-run", "sandbox-persist"].includes(value.inboundPersistenceMode)
    && ["dry-run-only", "persisted", "skipped", "skipped-no-match", "blocked-signature", "blocked-replay", "unsupported", "failed"].includes(value.inboundPersistenceStatus);
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
  return !/raw-sender-sprint58|raw-room-sprint58|raw-message-sprint58|raw-reply-token-sprint58|invalid-sprint58-proof/i.test(JSON.stringify(value ?? {}));
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
    throw new Error(`Sprint 58 smoke failed: ${failed.map((item) => item.name).join(", ")}`);
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
