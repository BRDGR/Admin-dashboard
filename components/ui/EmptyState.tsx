import { Construction } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export function EmptyState({ title, description, icon: Icon = Construction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
        <Icon className="w-6 h-6 text-slate-400" />
      </div>
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      {description && <p className="text-xs text-slate-400">{description}</p>}
    </div>
  );
}
