import { useQuery } from "@tanstack/react-query";
import { listUsers } from "@/lib/api";
import type { UsersResponse } from "@/lib/types";

export function useUsers(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["admin", "users", page, limit],
    queryFn: async () => {
      const res = await listUsers(page, limit);
      if (res.error) throw new Error(res.error);
      return res.data?.data as UsersResponse;
    },
  });
}
