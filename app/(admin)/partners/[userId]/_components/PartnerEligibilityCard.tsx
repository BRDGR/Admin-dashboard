"use client";

import { useQuery } from "@tanstack/react-query";
import { Award, CheckCircle2, Clock, RefreshCw, XCircle } from "lucide-react";
import { getAdminPartnerEligibility } from "@/lib/api/admin.api";
import type { PartnerProfile, PartnerKycRecord } from "@/lib/types";
import { Button } from "@/components/ui";

interface PartnerEligibilityCardProps {
  partnerUserId: string;
  partnerProfileId?: string;
  profile: PartnerProfile;
  kycRecord?: PartnerKycRecord;
}

export function PartnerEligibilityCard({
  partnerUserId,
  partnerProfileId,
  profile,
  kycRecord,
}: PartnerEligibilityCardProps) {
  const {
    data: eligibilityRes,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["admin", "partner", partnerUserId, "eligibility"],
    queryFn: async () => {
      console.log("[PartnerEligibilityCard] Fetching eligibility for partner:", {
        partnerUserId,
        partnerProfileId,
      });
      try {
        const res = await getAdminPartnerEligibility(partnerUserId, partnerProfileId);
        if (!res.ok) {
          console.warn("[PartnerEligibilityCard] Backend eligibility returned error status:", {
            status: res.status,
            error: res.error,
            rawResponse: res.data,
          });
          return undefined;
        }
        console.log("[PartnerEligibilityCard] Backend eligibility returned successfully:", res.data?.data);
        return res.data?.data;
      } catch (err) {
        console.error("[PartnerEligibilityCard] Error while fetching eligibility:", err);
        return undefined;
      }
    },
    staleTime: 30000,
  });

  // 1. Overall eligibility status
  const isEligible =
    eligibilityRes?.campaignEligibility === "Eligible" ||
    eligibilityRes?.gate?.campaignEligible === true ||
    eligibilityRes?.isEligible === true;

  // 2. Resolve checks prioritizing backend gate, falling back to local props
  const isKycApproved =
    eligibilityRes?.gate?.kycVerified ??
    eligibilityRes?.kycApproved ??
    (kycRecord?.status === "verified" || kycRecord?.status === "approved");

  const isVetted =
    eligibilityRes?.gate?.isVetted ??
    eligibilityRes?.vettingApproved ??
    Boolean(profile.isVetted);

  const hasSocials =
    eligibilityRes?.gate?.socialAccountsConnected ??
    eligibilityRes?.hasSocialAccounts ??
    Boolean(profile.socialAccounts && profile.socialAccounts.length > 0);

  // 3. Dynamic requirements from backend
  const requirements = eligibilityRes?.requirements;

  // Missing requirements list
  const missingRequirements: string[] =
    requirements && requirements.length > 0
      ? requirements.filter((r) => !r.status).map((r) => r.label)
      : [
          !isKycApproved && "KYC verification pending",
          !isVetted && "Admin vetting pending",
          !hasSocials && "Social media accounts not linked",
        ].filter(Boolean) as string[];

  const isFromBackend = Boolean(eligibilityRes);
  const statusLabel =
    eligibilityRes?.campaignEligibility || (isEligible ? "Eligible" : "Not Eligible");

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-[#0364FF]" />
          <p className="text-sm font-bold text-slate-900">Campaign Eligibility</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-slate-400 hover:text-slate-600 cursor-pointer"
          title="Refresh eligibility status"
          disabled={isFetching}
          onClick={() => {
            console.log("[PartnerEligibilityCard] Manually refetching eligibility...");
            refetch();
          }}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-[#0364FF]" : ""}`} />
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse py-2">
          <div className="h-4 bg-slate-100 rounded w-3/4" />
          <div className="h-4 bg-slate-100 rounded w-1/2" />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Matching Status</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                isEligible
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}
            >
              {statusLabel}
            </span>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            {requirements && requirements.length > 0 ? (
              requirements.map((req, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-slate-500">{req.label}</span>
                  <span
                    className={`inline-flex items-center gap-1 font-medium ${
                      req.status ? "text-emerald-600" : "text-amber-600"
                    }`}
                  >
                    {req.status ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                    )}
                    {req.status ? "Passed" : "Pending"}
                  </span>
                </div>
              ))
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">KYC Verification</span>
                  <span
                    className={`inline-flex items-center gap-1 font-medium ${
                      isKycApproved ? "text-emerald-600" : "text-amber-600"
                    }`}
                  >
                    {isKycApproved ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                    )}
                    {isKycApproved ? "Approved" : "Pending"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Admin Vetting</span>
                  <span
                    className={`inline-flex items-center gap-1 font-medium ${
                      isVetted ? "text-emerald-600" : "text-amber-600"
                    }`}
                  >
                    {isVetted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-amber-500" />
                    )}
                    {isVetted ? "Approved" : "Pending"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Social Accounts</span>
                  <span
                    className={`inline-flex items-center gap-1 font-medium ${
                      hasSocials ? "text-emerald-600" : "text-slate-400"
                    }`}
                  >
                    {hasSocials ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    {hasSocials ? "Linked" : "None"}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Missing Requirements breakdown */}
          {missingRequirements.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Missing Requirements ({missingRequirements.length})
                </p>
                {!isFromBackend && (
                  <span className="text-[9px] text-slate-400 font-mono">(computed locally)</span>
                )}
              </div>
              <ul className="text-xs text-slate-600 list-disc list-inside space-y-1 bg-amber-50/50 rounded-xl p-2.5 border border-amber-100/60">
                {missingRequirements.map((reason, i) => (
                  <li key={i} className="leading-tight">{reason}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
