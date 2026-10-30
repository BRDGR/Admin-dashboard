"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, RotateCcw, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { useAdminNotifications, useAdminDailyTasks } from "@/lib/hooks/useAdminDailyTasks";

export default function AdminNotificationsPage() {
  const { notifications, isLoading, refetch, retrySend, isRetrying } = useAdminNotifications();
  const { tasks } = useAdminDailyTasks();

  // Group notifications by task
  const grouped = useMemo(() => {
    const map = new Map<string, typeof notifications>();
    notifications.forEach((n) => {
      const existing = map.get(n.taskId) || [];
      existing.push(n);
      map.set(n.taskId, existing);
    });
    return Array.from(map.entries());
  }, [notifications]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Notification Delivery Status
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitor automated email notifications dispatched to partners upon task publication and retry failed deliveries.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          title="Refresh notifications"
          className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white bg-slate-50 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Notifications grouped by Task */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center text-xs text-slate-500">
          Loading notification delivery records...
        </div>
      ) : grouped.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center text-slate-400">
          <Mail className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p className="font-semibold text-slate-700">No active notification dispatches</p>
          <p className="text-xs mt-0.5">Tasks will queue notifications here when published by administrators.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([taskId, notifs]) => {
            const task = tasks.find((t) => t.id === taskId);
            return (
              <div
                key={taskId}
                className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden"
              >
                <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">
                      {task ? task.title : taskId}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {taskId}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {notifs.filter((n) => n.status === "Sent").length} of {notifs.length} delivered
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-white border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                        <th className="py-2.5 px-4">Partner</th>
                        <th className="py-2.5 px-4">Delivery Status</th>
                        <th className="py-2.5 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {notifs.map((notif, nIdx) => {
                        const globalIndex = notifications.indexOf(notif);
                        return (
                          <tr key={nIdx} className="hover:bg-slate-50/50">
                            <td className="py-3 px-4 font-semibold text-slate-800">
                              {notif.partnerName}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                                  notif.status === "Sent"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-rose-50 text-rose-700 border-rose-200"
                                }`}
                              >
                                {notif.status === "Sent" ? (
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <AlertCircle className="w-3 h-3 text-rose-600" />
                                )}
                                <span>{notif.status}</span>
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              {notif.status === "Failed" ? (
                                <button
                                  onClick={() => retrySend(globalIndex)}
                                  disabled={isRetrying}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#0364FF] bg-blue-50 hover:bg-blue-100 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>Retry send</span>
                                </button>
                              ) : (
                                <span className="text-[11px] text-slate-400">Delivered</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Safety Policy Note */}
      <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-500 leading-relaxed">
        <strong>Delivery & Privacy Invariant: </strong>
        Notifications are dispatched strictly 1-to-1 via isolated email channels. Retrying delivery attempts to resend the notification message without duplicating partner assignments or creating duplicate ledger items.
      </div>
    </div>
  );
}
