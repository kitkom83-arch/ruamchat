import { BadRequestException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import { RoomsController } from "./rooms.controller.js";

describe("RoomsController conversation queries", () => {
  it("requires x-tenant-id for room and conversation list endpoints", async () => {
    const service = {
      listRooms: vi.fn(),
      listConversations: vi.fn()
    };
    const controller = new RoomsController(service as never);

    await expect(controller.rooms(undefined)).rejects.toBeInstanceOf(BadRequestException);
    await expect(controller.roomConversations("room-webchat", "human", "all", undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, "user-1")).rejects.toBeInstanceOf(BadRequestException);

    expect(service.listRooms).not.toHaveBeenCalled();
    expect(service.listConversations).not.toHaveBeenCalled();
  });

  it("validates and forwards safe API-mode search filters", async () => {
    const service = {
      listConversations: vi.fn(async () => [])
    };
    const controller = new RoomsController(service as never);

    await controller.roomConversations(
      "room-webchat",
      "human",
      "all",
      "agent-1",
      "pricing",
      "webchat",
      "channel-web",
      "open",
      "high",
      "true",
      "warning",
      "updated_desc",
      "25",
      "0",
      "tenant-1",
      "user-1"
    );

    expect(service.listConversations).toHaveBeenCalledWith({
      tenantId: "tenant-1",
      roomId: "room-webchat",
      tab: "human",
      filter: "all",
      userId: "user-1",
      agentId: "agent-1",
      search: "pricing",
      platform: "webchat",
      channelAccountId: "channel-web",
      status: "open",
      priority: "high",
      unread: true,
      slaStatus: "warning",
      sort: "updated_desc",
      limit: 25,
      offset: 0
    });
  });

  it("rejects invalid conversation list query filters", async () => {
    const controller = new RoomsController({ listConversations: vi.fn() } as never);

    await expect(controller.roomConversations("room-webchat", "human", "all", undefined, undefined, "invalid", undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, "tenant-1", "user-1")).rejects.toBeInstanceOf(BadRequestException);
    await expect(controller.roomConversations("room-webchat", "human", "all", undefined, undefined, undefined, undefined, "deleted", undefined, undefined, undefined, undefined, undefined, undefined, "tenant-1", "user-1")).rejects.toBeInstanceOf(BadRequestException);
    await expect(controller.roomConversations("room-webchat", "human", "all", undefined, undefined, undefined, undefined, undefined, "critical", undefined, undefined, undefined, undefined, undefined, "tenant-1", "user-1")).rejects.toBeInstanceOf(BadRequestException);
    await expect(controller.roomConversations("room-webchat", "human", "all", undefined, undefined, undefined, undefined, undefined, undefined, "maybe", undefined, undefined, undefined, undefined, "tenant-1", "user-1")).rejects.toBeInstanceOf(BadRequestException);
  });
});
