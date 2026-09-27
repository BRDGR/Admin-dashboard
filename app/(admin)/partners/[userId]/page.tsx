"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { AdminTopBar } from "@/components/layout";
import { StatusBadge, Button } from "@/components/ui";
import { usePartner } from "@/lib/hooks/usePartners";
import { usePartnerKycList } from "@/lib/hooks/useKyc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { vetPartner } from "@/lib/api/admin.api";
import { toast } from "sonner";
import { PartnerProfileCard } from "./_components/PartnerProfileCard";
import { PartnerStatusSidebar } from "./_components/PartnerStatusSidebar";

import type { PartnerRecord } from "@/lib/types";

function extractPartnerRecord(data: unknown): PartnerRecord | undefined {
  if (!data || typeof data !== "object") return undefined;
  const d = data as Record<string, unknown>;

  if (Array.isArray(d.partners) && d.partners.length > 0) {
    return d.partners[0] as PartnerRecord;
  }
  if (Array.isArray(data) && data.length > 0) {
    return data[0] as PartnerRecord;
  }
  if (d.partner && typeof d.partner === "object") {
    return d.partner as PartnerRecord;
  }
  if (d.partnerProfile || d.user) {
    return data as PartnerRecord;
  }
  return undefined;
}

export default function PartnerDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = use(params);
  const router = useRouter();
  const qc = useQueryClient();
  const { data, isLoading } = usePartner(userId);
  const { data: kycData } = usePartnerKycList(1, 50);

  const partner = extractPartnerRecord(data);
  const profile = partner?.partnerProfile;
  const user = partner?.user;

  const kycRecord = kycData?.records?.find(
    (r) => r.partnerUser?.id === user?.id || r.partnerProfile?.id === profile?.id
  );

  useEffect(() => {
    if (!isLoading) {
      if (partner) {
        console.log("[PartnerDetailPage] Partner data loaded successfully:", {
          userId,
          partner,
          profile,
          user,
          kycRecord,
        });
      } else {
        console.warn("[PartnerDetailPage] Partner record not found for userId:", userId, {
          rawResponse: data,
        });
      }
    }
  }, [isLoading, partner, profile, user, kycRecord, userId, data]);

  const vetMutation = useMutation({
    mutationFn: async (vetted: boolean) => {
      console.log("[PartnerDetailPage] Initiating vetMutation:", {
        partnerUserId: userId,
        partnerProfileId: profile?.id,
        isVetted: vetted,
        currentStatus: profile?.isVetted,
      });
      const res = await vetPartner(userId, vetted, profile?.id);
      console.log("[PartnerDetailPage] vetPartner API result:", res);
      if (!res.ok) {
        console.error("[PartnerDetailPage] vetPartner API returned error response:", {
          status: res.status,
          error: res.error,
          responseData: res.data,
        });
        const errMsg =
          res.error?.message ||
          (res.data as { message?: string })?.message ||
          "Failed to update vetting status";
        throw new Error(errMsg);
      }
      return res;
    },
    onSuccess: (res, vetted) => {
      const msg =
        res.data?.message ||
        (vetted ? "Partner approved & vetted successfully" : "Partner vetting revoked");
      console.log("[PartnerDetailPage] Vetting status updated successfully:", msg);
      toast.success(msg);
      qc.invalidateQueries({ queryKey: ["admin", "partner", userId] });
      qc.invalidateQueries({ queryKey: ["admin", "partners"] });
      qc.invalidateQueries({ queryKey: ["admin", "partner", userId, "eligibility"] });
    },
    onError: (err: Error) => {
      console.error("[PartnerDetailPage] Vetting status update error:", {
        errorMessage: err.message,
        errorStack: err.stack,
      });
      toast.error(err.message || "Failed to update vetting status");
    },
  });

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

  if (!partner || !profile || !user) {
    return (
      <div className="space-y-6">
        <AdminTopBar />
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <p className="text-sm text-slate-500">Partner not found.</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => router.back()}>
            Go back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminTopBar />

      {/* Header with back button & vetting action */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-slate-900">
            {user.firstName} {user.lastName}
          </h1>
          <p className="text-xs text-slate-400">
            {user.email} · Partner since {user.createdAt ? format(new Date(user.createdAt), "MMM d, yyyy") : "—"}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={profile.isVetted ? "approved" : "pending"} />
          {profile.isVetted ? (
            <Button
              variant="outline"
              size="sm"
              isLoading={vetMutation.isPending}
              onClick={() => vetMutation.mutate(false)}
            >
              <XCircle className="w-3.5 h-3.5 mr-1.5 text-red-500" /> Revoke Vetting
            </Button>
          ) : (
            <Button
              size="sm"
              isLoading={vetMutation.isPending}
              onClick={() => vetMutation.mutate(true)}
            >
              <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Approve & Vet
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid: Details + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <PartnerProfileCard user={user} profile={profile} />
        </div>
        <div className="lg:col-span-1">
          <PartnerStatusSidebar
            partnerUserId={userId}
            user={user}
            profile={profile}
            kycRecord={kycRecord}
          />
        </div>
      </div>
    </div>
  );
}
