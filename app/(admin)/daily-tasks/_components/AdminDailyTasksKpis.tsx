"use client";

import React from "react";
import { Clock, CheckCircle2, FileCheck2, AlertTriangle } from "lucide-react";
import type { AdminDailyTasksKpis as KpiType } from "@/lib/types/daily-tasks.types";

export function AdminDailyTasksKpis({ kpis, isLoading }: { kpis: KpiType; isLoading?: boolean }) {
  const cards = [
    {
      label: "Pending Approval",
      value: kpis.pendingApprovalCount,
      sublabel: "Awaiting BRDGR compliance review",
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Approved (Unpublished)",
      value: kpis.approvedNotPublishedCount,
      sublabel: "Ready for snapshot publication",
      icon: CheckCircle2,
      color: "text-[#0364FF]",
      bg: "bg-blue-50",
    },
    {
      label: "Submissions to Verify",
      value: kpis.submissionsToVerifyCount,
      sublabel: "Partner proof-of-work in queue",
      icon: FileCheck2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Past Deadline (Unverified)",
      value: kpis.pastDeadlineUnverifiedCount,
      sublabel: "Urgent verification attention needed",
      icon: AlertTriangle,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all duration-150"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {card.label}
              </span>
              <div className={`p-2 rounded-lg ${card.bg} ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                {isLoading ? "—" : card.value}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{card.sublabel}</p>
          </div>
        );
      })}
    </div>
  );
}
