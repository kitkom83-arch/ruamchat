const baseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");
const tenantId = process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
const userId = process.env.USER_ID ?? "00000000-0000-4000-8000-000000000011";
const mockSendStatuses = new Set(["queued_mock", "sent_mock", "skipped_mock", "failed_mock"]);

const results = [];

async function main() {
  const health = await request("GET", "/health");
  record("GET /health", health.status === 200);

  const rooms = await requestJson("GET", "/rooms");
  record("GET /rooms", Array.isArray(rooms));

  let conversations = [];
  const room = Array.isArray(rooms) ? rooms[0] : null;
  if (room?.id) {
    conversations = await requestJson("GET", `/rooms/${encodeURIComponent(room.id)}/conversations?tab=human&filter=all`);
    if (Array.isArray(conversations) && conversations.length === 0) {
      conversations = await requestJson("GET", `/rooms/${encodeURIComponent(room.id)}/conversations?tab=bot&filter=all`);
    }
    record("GET room conversations", Array.isArray(conversations));
  } else {
    record("GET room conversations", true, "skipped; no rooms returned");
  }

  const conversation = Array.isArray(conversations) ? conversations[0] : null;
  if (conversation?.id) {
    const messages = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/messages`);
    const customer360 = await requestJson("GET", `/conversations/${encodeURIComponent(conversation.id)}/customer-360`);
    record("GET conversation messages", Array.isArray(messages));
    record("GET customer-360", customer360?.selectedConversationId === conversation.id);
  } else {
    record("GET conversation messages", true, "skipped; no persisted conversation returned");
    record("GET customer-360", true, "skipped; no persisted conversation returned");
  }

  const analytics = await requestJson("GET", "/analytics/overview");
  record("GET analytics overview", typeof analytics?.totalConversations === "number");

  const knowledgeBases = await requestJson("GET", "/ai/knowledge-bases");
  record("GET AI knowledge bases", Array.isArray(knowledgeBases));

  const flows = await requestJson("GET", "/flows");
  record("GET flows", Array.isArray(flows));
  const flow = Array.isArray(flows) ? flows.find((item) => item?.id && item?.status !== "archived") ?? flows[0] : null;
  if (flow?.id) {
    const flowRuns = await requestJson("GET", `/flows/${encodeURIComponent(flow.id)}/runs`);
    record("GET flow runs", Array.isArray(flowRuns));
    const dryRun = await requestJson("POST", `/flows/${encodeURIComponent(flow.id)}/test-run`, {
      conversationId: conversation?.id ?? null,
      contactId: null,
      message: "safe smoke dry run",
      platform: room?.platform ?? "webchat",
      roomId: room?.id ?? "",
      triggerType: flow.triggerType ?? flow.trigger?.type ?? "manual_test",
      businessHours: true
    });
    record("POST flow test-run safe", Array.isArray(dryRun?.state?.externalCalls) && dryRun.state.externalCalls.length === 0);
  } else {
    record("GET flow runs", true, "skipped; no flows returned");
    record("POST flow test-run safe", true, "skipped; no flows returned");
  }

  const campaigns = await requestJson("GET", "/broadcasts/campaigns");
  const segments = await requestJson("GET", "/broadcasts/segments");
  record("GET broadcasts campaigns", Array.isArray(campaigns));
  record("GET broadcasts segments", Array.isArray(segments));

  const campaign = Array.isArray(campaigns) ? campaigns.find((item) => item?.id && item?.status !== "archived") ?? campaigns[0] : null;
  if (campaign?.id) {
    const preview = await requestJson("POST", `/broadcasts/campaigns/${encodeURIComponent(campaign.id)}/audience-preview`, {
      platform: campaign.channelPlatform ?? campaign.platformScope?.[0] ?? "webchat",
      channelAccountId: campaign.channelAccountId ?? null
    });
    record("POST broadcasts audience-preview", Array.isArray(preview?.recipients));

    const sendTest = await requestJson("POST", `/broadcasts/campaigns/${encodeURIComponent(campaign.id)}/send-test`, {
      platform: campaign.channelPlatform ?? campaign.platformScope?.[0] ?? "webchat",
      payloadJson: { source: "sprint21-smoke", safeMockOnly: true }
    });
    record("POST broadcasts send-test mock-only", isMockOnlySendResult(sendTest));

    const logs = await requestJson("GET", `/broadcasts/campaigns/${encodeURIComponent(campaign.id)}/send-logs`);
    record("GET broadcasts send-logs", Array.isArray(logs) && logs.every((log) => mockSendStatuses.has(log.status)));
  } else {
    record("POST broadcasts audience-preview", true, "skipped; no campaigns returned");
    record("POST broadcasts send-test mock-only", true, "skipped; no campaigns returned");
    record("GET broadcasts send-logs", true, "skipped; no campaigns returned");
  }

  const failed = results.filter((result) => !result.ok);
  console.log(JSON.stringify({ baseUrl, tenantId, results }, null, 2));
  if (failed.length > 0) {
    throw new Error(`Sprint 21 smoke failed: ${failed.map((item) => item.name).join(", ")}`);
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

function isMockOnlySendResult(value) {
  return (
    value &&
    Array.isArray(value.externalCalls) &&
    value.externalCalls.length === 0 &&
    Array.isArray(value.logs) &&
    value.logs.every((log) => mockSendStatuses.has(log.status))
  );
}

function record(name, ok, detail = "") {
  results.push({ name, ok: Boolean(ok), detail });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
