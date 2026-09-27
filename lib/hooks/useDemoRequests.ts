import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { DemoRequest } from "@/lib/types";

async function fetchDemoRequests(): Promise<DemoRequest[]> {
  const res = await fetch("/api/demo");
  if (!res.ok) throw new Error("Failed to load demo requests");
  const json = await res.json();
  return json.data || [];
}

export function useDemoRequests() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: entries = [], isLoading, isFetching, refetch } = useQuery<DemoRequest[]>({
    queryKey: ["admin", "demo-requests"],
    queryFn: fetchDemoRequests,
  });

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        e.email.toLowerCase().includes(q) ||
        e.companyName.toLowerCase().includes(q) ||
        e.companyType.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || e.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [entries, search, statusFilter]);

  const stats = useMemo(() => ({
    total:            entries.length,
    pending_schedule: entries.filter((e) => e.status === "pending_schedule").length,
    scheduled:        entries.filter((e) => e.status === "scheduled").length,
    completed:        entries.filter((e) => e.status === "completed").length,
  }), [entries]);

  return {
    entries, filtered, stats,
    isLoading, isFetching,
    search, setSearch,
    statusFilter, setStatusFilter,
    refetch,
  };
}
