"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Trash2, Link2 } from "lucide-react";
import { AdminTopBar } from "@/components/layout";
import { SectionCard, DataTable, Pagination, Button, MetricCard } from "@/components/ui";
import { useByopRelationships, useDeleteByopInvitations, useByopAnalytics } from "@/lib/hooks/useByop";
import type { ByopRelationship } from "@/lib/types";
import type { Column } from "@/components/ui";

const COLUMNS: Column<ByopRelationship>[] = [
  {
    key: "partner", header: "Partner",
    render: ({ partner }) => (
      <div>
        <p className="text-[13px] font-semibold text-slate-900">{partner.firstName} {partner.lastName}</p>
        <p className="text-[11px] text-slate-400">{partner.email}</p>
      </div>
    ),
  },
  {
    key: "org", header: "Client Organization",
    render: ({ clientOrganization }) => (
      <p className="text-[13px] text-slate-700 font-medium">{clientOrganization.name}</p>
    ),
  },
  {
    key: "active", header: "Partner Active",
    render: ({ partner }) => (
      <span className={`text-xs font-semibold ${partner.isActive ? "text-green-600" : "text-slate-400"}`}>
        {partner.isActive ? "Active" : "Inactive"}
      </span>
    ),
  },
  {
    key: "created", header: "Created",
    render: ({ createdAt }) => (
      <span className="text-xs text-slate-400">{format(new Date(createdAt), "MMM d, yyyy")}</span>
    ),
  },
];

export default function ByopPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading } = useByopRelationships(page, 20, search || undefined);
  const { mutate: cleanup, isPending } = useDeleteByopInvitations();
  const { data: analytics, isLoading: loadingAnalytics } = useByopAnalytics();

  const analyticsData = analytics as Record<string, unknown> | undefined;
  const totalRelationships = (analyticsData?.totalRelationships as number) ?? data?.pagination.totalRecords ?? 0;
  const activePartners = (analyticsData?.activePartners as number) ?? data?.records.filter((r) => r.partner.isActive).length ?? 0;
  const linkedOrgs = (analyticsData?.linkedOrganizations as number) ?? new Set(data?.records.map((r) => r.clientOrganization.id)).size ?? 0;

  return (
    <div className="space-y-6">
      <AdminTopBar title="BYOP" subtitle="Bring Your Own Partner — manage client-partner relationships" />

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard label="Total Relationships" value={totalRelationships} icon={Link2} iconBg="bg-blue-50 text-[#0364FF]" isLoading={loadingAnalytics} />
        <MetricCard label="Active Partners" value={activePartners} icon={Link2} iconBg="bg-green-50 text-green-600" isLoading={loadingAnalytics} />
        <MetricCard label="Organizations Linked" value={linkedOrgs} icon={Link2} iconBg="bg-violet-50 text-violet-600" isLoading={loadingAnalytics} />
      </div>

      <SectionCard
        title="BYOP Relationships"
        subtitle="All partner-client connections"
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
        {/* Search */}
        <div className="px-5 py-3 border-b border-slate-100">
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by partner or organization..."
            className="w-full sm:w-72 text-xs bg-slate-50 border border-slate-200 rounded-full px-3.5 h-8 outline-none focus:ring-2 focus:ring-[#0364FF]/20 focus:border-[#0364FF] transition-all"
          />
        </div>
        <DataTable columns={COLUMNS} data={data?.records ?? []} isLoading={isLoading} emptyMessage="No BYOP relationships found." />
        {data?.pagination && <Pagination pagination={data.pagination} onPageChange={setPage} />}
      </SectionCard>
    </div>
  );
}
