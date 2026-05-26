import { afterEach, describe, expect, it, vi } from "vitest";
import {
  assignConversation,
  closeConversation,
  completeConversationWorkflowTask,
  createContact,
  createConversationNote,
  createConversationWorkflowTask,
  createKnowledgeBase,
  createKnowledgeChunk,
  createKnowledgeDocument,
  deleteKnowledgeBase,
  createWebchatMessage,
  deleteKnowledgeChunk,
  deleteKnowledgeDocument,
  getConversationAuditLogs,
  getKnowledgeBases,
  getKnowledgeChunks,
  getKnowledgeDocuments,
  getConversationNotes,
  getConversationStatusHistory,
  getConversationTasks,
  getConversations,
  getContact,
  getContactConversations,
  getContactIdentities,
  getContacts,
  getCustomer360,
  getSettingsChannel,
  getSettingsCannedReply,
  getSettingsCannedReplies,
  getSettingsChannels,
  getSettingsSlaPolicies,
  getSettingsSlaPolicy,
  getSettingsTeam,
  getSettingsTeamMember,
  getTaskDashboard,
  getRoomAiPolicy,
  getRooms,
  linkContactIdentity,
  returnConversationToAi,
  sendAgentMessage,
  setConversationFollowUp,
  setPrimaryContactIdentity,
  markAiSuggestionWrong,
  suggestAiReply,
  takeOverConversation,
  unlinkContactIdentity,
  updateBroadcastConsent,
  updateContact,
  updateConversationPriority,
  updateConversationReadState,
  updateConversationSla,
  updateConversationStatus,
  updateConversationWorkflowTask,
  updateKnowledgeBase,
  updateKnowledgeChunk,
  updateKnowledgeDocument,
  updateRoomAiPolicy,
  updateSettingsChannel,
  updateSettingsCannedReply,
  updateSettingsSlaPolicy,
  updateSettingsTeamMember
} from "./api-client";

