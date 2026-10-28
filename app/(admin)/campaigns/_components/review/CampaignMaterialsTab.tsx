"use client";

import {
  FileCheck,
  Play,
  FileText,
  Eye,
  Check,
  Ban,
  ExternalLink,
  Download,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { NormalizedMaterial, MediaPreviewItem } from "./types";

interface CampaignMaterialsTabProps {
  materials: NormalizedMaterial[];
  verifiedMaterialIds: Record<string, boolean>;
  onToggleVerified: (materialId: string, currentVerified: boolean) => void;
  onMarkAllVerified: () => void;
  onPreviewMedia: (media: MediaPreviewItem) => void;
}

export function CampaignMaterialsTab({
  materials,
  verifiedMaterialIds,
  onToggleVerified,
  onMarkAllVerified,
  onPreviewMedia,
}: CampaignMaterialsTabProps) {
  const verifiedCount = materials.filter(
    (m) => verifiedMaterialIds[m.id] !== false
  ).length;

  const progressPct =
    materials.length > 0 ? Math.round((verifiedCount / materials.length) * 100) : 100;

  return (
    <div className="space-y-5">
      {/* Review Summary Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 flex items-center justify-center font-bold shrink-0">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 leading-snug">
              Creative Assets Compliance Verification
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Verify display banners, promotional videos, and copywriting assets comply with marketing standards.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
          <div className="text-right">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <span>Verified:</span>
              <span className="text-emerald-700">{verifiedCount}</span>
              <span className="text-slate-400">/ {materials.length}</span>
              <span className="text-[10px] text-slate-400 font-semibold">({progressPct}%)</span>
            </div>
            {/* Progress bar */}
            <div className="w-28 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={onMarkAllVerified}
            className="text-xs font-bold px-3 py-1.5 bg-[#0364FF]/10 text-[#0364FF] hover:bg-[#0364FF]/20 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
          >
            Mark All Approved
          </button>
        </div>
      </div>

      {/* Grid of Materials */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {materials.map((mat) => {
          const isVerified = verifiedMaterialIds[mat.id] !== false;
          return (
            <div
              key={mat.id}
              className={cn(
                "rounded-2xl border p-3.5 flex flex-col justify-between transition-all bg-white relative group shadow-2xs",
                isVerified
                  ? "border-slate-200/90 hover:border-slate-300"
                  : "border-rose-300 bg-rose-50/20 ring-1 ring-rose-400/20"
              )}
            >
              <div>
                {/* Media Thumbnail or Icon Preview */}
                <div className="h-40 rounded-xl bg-slate-900/5 overflow-hidden relative mb-3 flex items-center justify-center border border-slate-100">
                  {mat.type === "image" && mat.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={mat.url}
                      alt={mat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 cursor-pointer"
                      onClick={() =>
                        onPreviewMedia({
                          url: mat.url!,
                          name: mat.name,
                          type: "image",
                        })
                      }
                    />
                  ) : mat.type === "video" ? (
                    <div
                      className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-white cursor-pointer relative group-hover:bg-slate-900 transition-colors"
                      onClick={() =>
                        mat.url &&
                        onPreviewMedia({
                          url: mat.url,
                          name: mat.name,
                          type: "video",
                        })
                      }
                    >
                      {mat.thumbnailUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={mat.thumbnailUrl}
                          alt={mat.name}
                          className="absolute inset-0 w-full h-full object-cover opacity-40"
                        />
                      )}
                      <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center z-10 group-hover:scale-110 transition-transform shadow-lg">
                        <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-300 z-10 mt-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs">
                        {mat.duration ? `${mat.duration}s Video` : "Watch Video Preview"}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 mb-2">
                        <FileText className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-medium text-slate-700 line-clamp-2 px-2">
                        {mat.snippet || mat.name}
                      </span>
                    </div>
                  )}

                  {/* Format Badge */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-slate-950/80 text-white backdrop-blur-xs">
                      {mat.type === "video"
                        ? "Video"
                        : mat.type === "image"
                        ? "Creative Banner"
                        : "Document"}
                    </span>
                    {mat.format && (
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-white/95 text-slate-700 shadow-2xs border border-slate-200/80">
                        {mat.format}
                      </span>
                    )}
                  </div>

                  {/* Quick Preview Button */}
                  {mat.url && mat.url !== "#" && (
                    <button
                      type="button"
                      onClick={() =>
                        onPreviewMedia({
                          url: mat.url!,
                          name: mat.name,
                          type:
                            mat.type === "video"
                              ? "video"
                              : mat.type === "image"
                              ? "image"
                              : "document",
                        })
                      }
                      className="absolute top-2.5 right-2.5 w-7 h-7 rounded-lg bg-white/95 text-slate-700 hover:bg-white shadow-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer border border-slate-200/60"
                      title="Enlarge preview"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Title and metadata */}
                <div className="space-y-1">
                  <p
                    className="text-xs font-bold text-slate-900 truncate leading-snug"
                    title={mat.name}
                  >
                    {mat.name}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                    {mat.fileSize && <span>{mat.fileSize}</span>}
                    {mat.fileSize && <span>•</span>}
                    <span className="capitalize">{mat.type} Asset</span>
                  </div>
                </div>
              </div>

              {/* Action & Verification footer */}
              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onToggleVerified(mat.id, isVerified)}
                  className={cn(
                    "text-[11px] font-bold flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer",
                    isVerified
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100/70"
                      : "bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100/70"
                  )}
                >
                  {isVerified ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Approved for Partners</span>
                    </>
                  ) : (
                    <>
                      <Ban className="w-3.5 h-3.5 text-rose-600" />
                      <span>Flagged / Needs Fix</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-1">
                  {mat.url && mat.url !== "#" && (
                    <>
                      <a
                        href={mat.url}
                        target="_blank"
                        rel="noreferrer"
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                        title="Open external link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={mat.url}
                        download={mat.name}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                        title="Download Asset"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
