import { apiRequest, type ApiResponse } from "./client";
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
  return apiRequest(`/admin/pending-changes${qs ? `?${qs}` : ""}`);
}

export function getPendingChange(
  id: string
): Promise<ApiResponse<ApiEnvelope<{ pendingChange: PendingChangeItem }>>> {
  return apiRequest(`/admin/pending-changes/${id}`);
}

export function reviewPendingChange(
  id: string,
  payload: ReviewPendingChangePayload
): Promise<ApiResponse<ApiEnvelope<{ pendingChange: PendingChangeItem }>>> {
  return apiRequest(`/admin/pending-changes/${id}/review`, {
    method: "POST",
    body: payload,
  });
}