const defaultTenantId = "00000000-0000-4000-8000-000000000001";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("frontend API client", () => {
  it("maps API mode calls to the backend client endpoints", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse([
      {
        id: "room-webchat",
        platform: "webchat",
        platformLabel: "Webchat",
        accountName: "Main Website",
        roomName: "Main Website",
        accent: "#0d9488",
        conversationCount: 1
      }
    ]));

    const rooms = await getRooms();

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/rooms", expect.any(Object));
    expectTenantHeaderForAll(fetchMock);
    expect(rooms[0]?.accountName).toBe("Main Website");
  });

  it("validates conversations and keeps room filters explicit", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse([
      {
        id: "conv-web",
        roomId: "room-webchat",
        tab: "human",
        platform: "webchat",
        platformLabel: "Webchat",
        channelAccountId: "00000000-0000-4000-8000-000000000020",
        accountName: "Main Website",
        customerName: "Visitor Demo",
        customerEmail: "-",
        customerPhone: "-",
        lastMessage: "hello",
        lastMessageAt: "2026-05-21T04:00:00.000Z",
        lastMessageTime: "11:00",
        unreadCount: 1,
        assignedAgent: null,
        tags: [],
        aiStatus: "Need Human",
        priority: "medium",
        status: "open",
        unreplied: true
      }
    ]));

    const conversations = await getConversations("room-webchat", { tab: "human", filter: "need_human", search: "hello" });

    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("/rooms/room-webchat/conversations?tab=human&filter=need_human&search=hello");
    expectTenantHeaderForAll(fetchMock);
    expect(conversations[0]?.roomId).toBe("room-webchat");
  });

  it("serializes API-mode inbox search filters and pagination with the tenant header", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse([
      conversationResponse("conv-web")
    ]));

    await getConversations("room-webchat", {
      tab: "human",
      filter: "all",
      search: "pricing question",
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      status: "open",
      priority: "high",
      unread: "unread",
      slaStatus: "warning",
      sort: "updated_desc",
      limit: 25,
      offset: 50
    });

    const url = new URL(String(fetchMock.mock.calls[0]?.[0]));
    expect(url.pathname).toBe("/rooms/room-webchat/conversations");
    expect(url.searchParams.get("tab")).toBe("human");
    expect(url.searchParams.get("filter")).toBe("all");
    expect(url.searchParams.get("search")).toBe("pricing question");
    expect(url.searchParams.get("platform")).toBe("webchat");
    expect(url.searchParams.get("channelAccountId")).toBe("00000000-0000-4000-8000-000000000020");
    expect(url.searchParams.get("status")).toBe("open");
    expect(url.searchParams.get("priority")).toBe("high");
    expect(url.searchParams.get("unread")).toBe("true");
    expect(url.searchParams.get("slaStatus")).toBe("warning");
    expect(url.searchParams.get("sort")).toBe("updated_desc");
    expect(url.searchParams.get("limit")).toBe("25");
    expect(url.searchParams.get("offset")).toBe("50");
    expectTenantHeaderForAll(fetchMock);
  });

  it("surfaces inbox search API failures instead of returning mock conversations", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "search unavailable" }, 503));

    await expect(getConversations("room-webchat", { search: "impossible" }))
      .rejects.toThrow("API request failed (503): search unavailable");
  });

  it("creates sent_mock agent replies through the API", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({
      id: "msg-agent",
      conversationId: "conv-web",
      direction: "outbound",
      senderType: "agent",
      text: "รับเรื่องแล้วครับ",
      createdAt: "2026-05-21T04:01:00.000Z",
      platformMessageId: "internal-1",
      deliveryStatus: "queued_mock"
    }));

    const message = await sendAgentMessage("conv-web", "รับเรื่องแล้วครับ");

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/conv-web/messages", expect.objectContaining({ method: "POST" }));
    const init = fetchMock.mock.calls[0]?.[1];
    expect(init?.headers).toEqual(expect.objectContaining({ "x-tenant-id": defaultTenantId }));
    expect(JSON.parse(String(init?.body))).toEqual({ text: "รับเรื่องแล้วครับ", senderType: "agent" });
    expect(message.deliveryStatus).toBe("queued_mock");
    expectTenantHeaderForAll(fetchMock);
  });

  it("fetches Customer 360 data for API mode without using mock fallback", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse(customer360Response("conv-web", "contact-api")));

    const customer360 = await getCustomer360("conv-web");

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/conv-web/customer-360", expect.any(Object));
    expectTenantHeaderForAll(fetchMock);
    expect(customer360.contact.id).toBe("contact-api");
    expect(customer360.identities[0]?.externalUserId).toBe("visitor-api");
    expect(customer360.tasks[0]).toMatchObject({
      conversationId: "conv-web",
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      roomId: "room-webchat",
      externalCalls: 0
    });
    expect(customer360.broadcastHistorySummary.rows[0]).toMatchObject({
      campaignName: "Persisted campaign",
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      roomId: "room-webchat",
      externalCalls: 0
    });
    expect(JSON.stringify(customer360.broadcastHistorySummary)).not.toMatch(/accessToken|webhookSecret|botToken|apiKey|Bearer|sk-/i);
  });

  it("surfaces Customer 360 API errors instead of silently returning mock data", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "Conversation not found" }, 404));

    await expect(getCustomer360("missing")).rejects.toThrow("API request failed (404): Conversation not found");
  });

  it("refetches Customer 360 per selected conversation id", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(customer360Response("conv-web", "contact-web")))
      .mockResolvedValueOnce(jsonResponse(customer360Response("conv-telegram", "contact-telegram")));

    await getCustomer360("conv-web");
    await getCustomer360("conv-telegram");

    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("/conversations/conv-web/customer-360");
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain("/conversations/conv-telegram/customer-360");
    expectTenantHeaderForAll(fetchMock);
  });

  it("posts contact create, update, and identity requests to API endpoints", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(contactResponse("contact-created")))
      .mockResolvedValueOnce(jsonResponse({ ...contactResponse("contact-created"), displayName: "Updated API Contact" }))
      .mockResolvedValueOnce(jsonResponse(contactResponse("contact-created", "identity-linked")))
      .mockResolvedValueOnce(jsonResponse(contactResponse("contact-created", "identity-linked")))
      .mockResolvedValueOnce(jsonResponse(contactResponse("contact-created")));

    const created = await createContact({ displayName: "API Contact", leadStatus: "new", tags: [] });
    const updated = await updateContact("contact-created", { displayName: "Updated API Contact" });
    const linked = await linkContactIdentity("contact-created", {
      platform: "telegram",
      channelAccountId: "00000000-0000-4000-8000-000000000021",
      externalUserId: "tg-api-user",
      displayName: "TG API User"
    });
    const primary = await setPrimaryContactIdentity("contact-created", { identityId: "identity-linked" });
    const unlinked = await unlinkContactIdentity("contact-created", { identityId: "identity-linked" });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/contacts", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/contacts/contact-created", expect.objectContaining({ method: "PATCH" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/contacts/contact-created/identities/link", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/contacts/contact-created/primary-identity", expect.objectContaining({ method: "PATCH" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/contacts/contact-created/identities/unlink", expect.objectContaining({ method: "POST" }));
    expectTenantHeaderForAll(fetchMock);
    expect(created.id).toBe("contact-created");
    expect(updated.displayName).toBe("Updated API Contact");
    expect(linked.identities[0]?.id).toBe("identity-linked");
    expect(primary.id).toBe("contact-created");
    expect(unlinked.id).toBe("contact-created");
  });

  it("sends tenant-scoped broadcast opt-out updates to the API", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ ...contactResponse("contact-api"), optOutBroadcast: true, suppressedReason: "customer_requested" }));

    const contact = await updateBroadcastConsent("contact-api", { optOut: true, conversationId: "conv-web" });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/contacts/contact-api/broadcast-consent", expect.objectContaining({ method: "PATCH" }));
    const init = fetchMock.mock.calls[0]?.[1];
    expect(init?.headers).toEqual(expect.objectContaining({ "x-tenant-id": defaultTenantId }));
    expect(JSON.parse(String(init?.body))).toEqual({ optOut: true, conversationId: "conv-web" });
    expect(contact.optOutBroadcast).toBe(true);
    expectTenantHeaderForAll(fetchMock);
  });

  it("does not fake local opt-out state when broadcast consent API fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "Consent unavailable" }, 503));

    await expect(updateBroadcastConsent("contact-api", { optOut: true, conversationId: "conv-web" })).rejects.toThrow("API request failed (503): Consent unavailable");
  });

  it("gets contact directory endpoints with the tenant header", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse([contactResponse("contact-api")]))
      .mockResolvedValueOnce(jsonResponse(contactResponse("contact-api", "identity-detail")))
      .mockResolvedValueOnce(jsonResponse(contactResponse("contact-api", "identity-detail").identities))
      .mockResolvedValueOnce(jsonResponse([conversationResponse("conv-web")]));

    const contacts = await getContacts();
    const contact = await getContact("contact-api");
    const identities = await getContactIdentities("contact-api");
    const conversations = await getContactConversations("contact-api");

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/contacts", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/contacts/contact-api", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/contacts/contact-api/identities", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/contacts/contact-api/conversations", expect.any(Object));
    expectTenantHeaderForAll(fetchMock);
    expect(contacts[0]?.id).toBe("contact-api");
    expect(contact.identities[0]?.id).toBe("identity-detail");
    expect(identities[0]?.externalUserId).toBe("visitor-api");
    expect(conversations[0]).toMatchObject({
      roomId: "room-webchat",
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020"
    });
  });

  it("sends tenant headers for settings channels and team requests", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse([settingsChannelResponse("channel-web")]))
      .mockResolvedValueOnce(jsonResponse(settingsChannelResponse("channel-web")))
      .mockResolvedValueOnce(jsonResponse({ ...settingsChannelResponse("channel-web"), accountName: "Updated Website" }))
      .mockResolvedValueOnce(jsonResponse([settingsTeamResponse("agent-may")]))
      .mockResolvedValueOnce(jsonResponse(settingsTeamResponse("agent-may")))
      .mockResolvedValueOnce(jsonResponse({ ...settingsTeamResponse("agent-may"), name: "Updated May", displayName: "Updated May" }));

    const channels = await getSettingsChannels();
    const channel = await getSettingsChannel("channel-web");
    const updatedChannel = await updateSettingsChannel("channel-web", { accountName: "Updated Website" });
    const team = await getSettingsTeam();
    const member = await getSettingsTeamMember("agent-may");
    const updatedMember = await updateSettingsTeamMember("agent-may", { name: "Updated May", role: "supervisor" });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/settings/channels", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/settings/channels/channel-web", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/settings/channels/channel-web", expect.objectContaining({ method: "PATCH" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/settings/team", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/settings/team/agent-may", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/settings/team/agent-may", expect.objectContaining({ method: "PATCH" }));
    expectTenantHeaderForAll(fetchMock);
    expect(channels[0]?.id).toBe("channel-web");
    expect(channel.tokenMasked).toBe("configured:redacted");
    expect(updatedChannel.accountName).toBe("Updated Website");
    expect(team[0]?.id).toBe("agent-may");
    expect(member.email).toBe("may@example.local");
    expect(updatedMember.role).toBe("agent");
  });

  it("sends tenant headers for settings SLA policy requests", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse([settingsSlaPolicyResponse("sla-api")]))
      .mockResolvedValueOnce(jsonResponse(settingsSlaPolicyResponse("sla-api")))
      .mockResolvedValueOnce(jsonResponse({ ...settingsSlaPolicyResponse("sla-api"), firstResponseMinutes: 7 }));

    const policies = await getSettingsSlaPolicies();
    const policy = await getSettingsSlaPolicy("sla-api");
    const updated = await updateSettingsSlaPolicy("sla-api", { firstResponseMinutes: 7 });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/settings/sla-policies", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/settings/sla-policies/sla-api", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/settings/sla-policies/sla-api", expect.objectContaining({ method: "PATCH" }));
    expectTenantHeaderForAll(fetchMock);
    expect(policies[0]?.id).toBe("sla-api");
    expect(policy.priorityScope).toBe("urgent");
    expect(updated.firstResponseMinutes).toBe(7);
  });

  it("sends tenant headers for settings canned reply requests", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse([settingsCannedReplyResponse("reply-api")]))
      .mockResolvedValueOnce(jsonResponse(settingsCannedReplyResponse("reply-api")))
      .mockResolvedValueOnce(jsonResponse({ ...settingsCannedReplyResponse("reply-api"), bodyTemplate: "Updated persisted hello" }));

    const replies = await getSettingsCannedReplies();
    const reply = await getSettingsCannedReply("reply-api");
    const updated = await updateSettingsCannedReply("reply-api", { bodyTemplate: "Updated persisted hello" });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/settings/canned-replies", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/settings/canned-replies/reply-api", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/settings/canned-replies/reply-api", expect.objectContaining({ method: "PATCH" }));
    expectTenantHeaderForAll(fetchMock);
    expect(replies[0]?.shortcut).toBe("/hello");
    expect(reply.bodyTemplate).toBe("Persisted hello");
    expect(updated.bodyTemplate).toBe("Updated persisted hello");
  });

  it("posts Webchat inbound payloads to the webchat webhook endpoint", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({
      accepted: true,
      conversationId: "conv-web",
      messageId: "webchat-msg-1",
      duplicate: false
    }));

    const result = await createWebchatMessage({
      channelAccountId: "demo-webchat",
      visitorId: "visitor-demo",
      sessionId: "webchat-demo-session",
      messageId: "webchat-msg-1",
      text: "hello"
    });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/webhooks/webchat/demo-webchat", expect.objectContaining({ method: "POST" }));
    expectTenantHeaderForAll(fetchMock);
    expect(result.conversationId).toBe("conv-web");
  });

  it("persists internal notes and tasks through workflow API endpoints", async () => {
    const assigneeUserId = "00000000-0000-4000-8000-000000000011";
    const dueAt = "2026-05-22T04:00:00.000Z";
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse([internalNoteResponse("note-api")]))
      .mockResolvedValueOnce(jsonResponse(internalNoteResponse("note-new")))
      .mockResolvedValueOnce(jsonResponse([taskResponse("task-api")]))
      .mockResolvedValueOnce(jsonResponse({ ...taskResponse("task-new"), assigneeUserId, dueAt }))
      .mockResolvedValueOnce(jsonResponse({ ...taskResponse("task-new"), title: "Updated task", assigneeUserId: null, dueAt: null }))
      .mockResolvedValueOnce(jsonResponse({ ...taskResponse("task-new"), status: "done", completedAt: "2026-05-21T04:05:00.000Z" }));

    const notes = await getConversationNotes("conv-web");
    const note = await createConversationNote("conv-web", { body: "persist this", visibility: "team" });
    const tasks = await getConversationTasks("conv-web");
    const task = await createConversationWorkflowTask("conv-web", { title: "Follow up", assigneeUserId, dueAt });
    const updatedTask = await updateConversationWorkflowTask(task.id, { title: "Updated task", assigneeUserId: null, dueAt: null });
    const completed = await completeConversationWorkflowTask(task.id);

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/conv-web/notes", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/conv-web/tasks", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/tasks/task-new", expect.objectContaining({ method: "PATCH" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/tasks/task-new/complete", expect.objectContaining({ method: "PATCH" }));
    expectTenantHeaderForAll(fetchMock);
    expect(JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body))).toEqual({ body: "persist this", visibility: "team" });
    expect(JSON.parse(String(fetchMock.mock.calls[3]?.[1]?.body))).toEqual({ title: "Follow up", assigneeUserId, dueAt });
    expect(JSON.parse(String(fetchMock.mock.calls[4]?.[1]?.body))).toEqual({ title: "Updated task", assigneeUserId: null, dueAt: null });
    expect(notes[0]?.id).toBe("note-api");
    expect(note.id).toBe("note-new");
    expect(note).toMatchObject({
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      roomId: "room-webchat"
    });
    expect(tasks[0]?.id).toBe("task-api");
    expect(task).toMatchObject({
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      roomId: "room-webchat"
    });
    expect(updatedTask.title).toBe("Updated task");
    expect(updatedTask.assigneeUserId).toBeNull();
    expect(updatedTask.dueAt).toBeNull();
    expect(completed.status).toBe("done");
  });

  it("does not fake local note/task state when workflow API mutations fail", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ message: "Note unavailable" }, 503))
      .mockResolvedValueOnce(jsonResponse({ message: "Task unavailable" }, 503));

    await expect(createConversationNote("conv-web", { body: "do not fake", visibility: "team" }))
      .rejects.toThrow("API request failed (503): Note unavailable");
    await expect(createConversationWorkflowTask("conv-web", { title: "Do not fake" }))
      .rejects.toThrow("API request failed (503): Task unavailable");

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expectTenantHeaderForAll(fetchMock);
  });

  it("does not fake local task lifecycle state when task update APIs fail", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ message: "Task update unavailable" }, 503))
      .mockResolvedValueOnce(jsonResponse({ message: "Task complete unavailable" }, 503));

    await expect(updateConversationWorkflowTask("task-api", { status: "done" }))
      .rejects.toThrow("API request failed (503): Task update unavailable");
    await expect(completeConversationWorkflowTask("task-api"))
      .rejects.toThrow("API request failed (503): Task complete unavailable");

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/tasks/task-api", expect.objectContaining({ method: "PATCH" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/tasks/task-api/complete", expect.objectContaining({ method: "PATCH" }));
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expectTenantHeaderForAll(fetchMock);
  });

  it("loads API task dashboard rows with tenant and conversation context", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse([
      taskDashboardResponse("task-dashboard-open", "conv-web")
    ]));

    const rows = await getTaskDashboard({
      status: "open",
      due: "overdue",
      assigneeUserId: "00000000-0000-4000-8000-000000000011",
      roomId: "room-webchat",
      limit: 25,
      offset: 0
    });

    const url = new URL(String(fetchMock.mock.calls[0]?.[0]));
    expect(url.pathname).toBe("/tasks");
    expect(url.searchParams.get("status")).toBe("open");
    expect(url.searchParams.get("due")).toBe("overdue");
    expect(url.searchParams.get("assigneeUserId")).toBe("00000000-0000-4000-8000-000000000011");
    expect(url.searchParams.get("roomId")).toBe("room-webchat");
    expect(url.searchParams.get("limit")).toBe("25");
    expectTenantHeaderForAll(fetchMock);
    expect(rows[0]).toMatchObject({
      tenantId: defaultTenantId,
      conversationId: "conv-web",
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      roomId: "room-webchat",
      status: "open",
      externalCalls: 0
    });
    expect(JSON.stringify(rows)).not.toMatch(/accessToken|webhookSecret|botToken|apiKey|Bearer\s+[a-z0-9._-]+|(^|[^a-z])sk-[a-z0-9_-]{8,}/i);
  });

  it("sends tenant-scoped due-soon and follow-up task dashboard filters", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse([taskDashboardResponse("task-due-soon", "conv-web")]))
      .mockResolvedValueOnce(jsonResponse([taskDashboardResponse("task-follow-up", "conv-web")]));

    await getTaskDashboard({ due: "due_soon", roomId: "room-webchat" });
    await getTaskDashboard({ due: "follow_up", followUp: true, roomId: "room-webchat" });

    const dueSoonUrl = new URL(String(fetchMock.mock.calls[0]?.[0]));
    const followUpUrl = new URL(String(fetchMock.mock.calls[1]?.[0]));
    expect(dueSoonUrl.searchParams.get("due")).toBe("due_soon");
    expect(followUpUrl.searchParams.get("due")).toBe("follow_up");
    expect(followUpUrl.searchParams.get("followUp")).toBe("true");
    expectTenantHeaderForAll(fetchMock);
  });

  it("surfaces task dashboard API failures without returning local task rows", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "Tasks unavailable" }, 503));

    await expect(getTaskDashboard({ status: "open" })).rejects.toThrow("API request failed (503): Tasks unavailable");
  });

  it("persists assignment, takeover, return-to-AI, and follow-up without mock fallback", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ id: "conv-web", roomId: "room-webchat" }))
      .mockResolvedValueOnce(jsonResponse([conversationResponse("conv-web", "Human Taken")]))
      .mockResolvedValueOnce(jsonResponse({ id: "conv-web", roomId: "room-webchat" }))
      .mockResolvedValueOnce(jsonResponse([conversationResponse("conv-web", "Human Taken")]))
      .mockResolvedValueOnce(jsonResponse({ id: "conv-web", roomId: "room-webchat" }))
      .mockResolvedValueOnce(jsonResponse([conversationResponse("conv-web", "AI Active")]))
      .mockResolvedValueOnce(jsonResponse({ id: "conv-web", roomId: "room-webchat" }))
      .mockResolvedValueOnce(jsonResponse([conversationResponse("conv-web", "Human Taken", "follow_up")]));

    await assignConversation("conv-web", "00000000-0000-4000-8000-000000000011");
    await takeOverConversation("conv-web");
    const returnedToAi = await returnConversationToAi("conv-web");
    const followUp = await setConversationFollowUp("conv-web", { followUpAt: "2026-05-22T04:00:00.000Z" });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/conv-web/assign", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/conv-web/takeover", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/conv-web/return-to-ai", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/conv-web/follow-up", expect.objectContaining({ method: "POST" }));
    expectTenantHeaderForAll(fetchMock);
    expect(returnedToAi.aiStatus).toBe("AI Active");
    expect(followUp.status).toBe("follow_up");
  });

  it("does not refetch or synthesize local action state when an API conversation action fails", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "Conversation not found" }, 404));

    await expect(updateConversationPriority("missing", { priority: "high" })).rejects.toThrow("API request failed (404): Conversation not found");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/missing/priority", expect.objectContaining({ method: "PATCH" }));
    expectTenantHeaderForAll(fetchMock);
  });

  it("calls status, priority, read-state, SLA, close, audit, and status-history API endpoints", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ id: "conv-web", roomId: "room-webchat" }))
      .mockResolvedValueOnce(jsonResponse([conversationResponse("conv-web", "Closed", "closed")]))
      .mockResolvedValueOnce(jsonResponse({ id: "conv-web", roomId: "room-webchat" }))
      .mockResolvedValueOnce(jsonResponse([conversationResponse("conv-web", "Need Human", "open")]))
      .mockResolvedValueOnce(jsonResponse({ id: "conv-web", roomId: "room-webchat" }))
      .mockResolvedValueOnce(jsonResponse([conversationResponse("conv-web", "Need Human", "open")]))
      .mockResolvedValueOnce(jsonResponse({ id: "conv-web", roomId: "room-webchat" }))
      .mockResolvedValueOnce(jsonResponse([{ ...conversationResponse("conv-web", "Need Human", "open"), slaStatus: "warning", slaDueAt: "2026-05-21T04:30:00.000Z" }]))
      .mockResolvedValueOnce(jsonResponse({ id: "conv-web", roomId: "room-webchat" }))
      .mockResolvedValueOnce(jsonResponse([conversationResponse("conv-web", "Closed", "closed")]))
      .mockResolvedValueOnce(jsonResponse([auditLogResponse("audit-1")]))
      .mockResolvedValueOnce(jsonResponse([statusHistoryResponse("history-1")]));

    const status = await updateConversationStatus("conv-web", { status: "closed" });
    const priority = await updateConversationPriority("conv-web", { priority: "normal" });
    const readState = await updateConversationReadState("conv-web", { unread: false, unreplied: false });
    const sla = await updateConversationSla("conv-web", { slaStatus: "warning", slaDueAt: "2026-05-21T04:30:00.000Z" });
    const closed = await closeConversation("conv-web");
    const auditLogs = await getConversationAuditLogs("conv-web");
    const statusHistory = await getConversationStatusHistory("conv-web");

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/conv-web/status", expect.objectContaining({ method: "PATCH" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/conv-web/priority", expect.objectContaining({ method: "PATCH" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/conv-web/read-state", expect.objectContaining({ method: "PATCH" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/conv-web/sla", expect.objectContaining({ method: "PATCH" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/conv-web/close", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/conv-web/audit-logs", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/conv-web/status-history", expect.any(Object));
    expectTenantHeaderForAll(fetchMock);
    expect(status.status).toBe("closed");
    expect(priority.id).toBe("conv-web");
    expect(readState.id).toBe("conv-web");
    expect(sla.slaStatus).toBe("warning");
    expect(closed.status).toBe("closed");
    expect(auditLogs[0]?.action).toBe("conversation.status_updated");
    expect(statusHistory[0]?.toStatus).toBe("closed");
  });

  it("sends x-tenant-id when requesting conversation audit logs", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse([auditLogResponse("audit-tenant")]));

    await getConversationAuditLogs("conv-web");

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/conv-web/audit-logs", expect.any(Object));
    expect(fetchMock.mock.calls[0]?.[1]?.headers).toEqual(expect.objectContaining({ "x-tenant-id": defaultTenantId }));
  });

  it("sends x-tenant-id when requesting conversation status history", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse([statusHistoryResponse("history-tenant")]));

    await getConversationStatusHistory("conv-web");

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/conversations/conv-web/status-history", expect.any(Object));
    expect(fetchMock.mock.calls[0]?.[1]?.headers).toEqual(expect.objectContaining({ "x-tenant-id": defaultTenantId }));
  });

  it("surfaces audit log API failures without returning local mock audit data", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "Audit unavailable" }, 503));

    await expect(getConversationAuditLogs("conv-web")).rejects.toThrow("API request failed (503): Audit unavailable");
  });

  it("surfaces status-history API failures without returning local mock history data", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "History unavailable" }, 503));

    await expect(getConversationStatusHistory("conv-web")).rejects.toThrow("API request failed (503): History unavailable");
  });

  it("calls AI Center knowledge base, document, and chunk endpoints", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse([knowledgeBaseResponse("kb-api")]))
      .mockResolvedValueOnce(jsonResponse(knowledgeBaseResponse("kb-new")))
      .mockResolvedValueOnce(jsonResponse({ ...knowledgeBaseResponse("kb-new"), name: "Updated KB" }))
      .mockResolvedValueOnce(jsonResponse({ ...knowledgeBaseResponse("kb-new"), status: "archived" }))
      .mockResolvedValueOnce(jsonResponse([knowledgeDocumentResponse("doc-api", "kb-api")]))
      .mockResolvedValueOnce(jsonResponse(knowledgeDocumentResponse("doc-new", "kb-api")))
      .mockResolvedValueOnce(jsonResponse({ ...knowledgeDocumentResponse("doc-new", "kb-api"), title: "Updated Doc" }))
      .mockResolvedValueOnce(jsonResponse({ ...knowledgeDocumentResponse("doc-new", "kb-api"), status: "archived" }))
      .mockResolvedValueOnce(jsonResponse([knowledgeChunkResponse("chunk-api", "doc-api")]))
      .mockResolvedValueOnce(jsonResponse(knowledgeChunkResponse("chunk-new", "doc-api")))
      .mockResolvedValueOnce(jsonResponse({ ...knowledgeChunkResponse("chunk-new", "doc-api"), content: "Updated chunk" }))
      .mockResolvedValueOnce(jsonResponse({ id: "chunk-new", deleted: true }));

    const bases = await getKnowledgeBases();
    const createdBase = await createKnowledgeBase({ name: "New KB", description: "API", status: "draft" });
    const updatedBase = await updateKnowledgeBase(createdBase.id, { name: "Updated KB" });
    const archivedBase = await deleteKnowledgeBase(createdBase.id);
    const docs = await getKnowledgeDocuments("kb-api");
    const createdDoc = await createKnowledgeDocument("kb-api", { title: "New Doc", sourceType: "manual", status: "active" });
    const updatedDoc = await updateKnowledgeDocument(createdDoc.id, { title: "Updated Doc" });
    const archivedDoc = await deleteKnowledgeDocument(createdDoc.id);
    const chunks = await getKnowledgeChunks("doc-api");
    const createdChunk = await createKnowledgeChunk("doc-api", { content: "New chunk", metadataJson: { section: "demo" } });
    const updatedChunk = await updateKnowledgeChunk(createdChunk.id, { content: "Updated chunk" });
    const deletedChunk = await deleteKnowledgeChunk(createdChunk.id);

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/ai/knowledge-bases", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/ai/knowledge-bases", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/ai/knowledge-bases/kb-new", expect.objectContaining({ method: "PATCH" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/ai/knowledge-bases/kb-new", expect.objectContaining({ method: "DELETE" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/ai/knowledge-bases/kb-api/documents", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/ai/knowledge-bases/kb-api/documents", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/ai/documents/doc-new", expect.objectContaining({ method: "PATCH" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/ai/documents/doc-new", expect.objectContaining({ method: "DELETE" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/ai/documents/doc-api/chunks", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/ai/documents/doc-api/chunks", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/ai/chunks/chunk-new", expect.objectContaining({ method: "PATCH" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/ai/chunks/chunk-new", expect.objectContaining({ method: "DELETE" }));
    expectTenantHeaderForAll(fetchMock);
    expect(bases[0]?.name).toBe("API KB");
    expect(updatedBase.name).toBe("Updated KB");
    expect(archivedBase.status).toBe("archived");
    expect(docs[0]?.knowledgeBaseId).toBe("kb-api");
    expect(updatedDoc.title).toBe("Updated Doc");
    expect(archivedDoc.status).toBe("archived");
    expect(chunks[0]?.documentId).toBe("doc-api");
    expect(updatedChunk.content).toBe("Updated chunk");
    expect(deletedChunk.deleted).toBe(true);
  });

  it("gets and updates room AI policy through the API", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(roomAiPolicyResponse("room-webchat")))
      .mockResolvedValueOnce(jsonResponse({ ...roomAiPolicyResponse("room-webchat"), aiMode: "human_first", knowledgeBaseIds: ["kb-api"] }));

    const before = await getRoomAiPolicy("room-webchat");
    const after = await updateRoomAiPolicy("room-webchat", {
      aiMode: "human_first",
      autoReplyThreshold: 0.8,
      draftThreshold: 0.55,
      requireCitationsForAutoReply: true,
      handoffOnHighRisk: true,
      knowledgeBaseIds: ["kb-api"]
    });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/rooms/room-webchat/ai-policy", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/rooms/room-webchat/ai-policy", expect.objectContaining({ method: "PATCH" }));
    expectTenantHeaderForAll(fetchMock);
    expect(before.aiMode).toBe("suggest");
    expect(after.aiMode).toBe("human_first");
    expect(after.knowledgeBaseIds).toEqual(["kb-api"]);
  });

  it("sends x-tenant-id for AI suggested reply and feedback requests", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(aiSuggestionResponse("ai-run-1", "conv-web")))
      .mockResolvedValueOnce(jsonResponse(aiFeedbackResponse("feedback-1", "ai-run-1", "conv-web")));

    const suggestion = await suggestAiReply("conv-web");
    const feedback = await markAiSuggestionWrong(suggestion.suggestionId, { feedbackType: "mark_wrong" });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/ai/conversations/conv-web/suggest", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/ai/suggestions/ai-run-1/feedback", expect.objectContaining({ method: "POST" }));
    expectTenantHeaderForAll(fetchMock);
    expect(JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body))).toEqual({ feedbackType: "mark_wrong" });
    expect(suggestion).toMatchObject({
      suggestionId: "ai-run-1",
      conversationId: "conv-web",
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      roomId: "room-webchat",
      externalCalls: 0
    });
    expect(feedback.feedbackType).toBe("mark_wrong");
    expect(JSON.stringify(suggestion)).not.toMatch(/accessToken|webhookSecret|botToken|apiKey|Bearer|sk-/i);
  });

  it("surfaces AI suggestion API failures without returning mock suggestions", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "AI unavailable" }, 503));

    await expect(suggestAiReply("conv-web")).rejects.toThrow("API request failed (503): AI unavailable");
  });

  it("returns readable API errors", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({ message: "Conversation not found" }, 404));

    await expect(sendAgentMessage("missing", "hello")).rejects.toThrow("API request failed (404): Conversation not found");
  });
});

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    text: async () => JSON.stringify(body)
  } as Response;
}

