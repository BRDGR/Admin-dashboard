"use client";

import { useState, useMemo } from "react";
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Send,
  Sparkles,
  Check,
  Clock,
  Download,
  Eye,
  SlidersHorizontal,
  Table as TableIcon,
  LayoutGrid,
} from "lucide-react";
import type { AdminPartnerLeaderboardItem, PartnerTier } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PartnerTelemetryDrawer } from "./PartnerTelemetryDrawer";

interface PartnerLeaderboardTableProps {
  partners: AdminPartnerLeaderboardItem[];
  isLoading?: boolean;
  onDispatchPip?: (partner: AdminPartnerLeaderboardItem) => void;
  selectedTierFilter?: string;
  onTierFilterChange?: (tier: string) => void;
}

type SortField =
  | "rank"
  | "name"
  | "score"
  | "multiplier"
  | "cr"
  | "volume"
  | "retention"
  | "compliance";

const TIER_CONFIG: Record<
  PartnerTier,
  {
    badge: string;
    border: string;
    text: string;
    barColor: string;
    multiplierColor: string;
    dotColor: string;
    hexColor: string;
  }
> = {
  Exceptional: {
    badge: "bg-emerald-50 text-emerald-800 border-emerald-200/90",
    border: "border-emerald-300",
    text: "text-emerald-700",
    barColor: "bg-emerald-500",
    multiplierColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
    dotColor: "bg-emerald-500",
    hexColor: "#10b981",
  },
  Strong: {
    badge: "bg-blue-50 text-[#0364FF] border-blue-200/90",
    border: "border-blue-300",
    text: "text-[#0364FF]",
    barColor: "bg-[#0364FF]",
    multiplierColor: "bg-blue-50 text-[#0364FF] border-blue-200",
    dotColor: "bg-[#0364FF]",
    hexColor: "#0364FF",
  },
  Performing: {
    badge: "bg-slate-100 text-slate-700 border-slate-200/90",
    border: "border-slate-300",
    text: "text-slate-700",
    barColor: "bg-slate-400",
    multiplierColor: "bg-slate-100 text-slate-700 border-slate-200",
    dotColor: "bg-slate-400",
    hexColor: "#64748b",
  },
  "Needs Attention": {
    badge: "bg-amber-50 text-amber-800 border-amber-200/90",
    border: "border-amber-300",
    text: "text-amber-700",
    barColor: "bg-amber-500",
    multiplierColor: "bg-amber-50 text-amber-800 border-amber-200",
    dotColor: "bg-amber-500",
    hexColor: "#f59e0b",
  },
  Critical: {
    badge: "bg-rose-50 text-rose-800 border-rose-200/90",
    border: "border-rose-300",
    text: "text-rose-700",
    barColor: "bg-rose-500",
    multiplierColor: "bg-rose-50 text-rose-800 border-rose-200",
    dotColor: "bg-rose-500",
    hexColor: "#ef4444",
  },
};

