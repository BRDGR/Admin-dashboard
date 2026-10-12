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
  AlertTriangle,
  ShieldAlert,
  ArrowDown,
  Layers,
  Filter,
} from "lucide-react";
import { SectionCard, StatusBadge, EmptyState } from "@/components/ui";
import type {
  Campaign360OverviewResponse,
  Campaign360CampaignItem,
  FraudAnomalyFlag,
} from "@/lib/types";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { getFraudAnomalyFlags } from "@/lib/api/admin.api";
import { cn } from "@/lib/utils";

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

// 5-Stage Vertical Funnel & Conversion Chart
function FunnelConversionChart() {
  const funnelSteps = [
    {
      label: "1. Reach / Impressions",
      count: 1420000,
      pctOfTop: 100,
      dropoff: "94.0% drop",
      rateText: "Base Exposure",
      color: "bg-blue-600",
      bgLight: "bg-blue-50/60",
    },
    {
      label: "2. Clicks & Referrals",
      count: 85200,
      pctOfTop: 6.0,
      dropoff: "90.0% drop",
      rateText: "6.0% CTR",
      color: "bg-indigo-600",
      bgLight: "bg-indigo-50/60",
    },
    {
      label: "3. Demo / Registrations",
      count: 8520,
      pctOfTop: 0.6,
      dropoff: "75.0% drop",
      rateText: "10.0% Reg Rate",
      color: "bg-purple-600",
      bgLight: "bg-purple-50/60",
    },
    {
      label: "4. Real / Qualified Accounts",
      count: 2130,
      pctOfTop: 0.15,
      dropoff: "50.0% drop",
      rateText: "25.0% Qualification",
      color: "bg-amber-600",
      bgLight: "bg-amber-50/60",
    },
    {
      label: "5. FTD / Commercial Conversions",
      count: 1065,
      pctOfTop: 0.075,
      dropoff: "Final Outcome",
      rateText: "50.0% FTD Rate",
      color: "bg-emerald-600",
      bgLight: "bg-emerald-50/60",
    },
  ];

  return (
    <div className="space-y-3">
      {funnelSteps.map((step, idx) => (
        <div key={step.label} className="relative">
          <div className={cn("p-3.5 rounded-xl border border-slate-200/80 space-y-1.5", step.bgLight)}>
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">{step.label}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {step.count.toLocaleString()}
                </span>
                <span className="text-[11px] font-semibold text-slate-500">({step.rateText})</span>
              </div>
            </div>

            {/* Funnel width visual bar */}
            <div className="h-2 bg-slate-200/80 rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", step.color)}
                style={{
                  width: `${idx === 0 ? 100 : Math.max(100 - idx * 18, 15)}%`,
                }}
              />
            </div>
          </div>

          {idx < funnelSteps.length - 1 && (
            <div className="flex items-center justify-center my-0.5">
              <span className="text-[10px] font-semibold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-200 flex items-center gap-1 shadow-2xs">
                <ArrowDown className="w-2.5 h-2.5 text-slate-400" />
                {step.dropoff}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Fraud & Quality Flags Widget
function FraudAnomalyWidget() {
  const { data: fraudData, isLoading } = useQuery({
    queryKey: ["admin", "campaigns", "fraud-anomalies"],
    queryFn: async () => {
      const res = await getFraudAnomalyFlags();
      if (!res.ok) throw new Error(res.error ?? "Failed to load fraud flags");
      return res.data?.data?.flags ?? [];
    },
  });

  const flags: FraudAnomalyFlag[] = fraudData ?? [];

  return (
    <div className="space-y-3">
      {isLoading ? (
        <div className="p-8 text-center text-xs text-slate-400">Loading fraud telemetry...</div>
      ) : flags.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-400">No anomaly flags recorded.</div>
      ) : (
        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
          {flags.map((flag) => {
            const isCritical = flag.severity === "critical";
            const isHigh = flag.severity === "high";

            return (
              <div key={flag.id} className="p-3.5 space-y-1.5 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                        isCritical
                          ? "bg-rose-100 text-rose-700"
                          : isHigh
                          ? "bg-amber-100 text-amber-700"
                          : "bg-blue-100 text-blue-700"
                      )}
                    >
                      {flag.severity}
                    </span>
                    <span className="text-xs font-bold text-slate-900 font-mono">{flag.id}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 capitalize">
                    {flag.status.replace(/_/g, " ")}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-snug">{flag.description}</p>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>
                    Partner: <strong className="text-slate-800">{flag.partnerName}</strong> ({flag.partnerId})
                  </span>
                  <span>Impacted: <strong className="text-slate-800">{flag.count.toLocaleString()}</strong> events</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
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

      {/* Grid: 5-Stage Funnel & Fraud Anomaly Flags */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard
          title="Funnel & Conversion Flow"
          subtitle="Full vertical telemetry across Reach → Clicks → Demo/Reg → Real/Qualified → FTD/Sale"
        >
          <div className="mt-3">
            <FunnelConversionChart />
          </div>
        </SectionCard>

        <SectionCard
          title="Fraud & Quality Flags"
          subtitle="Flagged clicks, bot clusters, duplicate IP detection, and conversion rate anomalies"
        >
          <div className="mt-3">
            <FraudAnomalyWidget />
          </div>
        </SectionCard>
      </div>

      {/* Active & Matching Campaigns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title={`Active Campaigns (${activeCampaigns.length})`}>
          <div className="space-y-2.5 mt-2">
            {activeCampaigns.length > 0 ? (
              activeCampaigns.map((c) => <CampaignRow key={c.id} campaign={c} />)
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">No active campaigns.</p>
            )}
          </div>
        </SectionCard>

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
