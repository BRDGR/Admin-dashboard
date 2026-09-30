"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  RefreshCw,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Copy,
  Check,
  Phone,
  MessageSquare,
} from "lucide-react";
import { AdminTopBar } from "@/components/layout";
import {
  DataTable,
  MetricCard,
  UserAvatarCell,
  TableActionButton,
  StatusBadge,
} from "@/components/ui";
import { useDemoRequests } from "@/lib/hooks/useDemoRequests";
import type { DemoRequest } from "@/lib/types";
import type { Column } from "@/components/ui";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "pending_schedule", label: "Pending" },
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function DemoRequestsPage() {
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
  } = useDemoRequests();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const handleCopyEmail = (email: string, id: string) => {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    toast.success(`Copied ${email} to clipboard`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedData = filtered.slice((page - 1) * pageSize, page * pageSize);

  const columns: Column<DemoRequest>[] = [
    {
      key: "company",
      header: "Lead & Company",
      sortable: true,
      render: (entry) => (
        <UserAvatarCell
          name={entry.companyName || "Unnamed Company"}
          subtitle={entry.email}
        />
      ),
    },
    {
      key: "contact",
      header: "Phone",
      render: (entry) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-mono">
          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
          <span>{entry.phone || "—"}</span>
        </div>
      ),
    },
    {
      key: "type",
      header: "Company Type",
      sortable: true,
      render: (entry) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/60">
          {entry.companyType || "General"}
        </span>
      ),
    },
    {
      key: "message",
      header: "Message",
      render: (entry) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600 max-w-[240px]">
          <MessageSquare className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="truncate" title={entry.message || "No message provided"}>
            {entry.message || "—"}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (entry) => <StatusBadge status={entry.status} />,
    },
    {
      key: "createdAt",
      header: "Requested",
      sortable: true,
      render: (entry) => (
        <span className="text-xs text-slate-600 font-medium whitespace-nowrap">
          {format(new Date(entry.createdAt), "MMM d, yyyy")}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (entry) => (
        <div className="flex items-center justify-end gap-1.5">
          <TableActionButton
            icon={copiedId === entry.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            label={copiedId === entry.id ? "Copied" : "Copy Email"}
            onClick={() => handleCopyEmail(entry.email, entry.id)}
            variant="outline"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminTopBar
        title="Demo Requests"
        subtitle="Manage inbound demo and consultation requests from the landing page"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Requests" value={stats.total} icon={Calendar} iconBg="bg-blue-50 text-[#0364FF]" />
        <MetricCard label="Pending" value={stats.pending_schedule} icon={Clock} iconBg="bg-amber-50 text-amber-600" />
        <MetricCard label="Scheduled" value={stats.scheduled} icon={CheckCircle2} iconBg="bg-violet-50 text-violet-600" />
        <MetricCard label="Completed" value={stats.completed} icon={XCircle} iconBg="bg-emerald-50 text-emerald-600" />
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60 overflow-x-auto">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setStatusFilter(opt.value);
                setPage(1);
              }}
              className={cn(
                "px-3.5 py-1.5 text-xs font-semibold rounded-xl capitalize transition-all cursor-pointer",
                statusFilter === opt.value
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Standardized DataTable */}
      <DataTable
        columns={columns}
        data={paginatedData}
        isLoading={isLoading}
        emptyMessage="No demo requests found."
        searchPlaceholder="Search by email, company..."
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        primaryAction={{
          label: isFetching ? "Refreshing..." : "Refresh",
          icon: <RefreshCw className={cn("w-3.5 h-3.5", isFetching && "animate-spin")} />,
          onClick: () => refetch(),
        }}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        getRowId={(r) => r.id}
        pagination={{
          currentPage: page,
          totalPages,
          totalRecords: filtered.length,
          hasNext: page < totalPages,
          hasPrev: page > 1,
          nextPage: page < totalPages ? page + 1 : null,
          prevPage: page > 1 ? page - 1 : null,
        }}
        onPageChange={setPage}
      />
    </div>
  );
}
