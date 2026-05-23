import { describe, expect, it, vi } from "vitest";
import { ContactsController } from "./contacts.controller.js";

const tenantId = "00000000-0000-4000-8000-000000000001";

describe("ContactsController", () => {
  it("uses explicit injected customer service for tenant-scoped read routes", async () => {
    const customers = {
      listContacts: vi.fn(async () => []),
      getContact: vi.fn(async () => ({ id: "contact-api" })),
      getContactIdentities: vi.fn(async () => []),
      getContactConversations: vi.fn(async () => [{
        id: "conv-api",
        roomId: "room-line",
        platform: "line",
        channelAccountId: "00000000-0000-4000-8000-000000000022",
        accountName: "LINE OA Main"
      }])
    };
    const controller = new ContactsController(customers as never);

    await expect(controller.list(tenantId)).resolves.toEqual([]);
    await expect(controller.detail("contact-api", tenantId)).resolves.toEqual({ id: "contact-api" });
    await expect(controller.identities("contact-api", tenantId)).resolves.toEqual([]);
    await expect(controller.conversations("contact-api", tenantId)).resolves.toEqual([expect.objectContaining({
      id: "conv-api",
      roomId: "room-line",
      platform: "line",
      channelAccountId: "00000000-0000-4000-8000-000000000022",
      accountName: "LINE OA Main"
    })]);

    expect(customers.listContacts).toHaveBeenCalledWith(tenantId);
    expect(customers.getContact).toHaveBeenCalledWith(tenantId, "contact-api");
    expect(customers.getContactIdentities).toHaveBeenCalledWith(tenantId, "contact-api");
    expect(customers.getContactConversations).toHaveBeenCalledWith(tenantId, "contact-api");
  });
});
