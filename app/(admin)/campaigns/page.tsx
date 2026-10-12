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
  ValidationWorkQueueTable,
  CampaignPayoutAuditTab,
} from "./_components";
import {
  getCampaignQueue,
  getCampaign360Overview,
  activateCampaign,
  getValidationWorkQueue,
  approveCommercialEvent,
  rejectCommercialEvent,
  reverseCommercialEvent,
  getPayoutApprovalSummary,
  approvePayoutBatch,
  getCampaignScoringConfig,
  updateCampaignScoringConfig,
  getPartnerLeaderboard,
} from "@/lib/api/admin.api";
import type { AdminCampaignQueueItem, CampaignConfigVersionDTO } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Layers, ShieldCheck, CheckCircle2, Clock } from "lucide-react";

const TABS = [
  "Queue & Approvals",
  "360 Overview",
  "Performance & PIP",
  "Payout Approvals & Audit",
] as const;
type Tab = typeof TABS[number];

export default function AdminCampaignsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Queue & Approvals");
  const [queueSubView, setQueueSubView] = useState<"campaigns" | "commercial_events">("campaigns");
  const queryClient = useQueryClient();

  // Queue state
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
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

  // Commercial Validation Events Query
  const { data: validationQueueData, isLoading: validationLoading } = useQuery({
    queryKey: ["admin", "campaigns", "validation-queue"],
    queryFn: async () => {
      const res = await getValidationWorkQueue();
      if (!res.ok) throw new Error(res.error ?? "Failed to load validation queue");
      return res.data?.data?.events ?? [];
    },
    enabled: activeTab === "Queue & Approvals",
  });

  // Payout Summary Query
  const { data: payoutData } = useQuery({
    queryKey: ["admin", "campaigns", "payout-approval"],
    queryFn: async () => {
      const res = await getPayoutApprovalSummary();
      if (!res.ok) throw new Error(res.error ?? "Failed to load payout summary");
      return res.data?.data?.payoutSummary;
    },
    enabled: activeTab === "Payout Approvals & Audit",
  });

  // Scoring Config Query
  const { data: scoringConfigData } = useQuery({
    queryKey: ["admin", "campaigns", "scoring-config"],
    queryFn: async () => {
      const res = await getCampaignScoringConfig();
      if (!res.ok) throw new Error(res.error ?? "Failed to load scoring config");
      return res.data?.data;
    },
    enabled: activeTab === "Payout Approvals & Audit",
  });

  // Partner Leaderboard Query
  const { data: leaderboardData } = useQuery({
    queryKey: ["admin", "campaigns", "leaderboard"],
    queryFn: async () => {
      const res = await getPartnerLeaderboard();
      if (!res.ok) throw new Error(res.error ?? "Failed to load leaderboard");
      return res.data?.data?.partners ?? [];
    },
    enabled: activeTab === "Payout Approvals & Audit" || activeTab === "Performance & PIP",
  });

  // Mutations
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

  const approveBatchMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      const res = await approvePayoutBatch(campaignId);
      if (!res.ok) throw new Error(res.error ?? "Failed to approve batch");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "campaigns", "payout-approval"] });
    },
  });

  const updateScoringMutation = useMutation({
    mutationFn: async (config: CampaignConfigVersionDTO) => {
      const res = await updateCampaignScoringConfig(config);
      if (!res.ok) throw new Error(res.error ?? "Failed to update config");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "campaigns", "scoring-config"] });
    },
  });

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

  const totalRecords = statusFilter && statusFilter !== "all" ? queueItems.length : (queueData?.pagination?.totalRecords ?? rawCampaigns.length);
  const totalPages = queueData?.pagination?.totalPages ?? (totalRecords > 0 ? Math.ceil(totalRecords / 50) : 1);

  const pendingValidationCount = (validationQueueData ?? []).filter((e) => e.status === "pending").length;

  return (
    <div className="space-y-6">
      <AdminTopBar
        title="Campaign Operations & Governance"
        subtitle="Manage campaign approval queues, validation work queues, AI partner matching, Hamilton payouts, and scoring audit versioning."
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
        <div className="space-y-4">
          {/* Sub-view toggle between Campaigns Queue and Commercial Validation Queue */}
          <div className="flex items-center justify-between bg-slate-100 p-1 rounded-xl w-fit">
            <button
              onClick={() => setQueueSubView("campaigns")}
              className={cn(
                "px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-2",
                queueSubView === "campaigns"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Campaign Approvals Pipeline</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700 font-bold">
                {totalRecords}
              </span>
            </button>

            <button
              onClick={() => setQueueSubView("commercial_events")}
              className={cn(
                "px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-2",
                queueSubView === "commercial_events"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Validation Work Queue</span>
              {pendingValidationCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-bold animate-pulse">
                  {pendingValidationCount} Pending
                </span>
              )}
            </button>
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
              onReview={setReviewingCampaign}
              onMatch={setMatchingCampaign}
              onViewAssignments={setViewingAssignmentsCamp}
              onActivate={(campaignId) => activateMutation.mutate(campaignId)}
              onViewPerformance={setPerfCampaign}
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
      )}

      {activeTab === "360 Overview" && (
        <Campaign360Tab overview={overview360} isLoading={overviewLoading} />
      )}

      {activeTab === "Performance & PIP" && <CampaignPoliciesTab />}

      {activeTab === "Payout Approvals & Audit" && (
        <>
          {payoutData && scoringConfigData ? (
            <CampaignPayoutAuditTab
              payoutSummary={payoutData}
              scoringConfig={scoringConfigData.activeConfig}
              scoringHistory={scoringConfigData.history}
              partnersList={leaderboardData ?? []}
              onApproveBatch={async (campaignId) => {
                await approveBatchMutation.mutateAsync(campaignId);
              }}
              onUpdateScoringConfig={async (config) => {
                await updateScoringMutation.mutateAsync(config);
              }}
            />
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs">
              Loading payout normalization invariants and scoring audit logs...
            </div>
          )}
        </>
      )}

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
