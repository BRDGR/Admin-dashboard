import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listStaff,
  getStaffMember,
  createStaff,
  getAdminProfile,
  getSeedHistory,
  uploadAdminImage,
  removeAdminImage,
} from "@/lib/api";
import type { StaffResponse, StaffMember, CreateStaffPayload, SeedHistoryResponse } from "@/lib/types";
import { toast } from "sonner";

export function useStaff(page = 1, limit = 10) {
  return useQuery({
    queryKey: ["admin", "staff", page, limit],
    queryFn: async () => {
      const res = await listStaff(page, limit);
      if (!res.ok) throw new Error(res.error ?? "Failed to load staff");
      return res.data?.data as StaffResponse;
    },
  });
}

export function useStaffMember(staffId: string) {
  return useQuery({
    queryKey: ["admin", "staff", staffId],
    queryFn: async () => {
      const res = await getStaffMember(staffId);
      if (!res.ok) throw new Error(res.error ?? "Failed to load staff member");
      return res.data?.data?.staff as StaffMember;
    },
    enabled: Boolean(staffId),
  });
}

export function useCreateStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateStaffPayload) => {
      const res = await createStaff(payload);
      if (!res.ok || res.error) {
        const msg = res.status === 409
          ? "A staff account with this email already exists."
          : (res.error ?? "Failed to create staff member");
        throw new Error(msg);
      }
      return res.data;
    },
    onSuccess: () => {
      toast.success("Staff member created successfully");
      qc.invalidateQueries({ queryKey: ["admin", "staff"] });
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useAdminProfile() {
  return useQuery({
    queryKey: ["admin", "profile"],
    queryFn: async () => {
      const res = await getAdminProfile();
      if (!res.ok) throw new Error(res.error ?? "Failed to load profile");
      const raw = res.data?.data as unknown as { user?: StaffMember } & StaffMember;
      return (raw?.user ?? raw) as StaffMember;
    },
  });
}

export function useUploadAdminImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const res = await uploadAdminImage(file);
      if (!res.ok || res.error) {
        throw new Error(res.error ?? "Failed to upload profile image");
      }
      return res.data;
    },
    onSuccess: () => {
      toast.success("Admin profile image updated");
      qc.invalidateQueries({ queryKey: ["admin", "profile"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useRemoveAdminImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await removeAdminImage();
      if (!res.ok || res.error) {
        throw new Error(res.error ?? "Failed to remove profile image");
      }
      return res.data;
    },
    onSuccess: () => {
      toast.success("Admin profile image removed");
      qc.invalidateQueries({ queryKey: ["admin", "profile"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useSeedHistory() {
  return useQuery({
    queryKey: ["admin", "seed-history"],
    queryFn: async () => {
      const res = await getSeedHistory();
      if (!res.ok) throw new Error(res.error ?? "Failed to load seed history");
      return res.data?.data as SeedHistoryResponse;
    },
  });
}
