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
  record("GET /rooms", Array.isArray(rooms));

  const selected = await findConversation(rooms);
  record("safe persisted room/conversation selected", Boolean(selected?.room?.id && selected?.conversation?.id), selected?.conversation?.id ?? "");
  if (!selected) return finish();

  const { room, conversation } = selected;
  record("conversation preserves platform/account/room", conversation.platform === room.platform && conversation.channelAccountId === room.channelAccountId && conversation.roomId === room.id);

  const customer360 = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/customer-360`);
  record("Customer 360 loads from API", customer360?.selectedConversationId === conversation.id && customer360?.contact?.id);
  record("Customer 360 context preserves platform/account", customer360.source.platform === room.platform && customer360.source.channelAccountId === room.channelAccountId);
  record("initial response is safe", noRawSecretFields(customer360));

  const marker = `sprint33-${Date.now()}`;
  const noteBody = `Sprint 33 safe API note ${marker}`;
  const createdNote = await requestJson("POST", `/conversations/${encodeURIComponent(conversation.id)}/notes`, {
    body: noteBody,
    visibility: "team"
  });
  record("created note through backend API", createdNote.body === noteBody && createdNote.conversationId === conversation.id);
  record("note response preserves context", hasContext(createdNote, room));
  record("note response is safe", noRawSecretFields(createdNote));

  const refetchedNotes = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/notes`);
  const persistedNote = refetchedNotes.find((note) => note.id === createdNote.id && note.body === noteBody);
  record("refetch confirms persisted note", Boolean(persistedNote));
  record("refetched note preserves context", hasContext(persistedNote, room));

  const taskTitle = `Sprint 33 safe API task ${marker}`;
  const createdTask = await requestJson("POST", `/conversations/${encodeURIComponent(conversation.id)}/tasks`, {
    title: taskTitle,
    assigneeUserId: userId
  });
  record("created task through backend API", createdTask.title === taskTitle && createdTask.conversationId === conversation.id);
  record("task response preserves context", hasContext(createdTask, room));
  record("task response is safe", noRawSecretFields(createdTask));

  const refetchedTasks = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/tasks`);
  const persistedTask = refetchedTasks.find((task) => task.id === createdTask.id && task.title === taskTitle);
  record("refetch confirms persisted task", Boolean(persistedTask));
  record("refetched task preserves context", hasContext(persistedTask, room));

  const auditLogs = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/audit-logs`);
  const noteAudit = auditLogs.find((log) => log.action === "note.created" && log.metadataJson?.noteId === createdNote.id);
  const taskAudit = auditLogs.find((log) => log.action === "task.created" && log.metadataJson?.taskId === createdTask.id);
  record("audit log exists for note action", Boolean(noteAudit?.id));
  record("audit log exists for task action", Boolean(taskAudit?.id));
  record("note audit preserves safe context", hasContext(noteAudit, room) && noteAudit.metadataJson?.contactId === customer360.contact.id);
  record("task audit preserves safe context", hasContext(taskAudit, room) && taskAudit.metadataJson?.contactId === customer360.contact.id);
  record("audit logs are safe", noRawSecretFields([noteAudit, taskAudit]));
  record("audit externalCalls = 0", auditExternalCallsZero(noteAudit) && auditExternalCallsZero(taskAudit));

  const refreshedCustomer360 = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/customer-360`);
  record("Customer 360 refetch preserves note/task", Boolean(
    refreshedCustomer360.notes.find((note) => note.id === createdNote.id) &&
    refreshedCustomer360.tasks.find((task) => task.id === createdTask.id)
  ));
  record("refreshed Customer 360 is safe", noRawSecretFields(refreshedCustomer360));
  record("externalCalls remain zero", noNonzeroExternalCalls({ refreshedCustomer360, auditLogs: [noteAudit, taskAudit] }));

  const missingNotes = await request("GET", "/conversations/sprint33-missing-no-mock/notes");
  record("missing notes case returns API error/empty state, not mock fallback", missingNotes.status === 404);
  const missingTasks = await request("POST", "/conversations/sprint33-missing-no-mock/tasks", { title: "must not fake" });
  record("missing task create returns API error, not mock fallback", missingTasks.status === 404);
  const missingText = `${await missingNotes.text()} ${await missingTasks.text()}`;
  record("missing cases do not return mock fallback", !missingText.includes("Anya Prom") && !missingText.includes("Krit Market"));

  record("no provider outbound", !containsProviderOutbound({ createdNote, createdTask, refetchedNotes, refetchedTasks, auditLogs }));

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
    throw new Error(`Sprint 33 smoke failed: ${failed.map((item) => item.name).join(", ")}`);
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

function hasContext(value, room) {
  return Boolean(value && value.platform === room.platform && value.channelAccountId === room.channelAccountId && value.roomId === room.id);
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

function auditExternalCallsZero(log) {
  return Boolean(log?.metadataJson?.externalCalls === 0 && log?.afterJson?.externalCalls === 0);
}

function noRawSecretFields(value) {
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
  const stack = [value];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || typeof current !== "object") continue;
    for (const [key, child] of Object.entries(current)) {
      if (forbidden.has(key)) return false;
      if (looksRawSecret(child)) return false;
      if (child && typeof child === "object") stack.push(child);
    }
  }
  return true;
}

function looksRawSecret(value) {
  if (value === null || value === undefined) return false;
  const text = String(value);
  return /sk-[a-z0-9_-]{8,}|Bearer\s+[a-z0-9._-]+|raw-|mock-line-secret|xox[baprs]-|EA[A-Za-z0-9]{20,}/i.test(text);
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
