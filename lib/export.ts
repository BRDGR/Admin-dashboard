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
  a.click();
  URL.revokeObjectURL(url);
}
