"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Eye, ShieldCheck } from "lucide-react";
import {
  DataTable,
  StatusBadge,
  TableActionButton,
  UserAvatarCell,
  type Column,
} from "@/components/ui";
import { usePartnerKycList, useReviewPartnerKyc } from "@/lib/hooks/useKyc";
import type { PartnerKycRecord } from "@/lib/types";
import { PartnerKycDetailDrawer } from "./PartnerKycDetailDrawer";
import { KycDecisionModal } from "./KycDecisionModal";

export function PartnerKycTab() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data, isLoading } = usePartnerKycList(page, pageSize);
  const { mutate: review, isPending } = useReviewPartnerKyc();
  const [reviewModal, setReviewModal] = useState<{ id: string; name: string } | null>(null);
  const [detailRecord, setDetailRecord] = useState<PartnerKycRecord | null>(null);

  const rawRecords = data?.records ?? [];

  const filteredRecords = useMemo(() => {
    if (!searchQuery.trim()) return rawRecords;
    const s = searchQuery.toLowerCase();
    return rawRecords.filter((r) => {
      const name = `${r.partnerUser?.firstName ?? ""} ${r.partnerUser?.lastName ?? ""}`.toLowerCase();
      const email = (r.partnerUser?.email ?? "").toLowerCase();
      const status = (r.status ?? "").toLowerCase();
      return name.includes(s) || email.includes(s) || status.includes(s);
    });
  }, [rawRecords, searchQuery]);

  const columns: Column<PartnerKycRecord>[] = [
    {
      key: "partner",
      header: "Partner",
      render: (row) => {
        const name = `${row.partnerUser?.firstName ?? ""} ${row.partnerUser?.lastName ?? ""}`.trim() || "Partner";
        return (
          <UserAvatarCell
            name={name}
            subtitle={row.partnerUser?.email ?? "—"}
          />
        );
      },
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
        <span className="text-xs text-slate-500 whitespace-nowrap">
          {row.submittedAt ? format(new Date(row.submittedAt), "MMM d, yyyy") : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <TableActionButton
            icon={<Eye className="w-3.5 h-3.5" />}
            label="View"
            onClick={() => setDetailRecord(row)}
          />
          {row.status === "pending" && (
            <TableActionButton
              icon={<ShieldCheck className="w-3.5 h-3.5 text-[#0364FF]" />}
              label="Review"
              variant="primary"
              onClick={() => {
                if (row.kycRecordId) {
                  setReviewModal({
                    id: row.kycRecordId,
                    name: `${row.partnerUser?.firstName ?? ""} ${row.partnerUser?.lastName ?? ""}`.trim() || "Partner",
                  });
                }
              }}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={filteredRecords}
        isLoading={isLoading}
        emptyMessage="No partner KYC records found."
        selectable={true}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        getRowId={(r) => r.kycRecordId}
        itemLabel="Submissions"
        searchPlaceholder="Search KYC Submissions"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        pagination={data?.pagination}
        onPageChange={setPage}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
      />

      {detailRecord && (
        <PartnerKycDetailDrawer
          record={detailRecord}
          onClose={() => setDetailRecord(null)}
          onOpenDecision={(id, name) => setReviewModal({ id, name })}
        />
      )}

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
