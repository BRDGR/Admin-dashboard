"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Eye, ShieldCheck, Building2 } from "lucide-react";
import {
  DataTable,
  StatusBadge,
  TableActionButton,
  type Column,
} from "@/components/ui";
import { useOrgKycList, useReviewOrgKyc } from "@/lib/hooks/useKyc";
import type { KycRecordWithOrg } from "@/lib/types";
import { OrgKycDetailDrawer } from "./OrgKycDetailDrawer";
import { KycDecisionModal } from "./KycDecisionModal";

export function OrgKycTab() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data, isLoading } = useOrgKycList(page, pageSize);
  const { mutate: review, isPending } = useReviewOrgKyc();
  const [reviewModal, setReviewModal] = useState<{ id: string; orgId: string; name: string } | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const rawRecords = data?.records ?? [];

  const filteredRecords = useMemo(() => {
    if (!searchQuery.trim()) return rawRecords;
    const s = searchQuery.toLowerCase();
    return rawRecords.filter((r) => {
      const name = (r.organization?.name ?? "").toLowerCase();
      const provider = (r.kycRecord?.provider ?? "").toLowerCase();
      const status = (r.kycRecord?.status ?? "").toLowerCase();
      return name.includes(s) || provider.includes(s) || status.includes(s);
    });
  }, [rawRecords, searchQuery]);

  const columns: Column<KycRecordWithOrg>[] = [
    {
      key: "org",
      header: "Organization",
      render: ({ organization }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0364FF] flex items-center justify-center shrink-0 border border-blue-100/60 font-bold text-xs">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 leading-tight">
              {organization?.name ?? "Unnamed Organization"}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-tight font-mono">
              {organization?.id ? organization.id.slice(0, 13) + "..." : "—"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "provider",
      header: "Provider",
      render: ({ kycRecord }) => (
        <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60">
          {kycRecord?.provider?.trim() ?? "SumSub"}
        </span>
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
        <span className="text-xs text-slate-500 whitespace-nowrap">
          {kycRecord?.submittedAt ? format(new Date(kycRecord.submittedAt), "MMM d, yyyy") : "—"}
        </span>
      ),
    },
    {
      key: "decided",
      header: "Decided",
      render: ({ kycRecord }) => (
        <span className="text-xs text-slate-400 whitespace-nowrap">
          {kycRecord?.decidedAt ? format(new Date(kycRecord.decidedAt), "MMM d, yyyy") : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: ({ kycRecord, organization }) => (
        <div className="flex items-center justify-end gap-2">
          <TableActionButton
            icon={<Eye className="w-3.5 h-3.5" />}
            label="View"
            onClick={() => kycRecord?.id && setDetailId(kycRecord.id)}
          />
          {kycRecord?.status === "pending" && (
            <TableActionButton
              icon={<ShieldCheck className="w-3.5 h-3.5 text-[#0364FF]" />}
              label="Review"
              variant="primary"
              onClick={() => {
                if (kycRecord?.id) {
                  setReviewModal({
                    id: kycRecord.id,
                    orgId: kycRecord.orgId,
                    name: organization?.name ?? "Organization",
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
        emptyMessage="No organization KYC records found."
        selectable={true}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        getRowId={(r) => r.kycRecord?.id ?? ""}
        itemLabel="Submissions"
        searchPlaceholder="Search Organization KYC"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        pagination={data?.pagination}
        onPageChange={setPage}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
      />

      {detailId && <OrgKycDetailDrawer kycId={detailId} onClose={() => setDetailId(null)} />}

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
    </>
  );
}
