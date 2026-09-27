// ─── Modular Admin API Surface ────────────────────────────────────────────────
// Split into domain-specific sub-modules, each under 250 lines of code:
// - partners.api.ts: Partners & BYOP
// - organizations.api.ts: Organizations & Org status
// - kyc.api.ts: Organization & Partner KYC
// - users.api.ts: Users, Staff, Admin Profile, Seed History
// - notifications.api.ts: Notifications CRM
// - campaigns.api.ts: Admin Campaign Queue, Matches, Performance & PIP
// - directory.api.ts: Directory Contacts CRM
// - pending-changes.api.ts: Maker-Checker Pending Changes
// - clients.api.ts: Clients Management with Corporate Entity Enrichment

export * from "./partners.api";
export * from "./organizations.api";
export * from "./kyc.api";
export * from "./users.api";
export * from "./notifications.api";
export * from "./campaigns.api";
export * from "./directory.api";
export * from "./pending-changes.api";
export * from "./clients.api";
