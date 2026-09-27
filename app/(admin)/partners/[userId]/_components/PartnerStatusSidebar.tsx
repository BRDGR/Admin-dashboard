"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Clock, ShieldCheck, Briefcase } from "lucide-react";
import { StatusBadge, Button } from "@/components/ui";
import { PartnerEligibilityCard } from "./PartnerEligibilityCard";
import type { PartnerProfile, PartnerKycRecord, User } from "@/lib/types";

interface PartnerStatusSidebarProps {
  partnerUserId: string;
  user: User;
  profile: PartnerProfile;
  kycRecord?: PartnerKycRecord;
}

export function PartnerStatusSidebar({
  partnerUserId,
  user,
  profile,
  kycRecord,
}: PartnerStatusSidebarProps) {
  const router = useRouter();

  return (
    <div className="space-y-5">
      {/* Account Status */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <p className="text-sm font-bold text-slate-900 mb-4">Account Status</p>
        <div className="space-y-3">
          {[
            { label: "Account Active", value: user.isActive ? "Active" : "Inactive", ok: user.isActive },
            {
              label: "Email Verified",
              value: user.emailVerifiedAt ? "Verified" : "Pending",
              ok: Boolean(user.emailVerifiedAt),
            },
            { label: "Role", value: user.role, ok: true },
          ].map(({ label, value, ok }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-xs text-slate-500">{label}</span>
              <span className={`text-xs font-semibold capitalize ${ok ? "text-emerald-600" : "text-amber-500"}`}>
                {value}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Vetting</span>
            <StatusBadge status={profile.isVetted ? "approved" : "pending"} />
          </div>
        </div>
      </div>

      {/* KYC Status */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-4 h-4 text-[#0364FF]" />
          <p className="text-sm font-bold text-slate-900">KYC Status</p>
        </div>
        {kycRecord ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Status</span>
              <StatusBadge status={kycRecord.status} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Record ID</span>
              <span className="text-[10px] font-mono text-slate-400 truncate max-w-[120px]">
                {kycRecord.kycRecordId}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Submitted</span>
              <span className="text-xs text-slate-500">
                {kycRecord.submittedAt ? format(new Date(kycRecord.submittedAt), "MMM d, yyyy") : "—"}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-4 text-center">
            <ShieldCheck className="w-8 h-8 text-slate-200 mb-2" />
            <p className="text-xs text-slate-400">No KYC record found</p>
          </div>
        )}
      </div>

      {/* Eligibility Card */}
      <PartnerEligibilityCard
        partnerUserId={partnerUserId}
        partnerProfileId={profile.id}
        profile={profile}
        kycRecord={kycRecord}
      />

      {/* Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-slate-400" />
          <p className="text-sm font-bold text-slate-900">Timeline</p>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Registered</span>
            <span className="text-xs text-slate-600">
              {user.createdAt ? format(new Date(user.createdAt), "MMM d, yyyy") : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Profile Created</span>
            <span className="text-xs text-slate-600">
              {profile.createdAt ? format(new Date(profile.createdAt), "MMM d, yyyy") : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Last Updated</span>
            <span className="text-xs text-slate-600">
              {profile.updatedAt ? format(new Date(profile.updatedAt), "MMM d, yyyy") : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <p className="text-sm font-bold text-slate-900 mb-3">Quick Actions</p>
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start cursor-pointer"
            onClick={() => router.push("/kyc")}
          >
            <ShieldCheck className="w-3.5 h-3.5 mr-2 text-[#0364FF]" /> View KYC Queue
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start cursor-pointer"
            onClick={() => router.push("/byop")}
          >
            <Briefcase className="w-3.5 h-3.5 mr-2 text-[#0364FF]" /> BYOP Relationships
          </Button>
        </div>
      </div>
    </div>
  );
}
