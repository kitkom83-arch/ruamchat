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
  record("Customer 360 source preserves context", customer360.source.platform === room.platform && customer360.source.channelAccountId === room.channelAccountId);
  record("initial Customer 360 is safe", noRawSecretFields(customer360));

  const marker = `sprint34-${Date.now()}`;
  const taskTitle = `Sprint 34 safe completion task ${marker}`;
  const createdTask = await requestJson("POST", `/conversations/${encodeURIComponent(conversation.id)}/tasks`, {
    title: taskTitle,
    assigneeUserId: userId
  });
  record("created safe task through backend API", createdTask.title === taskTitle && createdTask.status === "open");
  record("created task preserves context", hasContext(createdTask, room));
  record("created task is safe", noRawSecretFields(createdTask));

  const completedTask = await requestJson("PATCH", `/tasks/${encodeURIComponent(createdTask.id)}/complete`);
  record("completed task through backend API", completedTask.id === createdTask.id && completedTask.status === "done");
  record("completed task has completedAt", Boolean(completedTask.completedAt));
  record("completed task preserves context", hasContext(completedTask, room));
  record("completed task is safe", noRawSecretFields(completedTask));

  const updatedTaskTitle = `Sprint 34 safe updated task ${marker}`;
  const reopenedTask = await requestJson("PATCH", `/tasks/${encodeURIComponent(createdTask.id)}`, {
    title: updatedTaskTitle,
    status: "open",
    dueAt: "2026-05-26T04:00:00.000Z",
    assigneeUserId: userId
  });
  record("updated task through backend API", reopenedTask.id === createdTask.id && reopenedTask.title === updatedTaskTitle && reopenedTask.status === "open");
  record("updated task clears completedAt when reopened", reopenedTask.completedAt === null);
  record("updated task preserves context", hasContext(reopenedTask, room));

  const recompletedTask = await requestJson("PATCH", `/tasks/${encodeURIComponent(createdTask.id)}/complete`);
  record("recompleted task persists done status", recompletedTask.status === "done" && Boolean(recompletedTask.completedAt));

  const refetchedTasks = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/tasks`);
  const persistedTask = refetchedTasks.find((task) => task.id === createdTask.id);
  record("refetch confirms task completion persisted", persistedTask?.status === "done" && Boolean(persistedTask.completedAt));
  record("completed task no longer open", !refetchedTasks.some((task) => task.id === createdTask.id && task.status === "open"));
  record("refetched task preserves context", hasContext(persistedTask, room));

  const refreshedCustomer360 = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/customer-360`);
  const customerTask = refreshedCustomer360.tasks.find((task) => task.id === createdTask.id);
  record("Customer 360 refetch confirms completed state", customerTask?.status === "done");
  record("refreshed Customer 360 is safe", noRawSecretFields(refreshedCustomer360));

  const auditLogs = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/audit-logs`);
  const completionAudit = auditLogs.find((log) => log.action === "task.completed" && log.metadataJson?.taskId === createdTask.id);
  const updateAudit = auditLogs.find((log) => log.action === "task.updated" && log.metadataJson?.taskId === createdTask.id);
  record("task completion audit log exists", Boolean(completionAudit?.id));
  record("task update audit log exists", Boolean(updateAudit?.id));
  record("completion audit preserves safe context", hasContext(completionAudit, room) && completionAudit.metadataJson?.contactId === customer360.contact.id);
  record("update audit preserves safe context", hasContext(updateAudit, room) && updateAudit.metadataJson?.contactId === customer360.contact.id);
  record("completion audit records previous/next status", completionAudit?.metadataJson?.fromStatus === "open" && completionAudit?.metadataJson?.toStatus === "done");
  record("audit logs are safe", noRawSecretFields([completionAudit, updateAudit]));
  record("audit externalCalls = 0", auditExternalCallsZero(completionAudit) && auditExternalCallsZero(updateAudit));

  const missingComplete = await request("PATCH", "/tasks/sprint34-missing-no-mock/complete");
  record("missing task complete returns API error, not mock fallback", missingComplete.status === 404);
  const invalidUpdate = await request("PATCH", `/tasks/${encodeURIComponent(createdTask.id)}`, { status: "waiting" });
  record("invalid task update returns API error, not mock fallback", invalidUpdate.status === 400);
  const missingText = `${await missingComplete.text()} ${await invalidUpdate.text()}`;
  record("missing/invalid task cases do not return mock fallback", !missingText.includes("Anya Prom") && !missingText.includes("Krit Market"));

  record("externalCalls remain zero", noNonzeroExternalCalls({ refreshedCustomer360, auditLogs: [completionAudit, updateAudit] }));
  record("no provider outbound", !containsProviderOutbound({ createdTask, completedTask, reopenedTask, recompletedTask, refetchedTasks, auditLogs }));

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
    throw new Error(`Sprint 34 smoke failed: ${failed.map((item) => item.name).join(", ")}`);
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
