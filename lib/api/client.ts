import { getToken, clearToken } from "@/lib/auth/storage";

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
      const msg =
        (json as { message?: string } | null)?.message ||
        `Request failed with status ${res.status}`;

      console.error(`[API Client Error] ${method} ${url} [${res.status}]:`, {
        status: res.status,
        message: msg,
        response: json,
      });

      // Token expired — clear session
      if (res.status === 401 && typeof window !== "undefined") {
        clearToken();
        window.location.href = "/login";
      }

      return { data: json, error: msg, status: res.status, ok: false };
    }

    return { data: json, error: null, status: res.status, ok: true };
  } catch (err) {
    console.error(`[API Client Network Error] ${method} ${url}:`, err);
    return { data: null, error: err instanceof Error ? err.message : "Network error", status: 0, ok: false };
  }
}
