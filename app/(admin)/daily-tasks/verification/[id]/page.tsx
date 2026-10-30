"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ShieldCheck,
  FileCheck2,
  Info,
} from "lucide-react";
import { useAdminSubmissionDetail, useAdminVerificationQueue } from "@/lib/hooks/useAdminDailyTasks";
import { AdminSubmissionStatusBadge, AdminPlatformBadge } from "../../_components/AdminDailyTaskBadges";

const VERIFICATION_CHECKLIST = [
  "URL is valid and opens the relevant public post",
  "Post belongs to the assigned partner or designated authentic handle",
  "Required wording is present, unaltered, and properly styled",
  "Hashtags, mentions, links and formatting criteria are accurate",
  "Visibility and accessibility match task requirements (publicly reachable)",
  "Publication timing and date meet the campaign schedule",
  "Evidence screenshot is present and matches the submitted live URL",
];

export default function AdminSubmissionReviewPage() {
  const params = useParams();
  const router = useRouter();
  const submissionId = (params?.id as string) || "";

  const { data, isLoading, refetch } = useAdminSubmissionDetail(submissionId);
  const { verifySubmission, isVerifying } = useAdminVerificationQueue();

  const [checkedList, setCheckedList] = useState<boolean[]>(
    new Array(VERIFICATION_CHECKLIST.length).fill(false)
  );
  const [reviewerNotes, setReviewerNotes] = useState("");

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center text-xs text-slate-500">
        Loading submission audit details...
      </div>
    );
  }

  if (!data || !data.submission) {
    return (
      <div className="max-w-md mx-auto py-16 text-center bg-white rounded-xl border border-slate-200 p-8">
        <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-slate-900">Submission Not Found</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          The requested partner submission could not be found in the verification queue.
        </p>
        <Link
          href="/daily-tasks/verification"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0364FF] text-white rounded-lg text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Verification Queue</span>
        </Link>
      </div>
    );
  }

  const { submission, task } = data;
  const maxAttempts = (task?.allowedResubmissions || 0) + 1;
  const allChecked = checkedList.every(Boolean);

  const handleToggleCheck = (index: number) => {
    setCheckedList((prev) => {
      const copy = [...prev];
      copy[index] = !copy[index];
      return copy;
    });
  };

  const handleDecision = async (
    outcome: "Verified" | "Changes Required" | "Failed Verification",
    isException = false
  ) => {
    if (outcome === "Verified" && !allChecked) return;
    if (outcome !== "Verified" && !reviewerNotes.trim()) return;

    try {
      await verifySubmission({
        submissionId: submission.id,
        outcome,
        notes: reviewerNotes.trim(),
        isException,
      });
      router.push("/daily-tasks/verification");
    } catch {
      // error handled by toast in hook
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div>
        <Link
          href="/daily-tasks/verification"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Verification Queue</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                {submission.partnerName} · {task?.title}
              </h1>
              <AdminSubmissionStatusBadge status={submission.status} />
              {task && <AdminPlatformBadge platform={task.platform} />}
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Task ID: {task?.id} · Criteria Snapshot: v{task?.publishedVersion || 1}
            </div>
          </div>
        </div>
      </div>

      {/* Snapshot Invariant Notice */}
      <div className="bg-blue-50 border border-blue-200/80 rounded-xl p-4 flex items-start gap-3 text-xs text-blue-900">
        <Info className="w-4 h-4 text-[#0364FF] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold text-[#0364FF]">Frozen Criteria Invariant: </span>
          Verify strictly against approved criteria snapshot <strong>v{task?.publishedVersion || 1}</strong>.
          Even if the client requested an in-flight criteria amendment, active submissions are audited against the published version.
          This verification outcome certifies proof-of-work only and does not automatically authorize financial disbursements.
        </div>
      </div>

      {/* Submission Audit Summary Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-[11px] text-slate-400">
          Proof-of-Work Verification Summary
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px] font-semibold">Approved Criteria</span>
            <div className="mt-1 p-2.5 bg-slate-50 border border-slate-100 rounded-lg space-y-1">
              {task?.requirements.wording && (
                <div>
                  <strong className="text-slate-600">Copy: </strong>
                  <span>{task.requirements.wording}</span>
                </div>
              )}
              {task?.requirements.hashtags && (
                <div>
                  <strong className="text-slate-600">Tags: </strong>
                  <span className="font-mono text-[#0364FF]">{task.requirements.hashtags}</span>
                </div>
              )}
              {task?.requirements.requiredLink && (
                <div>
                  <strong className="text-slate-600">Link: </strong>
                  <span className="font-mono text-[#0364FF]">{task.requirements.requiredLink}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px] font-semibold">Submitted Post URL</span>
            <div className="mt-1 p-2.5 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-slate-800 truncate">
                {submission.postUrl || "No URL submitted"}
              </span>
              {submission.postUrl && (
                <a
                  href={submission.postUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 hover:bg-slate-200 rounded text-[#0364FF] shrink-0"
                  title="Open live URL"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[11px] font-semibold">Attached Evidence</span>
                <span className="font-medium text-slate-700">
                  {submission.evidenceName || "None attached"}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[11px] font-semibold">Attempt Counter</span>
                <span className="font-mono font-bold text-slate-800">
                  Attempt {submission.attemptNumber} of {maxAttempts}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 7-Point Verification Checklist */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-5">
        <div>
          <h2 className="text-sm font-bold text-slate-900">7-Point Verification Checklist</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Every acceptance criterion must be ticked before marking verified.
          </p>
        </div>

        <div className="space-y-2">
          {VERIFICATION_CHECKLIST.map((check, idx) => (
            <label
              key={idx}
              className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 rounded-xl cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={checkedList[idx]}
                onChange={() => handleToggleCheck(idx)}
                className="rounded text-[#0364FF] focus:ring-[#0364FF] w-4 h-4 cursor-pointer"
              />
              <span className="text-xs font-semibold text-slate-800">{check}</span>
            </label>
          ))}
        </div>

        {/* Reviewer Feedback Notes */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-700">
            Reviewer Feedback Notes (Mandatory for corrections or failure)
          </label>
          <textarea
            rows={3}
            placeholder="e.g. Required hashtag #AcmeLaunch is missing. Post must be edited or recreated."
            value={reviewerNotes}
            onChange={(e) => setReviewerNotes(e.target.value)}
            className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0364FF]/20 focus:border-[#0364FF]"
          />
        </div>

        {/* Verification Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleDecision("Changes Required", false)}
              disabled={!reviewerNotes.trim() || isVerifying || submission.attemptNumber >= maxAttempts}
              className="px-3.5 py-2 border border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40 cursor-pointer"
            >
              Request Correction
            </button>

            <button
              onClick={() => handleDecision("Changes Required", true)}
              disabled={isVerifying}
              className="px-3.5 py-2 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40 cursor-pointer"
            >
              Post Unavailable: Request Evidence
            </button>

            <button
              onClick={() => handleDecision("Failed Verification", false)}
              disabled={!reviewerNotes.trim() || isVerifying}
              className="px-3.5 py-2 border border-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40 cursor-pointer"
            >
              Fail Verification
            </button>
          </div>

          <button
            onClick={() => handleDecision("Verified", false)}
            disabled={!allChecked || isVerifying}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors disabled:opacity-40 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Mark Verified</span>
          </button>
        </div>

        <p className="text-[11px] text-slate-400 italic pt-1 text-center sm:text-left">
          Deleted, private or edited posts are never automatically approved or failed without reviewer confirmation.
        </p>
      </div>
    </div>
  );
}
