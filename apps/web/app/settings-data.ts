import type {
  CannedReply,
  CreateProviderWebhookOperatorNoteRequest,
  CreateProviderWebhookReviewSavedViewRequest,
  DataMode,
  ProviderReadiness,
  ProviderWebhookReviewClosureChecklistStep,
  ProviderWebhookReviewRecommendedNextAction,
  ProviderWebhookCandidateConversation,
  ProviderWebhookEvent,
  ProviderWebhookOperatorNote,
  ProviderWebhookReviewAlerts,
  ProviderWebhookReviewAlertsFilters,
  ProviderWebhookReviewAlertAgeBucket,
  ProviderWebhookReviewAlertSeverity,
  ProviderWebhookReviewClosureEvidence,
  ProviderWebhookReviewClosureEvidenceExport,
  ProviderWebhookReviewClosureEvidenceStatus,
  ProviderWebhookReviewClosureReport,
  ProviderWebhookReviewClosureReportExport,
  ProviderWebhookReviewClosureReportFilters,
  ProviderWebhookReviewMetrics,
  ProviderWebhookReviewMetricsFilters,
  ProviderWebhookReviewResolutionSummary,
  ProviderWebhookReviewResolutionSummaryFilters,
  ProviderWebhookReviewTriage,
  ProviderWebhookReviewTriageFilters,
  ProviderWebhookReviewTriageLane,
  ProviderWebhookReviewWorkload,
  ProviderWebhookReviewWorkloadFilters,
  ProviderWebhookReviewSavedView,
  ProviderWebhookUnmatchedInboundAssignmentRequest,
  UpdateProviderWebhookReviewSavedViewRequest,
  ProviderWebhookTriageRecommendedAction,
  ProviderWebhookUnmatchedInboundDiagnostics,
  ProviderWebhookUnmatchedInboundExport,
  ProviderWebhookUnmatchedInboundExportQuery,
  ProviderWebhookUnmatchedInboundBulkAssignmentRequest,
  ProviderWebhookUnmatchedInboundBulkAssignmentResponse,
  ProviderWebhookUnmatchedInboundBulkEscalationRequest,
  ProviderWebhookUnmatchedInboundBulkEscalationResponse,
  ProviderWebhookUnmatchedInboundBulkResolutionRequest,
  ProviderWebhookUnmatchedInboundBulkResolutionResponse,
  ProviderWebhookUnmatchedInboundBulkReviewRequest,
  ProviderWebhookUnmatchedInboundBulkReviewResponse,
  ProviderWebhookUnmatchedInboundEscalationRequest,
  ProviderWebhookUnmatchedInboundFilters,
  ProviderWebhookUnmatchedInboundHistory,
  ProviderWebhookUnmatchedInboundLinkRequest,
  ProviderWebhookUnmatchedInboundItem,
  ProviderWebhookUnmatchedInboundPage,
  ProviderWebhookUnmatchedInboundReviewRequest,
  ProviderWebhookUnmatchedInboundResolutionChecklistRequest,
  ProviderWebhookUnmatchedInboundResolutionRequest,
  ProviderWebhookSandboxEventRequest,
  SettingsCannedReply,
  SettingsChannelAccount,
  SettingsSlaPolicy,
  SettingsTeamMember
} from "@ai-omni/shared";
import {
  archiveProviderWebhookReviewSavedView,
  createProviderWebhookOperatorNote,
  createProviderWebhookReviewSavedView,
  createProviderWebhookSandboxEvent,
  bulkReviewProviderWebhookUnmatchedInbound,
  getProviderWebhookOperatorNotes,
  getProviderWebhookReviewAlerts,
  getProviderWebhookReviewClosureReportExport,
  getProviderWebhookReviewClosureReport,
  getProviderWebhookReviewMetrics,
  getProviderWebhookReviewSavedViews,
  getProviderWebhookReviewResolutionSummary,
  getProviderWebhookReviewTriage,
  getProviderWebhookReviewWorkload,
  getProviderReadiness,
  getProviderWebhookEvents,
  getProviderWebhookUnmatchedInbound,
  getProviderWebhookUnmatchedInboundCandidates,
  getProviderWebhookUnmatchedInboundClosureEvidenceExport,
  getProviderWebhookUnmatchedInboundClosureEvidence,
  getProviderWebhookUnmatchedInboundDiagnostics,
  getProviderWebhookUnmatchedInboundExport,
  getProviderWebhookUnmatchedInboundHistory,
  linkProviderWebhookUnmatchedInboundConversation,
  reviewProviderWebhookUnmatchedInbound,
  assignProviderWebhookUnmatchedInbound,
  bulkAssignProviderWebhookUnmatchedInbound,
  escalateProviderWebhookUnmatchedInbound,
  bulkEscalateProviderWebhookUnmatchedInbound,
  resolveProviderWebhookUnmatchedInbound,
  updateProviderWebhookUnmatchedInboundChecklist,
  bulkResolveProviderWebhookUnmatchedInbound,
  updateProviderWebhookReviewSavedView,
  getSettingsCannedReplies,
  getSettingsChannels,
  getSettingsSlaPolicies,
  getSettingsTeam
} from "./api-client";
import { createDefaultAdminStore, mockCannedReplies, mockSlaPolicies } from "./admin-data";

const now = "2026-05-21T04:00:00.000Z";

export type SettingsChannelsData = {
  mode: DataMode;
  channels: SettingsChannelAccount[];
};

export type SettingsTeamData = {
  mode: DataMode;
  members: SettingsTeamMember[];
  slaPolicies: SettingsSlaPolicy[];
  cannedReplies: SettingsCannedReply[];
};

export type SettingsProviderReadinessData = {
  mode: DataMode;
  providerReadiness: ProviderReadiness;
};

export type SettingsProviderWebhookEventsData = {
  mode: DataMode;
  events: ProviderWebhookEvent[];
};

export type SettingsProviderWebhookUnmatchedInboundData = {
  mode: DataMode;
  items: ProviderWebhookUnmatchedInboundItem[];
  pagination: ProviderWebhookUnmatchedInboundPage["pagination"];
  appliedFilters: ProviderWebhookUnmatchedInboundPage["appliedFilters"];
  appliedSort: ProviderWebhookUnmatchedInboundPage["appliedSort"];
  summary: ProviderWebhookUnmatchedInboundPage["summary"];
  externalCalls: 0;
};

export type SettingsProviderWebhookReviewMetricsData = {
  mode: DataMode;
  metrics: ProviderWebhookReviewMetrics;
};

export type SettingsProviderWebhookReviewAlertsData = {
  mode: DataMode;
  alerts: ProviderWebhookReviewAlerts;
};

export type SettingsProviderWebhookReviewTriageData = {
  mode: DataMode;
  triage: ProviderWebhookReviewTriage;
};

export type SettingsProviderWebhookReviewWorkloadData = {
  mode: DataMode;
  workload: ProviderWebhookReviewWorkload;
};

export type SettingsProviderWebhookReviewResolutionSummaryData = {
  mode: DataMode;
  summary: ProviderWebhookReviewResolutionSummary;
};

export type SettingsProviderWebhookReviewClosureReportData = {
  mode: DataMode;
  report: ProviderWebhookReviewClosureReport;
};

export type SettingsProviderWebhookReviewClosureReportExportData = {
  mode: DataMode;
  exportResult: ProviderWebhookReviewClosureReportExport;
};

export type SettingsProviderWebhookClosureEvidenceData = {
  mode: DataMode;
  evidence: ProviderWebhookReviewClosureEvidence;
};

export type SettingsProviderWebhookClosureEvidenceExportData = {
  mode: DataMode;
  exportResult: ProviderWebhookReviewClosureEvidenceExport;
};

export type SettingsProviderWebhookSavedViewsData = {
  mode: DataMode;
  savedViews: ProviderWebhookReviewSavedView[];
};

export type SettingsProviderWebhookOperatorNotesData = {
  mode: DataMode;
  notes: ProviderWebhookOperatorNote[];
};

export type SettingsProviderWebhookCandidateData = {
  mode: DataMode;
  candidates: ProviderWebhookCandidateConversation[];
};

export type SettingsProviderWebhookDiagnosticsData = {
  mode: DataMode;
  diagnostics: ProviderWebhookUnmatchedInboundDiagnostics;
};

export type SettingsProviderWebhookHistoryData = {
  mode: DataMode;
  history: ProviderWebhookUnmatchedInboundHistory;
};

export type SettingsProviderWebhookExportData = {
  mode: DataMode;
  exportResult: ProviderWebhookUnmatchedInboundExport;
};

export const mockSettingsChannels: SettingsChannelAccount[] = [
  channel("00000000-0000-4000-8000-000000000020", "webchat", "Main Website", "demo-webchat", "https://example.local/webhooks/webchat/demo-webchat", "not configured", false),
  channel("00000000-0000-4000-8000-000000000022", "line", "LINE OA Main", null, "https://example.local/webhooks/line/00000000-0000-4000-8000-000000000022", "configured", true),
  channel("00000000-0000-4000-8000-000000000021", "telegram", "Bot 007237", null, "https://example.local/webhooks/telegram/00000000-0000-4000-8000-000000000021", "not configured", false),
  channel("00000000-0000-4000-8000-000000000023", "facebook", "Page หลัก", null, "https://example.local/webhooks/facebook/00000000-0000-4000-8000-000000000023", "demo/mock", false),
  channel("00000000-0000-4000-8000-000000000024", "instagram", "IG ร้านค้า", null, "https://example.local/webhooks/instagram/00000000-0000-4000-8000-000000000024", "demo/mock", false)
];

export async function loadSettingsChannelsData(mode: DataMode): Promise<SettingsChannelsData> {
  if (mode === "api") {
    return {
      mode,
      channels: await getSettingsChannels()
    };
  }
  return {
    mode,
    channels: mockSettingsChannels
  };
}

export async function loadSettingsProviderReadinessData(mode: DataMode): Promise<SettingsProviderReadinessData> {
  if (mode === "api") {
    return {
      mode,
      providerReadiness: await getProviderReadiness()
    };
  }

  return {
    mode,
    providerReadiness: mockProviderReadiness
  };
}

export async function loadSettingsProviderWebhookEventsData(mode: DataMode): Promise<SettingsProviderWebhookEventsData> {
  if (mode === "api") {
    return {
      mode,
      events: await getProviderWebhookEvents()
    };
  }

  return {
    mode,
    events: mockProviderWebhookEvents
  };
}

export async function loadSettingsProviderWebhookUnmatchedInboundData(mode: DataMode, filters: ProviderWebhookUnmatchedInboundFilters = {}): Promise<SettingsProviderWebhookUnmatchedInboundData> {
  if (mode === "api") {
    const page = await getProviderWebhookUnmatchedInbound(filters);
    return {
      mode,
      ...page
    };
  }

  const page = createMockUnmatchedInboundPage(filters);
  return {
    mode,
    ...page
  };
}

export async function loadSettingsProviderWebhookReviewMetricsData(
  mode: DataMode,
  filters: ProviderWebhookReviewMetricsFilters = {}
): Promise<SettingsProviderWebhookReviewMetricsData> {
  if (mode === "api") {
    return {
      mode,
      metrics: await getProviderWebhookReviewMetrics(filters)
    };
  }

  return {
    mode,
    metrics: createMockReviewMetrics(filters)
  };
}

export async function loadSettingsProviderWebhookReviewAlertsData(
  mode: DataMode,
  filters: ProviderWebhookReviewAlertsFilters = {}
): Promise<SettingsProviderWebhookReviewAlertsData> {
  if (mode === "api") {
    return {
      mode,
      alerts: await getProviderWebhookReviewAlerts(filters)
    };
  }

  return {
    mode,
    alerts: createMockReviewAlerts(filters)
  };
}

export async function loadSettingsProviderWebhookReviewTriageData(
  mode: DataMode,
  filters: ProviderWebhookReviewTriageFilters = {}
): Promise<SettingsProviderWebhookReviewTriageData> {
  if (mode === "api") {
    return {
      mode,
      triage: await getProviderWebhookReviewTriage(filters)
    };
  }

  return {
    mode,
    triage: createMockReviewTriage(filters)
  };
}

export async function loadSettingsProviderWebhookReviewWorkloadData(
  mode: DataMode,
  filters: ProviderWebhookReviewWorkloadFilters = {}
): Promise<SettingsProviderWebhookReviewWorkloadData> {
  if (mode === "api") {
    return {
      mode,
      workload: await getProviderWebhookReviewWorkload(filters)
    };
  }

  return {
    mode,
    workload: createMockReviewWorkload(filters)
  };
}

export async function loadSettingsProviderWebhookReviewResolutionSummaryData(
  mode: DataMode,
  filters: ProviderWebhookReviewResolutionSummaryFilters = {}
): Promise<SettingsProviderWebhookReviewResolutionSummaryData> {
  if (mode === "api") {
    return {
      mode,
      summary: await getProviderWebhookReviewResolutionSummary(filters)
    };
  }

  return {
    mode,
    summary: createMockReviewResolutionSummary(filters)
  };
}

export async function loadSettingsProviderWebhookReviewClosureReportData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewClosureReportData> {
  if (mode === "api") {
    return {
      mode,
      report: await getProviderWebhookReviewClosureReport(filters)
    };
  }

  return {
    mode,
    report: createMockReviewClosureReport(filters)
  };
}

export async function exportSettingsProviderWebhookReviewClosureReportData(
  mode: DataMode,
  filters: ProviderWebhookReviewClosureReportFilters = {}
): Promise<SettingsProviderWebhookReviewClosureReportExportData> {
  if (mode === "api") {
    return {
      mode,
      exportResult: await getProviderWebhookReviewClosureReportExport(filters)
    };
  }

  return {
    mode,
    exportResult: createMockReviewClosureReportExport(filters)
  };
}

export async function loadSettingsProviderWebhookSavedViewsData(mode: DataMode): Promise<SettingsProviderWebhookSavedViewsData> {
  if (mode === "api") {
    return {
      mode,
      savedViews: await getProviderWebhookReviewSavedViews()
    };
  }

  return {
    mode,
    savedViews: mockProviderWebhookReviewSavedViews.filter((view) => !view.archived)
  };
}

export async function createSettingsProviderWebhookSavedView(
  mode: DataMode,
  payload: CreateProviderWebhookReviewSavedViewRequest
): Promise<ProviderWebhookReviewSavedView> {
  if (mode === "api") {
    return createProviderWebhookReviewSavedView(payload);
  }

  const nowIso = new Date().toISOString();
  const savedView: ProviderWebhookReviewSavedView = {
    id: `provider-webhook-review-view-local-${mockProviderWebhookReviewSavedViews.length + 1}`,
    name: safeMockText(payload.name) ?? "Saved review view",
    description: safeMockText(payload.description ?? null),
    tenantId: "mock-tenant",
    ownerId: "system",
    createdBy: "system",
    filters: cleanMockSavedViewFilters(payload.filters ?? {}),
    sort: {
      sortBy: payload.sort?.sortBy ?? "receivedAt",
      sortDirection: payload.sort?.sortDirection ?? "desc"
    },
    pinned: payload.pinned ?? false,
    isDefault: payload.isDefault ?? false,
    archived: false,
    createdAt: nowIso,
    updatedAt: nowIso,
    externalCalls: 0
  };
  if (savedView.isDefault) {
    mockProviderWebhookReviewSavedViews.forEach((view) => {
      view.isDefault = false;
    });
  }
  mockProviderWebhookReviewSavedViews.unshift(savedView);
  refreshMockUnmatchedCounts();
  return savedView;
}

export async function updateSettingsProviderWebhookSavedView(
  mode: DataMode,
  savedViewId: string,
  payload: UpdateProviderWebhookReviewSavedViewRequest
): Promise<ProviderWebhookReviewSavedView> {
  if (mode === "api") {
    return updateProviderWebhookReviewSavedView(savedViewId, payload);
  }

  const savedView = mockProviderWebhookReviewSavedViews.find((view) => view.id === savedViewId);
  if (!savedView) throw new Error("Provider webhook review saved view not found");
  if (savedView.archived) throw new Error("Provider webhook review saved view is archived");
  if (payload.name !== undefined) savedView.name = safeMockText(payload.name) ?? savedView.name;
  if (payload.description !== undefined) savedView.description = safeMockText(payload.description ?? null);
  if (payload.filters !== undefined) savedView.filters = cleanMockSavedViewFilters(payload.filters);
  if (payload.sort !== undefined) {
    savedView.sort = {
      sortBy: payload.sort.sortBy ?? "receivedAt",
      sortDirection: payload.sort.sortDirection ?? "desc"
    };
  }
  if (payload.pinned !== undefined) savedView.pinned = payload.pinned;
  if (payload.isDefault !== undefined) {
    if (payload.isDefault) {
      mockProviderWebhookReviewSavedViews.forEach((view) => {
        if (view.id !== savedViewId) view.isDefault = false;
      });
    }
    savedView.isDefault = payload.isDefault;
  }
  savedView.updatedAt = new Date().toISOString();
  savedView.externalCalls = 0;
  return savedView;
}

