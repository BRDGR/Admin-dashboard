import { cn } from "@/lib/utils";

const STATUS_MAP: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  pending_review: "bg-amber-50 text-amber-700 border-amber-200",
  in_review: "bg-sky-50 text-sky-700 border-sky-200",
  submitted: "bg-blue-50 text-blue-700 border-blue-200",
  matching: "bg-indigo-50 text-indigo-700 border-indigo-200",
  assigned: "bg-purple-50 text-purple-700 border-purple-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  verified: "bg-emerald-50 text-emerald-700 border-emerald-200",
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed: "bg-teal-50 text-teal-700 border-teal-200",
  changes_requested: "bg-orange-50 text-orange-700 border-orange-200",
  rejected: "bg-rose-50 text-rose-700 border-rose-200",
  failed: "bg-rose-50 text-rose-700 border-rose-200",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200",
  paused: "bg-slate-100 text-slate-700 border-slate-300",
  inactive: "bg-slate-50 text-slate-600 border-slate-200",
};

interface BadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: BadgeProps) {
  const normalizedKey = status?.toLowerCase() ?? "";
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border capitalize",
        STATUS_MAP[normalizedKey] ?? "bg-slate-50 text-slate-600 border-slate-200",
        className
      )}
    >
      {status ? status.replace(/_/g, " ") : "Unknown"}
    </span>
  );
}
