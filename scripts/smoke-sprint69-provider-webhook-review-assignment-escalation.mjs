import crypto from "node:crypto";
import { readFileSync } from "node:fs";

const baseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");
const tenantId = process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.TENANT_ID ?? "00000000-0000-4000-8000-000000000001";
const userId = process.env.USER_ID ?? "00000000-0000-4000-8000-000000000011";
const signingMaterial = process.env.PROVIDER_WEBHOOK_SANDBOX_SIGNING_KEY ?? "local-provider-webhook-sandbox-signing-material";
const runId = `sprint69-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const results = [];

async function main() {
  record("local API only", isLocalBaseUrl(baseUrl));

  const rootPackage = JSON.parse(readFileSync("package.json", "utf8"));
  const shared = readFileSync("packages/shared/src/index.ts", "utf8");
  const providerController = readFileSync("apps/api/src/controllers/provider-webhooks.controller.ts", "utf8");
  const providerService = readFileSync("apps/api/src/services/provider-webhook-events.service.ts", "utf8");
  const readiness = readFileSync("apps/api/src/readiness.ts", "utf8");
  const apiClient = readFileSync("apps/web/app/api-client.ts", "utf8");
  const settingsData = readFileSync("apps/web/app/settings-data.ts", "utf8");
  const providerPanel = readFileSync("apps/web/app/settings/provider-readiness-panel.tsx", "utf8");

  record("smoke script registered", rootPackage.scripts?.["smoke:sprint69"] === "node scripts/smoke-sprint69-provider-webhook-review-assignment-escalation.mjs");
  for (const sprint of [68, 67, 66, 65, 64, 63, 62, 61, 60, 59, 58, 57, 56, 55, 54, 53]) {
    record(`Sprint ${sprint} regression script registered`, typeof rootPackage.scripts?.[`smoke:sprint${sprint}`] === "string");
  }
  record("shared assignment escalation DTOs registered", shared.includes("providerWebhookUnmatchedInboundAssignmentRequestSchema") && shared.includes("providerWebhookReviewWorkloadSchema"));
  record("backend assignment escalation endpoints registered", providerController.includes("review-workload") && providerController.includes("bulk-assignment") && providerController.includes("bulk-escalation"));
  record("service implements metadata-only assignment escalation", providerService.includes("applyAssignmentToItem") && providerService.includes("applyEscalationToItem") && providerService.includes("recordMetadataAudit"));
  record("readiness exposes Sprint 69 capabilities", readiness.includes("reviewAssignmentEnabled") && readiness.includes("reviewEscalationEnabled") && readiness.includes("assignmentWorkloadEnabled"));
  record("API client sends assignment escalation workload requests", apiClient.includes("assignProviderWebhookUnmatchedInbound") && apiClient.includes("bulkEscalateProviderWebhookUnmatchedInbound") && apiClient.includes("/provider-webhooks/review-workload"));
  record("settings data keeps API metadata backend-only", settingsData.includes("assignSettingsProviderWebhookUnmatchedInbound") && settingsData.includes("loadSettingsProviderWebhookReviewWorkloadData"));
  record("provider UI renders assignment escalation controls", providerPanel.includes("Assignment workload") && providerPanel.includes("Assign to me") && providerPanel.includes("Escalate SLA risk"));

  const health = await safeJson(await request("GET", "/health"));
  record("GET /health reachable", health?.status === "ok" && health?.service === "api");
  record("health response safe", safePayloadObject(health));

  const readinessBefore = await safeJson(await request("GET", "/health/readiness"));
  record("GET /health/readiness reachable", readinessBefore?.status === "ok" && safeReadinessSprint69Summary(readinessBefore?.providerReadiness));
  record("readiness externalCalls=0", noNonzeroExternalCalls(readinessBefore));
  record("readiness safe", safePayloadObject(readinessBefore));

  const metricsBefore = await safeJson(await request("GET", "/provider-webhooks/review-metrics"));
  const alertsBefore = await safeJson(await request("GET", "/provider-webhooks/review-alerts"));
  const triageBefore = await safeJson(await request("GET", "/provider-webhooks/review-triage"));
  const workloadBefore = await safeJson(await request("GET", "/provider-webhooks/review-workload"));
  const unmatchedBefore = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound?limit=10&offset=0&sortBy=receivedAt&sortOrder=desc"));
  record("GET review metrics reachable", safeMetricsShape(metricsBefore));
  record("GET review alerts reachable", safeAlertsShape(alertsBefore));
  record("GET review triage reachable", safeTriageShape(triageBefore));
  record("GET review workload reachable", safeWorkloadShape(workloadBefore));
  record("GET unmatched inbound reachable", safePageShape(unmatchedBefore));
  record("initial review surfaces safe", safePayloadObject({ metricsBefore, alertsBefore, triageBefore, workloadBefore, unmatchedBefore }));

  const assignItem = await createNoMatchItem("assign", "Safe Sprint 69 assignment target");
  const bulkItem = await createNoMatchItem("bulk", "Safe Sprint 69 bulk target");
  record("POST valid signed sandbox no-match events created unmatched items", [assignItem, bulkItem].every((item) => item?.unmatchedStatus === "review-needed"));

  const unmatchedAfterCreate = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound?provider=line&reviewStatus=pending&linkStatus=none&status=open&eventType=message.created&limit=25&offset=0&sortBy=receivedAt&sortOrder=desc"));
  record("created unmatched items appear", safePageShape(unmatchedAfterCreate) && [assignItem.id, bulkItem.id].every((id) => unmatchedAfterCreate.items.some((item) => item.id === id)));

  const assignBefore = unmatchedAfterCreate.items.find((item) => item.id === assignItem.id);
  const assigned = await safeJson(await request("PATCH", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(assignItem.id)}/assignment`, {
    operation: "ASSIGN_TO_ME",
    note: "Safe Sprint 69 assignment"
  }));
  record("Assign to me endpoint reachable", safeUnmatchedItemShape(assigned) && assigned.assignmentStatus === "assigned" && assigned.assignedToOperatorLabel?.startsWith("operator:"));
  record("assignment persisted as metadata only", assigned.reviewStatus === assignBefore.reviewStatus && assigned.linkStatus === assignBefore.linkStatus && assigned.unmatchedStatus === assignBefore.unmatchedStatus && assigned.messagePersisted === false);
  record("assignment response safe", safePayloadObject(assigned));

  const workloadAfterAssign = await safeJson(await request("GET", "/provider-webhooks/review-workload?provider=line&assignmentStatus=assigned_to_me&reviewStatus=pending&linkStatus=none&unmatchedStatus=review-needed"));
  record("workload assigned-to-me filter reachable", safeWorkloadShape(workloadAfterAssign) && workloadAfterAssign.appliedFilters.assignmentStatus === "assigned_to_me" && workloadAfterAssign.counts.assignedToMeOpen >= 1);
  record("workload assigned response safe", safePayloadObject(workloadAfterAssign));

  const escalated = await safeJson(await request("PATCH", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(assignItem.id)}/escalation`, {
    operation: "ESCALATE",
    escalationReason: "SLA_RISK",
    note: "Safe Sprint 69 escalation"
  }));
  record("Escalate endpoint reachable", safeUnmatchedItemShape(escalated) && escalated.escalationStatus === "escalated" && escalated.escalationReason === "SLA_RISK");
  record("escalation persisted as metadata only", escalated.reviewStatus === assignBefore.reviewStatus && escalated.linkStatus === assignBefore.linkStatus && escalated.unmatchedStatus === assignBefore.unmatchedStatus && escalated.messagePersisted === false);
  record("escalation response safe", safePayloadObject(escalated));

  const workloadAfterEscalate = await safeJson(await request("GET", "/provider-webhooks/review-workload?provider=line&escalationStatus=escalated&escalationReason=SLA_RISK&severity=info"));
  record("workload escalation filters reachable", safeWorkloadShape(workloadAfterEscalate) && workloadAfterEscalate.appliedFilters.escalationStatus === "escalated" && workloadAfterEscalate.appliedFilters.escalationReason === "SLA_RISK" && workloadAfterEscalate.counts.escalatedOpen >= 1);
  record("workload escalation applied filters safe", safePayloadObject(workloadAfterEscalate.appliedFilters));

  const diagnosticsAfterEscalate = await safeJson(await request("GET", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(assignItem.id)}/diagnostics`));
  record("GET diagnostics includes safe metadata", safeDiagnosticsShape(diagnosticsAfterEscalate) && diagnosticsAfterEscalate.assignmentStatus === "assigned" && diagnosticsAfterEscalate.escalationStatus === "escalated" && diagnosticsAfterEscalate.escalationReason === "SLA_RISK");

  const historyAfterEscalate = await safeJson(await request("GET", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(assignItem.id)}/history`));
  record("GET history contains assignment escalation events", safeHistoryShape(historyAfterEscalate) && historyAfterEscalate.entries.some((entry) => entry.action === "assigned") && historyAfterEscalate.entries.some((entry) => entry.action === "escalated"));

  const notesAfterEscalate = await safeJson(await request("GET", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(assignItem.id)}/operator-notes`));
  record("GET operator notes contains safe assignment escalation notes", Array.isArray(notesAfterEscalate) && notesAfterEscalate.every(safeOperatorNoteShape) && notesAfterEscalate.some((note) => note.note.includes("assignment updated")) && notesAfterEscalate.some((note) => note.note.includes("escalation updated")));
  record("diagnostics history notes safe", safePayloadObject({ diagnosticsAfterEscalate, historyAfterEscalate, notesAfterEscalate }));

  const bulkAssigned = await safeJson(await request("PATCH", "/provider-webhooks/unmatched-inbound/bulk-assignment", {
    ids: [bulkItem.id],
    operation: "ASSIGN_TO_ME",
    note: "Safe Sprint 69 bulk assignment"
  }));
  record("Bulk assignment endpoint reachable", safeBulkMetadataShape(bulkAssigned) && bulkAssigned.operation === "ASSIGN_TO_ME" && bulkAssigned.summary.successCount === 1);

  const bulkEscalated = await safeJson(await request("PATCH", "/provider-webhooks/unmatched-inbound/bulk-escalation", {
    ids: [bulkItem.id],
    operation: "ESCALATE",
    escalationReason: "NEEDS_MANAGER_REVIEW",
    note: "Safe Sprint 69 bulk escalation"
  }));
  record("Bulk escalation endpoint reachable", safeBulkMetadataShape(bulkEscalated) && bulkEscalated.operation === "ESCALATE" && bulkEscalated.summary.successCount === 1);
  record("bulk metadata responses safe", safePayloadObject({ bulkAssigned, bulkEscalated }));

  const unassigned = await safeJson(await request("PATCH", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(assignItem.id)}/assignment`, {
    operation: "UNASSIGN",
    note: "Safe Sprint 69 unassign"
  }));
  const cleared = await safeJson(await request("PATCH", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(assignItem.id)}/escalation`, {
    operation: "CLEAR_ESCALATION",
    note: "Safe Sprint 69 clear escalation"
  }));
  record("Unassign endpoint reachable", safeUnmatchedItemShape(unassigned) && unassigned.assignmentStatus === "unassigned" && unassigned.assignedToOperatorLabel === null);
  record("Clear escalation endpoint reachable", safeUnmatchedItemShape(cleared) && cleared.escalationStatus === "none" && cleared.escalationReason === null);
  record("clear metadata did not mutate review/link/message state", cleared.reviewStatus === assignBefore.reviewStatus && cleared.linkStatus === assignBefore.linkStatus && cleared.unmatchedStatus === assignBefore.unmatchedStatus && cleared.messagePersisted === false);

  const historyAfterClear = await safeJson(await request("GET", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(assignItem.id)}/history`));
  const workloadAfterClear = await safeJson(await request("GET", "/provider-webhooks/review-workload?provider=line&assignmentStatus=unassigned&escalationStatus=none"));
  record("history contains unassign and clear escalation events", safeHistoryShape(historyAfterClear) && historyAfterClear.entries.some((entry) => entry.action === "unassigned") && historyAfterClear.entries.some((entry) => entry.action === "escalation_cleared"));
  record("workload refetch after clear reachable", safeWorkloadShape(workloadAfterClear) && workloadAfterClear.appliedFilters.assignmentStatus === "unassigned" && workloadAfterClear.appliedFilters.escalationStatus === "none");

  const reviewed = await safeJson(await request("PATCH", `/provider-webhooks/unmatched-inbound/${encodeURIComponent(assignItem.id)}/review`, {
    status: "reviewed",
    reason: "safe sprint 69 review after metadata"
  }));
  const bulkReviewed = await safeJson(await request("PATCH", "/provider-webhooks/unmatched-inbound/bulk-review", {
    ids: [bulkItem.id],
    reviewStatus: "skipped",
    reason: "safe sprint 69 bulk review after metadata"
  }));
  record("single review still works after metadata", safeUnmatchedItemShape(reviewed) && reviewed.reviewStatus === "reviewed" && reviewed.assignmentStatus === "unassigned" && reviewed.escalationStatus === "none");
  record("bulk review still works after metadata", safeBulkReviewShape(bulkReviewed) && bulkReviewed.summary.successCount === 1);

  const metricsAfter = await safeJson(await request("GET", "/provider-webhooks/review-metrics"));
  const alertsAfter = await safeJson(await request("GET", "/provider-webhooks/review-alerts"));
  const triageAfter = await safeJson(await request("GET", "/provider-webhooks/review-triage"));
  const workloadAfter = await safeJson(await request("GET", "/provider-webhooks/review-workload"));
  const exported = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound/export?provider=line&eventType=message.created&limit=25&offset=0&sortBy=receivedAt&sortOrder=desc&format=json"));
  const eventsAfter = await safeJson(await request("GET", "/provider-webhooks/events"));
  const readinessAfter = await safeJson(await request("GET", "/health/readiness"));

  record("review metrics refetch reachable", safeMetricsShape(metricsAfter));
  record("review alerts refetch reachable", safeAlertsShape(alertsAfter));
  record("review triage refetch reachable", safeTriageShape(triageAfter));
  record("review workload refetch reachable", safeWorkloadShape(workloadAfter));
  record("GET unmatched export reachable", safeExportShape(exported));
  record("GET provider webhook events reachable", Array.isArray(eventsAfter) && eventsAfter.every(safeEventShape));
  record("readiness confirms Sprint 69 and externalCalls=0", safeReadinessSprint69Summary(readinessAfter?.providerReadiness) && noNonzeroExternalCalls(readinessAfter));

  const fullSurface = {
    health,
    readinessBefore,
    metricsBefore,
    alertsBefore,
    triageBefore,
    workloadBefore,
    unmatchedBefore,
    unmatchedAfterCreate,
    assigned,
    workloadAfterAssign,
    escalated,
    workloadAfterEscalate,
    diagnosticsAfterEscalate,
    historyAfterEscalate,
    notesAfterEscalate,
    bulkAssigned,
    bulkEscalated,
    unassigned,
    cleared,
    historyAfterClear,
    workloadAfterClear,
    reviewed,
    bulkReviewed,
    metricsAfter,
    alertsAfter,
    triageAfter,
    workloadAfter,
    exported,
    eventsAfter,
    readinessAfter
  };
  record("all Sprint 69 responses safe", safePayloadObject(fullSurface));
  record("externalCalls=0 throughout", noNonzeroExternalCalls(fullSurface));
  record("no provider outbound", !containsProviderOutbound(fullSurface));
  record("no external notification sending", !containsExternalNotification(fullSurface));
  record("no AI/OpenAI call evidence", !containsAiCall(fullSurface));
  record("no live provider network evidence", noLiveProviderNetworkEvidence(fullSurface));

  finish();
}

async function createNoMatchItem(label, text) {
  const eventId = `${runId}-${label}-${Math.random().toString(16).slice(2)}`;
  const payload = linePayload(`safe-no-match-room-sprint69-${label}-${runId}`, `safe-sender-sprint69-${label}`, text);
  payload[`safeMarker${label.replace(/[^a-z0-9]/gi, "")}${Date.now()}`] = true;
  const response = await request("POST", "/provider-webhooks/sandbox-events", {
    provider: "line",
    channel: "line",
    eventType: "message.created",
    mode: "sandbox",
    inboundPersistenceMode: "sandbox-persist",
    eventId,
    timestamp: "2026-06-03T06:00:00.000Z",
    signature: signPayload(payload),
    payload
  });
  const body = await safeJson(response);
  record(`POST valid signed sandbox no-match event reachable (${label})`, response.status === 201 || response.status === 200);
  record(`valid event safe DTO (${label})`, safeEventShape(body) && safePayloadObject(body));
  const unmatched = await safeJson(await request("GET", "/provider-webhooks/unmatched-inbound?limit=50&offset=0&sortBy=receivedAt&sortOrder=desc"));
  return unmatchedItems(unmatched).find((item) => item.id === body?.unmatchedInboundId) ?? null;
}

async function request(method, path, body, extraHeaders = {}) {
  return fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      "x-tenant-id": tenantId,
      "x-user-id": userId,
      ...extraHeaders
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
}

async function safeJson(response) {
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

function linePayload(roomId, userId, text) {
  return {
    events: [{
      type: "message",
      timestamp: 1760000000000,
      replyToken: "raw-reply-token-sprint69",
      source: { type: "room", userId, roomId },
      message: { id: "safe-message-sprint69", type: "text", text }
    }]
  };
}

function signPayload(payload) {
  return `sha256=${crypto.createHmac("sha256", signingMaterial).update(canonicalJson(payload)).digest("hex")}`;
}

function canonicalJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((item) => canonicalJson(item)).join(",")}]`;
  return `{${Object.entries(value).sort(([left], [right]) => left.localeCompare(right)).map(([key, child]) => `${JSON.stringify(key)}:${canonicalJson(child)}`).join(",")}}`;
}

