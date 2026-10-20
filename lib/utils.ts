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

