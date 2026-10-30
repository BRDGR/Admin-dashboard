// ─────────────────────────────────────────────
// BRDGR Admin — Daily Task Management Types
// Matches Wireframe v2 Admin specifications
// ─────────────────────────────────────────────

export type PlatformType = "X.com" | "LinkedIn" | "Instagram" | "Other";

export type DailyTaskStatus =
  | "Draft"
  | "Pending Approval"
  | "Approved"
  | "Published"
  | "Completed"
  | "Cancelled"
  | "Rejected";

export type SubmissionStatus =
  | "Pending"
  | "Submitted"
  | "Under Verification"
  | "Verified"
  | "Changes Required"
  | "Failed Verification";

export type EvidenceType = "URL only" | "URL + screenshot" | "URL + other evidence";

export interface TaskRequirement {
  wording?: string;
  requiredWording?: string;
  hashtags?: string;
  requiredLink?: string;
}

export interface DailyTask {
  id: string; // e.g. "T-1042"
  title: string;
  clientId: string;
  clientName: string;
  platform: PlatformType;
  status: DailyTaskStatus;
  version: number; // Working draft version (e.g. 1, 2)
  publishedVersion?: number; // Frozen approved snapshot version for partners (e.g. 1)
  deadline: string; // ISO datetime string
  timezone: string; // e.g. "WAT", "GMT", "CET", "EAT"
  instructions: string;
  requirements: TaskRequirement;
  evidenceType: EvidenceType;
  allowedResubmissions: number; // 0, 1, 2, 3
  assignedPartnerIds: string[];
  rejectionReason?: string;
  requestedPublicationAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskSubmission {
  id: string;
  taskId: string;
  partnerId: string;
  partnerName: string;
  status: SubmissionStatus;
  attemptNumber: number;
  postUrl?: string;
  evidenceName?: string;
  evidenceUrl?: string;
  reviewerNotes?: string;
  submittedAt?: string;
  verifiedAt?: string;
}

export interface TaskNotification {
  taskId: string;
  partnerId: string;
  partnerName: string;
  status: "Sent" | "Failed";
  sentAt?: string;
}

export interface TaskAuditEntry {
  timestamp: string;
  actor: "Client" | "Reviewer" | "Partner" | "System";
  action: string;
  targetObject: string;
  reason?: string;
}

export interface AdminDailyTasksKpis {
  pendingApprovalCount: number;
  approvedNotPublishedCount: number;
  submissionsToVerifyCount: number;
  pastDeadlineUnverifiedCount: number;
}
