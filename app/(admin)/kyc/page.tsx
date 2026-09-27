"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ShieldCheck, CheckCircle, XCircle } from "lucide-react";
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

function PartnerKycTab() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = usePartnerKycList(page, 10);
  const { mutate: review, isPending } = useReviewPartnerKyc();
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
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
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setDetailRecord(row)}
            className="text-[11px] font-semibold text-[#0364FF] hover:underline cursor-pointer"
          >
            View
          </button>
          {row.status === "pending" && (
            <>
              <Button
                size="sm" variant="ghost"
                className="text-green-600 hover:bg-green-50 hover:text-green-700"
                isLoading={isPending && reviewing === row.kycRecordId}
                onClick={() => {
                  if (!row.kycRecordId) return;
                  setReviewing(row.kycRecordId);
                  review(
                    { id: row.kycRecordId, payload: { status: "verified" } },
                    { onSettled: () => setReviewing(null) }
                  );
                }}
              >
                <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
              </Button>
              <Button
                size="sm" variant="ghost"
                className="text-red-500 hover:bg-red-50 hover:text-red-600"
                isLoading={isPending && reviewing === row.kycRecordId}
                onClick={() => {
                  if (!row.kycRecordId) return;
                  setReviewing(row.kycRecordId);
                  review(
                    { id: row.kycRecordId, payload: { status: "failed", decisionNotes: notes || "Rejected by admin" } },
                    { onSettled: () => setReviewing(null) }
                  );
                }}
              >
                <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
              </Button>
            </>
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
    </>
  );
}

function OrgKycTab() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useOrgKycList(page, 10);
  const { mutate: review, isPending } = useReviewOrgKyc();
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ id: string; orgId?: string } | null>(null);
  const [notes, setNotes] = useState("");
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
      render: ({ kycRecord }) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => kycRecord?.id && setDetailId(kycRecord.id)}
            className="text-[11px] font-semibold text-[#0364FF] hover:underline cursor-pointer"
          >
            View
          </button>
          {kycRecord?.status === "pending" && (
            <>
              <Button
                size="sm" variant="ghost"
                className="text-green-600 hover:bg-green-50 hover:text-green-700"
                isLoading={isPending && reviewing === kycRecord?.id}
                onClick={() => {
                  if (!kycRecord?.id) return;
                  setReviewing(kycRecord.id);
                  review(
                    { id: kycRecord.id, payload: { status: "verified" }, orgId: kycRecord.orgId },
                    { onSettled: () => setReviewing(null) }
                  );
                }}
              >
                <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
              </Button>
              <Button
                size="sm" variant="ghost"
                className="text-red-500 hover:bg-red-50 hover:text-red-600"
                onClick={() => {
                  if (kycRecord?.id) {
                    setRejectModal({ id: kycRecord.id, orgId: kycRecord.orgId });
                    setNotes("");
                  }
                }}
              >
                <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable columns={columns} data={data?.records ?? []} isLoading={isLoading} emptyMessage="No organization KYC records." />
      {data?.pagination && <Pagination pagination={data.pagination} onPageChange={setPage} />}

      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-sm mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <p className="text-sm font-bold text-slate-900">Reject KYC</p>
              <button onClick={() => setRejectModal(null)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer">
                <XCircle className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1.5">Decision Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Reason for rejection..."
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#0364FF]/20 focus:border-[#0364FF] resize-none transition-all"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setRejectModal(null)}>Cancel</Button>
                <Button
                  variant="danger"
                  className="flex-1"
                  isLoading={isPending}
                  onClick={() => {
                    setReviewing(rejectModal.id);
                    review(
                      {
                        id: rejectModal.id,
                        payload: { status: "failed", decisionNotes: notes || "Rejected by admin" },
                        orgId: rejectModal.orgId,
                      },
                      { onSettled: () => { setReviewing(null); setRejectModal(null); } }
                    );
                  }}
                >
                  Confirm Reject
                </Button>
              </div>
            </div>
          </div>
        </div>
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
