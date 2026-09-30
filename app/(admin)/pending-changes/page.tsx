
"use client";

import { useState, useMemo, useEffect } from "react";
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
  TruncatedText,
  JsonPreviewCell,
} from "@/components/ui";
import { listPendingChanges } from "@/lib/api/admin.api";
import { logger } from "@/lib/logger";
import type { PendingChangeItem, Pagination } from "@/lib/types";
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
      logger.debug("[MakerChecker:API] Calling listPendingChanges with params:", {
        page,
        limit: 15,
        statusFilter,
      });

      const res = await listPendingChanges({
        page,
        limit: 15,
        status: statusFilter === "all" ? undefined : statusFilter,
      });

      logger.debug("[MakerChecker:API] Raw response from /admin/pending-changes:", res);

      if (!res.ok) {
        logger.error("[MakerChecker:API] Fetch failed with status", res.status, ":", {
          error: res.error,
          data: res.data,
        });
        return { pendingChanges: [], pagination: undefined };
      }

      // Handle envelope variations matching Apidog:
      // 1. Standard Apidog: { error: false, message: "...", data: { pendingChanges: [...], pagination: {...} } }
      // 2. Direct object: { pendingChanges: [...], pagination: {...} }
      // 3. Array wrapped in data: { data: [...] }
      const body = res.data;
      const innerData = (body as any)?.data ?? body;

      let pendingChanges: PendingChangeItem[] = [];
      if (Array.isArray(innerData)) {
        pendingChanges = innerData;
      } else if (innerData && Array.isArray(innerData.pendingChanges)) {
        pendingChanges = innerData.pendingChanges;
      } else if (innerData && Array.isArray(innerData.records)) {
        pendingChanges = innerData.records;
      } else if (body && Array.isArray((body as any).pendingChanges)) {
        pendingChanges = (body as any).pendingChanges;
      }

      const pagination: Pagination | undefined =
        innerData?.pagination ?? (body as any)?.pagination;

      logger.debug("[MakerChecker:Data] Successfully extracted items:", {
        count: pendingChanges.length,
        pagination,
        pendingChanges,
      });

      return { pendingChanges, pagination };
    },
  });

  const changes: PendingChangeItem[] = useMemo(() => {
    return data?.pendingChanges ?? [];
  }, [data]);

  const pagination = data?.pagination;

  // Filter by status tab (client fallback if server returns all records) and search term
  const filteredChanges = useMemo(() => {
    const list = changes.filter((c) => {
      // 1. Status Filter fallback
      if (statusFilter !== "all") {
        const itemStatus = (c.status || "").toLowerCase();
        if (itemStatus !== statusFilter.toLowerCase()) return false;
      }

      // 2. Search query filter
      if (!search.trim()) return true;
      const query = search.toLowerCase();
      const route = c.routeKey?.toLowerCase() || "";
      const method = c.method?.toLowerCase() || "";
      const id = c.id?.toLowerCase() || "";
      const requester = c.requester
        ? `${c.requester.firstName} ${c.requester.lastName} ${c.requester.email}`.toLowerCase()
        : "";
      return (
        route.includes(query) ||
        method.includes(query) ||
        id.includes(query) ||
        requester.includes(query)
      );
    });

    logger.debug("[MakerChecker:Render] Filtered items calculated:", {
      totalFetched: changes.length,
      statusFilter,
      searchQuery: search,
      matchedCount: list.length,
    });

    return list;
  }, [changes, statusFilter, search]);

  // Calculate metrics
  const totalCount = pagination?.totalRecords ?? changes.length;
  const pendingCount = changes.filter((c) => (c.status || "").toLowerCase() === "pending").length;
  const approvedCount = changes.filter((c) => (c.status || "").toLowerCase() === "approved").length;
  const rejectedCount = changes.filter((c) => (c.status || "").toLowerCase() === "rejected").length;

  useEffect(() => {
    logger.debug("[MakerChecker:PageStatus] State summary:", {
      page,
      statusFilter,
      totalCount,
      pendingCount,
      approvedCount,
      rejectedCount,
      isLoading,
    });
  }, [page, statusFilter, totalCount, pendingCount, approvedCount, rejectedCount, isLoading]);

  const columns: Column<PendingChangeItem>[] = useMemo(
    () => [
      {
        key: "operation",
        header: "Operation / Route",
        sortable: true,
        render: (change) => {
          const method = change.method || "MUTATION";
          const badgeColor = METHOD_COLORS[method] || "bg-slate-100 text-slate-700 border-slate-200";
          return (
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase leading-none ${badgeColor}`}>
                  {method}
                </span>
                <TruncatedText
                  text={change.routeKey || change.id}
                  maxWidth="max-w-[340px]"
                  mono
                  label="API Route"
                />
              </div>
              {change.urlParams && Object.keys(change.urlParams).length > 0 && (
                <JsonPreviewCell
                  data={change.urlParams}
                  label="URL Parameters"
                  maxWidth="max-w-[320px]"
                />
              )}
            </div>
          );
        },
      },
      {
        key: "requester",
        header: "Requester",
        sortable: true,
        render: (change) =>
          change.requester ? (
            <UserAvatarCell
              name={`${change.requester.firstName} ${change.requester.lastName}`}
              subtitle={change.requester.email}
              size="md"
            />
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0">
                SA
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 leading-tight">System Admin</p>
                <p className="text-xs text-slate-400 leading-tight mt-0.5">Automated</p>
              </div>
            </div>
          ),
      },
      {
        key: "status",
        header: "Status",
        render: (change) => <StatusBadge status={change.status} size="md" />,
      },
      {
        key: "createdAt",
        header: "Submitted",
        sortable: true,
        render: (change) => (
          <div className="text-sm text-slate-600 space-y-0.5">
            <p className="font-medium text-slate-800">{format(new Date(change.createdAt), "MMM d, yyyy")}</p>
            <p className="text-xs text-slate-400 font-mono">{format(new Date(change.createdAt), "HH:mm:ss")}</p>
          </div>
        ),
      },
      {
        key: "actions",
        header: "",
        align: "right",
        render: (change) => (
          <div className="flex items-center justify-end gap-2">
            <TableActionButton
              icon={
                change.status === "pending" ? (
                  <ShieldAlert className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )
              }
              label={change.status === "pending" ? "Review" : "View"}
              onClick={() => {
                console.log("[MakerChecker] Selected change for review/view:", change);
                setSelectedChange(change);
              }}
              variant={change.status === "pending" ? "primary" : "outline"}
              size="md"
            />
          </div>
        ),
      },
    ],
    []
  );

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
                console.log("[MakerChecker:Filter] Tab switched to:", st);
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
        emptyMessage={
          search
            ? `No changes found matching "${search}".`
            : statusFilter === "pending"
            ? "No pending changes waiting for review."
            : statusFilter === "approved"
            ? "No approved changes on record."
            : statusFilter === "rejected"
            ? "No rejected changes on record."
            : "No change records found."
        }
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
        onSuccess={() => {
          console.log("[MakerChecker] Review completed, invalidating & refetching queue...");
          refetch();
        }}
      />
    </div>
  );
}
