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
  record("selected conversation context preserved", hasContext(conversation, room));

  const customer360Before = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/customer-360`);
  record("GET Customer 360 returns selected conversation", customer360Before.selectedConversationId === conversation.id);
  record("Customer 360 source preserves platform/account", customer360Before.source?.platform === room.platform && customer360Before.source?.channelAccountId === room.channelAccountId);
  record("Customer 360 task DTOs are safe", noRawSecretFields(customer360Before.tasks ?? []));

  const marker = `sprint38-${Date.now()}`;
  const dueAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
  const createdTask = await requestJson("POST", `/conversations/${encodeURIComponent(conversation.id)}/tasks`, {
    title: `Sprint 38 Customer 360 task ${marker}`,
    assigneeUserId: userId,
    dueAt
  });
  record("created task through backend API", createdTask.status === "open" && createdTask.conversationId === conversation.id);
  record("created task preserves tenant and context", createdTask.tenantId === tenantId && hasContext(createdTask, room));

  const customer360AfterCreate = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/customer-360`);
  const customerTaskAfterCreate = findTask(customer360AfterCreate, createdTask.id);
  record("Customer 360 refetch includes created persisted task", Boolean(customerTaskAfterCreate));
  record("Customer 360 task create context preserved", taskContextMatches(customerTaskAfterCreate, room, conversation.id));

  const updatedDueAt = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();
  const updatedTask = await requestJson("PATCH", `/tasks/${encodeURIComponent(createdTask.id)}`, {
    assigneeUserId: null,
    dueAt: updatedDueAt,
    status: "open"
  });
  record("updated task status/assignee/due through backend API", updatedTask.assigneeUserId === null && updatedTask.dueAt === updatedDueAt && updatedTask.status === "open");
  record("updated task preserves tenant and context", updatedTask.tenantId === tenantId && hasContext(updatedTask, room));

  const customer360AfterUpdate = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/customer-360`);
  const customerTaskAfterUpdate = findTask(customer360AfterUpdate, createdTask.id);
  record("Customer 360 task update persisted after refetch", customerTaskAfterUpdate?.assigneeUserId === null && customerTaskAfterUpdate?.dueAt === updatedDueAt);
  record("Customer 360 task update context preserved", taskContextMatches(customerTaskAfterUpdate, room, conversation.id));

  const completedTask = await requestJson("PATCH", `/tasks/${encodeURIComponent(createdTask.id)}/complete`);
  record("completed task through backend API", completedTask.status === "done" && Boolean(completedTask.completedAt));
  record("completed task preserves tenant and context", completedTask.tenantId === tenantId && hasContext(completedTask, room));

  const conversationTasks = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/tasks`);
  const refetchedConversationTask = conversationTasks.find((task) => task.id === createdTask.id);
  record("conversation tasks refetch confirms completion persisted", refetchedConversationTask?.status === "done");
  record("conversation tasks refetch preserves context", taskContextMatches(refetchedConversationTask, room, conversation.id));

  const dashboardTasks = await requestJson("GET", `/tasks?roomId=${encodeURIComponent(room.id)}&limit=50`);
  const dashboardTask = dashboardTasks.find((task) => task.id === createdTask.id);
  record("task dashboard cross-check includes persisted task", Boolean(dashboardTask));
  record("task dashboard row preserves context", taskContextMatches(dashboardTask, room, conversation.id));

  const customer360AfterComplete = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/customer-360`);
  const customerTaskAfterComplete = findTask(customer360AfterComplete, createdTask.id);
  record("Customer 360 task completion persisted after refetch", customerTaskAfterComplete?.status === "done");
  record("Customer 360 completed task context preserved", taskContextMatches(customerTaskAfterComplete, room, conversation.id));
  record("identity-safe linking keeps task conversation scoped", customer360AfterComplete.recentConversations.every((item) =>
    item.id !== conversation.id || (item.platform === room.platform && item.channelAccountId === room.channelAccountId && item.roomId === room.id)
  ));

  const auditLogs = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/audit-logs`);
  record("audit exists for Customer 360 task create/update/complete", ["task.created", "task.reminder_updated", "task.completed"].every((action) =>
    auditLogs.some((log) => log.action === action && log.metadataJson?.taskId === createdTask.id)
  ));
  record("audit logs preserve task/customer/conversation context", auditLogs.some((log) =>
    log.metadataJson?.taskId === createdTask.id &&
    log.metadataJson?.tenantId === tenantId &&
    log.metadataJson?.conversationId === conversation.id &&
    hasContext(log, room)
  ));
  record("audit logs are safe", noRawSecretFields(auditLogs));

  const invalidTenant = await request("GET", `/conversations/${encodeURIComponent(conversation.id)}/customer-360`, undefined, {
    "x-tenant-id": "00000000-0000-4000-8000-000000009999"
  });
  const invalidText = await invalidTenant.text();
  record("invalid/API failure returns API error", invalidTenant.status >= 400);
  record("invalid/API failure does not return mock fallback", !invalidText.includes("Anya Prom") && !invalidText.includes("Krit Market") && !invalidText.includes("ส่งราคา Business"));

  record("all task DTOs have no token/secret fields", noRawSecretFields({
    createdTask,
    updatedTask,
    completedTask,
    conversationTasks,
    dashboardTasks,
    customer360AfterCreate,
    customer360AfterUpdate,
    customer360AfterComplete
  }));
  record("externalCalls = 0", noNonzeroExternalCalls({
    createdTask,
    updatedTask,
    completedTask,
    conversationTasks,
    dashboardTasks,
    customer360AfterCreate,
    customer360AfterUpdate,
    customer360AfterComplete,
    auditLogs
  }));
  record("no provider outbound", !containsProviderOutbound({
    createdTask,
    updatedTask,
    completedTask,
    conversationTasks,
    dashboardTasks,
    customer360AfterComplete,
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

function findTask(customer360, taskId) {
  return Array.isArray(customer360?.tasks) ? customer360.tasks.find((task) => task.id === taskId) : null;
}

function finish() {
  const failed = results.filter((result) => !result.ok);
  console.log(JSON.stringify({ baseUrl, tenantId, results }, null, 2));
  if (failed.length > 0) {
    throw new Error(`Sprint 38 smoke failed: ${failed.map((item) => item.name).join(", ")}`);
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

function taskContextMatches(value, room, conversationId) {
  return Boolean(value && value.tenantId === tenantId && value.conversationId === conversationId && hasContext(value, room));
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
