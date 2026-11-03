import { getToken, setToken, getRefreshToken, setRefreshToken, clearToken } from "@/lib/auth/storage";
import { logger } from "@/lib/logger";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://brdgr-api.onrender.com/api/v1";

const DEFAULT_TIMEOUT_MS = 12000;

const STATUS_MESSAGES: Record<number, string> = {
  409: "A record with these details already exists.",
  403: "You don't have permission to perform this action.",
  404: "The requested resource was not found.",
  422: "The submitted data is invalid.",
  429: "Too many requests. Please slow down.",
  500: "Server error. Please try again later.",
};

// Server returns 401, or 400 with a jwt/token-related message, for invalid sessions
const AUTH_ERROR_PATTERN = /jwt|token|signature|malformed|expired/i;

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

// ─── Token Refresh ────────────────────────────────────────────────────────────

let refreshPromise: Promise<string | null> | null = null;

export async function attemptTokenRefresh(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;

    try {
      let res = await fetch(`${API_BASE}/auth/refresh-token`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${refreshToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        res = await fetch(`${API_BASE}/auth/refresh-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
      }

      if (!res.ok) return null;

      const json = (await res.json()) as {
        data?: {
          tokens?: { accessToken?: string; refreshToken?: string };
          accessToken?: string;
          refreshToken?: string;
        };
      };

      const rawData = json?.data;
      const accessToken = rawData?.tokens?.accessToken ?? rawData?.accessToken;
      if (!accessToken) return null;

      const newRefreshToken = rawData?.tokens?.refreshToken ?? rawData?.refreshToken;

      setToken(accessToken);
      if (newRefreshToken) {
        setRefreshToken(newRefreshToken);
      }

      return accessToken;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ─── Request building ─────────────────────────────────────────────────────────

function isFormDataBody(body: unknown): body is FormData {
  return typeof FormData !== "undefined" && body instanceof FormData;
}

function buildUrl(endpoint: string): string {
  if (endpoint.startsWith("http")) return endpoint;
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${API_BASE}${path}`;
}

function buildHeaders(isFormData: boolean, token: string | null | undefined): Record<string, string> {
  const headers: Record<string, string> = {};
  // Let the browser set the multipart boundary for FormData
  if (!isFormData) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function serializeBody(body: unknown, isFormData: boolean): BodyInit | undefined {
  if (isFormData) return body as BodyInit;
  return body ? JSON.stringify(body) : undefined;
}

// ─── Response handling ────────────────────────────────────────────────────────

function parseJson<T>(text: string): T | null {
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function getHttpErrorMessage(json: unknown, status: number): string {
  return (
    (json as { message?: string } | null)?.message ||
    STATUS_MESSAGES[status] ||
    `Request failed with status ${status}`
  );
}

function isAuthError(status: number, message: string): boolean {
  return status === 401 || (status === 400 && AUTH_ERROR_PATTERN.test(message));
}

function redirectToLogin(): void {
  if (typeof window === "undefined" || window.location.pathname === "/login") return;
  clearToken();
  window.location.href = "/login";
}

function getNetworkErrorMessage(err: unknown): string {
  if (!(err instanceof Error)) return "Network error";
  return err.name === "AbortError" ? "Request timed out" : err.message;
}

interface RequestContext {
  method: ApiMethod;
  url: string;
  silent: boolean;
  silent404: boolean;
}

function handleHttpError<T>(ctx: RequestContext, status: number, json: T | null): ApiResponse<T> {
  const message = getHttpErrorMessage(json, status);
  const isSuppressed = ctx.silent || (ctx.silent404 && status === 404);

  if (isSuppressed) {
    logger.debug(`[API Client Handled Error] ${ctx.method} ${ctx.url} [${status}]`);
  } else {
    logger.error(`[API Client Error] ${ctx.method} ${ctx.url} [${status}]:`, {
      status,
      message,
      response: json,
    });
  }

  if (!ctx.silent && isAuthError(status, message)) redirectToLogin();

  return { data: json, error: message, status, ok: false };
}

function handleNetworkError<T>(ctx: RequestContext, err: unknown): ApiResponse<T> {
  const message = getNetworkErrorMessage(err);

  if (ctx.silent) {
    logger.debug(`[API Client Handled Network Error] ${ctx.method} ${ctx.url}:`, message);
  } else {
    logger.error(`[API Client Network Error] ${ctx.method} ${ctx.url}:`, err);
  }

  return { data: null, error: message, status: 0, ok: false };
}

// ─── Public API ───────────────────────────────────────────────────────────────

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
    timeoutMs = DEFAULT_TIMEOUT_MS,
  } = options;

  const isFormData = isFormDataBody(body);
  const ctx: RequestContext = { method, url: buildUrl(endpoint), silent, silent404 };

  const controller = typeof AbortController === "undefined" ? null : new AbortController();
  const timeoutId = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;

  try {
    const activeToken = token ?? getToken();
    let res = await fetch(ctx.url, {
      method,
      headers: buildHeaders(isFormData, activeToken),
      body: serializeBody(body, isFormData),
      signal: controller?.signal,
    });

    let json = parseJson<T>(await res.text());
    const initialMsg = getHttpErrorMessage(json, res.status);

    // Attempt silent token refresh on 401 (or 400 JWT error) before falling back to redirectToLogin()
    if (!res.ok && isAuthError(res.status, initialMsg) && !token && activeToken) {
      const refreshedToken = await attemptTokenRefresh();
      if (refreshedToken) {
        res = await fetch(ctx.url, {
          method,
          headers: buildHeaders(isFormData, refreshedToken),
          body: serializeBody(body, isFormData),
          signal: controller?.signal,
        });
        json = parseJson<T>(await res.text());
      }
    }

    if (!res.ok) return handleHttpError(ctx, res.status, json);

    // Check envelope error flag on 2xx responses
    const hasAppError =
      json !== null &&
      typeof json === "object" &&
      (json as { error?: boolean }).error === true;

    if (hasAppError) {
      const errorMessage =
        (json as { message?: string }).message || "An error occurred";
      logger.api(method, ctx.url, res.status, json);
      return { data: json, error: errorMessage, status: res.status, ok: false };
    }

    logger.api(method, ctx.url, res.status, json);
    return { data: json, error: null, status: res.status, ok: true };
  } catch (err) {
    return handleNetworkError<T>(ctx, err);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}
