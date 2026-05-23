import { describe, expect, it } from "vitest";
import { shouldAutoSend, shouldHandoff, type AIDecision } from "@ai-omni/shared";

describe("AI policy helpers", () => {
  it("hands off high-risk decisions", () => {
    expect(shouldHandoff({
      intent: "refund",
      sentiment: "negative",
      priority: "high",
      confidence: 0.9,
      riskLevel: "high",
      requiresHuman: true,
      nextAction: "handoff",
      reply: "ควรให้แอดมินตรวจสอบก่อนตอบครับ",
      summary: "Refund request needs human review.",
      reason: "Refund request.",
      tags: ["risk"],
    })).toBe(true);
  });

  it("allows auto-send only when mode and evidence both allow it", () => {
    const decision: AIDecision = {
      intent: "pricing",
      sentiment: "neutral" as const,
      priority: "medium" as const,
      confidence: 0.9,
      riskLevel: "low" as const,
      nextAction: "auto_reply" as const,
      requiresHuman: false,
      reply: "ราคาเริ่มต้น 1,000 บาทครับ",
      summary: "Customer asks for pricing.",
      tags: ["pricing"],
      reason: "High confidence pricing FAQ."
    };

    expect(shouldAutoSend(decision, "suggest", true)).toBe(false);
    expect(shouldAutoSend(decision, "auto_faq", true)).toBe(true);
  });
});
