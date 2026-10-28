import type {
  AdminPartnerLeaderboardItem,
  AdminPayoutApprovalPayload,
  CampaignConfigVersionDTO,
  CommercialValidationEvent,
  FraudAnomalyFlag,
  PartnerTier,
  AdminCampaignQueueItem,
} from "@/lib/types";

// Deterministic 300 partners generator
const FIRST_NAMES = [
  "Alex", "Sophia", "Marcus", "Elena", "Liam", "Aria", "Julian", "Chloe", "David", "Mia",
  "Lucas", "Emma", "Ethan", "Olivia", "Noah", "Ava", "Oliver", "Isabella", "Elijah", "Charlotte",
  "James", "Amelia", "William", "Harper", "Benjamin", "Evelyn", "Mateo", "Abigail", "Daniel", "Emily",
  "Henry", "Ella", "Alexander", "Elizabeth", "Jackson", "Camila", "Sebastian", "Luna", "Jack", "Sofia"
];

const LAST_NAMES = [
  "Vance", "Chen", "Sterling", "Rostova", "O'Connor", "Kim", "Patel", "Novak", "Lindqvist", "Dubois",
  "Santos", "Kowalski", "Müller", "Fischer", "Rossi", "Moretti", "Takahashi", "Sato", "Nakamura", "Tanaka",
  "Hansen", "Johansen", "Al-Mansoor", "Haddad", "Bakker", "Van Dijk", "Larsson", "Berg", "Nielsen", "Jensen"
];

function generate300Partners(): AdminPartnerLeaderboardItem[] {
  const partners: AdminPartnerLeaderboardItem[] = [];

  // 1. Exceptional: 32 partners
  for (let i = 1; i <= 32; i++) {
    const fn = FIRST_NAMES[(i * 7) % FIRST_NAMES.length];
    const ln = LAST_NAMES[(i * 13) % LAST_NAMES.length];
    const score = Number((90.0 + ((i * 3.7) % 9.8)).toFixed(1));
    const base = 70 + (i % 20);
    partners.push({
      partnerId: `PRT-${String(i).padStart(3, "0")}`,
      name: `${fn} ${ln}`,
      score,
      tier: "Exceptional",
      multiplier: 1.25,
      attainments: {
        conversionRate: Number((4.5 + (i % 20) * 0.12).toFixed(2)),
        volume: 240 + (i * 15),
        retentionRate: Number((82 + (i % 14)).toFixed(1)),
        complianceScore: Number((96 + (i % 5)).toFixed(1)),
      },
      sparkline: [base, base + 2, base + 1, base + 4, base + 3, base + 6, base + 8],
      status: "active",
      consecutiveFlaggedWeeks: 0,
    });
  }

  // 2. Strong: 78 partners
  for (let i = 33; i <= 110; i++) {
    const fn = FIRST_NAMES[(i * 11) % FIRST_NAMES.length];
    const ln = LAST_NAMES[(i * 17) % LAST_NAMES.length];
    const score = Number((75.0 + ((i * 2.9) % 14.8)).toFixed(1));
    const base = 60 + (i % 15);
    partners.push({
      partnerId: `PRT-${String(i).padStart(3, "0")}`,
      name: `${fn} ${ln}`,
      score,
      tier: "Strong",
      multiplier: 1.10,
      attainments: {
        conversionRate: Number((3.2 + (i % 18) * 0.1).toFixed(2)),
        volume: 160 + ((i % 50) * 8),
        retentionRate: Number((72 + (i % 12)).toFixed(1)),
        complianceScore: Number((91 + (i % 7)).toFixed(1)),
      },
      sparkline: [base - 1, base + 1, base, base + 2, base + 1, base + 4, base + 3],
      status: "active",
      consecutiveFlaggedWeeks: 0,
    });
  }

  // 3. Performing: 140 partners
  for (let i = 111; i <= 250; i++) {
    const fn = FIRST_NAMES[(i * 13) % FIRST_NAMES.length];
    const ln = LAST_NAMES[(i * 19) % LAST_NAMES.length];
    const score = Number((50.0 + ((i * 3.1) % 24.5)).toFixed(1));
    const base = 48 + (i % 12);
    partners.push({
      partnerId: `PRT-${String(i).padStart(3, "0")}`,
      name: `${fn} ${ln}`,
      score,
      tier: "Performing",
      multiplier: 1.00,
      attainments: {
        conversionRate: Number((2.1 + (i % 15) * 0.08).toFixed(2)),
        volume: 95 + ((i % 40) * 5),
        retentionRate: Number((58 + (i % 15)).toFixed(1)),
        complianceScore: Number((84 + (i % 10)).toFixed(1)),
      },
      sparkline: [base, base - 2, base + 1, base, base - 1, base + 2, base],
      status: "active",
      consecutiveFlaggedWeeks: 0,
    });
  }

  // 4. Needs Attention: 38 partners
  for (let i = 251; i <= 288; i++) {
    const fn = FIRST_NAMES[(i * 5) % FIRST_NAMES.length];
    const ln = LAST_NAMES[(i * 23) % LAST_NAMES.length];
    const score = Number((30.0 + ((i * 2.3) % 19.5)).toFixed(1));
    const base = 35 + (i % 10);
    const consecutiveFlaggedWeeks = (i % 3 === 0) ? 2 : (i % 5 === 0) ? 3 : 1;
    partners.push({
      partnerId: `PRT-${String(i).padStart(3, "0")}`,
      name: `${fn} ${ln}`,
      score,
      tier: "Needs Attention",
      multiplier: 0.85,
      attainments: {
        conversionRate: Number((1.2 + (i % 10) * 0.06).toFixed(2)),
        volume: 38 + ((i % 20) * 4),
        retentionRate: Number((42 + (i % 12)).toFixed(1)),
        complianceScore: Number((72 + (i % 10)).toFixed(1)),
      },
      sparkline: [base + 5, base + 3, base + 2, base, base - 2, base - 4, base - 5],
      status: consecutiveFlaggedWeeks >= 2 ? "pip" : "flagged",
      consecutiveFlaggedWeeks,
    });
  }

  // 5. Critical: 12 partners
  for (let i = 289; i <= 300; i++) {
    const fn = FIRST_NAMES[(i * 9) % FIRST_NAMES.length];
    const ln = LAST_NAMES[(i * 29) % LAST_NAMES.length];
    const score = Number((12.0 + ((i * 2.1) % 17.0)).toFixed(1));
    const base = 24 + (i % 5);
    partners.push({
      partnerId: `PRT-${String(i).padStart(3, "0")}`,
      name: `${fn} ${ln}`,
      score,
      tier: "Critical",
      multiplier: 0.70,
      attainments: {
        conversionRate: Number((0.6 + (i % 5) * 0.08).toFixed(2)),
        volume: 12 + (i % 10),
        retentionRate: Number((26 + (i % 10)).toFixed(1)),
        complianceScore: Number((58 + (i % 12)).toFixed(1)),
      },
      sparkline: [base + 8, base + 5, base + 2, base, base - 4, base - 7, base - 10],
      status: "probation",
      consecutiveFlaggedWeeks: 3,
    });
  }

  return partners;
}

