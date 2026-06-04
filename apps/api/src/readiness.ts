import {
  type ProviderSandboxProvider,
  providerSandboxProviders,
  summarizeProviderSandboxAllowlist
} from "@ai-omni/shared";
import { getProviderWebhookGuardrailReadinessSnapshot } from "./services/provider-webhook-events.service.js";

type EnvLike = Record<string, string | undefined>;

const providerCredentials: Record<ProviderSandboxProvider, { access: string; webhook: string }> = {
  line: { access: "LINE_CHANNEL_ACCESS_TOKEN", webhook: "LINE_CHANNEL_SECRET" },
  telegram: { access: "TELEGRAM_BOT_TOKEN", webhook: "TELEGRAM_WEBHOOK_SECRET" },
  facebook: { access: "FACEBOOK_PAGE_ACCESS_TOKEN", webhook: "META_APP_SECRET" },
  instagram: { access: "INSTAGRAM_ACCESS_TOKEN", webhook: "META_APP_SECRET" }
};

export function buildReadinessSnapshot(env: EnvLike = process.env) {
  const apiMode = normalized(env.API_MODE, "local");
  const dataMode = normalized(env.DATA_MODE, "not_configured");
  const publicDataMode = normalized(env.NEXT_PUBLIC_DATA_MODE, "not_configured");
  const aiMode = normalized(env.AI_MODE, "mock");
  const channelMode = normalized(env.CHANNEL_MODE, "mock");
  const metaChannelMode = normalized(env.META_CHANNEL_MODE, "mock");
  const providerOutboundMode = normalized(env.PROVIDER_OUTBOUND_MODE, "disabled");
  const providerOutboundModeEnabled = providerOutboundMode === "real" || providerOutboundMode === "sandbox";
  const providerOutboundEnabled = normalized(env.PROVIDER_OUTBOUND_ENABLED, "false") === "true" && providerOutboundModeEnabled;
  const sandboxMode = normalized(env.PROVIDER_SANDBOX_MODE, "disabled");
  const sandboxEnabled = sandboxMode === "enabled";
  const allowlist = summarizeProviderSandboxAllowlist(env);
  const providerChannelEnabled = channelMode === "real" || channelMode === "sandbox" || metaChannelMode === "real" || metaChannelMode === "sandbox";
  const realOutboundEnabled = providerOutboundEnabled && sandboxEnabled && providerChannelEnabled && allowlist.configured;
  const databaseConfigured = configured(env.DATABASE_URL);
  const redisConfigured = configured(env.REDIS_URL);
  const webhookGuardrails = getProviderWebhookGuardrailReadinessSnapshot();

  return {
    status: "ok" as const,
    service: "api" as const,
    time: new Date().toISOString(),
    externalCalls: 0 as const,
    allowlist: {
      configured: allowlist.configured,
      entryCount: allowlist.entryCount
    },
    apiMode: {
      apiMode,
      dataMode,
      publicDataMode,
      apiModeExplicit: configured(env.API_MODE),
      dataModeExplicit: configured(env.DATA_MODE),
      publicDataModeExplicit: configured(env.NEXT_PUBLIC_DATA_MODE),
      apiBaseConfigured: configured(env.NEXT_PUBLIC_API_BASE_URL ?? env.API_PUBLIC_BASE_URL)
    },
    dependencies: {
      databaseConfigured,
      redisConfigured
    },
    providerReadiness: {
      mode: providerOutboundMode,
      outboundEnabledByEnv: providerOutboundEnabled,
      sandboxMode,
      sandboxEnabled,
      channelMode,
      metaChannelMode,
      realOutboundEnabled,
      allowlistCount: allowlist.entryCount,
      allowlist: {
        configured: allowlist.configured,
        entryCount: allowlist.entryCount
      },
      webhookSignatureVerificationConfigured: webhookGuardrails.webhookSignatureVerificationConfigured,
      webhookSignatureVerificationReady: webhookGuardrails.webhookSignatureVerificationReady,
      replayGuardrailsEnabled: webhookGuardrails.replayGuardrailsEnabled,
      lastSandboxEventSignatureStatus: webhookGuardrails.lastSandboxEventSignatureStatus,
      latestReplayStatus: webhookGuardrails.latestReplayStatus,
      replayDetectedCount: webhookGuardrails.replayDetectedCount,
      webhookNormalizationEnabled: webhookGuardrails.webhookNormalizationEnabled,
      webhookDryRunRoutingEnabled: webhookGuardrails.webhookDryRunRoutingEnabled,
      lastSandboxEventNormalizationStatus: webhookGuardrails.lastSandboxEventNormalizationStatus,
      latestRoutingStatus: webhookGuardrails.latestRoutingStatus,
      normalizedEventCount: webhookGuardrails.normalizedEventCount,
      routingBlockedCount: webhookGuardrails.routingBlockedCount,
      webhookInboundPersistenceEnabled: webhookGuardrails.webhookInboundPersistenceEnabled,
      latestInboundPersistenceStatus: webhookGuardrails.latestInboundPersistenceStatus,
      persistedInboundMessageCount: webhookGuardrails.persistedInboundMessageCount,
      inboundPersistenceBlockedCount: webhookGuardrails.inboundPersistenceBlockedCount,
      inboundPersistenceReplayBlockedCount: webhookGuardrails.inboundPersistenceReplayBlockedCount,
      inboundPersistenceSkippedNoMatchCount: webhookGuardrails.inboundPersistenceSkippedNoMatchCount,
      webhookUnmatchedInboundReviewEnabled: webhookGuardrails.webhookUnmatchedInboundReviewEnabled,
      webhookUnmatchedReviewActionsEnabled: webhookGuardrails.webhookUnmatchedReviewActionsEnabled,
      webhookCandidateLookupEnabled: webhookGuardrails.webhookCandidateLookupEnabled,
      webhookUnmatchedHistoryEnabled: webhookGuardrails.webhookUnmatchedHistoryEnabled,
      webhookUnmatchedQueueExportEnabled: webhookGuardrails.webhookUnmatchedQueueExportEnabled,
      webhookUnmatchedQueueExportMaxLimit: webhookGuardrails.webhookUnmatchedQueueExportMaxLimit,
      webhookReviewMetricsEnabled: webhookGuardrails.webhookReviewMetricsEnabled,
      webhookDiagnosticsEnabled: webhookGuardrails.webhookDiagnosticsEnabled,
      webhookReviewAlertsEnabled: webhookGuardrails.webhookReviewAlertsEnabled,
      webhookReviewQueueHealthEnabled: webhookGuardrails.webhookReviewQueueHealthEnabled,
      reviewTriageEnabled: webhookGuardrails.reviewTriageEnabled,
      triageGuidanceEnabled: webhookGuardrails.triageGuidanceEnabled,
      reviewSavedViewsEnabled: webhookGuardrails.reviewSavedViewsEnabled,
      operatorNotesEnabled: webhookGuardrails.operatorNotesEnabled,
      reviewAssignmentEnabled: webhookGuardrails.reviewAssignmentEnabled,
      reviewEscalationEnabled: webhookGuardrails.reviewEscalationEnabled,
      assignmentWorkloadEnabled: webhookGuardrails.assignmentWorkloadEnabled,
      reviewResolutionEnabled: webhookGuardrails.reviewResolutionEnabled,
      reviewClosureChecklistEnabled: webhookGuardrails.reviewClosureChecklistEnabled,
      resolutionSummaryEnabled: webhookGuardrails.resolutionSummaryEnabled,
      reviewClosureEvidenceEnabled: webhookGuardrails.reviewClosureEvidenceEnabled,
      reviewClosureReportEnabled: webhookGuardrails.reviewClosureReportEnabled,
      reviewClosureEvidenceExportEnabled: webhookGuardrails.reviewClosureEvidenceExportEnabled,
      reviewClosureReportExportEnabled: webhookGuardrails.reviewClosureReportExportEnabled,
      savedViewCount: webhookGuardrails.savedViewCount,
      operatorNoteCount: webhookGuardrails.operatorNoteCount,
      unassignedOpenCount: webhookGuardrails.unassignedOpenCount,
      assignedOpenCount: webhookGuardrails.assignedOpenCount,
      escalatedOpenCount: webhookGuardrails.escalatedOpenCount,
      unresolvedOpenCount: webhookGuardrails.unresolvedOpenCount,
      readyForClosureCount: webhookGuardrails.readyForClosureCount,
      blockedResolutionCount: webhookGuardrails.blockedResolutionCount,
      checklistIncompleteOpenCount: webhookGuardrails.checklistIncompleteOpenCount,
      closureEvidenceReadyCount: webhookGuardrails.closureEvidenceReadyCount,
      closureEvidenceBlockedCount: webhookGuardrails.closureEvidenceBlockedCount,
      closureEvidenceIncompleteCount: webhookGuardrails.closureEvidenceIncompleteCount,
      closureEvidenceExportCount: webhookGuardrails.closureEvidenceExportCount,
      closureReportExportCount: webhookGuardrails.closureReportExportCount,
      reviewAlertCriticalCount: webhookGuardrails.reviewAlertCriticalCount,
      criticalTriageCount: webhookGuardrails.criticalTriageCount,
      openTriageCount: webhookGuardrails.openTriageCount,
      unmatchedInboundOpenCount: webhookGuardrails.unmatchedInboundOpenCount,
      unmatchedInboundStaleOpenCount: webhookGuardrails.unmatchedInboundStaleOpenCount,
      unmatchedInboundQueuedCount: webhookGuardrails.unmatchedInboundQueuedCount,
      unmatchedInboundReplayBlockedCount: webhookGuardrails.unmatchedInboundReplayBlockedCount,
      unmatchedInboundReviewedCount: webhookGuardrails.unmatchedInboundReviewedCount,
      unmatchedInboundSkippedCount: webhookGuardrails.unmatchedInboundSkippedCount,
      unmatchedInboundLinkedCount: webhookGuardrails.unmatchedInboundLinkedCount,
      latestUnmatchedInboundStatus: webhookGuardrails.latestUnmatchedInboundStatus,
      latestUnmatchedReviewActionStatus: webhookGuardrails.latestUnmatchedReviewActionStatus,
      latestUnmatchedLinkStatus: webhookGuardrails.latestUnmatchedLinkStatus,
      lastSandboxEventAt: webhookGuardrails.lastSandboxEventAt,
      externalCalls: 0 as const,
      providers: providerSandboxProviders.map((name) => providerReadiness(name, env, {
        providerOutboundEnabled,
        sandboxEnabled,
        providerChannelEnabled: providerChannelModeEnabled(name, channelMode, metaChannelMode),
        allowlistConfigured: allowlist.configured
      }))
    },
    monitoring: {
      auditSafetyBaseline: true,
      providerPayloadsExposed: false,
      externalCalls: 0 as const
    },
    checks: [
      check("api mode explicit", configured(env.API_MODE)),
      check("web data mode explicit", configured(env.NEXT_PUBLIC_DATA_MODE)),
      check("web API base configured", configured(env.NEXT_PUBLIC_API_BASE_URL ?? env.API_PUBLIC_BASE_URL)),
      check("database configured", databaseConfigured),
      check("redis configured", redisConfigured),
      check("provider outbound disabled", !realOutboundEnabled),
      check("provider outbound flag disabled by default", !providerOutboundEnabled),
      check("provider sandbox disabled by default", !sandboxEnabled),
      check("AI mode safe for pilot", aiMode === "mock")
    ]
  };
}