function unmatchedItems(value) {
  if (Array.isArray(value)) return value;
  if (value && Array.isArray(value.items)) return value.items;
  return [];
}

function safePageShape(value) {
  if (!value || typeof value !== "object" || !Array.isArray(value.items)) return false;
  const allowed = new Set(["items", "pagination", "appliedFilters", "appliedSort", "summary", "externalCalls"]);
  return Object.keys(value).every((key) => allowed.has(key))
    && value.items.every(safeUnmatchedItemShape)
    && value.pagination?.totalCount >= value.items.length
    && value.pagination?.limit > 0
    && value.pagination?.offset >= 0
    && value.appliedSort?.sortBy === "receivedAt"
    && ["asc", "desc"].includes(value.appliedSort?.sortOrder)
    && value.externalCalls === 0;
}

function safeMetricsShape(value) {
  if (!value || typeof value !== "object") return false;
  return value.externalCalls === 0
    && Array.isArray(value.byProvider)
    && Array.isArray(value.byEventType)
    && typeof value.totalUnmatched === "number"
    && typeof value.funnel?.unmatchedQueued === "number";
}

function safeAlertsShape(value) {
  if (!value || typeof value !== "object") return false;
  return value.externalCalls === 0
    && Array.isArray(value.alertItems)
    && Array.isArray(value.bySeverity)
    && typeof value.thresholds?.staleWarningHours === "number";
}