function expectTenantHeaderForAll(fetchMock: { mock: { calls: Array<[unknown, RequestInit?]> } }) {
  for (const [, init] of fetchMock.mock.calls) {
    expect(init).toEqual(expect.objectContaining({
      headers: expect.objectContaining({ "x-tenant-id": defaultTenantId })
    }));
  }
}

function contactResponse(id: string, identityId = "identity-api") {
  return {
    id,
    displayName: "API Contact",
    phone: "000",
    email: "api@example.local",
    leadStatus: "new",
    ownerAgent: "Demo",
    tags: [],
    customFields: {},
    identities: [{
      id: identityId,
      contactId: id,
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      accountName: "Main Website",
      externalUserId: "visitor-api",
      displayName: "Visitor API",
      isPrimary: true,
      lastSeenAt: "2026-05-21T04:00:00.000Z"
    }],
    notes: [],
    tasks: [],
    optOutBroadcast: false,
    createdAt: "2026-05-21T04:00:00.000Z",
    updatedAt: "2026-05-21T04:00:00.000Z"
  };
}

function settingsChannelResponse(id: string) {
  return {
    id,
    platform: "webchat",
    accountName: "Main Website",
    accountKey: "demo-webchat",
    status: "active",
    webhookUrl: "http://localhost:4000/webhooks/webchat/demo-webchat",
    createdAt: "2026-05-21T04:00:00.000Z",
    updatedAt: "2026-05-21T04:00:00.000Z",
    lastInboundAt: "2026-05-21T04:10:00.000Z",
    lastMessageAt: "2026-05-21T04:12:00.000Z",
    hasAccessToken: true,
    tokenMasked: "configured:redacted",
    secretConfigured: true,
    secretMasked: "configured:redacted"
  };
}

