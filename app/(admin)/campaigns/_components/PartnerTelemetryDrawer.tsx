"use client";

import React from "react";
import {
  X,
  Trophy,
  Award,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ShieldCheck,
  Send,
  ExternalLink,
  Calendar,
  CheckCircle2,
  Clock,
  Activity,
  Layers,
  Sparkles,
} from "lucide-react";
import type { AdminPartnerLeaderboardItem, PartnerTier } from "@/lib/types";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

interface PartnerTelemetryDrawerProps {
  partner: AdminPartnerLeaderboardItem | null;
  onClose: () => void;
  onDispatchPip: (partner: AdminPartnerLeaderboardItem) => void;
}

const TIER_BADGES: Record<PartnerTier, { bg: string; text: string; border: string }> = {
  Exceptional: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  Strong: { bg: "bg-blue-50", text: "text-[#0364FF]", border: "border-blue-200" },
  Performing: { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" },
  "Needs Attention": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  Critical: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
};

export function PartnerTelemetryDrawer({
  partner,
  onClose,
  onDispatchPip,
}: PartnerTelemetryDrawerProps) {
  if (!partner) return null;

  const isPipFlagged = (partner.consecutiveFlaggedWeeks ?? 0) >= 2;
  const tierStyle = TIER_BADGES[partner.tier] || TIER_BADGES.Performing;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200"
        role="dialog"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center font-bold text-slate-800 text-sm shadow-2xs">
              {partner.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{partner.name}</h3>
                {partner.tier === "Exceptional" && (
                  <Sparkles className="w-4 h-4 text-amber-500" />
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                ID: {partner.partnerId} · Multiplier: {partner.multiplier.toFixed(2)}x
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white hover:bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Primary Score & Tier Hero */}
          <div className="p-5 rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50/80 to-white shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Overall Governance Score
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                    {partner.score.toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">/ 100</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Tier Allocation
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border mt-1",
                    tierStyle.bg,
                    tierStyle.text,
                    tierStyle.border
                  )}
                >
                  <span className="w-2 h-2 rounded-full bg-current opacity-70" />
                  {partner.tier}
                </span>
              </div>
            </div>

            {/* Score Progress Track */}
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
              <div
                className="h-full rounded-full bg-[#0364FF] transition-all duration-300"
                style={{ width: `${Math.min(partner.score, 100)}%` }}
              />
            </div>
          </div>

          {/* Attainment KPI Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-[#0364FF]" />
              Attainment Benchmarks & Telemetry
            </h4>

            <div className="grid grid-cols-2 gap-3">
              {/* CR */}
              <div className="p-3.5 rounded-xl border border-slate-200/70 bg-white">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  Conversion Rate (CR)
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-base font-bold text-slate-900 font-mono">
                    {partner.attainments.conversionRate}%
                  </span>
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold">
                    Target ≥ 2.0%
                  </span>
                </div>
              </div>

              {/* Volume */}
              <div className="p-3.5 rounded-xl border border-slate-200/70 bg-white">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  Trading Volume / Leads
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-base font-bold text-slate-900 font-mono">
                    {partner.attainments.volume}
                  </span>
                  <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-semibold">
                    Settled
                  </span>
                </div>
              </div>

              {/* Retention */}
              <div className="p-3.5 rounded-xl border border-slate-200/70 bg-white">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  30-Day Retention
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-base font-bold text-slate-900 font-mono">
                    {partner.attainments.retentionRate}%
                  </span>
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold">
                    Healthy
                  </span>
                </div>
              </div>

              {/* Compliance */}
              <div className="p-3.5 rounded-xl border border-slate-200/70 bg-white">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  Compliance & Quality
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-base font-bold text-emerald-700 font-mono">
                    {partner.attainments.complianceScore}%
                  </span>
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Passed
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 7-Day Performance Sparkline Trajectory */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              7-Day Score Trajectory
            </h4>

            <div className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>7-Day History</span>
                <span className="font-mono font-bold text-slate-800">
                  {partner.sparkline.join(" → ")}
                </span>
              </div>
            </div>
          </div>

          {/* Governance & SLA Health */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#0364FF]" />
              Governance & SLA Status
            </h4>

            <div className="p-4 rounded-xl border border-slate-200/70 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">SLA Breach Duration:</span>
                <span className="text-xs font-bold text-slate-900">
                  {partner.consecutiveFlaggedWeeks
                    ? `${partner.consecutiveFlaggedWeeks} Consecutive Weeks`
                    : "No breaches on record"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Tier Payout Multiplier:</span>
                <span className="text-xs font-bold text-slate-900">
                  {partner.multiplier.toFixed(2)}x Tier Multiplier
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Automated Status:</span>
                <span
                  className={cn(
                    "text-xs font-bold px-2 py-0.5 rounded-full",
                    isPipFlagged
                      ? "bg-rose-100 text-rose-800"
                      : "bg-emerald-100 text-emerald-800"
                  )}
                >
                  {isPipFlagged ? "Action Required (PIP)" : "In Good Standing"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-end gap-2.5">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Close
          </Button>

          {isPipFlagged && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                onDispatchPip(partner);
                onClose();
              }}
              className="text-xs flex items-center gap-1.5 font-bold"
            >
              <Send className="w-3.5 h-3.5" />
              Issue Formal PIP
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
