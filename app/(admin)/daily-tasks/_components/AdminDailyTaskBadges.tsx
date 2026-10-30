"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { DailyTaskStatus, SubmissionStatus, PlatformType } from "@/lib/types/daily-tasks.types";

export function AdminDailyTaskStatusBadge({ status }: { status: DailyTaskStatus }) {
  const config = (() => {
    switch (status) {
      case "Published":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Pending Approval":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Approved":
        return "bg-blue-50 text-[#0364FF] border-blue-200";
      case "Draft":
        return "bg-slate-100 text-slate-600 border-slate-200";
      case "Completed":
        return "bg-emerald-50 text-emerald-800 border-emerald-300";
      case "Rejected":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "Cancelled":
        return "bg-slate-100 text-slate-500 border-slate-200";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  })();

  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border", config)}>
      {status}
    </span>
  );
}

export function AdminSubmissionStatusBadge({ status }: { status: SubmissionStatus }) {
  const config = (() => {
    switch (status) {
      case "Verified":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Submitted":
        return "bg-blue-50 text-[#0364FF] border-blue-200";
      case "Under Verification":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Changes Required":
        return "bg-amber-50 text-amber-800 border-amber-300";
      case "Failed Verification":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "Pending":
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  })();

  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border", config)}>
      {status}
    </span>
  );
}

export function AdminPlatformBadge({ platform }: { platform: PlatformType }) {
  const config = (() => {
    switch (platform) {
      case "X.com":
        return "bg-slate-900 text-white";
      case "LinkedIn":
        return "bg-[#0A66C2] text-white";
      case "Instagram":
        return "bg-gradient-to-r from-purple-600 to-pink-500 text-white";
      default:
        return "bg-slate-100 text-slate-700 border border-slate-200";
    }
  })();

  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide", config)}>
      {platform}
    </span>
  );
}
