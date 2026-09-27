"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Building2,
  ShieldCheck, Link2, UserCog, LogOut,
  BarChart3, Settings, Megaphone, Contact,
  GitPullRequest, Briefcase, CalendarCheck, ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/context/AdminAuthContext";

const MAIN_NAV = [
  { label: "Overview",        href: "/overview",        icon: LayoutDashboard },
  { label: "Campaigns",       href: "/campaigns",       icon: Megaphone },
  { label: "Directory",       href: "/directory",       icon: Contact },
  { label: "Pending Changes", href: "/pending-changes", icon: GitPullRequest },
  { label: "Partners",        href: "/partners",        icon: Users },
  { label: "Clients",         href: "/clients",         icon: Briefcase },
  { label: "Organizations",   href: "/organizations",   icon: Building2 },
  { label: "KYC",             href: "/kyc",             icon: ShieldCheck },
  { label: "BYOP",            href: "/byop",            icon: Link2 },
  { label: "Analytics",       href: "/analytics",       icon: BarChart3 },
  { label: "Waitlist",        href: "/waitlist",        icon: ClipboardList },
  { label: "Demo Requests",   href: "/demo-requests",   icon: CalendarCheck },
];

const BOTTOM_NAV = [
  { label: "Users",    href: "/users",    icon: Users },
  { label: "Staff",    href: "/staff",    icon: UserCog },
  { label: "Settings", href: "/settings", icon: Settings },
];

function NavItem({ href, label, icon: Icon }: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 group",
        active
          ? "bg-white text-slate-900 shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-slate-200/80 font-semibold"
          : "text-slate-500 hover:text-slate-900 hover:bg-white/60"
      )}
    >
      <Icon className={cn("w-4 h-4 shrink-0 transition-colors", active ? "text-[#0364FF]" : "text-slate-400 group-hover:text-slate-600")} />
      <span className="truncate">{label}</span>
      {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#0364FF] shrink-0" />}
    </Link>
  );
}

export function AdminSidebar() {
  const { admin, logout } = useAdminAuth();

  return (
    <aside className="fixed top-0 left-0 h-screen w-[220px] z-40 flex flex-col border-r border-slate-200/80 bg-[#F8F9FB]">
      {/* Logo */}
      <div className="h-[64px] shrink-0 flex items-center gap-2.5 px-5 border-b border-slate-200/60">
        <div className="w-7 h-7 rounded-lg bg-[#0364FF] flex items-center justify-center shrink-0 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-[13px] font-bold text-slate-900 leading-none">Brdgr</p>
          <p className="text-[10px] text-[#0364FF] font-semibold mt-0.5 uppercase tracking-wide">Admin</p>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 mb-2">Main</p>
        {MAIN_NAV.map((item) => <NavItem key={item.href} {...item} />)}

        <div className="pt-4">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 mb-2">Management</p>
          {BOTTOM_NAV.map((item) => <NavItem key={item.href} {...item} />)}
        </div>
      </nav>

      {/* Admin profile + logout */}
      <div className="px-3 py-3 border-t border-slate-200/60">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0364FF]/20 to-indigo-100 flex items-center justify-center text-[#0364FF] font-bold text-xs shrink-0">
            {admin?.firstName?.[0] ?? "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-slate-900 truncate">
              {admin ? `${admin.firstName} ${admin.lastName}` : "Admin"}
            </p>
            <p className="text-[10px] text-slate-400 truncate capitalize">{admin?.role ?? "admin"}</p>
          </div>
          <button onClick={logout} title="Log out" className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors cursor-pointer shrink-0">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
