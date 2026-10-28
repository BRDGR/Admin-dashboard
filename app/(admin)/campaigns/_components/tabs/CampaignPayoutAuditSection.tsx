"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CampaignConfigVersionDTO } from "@/lib/types";
import {
  getPayoutApprovalSummary,
  approvePayoutBatch,
  getCampaignScoringConfig,
  updateCampaignScoringConfig,
  getPartnerLeaderboard,
} from "@/lib/api/admin.api";
import { CampaignPayoutAuditTab } from "../CampaignPayoutAuditTab";

export function CampaignPayoutAuditSection() {
  const queryClient = useQueryClient();

  // 1. Payout Summary Query
  const { data: payoutData, error: payoutError } = useQuery({
    queryKey: ["admin", "campaigns", "payout-approval"],
    queryFn: async () => {
      const res = await getPayoutApprovalSummary();
      return res.data?.data?.payoutSummary ?? null;
    },
  });

  // 2. Scoring Config Query
  const { data: scoringConfigData, error: scoringConfigError } = useQuery({
    queryKey: ["admin", "campaigns", "scoring-config"],
    queryFn: async () => {
      const res = await getCampaignScoringConfig();
      return res.data?.data ?? null;
    },
  });

  // 3. Partner Leaderboard Query
  const { data: leaderboardData } = useQuery({
    queryKey: ["admin", "campaigns", "leaderboard"],
    queryFn: async () => {
      const res = await getPartnerLeaderboard();
      if (!res.ok) throw new Error(res.error ?? "Failed to load leaderboard");
      return res.data?.data?.partners ?? [];
    },
  });

  // Batch Payout Mutation
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

  // Scoring Mutation
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

  const payoutTabError = payoutError ?? scoringConfigError;
  const isPayoutTabReady = Boolean(payoutData && scoringConfigData?.activeConfig);

  if (isPayoutTabReady && payoutData && scoringConfigData?.activeConfig) {
    return (
      <CampaignPayoutAuditTab
        payoutSummary={payoutData}
        scoringConfig={scoringConfigData.activeConfig}
        scoringHistory={scoringConfigData.history ?? []}
        partnersList={leaderboardData ?? []}
        onApproveBatch={async (campaignId) => {
          await approveBatchMutation.mutateAsync(campaignId);
        }}
        onUpdateScoringConfig={async (config) => {
          await updateScoringMutation.mutateAsync(config);
        }}
      />
    );
  }

  if (payoutTabError) {
    return (
      <div className="p-12 text-center text-rose-600 text-xs" role="alert">
        {payoutTabError.message || "Failed to load payout approvals and scoring configuration."}
      </div>
    );
  }

  return (
    <div className="p-12 text-center text-slate-400 text-xs">
      Loading payout normalization invariants and scoring audit logs...
    </div>
  );
}
