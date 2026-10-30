// ─────────────────────────────────────────────
// BRDGR Admin — Daily Tasks API Service
// Provides synchronized browser persistence & audit logging
// ─────────────────────────────────────────────

import type {
  DailyTask,
  TaskSubmission,
  TaskNotification,
  TaskAuditEntry,
  AdminDailyTasksKpis,
} from "@/lib/types/daily-tasks.types";

const STORAGE_KEY_TASKS = "brdgr_daily_tasks_v1";
const STORAGE_KEY_SUBMISSIONS = "brdgr_daily_submissions_v1";
const STORAGE_KEY_NOTIFICATIONS = "brdgr_daily_notifications_v1";
const STORAGE_KEY_AUDIT = "brdgr_daily_audit_v1";

export const PARTNERS_MAP: Record<string, string> = {
  p1: "Alex Carter",
  p2: "Jamie Lee",
  p3: "Taylor Kim",
  p4: "Morgan Davis",
  p5: "Casey Brown",
};

const INITIAL_TASKS: DailyTask[] = [
  {
    id: "T-1042",
    title: "X.com product announcement",
    clientId: "c1",
    clientName: "Acme Brands",
    platform: "X.com",
    status: "Published",
    version: 1,
    publishedVersion: 1,
    deadline: "2026-11-02T18:00",
    timezone: "WAT",
    instructions: "Post the approved announcement from your own account. Tag @AcmeBrands and include the launch link.",
    requirements: {
      wording: "Mention @AcmeBrands",
      hashtags: "#AcmeLaunch",
      requiredLink: "https://acme.example/launch",
    },
    evidenceType: "URL + screenshot",
    allowedResubmissions: 2,
    assignedPartnerIds: ["p1", "p2", "p3"],
    createdAt: "2026-10-27T09:12:00Z",
    updatedAt: "2026-10-27T11:45:00Z",
  },
  {
    id: "T-1043",
    title: "Share product feedback",
    clientId: "c1",
    clientName: "Acme Brands",
    platform: "LinkedIn",
    status: "Pending Approval",
    version: 1,
    deadline: "2026-11-05T17:00",
    timezone: "WAT",
    instructions: "Share a short, authentic review of our newly released institutional liquidity gateway.",
    requirements: {
      hashtags: "#AcmeFeedback",
      requiredLink: "https://acme.example/survey",
    },
    evidenceType: "URL only",
    allowedResubmissions: 1,
    assignedPartnerIds: ["p2", "p4"],
    createdAt: "2026-10-28T14:30:00Z",
    updatedAt: "2026-10-28T14:30:00Z",
  },
  {
    id: "T-1044",
    title: "Weekly update thread",
    clientId: "c1",
    clientName: "Acme Brands",
    platform: "X.com",
    status: "Draft",
    version: 1,
    deadline: "2026-11-08T12:00",
    timezone: "WAT",
    instructions: "Weekly roundup highlights summarizing spreads and weekend trading sessions.",
    requirements: {
      hashtags: "#WeeklyRecap",
    },
    evidenceType: "URL only",
    allowedResubmissions: 0,
    assignedPartnerIds: [],
    createdAt: "2026-10-29T10:00:00Z",
    updatedAt: "2026-10-29T10:00:00Z",
  },
  {
    id: "T-1045",
    title: "Comment on industry update",
    clientId: "c1",
    clientName: "Acme Brands",
    platform: "X.com",
    status: "Published",
    version: 1,
    publishedVersion: 1,
    deadline: "2026-11-04T12:00",
    timezone: "WAT",
    instructions: "Reply to the pinned post with an informed comment referencing the new prop trading rules.",
    requirements: {
      hashtags: "#AcmeLaunch",
    },
    evidenceType: "URL only",
    allowedResubmissions: 2,
    assignedPartnerIds: ["p1", "p5"],
    createdAt: "2026-10-28T09:00:00Z",
    updatedAt: "2026-10-28T12:00:00Z",
  },
];

