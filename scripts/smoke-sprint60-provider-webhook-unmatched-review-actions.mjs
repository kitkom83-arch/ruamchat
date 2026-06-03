import crypto from "node:crypto";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { PrismaClient } from "@prisma/client";

const baseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");
const tenantId = process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
const userId = process.env.USER_ID ?? "00000000-0000-4000-8000-000000000011";
const signingMaterial = process.env.PROVIDER_WEBHOOK_SANDBOX_SIGNING_KEY ?? "local-provider-webhook-sandbox-signing-material";
const results = [];

async function main() {
  record("local API only", isLocalBaseUrl(baseUrl));

  const rootPackage = JSON.parse(readFileSync("package.json", "utf8"));
  const providerService = readFileSync("apps/api/src/services/provider-webhook-events.service.ts", "utf8");
  const apiClient = readFileSync("apps/web/app/api-client.ts", "utf8");
  const providerPanel = readFileSync("apps/web/app/settings/provider-readiness-panel.tsx", "utf8");

  record("smoke script registered", rootPackage.scripts?.["smoke:sprint60"] === "node scripts/smoke-sprint60-provider-webhook-unmatched-review-actions.mjs");
  for (const sprint of [59, 58, 57, 56, 55, 54, 53]) {
    record(`Sprint ${sprint} regression script registered`, typeof rootPackage.scripts?.[`smoke:sprint${sprint}`] === "string");
  }
  record("service implements review actions", providerService.includes("reviewUnmatchedInbound") && providerService.includes("linkUnmatchedInboundToConversation"));
  record("API client sends tenant-scoped review/link calls", apiClient.includes("reviewProviderWebhookUnmatchedInbound") && apiClient.includes("linkProviderWebhookUnmatchedInboundConversation") && apiClient.includes("\"x-tenant-id\": getApiTenantId()"));
  record("provider UI renders review action summary", providerPanel.includes("review actions=") && providerPanel.includes("Mark reviewed") && providerPanel.includes("Link only"));

  const health = await request("GET", "/health");
  record("GET /health reachable", health.status === 200);
  const healthBody = await safeJson(health);
  record("health response safe", healthBody?.status === "ok" && healthBody?.service === "api" && noRawSecretFields(healthBody));

  const readiness = await request("GET", "/health/readiness");
  record("GET /health/readiness reachable", readiness.status === 200);
  const readinessBody = await safeJson(readiness);
  const beforeReadiness = readinessBody?.providerReadiness;
  record("readiness exposes Sprint 60 summary", safeReadinessSprint60Summary(beforeReadiness));
  record("readiness externalCalls=0", noNonzeroExternalCalls(readinessBody));
  record("readiness safe", noRawSecretFields(readinessBody) && noRawPayloadValues(readinessBody));

  const beforeUnmatched = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound"));
  record("GET /provider-webhooks/unmatched-inbound reachable", Array.isArray(beforeUnmatched));
  record("initial unmatched list safe", Array.isArray(beforeUnmatched) && beforeUnmatched.every(safeUnmatchedItemShape) && noRawSecretFields(beforeUnmatched) && noRawPayloadValues(beforeUnmatched));

  const reviewItem = await createNoMatchItem("review", "Safe Sprint 60 reviewed inbound", "sandbox-persist");
  record("valid event queued unmatched review item", Boolean(reviewItem?.id) && reviewItem.unmatchedStatus === "review-needed");

  const reviewed = await safeJson(await request("PATCH", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(reviewItem.id)}/review`, {
    status: "reviewed",
    reason: "safe sprint 60 review"
  }));
  record("PATCH review status reviewed reachable", reviewed?.unmatchedStatus === "reviewed" && reviewed?.reviewStatus === "reviewed");
  record("review response safe", safeUnmatchedItemShape(reviewed) && noRawSecretFields(reviewed) && noRawPayloadValues(reviewed));

  const reviewedList = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound?status=reviewed"));
  record("review status persisted in unmatched list", Array.isArray(reviewedList) && reviewedList.some((item) => item.id === reviewItem.id && item.unmatchedStatus === "reviewed"));

  const skipItem = await createNoMatchItem("skip", "Safe Sprint 60 skipped inbound", "sandbox-persist");
  const skipped = await safeJson(await request("PATCH", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(skipItem.id)}/review`, { status: "skipped" }));
  record("PATCH review status skipped reachable", skipped?.unmatchedStatus === "skipped" && skipped?.reviewStatus === "skipped");

  const unsafeLinkItem = await createNoMatchItem("unsafe-link", "Safe Sprint 60 rejected link inbound", "sandbox-persist");
  const unsafeLink = await request("POST", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(unsafeLinkItem.id)}/link-conversation`, {
    conversationId: "00000000-0000-4000-8000-999999999999",
    actionMode: "link-only"
  });
  const unsafeLinkBody = await safeJson(unsafeLink);
  record("unsafe link with bad conversationId rejected safely", unsafeLink.status === 404 && noRawSecretFields(unsafeLinkBody) && noRawPayloadValues(unsafeLinkBody));

  const prepared = await prepareSafeConversationRoute();
  if (prepared) {
    const linkOnlyItem = await createNoMatchItem("link-only", "Safe Sprint 60 link-only inbound", "dry-run", prepared.roomKey);
    const linkOnly = await safeJson(await request("POST", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(linkOnlyItem.id)}/link-conversation`, {
      conversationId: prepared.conversationId,
      actionMode: "link-only"
    }));
    record("link-only marks item linked without persisting message", linkOnly?.unmatchedStatus === "linked" && linkOnly?.linkStatus === "linked" && linkOnly?.messagePersisted === false && linkOnly?.linkedConversationId === prepared.conversationId);

    const persistItem = await createNoMatchItem("link-persist", "Safe Sprint 60 persisted linked inbound", "dry-run", prepared.roomKey);
    const beforeMessages = await conversationMessages(prepared.conversationId);
    const persisted = await safeJson(await request("POST", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(persistItem.id)}/link-conversation`, {
      conversationId: prepared.conversationId,
      actionMode: "link-and-persist-safe-message"
    }));
    const afterMessages = await conversationMessages(prepared.conversationId);
    const duplicate = await safeJson(await request("POST", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(persistItem.id)}/link-conversation`, {
      conversationId: prepared.conversationId,
      actionMode: "link-and-persist-safe-message"
    }));
    const afterDuplicateMessages = await conversationMessages(prepared.conversationId);

    record("link-and-persist-safe-message persists one safe inbound message", persisted?.linkStatus === "linked-message-persisted" && persisted?.messagePersisted === true && typeof persisted?.linkedMessageId === "string" && afterMessages.length === beforeMessages.length + 1);
    record("duplicate link-and-persist does not create second message", duplicate?.id === persisted?.id && afterDuplicateMessages.length === afterMessages.length);
    record("linked messages safe", noRawSecretFields({ afterMessages, afterDuplicateMessages }) && noRawPayloadValues({ afterMessages, afterDuplicateMessages }));
  } else {
    record("safe existing conversation route skipped", true, "DATABASE_URL unavailable");
  }

  const afterReadiness = await safeJson(await request("GET", "/health/readiness"));
  record("readiness counts/status updated", safeReadinessSprint60Summary(afterReadiness?.providerReadiness)
    && afterReadiness.providerReadiness.unmatchedInboundReviewedCount >= (beforeReadiness?.unmatchedInboundReviewedCount ?? 0) + 1
    && afterReadiness.providerReadiness.unmatchedInboundSkippedCount >= (beforeReadiness?.unmatchedInboundSkippedCount ?? 0) + 1
    && ["reviewed", "skipped", null].includes(afterReadiness.providerReadiness.latestUnmatchedReviewActionStatus)
  );
  record("readiness after actions externalCalls=0", noNonzeroExternalCalls(afterReadiness));

  const afterEvents = await safeJson(await request("GET", "/provider-webhooks/events"));
  record("GET /provider-webhooks/events includes Sprint 60 safe fields", Array.isArray(afterEvents) && afterEvents.every(safeEventShape) && afterEvents.some((event) => event.unmatchedReviewActionStatus || event.unmatchedLinkStatus));
  record("event log raw payload not returned", noRawSecretFields(afterEvents) && noRawPayloadValues(afterEvents));
  record("event log externalCalls=0", noNonzeroExternalCalls(afterEvents));
  record("no provider outbound", !containsProviderOutbound({ healthBody, readinessBody, reviewed, skipped, unsafeLinkBody, afterReadiness, afterEvents }));
  record("no live provider network call evidence", noLiveProviderNetworkEvidence({ healthBody, readinessBody, reviewed, skipped, unsafeLinkBody, afterReadiness, afterEvents }));

  finish();
}