export async function archiveSettingsProviderWebhookSavedView(mode: DataMode, savedViewId: string): Promise<ProviderWebhookReviewSavedView> {
  if (mode === "api") {
    return archiveProviderWebhookReviewSavedView(savedViewId);
  }

  const savedView = mockProviderWebhookReviewSavedViews.find((view) => view.id === savedViewId);
  if (!savedView) throw new Error("Provider webhook review saved view not found");
  savedView.archived = true;
  savedView.isDefault = false;
  savedView.updatedAt = new Date().toISOString();
  savedView.externalCalls = 0;
  refreshMockUnmatchedCounts();
  return savedView;
}

export async function loadSettingsProviderWebhookOperatorNotesData(
  mode: DataMode,
  unmatchedInboundId: string
): Promise<SettingsProviderWebhookOperatorNotesData> {
  if (mode === "api") {
    return {
      mode,
      notes: await getProviderWebhookOperatorNotes(unmatchedInboundId)
    };
  }

  return {
    mode,
    notes: mockProviderWebhookOperatorNotes.filter((note) => note.unmatchedId === unmatchedInboundId)
  };
}

export async function createSettingsProviderWebhookOperatorNote(
  mode: DataMode,
  unmatchedInboundId: string,
  payload: CreateProviderWebhookOperatorNoteRequest
): Promise<ProviderWebhookOperatorNote> {
  if (mode === "api") {
    return createProviderWebhookOperatorNote(unmatchedInboundId, payload);
  }

  const item = mockProviderWebhookUnmatchedInbound.find((candidate) => candidate.id === unmatchedInboundId);
  if (!item) throw new Error("Unmatched inbound item not found");
  const noteText = safeMockText(payload.note);
  if (!noteText) throw new Error("Invalid provider webhook operator note request");
  const nowIso = new Date().toISOString();
  const note: ProviderWebhookOperatorNote = {
    id: `provider-webhook-operator-note-local-${mockProviderWebhookOperatorNotes.length + 1}`,
    unmatchedId: item.id,
    tenantId: "mock-tenant",
    authorId: "system",
    authorLabel: "system",
    note: noteText,
    context: {
      provider: item.provider,
      platform: item.provider,
      channelAccountId: item.channelAccountId,
      safeRoomLabel: mockSafeRoomLabel(item),
      roomKeyDigest: item.roomKeyDigest,
      eventType: item.eventType,
      reviewStatus: item.reviewStatus,
      linkStatus: item.linkStatus,
      unmatchedStatus: item.unmatchedStatus,
      assignmentStatus: item.assignmentStatus,
      assignedToOperatorLabel: item.assignedToOperatorLabel,
      escalationStatus: item.escalationStatus,
      escalationReason: item.escalationReason,
      resolutionStatus: item.resolutionStatus,
      resolutionOutcome: item.resolutionOutcome,
      closureReadiness: item.closureReadiness,
      checklistCompletedCount: item.checklistCompletedCount,
      checklistTotalCount: item.checklistTotalCount
    },
    createdAt: nowIso,
    updatedAt: nowIso,
    externalCalls: 0
  };
  mockProviderWebhookOperatorNotes.push(note);
  item.lastOperatorNoteAt = nowIso;
  return note;
}

export async function loadSettingsProviderWebhookCandidateData(mode: DataMode, unmatchedInboundId: string): Promise<SettingsProviderWebhookCandidateData> {
  if (mode === "api") {
    return {
      mode,
      candidates: await getProviderWebhookUnmatchedInboundCandidates(unmatchedInboundId)
    };
  }

  return {
    mode,
    candidates: mockProviderWebhookCandidatesByUnmatchedId[unmatchedInboundId] ?? []
  };
}

export async function loadSettingsProviderWebhookDiagnosticsData(mode: DataMode, unmatchedInboundId: string): Promise<SettingsProviderWebhookDiagnosticsData> {
  if (mode === "api") {
    return {
      mode,
      diagnostics: await getProviderWebhookUnmatchedInboundDiagnostics(unmatchedInboundId)
    };
  }

  return {
    mode,
    diagnostics: createMockUnmatchedDiagnostics(unmatchedInboundId)
  };
}

export async function loadSettingsProviderWebhookClosureEvidenceData(mode: DataMode, unmatchedInboundId: string): Promise<SettingsProviderWebhookClosureEvidenceData> {
  if (mode === "api") {
    return {
      mode,
      evidence: await getProviderWebhookUnmatchedInboundClosureEvidence(unmatchedInboundId)
    };
  }

  return {
    mode,
    evidence: createMockClosureEvidence(unmatchedInboundId)
  };
}

export async function exportSettingsProviderWebhookClosureEvidenceData(
  mode: DataMode,
  unmatchedInboundId: string
): Promise<SettingsProviderWebhookClosureEvidenceExportData> {
  if (mode === "api") {
    return {
      mode,
      exportResult: await getProviderWebhookUnmatchedInboundClosureEvidenceExport(unmatchedInboundId)
    };
  }

  return {
    mode,
    exportResult: createMockClosureEvidenceExport(unmatchedInboundId)
  };
}

export async function loadSettingsProviderWebhookHistoryData(mode: DataMode, unmatchedInboundId: string): Promise<SettingsProviderWebhookHistoryData> {
  if (mode === "api") {
    return {
      mode,
      history: await getProviderWebhookUnmatchedInboundHistory(unmatchedInboundId)
    };
  }

  return {
    mode,
    history: createMockUnmatchedHistory(unmatchedInboundId)
  };
}

export async function exportSettingsProviderWebhookUnmatchedInboundData(
  mode: DataMode,
  filters: ProviderWebhookUnmatchedInboundExportQuery = {}
): Promise<SettingsProviderWebhookExportData> {
  if (mode === "api") {
    return {
      mode,
      exportResult: await getProviderWebhookUnmatchedInboundExport(filters)
    };
  }

  return {
    mode,
    exportResult: createMockUnmatchedExport(filters)
  };
}

export async function createSettingsProviderWebhookSandboxEvent(mode: DataMode, payload: ProviderWebhookSandboxEventRequest): Promise<ProviderWebhookEvent> {
  if (mode === "api") {
    return createProviderWebhookSandboxEvent(payload);
  }

  const event = createMockProviderWebhookEvent(payload);
  mockProviderWebhookEvents = [event, ...mockProviderWebhookEvents].slice(0, 25);
  return event;
}

export async function reviewSettingsProviderWebhookUnmatchedInbound(
  mode: DataMode,
  unmatchedInboundId: string,
  payload: ProviderWebhookUnmatchedInboundReviewRequest
): Promise<ProviderWebhookUnmatchedInboundItem> {
  if (mode === "api") {
    return reviewProviderWebhookUnmatchedInbound(unmatchedInboundId, payload);
  }

  const item = mockProviderWebhookUnmatchedInbound.find((candidate) => candidate.id === unmatchedInboundId);
  if (!item) throw new Error("Unmatched inbound item not found");
  if (item.unmatchedStatus === payload.status && item.reviewStatus === payload.status) {
    return item;
  }
  const nowIso = new Date().toISOString();
  item.unmatchedStatus = payload.status;
  item.reviewStatus = payload.status;
  item.reviewedAt = nowIso;
  item.reviewedBy = "system";
  item.reviewReason = safeMockReason(payload.reason);
  item.unmatchedResolvedAt = nowIso;
  item.externalCalls = 0;
  item.candidatesAvailable = false;
  mockProviderReadiness.latestUnmatchedReviewActionStatus = payload.status;
  mockProviderReadiness.latestUnmatchedInboundStatus = payload.status;
  refreshMockUnmatchedCounts();
  return item;
}

export async function assignSettingsProviderWebhookUnmatchedInbound(
  mode: DataMode,
  unmatchedInboundId: string,
  payload: ProviderWebhookUnmatchedInboundAssignmentRequest
): Promise<ProviderWebhookUnmatchedInboundItem> {
  if (mode === "api") {
    return assignProviderWebhookUnmatchedInbound(unmatchedInboundId, payload);
  }

  const item = mockProviderWebhookUnmatchedInbound.find((candidate) => candidate.id === unmatchedInboundId);
  if (!item) throw new Error("Unmatched inbound item not found");
  applyMockAssignment(item, payload);
  refreshMockUnmatchedCounts();
  return item;
}

export async function escalateSettingsProviderWebhookUnmatchedInbound(
  mode: DataMode,
  unmatchedInboundId: string,
  payload: ProviderWebhookUnmatchedInboundEscalationRequest
): Promise<ProviderWebhookUnmatchedInboundItem> {
  if (mode === "api") {
    return escalateProviderWebhookUnmatchedInbound(unmatchedInboundId, payload);
  }

  const item = mockProviderWebhookUnmatchedInbound.find((candidate) => candidate.id === unmatchedInboundId);
  if (!item) throw new Error("Unmatched inbound item not found");
  applyMockEscalation(item, payload);
  refreshMockUnmatchedCounts();
  return item;
}

export async function resolveSettingsProviderWebhookUnmatchedInbound(
  mode: DataMode,
  unmatchedInboundId: string,
  payload: ProviderWebhookUnmatchedInboundResolutionRequest
): Promise<ProviderWebhookUnmatchedInboundItem> {
  if (mode === "api") {
    return resolveProviderWebhookUnmatchedInbound(unmatchedInboundId, payload);
  }

  const item = mockProviderWebhookUnmatchedInbound.find((candidate) => candidate.id === unmatchedInboundId);
  if (!item) throw new Error("Unmatched inbound item not found");
  applyMockResolution(item, payload);
  refreshMockUnmatchedCounts();
  return item;
}

export async function updateSettingsProviderWebhookUnmatchedInboundChecklist(
  mode: DataMode,
  unmatchedInboundId: string,
  payload: ProviderWebhookUnmatchedInboundResolutionChecklistRequest
): Promise<ProviderWebhookUnmatchedInboundItem> {
  if (mode === "api") {
    return updateProviderWebhookUnmatchedInboundChecklist(unmatchedInboundId, payload);
  }

  const item = mockProviderWebhookUnmatchedInbound.find((candidate) => candidate.id === unmatchedInboundId);
  if (!item) throw new Error("Unmatched inbound item not found");
  applyMockChecklist(item, payload);
  refreshMockUnmatchedCounts();
  return item;
}

export async function bulkReviewSettingsProviderWebhookUnmatchedInbound(
  mode: DataMode,
  payload: ProviderWebhookUnmatchedInboundBulkReviewRequest
): Promise<ProviderWebhookUnmatchedInboundBulkReviewResponse> {
  if (mode === "api") {
    return bulkReviewProviderWebhookUnmatchedInbound(payload);
  }

  const uniqueIds = Array.from(new Set(payload.ids.map((id) => id.trim()).filter(Boolean)));
  if (uniqueIds.length === 0) throw new Error("Invalid unmatched inbound bulk review request");
  if (payload.ids.length > 50) throw new Error("Invalid unmatched inbound bulk review request");

  const results: ProviderWebhookUnmatchedInboundBulkReviewResponse["results"] = [];
  for (const id of uniqueIds) {
    const item = mockProviderWebhookUnmatchedInbound.find((candidate) => candidate.id === id);
    if (!item) {
      results.push({ id, ok: false, resultStatus: "not-found", reviewStatus: null, unmatchedStatus: null, error: "Unmatched inbound item not found", externalCalls: 0 });
      continue;
    }
    if (item.unmatchedStatus === payload.reviewStatus && item.reviewStatus === payload.reviewStatus) {
      results.push({ id, ok: true, resultStatus: "already-applied", reviewStatus: payload.reviewStatus, unmatchedStatus: item.unmatchedStatus, error: null, externalCalls: 0 });
      continue;
    }
    if (item.unmatchedStatus !== "open" && item.unmatchedStatus !== "review-needed") {
      results.push({
        id,
        ok: false,
        resultStatus: "conflict",
        reviewStatus: item.reviewStatus === "reviewed" || item.reviewStatus === "skipped" ? item.reviewStatus : null,
        unmatchedStatus: item.unmatchedStatus,
        error: "Unmatched inbound item is already resolved",
        externalCalls: 0
      });
      continue;
    }
    const nowIso = new Date().toISOString();
    item.unmatchedStatus = payload.reviewStatus;
    item.reviewStatus = payload.reviewStatus;
    item.reviewedAt = nowIso;
    item.reviewedBy = "system";
    item.reviewReason = safeMockReason(payload.reason);
    item.unmatchedResolvedAt = nowIso;
    item.externalCalls = 0;
    item.candidatesAvailable = false;
    results.push({ id, ok: true, resultStatus: "updated", reviewStatus: payload.reviewStatus, unmatchedStatus: item.unmatchedStatus, error: null, externalCalls: 0 });
  }

  mockProviderReadiness.latestUnmatchedReviewActionStatus = payload.reviewStatus;
  mockProviderReadiness.latestUnmatchedInboundStatus = payload.reviewStatus;
  refreshMockUnmatchedCounts();
  return {
    reviewStatus: payload.reviewStatus,
    results,
    summary: {
      requestedCount: payload.ids.length,
      dedupedCount: uniqueIds.length,
      successCount: results.filter((result) => result.ok).length,
      errorCount: results.filter((result) => !result.ok).length,
      updatedCount: results.filter((result) => result.resultStatus === "updated").length,
      alreadyAppliedCount: results.filter((result) => result.resultStatus === "already-applied").length
    },
    externalCalls: 0
  };
}

export async function bulkResolveSettingsProviderWebhookUnmatchedInbound(
  mode: DataMode,
  payload: ProviderWebhookUnmatchedInboundBulkResolutionRequest
): Promise<ProviderWebhookUnmatchedInboundBulkResolutionResponse> {
  if (mode === "api") {
    return bulkResolveProviderWebhookUnmatchedInbound(payload);
  }

  const uniqueIds = Array.from(new Set(payload.ids.map((id) => id.trim()).filter(Boolean)));
  const results: ProviderWebhookUnmatchedInboundBulkResolutionResponse["results"] = [];
  for (const id of uniqueIds) {
    const item = mockProviderWebhookUnmatchedInbound.find((candidate) => candidate.id === id);
    if (!item) {
      results.push({ id, ok: false, resultStatus: "not-found", resolutionStatus: null, resolutionOutcome: null, closureReadiness: null, checklistCompletedCount: null, checklistTotalCount: null, error: "Unmatched inbound item not found", externalCalls: 0 });
      continue;
    }
    const before = mockResolutionFingerprint(item);
    if (payload.operation === "SET_RESOLUTION" || payload.operation === "CLEAR_RESOLUTION") {
      applyMockResolution(item, {
        operation: payload.operation,
        resolutionOutcome: payload.resolutionOutcome,
        note: payload.note
      });
    } else {
      applyMockChecklist(item, {
        operation: payload.operation === "COMPLETE_STEP" ? "COMPLETE_STEP" : "RESET_CHECKLIST",
        step: payload.step
      });
    }
    results.push({
      id,
      ok: true,
      resultStatus: before === mockResolutionFingerprint(item) ? "already-applied" : "updated",
      resolutionStatus: item.resolutionStatus,
      resolutionOutcome: item.resolutionOutcome,
      closureReadiness: item.closureReadiness,
      checklistCompletedCount: item.checklistCompletedCount,
      checklistTotalCount: item.checklistTotalCount,
      error: null,
      externalCalls: 0
    });
  }
  refreshMockUnmatchedCounts();
  return {
    operation: payload.operation,
    results,
    summary: mockBulkResolutionSummary(payload.ids.length, uniqueIds.length, results),
    externalCalls: 0
  };
}

