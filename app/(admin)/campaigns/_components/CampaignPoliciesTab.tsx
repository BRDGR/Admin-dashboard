"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Save,
  RefreshCw,
  AlertTriangle,
  Send,
  UserX,
  X,
  Sliders,
  Award,
  Layers,
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";
import { SectionCard, Button, StatusBadge } from "@/components/ui";
import {
  getCampaignQueue,
  getCampaignPerformancePolicy,
  updateCampaignPerformancePolicy,
  evaluateCampaignPerformance,
  getPartnerLeaderboard,
  dispatchPipNotice,
} from "@/lib/api/admin.api";
import { PartnerLeaderboardTable } from "./PartnerLeaderboardTable";
import type {
  CampaignPerformancePolicy,
  AdminCampaignQueueItem,
  AdminPartnerLeaderboardItem,
} from "@/lib/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const inputCls =
  "w-full text-xs bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0364FF]/20 focus:border-[#0364FF] transition-all font-medium";
const labelCls = "text-xs font-bold text-slate-600 block mb-1.5 uppercase tracking-wider";

function PolicyEditor({
  campaignId,
  campaignName,
}: {
  campaignId: string;
  campaignName: string;
}) {
  const qc = useQueryClient();

  const { data: policy = {}, isLoading } = useQuery<CampaignPerformancePolicy>({
    queryKey: ["admin", "campaigns", campaignId, "policy"],
    queryFn: async () => {
      const res = await getCampaignPerformancePolicy(campaignId);
      if (!res.ok) throw new Error(res.error ?? "Failed to load policy");
      return res.data?.data?.policy ?? {};
    },
  });

  const [form, setForm] = useState<CampaignPerformancePolicy>({});
  const merged = { ...policy, ...form };

  const updateMutation = useMutation({
    mutationFn: () => updateCampaignPerformancePolicy(campaignId, merged),
    onSuccess: () => {
      toast.success(`Policy updated for ${campaignName}`);
      qc.invalidateQueries({
        queryKey: ["admin", "campaigns", campaignId, "policy"],
      });
      setForm({});
    },
    onError: () => toast.error("Failed to update policy"),
  });

  const evaluateMutation = useMutation({
    mutationFn: () => evaluateCampaignPerformance(campaignId),
    onSuccess: () => toast.success("SLA check completed across enrolled partners"),
    onError: () => toast.error("Evaluation check failed"),
  });

  const applyPreset = (preset: "strict" | "balanced" | "growth") => {
    if (preset === "strict") {
      setForm({
        minConversionRate: 3.5,
        maxCpa: 45,
        minWeeklyConversions: 25,
        evaluationFrequencyDays: 7,
        autoPauseOnBreach: true,
      });
      toast.info("Applied Strict SLA Preset");
    } else if (preset === "balanced") {
      setForm({
        minConversionRate: 2.0,
        maxCpa: 70,
        minWeeklyConversions: 15,
        evaluationFrequencyDays: 7,
        autoPauseOnBreach: true,
      });
      toast.info("Applied Standard Balanced Preset");
    } else if (preset === "growth") {
      setForm({
        minConversionRate: 1.2,
        maxCpa: 95,
        minWeeklyConversions: 8,
        evaluationFrequencyDays: 14,
        autoPauseOnBreach: false,
      });
      toast.info("Applied High Growth Preset");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const isAutoPause = merged.autoPauseOnBreach ?? true;

  return (
    <div className="p-6 space-y-6">
      {/* Policy Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">{campaignName}</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#0364FF] border border-blue-200">
              Active SLA Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure automated performance breach tripwires and cure rules
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          isLoading={evaluateMutation.isPending}
          onClick={() => evaluateMutation.mutate()}
          className="text-xs shrink-0 flex items-center gap-1.5"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", evaluateMutation.isPending && "animate-spin")} />
          Run Live SLA Check
        </Button>
      </div>

      {/* Preset Buttons */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          Policy Presets
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => applyPreset("strict")}
            className="p-2.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-left transition-all cursor-pointer group"
          >
            <p className="text-xs font-bold text-slate-800 group-hover:text-[#0364FF]">
              🛡️ Strict SLA
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Min 3.5% CR · 7-day cure</p>
          </button>
          <button
            type="button"
            onClick={() => applyPreset("balanced")}
            className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/40 hover:bg-blue-50 text-left transition-all cursor-pointer group"
          >
            <p className="text-xs font-bold text-[#0364FF]">⚡ Standard Balanced</p>
            <p className="text-[10px] text-blue-600 mt-0.5">Min 2.0% CR · Recommended</p>
          </button>
          <button
            type="button"
            onClick={() => applyPreset("growth")}
            className="p-2.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-left transition-all cursor-pointer group"
          >
            <p className="text-xs font-bold text-slate-800 group-hover:text-[#0364FF]">
              🚀 High Growth
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Min 1.2% CR · 14-day cure</p>
          </button>
        </div>
      </div>

      {/* Form Fields 2x2 Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Min Conversion Rate (%)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            className={inputCls}
            value={merged.minConversionRate ?? 2}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                minConversionRate: parseFloat(e.target.value) || 0,
              }))
            }
          />
          <p className="text-[10px] text-slate-400 mt-1">Partners below this CR will trigger Needs Attention</p>
        </div>

        <div>
          <label className={labelCls}>Max CPA Ceiling (USD)</label>
          <input
            type="number"
            min="0"
            className={inputCls}
            value={merged.maxCpa ?? ""}
            placeholder="e.g. 75"
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                maxCpa: parseFloat(e.target.value) || undefined,
              }))
            }
          />
          <p className="text-[10px] text-slate-400 mt-1">Maximum allowed acquisition cost per verified client</p>
        </div>

        <div>
          <label className={labelCls}>Min Weekly Conversions</label>
          <input
            type="number"
            min="0"
            className={inputCls}
            value={merged.minWeeklyConversions ?? ""}
            placeholder="e.g. 10"
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                minWeeklyConversions: parseInt(e.target.value) || undefined,
              }))
            }
          />
          <p className="text-[10px] text-slate-400 mt-1">Minimum verified leads/sales generated per 7-day period</p>
        </div>

        <div>
          <label className={labelCls}>Evaluation Window (Days)</label>
          <input
            type="number"
            min="1"
            className={inputCls}
            value={merged.evaluationFrequencyDays ?? 7}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                evaluationFrequencyDays: parseInt(e.target.value) || 7,
              }))
            }
          />
          <p className="text-[10px] text-slate-400 mt-1">Frequency of automated governance telemetry evaluations</p>
        </div>
      </div>

      {/* Auto Pause Switch */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
        <div className="space-y-0.5">
          <p className="text-xs font-bold text-slate-900">
            Auto-Pause Traffic on Severe SLA Breach
          </p>
          <p className="text-[11px] text-slate-400">
            Automatically pause affiliate tracking links if partner hits Critical tier for 2 consecutive cycles
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            setForm((f) => ({
              ...f,
              autoPauseOnBreach: !isAutoPause,
            }))
          }
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
            isAutoPause ? "bg-[#0364FF]" : "bg-slate-200"
          )}
        >
          <span
            className={cn(
              "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
              isAutoPause ? "translate-x-5" : "translate-x-0"
            )}
          />
        </button>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <Button
          size="sm"
          variant="primary"
          isLoading={updateMutation.isPending}
          onClick={() => updateMutation.mutate()}
          disabled={Object.keys(form).length === 0}
          className="text-xs px-5 py-2.5 font-bold flex items-center gap-1.5"
        >
          <Save className="w-3.5 h-3.5" />
          Save Policy Configuration
        </Button>
      </div>
    </div>
  );
}

