import { apiRequest, type ApiResponse } from "./client";
import type {
  ApiEnvelope,
  AdminCampaignQueueResponse,
  AdminCampaignQueueItem,
  CampaignReviewPayload,
  CampaignMatchResponse,
  AssignCampaignPayload,
  CampaignAssignmentsResponse,
  CampaignActivatePayload,
  Campaign360OverviewResponse,
  CampaignPerformanceResponse,
  PartnerCampaignPerformanceResponse,
  CampaignEvaluationResponse,
  CampaignPerformancePolicy,
  CampaignPipPayload,
  AdminPartnerLeaderboardItem,
  AdminPayoutApprovalPayload,
  CampaignConfigVersionDTO,
  CommercialValidationEvent,
  FraudAnomalyFlag,
} from "@/lib/types";
import {
  MOCK_300_PARTNERS,
  MOCK_PAYOUT_APPROVAL_PAYLOAD,
  MOCK_SCORING_CONFIG_VERSIONS,
  MOCK_COMMERCIAL_VALIDATION_EVENTS,
  MOCK_FRAUD_ANOMALY_FLAGS,
  MOCK_CAMPAIGN_QUEUE,
} from "@/lib/mock/admin-campaigns.mock";
import { MOCK_FALLBACKS_ENABLED } from "@/lib/mock/config";
import { logger } from "@/lib/logger";


// ─── Admin Campaigns Pipeline ─────────────────────────────────────────────────

export async function getCampaignQueue(params?: {
  page?: number;
  limit?: number;
}): Promise<ApiResponse<ApiEnvelope<AdminCampaignQueueResponse>>> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  query.set("limit", String(params?.limit ?? 50));
  // NOTE: backend does not accept status filter — filtering is done client-side

  const res = await apiRequest<ApiEnvelope<AdminCampaignQueueResponse>>(
    `/admin/campaigns/queue?${query.toString()}`,
    { silent404: true, silent: MOCK_FALLBACKS_ENABLED }
  );

  const fallback = withDevMockFallback(
    res,
    Boolean(res.ok && res.data?.data && (res.data.data.queue?.length || res.data.data.campaigns?.length)),
    "Campaign queue",
    () => ({
      queue: MOCK_CAMPAIGN_QUEUE,
      campaigns: MOCK_CAMPAIGN_QUEUE,
      pagination: {
        currentPage: params?.page ?? 1,
        nextPage: null,
        prevPage: null,
        hasNext: false,
        hasPrev: false,
        totalPages: 1,
        totalRecords: MOCK_CAMPAIGN_QUEUE.length,
      },
    })
  );

  // Normalise: always expose campaigns array regardless of which key the API used
  if (fallback.data?.data) {
    const list = fallback.data.data.queue ?? fallback.data.data.campaigns ?? [];
    fallback.data.data.campaigns = list;
    fallback.data.data.queue = list;
  }

  return fallback;
}

export async function reviewCampaign(
  campaignId: string,
  payload: CampaignReviewPayload
): Promise<ApiResponse<ApiEnvelope<AdminCampaignQueueItem>>> {
  return apiRequest<ApiEnvelope<AdminCampaignQueueItem>>(
    `/admin/campaigns/${campaignId}/review`,
    { method: "PATCH", body: payload }
  );
}

export async function getCampaignMaterials(
  campaignId: string
): Promise<ApiResponse<ApiEnvelope<{ materials?: unknown[]; shares?: unknown[] }>>> {
  return apiRequest<ApiEnvelope<{ materials?: unknown[]; shares?: unknown[] }>>(
    `/admin/campaigns/${encodeURIComponent(campaignId)}/materials`,
    { silent404: true }
  );
}

/** Appends `?query` to a path only when the query string is non-empty. */
function withQuery(path: string, query: URLSearchParams): string {
  const qs = query.toString();
  return qs ? `${path}?${qs}` : path;
}

export async function getCampaignMatches(
  campaignId: string,
  params?: { minMatchScore?: number; limit?: number }
): Promise<ApiResponse<ApiEnvelope<CampaignMatchResponse>>> {
  const query = new URLSearchParams();
  if (params?.minMatchScore !== undefined) query.set("minMatchScore", String(params.minMatchScore));
  if (params?.limit) query.set("limit", String(params.limit));

  const endpoint = withQuery(`/admin/campaigns/${campaignId}/match`, query);

  return apiRequest<ApiEnvelope<CampaignMatchResponse>>(endpoint);
}

export async function assignCampaignPartners(
  campaignId: string,
  payload: AssignCampaignPayload
): Promise<ApiResponse<ApiEnvelope<{ success: boolean; assignedCount: number }>>> {
  return apiRequest<ApiEnvelope<{ success: boolean; assignedCount: number }>>(
    `/admin/campaigns/${campaignId}/assign`,
    { method: "POST", body: payload }
  );
}

