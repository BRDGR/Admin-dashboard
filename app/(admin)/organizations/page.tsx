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
  TruncatedText,
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
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0364FF] flex items-center justify-center shrink-0 border border-blue-100/60 font-bold text-xs">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <TruncatedText
              text={organization.name}
              maxWidth="max-w-[220px]"
              label="Organization Name"
              className="font-bold text-sm text-slate-900 leading-tight"
            />
            <TruncatedText
              text={organization.email}
              maxWidth="max-w-[220px]"
              label="Corporate Email"
              className="text-xs text-slate-500 mt-0.5 leading-tight"
            />
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: ({ organization }) => (
        <span className="text-xs font-semibold text-slate-700 capitalize bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60">
          {organization.companyType ?? "—"}
        </span>
      ),
    },
    {
      key: "country",
      header: "Jurisdiction",
      render: ({ organization }) => (
        <span className="text-sm text-slate-700 font-medium truncate max-w-[140px] block">{organization.country ?? "—"}</span>
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
          <StatusBadge status={record.organization.status ?? "pending"} size="md" />
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
        <div className="min-w-0">
          <TruncatedText
            text={`${owner.firstName} ${owner.lastName}`}
            maxWidth="max-w-[180px]"
            label="Owner Name"
            className="text-sm font-semibold text-slate-800 leading-tight"
          />
          <TruncatedText
            text={owner.email}
            maxWidth="max-w-[180px]"
            label="Owner Email"
            className="text-xs text-slate-500 mt-0.5 leading-tight"
          />
        </div>
      ),
    },
    {
      key: "created",
      header: "Created",
      render: ({ organization }) => (
        <span className="text-[11px] text-slate-500 whitespace-nowrap">
          {organization.createdAt ? format(new Date(organization.createdAt), "MMM d, yyyy") : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (record) => (
        <div className="flex items-center justify-end gap-1.5">
          <TableActionButton
            icon={<SlidersHorizontal className="w-3 h-3" />}
            label="Status"
            onClick={() => onEditStatus(record)}
            size="sm"
          />
          <TableActionButton
            icon={<Eye className="w-3 h-3" />}
            label="View"
            onClick={() => router.push(`/organizations/${record.organization.id}`)}
            size="sm"
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
        searchPlaceholder="Search Organizations by name, email, jurisdiction..."
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