function safeTriageShape(value) {
  if (!value || typeof value !== "object") return false;
  return value.externalCalls === 0
    && Array.isArray(value.lanes)
    && Array.isArray(value.topItems)
    && typeof value.totalTriageLanes === "number"
    && value.topItems.every((item) => item.externalCalls === 0);
}

function safeWorkloadShape(value) {
  if (!value || typeof value !== "object") return false;
  return value.externalCalls === 0
    && typeof value.counts?.unassignedOpen === "number"
    && typeof value.counts?.assignedOpen === "number"
    && typeof value.counts?.escalatedOpen === "number"
    && Array.isArray(value.byAssignee)
    && Array.isArray(value.byAssignmentStatus)
    && Array.isArray(value.byEscalationStatus)
    && Array.isArray(value.byEscalationReason)
    && Array.isArray(value.topAssignedItems)
    && Array.isArray(value.topEscalatedItems)
    && [...value.topAssignedItems, ...value.topEscalatedItems].every((item) => item.externalCalls === 0);
}

function safeDiagnosticsShape(value) {
  if (!value || typeof value !== "object") return false;
  const allowed = new Set([
    "unmatchedId", "provider", "platform", "channelAccountId", "safeRoomLabel", "roomKeyDigest",
    "eventType", "receivedAt", "reviewStatus", "linkStatus", "unmatchedStatus",
    "assignmentStatus", "assignedToOperatorLabel", "assignedAt", "assignedByOperatorLabel",
    "escalationStatus", "escalationReason", "escalatedAt", "escalatedByOperatorLabel",
    "resolutionStatus", "resolutionOutcome", "resolvedAt", "resolvedByOperatorLabel",
    "closureReadiness", "closureChecklist", "checklistCompletedCount", "checklistTotalCount",
    "checklistIncompleteSteps", "recommendedNextActions",
    "lastOperatorNoteAt", "routingOutcome", "normalizedEventType", "persistenceOutcome",
    "candidateLookupAvailable", "historyAvailable", "exportAvailable", "lastActionAt",
    "safeWarnings", "externalCalls"
  ]);
  return Object.keys(value).every((key) => allowed.has(key)) && value.provider === value.platform && value.externalCalls === 0;
}

