import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { WorkerAiService } from "./ai.service.js";

describe("WorkerAiService.fromEnvironment gating", () => {
  const originalMode = process.env.AI_MODE;
  const originalKey = process.env.OPENAI_API_KEY;

  beforeEach(() => {
    delete process.env.AI_MODE;
    delete process.env.OPENAI_API_KEY;
  });

  afterEach(() => {
    if (originalMode === undefined) delete process.env.AI_MODE;
    else process.env.AI_MODE = originalMode;
    if (originalKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = originalKey;
  });

  it("stays in mock mode when OPENAI_API_KEY is absent", async () => {
    delete process.env.OPENAI_API_KEY;

    const service = WorkerAiService.fromEnvironment();
    const result = await service.analyze({
      conversationId: "conv-env-1",
      messages: [{ sender: "user", text: "hello" }]
    });

    expect(result.mode).toBe("mock");
  });

  it("stays in mock mode when AI_MODE=mock even if OPENAI_API_KEY is set", async () => {
    process.env.AI_MODE = "mock";
    process.env.OPENAI_API_KEY = "sk-should-not-be-used";

    const service = WorkerAiService.fromEnvironment();
    const result = await service.analyze({
      conversationId: "conv-env-2",
      messages: [{ sender: "user", text: "hello" }]
    });

    expect(result.mode).toBe("mock");
  });
});

describe("WorkerAiService", () => {
  it("uses mock mode when no OpenAI client is configured", async () => {
    const service = new WorkerAiService(null);

    const result = await service.analyze({
      conversationId: "conv-1",
      messages: [{ sender: "user", text: "ขอทราบราคาแพ็กเกจ" }]
    });

    expect(result.mode).toBe("mock");
    expect(result.decision.intent).toBe("pricing");
    expect(result.decision.nextAction).toBe("suggest_reply");
  });

  it("validates structured OpenAI JSON without calling the real API", async () => {
    const fakeClient = {
      responses: {
        create: async () => ({
          output_text: JSON.stringify({
            intent: "product_info",
            sentiment: "neutral",
            priority: "low",
            confidence: 0.9,
            riskLevel: "low",
            requiresHuman: false,
            nextAction: "auto_reply",
            reply: "สินค้าใช้งานได้กับทีม support ครับ",
            summary: "Customer asks for product information.",
            tags: ["product_info"],
            reason: "Clear product question."
          })
        })
      }
    };
    const service = new WorkerAiService(fakeClient, "test-model");

    const result = await service.analyze({
      conversationId: "conv-2",
      messages: [{ sender: "user", text: "ระบบทำอะไรได้บ้าง" }]
    });

    expect(result.mode).toBe("openai");
    expect(result.model).toBe("test-model");
    expect(result.decision.intent).toBe("product_info");
    expect(result.decision.nextAction).toBe("auto_reply");
  });

  it("falls back to requiresHuman when OpenAI returns invalid JSON", async () => {
    const fakeClient = {
      responses: {
        create: async () => ({ output_text: "{not-json" })
      }
    };
    const service = new WorkerAiService(fakeClient, "test-model");

    const result = await service.analyze({
      conversationId: "conv-3",
      messages: [{ sender: "user", text: "hello" }]
    });

    expect(result.decision.requiresHuman).toBe(true);
    expect(result.decision.nextAction).toBe("handoff");
  });
});
