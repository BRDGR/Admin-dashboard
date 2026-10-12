"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Eye,
  SlidersHorizontal,
  UserCheck,
  Users,
  ShieldCheck,
  UserCheck2,
  Link2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { AdminTopBar } from "@/components/layout";
import {
  DataTable,
  StatusBadge,
  TableActionButton,
  UserAvatarCell,
  MetricCard,
  type Column,
} from "@/components/ui";
import {
  usePartners,
  useBrdgrPartners,
  useUnmatchedPartners,
  useByopPartners,
} from "@/lib/hooks/usePartners";
import type { PartnerRecord } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  PartnerFilterBar,
  type PartnerFilters,
} from "./_components/PartnerFilterBar";

const TABS = [
  { id: "all", label: "All Partners" },
  { id: "brdgr", label: "BRDGR Partners" },
  { id: "unmatched", label: "Unmatched Partners" },
  { id: "byop", label: "BYOP Partners" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const INITIAL_FILTERS: PartnerFilters = {
  vettingStatus: "all",
  accountStatus: "all",
  capacity: "all",
  industry: "",
};

function useColumns(currentTab: TabId): Column<PartnerRecord>[] {
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
        return <UserAvatarCell name={fullName} subtitle={email} />;
      },
    },
    {
      key: "category",
      header: "Origin / Status",
      render: ({ partnerProfile }) => {
        const isVetted = partnerProfile?.isVetted;
        if (currentTab === "unmatched" || isVetted) {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              Available for Match
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/60">
            {partnerProfile?.ecosystemId ? "BYOP Partner" : "BRDGR Partner"}
          </span>
        );
      },
    },
    {
      key: "location",
      header: "Location",
      render: ({ partnerProfile }) => (
        <span className="text-xs text-slate-600 font-medium">
          {partnerProfile?.location || "—"}
        </span>
      ),
    },
    {
      key: "industries",
      header: "Industries",
      render: ({ partnerProfile }) => {
        const industries = Array.isArray(partnerProfile?.industries)
          ? partnerProfile.industries
          : [];
        return (
          <div className="flex flex-wrap gap-1">
            {industries.slice(0, 2).map((ind) => (
              <span
                key={ind}
                className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-semibold border border-slate-200/60"
              >
                {ind}
              </span>
            ))}
            {industries.length === 0 && (
              <span className="text-[10px] text-slate-400">—</span>
            )}
          </div>
        );
      },
    },
    {
      key: "capacity",
      header: "Capacity",
      render: ({ partnerProfile }) => (
        <span className="text-xs text-slate-600 capitalize">
          {partnerProfile?.capacity
            ? partnerProfile.capacity.replace(/_/g, " ")
            : "—"}
        </span>
      ),
    },
    {
      key: "vetted",
      header: "Vetting State",
      render: ({ partnerProfile }) => (
        <StatusBadge
          status={partnerProfile?.isVetted ? "approved" : "pending"}
        />
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
        return (
          <span className="text-xs text-slate-400 whitespace-nowrap">
            {joined}
          </span>
        );
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
          <div className="flex items-center justify-end gap-1.5">
            {currentTab === "unmatched" && (
              <TableActionButton
                icon={<ArrowRight className="w-3.5 h-3.5 text-[#0364FF]" />}
                label="Match"
                variant="outline"
                onClick={() => router.push(`/campaigns?partnerId=${targetId}`)}
              />
            )}
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

export default function PartnersPage() {
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<PartnerFilters>(INITIAL_FILTERS);

  // Queries for each category
  const allQ = usePartners(page, pageSize, activeTab === "all");
  const brdgrQ = useBrdgrPartners(page, pageSize, activeTab === "brdgr");
  const unmatchedQ = useUnmatchedPartners(
    page,
    pageSize,
    activeTab === "unmatched"
  );
  const byopQ = useByopPartners(page, pageSize, activeTab === "byop");

  // Overview metric queries (lightweight fetch for counters)
  const totalPartnersCount = allQ.data?.pagination?.totalRecords ?? 0;
  const brdgrCount = brdgrQ.data?.pagination?.totalRecords ?? 0;
  const unmatchedCount = unmatchedQ.data?.pagination?.totalRecords ?? 0;
  const byopCount = byopQ.data?.pagination?.totalRecords ?? 0;

  const currentQ =
    activeTab === "all"
      ? allQ
      : activeTab === "brdgr"
      ? brdgrQ
      : activeTab === "unmatched"
      ? unmatchedQ
      : byopQ;

  const rawData = currentQ.data?.partners ?? [];
  const pagination = currentQ.data?.pagination;
  const columns = useColumns(activeTab);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.vettingStatus !== "all") count++;
    if (filters.accountStatus !== "all") count++;
    if (filters.capacity !== "all") count++;
    return count;
  }, [filters]);

  // Combined client search & filter processing
  const filteredData = useMemo(() => {
    return rawData.filter((p) => {
      // 1. Text Search
      if (searchQuery.trim()) {
        const s = searchQuery.toLowerCase();
        const fullName = `${p.user?.firstName ?? ""} ${p.user?.lastName ?? ""}`.toLowerCase();
        const email = (p.user?.email ?? "").toLowerCase();
        const location = (p.partnerProfile?.location ?? "").toLowerCase();
        const matchesSearch =
          fullName.includes(s) || email.includes(s) || location.includes(s);
        if (!matchesSearch) return false;
      }

      // 2. Vetting Status Filter
      if (filters.vettingStatus === "vetted" && !p.partnerProfile?.isVetted) {
        return false;
      }
      if (filters.vettingStatus === "pending" && p.partnerProfile?.isVetted) {
        return false;
      }

      // 3. Account Status Filter
      if (filters.accountStatus === "active" && !p.user?.isActive) {
        return false;
      }
      if (filters.accountStatus === "inactive" && p.user?.isActive) {
        return false;
      }

      // 4. Capacity Filter
      if (
        filters.capacity !== "all" &&
        p.partnerProfile?.capacity !== filters.capacity
      ) {
        return false;
      }

      return true;
    });
  }, [rawData, searchQuery, filters]);

  return (
    <div className="space-y-6">
      <AdminTopBar
        title="Partners Management"
        subtitle="Manage BRDGR network partners, unmatched talent, and client BYOP partners"
      />

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Partners"
          value={totalPartnersCount}
          icon={Users}
          iconBg="bg-blue-50 text-[#0364FF]"
          isLoading={allQ.isLoading}
        />
        <MetricCard
          label="BRDGR Partners"
          value={brdgrCount}
          icon={ShieldCheck}
          iconBg="bg-indigo-50 text-indigo-600"
          isLoading={brdgrQ.isLoading}
        />
        <MetricCard
          label="Unmatched Partners"
          value={unmatchedCount}
          icon={Sparkles}
          iconBg="bg-emerald-50 text-emerald-600"
          isLoading={unmatchedQ.isLoading}
        />
        <MetricCard
          label="BYOP Partners"
          value={byopCount}
          icon={Link2}
          iconBg="bg-violet-50 text-violet-600"
          isLoading={byopQ.isLoading}
        />
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200/60">
        {TABS.map((t) => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setActiveTab(t.id);
                setPage(1);
              }}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2",
                isActive
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white border border-slate-200/90 text-slate-600 hover:bg-slate-50"
              )}
            >
              <span>{t.label}</span>
              {t.id === "unmatched" && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Collapsible Operational Filter Panel */}
      <PartnerFilterBar
        isOpen={showFilters}
        filters={filters}
        onFilterChange={setFilters}
        onReset={() => setFilters(INITIAL_FILTERS)}
        onClose={() => setShowFilters(false)}
        activeCount={activeFilterCount}
      />

      {/* Main Data Table */}
      <DataTable
        columns={columns}
        data={filteredData}
        isLoading={currentQ.isLoading}
        emptyMessage={
          activeTab === "unmatched"
            ? "No unmatched verified partners found. All verified partners are currently assigned."
            : "No partners found matching criteria."
        }
        selectable={true}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        getRowId={(p, idx) => p.user?.id || p.partnerProfile?.id || String(idx)}
        itemLabel="Partners"
        searchPlaceholder={`Search ${
          activeTab === "unmatched" ? "unmatched" : activeTab === "brdgr" ? "BRDGR" : ""
        } partners by name, email, or country...`}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        showFilterButton={true}
        isFilterActive={activeFilterCount > 0 || showFilters}
        onFilterClick={() => setShowFilters(!showFilters)}
        pagination={pagination}
        onPageChange={setPage}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        bulkActions={
          <TableActionButton
            icon={<UserCheck className="w-3.5 h-3.5 text-emerald-600" />}
            label={`Verify Selected (${selectedIds.length})`}
            variant="primary"
            onClick={() => {
              toast.info(`Vetting verification requested for ${selectedIds.length} partners.`);
            }}
          />
        }
      />
    </div>
  );
}
