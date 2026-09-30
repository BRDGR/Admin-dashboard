"use client";

import { useState } from "react";
import { X, UserPlus, Building2, Mail, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui";
import { useInviteByopPartner } from "@/lib/hooks/useByop";
import { useOrganizations } from "@/lib/hooks/useOrganizations";

interface InviteByopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const fieldCls =
  "w-full text-xs bg-slate-50 focus:bg-white border border-slate-200/80 rounded-xl px-3.5 h-10 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0364FF]/20 focus:border-[#0364FF] transition-all";

export function InviteByopModal({ isOpen, onClose }: InviteByopModalProps) {
  const [clientOrgId, setClientOrgId] = useState("");
  const [partnerEmail, setPartnerEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const { data: orgsData } = useOrganizations(1, 100);
  const organizations = orgsData?.organizations ?? [];
  const { mutate: invite, isPending } = useInviteByopPartner();

  if (!isOpen) return null;

  const selectedOrg = organizations.find((r) => r.organization?.id === clientOrgId)?.organization;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clientOrgId || !partnerEmail || !firstName || !lastName) return;
    invite(
      { clientOrgId, partnerEmail: partnerEmail.trim(), firstName: firstName.trim(), lastName: lastName.trim() },
      { onSuccess: onClose }
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl w-full max-w-md mx-auto overflow-hidden animate-in zoom-in-95 duration-150">

        {/* Header */}
        <div className="px-6 pt-6 pb-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                <UserPlus className="w-4.5 h-4.5 text-[#0364FF]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Invite BYOP Partner</h3>
                <p className="text-xs text-slate-400 mt-0.5">Link an external partner to a client org</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 shadow-2xs flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="h-px bg-slate-100" />

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-5">

            {/* Organization */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Client Organization <span className="text-rose-400 normal-case tracking-normal font-semibold">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <select
                  required
                  value={clientOrgId}
                  onChange={(e) => setClientOrgId(e.target.value)}
                  className={`${fieldCls} pl-9 pr-8 appearance-none cursor-pointer`}
                >
                  <option value="">Select an organization…</option>
                  {organizations.map((r) => {
                    const o = r.organization;
                    if (!o?.id) return null;
                    return (
                      <option key={o.id} value={o.id}>
                        {o.name || "Unnamed"}
                      </option>
                    );
                  })}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
              {selectedOrg && (
                <p className="text-[11px] text-slate-400 pl-1">
                  Status: <span className="font-semibold text-slate-600 capitalize">{selectedOrg.status ?? "active"}</span>
                </p>
              )}
            </div>

            <div className="h-px bg-slate-100" />

            {/* Partner Identity */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Partner Details</span>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 block">First Name <span className="text-rose-400">*</span></label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    <input
                      required
                      placeholder="Jane"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className={`${fieldCls} pl-9`}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 block">Last Name <span className="text-rose-400">*</span></label>
                  <input
                    required
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={fieldCls}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 block">Email Address <span className="text-rose-400">*</span></label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <input
                    required
                    type="email"
                    placeholder="partner@example.com"
                    value={partnerEmail}
                    onChange={(e) => setPartnerEmail(e.target.value)}
                    className={`${fieldCls} pl-9`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="h-px bg-slate-100" />
          <div className="px-6 py-4 flex items-center justify-between bg-slate-50/60">
            <p className="text-[11px] text-slate-400">Partner will receive an email invite</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" type="button" onClick={onClose} disabled={isPending}>
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                isLoading={isPending}
                disabled={!clientOrgId || !partnerEmail || !firstName || !lastName}
              >
                Send Invitation
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
