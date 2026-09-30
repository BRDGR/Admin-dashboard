import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listKyc, listPartnerKycRecords,
  getPartnerKycRecord, reviewPartnerKyc,
  getOrganizationKyc, reviewOrgKyc,
} from "@/lib/api";
import type { KycListResponse, PartnerKycListResponse, KycReviewPayload } from "@/lib/types";
import { toast } from "sonner";

import { logger } from "@/lib/logger";

export function useOrgKycList(page = 1, limit = 10) {
  return useQuery({
    queryKey: ["admin", "kyc", "orgs", page, limit],
    queryFn: async () => {
      const res = await listKyc(page, limit);
      logger.debug("[KYC hook] useOrgKycList raw:", res.data);
      if (res.error) throw new Error(res.error);
      const d = (res.data?.data ?? res.data) as any;
      return d as KycListResponse;
    },
  });
}

export function useOrgKyc(orgId: string) {
  return useQuery({
    queryKey: ["admin", "kyc", "org", orgId],
    queryFn: async () => {
      const res = await getOrganizationKyc(orgId);
      logger.debug(`[KYC hook] useOrgKyc(${orgId}) raw:`, res.data);
      if (res.error) throw new Error(res.error);
      const d = (res.data?.data ?? res.data) as any;
      return d?.kycRecord ?? d?.records?.[0]?.kycRecord ?? d?.records?.[0] ?? d ?? null;
    },
    enabled: Boolean(orgId),
  });
}

export function usePartnerKycList(page = 1, limit = 10) {
  return useQuery({
    queryKey: ["admin", "kyc", "partners", page, limit],
    queryFn: async () => {
      const res = await listPartnerKycRecords(page, limit);
      logger.debug("[KYC hook] usePartnerKycList raw:", res.data);
      if (res.error) throw new Error(res.error);
      const d = (res.data?.data ?? res.data) as any;
      return d as PartnerKycListResponse;
    },
  });
}

export function usePartnerKycRecord(kycRecordId: string) {
  return useQuery({
    queryKey: ["admin", "kyc", "partner", kycRecordId],
    queryFn: async () => {
      const res = await getPartnerKycRecord(kycRecordId);
      logger.debug(`[KYC hook] usePartnerKycRecord(${kycRecordId}) raw:`, res.data);
      if (res.error) throw new Error(res.error);
      const d = (res.data?.data ?? res.data) as any;
      return d?.kycRecord ?? d?.records?.[0]?.kycRecord ?? d?.records?.[0] ?? d ?? null;
    },
    enabled: Boolean(kycRecordId),
  });
}

export function useReviewPartnerKyc() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: KycReviewPayload }) => {
      const res = await reviewPartnerKyc(id, payload);
      if (!res.ok || res.error) {
        throw new Error(res.error ?? "Failed to save partner KYC decision");
      }
      return res.data;
    },
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
    mutationFn: async ({ id, payload, orgId }: { id: string; payload: KycReviewPayload; orgId?: string }) => {
      const res = await reviewOrgKyc(id, payload, orgId);
      if (!res.ok || res.error) {
        throw new Error(res.error ?? "Failed to save organization KYC decision");
      }
      return res.data;
    },
    onSuccess: () => {
      toast.success("Organization KYC decision saved");
      qc.invalidateQueries({ queryKey: ["admin", "kyc"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