function safeHistoryShape(value) {
  if (!value || typeof value !== "object" || !Array.isArray(value.entries)) return false;
  const allowed = new Set(["unmatchedInboundId", "provider", "channelAccountId", "safeRoomLabel", "roomKeyDigest", "entries", "externalCalls"]);
  const entryAllowed = new Set([
    "id", "unmatchedInboundId", "provider", "channelAccountId", "safeRoomLabel", "roomKeyDigest",
    "eventType", "action", "actionStatus", "statusBefore", "statusAfter", "actor", "reason",
    "message", "linkedConversationId", "linkedMessageId", "receivedAt", "actionAt", "externalCalls"
  ]);
  return Object.keys(value).every((key) => allowed.has(key))
    && value.externalCalls === 0
    && value.entries.every((entry) => Object.keys(entry).every((key) => entryAllowed.has(key)) && entry.externalCalls === 0);
}

function safeOperatorNoteShape(value) {
  const allowed = new Set(["id", "unmatchedId", "tenantId", "authorId", "authorLabel", "note", "context", "createdAt", "updatedAt", "externalCalls"]);
  const contextAllowed = new Set([
    "provider", "platform", "channelAccountId", "safeRoomLabel", "roomKeyDigest",
    "eventType", "reviewStatus", "linkStatus", "unmatchedStatus",
    "assignmentStatus", "assignedToOperatorLabel", "escalationStatus", "escalationReason",
    "resolutionStatus", "resolutionOutcome", "closureReadiness", "checklistCompletedCount",
    "checklistTotalCount"
  ]);
  return value && typeof value === "object"
    && Object.keys(value).every((key) => allowed.has(key))
    && Object.keys(value.context ?? {}).every((key) => contextAllowed.has(key))
    && value.context?.provider === value.context?.platform
    && value.externalCalls === 0;
}

