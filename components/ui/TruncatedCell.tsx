"use client";

import React, { useState } from "react";
import { Copy, Check, Code, X, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── 1. Copyable Pill (Ideal for IDs, UUIDs, Tokens) ───────────────────────────

export interface CopyablePillProps {
  text: string;
  label?: string;
  maxWidth?: string;
  middleTruncate?: boolean;
  className?: string;
}

export function CopyablePill({
  text,
  label,
  maxWidth = "max-w-[160px]",
  middleTruncate = true,
  className,
}: CopyablePillProps) {
  const [copied, setCopied] = useState(false);

  const displayString = React.useMemo(() => {
    if (!text) return "—";
    if (!middleTruncate || text.length <= 16) return text;
    const start = text.slice(0, 8);
    const end = text.slice(-4);
    return `${start}…${end}`;
  }, [text, middleTruncate]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(`${label || "ID"} copied to clipboard`);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!text) return <span className="text-slate-400 text-xs">—</span>;

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={`Click to copy: ${text}`}
      className={cn(
        "group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-xs border transition-all cursor-pointer select-none",
        copied
          ? "bg-emerald-50 text-emerald-700 border-emerald-300"
          : "bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-[#0364FF] border-slate-200 hover:border-blue-200",
        maxWidth,
        className
      )}
    >
      <span className="truncate">{displayString}</span>
      {copied ? (
        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
      ) : (
        <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0364FF] shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
      )}
    </button>
  );
}

// ─── 2. Truncated Text with Click-to-View Modal & Native Tooltip ──────────────

export interface TruncatedTextProps {
  text: string;
  maxWidth?: string;
  copyable?: boolean;
  mono?: boolean;
  badge?: boolean;
  badgeColor?: string;
  label?: string;
  className?: string;
}

export function TruncatedText({
  text,
  maxWidth = "max-w-[280px]",
  copyable = true,
  mono = false,
  badge = false,
  badgeColor = "bg-slate-100 text-slate-700 border-slate-200",
  label,
  className,
}: TruncatedTextProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(`${label || "Text"} copied to clipboard`);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!text) return <span className="text-slate-400 text-xs">—</span>;

  const isLong = text.length > 28;

  return (
    <>
      <div
        onClick={isLong ? () => setIsOpen(true) : undefined}
        title={text}
        className={cn(
          "inline-flex items-center gap-1.5 transition-colors",
          isLong && "cursor-pointer group hover:text-[#0364FF]",
          mono && "font-mono text-xs",
          badge &&
            `px-2.5 py-1 rounded-md border text-xs font-semibold uppercase leading-none ${badgeColor}`,
          !badge && "text-sm text-slate-800 font-medium",
          maxWidth,
          className
        )}
      >
        <span className="truncate">{text}</span>
        {isLong && (
          <span
            className="text-[10px] text-slate-400 group-hover:text-[#0364FF] font-semibold opacity-60 group-hover:opacity-100 shrink-0"
            title="Click to view full text"
          >
            [more]
          </span>
        )}
      </div>

      {/* Full Content Inspection Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0364FF]" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  {label || "Information Details"}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-xs font-mono text-slate-800 break-words leading-relaxed max-h-[300px] overflow-y-auto select-all">
              {text}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400">Length: {text.length} characters</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Close
                </button>
                {copyable && (
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-3.5 py-1.5 rounded-xl bg-[#0364FF] hover:bg-[#0252D4] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Text
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── 3. JSON / Parameter Preview Cell with Interactive Modal ─────────────────

export interface JsonPreviewCellProps {
  data: Record<string, unknown> | null | undefined;
  label?: string;
  maxWidth?: string;
  className?: string;
}

export function JsonPreviewCell({
  data,
  label = "Parameters",
  maxWidth = "max-w-[260px]",
  className,
}: JsonPreviewCellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!data || Object.keys(data).length === 0) {
    return <span className="text-slate-400 text-xs italic">None</span>;
  }

  const keys = Object.keys(data);
  const formattedJson = JSON.stringify(data, null, 2);
  const summary = keys
    .slice(0, 2)
    .map((k) => `${k}: ${JSON.stringify(data[k])}`)
    .join(", ");
  const hasMore = keys.length > 2;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(formattedJson);
    setCopied(true);
    toast.success("JSON copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        title="Click to view full JSON payload"
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-xs font-mono text-slate-700 hover:text-[#0364FF] transition-all cursor-pointer truncate",
          maxWidth,
          className
        )}
      >
        <Code className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="truncate">
          {summary}
          {hasMore && "…"}
        </span>
      </button>

      {/* JSON Inspector Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-[#0364FF]" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  {label} ({keys.length} {keys.length === 1 ? "key" : "keys"})
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-xs max-h-[340px] overflow-auto select-all leading-relaxed">
              <pre className="whitespace-pre-wrap">{formattedJson}</pre>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="px-3.5 py-1.5 rounded-xl bg-[#0364FF] hover:bg-[#0252D4] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy JSON
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
