"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layers, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminCampaignQueueItem } from "@/lib/types";
import {
  getCampaignQueue,
  activateCampaign,
  getValidationWorkQueue,
  approveCommercialEvent,
  rejectCommercialEvent,
  reverseCommercialEvent,
} from "@/lib/api/admin.api";
import { CampaignQueueTab } from "../CampaignQueueTab";
import { ValidationWorkQueueTable } from "../ValidationWorkQueueTable";

interface CampaignQueueSectionProps {
  onReview: (campaign: AdminCampaignQueueItem) => void;
  onMatch: (campaign: AdminCampaignQueueItem) => void;
  onViewAssignments: (campaign: AdminCampaignQueueItem) => void;
  onViewPerformance: (campaign: AdminCampaignQueueItem) => void;
}

export function CampaignQueueSection({
  onReview,
  onMatch,
  onViewAssignments,
  onViewPerformance,
}: CampaignQueueSectionProps) {
  const queryClient = useQueryClient();
  const [queueSubView, setQueueSubView] = useState<"campaigns" | "commercial_events">("campaigns");

  // Filtering & Pagination
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  // 1. Campaign Queue Query
  const { data: queueData, isLoading: queueLoading } = useQuery({
    queryKey: ["admin", "campaigns", "queue", page],
    queryFn: async () => {
      const res = await getCampaignQueue({ page, limit: 50 });
      if (res.error) throw new Error(res.error);
      return res.data?.data;
    },
  });

  // 2. Commercial Validation Events Query
  const { data: validationQueueData, isLoading: validationLoading } = useQuery({
    queryKey: ["admin", "campaigns", "validation-queue"],
    queryFn: async () => {
      const res = await getValidationWorkQueue();
      return res.data?.data?.events ?? [];
    },
  });

  // 3. Campaign Activation Mutation
  const activateMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      const res = await activateCampaign(campaignId, {
        generateTrackingLinks: true,
        notifyPartners: true,
      });
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "campaigns"] });
    },
  });

  // 4. Validation Event Review Mutations
  const approveEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const res = await approveCommercialEvent(eventId);
      if (!res.ok) throw new Error(res.error ?? "Failed to approve event");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "campaigns", "validation-queue"] });
    },
  });

  const rejectEventMutation = useMutation({
    mutationFn: async ({ eventId, reason }: { eventId: string; reason: string }) => {
      const res = await rejectCommercialEvent(eventId, reason);
      if (!res.ok) throw new Error(res.error ?? "Failed to reject event");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "campaigns", "validation-queue"] });
    },
  });

  const reverseEventMutation = useMutation({
    mutationFn: async ({ eventId, reason }: { eventId: string; reason: string }) => {
      const res = await reverseCommercialEvent(eventId, reason);
      if (!res.ok) throw new Error(res.error ?? "Failed to reverse event");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "campaigns", "validation-queue"] });
    },
  });

  // Data Normalization & Filter
  const rawCampaigns: AdminCampaignQueueItem[] =
    queueData?.campaigns ?? queueData?.queue ?? [];

  const queueItems = rawCampaigns.filter((item) => {
    if (statusFilter && statusFilter !== "all" && item.status !== statusFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    const orgName = (item.organization as { name?: string } | undefined)?.name ?? item.organizationName ?? "";
    return (
      item.name?.toLowerCase().includes(q) ||
      orgName.toLowerCase().includes(q) ||
      item.status?.toLowerCase().includes(q)
    );
  });

  const totalRecords =
    statusFilter && statusFilter !== "all"
      ? queueItems.length
      : queueData?.pagination?.totalRecords ?? rawCampaigns.length;
  const totalPages =
    queueData?.pagination?.totalPages ?? (totalRecords > 0 ? Math.ceil(totalRecords / 50) : 1);

  const pendingValidationCount = (validationQueueData ?? []).filter((e) => e.status === "pending").length;

  return (
    <div className="space-y-4">
      {/* Sub-view switcher header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl w-full sm:w-auto overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setQueueSubView("campaigns")}
            className={cn(
              "flex-1 sm:flex-none px-3.5 py-2 text-xs font-semibold rounded-lg transition-all duration-150 cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap",
              queueSubView === "campaigns"
                ? "bg-white text-slate-900 shadow-xs font-bold border border-slate-200/60"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            )}
          >
            <Layers className="w-3.5 h-3.5 text-[#0364FF]" />
            <span>Campaign Pipeline</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200/80 text-slate-700 font-bold">
              {totalRecords}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setQueueSubView("commercial_events")}
            className={cn(
              "flex-1 sm:flex-none px-3.5 py-2 text-xs font-semibold rounded-lg transition-all duration-150 cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap",
              queueSubView === "commercial_events"
                ? "bg-white text-slate-900 shadow-xs font-bold border border-slate-200/60"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            )}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Validation Work Queue</span>
            {pendingValidationCount > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-white font-bold animate-pulse">
                {pendingValidationCount} Pending
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200/80 text-slate-600 font-bold">
                0
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium px-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="hidden sm:inline">Real-time pipeline synchronization active</span>
          <span className="sm:hidden">Live sync active</span>
        </div>
      </div>

      {queueSubView === "campaigns" ? (
        <CampaignQueueTab
          campaigns={queueItems}
          totalRecords={totalRecords}
          totalPages={totalPages}
          page={page}
          isLoading={queueLoading}
          isActivating={activateMutation.isPending}
          onPageChange={setPage}
          onStatusFilterChange={(status) => {
            setStatusFilter(status);
            setPage(1);
          }}
          onSearchChange={setSearch}
          onReview={onReview}
          onMatch={onMatch}
          onViewAssignments={onViewAssignments}
          onActivate={(campaignId) => activateMutation.mutate(campaignId)}
          onViewPerformance={onViewPerformance}
        />
      ) : (
        <ValidationWorkQueueTable
          events={validationQueueData ?? []}
          isLoading={validationLoading}
          onApprove={async (eventId) => {
            await approveEventMutation.mutateAsync(eventId);
          }}
          onReject={async (eventId, reason) => {
            await rejectEventMutation.mutateAsync({ eventId, reason });
          }}
          onReverse={async (eventId, reason) => {
            await reverseEventMutation.mutateAsync({ eventId, reason });
          }}
        />
      )}
    </div>
  );
}
