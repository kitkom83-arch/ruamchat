import { pathToFileURL } from "node:url";

const baseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");
const tenantId = process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
const userId = process.env.USER_ID ?? "00000000-0000-4000-8000-000000000011";
const results = [];

let restoreTarget = null;

async function main() {
  record("local API only", isLocalBaseUrl(baseUrl), baseUrl);

  const health = await request("GET", "/health");
  record("GET /health", health.status === 200);

  const rooms = await requestJson("GET", "/rooms");
  record("GET /rooms", Array.isArray(rooms) && rooms.length > 0);

  const selected = await findConversation(rooms);
  record("safe persisted conversation selected", Boolean(selected?.room?.id && selected?.conversation?.id), selected?.conversation?.id ?? "");
  if (!selected) return finish();

  const { room, conversation } = selected;
  const customer360Before = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/customer-360`);
  const contact = customer360Before.contact;
  const contactId = contact?.id;
  const originalOptOut = Boolean(contact?.optOutBroadcast ?? customer360Before.broadcastHistorySummary?.optOut);
  const originalDoNotContact = Boolean(contact?.doNotContact);
  restoreTarget = { conversationId: conversation.id, contactId, originalOptOut, originalDoNotContact };

  record("GET Customer 360", customer360Before?.selectedConversationId === conversation.id && Boolean(contactId));
  record("Customer 360 context is separated", customer360Before.source?.platform === room.platform && customer360Before.source?.channelAccountId === room.channelAccountId);
  record("Customer 360 DTO has no token/secret fields", noRawSecretFields(customer360Before));

  const segment = await requestJson("POST", "/broadcasts/segments", {
    name: `Sprint 45 suppression ${Date.now()}`,
    description: "Safe smoke segment scoped to a persisted contact display name",
    rules: [{
      id: "rule-sprint44-contact-name",
      field: "contactField",
      operator: "contains",
      value: contact.displayName
    }],
    estimatedCount: 1
  });
  const campaign = await requestJson("POST", "/broadcasts/campaigns", {
    name: `Sprint 45 suppression ${Date.now()}`,
    description: "Safe smoke campaign; provider outbound disabled; compliance UI API mode",
    channelPlatform: room.platform,
    channelAccountId: room.channelAccountId,
    segmentId: segment.id,
    contentJson: {
      message: "Sprint 44 safe mock broadcast for {{contact.name}} via {{platform}}",
      safeMockOnly: true
    }
  });
  record("created scoped API campaign and segment", Boolean(segment.id && campaign.id && campaign.channelAccountId === room.channelAccountId));

  const blockedState = await requestJson("PATCH", `/conversations/${encodeURIComponent(conversation.id)}/customer-360/consent`, {
    contactId,
    optOut: originalOptOut,
    doNotContact: true
  });
  record("set safe test doNotContact through backend API", blockedState.contact?.id === contactId && blockedState.contact?.doNotContact === true);

  const preview = await requestJson("POST", `/broadcasts/campaigns/${encodeURIComponent(campaign.id)}/audience-preview`, {
    platform: room.platform,
    channelAccountId: room.channelAccountId
  });
  const dryRun = await requestJson("POST", `/broadcasts/campaigns/${encodeURIComponent(campaign.id)}/dry-run`, {
    platform: room.platform,
    channelAccountId: room.channelAccountId
  });
  const sendNow = await requestJson("POST", `/broadcasts/campaigns/${encodeURIComponent(campaign.id)}/send-now`, {
    platform: room.platform,
    channelAccountId: room.channelAccountId
  });

  const suppressed = findSuppressedForContact(dryRun, contactId) ?? findSuppressedForContact(preview, contactId);
  record("recipient is suppressed safely", Boolean(suppressed));
  record("suppression reason is safe", isSafeSuppressionReason(suppressed?.reason), suppressed?.reason ?? "");
  record("suppressedCount >= 1", Number(dryRun.suppressedCount ?? 0) >= 1);
  record("eligible/suppressed counts are consistent", countsAreConsistent(dryRun));
  record("preview/dry-run externalCalls = 0", dryRun.externalCalls === 0 && preview.externalCalls === 0);
  record("suppression context preserved", hasSuppressionContext(suppressed, room, contactId));
  record("send-now did not create fake sent/provider success for suppressed recipient", sendNow.created === 0 && sendNow.sentMock === 0 && Array.isArray(sendNow.logs) && sendNow.logs.length === 0);
  record("send-now suppression counts persisted in response", sendNow.suppressedCount >= 1 && sendNow.externalCalls?.length === 0);

  const sendLogs = await requestJson("GET", `/broadcasts/campaigns/${encodeURIComponent(campaign.id)}/send-logs`);
  record("no send log exists for suppressed campaign", Array.isArray(sendLogs) && sendLogs.length === 0);

  const complianceLogs = await requestJson("GET", `/broadcasts/campaigns/${encodeURIComponent(campaign.id)}/compliance-logs`);
  const campaignCompliance = Array.isArray(complianceLogs)
    ? complianceLogs.find((log) => log.campaignId === campaign.id && (log.contactId === contactId || log.customerId === contactId))
    : null;
  record("broadcast compliance endpoint available in API", Array.isArray(complianceLogs));
  record("broadcast compliance data is readable from backend", Boolean(campaignCompliance));
  record("broadcast compliance DTO context preserved", hasComplianceEndpointContext(campaignCompliance, campaign.id, room, conversation.id, contactId));
  record("broadcast compliance DTO has no token/secret fields", noRawSecretFields(complianceLogs));

  const auditLogs = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/audit-logs`);
  const suppressionAudit = Array.isArray(auditLogs)
    ? auditLogs.find((log) =>
        log.action === "broadcast.recipient_suppressed" &&
        log.metadataJson?.campaignId === campaign.id &&
        log.metadataJson?.contactId === contactId
      )
    : null;
  record("suppression/compliance audit row exists", Boolean(suppressionAudit));
  record("suppression audit context preserved", hasSuppressionAuditContext(suppressionAudit, room, conversation.id, contactId));
  record("audit logs have no token/secret fields", noRawSecretFields(auditLogs));

  const invalidTenant = await request("POST", `/broadcasts/campaigns/${encodeURIComponent(campaign.id)}/audience-preview`, {
    platform: room.platform,
    channelAccountId: room.channelAccountId
  }, {
    "x-tenant-id": "00000000-0000-4000-8000-000000009999"
  });
  const invalidText = await invalidTenant.text();
  record("invalid/API failure returns broadcast API error", invalidTenant.status >= 400, invalidText);
  record("invalid/API failure does not return mock fallback", !invalidText.includes("Anya Prom") && !invalidText.includes("Krit Market") && !invalidText.includes("LINE Follow Up"));

  const restored = await restoreConsent();
  const refetched = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/customer-360`);
  record("restored original consent through backend API", restored?.contact?.doNotContact === originalDoNotContact && refetched.contact?.optOutBroadcast === originalOptOut && refetched.contact?.doNotContact === originalDoNotContact);
  record("conversation grouping still preserves platform/account/room", conversationsKeepContext(refetched.recentConversations, conversation.id));

  const aggregateDtos = { customer360Before, blockedState, preview, dryRun, sendNow, sendLogs, complianceLogs, auditLogs, restored, refetched };
  record("returned DTOs have no token/secret fields", noRawSecretFields(aggregateDtos));
  record("externalCalls = 0", noNonzeroExternalCalls(aggregateDtos));
  record("no provider outbound", !containsProviderOutbound(aggregateDtos));

  restoreTarget = null;
  finish();
}

async function restoreConsent() {
  if (!restoreTarget?.conversationId || !restoreTarget?.contactId) return null;
  return requestJson("PATCH", `/conversations/${encodeURIComponent(restoreTarget.conversationId)}/customer-360/consent`, {
    contactId: restoreTarget.contactId,
    optOut: restoreTarget.originalOptOut,
    doNotContact: restoreTarget.originalDoNotContact
  });
}

async function findConversation(rooms) {
  if (!Array.isArray(rooms)) return null;
  for (const room of rooms) {
    if (!room?.id || !room?.platform || !room?.channelAccountId) continue;
    const conversations = await requestJson("GET", `/rooms/${encodeURIComponent(room.id)}/conversations?tab=human&filter=all&limit=10`);
    const conversation = Array.isArray(conversations)
      ? conversations.find((item) => item?.id && item?.roomId === room.id && item?.platform === room.platform && item?.channelAccountId === room.channelAccountId)
      : null;
    if (conversation) return { room, conversation };
  }
  return null;
}

function finish() {
  const failed = results.filter((result) => !result.ok);
  console.log(JSON.stringify({ baseUrl, tenantId, externalCalls: 0, results }, null, 2));
  if (failed.length > 0) {
    throw new Error(`Sprint 45 smoke failed: ${failed.map((item) => item.name).join(", ")}`);
  }
}

async function requestJson(method, path, body, extraHeaders) {
  const response = await request(method, path, body, extraHeaders);
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const detail = typeof data?.message === "string" ? data.message : response.statusText;
    throw new Error(`${method} ${path} failed (${response.status}): ${detail}`);
  }
  return data;
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

function findSuppressedForContact(result, contactId) {
  return Array.isArray(result?.suppressedRecipients)
    ? result.suppressedRecipients.find((recipient) => recipient.contactId === contactId || recipient.customerId === contactId)
    : null;
}

function countsAreConsistent(result) {
  const candidateCount = Number(result?.candidateCount ?? 0);
  const eligibleCount = Number(result?.eligibleCount ?? 0);
  const suppressedCount = Number(result?.suppressedCount ?? 0);
  const reasonTotal = Object.values(result?.suppressedByReason ?? {}).reduce((sum, value) => sum + Number(value ?? 0), 0);
  return candidateCount >= 1 && candidateCount === eligibleCount + suppressedCount && reasonTotal === suppressedCount;
}

function hasSuppressionContext(value, room, contactId) {
  return Boolean(
    value &&
    value.tenantId === tenantId &&
    (value.contactId === contactId || value.customerId === contactId) &&
    value.platform === room.platform &&
    value.channelAccountId === room.channelAccountId &&
    typeof value.roomId === "string" &&
    value.externalCalls === 0
  );
}

function hasSuppressionAuditContext(value, room, conversationId, contactId) {
  const metadata = value?.metadataJson ?? {};
  return Boolean(
    value &&
    value.tenantId === tenantId &&
    value.conversationId === conversationId &&
    value.platform === room.platform &&
    value.channelAccountId === room.channelAccountId &&
    value.roomId === room.id &&
    metadata.tenantId === tenantId &&
    metadata.conversationId === conversationId &&
    metadata.contactId === contactId &&
    metadata.customerId === contactId &&
    metadata.platform === room.platform &&
    metadata.channelAccountId === room.channelAccountId &&
    metadata.roomId === room.id &&
    metadata.suppressed === true &&
    isSafeSuppressionReason(metadata.blockedReason) &&
    metadata.externalCalls === 0
  );
}

function hasComplianceEndpointContext(value, campaignId, room, conversationId, contactId) {
  return Boolean(
    value &&
    value.tenantId === tenantId &&
    value.campaignId === campaignId &&
    value.conversationId === conversationId &&
    value.contactId === contactId &&
    value.customerId === contactId &&
    value.platform === room.platform &&
    value.channelAccountId === room.channelAccountId &&
    value.roomId === room.id &&
    isSafeSuppressionReason(value.reason) &&
    value.externalCalls === 0
  );
}

function conversationsKeepContext(conversations, selectedConversationId) {
  if (!Array.isArray(conversations) || conversations.length === 0) return false;
  const contextKeys = new Set();
  for (const item of conversations) {
    if (
      item.tenantId !== tenantId ||
      typeof item.id !== "string" ||
      typeof item.platform !== "string" ||
      typeof item.channelAccountId !== "string" ||
      typeof item.roomId !== "string"
    ) {
      return false;
    }
    contextKeys.add(`${item.id}:${item.platform}:${item.channelAccountId}:${item.roomId}`);
  }
  return contextKeys.size === conversations.length && conversations.some((item) => item.id === selectedConversationId);
}

function isSafeSuppressionReason(value) {
  return ["do_not_contact", "marketing_opt_out", "consent_missing", "consent_revoked", "unknown_unsafe"].includes(value);
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
    "accessToken",
    "accessTokenCiphertext",
    "webhookSecret",
    "appSecret",
    "botToken",
    "verifyToken",
    "apiKey",
    "password"
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

function looksRawSecret(value) {
  if (value === null || value === undefined) return false;
  const text = String(value);
  return /(^|[^a-z])sk-[a-z0-9_-]{8,}|Bearer\s+[a-z0-9._-]+|raw-|mock-line-secret|xox[baprs]-|EA[A-Za-z0-9]{20,}/i.test(text);
}

function record(name, ok, detail = "") {
  results.push({ name, ok: Boolean(ok), detail });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(async (error) => {
    try {
      await restoreConsent();
    } catch (restoreError) {
      console.error(restoreError instanceof Error ? restoreError.message : restoreError);
    }
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
