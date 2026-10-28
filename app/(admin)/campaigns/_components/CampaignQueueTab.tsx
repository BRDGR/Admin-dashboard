"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import {
  Layers,
  CheckCircle,
  Play,
  AlertTriangle,
  Sparkles,
  Users,
  Activity,
  Calendar,
  ShieldCheck,
  Building2,
  Search,
  X,
  Filter,
  DollarSign,
  Globe,
} from "lucide-react";
import {
  DataTable,
  StatusBadge,
  TableActionButton,
  MetricCard,
  type Column,
} from "@/components/ui";
import type { AdminCampaignQueueItem } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CampaignQueueTabProps {
  campaigns: AdminCampaignQueueItem[];
  totalRecords: number;
  totalPages: number;
  page: number;
  isLoading: boolean;
  isActivating: boolean;
  onPageChange: (page: number) => void;
  onStatusFilterChange: (status: string) => void;
  onSearchChange: (search: string) => void;
  onReview: (campaign: AdminCampaignQueueItem) => void;
  onMatch: (campaign: AdminCampaignQueueItem) => void;
  onViewAssignments: (campaign: AdminCampaignQueueItem) => void;
  onActivate: (campaignId: string) => void;
  onViewPerformance: (campaign: AdminCampaignQueueItem) => void;
}

