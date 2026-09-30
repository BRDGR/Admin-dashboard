import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listUsers } from "@/lib/api";
import { deleteClient } from "@/lib/api/clients.api";
import { toast } from "sonner";
import type { UsersResponse } from "@/lib/types";

export function useUsers(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["admin", "users", page, limit],
    queryFn: async () => {
      const res = await listUsers(page, limit);
      if (res.error) throw new Error(res.error);
      const d = (res.data?.data ?? res.data) as any;
      return d as UsersResponse;
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
