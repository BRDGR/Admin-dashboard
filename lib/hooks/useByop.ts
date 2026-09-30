import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listByopRelationships, getByopRelationship,
  getByopAnalytics, deleteByopInvitations, adminInviteByopPartner,
  type AdminByopInvitePayload,
} from "@/lib/api";
import type { ByopRelationshipsResponse, ByopAnalytics, ByopRelationship } from "@/lib/types";
import { toast } from "sonner";

export function useByopRelationships(page = 1, limit = 20, search?: string, clientOrgId?: string) {
  return useQuery({
    queryKey: ["admin", "byop", "relationships", page, limit, search, clientOrgId],
    queryFn: async () => {
      const res = await listByopRelationships(page, limit, search, clientOrgId);
      if (!res.ok) throw new Error(res.error ?? "Failed to load BYOP relationships");
      return res.data?.data as ByopRelationshipsResponse;
    },
  });
}

export function useByopRelationship(relationshipId: string) {
  return useQuery({
    queryKey: ["admin", "byop", "relationship", relationshipId],
    queryFn: async () => {
      const res = await getByopRelationship(relationshipId);
      if (!res.ok) throw new Error(res.error ?? "Failed to load relationship");
      const records = (res.data?.data as { records?: ByopRelationship[] } | null)?.records;
      return records?.[0] ?? null;
    },
    enabled: Boolean(relationshipId),
  });
}

export function useByopAnalytics() {
  return useQuery({
    queryKey: ["admin", "byop", "analytics"],
    queryFn: async () => {
      const res = await getByopAnalytics();
      if (!res.ok) throw new Error(res.error ?? "Failed to load analytics");
      return res.data?.data as ByopAnalytics;
    },
  });
}

export function useDeleteByopInvitations() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteByopInvitations,
    onSuccess: () => {
      toast.success("Invitations cleaned up");
      qc.invalidateQueries({ queryKey: ["admin", "byop"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useInviteByopPartner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminByopInvitePayload) => adminInviteByopPartner(payload),
    onSuccess: () => {
      toast.success("Partner invitation sent");
      qc.invalidateQueries({ queryKey: ["admin", "byop"] });
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to send invitation"),
  });
}
