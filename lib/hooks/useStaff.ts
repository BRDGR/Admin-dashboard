import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listStaff, getStaffMember, createStaff, getAdminProfile, getSeedHistory } from "@/lib/api";
import type { StaffResponse, StaffMember, CreateStaffPayload, SeedHistoryResponse } from "@/lib/types";
import { toast } from "sonner";

export function useStaff(page = 1, limit = 10) {
  return useQuery({
    queryKey: ["admin", "staff", page, limit],
    queryFn: async () => {
      const res = await listStaff(page, limit);
      if (res.error) throw new Error(res.error);
      return res.data?.data as StaffResponse;
    },
  });
}

export function useStaffMember(staffId: string) {
  return useQuery({
    queryKey: ["admin", "staff", staffId],
    queryFn: async () => {
      const res = await getStaffMember(staffId);
      if (res.error) throw new Error(res.error);
      return res.data?.data?.staff as StaffMember;
    },
    enabled: Boolean(staffId),
  });
}

export function useCreateStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateStaffPayload) => createStaff(payload),
    onSuccess: () => {
      toast.success("Staff member created");
      qc.invalidateQueries({ queryKey: ["admin", "staff"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useAdminProfile() {
  return useQuery({
    queryKey: ["admin", "profile"],
    queryFn: async () => {
      const res = await getAdminProfile();
      if (res.error) throw new Error(res.error);
      return res.data?.data?.user as StaffMember;
    },
  });
}

export function useSeedHistory() {
  return useQuery({
    queryKey: ["admin", "seed-history"],
    queryFn: async () => {
      const res = await getSeedHistory();
      if (res.error) throw new Error(res.error);
      return res.data?.data as SeedHistoryResponse;
    },
  });
}
