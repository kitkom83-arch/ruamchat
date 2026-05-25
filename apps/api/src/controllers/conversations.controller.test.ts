import { BadRequestException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import { ConversationsController, TasksController } from "./conversations.controller.js";

describe("ConversationsController manual reply", () => {
  it("requires x-tenant-id before sending a manual reply", async () => {
    const controller = new ConversationsController(
      { sendAgentMessage: vi.fn() } as never,
      {} as never
    );

    await expect(controller.send("conv-1", { text: "hello", senderType: "agent" }, undefined, "user-1")).rejects.toBeInstanceOf(BadRequestException);
  });

  it("validates non-empty manual reply text and preserves explicit DI construction", async () => {
    const conversations = { sendAgentMessage: vi.fn() };
    const controller = new ConversationsController(conversations as never, {} as never);

    await expect(controller.send("conv-1", { text: "   ", senderType: "agent" }, "tenant-1", "user-1")).rejects.toBeInstanceOf(BadRequestException);

    expect(conversations.sendAgentMessage).not.toHaveBeenCalled();
  });

  it("requires x-tenant-id for conversation actions and preserves explicit DI construction", async () => {
    const conversations = {
      assign: vi.fn(),
      takeover: vi.fn(),
      returnToAi: vi.fn(),
      followUp: vi.fn(),
      close: vi.fn(),
      updateStatus: vi.fn(),
      updatePriority: vi.fn(),
      updateReadState: vi.fn(),
      updateSla: vi.fn()
    };
    const controller = new ConversationsController(conversations as never, {} as never);

    await expect(controller.assign("conv-1", { userId: null }, undefined, "user-1")).rejects.toBeInstanceOf(BadRequestException);
    await expect(controller.takeover("conv-1", undefined, "user-1")).rejects.toBeInstanceOf(BadRequestException);
    await expect(controller.returnToAi("conv-1", undefined, "user-1")).rejects.toBeInstanceOf(BadRequestException);
    await expect(controller.followUp("conv-1", {}, undefined, "user-1")).rejects.toBeInstanceOf(BadRequestException);
    await expect(controller.close("conv-1", undefined, "user-1")).rejects.toBeInstanceOf(BadRequestException);
    await expect(controller.updateStatus("conv-1", { status: "open" }, undefined, "user-1")).rejects.toBeInstanceOf(BadRequestException);
    await expect(controller.updatePriority("conv-1", { priority: "high" }, undefined, "user-1")).rejects.toBeInstanceOf(BadRequestException);
    await expect(controller.updateReadState("conv-1", { unread: false }, undefined, "user-1")).rejects.toBeInstanceOf(BadRequestException);
    await expect(controller.updateSla("conv-1", { slaStatus: "warning" }, undefined, "user-1")).rejects.toBeInstanceOf(BadRequestException);

    expect(conversations.assign).not.toHaveBeenCalled();
    expect(conversations.takeover).not.toHaveBeenCalled();
    expect(conversations.returnToAi).not.toHaveBeenCalled();
  });

  it("requires x-tenant-id for audit and status history reads", async () => {
    const conversations = {
      getAuditLogs: vi.fn(),
      getStatusHistory: vi.fn()
    };
    const controller = new ConversationsController(conversations as never, {} as never);

    await expect(controller.auditLogs("conv-1", undefined)).rejects.toBeInstanceOf(BadRequestException);
    await expect(controller.statusHistory("conv-1", undefined)).rejects.toBeInstanceOf(BadRequestException);

    expect(conversations.getAuditLogs).not.toHaveBeenCalled();
    expect(conversations.getStatusHistory).not.toHaveBeenCalled();
  });

  it("requires x-tenant-id for Customer 360 reads", async () => {
    const customers = { getCustomer360: vi.fn() };
    const controller = new ConversationsController({} as never, customers as never);

    await expect(controller.customer360("conv-1", undefined)).rejects.toBeInstanceOf(BadRequestException);

    expect(customers.getCustomer360).not.toHaveBeenCalled();
  });

  it("requires x-tenant-id for note and task workflow endpoints", async () => {
    const conversations = {
      getNotes: vi.fn(),
      createNote: vi.fn(),
      getTasks: vi.fn(),
      createTask: vi.fn()
    };
    const controller = new ConversationsController(conversations as never, {} as never);

    await expect(controller.notes("conv-1", undefined)).rejects.toBeInstanceOf(BadRequestException);
    await expect(controller.createNote("conv-1", { body: "note", visibility: "team" }, undefined, "user-1")).rejects.toBeInstanceOf(BadRequestException);
    await expect(controller.tasks("conv-1", undefined)).rejects.toBeInstanceOf(BadRequestException);
    await expect(controller.createTask("conv-1", { title: "task" }, undefined, "user-1")).rejects.toBeInstanceOf(BadRequestException);

    expect(conversations.getNotes).not.toHaveBeenCalled();
    expect(conversations.createNote).not.toHaveBeenCalled();
    expect(conversations.getTasks).not.toHaveBeenCalled();
    expect(conversations.createTask).not.toHaveBeenCalled();
  });
});

describe("TasksController workflow updates", () => {
  it("requires x-tenant-id for task update endpoints", async () => {
    const conversations = {
      updateTask: vi.fn(),
      completeTask: vi.fn()
    };
    const controller = new TasksController(conversations as never);

    await expect(controller.updateTask("task-1", { status: "done" }, undefined, "user-1")).rejects.toBeInstanceOf(BadRequestException);
    await expect(controller.completeTask("task-1", undefined, "user-1")).rejects.toBeInstanceOf(BadRequestException);

    expect(conversations.updateTask).not.toHaveBeenCalled();
    expect(conversations.completeTask).not.toHaveBeenCalled();
  });

  it("passes tenant-scoped task update and completion requests to the service", async () => {
    const conversations = {
      updateTask: vi.fn(async () => ({ id: "task-1", status: "done" })),
      completeTask: vi.fn(async () => ({ id: "task-1", status: "done" }))
    };
    const controller = new TasksController(conversations as never);

    await controller.updateTask("task-1", { status: "done" }, "tenant-1", "user-1");
    await controller.completeTask("task-1", "tenant-1", "user-1");

    expect(conversations.updateTask).toHaveBeenCalledWith("tenant-1", "task-1", "user-1", { status: "done" });
    expect(conversations.completeTask).toHaveBeenCalledWith("tenant-1", "task-1", "user-1");
  });

  it("rejects invalid task update payloads", async () => {
    const conversations = {
      updateTask: vi.fn(),
      completeTask: vi.fn()
    };
    const controller = new TasksController(conversations as never);

    await expect(controller.updateTask("task-1", { status: "waiting" }, "tenant-1", "user-1")).rejects.toBeInstanceOf(BadRequestException);

    expect(conversations.updateTask).not.toHaveBeenCalled();
  });
});
