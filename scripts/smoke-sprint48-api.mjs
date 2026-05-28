import { pathToFileURL } from "node:url";
import { createServer } from "node:net";

const baseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");
const tenantId = process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
const userId = process.env.USER_ID ?? "00000000-0000-4000-8000-000000000011";
const results = [];
let restoreTarget = null;

async function main() {
  record("local API only", isLocalBaseUrl(baseUrl), baseUrl);
  await verifyApiOffUnavailable();

  const health = await request("GET", "/health");
  record("GET /health", health.status === 200);

  const campaignListBefore = await requestJson("GET", "/broadcasts/campaigns");
  record("GET /broadcasts", Array.isArray(campaignListBefore));

  const rooms = await requestJson("GET", "/rooms");
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
  restoreTarget = {
    conversationId: conversation.id,
    contactId,
    originalOptOut: Boolean(contact?.optOutBroadcast ?? customer360Before.broadcastHistorySummary?.optOut),
    originalDoNotContact: Boolean(contact?.doNotContact)
  };
  record("campaign context source selected", Boolean(contactId && identity?.id));

  const segment = await requestJson("POST", "/broadcasts/segments", {
    name: `Sprint 48 analytics export ${Date.now()}`,
    description: "Safe smoke segment scoped to a persisted contact display name",
    rules: [{
      id: "rule-sprint48-contact-name",
      field: "contactField",
      operator: "contains",
      value: contact.displayName
    }],
    estimatedCount: 1
  });
  const campaign = await requestJson("POST", "/broadcasts/campaigns", {
    name: `Sprint 48 analytics export ${Date.now()}`,
    description: "Safe smoke campaign; analytics and delivery export API mode",
    channelPlatform: room.platform,
    channelAccountId: room.channelAccountId,
    segmentId: segment.id,
    contentJson: {
      message: "Sprint 48 safe mock broadcast for {{contact.name}} via {{platform}}",
      safeMockOnly: true
    }
  });
  record("created scoped API campaign data", Boolean(segment.id && campaign.id && campaign.channelAccountId === room.channelAccountId));

  await requestJson("PATCH", `/conversations/${encodeURIComponent(conversation.id)}/customer-360/consent`, {
    contactId,
    optOut: false,
    doNotContact: false
  });
  const sentTest = await requestJson("POST", `/broadcasts/campaigns/${encodeURIComponent(campaign.id)}/send-test`, {
    contactId,
    contactIdentityId: identity?.id ?? null,
    platform: room.platform,
    payloadJson: { source: "sprint48-smoke", safeMockOnly: true }
  });
  record("safe sent delivery log created", sentTest.created === 1 && sentTest.logs?.[0]?.status === "sent_mock");

  await requestJson("PATCH", `/conversations/${encodeURIComponent(conversation.id)}/customer-360/consent`, {
    contactId,
    optOut: false,
    doNotContact: true
  });
  const blockedTest = await requestJson("POST", `/broadcasts/campaigns/${encodeURIComponent(campaign.id)}/send-test`, {
    contactId,
    contactIdentityId: identity?.id ?? null,
    platform: room.platform,
    payloadJson: { source: "sprint48-smoke-blocked", safeMockOnly: true }
  });
  record("safe suppressed/blocked delivery log created", blockedTest.logs?.[0]?.status === "blocked");

  const campaignList = await requestJson("GET", "/broadcasts/campaigns");
  const campaignDetail = await requestJson("GET", `/broadcasts/campaigns/${encodeURIComponent(campaign.id)}`);
  const logsPage = await requestJson("GET", `/broadcasts/send-logs?${new URLSearchParams({ campaignId: campaign.id, limit: "200", offset: "0" })}`);
  const campaignLogs = logsPage.items ?? [];
  const sentLogs = campaignLogs.filter((log) => log.status === "sent_mock" || log.status === "mock_sent");
  const blockedLogs = campaignLogs.filter((log) => log.status === "blocked" || log.status === "suppressed");
  const failedLogs = campaignLogs.filter((log) => log.status === "failed_mock" || log.status === "failed_safe");
  const skippedLogs = campaignLogs.filter((log) => log.status === "skipped_mock");
  record("GET campaign detail", hasSafeCampaignDetail(campaignDetail, campaign.id));
  record("GET delivery/send logs", logsPage.total === campaignLogs.length && campaignLogs.length >= 2);
  record("campaign list includes persisted API campaign", campaignList.some((item) => item.id === campaign.id));

  const analytics = await requestJson("GET", `/broadcasts/campaigns/${encodeURIComponent(campaign.id)}/analytics?${new URLSearchParams({ limit: "200", offset: "0" })}`);
  record("GET analytics endpoint", analytics.campaignId === campaign.id && analytics.tenantId === tenantId);
  record("analytics counts match persisted logs", analytics.counts.total === campaignLogs.length && analytics.counts.sent === sentLogs.length && analytics.counts.blocked === blockedLogs.length && analytics.counts.failed === failedLogs.length && analytics.counts.skipped === skippedLogs.length);
  record("suppressed recipients not counted as provider success", analytics.counts.providerSuccess === sentLogs.length && analytics.counts.sent < analytics.counts.total);
  record("analytics context preserved", analytics.contexts.some((item) => item.platform === room.platform && item.channelAccountId === room.channelAccountId && item.roomId === room.id));

  const filteredLogPage = await requestJson("GET", `/broadcasts/send-logs?${new URLSearchParams({
    campaignId: campaign.id,
    status: "sent_mock",
    platform: room.platform,
    channelAccountId: room.channelAccountId,
    roomId: room.id,
    conversationId: conversation.id,
    contactId,
    limit: "200",
    offset: "0"
  })}`);
  const exportAll = await requestJson("GET", `/broadcasts/campaigns/${encodeURIComponent(campaign.id)}/delivery-export?${new URLSearchParams({ limit: "200", offset: "0" })}`);
  const exportFiltered = await requestJson("GET", `/broadcasts/campaigns/${encodeURIComponent(campaign.id)}/delivery-export?${new URLSearchParams({
    status: "sent_mock",
    platform: room.platform,
    channelAccountId: room.channelAccountId,
    roomId: room.id,
    conversationId: conversation.id,
    contactId,
    limit: "200",
    offset: "0"
  })}`);
  record("export respects filters", exportFiltered.rows.every((row) => row.status === "sent_mock" && row.platform === room.platform && row.channelAccountId === room.channelAccountId && row.roomId === room.id));
  record("export row count matches filtered delivery logs", exportFiltered.rowCount === filteredLogPage.total && exportFiltered.rows.length === filteredLogPage.items.length);
  record("export preserves context", exportAll.rows.some((row) => hasDeliveryContext(row, campaign.id, room, conversation.id, contactId)));
  record("failed/suppressed/sent statuses normalize safely", campaignLogs.every((row) => isSafeDeliveryStatus(row.status)) && exportAll.rows.every((row) => isSafeDeliveryStatus(row.status)));

  const invalidAnalytics = await request("GET", `/broadcasts/campaigns/${encodeURIComponent(campaign.id)}/analytics`, undefined, { "x-tenant-id": "00000000-0000-4000-8000-000000009999" });
  const invalidExport = await request("GET", `/broadcasts/campaigns/${encodeURIComponent(campaign.id)}/delivery-export`, undefined, { "x-tenant-id": "00000000-0000-4000-8000-000000009999" });
  const invalidText = `${await invalidAnalytics.text()} ${await invalidExport.text()}`;
  record("invalid tenant/campaign/API failure returns API error", invalidAnalytics.status >= 400 && invalidExport.status >= 400, invalidText);
  record("invalid tenant/campaign/API failure does not return mock fallback", !invalidText.includes("LINE Follow Up") && !invalidText.includes("camp-hot-lead-reminder"));

  const aggregateDtos = { campaignList, campaignDetail, logsPage, analytics, filteredLogPage, exportAll, exportFiltered, sentTest, blockedTest };
  record("analytics/export have no token/secret/provider raw payload", noRawSecretFields(aggregateDtos));
  record("externalCalls = 0", noNonzeroExternalCalls(aggregateDtos));
  record("no provider outbound", !containsProviderOutbound(aggregateDtos));

  const restored = await restoreConsent();
  const refetched = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/customer-360`);
  record("restored original consent through backend API", restored?.contact?.doNotContact === restoreTarget.originalDoNotContact && refetched.contact?.optOutBroadcast === restoreTarget.originalOptOut && refetched.contact?.doNotContact === restoreTarget.originalDoNotContact);
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
    throw new Error(`Sprint 48 smoke failed: ${failed.map((item) => item.name).join(", ")}`);
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

async function verifyApiOffUnavailable() {
  const unavailableUrl = await reserveClosedLocalUrl();
  let unavailable = false;
  try {
    const response = await fetch(unavailableUrl, { signal: AbortSignal.timeout(1000) });
    unavailable = response.status >= 500;
  } catch {
    unavailable = true;
  }
  record("API-off unavailable PASS", unavailable);
}

async function reserveClosedLocalUrl() {
  const server = createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;
  await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
  return `http://127.0.0.1:${port}/health`;
}

function hasSafeCampaignDetail(value, campaignId) {
  return Boolean(value && value.campaignId === campaignId && value.externalCalls === 0 && !("contentJson" in value) && !("payloadJson" in value));
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
    value.externalCalls === 0
  );
}

function isSafeDeliveryStatus(value) {
  return ["previewed", "dry_run", "suppressed", "blocked", "queued_mock", "mock_sent", "sent_mock", "skipped_mock", "failed_mock", "failed_safe", "unknown_safe"].includes(value);
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
    "payloadJson",
    "providerRaw",
    "rawPayload"
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
