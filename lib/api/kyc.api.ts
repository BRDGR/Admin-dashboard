import { apiRequest, type ApiResponse } from "./client";
import type {
  ApiEnvelope,
  KycListResponse,
  KycRecord,
  KycReviewPayload,
} from "@/lib/types";

// ─── KYC (Organizations) ──────────────────────────────────────────────────────

export async function listKyc(
  page = 1,
  limit = 10
): Promise<ApiResponse<ApiEnvelope<KycListResponse>>> {
  const res = await apiRequest<ApiEnvelope<KycListResponse>>(`/admin/kyc/?page=${page}&limit=${limit}`);
  console.log("[KYC] listKyc — raw response:", JSON.parse(JSON.stringify(res)));
  return res;
}

export async function getOrganizationKyc(
  orgId: string
): Promise<ApiResponse<ApiEnvelope<{ kycRecord: KycRecord }>>> {
  const res = await apiRequest<ApiEnvelope<{ kycRecord: KycRecord }>>(`/admin/kyc/organizations/${orgId}/kyc`);
  console.log(`[KYC] getOrganizationKyc(${orgId}) — raw response:`, JSON.parse(JSON.stringify(res)));
  return res;
}

export async function getKycRecord(
  kycRecordId: string
): Promise<ApiResponse<ApiEnvelope<{ kycRecord: KycRecord }>>> {
  const res = await apiRequest<ApiEnvelope<{ kycRecord: KycRecord }>>(`/admin/kyc/${kycRecordId}`);
  console.log(`[KYC] getKycRecord(${kycRecordId}) — raw response:`, JSON.parse(JSON.stringify(res)));
  return res;
}

export async function reviewOrgKyc(
  kycRecordId: string,
  payload: KycReviewPayload,
  orgId?: string
): Promise<ApiResponse<ApiEnvelope<unknown>>> {
  console.log(`[KYC] reviewOrgKyc(${kycRecordId}) — sending payload:`, payload, "orgId:", orgId);

  // Candidate 1: PATCH /admin/kyc/:kycRecordId/review
  let res = await apiRequest<ApiEnvelope<unknown>>(`/admin/kyc/${kycRecordId}/review`, {
    method: "PATCH",
    body: payload,
  });
  console.log(`[KYC] reviewOrgKyc candidate 1 (/admin/kyc/${kycRecordId}/review) — status:`, res.status, "error:", res.error);

  // Candidate 2: If 404, try PATCH /admin/kyc/:kycRecordId
  if (res.status === 404) {
    console.warn(`[KYC] /admin/kyc/${kycRecordId}/review returned 404, trying /admin/kyc/${kycRecordId}...`);
    res = await apiRequest<ApiEnvelope<unknown>>(`/admin/kyc/${kycRecordId}`, {
      method: "PATCH",
      body: payload,
    });
    console.log(`[KYC] reviewOrgKyc candidate 2 (/admin/kyc/${kycRecordId}) — status:`, res.status, "error:", res.error);
  }

  // Candidate 3: If 404 and orgId exists, try PATCH /admin/kyc/organizations/:orgId/review
  if (res.status === 404 && orgId) {
    console.warn(`[KYC] trying /admin/kyc/organizations/${orgId}/review...`);
    res = await apiRequest<ApiEnvelope<unknown>>(`/admin/kyc/organizations/${orgId}/review`, {
      method: "PATCH",
      body: payload,
    });
    console.log(`[KYC] reviewOrgKyc candidate 3 (/admin/kyc/organizations/${orgId}/review) — status:`, res.status, "error:", res.error);
  }

  // Candidate 4: If 404 and orgId exists, try PATCH /admin/kyc/organizations/:orgId/kyc
  if (res.status === 404 && orgId) {
    console.warn(`[KYC] trying /admin/kyc/organizations/${orgId}/kyc...`);
    res = await apiRequest<ApiEnvelope<unknown>>(`/admin/kyc/organizations/${orgId}/kyc`, {
      method: "PATCH",
      body: payload,
    });
    console.log(`[KYC] reviewOrgKyc candidate 4 (/admin/kyc/organizations/${orgId}/kyc) — status:`, res.status, "error:", res.error);
  }

  return res;
}

// ─── KYC (Partners) ───────────────────────────────────────────────────────────

export async function listPartnerKycRecords(
  page = 1,
  limit = 10
): Promise<ApiResponse<ApiEnvelope<KycListResponse>>> {
  const res = await apiRequest<ApiEnvelope<KycListResponse>>(`/admin/partners/kyc/records?page=${page}&limit=${limit}`);
  console.log("[KYC] listPartnerKycRecords — raw response:", JSON.parse(JSON.stringify(res)));
  return res;
}

export async function getPartnerKycRecord(
  kycRecordId: string
): Promise<ApiResponse<ApiEnvelope<KycListResponse>>> {
  const res = await apiRequest<ApiEnvelope<KycListResponse>>(`/admin/partners/kyc/records/${kycRecordId}`);
  console.log(`[KYC] getPartnerKycRecord(${kycRecordId}) — raw response:`, JSON.parse(JSON.stringify(res)));
  return res;
}

export async function reviewPartnerKyc(
  kycRecordId: string,
  payload: KycReviewPayload
): Promise<ApiResponse<ApiEnvelope<KycListResponse>>> {
  console.log(`[KYC] reviewPartnerKyc(${kycRecordId}) — sending payload:`, payload);
  const res = await apiRequest<ApiEnvelope<KycListResponse>>(`/admin/partners/kyc/records/${kycRecordId}/review`, {
    method: "PATCH",
    body: payload,
  });
  console.log(`[KYC] reviewPartnerKyc(${kycRecordId}) — raw response:`, JSON.parse(JSON.stringify(res)));
  return res;
}
