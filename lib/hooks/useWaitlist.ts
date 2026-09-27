import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { WaitlistEntry } from "@/lib/types";

async function fetchWaitlist(): Promise<WaitlistEntry[]> {
  const res = await fetch("/api/waitlist");
  if (!res.ok) throw new Error("Failed to load waitlist");
  const json = await res.json();
  return json.data || [];
}

export function useWaitlist() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: entries = [], isLoading, isFetching, refetch } = useQuery<WaitlistEntry[]>({
    queryKey: ["admin", "waitlist"],
    queryFn: fetchWaitlist,
  });

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        e.fullName.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.company.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || e.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [entries, search, statusFilter]);

  const stats = useMemo(() => ({
    total:    entries.length,
    pending:  entries.filter((e) => e.status === "pending").length,
    approved: entries.filter((e) => e.status === "approved").length,
    rejected: entries.filter((e) => e.status === "rejected").length,
  }), [entries]);

  return {
    entries, filtered, stats,
    isLoading, isFetching,
    search, setSearch,
    statusFilter, setStatusFilter,
    refetch,
  };
}