export const MOCK_300_PARTNERS: AdminPartnerLeaderboardItem[] = generate300Partners();

// Exact $20,000 Budget / $17,000 Pool fixture specified in Report & Image 8
export const MOCK_PAYOUT_APPROVAL_PAYLOAD: AdminPayoutApprovalPayload = {
  campaignId: "cmp_apex_q4_2026",
  campaignName: "Apex Global Brokerage — Q4 Performance Cohort",
  budgetCents: 2000000, // $20,000.00
  reserveCents: 200000, // $2,000.00 (10%)
  bonusCents: 100000, // $1,000.00 (5%)
  holdbackCents: 200000, // $2,000.00 (10%)
  poolCents: 1700000, // $17,000.00 Net Distributable Pool
  totalPayoutsCents: 1700000, // Exactly $17,000.00 via Hamilton Integer Cents
  invariantPassed: true, // ∑ Payouts === Pool
  normalizedPartnersCount: 300,
  calculationMethod: "Hamilton_Largest_Remainder",
  tierBreakdown: [
    {
      tier: "Exceptional",
      partnerCount: 32,
      multiplier: 1.25,
      rawPoolShareCents: 544000,
      finalPayoutCents: 544000, // $5,440.00 (Avg ~$170.00/partner)
    },
    {
      tier: "Strong",
      partnerCount: 78,
      multiplier: 1.10,
      rawPoolShareCents: 612000,
      finalPayoutCents: 612000, // $6,120.00 (Avg ~$78.46/partner)
    },
    {
      tier: "Performing",
      partnerCount: 140,
      multiplier: 1.00,
      rawPoolShareCents: 425000,
      finalPayoutCents: 425000, // $4,250.00 (Avg ~$30.36/partner)
    },
    {
      tier: "Needs Attention",
      partnerCount: 38,
      multiplier: 0.85,
      rawPoolShareCents: 91800,
      finalPayoutCents: 91800, // $918.00 (Avg ~$24.16/partner)
    },
    {
      tier: "Critical",
      partnerCount: 12,
      multiplier: 0.70,
      rawPoolShareCents: 27200,
      finalPayoutCents: 27200, // $272.00 (Avg ~$22.67/partner)
    },
  ],
};

