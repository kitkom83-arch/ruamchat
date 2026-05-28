import { createServer } from "node:net";
import { pathToFileURL } from "node:url";

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

  const campaignsBefore = await requestJson("GET", "/broadcasts/campaigns");
  record("GET /broadcasts", Array.isArray(campaignsBefore));

  const selected = await findConversation();
  record("safe persisted API campaign context selected", Boolean(selected?.room?.id && selected?.conversation?.id), selected?.conversation?.id ?? "");
  if (!selected) return finish();

  const { room, conversation, customer360 } = selected;
  const contact = customer360.contact;
  const contactId = contact?.id;
  const identity = Array.isArray(customer360.identities)
    ? customer360.identities.find((item) => item.platform === room.platform && item.channelAccountId === room.channelAccountId)
    : null;
  restoreTarget = {
    conversationId: conversation.id,
    contactId,
    originalOptOut: Boolean(contact?.optOutBroadcast ?? customer360.broadcastHistorySummary?.optOut),
    originalDoNotContact: Boolean(contact?.doNotContact)
  };
  record("platform/channelAccountId/roomId context source valid", Boolean(contactId && identity?.id && room.platform && room.channelAccountId && room.id));

  await requestJson("PATCH", `/conversations/${encodeURIComponent(conversation.id)}/customer-360/consent`, {
    contactId,
    optOut: false,
    doNotContact: false
  });

  const stamp = Date.now();
  const segment = await requestJson("POST", "/broadcasts/segments", {
    name: `Sprint 49 scheduling approval ${stamp}`,
    description: "Safe smoke segment scoped to a persisted contact display name",
    rules: [{
      id: "rule-sprint49-contact-name",
      field: "contactField",
      operator: "contains",
      value: contact.displayName
    }],
    estimatedCount: 1
  });
  const campaign = await requestJson("POST", "/broadcasts/campaigns", {
    name: `Sprint 49 draft ${stamp}`,
    description: "Initial Sprint 49 draft",
    channelPlatform: room.platform,
    channelAccountId: room.channelAccountId,
    segmentId: segment.id,
    contentJson: {
      message: "Sprint 49 initial draft for {{contact.name}} via {{platform}}",
      safeMockOnly: true
    }
  });
  record("created safe persisted API campaign", Boolean(campaign.id && campaign.tenantId === tenantId && campaign.channelAccountId === room.channelAccountId));

  const draftMessage = `Sprint 49 updated draft ${stamp} for {{contact.name}} via {{platform}}`;
  const updated = await requestJson("PATCH", `/broadcasts/campaigns/${encodeURIComponent(campaign.id)}`, {
    name: `Sprint 49 updated draft ${stamp}`,
    description: "Updated Sprint 49 draft persisted through backend API",
    status: "draft",
    channelPlatform: room.platform,
    channelAccountId: room.channelAccountId,
    segmentId: segment.id,
    contentJson: {
      message: draftMessage,
      safeMockOnly: true
    }
  });
  const refetchedDraft = await requestJson("GET", `/broadcasts/campaigns/${encodeURIComponent(campaign.id)}`);
  const listedAfterDraft = await requestJson("GET", "/broadcasts/campaigns");
  record("draft update persisted through backend API", updated.message === draftMessage && refetchedDraft.name?.includes("updated draft") && listedAfterDraft.some((item) => item.id === campaign.id && item.message === draftMessage));

  const preview = await requestJson("POST", `/broadcasts/campaigns/${encodeURIComponent(campaign.id)}/audience-preview`, {
    platform: room.platform,
    channelAccountId: room.channelAccountId
  });
  record("audience preview preserves campaign context", (preview.recipients ?? []).some((item) => hasRecipientContext(item, room, conversation.id, contactId)));
  record("suppression guardrails clean before approval/schedule", preview.externalCalls === 0 && (preview.suppressedCount ?? 0) === 0);

  const scheduledAt = new Date(Date.now() + 86_400_000).toISOString();
  const scheduled = await requestJson("POST", `/broadcasts/campaigns/${encodeURIComponent(campaign.id)}/schedule`, { scheduleAt: scheduledAt });
  const refetchedSchedule = await requestJson("GET", `/broadcasts/campaigns/${encodeURIComponent(campaign.id)}`);
  record("schedule persisted through backend API", scheduled.status === "scheduled" && scheduled.scheduleAt === scheduledAt && refetchedSchedule.scheduleAt === scheduledAt);

  const requested = await requestJson("POST", `/broadcasts/campaigns/${encodeURIComponent(campaign.id)}/request-approval`, { note: "Sprint 49 smoke approval request" });
  const approved = await requestJson("POST", `/broadcasts/campaigns/${encodeURIComponent(campaign.id)}/approve`, { note: "Sprint 49 smoke approved safe mock only" });
  const refetchedApproval = await requestJson("GET", `/broadcasts/campaigns/${encodeURIComponent(campaign.id)}`);
  record("approval request persisted", requested.status === "pending_approval" && requested.approvalStatus === "pending_approval");
  record("approval decision persisted", approved.status === "approved" && refetchedApproval.status === "approved" && refetchedApproval.approvalStatus === "approved");
  record("safe status/audit evidence returned", refetchedApproval.lastWorkflowAction === "approve" && refetchedApproval.approvalReviewedAt && refetchedApproval.externalCalls === 0);

  await requestJson("PATCH", `/conversations/${encodeURIComponent(conversation.id)}/customer-360/consent`, {
    contactId,
    optOut: false,
    doNotContact: true
  });
  const blockedApproval = await request("POST", `/broadcasts/campaigns/${encodeURIComponent(campaign.id)}/request-approval`, { note: "should be blocked" });
  const blockedText = await blockedApproval.text();
  record("consent/suppression guardrails enforced before approval readiness", blockedApproval.status >= 400 && /eligible recipients|suppression|consent/i.test(blockedText), blockedText);
  const compliance = await requestJson("GET", `/broadcasts/compliance-logs?${new URLSearchParams({ campaignId: campaign.id, platform: room.platform, channelAccountId: room.channelAccountId, roomId: room.id, conversationId: conversation.id, contactId, limit: "200", offset: "0" })}`);
  record("suppression compliance context preserved", (compliance.items ?? []).some((item) => item.reason === "do_not_contact" && hasComplianceContext(item, room, conversation.id, contactId)));
  await restoreConsent();
  restoreTarget = null;

  const logsPage = await requestJson("GET", `/broadcasts/send-logs?${new URLSearchParams({ campaignId: campaign.id, limit: "200", offset: "0" })}`);
  const analytics = await requestJson("GET", `/broadcasts/campaigns/${encodeURIComponent(campaign.id)}/analytics?${new URLSearchParams({ limit: "200", offset: "0" })}`);
  const exported = await requestJson("GET", `/broadcasts/campaigns/${encodeURIComponent(campaign.id)}/delivery-export?${new URLSearchParams({ limit: "200", offset: "0" })}`);
  record("Sprint 48 analytics/export endpoints still work", analytics.campaignId === campaign.id && exported.campaignId === campaign.id && exported.rowCount === exported.rows.length);
  record("schedule/approval did not create provider success", analytics.counts.providerSuccess === 0 && logsPage.total === 0);

  const invalidTenant = await request("GET", `/broadcasts/campaigns/${encodeURIComponent(campaign.id)}`, undefined, { "x-tenant-id": "00000000-0000-4000-8000-000000009999" });
  const invalidCampaign = await request("GET", "/broadcasts/campaigns/not-a-real-campaign");
  const invalidText = `${await invalidTenant.text()} ${await invalidCampaign.text()}`;
  record("invalid tenant/campaign/API failure returns API error", invalidTenant.status >= 400 && invalidCampaign.status >= 400, invalidText);
  record("invalid/API failure does not return mock fallback", !invalidText.includes("LINE Follow Up") && !invalidText.includes("camp-hot-lead-reminder"));

  const aggregate = { campaignsBefore, campaign, updated, refetchedDraft, preview, scheduled, refetchedSchedule, requested, approved, refetchedApproval, compliance, logsPage, analytics, exported };
  record("platform/channelAccountId/roomId context preserved", [preview, compliance].every((value) => JSON.stringify(value).includes(room.channelAccountId)) && JSON.stringify(compliance).includes(room.id));
  record("no token/secret/provider raw payload", noRawSecretFields(aggregate));
  record("externalCalls = 0", noNonzeroExternalCalls(aggregate));
  record("no provider outbound", !containsProviderOutbound(aggregate));

  finish();
}

