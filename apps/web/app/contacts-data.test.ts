import { describe, expect, it, vi, beforeEach } from "vitest";
import { loadContactsDirectoryData } from "./contacts-data";
import { mockContacts } from "./crm-data";

const api = vi.hoisted(() => ({
  getContacts: vi.fn(),
  getContact: vi.fn(),
  getContactConversations: vi.fn()
}));

vi.mock("./api-client", () => ({
  getContacts: api.getContacts,
  getContact: api.getContact,
  getContactConversations: api.getContactConversations
}));

beforeEach(() => {
  api.getContacts.mockReset();
  api.getContact.mockReset();
  api.getContactConversations.mockReset();
});

describe("contacts directory data loader", () => {
  it("loads persisted contacts, selected detail, identities, and conversations in API mode", async () => {
    api.getContacts.mockResolvedValueOnce([contactResponse("contact-api", "List Name")]);
    api.getContact.mockResolvedValueOnce(contactResponse("contact-api", "Persisted Contact", "identity-api"));
    api.getContactConversations.mockResolvedValueOnce([{
      id: "conv-web",
      roomId: "room-webchat",
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      platformLabel: "Webchat",
      accountName: "Main Website",
      customerName: "Persisted Contact",
      customerEmail: "api@example.local",
      customerPhone: "000",
      lastMessage: "hello",
      lastMessageAt: "2026-05-21T04:00:00.000Z",
      lastMessageTime: "11:00",
      unreadCount: 0,
      assignedAgent: null,
      tags: [],
      aiStatus: "Need Human",
      priority: "medium",
      status: "open",
      unreplied: false
    }]);

    const data = await loadContactsDirectoryData("api", "contact-api");

    expect(api.getContacts).toHaveBeenCalled();
    expect(api.getContact).toHaveBeenCalledWith("contact-api");
    expect(data.selectedContact?.displayName).toBe("Persisted Contact");
    expect(data.selectedContact?.identities[0]?.externalUserId).toBe("visitor-api");
    expect(data.contacts[0]?.displayName).toBe("Persisted Contact");
    expect(data.relatedConversations[0]).toMatchObject({
      id: "conv-web",
      roomId: "room-webchat",
      platform: "webchat",
      channelAccountId: "00000000-0000-4000-8000-000000000020",
      accountName: "Main Website"
    });
  });

  it("accepts Demo LINE Member style contact conversations with account separation fields", async () => {
    api.getContacts.mockResolvedValueOnce([lineContactResponse()]);
    api.getContact.mockResolvedValueOnce(lineContactResponse());
    api.getContactConversations.mockResolvedValueOnce([{
      id: "00000000-0000-4000-8000-000000000206",
      roomId: "682ba6aa-901c-4617-af0f-78acc601615b",
      tab: "human",
      platform: "line",
      platformLabel: "LINE",
      channelAccountId: "00000000-0000-4000-8000-000000000022",
      accountName: "LINE OA Main",
      customerName: "Demo LINE Member",
      customerEmail: "-",
      customerPhone: "-",
      lastMessage: "line hello",
      lastMessageAt: "2026-05-21T04:00:00.000Z",
      lastMessageTime: "11:00",
      unreadCount: 1,
      assignedAgent: null,
      tags: [],
      aiStatus: "Need Human",
      priority: "medium",
      status: "open",
      unreplied: true
    }]);

    const data = await loadContactsDirectoryData("api", "00000000-0000-4000-8000-000000000106");

    expect(data.selectedContact?.displayName).toBe("Demo LINE Member");
    expect(data.selectedContact?.identities[0]).toMatchObject({
      platform: "line",
      channelAccountId: "00000000-0000-4000-8000-000000000022",
      accountName: "LINE OA Main"
    });
    expect(data.relatedConversations[0]).toMatchObject({
      id: "00000000-0000-4000-8000-000000000206",
      roomId: "682ba6aa-901c-4617-af0f-78acc601615b",
      platform: "line",
      channelAccountId: "00000000-0000-4000-8000-000000000022",
      accountName: "LINE OA Main"
    });
  });

  it("does not return mock contacts when API mode fails", async () => {
    api.getContacts.mockRejectedValueOnce(new Error("API request failed (503): offline"));

    await expect(loadContactsDirectoryData("api")).rejects.toThrow("offline");
    expect(api.getContact).not.toHaveBeenCalled();
  });

  it("rejects invalid API conversation responses without loading mock contacts", async () => {
    api.getContacts.mockResolvedValueOnce([contactResponse("contact-api", "List Name")]);
    api.getContact.mockResolvedValueOnce(contactResponse("contact-api", "Persisted Contact", "identity-api"));
    api.getContactConversations.mockRejectedValueOnce(new Error("API response shape is invalid for /contacts/contact-api/conversations"));

    await expect(loadContactsDirectoryData("api", "contact-api")).rejects.toThrow("/contacts/contact-api/conversations");
    expect(api.getContacts).toHaveBeenCalled();
    expect(api.getContactConversations).toHaveBeenCalledWith("contact-api");
  });

  it("keeps mock/local contacts mode backed by stored CRM data", async () => {
    const data = await loadContactsDirectoryData("mock", "contact-krit");

    expect(data.selectedContact?.id).toBe("contact-krit");
    expect(data.contacts).toEqual(mockContacts);
    expect(data.relatedConversations.every((conversation) => conversation.roomId)).toBe(true);
  });
});

function contactResponse(id: string, displayName: string, identityId = "identity-list") {
  return {
    id,
    displayName,
    phone: "000",
    email: "api@example.local",
    leadStatus: "new",
    ownerAgent: "Demo",
    tags: ["persisted"],
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

function lineContactResponse() {
  return {
    ...contactResponse("00000000-0000-4000-8000-000000000106", "Demo LINE Member", "identity-line"),
    identities: [{
      id: "identity-line",
      contactId: "00000000-0000-4000-8000-000000000106",
      platform: "line",
      channelAccountId: "00000000-0000-4000-8000-000000000022",
      accountName: "LINE OA Main",
      externalUserId: "U-demo-line",
      displayName: "Demo LINE Member",
      isPrimary: true,
      lastSeenAt: "2026-05-21T04:00:00.000Z"
    }]
  };
}
