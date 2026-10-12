import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listPartners,
  listNormalPartners,
  listBrdgrPartners,
  listUnmatchedPartners,
  listByopPartners,
  getPartner,
  deletePartner,
} from "@/lib/api";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import type { PartnersResponse } from "@/lib/types";

export function usePartners(page = 1, limit = 20, enabled = true) {
  return useQuery({
    enabled,
    queryKey: ["admin", "partners", page, limit],
    queryFn: async () => {
      const res = await listPartners(page, limit);
      if (res.error) throw new Error(res.error);
      return res.data?.data as PartnersResponse;
    },
  });
}

export function useNormalPartners(page = 1, limit = 20, enabled = true) {
  return useQuery({
    enabled,
    queryKey: ["admin", "partners", "normal", page, limit],
    queryFn: async () => {
      const res = await listNormalPartners(page, limit);
      if (res.error) throw new Error(res.error);
      return res.data?.data as PartnersResponse;
    },
  });
}

/** Branded hook for BRDGR Partners (formerly Normal Partners) */
export function useBrdgrPartners(page = 1, limit = 20, enabled = true) {
  return useQuery({
    enabled,
    queryKey: ["admin", "partners", "brdgr", page, limit],
    queryFn: async () => {
      const res = await listBrdgrPartners(page, limit);
      if (res.error) throw new Error(res.error);
      return res.data?.data as PartnersResponse;
    },
  });
}

/**
 * Hook to retrieve Unmatched Partners — verified/vetted partners currently not attached
 * to an active partnership or campaign.
 */
export function useUnmatchedPartners(page = 1, limit = 20, enabled = true) {
  return useQuery({
    enabled,
    queryKey: ["admin", "partners", "unmatched", page, limit],
    queryFn: async () => {
      const res = await listUnmatchedPartners(page, limit);
      if (res.error) throw new Error(res.error);
      const data = res.data?.data as PartnersResponse;
      if (data?.partners) {
        // Ensure only vetted partners are returned as unmatched/ready to match
        const unmatched = data.partners.filter((p) => Boolean(p.partnerProfile?.isVetted));
        return {
          ...data,
          partners: unmatched,
          pagination: {
            ...data.pagination,
            totalRecords: unmatched.length,
          },
        };
      }
      return data;
    },
  });
}

export function useByopPartners(page = 1, limit = 20, enabled = true) {
  return useQuery({
    enabled,
    queryKey: ["admin", "partners", "byop", page, limit],
    queryFn: async () => {
      const res = await listByopPartners(page, limit);
      if (res.error) throw new Error(res.error);
      return res.data?.data as PartnersResponse;
    },
  });
}

export function usePartner(userId: string) {
  return useQuery({
    queryKey: ["admin", "partner", userId],
    queryFn: async () => {
      logger.debug(`[usePartner] Fetching partner for id: ${userId}`);
      const res = await getPartner(userId);
      logger.debug(`[usePartner] getPartner response for ${userId}:`, res);

      if (res.error) throw new Error(res.error);

      const rawData = res.data?.data || res.data;

      // Check if rawData directly contains partner data
      if (
        rawData &&
        (
          ((rawData as { partners?: unknown[] }).partners?.length ?? 0) > 0 ||
          (rawData as { partnerProfile?: unknown }).partnerProfile ||
          (rawData as { user?: unknown }).user ||
          (rawData as { partner?: unknown }).partner
        )
      ) {
        return rawData as PartnersResponse;
      }

      // No data found from single-partner endpoint — return null rather than
      // issuing a fallback list fetch of 100 records to find one.
      logger.warn(`[usePartner] getPartner returned no usable data for userId: ${userId}`);
      return null;
    },
    enabled: Boolean(userId),
  });
}

export function useDeletePartner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (partnerUserId: string) => {
      const res = await deletePartner(partnerUserId);
      if (!res.ok || res.error) {
        throw new Error(res.error ?? "Failed to delete partner");
      }
      return res.data;
    },
    onSuccess: () => {
      toast.success("Partner removed successfully");
      qc.invalidateQueries({ queryKey: ["admin", "partners"] });
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
