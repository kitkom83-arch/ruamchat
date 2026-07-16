#!/usr/bin/env node
// Securely store a channel access token (LINE / Telegram / Meta) for a
// ChannelAccount without ever writing the secret to git, argv, or logs.
//
// The token is read from STDIN (default) or an environment variable, encrypted
// with AES-256-GCM using APP_ENCRYPTION_KEY, and saved to
// ChannelAccount.accessTokenCiphertext. The encryption format is byte-for-byte
// compatible with apps/api CryptoService and the worker resolveToken():
//   base64( iv[12] || authTag[16] || ciphertext )
//
// Usage (PowerShell):
//   $env:APP_ENCRYPTION_KEY = "<base64-32-byte-key>"
//   $env:DATABASE_URL = "postgresql://..."
//   "<PASTE_TOKEN>" | node scripts/set-channel-token.mjs --channel-account-id=<id>
//
// Or pass the token via env (still never logged, never in argv):
//   $env:CHANNEL_ACCESS_TOKEN = "<PASTE_TOKEN>"
//   node scripts/set-channel-token.mjs --channel-account-id=<id> --token-from=env
//
// Optional plaintext webhook secret (LINE channel secret / Telegram webhook
// secret) via env only:
//   $env:CHANNEL_WEBHOOK_SECRET = "<secret>"; ... --set-webhook-secret
//
// SECURITY: never pass secrets as command-line arguments (they leak via process
// listings and shell history). Use STDIN or environment variables only.

import crypto from "node:crypto";
import process from "node:process";
import { PrismaClient } from "@prisma/client";

function parseArgs(argv) {
  const args = { tokenFrom: "stdin", setWebhookSecret: false };
  for (const raw of argv.slice(2)) {
    if (raw.startsWith("--channel-account-id=")) {
      args.channelAccountId = raw.slice("--channel-account-id=".length);
    } else if (raw.startsWith("--token-from=")) {
      args.tokenFrom = raw.slice("--token-from=".length);
    } else if (raw === "--set-webhook-secret") {
      args.setWebhookSecret = true;
    } else if (raw === "--help" || raw === "-h") {
      args.help = true;
    } else {
      throw new Error(`Unknown argument: ${raw}`);
    }
  }
  return args;
}

function resolveKey() {
  const configured = process.env.APP_ENCRYPTION_KEY;
  if (!configured) {
    throw new Error("APP_ENCRYPTION_KEY is required (base64-encoded 32-byte key).");
  }
  const decoded = Buffer.from(configured, "base64");
  if (decoded.length !== 32) {
    throw new Error("APP_ENCRYPTION_KEY must decode to exactly 32 bytes (use: openssl rand -base64 32).");
  }
  return decoded;
}

function encrypt(plainText, key) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

async function resolveToken(tokenFrom) {
  if (tokenFrom === "env") {
    const value = process.env.CHANNEL_ACCESS_TOKEN;
    if (!value) {
      throw new Error("CHANNEL_ACCESS_TOKEN env var is empty (required with --token-from=env).");
    }
    return value.trim();
  }
  if (tokenFrom === "stdin") {
    if (process.stdin.isTTY) {
      throw new Error("No token piped on STDIN. Pipe the token, e.g. \"<TOKEN>\" | node scripts/set-channel-token.mjs ...");
    }
    const value = (await readStdin()).trim();
    if (!value) {
      throw new Error("STDIN was empty; no token provided.");
    }
    return value;
  }
  throw new Error(`Unsupported --token-from value: ${tokenFrom} (use 'stdin' or 'env').`);
}

function redactedFingerprint(secret) {
  // A short, non-reversible fingerprint so operators can confirm which value was
  // stored without ever revealing the secret itself.
  const digest = crypto.createHash("sha256").update(secret).digest("hex");
  return `len=${secret.length} sha256:${digest.slice(0, 8)}…`;
}

function printHelp() {
  console.log(
    [
      "set-channel-token.mjs — encrypt & store a channel access token",
      "",
      "Required:",
      "  --channel-account-id=<id>   ChannelAccount.id to update",
      "  APP_ENCRYPTION_KEY (env)    base64-encoded 32-byte key",
      "  DATABASE_URL (env)          Postgres connection string",
      "",
      "Token source (choose one):",
      "  (default) pipe token on STDIN",
      "  --token-from=env            read from CHANNEL_ACCESS_TOKEN env var",
      "",
      "Optional:",
      "  --set-webhook-secret        also store CHANNEL_WEBHOOK_SECRET (plaintext column)",
      "",
      "Never pass secrets as CLI arguments."
    ].join("\n")
  );
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    printHelp();
    return;
  }
  if (!args.channelAccountId) {
    throw new Error("--channel-account-id=<id> is required. Run with --help for usage.");
  }

  const key = resolveKey();
  const token = await resolveToken(args.tokenFrom);
  const ciphertext = encrypt(token, key);

  const data = { accessTokenCiphertext: ciphertext };
  let webhookFingerprint;
  if (args.setWebhookSecret) {
    const secret = process.env.CHANNEL_WEBHOOK_SECRET;
    if (!secret) {
      throw new Error("--set-webhook-secret requires the CHANNEL_WEBHOOK_SECRET env var.");
    }
    data.webhookSecret = secret.trim();
    webhookFingerprint = redactedFingerprint(data.webhookSecret);
  }

  const prisma = new PrismaClient();
  try {
    const existing = await prisma.channelAccount.findUnique({
      where: { id: args.channelAccountId },
      select: { id: true, platform: true, displayName: true, tenantId: true }
    });
    if (!existing) {
      throw new Error(`ChannelAccount ${args.channelAccountId} not found.`);
    }

    await prisma.channelAccount.update({ where: { id: args.channelAccountId }, data });

    console.log("✅ Stored encrypted channel token.");
    console.log(`   channelAccountId : ${existing.id}`);
    console.log(`   platform         : ${existing.platform}`);
    console.log(`   displayName      : ${existing.displayName}`);
    console.log(`   tenantId         : ${existing.tenantId}`);
    console.log(`   token            : ${redactedFingerprint(token)}`);
    if (webhookFingerprint) {
      console.log(`   webhookSecret    : ${webhookFingerprint}`);
    }
    console.log("   ciphertext bytes : " + Buffer.from(ciphertext, "base64").length);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  // Print only the message — never the token or a stack that might echo input.
  console.error(`✖ ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
