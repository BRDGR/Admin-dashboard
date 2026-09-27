import { useQuery } from "@tanstack/react-query";
import { listOrganizations, getOrganization } from "@/lib/api";
import type { OrganizationsResponse, Organization } from "@/lib/types";

export function useOrganizations(page = 1, limit = 10) {
  return useQuery({
    queryKey: ["admin", "organizations", page, limit],
    queryFn: async () => {
      const res = await listOrganizations(page, limit);
      if (res.error) throw new Error(res.error);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const envelope = res.data as any;
      const payload = envelope?.data ?? envelope;
      return payload as OrganizationsResponse;
    },
  });
}

export function useOrganization(orgId: string) {
  return useQuery({
    queryKey: ["admin", "organization", orgId],
    queryFn: async () => {
      const res = await getOrganization(orgId);
      if (res.error) throw new Error(res.error);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const envelope = res.data as any;
      const payload = envelope?.data ?? envelope;
      return (payload?.organization ?? payload) as Organization;
    },
    enabled: Boolean(orgId),
  });
}