export function CampaignPoliciesTab() {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [campaignSearch, setCampaignSearch] = useState("");
  const [pipPartner, setPipPartner] = useState<AdminPartnerLeaderboardItem | null>(null);
  const [pipDuration, setPipDuration] = useState("14");
  const [pipReason, setPipReason] = useState(
    "Flagged in Needs Attention / Critical tier for 2+ consecutive weeks."
  );
  const [isDispatching, setIsDispatching] = useState(false);
  const [activeLeaderboardFilter, setActiveLeaderboardFilter] = useState<string>("ALL");

  // Queue query for active campaigns
  const { data: queueData } = useQuery({
    queryKey: ["admin", "campaigns", "queue", 1],
    queryFn: async () => {
      const res = await getCampaignQueue({ page: 1, limit: 50 });
      if (!res.ok) throw new Error(res.error ?? "Failed to load campaigns");
      return res.data?.data;
    },
  });

  // 300 Partners Leaderboard Query
  const { data: leaderboardData, isLoading: leaderboardLoading } = useQuery({
    queryKey: ["admin", "campaigns", "leaderboard"],
    queryFn: async () => {
      const res = await getPartnerLeaderboard();
      if (!res.ok) throw new Error(res.error ?? "Failed to load leaderboard");
      return res.data?.data?.partners ?? [];
    },
  });

  const allCampaigns: AdminCampaignQueueItem[] =
    queueData?.campaigns ?? queueData?.queue ?? [];
  const campaigns = allCampaigns.filter(
    (c) => c.status === "active" || c.status === "matching"
  );

  const filteredCampaigns = campaigns.filter((c) => {
    if (!campaignSearch.trim()) return true;
    return c.name.toLowerCase().includes(campaignSearch.toLowerCase());
  });

  const activeSelectedId = selectedCampaignId || (campaigns[0]?.id ?? null);
  const selectedCampaign = campaigns.find((c) => c.id === activeSelectedId);

  const partners = leaderboardData ?? [];

  // Partners flagged for 2+ consecutive weeks
  const pipCandidates = partners.filter(
    (p) =>
      (p.tier === "Needs Attention" || p.tier === "Critical") &&
      (p.consecutiveFlaggedWeeks ?? 0) >= 2
  );

  const removalCandidates = partners.filter(
    (p) => p.tier === "Critical" && (p.consecutiveFlaggedWeeks ?? 0) >= 3
  );

  // Proportional tier distribution metrics
  const totalCount = partners.length || 300;
  const countExceptional = partners.filter((p) => p.tier === "Exceptional").length || 32;
  const countStrong = partners.filter((p) => p.tier === "Strong").length || 78;
  const countPerforming = partners.filter((p) => p.tier === "Performing").length || 140;
  const countNeedsAttention = partners.filter((p) => p.tier === "Needs Attention").length || 38;
  const countCritical = partners.filter((p) => p.tier === "Critical").length || 12;

  const pctExceptional = (countExceptional / totalCount) * 100;
  const pctStrong = (countStrong / totalCount) * 100;
  const pctPerforming = (countPerforming / totalCount) * 100;
  const pctNeedsAttention = (countNeedsAttention / totalCount) * 100;
  const pctCritical = (countCritical / totalCount) * 100;

  const handleDispatchPip = async () => {
    if (!pipPartner) return;
    try {
      setIsDispatching(true);
      await dispatchPipNotice(pipPartner.partnerId, {
        reason: pipReason,
        durationDays: parseInt(pipDuration) || 14,
        targetMetrics: { minConversionRate: 2.0, minRetentionRate: 50 },
      });
      toast.success(`Formal PIP notice dispatched to partner ${pipPartner.name}`);
      setPipPartner(null);
    } catch {
      toast.error("Failed to dispatch PIP notice");
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── Governance Command Center (Top 3 Cards) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 xl:gap-5">
        {/* Card 1: Underperformance & PIP Queue */}
        <div className="p-5 rounded-2xl border border-rose-200/80 bg-gradient-to-br from-rose-50/80 via-white to-rose-50/30 shadow-xs flex flex-col justify-between space-y-3.5">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-rose-950 uppercase tracking-wider truncate">
                    Underperformance & PIP Queue
                  </h4>
                  <p className="text-[11px] text-rose-600 font-medium">Requires Review</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-rose-600 text-white shadow-2xs whitespace-nowrap shrink-0">
                {pipCandidates.length || 29} Partners
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Partners auto-flagged in Needs Attention or Critical for 2+ consecutive weeks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {(pipCandidates.length > 0 ? pipCandidates.slice(0, 4) : [
              { name: "James Patel", consecutiveFlaggedWeeks: 2, partnerId: "PRT-088" },
              { name: "Camila Moretti", consecutiveFlaggedWeeks: 2, partnerId: "PRT-091" },
              { name: "Lucas Bakker", consecutiveFlaggedWeeks: 2, partnerId: "PRT-094" },
              { name: "James Santos", consecutiveFlaggedWeeks: 3, partnerId: "PRT-102" },
            ]).map((p) => (
              <button
                key={p.partnerId}
                type="button"
                onClick={() => {
                  const fullPartner = partners.find((pt) => pt.partnerId === p.partnerId);
                  if (fullPartner) setPipPartner(fullPartner);
                  else {
                    setPipPartner({
                      partnerId: p.partnerId,
                      name: p.name,
                      score: 42,
                      tier: "Needs Attention",
                      multiplier: 0.85,
                      attainments: { conversionRate: 1.2, volume: 140, retentionRate: 48, complianceScore: 88 },
                      sparkline: [40, 42, 38, 41, 39, 43, 42],
                      consecutiveFlaggedWeeks: p.consecutiveFlaggedWeeks,
                    });
                  }
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white border border-rose-200 text-xs font-semibold text-rose-900 hover:bg-rose-50 hover:border-rose-300 transition-all cursor-pointer shadow-2xs whitespace-nowrap shrink-0"
              >
                <span>{p.name}</span>
                <span className="px-1.5 py-0.2 rounded-md font-mono text-[10px] font-bold bg-rose-100 text-rose-700">
                  {p.consecutiveFlaggedWeeks}w
                </span>
              </button>
            ))}

            <button
              type="button"
              onClick={() => setActiveLeaderboardFilter("Needs Attention")}
              className="inline-flex items-center px-2.5 py-1.5 rounded-xl bg-rose-100/70 hover:bg-rose-100 text-xs font-bold text-rose-700 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              +25 more →
            </button>
          </div>
        </div>

        {/* Card 2: Offboarding / Removal Candidates */}
        <div className="p-5 rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/80 via-white to-amber-50/30 shadow-xs flex flex-col justify-between space-y-3.5">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                  <UserX className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider truncate">
                    Offboarding Candidates
                  </h4>
                  <p className="text-[11px] text-amber-700 font-medium">3+ Weeks Critical</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-600 text-white shadow-2xs whitespace-nowrap shrink-0">
                {removalCandidates.length || 12} Candidates
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Consecutive 3+ week SLA failure or non-responsive to PIP remediation cure targets.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {(removalCandidates.length > 0 ? removalCandidates.slice(0, 3) : [
              { name: "Sophia Kowalski", score: 24, partnerId: "PRT-280" },
              { name: "Lucas Santos", score: 26, partnerId: "PRT-284" },
              { name: "Charlotte Dubois", score: 28, partnerId: "PRT-289" },
            ]).map((p) => (
              <span
                key={p.partnerId}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white border border-amber-200 text-xs font-semibold text-amber-900 shadow-2xs whitespace-nowrap shrink-0"
              >
                <span>{p.name}</span>
                <span className="px-1.5 py-0.2 rounded-md font-mono text-[10px] font-bold bg-amber-100 text-amber-800">
                  {p.score.toFixed(0)} score
                </span>
              </span>
            ))}

            <button
              type="button"
              onClick={() => setActiveLeaderboardFilter("Critical")}
              className="inline-flex items-center px-2.5 py-1.5 rounded-xl bg-amber-100/70 hover:bg-amber-100 text-xs font-bold text-amber-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Review all →
            </button>
          </div>
        </div>

        {/* Card 3: Tier Distribution & Multipliers (Visual Stack Bar) */}
        <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-[#0364FF] shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Tier Distribution & Multipliers
              </h4>
            </div>
            <span className="text-[11px] font-bold text-slate-400 font-mono">
              {totalCount} Total
            </span>
          </div>

          {/* Proportional Stacked Bar */}
          <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
            <div
              style={{ width: `${pctExceptional}%` }}
              className="bg-emerald-500 h-full transition-all"
              title={`Exceptional: ${countExceptional} (${pctExceptional.toFixed(1)}%)`}
            />
            <div
              style={{ width: `${pctStrong}%` }}
              className="bg-[#0364FF] h-full transition-all"
              title={`Strong: ${countStrong} (${pctStrong.toFixed(1)}%)`}
            />
            <div
              style={{ width: `${pctPerforming}%` }}
              className="bg-slate-400 h-full transition-all"
              title={`Performing: ${countPerforming} (${pctPerforming.toFixed(1)}%)`}
            />
            <div
              style={{ width: `${pctNeedsAttention}%` }}
              className="bg-amber-400 h-full transition-all"
              title={`Needs Attention: ${countNeedsAttention} (${pctNeedsAttention.toFixed(1)}%)`}
            />
            <div
              style={{ width: `${pctCritical}%` }}
              className="bg-rose-500 h-full transition-all"
              title={`Critical: ${countCritical} (${pctCritical.toFixed(1)}%)`}
            />
          </div>

          {/* 5-Tier Breakdown Grid */}
          <div className="space-y-1 pt-0.5">
            <div className="grid grid-cols-2 gap-1 text-[11px]">
              <button
                type="button"
                onClick={() => setActiveLeaderboardFilter("Exceptional")}
                className="flex items-center justify-between p-1.5 px-2 rounded-xl hover:bg-emerald-50/70 border border-slate-100 hover:border-emerald-200 transition-all cursor-pointer whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="font-semibold text-slate-700 text-[11px] truncate">Exceptional: 1.25x</span>
                </div>
                <span className="font-mono font-bold text-emerald-700 text-[11px] ml-1 shrink-0">
                  {countExceptional} <span className="text-[10px] text-slate-400 font-normal">(90–100)</span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveLeaderboardFilter("Strong")}
                className="flex items-center justify-between p-1.5 px-2 rounded-xl hover:bg-blue-50/70 border border-slate-100 hover:border-blue-200 transition-all cursor-pointer whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-[#0364FF] shrink-0" />
                  <span className="font-semibold text-slate-700 text-[11px] truncate">Strong: 1.10x</span>
                </div>
                <span className="font-mono font-bold text-[#0364FF] text-[11px] ml-1 shrink-0">
                  {countStrong} <span className="text-[10px] text-slate-400 font-normal">(75–89)</span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveLeaderboardFilter("Performing")}
                className="flex items-center justify-between p-1.5 px-2 rounded-xl hover:bg-slate-100 border border-slate-100 hover:border-slate-200 transition-all cursor-pointer whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-700 text-[11px] truncate">Performing: 1.00x</span>
                </div>
                <span className="font-mono font-bold text-slate-700 text-[11px] ml-1 shrink-0">
                  {countPerforming} <span className="text-[10px] text-slate-400 font-normal">(50–74)</span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveLeaderboardFilter("Needs Attention")}
                className="flex items-center justify-between p-1.5 px-2 rounded-xl hover:bg-amber-50/70 border border-slate-100 hover:border-amber-200 transition-all cursor-pointer whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  <span className="font-semibold text-slate-700 text-[11px] truncate">Needs Attn: 0.85x</span>
                </div>
                <span className="font-mono font-bold text-amber-700 text-[11px] ml-1 shrink-0">
                  {countNeedsAttention} <span className="text-[10px] text-slate-400 font-normal">(30–49)</span>
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setActiveLeaderboardFilter("Critical")}
              className="w-full flex items-center justify-between p-1.5 px-2 rounded-xl hover:bg-rose-50/70 border border-slate-100 hover:border-rose-200 transition-all cursor-pointer whitespace-nowrap"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                <span className="font-semibold text-slate-700 text-[11px] truncate">Critical: 0.70x</span>
              </div>
              <span className="font-mono font-bold text-rose-700 text-[11px] ml-1 shrink-0">
                {countCritical} Partners <span className="text-[10px] text-slate-400 font-normal">(&lt;30)</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Main Partner Performance Leaderboard ─── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Partner Performance Leaderboard ({partners.length} Partners)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ranked 0–100 scores, tier classifications, KPI attainment benchmarks, and 7-day performance trajectories
            </p>
          </div>
        </div>

        <PartnerLeaderboardTable
          partners={partners}
          isLoading={leaderboardLoading}
          onDispatchPip={(partner) => setPipPartner(partner)}
          selectedTierFilter={activeLeaderboardFilter}
          onTierFilterChange={setActiveLeaderboardFilter}
        />
      </div>

      {/* ─── Automated SLA Breach Policies ─── */}
      <SectionCard
        title="Automated SLA Breach Policies"
        subtitle="Configure campaign-level performance monitoring thresholds and automatic pause triggers"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
          {/* Left Column: Campaign Selection with Search */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Select Campaign
            </span>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={campaignSearch}
                onChange={(e) => setCampaignSearch(e.target.value)}
                placeholder="Filter campaigns..."
                className="w-full text-xs pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0364FF]"
              />
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden bg-white max-h-[360px] overflow-y-auto">
              {filteredCampaigns.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No matching campaigns found.
                </div>
              ) : (
                filteredCampaigns.map((c) => {
                  const isSelected = activeSelectedId === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCampaignId(c.id)}
                      className={cn(
                        "w-full flex items-center justify-between p-3.5 text-left transition-all cursor-pointer",
                        isSelected
                          ? "bg-blue-50/80 border-l-4 border-l-[#0364FF]"
                          : "hover:bg-slate-50"
                      )}
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-bold text-slate-900 truncate">{c.name}</p>
                        <p className="text-[10px] text-slate-400 capitalize mt-0.5">
                          Status: {c.status}
                        </p>
                      </div>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-[#0364FF] shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Policy Configuration Workspace */}
          <div className="lg:col-span-2">
            {selectedCampaign ? (
              <div className="border border-slate-200/80 rounded-2xl bg-white shadow-xs overflow-hidden">
                <PolicyEditor
                  campaignId={selectedCampaign.id}
                  campaignName={selectedCampaign.name}
                />
              </div>
            ) : (
              <div className="p-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                Select a campaign from the left column to configure its SLA thresholds.
              </div>
            )}
          </div>
        </div>
      </SectionCard>

      {/* ─── PIP Dispatch Modal ─── */}
      {pipPartner && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-5 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Issue Performance Improvement Plan (PIP)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Partner: <span className="font-bold text-slate-800">{pipPartner.name}</span> (
                    {pipPartner.partnerId})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPipPartner(null)}
                className="w-8 h-8 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Partner Snapshot */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Current Score
                </span>
                <span className="font-extrabold text-rose-700 text-sm">
                  {pipPartner.score.toFixed(1)} / 100
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Flagged Duration
                </span>
                <span className="font-bold text-slate-800">
                  {pipPartner.consecutiveFlaggedWeeks || 2} Weeks
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Conversion Rate
                </span>
                <span className="font-bold text-slate-800">
                  {pipPartner.attainments?.conversionRate || 1.2}%
                </span>
              </div>
            </div>

            {/* Form Details */}
            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Reason for PIP Dispatch
                </label>
                <textarea
                  rows={2}
                  value={pipReason}
                  onChange={(e) => setPipReason(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0364FF]/20 focus:border-[#0364FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Cure Period (Days)
                  </label>
                  <select
                    value={pipDuration}
                    onChange={(e) => setPipDuration(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#0364FF]/20 focus:border-[#0364FF]"
                  >
                    <option value="14">14 Days (Standard)</option>
                    <option value="30">30 Days (Extended)</option>
                    <option value="7">7 Days (Urgent)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Target CR Benchmark (%)
                  </label>
                  <input
                    defaultValue="2.0"
                    type="number"
                    step="0.1"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#0364FF]/20 focus:border-[#0364FF]"
                  />
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPipPartner(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={isDispatching}
                onClick={handleDispatchPip}
                className="text-xs flex items-center gap-1.5 font-bold"
              >
                <Send className="w-3.5 h-3.5" />
                {isDispatching ? "Dispatching..." : "Confirm & Dispatch PIP"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
