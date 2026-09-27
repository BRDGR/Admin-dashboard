import { Users, Clock, CheckCircle2, XCircle } from "lucide-react";
import { StatCard } from "@/components/ui";

interface WaitlistStatsProps {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

const STATS = (s: WaitlistStatsProps) => [
  { label: "Total Signups", value: s.total,    icon: Users,         iconClass: "bg-blue-50 text-[#0364FF]" },
  { label: "Pending",       value: s.pending,  icon: Clock,         iconClass: "bg-amber-50 text-amber-600" },
  { label: "Approved",      value: s.approved, icon: CheckCircle2,  iconClass: "bg-green-50 text-green-600" },
  { label: "Rejected",      value: s.rejected, icon: XCircle,       iconClass: "bg-red-50 text-red-500" },
];

export function WaitlistStats(props: WaitlistStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {STATS(props).map((s) => (
        <StatCard key={s.label} {...s} />
      ))}
    </div>
  );
}
