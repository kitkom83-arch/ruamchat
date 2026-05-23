import { describe, expect, it } from "vitest";
import { HealthController } from "./health.controller.js";

describe("HealthController", () => {
  it("returns ok health status", () => {
    const result = new HealthController().health();

    expect(result.status).toBe("ok");
    expect(result.service).toBe("api");
    expect(result.mode).toBe("local");
    expect(new Date(result.time).toString()).not.toBe("Invalid Date");
  });
});
