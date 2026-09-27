import { cn } from "@/lib/utils";

interface SectionCardProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function SectionCard({ title, subtitle, action, children, className }: SectionCardProps) {
  return (
    <div className={cn("bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden", className)}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <p className="text-sm font-bold text-slate-900">{title}</p>
          {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}
