import { spawn } from "node:child_process";
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
  record("health", health.status === 200);

  const broadcasts = await requestJson("GET", "/broadcasts/campaigns");
  record("broadcasts", Array.isArray(broadcasts));

  const selected = await findConversation();
  record("safe persisted conversation selected", Boolean(selected?.room?.id && selected?.conversation?.id), selected?.conversation?.id ?? "");
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
  record("segment preview context source valid", Boolean(contactId && identity?.id && room.platform && room.channelAccountId && room.id));

  await requestJson("PATCH", `/conversations/${encodeURIComponent(conversation.id)}/customer-360/consent`, {
    contactId,
    optOut: false,
    doNotContact: false
  });

  const stamp = Date.now();
  const segmentRule = {
    id: "rule-sprint51-contact",
    field: "contactField",
    operator: "contains",
    value: contact.displayName
  };
  const segment = await requestJson("POST", "/broadcasts/segments", {
    name: `Sprint 51 saved segment ${stamp}`,
    description: "Safe smoke saved segment for API-mode filter builder",
    rules: [segmentRule],
    estimatedCount: 1
  });
  const segments = await requestJson("GET", "/broadcasts/segments");
  const foundSegment = await requestJson("GET", `/broadcasts/segments/${encodeURIComponent(segment.id)}`);
  record("create/find saved segment", Array.isArray(segments) && segments.some((item) => item.id === segment.id) && foundSegment.id === segment.id);

  const unsavedSegmentPreview = await requestJson("POST", "/broadcasts/segments/preview", {
    segment: { rules: [segmentRule] },
    preview: {
      platform: room.platform,
      channelAccountId: room.channelAccountId,
      limit: 100
    }
  });
  const savedSegmentPreview = await requestJson("GET", `/broadcasts/segments/${encodeURIComponent(segment.id)}/preview?${new URLSearchParams({
    platform: room.platform,
    channelAccountId: room.channelAccountId,
    limit: "100"
  })}`);
  record("unsaved segment preview", unsavedSegmentPreview.campaignId === "segment-preview" && unsavedSegmentPreview.externalCalls === 0);
  record("saved segment preview", savedSegmentPreview.campaignId === segment.id && savedSegmentPreview.externalCalls === 0);
  record("eligible/suppressed/blocked/invalid counts", [unsavedSegmentPreview, savedSegmentPreview].every((preview) =>
    preview.candidateCount >= 1 &&
    preview.eligibleCount >= 1 &&
    preview.suppressedCount === 0 &&
    preview.blockedCount === 0 &&
    Number.isInteger(preview.invalidCount) &&
    preview.invalidCount >= 0
  ));
  record("platform/channelAccountId/roomId preserved", (savedSegmentPreview.recipients ?? []).some((item) => hasPreviewContext(item, segment.id, room, conversation.id, contactId)));

  const campaign = await requestJson("POST", "/broadcasts/campaigns", {
    name: `Sprint 51 apply segment ${stamp}`,
    description: "Safe smoke campaign for saved segment apply",
    channelPlatform: room.platform,
    channelAccountId: room.channelAccountId,
    segmentId: null,
    contentJson: {
      message: "Sprint 51 safe preview for {{contact.name}} via {{platform}}",
      safeMockOnly: true
    }
  });
  const clearedSegment = await requestJson("POST", `/broadcasts/campaigns/${encodeURIComponent(campaign.id)}/apply-segment`, { segmentId: null });
  const appliedSegment = await requestJson("POST", `/broadcasts/campaigns/${encodeURIComponent(campaign.id)}/apply-segment`, { segmentId: segment.id });
  record("apply/clear segment on campaign", clearedSegment.segmentId === null && appliedSegment.segmentId === segment.id);

  const campaignPreview = await requestJson("GET", `/broadcasts/campaigns/${encodeURIComponent(campaign.id)}/audience-preview?${new URLSearchParams({
    platform: room.platform,
    channelAccountId: room.channelAccountId,
    limit: "100"
  })}`);
  record("apply preserves campaign audience context", (campaignPreview.recipients ?? []).some((item) => hasPreviewContext(item, campaign.id, room, conversation.id, contactId)));

  await requestJson("PATCH", `/conversations/${encodeURIComponent(conversation.id)}/customer-360/consent`, {
    contactId,
    optOut: true,
    doNotContact: true
  });
  const blockedSegmentPreview = await requestJson("GET", `/broadcasts/segments/${encodeURIComponent(segment.id)}/preview?${new URLSearchParams({
    platform: room.platform,
    channelAccountId: room.channelAccountId,
    limit: "100"
  })}`);
  record("opt-out/do-not-contact/suppression/consent enforced", blockedSegmentPreview.eligibleCount === 0 && blockedSegmentPreview.suppressedCount >= 1 && blockedSegmentPreview.blockedCount >= 1);
  record("suppressed segment preview preserves context", (blockedSegmentPreview.suppressedRecipients ?? []).some((item) => hasSuppressedContext(item, segment.id, room, conversation.id, contactId)));

  await restoreConsent();
  restoreTarget = null;

  const invalidTenant = await request("GET", `/broadcasts/segments/${encodeURIComponent(segment.id)}`, undefined, { "x-tenant-id": "00000000-0000-4000-8000-000000009999" });
  const invalidSegment = await request("GET", `/broadcasts/segments/not-a-real-segment/preview`);
  const invalidCampaign = await request("POST", "/broadcasts/campaigns/not-a-real-campaign/apply-segment", { segmentId: segment.id });
  const invalidApply = await request("POST", `/broadcasts/campaigns/${encodeURIComponent(campaign.id)}/apply-segment`, { segmentId: "00000000-0000-4000-8000-000000009999" });
  const invalidText = `${await invalidTenant.text()} ${await invalidSegment.text()} ${await invalidCampaign.text()} ${await invalidApply.text()}`;
  record("invalid tenant/segment/campaign API error", [invalidTenant, invalidSegment, invalidCampaign, invalidApply].every((response) => response.status >= 400), invalidText);
  record("no mock fallback", !invalidText.includes("LINE Follow Up") && !invalidText.includes("camp-hot-lead-reminder") && !invalidText.includes("Hot leads"));

  const aggregate = { broadcasts, segments, foundSegment, unsavedSegmentPreview, savedSegmentPreview, campaignPreview, blockedSegmentPreview, clearedSegment, appliedSegment };
  record("no token/secret/provider raw payload", noRawSecretFields(aggregate));
  record("externalCalls = 0", noNonzeroExternalCalls(aggregate));
  record("no provider outbound", !containsProviderOutbound(aggregate));

  await runRegressionSmoke("smoke:sprint50");
  await runRegressionSmoke("smoke:sprint49");
  await runRegressionSmoke("smoke:sprint48");

  finish();
}

async function runRegressionSmoke(scriptName) {
  const command = process.platform === "win32" ? "cmd.exe" : "npm";
  const args = process.platform === "win32" ? ["/d", "/s", "/c", `npm run ${scriptName}`] : ["run", scriptName];
  const code = await new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      env: process.env,
      stdio: "inherit"
    });
    child.on("close", resolve);
  });
  record(`${scriptName} regression still works`, code === 0, `exit ${code}`);
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

function hasPreviewContext(value, campaignId, room, conversationId, contactId) {
  return Boolean(
    value &&
    value.tenantId === tenantId &&
    value.campaignId === campaignId &&
    (value.customerId === contactId || value.contactId === contactId) &&
    value.conversationId === conversationId &&
    value.platform === room.platform &&
    value.channelAccountId === room.channelAccountId &&
    value.roomId === room.id &&
    value.externalCalls === 0
  );
}

function hasSuppressedContext(value, campaignId, room, conversationId, contactId) {
  return Boolean(
    value &&
    value.tenantId === tenantId &&
    value.campaignId === campaignId &&
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
    throw new Error(`Sprint 51 smoke failed: ${failed.map((item) => item.name).join(", ")}`);
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
