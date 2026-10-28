"use client";

import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  Lock,
  MessageSquare,
  FileCheck2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CampaignDecisionTabProps {
  reviewAction: "approve" | "reject" | "request_changes";
  onSelectAction: (action: "approve" | "reject" | "request_changes") => void;
  reviewReason: string;
  onChangeReason: (val: string) => void;
  reviewNotes: string;
  onChangeNotes: (val: string) => void;
  reviewChanges: string;
  onChangeChanges: (val: string) => void;
}

export function CampaignDecisionTab({
  reviewAction,
  onSelectAction,
  reviewReason,
  onChangeReason,
  reviewNotes,
  onChangeNotes,
  reviewChanges,
  onChangeChanges,
}: CampaignDecisionTabProps) {
  const quickChangeSnippets = [
    "Upload 1200x628 landscape display banners in high-res format",
    "Clarify conversion event qualification threshold (minimum deposit / trading volume)",
    "Specify attribution window cookie duration in commercial terms",
    "Include regulatory disclaimer for restricted jurisdictions",
  ];

  return (
    <div className="space-y-5">
      {/* Action Selector Cards */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-slate-900 block uppercase tracking-wider">
          Supervisory Review Determination
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Approve */}
          <button
            type="button"
            onClick={() => onSelectAction("approve")}
            className={cn(
              "p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 relative",
              reviewAction === "approve"
                ? "bg-emerald-50/70 border-emerald-500 shadow-xs ring-2 ring-emerald-500/20"
                : "bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50"
            )}
          >
            <div className="flex items-center justify-between w-full">
              <div
                className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center font-bold",
                  reviewAction === "approve"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                )}
              >
                <CheckCircle className="w-4 h-4" />
              </div>
              {reviewAction === "approve" && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                  Selected
                </span>
              )}
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                Approve & Advance
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                Approves commercial terms and routes to AI Partner Matching.
              </p>
            </div>
          </button>

          {/* Request Changes */}
          <button
            type="button"
            onClick={() => onSelectAction("request_changes")}
            className={cn(
              "p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 relative",
              reviewAction === "request_changes"
                ? "bg-amber-50/70 border-amber-500 shadow-xs ring-2 ring-amber-500/20"
                : "bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50"
            )}
          >
            <div className="flex items-center justify-between w-full">
              <div
                className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center font-bold",
                  reviewAction === "request_changes"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-amber-50 text-amber-600 border border-amber-100"
                )}
              >
                <AlertTriangle className="w-4 h-4" />
              </div>
              {reviewAction === "request_changes" && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-600 text-white">
                  Selected
                </span>
              )}
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                Request Changes
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                Returns draft to client with specific revision items.
              </p>
            </div>
          </button>

          {/* Reject */}
          <button
            type="button"
            onClick={() => onSelectAction("reject")}
            className={cn(
              "p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 relative",
              reviewAction === "reject"
                ? "bg-rose-50/70 border-rose-500 shadow-xs ring-2 ring-rose-500/20"
                : "bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50"
            )}
          >
            <div className="flex items-center justify-between w-full">
              <div
                className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center font-bold",
                  reviewAction === "reject"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-rose-50 text-rose-600 border border-rose-100"
                )}
              >
                <XCircle className="w-4 h-4" />
              </div>
              {reviewAction === "reject" && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white">
                  Selected
                </span>
              )}
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                Reject Campaign
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                Declines submission on compliance or policy grounds.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Requested Changes (when request_changes selected) */}
      {reviewAction === "request_changes" && (
        <div className="p-4 rounded-2xl border border-amber-200/90 bg-amber-50/40 space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-amber-900 block">
              Specific Requested Changes (one revision item per line)
            </label>
            <span className="text-[10px] text-amber-700 font-semibold">
              Client will see this list in Action Required portal
            </span>
          </div>

          <textarea
            rows={4}
            placeholder="e.g. Please clarify qualification criteria for CPA trigger&#10;Upload high-resolution 1200x628 banner"
            value={reviewChanges}
            onChange={(e) => onChangeChanges(e.target.value)}
            className="w-full text-xs p-3.5 bg-white border border-amber-300/80 rounded-xl outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 font-medium text-slate-800"
          />

          {/* Quick-add chips */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
              Common Feedback Quick-Insert:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickChangeSnippets.map((snippet, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    const current = reviewChanges.trim();
                    onChangeChanges(current ? `${current}\n${snippet}` : snippet);
                  }}
                  className="text-[10px] px-2.5 py-1 bg-white hover:bg-amber-100/60 border border-amber-200 text-amber-900 rounded-lg font-semibold cursor-pointer transition-colors text-left"
                >
                  + {snippet}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reason / Client Feedback */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 block">
            Executive Summary / Client Notification
          </label>
          <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded-md">
            Included in email & in-app alerts
          </span>
        </div>
        <input
          type="text"
          placeholder="e.g. Campaign verified and ready for matching"
          value={reviewReason}
          onChange={(e) => onChangeReason(e.target.value)}
          className="w-full text-xs px-3.5 h-10 bg-white border border-slate-200/90 rounded-xl outline-none focus:border-[#0364FF] focus:ring-2 focus:ring-[#0364FF]/20 font-medium text-slate-800 transition-all"
        />
      </div>

      {/* Internal Admin Notes */}
      <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Internal Compliance & Ops Audit Log</span>
          </label>
          <span className="text-[10px] text-slate-400 font-semibold">
            Confidential · Admin only
          </span>
        </div>
        <textarea
          rows={2}
          placeholder="Optional notes for risk, audit trails, and compliance history..."
          value={reviewNotes}
          onChange={(e) => onChangeNotes(e.target.value)}
          className="w-full text-xs p-3 bg-white border border-slate-200/90 rounded-xl outline-none focus:border-[#0364FF] focus:ring-2 focus:ring-[#0364FF]/20 resize-none font-medium text-slate-800 transition-all"
        />
      </div>
    </div>
  );
}
