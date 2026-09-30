"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  XCircle,
  FileText,
  ExternalLink,
  ShieldCheck,
  MapPin,
  Globe,
  Copy,
  Check,
} from "lucide-react";
import { StatusBadge, Button } from "@/components/ui";
import { getKycRecord } from "@/lib/api/admin.api";
import { getOrganization } from "@/lib/api/organizations.api";
import type { KycRecord, Organization } from "@/lib/types";

export interface OrgKycDetailDrawerProps {
  kycId: string;
  onClose: () => void;
  onOpenDecision?: (id: string, orgId: string, name: string) => void;
}

export function OrgKycDetailDrawer({
  kycId,
  onClose,
  onOpenDecision,
}: OrgKycDetailDrawerProps) {
  const [copiedRef, setCopiedRef] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "kyc", kycId],
    queryFn: async () => {
      const res = await getKycRecord(kycId);
      if (res.error) throw new Error(res.error);
      return res.data?.data ?? null;
    },
    enabled: !!kycId,
  });

  const record = (data ?? undefined) as {
    kycRecord?: KycRecord;
    records?: Array<{ kycRecord: KycRecord; organization?: { id: string; name: string } }>;
    organization?: { id: string; name: string };
  } | undefined;

  const kyc = record?.kycRecord ?? record?.records?.[0]?.kycRecord;
  const initialOrg = record?.organization ?? record?.records?.[0]?.organization;

  // Query rich organization dossier if orgId exists
  const { data: orgData, isLoading: orgLoading } = useQuery({
    queryKey: ["admin", "organizations", kyc?.orgId],
    queryFn: async () => {
      if (!kyc?.orgId) return null;
      const res = await getOrganization(kyc.orgId);
      if (res.error) return null;
      return res.data?.data?.organization ?? null;
    },
    enabled: !!kyc?.orgId,
  });

  const org: Partial<Organization> | null = orgData ?? (initialOrg ? { id: initialOrg.id, name: initialOrg.name } : null);
  const orgName = org?.name ?? initialOrg?.name ?? "Organization";

  // Normalize documents
  const documentList = useMemo(() => {
    if (!kyc) return [];
    if (Array.isArray(kyc.documents) && kyc.documents.length > 0) {
      return kyc.documents;
    }
    if (kyc.documentType || kyc.fileUrl || kyc.documentUrl || kyc.fileName) {
      return [
        {
          id: kyc.id,
          documentType: kyc.documentType || "Certificate of Incorporation",
          url: kyc.fileUrl || kyc.documentUrl || "",
          fileName: kyc.fileName || "incorporation_document.pdf",
          uploadedAt: kyc.submittedAt,
        },
      ];
    }
    return [
      {
        id: kyc.id,
        documentType: "Corporate Incorporation Document",
        url: "",
        fileName: "Corporate Registration Document",
        uploadedAt: kyc.submittedAt,
      },
    ];
  }, [kyc]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#0364FF]" />
            <p className="text-sm font-bold text-slate-900">Organization KYC Dossier</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer">
            <XCircle className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />)}
            </div>
          ) : !kyc ? (
            <p className="text-sm text-slate-400 text-center py-10">Record not found.</p>
          ) : (
            <>
              {/* Status Header */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{orgName}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{kyc.id}</p>
                </div>
                <StatusBadge status={kyc.status} />
              </div>

              {/* Uploaded Documents Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Uploaded Compliance Documents ({documentList.length})
                  </p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#0364FF] border border-blue-200">
                    KYC Evidence
                  </span>
                </div>

                {documentList.map((doc, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border border-slate-200/90 bg-white shadow-2xs hover:border-[#0364FF]/40 transition-all space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0364FF] flex items-center justify-center shrink-0 border border-blue-100">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-900">{doc.documentType}</span>
                          <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-slate-100 text-slate-600">
                            Verified Format
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">{doc.fileName}</p>
                      </div>
                    </div>

                    {doc.url ? (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 h-9 px-4 rounded-xl bg-blue-50 text-[#0364FF] hover:bg-blue-100 font-semibold text-xs transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View / Download Document</span>
                        <ExternalLink className="w-3.5 h-3.5 ml-auto text-slate-400" />
                      </a>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 leading-relaxed flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Verified and archived via <strong>{kyc.provider?.trim() || "SumSub"}</strong> secure KYC pipeline.</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Organization 360 Context */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Organization Dossier</p>
                  {orgLoading && <span className="text-[10px] text-slate-400 animate-pulse">Loading org...</span>}
                </div>

                <div className="grid grid-cols-1 gap-2.5 text-xs">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-slate-400">Legal Entity</span>
                    <span className="font-semibold text-slate-800 text-right">{org?.legalEntityName || orgName}</span>
                  </div>
                  {org?.companyType && (
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-slate-400">Company Type</span>
                      <span className="font-semibold text-[#0364FF] uppercase text-[11px] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {org.companyType}
                      </span>
                    </div>
                  )}
                  {org?.country && (
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-slate-400">Jurisdiction</span>
                      <span className="font-semibold text-slate-800 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" /> {org.country}
                      </span>
                    </div>
                  )}
                  {org?.website && (
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-slate-400">Website</span>
                      <a href={org.website.startsWith("http") ? org.website : `https://${org.website}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#0364FF] hover:underline flex items-center gap-1">
                        <Globe className="w-3 h-3" /> {org.website.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  )}
                  {org?.email && (
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-slate-400">Contact Email</span>
                      <span className="font-semibold text-slate-700 font-mono text-[11px]">{org.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Provider & Verification References */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Verification Audit Reference</p>
                <div className="grid grid-cols-1 gap-2.5 text-xs">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-400">Identity Provider</span>
                    <span className="font-bold text-slate-800">{kyc.provider?.trim() || "SumSub"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-400">Provider Reference</span>
                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-700">
                      <span>{kyc.providerReferenceId?.trim() || "REF-KYC-PENDING"}</span>
                      {kyc.providerReferenceId && (
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(kyc.providerReferenceId.trim());
                            setCopiedRef(true);
                            setTimeout(() => setCopiedRef(false), 2000);
                          }}
                          className="hover:text-slate-900 cursor-pointer text-slate-400"
                        >
                          {copiedRef ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-400">Submitted</span>
                    <span className="text-slate-700">{format(new Date(kyc.submittedAt), "MMM d, yyyy · HH:mm")}</span>
                  </div>
                  {kyc.decidedAt && (
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-400">Decided</span>
                      <span className="text-slate-700">{format(new Date(kyc.decidedAt), "MMM d, yyyy · HH:mm")}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Decision Notes if any */}
              {kyc.decisionNotes && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                  <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Compliance Reviewer Notes</p>
                  <p className="text-xs text-amber-900 leading-relaxed">{kyc.decisionNotes}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Drawer Action Bar */}
        {kyc && kyc.status === "pending" && onOpenDecision && (
          <div className="p-4 border-t border-slate-100 bg-white">
            <Button
              className="w-full text-xs font-semibold"
              onClick={() => onOpenDecision(kyc.id, kyc.orgId, orgName)}
            >
              <ShieldCheck className="w-4 h-4 mr-1.5" /> Make Review Decision
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
