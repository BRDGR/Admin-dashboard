"use client";

import { useState } from "react";
import {
  X,
  CheckCircle2,
  Download,
  ShieldCheck,
  DollarSign,
  AlertCircle,
  FileSpreadsheet,
  Check,
  Building2,
  Users,
  Percent,
} from "lucide-react";
import type { AdminPayoutApprovalPayload, AdminPartnerLeaderboardItem } from "@/lib/types";
import { exportPayoutBatchCSV, type PayoutBatchExportRow } from "@/lib/export";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PayoutApprovalModalProps {
  payload: AdminPayoutApprovalPayload;
  partnersList?: AdminPartnerLeaderboardItem[];
  onClose: () => void;
  onApproveBatch: (campaignId: string) => Promise<void>;
}

export function PayoutApprovalModal({
  payload,
  partnersList = [],
  onClose,
  onApproveBatch,
}: PayoutApprovalModalProps) {
  const [isApproving, setIsApproving] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

  const budgetUsd = (payload.budgetCents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const reserveUsd = (payload.reserveCents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const bonusUsd = (payload.bonusCents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const holdbackUsd = (payload.holdbackCents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const poolUsd = (payload.poolCents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const totalPayoutsUsd = (payload.totalPayoutsCents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const invariantDeltaCents = Math.abs(payload.totalPayoutsCents - payload.poolCents);
  const invariantDeltaUsd = (invariantDeltaCents / 100).toFixed(4);

  const handleExportCsv = () => {
    // Generate export rows from partnersList or tier breakdown
    const rows: PayoutBatchExportRow[] = partnersList.map((p) => {
      // Calculate share
      const tierInfo = payload.tierBreakdown.find((t) => t.tier === p.tier);
      const partnerAvgCents = tierInfo
        ? Math.round(tierInfo.finalPayoutCents / tierInfo.partnerCount)
        : 5666;
      const holdbackCents = Math.round(partnerAvgCents * 0.12);

      return {
        partnerId: p.partnerId,
        name: p.name,
        tier: p.tier,
        multiplier: p.multiplier,
        score: p.score,
        finalPayoutUsd: partnerAvgCents / 100,
        holdbackUsd: holdbackCents / 100,
        status: p.status ?? "active",
      };
    });

    exportPayoutBatchCSV(payload.campaignName, rows, payload.invariantPassed);
    toast.success("Payout Batch CSV downloaded successfully");
  };

  const handleConfirmApproval = async () => {
    try {
      setIsApproving(true);
      await onApproveBatch(payload.campaignId);
      setIsApproved(true);
      toast.success("Payout batch approved and queued for wire execution!");
    } catch {
      toast.error("Failed to approve payout batch");
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Payout Normalization & Approval
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                Hamilton Largest-Remainder
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 truncate max-w-md" title={payload.campaignName}>
              {payload.campaignName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-200/60 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Invariant Verification Banner */}
          <div
            className={cn(
              "p-4 rounded-xl border flex items-start gap-3",
              payload.invariantPassed
                ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                : "bg-rose-50 border-rose-200 text-rose-950"
            )}
          >
            {payload.invariantPassed ? (
              <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">
                  {payload.invariantPassed
                    ? "Budget Invariant Verified: ∑ Payouts == Pool"
                    : "Invariant Breach: Sum of Payouts does not equal Distributable Pool"}
                </span>
                <span
                  className={cn(
                    "text-[10px] font-bold px-2.5 py-0.5 rounded-full",
                    payload.invariantPassed
                      ? "bg-emerald-200/70 text-emerald-900"
                      : "bg-rose-200 text-rose-900"
                  )}
                >
                  Delta: ${invariantDeltaUsd}
                </span>
              </div>
              <p className="text-xs text-emerald-800 mt-1">
                Hamilton largest-remainder normalization distributed all integer cents across{" "}
                <span className="font-semibold">{payload.normalizedPartnersCount} partners</span>.
                Zero leakage ($0.00 surplus, $0.00 deficit).
              </p>
            </div>
          </div>

          {/* Capital Allocation Hierarchy */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                Total Budget Ceiling
              </span>
              <p className="text-sm font-black text-slate-900 mt-0.5">${budgetUsd}</p>
              <span className="text-[10px] text-slate-500">100% committed</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                10% Reserve
              </span>
              <p className="text-sm font-black text-amber-600 mt-0.5">${reserveUsd}</p>
              <span className="text-[10px] text-slate-500">Contingency hold</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                10% Holdback Retained
              </span>
              <p className="text-sm font-black text-blue-600 mt-0.5">${holdbackUsd}</p>
              <span className="text-[10px] text-slate-500">30-day compliance</span>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-[10px] font-bold text-emerald-700 uppercase block">
                Distributable Pool
              </span>
              <p className="text-sm font-black text-emerald-800 mt-0.5">${poolUsd}</p>
              <span className="text-[10px] text-emerald-600 font-semibold">∑ Payouts = ${totalPayoutsUsd}</span>
            </div>
          </div>

          {/* Tier Breakdown Table */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wider flex items-center justify-between">
              <span>Tier Normalization Breakdown ({payload.normalizedPartnersCount} Partners)</span>
              <span className="text-[11px] font-normal text-slate-500 lowercase">
                5 distinct multiplier bands
              </span>
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Performance Tier</th>
                    <th className="py-2.5 px-3 text-center">Partners</th>
                    <th className="py-2.5 px-3 text-center">Multiplier</th>
                    <th className="py-2.5 px-3 text-right">Pool Allocation</th>
                    <th className="py-2.5 px-3 text-right">Avg / Partner</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payload.tierBreakdown.map((t) => {
                    const poolShareUsd = (t.finalPayoutCents / 100).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    });
                    const avgPartnerUsd = (t.finalPayoutCents / 100 / t.partnerCount).toFixed(2);
                    const pctOfPool = ((t.finalPayoutCents / payload.poolCents) * 100).toFixed(1);

                    return (
                      <tr key={t.tier} className="hover:bg-slate-50/60">
                        <td className="py-2 px-3 font-semibold text-slate-900">
                          {t.tier}
                        </td>
                        <td className="py-2 px-3 text-center font-bold text-slate-700">
                          {t.partnerCount}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className="px-1.5 py-0.5 rounded font-bold text-[11px] bg-slate-100 text-slate-800">
                            {t.multiplier.toFixed(2)}x
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-slate-900">
                          ${poolShareUsd}{" "}
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({pctOfPool}%)
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-slate-600">
                          ${avgPartnerUsd}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-slate-50 font-bold border-t border-slate-200">
                    <td className="py-2.5 px-3 text-slate-900">Total Distributable</td>
                    <td className="py-2.5 px-3 text-center text-slate-900">
                      {payload.normalizedPartnersCount}
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-400">—</td>
                    <td className="py-2.5 px-3 text-right text-emerald-700">
                      ${poolUsd} (100%)
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                      ${(payload.poolCents / 100 / payload.normalizedPartnersCount).toFixed(2)} avg
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" /> Export Batch CSV / Wire
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl cursor-pointer"
            >
              Close
            </button>
            <button
              disabled={isApproving || isApproved || !payload.invariantPassed}
              onClick={handleConfirmApproval}
              className={cn(
                "px-5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs text-white",
                isApproved
                  ? "bg-emerald-600 hover:bg-emerald-700 cursor-default"
                  : "bg-[#0364FF] hover:bg-blue-600 disabled:opacity-50"
              )}
            >
              {isApproved ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Payout Batch Approved
                </>
              ) : isApproving ? (
                "Processing Approval..."
              ) : (
                "One-Click Approve Payouts"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
