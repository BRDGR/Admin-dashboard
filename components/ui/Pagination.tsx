"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Pagination as PaginationType } from "@/lib/types";

interface PaginationProps {
  pagination: PaginationType;
  onPageChange: (page: number) => void;
}

export function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { currentPage, totalPages, totalRecords, hasNext, hasPrev } = pagination;

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/40">
      <p className="text-[11px] text-slate-400">
        Page <span className="font-semibold text-slate-600">{currentPage}</span> of{" "}
        <span className="font-semibold text-slate-600">{totalPages}</span> —{" "}
        <span className="font-semibold text-slate-600">{totalRecords}</span> total
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrev}
          className={cn(
            "w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 transition-colors",
            hasPrev ? "hover:bg-slate-200 cursor-pointer" : "opacity-30 cursor-not-allowed"
          )}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNext}
          className={cn(
            "w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 transition-colors",
            hasNext ? "hover:bg-slate-200 cursor-pointer" : "opacity-30 cursor-not-allowed"
          )}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
