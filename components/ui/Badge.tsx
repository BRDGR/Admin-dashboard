import { cn } from "@/lib/utils";

const STATUS_MAP: Record<string, string> = {
  pending:   "bg-amber-50 text-amber-700 border-amber-200",
  approved:  "bg-green-50 text-green-700 border-green-200",
  verified:  "bg-green-50 text-green-700 border-green-200",
  rejected:  "bg-red-50 text-red-700 border-red-200",
  failed:    "bg-red-50 text-red-700 border-red-200",
  active:    "bg-blue-50 text-blue-700 border-blue-200",
  inactive:  "bg-slate-50 text-slate-600 border-slate-200",
};

interface BadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border capitalize",
        STATUS_MAP[status] ?? "bg-slate-50 text-slate-600 border-slate-200",
        className
      )}
    >
      {status}
    </span>
  );
}
