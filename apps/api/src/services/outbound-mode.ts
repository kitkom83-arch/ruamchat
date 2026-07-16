/**
 * Whether real outbound delivery is enabled. When true, outbound messages
 * (agent manual replies) are enqueued for the worker to deliver to the channel
 * (or, for webchat, relayed to the customer widget over realtime). When false,
 * outbound stays mock-only and is recorded as an audit log without delivery.
 *
 * The worker still applies the full per-recipient sandbox allowlist / tenant
 * ownership guard before any real provider push happens, so enabling this flag
 * alone never sends to an un-allowlisted recipient.
 */
export function outboundDeliveryEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  const enabled = (env.PROVIDER_OUTBOUND_ENABLED ?? "false").trim().toLowerCase() === "true";
  const mode = (env.PROVIDER_OUTBOUND_MODE ?? "disabled").trim().toLowerCase();
  return enabled && (mode === "real" || mode === "sandbox");
}
