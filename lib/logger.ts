/**
 * Production-Safe Logging Utility
 *
 * In production, verbose debug statements are suppressed by default to prevent
 * sensitive data leaking into browser consoles. Developers and admins can enable
 * verbose mode by setting localStorage.setItem("BRDGR_DEBUG", "true").
 */

const isDev = process.env.NODE_ENV !== "production";

function isDebugEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return isDev || localStorage.getItem("BRDGR_DEBUG") === "true";
}

export const logger = {
  debug: (...args: unknown[]) => {
    if (isDebugEnabled()) {
      console.log(...args);
    }
  },

  info: (...args: unknown[]) => {
    if (isDebugEnabled()) {
      console.info(...args);
    }
  },

  warn: (...args: unknown[]) => {
    console.warn(...args);
  },

  error: (...args: unknown[]) => {
    console.error(...args);
  },

  api: (method: string, url: string, status?: number, payload?: unknown) => {
    if (isDebugEnabled()) {
      console.log(`[API ${method}] ${url} ${status ? `[${status}]` : ""}`, payload ?? "");
    }
  },
};