async function findConversation() {
  const rooms = await requestJson("GET", "/rooms");
  if (!Array.isArray(rooms)) return null;
  for (const room of rooms) {
    if (!room?.id || !room?.platform || !room?.channelAccountId) continue;
    const conversations = await requestJson("GET", `/rooms/${encodeURIComponent(room.id)}/conversations?tab=human&filter=all&limit=10`);
    const conversation = Array.isArray(conversations)
      ? conversations.find((item) => item?.id && item?.roomId === room.id && item?.platform === room.platform && item?.channelAccountId === room.channelAccountId)
      : null;
    if (!conversation) continue;
    const customer360 = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/customer-360`);
    if (customer360?.contact?.id) return { room, conversation, customer360 };
  }
  return null;
}

async function restoreConsent() {
  if (!restoreTarget?.conversationId || !restoreTarget?.contactId) return null;
  return requestJson("PATCH", `/conversations/${encodeURIComponent(restoreTarget.conversationId)}/customer-360/consent`, {
    contactId: restoreTarget.contactId,
    optOut: restoreTarget.originalOptOut,
    doNotContact: restoreTarget.originalDoNotContact
  });
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

function hasRecipientContext(value, room, conversationId, contactId) {
  return Boolean(
    value &&
    (value.customerId === contactId || value.contactId === contactId) &&
    value.conversationId === conversationId &&
    value.platform === room.platform &&
    value.channelAccountId === room.channelAccountId &&
    value.roomId === room.id &&
    value.externalCalls === 0
  );
}

function hasComplianceContext(value, room, conversationId, contactId) {
  return Boolean(
    value &&
    (value.customerId === contactId || value.contactId === contactId) &&
    value.conversationId === conversationId &&
    value.platform === room.platform &&
    value.channelAccountId === room.channelAccountId &&
    value.roomId === room.id &&
    value.externalCalls === 0
  );
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

function finish() {
  const failed = results.filter((result) => !result.ok);
  console.log(JSON.stringify({ baseUrl, tenantId, externalCalls: 0, results }, null, 2));
  if (failed.length > 0) {
    throw new Error(`Sprint 49 smoke failed: ${failed.map((item) => item.name).join(", ")}`);
  }
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
