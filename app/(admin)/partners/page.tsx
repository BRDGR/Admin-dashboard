"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { AdminTopBar } from "@/components/layout";
import { SectionCard, DataTable, StatusBadge, Pagination } from "@/components/ui";
import { usePartners, useNormalPartners, useByopPartners } from "@/lib/hooks/usePartners";
import type { PartnerRecord } from "@/lib/types";
import type { Column } from "@/components/ui";
import { cn } from "@/lib/utils";

const TABS = ["All", "Normal", "BYOP"] as const;
type Tab = typeof TABS[number];

function useColumns(): Column<PartnerRecord>[] {
  const router = useRouter();
  return [
    {
      key: "name",
      header: "Partner",
      render: ({ user }) => {
        const initial = user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "P";
        const fullName =
          [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
          user?.email ||
          "Unknown Partner";
        const email = user?.email || "—";
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0364FF]/15 to-indigo-100 flex items-center justify-center text-[#0364FF] font-bold text-xs shrink-0">
              {initial}
            </div>
            <div>
              <p className="text-[13px] font-semibold text-slate-900">{fullName}</p>
              <p className="text-[11px] text-slate-400">{email}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: "location",
      header: "Location",
      render: ({ partnerProfile }) => (
        <span className="text-xs text-slate-600">{partnerProfile?.location || "—"}</span>
      ),
    },
    {
      key: "industries",
      header: "Industries",
      render: ({ partnerProfile }) => {
        const industries = Array.isArray(partnerProfile?.industries) ? partnerProfile.industries : [];
        return (
          <div className="flex flex-wrap gap-1">
            {industries.slice(0, 2).map((ind) => (
              <span key={ind} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-medium">
                {ind}
              </span>
            ))}
            {industries.length === 0 && <span className="text-[10px] text-slate-400">—</span>}
          </div>
        );
      },
    },
    {
      key: "capacity",
      header: "Capacity",
      render: ({ partnerProfile }) => (
        <span className="text-xs text-slate-600 capitalize">
          {partnerProfile?.capacity ? partnerProfile.capacity.replace("_", " ") : "—"}
        </span>
      ),
    },
    {
      key: "vetted",
      header: "Vetted",
      render: ({ partnerProfile }) => (
        <StatusBadge status={partnerProfile?.isVetted ? "approved" : "pending"} />
      ),
    },
    {
      key: "joined",
      header: "Joined",
      render: ({ user }) => {
        let joined = "—";
        if (user?.createdAt) {
          try {
            joined = format(new Date(user.createdAt), "MMM d, yyyy");
          } catch {
            joined = "—";
          }
        }
        return <span className="text-xs text-slate-400">{joined}</span>;
      },
    },
    {
      key: "action",
      header: "",
      render: ({ user, partnerProfile }) => {
        const targetId = user?.id || partnerProfile?.userId;
        if (!targetId) return null;
        return (
          <button
            onClick={() => router.push(`/partners/${targetId}`)}
            className="text-[11px] font-semibold text-[#0364FF] hover:underline cursor-pointer"
          >
            View →
          </button>
        );
      },
    },
  ];
}

function TabContent({ tab }: { tab: Tab }) {
  const [page, setPage] = useState(1);
  const allQ = usePartners(page, 20);
  const normalQ = useNormalPartners(page, 20);
  const byopQ = useByopPartners(page, 20);
  const columns = useColumns();

  const q = tab === "All" ? allQ : tab === "Normal" ? normalQ : byopQ;
  const data = q.data?.partners ?? [];
  const pagination = q.data?.pagination;

  return (
    <>
      <DataTable columns={columns} data={data} isLoading={q.isLoading} emptyMessage="No partners found." />
      {pagination && <Pagination pagination={pagination} onPageChange={setPage} />}
    </>
  );
}

export default function PartnersPage() {
  const [tab, setTab] = useState<Tab>("All");

  return (
    <div className="space-y-6">
      <AdminTopBar title="Partners" subtitle="Manage all partner profiles on the platform" />

      <SectionCard
        title="Partner Directory"
        subtitle="All registered partner accounts"
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
        <TabContent tab={tab} />
      </SectionCard>
    </div>
  );
}