async function createNoMatchItem(label, text, inboundPersistenceMode, roomKey = `safe-no-match-room-sprint60-${label}-${Date.now()}`) {
  const eventId = `sprint60-${label}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const payload = linePayload(roomKey, `safe-sender-sprint60-${label}`, text);
  payload[`safeMarker${label.replace(/[^a-z0-9]/gi, "")}${Date.now()}`] = true;
  const response = await request("POST", "/provider-webhooks/sandbox-events", {
    provider: "line",
    channel: "line",
    eventType: "message.created",
    mode: "sandbox",
    inboundPersistenceMode,
    eventId,
    timestamp: "2026-06-01T06:00:00.000Z",
    signature: signPayload(payload),
    payload
  });
  const body = await safeJson(response);
  record(`POST valid signed sandbox no-match event reachable (${label})`, response.status === 201 || response.status === 200);
  record(`valid event safe DTO (${label})`, safeEventShape(body) && noRawSecretFields(body) && noRawPayloadValues(body));
  const unmatched = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound"));
  return Array.isArray(unmatched) ? unmatched.find((item) => item.id === body?.unmatchedInboundId) : null;
}

async function prepareSafeConversationRoute() {
  if (!process.env.DATABASE_URL) return null;
  const prisma = new PrismaClient();
  const suffix = `${Date.now()}${Math.random().toString(16).slice(2, 8)}`;
  const channelAccountId = "sandbox:line";
  const roomKey = `safe-link-room-sprint60-${suffix}`;
  const conversationId = `sprint60-conversation-${suffix}`;
  try {
    await prisma.tenant.upsert({
      where: { id: tenantId },
      update: {},
      create: { id: tenantId, name: "Sprint 60 Safe Smoke Tenant" }
    });
    await prisma.channelAccount.upsert({
      where: { id: channelAccountId },
      update: { tenantId, platform: "line", displayName: "Sandbox LINE Smoke", status: "sandbox" },
      create: { id: channelAccountId, tenantId, platform: "line", displayName: "Sandbox LINE Smoke", status: "sandbox" }
    });
    const room = await prisma.room.upsert({
      where: { tenantId_platform_channelAccountId: { tenantId, platform: "line", channelAccountId } },
      update: { name: "Sandbox LINE Smoke", aiMode: "human_first" },
      create: { tenantId, platform: "line", channelAccountId, name: "Sandbox LINE Smoke", aiMode: "human_first" }
    });
    const contact = await prisma.contact.create({
      data: { tenantId, displayName: `Sprint 60 Smoke Contact ${suffix}` }
    });
    const identity = await prisma.contactIdentity.create({
      data: {
        tenantId,
        contactId: contact.id,
        platform: "line",
        channelAccountId,
        externalUserId: `safe-sprint60-identity-${suffix}`,
        displayName: "Sprint 60 Smoke Identity"
      }
    });
    await prisma.conversation.create({
      data: {
        id: conversationId,
        tenantId,
        roomId: room.id,
        contactId: contact.id,
        contactIdentityId: identity.id,
        externalConversationId: roomKey,
        status: "open",
        aiState: "need_human"
      }
    });
    return { conversationId, roomKey };
  } finally {
    await prisma.$disconnect();
  }
}

async function conversationMessages(conversationId) {
  const response = await request("GET", `/conversations/${encodeURIComponent(conversationId)}/messages`);
  const body = await safeJson(response);
  return Array.isArray(body) ? body : [];
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
      replyToken: "raw-reply-token-sprint60",
      source: { type: "room", userId, roomId },
      message: { id: "raw-message-sprint60", type: "text", text }
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
    "id", "tenantId", "provider", "channel", "eventType", "mode", "status", "receivedAt",
    "payloadSummary", "payloadFieldCount", "payloadDigest", "signatureVerified", "signatureStatus",
    "signatureAlgorithm", "signatureFingerprint", "signedAt", "replayDetected", "replayStatus",
    "dedupKeyDigest", "previousEventSeenAt", "normalized", "normalizationStatus", "normalizedEventType",
    "direction", "messageType", "textPreview", "textLength", "mediaSummary", "senderKeyDigest",
    "roomKeyDigest", "dryRunRouting", "routingStatus", "conversationLookupStatus", "conversationKeyDigest",
    "channelAccountId", "roomIdDigest", "inboundPersistenceMode", "inboundPersistenceStatus",
    "messagePersisted", "persistedMessageId", "conversationId", "unmatchedInboundQueued",
    "unmatchedInboundId", "unmatchedStatus", "unmatchedReason", "unmatchedReviewActionStatus",
    "unmatchedLinkStatus", "linkedConversationId", "linkedMessageId", "unmatchedResolvedAt",
    "inboundAuditStatus", "externalCalls"
  ]);
  return Object.keys(value).every((key) => allowed.has(key)) && value.direction === "inbound" && value.externalCalls === 0;
}

function safeUnmatchedItemShape(value) {
  if (!value || typeof value !== "object") return false;
  const allowed = new Set([
    "id", "tenantId", "provider", "channelAccountId", "mode", "eventType", "normalizedEventType",
    "messageType", "normalizationStatus", "routingStatus", "conversationLookupStatus", "unmatchedStatus",
    "unmatchedReason", "reviewStatus", "reviewedAt", "reviewedBy", "reviewReason", "linkStatus",
    "linkedConversationId", "linkedMessageId", "unmatchedResolvedAt", "messagePersisted", "payloadDigest",
    "providerEventDigest", "deliveryDigest", "senderKeyDigest", "roomKeyDigest", "textPreview",
    "textLength", "receivedAt", "assignmentStatus", "assignedToOperatorLabel", "assignedAt",
    "assignedByOperatorLabel", "escalationStatus", "escalationReason", "escalatedAt",
    "escalatedByOperatorLabel", "lastOperatorNoteAt", "historyAvailable", "diagnosticsAvailable",
    "candidatesAvailable", "externalCalls"
  ]);
  return Object.keys(value).every((key) => allowed.has(key))
    && value.mode === "sandbox"
    && value.conversationLookupStatus === "not-found"
    && value.externalCalls === 0;
}

function safeReadinessSprint60Summary(readiness) {
  return readiness?.webhookUnmatchedInboundReviewEnabled === true
    && readiness.webhookUnmatchedReviewActionsEnabled === true
    && typeof readiness.unmatchedInboundOpenCount === "number"
    && typeof readiness.unmatchedInboundQueuedCount === "number"
    && typeof readiness.unmatchedInboundReviewedCount === "number"
    && typeof readiness.unmatchedInboundSkippedCount === "number"
    && typeof readiness.unmatchedInboundLinkedCount === "number"
    && (readiness.latestUnmatchedReviewActionStatus === null || typeof readiness.latestUnmatchedReviewActionStatus === "string")
    && (readiness.latestUnmatchedLinkStatus === null || typeof readiness.latestUnmatchedLinkStatus === "string")
    && readiness.externalCalls === 0;
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
    "token", "secret", "accessToken", "refreshToken", "accessTokenCiphertext", "webhookSecret",
    "webhookSignature", "appSecret", "botToken", "verifyToken", "apiKey", "authorization",
    "cookie", "signature", "payloadJson", "providerRaw", "rawPayload", "replyToken"
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
  return !/raw-reply-token-sprint60|raw-message-sprint60|safe-no-match-room-sprint60|safe-link-room-sprint60|safe-sender-sprint60/i.test(JSON.stringify(value ?? {}));
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
    throw new Error(`Sprint 60 smoke failed: ${failed.map((item) => item.name).join(", ")}`);
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
