// ─── Shared ───────────────────────────────────────────────────────────────────

export interface Pagination {
  currentPage: number;
  nextPage: number | null;
  prevPage: number | null;
  hasNext: boolean;
  hasPrev: boolean;
  totalPages: number;
  totalRecords: number;
}

export interface ApiEnvelope<T> {
  error: boolean;
  message: string;
  data: T;
}

// ─── Waitlist (Firebase) ──────────────────────────────────────────────────────

export interface WaitlistEntry {
  id: string;
  fullName: string;
  email: string;
  role: string;
  company: string;
  lookingFor: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
}

// ─── Demo Requests (Firebase) ─────────────────────────────────────────────────

export interface DemoRequest {
  id: string;
  email: string;
  phone: string;
  companyName: string;
  companyType: string;
  message: string;
  createdAt: string;
  status: "pending_schedule" | "scheduled" | "completed" | "cancelled";
  userAgent?: string;
  referrer?: string;
}

// ─── Users ────────────────────────────────────────────────────────────────────

/** Alias for backwards-compat with components that import `User` */
export type User = AdminUser;

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "partner" | "client" | "admin" | "ops_admin" | "super_admin" | "staff" | "reviewer" | "support" | string;
  isActive: boolean;
  emailVerifiedAt: string | null;
  createdAt: string;
}

export interface UsersResponse {
  users: AdminUser[];
  pagination: Pagination;
}

export interface AdminInviteCodeRecord {
  id: string;
  orgId: string;
  code: string;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  organization?: {
    id: string;
    name: string;
    companyType?: string;
  };
}

// ─── Partners ─────────────────────────────────────────────────────────────────