// Config Versioning and Weights
export const MOCK_SCORING_CONFIG_VERSIONS: CampaignConfigVersionDTO[] = [
  {
    configVersion: "v2.4.1",
    brokerWeights: {
      cpa: 15,
      retention: 15,
      volume: 25,
      compliance: 45,
    },
    propFirmWeights: {
      cpa: 15,
      retention: 20,
      volume: 15,
      compliance: 50,
    },
    attainmentCapPct: 120,
    reservePct: 10,
    bonusPct: 5,
    holdbackPct: 12,
    updatedAt: "2026-10-06T19:45:00Z",
    updatedBy: "super_admin@brdgr.com",
    changeNote: "Enforced 50% compliance weight for Prop Firm models to comply with updated regulatory risk frameworks.",
  },
  {
    configVersion: "v2.3.0",
    brokerWeights: {
      cpa: 15,
      retention: 15,
      volume: 25,
      compliance: 45,
    },
    propFirmWeights: {
      cpa: 15,
      retention: 20,
      volume: 20,
      compliance: 45,
    },
    attainmentCapPct: 120,
    reservePct: 10,
    bonusPct: 5,
    holdbackPct: 10,
    updatedAt: "2026-09-18T11:20:00Z",
    updatedBy: "compliance_lead@brdgr.com",
    changeNote: "Standardized 120% attainment cap and introduced 5% reserve performance bonus pool.",
  },
];

