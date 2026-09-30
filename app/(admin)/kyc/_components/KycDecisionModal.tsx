"use client";

import { useState } from "react";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

export const COMMON_ACTION_REASONS = [
  "Document expired or unreadable",
  "Full legal name mismatch with identity document",
  "Proof of address older than 90 days",
  "Incorporation certificate incomplete or missing jurisdiction seal",
  "Selfie verification / liveness check failed",
  "Regulatory license verification required",
];

export interface KycDecisionModalProps {
  title: string;
  targetName: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (status: "verified" | "failed", notes?: string) => Promise<void>;
  isLoading: boolean;
}

export function KycDecisionModal({
  title,
  targetName,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: KycDecisionModalProps) {
  const [decisionType, setDecisionType] = useState<"approve" | "action_required" | "reject">("approve");
  const [selectedReason, setSelectedReason] = useState(COMMON_ACTION_REASONS[0]);
  const [customNotes, setCustomNotes] = useState("");

  if (!isOpen) return null;

  async function handleConfirm() {
    if (decisionType === "approve") {
      await onSubmit("verified", customNotes || undefined);
    } else if (decisionType === "action_required") {
      const fullNote = `Action Required: ${selectedReason}${customNotes ? ` — ${customNotes}` : ""}`;
      await onSubmit("failed", fullNote);
    } else {
      const fullNote = `Rejected: ${customNotes || "Compliance verification criteria not met"}`;
      await onSubmit("failed", fullNote);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{targetName}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer">
            <XCircle className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Decision Pill Switcher */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">Review Decision</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDecisionType("approve")}
                className={cn(
                  "py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5",
                  decisionType === "approve"
                    ? "bg-emerald-50 border-emerald-300 text-emerald-700 shadow-2xs"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                )}
              >
                <CheckCircle className="w-3.5 h-3.5" /> Approve
              </button>
              <button
                type="button"
                onClick={() => setDecisionType("action_required")}
                className={cn(
                  "py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5",
                  decisionType === "action_required"
                    ? "bg-amber-50 border-amber-300 text-amber-700 shadow-2xs"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                )}
              >
                <AlertTriangle className="w-3.5 h-3.5" /> Request Fix
              </button>
              <button
                type="button"
                onClick={() => setDecisionType("reject")}
                className={cn(
                  "py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5",
                  decisionType === "reject"
                    ? "bg-red-50 border-red-300 text-red-700 shadow-2xs"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                )}
              >
                <XCircle className="w-3.5 h-3.5" /> Reject
              </button>
            </div>
          </div>

          {/* Conditional Reason Selector for Action Required */}
          {decisionType === "action_required" && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-600 block">Identified Compliance Issue</label>
              <select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-full text-xs font-medium border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/50 outline-none focus:ring-2 focus:ring-[#0364FF]/20 focus:border-[#0364FF]"
              >
                {COMMON_ACTION_REASONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          )}

          {/* Custom Notes */}
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1.5">
              {decisionType === "approve" ? "Internal Compliance Notes (Optional)" : "Instructions / Rationale for Applicant"}
            </label>
            <textarea
              rows={3}
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder={
                decisionType === "approve"
                  ? "Approved under standard onboarding SLA..."
                  : decisionType === "action_required"
                  ? "Please re-upload a clear color scan of your passport..."
                  : "State legal compliance reason for rejection..."
              }
              className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#0364FF]/20 focus:border-[#0364FF] resize-none transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              variant={decisionType === "approve" ? "primary" : decisionType === "action_required" ? "secondary" : "danger"}
              className="flex-1"
              isLoading={isLoading}
              onClick={handleConfirm}
            >
              {decisionType === "approve" ? "Confirm Approval" : decisionType === "action_required" ? "Submit Action Request" : "Confirm Rejection"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
