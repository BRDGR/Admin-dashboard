import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { listUsers } from "@/lib/api";
import { deleteClient } from "@/lib/api/clients.api";
import { toast } from "sonner";
import type { UsersResponse } from "@/lib/types";

export function useUsers(page = 1, limit = 20, search = "") {
  return useQuery({
    queryKey: ["admin", "users", page, limit, search],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const res = await listUsers(page, limit, search);
      if (res.error) throw new Error(res.error);
      return res.data?.data as UsersResponse;
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (clientUserId: string) => {
      const res = await deleteClient(clientUserId);
      if (!res.ok || res.error) {
        throw new Error(res.error || "Failed to delete client");
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "clients"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("Client account removed successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete client");
    },
  });
}
