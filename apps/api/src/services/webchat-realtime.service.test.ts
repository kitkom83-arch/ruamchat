import { describe, expect, it, vi } from "vitest";
import type { WebchatOutboundEvent } from "@ai-omni/shared";
import { WebchatRealtimeService } from "./webchat-realtime.service.js";

function makeEvent(overrides: Partial<WebchatOutboundEvent> = {}): WebchatOutboundEvent {
  return {
    tenantId: "tenant-1",
    conversationId: "conv-1",
    messageId: "msg-1",
    senderType: "ai",
    text: "สวัสดีครับ",
    createdAt: new Date("2024-01-01T00:00:00.000Z").toISOString(),
    ...overrides
  };
}

describe("WebchatRealtimeService", () => {
  it("dispatches events only to listeners for the matching conversation", () => {
    const service = new WebchatRealtimeService();
    const convOne = vi.fn();
    const convTwo = vi.fn();
    service.subscribe("conv-1", convOne);
    service.subscribe("conv-2", convTwo);

    const event = makeEvent({ conversationId: "conv-1" });
    service.dispatch(JSON.stringify(event));

    expect(convOne).toHaveBeenCalledWith(event);
    expect(convTwo).not.toHaveBeenCalled();
  });

  it("stops delivering after unsubscribe", () => {
    const service = new WebchatRealtimeService();
    const listener = vi.fn();
    const unsubscribe = service.subscribe("conv-1", listener);

    service.dispatch(JSON.stringify(makeEvent()));
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    service.dispatch(JSON.stringify(makeEvent()));
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("ignores malformed or unrelated payloads without throwing", () => {
    const service = new WebchatRealtimeService();
    const listener = vi.fn();
    service.subscribe("conv-1", listener);

    expect(() => service.dispatch("{not-json")).not.toThrow();
    service.dispatch(JSON.stringify({ tenantId: "t", messageId: "m" }));
    service.dispatch(JSON.stringify(makeEvent({ conversationId: "conv-other" })));

    expect(listener).not.toHaveBeenCalled();
  });

  it("keeps delivering to remaining listeners when one throws", () => {
    const service = new WebchatRealtimeService();
    const failing = vi.fn(() => {
      throw new Error("listener boom");
    });
    const healthy = vi.fn();
    service.subscribe("conv-1", failing);
    service.subscribe("conv-1", healthy);

    expect(() => service.dispatch(JSON.stringify(makeEvent()))).not.toThrow();
    expect(healthy).toHaveBeenCalledTimes(1);
  });
});
