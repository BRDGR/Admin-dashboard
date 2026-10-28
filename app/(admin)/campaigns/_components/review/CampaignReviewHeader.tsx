"use client";

import { ShieldCheck, X, Building2, Clock, CheckCircle2 } from "lucide-react";
import { StatusBadge } from "@/components/ui";
import { safeFormatDate } from "@/lib/utils";
import type { AdminCampaignQueueItem } from "@/lib/types";

interface CampaignReviewHeaderProps {
  campaign: AdminCampaignQueueItem;
  orgName: string;
  onClose: () => void;
}

export function CampaignReviewHeader({
  campaign,
  orgName,
  onClose,
}: CampaignReviewHeaderProps) {
  const dateStr = campaign.submittedAt || campaign.createdAt;
  const campaignRef = `CMP-${(campaign.id || "0000").slice(0, 8).toUpperCase()}`;

  return (
    <div className="px-4 sm:px-6 py-4 border-b border-slate-200/80 flex items-start sm:items-center justify-between gap-3 shrink-0 bg-white">
      <div className="flex items-start sm:items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/20 border border-blue-200/80 flex items-center justify-center text-[#0364FF] shrink-0 shadow-2xs">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-bold text-slate-900 leading-tight tracking-tight">
              Review Campaign Submission
            </h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
              {campaignRef}
            </span>
            <StatusBadge status={campaign.status} />
          </div>

          <div className="flex items-center gap-3 flex-wrap text-xs text-slate-500 mt-1">
            <span className="flex items-center gap-1 font-medium text-slate-700">
              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{orgName}</span>
              <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
            </span>
            {dateStr && (
              <span className="flex items-center gap-1 text-slate-400">
                <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                <span>Submitted {safeFormatDate(dateStr, "MMM d, yyyy · HH:mm")}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer shrink-0 border border-transparent hover:border-slate-200"
        title="Close Review Modal"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
