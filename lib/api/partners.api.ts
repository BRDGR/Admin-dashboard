import { apiRequest, type ApiResponse } from "./client";
import type {
  ApiEnvelope,
  PartnersResponse,
  ByopRelationshipsResponse,
  ByopRelationship,
  ByopAnalytics,
  PartnerEligibilityData,
} from "@/lib/types";

// ─── Partners ─────────────────────────────────────────────────────────────────

export function listPartners(
  page = 1,
  limit = 20
): Promise<ApiResponse<ApiEnvelope<PartnersResponse>>> {
  return apiRequest(`/admin/partners?page=${page}&limit=${limit}`);
}

export function getPartner(
  userId: string
): Promise<ApiResponse<ApiEnvelope<PartnersResponse>>> {
  return apiRequest(`/admin/partners/${userId}`);
}

export function listNormalPartners(
  page = 1,
  limit = 20
): Promise<ApiResponse<ApiEnvelope<PartnersResponse>>> {
  return apiRequest(`/admin/partners/normal?page=${page}&limit=${limit}`);
}

export function listByopPartners(
  page = 1,
  limit = 20
): Promise<ApiResponse<ApiEnvelope<PartnersResponse>>> {
  return apiRequest(`/admin/partners/byop?page=${page}&limit=${limit}`);
}

export async function vetPartner(
  partnerUserId: string,
  isVetted: boolean,
  partnerProfileId?: string
): Promise<ApiResponse<ApiEnvelope<PartnersResponse>>> {
  let res = await apiRequest<ApiEnvelope<PartnersResponse>>(
    `/admin/partners/${partnerUserId}/vet`,
    { method: "PATCH", body: { isVetted } }
  );

  if (res.status === 404 && partnerProfileId && partnerProfileId !== partnerUserId) {
    res = await apiRequest<ApiEnvelope<PartnersResponse>>(
      `/admin/partners/${partnerProfileId}/vet`,
      { method: "PATCH", body: { isVetted } }
    );
  }

  return res;
}

export async function getAdminPartnerEligibility(
  partnerUserId: string,
  partnerProfileId?: string
): Promise<ApiResponse<ApiEnvelope<PartnerEligibilityData>>> {
  let res = await apiRequest<ApiEnvelope<PartnerEligibilityData>>(
    `/admin/partners/${partnerUserId}/eligibility`
  );

  if (res.status === 404 && partnerProfileId && partnerProfileId !== partnerUserId) {
    res = await apiRequest<ApiEnvelope<PartnerEligibilityData>>(
      `/admin/partners/${partnerProfileId}/eligibility`
    );
  }

  return res;
}

// ─── BYOP ─────────────────────────────────────────────────────────────────────

export function listByopRelationships(
  page = 1,
  limit = 20,
  search?: string,
  clientOrgId?: string
): Promise<ApiResponse<ApiEnvelope<ByopRelationshipsResponse>>> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) params.set("search", search);
  if (clientOrgId) params.set("clientOrgId", clientOrgId);
  return apiRequest(`/admin/byop/relationships?${params}`);
}

export function getByopRelationship(
  relationshipId: string
): Promise<ApiResponse<ApiEnvelope<{ records: ByopRelationship[] }>>> {
  return apiRequest(`/admin/byop/relationships/${relationshipId}`);
}

export function deleteByopInvitations(): Promise<ApiResponse<ApiEnvelope<unknown>>> {
  return apiRequest("/admin/byop/invitations", { method: "DELETE" });
}

export function getByopAnalytics(): Promise<ApiResponse<ApiEnvelope<ByopAnalytics>>> {
  return apiRequest<ApiEnvelope<ByopAnalytics>>("/admin/byop/analytics");
}

export function deletePartner(
  partnerUserId: string
): Promise<ApiResponse<ApiEnvelope<{ success: boolean }>>> {
  return apiRequest<ApiEnvelope<{ success: boolean }>>(
    `/admin/partners/${partnerUserId}`,
    { method: "DELETE" }
  );
}

// ─── Admin Invite Codes ───────────────────────────────────────────────────────

export function listAdminInviteCodes(params?: {
  orgId?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<ApiEnvelope<{ inviteCodes: any[] }>>> {
  const query = new URLSearchParams();
  if (params?.orgId) query.set("orgId", params.orgId);
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  const qs = query.toString() ? `?${query.toString()}` : "";
  return apiRequest(`/admin/invite${qs}`);
}

export function getAdminInviteCode(
  codeId: string
): Promise<ApiResponse<ApiEnvelope<{ inviteCode: any }>>> {
  return apiRequest(`/admin/invite/${codeId}`);
}

export interface AdminByopInvitePayload {
  clientOrgId: string;
  partnerEmail: string;
  firstName: string;
  lastName: string;
}

export function adminInviteByopPartner(
  payload: AdminByopInvitePayload
): Promise<ApiResponse<ApiEnvelope<unknown>>> {
  return apiRequest<ApiEnvelope<unknown>, AdminByopInvitePayload>("/byop/invite", {
    method: "POST",
    body: payload,
  });
}
