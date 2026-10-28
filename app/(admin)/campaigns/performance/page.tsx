"use client";

import { AdminTopBar } from "@/components/layout";
import {
  CampaignPoliciesTab,
} from "../_components";

export default function CampaignPerformancePage() {
  return (
    <div className="space-y-6">
      <AdminTopBar
        title="Performance Governance & SLA Policies"
        subtitle="Manage partner conversion rate floors, automated breach pause triggers, partner leaderboards, and PIP remediation workflows."
      />

      {/* Policies & Partner Leaderboard */}
      <CampaignPoliciesTab />
    </div>
  );
}
