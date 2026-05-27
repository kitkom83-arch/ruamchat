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
  const identity = Array.isArray(customer360Before.identities)
    ? customer360Before.identities.find((item) => item.platform === room.platform && item.channelAccountId === room.channelAccountId)
    : null;
  const originalOptOut = Boolean(contact?.optOutBroadcast ?? customer360Before.broadcastHistorySummary?.optOut);
  const originalDoNotContact = Boolean(contact?.doNotContact);
  restoreTarget = { conversationId: conversation.id, contactId, originalOptOut, originalDoNotContact };

  record("GET Customer 360", customer360Before?.selectedConversationId === conversation.id && Boolean(contactId));
  record("Customer 360 context is separated", customer360Before.source?.platform === room.platform && customer360Before.source?.channelAccountId === room.channelAccountId);
  record("Customer 360 DTO has no token/secret fields", noRawSecretFields(customer360Before));

  const segment = await requestJson("POST", "/broadcasts/segments", {
    name: `Sprint 47 delivery logs ${Date.now()}`,
    description: "Safe smoke segment scoped to a persisted contact display name",
    rules: [{
      id: "rule-sprint47-contact-name",
      field: "contactField",
      operator: "contains",
      value: contact.displayName
    }],
    estimatedCount: 1
  });
  const campaign = await requestJson("POST", "/broadcasts/campaigns", {
    name: `Sprint 47 delivery logs ${Date.now()}`,
    description: "Safe smoke campaign; provider outbound disabled; delivery logs API mode",
    channelPlatform: room.platform,
    channelAccountId: room.channelAccountId,
    segmentId: segment.id,
    contentJson: {
      message: "Sprint 47 safe mock broadcast for {{contact.name}} via {{platform}}",
      safeMockOnly: true
    }
  });
  record("created scoped API campaign and segment", Boolean(segment.id && campaign.id && campaign.channelAccountId === room.channelAccountId));

  const unblockedState = await requestJson("PATCH", `/conversations/${encodeURIComponent(conversation.id)}/customer-360/consent`, {
    contactId,
    optOut: false,
    doNotContact: false
  });
  record("set safe test consent through backend API", unblockedState.contact?.id === contactId && unblockedState.contact?.doNotContact === false);

  const preview = await requestJson("POST", `/broadcasts/campaigns/${encodeURIComponent(campaign.id)}/audience-preview`, {
    platform: room.platform,
    channelAccountId: room.channelAccountId
  });
  const dryRun = await requestJson("POST", `/broadcasts/campaigns/${encodeURIComponent(campaign.id)}/dry-run`, {
    platform: room.platform,
    channelAccountId: room.channelAccountId
  });
  record("safe preview/dry-run data created through backend API", preview.campaignId === campaign.id && dryRun.campaignId === campaign.id);
  record("preview/dry-run externalCalls = 0", preview.externalCalls === 0 && dryRun.externalCalls === 0);

  const sendTest = await requestJson("POST", `/broadcasts/campaigns/${encodeURIComponent(campaign.id)}/send-test`, {
    contactId,
    contactIdentityId: identity?.id ?? null,
    platform: room.platform,
    payloadJson: { source: "sprint47-smoke", safeMockOnly: true }
  });
  record("safe send-test log created without provider outbound", sendTest.created === 1 && sendTest.externalCalls?.length === 0);

  const campaignList = await requestJson("GET", "/broadcasts/campaigns");
  const campaignDetail = await requestJson("GET", `/broadcasts/campaigns/${encodeURIComponent(campaign.id)}`);
  record("campaign list endpoint returns scoped campaign", Array.isArray(campaignList) && campaignList.some((item) => item.id === campaign.id));
  record("campaign detail endpoint returns safe DTO", hasSafeCampaignDetail(campaignDetail, campaign.id));

  const legacySendLogs = await requestJson("GET", `/broadcasts/campaigns/${encodeURIComponent(campaign.id)}/send-logs`);
  const pageByCampaign = await requestJson("GET", `/broadcasts/send-logs?${new URLSearchParams({
    campaignId: campaign.id,
    limit: "25",
    offset: "0"
  }).toString()}`);
  const row = findDeliveryRow(pageByCampaign, campaign.id, contactId) ?? findDeliveryRow(legacySendLogs, campaign.id, contactId);
  record("delivery/send logs endpoint available in API", Array.isArray(legacySendLogs) && Array.isArray(pageByCampaign.items));
  record("delivery/send logs campaignId filter returns row", Boolean(row));
  record("delivery row context preserved", hasDeliveryContext(row, campaign.id, room, conversation.id, contactId));

  const statusForFilter = isSafeDeliveryStatus(row?.status) ? row.status : "sent_mock";
  const pageByStatus = await requestJson("GET", `/broadcasts/send-logs?${new URLSearchParams({
    campaignId: campaign.id,
    status: statusForFilter,
    platform: room.platform,
    channelAccountId: room.channelAccountId,
    roomId: room.id,
    conversationId: conversation.id,
    contactId,
    limit: "1",
    offset: "0"
  }).toString()}`);
  const statusRow = findDeliveryRow(pageByStatus, campaign.id, contactId);
  record("delivery/send logs status filter supported", Boolean(statusRow));
  record("status filter preserves platform/account/room", hasDeliveryContext(statusRow, campaign.id, room, conversation.id, contactId));
  record("delivery pagination/limit is safe", pageByStatus.limit === 1 && pageByStatus.offset === 0 && pageByStatus.total >= 1 && pageByStatus.externalCalls === 0);

  const blockedState = await requestJson("PATCH", `/conversations/${encodeURIComponent(conversation.id)}/customer-360/consent`, {
    contactId,
    optOut: false,
    doNotContact: true
  });
  record("set safe test doNotContact through backend API", blockedState.contact?.id === contactId && blockedState.contact?.doNotContact === true);

  const suppressedDryRun = await requestJson("POST", `/broadcasts/campaigns/${encodeURIComponent(campaign.id)}/dry-run`, {
    platform: room.platform,
    channelAccountId: room.channelAccountId
  });
  const suppressedSendNow = await requestJson("POST", `/broadcasts/campaigns/${encodeURIComponent(campaign.id)}/send-now`, {
    platform: room.platform,
    channelAccountId: room.channelAccountId
  });
  const suppressed = findSuppressedForContact(suppressedDryRun, contactId) ?? findSuppressedForContact(suppressedSendNow, contactId);
  record("suppressed recipient exists", Boolean(suppressed));
  record("suppressed row context preserved", hasSuppressionContext(suppressed, room, conversation.id, contactId));
  record("suppressed recipient is not provider-success/sent", suppressedSendNow.sentMock === 0 && suppressedSendNow.created === 0 && !hasProviderSuccessStatus(suppressedSendNow.logs));

  const invalidTenant = await request("GET", `/broadcasts/campaigns/${encodeURIComponent(campaign.id)}`, undefined, {
    "x-tenant-id": "00000000-0000-4000-8000-000000009999"
  });
  const invalidText = await invalidTenant.text();
  record("invalid/API failure returns campaign detail API error", invalidTenant.status >= 400, invalidText);
  record("invalid/API failure does not return mock fallback", !invalidText.includes("Anya Prom") && !invalidText.includes("Krit Market") && !invalidText.includes("LINE Follow Up"));

  const aggregateDtos = { customer360Before, preview, dryRun, sendTest, campaignList, campaignDetail, legacySendLogs, pageByCampaign, pageByStatus, blockedState, suppressedDryRun, suppressedSendNow };
  record("returned DTOs have no token/secret fields", noRawSecretFields(aggregateDtos));
  record("externalCalls = 0", noNonzeroExternalCalls(aggregateDtos));
  record("no provider outbound", !containsProviderOutbound(aggregateDtos));

  const restored = await restoreConsent();
  const refetched = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/customer-360`);
  record("restored original consent through backend API", restored?.contact?.doNotContact === originalDoNotContact && refetched.contact?.optOutBroadcast === originalOptOut && refetched.contact?.doNotContact === originalDoNotContact);

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
    throw new Error(`Sprint 47 smoke failed: ${failed.map((item) => item.name).join(", ")}`);
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

function hasSafeCampaignDetail(value, campaignId) {
  return Boolean(
    value &&
    value.campaignId === campaignId &&
    typeof value.name === "string" &&
    typeof value.status === "string" &&
    value.externalCalls === 0 &&
    !("contentJson" in value) &&
    !("payloadJson" in value)
  );
}

function findDeliveryRow(pageOrRows, campaignId, contactId) {
  const rows = Array.isArray(pageOrRows?.items)
    ? pageOrRows.items
    : Array.isArray(pageOrRows)
      ? pageOrRows
      : [];
  return rows.find((log) => log.campaignId === campaignId && (log.contactId === contactId || log.customerId === contactId)) ?? null;
}

function hasDeliveryContext(value, campaignId, room, conversationId, contactId) {
  return Boolean(
    value &&
    value.tenantId === tenantId &&
    value.campaignId === campaignId &&
    (value.contactId === contactId || value.customerId === contactId) &&
    value.conversationId === conversationId &&
    value.platform === room.platform &&
    value.channelAccountId === room.channelAccountId &&
    value.roomId === room.id &&
    isSafeDeliveryStatus(value.status) &&
    value.externalCalls === 0
  );
}

function findSuppressedForContact(result, contactId) {
  return Array.isArray(result?.suppressedRecipients)
    ? result.suppressedRecipients.find((recipient) => recipient.contactId === contactId || recipient.customerId === contactId)
    : null;
}

function hasSuppressionContext(value, room, conversationId, contactId) {
  return Boolean(
    value &&
    value.tenantId === tenantId &&
    (value.contactId === contactId || value.customerId === contactId) &&
    value.conversationId === conversationId &&
    value.platform === room.platform &&
    value.channelAccountId === room.channelAccountId &&
    value.roomId === room.id &&
    isSafeSuppressionReason(value.reason) &&
    value.externalCalls === 0
  );
}

function isSafeDeliveryStatus(value) {
  return ["previewed", "dry_run", "suppressed", "blocked", "queued_mock", "mock_sent", "sent_mock", "skipped_mock", "failed_mock", "failed_safe", "unknown_safe"].includes(value);
}

function isSafeSuppressionReason(value) {
  return ["do_not_contact", "marketing_opt_out", "consent_missing", "consent_revoked", "unknown_unsafe"].includes(value);
}

function hasProviderSuccessStatus(rows) {
  return Array.isArray(rows) && rows.some((row) => /provider|sent_provider|provider_success/i.test(String(row?.status ?? "")));
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
