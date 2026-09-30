import { getToken, clearToken } from "@/lib/auth/storage";
import { logger } from "@/lib/logger";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://brdgr-api.onrender.com/api/v1";

export type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
  ok: boolean;
}

export async function apiRequest<T, B = unknown>(
  endpoint: string,
  options: { method?: ApiMethod; body?: B; token?: string } = {}
): Promise<ApiResponse<T>> {
  const { method = "GET", body, token } = options;

  const activeToken = token ?? getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
  };

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const text = await res.text();
    let json: T | null = null;
    try { json = text ? JSON.parse(text) : null; } catch { json = null; }

    if (!res.ok) {
      const STATUS_MESSAGES: Record<number, string> = {
        409: "A record with these details already exists.",
        403: "You don't have permission to perform this action.",
        404: "The requested resource was not found.",
        422: "The submitted data is invalid.",
        429: "Too many requests. Please slow down.",
        500: "Server error. Please try again later.",
      };

      const msg =
        (json as { message?: string } | null)?.message ||
        STATUS_MESSAGES[res.status] ||
        `Request failed with status ${res.status}`;

      logger.error(`[API Client Error] ${method} ${url} [${res.status}]:`, {
        status: res.status,
        message: msg,
        response: json,
      });

      // Token expired — clear session (unless already on /login page to prevent redirect loops)
      if (res.status === 401 && typeof window !== "undefined" && window.location.pathname !== "/login") {
        clearToken();
        window.location.href = "/login";
      }

      return { data: json, error: msg, status: res.status, ok: false };
    }

    logger.api(method, url, res.status, json);
    return { data: json, error: null, status: res.status, ok: true };
  } catch (err) {
    logger.error(`[API Client Network Error] ${method} ${url}:`, err);
    return { data: null, error: err instanceof Error ? err.message : "Network error", status: 0, ok: false };
  }
}
