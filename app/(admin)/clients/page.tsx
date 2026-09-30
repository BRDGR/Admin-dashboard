"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Search,
  CheckCircle2,
  Building2,
  ShieldCheck,
} from "lucide-react";
import { AdminTopBar } from "@/components/layout";
import {
  SectionCard,
  DataTable,
  MetricCard,
  Pagination,
  EmptyState,
} from "@/components/ui";
import { listClients } from "@/lib/api/admin.api";
import type { AdminClientRecord } from "@/lib/types";
import { ClientDetailsDrawer } from "./_components/ClientDetailsDrawer";
import { getClientColumns } from "./_components/client-columns";
import { cn } from "@/lib/utils";

type FilterTab = "all" | "active" | "inactive" | "with_company" | "without_company" | "verified";

export default function ClientsAdminPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [selectedClient, setSelectedClient] = useState<AdminClientRecord | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "clients", page],
    queryFn: async () => {
      const res = await listClients(page, 15);
      return res.data?.data;
    },
  });

  const clients: AdminClientRecord[] = useMemo(() => {
    if (!data) return [];
    return data.clients ?? data.records ?? data.partners ?? [];
  }, [data]);

  const pagination = data?.pagination;

  // Filter clients
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      // Tab filter
      if (filterTab === "active" && !c.user?.isActive) return false;
      if (filterTab === "inactive" && c.user?.isActive) return false;
      if (filterTab === "with_company" && !c.organization) return false;
      if (filterTab === "without_company" && c.organization) return false;
      if (filterTab === "verified" && !c.organization?.isVerified) return false;

      // Text search
      if (!search.trim()) return true;
      const query = search.toLowerCase();
      const fullName = `${c.user?.firstName ?? ""} ${c.user?.lastName ?? ""}`.toLowerCase();
      const email = (c.user?.email ?? "").toLowerCase();
      const orgName = (c.organization?.name ?? "").toLowerCase();
      const companyType = (c.organization?.companyType ?? "").toLowerCase();
      const country = (c.organization?.country ?? "").toLowerCase();

      return (
        fullName.includes(query) ||
        email.includes(query) ||
        orgName.includes(query) ||
        companyType.includes(query) ||
        country.includes(query)
      );
    });
  }, [clients, search, filterTab]);

  // Aggregate metrics
  const totalCount = pagination?.totalRecords ?? clients.length;
  const activeCount = clients.filter((c) => c.user?.isActive).length;
  const linkedCompanyCount = clients.filter((c) => Boolean(c.organization)).length;
  const unlinkedCount = clients.filter((c) => !c.organization).length;
  const verifiedOrgCount = clients.filter((c) => Boolean(c.organization?.isVerified)).length;

  const columns = useMemo(
    () => getClientColumns({ onSelectClient: setSelectedClient }),
    []
  );

  const filterTabs: [FilterTab, string, number][] = [
    ["all", "All", clients.length],
    ["active", "Active", activeCount],
    ["inactive", "Inactive", clients.length - activeCount],
    ["with_company", "With Company", linkedCompanyCount],
    ["without_company", "Unlinked", unlinkedCount],
    ["verified", "Verified KYC", verifiedOrgCount],
  ];

  return (
    <div className="space-y-6">
      <AdminTopBar
        title="Clients Management"
        subtitle="Registered enterprise clients, organizations, and corporate partners"
      />

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Clients"
          value={totalCount}
          icon={Users}
          iconBg="bg-blue-50 text-[#0364FF]"
        />
        <MetricCard
          label="Active Accounts"
          value={activeCount}
          icon={CheckCircle2}
          iconBg="bg-emerald-50 text-emerald-600"
        />
        <MetricCard
          label="Corporate Entities"
          value={linkedCompanyCount}
          icon={Building2}
          iconBg="bg-purple-50 text-purple-600"
        />
        <MetricCard
          label="Verified Organizations"
          value={verifiedOrgCount}
          icon={ShieldCheck}
          iconBg="bg-amber-50 text-amber-600"
        />
      </div>

      {/* Main Table Card */}
      <SectionCard
        title="Registered Clients"
        subtitle={`${filteredClients.length} client accounts found`}
        action={
          <div className="flex items-center gap-1 bg-slate-100 rounded-full p-1 overflow-x-auto max-w-full">
            {filterTabs.map(([tabKey, tabLabel, count]) => (
              <button
                key={tabKey}
                onClick={() => setFilterTab(tabKey)}
                className={cn(
                  "px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5",
                  filterTab === tabKey
                    ? "bg-white text-slate-900 shadow-xs font-semibold"
                    : "text-slate-500 hover:text-slate-800"
                )}
              >
                <span>{tabLabel}</span>
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded-full",
                    filterTab === tabKey
                      ? "bg-slate-100 text-slate-700"
                      : "bg-slate-200/60 text-slate-500"
                  )}
                >
                  {count}
                </span>
              </button>
            ))}
          </div>
        }
      >
        <DataTable
          columns={columns}
          data={filteredClients}
          isLoading={isLoading}
          emptyMessage={
            search.trim()
              ? "No client accounts match your search criteria."
              : "No enterprise clients registered yet."
          }
          selectable={true}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          getRowId={(c, i) => c.user?.id || c.organization?.id || String(i)}
          itemLabel="Clients"
          searchPlaceholder="Search Clients"
          searchValue={search}
          onSearchChange={setSearch}
          showFilterButton={true}
          onFilterClick={() => {}}
          pagination={pagination}
          onPageChange={setPage}
        />
      </SectionCard>

      {/* Client Details Drawer */}
      <ClientDetailsDrawer
        client={selectedClient}
        onClose={() => setSelectedClient(null)}
      />
    </div>
  );
}
