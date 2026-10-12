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
        <div className="flex items-center gap-2 p-1 pr-3 rounded-full bg-white border border-slate-200/80 shadow-2xs select-none">
          <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-[#0364FF]/20 to-indigo-100 border border-slate-200/90 shadow-2xs flex items-center justify-center text-[#0364FF] font-bold text-xs overflow-hidden shrink-0">
            {admin?.imageUrl || admin?.avatarUrl ? (
              <img
                src={(admin.imageUrl || admin.avatarUrl)!}
                alt={admin.firstName ?? "Admin"}
                className="w-full h-full object-cover object-center"
              />
            ) : (
              admin?.firstName?.[0] ?? "A"
            )}
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1.5 ring-white" />
          </div>
          <div className="flex flex-col text-left leading-tight">
            <span className="text-xs font-bold text-slate-800 truncate max-w-[110px]">
              {admin?.firstName ?? "Admin"}
            </span>
            <span className="text-[10px] font-semibold text-slate-400 capitalize">
              {admin?.role ? admin.role.replace(/_/g, " ") : "Admin"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