export async function bulkAssignSettingsProviderWebhookUnmatchedInbound(
  mode: DataMode,
  payload: ProviderWebhookUnmatchedInboundBulkAssignmentRequest
): Promise<ProviderWebhookUnmatchedInboundBulkAssignmentResponse> {
  if (mode === "api") {
    return bulkAssignProviderWebhookUnmatchedInbound(payload);
  }

  const uniqueIds = Array.from(new Set(payload.ids.map((id) => id.trim()).filter(Boolean)));
  const results: ProviderWebhookUnmatchedInboundBulkAssignmentResponse["results"] = [];
  for (const id of uniqueIds) {
    const item = mockProviderWebhookUnmatchedInbound.find((candidate) => candidate.id === id);
    if (!item) {
      results.push({ id, ok: false, resultStatus: "not-found", assignmentStatus: null, escalationStatus: null, escalationReason: null, error: "Unmatched inbound item not found", externalCalls: 0 });
      continue;
    }
    const before = `${item.assignmentStatus}:${item.assignedToOperatorLabel ?? ""}:${item.assignedAt ?? ""}`;
    applyMockAssignment(item, payload);
    const after = `${item.assignmentStatus}:${item.assignedToOperatorLabel ?? ""}:${item.assignedAt ?? ""}`;
    results.push({ id, ok: true, resultStatus: before === after ? "already-applied" : "updated", assignmentStatus: item.assignmentStatus, escalationStatus: item.escalationStatus, escalationReason: item.escalationReason, error: null, externalCalls: 0 });
  }
  refreshMockUnmatchedCounts();
  return {
    operation: payload.operation,
    results,
    summary: mockBulkMetadataSummary(payload.ids.length, uniqueIds.length, results),
    externalCalls: 0
  };
}

export async function bulkEscalateSettingsProviderWebhookUnmatchedInbound(
  mode: DataMode,
  payload: ProviderWebhookUnmatchedInboundBulkEscalationRequest
): Promise<ProviderWebhookUnmatchedInboundBulkEscalationResponse> {
  if (mode === "api") {
    return bulkEscalateProviderWebhookUnmatchedInbound(payload);
  }

  const uniqueIds = Array.from(new Set(payload.ids.map((id) => id.trim()).filter(Boolean)));
  const results: ProviderWebhookUnmatchedInboundBulkEscalationResponse["results"] = [];
  for (const id of uniqueIds) {
    const item = mockProviderWebhookUnmatchedInbound.find((candidate) => candidate.id === id);
    if (!item) {
      results.push({ id, ok: false, resultStatus: "not-found", assignmentStatus: null, escalationStatus: null, escalationReason: null, error: "Unmatched inbound item not found", externalCalls: 0 });
      continue;
    }
    const before = `${item.escalationStatus}:${item.escalationReason ?? ""}:${item.escalatedAt ?? ""}`;
    applyMockEscalation(item, payload);
    const after = `${item.escalationStatus}:${item.escalationReason ?? ""}:${item.escalatedAt ?? ""}`;
    results.push({ id, ok: true, resultStatus: before === after ? "already-applied" : "updated", assignmentStatus: item.assignmentStatus, escalationStatus: item.escalationStatus, escalationReason: item.escalationReason, error: null, externalCalls: 0 });
  }
  refreshMockUnmatchedCounts();
  return {
    operation: payload.operation,
    results,
    summary: mockBulkMetadataSummary(payload.ids.length, uniqueIds.length, results),
    externalCalls: 0
  };
}

export async function linkSettingsProviderWebhookUnmatchedInboundConversation(
  mode: DataMode,
  unmatchedInboundId: string,
  payload: ProviderWebhookUnmatchedInboundLinkRequest
): Promise<ProviderWebhookUnmatchedInboundItem> {
  if (mode === "api") {
    return linkProviderWebhookUnmatchedInboundConversation(unmatchedInboundId, payload);
  }

  const item = mockProviderWebhookUnmatchedInbound.find((candidate) => candidate.id === unmatchedInboundId);
  if (!item) throw new Error("Unmatched inbound item not found");
  const nowIso = new Date().toISOString();
  item.unmatchedStatus = "linked";
  item.reviewStatus = "linked";
  item.linkStatus = payload.actionMode === "link-and-persist-safe-message" ? "linked-message-persisted" : "linked";
  item.linkedConversationId = payload.conversationId;
  item.linkedMessageId = payload.actionMode === "link-and-persist-safe-message" ? "message-local-linked" : null;
  item.messagePersisted = payload.actionMode === "link-and-persist-safe-message";
  item.unmatchedResolvedAt = nowIso;
  item.externalCalls = 0;
  item.candidatesAvailable = false;
  mockProviderReadiness.latestUnmatchedLinkStatus = item.linkStatus;
  mockProviderReadiness.latestUnmatchedInboundStatus = "linked";
  refreshMockUnmatchedCounts();
  return item;
}

export async function loadSettingsTeamData(mode: DataMode): Promise<SettingsTeamData> {
  if (mode === "api") {
    const [members, slaPolicies, cannedReplies] = await Promise.all([
      getSettingsTeam(),
      getSettingsSlaPolicies(),
      getSettingsCannedReplies()
    ]);
    return {
      mode,
      members,
      slaPolicies,
      cannedReplies
    };
  }

  const store = createDefaultAdminStore();
  return {
    mode,
    members: store.agents.map((agent) => ({
      id: agent.id,
      name: agent.name,
      displayName: agent.name,
      email: agent.email,
      role: agent.role,
      status: agent.status,
      skills: agent.assignedRoomIds,
      maxConcurrentChats: agent.maxActiveConversations,
      createdAt: now,
      updatedAt: now
    })),
    slaPolicies: mockSlaPolicies.map((policy) => ({
      id: policy.id,
      name: policy.name,
      description: "",
      status: "active",
      priorityScope: policy.appliesToPriority,
      firstResponseMinutes: policy.firstResponseMinutes,
      resolutionMinutes: policy.resolutionHours * 60,
      businessHoursMode: "always",
      escalationRole: "supervisor",
      createdAt: now,
      updatedAt: now
    })),
    cannedReplies: mockCannedReplies.map((reply) => ({
      id: reply.id,
      title: reply.title,
      category: reply.category,
      shortcut: reply.shortcut,
      bodyTemplate: reply.body,
      tags: reply.tags,
      platformScope: [],
      roomScope: [],
      status: reply.isActive ? "active" : "inactive",
      createdAt: now,
      updatedAt: now
    }))
  };
}

export function mapSettingsCannedReplyToCannedReply(reply: SettingsCannedReply): CannedReply {
  return {
    id: reply.id,
    title: reply.title,
    shortcut: reply.shortcut,
    body: reply.bodyTemplate,
    tags: reply.tags,
    category: reply.category,
    isActive: reply.status === "active"
  };
}

export function searchCannedReplyList(replies: CannedReply[], query: string, category = "all", tag = "all") {
  const normalized = query.trim().toLowerCase();
  return replies.filter((reply) => {
    if (!reply.isActive) return false;
    if (category !== "all" && reply.category !== category) return false;
    if (tag !== "all" && !reply.tags.includes(tag)) return false;
    if (!normalized) return true;
    return [reply.title, reply.shortcut, reply.body, reply.category, ...reply.tags].some((value) => value.toLowerCase().includes(normalized));
  });
}

export function findCannedReplyInList(replies: CannedReply[], slashCommand: string) {
  const command = slashCommand.trim().split(/\s+/)[0]?.toLowerCase();
  return replies.find((reply) => reply.isActive && reply.shortcut.toLowerCase() === command) ?? null;
}

export function getCannedRepliesForMode(mode: DataMode, apiReplies: CannedReply[], localReplies: CannedReply[]) {
  return mode === "api" ? apiReplies : localReplies;
}

export function resolveCannedReplyComposerDraft(replies: CannedReply[], replyId: string) {
  const reply = replies.find((item) => item.id === replyId && item.isActive);
  return reply
    ? {
        replyId: reply.id,
        shortcut: reply.shortcut,
        body: reply.body
      }
    : null;
}

function channel(
  id: string,
  platform: SettingsChannelAccount["platform"],
  accountName: string,
  accountKey: string | null,
  webhookUrl: string,
  secretState: string,
  secretConfigured: boolean
): SettingsChannelAccount {
  return {
    id,
    platform,
    accountName,
    accountKey,
    status: "demo/mock",
    webhookUrl,
    createdAt: now,
    updatedAt: now,
    lastInboundAt: null,
    lastMessageAt: null,
    hasAccessToken: false,
    tokenMasked: null,
    secretConfigured,
    secretMasked: secretConfigured ? `masked:${secretState}` : null
  };
}

function createMockUnmatchedInboundPage(filters: ProviderWebhookUnmatchedInboundFilters): Omit<SettingsProviderWebhookUnmatchedInboundData, "mode"> {
  const limit = filters.limit ?? 10;
  const offset = filters.offset ?? 0;
  const sortBy = filters.sortBy ?? "receivedAt";
  const sortOrder = filters.sortOrder ?? "desc";
  const filtered = filterMockUnmatchedInbound(filters);
  const sorted = [...filtered].sort((left, right) => {
    const compared = left.receivedAt.localeCompare(right.receivedAt);
    return sortOrder === "asc" ? compared : -compared;
  });
  const items = sorted.slice(offset, offset + limit);
  return {
    items,
    pagination: {
      totalCount: filtered.length,
      limit,
      offset,
      returnedCount: items.length,
      hasNextPage: offset + limit < filtered.length,
      hasPreviousPage: offset > 0
    },
    appliedFilters: {
      ...filters,
      limit,
      offset,
      sortBy,
      sortOrder
    },
    appliedSort: {
      sortBy,
      sortOrder
    },
    summary: summarizeMockUnmatchedInbound(filtered),
    externalCalls: 0
  };
}

function filterMockUnmatchedInbound(filters: ProviderWebhookUnmatchedInboundFilters) {
  const receivedFrom = filters.receivedAtFrom ?? filters.receivedFrom;
  const receivedTo = filters.receivedAtTo ?? filters.receivedTo;
  return mockProviderWebhookUnmatchedInbound.filter((item) => {
    if (filters.status === "open" && item.unmatchedStatus !== "open" && item.unmatchedStatus !== "review-needed") return false;
    if (filters.status && filters.status !== "open" && item.unmatchedStatus !== filters.status) return false;
    if (filters.provider && item.provider !== filters.provider) return false;
    if (filters.reviewStatus && item.reviewStatus !== filters.reviewStatus) return false;
    if (filters.linkStatus && item.linkStatus !== filters.linkStatus) return false;
    if (filters.unmatchedStatus && item.unmatchedStatus !== filters.unmatchedStatus) return false;
    if (filters.eventType && item.eventType !== filters.eventType) return false;
    if (filters.assignedTo && item.assignedToOperatorLabel !== (filters.assignedTo === "me" ? "operator:current" : filters.assignedTo)) return false;
    if (filters.assignmentStatus === "unassigned" && item.assignmentStatus !== "unassigned") return false;
    if (filters.assignmentStatus === "assigned" && item.assignmentStatus !== "assigned") return false;
    if (filters.assignmentStatus === "assigned_to_me" && item.assignedToOperatorLabel !== "operator:current") return false;
    if (filters.assignmentStatus === "assigned_to_others" && (item.assignmentStatus !== "assigned" || item.assignedToOperatorLabel === "operator:current")) return false;
    if (filters.escalationStatus && item.escalationStatus !== filters.escalationStatus) return false;
    if (filters.escalationReason && item.escalationReason !== filters.escalationReason) return false;
    syncMockResolutionState(item);
    if (filters.severity && mockTriageSeverityForItem(item, mockTriageLaneForItem(item)) !== filters.severity) return false;
    if (filters.triageLane && mockTriageLaneForItem(item) !== filters.triageLane) return false;
    if (filters.resolutionStatus && item.resolutionStatus !== filters.resolutionStatus) return false;
    if (filters.resolutionOutcome && item.resolutionOutcome !== filters.resolutionOutcome) return false;
    if (filters.closureReadiness && item.closureReadiness !== filters.closureReadiness) return false;
    if (filters.checklistIncomplete !== undefined && (item.checklistCompletedCount < item.checklistTotalCount) !== filters.checklistIncomplete) return false;
    if (receivedFrom && item.receivedAt < new Date(receivedFrom).toISOString()) return false;
    if (receivedTo && item.receivedAt > new Date(receivedTo).toISOString()) return false;
    return true;
  });
}

function summarizeMockUnmatchedInbound(items: ProviderWebhookUnmatchedInboundItem[]) {
  return {
    openCount: items.filter((item) => item.unmatchedStatus === "open" || item.unmatchedStatus === "review-needed").length,
    reviewedCount: items.filter((item) => item.reviewStatus === "reviewed").length,
    skippedCount: items.filter((item) => item.reviewStatus === "skipped").length,
    linkedCount: items.filter((item) => item.reviewStatus === "linked").length
  };
}

function createMockReviewMetrics(filters: ProviderWebhookReviewMetricsFilters): ProviderWebhookReviewMetrics {
  const appliedFilters = cleanMockReviewMetricsFilters(filters);
  const items = filterMockUnmatchedInbound(appliedFilters);
  const events = filterMockEventsForMetrics(appliedFilters);
  const openItems = items.filter((item) => item.unmatchedStatus === "open" || item.unmatchedStatus === "review-needed");
  const receivedAtValues = items.map((item) => item.receivedAt).sort();
  const openReceivedAtValues = openItems.map((item) => item.receivedAt).sort();
  return {
    generatedAt: new Date().toISOString(),
    appliedFilters,
    totalEvents: events.length,
    totalUnmatched: items.length,
    openUnmatched: openItems.length,
    reviewedCount: items.filter((item) => item.reviewStatus === "reviewed").length,
    skippedCount: items.filter((item) => item.reviewStatus === "skipped").length,
    linkedCount: items.filter((item) => item.reviewStatus === "linked").length,
    persistedInboundCount: events.filter((event) => event.messagePersisted).length,
    signatureRejectedCount: events.filter((event) => event.signatureStatus === "failed").length,
    replayRejectedCount: events.filter((event) => event.replayDetected || event.routingStatus === "blocked-replay").length,
    byProvider: countMockBy(items, providersForMetrics, (item) => item.provider),
    byEventType: countMockBy(items, eventTypesForMetrics, (item) => item.eventType),
    byReviewStatus: countMockBy(items, reviewStatusesForMetrics, (item) => item.reviewStatus),
    byLinkStatus: countMockBy(items, linkStatusesForMetrics, (item) => item.linkStatus),
    byUnmatchedStatus: countMockBy(items, unmatchedStatusesForMetrics, (item) => item.unmatchedStatus),
    ageBuckets: mockAgeBuckets(openItems),
    funnel: {
      inboundReceived: events.length,
      persisted: events.filter((event) => event.messagePersisted).length,
      unmatchedQueued: items.length,
      reviewed: items.filter((item) => item.reviewStatus === "reviewed").length,
      skipped: items.filter((item) => item.reviewStatus === "skipped").length,
      linked: items.filter((item) => item.reviewStatus === "linked").length,
      exportedHistoryAvailable: items.length
    },
    latestReceivedAt: receivedAtValues[receivedAtValues.length - 1] ?? null,
    oldestOpenReceivedAt: openReceivedAtValues[0] ?? null,
    externalCalls: 0
  };
}

function createMockReviewAlerts(filters: ProviderWebhookReviewAlertsFilters): ProviderWebhookReviewAlerts {
  const generatedAt = new Date().toISOString();
  const appliedFilters = cleanMockReviewAlertsFilters(filters);
  const openItems = filterMockUnmatchedInbound(appliedFilters).filter((item) =>
    item.unmatchedStatus === "open" || item.unmatchedStatus === "review-needed"
  );
  const alertItems = openItems
    .map(mockReviewAlertItem)
    .filter((item) => !appliedFilters.severity || item.severity === appliedFilters.severity)
    .sort((left, right) => left.receivedAt.localeCompare(right.receivedAt));
  return {
    generatedAt,
    appliedFilters,
    totalAlerts: alertItems.length,
    infoCount: alertItems.filter((item) => item.severity === "info").length,
    warningCount: alertItems.filter((item) => item.severity === "warning").length,
    criticalCount: alertItems.filter((item) => item.severity === "critical").length,
    staleOpenCount: alertItems.filter((item) => mockHoursSince(item.receivedAt) >= mockReviewAlertThresholds.staleWarningHours).length,
    overSlaCount: alertItems.filter((item) => mockHoursSince(item.receivedAt) >= mockReviewAlertThresholds.overSlaHours).length,
    oldestOpenReceivedAt: alertItems[0]?.receivedAt ?? null,
    latestAlertGeneratedAt: alertItems.length > 0 ? generatedAt : null,
    thresholds: mockReviewAlertThresholds,
    byProvider: countMockBy(alertItems, providersForMetrics, (item) => item.provider),
    byPlatform: countMockBy(alertItems, providersForMetrics, (item) => item.platform),
    byEventType: countMockBy(alertItems, eventTypesForMetrics, (item) => item.eventType),
    byReviewStatus: countMockBy(alertItems, reviewStatusesForMetrics, (item) => item.reviewStatus),
    byLinkStatus: countMockBy(alertItems, linkStatusesForMetrics, (item) => item.linkStatus),
    byUnmatchedStatus: countMockBy(alertItems, unmatchedStatusesForMetrics, (item) => item.unmatchedStatus),
    bySeverity: countMockBy(alertItems, alertSeveritiesForMetrics, (item) => item.severity),
    alertItems: alertItems.slice(0, 10),
    externalCalls: 0
  };
}

