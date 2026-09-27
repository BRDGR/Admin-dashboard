"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Trash2, Link2, Users, Building2, Search, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import { AdminTopBar } from "@/components/layout";
import { SectionCard, DataTable, Pagination, Button, MetricCard } from "@/components/ui";
import { useByopRelationships, useDeleteByopInvitations, useByopAnalytics } from "@/lib/hooks/useByop";
import type { ByopRelationship } from "@/lib/types";
import type { Column } from "@/components/ui";

const COLUMNS: Column<ByopRelationship>[] = [
  {
    key: "partner",
    header: "Partner",
    render: ({ partner }) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 font-bold text-xs flex items-center justify-center shrink-0">
          {partner.firstName.charAt(0)}{partner.lastName.charAt(0)}
        </div>
        <div>
          <p className="text-[13px] font-semibold text-slate-900">
            {partner.firstName} {partner.lastName}
          </p>
          <p className="text-[11px] text-slate-400">{partner.email}</p>
        </div>
      </div>
    ),
  },
  {
    key: "org",
    header: "Client Organization",
    render: ({ clientOrganization }) => (
      <div className="flex items-center gap-2">
        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <p className="text-[13px] text-slate-700 font-medium">{clientOrganization.name}</p>
      </div>
    ),
  },
  {
    key: "status",
    header: "Partner Status",
    render: ({ partner }) => (
      <div className="space-y-1">
        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
          partner.isActive
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
            : "bg-slate-100 text-slate-500 border border-slate-200"
        }`}>
          {partner.isActive
            ? <><CheckCircle2 className="w-3 h-3" /> Active</>
            : <><XCircle className="w-3 h-3" /> Inactive</>
          }
        </span>
        <div className={`flex items-center gap-1 text-[10px] ${partner.emailVerifiedAt ? "text-emerald-600" : "text-slate-400"}`}>
          <ShieldCheck className="w-3 h-3" />
          {partner.emailVerifiedAt ? "Email verified" : "Email unverified"}
        </div>
      </div>
    ),
  },
  {
    key: "relationshipId",
    header: "Relationship ID",
    render: ({ relationshipId }) => (
      <span className="text-[11px] font-mono text-slate-400 truncate max-w-[120px] block" title={relationshipId}>
        {relationshipId.slice(0, 8)}…
      </span>
    ),
  },
  {
    key: "created",
    header: "Created",
    render: ({ createdAt, updatedAt }) => (
      <div className="space-y-0.5">
        <p className="text-xs text-slate-600">{format(new Date(createdAt), "MMM d, yyyy")}</p>
        {updatedAt !== createdAt && (
          <p className="text-[10px] text-slate-400">
            Updated {format(new Date(updatedAt), "MMM d, yyyy")}
          </p>
        )}
      </div>
    ),
  },
];

export default function ByopPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useByopRelationships(page, 20, search || undefined);
  const { mutate: cleanup, isPending } = useDeleteByopInvitations();
  const { data: analytics, isLoading: loadingAnalytics } = useByopAnalytics();

  const totalRelationships = analytics?.totalRelationships ?? data?.pagination.totalRecords ?? 0;
  const activePartners = analytics?.activePartners ?? data?.records.filter((r) => r.partner.isActive).length ?? 0;
  const linkedOrgs = analytics?.linkedOrganizations ?? new Set(data?.records.map((r) => r.clientOrganization.id)).size ?? 0;

  return (
    <div className="space-y-6">
      <AdminTopBar
        title="BYOP"
        subtitle="Bring Your Own Partner — manage client-partner relationships and invitations"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          label="Total Relationships"
          value={totalRelationships}
          icon={Link2}
          iconBg="bg-blue-50 text-[#0364FF]"
          isLoading={loadingAnalytics}
        />
        <MetricCard
          label="Active Partners"
          value={activePartners}
          icon={Users}
          iconBg="bg-emerald-50 text-emerald-600"
          isLoading={loadingAnalytics}
        />
        <MetricCard
          label="Organizations Linked"
          value={linkedOrgs}
          icon={Building2}
          iconBg="bg-violet-50 text-violet-600"
          isLoading={loadingAnalytics}
        />
      </div>

      <SectionCard
        title="BYOP Relationships"
        subtitle={`${data?.pagination.totalRecords ?? 0} partner-client connections`}
        action={
          <Button
            variant="danger"
            size="sm"
            isLoading={isPending}
            onClick={() => cleanup()}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Clean Invitations
          </Button>
        }
      >
        <div className="px-5 py-3 border-b border-slate-100">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by partner or organization..."
              className="w-full pl-8 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-xl h-8 outline-none focus:ring-2 focus:ring-[#0364FF]/20 focus:border-[#0364FF] transition-all"
            />
          </div>
        </div>

        <DataTable
          columns={COLUMNS}
          data={data?.records ?? []}
          isLoading={isLoading}
          emptyMessage="No BYOP relationships found."
        />

        {data?.pagination && (
          <Pagination pagination={data.pagination} onPageChange={setPage} />
        )}
      </SectionCard>
    </div>
  );
}
