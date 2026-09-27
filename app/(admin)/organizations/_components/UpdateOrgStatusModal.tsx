"use client";

import { useState, useEffect } from "react";
import { X, Building2, ShieldCheck, Power, Loader2, CheckCircle2 } from "lucide-react";
import { updateOrganizationStatus } from "@/lib/api/admin.api";
import type { OrganizationRecord } from "@/lib/types";
import { toast } from "sonner";

interface UpdateOrgStatusModalProps {
  record: OrganizationRecord | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function UpdateOrgStatusModal({
  record,
  onClose,
  onSuccess,
}: UpdateOrgStatusModalProps) {
  const [isActive, setIsActive] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (record) {
      setIsActive(record.organization.isActive ?? true);
      setIsVerified(record.organization.isVerified ?? false);
    }
  }, [record]);

  if (!record) return null;

  const org = record.organization;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!record) return;

    try {
      setIsSubmitting(true);
      const res = await updateOrganizationStatus(org.id, {
        isActive,
        isVerified,
      });

      if (res.data?.error) {
        toast.error(res.data.message || "Failed to update organization status");
        return;
      }

      toast.success("Organization status updated successfully");
      onSuccess();
      onClose();
    } catch {
      toast.error("An error occurred while updating status");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0364FF] flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Manage Org Status</h2>
              <p className="text-xs text-slate-500 truncate max-w-[240px]">{org.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-3">
            {/* Active Switch */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 ${
                    isActive ? "bg-emerald-50 text-emerald-600" : "bg-slate-200 text-slate-500"
                  }`}
                >
                  <Power className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">Platform Access</p>
                  <p className="text-[11px] text-slate-500">
                    {isActive
                      ? "Organization can log in and create campaigns"
                      : "Account is suspended from platform activities"}
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-[#0364FF] focus:ring-[#0364FF] border-slate-300"
              />
            </div>

            {/* Verified Switch */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 ${
                    isVerified ? "bg-blue-50 text-[#0364FF]" : "bg-slate-200 text-slate-500"
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">Verification Badge</p>
                  <p className="text-[11px] text-slate-500">
                    {isVerified
                      ? "Verified enterprise client badge visible to partners"
                      : "Unverified - Pending KYB documentation"}
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isVerified}
                onChange={(e) => setIsVerified(e.target.checked)}
                className="w-4 h-4 rounded text-[#0364FF] focus:ring-[#0364FF] border-slate-300"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0364FF] hover:bg-[#0256DC] rounded-xl transition-all shadow-sm shadow-blue-500/20 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Save Status
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