const INITIAL_SUBMISSIONS: TaskSubmission[] = [
  {
    id: "sub-1",
    taskId: "T-1042",
    partnerId: "p1",
    partnerName: "Alex Carter",
    status: "Pending",
    attemptNumber: 0,
  },
  {
    id: "sub-2",
    taskId: "T-1042",
    partnerId: "p2",
    partnerName: "Jamie Lee",
    status: "Submitted",
    attemptNumber: 1,
    postUrl: "https://x.com/jamielee/status/1800000000000000001",
    evidenceName: "jamie-shot.png",
    submittedAt: "2026-10-29T15:20:00Z",
  },
  {
    id: "sub-3",
    taskId: "T-1042",
    partnerId: "p3",
    partnerName: "Taylor Kim",
    status: "Verified",
    attemptNumber: 1,
    postUrl: "https://x.com/taylork/status/1800000000000000002",
    evidenceName: "taylor-shot.png",
    reviewerNotes: "All criteria met.",
    submittedAt: "2026-10-29T11:10:00Z",
    verifiedAt: "2026-10-29T16:00:00Z",
  },
  {
    id: "sub-4",
    taskId: "T-1045",
    partnerId: "p1",
    partnerName: "Alex Carter",
    status: "Changes Required",
    attemptNumber: 1,
    postUrl: "https://x.com/alexc/status/1800000000000000003",
    reviewerNotes: "Required hashtag #AcmeLaunch is missing. Edit or repost and resubmit.",
    submittedAt: "2026-10-29T13:45:00Z",
  },
  {
    id: "sub-5",
    taskId: "T-1045",
    partnerId: "p5",
    partnerName: "Casey Brown",
    status: "Pending",
    attemptNumber: 0,
  },
];

const INITIAL_NOTIFICATIONS: TaskNotification[] = [
  { taskId: "T-1042", partnerId: "p1", partnerName: "Alex Carter", status: "Sent" },
  { taskId: "T-1042", partnerId: "p2", partnerName: "Jamie Lee", status: "Sent" },
  { taskId: "T-1042", partnerId: "p3", partnerName: "Taylor Kim", status: "Sent" },
  { taskId: "T-1045", partnerId: "p1", partnerName: "Alex Carter", status: "Sent" },
  { taskId: "T-1045", partnerId: "p5", partnerName: "Casey Brown", status: "Failed" }, // simulated failure for demo
];

const INITIAL_AUDIT: TaskAuditEntry[] = [
  {
    timestamp: "27/10/2026, 09:12",
    actor: "Client",
    action: "Submitted for approval",
    targetObject: "T-1042",
    reason: "",
  },
  {
    timestamp: "27/10/2026, 11:40",
    actor: "Reviewer",
    action: "Approved v1",
    targetObject: "T-1042",
    reason: "",
  },
  {
    timestamp: "27/10/2026, 11:45",
    actor: "System",
    action: "Published v1, 3 assignments, 3 emails queued",
    targetObject: "T-1042",
    reason: "",
  },
];

// Helper storage functions
function getStoredTasks(): DailyTask[] {
  if (typeof window === "undefined") return INITIAL_TASKS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TASKS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(INITIAL_TASKS));
      return INITIAL_TASKS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_TASKS;
  }
}

function saveStoredTasks(tasks: DailyTask[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
  } catch (err) {
    console.error("Failed to save tasks", err);
  }
}

function getStoredSubmissions(): TaskSubmission[] {
  if (typeof window === "undefined") return INITIAL_SUBMISSIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SUBMISSIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(INITIAL_SUBMISSIONS));
      return INITIAL_SUBMISSIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SUBMISSIONS;
  }
}

function saveStoredSubmissions(subs: TaskSubmission[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(subs));
  } catch (err) {
    console.error("Failed to save submissions", err);
  }
}

function getStoredNotifications(): TaskNotification[] {
  if (typeof window === "undefined") return INITIAL_NOTIFICATIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
}

function saveStoredNotifications(notifs: TaskNotification[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notifs));
  } catch (err) {
    console.error("Failed to save notifications", err);
  }
}

function getStoredAudit(): TaskAuditEntry[] {
  if (typeof window === "undefined") return INITIAL_AUDIT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUDIT);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(INITIAL_AUDIT));
      return INITIAL_AUDIT;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_AUDIT;
  }
}

