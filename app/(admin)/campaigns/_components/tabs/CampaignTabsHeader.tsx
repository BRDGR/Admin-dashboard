"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Layers,
  ShieldCheck,
  BarChart3,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const CAMPAIGN_PAGES = [
  {
    label: "Pipeline & Approvals",
    href: "/campaigns",
    icon: Layers,
    description: "Review campaign submissions, AI partner matching, and activation",
  },
  {
    label: "Validation Queue",
    href: "/campaigns/validations",
    icon: ShieldCheck,
    description: "Attribution verification, fraud risk monitoring, and SLA queue",
  },
  {
    label: "360 Telemetry",
    href: "/campaigns/overview",
    icon: BarChart3,
    description: "Full vertical conversion funnel and live platform health",
  },
  {
    label: "Performance & PIP",
    href: "/campaigns/performance",
    icon: TrendingUp,
    description: "Partner SLA enforcement, leaderboard, and remediation plans",
  },
  {
    label: "Payouts & Audit",
    href: "/campaigns/payouts",
    icon: DollarSign,
    description: "Hamilton payout pools, holdbacks, and scoring config versioning",
  },
] as const;

export const CAMPAIGN_TABS = [
  "Queue & Approvals",
  "360 Overview",
  "Performance & PIP",
  "Payout Approvals & Audit",
] as const;

export type CampaignTabType = typeof CAMPAIGN_TABS[number];

interface CampaignTabsHeaderProps {
  activeTab?: CampaignTabType;
  onTabChange?: (tab: CampaignTabType) => void;
  badgeCounts?: Partial<Record<string, number | string>>;
}

export function CampaignTabsHeader({
  activeTab,
  onTabChange,
  badgeCounts,
}: CampaignTabsHeaderProps) {
  const pathname = usePathname();

  return (
    <div className="w-full border-b border-slate-200/80 bg-white/70 backdrop-blur-xs rounded-2xl p-1.5 shadow-2xs">
      <nav
        className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth"
        aria-label="Campaign sections navigation"
      >
        {CAMPAIGN_PAGES.map((page) => {
          const Icon = page.icon;
          // Determine active status:
          const isRouteActive =
            page.href === "/campaigns"
              ? pathname === "/campaigns"
              : pathname === page.href || pathname.startsWith(page.href + "/");

          const isActive =
            activeTab !== undefined
              ? (activeTab === "Queue & Approvals" && page.href === "/campaigns") ||
                (activeTab === "360 Overview" && page.href === "/campaigns/overview") ||
                (activeTab === "Performance & PIP" && page.href === "/campaigns/performance") ||
                (activeTab === "Payout Approvals & Audit" && page.href === "/campaigns/payouts")
              : isRouteActive;

          const badge = badgeCounts?.[page.label] ?? badgeCounts?.[page.href];

          // If onTabChange provided and tab matches, support tab switching; otherwise standard route Link
          if (onTabChange) {
            const mappedTab: CampaignTabType | null =
              page.href === "/campaigns"
                ? "Queue & Approvals"
                : page.href === "/campaigns/overview"
                ? "360 Overview"
                : page.href === "/campaigns/performance"
                ? "Performance & PIP"
                : page.href === "/campaigns/payouts"
                ? "Payout Approvals & Audit"
                : null;

            if (mappedTab) {
              return (
                <button
                  key={page.href}
                  type="button"
                  onClick={() => onTabChange(mappedTab)}
                  title={page.description}
                  className={cn(
                    "group relative flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all duration-150 cursor-pointer shrink-0 whitespace-nowrap",
                    isActive
                      ? "bg-white text-[#0364FF] shadow-xs border border-slate-200/80 font-bold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-3.5 h-3.5 transition-colors",
                      isActive
                        ? "text-[#0364FF]"
                        : "text-slate-400 group-hover:text-slate-600"
                    )}
                  />
                  <span>{page.label}</span>
                  {badge !== undefined && badge !== 0 && (
                    <span
                      className={cn(
                        "text-[10px] font-bold px-1.5 py-0.2 rounded-full transition-colors",
                        isActive
                          ? "bg-blue-50 text-[#0364FF] border border-blue-100"
                          : "bg-slate-100 text-slate-500"
                      )}
                    >
                      {badge}
                    </span>
                  )}
                </button>
              );
            }
          }

          return (
            <Link
              key={page.href}
              href={page.href}
              title={page.description}
              className={cn(
                "group relative flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all duration-150 cursor-pointer shrink-0 whitespace-nowrap",
                isActive
                  ? "bg-white text-[#0364FF] shadow-xs border border-slate-200/80 font-bold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent"
              )}
            >
              <Icon
                className={cn(
                  "w-3.5 h-3.5 transition-colors",
                  isActive
                    ? "text-[#0364FF]"
                    : "text-slate-400 group-hover:text-slate-600"
                )}
              />
              <span>{page.label}</span>
              {badge !== undefined && badge !== 0 && (
                <span
                  className={cn(
                    "text-[10px] font-bold px-1.5 py-0.2 rounded-full transition-colors",
                    isActive
                      ? "bg-blue-50 text-[#0364FF] border border-blue-100"
                      : "bg-slate-100 text-slate-500"
                  )}
                >
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
