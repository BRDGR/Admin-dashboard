"use client";

import React from "react";
import { History, RefreshCw, Shield, User, Bot, Briefcase } from "lucide-react";
import { useAdminAuditLog } from "@/lib/hooks/useAdminDailyTasks";

export default function AdminAuditLogPage() {
  const { auditLog, isLoading, refetch } = useAdminAuditLog();

  const getActorBadge = (actor: string) => {
    switch (actor) {
      case "Reviewer":
        return {
          bg: "bg-blue-50 text-[#0364FF] border-blue-200",
          icon: Shield,
        };
      case "Client":
        return {
          bg: "bg-purple-50 text-purple-700 border-purple-200",
          icon: Briefcase,
        };
      case "Partner":
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: User,
        };
      case "System":
      default:
        return {
          bg: "bg-slate-100 text-slate-700 border-slate-200",
          icon: Bot,
        };
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Daily Tasks Audit Log
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Immutable, append-only chronological log of all task creations, compliance reviews, publications, and verification decisions.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          title="Refresh audit log"
          className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white bg-slate-50 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-bold text-slate-900">Event Trail</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {auditLog.length} recorded events
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Object</th>
                <th className="py-3 px-4">Reason / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 font-sans">
                    Loading audit trail...
                  </td>
                </tr>
              ) : auditLog.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 font-sans">
                    No audit records registered yet.
                  </td>
                </tr>
              ) : (
                auditLog.map((log, idx) => {
                  const actorInfo = getActorBadge(log.actor);
                  const Icon = actorInfo.icon;
                  return (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                      {/* Timestamp */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-500">
                        {log.timestamp}
                      </td>

                      {/* Actor Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-sans font-semibold border text-[11px] ${actorInfo.bg}`}
                        >
                          <Icon className="w-3 h-3" />
                          <span>{log.actor}</span>
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 font-sans font-semibold text-slate-800">
                        {log.action}
                      </td>

                      {/* Target Object */}
                      <td className="py-3 px-4 text-slate-700">
                        {log.targetObject}
                      </td>

                      {/* Reason / Notes */}
                      <td className="py-3 px-4 font-sans text-slate-600">
                        {log.reason ? (
                          <span className="italic text-slate-700">{log.reason}</span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
