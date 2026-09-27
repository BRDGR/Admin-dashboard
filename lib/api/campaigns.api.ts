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
  CampaignEvaluationResponse,
  CampaignPerformancePolicy,
  CampaignPipPayload,
} from "@/lib/types";

// ─── Admin Campaigns Pipeline ─────────────────────────────────────────────────

export function getCampaignQueue(params?: {
  page?: number;
  limit?: number;
  status?: string;
  stage?: string;
}): Promise<ApiResponse<ApiEnvelope<AdminCampaignQueueResponse>>> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.status) query.set("status", params.status);
  if (params?.stage) query.set("stage", params.stage);

  const qs = query.toString();
  return apiRequest(`/admin/campaigns/queue${qs ? `?${qs}` : ""}`);
}

export function reviewCampaign(
  campaignId: string,
  payload: CampaignReviewPayload
): Promise<ApiResponse<ApiEnvelope<AdminCampaignQueueItem>>> {
  return apiRequest(`/admin/campaigns/${campaignId}/review`, {
    method: "PATCH",
    body: payload,
  });
}

export function getCampaignMatches(
  campaignId: string,
  params?: { minMatchScore?: number; limit?: number }
): Promise<ApiResponse<ApiEnvelope<CampaignMatchResponse>>> {
  const query = new URLSearchParams();
  if (params?.minMatchScore !== undefined) query.set("minMatchScore", String(params.minMatchScore));
  if (params?.limit) query.set("limit", String(params.limit));

  const qs = query.toString();
  return apiRequest(`/admin/campaigns/${campaignId}/match${qs ? `?${qs}` : ""}`);
}

export function assignCampaignPartners(
  campaignId: string,
  payload: AssignCampaignPayload
): Promise<ApiResponse<ApiEnvelope<{ success: boolean; assignedCount: number }>>> {
  return apiRequest(`/admin/campaigns/${campaignId}/assign`, {
    method: "POST",
    body: payload,
  });
}

export function getCampaignAssignments(
  campaignId: string,
  params?: { status?: string; page?: number; limit?: number }
): Promise<ApiResponse<ApiEnvelope<CampaignAssignmentsResponse>>> {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));

  const qs = query.toString();
  return apiRequest(`/admin/campaigns/${campaignId}/assignments${qs ? `?${qs}` : ""}`);
}

export function activateCampaign(
  campaignId: string,
  payload?: CampaignActivatePayload
): Promise<ApiResponse<ApiEnvelope<{ success: boolean; campaign: AdminCampaignQueueItem }>>> {
  return apiRequest(`/admin/campaigns/${campaignId}/activate`, {
    method: "PATCH",
    body: payload ?? { generateTrackingLinks: true, notifyPartners: true },
  });
}

export function getCampaign360Overview(params?: {
  period?: string;
  status?: string;
}): Promise<ApiResponse<ApiEnvelope<Campaign360OverviewResponse>>> {
  const query = new URLSearchParams();
  if (params?.period) query.set("period", params.period);
  if (params?.status) query.set("status", params.status);

  const qs = query.toString();
  return apiRequest(`/admin/campaigns/overview/360${qs ? `?${qs}` : ""}`);
}

export function getCampaignPerformance(
  campaignId: string,
  params?: { period?: string; breakdown?: string }
): Promise<ApiResponse<ApiEnvelope<CampaignPerformanceResponse>>> {
  const query = new URLSearchParams();
  if (params?.period) query.set("period", params.period);
  if (params?.breakdown) query.set("breakdown", params.breakdown);

  const qs = query.toString();
  return apiRequest(`/admin/campaigns/${campaignId}/performance${qs ? `?${qs}` : ""}`);
}

export function evaluateCampaignPerformance(
  campaignId: string
): Promise<ApiResponse<ApiEnvelope<CampaignEvaluationResponse>>> {
  return apiRequest(`/admin/campaigns/${campaignId}/performance/evaluate`, {
    method: "POST",
  });
}

export function getCampaignPerformancePolicy(
  campaignId: string
): Promise<ApiResponse<ApiEnvelope<{ policy: CampaignPerformancePolicy }>>> {
  return apiRequest(`/admin/campaigns/${campaignId}/performance/policy`);
}

export function updateCampaignPerformancePolicy(
  campaignId: string,
  policy: CampaignPerformancePolicy
): Promise<ApiResponse<ApiEnvelope<{ policy: CampaignPerformancePolicy }>>> {
  return apiRequest(`/admin/campaigns/${campaignId}/performance/policy`, {
    method: "PUT",
    body: policy,
  });
}

export function placeCampaignOnPip(
  campaignId: string,
  payload: CampaignPipPayload
): Promise<ApiResponse<ApiEnvelope<{ success: boolean; message: string }>>> {
  return apiRequest(`/admin/campaigns/${campaignId}/pip`, {
    method: "POST",
    body: payload,
  });
}
