"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Copy, Check, Building2 } from "lucide-react";
import {
  DataTable,
  UserAvatarCell,
  TableActionButton,
  StatusBadge,
  type Column,
} from "@/components/ui";
import type { WaitlistEntry } from "@/lib/types";
import { toast } from "sonner";

interface WaitlistTableProps {
  entries: WaitlistEntry[];
  totalCount: number;
  isLoading: boolean;
  search?: string;
  onSearchChange?: (val: string) => void;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  page?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
}

export function WaitlistTable({
  entries,
  totalCount,
  isLoading,
  search,
  onSearchChange,
  selectedIds = [],
  onSelectionChange,
  page = 1,
  onPageChange,
  pageSize = 10,
  primaryAction,
}: WaitlistTableProps) {
  const [internalSelected, setInternalSelected] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeSelected = onSelectionChange ? selectedIds : internalSelected;
  const handleSelection = onSelectionChange || setInternalSelected;

  const handleCopy = (email: string, id: string) => {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    toast.success(`Copied ${email} to clipboard`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const totalPages = Math.max(1, Math.ceil(entries.length / pageSize));
  const paginatedData = onPageChange
    ? entries
    : entries.slice((page - 1) * pageSize, page * pageSize);

  const columns: Column<WaitlistEntry>[] = [
    {
      key: "name",
      header: "Lead & Email",
      sortable: true,
      render: (entry) => (
        <UserAvatarCell
          name={entry.fullName || "Unnamed"}
          subtitle={entry.email}
        />
      ),
    },
    {
      key: "role",
      header: "Role / Type",
      sortable: true,
      render: (entry) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 capitalize border border-slate-200/60">
          {entry.role || "Partner"}
        </span>
      ),
    },
    {
      key: "company",
      header: "Company",
      sortable: true,
      render: (entry) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-700">
          {entry.company ? (
            <>
              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-medium">{entry.company}</span>
            </>
          ) : (
            <span className="text-slate-400">—</span>
          )}
        </div>
      ),
    },
    {
      key: "lookingFor",
      header: "Looking For",
      render: (entry) => (
        <span className="text-xs text-slate-600 max-w-[200px] truncate block" title={entry.lookingFor || ""}>
          {entry.lookingFor || "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (entry) => <StatusBadge status={entry.status} />,
    },
    {
      key: "createdAt",
      header: "Joined",
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
            onClick={() => handleCopy(entry.email, entry.id)}
            variant="outline"
          />
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={paginatedData}
      isLoading={isLoading}
      emptyMessage={totalCount === 0 ? "No waitlist entries yet." : "No waitlist signups match your search."}
      searchPlaceholder="Search name, email, company..."
      searchValue={search}
      onSearchChange={onSearchChange}
      primaryAction={primaryAction}
      selectable
      selectedIds={activeSelected}
      onSelectionChange={handleSelection}
      getRowId={(r) => r.id}
      pagination={{
        currentPage: page,
        totalPages,
        totalRecords: totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
      }}
      onPageChange={onPageChange}
    />
  );
}
