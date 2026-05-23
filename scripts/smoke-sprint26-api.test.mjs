import { describe, expect, it } from "vitest";
import {
  auditExternalCallsSafe,
  auditScopePreserved,
  externalCallsIsZero,
  latestLogsForActions
} from "./smoke-sprint26-api.mjs";

const expectedActions = new Set([
  "conversation.takeover",
  "conversation.priority_updated"
]);

const context = {
  tenantId: "tenant-1",
  conversationId: "conversation-1",
  platform: "webchat",
  channelAccountId: "account-1",
  roomId: "room-1"
};

function log(action, metadataJson) {
  return { action, metadataJson };
}

describe("smoke:sprint26 audit assertions", () => {
  it("checks latest action logs and ignores older seed audit rows for the same action", () => {
    const latestLogs = latestLogsForActions([
      log("conversation.priority_updated", { ...context, externalCalls: 0 }),
      log("conversation.takeover", { ...context, externalCalls: 0 }),
      log("conversation.priority_updated", { source: "seed" })
    ], expectedActions);

    expect(auditScopePreserved(latestLogs, context, expectedActions)).toBe(true);
    expect(auditExternalCallsSafe(latestLogs, expectedActions)).toBe(true);
  });

  it("fails audit assertions when latest action logs omit safe scope metadata", () => {
    const latestLogs = latestLogsForActions([
      log("conversation.priority_updated", { source: "seed" }),
      log("conversation.takeover", { ...context, externalCalls: 0 })
    ], expectedActions);

    expect(auditScopePreserved(latestLogs, context, expectedActions)).toBe(false);
    expect(auditExternalCallsSafe(latestLogs, expectedActions)).toBe(false);
  });

  it("passes the externalCalls check only for the real zero counter", () => {
    expect(externalCallsIsZero(0)).toBe(true);
    expect(externalCallsIsZero(1)).toBe(false);
    expect(externalCallsIsZero("0")).toBe(false);
  });
});
