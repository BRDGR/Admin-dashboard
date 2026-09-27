"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useState } from "react";
import { AdminAuthProvider } from "@/context/AdminAuthContext";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { retry: 1, staleTime: 30_000 },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <AdminAuthProvider>
        {children}
        <Toaster richColors position="top-right" />
      </AdminAuthProvider>
    </QueryClientProvider>
  );
}
