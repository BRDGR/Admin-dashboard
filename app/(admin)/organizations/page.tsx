"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Building2 } from "lucide-react";
import { AdminTopBar } from "@/components/layout";
import { SectionCard, DataTable, StatusBadge, Pagination, EmptyState } from "@/components/ui";
import { useQueryClient } from "@tanstack/react-query";
import { useOrganizations } from "@/lib/hooks/useOrganizations";
import type { OrganizationRecord } from "@/lib/types";
import type { Column } from "@/components/ui";
import { UpdateOrgStatusModal } from "./_components/UpdateOrgStatusModal";

function useColumns(onEditStatus: (record: OrganizationRecord) => void): Column<OrganizationRecord>[] {
  const router = useRouter();
  return [
  {
    key: "name", header: "Organization",
    render: ({ organization }) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
          <Building2 className="w-4 h-4 text-slate-400" />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-slate-900">{organization.name}</p>
          <p className="text-[10px] text-slate-400 truncate max-w-[180px]">{organization.email}</p>
        </div>
      </div>
    ),
  },
  {
    key: "type", header: "Type",
    render: ({ organization }) => (
      <span className="text-xs text-slate-600 capitalize">{organization.companyType ?? "—"}</span>
    ),
  },
  {
    key: "country", header: "Country",
    render: ({ organization }) => (
      <span className="text-xs text-slate-600">{organization.country ?? "—"}</span>
    ),
  },
  {
    key: "status", header: "Status",
    render: (record) => (
      <button
        onClick={() => onEditStatus(record)}
        title="Click to update status"
        className="cursor-pointer hover:opacity-80 transition-opacity"
      >
        <StatusBadge status={record.organization.status ?? "pending"} />
      </button>
    ),
  },
  {
    key: "verified", header: "Verified",
    render: (record) => (
      <button
        onClick={() => onEditStatus(record)}
        title="Click to toggle verification"
        className={`text-xs font-semibold cursor-pointer hover:underline ${
          record.organization.isVerified ? "text-green-600" : "text-slate-400"
        }`}
      >
        {record.organization.isVerified ? "Yes" : "No"}
      </button>
    ),
  },
  {
    key: "owner", header: "Owner",
    render: ({ owner }) => (
      <div>
        <p className="text-[12px] font-medium text-slate-800">{owner.firstName} {owner.lastName}</p>
        <p className="text-[10px] text-slate-400">{owner.email}</p>
      </div>
    ),
  },
  {
    key: "created", header: "Created",
    render: ({ organization }) => (
      <span className="text-xs text-slate-400">
        {organization.createdAt ? format(new Date(organization.createdAt), "MMM d, yyyy") : "—"}
      </span>
    ),
  },
  {
    key: "action", header: "",
    render: (record) => (
      <div className="flex items-center gap-3">
        <button
          onClick={() => onEditStatus(record)}
          className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          Status
        </button>
        <button
          onClick={() => router.push(`/organizations/${record.organization.id}`)}
          className="text-[11px] font-semibold text-[#0364FF] hover:underline cursor-pointer"
        >
          View →
        </button>
      </div>
    ),
  },
  ];
}

export default function OrganizationsPage() {
  const [page, setPage] = useState(1);
  const qc = useQueryClient();
  const [editingOrg, setEditingOrg] = useState<OrganizationRecord | null>(null);
  const { data, isLoading } = useOrganizations(page, 10);
  const columns = useColumns((rec) => setEditingOrg(rec));
  const orgs = data?.organizations ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <AdminTopBar title="Organizations" subtitle="Client organizations registered on the platform" />

      <SectionCard title="All Organizations" subtitle={`${pagination?.totalRecords ?? 0} total`}>
        {orgs.length === 0 && !isLoading
          ? <EmptyState icon={Building2} title="No organizations yet" description="Organizations will appear here once clients onboard." />
          : (
            <>
              <DataTable columns={columns} data={orgs} isLoading={isLoading} emptyMessage="No organizations found." />
              {pagination && <Pagination pagination={pagination} onPageChange={setPage} />}
            </>
          )
        }
      </SectionCard>

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
