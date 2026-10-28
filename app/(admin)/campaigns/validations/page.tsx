"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminTopBar } from "@/components/layout";
import {
  getValidationWorkQueue,
  approveCommercialEvent,
  rejectCommercialEvent,
  reverseCommercialEvent,
} from "@/lib/api/admin.api";
import {
  ValidationWorkQueueTable,
} from "../_components";

export default function CampaignValidationsPage() {
  const queryClient = useQueryClient();

  // Commercial Validation Events Query
  const { data: validationQueueData, isLoading: validationLoading } = useQuery({
    queryKey: ["admin", "campaigns", "validation-queue"],
    queryFn: async () => {
      const res = await getValidationWorkQueue();
      return res.data?.data?.events ?? [];
    },
  });

  // Review Mutations
  const approveEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const res = await approveCommercialEvent(eventId);
      if (!res.ok) throw new Error(res.error ?? "Failed to approve event");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "campaigns", "validation-queue"],
      });
    },
  });

  const rejectEventMutation = useMutation({
    mutationFn: async ({
      eventId,
      reason,
    }: {
      eventId: string;
      reason: string;
    }) => {
      const res = await rejectCommercialEvent(eventId, reason);
      if (!res.ok) throw new Error(res.error ?? "Failed to reject event");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "campaigns", "validation-queue"],
      });
    },
  });

  const reverseEventMutation = useMutation({
    mutationFn: async ({
      eventId,
      reason,
    }: {
      eventId: string;
      reason: string;
    }) => {
      const res = await reverseCommercialEvent(eventId, reason);
      if (!res.ok) throw new Error(res.error ?? "Failed to reverse event");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "campaigns", "validation-queue"],
      });
    },
  });

  const pendingCount = (validationQueueData ?? []).filter(
    (e) => e.status === "pending"
  ).length;

  return (
    <div className="space-y-6">
      <AdminTopBar
        title="Commercial Validation Work Queue"
        subtitle="Audit qualifying conversion events, monitor real-time fraud risk scores, and enforce supervisory settlement compliance."
      />

      {/* Dedicated Table */}
      <ValidationWorkQueueTable
        events={validationQueueData ?? []}
        isLoading={validationLoading}
        onApprove={async (eventId) => {
          await approveEventMutation.mutateAsync(eventId);
        }}
        onReject={async (eventId, reason) => {
          await rejectEventMutation.mutateAsync({ eventId, reason });
        }}
        onReverse={async (eventId, reason) => {
          await reverseEventMutation.mutateAsync({ eventId, reason });
        }}
      />
    </div>
  );
}
