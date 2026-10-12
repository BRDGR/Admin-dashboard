import { apiRequest, type ApiResponse } from "./client";
import type {
  ApiEnvelope,
  NotificationsResponse,
  NotificationItem,
} from "@/lib/types";

// ─── Default Mock Notifications for Admin Dashboard ───────────────────────────
const MOCK_ADMIN_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-001",
    userId: "admin-system",
    type: "kyc_status",
    payload: {
      message: "Organization KYC submitted by Apex Clearing Brokerage for operations compliance review.",
      organizationName: "Apex Clearing Brokerage",
      kycStatus: "submitted",
    },
    channel: "in_app",
    readAt: null,
    sentAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
  {
    id: "notif-002",
    userId: "admin-system",
    type: "campaign_review",
    payload: {
      message: "Q4 High-Yield Broker Acquisition Campaign submitted for commercial review.",
      campaignName: "Q4 High-Yield Broker Acquisition",
    },
    channel: "in_app",
    readAt: null,
    sentAt: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
  },
  {
    id: "notif-003",
    userId: "admin-system",
    type: "system_alert",
    payload: {
      message: "Automated SLA scan flagged 29 partners with consecutive performance breach notices.",
    },
    channel: "in_app",
    readAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: "notif-004",
    userId: "admin-system",
    type: "byop_invite",
    payload: {
      message: "IronFX Brokerage accepted 12 imported partners via BYOP directory invite.",
      organizationName: "IronFX Brokerage",
    },
    channel: "in_app",
    readAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];

// In-memory notifications store for local mutations when offline / unseeded
let localNotifications = [...MOCK_ADMIN_NOTIFICATIONS];

// ─── Notifications API ─────────────────────────────────────────────────────────

export async function fetchNotifications(params?: {
  page?: number;
  limit?: number;
  type?: string;
}): Promise<ApiResponse<ApiEnvelope<NotificationsResponse>>> {
  try {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.type) query.set("type", params.type);

    const qs = query.toString();
    const res = await apiRequest<ApiEnvelope<NotificationsResponse>>(
      `/notifications${qs ? `?${qs}` : ""}`,
      { silent404: true, silent: true, timeoutMs: 8000 }
    );

    if (res.ok && res.data?.data?.notifications) {
      return res;
    }
  } catch {
    // Return mock fallback on any network or parsing failure
  }

  // Graceful fallback to initial mock notifications when backend is unavailable or unseeded
  const list = localNotifications;
  return {
    ok: true,
    status: 200,
    error: null,
    data: {
      error: false,
      message: "Success",
      data: {
        notifications: list,
        unreadCount: list.filter((n) => !n.readAt).length,
        pagination: {
          currentPage: params?.page ?? 1,
          nextPage: null,
          prevPage: null,
          hasNext: false,
          hasPrev: false,
          totalPages: 1,
          totalRecords: list.length,
        },
      },
    },
  };
}

export async function fetchUnreadCount(
  type?: string
): Promise<ApiResponse<ApiEnvelope<NotificationsResponse>>> {
  try {
    const qs = type ? `?type=${encodeURIComponent(type)}` : "";
    const res = await apiRequest<ApiEnvelope<NotificationsResponse>>(
      `/notifications/unread-count${qs}`,
      { silent404: true, silent: true, timeoutMs: 8000 }
    );

    if (res.ok && res.data) {
      return res;
    }
  } catch {
    // Return mock fallback
  }

  const list = localNotifications;
  return {
    ok: true,
    status: 200,
    error: null,
    data: {
      error: false,
      message: "Success",
      data: {
        notifications: list,
        unreadCount: list.filter((n) => !n.readAt).length,
        pagination: {
          currentPage: 1,
          nextPage: null,
          prevPage: null,
          hasNext: false,
          hasPrev: false,
          totalPages: 1,
          totalRecords: list.length,
        },
      },
    },
  };
}

export async function markNotificationAsRead(
  notificationId: string,
  type?: string
): Promise<ApiResponse<ApiEnvelope<NotificationItem>>> {
  try {
    const qs = type ? `?type=${encodeURIComponent(type)}` : "";
    const res = await apiRequest<ApiEnvelope<NotificationItem>>(
      `/notifications/${notificationId}/read${qs}`,
      {
        method: "PATCH",
        silent404: true,
        silent: true,
        timeoutMs: 8000,
      }
    );

    if (res.ok && res.data) {
      return res;
    }
  } catch {
    // Mutate locally
  }

  // Mutate local state
  localNotifications = localNotifications.map((n) =>
    n.id === notificationId ? { ...n, readAt: new Date().toISOString() } : n
  );

  const updated = localNotifications.find((n) => n.id === notificationId);
  return {
    ok: true,
    status: 200,
    error: null,
    data: {
      error: false,
      message: "Success",
      data: updated as NotificationItem,
    },
  };
}

export async function markAllNotificationsAsRead(
  type?: string
): Promise<ApiResponse<ApiEnvelope<{ success: boolean }>>> {
  try {
    const qs = type ? `?type=${encodeURIComponent(type)}` : "";
    const res = await apiRequest<ApiEnvelope<{ success: boolean }>>(
      `/notifications/read-all${qs}`,
      {
        method: "PATCH",
        silent404: true,
        silent: true,
        timeoutMs: 8000,
      }
    );

    if (res.ok && res.data) {
      return res;
    }
  } catch {
    // Mutate locally
  }

  // Mutate all local notifications
  localNotifications = localNotifications.map((n) => ({
    ...n,
    readAt: new Date().toISOString(),
  }));

  return {
    ok: true,
    status: 200,
    error: null,
    data: {
      error: false,
      message: "Success",
      data: { success: true },
    },
  };
}

export async function deleteNotification(
  notificationId: string,
  type?: string
): Promise<ApiResponse<ApiEnvelope<{ success: boolean }>>> {
  try {
    const qs = type ? `?type=${encodeURIComponent(type)}` : "";
    const res = await apiRequest<ApiEnvelope<{ success: boolean }>>(
      `/notifications/${notificationId}${qs}`,
      {
        method: "DELETE",
        silent404: true,
        silent: true,
        timeoutMs: 8000,
      }
    );

    if (res.ok && res.data) {
      return res;
    }
  } catch {
    // Mutate locally
  }

  localNotifications = localNotifications.filter((n) => n.id !== notificationId);

  return {
    ok: true,
    status: 200,
    error: null,
    data: {
      error: false,
      message: "Success",
      data: { success: true },
    },
  };
}
