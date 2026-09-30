"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  FileCheck,
} from "lucide-react";
import { format } from "date-fns";
import { AdminTopBar } from "@/components/layout";
import {
  DataTable,
  MetricCard,
  UserAvatarCell,
  TableActionButton,
  StatusBadge,
} from "@/components/ui";
import { listPendingChanges } from "@/lib/api/admin.api";
import type { PendingChangeItem } from "@/lib/types";
import type { Column } from "@/components/ui";
import { ReviewPendingChangeModal } from "./_components/ReviewPendingChangeModal";
import { cn } from "@/lib/utils";

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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin", "pending-changes", page, statusFilter],
    queryFn: async () => {
      const res = await listPendingChanges({
        page,
        limit: 15,
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      return res.data?.data ?? null;
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
      sortable: true,
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
      sortable: true,
      render: (change) => (
        change.requester ? (
          <UserAvatarCell
            name={`${change.requester.firstName} ${change.requester.lastName}`}
            subtitle={change.requester.email}
          />
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center shrink-0">
              SA
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">System Admin</p>
              <p className="text-[11px] text-slate-400">Automated Mutation</p>
            </div>
          </div>
        )
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (change) => <StatusBadge status={change.status} />,
    },
    {
      key: "createdAt",
      header: "Submitted",
      sortable: true,
      render: (change) => (
        <div className="text-xs text-slate-500 space-y-0.5">
          <p className="font-medium text-slate-700">{format(new Date(change.createdAt), "MMM d, yyyy")}</p>
          <p className="text-[10px] text-slate-400 font-mono">{format(new Date(change.createdAt), "HH:mm:ss")}</p>
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (change) => (
        <div className="flex items-center justify-end gap-1.5">
          <TableActionButton
            icon={
              change.status === "pending" ? (
                <ShieldAlert className="w-3.5 h-3.5" />
              ) : (
                <Eye className="w-3.5 h-3.5" />
              )
            }
            label={change.status === "pending" ? "Review" : "View"}
            onClick={() => setSelectedChange(change)}
            variant={change.status === "pending" ? "primary" : "outline"}
          />
        </div>
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

      {/* Filter Chips Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60 overflow-x-auto">
          {(["all", "pending", "approved", "rejected"] as const).map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              className={cn(
                "px-3.5 py-1.5 text-xs font-semibold rounded-xl capitalize transition-all cursor-pointer",
                statusFilter === st
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={filteredChanges}
        isLoading={isLoading}
        emptyMessage="No pending changes waiting for review."
        searchPlaceholder="Search by route, method, or requester..."
        searchValue={search}
        onSearchChange={setSearch}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        getRowId={(r) => r.id}
        pagination={pagination}
        onPageChange={setPage}
      />

      {/* Review Modal */}
      <ReviewPendingChangeModal
        change={selectedChange}
        onClose={() => setSelectedChange(null)}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
