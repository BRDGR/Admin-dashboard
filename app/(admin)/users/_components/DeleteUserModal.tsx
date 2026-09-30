"use client";

import { AlertTriangle, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui";
import { useDeletePartner } from "@/lib/hooks/usePartners";
import { useDeleteClient } from "@/lib/hooks/useUsers";
import type { AdminUser } from "@/lib/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface DeleteUserModalProps {
  user: AdminUser | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DeleteUserModal({ user, onClose, onSuccess }: DeleteUserModalProps) {
  const router = useRouter();
  const { mutate: deletePartnerMutate, isPending: isDeletingPartner } = useDeletePartner();
  const { mutate: deleteClientMutate, isPending: isDeletingClient } = useDeleteClient();

  if (!user) return null;

  const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "User";
  const isPending = isDeletingPartner || isDeletingClient;
  const isStaffAccount = user.role === "admin" || user.role === "ops_admin" || user.role === "super_admin";

  function handleConfirm() {
    if (!user) return;

    if (user.role === "partner") {
      deletePartnerMutate(user.id, {
        onSuccess: () => {
          onSuccess?.();
          onClose();
        },
      });
    } else if (user.role === "client") {
      deleteClientMutate(user.id, {
        onSuccess: () => {
          onSuccess?.();
          onClose();
        },
      });
    } else {
      toast.info("Administrative staff accounts are managed from the Staff console.");
      onClose();
      router.push("/staff");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-100 p-6 space-y-4">
        <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
          {isStaffAccount ? <ShieldAlert className="w-5 h-5 text-amber-600" /> : <AlertTriangle className="w-5 h-5" />}
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            {isStaffAccount ? "Manage Staff Account" : "Delete Account?"}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {isStaffAccount ? (
              <>
                <span className="font-semibold text-slate-800">{fullName}</span> ({user.email}) is an administrative account with role{" "}
                <span className="font-semibold text-slate-700 capitalize">"{user.role.replace(/_/g, " ")}"</span>. Administrative credentials must be managed from the Staff console.
              </>
            ) : (
              <>
                Are you sure you want to permanently remove <span className="font-semibold text-slate-800">{fullName}</span> ({user.email})?
                {user.role === "partner"
                  ? " This will permanently delete the partner profile, performance metrics, and pending invitations from the platform."
                  : " This will permanently delete the client user record and revoke their platform access."}
              </>
            )}
          </p>
        </div>
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          {isStaffAccount ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onClose();
                router.push("/staff");
              }}
            >
              Open Staff Console
            </Button>
          ) : (
            <Button variant="danger" size="sm" isLoading={isPending} onClick={handleConfirm}>
              Confirm Deletion
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
