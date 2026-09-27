import { format } from "date-fns";
import { StatusBadge } from "@/components/ui";
import type { WaitlistEntry } from "@/lib/types";

const COLUMNS = ["Name", "Email", "Role", "Company", "Looking For", "Status", "Joined"];

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-50">
      {COLUMNS.map((c) => (
        <td key={c} className="px-5 py-3.5">
          <div className="h-3.5 bg-slate-100 rounded-full animate-pulse w-24" />
        </td>
      ))}
    </tr>
  );
}

interface WaitlistTableProps {
  entries: WaitlistEntry[];
  totalCount: number;
  isLoading: boolean;
}

export function WaitlistTable({ entries, totalCount, isLoading }: WaitlistTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/60">
            {COLUMNS.map((h) => (
              <th key={h} className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-5 py-3 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
          ) : entries.length === 0 ? (
            <tr>
              <td colSpan={COLUMNS.length} className="px-5 py-16 text-center text-sm text-slate-400">
                {totalCount === 0 ? "No waitlist entries yet." : "No results match your search."}
              </td>
            </tr>
          ) : (
            entries.map((entry) => (
              <tr key={entry.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                <td className="px-5 py-3.5 font-medium text-slate-900 whitespace-nowrap">{entry.fullName}</td>
                <td className="px-5 py-3.5 text-slate-600 text-xs">{entry.email}</td>
                <td className="px-5 py-3.5 text-slate-600 text-xs capitalize">{entry.role}</td>
                <td className="px-5 py-3.5 text-slate-600 text-xs">{entry.company || "—"}</td>
                <td className="px-5 py-3.5 text-slate-600 text-xs max-w-[160px] truncate">{entry.lookingFor || "—"}</td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={entry.status} />
                </td>
                <td className="px-5 py-3.5 text-slate-500 text-xs whitespace-nowrap">
                  {format(new Date(entry.createdAt), "MMM d, yyyy")}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Footer count */}
      {!isLoading && entries.length > 0 && (
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/40">
          <p className="text-[11px] text-slate-400">
            Showing <span className="font-semibold text-slate-600">{entries.length}</span> of{" "}
            <span className="font-semibold text-slate-600">{totalCount}</span> entries
          </p>
        </div>
      )}
    </div>
  );
}
