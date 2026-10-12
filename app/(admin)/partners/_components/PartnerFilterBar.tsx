"use client";

import React from "react";
import { Filter, X, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PartnerFilters {
  vettingStatus: "all" | "vetted" | "pending";
  accountStatus: "all" | "active" | "inactive";
  capacity: "all" | "full_time" | "part_time";
  industry: string;
}

interface PartnerFilterBarProps {
  isOpen: boolean;
  filters: PartnerFilters;
  onFilterChange: (filters: PartnerFilters) => void;
  onReset: () => void;
  onClose: () => void;
  activeCount: number;
}

export function PartnerFilterBar({
  isOpen,
  filters,
  onFilterChange,
  onReset,
  onClose,
  activeCount,
}: PartnerFilterBarProps) {
  if (!isOpen) return null;

  return (
    <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-150 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#0364FF]" />
          <span className="text-xs font-bold text-slate-900">Partner Filter Engine</span>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0364FF] text-white">
              {activeCount} active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset all
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Vetting Status */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
            Vetting Status
          </label>
          <select
            value={filters.vettingStatus}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                vettingStatus: e.target.value as PartnerFilters["vettingStatus"],
              })
            }
            className="w-full text-xs font-medium bg-white border border-slate-200/90 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0364FF]/20 focus:border-[#0364FF]"
          >
            <option value="all">All Vetting States</option>
            <option value="vetted">Vetted & Approved</option>
            <option value="pending">Pending Vetting</option>
          </select>
        </div>

        {/* Account Status */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
            Account Status
          </label>
          <select
            value={filters.accountStatus}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                accountStatus: e.target.value as PartnerFilters["accountStatus"],
              })
            }
            className="w-full text-xs font-medium bg-white border border-slate-200/90 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0364FF]/20 focus:border-[#0364FF]"
          >
            <option value="all">All Account States</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>

        {/* Capacity */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
            Commitment Capacity
          </label>
          <select
            value={filters.capacity}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                capacity: e.target.value as PartnerFilters["capacity"],
              })
            }
            className="w-full text-xs font-medium bg-white border border-slate-200/90 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0364FF]/20 focus:border-[#0364FF]"
          >
            <option value="all">All Capacities</option>
            <option value="full_time">Full Time</option>
            <option value="part_time">Part Time</option>
          </select>
        </div>
      </div>
    </div>
  );
}