export function CampaignQueueTab({
  campaigns,
  totalRecords,
  totalPages,
  page,
  isLoading,
  isActivating,
  onPageChange,
  onStatusFilterChange,
  onSearchChange,
  onReview,
  onMatch,
  onViewAssignments,
  onActivate,
  onViewPerformance,
}: CampaignQueueTabProps) {
  const [localSearch, setLocalSearch] = useState("");
  const [localStatus, setLocalStatus] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Collect available categories dynamically
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    campaigns.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return Array.from(set);
  }, [campaigns]);

  // Client-side category filtering on top of server data
  const displayedCampaigns = useMemo(() => {
    if (categoryFilter === "all") return campaigns;
    return campaigns.filter(
      (c) => c.category?.toLowerCase() === categoryFilter.toLowerCase()
    );
  }, [campaigns, categoryFilter]);

  const columns: Column<AdminCampaignQueueItem>[] = [
    {
      key: "campaign",
      header: "Campaign & Client",
      sortable: true,
      render: (item) => {
        const orgName =
          item.organization?.name ?? item.organizationName ?? "Client Org";
        const initial = (item.name || "C")[0].toUpperCase();

        return (
          <div className="flex items-center gap-3 py-0.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/15 border border-blue-200/60 flex items-center justify-center font-bold text-[#0364FF] text-xs shrink-0 shadow-2xs">
              {initial}
            </div>
            <div className="min-w-0 space-y-0.5">
              <button
                type="button"
                onClick={() => onReview(item)}
                className="text-[13px] font-bold text-slate-900 leading-tight hover:text-[#0364FF] text-left transition-colors cursor-pointer block truncate max-w-[240px]"
                title={item.name}
              >
                {item.name}
              </button>
              <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-500">
                <span
                  className="flex items-center gap-1 font-medium text-slate-600 truncate max-w-[150px]"
                  title={orgName}
                >
                  <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{orgName}</span>
                </span>
                {item.category && (
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-700 font-semibold border border-purple-100/80 truncate max-w-[120px]"
                    title={item.category}
                  >
                    {item.category}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: "budget",
      header: "Commercials",
      sortable: true,
      render: (item) => {
        const currency = item.budgetCurrency ?? item.currency ?? "USD";
        const formattedAmount = item.budgetAmount
          ? Number(item.budgetAmount).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : item.budgetMinor
          ? (item.budgetMinor / 100).toLocaleString()
          : item.budget
          ? Number(item.budget).toLocaleString()
          : "N/A";
        const model = item.partnershipModel ?? item.category ?? "CPA";

        return (
          <div className="space-y-0.5">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-slate-900 tracking-tight">
                {currency} {formattedAmount}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200/60">
                {model}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: "timeline",
      header: "Timeline & Geographies",
      render: (item) => {
        const hasDates = item.startDate && item.endDate;
        const regions = item.targetRegions ?? [];

        return (
          <div className="space-y-1">
            {hasDates ? (
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-700">
                <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                <span>
                  {format(new Date(item.startDate!), "MMM d")} –{" "}
                  {format(new Date(item.endDate!), "MMM d, yyyy")}
                </span>
              </div>
            ) : (
              <span className="text-[11px] text-slate-400 font-medium">
                Continuous / Ongoing
              </span>
            )}
            <div className="flex flex-wrap gap-1 max-w-[220px]">
              {regions.slice(0, 2).map((r: string, i: number) => (
                <span
                  key={i}
                  title={r}
                  className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200/60 flex items-center gap-1 truncate max-w-[100px]"
                >
                  <Globe className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                  <span className="truncate">{r}</span>
                </span>
              ))}
              {regions.length > 2 && (
                <span
                  title={regions.join(", ")}
                  className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 cursor-help"
                >
                  +{regions.length - 2} more
                </span>
              )}
              {!regions.length && !hasDates && (
                <span className="text-[10px] text-slate-400">Global Coverage</span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Pipeline Status",
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: "submitted",
      header: "Submission Date",
      sortable: true,
      render: (item) => (
        <span className="text-xs text-slate-500 font-medium">
          {item.submittedAt || item.createdAt
            ? format(
                new Date((item.submittedAt || item.createdAt) as string),
                "MMM d, yyyy"
              )
            : "Recent"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Pipeline Actions",
      render: (item) => {
        const canReview =
          item.status === "pending_review" ||
          item.status === "submitted" ||
          item.status === "in_review" ||
          item.status === "changes_requested";

        return (
          <div className="flex items-center justify-end gap-1.5 flex-wrap">
            {/* Primary Action Button */}
            {canReview && (
              <TableActionButton
                icon={<ShieldCheck className="w-3.5 h-3.5" />}
                label="Review"
                onClick={() => onReview(item)}
                variant="success"
              />
            )}

            {item.status === "matching" && (
              <TableActionButton
                icon={<Sparkles className="w-3.5 h-3.5" />}
                label="Match"
                onClick={() => onMatch(item)}
                variant="primary"
              />
            )}

            {item.status === "assigned" && (
              <TableActionButton
                icon={<Play className="w-3.5 h-3.5" />}
                label={isActivating ? "Activating..." : "Activate"}
                disabled={isActivating}
                onClick={() => onActivate(item.id)}
                variant="primary"
              />
            )}

            {item.status === "active" && (
              <TableActionButton
                icon={<Activity className="w-3.5 h-3.5" />}
                label="Health & SLA"
                onClick={() => onViewPerformance(item)}
                variant="outline"
              />
            )}

            {/* Secondary: Assignments viewer */}
            <TableActionButton
              icon={<Users className="w-3.5 h-3.5" />}
              label="Partners"
              onClick={() => onViewAssignments(item)}
              variant="outline"
            />
          </div>
        );
      },
    },
  ];

  // Quick stats counts
  const pendingReviewCount = campaigns.filter(
    (c) =>
      c.status === "pending_review" ||
      c.status === "submitted" ||
      c.status === "in_review"
  ).length;

  const matchingCount = campaigns.filter(
    (c) =>
      c.status === "approved" ||
      c.status === "matching" ||
      c.status === "assigned"
  ).length;

  const activeCount = campaigns.filter((c) => c.status === "active").length;

  const changesCount = campaigns.filter(
    (c) =>
      c.status === "changes_requested" ||
      c.status === "rejected" ||
      c.status === "cancelled"
  ).length;

  const hasActiveFilters = Boolean(
    localStatus || localSearch || categoryFilter !== "all"
  );

  const resetFilters = () => {
    setLocalStatus("");
    setLocalSearch("");
    setCategoryFilter("all");
    onStatusFilterChange("");
    onSearchChange("");
  };

  return (
    <div className="space-y-4">
      {/* Quick Metrics KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
        <MetricCard
          label="Pending Review"
          value={pendingReviewCount || totalRecords}
          icon={Layers}
          iconBg="bg-blue-50 text-[#0364FF] border border-blue-100"
          trend={{ value: 12, label: "Requires Ops Verification" }}
        />
        <MetricCard
          label="Matching & Staged"
          value={matchingCount}
          icon={CheckCircle}
          iconBg="bg-emerald-50 text-emerald-600 border border-emerald-100"
          trend={{ value: 8, label: "Partner Allocation Ready" }}
        />
        <MetricCard
          label="Live Campaigns"
          value={activeCount}
          icon={Play}
          iconBg="bg-purple-50 text-purple-600 border border-purple-100"
          trend={{ value: 15, label: "Real-time Attribution Active" }}
        />
        <MetricCard
          label="Changes / Alerts"
          value={changesCount}
          icon={AlertTriangle}
          iconBg="bg-amber-50 text-amber-600 border border-amber-100"
          trend={{ value: -3, label: "Action Required Workflows" }}
        />
      </div>

      {/* Integrated Filter and Search Toolbar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Left: Search input */}
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                onSearchChange(e.target.value);
              }}
              placeholder="Search by campaign name, client organization, model..."
              className="w-full text-xs pl-10 pr-9 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200/90 rounded-xl text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0364FF]/20 focus:border-[#0364FF] transition-all font-medium"
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => {
                  setLocalSearch("");
                  onSearchChange("");
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right: Filters and actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Select */}
            <div className="flex items-center gap-1.5">
              <select
                value={localStatus}
                onChange={(e) => {
                  setLocalStatus(e.target.value);
                  onStatusFilterChange(e.target.value);
                }}
                className="text-xs h-9 px-3 bg-slate-50 hover:bg-slate-100/70 border border-slate-200/90 rounded-xl text-slate-700 font-semibold outline-none cursor-pointer focus:ring-2 focus:ring-[#0364FF]/20 focus:border-[#0364FF] transition-all"
              >
                <option value="">All Pipeline Statuses ({totalRecords})</option>
                <option value="pending_review">Pending Review</option>
                <option value="submitted">Submitted</option>
                <option value="in_review">In Review</option>
                <option value="matching">Matching</option>
                <option value="assigned">Assigned</option>
                <option value="approved">Approved</option>
                <option value="changes_requested">Changes Requested</option>
                <option value="active">Active Live</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Category Select */}
            {categoriesList.length > 0 && (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs h-9 px-3 bg-slate-50 hover:bg-slate-100/70 border border-slate-200/90 rounded-xl text-slate-700 font-semibold outline-none cursor-pointer focus:ring-2 focus:ring-[#0364FF]/20 focus:border-[#0364FF] transition-all"
              >
                <option value="all">All Categories</option>
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            )}

            {/* Reset Filter Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs h-9 px-3 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200/70 rounded-xl font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Count Summary Ribbon */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">
              Showing {displayedCampaigns.length} of {totalRecords} campaigns
            </span>
            {hasActiveFilters && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-50 text-[#0364FF] font-bold border border-blue-100">
                Filtered
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              {pendingReviewCount} in Review
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              {matchingCount} Staged
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {activeCount} Active
            </span>
          </div>
        </div>
      </div>

      {/* Standardized DataTable */}
      <DataTable
        columns={columns}
        data={displayedCampaigns}
        isLoading={isLoading}
        emptyMessage="No campaigns found in pipeline matching current filter."
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        getRowId={(r) => r.id}
        pagination={{
          currentPage: page,
          totalPages,
          totalRecords,
          hasNext: page < totalPages,
          hasPrev: page > 1,
          nextPage: page < totalPages ? page + 1 : null,
          prevPage: page > 1 ? page - 1 : null,
        }}
        onPageChange={onPageChange}
      />
    </div>
  );
}