export async function getCampaignAssignments(
  campaignId: string,
  params?: { status?: string; page?: number; limit?: number }
): Promise<ApiResponse<ApiEnvelope<CampaignAssignmentsResponse>>> {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));

  const endpoint = withQuery(`/admin/campaigns/${campaignId}/assignments`, query);

  return apiRequest<ApiEnvelope<CampaignAssignmentsResponse>>(endpoint);
}

export async function activateCampaign(
  campaignId: string,
  payload?: CampaignActivatePayload
): Promise<ApiResponse<ApiEnvelope<{ success: boolean; campaign: AdminCampaignQueueItem }>>> {
  const body = payload ?? { generateTrackingLinks: true, notifyPartners: true };
  return apiRequest<ApiEnvelope<{ success: boolean; campaign: AdminCampaignQueueItem }>>(
    `/admin/campaigns/${campaignId}/activate`,
    { method: "PATCH", body }
  );
}

export async function getCampaign360Overview(params?: {
  period?: string;
  status?: string;
}): Promise<ApiResponse<ApiEnvelope<Campaign360OverviewResponse>>> {
  const query = new URLSearchParams();
  if (params?.period) query.set("period", params.period);
  if (params?.status) query.set("status", params.status);

  const endpoint = withQuery("/admin/campaigns/overview/360", query);

  return apiRequest<ApiEnvelope<Campaign360OverviewResponse>>(endpoint);
}

export async function getCampaignPerformance(
  campaignId: string,
  params?: { period?: string; breakdown?: string }
): Promise<ApiResponse<ApiEnvelope<CampaignPerformanceResponse>>> {
  const query = new URLSearchParams();
  if (params?.period) query.set("period", params.period);
  if (params?.breakdown) query.set("breakdown", params.breakdown);

  const endpoint = withQuery(`/admin/campaigns/${campaignId}/performance`, query);

  return apiRequest<ApiEnvelope<CampaignPerformanceResponse>>(endpoint);
}

export async function evaluateCampaignPerformance(
  campaignId: string
): Promise<ApiResponse<ApiEnvelope<CampaignEvaluationResponse>>> {
  if (MOCK_FALLBACKS_ENABLED && campaignId.startsWith("cmp_")) {
    return {
      ok: true,
      status: 200,
      error: null,
      data: {
        error: false,
        message: "[MOCK] Live SLA evaluation completed",
        data: {
          evaluation: {
            passed: true,
            currentMetrics: { avgCr: 2.8, avgCpa: 58 },
            thresholds: { minCr: 2.0, maxCpa: 70 },
            flags: [],
            recommendedAction: "continue_monitoring",
          },
        },
      },
    };
  }

  return apiRequest<ApiEnvelope<CampaignEvaluationResponse>>(
    `/admin/campaigns/${campaignId}/performance/evaluate`,
    { method: "POST", silent: MOCK_FALLBACKS_ENABLED }
  );
}

export async function getCampaignPerformancePolicy(
  campaignId: string
): Promise<ApiResponse<ApiEnvelope<{ policy: CampaignPerformancePolicy }>>> {
  if (MOCK_FALLBACKS_ENABLED && campaignId.startsWith("cmp_")) {
    return {
      ok: true,
      status: 200,
      error: null,
      data: {
        error: false,
        message: "[MOCK] Campaign policy",
        data: {
          policy: {
            campaignId,
            minConversionRate: 2.0,
            maxCpa: 70,
            minWeeklyConversions: 15,
            evaluationFrequencyDays: 7,
            autoPauseOnBreach: true,
            lastEvaluatedAt: new Date().toISOString(),
          },
        },
      },
    };
  }

  const res = await apiRequest<ApiEnvelope<{ policy: CampaignPerformancePolicy }>>(
    `/admin/campaigns/${campaignId}/performance/policy`,
    { silent404: true, silent: MOCK_FALLBACKS_ENABLED }
  );
  return withDevMockFallback(res, Boolean(res.ok && res.data?.data?.policy), "Campaign policy", () => ({
    policy: {
      campaignId,
      minConversionRate: 2.0,
      maxCpa: 70,
      minWeeklyConversions: 15,
      evaluationFrequencyDays: 7,
      autoPauseOnBreach: true,
      lastEvaluatedAt: new Date().toISOString(),
    },
  }));
}

