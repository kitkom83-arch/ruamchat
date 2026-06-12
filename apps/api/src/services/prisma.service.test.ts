import { afterEach, describe, expect, it, vi } from "vitest";
import { PrismaService } from "./prisma.service.js";

describe("PrismaService", () => {
  const originalDataMode = process.env.DATA_MODE;
  const originalNextPublicDataMode = process.env.NEXT_PUBLIC_DATA_MODE;

  afterEach(() => {
    if (originalDataMode === undefined) {
      delete process.env.DATA_MODE;
    } else {
      process.env.DATA_MODE = originalDataMode;
    }

    if (originalNextPublicDataMode === undefined) {
      delete process.env.NEXT_PUBLIC_DATA_MODE;
    } else {
      process.env.NEXT_PUBLIC_DATA_MODE = originalNextPublicDataMode;
    }

    vi.restoreAllMocks();
  });

  it("connects eagerly in mock data mode", async () => {
    process.env.DATA_MODE = "mock";
    delete process.env.NEXT_PUBLIC_DATA_MODE;

    const service = new PrismaService();
    const connectSpy = vi.spyOn(service, "$connect").mockResolvedValue(undefined as never);

    await service.onModuleInit();

    expect(connectSpy).toHaveBeenCalledTimes(1);
  });

  it("connects eagerly when data mode is api", async () => {
    process.env.DATA_MODE = "api";
    delete process.env.NEXT_PUBLIC_DATA_MODE;

    const service = new PrismaService();
    const connectSpy = vi.spyOn(service, "$connect").mockResolvedValue(undefined as never);

    await service.onModuleInit();

    expect(connectSpy).toHaveBeenCalledTimes(1);
  });
});