function settingsTeamResponse(id: string) {
  return {
    id,
    name: "May",
    displayName: "May",
    role: "agent",
    email: "may@example.local",
    status: "online",
    skills: ["support", "omnichannel"],
    maxConcurrentChats: 6,
    createdAt: "2026-05-21T04:00:00.000Z",
    updatedAt: "2026-05-21T04:00:00.000Z"
  };
}

function settingsSlaPolicyResponse(id: string) {
  return {
    id,
    name: "Urgent priority",
    description: "Persisted SLA",
    status: "active",
    priorityScope: "urgent",
    firstResponseMinutes: 5,
    resolutionMinutes: 120,
    businessHoursMode: "always",
    escalationRole: "admin",
    createdAt: "2026-05-21T04:00:00.000Z",
    updatedAt: "2026-05-21T04:00:00.000Z"
  };
}

function settingsCannedReplyResponse(id: string) {
  return {
    id,
    title: "Greeting",
    category: "general",
    shortcut: "/hello",
    bodyTemplate: "Persisted hello",
    tags: ["hello"],
    platformScope: [],
    roomScope: [],
    status: "active",
    createdAt: "2026-05-21T04:00:00.000Z",
    updatedAt: "2026-05-21T04:00:00.000Z"
  };
}

function customer360Response(conversationId: string, contactId: string) {
  return {
    selectedConversationId: conversationId,
    contact: contactResponse(contactId),
    owner: "Demo",
    priority: "medium",
    status: "open",
    identities: contactResponse(contactId).identities,
    recentConversations: [{
      id: conversationId,
      roomId: "room-webchat",
      tab: "human",
      platform: "webchat",
      platformLabel: "Webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      accountName: "Main Website",
      customerName: "API Contact",
      customerEmail: "api@example.local",
      customerPhone: "000",
      lastMessage: "hello",
      lastMessageAt: "2026-05-21T04:00:00.000Z",
      lastMessageTime: "11:00",
      unreadCount: 1,
      assignedAgent: null,
      tags: [],
      aiStatus: "Need Human",
      priority: "medium",
      status: "open",
      unreplied: true
    }],
    notes: [],
    tasks: [contactTaskResponse("task-customer-360", conversationId, contactId)],
    broadcastHistorySummary: {
      contactId,
      customerId: contactId,
      identityId: "identity-api",
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      roomId: "room-webchat",
      conversationId,
      lastCampaignId: "campaign-api",
      lastCampaignName: "Persisted campaign",
      sentMockCount: 1,
      optOut: false,
      externalCalls: 0,
      rows: [{
        id: "send-log-api",
        contactId,
        customerId: contactId,
        identityId: "identity-api",
        campaignId: "campaign-api",
        campaignName: "Persisted campaign",
        campaignStatus: "sent",
        platform: "webchat",
        channelAccountId: "00000000-0000-4000-8000-000000000020",
        roomId: "room-webchat",
        conversationId,
        status: "sent_mock",
        reason: "safe mock send only; no external outbound call was made",
        sentAt: "2026-05-21T04:00:00.000Z",
        queuedAt: null,
        mockOnly: true,
        safe: true,
        externalCalls: 0
      }]
    },
    source: {
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      accountName: "Main Website",
      externalUserId: "visitor-api",
      displayName: "Visitor API"
    }
  };
}

