"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { AdminTopBar } from "@/components/layout";
import { SectionCard, DataTable, StatusBadge, Pagination } from "@/components/ui";
import { useUsers } from "@/lib/hooks/useUsers";
import type { AdminUser } from "@/lib/types";
import type { Column } from "@/components/ui";
import { cn } from "@/lib/utils";

const ROLE_FILTERS = ["all", "partner", "client", "admin", "ops_admin"] as const;
type RoleFilter = typeof ROLE_FILTERS[number];

const ROLE_BADGE: Record<string, string> = {
  partner:   "bg-violet-50 text-violet-700 border-violet-200",
  client:    "bg-blue-50 text-blue-700 border-blue-200",
  admin:     "bg-rose-50 text-rose-700 border-rose-200",
  ops_admin: "bg-amber-50 text-amber-700 border-amber-200",
};

const COLUMNS: Column<AdminUser>[] = [
  {
    key: "name", header: "User",
    render: (user) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0">
          {user.firstName[0]}
        </div>
        <div>
          <p className="text-[13px] font-semibold text-slate-900">{user.firstName} {user.lastName}</p>
          <p className="text-[11px] text-slate-400">{user.email}</p>
        </div>
      </div>
    ),
  },
  {
    key: "role", header: "Role",
    render: (user) => (
      <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border capitalize", ROLE_BADGE[user.role] ?? "bg-slate-50 text-slate-600 border-slate-200")}>
        {user.role.replace("_", " ")}
      </span>
    ),
  },
  {
    key: "status", header: "Status",
    render: (user) => <StatusBadge status={user.isActive ? "active" : "inactive"} />,
  },
  {
    key: "verified", header: "Email Verified",
    render: (user) => (
      <span className={`text-xs font-medium ${user.emailVerifiedAt ? "text-green-600" : "text-slate-400"}`}>
        {user.emailVerifiedAt ? format(new Date(user.emailVerifiedAt), "MMM d, yyyy") : "Not verified"}
      </span>
    ),
  },
  {
    key: "joined", header: "Joined",
    render: (user) => <span className="text-xs text-slate-400">{format(new Date(user.createdAt), "MMM d, yyyy")}</span>,
  },
];

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const { data, isLoading } = useUsers(page, 20);

  const filtered = useMemo(() => {
    if (roleFilter === "all") return data?.users ?? [];
    return (data?.users ?? []).filter((u) => u.role === roleFilter);
  }, [data, roleFilter]);

  return (
    <div className="space-y-6">
      <AdminTopBar title="Users" subtitle="All registered users across the platform" />

      <SectionCard
        title="User Directory"
        subtitle={`${data?.pagination.totalRecords ?? 0} total users`}
        action={
          <div className="flex items-center gap-1 bg-slate-100 rounded-full p-1">
            {ROLE_FILTERS.map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={cn(
                  "px-3 py-1 rounded-full text-[11px] font-medium capitalize transition-all cursor-pointer",
                  roleFilter === r ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-700"
                )}
              >
                {r.replace("_", " ")}
              </button>
            ))}
          </div>
        }
      >
        <DataTable columns={COLUMNS} data={filtered} isLoading={isLoading} emptyMessage="No users found." />
        {data?.pagination && <Pagination pagination={data.pagination} onPageChange={setPage} />}
      </SectionCard>
    </div>
  );
}
