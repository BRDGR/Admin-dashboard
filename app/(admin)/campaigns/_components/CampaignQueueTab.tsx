"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Layers,
  CheckCircle,
  Play,
  AlertTriangle,
  Search,
  Sparkles,
  Users,
  Activity,
} from "lucide-react";
import {
  SectionCard,
  DataTable,
  StatusBadge,
  Pagination,
  Button,
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

  const columns: Column<AdminCampaignQueueItem>[] = [
    {
      key: "campaign",
      header: "Campaign & Client",
      render: (item) => (
        <div>
          <p className="text-[13px] font-semibold text-slate-900">{item.name}</p>
          <p className="text-[11px] text-slate-500">{item.organizationName ?? "Client Org"}</p>
        </div>
      ),
    },
    {
      key: "budget",
      header: "Commercials",
      render: (item) => (
        <div>
          <span className="text-xs font-bold text-slate-800">
            {item.currency ?? "USD"} {item.budgetMinor ? (item.budgetMinor / 100).toLocaleString() : "N/A"}
          </span>
          <p className="text-[10px] text-slate-400 capitalize">{item.partnershipModel ?? "CPA"}</p>
        </div>
      ),
    },
    {
      key: "targeting",
      header: "Targeting",
      render: (item) => (
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
        </div>
      ),
    },
    {
      key: "status",
      header: "Review Status",
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: "submitted",
      header: "Submitted",
      render: (item) => (
        <span className="text-xs text-slate-400">
          {item.submittedAt || item.createdAt
            ? format(new Date(item.submittedAt || item.createdAt as string), "MMM d, yyyy")
            : "Recent"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Pipeline Actions",
      render: (item) => (
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Review button — available on pending_review, submitted, in_review, changes_requested */}
          {(item.status === "pending_review" || item.status === "submitted" || item.status === "in_review" || item.status === "changes_requested") && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-7 px-2.5 text-blue-600 border-blue-200 hover:bg-blue-50 cursor-pointer"
              onClick={() => onReview(item)}
            >
              Review
            </Button>
          )}

          {/* AI Match & Assign — only available once campaign is in `matching` status */}
          {item.status === "matching" && (
            <Button
              size="sm"
              variant="ghost"
              title="AI Match & Assign Partners"
              className="text-xs h-7 px-2 text-[#0364FF] hover:bg-blue-50 cursor-pointer"
              onClick={() => onMatch(item)}
            >
              <Sparkles className="w-3.5 h-3.5 mr-1 text-[#0364FF]" />
              Match
            </Button>
          )}

          {/* View Assignments */}
          <Button
            size="sm"
            variant="ghost"
            title="View Partner Assignments"
            className="text-xs h-7 px-2 text-slate-600 hover:bg-slate-100 cursor-pointer"
            onClick={() => onViewAssignments(item)}
          >
            <Users className="w-3.5 h-3.5" />
          </Button>

          {/* Activate button — available once partners are assigned */}
          {item.status === "assigned" && (
            <Button
              size="sm"
              variant="primary"
              className="text-xs h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
              isLoading={isActivating}
              onClick={() => onActivate(item.id)}
            >
              <Play className="w-3 h-3 mr-1" />
              Activate
            </Button>
          )}

          {/* Performance & PIP */}
          {item.status === "active" && (
            <Button
              size="sm"
              variant="ghost"
              title="Performance & Health"
              className="text-xs h-7 px-2 text-purple-600 hover:bg-purple-50 cursor-pointer"
              onClick={() => onViewPerformance(item)}
            >
              <Activity className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard
          label="Pending Review"
          value={totalRecords}
          icon={Layers}
          iconBg="bg-blue-50 text-[#0364FF]"
        />
        <MetricCard
          label="Approved"
          value={campaigns.filter((c) => c.status === "approved").length}
          icon={CheckCircle}
          iconBg="bg-emerald-50 text-emerald-600"
        />
        <MetricCard
          label="Active Live"
          value={campaigns.filter((c) => c.status === "active").length}
          icon={Play}
          iconBg="bg-purple-50 text-purple-600"
        />
        <MetricCard
          label="Changes Requested"
          value={campaigns.filter((c) => c.status === "changes_requested").length}
          icon={AlertTriangle}
          iconBg="bg-amber-50 text-amber-600"
        />
      </div>

      <SectionCard title="Campaign Review Queue" subtitle="Incoming campaigns requiring administrative approval and matching">
        {/* Filter Controls */}
        <div className="p-5 pb-0">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  placeholder="Search campaigns..."
                  value={localSearch}
                  onChange={(e) => {
                    setLocalSearch(e.target.value);
                    onSearchChange(e.target.value);
                  }}
                  className="w-full text-xs pl-8 pr-3 h-8 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#0364FF]"
                />
              </div>
              <select
                value={localStatus}
                onChange={(e) => {
                  setLocalStatus(e.target.value);
                  onStatusFilterChange(e.target.value);
                }}
                className="text-xs h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="pending_review">Pending Review</option>
                <option value="submitted">Submitted</option>
                <option value="in_review">In Review</option>
                <option value="matching">Matching</option>
                <option value="approved">Approved</option>
                <option value="changes_requested">Changes Requested</option>
                <option value="active">Active</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <span className="text-xs text-slate-400">
              {totalRecords} total campaigns in pipeline
            </span>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={campaigns}
          isLoading={isLoading}
          emptyMessage="No campaigns found in queue matching current filter."
        />

        {totalPages > 1 && (
          <Pagination
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
        )}
      </SectionCard>
    </div>
  );
}