function createMockReviewTriage(filters: ProviderWebhookReviewTriageFilters): ProviderWebhookReviewTriage {
  const appliedFilters = cleanMockReviewTriageFilters(filters);
  const items = filterMockUnmatchedInbound(mockTriageBaseFilters(appliedFilters))
    .map(mockReviewTriageItem)
    .filter((item) => !appliedFilters.severity || item.severity === appliedFilters.severity)
    .filter((item) => !appliedFilters.triageLane || item.triageLane === appliedFilters.triageLane)
    .sort((left, right) => {
      const severityCompared = mockTriageSeverityRank(right.severity) - mockTriageSeverityRank(left.severity);
      if (severityCompared !== 0) return severityCompared;
      return left.receivedAt.localeCompare(right.receivedAt);
    });
  const openItems = items.filter((item) => item.unmatchedStatus === "open" || item.unmatchedStatus === "review-needed");
  return {
    generatedAt: new Date().toISOString(),
    appliedFilters,
    totalItems: items.length,
    totalOpenItems: openItems.length,
    totalTriageLanes: mockTriageLanes.length,
    thresholds: mockReviewAlertThresholds,
    lanes: mockTriageLanes.map((laneKey) => ({
      laneKey,
      label: mockTriageLaneDetails[laneKey].label,
      severity: mockTriageLaneSeverity(laneKey),
      count: items.filter((item) => item.triageLane === laneKey).length,
      description: mockTriageLaneDetails[laneKey].description,
      recommendedNextActions: mockTriageActionsForLane(laneKey),
      safeDrilldownFilters: mockTriageLaneDetails[laneKey].safeDrilldownFilters
    })),
    byProvider: countMockBy(items, providersForMetrics, (item) => item.provider),
    byPlatform: countMockBy(items, providersForMetrics, (item) => item.platform),
    byEventType: countMockBy(items, eventTypesForMetrics, (item) => item.eventType),
    byReviewStatus: countMockBy(items, reviewStatusesForMetrics, (item) => item.reviewStatus),
    byLinkStatus: countMockBy(items, linkStatusesForMetrics, (item) => item.linkStatus),
    byUnmatchedStatus: countMockBy(items, unmatchedStatusesForMetrics, (item) => item.unmatchedStatus),
    byLane: countMockBy(items, mockTriageLanes, (item) => item.triageLane),
    topItems: items.slice(0, 10),
    externalCalls: 0
  };
}

function createMockReviewWorkload(filters: ProviderWebhookReviewWorkloadFilters): ProviderWebhookReviewWorkload {
  const appliedFilters = cleanMockReviewTriageFilters(filters);
  const items = filterMockUnmatchedInbound(mockTriageBaseFilters(appliedFilters))
    .map(mockAssignmentSummaryItem)
    .filter((item) => !appliedFilters.severity || item.severity === appliedFilters.severity)
    .filter((item) => !appliedFilters.triageLane || item.triageLane === appliedFilters.triageLane);
  const openItems = items.filter((item) => item.unmatchedStatus === "open" || item.unmatchedStatus === "review-needed");
  const assignedOpen = openItems.filter((item) => item.assignmentStatus === "assigned");
  return {
    generatedAt: new Date().toISOString(),
    appliedFilters,
    totalItems: items.length,
    totalOpenItems: openItems.length,
    thresholds: mockReviewAlertThresholds,
    counts: {
      unassignedOpen: openItems.filter((item) => item.assignmentStatus === "unassigned").length,
      assignedToMeOpen: openItems.filter((item) => item.assignedToOperatorLabel === "operator:current").length,
      assignedToOthersOpen: openItems.filter((item) => item.assignmentStatus === "assigned" && item.assignedToOperatorLabel !== "operator:current").length,
      assignedOpen: assignedOpen.length,
      escalatedOpen: openItems.filter((item) => item.escalationStatus === "escalated").length,
      overdueAssignedOpen: assignedOpen.filter((item) => mockHoursSince(item.assignedAt ?? item.receivedAt) >= mockReviewAlertThresholds.overSlaHours).length,
      recentlyAssigned: items.filter((item) => item.assignedAt).length,
      recentlyEscalated: items.filter((item) => item.escalatedAt).length,
      resolvedAssigned: items.filter((item) => item.assignmentStatus === "assigned" && item.unmatchedStatus !== "open" && item.unmatchedStatus !== "review-needed").length,
      unresolvedOpen: openItems.filter((item) => item.resolutionStatus === "unresolved").length,
      readyForClosure: openItems.filter((item) => item.closureReadiness === "READY_FOR_REVIEW" || item.closureReadiness === "READY_FOR_SKIP" || item.closureReadiness === "READY_FOR_LINK" || item.closureReadiness === "READY_FOR_LINK_AND_PERSIST").length,
      blockedResolution: openItems.filter((item) => item.closureReadiness === "BLOCKED").length,
      checklistIncompleteOpen: openItems.filter((item) => item.checklistCompletedCount < item.checklistTotalCount).length
    },
    byAssignee: countMockByDynamic(items, (item) => item.assignedToOperatorLabel ?? "unassigned"),
    byAssignmentStatus: countMockBy(items, ["unassigned", "assigned"], (item) => item.assignmentStatus),
    byEscalationStatus: countMockBy(items, ["none", "escalated"], (item) => item.escalationStatus),
    byEscalationReason: countMockBy(items, mockEscalationReasons, (item) => item.escalationReason ?? "none"),
    byProvider: countMockBy(items, providersForMetrics, (item) => item.provider),
    byPlatform: countMockBy(items, providersForMetrics, (item) => item.platform),
    byReviewStatus: countMockBy(items, reviewStatusesForMetrics, (item) => item.reviewStatus),
    byLinkStatus: countMockBy(items, linkStatusesForMetrics, (item) => item.linkStatus),
    byUnmatchedStatus: countMockBy(items, unmatchedStatusesForMetrics, (item) => item.unmatchedStatus),
    topAssignedItems: items.filter((item) => item.assignmentStatus === "assigned").slice(0, 10),
    topEscalatedItems: items.filter((item) => item.escalationStatus === "escalated").slice(0, 10),
    externalCalls: 0
  };
}

function createMockReviewResolutionSummary(filters: ProviderWebhookReviewResolutionSummaryFilters): ProviderWebhookReviewResolutionSummary {
  const appliedFilters = cleanMockReviewResolutionSummaryFilters(filters);
  const items = filterMockUnmatchedInbound(mockTriageBaseFilters(appliedFilters))
    .map(mockResolutionSummaryItem)
    .filter((item) => !appliedFilters.severity || item.severity === appliedFilters.severity)
    .filter((item) => !appliedFilters.triageLane || item.triageLane === appliedFilters.triageLane)
    .filter((item) => !appliedFilters.resolutionStatus || item.resolutionStatus === appliedFilters.resolutionStatus)
    .filter((item) => !appliedFilters.resolutionOutcome || item.resolutionOutcome === appliedFilters.resolutionOutcome)
    .filter((item) => !appliedFilters.closureReadiness || item.closureReadiness === appliedFilters.closureReadiness)
    .filter((item) => appliedFilters.checklistIncomplete === undefined || (item.checklistCompletedCount < item.checklistTotalCount) === appliedFilters.checklistIncomplete);
  const openItems = items.filter((item) => item.unmatchedStatus === "open" || item.unmatchedStatus === "review-needed");
  return {
    generatedAt: new Date().toISOString(),
    appliedFilters,
    totalItems: items.length,
    totalOpenItems: openItems.length,
    thresholds: mockReviewAlertThresholds,
    counts: {
      unresolvedOpen: openItems.filter((item) => item.resolutionStatus === "unresolved").length,
      readyForReview: openItems.filter((item) => item.closureReadiness === "READY_FOR_REVIEW").length,
      readyForSkip: openItems.filter((item) => item.closureReadiness === "READY_FOR_SKIP").length,
      readyForLink: openItems.filter((item) => item.closureReadiness === "READY_FOR_LINK").length,
      readyForLinkAndPersist: openItems.filter((item) => item.closureReadiness === "READY_FOR_LINK_AND_PERSIST").length,
      blocked: openItems.filter((item) => item.closureReadiness === "BLOCKED").length,
      resolvedRecently: items.filter((item) => item.resolvedAt).length,
      checklistIncompleteOpen: openItems.filter((item) => item.checklistCompletedCount < item.checklistTotalCount).length
    },
    byResolutionStatus: countMockBy(items, mockResolutionStatuses, (item) => item.resolutionStatus),
    byResolutionOutcome: countMockBy(items, mockResolutionOutcomes, (item) => item.resolutionOutcome ?? "none"),
    byClosureReadiness: countMockBy(items, mockClosureReadinessValues, (item) => item.closureReadiness),
    byChecklistStep: countMockBy(items.flatMap((item) => item.closureChecklist.filter((step) => step.completed)), mockClosureChecklistSteps, (step) => step.step),
    byProvider: countMockBy(items, providersForMetrics, (item) => item.provider),
    byPlatform: countMockBy(items, providersForMetrics, (item) => item.platform),
    byReviewStatus: countMockBy(items, reviewStatusesForMetrics, (item) => item.reviewStatus),
    byLinkStatus: countMockBy(items, linkStatusesForMetrics, (item) => item.linkStatus),
    byUnmatchedStatus: countMockBy(items, unmatchedStatusesForMetrics, (item) => item.unmatchedStatus),
    topReadyItems: items.filter((item) => item.closureReadiness === "READY_FOR_REVIEW" || item.closureReadiness === "READY_FOR_SKIP" || item.closureReadiness === "READY_FOR_LINK" || item.closureReadiness === "READY_FOR_LINK_AND_PERSIST").slice(0, 10),
    topBlockedItems: items.filter((item) => item.closureReadiness === "BLOCKED").slice(0, 10),
    externalCalls: 0
  };
}

function createMockReviewClosureReport(filters: ProviderWebhookReviewClosureReportFilters): ProviderWebhookReviewClosureReport {
  const appliedFilters = cleanMockReviewClosureReportFilters(filters);
  const items = filterMockUnmatchedInbound(mockTriageBaseFilters(appliedFilters))
    .map(mockClosureEvidenceSummaryItem)
    .filter((item) => !appliedFilters.severity || item.severity === appliedFilters.severity)
    .filter((item) => !appliedFilters.triageLane || item.triageLane === appliedFilters.triageLane);
  const openItems = items.filter((item) => item.unmatchedStatus === "open" || item.unmatchedStatus === "review-needed");
  return {
    generatedAt: new Date().toISOString(),
    appliedFilters,
    totalItems: items.length,
    totalOpenItems: openItems.length,
    evidenceReadyCount: items.filter((item) => item.evidenceStatus === "ready").length,
    evidenceBlockedCount: items.filter((item) => item.evidenceStatus === "blocked").length,
    evidenceIncompleteCount: items.filter((item) => item.evidenceStatus === "incomplete").length,
    byClosureReadiness: countMockBy(items, mockClosureReadinessValues, (item) => item.closureReadiness),
    byResolutionOutcome: countMockBy(items, mockResolutionOutcomes, (item) => item.resolutionOutcome ?? "none"),
    byChecklistStep: countMockBy(items.flatMap((item) => item.checklistIncompleteSteps), mockClosureChecklistSteps, (step) => step),
    byAssignmentStatus: countMockBy(items, ["unassigned", "assigned"], (item) => item.assignmentStatus),
    byEscalationStatus: countMockBy(items, ["none", "escalated"], (item) => item.escalationStatus),
    topEvidenceReadyItems: items.filter((item) => item.evidenceStatus === "ready").slice(0, 10),
    topEvidenceBlockedItems: items.filter((item) => item.evidenceStatus === "blocked").slice(0, 10),
    externalCalls: 0
  };
}

function createMockReviewClosureReportExport(filters: ProviderWebhookReviewClosureReportFilters): ProviderWebhookReviewClosureReportExport {
  return {
    ...createMockReviewClosureReport(filters),
    exportKind: "closure-report",
    format: "json",
    contentType: "application/json",
    safeFilename: "provider-webhook-review-closure-report.json",
    exportedAt: new Date().toISOString()
  };
}

function createMockClosureEvidence(unmatchedInboundId: string): ProviderWebhookReviewClosureEvidence {
  const item = mockProviderWebhookUnmatchedInbound.find((candidate) => candidate.id === unmatchedInboundId);
  if (!item) throw new Error("Unmatched inbound item not found");
  return {
    generatedAt: new Date().toISOString(),
    ...mockClosureEvidenceSummaryItem(item)
  };
}

function createMockClosureEvidenceExport(unmatchedInboundId: string): ProviderWebhookReviewClosureEvidenceExport {
  const evidence = createMockClosureEvidence(unmatchedInboundId);
  return {
    ...evidence,
    exportKind: "closure-evidence",
    format: "json",
    contentType: "application/json",
    safeFilename: `provider-webhook-closure-evidence-${evidence.provider}-${evidence.unmatchedId}.json`,
    exportedAt: new Date().toISOString()
  };
}

function mockReviewAlertItem(item: ProviderWebhookUnmatchedInboundItem) {
  return {
    unmatchedId: item.id,
    provider: item.provider,
    platform: item.provider,
    channelAccountId: item.channelAccountId,
    safeRoomLabel: mockSafeRoomLabel(item),
    roomKeyDigest: item.roomKeyDigest,
    eventType: item.eventType,
    receivedAt: item.receivedAt,
    ageBucket: mockAgeBucket(item.receivedAt),
    severity: mockReviewAlertSeverity(item.receivedAt),
    reviewStatus: item.reviewStatus,
    linkStatus: item.linkStatus,
    unmatchedStatus: item.unmatchedStatus,
    assignmentStatus: item.assignmentStatus,
    assignedToOperatorLabel: item.assignedToOperatorLabel,
    escalationStatus: item.escalationStatus,
    escalationReason: item.escalationReason,
    routingOutcome: `${item.routingStatus}/${item.conversationLookupStatus}`,
    diagnosticsAvailable: true,
    historyAvailable: true,
    externalCalls: 0 as const
  };
}

function mockAssignmentSummaryItem(item: ProviderWebhookUnmatchedInboundItem) {
  syncMockResolutionState(item);
  const lane = mockTriageLaneForItem(item);
  return {
    unmatchedId: item.id,
    provider: item.provider,
    platform: item.provider,
    channelAccountId: item.channelAccountId,
    safeRoomLabel: mockSafeRoomLabel(item),
    roomKeyDigest: item.roomKeyDigest,
    eventType: item.eventType,
    receivedAt: item.receivedAt,
    ageBucket: mockAgeBucket(item.receivedAt),
    reviewStatus: item.reviewStatus,
    linkStatus: item.linkStatus,
    unmatchedStatus: item.unmatchedStatus,
    triageLane: lane,
    severity: mockTriageSeverityForItem(item, lane),
    assignmentStatus: item.assignmentStatus,
    assignedToOperatorLabel: item.assignedToOperatorLabel,
    assignedAt: item.assignedAt,
    assignedByOperatorLabel: item.assignedByOperatorLabel,
    escalationStatus: item.escalationStatus,
    escalationReason: item.escalationReason,
    escalatedAt: item.escalatedAt,
    escalatedByOperatorLabel: item.escalatedByOperatorLabel,
    resolutionStatus: item.resolutionStatus,
    resolutionOutcome: item.resolutionOutcome,
    closureReadiness: item.closureReadiness,
    checklistCompletedCount: item.checklistCompletedCount,
    checklistTotalCount: item.checklistTotalCount,
    lastOperatorNoteAt: item.lastOperatorNoteAt,
    historyAvailable: true,
    diagnosticsAvailable: true,
    candidatesAvailable: isMockLinkableUnmatchedItem(item),
    externalCalls: 0 as const
  };
}

