"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ShieldCheck } from "lucide-react";
import { DataTable, StatusBadge, Pagination, Button, type Column } from "@/components/ui";
import { useOrgKycList, useReviewOrgKyc } from "@/lib/hooks/useKyc";
import type { KycRecordWithOrg } from "@/lib/types";
import { OrgKycDetailDrawer } from "./OrgKycDetailDrawer";
import { KycDecisionModal } from "./KycDecisionModal";

export function OrgKycTab() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useOrgKycList(page, 10);
  const { mutate: review, isPending } = useReviewOrgKyc();
  const [reviewModal, setReviewModal] = useState<{ id: string; orgId: string; name: string } | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const columns: Column<KycRecordWithOrg>[] = [
    {
      key: "org",
      header: "Organization",
      render: ({ organization }) => (
        <p className="text-[13px] font-semibold text-slate-900">{organization?.name ?? "—"}</p>
      ),
    },
    {
      key: "provider",
      header: "Provider",
      render: ({ kycRecord }) => (
        <span className="text-xs text-slate-600">{kycRecord?.provider?.trim() ?? "—"}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: ({ kycRecord }) => <StatusBadge status={kycRecord?.status ?? "pending"} />,
    },
    {
      key: "submitted",
      header: "Submitted",
      render: ({ kycRecord }) => (
        <span className="text-xs text-slate-400">
          {kycRecord?.submittedAt ? format(new Date(kycRecord.submittedAt), "MMM d, yyyy") : "—"}
        </span>
      ),
    },
    {
      key: "decided",
      header: "Decided",
      render: ({ kycRecord }) => (
        <span className="text-xs text-slate-400">
          {kycRecord?.decidedAt ? format(new Date(kycRecord.decidedAt), "MMM d, yyyy") : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: ({ kycRecord, organization }) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => kycRecord?.id && setDetailId(kycRecord.id)}
            className="text-[11px] font-semibold text-[#0364FF] hover:underline cursor-pointer"
          >
            View
          </button>
          {kycRecord?.status === "pending" && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs font-semibold text-[#0364FF] hover:bg-blue-50"
              onClick={() => {
                if (kycRecord?.id) {
                  setReviewModal({
                    id: kycRecord.id,
                    orgId: kycRecord.orgId,
                    name: organization?.name ?? "Organization",
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
      <DataTable columns={columns} data={data?.records ?? []} isLoading={isLoading} emptyMessage="No organization KYC records." />
      {data?.pagination && <Pagination pagination={data.pagination} onPageChange={setPage} />}

      {reviewModal && (
        <KycDecisionModal
          title="Review Organization KYC"
          targetName={reviewModal.name}
          isOpen={true}
          isLoading={isPending}
          onClose={() => setReviewModal(null)}
          onSubmit={async (status, notes) => {
            review(
              { id: reviewModal.id, payload: { status, decisionNotes: notes }, orgId: reviewModal.orgId },
              { onSettled: () => setReviewModal(null) }
            );
          }}
        />
      )}

      {detailId && <OrgKycDetailDrawer kycId={detailId} onClose={() => setDetailId(null)} />}
    </>
  );
}
