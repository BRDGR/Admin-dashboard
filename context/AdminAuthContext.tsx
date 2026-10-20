"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { apiRequest } from "@/lib/api/client";
import { getToken, setToken as saveToken, clearToken } from "@/lib/auth/storage";
import type { StaffMember, ApiEnvelope } from "@/lib/types";

interface LoginPayload { email: string; password: string; }

interface BackendLoginResponse {
  user: StaffMember;
  tokens: { accessToken: string; refreshToken: string };
}

interface AdminAuthContextValue {
  admin: StaffMember | null;
  token: string | null;
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<StaffMember | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Restore session from localStorage on mount
  useEffect(() => {
    const stored = getToken();
    if (stored) {
      setToken(stored);
      // Fetch profile to restore admin object
      apiRequest<ApiEnvelope<{ user: StaffMember }>>("/admins/profile", { token: stored })
        .then((res) => {
          const rawData = res.data?.data as unknown as Record<string, unknown> | undefined;
          const rawEnvelope = res.data as unknown as Record<string, unknown> | undefined;
          const user = (res.data?.data?.user ??
            rawData?.admin ??
            rawEnvelope?.user ??
            rawEnvelope?.admin ??
            (rawData?.id ? rawData : null)) as StaffMember | null;

          if (user) {
            setAdmin(user);
          } else if (!res.ok) {
            // Only clear token if server explicitly rejected or responded with an error
            clearToken();
            setToken(null);
          }
        })
        .catch(() => {
          clearToken();
          setToken(null);
        })
        .finally(() => setIsInitializing(false));
    } else {
      setIsInitializing(false);
    }
  }, []);

  const login = useCallback(async ({ email, password }: LoginPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiRequest<ApiEnvelope<BackendLoginResponse>>("/auth/login", {
        method: "POST",
        body: { email, password },
      });

      if (res.error || !res.data || res.data.error) {
        throw new Error(res.data?.message || res.error || "Login failed");
      }

      const rawData = res.data.data as (BackendLoginResponse & Record<string, unknown>) | undefined;
      const user = (rawData?.user ?? rawData?.admin) as StaffMember | undefined;
      const tokens = rawData?.tokens ?? rawData?.token;
      const rawTokensObj = typeof tokens === "object" && tokens !== null ? (tokens as Record<string, unknown>) : null;
      const accessToken =
        typeof tokens === "string"
          ? tokens
          : (tokens as { accessToken?: string } | undefined)?.accessToken ??
            (rawTokensObj?.token as string | undefined) ??
            (rawTokensObj?.access_token as string | undefined);

      if (!accessToken || !user) {
        throw new Error("Invalid credentials or server response format.");
      }

      // Guard: allow all administrative/staff roles
      const allowedRoles = ["admin", "ops_admin", "super_admin", "staff", "reviewer", "support"];
      if (!allowedRoles.includes(user.role?.toLowerCase())) {
        throw new Error("Access denied. Admin credentials required.");
      }

      saveToken(accessToken);
      setToken(accessToken);
      setAdmin(user);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed";
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setToken(null);
    setAdmin(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<AdminAuthContextValue>(
    () => ({ admin, token, isLoading, isInitializing, error, login, logout, clearError }),
    [admin, token, isLoading, isInitializing, error, login, logout, clearError]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within <AdminAuthProvider>");
  return ctx;
}
