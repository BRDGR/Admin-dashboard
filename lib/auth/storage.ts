const TOKEN_KEY = "brdgr_admin_token";
const REFRESH_TOKEN_KEY = "brdgr_admin_refresh_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token || token === "undefined" || token === "null" || token.trim() === "") {
    return null;
  }
  return token;
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  if (!token || token === "undefined" || token === "null" || token.trim() === "") {
    clearToken();
    return;
  }
  localStorage.setItem(TOKEN_KEY, token);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!token || token === "undefined" || token === "null" || token.trim() === "") {
    return null;
  }
  return token;
}

export function setRefreshToken(token: string): void {
  if (typeof window === "undefined") return;
  if (!token || token === "undefined" || token === "null" || token.trim() === "") {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    return;
  }
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}
