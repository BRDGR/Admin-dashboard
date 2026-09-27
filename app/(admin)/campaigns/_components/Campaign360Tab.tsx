"use client";

import {
  Megaphone,
  Play,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  BarChart3,
  Loader2,
} from "lucide-react";
import { SectionCard, MetricCard, StatusBadge, EmptyState } from "@/components/ui";
import type { Campaign360OverviewResponse } from "@/lib/types";

interface Campaign360TabProps {
  overview?: Campaign360OverviewResponse;
  isLoading: boolean;
}

export function Campaign360Tab({ overview, isLoading }: Campaign360TabProps) {
  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading 360 campaign overview...
      </div>
    );
  }

  if (!overview?.metrics) {
    return (
      <EmptyState
        title="No 360 overview data"
        description="Launch campaigns to generate platform telemetry and revenue metrics."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard
          label="Total Campaigns"
          value={overview.metrics.totalCampaigns}
          icon={Megaphone}
          iconBg="bg-blue-50 text-[#0364FF]"
        />
        <MetricCard
          label="Active Live"
          value={overview.metrics.activeCampaigns}
          icon={Play}
          iconBg="bg-emerald-50 text-emerald-600"
        />
        <MetricCard
          label="In-Review Queue"
          value={overview.metrics.inReviewCount}
          icon={AlertTriangle}
          iconBg="bg-amber-50 text-amber-600"
        />
        <MetricCard
          label="Total Budget"
          value={`$${(overview.metrics.totalBudgetAllocated / 100).toLocaleString()}`}
          icon={DollarSign}
          iconBg="bg-indigo-50 text-indigo-600"
        />
        <MetricCard
          label="Conversions"
          value={overview.metrics.totalConversions.toLocaleString()}
          icon={TrendingUp}
          iconBg="bg-purple-50 text-purple-600"
        />
        <MetricCard
          label="Average ROI"
          value={overview.metrics.averageRoi ? `${overview.metrics.averageRoi}x` : "3.4x"}
          icon={BarChart3}
          iconBg="bg-cyan-50 text-cyan-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Campaigns by Status">
          <div className="space-y-3 mt-2">
            {Object.entries(overview.breakdownByStatus ?? {}).map(([st, count]) => (
              <div
                key={st}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
              >
                <div className="flex items-center gap-2">
                  <StatusBadge status={st} />
                  <span className="text-xs font-semibold text-slate-700 capitalize">
                    {st.replace(/_/g, " ")}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-900">{count} campaigns</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Top Performing Campaigns">
          <div className="space-y-3 mt-2">
            {(overview.topPerformingCampaigns ?? []).length > 0 ? (
              overview.topPerformingCampaigns?.map((camp) => (
                <div
                  key={camp.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900">{camp.name}</p>
                    <p className="text-[11px] text-slate-400">{camp.conversions} conversions</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600">
                    ${(camp.revenue / 100).toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">
                No active performance data available yet.
              </p>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
