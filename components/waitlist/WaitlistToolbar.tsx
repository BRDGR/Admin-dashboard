"use client";

import { Search, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

const STATUS_FILTERS = ["all", "pending", "approved", "rejected"] as const;

interface WaitlistToolbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: string;
  onStatusChange: (v: string) => void;
  onRefresh: () => void;
  onExport: () => void;
  isFetching: boolean;
  exportDisabled: boolean;
}

export function WaitlistToolbar({
  search, onSearchChange,
  statusFilter, onStatusChange,
  onRefresh, onExport,
  isFetching, exportDisabled,
}: WaitlistToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
      {/* Search */}
      <div className="flex items-center gap-2 bg-[#F4F6F9] border border-slate-200/80 rounded-full px-3.5 h-9 w-full sm:w-64 focus-within:ring-2 focus-within:ring-[#0364FF]/20 focus-within:border-[#0364FF] transition-all">
        <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search name, email, company..."
          className="flex-1 text-xs bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
        />
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Status filter pills */}
        <div className="flex items-center gap-1 bg-slate-100 rounded-full p-1">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => onStatusChange(s)}
              className={cn(
                "px-3 py-1 rounded-full text-[11px] font-medium capitalize transition-all cursor-pointer",
                statusFilter === s
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Refresh */}
        <Button
          variant="secondary"
          size="icon"
          onClick={onRefresh}
          title="Refresh"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", isFetching && "animate-spin")} />
        </Button>

        {/* Export */}
        <Button onClick={onExport} disabled={exportDisabled}>
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Export CSV
        </Button>
      </div>
    </div>
  );
}
