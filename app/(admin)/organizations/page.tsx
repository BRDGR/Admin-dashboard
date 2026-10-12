"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Building2,
  Eye,
  SlidersHorizontal,
  Landmark,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { AdminTopBar } from "@/components/layout";
import {
  DataTable,
  StatusBadge,
  TableActionButton,
  TruncatedText,
  MetricCard,
  type Column,
} from "@/components/ui";
import { useQueryClient } from "@tanstack/react-query";
import { useOrganizations } from "@/lib/hooks/useOrganizations";
import type { OrganizationRecord } from "@/lib/types";
import { cn } from "@/lib/utils";
import { UpdateOrgStatusModal } from "./_components/UpdateOrgStatusModal";
import { OrgFilterBar, type OrgFilters } from "./_components/OrgFilterBar";

type OrgCategory = "all" | "broker" | "prop_firm" | "other";

const TABS: { id: OrgCategory; label: string }[] = [
  { id: "all", label: "All Organizations" },
  { id: "broker", label: "Brokers" },
  { id: "prop_firm", label: "Prop Firms" },
  { id: "other", label: "Other Entities" },
];

const INITIAL_FILTERS: OrgFilters = {
  verification: "all",
  status: "all",
};

function normalizeCompanyType(type?: string): "broker" | "prop_firm" | "other" {
  if (!type) return "other";
  const t = type.toLowerCase().trim();
  if (t.includes("broker")) return "broker";
  if (t.includes("prop") || t.includes("funded")) return "prop_firm";
  return "other";
}

function useColumns(
  onEditStatus: (record: OrganizationRecord) => void
): Column<OrganizationRecord>[] {
  const router = useRouter();

  return [
    {
      key: "name",
      header: "Organization",
      render: ({ organization }) => {
        const typeNorm = normalizeCompanyType(organization.companyType);
        return (
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border font-bold text-xs",
                typeNorm === "broker"
                  ? "bg-blue-50 text-[#0364FF] border-blue-100"
                  : typeNorm === "prop_firm"
                  ? "bg-purple-50 text-purple-600 border-purple-100"
                  : "bg-slate-100 text-slate-600 border-slate-200"
              )}
            >
              {typeNorm === "broker" ? (
                <Landmark className="w-4 h-4" />
              ) : typeNorm === "prop_firm" ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <Building2 className="w-4 h-4" />
              )}
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
        );
      },
    },
    {
      key: "type",
      header: "Category & Model",
      render: ({ organization }) => {
        const typeNorm = normalizeCompanyType(organization.companyType);
        return (
          <div className="space-y-1">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border",
                typeNorm === "broker"
                  ? "bg-blue-50 text-[#0364FF] border-blue-200"
                  : typeNorm === "prop_firm"
                  ? "bg-purple-50 text-purple-700 border-purple-200"
                  : "bg-slate-100 text-slate-700 border-slate-200"
              )}
            >
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  typeNorm === "broker"
                    ? "bg-[#0364FF]"
                    : typeNorm === "prop_firm"
                    ? "bg-purple-600"
                    : "bg-slate-500"
                )}
              />
              {typeNorm === "broker"
                ? "Brokerage"
                : typeNorm === "prop_firm"
                ? "Prop Firm"
                : organization.companyType || "Enterprise"}
            </span>

            {/* Regulatory or Platform info hint if available */}
            {organization.regulatoryInfo?.regulator && (
              <p className="text-[10px] text-slate-400 font-medium">
                Reg: {organization.regulatoryInfo.regulator}
              </p>
            )}
          </div>
        );
      },
    },
    {
      key: "country",
      header: "Jurisdiction",
      render: ({ organization }) => (
        <span className="text-sm text-slate-700 font-medium truncate max-w-[140px] block">
          {organization.country ?? "—"}
        </span>
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
          <StatusBadge
            status={record.organization.status ?? "pending"}
            size="md"
          />
        </button>
      ),
    },
    {
      key: "verified",
      header: "KYC Verified",
      render: (record) => (
        <button
          type="button"
          onClick={() => onEditStatus(record)}
          title="Click to toggle verification"
          className={cn(
            "inline-flex items-center gap-1 text-xs font-semibold cursor-pointer hover:underline",
            record.organization.isVerified
              ? "text-emerald-600"
              : "text-slate-400"
          )}
        >
          {record.organization.isVerified && (
            <CheckCircle2 className="w-3.5 h-3.5" />
          )}
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
          {organization.createdAt
            ? format(new Date(organization.createdAt), "MMM d, yyyy")
            : "—"}
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
            onClick={() =>
              router.push(`/organizations/${record.organization.id}`)
            }
            size="sm"
          />
        </div>
      ),
    },
  ];
}

