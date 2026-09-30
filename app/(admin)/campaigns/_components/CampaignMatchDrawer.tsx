"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sparkles, X, Loader2, Info, Building2, Tag, DollarSign, Calendar } from "lucide-react";
import { Button, EmptyState } from "@/components/ui";
import { getCampaignMatches, assignCampaignPartners } from "@/lib/api/admin.api";
import type { AdminCampaignQueueItem, CampaignMatchPartner } from "@/lib/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface CampaignMatchDrawerProps {
  campaign: AdminCampaignQueueItem;
  onClose: () => void;
  /** Fires after partners are successfully assigned — parent can open Assignments modal */
  onAssigned?: (campaign: AdminCampaignQueueItem) => void;
}

export function CampaignMatchDrawer({ campaign, onClose, onAssigned }: CampaignMatchDrawerProps) {
  const queryClient = useQueryClient();
  const [selectedPartnerIds, setSelectedPartnerIds] = useState<string[]>([]);
  const [destinationUrl, setDestinationUrl] = useState("");
  const [invitationType, setInvitationType] = useState<"standard" | "exclusive" | "direct">("standard");
  const [customAssignMessage, setCustomAssignMessage] = useState("");

  const canRunMatching = campaign.status === "matching";

  console.log(
    `%c[CampaignMatchDrawer] Opened match drawer for campaign: ${campaign.id}`,
    "color: #10b981; font-weight: bold;",
    campaign
  );

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

  const { data: matchData, isLoading: matchesLoading } = useQuery({
    queryKey: ["admin", "campaigns", "matches", campaign.id],
    queryFn: async () => {
      console.log("[CampaignMatchDrawer] Requesting AI matches for campaign:", campaign.id);
      const res = await getCampaignMatches(campaign.id, { minMatchScore: 50, limit: 15 });
      if (res.error) throw new Error(res.error);
      console.log("[CampaignMatchDrawer] Matches returned:", res.data?.data);
      return res.data?.data;
    },
    // Only run the matching engine query when the campaign is in `matching` status
    enabled: canRunMatching,
  });

  const assignMutation = useMutation({
    mutationFn: async () => {
      if (selectedPartnerIds.length === 0) return;
      const payload = {
        partnerUserIds: selectedPartnerIds,
        destinationUrl,
        invitationType,
        customMessage: customAssignMessage || undefined,
      };
      console.log(
        `%c[CampaignMatchDrawer] Assigning partners to ${campaign.id}:`,
        "color: #f59e0b; font-weight: bold;",
        payload
      );
      const res = await assignCampaignPartners(campaign.id, payload);
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: (data) => {
      console.log("[CampaignMatchDrawer] Partner assignment success:", data);
      queryClient.invalidateQueries({ queryKey: ["admin", "campaigns"] });
      if (onAssigned) {
        // Hand off to Assignments modal so admin can see who was just invited
        onAssigned({ ...campaign, status: "assigned" });
      } else {
        onClose();
      }
    },
    onError: (err) => {
      console.error("[CampaignMatchDrawer] Assignment failed:", err);
    },
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#0364FF]" />
              <h3 className="text-sm font-bold text-slate-900">AI Partner Match Engine</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Matching candidates for "{campaign.name}"</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Campaign Info Summary Bar */}
        <div className="mx-5 mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-slate-700">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span>{orgName}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <span>{campaign.category ?? "General"}</span>
          </div>
          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
            <DollarSign className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {currency} {formattedBudget}
            </span>
          </div>
          {campaign.startDate && campaign.endDate ? (
            <div className="flex items-center gap-1.5 text-slate-500">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {format(new Date(campaign.startDate), "MMM d")} - {format(new Date(campaign.endDate), "MMM d, yyyy")}
              </span>
            </div>
          ) : null}
        </div>

        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {!canRunMatching ? (
            <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50">
              <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-800">Campaign not in matching status</p>
                <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                  The AI matching engine only runs on campaigns with status{" "}
                  <span className="font-mono font-bold">matching</span>. This campaign is currently{" "}
                  <span className="font-mono font-bold">{campaign.status}</span>. Review and approve it first to advance it to the matching stage.
                </p>
              </div>
            </div>
          ) : matchesLoading ? (
            <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Calculating partner match coefficients...
            </div>
          ) : (matchData?.matches ?? []).length === 0 ? (
            <EmptyState
              title="No partner matches found"
              description="Adjust campaign targeting or verify that verified partners exist in the vertical."
            />
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap pb-1">
                <p className="text-xs font-semibold text-slate-500">
                  AI-ranked candidates ({matchData?.matches?.length ?? 0}):
                </p>
                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      const top3 = (matchData?.matches ?? []).slice(0, 3).map((m: CampaignMatchPartner) => m.userId);
                      setSelectedPartnerIds(top3);
                    }}
                    className="px-2 py-0.5 rounded-lg bg-blue-50 text-[#0364FF] hover:bg-blue-100 font-semibold transition-colors cursor-pointer"
                  >
                    Select Top 3
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const all = (matchData?.matches ?? []).map((m: CampaignMatchPartner) => m.userId);
                      setSelectedPartnerIds(all);
                    }}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold transition-colors cursor-pointer"
                  >
                    Select All
                  </button>
                  {selectedPartnerIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedPartnerIds([])}
                      className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 font-medium transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {(matchData?.matches ?? []).map((m: CampaignMatchPartner) => {
                const isSelected = selectedPartnerIds.includes(m.userId);
                const score = m.matchScore || 0;
                const scoreColor =
                  score >= 80
                    ? "text-emerald-600 bg-emerald-50 border-emerald-200"
                    : score >= 65
                    ? "text-[#0364FF] bg-blue-50 border-blue-200"
                    : "text-amber-600 bg-amber-50 border-amber-200";

                return (
                  <div
                    key={m.userId}
                    onClick={() => {
                      setSelectedPartnerIds((prev) =>
                        isSelected ? prev.filter((id) => id !== m.userId) : [...prev, m.userId]
                      );
                    }}
                    className={cn(
                      "p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4",
                      isSelected
                        ? "border-[#0364FF] bg-blue-50/40 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded border-slate-300 text-[#0364FF] focus:ring-0 cursor-pointer shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-900 truncate">{m.partnerName}</span>
                          {m.isVetted && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-600 border border-emerald-200">
                              Vetted
                            </span>
                          )}
                          <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                            {m.location || "Global"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          {m.niches && m.niches.length > 0 ? (
                            m.niches.slice(0, 2).map((n) => (
                              <span key={n} className="text-[10px] font-semibold text-slate-500 bg-slate-50 px-1.5 py-0.2 rounded border border-slate-200/60">
                                {n}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-400">General Performance</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className={cn("text-xs font-black px-2 py-0.5 rounded-lg border inline-block", scoreColor)}>
                        {score}%
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">Match confidence</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Assignment Options */}
          <div className="border-t border-slate-100 pt-4 space-y-3">
            {/* Destination URL — required by API */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Destination / Landing Page URL <span className="text-rose-500">*</span>
              </label>
              <input
                type="url"
                placeholder="https://yourdomain.com/campaign-landing"
                value={destinationUrl}
                onChange={(e) => setDestinationUrl(e.target.value)}
                className="w-full text-xs h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#0364FF]"
              />
              <p className="text-[10px] text-slate-400 mt-1">Partners' tracking links will redirect to this URL.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Invitation Type</label>
                <select
                  value={invitationType}
                  onChange={(e) => setInvitationType(e.target.value as "standard" | "exclusive" | "direct")}
                  className="w-full text-xs h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none cursor-pointer"
                >
                  <option value="standard">Standard (Accept/Decline)</option>
                  <option value="exclusive">Exclusive Partner Slot</option>
                  <option value="direct">Direct Auto-Enroll</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Custom Ops Note</label>
                <input
                  placeholder="Optional message to partner..."
                  value={customAssignMessage}
                  onChange={(e) => setCustomAssignMessage(e.target.value)}
                  className="w-full text-xs h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            {selectedPartnerIds.length} partner{selectedPartnerIds.length !== 1 ? "s" : ""} selected
          </span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              disabled={selectedPartnerIds.length === 0 || !destinationUrl.trim()}
              isLoading={assignMutation.isPending}
              onClick={() => assignMutation.mutate()}
            >
              Assign Partners
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
