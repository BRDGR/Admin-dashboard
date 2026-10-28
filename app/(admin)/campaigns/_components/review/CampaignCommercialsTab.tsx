"use client";

import {
  Target,
  DollarSign,
  Clock,
  ShieldCheck,
  Zap,
  TrendingUp,
  Layers,
  Award,
} from "lucide-react";

interface TierItem {
  tier?: number;
  min?: number;
  max?: number;
  reward?: number;
  rate?: number;
}

interface CampaignCommercialsTabProps {
  primaryObjective: string;
  objectivesList?: string[];
  conversionEvent: string;
  conversionsList?: string[];
  baseRate: string;
  currency: string;
  attributionWindow: string;
  attributionModel: string;
  paymentHold: string;
  tiers?: TierItem[];
}

export function CampaignCommercialsTab({
  primaryObjective,
  objectivesList,
  conversionEvent,
  conversionsList,
  baseRate,
  currency,
  attributionWindow,
  attributionModel,
  paymentHold,
  tiers,
}: CampaignCommercialsTabProps) {
  return (
    <div className="space-y-5">
      {/* Objectives & Conversion Triggers */}
      <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 bg-white shadow-2xs space-y-3.5">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
            <Target className="w-4 h-4 text-[#0364FF]" />
            <span>Campaign Objectives & Qualifying Triggers</span>
          </h4>
          <span className="text-[10px] uppercase font-bold text-[#0364FF] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
            Commercial Baseline
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
          {/* Primary Objective */}
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/70 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Primary Campaign Objective
            </span>
            <p className="font-bold text-slate-900 text-sm leading-snug">
              {primaryObjective}
            </p>
            {Array.isArray(objectivesList) && objectivesList.length > 1 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {objectivesList.map((o, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 bg-blue-50 text-[#0364FF] rounded-md font-semibold border border-blue-100"
                  >
                    {o}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Conversion Event */}
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/70 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Qualifying Conversion Trigger
            </span>
            <p className="font-bold text-slate-900 text-sm leading-snug">
              {conversionEvent}
            </p>
            {Array.isArray(conversionsList) && conversionsList.length > 1 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {conversionsList.map((c, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md font-semibold border border-emerald-100"
                  >
                    {c}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payout & Commission Structure */}
      <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 bg-white shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Commission Rules & Payout Governance</span>
          </h4>
          <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
            Automated Settlement
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {/* Base CPA Rate */}
          <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/80 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">
                Base CPA Rate
              </span>
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <span className="text-base font-bold text-slate-900 tracking-tight">
              {currency} {baseRate}
            </span>
            <span className="text-[10px] text-slate-400 font-medium mt-1">
              Per qualified conversion
            </span>
          </div>

          {/* Attribution Window */}
          <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/80 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">
                Attribution Window
              </span>
              <Clock className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <span className="text-base font-bold text-slate-900 tracking-tight">
              {attributionWindow}
            </span>
            <span className="text-[10px] text-slate-400 font-medium mt-1">
              Click-to-conversion window
            </span>
          </div>

          {/* Attribution Model */}
          <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/80 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">
                Attribution Model
              </span>
              <Layers className="w-3.5 h-3.5 text-purple-500" />
            </div>
            <span className="text-base font-bold text-slate-900 tracking-tight">
              {attributionModel}
            </span>
            <span className="text-[10px] text-slate-400 font-medium mt-1">
              Touchpoint deduplication
            </span>
          </div>

          {/* Payment Hold Period */}
          <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/80 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">
                Holdback Escrow
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <span className="text-base font-bold text-slate-900 tracking-tight">
              {paymentHold}
            </span>
            <span className="text-[10px] text-slate-400 font-medium mt-1">
              Chargeback & refund safety
            </span>
          </div>
        </div>

        {/* Performance Tiers Table */}
        {Array.isArray(tiers) && tiers.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                Performance Reward Tiering
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                Volume incentives scale dynamically
              </span>
            </div>

            <div className="border border-slate-200/80 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-4 text-left">Performance Tier</th>
                    <th className="py-2.5 px-4 text-left">Volume Threshold (Leads / FTDs)</th>
                    <th className="py-2.5 px-4 text-right">Commission Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {tiers.map((t, i) => (
                    <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-amber-50 border border-amber-200 text-amber-700 text-[10px] flex items-center justify-center font-bold">
                          {t.tier || i + 1}
                        </span>
                        <span>Tier {t.tier || i + 1}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {t.min ?? 0} – {t.max ? `${t.max} actions` : "Unlimited scale"}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-600">
                        {currency} {t.reward ?? t.rate ?? "Custom"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
