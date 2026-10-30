"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchAdminTasks,
  fetchAdminKpis,
  fetchTaskById,
  approveTask,
  rejectTask,
  publishApprovedTask,
  fetchVerificationQueue,
  fetchSubmissionDetail,
  verifySubmissionOutcome,
  fetchNotifications,
  retryNotificationSend,
  fetchAuditLog,
} from "@/lib/api/daily-tasks.api";
import type {
  DailyTask,
  TaskSubmission,
  TaskNotification,
  TaskAuditEntry,
  AdminDailyTasksKpis,
} from "@/lib/types/daily-tasks.types";

const QUERY_KEY_ADMIN_TASKS = ["admin_daily_tasks"];
const QUERY_KEY_ADMIN_KPIS = ["admin_daily_tasks_kpis"];
const QUERY_KEY_VERIFY_QUEUE = ["admin_daily_tasks_verify_queue"];
const QUERY_KEY_NOTIFS = ["admin_daily_tasks_notifs"];
const QUERY_KEY_AUDIT = ["admin_daily_tasks_audit"];

export function useAdminDailyTasks() {
  const queryClient = useQueryClient();

  const tasksQuery = useQuery({
    queryKey: QUERY_KEY_ADMIN_TASKS,
    queryFn: fetchAdminTasks,
  });

  const kpisQuery = useQuery({
    queryKey: QUERY_KEY_ADMIN_KPIS,
    queryFn: fetchAdminKpis,
  });

  const approveMutation = useMutation({
    mutationFn: ({ taskId, version }: { taskId: string; version: number }) =>
      approveTask(taskId, version),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_ADMIN_TASKS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_ADMIN_KPIS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_AUDIT });
      toast.success(`Task approved (v${data.version})`, {
        description: "Task is ready for publication and assignment dispatch.",
      });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to approve task");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({
      taskId,
      version,
      reason,
    }: {
      taskId: string;
      version: number;
      reason: string;
    }) => rejectTask(taskId, version, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_ADMIN_TASKS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_ADMIN_KPIS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_AUDIT });
      toast.error("Task rejected", {
        description: "Client has been notified with the rejection notes.",
      });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to reject task");
    },
  });

  const publishMutation = useMutation({
    mutationFn: ({ taskId }: { taskId: string }) => publishApprovedTask(taskId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_ADMIN_TASKS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_ADMIN_KPIS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_NOTIFS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_AUDIT });
      toast.success(`Task published (Criteria snapshot: v${data.publishedVersion})`, {
        description: `Created ${data.assignedPartnerIds.length} assignments and queued email notifications.`,
      });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to publish task");
    },
  });

  return {
    tasks: tasksQuery.data ?? [],
    isLoadingTasks: tasksQuery.isLoading,
    refetchTasks: tasksQuery.refetch,

    kpis: kpisQuery.data ?? ({
      pendingApprovalCount: 0,
      approvedNotPublishedCount: 0,
      submissionsToVerifyCount: 0,
      pastDeadlineUnverifiedCount: 0,
    } as AdminDailyTasksKpis),
    isLoadingKpis: kpisQuery.isLoading,

    approveTask: approveMutation.mutateAsync,
    isApproving: approveMutation.isPending,

    rejectTask: rejectMutation.mutateAsync,
    isRejecting: rejectMutation.isPending,

    publishTask: publishMutation.mutateAsync,
    isPublishing: publishMutation.isPending,
  };
}

export function useAdminTaskDetail(taskId: string) {
  const taskQuery = useQuery({
    queryKey: ["admin_daily_task_detail", taskId],
    queryFn: () => fetchTaskById(taskId),
    enabled: Boolean(taskId),
  });

  return {
    task: taskQuery.data ?? null,
    isLoading: taskQuery.isLoading,
    refetch: taskQuery.refetch,
  };
}

export function useAdminVerificationQueue() {
  const queryClient = useQueryClient();

  const queueQuery = useQuery({
    queryKey: QUERY_KEY_VERIFY_QUEUE,
    queryFn: fetchVerificationQueue,
  });

  const verifyMutation = useMutation({
    mutationFn: ({
      submissionId,
      outcome,
      notes,
      isException,
    }: {
      submissionId: string;
      outcome: "Verified" | "Changes Required" | "Failed Verification";
      notes?: string;
      isException?: boolean;
    }) => verifySubmissionOutcome(submissionId, outcome, notes, isException),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_VERIFY_QUEUE });
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_ADMIN_KPIS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_AUDIT });
      toast.success(`Recorded decision: ${data.status}`);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to record decision");
    },
  });

  return {
    queue: queueQuery.data ?? [],
    isLoading: queueQuery.isLoading,
    refetch: queueQuery.refetch,

    verifySubmission: verifyMutation.mutateAsync,
    isVerifying: verifyMutation.isPending,
  };
}

export function useAdminSubmissionDetail(submissionId: string) {
  const query = useQuery({
    queryKey: ["admin_submission_detail", submissionId],
    queryFn: () => fetchSubmissionDetail(submissionId),
    enabled: Boolean(submissionId),
  });

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

export function useAdminNotifications() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEY_NOTIFS,
    queryFn: fetchNotifications,
  });

  const retryMutation = useMutation({
    mutationFn: (index: number) => retryNotificationSend(index),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_NOTIFS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_AUDIT });
      toast.success("Notification retried and dispatched successfully.");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to retry send");
    },
  });

  return {
    notifications: query.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
    retrySend: retryMutation.mutateAsync,
    isRetrying: retryMutation.isPending,
  };
}

export function useAdminAuditLog() {
  const query = useQuery({
    queryKey: QUERY_KEY_AUDIT,
    queryFn: fetchAuditLog,
  });

  return {
    auditLog: query.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
