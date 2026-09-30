"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ShieldCheck } from "lucide-react";
import { DataTable, StatusBadge, Pagination, Button, type Column } from "@/components/ui";
import { usePartnerKycList, useReviewPartnerKyc } from "@/lib/hooks/useKyc";
import type { PartnerKycRecord } from "@/lib/types";
import { PartnerKycDetailDrawer } from "./PartnerKycDetailDrawer";
import { KycDecisionModal } from "./KycDecisionModal";

export function PartnerKycTab() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = usePartnerKycList(page, 10);
  const { mutate: review, isPending } = useReviewPartnerKyc();
  const [reviewModal, setReviewModal] = useState<{ id: string; name: string } | null>(null);
  const [detailRecord, setDetailRecord] = useState<PartnerKycRecord | null>(null);

  const columns: Column<PartnerKycRecord>[] = [
    {
      key: "partner",
      header: "Partner",
      render: (row) => (
        <div>
          <p className="text-[13px] font-semibold text-slate-900">
            {row.partnerUser?.firstName ?? ""} {row.partnerUser?.lastName ?? ""}
          </p>
          <p className="text-[11px] text-slate-400">{row.partnerUser?.email ?? "—"}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status ?? "pending"} />,
    },
    {
      key: "submitted",
      header: "Submitted",
      render: (row) => (
        <span className="text-xs text-slate-400">
          {row.submittedAt ? format(new Date(row.submittedAt), "MMM d, yyyy") : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDetailRecord(row)}
            className="text-[11px] font-semibold text-[#0364FF] hover:underline cursor-pointer"
          >
            View
          </button>
          {row.status === "pending" && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs font-semibold text-[#0364FF] hover:bg-blue-50"
              onClick={() => {
                if (row.kycRecordId) {
                  setReviewModal({
                    id: row.kycRecordId,
                    name: `${row.partnerUser?.firstName ?? ""} ${row.partnerUser?.lastName ?? ""}`.trim() || "Partner",
                  });
                }
              }}
            >
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-[#0364FF]" /> Review
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable columns={columns} data={data?.records ?? []} isLoading={isLoading} emptyMessage="No partner KYC records." />
      {data?.pagination && <Pagination pagination={data.pagination} onPageChange={setPage} />}
      {detailRecord && <PartnerKycDetailDrawer record={detailRecord} onClose={() => setDetailRecord(null)} />}

      {reviewModal && (
        <KycDecisionModal
          title="Review Partner KYC"
          targetName={reviewModal.name}
          isOpen={true}
          isLoading={isPending}
          onClose={() => setReviewModal(null)}
          onSubmit={async (status, notes) => {
            review(
              { id: reviewModal.id, payload: { status, decisionNotes: notes } },
              { onSettled: () => setReviewModal(null) }
            );
          }}
        />
      )}
    </>
  );
}
