"use client";

import { useState } from "react";
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
} from "lucide-react";
import {
  DataTable,
  StatusBadge,
  TableActionButton,
  MetricCard,
  type Column,
} from "@/components/ui";
import type { AdminCampaignQueueItem } from "@/lib/types";

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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const columns: Column<AdminCampaignQueueItem>[] = [
    {
      key: "campaign",
      header: "Campaign & Client",
      sortable: true,
      render: (item) => {
        const orgName = item.organization?.name ?? item.organizationName ?? "Client Org";
        return (
          <div className="space-y-0.5">
            <p className="text-[13px] font-semibold text-slate-900 leading-tight">{item.name}</p>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-500 font-medium">{orgName}</span>
              {item.category && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-medium border border-purple-100">
                  {item.category}
                </span>
              )}
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
          <div>
            <span className="text-xs font-bold text-slate-800">
              {currency} {formattedAmount}
            </span>
            <p className="text-[10px] text-slate-400 capitalize">{model}</p>
          </div>
        );
      },
    },
    {
      key: "timeline",
      header: "Timeline & Targeting",
      render: (item) => {
        const hasDates = item.startDate && item.endDate;
        return (
          <div className="space-y-1">
            {hasDates ? (
              <div className="flex items-center gap-1 text-[11px] font-medium text-slate-700">
                <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                <span>
                  {format(new Date(item.startDate!), "MMM d")} - {format(new Date(item.endDate!), "MMM d, yyyy")}
                </span>
              </div>
            ) : null}
            <div className="flex flex-wrap gap-1 max-w-[200px]">
              {(item.targetRegions ?? []).slice(0, 2).map((r: string, i: number) => (
                <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {r}
                </span>
              ))}
              {(item.targetNiches ?? []).slice(0, 1).map((n: string, i: number) => (
                <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-50 text-[#0364FF]">
                  {n}
                </span>
              ))}
              {!hasDates && !(item.targetRegions?.length) && !(item.targetNiches?.length) && (
                <span className="text-[10px] text-slate-400">Standard / Global</span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Review Status",
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: "submitted",
      header: "Submitted",
      sortable: true,
      render: (item) => (
        <span className="text-xs text-slate-400">
          {item.submittedAt || item.createdAt
            ? format(new Date((item.submittedAt || item.createdAt) as string), "MMM d, yyyy")
            : "Recent"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Pipeline Actions",
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5 flex-wrap">
          {/* Review button — available on pending_review, submitted, in_review, changes_requested */}
          {(item.status === "pending_review" ||
            item.status === "submitted" ||
            item.status === "in_review" ||
            item.status === "changes_requested") && (
            <TableActionButton
              icon={<ShieldCheck className="w-3.5 h-3.5" />}
              label="Review"
              onClick={() => onReview(item)}
              variant="primary"
            />
          )}

          {/* AI Match & Assign — available once campaign is in `matching` status */}
          {item.status === "matching" && (
            <TableActionButton
              icon={<Sparkles className="w-3.5 h-3.5" />}
              label="Match"
              onClick={() => onMatch(item)}
              variant="primary"
            />
          )}

          {/* View Assignments */}
          <TableActionButton
            icon={<Users className="w-3.5 h-3.5" />}
            label="Assignments"
            onClick={() => onViewAssignments(item)}
            variant="outline"
          />

          {/* Activate button — available once partners are assigned */}
          {item.status === "assigned" && (
            <TableActionButton
              icon={<Play className="w-3.5 h-3.5" />}
              label={isActivating ? "Activating..." : "Activate"}
              disabled={isActivating}
              onClick={() => onActivate(item.id)}
              variant="primary"
            />
          )}

          {/* Performance & PIP */}
          {item.status === "active" && (
            <TableActionButton
              icon={<Activity className="w-3.5 h-3.5" />}
              label="Health"
              onClick={() => onViewPerformance(item)}
              variant="outline"
            />
          )}
        </div>
      ),
    },
  ];

  const pendingReviewCount = campaigns.filter(
    (c) => c.status === "pending_review" || c.status === "submitted" || c.status === "in_review"
  ).length;

  const matchingCount = campaigns.filter(
    (c) => c.status === "approved" || c.status === "matching" || c.status === "assigned"
  ).length;

  const activeCount = campaigns.filter((c) => c.status === "active").length;

  const changesCount = campaigns.filter(
    (c) => c.status === "changes_requested" || c.status === "rejected" || c.status === "cancelled"
  ).length;

  return (
    <div className="space-y-4">
      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard
          label="Pending Review"
          value={pendingReviewCount || totalRecords}
          icon={Layers}
          iconBg="bg-blue-50 text-[#0364FF]"
        />
        <MetricCard
          label="Matching / Approved"
          value={matchingCount}
          icon={CheckCircle}
          iconBg="bg-emerald-50 text-emerald-600"
        />
        <MetricCard
          label="Active Live"
          value={activeCount}
          icon={Play}
          iconBg="bg-purple-50 text-purple-600"
        />
        <MetricCard
          label="Changes / Rejected"
          value={changesCount}
          icon={AlertTriangle}
          iconBg="bg-amber-50 text-amber-600"
        />
      </div>

      {/* Filter and Status Select */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <select
            value={localStatus}
            onChange={(e) => {
              setLocalStatus(e.target.value);
              onStatusFilterChange(e.target.value);
            }}
            className="text-xs h-9 px-3 bg-white border border-slate-200/90 rounded-xl text-slate-700 font-medium outline-none cursor-pointer focus:ring-2 focus:ring-[#0364FF]/20 focus:border-[#0364FF] transition-all"
          >
            <option value="">All Statuses ({totalRecords})</option>
            <option value="pending_review">Pending Review</option>
            <option value="submitted">Submitted</option>
            <option value="in_review">In Review</option>
            <option value="matching">Matching</option>
            <option value="assigned">Assigned</option>
            <option value="approved">Approved</option>
            <option value="changes_requested">Changes Requested</option>
            <option value="active">Active</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          {totalRecords} campaigns in pipeline
        </span>
      </div>

      {/* Standardized DataTable */}
      <DataTable
        columns={columns}
        data={campaigns}
        isLoading={isLoading}
        emptyMessage="No campaigns found in queue matching current filter."
        searchPlaceholder="Search campaigns by name, client, category..."
        searchValue={localSearch}
        onSearchChange={(val) => {
          setLocalSearch(val);
          onSearchChange(val);
        }}
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
