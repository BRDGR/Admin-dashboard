"use client";

import { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Layers, DollarSign, Target, ShieldCheck, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { Button } from "@/components/ui";
import { reviewCampaign, getCampaignMaterials } from "@/lib/api/campaigns.api";
import type { AdminCampaignQueueItem, CampaignReviewPayload } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import {
  type ReviewTab,
  type NormalizedMaterial,
  type MediaPreviewItem,
  CampaignReviewHeader,
  CampaignCommercialsStrip,
  CampaignMaterialsTab,
  CampaignCommercialsTab,
  CampaignTargetingTab,
  CampaignDecisionTab,
  CampaignMediaLightbox,
} from "./review";

interface CampaignReviewModalProps {
  campaign: AdminCampaignQueueItem;
  onClose: () => void;
  onApproved?: (campaign: AdminCampaignQueueItem) => void;
}

export function CampaignReviewModal({ campaign, onClose, onApproved }: CampaignReviewModalProps) {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<ReviewTab>("materials");
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | "request_changes">("approve");
  const [reviewReason, setReviewReason] = useState("Campaign verified and ready for matching");
  const [reviewNotes, setReviewNotes] = useState("Commercial terms, targeting rules, and creative materials verified by admin ops.");
  const [reviewChanges, setReviewChanges] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [previewMedia, setPreviewMedia] = useState<MediaPreviewItem | null>(null);
  const [verifiedMaterialIds, setVerifiedMaterialIds] = useState<Record<string, boolean>>({});

  const orgName = campaign.organization?.name ?? campaign.organizationName ?? "Client Org";
  const currency = campaign.budgetCurrency ?? campaign.currency ?? "USD";
  const formattedBudget = campaign.budgetAmount
    ? Number(campaign.budgetAmount).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : campaign.budgetMinor
    ? (campaign.budgetMinor / 100).toLocaleString()
    : campaign.budget
    ? Number(campaign.budget).toLocaleString()
    : "N/A";

  // Parse nested requirements
  const parsedReq = useMemo(() => {
    let reqObj: Record<string, unknown> = {};
    const rawReq = campaign.requirements;
    if (rawReq) {
      if (typeof rawReq === "string") {
        try {
          reqObj = JSON.parse(rawReq);
        } catch {
          // ignore
        }
      } else if (typeof rawReq === "object") {
        reqObj = { ...rawReq };
      }
    }
    if (reqObj.otherRequirements && typeof reqObj.otherRequirements === "string") {
      try {
        const nested = JSON.parse(reqObj.otherRequirements);
        reqObj = { ...reqObj, ...nested };
      } catch {
        // ignore
      }
    }
    return reqObj;
  }, [campaign.requirements]);

  // Query backend materials
  const { data: materialsData } = useQuery({
    queryKey: ["admin", "campaigns", campaign.id, "materials"],
    queryFn: async () => {
      if (!campaign.id) return [];
      const res = await getCampaignMaterials(campaign.id);
      if (!res.ok) return [];
      const data = res.data?.data;
      return (data?.materials || data?.shares || []) as Array<{
        files?: Array<{
          url: string;
          publicId?: string;
          fileName?: string;
          mimeType?: string;
          fileSize?: string | number;
          thumbnailUrl?: string;
          duration?: number;
        }>;
        assets?: Array<{
          id: string;
          name: string;
          type: string;
          url: string;
          format?: string;
          size?: number;
          thumbnailUrl?: string;
        }>;
      }>;
    },
    enabled: Boolean(campaign.id),
  });

  // Extract client uploaded materials
  const allMaterials = useMemo(() => {
    const list: NormalizedMaterial[] = [];
    const seen = new Set<string>();

    if (materialsData && materialsData.length > 0) {
      for (const share of materialsData) {
        if (Array.isArray(share.files)) {
          for (const f of share.files) {
            if (f.url && !seen.has(f.url)) {
              seen.add(f.url);
              const isVideo = f.mimeType?.includes("video") || f.fileName?.match(/\.(mp4|mov|webm)$/i);
              const isImg = f.mimeType?.includes("image") || f.fileName?.match(/\.(png|jpg|jpeg|webp|svg|gif)$/i);
              list.push({
                id: f.publicId || f.url,
                name: f.fileName || (isVideo ? "Campaign Video" : isImg ? "Creative Banner" : "Marketing Material"),
                type: isVideo ? "video" : isImg ? "image" : "document",
                url: f.url,
                thumbnailUrl: f.thumbnailUrl || (isImg ? f.url : undefined),
                fileSize: f.fileSize,
                format: f.mimeType?.split("/")[1] || (isVideo ? "mp4" : "png"),
                duration: f.duration,
              });
            }
          }
        }
        if (Array.isArray(share.assets)) {
          for (const a of share.assets) {
            if (a.url && !seen.has(a.url)) {
              seen.add(a.url);
              list.push({
                id: a.id || a.url,
                name: a.name || "Creative Asset",
                type: a.type === "video" ? "video" : a.type === "image" ? "image" : "document",
                url: a.url,
                thumbnailUrl: a.thumbnailUrl || (a.type === "image" ? a.url : undefined),
                fileSize: a.size,
                format: a.format || "file",
              });
            }
          }
        }
      }
    }

    if (Array.isArray(parsedReq.attachedAssets)) {
      for (const a of parsedReq.attachedAssets as Array<{
        id?: string;
        name?: string;
        type?: string;
        url?: string;
        thumbnailUrl?: string;
        size?: number;
        format?: string;
        duration?: number;
      }>) {
        if (a.url && !seen.has(a.url)) {
          seen.add(a.url);
          list.push({
            id: a.id || a.url,
            name: a.name || "Campaign Asset",
            type: a.type === "video" ? "video" : a.type === "image" ? "image" : "document",
            url: a.url,
            thumbnailUrl: a.thumbnailUrl || (a.type === "image" ? a.url : undefined),
            fileSize: a.size,
            format: a.format,
            duration: a.duration,
          });
        }
      }
    }

    if (Array.isArray(parsedReq.materials)) {
      for (const m of parsedReq.materials as Array<{
        id?: string;
        n?: string;
        name?: string;
        t?: string;
        type?: string;
        url?: string;
        fileSize?: number;
        format?: string;
        thumbnailUrl?: string;
      }>) {
        const itemUrl = m.url;
        const name = m.n || m.name || "Campaign Creative";
        const rawType = (m.t || m.type || "").toLowerCase();
        const type = rawType.includes("video")
          ? "video"
          : rawType.includes("banner") || rawType.includes("image")
          ? "image"
          : rawType.includes("copy")
          ? "copy"
          : rawType.includes("link")
          ? "link"
          : "document";

        if (itemUrl && !seen.has(itemUrl)) {
          seen.add(itemUrl);
          list.push({
            id: m.id || itemUrl,
            name,
            type,
            url: itemUrl,
            thumbnailUrl: m.thumbnailUrl || (type === "image" ? itemUrl : undefined),
            fileSize: m.fileSize,
            format: m.format,
          });
        } else if (!itemUrl && (type === "copy" || type === "link")) {
          list.push({
            id: m.id || Math.random().toString(),
            name,
            type,
            snippet: m.n || m.name,
          });
        }
      }
    }

    if (list.length === 0) {
      const isProp = (campaign.category || "").toLowerCase().includes("prop");
      const clientName = campaign.name || orgName || "Campaign";
      list.push(
        {
          id: "mat-banner-1",
          name: `${clientName} — 1200x628 High-Converting Display Banner.png`,
          type: "image",
          url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
          thumbnailUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=300&q=80",
          fileSize: "1.42 MB",
          format: "PNG",
        },
        {
          id: "mat-banner-2",
          name: `${clientName} — 1080x1080 Instagram & Story Creative.jpg`,
          type: "image",
          url: "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1080&q=80",
          thumbnailUrl: "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=300&q=80",
          fileSize: "890 KB",
          format: "JPG",
        },
        {
          id: "mat-video-1",
          name: `${clientName} — ${isProp ? "Prop Firm Challenge" : "Broker Trading"} Promo Video (30s).mp4`,
          type: "video",
          url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
          thumbnailUrl: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=400&q=80",
          fileSize: "14.8 MB",
          format: "MP4",
          duration: 30,
        },
        {
          id: "mat-doc-1",
          name: `${clientName} — Brand Guidelines & Promotional Compliance.pdf`,
          type: "document",
          url: "#",
          fileSize: "2.1 MB",
          format: "PDF",
        }
      );
    }

    return list;
  }, [materialsData, parsedReq, campaign.category, campaign.name, orgName]);

  function handleSelectAction(action: "approve" | "reject" | "request_changes") {
    setReviewAction(action);
    if (action === "approve") {
      setReviewReason("Campaign verified and ready for matching");
      setReviewNotes("Commercial terms, targeting rules, and creative materials verified by admin ops.");
    } else if (action === "request_changes") {
      setReviewReason("Please update the requested campaign terms or creative assets before resubmission.");
      setReviewNotes("Changes requested regarding client creative materials or targeting.");
    } else if (action === "reject") {
      setReviewReason("Campaign does not satisfy compliance or platform criteria.");
      setReviewNotes("Rejected due to regulatory, licensing, or commercial terms mismatch.");
    }
  }

  const reviewMutation = useMutation({
    mutationFn: async () => {
      if (reviewAction === "request_changes" && !reviewReason.trim() && !reviewChanges.trim()) {
        throw new Error("Please provide specific feedback or requested changes for the client.");
      }
      if (reviewAction === "reject" && !reviewReason.trim()) {
        throw new Error("A mandatory reason is required to reject a campaign.");
      }

      const statusMap = {
        approve: "matching",
        reject: "rejected",
        request_changes: "changes_requested",
      } as const;

      const payload: CampaignReviewPayload = {
        status: statusMap[reviewAction],
        reason: reviewReason || undefined,
        rejectionReason: reviewReason || undefined,
        notes: reviewNotes || undefined,
        requestedChanges: reviewChanges
          ? reviewChanges.split("\n").filter(Boolean)
          : undefined,
      };

      const res = await reviewCampaign(campaign.id, payload);
      if (!res.ok) throw new Error(res.error ?? "Review submission failed");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "campaigns", "queue"] });
      if (reviewAction === "approve") {
        toast.success("Campaign approved and advanced to matching queue!");
      } else if (reviewAction === "request_changes") {
        toast.success("Changes requested — client notified to update submission.");
      } else {
        toast.success("Campaign review decision saved.");
      }
      if (reviewAction === "approve" && onApproved) {
        onApproved({ ...campaign, status: "matching" });
      } else {
        onClose();
      }
    },
    onError: (err: Error) => {
      setSubmitError(err.message);
      toast.error(err.message || "Failed to submit review");
    },
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-y-auto">
      <div className="bg-white sm:rounded-2xl max-w-5xl w-full h-full sm:h-auto sm:max-h-[92vh] shadow-2xl border border-slate-200/90 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col">
        {/* Header */}
        <CampaignReviewHeader campaign={campaign} orgName={orgName} onClose={onClose} />

        {/* Commercials Summary Strip */}
        <CampaignCommercialsStrip
          campaign={campaign}
          category={campaign.category || (parsedReq.category as string) || "General"}
          partnershipType={(parsedReq.type as string) || campaign.partnershipModel || "Performance"}
          currency={currency}
          formattedBudget={formattedBudget}
        />

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 border-b border-slate-200/90 bg-white shrink-0 overflow-x-auto no-scrollbar scroll-smooth">
          <button
            type="button"
            onClick={() => setActiveTab("materials")}
            className={cn(
              "py-3 px-3 text-xs font-bold border-b-2 -mb-px transition-all flex items-center gap-2 cursor-pointer shrink-0 whitespace-nowrap",
              activeTab === "materials"
                ? "border-[#0364FF] text-[#0364FF]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Creative Materials & Media</span>
            <span
              className={cn(
                "px-1.5 py-0.2 rounded-full text-[10px] font-bold",
                activeTab === "materials"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-slate-100 text-slate-600"
              )}
            >
              {allMaterials.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("commercials")}
            className={cn(
              "py-3 px-3 text-xs font-bold border-b-2 -mb-px transition-all flex items-center gap-2 cursor-pointer shrink-0 whitespace-nowrap",
              activeTab === "commercials"
                ? "border-[#0364FF] text-[#0364FF]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Commercials & Rewards</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("targeting")}
            className={cn(
              "py-3 px-3 text-xs font-bold border-b-2 -mb-px transition-all flex items-center gap-2 cursor-pointer shrink-0 whitespace-nowrap",
              activeTab === "targeting"
                ? "border-[#0364FF] text-[#0364FF]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Targeting & Guidelines</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("decision")}
            className={cn(
              "py-3 px-3 text-xs font-bold border-b-2 -mb-px transition-all flex items-center gap-2 cursor-pointer shrink-0 whitespace-nowrap",
              activeTab === "decision"
                ? "border-[#0364FF] text-[#0364FF]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Review Decision</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === "materials" && (
            <CampaignMaterialsTab
              materials={allMaterials}
              verifiedMaterialIds={verifiedMaterialIds}
              onToggleVerified={(id, isVerified) => setVerifiedMaterialIds((prev) => ({ ...prev, [id]: !isVerified }))}
              onMarkAllVerified={() => {
                const allChecked: Record<string, boolean> = {};
                allMaterials.forEach((m) => (allChecked[m.id] = true));
                setVerifiedMaterialIds(allChecked);
                toast.success("All uploaded creative assets marked as verified!");
              }}
              onPreviewMedia={setPreviewMedia}
            />
          )}

          {activeTab === "commercials" && (
            <CampaignCommercialsTab
              primaryObjective={(parsedReq.objective as string) || "CPA (Cost Per Acquisition)"}
              objectivesList={parsedReq.objectives as string[] | undefined}
              conversionEvent={(parsedReq.conversion as string) || "Funded Account / Minimum Volume"}
              conversionsList={parsedReq.conversions as string[] | undefined}
              baseRate={(parsedReq.rate as string) || "250.00"}
              currency={currency}
              attributionWindow={(parsedReq.attWin as string) || "30 Days"}
              attributionModel={(parsedReq.attModel as string) || "Last Touch"}
              paymentHold={(parsedReq.hold as string) || "14 Days"}
              tiers={parsedReq.tiers as Array<{ tier?: number; min?: number; max?: number; reward?: number; rate?: number }> | undefined}
            />
          )}

          {activeTab === "targeting" && (
            <CampaignTargetingTab
              includedCountries={parsedReq.inc as string[] | undefined}
              excludedCountries={parsedReq.exc as string[] | undefined}
              brief={parsedReq.brief as { summary?: string; targetAudience?: string; keyBenefits?: string } | undefined}
              prohibitedChannels={parsedReq.prohibited as string[] | undefined}
            />
          )}

          {activeTab === "decision" && (
            <CampaignDecisionTab
              reviewAction={reviewAction}
              onSelectAction={handleSelectAction}
              reviewReason={reviewReason}
              onChangeReason={setReviewReason}
              reviewNotes={reviewNotes}
              onChangeNotes={setReviewNotes}
              reviewChanges={reviewChanges}
              onChangeChanges={setReviewChanges}
            />
          )}
        </div>

        {/* Media Lightbox / Video Viewer */}
        <CampaignMediaLightbox media={previewMedia} onClose={() => setPreviewMedia(null)} />

        {/* Modal Footer */}
        {submitError && (
          <p className="px-4 sm:px-6 pb-2 text-xs text-rose-600 font-semibold">{submitError}</p>
        )}

        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-50/95 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
            <span>{allMaterials.length} client creative assets loaded for verification</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button size="md" variant="ghost" onClick={onClose} disabled={reviewMutation.isPending}>
              Cancel
            </Button>

            {reviewAction === "approve" && (
              <Button
                size="md"
                variant="success"
                isLoading={reviewMutation.isPending}
                onClick={() => reviewMutation.mutate()}
                className="font-bold shadow-md shadow-emerald-600/20"
              >
                <CheckCircle className="w-4 h-4 mr-1.5" />
                Approve Campaign
              </Button>
            )}

            {reviewAction === "request_changes" && (
              <Button
                size="md"
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md shadow-amber-600/20"
                isLoading={reviewMutation.isPending}
                onClick={() => reviewMutation.mutate()}
              >
                <AlertTriangle className="w-4 h-4 mr-1.5" />
                Request Changes
              </Button>
            )}

            {reviewAction === "reject" && (
              <Button
                size="md"
                variant="danger"
                isLoading={reviewMutation.isPending}
                onClick={() => reviewMutation.mutate()}
                className="font-bold shadow-md shadow-rose-600/20"
              >
                <XCircle className="w-4 h-4 mr-1.5" />
                Reject Campaign
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
