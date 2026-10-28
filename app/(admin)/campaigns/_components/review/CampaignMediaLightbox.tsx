"use client";

import { X, FileText, Download } from "lucide-react";
import type { MediaPreviewItem } from "./types";

interface CampaignMediaLightboxProps {
  media: MediaPreviewItem | null;
  onClose: () => void;
}

export function CampaignMediaLightbox({ media, onClose }: CampaignMediaLightboxProps) {
  if (!media) return null;

  return (
    <div
      className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden p-4 flex flex-col items-center justify-center relative border border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800 text-white text-xs mb-3">
          <span className="font-bold truncate pr-4">{media.name}</span>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="w-full flex items-center justify-center max-h-[65vh] overflow-hidden rounded-lg bg-black">
          {media.type === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={media.url}
              alt={media.name}
              className="max-h-[65vh] max-w-full object-contain"
            />
          ) : media.type === "video" ? (
            <video
              controls
              autoPlay
              src={media.url}
              className="max-h-[65vh] max-w-full rounded-lg"
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="p-8 text-center text-slate-400">
              <FileText className="w-16 h-16 mx-auto mb-2 text-slate-500" />
              <p className="text-sm font-semibold text-white mb-2">{media.name}</p>
              <a
                href={media.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0364FF] text-white rounded-xl text-xs font-bold"
              >
                <Download className="w-3.5 h-3.5" /> Download Document
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