function safeEventShape(value) {
  if (!value || typeof value !== "object") return false;
  return value.direction === "inbound" && value.externalCalls === 0 && typeof value.payloadDigest === "string";
}

function safeUnmatchedItemShape(value) {
  if (!value || typeof value !== "object") return false;
  return value.mode === "sandbox"
    && value.conversationLookupStatus === "not-found"
    && ["unassigned", "assigned"].includes(value.assignmentStatus)
    && ["none", "escalated"].includes(value.escalationStatus)
    && value.externalCalls === 0;
}

function safeBulkMetadataShape(value) {
  if (!value || typeof value !== "object" || !Array.isArray(value.results)) return false;
  return value.externalCalls === 0
    && typeof value.summary?.successCount === "number"
    && value.results.every((result) => result.externalCalls === 0 && ["updated", "already-applied", "not-found", "conflict"].includes(result.resultStatus));
}

function safeBulkReviewShape(value) {
  if (!value || typeof value !== "object" || !Array.isArray(value.results)) return false;
  return value.externalCalls === 0
    && typeof value.summary?.successCount === "number"
    && value.results.every((result) => result.externalCalls === 0);
}

function safeExportShape(value) {
  if (!value || typeof value !== "object" || !Array.isArray(value.rows)) return false;
  return value.externalCalls === 0
    && value.rows.every((row) => row.externalCalls === 0 && "assignmentStatus" in row && "escalationStatus" in row);
}

