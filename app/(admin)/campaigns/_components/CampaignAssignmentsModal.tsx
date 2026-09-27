"use client";

import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { X, Loader2 } from "lucide-react";
import { Button, StatusBadge, EmptyState } from "@/components/ui";
import { getCampaignAssignments } from "@/lib/api/admin.api";
import type { AdminCampaignQueueItem, CampaignAssignment } from "@/lib/types";

interface CampaignAssignmentsModalProps {
  campaign: AdminCampaignQueueItem;
  onClose: () => void;
}

export function CampaignAssignmentsModal({ campaign, onClose }: CampaignAssignmentsModalProps) {
  const { data: assignmentsData, isLoading } = useQuery({
    queryKey: ["admin", "campaigns", "assignments", campaign.id],
    queryFn: async () => {
      const res = await getCampaignAssignments(campaign.id, { limit: 20 });
      if (res.error) throw new Error(res.error);
      return res.data?.data;
    },
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Partner Assignments</h3>
            <p className="text-xs text-slate-400">{campaign.name}</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="py-8 text-center text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading assignments...
            </div>
          ) : (assignmentsData?.assignments ?? []).length === 0 ? (
            <EmptyState
              title="No partner assignments yet"
              description="Use the Match button on the campaign to assign partners."
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {assignmentsData?.assignments.map((asgn: CampaignAssignment) => (
                <div key={asgn.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{asgn.partnerName ?? "Partner"}</p>
                    <p className="text-[11px] text-slate-400">{asgn.partnerEmail}</p>
                    {asgn.trackingLink && (
                      <span className="text-[10px] font-mono text-[#0364FF] block mt-0.5 truncate max-w-xs">
                        {asgn.trackingLink}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <StatusBadge status={asgn.status} />
                    <span className="text-[10px] text-slate-400 block mt-1">
                      {asgn.assignedAt ? format(new Date(asgn.assignedAt), "MMM d") : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <Button size="sm" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
