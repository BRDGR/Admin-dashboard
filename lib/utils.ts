import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function safeFormatDate(
  value?: string | number | Date | null,
  formatStr = "MMM d, yyyy",
  fallback = "—"
): string {
  if (!value) return fallback;
  try {
    const d = typeof value === "string" || typeof value === "number" ? new Date(value) : value;
    if (Number.isNaN(d.getTime())) return fallback;
    return format(d, formatStr);
  } catch {
    return fallback;
  }
}

const SCHEME_RE = /^[a-zA-Z][a-zA-Z\d+\-.]*:/;
const DOMAIN_LIKE_RE = /^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+([/?#:].*)?$/;

export function safeExternalUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!trimmed || trimmed === "#") return undefined;

  const candidate =
    !SCHEME_RE.test(trimmed) && DOMAIN_LIKE_RE.test(trimmed)
      ? `https://${trimmed}`
      : trimmed;

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.href;
    }
    return undefined;
  } catch {
    return undefined;
  }
}
