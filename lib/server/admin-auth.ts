import { createHash, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://brdgr-api.onrender.com/api/v1";

const ALLOWED_ADMIN_ROLES = new Set([
  "admin",
  "ops_admin",
  "super_admin",
  "staff",
  "reviewer",
  "support",
]);

function safeSecretEqual(a: string, b: string): boolean {
  const hashA = createHash("sha256").update(a, "utf8").digest();
  const hashB = createHash("sha256").update(b, "utf8").digest();
  return timingSafeEqual(hashA, hashB);
}

/**
 * Synchronous check against configured static admin secret (`ADMIN_SECRET_KEY` / `BRDGR_ADMIN_SECRET`).
 */
export function isAuthorizedAdmin(request: Request | NextRequest): boolean {
  const configuredSecret =
    process.env.ADMIN_SECRET_KEY || process.env.BRDGR_ADMIN_SECRET;

  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7).trim()
    : null;
  const adminKeyHeader = request.headers.get("x-admin-key")?.trim() || null;

  const providedKey = bearerToken || adminKeyHeader;
  if (!providedKey) {
    return false;
  }

  if (configuredSecret) {
    return safeSecretEqual(providedKey, configuredSecret);
  }

  if (process.env.NODE_ENV !== "production") {
    return safeSecretEqual(providedKey, "brdgr-dev-admin-key");
  }

  return false;
}

/**
 * Verifies whether an incoming request is from an authenticated administrator,
 * checking either the static admin secret (via timingSafeEqual) or validating
 * the Bearer token against `API_BASE/admins/profile`.
 */
export async function verifyAdminRequest(
  request: Request | NextRequest
): Promise<boolean> {
  if (isAuthorizedAdmin(request)) {
    return true;
  }

  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7).trim()
    : null;

  if (!bearerToken) {
    return false;
  }

  try {
    const res = await fetch(`${API_BASE}/admins/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return false;
    }

    const json = (await res.json()) as Record<string, unknown> | null;
    if (!json || json.error === true) {
      return false;
    }

    const data = json.data as Record<string, unknown> | undefined;
    const user = (data?.user ??
      data?.admin ??
      json.user ??
      json.admin ??
      (data?.id ? data : null)) as { role?: string } | null;

    if (!user || typeof user.role !== "string") {
      return false;
    }

    return ALLOWED_ADMIN_ROLES.has(user.role.toLowerCase());
  } catch {
    return false;
  }
}
