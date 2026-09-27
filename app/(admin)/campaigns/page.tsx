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
    queryKey: ["admin", "campaigns", "queue", page],
    queryFn: async () => {
      const res = await getCampaignQueue({ page, limit: 50 });
      if (res.error) throw new Error(res.error);
      return res.data?.data;
    },
  });

  const { data: overview360, isLoading: overviewLoading } = useQuery({
    queryKey: ["admin", "campaigns", "overview-360"],
    queryFn: async () => {
      const res = await getCampaign360Overview();
      if (!res.ok) throw new Error(res.error ?? "Failed to load 360 overview");
      return res.data?.data;
    },
    enabled: activeTab === "360 Overview",
  });

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

  const rawCampaigns: AdminCampaignQueueItem[] =
    queueData?.campaigns ?? queueData?.queue ?? [];

  // Status filtering is client-side — backend does not accept status query param
  const queueItems = rawCampaigns.filter((item) => {
    if (statusFilter && item.status !== statusFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    const orgName = (item.organization as { name?: string } | undefined)?.name ?? item.organizationName ?? "";
    return (
      item.name?.toLowerCase().includes(q) ||
      orgName.toLowerCase().includes(q) ||
      item.status?.toLowerCase().includes(q)
    );
  });

  const totalRecords = statusFilter ? queueItems.length : (queueData?.pagination?.totalRecords ?? rawCampaigns.length);
  const totalPages = queueData?.pagination?.totalPages ?? (totalRecords > 0 ? Math.ceil(totalRecords / 50) : 1);

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
          onReview={setReviewingCampaign}
          onMatch={setMatchingCampaign}
          onViewAssignments={setViewingAssignmentsCamp}
          onActivate={(campaignId) => activateMutation.mutate(campaignId)}
          onViewPerformance={setPerfCampaign}
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