function mockResolutionSummaryItem(item: ProviderWebhookUnmatchedInboundItem) {
  syncMockResolutionState(item);
  const lane = mockTriageLaneForItem(item);
  return {
    unmatchedId: item.id,
    provider: item.provider,
    platform: item.provider,
    channelAccountId: item.channelAccountId,
    safeRoomLabel: mockSafeRoomLabel(item),
    roomKeyDigest: item.roomKeyDigest,
    eventType: item.eventType,
    receivedAt: item.receivedAt,
    ageBucket: mockAgeBucket(item.receivedAt),
    reviewStatus: item.reviewStatus,
    linkStatus: item.linkStatus,
    unmatchedStatus: item.unmatchedStatus,
    triageLane: lane,
    severity: mockTriageSeverityForItem(item, lane),
    assignmentStatus: item.assignmentStatus,
    assignedToOperatorLabel: item.assignedToOperatorLabel,
    escalationStatus: item.escalationStatus,
    escalationReason: item.escalationReason,
    resolutionStatus: item.resolutionStatus,
    resolutionOutcome: item.resolutionOutcome,
    resolvedAt: item.resolvedAt,
    resolvedByOperatorLabel: item.resolvedByOperatorLabel,
    closureReadiness: item.closureReadiness,
    closureChecklist: item.closureChecklist,
    checklistCompletedCount: item.checklistCompletedCount,
    checklistTotalCount: item.checklistTotalCount,
    checklistIncompleteSteps: item.checklistIncompleteSteps,
    recommendedNextActions: item.recommendedNextActions,
    lastOperatorNoteAt: item.lastOperatorNoteAt,
    historyAvailable: true,
    diagnosticsAvailable: true,
    candidatesAvailable: isMockLinkableUnmatchedItem(item),
    externalCalls: 0 as const
  };
}

function mockClosureEvidenceSummaryItem(item: ProviderWebhookUnmatchedInboundItem) {
  syncMockResolutionState(item);
  const lane = mockTriageLaneForItem(item);
  const operatorNoteCount = mockProviderWebhookOperatorNotes.filter((note) => note.unmatchedId === item.id).length;
  const candidatesAvailable = isMockLinkableUnmatchedItem(item);
  return {
    unmatchedId: item.id,
    provider: item.provider,
    platform: item.provider,
    channelAccountId: item.channelAccountId,
    safeRoomLabel: mockSafeRoomLabel(item),
    roomKeyDigest: item.roomKeyDigest,
    eventType: item.eventType,
    receivedAt: item.receivedAt,
    ageBucket: mockAgeBucket(item.receivedAt),
    reviewStatus: item.reviewStatus,
    linkStatus: item.linkStatus,
    unmatchedStatus: item.unmatchedStatus,
    triageLane: lane,
    severity: mockTriageSeverityForItem(item, lane),
    assignmentStatus: item.assignmentStatus,
    assignedToOperatorLabel: item.assignedToOperatorLabel,
    escalationStatus: item.escalationStatus,
    escalationReason: item.escalationReason,
    resolutionStatus: item.resolutionStatus,
    resolutionOutcome: item.resolutionOutcome,
    closureReadiness: item.closureReadiness,
    evidenceStatus: mockClosureEvidenceStatusForItem(item),
    checklistCompletedCount: item.checklistCompletedCount,
    checklistTotalCount: item.checklistTotalCount,
    checklistIncompleteSteps: [...item.checklistIncompleteSteps],
    recommendedNextActions: [...item.recommendedNextActions],
    evidenceFlags: {
      diagnosticsViewedOrAvailable: item.diagnosticsAvailable || mockChecklistStepCompleted(item, "VIEWED_DIAGNOSTICS"),
      historyAvailable: true,
      operatorNotesAvailable: operatorNoteCount > 0 || mockChecklistStepCompleted(item, "CONFIRMED_OPERATOR_NOTE"),
      candidatesAvailable,
      assignmentOrEscalationPresent: item.assignmentStatus === "assigned" || item.escalationStatus === "escalated" || mockChecklistStepCompleted(item, "CONFIRMED_ASSIGNMENT_OR_ESCALATION"),
      noProviderOutboundConfirmed: mockChecklistStepCompleted(item, "CONFIRMED_NO_PROVIDER_OUTBOUND"),
      noRawLeakageConfirmed: mockChecklistStepCompleted(item, "CONFIRMED_NO_RAW_LEAKAGE"),
      safeLinkTargetConfirmed: mockChecklistStepCompleted(item, "CONFIRMED_SAFE_LINK_TARGET")
    },
    historyEntryCount: createMockUnmatchedHistory(item.id).entries.length,
    operatorNoteCount,
    candidateSummaryCount: candidatesAvailable ? 1 : 0,
    externalCalls: 0 as const
  };
}

function mockClosureEvidenceStatusForItem(item: ProviderWebhookUnmatchedInboundItem): ProviderWebhookReviewClosureEvidenceStatus {
  if (item.closureReadiness === "BLOCKED") return "blocked";
  if (
    item.closureReadiness === "READY_FOR_REVIEW" ||
    item.closureReadiness === "READY_FOR_SKIP" ||
    item.closureReadiness === "READY_FOR_LINK" ||
    item.closureReadiness === "READY_FOR_LINK_AND_PERSIST"
  ) {
    return "ready";
  }
  return "incomplete";
}

function mockChecklistStepCompleted(item: ProviderWebhookUnmatchedInboundItem, step: ProviderWebhookReviewClosureChecklistStep) {
  return item.closureChecklist.some((checklistItem) => checklistItem.step === step && checklistItem.completed);
}

function mockReviewTriageItem(item: ProviderWebhookUnmatchedInboundItem) {
  const lane = mockTriageLaneForItem(item);
  return {
    unmatchedId: item.id,
    provider: item.provider,
    platform: item.provider,
    channelAccountId: item.channelAccountId,
    safeRoomLabel: mockSafeRoomLabel(item),
    roomKeyDigest: item.roomKeyDigest,
    eventType: item.eventType,
    receivedAt: item.receivedAt,
    ageBucket: mockAgeBucket(item.receivedAt),
    triageLane: lane,
    severity: mockTriageSeverityForItem(item, lane),
    reviewStatus: item.reviewStatus,
    linkStatus: item.linkStatus,
    unmatchedStatus: item.unmatchedStatus,
    assignmentStatus: item.assignmentStatus,
    assignedToOperatorLabel: item.assignedToOperatorLabel,
    escalationStatus: item.escalationStatus,
    escalationReason: item.escalationReason,
    routingOutcome: `${item.routingStatus}/${item.conversationLookupStatus}`,
    recommendedNextActions: mockTriageActionsForLane(lane),
    diagnosticsAvailable: true,
    historyAvailable: true,
    candidatesAvailable: isMockLinkableUnmatchedItem(item),
    exportAvailable: true,
    externalCalls: 0 as const
  };
}

function filterMockEventsForMetrics(filters: ProviderWebhookReviewMetricsFilters) {
  const receivedFrom = filters.receivedAtFrom ?? filters.receivedFrom;
  const receivedTo = filters.receivedAtTo ?? filters.receivedTo;
  return mockProviderWebhookEvents.filter((event) => {
    if (filters.provider && event.provider !== filters.provider) return false;
    if (filters.eventType && event.eventType !== filters.eventType) return false;
    if (receivedFrom && event.receivedAt < new Date(receivedFrom).toISOString()) return false;
    if (receivedTo && event.receivedAt > new Date(receivedTo).toISOString()) return false;
    return true;
  });
}

function cleanMockReviewMetricsFilters(filters: ProviderWebhookReviewMetricsFilters) {
  const allowedKeys = [
    "provider",
    "reviewStatus",
    "linkStatus",
    "unmatchedStatus",
    "status",
    "eventType",
    "assignedTo",
    "assignmentStatus",
    "escalationStatus",
    "escalationReason",
    "resolutionStatus",
    "resolutionOutcome",
    "closureReadiness",
    "checklistIncomplete",
    "receivedFrom",
    "receivedTo",
    "receivedAtFrom",
    "receivedAtTo"
  ] as const;
  return Object.fromEntries(
    allowedKeys
      .map((key) => [key, filters[key]] as const)
      .filter(([, value]) => value !== undefined && value !== null && value !== "")
  ) as ProviderWebhookReviewMetricsFilters;
}

function cleanMockReviewAlertsFilters(filters: ProviderWebhookReviewAlertsFilters) {
  return {
    ...cleanMockReviewMetricsFilters(filters),
    ...(filters.severity ? { severity: filters.severity } : {})
  } as ProviderWebhookReviewAlertsFilters;
}

function cleanMockReviewTriageFilters(filters: ProviderWebhookReviewTriageFilters) {
  return {
    ...cleanMockReviewMetricsFilters(filters),
    ...(filters.severity ? { severity: filters.severity } : {}),
    ...(filters.triageLane ? { triageLane: filters.triageLane } : {})
  } as ProviderWebhookReviewTriageFilters;
}

function cleanMockReviewResolutionSummaryFilters(filters: ProviderWebhookReviewResolutionSummaryFilters) {
  return {
    ...cleanMockReviewTriageFilters(filters),
    ...(filters.resolutionStatus ? { resolutionStatus: filters.resolutionStatus } : {}),
    ...(filters.resolutionOutcome ? { resolutionOutcome: filters.resolutionOutcome } : {}),
    ...(filters.closureReadiness ? { closureReadiness: filters.closureReadiness } : {}),
    ...(filters.checklistIncomplete !== undefined ? { checklistIncomplete: filters.checklistIncomplete } : {})
  } as ProviderWebhookReviewResolutionSummaryFilters;
}

function cleanMockReviewClosureReportFilters(filters: ProviderWebhookReviewClosureReportFilters) {
  return {
    ...cleanMockReviewResolutionSummaryFilters(filters)
  } as ProviderWebhookReviewClosureReportFilters;
}

function cleanMockSavedViewFilters(filters: CreateProviderWebhookReviewSavedViewRequest["filters"] = {}): ProviderWebhookReviewSavedView["filters"] {
  const allowedKeys = [
    "provider",
    "reviewStatus",
    "linkStatus",
    "unmatchedStatus",
    "eventType",
    "severity",
    "triageLane",
    "assignedTo",
    "assignmentStatus",
    "escalationStatus",
    "escalationReason",
    "resolutionStatus",
    "resolutionOutcome",
    "closureReadiness",
    "checklistIncomplete",
    "receivedAtFrom",
    "receivedAtTo",
    "pageSize"
  ] as const;
  return Object.fromEntries(
    allowedKeys
      .map((key) => [key, filters[key]] as const)
      .filter(([, value]) => value !== undefined && value !== null && value !== "")
  ) as ProviderWebhookReviewSavedView["filters"];
}

function mockTriageBaseFilters(filters: ProviderWebhookReviewTriageFilters): ProviderWebhookReviewMetricsFilters {
  const { severity: _severity, triageLane: _triageLane, ...baseFilters } = filters;
  return baseFilters;
}

const providersForMetrics = ["line", "telegram", "facebook", "instagram"] as const;
const eventTypesForMetrics = ["message.created", "webhook.verified", "webhook.failed"] as const;
const reviewStatusesForMetrics = ["pending", "reviewed", "skipped", "linked"] as const;
const linkStatusesForMetrics = ["none", "rejected", "linked", "linked-message-persisted", "duplicate-noop"] as const;
const unmatchedStatusesForMetrics = ["open", "review-needed", "reviewed", "blocked", "skipped", "linked", "duplicate-skipped"] as const;
const alertSeveritiesForMetrics = ["info", "warning", "critical"] as const;
const mockEscalationReasons = ["none", "SLA_RISK", "NO_SAFE_CANDIDATE", "ROUTING_FAILED", "HIGH_PRIORITY_CUSTOMER", "NEEDS_MANAGER_REVIEW", "MANUAL_REVIEW_BLOCKED"] as const;
const mockResolutionStatuses = ["unresolved", "resolved"] as const;
const mockResolutionOutcomes = ["none", "NEEDS_REVIEW", "REVIEWED_NO_MATCH", "REVIEWED_SAFE_MATCH", "LINKED_EXISTING_CONVERSATION", "LINKED_AND_PERSISTED_SAFE_MESSAGE", "SKIPPED_DUPLICATE", "SKIPPED_SPAM", "SKIPPED_UNSUPPORTED_EVENT", "ESCALATED_TO_MANAGER", "BLOCKED_UNSAFE", "ROUTING_FAILED", "MANUAL_REVIEW_REQUIRED"] as const;
const mockClosureReadinessValues = ["NOT_READY", "READY_FOR_REVIEW", "READY_FOR_SKIP", "READY_FOR_LINK", "READY_FOR_LINK_AND_PERSIST", "ALREADY_REVIEWED", "BLOCKED"] as const;
const mockClosureChecklistSteps: ProviderWebhookReviewClosureChecklistStep[] = [
  "VIEWED_DIAGNOSTICS",
  "REVIEWED_HISTORY",
  "REVIEWED_TRIAGE_GUIDANCE",
  "REVIEWED_CANDIDATES",
  "CONFIRMED_NO_RAW_LEAKAGE",
  "CONFIRMED_NO_PROVIDER_OUTBOUND",
  "CONFIRMED_ASSIGNMENT_OR_ESCALATION",
  "CONFIRMED_SAFE_LINK_TARGET",
  "CONFIRMED_OPERATOR_NOTE"
];
const mockTriageLanes: ProviderWebhookReviewTriageLane[] = [
  "critical_stale_open",
  "warning_stale_open",
  "candidate_lookup_recommended",
  "safe_link_candidate_available",
  "needs_manual_review",
  "recently_reviewed",
  "skipped_ignored",
  "failed_routing_missing_match"
];
const mockTriageLaneDetails: Record<ProviderWebhookReviewTriageLane, {
  label: string;
  description: string;
  safeDrilldownFilters: ProviderWebhookReviewMetricsFilters;
}> = {
  critical_stale_open: {
    label: "Critical stale open",
    description: "Open unmatched inbound items past the critical review threshold.",
    safeDrilldownFilters: { status: "open" }
  },
  warning_stale_open: {
    label: "Warning stale open",
    description: "Open unmatched inbound items past the warning review threshold.",
    safeDrilldownFilters: { status: "open" }
  },
  candidate_lookup_recommended: {
    label: "Candidate lookup recommended",
    description: "Open items where a safe candidate lookup should be run next.",
    safeDrilldownFilters: { status: "open", reviewStatus: "pending", linkStatus: "none" }
  },
  safe_link_candidate_available: {
    label: "Safe link candidate available",
    description: "Open normalized items with safe platform, channel account, and room digest context.",
    safeDrilldownFilters: { status: "open", reviewStatus: "pending", linkStatus: "none" }
  },
  needs_manual_review: {
    label: "Needs manual review",
    description: "Open items that need an operator decision before any safe action.",
    safeDrilldownFilters: { status: "open", reviewStatus: "pending" }
  },
  recently_reviewed: {
    label: "Recently reviewed",
    description: "Items already reviewed or safely linked, shown for history follow-up.",
    safeDrilldownFilters: { reviewStatus: "reviewed" }
  },
  skipped_ignored: {
    label: "Skipped / ignored",
    description: "Skipped, duplicate, or blocked items that should only be reviewed through history.",
    safeDrilldownFilters: { status: "skipped" }
  },
  failed_routing_missing_match: {
    label: "Failed routing / missing conversation match",
    description: "Items with blocked routing or missing safe conversation match context.",
    safeDrilldownFilters: { status: "open" }
  }
};
const mockReviewAlertThresholds = {
  staleWarningHours: 24,
  staleCriticalHours: 72,
  overSlaHours: 48
} as const;

function countMockBy<T, K extends string>(items: T[], keys: readonly K[], getKey: (item: T) => K) {
  return keys.map((key) => ({
    key,
    label: key,
    count: items.filter((item) => getKey(item) === key).length
  }));
}

function countMockByDynamic<T>(items: T[], getKey: (item: T) => string) {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = getKey(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, count]) => ({ key, label: key, count }));
}

