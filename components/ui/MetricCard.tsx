import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  trend?: { value: number; label: string };
  isLoading?: boolean;
}

export function MetricCard({ label, value, icon: Icon, iconBg, trend, isLoading }: MetricCardProps) {
  const isUp = trend && trend.value >= 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col gap-3 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", iconBg)}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className={cn(
            "inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full",
            isUp ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
          )}>
            {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isUp ? "+" : ""}{trend.value}%
          </span>
        )}
      </div>
      {isLoading ? (
        <div className="space-y-2">
          <div className="h-7 w-20 bg-slate-100 rounded-lg animate-pulse" />
          <div className="h-3 w-24 bg-slate-100 rounded-full animate-pulse" />
        </div>
      ) : (
        <div>
          <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
          <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          {trend && <p className="text-[10px] text-slate-400 mt-1">{trend.label}</p>}
        </div>
      )}
    </div>
  );
}
