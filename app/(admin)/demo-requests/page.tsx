"use client";

import { format } from "date-fns";
import { RefreshCw, Calendar, CheckCircle2, Clock, XCircle } from "lucide-react";
import { AdminTopBar } from "@/components/layout";
import { SectionCard, StatCard, StatusBadge } from "@/components/ui";
import { useDemoRequests } from "@/lib/hooks/useDemoRequests";

const STATUS_OPTIONS = [
  { value: "all",              label: "All" },
  { value: "pending_schedule", label: "Pending" },
  { value: "scheduled",        label: "Scheduled" },
  { value: "completed",        label: "Completed" },
  { value: "cancelled",        label: "Cancelled" },
];

const COLUMNS = ["Email", "Phone", "Company", "Type", "Message", "Status", "Requested"];

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-50">
      {COLUMNS.map((c) => (
        <td key={c} className="px-5 py-3.5">
          <div className="h-3.5 bg-slate-100 rounded-full animate-pulse w-24" />
        </td>
      ))}
    </tr>
  );
}

export default function DemoRequestsPage() {
  const {
    filtered, stats,
    isLoading, isFetching,
    search, setSearch,
    statusFilter, setStatusFilter,
    refetch,
  } = useDemoRequests();

  return (
    <div className="space-y-6">
      <AdminTopBar />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Requests"  value={stats.total}            icon={Calendar}      iconClass="bg-blue-50 text-[#0364FF]" />
        <StatCard label="Pending"         value={stats.pending_schedule} icon={Clock}         iconClass="bg-amber-50 text-amber-600" />
        <StatCard label="Scheduled"       value={stats.scheduled}        icon={CheckCircle2}  iconClass="bg-violet-50 text-violet-600" />
        <StatCard label="Completed"       value={stats.completed}        icon={XCircle}       iconClass="bg-green-50 text-green-600" />
      </div>

      {/* Table */}
      <SectionCard
        title="Demo Requests"
        subtitle="Submitted via the landing page"
        action={
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 text-[11px] text-[#0364FF] font-semibold hover:underline disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </button>
        }
      >
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 px-5 py-3 border-b border-slate-100">
          <input
            type="text"
            placeholder="Search by email, company…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 h-9 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0364FF] transition-colors"
          />
          <div className="flex gap-1.5 flex-wrap">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  statusFilter === opt.value
                    ? "bg-[#0364FF] text-white border-[#0364FF]"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                {COLUMNS.map((h) => (
                  <th key={h} className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-5 py-3 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={COLUMNS.length} className="px-5 py-16 text-center text-sm text-slate-400">
                    No demo requests found.
                  </td>
                </tr>
              ) : (
                filtered.map((entry) => (
                  <tr key={entry.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 text-slate-700 text-xs">{entry.email}</td>
                    <td className="px-5 py-3.5 text-slate-600 text-xs">{entry.phone}</td>
                    <td className="px-5 py-3.5 font-medium text-slate-900 text-xs whitespace-nowrap">{entry.companyName}</td>
                    <td className="px-5 py-3.5 text-slate-600 text-xs">{entry.companyType}</td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs max-w-[180px] truncate">{entry.message || "—"}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={entry.status} />
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs whitespace-nowrap">
                      {format(new Date(entry.createdAt), "MMM d, yyyy")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {!isLoading && filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/40">
              <p className="text-[11px] text-slate-400">
                Showing <span className="font-semibold text-slate-600">{filtered.length}</span> requests
              </p>
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
