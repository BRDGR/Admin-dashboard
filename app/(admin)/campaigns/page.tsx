"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminTopBar } from "@/components/layout";
import {
  CampaignQueueTab,
  Campaign360Tab,
  CampaignPoliciesTab,
  CampaignReviewModal,
  CampaignMatchDrawer,
  CampaignAssignmentsModal,
  CampaignPerformanceModal,
} from "./_components";
import { getCampaignQueue, getCampaign360Overview, activateCampaign } from "@/lib/api/admin.api";
import type { AdminCampaignQueueItem } from "@/lib/types";
import { cn } from "@/lib/utils";

const TABS = ["Queue & Approvals", "360 Overview", "Performance & PIP"] as const;
type Tab = typeof TABS[number];

export default function AdminCampaignsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Queue & Approvals");
  const queryClient = useQueryClient();

  // Queue state
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState("");

  // Modals state
  const [reviewingCampaign, setReviewingCampaign] = useState<AdminCampaignQueueItem | null>(null);
  const [matchingCampaign, setMatchingCampaign] = useState<AdminCampaignQueueItem | null>(null);
  const [viewingAssignmentsCamp, setViewingAssignmentsCamp] = useState<AdminCampaignQueueItem | null>(null);
  const [perfCampaign, setPerfCampaign] = useState<AdminCampaignQueueItem | null>(null);

  // Queries
  const { data: queueData, isLoading: queueLoading } = useQuery({
    queryKey: ["admin", "campaigns", "queue", page, statusFilter],
    queryFn: async () => {
      const res = await getCampaignQueue({
        page,
        limit: 10,
        status: statusFilter || undefined,
      });
      if (res.error) throw new Error(res.error);
      return res.data?.data;
    },
  });

  const { data: overview360, isLoading: overviewLoading } = useQuery({
    queryKey: ["admin", "campaigns", "overview-360"],
    queryFn: async () => {
      const res = await getCampaign360Overview();
      if (res.error) throw new Error(res.error);
      return res.data?.data;
    },
    enabled: activeTab === "360 Overview",
  });

  // Activation Mutation
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

  // Filtered queue items — API returns `queue`, not `campaigns`
  const queueItems = (queueData?.queue ?? []).filter((item) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      item.name?.toLowerCase().includes(q) ||
      item.organizationName?.toLowerCase().includes(q) ||
      item.organization?.name?.toLowerCase().includes(q) ||
      item.status?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <AdminTopBar
        title="Campaign Operations"
        subtitle="Manage campaign approval queues, AI partner matching, tracking activation, and performance SLA policies."
      />

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2.5 text-xs font-semibold border-b-2 -mb-px transition-colors cursor-pointer",
              activeTab === tab
                ? "border-[#0364FF] text-[#0364FF]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      {activeTab === "Queue & Approvals" && (
        <CampaignQueueTab
          campaigns={queueItems}
          totalRecords={queueData?.pagination?.totalRecords ?? 0}
          totalPages={queueData?.pagination?.totalPages ?? 1}
          page={page}
          isLoading={queueLoading}
          isActivating={activateMutation.isPending}
          onPageChange={setPage}
          onStatusFilterChange={(status) => {
            setStatusFilter(status);
            setPage(1);
          }}
          onSearchChange={setSearch}
          onReview={(campaign) => setReviewingCampaign(campaign)}
          onMatch={(campaign) => setMatchingCampaign(campaign)}
          onViewAssignments={(campaign) => setViewingAssignmentsCamp(campaign)}
          onActivate={(campaignId) => activateMutation.mutate(campaignId)}
          onViewPerformance={(campaign) => setPerfCampaign(campaign)}
        />
      )}

      {activeTab === "360 Overview" && (
        <Campaign360Tab overview={overview360} isLoading={overviewLoading} />
      )}

      {activeTab === "Performance & PIP" && <CampaignPoliciesTab />}

      {/* ── Modals & Drawers ── */}
      {reviewingCampaign && (
        <CampaignReviewModal
          campaign={reviewingCampaign}
          onClose={() => setReviewingCampaign(null)}
          onApproved={(updatedCampaign) => {
            // Close review modal and immediately open the Match Drawer
            setReviewingCampaign(null);
            setMatchingCampaign(updatedCampaign);
          }}
        />
      )}

      {matchingCampaign && (
        <CampaignMatchDrawer
          campaign={matchingCampaign}
          onClose={() => setMatchingCampaign(null)}
          onAssigned={(updatedCampaign) => {
            // Close match drawer and open Assignments modal to show invited partners
            setMatchingCampaign(null);
            setViewingAssignmentsCamp(updatedCampaign);
          }}
        />
      )}

      {viewingAssignmentsCamp && (
        <CampaignAssignmentsModal
          campaign={viewingAssignmentsCamp}
          onClose={() => setViewingAssignmentsCamp(null)}
        />
      )}

      {perfCampaign && (
        <CampaignPerformanceModal
          campaign={perfCampaign}
          onClose={() => setPerfCampaign(null)}
        />
      )}
    </div>
  );
}