function contactTaskResponse(id: string, conversationId: string, contactId: string) {
  return {
    id,
    tenantId: defaultTenantId,
    conversationId,
    contactId,
    platform: "webchat",
    channelAccountId: "00000000-0000-4000-8000-000000000020",
    roomId: "room-webchat",
    title: "Customer 360 persisted task",
    status: "open",
    assigneeUserId: null,
    dueAt: null,
    completedAt: null,
    createdAt: "2026-05-21T04:00:00.000Z",
    updatedAt: "2026-05-21T04:00:00.000Z",
    externalCalls: 0
  };
}

function conversationResponse(id: string, aiStatus = "Need Human", status = "open") {
  return {
    id,
    roomId: "room-webchat",
    tab: aiStatus === "AI Active" ? "bot" : "human",
    platform: "webchat",
    platformLabel: "Webchat",
    channelAccountId: "00000000-0000-4000-8000-000000000020",
    accountName: "Main Website",
    customerName: "API Contact",
    customerEmail: "api@example.local",
    customerPhone: "000",
    lastMessage: "hello",
    lastMessageAt: "2026-05-21T04:00:00.000Z",
    lastMessageTime: "11:00",
    unreadCount: 1,
    assignedAgent: "May",
    tags: [],
    aiStatus,
    priority: "medium",
    status,
    unreplied: true,
    followUpAt: status === "follow_up" ? "2026-05-22T04:00:00.000Z" : undefined
  };
}

