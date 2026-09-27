# BRDGR Admin — APIs Needed from Backend

> This file tracks every API endpoint that the admin dashboard UI calls but the backend has **not yet implemented or confirmed**. Each entry includes the exact URL, method, expected request shape, and expected response shape so the backend team can implement them without ambiguity.

---

## Table of Contents

- [1. Admin Profile Update](#1-admin-profile-update)
- [2. Campaign Performance Policy — GET](#2-campaign-performance-policy--get)
- [3. Campaign Performance Policy — PUT (Update)](#3-campaign-performance-policy--put-update)
- [4. Campaign Performance Evaluate](#4-campaign-performance-evaluate)
- [5. Place Partner on PIP](#5-place-partner-on-pip)
- [6. Partner Campaign Performance](#6-partner-campaign-performance)
- [7. Partner Eligibility Status (Admin)](#7-partner-eligibility-status-admin)
- [8. KYC Single Record Detail](#8-kyc-single-record-detail)
- [9. Update Client Profile](#9-update-client-profile)
- [10. BYOP Accept Invite](#10-byop-accept-invite)
- [11. BYOP Validate Token](#11-byop-validate-token)
- [12. Partnership Requirements](#12-partnership-requirements)
- [13. Analytics Time-Series](#13-analytics-time-series)
- [14. Partner Earnings & Payouts](#14-partner-earnings--payouts)
- [15. Partner Tracking Links](#15-partner-tracking-links)
- [16. Client Conversions](#16-client-conversions)
- [17. Change Password](#17-change-password)
- [18. Client Billing & Invoices](#18-client-billing--invoices)

---

## 1. Admin Profile Update

**Used in:** `app/(admin)/settings/page.tsx` — Save Changes button in the Profile section.

**Current state:** The save button calls a fake `setTimeout`. There is no `PATCH /admins/profile` endpoint in the API docs.

```
PATCH /api/v1/admins/profile
Authorization: Bearer <token>
Content-Type: application/json
```

### Request Body

```json
{
  "firstName": "Sarah",
  "lastName": "Jenkins"
}
```

### Expected Response `200 OK`

```json
{
  "error": false,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "72dbcae4-67dd-4bac-bfe2-643a2baee46d",
      "firstName": "Sarah",
      "lastName": "Jenkins",
      "email": "admin@brdgr.com",
      "role": "admin",
      "isActive": true
    }
  }
}
```

---

## 2. Campaign Performance Policy — GET

**Used in:** `app/(admin)/campaigns/_components/CampaignPoliciesTab.tsx` — loads the SLA policy for a selected active campaign.

**Note:** The URL in the original `admin.api.ts` was wrong (`/performance-policy`). It has been corrected to `/performance/policy` to match the API spec.

```
GET /api/v1/admin/campaigns/{campaignId}/performance/policy
Authorization: Bearer <token>
```

### Expected Response `200 OK`

```json
{
  "error": false,
  "message": "Campaign performance policy retrieved successfully",
  "data": {
    "policy": {
      "minConversionRate": 2.0,
      "maxCpa": 50,
      "minWeeklyConversions": 10,
      "evaluationFrequencyDays": 7,
      "autoPauseOnBreach": true
    }
  }
}
```

---

## 3. Campaign Performance Policy — PUT (Update)

**Used in:** `app/(admin)/campaigns/_components/CampaignPoliciesTab.tsx` — Save Policy button.

```
PUT /api/v1/admin/campaigns/{campaignId}/performance/policy
Authorization: Bearer <token>
Content-Type: application/json
```

### Request Body

```json
{
  "minConversionRate": 2.5,
  "maxCpa": 45,
  "minWeeklyConversions": 15,
  "evaluationFrequencyDays": 7,
  "autoPauseOnBreach": true
}
```

### Expected Response `200 OK`

```json
{
  "error": false,
  "message": "Campaign performance policy updated successfully",
  "data": {
    "policy": {
      "minConversionRate": 2.5,
      "maxCpa": 45,
      "minWeeklyConversions": 15,
      "evaluationFrequencyDays": 7,
      "autoPauseOnBreach": true
    }
  }
}
```

---

## 4. Campaign Performance Evaluate

**Used in:** `app/(admin)/campaigns/_components/CampaignPoliciesTab.tsx` — "Evaluate Now" button triggers an immediate SLA health check.

```
POST /api/v1/admin/campaigns/{campaignId}/performance/evaluate
Authorization: Bearer <token>
```

### No Request Body Required

### Expected Response `200 OK`

```json
{
  "error": false,
  "message": "Campaign performance evaluation triggered successfully",
  "data": {
    "evaluation": {
      "passed": true,
      "currentMetrics": {
        "conversionRate": 3.1,
        "weeklyConversions": 22,
        "cpa": 38.50
      },
      "thresholds": {
        "minConversionRate": 2.0,
        "minWeeklyConversions": 10,
        "maxCpa": 50
      },
      "flags": [],
      "recommendedAction": "none"
    }
  }
}
```

---

## 5. Place Partner on PIP

**Used in:** `app/(admin)/campaigns/_components/CampaignPoliciesTab.tsx` — "Trigger PIP" button.

```
POST /api/v1/admin/campaigns/{campaignId}/performance/pip
Authorization: Bearer <token>
Content-Type: application/json
```

### Request Body

```json
{
  "reason": "Manual admin PIP trigger",
  "durationDays": 7,
  "targetMetrics": {
    "minConversionRate": 2.0,
    "minConversions": 10
  },
  "autoPauseOnFailure": true
}
```

### Expected Response `200 OK`

```json
{
  "error": false,
  "message": "Partner placed on Performance Improvement Plan",
  "data": {
    "success": true,
    "message": "PIP initiated for campaign e15debb8-2289-43bb-a4f6-34c5180d0da8"
  }
}
```

---

## 6. Partner Campaign Performance

**Used in:** `app/(admin)/campaigns/_components/CampaignPerformanceModal.tsx` — per-partner performance breakdown inside a campaign.

```
GET /api/v1/admin/campaigns/partners/{partnerUserId}/performance
Authorization: Bearer <token>
```

### Expected Response `200 OK`

```json
{
  "error": false,
  "message": "Partner campaign performance retrieved successfully",
  "data": {
    "performance": {
      "clicks": 1240,
      "impressions": 45000,
      "conversions": 38,
      "spend": 1520.00,
      "revenue": 4750.00,
      "conversionRate": 3.06,
      "roas": 3.12,
      "status": "active",
      "period": "last_30_days"
    }
  }
}
```

---

## 7. Partner Eligibility Status (Admin)

**Used in:** `app/(admin)/partners/[userId]/page.tsx` — "Campaign Eligibility" card on the partner detail page.

**Current state:** The function `getAdminPartnerEligibility` exists in `admin.api.ts` and is called in the partner detail page. The backend needs to confirm this endpoint is live and returning the correct shape.

```
GET /api/v1/admin/partners/{partnerUserId}/eligibility
Authorization: Bearer <token>
```

### Expected Response `200 OK`

```json
{
  "error": false,
  "message": "Partner eligibility retrieved successfully",
  "data": {
    "isEligible": true,
    "kycApproved": true,
    "vettingApproved": true,
    "hasSocialAccounts": false,
    "reasons": [
      "No social accounts linked — partner cannot be matched to influencer campaigns"
    ]
  }
}
```

---

## 8. KYC Single Record Detail

**Used in:** `app/(admin)/kyc/page.tsx` — "View" button on each KYC row opens a detail drawer that calls `GET /admin/kyc/{kycRecordId}`.

**Current state:** `getKycRecord` is defined in `admin.api.ts` and is now wired to the drawer. The endpoint is listed in the API docs but was previously flagged as unwired in the UI — that is now fixed.

```
GET /api/v1/admin/kyc/{kycRecordId}
Authorization: Bearer <token>
```

### Expected Response `200 OK`

```json
{
  "error": false,
  "message": "KYC record retrieved successfully",
  "data": {
    "kycRecord": {
      "id": "56eb1ad8-3211-4f5f-be34-6c932abcf09a",
      "orgId": "d05796ae-26b1-46f7-8e20-83802a2e8fc9",
      "status": "pending",
      "provider": "SumSub",
      "providerReferenceId": "REF-KYC-2026-98765",
      "decisionNotes": null,
      "submittedAt": "2026-09-18T20:40:52.232Z",
      "decidedAt": null,
      "createdAt": "2026-09-18T20:40:52.232Z",
      "updatedAt": "2026-09-18T20:40:52.232Z"
    }
  }
}
```

> **Note:** The current API returns `{ records: [...] }` from the list endpoint. The single-record endpoint should return `{ kycRecord: {...} }` directly. The UI drawer handles both shapes as a fallback.

---

## 9. Update Client Profile

**Used in:** `BRDRG/src/lib/api/organization.api.ts` — `updateClientProfile` function exists but has no UI wired to it yet.

**Priority:** Low — no settings page exists for clients in the platform yet.

```
PATCH /api/v1/clients
Authorization: Bearer <token>
Content-Type: application/json
```

### Request Body

```json
{
  "firstName": "William",
  "lastName": "Onyejiaka"
}
```

### Expected Response `200 OK`

```json
{
  "error": false,
  "message": "Client profile updated successfully",
  "data": {
    "user": {
      "id": "82023513-6761-40e1-b514-a17392486c80",
      "firstName": "William",
      "lastName": "Onyejiaka",
      "email": "williamonyejiaka2021@gmail.com",
      "role": "client"
    }
  }
}
```

---

## 10. BYOP Accept Invite

**Used in:** `BRDRG/src/lib/api/byop.api.ts` — `acceptByopInvite` exists but no UI page handles the invite acceptance flow.

**Priority:** Medium — partners who receive BYOP invites via email have no way to accept them in the UI.

```
POST /api/v1/byop/accept-invite
Authorization: Bearer <token>
Content-Type: application/json
```

### Request Body

```json
{
  "token": "<invite_token_from_email_link>"
}
```

### Expected Response `200 OK`

```json
{
  "error": false,
  "message": "BYOP invitation accepted successfully",
  "data": {
    "relationship": {
      "relationshipId": "2af4d5ff-a148-4578-b6c5-004c9bde6e32",
      "partner": {
        "id": "52d7ee91-0a60-4dd5-b8b5-2f08a3b96865",
        "firstName": "Alex",
        "lastName": "Morgan"
      },
      "clientOrganization": {
        "id": "d05796ae-26b1-46f7-8e20-83802a2e8fc9",
        "name": "Acme Enterprise Solutions"
      }
    }
  }
}
```

---

## 11. BYOP Validate Token

**Used in:** `BRDRG/src/lib/api/byop.api.ts` — `validateByopToken` exists but no UI page calls it.

**Priority:** Medium — needed before showing the accept-invite page so expired/invalid tokens show an error instead of a broken form.

```
GET /api/v1/byop/accept-invite?token={inviteToken}
Authorization: Bearer <token>
```

### Expected Response `200 OK`

```json
{
  "error": false,
  "message": "Token is valid",
  "data": {
    "valid": true,
    "expiresAt": "2026-10-01T00:00:00.000Z",
    "clientOrganization": {
      "id": "d05796ae-26b1-46f7-8e20-83802a2e8fc9",
      "name": "Acme Enterprise Solutions"
    }
  }
}
```

### Expected Response `400` (invalid/expired token)

```json
{
  "error": true,
  "message": "Invite token is invalid or has expired",
  "data": null
}
```

---

## 12. Partnership Requirements

**Used in:** `BRDRG/src/lib/api/organization.api.ts` — `fetchPartnershipRequirements` exists but no UI page calls it.

**Priority:** Low — would be used on a partner-facing page showing what a client org requires.

```
GET /api/v1/clients/organizations/{orgId}/partnership-requirements
Authorization: Bearer <token>
```

### Expected Response `200 OK`

```json
{
  "error": false,
  "message": "Partnership requirements retrieved successfully",
  "data": {
    "requirements": {
      "requiredPlatforms": ["Instagram", "TikTok"],
      "minFollowers": 50000,
      "minEngagementRate": 3.25,
      "contentTypes": ["Video", "Story"],
      "industryCategory": "FinTech",
      "location": "Nigeria",
      "experienceLevel": "Mid to Senior Creator"
    }
  }
}
```

---

## 13. Analytics Time-Series

**Used in:** `app/(admin)/analytics/page.tsx` — sparkline charts currently use fake/random data because no time-series endpoint exists.

**Priority:** Medium — the analytics page works with real totals but trend charts are visual placeholders.

```
GET /api/v1/admin/analytics/time-series
Authorization: Bearer <token>
```

### Query Parameters

| Param | Type | Required | Description |
|---|---|---|---|
| `metric` | `string` | Yes | One of: `partners`, `organizations`, `byop`, `kyc_submissions` |
| `period` | `string` | No | `7d`, `30d`, `90d` — defaults to `7d` |
| `granularity` | `string` | No | `day`, `week` — defaults to `day` |

### Expected Response `200 OK`

```json
{
  "error": false,
  "message": "Time-series data retrieved successfully",
  "data": {
    "metric": "partners",
    "period": "7d",
    "granularity": "day",
    "series": [
      { "date": "2026-09-17", "value": 2 },
      { "date": "2026-09-18", "value": 1 },
      { "date": "2026-09-19", "value": 3 },
      { "date": "2026-09-20", "value": 0 },
      { "date": "2026-09-21", "value": 4 },
      { "date": "2026-09-22", "value": 1 },
      { "date": "2026-09-23", "value": 2 }
    ],
    "total": 13
  }
}
```

---

## 14. Partner Earnings & Payouts

**Used in:** `BRDRG/src/app/(platform)/dashboard/partner/earnings/page.tsx` — all balance cards show `$0.00` hardcoded.

**Current state:** No earnings API exists anywhere in the codebase or API docs. The page is entirely static.

**Priority:** Critical — this is the core value proposition for partners.

```
GET /api/v1/partners/earnings
Authorization: Bearer <token>
```

### Query Parameters

| Param | Type | Required | Description |
|---|---|---|---|
| `page` | `number` | No | Defaults to 1 |
| `limit` | `number` | No | Defaults to 20 |

### Expected Response `200 OK`

```json
{
  "error": false,
  "message": "Partner earnings retrieved successfully",
  "data": {
    "summary": {
      "nextPayoutAmount": 0,
      "inQaReview": 0,
      "clearedEscrow": 0,
      "scheduled": 0,
      "settledLifetime": 0,
      "currency": "USD"
    },
    "statements": [],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalRecords": 0
    }
  }
}
```

---

## 15. Partner Tracking Links

**Used in:** `BRDRG/src/app/(platform)/dashboard/partner/links/page.tsx` — links are currently fake (`brdgr.io/r/...` constructed locally from partnership history names).

**Current state:** No tracking link API exists. Links are not real attribution URLs.

**Priority:** Critical — without real tracking links, partner attribution is impossible.

```
GET /api/v1/partners/tracking-links
Authorization: Bearer <token>
```

### Expected Response `200 OK`

```json
{
  "error": false,
  "message": "Tracking links retrieved successfully",
  "data": {
    "links": [
      {
        "id": "link-uuid",
        "campaignId": "e15debb8-2289-43bb-a4f6-34c5180d0da8",
        "campaignName": "Q4 FinTech App Launch Campaign",
        "clientName": "Acme Enterprise Solutions",
        "url": "https://brdgr.io/r/abc123xyz",
        "slug": "abc123xyz",
        "clicks": 0,
        "conversions": 0,
        "conversionRate": 0,
        "status": "active",
        "createdAt": "2026-09-22T19:18:24.025Z"
      }
    ],
    "totals": {
      "totalClicks": 0,
      "totalConversions": 0,
      "attributionRate": 0
    }
  }
}
```

---

## 16. Client Conversions

**Used in:** `BRDRG/src/app/(platform)/dashboard/company/conversions/page.tsx` — calls `GET /clients/conversions?orgId=...`.

**Current state:** The API function `fetchConversions` is wired and the page is fully built, but `GET /clients/conversions` is **not documented in any API spec file**. Needs backend confirmation it exists and returns the expected shape.

**Priority:** High — the conversions page is fully built and waiting on this endpoint.

```
GET /api/v1/clients/conversions
Authorization: Bearer <token>
```

### Query Parameters

| Param | Type | Required | Description |
|---|---|---|---|
| `orgId` | `string` | Yes | The organization ID |
| `page` | `number` | No | Defaults to 1 |
| `limit` | `number` | No | Defaults to 50 |

### Expected Response `200 OK`

```json
{
  "error": false,
  "message": "Conversions retrieved successfully",
  "data": {
    "conversions": [
      {
        "id": "cnv-001",
        "partnerId": "partner-uuid",
        "partnerName": "Alex Morgan",
        "partnerType": "IB",
        "campaign": "Q4 FinTech App Launch",
        "type": "CPA",
        "amount": 150.00,
        "currency": "USD",
        "fraudStatus": "Passed",
        "confirmStatus": "Confirmed",
        "date": "2026-09-22T19:18:24.025Z",
        "geo": "NG",
        "ipMasked": "102.89.xxx.xxx",
        "riskScore": 0.12,
        "clickId": "clk_abc123",
        "customerRef": "trader_ref_001",
        "deviceFingerprint": "fp_xyz789"
      }
    ],
    "total": 1
  }
}
```

### Also needed — Approve & Clawback:

```
PATCH /api/v1/clients/conversions/{conversionId}/approve
PATCH /api/v1/clients/conversions/{conversionId}/clawback
Authorization: Bearer <token>
```

---

## 17. Change Password

**Used in:** `BRDRG/src/app/(platform)/dashboard/partner/settings/page.tsx` — Security tab has a password change form but the submit button has no API call wired.

**Priority:** Medium.

```
PATCH /api/v1/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json
```

### Request Body

```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

### Expected Response `200 OK`

```json
{
  "error": false,
  "message": "Password updated successfully",
  "data": null
}
```

---

## 18. Client Billing & Invoices

**Used in:** `BRDRG/src/app/(platform)/dashboard/company/billing/page.tsx` — Invoice History section is an empty placeholder.

**Priority:** Low — billing cycle hasn't started yet per the UI copy.

```
GET /api/v1/clients/billing/invoices
Authorization: Bearer <token>
```

### Query Parameters

| Param | Type | Required | Description |
|---|---|---|---|
| `orgId` | `string` | Yes | The organization ID |
| `page` | `number` | No | Defaults to 1 |
| `limit` | `number` | No | Defaults to 20 |

### Expected Response `200 OK`

```json
{
  "error": false,
  "message": "Invoices retrieved successfully",
  "data": {
    "invoices": [],
    "pagination": {
      "currentPage": 1,
      "totalPages": 0,
      "totalRecords": 0
    }
  }
}
```

---

## Summary Table

| # | Endpoint | Method | Priority | Dashboard | Status |
|---|---|---|---|---|---|
| 1 | `/admins/profile` | `PATCH` | High | Admin | ❌ Not implemented |
| 2 | `/admin/campaigns/{id}/performance/policy` | `GET` | High | Admin | ⚠️ URL fixed in UI |
| 3 | `/admin/campaigns/{id}/performance/policy` | `PUT` | High | Admin | ⚠️ URL fixed in UI |
| 4 | `/admin/campaigns/{id}/performance/evaluate` | `POST` | High | Admin | ❌ Not confirmed live |
| 5 | `/admin/campaigns/{id}/performance/pip` | `POST` | High | Admin | ❌ Not confirmed live |
| 6 | `/admin/campaigns/partners/{partnerUserId}/performance` | `GET` | Medium | Admin | ❌ Not confirmed live |
| 7 | `/admin/partners/{partnerUserId}/eligibility` | `GET` | High | Admin | ⚠️ Confirm live |
| 8 | `/admin/kyc/{kycRecordId}` | `GET` | High | Admin | ⚠️ UI now wired |
| 9 | `/clients` | `PATCH` | Low | Platform | ❌ Not implemented |
| 10 | `/byop/accept-invite` | `POST` | Medium | Platform | ❌ No UI page yet |
| 11 | `/byop/accept-invite` | `GET` | Medium | Platform | ❌ No UI page yet |
| 12 | `/clients/organizations/{orgId}/partnership-requirements` | `GET` | Low | Platform | ❌ No UI page yet |
| 13 | `/admin/analytics/time-series` | `GET` | Medium | Admin | ❌ Not implemented |
| 14 | `/partners/earnings` | `GET` | **Critical** | Partner | ❌ Not implemented |
| 15 | `/partners/tracking-links` | `GET` | **Critical** | Partner | ❌ Not implemented |
| 16 | `/clients/conversions` | `GET` | High | Company | ⚠️ Not in API docs |
| 16 | `/clients/conversions/{id}/approve` | `PATCH` | High | Company | ⚠️ Not in API docs |
| 16 | `/clients/conversions/{id}/clawback` | `PATCH` | High | Company | ⚠️ Not in API docs |
| 17 | `/auth/change-password` | `PATCH` | Medium | Partner | ❌ Not implemented |
| 18 | `/clients/billing/invoices` | `GET` | Low | Company | ❌ Not implemented |
