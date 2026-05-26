import { pathToFileURL } from "node:url";

const baseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");
const tenantId = process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
const userId = process.env.USER_ID ?? "00000000-0000-4000-8000-000000000011";
const results = [];

async function main() {
  record("local API only", isLocalBaseUrl(baseUrl), baseUrl);

  const health = await request("GET", "/health");
  record("GET /health", health.status === 200);

  const rooms = await requestJson("GET", "/rooms");
  record("GET /rooms returns persisted rooms", Array.isArray(rooms) && rooms.length > 0);
  const selected = await findConversation(rooms);
  record("safe persisted conversation with Customer 360 selected", Boolean(selected?.room?.id && selected?.conversation?.id), selected?.conversation?.id ?? "");
  if (!selected) return finish();

  const { room, conversation } = selected;
  record("selected conversation context preserved", hasConversationContext(conversation, room, conversation.id));

  const customer360Before = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/customer-360`);
  const contactId = customer360Before.contact?.id;
  const originalPrimaryIdentity = (customer360Before.identities ?? []).find((identity) => identity.isPrimary) ?? customer360Before.identities?.[0];
  record("GET Customer 360 returns selected conversation", customer360Before.selectedConversationId === conversation.id);
  record("Customer 360 source preserves platform/account", customer360Before.source?.platform === room.platform && customer360Before.source?.channelAccountId === room.channelAccountId);
  record("Customer 360 identifies contact and linked identities", Boolean(contactId && originalPrimaryIdentity?.id));
  record("Customer 360 conversations preserve tenant/platform/account/room", conversationsKeepContext(customer360Before.recentConversations, room, conversation.id));
  record("Customer 360 DTOs are safe", noRawSecretFields(customer360Before));
  if (!contactId || !originalPrimaryIdentity?.id) return finish();

  const marker = `sprint39-${Date.now()}`;
  const createdContact = await requestJson("POST", "/contacts", {
    displayName: `Sprint 39 Temp ${marker}`,
    leadStatus: "new",
    tags: ["sprint39-temp"],
    identity: {
      platform: customer360Before.source.platform,
      channelAccountId: customer360Before.source.channelAccountId,
      externalUserId: `${marker}-identity`,
      displayName: `Sprint 39 Identity ${marker}`,
      isPrimary: true
    }
  });
  const tempIdentity = createdContact.identities?.[0];
  record("created safe temp contact identity through backend API", Boolean(createdContact.id && tempIdentity?.id && tempIdentity.contactId === createdContact.id));

  const linkedContact = await requestJson("POST", `/contacts/${encodeURIComponent(contactId)}/identities/link`, {
    identityId: tempIdentity.id,
    isPrimary: false
  });
  record("link identity persisted through backend API", linkedContact.identities.some((identity) => identity.id === tempIdentity.id && identity.contactId === contactId));

  const customer360AfterLink = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/customer-360`);
  record("Customer 360 refetch includes linked identity", customer360AfterLink.identities.some((identity) => identity.id === tempIdentity.id && identity.contactId === contactId));
  record("identity grouping did not merge conversation room context", conversationsKeepContext(customer360AfterLink.recentConversations, room, conversation.id));

  const primaryContact = await requestJson("PATCH", `/contacts/${encodeURIComponent(contactId)}/primary-identity`, {
    identityId: tempIdentity.id
  });
  record("set primary identity persisted through backend API", primaryContact.identities.find((identity) => identity.id === tempIdentity.id)?.isPrimary === true);

  const customer360AfterPrimary = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/customer-360`);
  record("Customer 360 refetch confirms primary identity", customer360AfterPrimary.identities.find((identity) => identity.id === tempIdentity.id)?.isPrimary === true);

  await requestJson("PATCH", `/contacts/${encodeURIComponent(contactId)}/primary-identity`, {
    identityId: originalPrimaryIdentity.id
  });
  const restoredPrimary = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/customer-360`);
  record("original primary identity restored safely", restoredPrimary.identities.find((identity) => identity.id === originalPrimaryIdentity.id)?.isPrimary === true);

  const unlinkedContact = await requestJson("POST", `/contacts/${encodeURIComponent(contactId)}/identities/unlink`, {
    identityId: tempIdentity.id
  });
  record("unlink identity persisted through backend API", !unlinkedContact.identities.some((identity) => identity.id === tempIdentity.id));

  const customer360AfterUnlink = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/customer-360`);
  record("Customer 360 refetch excludes unlinked identity", !customer360AfterUnlink.identities.some((identity) => identity.id === tempIdentity.id));
  record("unlink did not merge conversation room context", conversationsKeepContext(customer360AfterUnlink.recentConversations, room, conversation.id));

  const followUpAt = new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString();
  const followUp = await requestJson("POST", `/conversations/${encodeURIComponent(conversation.id)}/follow-up`, { followUpAt });
  record("follow-up action persisted through backend API", followUp.followUpAt === followUpAt || followUp.status === "pending");

  const customer360AfterFollowUp = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/customer-360`);
  record("Customer 360 refetch confirms follow-up state", customer360AfterFollowUp.status === "follow_up" && customer360AfterFollowUp.selectedConversationId === conversation.id);
  record("follow-up refetch preserves tenant/platform/account/room", conversationsKeepContext(customer360AfterFollowUp.recentConversations, room, conversation.id));

  const auditLogs = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/audit-logs`);
  record("audit exists for identity/contact/follow-up changes", [
    "contact.identity_linked",
    "contact.primary_identity_set",
    "contact.identity_unlinked",
    "conversation.follow_up_set"
  ].every((action) => auditLogs.some((log) => log.action === action)));
  record("audit logs include safe contact/identity/conversation context", auditLogs.some((log) =>
    log.action === "contact.identity_linked" &&
    log.metadataJson?.contactId === contactId &&
    log.metadataJson?.identityId === tempIdentity.id &&
    log.metadataJson?.tenantId === tenantId &&
    hasConversationContext(log, room, conversation.id)
  ) && auditLogs.some((log) =>
    log.action === "conversation.follow_up_set" &&
    log.metadataJson?.conversationId === conversation.id &&
    log.metadataJson?.tenantId === tenantId &&
    hasConversationContext(log, room, conversation.id)
  ));
  record("audit logs are safe", noRawSecretFields(auditLogs));

  const invalidTenant = await request("GET", `/conversations/${encodeURIComponent(conversation.id)}/customer-360`, undefined, {
    "x-tenant-id": "00000000-0000-4000-8000-000000009999"
  });
  const invalidText = await invalidTenant.text();
  record("invalid/API failure returns API error", invalidTenant.status >= 400);
  record("invalid/API failure does not return mock fallback", !invalidText.includes("Anya Prom") && !invalidText.includes("Krit Market") && !invalidText.includes("ส่งราคา Business"));

  const aggregateDtos = {
    customer360Before,
    createdContact,
    linkedContact,
    customer360AfterLink,
    primaryContact,
    customer360AfterPrimary,
    restoredPrimary,
    unlinkedContact,
    customer360AfterUnlink,
    followUp,
    customer360AfterFollowUp,
    auditLogs
  };
  const unsafeAggregatePath = findUnsafeSecretPath(aggregateDtos);
  record("all Customer 360/action DTOs have no token/secret fields", !unsafeAggregatePath, unsafeAggregatePath ?? "");
  record("externalCalls = 0", noNonzeroExternalCalls({
    customer360Before,
    createdContact,
    linkedContact,
    customer360AfterLink,
    primaryContact,
    customer360AfterPrimary,
    restoredPrimary,
    unlinkedContact,
    customer360AfterUnlink,
    followUp,
    customer360AfterFollowUp,
    auditLogs
  }));
  record("no provider outbound", !containsProviderOutbound({
    createdContact,
    linkedContact,
    primaryContact,
    unlinkedContact,
    followUp,
    customer360AfterFollowUp,
    auditLogs
  }));

  finish();
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
  console.log(JSON.stringify({ baseUrl, tenantId, results }, null, 2));
  if (failed.length > 0) {
    throw new Error(`Sprint 39 smoke failed: ${failed.map((item) => item.name).join(", ")}`);
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

function conversationsKeepContext(conversations, selectedRoom, selectedConversationId) {
  if (!Array.isArray(conversations) || conversations.length === 0) return false;
  return conversations.every((item) =>
    item.tenantId === tenantId &&
    typeof item.id === "string" &&
    typeof item.platform === "string" &&
    typeof item.channelAccountId === "string" &&
    typeof item.roomId === "string"
  ) && conversations.some((item) => hasConversationContext(item, selectedRoom, selectedConversationId));
}

function hasConversationContext(value, room, conversationId) {
  return Boolean(
    value &&
    value.tenantId === tenantId &&
    value.conversationId !== null &&
    (value.conversationId === undefined || value.conversationId === conversationId) &&
    value.platform === room.platform &&
    value.channelAccountId === room.channelAccountId &&
    value.roomId === room.id
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
      if (key === "externalCalls" && child !== 0) return false;
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
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
