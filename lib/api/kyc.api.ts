import { apiRequest, type ApiResponse } from "./client";
import { logger } from "@/lib/logger";
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
  logger.debug("[KYC] listKyc raw response:", res);
  return res;
}

export async function getOrganizationKyc(
  orgId: string
): Promise<ApiResponse<ApiEnvelope<{ kycRecord: KycRecord }>>> {
  const res = await apiRequest<ApiEnvelope<{ kycRecord: KycRecord }>>(`/admin/kyc/organizations/${orgId}/kyc`);
  logger.debug(`[KYC] getOrganizationKyc(${orgId}) raw response:`, res);
  return res;
}

export async function getKycRecord(
  kycRecordId: string
): Promise<ApiResponse<ApiEnvelope<{ kycRecord: KycRecord }>>> {
  const res = await apiRequest<ApiEnvelope<{ kycRecord: KycRecord }>>(`/admin/kyc/${kycRecordId}`);
  logger.debug(`[KYC] getKycRecord(${kycRecordId}) raw response:`, res);
  return res;
}

export async function reviewOrgKyc(
  kycRecordId: string,
  payload: KycReviewPayload,
  orgId?: string
): Promise<ApiResponse<ApiEnvelope<unknown>>> {
  logger.debug(`[KYC] reviewOrgKyc(${kycRecordId}) sending payload:`, payload, "orgId:", orgId);

  // Candidate 1: PATCH /admin/kyc/:kycRecordId/review
  let res = await apiRequest<ApiEnvelope<unknown>>(`/admin/kyc/${kycRecordId}/review`, {
    method: "PATCH",
    body: payload,
  });
  logger.debug(`[KYC] reviewOrgKyc candidate 1 status: ${res.status}`);

  // Candidate 2: If 404, try PATCH /admin/kyc/:kycRecordId
  if (res.status === 404) {
    logger.warn(`[KYC] /admin/kyc/${kycRecordId}/review returned 404, trying /admin/kyc/${kycRecordId}...`);
    res = await apiRequest<ApiEnvelope<unknown>>(`/admin/kyc/${kycRecordId}`, {
      method: "PATCH",
      body: payload,
    });
  }

  // Candidate 3: If 404 and orgId exists, try PATCH /admin/kyc/organizations/:orgId/review
  if (res.status === 404 && orgId) {
    logger.warn(`[KYC] trying /admin/kyc/organizations/${orgId}/review...`);
    res = await apiRequest<ApiEnvelope<unknown>>(`/admin/kyc/organizations/${orgId}/review`, {
      method: "PATCH",
      body: payload,
    });
  }

  // Candidate 4: If 404 and orgId exists, try PATCH /admin/kyc/organizations/:orgId/kyc
  if (res.status === 404 && orgId) {
    logger.warn(`[KYC] trying /admin/kyc/organizations/${orgId}/kyc...`);
    res = await apiRequest<ApiEnvelope<unknown>>(`/admin/kyc/organizations/${orgId}/kyc`, {
      method: "PATCH",
      body: payload,
    });
  }

  return res;
}

// ─── KYC (Partners) ───────────────────────────────────────────────────────────

export async function listPartnerKycRecords(
  page = 1,
  limit = 10
): Promise<ApiResponse<ApiEnvelope<KycListResponse>>> {
  const res = await apiRequest<ApiEnvelope<KycListResponse>>(`/admin/partners/kyc/records?page=${page}&limit=${limit}`);
  logger.debug("[KYC] listPartnerKycRecords raw response:", res);
  return res;
}

export async function getPartnerKycRecord(
  kycRecordId: string
): Promise<ApiResponse<ApiEnvelope<KycListResponse>>> {
  const res = await apiRequest<ApiEnvelope<KycListResponse>>(`/admin/partners/kyc/records/${kycRecordId}`);
  logger.debug(`[KYC] getPartnerKycRecord(${kycRecordId}) raw response:`, res);
  return res;
}

export async function reviewPartnerKyc(
  kycRecordId: string,
  payload: KycReviewPayload
): Promise<ApiResponse<ApiEnvelope<KycListResponse>>> {
  logger.debug(`[KYC] reviewPartnerKyc(${kycRecordId}) sending payload:`, payload);
  const res = await apiRequest<ApiEnvelope<KycListResponse>>(`/admin/partners/kyc/records/${kycRecordId}/review`, {
    method: "PATCH",
    body: payload,
  });
  logger.debug(`[KYC] reviewPartnerKyc(${kycRecordId}) response:`, res);
  return res;
}
