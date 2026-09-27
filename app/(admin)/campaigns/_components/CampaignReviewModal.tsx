"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Building2, Tag, DollarSign, Calendar, ShieldCheck } from "lucide-react";
import { Button, StatusBadge } from "@/components/ui";
import { reviewCampaign } from "@/lib/api/admin.api";
import type { AdminCampaignQueueItem, CampaignReviewPayload } from "@/lib/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface CampaignReviewModalProps {
  campaign: AdminCampaignQueueItem;
  onClose: () => void;
  /** Fires after a successful Approve — receives the campaign with status promoted to `matching` */
  onApproved?: (campaign: AdminCampaignQueueItem) => void;
}

export function CampaignReviewModal({ campaign, onClose, onApproved }: CampaignReviewModalProps) {
  const queryClient = useQueryClient();
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | "request_changes">("approve");
  const [reviewReason, setReviewReason] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");
  const [reviewChanges, setReviewChanges] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const orgName = campaign.organization?.name ?? campaign.organizationName ?? "Client Org";
  const currency = campaign.budgetCurrency ?? campaign.currency ?? "USD";
  const formattedBudget = campaign.budgetAmount
    ? Number(campaign.budgetAmount).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : campaign.budgetMinor
    ? (campaign.budgetMinor / 100).toLocaleString()
    : campaign.budget
    ? Number(campaign.budget).toLocaleString()
    : "N/A";

  const reviewMutation = useMutation({
    mutationFn: async () => {
      const statusMap = {
        approve: "matching",
        reject: "cancelled",
        request_changes: "cancelled",
      } as const;

      const payload: CampaignReviewPayload = {
        status: statusMap[reviewAction],
        reason: reviewReason || undefined,
        notes: reviewNotes || undefined,
        requestedChanges: reviewChanges
          ? reviewChanges.split("\n").filter(Boolean)
          : undefined,
      };

      const res = await reviewCampaign(campaign.id, payload);
      if (!res.ok) throw new Error(res.error ?? "Review submission failed");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "campaigns", "queue"] });
      if (reviewAction === "approve" && onApproved) {
        onApproved({ ...campaign, status: "matching" });
      } else {
        onClose();
      }
    },
    onError: (err: Error) => {
      setSubmitError(err.message);
    },
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Review Campaign Submission</h3>
            <p className="text-xs text-slate-400">{campaign.name}</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Campaign Info Summary Card */}
        <div className="mx-5 mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 text-[13px]">{campaign.name}</span>
            <StatusBadge status={campaign.status} />
          </div>
          <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1 border-t border-slate-200/60">
            <div className="flex items-center gap-1.5 truncate">
              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate font-medium">{orgName}</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{campaign.category ?? "General"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-800">
                {currency} {formattedBudget}
              </span>
            </div>
            {campaign.startDate && campaign.endDate ? (
              <div className="flex items-center gap-1.5 truncate">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">
                  {format(new Date(campaign.startDate), "MMM d")} - {format(new Date(campaign.endDate), "MMM d, yyyy")}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Ongoing</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Decision Action</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setReviewAction("approve")}
                className={cn(
                  "py-2 px-3 text-xs font-bold rounded-xl border transition-colors cursor-pointer",
                  reviewAction === "approve"
                    ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                )}
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => setReviewAction("request_changes")}
                className={cn(
                  "py-2 px-3 text-xs font-bold rounded-xl border transition-colors cursor-pointer",
                  reviewAction === "request_changes"
                    ? "bg-amber-50 border-amber-300 text-amber-700"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                )}
              >
                Request Changes
              </button>
              <button
                type="button"
                onClick={() => setReviewAction("reject")}
                className={cn(
                  "py-2 px-3 text-xs font-bold rounded-xl border transition-colors cursor-pointer",
                  reviewAction === "reject"
                    ? "bg-rose-50 border-rose-300 text-rose-700"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                )}
              >
                Reject
              </button>
            </div>
          </div>

          {reviewAction === "request_changes" && (
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Requested Changes (one per line)
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Please clarify qualification criteria for CPA trigger&#10;Add target markets for GCC"
                value={reviewChanges}
                onChange={(e) => setReviewChanges(e.target.value)}
                className="w-full text-xs p-3 border border-slate-200 rounded-xl outline-none focus:border-[#0364FF]"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Reason / Client Feedback
            </label>
            <input
              type="text"
              placeholder="e.g. Campaign verified and ready for matching"
              value={reviewReason}
              onChange={(e) => setReviewReason(e.target.value)}
              className="w-full text-xs px-3 h-9 border border-slate-200 rounded-xl outline-none focus:border-[#0364FF]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Internal Admin Notes</label>
            <textarea
              rows={2}
              placeholder="Optional internal ops note..."
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              className="w-full text-xs p-3 border border-slate-200 rounded-xl outline-none focus:border-[#0364FF]"
            />
          </div>
        </div>

        {submitError && (
          <p className="px-5 pb-3 text-xs text-rose-600 font-medium">{submitError}</p>
        )}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            variant="primary"
            isLoading={reviewMutation.isPending}
            onClick={() => reviewMutation.mutate()}
          >
            Submit Review
          </Button>
        </div>
      </div>
    </div>
  );
}