function providerReadiness(
  name: ProviderSandboxProvider,
  env: EnvLike,
  gates: { providerOutboundEnabled: boolean; sandboxEnabled: boolean; providerChannelEnabled: boolean; allowlistConfigured: boolean }
) {
  const keys = providerCredentials[name];
  const credentialConfigured = configured(env[keys.access]);
  const webhookConfigured = configured(env[keys.webhook]);
  const allowlist = summarizeProviderSandboxAllowlist(env).providers.find((provider) => provider.name === name);
  const allowlistConfigured = Boolean(allowlist && allowlist.entryCount > 0);
  return {
    name,
    configured: credentialConfigured,
    credentialStatus: credentialConfigured ? "configured" : "not_configured",
    webhookStatus: webhookConfigured ? "configured" : "not_configured",
    webhookVerificationReady: webhookConfigured,
    webhookVerificationConfigured: webhookConfigured,
    outboundEnabled: false,
    status: providerStatus(gates, allowlistConfigured)
  };
}

function providerStatus(
  gates: { providerOutboundEnabled: boolean; sandboxEnabled: boolean; providerChannelEnabled: boolean; allowlistConfigured: boolean },
  providerAllowlistConfigured: boolean
) {
  if (!gates.providerOutboundEnabled) return "disabled_by_default";
  if (!gates.sandboxEnabled) return "blocked_sandbox_required";
  if (!gates.providerChannelEnabled) return "blocked_channel_mode_required";
  if (!gates.allowlistConfigured || !providerAllowlistConfigured) return "blocked_allowlist_required";
  return "sandbox_ready_recipient_check_required";
}

function providerChannelModeEnabled(name: ProviderSandboxProvider, channelMode: string, metaChannelMode: string) {
  const mode = name === "facebook" || name === "instagram" ? metaChannelMode : channelMode;
  return mode === "real" || mode === "sandbox";
}

function check(name: string, ok: boolean) {
  return { name, ok };
}

function configured(value: string | undefined) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalized(value: string | undefined, fallback: string) {
  const trimmed = value?.trim().toLowerCase();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
}
