"use client";

import { useState, useMemo } from "react";
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
  Search,
  X,
  Sparkles,
  BarChart3,
  Activity,
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
      bgLight: "bg-blue-50/50",
    },
    {
      label: "2. Clicks & Referrals",
      count: 85200,
      pctOfTop: 6.0,
      dropoff: "90.0% drop",
      rateText: "6.0% CTR",
      color: "bg-indigo-600",
      bgLight: "bg-indigo-50/50",
    },
    {
      label: "3. Demo / Registrations",
      count: 8520,
      pctOfTop: 0.6,
      dropoff: "75.0% drop",
      rateText: "10.0% Reg Rate",
      color: "bg-purple-600",
      bgLight: "bg-purple-50/50",
    },
    {
      label: "4. Real / Qualified Accounts",
      count: 2130,
      pctOfTop: 0.15,
      dropoff: "50.0% drop",
      rateText: "25.0% Qualification",
      color: "bg-amber-600",
      bgLight: "bg-amber-50/50",
    },
    {
      label: "5. FTD / Commercial Conversions",
      count: 1065,
      pctOfTop: 0.075,
      dropoff: "Final Outcome",
      rateText: "50.0% FTD Rate",
      color: "bg-emerald-600",
      bgLight: "bg-emerald-50/50",
    },
  ];

  return (
    <div className="space-y-2.5">
      {funnelSteps.map((step, idx) => (
        <div key={step.label} className="relative">
          <div className={cn("p-3 sm:p-3.5 rounded-xl border border-slate-200/80 space-y-1.5", step.bgLight)}>
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 truncate pr-2" title={step.label}>
                {step.label}
              </span>
              <div className="flex items-center gap-2 shrink-0">
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
        <div className="divide-y divide-slate-100 border border-slate-200/90 rounded-2xl overflow-hidden bg-white max-h-[350px] overflow-y-auto">
          {flags.map((flag) => {
            const isCritical = flag.severity === "critical";
            const isHigh = flag.severity === "high";

            return (
              <div key={flag.id} className="p-3.5 space-y-1.5 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0",
                        isCritical
                          ? "bg-rose-100 text-rose-700"
                          : isHigh
                          ? "bg-amber-100 text-amber-700"
                          : "bg-blue-100 text-blue-700"
                      )}
                    >
                      {flag.severity}
                    </span>
                    <span
                      className="text-xs font-bold text-slate-900 font-mono truncate"
                      title={flag.id}
                    >
                      {flag.id}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 capitalize shrink-0">
                    {flag.status.replace(/_/g, " ")}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-snug line-clamp-2" title={flag.description}>
                  {flag.description}
                </p>

                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1 gap-1">
                  <span className="truncate max-w-[200px]" title={`${flag.partnerName} (${flag.partnerId})`}>
                    Partner: <strong className="text-slate-800">{flag.partnerName}</strong> ({flag.partnerId})
                  </span>
                  <span className="shrink-0 font-medium">
                    Impacted: <strong className="text-slate-800">{flag.count.toLocaleString()}</strong> events
                  </span>
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
  const [matrixFilter, setMatrixFilter] = useState<"ALL" | "active" | "matching" | "pending" | "cancelled">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const campaigns = useMemo(() => overview?.campaigns ?? [], [overview?.campaigns]);
  const summary = overview?.summary;

  const activeCampaigns = useMemo(() => campaigns.filter((c) => c.status === "active"), [campaigns]);
  const matchingCampaigns = useMemo(() => campaigns.filter((c) => c.status === "matching"), [campaigns]);
  const cancelledCampaigns = useMemo(() => campaigns.filter((c) => c.status === "cancelled"), [campaigns]);
  const pendingCampaigns = useMemo(
    () => campaigns.filter((c) => !["active", "matching", "cancelled", "completed"].includes(c.status)),
    [campaigns]
  );

  // Filtered campaigns for the Unified Matrix
  const filteredMatrixCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      if (matrixFilter === "active" && c.status !== "active") return false;
      if (matrixFilter === "matching" && c.status !== "matching") return false;
      if (matrixFilter === "cancelled" && c.status !== "cancelled") return false;
      if (matrixFilter === "pending" && ["active", "matching", "cancelled", "completed"].includes(c.status)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const orgName = c.organization?.name?.toLowerCase() ?? "";
        return c.name.toLowerCase().includes(q) || orgName.includes(q) || (c.category?.toLowerCase() ?? "").includes(q);
      }
      return true;
    });
  }, [campaigns, matrixFilter, searchQuery]);

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading 360 campaign overview...
      </div>
    );
  }

  if (!summary) {
    return (
      <EmptyState
        title="No 360 overview data"
        description="Launch campaigns to generate platform telemetry and performance metrics."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── 1. Executive Telemetry Command Ribbon ─── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3.5 sm:p-5">
        <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0364FF] flex items-center justify-center font-bold">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Campaign Operations Center</h3>
              <p className="text-[11px] text-slate-500">Live system-wide operational velocity, partner saturation & funnels</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Telemetry Engine
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/70 hover:bg-blue-50/40 hover:border-blue-200 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total</span>
              <Megaphone className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <p className="text-xl font-bold text-slate-900 mt-1">{summary.totalCampaigns}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Total registered campaigns</p>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/80 hover:bg-emerald-50 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Active Live</span>
              <Play className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <p className="text-xl font-bold text-emerald-900 mt-1">{summary.activeCampaigns}</p>
            <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Real-time attribution on</p>
          </div>

          <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-200/80 hover:bg-indigo-50 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider">Matching</span>
              <GitMerge className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <p className="text-xl font-bold text-indigo-900 mt-1">{summary.matchingCampaigns}</p>
            <p className="text-[10px] text-indigo-600 font-medium mt-0.5">Partner assignment ready</p>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/80 hover:bg-amber-50 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">Pending</span>
              <Clock className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <p className="text-xl font-bold text-amber-900 mt-1">{summary.pendingReviewCampaigns}</p>
            <p className="text-[10px] text-amber-600 font-medium mt-0.5">Awaiting ops verification</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/70 hover:bg-slate-100 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Completed</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" />
            </div>
            <p className="text-xl font-bold text-slate-900 mt-1">{summary.completedCampaigns}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Closed & fully settled</p>
          </div>
        </div>
      </div>

      {/* ─── 2. Split Telemetry Command Center: 5-Stage Funnel & Fraud Sentinels ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
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

      {/* ─── 3. Unified Live Campaigns Matrix (Clean Tabbed Data Table replacing disjointed grid cards) ─── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Matrix Header & Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Live Campaign Matrix ({campaigns.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Consolidated view of campaign status, partner saturation, traffic velocity, and achievement targets
              </p>
            </div>

            {/* Quick Search inside matrix */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search matrix campaigns..."
                className="w-full text-xs pl-8.5 pr-7 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200/90 rounded-xl text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0364FF]/20 focus:border-[#0364FF] transition-all font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer font-bold"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Segmented Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <button
              type="button"
              onClick={() => setMatrixFilter("ALL")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5",
                matrixFilter === "ALL"
                  ? "bg-slate-900 text-white shadow-xs font-bold"
                  : "bg-slate-100/80 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
              )}
            >
              <span>All Statuses</span>
              <span className={cn("px-1.5 py-0.2 rounded-full text-[10px] font-mono", matrixFilter === "ALL" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600")}>
                {campaigns.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMatrixFilter("active")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5",
                matrixFilter === "active"
                  ? "bg-emerald-600 text-white shadow-xs font-bold"
                  : "bg-slate-100/80 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
              )}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Active</span>
              <span className={cn("px-1.5 py-0.2 rounded-full text-[10px] font-mono", matrixFilter === "active" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600")}>
                {activeCampaigns.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMatrixFilter("matching")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5",
                matrixFilter === "matching"
                  ? "bg-indigo-600 text-white shadow-xs font-bold"
                  : "bg-slate-100/80 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
              )}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <span>Matching</span>
              <span className={cn("px-1.5 py-0.2 rounded-full text-[10px] font-mono", matrixFilter === "matching" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600")}>
                {matchingCampaigns.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMatrixFilter("pending")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5",
                matrixFilter === "pending"
                  ? "bg-amber-600 text-white shadow-xs font-bold"
                  : "bg-slate-100/80 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
              )}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Pending Review</span>
              <span className={cn("px-1.5 py-0.2 rounded-full text-[10px] font-mono", matrixFilter === "pending" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600")}>
                {pendingCampaigns.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMatrixFilter("cancelled")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5",
                matrixFilter === "cancelled"
                  ? "bg-rose-600 text-white shadow-xs font-bold"
                  : "bg-slate-100/80 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
              )}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              <span>Cancelled</span>
              <span className={cn("px-1.5 py-0.2 rounded-full text-[10px] font-mono", matrixFilter === "cancelled" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600")}>
                {cancelledCampaigns.length}
              </span>
            </button>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 min-w-[220px]">Campaign & Client</th>
                <th className="py-3 px-4 min-w-[140px]">Category & Period</th>
                <th className="py-3 px-4 min-w-[160px]">Partner Allocation</th>
                <th className="py-3 px-4 min-w-[150px]">Traffic Attainment</th>
                <th className="py-3 px-4 min-w-[160px]">Achievement %</th>
                <th className="py-3 px-4 text-center w-28">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMatrixCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No campaigns found in this telemetry slice.
                  </td>
                </tr>
              ) : (
                filteredMatrixCampaigns.map((c) => {
                  const achievement = c.achievementPct ?? 0;
                  const barColor =
                    achievement >= 75
                      ? "bg-emerald-500"
                      : achievement >= 40
                      ? "bg-amber-400"
                      : "bg-rose-400";
                  const initial = (c.name || "C")[0].toUpperCase();

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Campaign & Client */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-[#0364FF] text-xs shrink-0 shadow-2xs">
                            {initial}
                          </div>
                          <div className="min-w-0">
                            <p
                              className="font-bold text-slate-900 text-xs truncate max-w-[200px] sm:max-w-[240px]"
                              title={c.name}
                            >
                              {c.name}
                            </p>
                            {c.organization?.name && (
                              <div className="flex items-center gap-1 mt-0.5 text-slate-500">
                                <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                                <span
                                  className="text-[11px] truncate max-w-[150px] sm:max-w-[190px]"
                                  title={c.organization.name}
                                >
                                  {c.organization.name}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category & Period */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {c.category ? (
                            <span
                              className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100 truncate max-w-[130px]"
                              title={c.category}
                            >
                              <Tag className="w-2.5 h-2.5 shrink-0" />
                              <span className="truncate">{c.category}</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium">—</span>
                          )}

                          {c.startDate && c.endDate ? (
                            <div className="flex items-center gap-1 text-[11px] text-slate-500">
                              <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>
                                {format(new Date(c.startDate), "MMM d")} – {format(new Date(c.endDate), "MMM d, yyyy")}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 block">Continuous</span>
                          )}
                        </div>
                      </td>

                      {/* Partner Allocation */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs">
                            <Users className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="font-bold text-slate-900">{c.activePartners ?? 0}</span>
                            <span className="text-slate-400">/</span>
                            <span className="text-slate-600 font-medium">{c.partnersAssigned ?? 0} assigned</span>
                          </div>
                          <div className="w-28 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                            <div
                              className="h-full bg-[#0364FF] rounded-full transition-all"
                              style={{
                                width: `${
                                  (c.partnersAssigned ?? 0) > 0
                                    ? Math.min(((c.activePartners ?? 0) / (c.partnersAssigned ?? 1)) * 100, 100)
                                    : 0
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Traffic Attainment */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs">
                          <TrendingUp className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="font-bold text-slate-900">
                            {(c.totalTraffic ?? 0).toLocaleString()}
                          </span>
                          <span className="text-slate-400">/</span>
                          <span className="text-slate-600">{(c.targetTraffic ?? 0).toLocaleString()}</span>
                        </div>
                      </td>

                      {/* Achievement % */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-1 max-w-[130px]">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-500 font-medium">Attainment</span>
                            <span className="font-mono font-bold text-slate-800">{achievement.toFixed(0)}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                            <div
                              className={cn("h-full rounded-full transition-all", barColor)}
                              style={{ width: `${Math.min(achievement, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <StatusBadge status={c.status} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
