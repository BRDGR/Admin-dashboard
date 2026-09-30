import { apiRequest, type ApiResponse } from "./client";
import type {
  ApiEnvelope,
  NotificationsResponse,
  NotificationItem,
} from "@/lib/types";

// ─── Notifications ────────────────────────────────────────────────────────────

export function fetchNotifications(params?: {
  page?: number;
  limit?: number;
  type?: string;
}): Promise<ApiResponse<ApiEnvelope<NotificationsResponse>>> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.type) query.set("type", params.type);

  const qs = query.toString();
  return apiRequest(`/notifications/${qs ? `?${qs}` : ""}`);
}

export function fetchUnreadCount(
  type?: string
): Promise<ApiResponse<ApiEnvelope<NotificationsResponse>>> {
  const qs = type ? `?type=${encodeURIComponent(type)}` : "";
  return apiRequest(`/notifications/unread-count${qs}`);
}

export function markNotificationAsRead(
  notificationId: string,
  type?: string
): Promise<ApiResponse<ApiEnvelope<NotificationItem>>> {
  const qs = type ? `?type=${encodeURIComponent(type)}` : "";
  return apiRequest(`/notifications/${notificationId}/read${qs}`, {
    method: "PATCH",
  });
}

export function markAllNotificationsAsRead(
  type?: string
): Promise<ApiResponse<ApiEnvelope<{ success: boolean }>>> {
  const qs = type ? `?type=${encodeURIComponent(type)}` : "";
  return apiRequest(`/notifications/read-all${qs}`, {
    method: "PATCH",
  });
}

export function deleteNotification(
  notificationId: string,
  type?: string
): Promise<ApiResponse<ApiEnvelope<{ success: boolean }>>> {
  const qs = type ? `?type=${encodeURIComponent(type)}` : "";
  return apiRequest(`/notifications/${notificationId}${qs}`, {
    method: "DELETE",
  });
}
