import { Injectable } from "@nestjs/common";
import crypto from "node:crypto";

@Injectable()
export class CryptoService {
  encrypt(plainText: string) {
    const key = this.key();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, encrypted]).toString("base64");
  }

  decrypt(ciphertext: string) {
    const key = this.key();
    const payload = Buffer.from(ciphertext, "base64");
    const iv = payload.subarray(0, 12);
    const tag = payload.subarray(12, 28);
    const encrypted = payload.subarray(28);
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
  }

  private key() {
    const configured = process.env.APP_ENCRYPTION_KEY;
    if (configured) {
      const decoded = Buffer.from(configured, "base64");
      if (decoded.length === 32) {
        return decoded;
      }
    }

    if (process.env.NODE_ENV === "production") {
      throw new Error("APP_ENCRYPTION_KEY must be a base64 encoded 32-byte key in production");
    }

    return crypto.createHash("sha256").update("dev-only-encryption-key").digest();
  }
}