function mockAgeBuckets(items: ProviderWebhookUnmatchedInboundItem[]) {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  const oneDay = 24 * oneHour;
  const threeDays = 3 * oneDay;
  return items.reduce((buckets, item) => {
    const age = Math.max(0, now - new Date(item.receivedAt).getTime());
    if (age < oneHour) buckets.under1Hour += 1;
    else if (age < oneDay) buckets.oneTo24Hours += 1;
    else if (age < threeDays) buckets.oneTo3Days += 1;
    else buckets.over3Days += 1;
    return buckets;
  }, {
    under1Hour: 0,
    oneTo24Hours: 0,
    oneTo3Days: 0,
    over3Days: 0
  });
}

function mockAgeBucket(receivedAt: string): ProviderWebhookReviewAlertAgeBucket {
  const ageHours = mockHoursSince(receivedAt);
  if (ageHours < 1) return "under1Hour";
  if (ageHours < 24) return "oneTo24Hours";
  if (ageHours < 72) return "oneTo3Days";
  return "over3Days";
}

function mockReviewAlertSeverity(receivedAt: string): ProviderWebhookReviewAlertSeverity {
  const ageHours = mockHoursSince(receivedAt);
  if (ageHours >= mockReviewAlertThresholds.staleCriticalHours) return "critical";
  if (ageHours >= mockReviewAlertThresholds.staleWarningHours) return "warning";
  return "info";
}

function mockTriageLaneForItem(item: ProviderWebhookUnmatchedInboundItem): ProviderWebhookReviewTriageLane {
  if (item.reviewStatus === "skipped" || item.unmatchedStatus === "skipped" || item.unmatchedStatus === "duplicate-skipped" || item.unmatchedStatus === "blocked") {
    return "skipped_ignored";
  }
  if (item.reviewStatus === "reviewed" || item.reviewStatus === "linked" || item.unmatchedStatus === "reviewed" || item.unmatchedStatus === "linked") {
    return "recently_reviewed";
  }
  if (item.unmatchedStatus === "open" || item.unmatchedStatus === "review-needed") {
    const ageHours = mockHoursSince(item.receivedAt);
    if (ageHours >= mockReviewAlertThresholds.staleCriticalHours) return "critical_stale_open";
    if (ageHours >= mockReviewAlertThresholds.staleWarningHours) return "warning_stale_open";
    if (isMockLinkableUnmatchedItem(item)) return "safe_link_candidate_available";
    if (item.conversationLookupStatus === "not-found") return "candidate_lookup_recommended";
    if (item.routingStatus === "blocked-signature" || item.routingStatus === "blocked-replay" || item.routingStatus === "unsupported") {
      return "failed_routing_missing_match";
    }
    return "needs_manual_review";
  }
  return "failed_routing_missing_match";
}

function mockTriageSeverityForItem(item: ProviderWebhookUnmatchedInboundItem, lane: ProviderWebhookReviewTriageLane): ProviderWebhookReviewAlertSeverity {
  if (lane === "critical_stale_open") return "critical";
  if (lane === "warning_stale_open") return "warning";
  if (lane === "failed_routing_missing_match" && item.routingStatus !== "dry-run-only") return "warning";
  return "info";
}

function mockTriageLaneSeverity(lane: ProviderWebhookReviewTriageLane): ProviderWebhookReviewAlertSeverity {
  if (lane === "critical_stale_open") return "critical";
  if (lane === "warning_stale_open" || lane === "failed_routing_missing_match") return "warning";
  return "info";
}

function mockTriageActionsForLane(lane: ProviderWebhookReviewTriageLane): ProviderWebhookTriageRecommendedAction[] {
  if (lane === "critical_stale_open") return ["OPEN_DIAGNOSTICS", "VIEW_HISTORY", "APPLY_FILTER", "MARK_REVIEWED", "SKIP"];
  if (lane === "warning_stale_open") return ["OPEN_DIAGNOSTICS", "VIEW_HISTORY", "APPLY_FILTER", "RUN_CANDIDATE_LOOKUP"];
  if (lane === "safe_link_candidate_available") return ["RUN_CANDIDATE_LOOKUP", "LINK_ONLY", "LINK_AND_PERSIST_SAFE_MESSAGE"];
  if (lane === "candidate_lookup_recommended") return ["RUN_CANDIDATE_LOOKUP", "OPEN_DIAGNOSTICS", "VIEW_HISTORY"];
  if (lane === "needs_manual_review") return ["OPEN_DIAGNOSTICS", "VIEW_HISTORY", "MARK_REVIEWED", "SKIP"];
  if (lane === "recently_reviewed") return ["VIEW_HISTORY", "OPEN_DIAGNOSTICS"];
  if (lane === "skipped_ignored") return ["VIEW_HISTORY", "APPLY_FILTER"];
  return ["OPEN_DIAGNOSTICS", "VIEW_HISTORY", "APPLY_FILTER", "SKIP"];
}

function mockTriageSeverityRank(severity: ProviderWebhookReviewAlertSeverity) {
  if (severity === "critical") return 3;
  if (severity === "warning") return 2;
  return 1;
}

function mockHoursSince(receivedAt: string) {
  const receivedMs = new Date(receivedAt).getTime();
  if (Number.isNaN(receivedMs)) return 0;
  return Math.max(0, (Date.now() - receivedMs) / (60 * 60 * 1000));
}

function createMockUnmatchedDiagnostics(unmatchedInboundId: string): ProviderWebhookUnmatchedInboundDiagnostics {
  const item = mockProviderWebhookUnmatchedInbound.find((candidate) => candidate.id === unmatchedInboundId);
  if (!item) throw new Error("Unmatched inbound item not found");
  syncMockResolutionState(item);
  const event = mockProviderWebhookEvents.find((candidate) => candidate.unmatchedInboundId === item.id);
  return {
    unmatchedId: item.id,
    provider: item.provider,
    platform: item.provider,
    channelAccountId: item.channelAccountId,
    safeRoomLabel: mockSafeRoomLabel(item),
    roomKeyDigest: item.roomKeyDigest,
    eventType: item.eventType,
    receivedAt: item.receivedAt,
    reviewStatus: item.reviewStatus,
    linkStatus: item.linkStatus,
    unmatchedStatus: item.unmatchedStatus,
    assignmentStatus: item.assignmentStatus,
    assignedToOperatorLabel: item.assignedToOperatorLabel,
    assignedAt: item.assignedAt,
    assignedByOperatorLabel: item.assignedByOperatorLabel,
    escalationStatus: item.escalationStatus,
    escalationReason: item.escalationReason,
    escalatedAt: item.escalatedAt,
    escalatedByOperatorLabel: item.escalatedByOperatorLabel,
    resolutionStatus: item.resolutionStatus,
    resolutionOutcome: item.resolutionOutcome,
    resolvedAt: item.resolvedAt,
    resolvedByOperatorLabel: item.resolvedByOperatorLabel,
    closureReadiness: item.closureReadiness,
    closureChecklist: item.closureChecklist,
    checklistCompletedCount: item.checklistCompletedCount,
    checklistTotalCount: item.checklistTotalCount,
    checklistIncompleteSteps: item.checklistIncompleteSteps,
    recommendedNextActions: item.recommendedNextActions,
    lastOperatorNoteAt: item.lastOperatorNoteAt,
    routingOutcome: `${item.routingStatus}/${item.conversationLookupStatus}`,
    normalizedEventType: item.normalizedEventType,
    persistenceOutcome: event?.inboundPersistenceStatus ?? (item.messagePersisted ? "persisted" : "not-persisted"),
    candidateLookupAvailable: isMockLinkableUnmatchedItem(item),
    historyAvailable: true,
    exportAvailable: true,
    lastActionAt: item.unmatchedResolvedAt ?? item.reviewedAt ?? item.receivedAt,
    safeWarnings: {
      signatureRejected: event?.signatureStatus === "failed" || item.routingStatus === "blocked-signature",
      replayDuplicate: event?.replayDetected === true || item.routingStatus === "blocked-replay" || item.unmatchedStatus === "duplicate-skipped",
      missingConversationMatch: item.conversationLookupStatus === "not-found",
      staleOpenItem: isMockStaleOpenUnmatchedItem(item)
    },
    externalCalls: 0
  };
}

function isMockLinkableUnmatchedItem(item: ProviderWebhookUnmatchedInboundItem) {
  return (item.unmatchedStatus === "open" || item.unmatchedStatus === "review-needed")
    && item.normalizationStatus === "normalized"
    && item.conversationLookupStatus === "not-found"
    && item.providerEventDigest !== null
    && item.channelAccountId !== null
    && item.roomKeyDigest !== null;
}

function isMockStaleOpenUnmatchedItem(item: ProviderWebhookUnmatchedInboundItem) {
  if (item.unmatchedStatus !== "open" && item.unmatchedStatus !== "review-needed") return false;
  const receivedAt = new Date(item.receivedAt).getTime();
  if (Number.isNaN(receivedAt)) return false;
  return Date.now() - receivedAt >= 3 * 24 * 60 * 60 * 1000;
}

function createMockUnmatchedHistory(unmatchedInboundId: string): ProviderWebhookUnmatchedInboundHistory {
  const item = mockProviderWebhookUnmatchedInbound.find((candidate) => candidate.id === unmatchedInboundId);
  if (!item) throw new Error("Unmatched inbound item not found");
  syncMockResolutionState(item);
  const safeRoomLabel = mockSafeRoomLabel(item);
  const base = {
    unmatchedInboundId: item.id,
    provider: item.provider,
    channelAccountId: item.channelAccountId,
    safeRoomLabel,
    roomKeyDigest: item.roomKeyDigest,
    eventType: item.eventType,
    externalCalls: 0 as const
  };
  const entries: ProviderWebhookUnmatchedInboundHistory["entries"] = [
    {
      id: `${item.id}-history-received`,
      ...base,
      action: "inbound_received",
      actionStatus: "received",
      statusBefore: null,
      statusAfter: "received",
      actor: "system",
      reason: "Mock sandbox event received",
      message: "Inbound sandbox event received",
      linkedConversationId: null,
      linkedMessageId: null,
      receivedAt: item.receivedAt,
      actionAt: item.receivedAt
    },
    {
      id: `${item.id}-history-routed`,
      ...base,
      action: "normalized_routed",
      actionStatus: `${item.normalizationStatus}/${item.routingStatus}`,
      statusBefore: "received",
      statusAfter: item.routingStatus,
      actor: "system",
      reason: `lookup=${item.conversationLookupStatus}`,
      message: "Normalized and routed with safe provider context",
      linkedConversationId: null,
      linkedMessageId: null,
      receivedAt: item.receivedAt,
      actionAt: item.receivedAt
    },
    {
      id: `${item.id}-history-queued`,
      ...base,
      action: "unmatched_queued",
      actionStatus: item.unmatchedStatus,
      statusBefore: item.routingStatus,
      statusAfter: item.unmatchedStatus,
      actor: "system",
      reason: item.unmatchedReason,
      message: "Queued for safe unmatched inbound review",
      linkedConversationId: null,
      linkedMessageId: null,
      receivedAt: item.receivedAt,
      actionAt: item.receivedAt
    }
  ];
  if (item.reviewStatus === "reviewed" || item.reviewStatus === "skipped") {
    entries.push({
      id: `${item.id}-history-${item.reviewStatus}`,
      ...base,
      action: item.reviewStatus,
      actionStatus: item.reviewStatus,
      statusBefore: "review-needed",
      statusAfter: item.unmatchedStatus,
      actor: item.reviewedBy ?? "system",
      reason: item.reviewReason,
      message: item.reviewStatus === "reviewed" ? "Unmatched inbound item marked reviewed" : "Unmatched inbound item skipped",
      linkedConversationId: null,
      linkedMessageId: null,
      receivedAt: item.receivedAt,
      actionAt: item.reviewedAt ?? item.unmatchedResolvedAt ?? item.receivedAt
    });
  }
  if (item.reviewStatus === "linked") {
    entries.push({
      id: `${item.id}-history-linked`,
      ...base,
      action: "linked_to_conversation",
      actionStatus: item.linkStatus,
      statusBefore: "review-needed",
      statusAfter: item.unmatchedStatus,
      actor: "system",
      reason: item.linkStatus,
      message: "Linked to safe conversation",
      linkedConversationId: item.linkedConversationId,
      linkedMessageId: item.linkedMessageId,
      receivedAt: item.receivedAt,
      actionAt: item.unmatchedResolvedAt ?? item.receivedAt
    });
    if (item.messagePersisted) {
      entries.push({
        id: `${item.id}-history-linked-message`,
        ...base,
        action: "linked_message_persisted",
        actionStatus: item.linkStatus,
        statusBefore: "linked",
        statusAfter: item.linkStatus,
        actor: "system",
        reason: "safe message persisted",
        message: "Linked and persisted safe inbound message",
        linkedConversationId: item.linkedConversationId,
        linkedMessageId: item.linkedMessageId,
        receivedAt: item.receivedAt,
        actionAt: item.unmatchedResolvedAt ?? item.receivedAt
      });
    }
  }
  if (item.assignmentStatus === "assigned") {
    entries.push({
      id: `${item.id}-history-assigned`,
      ...base,
      action: "assigned",
      actionStatus: "assigned",
      statusBefore: "unassigned",
      statusAfter: `assigned:${item.assignedToOperatorLabel ?? "unknown"}`,
      actor: item.assignedByOperatorLabel ?? "operator:current",
      reason: `assigned to ${item.assignedToOperatorLabel ?? "operator"}`,
      message: "Unmatched inbound assigned for internal review",
      linkedConversationId: null,
      linkedMessageId: null,
      receivedAt: item.receivedAt,
      actionAt: item.assignedAt ?? item.receivedAt
    });
  }
  if (item.escalationStatus === "escalated") {
    entries.push({
      id: `${item.id}-history-escalated`,
      ...base,
      action: "escalated",
      actionStatus: "escalated",
      statusBefore: "none",
      statusAfter: `escalated:${item.escalationReason ?? "unspecified"}`,
      actor: item.escalatedByOperatorLabel ?? "operator:current",
      reason: item.escalationReason,
      message: "Unmatched inbound escalated for internal review",
      linkedConversationId: null,
      linkedMessageId: null,
      receivedAt: item.receivedAt,
      actionAt: item.escalatedAt ?? item.receivedAt
    });
  }
  if (item.resolutionOutcome) {
    entries.push({
      id: `${item.id}-history-resolution`,
      ...base,
      action: "resolution_set",
      actionStatus: item.resolutionOutcome,
      statusBefore: "unresolved",
      statusAfter: `${item.resolutionStatus}:${item.resolutionOutcome}`,
      actor: item.resolvedByOperatorLabel ?? "operator:current",
      reason: item.resolutionOutcome,
      message: "Resolution metadata updated",
      linkedConversationId: null,
      linkedMessageId: null,
      receivedAt: item.receivedAt,
      actionAt: item.resolvedAt ?? item.receivedAt
    });
  }
  if (item.checklistCompletedCount > 0) {
    entries.push({
      id: `${item.id}-history-checklist`,
      ...base,
      action: "checklist_completed",
      actionStatus: `${item.checklistCompletedCount}/${item.checklistTotalCount}`,
      statusBefore: "0/0",
      statusAfter: `${item.checklistCompletedCount}/${item.checklistTotalCount}`,
      actor: "operator:current",
      reason: item.closureChecklist.filter((step) => step.completed).map((step) => step.step).join(",").slice(0, 160),
      message: "Resolution checklist updated",
      linkedConversationId: null,
      linkedMessageId: null,
      receivedAt: item.receivedAt,
      actionAt: item.closureChecklist.find((step) => step.completed)?.completedAt ?? item.receivedAt
    });
  }
  return {
    unmatchedInboundId: item.id,
    provider: item.provider,
    channelAccountId: item.channelAccountId,
    safeRoomLabel,
    roomKeyDigest: item.roomKeyDigest,
    entries,
    externalCalls: 0
  };
}

