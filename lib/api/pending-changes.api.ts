import { apiRequest, type ApiResponse } from "./client";
import { logger } from "@/lib/logger";
import type {
  ApiEnvelope,
  PendingChangeItem,
  PendingChangesResponse,
  ReviewPendingChangePayload,
} from "@/lib/types";

// ─── Pending Changes (Maker-Checker) ──────────────────────────────────────────

export function listPendingChanges(params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<ApiResponse<ApiEnvelope<PendingChangesResponse>>> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.status) query.set("status", params.status);

  const qs = query.toString();
  const url = `/admin/pending-changes${qs ? `?${qs}` : ""}`;
  logger.debug(`[pending-changes.api] GET ${url}`, { params });
  return apiRequest(url);
}

export function getPendingChange(
  id: string
): Promise<ApiResponse<ApiEnvelope<{ pendingChange: PendingChangeItem }>>> {
  logger.debug(`[pending-changes.api] GET /admin/pending-changes/${id}`);
  return apiRequest(`/admin/pending-changes/${id}`);
}

export function reviewPendingChange(
  id: string,
  payload: ReviewPendingChangePayload
): Promise<ApiResponse<ApiEnvelope<{ pendingChange: PendingChangeItem }>>> {
  logger.debug(`[pending-changes.api] POST /admin/pending-changes/${id}/review`, payload);
  return apiRequest(`/admin/pending-changes/${id}/review`, {
    method: "POST",
    body: payload,
  });
}
