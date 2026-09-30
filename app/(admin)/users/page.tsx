"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Eye, Copy, ExternalLink, Plus, SlidersHorizontal, UserPlus, Trash2, AlertTriangle } from "lucide-react";
import { AdminTopBar } from "@/components/layout";
import {
  DataTable,
  StatusBadge,
  TableActionButton,
  UserAvatarCell,
  Button,
  type Column,
} from "@/components/ui";
import { useUsers, useDeleteClient } from "@/lib/hooks/useUsers";
import { useDeletePartner } from "@/lib/hooks/usePartners";
import { useQueryClient } from "@tanstack/react-query";
import type { AdminUser } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AddUserModal } from "./_components/AddUserModal";
import { DeleteUserModal } from "./_components/DeleteUserModal";
import { UserDetailModal } from "./_components/UserDetailModal";

const ROLE_FILTERS = ["all", "partner", "client", "admin", "ops_admin"] as const;
type RoleFilter = typeof ROLE_FILTERS[number];

const ROLE_BADGE: Record<string, string> = {
  partner: "bg-violet-50 text-violet-700 border-violet-200/70",
  client: "bg-blue-50 text-blue-700 border-blue-200/70",
  admin: "bg-rose-50 text-rose-700 border-rose-200/70",
  ops_admin: "bg-amber-50 text-amber-700 border-amber-200/70",
};

export default function UsersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const { data, isLoading } = useUsers(page, pageSize);
  const { mutateAsync: deletePartnerMutate } = useDeletePartner();
  const { mutateAsync: deleteClientMutate } = useDeleteClient();

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

  async function handleBulkDelete() {
    try {
      setIsBulkDeleting(true);
      const allUsers = data?.users ?? [];
      const targetUsersToDelete = allUsers.filter(
        (u) => selectedIds.includes(u.id) && (u.role === "partner" || u.role === "client")
      );

      if (targetUsersToDelete.length === 0) {
        toast.info("Only partner and client accounts can be directly deleted. Administrative accounts must be managed from the Staff console.");
        setBulkDeleteConfirm(false);
        return;
      }

      for (const targetUser of targetUsersToDelete) {
        if (targetUser.role === "partner") {
          await deletePartnerMutate(targetUser.id);
        } else if (targetUser.role === "client") {
          await deleteClientMutate(targetUser.id);
        }
      }

      toast.success(`Successfully removed ${targetUsersToDelete.length} account(s).`);
      setSelectedIds([]);
      setBulkDeleteConfirm(false);
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to delete selected users.");
    } finally {
      setIsBulkDeleting(false);
    }
  }

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
        <div className="flex items-center justify-end gap-1.5">
          <TableActionButton
            icon={<Eye className="w-3.5 h-3.5" />}
            label="Details"
            variant="outline"
            onClick={() => setSelectedUser(user)}
          />
          {(user.role === "partner" || user.role === "client") ? (
            <TableActionButton
              icon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
              label="Delete"
              variant="danger"
              onClick={() => setUserToDelete(user)}
            />
          ) : null}
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

      {/* Modern High-Fidelity Table */}
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
        primaryAction={{
          label: "Add Member",
          icon: <UserPlus className="w-3.5 h-3.5" />,
          onClick: () => setShowAddModal(true),
        }}
        pagination={data?.pagination}
        onPageChange={setPage}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        bulkActions={
          <TableActionButton
            icon={<Trash2 className="w-3.5 h-3.5 text-red-500" />}
            label={`Delete Selected (${selectedIds.length})`}
            variant="danger"
            onClick={() => setBulkDeleteConfirm(true)}
          />
        }
      />

      {/* Modals & Dialogs */}
      {showAddModal && (
        <AddUserModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
      )}

      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onDeleteRequest={(u) => setUserToDelete(u)}
        />
      )}

      {userToDelete && (
        <DeleteUserModal
          user={userToDelete}
          onClose={() => setUserToDelete(null)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
          }}
        />
      )}

      {bulkDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-100 p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Delete {selectedIds.length} Accounts?</h3>
              <p className="text-xs text-slate-500 mt-1">
                This will execute account deletion across the selected records. Any partner accounts in this selection will be permanently removed.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkDeleteConfirm(false)}
                disabled={isBulkDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={isBulkDeleting}
                onClick={handleBulkDelete}
              >
                Delete Selected
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
