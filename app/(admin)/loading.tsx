import { Loader2 } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-7 h-7 animate-spin text-[#0364FF]" />
      <p className="text-xs font-medium text-slate-400">Loading module data…</p>
    </div>
  );
}
