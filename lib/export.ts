import { format } from "date-fns";
import type { WaitlistEntry } from "./types";

export function exportWaitlistCSV(entries: WaitlistEntry[]) {
  const headers = ["Name", "Email", "Role", "Company", "Looking For", "Status", "Joined"];
  const rows = entries.map((e) => [
    e.fullName, e.email, e.role, e.company, e.lookingFor, e.status,
    format(new Date(e.createdAt), "yyyy-MM-dd"),
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `waitlist-${format(new Date(), "yyyy-MM-dd")}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export interface PayoutBatchExportRow {
  partnerId: string;
  name: string;
  tier: string;
  multiplier: number;
  score: number;
  finalPayoutUsd: number;
  holdbackUsd: number;
  status: string;
}

export function exportPayoutBatchCSV(
  campaignName: string,
  rows: PayoutBatchExportRow[],
  invariantPassed: boolean
) {
  const headers = [
    "Partner ID",
    "Partner Name",
    "Performance Tier",
    "Multiplier",
    "Score (0-100)",
    "Net Payout (USD)",
    "Holdback Retained (USD)",
    "Status",
    "Hamilton Invariant Verified",
  ];

  const dataRows = rows.map((r) => [
    r.partnerId,
    r.name,
    r.tier,
    `${r.multiplier.toFixed(2)}x`,
    r.score.toFixed(1),
    `$${r.finalPayoutUsd.toFixed(2)}`,
    `$${r.holdbackUsd.toFixed(2)}`,
    r.status,
    invariantPassed ? "YES (∑ Payouts == Pool)" : "FAILED",
  ]);

  const csv = [headers, ...dataRows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const sanitizedName = campaignName.toLowerCase().replace(/[^a-z0-9]/g, "-");
  a.href = url;
  a.download = `payout-batch-${sanitizedName}-${format(new Date(), "yyyy-MM-dd")}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