function internalNoteResponse(id: string) {
  return {
    id,
    conversationId: "conv-web",
    contactId: "contact-api",
    platform: "webchat",
    channelAccountId: "00000000-0000-4000-8000-000000000020",
    roomId: "room-webchat",
    body: "persist this",
    visibility: "team",
    createdBy: "00000000-0000-4000-8000-000000000011",
    createdAt: "2026-05-21T04:00:00.000Z",
    updatedAt: "2026-05-21T04:00:00.000Z",
    pinned: false
  };
}

function taskResponse(id: string) {
  return {
    id,
    tenantId: defaultTenantId,
    conversationId: "conv-web",
    contactId: "contact-api",
    platform: "webchat",
    channelAccountId: "00000000-0000-4000-8000-000000000020",
    roomId: "room-webchat",
    title: "Follow up",
    status: "open",
    assigneeUserId: null,
    createdByUserId: "00000000-0000-4000-8000-000000000011",
    dueAt: null,
    completedAt: null,
    createdAt: "2026-05-21T04:00:00.000Z",
    updatedAt: "2026-05-21T04:00:00.000Z",
    externalCalls: 0
  };
}

function taskDashboardResponse(id: string, conversationId: string) {
  return {
    ...taskResponse(id),
    conversationId,
    conversationTab: "human",
    conversationStatus: "open",
    conversationPriority: "medium",
    customerName: "API Contact",
    assignedAgentName: "May",
    accountName: "Main Website",
    platformLabel: "Webchat",
    lastMessageAt: "2026-05-21T04:00:00.000Z"
  };
}

