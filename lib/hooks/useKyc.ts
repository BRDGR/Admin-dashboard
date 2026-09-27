import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listKyc, listPartnerKycRecords,
  getPartnerKycRecord, reviewPartnerKyc,
  getOrganizationKyc, reviewOrgKyc,
} from "@/lib/api";
import type { KycListResponse, PartnerKycListResponse, KycReviewPayload } from "@/lib/types";
import { toast } from "sonner";

export function useOrgKycList(page = 1, limit = 10) {
  return useQuery({
    queryKey: ["admin", "kyc", "orgs", page, limit],
    queryFn: async () => {
      const res = await listKyc(page, limit);
      console.log("[KYC hook] useOrgKycList — res.data?.data:", res.data?.data);
      if (res.error) throw new Error(res.error);
      return res.data?.data as KycListResponse;
    },
  });
}

export function useOrgKyc(orgId: string) {
  return useQuery({
    queryKey: ["admin", "kyc", "org", orgId],
    queryFn: async () => {
      const res = await getOrganizationKyc(orgId);
      console.log(`[KYC hook] useOrgKyc(${orgId}) — res.data?.data?.kycRecord:`, res.data?.data?.kycRecord);
      if (res.error) throw new Error(res.error);
      return res.data?.data?.kycRecord;
    },
    enabled: Boolean(orgId),
  });
}

export function usePartnerKycList(page = 1, limit = 10) {
  return useQuery({
    queryKey: ["admin", "kyc", "partners", page, limit],
    queryFn: async () => {
      const res = await listPartnerKycRecords(page, limit);
      console.log("[KYC hook] usePartnerKycList — res.data?.data:", res.data?.data);
      if (res.error) throw new Error(res.error);
      return res.data?.data as unknown as PartnerKycListResponse;
    },
  });
}

export function usePartnerKycRecord(kycRecordId: string) {
  return useQuery({
    queryKey: ["admin", "kyc", "partner", kycRecordId],
    queryFn: async () => {
      const res = await getPartnerKycRecord(kycRecordId);
      console.log(`[KYC hook] usePartnerKycRecord(${kycRecordId}) — res.data?.data:`, res.data?.data);
      if (res.error) throw new Error(res.error);
      return res.data?.data as KycListResponse;
    },
    enabled: Boolean(kycRecordId),
  });
}

export function useReviewPartnerKyc() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: KycReviewPayload }) =>
      reviewPartnerKyc(id, payload),
    onSuccess: () => {
      toast.success("Partner KYC decision saved");
      qc.invalidateQueries({ queryKey: ["admin", "kyc"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useReviewOrgKyc() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload, orgId }: { id: string; payload: KycReviewPayload; orgId?: string }) =>
      reviewOrgKyc(id, payload, orgId),
    onSuccess: () => {
      toast.success("Organization KYC decision saved");
      qc.invalidateQueries({ queryKey: ["admin", "kyc"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