function safeReadinessSprint69Summary(value) {
  return value
    && value.externalCalls === 0
    && value.reviewSavedViewsEnabled === true
    && value.operatorNotesEnabled === true
    && value.reviewAssignmentEnabled === true
    && value.reviewEscalationEnabled === true
    && value.assignmentWorkloadEnabled === true
    && typeof value.unassignedOpenCount === "number"
    && typeof value.assignedOpenCount === "number"
    && typeof value.escalatedOpenCount === "number"
    && value.realOutboundEnabled === false;
}

function safePayloadObject(value) {
  return noRawSecretFields(value) && noRawPayloadValues(value) && noNonzeroExternalCalls(value);
}

function noRawSecretFields(value) {
  return !/token|secret|authorization|cookie|replyToken|rawPayload|providerRaw|payloadJson|raw sender|raw room|senderId|roomId(?!Digest)/i.test(JSON.stringify(value));
}

function noRawPayloadValues(value) {
  return !/raw-reply-token|safe-no-match-room-sprint69|safe-sender-sprint69|raw-line|raw-message-id|provider credential|Bearer|sk-/i.test(JSON.stringify(value));
}

function noNonzeroExternalCalls(value) {
  const serialized = JSON.stringify(value);
  return !/"externalCalls"\s*:\s*(?!0\b)\d+/i.test(serialized);
}

