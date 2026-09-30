"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Trash2, Link2, Users, Building2, Search, CheckCircle2, XCircle, ShieldCheck, Ticket, Copy, Check } from "lucide-react";
import { AdminTopBar } from "@/components/layout";
import { SectionCard, DataTable, Pagination, Button, MetricCard } from "@/components/ui";
import { useByopRelationships, useDeleteByopInvitations, useByopAnalytics } from "@/lib/hooks/useByop";
import { listAdminInviteCodes } from "@/lib/api/admin.api";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ByopRelationship, AdminInviteCodeRecord } from "@/lib/types";
import type { Column } from "@/components/ui";
import { cn } from "@/lib/utils";

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
    render: ({ createdAt, updatedAt }) => {
      const created = new Date(createdAt);
      const updated = new Date(updatedAt);
      const showUpdated = Math.abs(updated.getTime() - created.getTime()) > 60_000;
      return (
        <div className="space-y-0.5">
          <p className="text-xs text-slate-600">{format(created, "MMM d, yyyy")}</p>
          {showUpdated && (
            <p className="text-[10px] text-slate-400">
              Updated {format(updated, "MMM d, yyyy")}
            </p>
          )}
        </div>
      );
    },
  },
];

const INVITE_COLUMNS: Column<AdminInviteCodeRecord>[] = [
  {
    key: "code",
    header: "Invite Code",
    render: ({ code, isActive }) => (
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-lg">
          {code}
        </span>
        <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ${
          isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500 border border-slate-200"
        }`}>
          {isActive ? "Active" : "Inactive"}
        </span>
      </div>
    ),
  },
  {
    key: "organization",
    header: "Organization ID / Name",
    render: (item) => (
      <div className="flex items-center gap-2">
        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="text-xs text-slate-700 font-medium">
          {item.organization?.name || item.orgId}
        </span>
      </div>
    ),
  },
  {
    key: "uses",
    header: "Usage / Cap",
    render: ({ usedCount, maxUses }) => (
      <span className="text-xs text-slate-700">
        <span className="font-semibold text-slate-900">{usedCount ?? 0}</span>
        <span className="text-slate-400"> / {maxUses ? `${maxUses} max` : "Unlimited"}</span>
      </span>
    ),
  },
  {
    key: "expiresAt",
    header: "Expiration",
    render: ({ expiresAt }) => (
      <span className="text-xs text-slate-500">
        {expiresAt ? format(new Date(expiresAt), "MMM d, yyyy") : "No Expiry"}
      </span>
    ),
  },
  {
    key: "createdAt",
    header: "Created",
    render: ({ createdAt }) => (
      <span className="text-xs text-slate-400">
        {createdAt ? format(new Date(createdAt), "MMM d, yyyy") : "—"}
      </span>
    ),
  },
];

export default function ByopPage() {
  const [tab, setTab] = useState<"relationships" | "invite_codes">("relationships");
  const [page, setPage] = useState(1);
  const [invitePage, setInvitePage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useByopRelationships(page, 20, search || undefined);
  const { mutate: cleanup, isPending } = useDeleteByopInvitations();
  const { data: analytics, isLoading: loadingAnalytics } = useByopAnalytics();

  const { data: inviteCodesData, isLoading: loadingInviteCodes } = useQuery({
    queryKey: ["admin", "invite-codes", invitePage],
    queryFn: async () => {
      const res = await listAdminInviteCodes({ page: invitePage, limit: 20 });
      const raw = res.data as any;
      const list = raw?.data?.inviteCodes || raw?.inviteCodes || raw?.data || [];
      return Array.isArray(list) ? (list as AdminInviteCodeRecord[]) : [];
    },
    enabled: tab === "invite_codes",
  });

  const totalRelationships = analytics?.totalRelationships ?? data?.pagination.totalRecords ?? 0;
  const activePartners = analytics?.activePartners ?? 0;
  const linkedOrgs = analytics?.linkedOrganizations ?? 0;

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
        title={tab === "relationships" ? "BYOP Relationships" : "Platform Invite Codes"}
        subtitle={
          tab === "relationships"
            ? `${data?.pagination.totalRecords ?? 0} partner-client connections`
            : `${inviteCodesData?.length ?? 0} active shareable invite codes`
        }
        action={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-100 rounded-full p-1">
              <button
                type="button"
                onClick={() => setTab("relationships")}
                className={cn(
                  "px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer",
                  tab === "relationships" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-700"
                )}
              >
                Relationships
              </button>
              <button
                type="button"
                onClick={() => setTab("invite_codes")}
                className={cn(
                  "px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer",
                  tab === "invite_codes" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-700"
                )}
              >
                Invite Codes
              </button>
            </div>

            {tab === "relationships" && (
              <Button
                variant="danger"
                size="sm"
                isLoading={isPending}
                onClick={() => cleanup()}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Clean Invitations
              </Button>
            )}
          </div>
        }
      >
        {tab === "relationships" ? (
          <>
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
          </>
        ) : (
          <DataTable
            columns={INVITE_COLUMNS}
            data={inviteCodesData ?? []}
            isLoading={loadingInviteCodes}
            emptyMessage="No invite codes found across platform."
          />
        )}
      </SectionCard>
    </div>
  );
}
