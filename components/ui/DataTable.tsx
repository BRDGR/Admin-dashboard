"use client";

import React, { useMemo } from "react";
import {
  Search,
  SlidersHorizontal,
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Pagination } from "./Pagination";
import type { Pagination as PaginationType } from "@/lib/types";

export interface Column<T> {
  key: string;
  header: string | React.ReactNode;
  width?: string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  sortDirection?: "asc" | "desc" | null;
  onSort?: () => void;
  render: (row: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  skeletonRows?: number;
  className?: string;

  // Row Selection
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  getRowId?: (row: T, index: number) => string;
  bulkActions?: React.ReactNode;

  // Search & Filter Toolbar
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  showFilterButton?: boolean;
  onFilterClick?: () => void;
  isFilterActive?: boolean;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  headerLeft?: React.ReactNode;
  headerRight?: React.ReactNode;

  // Optional Integrated Pagination
  pagination?: PaginationType;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  itemLabel?: string;

  // Density Mode (Normal vs Compact)
  density?: "normal" | "compact";
}

function SkeletonRow({ cols, hasCheckbox }: { cols: number; hasCheckbox: boolean }) {
  return (
    <tr className="border-b border-slate-100">
      {hasCheckbox && (
        <td className="px-5 py-4 w-10">
          <div className="w-4 h-4 bg-slate-100 rounded animate-pulse" />
        </td>
      )}
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <div
            className="h-3.5 bg-slate-100 rounded-full animate-pulse"
            style={{ width: `${60 + ((i * 19) % 35)}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

export function DataTable<T>({
  columns,
  data,
  isLoading,
  emptyMessage = "No data found.",
  skeletonRows = 6,
  className,
  density = "normal",

  // Selection
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  getRowId,
  bulkActions,

  // Toolbar
  searchPlaceholder,
  searchValue,
  onSearchChange,
  showFilterButton = false,
  onFilterClick,
  isFilterActive = false,
  primaryAction,
  headerLeft,
  headerRight,

  // Pagination
  pagination,
  onPageChange,
  pageSize = 10,
  onPageSizeChange,
  itemLabel = "items",
}: DataTableProps<T>) {
  // Compute default row ID if not provided
  const getEffectiveRowId = useMemo(() => {
    return (
      getRowId ??
      ((row: T, idx: number) => {
        const r = row as Record<string, unknown>;
        return (r?.id as string) ?? (r?._id as string) ?? (r?.key as string) ?? String(idx);
      })
    );
  }, [getRowId]);

  // Row selection state
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const allIds = useMemo(
    () => data.map((row, idx) => getEffectiveRowId(row, idx)),
    [data, getEffectiveRowId]
  );
  const isAllSelected =
    data.length > 0 && allIds.length > 0 && allIds.every((id) => selectedSet.has(id));
  const isPartiallySelected =
    !isAllSelected && allIds.some((id) => selectedSet.has(id));

  function handleToggleAll() {
    if (!onSelectionChange) return;
    if (isAllSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(allIds);
    }
  }

  function handleToggleRow(id: string) {
    if (!onSelectionChange) return;
    if (selectedSet.has(id)) {
      onSelectionChange(selectedIds.filter((item) => item !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  }

  // Determine if the toolbar should be displayed
  const hasToolbar = Boolean(
    searchPlaceholder ||
    onSearchChange ||
    showFilterButton ||
    primaryAction ||
    headerLeft ||
    headerRight ||
    (selectable && selectedIds.length > 0)
  );

  const isCompact = density === "compact";
  const thPadding = isCompact ? "px-4 py-3 text-xs" : "px-6 py-4 text-xs";
  const tdPadding = isCompact ? "px-4 py-3 text-xs" : "px-6 py-4 text-sm";
  const checkboxPadding = isCompact ? "w-10 px-3 py-3" : "w-12 px-6 py-4";
  const toolbarPadding = isCompact ? "px-5 py-3" : "px-6 py-4.5";

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all",
        className
      )}
    >
      {/* ── Top Toolbar (Matching Reference Design) ── */}
      {hasToolbar && (
        <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 bg-white", toolbarPadding)}>
          {/* Left Slot: Selection Indicator / Custom left */}
          <div className="flex items-center gap-3 min-h-[36px]">
            {selectable && selectedIds.length > 0 ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-900 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                  {selectedIds.length} {itemLabel} selected
                </span>
                {bulkActions}
                {onSelectionChange && (
                  <button
                    type="button"
                    onClick={() => onSelectionChange([])}
                    className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            ) : (
              headerLeft || <div />
            )}
          </div>

          {/* Right Slot: Search, Filter, Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap justify-end">
            {headerRight}

            {/* Search Input */}
            {onSearchChange && (
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchValue ?? ""}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={searchPlaceholder || `Search ${itemLabel}...`}
                  className="w-48 sm:w-60 h-9 pl-8 pr-7 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/90 rounded-xl outline-none focus:ring-2 focus:ring-[#0364FF]/20 focus:border-[#0364FF] transition-all placeholder:text-slate-400 text-slate-800"
                />
                {searchValue && (
                  <button
                    type="button"
                    onClick={() => onSearchChange("")}
                    className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center absolute right-2.5 top-1/2 -translate-y-1/2 hover:bg-slate-300 transition-colors cursor-pointer"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            )}

            {/* Filter Button */}
            {showFilterButton && (
              <button
                type="button"
                onClick={onFilterClick}
                className={cn(
                  "h-9 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer",
                  isFilterActive
                    ? "bg-[#0364FF]/10 border-[#0364FF]/30 text-[#0364FF]"
                    : "border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700"
                )}
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                <span>Filter</span>
              </button>
            )}

            {/* Primary Action Button (e.g. + Add Members) */}
            {primaryAction && (
              <button
                type="button"
                onClick={primaryAction.onClick}
                className="h-9 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
              >
                {primaryAction.icon || <Plus className="w-3.5 h-3.5" />}
                <span>{primaryAction.label}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Table Container ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-white">
              {selectable && (
                <th className={cn(checkboxPadding)}>
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isPartiallySelected;
                    }}
                    onChange={handleToggleAll}
                    aria-label="Select all rows"
                    className="w-4 h-4 rounded border-slate-300 text-slate-900 accent-slate-900 focus:ring-0 cursor-pointer transition-colors"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    thPadding,
                    "text-[11px] font-semibold text-slate-500 tracking-normal whitespace-nowrap",
                    col.align === "center" && "text-center",
                    col.align === "right" && "text-right",
                    col.sortable && "cursor-pointer hover:text-slate-800 select-none",
                    col.width
                  )}
                  onClick={col.sortable ? col.onSort : undefined}
                >
                  <div
                    className={cn(
                      "inline-flex items-center gap-1",
                      col.align === "center" && "justify-center",
                      col.align === "right" && "justify-end"
                    )}
                  >
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="text-slate-400">
                        {col.sortDirection === "asc" ? (
                          <ArrowUp className="w-3 h-3 text-slate-800" />
                        ) : col.sortDirection === "desc" ? (
                          <ArrowDown className="w-3 h-3 text-slate-800" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: skeletonRows }).map((_, i) => (
                <SkeletonRow key={i} cols={columns.length} hasCheckbox={selectable} />
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-6 py-16 text-center text-sm text-slate-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, i) => {
                const rowId = getEffectiveRowId(row, i);
                const isSelected = selectedSet.has(rowId);

                return (
                  <tr
                    key={rowId}
                    className={cn(
                      "border-b border-slate-100 transition-colors",
                      isSelected
                        ? "bg-slate-50/90"
                        : "hover:bg-slate-50/50 bg-white"
                    )}
                  >
                    {selectable && (
                      <td className={cn(checkboxPadding)}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleRow(rowId)}
                          aria-label={`Select row ${rowId}`}
                          className="w-4 h-4 rounded border-slate-300 text-slate-900 accent-slate-900 focus:ring-0 cursor-pointer transition-colors"
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          tdPadding,
                          "text-slate-700 align-middle",
                          col.align === "center" && "text-center",
                          col.align === "right" && "text-right",
                          col.width
                        )}
                      >
                        {col.render(row, i)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Optional Integrated Pagination ── */}
      {pagination && onPageChange && (
        <Pagination
          pagination={pagination}
          onPageChange={onPageChange}
          pageSize={pageSize}
          onPageSizeChange={onPageSizeChange}
          itemLabel={itemLabel}
        />
      )}
    </div>
  );
}

// ── Reusable Action Button (Exact Reference Styling: [ 🗑 Delete ] [ ✎ Edit ]) ──
export function TableActionButton({
  icon,
  label,
  onClick,
  variant = "outline",
  size = "md",
  disabled = false,
  className,
}: {
  icon?: React.ReactNode;
  label: string;
  onClick?: (e: React.MouseEvent) => void;
  variant?: "outline" | "danger" | "primary" | "subtle";
  size?: "sm" | "md";
  disabled?: boolean;
  className?: string;
}) {
  const variantStyles = {
    outline: "border-slate-200/90 text-slate-700 hover:bg-slate-50 hover:border-slate-300",
    danger: "border-red-200/80 text-red-600 hover:bg-red-50 hover:border-red-300",
    primary: "border-[#0364FF]/30 text-[#0364FF] hover:bg-blue-50/70",
    subtle: "border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-800",
  };

  const sizeStyles = {
    sm: "h-7 px-2.5 text-[11px] gap-1",
    md: "h-8 px-3 text-xs gap-1.5",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-lg border font-semibold flex items-center transition-all cursor-pointer",
        sizeStyles[size],
        variantStyles[variant],
        disabled && "opacity-40 cursor-not-allowed",
        className
      )}
    >
      {icon && <span className="shrink-0 text-slate-500">{icon}</span>}
      <span>{label}</span>
    </button>
  );
}

// ── Reusable Avatar Cell (Circular Avatar + Bold Name + Subtitle) ──
export function UserAvatarCell({
  name,
  subtitle,
  avatarUrl,
  size = "md",
  className,
}: {
  name: string;
  subtitle?: string;
  avatarUrl?: string | null;
  size?: "sm" | "md";
  className?: string;
}) {
  const initials = useMemo(() => {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [name]);

  const avatarSize = size === "sm" ? "w-7 h-7 text-[10px]" : "w-9 h-9 text-xs";

  return (
    <div className={cn("flex items-center min-w-0", size === "sm" ? "gap-2.5" : "gap-3", className)}>
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt={name}
          className={cn("rounded-full object-cover shrink-0 border border-slate-200", avatarSize)}
        />
      ) : (
        <div className={cn("rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 text-white font-bold flex items-center justify-center shrink-0 shadow-2xs", avatarSize)}>
          {initials}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p title={name} className={cn("font-bold text-slate-900 truncate leading-tight cursor-default", size === "sm" ? "text-xs" : "text-sm")}>{name}</p>
        {subtitle && (
          <p title={subtitle} className={cn("text-slate-500 truncate leading-tight mt-0.5 cursor-default", size === "sm" ? "text-[11px]" : "text-xs")}>{subtitle}</p>
        )}
      </div>
    </div>
  );
}
