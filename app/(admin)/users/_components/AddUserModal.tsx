"use client";

import { useState } from "react";
import { X, UserPlus, Shield, Users, Building2 } from "lucide-react";
import { Button } from "@/components/ui";
import { useCreateStaff } from "@/lib/hooks/useStaff";
import { useInviteByopPartner } from "@/lib/hooks/useByop";
import { useOrganizations } from "@/lib/hooks/useOrganizations";
import { cn } from "@/lib/utils";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddUserModal({ isOpen, onClose }: AddUserModalProps) {
  const [tab, setTab] = useState<"staff" | "partner">("staff");

  // Staff form state
  const [staffFirstName, setStaffFirstName] = useState("");
  const [staffLastName, setStaffLastName] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffRole, setStaffRole] = useState<"ops_admin" | "admin" | "super_admin">("ops_admin");

  // Partner form state
  const [clientOrgId, setClientOrgId] = useState("");
  const [partnerFirstName, setPartnerFirstName] = useState("");
  const [partnerLastName, setPartnerLastName] = useState("");
  const [partnerEmail, setPartnerEmail] = useState("");

  const { mutate: createStaffMutate, isPending: isCreatingStaff } = useCreateStaff();
  const { mutate: invitePartnerMutate, isPending: isInvitingPartner } = useInviteByopPartner();

  const { data: orgsData } = useOrganizations(1, 100);
  const organizations = orgsData?.organizations ?? [];

  if (!isOpen) return null;

  const isSubmitting = isCreatingStaff || isInvitingPartner;

  function handleStaffSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!staffFirstName || !staffLastName || !staffEmail) return;

    createStaffMutate(
      {
        firstName: staffFirstName.trim(),
        lastName: staffLastName.trim(),
        email: staffEmail.trim(),
        role: staffRole,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  }

  function handlePartnerSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clientOrgId || !partnerFirstName || !partnerLastName || !partnerEmail) return;

    invitePartnerMutate(
      {
        clientOrgId,
        partnerEmail: partnerEmail.trim(),
        firstName: partnerFirstName.trim(),
        lastName: partnerLastName.trim(),
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md mx-auto overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-[#0364FF]" />
            <div>
              <p className="text-sm font-bold text-slate-900">Add Platform Member</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Invite an internal team admin or new partner</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-100 px-6 pt-3 gap-3">
          <button
            type="button"
            onClick={() => setTab("staff")}
            className={cn(
              "pb-2.5 text-xs font-semibold border-b-2 -mb-px transition-colors cursor-pointer flex items-center gap-1.5",
              tab === "staff"
                ? "border-[#0364FF] text-[#0364FF]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            <Shield className="w-3.5 h-3.5" /> Staff / Admin
          </button>
          <button
            type="button"
            onClick={() => setTab("partner")}
            className={cn(
              "pb-2.5 text-xs font-semibold border-b-2 -mb-px transition-colors cursor-pointer flex items-center gap-1.5",
              tab === "partner"
                ? "border-[#0364FF] text-[#0364FF]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            <Users className="w-3.5 h-3.5" /> Partner (BYOP)
          </button>
        </div>

        {tab === "staff" ? (
          <form onSubmit={handleStaffSubmit} className="p-6 space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  First Name <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  placeholder="First name"
                  value={staffFirstName}
                  onChange={(e) => setStaffFirstName(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#0364FF]"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Last Name <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  placeholder="Last name"
                  value={staffLastName}
                  onChange={(e) => setStaffLastName(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#0364FF]"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Work Email <span className="text-rose-500">*</span>
              </label>
              <input
                required
                type="email"
                placeholder="colleague@brdgr.com"
                value={staffEmail}
                onChange={(e) => setStaffEmail(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#0364FF]"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Administrative Role <span className="text-rose-500">*</span>
              </label>
              <select
                value={staffRole}
                onChange={(e) => setStaffRole(e.target.value as any)}
                className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#0364FF] bg-white cursor-pointer"
              >
                <option value="ops_admin">Operations Admin</option>
                <option value="admin">Administrator</option>
                <option value="super_admin">Super Administrator</option>
              </select>
            </div>

            <div className="flex gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" className="flex-1" type="button" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button variant="primary" className="flex-1" type="submit" isLoading={isCreatingStaff}>
                Create Staff Member
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handlePartnerSubmit} className="p-6 space-y-4 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Client Organization <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={clientOrgId}
                onChange={(e) => setClientOrgId(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#0364FF] bg-white cursor-pointer"
              >
                <option value="">Select Organization...</option>
                {organizations.map((orgRecord) => {
                  const o = orgRecord.organization;
                  if (!o?.id) return null;
                  return (
                    <option key={o.id} value={o.id}>
                      {o.name || "Unnamed"} ({o.status || "active"})
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Partner First Name <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  placeholder="First name"
                  value={partnerFirstName}
                  onChange={(e) => setPartnerFirstName(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#0364FF]"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Partner Last Name <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  placeholder="Last name"
                  value={partnerLastName}
                  onChange={(e) => setPartnerLastName(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#0364FF]"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Partner Email <span className="text-rose-500">*</span>
              </label>
              <input
                required
                type="email"
                placeholder="partner@example.com"
                value={partnerEmail}
                onChange={(e) => setPartnerEmail(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#0364FF]"
              />
            </div>

            <div className="flex gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" className="flex-1" type="button" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button variant="primary" className="flex-1" type="submit" isLoading={isInvitingPartner}>
                Send Partner Invite
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
