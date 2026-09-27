"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Loader2, Building2, Tag, DollarSign, Calendar } from "lucide-react";
import { Button, StatusBadge } from "@/components/ui";
import {
  getCampaignPerformance,
  evaluateCampaignPerformance,
  placeCampaignOnPip,
} from "@/lib/api/admin.api";
import type { AdminCampaignQueueItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface CampaignPerformanceModalProps {
  campaign: AdminCampaignQueueItem;
  onClose: () => void;
}

export function CampaignPerformanceModal({ campaign, onClose }: CampaignPerformanceModalProps) {
  const queryClient = useQueryClient();
  const [evaluationResult, setEvaluationResult] = useState<Record<string, unknown> | null>(null);
  const [showPipModal, setShowPipModal] = useState(false);
  const [pipReason, setPipReason] = useState("");
  const [pipDuration, setPipDuration] = useState("30");
  const [pipMinCr, setPipMinCr] = useState("2.5");
  const [pipAutoPause, setPipAutoPause] = useState(true);

  console.log(
    `%c[CampaignPerformanceModal] Opened performance health for: ${campaign.id}`,
    "color: #8b5cf6; font-weight: bold;",
    campaign
  );

  const orgName = campaign.organization?.name ?? campaign.organizationName ?? "Client Org";
  const currency = campaign.budgetCurrency ?? campaign.currency ?? "USD";
  const formattedBudget = campaign.budgetAmount
    ? Number(campaign.budgetAmount).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : campaign.budgetMinor
    ? (campaign.budgetMinor / 100).toLocaleString()
    : campaign.budget
    ? Number(campaign.budget).toLocaleString()
    : "N/A";

  const { data: perfData, isLoading: perfLoading } = useQuery({
    queryKey: ["admin", "campaigns", "performance", campaign.id],
    queryFn: async () => {
      console.log("[CampaignPerformanceModal] Querying performance metrics for:", campaign.id);
      const res = await getCampaignPerformance(campaign.id);
      if (res.error) throw new Error(res.error);
      console.log("[CampaignPerformanceModal] Performance data received:", res.data?.data?.performance);
      return res.data?.data?.performance;
    },
  });

  const evaluateMutation = useMutation({
    mutationFn: async () => {
      console.log("[CampaignPerformanceModal] Running SLA evaluation for:", campaign.id);
      const res = await evaluateCampaignPerformance(campaign.id);
      if (res.error) throw new Error(res.error);
      return res.data?.data?.evaluation;
    },
    onSuccess: (data) => {
      console.log("[CampaignPerformanceModal] SLA evaluation result:", data);
      setEvaluationResult(data as Record<string, unknown>);
    },
    onError: (err) => {
      console.error("[CampaignPerformanceModal] SLA evaluation error:", err);
    },
  });

  const pipMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        reason: pipReason,
        durationDays: Number(pipDuration) || 30,
        targetMetrics: {
          minConversionRate: Number(pipMinCr) || 2.5,
        },
        autoPauseOnFailure: pipAutoPause,
      };
      console.log(
        `%c[CampaignPerformanceModal] Placing campaign ${campaign.id} on PIP:`,
        "color: #ef4444; font-weight: bold;",
        payload
      );
      const res = await placeCampaignOnPip(campaign.id, payload);
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: (data) => {
      console.log("[CampaignPerformanceModal] PIP placed successfully:", data);
      setShowPipModal(false);
      setPipReason("");
      queryClient.invalidateQueries({ queryKey: ["admin", "campaigns"] });
      onClose();
    },
    onError: (err) => {
      console.error("[CampaignPerformanceModal] Failed to place PIP:", err);
    },
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Campaign Health & SLA Telemetry</h3>
            <p className="text-xs text-slate-400">{campaign.name}</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Campaign Info Summary Bar */}
        <div className="mx-5 mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-slate-700">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span>{orgName}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <span>{campaign.category ?? "General"}</span>
          </div>
          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
            <DollarSign className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {currency} {formattedBudget}
            </span>
          </div>
          <StatusBadge status={campaign.status} />
        </div>

        <div className="p-5 space-y-4">
          {perfLoading ? (
            <div className="py-8 text-center text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Fetching real-time performance...
            </div>
          ) : perfData ? (
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Clicks</span>
                <p className="text-sm font-black text-slate-900 mt-0.5">{perfData.clicks?.toLocaleString() ?? 0}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Conversions</span>
                <p className="text-sm font-black text-slate-900 mt-0.5">{perfData.conversions?.toLocaleString() ?? 0}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Conv. Rate</span>
                <p className="text-sm font-black text-[#0364FF] mt-0.5">{perfData.conversionRate ?? 0}%</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Spend</span>
                <p className="text-sm font-black text-slate-900 mt-0.5">
                  ${perfData.spend ? (perfData.spend / 100).toLocaleString() : "0"}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Revenue</span>
                <p className="text-sm font-black text-emerald-600 mt-0.5">
                  ${perfData.revenue ? (perfData.revenue / 100).toLocaleString() : "0"}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-[10px] text-slate-400 font-bold uppercase">ROAS</span>
                <p className="text-sm font-black text-purple-600 mt-0.5">{perfData.roas ?? 0}x</p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">No telemetry recorded yet for this active campaign.</p>
          )}

          {/* Evaluation Result */}
          {evaluationResult && (
            <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/50 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">SLA Evaluation Result</span>
                <span
                  className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full",
                    evaluationResult.passed ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                  )}
                >
                  {evaluationResult.passed ? "HEALTHY" : "NEEDS IMPROVEMENT"}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Recommendation: {String(evaluationResult.recommendedAction || "Monitor")}
              </p>
            </div>
          )}

          {/* PIP Form */}
          {showPipModal && (
            <div className="p-3 rounded-xl border border-rose-200 bg-rose-50/40 space-y-3">
              <span className="text-xs font-bold text-rose-800 block">Performance Improvement Plan (PIP)</span>
              <input
                placeholder="PIP Reason (e.g. CR dropped below SLA threshold)..."
                value={pipReason}
                onChange={(e) => setPipReason(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-rose-200 rounded-lg outline-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  placeholder="Duration (days)"
                  value={pipDuration}
                  onChange={(e) => setPipDuration(e.target.value)}
                  className="text-xs p-2 bg-white border border-rose-200 rounded-lg outline-none"
                />
                <input
                  placeholder="Min CR Target (%)"
                  value={pipMinCr}
                  onChange={(e) => setPipMinCr(e.target.value)}
                  className="text-xs p-2 bg-white border border-rose-200 rounded-lg outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pipPauseModal"
                  checked={pipAutoPause}
                  onChange={(e) => setPipAutoPause(e.target.checked)}
                  className="rounded border-rose-300 text-rose-600 cursor-pointer"
                />
                <label htmlFor="pipPauseModal" className="text-xs text-slate-700 cursor-pointer">
                  Auto-pause campaign on PIP failure
                </label>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full text-rose-600 border-rose-300 hover:bg-rose-100"
                isLoading={pipMutation.isPending}
                onClick={() => pipMutation.mutate()}
              >
                Confirm & Issue PIP
              </Button>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <Button
            size="sm"
            variant="outline"
            isLoading={evaluateMutation.isPending}
            onClick={() => evaluateMutation.mutate()}
          >
            Run SLA Check
          </Button>
          <div className="flex items-center gap-2">
            {!showPipModal && (
              <Button
                size="sm"
                variant="ghost"
                className="text-rose-600 hover:bg-rose-50"
                onClick={() => setShowPipModal(true)}
              >
                Place on PIP
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