function auditLogResponse(id: string) {
  return {
    id,
    tenantId: "00000000-0000-4000-8000-000000000001",
    conversationId: "conv-web",
    platform: "webchat",
    channelAccountId: "00000000-0000-4000-8000-000000000020",
    roomId: "room-webchat",
    actorUserId: "00000000-0000-4000-8000-000000000011",
    action: "conversation.status_updated",
    beforeJson: { status: "open" },
    afterJson: { status: "closed" },
    metadataJson: {
      fromStatus: "open",
      toStatus: "closed",
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      roomId: "room-webchat"
    },
    createdAt: "2026-05-21T04:00:00.000Z"
  };
}

function statusHistoryResponse(id: string) {
  return {
    id,
    tenantId: "00000000-0000-4000-8000-000000000001",
    conversationId: "conv-web",
    platform: "webchat",
    channelAccountId: "00000000-0000-4000-8000-000000000020",
    roomId: "room-webchat",
    actorUserId: "00000000-0000-4000-8000-000000000011",
    fromStatus: "open",
    toStatus: "closed",
    metadataJson: {
      source: "status_endpoint",
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      roomId: "room-webchat"
    },
    createdAt: "2026-05-21T04:00:00.000Z"
  };
}

function knowledgeBaseResponse(id: string) {
  return {
    id,
    tenantId: "00000000-0000-4000-8000-000000000001",
    name: id === "kb-api" ? "API KB" : "New KB",
    description: "Knowledge from API",
    status: "active",
    documentCount: 1,
    updatedAt: "2026-05-21T04:00:00.000Z"
  };
}

