"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { AdminSidebar } from "@/components/layout";
import { Loader2 } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { token, isInitializing } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isInitializing && !token) {
      router.replace("/login");
    }
  }, [token, isInitializing, router]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2F4F9]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#0364FF]" />
          <p className="text-xs text-slate-400 font-medium">Loading admin console…</p>
        </div>
      </div>
    );
  }

  if (!token) return null;

  return (
    <div className="flex h-screen bg-[#F2F4F9]">
      <AdminSidebar />
      <main className="flex-1 ml-[220px] overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
