"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Trash2, Edit3, Plus, SlidersHorizontal, UserPlus } from "lucide-react";
import { AdminTopBar } from "@/components/layout";
import {
  DataTable,
  StatusBadge,
  TableActionButton,
  UserAvatarCell,
  type Column,
} from "@/components/ui";
import { useUsers } from "@/lib/hooks/useUsers";
import type { AdminUser } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ROLE_FILTERS = ["all", "partner", "client", "admin", "ops_admin"] as const;
type RoleFilter = typeof ROLE_FILTERS[number];

const ROLE_BADGE: Record<string, string> = {
  partner: "bg-violet-50 text-violet-700 border-violet-200/70",
  client: "bg-blue-50 text-blue-700 border-blue-200/70",
  admin: "bg-rose-50 text-rose-700 border-rose-200/70",
  ops_admin: "bg-amber-50 text-amber-700 border-amber-200/70",
};

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data, isLoading } = useUsers(page, pageSize);

  const filtered = useMemo(() => {
    let list = data?.users ?? [];
    if (roleFilter !== "all") {
      list = list.filter((u) => u.role === roleFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (u) =>
          u.firstName?.toLowerCase().includes(q) ||
          u.lastName?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.role?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [data, roleFilter, searchQuery]);

  const columns: Column<AdminUser>[] = [
    {
      key: "name",
      header: "Name",
      render: (user) => {
        const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "User";
        return (
          <UserAvatarCell
            name={fullName}
          />
        );
      },
    },
    {
      key: "email",
      header: "Email",
      render: (user) => (
        <span className="text-xs text-slate-600 font-normal">{user.email}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (user) => (
        <StatusBadge status={user.isActive ? "active" : "offline"} />
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (user) => (
        <span
          className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border capitalize",
            ROLE_BADGE[user.role] ?? "bg-slate-50 text-slate-600 border-slate-200"
          )}
        >
          {user.role.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      key: "joined",
      header: "Last Active",
      render: (user) => (
        <span className="text-xs text-slate-500 whitespace-nowrap">
          {format(new Date(user.createdAt), "MMM d, yyyy")}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (user) => (
        <div className="flex items-center justify-end gap-2">
          <TableActionButton
            icon={<Trash2 className="w-3.5 h-3.5" />}
            label="Delete"
            variant="danger"
            onClick={() => {
              toast.info(`Delete action clicked for ${user.email}`);
            }}
          />
          <TableActionButton
            icon={<Edit3 className="w-3.5 h-3.5" />}
            label="Edit"
            onClick={() => {
              toast.info(`Edit action clicked for ${user.email}`);
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminTopBar
        title="Users & Team"
        subtitle="Manage all registered platform users, roles, and status"
      />

      {/* Role Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {ROLE_FILTERS.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRoleFilter(r)}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer",
              roleFilter === r
                ? "bg-slate-900 text-white shadow-2xs"
                : "bg-white border border-slate-200/90 text-slate-600 hover:bg-slate-50"
            )}
          >
            {r.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Modern High-Fidelity Table matching screenshot */}
      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        emptyMessage="No users found matching your filters."
        selectable={true}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        itemLabel="Members"
        searchPlaceholder="Search Members"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        showFilterButton={true}
        onFilterClick={() => {
          toast.info("Filter options drawer");
        }}
        primaryAction={{
          label: "Add Members",
          icon: <UserPlus className="w-3.5 h-3.5" />,
          onClick: () => {
            toast.info("Add Member modal");
          },
        }}
        pagination={data?.pagination}
        onPageChange={setPage}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        bulkActions={
          <TableActionButton
            icon={<Trash2 className="w-3.5 h-3.5 text-red-500" />}
            label="Delete Selected"
            variant="danger"
            onClick={() => {
              toast.warning(`Delete ${selectedIds.length} users requested`);
            }}
          />
        }
      />
    </div>
  );
}
