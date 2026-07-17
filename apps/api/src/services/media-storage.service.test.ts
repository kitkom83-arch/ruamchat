import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

// Shared mock for the S3 client `send`. Hoisted so vi.mock can reference it.
const { sendMock } = vi.hoisted(() => ({ sendMock: vi.fn() }));

vi.mock("@aws-sdk/client-s3", () => {
  class S3Client {
    send = sendMock;
  }
  class PutObjectCommand {
    type = "put" as const;
    constructor(public input: Record<string, unknown>) {}
  }
  class GetObjectCommand {
    type = "get" as const;
    constructor(public input: Record<string, unknown>) {}
  }
  class HeadBucketCommand {
    type = "head" as const;
    constructor(public input: Record<string, unknown>) {}
  }
  class CreateBucketCommand {
    type = "create" as const;
    constructor(public input: Record<string, unknown>) {}
  }
  return { S3Client, PutObjectCommand, GetObjectCommand, HeadBucketCommand, CreateBucketCommand };
});

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

describe("MediaStorageService (local)", () => {
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

  it("reports the configured storage mode", () => {
    const service = new MediaStorageService();
    expect(service.storageMode()).toBe("local");
  });
});

describe("MediaStorageService (s3)", () => {
  beforeEach(() => {
    sendMock.mockReset();
    process.env.MEDIA_STORAGE = "s3";
    process.env.S3_BUCKET = "omni-chat";
    process.env.S3_ENDPOINT = "http://minio:9000";
    process.env.S3_ACCESS_KEY = "minio-user";
    process.env.S3_SECRET_KEY = "minio-pass";
    process.env.MEDIA_PUBLIC_BASE_URL = "https://cdn.example/api/media";
  });

  afterEach(() => {
    process.env.MEDIA_STORAGE = "local";
    process.env.MEDIA_PUBLIC_BASE_URL = "/media";
    delete process.env.S3_BUCKET;
    delete process.env.S3_ENDPOINT;
    delete process.env.S3_ACCESS_KEY;
    delete process.env.S3_SECRET_KEY;
  });

  it("uploads via PutObject and auto-creates the bucket when missing", async () => {
    sendMock.mockImplementation(async (command: { type: string }) => {
      if (command.type === "head") throw Object.assign(new Error("no bucket"), { name: "NotFound" });
      if (command.type === "create") return {};
      if (command.type === "put") return {};
      return {};
    });

    const service = new MediaStorageService();
    const buffer = Buffer.from("image-bytes");
    const saved = await service.save({
      tenantId: "tenant-9",
      filename: "pic.png",
      mimeType: "image/png",
      buffer
    });

    const types = sendMock.mock.calls.map(([cmd]) => (cmd as { type: string }).type);
    expect(types).toContain("head");
    expect(types).toContain("create");
    expect(types).toContain("put");

    const putCall = sendMock.mock.calls.find(([cmd]) => (cmd as { type: string }).type === "put");
    const putInput = (putCall?.[0] as { input: Record<string, unknown> }).input;
    expect(putInput.Bucket).toBe("omni-chat");
    expect(putInput.ContentType).toBe("image/png");
    expect(String(putInput.Key)).toBe(saved.storageKey);

    expect(saved.storageKey.startsWith("tenant-9/")).toBe(true);
    expect(saved.url).toBe(`https://cdn.example/api/media/${saved.storageKey}`);
  });

  it("does not create the bucket when HeadBucket succeeds", async () => {
    sendMock.mockImplementation(async (command: { type: string }) => {
      if (command.type === "head") return {};
      return {};
    });

    const service = new MediaStorageService();
    await service.save({
      tenantId: "t",
      filename: "a.bin",
      mimeType: "application/octet-stream",
      buffer: Buffer.from("z")
    });

    const types = sendMock.mock.calls.map(([cmd]) => (cmd as { type: string }).type);
    expect(types).toContain("head");
    expect(types).not.toContain("create");
    expect(types).toContain("put");
  });

  it("checks the bucket only once across multiple saves on one instance", async () => {
    sendMock.mockImplementation(async (command: { type: string }) => {
      if (command.type === "head") throw Object.assign(new Error("no bucket"), { name: "NotFound" });
      return {};
    });

    const service = new MediaStorageService();
    for (let i = 0; i < 3; i += 1) {
      await service.save({
        tenantId: "t",
        filename: `f${i}.bin`,
        mimeType: "application/octet-stream",
        buffer: Buffer.from(String(i))
      });
    }

    const createCalls = sendMock.mock.calls.filter(([cmd]) => (cmd as { type: string }).type === "create");
    const putCalls = sendMock.mock.calls.filter(([cmd]) => (cmd as { type: string }).type === "put");
    expect(createCalls).toHaveLength(1);
    expect(putCalls).toHaveLength(3);
  });

  it("reads back an object via GetObject with content type and filename metadata", async () => {
    sendMock.mockImplementation(async (command: { type: string }) => {
      if (command.type === "get") {
        return {
          Body: {
            transformToByteArray: async () => new Uint8Array(Buffer.from("hello s3"))
          },
          ContentType: "text/plain",
          Metadata: { filename: encodeURIComponent("greeting.txt") }
        };
      }
      return {};
    });

    const service = new MediaStorageService();
    const read = await service.read("tenant-9/123-greeting.txt");
    expect(read.buffer.toString("utf8")).toBe("hello s3");
    expect(read.mimeType).toBe("text/plain");
    expect(read.filename).toBe("greeting.txt");
    expect(read.sizeBytes).toBe(Buffer.from("hello s3").byteLength);
  });

  it("reports s3 as the configured storage mode", () => {
    const service = new MediaStorageService();
    expect(service.storageMode()).toBe("s3");
  });
});
