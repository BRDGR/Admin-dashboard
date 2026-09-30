"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Building2, Eye, SlidersHorizontal } from "lucide-react";
import { AdminTopBar } from "@/components/layout";
import {
  DataTable,
  StatusBadge,
  TableActionButton,
  type Column,
} from "@/components/ui";
import { useQueryClient } from "@tanstack/react-query";
import { useOrganizations } from "@/lib/hooks/useOrganizations";
import type { OrganizationRecord } from "@/lib/types";
import { UpdateOrgStatusModal } from "./_components/UpdateOrgStatusModal";

function useColumns(onEditStatus: (record: OrganizationRecord) => void): Column<OrganizationRecord>[] {
  const router = useRouter();
  return [
    {
      key: "name",
      header: "Organization",
      render: ({ organization }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0364FF] flex items-center justify-center shrink-0 border border-blue-100/60 font-bold text-xs">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 leading-tight">{organization.name}</p>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[180px] leading-tight">
              {organization.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: ({ organization }) => (
        <span className="text-xs font-medium text-slate-700 capitalize bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60">
          {organization.companyType ?? "—"}
        </span>
      ),
    },
    {
      key: "country",
      header: "Jurisdiction",
      render: ({ organization }) => (
        <span className="text-xs text-slate-600 font-medium">{organization.country ?? "—"}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (record) => (
        <button
          type="button"
          onClick={() => onEditStatus(record)}
          title="Click to update status"
          className="cursor-pointer hover:opacity-80 transition-opacity"
        >
          <StatusBadge status={record.organization.status ?? "pending"} />
        </button>
      ),
    },
    {
      key: "verified",
      header: "Verified",
      render: (record) => (
        <button
          type="button"
          onClick={() => onEditStatus(record)}
          title="Click to toggle verification"
          className={`text-xs font-semibold cursor-pointer hover:underline ${
            record.organization.isVerified ? "text-emerald-600" : "text-slate-400"
          }`}
        >
          {record.organization.isVerified ? "Verified" : "Unverified"}
        </button>
      ),
    },
    {
      key: "owner",
      header: "Owner",
      render: ({ owner }) => (
        <div>
          <p className="text-xs font-semibold text-slate-800 leading-tight">
            {owner.firstName} {owner.lastName}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">{owner.email}</p>
        </div>
      ),
    },
    {
      key: "created",
      header: "Created",
      render: ({ organization }) => (
        <span className="text-xs text-slate-500 whitespace-nowrap">
          {organization.createdAt ? format(new Date(organization.createdAt), "MMM d, yyyy") : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (record) => (
        <div className="flex items-center justify-end gap-2">
          <TableActionButton
            icon={<SlidersHorizontal className="w-3.5 h-3.5" />}
            label="Status"
            onClick={() => onEditStatus(record)}
          />
          <TableActionButton
            icon={<Eye className="w-3.5 h-3.5" />}
            label="View"
            onClick={() => router.push(`/organizations/${record.organization.id}`)}
          />
        </div>
      ),
    },
  ];
}

export default function OrganizationsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const qc = useQueryClient();
  const [editingOrg, setEditingOrg] = useState<OrganizationRecord | null>(null);

  const { data, isLoading } = useOrganizations(page, pageSize);
  const columns = useColumns((rec) => setEditingOrg(rec));
  const orgs = data?.organizations ?? [];
  const pagination = data?.pagination;

  const filteredOrgs = useMemo(() => {
    if (!searchQuery.trim()) return orgs;
    const s = searchQuery.toLowerCase();
    return orgs.filter((o) => {
      const name = (o.organization?.name ?? "").toLowerCase();
      const email = (o.organization?.email ?? "").toLowerCase();
      const country = (o.organization?.country ?? "").toLowerCase();
      const owner = `${o.owner?.firstName ?? ""} ${o.owner?.lastName ?? ""}`.toLowerCase();
      return name.includes(s) || email.includes(s) || country.includes(s) || owner.includes(s);
    });
  }, [orgs, searchQuery]);

  return (
    <div className="space-y-6">
      <AdminTopBar title="Organizations" subtitle="Client organizations registered on the platform" />

      <DataTable
        columns={columns}
        data={filteredOrgs}
        isLoading={isLoading}
        emptyMessage="No organizations found."
        selectable={true}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        getRowId={(r) => r.organization.id}
        itemLabel="Organizations"
        searchPlaceholder="Search Organizations"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        showFilterButton={true}
        onFilterClick={() => {}}
        pagination={pagination}
        onPageChange={setPage}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
      />

      <UpdateOrgStatusModal
        record={editingOrg}
        onClose={() => setEditingOrg(null)}
        onSuccess={() => {
          qc.invalidateQueries({ queryKey: ["admin", "organizations"] });
        }}
      />
    </div>
  );
}
