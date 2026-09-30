import { cn } from "@/lib/utils";

interface StatusConfig {
  badge: string;
  dot: string;
}

const STATUS_CONFIG_MAP: Record<string, StatusConfig> = {
  // Positive / Active states (Emerald / Green)
  active: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200/70",
    dot: "bg-emerald-500",
  },
  approved: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200/70",
    dot: "bg-emerald-500",
  },
  verified: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200/70",
    dot: "bg-emerald-500",
  },
  completed: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200/70",
    dot: "bg-emerald-500",
  },

  // Inactive / Offline / Negative states (Rose / Coral)
  offline: {
    badge: "bg-rose-50 text-rose-700 border-rose-200/70",
    dot: "bg-rose-500",
  },
  rejected: {
    badge: "bg-rose-50 text-rose-700 border-rose-200/70",
    dot: "bg-rose-500",
  },
  failed: {
    badge: "bg-rose-50 text-rose-700 border-rose-200/70",
    dot: "bg-rose-500",
  },
  cancelled: {
    badge: "bg-rose-50 text-rose-700 border-rose-200/70",
    dot: "bg-rose-500",
  },

  // Pending / Away / In Progress states (Amber / Orange)
  away: {
    badge: "bg-amber-50 text-amber-700 border-amber-200/70",
    dot: "bg-amber-500",
  },
  pending: {
    badge: "bg-amber-50 text-amber-700 border-amber-200/70",
    dot: "bg-amber-500",
  },
  pending_review: {
    badge: "bg-amber-50 text-amber-700 border-amber-200/70",
    dot: "bg-amber-500",
  },
  in_review: {
    badge: "bg-sky-50 text-sky-700 border-sky-200/70",
    dot: "bg-sky-500",
  },
  changes_requested: {
    badge: "bg-amber-50 text-amber-700 border-amber-200/70",
    dot: "bg-amber-500",
  },

  // Processing / Submitted / Matching states (Blue / Indigo)
  submitted: {
    badge: "bg-blue-50 text-blue-700 border-blue-200/70",
    dot: "bg-blue-500",
  },
  matching: {
    badge: "bg-indigo-50 text-indigo-700 border-indigo-200/70",
    dot: "bg-indigo-500",
  },
  assigned: {
    badge: "bg-purple-50 text-purple-700 border-purple-200/70",
    dot: "bg-purple-500",
  },

  // Neutral / Suspended states (Slate)
  paused: {
    badge: "bg-slate-100 text-slate-700 border-slate-200/70",
    dot: "bg-slate-400",
  },
  inactive: {
    badge: "bg-slate-50 text-slate-600 border-slate-200/70",
    dot: "bg-slate-400",
  },
};

const DEFAULT_CONFIG: StatusConfig = {
  badge: "bg-slate-50 text-slate-600 border-slate-200/70",
  dot: "bg-slate-400",
};

export interface BadgeProps {
  status: string;
  className?: string;
  showDot?: boolean;
  size?: "sm" | "md";
}

export function StatusBadge({ status, className, showDot = true, size = "md" }: BadgeProps) {
  const normalizedKey = status?.toLowerCase() ?? "";
  const config = STATUS_CONFIG_MAP[normalizedKey] ?? DEFAULT_CONFIG;

  const sizeClasses =
    size === "sm"
      ? "px-2 py-0.5 text-[10px] font-semibold"
      : "px-2.5 py-0.5 text-xs font-medium";

  const dotClasses =
    size === "sm"
      ? "w-1.5 h-1.5 rounded-full mr-1 shrink-0"
      : "w-1.5 h-1.5 rounded-full mr-1.5 shrink-0";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border capitalize whitespace-nowrap",
        sizeClasses,
        config.badge,
        className
      )}
    >
      {showDot && (
        <span
          className={cn(
            dotClasses,
            config.dot
          )}
        />
      )}
      {status ? status.replace(/_/g, " ") : "Unknown"}
    </span>
  );
}
