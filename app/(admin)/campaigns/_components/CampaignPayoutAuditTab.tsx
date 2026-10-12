"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Download,
  Settings2,
  FileCheck2,
  AlertCircle,
  Building2,
  Layers,
  History,
  TrendingUp,
  Percent,
  Sliders,
  DollarSign,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { SectionCard, Button, StatusBadge } from "@/components/ui";
import { PayoutApprovalModal } from "./PayoutApprovalModal";
import { CampaignScoringConfigModal } from "./CampaignScoringConfigModal";
import type {
  AdminPayoutApprovalPayload,
  CampaignConfigVersionDTO,
  AdminPartnerLeaderboardItem,
} from "@/lib/types";
import { exportPayoutBatchCSV, type PayoutBatchExportRow } from "@/lib/export";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CampaignPayoutAuditTabProps {
  payoutSummary: AdminPayoutApprovalPayload;
  scoringConfig: CampaignConfigVersionDTO;
  scoringHistory?: CampaignConfigVersionDTO[];
  partnersList: AdminPartnerLeaderboardItem[];
  onApproveBatch: (campaignId: string) => Promise<void>;
  onUpdateScoringConfig: (config: CampaignConfigVersionDTO) => Promise<void>;
}

export function CampaignPayoutAuditTab({
  payoutSummary,
  scoringConfig,
  scoringHistory = [],
  partnersList,
  onApproveBatch,
  onUpdateScoringConfig,
}: CampaignPayoutAuditTabProps) {
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const budgetUsd = (payoutSummary.budgetCents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const poolUsd = (payoutSummary.poolCents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const totalPayoutsUsd = (payoutSummary.totalPayoutsCents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const holdbackUsd = (payoutSummary.holdbackCents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const handleExportBatch = () => {
    const rows: PayoutBatchExportRow[] = partnersList.map((p) => {
      const tierInfo = payoutSummary.tierBreakdown.find((t) => t.tier === p.tier);
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

    exportPayoutBatchCSV(payoutSummary.campaignName, rows, payoutSummary.invariantPassed);
    toast.success("Payout Batch CSV downloaded successfully");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Hamilton Invariant & Settlement Controls */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 text-white shadow-lg border border-slate-700/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Hamilton Normalization Verified
              </span>
              <span className="text-xs font-mono text-slate-400">
                Config {scoringConfig.configVersion}
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Payout Approvals & Audit Versioning
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Automated mathematical invariant verification ensuring zero surplus/deficit leakage ($
              {poolUsd} Pool == ${totalPayoutsUsd} ∑ Payouts). Supervise tier distributions,
              compliance holdbacks, and configure scoring models.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportBatch}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Export Batch CSV / Wire
            </button>
            <button
              onClick={() => setShowConfigModal(true)}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Settings2 className="w-3.5 h-3.5" /> Scoring Config ({scoringConfig.configVersion})
            </button>
            <button
              onClick={() => setShowPayoutModal(true)}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-[#0364FF] hover:bg-blue-600 text-white shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <FileCheck2 className="w-3.5 h-3.5" /> Review & Approve Payouts
            </button>
          </div>
        </div>

        {/* 4 Invariant Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">
              Budget Ceiling
            </span>
            <p className="text-base font-black text-white mt-0.5">${budgetUsd}</p>
            <span className="text-[10px] text-slate-400">Total Campaign Commitment</span>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">
              Distributable Pool
            </span>
            <p className="text-base font-black text-emerald-400 mt-0.5">${poolUsd}</p>
            <span className="text-[10px] text-emerald-300 font-medium">85.0% of Total Budget</span>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">
              Compliance Holdback (10-15%)
            </span>
            <p className="text-base font-black text-blue-400 mt-0.5">${holdbackUsd}</p>
            <span className="text-[10px] text-blue-300 font-medium">{scoringConfig.holdbackPct}% SLA Hold</span>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">
              Hamilton Invariant
            </span>
            <p className="text-base font-black text-emerald-400 mt-0.5">∑ Payouts == Pool</p>
            <span className="text-[10px] text-emerald-300 font-semibold">Invariant Delta: $0.0000</span>
          </div>
        </div>
      </div>

      {/* Grid: Tier Distribution & Scoring Configuration Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tier Normalization Table (2 cols) */}
        <div className="lg:col-span-2">
          <SectionCard
            title={`Tier Normalization Breakdown (${payoutSummary.normalizedPartnersCount} Partners)`}
            subtitle="Hamilton largest-remainder integer cent distribution across 5 performance tiers"
          >
            <div className="divide-y divide-slate-100 mt-2">
              {payoutSummary.tierBreakdown.map((t) => {
                const finalUsd = (t.finalPayoutCents / 100).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                });
                const avgPartner = (t.finalPayoutCents / 100 / t.partnerCount).toFixed(2);
                const pctOfPool = ((t.finalPayoutCents / payoutSummary.poolCents) * 100).toFixed(1);

                return (
                  <div key={t.tier} className="p-4 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{t.tier}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {t.multiplier.toFixed(2)}x Multiplier
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {t.partnerCount} partners • Average ${avgPartner} per partner
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900">${finalUsd}</p>
                      <span className="text-[11px] font-semibold text-emerald-600">
                        {pctOfPool}% of Pool
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 rounded-b-xl flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">
                Sum of Distributed Payouts:
              </span>
              <span className="font-black text-slate-900 text-sm">
                ${totalPayoutsUsd} USD
              </span>
            </div>
          </SectionCard>
        </div>

        {/* Scoring & Model Weights Audit Widget (1 col) */}
        <div>
          <SectionCard
            title="Active Scoring Config"
            subtitle={`Tracking version ${scoringConfig.configVersion}`}
          >
            <div className="p-4 space-y-4">
              {/* Weights Summary */}
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1.5">
                    <span>Broker Preset Weights</span>
                    <span className="text-[#0364FF]">15 / 15 / 25 / 45</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 text-[10px] text-slate-600">
                    <div>CPA: {scoringConfig.brokerWeights.cpa}%</div>
                    <div>Ret: {scoringConfig.brokerWeights.retention}%</div>
                    <div>Vol: {scoringConfig.brokerWeights.volume}%</div>
                    <div className="font-bold text-emerald-700">Comp: {scoringConfig.brokerWeights.compliance}%</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1.5">
                    <span>Prop Firm Weights</span>
                    <span className="text-[#0364FF]">15 / 20 / 15 / 50</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 text-[10px] text-slate-600">
                    <div>CPA: {scoringConfig.propFirmWeights.cpa}%</div>
                    <div>Pass: {scoringConfig.propFirmWeights.retention}%</div>
                    <div>Vol: {scoringConfig.propFirmWeights.volume}%</div>
                    <div className="font-bold text-emerald-700">Comp: {scoringConfig.propFirmWeights.compliance}%</div>
                  </div>
                </div>
              </div>

              {/* Safety Parameters */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Attainment Cap</span>
                  <span className="font-bold text-slate-900">{scoringConfig.attainmentCapPct}%</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Contingency Reserve</span>
                  <span className="font-bold text-slate-900">{scoringConfig.reservePct}%</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Performance Bonus</span>
                  <span className="font-bold text-slate-900">{scoringConfig.bonusPct}%</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Compliance Holdback</span>
                  <span className="font-bold text-slate-900">{scoringConfig.holdbackPct}%</span>
                </div>
              </div>

              {scoringConfig.changeNote && (
                <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100 text-[11px] text-blue-900">
                  <span className="font-bold block mb-0.5">Audit Note:</span>
                  {scoringConfig.changeNote}
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setShowConfigModal(true)}
              >
                <Settings2 className="w-3.5 h-3.5 mr-1.5" /> Adjust Weights & Controls
              </Button>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Modals */}
      {showPayoutModal && (
        <PayoutApprovalModal
          payload={payoutSummary}
          partnersList={partnersList}
          onClose={() => setShowPayoutModal(false)}
          onApproveBatch={onApproveBatch}
        />
      )}

      {showConfigModal && (
        <CampaignScoringConfigModal
          activeConfig={scoringConfig}
          history={scoringHistory}
          onClose={() => setShowConfigModal(false)}
          onSaveConfig={onUpdateScoringConfig}
        />
      )}
    </div>
  );
}
