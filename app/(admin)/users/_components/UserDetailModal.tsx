"use client";

import { X, User, ExternalLink, Copy, Shield, Calendar, Check } from "lucide-react";
import { format } from "date-fns";
import { Button, StatusBadge, UserAvatarCell } from "@/components/ui";
import type { AdminUser } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface UserDetailModalProps {
  user: AdminUser | null;
  onClose: () => void;
  onDeleteRequest?: (user: AdminUser) => void;
}

const ROLE_BADGE: Record<string, string> = {
  partner: "bg-violet-50 text-violet-700 border-violet-200/70",
  client: "bg-blue-50 text-blue-700 border-blue-200/70",
  admin: "bg-rose-50 text-rose-700 border-rose-200/70",
  ops_admin: "bg-amber-50 text-amber-700 border-amber-200/70",
};

export function UserDetailModal({ user, onClose, onDeleteRequest }: UserDetailModalProps) {
  const router = useRouter();
  const [copiedId, setCopiedId] = useState(false);

  if (!user) return null;

  const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "User";

  const handleCopyId = () => {
    navigator.clipboard.writeText(user.id);
    setCopiedId(true);
    toast.success("User ID copied to clipboard");
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md mx-auto overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#0364FF]" />
            <div>
              <p className="text-sm font-bold text-slate-900">User Profile Dossier</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Platform account details & permissions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <UserAvatarCell name={fullName} subtitle={user.email} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
              <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">Role</span>
              <span
                className={cn(
                  "inline-flex items-center px-2 py-0.5 mt-1 rounded-full text-[11px] font-semibold border capitalize",
                  ROLE_BADGE[user.role] ?? "bg-slate-50 text-slate-600 border-slate-200"
                )}
              >
                {user.role.replace("_", " ")}
              </span>
            </div>
            <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
              <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">Status</span>
              <div className="mt-1">
                <StatusBadge status={user.isActive ? "active" : "offline"} />
              </div>
            </div>
          </div>

          <div className="space-y-2 border-y border-slate-100 py-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">User ID</span>
              <div className="flex items-center gap-1.5 font-mono text-slate-700">
                <span>{user.id ? user.id.slice(0, 16) + "..." : "—"}</span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {copiedId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Registered On</span>
              <span className="text-slate-700">
                {user.createdAt ? format(new Date(user.createdAt), "MMM d, yyyy · h:mm a") : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Email Verified</span>
              <span className={user.emailVerifiedAt ? "text-emerald-600 font-medium" : "text-slate-400 font-medium"}>
                {user.emailVerifiedAt ? format(new Date(user.emailVerifiedAt), "MMM d, yyyy") : "Unverified"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            {user.role === "partner" && (
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => {
                  onClose();
                  router.push(`/partners/${user.id}`);
                }}
              >
                <ExternalLink className="w-3.5 h-3.5 mr-1" /> Open Partner Dossier
              </Button>
            )}
            {user.role === "client" && (
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => {
                  onClose();
                  router.push(`/clients`);
                }}
              >
                <ExternalLink className="w-3.5 h-3.5 mr-1" /> Open Client Management
              </Button>
            )}
            {user.role !== "partner" && user.role !== "client" && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  onClose();
                  router.push(`/staff`);
                }}
              >
                <Shield className="w-3.5 h-3.5 mr-1" /> Open Staff Console
              </Button>
            )}
            {onDeleteRequest && (
              <Button
                variant="danger"
                onClick={() => {
                  onClose();
                  onDeleteRequest(user);
                }}
              >
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
