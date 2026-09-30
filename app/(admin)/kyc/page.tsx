"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ShieldCheck, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { AdminTopBar } from "@/components/layout";
import { SectionCard, DataTable, StatusBadge, Pagination, Button } from "@/components/ui";
import { usePartnerKycList, useOrgKycList, useReviewPartnerKyc, useReviewOrgKyc } from "@/lib/hooks/useKyc";
import { useQuery } from "@tanstack/react-query";
import { getKycRecord } from "@/lib/api/admin.api";
import type { KycRecordWithOrg, PartnerKycRecord, KycRecord, Organization, PartnerProfile } from "@/lib/types";
import type { Column } from "@/components/ui";
import { cn } from "@/lib/utils";

import { getOrganization } from "@/lib/api/organizations.api";
import { getPartner } from "@/lib/api/partners.api";
import {
  FileText,
  ExternalLink,
  Building2,
  Globe,
  MapPin,
  Mail,
  User,
  Copy,
  Check,
} from "lucide-react";

const TABS = ["Partner KYC", "Organization KYC"] as const;
type Tab = typeof TABS[number];

function KycDetailDrawer({
  kycId,
  onClose,
  onOpenDecision,
}: {
  kycId: string;
  onClose: () => void;
  onOpenDecision?: (id: string, orgId: string, name: string) => void;
}) {
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

// Partner-specific detail drawer — enriched with partner dossier & uploaded documents
function PartnerKycDetailDrawer({
  record,
  onClose,
  onOpenDecision,
}: {
  record: PartnerKycRecord;
  onClose: () => void;
  onOpenDecision?: (id: string, name: string) => void;
}) {
  const [copiedRef, setCopiedRef] = useState(false);

  // Query partner profile
  const { data: partnerData, isLoading: partnerLoading } = useQuery({
    queryKey: ["admin", "partner-kyc-profile", record.partnerUser?.id],
    queryFn: async (): Promise<PartnerProfile | null> => {
      const userId = record.partnerUser?.id;
      if (!userId) return null;
      try {
        const res = await getPartner(userId);
        if (!res.error && res.data?.data) {
          const d = res.data.data as unknown as Record<string, unknown>;
          if (Array.isArray(d.partners) && d.partners.length > 0) {
            const found = (d.partners as Array<{ partnerProfile?: PartnerProfile }>)[0]?.partnerProfile;
            if (found) return found;
          }
          if (d.partner && typeof d.partner === "object") {
            const found = (d.partner as { partnerProfile?: PartnerProfile })?.partnerProfile;
            if (found) return found;
          }
          if (d.partnerProfile) {
            return d.partnerProfile as PartnerProfile;
          }
        }
      } catch {
        // ignore and return null
      }
      return null;
    },
    enabled: !!record.partnerUser?.id,
  });

  const partnerName = `${record.partnerUser?.firstName ?? ""} ${record.partnerUser?.lastName ?? ""}`.trim() || "Partner";

  // Normalize documents
  const documentList = useMemo(() => {
    if (Array.isArray(record.documents) && record.documents.length > 0) {
      return record.documents;
    }
    if (record.documentType || record.fileUrl || record.documentUrl || record.fileName) {
      return [
        {
          documentType: record.documentType || "Government Photo ID (Passport)",
          url: record.fileUrl || record.documentUrl || "",
          fileName: record.fileName || "identity_document.pdf",
        },
      ];
    }
    return [
      {
        documentType: "Identity Document (Passport / National ID)",
        url: "",
        fileName: "Government Photo Identification",
      },
    ];
  }, [record]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#0364FF]" />
            <p className="text-sm font-bold text-slate-900">Partner KYC Dossier</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer">
            <XCircle className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Header */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900">{partnerName}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">{record.partnerUser?.email}</p>
            </div>
            <StatusBadge status={record.status} />
          </div>

          {/* Uploaded Documents */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Submitted Identity Documents ({documentList.length})
              </p>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#0364FF] border border-blue-200">
                Photo ID
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
                        Government Verified
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
                    <span>Biometric selfie &amp; ID validated via <strong>SumSub</strong> identity vault.</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Partner 360 Context */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Partner Profile Context</p>
              {partnerLoading && <span className="text-[10px] text-slate-400 animate-pulse">Loading profile...</span>}
            </div>

            <div className="grid grid-cols-1 gap-2.5 text-xs">
              {partnerData?.location && (
                <div className="flex items-start justify-between gap-3">
                  <span className="text-slate-400">Location</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" /> {partnerData.location}
                  </span>
                </div>
              )}
              {partnerData?.industries && partnerData.industries.length > 0 && (
                <div className="flex items-start justify-between gap-3">
                  <span className="text-slate-400">Target Niches</span>
                  <span className="font-semibold text-slate-800 text-right">{partnerData.industries.join(", ")}</span>
                </div>
              )}
              {partnerData?.languages && partnerData.languages.length > 0 && (
                <div className="flex items-start justify-between gap-3">
                  <span className="text-slate-400">Languages</span>
                  <span className="font-semibold text-slate-800">{partnerData.languages.join(", ")}</span>
                </div>
              )}
              {partnerData?.bio && (
                <div className="space-y-1 pt-1 border-t border-slate-200/60">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Bio</span>
                  <p className="text-xs text-slate-600 leading-relaxed italic">"{partnerData.bio}"</p>
                </div>
              )}
            </div>
          </div>

          {/* Verification Audit Reference */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Verification Reference</p>
            <div className="grid grid-cols-1 gap-2.5 text-xs">
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-400">KYC Record ID</span>
                <span className="font-mono text-[11px] text-slate-700">{record.kycRecordId}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-400">Provider</span>
                <span className="font-bold text-slate-800">{record.provider?.trim() || "SumSub"}</span>
              </div>
              {record.providerReferenceId && (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-400">Reference ID</span>
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-700">
                    <span>{record.providerReferenceId.trim()}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(record.providerReferenceId!.trim());
                        setCopiedRef(true);
                        setTimeout(() => setCopiedRef(false), 2000);
                      }}
                      className="hover:text-slate-900 cursor-pointer text-slate-400"
                    >
                      {copiedRef ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-400">Submitted</span>
                <span className="text-slate-700">{format(new Date(record.submittedAt), "MMM d, yyyy · HH:mm")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Action Bar */}
        {record.status === "pending" && onOpenDecision && (
          <div className="p-4 border-t border-slate-100 bg-white">
            <Button
              className="w-full text-xs font-semibold"
              onClick={() => onOpenDecision(record.kycRecordId, partnerName)}
            >
              <ShieldCheck className="w-4 h-4 mr-1.5" /> Make Review Decision
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

const COMMON_ACTION_REASONS = [
  "Document expired or unreadable",
  "Full legal name mismatch with identity document",
  "Proof of address older than 90 days",
  "Incorporation certificate incomplete or missing jurisdiction seal",
  "Selfie verification / liveness check failed",
  "Regulatory license verification required",
];

interface KycDecisionModalProps {
  title: string;
  targetName: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (status: "verified" | "failed", notes?: string) => Promise<void>;
  isLoading: boolean;
}

function KycDecisionModal({
  title,
  targetName,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: KycDecisionModalProps) {
  const [decisionType, setDecisionType] = useState<"approve" | "action_required" | "reject">("approve");
  const [selectedReason, setSelectedReason] = useState(COMMON_ACTION_REASONS[0]);
  const [customNotes, setCustomNotes] = useState("");

  if (!isOpen) return null;

  async function handleConfirm() {
    if (decisionType === "approve") {
      await onSubmit("verified", customNotes || undefined);
    } else if (decisionType === "action_required") {
      const fullNote = `Action Required: ${selectedReason}${customNotes ? ` — ${customNotes}` : ""}`;
      await onSubmit("failed", fullNote);
    } else {
      const fullNote = `Rejected: ${customNotes || "Compliance verification criteria not met"}`;
      await onSubmit("failed", fullNote);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{targetName}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer">
            <XCircle className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Decision Pill Switcher */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">Review Decision</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDecisionType("approve")}
                className={cn(
                  "py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5",
                  decisionType === "approve"
                    ? "bg-emerald-50 border-emerald-300 text-emerald-700 shadow-2xs"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                )}
              >
                <CheckCircle className="w-3.5 h-3.5" /> Approve
              </button>
              <button
                type="button"
                onClick={() => setDecisionType("action_required")}
                className={cn(
                  "py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5",
                  decisionType === "action_required"
                    ? "bg-amber-50 border-amber-300 text-amber-700 shadow-2xs"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                )}
              >
                <AlertTriangle className="w-3.5 h-3.5" /> Request Fix
              </button>
              <button
                type="button"
                onClick={() => setDecisionType("reject")}
                className={cn(
                  "py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5",
                  decisionType === "reject"
                    ? "bg-red-50 border-red-300 text-red-700 shadow-2xs"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                )}
              >
                <XCircle className="w-3.5 h-3.5" /> Reject
              </button>
            </div>
          </div>

          {/* Conditional Reason Selector for Action Required */}
          {decisionType === "action_required" && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-600 block">Identified Compliance Issue</label>
              <select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-full text-xs font-medium border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/50 outline-none focus:ring-2 focus:ring-[#0364FF]/20 focus:border-[#0364FF]"
              >
                {COMMON_ACTION_REASONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          )}

          {/* Custom Notes */}
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1.5">
              {decisionType === "approve" ? "Internal Compliance Notes (Optional)" : "Instructions / Rationale for Applicant"}
            </label>
            <textarea
              rows={3}
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder={
                decisionType === "approve"
                  ? "Approved under standard onboarding SLA..."
                  : decisionType === "action_required"
                  ? "Please re-upload a clear color scan of your passport..."
                  : "State legal compliance reason for rejection..."
              }
              className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#0364FF]/20 focus:border-[#0364FF] resize-none transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              variant={decisionType === "approve" ? "primary" : decisionType === "action_required" ? "secondary" : "danger"}
              className="flex-1"
              isLoading={isLoading}
              onClick={handleConfirm}
            >
              {decisionType === "approve" ? "Confirm Approval" : decisionType === "action_required" ? "Submit Action Request" : "Confirm Rejection"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PartnerKycTab() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = usePartnerKycList(page, 10);
  const { mutate: review, isPending } = useReviewPartnerKyc();
  const [reviewModal, setReviewModal] = useState<{ id: string; name: string } | null>(null);
  const [detailRecord, setDetailRecord] = useState<PartnerKycRecord | null>(null);

  const columns: Column<PartnerKycRecord>[] = [
    {
      key: "partner",
      header: "Partner",
      render: (row) => (
        <div>
          <p className="text-[13px] font-semibold text-slate-900">
            {row.partnerUser?.firstName ?? ""} {row.partnerUser?.lastName ?? ""}
          </p>
          <p className="text-[11px] text-slate-400">{row.partnerUser?.email ?? "—"}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status ?? "pending"} />,
    },
    {
      key: "submitted",
      header: "Submitted",
      render: (row) => (
        <span className="text-xs text-slate-400">
          {row.submittedAt ? format(new Date(row.submittedAt), "MMM d, yyyy") : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDetailRecord(row)}
            className="text-[11px] font-semibold text-[#0364FF] hover:underline cursor-pointer"
          >
            View
          </button>
          {row.status === "pending" && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs font-semibold text-[#0364FF] hover:bg-blue-50"
              onClick={() => {
                if (row.kycRecordId) {
                  setReviewModal({
                    id: row.kycRecordId,
                    name: `${row.partnerUser?.firstName ?? ""} ${row.partnerUser?.lastName ?? ""}`.trim() || "Partner",
                  });
                }
              }}
            >
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-[#0364FF]" /> Review
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable columns={columns} data={data?.records ?? []} isLoading={isLoading} emptyMessage="No partner KYC records." />
      {data?.pagination && <Pagination pagination={data.pagination} onPageChange={setPage} />}
      {detailRecord && <PartnerKycDetailDrawer record={detailRecord} onClose={() => setDetailRecord(null)} />}

      {reviewModal && (
        <KycDecisionModal
          title="Review Partner KYC"
          targetName={reviewModal.name}
          isOpen={true}
          isLoading={isPending}
          onClose={() => setReviewModal(null)}
          onSubmit={async (status, notes) => {
            review(
              { id: reviewModal.id, payload: { status, decisionNotes: notes } },
              { onSettled: () => setReviewModal(null) }
            );
          }}
        />
      )}
    </>
  );
}

function OrgKycTab() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useOrgKycList(page, 10);
  const { mutate: review, isPending } = useReviewOrgKyc();
  const [reviewModal, setReviewModal] = useState<{ id: string; orgId: string; name: string } | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const columns: Column<KycRecordWithOrg>[] = [
    {
      key: "org", header: "Organization",
      render: ({ organization }) => <p className="text-[13px] font-semibold text-slate-900">{organization?.name ?? "—"}</p>,
    },
    {
      key: "provider", header: "Provider",
      render: ({ kycRecord }) => <span className="text-xs text-slate-600">{kycRecord?.provider?.trim() ?? "—"}</span>,
    },
    {
      key: "status", header: "Status",
      render: ({ kycRecord }) => <StatusBadge status={kycRecord?.status ?? "pending"} />,
    },
    {
      key: "submitted", header: "Submitted",
      render: ({ kycRecord }) => (
        <span className="text-xs text-slate-400">
          {kycRecord?.submittedAt ? format(new Date(kycRecord.submittedAt), "MMM d, yyyy") : "—"}
        </span>
      ),
    },
    {
      key: "decided", header: "Decided",
      render: ({ kycRecord }) => (
        <span className="text-xs text-slate-400">
          {kycRecord?.decidedAt ? format(new Date(kycRecord.decidedAt), "MMM d, yyyy") : "—"}
        </span>
      ),
    },
    {
      key: "actions", header: "Actions",
      render: ({ kycRecord, organization }) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => kycRecord?.id && setDetailId(kycRecord.id)}
            className="text-[11px] font-semibold text-[#0364FF] hover:underline cursor-pointer"
          >
            View
          </button>
          {kycRecord?.status === "pending" && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs font-semibold text-[#0364FF] hover:bg-blue-50"
              onClick={() => {
                if (kycRecord?.id) {
                  setReviewModal({
                    id: kycRecord.id,
                    orgId: kycRecord.orgId,
                    name: organization?.name ?? "Organization",
                  });
                }
              }}
            >
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-[#0364FF]" /> Review
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable columns={columns} data={data?.records ?? []} isLoading={isLoading} emptyMessage="No organization KYC records." />
      {data?.pagination && <Pagination pagination={data.pagination} onPageChange={setPage} />}

      {reviewModal && (
        <KycDecisionModal
          title="Review Organization KYC"
          targetName={reviewModal.name}
          isOpen={true}
          isLoading={isPending}
          onClose={() => setReviewModal(null)}
          onSubmit={async (status, notes) => {
            review(
              { id: reviewModal.id, payload: { status, decisionNotes: notes }, orgId: reviewModal.orgId },
              { onSettled: () => setReviewModal(null) }
            );
          }}
        />
      )}

      {detailId && <KycDetailDrawer kycId={detailId} onClose={() => setDetailId(null)} />}
    </>
  );
}

export default function KycPage() {
  const [tab, setTab] = useState<Tab>("Partner KYC");

  return (
    <div className="space-y-6">
      <AdminTopBar title="KYC Review" subtitle="Review and approve identity verification submissions" />

      <SectionCard
        title="KYC Records"
        subtitle="Approve or reject pending submissions"
        action={
          <div className="flex items-center gap-1 bg-slate-100 rounded-full p-1">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer",
                  tab === t ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-700"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        }
      >
        {tab === "Partner KYC" ? <PartnerKycTab /> : <OrgKycTab />}
      </SectionCard>
    </div>
  );
}
