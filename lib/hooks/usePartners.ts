import { useQuery } from "@tanstack/react-query";
import { listPartners, listNormalPartners, listByopPartners, getPartner } from "@/lib/api";
import type { PartnersResponse } from "@/lib/types";

export function usePartners(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["admin", "partners", page, limit],
    queryFn: async () => {
      const res = await listPartners(page, limit);
      if (res.error) throw new Error(res.error);
      return res.data?.data as PartnersResponse;
    },
  });
}

export function useNormalPartners(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["admin", "partners", "normal", page, limit],
    queryFn: async () => {
      const res = await listNormalPartners(page, limit);
      if (res.error) throw new Error(res.error);
      return res.data?.data as PartnersResponse;
    },
  });
}

export function useByopPartners(page = 1, limit = 20) {
  return useQuery({
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
      console.log(`[usePartner] Fetching partner for id: ${userId}`);
      const res = await getPartner(userId);
      console.log(`[usePartner] getPartner response for ${userId}:`, res);

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

      // If individual endpoint didn't find the partner, fall back to listPartners
      console.warn(
        `[usePartner] Individual getPartner returned no partner, trying listPartners fallback for ${userId}...`
      );
      const listRes = await listPartners(1, 100);
      const list = listRes.data?.data?.partners || [];
      const found = list.find(
        (p) =>
          p.user?.id === userId ||
          p.partnerProfile?.id === userId ||
          p.partnerProfile?.userId === userId
      );

      if (found) {
        console.log(`[usePartner] Found partner in listPartners fallback:`, found);
        return {
          partners: [found],
          pagination: {
            currentPage: 1,
            nextPage: null,
            prevPage: null,
            hasNext: false,
            hasPrev: false,
            totalPages: 1,
            totalRecords: 1,
          },
        } as PartnersResponse;
      }

      console.warn(`[usePartner] Partner not found in listPartners fallback either for ${userId}`);
      return rawData as PartnersResponse;
    },
    enabled: Boolean(userId),
  });
}
