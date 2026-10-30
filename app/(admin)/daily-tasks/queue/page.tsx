"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { ArrowRight, RefreshCw, CheckCircle2, Clock } from "lucide-react";
import { useAdminDailyTasks } from "@/lib/hooks/useAdminDailyTasks";
import { AdminDailyTasksKpis } from "../_components/AdminDailyTasksKpis";
import { AdminDailyTaskStatusBadge, AdminPlatformBadge } from "../_components/AdminDailyTaskBadges";
import type { DailyTask } from "@/lib/types/daily-tasks.types";

export default function AdminDailyTasksQueuePage() {
  const { tasks, isLoadingTasks, refetchTasks, kpis, isLoadingKpis } = useAdminDailyTasks();

  // Filter tasks that need review or ready for publication (Pending Approval or Approved)
  const queueTasks = useMemo(() => {
    return tasks.filter((t) => t.status === "Pending Approval" || t.status === "Approved");
  }, [tasks]);

  const allOtherTasks = useMemo(() => {
    return tasks.filter((t) => t.status !== "Pending Approval" && t.status !== "Approved");
  }, [tasks]);

  const formatDeadline = (task: DailyTask) => {
    if (!task.deadline) return "—";
    try {
      const dt = new Date(task.deadline);
      return `${dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}, ${dt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} ${task.timezone}`;
    } catch {
      return `${task.deadline} ${task.timezone}`;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Task Approval Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review compliance, platform feasibility, and assignees before client daily tasks are published.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetchTasks()}
            title="Refresh queue"
            className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white bg-slate-50 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <AdminDailyTasksKpis kpis={kpis} isLoading={isLoadingKpis} />

      {/* Queue Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Tasks Awaiting Admin Review</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Tasks in "Pending Approval" or "Approved" requiring reviewer decision or snapshot publication.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200/60 rounded-full">
            {queueTasks.length} in queue
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">Task & Version</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Platform</th>
                <th className="py-3 px-4">Assigned Partners</th>
                <th className="py-3 px-4">Deadline</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {queueTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">Approval queue is clear</p>
                    <p className="text-[11px] mt-0.5">No client tasks currently pending compliance review.</p>
                  </td>
                </tr>
              ) : (
                queueTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{task.title}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {task.id} · v{task.version}
                        {task.publishedVersion && (
                          <span className="text-emerald-600 font-sans ml-1">
                            (Active snapshot: v{task.publishedVersion})
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-medium text-slate-800">{task.clientName}</span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <AdminPlatformBadge platform={task.platform} />
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-700 font-medium">
                      {task.assignedPartnerIds.length} partners
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                      {formatDeadline(task)}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <AdminDailyTaskStatusBadge status={task.status} />
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Link
                        href={`/daily-tasks/queue/${task.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0364FF] hover:bg-[#0251CC] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                      >
                        <span>Review</span>
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

      {/* Historical Tasks (Published, Completed, Cancelled) */}
      {allOtherTasks.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider text-[11px]">
              Active & Closed Platform Tasks
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                  <th className="py-2.5 px-4">Task</th>
                  <th className="py-2.5 px-4">Client</th>
                  <th className="py-2.5 px-4">Platform</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allOtherTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-4 font-medium text-slate-800">
                      {task.title} <span className="font-mono text-slate-400 text-[11px]">({task.id})</span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">{task.clientName}</td>
                    <td className="py-2.5 px-4">
                      <AdminPlatformBadge platform={task.platform} />
                    </td>
                    <td className="py-2.5 px-4">
                      <AdminDailyTaskStatusBadge status={task.status} />
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <Link
                        href={`/daily-tasks/queue/${task.id}`}
                        className="text-xs font-semibold text-slate-600 hover:text-[#0364FF]"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