function appendAudit(entry: Omit<TaskAuditEntry, "timestamp">): void {
  if (typeof window === "undefined") return;
  try {
    const audit = getStoredAudit();
    const newEntry: TaskAuditEntry = {
      ...entry,
      timestamp: new Date().toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify([newEntry, ...audit]));
  } catch (err) {
    console.error("Failed to append audit log", err);
  }
}

// ─────────────────────────────────────────────
// Admin API Methods
// ─────────────────────────────────────────────

export async function fetchAdminTasks(): Promise<DailyTask[]> {
  await new Promise((r) => setTimeout(r, 60));
  return getStoredTasks();
}

export async function fetchAdminKpis(): Promise<AdminDailyTasksKpis> {
  const tasks = getStoredTasks();
  const subs = getStoredSubmissions();

  const pendingApproval = tasks.filter((t) => t.status === "Pending Approval").length;
  const approvedNotPublished = tasks.filter((t) => t.status === "Approved").length;
  const submissionsToVerify = subs.filter(
    (s) => s.status === "Submitted" || s.status === "Under Verification"
  ).length;

  const nowIso = new Date().toISOString();
  const pastDeadlineUnverified = subs.filter((s) => {
    if (s.status !== "Submitted" && s.status !== "Under Verification") return false;
    const task = tasks.find((t) => t.id === s.taskId);
    return task && task.deadline && task.deadline < nowIso;
  }).length;

  return {
    pendingApprovalCount: pendingApproval,
    approvedNotPublishedCount: approvedNotPublished,
    submissionsToVerifyCount: submissionsToVerify,
    pastDeadlineUnverifiedCount: pastDeadlineUnverified,
  };
}

export async function fetchTaskById(taskId: string): Promise<DailyTask | null> {
  await new Promise((r) => setTimeout(r, 40));
  const tasks = getStoredTasks();
  return tasks.find((t) => t.id === taskId) || null;
}

export async function approveTask(taskId: string, version: number): Promise<DailyTask> {
  await new Promise((r) => setTimeout(r, 100));
  const tasks = getStoredTasks();
  const taskIndex = tasks.findIndex((t) => t.id === taskId);
  if (taskIndex === -1) throw new Error("Task not found");

  const updated: DailyTask = {
    ...tasks[taskIndex],
    status: "Approved",
    updatedAt: new Date().toISOString(),
  };

  tasks[taskIndex] = updated;
  saveStoredTasks(tasks);
  appendAudit({
    actor: "Reviewer",
    action: `Approved v${version}`,
    targetObject: taskId,
  });

  return updated;
}

export async function rejectTask(taskId: string, version: number, reason: string): Promise<DailyTask> {
  await new Promise((r) => setTimeout(r, 100));
  if (!reason.trim()) throw new Error("A rejection reason is required.");

  const tasks = getStoredTasks();
  const taskIndex = tasks.findIndex((t) => t.id === taskId);
  if (taskIndex === -1) throw new Error("Task not found");

  const updated: DailyTask = {
    ...tasks[taskIndex],
    status: "Rejected",
    rejectionReason: reason.trim(),
    updatedAt: new Date().toISOString(),
  };

  tasks[taskIndex] = updated;
  saveStoredTasks(tasks);
  appendAudit({
    actor: "Reviewer",
    action: `Rejected v${version}`,
    targetObject: taskId,
    reason: reason.trim(),
  });

  return updated;
}

export async function publishApprovedTask(taskId: string): Promise<DailyTask> {
  await new Promise((r) => setTimeout(r, 150));
  const tasks = getStoredTasks();
  const taskIndex = tasks.findIndex((t) => t.id === taskId);
  if (taskIndex === -1) throw new Error("Task not found");

  const task = tasks[taskIndex];
  const updated: DailyTask = {
    ...task,
    status: "Published",
    publishedVersion: task.version,
    updatedAt: new Date().toISOString(),
  };

  tasks[taskIndex] = updated;
  saveStoredTasks(tasks);

  // Initialize partner submissions and queue notifications
  const subs = getStoredSubmissions();
  const notifs = getStoredNotifications();

  task.assignedPartnerIds.forEach((pId, idx) => {
    if (!subs.some((s) => s.taskId === taskId && s.partnerId === pId)) {
      subs.push({
        id: `sub-${Date.now()}-${idx}`,
        taskId,
        partnerId: pId,
        partnerName: PARTNERS_MAP[pId] || `Partner ${pId}`,
        status: "Pending",
        attemptNumber: 0,
      });
    }

    notifs.push({
      taskId,
      partnerId: pId,
      partnerName: PARTNERS_MAP[pId] || `Partner ${pId}`,
      status: idx % 2 === 1 ? "Failed" : "Sent", // simulated delivery
      sentAt: new Date().toISOString(),
    });
  });

  saveStoredSubmissions(subs);
  saveStoredNotifications(notifs);

  appendAudit({
    actor: "System",
    action: `Published v${task.version}: ${task.assignedPartnerIds.length} assignments, ${task.assignedPartnerIds.length} emails queued`,
    targetObject: taskId,
  });

  return updated;
}

