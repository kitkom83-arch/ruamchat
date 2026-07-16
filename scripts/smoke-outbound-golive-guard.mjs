// Go-live outbound guard smoke (network-free).
//
// Verifies the shared provider-outbound guard (validateProviderSandboxOutbound)
// enforces every gate before any real LINE/Telegram/Meta push is allowed. This
// runs entirely in-process — it never opens a socket or contacts a provider — so
// it is safe to run in CI and locally without secrets.
//
// Run: node scripts/smoke-outbound-golive-guard.mjs
//      (or: npm run smoke:outbound-golive)

import { validateProviderSandboxOutbound } from "@ai-omni/shared";

const tenantId = "tenant-golive-1";
const allowedRecipient = "Uallowlisted000000000000000000001";

// A fully-open, correctly-scoped sandbox config: guard should ALLOW.
const readyEnv = {
  PROVIDER_OUTBOUND_ENABLED: "true",
  PROVIDER_OUTBOUND_MODE: "sandbox",
  PROVIDER_SANDBOX_MODE: "enabled",
  CHANNEL_MODE: "sandbox",
  LINE_SANDBOX_ALLOWLIST: allowedRecipient
};

function check(env, overrides = {}) {
  return validateProviderSandboxOutbound({
    provider: "line",
    recipientId: allowedRecipient,
    tenantId,
    channelAccountTenantId: tenantId,
    env,
    ...overrides
  });
}

const results = [];
function record(name, passed, detail = "") {
  results.push({ name, passed });
  const status = passed ? "PASS" : "FAIL";
  console.log(`[${status}] ${name}${detail ? ` — ${detail}` : ""}`);
}

function main() {
  // Happy path: all gates satisfied -> allowed.
  const allowed = check(readyEnv);
  record("allows send when all gates pass", allowed.allowed === true, allowed.reason);

  // Each gate, when broken, must block with the expected reason.
  const blockCases = [
    ["blocks when provider outbound disabled", { ...readyEnv, PROVIDER_OUTBOUND_ENABLED: "false" }, "provider_outbound_disabled"],
    ["blocks when outbound mode disabled", { ...readyEnv, PROVIDER_OUTBOUND_MODE: "disabled" }, "provider_outbound_disabled"],
    ["blocks when sandbox mode disabled", { ...readyEnv, PROVIDER_SANDBOX_MODE: "disabled" }, "provider_sandbox_disabled"],
    ["blocks when channel mode not enabled", { ...readyEnv, CHANNEL_MODE: "mock" }, "provider_channel_mode_not_enabled"],
    ["blocks when allowlist empty", { ...readyEnv, LINE_SANDBOX_ALLOWLIST: "" }, "allowlist_required"]
  ];

  for (const [name, env, expectedReason] of blockCases) {
    const result = check(env);
    record(name, result.allowed === false && result.reason === expectedReason, result.reason);
  }

  // Recipient not on allowlist must block even with everything else enabled.
  const foreignRecipient = check(readyEnv, { recipientId: "Unot-allowlisted-recipient" });
  record(
    "blocks recipient outside allowlist",
    foreignRecipient.allowed === false && foreignRecipient.reason === "recipient_not_allowlisted",
    foreignRecipient.reason
  );

  // Cross-tenant channel ownership must block (prevents sending via another
  // tenant's channel account).
  const crossTenant = check(readyEnv, { channelAccountTenantId: "tenant-other" });
  record(
    "blocks cross-tenant channel ownership",
    crossTenant.allowed === false && crossTenant.reason === "tenant_ownership_required",
    crossTenant.reason
  );

  const failed = results.filter((r) => !r.passed);
  console.log("");
  console.log(`${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length > 0) {
    console.error(`✖ ${failed.length} guard check(s) failed`);
    process.exit(1);
  }
  console.log("✅ Outbound guard blocks every unsafe path and allows only fully-gated sandbox sends.");
}

main();