// Commercial Validation Events Work Queue
export const MOCK_COMMERCIAL_VALIDATION_EVENTS: CommercialValidationEvent[] = [
  {
    id: "EVT-89201",
    clientId: "org_equiti_global",
    clientName: "Equiti Global Markets",
    partnerId: "PRT-004",
    partnerName: "Elena Rostova",
    campaignId: "cmp_apex_q4_2026",
    campaignName: "Apex Global Brokerage — Q4",
    eventType: "FTD",
    amountMinor: 25000, // $250.00 CPA
    currency: "USD",
    occurredAt: "2026-10-07T03:15:00Z",
    ageHours: 3,
    status: "pending",
    ipAddress: "185.220.101.44",
    fraudRiskScore: 12, // Low Risk
    metadata: { traderCountry: "GB", depositMethod: "Wire Transfer", initialDepositUsd: 1200 },
  },
  {
    id: "EVT-89202",
    clientId: "org_pepperstone",
    clientName: "Pepperstone EMEA",
    partnerId: "PRT-012",
    partnerName: "Liam O'Connor",
    campaignId: "cmp_apex_q4_2026",
    campaignName: "Apex Global Brokerage — Q4",
    eventType: "Qualified_Trader",
    amountMinor: 18000, // $180.00
    currency: "USD",
    occurredAt: "2026-10-06T22:40:00Z",
    ageHours: 7,
    status: "pending",
    ipAddress: "82.165.197.1",
    fraudRiskScore: 18,
    metadata: { traderCountry: "DE", tradesExecuted: 8, lotVolume: 4.2 },
  },
  {
    id: "EVT-89203",
    clientId: "org_fundedpro",
    clientName: "FundedPro Capital",
    partnerId: "PRT-291",
    partnerName: "Mateo Santos",
    campaignId: "cmp_prop_eval_2026",
    campaignName: "Tier-1 Prop Trader Challenge",
    eventType: "FTD",
    amountMinor: 15000, // $150.00
    currency: "USD",
    occurredAt: "2026-10-06T11:10:00Z",
    ageHours: 19,
    status: "pending",
    ipAddress: "194.26.29.112",
    fraudRiskScore: 78, // High Risk anomaly
    metadata: { traderCountry: "CY", proxyDetected: true, rapidRegistrationSeconds: 14 },
  },
  {
    id: "EVT-89204",
    clientId: "org_toptier",
    clientName: "TopTier Trader",
    partnerId: "PRT-035",
    partnerName: "Julian Chen",
    campaignId: "cmp_prop_eval_2026",
    campaignName: "Tier-1 Prop Trader Challenge",
    eventType: "Volume_Tier_Achieved",
    amountMinor: 50000, // $500.00 Bonus
    currency: "USD",
    occurredAt: "2026-10-05T18:00:00Z",
    ageHours: 36,
    status: "pending",
    ipAddress: "193.37.255.80",
    fraudRiskScore: 24,
    metadata: { targetLots: 100, achievedLots: 124, qualifiedAccounts: 18 },
  },
  {
    id: "EVT-89205",
    clientId: "org_vantage",
    clientName: "Vantage Markets UK",
    partnerId: "PRT-265",
    partnerName: "Noah Al-Mansoor",
    campaignId: "cmp_apex_q4_2026",
    campaignName: "Apex Global Brokerage — Q4",
    eventType: "Demo_Signup",
    amountMinor: 1500, // $15.00
    currency: "USD",
    occurredAt: "2026-10-04T09:20:00Z",
    ageHours: 68,
    status: "pending",
    ipAddress: "45.154.255.8",
    fraudRiskScore: 64, // Medium-High Risk
    metadata: { emailDomain: "tempmail.org", platform: "MT5" },
  },
  {
    id: "EVT-89190",
    clientId: "org_equiti_global",
    clientName: "Equiti Global Markets",
    partnerId: "PRT-002",
    partnerName: "Sophia Chen",
    eventType: "FTD",
    amountMinor: 25000,
    currency: "USD",
    occurredAt: "2026-10-04T04:10:00Z",
    ageHours: 73,
    status: "approved",
    ipAddress: "86.12.33.190",
    fraudRiskScore: 8,
  },
  {
    id: "EVT-89182",
    clientId: "org_pepperstone",
    clientName: "Pepperstone EMEA",
    partnerId: "PRT-298",
    partnerName: "Camila Nielsen",
    eventType: "FTD",
    amountMinor: 25000,
    currency: "USD",
    occurredAt: "2026-10-03T14:50:00Z",
    ageHours: 87,
    status: "rejected",
    rejectionReason: "Duplicate IP & Bot traffic cluster detected",
    ipAddress: "185.191.171.12",
    fraudRiskScore: 92,
  },
  {
    id: "EVT-89170",
    clientId: "org_fundedpro",
    clientName: "FundedPro Capital",
    partnerId: "PRT-280",
    partnerName: "Daniel Jensen",
    eventType: "FTD",
    amountMinor: 15000,
    currency: "USD",
    occurredAt: "2026-10-02T10:00:00Z",
    ageHours: 115,
    status: "reversed",
    reversalTxId: "REV-89170-COMPENSATING",
    rejectionReason: "Clawback: Customer initiated credit card chargeback",
    ipAddress: "91.240.118.23",
    fraudRiskScore: 85,
  },
];

// Fraud & Quality Flags
export const MOCK_FRAUD_ANOMALY_FLAGS: FraudAnomalyFlag[] = [
  {
    id: "FRD-101",
    type: "flagged_clicks",
    severity: "critical",
    description: "4,210 clicks received from datacenter ASN within 12-minute window (OVHcloud hosting ranges).",
    count: 4210,
    partnerId: "PRT-291",
    partnerName: "Mateo Santos",
    detectedAt: "2026-10-07T02:40:00Z",
    status: "investigating",
  },
  {
    id: "FRD-102",
    type: "bot_cluster",
    severity: "high",
    description: "Repetitive headless Chrome user-agent hash matching 840 demo registrations with identical canvas fingerprints.",
    count: 840,
    partnerId: "PRT-265",
    partnerName: "Noah Al-Mansoor",
    detectedAt: "2026-10-06T19:15:00Z",
    status: "investigating",
  },
  {
    id: "FRD-103",
    type: "duplicate_ip",
    severity: "medium",
    description: "23 user registrations originated from identical IPv4 (45.154.255.8) within 45 seconds.",
    count: 23,
    partnerId: "PRT-298",
    partnerName: "Camila Nielsen",
    detectedAt: "2026-10-06T08:30:00Z",
    status: "confirmed_fraud",
  },
  {
    id: "FRD-104",
    type: "cr_spike",
    severity: "low",
    description: "Anomalous 94% conversion rate recorded on mobile traffic cohort (industry baseline: 3-5%).",
    count: 1,
    partnerId: "PRT-252",
    partnerName: "Harper Lindqvist",
    detectedAt: "2026-10-05T14:10:00Z",
    status: "dismissed",
  },
];

