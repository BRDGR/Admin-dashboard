"use client";

import { useState } from "react";
import Link from "next/link";
import {
  X,
  Building2,
  Mail,
  Copy,
  Check,
  ExternalLink,
  UserCheck,
  UserX,
  Trash2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import type { AdminClientRecord } from "@/lib/types";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteClient } from "@/lib/api/admin.api";
import { formatName } from "./client-columns";

function getInitials(firstName?: string, lastName?: string, email?: string): string {
  if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
  if (firstName) return firstName.slice(0, 2).toUpperCase();
  if (email) return email.slice(0, 2).toUpperCase();
  return "??";
}
import { ClientOrgCard } from "./ClientOrgCard";

interface ClientDetailsDrawerProps {
  client: AdminClientRecord | null;
  onClose: () => void;
}

export function ClientDetailsDrawer({ client, onClose }: ClientDetailsDrawerProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await deleteClient(userId);
      if (!res.ok) throw new Error(res.error || "Failed to delete client");
      return res.data;
    },
    onSuccess: () => {
      toast.success("Client account removed successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "clients"] });
      onClose();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to delete client");
    },
  });

  if (!client) return null;

  const { user, organization: org, partnerProfile: profile } = client;
  const initials = getInitials(user.firstName, user.lastName, user.email);
  const fullName = formatName(user.firstName, user.lastName);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(label);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg h-full shadow-2xl border-l border-slate-200 overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0364FF] flex items-center justify-center font-bold text-sm border border-blue-100/50">
              {initials}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                {fullName}
              </h2>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1">
          {/* Quick Status Bar */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  user.isActive ? "bg-emerald-500" : "bg-slate-400"
                }`}
              />
              <span className="font-semibold text-slate-700">
                {user.isActive ? "Active Account" : "Inactive Account"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#0364FF] font-semibold text-[11px] capitalize">
                {user.role || "Client"}
              </span>
            </div>
          </div>

          {/* Primary Corporate Entity */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#0364FF]" />
                Corporate Entity
              </h3>
              {org && (
                <Link
                  href={`/organizations/${org.id}`}
                  className="text-[11px] font-semibold text-[#0364FF] hover:underline flex items-center gap-1"
                >
                  View Details <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>

            <ClientOrgCard
              org={org}
              copiedId={copiedId}
              onCopy={copyToClipboard}
            />
          </div>

          {/* User Signatory Profile */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Account Signatory Details
            </h3>
            <div className="bg-white border border-slate-200/80 rounded-xl p-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">User ID</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(user.id, "User ID")}
                  className="font-mono text-[11px] text-slate-700 hover:text-[#0364FF] flex items-center gap-1 cursor-pointer"
                >
                  {user.id.slice(0, 18)}...
                  {copiedId === "User ID" ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3 text-slate-400" />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Email Address</span>
                <a
                  href={`mailto:${user.email}`}
                  className="text-[#0364FF] hover:underline font-medium flex items-center gap-1"
                >
                  <Mail className="w-3 h-3 text-slate-400" />
                  {user.email}
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Email Verification</span>
                <span
                  className={`font-semibold flex items-center gap-1 text-[11px] ${
                    user.emailVerifiedAt ? "text-emerald-600" : "text-amber-600"
                  }`}
                >
                  {user.emailVerifiedAt ? (
                    <>
                      <UserCheck className="w-3 h-3" /> Verified
                    </>
                  ) : (
                    <>
                      <UserX className="w-3 h-3" /> Unverified
                    </>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Account Registered</span>
                <span className="text-slate-700">
                  {user.createdAt ? format(new Date(user.createdAt), "PPP") : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Optional Industry / Specialization Context if Available */}
          {profile?.industries && profile.industries.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Industry Sectors
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {profile.industries.map((ind) => (
                  <span
                    key={ind}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-[#0364FF]"
                  >
                    {ind}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Danger Zone: Delete Client */}
          <div className="pt-4 border-t border-slate-100">
            <div className="bg-rose-50/60 border border-rose-200/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-rose-800 font-semibold text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Account Administration</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Permanently revoke platform access and remove this client user record from the database.
              </p>

              {confirmDelete ? (
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => deleteMutation.mutate(user.id)}
                    disabled={deleteMutation.isPending}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors shadow-xs cursor-pointer"
                  >
                    {deleteMutation.isPending ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" /> Confirm Delete
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    disabled={deleteMutation.isPending}
                    className="h-8 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="w-full inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-xl border border-rose-200 bg-white text-rose-600 text-xs font-semibold hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Client Account
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
