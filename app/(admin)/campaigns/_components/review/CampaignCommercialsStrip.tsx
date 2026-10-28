"use client";

import { format } from "date-fns";
import { DollarSign, Tag, Calendar, Layers } from "lucide-react";
import type { AdminCampaignQueueItem } from "@/lib/types";

interface CampaignCommercialsStripProps {
  campaign: AdminCampaignQueueItem;
  category: string;
  partnershipType: string;
  currency: string;
  formattedBudget: string;
}

export function CampaignCommercialsStrip({
  campaign,
  category,
  partnershipType,
  currency,
  formattedBudget,
}: CampaignCommercialsStripProps) {
  return (
    <div className="px-4 sm:px-6 py-3 bg-slate-50/90 border-b border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 text-xs shrink-0">
      {/* Campaign Name */}
      <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-2xs">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1 mb-1">
          <Layers className="w-3 h-3 text-slate-400" />
          Campaign Name
        </span>
        <span
          className="font-bold text-slate-900 text-xs sm:text-[13px] truncate block leading-snug"
          title={campaign.name}
        >
          {campaign.name}
        </span>
      </div>

      {/* Category & Model */}
      <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-2xs">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1 mb-1">
          <Tag className="w-3 h-3 text-purple-500" />
          Category / Model
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="capitalize font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100 text-[11px]">
            {category}
          </span>
          <span className="text-slate-600 font-semibold text-[11px]">
            {partnershipType}
          </span>
        </div>
      </div>

      {/* Budget Allocation */}
      <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-2xs">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1 mb-1">
          <DollarSign className="w-3 h-3 text-emerald-600" />
          Budget Allocation
        </span>
        <span className="font-bold text-slate-900 text-xs sm:text-[13px] block leading-snug tracking-tight">
          {currency} {formattedBudget}
        </span>
      </div>

      {/* Timeline */}
      <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-2xs">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1 mb-1">
          <Calendar className="w-3 h-3 text-blue-500" />
          Campaign Schedule
        </span>
        <span className="font-semibold text-slate-700 text-xs sm:text-[12px] block leading-snug truncate">
          {campaign.startDate && campaign.endDate
            ? `${format(new Date(campaign.startDate), "MMM d")} – ${format(
                new Date(campaign.endDate),
                "MMM d, yyyy"
              )}`
            : "Ongoing / Evergreen"}
        </span>
      </div>
    </div>
  );
}
