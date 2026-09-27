"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft, Building2, Mail, Globe, MapPin,
  ShieldCheck, Clock, Users, FileText, CheckCircle,
} from "lucide-react";
import { AdminTopBar } from "@/components/layout";
import { StatusBadge, Button } from "@/components/ui";
import { useOrganization } from "@/lib/hooks/useOrganizations";
import { useOrgKyc } from "@/lib/hooks/useKyc";

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider w-40 shrink-0 mt-0.5">{label}</span>
      <span className="text-[13px] text-slate-800 font-medium">{value}</span>
    </div>
  );
}

function TagList({ label, items }: { label: string; items?: string[] }) {
  if (!items?.length) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider w-40 shrink-0 mt-1">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {items.map((t) => (
          <span key={t} className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full text-[11px] font-medium">{t}</span>
        ))}
      </div>
    </div>
  );
}

export default function OrganizationDetailPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = use(params);
  const router = useRouter();
  const { data: org, isLoading } = useOrganization(orgId);
  const { data: kyc } = useOrgKyc(orgId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <AdminTopBar />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-6 h-48 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="space-y-6">
        <AdminTopBar />
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <p className="text-sm text-slate-500">Organization not found.</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => router.back()}>Go back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminTopBar />

      {/* Back + header */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-slate-900">{org.name}</h1>
          <p className="text-xs text-slate-400">{org.email} · {org.companyType ?? "Organization"}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={org.status ?? "pending"} />
          {org.isVerified && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle className="w-3 h-3" /> Verified
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left — Details */}
        <div className="lg:col-span-2 space-y-5">

          {/* Hero */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="h-20 bg-gradient-to-r from-emerald-50 to-teal-50" />
            <div className="px-6 pb-6 -mt-8">
              <div className="w-16 h-16 rounded-2xl bg-white border-4 border-white shadow-sm flex items-center justify-center">
                <Building2 className="w-7 h-7 text-slate-400" />
              </div>
              <div className="mt-3">
                <h2 className="text-base font-bold text-slate-900">{org.name}</h2>
                {org.legalEntityName && org.legalEntityName !== org.name && (
                  <p className="text-xs text-slate-400 mt-0.5">Legal: {org.legalEntityName}</p>
                )}
                {org.description && (
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed max-w-xl">{org.description}</p>
                )}
                <div className="flex items-center gap-4 mt-3 flex-wrap">
                  {org.email && (
                    <span className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Mail className="w-3.5 h-3.5 text-slate-400" /> {org.email}
                    </span>
                  )}
                  {org.website && (
                    <a href={org.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-[#0364FF] hover:underline">
                      <Globe className="w-3.5 h-3.5" /> {org.website}
                    </a>
                  )}
                  {org.country && (
                    <span className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {org.country}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Company details */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
            <p className="text-sm font-bold text-slate-900 mb-4">Company Details</p>
            <InfoRow label="Company Type" value={org.companyType} />
            <InfoRow label="Legal Entity" value={org.legalEntityName} />
            <InfoRow label="Country" value={org.country} />
            <TagList label="Operating Regions" items={org.operatingRegions} />
            <TagList label="Products / Services" items={org.productsServices?.primary} />
            <TagList label="Platforms" items={org.productsServices?.platforms} />
          </div>

          {/* Regulatory */}
          {org.regulatoryInfo && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4 text-[#0364FF]" />
                <p className="text-sm font-bold text-slate-900">Regulatory Information</p>
              </div>
              <InfoRow label="Regulator" value={org.regulatoryInfo.regulator} />
              <InfoRow label="License Number" value={org.regulatoryInfo.licenseNumber} />
              <TagList label="Jurisdictions" items={org.regulatoryInfo.jurisdictions} />
            </div>
          )}

          {/* Partnership context */}
          {(org.existingPartnershipsContext || org.byoPartnersContext) && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-[#0364FF]" />
                <p className="text-sm font-bold text-slate-900">Partnership Context</p>
              </div>
              {org.existingPartnershipsContext?.currentPartners != null && (
                <InfoRow label="Current Partners" value={org.existingPartnershipsContext.currentPartners} />
              )}
              {org.existingPartnershipsContext?.notes && (
                <InfoRow label="Notes" value={org.existingPartnershipsContext.notes} />
              )}
              {org.byoPartnersContext?.hasBYOPartners != null && (
                <InfoRow label="Has BYO Partners" value={org.byoPartnersContext.hasBYOPartners ? "Yes" : "No"} />
              )}
              {org.byoPartnersContext?.notes && (
                <InfoRow label="BYO Notes" value={org.byoPartnersContext.notes} />
              )}
            </div>
          )}
        </div>

        {/* Right — Status */}
        <div className="space-y-5">

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <p className="text-sm font-bold text-slate-900 mb-4">Status</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Status</span>
                <StatusBadge status={org.status ?? "pending"} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Active</span>
                <span className={`text-xs font-semibold ${org.isActive ? "text-emerald-600" : "text-slate-400"}`}>
                  {org.isActive ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Verified</span>
                <span className={`text-xs font-semibold ${org.isVerified ? "text-emerald-600" : "text-amber-500"}`}>
                  {org.isVerified ? "Verified" : "Unverified"}
                </span>
              </div>
              {org.planId && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Plan</span>
                  <span className="text-xs font-medium text-slate-700 font-mono">{org.planId}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-4 h-4 text-[#0364FF]" />
              <p className="text-sm font-bold text-slate-900">KYC Status</p>
            </div>
            {kyc ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Status</span>
                  <StatusBadge status={kyc.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Provider</span>
                  <span className="text-xs font-medium text-slate-700">{kyc.provider?.trim()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Submitted</span>
                  <span className="text-xs text-slate-500">{format(new Date(kyc.submittedAt), "MMM d, yyyy")}</span>
                </div>
                {kyc.decidedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Decided</span>
                    <span className="text-xs text-slate-500">{format(new Date(kyc.decidedAt), "MMM d, yyyy")}</span>
                  </div>
                )}
                {kyc.decisionNotes && (
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Notes</p>
                    <p className="text-xs text-slate-600">{kyc.decisionNotes}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center py-4 text-center">
                <ShieldCheck className="w-8 h-8 text-slate-200 mb-2" />
                <p className="text-xs text-slate-400">No KYC record found</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-slate-400" />
              <p className="text-sm font-bold text-slate-900">Timeline</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Created</span>
                <span className="text-xs text-slate-600">{format(new Date(org.createdAt), "MMM d, yyyy")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Last Updated</span>
                <span className="text-xs text-slate-600">{format(new Date(org.updatedAt), "MMM d, yyyy")}</span>
              </div>
              {org.closedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Closed</span>
                  <span className="text-xs text-red-500">{format(new Date(org.closedAt), "MMM d, yyyy")}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <p className="text-sm font-bold text-slate-900 mb-3">Quick Actions</p>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => router.push("/kyc")}>
                <ShieldCheck className="w-3.5 h-3.5 mr-2 text-[#0364FF]" /> View KYC Queue
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => router.push("/byop")}>
                <Users className="w-3.5 h-3.5 mr-2 text-[#0364FF]" /> BYOP Relationships
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
