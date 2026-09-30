"use client";

import { useState } from "react";
import { AdminTopBar } from "@/components/layout";
import { SectionCard } from "@/components/ui";
import { cn } from "@/lib/utils";
import { PartnerKycTab, OrgKycTab } from "./_components";

const TABS = ["Partner KYC", "Organization KYC"] as const;
type Tab = typeof TABS[number];

export default function KycPage() {
  const [tab, setTab] = useState<Tab>("Partner KYC");

  return (
    <div className="space-y-6">
      <AdminTopBar title="KYC Review" subtitle="Review and approve identity verification submissions" />

      <SectionCard
        title="KYC Records"
        subtitle="Approve or reject pending submissions"
        action={
          <div className="flex items-center gap-1 bg-slate-100 rounded-full p-1">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer",
                  tab === t ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-700"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        }
      >
        {tab === "Partner KYC" ? <PartnerKycTab /> : <OrgKycTab />}
      </SectionCard>
    </div>
  );
}
