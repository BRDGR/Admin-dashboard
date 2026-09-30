"use client";

import { useState } from "react";
import { X, CheckCircle, XCircle, ShieldAlert, Loader2, User, Clock, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { reviewPendingChange } from "@/lib/api/admin.api";
import { logger } from "@/lib/logger";
import type { PendingChangeItem } from "@/lib/types";
import { toast } from "sonner";
import { PendingChangePayloadViewer } from "./PendingChangePayloadViewer";

interface ReviewPendingChangeModalProps {
  change: PendingChangeItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReviewPendingChangeModal({
  change,
  onClose,
  onSuccess,
}: ReviewPendingChangeModalProps) {
  const [decision, setDecision] = useState<"approved" | "rejected">("approved");
  const [reviewNote, setReviewNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!change) return null;

  const isPending = change.status === "pending";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!change) return;

    if (decision === "rejected" && !reviewNote.trim()) {
      toast.error("Please provide a reason or note when rejecting a change.");
      return;
    }

    try {
      setIsSubmitting(true);
      logger.debug("[ReviewPendingChangeModal] Submitting review decision:", {
        changeId: change.id,
        routeKey: change.routeKey,
        decision,
        reviewNote: reviewNote.trim() || undefined,
      });

      const res = await reviewPendingChange(change.id, {
        decision,
        reviewNote: reviewNote.trim() || undefined,
      });

      logger.debug("[ReviewPendingChangeModal] API Review result:", res);

      if (!res.ok || res.data?.error) {
        const errorMsg =
          res.error ||
          res.data?.message ||
          `Failed to ${decision} change request (Status: ${res.status})`;
        logger.error("[ReviewPendingChangeModal] Failed review operation:", {
          errorMsg,
          res,
        });
        toast.error(errorMsg);
        return;
      }

      toast.success(
        `Change request successfully ${decision === "approved" ? "approved and executed" : "rejected"}`
      );
      onSuccess();
      onClose();
    } catch (err) {
      logger.error("[ReviewPendingChangeModal] Exception during review submission:", err);
      toast.error("Failed to process review decision");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                {isPending ? "Maker-Checker Review" : "Change Audit Record"}
              </h2>
              <p className="text-xs text-slate-500 font-mono">{change.routeKey || change.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Metadata bar */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-700">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-medium">Requested by:</span>
                <span>
                  {change.requester
                    ? `${change.requester.firstName} ${change.requester.lastName} (${change.requester.email})`
                    : "Admin Staff"}
                </span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full font-semibold uppercase text-[10px] ${
                  change.status === "pending"
                    ? "bg-amber-100 text-amber-700"
                    : change.status === "approved"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {change.status}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-500">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Created: {format(new Date(change.createdAt), "MMM d, yyyy HH:mm")}</span>
              </div>
              {change.expiresAt && (
                <span>Expires: {format(new Date(change.expiresAt), "MMM d, yyyy")}</span>
              )}
            </div>
          </div>

          {/* Payload Inspector */}
          <PendingChangePayloadViewer urlParams={change.urlParams} body={change.body} />

          {/* Existing decision note if not pending */}
          {!isPending && change.reviewNote && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
              <span className="font-semibold text-slate-700">Reviewer Note:</span>
              <p className="text-slate-600">{change.reviewNote}</p>
            </div>
          )}

          {/* Review Decision Form */}
          {isPending && (
            <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-slate-100">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-800">Review Decision</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDecision("approved")}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      decision === "approved"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-xs"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Approve Change
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecision("rejected")}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      decision === "rejected"
                        ? "border-red-500 bg-red-50 text-red-700 shadow-xs"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <XCircle className="w-4 h-4 text-red-600" />
                    Reject Change
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">
                  Reviewer Audit Note {decision === "rejected" && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  rows={3}
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder={
                    decision === "approved"
                      ? "Optional justification or confirmation for audit log..."
                      : "Reason for rejecting this change (mandatory)..."
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0364FF]/20 focus:border-[#0364FF] resize-none"
                />
              </div>

              {decision === "approved" && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p>
                    Approving this change will immediately execute the underlying mutation{" "}
                    <code className="font-mono bg-white/70 px-1 py-0.5 rounded">
                      {change.routeKey}
                    </code>{" "}
                    with the supplied parameters.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-xl transition-all shadow-sm disabled:opacity-50 ${
                    decision === "approved"
                      ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                      : "bg-red-600 hover:bg-red-700 shadow-red-600/20"
                  }`}
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Confirm {decision === "approved" ? "Approval" : "Rejection"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
