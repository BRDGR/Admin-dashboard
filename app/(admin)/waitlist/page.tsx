"use client";

import { AdminTopBar } from "@/components/layout";
import { SectionCard } from "@/components/ui";
import { WaitlistStats, WaitlistTable, WaitlistToolbar } from "@/components/waitlist";
import { useWaitlist } from "@/lib/hooks/useWaitlist";
import { exportWaitlistCSV } from "@/lib/export";

export default function WaitlistPage() {
  const {
    filtered, stats,
    isLoading, isFetching,
    search, setSearch,
    statusFilter, setStatusFilter,
    refetch,
  } = useWaitlist();

  return (
    <div className="space-y-6">
      <AdminTopBar />
      <WaitlistStats {...stats} />
      <SectionCard title="Waitlist Signups" subtitle="All submissions from the landing page">
        <WaitlistToolbar
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          onRefresh={refetch}
          onExport={() => exportWaitlistCSV(filtered)}
          isFetching={isFetching}
          exportDisabled={filtered.length === 0}
        />
        <WaitlistTable entries={filtered} totalCount={stats.total} isLoading={isLoading} />
      </SectionCard>
    </div>
  );
}
