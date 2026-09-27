import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
}

export function StatCard({ label, value, icon: Icon, iconClass }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-4">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", iconClass)}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-xs text-slate-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}
