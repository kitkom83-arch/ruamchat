import { describe, expect, it } from "vitest";
import { dataMode, getApiBaseUrl, getApiTenantId, isMockMode } from "./data-mode";

describe("data mode switch", () => {
  it("defaults to mock mode and does not require API config", () => {
    expect(dataMode).toBe("mock");
    expect(isMockMode()).toBe(true);
  });

  it("uses the Sprint 12 API base URL default", () => {
    expect(getApiBaseUrl()).toBe("http://localhost:4000");
  });

  it("uses a single default API tenant id source", () => {
    expect(getApiTenantId()).toBe("00000000-0000-4000-8000-000000000001");
  });
});