export interface PartnerProfile {
  id: string;
  userId: string;
  ecosystemId: string | null;
  bio: string;
  location: string;
  languages: string[];
  industries: string[];
  marketsServed: string[];
  yearsExperience: number;
  partnershipExperience: string;
  capacity: "full_time" | "part_time";
  niches: string[];
  portfolio: { url: string; title: string; description: string }[];
  contactEmail: string;
  contactPhone: string;
  isVetted: boolean;
  socialAccounts?: { platform: string; handle: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface PartnerRecord {
  partnerProfile: PartnerProfile;
  user: AdminUser;
}

export interface PartnersResponse {
  partners: PartnerRecord[];
  pagination: Pagination;
}

// ─── Organizations ────────────────────────────────────────────────────────────

export interface Organization {
  id: string;
  name: string;
  email: string;
  website?: string;
  description?: string;
  companyType?: string;
  legalEntityName?: string;
  country?: string;
  operatingRegions?: string[];
  status: string;
  isActive: boolean;
  isVerified: boolean;
  isDeleted: boolean;
  planId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  closedAt: string | null;
  regulatoryInfo?: { regulator?: string; licenseNumber?: string; jurisdictions?: string[] };
  productsServices?: { primary?: string[]; platforms?: string[] };
  existingPartnershipsContext?: { notes?: string; currentPartners?: number };
  byoPartnersContext?: { notes?: string; hasBYOPartners?: boolean };
}

export interface OrganizationOwner {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface OrganizationRecord {
  organization: Organization;
  owner: OrganizationOwner;
}

export interface OrganizationsResponse {
  organizations: OrganizationRecord[];
  pagination: Pagination;
}

// ─── KYC ─────────────────────────────────────────────────────────────────────

export type KycStatus = "pending" | "verified" | "failed" | "rejected" | "approved";

export interface KycDocumentItem {
  id?: string;
  documentType?: string;
  url?: string;
  fileUrl?: string;
  fileName?: string;
  uploadedAt?: string;
}

// Shape returned by GET /admin/kyc/ (org KYC)
export interface KycRecord {
  id: string;
  orgId: string;
  status: KycStatus;
  provider: string;
  providerReferenceId: string;
  decisionNotes: string | null;
  documentType?: string;
  fileUrl?: string;
  documentUrl?: string;
  fileName?: string;
  documents?: KycDocumentItem[];
  submittedAt: string;
  decidedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface KycRecordWithOrg {
  kycRecord: KycRecord;
  organization: { id: string; name: string };
}

// Shape returned by GET /admin/partners/kyc/records (partner KYC)
export interface PartnerUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
}

export interface PartnerKycRecord {
  kycRecordId: string;
  status: KycStatus;
  provider?: string;
  providerReferenceId?: string;
  decisionNotes?: string | null;
  documentType?: string;
  fileUrl?: string;
  documentUrl?: string;
  fileName?: string;
  documents?: KycDocumentItem[];
  submittedAt: string;
  decidedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  partnerUser: PartnerUser;
  partnerProfile: { id: string };
}

export interface KycListResponse {
  records: KycRecordWithOrg[];
  pagination: Pagination;
}

export interface PartnerKycListResponse {
  records: PartnerKycRecord[];
  pagination: Pagination;
}

export interface KycReviewPayload {
  status: KycStatus;
  decisionNotes?: string;
}

// ─── BYOP ─────────────────────────────────────────────────────────────────────

export interface ByopAnalytics {
  totalRelationships: number;
  activePartners: number;
  linkedOrganizations: number;
  [key: string]: unknown;
}

export interface ByopRelationship {
  relationshipId: string;
  createdAt: string;
  updatedAt: string;
  partner: AdminUser;
  clientOrganization: { id: string; name: string };
}

export interface ByopRelationshipsResponse {
  records: ByopRelationship[];
  pagination: Pagination;
}

// ─── Staff ────────────────────────────────────────────────────────────────────

export interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "admin" | "ops_admin" | "super_admin" | string;
  staffRole?: string;
  isActive: boolean;
  emailVerifiedAt?: string | null;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface StaffResponse {
  staff: StaffMember[];
  pagination: Pagination;
}

export interface CreateStaffPayload {
  firstName: string;
  lastName: string;
  email: string;
  role: "admin" | "ops_admin";
}

// ─── Seed History ─────────────────────────────────────────────────────────────

export interface SeedHistoryRecord {
  id: number | string;
  name: string;
  version?: number;
  executedAt: string;
  [key: string]: unknown;
}

export interface SeedHistoryResponse {
  history: SeedHistoryRecord[];
  pagination?: Pagination;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export type NotificationType =
  | "campaign_assignment"
  | "campaign_activated"
  | "campaign_review"
  | "campaign_paused"
  | "kyc_status"
  | "byop_invite"
  | "organization_invite"
  | "pending_change"
  | "system_alert"
  | string;

export interface NotificationPayload {
  message?: string;
  campaignId?: string;
  campaignName?: string;
  assignmentId?: string;
  organizationId?: string;
  organizationName?: string;
  kycStatus?: string;
  [key: string]: unknown;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  payload: NotificationPayload;
  channel: string;
  readAt: string | null;
  sentAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsData {
  notifications: NotificationItem[];
  unreadCount: number;
  pagination: Pagination;
}

export interface NotificationsResponse {
  notifications: NotificationItem[];
  unreadCount: number;
  pagination: Pagination;
}

// ─── Admin Campaigns Pipeline ─────────────────────────────────────────────────

export type CampaignReviewAction = "approve" | "reject" | "request_changes";
export type CampaignAssignmentStatus = "assigned" | "accepted" | "declined" | "expired";

export interface AdminCampaignQueueItem {
  id: string;
  name: string;
  status: "submitted" | "in_review" | "approved" | "rejected" | "changes_requested" | "active" | "paused" | "completed" | "matching" | "assigned" | "pending_review" | "cancelled";
  organizationId?: string;
  organizationName?: string;
  organization?: {
    id: string;
    name: string;
    [key: string]: unknown;
  };
  category?: string;
  startDate?: string;
  endDate?: string;
  budgetAmount?: string | number;
  budgetCurrency?: string;
  budgetMinor?: number;
  budget?: number;
  currency?: string;
  idealPartnerType?: string;
  partnershipModel?: string;
  targetRegions?: string[];
  targetNiches?: string[];
  reviewStage?: string;
  submittedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface AdminCampaignQueueResponse {
  queue?: AdminCampaignQueueItem[];
  campaigns?: AdminCampaignQueueItem[];
  pagination: Pagination;
}

export interface CampaignReviewPayload {
  /** The target status — API accepts: matching, active, cancelled */
  status: AdminCampaignQueueItem["status"];
  reason?: string;
  notes?: string;
  requestedChanges?: string[];
}

export interface MatchScoreBreakdown {
  audienceReach?: number;
  geoFit?: number;
  verticalFit?: number;
  pastPerformance?: number;
}

export interface CampaignMatchPartner {
  partnerId: string;
  userId: string;
  partnerName: string;
  partnerEmail?: string;
  matchScore: number;
  scoreBreakdown?: MatchScoreBreakdown;
  niches?: string[];
  markets?: string[];
  capacity?: string;
  location?: string;
  isVetted?: boolean;
}

export interface CampaignMatchResponse {
  matches: CampaignMatchPartner[];
  totalMatches: number;
}

export interface AssignCampaignPayload {
  partnerUserIds: string[];
  destinationUrl: string;
  invitationType?: "standard" | "exclusive" | "direct";
  customMessage?: string;
}

export interface CampaignAssignment {
  id: string;
  campaignId: string;
  partnerId: string;
  partnerName?: string;
  partnerEmail?: string;
  status: CampaignAssignmentStatus;
  invitationType?: string;
  trackingLink?: string;
  assignedAt: string;
  respondedAt?: string;
  [key: string]: unknown;
}

export interface CampaignAssignmentsResponse {
  assignments: CampaignAssignment[];
  pagination: Pagination;
}

export interface CampaignActivatePayload {
  generateTrackingLinks?: boolean;
  notifyPartners?: boolean;
}

export interface Campaign360Summary {
  totalCampaigns: number;
  activeCampaigns: number;
  matchingCampaigns: number;
  pendingReviewCampaigns: number;
  completedCampaigns: number;
  cancelledCampaigns?: number;
  totalBudgetAllocated?: number;
  totalConversions?: number;
  averageRoi?: number;
  currency?: string;
  [key: string]: unknown;
}

export interface Campaign360CampaignItem {
  id: string;
  name: string;
  status: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  organization?: { id: string; name: string };
  targetTraffic?: number;
  totalTraffic?: number;
  achievementPct?: number;
  partnersAssigned?: number;
  activePartners?: number;
  targetPosition?: number;
  actualPosition?: number;
  [key: string]: unknown;
}

export interface Campaign360OverviewResponse {
  summary: Campaign360Summary;
  campaigns: Campaign360CampaignItem[];
  pagination: Pagination;
}

export interface CampaignPerformanceData {
  clicks: number;
  impressions: number;
  conversions: number;
  spend: number;
  revenue: number;
  conversionRate: number;
  roas: number;
  status: string;
  period?: string;
}

export interface CampaignPerformanceResponse {
  performance: CampaignPerformanceData;
}

export interface PartnerCampaignPerformanceResponse {
  performance: {
    partnerUserId?: string;
    partnerName?: string;
    clicks: number;
    impressions?: number;
    conversions: number;
    spend?: number;
    revenue?: number;
    conversionRate: number;
    roas?: number;
    status?: string;
    [key: string]: unknown;
  };
}

export interface CampaignEvaluationResponse {
  evaluation: {
    passed: boolean;
    currentMetrics: Record<string, unknown>;
    thresholds: Record<string, unknown>;
    flags: string[];
    recommendedAction: string;
  };
}

export interface CampaignPerformancePolicy {
  minConversionRate?: number;
  maxCpa?: number;
  minWeeklyConversions?: number;
  evaluationFrequencyDays?: number;
  autoPauseOnBreach?: boolean;
  [key: string]: unknown;
}

export interface CampaignPipPayload {
  reason: string;
  durationDays: number;
  targetMetrics: {
    minConversionRate?: number;
    minConversions?: number;
  };
  autoPauseOnFailure?: boolean;
}

// ─── Directory Contacts CRM ──────────────────────────────────────────────────

export type ContactStatus = "new" | "contacted" | "qualified" | "unqualified" | "converted";

export interface DirectoryContactNotes {
  priority?: "high" | "medium" | "low";
  memo?: string;
  initialContactDate?: string;
  interests?: string[];
  [key: string]: unknown;
}

export interface DirectoryContact {
  id: string;
  name: string;
  email: string;
  source: string;
  status: ContactStatus;
  notes?: DirectoryContactNotes;
  createdAt: string;
  updatedAt: string;
  addedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface DirectoryContactsResponse {
  contacts?: DirectoryContact[];
  pagination?: Pagination;
}

export interface CreateContactPayload {
  name: string;
  email: string;
  source: string;
  status?: ContactStatus;
  notes?: Record<string, unknown>;
}

// ─── Pending Changes (Maker-Checker) ──────────────────────────────────────────

export interface PendingChangeItem {
  id: string;
  method?: string;
  routeKey?: string;
  urlParams?: Record<string, unknown>;
  body?: Record<string, unknown>;
  status: "pending" | "approved" | "rejected";
  reviewNote?: string | null;
  decidedAt?: string | null;
  expiresAt?: string;
  createdAt: string;
  requester?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface PendingChangesResponse {
  pendingChanges: PendingChangeItem[];
  pagination: Pagination;
}

export interface ReviewPendingChangePayload {
  decision: "approved" | "rejected";
  reviewNote?: string;
}

// ─── Clients Admin ────────────────────────────────────────────────────────────

export interface AdminClientOrganization {
  id: string;
  name: string;
  companyType?: string | null;
  country?: string | null;
  website?: string | null;
  status?: string | null;
  isVerified?: boolean | null;
  role?: string | null;
  createdAt?: string | null;
}

export interface AdminClientRecord {
  id: string;
  user: AdminUser;
  organization?: AdminClientOrganization | null;
  organizations?: AdminClientOrganization[];
  partnerProfile?: PartnerProfile | null;
  createdAt?: string;
}

export interface ClientsResponse {
  clients?: AdminClientRecord[];
  partners?: AdminClientRecord[];
  records?: AdminClientRecord[];
  pagination: Pagination;
}

export interface OrganizationStatusPayload {
  isActive?: boolean;
  isVerified?: boolean;
}

export interface PartnerEligibilityRequirement {
  label: string;
  status: boolean;
}

export interface PartnerEligibilityGate {
  accountComplete?: boolean;
  campaignEligible?: boolean;
  isVetted?: boolean;
  kycVerified?: boolean;
  monitoringAuthorisationGranted?: boolean;
  prerequisitesMet?: boolean;
  profileComplete?: boolean;
  socialAccountsConnected?: boolean;
  workHistoryComplete?: boolean;
}

export interface PartnerEligibilityData {
  campaignEligibility?: string;
  gate?: PartnerEligibilityGate;
  partnerUserId?: string;
  requirements?: PartnerEligibilityRequirement[];

  // Normalized / fallback fields
  isEligible?: boolean;
  kycApproved?: boolean;
  vettingApproved?: boolean;
  hasSocialAccounts?: boolean;
  reasons?: string[];
}

