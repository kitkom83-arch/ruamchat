import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { MediaStorageService } from "./media-storage.service.js";

let tempDir: string;

beforeAll(async () => {
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "media-storage-test-"));
  process.env.MEDIA_STORAGE = "local";
  process.env.MEDIA_STORAGE_DIR = tempDir;
  process.env.MEDIA_PUBLIC_BASE_URL = "/media";
});

afterAll(async () => {
  await fs.rm(tempDir, { recursive: true, force: true });
  delete process.env.MEDIA_STORAGE_DIR;
});

describe("MediaStorageService", () => {
  it("saves and reads back a media buffer with metadata", async () => {
    const service = new MediaStorageService();
    const buffer = Buffer.from("hello media", "utf8");
    const saved = await service.save({
      tenantId: "tenant-1",
      filename: "note.txt",
      mimeType: "text/plain",
      buffer
    });

    expect(saved.storageKey.startsWith("tenant-1/")).toBe(true);
    expect(saved.url).toBe(`/media/${saved.storageKey}`);

    const read = await service.read(saved.storageKey);
    expect(read.buffer.toString("utf8")).toBe("hello media");
    expect(read.mimeType).toBe("text/plain");
    expect(read.filename).toBe("note.txt");
    expect(read.sizeBytes).toBe(buffer.byteLength);
  });

  it("sanitises unsafe filenames into a single tenant path segment", async () => {
    const service = new MediaStorageService();
    const saved = await service.save({
      tenantId: "tenant unsafe/../x",
      filename: "../../etc/passwd",
      mimeType: "text/plain",
      buffer: Buffer.from("x")
    });
    const segments = saved.storageKey.split("/");
    expect(segments).toHaveLength(2);
    // No unescaped path separators survive: slashes in tenant/filename are replaced.
    expect(segments[0]).not.toContain("/");
    expect(segments[1]).not.toContain("/");
    // The sanitised key round-trips and stays inside the storage dir.
    const read = await service.read(saved.storageKey);
    expect(read.buffer.toString("utf8")).toBe("x");
  });

  it("rejects path traversal storage keys on read", async () => {
    const service = new MediaStorageService();
    await expect(service.read("../../secret")).rejects.toThrow("Invalid storage key");
  });

  it("throws when storage mode is not local", () => {
    process.env.MEDIA_STORAGE = "s3";
    const service = new MediaStorageService();
    expect(service.storageMode()).toBe("s3");
    process.env.MEDIA_STORAGE = "local";
  });
});