function MatureSparkline({
  data,
  tier,
  partnerId,
}: {
  data: number[];
  tier: PartnerTier;
  partnerId: string;
}) {
  if (!data || data.length < 2) return <span className="text-slate-300 font-mono">—</span>;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 74;
  const height = 22;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * (width - 6) + 3;
    const y = height - ((val - min) / range) * (height - 6) - 3;
    return { x, y };
  });

  const pathD = points.reduce((acc, curr, idx) => {
    if (idx === 0) return `M ${curr.x} ${curr.y}`;
    const prev = points[idx - 1];
    const cpX = (prev.x + curr.x) / 2;
    return `${acc} C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;
  const strokeColor = TIER_CONFIG[tier]?.hexColor || "#64748b";
  const gradId = `spark-grad-${partnerId.replace(/[^a-zA-Z0-9]/g, "")}`;

  const first = data[0];
  const last = data[data.length - 1];
  const isUp = last >= first;
  const diffPct = first > 0 ? (((last - first) / first) * 100).toFixed(1) : "0.0";

  return (
    <div className="flex items-center gap-1.5 justify-center">
      <svg width={width} height={height} className="overflow-visible shrink-0">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill={`url(#${gradId})`} />
        <path
          d={pathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r="2.2"
          fill={strokeColor}
        />
      </svg>
      <div
        className={cn(
          "flex items-center text-[10px] font-mono font-bold shrink-0",
          isUp ? "text-emerald-600" : "text-rose-500"
        )}
        title={`7-day trend: ${isUp ? "+" : ""}${diffPct}%`}
      >
        {isUp ? (
          <TrendingUp className="w-3 h-3 shrink-0" />
        ) : (
          <TrendingDown className="w-3 h-3 shrink-0" />
        )}
      </div>
    </div>
  );
}

export function PartnerLeaderboardTable({
  partners,
  isLoading,
  onDispatchPip,
  selectedTierFilter,
  onTierFilterChange,
}: PartnerLeaderboardTableProps) {
  const [internalTierFilter, setInternalTierFilter] = useState<string>("ALL");
  const tierFilter = selectedTierFilter !== undefined ? selectedTierFilter : internalTierFilter;
  const setTierFilter = onTierFilterChange || setInternalTierFilter;

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortField>("score");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");
  const [viewMode, setViewMode] = useState<"detailed" | "ticker">("detailed");
  const [selectedPartner, setSelectedPartner] = useState<AdminPartnerLeaderboardItem | null>(null);

  // Filter & Sort
  const filteredPartners = useMemo(() => {
    let list = partners;
    if (tierFilter !== "ALL") {
      list = list.filter((p) => p.tier === tierFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.partnerId.toLowerCase().includes(q)
      );
    }

    return [...list].sort((a, b) => {
      let valA = 0;
      let valB = 0;

      if (sortBy === "rank" || sortBy === "score") {
        valA = a.score;
        valB = b.score;
      } else if (sortBy === "name") {
        return sortOrder === "desc"
          ? b.name.localeCompare(a.name)
          : a.name.localeCompare(b.name);
      } else if (sortBy === "multiplier") {
        valA = a.multiplier;
        valB = b.multiplier;
      } else if (sortBy === "cr") {
        valA = a.attainments.conversionRate;
        valB = b.attainments.conversionRate;
      } else if (sortBy === "volume") {
        valA = a.attainments.volume;
        valB = b.attainments.volume;
      } else if (sortBy === "retention") {
        valA = a.attainments.retentionRate;
        valB = b.attainments.retentionRate;
      } else if (sortBy === "compliance") {
        valA = a.attainments.complianceScore;
        valB = b.attainments.complianceScore;
      }

      return sortOrder === "desc" ? valB - valA : valA - valB;
    });
  }, [partners, tierFilter, search, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredPartners.length / pageSize) || 1;
  const paginatedList = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredPartners.slice(start, start + pageSize);
  }, [filteredPartners, page, pageSize]);

  // Tier counts
  const tierCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: partners.length };
    partners.forEach((p) => {
      counts[p.tier] = (counts[p.tier] || 0) + 1;
    });
    return counts;
  }, [partners]);

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder(field === "name" ? "asc" : "desc");
    }
  };

  const renderSortIndicator = (field: SortField) => {
    if (sortBy !== field) {
      return (
        <ArrowUpDown className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
      );
    }
    return sortOrder === "desc" ? (
      <ArrowDown className="w-3 h-3 text-[#0364FF]" />
    ) : (
      <ArrowUp className="w-3 h-3 text-[#0364FF]" />
    );
  };

  const handleExportCSV = () => {
    const headers = [
      "Rank",
      "Partner Name",
      "Partner ID",
      "Score",
      "Tier",
      "Multiplier",
      "Conversion Rate (%)",
      "Trading Volume",
      "Retention Rate (%)",
      "Compliance Score (%)",
      "Governance Status",
    ];

    const rows = filteredPartners.map((p, idx) => [
      idx + 1,
      `"${p.name}"`,
      p.partnerId,
      p.score.toFixed(1),
      p.tier,
      `${p.multiplier.toFixed(2)}x`,
      p.attainments.conversionRate,
      p.attainments.volume,
      p.attainments.retentionRate,
      p.attainments.complianceScore,
      (p.consecutiveFlaggedWeeks ?? 0) >= 2
        ? `${p.consecutiveFlaggedWeeks}w Flagged`
        : "Healthy",
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `BRDGR_Leaderboard_${tierFilter}_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast.success("Leaderboard cohort exported to CSV");
  };

  return (
    <div className="space-y-3.5">
      {/* ── Top Toolbar: Segmented Filter Tabs + Search + Controls ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Tier Segmented Controller */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60 w-fit shrink-0">
          {(
            [
              "ALL",
              "Exceptional",
              "Strong",
              "Performing",
              "Needs Attention",
              "Critical",
            ] as const
          ).map((tier) => {
            const isActive = tierFilter === tier;
            const config = tier !== "ALL" ? TIER_CONFIG[tier] : null;

            return (
              <button
                key={tier}
                type="button"
                onClick={() => {
                  setTierFilter(tier);
                  setPage(1);
                }}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer flex items-center gap-2",
                  isActive
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                )}
              >
                {config && (
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full shrink-0",
                      config.dotColor
                    )}
                  />
                )}
                <span>{tier}</span>
                <span
                  className={cn(
                    "px-1.5 py-0.2 rounded-full text-[10px] font-mono",
                    isActive
                      ? "bg-slate-100 text-slate-900 font-bold"
                      : "bg-slate-200/60 text-slate-500"
                  )}
                >
                  {tierCounts[tier] || 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Actions Strip */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={`Search ${partners.length} partners...`}
              className="w-full text-xs pl-8.5 pr-7 py-2 bg-white border border-slate-200/90 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0364FF]/20 focus:border-[#0364FF] transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-xs text-slate-400 hover:text-slate-700 absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer font-bold"
              >
                ×
              </button>
            )}
          </div>

          {/* View Mode Toggle: Matrix vs Ticker */}
          <div className="hidden md:flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/60">
            <button
              type="button"
              onClick={() => setViewMode("detailed")}
              title="Detailed Matrix: dedicated columns for CR, Volume, Retention, and Compliance"
              className={cn(
                "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1",
                viewMode === "detailed"
                  ? "bg-white text-slate-900 shadow-2xs font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              <TableIcon className="w-3 h-3" />
              <span>Matrix</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("ticker")}
              title="Executive Ticker: unified horizontal benchmark summary"
              className={cn(
                "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1",
                viewMode === "ticker"
                  ? "bg-white text-slate-900 shadow-2xs font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              <LayoutGrid className="w-3 h-3" />
              <span>Ticker</span>
            </button>
          </div>

          {/* Density Switch */}
          <div className="hidden sm:flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/60">
            <button
              type="button"
              onClick={() => setDensity("comfortable")}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer",
                density === "comfortable"
                  ? "bg-white text-slate-900 shadow-2xs font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              Comfortable
            </button>
            <button
              type="button"
              onClick={() => setDensity("compact")}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer",
                density === "compact"
                  ? "bg-white text-slate-900 shadow-2xs font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              Compact
            </button>
          </div>

          {/* Export CSV */}
          <button
            type="button"
            onClick={handleExportCSV}
            title="Export Leaderboard Cohort as CSV"
            className="h-8 px-3 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* ── Enterprise Data Table Container ── */}
      <div className="border border-slate-200/80 rounded-2xl bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto min-w-full">
          <table
            className={cn(
              "w-full text-left text-xs border-collapse",
              viewMode === "detailed" ? "min-w-[1150px]" : "min-w-[1020px]"
            )}
          >
            <thead className="bg-[#F9FAFB] border-b border-slate-200/80 text-slate-500 font-semibold text-[11px] uppercase tracking-wider sticky top-0 z-10 select-none">
              <tr>
                {/* 1. Rank */}
                <th
                  className="py-3 px-3.5 w-14 text-center cursor-pointer group"
                  onClick={() => handleSort("rank")}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>#</span>
                    {renderSortIndicator("rank")}
                  </div>
                </th>

                {/* 2. Partner */}
                <th
                  className="py-3 px-3.5 min-w-[210px] cursor-pointer group"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center gap-1">
                    <span>Partner</span>
                    {renderSortIndicator("name")}
                  </div>
                </th>

                {/* 3. Overall Score */}
                <th
                  className="py-3 px-3.5 w-32 cursor-pointer group"
                  onClick={() => handleSort("score")}
                >
                  <div className="flex items-center gap-1">
                    <span>Score (0–100)</span>
                    {renderSortIndicator("score")}
                  </div>
                </th>

                {/* 4. Tier & Multiplier */}
                <th
                  className="py-3 px-3.5 w-38 cursor-pointer group"
                  onClick={() => handleSort("multiplier")}
                >
                  <div className="flex items-center gap-1">
                    <span>Tier & Multiplier</span>
                    {renderSortIndicator("multiplier")}
                  </div>
                </th>

                {/* KPI Attainments (Detailed or Ticker mode) */}
                {viewMode === "detailed" ? (
                  <>
                    <th
                      className="py-3 px-3 w-22 text-right cursor-pointer group"
                      onClick={() => handleSort("cr")}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>CR</span>
                        {renderSortIndicator("cr")}
                      </div>
                    </th>
                    <th
                      className="py-3 px-3 w-22 text-right cursor-pointer group"
                      onClick={() => handleSort("volume")}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Volume</span>
                        {renderSortIndicator("volume")}
                      </div>
                    </th>
                    <th
                      className="py-3 px-3 w-22 text-right cursor-pointer group"
                      onClick={() => handleSort("retention")}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Retention</span>
                        {renderSortIndicator("retention")}
                      </div>
                    </th>
                    <th
                      className="py-3 px-3 w-24 text-right cursor-pointer group"
                      onClick={() => handleSort("compliance")}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Compliance</span>
                        {renderSortIndicator("compliance")}
                      </div>
                    </th>
                  </>
                ) : (
                  <th className="py-3 px-3.5 min-w-[280px]">
                    Attainment Benchmarks (CR · Vol · Ret · Comp)
                  </th>
                )}

                {/* 7-Day Trajectory */}
                <th className="py-3 px-3.5 w-32 text-center">7-Day Trajectory</th>

                {/* Governance Status */}
                <th className="py-3 px-3.5 w-34 text-center">Governance Status</th>

                {/* Actions */}
                <th className="py-3 px-3.5 w-24 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={viewMode === "detailed" ? 11 : 8}
                    className="py-16 text-center text-slate-400"
                  >
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-6 h-6 border-2 border-[#0364FF] border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs font-medium text-slate-500">
                        Loading partner performance cohort...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : paginatedList.length === 0 ? (
                <tr>
                  <td
                    colSpan={viewMode === "detailed" ? 11 : 8}
                    className="py-16 text-center text-slate-400"
                  >
                    <div className="max-w-xs mx-auto space-y-2">
                      <p className="font-bold text-slate-800 text-sm">No partners found</p>
                      <p className="text-xs text-slate-400">
                        Try modifying your tier selection or clear the search query.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedList.map((partner, index) => {
                  const globalRank = (page - 1) * pageSize + index + 1;
                  const config = TIER_CONFIG[partner.tier] || TIER_CONFIG.Performing;
                  const isTopRank = globalRank <= 3;
                  const isPipFlagged = (partner.consecutiveFlaggedWeeks ?? 0) >= 2;
                  const isCompact = density === "compact";

                  return (
                    <tr
                      key={partner.partnerId}
                      onClick={() => setSelectedPartner(partner)}
                      className={cn(
                        "group transition-colors duration-100 cursor-pointer select-none whitespace-nowrap",
                        isPipFlagged
                          ? "bg-rose-50/20 hover:bg-rose-50/40"
                          : "hover:bg-slate-50/80",
                        isCompact ? "h-10" : "h-13"
                      )}
                    >
                      {/* 1. Rank */}
                      <td className="py-2 px-3.5 text-center">
                        {isTopRank ? (
                          <span
                            className={cn(
                              "inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-extrabold shadow-2xs font-mono",
                              globalRank === 1
                                ? "bg-amber-100 text-amber-900 border border-amber-300"
                                : globalRank === 2
                                ? "bg-slate-100 text-slate-800 border border-slate-300"
                                : "bg-amber-50 text-amber-800 border border-amber-200"
                            )}
                          >
                            #{globalRank}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono font-medium text-xs">
                            #{globalRank}
                          </span>
                        )}
                      </td>

                      {/* 2. Partner Name & ID */}
                      <td className="py-2 px-3.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0 shadow-2xs">
                            {partner.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="font-bold text-slate-900 text-xs truncate group-hover:text-[#0364FF] transition-colors">
                                {partner.name}
                              </span>
                              {partner.tier === "Exceptional" && (
                                <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                              )}
                            </div>
                            <span className="text-[11px] font-mono text-slate-400 leading-none">
                              {partner.partnerId}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 3. Overall Score Gauge */}
                      <td className="py-2 px-3.5">
                        <div className="space-y-1 w-24">
                          <div className="flex items-baseline justify-between">
                            <span className="font-extrabold text-slate-900 text-xs font-mono">
                              {partner.score.toFixed(1)}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">/ 100</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                            <div
                              className={cn("h-full rounded-full transition-all", config.barColor)}
                              style={{ width: `${Math.min(partner.score, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* 4. Tier & Multiplier Badge */}
                      <td className="py-2 px-3.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border",
                              config.badge
                            )}
                          >
                            <span
                              className={cn("w-1.5 h-1.5 rounded-full shrink-0", config.dotColor)}
                            />
                            {partner.tier}
                          </span>
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-md font-mono font-bold text-[11px] border",
                              config.multiplierColor
                            )}
                          >
                            {partner.multiplier.toFixed(2)}x
                          </span>
                        </div>
                      </td>

                      {/* 5. Attainment Benchmarks */}
                      {viewMode === "detailed" ? (
                        <>
                          {/* CR */}
                          <td className="py-2 px-3 text-right">
                            <span className="font-mono font-bold text-slate-900 tabular-nums">
                              {partner.attainments.conversionRate}%
                            </span>
                          </td>

                          {/* Vol */}
                          <td className="py-2 px-3 text-right">
                            <span className="font-mono font-bold text-slate-900 tabular-nums">
                              {partner.attainments.volume}
                            </span>
                          </td>

                          {/* Ret */}
                          <td className="py-2 px-3 text-right">
                            <span className="font-mono font-bold text-slate-900 tabular-nums">
                              {partner.attainments.retentionRate}%
                            </span>
                          </td>

                          {/* Comp */}
                          <td className="py-2 px-3 text-right">
                            <span className="font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded-md tabular-nums">
                              {partner.attainments.complianceScore}%
                            </span>
                          </td>
                        </>
                      ) : (
                        <td className="py-2 px-3.5">
                          <div className="flex items-center gap-3 text-xs">
                            {/* CR */}
                            <div className="flex items-baseline gap-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">
                                CR
                              </span>
                              <span className="font-mono font-bold text-slate-900 tabular-nums">
                                {partner.attainments.conversionRate}%
                              </span>
                            </div>
                            <span className="text-slate-200">·</span>

                            {/* Vol */}
                            <div className="flex items-baseline gap-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">
                                Vol
                              </span>
                              <span className="font-mono font-bold text-slate-900 tabular-nums">
                                {partner.attainments.volume}
                              </span>
                            </div>
                            <span className="text-slate-200">·</span>

                            {/* Ret */}
                            <div className="flex items-baseline gap-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">
                                Ret
                              </span>
                              <span className="font-mono font-bold text-slate-900 tabular-nums">
                                {partner.attainments.retentionRate}%
                              </span>
                            </div>
                            <span className="text-slate-200">·</span>

                            {/* Comp */}
                            <div className="flex items-baseline gap-1">
                              <span className="text-[10px] font-bold text-emerald-600 uppercase">
                                Comp
                              </span>
                              <span className="font-mono font-bold text-emerald-700 tabular-nums">
                                {partner.attainments.complianceScore}%
                              </span>
                            </div>
                          </div>
                        </td>
                      )}

                      {/* 6. 7-Day Trajectory */}
                      <td className="py-2 px-3.5 text-center">
                        <MatureSparkline
                          data={partner.sparkline}
                          tier={partner.tier}
                          partnerId={partner.partnerId}
                        />
                      </td>

                      {/* 7. Governance Status */}
                      <td className="py-2 px-3.5 text-center">
                        {isPipFlagged ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 shadow-2xs">
                            <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                            {partner.consecutiveFlaggedWeeks}w Flagged
                          </span>
                        ) : partner.consecutiveFlaggedWeeks === 1 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                            1w Watch
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                            <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                            Healthy
                          </span>
                        )}
                      </td>

                      {/* 8. Actions */}
                      <td className="py-2 px-3.5 text-right">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {isPipFlagged && onDispatchPip && (
                            <button
                              type="button"
                              onClick={() => onDispatchPip(partner)}
                              className="px-2 py-1 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                              title="Dispatch Performance Improvement Plan Notice"
                            >
                              <Send className="w-3 h-3 text-rose-600" />
                              <span>PIP</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedPartner(partner)}
                            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Inspect Partner Telemetry & Score Breakdown"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Enterprise Pagination Footer ── */}
        <div className="p-3.5 bg-[#F9FAFB] border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span>
              Showing <span className="font-bold text-slate-900 font-mono">{paginatedList.length}</span> of{" "}
              <span className="font-bold text-slate-900 font-mono">{filteredPartners.length}</span> partners
              {filteredPartners.length !== partners.length && (
                <span className="text-slate-400 font-normal"> (filtered from {partners.length} total)</span>
              )}
            </span>

            {/* Page Size Selector */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 text-slate-500">
              <span className="text-[11px]">Rows:</span>
              {[20, 50, 100].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    setPageSize(size);
                    setPage(1);
                  }}
                  className={cn(
                    "px-2 py-0.5 rounded-md text-[11px] font-mono cursor-pointer transition-colors",
                    pageSize === size
                      ? "bg-slate-900 text-white font-bold"
                      : "text-slate-600 hover:bg-slate-200/60"
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* First Page */}
            <button
              type="button"
              onClick={() => setPage(1)}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs transition-colors"
              title="First Page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>

            {/* Previous */}
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="font-semibold text-slate-800 px-2 font-mono text-xs">
              Page {page} of {totalPages}
            </span>

            {/* Next */}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Last Page */}
            <button
              type="button"
              onClick={() => setPage(totalPages)}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs transition-colors"
              title="Last Page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Partner Telemetry Drawer ── */}
      {selectedPartner && (
        <PartnerTelemetryDrawer
          partner={selectedPartner}
          onClose={() => setSelectedPartner(null)}
          onDispatchPip={(p) => {
            onDispatchPip?.(p);
          }}
        />
      )}
    </div>
  );
}
