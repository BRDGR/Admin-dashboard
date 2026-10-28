"use client";

import type { AdminCampaignQueueItem } from "@/lib/types";
import { CampaignReviewModal } from "../CampaignReviewModal";
import { CampaignMatchDrawer } from "../CampaignMatchDrawer";
import { CampaignAssignmentsModal } from "../CampaignAssignmentsModal";
import { CampaignPerformanceModal } from "../CampaignPerformanceModal";

interface CampaignModalsContainerProps {
  reviewingCampaign: AdminCampaignQueueItem | null;
  onCloseReview: () => void;
  onCampaignApproved: (updatedCampaign: AdminCampaignQueueItem) => void;

  matchingCampaign: AdminCampaignQueueItem | null;
  onCloseMatch: () => void;
  onCampaignAssigned: (updatedCampaign: AdminCampaignQueueItem) => void;

  viewingAssignmentsCamp: AdminCampaignQueueItem | null;
  onCloseAssignments: () => void;

  perfCampaign: AdminCampaignQueueItem | null;
  onClosePerformance: () => void;
}

export function CampaignModalsContainer({
  reviewingCampaign,
  onCloseReview,
  onCampaignApproved,
  matchingCampaign,
  onCloseMatch,
  onCampaignAssigned,
  viewingAssignmentsCamp,
  onCloseAssignments,
  perfCampaign,
  onClosePerformance,
}: CampaignModalsContainerProps) {
  return (
    <>
      {reviewingCampaign && (
        <CampaignReviewModal
          campaign={reviewingCampaign}
          onClose={onCloseReview}
          onApproved={onCampaignApproved}
        />
      )}

      {matchingCampaign && (
        <CampaignMatchDrawer
          campaign={matchingCampaign}
          onClose={onCloseMatch}
          onAssigned={onCampaignAssigned}
        />
      )}

      {viewingAssignmentsCamp && (
        <CampaignAssignmentsModal
          campaign={viewingAssignmentsCamp}
          onClose={onCloseAssignments}
        />
      )}

      {perfCampaign && (
        <CampaignPerformanceModal
          campaign={perfCampaign}
          onClose={onClosePerformance}
        />
      )}
    </>
  );
}
