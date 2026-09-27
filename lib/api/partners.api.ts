import { apiRequest, type ApiResponse } from "./client";
import type {
  ApiEnvelope,
  PartnersResponse,
  ByopRelationshipsResponse,
  ByopRelationship,
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
  console.log(`[Partners API] vetPartner request:`, {
    partnerUserId,
    partnerProfileId,
    isVetted,
    endpoint: `/admin/partners/${partnerUserId}/vet`,
  });

  try {
    let res = await apiRequest<ApiEnvelope<PartnersResponse>>(
      `/admin/partners/${partnerUserId}/vet`,
      {
        method: "PATCH",
        body: { isVetted },
      }
    );

    // If 404 and partnerProfileId is available, try fallback
    if (res.status === 404 && partnerProfileId && partnerProfileId !== partnerUserId) {
      console.warn(
        `[Partners API] vetPartner with partnerUserId returned 404, attempting fallback with partnerProfileId: ${partnerProfileId}`
      );
      res = await apiRequest<ApiEnvelope<PartnersResponse>>(
        `/admin/partners/${partnerProfileId}/vet`,
        {
          method: "PATCH",
          body: { isVetted },
        }
      );
    }

    console.log(`[Partners API] vetPartner response:`, {
      status: res.status,
      ok: res.ok,
      data: res.data,
      error: res.error,
    });
    return res;
  } catch (err) {
    console.error(`[Partners API] vetPartner caught error:`, err);
    throw err;
  }
}

export async function getAdminPartnerEligibility(
  partnerUserId: string,
  partnerProfileId?: string
): Promise<ApiResponse<ApiEnvelope<PartnerEligibilityData>>> {
  console.log(`[Partners API] getAdminPartnerEligibility request:`, {
    partnerUserId,
    partnerProfileId,
    endpoint: `/admin/partners/${partnerUserId}/eligibility`,
  });

  try {
    let res = await apiRequest<ApiEnvelope<PartnerEligibilityData>>(
      `/admin/partners/${partnerUserId}/eligibility`
    );

    // If 404 and partnerProfileId is available, try fallback
    if (res.status === 404 && partnerProfileId && partnerProfileId !== partnerUserId) {
      console.warn(
        `[Partners API] getAdminPartnerEligibility returned 404, attempting fallback with partnerProfileId: ${partnerProfileId}`
      );
      res = await apiRequest<ApiEnvelope<PartnerEligibilityData>>(
        `/admin/partners/${partnerProfileId}/eligibility`
      );
    }

    console.log(`[Partners API] getAdminPartnerEligibility response:`, {
      status: res.status,
      ok: res.ok,
      data: res.data,
      error: res.error,
    });
    return res;
  } catch (err) {
    console.error(`[Partners API] getAdminPartnerEligibility caught error:`, err);
    throw err;
  }
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

export function getByopAnalytics(): Promise<ApiResponse<ApiEnvelope<unknown>>> {
  return apiRequest("/admin/byop/analytics");
}
