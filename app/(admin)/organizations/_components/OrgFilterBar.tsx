"use client";

import React from "react";
import { Filter, X, RotateCcw } from "lucide-react";

export interface OrgFilters {
  verification: "all" | "verified" | "unverified";
  status: "all" | "active" | "pending" | "suspended";
}

interface OrgFilterBarProps {
  isOpen: boolean;
  filters: OrgFilters;
  onFilterChange: (filters: OrgFilters) => void;
  onReset: () => void;
  onClose: () => void;
  activeCount: number;
}

export function OrgFilterBar({
  isOpen,
  filters,
  onFilterChange,
  onReset,
  onClose,
  activeCount,
}: OrgFilterBarProps) {
  if (!isOpen) return null;

  return (
    <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-150 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#0364FF]" />
          <span className="text-xs font-bold text-slate-900">Organization Compliance Filters</span>
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
              Reset filters
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Verification Status */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
            KYC Verification
          </label>
          <select
            value={filters.verification}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                verification: e.target.value as OrgFilters["verification"],
              })
            }
            className="w-full text-xs font-medium bg-white border border-slate-200/90 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0364FF]/20 focus:border-[#0364FF]"
          >
            <option value="all">All Verification States</option>
            <option value="verified">Verified Only</option>
            <option value="unverified">Unverified Only</option>
          </select>
        </div>

        {/* Operating Status */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
            Platform Account Status
          </label>
          <select
            value={filters.status}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                status: e.target.value as OrgFilters["status"],
              })
            }
            className="w-full text-xs font-medium bg-white border border-slate-200/90 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0364FF]/20 focus:border-[#0364FF]"
          >
            <option value="all">All Account Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>
    </div>
  );
}
