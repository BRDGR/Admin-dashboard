"use client";

import { useQuery } from "@tanstack/react-query";
import { AdminTopBar } from "@/components/layout";
import { getCampaign360Overview } from "@/lib/api/admin.api";
import {
  Campaign360Tab,
} from "../_components";

export default function CampaignOverviewPage() {
  const { data: overview360, isLoading: overviewLoading } = useQuery({
    queryKey: ["admin", "campaigns", "overview-360"],
    queryFn: async () => {
      const res = await getCampaign360Overview();
      if (!res.ok) throw new Error(res.error ?? "Failed to load 360 overview");
      return res.data?.data;
    },
  });

  return (
    <div className="space-y-6">
      <AdminTopBar
        title="Campaign 360 Telemetry & Platform Health"
        subtitle="Full vertical funnel telemetry across Reach → Clicks → Demo/Reg → Qualified → FTD/Sale and fraud risk anomaly monitoring."
      />

      {/* 360 Telemetry View */}
      <Campaign360Tab overview={overview360} isLoading={overviewLoading} />
    </div>
  );
}
