"use client";

import {
  Megaphone,
  Play,
  GitMerge,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Users,
  Loader2,
  Building2,
  Tag,
  Calendar,
} from "lucide-react";
import { SectionCard, StatusBadge, EmptyState } from "@/components/ui";
import type { Campaign360OverviewResponse, Campaign360CampaignItem } from "@/lib/types";
import { format } from "date-fns";

interface Campaign360TabProps {
  overview?: Campaign360OverviewResponse;
  isLoading: boolean;
}

function StatPill({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl border ${color}`}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/60">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-[11px] font-medium opacity-70">{label}</p>
        <p className="text-lg font-bold leading-tight">{value}</p>
      </div>
    </div>
  );
}

function CampaignRow({ campaign }: { campaign: Campaign360CampaignItem }) {
  const achievement = campaign.achievementPct ?? 0;
  const barColor =
    achievement >= 75
      ? "bg-emerald-500"
      : achievement >= 40
      ? "bg-amber-400"
      : "bg-rose-400";

  return (
    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-900 truncate">{campaign.name}</p>
          {campaign.organization?.name && (
            <div className="flex items-center gap-1 mt-0.5">
              <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="text-[11px] text-slate-500 truncate">{campaign.organization.name}</span>
            </div>
          )}
        </div>
        <StatusBadge status={campaign.status} />
      </div>

      <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600">
        {campaign.category && (
          <div className="flex items-center gap-1">
            <Tag className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{campaign.category}</span>
          </div>
        )}
        {campaign.startDate && campaign.endDate && (
          <div className="flex items-center gap-1 col-span-2">
            <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
            <span>
              {format(new Date(campaign.startDate), "MMM d")} –{" "}
              {format(new Date(campaign.endDate), "MMM d, yyyy")}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div className="flex items-center gap-1.5 text-slate-600">
          <Users className="w-3 h-3 text-slate-400" />
          <span>
            <span className="font-semibold text-slate-800">{campaign.activePartners ?? 0}</span>
            {" / "}
            {campaign.partnersAssigned ?? 0} partners
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600">
          <TrendingUp className="w-3 h-3 text-slate-400" />
          <span>
            <span className="font-semibold text-slate-800">
              {(campaign.totalTraffic ?? 0).toLocaleString()}
            </span>
            {" / "}
            {(campaign.targetTraffic ?? 0).toLocaleString()} traffic
          </span>
        </div>
      </div>

      {/* Achievement bar */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-slate-400">Achievement</span>
          <span className="text-[10px] font-bold text-slate-700">{achievement.toFixed(0)}%</span>
        </div>
        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${barColor}`}
            style={{ width: `${Math.min(achievement, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export function Campaign360Tab({ overview, isLoading }: Campaign360TabProps) {
  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading 360 campaign overview...
      </div>
    );
  }

  if (!overview?.summary) {
    return (
      <EmptyState
        title="No 360 overview data"
        description="Launch campaigns to generate platform telemetry and performance metrics."
      />
    );
  }

  const { summary, campaigns = [] } = overview;

  const activeCampaigns = campaigns.filter((c) => c.status === "active");
  const matchingCampaigns = campaigns.filter((c) => c.status === "matching");
  const cancelledCampaigns = campaigns.filter((c) => c.status === "cancelled");
  const pendingCampaigns = campaigns.filter(
    (c) => !["active", "matching", "cancelled", "completed"].includes(c.status)
  );

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatPill
          label="Total Campaigns"
          value={summary.totalCampaigns}
          icon={Megaphone}
          color="bg-blue-50 border-blue-100 text-blue-700"
        />
        <StatPill
          label="Active"
          value={summary.activeCampaigns}
          icon={Play}
          color="bg-emerald-50 border-emerald-100 text-emerald-700"
        />
        <StatPill
          label="Matching"
          value={summary.matchingCampaigns}
          icon={GitMerge}
          color="bg-indigo-50 border-indigo-100 text-indigo-700"
        />
        <StatPill
          label="Completed"
          value={summary.completedCampaigns}
          icon={CheckCircle2}
          color="bg-slate-50 border-slate-200 text-slate-600"
        />
        <StatPill
          label="Pending Review"
          value={summary.pendingReviewCampaigns}
          icon={Clock}
          color="bg-amber-50 border-amber-100 text-amber-700"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active campaigns */}
        <SectionCard title={`Active Campaigns (${activeCampaigns.length})`}>
          <div className="space-y-2.5 mt-2">
            {activeCampaigns.length > 0 ? (
              activeCampaigns.map((c) => <CampaignRow key={c.id} campaign={c} />)
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">No active campaigns.</p>
            )}
          </div>
        </SectionCard>

        {/* Matching campaigns */}
        <SectionCard title={`In Matching (${matchingCampaigns.length})`}>
          <div className="space-y-2.5 mt-2">
            {matchingCampaigns.length > 0 ? (
              matchingCampaigns.map((c) => <CampaignRow key={c.id} campaign={c} />)
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">No campaigns in matching.</p>
            )}
          </div>
        </SectionCard>

        {/* Pending / other */}
        {pendingCampaigns.length > 0 && (
          <SectionCard title={`Pending / Other (${pendingCampaigns.length})`}>
            <div className="space-y-2.5 mt-2">
              {pendingCampaigns.map((c) => <CampaignRow key={c.id} campaign={c} />)}
            </div>
          </SectionCard>
        )}

        {/* Cancelled */}
        {cancelledCampaigns.length > 0 && (
          <SectionCard title={`Cancelled (${cancelledCampaigns.length})`}>
            <div className="space-y-2.5 mt-2">
              {cancelledCampaigns.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">{c.name}</p>
                    {c.organization?.name && (
                      <p className="text-[11px] text-slate-400 truncate">{c.organization.name}</p>
                    )}
                  </div>
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                </div>
              ))}
            </div>
          </SectionCard>
        )}
      </div>
    </div>
  );
}
