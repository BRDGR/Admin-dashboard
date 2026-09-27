"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ShieldAlert,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  FileCheck,
} from "lucide-react";
import { format } from "date-fns";
import { AdminTopBar } from "@/components/layout";
import { SectionCard, DataTable, MetricCard, Pagination, EmptyState } from "@/components/ui";
import { listPendingChanges } from "@/lib/api/admin.api";
import type { PendingChangeItem } from "@/lib/types";
import type { Column } from "@/components/ui";
import { ReviewPendingChangeModal } from "./_components/ReviewPendingChangeModal";

const METHOD_COLORS: Record<string, string> = {
  PATCH: "bg-amber-50 text-amber-700 border-amber-200",
  POST: "bg-blue-50 text-blue-700 border-blue-200",
  PUT: "bg-indigo-50 text-indigo-700 border-indigo-200",
  DELETE: "bg-red-50 text-red-700 border-red-200",
};

export default function PendingChangesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [selectedChange, setSelectedChange] = useState<PendingChangeItem | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin", "pending-changes", page, statusFilter],
    queryFn: async () => {
      const res = await listPendingChanges({
        page,
        limit: 15,
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      return res.data?.data;
    },
  });

  const changes: PendingChangeItem[] = data?.pendingChanges ?? [];
  const pagination = data?.pagination;

  // Filter by search term
  const filteredChanges = changes.filter((c) => {
    if (!search) return true;
    const query = search.toLowerCase();
    const route = c.routeKey?.toLowerCase() || "";
    const method = c.method?.toLowerCase() || "";
    const requester = c.requester
      ? `${c.requester.firstName} ${c.requester.lastName} ${c.requester.email}`.toLowerCase()
      : "";
    return route.includes(query) || method.includes(query) || requester.includes(query);
  });

  // Calculate metrics
  const totalCount = pagination?.totalRecords ?? changes.length;
  const pendingCount = changes.filter((c) => c.status === "pending").length;
  const approvedCount = changes.filter((c) => c.status === "approved").length;
  const rejectedCount = changes.filter((c) => c.status === "rejected").length;

  const columns: Column<PendingChangeItem>[] = [
    {
      key: "operation",
      header: "Operation / Route",
      render: (change) => {
        const method = change.method || "MUTATION";
        const badgeColor = METHOD_COLORS[method] || "bg-slate-100 text-slate-700 border-slate-200";
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${badgeColor}`}>
                {method}
              </span>
              <span className="text-xs font-semibold text-slate-800 font-mono">
                {change.routeKey || change.id}
              </span>
            </div>
            {change.urlParams && Object.keys(change.urlParams).length > 0 && (
              <p className="text-[11px] text-slate-400 font-mono truncate max-w-[280px]">
                Params: {JSON.stringify(change.urlParams)}
              </p>
            )}
          </div>
        );
      },
    },
    {
      key: "requester",
      header: "Requester",
      render: (change) => (
        <div>
          {change.requester ? (
            <>
              <p className="text-xs font-medium text-slate-800">
                {change.requester.firstName} {change.requester.lastName}
              </p>
              <p className="text-[10px] text-slate-400">{change.requester.email}</p>
            </>
          ) : (
            <span className="text-xs text-slate-500">System Admin</span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (change) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
            change.status === "pending"
              ? "bg-amber-50 text-amber-700 border-amber-200"
              : change.status === "approved"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          {change.status}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Submitted",
      render: (change) => (
        <div className="text-xs text-slate-500 space-y-0.5">
          <p>{format(new Date(change.createdAt), "MMM d, yyyy")}</p>
          <p className="text-[10px] text-slate-400">{format(new Date(change.createdAt), "HH:mm:ss")}</p>
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (change) => (
        <button
          onClick={() => setSelectedChange(change)}
          className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
            change.status === "pending"
              ? "bg-[#0364FF] text-white hover:bg-[#0256DC]"
              : "text-[#0364FF] hover:bg-blue-50"
          }`}
        >
          {change.status === "pending" ? "Review" : "View"}
          <ArrowRight className="w-3 h-3" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminTopBar
        title="Maker-Checker Approval Queue"
        subtitle="Review and authorize sensitive administrative operations and role mutations"
      />

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Pending Approvals"
          value={pendingCount}
          icon={Clock}
          iconBg="bg-amber-50 text-amber-600"
        />
        <MetricCard
          label="Approved Changes"
          value={approvedCount}
          icon={CheckCircle2}
          iconBg="bg-emerald-50 text-emerald-600"
        />
        <MetricCard
          label="Rejected Changes"
          value={rejectedCount}
          icon={XCircle}
          iconBg="bg-red-50 text-red-600"
        />
        <MetricCard
          label="Total Audit Records"
          value={totalCount}
          icon={FileCheck}
          iconBg="bg-blue-50 text-[#0364FF]"
        />
      </div>

      {/* Main Table Card */}
      <SectionCard
        title="Change Queue"
        subtitle={`${filteredChanges.length} items`}
      >
        {/* Controls bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by route, method, requester..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0364FF]/20 focus:border-[#0364FF]"
            />
          </div>

          <div className="flex items-center gap-1 self-start sm:self-auto">
            {(["all", "pending", "approved", "rejected"] as const).map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setPage(1);
                }}
                className={`px-3 py-1 text-xs font-medium rounded-lg capitalize transition-colors ${
                  statusFilter === st
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {filteredChanges.length === 0 && !isLoading ? (
          <EmptyState
            icon={ShieldAlert}
            title="No change requests found"
            description={
              statusFilter === "pending"
                ? "No pending mutations are waiting for maker-checker approval."
                : "No matching audit items found for the selected status."
            }
          />
        ) : (
          <>
            <DataTable
              columns={columns}
              data={filteredChanges}
              isLoading={isLoading}
              emptyMessage="No pending changes."
            />
            {pagination && (
              <div className="mt-4">
                <Pagination pagination={pagination} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </SectionCard>

      {/* Review Modal */}
      <ReviewPendingChangeModal
        change={selectedChange}
        onClose={() => setSelectedChange(null)}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
