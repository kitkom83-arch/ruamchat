import { Injectable } from "@nestjs/common";
import { createHash, randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import {
  CreateBucketCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client
} from "@aws-sdk/client-s3";

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
 * back through the API `GET /media/:tenant/:file` route. Production can switch to
 * an S3-compatible backend (AWS S3 or MinIO) via `MEDIA_STORAGE=s3`.
 *
 * The public URL always stays `${MEDIA_PUBLIC_BASE_URL}/${storageKey}` so the
 * serving route, worker outbound guards, and inbox rendering are identical in
 * both modes — only where the bytes live changes.
 */
@Injectable()
export class MediaStorageService {
  private readonly mode = (process.env.MEDIA_STORAGE ?? "local").toLowerCase();
  private readonly baseDir = process.env.MEDIA_STORAGE_DIR
    ? path.resolve(process.env.MEDIA_STORAGE_DIR)
    : path.resolve(process.cwd(), ".media");
  private readonly publicBase = process.env.MEDIA_PUBLIC_BASE_URL ?? "/media";

  // S3 config is only read/used when mode === "s3"; local dev never touches it.
  private readonly s3Bucket = process.env.S3_BUCKET ?? "";
  private readonly s3ForcePathStyle = (process.env.S3_FORCE_PATH_STYLE ?? "true").toLowerCase() !== "false";
  private s3ClientInstance: S3Client | null = null;
  private bucketReady: Promise<void> | null = null;

  storageMode(): string {
    return this.mode;
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

  // ── S3 helpers ────────────────────────────────────────────────────────────

  private s3Client(): S3Client {
    if (!this.s3ClientInstance) {
      if (!this.s3Bucket) {
        throw new Error("S3 storage is enabled but S3_BUCKET is not set");
      }
      const accessKeyId = process.env.S3_ACCESS_KEY;
      const secretAccessKey = process.env.S3_SECRET_KEY;
      this.s3ClientInstance = new S3Client({
        region: process.env.S3_REGION ?? "us-east-1",
        endpoint: process.env.S3_ENDPOINT || undefined,
        forcePathStyle: this.s3ForcePathStyle,
        credentials:
          accessKeyId && secretAccessKey ? { accessKeyId, secretAccessKey } : undefined
      });
    }
    return this.s3ClientInstance;
  }

  private ensureBucket(): Promise<void> {
    if (!this.bucketReady) {
      this.bucketReady = (async () => {
        const client = this.s3Client();
        try {
          await client.send(new HeadBucketCommand({ Bucket: this.s3Bucket }));
        } catch {
          // Bucket missing (or head not permitted) — try to create it. MinIO and
          // fresh S3 buckets support this; if it already exists this is a no-op.
          try {
            await client.send(new CreateBucketCommand({ Bucket: this.s3Bucket }));
          } catch (createError) {
            // If another worker created it in a race, HeadBucket next time is fine.
            const name = (createError as { name?: string })?.name ?? "";
            if (name !== "BucketAlreadyOwnedByYou" && name !== "BucketAlreadyExists") {
              throw createError;
            }
          }
        }
      })();
    }
    return this.bucketReady;
  }

  private async saveToS3(input: {
    tenantId: string;
    filename: string;
    mimeType: string;
    buffer: Buffer;
  }): Promise<StoredMedia> {
    const storageKey = this.keyFor(input.tenantId, input.filename);
    await this.ensureBucket();
    await this.s3Client().send(
      new PutObjectCommand({
        Bucket: this.s3Bucket,
        Key: storageKey,
        Body: input.buffer,
        ContentType: input.mimeType,
        Metadata: {
          filename: encodeURIComponent(input.filename),
          checksum: createHash("sha256").update(input.buffer).digest("hex")
        }
      })
    );
    return {
      storageKey,
      url: `${this.publicBase}/${storageKey}`
    };
  }

  private async readFromS3(storageKey: string): Promise<ReadMedia> {
    const response = await this.s3Client().send(
      new GetObjectCommand({ Bucket: this.s3Bucket, Key: storageKey })
    );
    const body = response.Body;
    if (!body) throw new Error("Media not found");
    const bytes = await (body as { transformToByteArray(): Promise<Uint8Array> }).transformToByteArray();
    const buffer = Buffer.from(bytes);
    const metaFilename = response.Metadata?.filename;
    return {
      buffer,
      mimeType: response.ContentType ?? "application/octet-stream",
      filename: metaFilename ? decodeURIComponent(metaFilename) : path.basename(storageKey),
      sizeBytes: buffer.byteLength
    };
  }

  // ── Local helpers ─────────────────────────────────────────────────────────

  private async saveToLocal(input: {
    tenantId: string;
    filename: string;
    mimeType: string;
    buffer: Buffer;
  }): Promise<StoredMedia> {
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

  private async readFromLocal(storageKey: string): Promise<ReadMedia> {
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

  // ── Public API ────────────────────────────────────────────────────────────

  async save(input: {
    tenantId: string;
    filename: string;
    mimeType: string;
    buffer: Buffer;
  }): Promise<StoredMedia> {
    if (this.mode === "s3") return this.saveToS3(input);
    return this.saveToLocal(input);
  }

  async read(storageKey: string): Promise<ReadMedia> {
    if (this.mode === "s3") return this.readFromS3(storageKey);
    // Guard traversal for local reads (resolvePath throws on unsafe keys).
    return this.readFromLocal(storageKey);
  }
}
