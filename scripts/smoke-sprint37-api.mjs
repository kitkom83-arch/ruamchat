import { pathToFileURL } from "node:url";

const baseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");
const tenantId = process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
const userId = process.env.USER_ID ?? "00000000-0000-4000-8000-000000000011";
const results = [];

async function main() {
  record("local API only", isLocalBaseUrl(baseUrl), baseUrl);

  const health = await request("GET", "/health");
  record("GET /health", health.status === 200);

  const initialTasks = await requestJson("GET", "/tasks?limit=50");
  record("GET /tasks returns persisted task array", Array.isArray(initialTasks));
  record("initial tasks are safe", noRawSecretFields(initialTasks));

  const rooms = await requestJson("GET", "/rooms");
  const selected = await findConversation(rooms);
  record("safe persisted room/conversation selected", Boolean(selected?.room?.id && selected?.conversation?.id), selected?.conversation?.id ?? "");
  if (!selected) return finish();

  const { room, conversation } = selected;
  record("conversation context preserved before task changes", conversation.platform === room.platform && conversation.channelAccountId === room.channelAccountId && conversation.roomId === room.id);

  const marker = `sprint37-${Date.now()}`;
  const createdTask = await requestJson("POST", `/conversations/${encodeURIComponent(conversation.id)}/tasks`, {
    title: `Sprint 37 reminder task ${marker}`,
    assigneeUserId: userId
  });
  record("created or found safe task through backend API", createdTask.status === "open" && createdTask.conversationId === conversation.id);
  record("created task preserves context", hasContext(createdTask, room));

  const dueSoonAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  const dueSoonTask = await requestJson("PATCH", `/tasks/${encodeURIComponent(createdTask.id)}`, { dueAt: dueSoonAt });
  record("set due date to due-soon through backend API", dueSoonTask.dueAt === dueSoonAt);
  record("due-soon update preserves context", hasContext(dueSoonTask, room));

  const dueSoonTasks = await requestJson("GET", `/tasks?status=open&due=due_soon&roomId=${encodeURIComponent(room.id)}&limit=50`);
  const dueSoonRow = dueSoonTasks.find((task) => task.id === createdTask.id);
  record("due-soon task appears in backend task dashboard/filter", Boolean(dueSoonRow));
  record("due-soon row preserves tenant and context", dueSoonRow?.tenantId === tenantId && hasContext(dueSoonRow, room));

  const overdueAt = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const overdueTask = await requestJson("PATCH", `/tasks/${encodeURIComponent(createdTask.id)}`, { dueAt: overdueAt });
  record("set due date to overdue through backend API", overdueTask.dueAt === overdueAt);

  const overdueTasks = await requestJson("GET", `/tasks?status=open&due=overdue&roomId=${encodeURIComponent(room.id)}&limit=50`);
  const overdueRow = overdueTasks.find((task) => task.id === createdTask.id);
  record("overdue task appears in backend task dashboard/filter", Boolean(overdueRow));
  record("overdue row preserves context", hasContext(overdueRow, room));

  const followUpAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
  const followUp = await requestJson("POST", `/conversations/${encodeURIComponent(conversation.id)}/follow-up`, { followUpAt });
  record("conversation follow-up persisted", followUp.followUpAt === followUpAt);

  const followUpTasks = await requestJson("GET", `/tasks?status=open&due=follow_up&roomId=${encodeURIComponent(room.id)}&limit=50`);
  const followUpRow = followUpTasks.find((task) => task.id === createdTask.id);
  record("follow-up task filter uses backend persisted conversation state", Boolean(followUpRow));
  record("follow-up row preserves context", hasContext(followUpRow, room));

  const refetchedTasks = await requestJson("GET", `/tasks?status=open&roomId=${encodeURIComponent(room.id)}&limit=50`);
  const refetchedTask = refetchedTasks.find((task) => task.id === createdTask.id);
  record("refetch /tasks confirms updates persisted", refetchedTask?.dueAt === overdueAt);
  record("refetched task context preserved", refetchedTask?.tenantId === tenantId && refetchedTask?.conversationId === conversation.id && hasContext(refetchedTask, room));

  const auditLogs = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/audit-logs`);
  record("audit exists for reminder changes", auditLogs.some((log) => log.action === "task.reminder_updated" && log.metadataJson?.taskId === createdTask.id));
  record("audit exists for follow-up changes", auditLogs.some((log) => log.action === "conversation.follow_up_set" && log.metadataJson?.conversationId === conversation.id));
  record("audit logs preserve task/conversation context", auditLogs.some((log) => log.action === "task.reminder_updated" && hasContext(log, room)));
  record("audit logs are safe", noRawSecretFields(auditLogs));

  const invalidTaskUpdate = await request("PATCH", `/tasks/${encodeURIComponent(createdTask.id)}`, { assigneeUserId: "agent-local-only" });
  const invalidText = await invalidTaskUpdate.text();
  record("invalid/API failure returns API error", invalidTaskUpdate.status >= 400);
  record("invalid/API failure does not return mock fallback", !invalidText.includes("Anya Prom") && !invalidText.includes("Krit Market") && !invalidText.includes("ส่งราคา Business"));

  record("all task DTOs have no token/secret fields", noRawSecretFields({ createdTask, dueSoonTask, dueSoonTasks, overdueTask, overdueTasks, followUpTasks, refetchedTasks }));
  record("externalCalls = 0", noNonzeroExternalCalls({ createdTask, dueSoonTask, dueSoonTasks, overdueTask, overdueTasks, followUpTasks, refetchedTasks, auditLogs }));
  record("no provider outbound", !containsProviderOutbound({ createdTask, dueSoonTask, dueSoonTasks, overdueTask, overdueTasks, followUpTasks, refetchedTasks, auditLogs }));

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
    throw new Error(`Sprint 37 smoke failed: ${failed.map((item) => item.name).join(", ")}`);
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
