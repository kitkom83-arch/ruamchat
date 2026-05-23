import { BadRequestException } from "@nestjs/common";
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

  it("requires x-tenant-id for contact reads and mutations", async () => {
    const customers = {
      listContacts: vi.fn(),
      getContact: vi.fn(),
      getContactIdentities: vi.fn(),
      getContactConversations: vi.fn(),
      createContact: vi.fn(),
      updateContact: vi.fn(),
      linkIdentity: vi.fn(),
      unlinkIdentity: vi.fn(),
      setPrimaryIdentity: vi.fn()
    };
    const controller = new ContactsController(customers as never);

    await expect(controller.list(undefined)).rejects.toBeInstanceOf(BadRequestException);
    await expect(controller.detail("contact-api", undefined)).rejects.toBeInstanceOf(BadRequestException);
    await expect(controller.identities("contact-api", undefined)).rejects.toBeInstanceOf(BadRequestException);
    await expect(controller.conversations("contact-api", undefined)).rejects.toBeInstanceOf(BadRequestException);
    await expect(controller.create({ displayName: "API Contact" }, undefined, "user-1")).rejects.toBeInstanceOf(BadRequestException);
    await expect(controller.update("contact-api", { leadStatus: "new" }, undefined, "user-1")).rejects.toBeInstanceOf(BadRequestException);
    await expect(controller.linkIdentity("contact-api", { identityId: "identity-api" }, undefined, "user-1")).rejects.toBeInstanceOf(BadRequestException);
    await expect(controller.unlinkIdentity("contact-api", { identityId: "identity-api" }, undefined, "user-1")).rejects.toBeInstanceOf(BadRequestException);
    await expect(controller.setPrimaryIdentity("contact-api", { identityId: "identity-api" }, undefined, "user-1")).rejects.toBeInstanceOf(BadRequestException);

    expect(customers.listContacts).not.toHaveBeenCalled();
    expect(customers.createContact).not.toHaveBeenCalled();
    expect(customers.linkIdentity).not.toHaveBeenCalled();
  });
});
