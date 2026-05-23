import { describe, expect, it } from "vitest";
import {
  addContactNote,
  addContactTag,
  createContactTask,
  filterContacts,
  getContactConversations,
  ignoreMergeSuggestion,
  linkIdentityToContact,
  markContactTaskDone,
  mockContacts,
  removeContactTag,
  setPrimaryIdentity,
  suggestContactMerges,
  unlinkIdentity
} from "./crm-data";
import { mockConversations } from "./inbox-data";

describe("CRM mock store", () => {
  it("allows one customer to have multiple identities and each identity belongs to one contact", () => {
    const krit = mockContacts.find((contact) => contact.id === "contact-krit");

    expect(krit?.identities).toHaveLength(2);
    expect(new Set(krit?.identities.map((identity) => identity.contactId)).size).toBe(1);
  });

  it("sets primary identity without moving conversations", () => {
    const next = setPrimaryIdentity(mockContacts, "contact-krit", "identity-krit-facebook");
    const krit = next.find((contact) => contact.id === "contact-krit");
    const conversations = getContactConversations(krit!, mockConversations);

    expect(krit?.identities.find((identity) => identity.id === "identity-krit-facebook")?.isPrimary).toBe(true);
    expect(conversations.some((conversation) => conversation.roomId === "telegram-bot-007237")).toBe(true);
  });

  it("unlinks identity without deleting or merging conversations", () => {
    const next = unlinkIdentity(mockContacts, "contact-mint", "identity-mint-line");
    const mint = next.find((contact) => contact.id === "contact-mint");

    expect(mint?.identities.some((identity) => identity.id === "identity-mint-line")).toBe(false);
    expect(mockConversations.some((conversation) => conversation.roomId === "line-oa-main")).toBe(true);
  });

  it("keeps linked identity conversations separated by platform room", () => {
    const mint = mockContacts.find((contact) => contact.id === "contact-mint")!;
    const conversations = getContactConversations(mint, mockConversations);

    expect(conversations.map((conversation) => conversation.roomId).sort()).toEqual(["instagram-shop"]);
    expect(conversations.every((conversation) => ["instagram-shop", "line-oa-main"].includes(conversation.roomId))).toBe(true);
  });

  it("does not merge platform conversations into a single thread", () => {
    const krit = mockContacts.find((contact) => contact.id === "contact-krit")!;
    const conversations = getContactConversations(krit, mockConversations);

    expect(new Set(conversations.map((conversation) => conversation.roomId)).size).toBe(conversations.length);
    expect(conversations.every((conversation) => conversation.messages.length > 0)).toBe(true);
  });

  it("creates merge suggestions by email/phone with higher confidence than display name", () => {
    const duplicateByPhone = { ...mockContacts[0], id: "contact-phone-dupe", displayName: "Different Name" };
    const duplicateByName = { ...mockContacts[0], id: "contact-name-dupe", phone: "000", email: "name@example.com" };
    const source = { ...mockContacts[0], id: "contact-source" };
    const suggestions = suggestContactMerges([source, duplicateByPhone, duplicateByName], source);

    expect(suggestions.some((suggestion) => suggestion.reason === "phone matches")).toBe(true);
    expect(suggestions.find((suggestion) => suggestion.reason === "display name matches")?.confidence).toBeLessThan(
      suggestions.find((suggestion) => suggestion.reason === "phone matches")?.confidence ?? 0
    );
  });

  it("ignores merge suggestion without linking automatically", () => {
    const suggestions = suggestContactMerges([mockContacts[0], { ...mockContacts[0], id: "contact-copy" }], mockContacts[0]);
    const ignored = ignoreMergeSuggestion(suggestions, suggestions[0]!.id);

    expect(ignored[0]?.ignored).toBe(true);
    expect(mockContacts[0].identities).toHaveLength(1);
  });

  it("adds notes without creating customer messages", () => {
    const beforeMessages = mockConversations.flatMap((conversation) => conversation.messages).length;
    const next = addContactNote(mockContacts, "contact-anya", "Internal note only");
    const anya = next.find((contact) => contact.id === "contact-anya");

    expect(anya?.notes[0]?.body).toBe("Internal note only");
    expect(mockConversations.flatMap((conversation) => conversation.messages)).toHaveLength(beforeMessages);
  });

  it("creates and completes contact tasks", () => {
    const withTask = createContactTask(mockContacts, "contact-anya", "Call customer");
    const task = withTask.find((contact) => contact.id === "contact-anya")?.tasks[0];
    const done = markContactTaskDone(withTask, "contact-anya", task!.id);

    expect(task?.status).toBe("open");
    expect(done.find((contact) => contact.id === "contact-anya")?.tasks[0]?.status).toBe("done");
  });

  it("filters contacts by search, platform, lead status, owner, and tag", () => {
    expect(filterContacts(mockContacts, { search: "mint" })[0]?.id).toBe("contact-mint");
    expect(filterContacts(mockContacts, { platform: "facebook" }).map((contact) => contact.id)).toEqual(["contact-june", "contact-krit"]);
    expect(filterContacts(mockContacts, { leadStatus: "qualified" })[0]?.id).toBe("contact-anya");
    expect(filterContacts(mockContacts, { ownerAgent: "May" }).map((contact) => contact.id)).toEqual(["contact-anya", "contact-krit"]);
    expect(filterContacts(mockContacts, { tag: "wholesale" })[0]?.id).toBe("contact-mint");
  });

  it("syncs tag updates for Customer 360 data", () => {
    const withTag = addContactTag(mockContacts, "contact-anya", "vip");
    const withoutTag = removeContactTag(withTag, "contact-anya", "vip");

    expect(withTag.find((contact) => contact.id === "contact-anya")?.tags).toContain("vip");
    expect(withoutTag.find((contact) => contact.id === "contact-anya")?.tags).not.toContain("vip");
  });

  it("links current identity to an existing contact without changing rooms", () => {
    const identity = {
      ...mockContacts[1].identities[0]!,
      id: "identity-extra-line",
      externalUserId: "U-extra",
      displayName: "Extra LINE"
    };
    const next = linkIdentityToContact(mockContacts, "contact-anya", identity);

    expect(next.find((contact) => contact.id === "contact-anya")?.identities.some((item) => item.id === "identity-extra-line")).toBe(true);
    expect(mockConversations.find((conversation) => conversation.id === "conv-line-01")?.roomId).toBe("line-oa-main");
  });

  it("does not duplicate an already linked platform identity", () => {
    const existing = mockContacts[0].identities[0]!;
    const next = linkIdentityToContact(mockContacts, "contact-anya", { ...existing, id: "identity-duplicate-web" });

    expect(next.find((contact) => contact.id === "contact-anya")?.identities).toHaveLength(mockContacts[0].identities.length);
  });
});
