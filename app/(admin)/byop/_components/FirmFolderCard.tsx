"use client";

import React from "react";
import {
  Folder,
  Building2,
  Landmark,
  TrendingUp,
  Users,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface FirmFolderItem {
  id: string;
  name: string;
  email?: string;
  companyType?: string;
  country?: string;
  totalPartners: number;
  activePartners: number;
  isVerified?: boolean;
}

interface FirmFolderCardProps {
  firm: FirmFolderItem;
  onSelect: (firm: FirmFolderItem) => void;
  isSelected?: boolean;
}

export function FirmFolderCard({
  firm,
  onSelect,
  isSelected,
}: FirmFolderCardProps) {
  const t = (firm.companyType || "").toLowerCase();
  const isBroker = t.includes("broker");
  const isPropFirm = t.includes("prop") || t.includes("funded");

  const categoryLabel = isBroker ? "Broker" : isPropFirm ? "Prop Firm" : "Enterprise";

  return (
    <div
      onClick={() => onSelect(firm)}
      className={cn(
        "group relative p-5 rounded-2xl border transition-all duration-200 cursor-pointer text-left bg-white",
        isSelected
          ? "border-[#0364FF] ring-2 ring-[#0364FF]/10 shadow-md bg-blue-50/20"
          : "border-slate-200/80 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5"
      )}
    >
      {/* Top Header: Icon & Category Badge */}
      <div className="flex items-start justify-between gap-3 mb-3.5">
        <div
          className={cn(
            "w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border shadow-xs transition-colors",
            isBroker
              ? "bg-blue-50 text-[#0364FF] border-blue-100 group-hover:bg-[#0364FF] group-hover:text-white"
              : isPropFirm
              ? "bg-purple-50 text-purple-600 border-purple-100 group-hover:bg-purple-600 group-hover:text-white"
              : "bg-slate-50 text-slate-600 border-slate-200 group-hover:bg-slate-800 group-hover:text-white"
          )}
        >
          {isBroker ? (
            <Landmark className="w-5 h-5" />
          ) : isPropFirm ? (
            <TrendingUp className="w-5 h-5" />
          ) : (
            <Building2 className="w-5 h-5" />
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          <span
            className={cn(
              "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
              isBroker
                ? "bg-blue-50 text-[#0364FF] border-blue-200"
                : isPropFirm
                ? "bg-purple-50 text-purple-700 border-purple-200"
                : "bg-slate-100 text-slate-600 border-slate-200"
            )}
          >
            {categoryLabel}
          </span>
          {firm.isVerified && (
            <span
              className="p-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200"
              title="KYC Verified Organization"
            >
              <CheckCircle2 className="w-3 h-3" />
            </span>
          )}
        </div>
      </div>

      {/* Firm Name & Info */}
      <div className="space-y-1 mb-4">
        <h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-[#0364FF] transition-colors">
          {firm.name}
        </h3>
        <p className="text-xs text-slate-400 truncate">
          {firm.email || firm.country || "Registered Client Firm"}
        </p>
      </div>

      {/* Footer Metrics */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
            <Users className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 leading-none">
              {firm.totalPartners}
            </p>
            <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
              {firm.totalPartners === 1 ? "Partner" : "Partners"} ({firm.activePartners} active)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs font-semibold text-[#0364FF] group-hover:translate-x-0.5 transition-transform">
          <span>Open</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}
