import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Inject,
  NotFoundException,
  Param,
  Post,
  Res
} from "@nestjs/common";
import type { Response } from "express";
import {
  mediaUploadRequestSchema,
  mediaUploadResultSchema,
  validateMediaUpload,
  type MediaUploadResult
} from "@ai-omni/shared";
import { MediaStorageService } from "../services/media-storage.service.js";

@Controller("media")
export class MediaController {
  constructor(@Inject(MediaStorageService) private readonly storage: MediaStorageService) {}

  @Post()
  async upload(
    @Body() body: unknown,
    @Headers("x-tenant-id") tenant: string | undefined
  ): Promise<MediaUploadResult> {
    const tenantId = requireTenantId(tenant);
    const parsed = mediaUploadRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues[0]?.message ?? "Invalid upload payload");
    }
    const buffer = decodeBase64(parsed.data.dataBase64);
    const validation = validateMediaUpload({
      mimeType: parsed.data.mimeType,
      sizeBytes: buffer.byteLength,
      filename: parsed.data.filename
    });
    if (!validation.ok) {
      throw new BadRequestException(validation.reason);
    }
    const stored = await this.storage.save({
      tenantId,
      filename: parsed.data.filename,
      mimeType: parsed.data.mimeType,
      buffer
    });
    return mediaUploadResultSchema.parse({
      type: validation.type,
      url: stored.url,
      storageKey: stored.storageKey,
      filename: parsed.data.filename,
      mimeType: parsed.data.mimeType,
      sizeBytes: buffer.byteLength
    });
  }

  @Get(":tenant/:file")
  async serve(
    @Param("tenant") tenant: string,
    @Param("file") file: string,
    @Res() res: Response
  ): Promise<void> {
    const storageKey = `${tenant}/${file}`;
    try {
      const media = await this.storage.read(storageKey);
      res.setHeader("content-type", media.mimeType);
      res.setHeader("content-length", String(media.sizeBytes));
      res.setHeader("cache-control", "private, max-age=3600");
      res.setHeader("content-disposition", `inline; filename="${encodeURIComponent(media.filename)}"`);
      res.end(media.buffer);
    } catch {
      throw new NotFoundException("Media not found");
    }
  }
}

function requireTenantId(tenant: string | undefined): string {
  const tenantId = tenant?.trim();
  if (!tenantId) throw new BadRequestException("x-tenant-id is required");
  return tenantId;
}

function decodeBase64(value: string): Buffer {
  const cleaned = value.includes(",") ? value.slice(value.indexOf(",") + 1) : value;
  const buffer = Buffer.from(cleaned, "base64");
  if (buffer.byteLength === 0) {
    throw new BadRequestException("Uploaded file is empty");
  }
  return buffer;
}