function createMockUnmatchedExport(filters: ProviderWebhookUnmatchedInboundExportQuery): ProviderWebhookUnmatchedInboundExport {
  const format = filters.format ?? "json";
  const limit = Math.min(filters.limit ?? 500, 500);
  const offset = filters.offset ?? 0;
  const sortBy = filters.sortBy ?? "receivedAt";
  const sortOrder = filters.sortOrder ?? "desc";
  const filtered = filterMockUnmatchedInbound(filters);
  const sorted = [...filtered].sort((left, right) => {
    const compared = left.receivedAt.localeCompare(right.receivedAt);
    return sortOrder === "asc" ? compared : -compared;
  });
  const rows = sorted.slice(offset, offset + limit).map((item) => {
    syncMockResolutionState(item);
    return {
      id: item.id,
      provider: item.provider,
      channelAccountId: item.channelAccountId,
      safeRoomLabel: mockSafeRoomLabel(item),
      roomKeyDigest: item.roomKeyDigest,
      eventType: item.eventType,
      reviewStatus: item.reviewStatus,
      linkStatus: item.linkStatus,
      unmatchedStatus: item.unmatchedStatus,
      receivedAt: item.receivedAt,
      reviewedAt: item.reviewedAt,
      linkedConversationId: item.linkedConversationId,
      candidateCount: mockProviderWebhookCandidatesByUnmatchedId[item.id]?.length ?? null,
      safeMessagePreview: safeMockText(item.textPreview),
      safeReason: safeMockText(item.reviewReason ?? item.unmatchedReason),
      safeResultSummary: safeMockText(item.reviewStatus === "linked" ? `linked:${item.linkStatus}` : item.reviewStatus),
      assignmentStatus: item.assignmentStatus,
      assignedToOperatorLabel: item.assignedToOperatorLabel,
      assignedAt: item.assignedAt,
      escalationStatus: item.escalationStatus,
      escalationReason: item.escalationReason,
      escalatedAt: item.escalatedAt,
      resolutionStatus: item.resolutionStatus,
      resolutionOutcome: item.resolutionOutcome,
      closureReadiness: item.closureReadiness,
      checklistCompletedCount: item.checklistCompletedCount,
      checklistTotalCount: item.checklistTotalCount,
      externalCalls: 0 as const
    };
  });
  return {
    format,
    rows,
    csv: format === "csv" ? mockRowsToCsv(rows) : null,
    appliedFilters: {
      ...filters,
      format,
      limit,
      offset,
      sortBy,
      sortOrder
    },
    appliedSort: {
      sortBy,
      sortOrder
    },
    requestedLimit: filters.limit ?? 500,
    exportMaxLimit: 500,
    exportedCount: rows.length,
    externalCalls: 0
  };
}

function mockSafeRoomLabel(item: ProviderWebhookUnmatchedInboundItem) {
  return `${item.provider} room digest ${item.roomKeyDigest?.replace(/^sha256:/, "").slice(0, 12) ?? "none"}`;
}

function defaultMockClosureChecklist() {
  return mockClosureChecklistSteps.map((step) => ({
    step,
    completed: false,
    completedAt: null,
    completedByOperatorLabel: null
  }));
}

function ensureMockResolutionState(item: ProviderWebhookUnmatchedInboundItem) {
  item.resolutionStatus = item.resolutionStatus ?? "unresolved";
  item.resolutionOutcome = item.resolutionOutcome ?? null;
  item.resolvedAt = item.resolvedAt ?? null;
  item.resolvedByOperatorLabel = item.resolvedByOperatorLabel ?? null;
  const existing = new Map((item.closureChecklist ?? []).map((step) => [step.step, step]));
  item.closureChecklist = mockClosureChecklistSteps.map((step) => {
    const current = existing.get(step);
    return {
      step,
      completed: current?.completed ?? false,
      completedAt: current?.completedAt ?? null,
      completedByOperatorLabel: current?.completedByOperatorLabel ?? null
    };
  });
}

function syncMockResolutionState(item: ProviderWebhookUnmatchedInboundItem) {
  ensureMockResolutionState(item);
  item.checklistTotalCount = item.closureChecklist.length;
  item.checklistCompletedCount = item.closureChecklist.filter((step) => step.completed).length;
  item.checklistIncompleteSteps = item.closureChecklist.filter((step) => !step.completed).map((step) => step.step);
  item.resolutionStatus = item.resolutionOutcome ? "resolved" : "unresolved";
  item.closureReadiness = mockClosureReadinessForItem(item);
  item.recommendedNextActions = mockRecommendedNextActionsForItem(item);
  item.externalCalls = 0;
  return item;
}

function mockClosureReadinessForItem(item: ProviderWebhookUnmatchedInboundItem) {
  if (item.unmatchedStatus === "blocked" || item.resolutionOutcome === "BLOCKED_UNSAFE" || item.resolutionOutcome === "ROUTING_FAILED") return "BLOCKED";
  if (item.reviewStatus !== "pending" || (item.unmatchedStatus !== "open" && item.unmatchedStatus !== "review-needed")) return "ALREADY_REVIEWED";
  if (!item.resolutionOutcome) return "NOT_READY";
  if (item.checklistIncompleteSteps.length > 0) return "NOT_READY";
  if (item.resolutionOutcome === "SKIPPED_DUPLICATE" || item.resolutionOutcome === "SKIPPED_SPAM" || item.resolutionOutcome === "SKIPPED_UNSUPPORTED_EVENT") return "READY_FOR_SKIP";
  if (item.resolutionOutcome === "REVIEWED_SAFE_MATCH" || item.resolutionOutcome === "LINKED_EXISTING_CONVERSATION") return "READY_FOR_LINK";
  if (item.resolutionOutcome === "LINKED_AND_PERSISTED_SAFE_MESSAGE") return "READY_FOR_LINK_AND_PERSIST";
  return "READY_FOR_REVIEW";
}

function mockRecommendedNextActionsForItem(item: ProviderWebhookUnmatchedInboundItem): ProviderWebhookReviewRecommendedNextAction[] {
  if (item.closureReadiness === "ALREADY_REVIEWED") return ["VIEW_HISTORY", "OPEN_DIAGNOSTICS"];
  if (item.closureReadiness === "BLOCKED") return item.escalationStatus === "escalated"
    ? ["VIEW_HISTORY", "ADD_OPERATOR_NOTE", "CLEAR_ESCALATION"]
    : ["OPEN_DIAGNOSTICS", "ADD_OPERATOR_NOTE", "ESCALATE"];
  const incomplete = new Set(item.checklistIncompleteSteps);
  const actions: ProviderWebhookReviewRecommendedNextAction[] = [];
  if (incomplete.has("VIEWED_DIAGNOSTICS")) actions.push("OPEN_DIAGNOSTICS");
  if (incomplete.has("REVIEWED_HISTORY")) actions.push("VIEW_HISTORY");
  if (incomplete.has("REVIEWED_CANDIDATES") && isMockLinkableUnmatchedItem(item)) actions.push("RUN_CANDIDATE_LOOKUP");
  if (incomplete.has("CONFIRMED_OPERATOR_NOTE")) actions.push("ADD_OPERATOR_NOTE");
  if (incomplete.has("CONFIRMED_ASSIGNMENT_OR_ESCALATION") && item.assignmentStatus === "unassigned") actions.push("ASSIGN_OWNER");
  if (item.escalationStatus === "escalated") actions.push("CLEAR_ESCALATION");
  if (!item.resolutionOutcome) actions.push("MARK_REVIEWED");
  if (item.closureReadiness === "READY_FOR_REVIEW") actions.push("MARK_REVIEWED");
  if (item.closureReadiness === "READY_FOR_SKIP") actions.push("SKIP");
  if (item.closureReadiness === "READY_FOR_LINK") actions.push("LINK_ONLY");
  if (item.closureReadiness === "READY_FOR_LINK_AND_PERSIST") actions.push("LINK_AND_PERSIST_SAFE_MESSAGE");
  return Array.from(new Set(actions)).slice(0, 8);
}

function applyMockResolution(item: ProviderWebhookUnmatchedInboundItem, payload: ProviderWebhookUnmatchedInboundResolutionRequest) {
  const nowIso = new Date().toISOString();
  if (payload.operation === "CLEAR_RESOLUTION") {
    item.resolutionStatus = "unresolved";
    item.resolutionOutcome = null;
    item.resolvedAt = null;
    item.resolvedByOperatorLabel = null;
  } else {
    item.resolutionStatus = "resolved";
    item.resolutionOutcome = payload.resolutionOutcome ?? "NEEDS_REVIEW";
    item.resolvedAt = nowIso;
    item.resolvedByOperatorLabel = "operator:current";
  }
  item.lastOperatorNoteAt = payload.note ? nowIso : item.lastOperatorNoteAt;
  syncMockResolutionState(item);
}

function applyMockChecklist(item: ProviderWebhookUnmatchedInboundItem, payload: ProviderWebhookUnmatchedInboundResolutionChecklistRequest) {
  const nowIso = new Date().toISOString();
  ensureMockResolutionState(item);
  if (payload.operation === "RESET_CHECKLIST") {
    item.closureChecklist = defaultMockClosureChecklist();
  } else {
    const target = item.closureChecklist.find((step) => step.step === payload.step);
    if (!target) throw new Error("Safe checklist step is required");
    target.completed = payload.operation === "COMPLETE_STEP";
    target.completedAt = target.completed ? nowIso : null;
    target.completedByOperatorLabel = target.completed ? "operator:current" : null;
  }
  syncMockResolutionState(item);
}

function mockResolutionFingerprint(item: ProviderWebhookUnmatchedInboundItem) {
  syncMockResolutionState(item);
  return [
    item.resolutionStatus,
    item.resolutionOutcome ?? "",
    item.resolvedAt ?? "",
    item.closureReadiness,
    item.closureChecklist.map((step) => `${step.step}:${step.completed ? "1" : "0"}`).join(",")
  ].join("|");
}

function mockRowsToCsv(rows: ProviderWebhookUnmatchedInboundExport["rows"]) {
  const columns: (keyof ProviderWebhookUnmatchedInboundExport["rows"][number])[] = ["id", "provider", "channelAccountId", "safeRoomLabel", "roomKeyDigest", "eventType", "reviewStatus", "linkStatus", "unmatchedStatus", "receivedAt", "reviewedAt", "linkedConversationId", "candidateCount", "safeMessagePreview", "safeReason", "safeResultSummary", "assignmentStatus", "assignedToOperatorLabel", "assignedAt", "escalationStatus", "escalationReason", "escalatedAt", "resolutionStatus", "resolutionOutcome", "closureReadiness", "checklistCompletedCount", "checklistTotalCount", "externalCalls"];
  return [
    columns.join(","),
    ...rows.map((row) => columns.map((column) => mockCsvCell(row[column])).join(","))
  ].join("\n");
}

function applyMockAssignment(
  item: ProviderWebhookUnmatchedInboundItem,
  payload: ProviderWebhookUnmatchedInboundAssignmentRequest | ProviderWebhookUnmatchedInboundBulkAssignmentRequest
) {
  const nowIso = new Date().toISOString();
  if (payload.operation === "UNASSIGN") {
    item.assignmentStatus = "unassigned";
    item.assignedToOperatorLabel = null;
    item.assignedAt = null;
    item.assignedByOperatorLabel = "operator:current";
  } else {
    item.assignmentStatus = "assigned";
    item.assignedToOperatorLabel = payload.operation === "ASSIGN_TO_ME" ? "operator:current" : safeMockText(payload.assignedToOperatorLabel) ?? "operator:queue-lead";
    item.assignedAt = nowIso;
    item.assignedByOperatorLabel = "operator:current";
  }
  item.lastOperatorNoteAt = payload.note ? nowIso : item.lastOperatorNoteAt;
  item.externalCalls = 0;
}

function applyMockEscalation(
  item: ProviderWebhookUnmatchedInboundItem,
  payload: ProviderWebhookUnmatchedInboundEscalationRequest | ProviderWebhookUnmatchedInboundBulkEscalationRequest
) {
  const nowIso = new Date().toISOString();
  if (payload.operation === "CLEAR_ESCALATION") {
    item.escalationStatus = "none";
    item.escalationReason = null;
    item.escalatedAt = null;
    item.escalatedByOperatorLabel = "operator:current";
  } else {
    item.escalationStatus = "escalated";
    item.escalationReason = payload.escalationReason ?? "MANUAL_REVIEW_BLOCKED";
    item.escalatedAt = nowIso;
    item.escalatedByOperatorLabel = "operator:current";
  }
  item.lastOperatorNoteAt = payload.note ? nowIso : item.lastOperatorNoteAt;
  item.externalCalls = 0;
}

function mockBulkMetadataSummary(
  requestedCount: number,
  dedupedCount: number,
  results: ProviderWebhookUnmatchedInboundBulkAssignmentResponse["results"] | ProviderWebhookUnmatchedInboundBulkEscalationResponse["results"]
) {
  return {
    requestedCount,
    dedupedCount,
    successCount: results.filter((result) => result.ok).length,
    errorCount: results.filter((result) => !result.ok).length,
    updatedCount: results.filter((result) => result.resultStatus === "updated").length,
    alreadyAppliedCount: results.filter((result) => result.resultStatus === "already-applied").length
  };
}

function mockBulkResolutionSummary(
  requestedCount: number,
  dedupedCount: number,
  results: ProviderWebhookUnmatchedInboundBulkResolutionResponse["results"]
) {
  return {
    requestedCount,
    dedupedCount,
    successCount: results.filter((result) => result.ok).length,
    errorCount: results.filter((result) => !result.ok).length,
    updatedCount: results.filter((result) => result.resultStatus === "updated").length,
    alreadyAppliedCount: results.filter((result) => result.resultStatus === "already-applied").length
  };
}

function mockCsvCell(value: ProviderWebhookUnmatchedInboundExport["rows"][number][keyof ProviderWebhookUnmatchedInboundExport["rows"][number]]) {
  if (value === null || value === undefined) return "";
  return `"${String(value).replace(/"/g, "\"\"")}"`;
}

function refreshMockUnmatchedCounts() {
  mockProviderWebhookUnmatchedInbound.forEach(syncMockResolutionState);
  const summary = summarizeMockUnmatchedInbound(mockProviderWebhookUnmatchedInbound);
  mockProviderReadiness.unmatchedInboundOpenCount = summary.openCount;
  mockProviderReadiness.unmatchedInboundStaleOpenCount = mockProviderWebhookUnmatchedInbound.filter(isMockStaleOpenUnmatchedItem).length;
  mockProviderReadiness.reviewAlertCriticalCount = createMockReviewAlerts({}).criticalCount;
  mockProviderReadiness.criticalTriageCount = createMockReviewTriage({}).topItems.filter((item) => item.severity === "critical").length;
  mockProviderReadiness.openTriageCount = createMockReviewTriage({}).totalOpenItems;
  mockProviderReadiness.unmatchedInboundReviewedCount = summary.reviewedCount;
  mockProviderReadiness.unmatchedInboundSkippedCount = summary.skippedCount;
  mockProviderReadiness.unmatchedInboundLinkedCount = summary.linkedCount;
  mockProviderReadiness.savedViewCount = mockProviderWebhookReviewSavedViews.filter((view) => !view.archived).length;
  mockProviderReadiness.operatorNoteCount = mockProviderWebhookOperatorNotes.length;
  mockProviderReadiness.unassignedOpenCount = mockProviderWebhookUnmatchedInbound.filter((item) =>
    (item.unmatchedStatus === "open" || item.unmatchedStatus === "review-needed") && item.assignmentStatus === "unassigned"
  ).length;
  mockProviderReadiness.assignedOpenCount = mockProviderWebhookUnmatchedInbound.filter((item) =>
    (item.unmatchedStatus === "open" || item.unmatchedStatus === "review-needed") && item.assignmentStatus === "assigned"
  ).length;
  mockProviderReadiness.escalatedOpenCount = mockProviderWebhookUnmatchedInbound.filter((item) =>
    (item.unmatchedStatus === "open" || item.unmatchedStatus === "review-needed") && item.escalationStatus === "escalated"
  ).length;
  const openItems = mockProviderWebhookUnmatchedInbound.filter((item) => item.unmatchedStatus === "open" || item.unmatchedStatus === "review-needed");
  mockProviderReadiness.unresolvedOpenCount = openItems.filter((item) => item.resolutionStatus === "unresolved").length;
  mockProviderReadiness.readyForClosureCount = openItems.filter((item) => item.closureReadiness === "READY_FOR_REVIEW" || item.closureReadiness === "READY_FOR_SKIP" || item.closureReadiness === "READY_FOR_LINK" || item.closureReadiness === "READY_FOR_LINK_AND_PERSIST").length;
  mockProviderReadiness.blockedResolutionCount = openItems.filter((item) => item.closureReadiness === "BLOCKED").length;
  mockProviderReadiness.checklistIncompleteOpenCount = openItems.filter((item) => item.checklistCompletedCount < item.checklistTotalCount).length;
  const closureReport = createMockReviewClosureReport({});
  mockProviderReadiness.closureEvidenceReadyCount = closureReport.evidenceReadyCount;
  mockProviderReadiness.closureEvidenceBlockedCount = closureReport.evidenceBlockedCount;
  mockProviderReadiness.closureEvidenceIncompleteCount = closureReport.evidenceIncompleteCount;
  mockProviderReadiness.closureEvidenceExportCount = mockProviderWebhookUnmatchedInbound.length;
  mockProviderReadiness.closureReportExportCount = mockProviderWebhookUnmatchedInbound.length > 0 ? 1 : 0;
}

