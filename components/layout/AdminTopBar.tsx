"use client";

import { Search } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { AdminNotificationCenter } from "./AdminNotificationCenter";

interface AdminTopBarProps {
  title?: string;
  subtitle?: string;
}

export function AdminTopBar({ title, subtitle }: AdminTopBarProps) {
  const { admin } = useAdminAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const name = admin?.firstName ?? "Admin";

  const displayTitle = title ?? `${greeting}, ${name}`;
  const displaySubtitle = subtitle ?? "Here's what's happening on the platform today.";

  return (
    <header className="flex items-center justify-between pb-6 pt-1 shrink-0">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{displayTitle}</h1>
        <p className="text-sm text-slate-500 mt-0.5">{displaySubtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-white border border-slate-200/80 rounded-full px-3.5 h-9 w-60 shadow-xs focus-within:ring-2 focus-within:ring-[#0364FF]/20 focus-within:border-[#0364FF] transition-all">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input placeholder="Search..." className="flex-1 text-xs bg-transparent outline-none text-slate-800 placeholder:text-slate-400" />
        </div>
        <AdminNotificationCenter />
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0364FF]/20 to-indigo-100 border-2 border-white shadow-sm flex items-center justify-center text-[#0364FF] font-bold text-sm select-none">
          {admin?.firstName?.[0] ?? "A"}
        </div>
      </div>
    </header>
  );
}