export async function fetchVerificationQueue(): Promise<{ submission: TaskSubmission; task: DailyTask }[]> {
  await new Promise((r) => setTimeout(r, 60));
  const tasks = getStoredTasks();
  const subs = getStoredSubmissions();

  const queuedSubs = subs.filter(
    (s) => s.status === "Submitted" || s.status === "Under Verification"
  );

  return queuedSubs.map((s) => ({
    submission: s,
    task: tasks.find((t) => t.id === s.taskId) || {
      id: s.taskId,
      title: "Unknown Task",
      platform: "X.com",
      status: "Published",
      version: 1,
      deadline: "",
      timezone: "WAT",
      instructions: "",
      requirements: {},
      evidenceType: "URL only",
      allowedResubmissions: 0,
      assignedPartnerIds: [],
      clientId: "",
      clientName: "",
      createdAt: "",
      updatedAt: "",
    },
  }));
}

export async function fetchSubmissionDetail(submissionId: string) {
  await new Promise((r) => setTimeout(r, 40));
  const subs = getStoredSubmissions();
  const tasks = getStoredTasks();

  const sub = subs.find((s) => s.id === submissionId);
  if (!sub) return null;

  const task = tasks.find((t) => t.id === sub.taskId);
  return { submission: sub, task: task || null };
}

export async function verifySubmissionOutcome(
  submissionId: string,
  outcome: "Verified" | "Changes Required" | "Failed Verification",
  notes = "",
  isException = false
): Promise<TaskSubmission> {
  await new Promise((r) => setTimeout(r, 120));
  const subs = getStoredSubmissions();
  const subIndex = subs.findIndex((s) => s.id === submissionId);
  if (subIndex === -1) throw new Error("Submission not found");

  const sub = subs[subIndex];
  const tasks = getStoredTasks();
  const task = tasks.find((t) => t.id === sub.taskId);

  if (outcome !== "Verified" && !notes.trim()) {
    throw new Error("Specific reviewer feedback is required for this decision.");
  }

  const updatedSub: TaskSubmission = {
    ...sub,
    status: outcome,
    reviewerNotes: isException ? `Post unavailable: ${notes.trim()}` : notes.trim() || undefined,
    verifiedAt: new Date().toISOString(),
  };

  subs[subIndex] = updatedSub;
  saveStoredSubmissions(subs);

  appendAudit({
    actor: "Reviewer",
    action: isException ? "Exception, evidence requested" : `Recorded: ${outcome}`,
    targetObject: `${sub.taskId} / ${sub.partnerName} (criteria v${task?.publishedVersion || 1})`,
    reason: notes.trim(),
  });

  return updatedSub;
}

export async function fetchNotifications(): Promise<TaskNotification[]> {
  await new Promise((r) => setTimeout(r, 40));
  return getStoredNotifications();
}

export async function retryNotificationSend(index: number): Promise<TaskNotification> {
  await new Promise((r) => setTimeout(r, 80));
  const notifs = getStoredNotifications();
  if (!notifs[index]) throw new Error("Notification not found");

  notifs[index].status = "Sent";
  notifs[index].sentAt = new Date().toISOString();
  saveStoredNotifications(notifs);

  appendAudit({
    actor: "System",
    action: "Email notification retried and sent",
    targetObject: `${notifs[index].taskId} / ${notifs[index].partnerName}`,
  });

  return notifs[index];
}

export async function fetchAuditLog(): Promise<TaskAuditEntry[]> {
  await new Promise((r) => setTimeout(r, 40));
  return getStoredAudit();
}
