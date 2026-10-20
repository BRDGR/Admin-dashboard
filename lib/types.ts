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

export type UserRole =
  | "partner"
  | "client"
  | "admin"
  | "ops_admin"
  | "super_admin"
  | "staff"
  | "reviewer"
  | "support";

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt?: string;
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

/** Returned by GET /admin/partners/:userId — a single partner detail. */
export interface PartnerDetailResponse {
  partner?: PartnerRecord;
  user?: AdminUser;
  partnerProfile?: PartnerProfile;
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

export type StaffRole = "admin" | "ops_admin" | "super_admin";

export interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: StaffRole;
  staffRole?: string;
  isActive: boolean;
  imageUrl?: string | null;
  avatarUrl?: string | null;
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
  role: StaffRole;
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
  | "system_alert";

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
  rejectionReason?: string;
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
  /** Canonical list key. Use this everywhere. */
  clients: AdminClientRecord[];
  records?: AdminClientRecord[];
  partners?: AdminClientRecord[];
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

// ─── Admin Dashboard Spec Contracts (Visibility Matrix & Image 7/8) ───────────

export type PartnerTier = "Exceptional" | "Strong" | "Performing" | "Needs Attention" | "Critical";

export interface AdminPartnerLeaderboardItem {
  partnerId: string;
  name: string;
  avatarUrl?: string;
  score: number; // 0–100
  tier: PartnerTier;
  multiplier: number; // e.g. 1.25x, 1.10x, 1.00x, 0.85x, 0.70x
  attainments: {
    conversionRate: number; // %
    volume: number; // count
    retentionRate: number; // %
    complianceScore: number; // %
  };
  sparkline: number[]; // 7 data points for sparkline rendering
  status?: "active" | "flagged" | "pip" | "probation";
  consecutiveFlaggedWeeks?: number;
}

export interface AdminPayoutApprovalTierBreakdown {
  tier: PartnerTier;
  partnerCount: number;
  multiplier: number;
  rawPoolShareCents: number;
  finalPayoutCents: number;
}

export interface AdminPayoutApprovalPayload {
  campaignId: string;
  campaignName: string;
  budgetCents: number; // e.g. 2,000,000 ($20,000)
  reserveCents: number; // 10% -> 200,000 ($2,000)
  bonusCents: number; // 5% -> 100,000 ($1,000)
  holdbackCents: number; // 10% -> 200,000 ($2,000)
  poolCents: number; // e.g. 1,700,000 ($17,000)
  totalPayoutsCents: number; // ∑ Payouts
  invariantPassed: boolean; // ∑ Payouts === poolCents
  tierBreakdown: AdminPayoutApprovalTierBreakdown[];
  normalizedPartnersCount: number;
  calculationMethod: "Hamilton_Largest_Remainder";
}

export interface CampaignConfigVersionDTO {
  configVersion: string; // e.g. "v2.4.1"
  brokerWeights: {
    cpa: number; // 15
    retention: number; // 15
    volume: number; // 25
    compliance: number; // 45
  };
  propFirmWeights: {
    cpa: number; // 15
    retention: number; // 20
    volume: number; // 15
    compliance: number; // 50
  };
  attainmentCapPct: number; // 120%
  reservePct: number; // 10%
  bonusPct: number; // 5%
  holdbackPct: number; // 10-15% (e.g. 12%)
  updatedAt?: string;
  updatedBy?: string;
  changeNote?: string;
}

export type CommercialEventType = "FTD" | "Qualified_Trader" | "Demo_Signup" | "Volume_Tier_Achieved";

export interface CommercialValidationEvent {
  id: string;
  clientId: string;
  clientName: string;
  partnerId: string;
  partnerName: string;
  campaignId?: string;
  campaignName?: string;
  eventType: CommercialEventType;
  amountMinor: number;
  currency: string;
  occurredAt: string;
  ageHours: number;
  status: "pending" | "approved" | "rejected" | "reversed";
  rejectionReason?: string;
  reversalTxId?: string;
  ipAddress?: string;
  fraudRiskScore?: number; // 0-100
  metadata?: Record<string, unknown>;
}

export interface FraudAnomalyFlag {
  id: string;
  type: "flagged_clicks" | "bot_cluster" | "duplicate_ip" | "cr_spike";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  count: number;
  partnerId: string;
  partnerName: string;
  detectedAt: string;
  status: "investigating" | "confirmed_fraud" | "dismissed";
}


