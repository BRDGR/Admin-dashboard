"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminTopBar } from "@/components/layout";
import {
  getCampaignQueue,
  activateCampaign,
} from "@/lib/api/admin.api";
import type { AdminCampaignQueueItem } from "@/lib/types";
import {
  CampaignQueueTab,
  CampaignModalsContainer,
} from "./_components";

export default function AdminCampaignsPipelinePage() {
  const queryClient = useQueryClient();

  // Modals state
  const [reviewingCampaign, setReviewingCampaign] = useState<AdminCampaignQueueItem | null>(null);
  const [matchingCampaign, setMatchingCampaign] = useState<AdminCampaignQueueItem | null>(null);
  const [viewingAssignmentsCamp, setViewingAssignmentsCamp] = useState<AdminCampaignQueueItem | null>(null);
  const [perfCampaign, setPerfCampaign] = useState<AdminCampaignQueueItem | null>(null);

  // Filtering & Pagination
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  // Campaign Queue Query
  const { data: queueData, isLoading: queueLoading } = useQuery({
    queryKey: ["admin", "campaigns", "queue", page],
    queryFn: async () => {
      const res = await getCampaignQueue({ page, limit: 50 });
      if (res.error) throw new Error(res.error);
      return res.data?.data;
    },
  });

  // Campaign Activation Mutation
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

  // Data Normalization & Filter
  const rawCampaigns: AdminCampaignQueueItem[] =
    queueData?.campaigns ?? queueData?.queue ?? [];

  const queueItems = rawCampaigns.filter((item) => {
    if (statusFilter && statusFilter !== "all" && item.status !== statusFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    const orgName =
      (item.organization as { name?: string } | undefined)?.name ??
      item.organizationName ??
      "";
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

  return (
    <div className="space-y-6">
      <AdminTopBar
        title="Campaign Approvals & Matching Pipeline"
        subtitle="Review client campaign submissions, verify creative media & commercial terms, run AI partner matching, and activate campaigns."
      />

      {/* Focused Pipeline Queue Tab */}
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

      {/* Modals & Drawers Container */}
      <CampaignModalsContainer
        reviewingCampaign={reviewingCampaign}
        onCloseReview={() => setReviewingCampaign(null)}
        onCampaignApproved={(updated) => {
          setReviewingCampaign(null);
          setMatchingCampaign(updated);
        }}
        matchingCampaign={matchingCampaign}
        onCloseMatch={() => setMatchingCampaign(null)}
        onCampaignAssigned={(updated) => {
          setMatchingCampaign(null);
          setViewingAssignmentsCamp(updated);
        }}
        viewingAssignmentsCamp={viewingAssignmentsCamp}
        onCloseAssignments={() => setViewingAssignmentsCamp(null)}
        perfCampaign={perfCampaign}
        onClosePerformance={() => setPerfCampaign(null)}
      />
    </div>
  );
}
