"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { apiRequest } from "@/lib/api/client";
import { getToken, setToken, clearToken } from "@/lib/auth/storage";
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
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Restore session from localStorage on mount
  useEffect(() => {
    const stored = getToken();
    if (stored) {
      setTokenState(stored);
      // Fetch profile to restore admin object
      apiRequest<ApiEnvelope<{ user: StaffMember }>>("/admins/profile", { token: stored })
        .then((res) => {
          if (res.data?.data?.user) setAdmin(res.data.data.user);
          else clearToken();
        })
        .catch(() => clearToken())
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

      const { user, tokens } = res.data.data;

      // Guard: only allow admin/ops_admin roles
      if (user.role !== "admin" && user.role !== "ops_admin") {
        throw new Error("Access denied. Admin credentials required.");
      }

      setToken(tokens.accessToken);
      setTokenState(tokens.accessToken);
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
    setTokenState(null);
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