export default function OrganizationsPage() {
  const [activeCategory, setActiveCategory] = useState<OrgCategory>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<OrgFilters>(INITIAL_FILTERS);
  const [editingOrg, setEditingOrg] = useState<OrganizationRecord | null>(null);

  const qc = useQueryClient();
  const { data, isLoading } = useOrganizations(page, pageSize);
  const columns = useColumns((rec) => setEditingOrg(rec));

  const allOrgs = data?.organizations ?? [];
  const pagination = data?.pagination;

  // Compute category totals
  const brokerCount = useMemo(
    () =>
      allOrgs.filter(
        (o) => normalizeCompanyType(o.organization?.companyType) === "broker"
      ).length,
    [allOrgs]
  );

  const propCount = useMemo(
    () =>
      allOrgs.filter(
        (o) => normalizeCompanyType(o.organization?.companyType) === "prop_firm"
      ).length,
    [allOrgs]
  );

  const otherCount = useMemo(
    () =>
      allOrgs.filter(
        (o) => normalizeCompanyType(o.organization?.companyType) === "other"
      ).length,
    [allOrgs]
  );

  const verifiedCount = useMemo(
    () => allOrgs.filter((o) => o.organization?.isVerified).length,
    [allOrgs]
  );

  // Filter organizations by category, search, and compliance filters
  const filteredOrgs = useMemo(() => {
    return allOrgs.filter((o) => {
      const orgType = normalizeCompanyType(o.organization?.companyType);

      // 1. Category Tab Filter
      if (activeCategory !== "all" && orgType !== activeCategory) {
        return false;
      }

      // 2. Text Search
      if (searchQuery.trim()) {
        const s = searchQuery.toLowerCase();
        const name = (o.organization?.name ?? "").toLowerCase();
        const email = (o.organization?.email ?? "").toLowerCase();
        const country = (o.organization?.country ?? "").toLowerCase();
        const owner = `${o.owner?.firstName ?? ""} ${o.owner?.lastName ?? ""}`.toLowerCase();
        const matches =
          name.includes(s) ||
          email.includes(s) ||
          country.includes(s) ||
          owner.includes(s);
        if (!matches) return false;
      }

      // 3. KYC Verification Filter
      if (
        filters.verification === "verified" &&
        !o.organization?.isVerified
      ) {
        return false;
      }
      if (
        filters.verification === "unverified" &&
        o.organization?.isVerified
      ) {
        return false;
      }

      // 4. Status Filter
      if (
        filters.status !== "all" &&
        o.organization?.status?.toLowerCase() !== filters.status
      ) {
        return false;
      }

      return true;
    });
  }, [allOrgs, activeCategory, searchQuery, filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.verification !== "all") count++;
    if (filters.status !== "all") count++;
    return count;
  }, [filters]);

  const getCategoryCount = (cat: OrgCategory) => {
    if (cat === "broker") return brokerCount;
    if (cat === "prop_firm") return propCount;
    if (cat === "other") return otherCount;
    return allOrgs.length;
  };

  return (
    <div className="space-y-6">
      <AdminTopBar
        title="Organizations Management"
        subtitle="Manage Brokers, Prop Firms, and client company compliance"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Organizations"
          value={allOrgs.length}
          icon={Building2}
          iconBg="bg-blue-50 text-[#0364FF]"
          isLoading={isLoading}
        />
        <MetricCard
          label="Brokers"
          value={brokerCount}
          icon={Landmark}
          iconBg="bg-sky-50 text-sky-600"
          isLoading={isLoading}
        />
        <MetricCard
          label="Prop Firms"
          value={propCount}
          icon={TrendingUp}
          iconBg="bg-purple-50 text-purple-600"
          isLoading={isLoading}
        />
        <MetricCard
          label="KYC Verified"
          value={verifiedCount}
          icon={ShieldCheck}
          iconBg="bg-emerald-50 text-emerald-600"
          isLoading={isLoading}
        />
      </div>

      {/* Categorized Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200/60">
        {TABS.map((t) => {
          const isActive = activeCategory === t.id;
          const count = getCategoryCount(t.id);
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setActiveCategory(t.id);
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
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-bold",
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-600"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter Bar */}
      <OrgFilterBar
        isOpen={showFilters}
        filters={filters}
        onFilterChange={setFilters}
        onReset={() => setFilters(INITIAL_FILTERS)}
        onClose={() => setShowFilters(false)}
        activeCount={activeFilterCount}
      />

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredOrgs}
        isLoading={isLoading}
        emptyMessage={
          activeCategory === "broker"
            ? "No Brokers found matching search or filter criteria."
            : activeCategory === "prop_firm"
            ? "No Prop Firms found matching search or filter criteria."
            : "No organizations found."
        }
        selectable={true}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        getRowId={(r) => r.organization.id}
        itemLabel={
          activeCategory === "broker"
            ? "Brokers"
            : activeCategory === "prop_firm"
            ? "Prop Firms"
            : "Organizations"
        }
        searchPlaceholder={`Search ${
          activeCategory === "broker"
            ? "Brokers"
            : activeCategory === "prop_firm"
            ? "Prop Firms"
            : "organizations"
        } by name, email, or jurisdiction...`}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        showFilterButton={true}
        isFilterActive={activeFilterCount > 0 || showFilters}
        onFilterClick={() => setShowFilters(!showFilters)}
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
