"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Eye, SlidersHorizontal, UserCheck } from "lucide-react";
import { AdminTopBar } from "@/components/layout";
import {
  DataTable,
  StatusBadge,
  TableActionButton,
  UserAvatarCell,
  type Column,
} from "@/components/ui";
import { usePartners, useNormalPartners, useByopPartners } from "@/lib/hooks/usePartners";
import type { PartnerRecord } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const TABS = ["All", "Normal", "BYOP"] as const;
type Tab = typeof TABS[number];

function useColumns(): Column<PartnerRecord>[] {
  const router = useRouter();
  return [
    {
      key: "name",
      header: "Partner",
      render: ({ user }) => {
        const fullName =
          [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
          user?.email ||
          "Unknown Partner";
        const email = user?.email || "—";
        return (
          <UserAvatarCell
            name={fullName}
            subtitle={email}
          />
        );
      },
    },
    {
      key: "location",
      header: "Location",
      render: ({ partnerProfile }) => (
        <span className="text-xs text-slate-600 font-medium">{partnerProfile?.location || "—"}</span>
      ),
    },
    {
      key: "industries",
      header: "Industries",
      render: ({ partnerProfile }) => {
        const industries = Array.isArray(partnerProfile?.industries) ? partnerProfile.industries : [];
        return (
          <div className="flex flex-wrap gap-1">
            {industries.slice(0, 2).map((ind) => (
              <span key={ind} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-semibold border border-slate-200/60">
                {ind}
              </span>
            ))}
            {industries.length === 0 && <span className="text-[10px] text-slate-400">—</span>}
          </div>
        );
      },
    },
    {
      key: "capacity",
      header: "Capacity",
      render: ({ partnerProfile }) => (
        <span className="text-xs text-slate-600 capitalize">
          {partnerProfile?.capacity ? partnerProfile.capacity.replace(/_/g, " ") : "—"}
        </span>
      ),
    },
    {
      key: "vetted",
      header: "Vetted",
      render: ({ partnerProfile }) => (
        <StatusBadge status={partnerProfile?.isVetted ? "approved" : "pending"} />
      ),
    },
    {
      key: "joined",
      header: "Joined",
      render: ({ user }) => {
        let joined = "—";
        if (user?.createdAt) {
          try {
            joined = format(new Date(user.createdAt), "MMM d, yyyy");
          } catch {
            joined = "—";
          }
        }
        return <span className="text-xs text-slate-400 whitespace-nowrap">{joined}</span>;
      },
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: ({ user, partnerProfile }) => {
        const targetId = user?.id || partnerProfile?.userId;
        if (!targetId) return null;
        return (
          <div className="flex items-center justify-end gap-2">
            <TableActionButton
              icon={<Eye className="w-3.5 h-3.5" />}
              label="View"
              onClick={() => router.push(`/partners/${targetId}`)}
            />
          </div>
        );
      },
    },
  ];
}

function TabContent({ tab }: { tab: Tab }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const allQ = usePartners(page, pageSize);
  const normalQ = useNormalPartners(page, pageSize);
  const byopQ = useByopPartners(page, pageSize);
  const columns = useColumns();

  const q = tab === "All" ? allQ : tab === "Normal" ? normalQ : byopQ;
  const rawData = q.data?.partners ?? [];
  const pagination = q.data?.pagination;

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return rawData;
    const s = searchQuery.toLowerCase();
    return rawData.filter((p) => {
      const name = `${p.user?.firstName ?? ""} ${p.user?.lastName ?? ""}`.toLowerCase();
      const email = (p.user?.email ?? "").toLowerCase();
      const location = (p.partnerProfile?.location ?? "").toLowerCase();
      return name.includes(s) || email.includes(s) || location.includes(s);
    });
  }, [rawData, searchQuery]);

  return (
    <DataTable
      columns={columns}
      data={filteredData}
      isLoading={q.isLoading}
      emptyMessage="No partners found matching criteria."
      selectable={true}
      selectedIds={selectedIds}
      onSelectionChange={setSelectedIds}
      getRowId={(p, idx) => p.user?.id || p.partnerProfile?.id || String(idx)}
      itemLabel="Partners"
      searchPlaceholder="Search Partners"
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      showFilterButton={true}
      onFilterClick={() => toast.info("Partner filters")}
      pagination={pagination}
      onPageChange={setPage}
      pageSize={pageSize}
      onPageSizeChange={setPageSize}
      bulkActions={
        <TableActionButton
          icon={<UserCheck className="w-3.5 h-3.5 text-emerald-600" />}
          label="Verify Selected"
          variant="primary"
          onClick={() => {
            toast.info(`Vetting ${selectedIds.length} partners requested`);
          }}
        />
      }
    />
  );
}

export default function PartnersPage() {
  const [tab, setTab] = useState<Tab>("All");

  return (
    <div className="space-y-6">
      <AdminTopBar title="Partners" subtitle="Manage all partner profiles on the platform" />

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer",
              tab === t
                ? "bg-slate-900 text-white shadow-2xs"
                : "bg-white border border-slate-200/90 text-slate-600 hover:bg-slate-50"
            )}
          >
            {t} Partners
          </button>
        ))}
      </div>

      <TabContent tab={tab} />
    </div>
  );
}