export async function updateCampaignPerformancePolicy(
  campaignId: string,
  policy: CampaignPerformancePolicy
): Promise<ApiResponse<ApiEnvelope<{ policy: CampaignPerformancePolicy }>>> {
  if (MOCK_FALLBACKS_ENABLED && campaignId.startsWith("cmp_")) {
    return {
      ok: true,
      status: 200,
      error: null,
      data: {
        error: false,
        message: "[MOCK] Updated campaign performance policy",
        data: { policy },
      },
    };
  }

  return apiRequest<ApiEnvelope<{ policy: CampaignPerformancePolicy }>>(
    `/admin/campaigns/${campaignId}/performance/policy`,
    { method: "PUT", body: policy, silent: MOCK_FALLBACKS_ENABLED }
  );
}

export async function placeCampaignOnPip(
  campaignId: string,
  payload: CampaignPipPayload
): Promise<ApiResponse<ApiEnvelope<{ success: boolean; message: string }>>> {
  return apiRequest<ApiEnvelope<{ success: boolean; message: string }>>(
    `/admin/campaigns/${campaignId}/performance/pip`,
    { method: "POST", body: payload }
  );
}

export async function getPartnerCampaignPerformance(
  partnerUserId: string
): Promise<ApiResponse<ApiEnvelope<PartnerCampaignPerformanceResponse>>> {
  return apiRequest<ApiEnvelope<PartnerCampaignPerformanceResponse>>(
    `/admin/campaigns/partners/${partnerUserId}/performance`
  );
}

// ─── Dev-only mock fallback (read endpoints only) ────────────────────────────

/**
 * Returns the real response unless it is unusable AND mock fallbacks are
 * explicitly enabled for local development (see `lib/mock/config.ts`).
 * In production the real response — including errors — is always returned,
 * so the UI shows a proper error state instead of fixture data.
 */
function withDevMockFallback<T>(
  res: ApiResponse<ApiEnvelope<T>>,
  hasData: boolean,
  label: string,
  mock: () => T
): ApiResponse<ApiEnvelope<T>> {
  if (hasData || !MOCK_FALLBACKS_ENABLED) return res;
  logger.warn(`[Campaigns API] ${label} unavailable (${res.status}) — serving MOCK data (dev only)`);
  return {
    ok: true,
    status: 200,
    error: null,
    data: { error: false, message: `[MOCK] ${label}`, data: mock() },
  };
}

// ─── Partner Leaderboard API ──────────────────────────────────────────────────

export async function getPartnerLeaderboard(
  campaignId?: string
): Promise<ApiResponse<ApiEnvelope<{ partners: AdminPartnerLeaderboardItem[]; total: number }>>> {
  const query = campaignId ? `?campaignId=${encodeURIComponent(campaignId)}` : "";
  const res = await apiRequest<ApiEnvelope<{ partners: AdminPartnerLeaderboardItem[]; total: number }>>(
    `/admin/campaigns/leaderboard${query}`,
    { silent404: true, silent: MOCK_FALLBACKS_ENABLED }
  );
  return withDevMockFallback(res, Boolean(res.ok && res.data?.data?.partners), "Partner leaderboard", () => ({
    partners: MOCK_300_PARTNERS,
    total: MOCK_300_PARTNERS.length,
  }));
}

// ─── Commercial Validation Work Queue API ─────────────────────────────────────

export async function getValidationWorkQueue(params?: {
  status?: string;
  clientId?: string;
}): Promise<ApiResponse<ApiEnvelope<{ events: CommercialValidationEvent[]; total: number }>>> {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.clientId) query.set("clientId", params.clientId);

  const res = await apiRequest<ApiEnvelope<{ events: CommercialValidationEvent[]; total: number }>>(
    withQuery("/admin/campaigns/validation-queue", query),
    { silent404: true, silent: MOCK_FALLBACKS_ENABLED }
  );
  return withDevMockFallback(res, Boolean(res.ok && res.data?.data?.events), "Validation work queue", () => ({
    events: MOCK_COMMERCIAL_VALIDATION_EVENTS,
    total: MOCK_COMMERCIAL_VALIDATION_EVENTS.length,
  }));
}

// Mutations below return the real backend response. They must never fake
// success: a failed approve/reject/reverse/payout has to surface as an error.

export async function approveCommercialEvent(
  eventId: string
): Promise<ApiResponse<ApiEnvelope<{ success: boolean; eventId: string; status: "approved" }>>> {
  return apiRequest<ApiEnvelope<{ success: boolean; eventId: string; status: "approved" }>>(
    `/admin/campaigns/validation-queue/${eventId}/approve`,
    { method: "POST" }
  );
}

