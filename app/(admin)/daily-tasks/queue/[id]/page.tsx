"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  Mail,
  ShieldCheck,
  RotateCcw,
  Info,
  Lock,
} from "lucide-react";
import { useAdminTaskDetail, useAdminDailyTasks, useAdminNotifications } from "@/lib/hooks/useAdminDailyTasks";
import { AdminDailyTaskStatusBadge, AdminPlatformBadge } from "../../_components/AdminDailyTaskBadges";
import { PARTNERS_MAP } from "@/lib/api/daily-tasks.api";

const REVIEW_CHECKLIST = [
  "Instructions are clear and actionable",
  "Feasible for designated platform and stated deadline",
  "Deadline and time zone are reasonable for partner capacity",
  "Wording, hashtags, mentions and links are concrete and measurable",
  "Evidence rules are sufficient for independent verification",
  "Assigned partners are vetted and actively approved (revalidated now)",
  "Complies with BRDGR content & fintech regulatory policy",
];

export default function AdminTaskReviewPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = (params?.id as string) || "";

  const { task, isLoading, refetch } = useAdminTaskDetail(taskId);
  const { approveTask, isApproving, rejectTask, isRejecting, publishTask, isPublishing } = useAdminDailyTasks();
  const { notifications, retrySend, isRetrying } = useAdminNotifications();

  // Review states
  const [checkedItems, setCheckedItems] = useState<boolean[]>(new Array(REVIEW_CHECKLIST.length).fill(false));
  const [rejectionReason, setRejectionReason] = useState("");

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center text-xs text-slate-500">
        Loading task review data...
      </div>
    );
  }

  if (!task) {
    return (
      <div className="max-w-md mx-auto py-16 text-center bg-white rounded-xl border border-slate-200 p-8">
        <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-slate-900">Task Not Found</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          The requested task could not be located in the system.
        </p>
        <Link
          href="/daily-tasks/queue"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0364FF] text-white rounded-lg text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Queue</span>
        </Link>
      </div>
    );
  }

  const allChecked = checkedItems.every(Boolean);

  const handleToggleCheck = (index: number) => {
    setCheckedItems((prev) => {
      const copy = [...prev];
      copy[index] = !copy[index];
      return copy;
    });
  };

  const handleApprove = async () => {
    if (!allChecked) return;
    try {
      await approveTask({ taskId: task.id, version: task.version });
      refetch();
    } catch {
      // error handled by hook toast
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;
    try {
      await rejectTask({ taskId: task.id, version: task.version, reason: rejectionReason });
      refetch();
    } catch {
      // error handled by hook toast
    }
  };

  const handlePublish = async () => {
    try {
      await publishTask({ taskId: task.id });
      refetch();
    } catch {
      // error handled by hook toast
    }
  };

  const taskNotifications = notifications.filter((n) => n.taskId === task.id);

  const formatDeadline = (dl: string, tz: string) => {
    if (!dl) return "—";
    try {
      const dt = new Date(dl);
      return `${dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}, ${dt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} ${tz}`;
    } catch {
      return `${dl} ${tz}`;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div>
        <Link
          href="/daily-tasks/queue"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Queue</span>
        </Link>
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                {task.title}
              </h1>
              <AdminDailyTaskStatusBadge status={task.status} />
              <AdminPlatformBadge platform={task.platform} />
            </div>
            <div className="text-xs text-slate-400 font-mono">
              {task.id} · v{task.version}
              {task.publishedVersion && (
                <span className="text-emerald-600 font-sans ml-1">
                  (Published Snapshot: v{task.publishedVersion})
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Task Information & Criteria Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-[11px] text-slate-400">
          Task Parameters
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px] font-semibold">Client Organization</span>
            <span className="font-semibold text-slate-800">{task.clientName}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px] font-semibold">Platform & Deadline</span>
            <span className="font-semibold text-slate-800">
              {task.platform} · {formatDeadline(task.deadline, task.timezone)}
            </span>
          </div>

          <div className="sm:col-span-2">
            <span className="text-slate-400 block text-[11px] font-semibold mb-1">Client Instructions</span>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-slate-800 leading-relaxed">
              {task.instructions}
            </div>
          </div>

          <div className="sm:col-span-2">
            <span className="text-slate-400 block text-[11px] font-semibold mb-1">
              Measurable Verification Criteria
            </span>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-1">
              {task.requirements.wording && (
                <div>
                  <strong className="text-slate-600">Required Copy: </strong>
                  <span className="text-slate-800">{task.requirements.wording}</span>
                </div>
              )}
              {task.requirements.hashtags && (
                <div>
                  <strong className="text-slate-600">Hashtags / Mentions: </strong>
                  <span className="font-mono text-[#0364FF]">{task.requirements.hashtags}</span>
                </div>
              )}
              {task.requirements.requiredLink && (
                <div>
                  <strong className="text-slate-600">Link: </strong>
                  <span className="text-[#0364FF] font-mono">{task.requirements.requiredLink}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px] font-semibold">Evidence Required</span>
            <span className="font-medium text-slate-800">{task.evidenceType}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px] font-semibold">Correction Policy</span>
            <span className="font-medium text-slate-800">
              {task.allowedResubmissions > 0
                ? `Allowed, up to ${task.allowedResubmissions} retry attempts`
                : "Not allowed"}
            </span>
          </div>

          <div className="sm:col-span-2 pt-2 border-t border-slate-100">
            <span className="text-slate-400 block text-[11px] font-semibold mb-1">
              Selected Assigned Partners ({task.assignedPartnerIds.length})
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {task.assignedPartnerIds.map((pId) => (
                <span
                  key={pId}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{PARTNERS_MAP[pId] || pId}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Review Actions Based on Status */}
      {task.status === "Pending Approval" && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-5">
          <div>
            <h2 className="text-sm font-bold text-slate-900">BRDGR Compliance Review Checklist</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verify all quality and policy invariants before approving this task.
            </p>
          </div>

          <div className="space-y-2.5">
            {REVIEW_CHECKLIST.map((item, idx) => (
              <label
                key={idx}
                className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 rounded-xl cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={checkedItems[idx]}
                  onChange={() => handleToggleCheck(idx)}
                  className="rounded text-[#0364FF] focus:ring-[#0364FF] w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-semibold text-slate-800">{item}</span>
              </label>
            ))}
          </div>

          {/* Rejection Form */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <label className="text-xs font-bold text-slate-700">
              Rejection Reason (Required only if rejecting task)
            </label>
            <textarea
              rows={2}
              placeholder="Explain the specific compliance or feasibility reason to the client..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleReject}
              disabled={!rejectionReason.trim() || isRejecting}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40 cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
              <span>{isRejecting ? "Rejecting..." : "Reject Task"}</span>
            </button>

            <button
              onClick={handleApprove}
              disabled={!allChecked || isApproving}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#0364FF] hover:bg-[#0251CC] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors disabled:opacity-40 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isApproving ? "Approving..." : `Approve v${task.version}`}</span>
            </button>
          </div>
        </div>
      )}

      {/* Decoupled Publication Action */}
      {task.status === "Approved" && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-5">
          <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 leading-relaxed">
            <span className="font-bold">Approval is not publication: </span>
            Publishing will freeze approved <strong>v{task.version}</strong> into an immutable snapshot, create{" "}
            <strong>{task.assignedPartnerIds.length}</strong> individual partner assignments, and queue email notifications.
            Recipients remain strictly isolated and hidden from each other and from the client.
          </div>

          {/* Email Preview */}
          <div className="border border-dashed border-slate-300 bg-slate-50/60 rounded-xl p-4 space-y-2 text-xs">
            <div className="font-bold text-slate-700 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-slate-500" />
              <span>Email Preview (1-to-1 dispatch to each assigned partner)</span>
            </div>
            <div className="text-slate-600 font-mono text-[11px] pt-1 border-t border-slate-200">
              <strong>Subject: </strong>New daily task: {task.title}
            </div>
            <div className="text-slate-600 text-[11px]">
              {task.clientName} · due {formatDeadline(task.deadline, task.timezone)}
            </div>
            <div className="text-slate-700 italic text-[11px] bg-white p-2.5 rounded border border-slate-200/60">
              "{task.instructions}"
            </div>
            <div className="text-[11px] text-[#0364FF] font-semibold">
              <u>Sign in to view task</u>{" "}
              <span className="text-slate-400 font-normal">
                (Link opens authenticated portal; never grants access by itself)
              </span>
            </div>
          </div>

          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isPublishing ? "Publishing..." : `Publish Approved v${task.version}`}</span>
          </button>
        </div>
      )}

      {/* Published Notification Delivery Monitor */}
      {task.status === "Published" && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Partner Notification Delivery Status</h3>
            <span className="text-xs text-slate-400">Recipients isolated</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                  <th className="py-2.5 px-4">Partner</th>
                  <th className="py-2.5 px-4">Delivery</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {taskNotifications.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-slate-400">
                      No notifications recorded for this task.
                    </td>
                  </tr>
                ) : (
                  taskNotifications.map((notif, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-semibold text-slate-800">{notif.partnerName}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                            notif.status === "Sent"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {notif.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {notif.status === "Failed" ? (
                          <button
                            onClick={() => retrySend(idx)}
                            disabled={isRetrying}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#0364FF] bg-blue-50 hover:bg-blue-100 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Retry Send</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">Delivered</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400">
            Retrying delivery sends the notification email without duplicating partner assignments.
          </div>
        </div>
      )}

      {/* Rejected Notice */}
      {task.status === "Rejected" && task.rejectionReason && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-900 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-rose-800">
            <XCircle className="w-4 h-4" />
            <span>Task Rejected by Reviewer</span>
          </div>
          <p>{task.rejectionReason}</p>
        </div>
      )}
    </div>
  );
}
