"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ShieldCheck, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { AdminTopBar } from "@/components/layout";
import { SectionCard, DataTable, StatusBadge, Pagination, Button } from "@/components/ui";
import { usePartnerKycList, useOrgKycList, useReviewPartnerKyc, useReviewOrgKyc } from "@/lib/hooks/useKyc";
import { useQuery } from "@tanstack/react-query";
import { getKycRecord } from "@/lib/api/admin.api";
import type { KycRecordWithOrg, PartnerKycRecord } from "@/lib/types";
import type { Column } from "@/components/ui";
import { cn } from "@/lib/utils";

const TABS = ["Partner KYC", "Organization KYC"] as const;
type Tab = typeof TABS[number];

function KycDetailDrawer({ kycId, onClose }: { kycId: string; onClose: () => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "kyc", kycId],
    queryFn: async () => {
      const res = await getKycRecord(kycId);
      console.log(`[KYC page] KycDetailDrawer(${kycId}) — full res:`, JSON.parse(JSON.stringify(res)));
      console.log(`[KYC page] KycDetailDrawer(${kycId}) — res.data?.data:`, res.data?.data);
      if (res.error) throw new Error(res.error);
      return res.data?.data;
    },
    enabled: !!kycId,
  });

  const record = (data as { kycRecord?: KycRecordWithOrg["kycRecord"]; records?: KycRecordWithOrg[] } | undefined);
  const kyc = record?.kycRecord ?? record?.records?.[0]?.kycRecord;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <p className="text-sm font-bold text-slate-900">KYC Record Detail</p>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />)}
            </div>
          ) : !kyc ? (
            <p className="text-sm text-slate-400 text-center py-10">Record not found.</p>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                {([
                  ["Record ID", kyc.id],
                  ["Org ID", kyc.orgId],
                  ["Provider", kyc.provider?.trim()],
                  ["Reference", kyc.providerReferenceId?.trim()],
                ] as [string, string][]).map(([label, value]) => (
                  <div key={label} className="flex items-start gap-3">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider w-28 shrink-0 mt-0.5">{label}</span>
                    <span className="text-xs text-slate-700 font-mono break-all">{value || "—"}</span>
                  </div>
                ))}
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</span>
                  <StatusBadge status={kyc.status} />
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider w-28 shrink-0 mt-0.5">Submitted</span>
                  <span className="text-xs text-slate-700">{format(new Date(kyc.submittedAt), "MMM d, yyyy · HH:mm")}</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider w-28 shrink-0 mt-0.5">Decided</span>
                  <span className="text-xs text-slate-700">{kyc.decidedAt ? format(new Date(kyc.decidedAt), "MMM d, yyyy · HH:mm") : "—"}</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider w-28 shrink-0 mt-0.5">Created</span>
                  <span className="text-xs text-slate-700">{format(new Date(kyc.createdAt), "MMM d, yyyy · HH:mm")}</span>
                </div>
              </div>
              {kyc.decisionNotes && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                  <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider mb-1.5">Decision Notes</p>
                  <p className="text-xs text-slate-700 leading-relaxed">{kyc.decisionNotes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Partner-specific detail drawer — uses the flat PartnerKycRecord shape returned by the backend
function PartnerKycDetailDrawer({ record, onClose }: { record: PartnerKycRecord; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <p className="text-sm font-bold text-slate-900">Partner KYC Detail</p>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Partner Identity */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Partner</p>
            {([
              ["Name", `${record.partnerUser?.firstName ?? ""} ${record.partnerUser?.lastName ?? ""}`.trim()],
              ["Email", record.partnerUser?.email],
              ["Role", record.partnerUser?.role],
              ["Active", record.partnerUser?.isActive ? "Yes" : "No"],
              ["Profile ID", record.partnerProfile?.id],
            ] as [string, string][]).map(([label, value]) => (
              <div key={label} className="flex items-start gap-3">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider w-24 shrink-0 mt-0.5">{label}</span>
                <span className="text-xs text-slate-700 font-mono break-all">{value || "—"}</span>
              </div>
            ))}
          </div>
          {/* KYC Record Info */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</span>
              <StatusBadge status={record.status} />
            </div>
            {([
              ["Record ID", record.kycRecordId],
              ["Submitted", record.submittedAt ? format(new Date(record.submittedAt), "MMM d, yyyy · HH:mm") : "—"],
              ["Created", record.createdAt ? format(new Date(record.createdAt), "MMM d, yyyy · HH:mm") : "—"],
              ["Updated", record.updatedAt ? format(new Date(record.updatedAt), "MMM d, yyyy · HH:mm") : "—"],
            ] as [string, string][]).map(([label, value]) => (
              <div key={label} className="flex items-start gap-3">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider w-24 shrink-0 mt-0.5">{label}</span>
                <span className="text-xs text-slate-700 font-mono break-all">{value || "—"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const COMMON_ACTION_REASONS = [
  "Document expired or unreadable",
  "Full legal name mismatch with identity document",
  "Proof of address older than 90 days",
  "Incorporation certificate incomplete or missing jurisdiction seal",
  "Selfie verification / liveness check failed",
  "Regulatory license verification required",
];

interface KycDecisionModalProps {
  title: string;
  targetName: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (status: "verified" | "failed", notes?: string) => Promise<void>;
  isLoading: boolean;
}

function KycDecisionModal({
  title,
  targetName,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: KycDecisionModalProps) {
  const [decisionType, setDecisionType] = useState<"approve" | "action_required" | "reject">("approve");
  const [selectedReason, setSelectedReason] = useState(COMMON_ACTION_REASONS[0]);
  const [customNotes, setCustomNotes] = useState("");

  if (!isOpen) return null;

  async function handleConfirm() {
    if (decisionType === "approve") {
      await onSubmit("verified", customNotes || undefined);
    } else if (decisionType === "action_required") {
      const fullNote = `Action Required: ${selectedReason}${customNotes ? ` — ${customNotes}` : ""}`;
      await onSubmit("failed", fullNote);
    } else {
      const fullNote = `Rejected: ${customNotes || "Compliance verification criteria not met"}`;
      await onSubmit("failed", fullNote);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{targetName}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer">
            <XCircle className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Decision Pill Switcher */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">Review Decision</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDecisionType("approve")}
                className={cn(
                  "py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5",
                  decisionType === "approve"
                    ? "bg-emerald-50 border-emerald-300 text-emerald-700 shadow-2xs"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                )}
              >
                <CheckCircle className="w-3.5 h-3.5" /> Approve
              </button>
              <button
                type="button"
                onClick={() => setDecisionType("action_required")}
                className={cn(
                  "py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5",
                  decisionType === "action_required"
                    ? "bg-amber-50 border-amber-300 text-amber-700 shadow-2xs"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                )}
              >
                <AlertTriangle className="w-3.5 h-3.5" /> Request Fix
              </button>
              <button
                type="button"
                onClick={() => setDecisionType("reject")}
                className={cn(
                  "py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5",
                  decisionType === "reject"
                    ? "bg-red-50 border-red-300 text-red-700 shadow-2xs"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                )}
              >
                <XCircle className="w-3.5 h-3.5" /> Reject
              </button>
            </div>
          </div>

          {/* Conditional Reason Selector for Action Required */}
          {decisionType === "action_required" && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-600 block">Identified Compliance Issue</label>
              <select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-full text-xs font-medium border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/50 outline-none focus:ring-2 focus:ring-[#0364FF]/20 focus:border-[#0364FF]"
              >
                {COMMON_ACTION_REASONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          )}

          {/* Custom Notes */}
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1.5">
              {decisionType === "approve" ? "Internal Compliance Notes (Optional)" : "Instructions / Rationale for Applicant"}
            </label>
            <textarea
              rows={3}
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder={
                decisionType === "approve"
                  ? "Approved under standard onboarding SLA..."
                  : decisionType === "action_required"
                  ? "Please re-upload a clear color scan of your passport..."
                  : "State legal compliance reason for rejection..."
              }
              className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#0364FF]/20 focus:border-[#0364FF] resize-none transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              variant={decisionType === "approve" ? "primary" : decisionType === "action_required" ? "secondary" : "danger"}
              className="flex-1"
              isLoading={isLoading}
              onClick={handleConfirm}
            >
              {decisionType === "approve" ? "Confirm Approval" : decisionType === "action_required" ? "Submit Action Request" : "Confirm Rejection"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PartnerKycTab() {
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

function OrgKycTab() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useOrgKycList(page, 10);
  const { mutate: review, isPending } = useReviewOrgKyc();
  const [reviewModal, setReviewModal] = useState<{ id: string; orgId: string; name: string } | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const columns: Column<KycRecordWithOrg>[] = [
    {
      key: "org", header: "Organization",
      render: ({ organization }) => <p className="text-[13px] font-semibold text-slate-900">{organization?.name ?? "—"}</p>,
    },
    {
      key: "provider", header: "Provider",
      render: ({ kycRecord }) => <span className="text-xs text-slate-600">{kycRecord?.provider?.trim() ?? "—"}</span>,
    },
    {
      key: "status", header: "Status",
      render: ({ kycRecord }) => <StatusBadge status={kycRecord?.status ?? "pending"} />,
    },
    {
      key: "submitted", header: "Submitted",
      render: ({ kycRecord }) => (
        <span className="text-xs text-slate-400">
          {kycRecord?.submittedAt ? format(new Date(kycRecord.submittedAt), "MMM d, yyyy") : "—"}
        </span>
      ),
    },
    {
      key: "decided", header: "Decided",
      render: ({ kycRecord }) => (
        <span className="text-xs text-slate-400">
          {kycRecord?.decidedAt ? format(new Date(kycRecord.decidedAt), "MMM d, yyyy") : "—"}
        </span>
      ),
    },
    {
      key: "actions", header: "Actions",
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

      {detailId && <KycDetailDrawer kycId={detailId} onClose={() => setDetailId(null)} />}
    </>
  );
}

export default function KycPage() {
  const [tab, setTab] = useState<Tab>("Partner KYC");

  return (
    <div className="space-y-6">
      <AdminTopBar title="KYC Review" subtitle="Review and approve identity verification submissions" />

      <SectionCard
        title="KYC Records"
        subtitle="Approve or reject pending submissions"
        action={
          <div className="flex items-center gap-1 bg-slate-100 rounded-full p-1">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer",
                  tab === t ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-700"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        }
      >
        {tab === "Partner KYC" ? <PartnerKycTab /> : <OrgKycTab />}
      </SectionCard>
    </div>
  );
}