export async function rejectCommercialEvent(
  eventId: string,
  reason: string
): Promise<ApiResponse<ApiEnvelope<{ success: boolean; eventId: string; status: "rejected"; reason: string }>>> {
  return apiRequest<ApiEnvelope<{ success: boolean; eventId: string; status: "rejected"; reason: string }>>(
    `/admin/campaigns/validation-queue/${eventId}/reject`,
    { method: "POST", body: { reason } }
  );
}

export async function reverseCommercialEvent(
  eventId: string,
  reason: string
): Promise<ApiResponse<ApiEnvelope<{ success: boolean; eventId: string; status: "reversed"; reversalTxId: string }>>> {
  return apiRequest<ApiEnvelope<{ success: boolean; eventId: string; status: "reversed"; reversalTxId: string }>>(
    `/admin/campaigns/validation-queue/${eventId}/reverse`,
    { method: "POST", body: { reason } }
  );
}

// ─── Payout Approvals & Hamilton Normalization API ────────────────────────────

export async function getPayoutApprovalSummary(
  campaignId?: string
): Promise<ApiResponse<ApiEnvelope<{ payoutSummary: AdminPayoutApprovalPayload }>>> {
  const query = campaignId ? `?campaignId=${encodeURIComponent(campaignId)}` : "";
  const res = await apiRequest<ApiEnvelope<{ payoutSummary: AdminPayoutApprovalPayload }>>(
    `/admin/campaigns/payout-approval${query}`,
    { silent404: true, silent: MOCK_FALLBACKS_ENABLED }
  );
  return withDevMockFallback(res, Boolean(res.ok && res.data?.data?.payoutSummary), "Payout approval summary", () => ({
    payoutSummary: MOCK_PAYOUT_APPROVAL_PAYLOAD,
  }));
}

export async function approvePayoutBatch(
  campaignId: string
): Promise<ApiResponse<ApiEnvelope<{ success: boolean; campaignId: string; batchId: string }>>> {
  return apiRequest<ApiEnvelope<{ success: boolean; campaignId: string; batchId: string }>>(
    `/admin/campaigns/${campaignId}/payout-approval/execute`,
    { method: "POST" }
  );
}

// ─── Scoring Config & Audit Versioning API ────────────────────────────────────

export async function getCampaignScoringConfig(
  campaignId?: string
): Promise<ApiResponse<ApiEnvelope<{ activeConfig: CampaignConfigVersionDTO; history: CampaignConfigVersionDTO[] }>>> {
  const query = campaignId ? `?campaignId=${encodeURIComponent(campaignId)}` : "";
  const res = await apiRequest<ApiEnvelope<{ activeConfig: CampaignConfigVersionDTO; history: CampaignConfigVersionDTO[] }>>(
    `/admin/campaigns/scoring-config${query}`,
    { silent404: true, silent: MOCK_FALLBACKS_ENABLED }
  );
  return withDevMockFallback(res, Boolean(res.ok && res.data?.data?.activeConfig), "Scoring config", () => ({
    activeConfig: MOCK_SCORING_CONFIG_VERSIONS[0],
    history: MOCK_SCORING_CONFIG_VERSIONS,
  }));
}

export async function updateCampaignScoringConfig(
  config: CampaignConfigVersionDTO
): Promise<ApiResponse<ApiEnvelope<{ success: boolean; updatedConfig: CampaignConfigVersionDTO }>>> {
  return apiRequest<ApiEnvelope<{ success: boolean; updatedConfig: CampaignConfigVersionDTO }>>(
    `/admin/campaigns/scoring-config`,
    { method: "PUT", body: config }
  );
}

// ─── Fraud Anomaly Flags API ──────────────────────────────────────────────────

export async function getFraudAnomalyFlags(): Promise<
  ApiResponse<ApiEnvelope<{ flags: FraudAnomalyFlag[]; total: number }>>
> {
  const res = await apiRequest<ApiEnvelope<{ flags: FraudAnomalyFlag[]; total: number }>>(
    `/admin/campaigns/fraud-anomalies`,
    { silent404: true, silent: MOCK_FALLBACKS_ENABLED }
  );
  return withDevMockFallback(res, Boolean(res.ok && res.data?.data?.flags), "Fraud anomaly flags", () => ({
    flags: MOCK_FRAUD_ANOMALY_FLAGS,
    total: MOCK_FRAUD_ANOMALY_FLAGS.length,
  }));
}

export async function dispatchPipNotice(
  partnerId: string,
  payload: { reason: string; durationDays: number; targetMetrics: Record<string, number> }
): Promise<ApiResponse<ApiEnvelope<{ success: boolean; message: string }>>> {
  return apiRequest<ApiEnvelope<{ success: boolean; message: string }>>(
    `/admin/campaigns/partners/${partnerId}/pip-dispatch`,
    { method: "POST", body: payload }
  );
}
