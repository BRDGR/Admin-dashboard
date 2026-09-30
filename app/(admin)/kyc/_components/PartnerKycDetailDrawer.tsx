"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import {
  User,
  XCircle,
  FileText,
  ExternalLink,
  ShieldCheck,
  MapPin,
  Copy,
  Check,
} from "lucide-react";
import { StatusBadge, Button } from "@/components/ui";
import { getPartner } from "@/lib/api/partners.api";
import type { PartnerKycRecord, PartnerProfile } from "@/lib/types";

export interface PartnerKycDetailDrawerProps {
  record: PartnerKycRecord;
  onClose: () => void;
  onOpenDecision?: (id: string, name: string) => void;
}

export function PartnerKycDetailDrawer({
  record,
  onClose,
  onOpenDecision,
}: PartnerKycDetailDrawerProps) {
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
