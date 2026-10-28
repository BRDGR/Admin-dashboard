"use client";

import { AdminTopBar } from "@/components/layout";
import {
  CampaignPayoutAuditSection,
} from "../_components";

export default function CampaignPayoutsPage() {
  return (
    <div className="space-y-6">
      <AdminTopBar
        title="Hamilton Payout Approvals & Scoring Audit"
        subtitle="Supervise Hamilton allocation pools, holdback reserves, batch settlement approvals, and versioned scoring configuration logs."
      />

      {/* Payout Pools & Scoring Version Audit Section */}
      <CampaignPayoutAuditSection />
    </div>
  );
}
