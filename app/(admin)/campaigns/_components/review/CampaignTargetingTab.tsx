"use client";

import { Globe2, FileText, Ban, ShieldAlert, CheckCircle2, UserCheck, Sparkles } from "lucide-react";

interface CampaignBrief {
  summary?: string;
  targetAudience?: string;
  keyBenefits?: string;
}

interface CampaignTargetingTabProps {
  includedCountries?: string[];
  excludedCountries?: string[];
  brief?: CampaignBrief;
  prohibitedChannels?: string[];
}

export function CampaignTargetingTab({
  includedCountries,
  excludedCountries,
  brief,
  prohibitedChannels,
}: CampaignTargetingTabProps) {
  return (
    <div className="space-y-5">
      {/* Geographic Rules */}
      <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 bg-white shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-[#0364FF]" />
            <span>Geographic Eligibility & Territorial Governance</span>
          </h4>
          <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
            IP / Geo Fence
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Target Included */}
          <div className="p-3.5 bg-emerald-50/30 rounded-xl border border-emerald-100 space-y-2">
            <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Authorized Jurisdictions / Regions
            </span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {Array.isArray(includedCountries) && includedCountries.length > 0 ? (
                includedCountries.map((r, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-[11px] border border-emerald-200 shadow-2xs"
                  >
                    {r}
                  </span>
                ))
              ) : (
                <span className="text-slate-500 text-xs font-medium">
                  Global Worldwide Access (Standard Regulations Apply)
                </span>
              )}
            </div>
          </div>

          {/* Excluded Countries */}
          <div className="p-3.5 bg-rose-50/30 rounded-xl border border-rose-100 space-y-2">
            <span className="text-[10px] uppercase font-bold text-rose-800 tracking-wider flex items-center gap-1.5">
              <Ban className="w-3.5 h-3.5 text-rose-600" />
              Prohibited & Sanctioned Jurisdictions
            </span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {Array.isArray(excludedCountries) && excludedCountries.length > 0 ? (
                excludedCountries.map((r, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 font-bold text-[11px] border border-rose-200 shadow-2xs"
                  >
                    {r}
                  </span>
                ))
              ) : (
                <span className="text-slate-500 text-xs font-medium">
                  Standard OFAC, FATF, and High-Risk Jurisdictions Prohibited
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Brief & Narrative */}
      <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 bg-white shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-700" />
            <span>Client Campaign Brief & Positioning</span>
          </h4>
          <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
            Partner Facing
          </span>
        </div>

        {brief && typeof brief === "object" ? (
          <div className="space-y-3.5 text-xs">
            {brief.summary && (
              <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/70 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#0364FF]" />
                  Executive Summary
                </span>
                <p className="text-slate-800 leading-relaxed font-medium">
                  {brief.summary}
                </p>
              </div>
            )}
            {brief.targetAudience && (
              <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/70 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-purple-500" />
                  Target Audience Persona
                </span>
                <p className="text-slate-800 leading-relaxed font-medium">
                  {brief.targetAudience}
                </p>
              </div>
            )}
            {brief.keyBenefits && (
              <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/70 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Key Value Propositions & Hooks
                </span>
                <p className="text-slate-800 leading-relaxed font-medium">
                  {brief.keyBenefits}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-500">
            Standard brand guidelines, promotional disclosures, and regulatory disclaimers applied.
          </div>
        )}
      </div>

      {/* Prohibited Channels & Traffic Policy */}
      <div className="p-4 sm:p-5 rounded-2xl border border-rose-200/90 bg-rose-50/30 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-rose-800 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>Strictly Prohibited Promotional Channels</span>
          </h4>
          <span className="text-[10px] uppercase font-bold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-md">
            Zero Tolerance
          </span>
        </div>

        <p className="text-[11px] text-slate-600">
          Any conversion attributed via the following channels will be flagged by BRDGR Fraud Sentinel and immediately disqualified from payout.
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          {Array.isArray(prohibitedChannels) && prohibitedChannels.length > 0 ? (
            prohibitedChannels.map((p, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-lg bg-rose-100 text-rose-800 text-[11px] font-bold border border-rose-200 shadow-2xs flex items-center gap-1.5"
              >
                <Ban className="w-3 h-3 text-rose-600" />
                {p}
              </span>
            ))
          ) : (
            <>
              <span className="px-3 py-1 rounded-lg bg-rose-100 text-rose-800 text-[11px] font-bold border border-rose-200 shadow-2xs flex items-center gap-1.5">
                <Ban className="w-3 h-3 text-rose-600" />
                No Incentivized / Cash-Back Traffic
              </span>
              <span className="px-3 py-1 rounded-lg bg-rose-100 text-rose-800 text-[11px] font-bold border border-rose-200 shadow-2xs flex items-center gap-1.5">
                <Ban className="w-3 h-3 text-rose-600" />
                No Brand Bidding (PPC & Google Ads)
              </span>
              <span className="px-3 py-1 rounded-lg bg-rose-100 text-rose-800 text-[11px] font-bold border border-rose-200 shadow-2xs flex items-center gap-1.5">
                <Ban className="w-3 h-3 text-rose-600" />
                No Unsolicited DMs or Mass Spam
              </span>
              <span className="px-3 py-1 rounded-lg bg-rose-100 text-rose-800 text-[11px] font-bold border border-rose-200 shadow-2xs flex items-center gap-1.5">
                <Ban className="w-3 h-3 text-rose-600" />
                No Co-Registration or Cookie Stuffing
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
