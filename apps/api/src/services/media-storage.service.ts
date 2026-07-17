import { Injectable } from "@nestjs/common";
import { createHash, randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

export type StoredMedia = {
  storageKey: string;
  url: string;
};

export type ReadMedia = {
  buffer: Buffer;
  mimeType: string;
  filename: string;
  sizeBytes: number;
};

/**
 * Media storage abstraction. Dev/default uses the local disk and serves files
 * back through the API `GET /media/:storageKey` route. Production can switch to
 * a blob/S3 backend via `MEDIA_STORAGE=s3` (stubbed until credentials are wired).
 */
@Injectable()
export class MediaStorageService {
  private readonly mode = (process.env.MEDIA_STORAGE ?? "local").toLowerCase();
  private readonly baseDir = process.env.MEDIA_STORAGE_DIR
    ? path.resolve(process.env.MEDIA_STORAGE_DIR)
    : path.resolve(process.cwd(), ".media");
  private readonly publicBase = process.env.MEDIA_PUBLIC_BASE_URL ?? "/media";

  storageMode(): string {
    return this.mode;
  }

  private ensureLocal() {
    if (this.mode !== "local") {
      throw new Error(
        `Media storage mode "${this.mode}" is not configured. Set MEDIA_STORAGE=local for dev, or wire an S3/blob backend before enabling.`
      );
    }
  }

  private sanitiseFilename(filename: string): string {
    const base = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, "_");
    return base.length > 0 ? base.slice(0, 200) : "file";
  }

  private keyFor(tenantId: string, filename: string): string {
    const safeTenant = tenantId.replace(/[^a-zA-Z0-9._-]/g, "_") || "tenant";
    const unique = `${Date.now()}-${randomUUID()}`;
    return `${safeTenant}/${unique}-${this.sanitiseFilename(filename)}`;
  }

  private resolvePath(storageKey: string): string {
    const target = path.resolve(this.baseDir, storageKey);
    const relative = path.relative(this.baseDir, target);
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      throw new Error("Invalid storage key");
    }
    return target;
  }

  async save(input: {
    tenantId: string;
    filename: string;
    mimeType: string;
    buffer: Buffer;
  }): Promise<StoredMedia> {
    this.ensureLocal();
    const storageKey = this.keyFor(input.tenantId, input.filename);
    const target = this.resolvePath(storageKey);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, input.buffer);
    const metaKey = `${storageKey}.json`;
    await fs.writeFile(
      this.resolvePath(metaKey),
      JSON.stringify({
        filename: input.filename,
        mimeType: input.mimeType,
        sizeBytes: input.buffer.byteLength,
        checksum: createHash("sha256").update(input.buffer).digest("hex")
      })
    );
    return {
      storageKey,
      url: `${this.publicBase}/${storageKey}`
    };
  }

  async read(storageKey: string): Promise<ReadMedia> {
    this.ensureLocal();
    const target = this.resolvePath(storageKey);
    const buffer = await fs.readFile(target);
    let mimeType = "application/octet-stream";
    let filename = path.basename(storageKey);
    try {
      const metaRaw = await fs.readFile(this.resolvePath(`${storageKey}.json`), "utf8");
      const meta = JSON.parse(metaRaw) as { mimeType?: string; filename?: string };
      if (meta.mimeType) mimeType = meta.mimeType;
      if (meta.filename) filename = meta.filename;
    } catch {
      // metadata is best-effort; fall back to defaults
    }
    return { buffer, mimeType, filename, sizeBytes: buffer.byteLength };
  }
}
