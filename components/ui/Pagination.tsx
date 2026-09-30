"use client";

import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Pagination as PaginationType } from "@/lib/types";

export interface PaginationProps {
  pagination: PaginationType;
  onPageChange: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  itemLabel?: string;
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, "...", total];
  }
  if (current >= total - 3) {
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, "...", current - 1, current, current + 1, "...", total];
}

export function Pagination({
  pagination,
  onPageChange,
  pageSize = 10,
  onPageSizeChange,
  itemLabel = "items",
}: PaginationProps) {
  const { currentPage, totalPages, totalRecords, hasNext, hasPrev } = pagination;

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-100 bg-white">
      {/* Left: Page Size Selector */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-normal">
        <span>Show</span>
        <div className="relative inline-flex items-center">
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
            disabled={!onPageSizeChange}
            aria-label="Items per page"
            className={cn(
              "appearance-none bg-white border border-slate-200/90 rounded-lg px-2.5 py-1 pr-6 text-xs font-semibold text-slate-800 outline-none transition-all",
              onPageSizeChange
                ? "hover:border-slate-300 focus:ring-2 focus:ring-[#0364FF]/20 focus:border-[#0364FF] cursor-pointer"
                : "cursor-default opacity-90"
            )}
          >
            {[10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 pointer-events-none" />
        </div>
        <span>{itemLabel} per page</span>
        {totalRecords > 0 && (
          <span className="hidden md:inline text-slate-400 ml-1">
            ({totalRecords} total)
          </span>
        )}
      </div>

      {/* Right: Segmented Numeric Page Controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* Previous Page */}
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!hasPrev || currentPage <= 1}
            aria-label="Previous page"
            className={cn(
              "w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 transition-colors",
              hasPrev && currentPage > 1
                ? "hover:bg-slate-100 cursor-pointer"
                : "opacity-30 cursor-not-allowed"
            )}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Page Number Pills */}
          {pages.map((p, idx) => {
            if (p === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-7 h-7 flex items-center justify-center text-xs text-slate-400 select-none"
                >
                  ...
                </span>
              );
            }

            const isCurrent = p === currentPage;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={cn(
                  "w-7 h-7 flex items-center justify-center rounded-lg text-xs font-medium transition-all cursor-pointer",
                  isCurrent
                    ? "bg-slate-900 text-white font-semibold shadow-2xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                {p}
              </button>
            );
          })}

          {/* Next Page */}
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNext || currentPage >= totalPages}
            aria-label="Next page"
            className={cn(
              "w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 transition-colors",
              hasNext && currentPage < totalPages
                ? "hover:bg-slate-100 cursor-pointer"
                : "opacity-30 cursor-not-allowed"
            )}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