export const mockProviderReadiness: ProviderReadiness = {
  mode: "disabled",
  outboundEnabledByEnv: false,
  sandboxMode: "disabled",
  sandboxEnabled: false,
  channelMode: "mock",
  metaChannelMode: "mock",
  realOutboundEnabled: false,
  allowlistCount: 0,
  allowlist: {
    configured: false,
    entryCount: 0
  },
  webhookSignatureVerificationConfigured: true,
  webhookSignatureVerificationReady: true,
  replayGuardrailsEnabled: true,
  lastSandboxEventSignatureStatus: "verified",
  latestReplayStatus: "fresh",
  replayDetectedCount: 0,
  webhookNormalizationEnabled: true,
  webhookDryRunRoutingEnabled: true,
  lastSandboxEventNormalizationStatus: "normalized",
  latestRoutingStatus: "dry-run-only",
  normalizedEventCount: 1,
  routingBlockedCount: 0,
  webhookInboundPersistenceEnabled: true,
  latestInboundPersistenceStatus: "dry-run-only",
  persistedInboundMessageCount: 0,
  inboundPersistenceBlockedCount: 0,
  inboundPersistenceReplayBlockedCount: 0,
  inboundPersistenceSkippedNoMatchCount: 0,
  webhookUnmatchedInboundReviewEnabled: true,
  webhookUnmatchedReviewActionsEnabled: true,
  webhookCandidateLookupEnabled: true,
  webhookUnmatchedHistoryEnabled: true,
  webhookUnmatchedQueueExportEnabled: true,
  webhookUnmatchedQueueExportMaxLimit: 500,
  webhookReviewMetricsEnabled: true,
  webhookDiagnosticsEnabled: true,
  webhookReviewAlertsEnabled: true,
  webhookReviewQueueHealthEnabled: true,
  reviewTriageEnabled: true,
  triageGuidanceEnabled: true,
  reviewSavedViewsEnabled: true,
  operatorNotesEnabled: true,
  reviewAssignmentEnabled: true,
  reviewEscalationEnabled: true,
  assignmentWorkloadEnabled: true,
  reviewResolutionEnabled: true,
  reviewClosureChecklistEnabled: true,
  resolutionSummaryEnabled: true,
  reviewClosureEvidenceEnabled: true,
  reviewClosureReportEnabled: true,
  reviewClosureEvidenceExportEnabled: true,
  reviewClosureReportExportEnabled: true,
  savedViewCount: 1,
  operatorNoteCount: 0,
  unassignedOpenCount: 1,
  assignedOpenCount: 0,
  escalatedOpenCount: 0,
  unresolvedOpenCount: 1,
  readyForClosureCount: 0,
  blockedResolutionCount: 0,
  checklistIncompleteOpenCount: 1,
  closureEvidenceReadyCount: 0,
  closureEvidenceBlockedCount: 0,
  closureEvidenceIncompleteCount: 1,
  closureEvidenceExportCount: 1,
  closureReportExportCount: 1,
  reviewAlertCriticalCount: 1,
  criticalTriageCount: 1,
  openTriageCount: 1,
  unmatchedInboundOpenCount: 1,
  unmatchedInboundStaleOpenCount: 1,
  unmatchedInboundQueuedCount: 1,
  unmatchedInboundReplayBlockedCount: 0,
  unmatchedInboundReviewedCount: 0,
  unmatchedInboundSkippedCount: 0,
  unmatchedInboundLinkedCount: 0,
  latestUnmatchedInboundStatus: "review-needed",
  latestUnmatchedReviewActionStatus: null,
  latestUnmatchedLinkStatus: null,
  lastSandboxEventAt: now,
  externalCalls: 0,
  providers: [
    provider("line", false, false, 0),
    provider("telegram", false, false, 0),
    provider("facebook", false, false, 0),
    provider("instagram", false, false, 0)
  ]
};

export let mockProviderWebhookEvents: ProviderWebhookEvent[] = [
  {
    id: "provider-webhook-event-local-1",
    tenantId: "00000000-0000-4000-8000-000000000001",
    provider: "line",
    channel: "line",
    eventType: "message.created",
    mode: "dry_run",
    status: "received",
    receivedAt: now,
    payloadSummary: "Dry-run object payload accepted with 2 safe fields.",
    payloadFieldCount: 2,
    payloadDigest: "sha256:localdryrunsample",
    signatureVerified: true,
    signatureStatus: "verified",
    signatureAlgorithm: "hmac-sha256",
    signatureFingerprint: "sha256:localsignature",
    signedAt: now,
    replayDetected: false,
    replayStatus: "fresh",
    dedupKeyDigest: "sha256:localdedupsample",
    previousEventSeenAt: null,
    normalized: true,
    normalizationStatus: "normalized",
    normalizedEventType: "message",
    direction: "inbound",
    messageType: "text",
    textPreview: "Local dry-run message",
    textLength: 21,
    mediaSummary: null,
    senderKeyDigest: "sha256:localsenderdigest",
    roomKeyDigest: "sha256:localroomdigest",
    dryRunRouting: true,
    routingStatus: "dry-run-only",
    conversationLookupStatus: "not-found",
    conversationKeyDigest: "sha256:localconversationdigest",
    channelAccountId: "sandbox:line",
    roomIdDigest: "sha256:localroomiddigest",
    inboundPersistenceMode: "dry-run",
    inboundPersistenceStatus: "dry-run-only",
    messagePersisted: false,
    persistedMessageId: null,
    conversationId: null,
    unmatchedInboundQueued: true,
    unmatchedInboundId: "provider-webhook-unmatched-local-1",
    unmatchedStatus: "review-needed",
    unmatchedReason: "safe-review-required-no-conversation-match",
    unmatchedReviewActionStatus: "none",
    unmatchedLinkStatus: "none",
    linkedConversationId: null,
    linkedMessageId: null,
    unmatchedResolvedAt: null,
    inboundAuditStatus: "recorded",
    externalCalls: 0
  }
];

export let mockProviderWebhookUnmatchedInbound: ProviderWebhookUnmatchedInboundItem[] = [
  {
    id: "provider-webhook-unmatched-local-1",
    tenantId: "00000000-0000-4000-8000-000000000001",
    provider: "line",
    channelAccountId: "sandbox:line",
    mode: "sandbox",
    eventType: "message.created",
    normalizedEventType: "message",
    messageType: "text",
    normalizationStatus: "normalized",
    routingStatus: "dry-run-only",
    conversationLookupStatus: "not-found",
    unmatchedStatus: "review-needed",
    unmatchedReason: "safe-review-required-no-conversation-match",
    reviewStatus: "pending",
    reviewedAt: null,
    reviewedBy: null,
    reviewReason: null,
    linkStatus: "none",
    linkedConversationId: null,
    linkedMessageId: null,
    unmatchedResolvedAt: null,
    messagePersisted: false,
    assignmentStatus: "unassigned",
    assignedToOperatorLabel: null,
    assignedAt: null,
    assignedByOperatorLabel: null,
    escalationStatus: "none",
    escalationReason: null,
    escalatedAt: null,
    escalatedByOperatorLabel: null,
    resolutionStatus: "unresolved",
    resolutionOutcome: null,
    resolvedAt: null,
    resolvedByOperatorLabel: null,
    closureReadiness: "NOT_READY",
    closureChecklist: defaultMockClosureChecklist(),
    checklistCompletedCount: 0,
    checklistTotalCount: mockClosureChecklistSteps.length,
    checklistIncompleteSteps: [...mockClosureChecklistSteps],
    recommendedNextActions: ["OPEN_DIAGNOSTICS", "VIEW_HISTORY", "RUN_CANDIDATE_LOOKUP", "ADD_OPERATOR_NOTE", "ASSIGN_OWNER"],
    lastOperatorNoteAt: null,
    historyAvailable: true,
    diagnosticsAvailable: true,
    candidatesAvailable: true,
    payloadDigest: "sha256:localdryrunsample",
    providerEventDigest: "sha256:localdedupsample",
    deliveryDigest: "sha256:localdedupsample",
    senderKeyDigest: "sha256:localsenderdigest",
    roomKeyDigest: "sha256:localroomdigest",
    textPreview: "Local dry-run message",
    textLength: 21,
    receivedAt: now,
    externalCalls: 0
  }
];

export let mockProviderWebhookReviewSavedViews: ProviderWebhookReviewSavedView[] = [
  {
    id: "provider-webhook-review-view-local-1",
    name: "LINE pending manual review",
    description: "Pinned safe local review view",
    tenantId: "mock-tenant",
    ownerId: "system",
    createdBy: "system",
    filters: {
      provider: "line",
      reviewStatus: "pending",
      linkStatus: "none",
      unmatchedStatus: "review-needed",
      eventType: "message.created",
      triageLane: "safe_link_candidate_available",
      resolutionStatus: "unresolved",
      closureReadiness: "NOT_READY",
      checklistIncomplete: true,
      pageSize: 10
    },
    sort: {
      sortBy: "receivedAt",
      sortDirection: "desc"
    },
    pinned: true,
    isDefault: true,
    archived: false,
    createdAt: now,
    updatedAt: now,
    externalCalls: 0
  }
];

export let mockProviderWebhookOperatorNotes: ProviderWebhookOperatorNote[] = [];

export const mockProviderWebhookCandidatesByUnmatchedId: Record<string, ProviderWebhookCandidateConversation[]> = {
  "provider-webhook-unmatched-local-1": [
    {
      conversationId: "conversation-local-safe-1",
      platform: "line",
      channelAccountId: "sandbox:line",
      roomIdDigest: "sha256:localroomdigest",
      safeRoomLabel: "line conversation digest match",
      latestMessagePreview: "Local safe candidate preview",
      latestMessageAt: now,
      matchReason: "platform, channel account, and room digest match",
      matchConfidence: 0.98,
      externalCalls: 0
    }
  ]
};

const mockWebhookDedupSeenAt = new Map<string, string>([["sha256:localdedupsample", now]]);

function provider(
  name: ProviderReadiness["providers"][number]["name"],
  configured: boolean,
  webhookConfigured: boolean,
  _allowlistCount: number
): ProviderReadiness["providers"][number] {
  return {
    name,
    configured,
    credentialStatus: configured ? "configured" : "not_configured",
    webhookStatus: webhookConfigured ? "configured" : "not_configured",
    webhookVerificationReady: webhookConfigured,
    webhookVerificationConfigured: webhookConfigured,
    outboundEnabled: false,
    status: "disabled_by_default"
  };
}

function createMockProviderWebhookEvent(payload: ProviderWebhookSandboxEventRequest): ProviderWebhookEvent {
  const providerName = payload.provider;
  const dedupKeyDigest = payload.eventId || payload.deliveryId
    ? `sha256:${safeDigest(["mock", providerName, payload.channel ?? providerName, payload.eventId ?? payload.deliveryId].join(":"))}`
    : null;
  const previousEventSeenAt = dedupKeyDigest ? mockWebhookDedupSeenAt.get(dedupKeyDigest) ?? null : null;
  const receivedAt = new Date().toISOString();
  if (dedupKeyDigest && !previousEventSeenAt) {
    mockWebhookDedupSeenAt.set(dedupKeyDigest, receivedAt);
  }
  const signatureStatus = payload.signature ? "verified" : "missing";
  const normalized = signatureStatus === "verified" && !previousEventSeenAt;
  const routingBlocked = signatureStatus !== "verified" || Boolean(previousEventSeenAt);
  const unmatchedInboundQueued = normalized && !routingBlocked;
  const unmatchedStatus = previousEventSeenAt ? "duplicate-skipped" : signatureStatus !== "verified" ? "blocked" : unmatchedInboundQueued ? "review-needed" : null;
  return {
    id: `provider-webhook-event-local-${safeId()}`,
    tenantId: "00000000-0000-4000-8000-000000000001",
    provider: providerName,
    channel: payload.channel ?? providerName,
    eventType: payload.eventType,
    mode: payload.mode ?? "dry_run",
    status: payload.status ?? "received",
    receivedAt,
    payloadSummary: "Dry-run object payload accepted with 2 safe fields.",
    payloadFieldCount: 2,
    payloadDigest: `sha256:${safeId().slice(0, 16)}`,
    signatureVerified: signatureStatus === "verified",
    signatureStatus,
    signatureAlgorithm: "hmac-sha256",
    signatureFingerprint: payload.signature ? `sha256:${safeDigest(`signature:${payload.signature}`)}` : null,
    signedAt: payload.timestamp ?? null,
    replayDetected: Boolean(previousEventSeenAt),
    replayStatus: previousEventSeenAt ? "duplicate" : "fresh",
    dedupKeyDigest,
    previousEventSeenAt,
    normalized,
    normalizationStatus: signatureStatus !== "verified" ? "skipped" : previousEventSeenAt ? "blocked-replay" : "normalized",
    normalizedEventType: normalized ? "message" : "unknown",
    direction: "inbound",
    messageType: normalized ? "text" : "unknown",
    textPreview: normalized ? "Local dry-run message" : null,
    textLength: normalized ? 21 : null,
    mediaSummary: null,
    senderKeyDigest: normalized ? `sha256:${safeDigest(`sender:${providerName}`)}` : null,
    roomKeyDigest: normalized ? `sha256:${safeDigest(`room:${providerName}`)}` : null,
    dryRunRouting: normalized,
    routingStatus: signatureStatus !== "verified" ? "skipped" : previousEventSeenAt ? "blocked-replay" : "dry-run-only",
    conversationLookupStatus: routingBlocked ? "skipped" : "not-found",
    conversationKeyDigest: normalized ? `sha256:${safeDigest(`conversation:${providerName}`)}` : null,
    channelAccountId: normalized ? `sandbox:${payload.channel ?? providerName}` : null,
    roomIdDigest: normalized ? `sha256:${safeDigest(`room-id:${providerName}`)}` : null,
    inboundPersistenceMode: payload.inboundPersistenceMode ?? "dry-run",
    inboundPersistenceStatus: payload.inboundPersistenceMode === "sandbox-persist"
      ? normalized && !routingBlocked ? "skipped-no-match" : previousEventSeenAt ? "blocked-replay" : signatureStatus === "verified" ? "skipped" : "blocked-signature"
      : "dry-run-only",
    messagePersisted: false,
    persistedMessageId: null,
    conversationId: null,
    unmatchedInboundQueued,
    unmatchedInboundId: unmatchedInboundQueued ? `provider-webhook-unmatched-local-${safeId()}` : previousEventSeenAt ? "provider-webhook-unmatched-local-1" : null,
    unmatchedStatus,
    unmatchedReason: previousEventSeenAt ? "blocked-replay" : signatureStatus !== "verified" ? "blocked-signature" : unmatchedInboundQueued ? "safe-review-required-no-conversation-match" : null,
    unmatchedReviewActionStatus: "none",
    unmatchedLinkStatus: "none",
    linkedConversationId: null,
    linkedMessageId: null,
    unmatchedResolvedAt: null,
    inboundAuditStatus: "recorded",
    externalCalls: 0
  };
}

function safeId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function safeDigest(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash).toString(16).padStart(8, "0").slice(0, 16);
}

function safeMockReason(value: string | undefined) {
  const trimmed = value?.replace(/\s+/g, " ").trim();
  if (!trimmed || /token|secret|authorization|cookie|replyToken|Bearer\s+/i.test(trimmed)) return null;
  return trimmed.length > 120 ? `${trimmed.slice(0, 117)}...` : trimmed;
}

function safeMockText(value: string | null | undefined) {
  const trimmed = value?.replace(/\s+/g, " ").trim();
  if (!trimmed || /token|secret|authorization|cookie|replyToken|Bearer\s+/i.test(trimmed)) return null;
  return trimmed.length > 160 ? `${trimmed.slice(0, 157)}...` : trimmed;
}
