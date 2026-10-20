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

  // Candidate 1: PATCH /admin/kyc/:kycRecordId/review (Apidog ID 44711839)
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

export const reviewOrganizationKyc = reviewOrgKyc;

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

// ─── KYC Reminders (Apidog Update) ──────────────────────────────────────────

export async function sendOrganizationKycReminder(
  orgId: string
): Promise<ApiResponse<ApiEnvelope<unknown>>> {
  logger.debug(`[KYC] sendOrganizationKycReminder(${orgId})`);
  const res = await apiRequest<ApiEnvelope<unknown>>(`/admin/kyc/organizations/${orgId}/reminder`, {
    method: "POST",
    body: {},
  });
  if (!res.ok) {
    logger.warn(`[KYC] sendOrganizationKycReminder failed (${res.status}): ${res.error}`);
    return {
      ok: false,
      status: res.status || 500,
      error: res.error || "Failed to send KYC reminder notification to organization",
      data: null,
    };
  }
  return res;
}

export interface SendPartnerReminderOptions {
  partnerProfileId?: string;
  kycRecordId?: string;
}

/**
 * Only a missing route (404 / 405) justifies trying the next candidate endpoint.
 * Any other failure (401/403/422/5xx/network) is a real error: retrying a POST
 * could send a duplicate reminder and would mask the actual cause.
 */
function isRouteMissing(status: number): boolean {
  return status === 404 || status === 405;
}

export async function sendPartnerKycReminder(
  partnerUserId: string,
  options?: SendPartnerReminderOptions
): Promise<ApiResponse<ApiEnvelope<unknown>>> {
  logger.debug(`[KYC] sendPartnerKycReminder(${partnerUserId})`, options);

  // Candidate endpoints, in priority order. TODO: collapse to the single
  // backend-confirmed endpoint once the API contract is finalised.
  const candidates: string[] = [
    // 1: POST /admin/partners/kyc/:partnerUserId/reminder
    `/admin/partners/kyc/${partnerUserId}/reminder`,
    // 2: POST /admin/partners/kyc/records/:kycRecordId/reminder
    ...(options?.kycRecordId ? [`/admin/partners/kyc/records/${options.kycRecordId}/reminder`] : []),
    // 3: POST /admin/kyc/partners/:partnerUserId/reminder (matching org pattern)
    `/admin/kyc/partners/${partnerUserId}/reminder`,
    // 4: POST /admin/partners/kyc/:partnerProfileId/reminder
    ...(options?.partnerProfileId ? [`/admin/partners/kyc/${options.partnerProfileId}/reminder`] : []),
  ];

  let res: ApiResponse<ApiEnvelope<unknown>> | undefined;
  for (const [index, path] of candidates.entries()) {
    if (res) {
      logger.warn(`[KYC] candidate ${index} returned ${res.status}, trying ${path}...`);
    }
    res = await apiRequest<ApiEnvelope<unknown>>(path, {
      method: "POST",
      body: {},
      silent: true,
    });
    if (res.ok) return res;
    if (!isRouteMissing(res.status)) break; // real failure — stop, don't retry
  }

  logger.error(`[KYC] sendPartnerKycReminder failed. Returning error (${res?.status}): ${res?.error}`);
  return {
    ok: false,
    status: res?.status || 500,
    error: res?.error || "Failed to send KYC reminder notification to partner",
    data: null,
  };
}