function knowledgeDocumentResponse(id: string, knowledgeBaseId: string) {
  return {
    id,
    tenantId: "00000000-0000-4000-8000-000000000001",
    knowledgeBaseId,
    title: id === "doc-api" ? "API Doc" : "New Doc",
    sourceType: "manual",
    sourceUrl: null,
    status: "active",
    createdAt: "2026-05-21T04:00:00.000Z",
    updatedAt: "2026-05-21T04:00:00.000Z"
  };
}

function knowledgeChunkResponse(id: string, documentId: string) {
  return {
    id,
    tenantId: "00000000-0000-4000-8000-000000000001",
    documentId,
    content: id === "chunk-api" ? "API chunk" : "New chunk",
    metadataJson: { section: "demo" },
    createdAt: "2026-05-21T04:00:00.000Z",
    updatedAt: "2026-05-21T04:00:00.000Z"
  };
}

function roomAiPolicyResponse(roomId: string) {
  return {
    roomId,
    aiMode: "suggest",
    autoReplyThreshold: 0.85,
    draftThreshold: 0.6,
    requireCitationsForAutoReply: true,
    handoffOnHighRisk: true,
    knowledgeBaseIds: [],
    updatedAt: "2026-05-21T04:00:00.000Z"
  };
}

function aiSuggestionResponse(id: string, conversationId: string) {
  return {
    suggestionId: id,
    aiRunId: id,
    tenantId: "00000000-0000-4000-8000-000000000001",
    conversationId,
    platform: "webchat",
    channelAccountId: "00000000-0000-4000-8000-000000000020",
    roomId: "room-webchat",
    summary: "Customer asks for pricing.",
    suggestedReply: "ราคาเริ่มต้นตามแพ็กเกจครับ",
    intent: "pricing",
    confidence: 0.9,
    riskLevel: "low",
    nextAction: "suggest_reply",
    requiresHuman: false,
    sources: [{
      id: "doc-price",
      title: "Pricing FAQ",
      category: "price_rules",
      matchReason: "Matched keywords: price",
      sourceType: "knowledge_doc",
      sourceUrl: null
    }],
    status: "completed",
    error: null,
    externalCalls: 0,
    generatedAt: "2026-05-21T04:00:00.000Z"
  };
}

function aiFeedbackResponse(id: string, suggestionId: string, conversationId: string) {
  return {
    feedbackId: id,
    suggestionId,
    aiRunId: suggestionId,
    tenantId: "00000000-0000-4000-8000-000000000001",
    conversationId,
    platform: "webchat",
    channelAccountId: "00000000-0000-4000-8000-000000000020",
    roomId: "room-webchat",
    feedbackType: "mark_wrong",
    actionType: "feedback.mark_wrong",
    externalCalls: 0,
    createdAt: "2026-05-21T04:00:00.000Z"
  };
}
