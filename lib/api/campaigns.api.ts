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
} from "@/lib/types";

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
    `/admin/campaigns/queue?${query.toString()}`
  );

  // Normalise: always expose campaigns array regardless of which key the API used
  if (res.data?.data) {
    const list = res.data.data.queue ?? res.data.data.campaigns ?? [];
    res.data.data.campaigns = list;
    res.data.data.queue = list;
  }

  return res;
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

export async function getCampaignMatches(
  campaignId: string,
  params?: { minMatchScore?: number; limit?: number }
): Promise<ApiResponse<ApiEnvelope<CampaignMatchResponse>>> {
  const query = new URLSearchParams();
  if (params?.minMatchScore !== undefined) query.set("minMatchScore", String(params.minMatchScore));
  if (params?.limit) query.set("limit", String(params.limit));

  const qs = query.toString();
  const endpoint = `/admin/campaigns/${campaignId}/match${qs ? `?${qs}` : ""}`;

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

  const qs = query.toString();
  const endpoint = `/admin/campaigns/${campaignId}/assignments${qs ? `?${qs}` : ""}`;

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

  const qs = query.toString();
  const endpoint = `/admin/campaigns/overview/360${qs ? `?${qs}` : ""}`;

  return apiRequest<ApiEnvelope<Campaign360OverviewResponse>>(endpoint);
}

export async function getCampaignPerformance(
  campaignId: string,
  params?: { period?: string; breakdown?: string }
): Promise<ApiResponse<ApiEnvelope<CampaignPerformanceResponse>>> {
  const query = new URLSearchParams();
  if (params?.period) query.set("period", params.period);
  if (params?.breakdown) query.set("breakdown", params.breakdown);

  const qs = query.toString();
  const endpoint = `/admin/campaigns/${campaignId}/performance${qs ? `?${qs}` : ""}`;

  return apiRequest<ApiEnvelope<CampaignPerformanceResponse>>(endpoint);
}

export async function evaluateCampaignPerformance(
  campaignId: string
): Promise<ApiResponse<ApiEnvelope<CampaignEvaluationResponse>>> {
  return apiRequest<ApiEnvelope<CampaignEvaluationResponse>>(
    `/admin/campaigns/${campaignId}/performance/evaluate`,
    { method: "POST" }
  );
}

export async function getCampaignPerformancePolicy(
  campaignId: string
): Promise<ApiResponse<ApiEnvelope<{ policy: CampaignPerformancePolicy }>>> {
  return apiRequest<ApiEnvelope<{ policy: CampaignPerformancePolicy }>>(
    `/admin/campaigns/${campaignId}/performance/policy`
  );
}

export async function updateCampaignPerformancePolicy(
  campaignId: string,
  policy: CampaignPerformancePolicy
): Promise<ApiResponse<ApiEnvelope<{ policy: CampaignPerformancePolicy }>>> {
  return apiRequest<ApiEnvelope<{ policy: CampaignPerformancePolicy }>>(
    `/admin/campaigns/${campaignId}/performance/policy`,
    { method: "PUT", body: policy }
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