export const MOCK_CAMPAIGN_QUEUE: AdminCampaignQueueItem[] = [
  {
    id: "cmp_apex_q4_2026",
    name: "Apex Global Brokerage — Q4 Performance Cohort",
    status: "active",
    category: "Broker",
    organizationName: "Apex Markets Ltd",
    organization: { id: "org_apex", name: "Apex Markets Ltd" },
    budgetAmount: 20000,
    budgetCurrency: "USD",
    budgetMinor: 2000000,
    partnershipModel: "CPA",
    startDate: "2026-10-01",
    endDate: "2026-12-31",
    targetRegions: ["Tier 1 EU", "GCC", "LATAM"],
    submittedAt: "2026-09-28T10:00:00Z",
    createdAt: "2026-09-28T10:00:00Z",
  },
  {
    id: "cmp_zenith_prop_alpha",
    name: "Zenith Prop Challenge — FastTrack Alpha",
    status: "active",
    category: "Prop Firm",
    organizationName: "Zenith Funding Corp",
    organization: { id: "org_zenith", name: "Zenith Funding Corp" },
    budgetAmount: 35000,
    budgetCurrency: "USD",
    budgetMinor: 3500000,
    partnershipModel: "Revenue Share",
    startDate: "2026-10-15",
    endDate: "2027-01-15",
    targetRegions: ["Global", "North America"],
    submittedAt: "2026-10-10T14:30:00Z",
    createdAt: "2026-10-10T14:30:00Z",
  },
  {
    id: "cmp_vanguard_fx_sprint",
    name: "Vanguard FX Growth Sprint",
    status: "matching",
    category: "Broker",
    organizationName: "Vanguard Global FX",
    organization: { id: "org_vanguard", name: "Vanguard Global FX" },
    budgetAmount: 15000,
    budgetCurrency: "USD",
    budgetMinor: 1500000,
    partnershipModel: "Hybrid",
    startDate: "2026-11-01",
    endDate: "2026-12-31",
    targetRegions: ["South East Asia", "Africa"],
    submittedAt: "2026-10-18T09:15:00Z",
    createdAt: "2026-10-18T09:15:00Z",
  },
  {
    id: "cmp_equinox_eval",
    name: "Equinox Trader Evaluation Fund",
    status: "active",
    category: "Prop Firm",
    organizationName: "Equinox Trading Group",
    organization: { id: "org_equinox", name: "Equinox Trading Group" },
    budgetAmount: 50000,
    budgetCurrency: "USD",
    budgetMinor: 5000000,
    partnershipModel: "CPA",
    startDate: "2026-09-01",
    endDate: "2026-12-31",
    targetRegions: ["Europe", "United Kingdom"],
    submittedAt: "2026-08-25T11:00:00Z",
    createdAt: "2026-08-25T11:00:00Z",
  },
  {
    id: "cmp_titan_multiasset",
    name: "Titan Multi-Asset IB Expansion",
    status: "matching",
    category: "Broker",
    organizationName: "Titan Securities",
    organization: { id: "org_titan", name: "Titan Securities" },
    budgetAmount: 25000,
    budgetCurrency: "USD",
    budgetMinor: 2500000,
    partnershipModel: "CPA",
    startDate: "2026-11-15",
    endDate: "2027-02-15",
    targetRegions: ["MENA", "APAC"],
    submittedAt: "2026-10-22T16:45:00Z",
    createdAt: "2026-10-22T16:45:00Z",
  },
  {
    id: "cmp_bluesky_scale",
    name: "BlueSky Prop Scale 2026",
    status: "pending_review",
    category: "Prop Firm",
    organizationName: "BlueSky Capital",
    organization: { id: "org_bluesky", name: "BlueSky Capital" },
    budgetAmount: 40000,
    budgetCurrency: "USD",
    budgetMinor: 4000000,
    partnershipModel: "Hybrid",
    startDate: "2026-12-01",
    endDate: "2027-03-01",
    targetRegions: ["Global"],
    submittedAt: "2026-10-25T12:00:00Z",
    createdAt: "2026-10-25T12:00:00Z",
  },
];

