import { pathToFileURL } from "node:url";

const baseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");
const tenantId = process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
const userId = process.env.USER_ID ?? "00000000-0000-4000-8000-000000000011";
const results = [];

async function main() {
  record("local API only", isLocalBaseUrl(baseUrl), baseUrl);

  const health = await request("GET", "/health");
  record("GET /health", health.status === 200);

  const initialTaskList = await requestJson("GET", "/tasks?status=open&limit=25");
  record("GET task list/dashboard endpoint", Array.isArray(initialTaskList));
  record("initial task dashboard rows are safe", noRawSecretFields(initialTaskList));

  const rooms = await requestJson("GET", "/rooms");
  const selected = await findConversation(rooms);
  record("safe persisted room/conversation selected", Boolean(selected?.room?.id && selected?.conversation?.id), selected?.conversation?.id ?? "");
  if (!selected) return finish();

  const { room, conversation } = selected;
  record("conversation preserves platform/account/room", conversation.platform === room.platform && conversation.channelAccountId === room.channelAccountId && conversation.roomId === room.id);

  const marker = `sprint35-${Date.now()}`;
  const taskTitle = `Sprint 35 dashboard task ${marker}`;
  const createdTask = await requestJson("POST", `/conversations/${encodeURIComponent(conversation.id)}/tasks`, {
    title: taskTitle,
    assigneeUserId: userId,
    dueAt: "2026-05-26T04:00:00.000Z"
  });
  record("created safe task through backend API", createdTask.title === taskTitle && createdTask.status === "open");
  record("created task preserves context", hasContext(createdTask, room));
  record("created task is safe", noRawSecretFields(createdTask));

  const openTasks = await requestJson("GET", `/tasks?status=open&roomId=${encodeURIComponent(room.id)}&limit=50`);
  const openDashboardTask = openTasks.find((task) => task.id === createdTask.id);
  record("open task appears in dashboard endpoint", openDashboardTask?.status === "open");
  record("open dashboard task preserves tenant and context", openDashboardTask?.tenantId === tenantId && hasContext(openDashboardTask, room) && openDashboardTask.conversationId === conversation.id);
  record("open dashboard task has assignee and due fields", openDashboardTask?.assigneeUserId === userId && Boolean(openDashboardTask?.dueAt));
  record("open dashboard task has externalCalls = 0", openDashboardTask?.externalCalls === 0);
  record("open dashboard task is safe", noRawSecretFields(openDashboardTask));

  const completedTask = await requestJson("PATCH", `/tasks/${encodeURIComponent(createdTask.id)}/complete`);
  record("completed task through backend API", completedTask.id === createdTask.id && completedTask.status === "done");
  record("completed task preserves context", hasContext(completedTask, room));
  record("completed task is safe", noRawSecretFields(completedTask));

  const completedTasks = await requestJson("GET", `/tasks?status=completed&roomId=${encodeURIComponent(room.id)}&limit=50`);
  const completedDashboardTask = completedTasks.find((task) => task.id === createdTask.id);
  record("refetch task dashboard confirms completed state persists", completedDashboardTask?.status === "done" && Boolean(completedDashboardTask.completedAt));
  record("completed dashboard task preserves tenant and context", completedDashboardTask?.tenantId === tenantId && hasContext(completedDashboardTask, room));
  record("completed dashboard task has no token/secret fields", noRawSecretFields(completedDashboardTask));
  record("completed dashboard externalCalls = 0", completedDashboardTask?.externalCalls === 0);

  const openAfterComplete = await requestJson("GET", `/tasks?status=open&roomId=${encodeURIComponent(room.id)}&limit=50`);
  record("completed task no longer appears in open dashboard", !openAfterComplete.some((task) => task.id === createdTask.id));

  const invalidTaskFilter = await request("GET", "/tasks?status=waiting");
  record("invalid task dashboard filter returns API error", invalidTaskFilter.status === 400);
  const invalidText = await invalidTaskFilter.text();
  record("invalid/API failure case does not return mock fallback", !invalidText.includes("Anya Prom") && !invalidText.includes("Krit Market") && !invalidText.includes("ส่งราคา Business"));

  record("externalCalls remain zero", noNonzeroExternalCalls({ initialTaskList, openTasks, completedTask, completedTasks }));
  record("no provider outbound", !containsProviderOutbound({ createdTask, openTasks, completedTask, completedTasks }));

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
    throw new Error(`Sprint 35 smoke failed: ${failed.map((item) => item.name).join(", ")}`);
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
