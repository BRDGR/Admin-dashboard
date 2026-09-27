import { apiRequest, type ApiResponse } from "./client";
import type {
  ApiEnvelope,
  OrganizationsResponse,
  Organization,
  OrganizationStatusPayload,
} from "@/lib/types";

// ─── Organizations ────────────────────────────────────────────────────────────

export function listOrganizations(
  page = 1,
  limit = 10
): Promise<ApiResponse<ApiEnvelope<OrganizationsResponse>>> {
  return apiRequest(`/admin/organizations?page=${page}&limit=${limit}`);
}

export function getOrganization(
  orgId: string
): Promise<ApiResponse<ApiEnvelope<{ organization: Organization }>>> {
  return apiRequest(`/admin/organizations/${orgId}`);
}

export function updateOrganizationStatus(
  orgId: string,
  payload: OrganizationStatusPayload
): Promise<ApiResponse<ApiEnvelope<{ organization: Organization }>>> {
  return apiRequest(`/admin/organizations/${orgId}/status`, {
    method: "PATCH",
    body: payload,
  });
}
