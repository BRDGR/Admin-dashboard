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

export interface ApiRequestOptions<B = unknown> {
  method?: ApiMethod;
  body?: B;
  token?: string;
  silent404?: boolean;
  silent?: boolean;
  timeoutMs?: number;
}

export async function apiRequest<T, B = unknown>(
  endpoint: string,
  options: ApiRequestOptions<B> = {}
): Promise<ApiResponse<T>> {
  const {
    method = "GET",
    body,
    token,
    silent404 = false,
    silent = false,
    timeoutMs = 12000,
  } = options;

  const activeToken = token ?? getToken();
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const headers: Record<string, string> = {
    ...(!isFormData ? { "Content-Type": "application/json" } : {}),
    ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
  };

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  const timeoutId = controller
    ? setTimeout(() => controller.abort(), timeoutMs)
    : null;

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: isFormData
        ? (body as unknown as BodyInit)
        : body
        ? JSON.stringify(body)
        : undefined,
      signal: controller?.signal,
    });

    if (timeoutId) clearTimeout(timeoutId);

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

      if (!silent && !(silent404 && res.status === 404)) {
        logger.error(`[API Client Error] ${method} ${url} [${res.status}]:`, {
          status: res.status,
          message: msg,
          response: json,
        });
      } else {
        logger.debug(`[API Client Handled Error] ${method} ${url} [${res.status}]`);
      }

      // Token expired or invalid JWT format (server returns 401 or 400 with jwt/token errors)
      const isAuthError =
        res.status === 401 ||
        (res.status === 400 && /jwt|token|signature|malformed|expired/i.test(msg));

      if (isAuthError && typeof window !== "undefined" && window.location.pathname !== "/login") {
        clearToken();
        window.location.href = "/login";
      }

      return { data: json, error: msg, status: res.status, ok: false };
    }

    logger.api(method, url, res.status, json);
    return { data: json, error: null, status: res.status, ok: true };
  } catch (err) {
    if (timeoutId) clearTimeout(timeoutId);

    const isAbort = err instanceof Error && err.name === "AbortError";
    const errorMsg = isAbort ? "Request timed out" : err instanceof Error ? err.message : "Network error";

    if (!silent) {
      logger.error(`[API Client Network Error] ${method} ${url}:`, err);
    } else {
      logger.debug(`[API Client Handled Network Error] ${method} ${url}:`, errorMsg);
    }

    return { data: null, error: errorMsg, status: 0, ok: false };
  }
}
