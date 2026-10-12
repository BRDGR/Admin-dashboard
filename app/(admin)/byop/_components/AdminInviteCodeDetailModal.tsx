"use client";

import { useQuery } from "@tanstack/react-query";
import { getAdminInviteCode } from "@/lib/api/admin.api";
import {
  X,
  Copy,
  Check,
  Building2,
  Calendar,
  Users,
  Shield,
  Loader2,
  AlertCircle,
  Hash,
} from "lucide-react";
import { StatusBadge, Button } from "@/components/ui";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";

interface AdminInviteCodeDetailModalProps {
  codeId: string | null;
  onClose: () => void;
}

export function AdminInviteCodeDetailModal({
  codeId,
  onClose,
}: AdminInviteCodeDetailModalProps) {
  const [copied, setCopied] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "invite-code-detail", codeId],
    queryFn: async () => {
      if (!codeId) return null;
      const res = await getAdminInviteCode(codeId);
      if (res.error) throw new Error(res.error);
      const raw = res.data as any;
      return (raw?.data?.inviteCode || raw?.inviteCode || raw?.data || raw) as any;
    },
    enabled: Boolean(codeId),
  });

  if (!codeId) return null;

  const item = data;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Invite code copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0364FF] flex items-center justify-center font-bold">
              <Hash className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Invite Code Details</h3>
              <p className="text-[11px] text-slate-400 font-mono">ID: {codeId.slice(0, 16)}...</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-[#0364FF]" />
              <p className="text-xs">Loading invite code details...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-red-900">Failed to load code details</p>
                <p className="text-[11px] text-red-600 mt-0.5">{(error as Error).message}</p>
                <Button variant="outline" size="sm" className="mt-2 text-xs" onClick={() => refetch()}>
                  Retry
                </Button>
              </div>
            </div>
          ) : item ? (
            <>
              {/* Highlight Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Redemption Code</p>
                  <p className="text-lg font-mono font-bold text-slate-900 mt-0.5">{item.code || "—"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={item.status || (item.isActive ? "active" : "inactive")} />
                  {item.code && (
                    <button
                      type="button"
                      onClick={() => handleCopy(item.code)}
                      className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-colors cursor-pointer shadow-2xs"
                      title="Copy Code"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Grid Metadata */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-slate-100 bg-white">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium">
                    <Building2 className="w-3.5 h-3.5" /> Organization
                  </div>
                  <p className="text-xs font-semibold text-slate-800 mt-1 truncate">
                    {item.organization?.name || item.orgId || item.organizationId || "—"}
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-slate-100 bg-white">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium">
                    <Shield className="w-3.5 h-3.5" /> Assigned Role
                  </div>
                  <p className="text-xs font-semibold text-slate-800 mt-1 capitalize">
                    {item.role || "Member"}
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-slate-100 bg-white">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium">
                    <Users className="w-3.5 h-3.5" /> Uses / Max Capacity
                  </div>
                  <p className="text-xs font-semibold text-slate-800 mt-1">
                    {item.usedCount ?? 0} <span className="text-slate-400">/ {item.maxUses ? `${item.maxUses} max` : "Unlimited"}</span>
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-slate-100 bg-white">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium">
                    <Calendar className="w-3.5 h-3.5" /> Expiration
                  </div>
                  <p className="text-xs font-semibold text-slate-800 mt-1">
                    {item.expiresAt ? format(new Date(item.expiresAt), "MMM d, yyyy") : "Never Expires"}
                  </p>
                </div>
              </div>

              {/* Timestamp Info */}
              <div className="p-3.5 rounded-xl bg-slate-50/60 border border-slate-100 text-[11px] text-slate-500 space-y-1">
                <div className="flex justify-between">
                  <span>Created At:</span>
                  <span className="font-medium text-slate-700">
                    {item.createdAt ? format(new Date(item.createdAt), "MMM d, yyyy · HH:mm") : "—"}
                  </span>
                </div>
                {item.updatedAt && (
                  <div className="flex justify-between">
                    <span>Last Updated:</span>
                    <span className="font-medium text-slate-700">
                      {format(new Date(item.updatedAt), "MMM d, yyyy · HH:mm")}
                    </span>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
