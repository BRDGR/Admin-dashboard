"use client";

import Link from "next/link";
import {
  Building2,
  MapPin,
  Globe,
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
  ExternalLink,
  Building,
  FileCheck2,
} from "lucide-react";
import { format } from "date-fns";
import type { AdminClientOrganization } from "@/lib/types";
import { StatusBadge } from "@/components/ui";

interface ClientOrgCardProps {
  org?: AdminClientOrganization | null;
  copiedId: string | null;
  onCopy: (text: string, label: string) => void;
}

export function ClientOrgCard({ org, copiedId, onCopy }: ClientOrgCardProps) {
  if (!org) {
    return (
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
        <Building className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
        <p className="text-xs font-semibold text-slate-700">No Corporate Entity Linked</p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          This user has not yet completed corporate onboarding.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-4 space-y-3 text-xs">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-bold text-slate-900">{org.name}</p>
          <p className="text-[11px] text-slate-500 capitalize">
            {org.companyType || "Enterprise Client"}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StatusBadge status={org.status || "active"} />
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-semibold ${
              org.isVerified ? "text-emerald-600" : "text-slate-400"
            }`}
          >
            {org.isVerified ? (
              <>
                <ShieldCheck className="w-3 h-3" /> Verified
              </>
            ) : (
              <>
                <ShieldAlert className="w-3 h-3" /> Unverified
              </>
            )}
          </span>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 space-y-2">
        <div className="flex items-center justify-between text-slate-600">
          <span className="text-slate-400 font-medium">Organization ID</span>
          <button
            type="button"
            onClick={() => onCopy(org.id, "Organization ID")}
            className="font-mono text-[11px] text-slate-700 hover:text-[#0364FF] flex items-center gap-1 cursor-pointer"
          >
            {org.id.slice(0, 18)}...
            {copiedId === "Organization ID" ? (
              <Check className="w-3 h-3 text-emerald-600" />
            ) : (
              <Copy className="w-3 h-3 text-slate-400" />
            )}
          </button>
        </div>

        {org.country && (
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-slate-400 font-medium">Jurisdiction</span>
            <span className="font-medium text-slate-800 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              {org.country}
            </span>
          </div>
        )}

        {org.website && (
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-slate-400 font-medium">Website</span>
            <a
              href={org.website.startsWith("http") ? org.website : `https://${org.website}`}
              target="_blank"
              rel="noreferrer"
              className="text-[#0364FF] hover:underline flex items-center gap-1 truncate max-w-[200px]"
            >
              <Globe className="w-3 h-3 shrink-0" />
              {org.website.replace(/^https?:\/\//, "")}
            </a>
          </div>
        )}

        {org.createdAt && (
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-slate-400 font-medium">Entity Created</span>
            <span className="text-slate-700">
              {format(new Date(org.createdAt), "MMM d, yyyy")}
            </span>
          </div>
        )}
      </div>

      <div className="pt-2 flex gap-2">
        <Link
          href={`/organizations/${org.id}`}
          className="flex-1 py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-[#0364FF] font-semibold text-xs rounded-lg text-center transition-colors"
        >
          Manage Organization
        </Link>
        <Link
          href="/kyc"
          className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg flex items-center gap-1 transition-colors"
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          Review KYC
        </Link>
      </div>
    </div>
  );
}