function containsProviderOutbound(value) {
  return /outbound\.queued|outbound\.sent|line\.push|telegram\.send|facebook\.send|instagram\.send|provider outbound true/i.test(JSON.stringify(value));
}

function containsExternalNotification(value) {
  return /slack|email\.sent|notification\.sent|webhook\.sent|line\.push|telegram\.send|facebook\.send|instagram\.send/i.test(JSON.stringify(value));
}

function containsAiCall(value) {
  return /openai|aiRun|chat\.completions|responses\.create|assistant\.create/i.test(JSON.stringify(value));
}

function noLiveProviderNetworkEvidence(value) {
  return !/api\.line\.me|api\.telegram\.org|graph\.facebook\.com|graph\.instagram\.com|live provider network/i.test(JSON.stringify(value));
}

function isLocalBaseUrl(value) {
  return /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d)?\d*$/i.test(value);
}

function record(name, ok) {
  results.push({ name, ok: Boolean(ok) });
  console.log(`${ok ? "PASS" : "FAIL"} ${name}`);
}

function finish() {
  const failed = results.filter((result) => !result.ok);
  console.log(`Sprint 69 smoke results: ${results.length - failed.length}/${results.length} passed`);
  if (failed.length > 0) {
    console.error("Failed checks:");
    for (const result of failed) console.error(`- ${result.name}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
