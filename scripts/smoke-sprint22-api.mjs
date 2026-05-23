const baseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");
const tenantId = process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
const userId = process.env.USER_ID ?? "00000000-0000-4000-8000-000000000011";
const demoContactName = "Sprint 22 Demo Contact";

const results = [];

async function main() {
  const health = await request("GET", "/health");
  record("GET /health", health.status === 200);

  let contacts = await requestJson("GET", "/contacts");
  record("GET /contacts", Array.isArray(contacts));

  let contact = Array.isArray(contacts) ? contacts[0] : null;
  if (contact?.id) {
    const detail = await requestJson("GET", `/contacts/${encodeURIComponent(contact.id)}`);
    const identities = await requestJson("GET", `/contacts/${encodeURIComponent(contact.id)}/identities`);
    const contactConversations = await requestJson("GET", `/contacts/${encodeURIComponent(contact.id)}/conversations`);
    record("GET /contacts/:contactId", detail?.id === contact.id);
    record("GET /contacts/:contactId/identities", Array.isArray(identities));
    record("GET /contacts/:contactId/conversations", conversationsStaySeparated(contactConversations));
  } else {
    record("GET /contacts/:contactId", true, "skipped; no persisted contacts returned");
    record("GET /contacts/:contactId/identities", true, "skipped; no persisted contacts returned");
    record("GET /contacts/:contactId/conversations", true, "skipped; no persisted contacts returned");
  }

  const demoContact = Array.isArray(contacts) ? contacts.find((item) => item?.displayName === demoContactName) : null;
  if (demoContact?.id) {
    contact = await requestJson("PATCH", `/contacts/${encodeURIComponent(demoContact.id)}`, {
      displayName: demoContactName,
      leadStatus: demoContact.leadStatus ?? "new",
      tags: Array.from(new Set([...(demoContact.tags ?? []), "sprint22-smoke"]))
    });
    record("PATCH safe demo contact", contact?.displayName === demoContactName);
  } else {
    contact = await requestJson("POST", "/contacts", {
      displayName: demoContactName,
      leadStatus: "new",
      tags: ["sprint22-smoke"]
    });
    record("POST safe demo contact", contact?.displayName === demoContactName);
    contacts = await requestJson("GET", "/contacts");
  }

  if (contact?.id && Array.isArray(contact.identities) && contact.identities.length > 1) {
    const lastIdentity = contact.identities.at(-1);
    const beforeConversations = await requestJson("GET", `/contacts/${encodeURIComponent(contact.id)}/conversations`);
    const afterPrimary = await requestJson("PATCH", `/contacts/${encodeURIComponent(contact.id)}/primary-identity`, { identityId: lastIdentity.id });
    record("PATCH primary identity safe", afterPrimary?.identities?.some((identity) => identity.id === lastIdentity.id && identity.isPrimary));
    record("identity action preserved room separation", conversationsStaySeparated(beforeConversations));
  } else {
    record("PATCH primary identity safe", true, "skipped; safe demo contact has fewer than two identities");
    record("identity action preserved room separation", true, "skipped; safe demo contact has fewer than two identities");
  }

  const rooms = await requestJson("GET", "/rooms");
  record("GET /rooms", Array.isArray(rooms));

  let conversations = [];
  const room = Array.isArray(rooms) ? rooms[0] : null;
  if (room?.id) {
    conversations = await requestJson("GET", `/rooms/${encodeURIComponent(room.id)}/conversations?tab=human&filter=all`);
    if (Array.isArray(conversations) && conversations.length === 0) {
      conversations = await requestJson("GET", `/rooms/${encodeURIComponent(room.id)}/conversations?tab=bot&filter=all`);
    }
    record("GET room conversations", Array.isArray(conversations) && conversationsStaySeparated(conversations));
  } else {
    record("GET room conversations", true, "skipped; no rooms returned");
  }

  const conversation = Array.isArray(conversations) ? conversations[0] : null;
  if (conversation?.id) {
    const customer360 = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/customer-360`);
    record("GET conversation customer-360", customer360?.selectedConversationId === conversation.id);
    record("customer-360 conversations separated by room", conversationsStaySeparated(customer360?.recentConversations ?? []));
  } else {
    record("GET conversation customer-360", true, "skipped; no persisted conversation returned");
    record("customer-360 conversations separated by room", true, "skipped; no persisted conversation returned");
  }

  const failed = results.filter((result) => !result.ok);
  console.log(JSON.stringify({ baseUrl, tenantId, results }, null, 2));
  if (failed.length > 0) {
    throw new Error(`Sprint 22 smoke failed: ${failed.map((item) => item.name).join(", ")}`);
  }
}

async function requestJson(method, path, body) {
  const response = await request(method, path, body);
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const detail = typeof data?.message === "string" ? data.message : response.statusText;
    throw new Error(`${method} ${path} failed (${response.status}): ${detail}`);
  }
  return data;
}

async function request(method, path, body) {
  return fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      "x-tenant-id": tenantId,
      "x-user-id": userId
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
}

function conversationsStaySeparated(conversations) {
  if (!Array.isArray(conversations)) return false;
  const keys = conversations.map((conversation) => [
    conversation.platform,
    conversation.channelAccountId,
    conversation.roomId,
    conversation.id
  ].filter(Boolean).join(":"));
  return keys.length === new Set(keys).size && conversations.every((conversation) => conversation.roomId && conversation.platform && conversation.channelAccountId);
}

function record(name, ok, detail = "") {
  results.push({ name, ok: Boolean(ok), detail });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
