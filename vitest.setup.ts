import { beforeEach } from "vitest";

// @prisma/client auto-loads the developer's local `.env` into process.env when it
// is imported (it bundles dotenv). That means a local `.env` used for real/sandbox
// go-live (e.g. PROVIDER_OUTBOUND_ENABLED=true, empty *_VERIFY_TOKEN=) leaks into
// unit tests and changes runtime gating, which does not happen in CI (no `.env`).
//
// Scrub the outbound/AI/channel gating vars before every test so the suite runs
// against the same clean, unset defaults as CI. Tests that need a specific value
// set it explicitly in their own beforeEach/it (which runs after this hook).
const HERMETIC_ENV_KEYS = [
  "AI_MODE",
  "OPENAI_ALLOW_REAL_CALLS",
  "OPENAI_API_KEY",
  "PROVIDER_OUTBOUND_ENABLED",
  "PROVIDER_OUTBOUND_MODE",
  "PROVIDER_SANDBOX_MODE",
  "CHANNEL_MODE",
  "META_CHANNEL_MODE",
  "META_VERIFY_TOKEN",
  "FACEBOOK_VERIFY_TOKEN",
  "INSTAGRAM_VERIFY_TOKEN"
] as const;

beforeEach(() => {
  for (const key of HERMETIC_ENV_KEYS) {
    delete process.env[key];
  }
});
