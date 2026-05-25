import { pathToFileURL } from "node:url";

const baseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");
const tenantId = process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
const userId = process.env.USER_ID ?? "00000000-0000-4000-8000-000000000011";
const assigneeUserId = process.env.ASSIGNEE_USER_ID ?? "00000000-0000-4000-8000-000000000012";
const results = [];

async function main() {
  record("local API only", isLocalBaseUrl(baseUrl), baseUrl);

  const health = await request("GET", "/health");
  record("GET /health", health.status === 200);

  const rooms = await requestJson("GET", "/rooms");
  const selected = await findConversation(rooms);
  record("safe persisted room/conversation selected", Boolean(selected?.room?.id && selected?.conversation?.id), selected?.conversation?.id ?? "");
  if (!selected) return finish();

  const { room, conversation } = selected;
  record("conversation preserves platform/account/room", conversation.platform === room.platform && conversation.channelAccountId === room.channelAccountId && conversation.roomId === room.id);

  const marker = `sprint36-${Date.now()}`;
  const createdTask = await requestJson("POST", `/conversations/${encodeURIComponent(conversation.id)}/tasks`, {
    title: `Sprint 36 assignment task ${marker}`,
    assigneeUserId: userId,
    dueAt: "2026-05-26T04:00:00.000Z"
  });
  record("created task through backend API", createdTask.status === "open" && createdTask.assigneeUserId === userId);
  record("created task preserves context", hasContext(createdTask, room));
  record("created task has externalCalls = 0", createdTask.externalCalls === 0);

  const updatedTask = await requestJson("PATCH", `/tasks/${encodeURIComponent(createdTask.id)}`, {
    title: `Sprint 36 reassigned overdue task ${marker}`,
    assigneeUserId,
    dueAt: "2026-05-20T04:00:00.000Z"
  });
  record("PATCH task persists assignee and due date", updatedTask.assigneeUserId === assigneeUserId && updatedTask.dueAt === "2026-05-20T04:00:00.000Z");
  record("updated task preserves context", hasContext(updatedTask, room));
  record("updated task is safe", noRawSecretFields(updatedTask));

  const overdueTasks = await requestJson("GET", `/tasks?status=open&due=overdue&assigneeUserId=${encodeURIComponent(assigneeUserId)}&roomId=${encodeURIComponent(room.id)}&limit=50`);
  const overdueDashboardTask = overdueTasks.find((task) => task.id === createdTask.id);
  record("overdue assignee dashboard filter returns updated task", overdueDashboardTask?.id === createdTask.id);
  record("overdue dashboard row preserves tenant and context", overdueDashboardTask?.tenantId === tenantId && hasContext(overdueDashboardTask, room));
  record("overdue dashboard externalCalls = 0", overdueDashboardTask?.externalCalls === 0);

  const updatedPriority = await requestJson("PATCH", `/conversations/${encodeURIComponent(conversation.id)}/priority`, { priority: "urgent" });
  const priorityTasks = await requestJson("GET", `/tasks?status=open&roomId=${encodeURIComponent(room.id)}&limit=50`);
  const priorityDashboardTask = priorityTasks.find((task) => task.id === createdTask.id);
  record("conversation priority update persisted", updatedPriority.priority === "urgent");
  record("task dashboard reflects conversation priority", priorityDashboardTask?.conversationPriority === "urgent");

  const clearedTask = await requestJson("PATCH", `/tasks/${encodeURIComponent(createdTask.id)}`, {
    assigneeUserId: null,
    dueAt: null
  });
  record("PATCH task clears assignee and due date", clearedTask.assigneeUserId === null && clearedTask.dueAt === null);
  const overdueAfterClear = await requestJson("GET", `/tasks?status=open&due=overdue&roomId=${encodeURIComponent(room.id)}&limit=50`);
  record("cleared task no longer appears in overdue dashboard", !overdueAfterClear.some((task) => task.id === createdTask.id));

  const completedTask = await requestJson("PATCH", `/tasks/${encodeURIComponent(createdTask.id)}/complete`);
  record("completed task through backend API", completedTask.status === "done" && Boolean(completedTask.completedAt));
  record("completed task preserves context", hasContext(completedTask, room));

  const completedTasks = await requestJson("GET", `/tasks?status=completed&roomId=${encodeURIComponent(room.id)}&limit=50`);
  record("completed dashboard confirms persisted task", completedTasks.some((task) => task.id === createdTask.id && task.status === "done"));
  const openAfterComplete = await requestJson("GET", `/tasks?status=open&roomId=${encodeURIComponent(room.id)}&limit=50`);
  record("completed task no longer appears in open dashboard", !openAfterComplete.some((task) => task.id === createdTask.id));

  const auditLogs = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/audit-logs`);
  record("task update audit log is present", auditLogs.some((log) => log.action === "task.updated" && log.metadataJson?.taskId === createdTask.id));
  record("task audit logs preserve context", auditLogs.some((log) => log.action === "task.updated" && hasContext(log, room)));
  record("task audit logs have externalCalls = 0", noNonzeroExternalCalls(auditLogs.filter((log) => String(log.action).startsWith("task."))));
  record("task audit logs are safe", noRawSecretFields(auditLogs));

  const invalidTaskUpdate = await request("PATCH", `/tasks/${encodeURIComponent(createdTask.id)}`, { assigneeUserId: "agent-local-only" });
  record("invalid API task update returns API error", invalidTaskUpdate.status === 400);
  const invalidText = await invalidTaskUpdate.text();
  record("invalid/API failure case does not return mock fallback", !invalidText.includes("Anya Prom") && !invalidText.includes("Krit Market") && !invalidText.includes("ส่งราคา Business"));

  record("externalCalls remain zero", noNonzeroExternalCalls({ createdTask, updatedTask, overdueTasks, priorityTasks, clearedTask, completedTask, completedTasks, auditLogs }));
  record("no provider outbound", !containsProviderOutbound({ createdTask, updatedTask, overdueTasks, priorityTasks, clearedTask, completedTask, completedTasks, auditLogs }));
  record("no token/secret leakage", noRawSecretFields({ createdTask, updatedTask, overdueTasks, priorityTasks, clearedTask, completedTask, completedTasks, auditLogs }));

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
    throw new Error(`Sprint 36 smoke failed: ${failed.map((item) => item.name).join(", ")}`);
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
