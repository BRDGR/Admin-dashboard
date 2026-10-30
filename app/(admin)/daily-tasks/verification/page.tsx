"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, RefreshCw, FileCheck2, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useAdminVerificationQueue } from "@/lib/hooks/useAdminDailyTasks";
import { AdminSubmissionStatusBadge, AdminPlatformBadge } from "../_components/AdminDailyTaskBadges";

export default function AdminVerificationQueuePage() {
  const { queue, isLoading, refetch } = useAdminVerificationQueue();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Submission Verification Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Independently audit partner post URLs, screenshots, wording, and hashtags against frozen task criteria.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          title="Refresh queue"
          className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white bg-slate-50 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Verification Queue Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Submissions Awaiting Compliance Verification</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified submissions protect client attribution and network performance records.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-[#0364FF] border border-blue-200/60 rounded-full">
            {queue.length} submissions in review
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">Partner</th>
                <th className="py-3 px-4">Daily Task</th>
                <th className="py-3 px-4">Platform</th>
                <th className="py-3 px-4">Attempt</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {queue.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">Verification queue is completely clear</p>
                    <p className="text-[11px] mt-0.5">All received partner submissions have been reviewed.</p>
                  </td>
                </tr>
              ) : (
                queue.map(({ submission, task }) => (
                  <tr key={submission.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Partner Name */}
                    <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                          {submission.partnerName.charAt(0)}
                        </div>
                        <span>{submission.partnerName}</span>
                      </div>
                    </td>

                    {/* Task Title */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{task.title}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {task.id} · Criteria Snapshot v{task.publishedVersion || task.version}
                      </div>
                    </td>

                    {/* Platform */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <AdminPlatformBadge platform={task.platform} />
                    </td>

                    {/* Attempt */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-700 font-mono text-[11px]">
                      Attempt {submission.attemptNumber} of {(task.allowedResubmissions || 0) + 1}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <AdminSubmissionStatusBadge status={submission.status} />
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Link
                        href={`/daily-tasks/verification/${submission.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0364FF] hover:bg-[#0251CC] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                      >
                        <span>Audit Proof</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
