import { BadRequestException } from "@nestjs/common";
import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { describe, expect, it, vi } from "vitest";
import { KnowledgeBaseService } from "../services/knowledge-base.service.js";
import { OpenAiOrchestratorService } from "../services/openai-orchestrator.service.js";
import { AiController } from "./ai.controller.js";

describe("AiController suggested reply API", () => {
  it("requires x-tenant-id for suggested replies and feedback with explicit DI construction", async () => {
    const ai = {
      suggest: vi.fn(),
      markWrong: vi.fn()
    };
    const controller = new AiController(ai as never, {} as never);

    await expect(controller.suggest("conv-1", undefined)).rejects.toBeInstanceOf(BadRequestException);
    await expect(controller.feedback("ai-run-1", { feedbackType: "mark_wrong" }, undefined, "user-1")).rejects.toBeInstanceOf(BadRequestException);

    expect(ai.suggest).not.toHaveBeenCalled();
    expect(ai.markWrong).not.toHaveBeenCalled();
  });

  it("passes tenant, user, and validated feedback payload to the AI service", async () => {
    const ai = {
      suggest: vi.fn(async () => ({ suggestionId: "ai-run-1" })),
      markWrong: vi.fn(async () => ({ feedbackId: "feedback-1" }))
    };
    const controller = new AiController(ai as never, {} as never);

    await controller.suggest("conv-1", "tenant-1");
    await controller.feedback("ai-run-1", { feedbackType: "mark_wrong", note: "bad source" }, "tenant-1", "user-1");

    expect(ai.suggest).toHaveBeenCalledWith("tenant-1", "conv-1");
    expect(ai.markWrong).toHaveBeenCalledWith("tenant-1", "ai-run-1", "user-1", {
      feedbackType: "mark_wrong",
      note: "bad source"
    });
  });

  it("resolves AiController through Nest DI and calls the injected orchestrator", async () => {
    const ai = {
      suggest: vi.fn(async () => ({ suggestionId: "ai-run-1", externalCalls: 0 })),
      markWrong: vi.fn()
    };
    const knowledgeBases = {};

    @Module({
      controllers: [AiController],
      providers: [
        { provide: OpenAiOrchestratorService, useValue: ai },
        { provide: KnowledgeBaseService, useValue: knowledgeBases }
      ]
    })
    class TestModule {}

    const app = await NestFactory.createApplicationContext(TestModule, { logger: false });
    try {
      const controller = app.get(AiController);
      const result = await controller.suggest("conv-1", "tenant-1");

      expect(result).toEqual({ suggestionId: "ai-run-1", externalCalls: 0 });
      expect(ai.suggest).toHaveBeenCalledWith("tenant-1", "conv-1");
    } finally {
      await app.close();
    }
  });
});
