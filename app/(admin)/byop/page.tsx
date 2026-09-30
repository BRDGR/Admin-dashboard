"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Trash2,
  Link2,
  Users,
  Building2,
  ShieldCheck,
  Copy,
  Check,
} from "lucide-react";
import { AdminTopBar } from "@/components/layout";
import {
  DataTable,
  MetricCard,
  UserAvatarCell,
  TableActionButton,
  StatusBadge,
} from "@/components/ui";
import { useByopRelationships, useDeleteByopInvitations, useByopAnalytics } from "@/lib/hooks/useByop";
import { listAdminInviteCodes } from "@/lib/api/admin.api";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ByopRelationship, AdminInviteCodeRecord } from "@/lib/types";
import type { Column } from "@/components/ui";
import { cn } from "@/lib/utils";

export default function ByopPage() {
  const [tab, setTab] = useState<"relationships" | "invite_codes">("relationships");
  const [page, setPage] = useState(1);
  const [invitePage, setInvitePage] = useState(1);
  const [search, setSearch] = useState("");
  const [inviteSearch, setInviteSearch] = useState("");
  const [selectedRelIds, setSelectedRelIds] = useState<string[]>([]);
  const [selectedCodeIds, setSelectedCodeIds] = useState<string[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

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

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    toast.success(`Copied ${label} to clipboard`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const relationshipColumns: Column<ByopRelationship>[] = [
    {
      key: "partner",
      header: "Partner",
      sortable: true,
      render: ({ partner }) => (
        <UserAvatarCell
          name={`${partner.firstName} ${partner.lastName}`}
          subtitle={partner.email}
        />
      ),
    },
    {
      key: "org",
      header: "Client Organization",
      sortable: true,
      render: ({ clientOrganization }) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <span className="text-[13px] text-slate-800 font-semibold">{clientOrganization.name}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Partner Status",
      render: ({ partner }) => (
        <div className="space-y-1">
          <StatusBadge status={partner.isActive ? "active" : "inactive"} />
          <div className={`flex items-center gap-1 text-[11px] ${partner.emailVerifiedAt ? "text-emerald-600" : "text-slate-400"}`}>
            <ShieldCheck className="w-3 h-3" />
            <span>{partner.emailVerifiedAt ? "Email verified" : "Email unverified"}</span>
          </div>
        </div>
      ),
    },
    {
      key: "relationshipId",
      header: "Relationship ID",
      render: ({ relationshipId }) => (
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-mono text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60" title={relationshipId}>
            {relationshipId.slice(0, 8)}…
          </span>
          <button
            type="button"
            onClick={() => handleCopy(relationshipId, "Relationship ID")}
            title="Copy Relationship ID"
            className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {copiedCode === relationshipId ? (
              <Check className="w-3 h-3 text-emerald-600" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        </div>
      ),
    },
    {
      key: "created",
      header: "Created",
      sortable: true,
      render: ({ createdAt, updatedAt }) => {
        const created = new Date(createdAt);
        const updated = new Date(updatedAt);
        const showUpdated = Math.abs(updated.getTime() - created.getTime()) > 60_000;
        return (
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-slate-700">{format(created, "MMM d, yyyy")}</p>
            {showUpdated && (
              <p className="text-[10px] text-slate-400">
                Updated {format(updated, "MMM d, yyyy")}
              </p>
            )}
          </div>
        );
      },
    },
    {
      key: "actions",
      header: "",
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          <TableActionButton
            icon={copiedCode === item.relationshipId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            label={copiedCode === item.relationshipId ? "Copied" : "Copy ID"}
            onClick={() => handleCopy(item.relationshipId, "Relationship ID")}
            variant="outline"
          />
        </div>
      ),
    },
  ];

  const inviteColumns: Column<AdminInviteCodeRecord>[] = [
    {
      key: "code",
      header: "Invite Code",
      sortable: true,
      render: ({ code, isActive }) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 border border-slate-200 px-2 py-1 rounded-lg">
            {code}
          </span>
          <StatusBadge status={isActive ? "active" : "inactive"} />
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
    {
      key: "actions",
      header: "",
      render: ({ code }) => (
        <div className="flex items-center justify-end gap-1.5">
          <TableActionButton
            icon={copiedCode === code ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            label={copiedCode === code ? "Copied" : "Copy Code"}
            onClick={() => handleCopy(code, "Invite Code")}
            variant="outline"
          />
        </div>
      ),
    },
  ];

  const filteredInviteCodes = (inviteCodesData ?? []).filter((item) => {
    if (!inviteSearch) return true;
    const q = inviteSearch.toLowerCase();
    return (
      item.code.toLowerCase().includes(q) ||
      (item.organization?.name && item.organization.name.toLowerCase().includes(q)) ||
      item.orgId.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <AdminTopBar
        title="BYOP"
        subtitle="Bring Your Own Partner — manage client-partner relationships and invitations"
      />

      {/* Metrics Header */}
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

      {/* Subheader Navigation Tabs & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-2xl w-fit border border-slate-200/60">
          <button
            type="button"
            onClick={() => setTab("relationships")}
            className={cn(
              "px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer",
              tab === "relationships"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            Relationships ({data?.pagination.totalRecords ?? 0})
          </button>
          <button
            type="button"
            onClick={() => setTab("invite_codes")}
            className={cn(
              "px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer",
              tab === "invite_codes"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            Invite Codes ({inviteCodesData?.length ?? 0})
          </button>
        </div>

        {tab === "relationships" && (
          <TableActionButton
            icon={<Trash2 className="w-3.5 h-3.5" />}
            label={isPending ? "Cleaning..." : "Clean Invitations"}
            onClick={() => cleanup()}
            variant="danger"
          />
        )}
      </div>

      {/* Unified Table View */}
      {tab === "relationships" ? (
        <DataTable
          columns={relationshipColumns}
          data={data?.records ?? []}
          isLoading={isLoading}
          emptyMessage="No BYOP relationships found."
          searchPlaceholder="Search by partner name or organization..."
          searchValue={search}
          onSearchChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          selectable
          selectedIds={selectedRelIds}
          onSelectionChange={setSelectedRelIds}
          getRowId={(r) => r.relationshipId}
          pagination={data?.pagination}
          onPageChange={setPage}
        />
      ) : (
        <DataTable
          columns={inviteColumns}
          data={filteredInviteCodes}
          isLoading={loadingInviteCodes}
          emptyMessage="No invite codes found across platform."
          searchPlaceholder="Search by invite code or organization..."
          searchValue={inviteSearch}
          onSearchChange={setInviteSearch}
          selectable
          selectedIds={selectedCodeIds}
          onSelectionChange={setSelectedCodeIds}
          getRowId={(r) => r.code}
        />
      )}
    </div>
  );
}
