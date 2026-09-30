"use client";

import { useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import { AdminTopBar } from "@/components/layout";
import { WaitlistStats, WaitlistTable } from "@/components/waitlist";
import { TableActionButton } from "@/components/ui";
import { useWaitlist } from "@/lib/hooks/useWaitlist";
import { exportWaitlistCSV } from "@/lib/export";
import { cn } from "@/lib/utils";

const STATUS_FILTERS = ["all", "pending", "approved", "rejected"] as const;

export default function WaitlistPage() {
  const {
    filtered,
    stats,
    isLoading,
    isFetching,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    refetch,
  } = useWaitlist();

  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  return (
    <div className="space-y-6">
      <AdminTopBar
        title="Waitlist Management"
        subtitle="Review, approve, and export early-access signups and leads"
      />

      <WaitlistStats {...stats} />

      {/* Action Header with Filters & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60 overflow-x-auto">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatusFilter(s);
                setPage(1);
              }}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer",
                statusFilter === s
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <TableActionButton
            icon={<RefreshCw className={cn("w-3.5 h-3.5", isFetching && "animate-spin")} />}
            label={isFetching ? "Refreshing..." : "Refresh"}
            onClick={() => refetch()}
            variant="outline"
          />
          <TableActionButton
            icon={<Download className="w-3.5 h-3.5" />}
            label="Export CSV"
            onClick={() => exportWaitlistCSV(filtered)}
            disabled={filtered.length === 0}
            variant="primary"
          />
        </div>
      </div>

      {/* Main Standardized Table */}
      <WaitlistTable
        entries={filtered}
        totalCount={stats.total}
        isLoading={isLoading}
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        page={page}
        onPageChange={setPage}
      />
    </div>
  );
}
